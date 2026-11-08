import { BrowserRouter, Routes, Route } from "react-router-dom";

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
                {/* Public route - Login untouched */}
                <Route path="/" element={<Login />} />

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
                <Route path="*" element={<Login />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
