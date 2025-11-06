// ===================================
// Smash Ultimate Tracker - Main App
// ===================================

// Attendre que le DOM soit chargé
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎮 Application Smash Ultimate Tracker démarrée');

    // Initialiser le système d'authentification
    initAuth();

    // Initialiser les event listeners
    initEventListeners();

    // Charger les sessions existantes
    loadSessions();
});

// ===================================
// Event Listeners
// ===================================

function initEventListeners() {
    // Bouton nouvelle session
    const btnNewSession = document.getElementById('btn-new-session');
    if (btnNewSession) {
        btnNewSession.addEventListener('click', openNewSessionModal);
    }

    // Formulaire nouvelle session
    const newSessionForm = document.getElementById('new-session-form');
    if (newSessionForm) {
        newSessionForm.addEventListener('submit', handleCreateSession);
    }

    // Bouton voir les sessions
    const btnViewSessions = document.getElementById('btn-view-sessions');
    if (btnViewSessions) {
        btnViewSessions.addEventListener('click', loadSessions);
    }

    // Boutons de gestion de la base de données
    const btnInitDb = document.getElementById('btn-init-db');
    if (btnInitDb) {
        btnInitDb.addEventListener('click', handleInitDatabase);
    }

    const btnClearDb = document.getElementById('btn-clear-db');
    if (btnClearDb) {
        btnClearDb.addEventListener('click', handleClearDatabase);
    }

    // Boutons de test Firebase
    const btnTestWrite = document.getElementById('btn-test-write');
    if (btnTestWrite) {
        btnTestWrite.addEventListener('click', testFirebaseWrite);
    }

    const btnTestRead = document.getElementById('btn-test-read');
    if (btnTestRead) {
        btnTestRead.addEventListener('click', testFirebaseRead);
    }
}

// ===================================
// Fonctions Firebase - Sessions
// ===================================

// Ouvrir la modale de nouvelle session
async function openNewSessionModal() {
    // Charger les joueurs
    await loadPlayersForModal('players-checkboxes');

    // Ouvrir la modale
    const modal = new bootstrap.Modal(document.getElementById('newSessionModal'));
    modal.show();
}

