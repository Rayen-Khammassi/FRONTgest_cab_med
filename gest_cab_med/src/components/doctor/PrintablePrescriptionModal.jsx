/**
 * ============================================================================
 * FICHIER : PrintablePrescriptionModal.jsx
 * MODULE  : Espace Médecin - Impression Officielle d'Ordonnance Médicale
 * ============================================================================
 * RÔLE ET FONCTIONNALITÉS :
 * 1. Affiche la feuille d'ordonnance officielle standardisée pour impression A4.
 * 2. Comporte l'en-tête officiel du Cabinet Médical Al-Zahrawi avec logo vectoriel.
 * 3. Mentions légales et administratives du médecin prescripteur et du patient.
 * 4. Liste formalisée des médicaments avec posologies, fréquences et durées.
 * 5. Zone réservée à la signature et au cachet du praticien.
 * 6. Bouton d'impression déclenchant la boîte de dialogue native du navigateur (`window.print()`).
 * ============================================================================
 */

import { LogoAlZahrawi, IconClose, IconPrint } from "../MedicalIcons";

function PrintablePrescriptionModal({ prescription, user, onClose, formatFrenchDate }) {
    if (!prescription) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="modal-glass printable-ordonnance"
                onClick={(e) => e.stopPropagation()}
                style={{ background: "#ffffff", color: "#1f2937", maxWidth: "680px" }}
            >
                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "2px solid #0879f9", paddingBottom: "14px", marginBottom: "20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{ color: "#0879f9" }}>
                            <LogoAlZahrawi size={38} />
                        </div>
                        <div>
                            <h2 style={{ margin: 0, color: "#0879f9", fontSize: "1.4rem", letterSpacing: "1px" }}>CABINET MÉDICAL AL-ZAHRAWI</h2>
                            <p style={{ margin: "3px 0 0", fontSize: "0.85rem", color: "#4b5563" }}>
                                Dr. {user?.prenom} {user?.nom} — Médecine Générale &amp; Spécialisée
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        className="print-hide"
                        onClick={onClose}
                        style={{ background: "#f3f4f6", border: "none", borderRadius: "50%", width: "30px", height: "30px", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" }}
                        aria-label="Fermer"
                    >
                        <IconClose size={14} />
                    </button>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "24px", fontSize: "0.9rem" }}>
                    <div>
                        <strong style={{ color: "#111827" }}>Patient :</strong> {prescription.patientPrenom} {prescription.patientNom}
                    </div>
                    <div className="font-tabular">
                        <strong style={{ color: "#111827" }}>Date :</strong> {formatFrenchDate(prescription.dateCreation)}
                    </div>
                </div>

                <h3 style={{ borderBottom: "1px solid #e5e7eb", paddingBottom: "8px", fontSize: "1.05rem", color: "#111827" }}>PRESCRIPTION MÉDICALE</h3>
                <div style={{ margin: "20px 0" }}>
                    {prescription.items && prescription.items.map((it, idx) => (
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

                <div className="print-hide" style={{ display: "flex", gap: "10px", marginTop: "24px", borderTop: "1px solid #e5e7eb", paddingTop: "16px" }}>
                    <button
                        type="button"
                        style={{ flex: 1, padding: "10px 16px", borderRadius: "10px", background: "#0369a1", color: "white", border: "none", fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
                        onClick={() => window.print()}
                    >
                        <IconPrint size={16} /> Imprimer l'ordonnance
                    </button>
                    <button
                        type="button"
                        style={{ padding: "10px 16px", borderRadius: "10px", background: "#f3f4f6", color: "#374151", border: "1px solid #d1d5db", fontWeight: 600, cursor: "pointer" }}
                        onClick={onClose}
                    >
                        Fermer
                    </button>
                </div>
            </div>
        </div>
    );
}

export default PrintablePrescriptionModal;
