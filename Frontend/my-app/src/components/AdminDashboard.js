import React, { useEffect, useState } from 'react';
import api from '../api';

const AdminDashboard = () => {
  const [inventory, setInventory] = useState([]);
  const [orders, setOrders] = useState([]);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const loadData = async () => {
    try {
      const [inventoryResp, ordersResp] = await Promise.all([
        api.get('/admin/inventory'),
        api.get('/admin/orders')
      ]);
      setInventory(inventoryResp.data);
      setOrders(ordersResp.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load admin dashboard');
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, []);

  const updateInventory = async (itemId, changes) => {
    try {
      await api.put(`/admin/inventory/${itemId}`, changes);
      setMessage('Inventory updated successfully.');
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update stock');
    }
  };

  const updateStock = (itemId, stock) => updateInventory(itemId, { stock });

  const updateStatus = async (orderId, status) => {
    try {
      await api.patch(`/admin/orders/${orderId}/status`, { status });
      setMessage('Order status updated.');
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update order status');
    }
  };

  const lowStockItems = inventory.filter(item => item.stock < item.threshold);
  const activeOrders = orders.filter(order => order.status !== 'sent to delivery').length;
  const inventoryByCategory = inventory.reduce((groups, item) => {
    if (!groups[item.category]) groups[item.category] = [];
    groups[item.category].push(item);
    return groups;
  }, {});

  const statusLabels = {
    'order received': 'Order received',
    'in the kitchen': 'In the kitchen',
    'sent to delivery': 'Sent to delivery'
  };

  return (
    <div className="admin-page admin-split-page">
      <section className="admin-topbar">
        <div>
          <span className="eyebrow">Admin Console</span>
          <h1>Kitchen Dashboard</h1>
        </div>
        <div className="admin-topbar-stats">
          <div><span>Orders</span><strong>{orders.length}</strong></div>
          <div><span>Active</span><strong>{activeOrders}</strong></div>
          <div><span>Low stock</span><strong>{lowStockItems.length}</strong></div>
        </div>
      </section>

      {message && <div className="success">{message}</div>}
      {error && <div className="error">{error}</div>}

      <div className="admin-two-column">
        <section className="admin-panel admin-orders-panel">
          <div className="admin-panel-head">
          <div>
            <span className="eyebrow">Order Queue</span>
            <h2>Live Orders</h2>
          </div>
            <span className="admin-count-pill">{orders.length} orders</span>
          </div>

          <div className="admin-orders-list">
          {orders.map(order => (
            <div key={order._id} className="admin-order-card">
              <div className="admin-order-main">
                <div className="admin-order-title">
                  <strong>#{order._id.slice(-6)}</strong>
                  <span className={`status-pill status-${order.status.replaceAll(' ', '-')}`}>{statusLabels[order.status]}</span>
                </div>
                <p>{order.userName} · {order.userEmail}</p>
                <div className="admin-order-build">
                  <span>{order.base}</span>
                  <span>{order.sauce}</span>
                  <span>{order.cheese}</span>
                  {order.veggies.map(item => <span key={item}>{item}</span>)}
                  {order.meats.map(item => <span key={item}>{item}</span>)}
                </div>
              </div>
              <div className="admin-order-actions">
                <strong>₹{order.price}</strong>
                <select value={order.status} onChange={e => updateStatus(order._id, e.target.value)}>
                  <option value="order received">Order received</option>
                  <option value="in the kitchen">In the kitchen</option>
                  <option value="sent to delivery">Sent to delivery</option>
                </select>
              </div>
            </div>
          ))}
          </div>
        </section>

        <section className="admin-panel admin-inventory-panel">
          <div className="admin-panel-head">
            <div>
              <span className="eyebrow">Inventory</span>
              <h2>Stock Control</h2>
            </div>
            <span className="admin-count-pill">{inventory.length} items</span>
          </div>

          <div className="admin-inventory-groups">
          {Object.entries(inventoryByCategory).map(([category, items]) => (
            <article key={category} className="admin-inventory-group">
              <div className="category-panel-head">
                <h3>{category}</h3>
                <span>{items.length} items</span>
              </div>
              <div className="admin-inventory-grid">
                {items.map(item => {
                  const isLow = item.stock < item.threshold;
                  return (
                    <div key={item._id} className={`admin-inventory-card ${isLow ? 'low-stock' : ''}`}>
                      <div className="inventory-card-head">
                        <h4>{item.name}</h4>
                        <span>{isLow ? 'Low' : 'OK'}</span>
                      </div>
                      <div className="stock-meter">
                        <span style={{ width: `${Math.min(100, (item.stock / Math.max(item.threshold * 2, 1)) * 100)}%` }} />
                      </div>
                      <div className="inventory-numbers">
                        <strong>{item.stock}</strong>
                        <span>Threshold {item.threshold}</span>
                      </div>
                      <div className="inventory-actions">
                        <button onClick={() => updateStock(item._id, item.stock + 10)}>+10</button>
                        <button onClick={() => updateStock(item._id, Math.max(0, item.stock - 10))}>-10</button>
                      </div>
                      <div className="inventory-edit">
                        <input
                          type="number"
                          min="0"
                          value={item.stock}
                          onChange={e => updateInventory(item._id, { stock: Number(e.target.value) })}
                          aria-label={`${item.name} stock`}
                        />
                        <input
                          type="number"
                          min="0"
                          value={item.threshold}
                          onChange={e => updateInventory(item._id, { threshold: Number(e.target.value) })}
                          aria-label={`${item.name} threshold`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </article>
          ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminDashboard;
