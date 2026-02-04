import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { DashboardLayout } from '../Common/DashboardLayout';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export function Admin() {
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

    // Menu Configuration for Admin
    const menuItems = [
        { label: 'Inicio', path: '/admin', icon: 'home' },
        { label: 'Crear usuario', path: '/admin/registro', icon: 'person_add' },
        { label: 'Estudiantes', path: '/admin/listaE', icon: 'school' },
        { label: 'Profesores', path: '/admin/listaP', icon: 'assignment_ind' },
        { label: 'Directivos', path: '/admin/listaA', icon: 'admin_panel_settings' },
        { label: 'Representantes', path: '/admin/listaR', icon: 'group' },
        { label: 'Grados y Secciones', path: '/admin/grados', icon: 'class' },
        { label: 'Materias', path: '/admin/materias', icon: 'menu_book' },
        { label: 'Horarios', path: '/admin/horarios', icon: 'schedule' },
        {
            label: 'Boletines',
            icon: 'description',
            children: [
                { label: 'Primaria', path: '/admin/boletines/primaria' },
                { label: 'Secundaria', path: '/admin/boletines/secundaria' }
            ]
        },
    ];

    return (
        <DashboardLayout
            role="admin"
            user={user}
            menuItems={menuItems}
            onLogout={handleLogout}
        >
            <Outlet />
        </DashboardLayout>
    );
}
