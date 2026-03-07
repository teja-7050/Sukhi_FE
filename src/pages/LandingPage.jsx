import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import CustomCursor from "../components/CustomCursor";
import { isLoggedIn, getUser, clearAuth } from "../utils/auth";
import "../styles/landing.css";

const features = [
  {
    icon: "🧠",
    title: "Emotion-Aware AI",
    desc: "Understands nuance, tone, and emotional context to deliver truly empathetic responses — not scripted replies.",
  },
  {
    icon: "🔒",
    title: "Fully Private & Secure",
    desc: "End-to-end encrypted sessions. Your thoughts stay yours — never shared, never stored without consent.",
  },
  {
    icon: "🌙",
    title: "Always Present, Always Calm",
    desc: "2 AM panic spiral or midday anxiety — Sukhi is there every moment, without judgment or appointment wait times.",
  },
  {
    icon: "🎯",
    title: "Personalized Pathways",
    desc: "Adapts to your unique triggers and goals to craft a mental wellness journey that truly belongs to you.",
  },
  {
    icon: "📊",
    title: "Mood & Progress Tracking",
    desc: "Visual insights into your emotional patterns, helping you spot triggers and celebrate genuine healing.",
  },
  {
    icon: "🌿",
    title: "Evidence-Based Techniques",
    desc: "CBT, DBT, mindfulness — every recommendation grounded in modern psychology, not generic advice.",
  },
];

const steps = [
  {
    icon: "💬",
    num: "01",
    title: "Share Freely",
    desc: "Open up in your own words. No clinical forms, no judgment — just honest conversation about where you are right now.",
  },
  {
    icon: "🤝",
    num: "02",
    title: "Receive Deep Insight",
    desc: "Sukhi listens, reflects, and offers empathetic guidance tailored precisely to what you're experiencing in this moment.",
  },
  {
    icon: "✨",
    num: "03",
    title: "Grow & Heal",
    desc: "Build lasting resilience with daily micro-tools, habit tracking, and progress you can actually see and feel over time.",
  },
];

const testimonials = [
  {
    init: "A",
    name: "Aanya Sharma",
    role: "Product Designer, Bangalore",
    quote:
      "Sukhi helped me untangle months of overwhelming thoughts. It feels like talking to someone who genuinely understands — warm, intelligent, always there.",
    stars: 5,
  },
  {
    init: "R",
    name: "Rahul Verma",
    role: "Engineering Student, IIT Delhi",
    quote:
      "I was skeptical of AI for mental health but Sukhi changed everything. The reflective prompts helped me through exam season like nothing else ever has.",
    stars: 5,
  },
  {
    init: "P",
    name: "Priya Nair",
    role: "Startup Founder, Mumbai",
    quote:
      "Founder anxiety is brutal. Sukhi became my daily reset — a quiet space to decompress before things spiral. I actually sleep properly now.",
    stars: 5,
  },
  {
    init: "K",
    name: "Karan Malhotra",
    role: "Clinical Therapist, New Delhi",
    quote:
      "I recommend Sukhi to clients between sessions. The support continuity it provides fills gaps that traditional therapy simply cannot. Remarkable.",
    stars: 5,
  },
];

