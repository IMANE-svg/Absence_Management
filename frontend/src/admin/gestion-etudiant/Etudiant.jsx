import React, { useState, useEffect } from 'react';
import { IonIcon } from '@ionic/react';
import { search, add, trash, create, chevronDown, chevronUp } from 'ionicons/icons';
import axios from 'axios';
import './Etudiant.css'; // Nous allons créer ce fichier CSS

const Etudiant = () => {
  const [etudiants, setEtudiants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtres, setFiltres] = useState({
    search: '',
    filiere: '',
    niveau: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [filieres, setFilieres] = useState([]);
  const [niveaux, setNiveaux] = useState([]);

  // Récupérer la liste des étudiants
  useEffect(() => {
    const fetchEtudiants = async () => {
      try {
        const params = {};
        if (filtres.search) params.search = filtres.search;
        if (filtres.filiere) params.filiere = filtres.filiere;
        if (filtres.niveau) params.niveau = filtres.niveau;

        const response = await axios.get('/api/admin/etudiants/', { params });
        setEtudiants(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchFilieresNiveaux = async () => {
      try {
        const filieresRes = await axios.get('/api/filieres/');
        const niveauxRes = await axios.get('/api/niveaux/');
        setFilieres(filieresRes.data);
        setNiveaux(niveauxRes.data);
      } catch (err) {
        console.error("Erreur lors du chargement des filtres", err);
      }
    };

    fetchEtudiants();
    fetchFilieresNiveaux();
  }, [filtres]);

  const handleSearchChange = (e) => {
    setFiltres({...filtres, search: e.target.value});
  };

  const handleFiliereChange = (e) => {
    setFiltres({...filtres, filiere: e.target.value});
  };

  const handleNiveauChange = (e) => {
    setFiltres({...filtres, niveau: e.target.value});
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const deleteEtudiant = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet étudiant ?")) {
      try {
        await axios.delete(`/api/admin/etudiants/${id}/`);
        setEtudiants(etudiants.filter(etudiant => etudiant.id !== id));
      } catch (err) {
        setError("Erreur lors de la suppression");
      }
    }
  };

  if (loading) return <div className="loading">Chargement...</div>;
  if (error) return <div className="error">Erreur: {error}</div>;

  return (
    <div className="etudiant-container">
      <div className="header">
        <h1>Gestion des Étudiants</h1>
        <button className="add-button">
          <IonIcon icon={add} />
          <span>Ajouter un étudiant</span>
        </button>
      </div>

      <div className="search-bar">
        <div className="search-input">
          <IonIcon icon={search} />
          <input
            type="text"
            placeholder="Rechercher un étudiant..."
            value={filtres.search}
            onChange={handleSearchChange}
          />
        </div>
        <button className="filter-toggle" onClick={toggleFilters}>
          <span>Filtres</span>
          <IonIcon icon={showFilters ? chevronUp : chevronDown} />
        </button>
      </div>

      {showFilters && (
        <div className="filters">
          <div className="filter-group">
            <label>Filière</label>
            <select value={filtres.filiere} onChange={handleFiliereChange}>
              <option value="">Toutes les filières</option>
              {filieres.map(filiere => (
                <option key={filiere.id} value={filiere.nom}>{filiere.nom}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Niveau</label>
            <select value={filtres.niveau} onChange={handleNiveauChange}>
              <option value="">Tous les niveaux</option>
              {niveaux.map(niveau => (
                <option key={niveau.id} value={niveau.nom}>{niveau.nom}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      <div className="etudiant-table-container">
        <table className="etudiant-table">
          <thead>
            <tr>
              <th>Photo</th>
              <th>Nom</th>
              <th>Prénom</th>
              <th>Email</th>
              <th>Filière</th>
              <th>Niveau</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {etudiants.length > 0 ? (
              etudiants.map(etudiant => (
                <tr key={etudiant.id}>
                  <td>
                    {etudiant.photo ? (
                      <img src={etudiant.photo} alt={`${etudiant.prenom} ${etudiant.nom}`} />
                    ) : (
                      <div className="avatar-placeholder">
                        {etudiant.prenom.charAt(0)}{etudiant.nom.charAt(0)}
                      </div>
                    )}
                  </td>
                  <td>{etudiant.nom}</td>
                  <td>{etudiant.prenom}</td>
                  <td>{etudiant.email}</td>
                  <td>{etudiant.filiere}</td>
                  <td>{etudiant.niveau}</td>
                  <td className="actions">
                    <button className="edit-button">
                      <IonIcon icon={create} />
                    </button>
                    <button 
                      className="delete-button"
                      onClick={() => deleteEtudiant(etudiant.id)}
                    >
                      <IonIcon icon={trash} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="no-data">Aucun étudiant trouvé</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Etudiant;