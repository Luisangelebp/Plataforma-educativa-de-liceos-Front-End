import { useState, useEffect, useCallback, memo } from 'react';
import axios from 'axios';

const API_URL_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Componente Modal fuera del componente principal para evitar recreaciones
const Modal = memo(({ isOpen, onClose, title, children, roleIcon }) => {
    if (!isOpen) return null;

    return (
        <div 
            className="modal-overlay" 
            onClick={onClose}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 1000,
                padding: '20px'
            }}
        >
            <div 
                className="modal-content"
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                style={{
                    background: 'white',
                    borderRadius: '12px',
                    width: '100%',
                    maxWidth: '900px',
                    maxHeight: '95vh',
                    overflowY: 'auto',
                    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column'
                }}
            >
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '15px 20px',
                    borderBottom: '2px solid #f0f0f0',
                    flexShrink: 0
                }}>
                    <h2 style={{
                        margin: 0,
                        fontSize: '1.3rem',
                        fontWeight: '600',
                        color: '#333',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                    }}>
                        <i className={`fas ${roleIcon}`} style={{color: '#007bff'}}></i>
                        {title}
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '1.5rem',
                            color: '#999',
                            cursor: 'pointer',
                            padding: '5px 10px',
                            borderRadius: '6px',
                            transition: 'all 0.3s'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#f0f0f0';
                            e.currentTarget.style.color = '#333';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'none';
                            e.currentTarget.style.color = '#999';
                        }}
                    >
                        ×
                    </button>
                </div>
                <div style={{
                    padding: '20px',
                    flex: 1,
                    overflowY: 'auto'
                }}>
                    {children}
                </div>
            </div>
        </div>
    );
});

