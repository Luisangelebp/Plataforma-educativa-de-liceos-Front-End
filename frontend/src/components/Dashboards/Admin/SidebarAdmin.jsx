import React from 'react';

const SidebarAdmin = () => {
  return (
    <aside className="sidebar">
      <nav className="sidebar-menu">
        <ul>
          <li>Inicio</li>
          <li>
            <details>
              <summary>Usuarios</summary>
              <ul>
                <li>Registrar usuario</li>
                <li>Lista de estudiantes</li>
                <li>Lista de profesores</li>
              </ul>
            </details>
          </li>
          <li>
            <details>
              <summary>Grados</summary>
              <ul>
                <li>1er grado</li>
                <li>2do grado</li>
                <li>3er grado</li>
                <li>4to grado</li>
                <li>5to grado</li>
                <li>6to grado</li>
              </ul>
            </details>
          </li>
          <li>Horarios</li>
          <li>Boletines</li>
        </ul>
      </nav>
    </aside>
  );
};

export default SidebarAdmin;
