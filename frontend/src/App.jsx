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
import { BoletinesRepresentante } from './components/Dashboards/Representante/BoletinesRepresentante.jsx';
import ResumenRepresentante from './components/Dashboards/Representante/ResumenRepresentante.jsx';

// imports for estudiante routes can be added here

import { Estudiante } from './components/Dashboards/Estudiante/Estudiante.jsx';
import { BoletinesEstudiante } from './components/Dashboards/Estudiante/BoletinesEstudiante.jsx';

// imports for profesor routes can be added here

import { Profesor } from './components/Dashboards/Profesor/Profesor.jsx';
import { BoletinesProfesor } from './components/Dashboards/Profesor/BoletinesProfesor.jsx';
import { ListaEstudiantesProfesor } from './components/Dashboards/Profesor/ListaEstudiantesProfesor.jsx';

// Calendario
import { Calendario } from './components/Dashboards/Calendario/Calendario.jsx';

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
                    {/*Calendario routes can be added here*/}
                    <Route path="calendario" element={<Calendario />} />
                </Route>
                <Route
                    path="/representante"
                    element={<DashboardRepresentante />}
                >
                    <Route index element={<ResumenRepresentante />} />
                    <Route path="boletines" element={<BoletinesRepresentante />} />
                    <Route path="calendario" element={<Calendario />} />
                </Route>
                <Route path="/estudiante" element={<Estudiante />}>
                    <Route index element={<BoletinesEstudiante />} />
                    <Route path="boletines" element={<BoletinesEstudiante />} />
                </Route>
                <Route path="/profesor" element={<Profesor />}>
                    <Route index element={<BoletinesProfesor />} />
                    <Route path="listaE" element={<ListaEstudiantesProfesor />} />
                    <Route path="boletines" element={<BoletinesProfesor />} />
                    <Route path="calendario" element={<Calendario />} />
                </Route>
            </Routes>
        </Router>
    );
}

export default App;
