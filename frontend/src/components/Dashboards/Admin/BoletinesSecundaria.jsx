import { useState, useEffect } from 'react';
import axios from 'axios';
import './css/Listas.css';
import './css/Boletines.css';

const API_URL = (import.meta.env.VITE_API_URL || 'https://liceo-publico.onrender.com') + '/';

// Función para obtener el token actual
const getAuthHeaders = () => {
    const token = localStorage.getItem('accessToken');
    return {
        'Authorization': token ? `Bearer ${token}` : '',
    };
};

const axiosInstance = axios.create({
    baseURL: API_URL,
});

// Interceptor para agregar el token en cada petición
axiosInstance.interceptors.request.use((config) => {
    const authHeaders = getAuthHeaders();
    config.headers = {
        ...config.headers,
        ...authHeaders,
        'Content-Type': 'application/json',
    };
    return config;
});

export default function BoletinesSecundaria() {
    const [estudiantes, setEstudiantes] = useState([]);
    const [boletines, setBoletines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtroLapso, setFiltroLapso] = useState('1');
    const [filtroGrado, setFiltroGrado] = useState('');
    const [filtroSeccion, setFiltroSeccion] = useState('');
    const [busquedaTexto, setBusquedaTexto] = useState('');

    useEffect(() => {
        cargarEstudiantes();
        cargarBoletines();
    }, []);

    const cargarEstudiantes = async () => {
        try {
            const response = await axiosInstance.get('usuarios/estudiante/');
            // Filtrar solo estudiantes de secundaria
            const estudiantesSecundaria = response.data.filter(est => 
                est.grado_seccion && est.grado_seccion.nivel === 'secundaria'
            );
            setEstudiantes(estudiantesSecundaria);
            setLoading(false);
        } catch (error) {
            console.error('Error al cargar estudiantes:', error);
            setLoading(false);
        }
    };

    const cargarBoletines = async () => {
        try {
            const response = await axiosInstance.get('boletines/');
            setBoletines(response.data);
        } catch (error) {
            console.error('Error al cargar boletines:', error);
        }
    };

    const verificarNotasCompletas = async (estudianteId, lapso) => {
        try {
            const response = await axiosInstance.get(`calificaciones/?estudiante=${estudianteId}&lapso=${lapso}`);
            const calificaciones = response.data;
            
            if (!calificaciones || calificaciones.length === 0) {
                return false;
            }

            // Verificar que todas las calificaciones estén enviadas
            const todasEnviadas = calificaciones.every(cal => cal.enviado === true);
            
            // Verificar que todas tengan promedios calculados
            const todasConPromedio = calificaciones.every(cal => 
                cal.promedio_lapso !== null && cal.promedio_lapso !== undefined
            );

            return todasEnviadas && todasConPromedio;
        } catch (error) {
            console.error('Error al verificar notas:', error);
            return false;
        }
    };

    const generarBoletin = async (estudianteId, lapso) => {
        try {
            const response = await axiosInstance.post(`boletines/secundaria/${estudianteId}/lapso/${lapso}/generar/`);
            if (response.data) {
                alert('Boletín generado exitosamente');
                cargarBoletines();
            }
        } catch (error) {
            console.error('Error al generar boletín:', error);
            if (error.response?.data?.error) {
                alert(`Error: ${error.response.data.error}`);
            } else {
                alert('Error al generar el boletín');
            }
        }
    };

    const descargarBoletin = async (boletinId, estudianteNombre, lapso) => {
        try {
            const response = await axiosInstance.get(`boletines/${boletinId}/descargar/`, {
                responseType: 'blob',
            });
            
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `boletin_${estudianteNombre}_${lapso}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Error al descargar boletín:', error);
            alert('Error al descargar el boletín');
        }
    };

    const verVistaPrevia = async (estudianteId, lapso) => {
        try {
            // Primero verificar si existe el boletín
            const boletin = boletines.find(b => b.estudiante === estudianteId && b.lapso === lapso);
            if (!boletin) {
                const tieneNotas = await verificarNotasCompletas(estudianteId, lapso);
                if (!tieneNotas) {
                    alert('El estudiante no tiene todas las notas completas para este lapso');
                    return;
                }
                // Generar el boletín primero
                await generarBoletin(estudianteId, lapso);
                await cargarBoletines();
            }
            
            // Abrir la vista previa en una nueva ventana
            const token = localStorage.getItem('accessToken');
            const url = `${API_URL}boletines/secundaria/${estudianteId}/lapso/${lapso}/vista-previa/`;
            const newWindow = window.open('', '_blank');
            if (newWindow) {
                // Hacer una petición para obtener el HTML y mostrarlo
                try {
                    const response = await axiosInstance.get(`boletines/secundaria/${estudianteId}/lapso/${lapso}/vista-previa/`, {
                        responseType: 'text',
                    });
                    newWindow.document.write(response.data);
                    newWindow.document.close();
                } catch (error) {
                    // Si falla, intentar abrir directamente la URL
                    newWindow.location.href = url;
                }
            }
        } catch (error) {
            console.error('Error al abrir vista previa:', error);
            if (error.response?.status === 404) {
                alert('No existe boletín para este estudiante y lapso. Debe generarlo primero.');
            } else {
                alert('Error al abrir la vista previa');
            }
        }
    };

    // Filtrar estudiantes
    const estudiantesFiltrados = estudiantes.filter(estudiante => {
        const matchLapso = !filtroLapso || true; // El lapso se verifica por boletín
        const matchGrado = !filtroGrado || (estudiante.grado_seccion && estudiante.grado_seccion.grado === filtroGrado);
        const matchSeccion = !filtroSeccion || (estudiante.grado_seccion && estudiante.grado_seccion.seccion === filtroSeccion);
        const matchTexto = !busquedaTexto || 
            estudiante.nombre?.toLowerCase().includes(busquedaTexto.toLowerCase()) ||
            estudiante.apellido?.toLowerCase().includes(busquedaTexto.toLowerCase()) ||
            estudiante.cedula?.toString().includes(busquedaTexto);

        return matchGrado && matchSeccion && matchTexto;
    });

    // Obtener grados únicos de secundaria
    const gradosUnicos = [...new Set(estudiantes
        .filter(e => e.grado_seccion)
        .map(e => e.grado_seccion.grado)
        .filter(g => g))].sort();

    // Obtener secciones únicas
    const seccionesUnicas = [...new Set(estudiantes
        .filter(e => e.grado_seccion)
        .map(e => e.grado_seccion.seccion)
        .filter(s => s))].sort();

    if (loading) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
                <p>Cargando estudiantes...</p>
            </div>
        );
    }

    return (
        <div style={{ padding: '2rem' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.5rem' }}>
                    Generar Boletines
                </h1>
                <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>
                    Sistema de Gestión Liceos Públicos
                </p>
            </div>

            <div style={{
                background: 'white',
                borderRadius: '12px',
                padding: '1.5rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1.5rem',
                    flexWrap: 'wrap',
                    gap: '1rem'
                }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1f2937' }}>
                        Generar Boletines en PDF
                    </h2>
                    
                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                        <select
                            value={filtroLapso}
                            onChange={(e) => setFiltroLapso(e.target.value)}
                            style={{
                                padding: '0.5rem 1rem',
                                border: '1px solid #d1d5db',
                                borderRadius: '6px',
                                fontSize: '0.875rem',
                                background: 'white'
                            }}
                        >
                            <option value="1">Primer Lapso</option>
                            <option value="2">Segundo Lapso</option>
                            <option value="3">Tercer Lapso</option>
                        </select>

                        <select
                            value={filtroGrado}
                            onChange={(e) => setFiltroGrado(e.target.value)}
                            style={{
                                padding: '0.5rem 1rem',
                                border: '1px solid #d1d5db',
                                borderRadius: '6px',
                                fontSize: '0.875rem',
                                background: 'white'
                            }}
                        >
                            <option value="">Todos los años</option>
                            {gradosUnicos.map(grado => (
                                <option key={grado} value={grado}>
                                    {grado === '1' ? '1° Año' : 
                                     grado === '2' ? '2° Año' :
                                     grado === '3' ? '3° Año' :
                                     grado === '4' ? '4° Año' :
                                     grado === '5' ? '5° Año' : `${grado}° Año`}
                                </option>
                            ))}
                        </select>

                        <select
                            value={filtroSeccion}
                            onChange={(e) => setFiltroSeccion(e.target.value)}
                            style={{
                                padding: '0.5rem 1rem',
                                border: '1px solid #d1d5db',
                                borderRadius: '6px',
                                fontSize: '0.875rem',
                                background: 'white'
                            }}
                        >
                            <option value="">Todas las secciones</option>
                            {seccionesUnicas.map(seccion => (
                                <option key={seccion} value={seccion}>
                                    Sección {seccion}
                                </option>
                            ))}
                        </select>

                        <input
                            type="text"
                            placeholder="Buscar estudiante..."
                            value={busquedaTexto}
                            onChange={(e) => setBusquedaTexto(e.target.value)}
                            style={{
                                padding: '0.5rem 1rem',
                                border: '1px solid #d1d5db',
                                borderRadius: '6px',
                                fontSize: '0.875rem',
                                minWidth: '200px'
                            }}
                        />
                    </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{
                        width: '100%',
                        borderCollapse: 'collapse',
                        marginTop: '1rem'
                    }}>
                        <thead>
                            <tr style={{
                                background: '#3b82f6',
                                color: 'white'
                            }}>
                                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', fontSize: '0.9rem' }}>
                                    Estudiante
                                </th>
                                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', fontSize: '0.9rem' }}>
                                    Cédula
                                </th>
                                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', fontSize: '0.9rem' }}>
                                    Año
                                </th>
                                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', fontSize: '0.9rem' }}>
                                    Sección
                                </th>
                                <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: '600', fontSize: '0.9rem' }}>
                                    Notas Completas
                                </th>
                                <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: '600', fontSize: '0.9rem' }}>
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {estudiantesFiltrados.map((estudiante) => {
                                const gradoTexto = estudiante.grado_seccion?.grado === '1' ? '1er' :
                                                  estudiante.grado_seccion?.grado === '2' ? '2do' :
                                                  estudiante.grado_seccion?.grado === '3' ? '3er' :
                                                  estudiante.grado_seccion?.grado === '4' ? '4to' :
                                                  estudiante.grado_seccion?.grado === '5' ? '5to' :
                                                  `${estudiante.grado_seccion?.grado}°`;
                                
                                return (
                                    <tr key={estudiante.id} style={{
                                        borderBottom: '1px solid #e5e7eb',
                                        background: 'white'
                                    }}>
                                        <td style={{ padding: '14px 16px', color: '#1f2937' }}>
                                            {estudiante.nombre} {estudiante.apellido}
                                        </td>
                                        <td style={{ padding: '14px 16px', color: '#1f2937' }}>
                                            {estudiante.cedula || 'N/A'}
                                        </td>
                                        <td style={{ padding: '14px 16px', color: '#1f2937' }}>
                                            {gradoTexto} año
                                        </td>
                                        <td style={{ padding: '14px 16px', color: '#1f2937' }}>
                                            {estudiante.grado_seccion?.seccion || 'N/A'}
                                        </td>
                                        <td style={{ padding: '14px 16px', textAlign: 'center', color: '#1f2937' }}>
                                            <NotasCompletasCell estudianteId={estudiante.id} lapso={filtroLapso} />
                                        </td>
                                        <td style={{ padding: '14px 16px', textAlign: 'center', verticalAlign: 'middle' }}>
                                            <div style={{ 
                                                display: 'flex', 
                                                flexDirection: 'row', 
                                                gap: '0.25rem', 
                                                alignItems: 'center', 
                                                justifyContent: 'center',
                                                margin: 0,
                                                padding: 0
                                            }}>
                                                <button
                                                    onClick={() => verVistaPrevia(estudiante.id, filtroLapso)}
                                                    style={{
                                                        width: '48px',
                                                        height: '48px',
                                                        borderRadius: '50%',
                                                        border: 'none',
                                                        background: 'transparent',
                                                        color: '#000000',
                                                        cursor: 'pointer',
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontSize: '0.75rem',
                                                        padding: 0,
                                                        margin: 0,
                                                        lineHeight: 1,
                                                        verticalAlign: 'middle'
                                                    }}
                                                    title="Ver vista previa"
                                                >
                                                    <i className="fas fa-eye" style={{ fontSize: '0.75rem', lineHeight: 1 }}></i>
                                                </button>
                                                <button
                                                    onClick={async () => {
                                                        const lapso = filtroLapso;
                                                        const tieneNotas = await verificarNotasCompletas(estudiante.id, lapso);
                                                        if (tieneNotas) {
                                                            let boletin = boletines.find(b => b.estudiante === estudiante.id && b.lapso === lapso);
                                                            if (!boletin) {
                                                                await generarBoletin(estudiante.id, lapso);
                                                                // Recargar boletines y esperar
                                                                const response = await axiosInstance.get('boletines/');
                                                                const nuevosBoletines = response.data;
                                                                const nuevoBoletin = nuevosBoletines.find(b => b.estudiante === estudiante.id && b.lapso === lapso);
                                                                if (nuevoBoletin) {
                                                                    descargarBoletin(nuevoBoletin.id, `${estudiante.nombre}_${estudiante.apellido}`, lapso);
                                                                }
                                                                setBoletines(nuevosBoletines);
                                                            } else {
                                                                descargarBoletin(boletin.id, `${estudiante.nombre}_${estudiante.apellido}`, lapso);
                                                            }
                                                        } else {
                                                            alert('El estudiante no tiene todas las notas completas para este lapso');
                                                        }
                                                    }}
                                                    style={{
                                                        width: '28px',
                                                        height: '28px',
                                                        borderRadius: '50%',
                                                        border: 'none',
                                                        background: 'transparent',
                                                        color: '#000000',
                                                        cursor: 'pointer',
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontSize: '0.75rem',
                                                        padding: 0,
                                                        margin: 0,
                                                        lineHeight: 1,
                                                        verticalAlign: 'middle'
                                                    }}
                                                    title="Descargar boletín"
                                                >
                                                    <i className="fas fa-download" style={{ fontSize: '0.75rem', lineHeight: 1 }}></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {estudiantesFiltrados.length === 0 && (
                    <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
                        <p>No hay estudiantes de secundaria que coincidan con los filtros.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

// Componente para verificar notas completas
function NotasCompletasCell({ estudianteId, lapso = '1' }) {
    const [notasCompletas, setNotasCompletas] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const verificar = async () => {
            try {
                const response = await axiosInstance.get(`calificaciones/?estudiante=${estudianteId}&lapso=${lapso}`);
                const calificaciones = response.data;
                
                if (!calificaciones || calificaciones.length === 0) {
                    setNotasCompletas(false);
                    setLoading(false);
                    return;
                }

                const todasEnviadas = calificaciones.every(cal => cal.enviado === true);
                const todasConPromedio = calificaciones.every(cal => 
                    cal.promedio_lapso !== null && cal.promedio_lapso !== undefined
                );

                setNotasCompletas(todasEnviadas && todasConPromedio);
            } catch (error) {
                console.error('Error al verificar notas:', error);
                setNotasCompletas(false);
            } finally {
                setLoading(false);
            }
        };

        verificar();
    }, [estudianteId, lapso]);

    if (loading) {
        return <span style={{ color: '#6b7280' }}>Verificando...</span>;
    }

    return (
        <span style={{ 
            color: notasCompletas ? '#10b981' : '#ef4444',
            fontWeight: '500'
        }}>
            {notasCompletas ? 'Sí' : 'No'}
        </span>
    );
}
