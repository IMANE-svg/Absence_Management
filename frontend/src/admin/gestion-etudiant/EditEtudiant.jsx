import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { IonIcon } from '@ionic/react';
import { arrowBack } from 'ionicons/icons';
import api from '../../axiosConfig';
import './Etudiant.css'; // On réutilise le même CSS

const EditEtudiant = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [filieres, setFilieres] = useState([]);
  const [niveaux, setNiveaux] = useState([]);
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    filiere: '',
    niveau: '',
    photo: null,
    password: '',
    confirm_password: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Charger les filières et niveaux
        const [filieresRes, niveauxRes, etudiantRes] = await Promise.all([
          api.get('filieres/'),
          api.get('niveaux/'),
          api.get(`admin/etudiants/${id}/`)
        ]);

        setFilieres(filieresRes.data);
        setNiveaux(niveauxRes.data);
        setFormData({
          nom: etudiantRes.data.nom,
          prenom: etudiantRes.data.prenom,
          email: etudiantRes.data.email,
          filiere: etudiantRes.data.filiere,
          niveau: etudiantRes.data.niveau,
          photo: etudiantRes.data.photo,
          password: '',
          confirm_password: ''
        });
      } catch (err) {
        console.error('Erreur de chargement :', err.response?.data || err.message);
        alert('Erreur lors du chargement des données.');
      }
    };
    fetchData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, photo: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    // Vérifier la correspondance des mots de passe si modifiés
    if (formData.password && formData.password !== formData.confirm_password) {
      alert("Les mots de passe ne correspondent pas");
      return;
    }

    const formDataToSend = new FormData();
    
    // Ajouter les champs texte
    formDataToSend.append('nom', formData.nom);
    formDataToSend.append('prenom', formData.prenom);
    formDataToSend.append('email', formData.email);
    formDataToSend.append('filiere', formData.filiere);
    formDataToSend.append('niveau', formData.niveau);
    
    // Ajouter le mot de passe seulement s'il est modifié
    if (formData.password) {
      formDataToSend.append('password', formData.password);
    }
    
    // Ajouter la photo seulement si elle est modifiée
    if (formData.photo instanceof File) {
      formDataToSend.append('photo', formData.photo);
    } else if (typeof formData.photo === 'string') {
      // Si c'est une chaîne (URL existante), ne rien faire ou gérer selon votre besoin
    }

    const response = await api.put(`admin/etudiants/${id}/`, formDataToSend, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    
    alert('Étudiant modifié avec succès !');
    navigate('/admin/etudiants');
  } catch (error) {
    console.error('Erreur lors de la soumission :', error.response?.data || error.message);
    const errorMessage = error.response?.data 
      ? JSON.stringify(error.response.data) 
      : 'Erreur lors de la soumission du formulaire';
    alert(`Erreur: ${errorMessage}`);
  }
};

  return (
    <div className="app-container">
      <div className="main-content">
        <div className="etudiant-container">
          <button 
  className="back-button"
  onClick={() => navigate('/admin/etudiants')}  // Correction ici
  style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '5px' }}
>
  <IonIcon icon={arrowBack} />
  Retour à la liste
</button>

          <form className="etudiant-form" onSubmit={handleSubmit} encType="multipart/form-data">
            <h2>Modifier l'étudiant</h2>
            <div className="form-group">
              <label>Nom</label>
              <input
                type="text"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Prénom</label>
              <input
                type="text"
                name="prenom"
                value={formData.prenom}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Filière</label>
              <select
                name="filiere"
                value={formData.filiere}
                onChange={handleChange}
                required
              >
                <option value="">Sélectionner une filière</option>
                {filieres.map(filiere => (
                  <option key={filiere.id} value={filiere.nom}>
                    {filiere.nom}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Niveau</label>
              <select
                name="niveau"
                value={formData.niveau}
                onChange={handleChange}
                required
              >
                <option value="">Sélectionner un niveau</option>
                {niveaux.map(niveau => (
                  <option key={niveau.id} value={niveau.nom}>
                    {niveau.nom}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Photo</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
              />
              {formData.photo && typeof formData.photo === 'string' && (
                <img 
                  src={formData.photo} 
                  alt="Photo actuelle" 
                  className="current-photo"
                  style={{ maxWidth: '100px', marginTop: '10px' }}
                />
              )}
            </div>
            <div className="form-group">
              <label>Mot de passe</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Laisser vide pour ne pas modifier"
              />
            </div>
            <div className="form-group">
              <label>Confirmer mot de passe</label>
              <input
                type="password"
                name="confirm_password"
                value={formData.confirm_password}
                onChange={handleChange}
              />
            </div>
            <div className="form-actions">
              <button type="submit">
                Enregistrer les modifications
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditEtudiant;