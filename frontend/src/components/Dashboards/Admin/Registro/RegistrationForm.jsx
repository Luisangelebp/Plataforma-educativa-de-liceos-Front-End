import { useState } from 'react';
import '../../../../assets/LandingPage/StartSession/css/ModalSession.css';

const InputField = ({
    id,
    name,
    label,
    type = 'text',
    value,
    onChange,
    required = false,
    placeholder,
    error,
    icon,
    children,
    ...props
}) => (
    <div className="form-group" style={{ margin: 0 }}>
        <label
            htmlFor={id}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                marginBottom: '6px',
                fontWeight: '600',
                color: 'var(--dark)',
                fontSize: '0.85rem',
            }}
        >
            {icon && (
                <span
                    className="material-symbols-outlined"
                    style={{ fontSize: '1rem', color: 'var(--primary)' }}
                >
                    {icon}
                </span>
            )}
            {label} {required && '*'}
        </label>
        {children ? (
            children
        ) : (
            <input
                type={type}
                id={id}
                name={name}
                value={type === 'file' ? undefined : value || ''}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                {...props}
                className={`${value ? 'has-value' : ''}`}
            />
        )}
        {error && (
            <span
                style={{
                    color: 'var(--danger)',
                    fontSize: '0.85rem',
                    marginTop: '5px',
                    display: 'block',
                }}
            >
                {error}
            </span>
        )}
    </div>
);

