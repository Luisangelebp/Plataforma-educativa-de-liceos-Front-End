import './css/App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './assets/LandingPage/LandingPage.jsx';

// Imports for admin dashboard routes can be added here

import { Admin } from './components/Dashboards/Admin/DashboardAdmin.jsx';
import Estadisticas from './components/Dashboards/Admin/Estadisticas.jsx';
import Registo from './components/Dashboards/Admin/Registro.jsx';
import {
    ListaE,
    ListaP,
    ListaR,
} from './components/Dashboards/Admin/Listas.jsx';
import { Grados } from './components/Dashboards/Admin/Grados.jsx';
import { Horarios } from './components/Dashboards/Admin/Horarios.jsx';
import { Boletines } from './components/Dashboards/Admin/Boletines.jsx';

// imports for representante dashboard routes can be added here

import DashboardRepresentante from './components/Dashboards/Representante/DashboardRepresentante.jsx';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/admin" element={<Admin />}>
                    <Route index element={<Estadisticas />} />
                    <Route path="registro" element={<Registo />} />
                    {/* Lists routes can be added here*/}
                    <Route path="listaE" element={<ListaE />} />
                    <Route path="listaR" element={<ListaR />} />
                    <Route path="listaP" element={<ListaP />} />
                    {/*Grados routes can be added here*/}
                    <Route path="grados" element={<Grados />} />
                    {/*Horarios routes can be added here*/}
                    <Route path="horarios" element={<Horarios />} />
                    {/*Boletines routes can be added here*/}
                    <Route path="boletines" element={<Boletines />} />
                </Route>
                <Route
                    path="/representante"
                    element={<DashboardRepresentante />}
                />
            </Routes>
        </Router>
    );
}

export default App;
