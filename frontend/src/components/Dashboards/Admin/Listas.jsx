import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './css/Listas.css';

const API_URL = `${
    import.meta.env.VITE_API_URL || 'http://localhost:8000'
}/usuarios/`;

// Componente de Ficha/Card
const UserCard = ({
    user,
    type,
    onCardClick,
    onEdit,
    onDelete,
    onAssing,
    onAssingP,
}) => {
    const getPhotoUrl = (foto) => {
        if (!foto) return '/default-avatar.png';
        if (foto.startsWith('http')) return foto;
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
        return `${baseUrl}${foto}`;
    };
    return (
        <div className="user-card" onClick={() => onCardClick(user)}>
            <div className="card-photo">
                {user.foto ? (
                    <img
                        src={getPhotoUrl(user.foto)}
                        alt={`${user.nombre} ${user.apellido}`}
                    />
                ) : (
                    <i className="fas fa-user-circle default-foto-user"></i>
                )}
            </div>
            <div className="card-info">
                <h3>
                    {user.nombre} {user.apellido}
                </h3>
                {type === 'estudiante' && (
                    <>
                        <p>
                            <strong>
                                {user.grado_seccion?.nivel === 'primaria'
                                    ? 'Grado'
                                    : user.grado_seccion?.nivel === 'secundaria'
                                    ? 'Año'
                                    : 'Grado/Año'}
                                :
                            </strong>{' '}
                            {user.grado_seccion?.grado
                                ? `${user.grado_seccion.grado}° ${
                                      user.grado_seccion.nivel === 'primaria'
                                          ? 'Grado'
                                          : user.grado_seccion.nivel ===
                                            'secundaria'
                                          ? 'Año'
                                          : ''
                                  }`
                                : user.grado || 'N/A'}
                        </p>
                        <p>
                            <strong>Sección:</strong>{' '}
                            {user.grado_seccion?.seccion ||
                                user.seccion ||
                                'N/A'}
                        </p>
                        <p>
                            <strong>Nivel:</strong>{' '}
                            {user.grado_seccion?.nivel || user.nivel || 'N/A'}
                        </p>
                        <p>
                            <strong>Edad:</strong>{' '}
                            {user.edad ? `${user.edad} años` : 'N/A'}
                        </p>
                    </>
                )}
                {type === 'profesor' && (
                    <>
                        <p>
                            <strong>Grados Asignados:</strong>{' '}
                            {user.grado_secciones &&
                            user.grado_secciones.length > 0
                                ? user.grado_secciones
                                      .map(
                                          (gs) =>
                                              `${gs.grado}° ${
                                                  gs.nivel === 'primaria'
                                                      ? 'Grado'
                                                      : 'Año'
                                              } ${gs.seccion}`
                                      )
                                      .join(', ')
                                : user.grado_asignado || 'Sin asignar'}
                        </p>
                        <p>
                            <strong>Tipo:</strong> {user.tipo_profesor || 'N/A'}
                        </p>
                        <p>
                            <strong>Edad:</strong>{' '}
                            {user.edad ? `${user.edad} años` : 'N/A'}
                        </p>
                    </>
                )}
                {type === 'representante' && (
                    <>
                        <p>
                            <strong>Cédula:</strong> {user.cedula}
                        </p>
                        <p>
                            <strong>Edad:</strong> {user.edad} años
                        </p>
                    </>
                )}
            </div>
            {type === 'estudiante' && (
                <button
                    className="btn-assing"
                    onClick={(e) => {
                        e.stopPropagation();
                        onAssing(user);
                    }}
                >
                    <i className="fas fa-user-plus"></i> Asignar Representante
                </button>
            )}
            {type === 'profesor' && (
                <button
                    className="btn-assing"
                    onClick={(e) => {
                        e.stopPropagation();
                        onAssingP(user);
                    }}
                >
                    <i className="fa-solid fa-book"></i> Asignar Curso y Sección
                </button>
            )}

            <div className="card-actions">
                <button
                    className="btn-edit"
                    onClick={(e) => {
                        e.stopPropagation();
                        onEdit(user);
                    }}
                >
                    <i className="fas fa-edit"></i> Editar
                </button>
                <button
                    className="btn-delete"
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(user);
                    }}
                >
                    <i className="fas fa-trash"></i> Eliminar
                </button>
            </div>
        </div>
    );
};

// Componente de Fila para Tabla
const UserRow = ({
    user,
    type,
    onRowClick,
    onEdit,
    onDelete,
    onAssing,
    onAssingP,
}) => {
    const getPhotoUrl = (foto) => {
        if (!foto) return '/default-avatar.png';
        if (foto.startsWith('http')) return foto;
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
        return `${baseUrl}${foto}`;
    };

    return (
        <tr onClick={() => onRowClick(user)} className="user-row">
            <td className="user-photo">
                <img
                    src={getPhotoUrl(user.foto)}
                    alt={`${user.nombre} ${user.apellido}`}
                    className="user-avatar"
                    onError={(e) => {
                        e.target.src =
                            'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHZpZXdCb3g9IjAgMCA1MCA1MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjUwIiBoZWlnaHQ9IjUwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0yNSAyNUMzMC41MjI4IDI1IDM1IDI5LjQ3NzIgMzUgMzVDMzUgNDAuNTIyOCAzMC41MjI4IDQ1IDI1IDQ1QzE5LjQ3NzIgNDUgMTUgNDAuNTIyOCAxNSAzNUMxNSAyOS40NzcyIDE5LjQ3NzIgMjUgMjUgMjVaIiBmaWxsPSIjQ0NDQ0NDIi8+CjxwYXRoIGQ9Ik0yNSAxNEMyNy43NjE0IDE0IDMwIDE2LjIzODYgMzAgMTlDMzAgMjEuNzYxNCAyNy43NjE0IDI0IDI1IDI0QzIyLjIzODYgMjQgMjAgMjEuNzYxNCAyMCAxOUMyMCAxNi4yMzg2IDIyLjIzODYgMTQgMjUgMTRaIiBmaWxsPSIjQ0NDQ0NDIi8+Cjwvc3ZnPgo=';
                    }}
                />
            </td>
            <td className="user-name">
                {user.nombre} {user.apellido}
            </td>
            {type === 'estudiante' && (
                <>
                    <td>{user.cedula || 'N/A'}</td>
                    <td>{user.grado_seccion?.grado || user.grado || 'N/A'}</td>
                    <td>
                        {user.grado_seccion?.seccion || user.seccion || 'N/A'}
                    </td>
                    <td>{user.grado_seccion?.nivel || user.nivel || 'N/A'}</td>
                    <td>{user.edad ? `${user.edad} años` : 'N/A'}</td>
                </>
            )}
            {type === 'profesor' && (
                <>
                    <td>{user.cedula || 'N/A'}</td>
                    <td>
                        {user.grado_secciones &&
                        Array.isArray(user.grado_secciones) &&
                        user.grado_secciones.length > 0
                            ? user.grado_secciones
                                  .map((gs, idx) => {
                                      // Manejar tanto objetos como valores primitivos
                                      const grado =
                                          typeof gs === 'object' && gs !== null
                                              ? gs.grado
                                              : gs;
                                      const seccion =
                                          typeof gs === 'object' && gs !== null
                                              ? gs.seccion
                                              : '';
                                      const nivel =
                                          typeof gs === 'object' && gs !== null
                                              ? gs.nivel
                                              : '';
                                      return `${grado || ''} ${
                                          seccion || ''
                                      } (${nivel || ''})`.trim();
                                  })
                                  .filter(Boolean)
                                  .join(', ') || 'Sin grados asignados'
                            : 'Sin grados asignados'}
                    </td>
                    <td>{user.tipo_profesor || 'N/A'}</td>
                    <td>{user.edad ? `${user.edad} años` : 'N/A'}</td>
                    <td>{user.telefono || 'N/A'}</td>
                </>
            )}
            {type === 'representante' && (
                <>
                    <td>{user.cedula || 'N/A'}</td>
                    <td>{user.edad ? `${user.edad} años` : 'N/A'}</td>
                    <td>{user.telefono || 'N/A'}</td>
                    <td>{user.estudiantes?.length || 0} estudiante(s)</td>
                </>
            )}
            <td className="user-actions" onClick={(e) => e.stopPropagation()}>
                {type === 'estudiante' && (
                    <button
                        className="btn-assing"
                        onClick={(e) => {
                            e.stopPropagation();
                            onAssing(user);
                        }}
                        title="Asignar Representante"
                    >
                        <i className="fas fa-user-plus"></i>
                    </button>
                )}
                {type === 'profesor' && (
                    <button
                        className="btn-assing"
                        onClick={(e) => {
                            e.stopPropagation();
                            onAssingP(user);
                        }}
                        title="Asignar Curso y Sección"
                    >
                        <i className="fa-solid fa-book"></i>
                    </button>
                )}
                <button
                    className="btn-edit"
                    onClick={(e) => {
                        e.stopPropagation();
                        onEdit(user);
                    }}
                    title="Editar"
                >
                    <i className="fas fa-edit"></i>
                </button>
                <button
                    className="btn-delete"
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(user);
                    }}
                    title="Eliminar"
                >
                    <i className="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    );
};

