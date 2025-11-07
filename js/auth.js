// ===================================
// Système d'authentification
// ===================================

// Hash SHA256 des mots de passe autorisés
const AUTH_LEVELS = {
  ADMIN: {
    hash: 'a26ae7f52a53796c9e1a20f8fbdeb9d845766cc7ab94ec55deb3b64f84df6158',
    level: 'admin',
    name: 'Administrateur'
  },
  USER: {
    hash: '78455def594711341523a6fd39f21d0192b346f599ce655b8851795742256846',
    level: 'user',
    name: 'Utilisateur'
  }
};

// Clé pour le localStorage
const AUTH_STORAGE_KEY = 'smash_tracker_auth';

// ===================================
// Fonctions utilitaires
// ===================================

// Hasher un mot de passe en SHA256
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

// Vérifier si un hash correspond à un niveau d'accès
function getAuthLevel(hash) {
  if (hash === AUTH_LEVELS.ADMIN.hash) {
    return AUTH_LEVELS.ADMIN;
  }
  if (hash === AUTH_LEVELS.USER.hash) {
    return AUTH_LEVELS.USER;
  }
  return null;
}

// Sauvegarder l'authentification dans le localStorage
function saveAuth(hash) {
  localStorage.setItem(AUTH_STORAGE_KEY, hash);
}

// Récupérer l'authentification depuis le localStorage
function getStoredAuth() {
  return localStorage.getItem(AUTH_STORAGE_KEY);
}

// Supprimer l'authentification du localStorage
function clearAuth() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

// Obtenir le niveau d'accès actuel
function getCurrentAuthLevel() {
  const storedHash = getStoredAuth();
  if (!storedHash) return null;
  return getAuthLevel(storedHash);
}

// Vérifier si l'utilisateur est admin
function isAdmin() {
  const authLevel = getCurrentAuthLevel();
  return authLevel && authLevel.level === 'admin';
}

// Vérifier si l'utilisateur est connecté (admin ou user)
function isAuthenticated() {
  return getCurrentAuthLevel() !== null;
}

// ===================================
// Gestion de l'interface
// ===================================

// Afficher/masquer les éléments selon le niveau d'accès
function updateUIForAuthLevel() {
  const authLevel = getCurrentAuthLevel();
  
  if (!authLevel) {
    // Non connecté - tout masquer sauf le bouton de connexion
    hideAllContent();
    showLoginButton();
    return;
  }
  
  // Connecté - afficher le contenu selon le niveau
  showLoginButton(); // Toujours afficher pour permettre de changer de compte
  
  if (authLevel.level === 'admin') {
    // Admin : tout afficher
    showAdminContent();
    showUserContent();
  } else if (authLevel.level === 'user') {
    // User : seulement la visualisation
    hideAdminContent();
    showUserContent();
  }
  
  // Afficher le niveau d'accès actuel
  displayAuthStatus(authLevel);
}

// Masquer tout le contenu
function hideAllContent() {
  // Masquer la section de gestion de la BDD
  const dbManagement = document.querySelector('.card.border-warning');
  if (dbManagement) {
    dbManagement.style.display = 'none';
  }

  // Masquer le bouton "Nouvelle session"
  const btnNewSession = document.getElementById('btn-new-session');
  if (btnNewSession) {
    btnNewSession.style.display = 'none';
  }

  // Masquer le bouton "Modifier session" (page session.html)
  const btnEditSession = document.getElementById('btn-edit-session');
  if (btnEditSession) {
    btnEditSession.style.display = 'none';
  }

  // Masquer le bouton "Ajouter un match" (page session.html)
  const btnAddMatch = document.getElementById('btn-add-match');
  if (btnAddMatch) {
    btnAddMatch.style.display = 'none';
  }

  // Masquer la section de test Firebase
  const testSection = document.querySelector('.card .card-header.bg-dark');
  if (testSection && testSection.closest('.card')) {
    testSection.closest('.card').style.display = 'none';
  }

  // Masquer le lien Administration
  const navAdmin = document.getElementById('nav-admin');
  if (navAdmin) {
    navAdmin.style.display = 'none';
  }

  // Masquer le lien Joueurs
  const navPlayers = document.getElementById('nav-players');
  if (navPlayers) {
    navPlayers.style.display = 'none';
  }
}

