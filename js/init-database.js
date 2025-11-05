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
    favoriteCharacters: ['zero-suit-samus'],
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  },
  {
    id: 'akro',
    name: 'Akro',
    nickname: 'Akro',
    favoriteCharacters: ['palutena', 'ganondorf'],
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  },
  {
    id: 'celda',
    name: 'Celda',
    nickname: 'Celda',
    favoriteCharacters: ['bowser', 'ganondorf'],
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  },
  {
    id: 'blaisave',
    name: 'Blaisave',
    nickname: 'Blaisave',
    favoriteCharacters: ['piranha-plant', 'ness'],
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
  try {
    for (const user of initialUsers) {
      await db.collection('users').doc(user.id).set(user);
    }
    return true;
  } catch (error) {
    return false;
  }
}

// Initialiser les personnages
async function initCharacters() {
  try {
    for (const character of initialCharacters) {
      await db.collection('characters').doc(character.id).set(character);
    }
    return true;
  } catch (error) {
    return false;
  }
}

// Créer une session exemple avec des matchs
async function createExampleSession() {
  try {
    // Créer la session
    const sessionRef = await db.collection('sessions').add({
      name: 'Soirée du vendredi',
      date: new Date().toISOString(),
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      players: ['raz3ll', 'lsa', 'shiro', 'akro']
    });

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
    }

    return true;
  } catch (error) {
    return false;
  }
}

// Initialiser toute la base de données
function initializeDatabase() {
  showConfirm(
    `Voulez-vous initialiser la base de données ? Cela va créer ${initialUsers.length} utilisateurs, ${initialCharacters.length} personnages et 1 session exemple avec 4 matchs.`,
    async () => {
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
        showSuccess(`Base de données initialisée avec succès ! (${duration}s)`);
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        showWarning('Certaines données n\'ont pas pu être créées.');
      }
    }
  );
}

// Fonction pour vider la base de données
function clearDatabase() {
  showConfirm(
    'Voulez-vous vraiment SUPPRIMER toutes les données ? Cette action est IRRÉVERSIBLE !',
    async () => {
      try {
        let deletedCount = 0;

        // Supprimer les utilisateurs
        const usersSnapshot = await db.collection('users').get();
        for (const doc of usersSnapshot.docs) {
          await doc.ref.delete();
          deletedCount++;
        }

        // Supprimer les personnages
        const charactersSnapshot = await db.collection('characters').get();
        for (const doc of charactersSnapshot.docs) {
          await doc.ref.delete();
          deletedCount++;
        }

        // Supprimer les sessions et leurs matchs
        const sessionsSnapshot = await db.collection('sessions').get();
        for (const sessionDoc of sessionsSnapshot.docs) {
          // Supprimer les matchs de la session
          const matchesSnapshot = await sessionDoc.ref.collection('matches').get();
          for (const matchDoc of matchesSnapshot.docs) {
            await matchDoc.ref.delete();
            deletedCount++;
          }

          // Supprimer la session
          await sessionDoc.ref.delete();
          deletedCount++;
        }

        showSuccess(`Base de données vidée ! ${deletedCount} documents supprimés.`);
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } catch (error) {
        showError('Erreur lors de la suppression de la base de données.');
      }
    }
  );
}

// Exposer les fonctions globalement pour pouvoir les appeler depuis la console
window.initializeDatabase = initializeDatabase;
window.clearDatabase = clearDatabase;
window.initUsers = initUsers;
window.initCharacters = initCharacters;
window.createExampleSession = createExampleSession;

