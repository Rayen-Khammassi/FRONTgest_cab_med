/**
 * ============================================================================
 * FICHIER : DoctorPatientsView.jsx
 * MODULE  : Espace Médecin - Registre et Dossiers des Patients
 * ============================================================================
 * RÔLE ET FONCTIONNALITÉS :
 * 1. Affiche le registre exhaustif des patients suivis par le cabinet.
 * 2. Moteur de recherche instantané par nom, prénom ou email.
 * 3. Affichage tabulaire avec statuts (Actif / Inactif), coordonnées, compteurs de RDV et consultations.
 * 4. Actions médicales et administratives :
 *    - Fiche détaillée (Dossier médical complet avec antécédents et raccourci vers les consultations).
 *    - Édition des coordonnées du patient.
 *    - Activation / Désactivation sécurisée du compte patient avec confirmation.
 * 5. Déclenche l'ouverture des modales globales gérées par DoctorModals.
 * ============================================================================
 */

import {
    IconArrowLeft,
    IconPlus,
    IconSearch,
    IconPatientDossier,
    IconUser,
    IconCheck,
    IconClose,
    IconEye,
    IconEdit,
    IconTrash
} from "../MedicalIcons";

function DoctorPatientsView({
    patients,
    filteredPatients,
    patientSearch,
    setPatientSearch,
    isLoadingPatients,
    setShowNewPatientModal,
    setSelectedPatientModal,
    setEditingPatientModal,
    handleTogglePatientStatus,
    navigate,
    formatFrenchDate
}) {
    return (
        <div className="medicaments-panneau">
            <button onClick={() => navigate("/doctor")} className="btn-retour" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                <IconArrowLeft size={16} /> Retour à l'accueil
            </button>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", marginBottom: "20px" }}>
                <div>
                    <h3 style={{ margin: "0 0 4px 0", fontSize: "1.3rem", fontWeight: 700, color: "#0f172a" }}>
                        Registre des Patients ({patients.length})
                    </h3>
                    <p style={{ margin: 0, color: "#64748b", fontSize: "0.88rem" }}>
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
    );
}

export default DoctorPatientsView;
