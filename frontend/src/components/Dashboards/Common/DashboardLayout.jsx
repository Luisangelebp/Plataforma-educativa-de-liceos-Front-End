import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import '../css/ModernDashboard.css';

export function DashboardLayout({ children, role, user, menuItems, onLogout }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = (state) => {
        setIsSidebarOpen(state || !isSidebarOpen);
    };

    // Capitalize role for display
    const roleTitle = role.charAt(0).toUpperCase() + role.slice(1);

    return (
        <div className="modern-dashboard-root">
            <Sidebar
                title={roleTitle}
                role={role}
                user={user}
                menuItems={menuItems}
                onLogout={onLogout}
                isSidebarOpen={isSidebarOpen}
                toggleSidebar={toggleSidebar}
            />

            <main className="dashboard-main">{children}</main>
        </div>
    );
}
