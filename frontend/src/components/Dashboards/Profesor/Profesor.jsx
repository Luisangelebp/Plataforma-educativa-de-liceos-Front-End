import '../css/dashboards.css';
import { Profile } from '../../profile/Profile.jsx';
import { Link, Outlet } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';

const user = window.localStorage.getItem('user');

export function Profesor() {
    const [menuOpen, setMenuOpen] = useState(false);
    console.log(user);
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
                                        to="./listaE"
                                        className="menu-item"
                                        onClick={() => setMenuOpen(false)}
                                    >
                                        Lista de Estudiantes
                                    </Link>
                                </li>

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
                                        to="./notas"
                                        className="menu-item"
                                        onClick={() => setMenuOpen(false)}
                                    >
                                        Carga de Notas
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
                <Profile userImg={user.foto || null}></Profile>
            </header>
            <main className="main">
                <Outlet />
            </main>
        </>
    );
}
