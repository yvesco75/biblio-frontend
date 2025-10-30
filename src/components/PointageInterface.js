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

  // Rechercher les membres dès que l'utilisateur tape (après 3 chiffres)
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

    // Délai de 300ms avant de rechercher (évite trop de requêtes)
    const timer = setTimeout(rechercher, 300);
    return () => clearTimeout(timer);

    // ✅ Correction : éviter l’erreur ESLint sur Vercel
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [telephone]);

  // Fonction appelée quand on clique sur une personne
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
        `✅ ${membreData.prenom} ${membreData.nom} (${membreData.lien}) - ${type.toUpperCase()} enregistrée`,
        'success'
      );

      // Réinitialiser après 3 secondes
      setTimeout(() => {
        setTelephone('');
        setSuggestions([]);
        setMessage(null);
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
      'Papa': '👨',
      'Maman': '👩',
      'Enfant': '👶',
      'Étudiant': '🎓',
      'Personnel': '👔',
      'Membre': '👤'
    };
    return icons[lien] || '👤';
  };

  return (
    <div className="pointage-container">
      <div className="pointage-card">
        <h2>👋 Bienvenue !</h2>
        <p className="subtitle">Entrez votre numéro de téléphone</p>

        <div className="search-container">
          <div className="input-group">
            <label htmlFor="telephone">📞 Numéro de téléphone</label>
            <input
              type="tel"
              id="telephone"
              value={telephone}
              onChange={(e) => setTelephone(e.target.value)}
              placeholder="Ex: 971..."
              disabled={loading}
              autoFocus
            />
          </div>

          {/* Liste des suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="suggestions-list">
              <p className="suggestions-title">Sélectionnez votre nom :</p>
              {suggestions.map(membre => (
                <button
                  key={membre.id}
                  onClick={() => handleSelectMembre(membre)}
                  className="suggestion-item"
                  disabled={loading}
                >
                  <span className="membre-icon">{getLienIcon(membre.lien)}</span>
                  <div className="membre-info">
                    <strong>{membre.prenom} {membre.nom}</strong>
                    <span className="membre-lien">{membre.lien} • {membre.telephone}</span>
                  </div>
                  <span className="arrow">→</span>
                </button>
              ))}
            </div>
          )}

          {/* Message si aucun résultat */}
          {showSuggestions && suggestions.length === 0 && telephone.length >= 3 && (
            <div className="no-results">
              <p>❌ Aucune personne trouvée avec ce numéro</p>
              <p className="small">Contactez l'administrateur pour vous inscrire</p>
            </div>
          )}
        </div>

        {/* Affichage des messages */}
        {message && (
          <div className={`message ${messageType}`}>
            {message}
          </div>
        )}

        {/* Info pour les nouveaux */}
        <div className="info-box">
          <p>
            <strong>Première visite ?</strong><br/>
            Contactez l'administrateur pour vous inscrire.
          </p>
        </div>
      </div>
    </div>
  );
}

export default PointageInterface;