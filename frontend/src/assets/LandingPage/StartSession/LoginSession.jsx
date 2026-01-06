import { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const LoginSession = ({ setShowLogin }) => {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        typeU: '',
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [selectedRole, setSelectedRole] = useState('');
    const modalRef = useRef(null);

    // Cerrar modal al hacer click fuera
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                setShowLogin(false);
            }
        };

        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                setShowLogin(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);

        // Prevenir scroll del body cuando el modal está abierto
        // document.body.style.overflow = 'hidden';

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
            // document.body.style.overflow = 'unset';
        };
    }, [setShowLogin]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        // Limpiar error del campo cuando el usuario empiece a escribir
        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: '',
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.username.trim()) {
            newErrors.username = 'El usuario es requerido';
        }

        if (!formData.password) {
            newErrors.password = 'La contraseña es requerida';
        } else if (formData.password.length < 6) {
            newErrors.password =
                'La contraseña debe tener al menos 6 caracteres';
        }

        if (!formData.typeU) {
            newErrors.typeU = 'Seleccione un tipo de usuario';
        }

        return newErrors;
    };
    const mapRol = (rolFrontend) => {
        const roles = {
            administrador: 'admin',
            representante: 'representante',
            estudiante: 'estudiante',
            profesor: 'profesor',
        };
        return roles[rolFrontend.toLowerCase()] || rolFrontend.toLowerCase();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formErrors = validateForm();
        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
            return;
        }

        setIsLoading(true);

        try {
            const API_URL =
                import.meta.env.VITE_API_URL || 'http://localhost:8000';
            const response = await axios.post(`${API_URL}/login/`, {
                email: formData.username,
                password: formData.password,
                rol: mapRol(formData.typeU), // ← aquí aplicamos la traducción
            });

            const { access, refresh, usuario } = response.data;

            // Guardar tokens si los necesitas
            localStorage.setItem('accessToken', access);
            localStorage.setItem('refreshToken', refresh);
            localStorage.setItem('user', JSON.stringify(usuario));
            localStorage.setItem('rol', mapRol(formData.typeU));

            // Redirigir según el rol
            const rol = mapRol(formData.typeU);
            if (rol === 'admin') {
                window.location.href = '/admin';
            } else if (rol === 'representante') {
                window.location.href = '/representante';
            } else if (rol === 'estudiante') {
                window.location.href = '/estudiante';
            } else if (rol === 'profesor') {
                window.location.href = '/profesor';
            } else {
                alert('Rol no reconocido');
            }
            setShowLogin(false);
        } catch (error) {
            console.error('Error al iniciar sesión:', error);
            setErrors({
                submit: 'Credenciales inválidas o error de conexión.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const selectRole = (role) => {
        setSelectedRole(role);
        setFormData((prev) => ({
            ...prev,
            typeU:
                role === 'estudiante'
                    ? 'Estudiante'
                    : role === 'profesor'
                    ? 'Profesor'
                    : role === 'representante'
                    ? 'Representante'
                    : '',
        }));
    };

    return (
        <div className="login-screen" onClick={() => setShowLogin(false)}>
            {/* Figuras decorativas de fondo */}
            <div className="login-bg-shapes">
                <div className="shape shape-1"></div>
                <div className="shape shape-2"></div>
                <div className="shape shape-3"></div>
                <div className="shape shape-4"></div>
                <div className="shape shape-5"></div>
            </div>
            <div
                className="login-card"
                onClick={(e) => e.stopPropagation()}
                ref={modalRef}
            >
                {/* Botón de volver/refrescar */}
                <button
                    onClick={() => window.location.reload()}
                    title="Volver a la página principal"
                    style={{
                        position: 'absolute',
                        top: '20px',
                        right: '20px',
                        width: '36px',
                        height: '36px',
                        padding: '0',
                        background: 'transparent',
                        color: 'var(--gray)',
                        border: 'none',
                        borderRadius: '50%',
                        fontSize: '1.1rem',
                        cursor: 'pointer',
                        transition: 'var(--transition)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 10,
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.color = 'var(--primary)';
                        e.currentTarget.style.background =
                            'rgba(67, 97, 238, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.color = 'var(--gray)';
                        e.currentTarget.style.background = 'transparent';
                    }}
                >
                    <i className="fas fa-arrow-left"></i>
                </button>

                {/* Panel Izquierdo */}
                <div className="login-left">
                    <div className="logo-container">
                        <div className="logo-icon">
                            <i className="fas fa-graduation-cap"></i>
                        </div>
                        <div className="logo-text">
                            <h1>
                                <i
                                    className="fas fa-star"
                                    style={{
                                        marginRight: '10px',
                                        fontSize: '1.8rem',
                                        verticalAlign: 'middle',
                                    }}
                                ></i>
                                CENIT
                            </h1>
                            <p>
                                "Con Excelencia Navegaras Iluminando Tu Futuro"
                            </p>
                        </div>
                    </div>

                    <div className="features-list">
                        <div className="feature-item">
                            <div className="feature-icon">
                                <i className="fas fa-users"></i>
                            </div>
                            <div className="feature-text">
                                <h4>Gestión Completa</h4>
                                <p>
                                    Administra estudiantes, profesores y
                                    materias
                                </p>
                            </div>
                        </div>

                        <div className="feature-item">
                            <div className="feature-icon">
                                <i className="fas fa-file-alt"></i>
                            </div>
                            <div className="feature-text">
                                <h4>Boletines Digitales</h4>
                                <p>
                                    Genera y descarga boletines en formato PDF
                                </p>
                            </div>
                        </div>

                        <div className="feature-item">
                            <div className="feature-icon">
                                <i className="fas fa-chart-line"></i>
                            </div>
                            <div className="feature-text">
                                <h4>Reportes y Estadísticas</h4>
                                <p>Visualiza el rendimiento académico</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Panel Derecho - Formulario */}
                <div className="login-right">
                    <form className="login-form" onSubmit={handleSubmit}>
                        <h2>Iniciar Sesión</h2>
                        <p>Ingrese sus credenciales para acceder al sistema</p>

                        <div className="form-group">
                            <label htmlFor="username">Usuario</label>
                            <div className="input-with-icon">
                                <input
                                    type="text"
                                    id="username"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleInputChange}
                                    placeholder="Ingrese su usuario"
                                    required
                                    style={{ paddingLeft: '15px' }}
                                />
                            </div>
                            {errors.username && (
                                <span
                                    style={{
                                        color: 'var(--danger)',
                                        fontSize: '0.85rem',
                                        marginTop: '5px',
                                        display: 'block',
                                    }}
                                >
                                    {errors.username}
                                </span>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Contraseña</label>
                            <div className="input-with-icon">
                                <i className="fas fa-lock"></i>
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    placeholder="Ingrese su contraseña"
                                    required
                                />
                            </div>
                            {errors.password && (
                                <span
                                    style={{
                                        color: 'var(--danger)',
                                        fontSize: '0.85rem',
                                        marginTop: '5px',
                                        display: 'block',
                                    }}
                                >
                                    {errors.password}
                                </span>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="typeU">Tipo de Usuario</label>
                            <div className="input-with-icon">
                                <i className="fas fa-user-tag"></i>
                                <select
                                    id="typeU"
                                    name="typeU"
                                    value={formData.typeU}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">Seleccione un rol</option>
                                    <option value="Administrador">
                                        Administrador
                                    </option>
                                    <option value="Profesor">Profesor</option>
                                    <option value="Estudiante">
                                        Estudiante
                                    </option>
                                    <option value="Representante">
                                        Representante
                                    </option>
                                </select>
                            </div>
                            {errors.typeU && (
                                <span
                                    style={{
                                        color: 'var(--danger)',
                                        fontSize: '0.85rem',
                                        marginTop: '5px',
                                        display: 'block',
                                    }}
                                >
                                    {errors.typeU}
                                </span>
                            )}
                        </div>

                        {errors.submit && (
                            <div
                                style={{
                                    background: 'rgba(247, 37, 133, 0.1)',
                                    color: 'var(--danger)',
                                    padding: '12px',
                                    borderRadius: 'var(--border-radius)',
                                    marginBottom: '20px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                }}
                            >
                                <i className="fas fa-exclamation-circle"></i>
                                {errors.submit}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <i className="fas fa-spinner fa-spin"></i>
                                    Accediendo...
                                </>
                            ) : (
                                <>
                                    <i className="fas fa-sign-in-alt"></i>
                                    Acceder al Sistema
                                </>
                            )}
                        </button>

                        <div className="role-selector">
                            <div
                                className={`role-card ${
                                    selectedRole === 'estudiante'
                                        ? 'active'
                                        : ''
                                }`}
                                onClick={() => selectRole('estudiante')}
                            >
                                <div className="role-icon">
                                    <i className="fas fa-user-graduate"></i>
                                </div>
                                <h4>Estudiante</h4>
                                <p>Consulta de notas</p>
                            </div>

                            <div
                                className={`role-card ${
                                    selectedRole === 'profesor' ? 'active' : ''
                                }`}
                                onClick={() => selectRole('profesor')}
                            >
                                <div className="role-icon">
                                    <i className="fas fa-chalkboard-teacher"></i>
                                </div>
                                <h4>Profesor</h4>
                                <p>Control académico</p>
                            </div>

                            <div
                                className={`role-card ${
                                    selectedRole === 'representante'
                                        ? 'active'
                                        : ''
                                }`}
                                onClick={() => selectRole('representante')}
                            >
                                <div className="role-icon">
                                    <i className="fas fa-user-friends"></i>
                                </div>
                                <h4>Representante</h4>
                                <p>Gestión de estudiantes</p>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LoginSession;
