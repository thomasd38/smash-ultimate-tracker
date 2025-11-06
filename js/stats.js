// ===================================
// Statistiques Globales
// ===================================

let allSessions = [];
let allMatches = [];
let allPlayers = [];
let allCharacters = [];

// ===================================
// Initialisation
// ===================================

document.addEventListener('DOMContentLoaded', async () => {
    console.log('📊 Page Statistiques chargée');

    // Initialiser le système d'authentification
    initAuth();

    // Charger toutes les données
    await loadAllData();

    // Calculer et afficher les statistiques
    calculateAndDisplayStats();
});

// ===================================
// Chargement des données
// ===================================

async function loadAllData() {
    try {
        showLoader();
        
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
                    sessionType: session.sessionType || 'lan',
                    ...doc.data()
                });
            });
        }
        
        // Charger tous les joueurs
        const playersSnapshot = await db.collection('users').get();
        allPlayers = playersSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        
        // Charger tous les personnages
        const charactersSnapshot = await db.collection('characters').get();
        allCharacters = charactersSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        
        console.log(`✅ Données chargées: ${allSessions.length} sessions, ${allMatches.length} matchs, ${allPlayers.length} joueurs`);
        
    } catch (error) {
        console.error('❌ Erreur lors du chargement des données:', error);
        showError('Erreur lors du chargement des statistiques');
    }
}

// ===================================
// Calcul et affichage des statistiques
// ===================================

function calculateAndDisplayStats() {
    // Vue d'ensemble
    displayOverview();
    
    // Classement général
    displayGlobalRanking();
    
    // Stats par joueur
    displayPlayerStats();
    
    // Stats par personnage
    displayCharacterStats();
    
    // Matchups entre joueurs
    displayMatchups();
    
    // LAN vs Online
    displayLanVsOnline();
    
    // Records
    displayRecords();
    
    // Matchups de personnages
    displayCharacterMatchups();
    
    hideLoader();
}

// ===================================
// 1. Vue d'ensemble
// ===================================

function displayOverview() {
    document.getElementById('total-sessions').textContent = allSessions.length;
    document.getElementById('total-matches').textContent = allMatches.length;
    document.getElementById('total-players').textContent = allPlayers.length;
    
    // Compter les personnages uniques joués
    const uniqueCharacters = new Set();
    allMatches.forEach(match => {
        if (match.player1?.character?.id) uniqueCharacters.add(match.player1.character.id);
        if (match.player2?.character?.id) uniqueCharacters.add(match.player2.character.id);
    });
    document.getElementById('total-characters').textContent = uniqueCharacters.size;
}

// ===================================
// 2. Classement général des joueurs
// ===================================

function displayGlobalRanking() {
    const playerStats = calculatePlayerStats();
    
    // Trier par winrate
    playerStats.sort((a, b) => {
        if (b.winrate !== a.winrate) return b.winrate - a.winrate;
        return b.wins - a.wins;
    });
    
    let html = `
        <table class="table table-hover">
            <thead>
                <tr>
                    <th>Rang</th>
                    <th>Joueur</th>
                    <th>Matchs</th>
                    <th>Victoires</th>
                    <th>Défaites</th>
                    <th>Winrate</th>
                    <th>Forme</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    playerStats.forEach((player, index) => {
        const rank = index + 1;
        const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`;
        const winrateColor = player.winrate >= 50 ? 'text-success' : 'text-danger';
        const form = calculatePlayerForm(player.id);
        
        html += `
            <tr>
                <td><strong>${medal}</strong></td>
                <td><strong>${player.name}</strong></td>
                <td>${player.total}</td>
                <td class="text-success">${player.wins}</td>
                <td class="text-danger">${player.losses}</td>
                <td>
                    <span class="badge ${player.winrate >= 50 ? 'bg-success' : 'bg-danger'}">
                        ${player.winrate.toFixed(1)}%
                    </span>
                </td>
                <td>${form}</td>
            </tr>
        `;
    });
    
    html += `
            </tbody>
        </table>
    `;
    
    document.getElementById('global-ranking').innerHTML = html;
}

// ===================================
// 3. Statistiques par joueur
// ===================================

