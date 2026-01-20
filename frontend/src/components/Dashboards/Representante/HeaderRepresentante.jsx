import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Profile } from '../../profile/Profile.jsx';
import logo from '../../../assets/img/Logo.png';
import SidebarRepresentante from './SidebarRepresentante'; // ajusta la ruta si hace falta


const API_URL = import.meta.env.VITE_API_URL || 'https://liceo-publico.onrender.com';

export default function HeaderRepresentante() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState({});

  useEffect(() => {
    const loadUser = () => {
      const rawUser = window.localStorage.getItem('user');
      if (rawUser) {
        try {
          setUser(JSON.parse(rawUser));
        } catch (e) {
          console.error('Error parsing user data:', e);
        }
      }
    };
    
    loadUser();
    
    // Escuchar cambios en el usuario (ej: cuando se actualiza la foto)
    const handleUserUpdate = (event) => {
      if (event.detail) {
        setUser(event.detail);
      } else {
        loadUser();
      }
    };
    
    window.addEventListener('userUpdated', handleUserUpdate);
    
    return () => {
      window.removeEventListener('userUpdated', handleUserUpdate);
    };
  }, []);

  return (
    <header className="main-header">
      <div className="logo-container">
        <div className="mobil-menu" onClick={() => setMenuOpen(!menuOpen)}>
          <i className="bi bi-list"></i>
        </div>

        {menuOpen && (
          <>
            <div className="overlay" onClick={() => setMenuOpen(false)}></div>
            <ul className="modalMenu">
              <li>
                <Link to="/representante" className="menu-item" onClick={() => setMenuOpen(false)}>
                  Inicio
                </Link>
              </li>
              <details>
                <summary>Opciones</summary>
                <ul>
                  <li>
                    <Link to="/representante/representados" className="menu-item" onClick={() => setMenuOpen(false)}>
                      Mis representados
                    </Link>
                  </li>
                  <li>
                    <Link to="/representante/boletines" className="menu-item" onClick={() => setMenuOpen(false)}>
                      Boletines
                    </Link>
                  </li>
                </ul>
              </details>
            </ul>
          </>
        )}

        <div className="logo">
          <img src={logo} alt="CENIT" width={60} />
        </div>

        <div className="cenit">
          <h1>CENIT</h1>
          <h3>"Con Excelencia Navegaras Iluminando Tu Futuro"</h3>
        </div>
      </div>

      <div className="profile-container">
        <Profile userImg={user.foto ? (user.foto.startsWith('http') ? user.foto : `${API_URL}${user.foto}`) : null} />
        <button className="logout-button">Cerrar Sesión</button>
      </div>
    </header>
  );
}

