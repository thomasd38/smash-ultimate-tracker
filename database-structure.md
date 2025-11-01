# 🗄️ Structure de la Base de Données Firestore

## 📊 Vue d'ensemble

La base de données utilise **Firestore** avec 3 collections principales :
- `users` - Les joueurs
- `characters` - Les personnages de Smash Ultimate
- `sessions` - Les sessions de jeu (avec sous-collection `matches`)

---

## 📂 Collection : `users`

Contient tous les joueurs qui participent aux sessions.

### Structure d'un document :
```javascript
{
  id: "user1",                    // ID unique du joueur
  name: "Thomas",                 // Nom réel
  nickname: "Raz3LL",            // Pseudo/surnom
  createdAt: Timestamp           // Date de création
}
```

### Exemple :
```javascript
{
  id: "user1",
  name: "Thomas",
  nickname: "Raz3LL",
  createdAt: 2024-01-15T10:30:00Z
}
```

---

## 📂 Collection : `characters`

Contient tous les personnages jouables de Super Smash Bros Ultimate.

### Structure d'un document :
```javascript
{
  id: "mario",                   // ID unique du personnage (slug)
  name: "Mario",                 // Nom du personnage
  icon: "🔴",                    // Icône/emoji représentant le personnage
  series: "Super Mario"          // Série d'origine
}
```

### Exemple :
```javascript
{
  id: "mario",
  name: "Mario",
  icon: "🔴",
  series: "Super Mario"
}
```

### Liste des personnages inclus :
- 76 personnages sur 89 (les plus populaires)
- Vous pouvez en ajouter d'autres dans `js/init-database.js`

---

## 📂 Collection : `sessions`

Contient toutes les sessions de jeu (soirées entre amis).

### Structure d'un document :
```javascript
{
  name: "Soirée du vendredi",    // Nom de la session
  date: "2024-01-15T20:00:00Z",  // Date de la session (ISO string)
  createdAt: Timestamp,          // Date de création du document
  players: ["user1", "user2"]    // IDs des joueurs participants
}
```

### Exemple :
```javascript
{
  name: "Soirée du vendredi",
  date: "2024-01-15T20:00:00Z",
  createdAt: 2024-01-15T19:45:00Z,
  players: ["user1", "user2", "user3"]
}
```

---

## 📂 Sous-collection : `sessions/{sessionId}/matches`

Chaque session contient une sous-collection `matches` avec tous les matchs joués.

### Structure d'un document :
```javascript
{
  player1Id: "user1",            // ID du joueur 1
  player1Name: "Thomas",         // Nom du joueur 1 (dénormalisé pour performance)
  player1Character: "mario",     // ID du personnage choisi par joueur 1
  
  player2Id: "user2",            // ID du joueur 2
  player2Name: "Alex",           // Nom du joueur 2
  player2Character: "link",      // ID du personnage choisi par joueur 2
  
  winnerId: "user1",             // ID du gagnant
  score: "3-2",                  // Score du match
  timestamp: Timestamp           // Date/heure du match
}
```

### Exemple :
```javascript
{
  player1Id: "user1",
  player1Name: "Thomas",
  player1Character: "mario",
  player2Id: "user2",
  player2Name: "Alex",
  player2Character: "link",
  winnerId: "user1",
  score: "3-2",
  timestamp: 2024-01-15T20:15:00Z
}
```

---

## 🔄 Schéma relationnel

```
users (collection)
├── user1 (document)
├── user2 (document)
└── user3 (document)

characters (collection)
├── mario (document)
├── link (document)
├── pikachu (document)
└── ... (76 personnages)

sessions (collection)
├── session_abc123 (document)
│   ├── matches (sous-collection)
│   │   ├── match_xyz789 (document)
│   │   ├── match_def456 (document)
│   │   └── ...
│   └── ...
└── session_def456 (document)
    ├── matches (sous-collection)
    └── ...
```

---

