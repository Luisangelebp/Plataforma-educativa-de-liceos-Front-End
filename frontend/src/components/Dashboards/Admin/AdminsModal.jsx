import React, { useState, useEffect } from 'react';
import { Modal, List, Avatar, Spin, Alert } from 'antd';
import axios from 'axios';

const AdminsModal = ({ open, onClose }) => {
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const API_URL =
        (import.meta.env.VITE_API_URL || 'http://localhost:8000') + '/';

    useEffect(() => {
        if (open) {
            setLoading(true);
            setError(null);
            axios
                .get(`${API_URL}usuarios/administrador/`)
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

    return (
        <Modal
            title="Administradores"
            open={open}
            onCancel={onClose}
            footer={null}
            width={600}
        >
            {loading ? (
                <div className="text-center">
                    <Spin size="large" />
                </div>
            ) : error ? (
                <Alert message={error} type="error" />
            ) : (
                <List
                    itemLayout="horizontal"
                    dataSource={admins}
                    renderItem={(admin) => (
                        <List.Item>
                            <List.Item.Meta
                                avatar={<Avatar src={admin.foto} />}
                                title={`${admin.nombre} ${admin.apellido}`}
                                description={admin.email}
                            />
                            <button className="btn-delete">
                                <i class="fa-solid fa-trash"></i>
                            </button>
                        </List.Item>
                    )}
                />
            )}
        </Modal>
    );
};

export default AdminsModal;
