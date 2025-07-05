import React, { useEffect, useState } from 'react';
import { IonIcon } from '@ionic/react';
import { search, add, trash, create, chevronDown, chevronUp } from 'ionicons/icons';
import axios from 'axios';
import './Etudiant.css';
import Navbar from '../navbar/Navbar';
import api from '../../axiosConfig';
import { useNavigate } from 'react-router-dom';

const Etudiant = () => {
  const [etudiants, setEtudiants] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [filieres, setFilieres] = useState([]);
  const [niveaux, setNiveaux] = useState([]);
  const [filtres, setFiltres] = useState({
    search: '',
    filiere: '',
    niveau: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    filiere: '',
    niveau: '',
    photo: null,
    password: '',
    confirm_password: ''
  });

  // Charger les données
  useEffect(() => {
    const fetchData = async () => {
      try {
        const filieresRes = await api.get('filieres/');
        const niveauxRes = await api.get('niveaux/');
        setFilieres(filieresRes.data);
        setNiveaux(niveauxRes.data);

        if (filtres.filiere && filtres.niveau) {
          const params = new URLSearchParams();
          if (filtres.search) params.append('search', filtres.search);
          if (filtres.filiere) params.append('filiere', filtres.filiere);
          if (filtres.niveau) params.append('niveau', filtres.niveau);

          const etudiantsRes = await api.get(`admin/etudiants/?${params.toString()}`);
          setEtudiants(etudiantsRes.data);
        }
      } catch (err) {
        console.error('Erreur de chargement :', err.response?.data || err.message);
        alert('Erreur lors du chargement des données.');
      }
    };
    fetchData();
  }, [filtres]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, photo: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formDataToSend.append(key, value);
        }
      });

      if (editingId) {
        await api.put(`admin/etudiants/${editingId}/`, formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        alert('Étudiant modifié avec succès !');
      } else {
        await api.post('admin/etudiants/', formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        alert('Étudiant ajouté avec succès !');
      }

      setFormData({
        nom: '',
        prenom: '',
        email: '',
        filiere: '',
        niveau: '',
        photo: null,
        password: '',
        confirm_password: ''
      });
      setEditingId(null);
      setShowForm(false);

      const params = new URLSearchParams();
      if (filtres.search) params.append('search', filtres.search);
      if (filtres.filiere) params.append('filiere', filtres.filiere);
      if (filtres.niveau) params.append('niveau', filtres.niveau);

      const res = await api.get(`admin/etudiants/?${params.toString()}`);
      setEtudiants(res.data);
    } catch (error) {
      console.error('Erreur lors de la soumission :', error.response?.data || error.message);
      alert('Erreur lors de la soumission du formulaire.');
    }
  };

const navigate = useNavigate();

