import React, { useState, useEffect } from 'react';
import { Modal, List, Avatar, Spin, Alert, Tag } from 'antd';
import axios from 'axios';

const AdminsModal = ({ open, onClose }) => {
    const userStr = localStorage.getItem('user');
    const adminIdLoged = userStr ? JSON.parse(userStr).usuario : null;
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000');

    useEffect(() => {
        if (open) {
            setLoading(true);
            setError(null);
            axios
                .get(`${API_URL}/usuarios/administrador/`)
                .then((response) => {
                    setAdmins(response.data);
                    setLoading(false);
                })
                .catch((err) => {
                    setError('Error al cargar los administradores.');
                    setLoading(false);
                    console.error('Error fetching admins:', err);
                });
        }
    }, [open]);

    const deleteAdmin = (adminId) => {
        if (adminId === adminIdLoged) {
            alert('No puedes eliminar tu propio administrador');
            return;
        } else {
            axios
                .delete(`${API_URL}/usuarios/${adminId}/`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                    },
                })
                .then(() => {
                    setAdmins((prevAdmins) =>
                        prevAdmins.filter((admin) => admin.id !== adminId),
                    );
                })
                .catch((err) => {
                    console.error('Error deleting admin:', err);
                });
        }
    };

    return (
        <Modal
            title={<span style={{ fontFamily: 'Outfit', fontWeight: '800', fontSize: '1.5rem', color: '#0f172a', letterSpacing: '-0.02em' }}>Administradores</span>}
            open={open}
            onCancel={onClose}
            footer={null}
            width={650}
            centered
            className="brutal-modal"
            styles={{
                header: { background: '#f8fafc', borderBottom: '1px solid #e2e8f0', padding: '1.75rem 2rem' },
                body: { background: '#f1f5f9', padding: '2rem' },
                content: { borderRadius: '28px', overflow: 'hidden', border: 'none', boxShadow: '0 30px 60px -12px rgba(0, 0, 0, 0.25)' }
            }}
        >
            {loading ? (
                <div style={{ padding: '3rem', textAlign: 'center' }}>
                    <Spin size="large" />
                </div>
            ) : error ? (
                <Alert message={error} type="error" showIcon style={{ borderRadius: '12px' }} />
            ) : (
                <div style={{ maxHeight: '60vh', overflowY: 'auto', paddingRight: '8px' }}>
                    <List
                        itemLayout="horizontal"
                        dataSource={admins}
                        renderItem={(admin) => (
                            <List.Item
                                style={{
                                    padding: '1.25rem',
                                    marginBottom: '1rem',
                                    borderRadius: '20px',
                                    background: '#ffffff',
                                    border: '1px solid #ffffff',
                                    boxShadow: '0 4px 15px -5px rgba(0,0,0,0.05)',
                                    transition: 'all 0.3s ease'
                                }}
                                actions={[
                                    admin.id !== adminIdLoged && (
                                        <button
                                            key="delete"
                                            className="btn-delete"
                                            style={{
                                                background: '#fef2f2',
                                                color: '#dc2626',
                                                border: '1px solid #fecaca',
                                                borderRadius: '12px',
                                                width: '40px',
                                                height: '40px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                cursor: 'pointer'
                                            }}
                                            onClick={() => deleteAdmin(admin.usuario)}
                                        >
                                            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>delete</span>
                                        </button>
                                    )
                                ]}
                            >
                                <List.Item.Meta
                                    avatar={
                                        <div style={{ position: 'relative' }}>
                                            <Avatar
                                                src={admin.foto}
                                                size={54}
                                                style={{ border: '3px solid #f1f5f9', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
                                                icon={<span className="material-symbols-outlined">person</span>}
                                            />
                                            {admin.id === adminIdLoged && (
                                                <div style={{ position: 'absolute', bottom: -5, right: -5, background: '#10b981', width: '14px', height: '14px', borderRadius: '50%', border: '2px solid white' }}></div>
                                            )}
                                        </div>
                                    }
                                    title={
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{ fontWeight: '800', fontSize: '1rem', color: '#111827', fontFamily: 'Outfit' }}>
                                                {admin.nombre} {admin.apellido}
                                            </span>
                                            {admin.id === adminIdLoged && (
                                                <Tag color="green" style={{ borderRadius: '6px', fontSize: '0.65rem', fontWeight: '800', margin: 0 }}>TÚ</Tag>
                                            )}
                                        </div>
                                    }
                                    description={
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                            <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '500' }}>{admin.email}</span>
                                            <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Administrador</span>
                                        </div>
                                    }
                                />
                            </List.Item>
                        )}
                    />
                </div>
            )}
        </Modal>
    );
};

export default AdminsModal;