// Custom hook to lock body scroll
const useBodyOverflowLock = (isLocked) => {
    useEffect(() => {
        if (isLocked) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isLocked]);
};

// Modal de Detalle
const DetailModal = ({ user, type, isOpen, onClose, onEdit }) => {
    const [representante, setRepresentante] = useState(null);
    useBodyOverflowLock(isOpen);
    const getPhotoUrl = (foto) => {
        if (!foto) return '/default-avatar.png';
        if (foto.startsWith('http')) return foto;
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
        return `${baseUrl}${foto}`;
    };

    const fetchRepresentantesById = async (id) => {
        try {
            const response = await axios.get(`${API_URL}representante/${id}/`);
            setRepresentante(response.data);
        } catch (error) {
            console.error('Error al cargar representante:', error);
            setRepresentante(null); // Reset on error
        }
    };

    useEffect(() => {
        if (type === 'estudiante' && user?.representante) {
            fetchRepresentantesById(user.representante);
        }
    }, [type, user?.representante]);

    if (!isOpen || !user) return null;
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Información Completa</h2>
                    <button className="close-btn" onClick={onClose}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>
                <div className="modal-body">
                    <div className="detail-photo">
                        <img
                            src={getPhotoUrl(user.foto)}
                            alt={`${user.nombre} ${user.apellido}`}
                            onError={(e) => {
                                e.target.src =
                                    'https://via.placeholder.com/200?text=Sin+Foto';
                            }}
                        />
                    </div>
                    <div className="detail-info">
                        <div className="detail-row">
                            <strong>Nombre:</strong>
                            <span>
                                {user.nombre} {user.apellido}
                            </span>
                        </div>
                        <div className="detail-row">
                            <strong>Fecha de Nacimiento:</strong>
                            <span>
                                {new Date(
                                    user.fecha_nacimiento
                                ).toLocaleDateString('es-ES')}
                            </span>
                        </div>
                        <div className="detail-row">
                            <strong>Edad:</strong>
                            <span>{user.edad} años</span>
                        </div>
                        {user.cedula && (
                            <div className="detail-row">
                                <strong>Cédula:</strong>
                                <span>{user.cedula}</span>
                            </div>
                        )}
                        {user.direccion && (
                            <div className="detail-row">
                                <strong>Dirección:</strong>
                                <span>{user.direccion}</span>
                            </div>
                        )}
                        {type === 'estudiante' && (
                            <>
                                <div className="detail-row">
                                    <strong>Grado:</strong>
                                    <span>{user.grado}</span>
                                </div>
                                <div className="detail-row">
                                    <strong>Nivel:</strong>
                                    <span>{user.nivel}</span>
                                </div>
                                {representante && (
                                    <div className="detail-row">
                                        <strong>Representante:</strong>
                                        <span>
                                            {representante.nombre}{' '}
                                            {representante.apellido} - C.I:{' '}
                                            {representante.cedula}
                                        </span>
                                    </div>
                                )}
                            </>
                        )}
                        {type === 'profesor' && (
                            <>
                                <div className="detail-row">
                                    <strong>Grados Asignados:</strong>
                                    <span>
                                        {user.grado_secciones &&
                                        user.grado_secciones.length > 0
                                            ? user.grado_secciones
                                                  .map(
                                                      (gs) =>
                                                          `${gs.grado}° ${
                                                              gs.nivel ===
                                                              'primaria'
                                                                  ? 'Grado'
                                                                  : 'Año'
                                                          } ${gs.seccion}`
                                                  )
                                                  .join(', ')
                                            : 'Sin asignar'}
                                    </span>
                                </div>
                                {user.materias && user.materias.length > 0 && (
                                    <div className="detail-row">
                                        <strong>Materias:</strong>
                                        <span>
                                            {user.materias
                                                .map((m) =>
                                                    typeof m === 'object'
                                                        ? m.nombre
                                                        : m
                                                )
                                                .join(', ')}
                                        </span>
                                    </div>
                                )}
                                <div className="detail-row">
                                    <strong>Tipo de Profesor:</strong>
                                    <span>{user.tipo_profesor}</span>
                                </div>
                                {user.telefono && (
                                    <div className="detail-row">
                                        <strong>Teléfono:</strong>
                                        <span>{user.telefono}</span>
                                    </div>
                                )}
                            </>
                        )}
                        {type === 'representante' && (
                            <>
                                {user.telefono && (
                                    <div className="detail-row">
                                        <strong>Teléfono:</strong>
                                        <span>{user.telefono}</span>
                                    </div>
                                )}
                                {user.profesor_asignado && (
                                    <div className="detail-row">
                                        <strong>Profesor Asignado:</strong>
                                        <span>
                                            {user.profesor_asignado.nombre}{' '}
                                            {user.profesor_asignado.apellido}
                                        </span>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
                <div className="modal-footer">
                    <button
                        className="btn-edit"
                        onClick={() => {
                            onClose();
                            onEdit(user);
                        }}
                    >
                        <i className="fas fa-edit"></i> Editar
                    </button>
                </div>
            </div>
        </div>
    );
};

// Modal de Edición
const EditModal = ({ user, type, isOpen, onClose, onSave }) => {
    const [formData, setFormData] = useState({});
    const [errors, setErrors] = useState({});
    const [newPassword, setNewPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [gradosSecciones, setGradosSecciones] = useState([]);
    const [materias, setMaterias] = useState([]);
    const [selectedGradosSecciones, setSelectedGradosSecciones] = useState([]);
    const [selectedMaterias, setSelectedMaterias] = useState([]);
    const [loadingGrados, setLoadingGrados] = useState(false);
    const [loadingMaterias, setLoadingMaterias] = useState(false);
    useBodyOverflowLock(isOpen);

    useEffect(() => {
        if (type === 'profesor' && isOpen) {
            cargarGradosSecciones();
            cargarMaterias();
        } else {
            // Limpiar cuando no es profesor o se cierra
            setGradosSecciones([]);
            setMaterias([]);
            setSelectedGradosSecciones([]);
            setSelectedMaterias([]);
        }
    }, [type, isOpen]);

    useEffect(() => {
        if (user && isOpen) {
            setFormData({
                nombre: user.nombre || '',
                apellido: user.apellido || '',
                fecha_nacimiento: user.fecha_nacimiento || '',
                cedula: user.cedula || '',
                direccion: user.direccion || '',
                telefono: user.telefono || '',
                grado: user.grado_seccion?.grado || user.grado || '',
                seccion: user.grado_seccion?.seccion || user.seccion || '',
                nivel: user.grado_seccion?.nivel || user.nivel || '',
                grado_asignado: user.grado_asignado || '',
                tipo_profesor: user.tipo_profesor || '',
                representante: user.representante || '',
            });

            setNewPassword('');
            setPasswordError('');

            // Si es profesor, cargar asignaciones actuales
            if (type === 'profesor') {
                // Manejar grado_secciones - puede venir como array de objetos o array de IDs
                if (
                    user.grado_secciones &&
                    Array.isArray(user.grado_secciones)
                ) {
                    if (
                        user.grado_secciones.length > 0 &&
                        typeof user.grado_secciones[0] === 'object'
                    ) {
                        // Ya viene como objetos completos
                        setSelectedGradosSecciones(user.grado_secciones);
                    } else {
                        // Viene como array de IDs, necesitamos cargar los objetos
                        setSelectedGradosSecciones([]);
                    }
                } else {
                    setSelectedGradosSecciones([]);
                }

                // Manejar materias - puede venir como array de objetos o array de IDs
                if (user.materias && Array.isArray(user.materias)) {
                    if (
                        user.materias.length > 0 &&
                        typeof user.materias[0] === 'object'
                    ) {
                        // Ya viene como objetos completos
                        setSelectedMaterias(user.materias);
                    } else {
                        // Viene como array de IDs, necesitamos cargar los objetos
                        setSelectedMaterias([]);
                    }
                } else {
                    setSelectedMaterias([]);
                }
            }

            setErrors({});
        }
    }, [user, isOpen, type]);

    const cargarGradosSecciones = async () => {
        setLoadingGrados(true);
        try {
            const token = localStorage.getItem('accessToken');
            const baseUrl =
                import.meta.env.VITE_API_URL || 'http://localhost:8000';
            const response = await axios.get(`${baseUrl}/grado-seccion/`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            setGradosSecciones(response.data || []);

            // Si el usuario tiene grado_secciones asignados, marcarlos como seleccionados
            if (
                user &&
                user.grado_secciones &&
                Array.isArray(user.grado_secciones)
            ) {
                if (user.grado_secciones.length > 0) {
                    if (
                        typeof user.grado_secciones[0] === 'object' &&
                        user.grado_secciones[0].id
                    ) {
                        // Ya son objetos con ID
                        setSelectedGradosSecciones(user.grado_secciones);
                    } else if (typeof user.grado_secciones[0] === 'number') {
                        // Son IDs, buscar los objetos correspondientes
                        const gradosSeleccionados = response.data.filter((gs) =>
                            user.grado_secciones.includes(gs.id)
                        );
                        setSelectedGradosSecciones(gradosSeleccionados);
                    }
                }
            }
        } catch (error) {
            console.error('Error al cargar grados/secciones:', error);
            setGradosSecciones([]);
        } finally {
            setLoadingGrados(false);
        }
    };

    const cargarMaterias = async () => {
        setLoadingMaterias(true);
        try {
            const token = localStorage.getItem('accessToken');
            const baseUrl =
                import.meta.env.VITE_API_URL || 'http://localhost:8000';
            const response = await axios.get(`${baseUrl}/horarios/materias/`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            setMaterias(response.data || []);

            // Si el usuario tiene materias asignadas, marcarlas como seleccionadas
            if (user && user.materias && Array.isArray(user.materias)) {
                if (user.materias.length > 0) {
                    if (
                        typeof user.materias[0] === 'object' &&
                        user.materias[0].id
                    ) {
                        // Ya son objetos con ID
                        setSelectedMaterias(user.materias);
                    } else if (typeof user.materias[0] === 'number') {
                        // Son IDs, buscar los objetos correspondientes
                        const materiasSeleccionadas = response.data.filter(
                            (m) => user.materias.includes(m.id)
                        );
                        setSelectedMaterias(materiasSeleccionadas);
                    }
                }
            }
        } catch (error) {
            console.error('Error al cargar materias:', error);
            setMaterias([]);
        } finally {
            setLoadingMaterias(false);
        }
    };

    const handleGradoSeccionToggle = (gradoSeccion) => {
        setSelectedGradosSecciones((prev) => {
            const exists = prev.find((gs) => gs.id === gradoSeccion.id);
            if (exists) {
                return prev.filter((gs) => gs.id !== gradoSeccion.id);
            } else {
                return [...prev, gradoSeccion];
            }
        });
    };

    const handleMateriaToggle = (materia) => {
        setSelectedMaterias((prev) => {
            const exists = prev.find((m) => m.id === materia.id);
            if (exists) {
                return prev.filter((m) => m.id !== materia.id);
            } else {
                return [...prev, materia];
            }
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: '',
            }));
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData((prev) => ({
                ...prev,
                foto: file,
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrors({});

        if (newPassword && newPassword.length < 8) {
            setPasswordError('La contraseña debe tener al menos 8 caracteres');
            setIsLoading(false);
            return;
        }
        setPasswordError('');

        try {
            let dataToSend;
            let headers = {};

            const token = localStorage.getItem('accessToken');
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            if (newPassword) {
                if (!user.usuario) {
                    setPasswordError('Este perfil no tiene un usuario asociado para cambiar la contraseña');
                    setIsLoading(false);
                    return;
                }

                const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
                try {
                    await axios.patch(
                        `${baseUrl}/usuario/${user.usuario}/password/`,
                        { password: newPassword },
                        {
                            headers: {
                                ...(token
                                    ? { Authorization: `Bearer ${token}` }
                                    : {}),
                                'Content-Type': 'application/json',
                            },
                        }
                    );
                    setNewPassword('');
                } catch (err) {
                    const data = err.response?.data;
                    if (data?.password) {
                        setPasswordError(
                            Array.isArray(data.password)
                                ? data.password.join(', ')
                                : data.password
                        );
                    } else if (data?.error) {
                        setPasswordError(data.error);
                    } else {
                        setPasswordError('Error al actualizar la contraseña');
                    }
                    setIsLoading(false);
                    return;
                }
            }

            // Si es profesor y tiene foto, grados o materias, usar FormData (materias como JSON string)
            if (
                type === 'profesor' &&
                (formData.foto ||
                    selectedGradosSecciones.length > 0 ||
                    selectedMaterias.length > 0)
            ) {
                const formDataObj = new FormData();

                // Agregar todos los campos del formulario (excluyendo campos especiales)
                Object.keys(formData).forEach((key) => {
                    // Excluir campos que se manejan por separado
                    if (
                        key !== 'foto' &&
                        key !== 'materias' &&
                        key !== 'grado_secciones' &&
                        key !== 'grado_asignado' &&
                        formData[key] !== null &&
                        formData[key] !== undefined &&
                        formData[key] !== ''
                    ) {
                        formDataObj.append(key, formData[key]);
                    }
                });

                // Agregar foto si existe
                if (formData.foto) {
                    formDataObj.append('foto', formData.foto);
                }

                // Agregar grado_secciones como JSON string
                // Siempre enviar, incluso si está vacío, para que el backend pueda limpiar las asignaciones
                const gradoSeccionesData = selectedGradosSecciones.map(
                    (gs) => ({
                        nivel: gs.nivel,
                        grado: gs.grado,
                        seccion: gs.seccion,
                    })
                );
                formDataObj.append(
                    'grado_secciones',
                    JSON.stringify(gradoSeccionesData)
                );

                // Agregar materias como JSON string (similar a cómo funciona en Materias.jsx)
                // Siempre enviar, incluso si está vacío, para que el backend pueda limpiar las asignaciones
                const materiasIds = selectedMaterias
                    .map((m) => {
                        const id = typeof m === 'object' ? m.id : m;
                        return id != null ? Number(id) : null;
                    })
                    .filter(
                        (id) => id !== null && id !== undefined && !isNaN(id)
                    );
                formDataObj.append('materias', JSON.stringify(materiasIds));

                dataToSend = formDataObj;
                // No establecer Content-Type para FormData, el navegador lo hace automáticamente
            } else if (type === 'profesor') {
                // Si es profesor sin foto ni asignaciones, usar JSON
                dataToSend = { ...formData };
                // Limpiar campos que no deben enviarse
                delete dataToSend.foto;
                delete dataToSend.materias; // Eliminar si existe en formData
                delete dataToSend.grado_secciones; // Eliminar si existe en formData
                delete dataToSend.grado_asignado; // Eliminar si existe en formData

                if (selectedGradosSecciones.length > 0) {
                    dataToSend.grado_secciones = selectedGradosSecciones.map(
                        (gs) => ({
                            nivel: gs.nivel,
                            grado: gs.grado,
                            seccion: gs.seccion,
                        })
                    );
                } else {
                    dataToSend.grado_secciones = [];
                }

                // Enviar materias como array de números enteros solo si hay materias seleccionadas
                if (selectedMaterias.length > 0) {
                    dataToSend.materias = selectedMaterias
                        .map((m) => {
                            // Asegurar que extraemos solo el ID y lo convertimos a número
                            const id = typeof m === 'object' ? m.id : m;
                            return id != null ? Number(id) : null;
                        })
                        .filter(
                            (id) =>
                                id !== null && id !== undefined && !isNaN(id)
                        );
                }
                // Si no hay materias, no enviar el campo (el backend lo manejará correctamente)

                headers['Content-Type'] = 'application/json';
            } else {
                // Para otros tipos de usuario, usar FormData normal
                const formDataObj = new FormData();
                Object.keys(formData).forEach((key) => {
                    if (
                        formData[key] !== null &&
                        formData[key] !== undefined &&
                        formData[key] !== ''
                    ) {
                        formDataObj.append(key, formData[key]);
                    }
                });
                dataToSend = formDataObj;
                headers['Content-Type'] = 'multipart/form-data';
            }

            console.log('Enviando datos:', dataToSend);
            console.log('Headers:', headers);
            if (dataToSend instanceof FormData) {
                console.log('Es FormData');
                for (let pair of dataToSend.entries()) {
                    console.log(pair[0] + ': ' + pair[1]);
                }
            } else {
                console.log('Es JSON:', JSON.stringify(dataToSend, null, 2));
            }

            await axios.patch(`${API_URL}${type}/${user.id}/`, dataToSend, {
                headers,
            });

            alert('Usuario actualizado con éxito');
            onSave();
            onClose();
        } catch (error) {
            console.error('Error al actualizar:', error);
            console.error('Error completo:', error.response?.data);
            if (error.response?.data) {
                setErrors(error.response.data);
                // Mostrar mensaje de error más detallado
                let errorMessage = 'Error al actualizar el usuario';
                if (typeof error.response.data === 'object') {
                    const errorMessages = Object.entries(error.response.data)
                        .map(([key, value]) => {
                            if (Array.isArray(value)) {
                                return `${key}: ${value.join(', ')}`;
                            }
                            return `${key}: ${value}`;
                        })
                        .join('; ');
                    errorMessage = errorMessages || errorMessage;
                }
                alert(errorMessage);
            } else {
                alert('Error al actualizar el usuario');
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen || !user) return null;
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="modal-content edit-modal"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal-header">
                    <h2>Editar Usuario</h2>
                    <button className="close-btn" onClick={onClose}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="edit-form">
                    <div className="form-group">
                        <label>Nombres:</label>
                        <input
                            type="text"
                            name="nombre"
                            value={formData.nombre || ''}
                            onChange={handleInputChange}
                            required
                        />
                        {errors.nombre && (
                            <span className="error">{errors.nombre}</span>
                        )}
                    </div>
                    <div className="form-group">
                        <label>Apellidos:</label>
                        <input
                            type="text"
                            name="apellido"
                            value={formData.apellido || ''}
                            onChange={handleInputChange}
                            required
                        />
                        {errors.apellido && (
                            <span className="error">{errors.apellido}</span>
                        )}
                    </div>
                    <div className="form-group">
                        <label>Fecha de Nacimiento:</label>
                        <input
                            type="date"
                            name="fecha_nacimiento"
                            value={formData.fecha_nacimiento || ''}
                            onChange={handleInputChange}
                            required
                        />
                        {errors.fecha_nacimiento && (
                            <span className="error">
                                {errors.fecha_nacimiento}
                            </span>
                        )}
                    </div>
                    {(type === 'estudiante' ||
                        type === 'profesor' ||
                        type === 'representante') && (
                        <>
                            <div className="form-group">
                                <label>Cédula:</label>
                                <input
                                    type="text"
                                    name="cedula"
                                    value={formData.cedula || ''}
                                    onChange={handleInputChange}
                                />
                                {errors.cedula && (
                                    <span className="error">
                                        {errors.cedula}
                                    </span>
                                )}
                            </div>
                            <div className="form-group">
                                <label>Dirección:</label>
                                <input
                                    type="text"
                                    name="direccion"
                                    value={formData.direccion || ''}
                                    onChange={handleInputChange}
                                />
                                {errors.direccion && (
                                    <span className="error">
                                        {errors.direccion}
                                    </span>
                                )}
                            </div>

                            {user?.usuario && (
                                <div className="form-group">
                                    <label>Nueva contraseña (opcional):</label>
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => {
                                            setNewPassword(e.target.value);
                                            if (passwordError) {
                                                setPasswordError('');
                                            }
                                        }}
                                        autoComplete="new-password"
                                    />
                                    {passwordError && (
                                        <span className="error">{passwordError}</span>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                    {type === 'estudiante' && (
                        <>
                            <div className="form-group">
                                <label>Nivel:</label>
                                <select
                                    name="nivel"
                                    value={formData.nivel || ''}
                                    onChange={handleInputChange}
                                >
                                    <option value="">Seleccione...</option>
                                    <option value="primaria">Primaria</option>
                                    <option value="secundaria">
                                        Secundaria
                                    </option>
                                </select>
                                {errors.nivel && (
                                    <span className="error">
                                        {errors.nivel}
                                    </span>
                                )}
                            </div>
                            <div className="form-group">
                                <label>
                                    {formData.nivel === 'primaria'
                                        ? 'Grado:'
                                        : formData.nivel === 'secundaria'
                                        ? 'Año:'
                                        : 'Grado/Año:'}
                                </label>
                                <select
                                    name="grado"
                                    value={formData.grado || ''}
                                    onChange={handleInputChange}
                                    disabled={!formData.nivel}
                                >
                                    <option value="">
                                        {formData.nivel === 'primaria'
                                            ? 'Seleccione el grado'
                                            : formData.nivel === 'secundaria'
                                            ? 'Seleccione el año'
                                            : 'Seleccione primero el nivel'}
                                    </option>
                                    {formData.nivel === 'primaria' ? (
                                        <>
                                            <option value="1">1° Grado</option>
                                            <option value="2">2° Grado</option>
                                            <option value="3">3° Grado</option>
                                            <option value="4">4° Grado</option>
                                            <option value="5">5° Grado</option>
                                            <option value="6">6° Grado</option>
                                        </>
                                    ) : formData.nivel === 'secundaria' ? (
                                        <>
                                            <option value="1">1° Año</option>
                                            <option value="2">2° Año</option>
                                            <option value="3">3° Año</option>
                                            <option value="4">4° Año</option>
                                            <option value="5">5° Año</option>
                                        </>
                                    ) : null}
                                </select>
                                {errors.grado && (
                                    <span className="error">
                                        {errors.grado}
                                    </span>
                                )}
                            </div>
                            <div className="form-group">
                                <label>Sección:</label>
                                <select
                                    name="seccion"
                                    value={formData.seccion || ''}
                                    onChange={handleInputChange}
                                >
                                    <option value="">Seleccione...</option>
                                    <option value="A">Sección A</option>
                                    <option value="B">Sección B</option>
                                    <option value="C">Sección C</option>
                                </select>
                                {errors.seccion && (
                                    <span className="error">
                                        {errors.seccion}
                                    </span>
                                )}
                            </div>
                        </>
                    )}
                    {type === 'profesor' && (
                        <>
                            <div className="form-group">
                                <label>Tipo de Profesor:</label>
                                <select
                                    name="tipo_profesor"
                                    value={formData.tipo_profesor || ''}
                                    onChange={handleInputChange}
                                >
                                    <option value="">Seleccione...</option>
                                    <option value="titular">Titular</option>
                                    <option value="suplente">Suplente</option>
                                    <option value="especialista">
                                        Especialista
                                    </option>
                                </select>
                                {errors.tipo_profesor && (
                                    <span className="error">
                                        {errors.tipo_profesor}
                                    </span>
                                )}
                            </div>
                            <div className="form-group">
                                <label>Teléfono:</label>
                                <input
                                    type="text"
                                    name="telefono"
                                    value={formData.telefono || ''}
                                    onChange={handleInputChange}
                                />
                                {errors.telefono && (
                                    <span className="error">
                                        {errors.telefono}
                                    </span>
                                )}
                            </div>
                            {/* Secciones de grados y materias ocultas - se asignan desde otros módulos */}
                            {/* 
                            <div className="form-group">
                                <label>Grados y Secciones Asignados:</label>
                                <div style={{
                                    border: '2px solid var(--light-gray)',
                                    borderRadius: 'var(--border-radius)',
                                    padding: '10px',
                                    maxHeight: '200px',
                                    overflowY: 'auto',
                                    background: 'white',
                                    marginTop: '8px',
                                    minHeight: '80px'
                                }}>
                                    {loadingGrados ? (
                                        <div style={{display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--gray)', fontSize: '0.9rem', padding: '10px'}}>
                                            <i className="fas fa-spinner fa-spin"></i>
                                            <span>Cargando grados...</span>
                                        </div>
                                    ) : gradosSecciones.length === 0 ? (
                                        <p style={{color: 'var(--gray)', fontSize: '0.9rem', margin: 0, fontStyle: 'italic', padding: '10px'}}>
                                            No hay grados disponibles
                                        </p>
                                    ) : (
                                        <ul style={{
                                            listStyle: 'none',
                                            padding: 0,
                                            margin: 0
                                        }}>
                                            {gradosSecciones.map((gs) => {
                                                const isSelected = selectedGradosSecciones.find(sgs => sgs.id === gs.id);
                                                return (
                                                    <li
                                                        key={gs.id}
                                                        style={{
                                                            padding: '10px 12px',
                                                            marginBottom: '6px',
                                                            border: `2px solid ${isSelected ? 'var(--primary)' : 'var(--light-gray)'}`,
                                                            borderRadius: 'var(--border-radius)',
                                                            background: isSelected ? 'rgba(67, 97, 238, 0.1)' : 'white',
                                                            cursor: 'pointer',
                                                            transition: 'var(--transition)',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '10px'
                                                        }}
                                                        onClick={() => handleGradoSeccionToggle(gs)}
                                                        onMouseEnter={(e) => {
                                                            if (!isSelected) {
                                                                e.currentTarget.style.borderColor = 'var(--primary)';
                                                                e.currentTarget.style.background = 'rgba(67, 97, 238, 0.05)';
                                                            }
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            if (!isSelected) {
                                                                e.currentTarget.style.borderColor = 'var(--light-gray)';
                                                                e.currentTarget.style.background = 'white';
                                                            }
                                                        }}
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={!!isSelected}
                                                            onChange={() => handleGradoSeccionToggle(gs)}
                                                            onClick={(e) => e.stopPropagation()}
                                                            style={{
                                                                width: '18px',
                                                                height: '18px',
                                                                cursor: 'pointer',
                                                                accentColor: 'var(--primary)',
                                                                flexShrink: 0
                                                            }}
                                                        />
                                                        <span style={{
                                                            flex: 1,
                                                            fontSize: '0.9rem',
                                                            color: 'var(--dark)',
                                                            fontWeight: isSelected ? '600' : '400'
                                                        }}>
                                                            {gs.grado}° {gs.nivel === 'primaria' ? 'Grado' : 'Año'} {gs.seccion}
                                                        </span>
                                                        {isSelected && (
                                                            <i className="fas fa-check-circle" style={{
                                                                color: 'var(--primary)',
                                                                fontSize: '1rem'
                                                            }}></i>
                                                        )}
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    )}
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Materias Asignadas:</label>
                                <div style={{
                                    border: '2px solid var(--light-gray)',
                                    borderRadius: 'var(--border-radius)',
                                    padding: '10px',
                                    maxHeight: '200px',
                                    overflowY: 'auto',
                                    background: 'white',
                                    marginTop: '8px',
                                    minHeight: '80px'
                                }}>
                                    {loadingMaterias ? (
                                        <div style={{display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--gray)', fontSize: '0.9rem', padding: '10px'}}>
                                            <i className="fas fa-spinner fa-spin"></i>
                                            <span>Cargando materias...</span>
                                        </div>
                                    ) : materias.length === 0 ? (
                                        <p style={{color: 'var(--gray)', fontSize: '0.9rem', margin: 0, fontStyle: 'italic', padding: '10px'}}>
                                            No hay materias disponibles
                                        </p>
                                    ) : (
                                        <ul style={{
                                            listStyle: 'none',
                                            padding: 0,
                                            margin: 0
                                        }}>
                                            {materias.map((materia) => {
                                                const isSelected = selectedMaterias.find(sm => sm.id === materia.id);
                                                return (
                                                    <li
                                                        key={materia.id}
                                                        style={{
                                                            padding: '10px 12px',
                                                            marginBottom: '6px',
                                                            border: `2px solid ${isSelected ? 'var(--primary)' : 'var(--light-gray)'}`,
                                                            borderRadius: 'var(--border-radius)',
                                                            background: isSelected ? 'rgba(67, 97, 238, 0.1)' : 'white',
                                                            cursor: 'pointer',
                                                            transition: 'var(--transition)',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '10px'
                                                        }}
                                                        onClick={() => handleMateriaToggle(materia)}
                                                        onMouseEnter={(e) => {
                                                            if (!isSelected) {
                                                                e.currentTarget.style.borderColor = 'var(--primary)';
                                                                e.currentTarget.style.background = 'rgba(67, 97, 238, 0.05)';
                                                            }
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            if (!isSelected) {
                                                                e.currentTarget.style.borderColor = 'var(--light-gray)';
                                                                e.currentTarget.style.background = 'white';
                                                            }
                                                        }}
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={!!isSelected}
                                                            onChange={() => handleMateriaToggle(materia)}
                                                            onClick={(e) => e.stopPropagation()}
                                                            style={{
                                                                width: '18px',
                                                                height: '18px',
                                                                cursor: 'pointer',
                                                                accentColor: 'var(--primary)',
                                                                flexShrink: 0
                                                            }}
                                                        />
                                                        <span style={{
                                                            flex: 1,
                                                            fontSize: '0.9rem',
                                                            color: 'var(--dark)',
                                                            fontWeight: isSelected ? '600' : '400'
                                                        }}>
                                                            {materia.nombre}
                                                        </span>
                                                        {materia.descripcion && (
                                                            <span style={{
                                                                fontSize: '0.8rem',
                                                                color: 'var(--gray)',
                                                                fontStyle: 'italic',
                                                                maxWidth: '200px',
                                                                overflow: 'hidden',
                                                                textOverflow: 'ellipsis',
                                                                whiteSpace: 'nowrap'
                                                            }}>
                                                                {materia.descripcion}
                                                            </span>
                                                        )}
                                                        {isSelected && (
                                                            <i className="fas fa-check-circle" style={{
                                                                color: 'var(--primary)',
                                                                fontSize: '1rem'
                                                            }}></i>
                                                        )}
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    )}
                                </div>
                            </div>
                            */}
                        </>
                    )}
                    {type === 'representante' && (
                        <div className="form-group">
                            <label>Teléfono:</label>
                            <input
                                type="text"
                                name="telefono"
                                value={formData.telefono || ''}
                                onChange={handleInputChange}
                            />
                            {errors.telefono && (
                                <span className="error">{errors.telefono}</span>
                            )}
                        </div>
                    )}
                    <div className="form-group">
                        <label>Foto:</label>
                        <input
                            type="file"
                            name="foto"
                            accept="image/*"
                            onChange={handleFileChange}
                        />
                        {errors.foto && (
                            <span className="error">{errors.foto}</span>
                        )}
                    </div>
                    <div className="modal-footer">
                        <button
                            type="button"
                            className="btn-cancel"
                            onClick={onClose}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="btn-save"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Modal para Asignar Representante

const AssignModal = ({ user, type, isOpen, onClose, onAssign }) => {
    const navigate = useNavigate();
    const [representantes, setRepresentantes] = useState([]);
    const [selectedRep, setSelectedRep] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useBodyOverflowLock(isOpen);

    useEffect(() => {
        fetchRepresentantes();
    }, []);

    const fetchRepresentantes = async () => {
        try {
            const response = await axios.get(`${API_URL}representante/`);
            setRepresentantes(response.data);
        } catch (error) {
            console.error('Error al cargar representantes:', error);
            alert('Error al cargar la lista de representantes');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAssign = async () => {
        if (!selectedRep) {
            alert('Por favor, seleccione un representante');
            return;
        }

        try {
            await axios.patch(`${API_URL}${type}/${user.id}/`, {
                representante: selectedRep,
            });
            alert('Representante asignado con éxito');
            onAssign();
            onClose();
        } catch (error) {
            console.error('Error al asignar representante:', error);
            alert('Error al asignar el representante');
        }
    };

    const filteredRepresentantes = useMemo(() => {
        return representantes.filter((rep) => {
            const fullName = `${rep.nombre} ${rep.apellido}`.toLowerCase();
            return fullName.includes(searchTerm.toLowerCase());
        });
    }, [representantes, searchTerm]);

    const ITEMS_PER_PAGE = 5;
    const [currentPage, setCurrentPage] = useState(0);
    const totalPages = Math.ceil(
        filteredRepresentantes.length / ITEMS_PER_PAGE
    );
    const paginatedRepresentantes = filteredRepresentantes.slice(
        currentPage * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE + ITEMS_PER_PAGE
    );

    useEffect(() => {
        setCurrentPage(0);
    }, [filteredRepresentantes]);

    if (!isOpen || !user) return null;
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="modal-content assign-modal"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal-header">
                    <h2>Asignar Representante</h2>
                    <button className="close-btn" onClick={onClose}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>
                <div className="modal-body">
                    <div className="form-group">
                        <label>Seleccione un Representante:</label>
                        <input
                            type="search"
                            name="searchRep"
                            id="searchRep"
                            placeholder="Buscar por nombre..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="representantes-list">
                        {filteredRepresentantes.length === 0 ? (
                            <p>No hay representantes registrados</p>
                        ) : (
                            paginatedRepresentantes.map((representante) => (
                                <div
                                    key={representante.id}
                                    className={`representante-item ${
                                        selectedRep === representante.id
                                            ? 'selected'
                                            : ''
                                    }`}
                                    onClick={() =>
                                        setSelectedRep(representante.id)
                                    }
                                >
                                    <div className="datos">
                                        <p>
                                            Nombre:{' '}
                                            {`${representante.nombre} ${representante.apellido}`}
                                        </p>
                                        <p>Cédula: {representante.cedula}</p>
                                    </div>
                                    <div className="card-photo">
                                        {representante.foto ? (
                                            <img
                                                src={representante.foto}
                                                alt={`Foto de ${representante.nombre} ${representante.apellido}`}
                                            />
                                        ) : (
                                            <i className="fas fa-user-circle default-foto-user"></i>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                        {totalPages > 1 && (
                            <div className="carousel-controls">
                                <button
                                    onClick={() =>
                                        setCurrentPage((prev) =>
                                            Math.max(prev - 1, 0)
                                        )
                                    }
                                    disabled={currentPage === 0}
                                >
                                    ← Anterior
                                </button>

                                <span style={{ margin: '0 1rem' }}>
                                    Página {currentPage + 1} de {totalPages}
                                </span>

                                <button
                                    onClick={() =>
                                        setCurrentPage((prev) =>
                                            Math.min(prev + 1, totalPages - 1)
                                        )
                                    }
                                    disabled={currentPage === totalPages - 1}
                                >
                                    Siguiente →
                                </button>
                            </div>
                        )}
                    </div>
                </div>
                <div className="modal-footer">
                    <button
                        type="button"
                        className="btn-cancel"
                        onClick={onClose}
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        className="btn-assing"
                        onClick={handleAssign}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Guardando...' : 'Asignar'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// Modal para Asignar Curso y Sección a Profesor

const AssignPModal = ({ user, type, isOpen, onClose, onAssignP }) => {
    const navigate = useNavigate();
    const [cursos, setCursos] = useState([]);
    const [selectedCurso, setSelectedCurso] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useBodyOverflowLock(isOpen);

    useEffect(() => {
        fetchCursos();
    }, []);

    const fetchCursos = async () => {
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/grado-seccion/`
            );
            setCursos(response.data);
        } catch (error) {
            console.error('Error al cargar cursos:', error);
            alert('Error al cargar la lista de cursos');
        } finally {
            setIsLoading(false);
        }
    };
    const handleAssign = async () => {
        if (!selectedCurso) {
            alert('Por favor, seleccione un curso');
            return;
        }
        console.log(selectedCurso);
        try {
            await axios.patch(`${API_URL}profesor/${user.id}/`, {
                grado_secciones: selectedCurso,
            });
            alert('Curso asignado con éxito');
            onAssignP();
            onClose();
        } catch (error) {
            console.error('Error al asignar curso:', error);
            alert('Error al asignar el curso');
        }
    };

    const filteredCursos = useMemo(() => {
        return cursos.filter((curso) => {
            const fullName = `${curso.nivel} ${curso.grado}`.toLowerCase();
            return fullName.includes(searchTerm.toLowerCase());
        });
    }, [cursos, searchTerm]);

    const ITEMS_PER_PAGE = 5;
    const [currentPage, setCurrentPage] = useState(0);
    const totalPages = Math.ceil(filteredCursos.length / ITEMS_PER_PAGE);
    const paginatedCursos = filteredCursos.slice(
        currentPage * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE + ITEMS_PER_PAGE
    );

    useEffect(() => {
        setCurrentPage(0);
    }, [filteredCursos]);

    if (!isOpen || !user) return null;
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="modal-content assign-modal"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal-header">
                    <h2>Asignar Curso y Seccion</h2>
                    <button className="close-btn" onClick={onClose}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>
                <div className="modal-body">
                    <div className="form-group">
                        <label>Seleccione un Curso:</label>
                        <input
                            type="search"
                            name="searchCurso"
                            id="searchCurso"
                            placeholder="Buscar por nombre..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="representantes-list">
                        {filteredCursos.length === 0 ? (
                            <p>No hay cursos registrados</p>
                        ) : (
                            paginatedCursos.map((curso) => (
                                <div
                                    key={curso.id}
                                    className={`representante-item ${
                                        selectedCurso.includes(curso.id)
                                            ? 'selected'
                                            : ''
                                    }`}
                                    onClick={() =>
                                        setSelectedCurso((prev) => {
                                            if (prev.includes(curso.id)) {
                                                return prev.filter(
                                                    (id) => id !== curso.id
                                                );
                                            } else {
                                                return [...prev, curso.id];
                                            }
                                        })
                                    }
                                >
                                    <div className="datos">
                                        <p>Nivel: {curso.nivel}</p>
                                        <p>Grado: {curso.grado}</p>
                                        <p>Sección: {curso.seccion}</p>
                                    </div>
                                </div>
                            ))
                        )}
                        {totalPages > 1 && (
                            <div className="carousel-controls">
                                <button
                                    onClick={() =>
                                        setCurrentPage((prev) =>
                                            Math.max(prev - 1, 0)
                                        )
                                    }
                                    disabled={currentPage === 0}
                                >
                                    ← Anterior
                                </button>

                                <span style={{ margin: '0 1rem' }}>
                                    Página {currentPage + 1} de {totalPages}
                                </span>

                                <button
                                    onClick={() =>
                                        setCurrentPage((prev) =>
                                            Math.min(prev + 1, totalPages - 1)
                                        )
                                    }
                                    disabled={currentPage === totalPages - 1}
                                >
                                    Siguiente →
                                </button>
                            </div>
                        )}
                    </div>
                </div>
                <div className="modal-footer">
                    <button
                        type="button"
                        className="btn-cancel"
                        onClick={onClose}
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        className="btn-assing"
                        onClick={handleAssign}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Guardando...' : 'Asignar'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// Lista de Estudiantes
export function ListaE() {
    const navigate = useNavigate();
    const [estudiantes, setEstudiantes] = useState([]);
    const [filteredEstudiantes, setFilteredEstudiantes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('table'); // 'cards' o 'table'
    const [filtroNivel, setFiltroNivel] = useState('');

    useEffect(() => {
        fetchEstudiantes();
    }, []);

    useEffect(() => {
        filterEstudiantes();
    }, [estudiantes, searchTerm, filtroNivel]);

    const fetchEstudiantes = async () => {
        try {
            const response = await axios.get(`${API_URL}estudiante/`);
            setEstudiantes(response.data);
        } catch (error) {
            console.error('Error al cargar estudiantes:', error);
            alert('Error al cargar la lista de estudiantes');
        } finally {
            setLoading(false);
        }
    };

    const filterEstudiantes = () => {
        let filtered = [...estudiantes];

        // Filtro por búsqueda
        if (searchTerm) {
            const search = searchTerm.toLowerCase();
            filtered = filtered.filter(
                (est) =>
                    est.nombre?.toLowerCase().includes(search) ||
                    est.apellido?.toLowerCase().includes(search) ||
                    est.cedula?.toLowerCase().includes(search) ||
                    est.grado_seccion?.grado?.toString().includes(search) ||
                    est.grado_seccion?.seccion?.toLowerCase().includes(search)
            );
        }

        // Filtro por nivel
        if (filtroNivel) {
            filtered = filtered.filter(
                (est) => est.grado_seccion?.nivel === filtroNivel
            );
        }

        setFilteredEstudiantes(filtered);
    };

    const handleCardClick = (user) => {
        setSelectedUser(user);
        setShowDetailModal(true);
    };

    const handleEdit = (user) => {
        setSelectedUser(user);
        setShowEditModal(true);
    };

    const handleAssign = (user) => {
        setSelectedUser(user);
        setShowAssignModal(true);
    };

    const handleDelete = async (user) => {
        if (
            !window.confirm(
                `¿Está seguro de eliminar a ${user.nombre} ${user.apellido}?`
            )
        ) {
            return;
        }

        try {
            await axios.delete(`${API_URL}estudiante/${user.id}/`);
            alert('Estudiante eliminado con éxito');
            fetchEstudiantes();
        } catch (error) {
            console.error('Error al eliminar:', error);
            alert('Error al eliminar el estudiante');
        }
    };

    if (loading) {
        return <div className="loading">Cargando estudiantes...</div>;
    }

    return (
        <div className="listas-container">
            <div className="listas-header">
                <h1>Lista de Estudiantes</h1>
                <button
                    className="btn-add"
                    onClick={() => navigate('/admin/registro')}
                >
                    <i className="fas fa-plus"></i> Agregar Estudiante
                </button>
            </div>

            {/* Barra de búsqueda y filtros */}
            <div className="listas-toolbar">
                <div className="search-container">
                    <i className="fas fa-search search-icon"></i>
                    <input
                        type="text"
                        placeholder="Buscar por nombre, apellido, cédula, grado o sección..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>
                <div className="filters-container">
                    <select
                        value={filtroNivel}
                        onChange={(e) => setFiltroNivel(e.target.value)}
                        className="filter-select"
                    >
                        <option value="">Todos los niveles</option>
                        <option value="primaria">Primaria</option>
                        <option value="secundaria">Secundaria</option>
                    </select>
                </div>
                <div className="view-toggle">
                    <button
                        className={`view-btn ${
                            viewMode === 'cards' ? 'active' : ''
                        }`}
                        onClick={() => setViewMode('cards')}
                        title="Vista de tarjetas"
                    >
                        <i className="fas fa-th"></i>
                    </button>
                    <button
                        className={`view-btn ${
                            viewMode === 'table' ? 'active' : ''
                        }`}
                        onClick={() => setViewMode('table')}
                        title="Vista de tabla"
                    >
                        <i className="fas fa-table"></i>
                    </button>
                </div>
            </div>

            {/* Contador de resultados */}
            <div className="results-info">
                <span>
                    Mostrando {filteredEstudiantes.length} de{' '}
                    {estudiantes.length} estudiantes
                </span>
            </div>

            {/* Vista de Cards */}
            {viewMode === 'cards' && (
                <div className="cards-grid">
                    {loading ? (
                        <div className="loading">Cargando estudiantes...</div>
                    ) : filteredEstudiantes.length === 0 ? (
                        <p className="no-data">
                            No hay estudiantes que coincidan con la búsqueda
                        </p>
                    ) : (
                        filteredEstudiantes.map((estudiante) => (
                            <UserCard
                                key={estudiante.id}
                                user={estudiante}
                                type="estudiante"
                                onCardClick={handleCardClick}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                                onAssing={handleAssign}
                            />
                        ))
                    )}
                </div>
            )}

            {/* Vista de Tabla */}
            {viewMode === 'table' && (
                <div className="table-container">
                    {loading ? (
                        <div className="loading">Cargando estudiantes...</div>
                    ) : filteredEstudiantes.length === 0 ? (
                        <p className="no-data">
                            No hay estudiantes que coincidan con la búsqueda
                        </p>
                    ) : (
                        <table className="users-table">
                            <thead>
                                <tr>
                                    <th>Foto</th>
                                    <th>Nombre</th>
                                    <th>Cédula</th>
                                    <th>Grado/Año</th>
                                    <th>Sección</th>
                                    <th>Nivel</th>
                                    <th>Edad</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredEstudiantes.map((estudiante) => (
                                    <UserRow
                                        key={estudiante.id}
                                        user={estudiante}
                                        type="estudiante"
                                        onRowClick={handleCardClick}
                                        onEdit={handleEdit}
                                        onDelete={handleDelete}
                                        onAssing={handleAssign}
                                    />
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}
            <DetailModal
                user={selectedUser}
                type="estudiante"
                isOpen={showDetailModal}
                onClose={() => {
                    setShowDetailModal(false);
                    setSelectedUser(null);
                }}
                onEdit={handleEdit}
            />
            <EditModal
                user={selectedUser}
                type="estudiante"
                isOpen={showEditModal}
                onClose={() => {
                    setShowEditModal(false);
                    setSelectedUser(null);
                }}
                onSave={fetchEstudiantes}
            />
            <AssignModal
                user={selectedUser}
                type="estudiante"
                isOpen={showAssignModal}
                onClose={() => {
                    setShowAssignModal(false);
                    setSelectedUser(null);
                }}
                onAssign={fetchEstudiantes}
            />
        </div>
    );
}

// Lista de Representantes
export function ListaR() {
    const navigate = useNavigate();
    const [representantes, setRepresentantes] = useState([]);
    const [filteredRepresentantes, setFilteredRepresentantes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('table');

    useEffect(() => {
        fetchRepresentantes();
    }, []);

    useEffect(() => {
        filterRepresentantes();
    }, [representantes, searchTerm]);

    const fetchRepresentantes = async () => {
        try {
            const response = await axios.get(`${API_URL}representante/`);
            setRepresentantes(response.data);
        } catch (error) {
            console.error('Error al cargar representantes:', error);
            alert('Error al cargar la lista de representantes');
        } finally {
            setLoading(false);
        }
    };

    const filterRepresentantes = () => {
        let filtered = [...representantes];

        if (searchTerm) {
            const search = searchTerm.toLowerCase();
            filtered = filtered.filter(
                (rep) =>
                    rep.nombre?.toLowerCase().includes(search) ||
                    rep.apellido?.toLowerCase().includes(search) ||
                    rep.cedula?.toLowerCase().includes(search) ||
                    rep.telefono?.toLowerCase().includes(search)
            );
        }

        setFilteredRepresentantes(filtered);
    };

    const handleCardClick = (user) => {
        setSelectedUser(user);
        setShowDetailModal(true);
    };

    const handleEdit = (user) => {
        setSelectedUser(user);
        setShowEditModal(true);
    };

    const handleDelete = async (user) => {
        if (
            !window.confirm(
                `¿Está seguro de eliminar a ${user.nombre} ${user.apellido}?`
            )
        ) {
            return;
        }

        try {
            await axios.delete(`${API_URL}representante/${user.id}/`);
            alert('Representante eliminado con éxito');
            fetchRepresentantes();
        } catch (error) {
            console.error('Error al eliminar:', error);
            alert('Error al eliminar el representante');
        }
    };

    return (
        <div className="listas-container">
            <div className="listas-header">
                <h1>Lista de Representantes</h1>
                <button
                    className="btn-add"
                    onClick={() => navigate('/admin/registro')}
                >
                    <i className="fas fa-plus"></i> Agregar Representante
                </button>
            </div>

            {/* Barra de búsqueda y filtros */}
            <div className="listas-toolbar">
                <div className="search-container">
                    <i className="fas fa-search search-icon"></i>
                    <input
                        type="text"
                        placeholder="Buscar por nombre, apellido, cédula o teléfono..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>
                <div className="view-toggle">
                    <button
                        className={`view-btn ${
                            viewMode === 'cards' ? 'active' : ''
                        }`}
                        onClick={() => setViewMode('cards')}
                        title="Vista de tarjetas"
                    >
                        <i className="fas fa-th"></i>
                    </button>
                    <button
                        className={`view-btn ${
                            viewMode === 'table' ? 'active' : ''
                        }`}
                        onClick={() => setViewMode('table')}
                        title="Vista de tabla"
                    >
                        <i className="fas fa-table"></i>
                    </button>
                </div>
            </div>

            {/* Contador de resultados */}
            <div className="results-info">
                <span>
                    Mostrando {filteredRepresentantes.length} de{' '}
                    {representantes.length} representantes
                </span>
            </div>

            {/* Vista de Cards */}
            {viewMode === 'cards' && (
                <div className="cards-grid">
                    {loading ? (
                        <div className="loading">
                            Cargando representantes...
                        </div>
                    ) : filteredRepresentantes.length === 0 ? (
                        <p className="no-data">
                            No hay representantes que coincidan con la búsqueda
                        </p>
                    ) : (
                        filteredRepresentantes.map((representante) => (
                            <UserCard
                                key={representante.id}
                                user={representante}
                                type="representante"
                                onCardClick={handleCardClick}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                            />
                        ))
                    )}
                </div>
            )}

            {/* Vista de Tabla */}
            {viewMode === 'table' && (
                <div className="table-container">
                    {loading ? (
                        <div className="loading">
                            Cargando representantes...
                        </div>
                    ) : filteredRepresentantes.length === 0 ? (
                        <p className="no-data">
                            No hay representantes que coincidan con la búsqueda
                        </p>
                    ) : (
                        <table className="users-table">
                            <thead>
                                <tr>
                                    <th>Foto</th>
                                    <th>Nombre</th>
                                    <th>Cédula</th>
                                    <th>Edad</th>
                                    <th>Teléfono</th>
                                    <th>Estudiantes</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredRepresentantes.map((representante) => (
                                    <UserRow
                                        key={representante.id}
                                        user={representante}
                                        type="representante"
                                        onRowClick={handleCardClick}
                                        onEdit={handleEdit}
                                        onDelete={handleDelete}
                                    />
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}
            <DetailModal
                user={selectedUser}
                type="representante"
                isOpen={showDetailModal}
                onClose={() => {
                    setShowDetailModal(false);
                    setSelectedUser(null);
                }}
                onEdit={handleEdit}
            />
            <EditModal
                user={selectedUser}
                type="representante"
                isOpen={showEditModal}
                onClose={() => {
                    setShowEditModal(false);
                    setSelectedUser(null);
                }}
                onSave={fetchRepresentantes}
            />
        </div>
    );
}

// Lista de Profesores
export function ListaP() {
    const navigate = useNavigate();
    const [profesores, setProfesores] = useState([]);
    const [filteredProfesores, setFilteredProfesores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('table');
    const [filtroTipo, setFiltroTipo] = useState('');

    useEffect(() => {
        fetchProfesores();
    }, []);

    useEffect(() => {
        filterProfesores();
    }, [profesores, searchTerm, filtroTipo]);

    const fetchProfesores = async () => {
        try {
            const response = await axios.get(`${API_URL}profesor/`);
            // Log detallado para verificar estructura de grado_secciones
            if (response.data && response.data.length > 0) {
                response.data.forEach((prof, index) => {
                    console.log(
                        `Profesor ${index + 1} (${prof.nombre} ${
                            prof.apellido
                        }):`,
                        {
                            id: prof.id,
                            grado_secciones: prof.grado_secciones,
                            tipo_grado_secciones: typeof prof.grado_secciones,
                            es_array: Array.isArray(prof.grado_secciones),
                            longitud: prof.grado_secciones?.length,
                        }
                    );
                });
            }
            setProfesores(response.data);
        } catch (error) {
            console.error('Error al cargar profesores:', error);
            alert('Error al cargar la lista de profesores');
        } finally {
            setLoading(false);
        }
    };

    const filterProfesores = () => {
        let filtered = [...profesores];

        // Filtro por búsqueda
        if (searchTerm) {
            const search = searchTerm.toLowerCase();
            filtered = filtered.filter(
                (prof) =>
                    prof.nombre?.toLowerCase().includes(search) ||
                    prof.apellido?.toLowerCase().includes(search) ||
                    prof.cedula?.toLowerCase().includes(search) ||
                    prof.tipo_profesor?.toLowerCase().includes(search)
            );
        }

        // Filtro por tipo de profesor
        if (filtroTipo) {
            filtered = filtered.filter(
                (prof) => prof.tipo_profesor === filtroTipo
            );
        }

        setFilteredProfesores(filtered);
    };

    const handleCardClick = (user) => {
        setSelectedUser(user);
        setShowDetailModal(true);
    };

    const handleEdit = (user) => {
        setSelectedUser(user);
        setShowEditModal(true);
    };

    const handleAssign = (user) => {
        setSelectedUser(user);
        setShowAssignModal(true);
    };

    const handleDelete = async (user) => {
        if (
            !window.confirm(
                `¿Está seguro de eliminar a ${user.nombre} ${user.apellido}?`
            )
        ) {
            return;
        }

        try {
            await axios.delete(`${API_URL}profesor/${user.id}/`);
            alert('Profesor eliminado con éxito');
            fetchProfesores();
        } catch (error) {
            console.error('Error al eliminar:', error);
            alert('Error al eliminar el profesor');
        }
    };

    return (
        <div className="listas-container">
            <div className="listas-header">
                <h1>Lista de Profesores</h1>
                <button
                    className="btn-add"
                    onClick={() => navigate('/admin/registro')}
                >
                    <i className="fas fa-plus"></i> Agregar Profesor
                </button>
            </div>

            {/* Barra de búsqueda y filtros */}
            <div className="listas-toolbar">
                <div className="search-container">
                    <i className="fas fa-search search-icon"></i>
                    <input
                        type="text"
                        placeholder="Buscar por nombre, apellido, cédula o tipo..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>
                <div className="filters-container">
                    <select
                        value={filtroTipo}
                        onChange={(e) => setFiltroTipo(e.target.value)}
                        className="filter-select"
                    >
                        <option value="">Todos los tipos</option>
                        <option value="titular">Titular</option>
                        <option value="suplente">Suplente</option>
                        <option value="especialista">Especialista</option>
                    </select>
                </div>
                <div className="view-toggle">
                    <button
                        className={`view-btn ${
                            viewMode === 'cards' ? 'active' : ''
                        }`}
                        onClick={() => setViewMode('cards')}
                        title="Vista de tarjetas"
                    >
                        <i className="fas fa-th"></i>
                    </button>
                    <button
                        className={`view-btn ${
                            viewMode === 'table' ? 'active' : ''
                        }`}
                        onClick={() => setViewMode('table')}
                        title="Vista de tabla"
                    >
                        <i className="fas fa-table"></i>
                    </button>
                </div>
            </div>

            {/* Contador de resultados */}
            <div className="results-info">
                <span>
                    Mostrando {filteredProfesores.length} de {profesores.length}{' '}
                    profesores
                </span>
            </div>

            {/* Vista de Cards */}
            {viewMode === 'cards' && (
                <div className="cards-grid">
                    {loading ? (
                        <div className="loading">Cargando profesores...</div>
                    ) : filteredProfesores.length === 0 ? (
                        <p className="no-data">
                            No hay profesores que coincidan con la búsqueda
                        </p>
                    ) : (
                        filteredProfesores.map((profesor) => (
                            <UserCard
                                key={profesor.id}
                                user={profesor}
                                type="profesor"
                                onCardClick={handleCardClick}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                                onAssingP={handleAssign}
                            />
                        ))
                    )}
                </div>
            )}

            {/* Vista de Tabla */}
            {viewMode === 'table' && (
                <div className="table-container">
                    {loading ? (
                        <div className="loading">Cargando profesores...</div>
                    ) : filteredProfesores.length === 0 ? (
                        <p className="no-data">
                            No hay profesores que coincidan con la búsqueda
                        </p>
                    ) : (
                        <table className="users-table">
                            <thead>
                                <tr>
                                    <th>Foto</th>
                                    <th>Nombre</th>
                                    <th>Cédula</th>
                                    <th>Grados Asignados</th>
                                    <th>Tipo</th>
                                    <th>Edad</th>
                                    <th>Teléfono</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProfesores.map((profesor) => (
                                    <UserRow
                                        key={profesor.id}
                                        user={profesor}
                                        type="profesor"
                                        onRowClick={handleCardClick}
                                        onEdit={handleEdit}
                                        onDelete={handleDelete}
                                        onAssingP={handleAssign}
                                    />
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}
            <DetailModal
                user={selectedUser}
                type="profesor"
                isOpen={showDetailModal}
                onClose={() => {
                    setShowDetailModal(false);
                    setSelectedUser(null);
                }}
                onEdit={handleEdit}
            />
            <EditModal
                user={selectedUser}
                type="profesor"
                isOpen={showEditModal}
                onClose={() => {
                    setShowEditModal(false);
                    setSelectedUser(null);
                }}
                onSave={fetchProfesores}
            />
            <AssignPModal
                user={selectedUser}
                type="profesor"
                isOpen={showAssignModal}
                onClose={() => {
                    setShowAssignModal(false);
                    setSelectedUser(null);
                }}
                onAssignP={fetchProfesores}
            />
        </div>
    );
}
