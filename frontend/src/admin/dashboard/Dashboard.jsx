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

  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("admin/dashboard-stats/");
        setStats(res.data);
      } catch (err) {
        console.error("Erreur lors du chargement des statistiques :", err.response?.data || err.message);
      }
    };
    fetchStats();
  }, []);

  const handleExport = async (type) => {
    try {
      const res = await api.get(`admin/export/${type}/`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${type}_report.xlsx`);
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error("Erreur d'exportation :", error.response?.data || error.message);
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
