import React from 'react';

const ResumenCards = () => {
  return (
    <>
      <div className="card">
        <i className="fas fa-user-graduate fa-2x"></i>
        <p>Total de estudiantes</p>
        <span>0</span>
      </div>
      <div className="card">
        <i className="fas fa-chalkboard-teacher fa-2x"></i>
        <p>Total de profesores</p>
        <span>0</span>
      </div>
      <div className="card">
        <i className="fas fa-users fa-2x"></i>
        <p>Total de representantes</p>
        <span>0</span>
      </div>
    </>
  );
};

export default ResumenCards;
