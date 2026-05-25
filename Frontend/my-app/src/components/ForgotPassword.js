import React, { useState } from 'react';
import api from '../api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const submit = async event => {
    event.preventDefault();
    try {
      await api.post('/auth/forgot-password', { email });
      setMessage('If the email exists, a reset link has been sent.');
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset link');
      setMessage(null);
    }
  };

  return (
    <div className="page-card">
      <h2>Forgot Password</h2>
      {message && <div className="success">{message}</div>}
      {error && <div className="error">{error}</div>}
      <form onSubmit={submit}>
        <label>Email</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        <button type="submit">Send Reset Link</button>
      </form>
    </div>
  );
};

export default ForgotPassword;
