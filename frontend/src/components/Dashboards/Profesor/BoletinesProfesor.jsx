import { useState, useEffect } from 'react';
import axios from 'axios';
import '../Admin/css/Boletines.css';

const API_URL = 'http://localhost:8000/';

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
    const [profesorId, setProfesorId] = useState(null);
    const [profesorInfo, setProfesorInfo] = useState(null);
    const [uploadData, setUploadData] = useState({
        estudiante: null,
        lapso: '1',
        archivo_pdf: null,
    });

    useEffect(() => {
        cargarDatosProfesor();
    }, []);

    useEffect(() => {
        if (profesorInfo) {
            cargarPlantillas();
            cargarEstudiantes();
            cargarBoletines();
        }
    }, [selectedPeriodo, profesorInfo]);

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

    const cargarDatosProfesor = async () => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            console.log('Usuario del localStorage:', user);
            if (user && user.id) {
                // Obtener el profesor usando el ID del usuario
                const response = await axiosInstance.get('usuarios/profesor/');
                console.log('Lista completa de profesores:', response.data);
                
                // Buscar el profesor - el campo usuario puede venir como objeto o como ID
                const profesor = response.data.find(p => {
                    const usuarioId = typeof p.usuario === 'object' ? p.usuario?.id : p.usuario;
                    // Convertir ambos a números para comparación segura
                    const usuarioIdNum = Number(usuarioId);
                    const userIdNum = Number(user.id);
                    console.log(`Comparando: usuarioId=${usuarioId} (${typeof usuarioId}) -> ${usuarioIdNum}, user.id=${user.id} (${typeof user.id}) -> ${userIdNum}`);
                    return usuarioIdNum === userIdNum;
                });
                
                if (profesor) {
                    console.log('Profesor encontrado:', profesor);
                    setProfesorId(profesor.id);
                    // Obtener información completa del profesor incluyendo grado_secciones
                    const profesorCompleto = await axiosInstance.get(`usuarios/profesor/${profesor.id}/`);
                    console.log('Información completa del profesor:', profesorCompleto.data);
                    setProfesorInfo(profesorCompleto.data);
                } else {
                    console.warn('No se encontró el profesor para el usuario:', user.id);
                    console.warn('Profesores disponibles:', response.data.map(p => ({
                        id: p.id,
                        usuario: p.usuario,
                        nombre: p.nombre
                    })));
                }
            }
        } catch (error) {
            console.error('Error al cargar datos del profesor:', error);
        }
    };

    const cargarEstudiantes = async () => {
        try {
            // Si el profesor no tiene grado_secciones asignados, no mostrar estudiantes
            if (!profesorInfo) {
                console.log('No hay información del profesor aún');
                setEstudiantes([]);
                return;
            }

            if (!profesorInfo.grado_secciones || profesorInfo.grado_secciones.length === 0) {
                console.log('El profesor no tiene grado_secciones asignados');
                setEstudiantes([]);
                return;
            }

            // Obtener los IDs de los grado_secciones del profesor
            const gradoSeccionesIds = profesorInfo.grado_secciones.map(gs => {
                if (typeof gs === 'object' && gs.id) {
                    return gs.id;
                }
                return gs;
            }).filter(id => id != null);

            console.log('IDs de grado_secciones del profesor:', gradoSeccionesIds);

            if (gradoSeccionesIds.length === 0) {
                console.log('No se pudieron extraer IDs válidos de grado_secciones');
                setEstudiantes([]);
                return;
            }

            // Construir parámetros de consulta para filtrar estudiantes por grado_seccion
            let params = new URLSearchParams();
            gradoSeccionesIds.forEach(id => {
                params.append('grado_seccion_id', id);
            });

            console.log('Parámetros de búsqueda:', params.toString());

            // Obtener estudiantes que pertenecen a los grado_secciones del profesor
            const url = `usuarios/estudiante/?${params.toString()}`;
            console.log('URL de búsqueda de estudiantes:', url);
            const response = await axiosInstance.get(url);
            console.log('Respuesta completa:', response);
            console.log('Estudiantes encontrados:', response.data?.length || 0, response.data);
            setEstudiantes(response.data || []);
        } catch (error) {
            console.error('Error al cargar estudiantes:', error);
            setEstudiantes([]);
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
            link.setAttribute(
                'download',
                `plantilla_lapso_${selectedPeriodo}.docx`
            );
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
        <div className="">
            <div className="header">
                <div
                    className="page-title"
                    style={{ width: '100%', textAlign: 'center' }}
                >
                    <h1 style={{ color: 'var(--dark)', margin: 0 }}>
                        Gestión de Boletines
                    </h1>
                    <p style={{ color: 'var(--gray)', margin: '8px 0 0 0' }}>
                        Sube y gestiona los boletines de tus estudiantes
                    </p>
                </div>
            </div>

            {/* Sección de Plantillas */}
            <div
                className="section-card"
                style={{
                    marginBottom: '30px',
                    maxWidth: '1200px',
                    margin: '0 auto 30px auto',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '20px',
                        paddingBottom: '15px',
                        borderBottom: '2px solid var(--light-gray)',
                    }}
                >
                    <h2
                        style={{
                            fontSize: '1.3rem',
                            fontWeight: '600',
                            color: 'var(--dark)',
                            margin: 0,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                        }}
                    >
                        <i
                            className="fas fa-file-word"
                            style={{ color: '#2b579a', fontSize: '1.2rem' }}
                        ></i>
                        Plantillas Disponibles
                    </h2>
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                        }}
                    >
                        <label
                            style={{
                                fontSize: '0.95rem',
                                fontWeight: '500',
                                color: 'var(--dark)',
                            }}
                        >
                            Periodo:
                        </label>
                        <select
                            value={selectedPeriodo}
                            onChange={(e) => setSelectedPeriodo(e.target.value)}
                            style={{
                                padding: '10px 15px',
                                border: '2px solid var(--light-gray)',
                                borderRadius: 'var(--border-radius)',
                                fontSize: '0.95rem',
                                background: 'white',
                                color: 'var(--dark)',
                                cursor: 'pointer',
                                transition: 'var(--transition)',
                                minWidth: '180px',
                            }}
                            onFocus={(e) => {
                                e.currentTarget.style.borderColor =
                                    'var(--primary)';
                                e.currentTarget.style.boxShadow =
                                    '0 0 0 3px rgba(67, 97, 238, 0.1)';
                            }}
                            onBlur={(e) => {
                                e.currentTarget.style.borderColor =
                                    'var(--light-gray)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        >
                            {lapsoOptions.map((lapso) => (
                                <option key={lapso.value} value={lapso.value}>
                                    {lapso.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {plantillas.length > 0 ? (
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns:
                                'repeat(auto-fill, minmax(280px, 1fr))',
                            gap: '20px',
                        }}
                    >
                        {plantillas.map((plantilla) => (
                            <div
                                key={plantilla.id}
                                style={{
                                    background: 'white',
                                    border: '2px solid var(--light-gray)',
                                    borderRadius: 'var(--border-radius)',
                                    padding: '20px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '15px',
                                    transition: 'var(--transition)',
                                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor =
                                        'var(--primary)';
                                    e.currentTarget.style.boxShadow =
                                        '0 4px 12px rgba(67, 97, 238, 0.15)';
                                    e.currentTarget.style.transform =
                                        'translateY(-2px)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor =
                                        'var(--light-gray)';
                                    e.currentTarget.style.boxShadow =
                                        '0 2px 8px rgba(0, 0, 0, 0.05)';
                                    e.currentTarget.style.transform =
                                        'translateY(0)';
                                }}
                            >
                                <i
                                    className="fas fa-file-word"
                                    style={{
                                        fontSize: '2.5rem',
                                        color: '#2b579a',
                                    }}
                                ></i>
                                <p
                                    style={{
                                        margin: 0,
                                        fontSize: '0.95rem',
                                        fontWeight: '500',
                                        color: 'var(--dark)',
                                        textAlign: 'center',
                                    }}
                                >
                                    {plantilla.grado_seccion &&
                                    plantilla.grado_seccion_nombre &&
                                    typeof plantilla.grado_seccion_nombre ===
                                        'string' &&
                                    !plantilla.grado_seccion_nombre.includes(
                                        'method-wrapper'
                                    )
                                        ? plantilla.grado_seccion_nombre
                                        : 'General (todos los grados)'}
                                </p>
                                <button
                                    onClick={() =>
                                        descargarPlantilla(plantilla.id)
                                    }
                                    style={{
                                        width: '100%',
                                        padding: '12px 20px',
                                        background: 'var(--primary)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: 'var(--border-radius)',
                                        fontSize: '0.9rem',
                                        fontWeight: '500',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px',
                                        transition: 'var(--transition)',
                                        boxShadow:
                                            '0 4px 15px rgba(67, 97, 238, 0.3)',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background =
                                            'var(--primary-dark)';
                                        e.currentTarget.style.transform =
                                            'translateY(-2px)';
                                        e.currentTarget.style.boxShadow =
                                            '0 6px 20px rgba(67, 97, 238, 0.4)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background =
                                            'var(--primary)';
                                        e.currentTarget.style.transform =
                                            'translateY(0)';
                                        e.currentTarget.style.boxShadow =
                                            '0 4px 15px rgba(67, 97, 238, 0.3)';
                                    }}
                                >
                                    <i
                                        className="fas fa-download"
                                        style={{ fontSize: '0.85rem' }}
                                    ></i>
                                    Descargar Plantilla
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div
                        style={{
                            padding: '40px',
                            textAlign: 'center',
                            color: 'var(--gray)',
                            fontSize: '0.95rem',
                        }}
                    >
                        <i
                            className="fas fa-file-word"
                            style={{
                                fontSize: '3rem',
                                color: 'var(--light-gray)',
                                marginBottom: '15px',
                                display: 'block',
                            }}
                        ></i>
                        No hay plantillas disponibles para este periodo
                    </div>
                )}
            </div>

            {/* Sección de Estudiantes */}
            <div
                className="section-card"
                style={{ maxWidth: '1200px', margin: '0 auto' }}
            >
                <h2
                    style={{
                        fontSize: '1.3rem',
                        fontWeight: '600',
                        color: 'var(--dark)',
                        marginBottom: '20px',
                        paddingBottom: '15px',
                        borderBottom: '2px solid var(--light-gray)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                    }}
                >
                    <i
                        className="fas fa-file-pdf"
                        style={{ color: 'var(--danger)', fontSize: '1.2rem' }}
                    ></i>
                    Subir Boletines PDF
                </h2>
                <div className="table-container">
                    <table
                        className="boletines-table"
                        style={{
                            width: '100%',
                            borderCollapse: 'collapse',
                            background: 'white',
                            borderRadius: 'var(--border-radius)',
                            overflow: 'hidden',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                        }}
                    >
                        <thead>
                            <tr
                                style={{
                                    background: 'var(--primary)',
                                    color: 'white',
                                }}
                            >
                                <th
                                    style={{
                                        padding: '15px',
                                        textAlign: 'left',
                                        fontWeight: '600',
                                        fontSize: '0.95rem',
                                    }}
                                >
                                    Estudiante
                                </th>
                                <th
                                    style={{
                                        padding: '15px',
                                        textAlign: 'left',
                                        fontWeight: '600',
                                        fontSize: '0.95rem',
                                    }}
                                >
                                    Cédula
                                </th>
                                <th
                                    style={{
                                        padding: '15px',
                                        textAlign: 'left',
                                        fontWeight: '600',
                                        fontSize: '0.95rem',
                                    }}
                                >
                                    Grado/Sección
                                </th>
                                <th
                                    style={{
                                        padding: '15px',
                                        textAlign: 'center',
                                        fontWeight: '600',
                                        fontSize: '0.95rem',
                                    }}
                                >
                                    Estado
                                </th>
                                <th
                                    style={{
                                        padding: '15px',
                                        textAlign: 'center',
                                        fontWeight: '600',
                                        fontSize: '0.95rem',
                                    }}
                                >
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {estudiantes.length === 0 ? (
                                <tr>
                                    <td colSpan="5" style={{
                                        padding: '40px',
                                        textAlign: 'center',
                                        color: 'var(--gray)',
                                        fontSize: '0.95rem'
                                    }}>
                                        {!profesorInfo ? (
                                            <span>Cargando información del profesor...</span>
                                        ) : !profesorInfo.grado_secciones || profesorInfo.grado_secciones.length === 0 ? (
                                            <span>
                                                <i className="fas fa-info-circle" style={{marginRight: '8px'}}></i>
                                                No tienes secciones asignadas. Contacta al administrador.
                                            </span>
                                        ) : (
                                            <span>
                                                <i className="fas fa-users" style={{marginRight: '8px'}}></i>
                                                No hay estudiantes en tus secciones asignadas.
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ) : (
                                estudiantes.map((estudiante) => {
                                const boletin = boletines.find(
                                    (b) =>
                                        b.estudiante === estudiante.id &&
                                        b.lapso === selectedPeriodo
                                );
                                return (
                                    <tr
                                        key={estudiante.id}
                                        style={{
                                            borderBottom:
                                                '1px solid var(--light-gray)',
                                            transition: 'var(--transition)',
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background =
                                                'rgba(67, 97, 238, 0.03)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background =
                                                'white';
                                        }}
                                    >
                                        <td
                                            style={{
                                                padding: '15px',
                                                fontSize: '0.95rem',
                                                color: 'var(--dark)',
                                                fontWeight: '500',
                                            }}
                                        >
                                            {estudiante.nombre}{' '}
                                            {estudiante.apellido}
                                        </td>
                                        <td
                                            style={{
                                                padding: '15px',
                                                fontSize: '0.95rem',
                                                color: 'var(--gray)',
                                            }}
                                        >
                                            {estudiante.cedula || '—'}
                                        </td>
                                        <td
                                            style={{
                                                padding: '15px',
                                                fontSize: '0.95rem',
                                                color: 'var(--gray)',
                                            }}
                                        >
                                            {estudiante.grado_seccion
                                                ? `${estudiante.grado_seccion.grado} ${estudiante.grado_seccion.seccion}`
                                                : '—'}
                                        </td>
                                        <td
                                            style={{
                                                padding: '15px',
                                                textAlign: 'center',
                                            }}
                                        >
                                            {boletin ? (
                                                <span
                                                    style={{
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '6px',
                                                        padding: '6px 12px',
                                                        background:
                                                            'rgba(76, 201, 240, 0.1)',
                                                        color: 'var(--success)',
                                                        borderRadius: '20px',
                                                        fontSize: '0.85rem',
                                                        fontWeight: '500',
                                                        border: '1px solid rgba(76, 201, 240, 0.3)',
                                                    }}
                                                >
                                                    <i
                                                        className="fas fa-check-circle"
                                                        style={{
                                                            fontSize: '0.75rem',
                                                        }}
                                                    ></i>
                                                    Subido
                                                </span>
                                            ) : (
                                                <span
                                                    style={{
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '6px',
                                                        padding: '6px 12px',
                                                        background:
                                                            'rgba(248, 150, 30, 0.1)',
                                                        color: 'var(--warning)',
                                                        borderRadius: '20px',
                                                        fontSize: '0.85rem',
                                                        fontWeight: '500',
                                                        border: '1px solid rgba(248, 150, 30, 0.3)',
                                                    }}
                                                >
                                                    <i
                                                        className="fas fa-clock"
                                                        style={{
                                                            fontSize: '0.75rem',
                                                        }}
                                                    ></i>
                                                    Pendiente
                                                </span>
                                            )}
                                        </td>
                                        <td
                                            style={{
                                                padding: '15px',
                                                textAlign: 'center',
                                            }}
                                        >
                                            {boletin ? (
                                                <button
                                                    onClick={() =>
                                                        handleUploadClick(
                                                            estudiante,
                                                            selectedPeriodo
                                                        )
                                                    }
                                                    style={{
                                                        padding: '10px 20px',
                                                        background:
                                                            'var(--warning)',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius:
                                                            'var(--border-radius)',
                                                        fontSize: '0.9rem',
                                                        fontWeight: '500',
                                                        cursor: 'pointer',
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        justifyContent:
                                                            'center',
                                                        gap: '8px',
                                                        transition:
                                                            'var(--transition)',
                                                        boxShadow:
                                                            '0 4px 15px rgba(248, 150, 30, 0.3)',
                                                        minWidth: '120px',
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.background =
                                                            '#e0a800';
                                                        e.currentTarget.style.transform =
                                                            'translateY(-2px)';
                                                        e.currentTarget.style.boxShadow =
                                                            '0 6px 20px rgba(248, 150, 30, 0.4)';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.background =
                                                            'var(--warning)';
                                                        e.currentTarget.style.transform =
                                                            'translateY(0)';
                                                        e.currentTarget.style.boxShadow =
                                                            '0 4px 15px rgba(248, 150, 30, 0.3)';
                                                    }}
                                                >
                                                    <i
                                                        className="fas fa-edit"
                                                        style={{
                                                            fontSize: '0.8rem',
                                                            display:
                                                                'inline-flex',
                                                            alignItems:
                                                                'center',
                                                            justifyContent:
                                                                'center',
                                                            lineHeight: '1',
                                                        }}
                                                    ></i>
                                                    Actualizar
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() =>
                                                        handleUploadClick(
                                                            estudiante,
                                                            selectedPeriodo
                                                        )
                                                    }
                                                    style={{
                                                        padding: '10px 20px',
                                                        background:
                                                            'var(--primary)',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius:
                                                            'var(--border-radius)',
                                                        fontSize: '0.9rem',
                                                        fontWeight: '500',
                                                        cursor: 'pointer',
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        justifyContent:
                                                            'center',
                                                        gap: '8px',
                                                        transition:
                                                            'var(--transition)',
                                                        boxShadow:
                                                            '0 4px 15px rgba(67, 97, 238, 0.3)',
                                                        minWidth: '120px',
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.background =
                                                            'var(--primary-dark)';
                                                        e.currentTarget.style.transform =
                                                            'translateY(-2px)';
                                                        e.currentTarget.style.boxShadow =
                                                            '0 6px 20px rgba(67, 97, 238, 0.4)';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.background =
                                                            'var(--primary)';
                                                        e.currentTarget.style.transform =
                                                            'translateY(0)';
                                                        e.currentTarget.style.boxShadow =
                                                            '0 4px 15px rgba(67, 97, 238, 0.3)';
                                                    }}
                                                >
                                                    <i
                                                        className="fas fa-upload"
                                                        style={{
                                                            fontSize: '0.8rem',
                                                            display:
                                                                'inline-flex',
                                                            alignItems:
                                                                'center',
                                                            justifyContent:
                                                                'center',
                                                            lineHeight: '1',
                                                        }}
                                                    ></i>
                                                    Subir PDF
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            }))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal para subir boletín */}
            {showUploadModal && selectedEstudiante && (
                <div
                    className="modal"
                    onClick={() => setShowUploadModal(false)}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0, 0, 0, 0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                        padding: '20px',
                    }}
                >
                    <div
                        className="modal-content"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            background: 'white',
                            borderRadius: 'var(--border-radius)',
                            padding: '30px',
                            maxWidth: '500px',
                            width: '100%',
                            boxShadow: '0 15px 40px rgba(0, 0, 0, 0.2)',
                            animation: 'fadeIn 0.3s ease-out',
                        }}
                    >
                        <div
                            className="modal-header"
                            style={{
                                marginBottom: '25px',
                                paddingBottom: '15px',
                                borderBottom: '2px solid var(--light-gray)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                            }}
                        >
                            <h3
                                className="modal-title"
                                style={{
                                    fontSize: '1.4rem',
                                    fontWeight: '600',
                                    color: 'var(--dark)',
                                    margin: 0,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                }}
                            >
                                <i
                                    className={`fas ${
                                        selectedEstudiante.boletinExistente
                                            ? 'fa-edit'
                                            : 'fa-upload'
                                    }`}
                                    style={{
                                        color: selectedEstudiante.boletinExistente
                                            ? 'var(--warning)'
                                            : 'var(--primary)',
                                        fontSize: '1.2rem',
                                    }}
                                ></i>
                                {selectedEstudiante.boletinExistente
                                    ? 'Actualizar Boletín'
                                    : 'Subir Boletín PDF'}
                            </h3>
                            <button
                                className="close-modal"
                                onClick={() => setShowUploadModal(false)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    fontSize: '1.5rem',
                                    color: 'var(--gray)',
                                    cursor: 'pointer',
                                    padding: '0',
                                    width: '30px',
                                    height: '30px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderRadius: '50%',
                                    transition: 'var(--transition)',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background =
                                        'var(--light-gray)';
                                    e.currentTarget.style.color = 'var(--dark)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'none';
                                    e.currentTarget.style.color = 'var(--gray)';
                                }}
                            >
                                &times;
                            </button>
                        </div>
                        <div className="modal-body">
                            <div style={{ marginBottom: '20px' }}>
                                <p
                                    style={{
                                        marginBottom: '8px',
                                        color: 'var(--gray)',
                                        fontSize: '0.9rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                    }}
                                >
                                    <i
                                        className="fas fa-user"
                                        style={{
                                            color: 'var(--primary)',
                                            fontSize: '0.85rem',
                                        }}
                                    ></i>
                                    <strong>Estudiante:</strong>{' '}
                                    {selectedEstudiante.nombre}{' '}
                                    {selectedEstudiante.apellido}
                                </p>
                                <p
                                    style={{
                                        margin: 0,
                                        color: 'var(--gray)',
                                        fontSize: '0.9rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                    }}
                                >
                                    <i
                                        className="fas fa-calendar-alt"
                                        style={{
                                            color: 'var(--primary)',
                                            fontSize: '0.85rem',
                                        }}
                                    ></i>
                                    <strong>Lapso:</strong>{' '}
                                    {
                                        lapsoOptions.find(
                                            (l) => l.value === uploadData.lapso
                                        )?.label
                                    }
                                </p>
                            </div>
                            <div
                                style={{
                                    padding: '15px',
                                    background: 'rgba(67, 97, 238, 0.05)',
                                    borderRadius: 'var(--border-radius)',
                                    marginBottom: '20px',
                                    border: '1px solid rgba(67, 97, 238, 0.1)',
                                }}
                            >
                                <p
                                    style={{
                                        margin: 0,
                                        fontSize: '0.85rem',
                                        color: 'var(--dark)',
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        gap: '8px',
                                    }}
                                >
                                    <i
                                        className="fas fa-info-circle"
                                        style={{
                                            color: 'var(--info)',
                                            fontSize: '0.9rem',
                                            marginTop: '2px',
                                            flexShrink: 0,
                                        }}
                                    ></i>
                                    <span>
                                        <strong>Nota:</strong> Descarga la
                                        plantilla Word, complétala, convierte a
                                        PDF y súbelo aquí.
                                    </span>
                                </p>
                            </div>
                            <div className="form-group">
                                <label
                                    htmlFor="archivo_pdf"
                                    style={{
                                        fontSize: '0.95rem',
                                        fontWeight: '500',
                                        color: 'var(--dark)',
                                        marginBottom: '10px',
                                        display: 'block',
                                    }}
                                >
                                    Archivo PDF *
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <i
                                        className="fas fa-file-pdf"
                                        style={{
                                            position: 'absolute',
                                            left: '15px',
                                            top: '15px',
                                            color: 'var(--danger)',
                                            fontSize: '0.9rem',
                                            zIndex: 1,
                                        }}
                                    ></i>
                                    <input
                                        type="file"
                                        id="archivo_pdf"
                                        accept=".pdf"
                                        onChange={handleFileChange}
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '12px 15px 12px 45px',
                                            border: '2px solid var(--light-gray)',
                                            borderRadius:
                                                'var(--border-radius)',
                                            fontSize: '0.95rem',
                                            transition: 'var(--transition)',
                                            background: 'white',
                                            color: 'var(--dark)',
                                            cursor: 'pointer',
                                        }}
                                        onFocus={(e) => {
                                            e.currentTarget.style.borderColor =
                                                'var(--primary)';
                                            e.currentTarget.style.boxShadow =
                                                '0 0 0 3px rgba(67, 97, 238, 0.1)';
                                        }}
                                        onBlur={(e) => {
                                            e.currentTarget.style.borderColor =
                                                'var(--light-gray)';
                                            e.currentTarget.style.boxShadow =
                                                'none';
                                        }}
                                    />
                                </div>
                                {uploadData.archivo_pdf && (
                                    <small
                                        style={{
                                            display: 'block',
                                            marginTop: '8px',
                                            color: 'var(--success)',
                                            fontSize: '0.85rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                        }}
                                    >
                                        <i className="fas fa-check-circle"></i>
                                        Archivo seleccionado:{' '}
                                        {uploadData.archivo_pdf.name}
                                    </small>
                                )}
                            </div>
                            <div
                                style={{
                                    marginTop: '25px',
                                    display: 'flex',
                                    justifyContent: 'flex-end',
                                    gap: '12px',
                                }}
                            >
                                <button
                                    type="button"
                                    onClick={() => setShowUploadModal(false)}
                                    style={{
                                        padding: '12px 24px',
                                        background: 'var(--light-gray)',
                                        color: 'var(--dark)',
                                        border: 'none',
                                        borderRadius: 'var(--border-radius)',
                                        fontSize: '0.9rem',
                                        fontWeight: '500',
                                        cursor: 'pointer',
                                        transition: 'var(--transition)',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background =
                                            '#d0d0d0';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background =
                                            'var(--light-gray)';
                                    }}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="button"
                                    onClick={handleUpload}
                                    style={{
                                        padding: '12px 30px',
                                        background:
                                            selectedEstudiante.boletinExistente
                                                ? 'var(--warning)'
                                                : 'var(--primary)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: 'var(--border-radius)',
                                        fontSize: '0.9rem',
                                        fontWeight: '500',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        transition: 'var(--transition)',
                                        boxShadow:
                                            selectedEstudiante.boletinExistente
                                                ? '0 4px 15px rgba(248, 150, 30, 0.3)'
                                                : '0 4px 15px rgba(67, 97, 238, 0.3)',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background =
                                            selectedEstudiante.boletinExistente
                                                ? '#e0a800'
                                                : 'var(--primary-dark)';
                                        e.currentTarget.style.transform =
                                            'translateY(-2px)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background =
                                            selectedEstudiante.boletinExistente
                                                ? 'var(--warning)'
                                                : 'var(--primary)';
                                        e.currentTarget.style.transform =
                                            'translateY(0)';
                                    }}
                                >
                                    <i
                                        className={`fas ${
                                            selectedEstudiante.boletinExistente
                                                ? 'fa-edit'
                                                : 'fa-upload'
                                        }`}
                                        style={{
                                            fontSize: '0.85rem',
                                        }}
                                    ></i>
                                    {selectedEstudiante.boletinExistente
                                        ? 'Actualizar'
                                        : 'Subir'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
