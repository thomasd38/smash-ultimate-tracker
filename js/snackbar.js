// ===================================
// Snackbar / Toast Notifications
// ===================================

// Créer le conteneur de snackbars s'il n'existe pas
function initSnackbarContainer() {
  if (!document.getElementById('snackbar-container')) {
    const container = document.createElement('div');
    container.id = 'snackbar-container';
    document.body.appendChild(container);
  }
}

// Afficher une snackbar
function showSnackbar(message, type = 'info', duration = 3000) {
  // Initialiser le conteneur
  initSnackbarContainer();
  
  const container = document.getElementById('snackbar-container');
  
  // Créer la snackbar
  const snackbar = document.createElement('div');
  snackbar.className = `snackbar snackbar-${type}`;
  
  // Icône selon le type
  let icon = 'fa-info-circle';
  switch(type) {
    case 'success':
      icon = 'fa-check-circle';
      break;
    case 'error':
      icon = 'fa-exclamation-circle';
      break;
    case 'warning':
      icon = 'fa-exclamation-triangle';
      break;
    case 'info':
      icon = 'fa-info-circle';
      break;
  }
  
  snackbar.innerHTML = `
    <i class="fas ${icon}"></i>
    <span>${message}</span>
  `;
  
  // Ajouter au conteneur
  container.appendChild(snackbar);
  
  // Animation d'entrée
  setTimeout(() => {
    snackbar.classList.add('show');
  }, 10);
  
  // Retirer après la durée spécifiée
  setTimeout(() => {
    snackbar.classList.remove('show');
    setTimeout(() => {
      container.removeChild(snackbar);
    }, 300);
  }, duration);
}

// Raccourcis pour les différents types
function showSuccess(message, duration = 3000) {
  showSnackbar(message, 'success', duration);
}

function showError(message, duration = 4000) {
  showSnackbar(message, 'error', duration);
}

function showWarning(message, duration = 3500) {
  showSnackbar(message, 'warning', duration);
}

function showInfo(message, duration = 3000) {
  showSnackbar(message, 'info', duration);
}

// Snackbar de confirmation (avec boutons)
function showConfirm(message, onConfirm, onCancel = null) {
  // Initialiser le conteneur
  initSnackbarContainer();
  
  const container = document.getElementById('snackbar-container');
  
  // Créer la snackbar de confirmation
  const snackbar = document.createElement('div');
  snackbar.className = 'snackbar snackbar-confirm';
  
  snackbar.innerHTML = `
    <div class="snackbar-confirm-content">
      <i class="fas fa-question-circle"></i>
      <span>${message}</span>
    </div>
    <div class="snackbar-confirm-actions">
      <button class="btn-confirm-yes">Oui</button>
      <button class="btn-confirm-no">Non</button>
    </div>
  `;
  
  // Ajouter au conteneur
  container.appendChild(snackbar);
  
  // Animation d'entrée
  setTimeout(() => {
    snackbar.classList.add('show');
  }, 10);
  
  // Fonction pour fermer la snackbar
  const closeSnackbar = () => {
    snackbar.classList.remove('show');
    setTimeout(() => {
      if (container.contains(snackbar)) {
        container.removeChild(snackbar);
      }
    }, 300);
  };
  
  // Event listeners pour les boutons
  const btnYes = snackbar.querySelector('.btn-confirm-yes');
  const btnNo = snackbar.querySelector('.btn-confirm-no');
  
  btnYes.addEventListener('click', () => {
    closeSnackbar();
    if (onConfirm) onConfirm();
  });
  
  btnNo.addEventListener('click', () => {
    closeSnackbar();
    if (onCancel) onCancel();
  });
}

// Exposer les fonctions globalement
window.showSnackbar = showSnackbar;
window.showSuccess = showSuccess;
window.showError = showError;
window.showWarning = showWarning;
window.showInfo = showInfo;
window.showConfirm = showConfirm;

