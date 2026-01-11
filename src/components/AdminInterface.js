// src/components/AdminInterface.js - VERSION MISE À JOUR
// MODIFICATION : Ajouter le champ sexe dans formData et le formulaire

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { saveAs } from 'file-saver';
import Dashboard from './Dashboard';
import StatsAdvanced from './StatsAdvanced'; // NOUVEAU
import './AdminInterface.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function AdminInterface({ token }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // MODIFIÉ : Ajout du champ sexe
  const [formData, setFormData] = useState({ 
  nom: '', 
  prenom: '', 
  telephone: '', 
  sexe: 'Masculin',  // CHANGÉ de 'Non spécifié' à 'Masculin'
  lien: 'Étudiant' 
  });
  
  const [membres, setMembres] = useState([]);
  const [mouvements, setMouvements] = useState([]);
  const [presents, setPresents] = useState([]);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const axiosConfig = {
    headers: { Authorization: `Bearer ${token}` }
  };

  useEffect(() => {
    chargerMembres();
    chargerMouvements();
    chargerPresents();
  }, []);

  const chargerMembres = async () => {
    try {
      const response = await axios.get(`${API_URL}/membres`, axiosConfig);
      setMembres(response.data);
    } catch (error) {
      console.error('Erreur chargement membres:', error);
      afficherMessage('❌ Erreur chargement membres', 'error');
    }
  };

  const chargerMouvements = async () => {
    try {
      const response = await axios.get(`${API_URL}/mouvements?limit=100`, axiosConfig);
      setMouvements(response.data);
    } catch (error) {
      console.error('Erreur chargement mouvements:', error);
      afficherMessage('❌ Erreur chargement mouvements', 'error');
    }
  };

  const chargerPresents = async () => {
    try {
      const response = await axios.get(`${API_URL}/presents`, axiosConfig);
      setPresents(response.data);
    } catch (error) {
      console.error('Erreur chargement présents:', error);
      afficherMessage('❌ Erreur chargement présents', 'error');
    }
  };

  const handleAjoutMembre = async (e) => {
    e.preventDefault();
    
    // MODIFIÉ : Validation avec sexe
    if (!formData.nom.trim() || !formData.prenom.trim() || !formData.telephone.trim() || !formData.sexe) {
      afficherMessage('❌ Tous les champs sont requis', 'error');
      return;
    }

    try {
      await axios.post(`${API_URL}/membres`, formData, axiosConfig);
      afficherMessage('✅ Membre ajouté avec succès', 'success');
      // MODIFIÉ : Reset avec sexe
      setFormData({ nom: '', prenom: '', telephone: '', sexe: 'Masculin', lien: 'Étudiant' });
      chargerMembres();
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Erreur lors de l\'ajout';
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
      afficherMessage('❌ Erreur lors de la suppression', 'error');
    }
  };

  const handleImportFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validExtensions = ['.xlsx', '.xls', '.csv'];
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    
    if (!validExtensions.includes(fileExtension)) {
      afficherMessage('❌ Format de fichier invalide. Utilisez .xlsx, .xls ou .csv', 'error');
      e.target.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      afficherMessage('❌ Fichier trop volumineux. Maximum 5MB', 'error');
      e.target.value = '';
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setIsUploading(true);

    try {
      const response = await axios.post(
        `${API_URL}/import`, 
        formData, 
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          },
          timeout: 30000
        }
      );

      const { importes, erreurs, errors } = response.data;

      let messageText = `✅ Import terminé: ${importes} membres ajoutés`;
      if (erreurs > 0) {
        messageText += `, ${erreurs} erreurs`;
        if (errors && errors.length > 0) {
          console.log('Erreurs d\'import:', errors);
        }
      }

      afficherMessage(messageText, erreurs > 0 ? 'warning' : 'success');
      
      chargerMembres();
      e.target.value = '';
    } catch (error) {
      console.error('Erreur import:', error);
      const errorMsg = error.response?.data?.error || 'Erreur lors de l\'import';
      afficherMessage(`❌ ${errorMsg}`, 'error');
      e.target.value = '';
    } finally {
      setIsUploading(false);
    }
  };

  const handleExportMembres = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/export/membres`,
        {
          ...axiosConfig,
          responseType: 'blob'
        }
      );

      const date = new Date().toISOString().split('T')[0];
      saveAs(response.data, `membres_${date}.xlsx`);
      afficherMessage('✅ Export réussi', 'success');
    } catch (error) {
      console.error('Erreur export:', error);
      afficherMessage('❌ Erreur lors de l\'export', 'error');
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

      const date = new Date().toISOString().split('T')[0];
      saveAs(response.data, `mouvements_${date}.xlsx`);
      afficherMessage('✅ Export réussi', 'success');
    } catch (error) {
      console.error('Erreur export:', error);
      afficherMessage('❌ Erreur lors de l\'export', 'error');
    }
  };

  const afficherMessage = (text, type) => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => setMessage(null), 5000);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // NOUVEAU : Icône sexe
  const getSexeIcon = (sexe) => {
    if (sexe === 'Masculin') return '👨';
    if (sexe === 'Féminin') return '👩';
    return '👤';
  };

  return (
    <div className="admin-container">
      <div className="tabs">
        <button 
          onClick={() => setActiveTab('dashboard')} 
          className={activeTab === 'dashboard' ? 'active' : ''}
        >
          📊 Dashboard
        </button>
        {/* NOUVEAU : Onglet Statistiques */}
        <button 
          onClick={() => setActiveTab('stats')} 
          className={activeTab === 'stats' ? 'active' : ''}
        >
          📈 Statistiques
        </button>
        <button 
          onClick={() => setActiveTab('ajout')} 
          className={activeTab === 'ajout' ? 'active' : ''}
        >
          ➕ Ajouter Membre
        </button>
        <button 
          onClick={() => setActiveTab('import')} 
          className={activeTab === 'import' ? 'active' : ''}
        >
          📤 Import Excel/CSV
        </button>
        <button 
          onClick={() => setActiveTab('membres')} 
          className={activeTab === 'membres' ? 'active' : ''}
        >
          👥 Liste Membres ({membres.length})
        </button>
        <button 
          onClick={() => setActiveTab('presents')} 
          className={activeTab === 'presents' ? 'active' : ''}
        >
          🟢 Présents ({presents.length})
        </button>
        <button 
          onClick={() => setActiveTab('mouvements')} 
          className={activeTab === 'mouvements' ? 'active' : ''}
        >
          📋 Historique
        </button>
      </div>

      {message && (
        <div className={`message ${messageType}`}>
          {message}
        </div>
      )}

      <div className="tab-content">
        
        {/* ONGLET 0 : DASHBOARD */}
        {activeTab === 'dashboard' && (
          <Dashboard token={token} />
        )}

        {/* NOUVEAU : ONGLET STATISTIQUES */}
        {activeTab === 'stats' && (
          <StatsAdvanced token={token} />
        )}

        {/* ONGLET 1 : AJOUTER UN MEMBRE - MODIFIÉ */}
        {activeTab === 'ajout' && (
          <div className="form-container">
            <h3>Ajouter un nouveau membre</h3>
            <form onSubmit={handleAjoutMembre}>
              <div className="form-group">
                <label>Nom *</label>
                <input
                  type="text"
                  value={formData.nom}
                  onChange={(e) => setFormData({...formData, nom: e.target.value})}
                  placeholder="KPOTIN"
                  required
                />
              </div>
              <div className="form-group">
                <label>Prénom *</label>
                <input
                  type="text"
                  value={formData.prenom}
                  onChange={(e) => setFormData({...formData, prenom: e.target.value})}
                  placeholder="Jean"
                  required
                />
              </div>
              <div className="form-group">
                <label>Téléphone *</label>
                <input
                  type="tel"
                  value={formData.telephone}
                  onChange={(e) => setFormData({...formData, telephone: e.target.value})}
                  placeholder="97123456"
                  pattern="[0-9]{8,}"
                  title="Le numéro doit contenir au moins 8 chiffres"
                  required
                />
              </div>
              {/* NOUVEAU : Champ Sexe */}
              <div className="form-group">
                <label>Sexe</label>
                <select
                  value={formData.sexe}
                  onChange={(e) => setFormData({...formData, sexe: e.target.value})}
                >
                  <option value="Non spécifié">Non spécifié</option>
                  <option value="Masculin">Masculin</option>
                  <option value="Féminin">Féminin</option>
                </select>
              </div>
              <div className="form-group">
                <label>Catégorie</label>
                <select
                  value={formData.lien}
                  onChange={(e) => setFormData({...formData, lien: e.target.value})}
                >
                  <option value="Étudiant">Étudiant</option>
                  <option value="Élève">Élève</option>
                  <option value="Professionnel">Professionnel</option>
                </select>
              </div>
              <button type="submit" className="btn-primary">
                ✅ Enregistrer
              </button>
            </form>
          </div>
        )}

        {/* ONGLET 2 : IMPORT EXCEL/CSV - MODIFIÉ */}
        {activeTab === 'import' && (
          <div className="import-container">
            <h3>📤 Import de membres en masse</h3>
            
            <div className="info-box">
              <h4>📋 Instructions :</h4>
              <ol>
                <li>Préparez un fichier Excel (.xlsx) ou CSV (.csv)</li>
                <li>Les colonnes doivent être : <strong>nom</strong>, <strong>prenom</strong>, <strong>telephone</strong>, <strong>sexe</strong>, <strong>lien</strong> (lien optionnel)</li>
                <li>Valeurs sexe : Masculin, Féminin</li>
                <li>Catégories valides : Étudiant, Élève, Professionnel</li>
                <li>Taille maximale : 5 MB</li>
                <li>Exemple :</li>
              </ol>
              <table className="example-table">
                <thead>
                  <tr>
                    <th>nom</th>
                    <th>prenom</th>
                    <th>telephone</th>
                    <th>sexe</th>
                    <th>lien</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>KPOTIN</td>
                    <td>Jean</td>
                    <td>97123456</td>
                    <td>Masculin</td>
                    <td>Étudiant</td>
                  </tr>
                  <tr>
                    <td>AGBO</td>
                    <td>Marie</td>
                    <td>96654321</td>
                    <td>Féminin</td>
                    <td>Élève</td>
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
                disabled={isUploading}
              />
              <label 
                htmlFor="file-upload" 
                className={`upload-button ${isUploading ? 'disabled' : ''}`}
              >
                {isUploading ? '⏳ Import en cours...' : '📁 Choisir un fichier Excel/CSV'}
              </label>
            </div>

            {isUploading && (
              <div className="loading-message">
                <p>⏳ Import en cours, veuillez patienter...</p>
              </div>
            )}
          </div>
        )}

        {/* ONGLET 3 : LISTE DES MEMBRES - MODIFIÉ */}
        {activeTab === 'membres' && (
          <div className="table-container">
            <div className="table-header">
              <h3>Liste des membres ({membres.length})</h3>
              <button onClick={handleExportMembres} className="btn-export">
                📥 Exporter Excel
              </button>
            </div>
            
            {membres.length === 0 ? (
              <p className="empty-message">Aucun membre enregistré</p>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Nom</th>
                      <th>Prénom</th>
                      <th>Sexe</th> {/* NOUVEAU */}
                      <th>Téléphone</th>
                      <th>Catégorie</th>
                      <th>Statut</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {membres.map(membre => (
                      <tr key={membre.id}>
                        <td>{membre.nom}</td>
                        <td>{membre.prenom}</td>
                        <td>
                          {/* NOUVEAU */}
                          <span style={{fontSize: '20px'}}>
                            {getSexeIcon(membre.sexe)}
                          </span>
                          {' '}
                          {membre.sexe || 'Non spécifié'}
                        </td>
                        <td>{membre.telephone}</td>
                        <td>{membre.lien || 'Étudiant'}</td>
                        <td>
                          <span className={`badge ${membre.statut}`}>
                            {membre.statut}
                          </span>
                        </td>
                        <td>
                          {membre.statut === 'actif' && (
                            <button 
                              onClick={() => handleSupprimerMembre(membre.id)} 
                              className="btn-danger"
                              title="Désactiver"
                            >
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
          </div>
        )}

        {/* ONGLET 4 : PERSONNES PRÉSENTES */}
        {activeTab === 'presents' && (
          <div className="table-container">
            <div className="table-header">
              <h3>Personnes actuellement présentes ({presents.length})</h3>
              <button onClick={chargerPresents} className="btn-refresh">
                🔄 Actualiser
              </button>
            </div>
            
            {presents.length === 0 ? (
              <p className="empty-message">Aucune personne présente actuellement</p>
            ) : (
              <div className="table-wrapper">
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
              </div>
            )}
          </div>
        )}

        {/* ONGLET 5 : HISTORIQUE */}
        {activeTab === 'mouvements' && (
          <div className="table-container">
            <div className="table-header">
              <h3>Historique des mouvements ({mouvements.length})</h3>
              <div>
                <button onClick={chargerMouvements} className="btn-refresh">
                  🔄 Actualiser
                </button>
                <button onClick={handleExportMouvements} className="btn-export">
                  📥 Exporter Excel
                </button>
              </div>
            </div>
            
            {mouvements.length === 0 ? (
              <p className="empty-message">Aucun mouvement enregistré</p>
            ) : (
              <div className="table-wrapper">
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
        )}
      </div>
    </div>
  );
}

export default AdminInterface;