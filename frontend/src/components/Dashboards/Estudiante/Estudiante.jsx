import '../css/dashboards.css';
import { Profile } from '../../profile/Profile.jsx';
import { Link, Outlet } from 'react-router-dom';
import { useState } from 'react';

const userAdmin = window.localStorage.getItem('user');

export function Estudiante() {
    const [menuOpen, setMenuOpen] = useState(false);
    return (
        <>
            <header>
                <div className="logo-container">
                    <div
                        className="mobil-menu"
                        onClick={() => setMenuOpen(!menuOpen)}
                    >
                        <i className="bi bi-list"></i>
                    </div>
                    {menuOpen && (
                        <>
                            <div
                                className="overlay"
                                onClick={() => setMenuOpen(false)}
                            ></div>
                            <ul className="modalMenu">
                                <li>
                                    <Link
                                        to=""
                                        className="menu-item"
                                        onClick={() => setMenuOpen(false)}
                                    >
                                        Inicio
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to="./horarios"
                                        className="menu-item"
                                        onClick={() => setMenuOpen(false)}
                                    >
                                        Horarios
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to="./boletines"
                                        className="menu-item"
                                        onClick={() => setMenuOpen(false)}
                                    >
                                        Boletines
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to="./calendario"
                                        className="menu-item"
                                        onClick={() => setMenuOpen(false)}
                                    >
                                        Calendario
                                    </Link>
                                </li>
                            </ul>
                        </>
                    )}
                    <div className="logo">
                        <svg
                            viewBox="0 0 100 100"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <use
                                href="../../logo.svg"
                                width={100}
                                height={100}
                            />
                        </svg>
                    </div>
                    <div className="cenit">
                        <h1>CENIT</h1>
                        <h3>"Con Excelencia Navegaras Iluminando Tu Futuro"</h3>
                    </div>
                </div>
                <Profile userImg={userAdmin.foto || null}></Profile>
            </header>
            <main className="main">
                <Outlet />
            </main>
        </>
    );
}
