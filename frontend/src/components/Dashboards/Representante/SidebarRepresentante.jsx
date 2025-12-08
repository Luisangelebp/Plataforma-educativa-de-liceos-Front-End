import React from 'react';
import { Link } from 'react-router-dom';

const SidebarRepresentante = () => {
  return (
    <aside className="sidebar">
      <nav className="sidebar-menu">
        <ul>
          <li>
            <Link to="/representante">Inicio</Link>
          </li>
          <li>
            <Link to="/representante">Estudiante(s) a cargo</Link>
          </li>
          <li>
            <Link to="/representante/calendario">Calendario de actividades</Link>
          </li>
          <li>
            <Link to="/representante/boletines">Boletines</Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default SidebarRepresentante;
