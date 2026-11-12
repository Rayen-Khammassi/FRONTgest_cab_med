import { useEffect } from "react";
import { IconAlert, IconCheck, IconClose, IconTrash } from "./MedicalIcons";

/**
 * Reusable French Confirmation Pop-up Modal
 * Replaces browser-native window.confirm and alert with accessible, stylish UI.
 */
export default function ConfirmModal({
    isOpen,
    title = "Confirmation",
    message,
    confirmText = "Accepter",
    cancelText = "Annuler",
    variant = "primary", // 'danger' | 'primary' | 'warning' | 'success'
    onConfirm,
    onCancel,
    isLoading = false
}) {
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!isOpen) return;
            if (e.key === "Escape") onCancel();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onCancel]);

    if (!isOpen) return null;

    let iconComponent = <IconAlert size={28} />;
    let iconBg = "rgba(8, 127, 158, 0.15)";
    let iconColor = "#087f9e";
    let confirmBtnClass = "confirm-btn-primary";

    if (variant === "danger") {
        iconComponent = <IconTrash size={28} />;
        iconBg = "rgba(185, 28, 28, 0.18)";
        iconColor = "#ef4444";
        confirmBtnClass = "confirm-btn-danger";
    } else if (variant === "success") {
        iconComponent = <IconCheck size={28} />;
        iconBg = "rgba(4, 120, 87, 0.18)";
        iconColor = "#10b981";
        confirmBtnClass = "confirm-btn-success";
    } else if (variant === "warning") {
        iconComponent = <IconAlert size={28} />;
        iconBg = "rgba(217, 119, 6, 0.18)";
        iconColor = "#f59e0b";
        confirmBtnClass = "confirm-btn-warning";
    }

    return (
        <div
            className="modal-overlay confirm-modal-overlay"
            onClick={onCancel}
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-modal-title"
        >
            <div
                className="confirm-modal-glass"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="confirm-modal-top">
                    <div
                        className="confirm-modal-icon-badge"
                        style={{ background: iconBg, color: iconColor }}
                    >
                        {iconComponent}
                    </div>
                    <button
                        type="button"
                        className="confirm-modal-close"
                        onClick={onCancel}
                        aria-label="Fermer"
                    >
                        <IconClose size={16} />
                    </button>
                </div>

                <div className="confirm-modal-body">
                    <h3 id="confirm-modal-title" className="confirm-modal-title">
                        {title}
                    </h3>
                    <p className="confirm-modal-message">
                        {message}
                    </p>
                </div>

                <div className="confirm-modal-actions">
                    <button
                        type="button"
                        className="confirm-btn-cancel"
                        onClick={onCancel}
                        disabled={isLoading}
                    >
                        {cancelText}
                    </button>
                    <button
                        type="button"
                        className={`confirm-btn-action ${confirmBtnClass}`}
                        onClick={onConfirm}
                        disabled={isLoading}
                        autoFocus
                    >
                        {isLoading ? "Traitement..." : confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
