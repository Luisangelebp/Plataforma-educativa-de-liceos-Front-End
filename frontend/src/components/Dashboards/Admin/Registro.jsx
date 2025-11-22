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
            // 👇 si el campo es "grado", lo guardamos como string
            [name]: name === 'grado' ? value.toString() : value,
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
        } else if (e.target.value === 'estudiante') {
            setRolActive('estudiante');
        } else {
            setRolActive('');
        }
    };

    const API_URL = 'http://localhost:8000/usuarios';

    const handleSubmit = async (e) => {
        e.preventDefault();
        const typeU = formData.typeU;
        setIsLoading(true);
        const formDataObj = new FormData();
        console.log(formData);
        const formErrors = validateForm();
        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
            return;
        }

        for (const key in formData) {
            if (key !== 'typeU') {
                formDataObj.append(key, formData[key]);
            }
        }

        try {
            const response = await axios
                .post(`${API_URL}/${typeU}/registro/`, formDataObj)
                .then((response) => {
                    console.log('Usuario registrado con éxito:', response.data);
                    alert('Usuario registrado con éxito');
                });
        } catch (error) {
            console.error('Error al registrar el usuario:', error);
            setErrors({
                submit: 'Error en datos ingresados o error de conexión.',
            });
        } finally {
            setIsLoading(false);
            setFormData({});
            setRolActive('');
        }
    };

    return (
        <div className="registro-main">
            {' '}
            <h1>Registro de Usuarios</h1>{' '}
            <form
                className="registro-form container"
                onSubmit={handleSubmit}
                encType="multipart/form-data"
            >
                {' '}
                {/* Tipo de Usuario Select */}
                <div className="input-group ">
                    {' '}
                    <div className="select-container">
                        {' '}
                        <select
                            id="typeU"
                            name="typeU"
                            value={formData.typeU}
                            className={formData.typeU ? 'has-value' : ''}
                            onChange={(e) => rolforms(e)}
                        >
                            {' '}
                            <option value="">
                                {' '}
                                -- Seleccione el Tipo de Usuario --{' '}
                            </option>{' '}
                            <option value="representante">
                                Representante
                            </option>{' '}
                            <option value="estudiante"> Estudiante </option>{' '}
                            <option value="profesor">Profesor</option>{' '}
                            <option value="administrador">Administrador</option>{' '}
                        </select>{' '}
                        <i className="select-icon fas fa-chevron-down"></i>{' '}
                    </div>{' '}
                </div>
                {/* Nivel de Estudiante Select */}
                {rolActive === 'estudiante' && (
                    <div className="input-group">
                        <div className="select-container">
                            <select
                                id="nivel"
                                name="nivel"
                                value={formData.nivel}
                                className={formData.nivel ? 'has-value' : ''}
                                onChange={(e) => handleInputChange(e)}
                            >
                                <option value="">
                                    -- Seleccione el nivel escolar --
                                </option>
                                <option value="primaria">Primaria</option>
                                <option value="secundaria"> Secundaria </option>
                            </select>
                            <i className="select-icon fas fa-chevron-down"></i>
                        </div>
                    </div>
                )}
                {/* Nombre Completo Input */}
                {rolActive !== '' && (
                    <div className="input-group">
                        {' '}
                        <div className="input-container">
                            {' '}
                            <input
                                type="text"
                                id="nombre"
                                name="nombre"
                                value={formData.nombre}
                                className={formData.nombre ? 'has-value' : ''}
                                onChange={(e) => handleInputChange(e)}
                                required
                            />{' '}
                            <label htmlFor="nombre">Nombres:</label>{' '}
                            <i className="input-icon bi bi-person"></i>{' '}
                        </div>{' '}
                    </div>
                )}
                {/* Apellido Input */}
                {rolActive !== '' && (
                    <div className="input-group">
                        {' '}
                        <div className="input-container">
                            {' '}
                            <input
                                type="text"
                                id="apellido"
                                name="apellido"
                                value={formData.apellido}
                                className={formData.apellido ? 'has-value' : ''}
                                onChange={(e) => handleInputChange(e)}
                                required
                            />{' '}
                            <label htmlFor="apellido">Apellidos:</label>{' '}
                            <i className="input-icon bi bi-person"></i>{' '}
                        </div>{' '}
                    </div>
                )}
                {/* Email Input */}
                {formData.nivel !== 'primaria' && rolActive !== '' && (
                    <div className="input-group">
                        {' '}
                        <div className="input-container">
                            {' '}
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                className={formData.email ? 'has-value' : ''}
                                onChange={(e) => handleInputChange(e)}
                                required
                            />{' '}
                            <label htmlFor="email">Correo Electrónico:</label>{' '}
                            <i className="input-icon bi bi-envelope-at"></i>{' '}
                        </div>{' '}
                    </div>
                )}
                {/* Cédula Input */}
                {rolActive === 'profesor' ||
                rolActive === 'representante' ||
                rolActive === 'estudiante' ? (
                    <div className="input-group">
                        {' '}
                        <div className="input-container">
                            {' '}
                            <input
                                type="text"
                                id="cedula"
                                name="cedula"
                                value={formData.cedula}
                                className={formData.cedula ? 'has-value' : ''}
                                onChange={(e) => handleInputChange(e)}
                                required
                            />{' '}
                            <label htmlFor="cedula">Cedula:</label>{' '}
                            <i className="input-icon bi bi-person-vcard"></i>{' '}
                        </div>{' '}
                    </div>
                ) : null}
                {/* Password Input */}
                {formData.nivel !== 'primaria' && rolActive !== '' && (
                    <div className="input-group">
                        {' '}
                        <div className="input-container">
                            {' '}
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                className={formData.password ? 'has-value' : ''}
                                onChange={(e) => handleInputChange(e)}
                                required
                            />{' '}
                            <label htmlFor="password">Contraseña:</label>{' '}
                            <i className="input-icon bi bi-lock"></i>{' '}
                        </div>{' '}
                    </div>
                )}
                {/* Teléfono Input */}
                {rolActive === 'representante' || rolActive === 'profesor' ? (
                    <div className="input-group">
                        {' '}
                        <div className="input-container">
                            {' '}
                            <input
                                type="text"
                                id="telefono"
                                name="telefono"
                                value={formData.telefono}
                                className={formData.telefono ? 'has-value' : ''}
                                onChange={(e) => handleInputChange(e)}
                                required
                            />{' '}
                            <label htmlFor="telefono">Teléfono:</label>{' '}
                            <i className="input-icon bi bi-phone"></i>{' '}
                        </div>{' '}
                    </div>
                ) : null}
                {/* Dirección Input */}
                {rolActive !== '' && rolActive !== 'administrador' ? (
                    <div className="input-group">
                        {' '}
                        <div className="input-container">
                            {' '}
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
                            />{' '}
                            <label htmlFor="direccion">Dirección:</label>{' '}
                            <i className="input-icon bi bi-geo-alt"></i>{' '}
                        </div>{' '}
                    </div>
                ) : null}
                {/* Grado Input */}
                {rolActive === 'estudiante' ? (
                    <div className="input-group">
                        {' '}
                        <div className="input-container">
                            {' '}
                            <input
                                type="number"
                                id="grado"
                                name="grado"
                                value={formData.grado}
                                className={formData.grado ? 'has-value' : ''}
                                onChange={(e) => handleInputChange(e)}
                                required
                                min="1"
                                max="6"
                            />{' '}
                            <label htmlFor="grado">Grado:</label>{' '}
                            <i className="input-icon bi bi-book"></i>{' '}
                        </div>{' '}
                    </div>
                ) : null}
                {/* Sección Input */}
                {rolActive === 'estudiante' ? (
                    <div className="input-group">
                        <div className="select-container">
                            <select
                                id="seccion"
                                name="seccion"
                                value={formData.seccion}
                                className={formData.seccion ? 'has-value' : ''}
                                onChange={(e) => handleInputChange(e)}
                                required
                            >
                                <option value="">
                                    -- Seleccione la sección --
                                </option>
                                <option value="A">A</option>
                                <option value="B">B</option>
                                <option value="C">C</option>
                            </select>
                            <i className="select-icon fas fa-chevron-down"></i>
                        </div>
                    </div>
                ) : null}
                {/* Sección Input */}
                {rolActive === 'estudiante' ? (
                    <div className="input-group">
                        <div className="select-container">
                            <select
                                id="seccion"
                                name="seccion"
                                value={formData.seccion}
                                className={formData.seccion ? 'has-value' : ''}
                                onChange={(e) => handleInputChange(e)}
                                required
                            >
                                <option value="">
                                    -- Seleccione la sección --
                                </option>
                                <option value="A">A</option>
                                <option value="B">B</option>
                                <option value="C">C</option>
                            </select>
                            <i className="select-icon fas fa-chevron-down"></i>
                        </div>
                    </div>
                ) : null}
                {/* Sección Input */}
                {rolActive === 'estudiante' ? (
                    <div className="input-group">
                        <div className="select-container">
                            <select
                                id="seccion"
                                name="seccion"
                                value={formData.seccion}
                                className={formData.seccion ? 'has-value' : ''}
                                onChange={(e) => handleInputChange(e)}
                                required
                            >
                                <option value="">
                                    -- Seleccione la sección --
                                </option>
                                <option value="A">A</option>
                                <option value="B">B</option>
                                <option value="C">C</option>
                            </select>
                            <i className="select-icon fas fa-chevron-down"></i>
                        </div>
                    </div>
                ) : null}
                {/* Fecha de Nacimiento Input */}
                {rolActive !== '' && rolActive !== 'administrador' ? (
                    <div className="input-group">
                        {' '}
                        <div className="input-container">
                            {' '}
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
                            />{' '}
                            <label htmlFor="fecha_nacimiento">
                                {' '}
                                Fecha de Nacimiento:{' '}
                            </label>{' '}
                            <i className="input-icon bi bi-calendar-date"></i>{' '}
                        </div>{' '}
                    </div>
                ) : null}
                {/* Foto Input */}
                {rolActive === 'representante' ||
                rolActive === 'profesor' ||
                rolActive === 'estudiante' ? (
                    <div className="input-group">
                        {' '}
                        <div className="input-container">
                            {' '}
                            <input
                                type="file"
                                id="foto"
                                name="foto"
                                className={formData.foto ? 'has-value' : ''}
                                onChange={(e) => {
                                    const file = e.target.files[0];

                                    setFormData((prev) => ({
                                        ...prev,
                                        foto: file,
                                    }));

                                    if (errors[name]) {
                                        setErrors((prev) => ({
                                            ...prev,
                                            [name]: '',
                                        }));
                                    }
                                }}
                                accept="image/*"
                                required
                            />{' '}
                            <label htmlFor="foto"></label>{' '}
                            <i className="input-icon bi bi-camera"></i>{' '}
                        </div>{' '}
                    </div>
                ) : null}
                {/* Grado Asignado PROFESOR Input */}
                {rolActive === 'profesor' ? (
                    <div className="input-group">
                        {' '}
                        <div className="input-container">
                            {' '}
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
                            />{' '}
                            <label htmlFor="grado_asignado">
                                {' '}
                                Grado Asignado:{' '}
                            </label>{' '}
                            <i className="input-icon bi bi-book"></i>{' '}
                        </div>{' '}
                    </div>
                ) : null}
                {/* Tipo de Profesor Input */}
                {rolActive === 'profesor' ? (
                    <div className="input-group">
                        {' '}
                        <div className="input-container">
                            {' '}
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
                            />{' '}
                            <label htmlFor="tipo_profesor">
                                {' '}
                                Tipo de Profesor:{' '}
                            </label>{' '}
                            <i className="input-icon bi bi bi-book"></i>{' '}
                        </div>{' '}
                    </div>
                ) : null}
                {errors.submit && (
                    <div className="submit-error">
                        <i className="fas fa-exclamation-circle"></i>
                        {errors.submit}
                    </div>
                )}
                <button className="submit-btn" type="submit">
                    {' '}
                    {isLoading ? 'Registrando...' : 'Registrar Usuario'}
                </button>{' '}
            </form>{' '}
        </div>
    );
}
