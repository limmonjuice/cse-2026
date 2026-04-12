import React, { useState } from 'react';
import TodoList from './components/TodoList';
import Login from './components/Login';
import Register from './components/Register';

function App() {
  const [token, setToken] = useState(localStorage.getItem('access_token'));
  const [page, setPage] = useState('login');

  const handleLogin = (accessToken) => {
    localStorage.setItem('access_token', accessToken);
    setToken(accessToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    setToken(null);
    setPage('login');
  };

  if (token) return <TodoList token={token} onLogout={handleLogout} />;
  if (page === 'register') return <Register onGoLogin={() => setPage('login')} />;
  return <Login onLogin={handleLogin} onGoRegister={() => setPage('register')} />;
}

export default App;
