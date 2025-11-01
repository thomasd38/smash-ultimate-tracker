// ===================================
// Configuration Firebase
// ===================================

// Configuration Firebase - Remplacez par vos vraies clés
// Voir le fichier firebase.md pour les instructions détaillées

const firebaseConfig = {
  apiKey: "AIzaSyAZecgIeAfSCWmbGzMok0K5fr3q5MDLvz0",
  authDomain: "smash-ultimate-tracker-ded33.firebaseapp.com",
  projectId: "smash-ultimate-tracker-ded33",
  storageBucket: "smash-ultimate-tracker-ded33.firebasestorage.app",
  messagingSenderId: "967060921505",
  appId: "1:967060921505:web:532c2ec17c1e368562e4e0"
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

