import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';

const ResetPassword = () => {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const submit = async event => {
    event.preventDefault();
    try {
      await api.post(`/auth/reset-password/${token}`, { password });
      setMessage('Password reset successfully. Please log in.');
      setError(null);
      setPassword('');
    } catch (err) {
      setError(err.response?.data?.message || 'Reset password failed');
      setMessage(null);
    }
  };

  return (
    <div className="page-card">
      <h2>Reset Password</h2>
      {message && <div className="success">{message}</div>}
      {error && <div className="error">{error}</div>}
      <form onSubmit={submit}>
        <label>New Password</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
        <button type="submit">Change Password</button>
      </form>
      <button className="link-button" onClick={() => navigate('/login')}>Back to login</button>
    </div>
  );
};

export default ResetPassword;
