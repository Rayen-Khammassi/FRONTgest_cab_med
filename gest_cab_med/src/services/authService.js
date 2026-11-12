const API_BASE = (
    import.meta.env.VITE_MAIN_API_URL || "http://localhost:8082"
).replace(/\/$/, "");

const API_URL = `${API_BASE}/api/auth`;

// Nettoyage immédiat de tout résidu historique de session dans sessionStorage
try {
    sessionStorage.removeItem("currentUser");
} catch {}

export async function loginUser(login, password) {
    const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ login, password }),
    });

    const data = await response.json();

    if (!response.ok || data.success === false) {
        throw new Error(data.message || "Identifiants incorrects.");
    }

    return data;
}

export function saveUser(user) {
    if (!user) return;
    const safeUser = {
        idUtilisateur: user.idUtilisateur,
        nom: user.nom,
        prenom: user.prenom,
        login: user.login,
        role: user.role,
        token: user.token || null,
    };
    const serialized = JSON.stringify(safeUser);
    try {
        localStorage.setItem("currentUser", serialized);
    } catch (e) {
        console.warn("Could not save to localStorage", e);
    }
    // Nettoyer systématiquement sessionStorage pour éviter toute session fantôme par onglet
    try {
        sessionStorage.removeItem("currentUser");
    } catch {}
}

export function getUser() {
    try {
        const raw = localStorage.getItem("currentUser");
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

export function getAuthToken() {
    return getUser()?.token || null;
}

export function getAuthHeaders() {
    const token = getAuthToken();
    return token ? { "Authorization": `Bearer ${token}` } : {};
}

export function logoutUser() {
    try {
        localStorage.removeItem("currentUser");
    } catch (e) {
        console.warn("Could not remove from localStorage", e);
    }
    try {
        sessionStorage.removeItem("currentUser");
    } catch {}
}

export function isAuthenticated() {
    return !!getUser();
}
