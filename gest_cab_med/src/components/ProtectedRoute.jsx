
import { Navigate, Outlet } from "react-router-dom";
import { getUser } from "../services/authService";

function ProtectedRoute({ allowedRole }) {
    const user = getUser();

    if (!user) {
        return <Navigate to="/" replace />;
    }

    if (user.role !== allowedRole) {
        const routes = {
            PATIENT: "/patient",
            DOCTEUR: "/doctor",
            SECRETAIRE: "/secretary",
        };

        return (
            <Navigate
                to={routes[user.role] || "/"}
                replace
            />
        );
    }

    return <Outlet />;
}

export default ProtectedRoute;
