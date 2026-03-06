import "./App.css";

function App() {
  const navLinks = [
    { label: "Features", href: "#features" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Testimonials", href: "#testimonials" },
  ];

  const features = [
    {
      title: "Emotion-Aware Conversations",
      description:
        "Sukhi understands tone and context to offer gentle, personalized guidance in every chat.",
    },
    {
      title: "24/7 Support Space",
      description:
        "Whether it is late-night stress or a tough day, your AI companion is always available.",
    },
    {
      title: "Science-Backed Practices",
      description:
        "From grounding exercises to reflective prompts, every recommendation is inspired by modern psychology.",
    },
  ];

  const steps = [
    "Share how you are feeling in your own words.",
    "Receive instant empathetic insights and coping tools.",
    "Build healthier habits with daily micro-check-ins.",
  ];

  const testimonials = [
    {
      quote:
        "Sukhi helped me structure my thoughts when I felt overwhelmed. It feels calm, private, and surprisingly supportive.",
      author: "Aanya, Product Designer",
    },
    {
      quote:
        "The short mindfulness prompts made a real difference in my routine. It is like having a thoughtful guide in my pocket.",
      author: "Rahul, Engineering Student",
    },
  ];

  return (
    <div className="page">
      <header className="navbar">
        <a className="brand" href="#home">
          Sukhi
        </a>
        <nav>
          <ul className="nav-links">
            {navLinks.map((link) => (
              <li key={link.label}>
                <a href={link.href}>{link.label}</a>
              </li>
            ))}
          </ul>
        </nav>
        <button className="nav-cta">Start Chatting</button>
      </header>

      <main>
        <section className="hero" id="home">
          <p className="badge">AI Psychology Guidance Chatbot</p>
          <h1>Feel Heard. Find Clarity. Grow with Sukhi.</h1>
          <p className="hero-text">
            A modern wellbeing companion designed to help you navigate stress,
            anxiety, and daily emotions through compassionate AI conversations.
          </p>
          <div className="hero-actions">
            <button className="primary">Get Started Free</button>
            <button className="secondary">Watch Demo</button>
          </div>
        </section>

        <section className="section" id="features">
          <h2>Why People Choose Sukhi</h2>
          <div className="grid three">
            {features.map((feature) => (
              <article className="card" key={feature.title}>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section" id="how-it-works">
          <h2>How It Works</h2>
          <div className="grid three">
            {steps.map((step, index) => (
              <article className="card step-card" key={step}>
                <span className="step-number">0{index + 1}</span>
                <p>{step}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section" id="testimonials">
          <h2>Trusted by Real People</h2>
          <div className="grid two">
            {testimonials.map((item) => (
              <article className="card" key={item.author}>
                <p className="quote">“{item.quote}”</p>
                <p className="author">{item.author}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="cta">
          <h2>Ready to begin your mental wellness journey?</h2>
          <p>Join Sukhi and start meaningful conversations today.</p>
          <button className="primary">Try Sukhi Now</button>
        </section>
      </main>
    </div>
  );
}

export default App;
