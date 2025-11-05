// ===================================
// Session Page - Display session details
// ===================================

let currentSessionId = null;
let currentSession = null;
let matches = [];
let players = [];

// ===================================
// Initialisation
// ===================================

document.addEventListener('DOMContentLoaded', function() {
    // Récupérer l'ID de la session depuis l'URL
    const urlParams = new URLSearchParams(window.location.search);
    currentSessionId = urlParams.get('id');

    if (!currentSessionId) {
        alert('❌ Aucune session spécifiée');
        window.location.href = 'index.html';
        return;
    }

    // Charger les données de la session
    loadSessionData();

    // Event listeners
    const btnAddMatch = document.getElementById('btn-add-match');
    if (btnAddMatch) {
        btnAddMatch.addEventListener('click', addMatch);
    }

    const btnEditSession = document.getElementById('btn-edit-session');
    if (btnEditSession) {
        btnEditSession.addEventListener('click', openEditSessionModal);
    }

    const editSessionForm = document.getElementById('edit-session-form');
    if (editSessionForm) {
        editSessionForm.addEventListener('submit', handleEditSession);
    }

    const btnDeleteSession = document.getElementById('btn-delete-session');
    if (btnDeleteSession) {
        btnDeleteSession.addEventListener('click', handleDeleteSession);
    }
});

// ===================================
// Chargement des données
// ===================================

async function loadSessionData() {
    try {
        // Charger la session
        const sessionDoc = await db.collection('sessions').doc(currentSessionId).get();
        
        if (!sessionDoc.exists) {
            alert('❌ Session introuvable');
            window.location.href = 'index.html';
            return;
        }
        
        currentSession = { id: sessionDoc.id, ...sessionDoc.data() };
        
        // Afficher les informations de la session
        displaySessionInfo();
        
        // Charger les matchs
        await loadMatches();
        
        // Calculer et afficher le podium
        displayPodium();
        
    } catch (error) {
        console.error('Erreur lors du chargement de la session:', error);
        alert('❌ Erreur lors du chargement de la session');
    }
}

async function loadMatches() {
    try {
        const matchesSnapshot = await db.collection('sessions')
            .doc(currentSessionId)
            .collection('matches')
            .orderBy('createdAt', 'desc')
            .get();
        
        matches = matchesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        
        displayMatches();
        
    } catch (error) {
        console.error('Erreur lors du chargement des matchs:', error);
    }
}

// ===================================
// Affichage
// ===================================

function displaySessionInfo() {
    const sessionNameEl = document.getElementById('session-name');
    const sessionDateEl = document.getElementById('session-date');

    if (sessionNameEl) {
        const typeIcon = currentSession.sessionType === 'online'
            ? '<i class="fas fa-wifi text-info"></i>'
            : '<i class="fas fa-home text-success"></i>';

        sessionNameEl.innerHTML = `
            <i class="fas fa-gamepad text-warning"></i>
            <span>${currentSession.name || 'Session sans nom'}</span>
            ${typeIcon}
        `;
    }

    if (sessionDateEl) {
        const date = currentSession.date ? new Date(currentSession.date) : new Date();
        const formattedDate = date.toLocaleDateString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const typeText = currentSession.sessionType === 'online' ? 'Online' : 'LAN (Local)';

        sessionDateEl.innerHTML = `
            <i class="fas fa-calendar"></i> ${formattedDate}
            <span class="badge bg-secondary ms-2">${typeText}</span>
        `;
    }
}

