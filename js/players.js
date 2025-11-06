// ===================================
// Gestion des Joueurs
// ===================================

let allPlayers = [];
let allCharacters = [];
let selectedCharacters = [];
let editingPlayerId = null;

// Modals
let playerModal;
let deleteModal;

// ===================================
// INITIALISATION
// ===================================

document.addEventListener('DOMContentLoaded', async () => {
    console.log('📋 Page Gestion des Joueurs chargée');

    // Initialiser le système d'authentification
    initAuth();

    // Vérifier que l'utilisateur est admin
    if (!isAdmin()) {
        window.location.href = 'index.html';
        return;
    }

    // Initialiser les modals
    playerModal = new bootstrap.Modal(document.getElementById('playerModal'));
    deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'));

    // Charger les données
    await loadAllData();

    // Initialiser les événements
    initEventListeners();

    // Afficher les joueurs
    displayPlayers();
});

// ===================================
// CHARGEMENT DES DONNÉES
// ===================================

async function loadAllData() {
    showLoader();

    try {
        // Charger les personnages depuis characters-data.js
        allCharacters = window.ALL_CHARACTERS || [];
        console.log(`✅ ${allCharacters.length} personnages chargés`);

        // Charger les joueurs depuis Firestore
        const playersSnapshot = await db.collection('users').get();
        allPlayers = [];

        playersSnapshot.forEach(doc => {
            allPlayers.push({
                id: doc.id,
                ...doc.data()
            });
        });

        // Trier par nom
        allPlayers.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

        console.log(`✅ ${allPlayers.length} joueurs chargés`);

        hideLoader();
    } catch (error) {
        console.error('❌ Erreur lors du chargement des données:', error);
        showError('Erreur lors du chargement des données');
    }
}

// ===================================
// AFFICHAGE
// ===================================

