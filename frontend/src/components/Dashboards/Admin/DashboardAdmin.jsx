import '../css/dashboards.css';
import { Profile } from '../../profile/Profile.jsx';
import { Link, Outlet } from 'react-router-dom';
import { useState } from 'react';

const userAdmin = window.localStorage.getItem('user');
const API_URL = 'http://localhost:8000/';

export function Admin() {
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
                                <details>
                                    <summary>Usuarios</summary>
                                    <ul>
                                        <li>
                                            <Link
                                                to="./registro"
                                                className="menu-item"
                                                onClick={() =>
                                                    setMenuOpen(false)
                                                }
                                            >
                                                Registrar Usuario
                                            </Link>
                                        </li>
                                        <li>
                                            <Link
                                                to="./listaE"
                                                className="menu-item"
                                                onClick={() =>
                                                    setMenuOpen(false)
                                                }
                                            >
                                                Lista de Estudiantes
                                            </Link>
                                        </li>
                                        <li>
                                            <Link
                                                to="./listaR"
                                                className="menu-item"
                                                onClick={() =>
                                                    setMenuOpen(false)
                                                }
                                            >
                                                Lista de Representantes
                                            </Link>
                                        </li>
                                        <li>
                                            <Link
                                                to="./listaP"
                                                className="menu-item"
                                                onClick={() =>
                                                    setMenuOpen(false)
                                                }
                                            >
                                                Lista de Profesores
                                            </Link>
                                        </li>
                                    </ul>
                                </details>
                                <li>
                                    <Link
                                        to="./grados"
                                        className="menu-item"
                                        onClick={() => setMenuOpen(false)}
                                    >
                                        Grados
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
                <Profile
                    userImg={`${API_URL}${userAdmin.foto}` || null}
                ></Profile>
            </header>
            <main className="main">
                <Outlet />
            </main>
        </>
    );
}
