import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNotification } from '../../../context/NotificationContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export function CalificacionesRepresentante() {
    const { addNotification } = useNotification();
    const [hijos, setHijos] = useState([]);
    const [selectedHijo, setSelectedHijo] = useState('');
    const [notasHijo, setNotasHijo] = useState([]);
    const [filtroLapso, setFiltroLapso] = useState('1');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const cargarHijos = async () => {
            try {
                const user = JSON.parse(localStorage.getItem('user'));
                setHijos(user.estudiantes || []);
                if (user.estudiantes?.length > 0)
                    setSelectedHijo(user.estudiantes[0].id);
            } catch (error) {
                addNotification(
                    'Error al cargar la lista de representados.',
                    'error',
                );
            }
        };
        cargarHijos();
    }, []);
    useEffect(() => {
        if (selectedHijo) cargarNotasHijo();
    }, [selectedHijo, filtroLapso]);

    const cargarNotasHijo = async () => {
        setLoading(true);
        try {
            const response = await axios.get(
                `${API_URL}/calificaciones/?estudiante=${selectedHijo}&lapso=${filtroLapso}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                    },
                },
            );
            setNotasHijo(response.data);
        } catch (error) {
            console.error('Error al cargar calificaciones:', error);
            addNotification('Error al obtener calificaciones.', 'error');
        } finally {
            setLoading(false);
        }
    };

    // 3. Descargar Boletín (PDF Oficial)
    const descargarBoletin = async () => {
        try {
            const response = await axios.get(`${API_URL}/boletines/`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                },
            });

            const boletin = response.data.find(
                (b) => b.estudiante == selectedHijo && b.lapso == filtroLapso,
            );

            if (!boletin) {
                addNotification(
                    'El boletín aún no está disponible para este lapso.',
                    'warning',
                );
                return;
            }

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
            }
        } catch (error) {
            addNotification('Error al generar la descarga.', 'error');
            console.error('Error al generar la descarga:', error);
        }
    };

    return (
        <div className="container-boletines">
            <div className="boletines-header">
                <h1>Panel del Representante</h1>
                <button
                    onClick={descargarBoletin}
                    className="btn-primary-materia"
                >
                    <i className="material-symbols-outlined">download</i>{' '}
                    Descargar Boletín
                </button>
            </div>

            <div className="table-container" style={{ padding: '20px' }}>
                <div
                    className="filters-container"
                    style={{
                        display: 'flex',
                        gap: '15px',
                        marginBottom: '30px',
                    }}
                >
                    {/* Selector de Hijo */}
                    <div className="form-group">
                        <label>Estudiante:</label>
                        <select
                            className="periodo-selector"
                            value={selectedHijo}
                            onChange={(e) => setSelectedHijo(e.target.value)}
                        >
                            {hijos.map((hijo) => (
                                <option key={hijo.id} value={hijo.id}>
                                    {hijo.nombre} {hijo.apellido}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Selector de Lapso */}
                    <div className="form-group">
                        <label>Lapso:</label>
                        <select
                            className="periodo-selector"
                            value={filtroLapso}
                            onChange={(e) => setFiltroLapso(e.target.value)}
                        >
                            <option value="1">1er Lapso</option>
                            <option value="2">2do Lapso</option>
                            <option value="3">3er Lapso</option>
                        </select>
                    </div>
                </div>

                <div className="materias-grid">
                    {loading ? (
                        <p>Cargando información escolar...</p>
                    ) : notasHijo.length === 0 ? (
                        <p>No hay notas publicadas para este periodo.</p>
                    ) : (
                        notasHijo.map((cal) => (
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
