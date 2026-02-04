import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNotification } from '../../../context/NotificationContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export function CalificacionesPrimaria() {
    const { addNotification } = useNotification();
    const [calificaciones, setCalificaciones] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filtroMateria, setFiltroMateria] = useState('');
    const [filtroLapso, setFiltroLapso] = useState('1');
    const [materias, setMaterias] = useState([]);
    const [alterProm, setAlterProm] = useState(0);
    let grados_secciones = JSON.parse(localStorage.getItem('user'))
        .grado_secciones.filter((gs) => gs.nivel === 'primaria')
        .map((gs) => {
            return gs.id;
        });

    // Configuración de Axios con el Token de localStorage
    const getAxiosConfig = () => {
        const token = localStorage.getItem('accessToken');
        return {
            headers: {
                Authorization: token ? `Bearer ${token}` : '',
                'Content-Type': 'application/json',
            },
        };
    };
    useEffect(() => {
        if (filtroMateria && filtroLapso) {
            console.log(filtroMateria, filtroLapso);
            cargarCalificaciones();
        }
    }, [filtroMateria, filtroLapso]);

    useEffect(() => {
        cargarMaterias();
    }, []);

    const cargarMaterias = async () => {
        try {
            const response = await axios.get(
                `${API_URL}/horarios/`,
                getAxiosConfig(),
            );
            let materiasProfe = response.data
                .filter(
                    (item) =>
                        item.profesor ===
                            JSON.parse(localStorage.getItem('user')).id &&
                        grados_secciones.includes(item.grado_seccion),
                )
                .map((item) => item.materia);
            const resMate = await axios.get(
                `${API_URL}/horarios/materias/`,
                getAxiosConfig(),
            );
            setMaterias(
                resMate.data.filter((item) => materiasProfe.includes(item.id)),
            );
        } catch (error) {
            console.error('Error al cargar materias:', error);
            addNotification('Error al cargar las materias', 'error');
        }
    };
    const cargarCalificaciones = async () => {
        setLoading(true);
        try {
            const response = await axios.get(
                `${API_URL}/calificaciones/?materia=${filtroMateria}&lapso=${filtroLapso}&nivel=primaria`,
                getAxiosConfig(),
            );
            setCalificaciones(response.data);
        } catch (error) {
            console.error('Error al cargar calificaciones:', error);
            addNotification('Error al cargar la planilla de notas.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleNotaChange = (calificacionId, evaluacionId, valor) => {
        setAlterProm(parseFloat(valor));
        setCalificaciones((prev) =>
            prev.map((cal) => {
                if (cal.id === calificacionId) {
                    const nuevasEvals = cal.evaluaciones.map((e) =>
                        e.id === evaluacionId ? { ...e, nota: valor } : e,
                    );
                    return { ...cal, evaluaciones: nuevasEvals };
                }
                return cal;
            }),
        );
    };

    const handleObservacionChange = (calificacionId, valor) => {
        setCalificaciones((prev) =>
            prev.map((cal) =>
                cal.id === calificacionId
                    ? { ...cal, observaciones: valor }
                    : cal,
            ),
        );
    };

    const handleSendRow = async (calificacion) => {
        const evalPromises = calificacion.evaluaciones.map(({ id, nota }) => {
            const notaValue =
                nota === '' || isNaN(parseFloat(nota))
                    ? null
                    : parseFloat(nota);

            return axios.patch(
                `${API_URL}/calificaciones/evaluaciones/${id}/`,
                { nota: notaValue },
                getAxiosConfig(),
            );
        });
        console.log(calificacion);

        const obsPromise = axios.patch(
            `${API_URL}/calificaciones/${calificacion.id}/`,
            { observaciones: calificacion.observaciones ?? null },
            getAxiosConfig(),
        );

        try {
            await Promise.all([...evalPromises, obsPromise]);
            addNotification(
                'Notas y observaciones del estudiante guardadas exitosamente.',
                'success',
            );
            cargarCalificaciones();
        } catch (error) {
            if (error.response?.status === 403) {
                addNotification(
                    'Esta planilla está bloqueada: el lapso ya fue enviado.',
                    'warning',
                );
            } else {
                addNotification(
                    'Error al guardar la información del estudiante.',
                    'error',
                );
            }
        }
    };

    const finalizarEnvio = async () => {
        if (
            !window.confirm(
                '¿Confirma el envío final? Las notas se bloquearán y no podrá editarlas más.',
            )
        )
            return;

        try {
            await axios.post(
                `${API_URL}/calificaciones/enviar_finales/`,
                {
                    materia: filtroMateria,
                    lapso: filtroLapso,
                },
                getAxiosConfig(),
            );
            addNotification(
                'Notas enviadas exitosamente. El registro ha sido bloqueado.',
                'success',
            );
            cargarCalificaciones(); // Refrescar para aplicar el estado 'enviado' (disabled)
        } catch (error) {
            addNotification('Error al finalizar el lapso.', 'error');
        }
    };

    return (
        <div className="container-boletines">
            <div className="boletines-header">
                <h1>Carga de Notas: Primaria</h1>
                <button
                    onClick={finalizarEnvio}
                    className="btn-primary-materia"
                    disabled={
                        calificaciones.length === 0 ||
                        calificaciones[0]?.enviado
                    }
                >
                    <i
                        className="material-symbols-outlined"
                        style={{ marginRight: '8px' }}
                    >
                        send
                    </i>
                    Enviar Finales al Admin
                </button>
            </div>

            <div className="table-container" style={{ padding: '20px' }}>
                <div
                    className="filters-container"
                    style={{ marginBottom: '20px' }}
                >
                    <select
                        className="periodo-selector"
                        value={filtroMateria}
                        onChange={(e) => setFiltroMateria(e.target.value)}
                    >
                        <option value="">Seleccione Materia</option>
                        {materias.map((materia) => (
                            <option key={materia.id} value={materia.id}>
                                {materia.nombre}
                            </option>
                        ))}
                    </select>

                    <select
                        className="periodo-selector"
                        value={filtroLapso}
                        onChange={(e) => setFiltroLapso(e.target.value)}
                    >
                        <option value="1">Primer Lapso</option>
                        <option value="2">Segundo Lapso</option>
                        <option value="3">Tercer Lapso</option>
                    </select>
                </div>

                <table className="boletines-table">
                    <thead>
                        <tr>
                            <th style={{ borderRadius: '8px 0 0 0' }}>
                                Estudiante
                            </th>
                            <th>Nota 1</th>
                            <th>Nota 2</th>
                            <th>Nota 3</th>
                            <th>Nota 4</th>
                            <th>Observaciones</th>
                            <th>Promedio</th>
                            <th>Estado</th>
                            <th style={{ borderRadius: '0 8px 0 0' }}>
                                Acciones
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="9">Cargando planilla...</td>
                            </tr>
                        ) : calificaciones.length === 0 &&
                          filtroMateria &&
                          filtroLapso ? (
                            <tr>
                                <td colSpan="9">
                                    El administrador aun no a iniciado la
                                    cabezera de las notas
                                </td>
                            </tr>
                        ) : calificaciones.length === 0 ? (
                            <tr>
                                <td colSpan="9">
                                    Seleccione materia y lapso para comenzar
                                </td>
                            </tr>
                        ) : (
                            calificaciones.map((cal) => (
                                <tr key={cal.id}>
                                    <td>{cal.estudiante_nombre}</td>
                                    {/* Mapeo de evaluaciones hijas automáticas de Primaria */}
                                    {cal.evaluaciones.map((evalu) => (
                                        <td key={evalu.id}>
                                            <input
                                                type="number"
                                                className={`nota-input ${cal.enviado ? 'input-locked' : ''}`}
                                                value={evalu.nota ?? ''}
                                                min="0"
                                                max="20"
                                                disabled={cal.enviado} // Bloqueo si enviado es true
                                                onChange={(e) =>
                                                    handleNotaChange(
                                                        cal.id,
                                                        evalu.id,
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                        </td>
                                    ))}
                                    <td>
                                        <textarea
                                            className={`nota-input ${cal.enviado ? 'input-locked' : ''}`}
                                            value={cal.observaciones ?? ''}
                                            disabled={cal.enviado}
                                            onChange={(e) =>
                                                handleObservacionChange(
                                                    cal.id,
                                                    e.target.value,
                                                )
                                            }
                                            rows="1"
                                            style={{ resize: 'vertical' }}
                                        />
                                    </td>
                                    {/* El promedio es de solo lectura calculado automáticamente */}
                                    <td style={{ fontWeight: 'bold' }}>
                                        {cal.promedio}
                                    </td>
                                    <td>
                                        {cal.enviado ? (
                                            <span className="status-locked">
                                                🔒 Bloqueado
                                            </span>
                                        ) : (
                                            <span className="status-open">
                                                📝 Editando
                                            </span>
                                        )}
                                    </td>
                                    <td>
                                        <button
                                            onClick={() => handleSendRow(cal)}
                                            disabled={cal.enviado}
                                            className="btn-primary-materia"
                                            style={{
                                                padding: '5px 10px',
                                                minWidth: '80px',
                                            }}
                                        >
                                            Enviar
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
