import React from 'react';
import HeaderAdmin from './HeaderAdmin';
import SidebarAdmin from './SidebarAdmin';
import ResumenCards from './ResumenCards';
import '../css/layout.css';
import '../css/admin.css';

const DashboardAdmin = () => {
  return (
    <div className="panel">
      <HeaderAdmin />
      <main className="main">
        <SidebarAdmin />
        <section className="content">
          <ResumenCards />
        </section>
      </main>
    </div>
  );
};

export default DashboardAdmin;
