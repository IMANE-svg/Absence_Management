import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Dashboard.css"; 
import Navbar from "../navbar/Navbar.jsx"
import api from "../../axiosConfig.js";


const Dashboard = () => {
  const [stats, setStats] = useState({
    enseignants: 0,
    etudiants: 0,
    matieres: 0,
  });
const [filieres, setFilieres] = useState([]);
  const [niveaux, setNiveaux] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const loadFilters = async () => {
      try {
        const filieresRes = await api.get('filieres/');
        setFilieres(filieresRes.data);
        
        const niveauxRes = await api.get('niveaux/');
        setNiveaux(niveauxRes.data);
      } catch (err) {
        console.error('Erreur de chargement des filtres:', err);
      }
    };

    const fetchStats = async () => {
      try {
        const res = await api.get("admin/dashboard-stats/");
        setStats(res.data);
      } catch (err) {
        console.error("Erreur lors du chargement des statistiques :", err.response?.data || err.message);
      }
    };

    loadFilters();
    fetchStats();
  }, []);

  const handleTeacherReport = async () => {
  const periodeSelect = document.getElementById('enseignant-periode');
  const periode = periodeSelect.value;

  if (!periode) {
    alert('Veuillez sélectionner une période');
    return;
  }

  try {
    const res = await api.get(`admin/qr-report/?periode=${periode}`, { 
      responseType: 'blob' 
    });
    
    const urlObject = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = urlObject;
    link.setAttribute('download', `rapport_utilisation_qr_${periode}_${new Date().toISOString().split('T')[0]}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error) {
    console.error('Erreur lors de la génération du rapport:', error);
    alert('Erreur lors de la génération du rapport');
  }
};

  const handleStudentReport = async () => {
  const filiereSelect = document.getElementById('filiere-select');
  const niveauSelect = document.getElementById('niveau-select');
  const periodeSelect = document.getElementById('periode-select');

  const filiereId = filiereSelect.value;
  const niveauId = niveauSelect.value;
  const periode = periodeSelect.value;

  if (!filiereId || !niveauId) {
    alert('Veuillez sélectionner une filière et un niveau');
    return;
  }

  try {
    // Récupérer les noms pour le nom de fichier
    const filiereNom = filiereSelect.options[filiereSelect.selectedIndex].text;
    const niveauNom = niveauSelect.options[niveauSelect.selectedIndex].text;

    let url = `admin/export-absences/?filiere=${filiereId}&niveau=${niveauId}`;
    
    if (periode === 'mois') {
      const currentDate = new Date();
      const month = currentDate.getMonth() + 1;
      const year = currentDate.getFullYear();
      url += `&mois=${year}-${month.toString().padStart(2, '0')}`;
    }
    // Ajouter d'autres conditions pour semestre/année si nécessaire

    const res = await api.get(url, { responseType: 'blob' });
    
    const urlObject = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = urlObject;
    link.setAttribute('download', `absences_${filiereNom}_${niveauNom}_${new Date().toISOString().split('T')[0]}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error) {
    console.error('Erreur lors de la génération du rapport:', error);
    alert('Erreur lors de la génération du rapport');
  }
};

  return (
    <div className="dashboard-container">
     <Navbar/>
      <h2 className="dashboard-title">Tableau de bord Administrateur</h2>

      <div className="stats-grid">
        <div className="card stat-card">
          <h3>Enseignants</h3>
          <p>{stats.total_enseignants}</p>
        </div>
        <div className="card stat-card">
          <h3>Étudiants</h3>
          <p>{stats.total_etudiants}</p>
        </div>
        <div className="card stat-card">
          <h3>Matières</h3>
          <p>{stats.total_matieres}</p>
        </div>
      </div>

      

      <div className="export-section">
  {/* Premier conteneur pour le rapport des étudiants */}
  <div className="report-container">
    <h3>Rapport des Absences par Filière/Niveau</h3>
    <div className="report-controls">
      <select id="filiere-select" className="report-select">
  <option value="">Sélectionner une filière</option>
  {filieres.map(filiere => (
    <option key={filiere.id} value={filiere.id}>
      {filiere.nom}
    </option>
  ))}
</select>

<select id="niveau-select" className="report-select">
  <option value="">Sélectionner un niveau</option>
  {niveaux.map(niveau => (
    <option key={niveau.id} value={niveau.id}>
      {niveau.nom}
    </option>
  ))}
</select>
      
      <select id="periode-select" className="report-select">
        <option value="">Période</option>
        <option value="mois">Mois actuel</option>
        <option value="semestre">Semestre actuel</option>
        <option value="annee">Année actuelle</option>
      </select>
      
      <button 
        onClick={() => handleStudentReport()} 
        className="report-button"
      >
        Générer Rapport
      </button>
    </div>
  </div>

  {/* Deuxième conteneur pour le rapport des enseignants */}
  <div className="report-container">
    <h3>Rapport des Enseignants</h3>
    <div className="report-controls">
      <select id="enseignant-periode" className="report-select">
        <option value="">Période</option>
        <option value="mois">Mois actuel</option>
        <option value="semestre">Semestre actuel</option>
      </select>
      
      <button 
        onClick={handleTeacherReport} 
        className="report-button"
      >
        Exporter Enseignants
      </button>
    </div>
  </div>
</div>

      
    </div>
  );
};

export default Dashboard;
