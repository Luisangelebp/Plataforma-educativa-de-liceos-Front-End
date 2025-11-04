import React from 'react';

const ResumenRepresentante = () => {
  return (
    <>
      <div className="card">
        <i className="fas fa-user-graduate fa-2x"></i>
        <p>Estudiante(s) a cargo</p>
        <button>Ver estudiante(s)</button>
      </div>
      <div className="card">
        <i className="fas fa-calendar-alt fa-2x"></i>
        <p>Calendario</p>
        <button>Ver calendario(s)</button>
      </div>
    </>
  );
};

export default ResumenRepresentante;
