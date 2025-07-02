import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Parametre.css";
import Navbar from "../navbar/Navbar";
import api from "../../axiosConfig";

const Parametre = () => {
  // States pour email
  const [email, setEmail] = useState("");
  const [emailMsg, setEmailMsg] = useState("");

  // States pour mot de passe
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState("");

  // Charger l’email actuel au chargement
  useEffect(() => {
    const fetchEmail = async () => {
      try {
        const res = await api.get("profile/");
        setEmail(res.data.email);
      } catch (error) {
        console.error("Erreur lors du chargement de l'email", error.response?.data || error.message);
      }
    };
    fetchEmail();
  }, []);

  // Soumettre la mise à jour de l'email
  const handleEmailUpdate = async (e) => {
    e.preventDefault();
    setEmailMsg("");

    try {
      await api.post("profile/", { email });
      setEmailMsg("Email mis à jour avec succès !");
    } catch (error) {
      setEmailMsg(
        error.response?.data?.email
          ? error.response.data.email[0]
          : "Erreur lors de la mise à jour de l'email."
      );
    }
  };

  // Soumettre la mise à jour du mot de passe
  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setPasswordMsg("");

    try {
      await api.post("profile/password/", {
        old_password: oldPassword,
        new_password: newPassword,
      });
      setPasswordMsg("Mot de passe mis à jour avec succès !");
      setOldPassword("");
      setNewPassword("");
    } catch (error) {
      setPasswordMsg(
        error.response?.data?.error
          ? error.response.data.error
          : "Erreur lors de la mise à jour du mot de passe."
      );
    }
  };

  return (
    <div className="profile-settings-container">
      <Navbar/>
      <h2>Paramètres du profil</h2>

      <form onSubmit={handleEmailUpdate} className="form-section">
        <h3>Changer l'email</h3>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="Nouvel email"
        />
        <button type="submit">Mettre à jour l'email</button>
        {emailMsg && <p className="message">{emailMsg}</p>}
      </form>

      <form onSubmit={handlePasswordUpdate} className="form-section">
        <h3>Changer le mot de passe</h3>
        <input
          type="password"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          required
          placeholder="Mot de passe actuel"
        />
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          placeholder="Nouveau mot de passe"
        />
        <button type="submit">Mettre à jour le mot de passe</button>
        {passwordMsg && <p className="message">{passwordMsg}</p>}
      </form>
    </div>
  );
};

export default Parametre;
