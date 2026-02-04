import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNotification } from '../../../context/NotificationContext';
import { Modal, Input, Button } from 'antd';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export function CalificacionesSecundaria() {
    const { addNotification } = useNotification();
    const [calificaciones, setCalificaciones] = useState([]);
    const [materias, setMaterias] = useState([]);
    const [loading, setLoading] = useState(false);

    const [modalOpen, setModalOpen] = useState(false);
    const [nombreEvaluacion, setNombreEvaluacion] = useState('');

    const [filtroMateria, setFiltroMateria] = useState('');
    const [filtroLapso, setFiltroLapso] = useState('1');

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
        const cargarMaterias = async () => {
            try {
                const user = JSON.parse(localStorage.getItem('user'));
                const seccionesSecundaria = user.grado_secciones
                    .filter((gs) => gs.nivel === 'secundaria')
                    .map((gs) => gs.id);

                const response = await axios.get(
                    `${API_URL}/horarios/`,
                    getAxiosConfig(),
                );
                const idsMateriasProfe = response.data
                    .filter(
                        (item) =>
                            item.profesor === user.id &&
                            seccionesSecundaria.includes(item.grado_seccion),
                    )
                    .map((item) => item.materia);

                const resMate = await axios.get(
                    `${API_URL}/horarios/materias/`,
                    getAxiosConfig(),
                );
                setMaterias(
                    resMate.data.filter((m) => idsMateriasProfe.includes(m.id)),
                );
            } catch (error) {
                addNotification('Error al cargar materias', 'error');
            }
        };
        cargarMaterias();
    }, []);

    useEffect(() => {
        if (filtroMateria && filtroLapso) {
            cargarCalificaciones();
        }
    }, [filtroMateria, filtroLapso]);

    const cargarCalificaciones = async () => {
        setLoading(true);
        try {
            const response = await axios.get(
                `${API_URL}/calificaciones/?materia=${filtroMateria}&lapso=${filtroLapso}&nivel=secundaria`,
                getAxiosConfig(),
            );
            setCalificaciones(response.data);
        } catch (error) {
            addNotification('Error al cargar la planilla.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleAddEvaluacion = () => {
        if (calificaciones.length === 0) {
            addNotification(
                'No hay estudiantes para asignar evaluaciones.',
                'warning',
            );
            return;
        }
        setModalOpen(true);
    };

    const handleConfirmAddEvaluacion = async () => {
        if (!nombreEvaluacion) {
            addNotification(
                'El nombre de la evaluación es requerido.',
                'warning',
            );
            return;
        }

        try {
            const promesas = calificaciones.map((cal) =>
                axios.post(
                    `${API_URL}/calificaciones/${cal.id}/agregar_evaluacion/`,
                    {
                        nombre: nombreEvaluacion,
                        nota: 0,
                    },
                    getAxiosConfig(),
                ),
            );

            await Promise.all(promesas);
            addNotification('Evaluación añadida correctamente.', 'success');
            cargarCalificaciones();
        } catch (error) {
            addNotification('Error al crear la evaluación.', 'error');
        } finally {
            setModalOpen(false);
            setNombreEvaluacion('');
        }
    };

    const handleNotaChange = (calificacionId, evaluacionId, valor) => {
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

    // const handleObservacionChange = (calificacionId, value) => {
    //     setCalificaciones((prev) =>
    //         prev.map((cal) =>
    //             cal.id === calificacionId
    //                 ? { ...cal, observaciones: value }
    //                 : cal,
    //         ),
    //     );
    // };

    const handleSaveRow = async (calificacion) => {
        try {
            const evalPromises = calificacion.evaluaciones.map(
                ({ id, nota }) => {
                    const notaValue =
                        nota === '' || isNaN(parseFloat(nota))
                            ? 0
                            : parseFloat(nota);

                    return axios.patch(
                        `${API_URL}/calificaciones/evaluaciones/${id}/`,
                        { nota: notaValue },
                        getAxiosConfig(),
                    );
                },
            );

            // const obsPromise = axios.patch(
            //     `${API_URL}/calificaciones/${calificacion.id}/`,
            //     { observaciones: calificacion.observaciones || '' },
            //     getAxiosConfig(),
            // );

            await Promise.all([...evalPromises]);

            addNotification(
                `Notas de ${calificacion.estudiante_nombre} actualizadas.`,
                'success',
            );
            cargarCalificaciones();
        } catch (error) {
            addNotification('Error al guardar.', 'error');
        }
    };

    const finalizarEnvio = async () => {
        if (
            !window.confirm(
                '¿Confirma el envío final? Se bloqueará la edición.',
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
            addNotification('Lapso cerrado exitosamente.', 'success');
            cargarCalificaciones();
        } catch (error) {
            addNotification('Error al cerrar lapso.', 'error');
        }
    };

    const maxEvaluaciones =
        calificaciones.length > 0 ? calificaciones[0].evaluaciones : [];

    return (
        <div className="container-boletines">
            <div className="boletines-header">
                <h1>Carga de Notas: Secundaria</h1>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        onClick={handleAddEvaluacion}
                        className="btn-primary-materia"
                        disabled={
                            calificaciones.length === 0 ||
                            calificaciones[0]?.enviado
                        }
                        style={{ background: '#22c55e', color: 'white' }}
                    >
                        <i className="material-symbols-outlined">add_circle</i>{' '}
                        Nueva Nota
                    </button>
                    <button
                        onClick={finalizarEnvio}
                        className="btn-primary-materia"
                        disabled={
                            calificaciones.length === 0 ||
                            calificaciones[0]?.enviado
                        }
                    >
                        <i className="material-symbols-outlined">send</i> Enviar
                        al Admin
                    </button>
                </div>
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
                        {materias.map((m) => (
                            <option key={m.id} value={m.id}>
                                {m.nombre}
                            </option>
                        ))}
                    </select>
                    <select
                        className="periodo-selector"
                        value={filtroLapso}
                        onChange={(e) => setFiltroLapso(e.target.value)}
                    >
                        <option value="1">1er Lapso</option>
                        <option value="2">2do Lapso</option>
                        <option value="3">3er Lapso</option>
                    </select>
                </div>

                <table className="boletines-table">
                    <thead>
                        <tr>
                            <th style={{ borderRadius: '8px 0 0 0' }}>
                                Estudiante
                            </th>
                            {maxEvaluaciones.map((e, index) => (
                                <th key={e.id}>
                                    {e.nombre || `Nota ${index + 1}`}
                                </th>
                            ))}
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
                                <td colSpan={maxEvaluaciones.length + 5}>
                                    Cargando...
                                </td>
                            </tr>
                        ) : calificaciones.length === 0 ? (
                            <tr>
                                <td colSpan="10">
                                    No hay registros. El Admin debe iniciar la
                                    cabecera.
                                </td>
                            </tr>
                        ) : (
                            calificaciones.map((cal) => (
                                <tr key={cal.id}>
                                    <td>{cal.estudiante_nombre}</td>
                                    {cal.evaluaciones.map((evalu) => (
                                        <td key={evalu.id}>
                                            <input
                                                type="number"
                                                className={`nota-input ${cal.enviado ? 'input-locked' : ''}`}
                                                value={evalu.nota ?? ''}
                                                min="0"
                                                max="20"
                                                disabled={cal.enviado}
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
                                        {/* <Input
                                            className={`nota-input ${cal.enviado ? 'input-locked' : ''}`}
                                            value={cal.observaciones || ''}
                                            disabled={cal.enviado}
                                            onChange={(e) =>
                                                handleObservacionChange(
                                                    cal.id,
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Añadir observación..."
                                        /> */}
                                    </td>
                                    <td style={{ fontWeight: 'bold' }}>
                                        {cal.promedio}
                                    </td>
                                    <td>{cal.enviado ? '🔒' : '📝'}</td>
                                    <td>
                                        <button
                                            onClick={() => handleSaveRow(cal)}
                                            disabled={cal.enviado}
                                            className="btn-primary-materia"
                                            style={{ padding: '5px 10px' }}
                                        >
                                            Guardar
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            <Modal
                title="Añadir Nueva Evaluación"
                open={modalOpen}
                onOk={handleConfirmAddEvaluacion}
                onCancel={() => setModalOpen(false)}
                destroyOnClose
                wrapClassName="modal-overlay"
                className="modal-container"
                footer={[
                    <Button key="back" onClick={() => setModalOpen(false)}>
                        Cancelar
                    </Button>,
                    <Button
                        key="submit"
                        type="primary"
                        onClick={handleConfirmAddEvaluacion}
                    >
                        Aceptar
                    </Button>,
                ]}
            >
                <div className="modal-body">
                    <div className="form-group">
                        <label
                            htmlFor="nombre-evaluacion"
                            style={{ display: 'block', marginBottom: '8px' }}
                        >
                            Nombre de la Evaluación
                        </label>
                        <Input
                            autoFocus
                            id="nombre-evaluacion"
                            placeholder="Ej: Examen 1, Taller de Algebra..."
                            value={nombreEvaluacion}
                            onChange={(e) =>
                                setNombreEvaluacion(e.target.value)
                            }
                            onPressEnter={handleConfirmAddEvaluacion}
                        />
                    </div>
                </div>
            </Modal>
        </div>
    );
}
