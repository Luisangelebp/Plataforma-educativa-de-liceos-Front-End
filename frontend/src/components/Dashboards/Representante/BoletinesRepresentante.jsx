import { useState, useEffect } from 'react';
import axios from 'axios';
import '../Admin/css/Boletines.css';

const API_URL = 'https://liceo-publico.onrender.com/';

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

export function BoletinesRepresentante() {
    const [boletines, setBoletines] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        cargarBoletines();
    }, []);

    const cargarBoletines = async () => {
        try {
            const response = await axiosInstance.get('boletines/');
            setBoletines(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error al cargar boletines:', error);
            setLoading(false);
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
                `boletin_${boletin.estudiante_nombre}_${boletin.lapso_display}.pdf`
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

    // Agrupar boletines por estudiante
    const boletinesPorEstudiante = boletines.reduce((acc, boletin) => {
        const estudianteId = boletin.estudiante;
        if (!acc[estudianteId]) {
            acc[estudianteId] = {
                estudiante: boletin.estudiante_nombre,
                boletines: [],
            };
        }
        acc[estudianteId].boletines.push(boletin);
        return acc;
    }, {});

    const getColorPromedio = (promedio) => {
        if (!promedio) return '#6c757d';
        const prom = parseFloat(promedio);
        if (prom >= 16) return '#28a745';
        if (prom >= 13) return '#ffc107';
        if (prom >= 10) return '#fd7e14';
        return '#dc3545';
    };

    return (
        <div className="container-boletines-representante">
            <div className="boletines-representante-header">
                <h1>
                    <i className="fas fa-file-pdf"></i>
                    Boletines de Mis Estudiantes
                </h1>
                <p>
                    Consulta y descarga los boletines académicos de tus
                    representados
                </p>
            </div>

            {loading ? (
                <div className="loading-container">
                    <i className="fas fa-spinner fa-spin"></i>
                    <p>Cargando boletines...</p>
                </div>
            ) : Object.keys(boletinesPorEstudiante).length === 0 ? (
                <div className="empty-state">
                    <i
                        className="fas fa-file-pdf"
                        style={{ marginRight: 0 }}
                    ></i>
                    <p>No hay boletines emitidos</p>
                    <small>
                        Los boletines aparecerán aquí una vez que sean emitidos
                        por el administrador
                    </small>
                </div>
            ) : (
                <div className="estudiantes-boletines">
                    {Object.values(boletinesPorEstudiante).map((grupo, idx) => (
                        <div key={idx} className="estudiante-section">
                            <div className="estudiante-section-header">
                                <h2>
                                    <i className="fas fa-user-graduate"></i>
                                    {grupo.estudiante}
                                </h2>
                                <span className="boletines-count">
                                    {grupo.boletines.length} boletín
                                    {grupo.boletines.length !== 1 ? 'es' : ''}
                                </span>
                            </div>
                            <div className="boletines-grid">
                                {grupo.boletines.map((boletin) => (
                                    <div
                                        key={boletin.id}
                                        className="boletin-card"
                                    >
                                        <div className="boletin-header">
                                            <h3>
                                                <i className="fas fa-file-pdf"></i>
                                                {boletin.lapso_display}
                                            </h3>
                                            {boletin.promedio_general && (
                                                <span
                                                    className="promedio"
                                                    style={{
                                                        backgroundColor:
                                                            getColorPromedio(
                                                                boletin.promedio_general
                                                            ),
                                                    }}
                                                >
                                                    {parseFloat(
                                                        boletin.promedio_general
                                                    ).toFixed(2)}
                                                </span>
                                            )}
                                        </div>
                                        <div className="boletin-info">
                                            <p>
                                                <i className="fas fa-calendar-check"></i>
                                                <strong>
                                                    Fecha de emisión:
                                                </strong>{' '}
                                                {new Date(
                                                    boletin.fecha_emision
                                                ).toLocaleDateString('es-ES', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                })}
                                            </p>
                                            {boletin.promedio_general && (
                                                <p>
                                                    <i className="fas fa-chart-line"></i>
                                                    <strong>
                                                        Promedio General:
                                                    </strong>{' '}
                                                    <span
                                                        style={{
                                                            color: getColorPromedio(
                                                                boletin.promedio_general
                                                            ),
                                                        }}
                                                    >
                                                        {parseFloat(
                                                            boletin.promedio_general
                                                        ).toFixed(2)}
                                                    </span>
                                                </p>
                                            )}
                                        </div>
                                        <div className="boletin-actions">
                                            <button
                                                className="btn-view"
                                                onClick={() =>
                                                    handleView(boletin)
                                                }
                                            >
                                                <i className="fas fa-eye"></i>
                                                Ver
                                            </button>
                                            <button
                                                className="btn-download"
                                                onClick={() =>
                                                    handleDownload(boletin)
                                                }
                                            >
                                                <i className="fas fa-download"></i>
                                                Descargar
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
