// ===================================
// Statistiques Joueur
// ===================================

let allSessions = [];
let allMatches = [];
let allPlayers = [];
let allCharacters = [];
let selectedPlayerId = null;
let matchLimit = 10; // Nombre de matchs à afficher par défaut

// ===================================
// Initialisation
// ===================================

document.addEventListener('DOMContentLoaded', async () => {
    console.log('📊 Page Statistiques Joueur chargée');

    // Initialiser le système d'authentification
    initAuth();

    // Charger toutes les données
    await loadAllData();

    // Initialiser le sélecteur de joueur
    initPlayerSelector();

    // Initialiser le sélecteur de limite de matchs
    initMatchLimitSelector();

    // Cacher le loader
    hideLoader();
});

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

        // Charger tous les matchs de toutes les sessions
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
    }
}

// ===================================
// Sélecteur de joueur
// ===================================

function initPlayerSelector() {
    const select = document.getElementById('player-select');

    if (allPlayers.length === 0) {
        select.innerHTML = '<option value="">Aucun joueur trouvé</option>';
        return;
    }

    select.innerHTML = '<option value="">-- Sélectionnez un joueur --</option>' +
        allPlayers.map(player =>
            `<option value="${player.id}">${player.nickname || player.name}</option>`
        ).join('');

    select.addEventListener('change', (e) => {
        selectedPlayerId = e.target.value;
        if (selectedPlayerId) {
            displayPlayerStats(selectedPlayerId);
        } else {
            document.getElementById('stats-content').style.display = 'none';
            document.getElementById('no-player-selected').style.display = 'block';
        }
    });

    // Afficher le message "sélectionnez un joueur"
    document.getElementById('no-player-selected').style.display = 'block';
}

function initMatchLimitSelector() {
    const select = document.getElementById('match-limit-select');

    if (!select) return;

    select.addEventListener('change', (e) => {
        const value = e.target.value;
        matchLimit = value === 'all' ? 'all' : parseInt(value);

        // Rafraîchir l'affichage si un joueur est sélectionné
        if (selectedPlayerId) {
            const playerMatches = allMatches.filter(m =>
                m.player1?.id === selectedPlayerId || m.player2?.id === selectedPlayerId
            );
            displayRecentMatches(selectedPlayerId, playerMatches);
        }
    });
}

// ===================================
// Affichage des statistiques
// ===================================

function displayPlayerStats(playerId) {
    const player = allPlayers.find(p => p.id === playerId);
    if (!player) return;

    // Cacher le message et afficher le contenu
    document.getElementById('no-player-selected').style.display = 'none';
    document.getElementById('stats-content').style.display = 'block';

    // Calculer les stats
    const playerMatches = allMatches.filter(m =>
        m.player1?.id === playerId || m.player2?.id === playerId
    );

    const stats = calculatePlayerStats(playerId, playerMatches);

    // Afficher les différentes sections
    displayOverview(player, stats);
    displayCharacterStats(playerId, playerMatches);
    displayMatchups(playerId, playerMatches);
    displayAchievements(player, stats, playerMatches);
    displayRecentMatches(playerId, playerMatches);
}

// ===================================
// 1. Vue d'ensemble
// ===================================

function calculatePlayerStats(playerId, matches) {
    let wins = 0;
    let losses = 0;

    matches.forEach(match => {
        if (match.winner?.id === playerId) {
            wins++;
        } else {
            losses++;
        }
    });

    const total = wins + losses;
    const winrate = total > 0 ? (wins / total) * 100 : 0;

    // Calculer le classement
    const rankings = allPlayers.map(p => {
        const pMatches = allMatches.filter(m =>
            m.player1?.id === p.id || m.player2?.id === p.id
        );
        const pWins = pMatches.filter(m => m.winner?.id === p.id).length;
        const pTotal = pMatches.length;
        const pWinrate = pTotal > 0 ? (pWins / pTotal) * 100 : 0;

        return {
            id: p.id,
            wins: pWins,
            total: pTotal,
            winrate: pWinrate
        };
    }).filter(p => p.total > 0)
      .sort((a, b) => b.winrate - a.winrate || b.wins - a.wins);

    const rank = rankings.findIndex(r => r.id === playerId) + 1;

    return {
        wins,
        losses,
        total,
        winrate,
        rank,
        totalPlayers: rankings.length
    };
}

