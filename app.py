"""Production-aware backend for Box of Emotions.

Provides secure account sessions, durable user state, health checks, and a
transparent rule-based emotion classifier. Passwords are hashed and never
returned to or stored by the browser.
"""

from __future__ import annotations

import hashlib
import json
import math
import os
import re
import secrets
import sqlite3
import time
from collections import defaultdict, deque
from contextlib import contextmanager
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any

from flask import Flask, g, jsonify, make_response, request, send_from_directory
from flask_cors import CORS
from werkzeug.middleware.proxy_fix import ProxyFix
from werkzeug.security import check_password_hash, generate_password_hash

BASE_DIR = Path(__file__).resolve().parent
DATABASE_PATH = Path(os.getenv("BOX_DATABASE_PATH", BASE_DIR / "box_emotions.db"))
SESSION_COOKIE = "box_session"
SESSION_DAYS = int(os.getenv("BOX_SESSION_DAYS", "30"))
MAX_TEXT_LENGTH = 5_000
MAX_STATE_BYTES = 1_000_000
IS_PRODUCTION = os.getenv("BOX_ENV", "development").lower() == "production"
default_origins = "http://127.0.0.1:8000,http://localhost:8000,null"
ALLOWED_ORIGINS = {origin.strip() for origin in os.getenv("ALLOWED_ORIGINS", default_origins).split(",") if origin.strip()}

app = Flask(__name__)
app.config.update(MAX_CONTENT_LENGTH=1_100_000, JSON_SORT_KEYS=False)
app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1, x_host=1)
CORS(app, resources={r"/api/*": {"origins": sorted(ALLOWED_ORIGINS)}}, supports_credentials=True)

SCHEMA_STATEMENTS = [
    """CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE COLLATE NOCASE,
        password_hash TEXT NOT NULL,
        created_at TEXT NOT NULL
    )""",
    """CREATE TABLE IF NOT EXISTS sessions (
        token_hash TEXT PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        expires_at TEXT NOT NULL,
        created_at TEXT NOT NULL
    )""",
    """CREATE TABLE IF NOT EXISTS user_state (
        user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        payload TEXT NOT NULL,
        updated_at TEXT NOT NULL
    )""",
    "CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id)",
    "CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at)",
]

def utc_now() -> datetime:
    return datetime.now(timezone.utc)

def iso_now() -> str:
    return utc_now().isoformat()

def get_db() -> sqlite3.Connection:
    if "db" not in g:
        DATABASE_PATH.parent.mkdir(parents=True, exist_ok=True)
        g.db = sqlite3.connect(DATABASE_PATH)
        g.db.row_factory = sqlite3.Row
        g.db.execute("PRAGMA foreign_keys = ON")
    return g.db

@contextmanager
def standalone_db():
    DATABASE_PATH.parent.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(DATABASE_PATH)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA foreign_keys = ON")
    try:
        yield connection
    finally:
        connection.close()

def init_db() -> None:
    with standalone_db() as db:
        for statement in SCHEMA_STATEMENTS:
            db.execute(statement)
        db.execute("PRAGMA optimize")
        db.commit()

@app.teardown_appcontext
def close_db(_error: BaseException | None = None) -> None:
    db = g.pop("db", None)
    if db is not None:
        db.close()

@app.after_request
def security_headers(response: Any) -> Any:
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
    return response

RATE_BUCKETS: dict[str, deque[float]] = defaultdict(deque)

def rate_limit_key() -> str:
    forwarded = request.headers.get("X-Forwarded-For", "").split(",")[0].strip()
    return forwarded or request.remote_addr or "unknown"

@app.before_request
def protect_api() -> Any:
    if not request.path.startswith("/api/"):
        return None
    origin = request.headers.get("Origin")
    if request.method not in {"GET", "HEAD", "OPTIONS"} and origin and origin not in ALLOWED_ORIGINS:
        return jsonify({"error": "Origin tidak diizinkan"}), 403
    if request.method == "OPTIONS":
        return None
    now = time.monotonic()
    limit = 12 if request.path.startswith("/api/auth/") else 90
    bucket_key = f"{rate_limit_key()}:{request.path.split('/')[2]}"
    bucket = RATE_BUCKETS[bucket_key]
    while bucket and now - bucket[0] > 60:
        bucket.popleft()
    if len(bucket) >= limit:
        return jsonify({"error": "Terlalu banyak permintaan. Coba lagi sebentar."}), 429
    bucket.append(now)
    return None

