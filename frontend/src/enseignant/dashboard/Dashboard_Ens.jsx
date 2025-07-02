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
  

  const token = localStorage.getItem('token');

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
const handleVoirListe = () => {
  navigate('/enseignant/liste', { state: { dashboardData } });
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
      <button className="dashboard-button" onClick={handleVoirListe}>Voir la liste des présences</button>


    </div>
  );
};

export default Dashboard_Ens;
