import { useEffect, useRef, useState } from "react";
import zahraouiPortrait from "../assets/al-zahraoui-portrait.webp";
import { Link } from "react-router-dom";
import {
  LogoAlZahraoui,
  IconAppointmentCalendar,
  IconPrescription,
  IconPatientDossier,
  IconConsultation,
  IconPills,
  IconFirstAidBox,
  IconUser,
  IconStethoscope,
  IconCheckCircle,
  IconArrowRight,
} from "../components/MedicalIcons";
import "./LandingPage.css";

const features = [
  {
    Icon: IconAppointmentCalendar,
    title: "Rendez-vous fluides",
    text: "Demandes, planification et suivi des rendez-vous : tout le parcours au même endroit.",
    tag: "Organisation",
    color: "aqua",
  },
  {
    Icon: IconPatientDossier,
    title: "Dossiers patients",
    text: "Retrouvez les informations nécessaires au suivi médical dans un espace dédié.",
    tag: "Suivi médical",
    color: "blue",
  },
  {
    Icon: IconConsultation,
    title: "Consultations",
    text: "Accédez au suivi des consultations et centralisez les actes du cabinet.",
    tag: "Pratique médicale",
    color: "gold",
  },
  {
    Icon: IconPrescription,
    title: "Ordonnances",
    text: "Gérez les prescriptions du médecin et permettez au patient de retrouver les siennes.",
    tag: "Prescription",
    color: "aqua",
  },
  {
    Icon: IconPills,
    title: "Médicaments",
    text: "Une gestion simplifiée des médicaments et du stock au sein du cabinet.",
    tag: "Pharmacie",
    color: "blue",
  },
  {
    Icon: IconFirstAidBox,
    title: "Salle d’attente",
    text: "La secrétaire suit les arrivées et organise la file d’attente de la journée.",
    tag: "Accueil",
    color: "gold",
  },
];

const spaces = [
  {
    id: "patient",
    tab: "Patient",
    badge: "01 / VOTRE PARCOURS",
    title: "Votre santé est notre responsabilité.",
    intro: "Un espace personnel pour préparer vos visites et suivre les informations qui vous concernent.",
    Icon: IconUser,
    actions: [
      "Demander un rendez-vous",
      "Consulter les rendez-vous",
      "Retrouver ses ordonnances",
    ],
    mockTitle: "Mon espace patient",
    mockSubtitle: "Un parcours simple et clair",
    mockCard: "Prochain rendez-vous",
    mockValue: "Suivi de ma demande",
    mockStatus: "En un seul endroit",
  },
  {
    id: "medecin",
    tab: "Médecin",
    badge: "02 / VOTRE PRATIQUE",
    title: "Plus de temps pour l’essentiel.",
    intro: "Une vision structurée de l’activité médicale, du dossier patient à la prescription.",
    Icon: IconStethoscope,
    actions: [
      "Consulter les dossiers patients",
      "Suivre les consultations",
      "Gérer ordonnances et médicaments",
    ],
    mockTitle: "Espace médecin",
    mockSubtitle: "Votre cabinet, organisé",
    mockCard: "Suivi des consultations",
    mockValue: "Dossiers centralisés",
    mockStatus: "Vue simplifiée",
  },
  {
    id: "secretaire",
    tab: "Secrétaire",
    badge: "03 / VOTRE ORGANISATION",
    title: "Un accueil qui avance avec vous.",
    intro: "Un tableau de bord pour coordonner les rendez-vous, l’accueil et le fonctionnement quotidien.",
    Icon: IconFirstAidBox,
    actions: [
      "Planifier les rendez-vous",
      "Organiser la salle d’attente",
      "Suivre les tâches administratives",
    ],
    mockTitle: "Espace secrétaire",
    mockSubtitle: "L’accueil sous contrôle",
    mockCard: "Salle d’attente",
    mockValue: "Planning organisé",
    mockStatus: "Vue quotidienne",
  },
];

