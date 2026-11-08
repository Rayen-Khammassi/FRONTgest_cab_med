import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import { getUser } from "../services/authService";
import {
    getAppointmentsByDoctor,
    updateAppointmentStatus
} from "../services/appointmentService";
import {
    getPatients,
    createPatient,
    updatePatient,
    togglePatientStatus,
    getConsultationsByDoctor,
    createConsultation,
    updateConsultation,
    getPrescriptionsByDoctor,
    createPrescription
} from "../services/medicalService";
import { medicamentApi } from "../services/medicamentApi";
import {
    IconPatientDossier,
    IconAppointmentCalendar,
    IconConsultation,
    IconPrescription,
    IconPills,
    IconStethoscope,
    IconPlus,
    IconEdit,
    IconTrash,
    IconCheck,
    IconClose,
    IconEye,
    IconRefresh,
    IconSearch,
    IconClock,
    IconUser,
    IconPrint,
    IconAlert,
    IconArrowLeft,
    LogoAlZahraoui
} from "../components/MedicalIcons";
import NotificationToast from "../components/NotificationToast";

const cards = [
    { icon: IconPatientDossier, title: "Gestion des patients", description: "Consulter et gérer les dossiers des patients.", path: "/doctor/patients" },
    { icon: IconAppointmentCalendar, title: "Rendez-vous", description: "Consulter le planning des rendez-vous et valider les créneaux.", path: "/doctor/appointments" },
    { icon: IconConsultation, title: "Consultations", description: "Créer et gérer les consultations médicales.", path: "/doctor/consultations" },
    { icon: IconPrescription, title: "Ordonnances", description: "Créer et gérer les prescriptions médicales.", path: "/doctor/prescriptions" },
    { icon: IconPills, title: "Médicaments", description: "Inventaire de la pharmacie, dosages et gestion des stocks.", path: "/doctor/medicaments" },
];

