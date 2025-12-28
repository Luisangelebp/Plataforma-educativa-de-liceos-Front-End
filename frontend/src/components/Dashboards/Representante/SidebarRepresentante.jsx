import React from 'react';
import { Link } from 'react-router-dom';

const SidebarRepresentante = ({ onClose }) => {
  return (
    <aside className="sidebar">
      <nav className="sidebar-menu">
        <ul>
          <li>
            <Link to="/representante" onClick={onClose}>Inicio</Link>
          </li>
          <li>
            <Link to="/representante/representados" onClick={onClose}>Mis representados</Link>
          </li>
          <li>
            <Link to="/representante/calendario" onClick={onClose}>Calendario de actividades</Link>
          </li>
          <li>
            <Link to="/representante/boletines" onClick={onClose}>Boletines</Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default SidebarRepresentante;

