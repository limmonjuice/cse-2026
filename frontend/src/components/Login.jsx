import React, { useState } from 'react';
import axios from 'axios';

function Login({ onLogin, onGoRegister }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await axios.post('/api/token/', { username, password });
      onLogin(res.data.access);
    } catch {
      setError('Invalid username or password.');
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-container">
        <h1 className="todo-title">TASKS.</h1>
        <p className="auth-subtitle">Sign in to continue</p>

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
              autoComplete="current-password"
            />
          </div>

          {error && <p className="auth-error">{error}</p>}

          <button className="auth-btn" type="submit" disabled={!username || !password}>
            Sign In
          </button>
        </form>

        <p className="auth-switch">
          No account?{' '}
          <button className="auth-link" onClick={onGoRegister}>Register</button>
        </p>
      </div>
    </div>
  );
}

export default Login;
