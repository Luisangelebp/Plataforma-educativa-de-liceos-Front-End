import { useState, useEffect } from 'react';
import axios from 'axios';
import './css/Listas.css';
import './css/Boletines.css';

const API_URL = 'http://localhost:8000/';

// Función para obtener el token actual
const getAuthHeaders = () => {
    const token = localStorage.getItem('accessToken');
    return {
        'Authorization': token ? `Bearer ${token}` : '',
    };
};

const axiosInstance = axios.create({
    baseURL: API_URL,
});

// Interceptor para agregar el token en cada petición
axiosInstance.interceptors.request.use((config) => {
    const authHeaders = getAuthHeaders();
    config.headers = {
        ...config.headers,
        ...authHeaders,
        'Content-Type': 'application/json',
    };
    return config;
});

const axiosInstanceFile = axios.create({
    baseURL: API_URL,
});

// Interceptor para archivos
axiosInstanceFile.interceptors.request.use((config) => {
    const authHeaders = getAuthHeaders();
    config.headers = {
        ...config.headers,
        ...authHeaders,
        'Content-Type': 'multipart/form-data',
    };
    return config;
});

export function Boletines() {
    const [estudiantes, setEstudiantes] = useState([]);
    const [boletines, setBoletines] = useState([]);
    const [plantillas, setPlantillas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedEstudiante, setSelectedEstudiante] = useState(null);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showPlantillaModal, setShowPlantillaModal] = useState(false);
    const [showDescargarPlantillaModal, setShowDescargarPlantillaModal] = useState(false);
    const [showGestionarPlantillasModal, setShowGestionarPlantillasModal] = useState(false);
    const [plantillaAction, setPlantillaAction] = useState('subir'); // 'subir' o 'actualizar'
    const [uploadData, setUploadData] = useState({
        estudiante: null,
        lapso: '1',
        archivo_pdf: null,
    });
    const [plantillaData, setPlantillaData] = useState({
        periodo: '1',
        archivo_word: null,
    });

    useEffect(() => {
        cargarEstudiantes();
        cargarBoletines();
        cargarPlantillas();
    }, []);

    const cargarEstudiantes = async () => {
        try {
            const response = await axiosInstance.get('usuarios/estudiante/');
            setEstudiantes(response.data);
        } catch (error) {
            console.error('Error al cargar estudiantes:', error);
        }
    };

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

    const cargarPlantillas = async () => {
        try {
            const response = await axiosInstance.get('boletines/plantillas/');
            setPlantillas(response.data);
        } catch (error) {
            console.error('Error al cargar plantillas:', error);
        }
    };

    const getBoletinPorEstudiante = (estudianteId, lapso) => {
        return boletines.find(
            (b) => b.estudiante === estudianteId && b.lapso === lapso
        );
    };

    const handleUploadClick = (estudiante, lapso = '1') => {
        const boletinExistente = getBoletinPorEstudiante(estudiante.id, lapso);
        setUploadData({
            estudiante: estudiante.id,
            lapso: lapso,
            archivo_pdf: null,
        });
        setSelectedEstudiante({ ...estudiante, lapso, boletinExistente });
        setShowUploadModal(true);
    };

    const handleFileChange = (e) => {
        setUploadData({
            ...uploadData,
            archivo_pdf: e.target.files[0],
        });
    };

    const handleUpload = async () => {
        if (!uploadData.archivo_pdf) {
            alert('Por favor selecciona un archivo PDF');
            return;
        }

        const formData = new FormData();
        formData.append('estudiante', uploadData.estudiante);
        formData.append('lapso', uploadData.lapso);
        formData.append('archivo_pdf', uploadData.archivo_pdf);

        try {
            if (selectedEstudiante.boletinExistente) {
                // Actualizar boletín existente
                await axiosInstanceFile.put(
                    `boletines/${selectedEstudiante.boletinExistente.id}/`,
                    formData
                );
            } else {
                // Crear nuevo boletín
                await axiosInstanceFile.post('boletines/', formData);
            }
            alert('Boletín subido exitosamente');
            setShowUploadModal(false);
            cargarBoletines();
        } catch (error) {
            console.error('Error al subir boletín:', error);
            alert('Error al subir el boletín');
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
            link.setAttribute('download', `boletin_${boletin.estudiante_cedula}_${boletin.lapso}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Error al descargar boletín:', error);
            alert('Error al descargar el boletín');
        }
    };

    const lapsoOptions = [
        { value: '1', label: 'Primer Lapso' },
        { value: '2', label: 'Segundo Lapso' },
        { value: '3', label: 'Tercer Lapso' },
    ];

    // Funciones para gestión de plantillas
    const handleSubirPlantilla = () => {
        setPlantillaAction('subir');
        setPlantillaData({ periodo: '1', archivo_word: null });
        setShowPlantillaModal(true);
    };

    const handleActualizarPlantilla = () => {
        setPlantillaAction('actualizar');
        setPlantillaData({ periodo: '1', archivo_word: null });
        setShowPlantillaModal(true);
    };

    const handlePlantillaFileChange = (e) => {
        setPlantillaData({
            ...plantillaData,
            archivo_word: e.target.files[0],
        });
    };

    const handlePlantillaSubmit = async () => {
        if (!plantillaData.archivo_word) {
            alert('Por favor selecciona un archivo Word');
            return;
        }

        const formData = new FormData();
        formData.append('periodo', plantillaData.periodo);
        formData.append('archivo_word', plantillaData.archivo_word);
        formData.append('activa', 'true'); // Asegurar que siempre esté activa

        try {
            // Verificar si ya existe una plantilla para este periodo
            const plantillaExistente = plantillas.find(
                (p) => p.periodo === plantillaData.periodo && !p.grado_seccion
            );

            if (plantillaExistente && plantillaAction === 'actualizar') {
                // Actualizar plantilla existente
                await axiosInstanceFile.put(
                    `boletines/plantillas/${plantillaExistente.id}/`,
                    formData
                );
                alert('Plantilla actualizada exitosamente');
            } else {
                // Crear nueva plantilla
                await axiosInstanceFile.post('boletines/plantillas/', formData);
                alert('Plantilla subida exitosamente');
            }
            
            setShowPlantillaModal(false);
            cargarPlantillas();
        } catch (error) {
            console.error('Error al gestionar plantilla:', error);
            alert(error.response?.data?.error || 'Error al gestionar la plantilla');
        }
    };

    const handleDescargarPlantilla = async (periodo) => {
        try {
            const plantilla = plantillas.find(
                (p) => p.periodo === periodo && !p.grado_seccion
            );

            if (!plantilla) {
                alert(`No hay plantilla disponible para el ${lapsoOptions[parseInt(periodo) - 1].label}`);
                return;
            }

            const response = await axiosInstance.get(
                `boletines/plantillas/${plantilla.id}/descargar/`,
                { responseType: 'blob' }
            );

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `plantilla_lapso_${periodo}.docx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Error al descargar plantilla:', error);
            alert('Error al descargar la plantilla');
        }
    };

    const getPlantillaPorPeriodo = (periodo) => {
        return plantillas.find((p) => p.periodo === periodo && !p.grado_seccion);
    };

    const handleEliminarPlantilla = async (plantillaId, periodo) => {
        const periodoNombre = lapsoOptions.find(l => l.value === periodo)?.label || 'este periodo';
        
        if (!window.confirm(`¿Está seguro de eliminar la plantilla del ${periodoNombre}?`)) {
            return;
        }

        try {
            await axiosInstance.delete(`boletines/plantillas/${plantillaId}/`);
            alert('Plantilla eliminada exitosamente');
            cargarPlantillas();
        } catch (error) {
            console.error('Error al eliminar plantilla:', error);
            alert('Error al eliminar la plantilla');
        }
    };

    return (
        <div className="container-boletines">
            <div className="boletines-header">
                <h1>Gestión de Boletines</h1>
                <div className="plantillas-buttons">
                    <button
                        className="btn-plantilla btn-subir"
                        onClick={handleSubirPlantilla}
                        title="Subir nueva plantilla"
                    >
                        <i className="fas fa-upload"></i> Subir Plantilla
                    </button>
                    <button
                        className="btn-plantilla btn-actualizar"
                        onClick={handleActualizarPlantilla}
                        title="Actualizar plantilla existente"
                    >
                        <i className="fas fa-sync-alt"></i> Actualizar Plantilla
                    </button>
                    <button
                        className="btn-plantilla btn-gestionar"
                        onClick={() => setShowGestionarPlantillasModal(true)}
                        title="Ver y gestionar plantillas"
                    >
                        <i className="fas fa-list"></i> Gestionar Plantillas
                    </button>
                </div>
            </div>

            <div className="table-container">
                <table className="boletines-table">
                    <thead>
                        <tr>
                            <th>Estudiante</th>
                            <th>Cédula</th>
                            <th>Grado/Sección</th>
                            <th>Primer Lapso</th>
                            <th>Segundo Lapso</th>
                            <th>Tercer Lapso</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="6">Cargando...</td>
                            </tr>
                        ) : estudiantes.length === 0 ? (
                            <tr>
                                <td colSpan="6">No hay estudiantes registrados</td>
                            </tr>
                        ) : (
                            estudiantes.map((estudiante) => (
                                <tr key={estudiante.id}>
                                    <td>
                                        {estudiante.nombre} {estudiante.apellido}
                                    </td>
                                    <td>{estudiante.cedula || '—'}</td>
                                    <td>
                                        {estudiante.grado_seccion
                                            ? `${estudiante.grado_seccion.grado} ${estudiante.grado_seccion.seccion}`
                                            : '—'}
                                    </td>
                                    {lapsoOptions.map((lapso) => {
                                        const boletin = getBoletinPorEstudiante(
                                            estudiante.id,
                                            lapso.value
                                        );
                                        return (
                                            <td key={lapso.value}>
                                                {boletin ? (
                                                    <div className="boletin-actions">
                                                        <button
                                                            className="btn-download"
                                                            onClick={() =>
                                                                handleDownload(boletin)
                                                            }
                                                            title="Descargar"
                                                        >
                                                            <i className="fas fa-download"></i>
                                                        </button>
                                                        <button
                                                            className="btn-upload"
                                                            onClick={() =>
                                                                handleUploadClick(
                                                                    estudiante,
                                                                    lapso.value
                                                                )
                                                            }
                                                            title="Editar/Reemplazar"
                                                        >
                                                            <i className="fas fa-edit"></i>
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        className="btn-upload"
                                                        onClick={() =>
                                                            handleUploadClick(
                                                                estudiante,
                                                                lapso.value
                                                            )
                                                        }
                                                    >
                                                        <i className="fas fa-upload"></i> Subir
                                                    </button>
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal para subir boletín */}
            {showUploadModal && (
                <div className="modal-overlay" onClick={() => setShowUploadModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>
                                {selectedEstudiante.boletinExistente
                                    ? 'Actualizar Boletín'
                                    : 'Subir Boletín'}
                            </h2>
                            <button
                                className="modal-close"
                                onClick={() => setShowUploadModal(false)}
                            >
                                ×
                            </button>
                        </div>
                        <p>
                            Estudiante: {selectedEstudiante.nombre}{' '}
                            {selectedEstudiante.apellido}
                        </p>
                        <p>
                            Lapso:{' '}
                            {lapsoOptions.find((l) => l.value === uploadData.lapso)?.label}
                        </p>
                        <div className="form-group">
                            <label>Archivo PDF:</label>
                            <input
                                type="file"
                                accept=".pdf"
                                onChange={handleFileChange}
                            />
                        </div>
                        <div className="modal-actions">
                            <button
                                className="btn-cancel"
                                onClick={() => setShowUploadModal(false)}
                            >
                                Cancelar
                            </button>
                            <button className="btn-submit" onClick={handleUpload}>
                                {selectedEstudiante.boletinExistente
                                    ? 'Actualizar'
                                    : 'Subir'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal para subir/actualizar plantilla */}
            {showPlantillaModal && (
                <div className="modal-overlay" onClick={() => setShowPlantillaModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>
                                {plantillaAction === 'subir'
                                    ? 'Subir Plantilla de Boletín'
                                    : 'Actualizar Plantilla de Boletín'}
                            </h2>
                            <button
                                className="modal-close"
                                onClick={() => setShowPlantillaModal(false)}
                            >
                                ×
                            </button>
                        </div>
                        <div className="form-group">
                            <label>Seleccionar nuevo archivo Word:</label>
                            <input
                                type="file"
                                accept=".doc,.docx"
                                onChange={handlePlantillaFileChange}
                            />
                            {plantillaData.archivo_word && (
                                <p className="file-name">
                                    <i className="fas fa-file-word"></i>{' '}
                                    {plantillaData.archivo_word.name}
                                </p>
                            )}
                        </div>
                        <div className="form-group">
                            <label>Seleccionar Lapso:</label>
                            <select
                                value={plantillaData.periodo}
                                onChange={(e) =>
                                    setPlantillaData({
                                        ...plantillaData,
                                        periodo: e.target.value,
                                    })
                                }
                            >
                                <option value="">Seleccione un lapso</option>
                                {lapsoOptions.map((lapso) => (
                                    <option key={lapso.value} value={lapso.value}>
                                        {lapso.label}
                                    </option>
                                ))}
                            </select>
                            {plantillaAction === 'actualizar' &&
                                getPlantillaPorPeriodo(plantillaData.periodo) && (
                                    <p className="info-text">
                                        <i className="fas fa-info-circle"></i> Ya
                                        existe una plantilla para este lapso. Se
                                        actualizará.
                                    </p>
                                )}
                        </div>
                        <div className="modal-actions">
                            <button
                                className="btn-cancel"
                                onClick={() => setShowPlantillaModal(false)}
                            >
                                Cancelar
                            </button>
                            <button
                                className="btn-submit"
                                onClick={handlePlantillaSubmit}
                            >
                                {plantillaAction === 'subir' ? 'Subir' : 'Actualizar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal para gestionar plantillas */}
            {showGestionarPlantillasModal && (
                <div
                    className="modal-overlay"
                    onClick={() => setShowGestionarPlantillasModal(false)}
                >
                    <div className="modal-content modal-content-large" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Gestionar Plantillas de Boletín</h2>
                            <button
                                className="modal-close"
                                onClick={() => setShowGestionarPlantillasModal(false)}
                            >
                                ×
                            </button>
                        </div>
                        
                        {plantillas.length > 0 ? (
                            <div className="plantillas-modal-grid">
                                {plantillas.map((plantilla) => (
                                    <div key={plantilla.id} className="plantilla-modal-card">
                                        <div className="plantilla-modal-header">
                                            <div className="plantilla-info-left">
                                                <i className="fas fa-file-word" style={{ fontSize: '1.5rem', color: '#2b579a' }}></i>
                                                <div>
                                                    <h3>
                                                        {lapsoOptions.find(l => l.value === plantilla.periodo)?.label || `Periodo ${plantilla.periodo}`}
                                                    </h3>
                                                    <p className="plantilla-subtexto">
                                                        {plantilla.grado_seccion_nombre || 'General (todos los grados)'}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className="plantilla-fecha-badge">
                                                <i className="fas fa-calendar"></i> {new Date(plantilla.fecha_subida).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className="plantilla-modal-acciones">
                                            <button
                                                className="btn-modal-accion btn-descargar"
                                                onClick={() => handleDescargarPlantilla(plantilla.periodo)}
                                                title="Descargar"
                                            >
                                                <i className="fas fa-download"></i>
                                            </button>
                                            <button
                                                className="btn-modal-accion btn-eliminar"
                                                onClick={() => {
                                                    handleEliminarPlantilla(plantilla.id, plantilla.periodo);
                                                    if (plantillas.length === 1) {
                                                        setShowGestionarPlantillasModal(false);
                                                    }
                                                }}
                                                title="Eliminar"
                                            >
                                                <i className="fas fa-trash"></i>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="no-plantillas-message">
                                <i className="fas fa-folder-open" style={{ fontSize: '3rem', color: '#ccc' }}></i>
                                <p>No hay plantillas subidas aún</p>
                                <button
                                    className="btn-submit"
                                    onClick={() => {
                                        setShowGestionarPlantillasModal(false);
                                        handleSubirPlantilla();
                                    }}
                                >
                                    <i className="fas fa-upload"></i> Subir Primera Plantilla
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