// Afficher le contenu admin
function showAdminContent() {
  // Afficher la section de gestion de la BDD
  const dbManagement = document.querySelector('.card.border-warning');
  if (dbManagement) {
    dbManagement.style.display = 'block';
  }

  // Afficher le bouton "Nouvelle session"
  const btnNewSession = document.getElementById('btn-new-session');
  if (btnNewSession) {
    btnNewSession.style.display = 'inline-block';
  }

  // Afficher le bouton "Modifier session" (page session.html)
  const btnEditSession = document.getElementById('btn-edit-session');
  if (btnEditSession) {
    btnEditSession.style.display = 'inline-block';
  }

  // Afficher le bouton "Ajouter un match" (page session.html)
  const btnAddMatch = document.getElementById('btn-add-match');
  if (btnAddMatch) {
    btnAddMatch.style.display = 'inline-block';
  }

  // Afficher la section de test Firebase
  const testSection = document.querySelector('.card .card-header.bg-dark');
  if (testSection && testSection.closest('.card')) {
    testSection.closest('.card').style.display = 'block';
  }

  // Afficher le lien Administration
  const navAdmin = document.getElementById('nav-admin');
  if (navAdmin) {
    navAdmin.style.display = 'block';
  }

  // Afficher le lien Joueurs
  const navPlayers = document.getElementById('nav-players');
  if (navPlayers) {
    navPlayers.style.display = 'block';
  }
}

// Afficher le contenu utilisateur
function showUserContent() {
  // Les sessions sont toujours visibles pour les users
  // Mais on masque le bouton "Nouvelle session" pour les users
  const authLevel = getCurrentAuthLevel();
  const btnNewSession = document.getElementById('btn-new-session');

  if (btnNewSession) {
    if (authLevel && authLevel.level === 'admin') {
      btnNewSession.style.display = 'inline-block';
    } else {
      btnNewSession.style.display = 'none';
    }
  }

  // Masquer les boutons d'édition pour les users (page session.html)
  const btnEditSession = document.getElementById('btn-edit-session');
  if (btnEditSession) {
    if (authLevel && authLevel.level === 'admin') {
      btnEditSession.style.display = 'inline-block';
    } else {
      btnEditSession.style.display = 'none';
    }
  }

  const btnAddMatch = document.getElementById('btn-add-match');
  if (btnAddMatch) {
    if (authLevel && authLevel.level === 'admin') {
      btnAddMatch.style.display = 'inline-block';
    } else {
      btnAddMatch.style.display = 'none';
    }
  }

  // Masquer le lien Administration pour les users
  const navAdmin = document.getElementById('nav-admin');
  if (navAdmin) {
    if (authLevel && authLevel.level === 'admin') {
      navAdmin.style.display = 'block';
    } else {
      navAdmin.style.display = 'none';
    }
  }

  // Masquer le lien Joueurs pour les users
  const navPlayers = document.getElementById('nav-players');
  if (navPlayers) {
    if (authLevel && authLevel.level === 'admin') {
      navPlayers.style.display = 'block';
    } else {
      navPlayers.style.display = 'none';
    }
  }
}

// Masquer le contenu admin
function hideAdminContent() {
  const dbManagement = document.querySelector('.card.border-warning');
  if (dbManagement) {
    dbManagement.style.display = 'none';
  }
  
  const testSection = document.querySelector('.card .card-header.bg-dark');
  if (testSection && testSection.closest('.card')) {
    testSection.closest('.card').style.display = 'none';
  }
}

// Afficher le bouton de connexion
function showLoginButton() {
  const loginBtn = document.getElementById('btn-login');
  if (loginBtn) {
    loginBtn.style.display = 'inline-block';
  }
}

