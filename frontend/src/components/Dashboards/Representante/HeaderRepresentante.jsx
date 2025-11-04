import React from 'react';
import logo from '../../../assets/img/Logo.png';

const HeaderRepresentante = () => {
  return (
    <header className="main-header">
      <div className="main-title">
        <img className="logo" src={logo} alt="CENIT" />
        <h2>CENIT</h2>
        <p>"Con Excelencia Navegarás Iluminando Tu Futuro"</p>
      </div>
      <div className="user-info">
        <span>Representante</span>
        <button>Cerrar Sesión</button>
      </div>
    </header>
  );
};

export default HeaderRepresentante;
