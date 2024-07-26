from flask import Flask, request, jsonify
import pickle
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.neighbors import NearestNeighbors
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Load the model, vectorizer, and dataset from the pickle files
with open('model.pkl', 'rb') as f:
    model = pickle.load(f)

with open('vectorizer.pkl', 'rb') as f:
    vectorizer = pickle.load(f)

with open('dataset.pkl', 'rb') as f:
    df = pickle.load(f)

@app.route('/predict', methods=['POST'])
def predict():
    # Check if the request content type is application/json
    if request.headers.get('Content-Type') != 'application/json':
        return jsonify({'error': 'Unsupported Media Type'}), 415

    # Get the input data from the request
    try:
        input_data = request.get_json()
    except:
        return jsonify({'error': 'Invalid JSON data'}), 400

    # Extract the input Allopathy Drug Name
    input_allopathy_drug = input_data['allopathy_drug']

    # Find the input description in the dataset
    input_description = df[df['Allopathy Drug Name'] == input_allopathy_drug]['Allopathy Drug Name'].values[0]

    # Transform the input description using the vectorizer
    X_input = vectorizer.transform([input_description])

    # Find the nearest neighbor
    neighbor_index = model.kneighbors(X_input, return_distance=False)[0][0]

    # Get the corresponding information from the dataset
    indian_drug_name = df.iloc[neighbor_index]['Indian Drug Name']
    cancer_stage = df.iloc[neighbor_index]['Stage']
    description = df.iloc[neighbor_index]['Description']

    # Prepare the response
    response = {
        'input_allopathy_drug': input_allopathy_drug,
        'predicted_indian_drug': indian_drug_name,
        'cancer_stage': cancer_stage,
        'description': description
    }

    return jsonify(response)

if __name__ == '__main__':
    app.run(debug=True)