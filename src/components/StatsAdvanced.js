// src/components/StatsAdvanced.js - NOUVEAU COMPOSANT
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BarChart, Bar, PieChart, Pie, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, Cell 
} from 'recharts';
import './StatsAdvanced.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const COLORS = {
  primary: ['#ec4899', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'],
  sexe: { 'Masculin': '#3b82f6', 'Féminin': '#ec4899', 'Non spécifié': '#94a3b8' }
};

function StatsAdvanced({ token }) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    global: {},
    sexe: [],
    motifs: [],
    categories: [],
    evolution: [],
    topVisiteurs: []
  });

  const axiosConfig = {
    headers: { Authorization: `Bearer ${token}` }
  };

  useEffect(() => {
    chargerToutesLesStats();
  }, []);

  const chargerToutesLesStats = async () => {
    try {
      setLoading(true);

      const [globalRes, sexeRes, motifsRes, categoriesRes, evolutionRes, topRes] = await Promise.all([
        axios.get(`${API_URL}/stats/global`, axiosConfig),
        axios.get(`${API_URL}/stats/sexe`, axiosConfig),
        axios.get(`${API_URL}/stats/motifs`, axiosConfig),
        axios.get(`${API_URL}/stats/categories`, axiosConfig),
        axios.get(`${API_URL}/stats/evolution`, axiosConfig),
        axios.get(`${API_URL}/stats/top-visiteurs`, axiosConfig)
      ]);

      setStats({
        global: globalRes.data,
        sexe: sexeRes.data,
        motifs: motifsRes.data,
        categories: categoriesRes.data,
        evolution: evolutionRes.data.map(item => ({
          ...item,
          date: new Date(item.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
        })),
        topVisiteurs: topRes.data
      });
    } catch (error) {
      console.error('Erreur chargement stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="stats-loading">
        <div className="spinner-large"></div>
        <p>Chargement des statistiques...</p>
      </div>
    );
  }

  const { global, sexe, motifs, categories, evolution, topVisiteurs } = stats;

  // Calculer les pourcentages pour le sexe
  const totalMembres = sexe.reduce((sum, item) => sum + parseInt(item.total), 0);
  const sexeWithPercent = sexe.map(item => ({
    ...item,
    total: parseInt(item.total),
    percent: totalMembres > 0 ? ((parseInt(item.total) / totalMembres) * 100).toFixed(1) : 0
  }));

  return (
    <div className="stats-advanced-container">
      <h2 className="stats-title">📈 Tableau de Bord Statistiques</h2>
      
      {/* Cartes récapitulatives */}
      <div className="stats-cards">
        <div className="stat-card-large blue-gradient">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>Membres Inscrits</h3>
            <p className="stat-number">{global.totalMembres || 0}</p>
          </div>
        </div>

        <div className="stat-card-large green-gradient">
          <div className="stat-icon">🟢</div>
          <div className="stat-content">
            <h3>Présents Maintenant</h3>
            <p className="stat-number">{global.presentsAujourdhui || 0}</p>
          </div>
        </div>

        <div className="stat-card-large orange-gradient">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <h3>Visites Aujourd'hui</h3>
            <p className="stat-number">{global.visitesAujourdhui || 0}</p>
          </div>
        </div>
      </div>

      {/* Grille de graphiques */}
      <div className="charts-grid">
        
        {/* Répartition par Sexe */}
        <div className="chart-card">
          <h3 className="chart-title">
            <span className="chart-icon">👨👩</span>
            Répartition par Sexe
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={sexeWithPercent}
                dataKey="total"
                nameKey="sexe"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={(entry) => `${entry.sexe}: ${entry.percent}%`}
              >
                {sexeWithPercent.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS.sexe[entry.sexe] || '#94a3b8'} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="chart-legend">
            {sexeWithPercent.map((item, index) => (
              <div key={index} className="legend-item">
                <span 
                  className="legend-color" 
                  style={{backgroundColor: COLORS.sexe[item.sexe]}}
                ></span>
                <span className="legend-label">
                  {item.sexe === 'Masculin' ? '👨' : item.sexe === 'Féminin' ? '👩' : '👤'} 
                  {' '}{item.sexe}: <strong>{item.total}</strong> ({item.percent}%)
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Motifs de Visite */}
        <div className="chart-card">
          <h3 className="chart-title">
            <span className="chart-icon">📋</span>
            Motifs de Visite
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={motifs}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="motif" 
                angle={-45}
                textAnchor="end"
                height={100}
                interval={0}
              />
              <YAxis />
              <Tooltip />
              <Bar dataKey="total" fill="#8b5cf6" radius={[8, 8, 0, 0]}>
                {motifs.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS.primary[index % COLORS.primary.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          {motifs.length === 0 && (
            <p className="no-data-message">Aucun motif enregistré pour le moment</p>
          )}
        </div>

        {/* Catégories de Membres */}
        <div className="chart-card">
          <h3 className="chart-title">
            <span className="chart-icon">🎓</span>
            Répartition par Catégorie
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categories} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="lien" type="category" width={120} />
              <Tooltip />
              <Bar dataKey="total" fill="#10b981" radius={[0, 8, 8, 0]}>
                {categories.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS.primary[index % COLORS.primary.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Évolution des visites */}
        <div className="chart-card">
          <h3 className="chart-title">
            <span className="chart-icon">📊</span>
            Évolution des Visites (7 derniers jours)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={evolution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="total" 
                stroke="#ec4899" 
                strokeWidth={3}
                name="Visites"
                dot={{ fill: '#ec4899', r: 5 }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
          {evolution.length === 0 && (
            <p className="no-data-message">Aucune donnée d'évolution disponible</p>
          )}
        </div>
      </div>

      {/* Top Visiteurs */}
      <div className="chart-card-full">
        <h3 className="chart-title">
          <span className="chart-icon">🏆</span>
          Top 10 des Visiteurs les Plus Assidus
        </h3>
        {topVisiteurs.length === 0 ? (
          <p className="no-data-message">Aucun visiteur enregistré</p>
        ) : (
          <div className="top-visiteurs-grid">
            {topVisiteurs.map((visiteur, index) => (
              <div key={index} className="visiteur-card">
                <div className="visiteur-rank">#{index + 1}</div>
                <div className="visiteur-avatar">
                  {visiteur.sexe === 'Masculin' ? '👨' : visiteur.sexe === 'Féminin' ? '👩' : '👤'}
                </div>
                <div className="visiteur-info">
                  <h4 className="visiteur-name">
                    {visiteur.prenom} {visiteur.nom}
                  </h4>
                  <p className="visiteur-category">{visiteur.lien}</p>
                  <p className="visiteur-visits">
                    <strong>{visiteur.nombre_visites}</strong> visites
                  </p>
                </div>
                <div className={`visiteur-medal medal-${index + 1}`}>
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🏅'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bouton Actualiser */}
      <div className="stats-footer">
        <button onClick={chargerToutesLesStats} className="btn-refresh-stats">
          🔄 Actualiser les Statistiques
        </button>
      </div>
    </div>
  );
}

export default StatsAdvanced;