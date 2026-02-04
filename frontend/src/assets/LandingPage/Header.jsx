import MobilMenu from './MobilMenu';
import Menu from './Menu';
import logo from '../../logo.svg';
import '../../css/App.css';
import './css/Menu.css'; // Import explicit styles for Header
import { useScreenWidth } from '../constans/hooks';
import { elementsMenu } from '../constans/constans';

export default function Header({ setShowLogin }) {
    const screenWidth = useScreenWidth();
    return (
        <header>
            <div className="logo-container">
                <div className="logo">
                    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                        <use href="../../logo.svg" width={100} height={100} />
                    </svg>
                </div>
                <div className="cenit">
                    <h1>CENIT</h1>
                </div>
            </div>

            <div className="nav-container">
                {screenWidth < 1024 ? (
                    <MobilMenu elementsMenu={elementsMenu} setShowLogin={setShowLogin}></MobilMenu>
                ) : (
                    <Menu elementsMenu={elementsMenu} />
                )}
            </div>

            <div className="auth-container">
                <button
                    className="btn-login-header"
                    onClick={() => setShowLogin(true)}
                >
                    Iniciar Sesión
                </button>
            </div>
        </header>
    );
}