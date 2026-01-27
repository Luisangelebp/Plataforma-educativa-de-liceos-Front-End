import axios from 'axios';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminsModal from './AdminsModal'; // Import the modal component
import './css/estadistica.css';

export default function Estadisticas() {
    const API_URL =
        (import.meta.env.VITE_API_URL || 'http://localhost:8000') + '/';
    const [numE, setnumE] = useState(0);
    const [numR, setnumR] = useState(0);
    const [numP, setnumP] = useState(0);
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAdminsModalOpen, setIsAdminsModalOpen] = useState(false); // State for modal visibility

    useEffect(() => {
        const fetchEstudiantes = async () => {
            try {
                const [estudiantes, representante, profesor, admin] =
                    await axios.all([
                        axios.get(`${API_URL}usuarios/estudiante/`, {
                            headers: {
                                'Content-Type': 'application/json',
                            },
                        }),
                        axios.get(`${API_URL}usuarios/representante/`, {
                            headers: {
                                'Content-Type': 'application/json',
                            },
                        }),
                        axios.get(`${API_URL}usuarios/profesor/`, {
                            headers: {
                                'Content-Type': 'application/json',
                            },
                        }),
                        axios.get(`${API_URL}usuarios/administrador/`, {
                            headers: {
                                'Content-Type': 'application/json',
                            },
                        }),
                    ]);
                setnumE(estudiantes.data.length);
                setnumR(representante.data.length);
                setnumP(profesor.data.length);
                setAdmins(admin.data);
            } catch (error) {
                console.error('Error al obtener estadísticas:', error);
                return null;
            } finally {
                setLoading(false);
            }
        };
        fetchEstudiantes();
    }, []);

    if (loading) {
        return <div>Cargando...</div>;
    }
    return (
        <section className="content">
            <Link to="./listaR" className="card">
                <div>
                    <i className="fas fa-user-graduate fa-2x"></i>
                    <p>Total de Representantes:</p>
                    <span className="numero">{numR}</span>
                </div>
            </Link>
            <Link className="card" to="./listaE">
                <div>
                    <i className="fas fa-user-graduate fa-2x"></i>
                    <p>Total de Estudiantes:</p>
                    <span className="numero">{numE}</span>
                </div>
            </Link>
            <Link className="card" to="./ListaP">
                <div>
                    <i className="fas fa-chalkboard-teacher fa-2x"></i>
                    <p>Total de Profesores:</p>
                    <span className="numero">{numP} </span>
                </div>
            </Link>
            <div
                className="card"
                onClick={() => setIsAdminsModalOpen(true)}
                style={{ cursor: 'pointer' }}
            >
                <i className="fas fa-users fa-2x"></i>
                <p>Total de Administradores:</p>
                <span className="numero">{admins.length} </span>
            </div>
            <AdminsModal
                open={isAdminsModalOpen}
                onClose={() => setIsAdminsModalOpen(false)}
            />
        </section>
    );
}
