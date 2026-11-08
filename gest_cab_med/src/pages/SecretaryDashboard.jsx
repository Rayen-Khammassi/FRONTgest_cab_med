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
    getPatients
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
    IconArrowLeft
} from "../components/MedicalIcons";

const cards = [
    { icon: IconAppointmentCalendar, title: "Gestion des rendez-vous", description: "Organiser, confirmer, modifier et créer les rendez-vous du cabinet.", path: "/secretary/appointments" },
    { icon: IconFirstAidBox, title: "Salle d'attente du jour", description: "Suivre en direct les arrivées et la file d'attente des patients aujourd'hui.", path: "/secretary/waiting-room" },
    { icon: IconConsultation, title: "Consultations administratives", description: "Gérer les informations administratives et le suivi des actes du cabinet.", path: "/secretary/consultations" },
    { icon: IconPills, title: "Médicaments", description: "Inventaire de la pharmacie, dosages et gestion des stocks.", path: "/secretary/medicaments" },
];

function SecretaryDashboard() {
    const navigate = useNavigate();
    const location = useLocation();
    const path = location.pathname;

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

    const loadPatientsAndDoctors = () => {
        getPatients().then((data) => setPatientsList(data || []));
        getDoctors().then((data) => setDoctorsList(data || []));
    };

    useEffect(() => {
        let isCancelled = false;
        if (path.includes("appointments") || path.includes("waiting-room")) {
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
            loadAppointments();
        } catch (err) {
            showToast(err.message || "Erreur lors de la création du rendez-vous.", "error");
        } finally {
            setIsSubmittingRdv(false);
        }
    };

    let title = "Tableau de bord secrétaire";
    let subtitle = "Gérez l'organisation administrative du cabinet médical.";

    if (path.includes("waiting-room")) {
        title = "Salle d'attente du jour";
        subtitle = "Suivi en direct des patients du jour et gestion de la file d'attente.";
    } else if (path.includes("appointments")) {
        title = "Régulation des Rendez-vous";
        subtitle = "Validez, confirmez, modifiez ou créez les rendez-vous du cabinet.";
    } else if (path.includes("consultations")) {
        title = "Suivi Administratif des Consultations";
        subtitle = "Gérez les dossiers administratifs et l'historique des actes.";
    }

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
                            <h3 style={{ margin: "0 0 4px 0", fontSize: "1.25rem", color: "#ffffff" }}>
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
                                    background: filterStatut === st ? "linear-gradient(110deg, #0879f9, #08c7b6)" : "rgba(255, 255, 255, 0.12)",
                                    border: "1px solid var(--med-bordure)",
                                    color: "#ffffff",
                                    padding: "6px 14px",
                                    borderRadius: "10px",
                                    fontSize: "0.78rem",
                                    fontWeight: filterStatut === st ? 700 : 500,
                                    cursor: "pointer",
                                    transition: "background 0.2s"
                                }}
                            >
                                {st === "TOUS" ? "Tous" : st === "DEMANDE" ? "En attente" : st === "CONFIRME" ? "Confirmés" : st === "ANNULE" ? "Annulés" : "Terminés"}
                            </button>
                        ))}
                    </div>

                    {actionMessage && (
                        <div style={{ padding: "10px 14px", borderRadius: "10px", background: "rgba(8, 199, 182, 0.22)", border: "1px solid #8affdf", color: "#8affdf", marginBottom: "14px", fontSize: "0.85rem" }}>
                            {actionMessage}
                        </div>
                    )}

                    {isLoadingAppointments ? (
                        <div style={{ padding: "40px", textAlign: "center", color: "#8affdf" }}>
                            Chargement des rendez-vous...
                        </div>
                    ) : filteredList.length === 0 ? (
                        <div style={{ padding: "50px 20px", textAlign: "center", background: "rgba(255, 255, 255, 0.08)", borderRadius: "16px", border: "1px dashed rgba(255, 255, 255, 0.25)" }}>
                            <div style={{ display: "flex", justifyContent: "center", marginBottom: "10px" }}>
                                <IconAppointmentCalendar size={44} />
                            </div>
                            <h4 style={{ margin: "0 0 6px 0", color: "#ffffff", fontSize: "1.1rem" }}>Aucun rendez-vous correspondant</h4>
                            <p style={{ margin: 0, opacity: 0.8, fontSize: "0.85rem" }}>
                                Aucun rendez-vous ne correspond au filtre sélectionné.
                            </p>
                        </div>
                    ) : (
                        <div style={{ width: "100%", overflowX: "auto" }}>
                            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.88rem" }}>
                                <thead>
                                    <tr style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.25)", color: "#8affdf", fontSize: "0.78rem", textTransform: "uppercase" }}>
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
                                            <td style={{ padding: "14px 10px", fontWeight: 700, color: "#ffffff" }}>
                                                <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                                                    <IconCalendar size={14} /> {rdv.dateHeure}
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
                                                                style={{ background: "rgba(8, 199, 182, 0.28)", border: "1px solid #8affdf", color: "#8affdf", padding: "5px 10px", borderRadius: "8px", fontSize: "0.78rem", fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "4px" }}
                                                            >
                                                                <IconCheck size={12} /> Confirmer
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleUpdateStatus(rdv.idRdv, "ANNULE")}
                                                                style={{ background: "rgba(255, 80, 110, 0.22)", border: "1px solid #ff809b", color: "#ff809b", padding: "5px 10px", borderRadius: "8px", fontSize: "0.78rem", fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "4px" }}
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
                                                                style={{ background: "rgba(255, 80, 110, 0.22)", border: "1px solid #ff809b", color: "#ff809b", padding: "5px 10px", borderRadius: "8px", fontSize: "0.78rem", fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "4px" }}
                                                            >
                                                                <IconClose size={12} /> Annuler
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => setEditingRdv(rdv)}
                                                                style={{ background: "rgba(255, 255, 255, 0.16)", border: "1px solid var(--med-bordure)", color: "#f6ffff", padding: "5px 10px", borderRadius: "8px", fontSize: "0.78rem", fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "4px" }}
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
                                                            style={{ background: "rgba(255, 193, 7, 0.2)", border: "1px solid #ffd54f", color: "#ffe082", padding: "5px 10px", borderRadius: "8px", fontSize: "0.78rem", fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "4px" }}
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
                        <div style={{ background: "rgba(255, 255, 255, 0.12)", padding: "16px", borderRadius: "14px", border: "1px solid var(--med-bordure)" }}>
                            <span style={{ fontSize: "0.75rem", textTransform: "uppercase", opacity: 0.8 }}>Total Prévus</span>
                            <h3 style={{ margin: "4px 0 0", fontSize: "1.8rem", color: "#ffffff" }}>{todayAppointments.length}</h3>
                        </div>
                        <div style={{ background: "rgba(8, 199, 182, 0.15)", padding: "16px", borderRadius: "14px", border: "1px solid #8affdf" }}>
                            <span style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "#8affdf" }}>Confirmés / Arrivés</span>
                            <h3 style={{ margin: "4px 0 0", fontSize: "1.8rem", color: "#8affdf" }}>
                                {todayAppointments.filter((r) => r.statut === "CONFIRME").length}
                            </h3>
                        </div>
                        <div style={{ background: "rgba(255, 193, 7, 0.15)", padding: "16px", borderRadius: "14px", border: "1px solid #ffd54f" }}>
                            <span style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "#ffe082" }}>En attente</span>
                            <h3 style={{ margin: "4px 0 0", fontSize: "1.8rem", color: "#ffe082" }}>
                                {todayAppointments.filter((r) => r.statut === "DEMANDE").length}
                            </h3>
                        </div>
                        <div style={{ background: "rgba(8, 121, 249, 0.15)", padding: "16px", borderRadius: "14px", border: "1px solid #80c4ff" }}>
                            <span style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "#80c4ff" }}>Consultés / Terminés</span>
                            <h3 style={{ margin: "4px 0 0", fontSize: "1.8rem", color: "#80c4ff" }}>
                                {todayAppointments.filter((r) => r.statut === "TERMINE").length}
                            </h3>
                        </div>
                    </div>

                    {isLoadingAppointments ? (
                        <div style={{ padding: "40px", textAlign: "center", color: "#8affdf" }}>
                            Chargement du planning du jour...
                        </div>
                    ) : todayAppointments.length === 0 ? (
                        <div style={{ padding: "50px 20px", textAlign: "center", background: "rgba(255, 255, 255, 0.08)", borderRadius: "16px", border: "1px dashed rgba(255, 255, 255, 0.25)" }}>
                            <div style={{ display: "flex", justifyContent: "center", marginBottom: "10px" }}>
                                <IconFirstAidBox size={44} />
                            </div>
                            <h4 style={{ margin: "0 0 6px 0", color: "#ffffff", fontSize: "1.1rem" }}>Aucun rendez-vous prévu pour aujourd'hui</h4>
                            <p style={{ margin: 0, opacity: 0.8, fontSize: "0.85rem" }}>
                                La salle d'attente est actuellement libre. Vous pouvez planifier des rendez-vous depuis l'onglet Gestion des rendez-vous.
                            </p>
                        </div>
                    ) : (
                        <div style={{ width: "100%", overflowX: "auto" }}>
                            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.88rem" }}>
                                <thead>
                                    <tr style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.25)", color: "#8affdf", fontSize: "0.78rem", textTransform: "uppercase" }}>
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
                                            <td style={{ padding: "14px 10px", fontWeight: 700, color: "#ffffff" }}>
                                                <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                                                    <IconClock size={14} /> {rdv.dateHeure.split(" ")[1] || rdv.dateHeure}
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
                                                            style={{ background: "rgba(8, 199, 182, 0.28)", border: "1px solid #8affdf", color: "#8affdf", padding: "5px 10px", borderRadius: "8px", fontSize: "0.78rem", fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "4px" }}
                                                        >
                                                            <IconCheck size={12} /> Arrivé
                                                        </button>
                                                    )}
                                                    {rdv.statut === "CONFIRME" && (
                                                        <span style={{ fontSize: "0.8rem", color: "#8affdf", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "4px" }}>
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
                            <h3 style={{ margin: "0 0 4px 0", fontSize: "1.25rem", color: "#ffffff" }}>
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
                        <div style={{ padding: "40px", textAlign: "center", color: "#8affdf" }}>
                            Chargement des dossiers de consultations...
                        </div>
                    ) : consultations.length === 0 ? (
                        <div style={{ padding: "50px 20px", textAlign: "center", background: "rgba(255, 255, 255, 0.08)", borderRadius: "16px", border: "1px dashed rgba(255, 255, 255, 0.25)" }}>
                            <div style={{ display: "flex", justifyContent: "center", marginBottom: "10px" }}>
                                <IconConsultation size={44} />
                            </div>
                            <h4 style={{ margin: "0 0 6px 0", color: "#ffffff", fontSize: "1.1rem" }}>Aucune consultation enregistrée</h4>
                            <p style={{ margin: 0, opacity: 0.8, fontSize: "0.85rem" }}>
                                Les consultations réalisées par les praticiens s'afficheront ici pour le suivi administratif.
                            </p>
                        </div>
                    ) : (
                        <div style={{ width: "100%", overflowX: "auto" }}>
                            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.88rem" }}>
                                <thead>
                                    <tr style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.25)", color: "#8affdf", fontSize: "0.78rem", textTransform: "uppercase" }}>
                                        <th style={{ padding: "12px 10px" }}>N° & Date</th>
                                        <th style={{ padding: "12px 10px" }}>Patient</th>
                                        <th style={{ padding: "12px 10px" }}>Praticien</th>
                                        <th style={{ padding: "12px 10px" }}>Statut Administratif</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {consultations.map((c) => (
                                        <tr key={c.idConsultation} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.12)" }}>
                                            <td style={{ padding: "14px 10px", fontWeight: 700, color: "#ffffff" }}>
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
                                    {doctorsList.map((d) => (
                                        <option key={d.idUtilisateur} value={d.idUtilisateur}>
                                            Dr. {d.prenom} {d.nom} ({d.specialite})
                                        </option>
                                    ))}
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
        </DashboardLayout>
    );
}

export default SecretaryDashboard;
