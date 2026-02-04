import { useNotification } from '../../context/NotificationContext';
import './css/FooterRadical.css';

export default function Footer() {
    const { addNotification } = useNotification();

    const copyToClipboard = (text, type) => {
        navigator.clipboard.writeText(text).then(() => {
            addNotification(`${type} copiado al portapapeles`, 'success');
        }).catch((err) => {
            console.error('Error al copiar: ', err);
            addNotification('Error al copiar al portapapeles', 'error');
        });
    };

    return (
        <footer className="radical-footer">
            <div className="footer-container">
                {/* Bottom Bar */}
                <div className="footer-bottom centered">
                    <span>&copy; 2026 CENIT. Todos los derechos reservados.</span>
                    <span className="separator">|</span>

                    <span
                        className="footer-contact-link"
                        onClick={() => copyToClipboard('contacto@cenit.edu.ve', 'Correo')}
                        title="Copiar correo"
                    >
                        <span className="material-symbols-outlined">mail</span>
                        contacto@cenit.edu.ve
                    </span>
                    <span className="separator">|</span>

                    <span
                        className="footer-contact-link"
                        onClick={() => copyToClipboard('+58 412 123 4567', 'Teléfono')}
                        title="Copiar teléfono"
                    >
                        <span className="material-symbols-outlined">call</span>
                        +58 412 123 4567
                    </span>
                    <span className="separator">|</span>

                    <span
                        className="footer-contact-link"
                        onClick={() => copyToClipboard('Av. Principal, Ciudad', 'Dirección')}
                        title="Copiar dirección"
                    >
                        <span className="material-symbols-outlined">location_on</span>
                        Av. Principal, Ciudad
                    </span>
                </div>
            </div>
        </footer>
    );
}