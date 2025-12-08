import { useState, useEffect } from 'react';
import axios from 'axios';
import '../Admin/css/Boletines.css';

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

    return (
        <div className="container-boletines-representante">
            <h1>Boletines de Mis Estudiantes</h1>

            {loading ? (
                <p>Cargando...</p>
            ) : Object.keys(boletinesPorEstudiante).length === 0 ? (
                <p>No hay boletines disponibles</p>
            ) : (
                <div className="estudiantes-boletines">
                    {Object.values(boletinesPorEstudiante).map((grupo, idx) => (
                        <div key={idx} className="estudiante-section">
                            <h2>{grupo.estudiante}</h2>
                            <div className="boletines-grid">
                                {grupo.boletines.map((boletin) => (
                                    <div key={boletin.id} className="boletin-card">
                                        <div className="boletin-header">
                                            <h3>{boletin.lapso_display}</h3>
                                            {boletin.promedio_general && (
                                                <span className="promedio">
                                                    Promedio: {boletin.promedio_general}
                                                </span>
                                            )}
                                        </div>
                                        <div className="boletin-info">
                                            <p>
                                                <strong>Fecha de emisión:</strong>{' '}
                                                {new Date(
                                                    boletin.fecha_emision
                                                ).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="boletin-actions">
                                            <button
                                                className="btn-view"
                                                onClick={() => handleView(boletin)}
                                            >
                                                <i className="fas fa-eye"></i> Ver
                                            </button>
                                            <button
                                                className="btn-download"
                                                onClick={() => handleDownload(boletin)}
                                            >
                                                <i className="fas fa-download"></i> Descargar
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

