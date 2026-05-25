import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { pizzaIngredients } from '../data/pizzaMenu';
import AddressForm from './AddressForm';

const loadRazorpayScript = () => new Promise(resolve => {
  if (window.Razorpay) {
    resolve(true);
    return;
  }

  const script = document.createElement('script');
  script.src = 'https://checkout.razorpay.com/v1/checkout.js';
  script.onload = () => resolve(true);
  script.onerror = () => resolve(false);
  document.body.appendChild(script);
});

const Cart = () => {
  const { user } = useAuth();
  const { items, removeFromCart, clearCart, totals } = useCart();
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [address, setAddress] = useState(null);

  const handleCheckoutClick = () => {
    setError(null);
    setMessage(null);
    setShowAddressForm(true);
  };

  const handleAddressSubmit = async (addressData) => {
    setAddress(addressData);
    setIsCheckingOut(true);

    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Unable to load Razorpay Checkout. Please check your internet connection.');
      }

      const cartItems = items.map(item => ({
        base: item.base,
        sauce: item.sauce,
        cheese: item.cheese,
        veggies: item.veggies || [],
        meats: item.meats || [],
        price: item.price,
        quantity: item.quantity || 1
      }));

      const { data } = await api.post('/payments/create-order', { items: cartItems });

      const razorpay = new window.Razorpay({
        key: data.keyId,
        amount: data.order.amount,
        currency: data.order.currency,
        name: 'Pizza Delivery',
        description: 'Pizza order payment',
        order_id: data.order.id,
        prefill: {
          name: user?.name || '',
          email: user?.email || ''
        },
        theme: {
          color: '#a83d19'
        },
        modal: {
          ondismiss: () => {
            setIsCheckingOut(false);
            setShowAddressForm(true);
          }
        },
        handler: async response => {
          try {
            await api.post('/payments/verify', {
              ...response,
              items: cartItems,
              deliveryAddress: addressData
            });
            clearCart();
            setShowAddressForm(false);
            setAddress(null);
            setMessage('Payment successful. Your order has been placed.');
            setError(null);
          } catch (err) {
            setError(err.response?.data?.message || 'Payment verification failed');
          } finally {
            setIsCheckingOut(false);
          }
        }
      });

      razorpay.on('payment.failed', response => {
        setError(response.error?.description || 'Payment failed. Please try again.');
        setIsCheckingOut(false);
        setShowAddressForm(true);
      });

      razorpay.open();
    } catch (err) {
      setError(err.response?.data?.message || 'Checkout failed');
      setIsCheckingOut(false);
      setShowAddressForm(true);
    }
  };

  const handleAddressCancel = () => {
    setShowAddressForm(false);
    setAddress(null);
    setIsCheckingOut(false);
  };

  return (
    <div className="cart-page">
      <section className="section-heading">
        <div>
          <span className="eyebrow">Your Cart</span>
          <h2>Review pizzas before checkout</h2>
        </div>
        <Link className="text-link" to="/dashboard">Add more</Link>
      </section>

      {message && (
        <div className="success cart-success">
          <span>{message}</span>
          <Link className="text-link" to="/profile">View orders</Link>
        </div>
      )}
      {error && <div className="error">{error}</div>}

      {items.length === 0 ? (
        <section className="empty-order-state">
          <h3>Your cart is empty</h3>
          <p>Pick from the menu or build a custom pizza.</p>
          <Link className="primary-button" to="/dashboard">Browse menu</Link>
        </section>
      ) : (
        <div className="cart-layout">
          <section className="cart-list">
            {items.map(item => (
              <article key={item.cartId} className="cart-item">
                <img src={item.image} alt={item.name || 'Custom pizza'} />
                <div>
                  <h3>{item.name || 'Custom Pizza'}</h3>
                  <p>{pizzaIngredients(item).join(', ')}</p>
                  <strong>₹{item.price}</strong>
                </div>
                <button type="button" className="link-button danger-link" onClick={() => removeFromCart(item.cartId)}>Remove</button>
              </article>
            ))}
          </section>

          <aside className="cart-summary">
            <h3>Bill Summary</h3>
            <div className="summary-line"><span>Items</span><strong>{totals.count}</strong></div>
            <div className="summary-total"><span>Total</span><strong>₹{totals.total}</strong></div>
            <button className="primary-button" type="button" onClick={handleCheckoutClick} disabled={isCheckingOut}>
              {isCheckingOut ? 'Opening payment...' : 'Pay with Razorpay'}
            </button>
          </aside>
        </div>
      )}

      {showAddressForm && (
        <AddressForm
          onSubmit={handleAddressSubmit}
          onCancel={handleAddressCancel}
          isLoading={isCheckingOut}
        />
      )}
    </div>
  );
};

export default Cart;
