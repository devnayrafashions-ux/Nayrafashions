import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import './AuthPages.css';

const RegisterPage = () => {
  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
  });
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { register } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const handleChange = (name, value) => {
    setForm(p => ({ ...p, [name]: value }));
    if (fieldErrors[name]) setFieldErrors(p => ({ ...p, [name]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFieldErrors({});

    if (!form.first_name.trim()) {
      setFieldErrors({ first_name: 'First name is required' });
      return;
    }
    if (!form.email.trim()) {
      setFieldErrors({ email: 'Email is required' });
      return;
    }
    if (!/\S+@\S+\.\S+/.test(form.email)) {
      setFieldErrors({ email: 'Please enter a valid email address' });
      return;
    }
    if (form.password.length < 8) {
      setFieldErrors({ password: 'Password must be at least 8 characters' });
      return;
    }
    if (form.password !== form.confirmPassword) {
      setFieldErrors({ confirmPassword: 'Passwords do not match' });
      error('Passwords do not match. Please try again.');
      return;
    }

    setLoading(true);
    try {
      const user = await register({
        email: form.email.trim().toLowerCase(),
        password: form.password,
        confirm_password: form.confirmPassword,
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
      });
      success(`Welcome to Nayra Fashions${user?.first_name ? ', ' + user.first_name : ''}!`);
      navigate('/');
    } catch (err) {
      // Handles "Cannot read properties of null (reading 'access')"
      if (err instanceof TypeError && err.message?.includes('null')) {
        error('Registration service error. Please try again.');
        return;
      }

      const data = err.response?.data;

      if (data && typeof data === 'object') {
        const newErrors = {};
        if (data.email)      newErrors.email      = Array.isArray(data.email)      ? data.email[0]      : data.email;
        if (data.password)   newErrors.password   = Array.isArray(data.password)   ? data.password[0]   : data.password;
        if (data.first_name) newErrors.first_name = Array.isArray(data.first_name) ? data.first_name[0] : data.first_name;
        if (data.last_name)  newErrors.last_name  = Array.isArray(data.last_name)  ? data.last_name[0]  : data.last_name;

        const nonField = data.non_field_errors;
        if (nonField) error(Array.isArray(nonField) ? nonField[0] : nonField);

        if (newErrors.email) {
          const el = newErrors.email.toLowerCase();
          if (el.includes('already') || el.includes('exists') || el.includes('unique') || el.includes('taken')) {
            newErrors.email = 'An account with this email already exists';
            error('This email is already registered. Please sign in instead.');
          } else {
            error(newErrors.email);
          }
        } else if (newErrors.password) {
          error(newErrors.password);
        }

        if (Object.keys(newErrors).length > 0) {
          setFieldErrors(newErrors);
          return;
        }
      }

      const msg = err.message || 'Registration failed. Please try again.';
      const lower = msg.toLowerCase();
      if (lower.includes('email') && (lower.includes('exist') || lower.includes('already'))) {
        setFieldErrors({ email: 'An account with this email already exists' });
        error('This email is already registered. Please sign in instead.');
      } else if (lower.includes('email')) {
        setFieldErrors({ email: msg });
        error(msg);
      } else if (lower.includes('password')) {
        setFieldErrors({ password: msg });
        error(msg);
      } else {
        error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page page-wrapper">
      <div className="auth-container">
        <div className="auth-brand">
          <span className="auth-logo-main">NAYRA</span>
          <span className="auth-logo-sub">FASHIONS</span>
        </div>
        <h1 className="auth-title">Create Account</h1>
        <p className="auth-subtitle">Join us today</p>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>

          <div className="form-row">
            <div className={`form-group ${fieldErrors.first_name ? 'form-group--error' : ''}`}>
              <label>FIRST NAME</label>
              <input
                type="text"
                required
                value={form.first_name}
                onChange={e => handleChange('first_name', e.target.value)}
                placeholder="Sara"
                className={fieldErrors.first_name ? 'input--error' : ''}
                disabled={loading}
              />
              {fieldErrors.first_name && (
                <span className="field-error">
                  <span className="field-error-icon">!</span>
                  {fieldErrors.first_name}
                </span>
              )}
            </div>

            <div className={`form-group ${fieldErrors.last_name ? 'form-group--error' : ''}`}>
              <label>LAST NAME</label>
              <input
                type="text"
                value={form.last_name}
                onChange={e => handleChange('last_name', e.target.value)}
                placeholder="Ali"
                className={fieldErrors.last_name ? 'input--error' : ''}
                disabled={loading}
              />
              {fieldErrors.last_name && (
                <span className="field-error">
                  <span className="field-error-icon">!</span>
                  {fieldErrors.last_name}
                </span>
              )}
            </div>
          </div>

          <div className={`form-group ${fieldErrors.email ? 'form-group--error' : ''}`}>
            <label>EMAIL ADDRESS</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={e => handleChange('email', e.target.value)}
              placeholder="your@email.com"
              className={fieldErrors.email ? 'input--error' : ''}
              disabled={loading}
            />
            {fieldErrors.email && (
              <span className="field-error">
                <span className="field-error-icon">!</span>
                {fieldErrors.email}
              </span>
            )}
          </div>

          <div className={`form-group ${fieldErrors.password ? 'form-group--error' : ''}`}>
            <label>PASSWORD</label>
            <div className="input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={form.password}
                onChange={e => handleChange('password', e.target.value)}
                placeholder="Min. 8 characters"
                className={fieldErrors.password ? 'input--error' : ''}
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
              <span className="field-error">
                <span className="field-error-icon">!</span>
                {fieldErrors.password}
              </span>
            )}
          </div>

          <div className={`form-group ${fieldErrors.confirmPassword ? 'form-group--error' : ''}`}>
            <label>CONFIRM PASSWORD</label>
            <div className="input-wrapper">
              <input
                type={showConfirm ? 'text' : 'password'}
                required
                value={form.confirmPassword}
                onChange={e => handleChange('confirmPassword', e.target.value)}
                placeholder="••••••••"
                className={fieldErrors.confirmPassword ? 'input--error' : ''}
                disabled={loading}
              />
              <button
                type="button"
                className="input-toggle"
                onClick={() => setShowConfirm(v => !v)}
                tabIndex={-1}
                aria-label={showConfirm ? 'Hide password' : 'Show password'}
              >
                {showConfirm ? '🙈' : '👁'}
              </button>
            </div>
            {fieldErrors.confirmPassword && (
              <span className="field-error">
                <span className="field-error-icon">!</span>
                {fieldErrors.confirmPassword}
              </span>
            )}
          </div>

          <button type="submit" className="btn-gold auth-btn" disabled={loading}>
            {loading ? (
              <span className="btn-loading">
                <span className="spinner" />
                CREATING ACCOUNT...
              </span>
            ) : 'CREATE ACCOUNT'}
          </button>

        </form>

        <div className="auth-divider"><span>or</span></div>
        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
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

export default RegisterPage;