const RegistrationForm = ({
    formData,
    errors,
    isLoading,
    handleInputChange,
    handleSubmit,
    closeModal,
    role,
    calcularEdad,
    gradosSecciones,
    materias,
    representantes,
    loadingGrados,
    loadingMaterias,
    loadingRepresentantes,
    selectedGradosSecciones,
    selectedMaterias,
    setSelectedGradosSecciones,
    setSelectedMaterias,
}) => {
    const [currentSlide, setCurrentSlide] = useState(0);

    const getSlides = () => {
        const edad = formData.fecha_nacimiento
            ? calcularEdad(formData.fecha_nacimiento)
            : null;

        const commonSlide1 = [
            <InputField
                key="nombre"
                id="nombre"
                name="nombre"
                label="Nombres"
                value={formData.nombre}
                onChange={handleInputChange}
                required
                icon="person"
                placeholder="Nombres"
            />,
            <InputField
                key="apellido"
                id="apellido"
                name="apellido"
                label="Apellidos"
                value={formData.apellido}
                onChange={handleInputChange}
                required
                icon="person"
                placeholder="Apellidos"
            />,
        ];

        const commonSlide2 = [
            <InputField
                key="email"
                id="email"
                name="email"
                label="Email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                icon="mail"
                placeholder="ejemplo@correo.com"
            />,
            <InputField
                key="password"
                id="password"
                name="password"
                label="Contraseña"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                icon="lock"
                placeholder="Mín. 8 caracteres"
                error={errors.password}
            />,
        ];

        switch (role) {
            case 'estudiante':
                const slidesEstudiante = [
                    [
                        // Slide 1
                        ...commonSlide1, // nombre, apellido
                        <InputField
                            key="fecha_nacimiento"
                            id="fecha_nacimiento"
                            name="fecha_nacimiento"
                            label="Fecha de Nacimiento"
                            type="date"
                            value={formData.fecha_nacimiento}
                            onChange={handleInputChange}
                            required
                            icon="calendar_today"
                            max={new Date().toISOString().split('T')[0]}
                        />,
                        <InputField
                            key="nivel"
                            id="nivel"
                            name="nivel"
                            label="Nivel"
                            value={formData.nivel}
                            onChange={handleInputChange}
                            required
                            icon="layers"
                        >
                            <select
                                id="nivel"
                                name="nivel"
                                value={formData.nivel || ''}
                                onChange={handleInputChange}
                                required
                                style={{
                                    width: '100%',
                                    padding: '8px 10px',
                                    border: '2px solid var(--light-gray)',
                                    borderRadius: 'var(--border-radius)',
                                    fontSize: '0.9rem',
                                }}
                            >
                                <option value="">Seleccione</option>
                                <option value="primaria">Primaria</option>
                                <option value="secundaria">Secundaria</option>
                            </select>
                        </InputField>,
                    ],
                    [
                        // Slide 2
                        <InputField
                            key="grado"
                            id="grado"
                            name="grado"
                            label={
                                formData.nivel === 'primaria' ? 'Grado' : 'Año'
                            }
                            value={formData.grado}
                            onChange={handleInputChange}
                            required
                            icon="book"
                            disabled={!formData.nivel}
                        >
                            <select
                                id="grado"
                                name="grado"
                                value={formData.grado || ''}
                                onChange={handleInputChange}
                                required
                                disabled={!formData.nivel}
                                style={{
                                    width: '100%',
                                    padding: '8px 10px',
                                    border: '2px solid var(--light-gray)',
                                    borderRadius: 'var(--border-radius)',
                                    fontSize: '0.9rem',
                                    background: formData.nivel
                                        ? 'white'
                                        : '#f5f5f5',
                                }}
                            >
                                <option value="">
                                    {formData.nivel
                                        ? `Seleccione el ${formData.nivel === 'primaria' ? 'grado' : 'año'}`
                                        : 'Seleccione nivel'}
                                </option>
                                {formData.nivel === 'primaria'
                                    ? Array.from({ length: 6 }, (_, i) => (
                                        <option key={i + 1} value={i + 1}>
                                            {i + 1}° Grado
                                        </option>
                                    ))
                                    : Array.from({ length: 6 }, (_, i) => (
                                        <option key={i + 1} value={i + 1}>
                                            {i + 1}° Año
                                        </option>
                                    ))}
                            </select>
                        </InputField>,
                        <InputField
                            key="seccion"
                            id="seccion"
                            name="seccion"
                            label="Sección"
                            value={formData.seccion}
                            onChange={handleInputChange}
                            required
                            icon="groups"
                        >
                            <select
                                id="seccion"
                                name="seccion"
                                value={formData.seccion || ''}
                                onChange={handleInputChange}
                                required
                                style={{
                                    width: '100%',
                                    padding: '8px 10px',
                                    border: '2px solid var(--light-gray)',
                                    borderRadius: 'var(--border-radius)',
                                    fontSize: '0.9rem',
                                }}
                            >
                                <option value="">Seleccione</option>
                                <option value="A">A</option>
                                <option value="B">B</option>
                                <option value="C">C</option>
                            </select>
                        </InputField>,
                        <InputField
                            key="representante"
                            id="representante"
                            name="representante"
                            label="Representante"
                            value={formData.representante}
                            onChange={handleInputChange}
                            required
                            icon="family_restroom"
                        >
                            <select
                                id="representante"
                                name="representante"
                                value={formData.representante || ''}
                                onChange={handleInputChange}
                                required
                                style={{
                                    width: '100%',
                                    padding: '8px 10px',
                                    border: '2px solid var(--light-gray)',
                                    borderRadius: 'var(--border-radius)',
                                    fontSize: '0.9rem',
                                }}
                            >
                                <option value="">
                                    {loadingRepresentantes
                                        ? 'Cargando...'
                                        : 'Seleccione Representante'}
                                </option>
                                {representantes.map((rep) => (
                                    <option key={rep.id} value={rep.id}>
                                        {rep.nombre} {rep.apellido} (
                                        {rep.cedula})
                                    </option>
                                ))}
                            </select>
                        </InputField>,
                        <InputField
                            key="direccion"
                            id="direccion"
                            name="direccion"
                            label="Dirección"
                            value={formData.direccion}
                            onChange={handleInputChange}
                            required
                            icon="location_on"
                            placeholder="Dirección completa"
                        />,
                        <InputField
                            key="foto"
                            id="foto"
                            name="foto"
                            label="Foto de Perfil"
                            type="file"
                            onChange={handleInputChange}
                            icon="photo_camera"
                            accept="image/*"
                        />,
                    ],
                ];

                const finalSlideEstudiante = [];
                if (edad !== null && edad >= 9) {
                    finalSlideEstudiante.push(
                        <InputField
                            key="cedula"
                            id="cedula"
                            name="cedula"
                            label="Cédula"
                            value={formData.cedula}
                            onChange={handleInputChange}
                            required
                            icon="badge"
                            placeholder="V12345678"
                            error={errors.cedula}
                        />,
                    );
                }
                if (formData.nivel === 'secundaria') {
                    finalSlideEstudiante.push(...commonSlide2); // email, password
                }
                if (finalSlideEstudiante.length > 0)
                    slidesEstudiante.push(finalSlideEstudiante);

                return slidesEstudiante;

            case 'profesor':
                return [
                    [...commonSlide1, ...commonSlide2],
                    [
                        <InputField
                            key="cedula"
                            id="cedula"
                            name="cedula"
                            label="Cédula"
                            value={formData.cedula}
                            onChange={handleInputChange}
                            required
                            icon="badge"
                            placeholder="V12345678"
                            error={errors.cedula}
                        />,
                        <InputField
                            key="fecha_nacimiento"
                            id="fecha_nacimiento"
                            name="fecha_nacimiento"
                            label="Fecha de Nacimiento"
                            type="date"
                            value={formData.fecha_nacimiento}
                            onChange={handleInputChange}
                            required
                            icon="calendar_today"
                            max={new Date().toISOString().split('T')[0]}
                        />,
                        <InputField
                            key="telefono"
                            id="telefono"
                            name="telefono"
                            label="Teléfono"
                            value={formData.telefono}
                            onChange={handleInputChange}
                            required
                            icon="phone"
                            placeholder="0412-1234567"
                        />,
                        <InputField
                            key="direccion"
                            id="direccion"
                            name="direccion"
                            label="Dirección"
                            value={formData.direccion}
                            onChange={handleInputChange}
                            required
                            icon="location_on"
                            placeholder="Dirección completa"
                        />,
                    ],
                    [
                        <InputField
                            key="tipo_profesor"
                            id="tipo_profesor"
                            name="tipo_profesor"
                            label="Tipo de Profesor"
                            value={formData.tipo_profesor}
                            onChange={handleInputChange}
                            required
                            icon="person_pin"
                        >
                            <select
                                id="tipo_profesor"
                                name="tipo_profesor"
                                value={formData.tipo_profesor || ''}
                                onChange={handleInputChange}
                                required
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    border: '2px solid #e2e8f0',
                                    borderRadius: '12px',
                                    fontSize: '0.9rem',
                                    background: 'white'
                                }}
                            >
                                <option value="">Seleccione</option>
                                <option value="titular">Titular</option>
                                <option value="suplente">Suplente</option>
                                <option value="especialista">
                                    Especialista
                                </option>
                            </select>
                        </InputField>,
                        <div key="assignment-header" style={{ gridColumn: '1 / -1', marginTop: '1rem', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
                            <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '700', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span className="material-symbols-outlined" style={{ color: '#2563eb' }}>assignment_ind</span>
                                Asignación Académica
                            </h4>
                        </div>,
                        <InputField
                            key="grados_secciones"
                            id="grados_secciones"
                            name="grados_secciones"
                            label="Grados y Secciones"
                            icon="layers"
                        >
                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                                    gap: '8px',
                                    maxHeight: '200px',
                                    overflowY: 'auto',
                                    padding: '12px',
                                    background: '#f8fafc',
                                    borderRadius: '16px',
                                    border: '2px solid #e2e8f0',
                                }}
                            >
                                {loadingGrados ? (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b' }}>
                                        <span className="material-symbols-outlined spin" style={{ fontSize: '18px' }}>progress_activity</span>
                                        <span style={{ fontSize: '0.85rem' }}>Cargando...</span>
                                    </div>
                                ) : (
                                    gradosSecciones.map((gs) => (
                                        <label
                                            key={gs.id}
                                            style={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                padding: '8px',
                                                borderRadius: '12px',
                                                background: selectedGradosSecciones.includes(gs.id) ? '#dbeafe' : 'white',
                                                border: `2px solid ${selectedGradosSecciones.includes(gs.id) ? '#2563eb' : '#e2e8f0'}`,
                                                cursor: 'pointer',
                                                transition: 'all 0.2s ease',
                                                textAlign: 'center',
                                                minHeight: '60px'
                                            }}
                                        >
                                            <input
                                                type="checkbox"
                                                style={{ display: 'none' }}
                                                checked={selectedGradosSecciones.includes(gs.id)}
                                                onChange={(e) => {
                                                    if (e.target.checked)
                                                        setSelectedGradosSecciones([...selectedGradosSecciones, gs.id]);
                                                    else
                                                        setSelectedGradosSecciones(selectedGradosSecciones.filter((id) => id !== gs.id));
                                                }}
                                            />
                                            <span style={{ fontSize: '0.85rem', fontWeight: '800', color: selectedGradosSecciones.includes(gs.id) ? '#1e40af' : '#475569' }}>
                                                {gs.grado}° {gs.seccion}
                                            </span>
                                            <span style={{ fontSize: '0.7rem', color: selectedGradosSecciones.includes(gs.id) ? '#3b82f6' : '#94a3b8', textTransform: 'capitalize' }}>
                                                {gs.nivel}
                                            </span>
                                        </label>
                                    ))
                                )}
                            </div>
                        </InputField>,
                        <InputField
                            key="materias"
                            id="materias"
                            name="materias"
                            label="Materias"
                            icon="book"
                        >
                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '6px',
                                    maxHeight: '200px',
                                    overflowY: 'auto',
                                    padding: '12px',
                                    background: '#f8fafc',
                                    borderRadius: '16px',
                                    border: '2px solid #e2e8f0',
                                }}
                            >
                                {loadingMaterias ? (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b' }}>
                                        <span className="material-symbols-outlined spin" style={{ fontSize: '18px' }}>progress_activity</span>
                                        <span style={{ fontSize: '0.85rem' }}>Cargando...</span>
                                    </div>
                                ) : (
                                    materias.map((m) => (
                                        <label
                                            key={m.id}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                padding: '10px 14px',
                                                borderRadius: '12px',
                                                background: selectedMaterias.includes(m.id) ? '#f0fdf4' : 'white',
                                                border: `2px solid ${selectedMaterias.includes(m.id) ? '#22c55e' : '#e2e8f0'}`,
                                                cursor: 'pointer',
                                                transition: 'all 0.2s ease',
                                                gap: '12px'
                                            }}
                                        >
                                            <div style={{
                                                width: '20px',
                                                height: '20px',
                                                borderRadius: '6px',
                                                border: `2px solid ${selectedMaterias.includes(m.id) ? '#22c55e' : '#cbd5e1'}`,
                                                background: selectedMaterias.includes(m.id) ? '#22c55e' : 'transparent',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: 'white'
                                            }}>
                                                {selectedMaterias.includes(m.id) && <span className="material-symbols-outlined" style={{ fontSize: '14px', fontWeight: 'bold' }}>check</span>}
                                            </div>
                                            <input
                                                type="checkbox"
                                                style={{ display: 'none' }}
                                                checked={selectedMaterias.includes(m.id)}
                                                onChange={(e) => {
                                                    if (e.target.checked)
                                                        setSelectedMaterias([...selectedMaterias, m.id]);
                                                    else
                                                        setSelectedMaterias(selectedMaterias.filter((id) => id !== m.id));
                                                }}
                                            />
                                            <span style={{ fontSize: '0.85rem', fontWeight: '600', color: selectedMaterias.includes(m.id) ? '#166534' : '#475569' }}>
                                                {m.nombre}
                                            </span>
                                        </label>
                                    ))
                                )}
                            </div>
                        </InputField>,
                        <InputField
                            key="foto"
                            id="foto"
                            name="foto"
                            label="Foto de Perfil"
                            type="file"
                            onChange={handleInputChange}
                            icon="photo_camera"
                            accept="image/*"
                        />,
                    ],
                ];

            case 'representante':
                return [
                    [...commonSlide1, ...commonSlide2],
                    [
                        <InputField
                            key="cedula"
                            id="cedula"
                            name="cedula"
                            label="Cédula"
                            value={formData.cedula}
                            onChange={handleInputChange}
                            required
                            icon="badge"
                            placeholder="V12345678"
                            error={errors.cedula}
                        />,
                        <InputField
                            key="fecha_nacimiento"
                            id="fecha_nacimiento"
                            name="fecha_nacimiento"
                            label="Fecha de Nacimiento"
                            type="date"
                            value={formData.fecha_nacimiento}
                            onChange={handleInputChange}
                            required
                            icon="calendar_today"
                            max={new Date().toISOString().split('T')[0]}
                        />,
                        <InputField
                            key="telefono"
                            id="telefono"
                            name="telefono"
                            label="Teléfono"
                            value={formData.telefono}
                            onChange={handleInputChange}
                            required
                            icon="phone"
                            placeholder="0412-1234567"
                        />,
                        <InputField
                            key="direccion"
                            id="direccion"
                            name="direccion"
                            label="Dirección"
                            value={formData.direccion}
                            onChange={handleInputChange}
                            required
                            icon="location_on"
                            placeholder="Dirección completa"
                        />,
                        <InputField
                            key="foto"
                            id="foto"
                            name="foto"
                            label="Foto de Perfil"
                            type="file"
                            onChange={handleInputChange}
                            icon="photo_camera"
                            accept="image/*"
                        />,
                    ],
                ];

            case 'administrador':
                return [
                    [...commonSlide1, ...commonSlide2], // Slide 1
                    [
                        // Slide 2
                        <InputField
                            key="foto"
                            id="foto"
                            name="foto"
                            label="Foto de Perfil"
                            type="file"
                            onChange={handleInputChange}
                            icon="photo_camera"
                            accept="image/*"
                        />,
                    ],
                ];
            default:
                return [];
        }
    };

    const slides = getSlides();
    const totalSlides = slides.length;
    const isCurrentSlideValid = () => {
        const slides = getSlides();
        const currentFields = slides[currentSlide];

        // Helper check for a single field component
        const checkField = (field) => {
            if (!field || !field.props) return true;

            // If it's a div (like the one wrapping assignment-header or multiple inputs), recurse
            if (field.type === 'div' && field.props.children) {
                if (Array.isArray(field.props.children)) {
                    return field.props.children.every(checkField);
                }
                return checkField(field.props.children);
            }

            // If component is InputField and required is true
            if (field.props.required) {
                const value = formData[field.props.name];
                if (!value || value.toString().trim() === '') return false;
            }

            // Special check for arrays (checkbox groups)
            if (field.props.name === 'grados_secciones' && selectedGradosSecciones.length === 0) return false;
            if (field.props.name === 'materias' && selectedMaterias.length === 0) return false;

            return true;
        };

        if (Array.isArray(currentFields)) {
            return currentFields.every(checkField);
        }
        return checkField(currentFields);
    };

    const nextSlide = () =>
        setCurrentSlide((prev) => Math.min(prev + 1, totalSlides - 1));
    const prevSlide = () => setCurrentSlide((prev) => Math.max(prev - 1, 0));

    return (
        <form
            noValidate
            encType="multipart/form-data"
            style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}
        >
            <div className="carousel-container" style={{ flex: 1, overflowY: 'auto', paddingRight: '5px' }}>
                <div className="carousel-content" style={{ padding: '0 10px' }}>
                    <div className="registration-grid">
                        {slides[currentSlide]}
                    </div>
                </div>
            </div>

            {errors.submit && (
                <div
                    style={{
                        padding: '10px',
                        background: '#fee',
                        border: '1px solid #fcc',
                        borderRadius: 'var(--border-radius)',
                        color: '#c33',
                        fontSize: '0.85rem',
                        marginTop: '15px',
                    }}
                >
                    {errors.submit}
                </div>
            )}

            {!isCurrentSlideValid() && (
                <div style={{
                    color: 'var(--warning)',
                    fontSize: '0.85rem',
                    marginTop: '10px',
                    textAlign: 'center',
                    fontWeight: '500'
                }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '14px', verticalAlign: 'middle', marginRight: '4px' }}>warning</span>
                    Por favor complete todos los campos obligatorios (*)
                </div>
            )}

            <div className="carousel-navigation">
                <div className="carousel-dots">
                    {Array.from({ length: totalSlides }).map((_, index) => (
                        <span
                            key={index}
                            className={`carousel-dot ${currentSlide === index ? 'active' : ''}`}
                            onClick={() => setCurrentSlide(index)}
                        ></span>
                    ))}
                </div>
                <div className="carousel-actions">
                    <button
                        type="button"
                        className="carousel-button"
                        onClick={prevSlide}
                        disabled={currentSlide === 0}
                    >
                        Anterior
                    </button>
                    {currentSlide < totalSlides - 1 ? (
                        <button
                            type="button"
                            className="carousel-button"
                            onClick={nextSlide}
                            disabled={!isCurrentSlideValid()}
                            style={{ opacity: !isCurrentSlideValid() ? 0.5 : 1 }}
                        >
                            Siguiente
                        </button>
                    ) : (
                        <button
                            type="button"
                            className="carousel-button"
                            onClick={handleSubmit}
                            disabled={isLoading || !isCurrentSlideValid()}
                            style={{ opacity: (isLoading || !isCurrentSlideValid()) ? 0.5 : 1 }}
                        >
                            {isLoading ? 'Registrando...' : 'Registrar'}
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={closeModal}
                        style={{ background: '#f0f0f0', color: '#333' }}
                        className="carousel-button"
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        </form>
    );
};

export default RegistrationForm;
