import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function NotFound() {
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setTimeout(() => {
            navigate('/'); // redirige al home después de 3 segundos
        }, 3000);

        return () => clearTimeout(timer); // limpia el timer si el componente se desmonta
    }, [navigate]);

    return (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <h1>404 - Página no encontrada</h1>
            <p>Serás redirigido al inicio en unos segundos...</p>
        </div>
    );
}

export default NotFound;