function displayPlayers() {
    const playersList = document.getElementById('players-list');
    if (!playersList) return;

    if (allPlayers.length === 0) {
        playersList.innerHTML = `
            <div class="col-12">
                <div class="alert alert-info">
                    <i class="fas fa-info-circle"></i> Aucun joueur trouvé.
                    Cliquez sur "Ajouter un joueur" pour commencer.
                </div>
            </div>
        `;
        return;
    }

    playersList.innerHTML = allPlayers.map(player => {
        const favoriteChars = player.favoriteCharacters || [];
        const favoriteCharsHTML = favoriteChars.length > 0
            ? favoriteChars.map(charId => {
                const char = allCharacters.find(c => c.id === charId);
                return char ? `
                    <img src="${char.images.icon}" 
                         alt="${char.name}" 
                         title="${char.name}"
                         class="character-icon-small">
                ` : '';
            }).join('')
            : '<span class="text-muted">Aucun</span>';

        return `
            <div class="col-md-6 col-lg-4 mb-3">
                <div class="card h-100">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-3">
                            <div>
                                <h5 class="card-title mb-1">
                                    <i class="fas fa-user text-primary"></i> ${player.nickname}
                                </h5>
                                <p class="text-muted mb-0">
                                    <small><code>${player.name}</code></small>
                                </p>
                            </div>
                            <div class="btn-group">
                                <button class="btn btn-sm btn-outline-primary" 
                                        onclick="editPlayer('${player.id}')"
                                        title="Modifier">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn btn-sm btn-outline-danger" 
                                        onclick="confirmDeletePlayer('${player.id}')"
                                        title="Supprimer">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                        <div>
                            <strong class="d-block mb-2">
                                <i class="fas fa-star text-warning"></i> Personnages favoris :
                            </strong>
                            <div class="d-flex flex-wrap gap-1">
                                ${favoriteCharsHTML}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// ===================================
// ÉVÉNEMENTS
// ===================================

function initEventListeners() {
    // Bouton ajouter un joueur
    document.getElementById('btn-add-player')?.addEventListener('click', () => {
        openPlayerModal();
    });

    // Bouton enregistrer
    document.getElementById('btn-save-player')?.addEventListener('click', () => {
        savePlayer();
    });

    // Bouton confirmer suppression
    document.getElementById('btn-confirm-delete')?.addEventListener('click', () => {
        deletePlayer();
    });

    // Recherche de personnages
    document.getElementById('character-search')?.addEventListener('input', (e) => {
        renderCharactersGrid(e.target.value);
    });
}

// ===================================
// MODAL: AJOUTER/MODIFIER JOUEUR
// ===================================

function openPlayerModal(playerId = null) {
    editingPlayerId = playerId;
    selectedCharacters = [];

    const modalTitle = document.getElementById('playerModalTitle');
    const playerIdGroup = document.getElementById('player-id-group');
    const playerIdInput = document.getElementById('player-id');
    const playerNameInput = document.getElementById('player-name');
    const playerNicknameInput = document.getElementById('player-nickname');

    if (playerId) {
        // Mode édition
        const player = allPlayers.find(p => p.id === playerId);
        if (!player) return;

        modalTitle.innerHTML = '<i class="fas fa-edit"></i> Modifier un joueur';
        playerIdGroup.style.display = 'none';
        playerIdInput.value = player.id;
        playerNameInput.value = player.name || '';
        playerNicknameInput.value = player.nickname || '';
        selectedCharacters = [...(player.favoriteCharacters || [])];
    } else {
        // Mode ajout
        modalTitle.innerHTML = '<i class="fas fa-user-plus"></i> Ajouter un joueur';
        playerIdGroup.style.display = 'block';
        playerIdInput.value = '';
        playerNameInput.value = '';
        playerNicknameInput.value = '';
        selectedCharacters = [];
    }

    // Afficher la grille de personnages
    renderCharactersGrid();
    updateSelectedCharactersDisplay();

    playerModal.show();
}

function renderCharactersGrid(filter = '') {
    const grid = document.getElementById('characters-grid');
    if (!grid) return;

    const filteredChars = allCharacters.filter(char =>
        char.name.toLowerCase().includes(filter.toLowerCase())
    );

    grid.innerHTML = filteredChars.map(char => {
        const isSelected = selectedCharacters.includes(char.id);
        return `
            <div class="character-card-small ${isSelected ? 'selected' : ''}"
                 onclick="toggleCharacter('${char.id}')"
                 title="${char.name}">
                <img src="${char.images.icon}" alt="${char.name}">
                ${isSelected ? '<i class="fas fa-check-circle character-check"></i>' : ''}
            </div>
        `;
    }).join('');
}

function toggleCharacter(characterId) {
    const index = selectedCharacters.indexOf(characterId);
    if (index > -1) {
        selectedCharacters.splice(index, 1);
    } else {
        selectedCharacters.push(characterId);
    }
    renderCharactersGrid(document.getElementById('character-search')?.value || '');
    updateSelectedCharactersDisplay();
}

function updateSelectedCharactersDisplay() {
    const container = document.getElementById('selected-characters');
    if (!container) return;

    if (selectedCharacters.length === 0) {
        container.innerHTML = '<span class="text-muted">Aucun personnage sélectionné</span>';
        return;
    }

    container.innerHTML = selectedCharacters.map(charId => {
        const char = allCharacters.find(c => c.id === charId);
        if (!char) return '';
        return `
            <span class="badge bg-primary d-flex align-items-center gap-1">
                <img src="${char.images.icon}" alt="${char.name}" style="width: 20px; height: 20px;">
                ${char.name}
                <i class="fas fa-times" onclick="toggleCharacter('${charId}')" style="cursor: pointer;"></i>
            </span>
        `;
    }).join('');
}

// ===================================
// SAUVEGARDER UN JOUEUR
// ===================================

async function savePlayer() {
    const playerIdInput = document.getElementById('player-id');
    const playerNameInput = document.getElementById('player-name');
    const playerNicknameInput = document.getElementById('player-nickname');

    const playerId = editingPlayerId || playerIdInput.value.trim().toLowerCase();
    const playerName = playerNameInput.value.trim();
    const playerNickname = playerNicknameInput.value.trim();

    // Validation
    if (!playerId || !playerName || !playerNickname) {
        showSnackbar('Veuillez remplir tous les champs obligatoires', 'error');
        return;
    }

    // Vérifier que l'ID est valide (seulement pour les nouveaux joueurs)
    if (!editingPlayerId && !/^[a-z0-9-]+$/.test(playerId)) {
        showSnackbar('L\'ID doit contenir uniquement des minuscules, chiffres et tirets', 'error');
        return;
    }

    // Vérifier que l'ID n'existe pas déjà (seulement pour les nouveaux joueurs)
    if (!editingPlayerId && allPlayers.some(p => p.id === playerId)) {
        showSnackbar('Cet ID existe déjà', 'error');
        return;
    }

    try {
        const playerData = {
            name: playerName,
            nickname: playerNickname,
            favoriteCharacters: selectedCharacters
        };

        if (!editingPlayerId) {
            // Nouveau joueur
            playerData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
            await db.collection('users').doc(playerId).set(playerData);
            showSnackbar('Joueur ajouté avec succès', 'success');
        } else {
            // Modification
            await db.collection('users').doc(playerId).update(playerData);
            showSnackbar('Joueur modifié avec succès', 'success');
        }

        // Recharger les données et fermer la modal
        await loadAllData();
        displayPlayers();
        playerModal.hide();

    } catch (error) {
        console.error('❌ Erreur lors de la sauvegarde:', error);
        showSnackbar('Erreur lors de la sauvegarde', 'error');
    }
}

// ===================================
// MODIFIER UN JOUEUR
// ===================================

function editPlayer(playerId) {
    openPlayerModal(playerId);
}

// ===================================
// SUPPRIMER UN JOUEUR
// ===================================

function confirmDeletePlayer(playerId) {
    const player = allPlayers.find(p => p.id === playerId);
    if (!player) return;

    editingPlayerId = playerId;
    document.getElementById('delete-player-name').textContent = 
        `${player.name} (@${player.nickname})`;
    deleteModal.show();
}

async function deletePlayer() {
    if (!editingPlayerId) return;

    try {
        await db.collection('users').doc(editingPlayerId).delete();
        showSnackbar('Joueur supprimé avec succès', 'success');

        // Recharger les données et fermer la modal
        await loadAllData();
        displayPlayers();
        deleteModal.hide();
        editingPlayerId = null;

    } catch (error) {
        console.error('❌ Erreur lors de la suppression:', error);
        showSnackbar('Erreur lors de la suppression', 'error');
    }
}

// ===================================
// UTILITAIRES
// ===================================

function showLoader() {
    const loader = document.getElementById('players-loader');
    const content = document.getElementById('players-content');
    if (loader) loader.style.display = 'block';
    if (content) content.style.display = 'none';
}

function hideLoader() {
    const loader = document.getElementById('players-loader');
    const content = document.getElementById('players-content');
    if (loader) loader.style.display = 'none';
    if (content) content.style.display = 'block';
}

function showError(message) {
    console.error('❌', message);
    hideLoader();
    const content = document.getElementById('players-content');
    if (content) {
        content.innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-triangle"></i> ${message}
            </div>
        `;
        content.style.display = 'block';
    }
}

// Exposer les fonctions globalement
window.editPlayer = editPlayer;
window.confirmDeletePlayer = confirmDeletePlayer;
window.toggleCharacter = toggleCharacter;

