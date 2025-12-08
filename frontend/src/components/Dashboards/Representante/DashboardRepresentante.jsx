import React from 'react';
import { Outlet } from 'react-router-dom';
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
                    <Outlet />
                </section>
            </main>
        </div>
    );
};

export default DashboardRepresentante;
