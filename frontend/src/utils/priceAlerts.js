import { useEffect, useState } from 'react';
import { api } from '../services/api';

const CLIENT_KEY = 'marketeye_customer_browser_id';
const CHANGE_EVENT = 'marketeye:price-alerts-changed';

export const getPriceAlertClientId = () => {
  let id = localStorage.getItem(CLIENT_KEY);
  if (!id) {
    id = globalThis.crypto?.randomUUID?.() || `customer-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(CLIENT_KEY, id);
  }
  return id;
};

const options = () => ({ headers: { 'X-MarketEye-Client-Id': getPriceAlertClientId() } });

export const priceAlertApi = {
  getAlerts: () => api.get('/api/price-alerts', options()),
  addAlert: (productId) => api.post('/api/price-alerts', { productId }, options()),
  removeAlert: (productId) => api.delete(`/api/price-alerts/${productId}`, options()),
  getNotifications: () => api.get('/api/price-alerts/notifications', options()),
  markRead: () => api.patch('/api/price-alerts/notifications/read', {}, options()),
};

export const announcePriceAlertChange = () => window.dispatchEvent(new CustomEvent(CHANGE_EVENT));

export function usePriceAlertSummary() {
  const [summary, setSummary] = useState({ alertIds: [], unreadCount: 0 });
  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const [alerts, notifications] = await Promise.all([priceAlertApi.getAlerts(), priceAlertApi.getNotifications()]);
        if (active) setSummary({ alertIds: (alerts.alerts || []).map((item) => item.product?._id), unreadCount: notifications.unreadCount || 0 });
      } catch { /* API may be offline; keep navigation usable. */ }
    };
    load();
    const interval = window.setInterval(load, 30000);
    window.addEventListener(CHANGE_EVENT, load);
    return () => { active = false; window.clearInterval(interval); window.removeEventListener(CHANGE_EVENT, load); };
  }, []);
  return summary;
}
