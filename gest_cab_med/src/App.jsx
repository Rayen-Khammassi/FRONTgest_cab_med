import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import PatientDashboard from "./pages/PatientDashboard";
import DoctorDashboard from "./pages/DoctorDashboard";
import SecretaryDashboard from "./pages/SecretaryDashboard";
import MedicamentPage from "./pages/MedicamentPage";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import "./App.css";

/**
 * Composant de synchronisation d'authentification inter-onglets.
 * Écoute les modifications de session sur les autres onglets du navigateur :
 * - Déconnexion sur un autre onglet -> redirection immédiate de tous les onglets vers l'accueil.
 * - Changement de compte sur un autre onglet -> bascule instantanée et propre vers le tableau de bord adéquat.
 */
function CrossTabAuthSync() {
    useEffect(() => {
        const handleStorageChange = (event) => {
            if (event.key === "currentUser") {
                if (!event.newValue) {
                    // Déconnexion détectée dans un autre onglet
                    window.location.href = "/";
                } else {
                    try {
                        const newUser = JSON.parse(event.newValue);
                        const routes = {
                            PATIENT: "/patient",
                            DOCTEUR: "/doctor",
                            SECRETAIRE: "/secretary",
                        };
                        const target = routes[newUser?.role] || "/";
                        window.location.href = target;
                    } catch {
                        window.location.href = "/";
                    }
                }
            }
        };

        window.addEventListener("storage", handleStorageChange);
        return () => window.removeEventListener("storage", handleStorageChange);
    }, []);

    return null;
}

function App() {
    return (
        <BrowserRouter>
            <CrossTabAuthSync />
            <Routes>
                {/* ========== PUBLIC ROUTES ========== */}

                {/* Landing Page - Vitrine Officielle Al-Zahrawi */}
                <Route
                    path="/"
                    element={<LandingPage />}
                />

                {/* Login / Inscription (avec redirection automatique si déjà connecté) */}
                <Route
                    path="/login"
                    element={
                        <PublicRoute>
                            <Login />
                        </PublicRoute>
                    }
                />

                {/* ========== PATIENT ROUTES ========== */}
                <Route element={<ProtectedRoute allowedRole="PATIENT" />}>
                    <Route
                        path="/patient/*"
                        element={<PatientDashboard />}
                    />
                </Route>

                {/* ========== DOCTOR ROUTES ========== */}
                <Route element={<ProtectedRoute allowedRole="DOCTEUR" />}>
                    <Route
                        path="/doctor/medicaments"
                        element={<MedicamentPage />}
                    />
                    <Route
                        path="/doctor/*"
                        element={<DoctorDashboard />}
                    />
                </Route>

                {/* ========== SECRETARY ROUTES ========== */}
                <Route element={<ProtectedRoute allowedRole="SECRETAIRE" />}>
                    <Route
                        path="/secretary/medicaments"
                        element={<MedicamentPage />}
                    />
                    <Route
                        path="/secretary/*"
                        element={<SecretaryDashboard />}
                    />
                </Route>

                {/* ========== UNKNOWN ROUTES ========== */}
                <Route
                    path="*"
                    element={<Navigate to="/" replace />}
                />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
