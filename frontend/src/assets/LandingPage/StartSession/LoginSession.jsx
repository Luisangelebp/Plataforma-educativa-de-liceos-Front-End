import './css/ModalSession.css';
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
        document.body.style.overflow = 'hidden';

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
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
            const response = await axios.post(
                'http://localhost:8000/login/',
                {
                    email: formData.username,
                    password: formData.password,
                    rol: mapRol(formData.typeU), // ← aquí aplicamos la traducción
                }
            );

            const { access, refresh, usuario } = response.data;

            // Guardar tokens si los necesitas
            localStorage.setItem('accessToken', access);
            localStorage.setItem('refreshToken', refresh);
            localStorage.setItem('user', JSON.stringify(usuario));

            // Redirigir según el rol
            const rol = usuario.rol;
            if (usuario.rol === 'admin') {
                window.location.href = '/admin';
            } else if (usuario.rol === 'representante') {
                window.location.href = '/representante';
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

    const handleForgotPassword = () => {
        // Lógica para recuperar contraseña
        alert('Función de recuperación de contraseña');
    };

    return (
        <div className="modal-overlay">
            <div className="modal-container" ref={modalRef}>
                <div className="modal-header">
                    <h2>Iniciar Sesión</h2>
                    <button
                        className="close-btn"
                        onClick={() => setShowLogin(false)}
                        aria-label="Cerrar modal"
                    >
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                <div className="modal-body">
                    <form onSubmit={handleSubmit} className="login-form">
                        <div
                            className={`input-group ${
                                errors.username ? 'error' : ''
                            }`}
                        >
                            <div className="input-container">
                                <input
                                    type="text"
                                    id="username"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleInputChange}
                                    className={
                                        formData.username ? 'has-value' : ''
                                    }
                                    required
                                />
                                <label htmlFor="username">
                                    Usuario o Email
                                </label>
                                <i className="input-icon fas fa-user"></i>
                            </div>
                            {errors.username && (
                                <span className="error-message">
                                    {errors.username}
                                </span>
                            )}
                        </div>

                        <div
                            className={`input-group ${
                                errors.password ? 'error' : ''
                            }`}
                        >
                            <div className="input-container">
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className={
                                        formData.password ? 'has-value' : ''
                                    }
                                    required
                                />
                                <label htmlFor="password">Contraseña</label>
                                <i className="input-icon fas fa-lock"></i>
                            </div>
                            {errors.password && (
                                <span className="error-message">
                                    {errors.password}
                                </span>
                            )}
                        </div>

                        <div
                            className={`input-group ${
                                errors.typeU ? 'error' : ''
                            }`}
                        >
                            <div className="select-container">
                                <select
                                    id="typeU"
                                    name="typeU"
                                    value={formData.typeU}
                                    onChange={handleInputChange}
                                    className={
                                        formData.typeU ? 'has-value' : ''
                                    }
                                >
                                    <option value="">
                                        -- Seleccione su Tipo de Usuario --
                                    </option>
                                    <option value="Representante">
                                        Representante
                                    </option>
                                    <option value="Estudiante">
                                        Estudiante
                                    </option>
                                    <option value="Profesor">Profesor</option>
                                    <option value="Administrador">
                                        Administrador
                                    </option>
                                </select>
                                <i className="select-icon fas fa-chevron-down"></i>
                            </div>
                            {errors.typeU && (
                                <span className="error-message">
                                    {errors.typeU}
                                </span>
                            )}
                        </div>

                        <div className="form-options">
                            <label className="remember-me">
                                <input type="checkbox" />
                                <span className="checkmark"></span>
                                Recordar sesión
                            </label>
                            <button
                                type="button"
                                className="forgot-password"
                                onClick={handleForgotPassword}
                            >
                                ¿Olvidaste tu contraseña?
                            </button>
                        </div>

                        {errors.submit && (
                            <div className="submit-error">
                                <i className="fas fa-exclamation-circle"></i>
                                {errors.submit}
                            </div>
                        )}

                        <button
                            type="submit"
                            className={`submit-btn ${
                                isLoading ? 'loading' : ''
                            }`}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <i className="fas fa-spinner fa-spin"></i>
                                    Iniciando sesión...
                                </>
                            ) : (
                                <>
                                    <i className="fas fa-sign-in-alt"></i>
                                    Iniciar Sesión
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <div className="modal-footer">
                    <p>Sistema de Gestión Educativa 2025</p>
                </div>
            </div>
        </div>
    );
};

export default LoginSession;
