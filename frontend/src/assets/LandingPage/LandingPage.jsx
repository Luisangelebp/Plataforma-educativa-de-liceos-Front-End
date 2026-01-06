import '../../css/App.css';
import Header from './Header';
import Main from './Main';
import Footer from './Footer';
import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import LoginSession from './StartSession/LoginSession';

export default function LandingPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const landingRef = useRef(null);
    const isTransitioningRef = useRef(false);

    // Calcular estados iniciales de forma síncrona para evitar parpadeo
    const urlShowLogin = searchParams.get('showLogin');
    const fromLogout = sessionStorage.getItem('fromLogout') === 'true';
    const hasToken = localStorage.getItem('accessToken');

    const [showLogin, setShowLogin] = useState(() => {
        // Si viene de logout o tiene parámetro, mostrar login directamente
        return urlShowLogin === 'true' || fromLogout;
    });
    const [isAuthenticated, setIsAuthenticated] = useState(hasToken);
    const [shouldHideLanding, setShouldHideLanding] = useState(false);

    // Función para cambiar a login de forma inmediata y síncrona
    const handleShowLogin = () => {
        // Marcar que estamos en transición
        isTransitioningRef.current = true;

        // Ocultar la landing inmediatamente con CSS de forma síncrona
        if (landingRef.current) {
            landingRef.current.style.visibility = 'hidden';
            landingRef.current.style.opacity = '0';
            landingRef.current.style.pointerEvents = 'none';
        }

        // Actualizar estados de forma síncrona
        setShouldHideLanding(true);
        setShowLogin(true);
    };

    // useLayoutEffect para asegurar que los cambios se apliquen antes del paint
    useLayoutEffect(() => {
        if (shouldHideLanding && landingRef.current) {
            landingRef.current.style.visibility = 'hidden';
            landingRef.current.style.opacity = '0';
            landingRef.current.style.pointerEvents = 'none';
        }
    }, [shouldHideLanding]);

    useEffect(() => {
        // Limpiar el flag de logout después de usarlo
        if (sessionStorage.getItem('fromLogout') === 'true') {
            sessionStorage.removeItem('fromLogout');
            // Limpiar el parámetro de la URL sin recargar
            setSearchParams({});
        }

        // Verificar si hay un token de autenticación
        const token = localStorage.getItem('accessToken');
        if (token) {
            setIsAuthenticated(true);
            setShowLogin(false);
            setShouldHideLanding(false);
        } else {
            setIsAuthenticated(false);
        }
    }, [setSearchParams]);

    // Si el usuario está autenticado, redirigir al dashboard correspondiente
    if (isAuthenticated) {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const rol = localStorage.getItem('rol') || '';

        if (rol === 'admin') {
            window.location.href = '/admin';
        } else if (rol === 'representante') {
            window.location.href = '/representante';
        } else if (rol === 'estudiante') {
            window.location.href = '/estudiante';
        } else if (rol === 'profesor') {
            window.location.href = '/profesor';
        }

        return null;
    }

    // Si showLogin es true o shouldHideLanding es true, mostrar solo el formulario de login
    if (showLogin || shouldHideLanding) {
        return <LoginSession setShowLogin={setShowLogin} />;
    }

    // Por defecto, mostrar la landing page antigua (Header + Main + Footer)
    return (
        <div
            ref={landingRef}
            style={{
                visibility: shouldHideLanding ? 'hidden' : 'visible',
                opacity: shouldHideLanding ? 0 : 1,
                transition: 'none', // Sin transición para evitar parpadeo
            }}
        >
            <Header />
            <Main setShowLogin={handleShowLogin} />
            <Footer />
        </div>
    );
}