function displayOverview(player, stats) {
    document.getElementById('player-rank').textContent =
        `#${stats.rank} / ${stats.totalPlayers}`;

    document.getElementById('player-winrate').innerHTML =
        `<span class="${stats.winrate >= 50 ? 'text-success' : 'text-danger'}">${stats.winrate.toFixed(1)}%</span>`;

    document.getElementById('player-total-matches').textContent = stats.total;

    document.getElementById('player-wins-losses').innerHTML =
        `<span class="text-success">${stats.wins}</span> / <span class="text-danger">${stats.losses}</span>`;
}

// ===================================
// 2. Statistiques par personnage
// ===================================

function displayCharacterStats(playerId, matches) {
    const charStats = {};

    matches.forEach(match => {
        let charId = null;
        let won = false;

        if (match.player1?.id === playerId) {
            charId = match.player1?.character?.id;
            won = match.winner?.id === playerId;
        } else if (match.player2?.id === playerId) {
            charId = match.player2?.character?.id;
            won = match.winner?.id === playerId;
        }

        if (charId) {
            if (!charStats[charId]) {
                charStats[charId] = { wins: 0, losses: 0, total: 0 };
            }
            charStats[charId].total++;
            if (won) {
                charStats[charId].wins++;
            } else {
                charStats[charId].losses++;
            }
        }
    });

    // Convertir en tableau et trier
    const charArray = Object.entries(charStats).map(([charId, stats]) => {
        const char = allCharacters.find(c => c.id === charId);
        return {
            id: charId,
            name: char?.name || charId,
            icon: char?.images?.icon || '',
            ...stats,
            winrate: (stats.wins / stats.total) * 100
        };
    }).sort((a, b) => b.total - a.total);

    const container = document.getElementById('character-stats-container');

    if (charArray.length === 0) {
        container.innerHTML = '<p class="text-muted">Aucune donnée disponible</p>';
        return;
    }

    let html = `
        <div class="table-responsive">
            <table class="table table-hover">
                <thead>
                    <tr>
                        <th>Personnage</th>
                        <th class="text-center">Joué</th>
                        <th class="text-center">Victoires</th>
                        <th class="text-center">Défaites</th>
                        <th class="text-center">Winrate</th>
                    </tr>
                </thead>
                <tbody>
    `;

    charArray.forEach(char => {
        html += `
            <tr>
                <td>
                    <img src="${char.icon}" alt="${char.name}" style="width: 30px; height: 30px; margin-right: 8px;">
                    <strong>${char.name}</strong>
                </td>
                <td class="text-center">${char.total}</td>
                <td class="text-center text-success">${char.wins}</td>
                <td class="text-center text-danger">${char.losses}</td>
                <td class="text-center">
                    <span class="badge ${char.winrate >= 50 ? 'bg-success' : 'bg-danger'}">
                        ${char.winrate.toFixed(1)}%
                    </span>
                </td>
            </tr>
        `;
    });

    html += '</tbody></table></div>';
    container.innerHTML = html;
}

// ===================================
// 3. Matchups
// ===================================

