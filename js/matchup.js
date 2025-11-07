// ===================================
// Page Matchup - Stats entre 2 joueurs
// ===================================

let allSessions = [];
let allMatches = [];
let allPlayers = [];
let allCharacters = [];
let player1Id = null;
let player2Id = null;
let matchupMatches = [];
let matchLimit = 'all';

// ===================================
// Initialisation
// ===================================

document.addEventListener('DOMContentLoaded', async () => {
    console.log('⚔️ Page Matchup chargée');

    // Initialiser le système d'authentification
    initAuth();

    // Charger les joueurs pour les sélecteurs
    try {
        await loadPlayersForSelectors();
    } catch (error) {
        console.error('❌ Erreur lors du chargement des joueurs:', error);
    }

    // Récupérer les IDs des joueurs depuis l'URL
    const urlParams = new URLSearchParams(window.location.search);
    player1Id = urlParams.get('player1');
    player2Id = urlParams.get('player2');

    // Si les joueurs sont fournis dans l'URL, charger le matchup
    if (player1Id && player2Id) {
        if (player1Id === player2Id) {
            showError('Vous devez sélectionner deux joueurs différents.');
            document.getElementById('player-selector-card').style.display = 'block';
            return;
        }

        // Pré-sélectionner les joueurs dans les dropdowns
        document.getElementById('player1-selector').value = player1Id;
        document.getElementById('player2-selector').value = player2Id;

        // Charger le matchup
        await loadMatchup();
    } else {
        // Afficher le sélecteur
        document.getElementById('player-selector-card').style.display = 'block';
    }
});

// ===================================
// Chargement des joueurs pour les sélecteurs
// ===================================

async function loadPlayersForSelectors() {
    const playersSnapshot = await db.collection('users').get();
    const players = playersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));

    // Trier par ordre alphabétique
    players.sort((a, b) => {
        const nameA = (a.nickname || a.name || '').toLowerCase();
        const nameB = (b.nickname || b.name || '').toLowerCase();
        return nameA.localeCompare(nameB);
    });

    // Remplir les sélecteurs
    const player1Select = document.getElementById('player1-selector');
    const player2Select = document.getElementById('player2-selector');

    players.forEach(player => {
        const option1 = document.createElement('option');
        option1.value = player.id;
        option1.textContent = player.nickname || player.name;
        player1Select.appendChild(option1);

        const option2 = document.createElement('option');
        option2.value = player.id;
        option2.textContent = player.nickname || player.name;
        player2Select.appendChild(option2);
    });

    // Gérer les changements de sélection
    const checkSelection = () => {
        const p1 = player1Select.value;
        const p2 = player2Select.value;
        const btn = document.getElementById('load-matchup-btn');

        if (p1 && p2 && p1 !== p2) {
            btn.disabled = false;
        } else {
            btn.disabled = true;
        }
    };

    player1Select.addEventListener('change', checkSelection);
    player2Select.addEventListener('change', checkSelection);

    // Gérer le clic sur le bouton
    document.getElementById('load-matchup-btn').addEventListener('click', async () => {
        player1Id = player1Select.value;
        player2Id = player2Select.value;

        if (!player1Id || !player2Id || player1Id === player2Id) {
            return;
        }

        // Mettre à jour l'URL
        const newUrl = `${window.location.pathname}?player1=${player1Id}&player2=${player2Id}`;
        window.history.pushState({}, '', newUrl);

        // Masquer le sélecteur
        document.getElementById('player-selector-card').style.display = 'none';

        // Charger le matchup
        await loadMatchup();
    });
}

// ===================================
// Chargement du matchup
// ===================================

async function loadMatchup() {
    showLoader();

    try {
        // Charger toutes les données
        await loadAllData();

        // Vérifier que les joueurs existent
        const player1 = allPlayers.find(p => p.id === player1Id);
        const player2 = allPlayers.find(p => p.id === player2Id);

        if (!player1 || !player2) {
            showError('Un ou plusieurs joueurs introuvables.');
            return;
        }

        // Filtrer les matchs entre ces deux joueurs
        matchupMatches = allMatches.filter(m =>
            (m.player1?.id === player1Id && m.player2?.id === player2Id) ||
            (m.player1?.id === player2Id && m.player2?.id === player1Id)
        );

        if (matchupMatches.length === 0) {
            showError('Aucun match trouvé entre ces deux joueurs.');
            document.getElementById('player-selector-card').style.display = 'block';
            return;
        }

        // Initialiser le sélecteur de limite
        initMatchLimitSelector();

        // Afficher les statistiques
        displayMatchupStats(player1, player2);

        // Cacher le loader et afficher le contenu
        hideLoader();
        document.getElementById('matchup-content').style.display = 'block';
    } catch (error) {
        console.error('❌ Erreur lors du chargement des données:', error);
        showError('Erreur lors du chargement des données: ' + error.message);
    }
}

