import axios from 'axios';
import { useState, useEffect, use } from 'react';
import './css/estadistica.css';
export default function Estadisticas() {
    const API_URL = import.meta.env.VITE_API_URL + '/';
    const [numE, setnumE] = useState(0);
    const [numR, setnumR] = useState(0);
    const [numP, setnumP] = useState(0);
    const [numadmin, setnumadmin] = useState(0);
    const [loading, setLoading] = useState(true);
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
                setnumadmin(admin.data.length);
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
            <div className="card">
                <i className="fas fa-user-graduate fa-2x"></i>
                <p>Total de Represetantes:</p>
                <span className="numero">{numR}</span>
            </div>
            <div className="card">
                <i className="fas fa-user-graduate fa-2x"></i>
                <p>Total de estudiantes:</p>
                <span className="numero">{numE}</span>
            </div>
            <div className="card">
                <i className="fas fa-chalkboard-teacher fa-2x"></i>
                <p>Total de profesore:</p>
                <span className="numero">{numP} </span>
            </div>
            <div className="card">
                <i className="fas fa-users fa-2x"></i>
                <p>Total de Administradores:</p>
                <span className="numero">{numadmin} </span>
            </div>
        </section>
    );
}
