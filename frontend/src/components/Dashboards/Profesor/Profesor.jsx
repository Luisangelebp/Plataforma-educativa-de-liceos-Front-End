import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'https://liceo-publico.onrender.com';

export function Profesor() {
    const location = useLocation();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    useEffect(() => {
        const loadUser = () => {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                try {
                    setUser(JSON.parse(userStr));
                } catch (e) {
                    console.error('Error parsing user data:', e);
                }
            }
        };

        loadUser();

        // Escuchar cambios en el usuario (ej: cuando se actualiza la foto)
        const handleUserUpdate = (event) => {
            if (event.detail) {
                setUser(event.detail);
            } else {
                loadUser();
            }
        };

        window.addEventListener('userUpdated', handleUserUpdate);

        return () => {
            window.removeEventListener('userUpdated', handleUserUpdate);
        };
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        localStorage.removeItem('rol');
        // Marcar que viene de logout para mostrar directamente el login
        sessionStorage.setItem('fromLogout', 'true');
        navigate('/');
    };

    const getUserInitials = () => {
        if (!user) return 'P';
        const nombre = user.nombre || user.nombres || '';
        const apellido = user.apellido || user.apellidos || '';
        if (user.foto) {
            const fotoUrl = user.foto.startsWith('http')
                ? user.foto
                : `${API_URL}${user.foto}`;
            return <img src={fotoUrl} alt="" />;
        }
        return (nombre.charAt(0) + apellido.charAt(0)).toUpperCase() || 'A';
    };

    const getUserName = () => {
        if (!user) return 'Profesor';
        return (
            user.nombre + ' ' + user.apellido ||
            user.nombres + ' ' + user.apellido ||
            'Profesor'
        );
    };

    return (
        <div className="dashboard">
            {/* Sidebar */}
            <div className="sidebar">
                <div className="sidebar-header">
                    <Link
                        to="/profesor/cuenta"
                        style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                        <div
                            className="user-profile"
                            style={{ cursor: 'pointer' }}
                        >
                            <div className="user-avatar">
                                {getUserInitials()}
                            </div>
                            <div className="user-info">
                                <h4>{getUserName()}</h4>
                                <p>{user ? user.cedula : 'V000000000'}</p>
                                <p style={{ marginLeft: '5px' }}>Profesor</p>
                            </div>
                        </div>
                    </Link>
                </div>

                <nav className="nav-menu">
                    <div className="nav-item">
                        <Link
                            to="/profesor"
                            className={`nav-link ${
                                location.pathname === '/profesor'
                                    ? 'active'
                                    : ''
                            }`}
                        >
                            <i className="fas fa-users"></i>
                            <span className="nav-text">
                                Lista de Estudiantes
                            </span>
                        </Link>
                    </div>
                    <div className="nav-item">
                        <Link
                            to="/profesor/horarios"
                            className={`nav-link ${
                                location.pathname === '/profesor/horarios'
                                    ? 'active'
                                    : ''
                            }`}
                        >
                            <i className="fas fa-clock"></i>
                            <span className="nav-text">Horarios</span>
                        </Link>
                    </div>
                    <div className="nav-item">
                        <Link
                            to="/profesor/calificaciones"
                            className={`nav-link ${
                                location.pathname === '/profesor/calificaciones'
                                    ? 'active'
                                    : ''
                            }`}
                        >
                            <i className="fas fa-graduation-cap"></i>
                            <span className="nav-text">Calificaciones</span>
                        </Link>
                    </div>
                    {/* <div className="nav-item">
                        <Link
                            to="/profesor/asistencia"
                            className={`nav-link ${
                                location.pathname === '/profesor/asistencia'
                                    ? 'active'
                                    : ''
                            }`}
                        >
                            <i className="fas fa-clipboard-check"></i>
                            <span className="nav-text">Control Asistencia</span>
                        </Link>
                    </div> */}
                    <div className="nav-item">
                        <Link
                            to="/profesor/boletines"
                            className={`nav-link ${
                                location.pathname === '/profesor/boletines'
                                    ? 'active'
                                    : ''
                            }`}
                        >
                            <i className="fas fa-file-pdf"></i>
                            <span className="nav-text">Boletines</span>
                        </Link>
                    </div>
                </nav>

                <div className="sidebar-footer">
                    <button className="logout-btn" onClick={handleLogout}>
                        <i className="fas fa-sign-out-alt"></i>
                        <span className="nav-text">Cerrar Sesión</span>
                    </button>
                </div>
            </div>

            {/* Contenido Principal */}
            <div className="main-content">
                <Outlet />
            </div>
        </div>
    );
}
