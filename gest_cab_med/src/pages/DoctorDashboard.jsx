/**
 * ============================================================================
 * FICHIER : DoctorDashboard.jsx
 * MODULE  : Espace Médecin - Orchestrateur Principal du Tableau de Bord
 * ============================================================================
 * RÔLE ET FONCTIONNALITÉS :
 * 1. Composant chef d'orchestre de l'espace praticien (Cabinet Al-Zahrawi).
 * 2. Centralise l'état global, la persistance de session (authentification médecin)
 *    et le routage applicatif interne (/doctor, /patients, /appointments, /consultations, /prescriptions).
 * 3. Coordonne les appels aux services métiers (medicalService, appointmentService, medicamentApi).
 * 4. Fournit un système de retour utilisateur unifié :
 *    - Toasts de notification (succès, avertissement, erreur).
 *    - Modales de confirmation standardisées (désactivation patient, suppression consultation/ordonnance).
 * 5. Délègue le rendu graphique et les formulaires interactifs aux sous-composants modulaires :
 *    - DoctorHomeView           : Page d'accueil et raccourcis modules
 *    - DoctorPatientsView       : Gestion des patients, fiches et antécédents
 *    - DoctorAppointmentsView   : Agenda et planning des consultations
 *    - DoctorConsultationsView  : Dossiers de consultation et diagnostics
 *    - DoctorPrescriptionsView  : Émission et gestion des ordonnances
 *    - PrintablePrescriptionModal: Impression officielle A4 avec cachet
 * ============================================================================
 */

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
    deleteConsultation,
    getPrescriptionsByDoctor,
    createPrescription,
    updatePrescription,
    deletePrescription
} from "../services/medicalService";
import { medicamentApi } from "../services/medicamentApi";
import {
    IconPatientDossier,
    IconAppointmentCalendar,
    IconConsultation,
    IconPrescription,
    IconPills,
    IconCheck,
    IconClose,
    IconClock
} from "../components/MedicalIcons";
import NotificationToast from "../components/NotificationToast";
import ConfirmModal from "../components/ConfirmModal";

// Sous-composants modulaires de l'espace praticien
import DoctorHomeView from "../components/doctor/DoctorHomeView";
import DoctorPatientsView from "../components/doctor/DoctorPatientsView";
import DoctorAppointmentsView from "../components/doctor/DoctorAppointmentsView";
import DoctorConsultationsView from "../components/doctor/DoctorConsultationsView";
import DoctorPrescriptionsView from "../components/doctor/DoctorPrescriptionsView";
import PrintablePrescriptionModal from "../components/doctor/PrintablePrescriptionModal";
import DoctorModals from "../components/doctor/DoctorModals";

const cards = [
    { icon: IconPatientDossier, title: "Gestion des patients", description: "Consulter et gérer les dossiers des patients.", path: "/doctor/patients" },
    { icon: IconAppointmentCalendar, title: "Rendez-vous", description: "Consulter le planning des rendez-vous et valider les créneaux.", path: "/doctor/appointments" },
    { icon: IconConsultation, title: "Consultations", description: "Créer et gérer les consultations médicales.", path: "/doctor/consultations" },
    { icon: IconPrescription, title: "Ordonnances", description: "Créer et gérer les prescriptions médicales.", path: "/doctor/prescriptions" },
    { icon: IconPills, title: "Médicaments", description: "Inventaire de la pharmacie, dosages et gestion des stocks.", path: "/doctor/medicaments" },
];

const formatFrenchDate = (dateStr) => {
    if (!dateStr) return "Non renseignée";
    const str = String(dateStr).trim();
    if (/^\d{2}\/\d{2}\/\d{4}/.test(str)) return str;
    const parts = str.split("T")[0].split("-");
    if (parts.length === 3 && parts[0].length === 4) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    try {
        const d = new Date(str);
        if (!isNaN(d.getTime())) {
            const day = String(d.getDate()).padStart(2, "0");
            const month = String(d.getMonth() + 1).padStart(2, "0");
            const year = d.getFullYear();
            return `${day}/${month}/${year}`;
        }
    } catch {
        // fallback
    }
    return str;
};

