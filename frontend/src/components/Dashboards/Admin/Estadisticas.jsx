import axios from 'axios';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminsModal from './AdminsModal';
import RecentActivityModal from './EditPlantelModal';
import '../css/ModernDashboard.css';

export default function Estadisticas() {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    const [stats, setStats] = useState({
        estudiantes: 0,
        representantes: 0,
        profesores: 0,
        administradores: 0,
    });
    const [admins, setAdmins] = useState([]);
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAdminsModalOpen, setIsAdminsModalOpen] = useState(false);
    const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
    const [dataPlantel, setDataPlantel] = useState({});

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [est, rep, prof, admin, institucion] = await axios.all([
                    axios.get(`${API_URL}/usuarios/estudiante/`),
                    axios.get(`${API_URL}/usuarios/representante/`),
                    axios.get(`${API_URL}/usuarios/profesor/`),
                    axios.get(`${API_URL}/usuarios/administrador/`, {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                        },
                    }),
                    axios.get(`${API_URL}/institucion/`, {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                        },
                    }),
                    // axios.get(`${API_URL}/api/actividades/`),
                ]);
                setStats({
                    estudiantes: est.data.length,
                    representantes: rep.data.length,
                    profesores: prof.data.length,
                    administradores: admin.data.length,
                });
                setAdmins(admin.data);
                // setActivities(act.data);
                setDataPlantel(institucion.data);
            } catch (error) {
                console.error('Error al obtener datos:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div
                className="flex items-center justify-center h-full"
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '60vh',
                }}
            ></div>
        );
    }

    const statCards = [
        {
            label: 'Estudiantes',
            value: stats.estudiantes,
            icon: 'school',
            color: '#4361ee',
            trend: '+12%',
            link: './listaE',
        },
        {
            label: 'Profesores',
            value: stats.profesores,
            icon: 'assignment_ind',
            color: '#3f37c9',
            trend: '+5%',
            link: './listaP',
        },
        {
            label: 'Representantes',
            value: stats.representantes,
            icon: 'group',
            color: '#4cc9f0',
            trend: '+8%',
            link: './listaR',
        },
        {
            label: 'Admin',
            value: stats.administradores,
            icon: 'admin_panel_settings',
            color: '#4895ef',
            trend: '+2%',
            onClick: () => setIsAdminsModalOpen(true),
        },
    ];

    return (
        <div className="estadisticas-container">
            <div className="dashboard-header">
                <div>
                    <h1 className="page-title">Panel de Control</h1>
                    <p className="page-subtitle">
                        Monitoreo en tiempo real del sistema educativo
                    </p>
                </div>
                <div
                    className="header-actions"
                    style={{ display: 'flex', gap: '1rem' }}
                >
                    <div
                        className="date-display"
                        style={{
                            background: 'white',
                            padding: '0.6rem 1rem',
                            borderRadius: '12px',
                            border: '1px solid var(--border-color)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            fontSize: '0.85rem',
                            fontWeight: '600',
                            color: 'var(--text-secondary)',
                        }}
                    >
                        <span
                            className="material-symbols-outlined"
                            style={{ fontSize: '18px' }}
                        >
                            calendar_today
                        </span>
                        {new Date().toLocaleDateString('es-ES', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                        })}
                    </div>
                </div>
            </div>

            {/* main widgets grid */}
            <div className="grid-4">
                {statCards.map((card, index) => (
                    <div
                        key={index}
                        className="dashboard-card stat-widget"
                        onClick={card.onClick}
                        style={card.onClick ? { cursor: 'pointer' } : {}}
                    >
                        {card.link ? (
                            <Link
                                to={card.link}
                                style={{
                                    textDecoration: 'none',
                                    color: 'inherit',
                                }}
                            >
                                <div
                                    className="widget-stat-icon"
                                    style={{
                                        backgroundColor: `${card.color}15`,
                                        color: card.color,
                                    }}
                                >
                                    <span className="material-symbols-outlined">
                                        {card.icon}
                                    </span>
                                </div>
                                <div className="widget-stat-label">
                                    Total de {card.label}
                                </div>
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'baseline',
                                        gap: '0.75rem',
                                    }}
                                >
                                    <div className="widget-stat-value">
                                        {card.value}
                                    </div>
                                    <div
                                        style={{
                                            fontSize: '0.8rem',
                                            fontWeight: '700',
                                            color: '#10b981',
                                            display: 'flex',
                                            alignItems: 'center',
                                        }}
                                    >
                                        <span
                                            className="material-symbols-outlined"
                                            style={{ fontSize: '14px' }}
                                        >
                                            trending_up
                                        </span>
                                        {card.trend}
                                    </div>
                                </div>
                            </Link>
                        ) : (
                            <>
                                <div
                                    className="widget-stat-icon"
                                    style={{
                                        backgroundColor: `${card.color}15`,
                                        color: card.color,
                                    }}
                                >
                                    <span className="material-symbols-outlined">
                                        {card.icon}
                                    </span>
                                </div>
                                <div className="widget-stat-label">
                                    Total de {card.label}
                                </div>
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'baseline',
                                        gap: '0.75rem',
                                    }}
                                >
                                    <div className="widget-stat-value">
                                        {card.value}
                                    </div>
                                    <div
                                        style={{
                                            fontSize: '0.8rem',
                                            fontWeight: '700',
                                            color: '#10b981',
                                            display: 'flex',
                                            alignItems: 'center',
                                        }}
                                    >
                                        <span
                                            className="material-symbols-outlined"
                                            style={{ fontSize: '14px' }}
                                        >
                                            trending_up
                                        </span>
                                        {card.trend}
                                    </div>
                                </div>
                            </>
                        )}

                        <div className="mini-chart">
                            {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
                                <div
                                    key={i}
                                    className="chart-bar"
                                    style={{
                                        height: `${h}%`,
                                        opacity: i === 6 ? 1 : 0.3,
                                        backgroundColor: card.color,
                                    }}
                                ></div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* secondary widgets section */}
            <div className="grid-4" style={{ marginTop: '2.5rem' }}>
                <div
                    className="dashboard-card"
                    style={{ gridColumn: 'span 3' }}
                >
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '1.5rem',
                        }}
                    >
                        <h3
                            style={{
                                fontSize: '1.1rem',
                                fontWeight: '800',
                                fontFamily: 'Outfit',
                            }}
                        >
                            Datos del Plantel Educativo
                        </h3>
                        <button
                            onClick={() => setIsActivityModalOpen(true)}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--primary)',
                                fontWeight: '700',
                                fontSize: '0.8rem',
                                cursor: 'pointer',
                            }}
                        >
                            Editar
                        </button>
                    </div>
                    <div
                        className="recent-activity-list"
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1rem',
                        }}
                    >
                        {dataPlantel.length === 0 ? (
                            <p
                                style={{
                                    fontSize: '0.85rem',
                                    color: 'var(--text-secondary)',
                                    textAlign: 'center',
                                    padding: '1rem',
                                }}
                            >
                                No hay informacion disponible
                            </p>
                        ) : (
                            <div
                                style={{
                                    display: 'flex',
                                    gap: '1rem',
                                }}
                            >
                                <aside>
                                    <div className="logo">
                                        <img src={dataPlantel.logo} alt="" />
                                    </div>
                                    <h2>{dataPlantel.nombre}</h2>
                                </aside>
                                <section>
                                    <div className="data">
                                        <span class="material-symbols-outlined logo">
                                            person
                                        </span>
                                        <p>
                                            Director:
                                            <span className="contData">
                                                {' '}
                                                {dataPlantel.director}
                                            </span>
                                        </p>
                                    </div>
                                    <div className="data">
                                        <span class="material-symbols-outlined logo">
                                            person
                                        </span>
                                        <p>
                                            Sub-Director:
                                            <span className="contData">
                                                {' '}
                                                {dataPlantel.subdirector}
                                            </span>
                                        </p>
                                    </div>
                                    <div className="data">
                                        <span class="material-symbols-outlined logo">
                                            barcode
                                        </span>
                                        <p>
                                            Codigo DEA:
                                            <span className="contData">
                                                {' '}
                                                {dataPlantel.codigo_dea}
                                            </span>
                                        </p>
                                    </div>
                                    <div className="data">
                                        <span class="material-symbols-outlined logo">
                                            badge
                                        </span>
                                        <p>
                                            Rif:
                                            <span className="contData">
                                                {' '}
                                                {dataPlantel.rif}
                                            </span>
                                        </p>
                                    </div>
                                    <div className="data">
                                        <span class="material-symbols-outlined logo">
                                            format_quote
                                        </span>
                                        <p>
                                            Eslogan:
                                            <span className="contData">
                                                {' '}
                                                {dataPlantel.slogan_boletin}
                                            </span>
                                        </p>
                                    </div>
                                </section>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <AdminsModal
                open={isAdminsModalOpen}
                onClose={() => setIsAdminsModalOpen(false)}
            />

            <RecentActivityModal
                open={isActivityModalOpen}
                onClose={() => setIsActivityModalOpen(false)}
                dataPlantel={dataPlantel}
                setDataPlantel={setDataPlantel}
            />
        </div>
    );
}