const plans = [
  {
    name: "Free",
    price: "0",
    desc: "Begin your wellness journey with no commitment.",
    features: [
      { on: true, text: "5 AI sessions per week" },
      { on: true, text: "Basic mood tracking" },
      { on: true, text: "Guided breathing exercises" },
      { on: false, text: "Unlimited conversations" },
      { on: false, text: "Progress reports" },
      { on: false, text: "Priority support" },
    ],
  },
  {
    name: "Growth",
    price: "12",
    desc: "For those truly committed to transformation.",
    featured: true,
    features: [
      { on: true, text: "Unlimited AI sessions" },
      { on: true, text: "Advanced mood analytics" },
      { on: true, text: "Full technique library (CBT, DBT)" },
      { on: true, text: "Weekly progress reports" },
      { on: true, text: "Custom wellness plans" },
      { on: false, text: "Priority support" },
    ],
  },
  {
    name: "Clarity",
    price: "28",
    desc: "The complete mental wellness experience.",
    features: [
      { on: true, text: "Everything in Growth" },
      { on: true, text: "Priority 24/7 support" },
      { on: true, text: "Human therapist consultations" },
      { on: true, text: "Family account (up to 3)" },
      { on: true, text: "Export therapy notes" },
      { on: true, text: "Early access to new features" },
    ],
  },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const user = getUser();
  const loggedIn = isLoggedIn();

  // If logged in → go to chat, else ask to login then come back to chat
  const handleJourney = () => {
    if (loggedIn) {
      navigate("/chat");
    } else {
      navigate("/login?redirect=/chat");
    }
  };

  // Smooth scroll to a section by id
  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  // Logout: clear auth then refresh
  const handleLogout = () => {
    clearAuth();
    setProfileOpen(false);
    navigate("/");
    window.location.reload();
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);

    // Close profile dropdown when clicking outside
    const onClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);

    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("visible");
        }),
      { threshold: 0.1 },
    );

    document
      .querySelectorAll(".reveal")
      .forEach((element) => observer.observe(element));

    return () => {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("mousedown", onClickOutside);
      observer.disconnect();
    };
  }, []);

  return (
    <>
      <CustomCursor />

      <nav className={`nav ${scrolled ? "scrolled" : ""}`}>
        <a className="brand" href="#home" aria-label="Sukhi home">
          <img src="/logo.png" alt="Sukhi" className="brand-logo" />
        </a>
        <ul className="nav-links">
          {[
            { label: "Features", id: "features" },
            { label: "How It Works", id: "how-it-works" },
            { label: "Testimonials", id: "testimonials" },
            { label: "Pricing", id: "pricing" },
          ].map(({ label, id }) => (
            <li key={label}>
              <button className="nav-link-btn" onClick={() => scrollTo(id)}>
                {label}
              </button>
            </li>
          ))}
        </ul>

        <div className="nav-right">
          <button className="nav-cta" onClick={handleJourney}>
            Start Healing →
          </button>

          {/* ── Profile Dropdown ── */}
          <div className="profile-wrap" ref={profileRef}>
            <button
              className="profile-btn"
              onClick={() => setProfileOpen((o) => !o)}
              aria-label="User profile"
            >
              {loggedIn && user
                ? user.phone?.slice(-4) // last 4 digits as avatar
                : "👤"}
            </button>

            {profileOpen && (
              <div className="profile-dropdown">
                {loggedIn && user ? (
                  <>
                    <div className="profile-info">
                      <div className="profile-avatar-lg">
                        {user.phone?.slice(-4)}
                      </div>
                      <div>
                        <div className="profile-name">+91 {user.phone}</div>
                        <div className="profile-role">{user.role}</div>
                      </div>
                    </div>
                    <div className="profile-divider" />
                    <button
                      className="profile-action"
                      onClick={() => {
                        setProfileOpen(false);
                        navigate("/chat");
                      }}
                    >
                      💬 Open Chat
                    </button>
                    <button
                      className="profile-action profile-action--danger"
                      onClick={handleLogout}
                    >
                      🚪 Logout
                    </button>
                  </>
                ) : (
                  <>
                    <div className="profile-info">
                      <div className="profile-avatar-lg">👤</div>
                      <div>
                        <div className="profile-name">Not logged in</div>
                        <div className="profile-role">Sign in to continue</div>
                      </div>
                    </div>
                    <div className="profile-divider" />
                    <button
                      className="profile-action"
                      onClick={() => {
                        setProfileOpen(false);
                        navigate("/login?redirect=/chat");
                      }}
                    >
                      🔑 Login
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>

      <section className="hero" id="home">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
        <div className="hero-grid" />
        <div className="hero-content">
          <div className="hero-badge">
            <span className="badge-dot" />
            World's Most Compassionate AI Psychiatrist
          </div>
          <h1>
            Your Mind Deserves<em>Real Healing.</em>
          </h1>
          <p className="hero-sub">
            Sukhi is the AI psychiatrist that truly listens — blending
            cutting-edge psychology with deep warmth, to guide you through
            anxiety, stress, and everything in between.
          </p>
          <div className="hero-actions">
            <button className="btn-primary" onClick={handleJourney}>
              Begin Your Journey — It's Free
            </button>
            <button className="btn-secondary">
              <span className="play-icon">▶</span>See How It Works
            </button>
          </div>
        </div>
        <div className="stats-bar">
          {[
            ["50K+", "Lives Touched"],
            ["4.9★", "Avg Rating"],
            ["94%", "Report Relief"],
            ["24/7", "Always Available"],
          ].map(([value, label]) => (
            <div className="stat-item" key={label}>
              <span className="stat-num">{value}</span>
              <span className="stat-label">{label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="section" id="features">
        <div className="reveal">
          <div className="section-tag">What Sets Us Apart</div>
          <h2 className="section-title">
            Therapy Reimagined
            <br />
            for the <em>Modern Mind</em>
          </h2>
          <p className="section-sub">
            Not a chatbot. Not a mood tracker. Sukhi is a full psychological
            companion built around you.
          </p>
        </div>
        <div className="features-layout">
          <div className="features-grid">
            {features.map((feature, index) => (
              <div
                className={`feat-card reveal d${(index % 3) + 1}`}
                key={feature.title}
              >
                <div className="feat-icon">{feature.icon}</div>
                <div>
                  <div className="feat-title">{feature.title}</div>
                  <div className="feat-desc">{feature.desc}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="reveal d2">
            <div className="preview-card">
              <div className="preview-header">
                <div className="dot-row">
                  <div className="dot dot-r" />
                  <div className="dot dot-y" />
                  <div className="dot dot-g" />
                </div>
                <div className="preview-title-bar">
                  sukhi.ai — Your Safe Space
                </div>
              </div>
              <div className="chat-area">
                <div className="chat-msg">
                  <div className="avatar ai">S</div>
                  <div className="bubble ai">
                    Good morning. How are you feeling today? I'm here and fully
                    listening. 🧡
                  </div>
                </div>
                <div className="chat-msg user">
                  <div className="avatar human">👤</div>
                  <div className="bubble human">
                    Honestly, I've been really anxious about work. Hard to sleep
                    lately.
                  </div>
                </div>
                <div className="chat-msg">
                  <div className="avatar ai">S</div>
                  <div className="bubble ai">
                    That sounds exhausting — carrying that weight into your
                    sleep. Let's slow down. What thoughts feel loudest at night?
                  </div>
                </div>
                <div className="chat-msg">
                  <div className="avatar ai">S</div>
                  <div
                    className="bubble ai"
                    style={{
                      background: "transparent",
                      border: "none",
                      padding: "4px 0",
                    }}
                  >
                    <div className="typing-indicator">
                      <div className="typing-dot" />
                      <div className="typing-dot" />
                      <div className="typing-dot" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="mood-row">
                {[
                  "😌 Calm",
                  "😰 Anxious",
                  "😔 Low",
                  "😤 Stressed",
                  "✨ Hopeful",
                ].map((mood, index) => (
                  <div
                    key={mood}
                    className={`mood-chip ${index === 1 ? "active" : ""}`}
                  >
                    {mood}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="how-section" id="how-it-works">
        <div className="how-inner">
          <div className="reveal" style={{ textAlign: "center" }}>
            <div className="section-tag" style={{ justifyContent: "center" }}>
              The Process
            </div>
            <h2 className="section-title" style={{ textAlign: "center" }}>
              Three Steps to
              <br />
              <em>Inner Clarity</em>
            </h2>
          </div>
          <div className="steps-grid">
            {steps.map((step, index) => (
              <div className={`step-card reveal d${index + 1}`} key={step.num}>
                <div className="step-num">{step.num}</div>
                <div className="step-icon-wrap">{step.icon}</div>
                <div className="step-title">{step.title}</div>
                <div className="step-desc">{step.desc}</div>
                <div className="step-line" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <section className="section" id="testimonials">
        <div className="reveal">
          <div className="section-tag">Real Stories</div>
          <h2 className="section-title">
            Healing That
            <br />
            <em>Speaks for Itself</em>
          </h2>
        </div>
        <div className="testimonials-grid">
          {testimonials.map((testimonial, index) => (
            <div
              className={`testi-card reveal d${(index % 2) + 1}`}
              key={testimonial.name}
            >
              <div className="stars">
                {Array(testimonial.stars)
                  .fill(0)
                  .map((_, starIndex) => (
                    <span key={starIndex} className="star">
                      ★
                    </span>
                  ))}
              </div>
              <p className="quote-text">{testimonial.quote}</p>
              <div className="author-row">
                <div className="author-avatar">{testimonial.init}</div>
                <div>
                  <div className="author-name">{testimonial.name}</div>
                  <div className="author-role">{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="pricing-wrap" id="pricing">
        <div className="pricing-inner">
          <div className="reveal" style={{ textAlign: "center" }}>
            <div className="section-tag" style={{ justifyContent: "center" }}>
              Transparent Pricing
            </div>
            <h2 className="section-title" style={{ textAlign: "center" }}>
              Choose Your Path
              <br />
              to <em>Wellness</em>
            </h2>
            <p className="section-sub" style={{ margin: "0 auto 0" }}>
              Start free. Scale as you heal. Cancel anytime.
            </p>
          </div>
          <div className="pricing-grid">
            {plans.map((plan, index) => (
              <div
                className={`price-card reveal d${index + 1} ${plan.featured ? "featured" : ""}`}
                key={plan.name}
              >
                {plan.featured && (
                  <div className="popular-badge">Most Popular</div>
                )}
                <div className="plan-name">{plan.name}</div>
                <div className="plan-price">
                  <sup>$</sup>
                  {plan.price}
                  <span>/mo</span>
                </div>
                <div className="plan-desc">{plan.desc}</div>
                <div className="plan-divider" />
                <ul className="plan-features">
                  {plan.features.map((feature) => (
                    <li key={feature.text} className={feature.on ? "on" : ""}>
                      <span className={`check ${feature.on ? "" : "off"}`}>
                        {feature.on ? "✓" : "×"}
                      </span>
                      {feature.text}
                    </li>
                  ))}
                </ul>
                <button
                  className={plan.featured ? "btn-primary" : "btn-secondary"}
                  style={{
                    width: "100%",
                    justifyContent: "center",
                    cursor: "none",
                  }}
                >
                  {plan.price === "0" ? "Start Free" : "Get Started"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="cta-section">
        <div className="cta-inner reveal">
          <h2>
            Your Mental Health
            <br />
            Journey Starts <em>Right Now</em>
          </h2>
          <p>
            No waitlist. No insurance forms. No stigma. Just you, Sukhi, and a
            better way forward.
          </p>
          <div className="cta-actions">
            <button
              className="btn-primary"
              style={{ fontSize: 16, padding: "18px 48px" }}
              onClick={handleJourney}
            >
              Talk to Sukhi — Free Forever
            </button>
            <button className="btn-secondary" style={{ fontSize: 15 }}>
              Read the Science Behind Sukhi
            </button>
          </div>
        </div>
      </div>

      <footer>
        <div className="footer-inner">
          <div className="footer-top">
            <div className="footer-brand">
              <a className="brand" href="#home" aria-label="Sukhi home">
                <img
                  src="/logo.png"
                  alt="Sukhi"
                  className="brand-logo brand-logo--footer"
                />
              </a>
              <p>
                The world's most compassionate AI psychiatrist. Built with love,
                grounded in science, designed for every mind.
              </p>
            </div>
            <div className="footer-links">
              {[
                {
                  head: "Product",
                  links: ["Features", "How It Works", "Pricing", "Research"],
                },
                {
                  head: "Company",
                  links: ["About Us", "Blog", "Careers", "Press"],
                },
                {
                  head: "Support",
                  links: ["Help Center", "Privacy Policy", "Terms", "Contact"],
                },
              ].map((col) => (
                <div className="footer-col" key={col.head}>
                  <h4>{col.head}</h4>
                  <ul>
                    {col.links.map((link) => (
                      <li key={link}>
                        <a href="#">{link}</a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
          <div className="footer-bottom">
            <p>
              © 2025 Sukhi AI. All rights reserved. Not a substitute for
              professional clinical care.
            </p>
            <div className="footer-socials">
              {["𝕏", "in", "▶", "📷"].map((social) => (
                <a key={social} className="social-btn" href="#">
                  {social}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
