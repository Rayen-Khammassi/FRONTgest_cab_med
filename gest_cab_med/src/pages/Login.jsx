import { useEffect, useState } from "react";
import "./Login.css";
import { useNavigate } from "react-router-dom";
import { loginUser, saveUser } from "../services/authService";
import { LogoAlZahraoui } from "../components/MedicalIcons";

function Login() {
    const [introFinished, setIntroFinished] = useState(false);
    const [mode, setMode] = useState("LOGIN");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const [login, setLogin] = useState("");
    const [password, setPassword] = useState("");

    const [nom, setNom] = useState("");
    const [prenom, setPrenom] = useState("");
    const [email, setEmail] = useState("");
    const [dateNaissance, setDateNaissance] = useState("");
    const [adresse, setAdresse] = useState("");

    const [feedback, setFeedback] = useState({
        type: "",
        message: "",
    });

    useEffect(() => {
        const timer = setTimeout(() => {
            setIntroFinished(true);
        }, 150);

        return () => clearTimeout(timer);
    }, []);

    const changeMode = (newMode) => {
        setMode(newMode);
        setFeedback({ type: "", message: "" });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (isLoading) return;

        setIsLoading(true);
        setFeedback({ type: "", message: "" });

        try {
            if (mode === "LOGIN") {

                const data = await loginUser(login, password);

                // Save authenticated user
                saveUser(data);

                // Redirect according to the role
                const routes = {
                    PATIENT: "/patient",
                    DOCTEUR: "/doctor",
                    SECRETAIRE: "/secretary",
                };

                const destination = routes[data.role];

                if (!destination) {
                    throw new Error("Rôle utilisateur non reconnu.");
                }

                navigate(destination, { replace: true });

            } else {
                const apiBase = (
                    import.meta.env.VITE_MAIN_API_URL || "http://localhost:8081"
                ).replace(/\/$/, "");

                const response = await fetch(
                    `${apiBase}/api/auth/register`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            nom,
                            prenom,
                            email,
                            login,
                            password,
                            dateNaissance,
                            adresse,
                        }),
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    setFeedback({
                        type: "error",
                        message: data.message || "Erreur lors de l'inscription.",
                    });
                    return;
                }

                setFeedback({
                    type: "success",
                    message: "Compte créé avec succès ! Vous pouvez maintenant vous connecter.",
                });

                setNom("");
                setPrenom("");
                setEmail("");
                setLogin("");
                setPassword("");
                setDateNaissance("");
                setAdresse("");

                setMode("LOGIN");
            }

        } catch (error) {
            setFeedback({
                type: "error",
                message: error.message || "Impossible de contacter le serveur.",
            });

        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className={`auth-page ${introFinished ? "intro-finished" : ""}`}>

            {/* Background decoration */}
            <div className="background-glow glow-one" />
            <div className="background-glow glow-two" />
            <div className="background-glow glow-three" />

            <div className="medical-scene" aria-hidden="true">
                <span className="medical-decoration decoration-heart">♥</span>
                <span className="medical-decoration decoration-cross">✚</span>
                <span className="medical-decoration decoration-pill">✚</span>
                <span className="medical-decoration decoration-shield">♡</span>
                <span className="medical-decoration decoration-capsule">✚</span>
                <span className="medical-decoration decoration-cross-two">✚</span>
                <span className="medical-orb orb-one" />
                <span className="medical-orb orb-two" />
            </div>

            {/* Main content */}
            <div className="auth-content">

                <header className="brand">
                    <div className="brand-logo-pure" aria-label="Logo Al-Zahraoui">
                        <LogoAlZahraoui size={78} />
                    </div>
                    <div className="brand-text">
                        <h1 className="brand-title-authentic">Al-Zahraoui</h1>
                        <p className="brand-subtitle-authentic">Cabinet Médical · Système de gestion</p>
                    </div>
                </header>

                <section className={`auth-panel ${introFinished ? "panel-visible" : ""}`}>

                    <div className="panel-heading">
                        <h2>
                            {mode === "LOGIN"
                                ? "Bienvenue"
                                : "Créer un compte"}
                        </h2>

                        <p>
                            {mode === "LOGIN"
                                ? "Connectez-vous à votre espace personnel"
                                : "Rejoignez notre espace patient"}
                        </p>
                    </div>

                    {/* Animated tabs */}
                    <div className={`auth-tabs ${mode === "REGISTER" ? "register-active" : ""}`}>
                        <div className="tab-indicator" />

                        <button
                            type="button"
                            className={mode === "LOGIN" ? "selected" : ""}
                            onClick={() => changeMode("LOGIN")}
                        >
                            Connexion
                        </button>

                        <button
                            type="button"
                            className={mode === "REGISTER" ? "selected" : ""}
                            onClick={() => changeMode("REGISTER")}
                        >
                            Inscription
                        </button>
                    </div>

                    {/* Status feedback */}
                    {feedback.message && (
                        <div
                            className={`feedback-box ${feedback.type === "error" ? "feedback-error" : "feedback-success"
                            }`}
                        >
                            <span className="feedback-bullet">•</span>
                            <span>{feedback.message}</span>
                        </div>
                    )}

                    {/* Authentication Form */}
                    <form onSubmit={handleSubmit} className="auth-form" noValidate>

                        {mode === "REGISTER" && (
                            <>
                                <div className="input-row">
                                    <div className="field-group">
                                        <label htmlFor="nom">Nom</label>
                                        <input
                                            id="nom"
                                            type="text"
                                            value={nom}
                                            onChange={(e) => setNom(e.target.value)}
                                            placeholder="Ex: Ben Ali"
                                            required
                                        />
                                    </div>

                                    <div className="field-group">
                                        <label htmlFor="prenom">Prénom</label>
                                        <input
                                            id="prenom"
                                            type="text"
                                            value={prenom}
                                            onChange={(e) => setPrenom(e.target.value)}
                                            placeholder="Ex: Mohamed"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="field-group">
                                    <label htmlFor="email">Email</label>
                                    <input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="votre.email@domaine.tn"
                                        required
                                    />
                                </div>

                                <div className="input-row">
                                    <div className="field-group">
                                        <label htmlFor="dateNaissance">Date de naissance</label>
                                        <input
                                            id="dateNaissance"
                                            type="date"
                                            value={dateNaissance}
                                            onChange={(e) => setDateNaissance(e.target.value)}
                                        />
                                    </div>

                                    <div className="field-group">
                                        <label htmlFor="adresse">Adresse</label>
                                        <input
                                            id="adresse"
                                            type="text"
                                            value={adresse}
                                            onChange={(e) => setAdresse(e.target.value)}
                                            placeholder="Ex: Tunis, Ariana"
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        <div className="field-group">
                            <label htmlFor="login">Identifiant / Nom d'utilisateur</label>
                            <input
                                id="login"
                                type="text"
                                value={login}
                                onChange={(e) => setLogin(e.target.value)}
                                placeholder="Votre nom d'utilisateur"
                                required
                            />
                        </div>

                        <div className="field-group">
                            <label htmlFor="password">Mot de passe</label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="submit-button"
                            disabled={isLoading}
                        >
                            <span>
                                {isLoading
                                    ? "Traitement..."
                                    : mode === "LOGIN"
                                        ? "Se connecter"
                                        : "Créer mon compte"}
                            </span>
                            <span className="button-arrow" aria-hidden="true">→</span>
                        </button>
                    </form>

                    <footer className="panel-footer">
                        <p>
                            Al-Zahraoui · Système médical sécurisé · Conforme RGPD santé
                        </p>
                    </footer>
                </section>
            </div>
        </main>
    );
}

export default Login;