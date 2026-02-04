import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import './css/Horarios.css';

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
                    { headers: token ? { Authorization: `Bearer ${token}` } : {} }
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
            <div className="loading-container" style={{ padding: '4rem', textAlign: 'center' }}>
                <span className="material-symbols-outlined spin" style={{ fontSize: '2.5rem', color: '#137fec' }}>progress_activity</span>
                <p style={{ marginTop: '1rem', color: '#64748b' }}>Cargando materias...</p>
            </div>
        );
    }

    return (
        <div className="horarios-subjects-grid">
            {materias.length === 0 ? (
                <div className="no-data" style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '4rem', color: '#cbd5e1', marginBottom: '1rem' }}>book_off</span>
                    <p style={{ color: '#64748b' }}>No hay materias registradas.</p>
                </div>
            ) : (
                materias.map((materia) => (
                    <div key={materia.id} className="horario-subject-card">
                        <div className="subject-card-header">
                            <div className="subject-card-icon">
                                <span className="material-symbols-outlined">book</span>
                            </div>
                            <div className="subject-card-info">
                                <h3>{materia.nombre}</h3>
                                <p>{materia.descripcion || 'Sin descripción'}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                setShowAsignarHorario(true);
                                setMateria(materia.id);
                            }}
                            className="btn-assign-horario"
                        >
                            <span className="material-symbols-outlined">schedule</span>
                            Asignar Horario
                        </button>
                    </div>
                ))
            )}
        </div>
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
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
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
                    { headers: token ? { Authorization: `Bearer ${token}` } : {} }
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
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            alert('Horario asignado correctamente.');
            onClose();
        } catch (error) {
            console.error('Error al registrar horario:', error);
            alert('Error al registrar el horario.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;
    return (
        <div className="modal-overlay" onClick={onClose} style={{ backdropFilter: 'blur(10px)', backgroundColor: 'rgba(15, 23, 42, 0.4)' }}>
            <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{
                maxWidth: '650px',
                width: '90%',
                borderRadius: '28px',
                overflow: 'hidden',
                border: 'none',
                boxShadow: '0 30px 60px -12px rgba(0, 0, 0, 0.25)',
                background: '#f1f5f9',
                maxHeight: '90vh',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <div className="modal-header" style={{
                    background: '#f8fafc',
                    borderBottom: '1px solid #e2e8f0',
                    padding: '1.75rem 2rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexShrink: 0
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{
                            width: '42px',
                            height: '42px',
                            borderRadius: '12px',
                            background: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--primary)',
                            boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
                            border: '1px solid #e2e8f0'
                        }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>schedule</span>
                        </div>
                        <h3 style={{ margin: 0, fontFamily: 'Outfit', fontWeight: '800', fontSize: '1.5rem', color: '#0f172a', letterSpacing: '-0.02em' }}>
                            Asignar Horario
                        </h3>
                    </div>
                    <button className="close-btn" onClick={onClose} title="Cerrar" style={{ background: '#ffffff', color: '#64748b', width: '36px', height: '36px', border: '1px solid #e2e8f0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
                    </button>
                </div>

                <div className="modal-body" style={{ padding: '2rem', overflowY: 'auto', flex: 1 }}>
                    <div style={{ background: 'white', padding: '2rem', borderRadius: '24px', boxShadow: '0 4px 20px -5px rgba(0, 0, 0, 0.05)', border: '1px solid #ffffff' }}>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group-horario" style={{ marginBottom: '1.5rem' }}>
                                <label htmlFor="dia_semana" style={{ display: 'block', marginBottom: '8px', fontWeight: '700', color: '#4b5563', fontSize: '0.9rem' }}>Día de la Semana *</label>
                                <div className="select-horario-wrapper" style={{ position: 'relative' }}>
                                    <span className="material-symbols-outlined" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '20px', pointerEvents: 'none' }}>calendar_today</span>
                                    <select
                                        id="dia_semana"
                                        name="dia_semana"
                                        value={formData.dia_semana || ''}
                                        onChange={handleInputChange}
                                        required
                                        style={{ width: '100%', padding: '12px 12px 12px 42px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '1rem', outline: 'none', appearance: 'none' }}
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

                            <div className="form-grid-horario" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                                <div className="form-group-horario">
                                    <label htmlFor="hora_inicio" style={{ display: 'block', marginBottom: '8px', fontWeight: '700', color: '#4b5563', fontSize: '0.9rem' }}>Hora de Inicio *</label>
                                    <div className="input-horario-wrapper" style={{ position: 'relative' }}>
                                        <span className="material-symbols-outlined" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '20px', pointerEvents: 'none' }}>schedule</span>
                                        <input
                                            type="time"
                                            id="hora_inicio"
                                            name="hora_inicio"
                                            value={formData.hora_inicio || ''}
                                            onChange={handleInputChange}
                                            min="06:00"
                                            required
                                            style={{ width: '100%', padding: '12px 12px 12px 42px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '1rem', outline: 'none' }}
                                        />
                                    </div>
                                </div>
                                <div className="form-group-horario">
                                    <label htmlFor="hora_fin" style={{ display: 'block', marginBottom: '8px', fontWeight: '700', color: '#4b5563', fontSize: '0.9rem' }}>Hora de Fin *</label>
                                    <div className="input-horario-wrapper" style={{ position: 'relative' }}>
                                        <span className="material-symbols-outlined" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '20px', pointerEvents: 'none' }}>schedule</span>
                                        <input
                                            type="time"
                                            id="hora_fin"
                                            name="hora_fin"
                                            value={formData.hora_fin || ''}
                                            onChange={handleInputChange}
                                            max="18:00"
                                            required
                                            style={{ width: '100%', padding: '12px 12px 12px 42px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '1rem', outline: 'none' }}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="form-group-horario" style={{ marginBottom: '1.5rem' }}>
                                <label htmlFor="grado_seccion" style={{ display: 'block', marginBottom: '8px', fontWeight: '700', color: '#4b5563', fontSize: '0.9rem' }}>Grado y Sección *</label>
                                <div className="select-horario-wrapper" style={{ position: 'relative' }}>
                                    <span className="material-symbols-outlined" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '20px', pointerEvents: 'none' }}>school</span>
                                    <select
                                        id="grado_seccion"
                                        name="grado_seccion"
                                        value={formData.grado_seccion || ''}
                                        onChange={handleInputChange}
                                        required
                                        style={{ width: '100%', padding: '12px 12px 12px 42px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '1rem', outline: 'none', appearance: 'none' }}
                                    >
                                        <option value="">Seleccione el grado y sección</option>
                                        <optgroup label="Primaria">
                                            {primaria.map((grado) => (
                                                <option key={grado.id} value={grado.id}>
                                                    {grado.grado}° Grado {grado.seccion}
                                                </option>
                                            ))}
                                        </optgroup>
                                        <optgroup label="Secundaria">
                                            {secundaria.map((grado) => (
                                                <option key={grado.id} value={grado.id}>
                                                    {grado.grado}° Año {grado.seccion}
                                                </option>
                                            ))}
                                        </optgroup>
                                    </select>
                                </div>
                            </div>

                            <div className="form-group-horario" style={{ marginBottom: '2rem' }}>
                                <label htmlFor="profesor" style={{ display: 'block', marginBottom: '8px', fontWeight: '700', color: '#4b5563', fontSize: '0.9rem' }}>Profesor *</label>
                                <div className="select-horario-wrapper" style={{ position: 'relative' }}>
                                    <span className="material-symbols-outlined" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '20px', pointerEvents: 'none' }}>person</span>
                                    <select
                                        id="profesor"
                                        name="profesor"
                                        value={formData.profesor || ''}
                                        onChange={handleInputChange}
                                        required
                                        style={{ width: '100%', padding: '12px 12px 12px 42px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '1rem', outline: 'none', appearance: 'none' }}
                                    >
                                        <option value="">Seleccione el profesor</option>
                                        {profesores.map((profesor) => (
                                            <option key={profesor.id} value={profesor.id}>
                                                {profesor.nombre} {profesor.apellido} - {profesor.cedula}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '1rem' }}>
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={onClose}
                                    style={{ borderRadius: '14px', padding: '0.8rem 2rem', fontWeight: '700', fontFamily: 'Outfit', fontSize: '0.95rem', background: '#f1f5f9', color: '#64748b', border: 'none', cursor: 'pointer' }}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={isSubmitting}
                                    style={{ borderRadius: '14px', padding: '0.8rem 2.5rem', fontWeight: '700', fontFamily: 'Outfit', fontSize: '1rem', background: '#0f172a', color: 'white', border: 'none', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                >
                                    {isSubmitting ? 'Asignando...' : 'Asignar Horario'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export function Horarios() {
    const [showAsignarHorario, setShowAsignarHorario] = useState(false);
    const [materia, setmateria] = useState(null);

    return (
        <div className="horarios-container">
            <div className="horarios-header">
                <h1>Asignar Horarios</h1>
                <p>Gestiona los horarios de las materias del sistema</p>
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
        </div>
    );
}
