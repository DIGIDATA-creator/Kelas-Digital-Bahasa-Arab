import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerServiceWorker } from './utils/registerServiceWorker';

// Register Service Worker for offline PWA & materi caching
registerServiceWorker();

// Polyfills for legacy webviews & older Android browsers (e.g. Samsung Galaxy J7)
if (typeof window !== 'undefined') {
  if (typeof (window as any).globalThis === 'undefined') {
    (window as any).globalThis = window;
  }
  if (!Object.hasOwn) {
    Object.hasOwn = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop);
  }
  if (!Array.prototype.flat) {
    (Array.prototype as any).flat = function (depth = 1) {
      return depth > 0
        ? this.reduce((acc: any, val: any) => acc.concat(Array.isArray(val) ? val.flat(depth - 1) : val), [])
        : this.slice();
    };
  }
  if (!window.crypto) {
    (window as any).crypto = {};
  }
  if (!(window.crypto as any).randomUUID) {
    (window.crypto as any).randomUUID = function () {
      return '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, (c: any) =>
        (c ^ (crypto.getRandomValues ? crypto.getRandomValues(new Uint8Array(1))[0] : Math.floor(Math.random() * 256)) & (15 >> (c / 4))).toString(16)
      );
    };
  }
  if (typeof (window as any).structuredClone === 'undefined') {
    (window as any).structuredClone = (obj: any) => JSON.parse(JSON.stringify(obj));
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
