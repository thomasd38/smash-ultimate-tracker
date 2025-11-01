// ===================================
// Configuration Firebase
// ===================================

// TODO: Remplacez ces valeurs par vos vraies clés Firebase
// Voir le fichier firebase.md pour les instructions détaillées

const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialisation de Firebase
let db;

try {
  // Initialiser Firebase
  firebase.initializeApp(firebaseConfig);
  
  // Initialiser Firestore
  db = firebase.firestore();
  
  console.log('✅ Firebase initialisé avec succès !');
  
  // Mettre à jour le statut de connexion dans l'interface
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateFirebaseStatus);
  } else {
    updateFirebaseStatus();
  }
  
} catch (error) {
  console.error('❌ Erreur lors de l\'initialisation de Firebase:', error);
  
  // Afficher l'erreur dans l'interface
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => showFirebaseError(error));
  } else {
    showFirebaseError(error);
  }
}

// Fonction pour mettre à jour le statut de connexion
function updateFirebaseStatus() {
  const statusElement = document.getElementById('firebase-status');
  if (statusElement) {
    statusElement.className = 'alert alert-success';
    statusElement.innerHTML = '<i class="fas fa-check-circle"></i> Connecté à Firebase avec succès !';
  }
}

// Fonction pour afficher une erreur de connexion
function showFirebaseError(error) {
  const statusElement = document.getElementById('firebase-status');
  if (statusElement) {
    statusElement.className = 'alert alert-danger';
    statusElement.innerHTML = `
      <i class="fas fa-exclamation-triangle"></i> 
      <strong>Erreur de connexion à Firebase :</strong> ${error.message}
      <br><small>Vérifiez votre configuration dans js/firebase-config.js</small>
    `;
  }
}

// Exporter db pour l'utiliser dans d'autres fichiers
window.db = db;

