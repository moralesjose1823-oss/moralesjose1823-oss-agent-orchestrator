import Head from "next/head";
import { useState } from "react";
import { company } from "../lib/company";

export default function CompanySite() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", company: "", message: "" });
  const [status, setStatus] = useState({ state: "idle", msg: "" });

  const accent = company.accent;

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (status.state === "loading") return;
    setStatus({ state: "loading", msg: "" });
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setStatus({ state: "success", msg: "Thanks — we'll be in touch within two business days." });
      setForm({ name: "", email: "", company: "", message: "" });
    } catch (err) {
      setStatus({ state: "error", msg: err.message });
    }
  }

  return (
    <>
      <Head>
        <title>{`${company.name} — ${company.tagline}`}</title>
        <meta name="description" content={company.description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="og:title" content={company.name} />
        <meta property="og:description" content={company.description} />
      </Head>

      <div className="site">
        {/* NAV */}
        <header className="nav">
          <div className="nav-inner">
            <a href="#top" className="brand">
              <span className="brand-mark">◈</span>
              <span className="brand-name">{company.shortName}</span>
            </a>

            <nav className={`nav-links ${menuOpen ? "open" : ""}`}>
              {company.nav.map((item) => (
                <a key={item.href} href={item.href} onClick={() => setMenuOpen(false)}>
                  {item.label}
                </a>
              ))}
              <a href="#contact" className="nav-cta" onClick={() => setMenuOpen(false)}>
                Get started
              </a>
            </nav>

            <button
              className="menu-toggle"
              aria-label="Toggle menu"
              onClick={() => setMenuOpen((o) => !o)}
            >
              {menuOpen ? "✕" : "☰"}
            </button>
          </div>
        </header>

        <main id="top">
          {/* HERO */}
          <section className="hero">
            <div className="hero-glow" />
            <div className="container hero-inner">
              <p className="eyebrow">{company.hero.eyebrow}</p>
              <h1 className="hero-heading">{company.hero.heading}</h1>
              <p className="hero-sub">{company.hero.sub}</p>
              <div className="hero-ctas">
                <a className="btn btn-primary" href={company.hero.primaryCta.href}>
                  {company.hero.primaryCta.label}
                </a>
                <a className="btn btn-ghost" href={company.hero.secondaryCta.href}>
                  {company.hero.secondaryCta.label} →
                </a>
              </div>
            </div>
          </section>

          {/* STATS */}
          <section className="stats">
            <div className="container stats-grid">
              {company.stats.map((s) => (
                <div className="stat" key={s.label}>
                  <div className="stat-value">{s.value}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              ))}
            </div>
          </section>

          {/* SERVICES */}
          <section id="services" className="section">
            <div className="container">
              <div className="section-head">
                <p className="section-eyebrow">What we do</p>
                <h2 className="section-title">Full-service sports business advisory</h2>
              </div>
              <div className="cards">
                {company.services.map((svc) => (
                  <div className="card" key={svc.title}>
                    <span className="card-icon">{svc.icon}</span>
                    <h3>{svc.title}</h3>
                    <p>{svc.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ABOUT */}
          <section id="about" className="section about">
            <div className="container about-grid">
              <div>
                <p className="section-eyebrow">About us</p>
                <h2 className="section-title">{company.about.heading}</h2>
                {company.about.body.map((p, i) => (
                  <p className="about-text" key={i}>
                    {p}
                  </p>
                ))}
              </div>
              <ul className="about-points">
                {company.about.points.map((pt) => (
                  <li key={pt}>
                    <span className="check">✓</span>
                    {pt}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* WORK */}
          <section id="work" className="section">
            <div className="container">
              <div className="section-head">
                <p className="section-eyebrow">Selected work</p>
                <h2 className="section-title">Partnerships, measured</h2>
              </div>
              <div className="work-grid">
                {company.work.map((w) => (
                  <article className="work-card" key={w.title}>
                    <span className="work-tag">{w.tag}</span>
                    <h3>{w.title}</h3>
                    <p>{w.body}</p>
                    <div className="work-metric">{w.metric}</div>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* TEAM */}
          <section id="team" className="section about">
            <div className="container">
              <div className="section-head">
                <p className="section-eyebrow">The team</p>
                <h2 className="section-title">People behind the work</h2>
              </div>
              <div className="team-grid">
                {company.team.map((m) => (
                  <div className="team-card" key={m.name}>
                    <div className="avatar">{m.initials}</div>
                    <h3>{m.name}</h3>
                    <div className="team-role">{m.role}</div>
                    <p>{m.bio}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* TESTIMONIALS */}
          <section className="section">
            <div className="container testimonials">
              {company.testimonials.map((t, i) => (
                <blockquote className="quote" key={i}>
                  <p>“{t.quote}”</p>
                  <footer>
                    <span className="quote-name">{t.name}</span>
                    <span className="quote-role">{t.role}</span>
                  </footer>
                </blockquote>
              ))}
            </div>
          </section>

          {/* CONTACT */}
          <section id="contact" className="section contact">
            <div className="container contact-grid">
              <div className="contact-info">
                <p className="section-eyebrow">Contact</p>
                <h2 className="section-title">{company.contact.heading}</h2>
                <p className="about-text">{company.contact.sub}</p>
                <ul className="contact-details">
                  <li>
                    <span>Email</span>
                    <a href={`mailto:${company.email}`}>{company.email}</a>
                  </li>
                  <li>
                    <span>Phone</span>
                    <a href={`tel:${company.phone.replace(/[^+\d]/g, "")}`}>{company.phone}</a>
                  </li>
                  <li>
                    <span>Location</span>
                    {company.location}
                  </li>
                </ul>
              </div>

              <form className="contact-form" onSubmit={handleSubmit}>
                <div className="field-row">
                  <label className="field">
                    <span>Name</span>
                    <input
                      type="text"
                      value={form.name}
                      onChange={update("name")}
                      placeholder="Your name"
                      required
                    />
                  </label>
                  <label className="field">
                    <span>Email</span>
                    <input
                      type="email"
                      value={form.email}
                      onChange={update("email")}
                      placeholder="you@example.com"
                      required
                    />
                  </label>
                </div>
                <label className="field">
                  <span>Company / Organization</span>
                  <input
                    type="text"
                    value={form.company}
                    onChange={update("company")}
                    placeholder="Optional"
                  />
                </label>
                <label className="field">
                  <span>Message</span>
                  <textarea
                    rows={4}
                    value={form.message}
                    onChange={update("message")}
                    placeholder="Tell us about your goals…"
                    required
                  />
                </label>
                <button
                  className="btn btn-primary full"
                  type="submit"
                  disabled={status.state === "loading"}
                >
                  {status.state === "loading" ? "Sending…" : "Send message"}
                </button>
                {status.msg && (
                  <p className={`form-status ${status.state}`}>{status.msg}</p>
                )}
              </form>
            </div>
          </section>
        </main>

        {/* FOOTER */}
        <footer className="footer">
          <div className="container footer-inner">
            <div className="footer-brand">
              <span className="brand-mark">◈</span> {company.name}
              <p>{company.tagline}</p>
            </div>
            <div className="footer-social">
              {company.social.map((s) => (
                <a key={s.label} href={s.href}>
                  {s.label}
                </a>
              ))}
            </div>
          </div>
          <div className="footer-bottom container">
            © {new Date().getFullYear()} {company.name}. All rights reserved.
          </div>
        </footer>
      </div>

      <style jsx global>{`
        html,
        body,
        #__next {
          background: #ffffff;
          color: #16161a;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
            Helvetica, Arial, sans-serif;
          height: auto;
          scroll-behavior: smooth;
        }
        a {
          color: inherit;
          text-decoration: none;
        }
      `}</style>

      <style jsx>{`
        .site {
          --accent: ${accent};
          --accent-soft: ${company.accentSoft};
          --ink: #16161a;
          --muted: #5b5b66;
          --line: #ececf0;
          --bg-soft: #f7f7f9;
          min-height: 100vh;
        }
        .container {
          width: 100%;
          max-width: 1140px;
          margin: 0 auto;
          padding: 0 24px;
        }

        /* NAV */
        .nav {
          position: sticky;
          top: 0;
          z-index: 50;
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: saturate(180%) blur(12px);
          border-bottom: 1px solid var(--line);
        }
        .nav-inner {
          max-width: 1140px;
          margin: 0 auto;
          padding: 0 24px;
          height: 68px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .brand {
          display: flex;
          align-items: center;
          gap: 9px;
          font-weight: 700;
          font-size: 18px;
          letter-spacing: -0.01em;
        }
        .brand-mark {
          color: var(--accent);
        }
        .nav-links {
          display: flex;
          align-items: center;
          gap: 30px;
        }
        .nav-links a {
          font-size: 15px;
          color: var(--muted);
          font-weight: 500;
          transition: color 0.15s ease;
        }
        .nav-links a:hover {
          color: var(--ink);
        }
        .nav-cta {
          background: var(--ink);
          color: #fff !important;
          padding: 9px 18px;
          border-radius: 8px;
          font-weight: 600;
        }
        .nav-cta:hover {
          background: var(--accent);
        }
        .menu-toggle {
          display: none;
          background: none;
          border: none;
          font-size: 22px;
          cursor: pointer;
          color: var(--ink);
        }

        /* HERO */
        .hero {
          position: relative;
          overflow: hidden;
          padding: 110px 0 90px;
          background: linear-gradient(180deg, #fff 0%, var(--bg-soft) 100%);
        }
        .hero-glow {
          position: absolute;
          top: -180px;
          right: -120px;
          width: 520px;
          height: 520px;
          background: radial-gradient(circle, var(--accent-soft), transparent 65%);
          opacity: 0.5;
          pointer-events: none;
        }
        .hero-inner {
          position: relative;
          text-align: center;
          max-width: 820px;
        }
        .eyebrow {
          text-transform: uppercase;
          letter-spacing: 0.12em;
          font-size: 13px;
          font-weight: 700;
          color: var(--accent);
          margin-bottom: 20px;
        }
        .hero-heading {
          font-size: clamp(40px, 6vw, 66px);
          line-height: 1.05;
          letter-spacing: -0.03em;
          font-weight: 800;
          margin-bottom: 22px;
        }
        .hero-sub {
          font-size: clamp(17px, 2.2vw, 20px);
          color: var(--muted);
          line-height: 1.6;
          max-width: 640px;
          margin: 0 auto 36px;
        }
        .hero-ctas {
          display: flex;
          gap: 14px;
          justify-content: center;
          flex-wrap: wrap;
        }
        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 14px 26px;
          border-radius: 10px;
          font-weight: 600;
          font-size: 16px;
          cursor: pointer;
          border: 1px solid transparent;
          transition: transform 0.12s ease, background 0.15s ease, box-shadow 0.15s ease;
        }
        .btn:hover {
          transform: translateY(-1px);
        }
        .btn-primary {
          background: var(--accent);
          color: #fff;
          box-shadow: 0 8px 22px rgba(255, 107, 53, 0.28);
        }
        .btn-ghost {
          background: transparent;
          color: var(--ink);
          border-color: var(--line);
        }
        .btn-ghost:hover {
          border-color: var(--ink);
        }
        .btn.full {
          width: 100%;
        }

        /* STATS */
        .stats {
          border-top: 1px solid var(--line);
          border-bottom: 1px solid var(--line);
          background: #fff;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
          padding-top: 44px;
          padding-bottom: 44px;
        }
        .stat {
          text-align: center;
        }
        .stat-value {
          font-size: 40px;
          font-weight: 800;
          letter-spacing: -0.02em;
          color: var(--ink);
        }
        .stat-label {
          margin-top: 6px;
          font-size: 14px;
          color: var(--muted);
        }

        /* SECTIONS */
        .section {
          padding: 96px 0;
        }
        .about,
        .contact {
          background: var(--bg-soft);
        }
        .section-head {
          text-align: center;
          max-width: 640px;
          margin: 0 auto 56px;
        }
        .section-eyebrow {
          text-transform: uppercase;
          letter-spacing: 0.12em;
          font-size: 13px;
          font-weight: 700;
          color: var(--accent);
          margin-bottom: 12px;
        }
        .section-title {
          font-size: clamp(28px, 4vw, 40px);
          font-weight: 800;
          letter-spacing: -0.02em;
          line-height: 1.15;
        }

        /* CARDS */
        .cards {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 22px;
        }
        .card {
          background: #fff;
          border: 1px solid var(--line);
          border-radius: 14px;
          padding: 30px 26px;
          transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
        }
        .card:hover {
          transform: translateY(-3px);
          box-shadow: 0 14px 34px rgba(20, 20, 30, 0.08);
          border-color: transparent;
        }
        .card-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 46px;
          height: 46px;
          border-radius: 12px;
          background: var(--accent-soft);
          color: var(--accent);
          font-size: 22px;
          margin-bottom: 18px;
        }
        .card h3 {
          font-size: 19px;
          font-weight: 700;
          margin-bottom: 10px;
        }
        .card p {
          color: var(--muted);
          line-height: 1.6;
          font-size: 15px;
        }

        /* ABOUT */
        .about-grid {
          display: grid;
          grid-template-columns: 1.3fr 1fr;
          gap: 56px;
          align-items: center;
        }
        .about-text {
          color: var(--muted);
          line-height: 1.7;
          font-size: 16px;
          margin-top: 18px;
        }
        .about .section-title {
          text-align: left;
        }
        .about-points {
          list-style: none;
          display: grid;
          gap: 16px;
          background: #fff;
          border: 1px solid var(--line);
          border-radius: 14px;
          padding: 30px;
        }
        .about-points li {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          font-weight: 500;
          line-height: 1.5;
        }
        .check {
          flex-shrink: 0;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: var(--accent);
          color: #fff;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
        }

        /* WORK */
        .work-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 22px;
        }
        .work-card {
          background: #fff;
          border: 1px solid var(--line);
          border-radius: 14px;
          padding: 28px;
          display: flex;
          flex-direction: column;
        }
        .work-tag {
          align-self: flex-start;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--accent);
          background: var(--accent-soft);
          padding: 5px 12px;
          border-radius: 20px;
          margin-bottom: 16px;
        }
        .work-card h3 {
          font-size: 19px;
          font-weight: 700;
          margin-bottom: 10px;
          line-height: 1.3;
        }
        .work-card p {
          color: var(--muted);
          line-height: 1.6;
          font-size: 15px;
          flex: 1;
        }
        .work-metric {
          margin-top: 20px;
          padding-top: 16px;
          border-top: 1px solid var(--line);
          font-weight: 800;
          color: var(--ink);
          font-size: 18px;
        }

        /* TEAM */
        .team-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 22px;
        }
        .team-card {
          background: #fff;
          border: 1px solid var(--line);
          border-radius: 14px;
          padding: 30px;
          text-align: center;
        }
        .avatar {
          width: 70px;
          height: 70px;
          border-radius: 50%;
          margin: 0 auto 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 22px;
          color: #fff;
          background: linear-gradient(135deg, var(--accent), #ff9a76);
        }
        .team-card h3 {
          font-size: 18px;
          font-weight: 700;
        }
        .team-role {
          color: var(--accent);
          font-weight: 600;
          font-size: 14px;
          margin: 4px 0 12px;
        }
        .team-card p {
          color: var(--muted);
          font-size: 15px;
          line-height: 1.6;
        }

        /* TESTIMONIALS */
        .testimonials {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 24px;
        }
        .quote {
          margin: 0;
          background: var(--bg-soft);
          border-left: 3px solid var(--accent);
          border-radius: 0 14px 14px 0;
          padding: 32px;
        }
        .quote p {
          font-size: 19px;
          line-height: 1.6;
          font-weight: 500;
          margin-bottom: 18px;
        }
        .quote footer {
          display: flex;
          flex-direction: column;
        }
        .quote-name {
          font-weight: 700;
        }
        .quote-role {
          color: var(--muted);
          font-size: 14px;
        }

        /* CONTACT */
        .contact-grid {
          display: grid;
          grid-template-columns: 1fr 1.1fr;
          gap: 56px;
          align-items: start;
        }
        .contact .section-title {
          text-align: left;
        }
        .contact-details {
          list-style: none;
          margin-top: 30px;
          display: grid;
          gap: 18px;
        }
        .contact-details li {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .contact-details span {
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--muted);
          font-weight: 600;
        }
        .contact-details a {
          font-weight: 600;
          font-size: 17px;
        }
        .contact-details a:hover {
          color: var(--accent);
        }
        .contact-form {
          background: #fff;
          border: 1px solid var(--line);
          border-radius: 16px;
          padding: 32px;
          display: grid;
          gap: 18px;
          box-shadow: 0 12px 40px rgba(20, 20, 30, 0.05);
        }
        .field-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18px;
        }
        .field {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }
        .field span {
          font-size: 13px;
          font-weight: 600;
          color: var(--ink);
        }
        .field input,
        .field textarea {
          border: 1px solid var(--line);
          border-radius: 9px;
          padding: 12px 14px;
          font-size: 15px;
          font-family: inherit;
          color: var(--ink);
          background: #fff;
          outline: none;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }
        .field input:focus,
        .field textarea:focus {
          border-color: var(--accent);
          box-shadow: 0 0 0 3px var(--accent-soft);
        }
        .field textarea {
          resize: vertical;
        }
        .form-status {
          font-size: 14px;
          font-weight: 500;
          margin: 0;
        }
        .form-status.success {
          color: #128a4f;
        }
        .form-status.error {
          color: #c0392b;
        }

        /* FOOTER */
        .footer {
          background: var(--ink);
          color: #d6d6dd;
          padding: 56px 0 28px;
        }
        .footer-inner {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 24px;
          flex-wrap: wrap;
          padding-bottom: 32px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        .footer-brand {
          font-weight: 700;
          font-size: 18px;
          color: #fff;
        }
        .footer-brand .brand-mark {
          color: var(--accent);
        }
        .footer-brand p {
          margin-top: 8px;
          font-weight: 400;
          font-size: 14px;
          color: #9a9aa6;
        }
        .footer-social {
          display: flex;
          gap: 22px;
        }
        .footer-social a {
          color: #b9b9c4;
          font-size: 15px;
          font-weight: 500;
        }
        .footer-social a:hover {
          color: var(--accent);
        }
        .footer-bottom {
          padding-top: 24px;
          font-size: 13px;
          color: #7c7c88;
        }

        /* RESPONSIVE */
        @media (max-width: 900px) {
          .cards,
          .work-grid,
          .team-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 32px 24px;
          }
          .about-grid,
          .contact-grid,
          .testimonials {
            grid-template-columns: 1fr;
            gap: 32px;
          }
        }
        @media (max-width: 680px) {
          .menu-toggle {
            display: block;
          }
          .nav-links {
            position: absolute;
            top: 68px;
            left: 0;
            right: 0;
            flex-direction: column;
            align-items: stretch;
            gap: 0;
            background: #fff;
            border-bottom: 1px solid var(--line);
            padding: 8px 24px 18px;
            display: none;
          }
          .nav-links.open {
            display: flex;
          }
          .nav-links a {
            padding: 12px 0;
            border-bottom: 1px solid var(--line);
          }
          .nav-cta {
            text-align: center;
            margin-top: 12px;
            border-bottom: none !important;
          }
          .cards,
          .work-grid,
          .team-grid {
            grid-template-columns: 1fr;
          }
          .section {
            padding: 64px 0;
          }
          .hero {
            padding: 72px 0 64px;
          }
          .field-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
}
