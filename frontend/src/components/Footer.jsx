export default function Footer({ onViewChange, onLandingSection }) {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div>
          <div className="footer-logo">MarketEye</div>
          <div>© {new Date().getFullYear()} MarketEye Analytics. All rights reserved.</div>
        </div>
        <div className="footer-links">
          <button type="button" onClick={() => onLandingSection('about')} className="footer-link">About Us</button>
          <button type="button" onClick={() => onLandingSection('comparison-search')} className="footer-link">Compare Prices</button>
          <button type="button" onClick={() => onViewChange('shop-catalog')} className="footer-link">Shops</button>
          <button type="button" onClick={() => onViewChange('login')} className="footer-link">Vendor Portal</button>
        </div>
      </div>
    </footer>
  );
}
