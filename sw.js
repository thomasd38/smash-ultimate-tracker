// ===================================
// Service Worker pour Smash Ultimate Tracker
// ===================================

const CACHE_NAME = 'smash-tracker-v7';
const urlsToCache = [
  './',
  './index.html',
  './session.html',
  './stats.html',
  './player-stats.html',
  './players.html',
  './backup.html',
  './css/style.css',
  './js/app.js',
  './js/auth.js',
  './js/characters-data.js',
  './js/firebase-config.js',
  './js/init-database.js',
  './js/navbar.js',
  './js/session.js',
  './js/snackbar.js',
  './js/stats.js',
  './js/player-stats.js',
  './js/players.js',
  './icon.png',
  './manifest.json'
];

// Installation du Service Worker
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker: Installation en cours...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 Service Worker: Mise en cache des fichiers');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('✅ Service Worker: Installation terminée');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('❌ Service Worker: Erreur lors de l\'installation', error);
      })
  );
});

// Activation du Service Worker
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker: Activation en cours...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Service Worker: Suppression de l\'ancien cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('✅ Service Worker: Activation terminée');
      return self.clients.claim();
    })
  );
});

// Stratégie de cache: Network First (réseau d'abord, puis cache)
// Idéal pour une app avec données en temps réel (Firebase)
self.addEventListener('fetch', (event) => {
  // Ignorer les requêtes non-GET
  if (event.request.method !== 'GET') {
    return;
  }

  // Ignorer les requêtes Firebase et externes
  if (
    event.request.url.includes('firebasestorage.googleapis.com') ||
    event.request.url.includes('firebaseio.com') ||
    event.request.url.includes('googleapis.com') ||
    event.request.url.includes('gstatic.com') ||
    event.request.url.includes('cdn.jsdelivr.net') ||
    event.request.url.includes('cdnjs.cloudflare.com') ||
    event.request.url.includes('smashbros.com')
  ) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Si la requête réseau réussit, mettre à jour le cache
        if (response && response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // Si le réseau échoue, utiliser le cache
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            console.log('📦 Service Worker: Récupération depuis le cache', event.request.url);
            return cachedResponse;
          }
          
          // Si pas de cache, retourner une page d'erreur basique
          if (event.request.headers.get('accept').includes('text/html')) {
            return new Response(
              `<!DOCTYPE html>
              <html lang="fr">
              <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Hors ligne - Smash Tracker</title>
                <style>
                  body {
                    font-family: Arial, sans-serif;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                    margin: 0;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    text-align: center;
                  }
                  .container {
                    padding: 2rem;
                  }
                  h1 {
                    font-size: 3rem;
                    margin-bottom: 1rem;
                  }
                  p {
                    font-size: 1.2rem;
                  }
                </style>
              </head>
              <body>
                <div class="container">
                  <h1>🎮 Hors ligne</h1>
                  <p>Vous êtes actuellement hors ligne.</p>
                  <p>Veuillez vérifier votre connexion Internet.</p>
                </div>
              </body>
              </html>`,
              {
                headers: { 'Content-Type': 'text/html' }
              }
            );
          }
        });
      })
  );
});

