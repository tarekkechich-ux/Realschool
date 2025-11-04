const express = require('express');
const app = express();

app.use(express.json({ limit: '10mb' }));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*'); // autorise tout domaine
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next(); 
});

// Fonction récursive qui copie `r` dans `n` dans chaque sous-objet
function copierRversN(obj) 
{
  if (Array.isArray(obj)) {
    obj.forEach(copierRversN);
  } else if (typeof obj === 'object' && obj !== null) {
    if ('r' in obj && typeof obj.r === 'string') {
      obj.n = obj.r;
    }
    for (let key in obj) {
      copierRversN(obj[key]);
    }
  }
}

// Route de traitement POST
app.post('/process', (req, res) => {
  const input = req.body.content;

  try {
    // Évaluer la chaîne reçue (ex: '[ {...}, {...} ]') pour obtenir un tableau JavaScript
   let tableau = eval('(' + input + ')');

    // Appliquer la modification
   copierRversN(tableau);

    // Reformater le tableau modifié en chaîne JS propre
    const output = JSON.stringify(tableau, null, 2) .replace(/"(\w+)"\s*:/g, '$1:'); // indente pour plus de lisibilité

    res.set('Content-Type', 'application/json');
    res.send(output);
  } catch (e) {
    res.status(400).send('Erreur de traitement : ' + e.message);
  }
});

// Route GET simple de test
app.get('/', (req, res) => {
  res.send('API prête à traiter un tableau JS envoyé en JSON: port écoute 8000 ok');
});

const port = process.env.PORT || 8000;
app.listen(port, () => 
{
  console.log("Serveur Node.js actif sur le port " + port);
});
