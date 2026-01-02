import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function ListaMaterias({ setShowAsignarHorario, setMateria }) {
    const [materias, setMaterias] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchMaterias = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('accessToken');
                const response = await axios.get(
                    `${API_URL}/horarios/materias/`,
                    {
                        headers: token ? { Authorization: `Bearer ${token}` } : {}
                    }
                );
                setMaterias(response.data);
            } catch (error) {
                console.error('Error fetching materias:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchMaterias();
    }, []);

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '50px',
                color: 'var(--gray)'
            }}>
                Cargando materias...
            </div>
        );
    }

    return (
        <>
            {materias.length === 0 ? (
                <div className="section-card" style={{textAlign: 'center', padding: '40px'}}>
                    <p style={{color: 'var(--gray)', fontSize: '1rem'}}>No hay materias registradas.</p>
                </div>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: '20px'
                }}>
                    {materias.map((materia) => (
                        <div 
                            key={materia.id} 
                            style={{
                                background: 'white',
                                border: '1px solid var(--light-gray)',
                                borderRadius: 'var(--border-radius)',
                                padding: '20px',
                                transition: 'var(--transition)',
                                position: 'relative'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.boxShadow = 'var(--box-shadow)';
                                e.currentTarget.style.transform = 'translateY(-3px)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.boxShadow = 'none';
                                e.currentTarget.style.transform = 'translateY(0)';
                            }}
                        >
                            <div style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                justifyContent: 'space-between',
                                marginBottom: '15px'
                            }}>
                                <div style={{flex: 1}}>
                                    <h3 style={{
                                        fontSize: '1.2rem',
                                        fontWeight: '600',
                                        color: 'var(--dark)',
                                        marginBottom: '8px'
                                    }}>
                                        {materia.nombre}
                                    </h3>
                                    <p style={{
                                        color: 'var(--gray)',
                                        fontSize: '0.9rem',
                                        margin: 0,
                                        lineHeight: '1.5'
                                    }}>
                                        {materia.descripcion || 'Sin descripción'}
                                    </p>
                                </div>
                                <div style={{
                                    width: '45px',
                                    height: '45px',
                                    borderRadius: '12px',
                                    background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    flexShrink: 0,
                                    marginLeft: '15px',
                                    lineHeight: '1'
                                }}>
                                    <i className="fas fa-book" style={{
                                        fontSize: '0.85rem',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        lineHeight: '1',
                                        margin: '0',
                                        padding: '0'
                                    }}></i>
                                </div>
                        </div>
                        <button
                            onClick={() => {
                                setShowAsignarHorario(true);
                                setMateria(materia.id);
                            }}
                                style={{
                                    width: '100%',
                                    padding: '10px 16px',
                                    fontSize: '0.85rem',
                                    background: 'var(--primary)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: 'var(--border-radius-sm)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '6px',
                                    transition: 'var(--transition)',
                                    lineHeight: '1',
                                    fontWeight: '500'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'var(--primary-dark)';
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(67, 97, 238, 0.3)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'var(--primary)';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            >
                                <i className="fas fa-clock" style={{
                                    fontSize: '0.75rem',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    lineHeight: '1',
                                    margin: '0',
                                    padding: '0'
                                }}></i>
                            Asignar Horario
                        </button>
                    </div>
                    ))}
                </div>
            )}
        </>
    );
}

