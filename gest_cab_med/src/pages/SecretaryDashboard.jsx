import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import NotificationToast from "../components/NotificationToast";
import {
    getAllAppointments,
    updateAppointmentStatus,
    getDoctors,
    createAppointment
} from "../services/appointmentService";
import {
    getAllConsultations,
    deleteConsultation,
    getPatients,
    createPatient,
    updatePatient,
    togglePatientStatus
} from "../services/medicalService";
import {
    IconAppointmentCalendar,
    IconConsultation,
    IconPills,
    IconFirstAidBox,
    IconPlus,
    IconRefresh,
    IconCheck,
    IconClose,
    IconEdit,
    IconCalendar,
    IconClock,
    IconUser,
    IconArrowLeft,
    IconPatientDossier,
    IconEye,
    IconTrash,
    IconSearch,
    IconAlert,
    IconStethoscope
} from "../components/MedicalIcons";
import ConfirmModal from "../components/ConfirmModal";

const formatFrenchDate = (dateStr) => {
    if (!dateStr) return "Non renseignée";
    try {
        const parts = dateStr.split("-");
        if (parts.length === 3) {
            return `${parts[2]}/${parts[1]}/${parts[0]}`;
        }
        return dateStr;
    } catch {
        return dateStr;
    }
};

const cards = [
    { icon: IconPatientDossier, title: "Gestion des patients", description: "Consulter et gérer les dossiers administratifs des patients.", path: "/secretary/patients" },
    { icon: IconAppointmentCalendar, title: "Gestion des rendez-vous", description: "Organiser, confirmer, modifier et créer les rendez-vous du cabinet.", path: "/secretary/appointments" },
    { icon: IconFirstAidBox, title: "Salle d'attente du jour", description: "Suivre en direct les arrivées et la file d'attente des patients aujourd'hui.", path: "/secretary/waiting-room" },
    { icon: IconConsultation, title: "Consultations administratives", description: "Gérer les informations administratives et le suivi des actes du cabinet.", path: "/secretary/consultations" },
    { icon: IconPills, title: "Médicaments", description: "Inventaire de la pharmacie, dosages et gestion des stocks.", path: "/secretary/medicaments" },
];