def empty_state() -> dict[str, Any]:
    return {"version": 1, "notes": [], "favorites": [], "history": [], "viewCounts": {}}

def hash_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()

def create_session(user_id: int) -> str:
    token = secrets.token_urlsafe(32)
    expires = utc_now() + timedelta(days=SESSION_DAYS)
    db = get_db()
    db.execute("DELETE FROM sessions WHERE expires_at <= ?", (iso_now(),))
    db.execute(
        "INSERT INTO sessions(token_hash, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)",
        (hash_token(token), user_id, expires.isoformat(), iso_now()),
    )
    db.commit()
    return token

def current_user() -> sqlite3.Row | None:
    token = request.cookies.get(SESSION_COOKIE, "")
    if not token:
        return None
    return get_db().execute(
        """SELECT users.id, users.username FROM sessions
        JOIN users ON users.id = sessions.user_id
        WHERE sessions.token_hash = ? AND sessions.expires_at > ?""",
        (hash_token(token), iso_now()),
    ).fetchone()

def authenticated_user() -> tuple[sqlite3.Row | None, Any | None]:
    user = current_user()
    if user is None:
        return None, (jsonify({"error": "Silakan masuk terlebih dahulu"}), 401)
    return user, None

def attach_session_cookie(response: Any, token: str) -> Any:
    response.set_cookie(
        SESSION_COOKIE, token, max_age=SESSION_DAYS * 86400, httponly=True,
        secure=IS_PRODUCTION, samesite="Lax", path="/",
    )
    return response

USERNAME_RE = re.compile(r"^[\w .'-]{2,40}$", re.UNICODE)

@app.post("/api/auth/register")
def register() -> Any:
    data = request.get_json(silent=True) or {}
    username = " ".join(str(data.get("username") or "").split())
    password = str(data.get("password") or "")
    if not USERNAME_RE.fullmatch(username):
        return jsonify({"error": "Nama harus 2–40 karakter dan tidak memuat simbol khusus."}), 400
    if len(password) < 8 or len(password) > 128:
        return jsonify({"error": "Kata sandi harus terdiri dari 8–128 karakter."}), 400
    db = get_db()
    try:
        cursor = db.execute(
            "INSERT INTO users(username, password_hash, created_at) VALUES (?, ?, ?)",
            (username, generate_password_hash(password), iso_now()),
        )
        db.execute(
            "INSERT INTO user_state(user_id, payload, updated_at) VALUES (?, ?, ?)",
            (cursor.lastrowid, json.dumps(empty_state()), iso_now()),
        )
        db.commit()
    except sqlite3.IntegrityError:
        return jsonify({"error": "Nama tersebut sudah digunakan."}), 409
    token = create_session(int(cursor.lastrowid))
    return attach_session_cookie(make_response(jsonify({"user": {"username": username}}), 201), token)

@app.post("/api/auth/login")
def login() -> Any:
    data = request.get_json(silent=True) or {}
    username = str(data.get("username") or "").strip()
    password = str(data.get("password") or "")
    user = get_db().execute(
        "SELECT id, username, password_hash FROM users WHERE username = ? COLLATE NOCASE", (username,)
    ).fetchone()
    if user is None or not check_password_hash(user["password_hash"], password):
        return jsonify({"error": "Nama atau kata sandi tidak cocok."}), 401
    token = create_session(int(user["id"]))
    return attach_session_cookie(make_response(jsonify({"user": {"username": user["username"]}})), token)

@app.get("/api/auth/session")
def session_status() -> Any:
    user = current_user()
    return jsonify({"authenticated": user is not None, "user": {"username": user["username"]} if user else None})

@app.post("/api/auth/logout")
def logout_api() -> Any:
    token = request.cookies.get(SESSION_COOKIE, "")
    if token:
        db = get_db()
        db.execute("DELETE FROM sessions WHERE token_hash = ?", (hash_token(token),))
        db.commit()
    response = make_response(jsonify({"ok": True}))
    response.delete_cookie(SESSION_COOKIE, path="/")
    return response

