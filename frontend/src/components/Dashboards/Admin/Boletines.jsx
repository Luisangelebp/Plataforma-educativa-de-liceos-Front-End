import { useState, useEffect } from 'react';
import axios from 'axios';
import './css/Listas.css';
import './css/Boletines.css';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000') + '/';

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
    // Si es FormData, NO establecer Content-Type manualmente
    // El navegador lo establecerá automáticamente con el boundary correcto
    if (config.data instanceof FormData) {
        config.headers = {
            ...config.headers,
            ...authHeaders,
            // NO incluir Content-Type - el navegador lo establecerá
        };
    } else {
        config.headers = {
            ...config.headers,
            ...authHeaders,
            'Content-Type': 'application/json',
        };
    }
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
    const [showVistaPreviaModal, setShowVistaPreviaModal] = useState(false);
    const [boletinVistaPrevia, setBoletinVistaPrevia] = useState(null);
    const [loadingVistaPrevia, setLoadingVistaPrevia] = useState(false);
    const [pdfUrl, setPdfUrl] = useState(null);
    const [plantillaAction, setPlantillaAction] = useState('subir'); // 'subir' o 'actualizar'
    const [filtroLapso, setFiltroLapso] = useState('');
    const [filtroGrado, setFiltroGrado] = useState('');
    const [filtroSeccion, setFiltroSeccion] = useState('');
    const [busquedaTexto, setBusquedaTexto] = useState('');
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
            // Filtrar solo estudiantes de primaria
            const estudiantesPrimaria = response.data.filter(est => 
                est.grado_seccion && est.grado_seccion.nivel === 'primaria'
            );
            setEstudiantes(estudiantesPrimaria);
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

    // Filtrar estudiantes
    const estudiantesFiltrados = estudiantes.filter(estudiante => {
        const matchGrado = !filtroGrado || (estudiante.grado_seccion && estudiante.grado_seccion.grado === filtroGrado);
        const matchSeccion = !filtroSeccion || (estudiante.grado_seccion && estudiante.grado_seccion.seccion === filtroSeccion);
        const matchTexto = !busquedaTexto || 
            estudiante.nombre?.toLowerCase().includes(busquedaTexto.toLowerCase()) ||
            estudiante.apellido?.toLowerCase().includes(busquedaTexto.toLowerCase()) ||
            estudiante.cedula?.toString().includes(busquedaTexto);

        return matchGrado && matchSeccion && matchTexto;
    });

    // Obtener grados únicos de primaria
    const gradosUnicos = [...new Set(estudiantes
        .filter(e => e.grado_seccion)
        .map(e => e.grado_seccion.grado)
        .filter(g => g))].sort();

    // Obtener secciones únicas
    const seccionesUnicas = [...new Set(estudiantes
        .filter(e => e.grado_seccion)
        .map(e => e.grado_seccion.seccion)
        .filter(s => s))].sort();

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

        // Verificar que el token esté presente
        const token = localStorage.getItem('accessToken');
        if (!token) {
            alert('No estás autenticado. Por favor, inicia sesión nuevamente.');
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
            if (error.response?.status === 401) {
                alert('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
            } else {
                alert(error.response?.data?.error || 'Error al gestionar la plantilla');
            }
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

    const handleVistaPrevia = async (boletinId) => {
        setLoadingVistaPrevia(true);
        setShowVistaPreviaModal(true);
        setPdfUrl(null);
        try {
            const response = await axiosInstance.get(`boletines/${boletinId}/`);
            setBoletinVistaPrevia(response.data);
            
            // Obtener el PDF como blob y crear una URL para el iframe
            try {
                const pdfResponse = await axiosInstance.get(
                    `boletines/${boletinId}/descargar/`,
                    {
                        responseType: 'blob',
                    }
                );
                const blob = new Blob([pdfResponse.data], { type: 'application/pdf' });
                const url = window.URL.createObjectURL(blob);
                setPdfUrl(url);
            } catch (pdfError) {
                console.error('Error al cargar el PDF:', pdfError);
                // Si falla, intentar usar la URL directa del archivo
                if (response.data.archivo_pdf) {
                    const directUrl = response.data.archivo_pdf.startsWith('http') 
                        ? response.data.archivo_pdf 
                        : `${API_URL}${response.data.archivo_pdf}`;
                    setPdfUrl(directUrl);
                }
            }
        } catch (error) {
            console.error('Error al cargar detalles del boletín:', error);
            alert('Error al cargar la información del boletín');
            setShowVistaPreviaModal(false);
        } finally {
            setLoadingVistaPrevia(false);
        }
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
                {/* Filtros */}
                <div style={{
                    display: 'flex',
                    gap: '0.75rem',
                    marginBottom: '1.5rem',
                    flexWrap: 'wrap',
                    padding: '1rem',
                    background: 'white',
                    borderRadius: '8px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                    <select
                        value={filtroGrado}
                        onChange={(e) => setFiltroGrado(e.target.value)}
                        style={{
                            padding: '0.5rem 1rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            fontSize: '0.875rem',
                            background: 'white',
                            minWidth: '150px'
                        }}
                    >
                        <option value="">Todos los grados</option>
                        {gradosUnicos.map(grado => (
                            <option key={grado} value={grado}>
                                {grado}° Grado
                            </option>
                        ))}
                    </select>

                    <select
                        value={filtroSeccion}
                        onChange={(e) => setFiltroSeccion(e.target.value)}
                        style={{
                            padding: '0.5rem 1rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            fontSize: '0.875rem',
                            background: 'white',
                            minWidth: 'px'
                        }}
                    >
                        <option value="">Todas las secciones</option>
                        {seccionesUnicas.map(seccion => (
                            <option key={seccion} value={seccion}>
                                Sección {seccion}
                            </option>
                        ))}
                    </select>

                    <input
                        type="text"
                        placeholder="Buscar estudiante..."
                        value={busquedaTexto}
                        onChange={(e) => setBusquedaTexto(e.target.value)}
                        style={{
                            padding: '0.5rem 1rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            fontSize: '0.875rem',
                            minWidth: '200px',
                            flex: 1
                        }}
                    />
                </div>

                <table className="boletines-table">
                    <thead>
                        <tr style={{
                            background: '#3b82f6',
                            color: 'white'
                        }}>
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
                        ) : estudiantesFiltrados.length === 0 ? (
                            <tr>
                                <td colSpan="6">No hay estudiantes que coincidan con los filtros</td>
                            </tr>
                        ) : (
                            estudiantesFiltrados.map((estudiante) => (
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
                                                    <div className="boletin-actions" style={{
                                                        display: 'flex',
                                                        gap: '6px',
                                                        justifyContent: 'center',
                                                        alignItems: 'center'
                                                    }}>
                                                        <button
                                                            onClick={() => handleVistaPrevia(boletin.id)}
                                                            title="Vista previa"
                                                            style={{
                                                                width: '32px',
                                                                height: '32px',
                                                                padding: '0',
                                                                margin: '0',
                                                                background: 'var(--primary)',
                                                                color: 'white',
                                                                border: 'none',
                                                                borderRadius: 'var(--border-radius-sm)',
                                                                cursor: 'pointer',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                transition: 'var(--transition)',
                                                                flexShrink: 0,
                                                                lineHeight: '1'
                                                            }}
                                                            onMouseEnter={(e) => {
                                                                e.currentTarget.style.background = '#0056b3';
                                                                e.currentTarget.style.transform = 'translateY(-2px)';
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                e.currentTarget.style.background = 'var(--primary)';
                                                                e.currentTarget.style.transform = 'translateY(0)';
                                                            }}
                                                        >
                                                            <i className="fas fa-eye" style={{
                                                                fontSize: '0.7rem',
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                lineHeight: '1',
                                                                margin: '0',
                                                                padding: '0'
                                                            }}></i>
                                                        </button>
                                                        <button
                                                            onClick={() => handleDownload(boletin)}
                                                            title="Descargar boletín"
                                                            style={{
                                                                width: '32px',
                                                                height: '32px',
                                                                padding: '0',
                                                                margin: '0',
                                                                background: 'var(--info)',
                                                                color: 'white',
                                                                border: 'none',
                                                                borderRadius: 'var(--border-radius-sm)',
                                                                cursor: 'pointer',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                transition: 'var(--transition)',
                                                                flexShrink: 0,
                                                                lineHeight: '1'
                                                            }}
                                                            onMouseEnter={(e) => {
                                                                e.currentTarget.style.background = '#3a7bd5';
                                                                e.currentTarget.style.transform = 'translateY(-2px)';
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                e.currentTarget.style.background = 'var(--info)';
                                                                e.currentTarget.style.transform = 'translateY(0)';
                                                            }}
                                                        >
                                                            <i className="fas fa-download" style={{
                                                                fontSize: '0.7rem',
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                lineHeight: '1',
                                                                margin: '0',
                                                                padding: '0'
                                                            }}></i>
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                handleUploadClick(
                                                                    estudiante,
                                                                    lapso.value
                                                                )
                                                            }
                                                            title="Editar boletín"
                                                            style={{
                                                                width: '32px',
                                                                height: '32px',
                                                                padding: '0',
                                                                margin: '0',
                                                                background: 'var(--warning)',
                                                                color: 'white',
                                                                border: 'none',
                                                                borderRadius: 'var(--border-radius-sm)',
                                                                cursor: 'pointer',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                transition: 'var(--transition)',
                                                                flexShrink: 0,
                                                                lineHeight: '1'
                                                            }}
                                                            onMouseEnter={(e) => {
                                                                e.currentTarget.style.background = '#e0a800';
                                                                e.currentTarget.style.transform = 'translateY(-2px)';
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                e.currentTarget.style.background = 'var(--warning)';
                                                                e.currentTarget.style.transform = 'translateY(0)';
                                                            }}
                                                        >
                                                            <i className="fas fa-edit" style={{
                                                                fontSize: '0.7rem',
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                lineHeight: '1',
                                                                margin: '0',
                                                                padding: '0'
                                                            }}></i>
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span style={{
                                                        color: 'var(--gray)',
                                                        fontSize: '0.85rem',
                                                        fontStyle: 'italic'
                                                    }}>
                                                        Sin boletín
                                                    </span>
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

            {/* Modal para editar boletín (solo para boletines existentes) */}
            {showUploadModal && selectedEstudiante && (
                <div className="modal" onClick={() => setShowUploadModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">Editar Boletín</h3>
                            <button className="close-modal" onClick={() => setShowUploadModal(false)}>&times;</button>
                        </div>
                        <div className="modal-body">
                            <div style={{marginBottom: '20px'}}>
                                <p style={{marginBottom: '8px', color: 'var(--gray)', fontSize: '0.9rem'}}>
                                    <strong>Estudiante:</strong> {selectedEstudiante.nombre} {selectedEstudiante.apellido}
                                </p>
                                <p style={{margin: 0, color: 'var(--gray)', fontSize: '0.9rem'}}>
                                    <strong>Lapso:</strong> {lapsoOptions.find((l) => l.value === uploadData.lapso)?.label}
                                </p>
                            </div>
                            <div className="form-group">
                                <label htmlFor="archivo_pdf" style={{fontSize: '0.95rem'}}>
                                    Reemplazar Archivo PDF *
                                </label>
                                <div style={{position: 'relative'}}>
                                    <i className="fas fa-file-pdf" style={{
                                        position: 'absolute',
                                        left: '15px',
                                        top: '15px',
                                        color: 'var(--gray)',
                                        fontSize: '0.8rem',
                                        zIndex: 1
                                    }}></i>
                                    <input
                                        type="file"
                                        id="archivo_pdf"
                                        accept=".pdf"
                                        onChange={handleFileChange}
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '12px 15px 12px 40px',
                                            border: '2px solid var(--light-gray)',
                                            borderRadius: 'var(--border-radius)',
                                            fontSize: '0.95rem',
                                            transition: 'var(--transition)',
                                            background: 'white',
                                            color: 'var(--dark)'
                                        }}
                                        onFocus={(e) => {
                                            e.currentTarget.style.borderColor = 'var(--primary)';
                                            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(67, 97, 238, 0.1)';
                                        }}
                                        onBlur={(e) => {
                                            e.currentTarget.style.borderColor = 'var(--light-gray)';
                                            e.currentTarget.style.boxShadow = 'none';
                                        }}
                                    />
                                </div>
                                <small style={{display: 'block', marginTop: '8px', color: 'var(--gray)', fontSize: '0.85rem'}}>
                                    Solo archivos PDF. El archivo actual será reemplazado.
                                </small>
                            </div>
                            <div style={{marginTop: '25px', display: 'flex', justifyContent: 'flex-end', gap: '12px'}}>
                                <button 
                                    type="button" 
                                    className="btn btn-secondary"
                                    onClick={() => setShowUploadModal(false)}
                                    style={{width: 'auto', padding: '12px 24px', fontSize: '0.9rem'}}
                                >
                                    Cancelar
                                </button>
                                <button 
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={handleUpload}
                                    style={{width: 'auto', padding: '12px 30px', fontSize: '0.9rem'}}
                                >
                                    Actualizar Boletín
                                </button>
                            </div>
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

            {/* Modal de Vista Previa del Boletín */}
            {showVistaPreviaModal && (
                <div className="modal-overlay" onClick={() => setShowVistaPreviaModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{
                        maxWidth: '95%',
                        width: '95%',
                        maxHeight: '95vh',
                        height: '95vh',
                        display: 'flex',
                        flexDirection: 'column',
                        padding: '0'
                    }}>
                        <div className="modal-header" style={{
                            padding: '12px 18px',
                            borderBottom: '1px solid var(--light-gray)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexShrink: 0
                        }}>
                            <h2 style={{margin: 0, fontSize: '1.1rem', fontWeight: '600', color: 'var(--dark)'}}>
                                <i className="fas fa-file-pdf" style={{marginRight: '8px', color: '#dc3545', fontSize: '0.9rem'}}></i>
                                Vista Previa del Boletín
                                {boletinVistaPrevia && (
                                    <span style={{
                                        marginLeft: '12px',
                                        fontSize: '0.75rem',
                                        fontWeight: '500',
                                        color: 'var(--gray)'
                                    }}>
                                        - {boletinVistaPrevia.estudiante_nombre} ({boletinVistaPrevia.lapso_display})
                                    </span>
                                )}
                            </h2>
                            <button
                                className="modal-close"
                                onClick={() => {
                                    if (pdfUrl && pdfUrl.startsWith('blob:')) {
                                        window.URL.revokeObjectURL(pdfUrl);
                                    }
                                    setShowVistaPreviaModal(false);
                                    setPdfUrl(null);
                                }}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    fontSize: '1.2rem',
                                    color: '#999',
                                    cursor: 'pointer',
                                    padding: '4px 8px',
                                    borderRadius: '6px',
                                    transition: 'all 0.3s'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = '#f0f0f0';
                                    e.currentTarget.style.color = '#333';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'none';
                                    e.currentTarget.style.color = '#999';
                                }}
                            >
                                ×
                            </button>
                        </div>
                        <div className="modal-body" style={{
                            padding: '0',
                            flex: 1,
                            overflow: 'hidden',
                            display: 'flex',
                            flexDirection: 'column'
                        }}>
                            {loadingVistaPrevia ? (
                                <div style={{
                                    textAlign: 'center',
                                    padding: '40px',
                                    color: 'var(--gray)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    height: '100%'
                                }}>
                                    <i className="fas fa-spinner fa-spin" style={{fontSize: '2rem', marginBottom: '10px'}}></i>
                                    <p>Cargando boletín...</p>
                                </div>
                            ) : boletinVistaPrevia && pdfUrl ? (
                                <iframe
                                    src={pdfUrl}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        border: 'none',
                                        flex: 1
                                    }}
                                    title="Vista previa del boletín"
                                ></iframe>
                            ) : boletinVistaPrevia && !pdfUrl ? (
                                <div style={{
                                    textAlign: 'center',
                                    padding: '40px',
                                    color: 'var(--gray)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    height: '100%'
                                }}>
                                    <i className="fas fa-spinner fa-spin" style={{fontSize: '2rem', marginBottom: '10px'}}></i>
                                    <p>Cargando PDF...</p>
                                </div>
                            ) : (
                                <div style={{
                                    textAlign: 'center',
                                    padding: '40px',
                                    color: 'var(--gray)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    height: '100%'
                                }}>
                                    <i className="fas fa-exclamation-triangle" style={{fontSize: '2rem', marginBottom: '10px', color: 'var(--warning)'}}></i>
                                    <p>No se encontró el archivo PDF del boletín</p>
                                </div>
                            )}
                        </div>
                        <div className="modal-footer" style={{
                            padding: '10px 18px',
                            borderTop: '1px solid var(--light-gray)',
                            display: 'flex',
                            justifyContent: 'flex-end',
                            gap: '8px',
                            flexShrink: 0
                        }}>
                            <button
                                onClick={() => {
                                    if (pdfUrl && pdfUrl.startsWith('blob:')) {
                                        window.URL.revokeObjectURL(pdfUrl);
                                    }
                                    setShowVistaPreviaModal(false);
                                    setPdfUrl(null);
                                }}
                                style={{
                                    padding: '6px 14px',
                                    background: '#f0f0f0',
                                    color: '#333',
                                    border: 'none',
                                    borderRadius: 'var(--border-radius)',
                                    cursor: 'pointer',
                                    fontSize: '0.8rem',
                                    fontWeight: '600',
                                    transition: 'var(--transition)'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = '#e0e0e0';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = '#f0f0f0';
                                }}
                            >
                                Cerrar
                            </button>
                            {boletinVistaPrevia && boletinVistaPrevia.archivo_pdf && (
                                <button
                                    onClick={() => {
                                        handleDownload(boletinVistaPrevia);
                                    }}
                                    style={{
                                        padding: '6px 14px',
                                        background: 'var(--primary)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: 'var(--border-radius)',
                                        cursor: 'pointer',
                                        fontSize: '0.8rem',
                                        fontWeight: '600',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        transition: 'var(--transition)'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = 'var(--primary-dark)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'var(--primary)';
                                    }}
                                >
                                    <i className="fas fa-download" style={{fontSize: '0.7rem'}}></i>
                                    Descargar Boletín
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
