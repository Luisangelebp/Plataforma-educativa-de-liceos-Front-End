import './css/Main.css';
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
            icon: 'fas fa-graduation-cap',
            title: 'Gestión Académica',
            description:
                'Control completo de calificaciones, asignaturas y rendimiento estudiantil con análisis predictivo.',
        },
        {
            icon: 'fas fa-chalkboard-teacher',
            title: 'Control Docente',
            description:
                'Administración eficiente del personal académico, horarios y planificación curricular.',
        },
        {
            icon: 'fas fa-book-open',
            title: 'Plataforma Educativa',
            description:
                'Recursos digitales, biblioteca virtual y materiales de estudio interactivos en la nube.',
        },
        {
            icon: 'fas fa-comments',
            title: 'Comunicación Institucional',
            description:
                'Canal directo entre estudiantes, padres, profesores y administración educativa.',
        },
        {
            icon: 'fas fa-calendar-alt',
            title: 'Calendarización Inteligente',
            description:
                'Organización automática de eventos académicos y actividades extracurriculares.',
        },
        {
            icon: 'fas fa-chart-line',
            title: 'Analytics Educativo',
            description:
                'Dashboard con métricas de desempeño institucional y tendencias académicas.',
        },
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

                <div className="hero-content">
                    <div className="hero-text scroll-animate">
                        <div className="title-container">
                            <h1 className="hero-title">
                                Sistema Integral de
                                <span className="title-accent">
                                    {' '}
                                    Gestión Educativa
                                </span>
                            </h1>
                        </div>
                        <p className="hero-subtitle">
                            Transformamos la administración académica con
                            tecnología innovadora diseñada específicamente para
                            instituciones educativas modernas
                        </p>
                        <div className="cta-container">
                            <button
                                className="cta-btn primary-btn scroll-animate"
                                onClick={() => setShowLogin(true)}
                            >
                                <span>Iniciar Sesión</span>
                                <i className="fas fa-arrow-right"></i>
                            </button>
                            <button className="cta-btn secondary-btn scroll-animate">
                                <span>Ver Demo</span>
                                <i className="fas fa-play"></i>
                            </button>
                        </div>
                    </div>

                    <div className="hero-visual scroll-animate">
                        <div className="platform-showcase">
                            {/* Dispositivos mostrando la plataforma */}
                            <div className="devices-container">
                                {/* Laptop */}
                                <div className="device laptop">
                                    <div className="device-frame">
                                        <div className="device-screen">
                                            <div className="screen-content">
                                                <div className="app-header">
                                                    <div className="app-nav">
                                                        <i className="fas fa-bars"></i>
                                                        <span>Dashboard</span>
                                                    </div>
                                                </div>
                                                <div className="app-stats">
                                                    <div className="stat-item">
                                                        <i className="fas fa-users"></i>
                                                        <span>Activos</span>
                                                        <strong>5.2k</strong>
                                                    </div>
                                                    <div className="stat-item">
                                                        <i className="fas fa-calendar-check"></i>
                                                        <span>Clases Hoy</span>
                                                        <strong>127</strong>
                                                    </div>
                                                </div>
                                                <div className="app-chart">
                                                    <div className="chart-bars">
                                                        <div
                                                            className="bar"
                                                            style={{
                                                                height: '60%',
                                                            }}
                                                        ></div>
                                                        <div
                                                            className="bar"
                                                            style={{
                                                                height: '80%',
                                                            }}
                                                        ></div>
                                                        <div
                                                            className="bar"
                                                            style={{
                                                                height: '45%',
                                                            }}
                                                        ></div>
                                                        <div
                                                            className="bar"
                                                            style={{
                                                                height: '90%',
                                                            }}
                                                        ></div>
                                                        <div
                                                            className="bar"
                                                            style={{
                                                                height: '70%',
                                                            }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Tablet */}
                                <div className="device tablet">
                                    <div className="device-frame">
                                        <div className="device-screen">
                                            <div className="screen-content">
                                                <div className="mobile-nav">
                                                    <i className="fas fa-home active"></i>
                                                    <i className="fas fa-chart-bar"></i>
                                                    <i className="fas fa-calendar"></i>
                                                    <i className="fas fa-cog"></i>
                                                </div>
                                                <div className="mobile-stats">
                                                    <div className="mobile-stat">
                                                        <i className="fas fa-check-circle"></i>
                                                        <span>Asistencia</span>
                                                        <strong>94%</strong>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Phone */}
                                <div className="device phone">
                                    <div className="device-frame">
                                        <div className="device-screen">
                                            <div className="screen-content">
                                                <div className="notification">
                                                    <i className="fas fa-bell"></i>
                                                    <span>
                                                        Nueva tarea asignada
                                                    </span>
                                                </div>
                                                <div className="quick-stats">
                                                    <div className="quick-stat">
                                                        <small>Promedio</small>
                                                        <strong>8.7</strong>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Elementos decorativos */}
                            <div className="floating-elements">
                                <div className="floating-element element-1">
                                    <i className="fas fa-cloud"></i>
                                </div>
                                <div className="floating-element element-2">
                                    <i className="fas fa-database"></i>
                                </div>
                                <div className="floating-element element-3">
                                    <i className="fas fa-mobile-alt"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="stats-section">
                <div className="section-container">
                    <div className="stats-grid">
                        {stats.map((stat, index) => (
                            <div
                                key={index}
                                className="stat-card scroll-animate"
                            >
                                <div className="stat-icon">
                                    {index === 0 && (
                                        <i className="fas fa-user-graduate"></i>
                                    )}
                                    {index === 1 && (
                                        <i className="fas fa-chalkboard-teacher"></i>
                                    )}
                                    {index === 2 && (
                                        <i className="fas fa-star"></i>
                                    )}
                                    {index === 3 && (
                                        <i className="fas fa-trophy"></i>
                                    )}
                                </div>
                                <div className="stat-content">
                                    <div className="stat-number">
                                        {stat.number}
                                    </div>
                                    <div className="stat-label">
                                        {stat.label}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section className="about-section" id="Nosotros">
                <div className="section-container">
                    <div className="about-content">
                        <div className="about-text scroll-animate">
                            <div className="section-header">
                                <h2>Innovación en Gestión Educativa</h2>
                                <p className="section-subtitle">
                                    Liderando la transformación digital de
                                    instituciones educativas
                                </p>
                            </div>
                            <p>
                                Desarrollamos soluciones tecnológicas que
                                revolucionan la administración académica,
                                optimizando procesos y mejorando la experiencia
                                educativa mediante herramientas inteligentes
                                diseñadas específicamente para el entorno
                                educativo moderno.
                            </p>
                            <div className="features-grid">
                                <div className="feature scroll-animate">
                                    <i className="fas fa-shield-alt"></i>
                                    <h4>Seguridad Avanzada</h4>
                                    <p>
                                        Protección de datos estudiantiles y
                                        administrativos con encriptación de
                                        última generación
                                    </p>
                                </div>
                                <div className="feature scroll-animate">
                                    <i className="fas fa-rocket"></i>
                                    <h4>Alta Performance</h4>
                                    <p>
                                        Infraestructura escalable que soporta
                                        miles de usuarios simultáneos
                                    </p>
                                </div>
                                <div className="feature scroll-animate">
                                    <i className="fas fa-sync"></i>
                                    <h4>Actualizaciones Constantes</h4>
                                    <p>
                                        Mejoras continuas basadas en feedback de
                                        instituciones educativas
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="about-visual scroll-animate">
                            <div className="visual-container">
                                <div className="floating-element el-1">
                                    <i className="fas fa-cloud"></i>
                                </div>
                                <div className="floating-element el-2">
                                    <i className="fas fa-database"></i>
                                </div>
                                <div className="floating-element el-3">
                                    <i className="fas fa-mobile-alt"></i>
                                </div>
                                <div className="main-visual">
                                    <img
                                        src={bannerImage}
                                        alt="Dashboard de la Plataforma Educativa"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Services Section */}
            <section className="services-section" id="Servicios">
                <div className="section-container" id="Funcionalidades">
                    <div className="section-header scroll-animate">
                        <h2>Funcionalidades Principales</h2>
                        <p className="section-subtitle">
                            Herramientas completas diseñadas para optimizar la
                            gestión educativa
                        </p>
                    </div>

                    <div className="services-grid">
                        {services.map((service, index) => (
                            <div
                                key={index}
                                className="service-card scroll-animate"
                            >
                                <div className="card-header">
                                    <div className="card-icon">
                                        <i className={service.icon}></i>
                                    </div>
                                    <h3>{service.title}</h3>
                                </div>
                                <div className="card-content">
                                    <p>{service.description}</p>
                                </div>
                                <div className="card-features">
                                    <span>
                                        <i className="fas fa-check"></i>{' '}
                                        Reportes automáticos
                                    </span>
                                    <span>
                                        <i className="fas fa-check"></i>{' '}
                                        Múltiples dispositivos
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Video Section */}
            <section className="video-section">
                <div className="section-container">
                    <div className="video-content">
                        <div className="video-text scroll-animate">
                            <h2>Descubre Nuestra Plataforma</h2>
                            <p>
                                Mira cómo nuestra solución transforma la gestión
                                educativa en menos de 3 minutos. Descubre las
                                características principales y el impacto
                                positivo en la administración académica.
                            </p>
                            <div className="video-stats">
                                <div className="video-stat">
                                    <strong>+500</strong>
                                    <span>Instituciones</span>
                                </div>
                                <div className="video-stat">
                                    <strong>98%</strong>
                                    <span>Eficiencia</span>
                                </div>
                                <div className="video-stat">
                                    <strong>24/7</strong>
                                    <span>Soporte</span>
                                </div>
                            </div>
                        </div>
                        <div className="video-player scroll-animate">
                            <div className="video-placeholder">
                                <div className="youtube-embed">
                                    <iframe
                                        width="100%"
                                        height="315px"
                                        src="https://www.youtube.com/embed/dQw4w9WgXcQ?rel=0&modestbranding=1"
                                        title="Tour Completo de la Plataforma Educativa"
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    ></iframe>
                                </div>
                            </div>
                            <a
                                href="https://youtube.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="video-link"
                            >
                                Ver video completo en YouTube
                                <i className="fas fa-external-link-alt"></i>
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section" id="Contacto">
                <div className="section-container">
                    <div className="cta-content">
                        <div className="cta-text scroll-animate">
                            <h2>¿Listo para Transformar tu Institución?</h2>
                            <p>
                                Únete a las más de 500 instituciones educativas
                                que ya optimizaron su gestión con nuestra
                                plataforma. Comienza tu transformación digital
                                hoy mismo.
                            </p>
                            <div className="cta-features">
                                <div className="cta-feature">
                                    <i className="fas fa-bolt"></i>
                                    <span>Configuración en 24h</span>
                                </div>
                                <div className="cta-feature">
                                    <i className="fas fa-headset"></i>
                                    <span>Soporte personalizado</span>
                                </div>
                                <div className="cta-feature">
                                    <i className="fas fa-graduation-cap"></i>
                                    <span>Capacitación incluida</span>
                                </div>
                            </div>
                        </div>
                        <div className="cta-action scroll-animate">
                            <button
                                className="cta-btn primary-btn large"
                                onClick={() => setShowLogin(true)}
                            >
                                <i className="fas fa-rocket"></i>
                                Comenzar Ahora
                            </button>
                            <div className="cta-guarantee">
                                <i className="fas fa-shield-check"></i>
                                <span>Garantía de satisfacción 30 días</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