def sanitize_state(payload: Any) -> dict[str, Any]:
    if not isinstance(payload, dict):
        raise ValueError("Format data tidak valid")
    notes = []
    for note in payload.get("notes", [])[:500]:
        if not isinstance(note, dict):
            continue
        text = str(note.get("text") or "").strip()[:10_000]
        if text:
            notes.append({
                "id": int(note.get("id") or 0), "text": text,
                "date": str(note.get("date") or "")[:120], "tag": str(note.get("tag") or "")[:40],
                "updatedAt": int(note.get("updatedAt") or note.get("id") or 0),
            })
    favorites = [str(value)[:120] for value in payload.get("favorites", [])[:200]]
    history = [
        {"id": str(entry["id"])[:120], "viewedAt": int(entry.get("viewedAt") or 0)}
        for entry in payload.get("history", [])[:100]
        if isinstance(entry, dict) and entry.get("id")
    ]
    view_counts = {
        str(key)[:120]: max(0, min(int(value), 1_000_000))
        for key, value in list((payload.get("viewCounts") or {}).items())[:500]
    }
    return {"version": 1, "notes": notes, "favorites": favorites, "history": history, "viewCounts": view_counts}

@app.get("/api/state")
def get_state() -> Any:
    user, error = authenticated_user()
    if error:
        return error
    row = get_db().execute("SELECT payload FROM user_state WHERE user_id = ?", (user["id"],)).fetchone()
    return jsonify(json.loads(row["payload"]) if row else empty_state())

@app.put("/api/state")
def put_state() -> Any:
    user, error = authenticated_user()
    if error:
        return error
    if len(request.get_data(cache=True)) > MAX_STATE_BYTES:
        return jsonify({"error": "Data terlalu besar"}), 413
    try:
        state = sanitize_state(request.get_json(silent=False))
    except (ValueError, TypeError, json.JSONDecodeError):
        return jsonify({"error": "Format data tidak valid"}), 400
    get_db().execute(
        """INSERT INTO user_state(user_id, payload, updated_at) VALUES (?, ?, ?)
        ON CONFLICT(user_id) DO UPDATE SET payload = excluded.payload, updated_at = excluded.updated_at""",
        (user["id"], json.dumps(state, ensure_ascii=False), iso_now()),
    )
    get_db().commit()
    return jsonify({"ok": True})

EMOTION_KEYWORDS: dict[str, list[str]] = {
    "Emptiness": ["hampa", "kosong", "mati rasa", "tak bermakna", "numb", "empty", "meaningless"],
    "Heartache": ["sedih", "kecewa", "menangis", "galau", "patah hati", "berduka", "hurt", "sad", "grief"],
    "Bitterness": ["dendam", "getir", "sinis", "iri", "cemburu", "resentful", "jealous", "bitter"],
    "Heat": ["kesal", "bete", "marah", "murka", "jengkel", "frustrasi", "angry", "furious", "annoyed"],
    "Possibility": ["penasaran", "berharap", "optimis", "semangat", "mungkin bisa", "curious", "hopeful", "optimistic"],
    "Zen": ["tenang", "damai", "rileks", "santai", "lega", "tenteram", "calm", "relaxed", "peaceful"],
    "Bliss": ["bahagia", "gembira", "sukacita", "takjub", "euforia", "happy", "delighted", "blissful"],
    "Loathing": ["jijik", "muak", "benci", "enggan", "risih", "disgusted", "repulsed", "loathe"],
    "Enjoyment": ["senang", "seru", "menikmati", "nyaman", "puas", "lucu", "fun", "enjoy", "amused"],
    "Ego": ["bangga", "hebat", "sukses", "percaya diri", "lebih unggul", "proud", "confident", "superior"],
    "Angst": ["cemas", "takut", "khawatir", "gelisah", "panik", "gugup", "overthinking", "anxious", "afraid", "worried"],
}
DEFAULT_EMOTION = "Enjoyment"
NEGATIONS = {"tidak", "tak", "bukan", "belum", "gak", "nggak", "enggak", "no", "not", "never", "without"}
INTENSIFIERS = {"sangat", "banget", "sekali", "amat", "really", "very", "extremely"}
CRISIS_KEYWORDS = ["bunuh diri", "ingin mati", "mau mati", "akhiri hidup", "menyakiti diri", "self harm", "suicide", "kill myself", "end my life", "want to die"]

def contains_keyword(text: str, keyword: str) -> bool:
    return re.search(rf"(?<!\w){re.escape(keyword)}(?!\w)", text, flags=re.IGNORECASE) is not None

def contains_crisis_language(text: str) -> bool:
    return any(contains_keyword(text, keyword) for keyword in CRISIS_KEYWORDS)

def keyword_score(text: str, keyword: str) -> float:
    score = 0.0
    for match in re.finditer(rf"(?<!\w){re.escape(keyword)}(?!\w)", text, flags=re.IGNORECASE):
        prefix_words = re.findall(r"[\w'-]+", text[max(0, match.start() - 45):match.start()].lower())[-3:]
        if any(word in NEGATIONS for word in prefix_words):
            continue
        base = 2.0 if " " in keyword else 1.0
        if any(word in INTENSIFIERS for word in prefix_words[-2:]):
            base *= 1.35
        score += base
    return score

def analyze_emotion_text(text: str) -> dict[str, Any]:
    scores = {category: sum(keyword_score(text, keyword) for keyword in keywords) for category, keywords in EMOTION_KEYWORDS.items()}
    ranked = sorted(((category, score) for category, score in scores.items() if score > 0), key=lambda item: item[1], reverse=True)
    if not ranked:
        return {"detected_emotion": DEFAULT_EMOTION, "confidence": 0.25, "candidates": [], "unclear": True}
    exponentials = [math.exp(min(score, 8.0)) for _category, score in ranked[:3]]
    total = sum(exponentials)
    candidates = [
        {"emotion": category, "confidence": round(weight / total, 3)}
        for (category, _score), weight in zip(ranked[:3], exponentials)
    ]
    margin = candidates[0]["confidence"] - (candidates[1]["confidence"] if len(candidates) > 1 else 0)
    unclear = candidates[0]["confidence"] < 0.52 or (len(candidates) > 1 and margin < 0.18)
    return {"detected_emotion": candidates[0]["emotion"], "confidence": candidates[0]["confidence"], "candidates": candidates, "unclear": unclear}

FOLLOW_UP = {
    "id": "Emosi mana yang paling kuat: sedih, marah, takut, hampa, atau justru lega?",
    "en": "Which feeling is strongest: sadness, anger, fear, emptiness, or perhaps relief?",
    "zh": "哪一种感受最强烈：悲伤、愤怒、恐惧、空虚，还是释然？",
}
CRISIS_MESSAGES = {
    "id": "Jika kamu berada dalam bahaya segera, hubungi layanan darurat setempat atau orang tepercaya sekarang. Untuk dukungan lanjutan, hubungi tenaga kesehatan mental profesional.",
    "en": "If you are in immediate danger, contact local emergency services or a trusted person now. For ongoing support, contact a qualified mental-health professional.",
    "zh": "如果你正处于紧急危险中，请立即联系当地急救服务或你信任的人。如需持续支持，请联系合格的心理健康专业人员。",
}

@app.post("/api/analyze")
def analyze() -> Any:
    data = request.get_json(silent=True) or {}
    user_text = str(data.get("text") or "").strip()
    language = str(data.get("language") or "id")
    language = language if language in FOLLOW_UP else "id"
    if not user_text:
        return jsonify({"error": "Teks tidak boleh kosong"}), 400
    if len(user_text) > MAX_TEXT_LENGTH:
        return jsonify({"error": f"Teks maksimal {MAX_TEXT_LENGTH} karakter"}), 413
    if contains_crisis_language(user_text):
        return jsonify({"input_text": user_text, "crisis": True, "message": CRISIS_MESSAGES[language]})
    result = analyze_emotion_text(user_text)
    return jsonify({"input_text": user_text, "crisis": False, **result, "follow_up": FOLLOW_UP[language] if result["unclear"] else None})

@app.get("/api/health")
def health() -> Any:
    return jsonify({"status": "ok", "environment": "production" if IS_PRODUCTION else "development"})

@app.get("/")
def frontend() -> Any:
    return send_from_directory(BASE_DIR, "index.html")

@app.get("/<path:filename>")
def frontend_asset(filename: str) -> Any:
    allowed = {
        "styles.css", "full-essays.js", "emotions.js", "app.js", "manifest.webmanifest", "service-worker.js",
        "icons/icon-192.png", "icons/icon-512.png",
    }
    if filename not in allowed:
        return jsonify({"error": "Not found"}), 404
    return send_from_directory(BASE_DIR, filename)

@app.errorhandler(413)
def too_large(_error: BaseException) -> Any:
    return jsonify({"error": "Permintaan terlalu besar"}), 413

init_db()

if __name__ == "__main__":
    app.run(host=os.getenv("HOST", "127.0.0.1"), port=int(os.getenv("PORT", "5000")), debug=os.getenv("FLASK_DEBUG") == "1" and not IS_PRODUCTION)