## 📝 Requêtes courantes

### Récupérer tous les utilisateurs :
```javascript
db.collection('users').get()
  .then(snapshot => {
    snapshot.forEach(doc => {
      console.log(doc.id, doc.data());
    });
  });
```

### Récupérer tous les personnages :
```javascript
db.collection('characters').orderBy('name').get()
  .then(snapshot => {
    snapshot.forEach(doc => {
      console.log(doc.data().name);
    });
  });
```

### Récupérer toutes les sessions :
```javascript
db.collection('sessions').orderBy('createdAt', 'desc').get()
  .then(snapshot => {
    snapshot.forEach(doc => {
      console.log(doc.data().name);
    });
  });
```

### Récupérer les matchs d'une session :
```javascript
db.collection('sessions').doc('session_id')
  .collection('matches').orderBy('timestamp').get()
  .then(snapshot => {
    snapshot.forEach(doc => {
      const match = doc.data();
      console.log(`${match.player1Name} vs ${match.player2Name}`);
    });
  });
```

### Créer un nouveau match :
```javascript
const sessionId = 'session_abc123';
const matchData = {
  player1Id: 'user1',
  player1Name: 'Thomas',
  player1Character: 'mario',
  player2Id: 'user2',
  player2Name: 'Alex',
  player2Character: 'link',
  winnerId: 'user1',
  score: '3-2',
  timestamp: firebase.firestore.FieldValue.serverTimestamp()
};

db.collection('sessions').doc(sessionId)
  .collection('matches').add(matchData)
  .then(docRef => {
    console.log('Match créé:', docRef.id);
  });
```

---

## 📊 Statistiques possibles

Avec cette structure, vous pourrez calculer :

### Par joueur :
- Nombre total de matchs joués
- Nombre de victoires / défaites
- Ratio victoires/défaites
- Personnages les plus joués
- Personnages avec le meilleur taux de victoire
- Adversaires les plus fréquents
- Historique des matchs

### Par personnage :
- Nombre de fois joué
- Taux de victoire global
- Meilleurs joueurs avec ce personnage

### Par session :
- Nombre de matchs
- Classement des joueurs
- Durée de la session
- Personnages les plus joués

### Globales :
- Total de matchs joués
- Classement général des joueurs
- Personnages les plus populaires
- Évolution des performances dans le temps

---

## 🔧 Initialisation

Pour initialiser la base de données avec les données de base :

1. Ouvrez `index.html` dans votre navigateur
2. Ouvrez la console développeur (F12)
3. Tapez : `initializeDatabase()`
4. Confirmez l'opération

Cela créera :
- 3 utilisateurs (modifiez dans `js/init-database.js`)
- 76 personnages
- 1 session exemple avec 3 matchs

---

## ⚠️ Notes importantes

### Dénormalisation
Les noms des joueurs sont **dénormalisés** dans les matchs (stockés directement) pour :
- Améliorer les performances de lecture
- Éviter des requêtes multiples pour afficher un match
- Simplifier les requêtes

**Inconvénient** : Si un joueur change de nom, il faut mettre à jour tous ses matchs.

### IDs personnalisés
- Les `users` et `characters` utilisent des IDs personnalisés (ex: "user1", "mario")
- Les `sessions` et `matches` utilisent des IDs auto-générés par Firestore

### Timestamps
- `createdAt` : Date de création du document (Firestore Timestamp)
- `date` : Date de la session (ISO String pour faciliter l'affichage)
- `timestamp` : Date/heure du match (Firestore Timestamp)

---

## 🚀 Évolutions futures possibles

- Ajouter un champ `avatar` pour les utilisateurs
- Ajouter des URLs d'images pour les icônes de personnages
- Ajouter un champ `stage` (arène) pour les matchs
- Ajouter un champ `duration` pour la durée des matchs
- Ajouter une collection `tournaments` pour des tournois
- Ajouter l'authentification Firebase pour sécuriser les données

