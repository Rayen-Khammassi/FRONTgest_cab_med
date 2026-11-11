import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

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
 * - Déconnexion sur un autre onglet -> redirection immédiate de tous les onglets vers l'écran de connexion.
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
                {/* Public route - Login untouched, auto-redirect if already logged in */}
                <Route
                    path="/"
                    element={
                        <PublicRoute>
                            <Login />
                        </PublicRoute>
                    }
                />

                {/* Patient routes */}
                <Route element={<ProtectedRoute allowedRole="PATIENT" />}>
                    <Route
                        path="/patient/*"
                        element={<PatientDashboard />}
                    />
                </Route>

                {/* Doctor routes */}
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

                {/* Secretary routes */}
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

                {/* Unknown routes */}
                <Route
                    path="*"
                    element={
                        <PublicRoute>
                            <Login />
                        </PublicRoute>
                    }
                />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
