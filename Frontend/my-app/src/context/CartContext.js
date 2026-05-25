import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';
import { calculatePizzaPrice, pizzaImagePool } from '../data/pizzaMenu';

const CartContext = createContext(null);

const getCartStorageKey = user => {
  if (!user?.email) return null;
  return `cartItems:${user.email.toLowerCase()}`;
};

const loadCartItems = storageKey => {
  if (!storageKey) return [];

  try {
    const stored = localStorage.getItem(storageKey);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const createCartItem = (pizza, imageIndex) => ({
  ...pizza,
  cartId: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
  image: pizza.image || pizzaImagePool[imageIndex % pizzaImagePool.length],
  quantity: pizza.quantity || 1,
  price: pizza.price || calculatePizzaPrice(pizza)
});

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const cartStorageKey = getCartStorageKey(user);
  const [items, setItems] = useState(() => loadCartItems(cartStorageKey));

  useEffect(() => {
    setItems(loadCartItems(cartStorageKey));
  }, [cartStorageKey]);

  const addToCart = pizza => {
    if (!cartStorageKey) return;

    setItems(currentItems => {
      const nextItems = [...currentItems, createCartItem(pizza, currentItems.length)];
      localStorage.setItem(cartStorageKey, JSON.stringify(nextItems));
      return nextItems;
    });
  };

  const removeFromCart = cartId => {
    if (!cartStorageKey) return;

    setItems(currentItems => {
      const nextItems = currentItems.filter(item => item.cartId !== cartId);
      localStorage.setItem(cartStorageKey, JSON.stringify(nextItems));
      return nextItems;
    });
  };

  const clearCart = () => {
    if (cartStorageKey) {
      localStorage.removeItem(cartStorageKey);
    }
    setItems([]);
  };

  const totals = useMemo(() => {
    const count = items.reduce((sum, item) => sum + item.quantity, 0);
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    return { count, total };
  }, [items]);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, clearCart, totals }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