function AsignarHorario({ isOpen, materia, onClose }) {
    const [formData, setFormData] = useState({});
    const [grados, setGrados] = useState([]);
    const [loading, setLoading] = useState(true);
    const [profesores, setProfesores] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    useEffect(() => {
        const fetchGrados = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('accessToken');
                const response = await axios.get(`${API_URL}/grado-seccion/`, {
                    headers: token ? { Authorization: `Bearer ${token}` } : {}
                });
                setGrados(response.data);
            } catch (error) {
                console.error('Error fetching grados:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchGrados();
    }, []);

    useEffect(() => {
        const fetchProfesores = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('accessToken');
                const response = await axios.get(
                    `${API_URL}/usuarios/profesor/`,
                    {
                        headers: token ? { Authorization: `Bearer ${token}` } : {}
                    }
                );
                setProfesores(response.data);
            } catch (error) {
                console.error('Error fetching profesores:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfesores();
    }, []);

    const primaria = useMemo(
        () => grados.filter((grado) => grado.nivel === 'primaria'),
        [grados]
    );
    const secundaria = useMemo(
        () => grados.filter((grado) => grado.nivel === 'secundaria'),
        [grados]
    );

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        const token = localStorage.getItem('accessToken');
        
        try {
            const formDataObj = new FormData();
            formDataObj.append('materia', materia);
            formDataObj.append('dia_semana', formData.dia_semana);
            formDataObj.append('hora_inicio', formData.hora_inicio);
            formDataObj.append('hora_fin', formData.hora_fin);
            formDataObj.append('grado_seccion', formData.grado_seccion);
            formDataObj.append('profesor', formData.profesor);

            await axios.post(`${API_URL}/horarios/`, formDataObj, {
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            });
            alert('Horario asignado correctamente.');
            onClose();
            window.location.reload();
        } catch (error) {
            console.error('Error al registrar horario:', error);
            alert('Error al registrar el horario.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;
    return (
        <div className="modal" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3 className="modal-title">Asignar Horario</h3>
                    <button className="close-modal" onClick={onClose}>&times;</button>
                </div>
                <div className="modal-body">
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="dia_semana" style={{fontSize: '0.95rem'}}>
                                Día de la Semana *
                            </label>
                            <div className="input-with-icon">
                                <i className="fas fa-calendar-day" style={{fontSize: '0.8rem'}}></i>
                                <select
                                    id="dia_semana"
                                    name="dia_semana"
                                    value={formData.dia_semana || ''}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">Seleccione el día</option>
                                    <option value="lunes">Lunes</option>
                                    <option value="martes">Martes</option>
                                    <option value="miercoles">Miércoles</option>
                                    <option value="jueves">Jueves</option>
                                    <option value="viernes">Viernes</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-grid">
                            <div className="form-group">
                                <label htmlFor="hora_inicio" style={{fontSize: '0.95rem'}}>
                                    Hora de Inicio *
                                </label>
                                <div className="input-with-icon">
                                    <i className="fas fa-clock" style={{fontSize: '0.8rem'}}></i>
                                    <input
                                        type="time"
                                        id="hora_inicio"
                                        name="hora_inicio"
                                        value={formData.hora_inicio || ''}
                                        onChange={handleInputChange}
                                        min="06:00"
                                        required
                                    />
                </div>
                    </div>

                            <div className="form-group">
                                <label htmlFor="hora_fin" style={{fontSize: '0.95rem'}}>
                                    Hora de Fin *
                                </label>
                                <div className="input-with-icon">
                                    <i className="fas fa-clock" style={{fontSize: '0.8rem'}}></i>
                            <input
                                        type="time"
                                        id="hora_fin"
                                        name="hora_fin"
                                        value={formData.hora_fin || ''}
                                        onChange={handleInputChange}
                                        max="18:00"
                                required
                            />
                                </div>
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="grado_seccion" style={{fontSize: '0.95rem'}}>
                                Grado y Sección *
                            </label>
                            <div className="input-with-icon">
                                <i className="fas fa-graduation-cap" style={{fontSize: '0.8rem'}}></i>
                                <select
                                    id="grado_seccion"
                                    name="grado_seccion"
                                    value={formData.grado_seccion || ''}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">Seleccione el grado y sección</option>
                                    <optgroup label="Primaria">
                                        {primaria.length === 0 ? (
                                            <option value="" disabled>No hay grados cargados</option>
                                        ) : (
                                            primaria.map((grado) => (
                                                <option key={grado.id} value={grado.id}>
                                                    {grado.grado}° Grado {grado.seccion}
                                                </option>
                                            ))
                                        )}
                                    </optgroup>
                                    <optgroup label="Secundaria">
                                        {secundaria.length === 0 ? (
                                            <option value="" disabled>No hay años cargados</option>
                                        ) : (
                                            secundaria.map((grado) => (
                                                <option key={grado.id} value={grado.id}>
                                                    {grado.grado}° Año {grado.seccion}
                                                </option>
                                            ))
                                        )}
                                    </optgroup>
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="profesor" style={{fontSize: '0.95rem'}}>
                                Profesor *
                            </label>
                            <div className="input-with-icon">
                                <i className="fas fa-chalkboard-teacher" style={{fontSize: '0.8rem'}}></i>
                                <select
                                    id="profesor"
                                    name="profesor"
                                    value={formData.profesor || ''}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">Seleccione el profesor</option>
                                    {profesores.length === 0 ? (
                                        <option value="" disabled>No hay profesores cargados</option>
                                    ) : (
                                        profesores.map((profesor) => (
                                            <option key={profesor.id} value={profesor.id}>
                                                {profesor.nombre} {profesor.apellido} - {profesor.cedula}
                                            </option>
                                        ))
                                    )}
                                </select>
                        </div>
                    </div>

                        <div style={{marginTop: '25px', display: 'flex', justifyContent: 'flex-end', gap: '12px'}}>
                            <button 
                                type="button" 
                                className="btn btn-secondary"
                                onClick={onClose}
                                style={{width: 'auto', padding: '12px 24px', fontSize: '0.9rem'}}
                            >
                                Cancelar
                            </button>
                            <button 
                                type="submit" 
                                className="btn btn-primary"
                                disabled={isSubmitting}
                                style={{width: 'auto', padding: '12px 30px', fontSize: '0.9rem'}}
                            >
                                {isSubmitting ? 'Asignando...' : 'Asignar Horario'}
                    </button>
                        </div>
                </form>
                </div>
            </div>
        </div>
    );
}

export function Horarios() {
    const [showAsignarHorario, setShowAsignarHorario] = useState(false);
    const [materia, setmateria] = useState(null);

    return (
        <>
            <div className="header">
                <div className="page-title">
                    <h1>Asignar Horarios</h1>
                    <p>Gestiona los horarios de las materias del sistema</p>
                </div>
            </div>

            <ListaMaterias
                setShowAsignarHorario={setShowAsignarHorario}
                setMateria={setmateria}
            />
            
            {showAsignarHorario && (
            <AsignarHorario
                isOpen={showAsignarHorario}
                materia={materia}
                onClose={() => {
                    setShowAsignarHorario(false);
                    setmateria(null);
                }}
            />
            )}
        </>
    );
}
