import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import Navbar from '../navbar/Navbar';
import './Dashboard.css';
import api from '../../axiosConfig';

const Dashboard_Ens = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qrUrl, setQrUrl] = useState(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [showRapportForm, setShowRapportForm] = useState(false);
const [formData, setFormData] = useState({
  filiere: '',
  niveau: '',
  matiere: '',
  date_debut: '',
  date_fin: ''
});
const [filieres, setFilieres] = useState([]);
const [niveaux, setNiveaux] = useState([]);
const [matieres, setMatieres] = useState([]);
const [exportLoading, setExportLoading] = useState(false);




  const token = localStorage.getItem('token');

  const handleChange = async (e) => {
  const { name, value } = e.target;
  const updatedForm = { ...formData, [name]: value };
  setFormData(updatedForm);

  // Charger les matières dynamiquement si filière ou niveau change
  if (name === 'filiere' || name === 'niveau') {
    try {
      const res = await api.get('/matieres/', {
        params: {
          filiere: name === 'filiere' ? value : updatedForm.filiere,
          niveau: name === 'niveau' ? value : updatedForm.niveau
        }
      });
      setMatieres(res.data);
    } catch (err) {
      console.error("Erreur chargement matières :", err);
    }
  }
};
useEffect(() => {
  const fetchData = async () => {
    try {
      const [resFilieres, resNiveaux] = await Promise.all([
        api.get('/filieres/'),
        api.get('/niveaux/')
      ]);
      setFilieres(resFilieres.data);
      setNiveaux(resNiveaux.data);
    } catch (err) {
      console.error("Erreur chargement filtres :", err);
    }
  };

  fetchData();
}, []);


  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await api.get('dashboard/');
        setDashboardData(res.data);
      } catch (error) {
        console.error('Erreur dashboard:', error.response?.data || error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  

const navigate = useNavigate();

const handleGenerateQR = async () => {
  setQrLoading(true);
  try {
    const response = await api.post('generate-qr/', {
      session_id: dashboardData.seance_prochaine.id
    });

    const qrUrl = response.data.qr_code_url;
    localStorage.setItem('qrCodeUrl', qrUrl);
    navigate('/enseignant/code');
  } catch (error) {
    console.error('Erreur QR:', error);
    alert('Erreur lors de la génération du QR Code.');
  } finally {
    setQrLoading(false);
  }
};
const handleExport = async (e) => {
  e.preventDefault();
  const { filiere, niveau, matiere, date_debut, date_fin } = formData;

  setExportLoading(true);
  try {
    const response = await api.get('/rapport-absences/', {
      params: { filiere_id: filiere, niveau_id: niveau, matiere_id: matiere, date_debut, date_fin },
      responseType: 'blob'
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'rapport_absences.xlsx');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (err) {
    alert("Erreur lors de l'export.");
    console.error(err);
  } finally {
    setExportLoading(false);
  }
};


  if (loading) {
    return (
      <div className="dashboard-container">
        <Navbar />
        <h2 className="dashboard-title">Chargement...</h2>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <Navbar />
      <h2 className="dashboard-title">Bienvenue, Enseignant</h2>

      <div className="dashboard-cards">
        <div className="dashboard-card">
          <h3>Nombre d’étudiants</h3>
          <p>{dashboardData?.nb_etudiants ?? '-'}</p>
        </div>
        <div className="dashboard-card">
          <h3>Mes séances</h3>
          <p>{dashboardData?.nb_seances ?? '-'}</p>
        </div>
        <div className="dashboard-card">
          <h3>Séance prochaine</h3>
          {dashboardData?.seance_prochaine ? (
            <div>
              <p>
                Module : {dashboardData.seance_prochaine.module}
              </p>
              <p>Filière : {dashboardData.seance_prochaine.filiere}</p>
<p>Niveau : {dashboardData.seance_prochaine.niveau}</p>
              <p>
                Heure : {dashboardData.seance_prochaine.heure_debut} - {dashboardData.seance_prochaine.heure_fin}
              </p>
              <p>Salle : {dashboardData.seance_prochaine.salle}</p>
              <p>Jour : {dashboardData.seance_prochaine.jour}</p>
            </div>
          ) : (
            <p>Aucune séance prévue.</p>
          )}
        </div>
      </div>

      <div className="dashboard-center">
        <button
          className="dashboard-button"
          onClick={handleGenerateQR}
          disabled={qrLoading || !dashboardData?.seance_prochaine}
        >
          {qrLoading ? 'Génération...' : 'Générer QR Code'}
        </button>
      </div>

      {qrUrl && (
        <div className="dashboard-qr">
          <h3>QR Code généré :</h3>
          <img src={qrUrl} alt="QR Code" className="qr-image" />
        </div>
        
      )}
      <button className="dashboard-button" onClick={() => setShowRapportForm(true)}>
         Générer un rapport d'absences
      </button>
      {showRapportForm && (
  <form onSubmit={handleExport} className="rapport-form">
    <select name="filiere" onChange={handleChange} value={formData.filiere} required>
      <option value="">-- Filière --</option>
      {filieres.map(f => <option key={f.id} value={f.id}>{f.nom}</option>)}
    </select>

    <select name="niveau" onChange={handleChange} value={formData.niveau} required>
      <option value="">-- Niveau --</option>
      {niveaux.map(n => <option key={n.id} value={n.id}>{n.nom}</option>)}
    </select>

    <select name="matiere" onChange={handleChange} value={formData.matiere} required>
      <option value="">-- Matière --</option>
      {matieres.map(m => <option key={m.id} value={m.id}>{m.nom}</option>)}
    </select>

    <label>Début :</label>
    <input type="date" name="date_debut" onChange={handleChange} value={formData.date_debut} required />
    <label>Fin :</label>
    <input type="date" name="date_fin" onChange={handleChange} value={formData.date_fin} required />

    <button className="dashboard-button" type="submit" disabled={exportLoading}>
  {exportLoading ? "Export en cours..." : "Exporter"}
</button>
  </form>
)}

    </div>
  );
};

export default Dashboard_Ens;