// ===================================
// Chargement des données
// ===================================

async function loadAllData() {
    try {
        showLoader();

        // Charger tous les joueurs
        const usersSnapshot = await db.collection('users').orderBy('nickname').get();
        allPlayers = usersSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        // Charger tous les personnages
        const charactersSnapshot = await db.collection('characters').orderBy('number').get();
        allCharacters = charactersSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        // Charger toutes les sessions
        const sessionsSnapshot = await db.collection('sessions').get();
        allSessions = sessionsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        // Charger tous les matchs
        allMatches = [];
        for (const session of allSessions) {
            const matchesSnapshot = await db.collection('sessions')
                .doc(session.id)
                .collection('matches')
                .get();

            matchesSnapshot.forEach(doc => {
                allMatches.push({
                    id: doc.id,
                    sessionId: session.id,
                    sessionName: session.name,
                    ...doc.data()
                });
            });
        }

        console.log(`✅ Données chargées: ${allPlayers.length} joueurs, ${allMatches.length} matchs`);

    } catch (error) {
        console.error('❌ Erreur lors du chargement des données:', error);
        showError('Erreur lors du chargement des données.');
    }
}

// ===================================
// Sélecteur de limite de matchs
// ===================================

function initMatchLimitSelector() {
    const select = document.getElementById('matchup-match-limit-select');

    if (!select) return;

    select.addEventListener('change', (e) => {
        const value = e.target.value;
        matchLimit = value === 'all' ? 'all' : parseInt(value);

        // Rafraîchir l'affichage de l'historique
        displayMatchHistory();
    });
}

// ===================================
// Affichage des statistiques
// ===================================

function displayMatchupStats(player1, player2) {
    // Calculer les stats
    const stats = calculateMatchupStats(player1, player2);

    // Afficher l'en-tête
    displayHeader(player1, player2, stats);

    // Afficher la vue d'ensemble
    displayOverview(stats);

    // Afficher les personnages
    displayCharacters(player1, player2, stats);

    // Afficher les achievements
    displayAchievements(player1, player2, stats);

    // Afficher l'historique
    displayMatchHistory();

    // Afficher le contenu
    document.getElementById('matchup-content').style.display = 'block';
}

function calculateMatchupStats(player1, player2) {
    let player1Wins = 0;
    let player2Wins = 0;

    // Calculer les victoires
    matchupMatches.forEach(match => {
        if (match.winner?.id === player1.id) {
            player1Wins++;
        } else if (match.winner?.id === player2.id) {
            player2Wins++;
        }
    });

    // Calculer les séries
    const streaks = calculateStreaks(player1.id, player2.id);

    // Dernier match
    const sortedMatches = [...matchupMatches].sort((a, b) => {
        const dateA = a.date ? new Date(a.date) : new Date(0);
        const dateB = b.date ? new Date(b.date) : new Date(0);
        return dateB - dateA;
    });
    const lastMatch = sortedMatches[0];
    const lastMatchDate = lastMatch?.date ? new Date(lastMatch.date).toLocaleDateString('fr-FR') : 'Inconnu';

    // Stats par personnage
    const player1CharStats = {};
    const player2CharStats = {};

    matchupMatches.forEach(match => {
        if (match.player1?.id === player1.id) {
            const charId = match.player1?.character?.id;
            if (charId) {
                if (!player1CharStats[charId]) {
                    player1CharStats[charId] = { wins: 0, losses: 0, total: 0 };
                }
                player1CharStats[charId].total++;
                if (match.winner?.id === player1.id) {
                    player1CharStats[charId].wins++;
                } else {
                    player1CharStats[charId].losses++;
                }
            }
        } else if (match.player2?.id === player1.id) {
            const charId = match.player2?.character?.id;
            if (charId) {
                if (!player1CharStats[charId]) {
                    player1CharStats[charId] = { wins: 0, losses: 0, total: 0 };
                }
                player1CharStats[charId].total++;
                if (match.winner?.id === player1.id) {
                    player1CharStats[charId].wins++;
                } else {
                    player1CharStats[charId].losses++;
                }
            }
        }

        if (match.player1?.id === player2.id) {
            const charId = match.player1?.character?.id;
            if (charId) {
                if (!player2CharStats[charId]) {
                    player2CharStats[charId] = { wins: 0, losses: 0, total: 0 };
                }
                player2CharStats[charId].total++;
                if (match.winner?.id === player2.id) {
                    player2CharStats[charId].wins++;
                } else {
                    player2CharStats[charId].losses++;
                }
            }
        } else if (match.player2?.id === player2.id) {
            const charId = match.player2?.character?.id;
            if (charId) {
                if (!player2CharStats[charId]) {
                    player2CharStats[charId] = { wins: 0, losses: 0, total: 0 };
                }
                player2CharStats[charId].total++;
                if (match.winner?.id === player2.id) {
                    player2CharStats[charId].wins++;
                } else {
                    player2CharStats[charId].losses++;
                }
            }
        }
    });

    return {
        player1Wins,
        player2Wins,
        totalMatches: matchupMatches.length,
        streaks,
        lastMatchDate,
        player1CharStats,
        player2CharStats
    };
}

