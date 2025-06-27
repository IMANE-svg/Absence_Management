import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Dashboard.css"; // CSS séparé pour le style

const Dashboard = () => {
  const [stats, setStats] = useState({
    enseignants: 0,
    etudiants: 0,
    matieres: 0,
  });

  const navigate = useNavigate();

  useEffect(() => {
    axios.get("/api/admin/dashboard-stats/")
      .then((res) => setStats(res.data))
      .catch((err) => console.error(err));
  }, []);

  const handleExport = async (type) => {
    try {
      const res = await axios.get(`/api/admin/export/${type}/`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${type}_report.xlsx`);
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error("Erreur d'exportation", error);
    }
  };

  return (
    <div className="dashboard-container">
      <h2 className="dashboard-title">Tableau de bord Administrateur</h2>

      <div className="stats-grid">
        <div className="card stat-card">
          <h3>Enseignants</h3>
          <p>{stats.enseignants}</p>
        </div>
        <div className="card stat-card">
          <h3>Étudiants</h3>
          <p>{stats.etudiants}</p>
        </div>
        <div className="card stat-card">
          <h3>Matières</h3>
          <p>{stats.matieres}</p>
        </div>
      </div>

      <div className="export-section">
        <h3>Exporter les rapports</h3>
        <button onClick={() => handleExport('enseignants')}>Exporter Enseignants</button>
        <button onClick={() => handleExport('matieres')}>Exporter Matières</button>
        <button onClick={() => handleExport('etudiants')}>Exporter Étudiants</button>
        <button onClick={() => handleExport('absences')}>Exporter Absences</button>
      </div>

      <div className="pending-btn-section">
        <button className="pending-btn" onClick={() => navigate('/admin/pending-enseignants')}>
          Voir les enseignants en attente
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