// Afficher le statut d'authentification
function displayAuthStatus(authLevel) {
  const statusDiv = document.getElementById('auth-status');
  if (!statusDiv) return;

  // Ne rien afficher sur la page d'accueil (le div est caché)
  // Afficher seulement sur la page d'administration
  if (statusDiv.style.display === 'none') return;

  if (authLevel) {
    statusDiv.innerHTML = `
      <div class="alert alert-info mb-0">
        <i class="fas fa-user"></i> Connecté en tant que : <strong>${authLevel.name}</strong>
      </div>
    `;
  } else {
    statusDiv.innerHTML = `
      <div class="alert alert-warning mb-0">
        <i class="fas fa-lock"></i> Non connecté
      </div>
    `;
  }
}

// ===================================
// Gestion de la modal de connexion
// ===================================

// Afficher la modal de connexion
function showLoginModal() {
  const modal = new bootstrap.Modal(document.getElementById('loginModal'));
  modal.show();
  
  // Focus sur le champ de mot de passe
  setTimeout(() => {
    document.getElementById('password-input').focus();
  }, 500);
}

// Gérer la soumission du formulaire de connexion
async function handleLogin(event) {
  event.preventDefault();
  
  const passwordInput = document.getElementById('password-input');
  const password = passwordInput.value;
  const errorDiv = document.getElementById('login-error');
  
  if (!password) {
    errorDiv.textContent = 'Veuillez entrer un mot de passe';
    errorDiv.style.display = 'block';
    return;
  }
  
  // Hasher le mot de passe
  const hash = await hashPassword(password);
  
  // Vérifier si le hash correspond à un niveau d'accès
  const authLevel = getAuthLevel(hash);
  
  if (authLevel) {
    // Authentification réussie
    saveAuth(hash);
    
    // Fermer la modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
    modal.hide();
    
    // Réinitialiser le formulaire
    passwordInput.value = '';
    errorDiv.style.display = 'none';
    
    // Mettre à jour l'interface
    updateUIForAuthLevel();
    
  } else {
    // Mot de passe incorrect
    errorDiv.textContent = 'Mot de passe incorrect';
    errorDiv.style.display = 'block';
    passwordInput.value = '';
    passwordInput.focus();
  }
}

// ===================================
// Initialisation
// ===================================

// Initialiser l'authentification au chargement de la page
function initAuth() {
  // Déterminer la page active pour la navbar
  const currentPage = window.location.pathname;
  let activePage = 'accueil';

  if (currentPage.includes('backup.html')) {
    activePage = 'admin';
  } else if (currentPage.includes('session.html')) {
    activePage = 'accueil'; // Pas de page spécifique pour session
  } else if (currentPage.includes('player-stats.html')) {
    activePage = 'stats-joueur';
  } else if (currentPage.includes('matchup.html')) {
    activePage = 'matchup';
  } else if (currentPage.includes('stats.html')) {
    activePage = 'statistiques';
  } else if (currentPage.includes('players.html')) {
    activePage = 'joueurs';
  }

  // Initialiser la navbar d'abord
  if (typeof initNavbar === 'function') {
    initNavbar(activePage);
  }

  // Vérifier l'authentification existante
  const authLevel = getCurrentAuthLevel();

  // Mettre à jour l'interface
  updateUIForAuthLevel();

  // Si non connecté, afficher la modal de connexion
  if (!authLevel) {
    setTimeout(() => {
      showLoginModal();
    }, 500);
  }

  // Ajouter les event listeners
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }

  const btnLogin = document.getElementById('btn-login');
  if (btnLogin) {
    btnLogin.addEventListener('click', showLoginModal);
  }
}

// Exposer les fonctions globalement
window.initAuth = initAuth;
window.isAdmin = isAdmin;
window.isAuthenticated = isAuthenticated;
window.getCurrentAuthLevel = getCurrentAuthLevel;
window.showLoginModal = showLoginModal;

