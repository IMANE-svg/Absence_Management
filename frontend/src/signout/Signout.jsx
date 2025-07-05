import React from 'react'
import axios from 'axios'

const Signout = () => {
  const handleLogout = async () => {
    try {
      const refresh = localStorage.getItem('refresh_token')
      if (!refresh) {
        alert("Aucun token trouvé.")
        return
      }

      await axios.post('/api/logout/', { refresh })
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      alert("Déconnexion réussie")
      window.location.href = '/' 
    } catch (error) {
      console.error("Erreur lors de la déconnexion :", error)
      alert("Erreur lors de la déconnexion")
    }
  }

  return (
    <div>
      <h2>Déconnexion</h2>
      <button onClick={handleLogout}>Se déconnecter</button>
    </div>
  )
}

export default Signout
