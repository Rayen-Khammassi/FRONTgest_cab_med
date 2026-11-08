/**
 * GESTCABMED — Medical Cabinet Vector Icons
 * Refined and styled inspired by Flaticon Style 5 (Lineal Color / Flat Healthcare Collection).
 * Dual-tone vector SVGs with currentColor and subtle accent fills for an ultra-polished,
 * professional clinical look.
 */

// 1. Medicine Cabinet (Wall cabinet with shelves, bottles, and cross badge)
export function IconMedicineCabinet({ size = 24, className = "" }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className}>
            {/* Outer Cabinet frame with rounded corners */}
            <rect x="3" y="3" width="18" height="18" rx="3" fill="currentColor" fillOpacity="0.1" />
            {/* Shelf divider */}
            <line x1="3" y1="11.5" x2="21" y2="11.5" strokeDasharray="0.5 0" />
            {/* Top Shelf: Medical Cross Badge */}
            <rect x="9.5" y="5.5" width="5" height="4.5" rx="1" fill="currentColor" fillOpacity="0.25" stroke="none" />
            <line x1="12" y1="5.5" x2="12" y2="10" strokeWidth="2" />
            <line x1="9.75" y1="7.75" x2="14.25" y2="7.75" strokeWidth="2" />
            {/* Bottom Shelf: Medicine Bottle 1 (Left with cap) */}
            <rect x="5.5" y="14" width="4" height="5" rx="1" fill="currentColor" fillOpacity="0.2" />
            <line x1="6.5" y1="13" x2="8.5" y2="13" strokeWidth="1.8" />
            {/* Bottom Shelf: Dropper / Pill Jar 2 (Right) */}
            <rect x="14" y="14.5" width="4.5" height="4.5" rx="1.2" fill="currentColor" fillOpacity="0.2" />
            <line x1="15" y1="13.2" x2="17.5" y2="13.2" strokeWidth="1.8" />
            <line x1="16.25" y1="12" x2="16.25" y2="13.2" strokeWidth="1.5" />
            {/* Cabinet handles / lock keyhole */}
            <circle cx="11.5" cy="15.5" r="0.75" fill="currentColor" stroke="none" />
            <circle cx="12.5" cy="15.5" r="0.75" fill="currentColor" stroke="none" />
        </svg>
    );
}

// 2. First Aid Box / Clinical Emergency Kit
export function IconFirstAidBox({ size = 24, className = "" }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className}>
            {/* Main case */}
            <rect x="3" y="6.5" width="18" height="14" rx="3" fill="currentColor" fillOpacity="0.1" />
            {/* Top carrying handle */}
            <path d="M8.5 6.5V4a1.5 1.5 0 0 1 1.5-1.5h4a1.5 1.5 0 0 1 1.5 1.5v2.5" strokeWidth="1.75" />
            {/* Medical Cross Badge in center */}
            <rect x="9" y="10.5" width="6" height="6" rx="1.5" fill="currentColor" fillOpacity="0.22" stroke="none" />
            <line x1="12" y1="10.5" x2="12" y2="16.5" strokeWidth="2.2" />
            <line x1="9" y1="13.5" x2="15" y2="13.5" strokeWidth="2.2" />
            {/* Metal clasps */}
            <line x1="6.5" y1="6.5" x2="6.5" y2="8" strokeWidth="2" />
            <line x1="17.5" y1="6.5" x2="17.5" y2="8" strokeWidth="2" />
        </svg>
    );
}

// 3. Medical Appointment / Calendar with Clock
export function IconAppointmentCalendar({ size = 24, className = "" }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className}>
            {/* Calendar Body */}
            <rect x="3" y="4.5" width="18" height="16.5" rx="2.5" fill="currentColor" fillOpacity="0.08" />
            {/* Top Banner Accent */}
            <path d="M3 8.5h18" strokeWidth="1.75" />
            {/* Binder Rings */}
            <line x1="7.5" y1="2.5" x2="7.5" y2="5.5" strokeWidth="2" />
            <line x1="16.5" y1="2.5" x2="16.5" y2="5.5" strokeWidth="2" />
            {/* Clock Indicator on lower right */}
            <circle cx="12" cy="14.5" r="4" fill="currentColor" fillOpacity="0.18" />
            <polyline points="12 12.5 12 14.5 13.5 14.5" strokeWidth="1.6" />
        </svg>
    );
}

// 4. Request Appointment (Calendar with Booking Plus Badge)
export function IconRequestAppointment({ size = 24, className = "" }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className}>
            {/* Calendar base */}
            <rect x="3" y="4.5" width="18" height="16.5" rx="2.5" fill="currentColor" fillOpacity="0.08" />
            <path d="M3 8.5h18" strokeWidth="1.75" />
            <line x1="7.5" y1="2.5" x2="7.5" y2="5.5" strokeWidth="2" />
            <line x1="16.5" y1="2.5" x2="16.5" y2="5.5" strokeWidth="2" />
            {/* Plus button emblem */}
            <circle cx="12" cy="14.5" r="4.2" fill="currentColor" fillOpacity="0.22" />
            <line x1="12" y1="12.2" x2="12" y2="16.8" strokeWidth="2" />
            <line x1="9.7" y1="14.5" x2="14.3" y2="14.5" strokeWidth="2" />
        </svg>
    );
}

