// recommendation.js

async function getRecommendation(event) {
    event.preventDefault();

    try {
      const inputField = document.getElementById('allopathy-drug');
      const inputData = {
        allopathy_drug: inputField.value
      };

      const response = await fetch('http://localhost:5000/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(inputData)
      });

      if (response.ok) {
        const data = await response.json();
        const resultDiv = document.getElementById('result');
        resultDiv.innerHTML = ` 
          <h2>Recommendation</h2>
          <p>Input Allopathy Drug: ${data.input_allopathy_drug}</p>
          <p>Predicted Indian Drug: ${data.predicted_indian_drug}</p>
          <p>Cancer Stage: ${data.cancer_stage}</p>
          <p>Description: ${data.description}</p>
        `;
      } else {
        throw new Error('No Drug Available.');
      }
    } catch (error) {
      console.error('Error: No Drug Available.', error);
      const resultDiv = document.getElementById('result');
      resultDiv.innerHTML = '<p>Error: No Drug Available.</p>';
    }
  }