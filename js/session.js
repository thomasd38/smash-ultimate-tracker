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
    // Initialiser l'authentification et la navbar
    if (typeof initAuth === 'function') {
        initAuth();
    }

    // Récupérer l'ID de la session depuis l'URL
    const urlParams = new URLSearchParams(window.location.search);
    currentSessionId = urlParams.get('id');

    if (!currentSessionId) {
        showError('Aucune session spécifiée');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
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

    // Event listeners pour la modale d'ajout de match
    const prevStepBtn = document.getElementById('prev-step-btn');
    if (prevStepBtn) {
        prevStepBtn.addEventListener('click', goToPreviousStep);
    }

    const saveMatchBtn = document.getElementById('save-match-btn');
    if (saveMatchBtn) {
        saveMatchBtn.addEventListener('click', saveMatch);
    }

    const winnerPlayer1Btn = document.getElementById('winner-player1-btn');
    if (winnerPlayer1Btn) {
        winnerPlayer1Btn.addEventListener('click', () => selectWinner(1));
    }

    const winnerPlayer2Btn = document.getElementById('winner-player2-btn');
    if (winnerPlayer2Btn) {
        winnerPlayer2Btn.addEventListener('click', () => selectWinner(2));
    }

    // Event listeners pour les boutons de score
    document.querySelectorAll('.score-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            selectScore(this.dataset.score, this);
        });
    });

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
            showError('Session introuvable');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
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
        showError('Erreur lors du chargement de la session');
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

