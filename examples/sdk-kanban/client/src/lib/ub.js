import urBackend from '@urbackend/sdk';
import axios from 'axios';

// Initialize the SDK with the Publishable Key (PK)
// The PK is safe to expose in the browser.
const PK = import.meta.env.VITE_URBACKEND_PK;
const BASE_URL = import.meta.env.VITE_URBACKEND_API_URL || 'https://api.ub.bitbros.in';
const NOTIFY_SERVER_URL = import.meta.env.VITE_NOTIFY_SERVER_URL || 'http://localhost:4001';

if (!PK) {
  console.error('VITE_URBACKEND_PK is missing! Please add it to your .env file.');
}

export const client = urBackend({
  apiKey: PK,
  baseUrl: BASE_URL
});

/**
 * Helper to notify the server about task changes.
 * The server uses the Secret Key (SK) to send actual emails.
 */
export const notifyActivity = async (payload) => {
  try {
    await axios.post(`${NOTIFY_SERVER_URL}/api/notify`, payload);
  } catch (err) {
    console.error('Failed to send activity notification:', err.message);
  }
};

/**
 * Session Helpers
 */
export const storeSession = (token, refreshToken) => {
  localStorage.setItem('ub_token', token);
  if (refreshToken) localStorage.setItem('ub_refresh', refreshToken);
};

export const getSessionToken = () => localStorage.getItem('ub_token');

export const clearSession = () => {
  localStorage.removeItem('ub_token');
  localStorage.removeItem('ub_refresh');
};
