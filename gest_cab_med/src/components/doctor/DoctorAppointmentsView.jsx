/**
 * ============================================================================
 * FICHIER : DoctorAppointmentsView.jsx
 * MODULE  : Espace Médecin - Gestion et Planning des Rendez-vous
 * ============================================================================
 * RÔLE ET FONCTIONNALITÉS :
 * 1. Affiche le planning complet des consultations du praticien connecté.
 * 2. Visualisation des rendez-vous par date/heure, patient, motif et statut.
 * 3. Gestion des statuts :
 *    - 'DEMANDE' : Confirmation ou annulation directe.
 *    - 'CONFIRME' : Lancement direct de la consultation médicale ou modification.
 *    - 'ANNULE' : Modification ou rétablissement du créneau.
 *    - 'TERMINE' : Indicateur d'acte médical déjà réalisé.
 * 4. Déclenche l'ouverture de la modale d'édition globale (DoctorModals).
 * 5. Intègre le bouton d'actualisation manuelle en temps réel.
 * ============================================================================
 */

import {
    IconArrowLeft,
    IconRefresh,
    IconAppointmentCalendar,
    IconUser,
    IconCheck,
    IconClose,
    IconStethoscope,
    IconEdit
} from "../MedicalIcons";

function DoctorAppointmentsView({
    appointments,
    isLoadingAppointments,
    loadAppointments,
    actionMessage,
    navigate,
    handleUpdateStatus,
    handleOpenConsultationForRdv,
    setEditingRdv,
    getStatusBadge
}) {
    return (
        <div className="medicaments-panneau">
            <button onClick={() => navigate("/doctor")} className="btn-retour" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                <IconArrowLeft size={16} /> Retour à l'accueil
            </button>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h3 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 700, color: "#0f172a" }}>Planning des consultations</h3>
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
                <div style={{ padding: "40px", textAlign: "center", color: "#0f766e", fontWeight: 600 }}>
                    Chargement du planning...
                </div>
            ) : appointments.length === 0 ? (
                <div style={{ padding: "50px 20px", textAlign: "center", background: "rgba(255, 255, 255, 0.08)", borderRadius: "16px", border: "1px dashed rgba(255, 255, 255, 0.25)" }}>
                    <div style={{ display: "flex", justifyContent: "center", marginBottom: "10px" }}>
                        <IconAppointmentCalendar size={44} />
                    </div>
                    <h4 style={{ margin: "0 0 6px 0", color: "#0f172a", fontSize: "1.1rem" }}>Aucun rendez-vous dans votre agenda</h4>
                    <p style={{ margin: 0, color: "#64748b", fontSize: "0.85rem" }}>
                        Les demandes des patients adressées à votre cabinet s'afficheront ici.
                    </p>
                </div>
            ) : (
                <div style={{ width: "100%", overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.88rem" }}>
                        <thead>
                            <tr style={{ borderBottom: "2px solid #e2e8f0", background: "#f8fafc", color: "#475569", fontSize: "0.78rem", textTransform: "uppercase", fontWeight: 700 }}>
                                <th style={{ padding: "12px 10px" }}>Date &amp; Heure</th>
                                <th style={{ padding: "12px 10px" }}>Patient</th>
                                <th style={{ padding: "12px 10px" }}>Motif</th>
                                <th style={{ padding: "12px 10px" }}>Statut</th>
                                <th style={{ padding: "12px 10px", textAlign: "center" }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {appointments.map((rdv) => (
                                <tr key={rdv.idRdv} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.12)" }}>
                                    <td className="font-tabular" style={{ padding: "14px 10px", fontWeight: 700, color: "#0f172a" }}>
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

                                            {/* When CONFIRME: it is confirmed, and doctor can click 'Modifier' or 'Consulter' */}
                                            {rdv.statut === "CONFIRME" && (
                                                <>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleOpenConsultationForRdv(rdv)}
                                                        style={{ background: "#0369a1", border: "1px solid #075985", color: "#ffffff", padding: "6px 12px", borderRadius: "8px", fontSize: "0.8rem", fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "5px" }}
                                                    >
                                                        <IconStethoscope size={13} /> Consulter
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

                                            {/* When ANNULE: allow reactivating */}
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
    );
}

export default DoctorAppointmentsView;
