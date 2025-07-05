import React, { useEffect, useState } from 'react';
import api from '../../axiosConfig';
import './MesSeances.css';
import Navbar from '../navbar/Navbar'

const MesSeances = () => {
  const [seances, setSeances] = useState([]);
  const [matieres, setMatieres] = useState([]);
  const [filieres, setFilieres] = useState([]);
const [niveaux, setNiveaux] = useState([]);
const [salles, setSalles] = useState([]);
const [editingId, setEditingId] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    type_seance: 'Cours',
    module: '',
    salle: '',
    filiere: '',
    niveau: '',
    jour: 'Lundi',
    heure_debut: '',
    heure_fin: '',
    date_debut: '',
    date_fin: '',
  });

  const fetchSeances = async () => {
    try {
      const res = await api.get('seances/');
      setSeances(res.data);
    } catch (err) {
      console.error("Erreur chargement séances :", err);
    }
  };

  const fetchMatieres = async () => {
  const res = await api.get('matieres/');
  setMatieres(res.data);
};

const fetchSalles = async () => {
  const res = await api.get('salles/');
  setSalles(res.data);
};
const fetchFilieres = async () => {
  const res = await api.get('filieres/');
  setFilieres(res.data);
};

const fetchNiveaux = async () => {
  const res = await api.get('niveaux/');
  setNiveaux(res.data);
};
  useEffect(() => {
    fetchSeances();
    fetchMatieres();
  fetchSalles();
  fetchFilieres();
  fetchNiveaux();
  }, []);

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  // On prépare les données à envoyer (sans module, filiere, niveau)
  const payload = {
    type_seance: formData.type_seance,
    matiere: formData.matiere, // ✅ ID requis
    salle: formData.salle,
    jour: formData.jour,
    heure_debut: formData.heure_debut,
    heure_fin: formData.heure_fin,
    date_debut: formData.date_debut,
    date_fin: formData.date_fin,
  };

  try {
    if (editingId) {
      await api.put(`seances/${editingId}/`, payload);
      alert('Séance modifiée avec succès !');
    } else {
      await api.post('seances/', payload);
      alert('Séance ajoutée avec succès !');
    }

    // Réinitialisation
    setFormData({
      type_seance: 'Cours',
      matiere: '',
      salle: '',
      filiere: '',
      niveau: '',
      jour: 'Lundi',
      heure_debut: '',
      heure_fin: '',
      date_debut: '',
      date_fin: '',
    });
    setEditingId(null);
    setShowForm(false);
    fetchSeances();
  } catch (error) {
    console.error('Erreur :', error.response?.data || error.message);
    alert("Erreur lors de l'enregistrement.");
  }
};


 
 const handleEdit = (seance) => {
  setFormData({
    type_seance: seance.type_seance,
    matiere: seance.matiere, // ✅ ID attendu
    salle: seance.salle,
    filiere: '', // facultatif, juste pour affichage
    niveau: '',
    jour: seance.jour,
    heure_debut: seance.heure_debut,
    heure_fin: seance.heure_fin,
    date_debut: seance.date_debut,
    date_fin: seance.date_fin,
  });
  setEditingId(seance.id);
  setShowForm(true);
};


const handleDelete = async (id) => {
  if (window.confirm("Confirmer la suppression de cette séance ?")) {
    try {
      await api.delete(`seances/${id}/`);
      alert("Séance supprimée !");
      fetchSeances(); // 🔄 recharge la liste
    } catch (error) {
      console.error("Erreur suppression :", error);
      alert("Erreur lors de la suppression.");
    }
  }
};

  const getFiliereNom = (id) => {
  const f = filieres.find(f => f.id === id);
  return f ? f.nom : '—';
};

const getNiveauNom = (id) => {
  const n = niveaux.find(n => n.id === id);
  return n ? n.nom : '—';
};

  return (
    <div className="seance-container">
      <Navbar/>
      <h2 className="seance-title">Mes séances planifiées</h2>

      <button
        className="toggle-form-btn"
        onClick={() => setShowForm(!showForm)}
      >
        {showForm ? 'Fermer le formulaire' : '+ Ajouter une séance'}
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} className="seance-form">
          <select name="type_seance" value={formData.type_seance} onChange={handleChange}>
            <option value="Cours">Cours</option>
            <option value="TD">TD</option>
            <option value="TP">TP</option>
          </select>

          <select name="matiere" value={formData.matiere} onChange={handleChange} required>
  <option value="">-- Choisir une matière --</option>
  {matieres.map((m) => (
  <option key={m.id} value={m.id}>
    {m.nom} ({getFiliereNom(m.filiere_id)} - {getNiveauNom(m.niveau_id)})
  </option>
))}
</select>

<select name="salle" value={formData.salle} onChange={handleChange} required>
  <option value="">-- Choisir une salle --</option>
  {salles.map((s) => (
    <option key={s.id} value={s.id}>{s.nom}</option>
  ))}
</select>
         

          <select name="jour" value={formData.jour} onChange={handleChange}>
            <option value="Lundi">Lundi</option>
            <option value="Mardi">Mardi</option>
            <option value="Mercredi">Mercredi</option>
            <option value="Jeudi">Jeudi</option>
            <option value="Vendredi">Vendredi</option>
            <option value="Samedi">Samedi</option>
          </select>

          <input type="time" name="heure_debut" value={formData.heure_debut} onChange={handleChange} required />
          <input type="time" name="heure_fin" value={formData.heure_fin} onChange={handleChange} required />
          <input type="date" name="date_debut" value={formData.date_debut} onChange={handleChange} required />
          <input type="date" name="date_fin" value={formData.date_fin} onChange={handleChange} required />

          <button type="submit" className="submit-btn">Ajouter</button>
        </form>
      )}

      {seances.length === 0 ? (
        <p className="seance-empty">Aucune séance enregistrée.</p>
      ) : (
        <table className="seance-table">
          <thead>
            <tr>
              <th>Jour</th>
              <th>Heure</th>
              <th>Module</th>
              <th>Salle</th>
              <th>Filière</th>
              <th>Niveau</th>
              <th>Période</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {seances.map((s) => (
              <tr key={s.id}>
                <td>{s.jour}</td>
                <td>{s.heure_debut} - {s.heure_fin}</td>
                <td>{s.module}</td>
                <td>{s.salle}</td>
                <td>{s.filiere}</td>
                <td>{s.niveau}</td>
                <td>{s.date_debut} → {s.date_fin}</td>
                <td>
                  <button className="edit-btn" onClick={() => handleEdit(s)}>Modifier</button>
                  <button className="delete-btn" onClick={() => handleDelete(s.id)}>Supprimer</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default MesSeances;
