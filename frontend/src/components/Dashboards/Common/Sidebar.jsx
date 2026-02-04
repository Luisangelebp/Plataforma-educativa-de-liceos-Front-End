import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import logo from '../../../logo.svg';
import '../css/ModernDashboard.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export function Sidebar({
    title,
    role,
    menuItems,
    user,
    onLogout,
    isSidebarOpen,
    toggleSidebar,
}) {
    const location = useLocation();
    const [openSubmenus, setOpenSubmenus] = useState({});
    const [isCollapsed, setIsCollapsed] = useState(true);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 1023);

    // Detectar cambios de tamaño de pantalla
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 1023);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // En móvil, siempre mostrar texto (no collapsed)
    const showText = isMobile || !isCollapsed;

    const toggleSubmenu = (label) => {
        if (isCollapsed) {
            setIsCollapsed(false);
            // Optional: Also open the submenu immediately
            setOpenSubmenus((prev) => ({
                ...prev,
                [label]: true,
            }));
            return;
        }
        setOpenSubmenus((prev) => ({
            ...prev,
            [label]: !prev[label],
        }));
    };

    const toggleCollapse = () => {
        setIsCollapsed(!isCollapsed);
    };

    const closeSidebar = () => {
        if (toggleSidebar) toggleSidebar(false);
        setIsCollapsed(true);
    };

    const getUserPhoto = () => {
        if (!user || !user.foto) return null;
        const fotoUrl = user.foto.startsWith('http')
            ? user.foto
            : `${API_URL}${user.foto}`;
        return fotoUrl;
    };

    const getUserName = () => {
        if (!user) return title || 'Usuario';
        return user.nombre
            ? `${user.nombre} ${user.apellido}`
            : `${user.nombres || ''} ${user.apellidos || ''}`.trim();
    };

    const renderMenuItem = (item, index) => {
        const isActive = location.pathname === item.path;
        const hasChildren = item.children && item.children.length > 0;
        const isSubmenuOpen = openSubmenus[item.label];
        const isChildActive =
            hasChildren &&
            item.children.some((child) => location.pathname === child.path);

        if (hasChildren) {
            return (
                <li key={index}>
                    <button
                        className={`nav-item ${isChildActive ? 'active-nav' : ''}`}
                        onClick={() => toggleSubmenu(item.label)}
                        title={!showText ? item.label : ''}
                    >
                        <span className="material-symbols-outlined">
                            {item.icon}
                        </span>
                        {showText && (
                            <span className="nav-text">{item.label}</span>
                        )}
                        {showText && (
                            <span
                                className={`material-symbols-outlined chevron ${isSubmenuOpen ? 'rotate' : ''}`}
                            >
                                chevron_right
                            </span>
                        )}
                    </button>
                    {showText && isSubmenuOpen && (
                        <ul className="submenu">
                            {item.children.map((child, childIndex) => (
                                <li key={childIndex}>
                                    <Link
                                        to={child.path}
                                        className={`nav-item sub-item ${location.pathname === child.path ? 'active-nav' : ''}`}
                                        onClick={closeSidebar}
                                    >
                                        <span className="nav-text">
                                            {child.label}
                                        </span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </li>
            );
        }

        return (
            <li key={index}>
                <Link
                    to={item.path}
                    className={`nav-item ${isActive ? 'active-nav' : ''}`}
                    title={!showText ? item.label : ''}
                    onClick={closeSidebar}
                >
                    <span className="material-symbols-outlined">
                        {item.icon}
                    </span>
                    {showText && <span className="nav-text">{item.label}</span>}
                </Link>
            </li>
        );
    };

    return (
        <>
            {/* Sidebar Overlay */}
            {isMobile
                ? isSidebarOpen && (
                      <div
                          className="sidebar-overlay"
                          onClick={() => {
                              toggleSidebar(false);
                          }}
                          style={{
                              backdropFilter: 'blur(3px)',
                              backgroundColor: 'rgba(15, 23, 42, 0.19)',
                          }}
                      ></div>
                  )
                : !isCollapsed && (
                      <div
                          className="sidebar-overlay"
                          onClick={() => {
                              toggleCollapse(false);
                          }}
                          style={{
                              backdropFilter: 'blur(3px)',
                              backgroundColor: 'rgba(15, 23, 42, 0.19)',
                          }}
                      ></div>
                  )}

            {/* Sidebar */}
            <aside
                className={`sidebar ${isSidebarOpen ? 'open' : ''} ${isCollapsed ? 'collapsed' : ''}`}
            >
                {/* Header */}
                <div className="sidebar-header">
                    <div className="brand">
                        <div className="brand-icon">
                            <img
                                src="/logo.svg"
                                alt="CENIT Logo"
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'contain',
                                }}
                            />
                        </div>
                        {showText && <h1 className="brand-name">CENIT</h1>}
                    </div>

                    <div className="header-buttons mobile-only">
                        <button
                            className="close-sidebar-btn"
                            onClick={closeSidebar}
                            title="Cerrar"
                        >
                            <span className="material-symbols-outlined">
                                close
                            </span>
                        </button>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="sidebar-nav">
                    <ul className="nav-list">
                        {menuItems.map((item, index) =>
                            renderMenuItem(item, index),
                        )}
                    </ul>
                </nav>

                {/* User Profile */}
                <div className="sidebar-footer">
                    <Link
                        to={`/${role.toLowerCase()}/cuenta`}
                        className="user-profile"
                        onClick={closeSidebar}
                    >
                        <div className="user-avatar">
                            {getUserPhoto() ? (
                                <img src={getUserPhoto()} alt="Profile" />
                            ) : (
                                <span className="material-symbols-outlined">
                                    person
                                </span>
                            )}
                        </div>
                        {showText && (
                            <div className="user-info">
                                <p className="user-name">{getUserName()}</p>
                                <p className="user-role">{title}</p>
                            </div>
                        )}
                    </Link>

                    <button className="logout-btn" onClick={onLogout}>
                        <span className="material-symbols-outlined">
                            logout
                        </span>
                        {showText && <span>Cerrar Sesión</span>}
                    </button>
                </div>
            </aside>

            {/* Desktop Collapse Button - Moved outside for floating effect */}
            <button
                className={`collapse-btn desktop-only ${isCollapsed ? 'collapsed' : ''}`}
                onClick={toggleCollapse}
            >
                <span className="material-symbols-outlined">
                    {isCollapsed ? 'chevron_right' : 'chevron_left'}
                </span>
            </button>

            {/* Float Toggle Button */}
            <button
                className="mobile-menu-btn mobile-only"
                onClick={() => toggleSidebar(true)}
            >
                <span className="material-symbols-outlined">menu</span>
            </button>
        </>
    );
}
