// src/components/GestionEnseignants.jsx
import React, { useState } from 'react';
import './Enseignant.css';

const Enseignant = () => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nom: '',
    prenom: '',
    statut: 'Professeur'
  });

  const handleToggleForm = () => {
    setShowForm(!showForm);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Enseignant à ajouter :', formData);
    // 👉 ICI tu peux envoyer les données au backend Django avec fetch/axios
    // Exemple :
    // await axios.post('/api/enseignants', formData)
    setFormData({
      email: '',
      password: '',
      nom: '',
      prenom: '',
      statut: 'Professeur'
    });
    setShowForm(false);
  };

  return (
    <div className="gestion-container">
      <h2>Liste des enseignants</h2>

      <button className="add-button" onClick={handleToggleForm}>
        {showForm ? 'Fermer' : '+ Ajouter un enseignant'}
      </button>

      {showForm && (
        <form className="enseignant-form" onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Mot de passe"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="nom"
            placeholder="Nom"
            value={formData.nom}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="prenom"
            placeholder="Prénom"
            value={formData.prenom}
            onChange={handleChange}
            required
          />
          <select name="statut" value={formData.statut} onChange={handleChange}>
            <option value="Professeur">Professeur</option>
            <option value="Autre">Autre</option>
          </select>
          <button type="submit">Ajouter</button>
        </form>
      )}
    </div>
  );
};

export default Enseignant;
