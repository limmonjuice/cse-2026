import React, { useState } from 'react';
import axios from 'axios';

function Register({ onGoLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await axios.post('/api/register/', { username, password });
      setSuccess(true);
    } catch (err) {
      const data = err.response?.data;
      const msg = data?.username?.[0] || data?.password?.[0] || 'Registration failed.';
      setError(msg);
    }
  };

  if (success) {
    return (
      <div className="auth-wrapper">
        <div className="auth-container">
          <h1 className="todo-title">TASKS.</h1>
          <p className="auth-subtitle">Account created.</p>
          <button className="auth-btn" onClick={onGoLogin}>Sign In</button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-container">
        <h1 className="todo-title">TASKS.</h1>
        <p className="auth-subtitle">Create an account</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label className="auth-label">Username</label>
            <input
              className="auth-input"
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              autoComplete="username"
              spellCheck="false"
            />
          </div>
          <div className="auth-field">
            <label className="auth-label">Password</label>
            <input
              className="auth-input"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>

          {error && <p className="auth-error">{error}</p>}

          <button className="auth-btn" type="submit" disabled={!username || !password}>
            Register
          </button>
        </form>

        <p className="auth-switch">
          Already have an account?{' '}
          <button className="auth-link" onClick={onGoLogin}>Sign In</button>
        </p>
      </div>
    </div>
  );
}

export default Register;
