import { useEffect, useState } from "react";
import "./Login.css";

const roles = [
    { id: "PATIENT", label: "Patient" },
    { id: "DOCTEUR", label: "Médecin" },
    { id: "SECRETAIRE", label: "Secrétaire" },
];

function Login() {
    const [introFinished, setIntroFinished] = useState(false);
    const [role, setRole] = useState("PATIENT");
    const [mode, setMode] = useState("LOGIN");

    const [login, setLogin] = useState("");
    const [password, setPassword] = useState("");

    const [nom, setNom] = useState("");
    const [prenom, setPrenom] = useState("");
    const [email, setEmail] = useState("");
    const [dateNaissance, setDateNaissance] = useState("");
    const [adresse, setAdresse] = useState("");

    useEffect(() => {
        const timer = setTimeout(() => {
            setIntroFinished(true);
        }, 2600);

        return () => clearTimeout(timer);
    }, []);

    const changeRole = (newRole) => {
        setRole(newRole);
        setMode("LOGIN");
        setLogin("");
        setPassword("");
    };

const handleSubmit = async (event) => {
    event.preventDefault();

    if (mode === "LOGIN") {
        try {
            const response = await fetch(
                "http://localhost:8081/api/auth/login",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        login: login,
                        password: password,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                alert(data.message || "Identifiants incorrects.");
                return;
            }

            // Verify that the account matches the selected role.
            if (data.role !== role) {
                alert("Ce compte ne correspond pas au rôle sélectionné.");
                return;
            }

            console.log("Connexion réussie :", data);

            alert(`Bienvenue ${data.prenom} ${data.nom} !`);

        } catch (error) {
            console.error("Erreur de connexion :", error);
            alert("Impossible de contacter le serveur. Vérifiez que le backend est démarré.");
        }

    } else {
        console.log("Inscription demandée", {
            nom,
            prenom,
            email,
            login,
            password,
            dateNaissance,
            adresse,
        });
    }
};
    

    return (
        <main className={`auth-page ${introFinished ? "intro-finished" : ""} role-${role.toLowerCase()}`}>

            {/* Animated welcome title */}
            <header className={`brand ${introFinished ? "brand-small" : ""}`}>
                <div className="brand-mark">✚</div>
                <div>
                    <h1>GESTCABMED</h1>
                    <p>Système de gestion médicale</p>
                </div>
            </header>

            {/* Floating medical illustrations */}
            <div className="medical-scene" aria-hidden="true">
                <div className="medical-decoration decoration-heart">♥</div>
                <div className="medical-decoration decoration-cross">✚</div>
                <div className="medical-decoration decoration-pill">💊</div>
                <div className="medical-decoration decoration-plus">✚</div>
                <div className="medical-decoration decoration-star">★</div>
                <div className="medical-decoration decoration-shield">🛡</div>
                <div className="medical-decoration decoration-heartbeat">♡</div>
                <div className="medical-decoration decoration-capsule">💊</div>
                <div className="medical-decoration decoration-cross-two">✚</div>
                <div className="medical-orb orb-one" />
                <div className="medical-orb orb-two" />

                <div className="medical-cross cross-one">✚</div>
                <div className="medical-cross cross-two">✚</div>

                <div className="pill pill-one">
                    <span />
                </div>

                <div className="pill pill-two">
                    <span />
                </div>

                <div className="medical-message">
                    <span>Votre santé,</span>
                    <span>notre priorité.</span>
                </div>

                <div className="stethoscope-icon" aria-hidden="true">
                    🩺
                </div>
            </div>

            {/* Authentication panel */}
            <section className={`auth-panel ${introFinished ? "panel-visible" : ""}`}>

                <div className="panel-heading">
                    <span className="panel-icon">✚</span>
                    <h2>
                        {mode === "LOGIN" ? "Connexion" : "Créer un compte"}
                    </h2>
                    <p>
                        {mode === "LOGIN"
                            ? "Accédez à votre espace personnel"
                            : "Rejoignez notre espace patient"}
                    </p>
                </div>

                <div className="role-selector">
                    {roles.map((item) => (
                        <button
                            key={item.id}
                            type="button"
                            className={role === item.id ? "selected" : ""}
                            onClick={() => changeRole(item.id)}
                            aria-pressed={role === item.id}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>

                <div className="auth-tabs">
                    <button
                        type="button"
                        className={mode === "LOGIN" ? "selected" : ""}
                        onClick={() => setMode("LOGIN")}
                    >
                        Connexion
                    </button>

                    {role === "PATIENT" && (
                        <button
                            type="button"
                            className={mode === "REGISTER" ? "selected" : ""}
                            onClick={() => setMode("REGISTER")}
                        >
                            Inscription
                        </button>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="auth-form">

                    {mode === "REGISTER" && (
                        <>
                            <div className="form-group">
                                <label htmlFor="prenom">Prénom</label>
                                <input
                                    id="prenom"
                                    value={prenom}
                                    onChange={(e) => setPrenom(e.target.value)}
                                    autoComplete="given-name"
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
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="email">Adresse e-mail</label>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    autoComplete="email"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="dateNaissance">
                                    Date de naissance
                                </label>
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
                                    required
                                />
                            </div>
                        </>
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
                                mode === "LOGIN" ? "current-password" : "new-password"
                            }
                            placeholder="Votre mot de passe"
                            required
                        />
                    </div>

                    <button className="submit-button" type="submit">
                        {mode === "LOGIN" ? "Se connecter" : "Créer mon compte"}
                        <span aria-hidden="true"> →</span>
                    </button>
                </form>

                <p className="panel-footer">
                    GESTCABMED · Votre santé, notre priorité
                </p>
            </section>
        </main>
    );
}

export default Login;