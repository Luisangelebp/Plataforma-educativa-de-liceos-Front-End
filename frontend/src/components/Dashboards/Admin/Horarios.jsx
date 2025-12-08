import { useState, useEffect } from 'react';
import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL;

function ListaMaterias({ setShowAsignarHorario, setMateria }) {
    const [materias, setMaterias] = useState([]);
    const [loading, setLoading] = useState(false);

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
            {materias.length == 0 ? (
                <p>No hay materias registradas.</p>
            ) : (
                materias.map((materia) => (
                    <div key={materia.id} className="materia-item">
                        <div className="materia-info">
                            <h3>{materia.nombre}</h3>
                            <p>
                                <span>Descripcion: </span>
                                {materia.descripcion}
                            </p>
                        </div>
                        <button
                            className="btn-add btn-asigH"
                            onClick={() => {
                                setShowAsignarHorario(true);
                                setMateria(materia.id);
                            }}
                        >
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

        for (key in formData) {
            formDataObj.append(key, formData[key]);
        }

        try {
            await axios.post(`${API_URL}/horarios/`, formDataObj);
            onClose();
            window.location.reload(); // Recargar la página para actualizar la lista
        } catch (error) {
            console.error('Error al registrar horario:', error);
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
                    <h2>Registrar Nuevp Horario</h2>
                    <button className="close-btn" onClick={onClose}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>
                <form className="registroMaterias-form" onSubmit={handleSubmit}>
                    <div className="input-group">
                        <div className="input-container"></div>
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
}

export function Horarios() {
    const [showAsignarHorario, setShowAsignarHorario] = useState(false);
    const [materia, setmateria] = useState(null);

    return (
        <div>
            <h1 className="admin-title">Asignar Horarios</h1>

            <ListaMaterias
                setShowAsignarHorario={setShowAsignarHorario}
                setMateria={setmateria}
            />
            <AsignarHorario
                isOpen={showAsignarHorario}
                materia={materia}
                onClose={() => {
                    setShowAsignarHorario(false);
                    setmateria(null);
                }}
            />
        </div>
    );
}
