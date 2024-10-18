/*
 * WHAT IS THIS FILE?
 *
 * The service-worker.ts file is used to have state of the art prefetching.
 * https://qwik.dev/qwikcity/prefetching/overview/
 *
 * Qwik uses a service worker to speed up your site and reduce latency, ie, not used in the traditional way of offline.
 * You can also use this file to add more functionality that runs in the service worker.
 */
import { setupServiceWorker } from '@builder.io/qwik-city/service-worker';

// Configuration du service worker de Qwik pour la pré-population du cache
setupServiceWorker();

// Nom du cache et liste des fichiers statiques à mettre en cache
const offlineCacheName = 'offline-cache-v1';
const offlineAssets = [
  '/favicon.svg', // Favicon
  '/manifest.json', // Fichier manifest
  // Ajoute ici d'autres fichiers statiques que tu veux rendre disponibles offline
];

// Installation du service worker et mise en cache des ressources statiques
self.addEventListener('install', (event: ExtendableEvent) => {
  event.waitUntil(
    caches
      .open(offlineCacheName)
      .then((cache) => {
        // Ajout des fichiers statiques au cache
        return cache.addAll(offlineAssets);
      })
      .then(() => self.skipWaiting())
  );
});

// Activation du service worker et nettoyage des anciens caches
self.addEventListener('activate', (event: ExtendableEvent) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => cacheName !== offlineCacheName)
            .map((cacheName) => caches.delete(cacheName))
        );
      })
      .then(() => self.clients.claim())
  );
});

// Interception des requêtes réseau pour utiliser le cache si disponible
self.addEventListener('fetch', (event: FetchEvent) => {
  const url = new URL(event.request.url);

  // Si la requête concerne des ressources statiques comme des images, JS, CSS, vérifie dans le cache
  if (offlineAssets.some((asset) => url.pathname.startsWith(asset))) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        // Retourne la réponse depuis le cache si elle existe, sinon effectue la requête réseau
        return cachedResponse || fetch(event.request);
      })
    );
  }
});

declare const self: ServiceWorkerGlobalScope;
