import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const DashboardRepresentante = () => {
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
        if (!user) return 'R';
        const nombre = user.nombre || user.nombres || '';
        const apellido = user.apellido || user.apellidos || '';
        // Mostrar foto si existe, si no mostrar iniciales
        if (user.foto) {
            const fotoUrl = user.foto.startsWith('http') 
                ? user.foto 
                : `${API_URL}${user.foto}`;
            return <img src={fotoUrl} alt="" />;
        }
        return (nombre.charAt(0) + apellido.charAt(0)).toUpperCase() || 'R';
    };

    const getUserName = () => {
        if (!user) return 'Representante';
        return user.nombre || user.nombres || 'Representante';
    };

    return (
        <div className="dashboard">
            {/* Sidebar */}
            <div className="sidebar">
                <div className="sidebar-header">
                    <Link
                        to="/representante/cuenta"
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
                                <p>Representante</p>
                            </div>
                        </div>
                    </Link>
                </div>

                <nav className="nav-menu">
                    <div className="nav-item">
                        <Link
                            to="/representante"
                            className={`nav-link ${
                                location.pathname === '/representante'
                                    ? 'active'
                                    : ''
                            }`}
                        >
                            <i className="fas fa-home"></i>
                            <span className="nav-text">Inicio</span>
                        </Link>
                    </div>
                    <div className="nav-item">
                        <Link
                            to="/representante/boletines"
                            className={`nav-link ${
                                location.pathname === '/representante/boletines'
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
};

export default DashboardRepresentante;
