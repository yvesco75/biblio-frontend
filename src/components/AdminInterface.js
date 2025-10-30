import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { saveAs } from 'file-saver';
import './AdminInterface.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function AdminInterface({ token }) {
  const [activeTab, setActiveTab] = useState('ajout');
  const [formData, setFormData] = useState({ nom: '', prenom: '', telephone: '', lien: 'Membre' });
  const [membres, setMembres] = useState([]);
  const [mouvements, setMouvements] = useState([]);
  const [presents, setPresents] = useState([]);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState('');

  // Configuration axios avec token
  const axiosConfig = {
    headers: { Authorization: `Bearer ${token}` }
  };

  useEffect(() => {
  chargerMembres();
  chargerMouvements();
  chargerPresents();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

  // ==================== FONCTIONS API ====================

  const chargerMembres = async () => {
    try {
      const response = await axios.get(`${API_URL}/membres`, axiosConfig);
      setMembres(response.data);
    } catch (error) {
      console.error('Erreur chargement membres:', error);
    }
  };

  const chargerMouvements = async () => {
    try {
      const response = await axios.get(`${API_URL}/mouvements?limit=100`, axiosConfig);
      setMouvements(response.data);
    } catch (error) {
      console.error('Erreur chargement mouvements:', error);
    }
  };

  const chargerPresents = async () => {
    try {
      const response = await axios.get(`${API_URL}/presents`, axiosConfig);
      setPresents(response.data);
    } catch (error) {
      console.error('Erreur chargement présents:', error);
    }
  };

  const handleAjoutMembre = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/membres`, formData, axiosConfig);
      afficherMessage('✅ Membre ajouté avec succès', 'success');
      setFormData({ nom: '', prenom: '', telephone: '' });
      chargerMembres();
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Erreur';
      afficherMessage(`❌ ${errorMsg}`, 'error');
    }
  };

  const handleSupprimerMembre = async (id) => {
    if (!window.confirm('Voulez-vous vraiment désactiver ce membre ?')) return;
    try {
      await axios.delete(`${API_URL}/membres/${id}`, axiosConfig);
      afficherMessage('✅ Membre désactivé', 'success');
      chargerMembres();
    } catch (error) {
      afficherMessage('❌ Erreur', 'error');
    }
  };

  // ==================== IMPORT EXCEL/CSV ====================

  const handleImportFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(
        `${API_URL}/import`, 
        formData, 
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      afficherMessage(
        `✅ ${response.data.message}`, 
        response.data.erreurs > 0 ? 'warning' : 'success'
      );
      
      chargerMembres();
      e.target.value = ''; // Reset input
    } catch (error) {
      afficherMessage(`❌ ${error.response?.data?.error || 'Erreur import'}`, 'error');
    }
  };

  // ==================== EXPORT EXCEL ====================

  const handleExportMembres = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/export/membres`,
        {
          ...axiosConfig,
          responseType: 'blob'
        }
      );

      saveAs(response.data, 'membres.xlsx');
      afficherMessage('✅ Export réussi', 'success');
    } catch (error) {
      afficherMessage('❌ Erreur export', 'error');
    }
  };

  const handleExportMouvements = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/export/mouvements`,
        {
          ...axiosConfig,
          responseType: 'blob'
        }
      );

      saveAs(response.data, 'mouvements.xlsx');
      afficherMessage('✅ Export réussi', 'success');
    } catch (error) {
      afficherMessage('❌ Erreur export', 'error');
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

  // ==================== RENDU ====================

  return (
    <div className="admin-container">
      <div className="tabs">
        <button onClick={() => setActiveTab('ajout')} className={activeTab === 'ajout' ? 'active' : ''}>
          ➕ Ajouter Membre
        </button>
        <button onClick={() => setActiveTab('import')} className={activeTab === 'import' ? 'active' : ''}>
          📤 Import Excel/CSV
        </button>
        <button onClick={() => setActiveTab('membres')} className={activeTab === 'membres' ? 'active' : ''}>
          👥 Liste Membres ({membres.length})
        </button>
        <button onClick={() => setActiveTab('presents')} className={activeTab === 'presents' ? 'active' : ''}>
          🟢 Présents ({presents.length})
        </button>
        <button onClick={() => setActiveTab('mouvements')} className={activeTab === 'mouvements' ? 'active' : ''}>
          📊 Historique
        </button>
      </div>

      {message && (
        <div className={`message ${messageType}`}>
          {message}
        </div>
      )}

      <div className="tab-content">
        
        {/* ONGLET 1 : AJOUTER UN MEMBRE */}
        {activeTab === 'ajout' && (
          <div className="form-container">
            <h3>Ajouter un nouveau membre</h3>
            <form onSubmit={handleAjoutMembre}>
              <div className="form-group">
                <label>Nom</label>
                <input
                  type="text"
                  value={formData.nom}
                  onChange={(e) => setFormData({...formData, nom: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Prénom</label>
                <input
                  type="text"
                  value={formData.prenom}
                  onChange={(e) => setFormData({...formData, prenom: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Téléphone</label>
                <input
                  type="tel"
                  value={formData.telephone}
                  onChange={(e) => setFormData({...formData, telephone: e.target.value})}
                  placeholder="Ex: 97123456"
                  required
                />
              </div>
              <button type="submit" className="btn-primary">✅ Enregistrer</button>
            </form>
          </div>
        )}

        {/* ONGLET 2 : IMPORT EXCEL/CSV */}
        {activeTab === 'import' && (
          <div className="import-container">
            <h3>📤 Import de membres en masse</h3>
            
            <div className="info-box">
              <h4>Instructions :</h4>
              <ol>
                <li>Préparez un fichier Excel (.xlsx) ou CSV (.csv)</li>
                <li>Les colonnes doivent être : <strong>nom</strong>, <strong>prenom</strong>, <strong>telephone</strong></li>
                <li>Exemple :</li>
              </ol>
              <table className="example-table">
                <thead>
                  <tr>
                    <th>nom</th>
                    <th>prenom</th>
                    <th>telephone</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>KPOTIN</td>
                    <td>Jean</td>
                    <td>97123456</td>
                  </tr>
                  <tr>
                    <td>AGBO</td>
                    <td>Marie</td>
                    <td>96654321</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="upload-zone">
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleImportFile}
                id="file-upload"
              />
              <label htmlFor="file-upload" className="upload-button">
                📁 Choisir un fichier Excel/CSV
              </label>
            </div>
          </div>
        )}

        {/* ONGLET 3 : LISTE DES MEMBRES */}
        {activeTab === 'membres' && (
          <div className="table-container">
            <div className="table-header">
              <h3>Liste des membres</h3>
              <button onClick={handleExportMembres} className="btn-export">
                📥 Exporter Excel
              </button>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Prénom</th>
                  <th>Téléphone</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {membres.map(membre => (
                  <tr key={membre.id}>
                    <td>{membre.nom}</td>
                    <td>{membre.prenom}</td>
                    <td>{membre.telephone}</td>
                    <td>
                      <span className={`badge ${membre.statut}`}>
                        {membre.statut}
                      </span>
                    </td>
                    <td>
                      {membre.statut === 'actif' && (
                        <button onClick={() => handleSupprimerMembre(membre.id)} className="btn-danger">
                          🗑️
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ONGLET 4 : PERSONNES PRÉSENTES */}
        {activeTab === 'presents' && (
          <div className="table-container">
            <h3>Personnes actuellement présentes</h3>
            <button onClick={chargerPresents} className="btn-refresh">🔄 Actualiser</button>
            {presents.length === 0 ? (
              <p className="empty-message">Aucune personne présente</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>Prénom</th>
                    <th>Téléphone</th>
                    <th>Entrée à</th>
                  </tr>
                </thead>
                <tbody>
                  {presents.map(personne => (
                    <tr key={personne.id}>
                      <td>{personne.nom}</td>
                      <td>{personne.prenom}</td>
                      <td>{personne.telephone}</td>
                      <td>{formatDate(personne.heure_entree)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* ONGLET 5 : HISTORIQUE */}
        {activeTab === 'mouvements' && (
          <div className="table-container">
            <div className="table-header">
              <h3>Historique des mouvements</h3>
              <button onClick={handleExportMouvements} className="btn-export">
                📥 Exporter Excel
              </button>
            </div>
            <button onClick={chargerMouvements} className="btn-refresh">🔄 Actualiser</button>
            <table>
              <thead>
                <tr>
                  <th>Date & Heure</th>
                  <th>Nom</th>
                  <th>Prénom</th>
                  <th>Type</th>
                </tr>
              </thead>
              <tbody>
                {mouvements.map(mouvement => (
                  <tr key={mouvement.id}>
                    <td>{formatDate(mouvement.date_heure)}</td>
                    <td>{mouvement.nom}</td>
                    <td>{mouvement.prenom}</td>
                    <td>
                      <span className={`badge ${mouvement.type}`}>
                        {mouvement.type === 'entrée' ? '🟢 Entrée' : '🔴 Sortie'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminInterface;