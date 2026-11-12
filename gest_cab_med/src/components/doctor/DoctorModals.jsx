/**
 * ============================================================================
 * FICHIER : DoctorModals.jsx
 * MODULE  : Espace Médecin - Centralisation des Modales et Boîtes de Dialogue
 * ============================================================================
 * RÔLE ET FONCTIONNALITÉS :
 * 1. Regroupe et affiche toutes les fenêtres modales interactives de l'espace praticien
 *    au niveau racine du DashboardLayout (hors des panneaux à défilement ou animations).
 * 2. Évite tout piégeage de 'position: fixed' par le contexte CSS 'backdrop-filter' ou 'transform'.
 * 3. Permet l'ouverture fluide de modales transversales (ex: créer une ordonnance depuis une consultation,
 *    ou créer une consultation depuis la liste des rendez-vous).
 * 4. Modales incluses :
 *    - Modal 1 : Modifier / Reporter un rendez-vous (editingRdv)
 *    - Modal 2 : Rédiger une nouvelle consultation médicale (showNewConsultationModal)
 *    - Modal 3 : Modifier le diagnostic ou observations d'une consultation (editingConsultationModal)
 *    - Modal 4 : Rédiger une nouvelle ordonnance médicamenteuse (showNewPrescriptionModal)
 *    - Modal 5 : Modifier les lignes de prescription d'une ordonnance (editingPrescriptionModal)
 *    - Modal 6 : Fiche détaillée du dossier patient (selectedPatientModal)
 *    - Modal 7 : Création d'un nouveau patient (showNewPatientModal)
 *    - Modal 8 : Modification des coordonnées d'un patient (editingPatientModal)
 * ============================================================================
 */

import {
    IconClose,
    IconCheck,
    IconPlus,
    IconTrash,
    IconEdit,
    IconStethoscope,
    IconAlert
} from "../MedicalIcons";

function DoctorModals({
    // Appointments
    editingRdv,
    setEditingRdv,
    handleSaveModifiedRdv,
    // Consultations
    showNewConsultationModal,
    setShowNewConsultationModal,
    consultationForm,
    setConsultationForm,
    handleCreateConsultationSubmit,
    editingConsultationModal,
    setEditingConsultationModal,
    handleUpdateConsultationSubmit,
    appointments,
    // Prescriptions
    showNewPrescriptionModal,
    setShowNewPrescriptionModal,
    prescriptionForm,
    setPrescriptionForm,
    handleAddPrescriptionItem,
    handleRemovePrescriptionItem,
    handlePrescriptionItemChange,
    handleCreatePrescriptionSubmit,
    editingPrescriptionModal,
    setEditingPrescriptionModal,
    handleAddEditPrescriptionItem,
    handleRemoveEditPrescriptionItem,
    handleEditPrescriptionItemChange,
    handleUpdatePrescriptionSubmit,
    availableMeds,
    consultations,
    // Patients
    selectedPatientModal,
    setSelectedPatientModal,
    showNewPatientModal,
    setShowNewPatientModal,
    newPatientForm,
    setNewPatientForm,
    handleCreatePatientSubmit,
    editingPatientModal,
    setEditingPatientModal,
    handleUpdatePatientSubmit,
    navigate,
    formatFrenchDate
}) {
    return (
        <>
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

            {/* ── MODAL 3 : MODIFIER CONSULTATION MÉDICALE ── */}
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

            {/* ── MODAL 4 : NOUVELLE ORDONNANCE ── */}
            {showNewPrescriptionModal && (
                <div className="modal-overlay" onClick={() => setShowNewPrescriptionModal(false)}>
                    <div className="modal-glass" onClick={(e) => e.stopPropagation()}>
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

                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "20px 0 12px" }}>
                                <label style={{ fontSize: "0.84rem", fontWeight: 650, color: "#123f59", textTransform: "uppercase", letterSpacing: "0.02em" }}>
                                    Médicaments prescrits
                                </label>
                                <button
                                    type="button"
                                    className="btn-action-principal"
                                    onClick={handleAddPrescriptionItem}
                                    style={{ minHeight: "34px", padding: "6px 14px", fontSize: "0.8rem", borderRadius: "10px", display: "inline-flex", alignItems: "center", gap: "6px" }}
                                >
                                    <IconPlus size={14} /> Ajouter un médicament
                                </button>
                            </div>

                            <div style={{ maxHeight: "420px", overflowY: "auto", paddingRight: "4px" }}>
                                {prescriptionForm.items.map((item, index) => (
                                    <div key={index} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "16px", marginBottom: "14px" }}>
                                        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "12px", marginBottom: "12px" }}>
                                            <div className="form-champ" style={{ margin: 0 }}>
                                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                                                    <label style={{ margin: 0, fontSize: "0.82rem", fontWeight: 650, color: "#123f59" }}>
                                                        {item.isNew ? "Nouveau médicament (hors catalogue)" : "Médicament du catalogue"}
                                                    </label>
                                                    {!item.isNew ? (
                                                        <button
                                                            type="button"
                                                            onClick={() => handlePrescriptionItemChange(index, "isNew", true)}
                                                            style={{ background: "none", border: "none", color: "#087f9e", fontSize: "0.78rem", fontWeight: 600, cursor: "pointer", textDecoration: "underline" }}
                                                        >
                                                            + Nouveau médicament ?
                                                        </button>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            onClick={() => handlePrescriptionItemChange(index, "isNew", false)}
                                                            style={{ background: "none", border: "none", color: "#087f9e", fontSize: "0.78rem", fontWeight: 600, cursor: "pointer", textDecoration: "underline" }}
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
                                                        <option value="__NEW__" style={{ fontWeight: 700, color: "#087f9e" }}>
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

                                            <div className="form-champ" style={{ margin: 0 }}>
                                                <label style={{ margin: "0 0 4px 0", fontSize: "0.82rem", fontWeight: 650, color: "#123f59" }}>
                                                    Quantité (boîtes)
                                                </label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={item.quantite}
                                                    onChange={(e) => handlePrescriptionItemChange(index, "quantite", e.target.value)}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div style={{ display: "grid", gridTemplateColumns: prescriptionForm.items.length > 1 ? "1fr 1fr 1fr auto" : "1fr 1fr 1fr", gap: "12px", alignItems: "flex-end" }}>
                                            <div className="form-champ" style={{ margin: 0 }}>
                                                <label style={{ margin: "0 0 4px 0", fontSize: "0.82rem", fontWeight: 650, color: "#123f59" }}>Posologie</label>
                                                <input
                                                    type="text"
                                                    placeholder="Ex : 1 cp matin et soir"
                                                    value={item.posologie}
                                                    onChange={(e) => handlePrescriptionItemChange(index, "posologie", e.target.value)}
                                                    required
                                                />
                                            </div>
                                            <div className="form-champ" style={{ margin: 0 }}>
                                                <label style={{ margin: "0 0 4px 0", fontSize: "0.82rem", fontWeight: 650, color: "#123f59" }}>Fréquence</label>
                                                <input
                                                    type="text"
                                                    placeholder="Ex : Pendant les repas"
                                                    value={item.frequence}
                                                    onChange={(e) => handlePrescriptionItemChange(index, "frequence", e.target.value)}
                                                    required
                                                />
                                            </div>
                                            <div className="form-champ" style={{ margin: 0 }}>
                                                <label style={{ margin: "0 0 4px 0", fontSize: "0.82rem", fontWeight: 650, color: "#123f59" }}>Durée</label>
                                                <input
                                                    type="text"
                                                    placeholder="Ex : 7 jours"
                                                    value={item.duree}
                                                    onChange={(e) => handlePrescriptionItemChange(index, "duree", e.target.value)}
                                                    required
                                                />
                                            </div>
                                            {prescriptionForm.items.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemovePrescriptionItem(index)}
                                                    style={{ background: "#fee2e2", border: "1px solid #fecaca", color: "#dc2626", height: "46px", padding: "0 14px", borderRadius: "12px", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" }}
                                                    title="Supprimer cette ligne"
                                                >
                                                    <IconTrash size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

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

            {/* ── MODAL 5 : MODIFIER ORDONNANCE ── */}
            {editingPrescriptionModal && (
                <div className="modal-overlay" onClick={() => setEditingPrescriptionModal(null)}>
                    <div className="modal-glass" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                                <IconEdit size={18} /> Modifier l'Ordonnance #{editingPrescriptionModal.idOrdonnance}
                            </h3>
                            <button type="button" className="btn-close-modal" onClick={() => setEditingPrescriptionModal(null)}>
                                <IconClose size={16} />
                            </button>
                        </div>
                        <form onSubmit={handleUpdatePrescriptionSubmit}>
                            <div style={{ background: "#f0fdfa", border: "1px solid #ccfbf1", padding: "12px 16px", borderRadius: "12px", marginBottom: "16px", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
                                <div>
                                    <span style={{ fontSize: "0.74rem", fontWeight: 700, color: "#0f766e", textTransform: "uppercase", display: "block" }}>Patient</span>
                                    <div style={{ fontWeight: 700, color: "#0f172a", fontSize: "0.92rem" }}>
                                        {editingPrescriptionModal.patientPrenom} {editingPrescriptionModal.patientNom}
                                    </div>
                                </div>
                                <div>
                                    <span style={{ fontSize: "0.74rem", fontWeight: 700, color: "#0f766e", textTransform: "uppercase", display: "block" }}>Diagnostic</span>
                                    <div style={{ fontWeight: 600, color: "#087f9e", fontSize: "0.92rem" }}>
                                        {editingPrescriptionModal.diagnostic || "Général"}
                                    </div>
                                </div>
                                <div>
                                    <span style={{ fontSize: "0.74rem", fontWeight: 700, color: "#0f766e", textTransform: "uppercase", display: "block" }}>Date d'émission</span>
                                    <div className="font-tabular" style={{ fontWeight: 600, color: "#0f172a", fontSize: "0.92rem" }}>
                                        {formatFrenchDate(editingPrescriptionModal.dateCreation)}
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "20px 0 12px" }}>
                                <label style={{ fontSize: "0.84rem", fontWeight: 650, color: "#123f59", textTransform: "uppercase", letterSpacing: "0.02em" }}>
                                    Médicaments prescrits ({editingPrescriptionModal.items.length})
                                </label>
                                <button
                                    type="button"
                                    className="btn-action-principal"
                                    onClick={handleAddEditPrescriptionItem}
                                    style={{ minHeight: "34px", padding: "6px 14px", fontSize: "0.8rem", borderRadius: "10px", display: "inline-flex", alignItems: "center", gap: "6px" }}
                                >
                                    <IconPlus size={14} /> Ajouter une ligne
                                </button>
                            </div>

                            <div style={{ maxHeight: "420px", overflowY: "auto", paddingRight: "4px" }}>
                                {editingPrescriptionModal.items.map((item, index) => (
                                    <div key={index} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "16px", marginBottom: "14px" }}>
                                        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "12px", marginBottom: "12px" }}>
                                            <div className="form-champ" style={{ margin: 0 }}>
                                                <label style={{ margin: "0 0 4px 0", fontSize: "0.82rem", fontWeight: 650, color: "#123f59" }}>
                                                    Médicament
                                                </label>
                                                <select
                                                    value={item.idMedicament}
                                                    onChange={(e) => handleEditPrescriptionItemChange(index, "idMedicament", e.target.value)}
                                                    required
                                                >
                                                    <option value="">-- Choisir un médicament --</option>
                                                    {availableMeds.map((m) => (
                                                        <option key={m.idMedicament} value={m.idMedicament}>
                                                            {m.nom} ({m.dosage})
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="form-champ" style={{ margin: 0 }}>
                                                <label style={{ margin: "0 0 4px 0", fontSize: "0.82rem", fontWeight: 650, color: "#123f59" }}>
                                                    Quantité (boîtes)
                                                </label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={item.quantite}
                                                    onChange={(e) => handleEditPrescriptionItemChange(index, "quantite", e.target.value)}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div style={{ display: "grid", gridTemplateColumns: editingPrescriptionModal.items.length > 1 ? "1fr 1fr 1fr auto" : "1fr 1fr 1fr", gap: "12px", alignItems: "flex-end" }}>
                                            <div className="form-champ" style={{ margin: 0 }}>
                                                <label style={{ margin: "0 0 4px 0", fontSize: "0.82rem", fontWeight: 650, color: "#123f59" }}>Posologie</label>
                                                <input
                                                    type="text"
                                                    placeholder="Ex : 1 cp matin et soir"
                                                    value={item.posologie}
                                                    onChange={(e) => handleEditPrescriptionItemChange(index, "posologie", e.target.value)}
                                                    required
                                                />
                                            </div>
                                            <div className="form-champ" style={{ margin: 0 }}>
                                                <label style={{ margin: "0 0 4px 0", fontSize: "0.82rem", fontWeight: 650, color: "#123f59" }}>Fréquence</label>
                                                <input
                                                    type="text"
                                                    placeholder="Ex : Pendant les repas"
                                                    value={item.frequence}
                                                    onChange={(e) => handleEditPrescriptionItemChange(index, "frequence", e.target.value)}
                                                    required
                                                />
                                            </div>
                                            <div className="form-champ" style={{ margin: 0 }}>
                                                <label style={{ margin: "0 0 4px 0", fontSize: "0.82rem", fontWeight: 650, color: "#123f59" }}>Durée</label>
                                                <input
                                                    type="text"
                                                    placeholder="Ex : 7 jours"
                                                    value={item.duree}
                                                    onChange={(e) => handleEditPrescriptionItemChange(index, "duree", e.target.value)}
                                                    required
                                                />
                                            </div>
                                            {editingPrescriptionModal.items.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveEditPrescriptionItem(index)}
                                                    style={{ background: "#fee2e2", border: "1px solid #fecaca", color: "#dc2626", height: "46px", padding: "0 14px", borderRadius: "12px", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" }}
                                                    title="Supprimer cette ligne"
                                                >
                                                    <IconTrash size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                                <button type="submit" className="btn-action-principal" style={{ flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                                    <IconCheck size={16} /> Enregistrer les modifications
                                </button>
                                <button type="button" className="med-btn med-btn-secondaire" onClick={() => setEditingPrescriptionModal(null)}>
                                    Annuler
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── MODAL 6 : FICHE PATIENT DÉTAILLÉE ── */}
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

            {/* ── MODAL 7 : NOUVEAU PATIENT ── */}
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
                                        className="form-control font-tabular"
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

            {/* ── MODAL 8 : MODIFIER PATIENT ── */}
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
        </>
    );
}

export default DoctorModals;
