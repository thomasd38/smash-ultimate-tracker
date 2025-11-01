// ===================================
// Initialisation de la base de données
// Script à exécuter UNE SEULE FOIS pour créer les données initiales
// ===================================

// ===================================
// DONNÉES INITIALES
// ===================================

// Liste des utilisateurs (joueurs)
const initialUsers = [
  {
    id: 'raz3ll',
    name: 'Raz3LL',
    nickname: 'Raz3LL',
    favoriteCharacters: ['bowser'],
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  },
  {
    id: 'lsa',
    name: 'Lsa',
    nickname: 'Lsa',
    favoriteCharacters: ['king-k-rool', 'palutena', 'lucina'],
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  },
  {
    id: 'shiro',
    name: 'Shiro',
    nickname: 'Shiro',
    favoriteCharacters: ['pikachu', 'kirby', 'meta-knight'],
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  },
  {
    id: 'akro',
    name: 'Akro',
    nickname: 'Akro',
    favoriteCharacters: ['samus', 'ridley', 'dark-samus'],
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  },
  {
    id: 'celda',
    name: 'Celda',
    nickname: 'Celda',
    favoriteCharacters: ['peach', 'daisy', 'rosalina'],
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  },
  {
    id: 'blaisave',
    name: 'Blaisave',
    nickname: 'Blaisave',
    favoriteCharacters: ['bowser', 'ganondorf', 'king-k-rool'],
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  }
];

// Les personnages sont chargés depuis characters-data.js
// Utiliser window.ALL_CHARACTERS pour accéder à la liste complète
const initialCharacters = window.ALL_CHARACTERS || [];

// ===================================
// FONCTIONS D'INITIALISATION
// ===================================

// Initialiser les utilisateurs
async function initUsers() {
  console.log('📝 Initialisation des utilisateurs...');
  
  try {
    for (const user of initialUsers) {
      await db.collection('users').doc(user.id).set(user);
      console.log(`✅ Utilisateur créé: ${user.name}`);
    }
    console.log(`✅ ${initialUsers.length} utilisateurs créés avec succès !`);
    return true;
  } catch (error) {
    console.error('❌ Erreur lors de la création des utilisateurs:', error);
    return false;
  }
}

// Initialiser les personnages
async function initCharacters() {
  console.log('🎮 Initialisation des personnages...');
  
  try {
    for (const character of initialCharacters) {
      await db.collection('characters').doc(character.id).set(character);
      console.log(`✅ Personnage créé: ${character.name}`);
    }
    console.log(`✅ ${initialCharacters.length} personnages créés avec succès !`);
    return true;
  } catch (error) {
    console.error('❌ Erreur lors de la création des personnages:', error);
    return false;
  }
}

// Créer une session exemple avec des matchs
async function createExampleSession() {
  console.log('🎯 Création d\'une session exemple...');
  
  try {
    // Créer la session
    const sessionRef = await db.collection('sessions').add({
      name: 'Soirée du vendredi',
      date: new Date().toISOString(),
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      players: ['raz3ll', 'lsa', 'shiro', 'akro']
    });

    console.log(`✅ Session créée avec ID: ${sessionRef.id}`);

    // Créer quelques matchs dans cette session
    const matches = [
      {
        player1Id: 'raz3ll',
        player1Name: 'Raz3LL',
        player1Character: 'mario',
        player2Id: 'lsa',
        player2Name: 'Lsa',
        player2Character: 'link',
        winnerId: 'raz3ll',
        score: '3-2',
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      },
      {
        player1Id: 'shiro',
        player1Name: 'Shiro',
        player1Character: 'pikachu',
        player2Id: 'akro',
        player2Name: 'Akro',
        player2Character: 'samus',
        winnerId: 'akro',
        score: '2-3',
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      },
      {
        player1Id: 'raz3ll',
        player1Name: 'Raz3LL',
        player1Character: 'fox',
        player2Id: 'shiro',
        player2Name: 'Shiro',
        player2Character: 'kirby',
        winnerId: 'raz3ll',
        score: '3-1',
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      },
      {
        player1Id: 'celda',
        player1Name: 'Celda',
        player1Character: 'peach',
        player2Id: 'blaisave',
        player2Name: 'Blaisave',
        player2Character: 'bowser',
        winnerId: 'blaisave',
        score: '1-3',
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      }
    ];
    
    for (const match of matches) {
      await sessionRef.collection('matches').add(match);
      console.log(`✅ Match créé: ${match.player1Name} vs ${match.player2Name}`);
    }
    
    console.log(`✅ ${matches.length} matchs créés dans la session !`);
    return true;
  } catch (error) {
    console.error('❌ Erreur lors de la création de la session exemple:', error);
    return false;
  }
}

