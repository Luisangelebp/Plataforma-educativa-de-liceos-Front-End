import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNotification } from '../../../../context/NotificationContext';

const API_URL_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

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

export const useRegistration = () => {
    const { addNotification } = useNotification();
    const [formData, setFormData] = useState({});
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [openModal, setOpenModal] = useState(null); // 'estudiante', 'profesor', 'representante', 'administrador', null
    const [gradosSecciones, setGradosSecciones] = useState([]);
    const [materias, setMaterias] = useState([]);
    const [representantes, setRepresentantes] = useState([]);
    const [selectedGradosSecciones, setSelectedGradosSecciones] = useState([]);
    const [selectedMaterias, setSelectedMaterias] = useState([]);
    const [loadingGrados, setLoadingGrados] = useState(false);
    const [loadingMaterias, setLoadingMaterias] = useState(false);
    const [loadingRepresentantes, setLoadingRepresentantes] = useState(false);

    useEffect(() => {
        if (openModal === 'profesor') {
            cargarGradosSecciones();
            cargarMaterias();
        } else if (openModal === 'estudiante') {
            cargarGradosSecciones();
            cargarRepresentantes();
        } else {
            setGradosSecciones([]);
            setMaterias([]);
            setRepresentantes([]);
            setSelectedGradosSecciones([]);
            setSelectedMaterias([]);
        }
    }, [openModal]);

    const cargarGradosSecciones = async () => {
        setLoadingGrados(true);
        try {
            const response = await axios.get(`${API_URL_BASE}/grado-seccion/`);
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
            const response = await axios.get(`${API_URL_BASE}/horarios/materias/`);
            setMaterias(response.data || []);
        } catch (error) {
            console.error('Error al cargar materias:', error);
            setMaterias([]);
        } finally {
            setLoadingMaterias(false);
        }
    };

    const cargarRepresentantes = async () => {
        setLoadingRepresentantes(true);
        try {
            const response = await axios.get(`${API_URL_BASE}/usuarios/representante/`);
            setRepresentantes(response.data || []);
        } catch (error) {
            console.error('Error al cargar representantes:', error);
            setRepresentantes([]);
        } finally {
            setLoadingRepresentantes(false);
        }
    };

    const validateForm = () => {
        let newErrors = {};
        let isValid = true;

        // Common validations
        if (!formData.nombre) {
            newErrors.nombre = 'El nombre es requerido.';
            isValid = false;
        }
        if (!formData.apellido) {
            newErrors.apellido = 'El apellido es requerido.';
            isValid = false;
        }
        if (formData.cedula && formData.cedula.length > 0 && formData.cedula[0] !== 'V' && formData.cedula[0] !== 'E') {
            newErrors.cedula = 'La cédula debe comenzar con V o E.';
            isValid = false;
        }

        // Email and password are required for non-students or secondary students
        // Admin, Profesor, Representante always need email/password
        // Estudiante needs email/password only if secundaria
        const requiresEmailPassword =
            openModal !== 'estudiante' || formData.nivel === 'secundaria';

        if (requiresEmailPassword) {
            if (!formData.email) {
                newErrors.email = 'El email es requerido.';
                isValid = false;
            }
            if (!formData.password) {
                newErrors.password = 'La contraseña es requerida.';
                isValid = false;
            } else if (formData.password.length < 8) {
                newErrors.password =
                    'La contraseña debe tener al menos 8 caracteres.';
                isValid = false;
            } else if (!/[A-Z]/.test(formData.password)) {
                newErrors.password =
                    'La contraseña debe contener al menos una letra mayúscula.';
                isValid = false;
            } else if (!/[a-z]/.test(formData.password)) {
                newErrors.password =
                    'La contraseña debe contener al menos una letra minúscula.';
                isValid = false;
            } else if (!/[0-9]/.test(formData.password)) {
                newErrors.password =
                    'La contraseña debe contener al menos un número.';
                isValid = false;
            }
        }

        // Role-specific validations
        switch (openModal) {
            case 'estudiante':
                if (!formData.fecha_nacimiento) {
                    newErrors.fecha_nacimiento =
                        'La fecha de nacimiento es requerida.';
                    isValid = false;
                }
                if (!formData.nivel) {
                    newErrors.nivel = 'El nivel es requerido.';
                    isValid = false;
                }
                if (!formData.grado) {
                    newErrors.grado = 'El grado/año es requerido.';
                    isValid = false;
                }
                if (!formData.seccion) {
                    newErrors.seccion = 'La sección es requerida.';
                    isValid = false;
                }
                if (!formData.direccion) {
                    newErrors.direccion = 'La dirección es requerida.';
                    isValid = false;
                }

                const edadEstudiante = formData.fecha_nacimiento
                    ? calcularEdad(formData.fecha_nacimiento)
                    : null;
                if (edadEstudiante !== null && edadEstudiante >= 9) {
                    if (!formData.cedula) {
                        newErrors.cedula =
                            'La cédula es requerida para estudiantes de 9 años o más.';
                        isValid = false;
                    } else if (
                        formData.cedula[0] !== 'V' &&
                        formData.cedula[0] !== 'E'
                    ) {
                        newErrors.cedula = 'La cédula debe comenzar con V o E.';
                        isValid = false;
                    }
                }
                break;
            case 'profesor':
                if (!formData.cedula) {
                    newErrors.cedula = 'La cédula es requerida.';
                    isValid = false;
                } else if (
                    formData.cedula &&
                    formData.cedula[0] !== 'V' &&
                    formData.cedula[0] !== 'E'
                ) {
                    newErrors.cedula = 'La cédula debe comenzar con V o E.';
                    isValid = false;
                }
                if (!formData.fecha_nacimiento) {
                    newErrors.fecha_nacimiento =
                        'La fecha de nacimiento es requerida.';
                    isValid = false;
                }
                if (!formData.telefono) {
                    newErrors.telefono = 'El teléfono es requerido.';
                    isValid = false;
                }
                if (!formData.direccion) {
                    newErrors.direccion = 'La dirección es requerida.';
                    isValid = false;
                }
                if (!formData.tipo_profesor) {
                    newErrors.tipo_profesor =
                        'El tipo de profesor es requerido.';
                    isValid = false;
                }
                break;
            case 'representante':
                if (!formData.cedula) {
                    newErrors.cedula = 'La cédula es requerida.';
                    isValid = false;
                } else if (
                    formData.cedula &&
                    formData.cedula[0] !== 'V' &&
                    formData.cedula[0] !== 'E'
                ) {
                    newErrors.cedula = 'La cédula debe comenzar con V o E.';
                    isValid = false;
                }
                if (!formData.fecha_nacimiento) {
                    newErrors.fecha_nacimiento =
                        'La fecha de nacimiento es requerida.';
                    isValid = false;
                }
                if (!formData.telefono) {
                    newErrors.telefono = 'El teléfono es requerido.';
                    isValid = false;
                }
                if (!formData.direccion) {
                    newErrors.direccion = 'La dirección es requerida.';
                    isValid = false;
                }
                break;
            case 'administrador':
                // All required fields are covered by common validations
                break;
            default:
                break;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleInputChange = (e) => {
        const { name, value, type, files } = e.target;

        if (type === 'file') {
            setFormData((prev) => ({ ...prev, [name]: files[0] }));
            return;
        }

        setFormData((prev) => {
            const newData = {
                ...prev,
                [name]: name === 'grado' ? value.toString() : value,
            };
            if (name === 'nivel') {
                newData.grado = '';
                newData.seccion = '';
            }
            if (name === 'fecha_nacimiento' && openModal === 'estudiante') {
                const edad = calcularEdad(value);
                if (edad !== null && edad < 9) {
                    newData.cedula = '';
                }
            }
            return newData;
        });

        // Clear error for the changed field immediately
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const openModalHandler = useCallback((tipo) => {
        setOpenModal(tipo);
        setFormData({ typeU: tipo, cedula: 'V' });
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

    const handleSubmit = async (e) => {
        console.log('handleSubmit called!');
        e.preventDefault();
        setIsLoading(true);
        setErrors({}); // Clear previous errors

        if (!validateForm()) {
            setIsLoading(false);
            return; // Stop submission if validation fails
        }

        const typeU = formData.typeU;
        try {
            const dataToSend = new FormData();

            for (const key in formData) {
                if (key !== 'typeU') {
                    // Para estudiantes menores de 9 años, no enviar cédula
                    if (typeU === 'estudiante' && key === 'cedula') {
                        const edad = formData.fecha_nacimiento
                            ? calcularEdad(formData.fecha_nacimiento)
                            : null;
                        if (edad !== null && edad < 9) {
                            continue;
                        }
                    }
                    dataToSend.append(key, formData[key]);
                }
            }

            const response = await axios.post(
                `${API_URL_BASE}/usuarios/${typeU}/registro/`,
                dataToSend,
            );

            console.log('Usuario registrado con éxito:', response.data);
            addNotification('Usuario registrado con éxito', 'success');
            closeModal();
        } catch (error) {
            console.error('Error al registrar el usuario:', error);
            let errorMessage = 'Error en datos ingresados o error de conexión.';
            if (error.response?.data) {
                if (error.response.data.error) {
                    errorMessage = 'Error del servidor: ' + error.response.data.error;
                } else if (error.response.data.detail) {
                    errorMessage = 'Detalle: ' + error.response.data.detail;
                } else if (typeof error.response.data === 'object') {
                    const errorMessages = Object.entries(error.response.data)
                        .map(
                            ([key, value]) =>
                                `${key}: ${Array.isArray(value) ? value.join(', ') : value}`,
                        )
                        .join('; ');
                    errorMessage = errorMessages || errorMessage;
                }
            } else if (error.message) {
                errorMessage = 'Error desconocido: ' + error.message;
            }
            setErrors({ submit: errorMessage });
            addNotification('Error al registrar: ' + errorMessage, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return {
        formData,
        errors,
        isLoading,
        openModal,
        gradosSecciones,
        materias,
        representantes,
        loadingGrados,
        loadingMaterias,
        loadingRepresentantes,
        handleInputChange,
        openModalHandler,
        closeModal,
        handleSubmit,
        getRoleIcon,
        getRoleName,
        calcularEdad,
        setSelectedGradosSecciones,
        setSelectedMaterias,
        selectedGradosSecciones,
        selectedMaterias
    };
};

const getRoleIcon = (role) => {
    switch (role) {
        case 'estudiante':
            return 'school';
        case 'profesor':
            return 'person';
        case 'representante':
            return 'family_restroom';
        case 'administrador':
            return 'admin_panel_settings';
        default:
            return 'person';
    }
};

const getRoleName = (role) => {
    switch (role) {
        case 'estudiante':
            return 'Estudiante';
        case 'profesor':
            return 'Profesor';
        case 'representante':
            return 'Representante';
        case 'administrador':
            return 'Administrador';
        default:
            return 'Usuario';
    }
};
