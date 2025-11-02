// Footer.jsx
import './css/Footer.css';

export default function Footer() {
    return (
        <footer>
            <div className="footer-content">
                <p>&copy; 2025 Sistema Educativo. Todos los derechos reservados.</p>
                <ul className="social-links">
                    <li>
                        <a 
                            href="https://facebook.com" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            aria-label="Facebook"
                            className="facebook"
                        >
                            <i className="fab fa-facebook-f"></i>
                        </a>
                    </li>
                    <li>
                        <a 
                            href="https://twitter.com" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            aria-label="Twitter"
                            className="twitter"
                        >
                            <i className="fab fa-twitter"></i>
                        </a>
                    </li>
                    <li>
                        <a 
                            href="https://instagram.com" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            aria-label="Instagram"
                            className="instagram"
                        >
                            <i className="fab fa-instagram"></i>
                        </a>
                    </li>
                    <li>
                        <a 
                            href="https://linkedin.com" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            aria-label="LinkedIn"
                            className="linkedin"
                        >
                            <i className="fab fa-linkedin-in"></i>
                        </a>
                    </li>
                    <li>
                        <a 
                            href="https://youtube.com" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            aria-label="YouTube"
                            className="youtube"
                        >
                            <i className="fab fa-youtube"></i>
                        </a>
                    </li>
                </ul>
            </div>
        </footer>
    );
}