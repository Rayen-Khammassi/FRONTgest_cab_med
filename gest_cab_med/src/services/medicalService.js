/**
 * AL-ZAHRAOUI — Medical Cabinet Service (Patients, Consultations, Ordonnances)
 * Connects to port 8081 backend API.
 */

const API_BASE = (
    import.meta.env.VITE_MAIN_API_URL || "http://localhost:8081"
).replace(/\/$/, "");

async function request(path, options = {}) {
    const url = `${API_BASE}${path}`;
    const headers = {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...(options.headers || {})
    };

    const response = await fetch(url, {
        ...options,
        headers
    });

    if (response.status === 204) {
        return null;
    }

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || "Erreur de communication avec le serveur.");
    }

    return data;
}

// ── PATIENTS ────────────────────────────────────────────────────────────────
export async function getPatients() {
    return request("/api/patients");
}

export async function getPatientById(id) {
    return request(`/api/patients/${id}`);
}

export async function createPatient(payload) {
    return request("/api/patients", {
        method: "POST",
        body: JSON.stringify(payload)
    });
}

export async function updatePatient(id, payload) {
    return request(`/api/patients/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload)
    });
}

export async function togglePatientStatus(id, actif) {
    return request(`/api/patients/${id}`, {
        method: "PUT",
        body: JSON.stringify({ actif })
    });
}

export async function deletePatient(id) {
    return request(`/api/patients/${id}`, {
        method: "DELETE"
    });
}

// ── CONSULTATIONS ───────────────────────────────────────────────────────────
export async function getConsultationsByDoctor(idDocteur) {
    return request(`/api/consultations?doctor_id=${idDocteur}`);
}

export async function getConsultationsByPatient(idPatient) {
    return request(`/api/consultations?patient_id=${idPatient}`);
}

export async function getAllConsultations() {
    return request("/api/consultations");
}

export async function createConsultation(payload) {
    return request("/api/consultations", {
        method: "POST",
        body: JSON.stringify(payload)
    });
}

export async function updateConsultation(payload) {
    return request("/api/consultations", {
        method: "PUT",
        body: JSON.stringify(payload)
    });
}

// ── ORDONNANCES / PRESCRIPTIONS ─────────────────────────────────────────────
export async function getPrescriptionsByPatient(idPatient) {
    return request(`/api/prescriptions?patient_id=${idPatient}`);
}

export async function getPrescriptionsByDoctor(idDocteur) {
    return request(`/api/prescriptions?doctor_id=${idDocteur}`);
}

export async function getAllPrescriptions() {
    return request("/api/prescriptions");
}

export async function createPrescription(payload) {
    return request("/api/prescriptions", {
        method: "POST",
        body: JSON.stringify(payload)
    });
}
