from flask import Flask, jsonify, request
from recommend import main_logic
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__)

API_SECRET = os.getenv("API_SECRET")

def check_auth():
    secret = request.headers.get("x-api-secret")
    return secret == API_SECRET

@app.route("/recommend", methods=["GET"])
def recommend():
    if not check_auth():
        return jsonify({"error": "Unauthorized"}), 401

    user_id = request.args.get("user_id", type=int)
    if not user_id:
        return jsonify({"error": "Missing user_id"}), 400

    try:
        result = main_logic(user_id)
        return jsonify(result)
    except Exception as e:
        print(f"Error generating recommendations: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    app.run(host="0.0.0.0", port=port)
