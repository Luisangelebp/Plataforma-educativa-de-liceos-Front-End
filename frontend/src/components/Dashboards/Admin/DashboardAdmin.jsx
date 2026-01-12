import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export function Admin() {
    const location = useLocation();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [boletinesExpanded, setBoletinesExpanded] = useState(false);

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

        // Expandir boletines si estamos en una ruta de boletines
        if (location.pathname.startsWith('/admin/boletines')) {
            setBoletinesExpanded(true);
        }

        return () => {
            window.removeEventListener('userUpdated', handleUserUpdate);
        };
    }, [location.pathname]);

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
        if (!user) return 'A';
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
        if (!user) return 'Administrador';
        return user.nombre || user.nombres || 'Administrador';
    };

    return (
        <div className="dashboard">
            {/* Sidebar */}
            <div className="sidebar">
                <div className="sidebar-header">
                    <Link
                        to="/admin/cuenta"
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
                                <p>Admin</p>
                            </div>
                        </div>
                    </Link>
                </div>

                <nav className="nav-menu">
                    <div className="nav-item">
                        <Link
                            to="/admin"
                            className={`nav-link ${
                                location.pathname === '/admin' ? 'active' : ''
                            }`}
                        >
                            <i className="fas fa-home"></i>
                            <span className="nav-text">Inicio</span>
                        </Link>
                    </div>
                    <div className="nav-item">
                        <Link
                            to="/admin/registro"
                            className={`nav-link ${
                                location.pathname === '/admin/registro'
                                    ? 'active'
                                    : ''
                            }`}
                        >
                            <i className="fas fa-user-plus"></i>
                            <span className="nav-text">
                                Crear nuevo usuario
                            </span>
                        </Link>
                    </div>
                    <div className="nav-item">
                        <Link
                            to="/admin/listaE"
                            className={`nav-link ${
                                location.pathname === '/admin/listaE'
                                    ? 'active'
                                    : ''
                            }`}
                        >
                            <i className="fas fa-users"></i>
                            <span className="nav-text">Estudiantes</span>
                        </Link>
                    </div>
                    <div className="nav-item">
                        <Link
                            to="/admin/listaP"
                            className={`nav-link ${
                                location.pathname === '/admin/listaP'
                                    ? 'active'
                                    : ''
                            }`}
                        >
                            <i className="fas fa-chalkboard-teacher"></i>
                            <span className="nav-text">Profesores</span>
                        </Link>
                    </div>
                    <div className="nav-item">
                        <Link
                            to="/admin/listaR"
                            className={`nav-link ${
                                location.pathname === '/admin/listaR'
                                    ? 'active'
                                    : ''
                            }`}
                        >
                            <i className="fas fa-user-friends"></i>
                            <span className="nav-text">Representantes</span>
                        </Link>
                    </div>
                    <div className="nav-item">
                        <Link
                            to="/admin/grados"
                            className={`nav-link ${
                                location.pathname === '/admin/grados'
                                    ? 'active'
                                    : ''
                            }`}
                        >
                            <i className="fas fa-layer-group"></i>
                            <span className="nav-text">
                                Grados / Años y secciones
                            </span>
                        </Link>
                    </div>
                    <div className="nav-item">
                        <Link
                            to="/admin/materias"
                            className={`nav-link ${
                                location.pathname === '/admin/materias'
                                    ? 'active'
                                    : ''
                            }`}
                        >
                            <i className="fas fa-book"></i>
                            <span className="nav-text">Materias</span>
                        </Link>
                    </div>
                    <div className="nav-item">
                        <Link
                            to="/admin/horarios"
                            className={`nav-link ${
                                location.pathname === '/admin/horarios'
                                    ? 'active'
                                    : ''
                            }`}
                        >
                            <i className="fas fa-clock"></i>
                            <span className="nav-text">Horarios</span>
                        </Link>
                    </div>
                    <div className="nav-item">
                        <div
                            className={`nav-link ${
                                location.pathname.startsWith('/admin/boletines')
                                    ? 'active'
                                    : ''
                            }`}
                            onClick={() =>
                                setBoletinesExpanded(!boletinesExpanded)
                            }
                            style={{ cursor: 'pointer' }}
                        >
                            <i
                                className={`fas fa-chevron-${
                                    boletinesExpanded ? 'down' : 'right'
                                }`}
                                style={{
                                    fontSize: '0.7rem',
                                    width: '16px',
                                    textAlign: 'center',
                                }}
                            ></i>
                            <i className="fas fa-file-pdf"></i>
                            <span className="nav-text">Boletines</span>
                        </div>
                        {boletinesExpanded && (
                            <div className="nav-sublist">
                                <Link
                                    to="/admin/boletines/primaria"
                                    className={`nav-sublink ${
                                        location.pathname ===
                                        '/admin/boletines/primaria'
                                            ? 'active'
                                            : ''
                                    }`}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <span className="nav-text">Primaria</span>
                                </Link>
                                <Link
                                    to="/admin/boletines/secundaria"
                                    className={`nav-sublink ${
                                        location.pathname ===
                                        '/admin/boletines/secundaria'
                                            ? 'active'
                                            : ''
                                    }`}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <span className="nav-text">Secundaria</span>
                                </Link>
                            </div>
                        )}
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