function calculateStreaks(player1Id, player2Id) {
    // Trier les matchs par date
    const sortedMatches = [...matchupMatches].sort((a, b) => {
        const dateA = a.date ? new Date(a.date) : new Date(0);
        const dateB = b.date ? new Date(b.date) : new Date(0);
        return dateA - dateB;
    });

    let currentStreakPlayer = null;
    let currentStreakCount = 0;
    let maxStreakPlayer1 = 0;
    let maxStreakPlayer2 = 0;
    let tempStreakPlayer1 = 0;
    let tempStreakPlayer2 = 0;

    sortedMatches.forEach(match => {
        const winnerId = match.winner?.id;

        if (winnerId === player1Id) {
            tempStreakPlayer1++;
            tempStreakPlayer2 = 0;
            maxStreakPlayer1 = Math.max(maxStreakPlayer1, tempStreakPlayer1);
        } else if (winnerId === player2Id) {
            tempStreakPlayer2++;
            tempStreakPlayer1 = 0;
            maxStreakPlayer2 = Math.max(maxStreakPlayer2, tempStreakPlayer2);
        }
    });

    // Série actuelle
    if (tempStreakPlayer1 > 0) {
        currentStreakPlayer = player1Id;
        currentStreakCount = tempStreakPlayer1;
    } else if (tempStreakPlayer2 > 0) {
        currentStreakPlayer = player2Id;
        currentStreakCount = tempStreakPlayer2;
    }

    return {
        currentStreakPlayer,
        currentStreakCount,
        maxStreakPlayer1,
        maxStreakPlayer2
    };
}

// ===================================
// Affichage de l'en-tête
// ===================================

function displayHeader(player1, player2, stats) {
    document.getElementById('player1-name').textContent = player1.nickname || player1.name;
    document.getElementById('player2-name').textContent = player2.nickname || player2.name;

    const player1Winrate = stats.totalMatches > 0 ? (stats.player1Wins / stats.totalMatches * 100).toFixed(1) : 0;
    const player2Winrate = stats.totalMatches > 0 ? (stats.player2Wins / stats.totalMatches * 100).toFixed(1) : 0;

    document.getElementById('player1-stats').innerHTML = `${stats.player1Wins} victoires (${player1Winrate}%)`;
    document.getElementById('player2-stats').innerHTML = `${stats.player2Wins} victoires (${player2Winrate}%)`;

    document.getElementById('matchup-score').textContent = `${stats.player1Wins} - ${stats.player2Wins}`;
}

// ===================================
// Affichage de la vue d'ensemble
// ===================================

function displayOverview(stats) {
    document.getElementById('total-matches').textContent = stats.totalMatches;

    // Série actuelle
    if (stats.streaks.currentStreakPlayer) {
        const player = allPlayers.find(p => p.id === stats.streaks.currentStreakPlayer);
        const playerName = player?.nickname || player?.name || 'Inconnu';
        document.getElementById('current-streak').innerHTML = `
            <span class="text-danger">${stats.streaks.currentStreakCount}</span>
            <br>
            <small class="text-muted">${playerName}</small>
        `;
    } else {
        document.getElementById('current-streak').textContent = '-';
    }

    // Meilleure série
    const maxStreak = Math.max(stats.streaks.maxStreakPlayer1, stats.streaks.maxStreakPlayer2);
    const maxStreakPlayer = stats.streaks.maxStreakPlayer1 >= stats.streaks.maxStreakPlayer2 ? player1Id : player2Id;
    const maxStreakPlayerData = allPlayers.find(p => p.id === maxStreakPlayer);
    const maxStreakPlayerName = maxStreakPlayerData?.nickname || maxStreakPlayerData?.name || 'Inconnu';

    document.getElementById('best-streak').innerHTML = `
        <span class="text-warning">${maxStreak}</span>
        <br>
        <small class="text-muted">${maxStreakPlayerName}</small>
    `;

    // Dernier match
    document.getElementById('last-match-date').textContent = stats.lastMatchDate;
}

