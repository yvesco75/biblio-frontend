import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './PointageInterface.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function PointageInterface() {
  const [telephone, setTelephone] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [loading, setLoading] = useState(false);

  // Rechercher automatiquement après 3 chiffres
  useEffect(() => {
    const searchMembers = async () => {
      if (telephone.length >= 3) {
        try {
          const response = await axios.get(`${API_URL}/membres/search/${telephone}`);
          setSuggestions(response.data);
        } catch (error) {
          console.error('Erreur recherche:', error);
          setSuggestions([]);
        }
      } else {
        setSuggestions([]);
      }
    };

    const timer = setTimeout(searchMembers, 300);
    return () => clearTimeout(timer);
  }, [telephone]);

  const handlePointer = async (membreId, nom, prenom) => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/pointer`, { membre_id: membreId });
      setMessage(`✅ ${prenom} ${nom} - ${response.data.type} enregistrée`);
      setMessageType('success');
      setTelephone('');
      setSuggestions([]);
    } catch (error) {
      setMessage(`❌ ${error.response?.data?.error || 'Erreur'}`);
      setMessageType('error');
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
    <div className="pointage-container">
      <h2>👋 Bienvenue !</h2>
      
      <div className="input-group">
        <label>📞 Numéro de téléphone</label>
        <input
          type="tel"
          value={telephone}
          onChange={(e) => setTelephone(e.target.value)}
          placeholder="Ex : 971..."
          maxLength="15"
        />
      </div>

      {telephone.length >= 3 && suggestions.length === 0 && (
        <div className="info-box">
          <p>🔍 Aucun membre trouvé avec ce numéro</p>
          <p>Contactez l'administrateur pour vous inscrire.</p>
        </div>
      )}

      {suggestions.length > 0 && (
        <div className="suggestions-list">
          <h3>Sélectionnez votre nom :</h3>
          {suggestions.map((membre) => (
            <div
              key={membre.id}
              className="suggestion-item"
              onClick={() => handlePointer(membre.id, membre.nom, membre.prenom)}
            >
              <div className="membre-info">
                <span className="membre-nom">{membre.prenom} {membre.nom}</span>
                <span className="membre-lien">{membre.lien}</span>
              </div>
              <span className="membre-tel">{membre.telephone}</span>
            </div>
          ))}
        </div>
      )}

      {message && (
        <div className={`message ${messageType}`}>
          {message}
        </div>
      )}

      {loading && <div className="loading">⏳ Chargement...</div>}

      <div className="info-box">
        <h4>Première visite ?</h4>
        <p>Contactez l'administrateur pour vous inscrire.</p>
      </div>
    </div>
  );
}

export default PointageInterface;