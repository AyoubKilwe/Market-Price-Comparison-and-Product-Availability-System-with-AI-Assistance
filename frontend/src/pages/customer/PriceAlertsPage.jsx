import { useEffect, useState } from 'react';
import { announcePriceAlertChange, priceAlertApi } from '../../utils/priceAlerts';

const formatDate = (value) => new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));

export default function PriceAlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([priceAlertApi.getAlerts(), priceAlertApi.getNotifications()])
      .then(([alertData, notificationData]) => { setAlerts(alertData.alerts || []); setNotifications(notificationData.notifications || []); })
      .catch((err) => setError(err.message || 'Could not load price alerts.'))
      .finally(() => setLoading(false));
  }, []);

  const remove = async (productId) => {
    await priceAlertApi.removeAlert(productId);
    setAlerts((items) => items.filter((item) => item.product?._id !== productId));
    announcePriceAlertChange();
  };

  const markRead = async () => {
    await priceAlertApi.markRead();
    setNotifications((items) => items.map((item) => ({ ...item, isRead: true })));
    announcePriceAlertChange();
  };

  const unread = notifications.filter((item) => !item.isRead).length;
  return (
    <main className="container price-alerts-page">
      <header className="price-alerts-header">
        <div><span>Live product tracking</span><h1>Price Alerts</h1><p>Get notified when a vendor changes a tracked product's price, stock, or availability.</p></div>
        {unread > 0 && <button type="button" onClick={markRead}>Mark all as read ({unread})</button>}
      </header>
      {error && <div className="price-alert-error">{error}</div>}
      {loading ? <div className="favourites-empty">Loading your price alerts...</div> : (
        <>
          <section className="tracked-products"><h2>Tracked products <span>{alerts.length}</span></h2>
            {alerts.length ? <div className="tracked-product-grid">{alerts.map(({ product, currentListing }) => (
              <article key={product._id} className="tracked-product-card">
                <div className="tracked-product-image">{product.image ? <img src={product.image} alt="" /> : product.name?.[0]}</div>
                <div><small>{product.category}</small><h3>{product.name}</h3><p>{currentListing ? `${currentListing.shop?.shopName} · ${currentListing.stockStatus}` : 'Currently unavailable'}</p></div>
                <strong>{currentListing ? `$${currentListing.price.toFixed(2)}` : '—'}</strong>
                <button type="button" onClick={() => remove(product._id)}>Remove alert</button>
              </article>
            ))}</div> : <div className="favourites-empty"><strong>No tracked products yet</strong><span>Open a product comparison on Home and select “Track Price”.</span></div>}
          </section>
          <section className="price-notifications"><h2>Notifications <span>{notifications.length}</span></h2>
            {notifications.length ? notifications.map((item) => <article className={item.isRead ? '' : 'unread'} key={item._id}>
              <div className={`notification-change-icon ${item.changeType}`}>{item.changeType === 'price_decrease' ? '↓' : item.changeType === 'price_increase' ? '↑' : '!'}</div>
              <div><strong>{item.product?.name || 'Product update'}</strong><p>{item.message}</p><small>{formatDate(item.createdAt)}</small></div>
              {!item.isRead && <span>New</span>}
            </article>) : <div className="favourites-empty"><strong>No notifications yet</strong><span>Vendor price and stock changes will appear here.</span></div>}
          </section>
        </>
      )}
    </main>
  );
}
