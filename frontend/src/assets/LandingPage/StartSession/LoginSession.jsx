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
    const [showPassword, setShowPassword] = useState(false);
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
                            : role === 'admin'
                                ? 'Administrador'
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
                        fontSize: '1.2rem',
                        cursor: 'pointer',
                        transition: 'var(--transition)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 10,
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.color = 'var(--primary)';
                        e.currentTarget.style.background = 'rgba(67, 97, 238, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.color = 'var(--gray)';
                        e.currentTarget.style.background = 'transparent';
                    }}
                >
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>

                {/* Panel Izquierdo */}
                <div className="login-left">
                    <div className="logo-container">
                        <div className="logo-icon">
                            <img src="logo.svg" alt="CENIT Logo" style={{ width: '50px', height: '50px' }} />
                        </div>
                        <div className="logo-text">
                            <h1>
                                CENIT
                            </h1>
                            <p>"Con Excelencia Navegaras Iluminando Tu Futuro"</p>
                        </div>
                    </div>

                    <div className="features-list">
                        <div className="feature-item">
                            <div className="feature-icon">
                                <span className="material-symbols-outlined">groups</span>
                            </div>
                            <div className="feature-text">
                                <h4>Gestión Completa</h4>
                                <p>Administra estudiantes, profesores y materias</p>
                            </div>
                        </div>

                        <div className="feature-item">
                            <div className="feature-icon">
                                <span className="material-symbols-outlined">description</span>
                            </div>
                            <div className="feature-text">
                                <h4>Boletines Digitales</h4>
                                <p>Genera y descarga boletines en formato PDF</p>
                            </div>
                        </div>

                        <div className="feature-item">
                            <div className="feature-icon">
                                <span className="material-symbols-outlined">analytics</span>
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
                                <span className="material-symbols-outlined" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray)', fontSize: '1.2rem', zIndex: 1 }}>person</span>
                                <input
                                    type="text"
                                    id="username"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleInputChange}
                                    placeholder="Ingrese su usuario"
                                    required
                                />
                            </div>
                            {errors.username && <span className="error-text">{errors.username}</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Contraseña</label>
                            <div className="input-with-icon">
                                <span className="material-symbols-outlined" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray)', fontSize: '1.2rem', zIndex: 1 }}>lock</span>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    placeholder="Ingrese su contraseña"
                                    required
                                    style={{ paddingRight: '45px' }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: 'absolute',
                                        right: '8px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'transparent',
                                        border: 'none',
                                        cursor: 'pointer',
                                        padding: '4px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'var(--gray)',
                                        zIndex: 2,
                                        borderRadius: '4px',
                                        transition: 'color 0.2s ease'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary)'}
                                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--gray)'}
                                    title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                                >
                                    <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>
                                        {showPassword ? "visibility_off" : "visibility"}
                                    </span>
                                </button>
                            </div>
                            {errors.password && <span className="error-text">{errors.password}</span>}
                        </div>

                        <div className="form-group" id="typeUSelectLogin">
                            <label htmlFor="typeU">Tipo de Usuario</label>
                            <div className="input-with-icon">
                                <span className="material-symbols-outlined" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray)', fontSize: '1.2rem', zIndex: 1 }}>assignment_ind</span>
                                <select
                                    id="typeU"
                                    name="typeU"
                                    value={formData.typeU}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">Seleccione un rol</option>
                                    <option value="Administrador">Administrador</option>
                                    <option value="Profesor">Profesor</option>
                                    <option value="Estudiante">Estudiante</option>
                                    <option value="Representante">Representante</option>
                                </select>
                            </div>
                            {errors.typeU && <span className="error-text">{errors.typeU}</span>}
                        </div>

                        {errors.submit && (
                            <div className="submit-error">
                                <span className="material-symbols-outlined">error</span>
                                {errors.submit}
                            </div>
                        )}

                        <button type="submit" className="btn btn-primary" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <div className="login-spinner"></div>
                                    Accediendo...
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined">login</span>
                                    Acceder al Sistema
                                </>
                            )}
                        </button>

                        <div className="role-selector">

                            <div className={`role-card ${selectedRole === 'admin' ? 'active' : ''}`} onClick={() => selectRole('admin')}>
                                <div className="role-icon">
                                    <span className="material-symbols-outlined">admin_panel_settings</span>
                                </div>
                                <h4>Administrador</h4>
                                <p>Gestión total</p>
                            </div>

                            <div className={`role-card ${selectedRole === 'estudiante' ? 'active' : ''}`} onClick={() => selectRole('estudiante')}>
                                <div className="role-icon">
                                    <span className="material-symbols-outlined">school</span>
                                </div>
                                <h4>Estudiante</h4>
                                <p>Consulta de notas</p>
                            </div>

                            <div className={`role-card ${selectedRole === 'profesor' ? 'active' : ''}`} onClick={() => selectRole('profesor')}>
                                <div className="role-icon">
                                    <span className="material-symbols-outlined">co_present</span>
                                </div>
                                <h4>Profesor</h4>
                                <p>Control académico</p>
                            </div>

                            <div className={`role-card ${selectedRole === 'representante' ? 'active' : ''}`} onClick={() => selectRole('representante')}>
                                <div className="role-icon">
                                    <span className="material-symbols-outlined">group</span>
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
