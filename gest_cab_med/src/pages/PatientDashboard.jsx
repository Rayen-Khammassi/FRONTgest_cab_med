import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import NotificationToast from "../components/NotificationToast";
import { getUser } from "../services/authService";
import {
    getDoctors,
    createAppointment,
    getAppointmentsByPatient
} from "../services/appointmentService";
import {
    getPrescriptionsByPatient
} from "../services/medicalService";
import {
    IconRequestAppointment,
    IconAppointmentCalendar,
    IconPrescription,
    IconMedicineCabinet,
    IconPlus,
    IconCheck,
    IconClose,
    IconClock,
    IconPrint,
    IconPills,
    IconArrowLeft,
    IconArrowRight,
    IconCalendar,
    IconUser,
    LogoAlZahraoui
} from "../components/MedicalIcons";

const cards = [
    {
        icon: IconRequestAppointment,
        title: "Demander un rendez-vous",
        description: "Envoyez une demande de consultation à votre praticien traitant.",
        path: "/patient/appointments/request",
    },
    {
        icon: IconAppointmentCalendar,
        title: "Mes rendez-vous",
        description: "Consultez le planning et l'état de validation de vos rendez-vous.",
        path: "/patient/appointments",
    },
    {
        icon: IconPrescription,
        title: "Mes ordonnances",
        description: "Retrouvez vos ordonnances et prescriptions médicales officielles.",
        path: "/patient/prescriptions",
    },
];

const formatFrenchDateTime = (dtStr) => {
    if (!dtStr) return "Non précisée";
    const str = String(dtStr).trim();
    try {
        const [dPart, tPart] = str.split(/[T ]/);
        if (dPart && dPart.includes("-")) {
            const [y, m, d] = dPart.split("-");
            const time = tPart ? tPart.slice(0, 5) : "";
            return `${d}/${m}/${y}${time ? ` à ${time}` : ""}`;
        }
    } catch {
        // fallback
    }
    return str;
};

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

