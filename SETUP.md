# 🚀 Guide de démarrage - Smash Ultimate Tracker

## 📋 Étapes d'initialisation

### 1. Configuration Firebase ✅ (Déjà fait)
Vous avez déjà configuré Firebase avec succès !

### 2. Initialiser la base de données

#### Option A : Initialisation complète (recommandé)
1. Ouvrez `index.html` dans votre navigateur
2. Ouvrez la console développeur (F12)
3. Tapez la commande suivante :
   ```javascript
   initializeDatabase()
   ```
4. Confirmez l'opération dans la popup
5. Attendez quelques secondes (vous verrez les logs dans la console)
6. Rechargez la page (F5)

Cela créera :
- ✅ **6 utilisateurs** : Raz3LL, Lsa, Shiro, Akro, Celda, Blaisave
- ✅ **89 personnages** de Smash Ultimate avec leurs vraies images
- ✅ **1 session exemple** avec 4 matchs

#### Option B : Initialisation par étapes
Si vous préférez initialiser les données séparément :

```javascript
// Créer uniquement les utilisateurs
initUsers()

// Créer uniquement les personnages
initCharacters()

// Créer une session exemple
createExampleSession()
```

### 3. Vérifier les données dans Firebase Console

1. Allez sur [Firebase Console](https://console.firebase.google.com/)
2. Sélectionnez votre projet **smash-ultimate-tracker-ded33**
3. Cliquez sur **Firestore Database**
4. Vous devriez voir 3 collections :
   - 📂 **users** (6 documents)
   - 📂 **characters** (89 documents)
   - 📂 **sessions** (1+ documents)

---

## 👥 Utilisateurs créés

| ID | Nom | Personnages favoris |
|---|---|---|
| `raz3ll` | Raz3LL | Mario, Fox, Captain Falcon |
| `lsa` | Lsa | Link, Zelda, Sheik |
| `shiro` | Shiro | Pikachu, Kirby, Meta Knight |
| `akro` | Akro | Samus, Ridley, Dark Samus |
| `celda` | Celda | Peach, Daisy, Rosalina |
| `blaisave` | Blaisave | Bowser, Ganondorf, King K. Rool |

---

## 🎮 Personnages disponibles

**89 personnages** de Super Smash Bros Ultimate avec :
- ✅ Icône (petite image pour les listes)
- ✅ Portrait (image moyenne pour la sélection)
- ✅ Full Portrait (grande image pour les détails)

Toutes les images proviennent du site officiel de Smash Bros.

### Exemples de personnages :
- Mario, Luigi, Peach, Daisy, Bowser, Bowser Jr., Dr. Mario...
- Link, Zelda, Sheik, Young Link, Toon Link, Ganondorf...
- Pikachu, Jigglypuff, Pichu, Mewtwo, Lucario, Greninja...
- Fox, Falco, Wolf...
- Kirby, Meta Knight, King Dedede...
- Et 64 autres !

---

## 📊 Structure de la base de données

### Collection `users`
```javascript
{
  id: "raz3ll",
  name: "Raz3LL",
  nickname: "Raz3LL",
  favoriteCharacters: ["mario", "fox", "captain-falcon"],
  createdAt: Timestamp
}
```

### Collection `characters`
```javascript
{
  id: "mario",
  name: "Mario",
  number: "01",
  series: "Super Mario",
  images: {
    icon: "https://www.smashbros.com/assets_v2/img/fighter/thumb_a/mario.png",
    portrait: "https://www.smashbros.com/assets_v2/img/fighter/mario/main.png",
    full: "https://www.smashbros.com/assets_v2/img/fighter/mario/main2.png"
  }
}
```

### Collection `sessions`
```javascript
{
  name: "Soirée du vendredi",
  date: "2024-01-15T20:00:00Z",
  createdAt: Timestamp,
  players: ["raz3ll", "lsa", "shiro", "akro"]
}
```

### Sous-collection `sessions/{sessionId}/matches`
```javascript
{
  player1Id: "raz3ll",
  player1Name: "Raz3LL",
  player1Character: "mario",
  player2Id: "lsa",
  player2Name: "Lsa",
  player2Character: "link",
  winnerId: "raz3ll",
  score: "3-2",
  timestamp: Timestamp
}
```

---

## 🧪 Commandes utiles (Console)

### Initialisation
```javascript
initializeDatabase()  // Tout initialiser
initUsers()          // Créer les utilisateurs
initCharacters()     // Créer les personnages
createExampleSession() // Créer une session exemple
```

### Nettoyage (⚠️ DANGER)
```javascript
clearDatabase()  // Supprimer TOUTES les données
```

### Lecture des données
```javascript
// Lire tous les utilisateurs
db.collection('users').get().then(snap => {
  snap.forEach(doc => console.log(doc.id, doc.data()))
})

// Lire tous les personnages
db.collection('characters').get().then(snap => {
  console.log(`${snap.size} personnages`)
})

// Lire toutes les sessions
db.collection('sessions').get().then(snap => {
  snap.forEach(doc => console.log(doc.data().name))
})
```

---

## 📝 Modifier les données

### Ajouter un utilisateur
```javascript
db.collection('users').doc('nouveau-joueur').set({
  name: 'Nouveau Joueur',
  nickname: 'NJ',
  favoriteCharacters: ['mario', 'link'],
  createdAt: firebase.firestore.FieldValue.serverTimestamp()
})
```

### Créer une nouvelle session
```javascript
db.collection('sessions').add({
  name: 'Tournoi du samedi',
  date: new Date().toISOString(),
  createdAt: firebase.firestore.FieldValue.serverTimestamp(),
  players: ['raz3ll', 'lsa', 'shiro']
})
```

### Ajouter un match à une session
```javascript
const sessionId = 'VOTRE_SESSION_ID';
db.collection('sessions').doc(sessionId).collection('matches').add({
  player1Id: 'raz3ll',
  player1Name: 'Raz3LL',
  player1Character: 'mario',
  player2Id: 'lsa',
  player2Name: 'Lsa',
  player2Character: 'link',
  winnerId: 'raz3ll',
  score: '3-2',
  timestamp: firebase.firestore.FieldValue.serverTimestamp()
})
```

---

## 🎯 Prochaines étapes

Maintenant que la base de données est initialisée, vous pouvez :

1. ✅ Créer l'interface pour afficher les sessions
2. ✅ Créer un formulaire pour ajouter des matchs
3. ✅ Afficher les statistiques des joueurs
4. ✅ Créer un système de classement
5. ✅ Ajouter des graphiques de progression

---

## 🔗 Fichiers importants

- `firebase.md` - Guide complet Firebase
- `database-structure.md` - Documentation de la structure BDD
- `js/characters-data.js` - Liste complète des 89 personnages
- `js/init-database.js` - Script d'initialisation
- `js/firebase-config.js` - Configuration Firebase

---

## ❓ Problèmes courants

### "Missing or insufficient permissions"
➡️ Vérifiez les règles Firestore (voir `firebase.md`)

### "firebase is not defined"
➡️ Vérifiez que les scripts Firebase sont bien chargés dans `index.html`

### "ALL_CHARACTERS is undefined"
➡️ Vérifiez que `characters-data.js` est chargé avant `init-database.js`

### Les images ne s'affichent pas
➡️ Les URLs des images sont correctes, vérifiez votre connexion internet

---

## 🎉 C'est parti !

Votre base de données est prête à être utilisée. Bon développement ! 🚀

