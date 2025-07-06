import React, { useEffect, useState } from 'react';
import api from '../../axiosConfig';
import './Matiere.css';
import Navbar from '../navbar/Navbar';

const Matiere = () => {
  const [filieres, setFilieres] = useState([]);
  const [niveaux, setNiveaux] = useState([]);
  const [enseignants, setEnseignants] = useState([]);
  const [matieres, setMatieres] = useState([]);
  const [selectedFiliere, setSelectedFiliere] = useState('');
  const [selectedNiveau, setSelectedNiveau] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingMatiere, setEditingMatiere] = useState(null);

  // Form state
  const [nom, setNom] = useState('');
  const [enseignantId, setEnseignantId] = useState('');

  useEffect(() => {
    api.get('filieres/').then(res => setFilieres(res.data));
    api.get('niveaux/').then(res => setNiveaux(res.data));
    api.get('admin/enseignants/').then(res => setEnseignants(res.data));
  }, []);

  useEffect(() => {
    if (selectedFiliere && selectedNiveau) {
      api
        .get(`matieres/?filiere=${selectedFiliere}&niveau=${selectedNiveau}`)
        .then(res => setMatieres(res.data));
    }
  }, [selectedFiliere, selectedNiveau]);

  const handleDelete = (id) => {
    api.delete(`matieres/${id}/`).then(() => {
      setMatieres(matieres.filter(m => m.id !== id));
    });
  };
  const handleEdit = (matiere) => {
    setEditingMatiere(matiere);
    setNom(matiere.nom);
    setEnseignantId(matiere.enseignant.id);
    setShowForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
  nom,
  enseignant_id: enseignantId,
  filiere_id: selectedFiliere,
  niveau_id: selectedNiveau,
};

    const request = editingMatiere
      ? api.put(`matieres/${editingMatiere.id}/`, data)
      : api.post('matieres/', data);

    request.then(() => {
      api
        .get(`matieres/?filiere=${selectedFiliere}&niveau=${selectedNiveau}`)
        .then(res => setMatieres(res.data));

      setShowForm(false);
      setEditingMatiere(null);
      setNom('');
      setEnseignantId('');
    });
  };

  return (
    <div className="gestion-matiere-container">
      <Navbar/>
      <h2>Gestion des Matières</h2>

      <div className="filters">
        <select value={selectedFiliere} onChange={(e) => setSelectedFiliere(e.target.value)}>
          <option value="">Choisir une filière</option>
          {filieres.map(f => <option key={f.id} value={f.id}>{f.nom}</option>)}
        </select>

        <select value={selectedNiveau} onChange={(e) => setSelectedNiveau(e.target.value)}>
          <option value="">Choisir un niveau</option>
          {niveaux.map(n => <option key={n.id} value={n.id}>{n.nom}</option>)}
        </select>
      </div>

      {selectedFiliere && selectedNiveau && (
        <>
          <table className="matiere-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Enseignant</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {matieres.map(m => (
                <tr key={m.id}>
                  <td>{m.nom}</td>
                  <td>{m.enseignant.prenom} {m.enseignant.nom}</td>
                  <td>
                    <button onClick={() => handleEdit(m)}>Modifier</button>
                    <button onClick={() => handleDelete(m.id)}>Supprimer</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button className="add-btn" onClick={() => {
            setEditingMatiere(null);
            setNom('');
            setEnseignantId('');
            setShowForm(true);
          }}>
            + Ajouter une matière
          </button>

          {showForm && (
            <form className="matiere-form" onSubmit={handleSubmit}>
              <h3>{editingMatiere ? 'Modifier la matière' : 'Ajouter une matière'}</h3>

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
                  <option key={e.id} value={e.id}>
                    {e.prenom} {e.nom}
                  </option>
                ))}
              </select>

              <div className="form-actions">
                <button type="submit">{editingMatiere ? 'Modifier' : 'Ajouter'}</button>
                <button type="button" onClick={() => setShowForm(false)}>Annuler</button>
              </div>
            </form>
          )}
        </>
      )}
    </div>
  );
};

export default Matiere;