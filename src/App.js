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

  // Vérifier si l'utilisateur est déjà connecté au démarrage
  useEffect(() => {
    const savedToken = localStorage.getItem('adminToken');
    const savedRole = localStorage.getItem('userRole');
    if (savedToken) {
      setToken(savedToken);
      setUserRole(savedRole);
      setIsAuthenticated(true);
    }
  }, []);

  // Fonction appelée après connexion réussie
  const handleLoginSuccess = (newToken, role) => {
    setToken(newToken);
    setUserRole(role);
    setIsAuthenticated(true);
    localStorage.setItem('adminToken', newToken);
    localStorage.setItem('userRole', role);
  };

  // Fonction de déconnexion
  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('userRole');
    setToken(null);
    setUserRole(null);
    setIsAuthenticated(false);
    setMode('user');
  };

  // Si mode admin mais pas connecté, afficher le login
  const showLogin = mode === 'admin' && !isAuthenticated;

  return (
    <div className="App">
      <header className="header">
        <div className="header-content">
          <div className="logo-section">
            <img 
              src="http://www.beninexcellence.org/wp-content/uploads/2020/04/cropped-cropped-cropped-Sans-titre-1.png" 
              alt="Bénin Excellence" 
              className="logo-img"
            />
            <div>
              <h1>Bibliothèque Bénin Excellence</h1>
              <p className="subtitle">Système de Pointage</p>
            </div>
          </div>
          
          <div className="nav-buttons">
            <button 
              onClick={() => setMode('user')}
              className={mode === 'user' ? 'active' : ''}
            >
              👤 Pointage
            </button>
            <button 
              onClick={() => setMode('admin')}
              className={mode === 'admin' ? 'active' : ''}
            >
              🔐 Administration
            </button>
            
            {isAuthenticated && mode === 'admin' && (
              <button 
                onClick={handleLogout}
                className="btn-logout"
              >
                🚪 Déconnexion
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
        <p>© 2025 - Club IA - Système de gestion bibliothèque</p>
      </footer>
    </div>
  );
}

export default App;