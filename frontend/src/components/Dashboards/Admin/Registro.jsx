import './css/Registro.css';
import { useState } from 'react';
export default function Registo() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        cedula: '',
        user: '',
        password: '',
        telefono: '',
        direccion: '',
        foto: '',
        typeU: '',
    });
    return (
        <div>
            <h1>Registro de Usuarios</h1>
            <form className="registro-form container">
                {/* Nombre Completo Input */}
                <div className="input-group">
                    <div className="input-container">
                        <label htmlFor="name">Nombre Completo:</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            className={formData.name ? 'has-value' : ''}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    name: e.target.value,
                                })
                            }
                            required
                        />
                        <i class="input-icon bi bi-person"></i>
                    </div>
                </div>
                {/* Email Input */}
                <div className="input-group">
                    <div className="input-container">
                        <label htmlFor="email">Correo Electrónico:</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            className={formData.email ? 'has-value' : ''}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    email: e.target.value,
                                })
                            }
                            required
                        />
                        <i class="input-icon bi bi-envelope-at"></i>
                    </div>
                </div>
                {/* Cédula Input */}
                <div className="input-group">
                    <div className="input-container">
                        <label htmlFor="cedula">Cedula:</label>
                        <input
                            type="text"
                            id="cedula"
                            name="cedula"
                            value={formData.cedula}
                            className={formData.cedula ? 'has-value' : ''}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    cedula: e.target.value,
                                })
                            }
                            required
                        />
                        <i class="input-icon bi bi-person-vcard"></i>
                    </div>
                </div>
                {/* User input */}
                <div className="input-group">
                    <div className="input-container">
                        <label htmlFor="user">Usuario:</label>
                        <input
                            type="text"
                            id="user"
                            name="user"
                            value={formData.user}
                            className={formData.user ? 'has-value' : ''}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    user: e.target.value,
                                })
                            }
                            required
                        />
                        <i class="input-icon bi bi-person"></i>
                    </div>
                </div>

                {/* Password Input */}
                <div className="input-group">
                    <div className="input-container">
                        <label htmlFor="password">Contraseña:</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            className={formData.password ? 'has-value' : ''}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    password: e.target.value,
                                })
                            }
                            required
                        />
                        <i class="input-icon bi bi-lock"></i>
                    </div>
                </div>
                {/* Teléfono Input */}
                <div className="input-group">
                    <div className="input-container">
                        <label htmlFor="telefono">Teléfono:</label>
                        <input
                            type="text"
                            id="telefono"
                            name="telefono"
                            value={formData.telefono}
                            className={formData.telefono ? 'has-value' : ''}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    telefono: e.target.value,
                                })
                            }
                            required
                        />
                        <i class="input-icon bi bi-phone"></i>
                    </div>
                </div>
                {/* Dirección Input */}
                <div className="input-group">
                    <div className="input-container">
                        <label htmlFor="direccion">Dirección:</label>
                        <input
                            type="text"
                            id="direccion"
                            name="direccion"
                            value={formData.direccion}
                            className={formData.direccion ? 'has-value' : ''}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    direccion: e.target.value,
                                })
                            }
                            required
                        />
                        <i class="input-icon bi bi-geo-alt"></i>
                    </div>
                </div>
                {/* Tipo de Usuario Select */}
                <div className="input-group">
                    <div className="select-container">
                        <select
                            id="typeU"
                            name="typeU"
                            value={formData.typeU}
                            className={formData.typeU ? 'has-value' : ''}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    typeU: e.target.value,
                                })
                            }
                        >
                            <option value="">
                                -- Seleccione el Tipo de Usuario --
                            </option>
                            <option value="Representante">Representante</option>
                            <option value="Estudiante">Estudiante</option>
                            <option value="Profesor">Profesor</option>
                        </select>
                        <i className="select-icon fas fa-chevron-down"></i>
                    </div>
                </div>
                {/* Foto Input */}
                <div className="input-group">
                    <div className="input-container">
                        <label htmlFor="foto">Foto:</label>
                        <input
                            type="file"
                            id="foto"
                            name="foto"
                            className={formData.foto ? 'has-value' : ''}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    foto: e.target.files[0],
                                })
                            }
                            required
                        />
                        <i class="input-icon bi bi-camera"></i>
                    </div>
                </div>

                <button className="submit-btn" type="submit">
                    Registrar
                </button>
            </form>
        </div>
    );
}