function DoctorDashboard() {
    const navigate = useNavigate();
    const location = useLocation();
    const path = location.pathname;
    const user = getUser();

    // ── RDV STATE ────────────────────────────────────────────────────────────
    const [appointments, setAppointments] = useState([]);
    const [isLoadingAppointments, setIsLoadingAppointments] = useState(false);
    const [actionMessage, setActionMessage] = useState("");
    const [editingRdv, setEditingRdv] = useState(null); // { idRdv, statut, dateHeure, motif }
    const [toast, setToast] = useState(null); // { message, type }

    const showToast = (message, type = "success") => {
        setToast({ message, type });
        if (type === "success") {
            setActionMessage(message);
            setTimeout(() => setActionMessage(""), 4000);
        }
    };

    // ── PATIENTS STATE ───────────────────────────────────────────────────────
    const [patients, setPatients] = useState([]);
    const [isLoadingPatients, setIsLoadingPatients] = useState(false);
    const [patientSearch, setPatientSearch] = useState("");
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

    // ── CONSULTATIONS STATE ──────────────────────────────────────────────────
    const [consultations, setConsultations] = useState([]);
    const [isLoadingConsultations, setIsLoadingConsultations] = useState(false);
    const [showNewConsultationModal, setShowNewConsultationModal] = useState(false);
    const [editingConsultationModal, setEditingConsultationModal] = useState(null);
    const [consultationForm, setConsultationForm] = useState({
        idRdv: "",
        diagnostic: "",
        observations: "",
    });

    // ── ORDONNANCES STATE ────────────────────────────────────────────────────
    const [prescriptions, setPrescriptions] = useState([]);
    const [isLoadingPrescriptions, setIsLoadingPrescriptions] = useState(false);
    const [availableMeds, setAvailableMeds] = useState([]);
    const [showNewPrescriptionModal, setShowNewPrescriptionModal] = useState(false);
    const [printPrescription, setPrintPrescription] = useState(null);
    const [prescriptionForm, setPrescriptionForm] = useState({
        idConsultation: "",
        items: [{ idMedicament: "", posologie: "1 comprimé 3x/jour", frequence: "Pendant les repas", duree: "7 jours", quantite: 1 }]
    });

    // ── DATA FETCHERS ────────────────────────────────────────────────────────
    const loadAppointments = () => {
        if (user?.idUtilisateur) {
            setIsLoadingAppointments(true);
            getAppointmentsByDoctor(user.idUtilisateur)
                .then((data) => setAppointments(data || []))
                .finally(() => setIsLoadingAppointments(false));
        }
    };

    const loadConsultations = () => {
        if (user?.idUtilisateur) {
            setIsLoadingConsultations(true);
            getConsultationsByDoctor(user.idUtilisateur)
                .then((data) => setConsultations(data || []))
                .finally(() => setIsLoadingConsultations(false));
        }
    };

    const loadPrescriptions = () => {
        if (user?.idUtilisateur) {
            setIsLoadingPrescriptions(true);
            getPrescriptionsByDoctor(user.idUtilisateur)
                .then((data) => setPrescriptions(data || []))
                .finally(() => setIsLoadingPrescriptions(false));
        }
    };

    const loadPatients = () => {
        setIsLoadingPatients(true);
        getPatients()
            .then((data) => setPatients(data || []))
            .finally(() => setIsLoadingPatients(false));
    };

    // ── PATIENT ACTIONS ──────────────────────────────────────────────────────
    const handleCreatePatientSubmit = async (e) => {
        e.preventDefault();
        if (!newPatientForm.nom || !newPatientForm.prenom || !newPatientForm.email) {
            showToast("Nom, prénom et email sont obligatoires pour créer un patient.", "error");
            return;
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
        try {
            await updatePatient(editingPatientModal.idUtilisateur, editingPatientModal);
            showToast("Dossier patient mis à jour avec succès !", "success");
            setEditingPatientModal(null);
            loadPatients();
        } catch (error) {
            showToast(error.message || "Erreur lors de la mise à jour.", "error");
        }
    };

    const handleTogglePatientStatus = async (patient) => {
        const newActif = !patient.actif;
        const confirmMsg = newActif
            ? `Réactiver le dossier de ${patient.prenom} ${patient.nom} ?`
            : `Désactiver le dossier de ${patient.prenom} ${patient.nom} ? (L'historique des RDVs et consultations sera préservé)`;
        if (!window.confirm(confirmMsg)) return;

        try {
            await togglePatientStatus(patient.idUtilisateur, newActif);
            showToast(`Patient ${patient.prenom} ${patient.nom} ${newActif ? "réactivé" : "désactivé"} avec succès.`, "success");
            loadPatients();
        } catch (error) {
            showToast(error.message || "Erreur lors du changement de statut.", "error");
        }
    };

    const handleUpdateConsultationSubmit = async (e) => {
        e.preventDefault();
        if (!editingConsultationModal) return;
        try {
            await updateConsultation({
                idConsultation: editingConsultationModal.idConsultation,
                diagnostic: editingConsultationModal.diagnostic.trim(),
                observations: editingConsultationModal.observations.trim()
            });
            showToast("Consultation médicale mise à jour avec succès !", "success");
            setEditingConsultationModal(null);
            loadConsultations();
        } catch (error) {
            showToast(error.message || "Erreur lors de la modification de la consultation.", "error");
        }
    };

    // ── ROUTE TRIGGERED EFFECTS ──────────────────────────────────────────────
    useEffect(() => {
        let isCancelled = false;
        if (path === "/doctor/appointments" && user?.idUtilisateur) {
            getAppointmentsByDoctor(user.idUtilisateur)
                .then((data) => { if (!isCancelled) { setAppointments(data || []); setIsLoadingAppointments(false); } })
                .catch(() => { if (!isCancelled) setIsLoadingAppointments(false); });
        } else if (path === "/doctor/patients") {
            getPatients()
                .then((data) => { if (!isCancelled) { setPatients(data || []); setIsLoadingPatients(false); } })
                .catch(() => { if (!isCancelled) setIsLoadingPatients(false); });
        } else if (path === "/doctor/consultations" && user?.idUtilisateur) {
            getConsultationsByDoctor(user.idUtilisateur)
                .then((data) => { if (!isCancelled) { setConsultations(data || []); setIsLoadingConsultations(false); } })
                .catch(() => { if (!isCancelled) setIsLoadingConsultations(false); });
            // also load appointments for dropdown
            getAppointmentsByDoctor(user.idUtilisateur).then((data) => {
                if (!isCancelled) setAppointments(data || []);
            });
        } else if (path === "/doctor/prescriptions" && user?.idUtilisateur) {
            getPrescriptionsByDoctor(user.idUtilisateur)
                .then((data) => { if (!isCancelled) { setPrescriptions(data || []); setIsLoadingPrescriptions(false); } })
                .catch(() => { if (!isCancelled) setIsLoadingPrescriptions(false); });
            getConsultationsByDoctor(user.idUtilisateur).then((data) => {
                if (!isCancelled) setConsultations(data || []);
            });
            medicamentApi.list().then((meds) => {
                if (!isCancelled) setAvailableMeds(meds || []);
            });
        }
        return () => { isCancelled = true; };
    }, [path, user?.idUtilisateur]);

    // ── APPOINTMENT ACTIONS ──────────────────────────────────────────────────
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
            showToast(`Rendez-vous #${editingRdv.idRdv} modifié avec succès !`, "success");
            setEditingRdv(null);
            loadAppointments();
        } catch (error) {
            showToast(error.message || "Erreur lors de la modification", "error");
        }
    };

    // ── CONSULTATION ACTIONS ─────────────────────────────────────────────────
    const handleOpenConsultationForRdv = (rdv) => {
        setConsultationForm({
            idRdv: rdv.idRdv,
            diagnostic: "",
            observations: `Patient : ${rdv.patientPrenom} ${rdv.patientNom}\nMotif initial : ${rdv.motif || "Consultation générale"}`
        });
        setShowNewConsultationModal(true);
    };

    const handleCreateConsultationSubmit = async (e) => {
        e.preventDefault();
        if (!consultationForm.idRdv || !consultationForm.diagnostic.trim()) {
            showToast("Veuillez sélectionner un rendez-vous et saisir un diagnostic.", "error");
            return;
        }

        try {
            const res = await createConsultation({
                idRdv: parseInt(consultationForm.idRdv),
                diagnostic: consultationForm.diagnostic.trim(),
                observations: consultationForm.observations.trim(),
            });

            showToast("Consultation enregistrée avec succès !", "success");
            setShowNewConsultationModal(false);
            loadConsultations();
            loadAppointments();

            // Propose prescription
            const createOrd = window.confirm("Consultation enregistrée. Souhaitez-vous générer immédiatement une ordonnance pour ce patient ?");
            if (createOrd && res?.idConsultation) {
                setPrescriptionForm({
                    idConsultation: res.idConsultation,
                    items: [{ idMedicament: availableMeds[0]?.idMedicament || "", posologie: "1 cp matin et soir", frequence: "Pendant les repas", duree: "7 jours", quantite: 1 }]
                });
                setShowNewPrescriptionModal(true);
            }
        } catch (error) {
            showToast(error.message || "Erreur lors de l'enregistrement de la consultation.", "error");
        }
    };

    // ── PRESCRIPTION ACTIONS ─────────────────────────────────────────────────
    const handleAddPrescriptionItem = () => {
        setPrescriptionForm((prev) => ({
            ...prev,
            items: [
                ...prev.items,
                { isNew: false, idMedicament: availableMeds[0]?.idMedicament || "", newNom: "", newDosage: "", posologie: "1 cp par jour", frequence: "Le matin", duree: "5 jours", quantite: 1 }
            ]
        }));
    };

    const handleRemovePrescriptionItem = (index) => {
        setPrescriptionForm((prev) => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index)
        }));
    };

    const handlePrescriptionItemChange = (index, field, value) => {
        setPrescriptionForm((prev) => {
            const newItems = [...prev.items];
            newItems[index] = { ...newItems[index], [field]: value };
            return { ...prev, items: newItems };
        });
    };

    const handleCreatePrescriptionSubmit = async (e) => {
        e.preventDefault();
        if (!prescriptionForm.idConsultation) {
            showToast("Veuillez associer la prescription à une consultation.", "error");
            return;
        }

        try {
            // If any item is marked as isNew, create it via medicamentApi (port 8082) first!
            const processedItems = [];
            const updatedMeds = [...availableMeds];

            for (const it of prescriptionForm.items) {
                let medId = it.idMedicament;
                if (it.isNew) {
                    if (!it.newNom?.trim() || !it.newDosage?.trim()) {
                        showToast("Veuillez saisir le nom et le dosage du nouveau médicament à enregistrer.", "error");
                        return;
                    }
                    const createdMed = await medicamentApi.create({
                        nom: it.newNom.trim(),
                        dosage: it.newDosage.trim()
                    });
                    if (createdMed?.idMedicament) {
                        medId = createdMed.idMedicament;
                        updatedMeds.push(createdMed);
                    }
                }

                if (medId) {
                    processedItems.push({
                        idMedicament: parseInt(medId),
                        posologie: it.posologie || "1 cp",
                        frequence: it.frequence || "Par jour",
                        duree: it.duree || "7 jours",
                        quantite: parseInt(it.quantite) || 1
                    });
                }
            }

            if (processedItems.length === 0) {
                showToast("Veuillez ajouter au moins un médicament valide.", "error");
                return;
            }

            setAvailableMeds(updatedMeds);

            await createPrescription({
                idConsultation: parseInt(prescriptionForm.idConsultation),
                items: processedItems
            });

            showToast("Ordonnance générée avec succès (médicaments enregistrés au catalogue) !", "success");
            setShowNewPrescriptionModal(false);
            loadPrescriptions();
        } catch (error) {
            showToast(error.message || "Erreur lors de la création de l'ordonnance.", "error");
        }
    };

    // Filter patients by search
    const filteredPatients = patients.filter((p) => {
        const q = patientSearch.toLowerCase();
        return (
            (p.nom && p.nom.toLowerCase().includes(q)) ||
            (p.prenom && p.prenom.toLowerCase().includes(q)) ||
            (p.email && p.email.toLowerCase().includes(q)) ||
            (p.adresse && p.adresse.toLowerCase().includes(q))
        );
    });

    // Titles
    let title = "Tableau de bord médecin";
    let subtitle = "Gérez votre activité médicale et suivez vos patients.";
    if (path.includes("patients")) {
        title = "Gestion des Patients";
        subtitle = "Consultez les fiches, antécédents et coordonnées des patients.";
    } else if (path.includes("appointments")) {
        title = "Planning des Rendez-vous";
        subtitle = "Consultez votre calendrier de consultations et validez les créneaux.";
    } else if (path.includes("consultations")) {
        title = "Consultations Médicales";
        subtitle = "Rédigez les diagnostics, examens et observations cliniques.";
    } else if (path.includes("prescriptions")) {
        title = "Gestion des Ordonnances";
        subtitle = "Éditez et imprimez les prescriptions médicamenteuses.";
    }

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
        <DashboardLayout role="DOCTEUR" title={title} subtitle={subtitle}>
            <NotificationToast
                message={toast?.message}
                type={toast?.type}
                onClose={() => setToast(null)}
            />
            {/* ── 1. ACCUEIL ── */}
            {path === "/doctor" && (
                <>
                    <div className="welcome-banner doctor-banner">
                        <div>
                            <span className="banner-label">ESPACE MÉDECIN</span>
                            <h2>Votre activité médicale.</h2>
                            <p>Accédez à vos patients, consultations et rendez-vous.</p>
                        </div>
                        <div className="banner-decoration">
                            <IconStethoscope size={32} />
                        </div>
                    </div>

                    <h2 className="section-title">Gestion médicale</h2>
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

            {/* ── 2. GESTION DES PATIENTS ── */}
            {path === "/doctor/patients" && (
                <div className="medicaments-panneau">
                    <button onClick={() => navigate("/doctor")} className="btn-retour" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                        <IconArrowLeft size={16} /> Retour à l'accueil
                    </button>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", marginBottom: "20px" }}>
                        <div>
                            <h3 style={{ margin: "0 0 4px 0", fontSize: "1.25rem", color: "#ffffff" }}>
                                Registre des Patients ({patients.length})
                            </h3>
                            <p style={{ margin: 0, opacity: 0.8, fontSize: "0.85rem" }}>
                                Consultez les dossiers médicaux, coordonnées et antécédents de vos patients.
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
                            <div className="medicaments-recherche-wrapper">
                                <span style={{ display: "grid", placeItems: "center" }}><IconSearch size={15} /></span>
                                <input
                                    type="search"
                                    className="medicaments-recherche"
                                    placeholder="Rechercher un patient…"
                                    value={patientSearch}
                                    onChange={(e) => setPatientSearch(e.target.value)}
                                    style={{ width: "240px" }}
                                />
                            </div>
                        </div>
                    </div>

                    {isLoadingPatients ? (
                        <div style={{ padding: "40px", textAlign: "center", color: "#8affdf" }}>
                            Chargement des dossiers patients...
                        </div>
                    ) : filteredPatients.length === 0 ? (
                        <div style={{ padding: "50px 20px", textAlign: "center", background: "rgba(255, 255, 255, 0.08)", borderRadius: "16px", border: "1px dashed rgba(255, 255, 255, 0.25)" }}>
                            <div style={{ display: "flex", justifyContent: "center", marginBottom: "10px" }}>
                                <IconPatientDossier size={44} />
                            </div>
                            <h4 style={{ margin: "0 0 6px 0", color: "#ffffff", fontSize: "1.1rem" }}>Aucun patient trouvé</h4>
                            <p style={{ margin: 0, opacity: 0.8, fontSize: "0.85rem" }}>
                                {patientSearch ? "Aucun patient ne correspond à votre recherche." : "Aucun patient n'est encore enregistré dans la base."}
                            </p>
                        </div>
                    ) : (
                        <div style={{ width: "100%", overflowX: "auto" }}>
                            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.88rem" }}>
                                <thead>
                                    <tr style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.25)", color: "#8affdf", fontSize: "0.78rem", textTransform: "uppercase" }}>
                                        <th style={{ padding: "12px 10px" }}>Patient</th>
                                        <th style={{ padding: "12px 10px" }}>Statut</th>
                                        <th style={{ padding: "12px 10px" }}>Date de naissance</th>
                                        <th style={{ padding: "12px 10px" }}>Email</th>
                                        <th style={{ padding: "12px 10px" }}>Adresse</th>
                                        <th style={{ padding: "12px 10px", textAlign: "center" }}>RDV</th>
                                        <th style={{ padding: "12px 10px", textAlign: "center" }}>Consultations</th>
                                        <th style={{ padding: "12px 10px", textAlign: "center" }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredPatients.map((p) => (
                                        <tr key={p.idUtilisateur} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.12)", opacity: p.actif === false ? 0.65 : 1 }}>
                                            <td style={{ padding: "14px 10px", fontWeight: 700, color: "#ffffff" }}>
                                                <span style={{ display: "inline-flex", alignItems: "center", gap: "7px" }}>
                                                    <IconUser size={15} /> {p.nom} {p.prenom}
                                                </span>
                                            </td>
                                            <td style={{ padding: "14px 10px" }}>
                                                {p.actif !== false ? (
                                                    <span className="app-badge badge-success" style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
                                                        <IconCheck size={11} /> Actif
                                                    </span>
                                                ) : (
                                                    <span className="app-badge badge-cancelled" style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
                                                        <IconClose size={11} /> Inactif
                                                    </span>
                                                )}
                                            </td>
                                            <td style={{ padding: "14px 10px", opacity: 0.9 }}>
                                                {p.dateNaissance || "Non renseignée"}
                                            </td>
                                            <td style={{ padding: "14px 10px", opacity: 0.85 }}>
                                                {p.email}
                                            </td>
                                            <td style={{ padding: "14px 10px", opacity: 0.85 }}>
                                                {p.adresse || "Non renseignée"}
                                            </td>
                                            <td style={{ padding: "14px 10px", textAlign: "center", fontWeight: 700, color: "#8affdf" }}>
                                                {p.totalRdv}
                                            </td>
                                            <td style={{ padding: "14px 10px", textAlign: "center", fontWeight: 700, color: "#80c4ff" }}>
                                                {p.totalConsultations}
                                            </td>
                                            <td style={{ padding: "14px 10px", textAlign: "center" }}>
                                                <div style={{ display: "inline-flex", gap: "6px" }}>
                                                    <button
                                                        type="button"
                                                        onClick={() => setSelectedPatientModal(p)}
                                                        className="btn btn-secondary"
                                                        style={{ padding: "5px 10px", fontSize: "0.78rem", display: "inline-flex", alignItems: "center", gap: "5px" }}
                                                    >
                                                        <IconEye size={13} /> Fiche
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
                                                        className="btn btn-secondary"
                                                        style={{ padding: "5px 10px", fontSize: "0.78rem", display: "inline-flex", alignItems: "center", gap: "5px" }}
                                                    >
                                                        <IconEdit size={13} /> Modifier
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleTogglePatientStatus(p)}
                                                        className={p.actif !== false ? "btn btn-danger" : "btn btn-primary"}
                                                        style={{ padding: "5px 10px", fontSize: "0.78rem" }}
                                                    >
                                                        {p.actif !== false ? "Désactiver" : "Réactiver"}
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

            {/* ── 3. PLANNING DES RENDEZ-VOUS ── */}
            {path === "/doctor/appointments" && (
                <div className="medicaments-panneau">
                    <button onClick={() => navigate("/doctor")} className="btn-retour" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                        <IconArrowLeft size={16} /> Retour à l'accueil
                    </button>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                        <h3 style={{ margin: 0, fontSize: "1.25rem", color: "#ffffff" }}>Planning des consultations</h3>
                        <button
                            type="button"
                            className="btn-action-principal"
                            style={{ minHeight: "36px", padding: "6px 14px", fontSize: "0.82rem", display: "inline-flex", alignItems: "center", gap: "6px" }}
                            onClick={loadAppointments}
                        >
                            <IconRefresh size={14} /> Actualiser
                        </button>
                    </div>

                    {actionMessage && (
                        <div style={{ padding: "10px 14px", borderRadius: "10px", background: "rgba(8, 199, 182, 0.22)", border: "1px solid #8affdf", color: "#8affdf", marginBottom: "14px", fontSize: "0.85rem" }}>
                            {actionMessage}
                        </div>
                    )}

                    {isLoadingAppointments ? (
                        <div style={{ padding: "40px", textAlign: "center", color: "#8affdf" }}>
                            Chargement du planning...
                        </div>
                    ) : appointments.length === 0 ? (
                        <div style={{ padding: "50px 20px", textAlign: "center", background: "rgba(255, 255, 255, 0.08)", borderRadius: "16px", border: "1px dashed rgba(255, 255, 255, 0.25)" }}>
                            <div style={{ display: "flex", justifyContent: "center", marginBottom: "10px" }}>
                                <IconAppointmentCalendar size={44} />
                            </div>
                            <h4 style={{ margin: "0 0 6px 0", color: "#ffffff", fontSize: "1.1rem" }}>Aucun rendez-vous dans votre agenda</h4>
                            <p style={{ margin: 0, opacity: 0.8, fontSize: "0.85rem" }}>
                                Les demandes des patients adressées à votre cabinet s'afficheront ici.
                            </p>
                        </div>
                    ) : (
                        <div style={{ width: "100%", overflowX: "auto" }}>
                            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.88rem" }}>
                                <thead>
                                    <tr style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.25)", color: "#8affdf", fontSize: "0.78rem", textTransform: "uppercase" }}>
                                        <th style={{ padding: "12px 10px" }}>Date & Heure</th>
                                        <th style={{ padding: "12px 10px" }}>Patient</th>
                                        <th style={{ padding: "12px 10px" }}>Motif</th>
                                        <th style={{ padding: "12px 10px" }}>Statut</th>
                                        <th style={{ padding: "12px 10px", textAlign: "center" }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {appointments.map((rdv) => (
                                        <tr key={rdv.idRdv} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.12)" }}>
                                            <td className="font-tabular" style={{ padding: "14px 10px", fontWeight: 700, color: "#ffffff" }}>
                                                {rdv.dateHeure}
                                            </td>
                                            <td style={{ padding: "14px 10px" }}>
                                                <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                                                    <IconUser size={14} /> {rdv.patientPrenom} {rdv.patientNom}
                                                </span>
                                                <div style={{ fontSize: "0.76rem", opacity: 0.7, marginLeft: "20px" }}>{rdv.patientEmail}</div>
                                            </td>
                                            <td style={{ padding: "14px 10px", opacity: 0.85 }}>
                                                {rdv.motif || "Non spécifié"}
                                            </td>
                                            <td style={{ padding: "14px 10px" }}>
                                                {getStatusBadge(rdv.statut)}
                                            </td>
                                            <td style={{ padding: "14px 10px", textAlign: "center" }}>
                                                <div style={{ display: "inline-flex", gap: "6px", flexWrap: "wrap", justifyContent: "center" }}>
                                                    {/* If DEMANDE: show Confirmer and Annuler */}
                                                    {rdv.statut === "DEMANDE" && (
                                                        <>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleUpdateStatus(rdv.idRdv, "CONFIRME")}
                                                                style={{ background: "rgba(0, 150, 120, 0.35)", border: "1px solid #8affdf", color: "#8affdf", padding: "5px 10px", borderRadius: "8px", fontSize: "0.78rem", fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "4px" }}
                                                            >
                                                                <IconCheck size={12} /> Confirmer
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleUpdateStatus(rdv.idRdv, "ANNULE")}
                                                                style={{ background: "rgba(140, 20, 50, 0.35)", border: "1px solid #ff809b", color: "#ffb3c1", padding: "5px 10px", borderRadius: "8px", fontSize: "0.78rem", fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "4px" }}
                                                            >
                                                                <IconClose size={12} /> Annuler
                                                            </button>
                                                        </>
                                                    )}

                                                    {/* When CONFIRME: it is confirmed, and doctor can click 'Modifier' or 'Consulter' */}
                                                    {rdv.statut === "CONFIRME" && (
                                                        <>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleOpenConsultationForRdv(rdv)}
                                                                style={{ background: "rgba(8, 121, 249, 0.35)", border: "1px solid #80c4ff", color: "#ffffff", padding: "5px 10px", borderRadius: "8px", fontSize: "0.78rem", fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "4px" }}
                                                            >
                                                                <IconStethoscope size={13} /> Consulter
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

                                                    {/* When ANNULE: allow reactivating */}
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
                                                        <span style={{ fontSize: "0.78rem", opacity: 0.7 }}>Consulté</span>
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

            {/* ── 4. CONSULTATIONS MÉDICALES ── */}
            {path === "/doctor/consultations" && (
                <div className="medicaments-panneau">
                    <button onClick={() => navigate("/doctor")} className="btn-retour" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                        <IconArrowLeft size={16} /> Retour à l'accueil
                    </button>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", marginBottom: "20px" }}>
                        <div>
                            <h3 style={{ margin: "0 0 4px 0", fontSize: "1.25rem", color: "#ffffff" }}>
                                Consultations Médicales ({consultations.length})
                            </h3>
                            <p style={{ margin: 0, opacity: 0.8, fontSize: "0.85rem" }}>
                                Historique des examens cliniques, diagnostics et observations.
                            </p>
                        </div>
                        <button
                            type="button"
                            className="btn-action-principal"
                            style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
                            onClick={() => {
                                setConsultationForm({ idRdv: "", diagnostic: "", observations: "" });
                                setShowNewConsultationModal(true);
                            }}
                        >
                            <IconPlus size={15} /> Nouvelle consultation
                        </button>
                    </div>

                    {isLoadingConsultations ? (
                        <div style={{ padding: "40px", textAlign: "center", color: "#8affdf" }}>
                            Chargement des consultations...
                        </div>
                    ) : consultations.length === 0 ? (
                        <div style={{ padding: "50px 20px", textAlign: "center", background: "rgba(255, 255, 255, 0.08)", borderRadius: "16px", border: "1px dashed rgba(255, 255, 255, 0.25)" }}>
                            <div style={{ display: "flex", justifyContent: "center", marginBottom: "10px" }}>
                                <IconConsultation size={44} />
                            </div>
                            <h4 style={{ margin: "0 0 6px 0", color: "#ffffff", fontSize: "1.1rem" }}>Aucune consultation enregistrée</h4>
                            <p style={{ margin: 0, opacity: 0.8, fontSize: "0.85rem" }}>
                                Démarrez une consultation à partir d'un rendez-vous confirmé ou via le bouton ci-dessus.
                            </p>
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                            {consultations.map((c) => (
                                <div key={c.idConsultation} className="ordonnance-card">
                                    <div className="ordonnance-meta">
                                        <div>
                                            <span className="font-mono font-tabular" style={{ fontSize: "0.78rem", color: "#8affdf", fontWeight: 700 }}>
                                                CONSULTATION #{c.idConsultation} • {c.dateConsultation}
                                            </span>
                                            <h4 style={{ margin: "4px 0", color: "#ffffff", fontSize: "1.15rem" }}>
                                                Patient : {c.patientNom} {c.patientPrenom}
                                            </h4>
                                            <div style={{ fontSize: "0.82rem", opacity: 0.8 }}>
                                                Né(e) le : {c.patientDateNaissance || "Non renseigné"} • {c.patientEmail}
                                            </div>
                                        </div>
                                        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                                            <button
                                                type="button"
                                                className="btn-action-principal"
                                                style={{ minHeight: "36px", padding: "6px 12px", fontSize: "0.82rem", background: "rgba(255, 255, 255, 0.16)", border: "1px solid var(--med-bordure)", display: "inline-flex", alignItems: "center", gap: "5px" }}
                                                onClick={() => setEditingConsultationModal({
                                                    idConsultation: c.idConsultation,
                                                    diagnostic: c.diagnostic,
                                                    observations: c.observations || ""
                                                })}
                                            >
                                                <IconEdit size={13} /> Modifier
                                            </button>
                                            <button
                                                type="button"
                                                className="btn-action-principal"
                                                style={{ minHeight: "36px", padding: "6px 14px", fontSize: "0.82rem", display: "inline-flex", alignItems: "center", gap: "6px" }}
                                                onClick={() => {
                                                    setPrescriptionForm({
                                                        idConsultation: c.idConsultation,
                                                        items: [{ idMedicament: availableMeds[0]?.idMedicament || "", posologie: "1 cp matin et soir", frequence: "Pendant les repas", duree: "7 jours", quantite: 1 }]
                                                    });
                                                    setShowNewPrescriptionModal(true);
                                                }}
                                            >
                                                <IconPills size={14} /> Rédiger une ordonnance
                                            </button>
                                        </div>
                                    </div>
                                    <div style={{ background: "rgba(255, 255, 255, 0.08)", padding: "14px", borderRadius: "12px", marginBottom: "10px" }}>
                                        <strong style={{ color: "#8affdf", fontSize: "0.85rem", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>
                                            Diagnostic médical
                                        </strong>
                                        <p style={{ margin: 0, fontSize: "0.92rem", color: "#ffffff" }}>{c.diagnostic}</p>
                                    </div>
                                    {c.observations && (
                                        <div style={{ background: "rgba(255, 255, 255, 0.04)", padding: "12px", borderRadius: "10px" }}>
                                            <strong style={{ color: "#f6ffff", fontSize: "0.8rem", opacity: 0.8, display: "block", marginBottom: "3px" }}>
                                                Observations cliniques &amp; Antécédents
                                            </strong>
                                            <p style={{ margin: 0, fontSize: "0.86rem", opacity: 0.9, whiteSpace: "pre-line" }}>{c.observations}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ── 5. GESTION DES ORDONNANCES ── */}
            {path === "/doctor/prescriptions" && (
                <div className="medicaments-panneau">
                    <button onClick={() => navigate("/doctor")} className="btn-retour" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                        <IconArrowLeft size={16} /> Retour à l'accueil
                    </button>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", marginBottom: "20px" }}>
                        <div>
                            <h3 style={{ margin: "0 0 4px 0", fontSize: "1.25rem", color: "#ffffff" }}>
                                Ordonnances Médicales ({prescriptions.length})
                            </h3>
                            <p style={{ margin: 0, opacity: 0.8, fontSize: "0.85rem" }}>
                                Rédigez et imprimez des ordonnances médicamenteuses officielles.
                            </p>
                        </div>
                        <button
                            type="button"
                            className="btn-action-principal"
                            style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
                            onClick={() => {
                                setPrescriptionForm({
                                    idConsultation: consultations[0]?.idConsultation || "",
                                    items: [{ idMedicament: availableMeds[0]?.idMedicament || "", posologie: "1 cp matin et soir", frequence: "Pendant les repas", duree: "7 jours", quantite: 1 }]
                                });
                                setShowNewPrescriptionModal(true);
                            }}
                        >
                            <IconPlus size={15} /> Nouvelle ordonnance
                        </button>
                    </div>

                    {isLoadingPrescriptions ? (
                        <div style={{ padding: "40px", textAlign: "center", color: "#8affdf" }}>
                            Chargement des ordonnances...
                        </div>
                    ) : prescriptions.length === 0 ? (
                        <div style={{ padding: "50px 20px", textAlign: "center", background: "rgba(255, 255, 255, 0.08)", borderRadius: "16px", border: "1px dashed rgba(255, 255, 255, 0.25)" }}>
                            <div style={{ display: "flex", justifyContent: "center", marginBottom: "10px" }}>
                                <IconPrescription size={44} />
                            </div>
                            <h4 style={{ margin: "0 0 6px 0", color: "#ffffff", fontSize: "1.1rem" }}>Aucune ordonnance émise</h4>
                            <p style={{ margin: 0, opacity: 0.8, fontSize: "0.85rem" }}>
                                Créez une ordonnance à la fin d'une consultation en cliquant sur le bouton ci-dessus.
                            </p>
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                            {prescriptions.map((ord) => (
                                <div key={ord.idOrdonnance} className="ordonnance-card">
                                    <div className="ordonnance-meta">
                                        <div>
                                            <span className="font-mono font-tabular" style={{ fontSize: "0.78rem", color: "#8affdf", fontWeight: 700 }}>
                                                ORDONNANCE #{ord.idOrdonnance} • {ord.dateCreation}
                                            </span>
                                            <h4 style={{ margin: "4px 0", color: "#ffffff", fontSize: "1.15rem" }}>
                                                Patient : {ord.patientNom} {ord.patientPrenom}
                                            </h4>
                                            <span style={{ fontSize: "0.82rem", opacity: 0.8 }}>
                                                Diagnostic associé : {ord.diagnostic || "Général"}
                                            </span>
                                        </div>
                                        <button
                                            type="button"
                                            className="btn-action-principal"
                                            style={{ minHeight: "38px", padding: "8px 16px", fontSize: "0.82rem", display: "inline-flex", alignItems: "center", gap: "6px" }}
                                            onClick={() => setPrintPrescription(ord)}
                                        >
                                            <IconPrint size={14} /> Imprimer / Aperçu
                                        </button>
                                    </div>

                                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.88rem" }}>
                                        <thead>
                                            <tr style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.2)", color: "#8affdf", fontSize: "0.75rem", textTransform: "uppercase" }}>
                                                <th style={{ padding: "8px 6px", textAlign: "left" }}>Médicament</th>
                                                <th style={{ padding: "8px 6px", textAlign: "left" }}>Posologie</th>
                                                <th style={{ padding: "8px 6px", textAlign: "left" }}>Fréquence</th>
                                                <th style={{ padding: "8px 6px", textAlign: "left" }}>Durée</th>
                                                <th style={{ padding: "8px 6px", textAlign: "center" }}>Qté</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {ord.items && ord.items.map((it) => (
                                                <tr key={it.idPrescription} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.08)" }}>
                                                    <td style={{ padding: "10px 6px", fontWeight: 600, color: "#ffffff" }}>
                                                        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                                                            <IconPills size={14} /> {it.nomMedicament}
                                                        </span>
                                                        <span style={{ opacity: 0.7, fontWeight: 400, marginLeft: "6px" }}>({it.dosageMedicament})</span>
                                                    </td>
                                                    <td style={{ padding: "10px 6px" }}>{it.posologie}</td>
                                                    <td style={{ padding: "10px 6px" }}>{it.frequence}</td>
                                                    <td style={{ padding: "10px 6px" }}>{it.duree}</td>
                                                    <td className="font-tabular" style={{ padding: "10px 6px", textAlign: "center", fontWeight: 700, color: "#8affdf" }}>
                                                        {it.quantite}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ── MODAL 1 : MODIFIER RENDEZ-VOUS ── */}
            {editingRdv && (
                <div className="modal-overlay" onClick={() => setEditingRdv(null)}>
                    <div className="modal-glass" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="font-tabular">Modifier le Rendez-vous #{editingRdv.idRdv}</h3>
                            <button type="button" className="btn-close-modal" onClick={() => setEditingRdv(null)}>
                                <IconClose size={16} />
                            </button>
                        </div>
                        <form onSubmit={handleSaveModifiedRdv}>
                            <div className="form-champ">
                                <label>Patient</label>
                                <input type="text" readOnly value={`${editingRdv.patientPrenom} ${editingRdv.patientNom}`} />
                            </div>
                            <div className="form-champ">
                                <label>Date &amp; Heure</label>
                                <input type="text" readOnly value={editingRdv.dateHeure} />
                            </div>
                            <div className="form-champ">
                                <label>Statut du Rendez-vous</label>
                                <select
                                    value={editingRdv.statut}
                                    onChange={(e) => setEditingRdv({ ...editingRdv, statut: e.target.value })}
                                >
                                    <option value="DEMANDE">EN ATTENTE (DEMANDE)</option>
                                    <option value="CONFIRME">CONFIRMÉ</option>
                                    <option value="ANNULE">ANNULÉ</option>
                                    <option value="TERMINE">TERMINÉ</option>
                                </select>
                            </div>
                            <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
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

            {/* ── MODAL 2 : NOUVELLE CONSULTATION ── */}
            {showNewConsultationModal && (
                <div className="modal-overlay" onClick={() => setShowNewConsultationModal(false)}>
                    <div className="modal-glass" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Rédiger une Consultation Médicale</h3>
                            <button type="button" className="btn-close-modal" onClick={() => setShowNewConsultationModal(false)}>
                                <IconClose size={16} />
                            </button>
                        </div>
                        <form onSubmit={handleCreateConsultationSubmit}>
                            <div className="form-champ">
                                <label>Rendez-vous associé</label>
                                <select
                                    value={consultationForm.idRdv}
                                    onChange={(e) => setConsultationForm({ ...consultationForm, idRdv: e.target.value })}
                                    required
                                >
                                    <option value="">-- Sélectionnez le rendez-vous --</option>
                                    {appointments.map((rdv) => (
                                        <option key={rdv.idRdv} value={rdv.idRdv}>
                                            RDV #{rdv.idRdv} — {rdv.patientPrenom} {rdv.patientNom} ({rdv.dateHeure})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-champ">
                                <label>Diagnostic Médical *</label>
                                <input
                                    type="text"
                                    placeholder="Ex : Rhinopharyngite aiguë, Hypertension artérielle..."
                                    value={consultationForm.diagnostic}
                                    onChange={(e) => setConsultationForm({ ...consultationForm, diagnostic: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-champ">
                                <label>Observations &amp; Constantes (Tension, Pouls, Remarques)</label>
                                <textarea
                                    rows={4}
                                    placeholder="Tension : 12/8, Température : 37.2°C. Observations cliniques..."
                                    value={consultationForm.observations}
                                    onChange={(e) => setConsultationForm({ ...consultationForm, observations: e.target.value })}
                                />
                            </div>

                            <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                                <button type="submit" className="btn-action-principal" style={{ flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                                    <IconCheck size={16} /> Enregistrer la consultation
                                </button>
                                <button type="button" className="med-btn med-btn-secondaire" onClick={() => setShowNewConsultationModal(false)}>
                                    Annuler
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── MODAL 3 : NOUVELLE ORDONNANCE ── */}
            {showNewPrescriptionModal && (
                <div className="modal-overlay" onClick={() => setShowNewPrescriptionModal(false)}>
                    <div className="modal-glass" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "750px" }}>
                        <div className="modal-header">
                            <h3>Créer une Ordonnance Médicale</h3>
                            <button type="button" className="btn-close-modal" onClick={() => setShowNewPrescriptionModal(false)}>
                                <IconClose size={16} />
                            </button>
                        </div>
                        <form onSubmit={handleCreatePrescriptionSubmit}>
                            <div className="form-champ">
                                <label>Consultation de référence</label>
                                <select
                                    value={prescriptionForm.idConsultation}
                                    onChange={(e) => setPrescriptionForm({ ...prescriptionForm, idConsultation: e.target.value })}
                                    required
                                >
                                    <option value="">-- Sélectionnez la consultation --</option>
                                    {consultations.map((c) => (
                                        <option key={c.idConsultation} value={c.idConsultation}>
                                            Consultation #{c.idConsultation} : {c.patientNom} {c.patientPrenom} — {c.diagnostic}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "16px 0 10px" }}>
                                <label style={{ fontSize: "0.85rem", fontWeight: 700, color: "#8affdf", textTransform: "uppercase" }}>
                                    Médicaments prescrits
                                </label>
                                <button
                                    type="button"
                                    onClick={handleAddPrescriptionItem}
                                    style={{ background: "rgba(8, 199, 182, 0.25)", border: "1px solid #8affdf", color: "#8affdf", padding: "4px 10px", borderRadius: "8px", fontSize: "0.78rem", cursor: "pointer", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "5px" }}
                                >
                                    <IconPlus size={13} /> Ajouter un médicament
                                </button>
                            </div>

                            {prescriptionForm.items.map((item, index) => (
                                <div key={index} style={{ background: "rgba(255, 255, 255, 0.08)", padding: "16px", borderRadius: "14px", marginBottom: "14px", border: "1px solid rgba(255, 255, 255, 0.18)" }}>
                                    <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "10px", marginBottom: "10px" }}>
                                        <div>
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                                                <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "#8affdf" }}>
                                                    {item.isNew ? "Nouveau médicament (hors catalogue)" : "Médicament du catalogue"}
                                                </label>
                                                {!item.isNew ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => handlePrescriptionItemChange(index, "isNew", true)}
                                                        style={{ background: "none", border: "none", color: "#8affdf", fontSize: "0.75rem", cursor: "pointer", textDecoration: "underline" }}
                                                    >
                                                        + Nouveau médicament ?
                                                    </button>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={() => handlePrescriptionItemChange(index, "isNew", false)}
                                                        style={{ background: "none", border: "none", color: "#f6ffff", opacity: 0.8, fontSize: "0.75rem", cursor: "pointer", textDecoration: "underline" }}
                                                    >
                                                        Choisir dans le catalogue
                                                    </button>
                                                )}
                                            </div>

                                            {!item.isNew ? (
                                                <select
                                                    value={item.idMedicament}
                                                    onChange={(e) => {
                                                        if (e.target.value === "__NEW__") {
                                                            handlePrescriptionItemChange(index, "isNew", true);
                                                            handlePrescriptionItemChange(index, "idMedicament", "");
                                                        } else {
                                                            handlePrescriptionItemChange(index, "idMedicament", e.target.value);
                                                        }
                                                    }}
                                                    required
                                                >
                                                    <option value="">-- Choisir un médicament enregistré --</option>
                                                    {availableMeds.map((m) => (
                                                        <option key={m.idMedicament} value={m.idMedicament}>
                                                            {m.nom} ({m.dosage})
                                                        </option>
                                                    ))}
                                                    <option value="__NEW__" style={{ fontWeight: 700, color: "#8affdf" }}>
                                                        + Créer et enregistrer un nouveau médicament...
                                                    </option>
                                                </select>
                                            ) : (
                                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                                                    <input
                                                        type="text"
                                                        placeholder="Nom (ex : Ibuprofène)"
                                                        value={item.newNom || ""}
                                                        onChange={(e) => handlePrescriptionItemChange(index, "newNom", e.target.value)}
                                                        required
                                                    />
                                                    <input
                                                        type="text"
                                                        placeholder="Dosage (ex : 400 mg)"
                                                        value={item.newDosage || ""}
                                                        onChange={(e) => handlePrescriptionItemChange(index, "newDosage", e.target.value)}
                                                        required
                                                    />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "#f6ffff", opacity: 0.9, display: "block", marginBottom: "4px" }}>
                                                Quantité (boîtes)
                                            </label>
                                            <input
                                                type="number"
                                                min="1"
                                                className="font-tabular"
                                                value={item.quantite}
                                                onChange={(e) => handlePrescriptionItemChange(index, "quantite", e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: "10px", alignItems: "flex-end" }}>
                                        <div>
                                            <label style={{ fontSize: "0.75rem", opacity: 0.8, display: "block", marginBottom: "4px" }}>Posologie</label>
                                            <input
                                                type="text"
                                                placeholder="ex : 1 cp 3x/jour"
                                                value={item.posologie}
                                                onChange={(e) => handlePrescriptionItemChange(index, "posologie", e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: "0.75rem", opacity: 0.8, display: "block", marginBottom: "4px" }}>Fréquence</label>
                                            <input
                                                type="text"
                                                placeholder="ex : Pendant repas"
                                                value={item.frequence}
                                                onChange={(e) => handlePrescriptionItemChange(index, "frequence", e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: "0.75rem", opacity: 0.8, display: "block", marginBottom: "4px" }}>Durée</label>
                                            <input
                                                type="text"
                                                placeholder="ex : 7 jours"
                                                value={item.duree}
                                                onChange={(e) => handlePrescriptionItemChange(index, "duree", e.target.value)}
                                                required
                                            />
                                        </div>
                                        {prescriptionForm.items.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => handleRemovePrescriptionItem(index)}
                                                style={{ background: "rgba(255, 80, 110, 0.25)", border: "1px solid #ff809b", color: "#ff809b", padding: "12px 14px", borderRadius: "10px", cursor: "pointer", display: "inline-flex", alignItems: "center" }}
                                                title="Supprimer cette ligne"
                                            >
                                                <IconTrash size={16} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}

                            <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                                <button type="submit" className="btn-action-principal" style={{ flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                                    <IconCheck size={16} /> Générer l'ordonnance
                                </button>
                                <button type="button" className="med-btn med-btn-secondaire" onClick={() => setShowNewPrescriptionModal(false)}>
                                    Annuler
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── MODAL 4 : FICHE PATIENT DÉTAILLÉE ── */}
            {selectedPatientModal && (
                <div className="modal-overlay" onClick={() => setSelectedPatientModal(null)}>
                    <div className="modal-glass" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Dossier Médical : {selectedPatientModal.nom} {selectedPatientModal.prenom}</h3>
                            <button type="button" className="btn-close-modal" onClick={() => setSelectedPatientModal(null)}>
                                <IconClose size={16} />
                            </button>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "20px" }}>
                            <div style={{ background: "rgba(255, 255, 255, 0.08)", padding: "12px", borderRadius: "10px" }}>
                                <span style={{ opacity: 0.7, fontSize: "0.75rem", textTransform: "uppercase" }}>Email</span>
                                <div style={{ fontWeight: 600, color: "#ffffff" }}>{selectedPatientModal.email}</div>
                            </div>
                            <div style={{ background: "rgba(255, 255, 255, 0.08)", padding: "12px", borderRadius: "10px" }}>
                                <span style={{ opacity: 0.7, fontSize: "0.75rem", textTransform: "uppercase" }}>Date de naissance</span>
                                <div className="font-tabular" style={{ fontWeight: 600, color: "#ffffff" }}>{selectedPatientModal.dateNaissance || "Non renseignée"}</div>
                            </div>
                            <div style={{ background: "rgba(255, 255, 255, 0.08)", padding: "12px", borderRadius: "10px" }}>
                                <span style={{ opacity: 0.7, fontSize: "0.75rem", textTransform: "uppercase" }}>Adresse</span>
                                <div style={{ fontWeight: 600, color: "#ffffff" }}>{selectedPatientModal.adresse || "Non renseignée"}</div>
                            </div>
                            <div style={{ background: "rgba(255, 255, 255, 0.08)", padding: "12px", borderRadius: "10px" }}>
                                <span style={{ opacity: 0.7, fontSize: "0.75rem", textTransform: "uppercase" }}>Activité</span>
                                <div className="font-tabular" style={{ fontWeight: 600, color: "#8affdf" }}>
                                    {selectedPatientModal.totalRdv} Rendez-vous • {selectedPatientModal.totalConsultations} Consultations
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
                                    navigate("/doctor/consultations");
                                }}
                            >
                                <IconStethoscope size={16} /> Voir les consultations du patient
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

            {/* ── MODAL 5 : IMPRESSION ORDONNANCE (MÉDECIN) ── */}
            {printPrescription && (
                <div className="modal-overlay" onClick={() => setPrintPrescription(null)}>
                    <div className="modal-glass" onClick={(e) => e.stopPropagation()} style={{ background: "#ffffff", color: "#1f2937", maxWidth: "620px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "2px solid #0879f9", paddingBottom: "14px", marginBottom: "20px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                <div style={{ color: "#0879f9" }}>
                                    <LogoAlZahraoui size={38} />
                                </div>
                                <div>
                                    <h2 style={{ margin: 0, color: "#0879f9", fontSize: "1.4rem", letterSpacing: "1px" }}>CABINET MÉDICAL AL-ZAHRAOUI</h2>
                                    <p style={{ margin: "3px 0 0", fontSize: "0.85rem", color: "#4b5563" }}>Dr. {user?.prenom} {user?.nom} — Médecine Générale &amp; Spécialisée</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setPrintPrescription(null)}
                                style={{ background: "#f3f4f6", border: "none", borderRadius: "50%", width: "30px", height: "30px", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" }}
                                aria-label="Fermer"
                            >
                                <IconClose size={14} />
                            </button>
                        </div>

                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "24px", fontSize: "0.9rem" }}>
                            <div>
                                <strong style={{ color: "#111827" }}>Patient :</strong> {printPrescription.patientPrenom} {printPrescription.patientNom}
                            </div>
                            <div className="font-tabular">
                                <strong style={{ color: "#111827" }}>Date :</strong> {printPrescription.dateCreation}
                            </div>
                        </div>

                        <h3 style={{ borderBottom: "1px solid #e5e7eb", paddingBottom: "8px", fontSize: "1.05rem", color: "#111827" }}>PRESCRIPTION MÉDICALE</h3>
                        <div style={{ margin: "20px 0" }}>
                            {printPrescription.items && printPrescription.items.map((it, idx) => (
                                <div key={it.idPrescription || idx} style={{ marginBottom: "16px", paddingLeft: "10px", borderLeft: "3px solid #08c7b6" }}>
                                    <div style={{ fontWeight: 700, fontSize: "1rem", color: "#111827" }}>
                                        {idx + 1}. {it.nomMedicament} {it.dosageMedicament}
                                    </div>
                                    <div style={{ fontSize: "0.9rem", color: "#4b5563", marginTop: "2px" }}>
                                        {it.posologie} — {it.frequence} pendant {it.duree} (Qté : <span className="font-tabular">{it.quantite}</span>)
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div style={{ marginTop: "40px", display: "flex", justifyContent: "flex-end", textAlign: "right" }}>
                            <div>
                                <div style={{ fontSize: "0.85rem", color: "#6b7280" }}>Signature &amp; Cachet du Praticien</div>
                                <div style={{ marginTop: "35px", fontWeight: "700", color: "#0879f9" }}>
                                    Dr. {user?.prenom} {user?.nom}
                                </div>
                            </div>
                        </div>

                        <div style={{ display: "flex", gap: "10px", marginTop: "24px", borderTop: "1px solid #e5e7eb", paddingTop: "16px" }}>
                            <button
                                type="button"
                                style={{ flex: 1, padding: "10px 16px", borderRadius: "10px", background: "#0879f9", color: "white", border: "none", fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
                                onClick={() => window.print()}
                            >
                                <IconPrint size={16} /> Imprimer l'ordonnance
                            </button>
                            <button
                                type="button"
                                style={{ padding: "10px 16px", borderRadius: "10px", background: "#f3f4f6", color: "#374151", border: "1px solid #d1d5db", fontWeight: 600, cursor: "pointer" }}
                                onClick={() => setPrintPrescription(null)}
                            >
                                Fermer
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── MODAL 6 : NOUVEAU PATIENT ── */}
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

            {/* ── MODAL 7 : MODIFIER PATIENT ── */}
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

            {/* ── MODAL 8 : MODIFIER CONSULTATION MÉDICALE ── */}
            {editingConsultationModal && (
                <div className="modal-overlay" onClick={() => setEditingConsultationModal(null)}>
                    <div className="modal-glass" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                                <IconEdit size={18} /> Modifier la consultation #{editingConsultationModal.idConsultation}
                            </h3>
                            <button type="button" className="btn-close-modal" onClick={() => setEditingConsultationModal(null)}>
                                <IconClose size={16} />
                            </button>
                        </div>

                        <form onSubmit={handleUpdateConsultationSubmit}>
                            <div className="form-group" style={{ marginBottom: "14px" }}>
                                <label className="form-label">Diagnostic médical *</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={editingConsultationModal.diagnostic}
                                    onChange={(e) => setEditingConsultationModal({ ...editingConsultationModal, diagnostic: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group" style={{ marginBottom: "20px" }}>
                                <label className="form-label">Observations cliniques &amp; Antécédents</label>
                                <textarea
                                    className="form-control"
                                    rows={4}
                                    value={editingConsultationModal.observations}
                                    onChange={(e) => setEditingConsultationModal({ ...editingConsultationModal, observations: e.target.value })}
                                />
                            </div>

                            <div style={{ display: "flex", gap: "10px" }}>
                                <button type="submit" className="btn-action-principal" style={{ flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                                    <IconCheck size={16} /> Sauvegarder les corrections
                                </button>
                                <button type="button" className="med-btn med-btn-secondaire" onClick={() => setEditingConsultationModal(null)}>
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

export default DoctorDashboard;
