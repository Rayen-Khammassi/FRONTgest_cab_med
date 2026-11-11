/**
 * ============================================================================
 * FICHIER : DoctorPrescriptionsView.jsx
 * MODULE  : Espace Médecin - Ordonnances et Prescriptions Médicamenteuses
 * ============================================================================
 * RÔLE ET FONCTIONNALITÉS :
 * 1. Affiche l'ensemble des ordonnances médicales prescrites par le médecin.
 * 2. Visualisation tabulaire détaillée de chaque ligne de médicament :
 *    - Dénomination et dosage.
 *    - Posologie (ex: 1 cp matin et soir).
 *    - Fréquence (ex: pendant les repas).
 *    - Durée du traitement (ex: 7 jours).
 *    - Quantité de boîtes prescrites.
 * 3. Actions complètes :
 *    - Aperçu et impression officielle de l'ordonnance (PrintablePrescriptionModal).
 *    - Modification dynamique des lignes médicamenteuses (DoctorModals).
 *    - Suppression d'ordonnance avec confirmation sécurisée.
 * 4. Déclenche l'ouverture des modales globales gérées par DoctorModals.
 * ============================================================================
 */

import {
    IconArrowLeft,
    IconPlus,
    IconPrescription,
    IconPrint,
    IconEdit,
    IconTrash,
    IconPills
} from "../MedicalIcons";

function DoctorPrescriptionsView({
    prescriptions,
    isLoadingPrescriptions,
    navigate,
    setPrintPrescription,
    handleOpenEditPrescription,
    handleDeletePrescription,
    setPrescriptionForm,
    setShowNewPrescriptionModal,
    availableMeds,
    consultations,
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
                        Ordonnances Médicales ({prescriptions.length})
                    </h3>
                    <p style={{ margin: 0, opacity: 0.8, fontSize: "0.85rem" }}>
                        Rédigez, modifiez et imprimez des ordonnances médicamenteuses officielles.
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
                <div style={{ padding: "40px", textAlign: "center", color: "#0f766e", fontWeight: 600 }}>
                    Chargement des ordonnances...
                </div>
            ) : prescriptions.length === 0 ? (
                <div style={{ padding: "50px 20px", textAlign: "center", background: "rgba(255, 255, 255, 0.08)", borderRadius: "16px", border: "1px dashed rgba(255, 255, 255, 0.25)" }}>
                    <div style={{ display: "flex", justifyContent: "center", marginBottom: "10px" }}>
                        <IconPrescription size={44} />
                    </div>
                    <h4 style={{ margin: "0 0 6px 0", color: "#0f172a", fontSize: "1.1rem" }}>Aucune ordonnance émise</h4>
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
                                    <span className="font-mono font-tabular ordonnance-tag">
                                        ORDONNANCE #{ord.idOrdonnance} • {formatFrenchDate(ord.dateCreation)}
                                    </span>
                                    <h4 className="ordonnance-title">
                                        Patient : {ord.patientNom} {ord.patientPrenom}
                                    </h4>
                                    <span className="ordonnance-subtitle">
                                        Diagnostic associé : <strong>{ord.diagnostic || "Général"}</strong>
                                    </span>
                                </div>
                                <div className="ordonnance-actions-bar">
                                    <button
                                        type="button"
                                        className="btn-ord-print"
                                        onClick={() => setPrintPrescription(ord)}
                                    >
                                        <IconPrint size={14} /> Imprimer / Aperçu
                                    </button>
                                    <button
                                        type="button"
                                        className="btn-ord-edit"
                                        onClick={() => handleOpenEditPrescription(ord)}
                                    >
                                        <IconEdit size={14} /> Modifier
                                    </button>
                                    <button
                                        type="button"
                                        className="btn-ord-delete"
                                        onClick={() => handleDeletePrescription(ord)}
                                    >
                                        <IconTrash size={14} /> Supprimer
                                    </button>
                                </div>
                            </div>

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
                    ))}
                </div>
            )}
        </div>
    );
}

export default DoctorPrescriptionsView;
