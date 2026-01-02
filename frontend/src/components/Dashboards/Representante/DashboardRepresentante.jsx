import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';

const DashboardRepresentante = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                setUser(JSON.parse(userStr));
            } catch (e) {
                console.error('Error parsing user data:', e);
            }
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        navigate('/');
    };

    const getUserInitials = () => {
        if (!user) return 'R';
        const nombre = user.nombre || user.nombres || '';
        const apellido = user.apellido || user.apellidos || '';
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
                    <div className="user-profile">
                        <div className="user-avatar">
                            {getUserInitials()}
                        </div>
                        <div className="user-info">
                            <h4>{getUserName()}</h4>
                            <p>Representante</p>
                        </div>
                    </div>
                </div>
                
                <nav className="nav-menu">
                    <div className="nav-item">
                        <Link
                            to="/representante"
                            className={`nav-link ${location.pathname === '/representante' ? 'active' : ''}`}
                        >
                            <i className="fas fa-home"></i>
                            <span className="nav-text">Inicio</span>
                        </Link>
                    </div>
                    <div className="nav-item">
                        <Link
                            to="/representante/boletines"
                            className={`nav-link ${location.pathname === '/representante/boletines' ? 'active' : ''}`}
                        >
                            <i className="fas fa-file-pdf"></i>
                            <span className="nav-text">Boletines</span>
                        </Link>
                    </div>
                    <div className="nav-item">
                        <Link
                            to="/representante/calendario"
                            className={`nav-link ${location.pathname === '/representante/calendario' ? 'active' : ''}`}
                        >
                            <i className="fas fa-calendar-alt"></i>
                            <span className="nav-text">Calendario</span>
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
