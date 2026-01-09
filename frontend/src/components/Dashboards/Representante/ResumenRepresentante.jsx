import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ResumenRepresentante.css';

const API_URL = import.meta.env.VITE_API_URL + '/' || 'http://localhost:8000/';

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

const ResumenRepresentante = () => {
    const [estudiantes, setEstudiantes] = useState([]);
    const [boletines, setBoletines] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const repreId = JSON.parse(localStorage.getItem('user')).id;

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        setLoading(true);
        try {
            await Promise.all([cargarEstudiantes(), cargarBoletines()]);
        } catch (error) {
            console.error('Error al cargar datos:', error);
        } finally {
            setLoading(false);
        }
    };

    const cargarEstudiantes = async () => {
        try {
            const response = await axiosInstance.get('usuarios/representante/');
            response.data.find((rep) => rep.id === repreId) &&
                setEstudiantes(
                    response.data.find((rep) => rep.id === repreId)
                        .estudiantes || []
                );
        } catch (error) {
            console.error('Error al cargar estudiantes:', error);
        }
    };

    const cargarBoletines = async () => {
        try {
            const response = await axiosInstance.get('boletines/');
            setBoletines(response.data || []);
        } catch (error) {
            console.error('Error al cargar boletines:', error);
        }
    };

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
                                onClick={() =>
                                    navigate('/representante/boletines')
                                }
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
                                <i className="fas fa-clock"></i>
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
                                                <i className="fas fa-file-pdf"></i>
                                                {boletin.lapso_display}
                                            </h4>
                                            {boletin.promedio_general && (
                                                <span className="promedio-badge">
                                                    {parseFloat(
                                                        boletin.promedio_general
                                                    ).toFixed(2)}
                                                </span>
                                            )}
                                        </div>
                                        <div className="boletin-reciente-info">
                                            <p>
                                                <i className="fas fa-user-graduate"></i>
                                                {boletin.estudiante_nombre ||
                                                    'Estudiante'}
                                            </p>
                                            <p>
                                                <i className="fas fa-calendar"></i>
                                                {new Date(
                                                    boletin.fecha_emision
                                                ).toLocaleDateString('es-ES', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric',
                                                })}
                                            </p>
                                        </div>
                                        <button
                                            className="btn-ver-boletin"
                                            onClick={() =>
                                                navigate(
                                                    '/representante/boletines'
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
        </div>
    );
};

export default ResumenRepresentante;
