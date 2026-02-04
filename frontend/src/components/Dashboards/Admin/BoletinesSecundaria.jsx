import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNotification } from '../../../context/NotificationContext';
import './css/Listas.css';
import './css/Boletines.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const getAuthHeaders = () => {
    const token = localStorage.getItem('accessToken');
    return {
        headers: {
            Authorization: token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json',
        },
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

    useEffect(() => {
        if (!showModal) {
            setSelectedMateria('');
            setSelectedProfe('');
        }
    }, [showModal]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedMateria || !selectedProfe) {
            addNotification(
                'Por favor, seleccione materia y profesor.',
                'warning',
            );
            return;
        }
        setLoading(true);
        try {
            const promesas = estudiantesFiltrados.map((estudiante) =>
                axios.post(
                    `${API_URL}/calificaciones/`,
                    {
                        estudiante: estudiante.id,
                        materia: selectedMateria,
                        lapso: selectedLapso,
                        nivel: 'secundaria', // Adaptado para secundaria
                        profesor: selectedProfe,
                    },
                    getAuthHeaders(),
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
                        Aperturar Registro de Notas (Secundaria)
                    </h3>
                    <button
                        className="close-btn"
                        onClick={() => setShowModal(false)}
                    >
                        <span className="material-symbols-outlined">close</span>
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
                                required
                            >
                                <option value="">Seleccione el Profesor</option>
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
                        <div className="modal-footer">
                            <button
                                type="button"
                                className="btn-secondary carousel-button"
                                style={{
                                    background: 'white',
                                    color: 'black',
                                    border: '1px solid gray',
                                }}
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

const LapsoActionCell = ({ estudianteId, lapso, boletines, onUpdate }) => {
    const [status, setStatus] = useState('loading');
    const [boletin, setBoletin] = useState(null);
    const { addNotification } = useNotification();
    const checkStatus = useCallback(async () => {
        const generatedBoletin = boletines.find(
            (b) =>
                b.estudiante === estudianteId &&
                b.lapso.toString() === lapso.toString(),
        );

        if (generatedBoletin) {
            setBoletin(generatedBoletin);
            setStatus('generated');
            return;
        }

        try {
            const res = await axios.get(
                `${API_URL}/calificaciones/?estudiante=${estudianteId}`,
                getAuthHeaders(),
            );

            const filterByLapso = res.data.filter(
                (item) => Number(item.lapso) == lapso,
            );

            if (filterByLapso.length > 0) {
                if (filterByLapso[0].enviado) {
                    setStatus('ready');
                } else {
                    setStatus('pending');
                }
            } else {
                setStatus('pending');
            }
        } catch (error) {
            setStatus('pending');
        }
    }, [estudianteId, lapso, boletines]);

    useEffect(() => {
        checkStatus();
    }, [checkStatus]);

    const handleAction = async (action) => {
        const urlMap = {
            preview: `${API_URL}/boletines/vista-previa/${estudianteId}/lapso/${lapso}/`,
            generate: `${API_URL}/boletines/generar/${estudianteId}/lapso/${lapso}/`,
            download: `${API_URL}/boletines/${boletin ? boletin.id : 0}/descargar/`,
        };

        const url = urlMap[action];
        const isDownload = action === 'download' || action === 'preview';

        try {
            const config = {
                ...getAuthHeaders(),
                responseType: isDownload ? 'blob' : 'json',
            };
            const response =
                action === 'generate'
                    ? await axios.post(url, {}, config)
                    : await axios.get(url, config);

            if (isDownload) {
                const blob = new Blob([response.data], {
                    type: 'application/pdf',
                });
                const blobUrl = URL.createObjectURL(blob);
                if (action === 'preview') {
                    window.open(blobUrl, '_blank');
                } else {
                    const link = document.createElement('a');
                    link.href = blobUrl;
                    link.download = `boletin_${boletin.id}.pdf`;
                    document.body.appendChild(link);
                    link.click();
                    link.remove();
                    URL.revokeObjectURL(blobUrl);
                }
            } else {
                addNotification('Boletín oficializado con éxito.', 'success');
                onUpdate(); // Refrescar datos
            }
        } catch (error) {
            console.error(`Error en la acción ${action}:`, error);
            const message =
                error.response?.status === 404
                    ? 'Asegúrese de que las notas del profesor estén marcadas como "enviadas".'
                    : `Error al ${action} el boletín.`;
            addNotification(message, 'error');
        }
    };

    switch (status) {
        case 'loading':
            return <span style={{ color: '#6b7280' }}>Cargando...</span>;
        case 'pending':
            return <span style={{ color: '#9ca3af' }}>Notas pendientes</span>;
        case 'ready':
            return (
                <div className="boletin-actions">
                    <button
                        onClick={() => handleAction('preview')}
                        title="Vista Previa"
                        className="btn-icon btn-preview"
                    >
                        <i className="material-symbols-outlined">visibility</i>
                    </button>
                    <button
                        onClick={() => handleAction('generate')}
                        title="Oficializar"
                        className="btn-icon btn-generate"
                    >
                        <i className="material-symbols-outlined">bolt</i>
                    </button>
                </div>
            );
        case 'generated':
            return (
                <div className="boletin-actions">
                    <button
                        onClick={() => handleAction('download')}
                        title="Descargar PDF"
                        className="btn-icon btn-download"
                    >
                        <i className="material-symbols-outlined">download</i>
                    </button>
                </div>
            );
        default:
            return null;
    }
};

export default function BoletinesSecundaria() {
    const { addNotification } = useNotification();
    const [estudiantes, setEstudiantes] = useState([]);
    const [boletines, setBoletines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtroGrado, setFiltroGrado] = useState('');
    const [filtroSeccion, setFiltroSeccion] = useState('');
    const [busquedaTexto, setBusquedaTexto] = useState('');
    const [materias, setMaterias] = useState([]);
    const [profesores, setProfesores] = useState([]);
    const [showModalGenerarCabecera, setShowModalGenerarCabecera] =
        useState(false);

    const getMateriasYProfesoresSecundaria = async () => {
        try {
            const resGS = await axios.get(
                `${API_URL}/grado-seccion/`,
                getAuthHeaders(),
            );
            const idSecundaria = resGS.data
                .filter((item) => item.nivel === 'secundaria')
                .map((item) => item.id);

            const resHorario = await axios.get(
                `${API_URL}/horarios/`,
                getAuthHeaders(),
            );
            const horariosSecundaria = resHorario.data.filter((h) =>
                idSecundaria.includes(h.grado_seccion),
            );

            const materiasIds = [
                ...new Set(horariosSecundaria.flatMap((h) => h.materia)),
            ];
            const profesIds = [
                ...new Set(horariosSecundaria.flatMap((h) => h.profesor)),
            ];

            const [resMate, resProf] = await Promise.all([
                axios.get(`${API_URL}/horarios/materias/`, getAuthHeaders()),
                axios.get(`${API_URL}/usuarios/profesor/`, getAuthHeaders()),
            ]);

            setMaterias(resMate.data.filter((m) => materiasIds.includes(m.id)));
            setProfesores(resProf.data.filter((p) => profesIds.includes(p.id)));
        } catch (e) {
            console.error(e);
            addNotification(
                'Error al cargar las materias o profesores.',
                'error',
            );
        }
    };

    const cargarDatos = useCallback(async () => {
        setLoading(true);
        try {
            const [estudiantesRes, boletinesRes] = await Promise.all([
                axios.get(`${API_URL}/usuarios/estudiante/`, getAuthHeaders()),
                axios.get(`${API_URL}/boletines/`, getAuthHeaders()),
            ]);

            const estudiantesSecundaria = estudiantesRes.data.filter(
                (est) =>
                    est.grado_seccion &&
                    est.grado_seccion.nivel === 'secundaria',
            );
            setEstudiantes(estudiantesSecundaria);
            setBoletines(boletinesRes.data);
            await getMateriasYProfesoresSecundaria();
        } catch (error) {
            console.error('Error al cargar datos:', error);
            addNotification('Error al cargar los datos iniciales.', 'error');
        } finally {
            setLoading(false);
        }
    }, [addNotification]);

    useEffect(() => {
        cargarDatos();
    }, [cargarDatos]);

    const handleOpenModal = () => {
        if (!filtroGrado || !filtroSeccion) {
            addNotification(
                'Por favor, seleccione un año y sección primero.',
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
            estudiantes.map((e) => e.grado_seccion?.grado).filter(Boolean),
        ),
    ].sort((a, b) => a - b);
    const seccionesUnicas = [
        ...new Set(
            estudiantes.map((e) => e.grado_seccion?.seccion).filter(Boolean),
        ),
    ].sort();

    if (loading) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
                <p>Cargando...</p>
            </div>
        );
    }

    return (
        <div className="container-boletines">
            <div className="boletines-header">
                <h1>Gestión de Boletines de Secundaria</h1>
                <p>
                    Visualiza, genera y descarga los boletines acumulativos por
                    lapso.
                </p>
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
                        <option value="">Todos los años</option>
                        {gradosUnicos.map((grado) => (
                            <option key={grado} value={grado}>
                                {grado}° Año
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
                        placeholder="Buscar estudiante..."
                        value={busquedaTexto}
                        onChange={(e) => setBusquedaTexto(e.target.value)}
                        className="periodo-selector"
                    />
                    <button
                        className="periodo-selector"
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
                            <th>Año y Sección</th>
                            <th className="text-center">Primer Lapso</th>
                            <th className="text-center">Segundo Lapso</th>
                            <th
                                className="text-center"
                                style={{ borderRadius: '0 8px 0 0' }}
                            >
                                Tercer Lapso
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {estudiantesFiltrados.map((estudiante) => (
                            <tr key={estudiante.id}>
                                <td>
                                    {estudiante.nombre} {estudiante.apellido}
                                </td>
                                <td>{estudiante.cedula || 'N/A'}</td>
                                <td>
                                    {estudiante.grado_seccion
                                        ? `${estudiante.grado_seccion.grado}° "${estudiante.grado_seccion.seccion}"`
                                        : 'N/A'}
                                </td>
                                {[1, 2, 3].map((lapso) => (
                                    <td
                                        key={lapso}
                                        className="table-cell text-center"
                                    >
                                        <LapsoActionCell
                                            estudianteId={estudiante.id}
                                            lapso={lapso}
                                            boletines={boletines}
                                            onUpdate={cargarDatos}
                                        />
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>

                {estudiantesFiltrados.length === 0 && (
                    <div className="no-results">
                        <p>No hay estudiantes que coincidan con los filtros.</p>
                    </div>
                )}
            </div>

            <ModalGenerarCabecera
                showModal={showModalGenerarCabecera}
                setShowModal={setShowModalGenerarCabecera}
                materias={materias}
                estudiantesFiltrados={estudiantesFiltrados}
                profesores={profesores}
            />
        </div>
    );
}
