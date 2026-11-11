/**
 * ============================================================================
 * FICHIER : DoctorHomeView.jsx
 * MODULE  : Espace Médecin - Page d'accueil & Tableau de bord principal
 * ============================================================================
 * RÔLE ET FONCTIONNALITÉS :
 * 1. Affiche la bannière d'accueil du médecin avec identité visuelle Al-Zahrawi.
 * 2. Présente les cartes d'accès rapide vers les modules clés :
 *    - Gestion des patients (registre et dossiers médicaux).
 *    - Planning des rendez-vous (consultation de l'agenda et validation).
 *    - Consultations médicales (création et historique des actes).
 *    - Ordonnances (rédaction et impression d'ordonnances médicamenteuses).
 *    - Médicaments (inventaire de la pharmacie et dosages).
 * 3. Gère la navigation fluide au clic ou au clavier (Accessibilité WCAG).
 * ============================================================================
 */

import { IconStethoscope } from "../MedicalIcons";

function DoctorHomeView({ cards, navigate }) {
    return (
        <>
            <div className="welcome-banner doctor-banner">
                <div>
                    <span className="banner-label">ESPACE MÉDECIN · AL-ZAHRAWI</span>
                    <h2>Votre activité médicale.</h2>
                    <p>Accédez à vos patients, consultations et rendez-vous.</p>
                </div>
                <div className="banner-decoration">
                    <IconStethoscope size={32} />
                </div>
            </div>

            <h2 className="section-title">Gestion médicale</h2>
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
                            <div className="service-card-icon">
                                <IconComponent size={28} />
                            </div>
                            <h3>{card.title}</h3>
                            <p>{card.description}</p>
                        </div>
                    );
                })}
            </div>
        </>
    );
}

export default DoctorHomeView;