function DoctorDashboard() {
    const navigate = useNavigate();
    const location = useLocation();
    const rawPath = location.pathname;
    const path = rawPath.endsWith("/") && rawPath.length > 1 ? rawPath.slice(0, -1) : rawPath;
    const user = getUser();

    // ── RDV STATE ────────────────────────────────────────────────────────────
    const [appointments, setAppointments] = useState([]);
    const [isLoadingAppointments, setIsLoadingAppointments] = useState(false);
    const [actionMessage, setActionMessage] = useState("");
    const [editingRdv, setEditingRdv] = useState(null); // { idRdv, statut, dateHeure, motif }
    const [toast, setToast] = useState(null); // { message, type }
    const [confirmModalState, setConfirmModalState] = useState(null);

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
    const [editingPrescriptionModal, setEditingPrescriptionModal] = useState(null);
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

    const handleTogglePatientStatus = (patient) => {
        const newActif = !patient.actif;
        setConfirmModalState({
            title: newActif ? "Réactiver le dossier patient" : "Désactiver le dossier patient",
            message: newActif
                ? `Souhaitez-vous réactiver le dossier médical de ${patient.prenom} ${patient.nom} ? Le patient pourra à nouveau prendre rendez-vous.`
                : `Souhaitez-vous désactiver le dossier médical de ${patient.prenom} ${patient.nom} ? L'historique des consultations et ordonnances sera entièrement préservé.`,
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

    const handleDeleteConsultation = (c) => {
        setConfirmModalState({
            title: `Supprimer la consultation #${c.idConsultation} ?`,
            message: `Êtes-vous sûr de vouloir supprimer définitivement la consultation #${c.idConsultation} du patient ${c.patientNom} ${c.patientPrenom} ? Cette action réinitialisera le rendez-vous associé en statut 'CONFIRMÉ' et supprimera les ordonnances liées.`,
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
            getAppointmentsByDoctor(user.idUtilisateur).then((data) => {
                if (!isCancelled) setAppointments(data || []);
            });
            medicamentApi.list().then((meds) => {
                if (!isCancelled) setAvailableMeds(meds || []);
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

            // French Confirmation Pop-up instead of window.confirm
            setConfirmModalState({
                title: "Générer une ordonnance",
                message: "La consultation a été enregistrée avec succès. Souhaitez-vous rédiger immédiatement une ordonnance médicamenteuse pour ce patient ?",
                confirmText: "Accepter (Rédiger)",
                cancelText: "Annuler",
                variant: "primary",
                onConfirm: () => {
                    setConfirmModalState(null);
                    if (res?.idConsultation) {
                        setPrescriptionForm({
                            idConsultation: res.idConsultation,
                            items: [{ idMedicament: availableMeds[0]?.idMedicament || "", posologie: "1 cp matin et soir", frequence: "Pendant les repas", duree: "7 jours", quantite: 1 }]
                        });
                        setShowNewPrescriptionModal(true);
                    }
                }
            });
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
            const processedItems = [];
            const updatedMeds = [...availableMeds];

            for (const it of prescriptionForm.items) {
                let medId = it.idMedicament;
                if (it.isNew) {
                    if (!it.newNom?.trim() || !it.newDosage?.trim()) {
                        showToast("Veuillez saisir le nom et le dosage du nouveau médicament à enregistrer.", "error");
                        return;
                    }
                    if (!/\d/.test(it.newDosage)) {
                        showToast("Le dosage doit contenir une valeur numérique (ex : 500 mg, 10 ml, 1 g).", "error");
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

                const qte = parseInt(it.quantite, 10);
                if (isNaN(qte) || qte <= 0) {
                    showToast("La quantité de chaque médicament doit être un nombre entier positif (au moins 1).", "error");
                    return;
                }

                if (medId) {
                    processedItems.push({
                        idMedicament: parseInt(medId, 10),
                        posologie: it.posologie || "1 cp",
                        frequence: it.frequence || "Par jour",
                        duree: it.duree || "7 jours",
                        quantite: qte
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

    // ── MODIFICATION & SUPPRESSION DES ORDONNANCES ───────────────────────────
    const handleOpenEditPrescription = (ord) => {
        setEditingPrescriptionModal({
            idOrdonnance: ord.idOrdonnance,
            patientNom: ord.patientNom,
            patientPrenom: ord.patientPrenom,
            dateCreation: ord.dateCreation,
            diagnostic: ord.diagnostic,
            items: (ord.items || []).map((it) => ({
                idPrescription: it.idPrescription,
                idMedicament: it.idMedicament || "",
                posologie: it.posologie || "1 cp matin et soir",
                frequence: it.frequence || "Pendant repas",
                duree: it.duree || "7 jours",
                quantite: it.quantite || 1,
                nomMedicament: it.nomMedicament,
                dosageMedicament: it.dosageMedicament
            }))
        });
    };

    const handleAddEditPrescriptionItem = () => {
        setEditingPrescriptionModal((prev) => ({
            ...prev,
            items: [
                ...prev.items,
                {
                    idMedicament: availableMeds[0]?.idMedicament || "",
                    posologie: "1 cp par jour",
                    frequence: "Le matin",
                    duree: "5 jours",
                    quantite: 1
                }
            ]
        }));
    };

    const handleRemoveEditPrescriptionItem = (index) => {
        setEditingPrescriptionModal((prev) => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index)
        }));
    };

    const handleEditPrescriptionItemChange = (index, field, value) => {
        setEditingPrescriptionModal((prev) => {
            const newItems = [...prev.items];
            newItems[index] = { ...newItems[index], [field]: value };
            return { ...prev, items: newItems };
        });
    };

    const handleUpdatePrescriptionSubmit = async (e) => {
        e.preventDefault();
        if (!editingPrescriptionModal) return;

        for (const it of editingPrescriptionModal.items) {
            const qte = parseInt(it.quantite, 10);
            if (isNaN(qte) || qte <= 0) {
                showToast("La quantité de chaque médicament doit être un nombre entier positif (au moins 1).", "error");
                return;
            }
        }

        const processedItems = editingPrescriptionModal.items
            .map((it) => ({
                idMedicament: parseInt(it.idMedicament, 10),
                posologie: it.posologie || "1 cp",
                frequence: it.frequence || "Par jour",
                duree: it.duree || "7 jours",
                quantite: parseInt(it.quantite, 10) || 1
            }))
            .filter((it) => !isNaN(it.idMedicament) && it.idMedicament > 0);

        if (processedItems.length === 0) {
            showToast("Veuillez inclure au moins un médicament valide dans l'ordonnance.", "error");
            return;
        }

        try {
            await updatePrescription(editingPrescriptionModal.idOrdonnance, { items: processedItems });
            showToast(`Ordonnance #${editingPrescriptionModal.idOrdonnance} mise à jour avec succès !`, "success");
            setEditingPrescriptionModal(null);
            loadPrescriptions();
        } catch (error) {
            showToast(error.message || "Erreur lors de la mise à jour de l'ordonnance.", "error");
        }
    };

    const handleDeletePrescription = (ord) => {
        setConfirmModalState({
            title: "Supprimer l'ordonnance",
            message: `Êtes-vous certain de vouloir supprimer l'ordonnance #${ord.idOrdonnance} de ${ord.patientPrenom} ${ord.patientNom} ? Cette opération est irréversible et supprimera également les lignes de prescription associées.`,
            confirmText: "Accepter (Supprimer)",
            cancelText: "Annuler",
            variant: "danger",
            onConfirm: async () => {
                setConfirmModalState(null);
                try {
                    await deletePrescription(ord.idOrdonnance);
                    showToast(`Ordonnance #${ord.idOrdonnance} supprimée avec succès.`, "success");
                    loadPrescriptions();
                } catch (error) {
                    showToast(error.message || "Erreur lors de la suppression de l'ordonnance.", "error");
                }
            }
        });
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

            {/* Custom Pop-up Modal (French Annuler / Accepter) */}
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

            {/* ── 1. ACCUEIL ── */}
            {path === "/doctor" && (
                <DoctorHomeView cards={cards} navigate={navigate} />
            )}

            {/* ── 2. GESTION DES PATIENTS ── */}
            {path === "/doctor/patients" && (
                <DoctorPatientsView
                    patients={patients}
                    filteredPatients={filteredPatients}
                    patientSearch={patientSearch}
                    setPatientSearch={setPatientSearch}
                    isLoadingPatients={isLoadingPatients}
                    setShowNewPatientModal={setShowNewPatientModal}
                    setSelectedPatientModal={setSelectedPatientModal}
                    setEditingPatientModal={setEditingPatientModal}
                    handleTogglePatientStatus={handleTogglePatientStatus}
                    navigate={navigate}
                    formatFrenchDate={formatFrenchDate}
                />
            )}

            {/* ── 3. PLANNING DES RENDEZ-VOUS ── */}
            {path === "/doctor/appointments" && (
                <DoctorAppointmentsView
                    appointments={appointments}
                    isLoadingAppointments={isLoadingAppointments}
                    loadAppointments={loadAppointments}
                    actionMessage={actionMessage}
                    navigate={navigate}
                    handleUpdateStatus={handleUpdateStatus}
                    handleOpenConsultationForRdv={handleOpenConsultationForRdv}
                    setEditingRdv={setEditingRdv}
                    getStatusBadge={getStatusBadge}
                />
            )}

            {/* ── 4. CONSULTATIONS MÉDICALES ── */}
            {path === "/doctor/consultations" && (
                <DoctorConsultationsView
                    consultations={consultations}
                    isLoadingConsultations={isLoadingConsultations}
                    navigate={navigate}
                    setShowNewConsultationModal={setShowNewConsultationModal}
                    setConsultationForm={setConsultationForm}
                    setEditingConsultationModal={setEditingConsultationModal}
                    handleDeleteConsultation={handleDeleteConsultation}
                    setPrescriptionForm={setPrescriptionForm}
                    setShowNewPrescriptionModal={setShowNewPrescriptionModal}
                    availableMeds={availableMeds}
                    formatFrenchDate={formatFrenchDate}
                />
            )}

            {/* ── 5. GESTION DES ORDONNANCES ── */}
            {path === "/doctor/prescriptions" && (
                <DoctorPrescriptionsView
                    prescriptions={prescriptions}
                    isLoadingPrescriptions={isLoadingPrescriptions}
                    navigate={navigate}
                    setPrintPrescription={setPrintPrescription}
                    handleOpenEditPrescription={handleOpenEditPrescription}
                    handleDeletePrescription={handleDeletePrescription}
                    setPrescriptionForm={setPrescriptionForm}
                    setShowNewPrescriptionModal={setShowNewPrescriptionModal}
                    availableMeds={availableMeds}
                    consultations={consultations}
                    formatFrenchDate={formatFrenchDate}
                />
            )}

            {/* ── MODALES GLOBALES MÉDECIN (CENTRALISÉES HORS PANNEAUX) ── */}
            <DoctorModals
                editingRdv={editingRdv}
                setEditingRdv={setEditingRdv}
                handleSaveModifiedRdv={handleSaveModifiedRdv}
                showNewConsultationModal={showNewConsultationModal}
                setShowNewConsultationModal={setShowNewConsultationModal}
                consultationForm={consultationForm}
                setConsultationForm={setConsultationForm}
                handleCreateConsultationSubmit={handleCreateConsultationSubmit}
                editingConsultationModal={editingConsultationModal}
                setEditingConsultationModal={setEditingConsultationModal}
                handleUpdateConsultationSubmit={handleUpdateConsultationSubmit}
                appointments={appointments}
                showNewPrescriptionModal={showNewPrescriptionModal}
                setShowNewPrescriptionModal={setShowNewPrescriptionModal}
                prescriptionForm={prescriptionForm}
                setPrescriptionForm={setPrescriptionForm}
                handleAddPrescriptionItem={handleAddPrescriptionItem}
                handleRemovePrescriptionItem={handleRemovePrescriptionItem}
                handlePrescriptionItemChange={handlePrescriptionItemChange}
                handleCreatePrescriptionSubmit={handleCreatePrescriptionSubmit}
                editingPrescriptionModal={editingPrescriptionModal}
                setEditingPrescriptionModal={setEditingPrescriptionModal}
                handleAddEditPrescriptionItem={handleAddEditPrescriptionItem}
                handleRemoveEditPrescriptionItem={handleRemoveEditPrescriptionItem}
                handleEditPrescriptionItemChange={handleEditPrescriptionItemChange}
                handleUpdatePrescriptionSubmit={handleUpdatePrescriptionSubmit}
                availableMeds={availableMeds}
                consultations={consultations}
                selectedPatientModal={selectedPatientModal}
                setSelectedPatientModal={setSelectedPatientModal}
                showNewPatientModal={showNewPatientModal}
                setShowNewPatientModal={setShowNewPatientModal}
                newPatientForm={newPatientForm}
                setNewPatientForm={setNewPatientForm}
                handleCreatePatientSubmit={handleCreatePatientSubmit}
                editingPatientModal={editingPatientModal}
                setEditingPatientModal={setEditingPatientModal}
                handleUpdatePatientSubmit={handleUpdatePatientSubmit}
                navigate={navigate}
                formatFrenchDate={formatFrenchDate}
            />

            {/* ── MODAL : IMPRESSION ORDONNANCE (MÉDECIN) ── */}
            <PrintablePrescriptionModal
                prescription={printPrescription}
                user={user}
                onClose={() => setPrintPrescription(null)}
                formatFrenchDate={formatFrenchDate}
            />
        </DashboardLayout>
    );
}

export default DoctorDashboard;
