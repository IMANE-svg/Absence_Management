import React from 'react';
import { IonIcon } from '@ionic/react';
import { home, people, book, settings, logOut } from 'ionicons/icons';
import './Navbar.css';
import { Link } from 'react-router-dom';

const Navbar = () => {
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
                        <Link to="/">
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
                        <Link to="/admin/Help">
                            <span className="icon">
                                <IonIcon icon={settings} />
                            </span>
                            <span className="title">Help Center</span>
                        </Link>
                    </li>

                    <li>
                        <Link to="/admin/Signout">
                            <span className="icon">
                                <IonIcon icon={logOut} />
                            </span>
                            <span className="title">Sign Out</span>
                        </Link>
                    </li>
                </ul>
            </div>
       
    );
};

export default Navbar;