async function displayMatches() {
    const matchesList = document.getElementById('matches-list');
    const matchCount = document.getElementById('match-count');

    if (matchCount) {
        matchCount.textContent = matches.length;
    }

    if (!matchesList) return;

    if (matches.length === 0) {
        matchesList.innerHTML = `
            <div class="text-center text-muted py-3">
                <i class="fas fa-inbox fa-3x mb-3"></i>
                <p>Aucun match pour cette session</p>
            </div>
        `;
        return;
    }

    // Charger les icônes des personnages
    const charactersMap = {};
    try {
        const charactersSnapshot = await db.collection('characters').get();
        charactersSnapshot.forEach(doc => {
            charactersMap[doc.id] = doc.data();
        });
    } catch (error) {
        console.error('Erreur lors du chargement des personnages:', error);
    }

    matchesList.innerHTML = matches.map((match, index) => {
        const isPlayer1Winner = match.winner.id === match.player1.id;
        const isPlayer2Winner = match.winner.id === match.player2.id;

        // Récupérer les icônes des personnages
        const char1Icon = charactersMap[match.player1.character.id]?.images?.icon || '';
        const char2Icon = charactersMap[match.player2.character.id]?.images?.icon || '';

        return `
        <div class="card mb-2 match-card">
            <div class="card-body p-2">
                <div class="row align-items-center g-2">
                    <!-- Numéro du match -->
                    <div class="col-auto">
                        <span class="badge bg-secondary">#${matches.length - index}</span>
                    </div>

                    <!-- Joueur 1 -->
                    <div class="col text-end">
                        <div class="d-flex align-items-center justify-content-end gap-2">
                            <span class="player-name ${isPlayer1Winner ? 'text-success fw-bold' : ''}">${match.player1.name}</span>
                            ${char1Icon ? `<img src="${char1Icon}" alt="${match.player1.character.name}" class="character-icon" title="${match.player1.character.name}">` : ''}
                        </div>
                    </div>

                    <!-- Score -->
                    <div class="col-auto text-center">
                        <span class="match-score ${isPlayer1Winner ? 'text-success fw-bold' : isPlayer2Winner ? 'text-danger fw-bold' : ''}">${match.score}</span>
                        ${isPlayer1Winner ? '<i class="fas fa-trophy text-warning ms-1"></i>' : ''}
                        ${isPlayer2Winner ? '<i class="fas fa-trophy text-warning ms-1"></i>' : ''}
                    </div>

                    <!-- Joueur 2 -->
                    <div class="col text-start">
                        <div class="d-flex align-items-center gap-2">
                            ${char2Icon ? `<img src="${char2Icon}" alt="${match.player2.character.name}" class="character-icon" title="${match.player2.character.name}">` : ''}
                            <span class="player-name ${isPlayer2Winner ? 'text-success fw-bold' : ''}">${match.player2.name}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        `;
    }).join('');
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
        if (!stats[match.player1.id]) {
            stats[match.player1.id] = {
                id: match.player1.id,
                name: match.player1.name,
                wins: 0,
                losses: 0,
                total: 0
            };
        }

        // Initialiser les stats pour player2
        if (!stats[match.player2.id]) {
            stats[match.player2.id] = {
                id: match.player2.id,
                name: match.player2.name,
                wins: 0,
                losses: 0,
                total: 0
            };
        }

        // Compter les victoires/défaites
        if (match.winner.id === match.player1.id) {
            stats[match.player1.id].wins++;
            stats[match.player2.id].losses++;
        } else if (match.winner.id === match.player2.id) {
            stats[match.player2.id].wins++;
            stats[match.player1.id].losses++;
        }

        stats[match.player1.id].total++;
        stats[match.player2.id].total++;
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

// Variables pour le système d'ajout de match par étapes
let matchData = {
    player1: null,
    character1: null,
    player2: null,
    character2: null,
    winner: null,
    score: null
};
let currentStep = 1;
let allCharacters = [];
let sessionPlayers = [];

// Ouvrir la modale d'ajout de match
async function addMatch() {
    // Réinitialiser les données
    matchData = {
        player1: null,
        character1: null,
        player2: null,
        character2: null,
        winner: null,
        score: null
    };
    currentStep = 1;

    // Charger les personnages
    await loadAllCharacters();

    // Charger les joueurs de la session
    await loadSessionPlayers();

    // Afficher l'étape 1
    showStep(1);

    // Ouvrir la modale
    const modal = new bootstrap.Modal(document.getElementById('addMatchModal'));
    modal.show();
}

// Charger tous les personnages
async function loadAllCharacters() {
    try {
        const charactersSnapshot = await db.collection('characters').get();
        allCharacters = [];

        charactersSnapshot.forEach(doc => {
            allCharacters.push({
                id: doc.id,
                ...doc.data()
            });
        });

        // Trier par numéro
        allCharacters.sort((a, b) => parseInt(a.number) - parseInt(b.number));

    } catch (error) {
        console.error('Erreur lors du chargement des personnages:', error);
        showError('Erreur lors du chargement des personnages');
    }
}

// Charger les joueurs de la session
async function loadSessionPlayers() {
    try {
        const usersSnapshot = await db.collection('users').get();
        sessionPlayers = [];

        usersSnapshot.forEach(doc => {
            const user = doc.data();

            // Vérifier si le joueur est dans la session
            if (currentSession.playerIds && currentSession.playerIds.includes(doc.id)) {
                sessionPlayers.push({
                    id: doc.id,
                    name: user.name,
                    favoriteCharacters: user.favoriteCharacters || []
                });
            }
        });

    } catch (error) {
        console.error('Erreur lors du chargement des joueurs:', error);
        showError('Erreur lors du chargement des joueurs');
    }
}

// Afficher une étape spécifique
function showStep(step) {
    currentStep = step;

    // Masquer toutes les étapes
    for (let i = 1; i <= 5; i++) {
        const stepElement = document.getElementById(`step-${i}`);
        if (stepElement) {
            stepElement.classList.remove('active');
        }

        const indicator = document.getElementById(`step-indicator-${i}`);
        if (indicator) {
            indicator.classList.remove('active');
            if (i < step) {
                indicator.classList.add('completed');
            } else {
                indicator.classList.remove('completed');
            }
        }
    }

    // Afficher l'étape actuelle
    const currentStepElement = document.getElementById(`step-${step}`);
    if (currentStepElement) {
        currentStepElement.classList.add('active');
    }

    const currentIndicator = document.getElementById(`step-indicator-${step}`);
    if (currentIndicator) {
        currentIndicator.classList.add('active');
    }

    // Mettre à jour la barre de progression
    const progress = (step / 5) * 100;
    const progressBar = document.getElementById('match-progress');
    if (progressBar) {
        progressBar.style.width = `${progress}%`;
    }

    // Afficher/masquer le bouton précédent
    const prevBtn = document.getElementById('prev-step-btn');
    if (prevBtn) {
        prevBtn.style.display = step > 1 ? 'block' : 'none';
    }

    // Charger le contenu de l'étape
    loadStepContent(step);
}

// Charger le contenu d'une étape
function loadStepContent(step) {
    switch (step) {
        case 1:
            loadPlayer1Selection();
            break;
        case 2:
            loadCharacter1Selection();
            break;
        case 3:
            loadPlayer2Selection();
            break;
        case 4:
            loadCharacter2Selection();
            break;
        case 5:
            loadResultSelection();
            break;
    }
}

// Étape 1: Sélection du joueur 1
function loadPlayer1Selection() {
    const container = document.getElementById('player1-buttons');
    if (!container) return;

    container.innerHTML = sessionPlayers.map(player => `
        <button type="button" class="btn player-btn" onclick="selectPlayer1('${player.id}', '${player.name}')">
            <i class="fas fa-user"></i><br>
            ${player.name}
        </button>
    `).join('');
}

function selectPlayer1(playerId, playerName) {
    matchData.player1 = { id: playerId, name: playerName };
    showStep(2);
}

// Étape 2: Sélection du personnage du joueur 1
function loadCharacter1Selection() {
    const nameDisplay = document.getElementById('player1-name-display');
    if (nameDisplay) {
        nameDisplay.textContent = matchData.player1.name;
    }

    const player = sessionPlayers.find(p => p.id === matchData.player1.id);
    const favoriteIds = player ? player.favoriteCharacters : [];

    renderCharacterGrid('character1-grid', 'character1-search', favoriteIds, selectCharacter1);
}

function selectCharacter1(characterId, characterName) {
    matchData.character1 = { id: characterId, name: characterName };
    showStep(3);
}

// Étape 3: Sélection du joueur 2
function loadPlayer2Selection() {
    const container = document.getElementById('player2-buttons');
    if (!container) return;

    container.innerHTML = sessionPlayers.map(player => {
        const isDisabled = player.id === matchData.player1.id;
        return `
            <button type="button"
                    class="btn player-btn ${isDisabled ? 'disabled' : ''}"
                    onclick="${isDisabled ? '' : `selectPlayer2('${player.id}', '${player.name}')`}"
                    ${isDisabled ? 'disabled' : ''}>
                <i class="fas fa-user"></i><br>
                ${player.name}
                ${isDisabled ? '<br><small class="text-muted">(Déjà sélectionné)</small>' : ''}
            </button>
        `;
    }).join('');
}

function selectPlayer2(playerId, playerName) {
    matchData.player2 = { id: playerId, name: playerName };
    showStep(4);
}

// Étape 4: Sélection du personnage du joueur 2
function loadCharacter2Selection() {
    const nameDisplay = document.getElementById('player2-name-display');
    if (nameDisplay) {
        nameDisplay.textContent = matchData.player2.name;
    }

    const player = sessionPlayers.find(p => p.id === matchData.player2.id);
    const favoriteIds = player ? player.favoriteCharacters : [];

    renderCharacterGrid('character2-grid', 'character2-search', favoriteIds, selectCharacter2);
}

function selectCharacter2(characterId, characterName) {
    matchData.character2 = { id: characterId, name: characterName };
    showStep(5);
}

// Fonction utilitaire pour rendre la grille de personnages
function renderCharacterGrid(gridId, searchId, favoriteIds, onSelectCallback) {
    const grid = document.getElementById(gridId);
    const searchInput = document.getElementById(searchId);

    if (!grid) return;

    // Fonction pour afficher les personnages
    const displayCharacters = (filter = '') => {
        const filteredChars = allCharacters.filter(char =>
            char.name.toLowerCase().includes(filter.toLowerCase())
        );

        // Séparer favoris et autres
        const favorites = filteredChars.filter(char => favoriteIds.includes(char.id));
        const others = filteredChars.filter(char => !favoriteIds.includes(char.id));

        // Afficher favoris en premier, puis les autres
        const sortedChars = [...favorites, ...others];

        grid.innerHTML = sortedChars.map(char => `
            <div class="character-card ${favoriteIds.includes(char.id) ? 'favorite' : ''}"
                 onclick="window.${onSelectCallback.name}('${char.id}', '${char.name.replace(/'/g, "\\'")}')">
                <img src="${char.images.icon}" alt="${char.name}" title="${char.name}">
                <div class="character-name">${char.name}</div>
            </div>
        `).join('');
    };

    // Afficher tous les personnages initialement
    displayCharacters();

    // Ajouter la recherche
    if (searchInput) {
        searchInput.value = '';
        searchInput.oninput = (e) => displayCharacters(e.target.value);
    }
}

// Étape 5: Sélection du résultat
function loadResultSelection() {
    // Afficher le résumé du match
    const char1 = allCharacters.find(c => c.id === matchData.character1.id);
    const char2 = allCharacters.find(c => c.id === matchData.character2.id);

    document.getElementById('summary-char1-icon').src = char1?.images?.icon || '';
    document.getElementById('summary-char1-icon').alt = matchData.character1.name;
    document.getElementById('summary-player1').textContent = matchData.player1.name;
    document.getElementById('summary-char1').textContent = matchData.character1.name;

    document.getElementById('summary-char2-icon').src = char2?.images?.icon || '';
    document.getElementById('summary-char2-icon').alt = matchData.character2.name;
    document.getElementById('summary-player2').textContent = matchData.player2.name;
    document.getElementById('summary-char2').textContent = matchData.character2.name;

    // Configurer les boutons de vainqueur
    document.getElementById('winner-player1-name').textContent = matchData.player1.name;
    document.getElementById('winner-player2-name').textContent = matchData.player2.name;

    // Réinitialiser les sélections
    document.querySelectorAll('.winner-btn').forEach(btn => btn.classList.remove('selected'));
    document.querySelectorAll('.score-btn').forEach(btn => btn.classList.remove('selected'));
    document.getElementById('score-selection').style.display = 'none';
    document.getElementById('save-match-container').style.display = 'none';

    matchData.winner = null;
    matchData.score = null;
}

function selectWinner(winnerNumber) {
    // Déterminer le vainqueur
    if (winnerNumber === 1) {
        matchData.winner = { ...matchData.player1 };
    } else {
        matchData.winner = { ...matchData.player2 };
    }

    // Mettre à jour l'UI
    document.querySelectorAll('.winner-btn').forEach(btn => btn.classList.remove('selected'));
    document.getElementById(`winner-player${winnerNumber}-btn`).classList.add('selected');

    // Afficher la sélection du score
    document.getElementById('score-selection').style.display = 'block';
}

function selectScore(score, element) {
    matchData.score = score;

    // Mettre à jour l'UI
    document.querySelectorAll('.score-btn').forEach(btn => btn.classList.remove('selected'));
    element.classList.add('selected');

    // Afficher le bouton de sauvegarde
    document.getElementById('save-match-container').style.display = 'block';
}

// Sauvegarder le match
async function saveMatch() {
    const errorDiv = document.getElementById('add-match-error');
    errorDiv.style.display = 'none';

    // Validation finale
    if (!matchData.player1 || !matchData.player2 || !matchData.character1 ||
        !matchData.character2 || !matchData.winner || !matchData.score) {
        errorDiv.textContent = 'Données incomplètes';
        errorDiv.style.display = 'block';
        return;
    }

    try {
        // Créer l'objet match pour Firestore
        const matchToSave = {
            player1: {
                id: matchData.player1.id,
                name: matchData.player1.name,
                character: {
                    id: matchData.character1.id,
                    name: matchData.character1.name
                }
            },
            player2: {
                id: matchData.player2.id,
                name: matchData.player2.name,
                character: {
                    id: matchData.character2.id,
                    name: matchData.character2.name
                }
            },
            winner: {
                id: matchData.winner.id,
                name: matchData.winner.name
            },
            score: matchData.score,
            date: new Date().toISOString(),
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        // Ajouter le match à la sous-collection
        await db.collection('sessions')
            .doc(currentSessionId)
            .collection('matches')
            .add(matchToSave);

        console.log('✅ Match ajouté');

        // Fermer la modale
        const modal = bootstrap.Modal.getInstance(document.getElementById('addMatchModal'));
        if (modal) modal.hide();

        // Recharger les données
        await loadSessionData();

        // Afficher un message de succès
        showSuccess('Match ajouté avec succès !');

    } catch (error) {
        console.error('❌ Erreur lors de l\'ajout du match:', error);
        errorDiv.textContent = 'Erreur lors de l\'ajout du match';
        errorDiv.style.display = 'block';
    }
}

// Fonction pour revenir à l'étape précédente
function goToPreviousStep() {
    if (currentStep > 1) {
        showStep(currentStep - 1);
    }
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
        showSuccess('Session mise à jour avec succès !');

    } catch (error) {
        console.error('❌ Erreur lors de la mise à jour de la session:', error);
        errorDiv.textContent = 'Erreur lors de la mise à jour de la session';
        errorDiv.style.display = 'block';
    }
}

// Gérer la suppression de session
function handleDeleteSession() {
    showConfirm(
        `Êtes-vous sûr de vouloir supprimer la session "${currentSession.name}" ? Cette action supprimera également tous les matchs associés.`,
        async () => {
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

                // Afficher un message de succès
                showSuccess('Session supprimée avec succès !');

                // Rediriger vers l'accueil après un court délai
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1000);

            } catch (error) {
                console.error('❌ Erreur lors de la suppression de la session:', error);
                showError('Erreur lors de la suppression de la session');
            }
        }
    );
}