export default function Registo() {
    const [formData, setFormData] = useState({});
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [openModal, setOpenModal] = useState(null); // 'estudiante', 'profesor', 'representante', 'administrador', null
    const [gradosSecciones, setGradosSecciones] = useState([]);
    const [materias, setMaterias] = useState([]);
    const [selectedGradosSecciones, setSelectedGradosSecciones] = useState([]);
    const [selectedMaterias, setSelectedMaterias] = useState([]);
    const [loadingGrados, setLoadingGrados] = useState(false);
    const [loadingMaterias, setLoadingMaterias] = useState(false);

    useEffect(() => {
        if (openModal === 'profesor') {
            cargarGradosSecciones();
            // cargarMaterias(); // Ocultado: las materias se asignan desde la lista de profesores
        } else {
            // Limpiar cuando se cierra el modal o cambia de tipo
            setGradosSecciones([]);
            setMaterias([]);
            setSelectedGradosSecciones([]);
            setSelectedMaterias([]);
        }
    }, [openModal]);

    const cargarGradosSecciones = async () => {
        setLoadingGrados(true);
        try {
            const token = localStorage.getItem('accessToken');
            const response = await axios.get(`${API_URL_BASE}/grado-seccion/`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            });
            setGradosSecciones(response.data || []);
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
            const response = await axios.get(`${API_URL_BASE}/horarios/materias/`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            });
            setMaterias(response.data || []);
        } catch (error) {
            console.error('Error al cargar materias:', error);
            setMaterias([]);
        } finally {
            setLoadingMaterias(false);
        }
    };

    // Función para calcular la edad basada en la fecha de nacimiento
    const calcularEdad = (fechaNacimiento) => {
        if (!fechaNacimiento) return null;
        const hoy = new Date();
        const nacimiento = new Date(fechaNacimiento);
        let edad = hoy.getFullYear() - nacimiento.getFullYear();
        const mes = hoy.getMonth() - nacimiento.getMonth();
        if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
            edad--;
        }
        return edad;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => {
            const newData = {
            ...prev,
            [name]: name === 'grado' ? value.toString() : value,
            };
            // Si cambia el nivel, limpiar el grado seleccionado
            if (name === 'nivel') {
                newData.grado = '';
                newData.seccion = '';
            }
            // Si cambia la fecha de nacimiento y es estudiante, calcular edad
            if (name === 'fecha_nacimiento' && openModal === 'estudiante') {
                const edad = calcularEdad(value);
                if (edad !== null && edad < 12) {
                    // Si es menor de 12, limpiar la cédula
                    newData.cedula = '';
                }
            }
            return newData;
        });

        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: '',
            }));
        }
    };

    const handleGradoSeccionToggle = (gradoSeccion) => {
        setSelectedGradosSecciones(prev => {
            const exists = prev.find(gs => gs.id === gradoSeccion.id);
            if (exists) {
                return prev.filter(gs => gs.id !== gradoSeccion.id);
            } else {
                return [...prev, gradoSeccion];
            }
        });
    };

    const handleMateriaToggle = (materia) => {
        setSelectedMaterias(prev => {
            const exists = prev.find(m => m.id === materia.id);
            if (exists) {
                return prev.filter(m => m.id !== materia.id);
        } else {
                return [...prev, materia];
            }
        });
    };

    const openModalHandler = useCallback((tipo) => {
        setOpenModal(tipo);
        setFormData({ typeU: tipo });
        setErrors({});
        setSelectedGradosSecciones([]);
        setSelectedMaterias([]);
    }, []);

    const closeModal = useCallback(() => {
        setOpenModal(null);
        setFormData({});
        setErrors({});
        setSelectedGradosSecciones([]);
        setSelectedMaterias([]);
    }, []);

    const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/usuarios`;

    const handleSubmit = async (e) => {
        e.preventDefault();
        const typeU = formData.typeU;
        setIsLoading(true);

        try {
            let dataToSend;
            const token = localStorage.getItem('accessToken');
            let headers = {};
            
            // Agregar token de autenticación a los headers
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            if (typeU === 'profesor' && (formData.foto || selectedGradosSecciones.length > 0)) {
        const formDataObj = new FormData();
                
                for (const key in formData) {
                    if (key !== 'typeU' && key !== 'foto') {
                        formDataObj.append(key, formData[key]);
                    }
                }
                
                if (formData.foto) {
                    formDataObj.append('foto', formData.foto);
                }

                if (selectedGradosSecciones.length > 0) {
                    const gradoSeccionesData = selectedGradosSecciones.map(gs => ({
                        nivel: gs.nivel,
                        grado: gs.grado,
                        seccion: gs.seccion
                    }));
                    formDataObj.append('grado_secciones', JSON.stringify(gradoSeccionesData));
                }
                
                // Materias se asignan desde la lista de profesores, no desde el registro

                dataToSend = formDataObj;
            } else if (typeU === 'profesor') {
                dataToSend = { ...formData };
                delete dataToSend.typeU;
                delete dataToSend.foto;
                
                if (selectedGradosSecciones.length > 0) {
                    dataToSend.grado_secciones = selectedGradosSecciones.map(gs => ({
                        nivel: gs.nivel,
                        grado: gs.grado,
                        seccion: gs.seccion
                    }));
                }
                
                // Materias se asignan desde la lista de profesores, no desde el registro
                
                headers['Content-Type'] = 'application/json';
            } else {
                const formDataObj = new FormData();
                for (const key in formData) {
                    if (key !== 'typeU') {
                        // Para estudiantes menores de 12 años, no enviar cédula
                        if (typeU === 'estudiante' && key === 'cedula') {
                            const edad = formData.fecha_nacimiento ? calcularEdad(formData.fecha_nacimiento) : null;
                            if (edad !== null && edad < 12) {
                                // No agregar cédula si es menor de 12 años
                                continue;
                            }
                        }
                        formDataObj.append(key, formData[key]);
                    }
                }
                dataToSend = formDataObj;
        }

            const response = await axios.post(`${API_URL}/${typeU}/registro/`, dataToSend, { headers });
                    console.log('Usuario registrado con éxito:', response.data);
                    alert('Usuario registrado con éxito');
            
            closeModal();
        } catch (error) {
            console.error('Error al registrar el usuario:', error);
            console.error('Error completo:', error.response?.data);
            
            // Mostrar mensaje de error más detallado
            let errorMessage = 'Error en datos ingresados o error de conexión.';
            
            if (error.response?.data) {
                // Si hay errores de validación del backend
                if (error.response.data.error) {
                    errorMessage = error.response.data.error;
                } else if (error.response.data.detail) {
                    errorMessage = error.response.data.detail;
                } else if (typeof error.response.data === 'object') {
                    // Si hay múltiples errores de validación
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
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            setErrors({
                submit: errorMessage,
            });
        } finally {
            setIsLoading(false);
        }
    };

    const getRoleIcon = (role) => {
        switch(role) {
            case 'estudiante': return 'fa-user-graduate';
            case 'profesor': return 'fa-chalkboard-teacher';
            case 'representante': return 'fa-user-friends';
            case 'administrador': return 'fa-user-cog';
            default: return 'fa-user';
        }
    };

    const getRoleName = (role) => {
        switch(role) {
            case 'estudiante': return 'Estudiante';
            case 'profesor': return 'Profesor';
            case 'representante': return 'Representante';
            case 'administrador': return 'Administrador';
            default: return 'Usuario';
        }
    };


    // Renderizar el formulario según el tipo de usuario
    const renderForm = () => {
        if (!openModal) return null;

    return (
            <form onSubmit={handleSubmit} encType="multipart/form-data" style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
                {/* Primera fila: Nivel (solo estudiante) y Nombres/Apellidos */}
                <div style={{display: 'grid', gridTemplateColumns: openModal === 'estudiante' ? '1fr 1fr 1fr' : '1fr 1fr', gap: '12px'}}>
                    {openModal === 'estudiante' && (
                        <div className="form-group" style={{margin: 0}}>
                            <label htmlFor="nivel" style={{display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px', fontWeight: '600', color: 'var(--dark)', fontSize: '0.85rem'}}>
                                <i className="fas fa-layer-group" style={{fontSize: '0.7rem', color: 'var(--primary)'}}></i>
                                Nivel *
                            </label>
                            <select
                                id="nivel"
                                name="nivel"
                                value={formData.nivel || ''}
                                onChange={(e) => handleInputChange(e)}
                                required
                                style={{
                                    width: '100%',
                                    padding: '8px 10px',
                                    border: '2px solid var(--light-gray)',
                                    borderRadius: 'var(--border-radius)',
                                    fontSize: '0.9rem',
                                    background: 'white',
                                    color: 'var(--dark)'
                                }}
                            >
                                <option value="">Seleccione</option>
                                <option value="primaria">Primaria</option>
                                <option value="secundaria">Secundaria</option>
                            </select>
                    </div>
                )}
                    <div className="form-group" style={{margin: 0}}>
                        <label htmlFor="nombre" style={{display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px', fontWeight: '600', color: 'var(--dark)', fontSize: '0.85rem'}}>
                            <i className="fas fa-user" style={{fontSize: '0.7rem', color: 'var(--primary)'}}></i>
                            Nombres *
                        </label>
                            <input
                                type="text"
                                id="nombre"
                                name="nombre"
                            value={formData.nombre || ''}
                                onChange={(e) => handleInputChange(e)}
                            placeholder="Nombres"
                                required
                            style={{
                                width: '100%',
                                padding: '8px 10px',
                                border: '2px solid var(--light-gray)',
                                borderRadius: 'var(--border-radius)',
                                fontSize: '0.9rem',
                                background: 'white',
                                color: 'var(--dark)'
                            }}
                        />
                    </div>
                    <div className="form-group" style={{margin: 0}}>
                        <label htmlFor="apellido" style={{display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px', fontWeight: '600', color: 'var(--dark)', fontSize: '0.85rem'}}>
                            <i className="fas fa-user" style={{fontSize: '0.7rem', color: 'var(--primary)'}}></i>
                            Apellidos *
                        </label>
                            <input
                                type="text"
                                id="apellido"
                                name="apellido"
                            value={formData.apellido || ''}
                                onChange={(e) => handleInputChange(e)}
                            placeholder="Apellidos"
                                required
                            style={{
                                width: '100%',
                                padding: '8px 10px',
                                border: '2px solid var(--light-gray)',
                                borderRadius: 'var(--border-radius)',
                                fontSize: '0.9rem',
                                background: 'white',
                                color: 'var(--dark)'
                            }}
                        />
                    </div>
                    </div>

                {/* Segunda fila: Email, Password, Cédula */}
                <div style={{display: 'grid', gridTemplateColumns: formData.nivel !== 'primaria' && openModal !== '' ? '1fr 1fr 1fr' : '1fr', gap: '12px'}}>
                    {formData.nivel !== 'primaria' && openModal !== '' && (
                        <>
                            <div className="form-group" style={{margin: 0}}>
                                <label htmlFor="email" style={{display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px', fontWeight: '600', color: 'var(--dark)', fontSize: '0.85rem'}}>
                                    <i className="fas fa-envelope" style={{fontSize: '0.7rem', color: 'var(--primary)'}}></i>
                                    Email *
                                </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                    value={formData.email || ''}
                                    onChange={(e) => handleInputChange(e)}
                                    placeholder="ejemplo@correo.com"
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '8px 10px',
                                        border: '2px solid var(--light-gray)',
                                        borderRadius: 'var(--border-radius)',
                                        fontSize: '0.9rem',
                                        background: 'white',
                                        color: 'var(--dark)'
                                    }}
                                />
                            </div>
                            <div className="form-group" style={{margin: 0}}>
                                <label htmlFor="password" style={{display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px', fontWeight: '600', color: 'var(--dark)', fontSize: '0.85rem'}}>
                                    <i className="fas fa-lock" style={{fontSize: '0.7rem', color: 'var(--primary)'}}></i>
                                    Contraseña *
                                </label>
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    value={formData.password || ''}
                                onChange={(e) => handleInputChange(e)}
                                    placeholder="Mín. 8 caracteres"
                                required
                                    style={{
                                        width: '100%',
                                        padding: '8px 10px',
                                        border: '2px solid var(--light-gray)',
                                        borderRadius: 'var(--border-radius)',
                                        fontSize: '0.9rem',
                                        background: 'white',
                                        color: 'var(--dark)'
                                    }}
                                />
                    </div>
                        </>
                    )}
                    {(openModal === 'profesor' || openModal === 'representante' || openModal === 'estudiante') && (
                        <div className="form-group" style={{margin: 0}}>
                            {/* Para estudiantes, solo mostrar cédula si tiene 12 años o más */}
                            {!(openModal === 'estudiante' && formData.fecha_nacimiento && calcularEdad(formData.fecha_nacimiento) < 12) && (
                                <>
                                    <label htmlFor="cedula" style={{display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px', fontWeight: '600', color: 'var(--dark)', fontSize: '0.85rem'}}>
                                        <i className="fas fa-id-card" style={{fontSize: '0.7rem', color: 'var(--primary)'}}></i>
                                        Cédula {openModal === 'estudiante' && formData.nivel === 'primaria' ? '(si tiene 12 años o más)' : ''} *
                                    </label>
                                    <input
                                        type="text"
                                        id="cedula"
                                        name="cedula"
                                        value={formData.cedula || ''}
                                        onChange={(e) => handleInputChange(e)}
                                        placeholder="V-12345678"
                                        required={openModal !== 'estudiante' || !formData.fecha_nacimiento || calcularEdad(formData.fecha_nacimiento) >= 12}
                                        style={{
                                            width: '100%',
                                            padding: '8px 10px',
                                            border: '2px solid var(--light-gray)',
                                            borderRadius: 'var(--border-radius)',
                                            fontSize: '0.9rem',
                                            background: 'white',
                                            color: 'var(--dark)'
                                        }}
                                    />
                                </>
                            )}
                    </div>
                )}
                </div>

                {/* Tercera fila: Fecha de Nacimiento (Representante, Profesor y Estudiante) */}
                {(openModal === 'representante' || openModal === 'profesor' || openModal === 'estudiante') && (
                    <div className="form-group" style={{margin: 0}}>
                        <label htmlFor="fecha_nacimiento" style={{display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px', fontWeight: '600', color: 'var(--dark)', fontSize: '0.85rem'}}>
                            <i className="fas fa-calendar-alt" style={{fontSize: '0.7rem', color: 'var(--primary)'}}></i>
                            Fecha de Nacimiento *
                        </label>
                        <input
                            type="date"
                            id="fecha_nacimiento"
                            name="fecha_nacimiento"
                            value={formData.fecha_nacimiento || ''}
                            onChange={(e) => handleInputChange(e)}
                            required
                            max={new Date().toISOString().split('T')[0]} // No permitir fechas futuras
                            style={{
                                width: '100%',
                                padding: '8px 10px',
                                border: '2px solid var(--light-gray)',
                                borderRadius: 'var(--border-radius)',
                                fontSize: '0.9rem',
                                background: 'white',
                                color: 'var(--dark)'
                            }}
                        />
                        {openModal === 'estudiante' && formData.fecha_nacimiento && (
                            <small style={{display: 'block', marginTop: '4px', color: 'var(--gray)', fontSize: '0.75rem'}}>
                                Edad: {calcularEdad(formData.fecha_nacimiento)} años
                                {calcularEdad(formData.fecha_nacimiento) < 12 && ' (No requiere cédula)'}
                            </small>
                        )}
                    </div>
                )}

                {/* Cuarta fila: Teléfono y Dirección */}
                {(openModal === 'representante' || openModal === 'profesor' || (openModal !== '' && openModal !== 'administrador')) && (
                    <div style={{display: 'grid', gridTemplateColumns: (openModal === 'representante' || openModal === 'profesor') && openModal !== 'administrador' ? '1fr 1fr' : '1fr', gap: '12px'}}>
                        {(openModal === 'representante' || openModal === 'profesor') && (
                            <div className="form-group" style={{margin: 0}}>
                                <label htmlFor="telefono" style={{display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px', fontWeight: '600', color: 'var(--dark)', fontSize: '0.85rem'}}>
                                    <i className="fas fa-phone" style={{fontSize: '0.7rem', color: 'var(--primary)'}}></i>
                                    Teléfono *
                                </label>
                            <input
                                type="text"
                                id="telefono"
                                name="telefono"
                                    value={formData.telefono || ''}
                                onChange={(e) => handleInputChange(e)}
                                    placeholder="0412-1234567"
                                required
                                    style={{
                                        width: '100%',
                                        padding: '8px 10px',
                                        border: '2px solid var(--light-gray)',
                                        borderRadius: 'var(--border-radius)',
                                        fontSize: '0.9rem',
                                        background: 'white',
                                        color: 'var(--dark)'
                                    }}
                                />
                    </div>
                        )}
                        {openModal !== '' && openModal !== 'administrador' && (
                            <div className="form-group" style={{margin: 0}}>
                                <label htmlFor="direccion" style={{display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px', fontWeight: '600', color: 'var(--dark)', fontSize: '0.85rem'}}>
                                    <i className="fas fa-map-marker-alt" style={{fontSize: '0.7rem', color: 'var(--primary)'}}></i>
                                    Dirección *
                                </label>
                            <input
                                type="text"
                                id="direccion"
                                name="direccion"
                                    value={formData.direccion || ''}
                                onChange={(e) => handleInputChange(e)}
                                    placeholder="Dirección completa"
                                required
                                    style={{
                                        width: '100%',
                                        padding: '8px 10px',
                                        border: '2px solid var(--light-gray)',
                                        borderRadius: 'var(--border-radius)',
                                        fontSize: '0.9rem',
                                        background: 'white',
                                        color: 'var(--dark)'
                                    }}
                                />
                            </div>
                        )}
                    </div>
                )}

                {/* Información Académica (Estudiante) */}
                {openModal === 'estudiante' && (
                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px'}}>
                        <div className="form-group" style={{margin: 0}}>
                            <label htmlFor="grado" style={{display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px', fontWeight: '600', color: 'var(--dark)', fontSize: '0.85rem'}}>
                                <i className="fas fa-book" style={{fontSize: '0.7rem', color: 'var(--primary)'}}></i>
                                {formData.nivel === 'primaria' ? 'Grado *' : formData.nivel === 'secundaria' ? 'Año *' : 'Grado/Año *'}
                            </label>
                            <select
                                id="grado"
                                name="grado"
                                value={formData.grado || ''}
                                onChange={(e) => handleInputChange(e)}
                                required
                                disabled={!formData.nivel}
                                style={{
                                    width: '100%',
                                    padding: '8px 10px',
                                    border: '2px solid var(--light-gray)',
                                    borderRadius: 'var(--border-radius)',
                                    fontSize: '0.9rem',
                                    background: formData.nivel ? 'white' : '#f5f5f5',
                                    color: 'var(--dark)',
                                    cursor: formData.nivel ? 'pointer' : 'not-allowed'
                                }}
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
                    </div>
                        <div className="form-group" style={{margin: 0}}>
                            <label htmlFor="seccion" style={{display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px', fontWeight: '600', color: 'var(--dark)', fontSize: '0.85rem'}}>
                                <i className="fas fa-users" style={{fontSize: '0.7rem', color: 'var(--primary)'}}></i>
                                Sección *
                            </label>
                            <select
                                id="seccion"
                                name="seccion"
                                value={formData.seccion || ''}
                                onChange={(e) => handleInputChange(e)}
                                required
                                style={{
                                    width: '100%',
                                    padding: '8px 10px',
                                    border: '2px solid var(--light-gray)',
                                    borderRadius: 'var(--border-radius)',
                                    fontSize: '0.9rem',
                                    background: 'white',
                                    color: 'var(--dark)'
                                }}
                            >
                                <option value="">Seleccione</option>
                                <option value="A">Sección A</option>
                                <option value="B">Sección B</option>
                                <option value="C">Sección C</option>
                            </select>
                        </div>
                    </div>
                )}

                {/* Información Profesional (Profesor) */}
                {openModal === 'profesor' && (
                    <>
                        <div className="form-group" style={{margin: 0}}>
                            <label htmlFor="tipo_profesor" style={{display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px', fontWeight: '600', color: 'var(--dark)', fontSize: '0.85rem'}}>
                                <i className="fas fa-user-tie" style={{fontSize: '0.7rem', color: 'var(--primary)'}}></i>
                                Tipo de Profesor *
                            </label>
                            <select
                                id="tipo_profesor"
                                name="tipo_profesor"
                                value={formData.tipo_profesor || ''}
                                onChange={(e) => handleInputChange(e)}
                                required
                                style={{
                                    width: '100%',
                                    padding: '8px 10px',
                                    border: '2px solid var(--light-gray)',
                                    borderRadius: 'var(--border-radius)',
                                    fontSize: '0.9rem',
                                    background: 'white',
                                    color: 'var(--dark)'
                                }}
                            >
                                <option value="">Seleccione</option>
                                <option value="titular">Titular</option>
                                <option value="suplente">Suplente</option>
                                <option value="especialista">Especialista</option>
                            </select>
                        </div>

                        {/* Sección de grados/secciones oculta - se asignan desde la lista de profesores */}
                        {/* 
                        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px'}}>
                            <div className="form-group" style={{margin: 0}}>
                                <label style={{display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px', fontWeight: '600', color: 'var(--dark)', fontSize: '0.85rem'}}>
                                    <i className="fas fa-graduation-cap" style={{fontSize: '0.7rem', color: 'var(--primary)'}}></i>
                                    Grados/Secciones
                                </label>
                                <div style={{
                                    border: '2px solid var(--light-gray)',
                                    borderRadius: 'var(--border-radius)',
                                    padding: '10px',
                                    maxHeight: '120px',
                                    overflowY: 'auto',
                                    background: 'white',
                                    minHeight: '80px'
                                }}>
                                    {loadingGrados ? (
                                        <div style={{display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--gray)', fontSize: '0.8rem'}}>
                                            <i className="fas fa-spinner fa-spin"></i>
                                            <span>Cargando...</span>
                                        </div>
                                    ) : gradosSecciones.length === 0 ? (
                                        <p style={{color: 'var(--gray)', fontSize: '0.8rem', margin: 0, fontStyle: 'italic'}}>
                                            No hay grados disponibles. Puede registrar el profesor sin asignar grados.
                                        </p>
                                    ) : (
                                        <div style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '6px'
                                        }}>
                                            {gradosSecciones.map((gs) => {
                                                const isSelected = selectedGradosSecciones.find(sgs => sgs.id === gs.id);
                                                return (
                                                    <label
                                                        key={gs.id}
                                                        style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '6px',
                                                            padding: '6px 8px',
                                                            border: `1px solid ${isSelected ? 'var(--primary)' : 'var(--light-gray)'}`,
                                                            borderRadius: '6px',
                                                            background: isSelected ? 'rgba(67, 97, 238, 0.1)' : 'white',
                                                            cursor: 'pointer',
                                                            fontSize: '0.8rem'
                                                        }}
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={!!isSelected}
                                                            onChange={() => handleGradoSeccionToggle(gs)}
                                                            style={{
                                                                width: '16px',
                                                                height: '16px',
                                                                cursor: 'pointer',
                                                                accentColor: 'var(--primary)'
                                                            }}
                                                        />
                                                        <span>{gs.grado}° {gs.nivel === 'primaria' ? 'Grado' : 'Año'} {gs.seccion}</span>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                                <small style={{display: 'block', marginTop: '6px', color: 'var(--gray)', fontSize: '0.75rem', fontStyle: 'italic'}}>
                                    Opcional: Seleccione los grados donde el profesor estará asignado
                                </small>
                            </div>
                        </div>
                        */}

                            {/* Sección de materias oculta - las materias se asignan desde la lista de profesores */}
                            {/* 
                            <div className="form-group" style={{margin: 0}}>
                                <label style={{display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px', fontWeight: '600', color: 'var(--dark)', fontSize: '0.85rem'}}>
                                    <i className="fas fa-book" style={{fontSize: '0.7rem', color: 'var(--primary)'}}></i>
                                    Materias
                                </label>
                                <div style={{
                                    border: '2px solid var(--light-gray)',
                                    borderRadius: 'var(--border-radius)',
                                    padding: '10px',
                                    maxHeight: '120px',
                                    overflowY: 'auto',
                                    background: 'white',
                                    minHeight: '80px'
                                }}>
                                    {loadingMaterias ? (
                                        <div style={{display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--gray)', fontSize: '0.8rem'}}>
                                            <i className="fas fa-spinner fa-spin"></i>
                                            <span>Cargando...</span>
                                        </div>
                                    ) : materias.length === 0 ? (
                                        <p style={{color: 'var(--gray)', fontSize: '0.8rem', margin: 0, fontStyle: 'italic'}}>
                                            No hay materias disponibles. Puede registrar el profesor sin asignar materias.
                                        </p>
                                    ) : (
                                        <div style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '6px'
                                        }}>
                                            {materias.map((materia) => {
                                                const isSelected = selectedMaterias.find(sm => sm.id === materia.id);
                                                return (
                                                    <label
                                                        key={materia.id}
                                                        style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '6px',
                                                            padding: '6px 8px',
                                                            border: `1px solid ${isSelected ? 'var(--primary)' : 'var(--light-gray)'}`,
                                                            borderRadius: '6px',
                                                            background: isSelected ? 'rgba(67, 97, 238, 0.1)' : 'white',
                                                            cursor: 'pointer',
                                                            fontSize: '0.8rem'
                                                        }}
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={!!isSelected}
                                                            onChange={() => handleMateriaToggle(materia)}
                                                            style={{
                                                                width: '16px',
                                                                height: '16px',
                                                                cursor: 'pointer',
                                                                accentColor: 'var(--primary)'
                                                            }}
                                                        />
                                                        <span>{materia.nombre}</span>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                                <small style={{display: 'block', marginTop: '6px', color: 'var(--gray)', fontSize: '0.75rem', fontStyle: 'italic'}}>
                                    Opcional: Seleccione las materias que el profesor dictará
                                </small>
                            </div>
                            */}
                    </>
                )}

                {/* Foto de Perfil */}
                {openModal === 'profesor' && (
                    <div className="form-group" style={{margin: 0}}>
                        <label htmlFor="foto" style={{display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px', fontWeight: '600', color: 'var(--dark)', fontSize: '0.85rem'}}>
                            <i className="fas fa-camera" style={{fontSize: '0.7rem', color: 'var(--primary)'}}></i>
                            Foto de Perfil
                        </label>
                            <input
                                type="file"
                                id="foto"
                                name="foto"
                            accept="image/*"
                                onChange={(e) => {
                                setFormData(prev => ({
                                        ...prev,
                                    foto: e.target.files[0]
                                }));
                            }}
                            style={{
                                width: '100%',
                                padding: '8px 10px',
                                border: '2px solid var(--light-gray)',
                                borderRadius: 'var(--border-radius)',
                                fontSize: '0.9rem',
                                background: 'white',
                                color: 'var(--dark)'
                            }}
                        />
                    </div>
                )}

                {errors.submit && (
                    <div style={{
                        padding: '10px',
                        background: '#fee',
                        border: '1px solid #fcc',
                        borderRadius: 'var(--border-radius)',
                        color: '#c33',
                        fontSize: '0.85rem'
                    }}>
                        {errors.submit}
                    </div>
                )}

                <div style={{
                    marginTop: '15px',
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '10px',
                    paddingTop: '15px',
                    borderTop: '1px solid var(--light-gray)'
                }}>
                    <button
                        type="button"
                        onClick={closeModal}
                        style={{
                            padding: '10px 20px',
                            background: '#f0f0f0',
                            color: '#333',
                            border: 'none',
                            borderRadius: 'var(--border-radius)',
                            fontSize: '0.9rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'var(--transition)'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#e0e0e0';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#f0f0f0';
                        }}
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading}
                        style={{
                            padding: '10px 24px',
                            background: 'var(--primary)',
                            color: 'white',
                            border: 'none',
                            borderRadius: 'var(--border-radius)',
                            fontSize: '0.9rem',
                            fontWeight: '600',
                            cursor: isLoading ? 'not-allowed' : 'pointer',
                            transition: 'var(--transition)',
                            opacity: isLoading ? 0.6 : 1
                        }}
                        onMouseEnter={(e) => {
                            if (!isLoading) {
                                e.currentTarget.style.background = 'var(--primary-dark)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!isLoading) {
                                e.currentTarget.style.background = 'var(--primary)';
                            }
                        }}
                    >
                        {isLoading ? 'Registrando...' : `Registrar ${getRoleName(openModal)}`}
                    </button>
                </div>
            </form>
        );
    };

    return (
        <div className="main-content">
            <div className="header">
                <div className="page-title">
                    <h1>Registro de Usuarios</h1>
                    <p>Seleccione el tipo de usuario que desea registrar</p>
                </div>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '20px',
                marginTop: '30px'
            }}>
                {/* Botón Estudiante */}
                <button
                    onClick={() => openModalHandler('estudiante')}
                    style={{
                        padding: '30px',
                        background: 'white',
                        border: '2px solid var(--light-gray)',
                        borderRadius: 'var(--border-radius)',
                        cursor: 'pointer',
                        transition: 'var(--transition)',
                        textAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '15px',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'var(--primary)';
                        e.currentTarget.style.transform = 'translateY(-5px)';
                        e.currentTarget.style.boxShadow = '0 4px 16px rgba(67, 97, 238, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'var(--light-gray)';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
                    }}
                >
                    <div style={{
                        width: '70px',
                        height: '70px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #28a745, #20c997)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        overflow: 'hidden'
                    }}>
                        <i className="fas fa-user-graduate" style={{
                            fontSize: '1.8rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            lineHeight: '1',
                            margin: '0',
                            padding: '0'
                        }}></i>
                    </div>
                    <h3 style={{margin: 0, fontSize: '1.2rem', fontWeight: '600', color: 'var(--dark)'}}>
                        Estudiante
                    </h3>
                    <p style={{margin: 0, color: 'var(--gray)', fontSize: '0.9rem'}}>
                        Registrar nuevo estudiante
                    </p>
                </button>

                {/* Botón Profesor */}
                <button
                    onClick={() => openModalHandler('profesor')}
                    style={{
                        padding: '30px',
                        background: 'white',
                        border: '2px solid var(--light-gray)',
                        borderRadius: 'var(--border-radius)',
                        cursor: 'pointer',
                        transition: 'var(--transition)',
                        textAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '15px',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'var(--primary)';
                        e.currentTarget.style.transform = 'translateY(-5px)';
                        e.currentTarget.style.boxShadow = '0 4px 16px rgba(67, 97, 238, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'var(--light-gray)';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
                    }}
                >
                    <div style={{
                        width: '70px',
                        height: '70px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #007bff, #0056b3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        overflow: 'hidden'
                    }}>
                        <i className="fas fa-chalkboard-teacher" style={{
                            fontSize: '1.8rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            lineHeight: '1',
                            margin: '0',
                            padding: '0'
                        }}></i>
                    </div>
                    <h3 style={{margin: 0, fontSize: '1.2rem', fontWeight: '600', color: 'var(--dark)'}}>
                        Profesor
                    </h3>
                    <p style={{margin: 0, color: 'var(--gray)', fontSize: '0.9rem'}}>
                        Registrar nuevo profesor
                    </p>
                </button>

                {/* Botón Representante */}
                <button
                    onClick={() => openModalHandler('representante')}
                    style={{
                        padding: '30px',
                        background: 'white',
                        border: '2px solid var(--light-gray)',
                        borderRadius: 'var(--border-radius)',
                        cursor: 'pointer',
                        transition: 'var(--transition)',
                        textAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '15px',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'var(--primary)';
                        e.currentTarget.style.transform = 'translateY(-5px)';
                        e.currentTarget.style.boxShadow = '0 4px 16px rgba(67, 97, 238, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'var(--light-gray)';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
                    }}
                >
                    <div style={{
                        width: '70px',
                        height: '70px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #17a2b8, #138496)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        overflow: 'hidden'
                    }}>
                        <i className="fas fa-user-friends" style={{
                            fontSize: '1.8rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            lineHeight: '1',
                            margin: '0',
                            padding: '0'
                        }}></i>
                    </div>
                    <h3 style={{margin: 0, fontSize: '1.2rem', fontWeight: '600', color: 'var(--dark)'}}>
                        Representante
                    </h3>
                    <p style={{margin: 0, color: 'var(--gray)', fontSize: '0.9rem'}}>
                        Registrar nuevo representante
                    </p>
                </button>

                {/* Botón Administrador */}
                <button
                    onClick={() => openModalHandler('administrador')}
                    style={{
                        padding: '30px',
                        background: 'white',
                        border: '2px solid var(--light-gray)',
                        borderRadius: 'var(--border-radius)',
                        cursor: 'pointer',
                        transition: 'var(--transition)',
                        textAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '15px',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'var(--primary)';
                        e.currentTarget.style.transform = 'translateY(-5px)';
                        e.currentTarget.style.boxShadow = '0 4px 16px rgba(67, 97, 238, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'var(--light-gray)';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
                    }}
                >
                    <div style={{
                        width: '70px',
                        height: '70px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #6f42c1, #5a32a3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        overflow: 'hidden'
                    }}>
                        <i className="fas fa-user-cog" style={{
                            fontSize: '1.8rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            lineHeight: '1',
                            margin: '0',
                            padding: '0'
                        }}></i>
                    </div>
                    <h3 style={{margin: 0, fontSize: '1.2rem', fontWeight: '600', color: 'var(--dark)'}}>
                        Administrador
                    </h3>
                    <p style={{margin: 0, color: 'var(--gray)', fontSize: '0.9rem'}}>
                        Registrar nuevo administrador
                    </p>
                </button>
            </div>

            {/* Modal */}
            {openModal && (
                <Modal 
                    isOpen={openModal !== null} 
                    onClose={closeModal}
                    title={`Nuevo ${getRoleName(openModal)}`}
                    roleIcon={getRoleIcon(openModal)}
                >
                    {renderForm()}
                </Modal>
            )}
        </div>
    );
}
