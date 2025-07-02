import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import logo from "../../assets/logo.png"
import api from "../../axiosConfig";

const Login = () => {

    const [isSignUpActive, setIsSignUpActive] = useState(false);
    const [formData, setFormData] = useState({
        prenom: '',
        nom: '',
        email: '',
        password: '',
        confirm_password: '',
        statut: ''
    });
    const [loginData, setLoginData] = useState({
        email: '',
        password: ''
    });

    const handleToggle = () => {
        setIsSignUpActive(prev => !prev);
    };

    const handleSignUp = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirm_password) {
        toast.error("Les mots de passe ne correspondent pas");
        return;
    }

    try {
    const response = await axios.post(
      'http://localhost:8000/api/signup/enseignant/',
      {
        prenom: formData.prenom,
        nom: formData.nom,
        email: formData.email,
        password: formData.password,
        confirm_password:formData.confirm_password,
        statut: formData.statut
      },
      {
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );

    if (response.status === 201) {
      alert("Votre demande a été envoyée à l'administration.");
    }
  } catch (error) {
    console.error("Erreur d'inscription :", error.response?.data || error.message);
    alert("Erreur lors de l'inscription.");
  }
};


       

  
  const navigate = useNavigate();

const handleLogin = async (e) => {
    e.preventDefault();
   try {
    const response = await api.post('token/', {
      email: loginData.email,
      password: loginData.password
    });

        localStorage.setItem('token', response.data.access);
        localStorage.setItem('refreshToken', response.data.refresh);
        navigate(response.data.redirect_to);

        console.log("Login response:", response.data);

    } catch (err) {
        toast.error(err.response?.data?.detail || "Email ou mot de passe incorrect");
    }
};



const handleInputChange = (e) => {
        setFormData({...formData, [e.target.name]: e.target.value});
    };

    const handleLoginInputChange = (e) => {
        setLoginData({...loginData, [e.target.name]: e.target.value});
    };

  return (
    <div className="login-wrapper">
        <div className={`container ${isSignUpActive ? 'active' : ''}`} id="container">
                {/* Sign Up */}
                <div className="form-container sign-up">
                    <form onSubmit={handleSignUp}>
                        <h1>Créer un Compte</h1>
                        
                        <input 
                            type="text" 
                            name="prenom" 
                            placeholder="Prénom" 
                            onChange={handleInputChange}
                            required 
                        /> 
                        <input 
                            type="text" 
                            name="nom" 
                            placeholder="Nom" 
                            onChange={handleInputChange}
                            required 
                        />
                        <input 
                            type="email" 
                            name="email" 
                            placeholder="Email" 
                            onChange={handleInputChange}
                            required 
                        />
                        <input 
                            type="password" 
                            name="password" 
                            placeholder="Mot de passe" 
                            onChange={handleInputChange}
                            required 
                        />
                        <input 
                            type="password" 
                            name="confirm_password" 
                            placeholder="Confirmer mot de passe" 
                            onChange={handleInputChange}
                            required 
                        />
                        <select 
                            name="statut" 
                            onChange={handleInputChange} 
                            required
                        >
                            
                            <option value="Professeur">Professeur</option>
                            <option value="Vacataire">Vacataire</option>
                        </select>
                        <button type="submit">S'inscrire</button>
                    </form>
                </div>
      {/* Sign In */}
      <div className="form-container sign-in">
        
        <form onSubmit={handleLogin}>
            <h1>Se Connecter</h1>
            
            <input
              type="email"
              required
              value={loginData.email}
              onChange={(e) =>
                setLoginData({ ...loginData, email: e.target.value })
              }
            />
          

          
            <input
              type="password"
              required
              value={loginData.password}
              onChange={(e) =>
                setLoginData({ ...loginData, password: e.target.value })
              }
            />
          

          <button type="submit"> Se connecter</button>
        </form>
      </div>
       {/* Toggle Panel */}
                <div className="toggle-container">
                    <div className="toggle">
                        <div className="toggle-panel toggle-left">
                            <img src={logo} alt="Logo" />
                            <p>Saisissez vos informations personnelles pour utiliser toutes les fonctionnalités du site</p>
                            <button className="hidden" onClick={handleToggle}>Se connecter</button>
                        </div>
                        <div className="toggle-panel toggle-right">
                            <img src={logo} alt="Logo" />
                            <p>Enregistrez vos informations personnelles pour accéder à toutes les fonctionnalités du site</p>
                            <button className="hidden" onClick={handleToggle}>S'inscrire</button>
                        </div>
                    </div>
                </div>

      </div>
    </div>
  );
};

export default Login;
