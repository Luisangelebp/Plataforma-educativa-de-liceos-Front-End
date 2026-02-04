import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useNotification } from '../../../context/NotificationContext';
import '../Admin/css/Listas.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('rol');
    // Marcar que viene de logout para mostrar directamente el login
    sessionStorage.setItem('fromLogout', 'true');
    document.location.href = '/';
};
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

const axiosInstanceFile = axios.create({
    baseURL: API_URL,
});

axiosInstanceFile.interceptors.request.use((config) => {
    const authHeaders = getAuthHeaders();
    if (config.data instanceof FormData) {
        config.headers = {
            ...config.headers,
            ...authHeaders,
        };
    } else {
        config.headers = {
            ...config.headers,
            ...authHeaders,
            'Content-Type': 'application/json',
        };
    }
    return config;
});

export default function Cuenta() {
    const navigate = useNavigate();
    const { addNotification } = useNotification();
    const [user, setUser] = useState(null);
    const [estudiante, setEstudiante] = useState(null);
    const [formData, setFormData] = useState({
        direccion: '',
        foto: null,
    });
    const [fotoPreview, setFotoPreview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});
    const [showConfirm, setShowConfirm] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [pass, setPass] = useState({
        password: '',
    });

    useEffect(() => {
        cargarDatosUsuario();

        // Escuchar cambios en el usuario (ej: cuando admin actualiza la foto)
        const handleUserUpdate = (event) => {
            if (event.detail) {
                const updatedUser = event.detail;
                setUser(updatedUser);
                // Actualizar preview de foto si existe
                if (updatedUser.foto) {
                    const baseUrl =
                        import.meta.env.VITE_API_URL || 'http://localhost:8000';
                    const fotoUrl = updatedUser.foto.startsWith('http')
                        ? updatedUser.foto
                        : `${baseUrl}${updatedUser.foto}`;
                    setFotoPreview(fotoUrl);
                }
            }
        };

        window.addEventListener('userUpdated', handleUserUpdate);

        return () => {
            window.removeEventListener('userUpdated', handleUserUpdate);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const cargarDatosUsuario = async () => {
        try {
            const userStr = localStorage.getItem('user');
            if (!userStr) {
                setErrors({
                    general:
                        'Error: No se encontró información de usuario. Por favor, inicia sesión nuevamente.',
                });
                setLoading(false);
                return;
            }

            const userData = JSON.parse(userStr);
            if (!userData || !userData.id) {
                setErrors({
                    general:
                        'Error: Datos de usuario inválidos. Por favor, inicia sesión nuevamente.',
                });
                setLoading(false);
                return;
            }

            setUser(userData);

            // Obtener el perfil del estudiante
            const response = await axiosInstance.get('usuarios/estudiante/');

            if (!response.data) {
                setErrors({
                    general:
                        'Error: No se recibieron datos del servidor. Por favor, intenta nuevamente.',
                });
                setLoading(false);
                return;
            }

            let estudianteData = null;

            if (Array.isArray(response.data)) {
                // Buscar usando múltiples patrones (igual que Representante)
                estudianteData = response.data.find((e) => {
                    // Buscar por ID del estudiante igual al ID del usuario
                    if (e.id === userData.id) {
                        return true;
                    }
                    // Buscar por campo usuario (puede ser ID o objeto)
                    if (
                        typeof e.usuario === 'number' &&
                        e.usuario === userData.id
                    ) {
                        return true;
                    }
                    if (
                        typeof e.usuario === 'object' &&
                        e.usuario &&
                        e.usuario.id === userData.id
                    ) {
                        return true;
                    }
                    return false;
                });
            } else if (response.data && typeof response.data === 'object') {
                // Si es un solo objeto, verificar que pertenezca al usuario actual
                const e = response.data;
                if (
                    e.id === userData.id ||
                    (typeof e.usuario === 'number' &&
                        e.usuario === userData.id) ||
                    (typeof e.usuario === 'object' &&
                        e.usuario &&
                        e.usuario.id === userData.id)
                ) {
                    estudianteData = response.data;
                }
            }

            if (estudianteData && estudianteData.id) {
                setEstudiante(estudianteData);
                setFormData({
                    direccion: estudianteData.direccion || '',
                    foto: null,
                });

                // Mostrar foto del usuario (de localStorage) si existe, si no mostrar la del estudiante
                if (userData.foto) {
                    const baseUrl =
                        import.meta.env.VITE_API_URL || 'http://localhost:8000';
                    setFotoPreview(
                        userData.foto.startsWith('http')
                            ? userData.foto
                            : `${baseUrl}${userData.foto}`
                    );
                } else if (estudianteData.foto) {
                    const baseUrl =
                        import.meta.env.VITE_API_URL || 'http://localhost:8000';
                    setFotoPreview(
                        estudianteData.foto.startsWith('http')
                            ? estudianteData.foto
                            : `${baseUrl}${estudianteData.foto}`
                    );
                }
            } else {
                console.warn(
                    'No se encontró el perfil del estudiante para el usuario:',
                    userData.id
                );
            }
        } catch (error) {
            console.error('Error al cargar datos del usuario:', error);
            if (error.response) {
                setErrors({
                    general: `Error del servidor: ${error.response.status} - ${error.response.statusText}. Por favor, intenta nuevamente.`,
                });
            } else if (error.request) {
                setErrors({
                    general:
                        'Error: No se pudo conectar con el servidor. Verifica tu conexión a internet.',
                });
            } else {
                setErrors({
                    general:
                        'Error al cargar la información. Por favor, recarga la página.',
                });
            }
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'password') {
            setPass({ password: value });
            return;
        }

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        if (errors[name]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setErrors((prev) => ({
                    ...prev,
                    foto: 'La imagen no debe superar los 5MB',
                }));
                return;
            }
            if (!file.type.startsWith('image/')) {
                setErrors((prev) => ({
                    ...prev,
                    foto: 'El archivo debe ser una imagen',
                }));
                return;
            }
            setFormData((prev) => ({ ...prev, foto: file }));
            const reader = new FileReader();
            reader.onloadend = () => {
                setFotoPreview(reader.result);
            };
            reader.readAsDataURL(file);
            if (errors.foto) {
                setErrors((prev) => {
                    const newErrors = { ...prev };
                    delete newErrors.foto;
                    return newErrors;
                });
            }
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (pass.password.length > 0 && pass.password.length < 7) {
            newErrors.password =
                'La contraseña debe tener al menos 7 caracteres';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setShowConfirm(true);
    };

    const confirmSave = async () => {
        setShowConfirm(false);
        setSaving(true);
        setSuccessMessage('');
        setErrors({});

        try {
            const userStr = localStorage.getItem('user');
            const userData = JSON.parse(userStr);

            let dataToSend;
            let axiosToUse;
            let passSend;
            // Validar que el estudiante esté cargado antes de proceder
            if (!estudiante || !estudiante.id) {
                setErrors({
                    general:
                        'Error: No se pudo cargar la información del estudiante. Por favor, recarga la página.',
                });
                setSaving(false);
                return;
            }

            // Si hay foto nueva, actualizar directamente en el endpoint del estudiante
            // (El estudiante no tiene permisos para actualizar directamente el endpoint de usuario)
            if (formData.foto) {
                // Crear FormData con foto y dirección
                const estudianteData = new FormData();
                estudianteData.append('foto', formData.foto);
                if (formData.direccion !== (estudiante.direccion || '')) {
                    estudianteData.append(
                        'direccion',
                        formData.direccion || ''
                    );
                }
                if (pass.password !== '') {
                    passSend = {
                        password: pass.password,
                    };
                }

                // Actualizar foto en el endpoint del estudiante
                const estudianteResponse = await axiosInstanceFile.patch(
                    `usuarios/estudiante/${estudiante.id}/`,
                    estudianteData
                );
                setEstudiante(estudianteResponse.data);

                if (passSend !== undefined) {
                    const responsePass = await axiosInstanceFile.patch(
                        `usuario/${estudiante.usuario}/`,
                        passSend
                    );
                    console.log(responsePass);
                    if (responsePass.status == 200) {
                        addNotification(
                            `Contraseña actualizada correctamente, la nueva contraseña es: "${pass.password}". Por favor recuérdela, inicie sesión nuevamente.`,
                            'success'
                        );
                        setTimeout(() => handleLogout(), 2000);
                    } else {
                        addNotification('Error al actualizar la contraseña.', 'error');
                    }
                }

                // Actualizar el usuario en localStorage con la foto del estudiante
                // (asumiendo que la foto del estudiante se sincroniza con la del usuario)
                const updatedUser = {
                    ...userData,
                    foto: estudianteResponse.data.foto,
                };
                localStorage.setItem('user', JSON.stringify(updatedUser));
                setUser(updatedUser);

                // Actualizar preview de foto
                if (estudianteResponse.data.foto) {
                    const baseUrl =
                        import.meta.env.VITE_API_URL || 'http://localhost:8000';
                    const fotoUrl = estudianteResponse.data.foto.startsWith(
                        'http'
                    )
                        ? estudianteResponse.data.foto
                        : `${baseUrl}${estudianteResponse.data.foto}`;
                    setFotoPreview(fotoUrl);
                }

                // Disparar evento personalizado para notificar a otros componentes
                window.dispatchEvent(
                    new CustomEvent('userUpdated', { detail: updatedUser })
                );

                setFormData((prev) => ({ ...prev, foto: null }));
                setSuccessMessage('Información actualizada correctamente');
                setTimeout(() => setSuccessMessage(''), 5000);
                setSaving(false);
                return;
            } else {
                // Si no hay foto, solo actualizar datos del estudiante
                if (!estudiante || !estudiante.id) {
                    setErrors({
                        general:
                            'Error: No se pudo cargar la información del estudiante. Por favor, recarga la página.',
                    });
                    setSaving(false);
                    return;
                }
                if (pass.password !== '') {
                    passSend = {
                        password: pass.password,
                    };
                }

                dataToSend = {
                    direccion: formData.direccion || '',
                };
                axiosToUse = axiosInstance;

                const response = await axiosToUse.patch(
                    `usuarios/estudiante/${estudiante.id}/`,
                    dataToSend
                );

                if (passSend !== undefined) {
                    const responsePass = await axiosInstanceFile.patch(
                        `usuario/${estudiante.usuario}/`,
                        passSend
                    );
                    console.log(responsePass);
                    if (responsePass.status == 200) {
                        addNotification(
                            `Contraseña actualizada correctamente, la nueva contraseña es: "${pass.password}". Por favor recuérdela, inicie sesión nuevamente.`,
                            'success'
                        );
                        setTimeout(() => handleLogout(), 2000);
                    } else {
                        addNotification('Error al actualizar la contraseña.', 'error');
                    }
                }

                setEstudiante(response.data);
                setFormData((prev) => ({ ...prev, foto: null }));

                setSuccessMessage('Información actualizada correctamente');
                setTimeout(() => setSuccessMessage(''), 5000);
            }
        } catch (error) {
            console.error('Error al actualizar información:', error);
            if (error.response?.data) {
                const backendErrors = error.response.data;
                const newErrors = {};
                Object.keys(backendErrors).forEach((key) => {
                    if (Array.isArray(backendErrors[key])) {
                        newErrors[key] = backendErrors[key][0];
                    } else {
                        newErrors[key] = backendErrors[key];
                    }
                });
                setErrors(newErrors);
            } else {
                setErrors({
                    general:
                        'Error al actualizar la información. Por favor, intenta nuevamente.',
                });
            }
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="dashboard-content">
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                    <i
                        className="fas fa-spinner fa-spin"
                        style={{ fontSize: '2rem' }}
                    ></i>
                    <p>Cargando información...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-content" style={{ padding: window.innerWidth < 768 ? '1rem' : '2rem' }}>
            <div
                style={{ maxWidth: '800px', margin: '0 auto' }}
            >
                <h1 style={{ marginBottom: '2rem', color: '#2563eb' }}>
                    <i className="fas fa-user-cog"></i> Mi Cuenta
                </h1>

                {successMessage && (
                    <div
                        style={{
                            padding: '1rem',
                            marginBottom: '1rem',
                            backgroundColor: '#d1fae5',
                            color: '#065f46',
                            borderRadius: '8px',
                            border: '1px solid #10b981',
                        }}
                    >
                        <i className="fas fa-check-circle"></i> {successMessage}
                    </div>
                )}

                {errors.general && (
                    <div
                        style={{
                            padding: '1rem',
                            marginBottom: '1rem',
                            backgroundColor: '#fee2e2',
                            color: '#991b1b',
                            borderRadius: '8px',
                            border: '1px solid #ef4444',
                        }}
                    >
                        <i className="fas fa-exclamation-circle"></i>{' '}
                        {errors.general}
                    </div>
                )}

                <form
                    onSubmit={handleSubmit}
                    style={{
                        backgroundColor: '#fff',
                        padding: '2rem',
                        borderRadius: '12px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    }}
                >
                    {/* Campos editables */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <h3 style={{ marginBottom: '1rem', color: '#1f2937' }}>
                            Información Personal
                        </h3>

                        <div style={{ marginBottom: '1rem' }}>
                            <label
                                style={{
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    fontWeight: '600',
                                    color: '#374151',
                                }}
                            >
                                Cambiar contraseña *
                            </label>
                            <input
                                type="password"
                                name="password"
                                value={pass.password}
                                onChange={handleChange}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: `1px solid ${errors.password ? '#ef4444' : '#d1d5db'
                                        }`,
                                    borderRadius: '6px',
                                    fontSize: '1rem',
                                }}
                            />
                            {errors.password && (
                                <span
                                    style={{
                                        color: '#ef4444',
                                        fontSize: '0.875rem',
                                    }}
                                >
                                    {errors.password}
                                </span>
                            )}
                            <label
                                style={{
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    fontWeight: '600',
                                    color: '#374151',
                                }}
                            >
                                Dirección *
                            </label>
                            <textarea
                                name="direccion"
                                value={formData.direccion}
                                onChange={handleChange}
                                rows="3"
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: `1px solid ${errors.direccion ? '#ef4444' : '#d1d5db'
                                        }`,
                                    borderRadius: '6px',
                                    fontSize: '1rem',
                                    resize: 'vertical',
                                }}
                            />
                            {errors.direccion && (
                                <span
                                    style={{
                                        color: '#ef4444',
                                        fontSize: '0.875rem',
                                    }}
                                >
                                    {errors.direccion}
                                </span>
                            )}
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                            <label
                                style={{
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    fontWeight: '600',
                                    color: '#374151',
                                }}
                            >
                                Foto de Perfil
                            </label>
                            <div
                                style={{
                                    display: 'flex',
                                    gap: '1rem',
                                    alignItems: 'center',
                                }}
                            >
                                {fotoPreview && (
                                    <img
                                        src={fotoPreview}
                                        alt="Preview"
                                        style={{
                                            width: '100px',
                                            height: '100px',
                                            borderRadius: '50%',
                                            objectFit: 'cover',
                                            border: '2px solid #d1d5db',
                                        }}
                                    />
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    style={{
                                        padding: '0.5rem',
                                        border: `1px solid ${errors.foto ? '#ef4444' : '#d1d5db'
                                            }`,
                                        borderRadius: '6px',
                                        fontSize: '0.875rem',
                                    }}
                                />
                            </div>
                            {errors.foto && (
                                <span
                                    style={{
                                        color: '#ef4444',
                                        fontSize: '0.875rem',
                                    }}
                                >
                                    {errors.foto}
                                </span>
                            )}
                        </div>
                    </div>

                    <div
                        style={{
                            display: 'flex',
                            gap: '1rem',
                            justifyContent: 'flex-end',
                            flexDirection: window.innerWidth < 640 ? 'column-reverse' : 'row'
                        }}
                    >
                        <button
                            type="button"
                            onClick={() => {
                                navigate('/estudiante');
                            }}
                            style={{
                                padding: '0.875rem 1.75rem',
                                backgroundColor: '#64748b',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '12px',
                                cursor: 'pointer',
                                fontSize: '1rem',
                                fontWeight: '700',
                                transition: 'all 0.2s ease',
                                fontFamily: 'Outfit'
                            }}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            style={{
                                padding: '0.875rem 2rem',
                                backgroundColor: saving ? '#94a3b8' : '#2563eb',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '12px',
                                cursor: saving ? 'not-allowed' : 'pointer',
                                fontSize: '1rem',
                                fontWeight: '800',
                                boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.3)',
                                transition: 'all 0.2s ease',
                                fontFamily: 'Outfit',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px'
                            }}
                        >
                            {saving ? (
                                <>
                                    <i className="material-symbols-outlined spin" style={{ fontSize: '1.25rem' }}>progress_activity</i>{' '}
                                    Guardando...
                                </>
                            ) : (
                                <>
                                    <i className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>save</i> Guardar Cambios
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {/* Modal de confirmación */}
            {showConfirm && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                    }}
                >
                    <div
                        style={{
                            backgroundColor: '#fff',
                            padding: '2rem',
                            borderRadius: '12px',
                            maxWidth: '400px',
                            width: '90%',
                            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                        }}
                    >
                        <h3 style={{ marginBottom: '1rem', color: '#1f2937' }}>
                            <i
                                className="fas fa-exclamation-triangle"
                                style={{
                                    color: '#f59e0b',
                                    marginRight: '0.5rem',
                                }}
                            ></i>
                            Confirmar Cambios
                        </h3>
                        <p style={{ marginBottom: '1.5rem', color: '#6b7280' }}>
                            ¿Estás seguro de que deseas guardar los cambios en
                            tu información personal?
                        </p>
                        <div
                            style={{
                                display: 'flex',
                                gap: '1rem',
                                justifyContent: 'flex-end',
                            }}
                        >
                            <button
                                onClick={() => setShowConfirm(false)}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    backgroundColor: '#6b7280',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '1rem',
                                }}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmSave}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    backgroundColor: '#2563eb',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '1rem',
                                    fontWeight: '600',
                                }}
                            >
                                Confirmar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
