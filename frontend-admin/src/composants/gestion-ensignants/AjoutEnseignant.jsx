import React, { useState } from "react";
import axios from "axios";

function AjoutEnseignant({ onAjout }) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    nom: "",
    prenom: "",
    statut: "Professeur"
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:8000/api/admin/enseignants/", formData);
      alert("Enseignant ajouté !");
      setFormData({ email: "", password: "", nom: "", prenom: "", statut: "Professeur" });
      onAjout();
    } catch (error) {
      alert("Erreur lors de l’ajout.");
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Ajouter un enseignant</h3>
      <input name="email" type="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
      <input name="password" type="password" placeholder="Mot de passe" value={formData.password} onChange={handleChange} required />
      <input name="nom" placeholder="Nom" value={formData.nom} onChange={handleChange} required />
      <input name="prenom" placeholder="Prénom" value={formData.prenom} onChange={handleChange} required />
      <select name="statut" value={formData.statut} onChange={handleChange}>
        <option value="Professeur">Professeur</option>
        <option value="Vacataire">Vacataire</option>
      </select>
      <button type="submit">Ajouter</button>
    </form>
  );
}

export default AjoutEnseignant;