// 5. Medical Prescription / Ordonnance (Clipboard with Rx symbol & checklist)
export function IconPrescription({ size = 24, className = "" }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className}>
            {/* Board */}
            <rect x="4" y="4.5" width="16" height="17" rx="2.5" fill="currentColor" fillOpacity="0.1" />
            {/* Clip on top */}
            <path d="M8.5 4.5V3a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v1.5" strokeWidth="1.75" fill="currentColor" fillOpacity="0.25" />
            {/* Rx symbol */}
            <path d="M7.5 9h3a1.5 1.5 0 0 1 0 3h-3v3" strokeWidth="1.8" />
            <line x1="9" y1="12" x2="12" y2="15" strokeWidth="1.6" />
            {/* Prescription Lines */}
            <line x1="13.5" y1="9.5" x2="16.5" y2="9.5" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="13.5" y1="12.5" x2="16.5" y2="12.5" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="7.5" y1="17.5" x2="16.5" y2="17.5" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
    );
}

// 6. Consultation / Clinical ECG & Diagnostic Pulse
export function IconConsultation({ size = 24, className = "" }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className}>
            {/* Clipboard / Monitor screen */}
            <rect x="3" y="3.5" width="18" height="17" rx="3" fill="currentColor" fillOpacity="0.08" />
            {/* ECG Pulse / Heartbeat trace */}
            <path d="M5.5 12.5h2.5l1.8-4 2.8 8 2.2-6 1.7 2h2" strokeWidth="2" />
            {/* Cross on top header */}
            <circle cx="12" cy="6.2" r="1.5" fill="currentColor" fillOpacity="0.3" stroke="none" />
            {/* Lower notes indicator */}
            <line x1="6.5" y1="17" x2="11" y2="17" strokeWidth="1.5" />
            <line x1="14" y1="17" x2="17.5" y2="17" strokeWidth="1.5" />
        </svg>
    );
}

// 7. Patient Medical Dossier / Folder
export function IconPatientDossier({ size = 24, className = "" }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className}>
            {/* Folder tab */}
            <path d="M3 6.5a2 2 0 0 1 2-2h4.5l2 2H19a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-12z" fill="currentColor" fillOpacity="0.1" />
            {/* Patient silhouette inside */}
            <circle cx="12" cy="11.5" r="2.4" fill="currentColor" fillOpacity="0.25" />
            <path d="M7.8 17.5a4.2 4.2 0 0 1 8.4 0" strokeWidth="1.75" />
            {/* Medical Cross on corner */}
            <circle cx="17.5" cy="8.5" r="2.2" fill="currentColor" fillOpacity="0.3" stroke="none" />
            <line x1="17.5" y1="7.3" x2="17.5" y2="9.7" strokeWidth="1.5" />
            <line x1="16.3" y1="8.5" x2="18.7" y2="8.5" strokeWidth="1.5" />
        </svg>
    );
}

// 8. Stethoscope (Dual binaural, acoustic loop, and bell/diaphragm)
export function IconStethoscope({ size = 24, className = "" }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className}>
            {/* Binaural earpieces & Y-tube */}
            <path d="M5 3.5v5a4 4 0 0 0 8 0v-5" />
            <line x1="4" y1="3.5" x2="6" y2="3.5" strokeWidth="2" />
            <line x1="12" y1="3.5" x2="14" y2="3.5" strokeWidth="2" />
            {/* Flexible acoustic tube down and loop */}
            <path d="M9 12.5v3a4 4 0 0 0 8 0v-2.5" />
            {/* Chestpiece diaphragm with inner sound sensor */}
            <circle cx="17" cy="11.5" r="2.6" fill="currentColor" fillOpacity="0.25" />
            <circle cx="17" cy="11.5" r="1.1" fill="currentColor" stroke="none" />
        </svg>
    );
}

// 9. Cabinet Medical Home / Clinic Building
export function IconCabinetHome({ size = 24, className = "" }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className}>
            {/* Building facade */}
            <path d="M3.5 10L12 3.5l8.5 6.5v9.5a1.5 1.5 0 0 1-1.5 1.5H5a1.5 1.5 0 0 1-1.5-1.5V10z" fill="currentColor" fillOpacity="0.1" />
            {/* Medical Cross on Gable */}
            <rect x="10" y="8" width="4" height="4" rx="1" fill="currentColor" fillOpacity="0.25" stroke="none" />
            <line x1="12" y1="8" x2="12" y2="12" strokeWidth="2" />
            <line x1="10" y1="10" x2="14" y2="10" strokeWidth="2" />
            {/* Entrance Door */}
            <rect x="9.5" y="15" width="5" height="6" rx="0.75" strokeWidth="1.6" fill="currentColor" fillOpacity="0.2" />
        </svg>
    );
}