function displayPlayerStats() {
    const playerStats = calculatePlayerStats();
    
    let html = '<div class="row">';
    
    playerStats.forEach(player => {
        const favoriteChar = calculateFavoriteCharacter(player.id);
        const bestMatchup = calculateBestMatchup(player.id);
        const worstMatchup = calculateWorstMatchup(player.id);
        
        html += `
            <div class="col-md-6 col-lg-4 mb-3">
                <div class="card h-100">
                    <div class="card-header bg-primary text-white">
                        <h5 class="mb-0">
                            <i class="fas fa-user"></i> ${player.name}
                        </h5>
                    </div>
                    <div class="card-body">
                        <div class="mb-3">
                            <div class="d-flex justify-content-between mb-1">
                                <span>Winrate</span>
                                <strong class="${player.winrate >= 50 ? 'text-success' : 'text-danger'}">
                                    ${player.winrate.toFixed(1)}%
                                </strong>
                            </div>
                            <div class="progress" style="height: 20px;">
                                <div class="progress-bar ${player.winrate >= 50 ? 'bg-success' : 'bg-danger'}" 
                                     style="width: ${player.winrate}%">
                                </div>
                            </div>
                        </div>
                        <ul class="list-unstyled mb-0">
                            <li><i class="fas fa-trophy text-warning"></i> ${player.wins} victoires</li>
                            <li><i class="fas fa-times-circle text-danger"></i> ${player.losses} défaites</li>
                            <li><i class="fas fa-gamepad text-info"></i> ${player.total} matchs</li>
                            ${favoriteChar ? `<li><i class="fas fa-star text-warning"></i> Perso favori: ${favoriteChar}</li>` : ''}
                            ${bestMatchup ? `<li><i class="fas fa-thumbs-up text-success"></i> Meilleur vs: ${bestMatchup}</li>` : ''}
                            ${worstMatchup ? `<li><i class="fas fa-thumbs-down text-danger"></i> Difficile vs: ${worstMatchup}</li>` : ''}
                        </ul>
                    </div>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    
    document.getElementById('player-stats-container').innerHTML = html;
}

// ===================================
// 4. Statistiques par personnage
// ===================================

function displayCharacterStats() {
    const charStats = calculateCharacterStats();
    
    // Trier par nombre de fois joué
    charStats.sort((a, b) => b.played - a.played);
    
    // Prendre le top 20
    const top20 = charStats.slice(0, 20);
    
    let html = `
        <table class="table table-hover">
            <thead>
                <tr>
                    <th>Rang</th>
                    <th>Personnage</th>
                    <th>Joué</th>
                    <th>Victoires</th>
                    <th>Défaites</th>
                    <th>Winrate</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    top20.forEach((char, index) => {
        html += `
            <tr>
                <td>#${index + 1}</td>
                <td><strong>${char.name}</strong></td>
                <td>${char.played}</td>
                <td class="text-success">${char.wins}</td>
                <td class="text-danger">${char.losses}</td>
                <td>
                    <span class="badge ${char.winrate >= 50 ? 'bg-success' : 'bg-danger'}">
                        ${char.winrate.toFixed(1)}%
                    </span>
                </td>
            </tr>
        `;
    });
    
    html += `
            </tbody>
        </table>
    `;
    
    document.getElementById('character-stats').innerHTML = html;
}

// ===================================
// Fonctions utilitaires
// ===================================

function calculatePlayerStats() {
    const stats = {};
    
    // Initialiser les stats pour tous les joueurs
    allPlayers.forEach(player => {
        stats[player.id] = {
            id: player.id,
            name: player.name,
            wins: 0,
            losses: 0,
            total: 0,
            winrate: 0
        };
    });
    
    // Calculer les stats depuis les matchs
    allMatches.forEach(match => {
        const p1Id = match.player1?.id;
        const p2Id = match.player2?.id;
        const winnerId = match.winner?.id;
        
        if (p1Id && stats[p1Id]) {
            stats[p1Id].total++;
            if (winnerId === p1Id) stats[p1Id].wins++;
            else stats[p1Id].losses++;
        }
        
        if (p2Id && stats[p2Id]) {
            stats[p2Id].total++;
            if (winnerId === p2Id) stats[p2Id].wins++;
            else stats[p2Id].losses++;
        }
    });
    
    // Calculer le winrate
    Object.values(stats).forEach(player => {
        player.winrate = player.total > 0 ? (player.wins / player.total) * 100 : 0;
    });
    
    return Object.values(stats).filter(p => p.total > 0);
}

function calculateCharacterStats() {
    const stats = {};

    allMatches.forEach(match => {
        const char1Id = match.player1?.character?.id;
        const char1Name = match.player1?.character?.name;
        const char2Id = match.player2?.character?.id;
        const char2Name = match.player2?.character?.name;
        const winnerId = match.winner?.id;
        const p1Id = match.player1?.id;
        const p2Id = match.player2?.id;

        if (char1Id) {
            if (!stats[char1Id]) {
                stats[char1Id] = { id: char1Id, name: char1Name, played: 0, wins: 0, losses: 0, winrate: 0 };
            }
            stats[char1Id].played++;
            if (winnerId === p1Id) stats[char1Id].wins++;
            else stats[char1Id].losses++;
        }

        if (char2Id) {
            if (!stats[char2Id]) {
                stats[char2Id] = { id: char2Id, name: char2Name, played: 0, wins: 0, losses: 0, winrate: 0 };
            }
            stats[char2Id].played++;
            if (winnerId === p2Id) stats[char2Id].wins++;
            else stats[char2Id].losses++;
        }
    });

    // Calculer le winrate
    Object.values(stats).forEach(char => {
        char.winrate = char.played > 0 ? (char.wins / char.played) * 100 : 0;
    });

    return Object.values(stats);
}

function calculateFavoriteCharacter(playerId) {
    const charUsage = {};

    allMatches.forEach(match => {
        if (match.player1?.id === playerId) {
            const charId = match.player1.character?.id;
            const charName = match.player1.character?.name;
            if (charId) {
                if (!charUsage[charId]) charUsage[charId] = { name: charName, count: 0 };
                charUsage[charId].count++;
            }
        }
        if (match.player2?.id === playerId) {
            const charId = match.player2.character?.id;
            const charName = match.player2.character?.name;
            if (charId) {
                if (!charUsage[charId]) charUsage[charId] = { name: charName, count: 0 };
                charUsage[charId].count++;
            }
        }
    });

    const sorted = Object.values(charUsage).sort((a, b) => b.count - a.count);
    return sorted.length > 0 ? `${sorted[0].name} (${sorted[0].count}x)` : null;
}

function calculateBestMatchup(playerId) {
    const matchups = {};

    allMatches.forEach(match => {
        let opponentId = null;
        let opponentName = null;
        let won = false;

        if (match.player1?.id === playerId) {
            opponentId = match.player2?.id;
            opponentName = match.player2?.name;
            won = match.winner?.id === playerId;
        } else if (match.player2?.id === playerId) {
            opponentId = match.player1?.id;
            opponentName = match.player1?.name;
            won = match.winner?.id === playerId;
        }

        if (opponentId) {
            if (!matchups[opponentId]) {
                matchups[opponentId] = { name: opponentName, wins: 0, total: 0 };
            }
            matchups[opponentId].total++;
            if (won) matchups[opponentId].wins++;
        }
    });

    // Trouver le meilleur matchup (au moins 3 matchs)
    const sorted = Object.values(matchups)
        .filter(m => m.total >= 3)
        .sort((a, b) => (b.wins / b.total) - (a.wins / a.total));

    return sorted.length > 0 ? `${sorted[0].name} (${sorted[0].wins}/${sorted[0].total})` : null;
}

function calculateWorstMatchup(playerId) {
    const matchups = {};

    allMatches.forEach(match => {
        let opponentId = null;
        let opponentName = null;
        let won = false;

        if (match.player1?.id === playerId) {
            opponentId = match.player2?.id;
            opponentName = match.player2?.name;
            won = match.winner?.id === playerId;
        } else if (match.player2?.id === playerId) {
            opponentId = match.player1?.id;
            opponentName = match.player1?.name;
            won = match.winner?.id === playerId;
        }

        if (opponentId) {
            if (!matchups[opponentId]) {
                matchups[opponentId] = { name: opponentName, wins: 0, total: 0 };
            }
            matchups[opponentId].total++;
            if (won) matchups[opponentId].wins++;
        }
    });

    // Trouver le pire matchup (au moins 3 matchs)
    const sorted = Object.values(matchups)
        .filter(m => m.total >= 3)
        .sort((a, b) => (a.wins / a.total) - (b.wins / b.total));

    return sorted.length > 0 ? `${sorted[0].name} (${sorted[0].wins}/${sorted[0].total})` : null;
}

function calculatePlayerForm(playerId) {
    // Prendre les 5 derniers matchs
    const playerMatches = allMatches
        .filter(m => m.player1?.id === playerId || m.player2?.id === playerId)
        .slice(0, 5);

    let form = '';
    playerMatches.forEach(match => {
        const won = match.winner?.id === playerId;
        form += won ? '✅' : '❌';
    });

    return form || '-';
}

// ===================================
// 5. Matchups entre joueurs (Face-à-face)
// ===================================

function displayMatchups() {
    const playerStats = calculatePlayerStats();
    const players = playerStats.map(p => p.id);

    if (players.length < 2) {
        document.getElementById('matchups-container').innerHTML = '<p class="text-muted">Pas assez de joueurs pour afficher les matchups.</p>';
        return;
    }

    let html = '<div class="table-responsive"><table class="table table-bordered text-center">';
    html += '<thead><tr><th></th>';

    // En-têtes de colonnes
    players.forEach(playerId => {
        const player = allPlayers.find(p => p.id === playerId);
        html += `<th>${player?.name || playerId}</th>`;
    });
    html += '</tr></thead><tbody>';

    // Lignes
    players.forEach(player1Id => {
        const player1 = allPlayers.find(p => p.id === player1Id);
        html += `<tr><th>${player1?.name || player1Id}</th>`;

        players.forEach(player2Id => {
            if (player1Id === player2Id) {
                html += '<td class="bg-secondary text-white">-</td>';
            } else {
                const matchup = calculateHeadToHead(player1Id, player2Id);
                const winrate = matchup.total > 0 ? (matchup.wins / matchup.total) * 100 : 0;
                const bgClass = winrate > 50 ? 'bg-success-subtle' : winrate < 50 ? 'bg-danger-subtle' : 'bg-warning-subtle';
                html += `<td class="${bgClass}"><strong>${matchup.wins}-${matchup.losses}</strong><br><small>${winrate.toFixed(0)}%</small></td>`;
            }
        });

        html += '</tr>';
    });

    html += '</tbody></table></div>';
    document.getElementById('matchups-container').innerHTML = html;
}

function calculateHeadToHead(player1Id, player2Id) {
    let wins = 0;
    let losses = 0;
    let total = 0;

    allMatches.forEach(match => {
        const p1 = match.player1?.id;
        const p2 = match.player2?.id;
        const winner = match.winner?.id;

        if ((p1 === player1Id && p2 === player2Id) || (p1 === player2Id && p2 === player1Id)) {
            total++;
            if (winner === player1Id) wins++;
            else if (winner === player2Id) losses++;
        }
    });

    return { wins, losses, total };
}

// ===================================
// 6. LAN vs Online
// ===================================

function displayLanVsOnline() {
    const lanMatches = allMatches.filter(m => m.sessionType === 'lan');
    const onlineMatches = allMatches.filter(m => m.sessionType === 'online');

    const lanSessions = allSessions.filter(s => s.sessionType === 'lan').length;
    const onlineSessions = allSessions.filter(s => s.sessionType === 'online').length;

    // Stats LAN
    let lanHtml = `
        <ul class="list-unstyled mb-0">
            <li class="mb-2"><i class="fas fa-gamepad text-primary"></i> <strong>${lanSessions}</strong> sessions</li>
            <li class="mb-2"><i class="fas fa-trophy text-warning"></i> <strong>${lanMatches.length}</strong> matchs</li>
        </ul>
    `;

    // Stats Online
    let onlineHtml = `
        <ul class="list-unstyled mb-0">
            <li class="mb-2"><i class="fas fa-gamepad text-success"></i> <strong>${onlineSessions}</strong> sessions</li>
            <li class="mb-2"><i class="fas fa-trophy text-warning"></i> <strong>${onlineMatches.length}</strong> matchs</li>
        </ul>
    `;

    document.getElementById('lan-stats').innerHTML = lanHtml;
    document.getElementById('online-stats').innerHTML = onlineHtml;
}

// ===================================
// 7. Records & Achievements
// ===================================

function displayRecords() {
    const playerStats = calculatePlayerStats();

    // Meilleur winrate (min 10 matchs)
    const bestWinrate = playerStats
        .filter(p => p.total >= 10)
        .sort((a, b) => b.winrate - a.winrate)[0];

    // Plus de victoires
    const mostWins = playerStats.sort((a, b) => b.wins - a.wins)[0];

    // Plus de matchs joués
    const mostPlayed = playerStats.sort((a, b) => b.total - a.total)[0];

    // Personnage le plus joué
    const charStats = calculateCharacterStats();
    const mostPlayedChar = charStats.sort((a, b) => b.played - a.played)[0];

    // Personnage avec le meilleur winrate (min 10 matchs)
    const bestCharWinrate = charStats
        .filter(c => c.played >= 10)
        .sort((a, b) => b.winrate - a.winrate)[0];

    // Plus longue série de victoires
    const longestWinStreak = calculateLongestWinStreak();

    let html = '<div class="row">';

    if (bestWinrate) {
        html += `
            <div class="col-md-4 mb-3">
                <div class="card border-success">
                    <div class="card-body text-center">
                        <i class="fas fa-percentage fa-2x text-success mb-2"></i>
                        <h5>Meilleur Winrate</h5>
                        <h3 class="text-success">${bestWinrate.winrate.toFixed(1)}%</h3>
                        <p class="mb-0">${bestWinrate.name}</p>
                        <small class="text-muted">${bestWinrate.wins}V - ${bestWinrate.losses}D</small>
                    </div>
                </div>
            </div>
        `;
    }

    if (mostWins) {
        html += `
            <div class="col-md-4 mb-3">
                <div class="card border-warning">
                    <div class="card-body text-center">
                        <i class="fas fa-trophy fa-2x text-warning mb-2"></i>
                        <h5>Plus de Victoires</h5>
                        <h3 class="text-warning">${mostWins.wins}</h3>
                        <p class="mb-0">${mostWins.name}</p>
                        <small class="text-muted">${mostWins.total} matchs</small>
                    </div>
                </div>
            </div>
        `;
    }

    if (mostPlayed) {
        html += `
            <div class="col-md-4 mb-3">
                <div class="card border-info">
                    <div class="card-body text-center">
                        <i class="fas fa-gamepad fa-2x text-info mb-2"></i>
                        <h5>Plus Actif</h5>
                        <h3 class="text-info">${mostPlayed.total}</h3>
                        <p class="mb-0">${mostPlayed.name}</p>
                        <small class="text-muted">matchs joués</small>
                    </div>
                </div>
            </div>
        `;
    }

    if (mostPlayedChar) {
        html += `
            <div class="col-md-4 mb-3">
                <div class="card border-primary">
                    <div class="card-body text-center">
                        <i class="fas fa-user-ninja fa-2x text-primary mb-2"></i>
                        <h5>Perso le Plus Joué</h5>
                        <h3 class="text-primary">${mostPlayedChar.played}</h3>
                        <p class="mb-0">${mostPlayedChar.name}</p>
                        <small class="text-muted">${mostPlayedChar.wins}V - ${mostPlayedChar.losses}D</small>
                    </div>
                </div>
            </div>
        `;
    }

    if (bestCharWinrate) {
        html += `
            <div class="col-md-4 mb-3">
                <div class="card border-success">
                    <div class="card-body text-center">
                        <i class="fas fa-star fa-2x text-success mb-2"></i>
                        <h5>Meilleur Perso</h5>
                        <h3 class="text-success">${bestCharWinrate.winrate.toFixed(1)}%</h3>
                        <p class="mb-0">${bestCharWinrate.name}</p>
                        <small class="text-muted">${bestCharWinrate.wins}V - ${bestCharWinrate.losses}D</small>
                    </div>
                </div>
            </div>
        `;
    }

    if (longestWinStreak) {
        html += `
            <div class="col-md-4 mb-3">
                <div class="card border-danger">
                    <div class="card-body text-center">
                        <i class="fas fa-fire fa-2x text-danger mb-2"></i>
                        <h5>Plus Longue Série</h5>
                        <h3 class="text-danger">${longestWinStreak.streak}</h3>
                        <p class="mb-0">${longestWinStreak.player}</p>
                        <small class="text-muted">victoires consécutives</small>
                    </div>
                </div>
            </div>
        `;
    }

    html += '</div>';

    document.getElementById('records-container').innerHTML = html;
}

function calculateLongestWinStreak() {
    const streaks = {};

    allPlayers.forEach(player => {
        streaks[player.id] = { player: player.name, current: 0, max: 0 };
    });

    // Parcourir les matchs dans l'ordre chronologique
    const sortedMatches = [...allMatches].sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(a.date || 0);
        const dateB = b.createdAt?.toDate?.() || new Date(b.date || 0);
        return dateA - dateB;
    });

    sortedMatches.forEach(match => {
        const winnerId = match.winner?.id;
        const p1Id = match.player1?.id;
        const p2Id = match.player2?.id;

        if (winnerId && streaks[winnerId]) {
            streaks[winnerId].current++;
            if (streaks[winnerId].current > streaks[winnerId].max) {
                streaks[winnerId].max = streaks[winnerId].current;
            }
        }

        // Réinitialiser la série du perdant
        const loserId = winnerId === p1Id ? p2Id : p1Id;
        if (loserId && streaks[loserId]) {
            streaks[loserId].current = 0;
        }
    });

    const best = Object.values(streaks).sort((a, b) => b.max - a.max)[0];
    return best && best.max > 0 ? { player: best.player, streak: best.max } : null;
}

