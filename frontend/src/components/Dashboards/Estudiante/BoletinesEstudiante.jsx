import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNotification } from '../../../context/NotificationContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export function BoletinesEstudiante() {
    const { addNotification } = useNotification();
    const [misNotas, setMisNotas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtroLapso, setFiltroLapso] = useState('1');
    const user = JSON.parse(localStorage.getItem('user'));

    const getAxiosConfig = () => {
        const token = localStorage.getItem('accessToken');
        return {
            headers: {
                Authorization: token ? `Bearer ${token}` : '',
                'Content-Type': 'application/json',
            },
        };
    };

    useEffect(() => {
        cargarMisCalificaciones();
    }, [filtroLapso]);

    const cargarMisCalificaciones = async () => {
        setLoading(true);
        try {
            // El backend permite filtrar por el ID del estudiante autenticado
            const response = await axios.get(
                `${API_URL}/calificaciones/?estudiante=${user.id}&lapso=${filtroLapso}`,
                getAxiosConfig(),
            );
            setMisNotas(response.data);
        } catch (error) {
            addNotification('Error al obtener tus notas.', 'error');
        } finally {
            setLoading(false);
        }
    };
    const verMiBoletin = async () => {
        try {
            const response = await axios.get(`${API_URL}/boletines/`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                },
            });
            const boletin = response.data.find(
                (b) => b.estudiante === user.id && b.lapso === filtroLapso,
            );

            const boletinpdf = await axios.get(
                `${API_URL}/boletines/${boletin.id}/descargar/`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                    },
                    responseType: 'blob',
                },
            );
            if (boletinpdf.status === 200) {
                const blob = new Blob([boletinpdf.data], {
                    type: 'application/pdf',
                });
                const url = URL.createObjectURL(blob);
                window.open(url, '_blank');
            } else {
                addNotification(
                    'Tu boletín aún no está disponible para este lapso.',
                    'warning',
                );
            }
        } catch (error) {
            addNotification('Error al generar la vista previa.', 'error');
        }
    };

    return (
        <div className="container-boletines">
            <div className="boletines-header">
                <h1>Mis Calificaciones</h1>
                <button onClick={verMiBoletin} className="btn-primary-materia">
                    <i className="material-symbols-outlined">description</i>
                    Ver Boletín Digital
                </button>
            </div>

            <div className="table-container" style={{ padding: '20px' }}>
                <div
                    className="filters-container"
                    style={{ marginBottom: '20px' }}
                >
                    <label>Seleccionar Lapso: </label>
                    <select
                        className="periodo-selector"
                        value={filtroLapso}
                        onChange={(e) => setFiltroLapso(e.target.value)}
                    >
                        <option value="1">Primer Lapso</option>
                        <option value="2">Segundo Lapso</option>
                        <option value="3">Tercer Lapso</option>
                    </select>
                </div>

                <div className="materias-grid">
                    {loading ? (
                        <p>Cargando tus notas...</p>
                    ) : misNotas.length === 0 ? (
                        <p>
                            No se encontraron notas registradas para este lapso.
                        </p>
                    ) : (
                        misNotas.map((cal) => (
                            <div
                                key={cal.id}
                                className="materia-card estudiante"
                            >
                                <div className="materia-header">
                                    <h3>{cal.materia_nombre}</h3>
                                    <p style={{ display: 'inline' }}>
                                        Promedio:{' '}
                                    </p>
                                    <span className="promedio-badge">
                                        {cal.promedio}
                                    </span>
                                </div>
                                <div className="evaluaciones-list">
                                    {cal.evaluaciones.length > 0 ? (
                                        cal.evaluaciones.map((evalu) => (
                                            <div
                                                key={evalu.id}
                                                className="evaluacion-item"
                                            >
                                                <span
                                                    style={{
                                                        fontWeight: 'bold',
                                                    }}
                                                >
                                                    {evalu.nombre}:{' '}
                                                </span>
                                                <span className="nota-valor">
                                                    {evalu.nota}ptos
                                                </span>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="no-eval">
                                            Sin evaluaciones registradas
                                        </p>
                                    )}
                                </div>
                                {cal.enviado && (
                                    <div className="status-tag">
                                        <p style={{ fontSize: '0.8rem' }}>
                                            Notas Oficiales
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
