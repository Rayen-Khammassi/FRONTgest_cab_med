/**
 * ============================================================================
 * FICHIER : DoctorConsultationsView.jsx
 * MODULE  : Espace Médecin - Consultations Médicales & Diagnostics
 * ============================================================================
 * RÔLE ET FONCTIONNALITÉS :
 * 1. Affiche la liste chronologique des consultations médicales réalisées par le médecin.
 * 2. Présente chaque consultation sous forme de fiche détaillée :
 *    - Identité du patient, date de consultation, date de naissance.
 *    - Diagnostic médical posé.
 *    - Observations cliniques, constantes (tension, pouls, remarques).
 * 3. Actions par consultation :
 *    - Modification du diagnostic et des observations cliniques.
 *    - Rédaction instantanée d'une ordonnance médicamenteuse liée à la consultation.
 *    - Suppression définitive sécurisée de la consultation (icône corbeille dédiée)
 *      avec réinitialisation du rendez-vous associé en statut 'CONFIRMÉ'.
 * 4. Déclenche l'ouverture des modales globales gérées par DoctorModals.
 * ============================================================================
 */

import {
    IconArrowLeft,
    IconPlus,
    IconConsultation,
    IconEdit,
    IconPills,
    IconTrash
} from "../MedicalIcons";

function DoctorConsultationsView({
    consultations,
    isLoadingConsultations,
    navigate,
    setShowNewConsultationModal,
    setConsultationForm,
    setEditingConsultationModal,
    handleDeleteConsultation,
    setPrescriptionForm,
    setShowNewPrescriptionModal,
    availableMeds,
    formatFrenchDate
}) {
    return (
        <div className="medicaments-panneau">
            <button onClick={() => navigate("/doctor")} className="btn-retour" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                <IconArrowLeft size={16} /> Retour à l'accueil
            </button>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", marginBottom: "20px" }}>
                <div>
                    <h3 style={{ margin: "0 0 4px 0", fontSize: "1.25rem", fontWeight: 700, color: "#0f172a" }}>
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
                <div style={{ padding: "40px", textAlign: "center", color: "#0f766e", fontWeight: 600 }}>
                    Chargement des consultations...
                </div>
            ) : consultations.length === 0 ? (
                <div style={{ padding: "50px 20px", textAlign: "center", background: "rgba(255, 255, 255, 0.08)", borderRadius: "16px", border: "1px dashed rgba(255, 255, 255, 0.25)" }}>
                    <div style={{ display: "flex", justifyContent: "center", marginBottom: "10px" }}>
                        <IconConsultation size={44} />
                    </div>
                    <h4 style={{ margin: "0 0 6px 0", color: "#0f172a", fontSize: "1.1rem" }}>Aucune consultation enregistrée</h4>
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
                                    <span className="font-mono font-tabular ordonnance-tag">
                                        CONSULTATION #{c.idConsultation} • {formatFrenchDate(c.dateConsultation)}
                                    </span>
                                    <h4 className="ordonnance-title">
                                        Patient : {c.patientNom} {c.patientPrenom}
                                    </h4>
                                    <div className="ordonnance-subtitle">
                                        Né(e) le : {formatFrenchDate(c.patientDateNaissance)} • {c.patientEmail}
                                    </div>
                                </div>
                                <div className="ordonnance-actions-bar">
                                    <button
                                        type="button"
                                        className="btn-ord-edit"
                                        onClick={() => setEditingConsultationModal({
                                            idConsultation: c.idConsultation,
                                            diagnostic: c.diagnostic,
                                            observations: c.observations || ""
                                        })}
                                    >
                                        <IconEdit size={14} /> Modifier
                                    </button>
                                    <button
                                        type="button"
                                        className="btn-action-principal"
                                        style={{ minHeight: "36px", padding: "8px 16px", fontSize: "0.83rem" }}
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
                                    <button
                                        type="button"
                                        className="action-icon-btn action-deactivate"
                                        style={{ width: "36px", height: "36px", padding: 0, background: "rgba(239, 68, 68, 0.12)", color: "#ef4444", border: "1px solid rgba(239, 68, 68, 0.3)", borderRadius: "8px", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s ease" }}
                                        onClick={() => handleDeleteConsultation(c)}
                                        title="Supprimer la consultation"
                                        aria-label="Supprimer la consultation"
                                    >
                                        <IconTrash size={16} />
                                    </button>
                                </div>
                            </div>
                            <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", padding: "14px 16px", borderRadius: "12px", marginBottom: "12px" }}>
                                <strong style={{ color: "#0f766e", fontSize: "0.82rem", textTransform: "uppercase", display: "block", marginBottom: "4px", letterSpacing: "0.03em" }}>
                                    Diagnostic médical
                                </strong>
                                <p style={{ margin: 0, fontSize: "0.95rem", color: "#1e293b", fontWeight: 500 }}>{c.diagnostic}</p>
                            </div>
                            {c.observations && (
                                <div style={{ background: "#f1f5f9", border: "1px solid #e2e8f0", padding: "12px 16px", borderRadius: "10px" }}>
                                    <strong style={{ color: "#475569", fontSize: "0.78rem", textTransform: "uppercase", display: "block", marginBottom: "3px", letterSpacing: "0.03em" }}>
                                        Observations cliniques &amp; Antécédents
                                    </strong>
                                    <p style={{ margin: 0, fontSize: "0.88rem", color: "#334155", whiteSpace: "pre-line" }}>{c.observations}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default DoctorConsultationsView;
