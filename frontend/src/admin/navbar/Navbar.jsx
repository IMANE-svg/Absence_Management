import React from 'react';
import { IonIcon } from '@ionic/react';
import { home, people, book, settings, logOut , helpCircleOutline} from 'ionicons/icons';
import './Navbar.css';
import { Link , useNavigate} from 'react-router-dom';
import axios from 'axios';

const Navbar = () => {
    const navigate = useNavigate();

    const handleLogout = async () => {
  const refresh = localStorage.getItem('refresh_token');

  try {
    if (refresh) {
      await axios.post('/api/logout/', { refresh });
    }
  } catch (error) {
    console.error("Erreur lors de la déconnexion :", error);
  } finally {
    // Supprimer les tokens et rediriger dans tous les cas
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    navigate('/'); // Redirection vers la page d'accueil ou de login
  }
};
    return (
        
            <div className="navigation">
                <div className="logo-container">
                    <Link to="/">
                        <span className="icon">
                            <img src="/nv-removebg-preview.png" alt="Logo" />
                        </span>
                    </Link>
                </div>

                <ul>
                    <li>
                        <Link to="/admin/dashboard">
                            <span className="icon">
                                <IonIcon icon={home} />
                            </span>
                            <span className="title">Dashboard</span>
                        </Link>
                    </li>

                    <li>
                        <Link to="/admin/Enseignant">
                            <span className="icon">
                                <IonIcon icon={people} />
                            </span>
                            <span className="title">Enseignants</span>
                        </Link>
                    </li>

                    <li>
                        <Link to="/admin/etudiants">
                            <span className="icon">
                                <IonIcon icon={people} />
                            </span>
                            <span className="title">Etudiants</span>
                        </Link>
                    </li>

                    <li>
                        <Link to="/admin/Matiere">
                            <span className="icon">
                                <IonIcon icon={book} />
                            </span>
                            <span className="title">Matière</span>
                        </Link>
                    </li>
                    <li>
                        <Link to="/enseignant/parametres">
                             <span className="icon">
                                 <IonIcon icon={settings} />
                             </span>
                            <span className="title">Parametres</span>
                        </Link>
                    </li>

                    <li>
                        <Link to="/admin/Help">
                            <span className="icon">
                                <IonIcon icon={helpCircleOutline} />
                            </span>
                            <span className="title">Help Center</span>
                        </Link>
                    </li>

                    <li onClick={handleLogout} style={{ cursor: 'pointer' }}>
                    <Link>
                        
                            <span className="icon"><IonIcon icon={logOut} /></span>
                            <span className="title">Sign Out</span>
                        
                    </Link>
                </li>
                </ul>
            </div>
       
    );
};

export default Navbar;