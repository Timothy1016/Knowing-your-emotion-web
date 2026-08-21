"""
Box of Emotion — Backend API

Endpoint sederhana untuk mendeteksi emosi dari teks bebas berdasarkan
pencocokan kata kunci (keyword matching). Dipanggil oleh fitur "Curhat
Dulu, Yuk" di index.html — jalankan server ini (`python app.py`) SEBELUM
membuka index.html di browser, kalau tidak fitur analisisnya akan
menampilkan pesan "server belum jalan".
"""

from __future__ import annotations

from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Izinkan frontend (file HTML / domain lain) mengakses API ini

# Kata kunci per kategori emosi. Silakan tambah sinonim baru di sini kapan saja.
EMOTION_KEYWORDS: dict[str, list[str]] = {
    "Heat": ["kesel", "marah", "benci", "kesal", "bete", "anjir", "emosi", "angry"],
    "Bliss": ["senang", "bahagia", "gembira", "seru", "puas", "happy", "excited"],
    "Heartache": ["sedih", "kecewa", "nangis", "galau", "sakit", "hurt", "sad"],
    "Zen": ["tenang", "damai", "rileks", "santai", "calm", "relax"],
    "Possibility": ["penasaran", "berharap", "optimis", "semangat", "hope"],
    "Ego": ["bangga", "hebat", "sukses", "percaya diri", "proud"],
}

DEFAULT_EMOTION = "Enjoyment"


def analyze_emotion_text(text: str) -> str:
    """Cari kategori emosi pertama yang cocok dengan kata kunci di dalam teks.

    Pencarian bersifat case-insensitive dan berhenti pada kecocokan
    pertama yang ditemukan (urutan mengikuti EMOTION_KEYWORDS).
    """
    text_lower = text.lower()
    for category, keywords in EMOTION_KEYWORDS.items():
        if any(keyword in text_lower for keyword in keywords):
            return category
    return DEFAULT_EMOTION


@app.route("/api/analyze", methods=["POST"])
def analyze():
    """Terima { "text": "..." } dan kembalikan kategori emosi yang terdeteksi."""
    data = request.get_json(silent=True) or {}
    user_text = (data.get("text") or "").strip()

    if not user_text:
        return jsonify({"error": "Teks tidak boleh kosong"}), 400

    detected_emotion = analyze_emotion_text(user_text)

    return jsonify(
        {
            "input_text": user_text,
            "detected_emotion": detected_emotion,
            "message": (
                f"Berdasarkan cerita kamu, sepertinya kamu merasakan emosi "
                f"yang masuk dalam kategori: {detected_emotion}"
            ),
        }
    )


@app.route("/api/health", methods=["GET"])
def health():
    """Endpoint kecil untuk memastikan server hidup (berguna saat testing)."""
    return jsonify({"status": "ok"})


if __name__ == "__main__":
    app.run(debug=True, port=5000)

# ---------------------------------------------------------------------------
# Fitur "Curhat Dulu, Yuk" di index.html sudah otomatis memanggil:
#
#   fetch("http://127.0.0.1:5000/api/analyze", {
#       method: "POST",
#       headers: { "Content-Type": "application/json" },
#       body: JSON.stringify({ text: userInput })
#   })
#
# Cukup jalankan `python app.py` (server aktif di port 5000) lalu buka
# index.html di browser — CORS sudah diaktifkan jadi request dari file
# HTML manapun akan diterima. Kalau kamu deploy backend ke alamat lain,
# ubah konstanta BACKEND_URL di dalam <script> index.html.
# ---------------------------------------------------------------------------