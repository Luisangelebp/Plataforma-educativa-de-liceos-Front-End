import { useState, useEffect } from 'react';
import axios from 'axios';
import '../css/ModernDashboard.css';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000') + '/';

const getAuthHeaders = () => {
    const token = localStorage.getItem('accessToken');
    return {
        Authorization: token ? `Bearer ${token}` : '',
    };
};

const axiosInstance = axios.create({
    baseURL: API_URL,
});

axiosInstance.interceptors.request.use((config) => {
    const authHeaders = getAuthHeaders();
    config.headers = {
        ...config.headers,
        ...authHeaders,
        'Content-Type': 'application/json',
    };
    return config;
});

export function HorariosProfesor() {
    const [horarios, setHorarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const userLocal = JSON.parse(localStorage.getItem('user'));
    const profesorId = userLocal ? userLocal.id : null;
    const [selectedGrado, setSelectedGrado] = useState('');
    const [gradosSecciones, setGradosSecciones] = useState([]);
    const [materias, setMaterias] = useState([]);

    useEffect(() => {
        if (profesorId) {
            cargarHorarios();
            cargarMaterias();
        }
    }, [profesorId, selectedGrado]);

    useEffect(() => {
        cargarGradosSecciones();
    }, []);

    const cargarMaterias = async () => {
        try {
            const response = await axiosInstance.get('horarios/materias/');
            setMaterias(response.data);
        } catch (error) {
            console.error('Error al cargar materias:', error);
        }
    };

    const cargarHorarios = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get('horarios/');
            let horariosFiltrados = response.data.filter(
                (h) => h.profesor === profesorId,
            );

            if (selectedGrado) {
                horariosFiltrados = horariosFiltrados.filter(
                    (h) => h.grado_seccion === parseInt(selectedGrado),
                );
            }

            const ordenDias = {
                lunes: 1,
                martes: 2,
                miercoles: 3,
                jueves: 4,
                viernes: 5,
            };

            horariosFiltrados.sort((a, b) => {
                if (ordenDias[a.dia_semana] !== ordenDias[b.dia_semana]) {
                    return ordenDias[a.dia_semana] - ordenDias[b.dia_semana];
                }
                return a.hora_inicio.localeCompare(b.hora_inicio);
            });

            setHorarios(horariosFiltrados);
        } catch (error) {
            console.error('Error al cargar horarios:', error);
        } finally {
            setLoading(false);
        }
    };

    const cargarGradosSecciones = async () => {
        try {
            const response = await axiosInstance.get('grado-seccion/');
            setGradosSecciones(response.data);
        } catch (error) {
            console.error('Error al cargar grados:', error);
        }
    };

    const dias = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'];
    const diasLabels = {
        lunes: 'Lunes',
        martes: 'Martes',
        miercoles: 'Miércoles',
        jueves: 'Jueves',
        viernes: 'Viernes',
    };

    const horariosPorDia = {};
    dias.forEach((dia) => {
        horariosPorDia[dia] = horarios.filter((h) => h.dia_semana === dia);
    });

    return (
        <div className="dashboard-content">
            <div className="dashboard-header">
                <div className="title-group">
                    <h1 className="page-title">Mis Horarios</h1>
                    <p className="page-subtitle">
                        Visualiza tus clases asignadas por grado y sección
                    </p>
                </div>
            </div>

            <div className="dashboard-card">
                <div
                    className="card-controls"
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '2rem',
                        flexWrap: 'wrap',
                        gap: '1rem',
                    }}
                >
                    <h2
                        style={{
                            fontSize: '1.25rem',
                            fontWeight: '700',
                            color: 'var(--text-primary)',
                        }}
                    >
                        <span
                            className="material-symbols-outlined"
                            style={{
                                verticalAlign: 'middle',
                                marginRight: '8px',
                            }}
                        >
                            schedule
                        </span>
                        Horarios del Profesor
                    </h2>

                    <div
                        className="filter-group"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                        }}
                    >
                        <label
                            style={{
                                fontSize: '0.9rem',
                                fontWeight: '600',
                                color: 'var(--text-secondary)',
                            }}
                        >
                            Filtrar:
                        </label>
                        <select
                            value={selectedGrado}
                            onChange={(e) => setSelectedGrado(e.target.value)}
                            className="filter-select"
                            style={{
                                padding: '8px 12px',
                                borderRadius: '8px',
                                border: '1px solid var(--border-color)',
                                minWidth: '180px',
                            }}
                        >
                            <option value="">Todos los grados</option>
                            {gradosSecciones.map((grado) => (
                                <option key={grado.id} value={grado.id}>
                                    {grado.grado} {grado.seccion} ({grado.nivel}
                                    )
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '3rem' }}>
                        <span
                            className="material-symbols-outlined spinning"
                            style={{
                                fontSize: '3rem',
                                color: 'var(--primary)',
                            }}
                        >
                            progress_activity
                        </span>
                        <p
                            style={{
                                marginTop: '1rem',
                                color: 'var(--text-secondary)',
                            }}
                        >
                            Cargando horarios...
                        </p>
                    </div>
                ) : horarios.length === 0 ? (
                    <div
                        style={{
                            textAlign: 'center',
                            padding: '3rem',
                            background: 'var(--background-light)',
                            borderRadius: '12px',
                        }}
                    >
                        <span
                            className="material-symbols-outlined"
                            style={{
                                fontSize: '4rem',
                                color: 'var(--text-secondary)',
                                opacity: '0.3',
                            }}
                        >
                            calendar_today
                        </span>
                        <p
                            style={{
                                marginTop: '1rem',
                                color: 'var(--text-secondary)',
                            }}
                        >
                            No hay horarios asignados para este criterio.
                        </p>
                    </div>
                ) : (
                    <div className="horarios-grid">
                        {dias.map((dia) => (
                            <div key={dia} className="horario-card">
                                <h3
                                    style={{
                                        fontSize: '1rem',
                                        fontWeight: '700',
                                        color: 'var(--primary)',
                                        borderBottom:
                                            '2px solid var(--workspace-bg)',
                                        paddingBottom: '0.75rem',
                                        marginBottom: '1rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                    }}
                                >
                                    <span
                                        className="material-symbols-outlined"
                                        style={{ fontSize: '18px' }}
                                    >
                                        calendar_today
                                    </span>
                                    {diasLabels[dia]}
                                </h3>

                                {horariosPorDia[dia].length === 0 ? (
                                    <p
                                        style={{
                                            color: 'var(--text-secondary)',
                                            fontSize: '0.85rem',
                                            fontStyle: 'italic',
                                            textAlign: 'center',
                                            padding: '1rem 0',
                                        }}
                                    >
                                        Sin clases asignadas
                                    </p>
                                ) : (
                                    <div
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '10px',
                                        }}
                                    >
                                        {horariosPorDia[dia].map((horario) => {
                                            const gs = gradosSecciones.find(
                                                (g) =>
                                                    g.id ==
                                                    horario.grado_seccion,
                                            );
                                            return (
                                                <div
                                                    key={horario.id}
                                                    style={{
                                                        padding: '12px',
                                                        background:
                                                            'var(--workspace-bg)',
                                                        borderRadius: '10px',
                                                        border: '1px solid var(--border-color)',
                                                        transition: 'all 0.2s',
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            display: 'flex',
                                                            justifyContent:
                                                                'space-between',
                                                            alignItems:
                                                                'flex-start',
                                                        }}
                                                    >
                                                        <div
                                                            style={{
                                                                overflow:
                                                                    'hidden',
                                                            }}
                                                        >
                                                            <p
                                                                style={{
                                                                    margin: 0,
                                                                    fontWeight:
                                                                        '700',
                                                                    color: 'var(--text-primary)',
                                                                    fontSize:
                                                                        '0.9rem',
                                                                    whiteSpace:
                                                                        'nowrap',
                                                                    overflow:
                                                                        'hidden',
                                                                    textOverflow:
                                                                        'ellipsis',
                                                                }}
                                                            >
                                                                {materias.find(
                                                                    (m) =>
                                                                        m.id ===
                                                                        horario.materia,
                                                                )?.nombre ||
                                                                    'Materia'}
                                                            </p>
                                                            {gs && (
                                                                <p
                                                                    style={{
                                                                        margin: '2px 0 0 0',
                                                                        fontSize:
                                                                            '0.75rem',
                                                                        color: 'var(--text-secondary)',
                                                                        fontWeight:
                                                                            '500',
                                                                    }}
                                                                >
                                                                    {gs.grado}{' '}
                                                                    {gs.seccion}{' '}
                                                                    • {gs.nivel}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <div
                                                            style={{
                                                                padding:
                                                                    '4px 8px',
                                                                background:
                                                                    'var(--primary)',
                                                                color: 'white',
                                                                borderRadius:
                                                                    '6px',
                                                                fontSize:
                                                                    '0.75rem',
                                                                fontWeight:
                                                                    '700',
                                                                whiteSpace:
                                                                    'nowrap',
                                                                marginLeft:
                                                                    '8px',
                                                            }}
                                                        >
                                                            {horario.hora_inicio?.substring(
                                                                0,
                                                                5,
                                                            )}{' '}
                                                            -{' '}
                                                            {horario.hora_fin?.substring(
                                                                0,
                                                                5,
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
