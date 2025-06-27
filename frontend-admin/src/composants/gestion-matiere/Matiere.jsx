import React, { useEffect, useState } from 'react';
import axios from 'axios';
import MatiereForm from './MatiereForm';
import './Matiere.css';

const Matiere = () => {
  const [filieres, setFilieres] = useState([]);
  const [niveaux, setNiveaux] = useState([]);
  const [matieres, setMatieres] = useState([]);
  const [selectedFiliere, setSelectedFiliere] = useState('');
  const [selectedNiveau, setSelectedNiveau] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingMatiere, setEditingMatiere] = useState(null);

  useEffect(() => {
    axios.get('/api/filieres/').then(res => setFilieres(res.data));
    axios.get('/api/niveaux/').then(res => setNiveaux(res.data));
  }, []);

  useEffect(() => {
    if (selectedFiliere && selectedNiveau) {
      axios
        .get(`/api/matieres/?filiere=${selectedFiliere}&niveau=${selectedNiveau}`)
        .then(res => setMatieres(res.data));
    }
  }, [selectedFiliere, selectedNiveau]);

  const handleDelete = (id) => {
    axios.delete(`/api/matieres/${id}/`).then(() => {
      setMatieres(matieres.filter(m => m.id !== id));
    });
  };

  const handleEdit = (matiere) => {
    setEditingMatiere(matiere);
    setShowForm(true);
  };

  return (
    <div className="gestion-matiere-container">
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

          <button className="add-btn" onClick={() => { setEditingMatiere(null); setShowForm(true); }}>+ Ajouter une matière</button>

          {showForm && (
            <MatiereForm
              filiere={selectedFiliere}
              niveau={selectedNiveau}
              matiere={editingMatiere}
              onClose={() => setShowForm(false)}
              onRefresh={() => {
                axios
                  .get(`/api/matieres/?filiere=${selectedFiliere}&niveau=${selectedNiveau}`)
                  .then(res => setMatieres(res.data));
              }}
            />
          )}
        </>
      )}
    </div>
  );
};

export default Matiere;