// Initialiser toute la base de données
async function initializeDatabase() {
  console.log('🚀 Démarrage de l\'initialisation de la base de données...');
  console.log('⚠️ Cette opération va créer toutes les données initiales.');
  
  const confirm = window.confirm(
    'Voulez-vous initialiser la base de données ?\n\n' +
    `Cela va créer :\n` +
    `- ${initialUsers.length} utilisateurs\n` +
    `- ${initialCharacters.length} personnages\n` +
    `- 1 session exemple avec 3 matchs\n\n` +
    'Continuer ?'
  );
  
  if (!confirm) {
    console.log('❌ Initialisation annulée par l\'utilisateur');
    return;
  }
  
  const startTime = Date.now();
  
  // Initialiser les utilisateurs
  const usersSuccess = await initUsers();
  
  // Initialiser les personnages
  const charactersSuccess = await initCharacters();
  
  // Créer une session exemple
  const sessionSuccess = await createExampleSession();
  
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);
  
  if (usersSuccess && charactersSuccess && sessionSuccess) {
    console.log(`\n🎉 Base de données initialisée avec succès en ${duration}s !`);
    alert(`✅ Base de données initialisée avec succès !\n\nTemps: ${duration}s\n\nRechargez la page pour voir les données.`);
  } else {
    console.log(`\n⚠️ Initialisation terminée avec des erreurs (${duration}s)`);
    alert('⚠️ Certaines données n\'ont pas pu être créées. Vérifiez la console.');
  }
}

// Fonction pour nettoyer la base de données (DANGER!)
async function clearDatabase() {
  const confirm = window.confirm(
    '⚠️ ATTENTION ⚠️\n\n' +
    'Voulez-vous vraiment SUPPRIMER toutes les données ?\n\n' +
    'Cette action est IRRÉVERSIBLE !'
  );
  
  if (!confirm) return;
  
  console.log('🗑️ Suppression de toutes les données...');
  
  try {
    // Supprimer les utilisateurs
    const usersSnapshot = await db.collection('users').get();
    for (const doc of usersSnapshot.docs) {
      await doc.ref.delete();
    }
    
    // Supprimer les personnages
    const charactersSnapshot = await db.collection('characters').get();
    for (const doc of charactersSnapshot.docs) {
      await doc.ref.delete();
    }
    
    // Supprimer les sessions et leurs matchs
    const sessionsSnapshot = await db.collection('sessions').get();
    for (const sessionDoc of sessionsSnapshot.docs) {
      // Supprimer les matchs de la session
      const matchesSnapshot = await sessionDoc.ref.collection('matches').get();
      for (const matchDoc of matchesSnapshot.docs) {
        await matchDoc.ref.delete();
      }
      // Supprimer la session
      await sessionDoc.ref.delete();
    }
    
    console.log('✅ Base de données nettoyée !');
    alert('✅ Toutes les données ont été supprimées.');
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error);
    alert('❌ Erreur lors du nettoyage de la base de données.');
  }
}

// Exposer les fonctions globalement pour pouvoir les appeler depuis la console
window.initializeDatabase = initializeDatabase;
window.clearDatabase = clearDatabase;
window.initUsers = initUsers;
window.initCharacters = initCharacters;
window.createExampleSession = createExampleSession;

console.log('📚 Script d\'initialisation chargé !');
console.log('💡 Utilisez initializeDatabase() pour initialiser la base de données');
console.log('⚠️ Utilisez clearDatabase() pour supprimer toutes les données');

