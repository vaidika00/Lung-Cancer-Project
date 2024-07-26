import os
from flask import Flask, request, jsonify
from tensorflow.keras.preprocessing import image
import numpy as np
from tensorflow.keras.models import load_model
from flask_cors import CORS
from tensorflow.keras.applications.inception_v3 import preprocess_input

app = Flask(__name__)
CORS(app, resources={r"/detect": {"origins": ["http://localhost"]}})

# Define the path to the saved model
model_path = os.path.abspath('detection_model.h5')

# Load the model
try:
    loaded_model = load_model(model_path)
    print("Model loaded successfully.")
except (OSError, ValueError) as e:
    print(f"Error loading the model: {e}")
    loaded_model = None

# Define the class labels
class_labels = ["lung_adenocarcinoma", "lung_non_small_cell", "lung_squamous_cell_carcinoma"]

@app.route('/detect', methods=['POST','GET'])
def predict():
    # Check if the model was loaded successfully
    if loaded_model is None:
        return jsonify({'error': 'Failed to load the model'}), 500

    # Get the image file from the request
    try:
        file = request.files['image']
    except KeyError:
        return jsonify({'error': 'No image file found in the request'}), 400

    # Preprocess the image
    img_width, img_height = 224, 224
    try:
        img = image.load_img(file, target_size=(img_width, img_height))
    except Exception as e:
        print(f"Error loading the image: {e}")
        return jsonify({'error': 'Error loading the image'}), 500

    img_array = image.img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0)
    img_array = preprocess_input(img_array)

    # Make predictions using the loaded model
    try:
        predictions = loaded_model.predict(img_array)
    except Exception as e:
        print(f"Error making predictions: {e}")
        return jsonify({'error': 'Error making predictions'}), 500

    # Get the predicted class
    predicted_class_index = np.argmax(predictions, axis=1)[0]
    predicted_class_label = class_labels[predicted_class_index]

    # Check if the image is cancerous
    threshold = 0.5
    is_cancerous = np.max(predictions) > threshold

    # Prepare the response
    response = {
        'predicted_class': predicted_class_label,
        'is_cancerous': bool(is_cancerous)
    }
    return jsonify(response), 200

if __name__ == '__main__':
    app.run(debug=True, port=5000)
