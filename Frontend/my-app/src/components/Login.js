import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const Login = ({ mode = 'user' }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  const submit = async event => {
    event.preventDefault();
    try {
      const { data } = await api.post('/auth/login', { email, password });
      if (mode === 'admin' && data.user.role !== 'admin') {
        setError('Please use an admin account to continue.');
        setMessage(null);
        return;
      }
      if (mode === 'user' && data.user.role === 'admin') {
        setError('Please use the admin login for admin accounts.');
        setMessage(null);
        return;
      }
      login(data.user, data.token);
      navigate(data.user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      setMessage(null);
    }
  };

  return (
    <div className="auth-page">
      <section className="auth-panel">
        <div className="auth-copy">
          <span className="eyebrow">Pizza Delivery</span>
          <h1>{mode === 'admin' ? 'Welcome back, admin' : 'Fresh pizza, faster orders'}</h1>
          <p>{mode === 'admin' ? 'Manage inventory, orders, and kitchen status from one calm workspace.' : 'Sign in to build your custom pizza and track every order update.'}</p>
        </div>
        <div className="auth-card">
          <h2>{mode === 'admin' ? 'Admin Login' : 'User Login'}</h2>
          {message && <div className="success">{message}</div>}
          {error && <div className="error">{error}</div>}
          <form onSubmit={submit}>
            <label>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
            <label>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
            <button type="submit">Login</button>
          </form>
          <div className="bottom-links">
            <Link to="/forgot-password">Forgot password?</Link>
            {mode === 'admin' ? <Link to="/login">User login</Link> : <Link to="/admin-login">Admin login</Link>}
            {mode === 'user' && <Link to="/register">Create account</Link>}
          </div>
        </div>
      </section>
      <div className="auth-image-wrap">
        <img src="/images/auth-login.png" alt="Fresh pizza on a kitchen counter" />
      </div>
    </div>
  );
};

export default Login;
