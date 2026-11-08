
import { useEffect, useState } from "react";
import "./Login.css";
import { useNavigate } from "react-router-dom";
import { loginUser, saveUser } from "../services/authService";
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
                const response = await fetch(
                    "http://localhost:8081/api/auth/register",
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
            console.error("Erreur :", error);

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
                    <div className="brand-mark">✚</div>
                    <div>
                        <h1>GESTCABMED</h1>
                        <p>Système de gestion médicale</p>
                    </div>
                </header>

                <section className={`auth-panel ${introFinished ? "panel-visible" : ""}`}>

                    <div className="panel-heading">
                        <div className="panel-icon">✚</div>

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

                    <form
                        key={mode}
                        onSubmit={handleSubmit}
                        className="auth-form"
                    >

                        {feedback.message && (
                            <div
                                className={`auth-feedback ${feedback.type}`}
                                role="status"
                                aria-live="polite"
                            >
                                {feedback.message}
                            </div>
                        )}

                        {mode === "REGISTER" && (
                            <div className="registration-fields">

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="prenom">Prénom</label>
                                        <input
                                            id="prenom"
                                            value={prenom}
                                            onChange={(e) => setPrenom(e.target.value)}
                                            autoComplete="given-name"
                                            placeholder="Votre prénom"
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="nom">Nom</label>
                                        <input
                                            id="nom"
                                            value={nom}
                                            onChange={(e) => setNom(e.target.value)}
                                            autoComplete="family-name"
                                            placeholder="Votre nom"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="email">Adresse e-mail</label>
                                    <input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        autoComplete="email"
                                        placeholder="exemple@email.com"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="dateNaissance">Date de naissance</label>
                                    <input
                                        id="dateNaissance"
                                        type="date"
                                        value={dateNaissance}
                                        onChange={(e) => setDateNaissance(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="adresse">Adresse</label>
                                    <input
                                        id="adresse"
                                        value={adresse}
                                        onChange={(e) => setAdresse(e.target.value)}
                                        autoComplete="street-address"
                                        placeholder="Votre adresse"
                                        required
                                    />
                                </div>

                            </div>
                        )}

                        <div className="form-group">
                            <label htmlFor="login">Identifiant</label>
                            <input
                                id="login"
                                value={login}
                                onChange={(e) => setLogin(e.target.value)}
                                autoComplete="username"
                                placeholder="Votre identifiant"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Mot de passe</label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoComplete={
                                    mode === "LOGIN"
                                        ? "current-password"
                                        : "new-password"
                                }
                                placeholder="Votre mot de passe"
                                required
                            />
                        </div>

                        <button
                            className="submit-button"
                            type="submit"
                            disabled={isLoading}
                        >
                            <span>
                                {isLoading
                                    ? mode === "LOGIN"
                                        ? "Connexion en cours..."
                                        : "Création en cours..."
                                    : mode === "LOGIN"
                                        ? "Se connecter"
                                        : "Créer mon compte"}
                            </span>

                            {!isLoading && <span className="button-arrow">→</span>}
                        </button>

                    </form>

                    <div className="panel-footer">
                        <span className="footer-line" />
                        <p>GESTCABMED · Votre santé, notre priorité</p>
                    </div>

                </section>

                <p className="page-caption">
                    Une gestion simple et sécurisée de votre santé.
                </p>

            </div>
        </main>
    );
}

export default Login;