// ===================================
// Affichage des personnages
// ===================================

function displayCharacters(player1, player2, stats) {
    // Header
    document.getElementById('player1-char-header').textContent = player1.nickname || player1.name;
    document.getElementById('player2-char-header').textContent = player2.nickname || player2.name;

    // Player 1 characters
    const player1CharArray = Object.entries(stats.player1CharStats).map(([charId, charStats]) => {
        const char = allCharacters.find(c => c.id === charId);
        return {
            id: charId,
            name: char?.name || charId,
            icon: char?.images?.icon || '',
            ...charStats,
            winrate: (charStats.wins / charStats.total) * 100
        };
    }).sort((a, b) => b.total - a.total);

    const player1Container = document.getElementById('player1-characters');
    if (player1CharArray.length === 0) {
        player1Container.innerHTML = '<p class="text-muted">Aucune donnée</p>';
    } else {
        player1Container.innerHTML = player1CharArray.map(char => `
            <div class="d-flex justify-content-between align-items-center mb-2 p-2 border-bottom">
                <div class="d-flex align-items-center gap-2">
                    <img src="${char.icon}" alt="${char.name}" style="width: 30px; height: 30px;">
                    <strong>${char.name}</strong>
                </div>
                <div class="text-end">
                    <span class="badge ${char.winrate >= 50 ? 'bg-success' : 'bg-danger'}">
                        ${char.wins}V - ${char.losses}D
                    </span>
                    <br>
                    <small class="text-muted">${char.winrate.toFixed(0)}%</small>
                </div>
            </div>
        `).join('');
    }

    // Player 2 characters
    const player2CharArray = Object.entries(stats.player2CharStats).map(([charId, charStats]) => {
        const char = allCharacters.find(c => c.id === charId);
        return {
            id: charId,
            name: char?.name || charId,
            icon: char?.images?.icon || '',
            ...charStats,
            winrate: (charStats.wins / charStats.total) * 100
        };
    }).sort((a, b) => b.total - a.total);

    const player2Container = document.getElementById('player2-characters');
    if (player2CharArray.length === 0) {
        player2Container.innerHTML = '<p class="text-muted">Aucune donnée</p>';
    } else {
        player2Container.innerHTML = player2CharArray.map(char => `
            <div class="d-flex justify-content-between align-items-center mb-2 p-2 border-bottom">
                <div class="d-flex align-items-center gap-2">
                    <img src="${char.icon}" alt="${char.name}" style="width: 30px; height: 30px;">
                    <strong>${char.name}</strong>
                </div>
                <div class="text-end">
                    <span class="badge ${char.winrate >= 50 ? 'bg-success' : 'bg-danger'}">
                        ${char.wins}V - ${char.losses}D
                    </span>
                    <br>
                    <small class="text-muted">${char.winrate.toFixed(0)}%</small>
                </div>
            </div>
        `).join('');
    }
}



// ===================================
// Affichage des Achievements
// ===================================

