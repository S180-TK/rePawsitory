import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css'  // Tailwind import
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

// Disable the old PWA service worker so deployments do not serve stale assets.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.getRegistrations()
      .then(registrations => {
        registrations.forEach(registration => registration.unregister());
      })
      .catch(error => {
        console.log('Service Worker cleanup failed:', error);
      });
  });
}
