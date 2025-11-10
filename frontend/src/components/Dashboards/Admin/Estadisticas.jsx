import axios from 'axios';
import { useState, useEffect, use } from 'react';
export default function Estadisticas() {
    const API_URL = 'http://localhost:8000/api/';
    const [numE, setnumE] = useState(0);
    // const { numR, setnumR } = useState(0);
    const [numP, setnumP] = useState(0);
    const [numadmin, setnumadmin] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEstudiantes = async () => {
            try {
                const [estudiantes, profesor, admin] = await axios.all([
                    axios.get(`${API_URL}usuarios/estudiante/`, {
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    }),
                    // axios.get(`${API_URL}usuarios/representante/`, {
                    //     headers: {
                    //         'Content-Type': 'application/json',
                    //     },
                    // }),
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
                // setnumR(representante.data.length);
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
    console.log(numE, numP, numadmin);
    return (
        <section className="content">
            <div className="card">
                <i className="fas fa-user-graduate fa-2x"></i>
                <p>Total de Represetantes:</p>
                <span>e</span>
            </div>
            <div className="card">
                <i className="fas fa-user-graduate fa-2x"></i>
                <p>Total de estudiantes:</p>
                <span>{numE}</span>
            </div>
            <div className="card">
                <i className="fas fa-chalkboard-teacher fa-2x"></i>
                <p>Total de profesore:</p>
                <span>{numP} </span>
            </div>
            <div className="card">
                <i className="fas fa-users fa-2x"></i>
                <p>Total de representantes:</p>
                <span>{numadmin} </span>
            </div>
        </section>
    );
}
