import { useEffect, useState, useMemo } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function ListaGrados() {
    const [grados, setGrados] = useState([]);
    const [loading, setLoading] = useState(true);

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

    const primaria = useMemo(
        () => grados.filter((grado) => grado.nivel === 'primaria'),
        [grados]
    );
    const secundaria = useMemo(
        () => grados.filter((grado) => grado.nivel === 'secundaria'),
        [grados]
    );

    if (loading) {
        return <div className="loading">Cargando grados...</div>;
    }

    return (
        <>
            {grados.length === 0 ? (
                <p>No hay grados registrados.</p>
            ) : (
                <>
                    <div className="primaria list-materias">
                        <h2>Primaria</h2>
                        {primaria.map((grado) => (
                            <div key={grado.id} className="materia-item">
                                <h3 className="materia-info">
                                    Grado: {grado.grado}
                                </h3>
                                <p>
                                    <span>Seccion: </span>
                                    {grado.seccion}
                                </p>
                                <button
                                    className="btn-delete"
                                    onClick={() => {
                                        if (
                                            confirm(
                                                `¿Eliminar el grado ${grado.grado} seccion ${grado.seccion}?`
                                            )
                                        ) {
                                            axios
                                                .delete(
                                                    `${API_URL}/grado-seccion/${grado.id}/`
                                                )
                                                .then(() => {
                                                    alert(
                                                        'Grado eliminado correctamente.'
                                                    );
                                                    setGrados(
                                                        grados.filter(
                                                            (m) =>
                                                                m.id !==
                                                                grado.id
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
                        ))}
                    </div>
                    <div className="secundaria list-materias">
                        <h2>Secundaria</h2>
                        {secundaria.map((grado) => (
                            <div key={grado.id} className="materia-item">
                                <h3 className="materia-info">
                                    Grado: {grado.grado}
                                </h3>
                                <p>
                                    <span>Seccion: </span>
                                    {grado.seccion}
                                </p>
                                <button
                                    className="btn-delete"
                                    onClick={() => {
                                        if (
                                            confirm(
                                                `¿Eliminar el grado ${grado.grado} seccion ${grado.seccion}?`
                                            )
                                        ) {
                                            axios
                                                .delete(
                                                    `${API_URL}/grado-seccion/${grado.id}/`
                                                )
                                                .then(() => {
                                                    alert(
                                                        'Grado eliminado correctamente.'
                                                    );
                                                    setGrados(
                                                        grados.filter(
                                                            (m) =>
                                                                m.id !==
                                                                grado.id
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
                        ))}
                    </div>
                </>
            )}
        </>
    );
}

const RegistrarGrado = ({ isOpen, onClose }) => {
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
        for (const key in formData) {
            formDataObj.append(key, formData[key]);
        }

        try {
            await axios.post(`${API_URL}/grado-seccion/`, formDataObj);
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
                    <h2>Registrar Nuevo Grado Seccion</h2>
                    <button className="close-btn" onClick={onClose}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>
                <form className="registroMaterias-form" onSubmit={handleSubmit}>
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
                    <div className="input-group">
                        <div className="select-container">
                            <select
                                id="grado"
                                name="grado"
                                value={formData.grado}
                                className={formData.grado ? 'has-value' : ''}
                                onChange={(e) => handleInputChange(e)}
                                required
                            >
                                <option value="">
                                    -- Seleccione el Grado --
                                </option>
                                <option value="1">1</option>
                                <option value="2">2</option>
                                <option value="3">3</option>
                                <option value="4">4</option>
                                <option value="5">5</option>
                                <option value="6">6</option>
                            </select>
                            <i className="select-icon fas fa-chevron-down"></i>
                        </div>
                    </div>
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
                    <button type="submit" className="btn-add">
                        Registrar
                    </button>
                </form>
            </div>
        </div>
    );
};
export function Grados() {
    const [showRegistrar, setShowRegistrar] = useState(false);
    return (
        <div className="grados">
            <h1 className="admin-title">Grados</h1>
            <button className="btn-add" onClick={() => setShowRegistrar(true)}>
                <i className="fas fa-plus"></i>
                Registrar Grado-seccion
            </button>
            <ListaGrados />
            <RegistrarGrado
                isOpen={showRegistrar}
                onClose={() => {
                    setShowRegistrar(false);
                }}
            />
        </div>
    );
}