function SecretaryDashboard() {
    const navigate = useNavigate();
    const location = useLocation();
    const rawPath = location.pathname;
    const path = rawPath.endsWith("/") && rawPath.length > 1 ? rawPath.slice(0, -1) : rawPath;

    const [appointments, setAppointments] = useState([]);
    const [isLoadingAppointments, setIsLoadingAppointments] = useState(false);
    const [filterStatut, setFilterStatut] = useState("TOUS");
    const [actionMessage, setActionMessage] = useState("");
    const [editingRdv, setEditingRdv] = useState(null);
    const [toast, setToast] = useState(null);

    const showToast = (message, type = "success") => {
        setToast({ message, type });
        if (type === "success") {
            setActionMessage(message);
            setTimeout(() => setActionMessage(""), 4000);
        }
    };

    // Consultations state
    const [consultations, setConsultations] = useState([]);
    const [isLoadingConsultations, setIsLoadingConsultations] = useState(false);

    // Patient Management state for secretary
    const [patientSearch, setPatientSearch] = useState("");
    const [isLoadingPatients, setIsLoadingPatients] = useState(false);
    const [selectedPatientModal, setSelectedPatientModal] = useState(null);
    const [showNewPatientModal, setShowNewPatientModal] = useState(false);
    const [newPatientForm, setNewPatientForm] = useState({
        nom: "",
        prenom: "",
        email: "",
        dateNaissance: "",
        adresse: ""
    });
    const [editingPatientModal, setEditingPatientModal] = useState(null);
    const [confirmModalState, setConfirmModalState] = useState(null);

    // New Appointment modal state for secretary
    const [showNewRdvModal, setShowNewRdvModal] = useState(false);
    const [patientsList, setPatientsList] = useState([]);
    const [doctorsList, setDoctorsList] = useState([]);
    const [newRdvForm, setNewRdvForm] = useState({
        idPatient: "",
        idDocteur: "",
        dateHeure: "",
        motif: ""
    });
    const [isSubmittingRdv, setIsSubmittingRdv] = useState(false);

    const loadAppointments = () => {
        setIsLoadingAppointments(true);
        getAllAppointments()
            .then((data) => setAppointments(data || []))
            .finally(() => setIsLoadingAppointments(false));
    };

    const loadConsultations = () => {
        setIsLoadingConsultations(true);
        getAllConsultations()
            .then((data) => setConsultations(data || []))
            .finally(() => setIsLoadingConsultations(false));
    };

    const loadPatients = () => {
        setIsLoadingPatients(true);
        getPatients()
            .then((data) => setPatientsList(data || []))
            .finally(() => setIsLoadingPatients(false));
    };

    const loadPatientsAndDoctors = () => {
        loadPatients();
        getDoctors().then((data) => setDoctorsList(data || []));
    };

    const handleDeleteConsultation = (c) => {
        setConfirmModalState({
            title: `Supprimer la consultation #${c.idConsultation} ?`,
            message: `Êtes-vous sûr de vouloir supprimer définitivement cette consultation pour le patient ${c.patientNom} ${c.patientPrenom} ? Cette action réinitialisera le rendez-vous associé en statut 'CONFIRMÉ' et libérera le dossier.`,
            confirmText: "Oui, supprimer",
            cancelText: "Annuler",
            variant: "danger",
            onConfirm: async () => {
                setConfirmModalState(null);
                try {
                    await deleteConsultation(c.idConsultation);
                    showToast(`Consultation #${c.idConsultation} supprimée avec succès.`, "success");
                    loadConsultations();
                    loadAppointments();
                } catch (error) {
                    showToast(error.message || "Erreur lors de la suppression de la consultation.", "error");
                }
            }
        });
    };

    const handleCreatePatientSubmit = async (e) => {
        e.preventDefault();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!newPatientForm.nom || !newPatientForm.prenom || !newPatientForm.email) {
            showToast("Nom, prénom et email sont obligatoires pour créer un patient.", "error");
            return;
        }
        if (!emailRegex.test(newPatientForm.email.trim())) {
            showToast("Veuillez saisir une adresse email valide (ex : exemple@domaine.com).", "error");
            return;
        }
        if (newPatientForm.dateNaissance) {
            const birthDate = new Date(newPatientForm.dateNaissance);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (birthDate > today) {
                showToast("La date de naissance ne peut pas être dans le futur.", "error");
                return;
            }
        }
        try {
            await createPatient(newPatientForm);
            showToast("Patient enregistré avec succès !", "success");
            setShowNewPatientModal(false);
            setNewPatientForm({ nom: "", prenom: "", email: "", dateNaissance: "", adresse: "" });
            loadPatients();
        } catch (error) {
            showToast(error.message || "Erreur lors de la création du patient.", "error");
        }
    };

    const handleUpdatePatientSubmit = async (e) => {
        e.preventDefault();
        if (!editingPatientModal) return;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!editingPatientModal.nom || !editingPatientModal.prenom || !editingPatientModal.email) {
            showToast("Nom, prénom et email sont obligatoires.", "error");
            return;
        }
        if (!emailRegex.test(editingPatientModal.email.trim())) {
            showToast("Veuillez saisir une adresse email valide (ex : exemple@domaine.com).", "error");
            return;
        }
        if (editingPatientModal.dateNaissance) {
            const birthDate = new Date(editingPatientModal.dateNaissance);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (birthDate > today) {
                showToast("La date de naissance ne peut pas être dans le futur.", "error");
                return;
            }
        }
        try {
            await updatePatient(editingPatientModal.idUtilisateur, editingPatientModal);
            showToast("Dossier patient mis à jour avec succès !", "success");
            setEditingPatientModal(null);
            loadPatients();
        } catch (error) {
            showToast(error.message || "Erreur lors de la mise à jour.", "error");
        }
    };

    const handleTogglePatientStatus = (patient) => {
        const newActif = !patient.actif;
        setConfirmModalState({
            title: newActif ? "Réactiver le dossier patient" : "Désactiver le dossier patient",
            message: newActif
                ? `Souhaitez-vous réactiver le dossier de ${patient.prenom} ${patient.nom} ? Le patient pourra à nouveau prendre rendez-vous.`
                : `Souhaitez-vous désactiver le dossier de ${patient.prenom} ${patient.nom} ? L'historique des consultations et rendez-vous sera entièrement préservé.`,
            confirmText: newActif ? "Accepter (Réactiver)" : "Accepter (Désactiver)",
            cancelText: "Annuler",
            variant: newActif ? "success" : "danger",
            onConfirm: async () => {
                setConfirmModalState(null);
                try {
                    await togglePatientStatus(patient.idUtilisateur, newActif);
                    showToast(`Patient ${patient.prenom} ${patient.nom} ${newActif ? "réactivé" : "désactivé"} avec succès.`, "success");
                    loadPatients();
                } catch (error) {
                    showToast(error.message || "Erreur lors du changement de statut.", "error");
                }
            }
        });
    };

    useEffect(() => {
        let isCancelled = false;
        if (path.includes("appointments") || path.includes("waiting-room")) {
            loadPatientsAndDoctors();
            getAllAppointments()
                .then((data) => {
                    if (!isCancelled) {
                        setAppointments(data || []);
                        setIsLoadingAppointments(false);
                    }
                })
                .catch(() => {
                    if (!isCancelled) setIsLoadingAppointments(false);
                });
        } else if (path.includes("patients")) {
            loadPatients();
        } else if (path.includes("consultations")) {
            getAllConsultations()
                .then((data) => {
                    if (!isCancelled) {
                        setConsultations(data || []);
                        setIsLoadingConsultations(false);
                    }
                })
                .catch(() => {
                    if (!isCancelled) setIsLoadingConsultations(false);
                });
        }
        return () => { isCancelled = true; };
    }, [path]);

    const handleUpdateStatus = async (idRdv, newStatut) => {
        try {
            await updateAppointmentStatus(idRdv, newStatut);
            showToast(`Rendez-vous mis à jour : ${newStatut}`, "success");
            loadAppointments();
        } catch (error) {
            showToast(error.message || "Erreur lors de la mise à jour", "error");
        }
    };

    const handleSaveModifiedRdv = async (e) => {
        e.preventDefault();
        if (!editingRdv) return;
        try {
            await updateAppointmentStatus(editingRdv.idRdv, editingRdv.statut);
            showToast(`Rendez-vous #${editingRdv.idRdv} mis à jour avec succès !`, "success");
            setEditingRdv(null);
            loadAppointments();
        } catch (error) {
            showToast(error.message || "Erreur lors de la modification", "error");
        }
    };

    const handleOpenNewRdvModal = () => {
        loadPatientsAndDoctors();
        setNewRdvForm({
            idPatient: "",
            idDocteur: "",
            dateHeure: "",
            motif: ""
        });
        setShowNewRdvModal(true);
    };

    const handleCreateAppointmentSubmit = async (e) => {
        e.preventDefault();
        if (!newRdvForm.idPatient || !newRdvForm.idDocteur || !newRdvForm.dateHeure) {
            showToast("Veuillez sélectionner le patient, le médecin et la date/heure.", "error");
            return;
        }

        setIsSubmittingRdv(true);
        try {
            const formattedDate = newRdvForm.dateHeure.replace("T", " ") + (newRdvForm.dateHeure.length === 16 ? ":00" : "");
            await createAppointment({
                idPatient: parseInt(newRdvForm.idPatient, 10),
                idDocteur: parseInt(newRdvForm.idDocteur, 10),
                dateHeure: formattedDate,
                motif: newRdvForm.motif.trim() || "Consultation générale",
                statut: "CONFIRME"
            });
            showToast("Rendez-vous créé et confirmé avec succès !", "success");
            setShowNewRdvModal(false);
            setNewRdvForm({ idPatient: "", idDocteur: "", dateHeure: "", motif: "" });
            loadAppointments();
        } catch (err) {
            showToast(err.message || "Erreur lors de la création du rendez-vous.", "error");
        } finally {
            setIsSubmittingRdv(false);
        }
    };

    let title = "Tableau de bord secrétaire";
    let subtitle = "Gérez l'organisation administrative du cabinet médical.";

    if (path.includes("patients")) {
        title = "Gestion des dossiers patients";
        subtitle = "Consultez, modifiez et gérez les dossiers administratifs des patients du cabinet.";
    } else if (path.includes("waiting-room")) {
        title = "Salle d'attente du jour";
        subtitle = "Suivi en direct des patients du jour et gestion de la file d'attente.";
    } else if (path.includes("appointments")) {
        title = "Régulation des Rendez-vous";
        subtitle = "Validez, confirmez, modifiez ou créez les rendez-vous du cabinet.";
    } else if (path.includes("consultations")) {
        title = "Suivi Administratif des Consultations";
        subtitle = "Gérez les dossiers administratifs et l'historique des actes.";
    }

    const filteredPatients = patientsList.filter((p) => {
        const q = patientSearch.toLowerCase();
        return (
            (p.nom && p.nom.toLowerCase().includes(q)) ||
            (p.prenom && p.prenom.toLowerCase().includes(q)) ||
            (p.email && p.email.toLowerCase().includes(q)) ||
            (p.adresse && p.adresse.toLowerCase().includes(q))
        );
    });

    const filteredList = filterStatut === "TOUS"
        ? appointments
        : appointments.filter((rdv) => rdv.statut === filterStatut);

    // Today's appointments for Waiting Room
    const todayStr = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    const todayAppointments = appointments.filter((rdv) => rdv.dateHeure?.startsWith(todayStr));

    const getStatusBadge = (statut) => {
        switch (statut) {
            case "CONFIRME":
                return <span className="badge-status badge-confirmed"><IconCheck size={12} /> Confirmé</span>;
            case "ANNULE":
                return <span className="badge-status badge-cancelled"><IconClose size={12} /> Annulé</span>;
            case "TERMINE":
                return <span className="badge-status badge-completed"><IconCheck size={12} /> Terminé</span>;
            default:
                return <span className="badge-status badge-waiting"><IconClock size={12} /> En attente</span>;
        }
    };

    return (
        <DashboardLayout role="SECRETAIRE" title={title} subtitle={subtitle}>
            <NotificationToast
                message={toast?.message}
                type={toast?.type}
                onClose={() => setToast(null)}
            />

            {/* ── 1. ACCUEIL ── */}
            {path === "/secretary" && (
                <>
                    <div className="welcome-banner secretary-banner">
                        <div>
                            <span className="banner-label">ESPACE SECRÉTARIAT</span>
                            <h2>Organisation du cabinet.</h2>
                            <p>Supervisez les rendez-vous, la salle d'attente et le suivi administratif.</p>
                        </div>
                        <div className="banner-decoration">
                            <IconFirstAidBox size={32} />
                        </div>
                    </div>

                    <h2 className="section-title">Gestion administrative</h2>
                    <div className="dashboard-grid">
                        {cards.map((card) => {
                            const IconComponent = card.icon;
                            return (
                                <div
                                    className="service-card"
                                    key={card.title}
                                    onClick={() => navigate(card.path)}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" || e.key === " ") navigate(card.path);
                                    }}
                                >
                                    <div className="service-card-icon">
                                        <IconComponent size={28} />
                                    </div>
                                    <h3>{card.title}</h3>
                                    <p>{card.description}</p>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}

            {/* ── 2. GESTION DES RENDEZ-VOUS ── */}
            {path === "/secretary/appointments" && (
                <div className="medicaments-panneau">
                    <button onClick={() => navigate("/secretary")} className="btn-retour" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                        <IconArrowLeft size={16} /> Retour à l'accueil
                    </button>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
                        <div>
                            <h3 style={{ margin: "0 0 4px 0", fontSize: "1.25rem", fontWeight: 700, color: "#0f172a" }}>
                                Régulation des Rendez-vous ({appointments.length})
                            </h3>
                            <p style={{ margin: 0, opacity: 0.8, fontSize: "0.85rem" }}>
                                Validez, modifiez ou enregistrez un rendez-vous pour un patient.
                            </p>
                        </div>
                        <div style={{ display: "flex", gap: "10px" }}>
                            <button
                                type="button"
                                className="btn-action-principal"
                                style={{ minHeight: "36px", padding: "8px 16px", fontSize: "0.85rem", display: "inline-flex", alignItems: "center", gap: "8px" }}
                                onClick={handleOpenNewRdvModal}
                            >
                                <IconPlus size={15} /> Nouveau rendez-vous
                            </button>
                            <button
                                type="button"
                                className="med-btn med-btn-secondaire"
                                style={{ minHeight: "36px", padding: "8px 14px", fontSize: "0.85rem", display: "inline-flex", alignItems: "center", gap: "6px" }}
                                onClick={loadAppointments}
                            >
                                <IconRefresh size={14} /> Actualiser
                            </button>
                        </div>
                    </div>

                    {/* Filtres par statut */}
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "18px" }}>
                        {["TOUS", "DEMANDE", "CONFIRME", "ANNULE", "TERMINE"].map((st) => (
                            <button
                                key={st}
                                type="button"
                                onClick={() => setFilterStatut(st)}
                                style={{
                                    background: filterStatut === st ? "linear-gradient(110deg, #0879f9, #08c7b6)" : "#f1f5f9",
                                    border: "1px solid #cbd5e1",
                                    color: filterStatut === st ? "#ffffff" : "#334155",
                                    padding: "6px 14px",
                                    borderRadius: "10px",
                                    fontSize: "0.78rem",
                                    fontWeight: 700,
                                    cursor: "pointer",
                                    transition: "background 0.2s"
                                }}
                            >
                                {st === "TOUS" ? "Tous" : st === "DEMANDE" ? "En attente" : st === "CONFIRME" ? "Confirmés" : st === "ANNULE" ? "Annulés" : "Terminés"}
                            </button>
                        ))}
                    </div>

                    {actionMessage && (
                        <div style={{ padding: "10px 14px", borderRadius: "10px", background: "rgba(8, 199, 182, 0.22)", border: "1px solid #111111", color: "#111111", marginBottom: "14px", fontSize: "0.85rem" }}>
                            {actionMessage}
                        </div>
                    )}

                    {isLoadingAppointments ? (
                        <div style={{ padding: "40px", textAlign: "center", color: "#0f766e", fontWeight: 600 }}>
                            Chargement des rendez-vous...
                        </div>
                    ) : filteredList.length === 0 ? (
                        <div style={{ padding: "50px 20px", textAlign: "center", background: "rgba(255, 255, 255, 0.08)", borderRadius: "16px", border: "1px dashed rgba(255, 255, 255, 0.25)" }}>
                            <div style={{ display: "flex", justifyContent: "center", marginBottom: "10px" }}>
                                <IconAppointmentCalendar size={44} />
                            </div>
                            <h4 style={{ margin: "0 0 6px 0", color: "#0f172a", fontSize: "1.1rem" }}>Aucun rendez-vous correspondant</h4>
                            <p style={{ margin: 0, opacity: 0.8, fontSize: "0.85rem" }}>
                                Aucun rendez-vous ne correspond au filtre sélectionné.
                            </p>
                        </div>
                    ) : (
                        <div style={{ width: "100%", overflowX: "auto" }}>
                            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.88rem" }}>
                                <thead>
                                    <tr style={{ borderBottom: "2px solid #e2e8f0", background: "#f8fafc", color: "#475569", fontSize: "0.78rem", textTransform: "uppercase", fontWeight: 700 }}>
                                        <th style={{ padding: "12px 10px" }}>Date & Heure</th>
                                        <th style={{ padding: "12px 10px" }}>Patient</th>
                                        <th style={{ padding: "12px 10px" }}>Médecin</th>
                                        <th style={{ padding: "12px 10px" }}>Motif</th>
                                        <th style={{ padding: "12px 10px" }}>Statut</th>
                                        <th style={{ padding: "12px 10px", textAlign: "right" }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredList.map((rdv) => (
                                        <tr key={rdv.idRdv} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.12)" }}>
                                            <td style={{ padding: "14px 10px", fontWeight: 700, color: "#0f172a" }}>
                                                <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                                                    <IconCalendar size={14} style={{ color: "#0284c7" }} /> {rdv.dateHeure}
                                                </span>
                                            </td>
                                            <td style={{ padding: "14px 10px" }}>
                                                <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                                                    <IconUser size={14} /> {rdv.patientPrenom} {rdv.patientNom}
                                                </span>
                                                <div style={{ fontSize: "0.76rem", opacity: 0.7, marginLeft: "20px" }}>{rdv.patientEmail}</div>
                                            </td>
                                            <td style={{ padding: "14px 10px" }}>
                                                Dr. {rdv.docteurPrenom} {rdv.docteurNom} ({rdv.docteurSpecialite || "Généraliste"})
                                            </td>
                                            <td style={{ padding: "14px 10px", opacity: 0.9 }}>
                                                {rdv.motif || "Consultation générale"}
                                            </td>
                                            <td style={{ padding: "14px 10px" }}>
                                                {getStatusBadge(rdv.statut)}
                                            </td>
                                            <td style={{ padding: "14px 10px", textAlign: "right" }}>
                                                <div style={{ display: "inline-flex", gap: "6px", flexWrap: "wrap", justifyContent: "flex-end" }}>
                                                    {/* When DEMANDE: confirm or cancel */}
                                                    {rdv.statut === "DEMANDE" && (
                                                        <>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleUpdateStatus(rdv.idRdv, "CONFIRME")}
                                                                style={{ background: "#047857", border: "1px solid #065f46", color: "#ffffff", padding: "6px 12px", borderRadius: "8px", fontSize: "0.8rem", fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "4px" }}
                                                            >
                                                                <IconCheck size={12} /> Confirmer
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleUpdateStatus(rdv.idRdv, "ANNULE")}
                                                                style={{ background: "#991b1b", border: "1px solid #7f1d1d", color: "#ffffff", padding: "6px 12px", borderRadius: "8px", fontSize: "0.8rem", fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "4px" }}
                                                            >
                                                                <IconClose size={12} /> Annuler
                                                            </button>
                                                        </>
                                                    )}

                                                    {/* When CONFIRME: cancel or modify */}
                                                    {rdv.statut === "CONFIRME" && (
                                                        <>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleUpdateStatus(rdv.idRdv, "ANNULE")}
                                                                style={{ background: "#991b1b", border: "1px solid #7f1d1d", color: "#ffffff", padding: "6px 12px", borderRadius: "8px", fontSize: "0.8rem", fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "4px" }}
                                                            >
                                                                <IconClose size={12} /> Annuler
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => setEditingRdv(rdv)}
                                                                style={{ background: "#0f172a", border: "1px solid #020617", color: "#ffffff", padding: "6px 12px", borderRadius: "8px", fontSize: "0.8rem", fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "4px" }}
                                                            >
                                                                <IconEdit size={12} /> Modifier
                                                            </button>
                                                        </>
                                                    )}

                                                    {/* When ANNULE: allow restoring */}
                                                    {rdv.statut === "ANNULE" && (
                                                        <button
                                                            type="button"
                                                            onClick={() => setEditingRdv(rdv)}
                                                            style={{ background: "#b45309", border: "1px solid #92400e", color: "#ffffff", padding: "6px 12px", borderRadius: "8px", fontSize: "0.8rem", fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "4px" }}
                                                        >
                                                            <IconEdit size={12} /> Modifier / Rétablir
                                                        </button>
                                                    )}

                                                    {/* When TERMINE */}
                                                    {rdv.statut === "TERMINE" && (
                                                        <span style={{ fontSize: "0.78rem", opacity: 0.7 }}>Acte honoré</span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* ── 3. SALLE D'ATTENTE DU JOUR ── */}
            {path === "/secretary/waiting-room" && (
                <div className="medicaments-panneau">
                    <button onClick={() => navigate("/secretary")} className="btn-retour" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                        <IconArrowLeft size={16} /> Retour à l'accueil
                    </button>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "10px" }}>
                        <div>
                            <span className="app-badge badge-primary">FILE D'ATTENTE EN TEMPS RÉEL</span>
                            <h3 style={{ margin: "6px 0 4px 0", fontSize: "1.3rem", color: "#ffffff" }}>
                                Planning &amp; Salle d'attente d'aujourd'hui
                            </h3>
                            <p style={{ margin: 0, opacity: 0.8, fontSize: "0.85rem" }}>
                                Date du jour : <strong>{todayStr}</strong> • Pointez l'arrivée des patients et régulez le flux du cabinet.
                            </p>
                        </div>
                        <button
                            type="button"
                            className="btn-action-principal"
                            style={{ minHeight: "36px", padding: "6px 14px", fontSize: "0.82rem", display: "inline-flex", alignItems: "center", gap: "6px" }}
                            onClick={loadAppointments}
                        >
                            <IconRefresh size={14} /> Rafraîchir la file
                        </button>
                    </div>

                    {/* Stats pills du jour */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "14px", marginBottom: "24px" }}>
                        <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "14px", border: "1px solid #e2e8f0" }}>
                            <span style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "#64748b", fontWeight: 600 }}>Total Prévus</span>
                            <h3 style={{ margin: "4px 0 0", fontSize: "1.8rem", color: "#0f172a" }}>{todayAppointments.length}</h3>
                        </div>
                        <div style={{ background: "#ecfdf5", padding: "16px", borderRadius: "14px", border: "1px solid #10b981" }}>
                            <span style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "#065f46", fontWeight: 700 }}>Confirmés / Arrivés</span>
                            <h3 style={{ margin: "4px 0 0", fontSize: "1.8rem", color: "#047857" }}>
                                {todayAppointments.filter((r) => r.statut === "CONFIRME").length}
                            </h3>
                        </div>
                        <div style={{ background: "#fef3c7", padding: "16px", borderRadius: "14px", border: "1px solid #f59e0b" }}>
                            <span style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "#92400e", fontWeight: 700 }}>En attente</span>
                            <h3 style={{ margin: "4px 0 0", fontSize: "1.8rem", color: "#b45309" }}>
                                {todayAppointments.filter((r) => r.statut === "DEMANDE").length}
                            </h3>
                        </div>
                        <div style={{ background: "#eff6ff", padding: "16px", borderRadius: "14px", border: "1px solid #3b82f6" }}>
                            <span style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "#1e40af", fontWeight: 700 }}>Consultés / Terminés</span>
                            <h3 style={{ margin: "4px 0 0", fontSize: "1.8rem", color: "#1d4ed8" }}>
                                {todayAppointments.filter((r) => r.statut === "TERMINE").length}
                            </h3>
                        </div>
                    </div>

                    {isLoadingAppointments ? (
                        <div style={{ padding: "40px", textAlign: "center", color: "#0f766e", fontWeight: 600 }}>
                            Chargement du planning du jour...
                        </div>
                    ) : todayAppointments.length === 0 ? (
                        <div style={{ padding: "50px 20px", textAlign: "center", background: "rgba(255, 255, 255, 0.08)", borderRadius: "16px", border: "1px dashed rgba(255, 255, 255, 0.25)" }}>
                            <div style={{ display: "flex", justifyContent: "center", marginBottom: "10px" }}>
                                <IconFirstAidBox size={44} />
                            </div>
                            <h4 style={{ margin: "0 0 6px 0", color: "#0f172a", fontSize: "1.1rem" }}>Aucun rendez-vous prévu pour aujourd'hui</h4>
                            <p style={{ margin: 0, opacity: 0.8, fontSize: "0.85rem" }}>
                                La salle d'attente est actuellement libre. Vous pouvez planifier des rendez-vous depuis l'onglet Gestion des rendez-vous.
                            </p>
                        </div>
                    ) : (
                        <div style={{ width: "100%", overflowX: "auto" }}>
                            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.88rem" }}>
                                <thead>
                                    <tr style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.25)", color: "#111111", fontSize: "0.78rem", textTransform: "uppercase" }}>
                                        <th style={{ padding: "12px 10px" }}>Heure</th>
                                        <th style={{ padding: "12px 10px" }}>Patient</th>
                                        <th style={{ padding: "12px 10px" }}>Praticien</th>
                                        <th style={{ padding: "12px 10px" }}>Motif</th>
                                        <th style={{ padding: "12px 10px" }}>Statut Présence</th>
                                        <th style={{ padding: "12px 10px", textAlign: "right" }}>Pointage</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {todayAppointments.map((rdv) => (
                                        <tr key={rdv.idRdv} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.12)" }}>
                                            <td style={{ padding: "14px 10px", fontWeight: 700, color: "#0f172a" }}>
                                                <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                                                    <IconClock size={14} style={{ color: "#0284c7" }} /> {rdv.dateHeure.split(" ")[1] || rdv.dateHeure}
                                                </span>
                                            </td>
                                            <td style={{ padding: "14px 10px" }}>
                                                <strong>{rdv.patientPrenom} {rdv.patientNom}</strong>
                                                <div style={{ fontSize: "0.76rem", opacity: 0.7 }}>{rdv.patientEmail}</div>
                                            </td>
                                            <td style={{ padding: "14px 10px" }}>
                                                Dr. {rdv.docteurPrenom} {rdv.docteurNom}
                                            </td>
                                            <td style={{ padding: "14px 10px", opacity: 0.9 }}>
                                                {rdv.motif}
                                            </td>
                                            <td style={{ padding: "14px 10px" }}>
                                                {getStatusBadge(rdv.statut)}
                                            </td>
                                            <td style={{ padding: "14px 10px", textAlign: "right" }}>
                                                <div style={{ display: "inline-flex", gap: "6px" }}>
                                                    {rdv.statut !== "CONFIRME" && rdv.statut !== "TERMINE" && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleUpdateStatus(rdv.idRdv, "CONFIRME")}
                                                            style={{ background: "rgba(8, 199, 182, 0.28)", border: "1px solid #111111", color: "#111111", padding: "5px 10px", borderRadius: "8px", fontSize: "0.78rem", fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "4px" }}
                                                        >
                                                            <IconCheck size={12} /> Arrivé
                                                        </button>
                                                    )}
                                                    {rdv.statut === "CONFIRME" && (
                                                        <span style={{ fontSize: "0.8rem", color: "#111111", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "4px" }}>
                                                            <IconCheck size={12} /> En salle
                                                        </span>
                                                    )}
                                                    {rdv.statut === "TERMINE" && (
                                                        <span style={{ fontSize: "0.8rem", color: "#80c4ff", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                                                            <IconCheck size={12} /> Terminé
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* ── 4. CONSULTATIONS ADMINISTRATIVES ── */}
            {path === "/secretary/consultations" && (
                <div className="medicaments-panneau">
                    <button onClick={() => navigate("/secretary")} className="btn-retour" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                        <IconArrowLeft size={16} /> Retour à l'accueil
                    </button>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
                        <div>
                            <h3 style={{ margin: "0 0 4px 0", fontSize: "1.25rem", fontWeight: 700, color: "#0f172a" }}>
                                Suivi Administratif des Consultations ({consultations.length})
                            </h3>
                            <p style={{ margin: 0, opacity: 0.8, fontSize: "0.85rem" }}>
                                Traçabilité des actes médicaux réalisés au cabinet (dossier administratif sans données médicales sensibles).
                            </p>
                        </div>
                        <button
                            type="button"
                            className="btn-action-principal"
                            style={{ minHeight: "36px", padding: "6px 14px", fontSize: "0.82rem", display: "inline-flex", alignItems: "center", gap: "6px" }}
                            onClick={loadConsultations}
                        >
                            <IconRefresh size={14} /> Actualiser
                        </button>
                    </div>

                    {isLoadingConsultations ? (
                        <div style={{ padding: "40px", textAlign: "center", color: "#0f766e", fontWeight: 600 }}>
                            Chargement des dossiers de consultations...
                        </div>
                    ) : consultations.length === 0 ? (
                        <div style={{ padding: "50px 20px", textAlign: "center", background: "rgba(255, 255, 255, 0.08)", borderRadius: "16px", border: "1px dashed rgba(255, 255, 255, 0.25)" }}>
                            <div style={{ display: "flex", justifyContent: "center", marginBottom: "10px" }}>
                                <IconConsultation size={44} />
                            </div>
                            <h4 style={{ margin: "0 0 6px 0", color: "#0f172a", fontSize: "1.1rem" }}>Aucune consultation enregistrée</h4>
                            <p style={{ margin: 0, opacity: 0.8, fontSize: "0.85rem" }}>
                                Les consultations réalisées par les praticiens s'afficheront ici pour le suivi administratif.
                            </p>
                        </div>
                    ) : (
                        <div style={{ width: "100%", overflowX: "auto" }}>
                            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.88rem" }}>
                                <thead>
                                    <tr style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.25)", color: "#111111", fontSize: "0.78rem", textTransform: "uppercase" }}>
                                        <th style={{ padding: "12px 10px" }}>N° & Date</th>
                                        <th style={{ padding: "12px 10px" }}>Patient</th>
                                        <th style={{ padding: "12px 10px" }}>Praticien</th>
                                        <th style={{ padding: "12px 10px" }}>Statut Administratif</th>
                                        <th style={{ padding: "12px 10px", textAlign: "center" }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {consultations.map((c) => (
                                        <tr key={c.idConsultation} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.12)" }}>
                                            <td style={{ padding: "14px 10px", fontWeight: 700, color: "#0f172a" }}>
                                                #{c.idConsultation} • {c.dateConsultation}
                                            </td>
                                            <td style={{ padding: "14px 10px" }}>
                                                <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                                                    <IconUser size={14} /> {c.patientNom} {c.patientPrenom}
                                                </span>
                                                <div style={{ fontSize: "0.76rem", opacity: 0.7, marginLeft: "20px" }}>{c.patientEmail}</div>
                                            </td>
                                            <td style={{ padding: "14px 10px" }}>
                                                Dr. {c.docteurPrenom} {c.docteurNom} ({c.docteurSpecialite || "Généraliste"})
                                            </td>
                                            <td style={{ padding: "14px 10px" }}>
                                                <span className="badge-status badge-completed" style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
                                                    <IconCheck size={11} /> Acte honoré / Pris en charge
                                                </span>
                                            </td>
                                            <td style={{ padding: "14px 10px", textAlign: "center" }}>
                                                <button
                                                    type="button"
                                                    className="action-icon-btn action-deactivate"
                                                    style={{ width: "32px", height: "32px", padding: 0, background: "rgba(239, 68, 68, 0.12)", color: "#ef4444", border: "1px solid rgba(239, 68, 68, 0.3)", borderRadius: "6px", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s ease" }}
                                                    onClick={() => handleDeleteConsultation(c)}
                                                    title="Supprimer la consultation"
                                                    aria-label="Supprimer la consultation"
                                                >
                                                    <IconTrash size={14} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* ── 5. GESTION DES PATIENTS ── */}
            {path === "/secretary/patients" && (
                <div className="medicaments-panneau">
                    <button onClick={() => navigate("/secretary")} className="btn-retour" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                        <IconArrowLeft size={16} /> Retour à l'accueil
                    </button>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", marginBottom: "20px" }}>
                        <div>
                            <h3 style={{ margin: "0 0 4px 0", fontSize: "1.3rem", fontWeight: 700, color: "#0f172a" }}>
                                Registre des Patients ({patientsList.length})
                            </h3>
                            <p style={{ margin: 0, color: "#64748b", fontSize: "0.88rem" }}>
                                Consultez les fiches administratives, coordonnées et statut des patients du cabinet.
                            </p>
                        </div>
                        <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
                            <button
                                type="button"
                                className="btn-action-principal"
                                style={{ minHeight: "38px", padding: "8px 16px", fontSize: "0.85rem", display: "inline-flex", alignItems: "center", gap: "8px" }}
                                onClick={() => setShowNewPatientModal(true)}
                            >
                                <IconPlus size={15} /> Nouveau patient
                            </button>
                            <div className="patient-search-wrapper">
                                <span className="patient-search-icon"><IconSearch size={16} /></span>
                                <input
                                    type="search"
                                    className="patient-search-input"
                                    placeholder="Rechercher un patient…"
                                    value={patientSearch}
                                    onChange={(e) => setPatientSearch(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {isLoadingPatients ? (
                        <div style={{ padding: "40px", textAlign: "center", color: "#0f766e", fontWeight: 600 }}>
                            Chargement des dossiers patients...
                        </div>
                    ) : filteredPatients.length === 0 ? (
                        <div style={{ padding: "50px 20px", textAlign: "center", background: "#f8fafc", borderRadius: "16px", border: "1px dashed #cbd5e1" }}>
                            <div style={{ display: "flex", justifyContent: "center", marginBottom: "10px", color: "#64748b" }}>
                                <IconPatientDossier size={44} />
                            </div>
                            <h4 style={{ margin: "0 0 6px 0", color: "#0f172a", fontSize: "1.1rem" }}>Aucun patient trouvé</h4>
                            <p style={{ margin: 0, color: "#64748b", fontSize: "0.85rem" }}>
                                {patientSearch ? "Aucun patient ne correspond à votre recherche." : "Aucun patient n'est encore enregistré dans la base."}
                            </p>
                        </div>
                    ) : (
                        <div className="patient-table-wrapper">
                            <table className="patient-table">
                                <thead>
                                    <tr>
                                        <th style={{ width: "22%" }}>Patient</th>
                                        <th style={{ width: "10%" }}>Statut</th>
                                        <th style={{ width: "14%" }}>Date de naissance</th>
                                        <th style={{ width: "18%" }}>Email</th>
                                        <th style={{ width: "14%" }}>Adresse</th>
                                        <th style={{ width: "6%", textAlign: "center" }}>RDV</th>
                                        <th style={{ width: "6%", textAlign: "center" }}>Consultations</th>
                                        <th style={{ width: "10%", textAlign: "center", minWidth: "120px" }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredPatients.map((p) => (
                                        <tr key={p.idUtilisateur} style={{ opacity: p.actif === false ? 0.65 : 1 }}>
                                            <td>
                                                <span className="patient-name-cell">
                                                    <IconUser size={16} style={{ color: "#0284c7", flexShrink: 0 }} /> {p.nom} {p.prenom}
                                                </span>
                                            </td>
                                            <td>
                                                {p.actif !== false ? (
                                                    <span className="badge-patient-active">
                                                        <IconCheck size={11} /> Actif
                                                    </span>
                                                ) : (
                                                    <span className="badge-patient-inactive">
                                                        <IconClose size={11} /> Inactif
                                                    </span>
                                                )}
                                            </td>
                                            <td className="font-tabular" style={{ color: "#1e293b", fontWeight: 500 }}>
                                                {formatFrenchDate(p.dateNaissance)}
                                            </td>
                                            <td style={{ color: "#334155", fontWeight: 500 }}>
                                                {p.email}
                                            </td>
                                            <td style={{ color: "#475569" }}>
                                                {p.adresse || "Non renseignée"}
                                            </td>
                                            <td style={{ textAlign: "center" }}>
                                                <span className="patient-count-pill font-tabular">{p.totalRdv || 0}</span>
                                            </td>
                                            <td style={{ textAlign: "center" }}>
                                                <span className="patient-count-pill-alt font-tabular">{p.totalConsultations || 0}</span>
                                            </td>
                                            <td style={{ textAlign: "center" }}>
                                                <div className="action-icon-group">
                                                    <button
                                                        type="button"
                                                        onClick={() => setSelectedPatientModal(p)}
                                                        className="action-icon-btn action-view"
                                                        title="Voir la fiche patient"
                                                        aria-label="Voir la fiche patient"
                                                    >
                                                        <IconEye size={15} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setEditingPatientModal({
                                                            idUtilisateur: p.idUtilisateur,
                                                            nom: p.nom,
                                                            prenom: p.prenom,
                                                            email: p.email,
                                                            dateNaissance: p.dateNaissance || "",
                                                            adresse: p.adresse || ""
                                                        })}
                                                        className="action-icon-btn action-edit"
                                                        title="Modifier le dossier patient"
                                                        aria-label="Modifier le dossier patient"
                                                    >
                                                        <IconEdit size={14} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleTogglePatientStatus(p)}
                                                        className={`action-icon-btn ${p.actif !== false ? "action-deactivate" : "action-activate"}`}
                                                        title={p.actif !== false ? "Désactiver le patient" : "Réactiver le patient"}
                                                        aria-label={p.actif !== false ? "Désactiver le patient" : "Réactiver le patient"}
                                                    >
                                                        {p.actif !== false ? <IconTrash size={14} /> : <IconCheck size={14} />}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* ── MODAL 1 : NOUVEAU RENDEZ-VOUS (SECRÉTAIRE) ── */}
            {showNewRdvModal && (
                <div className="modal-overlay" onClick={() => setShowNewRdvModal(false)}>
                    <div className="modal-glass" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>
                                <IconPlus size={18} /> Créer un rendez-vous pour un patient
                            </h3>
                            <button type="button" className="btn-close-modal" onClick={() => setShowNewRdvModal(false)}>
                                <IconClose size={14} />
                            </button>
                        </div>
                        <form onSubmit={handleCreateAppointmentSubmit}>
                            <div className="form-group" style={{ marginBottom: "14px" }}>
                                <label className="form-label">Sélectionner le patient *</label>
                                <select
                                    className="form-control"
                                    value={newRdvForm.idPatient}
                                    onChange={(e) => setNewRdvForm({ ...newRdvForm, idPatient: e.target.value })}
                                    required
                                >
                                    <option value="">-- Choisir un patient --</option>
                                    {patientsList.map((p) => (
                                        <option key={p.idUtilisateur} value={p.idUtilisateur}>
                                            {p.nom} {p.prenom} ({p.email})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group" style={{ marginBottom: "14px" }}>
                                <label className="form-label">Sélectionner le médecin *</label>
                                <select
                                    className="form-control"
                                    value={newRdvForm.idDocteur}
                                    onChange={(e) => setNewRdvForm({ ...newRdvForm, idDocteur: e.target.value })}
                                    required
                                >
                                    <option value="">-- Choisir un praticien --</option>
                                    {doctorsList.map((d) => {
                                        const docId = d.idDocteur || d.idUtilisateur;
                                        return (
                                            <option key={docId} value={docId}>
                                                Dr. {d.prenom} {d.nom} ({d.specialite || "Généraliste"})
                                            </option>
                                        );
                                    })}
                                </select>
                            </div>

                            <div className="form-group" style={{ marginBottom: "14px" }}>
                                <label className="form-label">Date &amp; Heure du rendez-vous *</label>
                                <input
                                    type="datetime-local"
                                    className="form-control"
                                    value={newRdvForm.dateHeure}
                                    onChange={(e) => setNewRdvForm({ ...newRdvForm, dateHeure: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group" style={{ marginBottom: "20px" }}>
                                <label className="form-label">Motif de consultation</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Ex: Contrôle tension, renouvellement ordonnance..."
                                    value={newRdvForm.motif}
                                    onChange={(e) => setNewRdvForm({ ...newRdvForm, motif: e.target.value })}
                                />
                            </div>

                            <div style={{ display: "flex", gap: "10px" }}>
                                <button
                                    type="submit"
                                    className="btn-action-principal"
                                    style={{ flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
                                    disabled={isSubmittingRdv}
                                >
                                    <IconCheck size={16} /> {isSubmittingRdv ? "Enregistrement..." : "Enregistrer & Confirmer"}
                                </button>
                                <button
                                    type="button"
                                    className="med-btn med-btn-secondaire"
                                    onClick={() => setShowNewRdvModal(false)}
                                >
                                    Annuler
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── MODAL 2 : MODIFIER RENDEZ-VOUS ── */}
            {editingRdv && (
                <div className="modal-overlay" onClick={() => setEditingRdv(null)}>
                    <div className="modal-glass" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>
                                <IconEdit size={18} /> Régulation du Rendez-vous #{editingRdv.idRdv}
                            </h3>
                            <button type="button" className="btn-close-modal" onClick={() => setEditingRdv(null)}>
                                <IconClose size={14} />
                            </button>
                        </div>
                        <form onSubmit={handleSaveModifiedRdv}>
                            <div className="form-group" style={{ marginBottom: "14px" }}>
                                <label className="form-label">Patient</label>
                                <input className="form-control" type="text" readOnly value={`${editingRdv.patientPrenom} ${editingRdv.patientNom}`} />
                            </div>
                            <div className="form-group" style={{ marginBottom: "14px" }}>
                                <label className="form-label">Médecin</label>
                                <input className="form-control" type="text" readOnly value={`Dr. ${editingRdv.docteurPrenom} ${editingRdv.docteurNom}`} />
                            </div>
                            <div className="form-group" style={{ marginBottom: "14px" }}>
                                <label className="form-label">Date &amp; Heure</label>
                                <input className="form-control" type="text" readOnly value={editingRdv.dateHeure} />
                            </div>
                            <div className="form-group" style={{ marginBottom: "20px" }}>
                                <label className="form-label">Statut Administratif</label>
                                <select
                                    className="form-control"
                                    value={editingRdv.statut}
                                    onChange={(e) => setEditingRdv({ ...editingRdv, statut: e.target.value })}
                                >
                                    <option value="DEMANDE">EN ATTENTE (DEMANDE)</option>
                                    <option value="CONFIRME">CONFIRMÉ</option>
                                    <option value="ANNULE">ANNULÉ</option>
                                    <option value="TERMINE">TERMINÉ</option>
                                </select>
                            </div>
                            <div style={{ display: "flex", gap: "10px" }}>
                                <button type="submit" className="btn-action-principal" style={{ flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                                    <IconCheck size={16} /> Enregistrer la modification
                                </button>
                                <button type="button" className="med-btn med-btn-secondaire" onClick={() => setEditingRdv(null)}>
                                    Annuler
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── MODAL PATIENT : FICHE DÉTAILLÉE ── */}
            {selectedPatientModal && (
                <div className="modal-overlay" onClick={() => setSelectedPatientModal(null)}>
                    <div className="modal-glass" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Dossier Médical & Administratif : {selectedPatientModal.nom} {selectedPatientModal.prenom}</h3>
                            <button type="button" className="btn-close-modal" onClick={() => setSelectedPatientModal(null)}>
                                <IconClose size={16} />
                            </button>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "20px" }}>
                            <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", padding: "12px", borderRadius: "10px" }}>
                                <span style={{ color: "#64748b", fontSize: "0.75rem", textTransform: "uppercase", fontWeight: 600 }}>Email</span>
                                <div style={{ fontWeight: 600, color: "#0f172a" }}>{selectedPatientModal.email}</div>
                            </div>
                            <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", padding: "12px", borderRadius: "10px" }}>
                                <span style={{ color: "#64748b", fontSize: "0.75rem", textTransform: "uppercase", fontWeight: 600 }}>Date de naissance</span>
                                <div className="font-tabular" style={{ fontWeight: 600, color: "#0f172a" }}>{formatFrenchDate(selectedPatientModal.dateNaissance)}</div>
                            </div>
                            <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", padding: "12px", borderRadius: "10px" }}>
                                <span style={{ color: "#64748b", fontSize: "0.75rem", textTransform: "uppercase", fontWeight: 600 }}>Adresse</span>
                                <div style={{ fontWeight: 600, color: "#0f172a" }}>{selectedPatientModal.adresse || "Non renseignée"}</div>
                            </div>
                            <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", padding: "12px", borderRadius: "10px" }}>
                                <span style={{ color: "#64748b", fontSize: "0.75rem", textTransform: "uppercase", fontWeight: 600 }}>Activité</span>
                                <div className="font-tabular" style={{ fontWeight: 700, color: "#0f766e" }}>
                                    {selectedPatientModal.totalRdv || 0} Rendez-vous • {selectedPatientModal.totalConsultations || 0} Consultations
                                </div>
                            </div>
                        </div>

                        <div style={{ display: "flex", gap: "10px" }}>
                            <button
                                type="button"
                                className="btn-action-principal"
                                style={{ flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
                                onClick={() => {
                                    setSelectedPatientModal(null);
                                    navigate("/secretary/appointments");
                                }}
                            >
                                <IconAppointmentCalendar size={16} /> Voir les rendez-vous du patient
                            </button>
                            <button
                                type="button"
                                className="med-btn med-btn-secondaire"
                                onClick={() => setSelectedPatientModal(null)}
                            >
                                Fermer
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── MODAL PATIENT : NOUVEAU PATIENT ── */}
            {showNewPatientModal && (
                <div className="modal-overlay" onClick={() => setShowNewPatientModal(false)}>
                    <div className="modal-glass" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                                <IconPlus size={18} /> Enregistrer un nouveau patient
                            </h3>
                            <button type="button" className="btn-close-modal" onClick={() => setShowNewPatientModal(false)}>
                                <IconClose size={16} />
                            </button>
                        </div>

                        <form onSubmit={handleCreatePatientSubmit}>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "14px" }}>
                                <div className="form-group">
                                    <label className="form-label">Nom *</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Ex: Ben Ali"
                                        value={newPatientForm.nom}
                                        onChange={(e) => setNewPatientForm({ ...newPatientForm, nom: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Prénom *</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Ex: Mohamed"
                                        value={newPatientForm.prenom}
                                        onChange={(e) => setNewPatientForm({ ...newPatientForm, prenom: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group" style={{ marginBottom: "14px" }}>
                                <label className="form-label">Adresse Email *</label>
                                <input
                                    type="email"
                                    className="form-control"
                                    placeholder="Ex: patient@domaine.tn"
                                    value={newPatientForm.email}
                                    onChange={(e) => setNewPatientForm({ ...newPatientForm, email: e.target.value })}
                                    required
                                />
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "14px" }}>
                                <div className="form-group">
                                    <label className="form-label">Date de naissance</label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        value={newPatientForm.dateNaissance}
                                        onChange={(e) => setNewPatientForm({ ...newPatientForm, dateNaissance: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Adresse physique</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Ex: Tunis, Ariana..."
                                        value={newPatientForm.adresse}
                                        onChange={(e) => setNewPatientForm({ ...newPatientForm, adresse: e.target.value })}
                                    />
                                </div>
                            </div>

                            <p style={{ fontSize: "0.8rem", color: "rgba(255, 255, 255, 0.7)", margin: "0 0 18px", display: "flex", alignItems: "center", gap: "6px" }}>
                                <IconAlert size={14} /> Un compte d'accès patient sera généré automatiquement avec le mot de passe provisoire <code className="font-mono">Patient123!</code>.
                            </p>

                            <div style={{ display: "flex", gap: "10px" }}>
                                <button type="submit" className="btn-action-principal" style={{ flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                                    <IconCheck size={16} /> Créer le dossier patient
                                </button>
                                <button type="button" className="med-btn med-btn-secondaire" onClick={() => setShowNewPatientModal(false)}>
                                    Annuler
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── MODAL PATIENT : MODIFIER PATIENT ── */}
            {editingPatientModal && (
                <div className="modal-overlay" onClick={() => setEditingPatientModal(null)}>
                    <div className="modal-glass" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                                <IconEdit size={18} /> Modifier les coordonnées du patient
                            </h3>
                            <button type="button" className="btn-close-modal" onClick={() => setEditingPatientModal(null)}>
                                <IconClose size={16} />
                            </button>
                        </div>

                        <form onSubmit={handleUpdatePatientSubmit}>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "14px" }}>
                                <div className="form-group">
                                    <label className="form-label">Nom *</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={editingPatientModal.nom}
                                        onChange={(e) => setEditingPatientModal({ ...editingPatientModal, nom: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Prénom *</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={editingPatientModal.prenom}
                                        onChange={(e) => setEditingPatientModal({ ...editingPatientModal, prenom: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group" style={{ marginBottom: "14px" }}>
                                <label className="form-label">Email *</label>
                                <input
                                    type="email"
                                    className="form-control"
                                    value={editingPatientModal.email}
                                    onChange={(e) => setEditingPatientModal({ ...editingPatientModal, email: e.target.value })}
                                    required
                                />
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "20px" }}>
                                <div className="form-group">
                                    <label className="form-label">Date de naissance</label>
                                    <input
                                        type="date"
                                        className="form-control font-tabular"
                                        value={editingPatientModal.dateNaissance}
                                        onChange={(e) => setEditingPatientModal({ ...editingPatientModal, dateNaissance: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Adresse</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={editingPatientModal.adresse}
                                        onChange={(e) => setEditingPatientModal({ ...editingPatientModal, adresse: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div style={{ display: "flex", gap: "10px" }}>
                                <button type="submit" className="btn-action-principal" style={{ flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                                    <IconCheck size={16} /> Enregistrer les modifications
                                </button>
                                <button type="button" className="med-btn med-btn-secondaire" onClick={() => setEditingPatientModal(null)}>
                                    Annuler
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── MODAL PATIENT : CONFIRMATION DÉSACTIVATION / RÉACTIVATION ── */}
            <ConfirmModal
                isOpen={Boolean(confirmModalState)}
                title={confirmModalState?.title || "Confirmation"}
                message={confirmModalState?.message || ""}
                confirmText={confirmModalState?.confirmText || "Accepter"}
                cancelText={confirmModalState?.cancelText || "Annuler"}
                variant={confirmModalState?.variant || "primary"}
                onConfirm={confirmModalState?.onConfirm || (() => setConfirmModalState(null))}
                onCancel={() => setConfirmModalState(null)}
            />
        </DashboardLayout>
    );
}

export default SecretaryDashboard;