function displayAchievements(player1, player2, stats) {
    const achievements = [];

    const player1Name = player1.nickname || player1.name;
    const player2Name = player2.nickname || player2.name;

    // Domination (winrate très élevé)
    const player1Winrate = (stats.player1Wins / stats.totalMatches) * 100;
    const player2Winrate = (stats.player2Wins / stats.totalMatches) * 100;

    if (player1Winrate >= 70 && stats.totalMatches >= 5) {
        achievements.push({
            icon: 'fa-crown',
            color: 'warning',
            title: 'Domination',
            description: `${player1Name} domine ce matchup avec ${player1Winrate.toFixed(0)}% de victoires`,
            value: `${player1Winrate.toFixed(0)}%`
        });
    } else if (player2Winrate >= 70 && stats.totalMatches >= 5) {
        achievements.push({
            icon: 'fa-crown',
            color: 'warning',
            title: 'Domination',
            description: `${player2Name} domine ce matchup avec ${player2Winrate.toFixed(0)}% de victoires`,
            value: `${player2Winrate.toFixed(0)}%`
        });
    }

    // Bête noire / Némésis
    if (player1Winrate >= 60 && stats.totalMatches >= 5) {
        achievements.push({
            icon: 'fa-skull',
            color: 'danger',
            title: 'Bête noire',
            description: `${player1Name} est la bête noire de ${player2Name}`,
            value: '💀'
        });
    } else if (player2Winrate >= 60 && stats.totalMatches >= 5) {
        achievements.push({
            icon: 'fa-skull',
            color: 'danger',
            title: 'Bête noire',
            description: `${player2Name} est la bête noire de ${player1Name}`,
            value: '💀'
        });
    }

    // Rivalité équilibrée
    if (Math.abs(player1Winrate - player2Winrate) <= 10 && stats.totalMatches >= 10) {
        achievements.push({
            icon: 'fa-balance-scale',
            color: 'secondary',
            title: 'Rivalité équilibrée',
            description: `Matchup très serré entre ${player1Name} et ${player2Name}`,
            value: '⚖️'
        });
    }

    // Série impressionnante
    if (stats.streaks.maxStreakPlayer1 >= 5) {
        achievements.push({
            icon: 'fa-fire',
            color: 'danger',
            title: 'Série de feu',
            description: `${player1Name} a enchaîné ${stats.streaks.maxStreakPlayer1} victoires consécutives`,
            value: stats.streaks.maxStreakPlayer1
        });
    }
    if (stats.streaks.maxStreakPlayer2 >= 5) {
        achievements.push({
            icon: 'fa-fire',
            color: 'danger',
            title: 'Série de feu',
            description: `${player2Name} a enchaîné ${stats.streaks.maxStreakPlayer2} victoires consécutives`,
            value: stats.streaks.maxStreakPlayer2
        });
    }

    // Matchup actif
    if (stats.totalMatches >= 20) {
        achievements.push({
            icon: 'fa-gamepad',
            color: 'info',
            title: 'Matchup actif',
            description: `${stats.totalMatches} matchs joués entre ces deux joueurs`,
            value: stats.totalMatches
        });
    }

    // Matchup légendaire
    if (stats.totalMatches >= 50) {
        achievements.push({
            icon: 'fa-star',
            color: 'warning',
            title: 'Matchup légendaire',
            description: `Plus de 50 matchs joués ! Une vraie rivalité`,
            value: '⭐'
        });
    }

    // Afficher les achievements
    const container = document.getElementById('achievements-container');

    if (achievements.length === 0) {
        container.innerHTML = `
            <div class="alert alert-info">
                <i class="fas fa-info-circle"></i>
                Continuez à jouer pour débloquer des achievements !
            </div>
        `;
        return;
    }

    let html = '<div class="row">';

    achievements.forEach(achievement => {
        html += `
            <div class="col-md-4 col-sm-6 mb-3">
                <div class="card h-100 border-${achievement.color}">
                    <div class="card-body text-center">
                        <i class="fas ${achievement.icon} fa-3x text-${achievement.color} mb-3"></i>
                        <h5 class="card-title">${achievement.title}</h5>
                        <p class="card-text text-muted">${achievement.description}</p>
                        ${achievement.value ? `<h3 class="text-${achievement.color}">${achievement.value}</h3>` : ''}
                    </div>
                </div>
            </div>
        `;
    });

    html += '</div>';
    container.innerHTML = html;
}

// ===================================
// Affichage de l'historique
// ===================================

