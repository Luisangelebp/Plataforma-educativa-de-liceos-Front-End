import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../Common/DashboardLayout';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const DashboardRepresentante = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [user, setUser] = useState({});

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
        sessionStorage.setItem('fromLogout', 'true');
        navigate('/');
    };

    const menuItems = [
        { label: 'Inicio', path: '/representante', icon: 'home' },
        { label: 'Boletines Emitidos', path: '/representante/boletines', icon: 'description' },
    ];

    return (
        <DashboardLayout
            role="representante"
            user={user}
            menuItems={menuItems}
            onLogout={handleLogout}
        >
            <Outlet />
        </DashboardLayout>
    );
};

export default DashboardRepresentante;
