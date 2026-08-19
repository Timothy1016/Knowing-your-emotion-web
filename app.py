from flask import Flask, jsonify, request
from flask_cors import CORS  # <-- Tambahkan ini

app = Flask(__name__)
CORS(app)  # <-- Tambahkan ini agar web bisa mengakses server Flask

EMOTION_KEYWORDS = {
    "Heat": ["kesel", "marah", "benci", "kesal", "bete", "anjir", "emosi", "angry"],
    "Bliss": ["senang", "bahagia", "gembira", "seru", "puas", "happy", "excited"],
    "Heartache": ["sedih", "kecewa", "nangis", "galau", "sakit", "hurt", "sad"],
    "Zen": ["tenang", "damai", "rileks", "santai", "calm", "relax"],
    "Possibility": ["penasaran", "berharap", "optimis", "semangat", "hope"],
    "Ego": ["bangga", "hebat", "sukses", "percaya diri", "proud"],
}


def analyze_emotion_text(text):
  text_lower = text.lower()
  for category, keywords in EMOTION_KEYWORDS.items():
    for kw in keywords:
      if kw in text_lower:
        return category
  return "Enjoyment"


@app.route("/api/analyze", methods=["POST"])
def analyze():
  data = request.get_json()
  user_text = data.get("text", "")

  if not user_text:
    return jsonify({"error": "Teks tidak boleh kosong"}), 400

  detected_emotion = analyze_emotion_text(user_text)

  return jsonify(
      {
          "input_text": user_text,
          "detected_emotion": detected_emotion,
          "message": (
              f"Berdasarkan cerita kamu, sepertinya kamu merasakan emosi"
              f" yang masuk dalam kategori: {detected_emotion}"
          ),
      }
  )


if __name__ == "__main__":
  app.run(debug=True, port=5000)