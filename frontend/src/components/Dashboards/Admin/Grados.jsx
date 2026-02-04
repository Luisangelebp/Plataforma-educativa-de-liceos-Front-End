import { useEffect, useState, useMemo } from 'react';
import { Spin } from 'antd';
import axios from 'axios';
import { useNotification } from '../../../context/NotificationContext';
import './css/Grados.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function ListaGrados({ setShowHorario }) {
    const [grados, setGrados] = useState([]);
    const [loading, setLoading] = useState(true);
    const [busquedaTexto, setBusquedaTexto] = useState('');
    const [selectedGrade, setSelectedGrade] = useState(null); // { nivel, grado }

    useEffect(() => {
        const fetchGrados = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`${API_URL}/grado-seccion/`);
                setGrados(response.data);
            } catch (error) {
                console.error('Error fetching grados:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchGrados();
    }, []);

    // Función para filtrar grados


    // Obtener lista de grados únicos agrupados por nivel
    const gradosAgrupados = useMemo(() => {
        const agrupar = (nivel) => {
            const nivelGrados = grados.filter(g => g.nivel === nivel);
            const unicos = [...new Set(nivelGrados.map(g => g.grado))].sort((a, b) => Number(a) - Number(b));

            return unicos.map(gradoNum => {
                const secciones = nivelGrados.filter(g => g.grado === gradoNum);
                return {
                    grado: gradoNum,
                    nivel: nivel,
                    cantidadSecciones: secciones.length,
                    id: `${nivel}-${gradoNum}`
                };
            });
        };

        return {
            primaria: agrupar('primaria'),
            secundaria: agrupar('secundaria')
        };
    }, [grados]);

    // Filtrar secciones para el grado seleccionado
    const seccionesFiltradas = useMemo(() => {
        if (!selectedGrade) return [];
        let filtrados = grados.filter(g =>
            g.nivel === selectedGrade.nivel &&
            g.grado.toString() === selectedGrade.grado.toString()
        );

        if (busquedaTexto) {
            const search = busquedaTexto.toLowerCase();
            filtrados = filtrados.filter(g =>
                g.seccion.toLowerCase().includes(search)
            );
        }

        return filtrados;
    }, [grados, selectedGrade, busquedaTexto]);

    const handleDelete = async (grado) => {
        if (confirm(`¿Eliminar la sección ${grado.seccion} de ${grado.grado}° ${grado.nivel === 'primaria' ? 'Grado' : 'Año'}?`)) {
            try {
                await axios.delete(`${API_URL}/grado-seccion/${grado.id}/`);
                setGrados(grados.filter((m) => m.id !== grado.id));
            } catch (error) {
                console.error('Error al eliminar el grado:', error);
            }
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <span className="material-symbols-outlined spin text-primary" style={{ fontSize: '2rem' }}>progress_activity</span>
            </div>
        );
    }

    const GradeCard = ({ level, num, count, isActive, onClick }) => {
        // Imágenes placeholder según grado
        const images = {
            '1': 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=400&q=80',
            '2': 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=400&q=80',
            '3': 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=400&q=80',
            '4': 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=400&q=80',
            '5': 'https://images.unsplash.com/photo-1454165833221-d726baf59674?auto=format&fit=crop&w=400&q=80',
            '6': 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=400&q=80'
        };

        return (
            <div className={`grade-card ${isActive ? 'active' : ''}`} onClick={onClick}>
                <div className="grade-card-badge">
                    <span className="grade-number">{num}°</span>
                    <div className="grade-check">
                        <span className="material-symbols-outlined">check</span>
                    </div>
                </div>
                <div className="grade-card-content">
                    <h4>{num}° {level === 'primaria' ? 'Grado' : 'Año'}</h4>
                    <div className="grade-stats">
                        <div className="grade-stat-item">
                            <span className="material-symbols-outlined">grid_view</span>
                            {count} Secciones
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="grados-container">
            {/* Listado de Grados - Primaria */}
            {gradosAgrupados.primaria.length > 0 && (
                <div className="level-section">
                    <div className="level-section-header">
                        <h3>Primaria</h3>
                    </div>
                    <div className="grade-grid">
                        {gradosAgrupados.primaria.map(g => (
                            <GradeCard
                                key={g.id}
                                num={g.grado}
                                level={g.nivel}
                                count={g.cantidadSecciones}
                                isActive={selectedGrade?.id === g.id}
                                onClick={() => setSelectedGrade(selectedGrade?.id === g.id ? null : g)}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Listado de Grados - Secundaria */}
            {gradosAgrupados.secundaria.length > 0 && (
                <div className="level-section">
                    <div className="level-section-header">
                        <h3>Secundaria</h3>
                    </div>
                    <div className="grade-grid">
                        {gradosAgrupados.secundaria.map(g => (
                            <GradeCard
                                key={g.id}
                                num={g.grado}
                                level={g.nivel}
                                count={g.cantidadSecciones}
                                isActive={selectedGrade?.id === g.id}
                                onClick={() => setSelectedGrade(selectedGrade?.id === g.id ? null : g)}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Detalle de Secciones del Grado Seleccionado */}
            {selectedGrade && (
                <div className="sections-detail-view">
                    <div className="sections-detail-header">
                        <h3>Secciones - {selectedGrade.grado}° {selectedGrade.nivel === 'primaria' ? 'Grado' : 'Año'}</h3>
                    </div>
                    <div className="sections-list-container">
                        {seccionesFiltradas.length > 0 ? (
                            seccionesFiltradas.map(sec => (
                                <div key={sec.id} className="section-item">
                                    <div className="section-item-left">
                                        <div className="section-avatar">{sec.seccion}</div>
                                        <div className="section-info">
                                            <p className="section-name">Sección {sec.seccion}</p>
                                            <p className="section-teacher">ID de Grado: {sec.id}</p>
                                        </div>
                                    </div>
                                    <div className="section-item-right">
                                        <div className="section-actions">
                                            <button
                                                className="btn-icon"
                                                title="Ver Horario"
                                                onClick={() => setShowHorario(sec)}
                                            >
                                                <span className="material-symbols-outlined">schedule</span>
                                            </button>
                                            <button
                                                className="btn-icon delete"
                                                title="Eliminar"
                                                onClick={() => handleDelete(sec)}
                                            >
                                                <span className="material-symbols-outlined">delete</span>
                                            </button>
                                        </div>

                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center text-slate-400">
                                No se encontraron secciones que coincidan con la búsqueda.
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

const RegistrarGrado = ({ isOpen, onClose }) => {
    // Lógica para registrar una nueva materia
    const { addNotification } = useNotification();
    const [formData, setFormData] = useState({});
    const [existingSections, setExistingSections] = useState([]);

    useEffect(() => {
        if (isOpen) {
            const fetchSections = async () => {
                try {
                    const response = await axios.get(`${API_URL}/grado-seccion/`);
                    setExistingSections(response.data);
                } catch (error) {
                    console.error('Error fetching sections for validation:', error);
                }
            };
            fetchSections();
        }
    }, [isOpen]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => {
            const newData = {
                ...prev,
                [name]: value,
            };
            // Si cambia el nivel, limpiar el grado seleccionado
            if (name === 'nivel') {
                newData.grado = '';
            }
            return newData;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validación de duplicados
        const isDuplicate = existingSections.some(sec =>
            sec.nivel === formData.nivel &&
            sec.grado.toString() === formData.grado.toString() &&
            sec.seccion === formData.seccion
        );

        if (isDuplicate) {
            addNotification(
                `La Sección ${formData.seccion} para el ${formData.grado}° ${formData.nivel === 'primaria' ? 'Grado' : 'Año'} ya existe.`,
                'error'
            );
            return;
        }

        const formDataObj = new FormData();
        for (const key in formData) {
            formDataObj.append(key, formData[key]);
        }

        try {
            await axios.post(`${API_URL}/grado-seccion/`, formDataObj);
            addNotification('Grado y Sección registrados con éxito', 'success');
            onClose();
            window.location.reload(); // Recargar la página para actualizar la lista
        } catch (error) {
            console.error('Error al registrar materia:', error);
            addNotification('Error al registrar la sección. Intente nuevamente.', 'error');
        }
    };

    if (!isOpen) return null;
    return (
        <div className="modal-overlay" onClick={onClose} style={{ backdropFilter: 'blur(10px)', backgroundColor: 'rgba(15, 23, 42, 0.4)' }}>
            <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{
                maxWidth: '600px',
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
                            <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>layers</span>
                        </div>
                        <h3 style={{ margin: 0, fontFamily: 'Outfit', fontWeight: '800', fontSize: '1.5rem', color: '#0f172a', letterSpacing: '-0.02em' }}>
                            Registrar Nuevo Grado-Sección
                        </h3>
                    </div>
                    <button className="close-btn" onClick={onClose} title="Cerrar" style={{ background: '#ffffff', color: '#64748b', width: '36px', height: '36px', border: '1px solid #e2e8f0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
                    </button>
                </div>
                <div className="modal-body" style={{ padding: '2rem', overflowY: 'auto', flex: 1 }}>
                    <div style={{ background: 'white', padding: '2rem', borderRadius: '24px', boxShadow: '0 4px 20px -5px rgba(0, 0, 0, 0.05)', border: '1px solid #ffffff' }}>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                                <label
                                    htmlFor="nivel"
                                    style={{ display: 'block', marginBottom: '8px', fontWeight: '700', color: '#4b5563', fontSize: '0.9rem' }}
                                >
                                    Nivel Escolar *
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <span
                                        className="material-symbols-outlined"
                                        style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '20px', pointerEvents: 'none' }}
                                    >layers</span>
                                    <select
                                        id="nivel"
                                        name="nivel"
                                        value={formData.nivel || ''}
                                        onChange={(e) => handleInputChange(e)}
                                        required
                                        style={{ width: '100%', padding: '12px 12px 12px 42px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '1rem', outline: 'none', appearance: 'none' }}
                                    >
                                        <option value="">
                                            Seleccione el nivel escolar
                                        </option>
                                        <option value="primaria">Primaria</option>
                                        <option value="secundaria">
                                            Secundaria
                                        </option>
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                                <div className="form-group">
                                    <label
                                        htmlFor="grado"
                                        style={{ display: 'block', marginBottom: '8px', fontWeight: '700', color: '#4b5563', fontSize: '0.9rem' }}
                                    >
                                        {formData.nivel === 'primaria'
                                            ? 'Grado *'
                                            : formData.nivel === 'secundaria'
                                                ? 'Año *'
                                                : 'Grado/Año *'}
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <span
                                            className="material-symbols-outlined"
                                            style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '20px', pointerEvents: 'none' }}
                                        >book</span>
                                        <select
                                            id="grado"
                                            name="grado"
                                            value={formData.grado || ''}
                                            onChange={(e) => handleInputChange(e)}
                                            required
                                            disabled={!formData.nivel}
                                            style={{ width: '100%', padding: '12px 12px 12px 42px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '1rem', outline: 'none', appearance: 'none' }}
                                        >
                                            <option value="">
                                                {formData.nivel === 'primaria'
                                                    ? 'Seleccione el grado'
                                                    : formData.nivel ===
                                                        'secundaria'
                                                        ? 'Seleccione el año'
                                                        : 'Seleccione primero el nivel'}
                                            </option>
                                            {formData.nivel === 'primaria' ? (
                                                <>
                                                    <option value="1">1° Grado</option>
                                                    <option value="2">2° Grado</option>
                                                    <option value="3">3° Grado</option>
                                                    <option value="4">4° Grado</option>
                                                    <option value="5">5° Grado</option>
                                                    <option value="6">6° Grado</option>
                                                </>
                                            ) : formData.nivel === 'secundaria' ? (
                                                <>
                                                    <option value="1">1° Año</option>
                                                    <option value="2">2° Año</option>
                                                    <option value="3">3° Año</option>
                                                    <option value="4">4° Año</option>
                                                    <option value="5">5° Año</option>
                                                </>
                                            ) : null}
                                        </select>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label
                                        htmlFor="seccion"
                                        style={{ display: 'block', marginBottom: '8px', fontWeight: '700', color: '#4b5563', fontSize: '0.9rem' }}
                                    >
                                        Sección *
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <span
                                            className="material-symbols-outlined"
                                            style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '20px', pointerEvents: 'none' }}
                                        >groups</span>
                                        <select
                                            id="seccion"
                                            name="seccion"
                                            value={formData.seccion || ''}
                                            onChange={(e) => handleInputChange(e)}
                                            required
                                            style={{ width: '100%', padding: '12px 12px 12px 42px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '1rem', outline: 'none', appearance: 'none' }}
                                        >
                                            <option value="">
                                                Seleccione la sección
                                            </option>
                                            <option value="A">Sección A</option>
                                            <option value="B">Sección B</option>
                                            <option value="C">Sección C</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div
                                style={{
                                    marginTop: '30px',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    gap: '12px',
                                }}
                            >
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={onClose}
                                    style={{
                                        borderRadius: '14px',
                                        padding: '0.8rem 2rem',
                                        fontWeight: '700',
                                        fontFamily: 'Outfit',
                                        fontSize: '0.95rem',
                                        background: '#f1f5f9',
                                        color: '#64748b',
                                        border: 'none',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    style={{
                                        borderRadius: '14px',
                                        padding: '0.8rem 2.5rem',
                                        fontWeight: '700',
                                        fontFamily: 'Outfit',
                                        fontSize: '1rem',
                                        background: '#0f172a',
                                        color: 'white',
                                        border: 'none',
                                        cursor: 'pointer',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                    }}
                                >
                                    Registrar Grado
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

const VerHorario = ({ isOpen, onClose, grado }) => {
    const [horario, setHorario] = useState([]);
    const [loading, setLoading] = useState(true);
    const [materias, setMaterias] = useState([]);
    const [profesores, setProfesores] = useState([]);
    useEffect(() => {
        const fetchHorario = async () => {
            if (!grado || !grado.id) return;
            setLoading(true);
            try {
                const response = await axios.get(`${API_URL}/horarios/`);
                if (response.data.length === 0) {
                    setHorario(null);
                } else {
                    setHorario(
                        response.data.filter((h) => h.grado_seccion === grado.id)
                    );
                }
            } catch (error) {
                console.error('Error fetching horario:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchHorario();
    }, [grado]);
    useEffect(() => {
        const fetchMaterias = async () => {
            setLoading(true);
            try {
                const response = await axios.get(
                    `${API_URL}/horarios/materias/`
                );
                setMaterias(response.data);
            } catch (error) {
                console.error('Error fetching materias:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchMaterias();
    }, [horario]);
    useEffect(() => {
        const fetchProfesores = async () => {
            setLoading(true);
            try {
                const response = await axios.get(
                    `${API_URL}/usuarios/profesor/`
                );
                setProfesores(response.data);
            } catch (error) {
                console.error('Error fetching profesores:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfesores();
    }, [horario]);

    const dias = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'];
    const horas = Array.from({ length: 12 }, (_, i) => {
        const h = i + 7; // empieza en 7
        return `${h.toString().padStart(2, '0')}:00`;
    });

    const handleDelete = async (e) => {
        e.preventDefault();
        const claseId = e.target.dataset.id;
        console.log(claseId);
        if (confirm(`¿Eliminar la materia ${claseId}?`)) {
            axios
                .delete(`${API_URL}/horarios/materias/${materia.id}/`)
                .then(() => {
                    alert('Materia eliminada correctamente.');
                    setMaterias(materias.filter((m) => m.id !== materia.id));
                })
                .catch((error) => {
                    console.error('Error al eliminar la materia:', error);
                    alert('Error al eliminar la materia.');
                });
        }
    };

    function Calendario() {
        const getProfesorNombre = (profesorId) => {
            const profesor = profesores.find((p) => p.id === profesorId);
            if (!profesor) return 'N/A';
            return (
                `${profesor.nombre || ''} ${profesor.apellido || ''}`.trim() ||
                'N/A'
            );
        };

        return (
            <div className="calendar-responsive-wrapper">
                <div
                    className="calendar-min-width"
                    style={{
                        border: '1px solid #e2e8f0',
                        borderRadius: '16px',
                        overflow: 'hidden',
                        background: '#f8fafc', // Softer than pure white
                        boxShadow: '0 10px 25px rgba(0,0,0,0.05)'
                    }}
                >
                    {/* Encabezado de días */}
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'minmax(80px, 100px) repeat(5, 1fr)',
                            background: '#1a237e', // Match sidebar for consistency
                            color: 'white',
                            fontWeight: '700',
                            fontSize: '0.85rem',
                            fontFamily: 'Outfit'
                        }}
                    >
                        <div
                            style={{
                                textAlign: 'center',
                                padding: '16px 12px',
                                borderRight: '1px solid rgba(255, 255, 255, 0.1)',
                            }}
                        >
                            Horas
                        </div>
                        {dias.map((dia) => (
                            <div
                                key={dia}
                                style={{
                                    textAlign: 'center',
                                    padding: '16px 12px',
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px',
                                    borderRight:
                                        '1px solid rgba(255, 255, 255, 0.1)',
                                }}
                            >
                                {dia}
                            </div>
                        ))}
                    </div>

                    {/* Filas de horas */}
                    {horas.map((hora) => (
                        <div
                            key={hora}
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'minmax(80px, 100px) repeat(5, 1fr)',
                                borderTop: '1px solid #e2e8f0',
                            }}
                        >
                            <div
                                style={{
                                    textAlign: 'center',
                                    padding: '12px',
                                    background: '#f1f5f9', // Slightly darker than daily cells
                                    fontWeight: '700',
                                    color: '#64748b',
                                    fontSize: '0.8rem',
                                    borderRight: '1px solid #e2e8f0',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                {hora}
                            </div>
                            {dias.map((dia) => {
                                const clase = horario.find(
                                    (h) =>
                                        h.dia_semana === dia &&
                                        hora >= h.hora_inicio.slice(0, 5) &&
                                        hora < h.hora_fin.slice(0, 5)
                                );
                                return (
                                    <div
                                        key={dia + hora}
                                        style={{
                                            borderLeft:
                                                '1px solid var(--light-gray)',
                                            minHeight: '60px',
                                            position: 'relative',
                                            padding: clase ? '8px' : '0',
                                            background: clase
                                                ? 'rgba(67, 97, 238, 0.05)'
                                                : 'transparent',
                                        }}
                                    >
                                        {clase ? (
                                            <div
                                                style={{
                                                    background:
                                                        'linear-gradient(135deg, var(--primary) 0%, var(--info) 100%)',
                                                    color: 'white',
                                                    fontSize: '0.75rem',
                                                    padding: '10px',
                                                    borderRadius:
                                                        'var(--border-radius-sm)',
                                                    height: '100%',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    justifyContent: 'space-between',
                                                    boxShadow:
                                                        '0 2px 8px rgba(67, 97, 238, 0.2)',
                                                }}
                                            >
                                                <div>
                                                    <strong
                                                        style={{
                                                            fontSize: '0.8rem',
                                                            display: 'block',
                                                            marginBottom: '4px',
                                                        }}
                                                    >
                                                        {materias.find(
                                                            (m) =>
                                                                m.id ===
                                                                clase.materia
                                                        )?.nombre || 'N/A'}
                                                    </strong>
                                                    <span
                                                        style={{
                                                            fontSize: '0.7rem',
                                                            opacity: 0.9,
                                                        }}
                                                    >
                                                        {clase.hora_inicio.slice(
                                                            0,
                                                            5
                                                        )}{' '}
                                                        -{' '}
                                                        {clase.hora_fin.slice(0, 5)}
                                                    </span>
                                                </div>
                                                <div
                                                    style={{
                                                        marginTop: '6px',
                                                        fontSize: '0.7rem',
                                                        opacity: 0.9,
                                                    }}
                                                >
                                                    {getProfesorNombre(
                                                        clase.profesor
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        if (
                                                            confirm(
                                                                `¿Eliminar el horario de ${materias.find(
                                                                    (m) =>
                                                                        m.id ===
                                                                        clase.materia
                                                                )?.nombre ||
                                                                'esta clase'
                                                                }?`
                                                            )
                                                        ) {
                                                            axios
                                                                .delete(
                                                                    `${API_URL}/horarios/${clase.id}/`
                                                                )
                                                                .then(() => {
                                                                    alert(
                                                                        'Horario eliminado correctamente.'
                                                                    );
                                                                    setHorario(
                                                                        horario.filter(
                                                                            (m) =>
                                                                                m.id !==
                                                                                clase.id
                                                                        )
                                                                    );
                                                                })
                                                                .catch((error) => {
                                                                    console.error(
                                                                        'Error al eliminar el horario:',
                                                                        error
                                                                    );
                                                                    alert(
                                                                        'Error al eliminar el horario.'
                                                                    );
                                                                });
                                                        }
                                                    }}
                                                    style={{
                                                        marginTop: '8px',
                                                        width: '100%',
                                                        padding: '6px 8px',
                                                        fontSize: '0.7rem',
                                                        background:
                                                            'rgba(247, 37, 133, 0.2)',
                                                        color: 'white',
                                                        border: '1px solid rgba(247, 37, 133, 0.4)',
                                                        borderRadius:
                                                            'var(--border-radius-sm)',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        gap: '4px',
                                                        transition:
                                                            'var(--transition)',
                                                        lineHeight: '1',
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.background =
                                                            'rgba(247, 37, 133, 0.3)';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.background =
                                                            'rgba(247, 37, 133, 0.2)';
                                                    }}
                                                >
                                                    <span
                                                        className="material-symbols-outlined"
                                                        style={{
                                                            fontSize: '0.65rem',
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            justifyContent:
                                                                'center',
                                                            lineHeight: '1',
                                                            margin: '0',
                                                            padding: '0',
                                                        }}
                                                    >delete</span>
                                                    Eliminar
                                                </button>
                                            </div>
                                        ) : null}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (!isOpen) return null;

    const gradoNombre = grado?.grado || '...';
    const seccionNombre = grado?.seccion || '...';

    return (
        <div className="modal-overlay" onClick={onClose} style={{ backdropFilter: 'blur(10px)', backgroundColor: 'rgba(15, 23, 42, 0.4)' }}>
            <div className="modal-container" style={{
                maxWidth: '1200px',
                width: '95%',
                borderRadius: '28px',
                overflow: 'hidden',
                border: 'none',
                boxShadow: '0 30px 60px -12px rgba(0, 0, 0, 0.25)',
                background: '#f1f5f9',
                maxHeight: '90vh',
                display: 'flex',
                flexDirection: 'column'
            }} onClick={(e) => e.stopPropagation()}>
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
                            Horario de {gradoNombre} - Sección {seccionNombre}
                        </h3>
                    </div>
                    <button className="close-btn" onClick={onClose} title="Cerrar" style={{ background: '#ffffff', color: '#64748b', width: '36px', height: '36px', border: '1px solid #e2e8f0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
                    </button>
                </div>
                <div className="modal-body" style={{ padding: '2rem', overflowY: 'auto', flex: 1 }}>
                    {loading ? (
                        <div style={{ padding: '4rem', textAlign: 'center' }}>
                            <Spin size="large" />
                        </div>
                    ) : (
                        <div style={{
                            background: 'white',
                            padding: '2rem',
                            borderRadius: '24px',
                            boxShadow: '0 4px 20px -5px rgba(0, 0, 0, 0.05)',
                            border: '1px solid #ffffff',
                            overflowX: 'auto'
                        }}>
                            {horario === null || (Array.isArray(horario) && horario.length === 0) ? (
                                <div style={{ textAlign: 'center', padding: '4rem 2rem', color: '#94a3b8' }}>
                                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                                        <span className="material-symbols-outlined" style={{ fontSize: '40px', opacity: 0.5 }}>event_busy</span>
                                    </div>
                                    <p style={{ fontSize: '1.1rem', fontWeight: '600', color: '#475569' }}>No hay horario registrado</p>
                                    <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>Aún no se han asignado clases a este grado y sección.</p>
                                </div>
                            ) : (
                                <Calendario />
                            )}
                        </div>
                    )}
                </div>

                <div className="modal-footer" style={{ borderTop: '1px solid #e2e8f0', padding: '1.5rem 2.5rem', background: '#f8fafc', display: 'flex', justifyContent: 'center' }}>
                    <button className="btn btn-secondary" onClick={onClose} style={{
                        borderRadius: '16px',
                        padding: '1rem 3rem',
                        fontWeight: '800',
                        fontFamily: 'Outfit',
                        fontSize: '1rem',
                        background: '#0f172a',
                        color: 'white',
                        border: 'none',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                        cursor: 'pointer'
                    }}>Cerrar Horario</button>
                </div>
            </div>
        </div>
    );
};

export function Grados() {
    const [showRegistrar, setShowRegistrar] = useState(false);
    const [showHorario, setShowHorario] = useState(false);
    const [grado, setGrados] = useState(null);

    return (
        <>
            <div className="header">
                <div className="page-title">
                    <h1>Grados / Años y Secciones</h1>
                    <p>Gestiona los grados y secciones del sistema educativo</p>
                </div>
                <div className="header-actions">
                    <button
                        className="btn"
                        onClick={() => setShowRegistrar(true)}
                        style={{
                            width: 'auto',
                            padding: '12px 24px',
                            fontSize: '0.9rem',
                            background: 'var(--primary)',
                            color: 'white',
                            border: 'none',
                            borderRadius: 'var(--border-radius)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            transition: 'var(--transition)',
                            boxShadow: '0 4px 15px rgba(67, 97, 238, 0.3)',
                            lineHeight: '1',
                            fontWeight: '500',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background =
                                'var(--primary-dark)';
                            e.currentTarget.style.transform =
                                'translateY(-2px)';
                            e.currentTarget.style.boxShadow =
                                '0 6px 20px rgba(67, 97, 238, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'var(--primary)';
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow =
                                '0 4px 15px rgba(67, 97, 238, 0.3)';
                        }}
                    >
                        <span
                            className="material-symbols-outlined"
                            style={{
                                fontSize: '0.8rem',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                lineHeight: '1',
                                margin: '0',
                                padding: '0',
                            }}
                        ></span>
                        Registrar Grado-Sección
                    </button>
                </div>
            </div>

            <ListaGrados
                setShowHorario={(id) => {
                    setShowHorario(true);
                    setGrados(id);
                }}
            />

            <RegistrarGrado
                isOpen={showRegistrar}
                onClose={() => {
                    setShowRegistrar(false);
                }}
            />

            {showHorario && (
                <VerHorario
                    isOpen={showHorario}
                    onClose={() => {
                        setShowHorario(false);
                        setGrados(null);
                    }}
                    grado={grado}
                />
            )}
        </>
    );
}
