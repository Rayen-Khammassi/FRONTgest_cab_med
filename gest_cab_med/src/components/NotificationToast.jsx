import { useEffect } from "react";
import { IconCheck, IconClose, IconAlert } from "./MedicalIcons";

export default function NotificationToast({ message, type = "info", onClose, duration = 4000 }) {
    useEffect(() => {
        if (!message) return;
        const timer = setTimeout(() => {
            if (onClose) onClose();
        }, duration);
        return () => clearTimeout(timer);
    }, [message, duration, onClose]);

    if (!message) return null;

    const isSuccess = type === "success" || type === "succes";
    const isError = type === "error" || type === "erreur";

    return (
        <div className={`notification-toast toast-${isSuccess ? "success" : isError ? "error" : "info"}`} role="status">
            <div className="toast-icon-wrap">
                {isSuccess && <IconCheck size={18} />}
                {isError && <IconClose size={18} />}
                {!isSuccess && !isError && <IconAlert size={18} />}
            </div>
            <div className="toast-content">
                <span>{message}</span>
            </div>
            <button
                type="button"
                className="toast-close-btn"
                onClick={onClose}
                aria-label="Fermer la notification"
            >
                <IconClose size={14} />
            </button>
        </div>
    );
}
