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

const user = JSON.parse(localStorage.getItem('user'));
const puedeEditar = user?.rol === 'admin' || user?.rol === 'profesor';

export function Calendario() {
    const [eventos, setEventos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        titulo: '',
        descripcion: '',
        fecha_inicio: '',
        fecha_fin: '',
        hora_inicio: '',
        hora_fin: '',
        grado_seccion: '',
    });
    const [grados, setGrados] = useState([]);
    const [editingEvent, setEditingEvent] = useState(null);

    useEffect(() => {
        cargarEventos();
        cargarGrados();
    }, []);

    const cargarEventos = async () => {
        try {
            const response = await axiosInstance.get('calendario/eventos/');
            setEventos(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error al cargar eventos:', error);
            setLoading(false);
        }
    };

    const cargarGrados = async () => {
        try {
            const response = await axiosInstance.get('grado-seccion/');
            setGrados(response.data);
        } catch (error) {
            console.error('Error al cargar grados:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = {
                ...formData,
                grado_seccion: formData.grado_seccion || null,
            };
            if (editingEvent) {
                await axiosInstance.put(`calendario/eventos/${editingEvent.id}/`, data);
            } else {
                await axiosInstance.post('calendario/eventos/', data);
            }
            setShowModal(false);
            setFormData({
                titulo: '',
                descripcion: '',
                fecha_inicio: '',
                fecha_fin: '',
                hora_inicio: '',
                hora_fin: '',
                grado_seccion: '',
            });
            setEditingEvent(null);
            cargarEventos();
        } catch (error) {
            console.error('Error al guardar evento:', error);
            alert('Error al guardar el evento');
        }
    };

    const handleEdit = (evento) => {
        setEditingEvent(evento);
        setFormData({
            titulo: evento.titulo,
            descripcion: evento.descripcion || '',
            fecha_inicio: evento.fecha_inicio.split('T')[0],
            fecha_fin: evento.fecha_fin.split('T')[0],
            hora_inicio: evento.hora_inicio,
            hora_fin: evento.hora_fin,
            grado_seccion: evento.grado_seccion || '',
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Estás seguro de eliminar este evento?')) return;
        try {
            await axiosInstance.delete(`calendario/eventos/${id}/`);
            cargarEventos();
        } catch (error) {
            console.error('Error al eliminar evento:', error);
            alert('Error al eliminar el evento');
        }
    };

    const handleNewEvent = () => {
        setEditingEvent(null);
        setFormData({
            titulo: '',
            descripcion: '',
            fecha_inicio: '',
            fecha_fin: '',
            hora_inicio: '',
            hora_fin: '',
            grado_seccion: '',
        });
        setShowModal(true);
    };

    // Agrupar eventos por fecha
    const eventosPorFecha = eventos.reduce((acc, evento) => {
        const fecha = new Date(evento.fecha_inicio).toLocaleDateString();
        if (!acc[fecha]) {
            acc[fecha] = [];
        }
        acc[fecha].push(evento);
        return acc;
    }, {});

    return (
        <div className="container-calendario">
            <div className="calendario-header">
                <h1>Calendario Escolar</h1>
                {puedeEditar && (
                    <button className="btn-submit" onClick={handleNewEvent}>
                        <i className="fas fa-plus"></i> Nuevo Evento
                    </button>
                )}
            </div>

            {loading ? (
                <p>Cargando eventos...</p>
            ) : Object.keys(eventosPorFecha).length === 0 ? (
                <p>No hay eventos programados</p>
            ) : (
                <div className="eventos-list">
                    {Object.entries(eventosPorFecha)
                        .sort((a, b) => new Date(a[0]) - new Date(b[0]))
                        .map(([fecha, eventosFecha]) => (
                            <div key={fecha} className="fecha-section">
                                <h3>{fecha}</h3>
                                <div className="eventos-grid">
                                    {eventosFecha.map((evento) => (
                                        <div key={evento.id} className="evento-card">
                                            <div className="evento-header">
                                                <h4>{evento.titulo}</h4>
                                                {evento.grado_seccion_nombre && (
                                                    <span className="grado-badge">
                                                        {evento.grado_seccion_nombre}
                                                    </span>
                                                )}
                                            </div>
                                            {evento.descripcion && (
                                                <p className="evento-descripcion">
                                                    {evento.descripcion}
                                                </p>
                                            )}
                                            <div className="evento-horario">
                                                <p>
                                                    <i className="fas fa-clock"></i>{' '}
                                                    {evento.hora_inicio} - {evento.hora_fin}
                                                </p>
                                            </div>
                                            {puedeEditar && (
                                                <div className="evento-actions">
                                                    <button
                                                        className="btn-edit"
                                                        onClick={() => handleEdit(evento)}
                                                    >
                                                        <i className="fas fa-edit"></i> Editar
                                                    </button>
                                                    {user?.rol === 'admin' && (
                                                        <button
                                                            className="btn-delete"
                                                            onClick={() =>
                                                                handleDelete(evento.id)
                                                            }
                                                        >
                                                            <i className="fas fa-trash"></i>{' '}
                                                            Eliminar
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                </div>
            )}

            {/* Modal para crear/editar evento */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>{editingEvent ? 'Editar Evento' : 'Nuevo Evento'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Título:</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.titulo}
                                    onChange={(e) =>
                                        setFormData({ ...formData, titulo: e.target.value })
                                    }
                                />
                            </div>
                            <div className="form-group">
                                <label>Descripción:</label>
                                <textarea
                                    value={formData.descripcion}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            descripcion: e.target.value,
                                        })
                                    }
                                    rows="3"
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Fecha Inicio:</label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.fecha_inicio}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                fecha_inicio: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Fecha Fin:</label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.fecha_fin}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                fecha_fin: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Hora Inicio:</label>
                                    <input
                                        type="time"
                                        required
                                        value={formData.hora_inicio}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                hora_inicio: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Hora Fin:</label>
                                    <input
                                        type="time"
                                        required
                                        value={formData.hora_fin}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                hora_fin: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Grado/Sección (opcional):</label>
                                <select
                                    value={formData.grado_seccion}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            grado_seccion: e.target.value,
                                        })
                                    }
                                >
                                    <option value="">General (todos los grados)</option>
                                    {grados.map((grado) => (
                                        <option key={grado.id} value={grado.id}>
                                            {grado.grado} {grado.seccion} ({grado.nivel})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="modal-actions">
                                <button
                                    type="button"
                                    className="btn-cancel"
                                    onClick={() => setShowModal(false)}
                                >
                                    Cancelar
                                </button>
                                <button type="submit" className="btn-submit">
                                    {editingEvent ? 'Actualizar' : 'Guardar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

