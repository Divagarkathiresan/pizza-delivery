import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import NavBar from './components/NavBar';
import Login from './components/Login';
import Register from './components/Register';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import Dashboard from './components/Dashboard';
import PizzaBuilder from './components/PizzaBuilder';
import Cart from './components/Cart';
import Profile from './components/Profile';
import AdminDashboard from './components/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="app-shell">
            <NavBar />
            <main className="app-main">
              <Routes>
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/login" element={<Login mode="user" />} />
                <Route path="/admin-login" element={<Login mode="admin" />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />
                <Route
                  path="/dashboard"
                  element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
                />
                <Route
                  path="/builder"
                  element={<ProtectedRoute><PizzaBuilder /></ProtectedRoute>}
                />
                <Route
                  path="/cart"
                  element={<ProtectedRoute><Cart /></ProtectedRoute>}
                />
                <Route
                  path="/profile"
                  element={<ProtectedRoute><Profile /></ProtectedRoute>}
                />
                <Route
                  path="/admin"
                  element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>}
                />
                <Route path="*" element={<Navigate to="/login" replace />} />
              </Routes>
            </main>
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
