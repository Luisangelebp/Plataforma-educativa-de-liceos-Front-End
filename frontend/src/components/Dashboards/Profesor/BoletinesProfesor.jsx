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

const axiosInstanceFile = axios.create({
    baseURL: API_URL,
});

axiosInstanceFile.interceptors.request.use((config) => {
    const authHeaders = getAuthHeaders();
    config.headers = {
        ...config.headers,
        ...authHeaders,
        'Content-Type': 'multipart/form-data',
    };
    return config;
});

export function BoletinesProfesor() {
    const [plantillas, setPlantillas] = useState([]);
    const [estudiantes, setEstudiantes] = useState([]);
    const [boletines, setBoletines] = useState([]);
    const [selectedPeriodo, setSelectedPeriodo] = useState('1');
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [selectedEstudiante, setSelectedEstudiante] = useState(null);
    const [uploadData, setUploadData] = useState({
        estudiante: null,
        lapso: '1',
        archivo_pdf: null,
    });

    useEffect(() => {
        cargarPlantillas();
        cargarEstudiantes();
        cargarBoletines();
    }, [selectedPeriodo]);

    const cargarPlantillas = async () => {
        try {
            const response = await axiosInstance.get(
                `boletines/plantillas/periodo/${selectedPeriodo}/`
            );
            setPlantillas(response.data);
        } catch (error) {
            console.error('Error al cargar plantillas:', error);
        }
    };

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
        } catch (error) {
            console.error('Error al cargar boletines:', error);
        }
    };

    const descargarPlantilla = async (plantillaId) => {
        try {
            const response = await axiosInstance.get(
                `boletines/plantillas/${plantillaId}/descargar/`,
                {
                    responseType: 'blob',
                }
            );
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `plantilla_lapso_${selectedPeriodo}.docx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Error al descargar plantilla:', error);
            alert('Error al descargar la plantilla');
        }
    };

    const handleUploadClick = (estudiante, lapso = selectedPeriodo) => {
        const boletinExistente = boletines.find(
            (b) => b.estudiante === estudiante.id && b.lapso === lapso
        );
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
                await axiosInstanceFile.put(
                    `boletines/${selectedEstudiante.boletinExistente.id}/`,
                    formData
                );
            } else {
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

    const lapsoOptions = [
        { value: '1', label: 'Primer Lapso' },
        { value: '2', label: 'Segundo Lapso' },
        { value: '3', label: 'Tercer Lapso' },
    ];

    return (
        <div className="container-boletines-profesor">
            <h1>Gestión de Boletines - Profesor</h1>

            <div className="plantillas-section">
                <h2>Plantillas Disponibles</h2>
                <div className="periodo-selector">
                    <label>Periodo:</label>
                    <select
                        value={selectedPeriodo}
                        onChange={(e) => setSelectedPeriodo(e.target.value)}
                    >
                        {lapsoOptions.map((lapso) => (
                            <option key={lapso.value} value={lapso.value}>
                                {lapso.label}
                            </option>
                        ))}
                    </select>
                </div>

                {plantillas.length > 0 ? (
                    <div className="plantillas-list">
                        {plantillas.map((plantilla) => (
                            <div key={plantilla.id} className="plantilla-card">
                                <div className="plantilla-info">
                                    <i className="fas fa-file-word" style={{ fontSize: '2rem', color: '#2b579a', marginBottom: '10px' }}></i>
                                    <p className="plantilla-tipo">
                                        {plantilla.grado_seccion && plantilla.grado_seccion_nombre && 
                                         typeof plantilla.grado_seccion_nombre === 'string' &&
                                         !plantilla.grado_seccion_nombre.includes('method-wrapper')
                                            ? plantilla.grado_seccion_nombre
                                            : 'General (todos los grados)'}
                                    </p>
                                </div>
                                <button
                                    className="btn-download-plantilla-profesor"
                                    onClick={() => descargarPlantilla(plantilla.id)}
                                >
                                    <i className="fas fa-download"></i> Descargar Plantilla
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>No hay plantillas disponibles para este periodo</p>
                )}
            </div>

            <div className="estudiantes-section">
                <h2>Subir Boletines PDF</h2>
                <div className="table-container">
                    <table className="boletines-table">
                        <thead>
                            <tr>
                                <th>Estudiante</th>
                                <th>Cédula</th>
                                <th>Grado/Sección</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {estudiantes.map((estudiante) => {
                                const boletin = boletines.find(
                                    (b) =>
                                        b.estudiante === estudiante.id &&
                                        b.lapso === selectedPeriodo
                                );
                                return (
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
                                        <td>
                                            {boletin ? (
                                                <span className="status-completed">
                                                    ✓ Subido
                                                </span>
                                            ) : (
                                                <span className="status-pending">
                                                    Pendiente
                                                </span>
                                            )}
                                        </td>
                                        <td>
                                            <button
                                                className="btn-upload"
                                                onClick={() =>
                                                    handleUploadClick(
                                                        estudiante,
                                                        selectedPeriodo
                                                    )
                                                }
                                            >
                                                <i className="fas fa-upload"></i>{' '}
                                                {boletin ? 'Actualizar' : 'Subir PDF'}
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal para subir boletín */}
            {showUploadModal && (
                <div className="modal-overlay" onClick={() => setShowUploadModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>Subir Boletín PDF</h2>
                        <p>
                            Estudiante: {selectedEstudiante.nombre}{' '}
                            {selectedEstudiante.apellido}
                        </p>
                        <p>
                            Lapso:{' '}
                            {lapsoOptions.find((l) => l.value === uploadData.lapso)?.label}
                        </p>
                        <p className="info-text">
                            Nota: Descarga la plantilla Word, complétala, convierte a PDF y
                            súbelo aquí.
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
        </div>
    );
}

