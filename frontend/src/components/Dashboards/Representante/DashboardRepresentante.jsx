import React from 'react';
import HeaderRepresentante from './HeaderRepresentante';
import SidebarRepresentante from './SidebarRepresentante';
import ResumenRepresentante from './ResumenRepresentante';
import '../css/layout.css';
import '../css/representante.css';


const DashboardRepresentante = () => {
  return (
    <div className="panel">
      <HeaderRepresentante />
      <main className="main">
        <SidebarRepresentante />
        <section className="content">
          <ResumenRepresentante />
        </section>
      </main>
    </div>
  );
};

export default DashboardRepresentante;
