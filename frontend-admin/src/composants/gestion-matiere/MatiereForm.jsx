import React, { useEffect, useState } from 'react';
import axios from 'axios';

const MatiereForm = ({ matiere, filiere, niveau, onClose, onRefresh }) => {
  const [nom, setNom] = useState(matiere ? matiere.nom : '');
  const [enseignantId, setEnseignantId] = useState(matiere?.enseignant?.id || '');
  const [enseignants, setEnseignants] = useState([]);

  useEffect(() => {
    axios.get('/api/enseignants/').then(res => setEnseignants(res.data));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      nom,
      enseignant_id: enseignantId,
      filiere_id: filiere,
      niveau_id: niveau
    };

    const request = matiere
      ? axios.put(`/api/matieres/${matiere.id}/`, data)
      : axios.post('/api/matieres/', data);

    request.then(() => {
      onRefresh();
      onClose();
    });
  };

  return (
    <div className="matiere-form">
      <h3>{matiere ? 'Modifier' : 'Ajouter'} une matière</h3>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Nom de la matière"
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          required
        />

        <select value={enseignantId} onChange={(e) => setEnseignantId(e.target.value)} required>
          <option value="">Choisir un enseignant</option>
          {enseignants.map(e => (
            <option key={e.id} value={e.id}>{e.prenom} {e.nom}</option>
          ))}
        </select>

        <div className="form-buttons">
          <button type="submit">{matiere ? 'Modifier' : 'Ajouter'}</button>
          <button type="button" onClick={onClose}>Annuler</button>
        </div>
      </form>
    </div>
  );
};

export default MatiereForm;
