import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { medicamentApi } from "../services/medicamentApi";
import { getUser } from "../services/authService";
import DashboardLayout from "../components/DashboardLayout";
import ConfirmModal from "../components/ConfirmModal";
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
    const [medToDelete, setMedToDelete] = useState(null);
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

        if (!/\d/.test(dosage)) {
            setNotification({
                type: "erreur",
                texte: "Le dosage doit contenir une valeur numérique (ex : '500 mg', '10 ml', '1 g')."
            });
            return;
        }

        setEnregistrement(true);
        setNotification(null);

        try {
            if (idEdition !== null) {
                await medicamentApi.update(idEdition, { nom, dosage });
            } else {
                await medicamentApi.create({ nom, dosage });
            }

            annulerEdition();
            const charge = await charger(false);
            if (charge) {
                setNotification({
                    type: "succes",
                    texte: idEdition !== null
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

    function supprimer(medicament) {
        setMedToDelete(medicament);
    }

    async function confirmerSuppression() {
        if (!medToDelete) return;
        const med = medToDelete;
        setMedToDelete(null);
        setIdSuppression(med.idMedicament);
        setNotification(null);

        try {
            await medicamentApi.remove(med.idMedicament);
            if (idEdition === med.idMedicament) {
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
            title="Inventaire des Médicaments"
            subtitle="Consultez, enregistrez et modifiez les dosages et spécialités pharmaceutiques disponibles au cabinet."
        >
            <ConfirmModal
                isOpen={Boolean(medToDelete)}
                title="Supprimer un médicament"
                message={`Êtes-vous certain de vouloir supprimer « ${medToDelete?.nom} » (${medToDelete?.dosage}) de l'inventaire ? Cette action est irréversible.`}
                confirmText="Accepter"
                cancelText="Annuler"
                variant="danger"
                onConfirm={confirmerSuppression}
                onCancel={() => setMedToDelete(null)}
            />

            <div className="medicaments-conteneur">
                {notification && (
                    <div
                        className={`med-alerte ${notification.type === "succes" ? "med-alerte-succes" : "med-alerte-erreur"}`}
                        role="status"
                    >
                        <span className="med-alerte-icone">
                            {notification.type === "succes" ? <IconCheck size={18} /> : <IconAlert size={18} />}
                        </span>
                        <span className="med-alerte-texte">{notification.texte}</span>
                        <button
                            type="button"
                            className="med-alerte-fermer"
                            onClick={() => setNotification(null)}
                            aria-label="Fermer la notification"
                        >
                            <IconClose size={16} />
                        </button>
                    </div>
                )}

                <div className="medicaments-grille">
                    {/* Colonne 1 : Formulaire d'ajout / modification */}
                    <div className="medicaments-carte" ref={formulaireRef}>
                        <div className="medicaments-carte-en-tete">
                            <span className="medicaments-badge-icone">
                                {idEdition !== null ? <IconEdit size={18} /> : <IconPlus size={18} />}
                            </span>
                            <div>
                                <h3 className="medicaments-carte-titre">
                                    {idEdition !== null ? "Modifier le médicament" : "Ajouter un médicament"}
                                </h3>
                                <p className="medicaments-carte-sous-titre">
                                    {idEdition !== null
                                        ? "Mettez à jour la dénomination et le dosage dans la base."
                                        : "Enregistrez une nouvelle spécialité pharmaceutique."}
                                </p>
                            </div>
                        </div>

                        <form onSubmit={enregistrer} className="medicaments-formulaire" noValidate>
                            <div className="form-group">
                                <label htmlFor="nom-medicament" className="form-label">
                                    Dénomination commune (Nom) *
                                </label>
                                <input
                                    id="nom-medicament"
                                    type="text"
                                    className="form-control"
                                    placeholder="Ex : Paracétamol, Amoxicilline..."
                                    value={formulaire.nom}
                                    onChange={(e) => setFormulaire({ ...formulaire, nom: e.target.value })}
                                    disabled={enregistrement}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="dosage-medicament" className="form-label">
                                    Dosage &amp; Forme galénique *
                                </label>
                                <input
                                    id="dosage-medicament"
                                    type="text"
                                    className="form-control"
                                    placeholder="Ex : 500 mg, 1g comprimé, sirop..."
                                    value={formulaire.dosage}
                                    onChange={(e) => setFormulaire({ ...formulaire, dosage: e.target.value })}
                                    disabled={enregistrement}
                                    required
                                />
                            </div>

                            <div className="medicaments-formulaire-actions">
                                <button
                                    type="submit"
                                    className="btn-action-principal"
                                    disabled={enregistrement}
                                    style={{ flex: 1 }}
                                >
                                    <IconCheck size={16} />
                                    <span>
                                        {enregistrement
                                            ? "Enregistrement..."
                                            : idEdition !== null
                                                ? "Enregistrer les modifications"
                                                : "Ajouter au catalogue"}
                                    </span>
                                </button>
                                {idEdition !== null && (
                                    <button
                                        type="button"
                                        className="med-btn med-btn-secondaire"
                                        onClick={annulerEdition}
                                        disabled={enregistrement}
                                    >
                                        Annuler
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>

                    {/* Colonne 2 : Liste des médicaments */}
                    <div className="medicaments-carte">
                        <div className="medicaments-carte-en-tete" style={{ justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                <span className="medicaments-badge-icone">
                                    <IconPills size={18} />
                                </span>
                                <div>
                                    <h3 className="medicaments-carte-titre">
                                        Catalogue de la pharmacie
                                    </h3>
                                    <p className="medicaments-carte-sous-titre font-tabular">
                                        {medicaments.length} référence{medicaments.length > 1 ? "s" : ""} disponible{medicaments.length > 1 ? "s" : ""}
                                    </p>
                                </div>
                            </div>
                            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                                <button
                                    type="button"
                                    className="med-btn-refresh"
                                    onClick={() => charger(true)}
                                    disabled={chargement}
                                    title="Actualiser la liste"
                                >
                                    <IconRefresh size={14} className={chargement ? "animation-rotation" : ""} />
                                    <span>Actualiser</span>
                                </button>
                            </div>
                        </div>

                        {/* Barre de recherche */}
                        <div className="med-search-container">
                            <span className="med-search-icon" aria-hidden="true">
                                <IconSearch size={16} />
                            </span>
                            <input
                                type="search"
                                className="med-search-input"
                                placeholder="Rechercher par nom ou dosage..."
                                value={recherche}
                                onChange={(e) => setRecherche(e.target.value)}
                            />
                        </div>

                        {chargement ? (
                            <div style={{ padding: "40px", textAlign: "center", color: "var(--app-text-muted)" }}>
                                <div className="animation-rotation" style={{ display: "inline-block", marginBottom: "8px" }}>
                                    <IconRefresh size={28} />
                                </div>
                                <p style={{ margin: 0, fontSize: "0.9rem" }}>Chargement des médicaments...</p>
                            </div>
                        ) : medicamentsFiltres.length === 0 ? (
                            <div style={{ padding: "40px 20px", textAlign: "center", color: "var(--app-text-muted)" }}>
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
                                                    <div style={{ display: "inline-flex", gap: "8px", justifyContent: "flex-end" }}>
                                                        <button
                                                            type="button"
                                                            className="med-btn-edit"
                                                            onClick={() => modifier(m)}
                                                            disabled={enregistrement || idSuppression !== null}
                                                            title={`Modifier ${m.nom}`}
                                                        >
                                                            <IconEdit size={14} /> Modifier
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="med-btn-delete"
                                                            onClick={() => supprimer(m)}
                                                            disabled={enregistrement || idSuppression === m.idMedicament}
                                                            title={`Supprimer ${m.nom}`}
                                                        >
                                                            {idSuppression === m.idMedicament ? (
                                                                "Suppression..."
                                                            ) : (
                                                                <>
                                                                    <IconTrash size={14} /> Supprimer
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
