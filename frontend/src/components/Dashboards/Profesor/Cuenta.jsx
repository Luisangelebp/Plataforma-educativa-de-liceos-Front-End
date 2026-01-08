import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../Admin/css/Listas.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

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
    const [user, setUser] = useState(null);
    const [profesor, setProfesor] = useState(null);
    const [formData, setFormData] = useState({
        direccion: '',
        telefono: '',
        foto: null,
    });
    const [fotoPreview, setFotoPreview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});
    const [showConfirm, setShowConfirm] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        cargarDatosUsuario();
    }, []);

    const cargarDatosUsuario = async () => {
        try {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                const userData = JSON.parse(userStr);
                setUser(userData);
                // Obtener el perfil del profesor
                const response = await axiosInstance.get('usuarios/profesor/');
                const profesorData = response.data.find(
                    (p) => p.usuario.id === userData.id
                );
                console.log('Datos del profesor obtenidos:', response.data);
                if (profesorData) {
                    setProfesor(profesorData);
                    setFormData({
                        direccion: profesorData.direccion || '',
                        telefono: profesorData.telefono || '',
                        foto: null,
                    });
                    console.log('Datos del profesor cargados:', {
                        direccion: profesorData.direccion,
                        telefono: profesorData.telefono,
                    });
                    if (profesorData.foto) {
                        const baseUrl =
                            import.meta.env.VITE_API_URL ||
                            'http://localhost:8000';
                        setFotoPreview(
                            profesorData.foto.startsWith('http')
                                ? profesorData.foto
                                : `${baseUrl}${profesorData.foto}`
                        );
                    }
                } else {
                    console.warn(
                        'No se encontró el perfil del profesor para el usuario:',
                        userData.id
                    );
                }
            }
        } catch (error) {
            console.error('Error al cargar datos del usuario:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
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

        // Solo validar formato si el campo tiene contenido
        if (
            formData.telefono &&
            formData.telefono.trim() &&
            !/^\d+$/.test(formData.telefono.trim())
        ) {
            newErrors.telefono = 'El teléfono debe contener solo números';
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

        try {
            let dataToSend;
            let axiosToUse;

            // Siempre enviar los datos, incluso si no hay foto
            if (formData.foto) {
                dataToSend = new FormData();
                dataToSend.append('direccion', formData.direccion || '');
                dataToSend.append('telefono', formData.telefono || '');
                dataToSend.append('foto', formData.foto);
                axiosToUse = axiosInstanceFile;
            } else {
                dataToSend = {
                    direccion: formData.direccion || '',
                    telefono: formData.telefono || '',
                };
                axiosToUse = axiosInstance;
            }

            const response = await axiosToUse.patch(
                `usuarios/profesor/${profesor.id}/`,
                dataToSend
            );

            setProfesor(response.data);
            setFormData((prev) => ({ ...prev, foto: null }));

            // Actualizar la foto en localStorage si se actualizó
            if (response.data.foto) {
                const baseUrl =
                    import.meta.env.VITE_API_URL || 'http://localhost:8000';
                const fotoUrl = response.data.foto.startsWith('http')
                    ? response.data.foto
                    : `${baseUrl}${response.data.foto}`;
                setFotoPreview(fotoUrl);
                
                // Actualizar el usuario en localStorage con la nueva foto
                const userStr = localStorage.getItem('user');
                if (userStr) {
                    const userData = JSON.parse(userStr);
                    const updatedUser = {
                        ...userData,
                        foto: response.data.foto
                    };
                    localStorage.setItem('user', JSON.stringify(updatedUser));
                    setUser(updatedUser);
                    
                    // Disparar evento personalizado para notificar a otros componentes
                    window.dispatchEvent(new CustomEvent('userUpdated', { detail: updatedUser }));
                }
            }

            setSuccessMessage('Información actualizada correctamente');
            setTimeout(() => setSuccessMessage(''), 5000);
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
        <div className="dashboard-content">
            <div
                style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}
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
                                Teléfono *
                            </label>
                            <input
                                type="text"
                                name="telefono"
                                value={formData.telefono}
                                onChange={handleChange}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: `1px solid ${
                                        errors.telefono ? '#ef4444' : '#d1d5db'
                                    }`,
                                    borderRadius: '6px',
                                    fontSize: '1rem',
                                }}
                            />
                            {errors.telefono && (
                                <span
                                    style={{
                                        color: '#ef4444',
                                        fontSize: '0.875rem',
                                    }}
                                >
                                    {errors.telefono}
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
                                    border: `1px solid ${
                                        errors.direccion ? '#ef4444' : '#d1d5db'
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
                                        border: `1px solid ${
                                            errors.foto ? '#ef4444' : '#d1d5db'
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
                        }}
                    >
                        <button
                            type="button"
                            onClick={() => {
                                navigate('/profesor');
                            }}
                            style={{
                                padding: '0.75rem 1.5rem',
                                backgroundColor: '#6b7280',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '1rem',
                                fontWeight: '600',
                            }}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            style={{
                                padding: '0.75rem 1.5rem',
                                backgroundColor: saving ? '#9ca3af' : '#2563eb',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: saving ? 'not-allowed' : 'pointer',
                                fontSize: '1rem',
                                fontWeight: '600',
                            }}
                        >
                            {saving ? (
                                <>
                                    <i className="fas fa-spinner fa-spin"></i>{' '}
                                    Guardando...
                                </>
                            ) : (
                                <>
                                    <i className="fas fa-save"></i> Guardar
                                    Cambios
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
