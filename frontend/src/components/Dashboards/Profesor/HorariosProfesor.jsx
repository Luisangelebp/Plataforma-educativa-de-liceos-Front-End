import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000') + '/';

const getAuthHeaders = () => {
    const token = localStorage.getItem('accessToken');
    return {
        'Authorization': token ? `Bearer ${token}` : '',
    };
};

const axiosInstance = axios.create({
    baseURL: API_URL,
});

axiosInstance.interceptors.request.use((config) => {
    const authHeaders = getAuthHeaders();
    config.headers = {
        ...config.headers,
        ...authHeaders,
        'Content-Type': 'application/json',
    };
    return config;
});

export function HorariosProfesor() {
    const [horarios, setHorarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [profesorId, setProfesorId] = useState(null);
    const [selectedGrado, setSelectedGrado] = useState('');

    useEffect(() => {
        cargarDatosProfesor();
    }, []);

    useEffect(() => {
        if (profesorId) {
            cargarHorarios();
        }
    }, [profesorId, selectedGrado]);

    const cargarDatosProfesor = async () => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            console.log('Usuario del localStorage:', user);
            if (user && user.id) {
                // Obtener el perfil del profesor
                const response = await axiosInstance.get(`usuarios/profesor/`);
                console.log('Lista completa de profesores:', response.data);
                
                // Buscar el profesor - el campo usuario puede venir como objeto o como ID
                const profesor = response.data.find(p => {
                    const usuarioId = typeof p.usuario === 'object' ? p.usuario?.id : p.usuario;
                    // Convertir ambos a números para comparación segura
                    const usuarioIdNum = Number(usuarioId);
                    const userIdNum = Number(user.id);
                    console.log(`Comparando: usuarioId=${usuarioId} (${typeof usuarioId}) -> ${usuarioIdNum}, user.id=${user.id} (${typeof user.id}) -> ${userIdNum}`);
                    return usuarioIdNum === userIdNum;
                });
                
                if (profesor) {
                    console.log('Profesor encontrado:', profesor);
                    setProfesorId(profesor.id);
                } else {
                    console.warn('No se encontró el profesor para el usuario:', user.id);
                    console.warn('Profesores disponibles:', response.data.map(p => ({
                        id: p.id,
                        usuario: p.usuario,
                        nombre: p.nombre
                    })));
                }
            }
        } catch (error) {
            console.error('Error al cargar datos del profesor:', error);
        }
    };

    const cargarHorarios = async () => {
        setLoading(true);
        try {
            // Filtrar horarios por profesor usando parámetro de consulta si está disponible
            // Si no, obtener todos y filtrar en el frontend
            const response = await axiosInstance.get('horarios/');
            console.log('Todos los horarios:', response.data);
            console.log('Profesor ID:', profesorId);
            
            // El campo profesor puede venir como ID numérico o como objeto con id
            let horariosFiltrados = response.data.filter(h => {
                const profesorHorario = typeof h.profesor === 'object' ? h.profesor?.id : h.profesor;
                return profesorHorario === profesorId;
            });
            
            console.log('Horarios filtrados por profesor:', horariosFiltrados);
            
            if (selectedGrado) {
                horariosFiltrados = horariosFiltrados.filter(h => {
                    const gradoSeccionId = typeof h.grado_seccion === 'object' ? h.grado_seccion?.id : h.grado_seccion;
                    return gradoSeccionId === parseInt(selectedGrado);
                });
            }
            
            // Ordenar por día de la semana y hora
            const ordenDias = { 'lunes': 1, 'martes': 2, 'miercoles': 3, 'jueves': 4, 'viernes': 5 };
            horariosFiltrados.sort((a, b) => {
                if (ordenDias[a.dia_semana] !== ordenDias[b.dia_semana]) {
                    return ordenDias[a.dia_semana] - ordenDias[b.dia_semana];
                }
                return a.hora_inicio.localeCompare(b.hora_inicio);
            });
            
            console.log('Horarios finales:', horariosFiltrados);
            setHorarios(horariosFiltrados);
        } catch (error) {
            console.error('Error al cargar horarios:', error);
        } finally {
            setLoading(false);
        }
    };

    const [gradosSecciones, setGradosSecciones] = useState([]);

    useEffect(() => {
        cargarGradosSecciones();
    }, []);

    const cargarGradosSecciones = async () => {
        try {
            const response = await axiosInstance.get('core/grado-seccion/');
            setGradosSecciones(response.data);
        } catch (error) {
            console.error('Error al cargar grados:', error);
        }
    };

    const dias = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'];
    const diasLabels = {
        'lunes': 'Lunes',
        'martes': 'Martes',
        'miercoles': 'Miércoles',
        'jueves': 'Jueves',
        'viernes': 'Viernes'
    };

    // Agrupar horarios por día
    const horariosPorDia = {};
    dias.forEach(dia => {
        horariosPorDia[dia] = horarios.filter(h => h.dia_semana === dia);
    });

    return (
        <div className="main-content">
            <div className="header">
                <div className="page-title" style={{width: '100%', textAlign: 'center'}}>
                    <h1 style={{color: 'var(--dark)', margin: 0}}>Mis Horarios</h1>
                    <p style={{color: 'var(--gray)', margin: '8px 0 0 0'}}>Visualiza tus horarios asignados por grado y sección</p>
                </div>
            </div>

            <div className="section-card" style={{maxWidth: '1200px', margin: '0 auto'}}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '25px',
                    paddingBottom: '15px',
                    borderBottom: '2px solid var(--light-gray)'
                }}>
                    <h2 style={{
                        fontSize: '1.3rem',
                        fontWeight: '600',
                        color: 'var(--dark)',
                        margin: 0,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                    }}>
                        <i className="fas fa-clock" style={{color: 'var(--primary)', fontSize: '1.2rem'}}></i>
                        Horarios Asignados
                    </h2>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                    }}>
                        <label style={{
                            fontSize: '0.95rem',
                            fontWeight: '500',
                            color: 'var(--dark)'
                        }}>
                            Filtrar por Grado:
                        </label>
                        <select
                            value={selectedGrado}
                            onChange={(e) => setSelectedGrado(e.target.value)}
                            style={{
                                padding: '10px 15px',
                                border: '2px solid var(--light-gray)',
                                borderRadius: 'var(--border-radius)',
                                fontSize: '0.95rem',
                                background: 'white',
                                color: 'var(--dark)',
                                cursor: 'pointer',
                                transition: 'var(--transition)',
                                minWidth: '200px'
                            }}
                            onFocus={(e) => {
                                e.currentTarget.style.borderColor = 'var(--primary)';
                                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(67, 97, 238, 0.1)';
                            }}
                            onBlur={(e) => {
                                e.currentTarget.style.borderColor = 'var(--light-gray)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        >
                            <option value="">Todos los grados</option>
                            {gradosSecciones.map((grado) => (
                                <option key={grado.id} value={grado.id}>
                                    {grado.grado} {grado.seccion} ({grado.nivel})
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div style={{
                        padding: '40px',
                        textAlign: 'center',
                        color: 'var(--gray)',
                        fontSize: '0.95rem'
                    }}>
                        <i className="fas fa-spinner fa-spin" style={{
                            fontSize: '2rem',
                            marginBottom: '15px',
                            display: 'block'
                        }}></i>
                        Cargando horarios...
                    </div>
                ) : horarios.length === 0 ? (
                    <div style={{
                        padding: '40px',
                        textAlign: 'center',
                        color: 'var(--gray)',
                        fontSize: '0.95rem'
                    }}>
                        <i className="fas fa-calendar-times" style={{
                            fontSize: '3rem',
                            color: 'var(--light-gray)',
                            marginBottom: '15px',
                            display: 'block'
                        }}></i>
                        No tienes horarios asignados
                    </div>
                ) : (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                        gap: '20px'
                    }}>
                        {dias.map((dia) => (
                            <div key={dia} style={{
                                background: 'white',
                                border: '2px solid var(--light-gray)',
                                borderRadius: 'var(--border-radius)',
                                padding: '20px',
                                transition: 'var(--transition)',
                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = 'var(--primary)';
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(67, 97, 238, 0.15)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = 'var(--light-gray)';
                                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.05)';
                            }}
                            >
                                <h3 style={{
                                    fontSize: '1.1rem',
                                    fontWeight: '600',
                                    color: 'var(--primary)',
                                    marginBottom: '15px',
                                    paddingBottom: '10px',
                                    borderBottom: '2px solid var(--light-gray)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}>
                                    <i className="fas fa-calendar-day" style={{fontSize: '0.9rem'}}></i>
                                    {diasLabels[dia]}
                                </h3>
                                {horariosPorDia[dia].length === 0 ? (
                                    <p style={{
                                        color: 'var(--gray)',
                                        fontSize: '0.9rem',
                                        fontStyle: 'italic',
                                        textAlign: 'center',
                                        padding: '20px 0'
                                    }}>
                                        Sin clases este día
                                    </p>
                                ) : (
                                    <div style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '12px'
                                    }}>
                                        {horariosPorDia[dia].map((horario) => {
                                            // Manejar grado_seccion que puede venir como objeto o ID
                                            const gradoSeccionId = typeof horario.grado_seccion === 'object' 
                                                ? horario.grado_seccion?.id 
                                                : horario.grado_seccion;
                                            const gradoSeccion = gradosSecciones.find(g => g.id === gradoSeccionId);
                                            
                                            // Manejar materia que puede venir como objeto o ID
                                            const materiaNombre = typeof horario.materia === 'object' 
                                                ? horario.materia?.nombre 
                                                : (horario.materia_nombre || horario.materia);
                                            
                                            return (
                                                <div key={horario.id} style={{
                                                    padding: '12px',
                                                    background: 'rgba(67, 97, 238, 0.05)',
                                                    borderRadius: 'var(--border-radius)',
                                                    border: '1px solid rgba(67, 97, 238, 0.1)'
                                                }}>
                                                    <div style={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'flex-start',
                                                        marginBottom: '8px'
                                                    }}>
                                                        <div>
                                                            <p style={{
                                                                margin: 0,
                                                                fontSize: '0.95rem',
                                                                fontWeight: '600',
                                                                color: 'var(--dark)'
                                                            }}>
                                                                {materiaNombre}
                                                            </p>
                                                            {gradoSeccion && (
                                                                <p style={{
                                                                    margin: '4px 0 0 0',
                                                                    fontSize: '0.85rem',
                                                                    color: 'var(--gray)'
                                                                }}>
                                                                    {gradoSeccion.grado} {gradoSeccion.seccion}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <div style={{
                                                            padding: '6px 12px',
                                                            background: 'var(--primary)',
                                                            color: 'white',
                                                            borderRadius: '20px',
                                                            fontSize: '0.8rem',
                                                            fontWeight: '500',
                                                            whiteSpace: 'nowrap'
                                                        }}>
                                                            {horario.hora_inicio?.substring(0, 5) || horario.hora_inicio} - {horario.hora_fin?.substring(0, 5) || horario.hora_fin}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
