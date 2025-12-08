import { useState, useEffect } from 'react';
import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL;
export function Materias() {
    const [showRegistrar, setShowRegistrar] = useState(false);
    const ListaMaterias = () => {
        // Lógica para obtener y mostrar la lista de materias
        const [materias, setMaterias] = useState([]);
        const [loading, setLoading] = useState(true);

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
        }, []);

        if (loading) {
            return <div className="loading">Cargando materias...</div>;
        }

        return (
            <div className="list-materias">
                {materias.length !== 0 ? (
                    materias.map((materia) => (
                        <div key={materia.id} className="materia-item">
                            <h3>{materia.nombre}</h3>
                            <p>
                                <span>Descripcion: </span>
                                {materia.descripcion}
                            </p>
                            <button
                                className="btn-delete"
                                onClick={() => {
                                    if (
                                        confirm(
                                            `¿Eliminar la materia ${materia.nombre}?`
                                        )
                                    ) {
                                        axios
                                            .delete(
                                                `${API_URL}/horarios/materias/${materia.id}/`
                                            )
                                            .then(() => {
                                                alert(
                                                    'Materia eliminada correctamente.'
                                                );
                                                setMaterias(
                                                    materias.filter(
                                                        (m) =>
                                                            m.id !== materia.id
                                                    )
                                                );
                                            })
                                            .catch((error) => {
                                                console.error(
                                                    'Error al eliminar la materia:',
                                                    error
                                                );
                                                alert(
                                                    'Error al eliminar la materia.'
                                                );
                                            });
                                    }
                                }}
                            >
                                <i className="fas fa-trash"></i>
                            </button>
                        </div>
                    ))
                ) : (
                    <p>No hay materias registradas.</p>
                )}
            </div>
        );
    };

    const RegistrarMateria = ({ isOpen, onClose }) => {
        // Lógica para registrar una nueva materia
        const [formData, setFormData] = useState({});

        const handleInputChange = (e) => {
            const { name, value } = e.target;
            setFormData((prev) => ({
                ...prev,
                [name]: value,
            }));
        };

        const handleSubmit = async (e) => {
            e.preventDefault();
            const formDataObj = new FormData();
            formDataObj.append('nombre', formData.nombre);
            formDataObj.append('descripcion', formData.descripcion);

            try {
                await axios.post(`${API_URL}/horarios/materias/`, formDataObj);
                onClose();
                window.location.reload(); // Recargar la página para actualizar la lista
            } catch (error) {
                console.error('Error al registrar materia:', error);
            }
        };

        if (!isOpen) return null;
        return (
            <div className="modal-overlay" onClick={onClose}>
                <div
                    className="modal-content edit-modal"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="modal-header">
                        <h2>Registrar Nueva Materia</h2>
                        <button className="close-btn" onClick={onClose}>
                            <i className="fas fa-times"></i>
                        </button>
                    </div>
                    <form
                        className="registroMaterias-form"
                        onSubmit={handleSubmit}
                    >
                        <div className="input-group">
                            <div className="input-container">
                                <input
                                    type="text"
                                    name="nombre"
                                    value={formData.nombre}
                                    className={
                                        formData.nombre ? 'has-value' : ''
                                    }
                                    onChange={(e) => handleInputChange(e)}
                                    required
                                />
                                <label>Nombre:</label>
                                <i className="input-icon fa-solid fa-graduation-cap"></i>
                            </div>
                        </div>
                        <div className="input-group">
                            <div className="input-container">
                                <input
                                    type="text"
                                    name="descripcion"
                                    value={formData.descripcion}
                                    className={
                                        formData.descripcion ? 'has-value' : ''
                                    }
                                    onChange={(e) => handleInputChange(e)}
                                    required
                                />
                                <label>Descripcion:</label>
                                <i className="input-icon bi bi-card-text"></i>
                            </div>
                        </div>
                        <button type="submit" className="btn-add">
                            Registrar
                        </button>
                    </form>
                </div>
            </div>
        );
    };

    return (
        <div className="materias">
            <h1 className="admin-title">Materias</h1>
            <button className="btn-add" onClick={() => setShowRegistrar(true)}>
                <i className="fas fa-plus"></i>
                Registrar Materia
            </button>
            <ListaMaterias />
            <RegistrarMateria
                isOpen={showRegistrar}
                onClose={() => setShowRegistrar(false)}
            />
        </div>
    );
}
