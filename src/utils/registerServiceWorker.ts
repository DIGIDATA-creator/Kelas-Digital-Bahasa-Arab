import { offlineCacheService } from '../services/offlineCacheService';
import { Materi } from '../types';

export function registerServiceWorker() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  // In development / preview mode, unregister any stale service workers to prevent cache conflicts
  if (import.meta.env.DEV) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        registration.unregister();
      }
    }).catch(() => {});
    return;
  }

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        // Check for updates
        registration.onupdatefound = () => {
          const installingWorker = registration.installing;
          if (!installingWorker) return;

          installingWorker.onstatechange = () => {
            if (installingWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                console.log('[ServiceWorker] New content available; please refresh.');
              }
            }
          };
        };
      })
      .catch((error) => {
        console.warn('[ServiceWorker] Registration failed:', error);
      });
  });
}

export function syncServiceWorkerMateriCache(materiList: Materi[]) {
  if (typeof navigator !== 'undefined' && navigator.serviceWorker && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: 'CACHE_MATERI_DATA',
      materiList,
    });
  }
  offlineCacheService.cacheAllMateriAndKosakata(materiList);
}
