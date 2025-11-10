import './css/Registro.css';
import { useState } from 'react';
import axios from 'axios';
export default function Registo() {
    const [formData, setFormData] = useState({});
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [rolActive, setRolActive] = useState('');
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
    const rolforms = (e) => {
        handleInputChange(e);
        if (e.target.value === 'administrador') {
            setRolActive('administrador');
        } else if (e.target.value === 'representante') {
            setRolActive('representante');
        } else if (e.target.value === 'profesor') {
            setRolActive('profesor');
        } else {
            setRolActive('');
        }
    };
    const API_URL = 'http://localhost:8000/api/usuarios/';
    const handleSubmit = async (e) => {
        e.preventDefault();
        const typeU = formData.typeU;
        delete formData.typeU;
        const data = new FormData();
        for (const key in formData) {
            data.append(key, formData[key]);
        }
        console.log('Submitting form data:', formData);
        console.log('Tipo de Usuario seleccionado:', typeU);
        console.log(localStorage.getItem('accessToken'));
        setIsLoading(true);
        try {
            const response = await axios
                .post(
                    `http://localhost:8000/api/usuarios/administrador/registro/`,
                    data,
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${localStorage.getItem(
                                'accessToken'
                            )}`,
                        },
                    }
                )
                .then((response) => {
                    console.log('Usuario registrado con éxito:', response.data);
                    alert('Usuario registrado con éxito');
                    setFormData({});
                    setRolActive('');
                });
        } catch (error) {
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="registro-main">
            <h1>Registro de Usuarios</h1>
            <form className="registro-form container" onSubmit={handleSubmit}>
                {/* Tipo de Usuario Select */}
                <div className="input-group">
                    <div className="select-container">
                        <select
                            id="typeU"
                            name="typeU"
                            value={formData.typeU}
                            className={formData.typeU ? 'has-value' : ''}
                            onChange={(e) => rolforms(e)}
                        >
                            <option value="">
                                -- Seleccione el Tipo de Usuario --
                            </option>
                            <option value="representante">Representante</option>
                            <option value="estudiante" disabled>
                                Estudiante
                            </option>
                            <option value="profesor">Profesor</option>
                            <option value="administrador">Administrador</option>
                        </select>
                        <i className="select-icon fas fa-chevron-down"></i>
                    </div>
                </div>
                {/* Nombre Completo Input */}
                {rolActive !== '' && (
                    <div className="input-group">
                        <div className="input-container">
                            <input
                                type="text"
                                id="nombre"
                                name="nombre"
                                value={formData.nombre}
                                className={formData.nombre ? 'has-value' : ''}
                                onChange={(e) => handleInputChange(e)}
                                required
                            />
                            <label htmlFor="nombre">Nombres:</label>
                            <i className="input-icon bi bi-person"></i>
                        </div>
                    </div>
                )}
                {/* Apellido Input */}
                {rolActive !== '' && (
                    <div className="input-group">
                        <div className="input-container">
                            <input
                                type="text"
                                id="apellido"
                                name="apellido"
                                value={formData.apellido}
                                className={formData.apellido ? 'has-value' : ''}
                                onChange={(e) => handleInputChange(e)}
                                required
                            />
                            <label htmlFor="apellido">Apellidos:</label>
                            <i className="input-icon bi bi-person"></i>
                        </div>
                    </div>
                )}
                {/* Email Input */}
                {rolActive !== '' && (
                    <div className="input-group">
                        <div className="input-container">
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                className={formData.email ? 'has-value' : ''}
                                onChange={(e) => handleInputChange(e)}
                                required
                            />
                            <label htmlFor="email">Correo Electrónico:</label>
                            <i className="input-icon bi bi-envelope-at"></i>
                        </div>
                    </div>
                )}
                {/* Cédula Input */}
                {rolActive === 'profesor' || rolActive === 'representante' ? (
                    <div className="input-group">
                        <div className="input-container">
                            <input
                                type="text"
                                id="cedula"
                                name="cedula"
                                value={formData.cedula}
                                className={formData.cedula ? 'has-value' : ''}
                                onChange={(e) => handleInputChange(e)}
                                required
                            />
                            <label htmlFor="cedula">Cedula:</label>
                            <i className="input-icon bi bi-person-vcard"></i>
                        </div>
                    </div>
                ) : null}
                {/* Password Input */}
                {rolActive !== '' && (
                    <div className="input-group">
                        <div className="input-container">
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                className={formData.password ? 'has-value' : ''}
                                onChange={(e) => handleInputChange(e)}
                                required
                            />
                            <label htmlFor="password">Contraseña:</label>
                            <i className="input-icon bi bi-lock"></i>
                        </div>
                    </div>
                )}
                {/* Teléfono Input */}
                {rolActive === 'representante' || rolActive === 'profesor' ? (
                    <div className="input-group">
                        <div className="input-container">
                            <input
                                type="text"
                                id="telefono"
                                name="telefono"
                                value={formData.telefono}
                                className={formData.telefono ? 'has-value' : ''}
                                onChange={(e) => handleInputChange(e)}
                                required
                            />
                            <label htmlFor="telefono">Teléfono:</label>
                            <i className="input-icon bi bi-phone"></i>
                        </div>
                    </div>
                ) : null}
                {/* Dirección Input */}
                {rolActive === 'representante' || rolActive === 'profesor' ? (
                    <div className="input-group">
                        <div className="input-container">
                            <input
                                type="text"
                                id="direccion"
                                name="direccion"
                                value={formData.direccion}
                                className={
                                    formData.direccion ? 'has-value' : ''
                                }
                                onChange={(e) => handleInputChange(e)}
                                required
                            />
                            <label htmlFor="direccion">Dirección:</label>
                            <i className="input-icon bi bi-geo-alt"></i>
                        </div>
                    </div>
                ) : null}
                {/* Fecha de Nacimiento Input */}
                {rolActive === 'representante' || rolActive === 'profesor' ? (
                    <div className="input-group">
                        <div className="input-container">
                            <input
                                type="date"
                                id="fecha_nacimiento"
                                name="fecha_nacimiento"
                                value={formData.fecha_nacimiento}
                                className={
                                    formData.fecha_nacimiento ? 'has-value' : ''
                                }
                                onChange={(e) => handleInputChange(e)}
                                required
                            />
                            <label htmlFor="fecha_nacimiento">
                                Fecha de Nacimiento:
                            </label>
                            <i className="input-icon bi bi-calendar-date"></i>
                        </div>
                    </div>
                ) : null}
                {/* Foto Input */}
                {rolActive === 'representante' || rolActive === 'profesor' ? (
                    <div className="input-group">
                        <div className="input-container">
                            <input
                                type="file"
                                id="foto"
                                name="foto"
                                className={formData.foto ? 'has-value' : ''}
                                onChange={(e) => handleInputChange(e)}
                            />
                            <label htmlFor="foto"></label>
                            <i className="input-icon bi bi-camera"></i>
                        </div>
                    </div>
                ) : null}
                {/* Grado Asignado Input */}
                {rolActive === 'profesor' ? (
                    <div className="input-group">
                        <div className="input-container">
                            <input
                                type="text"
                                id="grado_asignado"
                                name="grado_asignado"
                                value={formData.grado_asignado}
                                className={
                                    formData.grado_asignado ? 'has-value' : ''
                                }
                                onChange={(e) => handleInputChange(e)}
                                required
                            />
                            <label htmlFor="grado_asignado">
                                Grado Asignado:
                            </label>
                            <i className="input-icon bi bi-book"></i>
                        </div>
                    </div>
                ) : null}
                {/* Tipo de Profesor Input */}
                {rolActive === 'profesor' ? (
                    <div className="input-group">
                        <div className="input-container">
                            <input
                                type="text"
                                id="tipo_profesor"
                                name="tipo_profesor"
                                value={formData.tipo_profesor}
                                className={
                                    formData.tipo_profesor ? 'has-value' : ''
                                }
                                onChange={(e) => handleInputChange(e)}
                                required
                            />
                            <label htmlFor="tipo_profesor">
                                Tipo de Profesor:
                            </label>
                            <i className="input-icon bi bi bi-book"></i>
                        </div>
                    </div>
                ) : null}
                <button className="submit-btn" type="submit">
                    {isLoading ? 'Registrando...' : 'Registrar Usuario'}
                </button>
            </form>
        </div>
    );
}
