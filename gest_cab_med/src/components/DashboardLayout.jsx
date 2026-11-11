import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getUser, logoutUser } from "../services/authService";
import {
    LogoAlZahrawi,
    IconCabinetHome,
    IconAppointmentCalendar,
    IconRequestAppointment,
    IconPrescription,
    IconConsultation,
    IconPatientDossier,
    IconPills,
    IconFirstAidBox,
    IconHelpSupport,
    IconLogout,
    IconMenu,
    IconUser
} from "./MedicalIcons";

const roleNames = {
    PATIENT: "Espace patient",
    DOCTEUR: "Espace médecin",
    SECRETAIRE: "Espace secrétaire",
};

const roleMenus = {
    PATIENT: [
        { icon: IconCabinetHome, label: "Accueil", path: "/patient" },
        { icon: IconRequestAppointment, label: "Demander un rendez-vous", path: "/patient/appointments/request" },
        { icon: IconAppointmentCalendar, label: "Mes rendez-vous", path: "/patient/appointments" },
        { icon: IconPrescription, label: "Mes ordonnances", path: "/patient/prescriptions" },
        { icon: IconUser, label: "Mes coordonnées", path: "/patient/profile" },
    ],
    DOCTEUR: [
        { icon: IconCabinetHome, label: "Accueil", path: "/doctor" },
        { icon: IconPatientDossier, label: "Gestion des patients", path: "/doctor/patients" },
        { icon: IconAppointmentCalendar, label: "Rendez-vous", path: "/doctor/appointments" },
        { icon: IconConsultation, label: "Consultations", path: "/doctor/consultations" },
        { icon: IconPrescription, label: "Ordonnances", path: "/doctor/prescriptions" },
        { icon: IconPills, label: "Médicaments", path: "/doctor/medicaments" },
    ],
    SECRETAIRE: [
        { icon: IconCabinetHome, label: "Accueil", path: "/secretary" },
        { icon: IconPatientDossier, label: "Gestion des patients", path: "/secretary/patients" },
        { icon: IconAppointmentCalendar, label: "Gestion des rendez-vous", path: "/secretary/appointments" },
        { icon: IconFirstAidBox, label: "Salle d'attente du jour", path: "/secretary/waiting-room" },
        { icon: IconConsultation, label: "Consultations administratives", path: "/secretary/consultations" },
        { icon: IconPills, label: "Médicaments", path: "/secretary/medicaments" },
    ],
};

function DashboardLayout({ role, title, subtitle, children }) {
    const navigate = useNavigate();
    const location = useLocation();
    const user = getUser();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const menu = roleMenus[role] || [];

    const handleLogout = () => {
        logoutUser();
        navigate("/", { replace: true });
    };

    const initials = `${user?.prenom?.[0] || ""}${user?.nom?.[0] || ""}`;

    return (
        <div className="app-dashboard">
            {/* Background ambiance floating soft orbs (Clean, luminous depth without clutter) */}
            <div className="dashboard-ambiance" aria-hidden="true">
                <span className="dashboard-orbe dashboard-orbe-1" />
                <span className="dashboard-orbe dashboard-orbe-2" />
            </div>

            {/* Mobile backdrop overlay */}
            {sidebarOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={() => setSidebarOpen(false)}
                    aria-label="Fermer le menu"
                />
            )}

            {/* Glassmorphic Sidebar */}
            <aside className={`dashboard-sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
                <div className="sidebar-brand">
                    <div className="brand-icon">
                        <LogoAlZahrawi size={30} />
                    </div>
                    <div>
                        <h2>Al-Zahrawi</h2>
                        <span>Cabinet Médical</span>
                    </div>
                </div>

                <div className="sidebar-section-label">
                    MENU PRINCIPAL
                </div>

                <nav className="sidebar-navigation">
                    {menu.map((item) => {
                        const IconComponent = item.icon;
                        const active = location.pathname === item.path;

                        return (
                            <button
                                key={item.path}
                                className={`sidebar-link ${active ? "active" : ""}`}
                                onClick={() => {
                                    navigate(item.path);
                                    setSidebarOpen(false);
                                }}
                            >
                                <span className="sidebar-link-icon">
                                    <IconComponent size={20} />
                                </span>
                                <span>{item.label}</span>
                            </button>
                        );
                    })}
                </nav>

                <div className="sidebar-bottom">
                    <div className="sidebar-help">
                        <span className="help-icon">
                            <IconHelpSupport size={18} />
                        </span>
                        <div>
                            <strong>Besoin d'aide ?</strong>
                            <small>Assistance cabinet</small>
                        </div>
                    </div>

                    <button className="logout-button" onClick={handleLogout}>
                        <IconLogout size={18} />
                        <span>Déconnexion</span>
                    </button>
                </div>
            </aside>

            {/* Glassmorphic Main Content */}
            <main className="dashboard-main">
                <header className="dashboard-topbar">
                    <div className="topbar-left">
                        <button
                            type="button"
                            className="mobile-menu-btn"
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            aria-label="Ouvrir le menu"
                        >
                            <IconMenu size={20} />
                        </button>
                        <div>
                            <span className="topbar-role">
                                {roleNames[role]}
                            </span>
                            <span className="topbar-breadcrumb">
                                Al-Zahrawi / Tableau de bord
                            </span>
                        </div>
                    </div>

                    <div className="topbar-user">
                        <div className="user-avatar">{initials.toUpperCase() || "U"}</div>
                        <div className="user-details">
                            <strong>{user?.prenom} {user?.nom}</strong>
                            <span>{roleNames[role]}</span>
                        </div>
                    </div>
                </header>

                <div className="dashboard-content">
                    <div className="dashboard-heading">
                        <div>
                            <h1>{title}</h1>
                            <p>{subtitle}</p>
                        </div>
                        <div className="heading-date">
                            {new Date().toLocaleDateString("fr-FR", {
                                weekday: "long",
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                            })}
                        </div>
                    </div>

                    {children}
                </div>
            </main>
        </div>
    );
}

export default DashboardLayout;
