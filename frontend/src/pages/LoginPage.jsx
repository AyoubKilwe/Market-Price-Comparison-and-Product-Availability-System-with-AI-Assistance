import React, { useState } from 'react';

export default function LoginPage({ onLoginSuccess, onViewChange }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Authentication failed');
      }

      // Success
      if (rememberMe) {
        localStorage.setItem('marketeye_token', data.token);
        localStorage.setItem('marketeye_user', JSON.stringify(data.user));
      }

      onLoginSuccess(data.user, data.token);
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
        <p className="login-subtitle">Sign in to your centralized dashboard.</p>

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

          {/* Password */}
          <div className="form-group">
            <div className="form-label-row">
              <label className="form-label" htmlFor="password-input">Password</label>
              <span className="form-link">Forgot password?</span>
            </div>
            <div className="input-wrapper">
              <span className="input-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password-input"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  // Eye icon
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                ) : (
                  // Eye slash icon
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61M2 2l20 20" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Remember Me */}
          <div className="form-checkbox-row">
            <input
              type="checkbox"
              id="remember"
              className="form-checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <label htmlFor="remember" style={{ cursor: 'pointer' }}>Remember me for 30 days</label>
          </div>

          {/* Submit */}
          <button type="submit" className="btn btn-black btn-submit" disabled={isLoading}>
            {isLoading ? 'Signing In...' : 'SIGN IN →'}
          </button>
        </form>

        {/* Info Box */}
        <div className="login-info-box">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M12 16v-4M12 8h.01"></path>
          </svg>
          <div>
            Redirecting to your dashboard based on account type (Vendor or Admin) upon successful authentication.
          </div>
        </div>

        {/* Register redirection */}
        <div className="login-card-footer">
          Don't have a vendor account?{' '}
          <span className="form-link" onClick={() => onViewChange('register')}>
            Register here
          </span>
        </div>
      </div>
      
      {/* Outer Links */}
      <div style={{ position: 'absolute', bottom: '24px', display: 'flex', gap: '20px', fontSize: '12px', color: 'var(--text-secondary)' }}>
        <span>Help Center</span>
        <span>Privacy Policy</span>
        <span>Terms of Service</span>
      </div>
    </div>
  );
}
