// ===================================
// Navbar Component
// ===================================

// Générer la navbar HTML
function createNavbar(activePage = 'accueil') {
  return `
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
        <div class="container-fluid">
            <a class="navbar-brand" href="index.html">
                <i class="fas fa-gamepad"></i> Smash Ultimate Tracker
            </a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav ms-auto">
                    <li class="nav-item">
                        <a class="nav-link ${activePage === 'accueil' ? 'active' : ''}" href="index.html">
                            <i class="fas fa-home"></i> Accueil
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link ${activePage === 'statistiques' ? 'active' : ''}" href="#">
                            <i class="fas fa-chart-bar"></i> Statistiques
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link ${activePage === 'admin' ? 'active' : ''}" href="backup.html" id="nav-admin">
                            <i class="fas fa-cog"></i> Administration
                        </a>
                    </li>
                    <li class="nav-item">
                        <button class="btn btn-outline-light btn-sm ms-2" id="btn-login">
                            <i class="fas fa-sign-in-alt"></i> Connexion
                        </button>
                    </li>
                </ul>
            </div>
        </div>
    </nav>
  `;
}

// Injecter la navbar dans la page
function initNavbar(activePage = 'accueil') {
  const navbarContainer = document.getElementById('navbar-container');
  if (navbarContainer) {
    navbarContainer.innerHTML = createNavbar(activePage);
  }
}

// Exposer la fonction globalement
window.initNavbar = initNavbar;

