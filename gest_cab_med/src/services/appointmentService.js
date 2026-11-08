const API_BASE = "http://localhost:8081/api";

/**
 * Récupère la liste de tous les médecins du cabinet.
 */
export async function getDoctors() {
    try {
        const response = await fetch(`${API_BASE}/doctors`);
        if (!response.ok) {
            throw new Error(`Erreur serveur (${response.status})`);
        }
        return await response.json();
    } catch {
        return [];
    }
}

/**
 * Crée une nouvelle demande de rendez-vous pour un patient.
 */
export async function createAppointment({ idPatient, idDocteur, dateHeure, motif }) {
    const response = await fetch(`${API_BASE}/appointments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idPatient, idDocteur, dateHeure, motif }),
    });

    const data = await response.json();
    if (!response.ok || data.success === false) {
        throw new Error(data.message || "Échec de l'enregistrement du rendez-vous.");
    }
    return data;
}

/**
 * Récupère les rendez-vous d'un patient donné.
 */
export async function getAppointmentsByPatient(patientId) {
    try {
        const response = await fetch(`${API_BASE}/appointments?patient_id=${patientId}`);
        if (!response.ok) return [];
        return await response.json();
    } catch {
        return [];
    }
}

/**
 * Récupère les rendez-vous d'un médecin donné.
 */
export async function getAppointmentsByDoctor(doctorId) {
    try {
        const response = await fetch(`${API_BASE}/appointments?doctor_id=${doctorId}`);
        if (!response.ok) return [];
        return await response.json();
    } catch {
        return [];
    }
}

/**
 * Récupère l'ensemble des rendez-vous (vue secrétariat).
 */
export async function getAllAppointments() {
    try {
        const response = await fetch(`${API_BASE}/appointments`);
        if (!response.ok) return [];
        return await response.json();
    } catch {
        return [];
    }
}

/**
 * Met à jour le statut d'un rendez-vous (CONFIRME, ANNULE, TERMINE).
 */
export async function updateAppointmentStatus(idRdv, statut) {
    const response = await fetch(`${API_BASE}/appointments`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idRdv, statut }),
    });

    const data = await response.json();
    if (!response.ok || data.success === false) {
        throw new Error(data.message || "Échec de la mise à jour du statut.");
    }
    return data;
}
