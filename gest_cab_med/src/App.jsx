import { useState } from "react";
import Login from "./pages/Login";
import MedicamentPage from "./features/medicament/pages/MedicamentPage";

export default function App() {
    const [user, setUser] = useState(null);

    if (user?.role === "DOCTEUR") {
        return <MedicamentPage />;
    }

    return <Login onLogin={setUser} />;
}
