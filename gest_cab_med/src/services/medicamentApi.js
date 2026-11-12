const API_BASE = (
    import.meta.env.VITE_MAIN_API_URL ||
    import.meta.env.VITE_API_URL ||
    "http://localhost:8081"
).replace(/\/$/, "");

async function request(method, path = "", body) {

    const response = await fetch(
        `${API_BASE}/api/medicaments${path}`,
        {
            method,

            headers: body
                ? { "Content-Type": "application/json" }
                : {},

            ...(body
                ? { body: JSON.stringify(body) }
                : {})
        }
    );

    // DELETE retourne 204 sans JSON
    if (response.status === 204) {
        return null;
    }

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Erreur serveur"
        );
    }

    return data;
}

export const medicamentApi = {

    list: () => request("GET"),

    get: (id) => request("GET", `/${id}`),

    create: (medicament) =>
        request("POST", "", medicament),

    update: (id, medicament) =>
        request("PUT", `/${id}`, medicament),

    remove: (id) =>
        request("DELETE", `/${id}`)
};
