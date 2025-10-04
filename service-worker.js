const cacheName = 'color-splash-v1';
const assetsToCache = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './images/icon.png',
  './images/eraser.png',
  './images/apple.png',
  './images/banana.png',
  './images/orange.png',
  './images/mango.png',
  './images/watermelon.png',
  './sounds/brush.mp3',
  './sounds/eraser.mp3',
  './sounds/click.mp3',
  './sounds/fruit-load.mp3',
  './sounds/background.mp3'
];

self.addEventListener('install', e => e.waitUntil(caches.open(cacheName).then(c=>c.addAll(assetsToCache))));
self.addEventListener('fetch', e => e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request))));
