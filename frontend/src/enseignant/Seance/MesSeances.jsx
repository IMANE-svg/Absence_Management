import React, { useEffect, useState } from 'react';
import api from '../../axiosConfig';
import './MesSeances.css';

const MesSeances = () => {
  const [seances, setSeances] = useState([]);
  const [matieres, setMatieres] = useState([]);
  const [filieres, setFilieres] = useState([]);
const [niveaux, setNiveaux] = useState([]);
const [salles, setSalles] = useState([]);
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
    try {
      await api.post('seances/', formData);
      alert('Séance ajoutée avec succès !');
      setFormData({
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
      setShowForm(false);
      fetchSeances(); // 🔄 recharge les séances
    } catch (error) {
      console.error('Erreur :', error.response?.data || error.message);
      alert("Erreur lors de l'ajout.");
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
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default MesSeances;
