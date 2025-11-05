// ===================================
// Smash Ultimate Tracker - Main App
// ===================================

// Attendre que le DOM soit chargé
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎮 Application Smash Ultimate Tracker démarrée');
    
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
        btnNewSession.addEventListener('click', createNewSession);
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

// Créer une nouvelle session
function createNewSession() {
    const sessionName = prompt('Nom de la session :');
    
    if (!sessionName) {
        alert('❌ Nom de session requis');
        return;
    }
    
    const sessionData = {
        name: sessionName,
        date: new Date().toISOString(),
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    db.collection('sessions').add(sessionData)
        .then((docRef) => {
            console.log('✅ Session créée avec ID:', docRef.id);
            alert(`✅ Session "${sessionName}" créée avec succès !`);
            loadSessions(); // Recharger la liste
        })
        .catch((error) => {
            console.error('❌ Erreur lors de la création de la session:', error);
            alert('❌ Erreur lors de la création de la session');
        });
}

// Charger toutes les sessions
function loadSessions() {
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
    
    // Récupérer les sessions depuis Firestore
    db.collection('sessions')
        .orderBy('createdAt', 'desc')
        .get()
        .then((querySnapshot) => {
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
            
            // Afficher chaque session
            querySnapshot.forEach((doc) => {
                const session = doc.data();
                const sessionCard = createSessionCard(doc.id, session);
                sessionsList.innerHTML += sessionCard;
            });
            
            console.log(`✅ ${querySnapshot.size} session(s) chargée(s)`);
        })
        .catch((error) => {
            console.error('❌ Erreur lors du chargement des sessions:', error);
            sessionsList.innerHTML = `
                <div class="col-12">
                    <div class="alert alert-danger" role="alert">
                        <i class="fas fa-exclamation-triangle"></i>
                        Erreur lors du chargement des sessions
                    </div>
                </div>
            `;
        });
}

// Créer le HTML d'une carte de session
function createSessionCard(sessionId, sessionData) {
    const date = sessionData.date ? new Date(sessionData.date).toLocaleDateString('fr-FR') : 'Date inconnue';
    
    return `
        <div class="col-md-6 col-lg-4 mb-3 fade-in">
            <div class="card session-card" onclick="viewSession('${sessionId}')">
                <div class="card-body">
                    <div class="session-header">
                        <h5 class="card-title mb-0">
                            <i class="fas fa-gamepad text-primary"></i>
                            ${sessionData.name}
                        </h5>
                    </div>
                    <p class="session-date mt-2">
                        <i class="fas fa-calendar"></i> ${date}
                    </p>
                    <div class="session-stats">
                        <div class="stat-item">
                            <i class="fas fa-users"></i>
                            <span>0 joueurs</span>
                        </div>
                        <div class="stat-item">
                            <i class="fas fa-trophy"></i>
                            <span>0 matchs</span>
                        </div>
                    </div>
                </div>
                <div class="card-footer bg-transparent">
                    <small class="text-muted">
                        <i class="fas fa-clock"></i> 
                        Créée le ${date}
                    </small>
                </div>
            </div>
        </div>
    `;
}

// Voir les détails d'une session
function viewSession(sessionId) {
    console.log('📋 Affichage de la session:', sessionId);
    alert(`Session ID: ${sessionId}\n\nCette fonctionnalité sera implémentée prochainement !`);
    // TODO: Implémenter la page de détails de session
}

// ===================================
// Fonctions de gestion de la base de données
// ===================================

// Handler pour initialiser la base de données
async function handleInitDatabase() {
    const dbStatus = document.getElementById('db-status');

    dbStatus.innerHTML = `
        <div class="alert alert-info">
            <i class="fas fa-spinner fa-spin"></i> Initialisation en cours...
        </div>
    `;

    try {
        await initializeDatabase();

        dbStatus.innerHTML = `
            <div class="alert alert-success">
                <i class="fas fa-check-circle"></i>
                <strong>✅ Base de données initialisée avec succès !</strong>
                <br>Rechargez la page pour voir les données.
            </div>
        `;

        // Recharger les sessions après 2 secondes
        setTimeout(() => {
            loadSessions();
        }, 2000);
    } catch (error) {
        dbStatus.innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-triangle"></i>
                <strong>❌ Erreur lors de l'initialisation</strong>
                <br><code>${error.message}</code>
            </div>
        `;
    }
}

// Handler pour vider la base de données
async function handleClearDatabase() {
    const dbStatus = document.getElementById('db-status');

    dbStatus.innerHTML = `
        <div class="alert alert-warning">
            <i class="fas fa-spinner fa-spin"></i> Suppression en cours...
        </div>
    `;

    try {
        const success = await clearDatabase();

        if (success) {
            dbStatus.innerHTML = `
                <div class="alert alert-success">
                    <i class="fas fa-check-circle"></i>
                    <strong>✅ Base de données vidée !</strong>
                    <br>Toutes les données ont été supprimées.
                </div>
            `;

            // Recharger les sessions
            setTimeout(() => {
                loadSessions();
            }, 1000);
        }
    } catch (error) {
        dbStatus.innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-triangle"></i>
                <strong>❌ Erreur lors de la suppression</strong>
                <br><code>${error.message}</code>
            </div>
        `;
    }
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

