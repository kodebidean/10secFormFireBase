document.getElementById("configForm").addEventListener("submit", function(event) {
    event.preventDefault();
  
    const firebaseConfig = document.getElementById("firebaseConfig").value;
    const activityName = document.getElementById("activityName").value;
    const fieldCount = parseInt(document.getElementById("fieldCount").value);
    const fieldsContainer = document.getElementById("fieldsContainer");
    const fieldNames = Array.from(fieldsContainer.getElementsByTagName('input')).map(input => input.value);
  
    const outputHTML = generateHTML(firebaseConfig, activityName, fieldNames);
    document.getElementById("outputHTML").value = outputHTML;
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
  
  function generateHTML(firebaseConfig, activityName, fieldNames) {
    const firebaseConfigString = firebaseConfig.split('\n').join('\n      ');
  
    const formFields = fieldNames.map(fieldName => 
      `<input type="text" id="${fieldName}" placeholder="${fieldName}" required>`).join('\n    ');
  
    const addFieldAssignments = fieldNames.map(fieldName => 
      `${fieldName}: document.getElementById("${fieldName}").value`).join(', ');
  
    const displayFields = fieldNames.map(fieldName => 
      `<span>\${item.${fieldName}}</span>`).join(' ');
  
    return `<!DOCTYPE html>
  <html>
  <head>
    <title>${activityName}</title>
    <link rel="stylesheet" type="text/css" href="styles.css">
    <!-- Import Firebase libraries from CDN -->
    <script src="https://www.gstatic.com/firebasejs/9.10.0/firebase-app-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.10.0/firebase-firestore-compat.js"></script>
  </head>
  <body>
    <h1>${activityName}</h1>
    <form id="itemForm">
      ${formFields}
      <button type="submit">Añadir ${activityName}</button>
    </form>
  
    <div id="itemsContainer"></div>
  
    <script>
      // Configuración de Firebase
      const firebaseConfig = {
        ${firebaseConfigString}
      };
  
      // Inicializar Firebase
      firebase.initializeApp(firebaseConfig);
      const db = firebase.firestore();
  
      // Función para añadir item
      function addItem(${fieldNames.join(', ')}) {
        db.collection("${activityName.toLowerCase()}").add({
          ${addFieldAssignments}
        })
        .then((docRef) => {
          console.log("Document written with ID: ", docRef.id);
          getItems();  // Actualizar lista de items
        })
        .catch((error) => {
          console.error("Error adding document: ", error);
        });
      }
  
      // Función para obtener y mostrar items
      function getItems() {
        db.collection("${activityName.toLowerCase()}").get().then((querySnapshot) => {
          const itemsContainer = document.getElementById("itemsContainer");
          itemsContainer.innerHTML = "";
          querySnapshot.forEach((doc) => {
            const item = doc.data();
            const itemDiv = document.createElement("div");
            itemDiv.className = "item";
            itemDiv.innerHTML = \`
              ${displayFields}
              <div>
                <button onclick="deleteItem('\${doc.id}')">Eliminar</button>
              </div>
            \`;
            itemsContainer.appendChild(itemDiv);
          });
        });
      }
  
      // Función para eliminar item
      function deleteItem(id) {
        db.collection("${activityName.toLowerCase()}").doc(id).delete().then(() => {
          console.log("Document successfully deleted!");
          getItems();  // Actualizar lista de items
        }).catch((error) => {
          console.error("Error removing document: ", error);
        });
      }
  
      // Manejar el envío del formulario
      document.getElementById("itemForm").addEventListener("submit", function(event) {
        event.preventDefault();
        ${fieldNames.map(fieldName => `let ${fieldName} = document.getElementById("${fieldName}").value;`).join('\n      ')}
        if(${fieldNames.map(fieldName => fieldName).join(' && ')}) {
          addItem(${fieldNames.join(', ')});
        } else {
          alert("Todos los campos son obligatorios.");
        }
      });
  
      // Obtener y mostrar items al cargar la página
      window.onload = getItems;
    </script>
  </body>
  </html>`;
  }
  