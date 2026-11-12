
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import PatientDashboard from "./pages/PatientDashboard";
import DoctorDashboard from "./pages/DoctorDashboard";
import SecretaryDashboard from "./pages/SecretaryDashboard";
import MedicamentPage from "./pages/MedicamentPage";
import ProtectedRoute from "./components/ProtectedRoute";

import "./App.css";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* ========== PUBLIC ROUTES ========== */}

                {/* Landing Page - Accueil */}
                <Route
                    path="/"
                    element={<LandingPage />}
                />

                {/* Login / Inscription */}
                <Route
                    path="/login"
                    element={<Login />}
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
