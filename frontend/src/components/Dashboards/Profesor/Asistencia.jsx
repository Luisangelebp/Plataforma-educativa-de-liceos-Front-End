import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNotification } from '../../../context/NotificationContext';
import './css/Asistencia.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export function Asistencia() {
    const { addNotification } = useNotification();
    const [materias, setMaterias] = useState([]);
    const [estudiantes, setEstudiantes] = useState([]);
    const [asistencia, setAsistencia] = useState({});
    const [selectedMateria, setSelectedMateria] = useState('');
    const [selectedFecha, setSelectedFecha] = useState(new Date().toISOString().split('T')[0]);
    const [loading, setLoading] = useState(false);
    const [resumen, setResumen] = useState({
        total: 0,
        presentes: 0,
        ausentes: 0,
        justificados: 0,
        porcentaje: 0
    });

    useEffect(() => {
        fetchMaterias();
    }, []);

    useEffect(() => {
        if (selectedMateria && selectedFecha) {
            cargarEstudiantes();
        }
    }, [selectedMateria, selectedFecha]);

    useEffect(() => {
        calcularResumen();
    }, [asistencia, estudiantes]);

    const fetchMaterias = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const user = JSON.parse(localStorage.getItem('user'));

            // Obtener materias del profesor
            const response = await axios.get(`${API_URL}/horarios/materias/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMaterias(response.data);
        } catch (error) {
            console.error('Error al cargar materias:', error);
            addNotification('Error al cargar las materias', 'error');
        }
    };

    const cargarEstudiantes = async () => {
        if (!selectedMateria || !selectedFecha) return;

        setLoading(true);
        try {
            const token = localStorage.getItem('accessToken');
            const user = JSON.parse(localStorage.getItem('user'));

            // Obtener estudiantes de la materia seleccionada
            // Primero necesitamos obtener el grado_seccion de la materia
            const horariosResponse = await axios.get(`${API_URL}/horarios/`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const horarioMateria = horariosResponse.data.find(
                h => h.materia === parseInt(selectedMateria) && h.profesor === user.id
            );

            if (!horarioMateria) {
                addNotification('No se encontró horario para esta materia', 'warning');
                setLoading(false);
                return;
            }

            // Obtener estudiantes del grado_seccion
            const estudiantesResponse = await axios.get(
                `${API_URL}/usuarios/estudiante/?grado_seccion=${horarioMateria.grado_seccion}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setEstudiantes(estudiantesResponse.data);

            // Cargar asistencia existente
            cargarAsistenciaExistente(estudiantesResponse.data);
        } catch (error) {
            console.error('Error al cargar estudiantes:', error);
            addNotification('Error al cargar los estudiantes', 'error');
        } finally {
            setLoading(false);
        }
    };

    const cargarAsistenciaExistente = async (estudiantesList) => {
        try {
            const token = localStorage.getItem('accessToken');
            const asistenciaData = {};

            // Inicializar todos como ausentes
            estudiantesList.forEach(est => {
                asistenciaData[est.id] = {
                    estado: 'ausente',
                    justificacion: ''
                };
            });

            // TODO: Cargar asistencia desde el backend cuando esté implementado
            // Por ahora, inicializamos todos como ausentes

            setAsistencia(asistenciaData);
        } catch (error) {
            console.error('Error al cargar asistencia:', error);
        }
    };

    const handleAsistenciaChange = (estudianteId, estado) => {
        setAsistencia(prev => ({
            ...prev,
            [estudianteId]: {
                ...prev[estudianteId],
                estado: estado
            }
        }));
    };

    const handleJustificacionChange = (estudianteId, justificacion) => {
        setAsistencia(prev => ({
            ...prev,
            [estudianteId]: {
                ...prev[estudianteId],
                justificacion: justificacion
            }
        }));
    };

    const calcularResumen = () => {
        if (estudiantes.length === 0) {
            setResumen({ total: 0, presentes: 0, ausentes: 0, justificados: 0, porcentaje: 0 });
            return;
        }

        let presentes = 0;
        let ausentes = 0;
        let justificados = 0;

        estudiantes.forEach(est => {
            const estado = asistencia[est.id]?.estado || 'ausente';
            if (estado === 'presente') presentes++;
            else if (estado === 'ausente') ausentes++;
            else if (estado === 'justificado') justificados++;
        });

        const total = estudiantes.length;
        const porcentaje = total > 0 ? ((presentes + justificados * 0.5) / total * 100).toFixed(1) : 0;

        setResumen({ total, presentes, ausentes, justificados, porcentaje });
    };

    const guardarAsistencia = async () => {
        if (!selectedMateria || !selectedFecha) {
            addNotification('Por favor, seleccione materia y fecha', 'warning');
            return;
        }

        if (estudiantes.length === 0) {
            addNotification('No hay estudiantes para guardar', 'warning');
            return;
        }

        try {
            const token = localStorage.getItem('accessToken');
            const user = JSON.parse(localStorage.getItem('user'));

            // TODO: Implementar guardado en el backend cuando esté disponible
            // Por ahora, guardamos en localStorage como temporal
            const asistenciaData = {
                materia: selectedMateria,
                fecha: selectedFecha,
                profesor: user.id,
                registros: Object.keys(asistencia).map(estId => ({
                    estudiante: parseInt(estId),
                    estado: asistencia[estId].estado,
                    justificacion: asistencia[estId].justificacion || ''
                }))
            };

            // Guardar en localStorage temporalmente
            const asistenciaGuardada = JSON.parse(localStorage.getItem('asistencia') || '[]');
            asistenciaGuardada.push(asistenciaData);
            localStorage.setItem('asistencia', JSON.stringify(asistenciaGuardada));

            addNotification('Asistencia guardada correctamente', 'success');
        } catch (error) {
            console.error('Error al guardar asistencia:', error);
            addNotification('Error al guardar la asistencia', 'error');
        }
    };

    return (
        <>
            <div className="header">
                <div className="page-title">
                    <h1>Control de Asistencia</h1>
                    <p>Registre la asistencia de sus estudiantes</p>
                </div>
            </div>

            <div className="section-card">
                <div className="section-header">
                    <h2 className="section-title">Registrar Asistencia</h2>
                    <div className="attendance-actions">
                        <div className="input-with-icon">
                            <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>menu_book</span>
                            <select
                                value={selectedMateria}
                                onChange={(e) => setSelectedMateria(e.target.value)}
                                className="grade-input"
                                style={{ width: '200px' }}
                            >
                                <option value="">Seleccionar Materia</option>
                                {materias.map(materia => (
                                    <option key={materia.id} value={materia.id}>
                                        {materia.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="input-with-icon">
                            <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>calendar_month</span>
                            <input
                                type="date"
                                value={selectedFecha}
                                onChange={(e) => setSelectedFecha(e.target.value)}
                                className="grade-input"
                                style={{ width: '180px' }}
                            />
                        </div>
                        <button
                            className="btn btn-primary"
                            onClick={cargarEstudiantes}
                            disabled={!selectedMateria || !selectedFecha || loading}
                            style={{ width: 'auto', padding: '10px 20px', fontSize: '0.9rem' }}
                        >
                            <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>search</span>
                            Cargar
                        </button>
                    </div>
                </div>

                <div className="attendance-control">
                    <div>
                        <h3>Instrucciones</h3>
                        <p>1. Seleccione la materia y fecha</p>
                        <p>2. Marque la asistencia de cada estudiante</p>
                        <p>3. Guarde los cambios</p>
                        <div className="attendance-status">
                            <div><span className="status-dot status-present"></span> Presente</div>
                            <div><span className="status-dot status-absent"></span> Ausente</div>
                            <div><span className="status-dot status-justified"></span> Justificado</div>
                        </div>
                    </div>
                    <div>
                        <h3>Resumen del Día</h3>
                        <p>Total estudiantes: <strong>{resumen.total}</strong></p>
                        <p>Presentes: <strong style={{ color: '#38b000' }}>{resumen.presentes}</strong></p>
                        <p>Ausentes: <strong style={{ color: '#f72585' }}>{resumen.ausentes}</strong></p>
                        <p>Justificados: <strong style={{ color: '#f8961e' }}>{resumen.justificados}</strong></p>
                        <p>Porcentaje: <strong>{resumen.porcentaje}%</strong></p>
                    </div>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--gray)' }}>
                        Cargando estudiantes...
                    </div>
                ) : estudiantes.length > 0 ? (
                    <>
                        <div className="table-responsive">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Estudiante</th>
                                        <th>Cédula</th>
                                        <th>Asistencia</th>
                                        <th>Justificación</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {estudiantes.map(estudiante => (
                                        <tr key={estudiante.id}>
                                            <td>{estudiante.nombre} {estudiante.apellido}</td>
                                            <td>{estudiante.cedula || 'N/A'}</td>
                                            <td>
                                                <select
                                                    value={asistencia[estudiante.id]?.estado || 'ausente'}
                                                    onChange={(e) => handleAsistenciaChange(estudiante.id, e.target.value)}
                                                    className="grade-input"
                                                    style={{ width: '150px' }}
                                                >
                                                    <option value="presente">Presente</option>
                                                    <option value="ausente">Ausente</option>
                                                    <option value="justificado">Justificado</option>
                                                </select>
                                            </td>
                                            <td>
                                                <input
                                                    type="text"
                                                    value={asistencia[estudiante.id]?.justificacion || ''}
                                                    onChange={(e) => handleJustificacionChange(estudiante.id, e.target.value)}
                                                    className="grade-input"
                                                    placeholder="Motivo (opcional)"
                                                    style={{ width: '100%', textAlign: 'left' }}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div style={{ textAlign: 'center', marginTop: '20px' }}>
                            <button
                                className="btn btn-primary"
                                onClick={guardarAsistencia}
                                disabled={!selectedMateria || !selectedFecha}
                                style={{ width: 'auto', padding: '12px 30px', fontSize: '0.9rem' }}
                            >
                                <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>save</span>
                                Guardar Asistencia
                            </button>
                        </div>
                    </>
                ) : selectedMateria && selectedFecha ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--gray)' }}>
                        <p>No hay estudiantes asignados para esta materia</p>
                    </div>
                ) : null}
            </div>
        </>
    );
}
