from flask import Flask, request, jsonify
import requests
from flask_cors import CORS  # Import the CORS module

app = Flask(__name__)
CORS(app)


@app.route('/make-external-request', methods=['POST'])
def make_external_request():
    url = 'http://d74a7591-5954-4aaf-8624-13e38c7f0304.westeurope.azurecontainer.io/score'
    headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer 1ccaKPtU1D9Bk2wKWQLqoVvjQs8fyEjQ'
    }

    # Get the request data from the React application
    data = request.get_json()

    try:
        response = requests.post(url, json=data, headers=headers)
        response_data = response.json()
        return jsonify(response_data)
    except Exception as e:
        print('Error:', str(e))
        return jsonify(error='Internal server error'), 500


if __name__ == '__main__':
    app.run(debug=True)
