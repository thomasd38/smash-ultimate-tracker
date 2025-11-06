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
                                    <i class="fas fa-user text-primary"></i> ${player.nickname || player.name}
                                </h5>
                                <p class="text-muted mb-0">
                                    <small><code>${player.id}</code></small>
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

    // Mise à jour de l'aperçu de l'ID en temps réel
    document.getElementById('player-nickname')?.addEventListener('input', () => {
        updateIdPreview();
    });
}

// ===================================
// MODAL: AJOUTER/MODIFIER JOUEUR
// ===================================

function openPlayerModal(playerId = null) {
    editingPlayerId = playerId;
    selectedCharacters = [];

    const modalTitle = document.getElementById('playerModalTitle');
    const playerNicknameInput = document.getElementById('player-nickname');
    const previewContainer = document.getElementById('id-preview-container');

    // Vérifier que les éléments existent
    if (!playerNicknameInput) {
        console.error('❌ Élément player-nickname introuvable');
        return;
    }

    if (playerId) {
        // Mode édition
        const player = allPlayers.find(p => p.id === playerId);
        if (!player) return;

        if (modalTitle) {
            modalTitle.innerHTML = '<i class="fas fa-edit"></i> Modifier un joueur';
        }

        playerNicknameInput.value = player.nickname || '';
        selectedCharacters = [...(player.favoriteCharacters || [])];

        // Désactiver le champ pseudo (non modifiable pour préserver l'historique)
        playerNicknameInput.disabled = true;
        playerNicknameInput.classList.add('bg-light');

        // Afficher l'ID actuel (non modifiable)
        if (previewContainer) {
            previewContainer.innerHTML = `Le pseudo ne peut pas être modifié (ID: <strong>${player.id}</strong>)`;
            previewContainer.classList.add('text-muted');
        }
    } else {
        // Mode ajout
        if (modalTitle) {
            modalTitle.innerHTML = '<i class="fas fa-user-plus"></i> Ajouter un joueur';
        }

        playerNicknameInput.value = '';
        selectedCharacters = [];

        // Réactiver le champ pseudo
        playerNicknameInput.disabled = false;
        playerNicknameInput.classList.remove('bg-light');

        // Réinitialiser l'aperçu
        if (previewContainer) {
            previewContainer.innerHTML = `L'ID sera généré automatiquement : <strong id="generated-id-preview">-</strong>`;
            previewContainer.classList.remove('text-muted');
        }
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

    // Trier par ordre alphabétique
    filteredChars.sort((a, b) => a.name.localeCompare(b.name));

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
// UTILITAIRE: GÉNÉRER L'ID À PARTIR DU NICKNAME
// ===================================

function generateIdFromNickname(nickname) {
    return nickname
        .toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Enlever les accents
        .replace(/[^a-z0-9]/g, '') // Enlever tous les caractères spéciaux (espaces, tirets, etc.)
        .trim();
}

// Mettre à jour l'aperçu de l'ID en temps réel
function updateIdPreview() {
    const nicknameInput = document.getElementById('player-nickname');
    const preview = document.getElementById('generated-id-preview');

    if (nicknameInput && preview) {
        const nickname = nicknameInput.value.trim();
        if (nickname) {
            const generatedId = generateIdFromNickname(nickname);
            preview.textContent = generatedId || '-';
            preview.style.color = generatedId ? '#198754' : '#6c757d';
        } else {
            preview.textContent = '-';
            preview.style.color = '#6c757d';
        }
    }
}

// ===================================
// SAUVEGARDER UN JOUEUR
// ===================================

async function savePlayer() {
    const playerNicknameInput = document.getElementById('player-nickname');
    const playerNickname = playerNicknameInput.value.trim();

    // Validation (seulement pour les nouveaux joueurs)
    if (!editingPlayerId && !playerNickname) {
        showSnackbar('Veuillez remplir le pseudo du joueur', 'error');
        return;
    }

    // Générer l'ID à partir du nickname (seulement pour les nouveaux joueurs)
    const playerId = editingPlayerId || generateIdFromNickname(playerNickname);

    // Vérifier que l'ID n'est pas vide (seulement pour les nouveaux joueurs)
    if (!editingPlayerId && !playerId) {
        showSnackbar('Le pseudo doit contenir au moins un caractère alphanumérique', 'error');
        return;
    }

    // Vérifier que l'ID n'existe pas déjà (seulement pour les nouveaux joueurs)
    if (!editingPlayerId && allPlayers.some(p => p.id === playerId)) {
        showSnackbar('Un joueur avec ce pseudo existe déjà (ID: ' + playerId + ')', 'error');
        return;
    }

    try {
        if (!editingPlayerId) {
            // Nouveau joueur - créer avec name, nickname et favoriteCharacters
            const playerData = {
                name: playerNickname,
                nickname: playerNickname,
                favoriteCharacters: selectedCharacters,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            await db.collection('users').doc(playerId).set(playerData);
            showSnackbar('Joueur ajouté avec succès', 'success');
        } else {
            // Modification - mettre à jour UNIQUEMENT les personnages favoris
            // Le pseudo (name/nickname) ne peut pas être modifié pour préserver l'historique
            const playerData = {
                favoriteCharacters: selectedCharacters
            };
            await db.collection('users').doc(playerId).update(playerData);
            showSnackbar('Personnages favoris mis à jour avec succès', 'success');
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
        `${player.nickname || player.name} (ID: ${player.id})`;
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

