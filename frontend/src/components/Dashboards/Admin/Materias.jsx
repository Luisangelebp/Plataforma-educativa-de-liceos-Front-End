import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export function Materias() {
    const [showRegistrar, setShowRegistrar] = useState(false);
    const [materiaEditando, setMateriaEditando] = useState(null);
    const [materiaAsignando, setMateriaAsignando] = useState(null);
    const [showAsignarProfesores, setShowAsignarProfesores] = useState(false);
    const [profesores, setProfesores] = useState([]);
    const [profesoresSeleccionados, setProfesoresSeleccionados] = useState([]);
    const [loadingProfesores, setLoadingProfesores] = useState(false);
        const [materias, setMaterias] = useState([]);
        const [loading, setLoading] = useState(true);

        useEffect(() => {
        fetchMaterias();
    }, []);

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

    const handleDelete = async (materia) => {
        if (confirm(`¿Eliminar la materia ${materia.nombre}?`)) {
            try {
                const token = localStorage.getItem('accessToken');
                await axios.delete(
                    `${API_URL}/horarios/materias/${materia.id}/`,
                    {
                        headers: token ? { Authorization: `Bearer ${token}` } : {}
                    }
                );
                alert('Materia eliminada correctamente.');
            fetchMaterias();
            } catch (error) {
                console.error('Error al eliminar la materia:', error);
                alert('Error al eliminar la materia.');
            }
        }
    };

    const handleEdit = (materia) => {
        setMateriaEditando(materia);
        setShowRegistrar(true);
    };

    const handleAsignarProfesores = async (materia) => {
        setMateriaAsignando(materia);
        setShowAsignarProfesores(true);
        setLoadingProfesores(true);
        
        try {
            const token = localStorage.getItem('accessToken');
            // Cargar profesores
            const responseProfesores = await axios.get(
                `${API_URL}/usuarios/profesor/`,
                {
                    headers: token ? { Authorization: `Bearer ${token}` } : {}
                }
            );
            setProfesores(responseProfesores.data || []);
            
            // Cargar profesores ya asignados a esta materia
            const responseMateria = await axios.get(
                `${API_URL}/horarios/materias/${materia.id}/`,
                {
                    headers: token ? { Authorization: `Bearer ${token}` } : {}
                }
            );
            // Si la materia tiene profesores asignados, marcarlos como seleccionados
            if (responseMateria.data.profesores_detalle && responseMateria.data.profesores_detalle.length > 0) {
                setProfesoresSeleccionados(responseMateria.data.profesores_detalle.map(p => p.id));
            } else if (responseMateria.data.profesores && responseMateria.data.profesores.length > 0) {
                // Si viene como array de IDs
                setProfesoresSeleccionados(responseMateria.data.profesores);
            } else {
                setProfesoresSeleccionados([]);
            }
        } catch (error) {
            console.error('Error al cargar profesores:', error);
            setProfesores([]);
            setProfesoresSeleccionados([]);
        } finally {
            setLoadingProfesores(false);
        }
    };

    const toggleProfesor = (profesorId) => {
        setProfesoresSeleccionados(prev => {
            if (prev.includes(profesorId)) {
                return prev.filter(id => id !== profesorId);
            } else {
                return [...prev, profesorId];
            }
        });
    };

    const guardarAsignacionProfesores = async () => {
        if (!materiaAsignando) return;
        
        try {
            const token = localStorage.getItem('accessToken');
            // Actualizar la materia con los profesores seleccionados
            await axios.patch(
                `${API_URL}/horarios/materias/${materiaAsignando.id}/`,
                { profesores: profesoresSeleccionados },
                {
                    headers: token ? { Authorization: `Bearer ${token}` } : {}
                }
            );
            alert('Profesores asignados correctamente.');
            setShowAsignarProfesores(false);
            setMateriaAsignando(null);
            setProfesoresSeleccionados([]);
            fetchMaterias();
        } catch (error) {
            console.error('Error al asignar profesores:', error);
            alert('Error al asignar profesores. Verifique que el backend soporte esta funcionalidad.');
        }
    };

    const ListaMaterias = () => {

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
                                            marginBottom: '10px'
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
                                <div style={{
                                    display: 'flex',
                                    gap: '8px',
                                    marginTop: '15px',
                                    justifyContent: 'flex-end'
                                }}>
                                    {/* Botón de asignar profesores oculto - se asigna desde la lista de profesores */}
                                    {/* 
                                    <button
                                        onClick={() => handleAsignarProfesores(materia)}
                                        title="Asignar profesores"
                                        style={{
                                            width: '36px',
                                            height: '36px',
                                            padding: '0',
                                            margin: '0',
                                            background: 'var(--primary)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: 'var(--border-radius-sm)',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            transition: 'var(--transition)',
                                            flexShrink: 0,
                                            lineHeight: '1'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = '#0056b3';
                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = 'var(--primary)';
                                            e.currentTarget.style.transform = 'translateY(0)';
                                        }}
                                    >
                                        <i className="fas fa-user-plus" style={{
                                            fontSize: '0.7rem',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            lineHeight: '1',
                                            margin: '0',
                                            padding: '0'
                                        }}></i>
                                    </button>
                                    */}
                                    <button
                                        onClick={() => handleEdit(materia)}
                                        title="Editar materia"
                                        style={{
                                            width: '36px',
                                            height: '36px',
                                            padding: '0',
                                            margin: '0',
                                            background: 'var(--info)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: 'var(--border-radius-sm)',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            transition: 'var(--transition)',
                                            flexShrink: 0,
                                            lineHeight: '1'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = '#3a7bd5';
                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = 'var(--info)';
                                            e.currentTarget.style.transform = 'translateY(0)';
                                        }}
                                    >
                                        <i className="fas fa-edit" style={{
                                            fontSize: '0.7rem',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            lineHeight: '1',
                                            margin: '0',
                                            padding: '0'
                                        }}></i>
                                    </button>
                            <button
                                        onClick={() => handleDelete(materia)}
                                        title="Eliminar materia"
                                        style={{
                                            width: '36px',
                                            height: '36px',
                                            padding: '0',
                                            margin: '0',
                                            background: 'var(--danger)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: 'var(--border-radius-sm)',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            transition: 'var(--transition)',
                                            flexShrink: 0,
                                            lineHeight: '1'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = '#d81b60';
                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(247, 37, 133, 0.3)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = 'var(--danger)';
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.boxShadow = 'none';
                                        }}
                                    >
                                        <i className="fas fa-trash" style={{
                                            fontSize: '0.7rem',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            lineHeight: '1',
                                            margin: '0',
                                            padding: '0'
                                        }}></i>
                            </button>
                        </div>
                            </div>
                        ))}
                    </div>
                )}
            </>
        );
    };

    const RegistrarMateria = ({ isOpen, onClose, materia }) => {
        const [formData, setFormData] = useState({
            nombre: '',
            descripcion: ''
        });
        const [isLoading, setIsLoading] = useState(false);

        useEffect(() => {
            if (materia) {
                setFormData({
                    nombre: materia.nombre || '',
                    descripcion: materia.descripcion || ''
                });
            } else {
                setFormData({ nombre: '', descripcion: '' });
            }
        }, [materia, isOpen]);

        const handleInputChange = (e) => {
            const { name, value } = e.target;
            setFormData((prev) => ({
                ...prev,
                [name]: value,
            }));
        };

        const handleSubmit = async (e) => {
            e.preventDefault();
            setIsLoading(true);
            const token = localStorage.getItem('accessToken');
            
            try {
                if (materia) {
                    // Actualizar
                    await axios.patch(
                        `${API_URL}/horarios/materias/${materia.id}/`,
                        formData,
                        {
                            headers: token ? { Authorization: `Bearer ${token}` } : {}
                        }
                    );
                    alert('Materia actualizada correctamente.');
                } else {
                    // Crear
                    await axios.post(
                        `${API_URL}/horarios/materias/`,
                        formData,
                        {
                            headers: token ? { Authorization: `Bearer ${token}` } : {}
                        }
                    );
                    alert('Materia registrada correctamente.');
                }
                onClose();
                window.location.reload();
            } catch (error) {
                console.error('Error al guardar materia:', error);
                alert('Error al guardar la materia.');
            } finally {
                setIsLoading(false);
            }
        };

        if (!isOpen) return null;
        return (
            <div className="modal" onClick={onClose}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                    <div className="modal-header">
                        <h3 className="modal-title">
                            {materia ? 'Editar Materia' : 'Registrar Nueva Materia'}
                        </h3>
                        <button className="close-modal" onClick={onClose}>&times;</button>
                    </div>
                    <div className="modal-body">
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label htmlFor="nombre" style={{fontSize: '0.95rem'}}>
                                    Nombre de la Materia *
                                </label>
                                <div className="input-with-icon">
                                    <i className="fas fa-book" style={{fontSize: '0.8rem'}}></i>
                                <input
                                    type="text"
                                        id="nombre"
                                    name="nombre"
                                    value={formData.nombre}
                                        onChange={handleInputChange}
                                        placeholder="Ej: Matemáticas"
                                    required
                                />
                            </div>
                        </div>

                            <div className="form-group">
                                <label htmlFor="descripcion" style={{fontSize: '0.95rem'}}>
                                    Descripción *
                                </label>
                                <div style={{position: 'relative'}}>
                                    <i className="fas fa-align-left" style={{
                                        position: 'absolute',
                                        left: '15px',
                                        top: '15px',
                                        color: 'var(--gray)',
                                        fontSize: '0.8rem',
                                        zIndex: 1
                                    }}></i>
                                    <textarea
                                        id="descripcion"
                                    name="descripcion"
                                    value={formData.descripcion}
                                        onChange={handleInputChange}
                                        placeholder="Descripción de la materia"
                                    required
                                        rows="4"
                                        style={{
                                            width: '100%',
                                            padding: '12px 15px 12px 40px',
                                            border: '2px solid var(--light-gray)',
                                            borderRadius: 'var(--border-radius)',
                                            fontSize: '0.95rem',
                                            transition: 'var(--transition)',
                                            background: 'white',
                                            color: 'var(--dark)',
                                            fontFamily: 'inherit',
                                            resize: 'vertical'
                                        }}
                                        onFocus={(e) => {
                                            e.currentTarget.style.borderColor = 'var(--primary)';
                                            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(67, 97, 238, 0.1)';
                                        }}
                                        onBlur={(e) => {
                                            e.currentTarget.style.borderColor = 'var(--light-gray)';
                                            e.currentTarget.style.boxShadow = 'none';
                                        }}
                                    />
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
                                    disabled={isLoading}
                                    style={{width: 'auto', padding: '12px 30px', fontSize: '0.9rem'}}
                                >
                                    {isLoading ? 'Guardando...' : (materia ? 'Actualizar' : 'Registrar')}
                        </button>
                            </div>
                    </form>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <>
            <div className="header">
                <div className="page-title">
                    <h1>Materias</h1>
                    <p>Gestiona las materias del sistema educativo</p>
                </div>
                <div className="header-actions">
                    <button 
                        className="btn"
                        onClick={() => {
                            setMateriaEditando(null);
                            setShowRegistrar(true);
                        }}
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
                            gap: '8px',
                            transition: 'var(--transition)',
                            boxShadow: '0 4px 15px rgba(67, 97, 238, 0.3)'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'var(--primary-dark)';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 6px 20px rgba(67, 97, 238, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'var(--primary)';
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 15px rgba(67, 97, 238, 0.3)';
                        }}
                    >
                        <i className="fas fa-plus" style={{fontSize: '0.85rem'}}></i>
                Registrar Materia
            </button>
                </div>
            </div>

            <ListaMaterias />
            
            <RegistrarMateria
                isOpen={showRegistrar}
                onClose={() => {
                    setShowRegistrar(false);
                    setMateriaEditando(null);
                    fetchMaterias();
                }}
                materia={materiaEditando}
            />

            {/* Modal para asignar profesores - OCULTO - se asigna desde la lista de profesores */}
            {/* 
            {showAsignarProfesores && materiaAsignando && (
                <div className="modal" onClick={() => setShowAsignarProfesores(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{maxWidth: '600px'}}>
                        <div className="modal-header">
                            <h3 className="modal-title">
                                <i className="fas fa-user-plus" style={{marginRight: '10px', color: 'var(--primary)'}}></i>
                                Asignar Profesores a {materiaAsignando.nombre}
                            </h3>
                            <button className="close-modal" onClick={() => setShowAsignarProfesores(false)}>&times;</button>
                        </div>
                        <div className="modal-body">
                            {loadingProfesores ? (
                                <div style={{textAlign: 'center', padding: '40px', color: 'var(--gray)'}}>
                                    <i className="fas fa-spinner fa-spin" style={{fontSize: '2rem', marginBottom: '10px'}}></i>
                                    <p>Cargando profesores...</p>
                                </div>
                            ) : (
                                <>
                                    <p style={{color: 'var(--gray)', fontSize: '0.9rem', marginBottom: '20px'}}>
                                        Seleccione los profesores que dictarán esta materia:
                                    </p>
                                    <div style={{
                                        border: '2px solid var(--light-gray)',
                                        borderRadius: 'var(--border-radius)',
                                        padding: '15px',
                                        maxHeight: '400px',
                                        overflowY: 'auto',
                                        background: 'white'
                                    }}>
                                        {profesores.length === 0 ? (
                                            <p style={{color: 'var(--gray)', fontSize: '0.9rem', textAlign: 'center', padding: '20px'}}>
                                                No hay profesores registrados en el sistema.
                                            </p>
                                        ) : (
                                            <div style={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: '10px'
                                            }}>
                                                {profesores.map((profesor) => {
                                                    const isSelected = profesoresSeleccionados.includes(profesor.id);
                                                    return (
                                                        <label
                                                            key={profesor.id}
                                                            style={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '12px',
                                                                padding: '12px 15px',
                                                                border: `2px solid ${isSelected ? 'var(--primary)' : 'var(--light-gray)'}`,
                                                                borderRadius: 'var(--border-radius)',
                                                                background: isSelected ? 'rgba(67, 97, 238, 0.1)' : 'white',
                                                                cursor: 'pointer',
                                                                transition: 'var(--transition)'
                                                            }}
                                                            onMouseEnter={(e) => {
                                                                if (!isSelected) {
                                                                    e.currentTarget.style.borderColor = 'var(--primary)';
                                                                }
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                if (!isSelected) {
                                                                    e.currentTarget.style.borderColor = 'var(--light-gray)';
                                                                }
                                                            }}
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                checked={isSelected}
                                                                onChange={() => toggleProfesor(profesor.id)}
                                                                style={{
                                                                    width: '20px',
                                                                    height: '20px',
                                                                    cursor: 'pointer',
                                                                    accentColor: 'var(--primary)'
                                                                }}
                                                            />
                                                            <div style={{flex: 1}}>
                                                                <div style={{
                                                                    fontWeight: '600',
                                                                    color: 'var(--dark)',
                                                                    fontSize: '0.95rem',
                                                                    marginBottom: '4px'
                                                                }}>
                                                                    {profesor.nombre} {profesor.apellido}
                                                                </div>
                                                                <div style={{
                                                                    color: 'var(--gray)',
                                                                    fontSize: '0.85rem'
                                                                }}>
                                                                    {profesor.tipo_profesor}
                                                                </div>
                                                            </div>
                                                            {isSelected && (
                                                                <i className="fas fa-check-circle" style={{
                                                                    color: 'var(--primary)',
                                                                    fontSize: '1.1rem'
                                                                }}></i>
                                                            )}
                                                        </label>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                    <div style={{
                                        marginTop: '25px',
                                        display: 'flex',
                                        justifyContent: 'flex-end',
                                        gap: '12px',
                                        paddingTop: '20px',
                                        borderTop: '1px solid var(--light-gray)'
                                    }}>
                                        <button
                                            type="button"
                                            className="btn btn-secondary"
                                            onClick={() => {
                                                setShowAsignarProfesores(false);
                                                setMateriaAsignando(null);
                                                setProfesoresSeleccionados([]);
                                            }}
                                            style={{width: 'auto', padding: '12px 24px', fontSize: '0.9rem'}}
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-primary"
                                            onClick={guardarAsignacionProfesores}
                                            style={{
                                                width: 'auto',
                                                padding: '12px 30px',
                                                fontSize: '0.9rem',
                                                background: 'var(--primary)',
                                                color: 'white'
                                            }}
                                        >
                                            <i className="fas fa-save" style={{marginRight: '8px'}}></i>
                                            Guardar Asignación
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
        </div>
            )}
            */}
        </>
    );
}
