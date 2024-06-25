document.getElementById("configForm").addEventListener("submit", async function(event) {
    event.preventDefault();
  
    const firebaseConfig = document.getElementById("firebaseConfig").value;
    const activityName = document.getElementById("activityName").value;
    const fieldCount = parseInt(document.getElementById("fieldCount").value);
    const fieldsContainer = document.getElementById("fieldsContainer");
    const fieldNames = Array.from(fieldsContainer.getElementsByTagName('input')).map(input => input.value);
    const appDescription = document.getElementById("appDescription").value;
    const openaiApiKey = document.getElementById("openaiApiKey").value.trim(); // Utiliza la API key proporcionada por el usuario
  
    // Validación de la API Key
    if (!openaiApiKey) {
      alert("Por favor, ingresa tu API Key de OpenAI.");
      return;
    }
  
    // Lógica para generar el código HTML
    const outputHTML = await generateHTML(firebaseConfig, activityName, fieldNames, appDescription, openaiApiKey);
    document.getElementById("outputHTML").value = outputHTML;
  
    alert("Código generado con éxito.");
  });
  
  document.getElementById("fieldCount").addEventListener("input", function() {
    const fieldCount = parseInt(this.value);
    const fieldsContainer = document.getElementById("fieldsContainer");
    fieldsContainer.innerHTML = '';
  
    for (let i = 0; i < fieldCount; i++) {
      const input = document.createElement('input');
      input.type = 'text';
      input.placeholder = `Nombre del campo ${i + 1}`;
      input.required = true;
      fieldsContainer.appendChild(input);
    }
  });
  
  async function generateHTML(firebaseConfig, activityName, fieldNames, appDescription, openaiApiKey) {
    const prompt = `
      Genera el código HTML, CSS y JavaScript para una aplicación web que utiliza Firebase para ${activityName}.
      La configuración de Firebase es la siguiente:
      ${firebaseConfig}
      El formulario debe contener los siguientes campos: ${fieldNames.join(', ')}.
      Descripción de la funcionalidad y elementos de la app:
      ${appDescription}
  
      El código HTML debe estar en una estructura separada en tres archivos: index.html, styles.css y script.js.
    `;
  
    const response = await callOpenAIAPI(prompt, openaiApiKey);
    return response.choices[0].text.trim();
  }
  
  async function callOpenAIAPI(prompt, apiKey) {
    const response = await fetch('https://api.openai.com/v1/engines/text-davinci-003/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        prompt: prompt,
        max_tokens: 2000
      })
    });
    return await response.json();
  }
  