function ArrowUpRight({ size = 18 }) {
  return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M6 18 18 6M8 6h10v10" />
      </svg>
  );
}

function MenuIcon({ isOpen }) {
  return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" aria-hidden="true">
        {isOpen ? <path d="M5 5 19 19M19 5 5 19" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
      </svg>
  );
}

function Brand({ inverted = false }) {
  return (
      <Link to="/" className={`azlp-brand ${inverted ? "azlp-brand--inverse" : ""}`} aria-label="Al-Zahraoui, accueil">
        <span className="azlp-brand__symbol"><LogoAlZahraoui size={34} /></span>
        <span className="azlp-brand__words">
        <strong>AL-ZAHRAOUI<span className="azlp-brand__dot">.</span></strong>
        <small>CABINET MÉDICAL DIGITAL</small>
      </span>
      </Link>
  );
}

function LandingPage() {
  const pageRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSpace, setActiveSpace] = useState("patient");
  const selected = spaces.find((space) => space.id === activeSpace) || spaces[0];
  const SelectedIcon = selected.Icon;

  useEffect(() => {
    document.title = "Al-Zahraoui — L’art de soigner, la simplicité de gérer";
  }, []);

  // Révélation progressive des éléments au défilement (sans bibliothèque externe).
  useEffect(() => {
    const root = pageRef.current;
    if (!root) return;

    // Les animations sont facultatives pour les personnes sensibles au mouvement.
    const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion || !("IntersectionObserver" in window)) return;

    const elements = root.querySelectorAll("[data-reveal]");
    const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("azlp-in-view");
            observer.unobserve(entry.target);
          });
        },
        { threshold: 0.1, rootMargin: "0px 0px -25px 0px" }
    );

    root.classList.add("azlp-motion-ready");
    elements.forEach((element) => observer.observe(element));

    return () => {
      observer.disconnect();
      root.classList.remove("azlp-motion-ready");
    };
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
      <div className="azlp" ref={pageRef}>
        <a className="azlp-skip" href="#contenu">Aller au contenu</a>

        <header className="azlp-header">
          <div className="azlp-container azlp-header__inner">
            <Brand />
            <nav className={`azlp-nav ${menuOpen ? "azlp-nav--open" : ""}`} id="azlp-navigation" aria-label="Navigation principale">
              <a href="#fonctionnalites" onClick={closeMenu}>Fonctionnalités</a>
              <a href="#espaces" onClick={closeMenu}>Nos espaces</a>
              <a href="#heritage" onClick={closeMenu}>Notre inspiration</a>
              <Link className="azlp-nav__mobile-login" to="/login" onClick={closeMenu}>Se connecter</Link>
            </nav>
            <div className="azlp-header__actions">
              <Link to="/login" className="azlp-header__login">Mon espace <ArrowUpRight size={16} /></Link>
              <button
                  className="azlp-menu-toggle"
                  type="button"
                  aria-expanded={menuOpen}
                  aria-controls="azlp-navigation"
                  aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
                  onClick={() => setMenuOpen(!menuOpen)}
              >
                <MenuIcon isOpen={menuOpen} />
              </button>
            </div>
          </div>
        </header>

        <main id="contenu">
          <section className="azlp-hero" aria-labelledby="azlp-hero-title">
            <div className="azlp-hero__grid" aria-hidden="true" />
            <div className="azlp-hero__glow" aria-hidden="true" />
            <div className="azlp-container azlp-hero__layout">
              <div className="azlp-hero__copy">
                <div className="azlp-eyebrow azlp-eyebrow--light"><span className="azlp-eyebrow__line" /> LA MÉDECINE, AUTREMENT</div>
                <h1 id="azlp-hero-title">Un héritage de <em>soin.</em><br />Une nouvelle façon de <span>gérer.</span></h1>
                <p className="azlp-hero__description">Inspirée par le savoir d’Al-Zahraoui, notre plateforme rapproche patients, médecins et secrétaires dans une expérience médicale plus simple, plus claire et plus humaine.</p>
                <div className="azlp-hero__actions">
                  <Link className="azlp-button azlp-button--primary" to="/login">Accéder à mon espace <ArrowUpRight size={18} /></Link>
                  <a className="azlp-button azlp-button--outline" href="#fonctionnalites">Découvrir la plateforme <IconArrowRight size={18} /></a>
                </div>
                <div className="azlp-hero__trust">
                  <div className="azlp-hero__avatars" aria-hidden="true"><span><IconUser size={18} /></span><span><IconStethoscope size={18} /></span><span><IconFirstAidBox size={18} /></span></div>
                  <p><strong>Un cabinet connecté.</strong><br />Trois espaces, un parcours cohérent.</p>
                </div>
              </div>

              <div className="azlp-hero__visual">
                <div className="azlp-hero__orbit azlp-hero__orbit--one" aria-hidden="true" />
                <div className="azlp-hero__orbit azlp-hero__orbit--two" aria-hidden="true" />
                <figure className="azlp-portrait">
                  <img
                      src={zahraouiPortrait}
                      alt="Illustration artistique d'Al-Zahraoui"
                      fetchPriority="high"
                  />
                  <figcaption>
                    <span className="azlp-portrait__overline">L’INSPIRATION DERRIÈRE NOTRE NOM</span>
                    <strong>Abu al-Qasim Al-Zahraoui</strong>
                    <span>Cordoue · 936–1013</span>
                  </figcaption>
                </figure>
                <div className="azlp-float azlp-float--appointment" aria-label="Aperçu illustratif d’une carte de rendez-vous">
                  <span className="azlp-float__icon"><IconAppointmentCalendar size={20} /></span>
                  <span><small>Votre organisation</small><strong>Rendez-vous centralisés</strong><em><span className="azlp-live-dot" /> Parcours simplifié</em></span>
                </div>
                <div className="azlp-float azlp-float--insight" aria-hidden="true"><span className="azlp-float__round"><IconCheckCircle size={19} /></span><span><strong>Une vision claire</strong><small>À chaque étape du soin</small></span></div>
              </div>
            </div>
            <div className="azlp-hero__bottom" aria-hidden="true"><span>HÉRITAGE & INNOVATION</span><span>SCROLL POUR EXPLORER ↓</span></div>
          </section>

          <div className="azlp-bridge" aria-label="Promesse de la plateforme">
            <div className="azlp-container azlp-bridge__inner" data-reveal="up">
              <span><span className="azlp-bridge__small-icon">✦</span> Plus de clarté au quotidien</span>
              <span><span className="azlp-bridge__small-icon">✦</span> Un suivi médical structuré</span>
              <span><span className="azlp-bridge__small-icon">✦</span> Un espace pour chaque rôle</span>
            </div>
          </div>

          <section id="fonctionnalites" className="azlp-section azlp-features" aria-labelledby="azlp-feature-title">
            <div className="azlp-container">
              <div className="azlp-section__intro" data-reveal="up">
                <div>
                  <span className="azlp-eyebrow"><span className="azlp-eyebrow__line" /> CE QUI NOUS RASSEMBLE</span>
                  <h2 id="azlp-feature-title">Votre cabinet.<br /><em>Tout simplement.</em></h2>
                </div>
                <p>Les fonctionnalités essentielles de la gestion médicale réunies dans une interface pensée pour rendre le quotidien plus fluide.</p>
              </div>
              <div className="azlp-features__grid">
                {features.map(({ Icon, title, text, tag, color }, index) => (
                    <article className="azlp-feature" key={title} data-reveal="up" style={{ "--azlp-delay": `${index * 80}ms` }}>
                      <div className="azlp-feature__top"><span className={`azlp-feature__icon azlp-feature__icon--${color}`}><Icon size={26} /></span><span className="azlp-feature__number">0{index + 1}</span></div>
                      <h3>{title}</h3>
                      <p>{text}</p>
                      <span className="azlp-feature__tag">{tag}</span>
                    </article>
                ))}
              </div>
            </div>
          </section>

          <section id="espaces" className="azlp-section azlp-spaces" aria-labelledby="azlp-spaces-title">
            <div className="azlp-container">
              <div className="azlp-spaces__heading" data-reveal="up">
                <div><span className="azlp-eyebrow"><span className="azlp-eyebrow__line" /> CHACUN À SA PLACE</span><h2 id="azlp-spaces-title">Une plateforme.<br /><em>Trois expériences.</em></h2></div>
                <div className="azlp-spaces__tabs" role="tablist" aria-label="Choisir un espace utilisateur">
                  {spaces.map(({ id, tab, Icon }) => (
                      <button key={id} type="button" role="tab" id={`azlp-tab-${id}`} aria-controls="azlp-space-panel" aria-selected={activeSpace === id} className={`azlp-spaces__tab ${activeSpace === id ? "azlp-spaces__tab--active" : ""}`} onClick={() => setActiveSpace(id)}><Icon size={18} /> {tab}</button>
                  ))}
                </div>
              </div>
              <div className="azlp-spaces__body" role="tabpanel" id="azlp-space-panel" aria-labelledby={`azlp-tab-${selected.id}`} key={selected.id}>
                <div className="azlp-spaces__copy">
                  <span className="azlp-spaces__overline">{selected.badge}</span>
                  <h3>{selected.title}</h3>
                  <p>{selected.intro}</p>
                  <ul>{selected.actions.map(action => <li key={action}><IconCheckCircle size={20} /> {action}</li>)}</ul>
                  <Link to="/login" className="azlp-inline-link">Découvrir mon espace <ArrowUpRight size={19} /></Link>
                </div>
                <div className="azlp-preview" aria-label={`Aperçu illustratif de l'espace ${selected.tab}`}>
                  <div className="azlp-preview__app">
                    <div className="azlp-preview__bar"><div className="azlp-preview__bar-brand"><span className="azlp-preview__app-icon"><LogoAlZahraoui size={20} /></span><b>Al-Zahraoui</b></div><span className="azlp-preview__dots"><i /><i /><i /></span></div>
                    <div className="azlp-preview__content">
                      <span className="azlp-preview__mini-label">VOTRE TABLEAU DE BORD</span>
                      <h4>{selected.mockTitle}</h4><p>{selected.mockSubtitle}</p>
                      <div className="azlp-preview__card">
                        <div className="azlp-preview__card-icon"><SelectedIcon size={27} /></div>
                        <div><small>{selected.mockCard}</small><strong>{selected.mockValue}</strong><span>{selected.mockStatus}</span></div>
                        <span className="azlp-preview__card-arrow"><ArrowUpRight size={17} /></span>
                      </div>
                      <div className="azlp-preview__rows">
                        {selected.actions.map((action, index) => <div key={action} className="azlp-preview__row"><span className="azlp-preview__row-dot">0{index + 1}</span><span>{action}</span><IconArrowRight size={15} /></div>)}
                      </div>
                    </div>
                  </div>
                  <span className="azlp-preview__disclaimer">Aperçu conceptuel · Interface illustrative</span>
                </div>
              </div>
            </div>
          </section>

          <section id="heritage" className="azlp-section azlp-heritage" aria-labelledby="azlp-heritage-title">
            <div className="azlp-container azlp-heritage__layout">
              <div className="azlp-heritage__left" data-reveal="left">
                <div className="azlp-heritage__year">936 <span>—</span> 1013</div>
                <span className="azlp-heritage__script" lang="ar" dir="rtl">أبو القاسم الزهراوي</span>
                <div className="azlp-heritage__seal" aria-hidden="true">AZ<span>✦</span></div>
              </div>
              <div className="azlp-heritage__copy" data-reveal="right">
                <span className="azlp-eyebrow"><span className="azlp-eyebrow__line" /> NOTRE INSPIRATION</span>
                <h2 id="azlp-heritage-title">Un nom qui traverse <em>les siècles.</em></h2>
                <p>Abu al-Qasim Al-Zahraoui, connu en Occident sous le nom d’Abulcasis, était un médecin et chirurgien de l’Andalousie omeyyade. Né vers 936 près de Cordoue et mort en 1013, il a marqué l’histoire de la médecine par ses écrits et ses instruments chirurgicaux.</p>
                <p>Son encyclopédie médicale, <em>Al-Tasrif</em>, a contribué à transmettre les savoirs médicaux bien au-delà de son époque. Notre application porte son nom comme un hommage à la rigueur, au savoir et à l’attention portée au patient.</p>
                <div className="azlp-heritage__note"><span>✦</span><span>Une inspiration historique, une ambition résolument contemporaine.</span></div>
              </div>
            </div>
          </section>

          <section className="azlp-section azlp-steps" aria-labelledby="azlp-steps-title">
            <div className="azlp-container">
              <div className="azlp-steps__heading" data-reveal="up"><span className="azlp-eyebrow"><span className="azlp-eyebrow__line" /> L’ESSENTIEL SANS COMPLEXITÉ</span><h2 id="azlp-steps-title">Comment ça <em>marche ?</em></h2><p>Trois étapes pour découvrir un cabinet médical mieux organisé.</p></div>
              <div className="azlp-steps__list">
                <div className="azlp-step" data-reveal="up" style={{ "--azlp-delay": "0ms" }}><span className="azlp-step__number">01</span><div><h3>Connectez-vous</h3><p>Accédez à votre espace personnel selon votre rôle dans le cabinet.</p></div><IconArrowRight size={23} /></div>
                <div className="azlp-step" data-reveal="up" style={{ "--azlp-delay": "120ms" }}><span className="azlp-step__number">02</span><div><h3>Retrouvez vos outils</h3><p>Rendez-vous, consultations, ordonnances et services selon vos besoins.</p></div><IconArrowRight size={23} /></div>
                <div className="azlp-step" data-reveal="up" style={{ "--azlp-delay": "240ms" }}><span className="azlp-step__number">03</span><div><h3>Avancez sereinement</h3><p>Un parcours plus lisible pour les patients et les professionnels.</p></div><IconCheckCircle size={23} /></div>
              </div>
            </div>
          </section>

          <section className="azlp-cta" aria-labelledby="azlp-cta-title">
            <div className="azlp-container azlp-cta__content" data-reveal="up">
              <span className="azlp-eyebrow azlp-eyebrow--light"><span className="azlp-eyebrow__line" /> UN NOUVEAU CHAPITRE COMMENCE</span>
              <h2 id="azlp-cta-title">Prêt à découvrir le cabinet <em>de demain ?</em></h2>
              <p>Votre espace Al-Zahraoui vous attend.</p>
              <Link to="/login" className="azlp-button azlp-button--primary">Accéder à la plateforme <ArrowUpRight size={19} /></Link>
            </div>
          </section>
        </main>

        <footer className="azlp-footer">
          <div className="azlp-container azlp-footer__top"><Brand inverted /><div><a href="#fonctionnalites">Fonctionnalités</a><a href="#espaces">Espaces</a><a href="#heritage">Notre inspiration</a><Link to="/login">Connexion</Link></div></div>
          <div className="azlp-container azlp-footer__bottom"><span>© {new Date().getFullYear()} Al-Zahraoui · Cabinet médical digital</span><span>Le portrait d’Al-Zahraoui est une interprétation artistique, et non une photographie historique.</span></div>
        </footer>
      </div>
  );
}

export default LandingPage;
