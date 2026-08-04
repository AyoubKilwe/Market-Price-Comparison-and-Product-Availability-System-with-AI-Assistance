import React from 'react';

export default function Footer({ onViewChange }) {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div>
          <div className="footer-logo">MarketEye</div>
          <div>© {new Date().getFullYear()} MarketEye Analytics. All rights reserved.</div>
        </div>
        <div className="footer-links">
          <a href="#about" className="footer-link">About Us</a>
          <a href="#terms" className="footer-link">Terms of Service</a>
          <a href="#privacy" className="footer-link">Privacy Policy</a>
          <span style={{ cursor: 'pointer' }} onClick={() => onViewChange('login')} className="footer-link">Vendor Portal</span>
          <a href="#api" className="footer-link">API Support</a>
        </div>
      </div>
    </footer>
  );
}
