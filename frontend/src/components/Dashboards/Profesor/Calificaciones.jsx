import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000') + '/';

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

export function Calificaciones() {
    const [materias, setMaterias] = useState([]);
    const [estudiantes, setEstudiantes] = useState([]);
    const [selectedMateria, setSelectedMateria] = useState('');
    const [selectedLapso, setSelectedLapso] = useState('1');
    const [calificaciones, setCalificaciones] = useState({});
    const [loading, setLoading] = useState(false);
    const profesorId = JSON.parse(localStorage.getItem('user')).id;
    const lapsoOptions = [
        { value: '1', label: 'Primer Lapso' },
        { value: '2', label: 'Segundo Lapso' },
        { value: '3', label: 'Tercer Lapso' },
    ];

    useEffect(() => {
        if (profesorId) {
            cargarMaterias();
        }
    }, [profesorId]);

    useEffect(() => {
        if (selectedMateria && selectedLapso) {
            cargarEstudiantes();
            cargarCalificaciones();
        }
    }, [selectedMateria, selectedLapso]);

    const cargarMaterias = async () => {
        try {
            const response = await axiosInstance.get('horarios/materias/');
            setMaterias(response.data);
        } catch (error) {
            console.error('Error al cargar materias:', error);
        }
    };

    const cargarEstudiantes = async () => {
        setLoading(true);
        try {
            // Obtener estudiantes de los grados asignados al profesor
            const response = await axiosInstance.get('usuarios/estudiante/');
            setEstudiantes(response.data);
        } catch (error) {
            console.error('Error al cargar estudiantes:', error);
        } finally {
            setLoading(false);
        }
    };

    const cargarCalificaciones = async () => {
        try {
            const response = await axiosInstance.get(
                `calificaciones/?materia=${selectedMateria}&lapso=${selectedLapso}`
            );
            const calificacionesData = {};

            response.data.forEach((cal) => {
                const key = `${cal.estudiante}_${selectedMateria}_${selectedLapso}`;
                calificacionesData[key] = {
                    id: cal.id,
                    notas: [
                        cal.nota1 !== null && cal.nota1 !== undefined
                            ? parseFloat(cal.nota1)
                            : '',
                        cal.nota2 !== null && cal.nota2 !== undefined
                            ? parseFloat(cal.nota2)
                            : '',
                        cal.nota3 !== null && cal.nota3 !== undefined
                            ? parseFloat(cal.nota3)
                            : '',
                        cal.nota4 !== null && cal.nota4 !== undefined
                            ? parseFloat(cal.nota4)
                            : '',
                    ],
                    promedio: cal.promedio ? parseFloat(cal.promedio) : 0,
                    enviado: cal.enviado,
                };
            });

            setCalificaciones(calificacionesData);
        } catch (error) {
            console.error('Error al cargar calificaciones:', error);
        }
    };

    const calcularPromedio = (notas) => {
        const notasValidas = notas.filter(
            (n) => n !== null && n !== undefined && n !== ''
        );
        if (notasValidas.length === 0) return 0;
        const suma = notasValidas.reduce(
            (acc, nota) => acc + parseFloat(nota),
            0
        );
        return (suma / notasValidas.length).toFixed(2);
    };

    const handleNotaChange = (estudianteId, notaIndex, value) => {
        const nota =
            value === ''
                ? ''
                : Math.max(0, Math.min(20, parseFloat(value) || 0));

        setCalificaciones((prev) => {
            const key = `${estudianteId}_${selectedMateria}_${selectedLapso}`;
            const calificacion = prev[key] || {
                notas: ['', '', '', ''],
                promedio: 0,
            };
            const nuevasNotas = [...calificacion.notas];
            nuevasNotas[notaIndex] = nota;
            const promedio = calcularPromedio(nuevasNotas);

            return {
                ...prev,
                [key]: {
                    ...calificacion,
                    notas: nuevasNotas,
                    promedio: parseFloat(promedio),
                },
            };
        });
    };

    const guardarCalificacion = async (estudianteId) => {
        const key = `${estudianteId}_${selectedMateria}_${selectedLapso}`;
        const calificacion = calificaciones[key];

        if (!calificacion || calificacion.notas.every((n) => n === '')) {
            alert('Debe ingresar al menos una nota');
            return;
        }

        // Verificar si ya está enviado
        if (calificacion.enviado) {
            alert('No se pueden modificar calificaciones ya enviadas');
            return;
        }

        try {
            const data = {
                estudiante: estudianteId,
                materia: selectedMateria,
                lapso: selectedLapso,
                nota1:
                    calificacion.notas[0] !== '' ? calificacion.notas[0] : null,
                nota2:
                    calificacion.notas[1] !== '' ? calificacion.notas[1] : null,
                nota3:
                    calificacion.notas[2] !== '' ? calificacion.notas[2] : null,
                nota4:
                    calificacion.notas[3] !== '' ? calificacion.notas[3] : null,
                profesor: profesorId,
            };

            if (calificacion.id) {
                // Actualizar calificación existente
                await axiosInstance.put(
                    `calificaciones/${calificacion.id}/`,
                    data
                );
            } else {
                // Crear nueva calificación
                await axiosInstance.post('calificaciones/', data);
            }

            // Recargar calificaciones para obtener el promedio calculado
            await cargarCalificaciones();
            alert('Calificación guardada exitosamente');
        } catch (error) {
            console.error('Error al guardar calificación:', error);
            const errorMsg =
                error.response?.data?.error ||
                error.response?.data?.detail ||
                'Error al guardar la calificación';
            alert(errorMsg);
        }
    };

    const enviarCalificacionesFinales = async () => {
        if (
            !window.confirm(
                '¿Está seguro de enviar las calificaciones finales? Esta acción no se puede deshacer y las calificaciones no podrán ser modificadas.'
            )
        ) {
            return;
        }

        try {
            const response = await axiosInstance.post(
                'calificaciones/enviar_finales/',
                {
                    materia: selectedMateria,
                    lapso: selectedLapso,
                }
            );

            alert(
                `Calificaciones finales enviadas exitosamente. ${
                    response.data.calificaciones_enviadas || 0
                } calificaciones fueron enviadas.`
            );

            // Recargar calificaciones para actualizar el estado
            await cargarCalificaciones();
        } catch (error) {
            console.error('Error al enviar calificaciones:', error);
            const errorMsg =
                error.response?.data?.error ||
                error.response?.data?.detail ||
                'Error al enviar las calificaciones finales';
            alert(errorMsg);
        }
    };

    return (
        <div className="">
            <div className="header">
                <div
                    className="page-title"
                    style={{ width: '100%', textAlign: 'center' }}
                >
                    <h1 style={{ color: 'var(--dark)', margin: 0 }}>
                        Registro de Calificaciones
                    </h1>
                    <p style={{ color: 'var(--gray)', margin: '8px 0 0 0' }}>
                        Registra y gestiona las calificaciones de tus
                        estudiantes
                    </p>
                </div>
            </div>

            <div
                className="section-card"
                style={{ maxWidth: '1400px', margin: '0 auto' }}
            >
                <div
                    style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '20px',
                        marginBottom: '25px',
                        paddingBottom: '20px',
                        borderBottom: '2px solid var(--light-gray)',
                        alignItems: 'center',
                    }}
                >
                    <div style={{ flex: '1', minWidth: '250px' }}>
                        <label
                            style={{
                                display: 'block',
                                marginBottom: '8px',
                                fontSize: '0.95rem',
                                fontWeight: '500',
                                color: 'var(--dark)',
                            }}
                        >
                            <i
                                className="fas fa-book"
                                style={{
                                    marginRight: '6px',
                                    color: 'var(--primary)',
                                }}
                            ></i>
                            Materia *
                        </label>
                        <select
                            value={selectedMateria}
                            onChange={(e) => setSelectedMateria(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '12px 15px',
                                border: '2px solid var(--light-gray)',
                                borderRadius: 'var(--border-radius)',
                                fontSize: '0.95rem',
                                background: 'white',
                                color: 'var(--dark)',
                                cursor: 'pointer',
                                transition: 'var(--transition)',
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
                            <option value="">Seleccione una materia</option>
                            {materias.map((materia) => (
                                <option key={materia.id} value={materia.id}>
                                    {materia.nombre}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div style={{ flex: '1', minWidth: '250px' }}>
                        <label
                            style={{
                                display: 'block',
                                marginBottom: '8px',
                                fontSize: '0.95rem',
                                fontWeight: '500',
                                color: 'var(--dark)',
                            }}
                        >
                            <i
                                className="fas fa-calendar-alt"
                                style={{
                                    marginRight: '6px',
                                    color: 'var(--primary)',
                                }}
                            ></i>
                            Lapso *
                        </label>
                        <select
                            value={selectedLapso}
                            onChange={(e) => setSelectedLapso(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '12px 15px',
                                border: '2px solid var(--light-gray)',
                                borderRadius: 'var(--border-radius)',
                                fontSize: '0.95rem',
                                background: 'white',
                                color: 'var(--dark)',
                                cursor: 'pointer',
                                transition: 'var(--transition)',
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

                    {selectedMateria && (
                        <div
                            style={{ display: 'flex', alignItems: 'flex-end' }}
                        >
                            <button
                                onClick={enviarCalificacionesFinales}
                                style={{
                                    padding: '12px 24px',
                                    background: 'var(--success)',
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
                                        '0 4px 15px rgba(76, 201, 240, 0.3)',
                                    whiteSpace: 'nowrap',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background =
                                        '#3db8d1';
                                    e.currentTarget.style.transform =
                                        'translateY(-2px)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background =
                                        'var(--success)';
                                    e.currentTarget.style.transform =
                                        'translateY(0)';
                                }}
                            >
                                <i
                                    className="fas fa-paper-plane"
                                    style={{ fontSize: '0.85rem' }}
                                ></i>
                                Enviar Calificaciones Finales
                            </button>
                        </div>
                    )}
                </div>

                {!selectedMateria ? (
                    <div
                        style={{
                            padding: '60px',
                            textAlign: 'center',
                            color: 'var(--gray)',
                            fontSize: '0.95rem',
                        }}
                    >
                        <i
                            className="fas fa-book-open"
                            style={{
                                fontSize: '3rem',
                                color: 'var(--light-gray)',
                                marginBottom: '15px',
                                display: 'block',
                            }}
                        ></i>
                        Seleccione una materia para comenzar
                    </div>
                ) : loading ? (
                    <div
                        style={{
                            padding: '40px',
                            textAlign: 'center',
                            color: 'var(--gray)',
                            fontSize: '0.95rem',
                        }}
                    >
                        <i
                            className="fas fa-spinner fa-spin"
                            style={{
                                fontSize: '2rem',
                                marginBottom: '15px',
                                display: 'block',
                            }}
                        ></i>
                        Cargando estudiantes...
                    </div>
                ) : estudiantes.length === 0 ? (
                    <div
                        style={{
                            padding: '40px',
                            textAlign: 'center',
                            color: 'var(--gray)',
                            fontSize: '0.95rem',
                        }}
                    >
                        <i
                            className="fas fa-users"
                            style={{
                                fontSize: '3rem',
                                color: 'var(--light-gray)',
                                marginBottom: '15px',
                                display: 'block',
                            }}
                        ></i>
                        No hay estudiantes asignados
                    </div>
                ) : (
                    <div className="table-container">
                        <table
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
                                            textAlign: 'center',
                                            fontWeight: '600',
                                            fontSize: '0.95rem',
                                        }}
                                    >
                                        Nota 1
                                    </th>
                                    <th
                                        style={{
                                            padding: '15px',
                                            textAlign: 'center',
                                            fontWeight: '600',
                                            fontSize: '0.95rem',
                                        }}
                                    >
                                        Nota 2
                                    </th>
                                    <th
                                        style={{
                                            padding: '15px',
                                            textAlign: 'center',
                                            fontWeight: '600',
                                            fontSize: '0.95rem',
                                        }}
                                    >
                                        Nota 3
                                    </th>
                                    <th
                                        style={{
                                            padding: '15px',
                                            textAlign: 'center',
                                            fontWeight: '600',
                                            fontSize: '0.95rem',
                                        }}
                                    >
                                        Nota 4
                                    </th>
                                    <th
                                        style={{
                                            padding: '15px',
                                            textAlign: 'center',
                                            fontWeight: '600',
                                            fontSize: '0.95rem',
                                        }}
                                    >
                                        Promedio
                                    </th>
                                    <th
                                        style={{
                                            padding: '15px',
                                            textAlign: 'center',
                                            fontWeight: '600',
                                            fontSize: '0.95rem',
                                        }}
                                    >
                                        Acción
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {estudiantes.map((estudiante) => {
                                    const key = `${estudiante.id}_${selectedMateria}_${selectedLapso}`;
                                    const calificacion = calificaciones[
                                        key
                                    ] || {
                                        notas: ['', '', '', ''],
                                        promedio: 0,
                                    };

                                    return (
                                        <tr
                                            key={estudiante.id}
                                            style={{
                                                borderBottom:
                                                    '1px solid var(--light-gray)',
                                                transition: 'var(--transition)',
                                                opacity: calificacion.enviado
                                                    ? 0.7
                                                    : 1,
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
                                                {calificacion.enviado && (
                                                    <span
                                                        style={{
                                                            marginLeft: '8px',
                                                            padding: '2px 8px',
                                                            background:
                                                                'var(--success)',
                                                            color: 'white',
                                                            borderRadius:
                                                                '12px',
                                                            fontSize: '0.7rem',
                                                            fontWeight: '500',
                                                        }}
                                                    >
                                                        Enviado
                                                    </span>
                                                )}
                                            </td>
                                            {[0, 1, 2, 3].map((index) => (
                                                <td
                                                    key={index}
                                                    style={{
                                                        padding: '10px',
                                                        textAlign: 'center',
                                                    }}
                                                >
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max="20"
                                                        step="0.01"
                                                        value={
                                                            calificacion.notas[
                                                                index
                                                            ] || ''
                                                        }
                                                        onChange={(e) =>
                                                            handleNotaChange(
                                                                estudiante.id,
                                                                index,
                                                                e.target.value
                                                            )
                                                        }
                                                        placeholder="0-20"
                                                        disabled={
                                                            calificacion.enviado
                                                        }
                                                        style={{
                                                            width: '80px',
                                                            padding: '8px',
                                                            border: '2px solid var(--light-gray)',
                                                            borderRadius:
                                                                'var(--border-radius)',
                                                            fontSize: '0.9rem',
                                                            textAlign: 'center',
                                                            transition:
                                                                'var(--transition)',
                                                            background:
                                                                calificacion.enviado
                                                                    ? 'var(--light-gray)'
                                                                    : 'white',
                                                            cursor: calificacion.enviado
                                                                ? 'not-allowed'
                                                                : 'text',
                                                        }}
                                                        onFocus={(e) => {
                                                            if (
                                                                !calificacion.enviado
                                                            ) {
                                                                e.currentTarget.style.borderColor =
                                                                    'var(--primary)';
                                                                e.currentTarget.style.boxShadow =
                                                                    '0 0 0 3px rgba(67, 97, 238, 0.1)';
                                                            }
                                                        }}
                                                        onBlur={(e) => {
                                                            e.currentTarget.style.borderColor =
                                                                'var(--light-gray)';
                                                            e.currentTarget.style.boxShadow =
                                                                'none';
                                                        }}
                                                    />
                                                </td>
                                            ))}
                                            <td
                                                style={{
                                                    padding: '15px',
                                                    textAlign: 'center',
                                                    fontSize: '1rem',
                                                    fontWeight: '600',
                                                    color:
                                                        calificacion.promedio >=
                                                        10
                                                            ? 'var(--success)'
                                                            : calificacion.promedio >
                                                              0
                                                            ? 'var(--warning)'
                                                            : 'var(--gray)',
                                                }}
                                            >
                                                {calificacion.promedio > 0
                                                    ? calificacion.promedio.toFixed(
                                                          2
                                                      )
                                                    : '—'}
                                            </td>
                                            <td
                                                style={{
                                                    padding: '15px',
                                                    textAlign: 'center',
                                                }}
                                            >
                                                {calificacion.enviado ? (
                                                    <span
                                                        style={{
                                                            padding: '6px 12px',
                                                            background:
                                                                'var(--success)',
                                                            color: 'white',
                                                            borderRadius:
                                                                'var(--border-radius)',
                                                            fontSize: '0.85rem',
                                                            fontWeight: '500',
                                                            display:
                                                                'inline-flex',
                                                            alignItems:
                                                                'center',
                                                            gap: '6px',
                                                        }}
                                                    >
                                                        <i
                                                            className="fas fa-check-circle"
                                                            style={{
                                                                fontSize:
                                                                    '0.75rem',
                                                            }}
                                                        ></i>
                                                        Enviado
                                                    </span>
                                                ) : (
                                                    <button
                                                        onClick={() =>
                                                            guardarCalificacion(
                                                                estudiante.id
                                                            )
                                                        }
                                                        style={{
                                                            padding: '8px 16px',
                                                            background:
                                                                'var(--primary)',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius:
                                                                'var(--border-radius)',
                                                            fontSize: '0.85rem',
                                                            fontWeight: '500',
                                                            cursor: 'pointer',
                                                            display:
                                                                'inline-flex',
                                                            alignItems:
                                                                'center',
                                                            gap: '6px',
                                                            transition:
                                                                'var(--transition)',
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            e.currentTarget.style.background =
                                                                'var(--primary-dark)';
                                                            e.currentTarget.style.transform =
                                                                'translateY(-2px)';
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.currentTarget.style.background =
                                                                'var(--primary)';
                                                            e.currentTarget.style.transform =
                                                                'translateY(0)';
                                                        }}
                                                    >
                                                        <i
                                                            className="fas fa-save"
                                                            style={{
                                                                fontSize:
                                                                    '0.75rem',
                                                            }}
                                                        ></i>
                                                        Guardar
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