// Charger les joueurs dans la modale
async function loadPlayersForModal(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    try {
        const usersSnapshot = await db.collection('users').orderBy('name').get();

        if (usersSnapshot.empty) {
            container.innerHTML = '<p class="text-muted mb-0">Aucun joueur disponible</p>';
            return;
        }

        container.innerHTML = usersSnapshot.docs.map(doc => {
            const user = doc.data();
            return `
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" value="${doc.id}" id="player-${doc.id}">
                    <label class="form-check-label" for="player-${doc.id}">
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

// Gérer la création de session
async function handleCreateSession(e) {
    e.preventDefault();

    const sessionNameInput = document.getElementById('session-name-input');
    const sessionTypeInputs = document.getElementsByName('session-type');
    const playersCheckboxes = document.querySelectorAll('#players-checkboxes input[type="checkbox"]:checked');
    const errorDiv = document.getElementById('session-error');

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
        // Créer la session dans Firestore
        const docRef = await db.collection('sessions').add({
            name: sessionName,
            sessionType: sessionType,
            playerIds: playerIds,
            date: new Date().toISOString(),
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        console.log('✅ Session créée avec ID:', docRef.id);

        // Fermer la modale
        const modal = bootstrap.Modal.getInstance(document.getElementById('newSessionModal'));
        modal.hide();

        // Réinitialiser le formulaire
        document.getElementById('new-session-form').reset();

        // Recharger la liste des sessions
        loadSessions();

        // Afficher un message de succès
        showSuccess('Session créée avec succès !');

    } catch (error) {
        console.error('❌ Erreur lors de la création de la session:', error);
        errorDiv.textContent = 'Erreur lors de la création de la session';
        errorDiv.style.display = 'block';
    }
}

// Charger toutes les sessions
async function loadSessions() {
    const sessionsList = document.getElementById('sessions-list');

    if (!sessionsList) return;

    // Afficher un loader
    sessionsList.innerHTML = `
        <div class="col-12 text-center py-5">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Chargement...</span>
            </div>
            <p class="mt-3">Chargement des sessions...</p>
        </div>
    `;

    try {
        // Récupérer les sessions depuis Firestore
        const querySnapshot = await db.collection('sessions')
            .orderBy('createdAt', 'desc')
            .get();

        if (querySnapshot.empty) {
            sessionsList.innerHTML = `
                <div class="col-12 text-center text-muted py-5">
                    <i class="fas fa-inbox fa-3x mb-3"></i>
                    <p>Aucune session pour le moment. Créez-en une pour commencer !</p>
                </div>
            `;
            return;
        }

        // Vider la liste
        sessionsList.innerHTML = '';

        // Afficher chaque session avec ses statistiques
        for (const doc of querySnapshot.docs) {
            const session = doc.data();
            const sessionCard = await createSessionCard(doc.id, session);
            sessionsList.innerHTML += sessionCard;
        }

        console.log(`✅ ${querySnapshot.size} session(s) chargée(s)`);
    } catch (error) {
        console.error('❌ Erreur lors du chargement des sessions:', error);
        sessionsList.innerHTML = `
            <div class="col-12">
                <div class="alert alert-danger" role="alert">
                    <i class="fas fa-exclamation-triangle"></i>
                    Erreur lors du chargement des sessions
                </div>
            </div>
        `;
    }
}

// Créer le HTML d'une carte de session
async function createSessionCard(sessionId, sessionData) {
    const date = sessionData.date ? new Date(sessionData.date).toLocaleDateString('fr-FR') : 'Date inconnue';

    // Récupérer le nombre de matchs
    let matchCount = 0;
    try {
        const matchesSnapshot = await db.collection('sessions').doc(sessionId).collection('matches').get();
        matchCount = matchesSnapshot.size;
    } catch (error) {
        console.error('Erreur lors du comptage des matchs:', error);
    }

    // Récupérer les joueurs et calculer le podium
    const playerIds = sessionData.playerIds || [];
    const playerCount = playerIds.length;

    let podiumHTML = '';
    if (matchCount > 0) {
        try {
            // Récupérer tous les matchs pour calculer les scores
            const matchesSnapshot = await db.collection('sessions').doc(sessionId).collection('matches').get();
            const playerScores = {};

            // Initialiser les scores
            playerIds.forEach(playerId => {
                playerScores[playerId] = { wins: 0, total: 0, name: '' };
            });

            // Récupérer les noms des joueurs
            const usersSnapshot = await db.collection('users').get();
            const usersMap = {};
            usersSnapshot.forEach(doc => {
                usersMap[doc.id] = doc.data().name;
            });

            // Calculer les victoires et le total de matchs
            matchesSnapshot.forEach(doc => {
                const match = doc.data();
                const winnerId = match.winner?.id;
                const player1Id = match.player1?.id;
                const player2Id = match.player2?.id;

                if (winnerId && playerScores[winnerId] !== undefined) {
                    playerScores[winnerId].wins++;
                    playerScores[winnerId].name = usersMap[winnerId] || 'Inconnu';
                }

                if (player1Id && playerScores[player1Id] !== undefined) {
                    playerScores[player1Id].total++;
                    playerScores[player1Id].name = usersMap[player1Id] || 'Inconnu';
                }

                if (player2Id && playerScores[player2Id] !== undefined) {
                    playerScores[player2Id].total++;
                    playerScores[player2Id].name = usersMap[player2Id] || 'Inconnu';
                }
            });

            // Calculer le winrate et trier par winrate (puis par nombre de victoires en cas d'égalité)
            const sortedPlayers = Object.entries(playerScores)
                .map(([id, data]) => ({
                    id,
                    ...data,
                    winrate: data.total > 0 ? (data.wins / data.total) * 100 : 0
                }))
                .sort((a, b) => {
                    if (b.winrate !== a.winrate) {
                        return b.winrate - a.winrate;
                    }
                    return b.wins - a.wins;
                });

            // Créer le podium (top 3) - Affichage visuel type podium
            const top3 = sortedPlayers.slice(0, 3);
            const medals = ['🥇', '🥈', '🥉'];

            // Réorganiser pour affichage podium : 2e, 1er, 3e
            const podiumOrder = top3.length >= 3 ? [top3[1], top3[0], top3[2]] :
                                top3.length === 2 ? [top3[1], top3[0]] :
                                top3.length === 1 ? [null, top3[0]] : [];

            podiumHTML = `
                <div class="session-podium-visual">
                    ${podiumOrder.map((player, visualIndex) => {
                        if (!player) return '<div class="podium-position empty"></div>';

                        // Déterminer la vraie position (médaille)
                        let realIndex;
                        if (top3.length >= 3) {
                            realIndex = visualIndex === 0 ? 1 : visualIndex === 1 ? 0 : 2; // 2e, 1er, 3e
                        } else if (top3.length === 2) {
                            realIndex = visualIndex === 0 ? 1 : 0; // 2e, 1er
                        } else {
                            realIndex = 0; // 1er seul
                        }

                        const heightClass = realIndex === 0 ? 'first' : realIndex === 1 ? 'second' : 'third';

                        return `
                            <div class="podium-position ${heightClass}">
                                <div class="podium-medal">${medals[realIndex]}</div>
                                <div class="podium-player-name">${player.name}</div>
                            </div>
                        `;
                    }).join('')}
                </div>
            `;
        } catch (error) {
            console.error('Erreur lors du calcul du podium:', error);
        }
    }

    return `
        <div class="col-md-6 col-lg-4 mb-3 fade-in">
            <div class="card session-card" onclick="viewSession('${sessionId}')">
                <div class="card-body">
                    <div class="session-header">
                        <h5 class="card-title mb-3">
                            <i class="fas fa-gamepad text-primary"></i>
                            ${sessionData.name}
                        </h5>
                    </div>
                    ${podiumHTML}
                    <div class="session-stats mt-3">
                        <div class="stat-item">
                            <i class="fas fa-users"></i>
                            <span>${playerCount} joueur${playerCount > 1 ? 's' : ''}</span>
                        </div>
                        <div class="stat-item">
                            <i class="fas fa-trophy"></i>
                            <span>${matchCount} match${matchCount > 1 ? 's' : ''}</span>
                        </div>
                    </div>
                    <p class="session-date mt-2 mb-0">
                        <i class="fas fa-calendar"></i> ${date}
                    </p>
                </div>
            </div>
        </div>
    `;
}

// Voir les détails d'une session
function viewSession(sessionId) {
    window.location.href = `session.html?id=${sessionId}`;
}

// ===================================
// Fonctions de gestion de la base de données
// ===================================

// Handler pour initialiser la base de données
function handleInitDatabase() {
    initializeDatabase();
}

// Handler pour vider la base de données
function handleClearDatabase() {
    clearDatabase();
}

// ===================================
// Fonctions de test Firebase
// ===================================

// Tester l'écriture dans Firebase
function testFirebaseWrite() {
    const testResults = document.getElementById('test-results');
    
    testResults.innerHTML = `
        <div class="alert alert-info">
            <i class="fas fa-spinner fa-spin"></i> Test d'écriture en cours...
        </div>
    `;
    
    const testData = {
        test: true,
        message: 'Test d\'écriture Firebase',
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    db.collection('test').add(testData)
        .then((docRef) => {
            testResults.innerHTML = `
                <div class="alert alert-success">
                    <i class="fas fa-check-circle"></i>
                    <strong>✅ Test d'écriture réussi !</strong>
                    <br>Document créé avec l'ID : <code>${docRef.id}</code>
                </div>
            `;
            console.log('✅ Test d\'écriture réussi, ID:', docRef.id);
        })
        .catch((error) => {
            testResults.innerHTML = `
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-triangle"></i>
                    <strong>❌ Erreur lors du test d'écriture</strong>
                    <br><code>${error.message}</code>
                </div>
            `;
            console.error('❌ Erreur test d\'écriture:', error);
        });
}

// Tester la lecture depuis Firebase
function testFirebaseRead() {
    const testResults = document.getElementById('test-results');
    
    testResults.innerHTML = `
        <div class="alert alert-info">
            <i class="fas fa-spinner fa-spin"></i> Test de lecture en cours...
        </div>
    `;
    
    db.collection('test').limit(5).get()
        .then((querySnapshot) => {
            if (querySnapshot.empty) {
                testResults.innerHTML = `
                    <div class="alert alert-warning">
                        <i class="fas fa-info-circle"></i>
                        <strong>⚠️ Aucun document trouvé</strong>
                        <br>Essayez d'abord le test d'écriture pour créer des données.
                    </div>
                `;
                return;
            }
            
            let resultsHTML = `
                <div class="alert alert-success">
                    <i class="fas fa-check-circle"></i>
                    <strong>✅ Test de lecture réussi !</strong>
                    <br>${querySnapshot.size} document(s) trouvé(s) :
                </div>
                <pre class="bg-light p-3 rounded">`;
            
            querySnapshot.forEach((doc) => {
                resultsHTML += `ID: ${doc.id}\n`;
                resultsHTML += `Data: ${JSON.stringify(doc.data(), null, 2)}\n\n`;
            });
            
            resultsHTML += `</pre>`;
            testResults.innerHTML = resultsHTML;
            
            console.log('✅ Test de lecture réussi, documents:', querySnapshot.size);
        })
        .catch((error) => {
            testResults.innerHTML = `
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-triangle"></i>
                    <strong>❌ Erreur lors du test de lecture</strong>
                    <br><code>${error.message}</code>
                </div>
            `;
            console.error('❌ Erreur test de lecture:', error);
        });
}

// ===================================
// Utilitaires
// ===================================

// Formater une date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Formater un timestamp Firestore
function formatTimestamp(timestamp) {
    if (!timestamp) return 'Date inconnue';
    const date = timestamp.toDate();
    return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

