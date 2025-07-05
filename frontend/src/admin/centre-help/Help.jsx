import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Help.css';
import api from '../../axiosConfig';
import Navbar from '../navbar/Navbar';

function Help() {
  const [helpRequests, setHelpRequests] = useState([]);
  const [responses, setResponses] = useState({});

  useEffect(() => {
    fetchHelpRequests();
  }, []);

  const fetchHelpRequests = async () => {
    try {
      const res = await api.get('help-requests/');
      setHelpRequests(res.data);
    } catch (err) {
      console.error("Erreur lors du chargement des demandes :", err.response?.data || err.message);
    }
  };

  const handleResponseChange = (id, value) => {
    setResponses({ ...responses, [id]: value });
  };

  const sendResponse = async (id) => {
    try {
      await api.post(`help-requests/respond/${id}`, {
        response: responses[id],
      });
      alert("Réponse envoyée !");
      fetchHelpRequests(); // Recharger les demandes
    } catch (err) {
      console.error("Erreur lors de l'envoi de la réponse :", err.response?.data || err.message);
    }
  };

  return (
    <div className="help-container">
      <Navbar/>
      <h2>Demandes d'aide des enseignants</h2>
      {helpRequests.map(req => (
        <div className="help-card" key={req.id}>
          <p><strong>Enseignant :</strong> {req.enseignant}</p>
          <p><strong>Message :</strong> {req.message}</p>
          <p><strong>Date :</strong> {new Date(req.created_at).toLocaleString()}</p>

          {req.resolved ? (
            <>
              <p className="resolved">✅ Résolu</p>
              <p><strong>Réponse :</strong> {req.response}</p>
              <p><strong>Répondu le :</strong> {new Date(req.responded_at).toLocaleString()}</p>
            </>
          ) : (
            <div className="response-form">
              <textarea
                placeholder="Écrire une réponse..."
                value={responses[req.id] || ''}
                onChange={(e) => handleResponseChange(req.id, e.target.value)}
              />
              <button onClick={() => sendResponse(req.id)}>Envoyer</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default Help;
