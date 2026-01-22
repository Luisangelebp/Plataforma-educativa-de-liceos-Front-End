const RegistrationCard = ({
    role,
    icon,
    title,
    description,
    onClick,
    gradient,
}) => {
    return (
        <button
            onClick={() => onClick(role)}
            style={{
                padding: '30px',
                background: 'white',
                border: '2px solid var(--light-gray)',
                borderRadius: 'var(--border-radius)',
                cursor: 'pointer',
                transition: 'var(--transition)',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '15px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--primary)';
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow =
                    '0 4px 16px rgba(67, 97, 238, 0.2)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--light-gray)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow =
                    '0 2px 8px rgba(0, 0, 0, 0.1)';
            }}
        >
            <div
                style={{
                    width: '70px',
                    height: '70px',
                    borderRadius: '50%',
                    background: gradient,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    overflow: 'hidden',
                }}
            >
                <i
                    className={`fas ${icon}`}
                    style={{
                        fontSize: '2rem',
                        lineHeight: '1',
                        marginRight: 0,
                    }}
                ></i>
            </div>
            <h3
                style={{
                    margin: 0,
                    fontSize: '1.2rem',
                    fontWeight: '600',
                    color: 'var(--dark)',
                }}
            >
                {title}
            </h3>
            <p
                style={{
                    margin: 0,
                    color: 'var(--gray)',
                    fontSize: '0.9rem',
                }}
            >
                {description}
            </p>
        </button>
    );
};

export default RegistrationCard;
