import './css/App.css';
import './assets/setupAxios.js';
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
import { Materias } from './components/Dashboards/Admin/Materias.jsx';
import { Horarios } from './components/Dashboards/Admin/Horarios.jsx';
import { Boletines } from './components/Dashboards/Admin/Boletines.jsx';
import BoletinesSecundaria from './components/Dashboards/Admin/BoletinesSecundaria.jsx';
import CuentaAdmin from './components/Dashboards/Admin/Cuenta.jsx';

// imports for representante dashboard routes can be added here

import DashboardRepresentante from './components/Dashboards/Representante/DashboardRepresentante.jsx';
import { BoletinesRepresentante } from './components/Dashboards/Representante/BoletinesRepresentante.jsx';
import ResumenRepresentante from './components/Dashboards/Representante/ResumenRepresentante.jsx';
import CuentaRepresentante from './components/Dashboards/Representante/Cuenta.jsx';

// imports for estudiante routes can be added here

import { Estudiante } from './components/Dashboards/Estudiante/Estudiante.jsx';
import { BoletinesEstudiante } from './components/Dashboards/Estudiante/BoletinesEstudiante.jsx';
import CuentaEstudiante from './components/Dashboards/Estudiante/Cuenta.jsx';

// imports for profesor routes can be added here

import { Profesor } from './components/Dashboards/Profesor/Profesor.jsx';
import { BoletinesProfesor } from './components/Dashboards/Profesor/BoletinesProfesor.jsx';
import { ListaEstudiantesProfesor } from './components/Dashboards/Profesor/ListaEstudiantesProfesor.jsx';
// import { Asistencia } from './components/Dashboards/Profesor/Asistencia.jsx';
import { HorariosProfesor } from './components/Dashboards/Profesor/HorariosProfesor.jsx';
import { Calificaciones } from './components/Dashboards/Profesor/Calificaciones.jsx';
import CuentaProfesor from './components/Dashboards/Profesor/Cuenta.jsx';

// Calendario
import { Calendario } from './components/Dashboards/Calendario/Calendario.jsx';

// Private Guard
import { PrivateGuard } from './PrivateGuard.js';

// Not Found 404 PAGE

import NotFound from './components/NotFound.jsx';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route element={<PrivateGuard RouteRol="admin" />}>
                    <Route path="/admin" element={<Admin />}>
                        <Route index element={<Estadisticas />} />
                        <Route path="registro" element={<Registo />} />
                        {/* Lists routes can be added here*/}
                        <Route path="listaE" element={<ListaE />} />
                        <Route path="listaR" element={<ListaR />} />
                        <Route path="listaP" element={<ListaP />} />
                        {/*Grados routes can be added here*/}
                        <Route path="grados" element={<Grados />} />
                        {/*Materias routes can be added here*/}
                        <Route path="materias" element={<Materias />} />
                        {/*Horarios routes can be added here*/}
                        <Route path="horarios" element={<Horarios />} />
                        {/*Boletines routes can be added here*/}
                        <Route
                            path="boletines/primaria"
                            element={<Boletines />}
                        />
                        <Route
                            path="boletines/secundaria"
                            element={<BoletinesSecundaria />}
                        />
                        {/*Calendario routes can be added here*/}
                        <Route path="calendario" element={<Calendario />} />
                        {/*Cuenta routes can be added here*/}
                        <Route path="cuenta" element={<CuentaAdmin />} />
                    </Route>
                </Route>

                <Route element={<PrivateGuard RouteRol="representante" />}>
                    <Route
                        path="/representante"
                        element={<DashboardRepresentante />}
                    >
                        <Route index element={<ResumenRepresentante />} />
                        <Route
                            path="boletines"
                            element={<BoletinesRepresentante />}
                        />
                        <Route path="calendario" element={<Calendario />} />
                        <Route
                            path="cuenta"
                            element={<CuentaRepresentante />}
                        />
                    </Route>
                </Route>

                <Route element={<PrivateGuard RouteRol="estudiante" />}>
                    <Route path="/estudiante" element={<Estudiante />}>
                        <Route index element={<BoletinesEstudiante />} />
                        <Route
                            path="boletines"
                            element={<BoletinesEstudiante />}
                        />
                        <Route path="cuenta" element={<CuentaEstudiante />} />
                    </Route>
                </Route>

                <Route element={<PrivateGuard RouteRol="profesor" />}>
                    <Route path="/profesor" element={<Profesor />}>
                        <Route index element={<BoletinesProfesor />} />
                        <Route
                            path="listaE"
                            element={<ListaEstudiantesProfesor />}
                        />
                        <Route path="horarios" element={<HorariosProfesor />} />
                        <Route
                            path="calificaciones"
                            element={<Calificaciones />}
                        />
                        {/* <Route path="asistencia" element={<Asistencia />} /> */}
                        <Route
                            path="boletines"
                            element={<BoletinesProfesor />}
                        />
                        <Route path="calendario" element={<Calendario />} />
                        <Route path="cuenta" element={<CuentaProfesor />} />
                    </Route>
                </Route>

                <Route path="*" element={<NotFound />} replace />
            </Routes>
        </Router>
    );
}

export default App;
