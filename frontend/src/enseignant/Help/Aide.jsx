import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Aide.css";
import Navbar from "../navbar/Navbar";
import api from "../../axiosConfig";

const Aide = () => {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [requests, setRequests] = useState([]);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const fetchRequests = async () => {
    try {
      const res = await api.get("my-help-requests/");
      setRequests(res.data);
    } catch (error) {
      console.error("Erreur de récupération des messages :", error.response?.data || error.message);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg("");
    setErrorMsg("");

    try {
      await api.post("my-help-requests/", { subject, message });
      setSuccessMsg("Message envoyé avec succès !");
      setSubject("");
      setMessage("");
      fetchRequests(); // Rafraîchir les demandes
    } catch (error) {
      setErrorMsg("Erreur lors de l'envoi du message.");
      console.error("Erreur d'envoi :", error.response?.data || error.message);
    }
  };

  return (
    <div className="help-container">
      <Navbar/>
      <h2>Centre d'aide</h2>

      <form onSubmit={handleSubmit} className="help-form">
        <input
  type="text"
  value={subject}
  onChange={(e) => setSubject(e.target.value)}
  placeholder="Sujet de la demande"
  required
/>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Décrivez votre problème ou question..."
          required
        />
        <button type="submit">Envoyer</button>
        {successMsg && <p className="success">{successMsg}</p>}
        {errorMsg && <p className="error">{errorMsg}</p>}
      </form>
      <h3>Historique des demandes</h3>
      <ul className="help-list">
        {requests.map((req) => (
          <li key={req.id} className="help-item">
            <div className="help-msg">
              <strong>Vous :</strong> {req.message}
              <br />
              <small>Envoyé le {new Date(req.created_at).toLocaleDateString()}</small>
            </div>
            {req.response ? (
              <div className="admin-response">
                <strong>Réponse admin :</strong> {req.response}
                <br />
                <small>Répondu le {new Date(req.responded_at).toLocaleDateString()}</small>
              </div>
            ) : (
              <p className="pending">⏳ En attente de réponse</p>
            )}
          </li>
        ))}
      </ul>
    
    </div>
  );
};

export default Aide;
