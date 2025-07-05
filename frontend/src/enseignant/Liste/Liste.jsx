import React, { useState, useEffect } from 'react';
import './Liste.css';
import Navbar from '../navbar/Navbar';
import api from '../../axiosConfig';
import { useLocation } from 'react-router-dom';

function Liste() {
  const location = useLocation();
  const [dashboardData, setDashboardData] = useState(location.state?.dashboardData || null);
  const [etudiants, setEtudiants] = useState([]);
  const [stats, setStats] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  



  const fetchDashboard = async () => {
    try {
      const response = await api.get('/dashboard/');
      setDashboardData(response.data);
    } catch (err) {
      console.error(err);
      setError("Impossible de charger les données du dashboard.");
    }
  };

  const fetchAbsences = async (sessionId) => {
    try {

      const response = await api.get(`absences/?session_id=${sessionId}`);

      setEtudiants(response.data.etudiants);
      setStats(response.data.statistiques);
    } catch (err) {
      console.error(err);
      setError("Erreur lors du chargement des absences.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!dashboardData) {
      fetchDashboard();
    }
  }, []);
  const exportToCSV = () => {
  if (!etudiants.length) return;

  const headers = ['Nom', 'Prénom', 'État'];
  const rows = etudiants.map(e => [e.nom, e.prenom, e.status]);

  let csvContent = "data:text/csv;charset=utf-8," 
    + [headers, ...rows].map(e => e.join(",")).join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `liste_absence_${stats.filiere}_${stats.niveau}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};


  useEffect(() => {
    const sessionId = dashboardData?.seance_prochaine?.id;
    if (sessionId) {
      fetchAbsences(sessionId);
    } else if (dashboardData && !dashboardData.seance_prochaine) {
      setError("Aucune séance à venir.");
      setLoading(false);
    }
  }, [dashboardData]);

  return (
    <div className="liste-absences-container">
      <Navbar />
      <h2>Liste des Présences</h2>

      {loading ? (
        <p>Chargement...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : (
        <>
          <table className="absence-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Prénom</th>
                <th>État</th>
              </tr>
            </thead>
            <tbody>
              {etudiants.map((etudiant, index) => (
                <tr key={index}>
                  <td>{etudiant.nom}</td>
                  <td>{etudiant.prenom}</td>
                  <td className={etudiant.status === 'présent(e)' ? 'present' : 'absent'}>
                    {etudiant.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="stats">
            <h3>Statistiques</h3>
            <p><strong>Filière :</strong> {stats.filiere}</p>
            <p><strong>Niveau :</strong> {stats.niveau}</p>
            <p><strong>Présents :</strong> {stats.presences}</p>
            <p><strong>Absents :</strong> {stats.absences}</p>
            <p><strong>Taux de présence :</strong> {stats.taux}%</p>
          </div>
          <button className="export-btn" onClick={exportToCSV}>
            Exporter en CSV
          </button>

        </>
      )}
    </div>
  );
}

export default Liste;