// ===================================
// 8. Matchups de personnages
// ===================================

function displayCharacterMatchups() {
    const charStats = calculateCharacterStats();

    // Prendre les 10 personnages les plus joués
    const topChars = charStats
        .sort((a, b) => b.played - a.played)
        .slice(0, 10);

    if (topChars.length < 2) {
        document.getElementById('character-matchups-container').innerHTML = '<p class="text-muted">Pas assez de données pour afficher les matchups de personnages.</p>';
        return;
    }

    let html = '<div class="table-responsive"><table class="table table-sm table-bordered text-center">';
    html += '<thead><tr><th style="font-size: 0.8rem;">Perso</th>';

    // En-têtes de colonnes
    topChars.forEach(char => {
        html += `<th style="font-size: 0.75rem;">${char.name.substring(0, 8)}</th>`;
    });
    html += '</tr></thead><tbody>';

    // Lignes
    topChars.forEach(char1 => {
        html += `<tr><th style="font-size: 0.8rem;">${char1.name.substring(0, 8)}</th>`;

        topChars.forEach(char2 => {
            if (char1.id === char2.id) {
                html += '<td class="bg-secondary text-white" style="font-size: 0.7rem;">-</td>';
            } else {
                const matchup = calculateCharacterHeadToHead(char1.id, char2.id);
                if (matchup.total === 0) {
                    html += '<td class="text-muted" style="font-size: 0.7rem;">0-0</td>';
                } else {
                    const winrate = (matchup.wins / matchup.total) * 100;
                    const bgClass = winrate > 50 ? 'bg-success-subtle' : winrate < 50 ? 'bg-danger-subtle' : 'bg-warning-subtle';
                    html += `<td class="${bgClass}" style="font-size: 0.7rem;">${matchup.wins}-${matchup.losses}</td>`;
                }
            }
        });

        html += '</tr>';
    });

    html += '</tbody></table></div>';
    html += '<p class="text-muted mt-2"><small>Top 10 des personnages les plus joués. Format: Victoires-Défaites</small></p>';

    document.getElementById('character-matchups-container').innerHTML = html;
}