function displayMatchups(playerId, matches) {
    const matchupStats = {};

    matches.forEach(match => {
        let opponentId = null;
        let won = false;

        if (match.player1?.id === playerId) {
            opponentId = match.player2?.id;
            won = match.winner?.id === playerId;
        } else if (match.player2?.id === playerId) {
            opponentId = match.player1?.id;
            won = match.winner?.id === playerId;
        }

        if (opponentId) {
            if (!matchupStats[opponentId]) {
                matchupStats[opponentId] = { wins: 0, losses: 0, total: 0 };
            }
            matchupStats[opponentId].total++;
            if (won) {
                matchupStats[opponentId].wins++;
            } else {
                matchupStats[opponentId].losses++;
            }
        }
    });

    // Convertir en tableau
    const matchupArray = Object.entries(matchupStats).map(([oppId, stats]) => {
        const opponent = allPlayers.find(p => p.id === oppId);
        return {
            id: oppId,
            name: opponent?.nickname || opponent?.name || oppId,
            ...stats,
            winrate: (stats.wins / stats.total) * 100
        };
    }).filter(m => m.total >= 3); // Au moins 3 matchs pour être significatif

    // Meilleurs matchups (winrate le plus élevé)
    const bestMatchups = [...matchupArray]
        .sort((a, b) => b.winrate - a.winrate || b.total - a.total)
        .slice(0, 5);

    // Pires matchups (winrate le plus faible)
    const worstMatchups = [...matchupArray]
        .sort((a, b) => a.winrate - b.winrate || b.total - a.total)
        .slice(0, 5);

    // Afficher les meilleurs matchups
    const bestContainer = document.getElementById('best-matchups-container');
    if (bestMatchups.length === 0) {
        bestContainer.innerHTML = '<p class="text-muted">Pas assez de données (minimum 3 matchs contre un adversaire)</p>';
    } else {
        bestContainer.innerHTML = bestMatchups.map(m => `
            <div class="d-flex justify-content-between align-items-center mb-2 p-2 border-bottom">
                <div>
                    <strong>${m.name}</strong>
                    <br>
                    <small class="text-muted">${m.wins}V - ${m.losses}D (${m.total} matchs)</small>
                </div>
                <span class="badge bg-success fs-6">${m.winrate.toFixed(0)}%</span>
            </div>
        `).join('');
    }

    // Afficher les pires matchups
    const worstContainer = document.getElementById('worst-matchups-container');
    if (worstMatchups.length === 0) {
        worstContainer.innerHTML = '<p class="text-muted">Pas assez de données (minimum 3 matchs contre un adversaire)</p>';
    } else {
        worstContainer.innerHTML = worstMatchups.map(m => `
            <div class="d-flex justify-content-between align-items-center mb-2 p-2 border-bottom">
                <div>
                    <strong>${m.name}</strong>
                    <br>
                    <small class="text-muted">${m.wins}V - ${m.losses}D (${m.total} matchs)</small>
                </div>
                <span class="badge bg-danger fs-6">${m.winrate.toFixed(0)}%</span>
            </div>
        `).join('');
    }
}


// ===================================
// 4. Records & Achievements
// ===================================

