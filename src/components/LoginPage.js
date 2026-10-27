import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import './AuthPages.css';

const LoginPage = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFieldErrors({});

    if (!form.email.trim()) {
      setFieldErrors({ email: 'Email is required' });
      return;
    }
    if (!/\S+@\S+\.\S+/.test(form.email)) {
      setFieldErrors({ email: 'Please enter a valid email address' });
      return;
    }
    if (!form.password) {
      setFieldErrors({ password: 'Password is required' });
      return;
    }

    setLoading(true);
    try {
      const user = await login(form.email.trim().toLowerCase(), form.password);
      success(`Welcome back${user?.first_name ? ', ' + user.first_name : ''}!`);
      if (user?.is_staff || user?.is_superuser || user?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      // Handles "Cannot read properties of null (reading 'access')"
      // This fires when api.js receives an unexpected response shape from Django
      if (err instanceof TypeError && err.message?.includes('null')) {
        error('Login service error. Please try again.');
        setFieldErrors({ password: 'Unexpected server response. Please try again.' });
        return;
      }

      const data = err.response?.data;
      const status = err.response?.status;
      const rawMsg =
        data?.detail ||
        data?.non_field_errors?.[0] ||
        data?.email?.[0] ||
        data?.password?.[0] ||
        err.message ||
        '';
      const lower = rawMsg.toLowerCase();

      if (
        status === 401 ||
        lower.includes('no active account') ||
        lower.includes('not found') ||
        lower.includes('does not exist') ||
        lower.includes('no account')
      ) {
        setFieldErrors({ email: 'No account found with this email' });
        error('No account found. Please register first.');
      } else if (
        lower.includes('invalid') ||
        lower.includes('incorrect') ||
        lower.includes('wrong') ||
        lower.includes('credential') ||
        lower.includes('password')
      ) {
        setFieldErrors({ password: 'Incorrect password. Please try again.' });
        error('Incorrect password. Please try again.');
      } else if (lower.includes('email')) {
        setFieldErrors({ email: rawMsg });
        error(rawMsg);
      } else if (rawMsg) {
        setFieldErrors({ password: rawMsg });
        error(rawMsg);
      } else {
        setFieldErrors({ password: 'Something went wrong. Please try again.' });
        error('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const clearFieldError = (field) => {
    if (fieldErrors[field]) setFieldErrors(prev => ({ ...prev, [field]: null }));
  };

  return (
    <div className="auth-page page-wrapper">
      <div className="auth-container">
        <div className="auth-brand">
          <span className="auth-logo-main">NAYRA</span>
          <span className="auth-logo-sub">FASHIONS</span>
        </div>

        <h1 className="auth-title">Welcome Back</h1>
        <p className="auth-subtitle">Sign in to your account</p>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>

          <div className={`form-group ${fieldErrors.email ? 'form-group--error' : ''}`}>
            <label htmlFor="email">EMAIL ADDRESS</label>
            <input
              id="email"
              type="email"
              required
              value={form.email}
              onChange={e => { setForm(p => ({ ...p, email: e.target.value })); clearFieldError('email'); }}
              placeholder="your@email.com"
              className={fieldErrors.email ? 'input--error' : ''}
              autoComplete="email"
              disabled={loading}
            />
            {fieldErrors.email && (
              <span className="field-error" role="alert">
                <span className="field-error-icon">!</span>
                {fieldErrors.email}
              </span>
            )}
          </div>

          <div className={`form-group ${fieldErrors.password ? 'form-group--error' : ''}`}>
            <label htmlFor="password">PASSWORD</label>
            <div className="input-wrapper">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={form.password}
                onChange={e => { setForm(p => ({ ...p, password: e.target.value })); clearFieldError('password'); }}
                placeholder="••••••••"
                className={fieldErrors.password ? 'input--error' : ''}
                autoComplete="current-password"
                disabled={loading}
              />
              <button
                type="button"
                className="input-toggle"
                onClick={() => setShowPassword(v => !v)}
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? '🙈' : '👁'}
              </button>
            </div>
            {fieldErrors.password && (
              <span className="field-error" role="alert">
                <span className="field-error-icon">!</span>
                {fieldErrors.password}
              </span>
            )}
          </div>

          <button type="submit" className="btn-gold auth-btn" disabled={loading}>
  {loading ? 'SIGNING IN...' : 'SIGN IN'}
</button>

        </form>

        <div className="auth-divider"><span>or</span></div>
        <p className="auth-switch">
          Don't have an account? <Link to="/register">Create one</Link>
        </p>
      </div>

      <div className="auth-visual">
        <div className="auth-visual-overlay" />
        <div className="auth-visual-text">
          <p>Elegance</p>
          <p>Redefined</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;