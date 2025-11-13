import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Dashboard.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function Dashboard({ token }) {
  const [stats, setStats] = useState({
    totalMembres: 0,
    presentsAujourdhui: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    chargerStats();
  }, []);

  const chargerStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data);
    } catch (error) {
      console.error('Erreur chargement stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">⏳ Chargement...</div>;
  }

  return (
    <div className="dashboard-wrapper">
      <h3>📊 Tableau de bord</h3>
      
      <div className="stats-grid">
        <div className="stat-card blue">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h4>Membres Actifs</h4>
            <p className="stat-number">{stats.totalMembres}</p>
          </div>
        </div>

        <div className="stat-card green">
          <div className="stat-icon">🟢</div>
          <div className="stat-content">
            <h4>Présents Maintenant</h4>
            <p className="stat-number">{stats.presentsAujourdhui}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;