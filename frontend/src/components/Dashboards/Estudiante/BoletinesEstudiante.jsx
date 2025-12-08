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

export function BoletinesEstudiante() {
    const [boletines, setBoletines] = useState([]);
    const [loading, setLoading] = useState(true);
    const user = JSON.parse(localStorage.getItem('user'));

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

    const lapsoLabels = {
        '1': 'Primer Lapso',
        '2': 'Segundo Lapso',
        '3': 'Tercer Lapso',
    };

    return (
        <div className="container-boletines-estudiante">
            <h1>Mis Boletines</h1>

            {loading ? (
                <p>Cargando...</p>
            ) : boletines.length === 0 ? (
                <p>No tienes boletines disponibles aún</p>
            ) : (
                <div className="boletines-grid">
                    {boletines.map((boletin) => (
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
                                    {new Date(boletin.fecha_emision).toLocaleDateString()}
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
            )}
        </div>
    );
}

