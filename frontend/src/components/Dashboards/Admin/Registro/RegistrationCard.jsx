import React from 'react';
import '../../css/ModernDashboard.css';

const RegistrationCard = ({ role, icon, title, description, onClick, gradient }) => {
    const colorMap = {
        'estudiante': '#3B82F6',
        'profesor': '#F59E0B',
        'representante': '#10B981',
        'administrador': '#6366F1'
    };

    const color = colorMap[role] || '#3B82F6';

    return (
        <button
            onClick={() => onClick(role)}
            className="dashboard-card"
            style={{
                cursor: 'pointer',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1rem',
                border: '2px solid var(--border-color)',
                transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = color;
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = `0 8px 16px ${color}30`;
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-color)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
            }}
        >
            <div
                style={{
                    width: '70px',
                    height: '70px',
                    borderRadius: '14px',
                    backgroundColor: `${color}20`,
                    color: color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2rem',
                }}
            >
                <span className="material-symbols-outlined">{icon}</span>
            </div>
            <h3
                style={{
                    margin: 0,
                    fontSize: '1.125rem',
                    fontWeight: '600',
                    color: 'var(--text-primary)',
                }}
            >
                {title}
            </h3>
            <p
                style={{
                    margin: 0,
                    color: 'var(--text-secondary)',
                    fontSize: '0.875rem',
                }}
            >
                {description}
            </p>
        </button>
    );
};

export default RegistrationCard;
