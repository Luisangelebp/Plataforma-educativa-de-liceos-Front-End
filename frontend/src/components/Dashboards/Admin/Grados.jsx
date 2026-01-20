import { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL || 'https://liceo-publico.onrender.com';

function ListaGrados({ setShowHorario }) {
    const [grados, setGrados] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('table'); // 'cards' o 'table'
    const [filtroNivel, setFiltroNivel] = useState('todos'); // 'todos', 'primaria', 'secundaria'
    const [filtroGrado, setFiltroGrado] = useState('');
    const [filtroSeccion, setFiltroSeccion] = useState('');
    const [busquedaTexto, setBusquedaTexto] = useState('');

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

    // Función para filtrar grados
    const gradosFiltrados = useMemo(() => {
        let filtrados = [...grados];

        // Filtro por nivel
        if (filtroNivel !== 'todos') {
            filtrados = filtrados.filter(
                (grado) => grado.nivel === filtroNivel
            );
        }

        // Filtro por grado
        if (filtroGrado) {
            filtrados = filtrados.filter(
                (grado) => grado.grado.toString() === filtroGrado
            );
        }

        // Filtro por sección
        if (filtroSeccion) {
            filtrados = filtrados.filter(
                (grado) => grado.seccion === filtroSeccion
            );
        }

        // Búsqueda por texto (grado o sección)
        if (busquedaTexto) {
            const texto = busquedaTexto.toLowerCase();
            filtrados = filtrados.filter(
                (grado) =>
                    grado.grado.toString().toLowerCase().includes(texto) ||
                    grado.seccion.toLowerCase().includes(texto) ||
                    grado.nivel.toLowerCase().includes(texto)
            );
        }

        return filtrados;
    }, [grados, filtroNivel, filtroGrado, filtroSeccion, busquedaTexto]);

    const primaria = useMemo(
        () => gradosFiltrados.filter((grado) => grado.nivel === 'primaria'),
        [gradosFiltrados]
    );
    const secundaria = useMemo(
        () => gradosFiltrados.filter((grado) => grado.nivel === 'secundaria'),
        [gradosFiltrados]
    );

    // Obtener grados y secciones únicos para los filtros
    const gradosUnicos = useMemo(() => {
        const gradosSet = new Set(grados.map((g) => g.grado));
        return Array.from(gradosSet).sort((a, b) => Number(a) - Number(b));
    }, [grados]);

    const seccionesUnicas = useMemo(() => {
        const seccionesSet = new Set(grados.map((g) => g.seccion));
        return Array.from(seccionesSet).sort();
    }, [grados]);

    const handleDelete = async (grado) => {
        if (
            confirm(
                `¿Eliminar el grado ${grado.grado} sección ${grado.seccion}?`
            )
        ) {
            try {
                await axios.delete(`${API_URL}/grado-seccion/${grado.id}/`);
                alert('Grado eliminado correctamente.');
                setGrados(grados.filter((m) => m.id !== grado.id));
            } catch (error) {
                console.error('Error al eliminar el grado:', error);
                alert('Error al eliminar el grado.');
            }
        }
    };

    if (loading) {
        return (
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: '50px',
                    color: 'var(--gray)',
                }}
            >
                Cargando grados...
            </div>
        );
    }

    return (
        <>
            {/* Filtros de búsqueda */}
            {grados.length > 0 && (
                <div
                    className="section-card"
                    style={{ marginBottom: '20px', padding: '15px' }}
                >
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '10px',
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                marginBottom: '5px',
                            }}
                        >
                            <h3
                                style={{
                                    fontSize: '0.95rem',
                                    fontWeight: '600',
                                    color: 'var(--dark)',
                                    margin: 0,
                                }}
                            >
                                <i
                                    className="fas fa-filter"
                                    style={{
                                        marginRight: '6px',
                                        color: 'var(--primary)',
                                        fontSize: '0.85rem',
                                    }}
                                ></i>
                                Filtros
                            </h3>
                            {(filtroNivel !== 'todos' ||
                                filtroGrado ||
                                filtroSeccion ||
                                busquedaTexto) && (
                                <button
                                    onClick={() => {
                                        setFiltroNivel('todos');
                                        setFiltroGrado('');
                                        setFiltroSeccion('');
                                        setBusquedaTexto('');
                                    }}
                                    title="Limpiar filtros"
                                    style={{
                                        width: '20px',
                                        height: '20px',
                                        padding: '0',
                                        background: 'transparent',
                                        color: 'var(--gray)',
                                        border: 'none',
                                        borderRadius: 'var(--border-radius-sm)',
                                        fontSize: '0.85rem',
                                        cursor: 'pointer',
                                        transition: 'var(--transition)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.color =
                                            'var(--primary)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.color =
                                            'var(--gray)';
                                    }}
                                >
                                    <i className="fas fa-times"></i>
                                </button>
                            )}
                        </div>

                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns:
                                    'repeat(auto-fit, minmax(150px, 1fr))',
                                gap: '8px',
                            }}
                        >
                            {/* Filtro por nivel */}
                            <div>
                                <label
                                    style={{
                                        display: 'block',
                                        marginBottom: '4px',
                                        fontSize: '0.75rem',
                                        fontWeight: '600',
                                        color: 'var(--dark)',
                                    }}
                                >
                                    Nivel
                                </label>
                                <select
                                    value={filtroNivel}
                                    onChange={(e) =>
                                        setFiltroNivel(e.target.value)
                                    }
                                    style={{
                                        width: '100%',
                                        padding: '6px 8px',
                                        border: '1px solid var(--light-gray)',
                                        borderRadius: 'var(--border-radius-sm)',
                                        fontSize: '0.8rem',
                                        background: 'white',
                                        color: 'var(--dark)',
                                        cursor: 'pointer',
                                    }}
                                >
                                    <option value="todos">Todos</option>
                                    <option value="primaria">Primaria</option>
                                    <option value="secundaria">
                                        Secundaria
                                    </option>
                                </select>
                            </div>

                            {/* Filtro por grado */}
                            <div>
                                <label
                                    style={{
                                        display: 'block',
                                        marginBottom: '4px',
                                        fontSize: '0.75rem',
                                        fontWeight: '600',
                                        color: 'var(--dark)',
                                    }}
                                >
                                    Grado/Año
                                </label>
                                <select
                                    value={filtroGrado}
                                    onChange={(e) =>
                                        setFiltroGrado(e.target.value)
                                    }
                                    style={{
                                        width: '100%',
                                        padding: '6px 8px',
                                        border: '1px solid var(--light-gray)',
                                        borderRadius: 'var(--border-radius-sm)',
                                        fontSize: '0.8rem',
                                        background: 'white',
                                        color: 'var(--dark)',
                                        cursor: 'pointer',
                                    }}
                                >
                                    <option value="">Todos</option>
                                    {gradosUnicos.map((grado) => (
                                        <option key={grado} value={grado}>
                                            {grado}°
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Filtro por sección */}
                            <div>
                                <label
                                    style={{
                                        display: 'block',
                                        marginBottom: '4px',
                                        fontSize: '0.75rem',
                                        fontWeight: '600',
                                        color: 'var(--dark)',
                                    }}
                                >
                                    Sección
                                </label>
                                <select
                                    value={filtroSeccion}
                                    onChange={(e) =>
                                        setFiltroSeccion(e.target.value)
                                    }
                                    style={{
                                        width: '100%',
                                        padding: '6px 8px',
                                        border: '1px solid var(--light-gray)',
                                        borderRadius: 'var(--border-radius-sm)',
                                        fontSize: '0.8rem',
                                        background: 'white',
                                        color: 'var(--dark)',
                                        cursor: 'pointer',
                                    }}
                                >
                                    <option value="">Todas</option>
                                    {seccionesUnicas.map((seccion) => (
                                        <option key={seccion} value={seccion}>
                                            {seccion}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Búsqueda por texto */}
                            <div>
                                <label
                                    style={{
                                        display: 'block',
                                        marginBottom: '4px',
                                        fontSize: '0.75rem',
                                        fontWeight: '600',
                                        color: 'var(--dark)',
                                    }}
                                >
                                    Búsqueda
                                </label>
                                <input
                                    type="text"
                                    value={busquedaTexto}
                                    onChange={(e) =>
                                        setBusquedaTexto(e.target.value)
                                    }
                                    placeholder="Buscar..."
                                    style={{
                                        width: '100%',
                                        padding: '6px 8px',
                                        border: '1px solid var(--light-gray)',
                                        borderRadius: 'var(--border-radius-sm)',
                                        fontSize: '0.8rem',
                                        background: 'white',
                                        color: 'var(--dark)',
                                    }}
                                />
                            </div>
                        </div>

                        {/* Mostrar cantidad de resultados */}
                        <div
                            style={{
                                fontSize: '0.75rem',
                                color: 'var(--gray)',
                                fontStyle: 'italic',
                                marginTop: '2px',
                            }}
                        >
                            Mostrando {gradosFiltrados.length} de{' '}
                            {grados.length} grado(s)
                        </div>
                    </div>
                </div>
            )}

            {grados.length === 0 ? (
                <div
                    className="section-card"
                    style={{ textAlign: 'center', padding: '40px' }}
                >
                    <p style={{ color: 'var(--gray)', fontSize: '1rem' }}>
                        No hay grados registrados.
                    </p>
                </div>
            ) : gradosFiltrados.length === 0 ? (
                <div
                    className="section-card"
                    style={{ textAlign: 'center', padding: '40px' }}
                >
                    <p style={{ color: 'var(--gray)', fontSize: '1rem' }}>
                        No hay grados que coincidan con los filtros
                        seleccionados.
                    </p>
                </div>
            ) : (
                <>
                    {primaria.length > 0 && (
                        <div
                            className="section-card"
                            style={{ marginBottom: '25px' }}
                        >
                            <div
                                className="section-header"
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: '25px',
                                }}
                            >
                                <h2
                                    className="section-title"
                                    style={{
                                        fontSize: '1.3rem',
                                        fontWeight: '600',
                                        margin: 0,
                                    }}
                                >
                                    Primaria
                                </h2>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button
                                        className={`view-btn ${
                                            viewMode === 'cards' ? 'active' : ''
                                        }`}
                                        onClick={() => setViewMode('cards')}
                                        title="Vista de tarjetas"
                                        style={{
                                            width: '40px',
                                            height: '40px',
                                            padding: '0',
                                            background:
                                                viewMode === 'cards'
                                                    ? 'var(--primary)'
                                                    : 'white',
                                            color:
                                                viewMode === 'cards'
                                                    ? 'white'
                                                    : 'var(--gray)',
                                            border: `2px solid ${
                                                viewMode === 'cards'
                                                    ? 'var(--primary)'
                                                    : 'var(--light-gray)'
                                            }`,
                                            borderRadius:
                                                'var(--border-radius-sm)',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            transition: 'var(--transition)',
                                            fontSize: '0.9rem',
                                        }}
                                    >
                                        <i className="fas fa-th"></i>
                                    </button>
                                    <button
                                        className={`view-btn ${
                                            viewMode === 'table' ? 'active' : ''
                                        }`}
                                        onClick={() => setViewMode('table')}
                                        title="Vista de tabla"
                                        style={{
                                            width: '40px',
                                            height: '40px',
                                            padding: '0',
                                            background:
                                                viewMode === 'table'
                                                    ? 'var(--primary)'
                                                    : 'white',
                                            color:
                                                viewMode === 'table'
                                                    ? 'white'
                                                    : 'var(--gray)',
                                            border: `2px solid ${
                                                viewMode === 'table'
                                                    ? 'var(--primary)'
                                                    : 'var(--light-gray)'
                                            }`,
                                            borderRadius:
                                                'var(--border-radius-sm)',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            transition: 'var(--transition)',
                                            fontSize: '0.9rem',
                                        }}
                                    >
                                        <i className="fas fa-table"></i>
                                    </button>
                                </div>
                            </div>
                            {viewMode === 'cards' ? (
                                <div
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns:
                                            'repeat(auto-fill, minmax(280px, 1fr))',
                                        gap: '18px',
                                    }}
                                >
                                    {primaria.map((grado) => (
                                        <div
                                            key={grado.id}
                                            style={{
                                                background: 'white',
                                                border: '1px solid var(--light-gray)',
                                                borderRadius:
                                                    'var(--border-radius)',
                                                padding: '20px',
                                                transition: 'var(--transition)',
                                                position: 'relative',
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.boxShadow =
                                                    'var(--box-shadow)';
                                                e.currentTarget.style.transform =
                                                    'translateY(-3px)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.boxShadow =
                                                    'none';
                                                e.currentTarget.style.transform =
                                                    'translateY(0)';
                                            }}
                                        >
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent:
                                                        'space-between',
                                                    marginBottom: '15px',
                                                }}
                                            >
                                                <div>
                                                    <h3
                                                        style={{
                                                            fontSize: '1rem',
                                                            fontWeight: '600',
                                                            color: 'var(--dark)',
                                                            marginBottom: '5px',
                                                        }}
                                                    >
                                                        {grado.grado}° Grado
                                                    </h3>
                                                    <p
                                                        style={{
                                                            color: 'var(--gray)',
                                                            fontSize: '0.85rem',
                                                            margin: 0,
                                                        }}
                                                    >
                                                        Sección:{' '}
                                                        <strong>
                                                            {grado.seccion}
                                                        </strong>
                                                    </p>
                                                </div>
                                                <div
                                                    style={{
                                                        width: '45px',
                                                        height: '45px',
                                                        borderRadius: '10px',
                                                        background:
                                                            'linear-gradient(135deg, var(--primary), var(--secondary))',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent:
                                                            'center',
                                                        color: 'white',
                                                        fontSize: '1rem',
                                                        fontWeight: '600',
                                                    }}
                                                >
                                                    {grado.grado}
                                                </div>
                                            </div>
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    gap: '8px',
                                                    marginTop: '15px',
                                                }}
                                            >
                                                <button
                                                    className="btn"
                                                    onClick={() =>
                                                        setShowHorario(grado.id)
                                                    }
                                                    style={{
                                                        flex: 1,
                                                        padding: '10px 12px',
                                                        fontSize: '0.85rem',
                                                        background:
                                                            'var(--info)',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius:
                                                            'var(--border-radius-sm)',
                                                        cursor: 'pointer',
                                                        transition:
                                                            'var(--transition)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent:
                                                            'center',
                                                        gap: '6px',
                                                        lineHeight: '1',
                                                        fontWeight: '500',
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.background =
                                                            '#3a7bd5';
                                                        e.currentTarget.style.transform =
                                                            'translateY(-2px)';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.background =
                                                            'var(--info)';
                                                        e.currentTarget.style.transform =
                                                            'translateY(0)';
                                                    }}
                                                >
                                                    Ver Horario
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleDelete(grado)
                                                    }
                                                    title="Eliminar grado"
                                                    style={{
                                                        width: '40px',
                                                        height: '40px',
                                                        padding: '0',
                                                        margin: '0',
                                                        background:
                                                            'var(--danger)',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius:
                                                            'var(--border-radius-sm)',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent:
                                                            'center',
                                                        transition:
                                                            'var(--transition)',
                                                        flexShrink: 0,
                                                        lineHeight: '1',
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.background =
                                                            '#d81b60';
                                                        e.currentTarget.style.transform =
                                                            'translateY(-2px)';
                                                        e.currentTarget.style.boxShadow =
                                                            '0 4px 12px rgba(247, 37, 133, 0.3)';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.background =
                                                            'var(--danger)';
                                                        e.currentTarget.style.transform =
                                                            'translateY(0)';
                                                        e.currentTarget.style.boxShadow =
                                                            'none';
                                                    }}
                                                >
                                                    <i
                                                        className="fas fa-trash"
                                                        style={{
                                                            fontSize: '0.8rem',
                                                            display:
                                                                'inline-flex',
                                                            alignItems:
                                                                'center',
                                                            justifyContent:
                                                                'center',
                                                            lineHeight: '1',
                                                            margin: '0',
                                                            padding: '0',
                                                        }}
                                                    ></i>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="data-table">
                                        <thead>
                                            <tr>
                                                <th
                                                    style={{
                                                        fontSize: '0.95rem',
                                                        fontWeight: '700',
                                                        padding: '16px 18px',
                                                    }}
                                                >
                                                    Grado
                                                </th>
                                                <th
                                                    style={{
                                                        fontSize: '0.95rem',
                                                        fontWeight: '700',
                                                        padding: '16px 18px',
                                                    }}
                                                >
                                                    Sección
                                                </th>
                                                <th
                                                    style={{
                                                        fontSize: '0.95rem',
                                                        fontWeight: '700',
                                                        padding: '16px 18px',
                                                    }}
                                                >
                                                    Nivel
                                                </th>
                                                <th
                                                    style={{
                                                        fontSize: '0.95rem',
                                                        fontWeight: '700',
                                                        padding: '16px 18px',
                                                    }}
                                                >
                                                    Acciones
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {primaria.map((grado) => (
                                                <tr key={grado.id}>
                                                    <td
                                                        style={{
                                                            fontSize: '1rem',
                                                            fontWeight: '600',
                                                            color: '#2c3e50',
                                                            padding:
                                                                '14px 18px',
                                                        }}
                                                    >
                                                        {grado.grado}° Grado
                                                    </td>
                                                    <td
                                                        style={{
                                                            fontSize: '1rem',
                                                            fontWeight: '600',
                                                            color: '#2c3e50',
                                                            padding:
                                                                '14px 18px',
                                                        }}
                                                    >
                                                        {grado.seccion}
                                                    </td>
                                                    <td
                                                        style={{
                                                            padding:
                                                                '14px 18px',
                                                        }}
                                                    >
                                                        <span
                                                            style={{
                                                                padding:
                                                                    '5px 12px',
                                                                borderRadius:
                                                                    '12px',
                                                                background:
                                                                    'rgba(67, 97, 238, 0.15)',
                                                                color: 'var(--primary)',
                                                                fontSize:
                                                                    '0.9rem',
                                                                fontWeight:
                                                                    '700',
                                                            }}
                                                        >
                                                            Primaria
                                                        </span>
                                                    </td>
                                                    <td
                                                        style={{
                                                            padding:
                                                                '14px 18px',
                                                        }}
                                                    >
                                                        <div
                                                            style={{
                                                                display: 'flex',
                                                                gap: '8px',
                                                                alignItems:
                                                                    'center',
                                                            }}
                                                        >
                                                            <button
                                                                onClick={() =>
                                                                    setShowHorario(
                                                                        grado.id
                                                                    )
                                                                }
                                                                style={{
                                                                    padding:
                                                                        '8px 14px',
                                                                    fontSize:
                                                                        '0.85rem',
                                                                    background:
                                                                        'var(--info)',
                                                                    color: 'white',
                                                                    border: 'none',
                                                                    borderRadius:
                                                                        'var(--border-radius-sm)',
                                                                    cursor: 'pointer',
                                                                    display:
                                                                        'flex',
                                                                    alignItems:
                                                                        'center',
                                                                    justifyContent:
                                                                        'center',
                                                                    gap: '6px',
                                                                    transition:
                                                                        'var(--transition)',
                                                                    lineHeight:
                                                                        '1',
                                                                }}
                                                                onMouseEnter={(
                                                                    e
                                                                ) => {
                                                                    e.currentTarget.style.background =
                                                                        '#3a7bd5';
                                                                }}
                                                                onMouseLeave={(
                                                                    e
                                                                ) => {
                                                                    e.currentTarget.style.background =
                                                                        'var(--info)';
                                                                }}
                                                            >
                                                                <i
                                                                    className="fas fa-clock"
                                                                    style={{
                                                                        fontSize:
                                                                            '0.7rem',
                                                                        display:
                                                                            'inline-flex',
                                                                        alignItems:
                                                                            'center',
                                                                        justifyContent:
                                                                            'center',
                                                                        lineHeight:
                                                                            '1',
                                                                        margin: '0',
                                                                        padding:
                                                                            '0',
                                                                    }}
                                                                ></i>
                                                                Ver Horario
                                                            </button>
                                                            <button
                                                                onClick={() =>
                                                                    handleDelete(
                                                                        grado
                                                                    )
                                                                }
                                                                title="Eliminar grado"
                                                                style={{
                                                                    width: '36px',
                                                                    height: '36px',
                                                                    padding:
                                                                        '0',
                                                                    background:
                                                                        'var(--danger)',
                                                                    color: 'white',
                                                                    border: 'none',
                                                                    borderRadius:
                                                                        'var(--border-radius-sm)',
                                                                    cursor: 'pointer',
                                                                    display:
                                                                        'flex',
                                                                    alignItems:
                                                                        'center',
                                                                    justifyContent:
                                                                        'center',
                                                                    transition:
                                                                        'var(--transition)',
                                                                    lineHeight:
                                                                        '1',
                                                                }}
                                                                onMouseEnter={(
                                                                    e
                                                                ) => {
                                                                    e.currentTarget.style.background =
                                                                        '#d81b60';
                                                                }}
                                                                onMouseLeave={(
                                                                    e
                                                                ) => {
                                                                    e.currentTarget.style.background =
                                                                        'var(--danger)';
                                                                }}
                                                            >
                                                                <i
                                                                    className="fas fa-trash"
                                                                    style={{
                                                                        fontSize:
                                                                            '0.7rem',
                                                                        display:
                                                                            'inline-flex',
                                                                        alignItems:
                                                                            'center',
                                                                        justifyContent:
                                                                            'center',
                                                                        lineHeight:
                                                                            '1',
                                                                        margin: '0',
                                                                        padding:
                                                                            '0',
                                                                    }}
                                                                ></i>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {secundaria.length > 0 && (
                        <div className="section-card">
                            <div
                                className="section-header"
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: '25px',
                                }}
                            >
                                <h2
                                    className="section-title"
                                    style={{
                                        fontSize: '1.3rem',
                                        fontWeight: '600',
                                        margin: 0,
                                    }}
                                >
                                    Secundaria
                                </h2>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button
                                        className={`view-btn ${
                                            viewMode === 'cards' ? 'active' : ''
                                        }`}
                                        onClick={() => setViewMode('cards')}
                                        title="Vista de tarjetas"
                                        style={{
                                            width: '40px',
                                            height: '40px',
                                            padding: '0',
                                            background:
                                                viewMode === 'cards'
                                                    ? 'var(--primary)'
                                                    : 'white',
                                            color:
                                                viewMode === 'cards'
                                                    ? 'white'
                                                    : 'var(--gray)',
                                            border: `2px solid ${
                                                viewMode === 'cards'
                                                    ? 'var(--primary)'
                                                    : 'var(--light-gray)'
                                            }`,
                                            borderRadius:
                                                'var(--border-radius-sm)',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            transition: 'var(--transition)',
                                            fontSize: '0.9rem',
                                        }}
                                    >
                                        <i className="fas fa-th"></i>
                                    </button>
                                    <button
                                        className={`view-btn ${
                                            viewMode === 'table' ? 'active' : ''
                                        }`}
                                        onClick={() => setViewMode('table')}
                                        title="Vista de tabla"
                                        style={{
                                            width: '40px',
                                            height: '40px',
                                            padding: '0',
                                            background:
                                                viewMode === 'table'
                                                    ? 'var(--primary)'
                                                    : 'white',
                                            color:
                                                viewMode === 'table'
                                                    ? 'white'
                                                    : 'var(--gray)',
                                            border: `2px solid ${
                                                viewMode === 'table'
                                                    ? 'var(--primary)'
                                                    : 'var(--light-gray)'
                                            }`,
                                            borderRadius:
                                                'var(--border-radius-sm)',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            transition: 'var(--transition)',
                                            fontSize: '0.9rem',
                                        }}
                                    >
                                        <i className="fas fa-table"></i>
                                    </button>
                                </div>
                            </div>
                            {viewMode === 'cards' ? (
                                <div
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns:
                                            'repeat(auto-fill, minmax(280px, 1fr))',
                                        gap: '18px',
                                    }}
                                >
                                    {secundaria.map((grado) => (
                                        <div
                                            key={grado.id}
                                            style={{
                                                background: 'white',
                                                border: '1px solid var(--light-gray)',
                                                borderRadius:
                                                    'var(--border-radius)',
                                                padding: '20px',
                                                transition: 'var(--transition)',
                                                position: 'relative',
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.boxShadow =
                                                    'var(--box-shadow)';
                                                e.currentTarget.style.transform =
                                                    'translateY(-3px)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.boxShadow =
                                                    'none';
                                                e.currentTarget.style.transform =
                                                    'translateY(0)';
                                            }}
                                        >
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent:
                                                        'space-between',
                                                    marginBottom: '15px',
                                                }}
                                            >
                                                <div>
                                                    <h3
                                                        style={{
                                                            fontSize: '1rem',
                                                            fontWeight: '600',
                                                            color: 'var(--dark)',
                                                            marginBottom: '5px',
                                                        }}
                                                    >
                                                        {grado.grado}° Año
                                                    </h3>
                                                    <p
                                                        style={{
                                                            color: 'var(--gray)',
                                                            fontSize: '0.85rem',
                                                            margin: 0,
                                                        }}
                                                    >
                                                        Sección:{' '}
                                                        <strong>
                                                            {grado.seccion}
                                                        </strong>
                                                    </p>
                                                </div>
                                                <div
                                                    style={{
                                                        width: '45px',
                                                        height: '45px',
                                                        borderRadius: '10px',
                                                        background:
                                                            'linear-gradient(135deg, var(--secondary), var(--primary))',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent:
                                                            'center',
                                                        color: 'white',
                                                        fontSize: '1rem',
                                                        fontWeight: '600',
                                                    }}
                                                >
                                                    {grado.grado}
                                                </div>
                                            </div>
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    gap: '8px',
                                                    marginTop: '15px',
                                                }}
                                            >
                                                <button
                                                    className="btn"
                                                    onClick={() =>
                                                        setShowHorario(grado.id)
                                                    }
                                                    style={{
                                                        flex: 1,
                                                        padding: '10px 12px',
                                                        fontSize: '0.85rem',
                                                        background:
                                                            'var(--info)',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius:
                                                            'var(--border-radius-sm)',
                                                        cursor: 'pointer',
                                                        transition:
                                                            'var(--transition)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent:
                                                            'center',
                                                        gap: '6px',
                                                        lineHeight: '1',
                                                        fontWeight: '500',
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.background =
                                                            '#3a7bd5';
                                                        e.currentTarget.style.transform =
                                                            'translateY(-2px)';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.background =
                                                            'var(--info)';
                                                        e.currentTarget.style.transform =
                                                            'translateY(0)';
                                                    }}
                                                >
                                                    Ver Horario
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleDelete(grado)
                                                    }
                                                    title="Eliminar grado"
                                                    style={{
                                                        width: '40px',
                                                        height: '40px',
                                                        padding: '0',
                                                        margin: '0',
                                                        background:
                                                            'var(--danger)',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius:
                                                            'var(--border-radius-sm)',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent:
                                                            'center',
                                                        transition:
                                                            'var(--transition)',
                                                        flexShrink: 0,
                                                        lineHeight: '1',
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.background =
                                                            '#d81b60';
                                                        e.currentTarget.style.transform =
                                                            'translateY(-2px)';
                                                        e.currentTarget.style.boxShadow =
                                                            '0 4px 12px rgba(247, 37, 133, 0.3)';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.background =
                                                            'var(--danger)';
                                                        e.currentTarget.style.transform =
                                                            'translateY(0)';
                                                        e.currentTarget.style.boxShadow =
                                                            'none';
                                                    }}
                                                >
                                                    <i
                                                        className="fas fa-trash"
                                                        style={{
                                                            fontSize: '0.8rem',
                                                            display:
                                                                'inline-flex',
                                                            alignItems:
                                                                'center',
                                                            justifyContent:
                                                                'center',
                                                            lineHeight: '1',
                                                            margin: '0',
                                                            padding: '0',
                                                        }}
                                                    ></i>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="data-table">
                                        <thead>
                                            <tr>
                                                <th
                                                    style={{
                                                        fontSize: '0.95rem',
                                                        fontWeight: '700',
                                                        padding: '16px 18px',
                                                    }}
                                                >
                                                    Año
                                                </th>
                                                <th
                                                    style={{
                                                        fontSize: '0.95rem',
                                                        fontWeight: '700',
                                                        padding: '16px 18px',
                                                    }}
                                                >
                                                    Sección
                                                </th>
                                                <th
                                                    style={{
                                                        fontSize: '0.95rem',
                                                        fontWeight: '700',
                                                        padding: '16px 18px',
                                                    }}
                                                >
                                                    Nivel
                                                </th>
                                                <th
                                                    style={{
                                                        fontSize: '0.95rem',
                                                        fontWeight: '700',
                                                        padding: '16px 18px',
                                                    }}
                                                >
                                                    Acciones
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {secundaria.map((grado) => (
                                                <tr key={grado.id}>
                                                    <td
                                                        style={{
                                                            fontSize: '1rem',
                                                            fontWeight: '600',
                                                            color: '#2c3e50',
                                                            padding:
                                                                '14px 18px',
                                                        }}
                                                    >
                                                        {grado.grado}° Año
                                                    </td>
                                                    <td
                                                        style={{
                                                            fontSize: '1rem',
                                                            fontWeight: '600',
                                                            color: '#2c3e50',
                                                            padding:
                                                                '14px 18px',
                                                        }}
                                                    >
                                                        {grado.seccion}
                                                    </td>
                                                    <td
                                                        style={{
                                                            padding:
                                                                '14px 18px',
                                                        }}
                                                    >
                                                        <span
                                                            style={{
                                                                padding:
                                                                    '5px 12px',
                                                                borderRadius:
                                                                    '12px',
                                                                background:
                                                                    'rgba(114, 9, 183, 0.15)',
                                                                color: 'var(--secondary)',
                                                                fontSize:
                                                                    '0.9rem',
                                                                fontWeight:
                                                                    '700',
                                                            }}
                                                        >
                                                            Secundaria
                                                        </span>
                                                    </td>
                                                    <td
                                                        style={{
                                                            padding:
                                                                '14px 18px',
                                                        }}
                                                    >
                                                        <div
                                                            style={{
                                                                display: 'flex',
                                                                gap: '8px',
                                                                alignItems:
                                                                    'center',
                                                            }}
                                                        >
                                                            <button
                                                                onClick={() =>
                                                                    setShowHorario(
                                                                        grado.id
                                                                    )
                                                                }
                                                                style={{
                                                                    padding:
                                                                        '8px 14px',
                                                                    fontSize:
                                                                        '0.85rem',
                                                                    background:
                                                                        'var(--info)',
                                                                    color: 'white',
                                                                    border: 'none',
                                                                    borderRadius:
                                                                        'var(--border-radius-sm)',
                                                                    cursor: 'pointer',
                                                                    display:
                                                                        'flex',
                                                                    alignItems:
                                                                        'center',
                                                                    justifyContent:
                                                                        'center',
                                                                    gap: '6px',
                                                                    transition:
                                                                        'var(--transition)',
                                                                    lineHeight:
                                                                        '1',
                                                                }}
                                                                onMouseEnter={(
                                                                    e
                                                                ) => {
                                                                    e.currentTarget.style.background =
                                                                        '#3a7bd5';
                                                                }}
                                                                onMouseLeave={(
                                                                    e
                                                                ) => {
                                                                    e.currentTarget.style.background =
                                                                        'var(--info)';
                                                                }}
                                                            >
                                                                <i
                                                                    className="fas fa-clock"
                                                                    style={{
                                                                        fontSize:
                                                                            '0.7rem',
                                                                        display:
                                                                            'inline-flex',
                                                                        alignItems:
                                                                            'center',
                                                                        justifyContent:
                                                                            'center',
                                                                        lineHeight:
                                                                            '1',
                                                                        margin: '0',
                                                                        padding:
                                                                            '0',
                                                                    }}
                                                                ></i>
                                                                Ver Horario
                                                            </button>
                                                            <button
                                                                onClick={() =>
                                                                    handleDelete(
                                                                        grado
                                                                    )
                                                                }
                                                                title="Eliminar año"
                                                                style={{
                                                                    width: '36px',
                                                                    height: '36px',
                                                                    padding:
                                                                        '0',
                                                                    background:
                                                                        'var(--danger)',
                                                                    color: 'white',
                                                                    border: 'none',
                                                                    borderRadius:
                                                                        'var(--border-radius-sm)',
                                                                    cursor: 'pointer',
                                                                    display:
                                                                        'flex',
                                                                    alignItems:
                                                                        'center',
                                                                    justifyContent:
                                                                        'center',
                                                                    transition:
                                                                        'var(--transition)',
                                                                    lineHeight:
                                                                        '1',
                                                                }}
                                                                onMouseEnter={(
                                                                    e
                                                                ) => {
                                                                    e.currentTarget.style.background =
                                                                        '#d81b60';
                                                                }}
                                                                onMouseLeave={(
                                                                    e
                                                                ) => {
                                                                    e.currentTarget.style.background =
                                                                        'var(--danger)';
                                                                }}
                                                            >
                                                                <i
                                                                    className="fas fa-trash"
                                                                    style={{
                                                                        fontSize:
                                                                            '0.7rem',
                                                                        display:
                                                                            'inline-flex',
                                                                        alignItems:
                                                                            'center',
                                                                        justifyContent:
                                                                            'center',
                                                                        lineHeight:
                                                                            '1',
                                                                        margin: '0',
                                                                        padding:
                                                                            '0',
                                                                    }}
                                                                ></i>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}
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
        setFormData((prev) => {
            const newData = {
                ...prev,
                [name]: value,
            };
            // Si cambia el nivel, limpiar el grado seleccionado
            if (name === 'nivel') {
                newData.grado = '';
            }
            return newData;
        });
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
        <div className="modal" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3 className="modal-title">
                        Registrar Nuevo Grado-Sección
                    </h3>
                    <button className="close-modal" onClick={onClose}>
                        &times;
                    </button>
                </div>
                <div className="modal-body">
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label
                                htmlFor="nivel"
                                style={{ fontSize: '0.95rem' }}
                            >
                                Nivel Escolar *
                            </label>
                            <div className="input-with-icon">
                                <i
                                    className="fas fa-layer-group"
                                    style={{ fontSize: '0.8rem' }}
                                ></i>
                                <select
                                    id="nivel"
                                    name="nivel"
                                    value={formData.nivel || ''}
                                    onChange={(e) => handleInputChange(e)}
                                    required
                                >
                                    <option value="">
                                        Seleccione el nivel escolar
                                    </option>
                                    <option value="primaria">Primaria</option>
                                    <option value="secundaria">
                                        Secundaria
                                    </option>
                                </select>
                            </div>
                        </div>

                        <div className="form-grid">
                            <div className="form-group">
                                <label
                                    htmlFor="grado"
                                    style={{ fontSize: '0.95rem' }}
                                >
                                    {formData.nivel === 'primaria'
                                        ? 'Grado *'
                                        : formData.nivel === 'secundaria'
                                        ? 'Año *'
                                        : 'Grado/Año *'}
                                </label>
                                <div className="input-with-icon">
                                    <i
                                        className="fas fa-book"
                                        style={{ fontSize: '0.8rem' }}
                                    ></i>
                                    <select
                                        id="grado"
                                        name="grado"
                                        value={formData.grado || ''}
                                        onChange={(e) => handleInputChange(e)}
                                        required
                                        disabled={!formData.nivel}
                                    >
                                        <option value="">
                                            {formData.nivel === 'primaria'
                                                ? 'Seleccione el grado'
                                                : formData.nivel ===
                                                  'secundaria'
                                                ? 'Seleccione el año'
                                                : 'Seleccione primero el nivel'}
                                        </option>
                                        {formData.nivel === 'primaria' ? (
                                            <>
                                                <option value="1">
                                                    1° Grado
                                                </option>
                                                <option value="2">
                                                    2° Grado
                                                </option>
                                                <option value="3">
                                                    3° Grado
                                                </option>
                                                <option value="4">
                                                    4° Grado
                                                </option>
                                                <option value="5">
                                                    5° Grado
                                                </option>
                                                <option value="6">
                                                    6° Grado
                                                </option>
                                            </>
                                        ) : formData.nivel === 'secundaria' ? (
                                            <>
                                                <option value="1">
                                                    1° Año
                                                </option>
                                                <option value="2">
                                                    2° Año
                                                </option>
                                                <option value="3">
                                                    3° Año
                                                </option>
                                                <option value="4">
                                                    4° Año
                                                </option>
                                                <option value="5">
                                                    5° Año
                                                </option>
                                            </>
                                        ) : null}
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label
                                    htmlFor="seccion"
                                    style={{ fontSize: '0.95rem' }}
                                >
                                    Sección *
                                </label>
                                <div className="input-with-icon">
                                    <i
                                        className="fas fa-users"
                                        style={{ fontSize: '0.8rem' }}
                                    ></i>
                                    <select
                                        id="seccion"
                                        name="seccion"
                                        value={formData.seccion || ''}
                                        onChange={(e) => handleInputChange(e)}
                                        required
                                    >
                                        <option value="">
                                            Seleccione la sección
                                        </option>
                                        <option value="A">Sección A</option>
                                        <option value="B">Sección B</option>
                                        <option value="C">Sección C</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div
                            style={{
                                marginTop: '25px',
                                display: 'flex',
                                justifyContent: 'flex-end',
                                gap: '12px',
                            }}
                        >
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={onClose}
                                style={{
                                    width: 'auto',
                                    padding: '12px 24px',
                                    fontSize: '0.9rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    lineHeight: '1',
                                }}
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                style={{
                                    width: 'auto',
                                    padding: '12px 30px',
                                    fontSize: '0.9rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    lineHeight: '1',
                                }}
                            >
                                Registrar Grado
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

const VerHorario = ({ isOpen, onClose, grado }) => {
    const [horario, setHorario] = useState([]);
    const [loading, setLoading] = useState(true);
    const [materias, setMaterias] = useState([]);
    const [profesores, setProfesores] = useState([]);
    useEffect(() => {
        const fetchHorario = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`${API_URL}/horarios/`);
                if (response.data.length === 0) {
                    setHorario(null);
                } else {
                    setHorario(
                        response.data.filter((h) => h.grado_seccion === grado)
                    );
                }
            } catch (error) {
                console.error('Error fetching horario:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchHorario();
    }, [grado]);
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
    }, [horario]);
    useEffect(() => {
        const fetchProfesores = async () => {
            setLoading(true);
            try {
                const response = await axios.get(
                    `${API_URL}/usuarios/profesor/`
                );
                setProfesores(response.data);
            } catch (error) {
                console.error('Error fetching profesores:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfesores();
    }, [horario]);

    const dias = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'];
    const horas = Array.from({ length: 12 }, (_, i) => {
        const h = i + 7; // empieza en 7
        return `${h.toString().padStart(2, '0')}:00`;
    });

    const handleDelete = async (e) => {
        e.preventDefault();
        const claseId = e.target.dataset.id;
        console.log(claseId);
        if (confirm(`¿Eliminar la materia ${claseId}?`)) {
            axios
                .delete(`${API_URL}/horarios/materias/${materia.id}/`)
                .then(() => {
                    alert('Materia eliminada correctamente.');
                    setMaterias(materias.filter((m) => m.id !== materia.id));
                })
                .catch((error) => {
                    console.error('Error al eliminar la materia:', error);
                    alert('Error al eliminar la materia.');
                });
        }
    };

    function Calendario() {
        const getProfesorNombre = (profesorId) => {
            const profesor = profesores.find((p) => p.id === profesorId);
            if (!profesor) return 'N/A';
            return (
                `${profesor.nombre || ''} ${profesor.apellido || ''}`.trim() ||
                'N/A'
            );
        };

        return (
            <div
                style={{
                    border: '1px solid var(--light-gray)',
                    borderRadius: 'var(--border-radius)',
                    overflow: 'hidden',
                    background: 'white',
                }}
            >
                {/* Encabezado de días */}
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: '100px repeat(5, 1fr)',
                        background:
                            'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
                        color: 'white',
                        fontWeight: '600',
                        fontSize: '0.9rem',
                    }}
                >
                    <div
                        style={{
                            textAlign: 'center',
                            padding: '12px',
                            borderRight: '1px solid rgba(255, 255, 255, 0.2)',
                        }}
                    >
                        Horas
                    </div>
                    {dias.map((dia) => (
                        <div
                            key={dia}
                            style={{
                                textAlign: 'center',
                                padding: '12px',
                                textTransform: 'capitalize',
                                borderRight:
                                    '1px solid rgba(255, 255, 255, 0.2)',
                            }}
                        >
                            {dia}
                        </div>
                    ))}
                </div>

                {/* Filas de horas */}
                {horas.map((hora) => (
                    <div
                        key={hora}
                        style={{
                            display: 'grid',
                            gridTemplateColumns: '100px repeat(5, 1fr)',
                            borderTop: '1px solid var(--light-gray)',
                        }}
                    >
                        <div
                            style={{
                                textAlign: 'center',
                                padding: '10px',
                                background: 'var(--light)',
                                fontWeight: '600',
                                color: 'var(--dark)',
                                fontSize: '0.85rem',
                                borderRight: '1px solid var(--light-gray)',
                            }}
                        >
                            {hora}
                        </div>
                        {dias.map((dia) => {
                            const clase = horario.find(
                                (h) =>
                                    h.dia_semana === dia &&
                                    hora >= h.hora_inicio.slice(0, 5) &&
                                    hora < h.hora_fin.slice(0, 5)
                            );
                            return (
                                <div
                                    key={dia + hora}
                                    style={{
                                        borderLeft:
                                            '1px solid var(--light-gray)',
                                        minHeight: '60px',
                                        position: 'relative',
                                        padding: clase ? '8px' : '0',
                                        background: clase
                                            ? 'rgba(67, 97, 238, 0.05)'
                                            : 'transparent',
                                    }}
                                >
                                    {clase ? (
                                        <div
                                            style={{
                                                background:
                                                    'linear-gradient(135deg, var(--primary) 0%, var(--info) 100%)',
                                                color: 'white',
                                                fontSize: '0.75rem',
                                                padding: '10px',
                                                borderRadius:
                                                    'var(--border-radius-sm)',
                                                height: '100%',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                justifyContent: 'space-between',
                                                boxShadow:
                                                    '0 2px 8px rgba(67, 97, 238, 0.2)',
                                            }}
                                        >
                                            <div>
                                                <strong
                                                    style={{
                                                        fontSize: '0.8rem',
                                                        display: 'block',
                                                        marginBottom: '4px',
                                                    }}
                                                >
                                                    {materias.find(
                                                        (m) =>
                                                            m.id ===
                                                            clase.materia
                                                    )?.nombre || 'N/A'}
                                                </strong>
                                                <span
                                                    style={{
                                                        fontSize: '0.7rem',
                                                        opacity: 0.9,
                                                    }}
                                                >
                                                    {clase.hora_inicio.slice(
                                                        0,
                                                        5
                                                    )}{' '}
                                                    -{' '}
                                                    {clase.hora_fin.slice(0, 5)}
                                                </span>
                                            </div>
                                            <div
                                                style={{
                                                    marginTop: '6px',
                                                    fontSize: '0.7rem',
                                                    opacity: 0.9,
                                                }}
                                            >
                                                {getProfesorNombre(
                                                    clase.profesor
                                                )}
                                            </div>
                                            <button
                                                onClick={() => {
                                                    if (
                                                        confirm(
                                                            `¿Eliminar el horario de ${
                                                                materias.find(
                                                                    (m) =>
                                                                        m.id ===
                                                                        clase.materia
                                                                )?.nombre ||
                                                                'esta clase'
                                                            }?`
                                                        )
                                                    ) {
                                                        axios
                                                            .delete(
                                                                `${API_URL}/horarios/${clase.id}/`
                                                            )
                                                            .then(() => {
                                                                alert(
                                                                    'Horario eliminado correctamente.'
                                                                );
                                                                setHorario(
                                                                    horario.filter(
                                                                        (m) =>
                                                                            m.id !==
                                                                            clase.id
                                                                    )
                                                                );
                                                            })
                                                            .catch((error) => {
                                                                console.error(
                                                                    'Error al eliminar el horario:',
                                                                    error
                                                                );
                                                                alert(
                                                                    'Error al eliminar el horario.'
                                                                );
                                                            });
                                                    }
                                                }}
                                                style={{
                                                    marginTop: '8px',
                                                    width: '100%',
                                                    padding: '6px 8px',
                                                    fontSize: '0.7rem',
                                                    background:
                                                        'rgba(247, 37, 133, 0.2)',
                                                    color: 'white',
                                                    border: '1px solid rgba(247, 37, 133, 0.4)',
                                                    borderRadius:
                                                        'var(--border-radius-sm)',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '4px',
                                                    transition:
                                                        'var(--transition)',
                                                    lineHeight: '1',
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.background =
                                                        'rgba(247, 37, 133, 0.3)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.background =
                                                        'rgba(247, 37, 133, 0.2)';
                                                }}
                                            >
                                                <i
                                                    className="fas fa-trash"
                                                    style={{
                                                        fontSize: '0.65rem',
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        justifyContent:
                                                            'center',
                                                        lineHeight: '1',
                                                        margin: '0',
                                                        padding: '0',
                                                    }}
                                                ></i>
                                                Eliminar
                                            </button>
                                        </div>
                                    ) : null}
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>
        );
    }

    if (!isOpen) return null;
    return (
        <div className="modal" onClick={onClose}>
            <div
                className="modal-content"
                onClick={(e) => e.stopPropagation()}
                style={{ maxWidth: '95vw', maxHeight: '90vh' }}
            >
                <div className="modal-header">
                    <h3 className="modal-title">Horario del Grado</h3>
                    <button className="close-modal" onClick={onClose}>
                        &times;
                    </button>
                </div>
                <div className="modal-body" style={{ padding: '20px' }}>
                    {loading && (
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                padding: '40px',
                                color: 'var(--gray)',
                            }}
                        >
                            Cargando horario...
                        </div>
                    )}
                    {!loading && horario && horario.length === 0 && (
                        <div
                            style={{
                                textAlign: 'center',
                                padding: '40px',
                                color: 'var(--gray)',
                            }}
                        >
                            <i
                                className="fas fa-calendar-times"
                                style={{
                                    fontSize: '1.5rem',
                                    marginBottom: '12px',
                                    color: 'var(--light-gray)',
                                    opacity: 0.6,
                                }}
                            ></i>
                            <p style={{ fontSize: '0.95rem' }}>
                                No hay horarios registrados para este grado.
                            </p>
                        </div>
                    )}
                    {!loading && horario && horario.length > 0 && (
                        <div style={{ overflowX: 'auto' }}>
                            <Calendario />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export function Grados() {
    const [showRegistrar, setShowRegistrar] = useState(false);
    const [showHorario, setShowHorario] = useState(false);
    const [grado, setGrados] = useState(null);

    return (
        <>
            <div className="header">
                <div className="page-title">
                    <h1>Grados / Años y Secciones</h1>
                    <p>Gestiona los grados y secciones del sistema educativo</p>
                </div>
                <div className="header-actions">
                    <button
                        className="btn"
                        onClick={() => setShowRegistrar(true)}
                        style={{
                            width: 'auto',
                            padding: '12px 24px',
                            fontSize: '0.9rem',
                            background: 'var(--primary)',
                            color: 'white',
                            border: 'none',
                            borderRadius: 'var(--border-radius)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            transition: 'var(--transition)',
                            boxShadow: '0 4px 15px rgba(67, 97, 238, 0.3)',
                            lineHeight: '1',
                            fontWeight: '500',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background =
                                'var(--primary-dark)';
                            e.currentTarget.style.transform =
                                'translateY(-2px)';
                            e.currentTarget.style.boxShadow =
                                '0 6px 20px rgba(67, 97, 238, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'var(--primary)';
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow =
                                '0 4px 15px rgba(67, 97, 238, 0.3)';
                        }}
                    >
                        <i
                            className="fas fa-plus"
                            style={{
                                fontSize: '0.8rem',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                lineHeight: '1',
                                margin: '0',
                                padding: '0',
                            }}
                        ></i>
                        Registrar Grado-Sección
                    </button>
                </div>
            </div>

            <ListaGrados
                setShowHorario={(id) => {
                    setShowHorario(true);
                    setGrados(id);
                }}
            />

            <RegistrarGrado
                isOpen={showRegistrar}
                onClose={() => {
                    setShowRegistrar(false);
                }}
            />

            {showHorario && (
                <VerHorario
                    isOpen={showHorario}
                    onClose={() => {
                        setShowHorario(false);
                        setGrados(null);
                    }}
                    grado={grado}
                />
            )}
        </>
    );
}