// 10. Pills & Capsule Container (Dual-tone Capsule + Tablets)
export function IconPills({ size = 24, className = "" }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className}>
            {/* Main slanted capsule */}
            <rect x="8" y="3" width="9" height="18" rx="4.5" transform="rotate(45 12.5 12)" fill="currentColor" fillOpacity="0.1" />
            {/* Capsule division line */}
            <line x1="6.8" y1="12" x2="18.2" y2="12" strokeWidth="1.8" />
            {/* Upper half fill */}
            <path d="M6.8 12a4.5 4.5 0 0 1 6.36-6.36L16.8 9.27" stroke="none" fill="currentColor" fillOpacity="0.25" />
            {/* Companion small tablet */}
            <circle cx="6" cy="18" r="2.5" fill="currentColor" fillOpacity="0.2" />
            <line x1="4.5" y1="18" x2="7.5" y2="18" strokeWidth="1.2" />
        </svg>
    );
}

// 11. Support / Medical Help Desk
export function IconHelpSupport({ size = 24, className = "" }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className}>
            {/* Lifebuoy ring */}
            <circle cx="12" cy="12" r="9" fill="currentColor" fillOpacity="0.1" />
            <circle cx="12" cy="12" r="4.2" fill="currentColor" fillOpacity="0.2" />
            {/* Question mark / Lifesaver straps */}
            <path d="M9.5 9.5a2.5 2.5 0 0 1 4.5 1.5c0 1.5-2 2-2 2" strokeWidth="1.8" />
            <circle cx="12" cy="15.8" r="0.75" fill="currentColor" stroke="none" />
        </svg>
    );
}

// 12. Secure Logout / Clinic Exit
export function IconLogout({ size = 24, className = "" }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className}>
            {/* Door Frame */}
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            {/* Arrow exiting */}
            <polyline points="16 17 21 12 16 7" strokeWidth="2" />
            <line x1="21" y1="12" x2="9" y2="12" strokeWidth="2" />
        </svg>
    );
}

// ── UTILITY & ACTION VECTOR ICONS (No emojis) ───────────────────────────────

export function IconPlus({ size = 16, className = "" }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
    );
}

export function IconEdit({ size = 16, className = "" }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" fill="currentColor" fillOpacity="0.08" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
    );
}

export function IconTrash({ size = 16, className = "" }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" fill="currentColor" fillOpacity="0.08" />
            <line x1="10" y1="11" x2="10" y2="17" />
            <line x1="14" y1="11" x2="14" y2="17" />
        </svg>
    );
}

export function IconCheck({ size = 16, className = "" }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <polyline points="20 6 9 17 4 12" />
        </svg>
    );
}

export function IconClose({ size = 16, className = "" }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
    );
}

export function IconEye({ size = 16, className = "" }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" fill="currentColor" fillOpacity="0.08" />
            <circle cx="12" cy="12" r="3" fill="currentColor" fillOpacity="0.25" />
        </svg>
    );
}

export function IconRefresh({ size = 16, className = "" }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <polyline points="23 4 23 10 17 10" />
            <polyline points="1 20 1 14 7 14" />
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
        </svg>
    );
}

export function IconSearch({ size = 16, className = "" }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <circle cx="11" cy="11" r="8" fill="currentColor" fillOpacity="0.08" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
    );
}

export function IconCalendar({ size = 16, className = "" }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <rect x="3" y="4" width="18" height="18" rx="2" fill="currentColor" fillOpacity="0.08" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
    );
}

export function IconClock({ size = 16, className = "" }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity="0.08" />
            <polyline points="12 6 12 12 16 14" />
        </svg>
    );
}

export function IconUser({ size = 16, className = "" }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" fill="currentColor" fillOpacity="0.08" />
            <circle cx="12" cy="7" r="4" fill="currentColor" fillOpacity="0.2" />
        </svg>
    );
}

export function IconPrint({ size = 16, className = "" }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <polyline points="6 9 6 2 18 2 18 9" />
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" fill="currentColor" fillOpacity="0.08" />
            <rect x="6" y="14" width="12" height="8" fill="currentColor" fillOpacity="0.18" />
        </svg>
    );
}

export function IconSave({ size = 16, className = "" }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" fill="currentColor" fillOpacity="0.08" />
            <polyline points="17 21 17 13 7 13 7 21" />
            <polyline points="7 3 7 8 15 8" />
        </svg>
    );
}

export function IconAlert({ size = 16, className = "" }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity="0.12" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
    );
}

export function IconWaitingRoom({ size = 16, className = "" }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <circle cx="12" cy="5" r="2.5" fill="currentColor" fillOpacity="0.2" />
            <path d="M9 20l3-6 3 6" />
            <path d="M6 11l6-2 6 2" />
            <line x1="12" y1="9" x2="12" y2="14" />
        </svg>
    );
}

export function IconArrowLeft({ size = 16, className = "" }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
        </svg>
    );
}

export function IconArrowRight({ size = 16, className = "" }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
        </svg>
    );
}

export function IconMenu({ size = 20, className = "" }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
    );
}

export function IconCheckCircle({ size = 16, className = "" }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity="0.12" />
            <polyline points="9 12 11.5 14.5 16 9.5" />
        </svg>
    );
}

export function IconXCircle({ size = 16, className = "" }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity="0.12" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
    );
}
