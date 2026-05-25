import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import logo from '../logo.svg';

const NavBar = () => {
  const { user, logout } = useAuth();
  const { totals } = useCart();

  return (
    <header className="app-header">
      <div className="brand">
        <Link to="/">
          <img src={logo} alt="" />
          <span>Pizza Pulse</span>
        </Link>
      </div>
      <nav>
        {!user && (
          <>
            <Link to="/login">Login</Link>
            <Link to="/admin-login">Admin</Link>
            <Link to="/register">Register</Link>
          </>
        )}
        {user && (
          <>
            {user.role === 'admin' ? <Link to="/admin">Admin</Link> : <Link to="/dashboard">Dashboard</Link>}
            {user.role !== 'admin' && <Link to="/builder">Build Pizza</Link>}
            {user.role !== 'admin' && <Link to="/cart">Cart ({totals.count})</Link>}
            <Link to="/profile">Profile</Link>
            <button className="link-button" onClick={logout}>Logout</button>
          </>
        )}
      </nav>
    </header>
  );
};

export default NavBar;
