import React from 'react';
import { useNotification } from '../../context/NotificationContext';
import './NotificationToast.css';

const NotificationToast = () => {
    const { notifications, removeNotification } = useNotification();

    if (notifications.length === 0) return null;

    return (
        <div className="notification-container-fixed">
            {notifications.map((notification) => (
                <div
                    key={notification.id}
                    className={`notification-toast ${notification.type} slide-in`}
                    onClick={() => removeNotification(notification.id)}
                >
                    <div className="notification-icon">
                        {notification.type === 'success' && <span className="material-symbols-outlined">check_circle</span>}
                        {notification.type === 'error' && <span className="material-symbols-outlined">error</span>}
                        {notification.type === 'warning' && <span className="material-symbols-outlined">warning</span>}
                        {notification.type === 'info' && <span className="material-symbols-outlined">info</span>}
                    </div>
                    <div className="notification-message">
                        {notification.message}
                    </div>
                    <button className="notification-close">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
            ))}
        </div>
    );
};

export default NotificationToast;
