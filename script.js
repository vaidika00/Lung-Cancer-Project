
// script.js

{/* <script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@3.9.0/dist/tf.min.js"></script> */}

let fileInput = document.getElementById("file-input");
let imageContainer = document.getElementById("images");
let numOfFiles = document.getElementById("num-of-files");
let resultDisplay = document.getElementById("result-display");

let model;

function preview() {
    imageContainer.innerHTML = "";
    numOfFiles.textContent = `${fileInput.files.length} Files Selected`;

    for (let i of fileInput.files) {
        let reader = new FileReader();
        let figure = document.createElement("figure");
        let figCap = document.createElement("figcaption");
        figCap.innerText = i.name;
        figure.appendChild(figCap);
        reader.onload = async () => {
            let img = document.createElement("img");
            img.setAttribute("src", reader.result);
            figure.insertBefore(img, figCap);
        };
        imageContainer.appendChild(figure);
        reader.readAsDataURL(i);
    }
}

async function predictImage() {
  const fileInput = document.getElementById('file-input');
  const file = fileInput.files[0];
  await tf.ready();

  if (!file) {
    console.error('Please select an image file to predict.');
    return; // Early exit if no file is selected
  }

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  // Create an ImageData object from the File
  const imageData = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        context.drawImage(img, 0, 0);
        const imageData = context.getImageData(0, 0, img.width, img.height);
        resolve(imageData);
      };
      img.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  // Convert image to base64 for sending to the backend
  const imageBase64 = await tf.browser.toPixels(tf.browser.fromPixels(imageData));

  const data = {imageBase64}

  try {
    const response = await fetch('http://127.0.0.1:5001/predict', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      throw new Error('Failed to get prediction from backend');
    }

    const result = await response.json();
    displayResult(result); // Display the result on the webpage
  } catch (error) {
    console.error('Error sending data to backend:', error);
  }
}

function displayResult(result) {
  const resultDisplay = document.getElementById('result-display');
  resultDisplay.innerHTML = `
    <p>Prediction: ${result.prediction}</p>
    <p>Probability: ${result.probability}</p>
  `;
}

// Get the form and result display elements
const form = document.getElementById('myform');

// Handle the form submission
form.addEventListener('submit', async (event) => {
  event.preventDefault();
  await predictImage();
});
