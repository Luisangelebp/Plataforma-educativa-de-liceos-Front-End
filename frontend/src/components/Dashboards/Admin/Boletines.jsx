import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNotification } from '../../../context/NotificationContext';
import './css/Listas.css';
import './css/Boletines.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Función para obtener el token actual
const getAuthHeaders = () => {
    const token = localStorage.getItem('accessToken');
    return {
        Authorization: token ? `Bearer ${token}` : '',
    };
};

function ModalGenerarCabecera({
    showModal,
    setShowModal,
    materias,
    estudiantesFiltrados,
    profesores,
}) {
    const { addNotification } = useNotification();
    const [selectedMateria, setSelectedMateria] = useState('');
    const [selectedLapso, setSelectedLapso] = useState('1');
    const [selectedProfe, setSelectedProfe] = useState('');
    const [loading, setLoading] = useState(false);
    // Resetear la materia seleccionada cuando el modal se cierra o las materias cambian
    useEffect(() => {
        if (!showModal) {
            setSelectedMateria('');
        }
    }, [showModal]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedMateria) {
            addNotification('Por favor, seleccione una materia.', 'warning');
            return;
        }
        console.log(selectedProfe);
        setLoading(true);
        try {
            const promesas = estudiantesFiltrados.map((estudiante) =>
                axios.post(
                    `${API_URL}/calificaciones/`,
                    {
                        estudiante: estudiante.id,
                        materia: selectedMateria,
                        lapso: selectedLapso,
                        nivel: 'primaria',
                        profesor: selectedProfe,
                    },
                    {
                        headers: getAuthHeaders(),
                    },
                ),
            );

            await Promise.all(promesas);
            addNotification(
                `Cabeceras generadas para la materia y el lapso seleccionados.`,
                'success',
            );
            setShowModal(false);
        } catch (error) {
            console.error('Error creating headers:', error);
            addNotification(
                'Error al generar las cabeceras. Es posible que ya existan.',
                'error',
            );
            console.error('Error creating headers:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!showModal) {
        return null;
    }
    return (
        <div
            className="modal-overlay"
            style={{
                backdropFilter: 'blur(10px)',
                backgroundColor: 'rgba(15, 23, 42, 0.4)',
            }}
        >
            <div
                className="modal-container"
                style={{
                    maxWidth: '700px',
                    borderRadius: ' 28px',
                    overflow: 'hidden',
                    border: 'none',
                    boxShadow: 'rgba(0, 0, 0, 0.25) 0px 30px 60px -12px',
                    background: ' rgb(241, 245, 249)',
                }}
            >
                <div className="modal-header">
                    <i
                        className="material-symbols-outlined"
                        style={{ fontSize: '24px' }}
                    >
                        rocket_launch
                    </i>
                    <h3
                        style={{
                            margin: '0px',
                            fontFamily: 'Outfit',
                            fontWeight: '800',
                            fontSize: ' 1.5rem',
                            color: ' rgb(15, 23, 42)',
                            letterSpacing: ' -0.02em',
                        }}
                    >
                        Aperturar Registro de Notas
                    </h3>

                    <button
                        className="close-btn"
                        title="Cerrar"
                        style={{
                            background: 'rgb(255, 255, 255)',
                            color: 'rgb(100, 116, 139)',
                            width: '36px',
                            height: '36px',
                            border: '1px solid rgb(226, 232, 240)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                        }}
                        onClick={() => {
                            setShowModal(false);
                        }}
                    >
                        <span
                            className="material-symbols-outlined"
                            style={{ fontSize: '20px' }}
                        >
                            close
                        </span>
                    </button>
                </div>
                <div className="modal-body">
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="materia-select">Materia</label>
                            <select
                                id="materia-select"
                                value={selectedMateria}
                                onChange={(e) =>
                                    setSelectedMateria(e.target.value)
                                }
                                disabled={loading}
                                required
                            >
                                <option value="">Seleccione una materia</option>
                                {materias.map((materia) => (
                                    <option key={materia.id} value={materia.id}>
                                        {materia.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="profe-select">Profesor</label>
                            <select
                                name="profe-select"
                                id="profe-select"
                                value={selectedProfe}
                                onChange={(e) =>
                                    setSelectedProfe(e.target.value)
                                }
                            >
                                <option value="">Selecione el Profesor</option>
                                {profesores.map((profe) => (
                                    <option key={profe.id} value={profe.id}>
                                        {profe.nombre} {profe.apellido}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="lapso-select">Lapso</label>
                            <select
                                id="lapso-select"
                                value={selectedLapso}
                                onChange={(e) =>
                                    setSelectedLapso(e.target.value)
                                }
                                required
                            >
                                <option value="1">Primer Lapso</option>
                                <option value="2">Segundo Lapso</option>
                                <option value="3">Tercer Lapso</option>
                            </select>
                        </div>
                        <div
                            className="modal-footer"
                            style={{
                                display: 'flex',
                                justifyContent: 'flex-end',
                                gap: '10px',
                            }}
                        >
                            <button
                                type="button"
                                style={{
                                    background: 'white',
                                    color: 'black',
                                    border: '1px solid gray',
                                }}
                                className="btn-secondary carousel-button"
                                onClick={() => setShowModal(false)}
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="btn-primary carousel-button"
                                disabled={loading}
                            >
                                {loading
                                    ? 'Generando...'
                                    : 'Aperturar Planilla'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export function Boletines() {
    const { addNotification } = useNotification();
    const [estudiantes, setEstudiantes] = useState([]);
    const [boletines, setBoletines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingGeneracion, setLoadingGeneracion] = useState(false);
    const [filtroGrado, setFiltroGrado] = useState('');
    const [filtroSeccion, setFiltroSeccion] = useState('');
    const [busquedaTexto, setBusquedaTexto] = useState('');
    const [materias, setMaterias] = useState([]);
    const [showModalGenerarCabecera, setShowModalGenerarCabecera] =
        useState(false);
    const [profesor, setProfesor] = useState([]);
    const [calificaciones, setCalificaciones] = useState([]);

    useEffect(() => {
        const cargarDatos = async () => {
            setLoading(true);
            await Promise.all([
                cargarEstudiantes(),
                cargarBoletines(),
                getMateriasPrimaria(),
                cargarCalificaciones(),
            ]);
            setLoading(false);
        };
        cargarDatos();
    }, []);

    const cargarCalificaciones = async () => {
        try {
            const response = await axios.get(`${API_URL}/calificaciones/`, {
                headers: getAuthHeaders(),
            });
            setCalificaciones(response.data);
        } catch (error) {
            console.error('Error al cargar calificaciones:', error);
        }
    };

    const cargarEstudiantes = async () => {
        try {
            const response = await axios.get(
                `${API_URL}/usuarios/estudiante/`,
                {
                    headers: getAuthHeaders(),
                },
            );
            const estudiantesPrimaria = response.data.filter(
                (est) =>
                    est.grado_seccion && est.grado_seccion.nivel === 'primaria',
            );
            setEstudiantes(estudiantesPrimaria);
        } catch (error) {
            console.error('Error al cargar estudiantes:', error);
        }
    };

    const cargarBoletines = async () => {
        try {
            const response = await axios.get(`${API_URL}/boletines/`, {
                headers: getAuthHeaders(),
            });
            setBoletines(response.data);
        } catch (error) {
            console.error('Error al cargar boletines:', error);
        }
    };

    const getBoletinPorEstudiante = (estudianteId, lapso) => {
        return boletines.find(
            (b) =>
                b.estudiante === estudianteId &&
                b.lapso.toString() === lapso.toString(),
        );
    };

    // Implementación de descarga/vista previa con Blob
    const fetchBoletinBlob = async (url, successCallback, errorCallback) => {
        try {
            const response = await fetch(url, {
                headers: getAuthHeaders(),
            });

            if (response.ok) {
                const blob = await response.blob();
                const blobUrl = URL.createObjectURL(blob);
                successCallback(blobUrl);
            } else if (response.status === 404) {
                addNotification(
                    'El profesor aún no ha enviado las notas finales de este lapso.',
                    'warning',
                );
            } else {
                console.error('Error en la petición:', response);
                addNotification(
                    'Ocurrió un error al procesar el boletín.',
                    'error',
                );
            }
        } catch (error) {
            console.error('Error de red o de fetch:', error);
            addNotification(
                'Ocurrió un error de red al contactar al servidor.',
                'error',
            );
        }
    };

    const verBoletin = (estudianteId, lapso) => {
        const url = `${API_URL}/boletines/vista-previa/${estudianteId}/lapso/${lapso}/`;
        fetchBoletinBlob(url, (blobUrl) => window.open(blobUrl, '_blank'));
    };

    const descargarBoletin = (boletinPk, cedula, lapso) => {
        const url = `${API_URL}/boletines/${boletinPk}/descargar/`;
        fetchBoletinBlob(url, (blobUrl) => {
            const link = document.createElement('a');
            link.href = blobUrl;
            link.setAttribute(
                'download',
                `boletin_${cedula}_lapso_${lapso}.pdf`,
            );
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(blobUrl);
        });
    };

    const generarBoletin = async (estudianteId, lapso) => {
        try {
            await axios.post(
                `${API_URL}/boletines/generar/${estudianteId}/lapso/${lapso}/`,
                {
                    headers: getAuthHeaders(),
                },
            );
            addNotification(
                'Boletín generado exitosamente. La lista se actualizará.',
                'success',
            );
            await cargarBoletines(); // Recargar para reflejar el nuevo estado
        } catch (error) {
            if (error.response?.status === 404) {
                addNotification(
                    'No se puede generar: El profesor aún no ha enviado las notas finales de este lapso.',
                    'warning',
                );
            } else {
                console.error('Error al generar boletín:', error);
                addNotification(
                    'Ocurrió un error al generar el boletín.',
                    'error',
                );
            }
        }
    };

    // Materias de primaria
    async function getMateriasPrimaria() {
        try {
            const resGS = await axios.get(`${API_URL}/grado-seccion/`, {
                headers: getAuthHeaders(),
            });
            const idPrimaria = resGS.data
                .filter((item) => item.nivel === 'primaria')
                .map((item) => item.id);
            const resProfesor = await axios.get(
                `${API_URL}/usuarios/profesor/`,
                {
                    headers: getAuthHeaders(),
                },
            );
            const a = resGS.data
                .filter((item) => item.nivel === 'primaria')
                .map((item) => item.id);

            const resHorario = await axios.get(`${API_URL}/horarios/`, {
                headers: getAuthHeaders(),
            });

            const profesoresId = resHorario.data
                .filter((item) => a.includes(item.grado_seccion))
                .flatMap((item) => item.profesor);
            setProfesor(
                resProfesor.data.filter((item) =>
                    profesoresId.includes(item.id),
                ),
            );

            // Aplanamos todas las materias de todos los horarios de primaria
            const materiasIds = resHorario.data
                .filter((item) => idPrimaria.includes(item.grado_seccion))
                .flatMap((item) => item.materia); // flatMap para obtener un solo array de IDs

            const materiasUnicasIds = [...new Set(materiasIds)]; // Obtenemos IDs únicos

            const resMate = await axios.get(`${API_URL}/horarios/materias/`, {
                headers: getAuthHeaders(),
            });

            setMaterias(
                resMate.data.filter((item) =>
                    materiasUnicasIds.includes(item.id),
                ),
            );
        } catch (e) {
            console.log(e);
            addNotification('Error al cargar las materias.', 'error');
        }
    }

    // Lógica de filtrado
    const estudiantesFiltrados = estudiantes.filter((estudiante) => {
        const matchGrado =
            !filtroGrado ||
            (estudiante.grado_seccion &&
                estudiante.grado_seccion.grado === filtroGrado);
        const matchSeccion =
            !filtroSeccion ||
            (estudiante.grado_seccion &&
                estudiante.grado_seccion.seccion === filtroSeccion);
        const matchTexto =
            !busquedaTexto ||
            `${estudiante.nombre} ${estudiante.apellido}`
                .toLowerCase()
                .includes(busquedaTexto.toLowerCase()) ||
            estudiante.cedula?.toString().includes(busquedaTexto);
        return matchGrado && matchSeccion && matchTexto;
    });

    const gradosUnicos = [
        ...new Set(
            estudiantes
                .filter((e) => e.grado_seccion)
                .map((e) => e.grado_seccion.grado)
                .filter((g) => g),
        ),
    ].sort();
    const seccionesUnicas = [
        ...new Set(
            estudiantes
                .filter((e) => e.grado_seccion)
                .map((e) => e.grado_seccion.seccion)
                .filter((s) => s),
        ),
    ].sort();
    const lapsoOptions = [
        { value: '1', label: 'Primer Lapso' },
        { value: '2', label: 'Segundo Lapso' },
        { value: '3', label: 'Tercer Lapso' },
    ];

    const handleOpenModal = () => {
        if (!filtroGrado || !filtroSeccion) {
            addNotification(
                'Por favor, seleccione un grado y sección primero.',
                'warning',
            );
            return;
        }
        if (estudiantesFiltrados.length === 0) {
            addNotification(
                'No hay estudiantes en la selección actual para aperturar un lapso.',
                'warning',
            );
            return;
        }
        setShowModalGenerarCabecera(true);
    };

    const renderLapsoCell = (estudiante, lapso) => {
        const boletin = getBoletinPorEstudiante(estudiante.id, lapso.value);
        console.log(boletin);
        const calificacion = calificaciones.find(
            (cal) =>
                cal.estudiante === estudiante.id &&
                cal.lapso === lapso.value &&
                cal.enviado === true,
        );

        if (boletin) {
            // Estado: OFICIALIZADO
            return (
                <div className="boletin-actions">
                    <button
                        onClick={() => verBoletin(estudiante.id, lapso.value)}
                        title="Vista Previa"
                        className="btn-icon btn-preview"
                        style={{}}
                    >
                        <i className="material-symbols-outlined">visibility</i>
                    </button>
                    <button
                        onClick={() =>
                            descargarBoletin(
                                boletin.id,
                                estudiante.cedula,
                                lapso.value,
                            )
                        }
                        title="Descargar"
                        className="btn-icon btn-download"
                    >
                        <i className="material-symbols-outlined">download</i>
                    </button>
                </div>
            );
        } else if (calificacion) {
            // Estado: SIN NOTAS o LISTO PARA GENERAR (la API lo decide)
            return (
                <div className="boletin-actions">
                    <button
                        onClick={() => verBoletin(estudiante.id, lapso.value)}
                        title="Vista Previa"
                        className="btn-icon btn-preview"
                    >
                        <i className="material-symbols-outlined">visibility</i>
                    </button>
                    <button
                        onClick={() =>
                            generarBoletin(estudiante.id, lapso.value)
                        }
                        title="Generar Boletín"
                        className="btn-icon btn-generate"
                    >
                        <i className="material-symbols-outlined">bolt</i>
                    </button>
                </div>
            );
        } else {
            // Estado: SIN NOTAS
            return <span style={{ color: '#9ca3af' }}>Notas pendientes</span>;
        }
    };

    return (
        <div className="container-boletines">
            <div className="boletines-header">
                <h1>Gestión de Boletines de Primaria</h1>
                {/* <button 
                    onClick={generarBoletinesEnMasa} 
                    className="btn-primary-materia" 
                    disabled={loadingGeneracion || !filtroGrado}
                    title={!filtroGrado ? "Seleccione un grado primero" : "Genera todos los boletines para el grado/sección filtrado"}
                >
                    {loadingGeneracion ? (
                        <>
                            <i className="material-symbols-outlined spin" style={{ verticalAlign: 'middle', marginRight: '8px' }}>progress_activity</i>
                            Generando...
                        </>
                    ) : (
                        <>
                            <i className="material-symbols-outlined" style={{ verticalAlign: 'middle', marginRight: '8px' }}>auto_awesome</i>
                            Generar Boletines del Grado
                        </>
                    )}
                </button> */}
            </div>

            <div className="table-container" style={{ padding: '20px' }}>
                <div
                    className="filters-container"
                    style={{ marginBottom: '20px' }}
                >
                    <select
                        value={filtroGrado}
                        onChange={(e) => setFiltroGrado(e.target.value)}
                        className="periodo-selector"
                    >
                        <option value="">Todos los grados</option>
                        {gradosUnicos.map((grado) => (
                            <option key={grado} value={grado}>
                                {grado}° Grado
                            </option>
                        ))}
                    </select>
                    <select
                        value={filtroSeccion}
                        onChange={(e) => setFiltroSeccion(e.target.value)}
                        className="periodo-selector"
                    >
                        <option value="">Todas las secciones</option>
                        {seccionesUnicas.map((seccion) => (
                            <option key={seccion} value={seccion}>
                                Sección {seccion}
                            </option>
                        ))}
                    </select>
                    <input
                        type="text"
                        className="periodo-selector"
                        placeholder="Buscar estudiante..."
                        value={busquedaTexto}
                        onChange={(e) => setBusquedaTexto(e.target.value)}
                    />
                    <button
                        className="periodo-selector"
                        style={{
                            cursor: 'pointer',
                            backgroundColor: '#83bfff',
                            border: '2px solid gray',
                        }}
                        onClick={handleOpenModal}
                    >
                        <i className="material-symbols-outlined">
                            rocket_launch
                        </i>
                        Aperturar Lapso
                    </button>
                </div>

                <table className="boletines-table">
                    <thead>
                        <tr>
                            <th style={{ borderRadius: '8px 0 0 0' }}>
                                Estudiante
                            </th>
                            <th>Cédula</th>
                            <th>Grado/Sección</th>
                            <th>Primer Lapso</th>
                            <th>Segundo Lapso</th>
                            <th style={{ borderRadius: '0 8px 0 0' }}>
                                Tercer Lapso
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="6">Cargando...</td>
                            </tr>
                        ) : estudiantesFiltrados.length === 0 ? (
                            <tr>
                                <td colSpan="6">
                                    No hay estudiantes que coincidan con los
                                    filtros
                                </td>
                            </tr>
                        ) : (
                            estudiantesFiltrados.map((estudiante) => (
                                <tr key={estudiante.id}>
                                    <td>
                                        {estudiante.nombre}{' '}
                                        {estudiante.apellido}
                                    </td>
                                    <td>{estudiante.cedula || 'No posee'}</td>
                                    <td>
                                        {estudiante.grado_seccion
                                            ? `${estudiante.grado_seccion.grado} ${estudiante.grado_seccion.seccion}`
                                            : '—'}
                                    </td>
                                    {lapsoOptions.map((lapso) => (
                                        <td key={lapso.value}>
                                            {renderLapsoCell(estudiante, lapso)}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            <ModalGenerarCabecera
                showModal={showModalGenerarCabecera}
                setShowModal={setShowModalGenerarCabecera}
                materias={materias}
                estudiantesFiltrados={estudiantesFiltrados}
                profesores={profesor}
            />
        </div>
    );
}
