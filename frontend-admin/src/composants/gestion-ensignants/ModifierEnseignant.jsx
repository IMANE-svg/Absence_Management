import React, { useState, useEffect } from "react";
import axios from "axios";

function ModifierEnseignant({ enseignant, onClose, onModifie }) {
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    statut: ""
  });

  useEffect(() => {
    setFormData({
      nom: enseignant.nom,
      prenom: enseignant.prenom,
      statut: enseignant.statut
    });
  }, [enseignant]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:8000/api/admin/enseignants/${enseignant.id}/`, {
        ...formData,
        user: enseignant.user.id  // Nécessaire si ton serializer le demande
      });
      alert("Enseignant modifié !");
      onModifie();
      onClose();
    } catch (error) {
      alert("Erreur lors de la modification.");
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Modifier enseignant</h3>
      <input name="nom" value={formData.nom} onChange={handleChange} />
      <input name="prenom" value={formData.prenom} onChange={handleChange} />
      <select name="statut" value={formData.statut} onChange={handleChange}>
        <option value="Professeur">Professeur</option>
        <option value="Vacataire">Vacataire</option>
      </select>
      <button type="submit">Sauvegarder</button>
      <button type="button" onClick={onClose}>Annuler</button>
    </form>
  );
}

export default ModifierEnseignant;
