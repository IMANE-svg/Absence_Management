import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Help.css';

function Help() {
  const [helpRequests, setHelpRequests] = useState([]);
  const [responses, setResponses] = useState({});

  useEffect(() => {
    axios.get('/api/help-requests/')
      .then(res => setHelpRequests(res.data))
      .catch(err => console.error(err));
  }, []);

  const handleResponseChange = (id, value) => {
    setResponses({ ...responses, [id]: value });
  };

  const sendResponse = (id) => {
    axios.post(`/api/help-requests/${id}/respond/`, { response: responses[id] })
      .then(() => {
        alert("Réponse envoyée !");
        // Recharger les demandes
        return axios.get('/api/help-requests/');
      })
      .then(res => setHelpRequests(res.data))
      .catch(err => console.error(err));
  };

  return (
    <div className="help-container">
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
