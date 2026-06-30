import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const success = useCallback((msg) => addToast(msg, 'success'), [addToast]);
  const error   = useCallback((msg) => addToast(msg, 'error'), [addToast]);
  const info    = useCallback((msg) => addToast(msg, 'info'), [addToast]);

  return (
    <ToastContext.Provider value={{ success, error, info }}>
      {children}

      {/* Toast Container */}
      <div style={styles.container}>
        {toasts.map(t => (
          <div
            key={t.id}
            style={{ ...styles.toast, ...styles[t.type] }}
            onClick={() => removeToast(t.id)}
          >
            <span style={styles.icon}>{icons[t.type]}</span>
            <span style={styles.message}>{t.message}</span>
            <button style={styles.close} onClick={() => removeToast(t.id)}>✕</button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

const icons = {
  success: '✓',
  error: '✕',
  info: 'ℹ',
};

const styles = {
  container: {
    position: 'fixed',
    bottom: '24px',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 99999,
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    alignItems: 'center',
    pointerEvents: 'none',
    width: '90%',
    maxWidth: '420px',
  },
  toast: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '14px 18px',
    borderRadius: '8px',
    fontSize: '14px',
    fontFamily: "'Cormorant Garamond', Georgia, serif",
    letterSpacing: '0.02em',
    boxShadow: '0 4px 20px rgba(0,0,0,0.18)',
    pointerEvents: 'auto',
    cursor: 'pointer',
    width: '100%',
    animation: 'toastIn 0.3s ease',
    transition: 'all 0.2s ease',
  },
  success: {
  background: '#6b1f1f',
  color: '#f5ede0',
  border: '1px solid rgba(245,237,224,0.2)',
},
  error: {
    background: '#5a1a1a',
    color: '#fde8e8',
    border: '1px solid #e53e3e44',
  },
  info: {
    background: '#1a2a4a',
    color: '#e8eef8',
    border: '1px solid #4a90e244',
  },
  icon: {
    fontSize: '16px',
    fontWeight: 'bold',
    flexShrink: 0,
  },
  message: {
    flex: 1,
    lineHeight: 1.4,
  },
  close: {
    background: 'none',
    border: 'none',
    color: 'inherit',
    cursor: 'pointer',
    opacity: 0.7,
    fontSize: '12px',
    padding: '0 2px',
    flexShrink: 0,
  },
};

export const useToast = () => useContext(ToastContext);