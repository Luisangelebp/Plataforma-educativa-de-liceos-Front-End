import { memo } from 'react';

const Modal = ({ isOpen, onClose, title, children, roleIcon }) => {
    if (!isOpen) return null;

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
                    maxWidth: '700px',
                    borderRadius: '28px',
                    overflow: 'hidden',
                    border: 'none',
                    boxShadow: '0 30px 60px -12px rgba(0, 0, 0, 0.25)',
                    background: '#f1f5f9',
                }}
            >
                <div
                    className="modal-header"
                    style={{
                        background: '#f8fafc',
                        borderBottom: '1px solid #e2e8f0',
                        padding: '1.75rem 2.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: 0,
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                        }}
                    >
                        {roleIcon && (
                            <div
                                style={{
                                    width: '42px',
                                    height: '42px',
                                    borderRadius: '12px',
                                    background: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'var(--primary)',
                                    boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
                                    border: '1px solid #e2e8f0',
                                }}
                            >
                                <span
                                    className="material-symbols-outlined"
                                    style={{ fontSize: '24px' }}
                                >
                                    {roleIcon}
                                </span>
                            </div>
                        )}
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
                            {title}
                        </h3>
                    </div>
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
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
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

                <div
                    className="modal-body"
                    style={{
                        overflowY: 'none',
                    }}
                >
                    <div
                        style={{
                            background: 'white',
                            borderRadius: '24px',
                            boxShadow: '0 4px 20px -5px rgba(0, 0, 0, 0.05)',
                            border: '1px solid #ffffff',
                            padding: '1rem',
                        }}
                    >
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default memo(Modal);
