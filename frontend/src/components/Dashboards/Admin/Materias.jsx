import { useState, useEffect } from 'react';
import axios from 'axios';
import './css/Materias.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export function Materias() {
    const [showRegistrar, setShowRegistrar] = useState(false);
    const [materiaEditando, setMateriaEditando] = useState(null);
    const [materias, setMaterias] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMaterias();
    }, []);

    const fetchMaterias = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('accessToken');
            const response = await axios.get(`${API_URL}/horarios/materias/`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
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
                        headers: token
                            ? { Authorization: `Bearer ${token}` }
                            : {},
                    },
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

    const ListaMaterias = () => {
        if (loading) {
            return (
                <div
                    className="loading-container"
                    style={{ padding: '4rem', textAlign: 'center' }}
                >
                    <span
                        className="material-symbols-outlined spin"
                        style={{ fontSize: '2.5rem', color: '#137fec' }}
                    >
                        progress_activity
                    </span>
                    <p style={{ marginTop: '1rem', color: '#64748b' }}>
                        Cargando materias...
                    </p>
                </div>
            );
        }

        return (
            <div className="materias-container">
                <div className="materias-grid">
                    {materias.length === 0 ? (
                        <div
                            className="no-data"
                            style={{
                                gridColumn: '1/-1',
                                textAlign: 'center',
                                padding: '4rem',
                            }}
                        >
                            <span
                                className="material-symbols-outlined"
                                style={{
                                    fontSize: '4rem',
                                    color: '#cbd5e1',
                                    marginBottom: '1rem',
                                }}
                            >
                                book
                            </span>
                            <p style={{ color: '#64748b' }}>
                                No hay materias registradas.
                            </p>
                        </div>
                    ) : (
                        materias.map((materia) => (
                            <div key={materia.id} className="materia-card">
                                <div className="materia-card-header">
                                    <div className="materia-icon">
                                        <span className="material-symbols-outlined">
                                            book
                                        </span>
                                    </div>
                                    <div className="materia-actions">
                                        <button
                                            onClick={() => handleEdit(materia)}
                                            className="btn-materia-action edit"
                                            title="Editar"
                                        >
                                            <span className="material-symbols-outlined">
                                                edit
                                            </span>
                                        </button>
                                        <button
                                            onClick={() =>
                                                handleDelete(materia)
                                            }
                                            className="btn-materia-action delete"
                                            title="Eliminar"
                                        >
                                            <span className="material-symbols-outlined">
                                                delete
                                            </span>
                                        </button>
                                    </div>
                                </div>
                                <div className="materia-info">
                                    <h3>{materia.nombre}</h3>
                                    <p>
                                        {materia.descripcion ||
                                            'Sin descripción'}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        );
    };

    const RegistrarMateria = ({ isOpen, onClose, materia }) => {
        const [formData, setFormData] = useState({
            nombre: '',
            descripcion: '',
        });
        const [isLoading, setIsLoading] = useState(false);

        useEffect(() => {
            if (materia) {
                setFormData({
                    nombre: materia.nombre || '',
                    descripcion: materia.descripcion || '',
                });
            } else {
                setFormData({ nombre: '', descripcion: '' });
            }
        }, [materia, isOpen]);

        const handleSubmit = async (e) => {
            e.preventDefault();
            setIsLoading(true);
            const token = localStorage.getItem('accessToken');

            try {
                if (materia) {
                    await axios.patch(
                        `${API_URL}/horarios/materias/${materia.id}/`,
                        formData,
                        {
                            headers: token
                                ? { Authorization: `Bearer ${token}` }
                                : {},
                        },
                    );
                    alert('Materia actualizada correctamente.');
                } else {
                    await axios.post(
                        `${API_URL}/horarios/materias/`,
                        formData,
                        {
                            headers: token
                                ? { Authorization: `Bearer ${token}` }
                                : {},
                        },
                    );
                    alert('Materia registrada correctamente.');
                }
                onClose();
                fetchMaterias();
            } catch (error) {
                console.error('Error al guardar materia:', error);
                alert('Error al guardar la materia.');
            } finally {
                setIsLoading(false);
            }
        };

        if (!isOpen) return null;

        return (
            <div
                className="modal-overlay"
                onClick={onClose}
                style={{
                    backdropFilter: 'blur(10px)',
                    backgroundColor: 'rgba(15, 23, 42, 0.4)',
                }}
            >
                <div
                    className="modal-container"
                    onClick={(e) => e.stopPropagation()}
                    style={{
                        maxWidth: '600px',
                        borderRadius: '28px',
                        overflow: 'hidden',
                        border: 'none',
                        boxShadow: '0 30px 60px -12px rgba(0, 0, 0, 0.25)',
                        background: '#f1f5f9',
                    }}
                >
                    <div
                        className="modal-header"
                        style={{
                            background: '#f8fafc',
                            borderBottom: '1px solid #e2e8f0',
                            padding: '1.75rem 2rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem',
                            }}
                        >
                            <div
                                style={{
                                    width: '42px',
                                    height: '42px',
                                    borderRadius: '12px',
                                    background: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'var(--primary)',
                                    boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
                                    border: '1px solid #e2e8f0',
                                }}
                            >
                                <span
                                    className="material-symbols-outlined"
                                    style={{ fontSize: '24px' }}
                                >
                                    book
                                </span>
                            </div>
                            <h3
                                style={{
                                    margin: 0,
                                    fontFamily: 'Outfit',
                                    fontWeight: '800',
                                    fontSize: '1.5rem',
                                    color: '#0f172a',
                                    letterSpacing: '-0.02em',
                                }}
                            >
                                {materia
                                    ? 'Editar Materia'
                                    : 'Registrar Materia'}
                            </h3>
                        </div>
                        <button
                            className="close-btn"
                            onClick={onClose}
                            title="Cerrar"
                            style={{
                                background: '#ffffff',
                                color: '#64748b',
                                width: '36px',
                                height: '36px',
                                border: '1px solid #e2e8f0',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                            }}
                        >
                            <span
                                className="material-symbols-outlined"
                                style={{ fontSize: '20px' }}
                            >
                                close
                            </span>
                        </button>
                    </div>

                    <div className="modal-body" style={{ padding: '2rem' }}>
                        <div
                            style={{
                                background: 'white',
                                padding: '2rem',
                                borderRadius: '24px',
                                boxShadow:
                                    '0 4px 20px -5px rgba(0, 0, 0, 0.05)',
                                border: '1px solid #ffffff',
                            }}
                        >
                            <form onSubmit={handleSubmit}>
                                <div
                                    className="form-group-materia"
                                    style={{ marginBottom: '1.5rem' }}
                                >
                                    <label
                                        htmlFor="nombre"
                                        style={{
                                            display: 'block',
                                            marginBottom: '8px',
                                            fontWeight: '700',
                                            color: '#4b5563',
                                            fontSize: '0.9rem',
                                        }}
                                    >
                                        Nombre de la Materia *
                                    </label>
                                    <div
                                        className="input-materia-wrapper"
                                        style={{ position: 'relative' }}
                                    >
                                        <span
                                            className="material-symbols-outlined"
                                            style={{
                                                position: 'absolute',
                                                left: '12px',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                color: '#94a3b8',
                                                fontSize: '20px',
                                            }}
                                        >
                                            book
                                        </span>
                                        <input
                                            type="text"
                                            id="nombre"
                                            name="nombre"
                                            value={formData.nombre}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    nombre: e.target.value,
                                                })
                                            }
                                            placeholder="Ej: Matemáticas"
                                            required
                                            style={{
                                                width: '100%',
                                                padding: '12px 12px 12px 42px',
                                                borderRadius: '12px',
                                                border: '1px solid #e2e8f0',
                                                background: '#f8fafc',
                                                fontSize: '1rem',
                                                outline: 'none',
                                            }}
                                        />
                                    </div>
                                </div>
                                <div className="form-group-materia">
                                    <label
                                        htmlFor="descripcion"
                                        style={{
                                            display: 'block',
                                            marginBottom: '8px',
                                            fontWeight: '700',
                                            color: '#4b5563',
                                            fontSize: '0.9rem',
                                        }}
                                    >
                                        Descripción *
                                    </label>
                                    <div className="input-materia-wrapper">
                                        <textarea
                                            id="descripcion"
                                            name="descripcion"
                                            value={formData.descripcion}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    descripcion: e.target.value,
                                                })
                                            }
                                            placeholder="Descripción de la materia"
                                            required
                                            style={{
                                                width: '100%',
                                                padding: '12px',
                                                borderRadius: '12px',
                                                border: '1px solid #e2e8f0',
                                                background: '#f8fafc',
                                                fontSize: '1rem',
                                                outline: 'none',
                                                minHeight: '120px',
                                                resize: 'vertical',
                                            }}
                                        />
                                    </div>
                                </div>

                                <div
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'center',
                                        gap: '12px',
                                        marginTop: '2.5rem',
                                    }}
                                >
                                    <button
                                        type="button"
                                        className="btn-secondary-materia"
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
                                            cursor: 'pointer',
                                        }}
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn-primary-materia"
                                        disabled={isLoading}
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
                                            boxShadow:
                                                '0 4px 12px rgba(0,0,0,0.1)',
                                        }}
                                    >
                                        {isLoading
                                            ? 'Guardando...'
                                            : materia
                                              ? 'Actualizar'
                                              : 'Registrar'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="materias-page-wrapper">
            <div className="materias-header-section">
                <div className="materias-title">
                    <h1>Materias</h1>
                    <p>Gestiona las materias del sistema educativo</p>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={() => {
                        setMateriaEditando(null);
                        setShowRegistrar(true);
                    }}
                    style={{
                        padding: '0.6rem 1.25rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        height: 'fit-content',
                        borderRadius: '10px',
                        fontSize: '0.9rem',
                    }}
                >
                    <span className="material-symbols-outlined">add</span>
                    Registrar Materia
                </button>
            </div>

            <ListaMaterias />

            <RegistrarMateria
                isOpen={showRegistrar}
                onClose={() => {
                    setShowRegistrar(false);
                    setMateriaEditando(null);
                }}
                materia={materiaEditando}
            />
        </div>
    );
}
