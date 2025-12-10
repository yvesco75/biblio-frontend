import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './PointageInterface.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function PointageInterface() {
  const [telephone, setTelephone] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    const rechercher = async () => {
      if (telephone.length >= 3) {
        try {
          const response = await axios.get(`${API_URL}/search-membres/${telephone}`);
          setSuggestions(response.data);
          setShowSuggestions(true);
        } catch (error) {
          console.error('Erreur recherche:', error);
          setSuggestions([]);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    };

    const timer = setTimeout(rechercher, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [telephone]);

  const handleSelectMembre = async (membre) => {
    setLoading(true);
    setMessage(null);
    setShowSuggestions(false);

    try {
      const response = await axios.post(`${API_URL}/pointer-by-id`, {
        membreId: membre.id
      });

      const { membre: membreData, type } = response.data;
      
      afficherMessage(
        `${membreData.prenom} ${membreData.nom}`,
        type
      );

      setShowConfetti(true);

      setTimeout(() => {
        setTelephone('');
        setSuggestions([]);
        setMessage(null);
        setShowConfetti(false);
      }, 3000);

    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Erreur de connexion';
      afficherMessage(`❌ ${errorMsg}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const afficherMessage = (text, type) => {
    setMessage(text);
    setMessageType(type);
  };

  const getLienIcon = (lien) => {
    const icons = {
      'Étudiant': '🎓',
      'Élève': '📚',
      'Professionnel': '💼',
      'Personnel': '👔',
      'Membre': '👤'
    };
    return icons[lien] || '👤';
  };

  const getLienColor = (lien) => {
    const colors = {
      'Étudiant': 'blue',
      'Élève': 'green',
      'Professionnel': 'purple',
      'Personnel': 'orange',
      'Membre': 'gray'
    };
    return colors[lien] || 'gray';
  };

  return (
    <div className="pointage-container">
      
      {/* Confetti */}
      {showConfetti && (
        <div className="confetti-container">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="confetti"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${8 + Math.random() * 8}px`,
                height: `${8 + Math.random() * 8}px`,
                background: ['#fbbf24', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6'][Math.floor(Math.random() * 5)],
                borderRadius: Math.random() > 0.5 ? '50%' : '0',
                animationDelay: `${Math.random() * 0.5}s`
              }}
            />
          ))}
        </div>
      )}

      <div className="pointage-card">
        
        {/* Welcome Section */}
        <div className="welcome-section">
          <div className="welcome-icon-wrapper">
            <div className="welcome-icon-glow"></div>
            <div className="welcome-icon">👋</div>
          </div>
          <h2 className="welcome-title">Bienvenue !</h2>
          <p className="welcome-subtitle">Enregistrez votre présence en un clic</p>
        </div>

        {/* Success Message */}
        {message && (
          <div className={`success-message ${messageType}`}>
            <div className="success-icon">
              {messageType === 'entrée' ? '✅' : '🚪'}
            </div>
            <div className="success-type">
              {messageType === 'entrée' ? 'ENTRÉE' : 'SORTIE'}
            </div>
            <div className="success-name">{message}</div>
            <div className="success-text">🎉 Enregistré avec succès !</div>
          </div>
        )}

        {/* Input Section */}
        <div className="input-section">
          <label className="input-label">
            <span className="input-icon">📱</span>
            Votre numéro de téléphone
          </label>
          <div className="input-wrapper">
            <input
              type="tel"
              value={telephone}
              onChange={(e) => setTelephone(e.target.value.replace(/\D/g, ''))}
              placeholder="Ex: 971234567"
              disabled={loading}
              className="phone-input"
              autoFocus
            />
            {loading && (
              <div className="loading-spinner">
                <div className="spinner"></div>
              </div>
            )}
          </div>
        </div>

        {/* Suggestions */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="suggestions-container">
            <p className="suggestions-label">
              <span className="sparkle-icon">✨</span>
              Choisissez votre nom :
            </p>
            {suggestions.map(membre => (
              <button
                key={membre.id}
                onClick={() => handleSelectMembre(membre)}
                disabled={loading}
                className="suggestion-card"
              >
                <div className={`suggestion-avatar ${getLienColor(membre.lien)}`}>
                  {getLienIcon(membre.lien)}
                </div>
                <div className="suggestion-info">
                  <h3 className="suggestion-name">
                    {membre.prenom} {membre.nom}
                  </h3>
                  <div className="suggestion-details">
                    <span className={`suggestion-badge ${getLienColor(membre.lien)}`}>
                      {membre.lien}
                    </span>
                    <span className="suggestion-phone">{membre.telephone}</span>
                  </div>
                </div>
                <div className="suggestion-check">✓</div>
              </button>
            ))}
          </div>
        )}

        {/* No Results */}
        {showSuggestions && suggestions.length === 0 && telephone.length >= 3 && (
          <div className="no-results">
            <div className="no-results-icon">🔍</div>
            <h3 className="no-results-title">😕 Aucun résultat</h3>
            <p className="no-results-text">Contactez l'administrateur pour vous inscrire</p>
          </div>
        )}

        {/* Info Box */}
        {!telephone && (
          <div className="info-box">
            <div className="info-icon">💡</div>
            <p className="info-text">
              <strong>Première visite ?</strong><br/>
              Demandez votre inscription à l'accueil
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default PointageInterface;