function displayMatches() {
    const matchesList = document.getElementById('matches-list');
    const matchCount = document.getElementById('match-count');
    
    if (matchCount) {
        matchCount.textContent = matches.length;
    }
    
    if (!matchesList) return;
    
    if (matches.length === 0) {
        matchesList.innerHTML = `
            <div class="text-center text-muted py-4">
                <i class="fas fa-inbox fa-3x mb-3"></i>
                <p>Aucun match pour cette session</p>
            </div>
        `;
        return;
    }
    
    matchesList.innerHTML = matches.map((match, index) => `
        <div class="card mb-3">
            <div class="card-body">
                <div class="row align-items-center">
                    <div class="col-12 col-md-1 text-center mb-2 mb-md-0">
                        <span class="badge bg-secondary fs-6">Match #${matches.length - index}</span>
                    </div>
                    <div class="col-5 col-md-4 text-end">
                        <h5 class="mb-1 ${match.winnerId === match.player1Id ? 'text-success fw-bold' : ''}">
                            ${match.player1Name}
                        </h5>
                        <small class="text-muted">${match.player1Character || 'Personnage inconnu'}</small>
                    </div>
                    <div class="col-2 col-md-2 text-center">
                        <h4 class="mb-0">
                            <span class="${match.winnerId === match.player1Id ? 'text-success' : 'text-muted'}">${match.player1Score || 0}</span>
                            <span class="text-muted mx-2">-</span>
                            <span class="${match.winnerId === match.player2Id ? 'text-success' : 'text-muted'}">${match.player2Score || 0}</span>
                        </h4>
                    </div>
                    <div class="col-5 col-md-4 text-start">
                        <h5 class="mb-1 ${match.winnerId === match.player2Id ? 'text-success fw-bold' : ''}">
                            ${match.player2Name}
                        </h5>
                        <small class="text-muted">${match.player2Character || 'Personnage inconnu'}</small>
                    </div>
                    <div class="col-12 col-md-1 text-center mt-2 mt-md-0">
                        <i class="fas fa-trophy ${match.winnerId === match.player1Id ? 'text-warning' : match.winnerId === match.player2Id ? 'text-warning' : 'text-muted'}"></i>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

function displayPodium() {
    const podiumContainer = document.getElementById('podium-container');
    if (!podiumContainer) return;
    
    // Calculer les statistiques des joueurs
    const playerStats = calculatePlayerStats();
    
    if (playerStats.length === 0) {
        podiumContainer.innerHTML = `
            <div class="col-12 text-muted py-4">
                <i class="fas fa-inbox fa-3x mb-3"></i>
                <p>Aucune donnée pour le classement</p>
            </div>
        `;
        return;
    }
    
    // Trier par winrate (puis par nombre de victoires en cas d'égalité)
    playerStats.sort((a, b) => {
        if (b.winrate !== a.winrate) {
            return b.winrate - a.winrate;
        }
        return b.wins - a.wins;
    });
    
    // Afficher le podium
    podiumContainer.innerHTML = playerStats.map((player, index) => {
        const position = index + 1;
        let badgeClass = 'bg-secondary';
        let icon = 'fa-user';
        
        if (position === 1) {
            badgeClass = 'bg-warning text-dark';
            icon = 'fa-crown';
        } else if (position === 2) {
            badgeClass = 'bg-secondary';
            icon = 'fa-medal';
        } else if (position === 3) {
            badgeClass = 'bg-danger';
            icon = 'fa-award';
        }
        
        return `
            <div class="col-12 col-sm-6 col-md-4 col-lg-3 mb-3">
                <div class="card h-100 ${position === 1 ? 'border-warning border-3' : ''}">
                    <div class="card-body text-center">
                        <div class="mb-2">
                            <span class="badge ${badgeClass} fs-5">
                                <i class="fas ${icon}"></i> #${position}
                            </span>
                        </div>
                        <h5 class="card-title">${player.name}</h5>
                        <div class="mb-2">
                            <div class="progress" style="height: 25px;">
                                <div class="progress-bar ${player.winrate >= 50 ? 'bg-success' : 'bg-danger'}" 
                                     role="progressbar" 
                                     style="width: ${player.winrate}%"
                                     aria-valuenow="${player.winrate}" 
                                     aria-valuemin="0" 
                                     aria-valuemax="100">
                                    ${player.winrate.toFixed(0)}%
                                </div>
                            </div>
                        </div>
                        <p class="mb-1">
                            <i class="fas fa-trophy text-success"></i> ${player.wins} victoires
                        </p>
                        <p class="mb-0 text-muted">
                            <i class="fas fa-times-circle text-danger"></i> ${player.losses} défaites
                        </p>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// ===================================
// Calculs
// ===================================

function calculatePlayerStats() {
    const stats = {};
    
    // Parcourir tous les matchs
    matches.forEach(match => {
        // Initialiser les stats pour player1
        if (!stats[match.player1Id]) {
            stats[match.player1Id] = {
                id: match.player1Id,
                name: match.player1Name,
                wins: 0,
                losses: 0,
                total: 0
            };
        }
        
        // Initialiser les stats pour player2
        if (!stats[match.player2Id]) {
            stats[match.player2Id] = {
                id: match.player2Id,
                name: match.player2Name,
                wins: 0,
                losses: 0,
                total: 0
            };
        }
        
        // Compter les victoires/défaites
        if (match.winnerId === match.player1Id) {
            stats[match.player1Id].wins++;
            stats[match.player2Id].losses++;
        } else if (match.winnerId === match.player2Id) {
            stats[match.player2Id].wins++;
            stats[match.player1Id].losses++;
        }
        
        stats[match.player1Id].total++;
        stats[match.player2Id].total++;
    });
    
    // Calculer le winrate
    const playerArray = Object.values(stats).map(player => ({
        ...player,
        winrate: player.total > 0 ? (player.wins / player.total) * 100 : 0
    }));
    
    return playerArray;
}

// ===================================
// Actions
// ===================================

function addMatch() {
    // TODO: Implémenter l'ajout de match
    alert('🚧 Fonctionnalité en cours de développement');
}

// Ouvrir la modale d'édition de session
async function openEditSessionModal() {
    // Charger les joueurs
    await loadPlayersForEditModal();

    // Pré-remplir le formulaire
    const sessionNameInput = document.getElementById('edit-session-name-input');
    if (sessionNameInput) {
        sessionNameInput.value = currentSession.name || '';
    }

    // Sélectionner le type de session
    const sessionType = currentSession.sessionType || 'lan';
    const sessionTypeInput = document.getElementById(`edit-session-type-${sessionType}`);
    if (sessionTypeInput) {
        sessionTypeInput.checked = true;
    }

    // Ouvrir la modale
    const modal = new bootstrap.Modal(document.getElementById('editSessionModal'));
    modal.show();
}

// Charger les joueurs pour la modale d'édition
async function loadPlayersForEditModal() {
    const container = document.getElementById('edit-players-checkboxes');
    if (!container) return;

    try {
        const usersSnapshot = await db.collection('users').orderBy('name').get();

        if (usersSnapshot.empty) {
            container.innerHTML = '<p class="text-muted mb-0">Aucun joueur disponible</p>';
            return;
        }

        const currentPlayerIds = currentSession.playerIds || [];

        container.innerHTML = usersSnapshot.docs.map(doc => {
            const user = doc.data();
            const isChecked = currentPlayerIds.includes(doc.id) ? 'checked' : '';
            return `
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" value="${doc.id}" id="edit-player-${doc.id}" ${isChecked}>
                    <label class="form-check-label" for="edit-player-${doc.id}">
                        ${user.name}
                    </label>
                </div>
            `;
        }).join('');

    } catch (error) {
        console.error('Erreur lors du chargement des joueurs:', error);
        container.innerHTML = '<p class="text-danger mb-0">Erreur lors du chargement des joueurs</p>';
    }
}

// Gérer l'édition de session
async function handleEditSession(e) {
    e.preventDefault();

    const sessionNameInput = document.getElementById('edit-session-name-input');
    const sessionTypeInputs = document.getElementsByName('edit-session-type');
    const playersCheckboxes = document.querySelectorAll('#edit-players-checkboxes input[type="checkbox"]:checked');
    const errorDiv = document.getElementById('edit-session-error');

    // Récupérer les valeurs
    const sessionName = sessionNameInput.value.trim();
    let sessionType = 'lan';
    for (const input of sessionTypeInputs) {
        if (input.checked) {
            sessionType = input.value;
            break;
        }
    }

    const playerIds = Array.from(playersCheckboxes).map(cb => cb.value);

    // Validation
    if (!sessionName) {
        errorDiv.textContent = 'Le nom de la session est requis';
        errorDiv.style.display = 'block';
        return;
    }

    if (playerIds.length === 0) {
        errorDiv.textContent = 'Veuillez sélectionner au moins un joueur';
        errorDiv.style.display = 'block';
        return;
    }

    errorDiv.style.display = 'none';

    try {
        // Mettre à jour la session dans Firestore
        await db.collection('sessions').doc(currentSessionId).update({
            name: sessionName,
            sessionType: sessionType,
            playerIds: playerIds
        });

        console.log('✅ Session mise à jour');

        // Fermer la modale
        const modal = bootstrap.Modal.getInstance(document.getElementById('editSessionModal'));
        modal.hide();

        // Recharger les données
        await loadSessionData();

        // Afficher un message de succès
        alert('✅ Session mise à jour avec succès !');

    } catch (error) {
        console.error('❌ Erreur lors de la mise à jour de la session:', error);
        errorDiv.textContent = 'Erreur lors de la mise à jour de la session';
        errorDiv.style.display = 'block';
    }
}

// Gérer la suppression de session
async function handleDeleteSession() {
    const confirmDelete = confirm(
        `⚠️ Êtes-vous sûr de vouloir supprimer la session "${currentSession.name}" ?\n\n` +
        'Cette action supprimera également tous les matchs associés et ne peut pas être annulée.'
    );

    if (!confirmDelete) return;

    try {
        // Supprimer tous les matchs de la session
        const matchesSnapshot = await db.collection('sessions')
            .doc(currentSessionId)
            .collection('matches')
            .get();

        const deletePromises = matchesSnapshot.docs.map(doc => doc.ref.delete());
        await Promise.all(deletePromises);

        // Supprimer la session
        await db.collection('sessions').doc(currentSessionId).delete();

        console.log('✅ Session supprimée');

        // Fermer la modale
        const modal = bootstrap.Modal.getInstance(document.getElementById('editSessionModal'));
        if (modal) modal.hide();

        // Rediriger vers l'accueil
        alert('✅ Session supprimée avec succès !');
        window.location.href = 'index.html';

    } catch (error) {
        console.error('❌ Erreur lors de la suppression de la session:', error);
        alert('❌ Erreur lors de la suppression de la session');
    }
}

