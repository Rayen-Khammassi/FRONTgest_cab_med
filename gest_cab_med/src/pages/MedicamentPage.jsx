import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { medicamentApi } from "../services/medicamentApi";
import { getUser } from "../services/authService";
import DashboardLayout from "../components/DashboardLayout";
import {
    IconPills,
    IconPlus,
    IconEdit,
    IconTrash,
    IconCheck,
    IconClose,
    IconRefresh,
    IconAlert,
    IconSearch
} from "../components/MedicalIcons";
import "./MedicamentPage.css";

const formulaireVide = { nom: "", dosage: "" };

export default function MedicamentPage() {
    const user = getUser();
    const [medicaments, setMedicaments] = useState([]);
    const [formulaire, setFormulaire] = useState(formulaireVide);
    const [idEdition, setIdEdition] = useState(null);
    const [recherche, setRecherche] = useState("");
    const [chargement, setChargement] = useState(true);
    const [enregistrement, setEnregistrement] = useState(false);
    const [idSuppression, setIdSuppression] = useState(null);
    const [notification, setNotification] = useState(null);
    const formulaireRef = useRef(null);

    const charger = useCallback(async (afficherChargement = true) => {
        if (afficherChargement) setChargement(true);
        try {
            const resultats = await medicamentApi.list();
            setMedicaments(Array.isArray(resultats) ? resultats : []);
            return true;
        } catch (erreur) {
            setNotification({ type: "erreur", texte: erreur.message });
            return false;
        } finally {
            if (afficherChargement) setChargement(false);
        }
    }, []);

    useEffect(() => {
        let isCancelled = false;
        (async () => {
            try {
                const resultats = await medicamentApi.list();
                if (!isCancelled) {
                    setMedicaments(Array.isArray(resultats) ? resultats : []);
                }
            } catch (erreur) {
                if (!isCancelled) {
                    setNotification({ type: "erreur", texte: erreur.message });
                }
            } finally {
                if (!isCancelled) {
                    setChargement(false);
                }
            }
        })();
        return () => {
            isCancelled = true;
        };
    }, []);

    const medicamentsFiltres = useMemo(() => {
        const texte = recherche.trim().toLocaleLowerCase("fr");
        return medicaments.filter((medicament) =>
            `${medicament.nom} ${medicament.dosage}`.toLocaleLowerCase("fr").includes(texte)
        );
    }, [medicaments, recherche]);

    function annulerEdition() {
        setIdEdition(null);
        setFormulaire(formulaireVide);
    }

    function modifier(medicament) {
        setIdEdition(medicament.idMedicament);
        setFormulaire({ nom: medicament.nom, dosage: medicament.dosage });
        setNotification(null);
        formulaireRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    async function enregistrer(event) {
        event.preventDefault();
        const nom = formulaire.nom.trim();
        const dosage = formulaire.dosage.trim();

        if (!nom || !dosage) {
            setNotification({
                type: "erreur",
                texte: "Le nom et le dosage sont obligatoires."
            });
            return;
        }

        setEnregistrement(true);
        setNotification(null);

        try {
            const enModification = idEdition !== null;
            const payload = { nom, dosage };

            if (enModification) {
                await medicamentApi.update(idEdition, payload);
            } else {
                await medicamentApi.create(payload);
            }

            annulerEdition();
            const charge = await charger(false);
            if (charge) {
                setNotification({
                    type: "succes",
                    texte: enModification
                        ? "Médicament modifié avec succès."
                        : "Médicament ajouté avec succès au catalogue."
                });
            }
        } catch (erreur) {
            setNotification({ type: "erreur", texte: erreur.message });
        } finally {
            setEnregistrement(false);
        }
    }

    async function supprimer(medicament) {
        const confirme = window.confirm(
            `Supprimer « ${medicament.nom} » (${medicament.dosage}) de l'inventaire ?`
        );
        if (!confirme) return;

        setIdSuppression(medicament.idMedicament);
        setNotification(null);

        try {
            await medicamentApi.remove(medicament.idMedicament);
            if (idEdition === medicament.idMedicament) {
                annulerEdition();
            }
            const charge = await charger(false);
            if (charge) {
                setNotification({
                    type: "succes",
                    texte: "Médicament supprimé avec succès."
                });
            }
        } catch (erreur) {
            setNotification({ type: "erreur", texte: erreur.message });
        } finally {
            setIdSuppression(null);
        }
    }

    const userRole = user?.role || "DOCTEUR";

    return (
        <DashboardLayout
            role={userRole}
            title="Pharmacie & Médicaments"
            subtitle="Inventaire de la pharmacie, dosages et gestion des références médicales en temps réel."
        >
            <div className="medicaments-dashboard-wrapper">
                {/* Intro summary stat card */}
                <div className="medicaments-stats-bar">
                    <div className="medicaments-summary-text">
                        <span className="app-badge badge-primary">CATALOGUE OFFICIEL</span>
                        <p style={{ margin: "6px 0 0", color: "var(--app-text-muted)", fontSize: "0.9rem" }}>
                            Gérez les références du cabinet médical. Toutes les entrées sont instantanément disponibles pour les ordonnances.
                        </p>
                    </div>
                    <div className="medicaments-stat-pill">
                        <div className="medicaments-stat-icon-wrap">
                            <IconPills size={22} />
                        </div>
                        <div>
                            <strong className="font-tabular">{medicaments.length}</strong>
                            <span>référence{medicaments.length !== 1 ? "s" : ""} active{medicaments.length !== 1 ? "s" : ""}</span>
                        </div>
                    </div>
                </div>

                {/* Notifications */}
                {notification && (
                    <div className={`medicaments-notice medicaments-notice-${notification.type}`} role="status">
                        <span className="medicaments-notice-icone">
                            {notification.type === "succes" && <IconCheck size={16} />}
                            {notification.type === "erreur" && <IconClose size={16} />}
                            {notification.type === "info" && <IconAlert size={16} />}
                        </span>
                        <span style={{ flex: 1, fontWeight: 500 }}>{notification.texte}</span>
                        <button
                            type="button"
                            className="btn-link"
                            onClick={() => setNotification(null)}
                            style={{ background: "none", border: "none", cursor: "pointer", display: "inline-flex", alignItems: "center" }}
                            aria-label="Fermer la notification"
                        >
                            <IconClose size={14} />
                        </button>
                    </div>
                )}

                {/* Main 2-column grid */}
                <div className="medicaments-grille">
                    {/* ── Formulaire d'ajout / modification ── */}
                    <div ref={formulaireRef} className="medicaments-form-card">
                        <form onSubmit={enregistrer} noValidate>
                            <h3 className="medicaments-form-title" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <span>{idEdition !== null ? <IconEdit size={18} /> : <IconPlus size={18} />}</span>
                                {idEdition !== null ? "Modifier la référence" : "Ajouter un médicament"}
                            </h3>

                            <div className="form-group" style={{ marginBottom: "16px" }}>
                                <label className="form-label" htmlFor="med-nom">
                                    Nom du médicament *
                                </label>
                                <input
                                    id="med-nom"
                                    type="text"
                                    className="form-control"
                                    placeholder="Ex: Paracétamol, Amoxicilline..."
                                    value={formulaire.nom}
                                    onChange={(e) => setFormulaire((prev) => ({ ...prev, nom: e.target.value }))}
                                    disabled={enregistrement}
                                    autoComplete="off"
                                />
                            </div>

                            <div className="form-group" style={{ marginBottom: "20px" }}>
                                <label className="form-label" htmlFor="med-dosage">
                                    Dosage & Forme *
                                </label>
                                <input
                                    id="med-dosage"
                                    type="text"
                                    className="form-control"
                                    placeholder="Ex: 500 mg gélule, 1g cp effervescent..."
                                    value={formulaire.dosage}
                                    onChange={(e) => setFormulaire((prev) => ({ ...prev, dosage: e.target.value }))}
                                    disabled={enregistrement}
                                    autoComplete="off"
                                />
                            </div>

                            <div className="med-actions">
                                <button
                                    type="submit"
                                    className="btn btn-primary btn-action-principal"
                                    disabled={enregistrement}
                                    style={{ flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
                                >
                                    {enregistrement ? (
                                        "Enregistrement..."
                                    ) : idEdition !== null ? (
                                        <>
                                            <IconCheck size={15} /> Sauvegarder
                                        </>
                                    ) : (
                                        <>
                                            <IconPlus size={15} /> Ajouter à l'inventaire
                                        </>
                                    )}
                                </button>

                                {idEdition !== null && (
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={annulerEdition}
                                        disabled={enregistrement}
                                    >
                                        Annuler
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>

                    {/* ── Liste & Recherche ── */}
                    <div className="medicaments-list-card">
                        <div className="medicaments-list-header">
                            <div className="search-box" style={{ flex: 1, minWidth: "220px", display: "flex", alignItems: "center" }}>
                                <IconSearch size={16} style={{ position: "absolute", marginLeft: "12px", color: "var(--muted)" }} />
                                <input
                                    type="search"
                                    className="form-control"
                                    placeholder="Rechercher par nom ou dosage..."
                                    value={recherche}
                                    onChange={(e) => setRecherche(e.target.value)}
                                    style={{ paddingLeft: "36px" }}
                                />
                            </div>
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => charger(true)}
                                disabled={chargement}
                                style={{ padding: "8px 14px", fontSize: "0.85rem", display: "inline-flex", alignItems: "center", gap: "6px" }}
                            >
                                <IconRefresh size={14} /> Actualiser
                            </button>
                        </div>

                        {chargement ? (
                            <div className="empty-state">
                                <div className="loading-spinner" />
                                <p style={{ marginTop: "12px", color: "var(--app-text-muted)" }}>
                                    Chargement de l'inventaire...
                                </p>
                            </div>
                        ) : medicamentsFiltres.length === 0 ? (
                            <div className="empty-state">
                                <IconPills size={48} />
                                <h4 style={{ margin: "14px 0 6px", color: "var(--app-text-main)" }}>
                                    {recherche ? "Aucun médicament trouvé" : "Aucun médicament enregistré"}
                                </h4>
                                <p style={{ color: "var(--app-text-muted)", fontSize: "0.88rem" }}>
                                    {recherche ? "Essayez une autre recherche." : "Ajoutez votre premier médicament à l'aide du formulaire."}
                                </p>
                            </div>
                        ) : (
                            <div className="table-responsive" style={{ maxHeight: "480px", overflowY: "auto" }}>
                                <table className="app-table">
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Médicament</th>
                                            <th>Dosage</th>
                                            <th style={{ textAlign: "right" }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {medicamentsFiltres.map((m) => (
                                            <tr key={m.idMedicament} className={idEdition === m.idMedicament ? "row-editing" : ""}>
                                                <td className="font-mono font-tabular" style={{ color: "var(--app-text-muted)", fontSize: "0.82rem" }}>
                                                    #{m.idMedicament}
                                                </td>
                                                <td>
                                                    <strong style={{ color: "var(--app-text-main)", fontSize: "0.95rem" }}>
                                                        {m.nom}
                                                    </strong>
                                                </td>
                                                <td>
                                                    <span className="app-badge badge-primary">
                                                        {m.dosage}
                                                    </span>
                                                </td>
                                                <td style={{ textAlign: "right" }}>
                                                    <div style={{ display: "inline-flex", gap: "6px" }}>
                                                        <button
                                                            type="button"
                                                            className="btn btn-secondary"
                                                            style={{ padding: "5px 10px", fontSize: "0.8rem", display: "inline-flex", alignItems: "center", gap: "5px" }}
                                                            onClick={() => modifier(m)}
                                                            disabled={enregistrement || idSuppression !== null}
                                                        >
                                                            <IconEdit size={13} /> Modifier
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="btn btn-danger"
                                                            style={{ padding: "5px 10px", fontSize: "0.8rem", display: "inline-flex", alignItems: "center", gap: "5px" }}
                                                            onClick={() => supprimer(m)}
                                                            disabled={enregistrement || idSuppression === m.idMedicament}
                                                        >
                                                            {idSuppression === m.idMedicament ? (
                                                                "..."
                                                            ) : (
                                                                <>
                                                                    <IconTrash size={13} /> Supprimer
                                                                </>
                                                            )}
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
                </div>
            </div>
        </DashboardLayout>
    );
}
