
import Navbar from "./admin/navbar/Navbar";
import { BrowserRouter as Router,Routes,Route } from "react-router-dom";
import Dashboard from "./admin/dashboard/Dashboard";

import Matiere from "./admin/gestion-matiere/Matiere";
import './styles/globals.css';
import './styles/variables.css';
import Enseignant from "./admin/gestion-ensignants/Enseignant";
import Etudiant from "./admin/gestion-etudiant/Etudiant";
import Help from "./admin/centre-help/Help";
import Login from "./auth/Login/Login";
import Dashboard_Ens from "./enseignant/dashboard/Dashboard_Ens";
import CodeQr from "./enseignant/Code/CodeQr";
import Aide from "./enseignant/Help/Aide";
import Liste from "./enseignant/Liste/Liste";
import Parametre from "./enseignant/Parametres/Parametre";
import MesSeances from "./enseignant/Seance/MesSeances";
import Signout from "./signout/Signout";
import EditEtudiant from "./admin/gestion-etudiant/EditEtudiant";

function App() {
  return (
    <Router>
      <div className="app-container">
        
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Login/>} ></Route>
            <Route path="/admin/dashboard" element={<Dashboard/>}></Route>
            <Route path="/admin/enseignant" element = {<Enseignant/>}></Route>
            <Route path = "/admin/etudiants" element = {<Etudiant/>}></Route>
            <Route path="/admin/etudiants/edit/:id" element={<EditEtudiant />} />
            <Route path="/admin/matiere" element={<Matiere/>}/>
            <Route path="/admin/help" element={<Help/>}></Route>
            <Route path="/signout" element={<Signout/>}></Route>
           

            <Route path="/enseignant/dashboard" element={<Dashboard_Ens/>}></Route>
            <Route path="/enseignant/code" element={<CodeQr/>}></Route>
            <Route path="/enseignant/help" element={<Aide/>}></Route>
            <Route path="/enseignant/liste" element={<Liste/>}></Route>
            <Route path="/enseignant/parametres" element={<Parametre/>}></Route>
            <Route path="/ajouter-seances" element={<MesSeances/>}></Route>
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;