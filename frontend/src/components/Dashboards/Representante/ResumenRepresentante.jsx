import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ResumenRepresentante.css';

const API_URL = import.meta.env.VITE_API_URL + '/' || 'http://localhost:8000/';

// const getAuthHeaders = () => {
//     const token = localStorage.getItem('accessToken');
//     return {
//         Authorization: token ? `Bearer ${token}` : '',
//     };
// };

// const axiosInstance = axios.create({
//     baseURL: API_URL,
// });

// axiosInstance.interceptors.request.use((config) => {
//     const authHeaders = getAuthHeaders();
//     config.headers = {
//         ...config.headers,
//         ...authHeaders,
//         'Content-Type': 'application/json',
//     };
//     return config;
// });

const ListaEstudiantes = ({ isOpen, onClose, estudiantes }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="modal-container"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal-header">
                    <h3>Mis Representados</h3>
                    <button
                        className="close-btn"
                        onClick={onClose}
                        title="Cerrar"
                    >
                        &times;
                    </button>
                </div>
                <div className="modal-body">
                    {estudiantes.length > 0 ? (
                        <ul className="estudiantes-lista">
                            {estudiantes.map((estudiante) => (
                                <li
                                    key={estudiante.id}
                                    className="estudiante-item"
                                >
                                    <div className="estudiante-info">
                                        <i className="fas fa-user-circle"></i>
                                        <span>
                                            {estudiante.nombre}{' '}
                                            {estudiante.apellido} -- Cedula:{' '}
                                            {estudiante.cedula_mostrada}{' '}
                                        </span>
                                    </div>
                                    <span className="estudiante-grado">
                                        {estudiante.grado_o_año}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>No tienes estudiantes representados.</p>
                    )}
                </div>
                <div className="modal-footer">
                    <button
                        type="button"
                        className="btn-cancel"
                        onClick={onClose}
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};

const ResumenRepresentante = () => {
    const estudiantes = JSON.parse(localStorage.getItem('user')).estudiantes;
    const [boletines, setBoletines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate();
    const repreId = JSON.parse(localStorage.getItem('user')).id;
    const estudiantesId = estudiantes.map((estudiante) => estudiante.id);

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        setLoading(true);
        try {
            await Promise.all([cargarBoletines()]);
        } catch (error) {
            console.error('Error al cargar datos:', error);
        } finally {
            setLoading(false);
        }
    };

    const cargarBoletines = async () => {
        try {
            const response = await axios.get(`${API_URL}boletines/`, {
                Headers: {
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                },
            });
            setBoletines(
                response.data.filter((boletin) =>
                    estudiantesId.includes(boletin.estudiante),
                ) || [],
            );
        } catch (error) {
            console.error('Error al cargar boletines:', error);
        }
    };

    console.log(boletines);
    const totalEstudiantes = estudiantes.length || 0;
    const totalBoletines = boletines.length || 0;
    const boletinesRecientes = boletines.slice(0, 3);

    return (
        <div className="resumen-representante">
            <div className="resumen-header">
                <h1>
                    <i className="fas fa-home"></i>
                    Panel del Representante
                </h1>
                <p>
                    Bienvenido, aquí puedes gestionar la información de tus
                    representados
                </p>
            </div>

            {loading ? (
                <div className="loading-container">
                    <i className="fas fa-spinner fa-spin"></i>
                    <p>Cargando información...</p>
                </div>
            ) : (
                <>
                    {/* Cards de Resumen */}
                    <div className="resumen-cards">
                        <div className="resumen-card card-estudiantes">
                            <div className="card-icon">
                                <i className="fas fa-user-graduate"></i>
                            </div>
                            <div className="card-content">
                                <h3>Mis Representados</h3>
                                <p className="card-number">
                                    {totalEstudiantes}
                                </p>
                                <p className="card-label">
                                    Estudiante
                                    {totalEstudiantes !== 1 ? 's' : ''}
                                </p>
                            </div>
                            <button
                                className="card-button"
                                onClick={() => setIsModalOpen(true)}
                            >
                                <i className="fas fa-arrow-right"></i>
                                Ver Detalles
                            </button>
                        </div>

                        <div className="resumen-card card-boletines">
                            <div className="card-icon">
                                <i className="fas fa-file-pdf"></i>
                            </div>
                            <div className="card-content">
                                <h3>Boletines Disponibles</h3>
                                <p className="card-number">{totalBoletines}</p>
                                <p className="card-label">
                                    Bolet{totalBoletines !== 1 ? 'ines' : 'ín'}
                                </p>
                            </div>
                            <button
                                className="card-button"
                                onClick={() =>
                                    navigate('/representante/boletines')
                                }
                            >
                                <i className="fas fa-arrow-right"></i>
                                Ver Boletines
                            </button>
                        </div>
                    </div>

                    {/* Boletines Recientes */}
                    {boletinesRecientes.length > 0 && (
                        <div className="boletines-recientes">
                            <h2>
                                <span
                                    className="material-symbols-outlined"
                                    style={{ fontSize: '2rem' }}
                                >
                                    history
                                </span>
                                Boletines Recientes
                            </h2>
                            <div className="boletines-recientes-grid">
                                {boletinesRecientes.map((boletin) => (
                                    <div
                                        key={boletin.id}
                                        className="boletin-reciente-card"
                                    >
                                        <div className="boletin-reciente-header">
                                            <h4>
                                                <span className="material-symbols-outlined">
                                                    picture_as_pdf
                                                </span>
                                                {boletin.lapso_display}
                                            </h4>
                                            {boletin.promedio_general && (
                                                <span className="promedio-badge">
                                                    {parseFloat(
                                                        boletin.promedio_general,
                                                    ).toFixed(2)}
                                                </span>
                                            )}
                                        </div>
                                        <div className="boletin-reciente-info">
                                            <p>
                                                <span className="material-symbols-outlined">
                                                    school
                                                </span>
                                                {boletin.estudiante_nombre ||
                                                    'Estudiante'}
                                            </p>
                                            <p>
                                                <span className="material-symbols-outlined">
                                                    calendar_today
                                                </span>
                                                {new Date(
                                                    boletin.fecha_emision,
                                                ).toLocaleDateString('es-ES', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric',
                                                })}
                                            </p>
                                        </div>
                                        <button
                                            className="card-button"
                                            onClick={() =>
                                                navigate(
                                                    '/representante/boletines',
                                                )
                                            }
                                        >
                                            Ver Detalles
                                            <i className="fas fa-arrow-right"></i>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}
            <ListaEstudiantes
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                estudiantes={estudiantes}
            />
        </div>
    );
};

export default ResumenRepresentante;