const handleEdit = (etudiant) => {
  navigate(`/admin/etudiants/edit/${etudiant.id}`);
};

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet étudiant ?')) {
      try {
        await api.delete(`admin/etudiants/${id}/`);
        setEtudiants(etudiants.filter((etudiant) => etudiant.id !== id));
      } catch (err) {
        console.error('Erreur suppression :', err.response?.data || err.message);
        alert('Erreur lors de la suppression.');
      }
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFiltres({ ...filtres, [name]: value });
  };

  return (
    <div className="app-container">
      <Navbar />
      <div className="main-content">
        <div className="etudiant-container">
          {/* Barre de recherche */}
          <div className="search-bar">
            <div className="search-input">
              <IonIcon icon={search} />
              <input
                type="text"
                name="search"
                placeholder="Rechercher par nom, prénom ou email..."
                value={filtres.search}
                onChange={(e) => setFiltres({ ...filtres, search: e.target.value })}
              />
            </div>
          </div>

          {/* Zone de filtres en bas de la barre de recherche */}
          <div className="quick-filters">
            {/* Filière */}
            <div className="filter-item">
              <label htmlFor="quickFiliere">Filière</label>
              <select
                id="quickFiliere"
                name="filiere"
                value={filtres.filiere}
                onChange={handleFilterChange}
              >
                <option value="">Toutes</option>
                {filieres.map((filiere) => (
                  <option key={filiere.id} value={filiere.nom}>
                    {filiere.nom}
                  </option>
                ))}
              </select>
            </div>

            {/* Niveau */}
            <div className="filter-item">
              <label htmlFor="quickNiveau">Niveau</label>
              <select
                id="quickNiveau"
                name="niveau"
                value={filtres.niveau}
                onChange={handleFilterChange}
              >
                <option value="">Tous</option>
                {niveaux.map((niveau) => (
                  <option key={niveau.id} value={niveau.nom}>
                    {niveau.nom}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Bouton Toggle Filtres avancés */}
          <div className="filter-actions">
            <button className="filter-toggle" onClick={() => setShowFilters(!showFilters)}>
              <IonIcon icon={showFilters ? chevronUp : chevronDown} />
              <span>Filtres</span>
            </button>
          </div>

          {/* Formulaire modification */}
          {showForm && (
            <form className="etudiant-form" onSubmit={handleSubmit}>
              <h2>{editingId ? 'Modifier un étudiant' : 'Ajouter un étudiant'}</h2>
              <div className="form-group">
                <label>Nom</label>
                <input
                  type="text"
                  name="nom"
                  value={formData.nom}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Prénom</label>
                <input
                  type="text"
                  name="prenom"
                  value={formData.prenom}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Filière</label>
                <select
                  name="filiere"
                  value={formData.filiere}
                  onChange={handleChange}
                  required
                >
                  <option value="">Sélectionner une filière</option>
                  {filieres.map(filiere => (
                    <option key={filiere.id} value={filiere.nom}>
                      {filiere.nom}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Niveau</label>
                <select
                  name="niveau"
                  value={formData.niveau}
                  onChange={handleChange}
                  required
                >
                  <option value="">Sélectionner un niveau</option>
                  {niveaux.map(niveau => (
                    <option key={niveau.id} value={niveau.nom}>
                      {niveau.nom}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Photo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                />
                {formData.photo && typeof formData.photo === 'string' && (
                  <img 
                    src={formData.photo} 
                    alt="Photo actuelle" 
                    className="current-photo"
                  />
                )}
              </div>
              <div className="form-group">
                <label>Mot de passe</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required={!editingId}
                  placeholder={editingId ? 'Laisser vide pour ne pas modifier' : ''}
                />
              </div>
              <div className="form-group">
                <label>Confirmer mot de passe</label>
                <input
                  type="password"
                  name="confirm_password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  required={!editingId}
                />
              </div>
              <div className="form-actions">
                <button type="button" onClick={() => setShowForm(false)}>
                  Annuler
                </button>
                <button type="submit">
                  {editingId ? 'Modifier' : 'Ajouter'}
                </button>
              </div>
            </form>
          )}

          {/* Tableau des étudiants */}
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
                {filtres.filiere && filtres.niveau ? (
                  etudiants.length > 0 ? (
                    etudiants.map(etudiant => (
                      <tr key={etudiant.id}>
                        <td>
                          {etudiant.photo ? (
                            <img 
                              src={etudiant.photo} 
                              alt={`${etudiant.prenom} ${etudiant.nom}`} 
                              className="student-photo"
                            />
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
                          <button 
                            className="edit-button"
                            onClick={() => handleEdit(etudiant)}
                          >
                            <IonIcon icon={create} />
                          </button>
                          <button 
                            className="delete-button"
                            onClick={() => handleDelete(etudiant.id)}
                          >
                            <IonIcon icon={trash} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="no-data">
                        Aucun étudiant trouvé
                      </td>
                    </tr>
                  )
                ) : (
                  <tr>
                    <td colSpan="7" className="no-data">
                      Veuillez sélectionner une filière et un niveau.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Etudiant;