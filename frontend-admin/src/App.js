
import Navbar from "./composants/navbar/Navbar";
import { BrowserRouter as Router,Routes,Route } from "react-router-dom";
import Dashboard from "./composants/dashboard/Dashboard";

import Matiere from "./composants/gestion-matiere/Matiere";
import './styles/globals.css';
import './styles/variables.css';
import Enseignant from "./composants/gestion-ensignants/Enseignant";
import Etudiant from "./composants/gestion-etudiant/Etudiant";
import Help from "./composants/centre-help/Help";
import Signout from "./composants/signout/Signout";
import PendingEnseignant from "./composants/pending/PendingEnseignant";

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar/>
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard/>} ></Route>
            <Route path="/enseignant" element = {<Enseignant/>}></Route>
            <Route path = "/etudiant" element = {<Etudiant/>}></Route>
            <Route path="/matiere" element={<Matiere/>}/>
            <Route path="/help" element={<Help/>}></Route>
            <Route path="/signout" element={<Signout/>}></Route>
            <Route path="/admin/pending-enseignants" element={<PendingEnseignant />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;