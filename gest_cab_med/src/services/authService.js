const API_BASE = (
    import.meta.env.VITE_MAIN_API_URL || "http://localhost:8081"
).replace(/\/$/, "");

const API_URL = `${API_BASE}/api/auth`;

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
    sessionStorage.setItem("currentUser", JSON.stringify(user));
}

export function getUser() {
    const user = sessionStorage.getItem("currentUser");

    return user ? JSON.parse(user) : null;
}

export function logoutUser() {
    sessionStorage.removeItem("currentUser");
}

export function isAuthenticated() {
    return getUser() !== null;
}
