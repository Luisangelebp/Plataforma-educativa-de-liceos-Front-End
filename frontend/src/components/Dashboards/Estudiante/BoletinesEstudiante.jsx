import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../Admin/css/Boletines.css';
import './BoletinesEstudiante.css';

const API_URL = 'http://localhost:8000/';

const getAuthHeaders = () => {
    const token = localStorage.getItem('accessToken');
    return {
        'Authorization': token ? `Bearer ${token}` : '',
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

export function BoletinesEstudiante() {
    const location = useLocation();
    const navigate = useNavigate();
    const [boletines, setBoletines] = useState([]);
    const [calificaciones, setCalificaciones] = useState([]);
    const [loading, setLoading] = useState(true);
    // Determinar el tab activo basado en la ruta actual
    const [activeTab, setActiveTab] = useState(
        location.pathname === '/estudiante/boletines' ? 'boletines' : 'calificaciones'
    );
    const [selectedLapso, setSelectedLapso] = useState('1');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    // Sincronizar el tab con la ruta cuando cambia la ubicación
    useEffect(() => {
        if (location.pathname === '/estudiante/boletines') {
            setActiveTab('boletines');
        } else if (location.pathname === '/estudiante') {
            setActiveTab('calificaciones');
        }
    }, [location.pathname]);

    useEffect(() => {
        cargarDatos();
    }, []);

    useEffect(() => {
        if (activeTab === 'calificaciones') {
            cargarCalificaciones();
        }
    }, [selectedLapso, activeTab]);

    const cargarDatos = async () => {
        setLoading(true);
        try {
            await Promise.all([
                cargarBoletines(),
                cargarCalificaciones()
            ]);
        } catch (error) {
            console.error('Error al cargar datos:', error);
        } finally {
            setLoading(false);
        }
    };

    const cargarBoletines = async () => {
        try {
            const response = await axiosInstance.get('boletines/');
            setBoletines(response.data);
        } catch (error) {
            console.error('Error al cargar boletines:', error);
        }
    };

    const cargarCalificaciones = async () => {
        try {
            // El backend automáticamente filtra por el estudiante autenticado
            const response = await axiosInstance.get('calificaciones/');
            
            // Organizar por materia y lapso
            const calificacionesOrganizadas = {};
            response.data.forEach(cal => {
                const key = `${cal.materia}_${cal.lapso}`;
                if (!calificacionesOrganizadas[key]) {
                    calificacionesOrganizadas[key] = {
                        materia: cal.materia_nombre,
                        materia_id: cal.materia,
                        lapso: cal.lapso,
                        lapso_display: cal.lapso === '1' ? 'Primer Lapso' : cal.lapso === '2' ? 'Segundo Lapso' : 'Tercer Lapso',
                        profesor: `${cal.profesor_nombre} ${cal.profesor_apellido}`,
                        nota1: cal.nota1,
                        nota2: cal.nota2,
                        nota3: cal.nota3,
                        nota4: cal.nota4,
                        promedio: cal.promedio,
                        enviado: cal.enviado,
                        fecha_creacion: cal.fecha_creacion,
                        fecha_actualizacion: cal.fecha_actualizacion
                    };
                }
            });
            
            setCalificaciones(Object.values(calificacionesOrganizadas));
        } catch (error) {
            console.error('Error al cargar calificaciones:', error);
        }
    };

    const handleDownload = async (boletin) => {
        try {
            const response = await axiosInstance.get(
                `boletines/${boletin.id}/descargar/`,
                {
                    responseType: 'blob',
                }
            );
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute(
                'download',
                `boletin_${boletin.lapso_display}_${user.cedula || 'estudiante'}.pdf`
            );
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Error al descargar boletín:', error);
            alert('Error al descargar el boletín');
        }
    };

    const handleView = async (boletin) => {
        try {
            const response = await axiosInstance.get(
                `boletines/${boletin.id}/descargar/`,
                {
                    responseType: 'blob',
                }
            );
            const url = window.URL.createObjectURL(new Blob([response.data]));
            window.open(url, '_blank');
        } catch (error) {
            console.error('Error al ver boletín:', error);
            alert('Error al abrir el boletín');
        }
    };

    const getCalificacionesPorLapso = () => {
        return calificaciones.filter(cal => cal.lapso === selectedLapso);
    };

    const getColorPromedio = (promedio) => {
        if (!promedio) return '#6c757d';
        const prom = parseFloat(promedio);
        if (prom >= 16) return '#28a745'; // Verde
        if (prom >= 13) return '#ffc107'; // Amarillo
        if (prom >= 10) return '#fd7e14'; // Naranja
        return '#dc3545'; // Rojo
    };

    const lapsoLabels = {
        '1': 'Primer Lapso',
        '2': 'Segundo Lapso',
        '3': 'Tercer Lapso',
    };

    return (
        <div className="container-boletines-estudiante">
            <div className="boletines-estudiante-header">
                <h1>
                    <i className="fas fa-graduation-cap"></i>
                    Mis Calificaciones y Boletines
                </h1>
            </div>

            {/* Tabs */}
            <div className="tabs-container">
                <button
                    className={`tab-button ${activeTab === 'calificaciones' ? 'active' : ''}`}
                    onClick={() => {
                        setActiveTab('calificaciones');
                        navigate('/estudiante');
                    }}
                >
                    <i className="fas fa-clipboard-list"></i>
                    Calificaciones
                </button>
                <button
                    className={`tab-button ${activeTab === 'boletines' ? 'active' : ''}`}
                    onClick={() => {
                        setActiveTab('boletines');
                        navigate('/estudiante/boletines');
                    }}
                >
                    <i className="fas fa-file-pdf"></i>
                    Boletines Emitidos
                </button>
            </div>

            {loading ? (
                <div className="loading-container">
                    <i className="fas fa-spinner fa-spin"></i>
                    <p>Cargando...</p>
                </div>
            ) : (
                <>
                    {/* Tab de Calificaciones */}
                    {activeTab === 'calificaciones' && (
                        <div className="calificaciones-section">
                            <div className="lapso-selector">
                                <label>
                                    <i className="fas fa-calendar-alt"></i>
                                    Seleccionar Lapso:
                                </label>
                                <select
                                    value={selectedLapso}
                                    onChange={(e) => setSelectedLapso(e.target.value)}
                                >
                                    <option value="1">Primer Lapso</option>
                                    <option value="2">Segundo Lapso</option>
                                    <option value="3">Tercer Lapso</option>
                                </select>
                            </div>

                            {getCalificacionesPorLapso().length === 0 ? (
                                <div className="empty-state">
                                    <i className="fas fa-inbox"></i>
                                    <p>No hay calificaciones disponibles para este lapso</p>
                                </div>
                            ) : (
                                <div className="calificaciones-grid">
                                    {getCalificacionesPorLapso().map((cal, index) => (
                                        <div key={index} className="calificacion-card">
                                            <div className="calificacion-header">
                                                <h3>
                                                    <i className="fas fa-book"></i>
                                                    {cal.materia}
                                                </h3>
                                                <span
                                                    className="promedio-badge"
                                                    style={{ backgroundColor: getColorPromedio(cal.promedio) }}
                                                >
                                                    {cal.promedio ? parseFloat(cal.promedio).toFixed(2) : 'N/A'}
                                                </span>
                                            </div>
                                            <div className="calificacion-info">
                                                <p>
                                                    <i className="fas fa-user-tie"></i>
                                                    <strong>Profesor:</strong> {cal.profesor}
                                                </p>
                                                <p>
                                                    <i className="fas fa-calendar"></i>
                                                    <strong>Lapso:</strong> {cal.lapso_display}
                                                </p>
                                                {cal.enviado && (
                                                    <p className="enviado-badge">
                                                        <i className="fas fa-check-circle"></i>
                                                        Calificaciones Finales Enviadas
                                                    </p>
                                                )}
                                            </div>
                                            <div className="notas-container">
                                                <h4>Notas Parciales:</h4>
                                                <div className="notas-grid">
                                                    <div className="nota-item">
                                                        <span className="nota-label">Nota 1:</span>
                                                        <span className="nota-value">
                                                            {cal.nota1 !== null && cal.nota1 !== undefined ? parseFloat(cal.nota1).toFixed(2) : '-'}
                                                        </span>
                                                    </div>
                                                    <div className="nota-item">
                                                        <span className="nota-label">Nota 2:</span>
                                                        <span className="nota-value">
                                                            {cal.nota2 !== null && cal.nota2 !== undefined ? parseFloat(cal.nota2).toFixed(2) : '-'}
                                                        </span>
                                                    </div>
                                                    <div className="nota-item">
                                                        <span className="nota-label">Nota 3:</span>
                                                        <span className="nota-value">
                                                            {cal.nota3 !== null && cal.nota3 !== undefined ? parseFloat(cal.nota3).toFixed(2) : '-'}
                                                        </span>
                                                    </div>
                                                    <div className="nota-item">
                                                        <span className="nota-label">Nota 4:</span>
                                                        <span className="nota-value">
                                                            {cal.nota4 !== null && cal.nota4 !== undefined ? parseFloat(cal.nota4).toFixed(2) : '-'}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="promedio-final">
                                                    <span className="promedio-label">Promedio Final:</span>
                                                    <span
                                                        className="promedio-value"
                                                        style={{ color: getColorPromedio(cal.promedio) }}
                                                    >
                                                        {cal.promedio ? parseFloat(cal.promedio).toFixed(2) : 'N/A'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Tab de Boletines */}
                    {activeTab === 'boletines' && (
                        <div className="boletines-section">
                            {boletines.length === 0 ? (
                                <div className="empty-state">
                                    <i className="fas fa-file-pdf"></i>
                                    <p>No tienes boletines disponibles aún</p>
                                    <small>Los boletines serán emitidos por el administrador al finalizar cada lapso</small>
                                </div>
                            ) : (
                                <div className="boletines-grid">
                                    {boletines.map((boletin) => (
                                        <div key={boletin.id} className="boletin-card">
                                            <div className="boletin-header">
                                                <h3>
                                                    <i className="fas fa-file-pdf"></i>
                                                    {boletin.lapso_display}
                                                </h3>
                                                {boletin.promedio_general && (
                                                    <span
                                                        className="promedio"
                                                        style={{ backgroundColor: getColorPromedio(boletin.promedio_general) }}
                                                    >
                                                        {parseFloat(boletin.promedio_general).toFixed(2)}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="boletin-info">
                                                <p>
                                                    <i className="fas fa-calendar-check"></i>
                                                    <strong>Fecha de emisión:</strong>{' '}
                                                    {new Date(boletin.fecha_emision).toLocaleDateString('es-ES', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}
                                                </p>
                                                {boletin.promedio_general && (
                                                    <p>
                                                        <i className="fas fa-chart-line"></i>
                                                        <strong>Promedio General:</strong>{' '}
                                                        <span style={{ color: getColorPromedio(boletin.promedio_general) }}>
                                                            {parseFloat(boletin.promedio_general).toFixed(2)}
                                                        </span>
                                                    </p>
                                                )}
                                            </div>
                                            <div className="boletin-actions">
                                                <button
                                                    className="btn-view"
                                                    onClick={() => handleView(boletin)}
                                                >
                                                    <i className="fas fa-eye"></i>
                                                    Ver
                                                </button>
                                                <button
                                                    className="btn-download"
                                                    onClick={() => handleDownload(boletin)}
                                                >
                                                    <i className="fas fa-download"></i>
                                                    Descargar
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
