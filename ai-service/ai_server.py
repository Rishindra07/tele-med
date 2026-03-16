from flask import Flask, request, jsonify
from flask_cors import CORS
from model import model

app = Flask(__name__)
CORS(app)

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        symptoms = data.get("symptoms", [])
        print(symptoms)

        result = model.predict(symptoms)

        return jsonify(result)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)