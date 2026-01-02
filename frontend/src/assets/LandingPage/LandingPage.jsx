import '../../css/App.css';
import Header from './Header';
import Main from './Main';
import Footer from './Footer';
import { useState, useEffect } from 'react';
import LoginSession from './StartSession/LoginSession';

export default function LandingPage() {
    const [showLogin, setShowLogin] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        // Verificar si hay un token de autenticación
        const token = localStorage.getItem('accessToken');
        if (token) {
            setIsAuthenticated(true);
            setShowLogin(false);
        }
    }, []);

    // Si el usuario está autenticado, mostrar la landing page normal
    if (isAuthenticated) {
        return (
            <>
                <Header />
                <Main setShowLogin={setShowLogin} />
                <Footer></Footer>
            </>
        );
    }

    // Si no está autenticado, mostrar solo la pantalla de login
    return <LoginSession setShowLogin={setShowLogin} />;
}
