import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './SuperAdminPanel.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function SuperAdminPanel({ token }) {
  const [activeTab, setActiveTab] = useState('admins');
  const [admins, setAdmins] = useState([]);
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [passwordData, setPasswordData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState('');

  const axiosConfig = {
    headers: { Authorization: `Bearer ${token}` }
  };

  useEffect(() => {
    chargerAdmins();
  }, []);

  const chargerAdmins = async () => {
    try {
      const response = await axios.get(`${API_URL}/admins`, axiosConfig);
      setAdmins(response.data);
    } catch (error) {
      console.error('Erreur chargement admins:', error);
    }
  };

  const handleAjoutAdmin = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/admins`, formData, axiosConfig);
      afficherMessage('✅ Admin ajouté avec succès', 'success');
      setFormData({ username: '', password: '' });
      chargerAdmins();
    } catch (error) {
      afficherMessage(`❌ ${error.response?.data?.error || 'Erreur'}`, 'error');
    }
  };

  const handleSupprimerAdmin = async (id) => {
    if (!window.confirm('Voulez-vous vraiment supprimer cet admin ?')) return;
    try {
      await axios.delete(`${API_URL}/admins/${id}`, axiosConfig);
      afficherMessage('✅ Admin supprimé', 'success');
      chargerAdmins();
    } catch (error) {
      afficherMessage(`❌ ${error.response?.data?.error || 'Erreur'}`, 'error');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      afficherMessage('❌ Les mots de passe ne correspondent pas', 'error');
      return;
    }

    try {
      await axios.post(
        `${API_URL}/change-password`,
        {
          oldPassword: passwordData.oldPassword,
          newPassword: passwordData.newPassword
        },
        axiosConfig
      );
      afficherMessage('✅ Mot de passe changé avec succès', 'success');
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      afficherMessage(`❌ ${error.response?.data?.error || 'Erreur'}`, 'error');
    }
  };

  const afficherMessage = (text, type) => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => setMessage(null), 4000);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('fr-FR');
  };

  return (
    <div className="super-admin-container">
      <h2>👑 Panneau Super Administrateur</h2>

      <div className="tabs">
        <button onClick={() => setActiveTab('admins')} className={activeTab === 'admins' ? 'active' : ''}>
          👥 Gestion Admins ({admins.length})
        </button>
        <button onClick={() => setActiveTab('password')} className={activeTab === 'password' ? 'active' : ''}>
          🔒 Changer mon mot de passe
        </button>
      </div>

      {message && (
        <div className={`message ${messageType}`}>
          {message}
        </div>
      )}

      <div className="tab-content">
        
        {/* ONGLET 1 : GESTION DES ADMINS */}
        {activeTab === 'admins' && (
          <div>
            <div className="form-container">
              <h3>Ajouter un administrateur</h3>
              <form onSubmit={handleAjoutAdmin}>
                <div className="form-group">
                  <label>Nom d'utilisateur</label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Mot de passe (min. 6 caractères)</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    minLength="6"
                    required
                  />
                </div>
                <button type="submit" className="btn-primary">✅ Ajouter Admin</button>
              </form>
            </div>

            <div className="table-container">
              <h3>Liste des administrateurs</h3>
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nom d'utilisateur</th>
                    <th>Rôle</th>
                    <th>Date création</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {admins.map(admin => (
                    <tr key={admin.id}>
                      <td>{admin.id}</td>
                      <td>{admin.username}</td>
                      <td>
                        <span className={`badge ${admin.role}`}>
                          {admin.role === 'superadmin' ? '👑 Super Admin' : '🔐 Admin'}
                        </span>
                      </td>
                      <td>{formatDate(admin.date_creation)}</td>
                      <td>
                        {admin.role !== 'superadmin' && (
                          <button 
                            onClick={() => handleSupprimerAdmin(admin.id)}
                            className="btn-danger"
                          >
                            🗑️ Supprimer
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ONGLET 2 : CHANGER MOT DE PASSE */}
        {activeTab === 'password' && (
          <div className="form-container">
            <h3>Changer mon mot de passe</h3>
            <form onSubmit={handleChangePassword}>
              <div className="form-group">
                <label>Ancien mot de passe</label>
                <input
                  type="password"
                  value={passwordData.oldPassword}
                  onChange={(e) => setPasswordData({...passwordData, oldPassword: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Nouveau mot de passe (min. 6 caractères)</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                  minLength="6"
                  required
                />
              </div>
              <div className="form-group">
                <label>Confirmer le nouveau mot de passe</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                  minLength="6"
                  required
                />
              </div>
              <button type="submit" className="btn-primary">🔒 Changer le mot de passe</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default SuperAdminPanel;