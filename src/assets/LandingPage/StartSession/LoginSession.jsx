import './css/ModalSession.css';
const LoginSession = ({ setShowLogin }) => {
    return (
        <div className="ModalSession">
            <div className="modal-content">
                <h2>Iniciar Sesión</h2>
                <form>
                    <div className="inputGroup">
                        <label htmlFor="username" id="username">
                            Usuario
                        </label>
                        <input
                            onFocus={() => {
                                document.getElementById('username').className =
                                    'active';
                            }}
                            onBlur={() => {
                                document.getElementById('username').className =
                                    '';
                            }}
                            type="text"
                            id="username"
                            name="username"
                            required
                        />
                    </div>
                    <div className="inputGroup">
                        <label htmlFor="password" id="password">
                            Contraseña
                        </label>
                        <input
                            onFocus={() => {
                                document.getElementById('password').className =
                                    'active';
                            }}
                            onBlur={() => {
                                document.getElementById('password').className =
                                    '';
                            }}
                            type="password"
                            id="password"
                            name="password"
                            required
                        />
                    </div>
                    <div className="inputGroup selectGroup">
                        <select name="typeU" id="typeU">
                            <option value="" disabled>
                                --Seleccione su Tipo de Usuario--
                            </option>
                            <option value="Representante">Representante</option>
                            <option value="Estudiante">Estudiante</option>
                            <option value="Profesor">Profesor</option>
                        </select>
                    </div>

                    <button className="btn" type="submit">
                        Entrar
                    </button>
                </form>
                <button
                    className="btn"
                    onClick={() => {
                        setShowLogin(false);
                    }}
                >
                    Cerrar
                </button>
            </div>
        </div>
    );
};
export default LoginSession;
