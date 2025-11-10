import { useState } from 'react';
import './css/Profile.css';
import { Link } from 'react-router-dom';
export function Profile({ userImg }) {
    const [menuOpen, setMenuOpen] = useState(false);
    const logout = () => {
        window.localStorage.clear();
        window.location.href = '/';
    };

    return (
        <div className="profile">
            <div className="profile-avatar" onClick={() => setMenuOpen(true)}>
                {userImg !== null ? (
                    <img src={userImg} />
                ) : (
                    <i className="fas fa-user-circle fa-2x"></i>
                )}
            </div>
            {menuOpen && (
                <>
                    <div
                        className="overlay-profile"
                        onClick={() => setMenuOpen(false)}
                    ></div>
                    <div className="profile-options">
                        <ul>
                            <li>
                                <Link to="./profile" className="menu-item">
                                    Mi Perfil
                                </Link>
                            </li>
                            <li onClick={logout}>Cerrar Sesion</li>
                        </ul>
                    </div>
                </>
            )}
        </div>
    );
}
