import React, { useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { pizzaImagePool } from '../data/pizzaMenu';

const Profile = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadProfileData = async () => {
      try {
        if (user?.role === 'admin') {
          const [ordersResp, inventoryResp] = await Promise.all([
            api.get('/admin/orders'),
            api.get('/admin/inventory')
          ]);
          setOrders(ordersResp.data);
          setInventory(inventoryResp.data);
        } else {
          const { data } = await api.get('/orders/my');
          setOrders(data);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load profile');
      }
    };
    loadProfileData();
  }, [user?.role]);

  const totalSpent = orders.reduce((sum, order) => sum + order.price, 0);
  const lastOrder = orders[0];
  const lowStockItems = inventory.filter(item => item.stock < item.threshold);
  const totalStock = inventory.reduce((sum, item) => sum + item.stock, 0);
  const activeOrders = orders.filter(order => order.status !== 'sent to delivery').length;
  const formatDate = value => new Date(value).toLocaleString([], {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="profile-page">
      <section className="profile-header">
        <div className="profile-avatar">{user?.name?.charAt(0)?.toUpperCase() || 'U'}</div>
        <div>
          <span className="eyebrow">Profile</span>
          <h1>{user?.name}</h1>
          <p>{user?.email}</p>
        </div>
      </section>

      {error && <div className="error">{error}</div>}

      {user?.role === 'admin' ? (
        <>
          <section className="metrics-row admin-profile-metrics">
            <div className="metric-card">
              <span>Total Orders</span>
              <strong>{orders.length}</strong>
            </div>
            <div className="metric-card">
              <span>Active Orders</span>
              <strong>{activeOrders}</strong>
            </div>
            <div className="metric-card">
              <span>Total Stock</span>
              <strong>{totalStock}</strong>
            </div>
            <div className="metric-card">
              <span>Low Stock</span>
              <strong>{lowStockItems.length}</strong>
            </div>
          </section>

          <section className="admin-profile-grid">
            <article className="page-card">
              <h2>Admin Access</h2>
              <div className="profile-detail-list">
                <div><span>Name</span><strong>{user?.name}</strong></div>
                <div><span>Email</span><strong>{user?.email}</strong></div>
                <div><span>Role</span><strong>{user?.role}</strong></div>
              </div>
            </article>
            <article className="page-card">
              <h2>Low Stock Watch</h2>
              {lowStockItems.length === 0 ? (
                <p>All inventory is above threshold.</p>
              ) : (
                <div className="admin-profile-list">
                  {lowStockItems.slice(0, 8).map(item => (
                    <div key={item._id}>
                      <strong>{item.name}</strong>
                      <span>{item.stock} / threshold {item.threshold}</span>
                    </div>
                  ))}
                </div>
              )}
            </article>
          </section>

          <section className="section-heading">
            <div>
              <span className="eyebrow">Recent Activity</span>
              <h2>Latest Orders</h2>
            </div>
          </section>

          <section className="profile-orders-panel">
            <div className="profile-orders-list">
              {orders.slice(0, 6).map((order, index) => (
                <article key={order._id} className="profile-order-card">
                  <img src={pizzaImagePool[index % pizzaImagePool.length]} alt={`Order ${order._id.slice(-6)}`} />
                  <div className="profile-order-main">
                    <div className="profile-order-title">
                      <strong>Order #{order._id.slice(-6)}</strong>
                      <span className="status-pill">{order.status}</span>
                    </div>
                    <p>{order.userName} · {formatDate(order.createdAt)}</p>
                    <div className="profile-order-ingredients">
                      <span>{order.base}</span>
                      <span>{order.sauce}</span>
                      <span>{order.cheese}</span>
                    </div>
                  </div>
                  <div className="order-card-side">
                    <strong>₹{order.price}</strong>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </>
      ) : (
        <>
          <section className="metrics-row">
            <div className="metric-card">
              <span>Total Orders</span>
              <strong>{orders.length}</strong>
            </div>
            <div className="metric-card">
              <span>Total Spent</span>
              <strong>₹{totalSpent}</strong>
            </div>
            <div className="metric-card">
              <span>Latest Status</span>
              <strong>{lastOrder?.status || 'No orders'}</strong>
            </div>
          </section>

          <section className="section-heading">
            <div>
              <span className="eyebrow">Order History</span>
              <h2>My Orders</h2>
            </div>
          </section>

          <section className="profile-orders-panel">
            {orders.length === 0 ? (
              <div className="empty-order-state">
                <h3>No orders yet</h3>
                <p>Your checked-out pizzas will appear here.</p>
              </div>
            ) : (
              <div className="profile-orders-list">
                {orders.map((order, index) => (
                  <article key={order._id} className="profile-order-card">
                    <img src={pizzaImagePool[index % pizzaImagePool.length]} alt={`Order ${order._id.slice(-6)}`} />
                    <div className="profile-order-main">
                      <div className="profile-order-title">
                        <strong>Order #{order._id.slice(-6)}</strong>
                        <span className="status-pill">{order.status}</span>
                      </div>
                      <p>{formatDate(order.createdAt)}</p>
                      <div className="profile-order-ingredients">
                        <span>{order.base}</span>
                        <span>{order.sauce}</span>
                        <span>{order.cheese}</span>
                        {order.veggies.map(item => <span key={item}>{item}</span>)}
                        {order.meats.map(item => <span key={item}>{item}</span>)}
                      </div>
                    </div>
                    <div className="order-card-side">
                      <strong>₹{order.price}</strong>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
};

export default Profile;