function calculateCharacterHeadToHead(char1Id, char2Id) {
    let wins = 0;
    let losses = 0;
    let total = 0;

    allMatches.forEach(match => {
        const p1Char = match.player1?.character?.id;
        const p2Char = match.player2?.character?.id;
        const winner = match.winner?.id;
        const p1Id = match.player1?.id;
        const p2Id = match.player2?.id;

        // char1 vs char2
        if (p1Char === char1Id && p2Char === char2Id) {
            total++;
            if (winner === p1Id) wins++;
            else losses++;
        }
        // char2 vs char1 (inverse)
        else if (p1Char === char2Id && p2Char === char1Id) {
            total++;
            if (winner === p2Id) wins++;
            else losses++;
        }
    });

    return { wins, losses, total };
}

function showLoader() {
    const loader = document.getElementById('stats-loader');
    const content = document.getElementById('stats-content');
    if (loader) loader.style.display = 'block';
    if (content) content.style.display = 'none';
}

function hideLoader() {
    const loader = document.getElementById('stats-loader');
    const content = document.getElementById('stats-content');
    if (loader) loader.style.display = 'none';
    if (content) content.style.display = 'block';
}

function showError(message) {
    console.error('❌', message);
    hideLoader();
    const content = document.getElementById('stats-content');
    if (content) {
        content.innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-triangle"></i> ${message}
            </div>
        `;
        content.style.display = 'block';
    }
}