function PatientDashboard() {
    const navigate = useNavigate();
    const location = useLocation();
    const path = location.pathname;
    const user = getUser();

    // Toast state
    const [toast, setToast] = useState(null);

    const showToast = (message, type = "success") => {
        setToast({ message, type });
    };

    // Form state
    const [doctors, setDoctors] = useState([]);
    const [selectedDoctor, setSelectedDoctor] = useState("");
    const [dateHeure, setDateHeure] = useState("");
    const [motif, setMotif] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Appointments list state
    const [appointments, setAppointments] = useState([]);
    const [isLoadingAppointments, setIsLoadingAppointments] = useState(false);

    // Prescriptions list state
    const [prescriptions, setPrescriptions] = useState([]);
    const [isLoadingPrescriptions, setIsLoadingPrescriptions] = useState(false);
    const [printPrescription, setPrintPrescription] = useState(null);

    // Fetch doctors on mount
    useEffect(() => {
        getDoctors().then((docs) => {
            setDoctors(docs || []);
            if (docs && docs.length > 0) {
                setSelectedDoctor(docs[0].idDocteur || docs[0].idUtilisateur);
            }
        });
    }, []);

    // Fetch appointments when visiting appointments page
    useEffect(() => {
        let isCancelled = false;
        if (path === "/patient/appointments" && user?.idUtilisateur) {
            setIsLoadingAppointments(true);
            getAppointmentsByPatient(user.idUtilisateur)
                .then((data) => {
                    if (!isCancelled) {
                        setAppointments(data || []);
                        setIsLoadingAppointments(false);
                    }
                })
                .catch(() => {
                    if (!isCancelled) setIsLoadingAppointments(false);
                });
        }
        return () => { isCancelled = true; };
    }, [path, user?.idUtilisateur]);

    // Fetch prescriptions when visiting prescriptions page
    useEffect(() => {
        let isCancelled = false;
        if (path === "/patient/prescriptions" && user?.idUtilisateur) {
            setIsLoadingPrescriptions(true);
            getPrescriptionsByPatient(user.idUtilisateur)
                .then((data) => {
                    if (!isCancelled) {
                        setPrescriptions(data || []);
                        setIsLoadingPrescriptions(false);
                    }
                })
                .catch(() => {
                    if (!isCancelled) setIsLoadingPrescriptions(false);
                });
        }
        return () => { isCancelled = true; };
    }, [path, user?.idUtilisateur]);

    const handleCreateAppointment = async (e) => {
        e.preventDefault();
        if (!dateHeure || !selectedDoctor) {
            showToast("Veuillez sélectionner un praticien et une date.", "error");
            return;
        }

        setIsSubmitting(true);
        try {
            const formattedDate = dateHeure.replace("T", " ") + (dateHeure.length === 16 ? ":00" : "");
            await createAppointment({
                idPatient: user?.idUtilisateur,
                idDocteur: parseInt(selectedDoctor, 10),
                dateHeure: formattedDate,
                motif: motif.trim() || "Consultation médicale",
            });

            showToast("Votre demande de rendez-vous a été transmise au secrétariat avec succès !", "success");
            setDateHeure("");
            setMotif("");
            setTimeout(() => {
                navigate("/patient/appointments");
            }, 1200);
        } catch (error) {
            showToast(error.message || "Erreur lors de la prise de rendez-vous.", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    let title = "Bienvenue dans votre espace";
    let subtitle = "Retrouvez toutes vos informations médicales au même endroit.";

    if (path.includes("appointments/request")) {
        title = "Demande de consultation";
        subtitle = "Choisissez votre praticien, votre date et précisez le motif de votre visite.";
    } else if (path.includes("appointments")) {
        title = "Mes rendez-vous médicaux";
        subtitle = "Historique et statut de confirmation de vos rendez-vous.";
    } else if (path.includes("prescriptions")) {
        title = "Mes ordonnances médicales";
        subtitle = "Consultez et imprimez vos prescriptions délivrées par le cabinet.";
    }

    const getStatusBadge = (statut) => {
        switch (statut) {
            case "CONFIRME":
                return (
                    <span className="badge-status badge-confirmed" style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
                        <IconCheck size={12} /> Confirmé
                    </span>
                );
            case "ANNULE":
                return (
                    <span className="badge-status badge-cancelled" style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
                        <IconClose size={12} /> Annulé
                    </span>
                );
            case "TERMINE":
                return (
                    <span className="badge-status badge-completed" style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
                        <IconCheck size={12} /> Terminé
                    </span>
                );
            default:
                return (
                    <span className="badge-status badge-waiting" style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
                        <IconClock size={12} /> En attente de confirmation
                    </span>
                );
        }
    };

    return (
        <DashboardLayout role="PATIENT" title={title} subtitle={subtitle}>
            <NotificationToast
                message={toast?.message}
                type={toast?.type}
                onClose={() => setToast(null)}
            />

            {/* ── 1. ACCUEIL PATIENT ── */}
            {path === "/patient" && (
                <>
                    <div className="welcome-banner">
                        <div>
                            <span className="banner-label">ESPACE PATIENT · AL-ZAHRAOUI</span>
                            <h2>Votre santé, notre engagement.</h2>
                            <p>Consultez vos rendez-vous, vos ordonnances officielles et communiquez avec votre cabinet.</p>
                        </div>
                        <div className="banner-decoration">
                            <IconMedicineCabinet size={32} />
                        </div>
                    </div>

                    <h2 className="section-title">Mes services patients</h2>

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
                                    <div className="service-icon">
                                        <IconComponent size={24} />
                                    </div>
                                    <h3>{card.title}</h3>
                                    <p>{card.description}</p>
                                    <span className="service-arrow" aria-hidden="true">
                                        <IconArrowRight size={16} />
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}

            {/* ── 2. DEMANDE DE RENDEZ-VOUS ── */}
            {path.includes("appointments/request") && (
                <div className="medicaments-panneau" style={{ maxWidth: "680px" }}>
                    <button
                        onClick={() => navigate("/patient")}
                        className="btn-retour"
                        style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
                    >
                        <IconArrowLeft size={16} /> Retour à l'accueil
                    </button>
                    <h3 style={{ margin: "0 0 8px 0", fontSize: "1.25rem", fontWeight: 700, color: "#0f172a" }}>
                        Demande de rendez-vous médical
                    </h3>
                    <p style={{ color: "#64748b", fontSize: "0.88rem", marginBottom: "22px" }}>
                        Remplissez la date souhaitée et le praticien. Le secrétariat validera votre demande.
                    </p>

                    <form onSubmit={handleCreateAppointment}>
                        <div className="form-group" style={{ marginBottom: "16px" }}>
                            <label className="form-label" htmlFor="doctorSelect">Médecin / Praticien *</label>
                            <select
                                id="doctorSelect"
                                className="form-control"
                                value={selectedDoctor}
                                onChange={(e) => setSelectedDoctor(e.target.value)}
                                required
                            >
                                {doctors.length === 0 && (
                                    <option value="">Aucun médecin enregistré</option>
                                )}
                                {doctors.map((doc) => (
                                    <option key={doc.idDocteur || doc.idUtilisateur} value={doc.idDocteur || doc.idUtilisateur}>
                                        Dr. {doc.prenom} {doc.nom} — {doc.specialite || "Médecine générale"}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group" style={{ marginBottom: "16px" }}>
                            <label className="form-label" htmlFor="rdvDate">Date et heure souhaitées *</label>
                            <input
                                id="rdvDate"
                                type="datetime-local"
                                className="form-control font-tabular"
                                value={dateHeure}
                                onChange={(e) => setDateHeure(e.target.value)}
                                min={new Date().toISOString().slice(0, 16)}
                                required
                            />
                        </div>

                        <div className="form-group" style={{ marginBottom: "20px" }}>
                            <label className="form-label" htmlFor="rdvMotif">Motif de consultation</label>
                            <textarea
                                id="rdvMotif"
                                className="form-control"
                                rows={4}
                                value={motif}
                                onChange={(e) => setMotif(e.target.value)}
                                placeholder="Ex: Consultation de suivi, renouvellement d'ordonnance, bilan de santé..."
                            />
                        </div>

                        <div style={{ display: "flex", gap: "12px", marginTop: "10px" }}>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="btn-action-principal"
                                style={{ flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
                            >
                                <IconCheck size={16} /> {isSubmitting ? "Envoi en cours..." : "Transmettre ma demande"}
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate("/patient/appointments")}
                                className="med-btn med-btn-secondaire"
                                style={{ margin: 0 }}
                            >
                                Voir mes rendez-vous
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* ── 3. LISTE DES RENDEZ-VOUS ── */}
            {path === "/patient/appointments" && (
                <div className="medicaments-panneau">
                    <button
                        onClick={() => navigate("/patient")}
                        className="btn-retour"
                        style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
                    >
                        <IconArrowLeft size={16} /> Retour à l'accueil
                    </button>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "10px" }}>
                        <div>
                            <h3 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 700, color: "#0f172a" }}>Mes rendez-vous ({appointments.length})</h3>
                            <p style={{ margin: "4px 0 0", opacity: 0.8, fontSize: "0.85rem" }}>
                                Retrouvez le statut et l'historique de vos rendez-vous au cabinet Al-Zahraoui.
                            </p>
                        </div>
                        <button
                            onClick={() => navigate("/patient/appointments/request")}
                            className="btn-action-principal"
                            style={{ minHeight: "38px", padding: "8px 16px", fontSize: "0.85rem", display: "inline-flex", alignItems: "center", gap: "8px" }}
                        >
                            <IconPlus size={15} /> Nouveau rendez-vous
                        </button>
                    </div>

                    {isLoadingAppointments ? (
                        <div style={{ padding: "40px", textAlign: "center", color: "#0f766e", fontWeight: 600 }}>
                            Chargement de vos rendez-vous...
                        </div>
                    ) : appointments.length === 0 ? (
                        <div style={{
                            padding: "50px 20px",
                            textAlign: "center",
                            background: "rgba(255, 255, 255, 0.08)",
                            borderRadius: "16px",
                            border: "1px dashed rgba(255, 255, 255, 0.25)"
                        }}>
                            <div style={{ display: "flex", justifyContent: "center", marginBottom: "10px" }}>
                                <IconAppointmentCalendar size={44} />
                            </div>
                            <h4 style={{ margin: "0 0 6px 0", color: "#0f172a", fontSize: "1.1rem" }}>Aucun rendez-vous enregistré</h4>
                            <p style={{ margin: 0, opacity: 0.8, fontSize: "0.85rem" }}>
                                Vos rendez-vous demandés ou confirmés s'afficheront ici.
                            </p>
                        </div>
                    ) : (
                        <div style={{ width: "100%", overflowX: "auto" }}>
                            <table className="patient-table">
                                <thead>
                                    <tr>
                                        <th>Date &amp; Heure</th>
                                        <th>Médecin</th>
                                        <th>Spécialité</th>
                                        <th>Motif</th>
                                        <th>Statut</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {appointments.map((rdv) => (
                                        <tr key={rdv.idRdv}>
                                            <td className="font-tabular" style={{ fontWeight: 700, color: "#0f172a" }}>
                                                <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                                                    <IconCalendar size={14} style={{ color: "#38bdf8" }} /> {formatFrenchDateTime(rdv.dateHeure)}
                                                </span>
                                            </td>
                                            <td style={{ color: "#ffffff" }}>
                                                <span className="patient-name-cell">
                                                    <IconUser size={15} /> Dr. {rdv.docteurPrenom} {rdv.docteurNom}
                                                </span>
                                            </td>
                                            <td style={{ color: "#94a3b8" }}>
                                                {rdv.docteurSpecialite || "Médecine générale"}
                                            </td>
                                            <td style={{ color: "#cbd5e1" }}>
                                                {rdv.motif || "Non spécifié"}
                                            </td>
                                            <td>
                                                {getStatusBadge(rdv.statut)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* ── 4. LISTE DES ORDONNANCES ── */}
            {path === "/patient/prescriptions" && (
                <div className="medicaments-panneau">
                    <button
                        onClick={() => navigate("/patient")}
                        className="btn-retour"
                        style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
                    >
                        <IconArrowLeft size={16} /> Retour à l'accueil
                    </button>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                        <div>
                            <h3 style={{ margin: "0 0 4px 0", fontSize: "1.25rem", fontWeight: 700, color: "#0f172a" }}>
                                Mes ordonnances médicales ({prescriptions.length})
                            </h3>
                            <p style={{ margin: 0, opacity: 0.8, fontSize: "0.85rem" }}>
                                Retrouvez le détail de vos prescriptions et téléchargez vos ordonnances officielles.
                            </p>
                        </div>
                    </div>

                    {isLoadingPrescriptions ? (
                        <div style={{ padding: "40px", textAlign: "center", color: "#0f766e", fontWeight: 600 }}>
                            Chargement de vos ordonnances...
                        </div>
                    ) : prescriptions.length === 0 ? (
                        <div style={{
                            padding: "50px 20px",
                            textAlign: "center",
                            background: "rgba(255, 255, 255, 0.08)",
                            borderRadius: "16px",
                            border: "1px dashed rgba(255, 255, 255, 0.25)"
                        }}>
                            <div style={{ display: "flex", justifyContent: "center", marginBottom: "10px" }}>
                                <IconPrescription size={44} />
                            </div>
                            <h4 style={{ margin: "0 0 6px 0", color: "#0f172a", fontSize: "1.1rem" }}>Aucune ordonnance archivée</h4>
                            <p style={{ margin: 0, opacity: 0.8, fontSize: "0.85rem" }}>
                                Vos ordonnances délivrées par votre praticien s'afficheront ici après vos consultations.
                            </p>
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                            {prescriptions.map((ord) => (
                                <div key={ord.idOrdonnance} className="ordonnance-card">
                                    <div className="ordonnance-meta">
                                        <div>
                                            <span className="font-mono font-tabular ordonnance-tag">
                                                ORDONNANCE N° {ord.idOrdonnance} • {formatFrenchDate(ord.dateCreation)}
                                            </span>
                                            <h4 className="ordonnance-title">
                                                Dr. {ord.docteurPrenom} {ord.docteurNom} ({ord.docteurSpecialite || "Médecin traitant"})
                                            </h4>
                                            <span className="ordonnance-subtitle">
                                                Diagnostic associé : <strong>{ord.diagnostic || "Général"}</strong>
                                            </span>
                                        </div>
                                        <button
                                            type="button"
                                            className="btn-ord-print"
                                            onClick={() => setPrintPrescription(ord)}
                                        >
                                            <IconPrint size={14} /> Imprimer / Télécharger
                                        </button>
                                    </div>

                                    <div style={{ width: "100%", overflowX: "auto" }}>
                                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.88rem" }}>
                                            <thead>
                                                <tr style={{ borderBottom: "1px solid #e2e8f0", color: "#64748b", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.03em" }}>
                                                    <th style={{ padding: "10px 8px", textAlign: "left" }}>Médicament</th>
                                                    <th style={{ padding: "10px 8px", textAlign: "left" }}>Posologie</th>
                                                    <th style={{ padding: "10px 8px", textAlign: "left" }}>Fréquence</th>
                                                    <th style={{ padding: "10px 8px", textAlign: "left" }}>Durée</th>
                                                    <th style={{ padding: "10px 8px", textAlign: "center" }}>Qté</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {ord.items && ord.items.map((it, idx) => (
                                                    <tr key={it.idPrescription || idx} style={{ borderBottom: "1px solid #f1f5f9" }}>
                                                        <td style={{ padding: "12px 8px", fontWeight: 600, color: "#1e293b" }}>
                                                            <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                                                                <IconPills size={14} style={{ color: "#0284c7" }} /> {it.nomMedicament}
                                                            </span>
                                                            <span style={{ color: "#64748b", fontWeight: 400, marginLeft: "6px" }}>({it.dosageMedicament})</span>
                                                        </td>
                                                        <td style={{ padding: "12px 8px", color: "#334155" }}>{it.posologie}</td>
                                                        <td style={{ padding: "12px 8px", color: "#334155" }}>{it.frequence}</td>
                                                        <td style={{ padding: "12px 8px", color: "#334155" }}>{it.duree}</td>
                                                        <td className="font-tabular" style={{ padding: "12px 8px", textAlign: "center", fontWeight: 700, color: "#0284c7" }}>
                                                            {it.quantite}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Modal Impression Ordonnance */}
            {printPrescription && (
                <div className="modal-overlay" onClick={() => setPrintPrescription(null)}>
                    <div className="modal-glass printable-ordonnance" onClick={(e) => e.stopPropagation()} style={{ background: "#ffffff", color: "#1f2937", maxWidth: "660px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "2px solid #0879f9", paddingBottom: "14px", marginBottom: "20px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                <div style={{ color: "#0879f9" }}>
                                    <LogoAlZahraoui size={38} />
                                </div>
                                <div>
                                    <h2 style={{ margin: 0, color: "#0879f9", fontSize: "1.4rem", letterSpacing: "1px" }}>CABINET MÉDICAL AL-ZAHRAOUI</h2>
                                    <p style={{ margin: "3px 0 0", fontSize: "0.85rem", color: "#4b5563" }}>Dr. {printPrescription.docteurPrenom} {printPrescription.docteurNom} — {printPrescription.docteurSpecialite || "Médecine générale"}</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                className="print-hide"
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
                                <strong style={{ color: "#111827" }}>Date d'émission :</strong> {formatFrenchDate(printPrescription.dateCreation)}
                            </div>
                        </div>

                        <h3 style={{ borderBottom: "1px solid #e5e7eb", paddingBottom: "8px", fontSize: "1.05rem", color: "#111827" }}>PRESCRIPTION MÉDICALE OFFICIELLE</h3>
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
                                    Dr. {printPrescription.docteurPrenom} {printPrescription.docteurNom}
                                </div>
                            </div>
                        </div>

                        <div className="print-hide" style={{ display: "flex", gap: "10px", marginTop: "24px", borderTop: "1px solid #e5e7eb", paddingTop: "16px" }}>
                            <button
                                type="button"
                                style={{
                                    flex: 1,
                                    padding: "10px 16px",
                                    borderRadius: "10px",
                                    background: "#0879f9",
                                    color: "white",
                                    border: "none",
                                    fontWeight: 700,
                                    cursor: "pointer",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: "8px"
                                }}
                                onClick={() => window.print()}
                            >
                                <IconPrint size={16} /> Lancer l'impression
                            </button>
                            <button
                                type="button"
                                style={{
                                    padding: "10px 16px",
                                    borderRadius: "10px",
                                    background: "#f3f4f6",
                                    color: "#374151",
                                    border: "1px solid #d1d5db",
                                    fontWeight: 600,
                                    cursor: "pointer"
                                }}
                                onClick={() => setPrintPrescription(null)}
                            >
                                Fermer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}

export default PatientDashboard;
