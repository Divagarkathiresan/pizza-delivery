import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailCode, setEmailCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const sendCode = async () => {
    if (!email) {
      setError('Enter your email before requesting a code');
      setMessage(null);
      return;
    }

    try {
      setIsSendingCode(true);
      await api.post('/auth/send-email-verification', { email });
      setCodeSent(true);
      setMessage('Verification code sent. Check your email inbox.');
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not send verification code');
      setMessage(null);
    } finally {
      setIsSendingCode(false);
    }
  };

  const submit = async event => {
    event.preventDefault();
    try {
      setIsSubmitting(true);
      await api.post('/auth/register', { name, email, password, emailCode });
      setMessage('Registration complete. You can log in now.');
      setError(null);
      setName('');
      setEmail('');
      setPassword('');
      setEmailCode('');
      setCodeSent(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      setMessage(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page register-page">
      <div className="auth-image-wrap">
        <img src="/images/auth-register.png" alt="Fresh ingredients for a custom pizza" />
      </div>
      <section className="auth-panel">
        <div className="auth-copy">
          <span className="eyebrow">Create Account</span>
          <h1>Start building your perfect pizza</h1>
          <p>Register once, choose your base, sauce, cheese, and toppings, then follow the order from kitchen to delivery.</p>
        </div>
        <div className="auth-card">
          <h2>Register</h2>
          {message && <div className="success">{message}</div>}
          {error && <div className="error">{error}</div>}
          <form onSubmit={submit}>
            <label>Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} required />
            <label>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
            <button type="button" className="secondary-button" onClick={sendCode} disabled={isSendingCode}>
              {isSendingCode ? 'Sending code...' : codeSent ? 'Resend code' : 'Send verification code'}
            </button>
            <label>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
            <label>Email verification code</label>
            <input type="text" value={emailCode} onChange={e => setEmailCode(e.target.value)} required inputMode="numeric" autoComplete="one-time-code" />
            <button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Creating account...' : 'Create account'}</button>
          </form>
          <button className="text-button" onClick={() => navigate('/login')}>Already have an account?</button>
        </div>
      </section>
    </div>
  );
};

export default Register;
