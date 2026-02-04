import { useRegistration } from './Registro/useRegistration';
import Modal from './Registro/Modal';
import RegistrationForm from './Registro/RegistrationForm';
import RegistrationCard from './Registro/RegistrationCard';
import '../css/ModernDashboard.css';

const cardData = [
    {
        role: 'estudiante',
        icon: 'school',
        title: 'Estudiante',
        description: 'Registrar nuevo estudiante',
    },
    {
        role: 'profesor',
        icon: 'assignment_ind',
        title: 'Profesor',
        description: 'Registrar nuevo profesor',
    },
    {
        role: 'representante',
        icon: 'group',
        title: 'Representante',
        description: 'Registrar nuevo representante',
    },
    {
        role: 'administrador',
        icon: 'admin_panel_settings',
        title: 'Administrador',
        description: 'Registrar nuevo administrador',
    },
];

export default function Registro() {
    const {
        formData,
        errors,
        isLoading,
        openModal,
        gradosSecciones,
        materias,
        representantes,
        loadingGrados,
        loadingMaterias,
        loadingRepresentantes,
        handleInputChange,
        openModalHandler,
        closeModal,
        handleSubmit,
        getRoleIcon,
        getRoleName,
        calcularEdad,
        setSelectedGradosSecciones,
        setSelectedMaterias,
        selectedGradosSecciones,
        selectedMaterias
    } = useRegistration();

    return (
        <div>
            <div className="dashboard-header">
                <div>
                    <h1 className="page-title">Creación de usuarios</h1>
                    <p className="page-subtitle">Seleccione el tipo de usuario que desea registrar</p>
                </div>
            </div>

            <div className="grid-4">
                {cardData.map((card) => (
                    <RegistrationCard
                        key={card.role}
                        role={card.role}
                        icon={card.icon}
                        title={card.title}
                        description={card.description}
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
                        gradosSecciones={gradosSecciones}
                        materias={materias}
                        representantes={representantes}
                        loadingGrados={loadingGrados}
                        loadingMaterias={loadingMaterias}
                        loadingRepresentantes={loadingRepresentantes}
                        selectedGradosSecciones={selectedGradosSecciones}
                        selectedMaterias={selectedMaterias}
                        setSelectedGradosSecciones={setSelectedGradosSecciones}
                        setSelectedMaterias={setSelectedMaterias}
                    />
                </Modal>
            )}
        </div>
    );
}