import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { medicamentApi } from "../services/medicamentApi";
import "./MedicamentPage.css";

const formulaireVide = { nom: "", dosage: "" };

export default function MedicamentPage() {
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
        charger();
    }, [charger]);

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
            setNotification({ type: "erreur", texte: "Le nom et le dosage sont obligatoires." });
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
                    texte: enModification ? "Médicament modifié avec succès." : "Médicament ajouté avec succès.",
                });
            }
        } catch (erreur) {
            setNotification({ type: "erreur", texte: erreur.message });
        } finally {
            setEnregistrement(false);
        }
    }

    async function supprimer(medicament) {
        const confirme = window.confirm(`Supprimer « ${medicament.nom} » du catalogue ?`);
        if (!confirme) return;

        setIdSuppression(medicament.idMedicament);
        setNotification(null);

        try {
            await medicamentApi.remove(medicament.idMedicament);
            if (idEdition === medicament.idMedicament) annulerEdition();
            const charge = await charger(false);
            if (charge) {
                setNotification({ type: "succes", texte: "Médicament supprimé avec succès." });
            }
        } catch (erreur) {
            setNotification({ type: "erreur", texte: erreur.message });
        } finally {
            setIdSuppression(null);
        }
    }

    return (
        <main className="medicaments-page">
            <div className="medicaments-ambiance" aria-hidden="true">
                <span className="medicaments-orbe medicaments-orbe-1" />
                <span className="medicaments-orbe medicaments-orbe-2" />
                <span className="medicaments-decor medicaments-decor-1">✚</span>
                <span className="medicaments-decor medicaments-decor-2">✚</span>
                <span className="medicaments-decor medicaments-decor-3">♡</span>
            </div>

            <div className="medicaments-container">
                <header className="medicaments-barre">
                    <div className="medicaments-marque">
                        <span className="medicaments-logo" aria-hidden="true">✚</span>
                        <div>
                            <strong>GESTCABMED</strong>
                            <small>Système de gestion médicale</small>
                        </div>
                    </div>
                    <span className="medicaments-etiquette">Gestion du cabinet</span>
                </header>

                <section className="medicaments-intro">
                    <div>
                        <p className="medicaments-surtitre">CATALOGUE MÉDICAL</p>
                        <h1>Gestion des <span>médicaments</span></h1>
                        <p className="medicaments-description">
                            Ajoutez, consultez et mettez à jour les références de votre cabinet.
                        </p>
                    </div>
                    <div className="medicaments-stat">
                        <span className="medicaments-stat-icone" aria-hidden="true">✚</span>
                        <div>
                            <strong>{medicaments.length}</strong>
                            <span>médicament{medicaments.length !== 1 ? "s" : ""} enregistré{medicaments.length !== 1 ? "s" : ""}</span>
                        </div>
                    </div>
                </section>

                {notification && (
                    <div className={`medicaments-notice medicaments-notice-${notification.type}`} role={notification.type === "erreur" ? "alert" : "status"}>
                        <span aria-hidden="true">{notification.type === "erreur" ? "!" : "✓"}</span>
                        {notification.texte}
                        <button type="button" aria-label="Fermer le message" onClick={() => setNotification(null)}>×</button>
                    </div>
                )}

                <div className="medicaments-grille">
                    <section className="medicaments-panneau medicaments-panneau-formulaire" ref={formulaireRef}>
                        <div className="medicaments-titre-panneau">
                            <span className="medicaments-icone-panneau" aria-hidden="true">{idEdition === null ? "+" : "✎"}</span>
                            <div>
                                <h2>{idEdition === null ? "Ajouter un médicament" : "Modifier un médicament"}</h2>
                                <p>{idEdition === null ? "Complétez les informations ci-dessous" : `Modification de la référence #${idEdition}`}</p>
                            </div>
                        </div>

                        <form className="medicaments-formulaire" onSubmit={enregistrer}>
                            <label htmlFor="medicament-nom">Nom du médicament</label>
                            <input
                                id="medicament-nom"
                                type="text"
                                autoComplete="off"
                                required
                                maxLength={150}
                                placeholder="Ex. Paracétamol"
                                value={formulaire.nom}
                                onChange={(e) => setFormulaire((prev) => ({ ...prev, nom: e.target.value }))}
                            />

                            <label htmlFor="medicament-dosage">Dosage</label>
                            <input
                                id="medicament-dosage"
                                type="text"
                                autoComplete="off"
                                required
                                maxLength={100}
                                placeholder="Ex. 500 mg"
                                value={formulaire.dosage}
                                onChange={(e) => setFormulaire((prev) => ({ ...prev, dosage: e.target.value }))}
                            />

                            <button className="medicaments-bouton-principal" type="submit" disabled={enregistrement}>
                                {enregistrement ? "Enregistrement…" : idEdition === null ? "+ Ajouter au catalogue" : "✓ Enregistrer les modifications"}
                            </button>
                            {idEdition !== null && (
                                <button className="medicaments-bouton-secondaire" type="button" onClick={annulerEdition} disabled={enregistrement}>
                                    Annuler la modification
                                </button>
                            )}
                        </form>
                    </section>

                    <section className="medicaments-panneau medicaments-panneau-tableau">
                        <div className="medicaments-titre-panneau medicaments-entete-liste">
                            <div>
                                <h2>Liste des médicaments</h2>
                                <p>Retrouvez rapidement les références enregistrées</p>
                            </div>
                            <button className="medicaments-bouton-secondaire" type="button" onClick={() => charger()} disabled={chargement}>
                                ↻ Actualiser
                            </button>
                        </div>

                        <div className="medicaments-recherche">
                            <span aria-hidden="true">⌕</span>
                            <input
                                aria-label="Rechercher un médicament"
                                type="search"
                                value={recherche}
                                onChange={(e) => setRecherche(e.target.value)}
                                placeholder="Rechercher par nom ou dosage..."
                            />
                        </div>

                        <div className="medicaments-table-scroll">
                            <table className="medicaments-table">
                                <thead>
                                <tr>
                                    <th scope="col">ID</th>
                                    <th scope="col">Médicament</th>
                                    <th scope="col">Dosage</th>
                                    <th scope="col">Actions</th>
                                </tr>
                                </thead>
                                <tbody>
                                {chargement ? (
                                    <tr><td className="medicaments-vide" colSpan={4}>Chargement des médicaments…</td></tr>
                                ) : medicamentsFiltres.length === 0 ? (
                                    <tr><td className="medicaments-vide" colSpan={4}>
                                        {recherche ? "Aucun médicament ne correspond à votre recherche." : "Aucun médicament enregistré pour le moment."}
                                    </td></tr>
                                ) : (
                                    medicamentsFiltres.map((medicament) => (
                                        <tr key={medicament.idMedicament}>
                                            <td><span className="medicaments-id">#{medicament.idMedicament}</span></td>
                                            <td><span className="medicaments-nom">{medicament.nom}</span></td>
                                            <td><span className="medicaments-dosage">{medicament.dosage}</span></td>
                                            <td>
                                                <div className="medicaments-actions">
                                                    <button type="button" className="medicaments-action-edit" onClick={() => modifier(medicament)} disabled={enregistrement || idSuppression !== null}>Modifier</button>
                                                    <button type="button" className="medicaments-action-delete" onClick={() => supprimer(medicament)} disabled={enregistrement || idSuppression !== null}>
                                                        {idSuppression === medicament.idMedicament ? "Suppression…" : "Supprimer"}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                                </tbody>
                            </table>
                        </div>
                        <p className="medicaments-pied-tableau">
                            {medicamentsFiltres.length} résultat{medicamentsFiltres.length !== 1 ? "s" : ""} affiché{medicamentsFiltres.length !== 1 ? "s" : ""}
                        </p>
                    </section>
                </div>
                <footer className="medicaments-footer">GESTCABMED · Votre santé, notre priorité.</footer>
            </div>
        </main>
    );
}
