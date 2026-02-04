import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNotification } from '../../../context/NotificationContext';

const API_URL = 'http://localhost:8000/';

// Modal para ver detalles del estudiante
const DetailModal = ({ user, isOpen, onClose }) => {
    if (!isOpen || !user) return null;
    console.log(user);
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="modal-container"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal-header">
                    <h3>Detalles del Estudiante</h3>
                    <button
                        className="close-btn"
                        onClick={onClose}
                        title="Cerrar"
                    >
                        &times;
                    </button>
                </div>
                <div className="modal-body">
                    <div className="detail-section">
                        {user.foto && (
                            <div className="detail-photo">
                                <img
                                    src={
                                        user.foto.startsWith('http')
                                            ? user.foto
                                            : `${API_URL}${user.foto}`
                                    }
                                    alt={`${user.nombre} ${user.apellido}`}
                                />
                            </div>
                        )}
                        <div className="detail-info">
                            <div className="detail-item">
                                <strong>Nombre:</strong>
                                <span>
                                    {user.nombre} {user.apellido}
                                </span>
                            </div>
                            <div className="detail-item">
                                <strong>Cédula:</strong>
                                <span>{user.cedula || 'N/A'}</span>
                            </div>
                            <div className="detail-item">
                                <strong>Edad:</strong>
                                <span>
                                    {user.edad ? `${user.edad} años` : 'N/A'}
                                </span>
                            </div>
                            <div className="detail-item">
                                <strong>Grado:</strong>
                                <span>{user.grado_seccion.grado || 'N/A'}</span>
                            </div>
                            <div className="detail-item">
                                <strong>Sección:</strong>
                                <span>
                                    {user.grado_seccion.seccion || 'N/A'}
                                </span>
                            </div>
                            <div className="detail-item">
                                <strong>Nivel:</strong>
                                <span>{user.grado_seccion.nivel || 'N/A'}</span>
                            </div>
                            <div className="detail-item">
                                <strong>Representante:</strong>
                                <span>
                                    {user.representante_nombre || 'Sin asignar'}
                                </span>
                            </div>
                            <div className="detail-item">
                                <strong>Dirección:</strong>
                                <span>{user.direccion || 'N/A'}</span>
                            </div>
                            <div className="detail-item">
                                <strong>Teléfono:</strong>
                                <span>{user.telefono || 'N/A'}</span>
                            </div>
                        </div>
                    </div>
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

// Componente de fila de estudiante
const EstudianteRow = ({ user, onRowClick }) => {
    console.log(user);
    return (
        <tr onClick={() => onRowClick(user)} className="user-row">
            <td>
                <div className="user-photo-wrapper">
                    <img
                        src={
                            user.foto
                                ? user.foto.startsWith('http')
                                    ? user.foto
                                    : `${API_URL}${user.foto}`
                                : 'https://via.placeholder.com/50'
                        }
                        alt={user.nombre}
                        className="user-avatar"
                    />
                </div>
            </td>
            <td className="user-name">
                {user.nombre} {user.apellido}
            </td>
            <td>{user.grado_seccion.grado || 'N/A'}</td>
            <td>{user.grado_seccion.seccion || 'N/A'}</td>
            <td>{user.grado_seccion.nivel || 'N/A'}</td>
            <td>{user.edad ? `${user.edad} años` : 'N/A'}</td>
            <td>{user.representante_nombre || 'Sin asignar'}</td>
        </tr>
    );
};

// Componente principal
export function ListaEstudiantesProfesor() {
    const { addNotification } = useNotification();
    const [estudiantes, setEstudiantes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [filtros, setFiltros] = useState({
        nivel: '',
        grado: '',
        seccion: '',
    });
    const [profesorInfo, setProfesorInfo] = useState(null);

    useEffect(() => {
        fetchProfesorInfo();
    }, []);

    useEffect(() => {
        if (profesorInfo) {
            fetchEstudiantes();
        }
    }, [profesorInfo, filtros]);

    const fetchProfesorInfo = async () => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            if (user && user.id) {
                // Usar el nuevo endpoint de perfil
                const response = await axios.get(
                    `${API_URL}usuarios/profesor/perfil/`,
                );
                setProfesorInfo(response.data);
            }
        } catch (error) {
            console.error('Error al cargar información del profesor:', error);
            addNotification(
                'Error al cargar la información del profesor',
                'error',
            );
        }
    };

    const fetchEstudiantes = async () => {
        try {
            setLoading(true);

            // Obtener las secciones del profesor
            const gradoSeccionesIds =
                profesorInfo?.grado_secciones?.map((gs) => gs.id) || [];

            if (gradoSeccionesIds.length === 0) {
                setEstudiantes([]);
                return;
            }

            // Construir parámetros de consulta
            let params = new URLSearchParams();

            // Filtrar por las secciones del profesor
            gradoSeccionesIds.forEach((id) => {
                params.append('grado_seccion_id', id);
            });

            // Agregar filtros adicionales si existen
            if (filtros.nivel) params.append('nivel', filtros.nivel);
            if (filtros.grado) params.append('grado', filtros.grado);
            if (filtros.seccion) params.append('seccion', filtros.seccion);

            const response = await axios.get(
                `${API_URL}usuarios/estudiante/?${params.toString()}`,
            );
            setEstudiantes(response.data);
        } catch (error) {
            console.error('Error al cargar estudiantes:', error);
            addNotification('Error al cargar la lista de estudiantes', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleCardClick = (user) => {
        setSelectedUser(user);
        setShowDetailModal(true);
    };

    const handleGenerarPDF = async () => {
        try {
            // Obtener las secciones del profesor
            const gradoSeccionesIds =
                profesorInfo?.grado_secciones?.map((gs) => gs.id) || [];

            if (gradoSeccionesIds.length === 0) {
                addNotification('No tienes secciones asignadas', 'warning');
                return;
            }

            // Construir parámetros para el PDF
            let params = new URLSearchParams();

            // Agregar todas las secciones del profesor
            gradoSeccionesIds.forEach((id) => {
                params.append('grado_seccion_id', id);
            });

            // Agregar filtros si existen
            if (filtros.nivel) params.append('nivel', filtros.nivel);
            if (filtros.grado) params.append('grado', filtros.grado);
            if (filtros.seccion) params.append('seccion', filtros.seccion);

            // Descargar el PDF
            const response = await axios.get(
                `${API_URL}usuarios/estudiante/pdf/?${params.toString()}`,
                { responseType: 'blob' },
            );

            // Crear enlace de descarga
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'lista_estudiantes.pdf');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Error al generar PDF:', error);
            addNotification('Error al generar el PDF', 'error');
        }
    };

    const handleFiltroChange = (e) => {
        const { name, value } = e.target;
        setFiltros((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const limpiarFiltros = () => {
        setFiltros({
            nivel: '',
            grado: '',
            seccion: '',
        });
    };

    // Obtener valores únicos para los filtros
    const seccionesProfesor = profesorInfo?.grado_secciones || [];
    const nivelesUnicos = [...new Set(seccionesProfesor.map((gs) => gs.nivel))];
    const gradosUnicos = [...new Set(seccionesProfesor.map((gs) => gs.grado))];
    const seccionesUnicas = [
        ...new Set(seccionesProfesor.map((gs) => gs.seccion)),
    ];

    if (loading && !profesorInfo) {
        return <div className="loading">Cargando información...</div>;
    }

    return (
        <div className="listas-container">
            <div className="listas-header">
                <h1>Mis Estudiantes</h1>
                <button
                    className="btn-add"
                    onClick={handleGenerarPDF}
                    title="Generar PDF de la lista de estudiantes"
                >
                    <i className="fas fa-file-pdf"></i> Generar PDF
                </button>
            </div>

            {/* Filtros */}
            <div
                className="filtros-container"
                style={{
                    marginBottom: '20px',
                    padding: '15px',
                    backgroundColor: '#f5f5f5',
                    borderRadius: '8px',
                    display: 'flex',
                    gap: '10px',
                    alignItems: 'end',
                    flexWrap: 'wrap',
                }}
            >
                <div style={{ flex: '1', minWidth: '150px' }}>
                    <label
                        style={{
                            display: 'block',
                            marginBottom: '5px',
                            fontWeight: 'bold',
                        }}
                    >
                        Nivel:
                    </label>
                    <select
                        name="nivel"
                        value={filtros.nivel}
                        onChange={handleFiltroChange}
                        style={{
                            width: '100%',
                            padding: '8px',
                            borderRadius: '4px',
                            border: '1px solid #ccc',
                        }}
                    >
                        <option value="">Todos</option>
                        {nivelesUnicos.map((nivel) => (
                            <option key={nivel} value={nivel}>
                                {nivel.charAt(0).toUpperCase() + nivel.slice(1)}
                            </option>
                        ))}
                    </select>
                </div>

                <div style={{ flex: '1', minWidth: '150px' }}>
                    <label
                        style={{
                            display: 'block',
                            marginBottom: '5px',
                            fontWeight: 'bold',
                        }}
                    >
                        Grado/Año:
                    </label>
                    <select
                        name="grado"
                        value={filtros.grado}
                        onChange={handleFiltroChange}
                        style={{
                            width: '100%',
                            padding: '8px',
                            borderRadius: '4px',
                            border: '1px solid #ccc',
                        }}
                    >
                        <option value="">Todos</option>
                        {gradosUnicos.map((grado) => (
                            <option key={grado} value={grado}>
                                {grado}°
                            </option>
                        ))}
                    </select>
                </div>

                <div style={{ flex: '1', minWidth: '150px' }}>
                    <label
                        style={{
                            display: 'block',
                            marginBottom: '5px',
                            fontWeight: 'bold',
                        }}
                    >
                        Sección:
                    </label>
                    <select
                        name="seccion"
                        value={filtros.seccion}
                        onChange={handleFiltroChange}
                        style={{
                            width: '100%',
                            padding: '8px',
                            borderRadius: '4px',
                            border: '1px solid #ccc',
                        }}
                    >
                        <option value="">Todas</option>
                        {seccionesUnicas.map((seccion) => (
                            <option key={seccion} value={seccion}>
                                {seccion}
                            </option>
                        ))}
                    </select>
                </div>

                <button
                    onClick={limpiarFiltros}
                    style={{
                        padding: '8px 16px',
                        backgroundColor: '#6c757d',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                    }}
                >
                    Limpiar Filtros
                </button>
            </div>

            <div className="table-container">
                {loading ? (
                    <div className="loading">Cargando estudiantes...</div>
                ) : estudiantes.length === 0 ? (
                    <p className="no-data">
                        {seccionesProfesor.length === 0
                            ? 'No tienes secciones asignadas'
                            : 'No hay estudiantes en tus secciones'}
                    </p>
                ) : (
                    <>
                        <div style={{ marginBottom: '10px', color: '#666' }}>
                            <strong>Total de estudiantes:</strong>{' '}
                            {estudiantes.length}
                        </div>
                        <div className="table-container">
                            <table className="users-table">
                                <thead>
                                    <tr>
                                        <th>Foto</th>
                                        <th>Nombre</th>
                                        <th>Grado</th>
                                        <th>Sección</th>
                                        <th>Nivel</th>
                                        <th>Edad</th>
                                        <th>Representante</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {estudiantes.map((estudiante) => (
                                        <EstudianteRow
                                            key={estudiante.id}
                                            user={estudiante}
                                            onRowClick={handleCardClick}
                                        />
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>

            <DetailModal
                user={selectedUser}
                isOpen={showDetailModal}
                onClose={() => {
                    setShowDetailModal(false);
                    setSelectedUser(null);
                }}
            />
        </div>
    );
}
