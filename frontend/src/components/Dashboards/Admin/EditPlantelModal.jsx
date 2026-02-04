import React, { useEffect, useState } from 'react';
import './css/Listas.css';
import axios from 'axios';

const EditPlantelModal = ({ open, onClose, dataPlantel, setDataPlantel }) => {
    console.log(dataPlantel);
    const [formData, setFormData] = useState({
        nombre: '',
        director: '',
        subdirector: '',
        codigo_dea: '',
        rif: '',
        slogan_boletin: '',
        logo: null,
    });

    const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 640);

    useEffect(() => {
        const handleResize = () => {
            setIsSmallScreen(window.innerWidth < 640);
        };
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    useEffect(() => {
        if (dataPlantel) {
            setFormData({
                nombre: dataPlantel.nombre || '',
                director: dataPlantel.director || '',
                subdirector: dataPlantel.subdirector || '',
                codigo_dea: dataPlantel.codigo_dea || '',
                rif: dataPlantel.rif || '',
                slogan_boletin: dataPlantel.slogan_boletin || '',
                logo: null,
            });
        }
    }, [dataPlantel]);

    if (!open) return null;

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === 'logo') {
            setFormData((prev) => ({ ...prev, [name]: files[0] }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = () => {
        const token = localStorage.getItem('accessToken');
        const data = new FormData();

        Object.keys(formData).forEach((key) => {
            if (key === 'logo' && formData.logo) {
                data.append(key, formData.logo);
            } else if (key !== 'logo' && formData[key]) {
                data.append(key, formData[key]);
            }
        });

        axios
            .put(`http://localhost:8000/institucion/1/`, data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`,
                },
            })
            .then((response) => {
                if (response.status === 200) {
                    setDataPlantel(response.data);

                    onClose();
                } else {
                    // Handle error
                    console.error('Error updating plantel');
                }
            })
            .catch((error) => {
                console.error('Error updating plantel:', error);
            });
    };

    return (
        <div
            className="modal-overlay"
            onClick={onClose}
            style={{
                backdropFilter: 'blur(10px)',
                backgroundColor: 'rgba(15, 23, 42, 0.4)',
            }}
        >
            <div
                className="modal-container"
                onClick={(e) => e.stopPropagation()}
                style={{
                    maxWidth: '650px',
                    borderRadius: '28px',
                    overflow: 'hidden',
                    border: 'none',
                    boxShadow: '0 30px 60px -12px rgba(0, 0, 0, 0.25)',
                    background: '#f1f5f9',
                }}
            >
                {/* Header with a softer white */}
                <div
                    className="modal-header"
                    style={{
                        background: '#f8fafc',
                        borderBottom: '1px solid #e2e8f0',
                        marginBottom: '1px !important',
                    }}
                >
                    <h3
                        style={{
                            margin: 0,
                            fontFamily: 'Outfit',
                            fontWeight: '800',
                            fontSize: '1.5rem',
                            color: '#0f172a',
                            letterSpacing: '-0.02em',
                        }}
                    >
                        Editar Datos del Plantel
                    </h3>
                    <button
                        className="close-btn"
                        onClick={onClose}
                        title="Cerrar"
                        style={{
                            background: '#ffffff',
                            color: '#64748b',
                            width: '36px',
                            height: '36px',
                            border: '1px solid #e2e8f0',
                        }}
                    >
                        <span
                            className="material-symbols-outlined"
                            style={{ fontSize: '20px' }}
                        >
                            close
                        </span>
                    </button>
                </div>

                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSubmit();
                    }}
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        flex: 1,
                        overflow: 'hidden',
                    }}
                >
                    <div
                        className="modal-body"
                        style={{
                            overflowY: 'auto',
                            flex: 1,
                        }}
                    >
                        <div
                            style={{
                                background: 'white',
                                padding: '1rem',
                                borderRadius: '24px',
                                boxShadow:
                                    '0 4px 20px -5px rgba(0, 0, 0, 0.05)',
                                border: '1px solid #ffffff',
                            }}
                        >
                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: isSmallScreen
                                        ? '1fr'
                                        : '1fr 1fr',
                                    gap: '0.5rem',
                                }}
                            >
                                <div className="form-group">
                                    <label
                                        style={{
                                            display: 'block',
                                            marginBottom: '8px',
                                            fontWeight: '700',
                                            color: '#475569',
                                            fontSize: '0.9rem',
                                        }}
                                    >
                                        Nombre del Plantel:
                                    </label>
                                    <input
                                        type="text"
                                        name="nombre"
                                        value={formData.nombre || ''}
                                        onChange={handleChange}
                                        style={{
                                            width: '100%',
                                            padding: '12px 16px',
                                            borderRadius: '12px',
                                            border: '1px solid #e2e8f0',
                                            background: '#f8fafc',
                                            fontSize: '1rem',
                                            outline: 'none',
                                        }}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label
                                        style={{
                                            display: 'block',
                                            marginBottom: '8px',
                                            fontWeight: '700',
                                            color: '#475569',
                                            fontSize: '0.9rem',
                                        }}
                                    >
                                        Director:
                                    </label>
                                    <input
                                        type="text"
                                        name="director"
                                        value={formData.director || ''}
                                        onChange={handleChange}
                                        style={{
                                            width: '100%',
                                            padding: '12px 16px',
                                            borderRadius: '12px',
                                            border: '1px solid #e2e8f0',
                                            background: '#f8fafc',
                                            fontSize: '1rem',
                                            outline: 'none',
                                        }}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label
                                        style={{
                                            display: 'block',
                                            marginBottom: '8px',
                                            fontWeight: '700',
                                            color: '#475569',
                                            fontSize: '0.9rem',
                                        }}
                                    >
                                        Subdirector:
                                    </label>
                                    <input
                                        type="text"
                                        name="subdirector"
                                        value={formData.subdirector || ''}
                                        onChange={handleChange}
                                        style={{
                                            width: '100%',
                                            padding: '12px 16px',
                                            borderRadius: '12px',
                                            border: '1px solid #e2e8f0',
                                            background: '#f8fafc',
                                            fontSize: '1rem',
                                            outline: 'none',
                                        }}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label
                                        style={{
                                            display: 'block',
                                            fontWeight: '700',
                                            color: '#475569',
                                            fontSize: '0.9rem',
                                        }}
                                    >
                                        Código DEA:
                                    </label>
                                    <input
                                        type="text"
                                        name="codigo_dea"
                                        value={formData.codigo_dea || ''}
                                        onChange={handleChange}
                                        style={{
                                            width: '100%',
                                            padding: '12px 16px',
                                            borderRadius: '12px',
                                            border: '1px solid #e2e8f0',
                                            background: '#f8fafc',
                                            fontSize: '1rem',
                                            outline: 'none',
                                        }}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label
                                        style={{
                                            display: 'block',

                                            fontWeight: '700',
                                            color: '#475569',
                                            fontSize: '0.9rem',
                                        }}
                                    >
                                        RIF:
                                    </label>
                                    <input
                                        type="text"
                                        name="rif"
                                        value={formData.rif || ''}
                                        onChange={handleChange}
                                        style={{
                                            width: '100%',
                                            padding: '12px 16px',
                                            borderRadius: '12px',
                                            border: '1px solid #e2e8f0',
                                            background: '#f8fafc',
                                            fontSize: '1rem',
                                            outline: 'none',
                                        }}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label
                                        style={{
                                            display: 'block',

                                            fontWeight: '700',
                                            color: '#475569',
                                            fontSize: '0.9rem',
                                        }}
                                    >
                                        Slogan para Boletín:
                                    </label>
                                    <textarea
                                        name="slogan_boletin"
                                        value={formData.slogan_boletin || ''}
                                        onChange={handleChange}
                                        style={{
                                            width: '100%',
                                            padding: '12px 16px',
                                            borderRadius: '12px',
                                            border: '1px solid #e2e8f0',
                                            background: '#f8fafc',
                                            fontSize: '1rem',
                                            outline: 'none',
                                            minHeight: '100px',
                                        }}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label
                                        style={{
                                            display: 'block',

                                            fontWeight: '700',
                                            color: '#475569',
                                            fontSize: '0.9rem',
                                        }}
                                    >
                                        Logo:
                                    </label>
                                    {dataPlantel && dataPlantel.logo && (
                                        <div style={{ marginBottom: '0.5rem' }}>
                                            <p
                                                style={{
                                                    fontSize: '0.8rem',
                                                    color: '#64748b',
                                                    margin: '0 0 5px 0',
                                                }}
                                            >
                                                Logo actual:
                                            </p>
                                            <img
                                                src={dataPlantel.logo}
                                                alt="Logo actual"
                                                style={{
                                                    width: '100px',
                                                    height: 'auto',
                                                    borderRadius: '8px',
                                                    border: '1px solid #e2e8f0',
                                                }}
                                            />
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        name="logo"
                                        onChange={handleChange}
                                        style={{
                                            width: '100%',
                                            padding: '12px 16px',
                                            borderRadius: '12px',
                                            border: '1px solid #e2e8f0',
                                            background: '#f8fafc',
                                            fontSize: '1rem',
                                            outline: 'none',
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div
                        className="modal-footer"
                        style={{
                            borderTop: '1px solid #e2e8f0',

                            background: '#f8fafc',
                            display: 'flex',
                            justifyContent: 'center',
                        }}
                    >
                        <button
                            type="submit"
                            className="btn btn-primary"
                            style={{
                                borderRadius: '16px',
                                padding: '1rem 3rem',
                                fontWeight: '800',
                                fontFamily: 'Outfit',
                                fontSize: '1rem',
                                background: '#4361ee',
                                color: '#ffffff',
                                border: 'none',
                                transition: 'all 0.3s ease',
                                boxShadow:
                                    '0 10px 15px -3px rgba(67, 97, 238, 0.2)',
                                cursor: 'pointer',
                            }}
                        >
                            Guardar Cambios
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditPlantelModal;
