import { useRegistration } from './Registro/useRegistration';
import Modal from './Registro/Modal';
import RegistrationForm from './Registro/RegistrationForm';
import RegistrationCard from './Registro/RegistrationCard';

const cardData = [
    {
        role: 'estudiante',
        icon: 'fa-user-graduate',
        title: 'Estudiante',
        description: 'Registrar nuevo estudiante',
        gradient: 'linear-gradient(135deg, #28a745, #20c997)',
    },
    {
        role: 'profesor',
        icon: 'fa-chalkboard-teacher',
        title: 'Profesor',
        description: 'Registrar nuevo profesor',
        gradient: 'linear-gradient(135deg, #007bff, #0056b3)',
    },
    {
        role: 'representante',
        icon: 'fa-user-friends',
        title: 'Representante',
        description: 'Registrar nuevo representante',
        gradient: 'linear-gradient(135deg, #17a2b8, #138496)',
    },
    {
        role: 'administrador',
        icon: 'fa-user-cog',
        title: 'Administrador',
        description: 'Registrar nuevo administrador',
        gradient: 'linear-gradient(135deg, #6f42c1, #5a32a3)',
    },
];

export default function Registro() {
    const {
        formData,
        errors,
        isLoading,
        openModal,
        handleInputChange,
        openModalHandler,
        closeModal,
        handleSubmit,
        getRoleIcon,
        getRoleName,
        calcularEdad,
    } = useRegistration();

    return (
        <div>
            <div className="header">
                <div className="page-title">
                    <h1>Creación de usuarios</h1>
                    <p>Seleccione el tipo de usuario que desea registrar</p>
                </div>
            </div>

            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '20px',
                    marginTop: '30px',
                }}
            >
                {cardData.map((card) => (
                    <RegistrationCard
                        key={card.role}
                        role={card.role}
                        icon={card.icon}
                        title={card.title}
                        description={card.description}
                        gradient={card.gradient}
                        onClick={openModalHandler}
                    />
                ))}
            </div>

            {openModal && (
                <Modal
                    isOpen={!!openModal}
                    onClose={closeModal}
                    title={`Nuevo ${getRoleName(openModal)}`}
                    roleIcon={getRoleIcon(openModal)}
                >
                    <RegistrationForm
                        formData={formData}
                        errors={errors}
                        isLoading={isLoading}
                        handleInputChange={handleInputChange}
                        handleSubmit={handleSubmit}
                        closeModal={closeModal}
                        role={openModal}
                        calcularEdad={calcularEdad}
                    />
                </Modal>
            )}
        </div>
    );
}