import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { calculatePizzaPrice, featuredPizzas } from '../data/pizzaMenu';

const Dashboard = () => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [orders, setOrders] = useState([]);
  const [activeFilter, setActiveFilter] = useState('All');
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const filters = ['All', 'Veg', 'Vegan', 'Non-veg'];

  useEffect(() => {
    const load = async () => {
      try {
        const ordersResp = await api.get('/orders/my');
        setOrders(ordersResp.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load dashboard');
      }
    };
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, []);

  const addPresetPizza = pizza => {
    addToCart({
      ...pizza,
      price: pizza.menuPrice || calculatePizzaPrice(pizza)
    });
    setMessage(`${pizza.name} added to cart.`);
    setError(null);
  };

  const totalItems = featuredPizzas.length;
  const filteredPizzas = activeFilter === 'All'
    ? featuredPizzas
    : featuredPizzas.filter(pizza => pizza.badge === activeFilter);
  const latestOrder = orders[0];

  return (
    <div className="dashboard-page">
      <section className="dashboard-hero">
        <div className="dashboard-hero-copy">
          <span className="eyebrow">Welcome, {user?.name}</span>
          <h1>Build a pizza that feels made for you.</h1>
          <p>Browse fresh ingredients, create your own combination, and track every kitchen update from your dashboard.</p>
          <Link className="primary-button" to="/builder">Start Building</Link>
        </div>
        <div className="dashboard-hero-media">
          <img src="/images/dashboard-pizza.png" alt="Fresh pizza in a delivery box" />
        </div>
      </section>

      {error && <div className="error">{error}</div>}
      {message && <div className="success">{message}</div>}

      <section className="metrics-row">
        <div className="metric-card">
          <span>Menu Pizzas</span>
          <strong>{totalItems || '--'}</strong>
        </div>
        <div className="metric-card">
          <span>Your Orders</span>
          <strong>{orders.length}</strong>
        </div>
        <div className="metric-card">
          <span>Latest Status</span>
          <strong>{latestOrder?.status || 'Ready'}</strong>
        </div>
      </section>

      <section className="section-heading">
        <div>
          <span className="eyebrow">Pizza Menu</span>
          <h2>Popular pizzas</h2>
        </div>
        <div className="menu-filter-row">
          {filters.map(filter => (
            <button
              key={filter}
              type="button"
              className={activeFilter === filter ? 'active' : ''}
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>
      </section>

      <section className="pizza-menu-grid">
        {filteredPizzas.map(pizza => (
          <article key={pizza.id} className="pizza-menu-card">
            <div className="pizza-card-image-wrap">
              <img src={pizza.image} alt={pizza.name} />
              {pizza.featured && <span className="featured-pill">Featured</span>}
              <span className={`type-pill ${pizza.badge === 'Non-veg' ? 'nonveg' : pizza.badge === 'Vegan' ? 'vegan' : 'veg'}`}>{pizza.badge}</span>
            </div>
            <div className="pizza-menu-card-body">
              <div className="pizza-card-title">
                <h3>{pizza.name}</h3>
              </div>
              <p>{pizza.description}</p>
              <div className="pizza-card-actions">
                <div>
                  <strong>₹{pizza.menuPrice || calculatePizzaPrice(pizza)}</strong>
                  <span className="rating-line">★ {pizza.rating || 4.5}</span>
                </div>
                <button type="button" className="primary-button" onClick={() => addPresetPizza(pizza)}>Add +</button>
              </div>
            </div>
          </article>
        ))}
      </section>

      <div className="menu-customize-link">
        <Link className="text-link" to="/builder">Customize your own pizza</Link>
      </div>

      <section className="section-heading">
        <div>
          <span className="eyebrow">Live Tracking</span>
          <h2>Your Orders</h2>
        </div>
      </section>

      {orders.length === 0 ? (
        <section className="empty-order-state">
          <h3>No orders yet</h3>
          <p>Your custom pizza journey starts in the builder.</p>
          <Link className="primary-button" to="/builder">Create first order</Link>
        </section>
      ) : (
        <section className="orders-list polished">
          {orders.map(order => (
            <article key={order._id} className="order-card">
              <div>
                <strong>Order #{order._id.slice(-6)}</strong>
                <p>{order.base} / {order.sauce} / {order.cheese}</p>
                <p>Veggies: {order.veggies.join(', ') || 'None'}</p>
                <p>Meat: {order.meats.join(', ') || 'None'}</p>
              </div>
              <div className="order-card-side">
                <span className="status-pill">{order.status}</span>
                <strong>₹{order.price}</strong>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
};

export default Dashboard;
