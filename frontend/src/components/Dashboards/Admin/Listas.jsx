import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useNotification } from '../../../context/NotificationContext';
import './css/Listas.css';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const API_URL = `${BASE_URL}/usuarios/`;

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
                    <span className="material-symbols-outlined default-foto-user">account_circle</span>
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
                                ? `${user.grado_seccion.grado}° ${user.grado_seccion.nivel === 'primaria'
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
                                            `${gs.grado}° ${gs.nivel === 'primaria'
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
                {type === 'administrador' && (
                    <>
                        <p>
                            <strong>Rol:</strong> Administrador
                        </p>
                        <p>
                            <strong>Fecha de Registro:</strong>{' '}
                            {user.fecha_creacion
                                ? new Date(user.fecha_creacion).toLocaleDateString()
                                : 'N/A'}
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
                    <span className="material-symbols-outlined">person_add</span> Asignar Representante
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
                    <span className="material-symbols-outlined">import_contacts</span> Asignar Curso y Sección
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
                    <span className="material-symbols-outlined">edit</span> Editar
                </button>
                <button
                    className="btn-delete"
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(user);
                    }}
                >
                    <span className="material-symbols-outlined">delete</span> Eliminar
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
            <td>
                <div className="user-photo-wrapper">
                    {user.foto ? (
                        <img
                            src={getPhotoUrl(user.foto)}
                            alt={`${user.nombre} ${user.apellido}`}
                            className="user-avatar"
                        />
                    ) : (
                        <span className="material-symbols-outlined default-foto-user">account_circle</span>
                    )}
                </div>
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
                                    return `${grado || ''} ${seccion || ''
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
            {type === 'administrador' && (
                <>
                    <td>{user.email}</td>
                    <td>Administrador</td>
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
                        <span className="material-symbols-outlined">person_add</span>
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
                        <span className="material-symbols-outlined">import_contacts</span>
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
                    <span className="material-symbols-outlined">edit</span>
                </button>
                <button
                    className="btn-delete"
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(user);
                    }}
                    title="Eliminar"
                >
                    <span className="material-symbols-outlined">delete</span>
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

// Item de Detalle
const DetailItem = ({ label, value, icon }) => (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', paddingBottom: '12px', borderBottom: '1px solid #f1f5f9' }}>
        <div style={{ color: '#94a3b8', marginTop: '2px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>{icon}</span>
        </div>
        <div>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
            <p style={{ margin: 0, fontSize: '1rem', color: '#1e293b', fontWeight: '700' }}>{value || 'N/A'}</p>
        </div>
    </div>
);

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
            setRepresentante(null);
        }
    };

    useEffect(() => {
        if (type === 'estudiante' && user?.representante) {
            fetchRepresentantesById(user.representante);
        }
    }, [type, user?.representante]);

    if (!isOpen || !user) return null;
    return (
        <div className="modal-overlay" onClick={onClose} style={{ backdropFilter: 'blur(10px)', backgroundColor: 'rgba(15, 23, 42, 0.4)' }}>
            <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{
                maxWidth: '750px',
                width: '95%',
                borderRadius: '28px',
                overflow: 'hidden',
                border: 'none',
                boxShadow: '0 30px 60px -12px rgba(0, 0, 0, 0.25)',
                background: '#f1f5f9',
                maxHeight: '90vh',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <div className="modal-header" style={{
                    background: '#f8fafc',
                    borderBottom: '1px solid #e2e8f0',
                    padding: '1.75rem 2rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexShrink: 0
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{
                            width: '42px',
                            height: '42px',
                            borderRadius: '12px',
                            background: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--primary)',
                            boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
                            border: '1px solid #e2e8f0'
                        }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>visibility</span>
                        </div>
                        <h3 style={{ margin: 0, fontFamily: 'Outfit', fontWeight: '800', fontSize: '1.5rem', color: '#0f172a', letterSpacing: '-0.02em' }}>
                            Detalles del Perfil
                        </h3>
                    </div>
                    <button className="close-btn" onClick={onClose} title="Cerrar" style={{ background: '#ffffff', color: '#64748b', width: '36px', height: '36px', border: '1px solid #e2e8f0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
                    </button>
                </div>

                <div className="modal-body" style={{ padding: '2rem', overflowY: 'auto', flex: 1 }}>
                    <div className="detail-layout" style={{
                        display: 'flex',
                        flexDirection: window.innerWidth < 768 ? 'column' : 'row',
                        gap: '2rem'
                    }}>
                        <div className="detail-photo" style={{ flexShrink: 0 }}>
                            <div style={{
                                width: window.innerWidth < 768 ? '100%' : '220px',
                                maxWidth: '220px',
                                height: '220px',
                                margin: window.innerWidth < 768 ? '0 auto' : '0',
                                borderRadius: '24px',
                                overflow: 'hidden',
                                border: '4px solid white',
                                boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)'
                            }}>
                                <img
                                    src={getPhotoUrl(user.foto)}
                                    alt={`${user.nombre} ${user.apellido}`}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    onError={(e) => {
                                        e.target.src = 'https://via.placeholder.com/200?text=Sin+Foto';
                                    }}
                                />
                            </div>
                            <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                                <span style={{
                                    padding: '6px 16px',
                                    borderRadius: '100px',
                                    background: 'var(--primary)',
                                    color: 'white',
                                    fontSize: '0.8rem',
                                    fontWeight: '800',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    fontFamily: 'Outfit'
                                }}>
                                    {type}
                                </span>
                            </div>
                        </div>

                        <div className="detail-info" style={{ background: 'white', padding: '2rem', borderRadius: '24px', boxShadow: '0 4px 20px -5px rgba(0, 0, 0, 0.05)', border: '1px solid #ffffff' }}>
                            <h4 style={{ margin: '0 0 1.5rem 0', fontFamily: 'Outfit', fontWeight: '800', fontSize: '1.4rem', color: '#1e293b' }}>
                                {user.nombre} {user.apellido}
                            </h4>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <DetailItem label="Fecha de Nacimiento" value={new Date(user.fecha_nacimiento).toLocaleDateString('es-ES')} icon="calendar_today" />
                                <DetailItem label="Edad" value={`${user.edad} años`} icon="cake" />
                                {user.cedula && <DetailItem label="Cédula" value={user.cedula} icon="badge" />}
                                {user.direccion && <DetailItem label="Dirección" value={user.direccion} icon="location_on" />}

                                {type === 'estudiante' && (
                                    <>
                                        <DetailItem label="Grado" value={user.grado} icon="school" />
                                        <DetailItem label="Nivel" value={user.nivel} icon="layers" />
                                        {representante && (
                                            <DetailItem
                                                label="Representante"
                                                value={`${representante.nombre} ${representante.apellido} (C.I: ${representante.cedula})`}
                                                icon="family_history"
                                            />
                                        )}
                                    </>
                                )}

                                {type === 'profesor' && (
                                    <>
                                        <DetailItem
                                            label="Grados Asignados"
                                            value={user.grado_secciones?.length > 0
                                                ? user.grado_secciones.map(gs => `${gs.grado}° ${gs.nivel === 'primaria' ? 'Grado' : 'Año'} ${gs.seccion}`).join(', ')
                                                : 'Sin asignar'}
                                            icon="assignment_ind"
                                        />
                                        {user.materias?.length > 0 && (
                                            <DetailItem
                                                label="Materias"
                                                value={user.materias.map(m => typeof m === 'object' ? m.nombre : m).join(', ')}
                                                icon="book"
                                            />
                                        )}
                                        <DetailItem label="Tipo" value={user.tipo_profesor} icon="military_tech" />
                                        {user.telefono && <DetailItem label="Teléfono" value={user.telefono} icon="call" />}
                                    </>
                                )}

                                {type === 'representante' && (
                                    <>
                                        {user.telefono && <DetailItem label="Teléfono" value={user.telefono} icon="call" />}
                                        {user.profesor_asignado && (
                                            <DetailItem
                                                label="Profesor Asignado"
                                                value={`${user.profesor_asignado.nombre} ${user.profesor_asignado.apellido}`}
                                                icon="person_pin"
                                            />
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="modal-footer" style={{ borderTop: '1px solid #e2e8f0', padding: '1.5rem 2rem', background: '#f8fafc', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                    <button
                        className="btn-edit"
                        onClick={() => { onClose(); onEdit(user); }}
                        style={{
                            borderRadius: '14px',
                            padding: '0.8rem 2rem',
                            fontWeight: '800',
                            fontFamily: 'Outfit',
                            fontSize: '0.95rem',
                            background: '#0f172a',
                            color: 'white',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }}
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>edit</span>
                        Editar Perfil
                    </button>
                </div>
            </div >
        </div >
    );
};


// Modal de Edición

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
                            user.grado_secciones.includes(gs.id),
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
                            (m) => user.materias.includes(m.id),
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
                    setPasswordError(
                        'Este perfil no tiene un usuario asociado para cambiar la contraseña',
                    );
                    setIsLoading(false);
                    return;
                }

                const baseUrl =
                    import.meta.env.VITE_API_URL || 'http://localhost:8000';
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
                        },
                    );
                    setNewPassword('');
                } catch (err) {
                    const data = err.response?.data;
                    if (data?.password) {
                        setPasswordError(
                            Array.isArray(data.password)
                                ? data.password.join(', ')
                                : data.password,
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
                    }),
                );
                formDataObj.append(
                    'grado_secciones',
                    JSON.stringify(gradoSeccionesData),
                );

                // Agregar materias como JSON string (similar a cómo funciona en Materias.jsx)
                // Siempre enviar, incluso si está vacío, para que el backend pueda limpiar las asignaciones
                const materiasIds = selectedMaterias
                    .map((m) => {
                        const id = typeof m === 'object' ? m.id : m;
                        return id != null ? Number(id) : null;
                    })
                    .filter(
                        (id) => id !== null && id !== undefined && !isNaN(id),
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
                        }),
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
                                id !== null && id !== undefined && !isNaN(id),
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
                for (let pair of dataToSend.entries()) {
                    console.log(pair[0] + ': ' + pair[1]);
                }
            } else {
                console.log('Es JSON:', JSON.stringify(dataToSend, null, 2));
            }

            await axios.patch(`${API_URL}${type}/${user.id}/`, dataToSend, {
                headers,
            });

            addNotification('Usuario actualizado con éxito', 'success');
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
                addNotification(errorMessage, 'error');
            } else {
                addNotification('Error al actualizar el usuario', 'error');
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen || !user) return null;
    return (
        <div className="modal-overlay" onClick={onClose} style={{ backdropFilter: 'blur(10px)', backgroundColor: 'rgba(15, 23, 42, 0.4)' }}>
            <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{
                maxWidth: '750px',
                width: '95%',
                borderRadius: '28px',
                overflow: 'hidden',
                border: 'none',
                boxShadow: '0 30px 60px -12px rgba(0, 0, 0, 0.25)',
                background: '#f1f5f9',
                maxHeight: '90vh',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <div className="modal-header" style={{
                    background: '#f8fafc',
                    borderBottom: '1px solid #e2e8f0',
                    padding: '1.75rem 2.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexShrink: 0
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{
                            width: '42px',
                            height: '42px',
                            borderRadius: '12px',
                            background: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--primary)',
                            boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
                            border: '1px solid #e2e8f0'
                        }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>edit</span>
                        </div>
                        <h3 style={{ margin: 0, fontFamily: 'Outfit', fontWeight: '800', fontSize: '1.5rem', color: '#0f172a', letterSpacing: '-0.02em' }}>
                            Editar Usuario
                        </h3>
                    </div>
                    <button className="close-btn" onClick={onClose} title="Cerrar" style={{ background: '#ffffff', color: '#64748b', width: '36px', height: '36px', border: '1px solid #e2e8f0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
                    <div className="modal-body" style={{ padding: '2.5rem', overflowY: 'auto', flex: 1 }}>
                        <div style={{ background: 'white', padding: '2.5rem', borderRadius: '24px', boxShadow: '0 4px 20px -5px rgba(0, 0, 0, 0.05)', border: '1px solid #ffffff' }}>

                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: window.innerWidth < 640 ? '1fr' : '1fr 1fr',
                                gap: '1.5rem',
                                marginBottom: '1.5rem'
                            }}>
                                <div className="form-group">
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', color: '#475569', fontSize: '0.9rem' }}>Nombres:</label>
                                    <input
                                        type="text"
                                        name="nombre"
                                        value={formData.nombre || ''}
                                        onChange={handleInputChange}
                                        style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '1rem', outline: 'none' }}
                                        required
                                    />
                                    {errors.nombre && <span className="error" style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>{errors.nombre}</span>}
                                </div>
                                <div className="form-group">
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', color: '#475569', fontSize: '0.9rem' }}>Apellidos:</label>
                                    <input
                                        type="text"
                                        name="apellido"
                                        value={formData.apellido || ''}
                                        onChange={handleInputChange}
                                        style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '1rem', outline: 'none' }}
                                        required
                                    />
                                    {errors.apellido && <span className="error" style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>{errors.apellido}</span>}
                                </div>
                            </div>

                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: window.innerWidth < 640 ? '1fr' : '1fr 1fr',
                                gap: '1.5rem',
                                marginBottom: '1.5rem'
                            }}>
                                <div className="form-group">
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', color: '#475569', fontSize: '0.9rem' }}>Fecha de Nacimiento:</label>
                                    <input
                                        type="date"
                                        name="fecha_nacimiento"
                                        value={formData.fecha_nacimiento || ''}
                                        onChange={handleInputChange}
                                        style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '1rem', outline: 'none' }}
                                        required
                                    />
                                    {errors.fecha_nacimiento && <span className="error" style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>{errors.fecha_nacimiento}</span>}
                                </div>
                                {(type === 'estudiante' || type === 'profesor' || type === 'representante' || type === 'administrador') && (
                                    <div className="form-group">
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', color: '#475569', fontSize: '0.9rem' }}>Cédula:</label>
                                        <input
                                            type="text"
                                            name="cedula"
                                            value={formData.cedula || ''}
                                            onChange={handleInputChange}
                                            style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '1rem', outline: 'none' }}
                                        />
                                        {errors.cedula && <span className="error" style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>{errors.cedula}</span>}
                                    </div>
                                )}
                            </div>

                            {(type === 'estudiante' || type === 'profesor' || type === 'representante' || type === 'administrador') && (
                                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', color: '#475569', fontSize: '0.9rem' }}>Dirección:</label>
                                    <input
                                        type="text"
                                        name="direccion"
                                        value={formData.direccion || ''}
                                        onChange={handleInputChange}
                                        style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '1rem', outline: 'none' }}
                                    />
                                    {errors.direccion && <span className="error" style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>{errors.direccion}</span>}
                                </div>
                            )}

                            {type === 'administrador' && (
                                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', color: '#475569', fontSize: '0.9rem' }}>Email:</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email || ''}
                                        onChange={handleInputChange}
                                        style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '1rem', outline: 'none' }}
                                        required
                                    />
                                    {errors.email && <span className="error" style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>{errors.email}</span>}
                                </div>
                            )}

                            {user?.usuario && (
                                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', color: '#475569', fontSize: '0.9rem' }}>Nueva contraseña (opcional):</label>
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => {
                                            setNewPassword(e.target.value);
                                            if (passwordError) setPasswordError('');
                                        }}
                                        autoComplete="new-password"
                                        style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '1rem', outline: 'none' }}
                                    />
                                    {passwordError && <span className="error" style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>{passwordError}</span>}
                                </div>
                            )}

                            {type === 'estudiante' && (
                                <>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                                        <div className="form-group">
                                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', color: '#475569', fontSize: '0.9rem' }}>Nivel:</label>
                                            <select
                                                name="nivel"
                                                value={formData.nivel || ''}
                                                onChange={handleInputChange}
                                                style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '1rem', outline: 'none' }}
                                            >
                                                <option value="">Seleccione...</option>
                                                <option value="primaria">Primaria</option>
                                                <option value="secundaria">Secundaria</option>
                                            </select>
                                            {errors.nivel && <span className="error" style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>{errors.nivel}</span>}
                                        </div>
                                        <div className="form-group">
                                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', color: '#475569', fontSize: '0.9rem' }}>
                                                {formData.nivel === 'primaria' ? 'Grado:' : formData.nivel === 'secundaria' ? 'Año:' : 'Grado/Año:'}
                                            </label>
                                            <select
                                                name="grado"
                                                value={formData.grado || ''}
                                                onChange={handleInputChange}
                                                disabled={!formData.nivel}
                                                style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '1rem', outline: 'none' }}
                                            >
                                                <option value="">{formData.nivel ? 'Seleccione...' : 'Primero el nivel'}</option>
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
                                            {errors.grado && <span className="error" style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>{errors.grado}</span>}
                                        </div>
                                    </div>
                                    <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', color: '#475569', fontSize: '0.9rem' }}>Sección:</label>
                                        <select
                                            name="seccion"
                                            value={formData.seccion || ''}
                                            onChange={handleInputChange}
                                            style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '1rem', outline: 'none' }}
                                        >
                                            <option value="">Seleccione...</option>
                                            <option value="A">Sección A</option>
                                            <option value="B">Sección B</option>
                                            <option value="C">Sección C</option>
                                        </select>
                                        {errors.seccion && <span className="error" style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>{errors.seccion}</span>}
                                    </div>
                                </>
                            )}
                            {type === 'profesor' && (
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                                    <div className="form-group">
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', color: '#475569', fontSize: '0.9rem' }}>Tipo de Profesor:</label>
                                        <select
                                            name="tipo_profesor"
                                            value={formData.tipo_profesor || ''}
                                            onChange={handleInputChange}
                                            style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '1rem', outline: 'none' }}
                                        >
                                            <option value="">Seleccione...</option>
                                            <option value="titular">Titular</option>
                                            <option value="suplente">Suplente</option>
                                            <option value="especialista">Especialista</option>
                                        </select>
                                        {errors.tipo_profesor && <span className="error" style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>{errors.tipo_profesor}</span>}
                                    </div>
                                    <div className="form-group">
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', color: '#475569', fontSize: '0.9rem' }}>Teléfono:</label>
                                        <input
                                            type="text"
                                            name="telefono"
                                            value={formData.telefono || ''}
                                            onChange={handleInputChange}
                                            style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '1rem', outline: 'none' }}
                                        />
                                        {errors.telefono && <span className="error" style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>{errors.telefono}</span>}
                                    </div>
                                </div>
                            )}

                            {type === 'representante' && (
                                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', color: '#475569', fontSize: '0.9rem' }}>Teléfono:</label>
                                    <input
                                        type="text"
                                        name="telefono"
                                        value={formData.telefono || ''}
                                        onChange={handleInputChange}
                                        style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '1rem', outline: 'none' }}
                                    />
                                    {errors.telefono && <span className="error" style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>{errors.telefono}</span>}
                                </div>
                            )}

                            <div className="form-group" style={{ marginBottom: '0.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '12px', fontWeight: '700', color: '#475569', fontSize: '0.9rem' }}>Foto de Perfil:</label>
                                <div style={{
                                    border: '2px dashed #e2e8f0',
                                    borderRadius: '16px',
                                    padding: '2rem',
                                    textAlign: 'center',
                                    background: '#f8fafc',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                }} onClick={() => document.getElementById('edit-foto-input').click()}>
                                    <span className="material-symbols-outlined" style={{ fontSize: '32px', color: '#94748b', marginBottom: '8px' }}>cloud_upload</span>
                                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b', fontWeight: '500' }}>
                                        Haz clic para subir o arrastra una imagen
                                    </p>
                                    <input
                                        id="edit-foto-input"
                                        type="file"
                                        name="foto"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        style={{ display: 'none' }}
                                    />
                                </div>
                                {errors.foto && <span className="error" style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>{errors.foto}</span>}
                                {formData.foto && typeof formData.foto === 'object' && (
                                    <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                                        <span className="material-symbols-outlined" style={{ color: '#16a34a', fontSize: '18px' }}>check_circle</span>
                                        <span style={{ fontSize: '0.85rem', color: '#166534', fontWeight: '600' }}>Archivo seleccionado: {formData.foto.name}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="modal-footer" style={{
                        background: '#f8fafc',
                        borderTop: '1px solid #e2e8f0',
                        padding: '1.5rem 2.5rem',
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: '1rem'
                    }}>
                        <button
                            type="button"
                            className="btn-cancel"
                            onClick={onClose}
                            style={{
                                padding: '0.75rem 1.75rem',
                                borderRadius: '12px',
                                fontWeight: '700',
                                border: '1px solid #e2e8f0',
                                background: 'white',
                                color: '#64748b',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                fontFamily: 'Outfit'
                            }}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="btn-save"
                            disabled={isLoading}
                            style={{
                                padding: '0.75rem 2rem',
                                borderRadius: '12px',
                                fontWeight: '800',
                                border: 'none',
                                background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                                color: 'white',
                                cursor: isLoading ? 'not-allowed' : 'pointer',
                                boxShadow: '0 10px 20px -5px rgba(15, 23, 42, 0.3)',
                                transition: 'all 0.2s ease',
                                fontFamily: 'Outfit',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                        >
                            {isLoading ? (
                                <>
                                    <span className="material-symbols-outlined spinning" style={{ fontSize: '18px' }}>progress_activity</span>
                                    Guardando...
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>save</span>
                                    Guardar Cambios
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Modal para Asignar Representante

const AssignModal = ({ user, type, isOpen, onClose, onAssign }) => {
    const { addNotification } = useNotification();
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
            addNotification('Error al cargar la lista de representantes', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAssign = async () => {
        if (!selectedRep) {
            addNotification('Por favor, seleccione un representante', 'warning');
            return;
        }

        try {
            await axios.patch(`${API_URL}${type}/${user.id}/`, {
                representante: selectedRep,
            });
            addNotification('Representante asignado con éxito', 'success');
            onAssign();
            onClose();
        } catch (error) {
            console.error('Error al asignar representante:', error);
            addNotification('Error al asignar el representante', 'error');
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
        filteredRepresentantes.length / ITEMS_PER_PAGE,
    );
    const paginatedRepresentantes = filteredRepresentantes.slice(
        currentPage * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE + ITEMS_PER_PAGE,
    );

    useEffect(() => {
        setCurrentPage(0);
    }, [filteredRepresentantes]);

    if (!isOpen || !user) return null;
    return (
        <div className="modal-overlay" onClick={onClose} style={{ backdropFilter: 'blur(10px)', backgroundColor: 'rgba(15, 23, 42, 0.4)' }}>
            <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{
                maxWidth: '600px',
                width: '95%',
                borderRadius: '28px',
                overflow: 'hidden',
                border: 'none',
                boxShadow: '0 30px 60px -12px rgba(0, 0, 0, 0.25)',
                background: '#f1f5f9',
                maxHeight: '90vh',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <div className="modal-header" style={{
                    background: '#f8fafc',
                    borderBottom: '1px solid #e2e8f0',
                    padding: '1.5rem 2rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexShrink: 0
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '12px',
                            background: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--primary)',
                            boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
                            border: '1px solid #e2e8f0'
                        }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>person_add</span>
                        </div>
                        <h3 style={{ margin: 0, fontFamily: 'Outfit', fontWeight: '800', fontSize: '1.25rem', color: '#0f172a', letterSpacing: '-0.02em' }}>
                            Asignar Representante
                        </h3>
                    </div>
                    <button className="close-btn" onClick={onClose} title="Cerrar" style={{ background: '#ffffff', color: '#64748b', width: '32px', height: '32px', border: '1px solid #e2e8f0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
                    </button>
                </div>
                <div className="modal-body" style={{ padding: '2rem', overflowY: 'auto', flex: 1 }}>
                    <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', color: '#475569', fontSize: '0.9rem' }}>Buscar Representante:</label>
                        <div style={{ position: 'relative' }}>
                            <span className="material-symbols-outlined" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '20px' }}>search</span>
                            <input
                                type="search"
                                placeholder="Nombre o Cédula..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white', fontSize: '1rem', outline: 'none' }}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {filteredRepresentantes.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '2rem', background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                                <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#cbd5e1', marginBottom: '12px' }}>person_search</span>
                                <p style={{ margin: 0, color: '#64748b', fontWeight: '500' }}>No se encontraron representantes</p>
                            </div>
                        ) : (
                            paginatedRepresentantes.map((rep) => (
                                <div
                                    key={rep.id}
                                    onClick={() => setSelectedRep(rep.id)}
                                    style={{
                                        padding: '12px 16px',
                                        borderRadius: '16px',
                                        background: selectedRep === rep.id ? 'var(--primary)' : 'white',
                                        border: `1px solid ${selectedRep === rep.id ? 'var(--primary)' : '#e2e8f0'}`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        boxShadow: selectedRep === rep.id ? '0 10px 15px -3px rgba(67, 97, 238, 0.2)' : 'none'
                                    }}
                                >
                                    <div style={{
                                        width: '44px',
                                        height: '44px',
                                        borderRadius: '12px',
                                        overflow: 'hidden',
                                        background: '#f1f5f9',
                                        flexShrink: 0
                                    }}>
                                        {rep.foto ? (
                                            <img src={rep.foto} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                                                <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>account_circle</span>
                                            </div>
                                        )}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <p style={{ margin: 0, fontWeight: '700', color: selectedRep === rep.id ? 'white' : '#0f172a', fontSize: '0.95rem' }}>
                                            {rep.nombre} {rep.apellido}
                                        </p>
                                        <p style={{ margin: 0, fontSize: '0.8rem', color: selectedRep === rep.id ? 'rgba(255,255,255,0.8)' : '#64748b' }}>
                                            C.I. {rep.cedula}
                                        </p>
                                    </div>
                                    {selectedRep === rep.id && (
                                        <span className="material-symbols-outlined" style={{ color: 'white' }}>check_circle</span>
                                    )}
                                </div>
                            ))
                        )}
                    </div>

                    {totalPages > 1 && (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginTop: '1.5rem' }}>
                            <button
                                onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                                disabled={currentPage === 0}
                                style={{ padding: '8px', borderRadius: '10px', border: '1px solid #e2e8f0', background: 'white', color: '#64748b', cursor: currentPage === 0 ? 'not-allowed' : 'pointer' }}
                            >
                                <span className="material-symbols-outlined">chevron_left</span>
                            </button>
                            <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#475569' }}>
                                {currentPage + 1} / {totalPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                                disabled={currentPage === totalPages - 1}
                                style={{ padding: '8px', borderRadius: '10px', border: '1px solid #e2e8f0', background: 'white', color: '#64748b', cursor: currentPage === totalPages - 1 ? 'not-allowed' : 'pointer' }}
                            >
                                <span className="material-symbols-outlined">chevron_right</span>
                            </button>
                        </div>
                    )}
                </div>

                <div className="modal-footer" style={{
                    background: '#f8fafc',
                    borderTop: '1px solid #e2e8f0',
                    padding: '1.25rem 2rem',
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '1rem'
                }}>
                    <button
                        type="button"
                        onClick={onClose}
                        style={{ padding: '0.6rem 1.25rem', borderRadius: '10px', fontWeight: '700', border: '1px solid #e2e8f0', background: 'white', color: '#64748b', cursor: 'pointer', fontFamily: 'Outfit' }}
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        onClick={handleAssign}
                        disabled={isLoading || !selectedRep}
                        style={{
                            padding: '0.6rem 1.5rem',
                            borderRadius: '10px',
                            fontWeight: '800',
                            border: 'none',
                            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                            color: 'white',
                            cursor: (isLoading || !selectedRep) ? 'not-allowed' : 'pointer',
                            boxShadow: '0 4px 10px rgba(15, 23, 42, 0.2)',
                            transition: 'all 0.2s ease',
                            fontFamily: 'Outfit',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        {isLoading ? (
                            <>
                                <span className="material-symbols-outlined spinning" style={{ fontSize: '18px' }}>progress_activity</span>
                                Asignando...
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>link</span>
                                Asignar
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

// Modal para Asignar Curso y Sección a Profesor

const AssignPModal = ({ user, type, isOpen, onClose, onAssignP }) => {
    const { addNotification } = useNotification();
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
                `${BASE_URL}/grado-seccion/`
            );
            setCursos(response.data);
        } catch (error) {
            console.error('Error al cargar cursos:', error);
            addNotification('Error al cargar la lista de cursos', 'error');
        } finally {
            setIsLoading(false);
        }
    };
    const handleAssign = async () => {
        if (!selectedCurso) {
            addNotification('Por favor, seleccione un curso', 'warning');
            return;
        }
        console.log(selectedCurso);
        try {
            await axios.patch(`${API_URL}profesor/${user.id}/`, {
                grado_secciones: selectedCurso,
            });
            addNotification('Curso asignado con éxito', 'success');
            onAssignP();
            onClose();
        } catch (error) {
            console.error('Error al asignar curso:', error);
            addNotification('Error al asignar el curso', 'error');
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
        currentPage * ITEMS_PER_PAGE + ITEMS_PER_PAGE,
    );

    useEffect(() => {
        setCurrentPage(0);
    }, [filteredCursos]);

    if (!isOpen || !user) return null;
    return (
        <div className="modal-overlay" onClick={onClose} style={{ backdropFilter: 'blur(10px)', backgroundColor: 'rgba(15, 23, 42, 0.4)' }}>
            <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{
                maxWidth: '700px',
                width: '95%',
                borderRadius: '28px',
                overflow: 'hidden',
                border: 'none',
                boxShadow: '0 30px 60px -12px rgba(0, 0, 0, 0.25)',
                background: '#f1f5f9',
                maxHeight: '90vh',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <div className="modal-header" style={{
                    background: '#f8fafc',
                    borderBottom: '1px solid #e2e8f0',
                    padding: '1.5rem 2rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexShrink: 0
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '12px',
                            background: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--primary)',
                            boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
                            border: '1px solid #e2e8f0'
                        }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>school</span>
                        </div>
                        <h3 style={{ margin: 0, fontFamily: 'Outfit', fontWeight: '800', fontSize: '1.25rem', color: '#0f172a', letterSpacing: '-0.02em' }}>
                            Asignar Cursos
                        </h3>
                    </div>
                    <button className="close-btn" onClick={onClose} title="Cerrar" style={{ background: '#ffffff', color: '#64748b', width: '32px', height: '32px', border: '1px solid #e2e8f0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
                    </button>
                </div>

                <div className="modal-body" style={{ padding: '2rem', overflowY: 'auto', flex: 1 }}>
                    <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', color: '#475569', fontSize: '0.9rem' }}>Buscar Curso:</label>
                        <div style={{ position: 'relative' }}>
                            <span className="material-symbols-outlined" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '20px' }}>search</span>
                            <input
                                type="search"
                                placeholder="Nivel o Grado..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white', fontSize: '1rem', outline: 'none' }}
                            />
                        </div>
                    </div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: window.innerWidth < 640 ? '1fr' : '1fr 1fr',
                        gap: '12px'
                    }}>
                        {filteredCursos.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '2rem', background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                                <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#cbd5e1', marginBottom: '12px' }}>domain_disabled</span>
                                <p style={{ margin: 0, color: '#64748b', fontWeight: '500' }}>No se encontraron cursos</p>
                            </div>
                        ) : (
                            paginatedCursos.map((curso) => (
                                <div
                                    key={curso.id}
                                    onClick={() => setSelectedCurso((prev) => {
                                        if (prev.includes(curso.id)) return prev.filter(id => id !== curso.id);
                                        return [...prev, curso.id];
                                    })}
                                    style={{
                                        padding: '12px 16px',
                                        borderRadius: '16px',
                                        background: selectedCurso.includes(curso.id) ? 'var(--primary)' : 'white',
                                        border: `1px solid ${selectedCurso.includes(curso.id) ? 'var(--primary)' : '#e2e8f0'}`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        boxShadow: selectedCurso.includes(curso.id) ? '0 10px 15px -3px rgba(67, 97, 238, 0.2)' : 'none'
                                    }}
                                >
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '10px',
                                        background: selectedCurso.includes(curso.id) ? 'rgba(255,255,255,0.2)' : '#f1f5f9',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: selectedCurso.includes(curso.id) ? 'white' : 'var(--primary)',
                                        fontWeight: '800',
                                        fontSize: '0.9rem'
                                    }}>
                                        {curso.grado}°
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <p style={{ margin: 0, fontWeight: '700', color: selectedCurso.includes(curso.id) ? 'white' : '#0f172a', fontSize: '0.95rem' }}>
                                            {curso.nivel === 'primaria' ? 'Primaria' : 'Secundaria'} - Sección {curso.seccion}
                                        </p>
                                        <p style={{ margin: 0, fontSize: '0.8rem', color: selectedCurso.includes(curso.id) ? 'rgba(255,255,255,0.8)' : '#64748b' }}>
                                            {curso.grado}° {curso.nivel === 'primaria' ? 'Grado' : 'Año'}
                                        </p>
                                    </div>
                                    {selectedCurso.includes(curso.id) && (
                                        <span className="material-symbols-outlined" style={{ color: 'white' }}>check_circle</span>
                                    )}
                                </div>
                            ))
                        )}
                    </div>

                    {totalPages > 1 && (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginTop: '1.5rem' }}>
                            <button
                                onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                                disabled={currentPage === 0}
                                style={{ padding: '8px', borderRadius: '10px', border: '1px solid #e2e8f0', background: 'white', color: '#64748b', cursor: currentPage === 0 ? 'not-allowed' : 'pointer' }}
                            >
                                <span className="material-symbols-outlined">chevron_left</span>
                            </button>
                            <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#475569' }}>
                                {currentPage + 1} / {totalPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                                disabled={currentPage === totalPages - 1}
                                style={{ padding: '8px', borderRadius: '10px', border: '1px solid #e2e8f0', background: 'white', color: '#64748b', cursor: currentPage === totalPages - 1 ? 'not-allowed' : 'pointer' }}
                            >
                                <span className="material-symbols-outlined">chevron_right</span>
                            </button>
                        </div>
                    )}
                </div>

                <div className="modal-footer" style={{
                    background: '#f8fafc',
                    borderTop: '1px solid #e2e8f0',
                    padding: '1.25rem 2rem',
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '1rem'
                }}>
                    <button
                        type="button"
                        onClick={onClose}
                        style={{ padding: '0.6rem 1.25rem', borderRadius: '10px', fontWeight: '700', border: '1px solid #e2e8f0', background: 'white', color: '#64748b', cursor: 'pointer', fontFamily: 'Outfit' }}
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        onClick={handleAssign}
                        disabled={isLoading || selectedCurso.length === 0}
                        style={{
                            padding: '0.6rem 1.5rem',
                            borderRadius: '10px',
                            fontWeight: '800',
                            border: 'none',
                            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                            color: 'white',
                            cursor: (isLoading || selectedCurso.length === 0) ? 'not-allowed' : 'pointer',
                            boxShadow: '0 4px 10px rgba(15, 23, 42, 0.2)',
                            transition: 'all 0.2s ease',
                            fontFamily: 'Outfit',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        {isLoading ? (
                            <>
                                <span className="material-symbols-outlined spinning" style={{ fontSize: '18px' }}>progress_activity</span>
                                Asignando...
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>link</span>
                                Asignar
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

// Lista de Estudiantes
export function ListaE() {
    const { addNotification } = useNotification();
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
            addNotification('Error al cargar la lista de estudiantes', 'error');
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
                    est.grado_seccion?.seccion?.toLowerCase().includes(search),
            );
        }

        // Filtro por nivel
        if (filtroNivel) {
            filtered = filtered.filter(
                (est) => est.grado_seccion?.nivel === filtroNivel,
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
                `¿Está seguro de eliminar a ${user.nombre} ${user.apellido}?`,
            )
        ) {
            return;
        }

        try {
            await axios.delete(`${API_URL}estudiante/${user.id}/`);
            addNotification('Estudiante eliminado con éxito', 'success');
            fetchEstudiantes();
        } catch (error) {
            console.error('Error al eliminar:', error);
            addNotification('Error al eliminar el estudiante', 'error');
        }
    };

    if (loading) {
        return <div className="loading">Cargando estudiantes...</div>;
    }

    return (
        <div className="listas-container">
            <div className="listas-header">
                <h1>Lista de Estudiantes</h1>
            </div>

            {/* Barra de búsqueda y filtros */}
            <div className="listas-toolbar">
                <div className="search-container">
                    <span className="material-symbols-outlined search-icon">search</span>
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
                        className={`view-btn ${viewMode === 'cards' ? 'active' : ''
                            }`}
                        onClick={() => setViewMode('cards')}
                        title="Vista de tarjetas"
                    >
                        <span className="material-symbols-outlined">grid_view</span>
                    </button>
                    <button
                        className={`view-btn ${viewMode === 'table' ? 'active' : ''
                            }`}
                        onClick={() => setViewMode('table')}
                        title="Vista de tabla"
                    >
                        <span className="material-symbols-outlined">table_chart</span>
                    </button>
                </div>
                <button
                    className="btn-add"
                    onClick={() => navigate('/admin/registro')}
                >
                    <span className="material-symbols-outlined">add</span> Agregar Estudiante
                </button>
            </div >

            {/* Contador de resultados */}
            < div className="results-info" >
                <span>
                    Mostrando {filteredEstudiantes.length} de{' '}
                    {estudiantes.length} estudiantes
                </span>
            </div >

            {/* Vista de Cards */}
            {
                viewMode === 'cards' && (
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
                )
            }

            {/* Vista de Tabla */}
            {
                viewMode === 'table' && (
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
                )
            }
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
        </div >
    );
}

// Lista de Representantes
export function ListaR() {
    const { addNotification } = useNotification();
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
            addNotification('Error al cargar la lista de representantes', 'error');
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
                    rep.telefono?.toLowerCase().includes(search),
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
                `¿Está seguro de eliminar a ${user.nombre} ${user.apellido}?`,
            )
        ) {
            return;
        }

        try {
            await axios.delete(`${API_URL}representante/${user.id}/`);
            addNotification('Representante eliminado con éxito', 'success');
            fetchRepresentantes();
        } catch (error) {
            console.error('Error alim eliminar:', error);
            addNotification('Error al eliminar el representante', 'error');
        }
    };

    return (
        <div className="listas-container">
            <div className="listas-header">
                <h1>Lista de Representantes</h1>
            </div>

            {/* Barra de búsqueda y filtros */}
            <div className="listas-toolbar">
                <div className="search-container">
                    <span className="material-symbols-outlined search-icon">search</span>
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
                        className={`view-btn ${viewMode === 'cards' ? 'active' : ''}`}
                        onClick={() => setViewMode('cards')}
                        title="Vista de tarjetas"
                    >
                        <span className="material-symbols-outlined">grid_view</span>
                    </button>
                    <button
                        className={`view-btn ${viewMode === 'table' ? 'active' : ''}`}
                        onClick={() => setViewMode('table')}
                        title="Vista de tabla"
                    >
                        <span className="material-symbols-outlined">table_chart</span>
                    </button>
                </div>
                <button
                    className="btn-add"
                    onClick={() => navigate('/admin/registro')}
                >
                    <span className="material-symbols-outlined">add</span> Agregar Representante
                </button>
            </div>


            {/* Contador de resultados */}
            < div className="results-info" >
                <span>
                    Mostrando {filteredRepresentantes.length} de{' '}
                    {representantes.length} representantes
                </span>
            </div >

            {/* Vista de Cards */}
            {
                viewMode === 'cards' && (
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
                )
            }

            {/* Vista de Tabla */}
            {
                viewMode === 'table' && (
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
                )
            }
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
        </div >
    );
}

// Lista de Profesores
export function ListaP() {
    const { addNotification } = useNotification();
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
                        `Profesor ${index + 1} (${prof.nombre} ${prof.apellido}):`,
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
            addNotification('Error al cargar la lista de profesores', 'error');
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
                    prof.tipo_profesor?.toLowerCase().includes(search),
            );
        }

        // Filtro por tipo de profesor
        if (filtroTipo) {
            filtered = filtered.filter(
                (prof) => prof.tipo_profesor === filtroTipo,
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
                `¿Está seguro de eliminar a ${user.nombre} ${user.apellido}?`,
            )
        ) {
            return;
        }

        try {
            await axios.delete(`${API_URL}profesor/${user.id}/`);
            addNotification('Profesor eliminado con éxito', 'success');
            fetchProfesores();
        } catch (error) {
            console.error('Error al eliminar:', error);
            addNotification('Error al eliminar el profesor', 'error');
        }
    };

    return (
        <div className="listas-container">
            <div className="listas-header">
                <h1>Lista de Profesores</h1>
            </div>

            {/* Barra de búsqueda y filtros */}
            <div className="listas-toolbar">
                <div className="search-container">
                    <span className="material-symbols-outlined search-icon">search</span>
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
                        <option value="">Todos los Tipos</option>
                        <option value="planta">Planta</option>
                        <option value="contratado">Contratado</option>
                    </select>

                    <div className="view-toggle">
                        <button
                            className={`view-btn ${viewMode === 'table' ? 'active' : ''}`}
                            onClick={() => setViewMode('table')}
                            title="Vista de lista"
                        >
                            <span className="material-symbols-outlined">table_rows</span>
                        </button>
                        <button
                            className={`view-btn ${viewMode === 'cards' ? 'active' : ''}`}
                            onClick={() => setViewMode('cards')}
                            title="Vista de tarjetas"
                        >
                            <span className="material-symbols-outlined">grid_view</span>
                        </button>
                    </div>
                </div>
                <button
                    className="btn-add"
                    onClick={() => navigate('/admin/registro')}
                >
                    <span className="material-symbols-outlined">add</span> Agregar Profesor
                </button>

            </div >

            {/* Contador de resultados */}
            < div className="results-info" >
                <span>
                    Mostrando {filteredProfesores.length} de {profesores.length}{' '}
                    profesores
                </span>
            </div >

            {/* Vista de Cards */}
            {
                viewMode === 'cards' && (
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
                )
            }

            {/* Vista de Tabla */}
            {
                viewMode === 'table' && (
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
                )
            }
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
        </div >
    );
}

// Lista de Administradores
export function ListaA() {
    const { addNotification } = useNotification();
    const navigate = useNavigate();
    const [administradores, setAdministradores] = useState([]);
    const [filteredAdmins, setFilteredAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('table');

    useEffect(() => {
        fetchAdmins();
    }, []);

    useEffect(() => {
        filterAdmins();
    }, [administradores, searchTerm]);

    const fetchAdmins = async () => {
        try {
            const response = await axios.get(`${API_URL}administrador/`);
            setAdministradores(response.data);
        } catch (error) {
            console.error('Error al cargar administradores:', error);
            addNotification('Error al cargar la lista de administradores', 'error');
        } finally {
            setLoading(false);
        }
    };

    const filterAdmins = () => {
        let filtered = [...administradores];

        if (searchTerm) {
            const search = searchTerm.toLowerCase();
            filtered = filtered.filter(
                (adm) =>
                    adm.nombre?.toLowerCase().includes(search) ||
                    adm.apellido?.toLowerCase().includes(search) ||
                    adm.email?.toLowerCase().includes(search),
            );
        }

        setFilteredAdmins(filtered);
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
                `¿Está seguro de eliminar a ${user.nombre} ${user.apellido}?`,
            )
        ) {
            return;
        }

        try {
            await axios.delete(`${API_URL}administrador/${user.id}/`);
            addNotification('Administrador eliminado con éxito', 'success');
            fetchAdmins();
        } catch (error) {
            console.error('Error al eliminar:', error);
            addNotification('Error al eliminar el administrador', 'error');
        }
    };

    return (
        <div className="listas-container">
            <div className="listas-header">
                <h1>Lista de Directivos</h1>
            </div>

            <div className="listas-toolbar">
                <div className="search-container">
                    <span className="material-symbols-outlined search-icon">search</span>
                    <input
                        type="text"
                        placeholder="Buscar por nombre, apellido o email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>
                <div className="view-toggle">
                    <button
                        className={`view-btn ${viewMode === 'cards' ? 'active' : ''}`}
                        onClick={() => setViewMode('cards')}
                    >
                        <span className="material-symbols-outlined">grid_view</span>
                    </button>
                    <button
                        className={`view-btn ${viewMode === 'table' ? 'active' : ''}`}
                        onClick={() => setViewMode('table')}
                    >
                        <span className="material-symbols-outlined">table_chart</span>
                    </button>
                </div>
                <button
                    className="btn-add"
                    onClick={() => navigate('/admin/registro')}
                >
                    <span className="material-symbols-outlined">add</span> Agregar Directivo
                </button>
            </div>

            <div className="results-info">
                <span>
                    Mostrando {filteredAdmins.length} de {administradores.length} directivos
                </span>
            </div>

            {
                viewMode === 'cards' && (
                    <div className="cards-grid">
                        {loading ? (
                            <div className="loading">Cargando directivos...</div>
                        ) : (
                            filteredAdmins.map((admin) => (
                                <UserCard
                                    key={admin.id}
                                    user={admin}
                                    type="administrador"
                                    onCardClick={handleCardClick}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                />
                            ))
                        )}
                    </div>
                )
            }

            {
                viewMode === 'table' && (
                    <div className="table-container">
                        {loading ? (
                            <div className="loading">Cargando directivos...</div>
                        ) : (
                            <table className="users-table">
                                <thead>
                                    <tr>
                                        <th>Foto</th>
                                        <th>Nombre</th>
                                        <th>Email</th>
                                        <th>Rol</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredAdmins.map((admin) => (
                                        <UserRow
                                            key={admin.id}
                                            user={admin}
                                            type="administrador"
                                            onRowClick={handleCardClick}
                                            onEdit={handleEdit}
                                            onDelete={handleDelete}
                                        />
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )
            }
            <DetailModal
                user={selectedUser}
                type="administrador"
                isOpen={showDetailModal}
                onClose={() => {
                    setShowDetailModal(false);
                    setSelectedUser(null);
                }}
                onEdit={handleEdit}
            />
            <EditModal
                user={selectedUser}
                type="administrador"
                isOpen={showEditModal}
                onClose={() => {
                    setShowEditModal(false);
                    setSelectedUser(null);
                }}
                onSave={fetchAdmins}
            />
        </div >
    );
}

export default ListaE;
