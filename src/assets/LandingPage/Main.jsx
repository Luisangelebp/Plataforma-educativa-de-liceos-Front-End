import './css/Main.css';
export default function Main({ setShowLogin }) {
    return (
        <main>
            <section className="login-container" id="Hogar">
                <button className="btn" onClick={() => setShowLogin(true)}>
                    Iniciar Session
                </button>
            </section>
            <section className="AboutUs" id="Nosotros">
                <h2>
                    <svg
                        viewBox="0 0 100 100"
                        xmlns="http://www.w3.org/2000/svg"
                        className="svg-logo"
                    >
                        <use href="../../logo.svg" width="100" height="100" />
                    </svg>
                    Sobre Nosotros
                </h2>
                <p>
                    Lorem ipsum dolor sit amet, consectetur adipisicing elit.
                    Hic, magnam corporis! Saepe impedit distinctio ut officia
                    quis earum, quos doloribus odit quas omnis autem possimus
                    nulla expedita beatae incidunt quasi? Quisquam ipsam animi
                    laborum! Vitae asperiores facere, qui temporibus earum
                    quibusdam nulla facilis repellendus, mollitia labore nemo
                    ducimus eveniet ex. Quo commodi ducimus eos delectus
                    molestias, ut voluptates facilis vero.
                </p>
            </section>
            <section className="services" id="Servicios">
                <h2>
                    <svg
                        viewBox="0 0 100 100"
                        xmlns="http://www.w3.org/2000/svg"
                        className="svg-logo"
                    >
                        <use href="../../logo.svg" width="100" height="100" />
                    </svg>
                    Funcionalidades
                </h2>
                <div className="service">
                    <h3>Agendamiento Inteligente</h3>
                    <p>
                        Facilita la reserva, cancelación y reprogramación de
                        citas médicas con unos pocos clics.
                    </p>
                </div>
                <div className="service">
                    <h3>Gestión de Horarios Médicos</h3>
                    <p>
                        Permite a los médicos visualizar y administrar sus
                        horarios en tiempo real para una mejor organización.
                    </p>
                </div>
                <div className="service">
                    <h3>Historial Médico Centralizado</h3>
                    <p>
                        Accede a tu historial de consultas y tratamientos desde
                        cualquier lugar, sin complicaciones.
                    </p>
                </div>
                <div className="service">
                    <h3>Compartición de Expedientes</h3>
                    <p>
                        Ofrece la posibilidad de compartir historial médico con
                        especialistas para una atención más coordinada.
                    </p>
                </div>
                <div className="service">
                    <h3>Recordatorios Automáticos</h3>
                    <p>
                        Recibe notificaciones y correos electrónicos que te
                        recuerdan tus citas para evitar olvidos.
                    </p>
                </div>
                <div className="service">
                    <h3>Comunicación en Tiempo Real</h3>
                    <p>
                        Chat integrado para una comunicación fluida entre
                        pacientes y médicos sin necesidad de llamadas.
                    </p>
                </div>
                <div className="service">
                    <h3>Red de Especialistas</h3>
                    <p>
                        Encuentra y agenda citas con médicos de distintas
                        especialidades en un solo lugar.
                    </p>
                </div>
            </section>
            <section className="contact" id="Contactanos">
                <h2>
                    <svg
                        viewBox="0 0 100 100"
                        xmlns="http://www.w3.org/2000/svg"
                        className="svg-logo"
                    >
                        <use href="../../logo.svg" width="100" height="100" />
                    </svg>
                    Contacto
                </h2>
                <p>
                    Si tienes alguna pregunta o necesitas más información, no
                    dudes en contactarnos a través de nuestro correo
                    electrónico:{' '}
                    <b>
                        <em>example@example.com</em>
                    </b>
                </p>
            </section>
        </main>
    );
}