function displayAchievements(player, stats, matches) {
    const achievements = [];

    // Calculer les séries de victoires/défaites
    const streaks = calculateStreaks(player.id, matches);

    // Calculer les stats par personnage pour trouver le main
    const charStats = {};
    matches.forEach(match => {
        let charId = null;
        if (match.player1?.id === player.id) {
            charId = match.player1?.character?.id;
        } else if (match.player2?.id === player.id) {
            charId = match.player2?.character?.id;
        }
        if (charId) {
            charStats[charId] = (charStats[charId] || 0) + 1;
        }
    });

    const mainChar = Object.entries(charStats).sort((a, b) => b[1] - a[1])[0];
    const mainCharData = mainChar ? allCharacters.find(c => c.id === mainChar[0]) : null;

    // 🏆 ACHIEVEMENTS

    // Série de victoires actuelle
    if (streaks.currentWinStreak > 0) {
        achievements.push({
            icon: 'fa-fire',
            color: 'danger',
            title: 'En feu !',
            description: `Série de ${streaks.currentWinStreak} victoire${streaks.currentWinStreak > 1 ? 's' : ''} en cours`,
            value: streaks.currentWinStreak
        });
    }

    // Meilleure série de victoires
    if (streaks.maxWinStreak >= 3) {
        achievements.push({
            icon: 'fa-trophy',
            color: 'warning',
            title: 'Série record',
            description: `Meilleure série : ${streaks.maxWinStreak} victoires consécutives`,
            value: streaks.maxWinStreak
        });
    }

    // Main character
    if (mainCharData && mainChar[1] >= 5) {
        achievements.push({
            icon: 'fa-star',
            color: 'primary',
            title: 'Main',
            description: `${mainCharData.name} (${mainChar[1]} matchs)`,
            image: mainCharData.images?.icon
        });
    }

    // Winrate élevé
    if (stats.total >= 10 && stats.winrate >= 70) {
        achievements.push({
            icon: 'fa-crown',
            color: 'warning',
            title: 'Dominateur',
            description: `${stats.winrate.toFixed(1)}% de winrate sur ${stats.total} matchs`,
            value: `${stats.winrate.toFixed(0)}%`
        });
    }

    // Joueur actif
    if (stats.total >= 50) {
        achievements.push({
            icon: 'fa-gamepad',
            color: 'info',
            title: 'Joueur actif',
            description: `${stats.total} matchs joués`,
            value: stats.total
        });
    }

    // Polyvalent (joue beaucoup de personnages différents)
    const uniqueChars = Object.keys(charStats).length;
    if (uniqueChars >= 10) {
        achievements.push({
            icon: 'fa-users',
            color: 'success',
            title: 'Polyvalent',
            description: `${uniqueChars} personnages différents joués`,
            value: uniqueChars
        });
    }

    // Premier du classement
    if (stats.rank === 1 && stats.totalPlayers > 1) {
        achievements.push({
            icon: 'fa-medal',
            color: 'warning',
            title: 'Champion',
            description: `1er du classement !`,
            value: '#1'
        });
    }

    // Underdog (winrate faible mais continue de jouer)
    if (stats.total >= 10 && stats.winrate < 40) {
        achievements.push({
            icon: 'fa-heart',
            color: 'danger',
            title: 'Persévérant',
            description: `Continue malgré les défaites`,
            value: '💪'
        });
    }

    // Équilibré (winrate proche de 50%)
    if (stats.total >= 10 && stats.winrate >= 45 && stats.winrate <= 55) {
        achievements.push({
            icon: 'fa-balance-scale',
            color: 'secondary',
            title: 'Équilibré',
            description: `Matchs très serrés (${stats.winrate.toFixed(1)}%)`,
            value: '⚖️'
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
                        ${achievement.image ?
                            `<img src="${achievement.image}" alt="${achievement.title}" style="width: 60px; height: 60px; margin-bottom: 10px;">` :
                            `<i class="fas ${achievement.icon} fa-3x text-${achievement.color} mb-3"></i>`
                        }
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

function calculateStreaks(playerId, matches) {
    // Trier les matchs par date
    const sortedMatches = [...matches].sort((a, b) => {
        const dateA = a.date ? new Date(a.date) : new Date(0);
        const dateB = b.date ? new Date(b.date) : new Date(0);
        return dateA - dateB;
    });

    let currentWinStreak = 0;
    let currentLossStreak = 0;
    let maxWinStreak = 0;
    let maxLossStreak = 0;
    let tempWinStreak = 0;
    let tempLossStreak = 0;

    sortedMatches.forEach(match => {
        const won = match.winner?.id === playerId;

        if (won) {
            tempWinStreak++;
            tempLossStreak = 0;
            maxWinStreak = Math.max(maxWinStreak, tempWinStreak);
        } else {
            tempLossStreak++;
            tempWinStreak = 0;
            maxLossStreak = Math.max(maxLossStreak, tempLossStreak);
        }
    });

    // La série actuelle est la dernière série
    currentWinStreak = tempWinStreak;
    currentLossStreak = tempLossStreak;

    return {
        currentWinStreak,
        currentLossStreak,
        maxWinStreak,
        maxLossStreak
    };
}


// ===================================
// 5. Historique récent
// ===================================

function displayRecentMatches(playerId, matches) {
    const container = document.getElementById('recent-matches-container');

    if (matches.length === 0) {
        container.innerHTML = '<p class="text-muted p-3">Aucun match trouvé</p>';
        return;
    }

    // Trier par date (plus récent en premier)
    const sortedMatches = [...matches].sort((a, b) => {
        const dateA = a.date ? new Date(a.date) : new Date(0);
        const dateB = b.date ? new Date(b.date) : new Date(0);
        return dateB - dateA;
    });

    // Appliquer la limite
    const recentMatches = matchLimit === 'all' ? sortedMatches : sortedMatches.slice(0, matchLimit);

    let html = '<div class="match-history-list">';

    recentMatches.forEach((match, index) => {
        const isPlayer1 = match.player1?.id === playerId;
        const playerChar = isPlayer1 ? match.player1?.character : match.player2?.character;
        const opponentChar = isPlayer1 ? match.player2?.character : match.player1?.character;
        const opponentId = isPlayer1 ? match.player2?.id : match.player1?.id;
        const opponent = allPlayers.find(p => p.id === opponentId);
        const won = match.winner?.id === playerId;

        const playerCharData = allCharacters.find(c => c.id === playerChar?.id);
        const opponentCharData = allCharacters.find(c => c.id === opponentChar?.id);

        const date = match.date ? new Date(match.date).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        }) : 'Date inconnue';

        html += `
            <div class="match-history-item ${won ? 'match-win' : 'match-loss'}">
                <!-- Version Desktop -->
                <div class="match-history-desktop">
                    <div class="match-result-badge">
                        <span class="badge ${won ? 'bg-success' : 'bg-danger'}">
                            ${won ? 'V' : 'D'}
                        </span>
                    </div>
                    <div class="match-characters">
                        <div class="match-char-player">
                            ${playerCharData?.images?.icon ?
                                `<img src="${playerCharData.images.icon}" alt="${playerCharData.name}" class="char-icon">` :
                                ''
                            }
                            <span class="char-name fw-bold">${playerChar?.name || '?'}</span>
                        </div>
                        <span class="match-vs">vs</span>
                        <div class="match-char-opponent">
                            ${opponentCharData?.images?.icon ?
                                `<img src="${opponentCharData.images.icon}" alt="${opponentCharData.name}" class="char-icon">` :
                                ''
                            }
                            <span class="char-name">${opponentChar?.name || '?'}</span>
                        </div>
                    </div>
                    <div class="match-opponent">
                        <span class="text-muted">${opponent?.nickname || opponent?.name || 'Inconnu'}</span>
                    </div>
                    <div class="match-info">
                        <div class="match-score fw-bold">${match.score || '?-?'}</div>
                        <small class="match-date text-muted">${date}</small>
                    </div>
                </div>

                <!-- Version Mobile -->
                <div class="match-history-mobile">
                    <div class="match-mobile-header">
                        <span class="badge ${won ? 'bg-success' : 'bg-danger'} me-2">
                            ${won ? 'VICTOIRE' : 'DÉFAITE'}
                        </span>
                        <span class="match-score-mobile fw-bold">${match.score || '?-?'}</span>
                        <small class="match-date-mobile text-muted ms-auto">${date}</small>
                    </div>
                    <div class="match-mobile-body">
                        <div class="match-mobile-char">
                            ${playerCharData?.images?.icon ?
                                `<img src="${playerCharData.images.icon}" alt="${playerCharData.name}" class="char-icon-mobile">` :
                                ''
                            }
                            <span class="fw-bold">${playerChar?.name || '?'}</span>
                        </div>
                        <span class="match-vs-mobile">vs</span>
                        <div class="match-mobile-char">
                            ${opponentCharData?.images?.icon ?
                                `<img src="${opponentCharData.images.icon}" alt="${opponentCharData.name}" class="char-icon-mobile">` :
                                ''
                            }
                            <span>${opponentChar?.name || '?'}</span>
                        </div>
                    </div>
                    <div class="match-mobile-footer">
                        <small class="text-muted">vs ${opponent?.nickname || opponent?.name || 'Inconnu'}</small>
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
    document.getElementById('stats-loader').style.display = 'block';
    document.getElementById('stats-content').style.display = 'none';
    document.getElementById('no-player-selected').style.display = 'none';
}

function hideLoader() {
    document.getElementById('stats-loader').style.display = 'none';
}

