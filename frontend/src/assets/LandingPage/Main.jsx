import './css/Main.css';
import './css/FeatureSection.css?v=7';
import './css/BenefitsSection.css';
import { useState, useEffect, useRef } from 'react';

import bannerImage from '../img/banner_landing.jpg';

export default function Main({ setShowLogin }) {
    const [isVisible, setIsVisible] = useState(false);
    const [scrollProgress, setScrollProgress] = useState(0);
    const mainRef = useRef(null);

    useEffect(() => {
        setIsVisible(true);

        const handleScroll = () => {
            const scrollTop = window.pageYOffset;
            const docHeight =
                document.documentElement.scrollHeight - window.innerHeight;
            const progress = (scrollTop / docHeight) * 100;
            setScrollProgress(progress);

            // Animación al hacer scroll
            const elements = document.querySelectorAll('.scroll-animate');
            elements.forEach((element) => {
                const elementTop = element.getBoundingClientRect().top;
                const elementVisible = 150;

                if (elementTop < window.innerHeight - elementVisible) {
                    element.classList.add('animated');
                }
            });
        };

        window.addEventListener('scroll', handleScroll);
        handleScroll();

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const services = [
        {
            icon: 'school',
            title: 'Gestión de Estudiantes',
            description: 'Administra fichas, matrículas y datos personales de todos los alumnos en un solo lugar.',
            color: 'blue'
        },
        {
            icon: 'fact_check',
            title: 'Control de Asistencias',
            description: 'Registro diario de asistencias con reportes automáticos para padres y directivos.',
            color: 'green'
        },
        {
            icon: 'school',
            title: 'Gestión de Calificaciones',
            description: 'Carga de notas, promedios automáticos y boletines digitales para cada período.',
            color: 'purple'
        },
        {
            icon: 'calendar_month',
            title: 'Horarios y Planificación',
            description: 'Crea y gestiona horarios de clases, exámenes y actividades escolares.',
            color: 'orange'
        },
        {
            icon: 'description',
            title: 'Documentación Digital',
            description: 'Almacena y gestiona certificados, constancias y documentos importantes.',
            color: 'pink'
        },
        {
            icon: 'forum',
            title: 'Comunicación Integrada',
            description: 'Envía notificaciones y mensajes a padres, docentes y estudiantes.',
            color: 'indigo'
        },
        {
            icon: 'analytics',
            title: 'Reportes y Análisis',
            description: 'Visualiza estadísticas y genera reportes detallados del rendimiento académico.',
            color: 'teal'
        },
        {
            icon: 'security',
            title: 'Seguridad y Privacidad',
            description: 'Protección de datos con encriptación y control de acceso por roles.',
            color: 'red'
        }
    ];

    const stats = [
        { number: '5,000+', label: 'Estudiantes Activos' },
        { number: '200+', label: 'Docentes Calificados' },
        { number: '98%', label: 'Satisfacción' },
        { number: '15+', label: 'Años de Experiencia' },
    ];

    return (
        <main
            ref={mainRef}
            className={`main-container ${isVisible ? 'visible' : ''}`}
        >
            {/* Progress Bar */}
            <div
                className="scroll-progress"
                style={{ width: `${scrollProgress}%` }}
            ></div>

            {/* Hero Section */}
            <section className="hero-section" id="Inicio">
                <div className="hero-background">
                    <div className="background-image"></div>
                    <div className="background-overlay"></div>
                </div>

                <div className="hero-content centered">
                    <div className="hero-text-center scroll-animate">
                        <h1 className="hero-title-large">
                            Bienvenido a CENIT
                        </h1>
                        <p className="hero-description">
                            Transformamos la administración académica con
                            tecnología innovadora diseñada específicamente para
                            instituciones educativas modernas
                        </p>
                        <div className="cta-container-center">
                            <button
                                className="cta-btn primary-btn large-btn"
                                onClick={() => {
                                    if (setShowLogin) {
                                        setShowLogin(true);
                                    }
                                }}
                            >
                                <span>Iniciar Sesión</span>
                            </button>
                        </div>
                    </div>
                </div>
            </section>


            {/* Services Section */}
            <section className="radical-features-section" id="Características">
                <div className="section-container">
                    <div className="radical-header scroll-animate">
                        <span className="radical-badge">Características</span>
                        <h2>Todo lo que necesitas para gestionar tu escuela</h2>
                        <p className="radical-subtitle">
                            Una plataforma completa con todas las herramientas necesarias para administrar de
                            forma eficiente tu institución educativa.
                        </p>
                    </div>

                    <div className="radical-grid">
                        {services.map((service, index) => (
                            <div
                                key={index}
                                className="radical-card scroll-animate"
                            >
                                <div className={`radical-icon ${service.color}`}>
                                    <span className="material-symbols-outlined radical-symbol">{service.icon}</span>
                                </div>
                                <h3>{service.title}</h3>
                                <p>{service.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Benefits Section - New Addition */}
            <section className="benefits-section" id="Beneficios">
                <div className="benefits-container">
                    <div className="benefits-grid">
                        {/* Left Column - Image Placeholder */}
                        <div className="benefits-image-wrapper">
                            <span className="benefits-placeholder-text"></span>
                        </div>

                        {/* Right Column - Content */}
                        <div className="benefits-content">
                            <span className="benefits-badge">Beneficios</span>
                            <h2>Transforma la gestión de tu institución educativa</h2>
                            <p className="benefits-description">
                                Optimiza procesos, mejora la eficiencia y brinda una mejor experiencia a
                                estudiantes, padres y personal administrativo.
                            </p>

                            <div className="benefits-checklist">
                                <div className="checklist-item">
                                    <div className="check-icon"><span className="material-symbols-outlined benefit-check-symbol">check</span></div>
                                    <span>Ahorra tiempo en tareas administrativas</span>
                                </div>
                                <div className="checklist-item">
                                    <div className="check-icon"><span className="material-symbols-outlined benefit-check-symbol">check</span></div>
                                    <span>Reduce el uso de papel y archivos físicos</span>
                                </div>
                                <div className="checklist-item">
                                    <div className="check-icon"><span className="material-symbols-outlined benefit-check-symbol">check</span></div>
                                    <span>Mejora la comunicación con padres y docentes</span>
                                </div>
                                <div className="checklist-item">
                                    <div className="check-icon"><span className="material-symbols-outlined benefit-check-symbol">check</span></div>
                                    <span>Acceso desde cualquier dispositivo</span>
                                </div>
                                <div className="checklist-item">
                                    <div className="check-icon"><span className="material-symbols-outlined benefit-check-symbol">check</span></div>
                                    <span>Reportes automáticos y en tiempo real</span>
                                </div>
                                <div className="checklist-item">
                                    <div className="check-icon"><span className="material-symbols-outlined benefit-check-symbol">check</span></div>
                                    <span>Soporte técnico dedicado 24/7</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
