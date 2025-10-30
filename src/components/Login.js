import React, { useState } from 'react';
import axios from 'axios';
import './Login.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API_URL}/login`, {
        username,
        password
      });

      // Sauvegarder le token
      localStorage.setItem('adminToken', response.data.token);
      localStorage.setItem('userRole', response.data.role);
      
      // Informer le parent (App.js) que la connexion a réussi
      onLoginSuccess(response.data.token, response.data.role);

    } catch (error) {
      setError(error.response?.data?.error || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>🔐 Connexion Admin</h2>
        <p className="login-subtitle">Accès à l'interface d'administration</p>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Nom d'utilisateur</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label>Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="error-message">
              ❌ {error}
            </div>
          )}

          <button type="submit" disabled={loading}>
            {loading ? '⏳ Connexion...' : '✅ Se connecter'}
          </button>
        </form>

        <div className="login-info">
          <p><strong>Comptes par défaut :</strong></p>
          <div className="account-box">
            <p>👑 <strong>Super Admin</strong></p>
            <p>Identifiant : <code>superadmin</code></p>
            <p>Mot de passe : <code>SuperAdmin2025!</code></p>
          </div>
          <div className="account-box" style={{marginTop: '10px', opacity: 0.7}}>
            <p>🔐 <strong>Admin simple</strong></p>
            <p>Identifiant : <code>admin</code></p>
            <p>Mot de passe : <code>admin123</code></p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;