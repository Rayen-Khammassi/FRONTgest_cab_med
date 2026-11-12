/**
 * ============================================================================
 * FICHIER : PublicRoute.jsx
 * MODULE  : Système de Routage & Sécurité de Session
 * ============================================================================
 * RÔLE ET FONCTIONNALITÉS :
 * 1. Protège les routes publiques (comme la page de connexion /).
 * 2. Si un utilisateur est déjà authentifié dans le navigateur (session active) :
 *    - Il est automatiquement et immédiatement redirigé vers son espace dédié
 *      selon son rôle (PATIENT -> /patient, DOCTEUR -> /doctor, SECRETAIRE -> /secretary).
 *    - Empêche l'ouverture accidentelle de deux sessions distinctes dans le même navigateur.
 * 3. Si aucun utilisateur n'est connecté :
 *    - Affiche normalement le composant enfant (la page de connexion Login).
 * ============================================================================
 */

import { Navigate } from "react-router-dom";
import { getUser } from "../services/authService";

function PublicRoute({ children }) {
    const user = getUser();

    if (user?.role) {
        const routes = {
            PATIENT: "/patient",
            DOCTEUR: "/doctor",
            SECRETAIRE: "/secretary",
        };

        const targetRoute = routes[user.role] || "/";
        return <Navigate to={targetRoute} replace />;
    }

    return children;
}

export default PublicRoute;
