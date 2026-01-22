import { useState } from 'react';

const InputField = ({ id, name, label, type = 'text', value, onChange, required = false, placeholder, error, icon, children, ...props }) => (
    <div className="form-group" style={{ margin: 0 }}>
        <label htmlFor={id} style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px', fontWeight: '600', color: 'var(--dark)', fontSize: '0.85rem' }}>
            {icon && <i className={`fas ${icon}`} style={{ fontSize: '0.7rem', color: 'var(--primary)' }}></i>}
            {label} {required && '*'}
        </label>
        {children ? (
            children
        ) : (
            <input
                type={type}
                id={id}
                name={name}
                value={value || ''}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                style={{
                    width: '100%',
                    padding: '8px 10px',
                    border: `2px solid ${error ? 'var(--danger)' : 'var(--light-gray)'}`,
                    borderRadius: 'var(--border-radius)',
                    fontSize: '0.9rem',
                    background: 'white',
                    color: 'var(--dark)',
                }}
                {...props}
            />
        )}
        {error && <span style={{ color: 'var(--danger)', fontSize: '0.85rem', marginTop: '5px', display: 'block' }}>{error}</span>}
    </div>
);

const RegistrationForm = ({ formData, errors, isLoading, handleInputChange, handleSubmit, closeModal, role, calcularEdad }) => {
    const [currentSlide, setCurrentSlide] = useState(0);

    const getSlides = () => {
        const edad = formData.fecha_nacimiento ? calcularEdad(formData.fecha_nacimiento) : null;

        const commonSlide1 = [
            <InputField key="nombre" id="nombre" name="nombre" label="Nombres" value={formData.nombre} onChange={handleInputChange} required icon="fa-user" placeholder="Nombres" />,
            <InputField key="apellido" id="apellido" name="apellido" label="Apellidos" value={formData.apellido} onChange={handleInputChange} required icon="fa-user" placeholder="Apellidos" />,
        ];
        
        const commonSlide2 = [
            <InputField key="email" id="email" name="email" label="Email" type="email" value={formData.email} onChange={handleInputChange} required icon="fa-envelope" placeholder="ejemplo@correo.com" />,
            <InputField key="password" id="password" name="password" label="Contraseña" type="password" value={formData.password} onChange={handleInputChange} required icon="fa-lock" placeholder="Mín. 8 caracteres" error={errors.password} />,
        ];

        switch (role) {
            case 'estudiante':
                const slidesEstudiante = [
                    [ // Slide 1
                        ...commonSlide1, // nombre, apellido
                        <InputField key="fecha_nacimiento" id="fecha_nacimiento" name="fecha_nacimiento" label="Fecha de Nacimiento" type="date" value={formData.fecha_nacimiento} onChange={handleInputChange} required icon="fa-calendar-alt" max={new Date().toISOString().split('T')[0]} />,
                        <InputField key="nivel" id="nivel" name="nivel" label="Nivel" value={formData.nivel} onChange={handleInputChange} required icon="fa-layer-group">
                            <select id="nivel" name="nivel" value={formData.nivel || ''} onChange={handleInputChange} required style={{ width: '100%', padding: '8px 10px', border: '2px solid var(--light-gray)', borderRadius: 'var(--border-radius)', fontSize: '0.9rem' }}>
                                <option value="">Seleccione</option>
                                <option value="primaria">Primaria</option>
                                <option value="secundaria">Secundaria</option>
                            </select>
                        </InputField>,
                    ],
                    [ // Slide 2
                        <InputField key="grado" id="grado" name="grado" label={formData.nivel === 'primaria' ? 'Grado' : 'Año'} value={formData.grado} onChange={handleInputChange} required icon="fa-book" disabled={!formData.nivel}>
                            <select id="grado" name="grado" value={formData.grado || ''} onChange={handleInputChange} required disabled={!formData.nivel} style={{ width: '100%', padding: '8px 10px', border: '2px solid var(--light-gray)', borderRadius: 'var(--border-radius)', fontSize: '0.9rem', background: formData.nivel ? 'white' : '#f5f5f5' }}>
                                <option value="">{formData.nivel ? `Seleccione el ${formData.nivel === 'primaria' ? 'grado' : 'año'}` : 'Seleccione nivel'}</option>
                                {formData.nivel === 'primaria' ? Array.from({ length: 6 }, (_, i) => <option key={i+1} value={i + 1}>{i + 1}° Grado</option>) : Array.from({ length: 5 }, (_, i) => <option key={i+1} value={i + 1}>{i + 1}° Año</option>)}
                            </select>
                        </InputField>,
                        <InputField key="seccion" id="seccion" name="seccion" label="Sección" value={formData.seccion} onChange={handleInputChange} required icon="fa-users">
                             <select id="seccion" name="seccion" value={formData.seccion || ''} onChange={handleInputChange} required style={{ width: '100%', padding: '8px 10px', border: '2px solid var(--light-gray)', borderRadius: 'var(--border-radius)', fontSize: '0.9rem' }}>
                                <option value="">Seleccione</option>
                                <option value="A">A</option><option value="B">B</option><option value="C">C</option>
                            </select>
                        </InputField>,
                        <InputField key="direccion" id="direccion" name="direccion" label="Dirección" value={formData.direccion} onChange={handleInputChange} required icon="fa-map-marker-alt" placeholder="Dirección completa" />,
                        <InputField key="foto" id="foto" name="foto" label="Foto de Perfil" type="file" onChange={handleInputChange} icon="fa-camera" accept="image/*" />, // Added to second slide
                    ]
                ];
                
                const finalSlideEstudiante = [];
                if (edad !== null && edad >= 9) {
                    finalSlideEstudiante.push(<InputField key="cedula" id="cedula" name="cedula" label="Cédula" value={formData.cedula} onChange={handleInputChange} required icon="fa-id-card" placeholder="V12345678" error={errors.cedula} />);
                }
                if (formData.nivel === 'secundaria') {
                    finalSlideEstudiante.push(...commonSlide2); // email, password
                }
                if(finalSlideEstudiante.length > 0) slidesEstudiante.push(finalSlideEstudiante);

                return slidesEstudiante;

            case 'profesor':
                return [
                    [...commonSlide1, ...commonSlide2],
                    [
                        <InputField key="cedula" id="cedula" name="cedula" label="Cédula" value={formData.cedula} onChange={handleInputChange} required icon="fa-id-card" placeholder="V12345678" error={errors.cedula} />,
                        <InputField key="fecha_nacimiento" id="fecha_nacimiento" name="fecha_nacimiento" label="Fecha de Nacimiento" type="date" value={formData.fecha_nacimiento} onChange={handleInputChange} required icon="fa-calendar-alt" max={new Date().toISOString().split('T')[0]} />,
                        <InputField key="telefono" id="telefono" name="telefono" label="Teléfono" value={formData.telefono} onChange={handleInputChange} required icon="fa-phone" placeholder="0412-1234567" />,
                        <InputField key="direccion" id="direccion" name="direccion" label="Dirección" value={formData.direccion} onChange={handleInputChange} required icon="fa-map-marker-alt" placeholder="Dirección completa" />,
                    ],
                    [
                        <InputField key="tipo_profesor" id="tipo_profesor" name="tipo_profesor" label="Tipo de Profesor" value={formData.tipo_profesor} onChange={handleInputChange} required icon="fa-user-tie">
                            <select id="tipo_profesor" name="tipo_profesor" value={formData.tipo_profesor || ''} onChange={handleInputChange} required style={{ width: '100%', padding: '8px 10px', border: '2px solid var(--light-gray)', borderRadius: 'var(--border-radius)', fontSize: '0.9rem' }}>
                                <option value="">Seleccione</option>
                                <option value="titular">Titular</option>
                                <option value="suplente">Suplente</option>
                                <option value="especialista">Especialista</option>
                            </select>
                        </InputField>,
                        <InputField key="foto" id="foto" name="foto" label="Foto de Perfil" type="file" onChange={handleInputChange} icon="fa-camera" accept="image/*" />,
                    ]
                ];
            case 'representante':
                return [
                     [...commonSlide1, ...commonSlide2],
                     [
                        <InputField key="cedula" id="cedula" name="cedula" label="Cédula" value={formData.cedula} onChange={handleInputChange} required icon="fa-id-card" placeholder="V12345678" error={errors.cedula} />,
                        <InputField key="fecha_nacimiento" id="fecha_nacimiento" name="fecha_nacimiento" label="Fecha de Nacimiento" type="date" value={formData.fecha_nacimiento} onChange={handleInputChange} required icon="fa-calendar-alt" max={new Date().toISOString().split('T')[0]} />,
                        <InputField key="telefono" id="telefono" name="telefono" label="Teléfono" value={formData.telefono} onChange={handleInputChange} required icon="fa-phone" placeholder="0412-1234567" />,
                        <InputField key="direccion" id="direccion" name="direccion" label="Dirección" value={formData.direccion} onChange={handleInputChange} required icon="fa-map-marker-alt" placeholder="Dirección completa" />,
                        <InputField key="foto" id="foto" name="foto" label="Foto de Perfil" type="file" onChange={handleInputChange} icon="fa-camera" accept="image/*" />,
                     ]
                ];
            case 'administrador':
                return [
                    [...commonSlide1, ...commonSlide2], // Slide 1
                    [ // Slide 2
                        <InputField key="foto" id="foto" name="foto" label="Foto de Perfil" type="file" onChange={handleInputChange} icon="fa-camera" accept="image/*" />,
                    ]
                ];
            default:
                return [];
        }
    };

    const slides = getSlides();
    const totalSlides = slides.length;

    const nextSlide = () => setCurrentSlide(prev => Math.min(prev + 1, totalSlides - 1));
    const prevSlide = () => setCurrentSlide(prev => Math.max(prev - 1, 0));

    return (
        <form onSubmit={handleSubmit} noValidate encType="multipart/form-data" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div className="carousel-container" style={{ flex: 1 }}>
                <div className="carousel-track" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
                    {slides.map((slide, index) => (
                        <div className="carousel-slide" key={index}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px' }}>
                                {slide}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {errors.submit && (
                <div style={{ padding: '10px', background: '#fee', border: '1px solid #fcc', borderRadius: 'var(--border-radius)', color: '#c33', fontSize: '0.85rem', marginTop: '15px' }}>
                    {errors.submit}
                </div>
            )}

            <div className="carousel-navigation">
                <div className="carousel-dots">
                    {Array.from({ length: totalSlides }).map((_, index) => (
                        <span key={index} className={`carousel-dot ${currentSlide === index ? 'active' : ''}`} onClick={() => setCurrentSlide(index)}></span>
                    ))}
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button type="button" className="carousel-button" onClick={prevSlide} disabled={currentSlide === 0}>Anterior</button>
                    {currentSlide < totalSlides - 1 ? (
                        <button type="button" className="carousel-button" onClick={nextSlide}>Siguiente</button>
                    ) : (
                        <button type="submit" className="carousel-button" disabled={isLoading}>
                            {isLoading ? 'Registrando...' : 'Registrar'}
                        </button>
                    )}
                     <button type="button" onClick={closeModal} style={{ background: '#f0f0f0', color: '#333' }} className="carousel-button">Cancelar</button>
                </div>
            </div>
        </form>
    );
};

export default RegistrationForm;
