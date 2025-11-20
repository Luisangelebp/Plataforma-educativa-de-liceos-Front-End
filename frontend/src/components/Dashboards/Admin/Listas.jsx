import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './css/Listas.css';

const API_URL = 'http://localhost:8000/usuarios/';

// Componente de Ficha/Card
const UserCard = ({ user, type, onCardClick, onEdit, onDelete, onAssing }) => {
    const getPhotoUrl = (foto) => {
        if (!foto) return '/default-avatar.png';
        if (foto.startsWith('http')) return foto;
        return `http://localhost:8000${foto}`;
    };
    console.log(user.foto);
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
                            <strong>Grado:</strong> {user.grado}
                        </p>
                        <p>
                            <strong>Nivel:</strong> {user.nivel}
                        </p>
                        <p>
                            <strong>Edad:</strong> {user.edad} años
                        </p>
                    </>
                )}
                {type === 'profesor' && (
                    <>
                        <p>
                            <strong>Grado Asignado:</strong>{' '}
                            {user.grado_asignado}
                        </p>
                        <p>
                            <strong>Tipo:</strong> {user.tipo_profesor}
                        </p>
                        <p>
                            <strong>Edad:</strong> {user.edad} años
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
                    className="btn-assign"
                    onClick={(e) => {
                        e.stopPropagation();
                        onAssing(user);
                    }}
                >
                    <i className="fas fa-user-plus"></i> Asignar Representante
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
    useBodyOverflowLock(isOpen);
    if (!isOpen || !user) return null;
    const getPhotoUrl = (foto) => {
        if (!foto) return '/default-avatar.png';
        if (foto.startsWith('http')) return foto;
        return `http://localhost:8000${foto}`;
    };

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
                                {user.representante && (
                                    <div className="detail-row">
                                        <strong>Representante ID:</strong>
                                        <span>{user.representante}</span>
                                    </div>
                                )}
                            </>
                        )}
                        {type === 'profesor' && (
                            <>
                                <div className="detail-row">
                                    <strong>Grado Asignado:</strong>
                                    <span>{user.grado_asignado}</span>
                                </div>
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
    const [isLoading, setIsLoading] = useState(false);
    useBodyOverflowLock(isOpen);

    useEffect(() => {
        if (user && isOpen) {
            setFormData({
                nombre: user.nombre || '',
                apellido: user.apellido || '',
                fecha_nacimiento: user.fecha_nacimiento || '',
                cedula: user.cedula || '',
                direccion: user.direccion || '',
                telefono: user.telefono || '',
                grado: user.grado || '',
                nivel: user.nivel || '',
                grado_asignado: user.grado_asignado || '',
                tipo_profesor: user.tipo_profesor || '',
                representante: user.representante || '',
            });
            setErrors({});
        }
    }, [user, isOpen]);

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

        try {
            const data = new FormData();
            Object.keys(formData).forEach((key) => {
                if (
                    formData[key] !== null &&
                    formData[key] !== undefined &&
                    formData[key] !== ''
                ) {
                    data.append(key, formData[key]);
                }
            });

            await axios.patch(`${API_URL}${type}/${user.id}/`, data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            alert('Usuario actualizado con éxito');
            onSave();
            onClose();
        } catch (error) {
            console.error('Error al actualizar:', error);
            if (error.response?.data) {
                setErrors(error.response.data);
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
                        <label>Nombre:</label>
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
                        <label>Apellido:</label>
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
                        </>
                    )}
                    {type === 'estudiante' && (
                        <>
                            <div className="form-group">
                                <label>Grado:</label>
                                <input
                                    type="text"
                                    name="grado"
                                    value={formData.grado || ''}
                                    onChange={handleInputChange}
                                />
                                {errors.grado && (
                                    <span className="error">
                                        {errors.grado}
                                    </span>
                                )}
                            </div>
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
                        </>
                    )}
                    {type === 'profesor' && (
                        <>
                            <div className="form-group">
                                <label>Grado Asignado:</label>
                                <input
                                    type="text"
                                    name="grado_asignado"
                                    value={formData.grado_asignado || ''}
                                    onChange={handleInputChange}
                                />
                                {errors.grado_asignado && (
                                    <span className="error">
                                        {errors.grado_asignado}
                                    </span>
                                )}
                            </div>
                            <div className="form-group">
                                <label>Tipo de Profesor:</label>
                                <input
                                    type="text"
                                    name="tipo_profesor"
                                    value={formData.tipo_profesor || ''}
                                    onChange={handleInputChange}
                                />
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

    const filteredRepresentantes = representantes.filter((rep) => {
        const fullName = `${rep.nombre} ${rep.apellido}`.toLowerCase();
        return fullName.includes(searchTerm.toLowerCase());
    });

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
                            filteredRepresentantes.map((representante) => (
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
                                            Nombre: {representante.nombre}{' '}
                                            {representante.apellido}
                                        </p>
                                        <p>Cedula: {representante.cedula}</p>
                                    </div>
                                    <div className="card-photo">
                                        {representante.foto ? (
                                            <img
                                                src={representante.foto}
                                                alt={`${representante.nombre} ${representante.apellido}`}
                                            />
                                        ) : (
                                            <i className="fas fa-user-circle default-foto-user"></i>
                                        )}
                                    </div>
                                </div>
                            ))
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
                        className="btn-assign"
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
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(false);

    useEffect(() => {
        fetchEstudiantes();
    }, []);

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
            <div className="cards-grid">
                {estudiantes.length === 0 ? (
                    <p>No hay estudiantes registrados</p>
                ) : (
                    estudiantes.map((estudiante) => (
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
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);

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
            setLoading(false);
        }
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

    if (loading) {
        return <div className="loading">Cargando representantes...</div>;
    }

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
            <div className="cards-grid">
                {representantes.length === 0 ? (
                    <p>No hay representantes registrados</p>
                ) : (
                    representantes.map((representante) => (
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
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);

    useEffect(() => {
        fetchProfesores();
    }, []);

    const fetchProfesores = async () => {
        try {
            const response = await axios.get(`${API_URL}profesor/`);
            setProfesores(response.data);
        } catch (error) {
            console.error('Error al cargar profesores:', error);
            alert('Error al cargar la lista de profesores');
        } finally {
            setLoading(false);
        }
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
            await axios.delete(`${API_URL}profesor/${user.id}/`);
            alert('Profesor eliminado con éxito');
            fetchProfesores();
        } catch (error) {
            console.error('Error al eliminar:', error);
            alert('Error al eliminar el profesor');
        }
    };

    if (loading) {
        return <div className="loading">Cargando profesores...</div>;
    }

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
            <div className="cards-grid">
                {profesores.length === 0 ? (
                    <p>No hay profesores registrados</p>
                ) : (
                    profesores.map((profesor) => (
                        <UserCard
                            key={profesor.id}
                            user={profesor}
                            type="profesor"
                            onCardClick={handleCardClick}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    ))
                )}
            </div>
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
        </div>
    );
}
