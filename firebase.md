# 🔥 Guide Firebase pour Smash Ultimate Tracker

## 📋 Table des matières
1. [Création du projet Firebase](#1-création-du-projet-firebase)
2. [Configuration de Firestore](#2-configuration-de-firestore)
3. [Récupération des clés de configuration](#3-récupération-des-clés-de-configuration)
4. [Intégration dans le projet](#4-intégration-dans-le-projet)
5. [Structure de la base de données](#5-structure-de-la-base-de-données)
6. [Tester la connexion](#6-tester-la-connexion)

---

## 1. Création du projet Firebase

### Étape 1.1 : Accéder à Firebase Console
1. Allez sur [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. Connectez-vous avec votre compte Google
3. Cliquez sur **"Ajouter un projet"** (ou "Add project")

### Étape 1.2 : Configurer le projet
1. **Nom du projet** : Entrez `smash-ultimate-tracker` (ou le nom de votre choix)
2. Cliquez sur **Continuer**
3. **Google Analytics** : Vous pouvez désactiver Google Analytics (optionnel pour ce projet)
4. Cliquez sur **Créer le projet**
5. Attendez quelques secondes que le projet soit créé
6. Cliquez sur **Continuer**

---

## 2. Configuration de Firestore

### Étape 2.1 : Créer la base de données Firestore
1. Dans le menu de gauche, cliquez sur **"Firestore Database"**
2. Cliquez sur **"Créer une base de données"**

### Étape 2.2 : Choisir le mode de sécurité
1. Sélectionnez **"Démarrer en mode test"** (pour le développement)
   - ⚠️ **Important** : Ce mode permet la lecture/écriture sans authentification pendant 30 jours
   - Vous pourrez modifier les règles de sécurité plus tard
2. Cliquez sur **Suivant**

### Étape 2.3 : Choisir l'emplacement
1. Sélectionnez un emplacement proche de vous (ex: `europe-west` pour l'Europe)
2. ⚠️ **Attention** : L'emplacement ne peut pas être changé après création
3. Cliquez sur **Activer**

Votre base de données Firestore est maintenant créée ! 🎉

---

## 3. Récupération des clés de configuration

### Étape 3.1 : Ajouter une application Web
1. Sur la page d'accueil du projet, cliquez sur l'icône **Web** `</>`
2. **Nom de l'application** : Entrez `Smash Tracker Web`
3. ✅ Cochez **"Configurer aussi Firebase Hosting"** (optionnel, pour GitHub Pages on n'en a pas besoin)
4. Cliquez sur **Enregistrer l'application**

### Étape 3.2 : Copier la configuration
Vous verrez un code JavaScript qui ressemble à ceci :

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "smash-ultimate-tracker.firebaseapp.com",
  projectId: "smash-ultimate-tracker",
  storageBucket: "smash-ultimate-tracker.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};
```

**📋 COPIEZ CES INFORMATIONS** - vous en aurez besoin pour le fichier `firebase-config.js`

---

## 4. Intégration dans le projet

### Étape 4.1 : Créer le fichier de configuration
1. Ouvrez le fichier `js/firebase-config.js` dans votre projet
2. Remplacez les valeurs `"YOUR_XXX_HERE"` par vos vraies valeurs copiées à l'étape 3.2

Exemple :
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX", // ← Votre vraie clé
  authDomain: "smash-ultimate-tracker.firebaseapp.com",
  projectId: "smash-ultimate-tracker",
  storageBucket: "smash-ultimate-tracker.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};
```

### Étape 4.2 : Vérifier les imports
Le fichier `index.html` doit déjà contenir ces lignes (déjà présentes dans le projet) :

```html
<!-- Firebase SDK -->
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore-compat.js"></script>

<!-- Configuration Firebase -->
<script src="js/firebase-config.js"></script>
```

---

## 5. Structure de la base de données

Votre base Firestore sera organisée comme suit :

```
📁 Firestore Database
│
├── 📂 sessions (collection)
│   ├── 📄 session_id_1 (document)
│   │   ├── name: "Soirée du vendredi"
│   │   ├── date: "2024-01-15"
│   │   ├── createdAt: timestamp
│   │   └── 📂 players (sous-collection)
│   │       ├── 📄 player_id_1
│   │       │   └── name: "Thomas"
│   │       └── 📄 player_id_2
│   │           └── name: "Alex"
│   │   └── 📂 matches (sous-collection)
│   │       ├── 📄 match_id_1
│   │       │   ├── player1: "Thomas"
│   │       │   ├── player2: "Alex"
│   │       │   ├── winner: "Thomas"
│   │       │   └── timestamp: timestamp
│   │       └── 📄 match_id_2
│   │           └── ...
│   └── 📄 session_id_2 (document)
│       └── ...
```

### Collections principales :
- **sessions** : Contient toutes les sessions de jeu
  - Chaque session a des sous-collections `players` et `matches`

---

## 6. Tester la connexion

### Étape 6.1 : Ouvrir la console du navigateur
1. Ouvrez `index.html` dans votre navigateur
2. Ouvrez la console développeur (F12)
3. Vous devriez voir : `✅ Firebase initialisé avec succès !`

### Étape 6.2 : Tester l'écriture dans Firestore
Dans la console du navigateur, tapez :

```javascript
// Créer une session de test
db.collection('sessions').add({
  name: 'Session de test',
  date: new Date().toISOString(),
  createdAt: firebase.firestore.FieldValue.serverTimestamp()
}).then((docRef) => {
  console.log('Session créée avec ID:', docRef.id);
});
```

### Étape 6.3 : Vérifier dans Firebase Console
1. Retournez sur [Firebase Console](https://console.firebase.google.com/)
2. Allez dans **Firestore Database**
3. Vous devriez voir votre collection `sessions` avec le document de test ! 🎉

### Étape 6.4 : Tester la lecture
Dans la console du navigateur :

```javascript
// Lire toutes les sessions
db.collection('sessions').get().then((querySnapshot) => {
  querySnapshot.forEach((doc) => {
    console.log(doc.id, ' => ', doc.data());
  });
});
```

---

## 🔒 Règles de sécurité (Important pour la production)

### Règles actuelles (mode test - 30 jours)
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.time < timestamp.date(2024, 2, 15);
    }
  }
}
```

### Règles recommandées pour la production
Quand vous serez prêt à déployer, modifiez les règles dans Firebase Console :

1. Allez dans **Firestore Database** > **Règles**
2. Remplacez par :

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permettre la lecture à tous
    match /{document=**} {
      allow read: if true;
    }
    
    // Permettre l'écriture uniquement pour les sessions
    match /sessions/{sessionId} {
      allow write: if true;
      
      // Sous-collections
      match /players/{playerId} {
        allow write: if true;
      }
      match /matches/{matchId} {
        allow write: if true;
      }
    }
  }
}
```

⚠️ **Note** : Ces règles permettent à tout le monde de lire et écrire. Pour une vraie application, vous devriez ajouter de l'authentification Firebase.

---

## 📚 Ressources utiles

- [Documentation Firebase](https://firebase.google.com/docs)
- [Documentation Firestore](https://firebase.google.com/docs/firestore)
- [Guide des requêtes Firestore](https://firebase.google.com/docs/firestore/query-data/queries)

---

## ✅ Checklist

- [ ] Projet Firebase créé
- [ ] Base de données Firestore activée (mode test)
- [ ] Configuration copiée dans `js/firebase-config.js`
- [ ] Test de connexion réussi dans la console
- [ ] Test d'écriture réussi
- [ ] Test de lecture réussi

Une fois tous ces points validés, vous êtes prêt à développer votre application ! 🚀