function displayMatchHistory() {
    const container = document.getElementById('matchup-history-container');

    if (matchupMatches.length === 0) {
        container.innerHTML = '<p class="text-muted p-3">Aucun match trouvé</p>';
        return;
    }

    // Trier par date (plus récent en premier)
    const sortedMatches = [...matchupMatches].sort((a, b) => {
        const dateA = a.date ? new Date(a.date) : new Date(0);
        const dateB = b.date ? new Date(b.date) : new Date(0);
        return dateB - dateA;
    });

    // Appliquer la limite
    const displayMatches = matchLimit === 'all' ? sortedMatches : sortedMatches.slice(0, matchLimit);

    let html = '<div class="match-history-list">';

    displayMatches.forEach(match => {
        const player1Char = match.player1?.character;
        const player2Char = match.player2?.character;
        const winnerId = match.winner?.id;

        const player1CharData = allCharacters.find(c => c.id === player1Char?.id);
        const player2CharData = allCharacters.find(c => c.id === player2Char?.id);

        const player1Data = allPlayers.find(p => p.id === match.player1?.id);
        const player2Data = allPlayers.find(p => p.id === match.player2?.id);

        const player1Won = winnerId === match.player1?.id;

        const date = match.date ? new Date(match.date).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        }) : 'Date inconnue';

        html += `
            <div class="match-history-item">
                <!-- Version Desktop -->
                <div class="match-history-desktop">
                    <div class="match-result-badge">
                        <span class="badge ${player1Won ? 'bg-success' : 'bg-danger'}">
                            ${player1Won ? 'V' : 'D'}
                        </span>
                    </div>
                    <div class="match-characters">
                        <div class="match-char-player">
                            ${player1CharData?.images?.icon ?
                                `<img src="${player1CharData.images.icon}" alt="${player1CharData.name}" class="char-icon">` :
                                ''
                            }
                            <span class="char-name fw-bold">${player1Char?.name || '?'}</span>
                            <small class="text-muted">(${player1Data?.nickname || player1Data?.name || '?'})</small>
                        </div>
                        <span class="match-vs">vs</span>
                        <div class="match-char-opponent">
                            ${player2CharData?.images?.icon ?
                                `<img src="${player2CharData.images.icon}" alt="${player2CharData.name}" class="char-icon">` :
                                ''
                            }
                            <span class="char-name">${player2Char?.name || '?'}</span>
                            <small class="text-muted">(${player2Data?.nickname || player2Data?.name || '?'})</small>
                        </div>
                    </div>
                    <div class="match-info">
                        <div class="match-score fw-bold">${match.score || '?-?'}</div>
                        <small class="match-date text-muted">${date}</small>
                    </div>
                </div>

                <!-- Version Mobile -->
                <div class="match-history-mobile">
                    <div class="match-mobile-header">
                        <span class="badge ${player1Won ? 'bg-success' : 'bg-danger'} me-2">
                            ${player1Won ? 'VICTOIRE' : 'DÉFAITE'}
                        </span>
                        <span class="match-score-mobile fw-bold">${match.score || '?-?'}</span>
                        <small class="match-date-mobile text-muted ms-auto">${date}</small>
                    </div>
                    <div class="match-mobile-body">
                        <div class="match-mobile-char">
                            ${player1CharData?.images?.icon ?
                                `<img src="${player1CharData.images.icon}" alt="${player1CharData.name}" class="char-icon-mobile">` :
                                ''
                            }
                            <span class="fw-bold">${player1Char?.name || '?'}</span>
                        </div>
                        <span class="match-vs-mobile">vs</span>
                        <div class="match-mobile-char">
                            ${player2CharData?.images?.icon ?
                                `<img src="${player2CharData.images.icon}" alt="${player2CharData.name}" class="char-icon-mobile">` :
                                ''
                            }
                            <span>${player2Char?.name || '?'}</span>
                        </div>
                    </div>
                    <div class="match-mobile-footer">
                        <small class="text-muted">${player1Data?.nickname || player1Data?.name || '?'} vs ${player2Data?.nickname || player2Data?.name || '?'}</small>
                    </div>
                </div>
            </div>
        `;
    });

    html += '</div>';

    // Ajouter un message si tous les matchs sont affichés
    if (matchLimit !== 'all' && sortedMatches.length > matchLimit) {
        html += `
            <div class="p-3 text-center text-muted">
                <small>Affichage de ${matchLimit} matchs sur ${sortedMatches.length} au total</small>
            </div>
        `;
    } else if (matchLimit === 'all') {
        html += `
            <div class="p-3 text-center text-muted">
                <small>Tous les matchs affichés (${sortedMatches.length})</small>
            </div>
        `;
    }

    container.innerHTML = html;
}

// ===================================
// Utilitaires
// ===================================

function showLoader() {
    document.getElementById('matchup-loader').style.display = 'block';
    document.getElementById('matchup-content').style.display = 'none';
    document.getElementById('matchup-error').style.display = 'none';
}

function hideLoader() {
    document.getElementById('matchup-loader').style.display = 'none';
}

function showError(message) {
    document.getElementById('error-message').textContent = message;
    document.getElementById('matchup-error').style.display = 'block';
    document.getElementById('matchup-loader').style.display = 'none';
    document.getElementById('matchup-content').style.display = 'none';
}
