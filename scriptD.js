document.addEventListener('DOMContentLoaded', () => {
  const fileInput = document.getElementById('file-input');
  const form = document.getElementById('myform');

  form.addEventListener('submit', async (event) => {
      event.preventDefault();

      const file = fileInput.files[0];

      if (!file) {
          displayError('No file selected');
          return;
      }

      const formData = new FormData();
      formData.append('image', file);

      try {
          const response = await fetch('http://localhost:5000/detect', {
              method: 'POST',
              body: formData
          });

          if (response.ok) {
              const data = await response.json();
              displayResults(data);
          } else {
              const errorData = await response.json();
              displayError(errorData.error);
          }
      } catch (error) {
          displayError('An error occurred while communicating with the server.');
          console.error('Error:', error);
      }
  });

  function displayResults(data) {
      const resultDisplay = document.getElementById('result-display');
      resultDisplay.innerHTML = `
          <p>Is Cancerous: ${data.is_cancerous}</p>
          <p>Predicted Class: ${data.predicted_class}</p>
      `;
  }

  function displayError(errorMessage) {
      const resultDisplay = document.getElementById('result-display');
      resultDisplay.innerHTML = `
          <p style="color: red;">${errorMessage}</p>
      `;
  }
});
