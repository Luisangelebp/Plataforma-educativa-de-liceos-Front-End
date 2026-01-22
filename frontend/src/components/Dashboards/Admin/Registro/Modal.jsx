import { memo } from 'react';

const Modal = ({ isOpen, onClose, title, children, roleIcon }) => {
    if (!isOpen) return null;

    return (
        <div
            className="modal-overlay"
            onClick={onClose}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 1000,
                padding: '20px',
            }}
        >
            <div
                className="modal-content"
                onClick={(e) => e.stopPropagation()}
                style={{
                    background: 'white',
                    borderRadius: '12px',
                    width: '100%',
                    maxWidth: '900px',
                    maxHeight: '95vh',
                    // overflowY: 'auto', // Se quita para evitar el scroll, el carrusel lo maneja
                    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '15px 20px',
                        borderBottom: '2px solid #f0f0f0',
                        flexShrink: 0,
                    }}
                >
                    <h2
                        style={{
                            margin: 0,
                            fontSize: '1.3rem',
                            fontWeight: '600',
                            color: '#333',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                        }}
                    >
                        <i
                            className={`fas ${roleIcon}`}
                            style={{ color: '#007bff' }}
                        ></i>
                        {title}
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '1.5rem',
                            color: '#999',
                            cursor: 'pointer',
                            padding: '5px 10px',
                            borderRadius: '6px',
                            transition: 'all 0.3s',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#f0f0f0';
                            e.currentTarget.style.color = '#333';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'none';
                            e.currentTarget.style.color = '#999';
                        }}
                    >
                        ×
                    </button>
                </div>
                <div
                    style={{
                        padding: '20px',
                        flex: 1,
                        overflow: 'hidden', // Contenedor del carrusel no debe tener scroll
                    }}
                >
                    {children}
                </div>
            </div>
        </div>
    );
};

export default memo(Modal);
