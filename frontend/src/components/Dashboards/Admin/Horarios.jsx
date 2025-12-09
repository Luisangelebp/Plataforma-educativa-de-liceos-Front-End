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
    const [grados, setGrados] = useState([]);
    const [loading, setLoading] = useState(true);
    const [profesor, setProfesor] = useState([]);
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
    useEffect(() => {
        const fetchGrados = async () => {
            setLoading(true);
            try {
                const response = await axios.get(
                    `${API_URL}/usuarios/profesor/`
                );
                setProfesor(response.data);
            } catch (error) {
                console.error('Error fetching profesors:', error);
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formDataObj = new FormData();
        formData['materia'] = materia;
        for (const key in formData) {
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
                        <div className="select-container">
                            <select
                                id="dia_semana"
                                name="dia_semana"
                                value={formData.dia_semana || ''}
                                className={
                                    formData.dia_semana ? 'has-value' : ''
                                }
                                onChange={(e) => handleInputChange(e)}
                                required
                            >
                                <option value="">
                                    -- Seleccione el dia de la semana --
                                </option>
                                <option value="lunes">Lunes</option>
                                <option value="martes">Martes</option>
                                <option value="miercoles">Miercoles</option>
                                <option value="jueves">Jueves</option>
                                <option value="viernes">Viernes</option>
                            </select>
                            <i className="select-icon fas fa-chevron-down"></i>
                        </div>
                    </div>
                    <div className="input-group">
                        <div className="input-container">
                            <input
                                type="time"
                                name="hora_inicio"
                                value={formData.hora_inicio}
                                className={
                                    formData.hora_inicio ? 'has-value' : ''
                                }
                                onChange={(e) => handleInputChange(e)}
                                min="06:00"
                                required
                            />
                            <label>Hora de Inicio:</label>
                            <i className="input-icon bi bi-card-text"></i>
                        </div>
                    </div>
                    <div className="input-group">
                        <div className="input-container">
                            <input
                                type="time"
                                name="hora_fin"
                                value={formData.hora_fin}
                                className={formData.hora_fin ? 'has-value' : ''}
                                onChange={(e) => handleInputChange(e)}
                                max="18:00"
                                required
                            />
                            <label>Hora de Cierre:</label>
                            <i className="input-icon bi bi-card-text"></i>
                        </div>
                    </div>
                    <div className="input-group">
                        <div className="select-container">
                            <select
                                id="grado_seccion"
                                name="grado_seccion"
                                value={formData.grado_seccion || ''}
                                className={
                                    formData.grado_seccion ? 'has-value' : ''
                                }
                                onChange={(e) => handleInputChange(e)}
                                required
                            >
                                <option value="">
                                    -- Seleccione el Grado y su seccion --
                                </option>
                                <option value="" disabled>
                                    Primaria
                                </option>

                                {primaria.length == 0 ? (
                                    <option value="" disabled>
                                        No hay grados cargados
                                    </option>
                                ) : (
                                    primaria.map((grado) => (
                                        <option key={grado.id} value={grado.id}>
                                            {grado.grado} {grado.seccion}
                                        </option>
                                    ))
                                )}

                                <option value="" disabled>
                                    Secundaria
                                </option>

                                {secundaria.length === 0 ? (
                                    <option value="" disabled>
                                        No hay grados cargados
                                    </option>
                                ) : (
                                    secundaria.map((grado) => (
                                        <option key={grado.id} value={grado.id}>
                                            {grado.grado} {grado.seccion}
                                        </option>
                                    ))
                                )}
                            </select>
                            <i className="select-icon fas fa-chevron-down"></i>
                        </div>
                    </div>
                    <div className="input-group">
                        <div className="select-container">
                            <select
                                id="profesor"
                                name="profesor"
                                value={formData.profesor || ''}
                                className={formData.profesor ? 'has-value' : ''}
                                onChange={(e) => handleInputChange(e)}
                                required
                            >
                                <option value="">
                                    -- Seleccione el Profesor --
                                </option>
                                {profesor.length === 0 ? (
                                    <option value="" disabled>
                                        No hay profesores cargados
                                    </option>
                                ) : (
                                    profesor.map((profesor) => (
                                        <option
                                            key={profesor.id}
                                            value={profesor.id}
                                        >
                                            {profesor.nombre}{' '}
                                            {profesor.apellido}{' '}
                                            {profesor.cedula}
                                        </option>
                                    ))
                                )}
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
