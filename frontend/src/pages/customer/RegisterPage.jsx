import React, { useState } from 'react';
import customerApi from './customerApi';

export default function RegisterPage({ onRegisterSuccess, onViewChange }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      const data = await customerApi.register({ name, email, phone, password });

      onRegisterSuccess(data.user, data.token);
    } catch (err) {
      setErrorMessage(err.message || 'Cannot connect to backend server');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        {/* Brand Eye Logo Icon */}
        <div className="login-logo">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0z" />
            <circle cx="12" cy="12" r="3" fill="currentColor" />
          </svg>
        </div>

        <h2 className="login-title">MarketEye</h2>
        <p className="login-subtitle">Register a new vendor account.</p>

        {errorMessage && (
          <div
            style={{
              color: 'var(--color-error)',
              backgroundColor: '#fef2f2',
              border: '1px solid #fee2e2',
              borderRadius: '8px',
              padding: '10px 14px',
              width: '100%',
              fontSize: '13px',
              marginBottom: '16px',
              textAlign: 'left',
            }}
          >
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          {/* Name */}
          <div className="form-group">
            <label className="form-label" htmlFor="name-input">Full Name / Vendor Name</label>
            <div className="input-wrapper" style={{ marginTop: '6px' }}>
              <span className="input-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </span>
              <input
                type="text"
                id="name-input"
                className="form-input"
                placeholder="e.g. John Doe / FreshMart"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Email */}
          <div className="form-group">
            <label className="form-label" htmlFor="email-input">Email Address</label>
            <div className="input-wrapper" style={{ marginTop: '6px' }}>
              <span className="input-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                </svg>
              </span>
              <input
                type="email"
                id="email-input"
                className="form-input"
                placeholder="vendor@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Phone */}
          <div className="form-group">
            <label className="form-label" htmlFor="phone-input">Phone Number</label>
            <div className="input-wrapper" style={{ marginTop: '6px' }}>
              <span className="input-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
              </span>
              <input
                type="text"
                id="phone-input"
                className="form-input"
                placeholder="e.g. 252-63-444555"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="form-label" htmlFor="password-input">Password (Min 8 chars)</label>
            <div className="input-wrapper" style={{ marginTop: '6px' }}>
              <span className="input-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </span>
              <input
                type="password"
                id="password-input"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={8}
                required
              />
            </div>
          </div>

          {/* Submit */}
          <button type="submit" className="btn btn-black btn-submit" disabled={isLoading}>
            {isLoading ? 'Registering...' : 'REGISTER →'}
          </button>
        </form>

        {/* Redirect */}
        <div className="login-card-footer">
          Already have an account?{' '}
          <span className="form-link" onClick={() => onViewChange('login')}>
            Sign in here
          </span>
        </div>
      </div>
    </div>
  );
}
