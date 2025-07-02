import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Enseignant.css';
import api from '../../axiosConfig';



const Enseignant = () => {
  const [enseignants, setEnseignants] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirm_password: '',
    nom: '',
    prenom: '',
    statut: 'Professeur',
  });

  // Charger les enseignants
  const fetchEnseignants = async () => {
    try {
      const res = await api.get('admin/enseignants/');
      setEnseignants(res.data);
    } catch (err) {
      console.error('Erreur de chargement :', err.response?.data || err.message);
      alert('Erreur lors du chargement des enseignants.');
    }
  };

  useEffect(() => {
    fetchEnseignants();
  }, []);

  // Changement dans les inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((f) => ({ ...f, [name]: value }));
  };

  // Soumettre ajout ou modification
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`admin/enseignants/${editingId}/`, formData);
        alert('Enseignant modifié !');
      } else {
        await api.post('admin/enseignants/', formData);
        alert('Enseignant ajouté !');
      }
      setFormData({
        email: '',
        password: '',
        confirm_password: '',
        nom: '',
        prenom: '',
        statut: 'Professeur',
      });
      setEditingId(null);
      setShowForm(false);
      fetchEnseignants();
    } catch (error) {
      console.error('Erreur lors de la soumission :', error.response?.data || error.message);
      alert('Erreur lors de la soumission.');
    }
  };

  // Modifier un enseignant
  const handleEdit = (ens) => {
    setFormData({
      nom: ens.nom,
      prenom: ens.prenom,
      statut: ens.statut,
      email: ens.email,
      password: '',
      confirm_password:'',
    });
    setEditingId(ens.id);
    setShowForm(true);
  };

  // Supprimer un enseignant
  const handleDelete = async (id) => {
    if (window.confirm('Supprimer cet enseignant ?')) {
      try {
        await api.delete(`admin/enseignants/${id}/`);
        fetchEnseignants();
      } catch (err) {
        console.error('Erreur suppression :', err.response?.data || err.message);
        alert('Erreur lors de la suppression.');
      }
    }
  };

  return (
    <div className="gestion-container">
      <h2>Liste des enseignants</h2>
      <button
        className="add-button"
        onClick={() => {
          setShowForm(!showForm);
          setFormData({
            email: '',
            password: '',
            nom: '',
            prenom: '',
            statut: 'Professeur',
          });
          setEditingId(null);
        }}
      >
        {showForm ? 'Fermer' : '+ Ajouter un enseignant'}
      </button>

      {showForm && (
        <form className="enseignant-form" onSubmit={handleSubmit}>
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            name="password"
            type="password"
            placeholder={editingId ? 'Nouveau mot de passe' : 'Mot de passe'}
            value={formData.password}
            onChange={handleChange}
            required={!editingId} // Requis uniquement à l'ajout
          />
          <input
            name="confirm_password"
            type="password"
            placeholder={editingId ? 'Confirmer nouveau mot de passe' : 'Confirmer mot de passe'}
            value={formData.confirm_password || ''}
            onChange={handleChange}
            required={!editingId}
          />
          <input
            name="nom"
            placeholder="Nom"
            value={formData.nom}
            onChange={handleChange}
            required
          />
          <input
            name="prenom"
            placeholder="Prénom"
            value={formData.prenom}
            onChange={handleChange}
            required
          />
          <select name="statut" value={formData.statut} onChange={handleChange}>
            <option value="Professeur">Professeur</option>
            <option value="Vacataire">Vacataire</option>
          </select>
          <button type="submit">{editingId ? 'Modifier' : 'Ajouter'}</button>
        </form>
      )}

      <table className="enseignant-table">
        <thead>
          <tr>
            <th>Nom</th>
            <th>Prénom</th>
            <th>Email</th>
            <th>Statut</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {enseignants.map((ens) => (
            <tr key={ens.id}>
              <td>{ens.nom}</td>
              <td>{ens.prenom}</td>
              <td>{ens.email}</td>
              <td>{ens.statut}</td>
              <td>
                <button onClick={() => handleEdit(ens)}>✏️</button>
                <button onClick={() => handleDelete(ens.id)}>🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Enseignant;
