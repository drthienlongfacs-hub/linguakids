import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { bootstrapBrandProtection } from './utils/bootstrapBrandProtection';
import { bootstrapPremiumEntitlementSync } from './services/premiumService';

bootstrapBrandProtection();
bootstrapPremiumEntitlementSync().catch((error) => {
  console.warn('premium_bootstrap_sync_failed', error);
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
