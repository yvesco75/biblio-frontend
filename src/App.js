import React, { useState, useEffect } from 'react';
import PointageInterface from './components/PointageInterface';
import AdminInterface from './components/AdminInterface';
import SuperAdminPanel from './components/SuperAdminPanel';
import Login from './components/Login';
import './App.css';

function App() {
  const [mode, setMode] = useState('user');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState(null);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const savedToken = localStorage.getItem('adminToken');
    const savedRole = localStorage.getItem('userRole');
    if (savedToken) {
      setToken(savedToken);
      setUserRole(savedRole);
      setIsAuthenticated(true);
    }
  }, []);

  const handleLoginSuccess = (newToken, role) => {
    setToken(newToken);
    setUserRole(role);
    setIsAuthenticated(true);
    localStorage.setItem('adminToken', newToken);
    localStorage.setItem('userRole', role);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('userRole');
    setToken(null);
    setUserRole(null);
    setIsAuthenticated(false);
    setMode('user');
  };

  const showLogin = mode === 'admin' && !isAuthenticated;

  return (
    <div className="App">
      <header className="header">
        <div className="header-glow"></div>
        <div className="header-content">
          <div className="logo-section">
            <div className="logo-wrapper">
              <div className="logo-glow"></div>
              <img 
                src="http://www.beninexcellence.org/wp-content/uploads/2020/04/cropped-cropped-cropped-Sans-titre-1.png" 
                alt="Bénin Excellence" 
                className="logo-img"
              />
            </div>
            <div>
              <h1 className="header-title">
                <span className="sparkle">✨</span> Bibliothèque Bénin Excellence
              </h1>
              <p className="subtitle">Système de Pointage Intelligent</p>
            </div>
          </div>
          
          <div className="nav-buttons">
            <button 
              onClick={() => setMode('user')}
              className={`nav-btn ${mode === 'user' ? 'active' : ''}`}
            >
              <span className="btn-icon">👤</span>
              <span className="btn-text">Pointage</span>
            </button>
            <button 
              onClick={() => setMode('admin')}
              className={`nav-btn ${mode === 'admin' ? 'active' : ''}`}
            >
              <span className="btn-icon">🔐</span>
              <span className="btn-text">Admin</span>
            </button>
            
            {isAuthenticated && mode === 'admin' && (
              <button 
                onClick={handleLogout}
                className="nav-btn btn-logout"
              >
                <span className="btn-icon">🚪</span>
                <span className="btn-text">Déconnexion</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="main-content">
        {mode === 'user' ? (
          <PointageInterface />
        ) : showLogin ? (
          <Login onLoginSuccess={handleLoginSuccess} />
        ) : userRole === 'superadmin' ? (
          <SuperAdminPanel token={token} />
        ) : (
          <AdminInterface token={token} />
        )}
      </main>

      <footer className="footer">
        <p>© 2025 - Club IA 🤖 - Bénin Excellence</p>
      </footer>
    </div>
  );
}

export default App;