import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

// Use a per-user localStorage key so carts never bleed between accounts
const cartKey = (userId) => userId ? `nayra_cart_${userId}` : null;

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState([]);

  // ── Load the correct cart whenever the logged-in user changes ──
  useEffect(() => {
    const key = cartKey(user?.id);
    if (!key) {
      // No user logged in → empty cart, don't persist
      setCart([]);
      return;
    }
    try {
      const saved = JSON.parse(localStorage.getItem(key)) || [];
      setCart(saved);
    } catch {
      setCart([]);
    }
  }, [user?.id]);

  // ── Persist cart to the correct user's key on every change ──
  useEffect(() => {
    const key = cartKey(user?.id);
    if (!key) return; // Don't save if no user logged in
    localStorage.setItem(key, JSON.stringify(cart));
  }, [cart, user?.id]);

  const addToCart = (product, variant = null, quantity = 1) => {
    setCart(prev => {
      const key = `${product.id}-${product.selectedSize || ''}-${variant?.id || 'default'}`;
      const existing = prev.find(item => item.key === key);
      if (existing) {
        return prev.map(item =>
          item.key === key ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prev, { key, product, variant, quantity, selectedSize: product.selectedSize || null }];
    });
  };

  const removeFromCart = (key) => setCart(prev => prev.filter(item => item.key !== key));

  const updateQuantity = (key, quantity) => {
    if (quantity < 1) return removeFromCart(key);
    setCart(prev => prev.map(item => item.key === key ? { ...item, quantity } : item));
  };

  const clearCart = () => {
    setCart([]);
    const key = cartKey(user?.id);
    if (key) localStorage.removeItem(key);
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, cartCount, cartTotal, addToCart, removeFromCart, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);