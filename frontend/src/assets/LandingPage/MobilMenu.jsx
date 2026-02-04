import './css/MobilMenu.css';
import { useState } from 'react';
import { Link, Links } from 'react-router-dom';

export default function MobilMenu({ elementsMenu, setShowLogin }) {
    const [menuOpen, setMenuOpen] = useState(false);
    const elements_Menu = elementsMenu;
    return (
        <>
            <div className="mobil-menu" onClick={() => setMenuOpen(!menuOpen)}>
                <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>menu</span>
            </div>
            {menuOpen && (
                <>
                    <div
                        className="overlay"
                        onClick={() => setMenuOpen(false)}
                    ></div>
                    <ul className="modalMenu">
                        <div className="mobile-menu-header">
                            <h2>CENIT</h2>
                            <button className="close-mobile-menu" onClick={() => setMenuOpen(false)}>
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        {Array.isArray(elements_Menu)
                            ? elements_Menu.map((element, index) => {
                                return (
                                    <li key={index}>
                                        <Link
                                            to={`#${element}`}
                                            onClick={() => setMenuOpen(false)}
                                            className="menu-item"
                                            reloadDocument={true}
                                        >
                                            {element}
                                        </Link>
                                    </li>
                                );
                            })
                            : null}
                        <li className="mobile-auth-section">
                            <button
                                className="mobile-login-btn"
                                onClick={() => {
                                    setMenuOpen(false);
                                    if (setShowLogin) setShowLogin(true);
                                }}
                            >
                                Iniciar Sesión
                            </button>
                        </li>
                    </ul>
                </>
            )}
        </>
    );
}
