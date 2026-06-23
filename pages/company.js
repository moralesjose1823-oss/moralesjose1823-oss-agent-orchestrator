import Head from "next/head";
import { useState } from "react";
import { company } from "../lib/company";

// Bento column spans for the services grid (6-col grid, desktop)
const SERVICE_SPANS = [4, 2, 3, 3, 2, 4];

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

  const marquee = [...company.services, ...company.services];

  return (
    <>
      <Head>
        <title>{`${company.name} — ${company.tagline}`}</title>
        <meta name="description" content={company.description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="og:title" content={company.name} />
        <meta property="og:description" content={company.description} />
      </Head>

      <div className="site" id="top">
        {/* FLOATING NAV */}
        <header className="nav">
          <div className="nav-pill">
            <a href="#top" className="brand">
              <span className="brand-mark">◈</span>
              <span className="brand-name">{company.shortName}</span>
            </a>

            <nav className="nav-links">
              {company.nav.map((item) => (
                <a key={item.href} href={item.href}>
                  {item.label}
                </a>
              ))}
            </nav>

            <a href="#contact" className="nav-cta">
              Get started
            </a>

            <button
              className="menu-toggle"
              aria-label="Toggle menu"
              onClick={() => setMenuOpen((o) => !o)}
            >
              {menuOpen ? "✕" : "☰"}
            </button>
          </div>

          {menuOpen && (
            <div className="mobile-menu">
              {company.nav.map((item) => (
                <a key={item.href} href={item.href} onClick={() => setMenuOpen(false)}>
                  {item.label}
                </a>
              ))}
              <a href="#contact" className="nav-cta" onClick={() => setMenuOpen(false)}>
                Get started
              </a>
            </div>
          )}
        </header>

        <main>
          {/* HERO — asymmetric */}
          <section className="hero">
            <div className="orb orb-1" />
            <div className="orb orb-2" />
            <div className="container hero-grid">
              <div className="hero-copy">
                <span className="badge">
                  <span className="badge-dot" /> {company.hero.eyebrow}
                </span>
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

              {/* Floating stat dashboard */}
              <div className="hero-visual">
                <div className="glass-card big">
                  <div className="gc-label">{company.stats[0]?.label}</div>
                  <div className="gc-value">{company.stats[0]?.value}</div>
                  <div className="spark">
                    {[40, 62, 48, 78, 70, 92, 84].map((h, i) => (
                      <span key={i} style={{ height: `${h}%` }} />
                    ))}
                  </div>
                </div>
                <div className="glass-row">
                  {company.stats.slice(1, 3).map((s) => (
                    <div className="glass-card" key={s.label}>
                      <div className="gc-value sm">{s.value}</div>
                      <div className="gc-label">{s.label}</div>
                    </div>
                  ))}
                </div>
                <div className="glass-card wide">
                  <div className="live">
                    <span className="live-dot" /> Live partnership value
                  </div>
                  <div className="gc-value">{company.stats[1]?.value}</div>
                </div>
              </div>
            </div>
          </section>

          {/* MARQUEE */}
          <div className="marquee">
            <div className="marquee-track">
              {marquee.map((s, i) => (
                <span key={i} className="marquee-item">
                  {s.title} <span className="marquee-sep">✦</span>
                </span>
              ))}
            </div>
          </div>

          {/* SERVICES — bento */}
          <section id="services" className="section">
            <div className="container">
              <div className="section-head">
                <p className="section-eyebrow">What we do</p>
                <h2 className="section-title">Full-service sports business advisory</h2>
              </div>
              <div className="bento">
                {company.services.map((svc, i) => (
                  <div
                    className="bento-card"
                    key={svc.title}
                    style={{ gridColumn: `span ${SERVICE_SPANS[i % SERVICE_SPANS.length]}` }}
                  >
                    <span className="card-icon">{svc.icon}</span>
                    <h3>{svc.title}</h3>
                    <p>{svc.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ABOUT */}
          <section id="about" className="section">
            <div className="container about-grid">
              <div className="about-copy">
                <p className="section-eyebrow">About us</p>
                <h2 className="section-title left">{company.about.heading}</h2>
                {company.about.body.map((p, i) => (
                  <p className="about-text" key={i}>
                    {p}
                  </p>
                ))}
              </div>
              <ul className="about-points">
                {company.about.points.map((pt, i) => (
                  <li key={pt}>
                    <span className="point-num">{String(i + 1).padStart(2, "0")}</span>
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* WORK — stacked rows */}
          <section id="work" className="section">
            <div className="container">
              <div className="section-head">
                <p className="section-eyebrow">Selected work</p>
                <h2 className="section-title">Partnerships, measured</h2>
              </div>
              <div className="work-list">
                {company.work.map((w, i) => (
                  <article className="work-row" key={w.title}>
                    <div className="work-index">{String(i + 1).padStart(2, "0")}</div>
                    <div className="work-main">
                      <span className="work-tag">{w.tag}</span>
                      <h3>{w.title}</h3>
                      <p>{w.body}</p>
                    </div>
                    <div className="work-metric">{w.metric}</div>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* TEAM */}
          <section id="team" className="section">
            <div className="container">
              <div className="section-head">
                <p className="section-eyebrow">The team</p>
                <h2 className="section-title">People behind the work</h2>
              </div>
              <div className="team-grid">
                {company.team.map((m) => (
                  <div className="team-card" key={m.name}>
                    <div className="avatar">{m.initials}</div>
                    <div>
                      <h3>{m.name}</h3>
                      <div className="team-role">{m.role}</div>
                    </div>
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
                  <span className="quote-mark">“</span>
                  <p>{t.quote}</p>
                  <footer>
                    <span className="quote-name">{t.name}</span>
                    <span className="quote-role">{t.role}</span>
                  </footer>
                </blockquote>
              ))}
            </div>
          </section>

          {/* CONTACT */}
          <section id="contact" className="section">
            <div className="container">
              <div className="contact-card">
                <div className="orb orb-3" />
                <div className="contact-grid">
                  <div className="contact-info">
                    <p className="section-eyebrow">Contact</p>
                    <h2 className="section-title left">{company.contact.heading}</h2>
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
                        <span className="cd-plain">{company.location}</span>
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
              </div>
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
            <div className="footer-cols">
              <div className="footer-col">
                <span className="footer-col-title">Navigate</span>
                {company.nav.map((item) => (
                  <a key={item.href} href={item.href}>
                    {item.label}
                  </a>
                ))}
              </div>
              <div className="footer-col">
                <span className="footer-col-title">Social</span>
                {company.social.map((s) => (
                  <a key={s.label} href={s.href}>
                    {s.label}
                  </a>
                ))}
              </div>
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
          background: #08080c;
          color: #f4f4f6;
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
          --bg: #08080c;
          --panel: #111119;
          --panel-2: #16161f;
          --line: rgba(255, 255, 255, 0.08);
          --line-2: rgba(255, 255, 255, 0.14);
          --text: #f4f4f6;
          --muted: #9a9aa8;
          min-height: 100vh;
          position: relative;
          overflow-x: hidden;
        }
        .container {
          width: 100%;
          max-width: 1180px;
          margin: 0 auto;
          padding: 0 24px;
        }

        /* NAV */
        .nav {
          position: fixed;
          top: 18px;
          left: 0;
          right: 0;
          z-index: 60;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 0 16px;
        }
        .nav-pill {
          width: 100%;
          max-width: 880px;
          display: flex;
          align-items: center;
          gap: 18px;
          padding: 10px 12px 10px 20px;
          border-radius: 100px;
          background: rgba(17, 17, 25, 0.72);
          border: 1px solid var(--line-2);
          backdrop-filter: saturate(160%) blur(16px);
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.45);
        }
        .brand {
          display: flex;
          align-items: center;
          gap: 9px;
          font-weight: 700;
          font-size: 17px;
          letter-spacing: -0.01em;
        }
        .brand-mark {
          color: var(--accent);
        }
        .nav-links {
          display: flex;
          align-items: center;
          gap: 26px;
          margin-left: auto;
        }
        .nav-links a {
          font-size: 14px;
          color: var(--muted);
          font-weight: 500;
          transition: color 0.15s ease;
        }
        .nav-links a:hover {
          color: var(--text);
        }
        .nav-cta {
          background: var(--accent);
          color: #0b0b0f !important;
          padding: 9px 18px;
          border-radius: 100px;
          font-weight: 700;
          font-size: 14px;
          white-space: nowrap;
          transition: transform 0.12s ease, box-shadow 0.15s ease;
        }
        .nav-cta:hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 22px rgba(255, 107, 53, 0.35);
        }
        .menu-toggle {
          display: none;
          background: none;
          border: none;
          font-size: 20px;
          cursor: pointer;
          color: var(--text);
          margin-left: auto;
        }
        .mobile-menu {
          margin-top: 10px;
          width: 100%;
          max-width: 880px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          padding: 14px 18px;
          border-radius: 18px;
          background: rgba(17, 17, 25, 0.95);
          border: 1px solid var(--line-2);
          backdrop-filter: blur(16px);
        }
        .mobile-menu a {
          padding: 10px 4px;
          color: var(--muted);
          font-weight: 500;
        }
        .mobile-menu .nav-cta {
          text-align: center;
          margin-top: 8px;
          color: #0b0b0f !important;
        }

        /* ORBS */
        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(90px);
          pointer-events: none;
          z-index: 0;
        }
        .orb-1 {
          top: -120px;
          right: -60px;
          width: 460px;
          height: 460px;
          background: radial-gradient(circle, var(--accent), transparent 70%);
          opacity: 0.32;
        }
        .orb-2 {
          bottom: -160px;
          left: -120px;
          width: 420px;
          height: 420px;
          background: radial-gradient(circle, #5b6cff, transparent 70%);
          opacity: 0.22;
        }
        .orb-3 {
          top: -80px;
          right: -40px;
          width: 320px;
          height: 320px;
          background: radial-gradient(circle, var(--accent), transparent 70%);
          opacity: 0.25;
        }

        /* HERO */
        .hero {
          position: relative;
          padding: 168px 0 96px;
          overflow: hidden;
        }
        .hero-grid {
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: 1.15fr 0.85fr;
          gap: 56px;
          align-items: center;
        }
        .badge {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          padding: 7px 14px;
          border-radius: 100px;
          border: 1px solid var(--line-2);
          background: rgba(255, 255, 255, 0.03);
          font-size: 12.5px;
          font-weight: 600;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: var(--muted);
          margin-bottom: 26px;
        }
        .badge-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--accent);
          box-shadow: 0 0 0 4px rgba(255, 107, 53, 0.18);
        }
        .hero-heading {
          font-size: clamp(42px, 6.4vw, 76px);
          line-height: 1.02;
          letter-spacing: -0.035em;
          font-weight: 800;
          margin-bottom: 24px;
          background: linear-gradient(180deg, #fff 30%, #b9b9c6);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .hero-sub {
          font-size: clamp(16px, 2.1vw, 19px);
          color: var(--muted);
          line-height: 1.65;
          max-width: 520px;
          margin-bottom: 34px;
        }
        .hero-ctas {
          display: flex;
          gap: 14px;
          flex-wrap: wrap;
        }
        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 15px 28px;
          border-radius: 100px;
          font-weight: 700;
          font-size: 15px;
          cursor: pointer;
          border: 1px solid transparent;
          transition: transform 0.12s ease, background 0.15s ease, box-shadow 0.15s ease,
            border-color 0.15s ease;
        }
        .btn:hover {
          transform: translateY(-2px);
        }
        .btn-primary {
          background: var(--accent);
          color: #0b0b0f;
          box-shadow: 0 12px 30px rgba(255, 107, 53, 0.3);
        }
        .btn-ghost {
          background: rgba(255, 255, 255, 0.03);
          color: var(--text);
          border-color: var(--line-2);
        }
        .btn-ghost:hover {
          border-color: #fff;
        }
        .btn.full {
          width: 100%;
        }

        /* HERO VISUAL */
        .hero-visual {
          position: relative;
          display: grid;
          gap: 16px;
        }
        .glass-card {
          background: linear-gradient(160deg, rgba(255, 255, 255, 0.07), rgba(255, 255, 255, 0.02));
          border: 1px solid var(--line-2);
          border-radius: 20px;
          padding: 22px;
          backdrop-filter: blur(8px);
        }
        .glass-card.big {
          padding: 26px;
        }
        .glass-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .gc-label {
          font-size: 13px;
          color: var(--muted);
          font-weight: 500;
        }
        .gc-value {
          font-size: 38px;
          font-weight: 800;
          letter-spacing: -0.02em;
          margin-top: 4px;
          color: #fff;
        }
        .gc-value.sm {
          font-size: 28px;
        }
        .spark {
          display: flex;
          align-items: flex-end;
          gap: 7px;
          height: 56px;
          margin-top: 18px;
        }
        .spark span {
          flex: 1;
          border-radius: 4px 4px 2px 2px;
          background: linear-gradient(180deg, var(--accent), rgba(255, 107, 53, 0.25));
        }
        .live {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: var(--muted);
          font-weight: 500;
        }
        .live-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #2ecc71;
          box-shadow: 0 0 0 4px rgba(46, 204, 113, 0.18);
          animation: blink 1.6s ease-in-out infinite;
        }

        /* MARQUEE */
        .marquee {
          border-top: 1px solid var(--line);
          border-bottom: 1px solid var(--line);
          padding: 18px 0;
          overflow: hidden;
          background: rgba(255, 255, 255, 0.015);
        }
        .marquee-track {
          display: flex;
          gap: 40px;
          white-space: nowrap;
          width: max-content;
          animation: scroll 32s linear infinite;
        }
        .marquee-item {
          font-size: 16px;
          font-weight: 600;
          color: #6f6f7e;
          display: inline-flex;
          align-items: center;
          gap: 40px;
        }
        .marquee-sep {
          color: var(--accent);
          opacity: 0.7;
        }

        /* SECTIONS */
        .section {
          position: relative;
          z-index: 1;
          padding: 104px 0;
        }
        .section-head {
          text-align: center;
          max-width: 680px;
          margin: 0 auto 60px;
        }
        .section-eyebrow {
          text-transform: uppercase;
          letter-spacing: 0.14em;
          font-size: 12.5px;
          font-weight: 700;
          color: var(--accent);
          margin-bottom: 14px;
        }
        .section-title {
          font-size: clamp(30px, 4.4vw, 46px);
          font-weight: 800;
          letter-spacing: -0.025em;
          line-height: 1.1;
        }
        .section-title.left {
          text-align: left;
        }

        /* BENTO */
        .bento {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 18px;
        }
        .bento-card {
          background: linear-gradient(160deg, var(--panel-2), var(--panel));
          border: 1px solid var(--line);
          border-radius: 22px;
          padding: 30px;
          transition: transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease;
        }
        .bento-card:hover {
          transform: translateY(-4px);
          border-color: var(--line-2);
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4);
        }
        .card-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 50px;
          height: 50px;
          border-radius: 14px;
          background: rgba(255, 107, 53, 0.12);
          color: var(--accent);
          font-size: 24px;
          margin-bottom: 20px;
        }
        .bento-card h3 {
          font-size: 20px;
          font-weight: 700;
          margin-bottom: 10px;
          letter-spacing: -0.01em;
        }
        .bento-card p {
          color: var(--muted);
          line-height: 1.6;
          font-size: 15px;
          max-width: 460px;
        }

        /* ABOUT */
        .about-grid {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 64px;
          align-items: center;
        }
        .about-text {
          color: var(--muted);
          line-height: 1.75;
          font-size: 16px;
          margin-top: 18px;
        }
        .about-points {
          list-style: none;
          display: grid;
          gap: 4px;
        }
        .about-points li {
          display: flex;
          align-items: center;
          gap: 18px;
          padding: 20px 4px;
          border-top: 1px solid var(--line);
          font-weight: 600;
          font-size: 16px;
        }
        .about-points li:last-child {
          border-bottom: 1px solid var(--line);
        }
        .point-num {
          color: var(--accent);
          font-weight: 800;
          font-size: 15px;
          font-variant-numeric: tabular-nums;
        }

        /* WORK */
        .work-list {
          display: grid;
          gap: 0;
          border-top: 1px solid var(--line);
        }
        .work-row {
          display: grid;
          grid-template-columns: 60px 1fr auto;
          gap: 28px;
          align-items: center;
          padding: 34px 8px;
          border-bottom: 1px solid var(--line);
          transition: background 0.18s ease, padding 0.18s ease;
        }
        .work-row:hover {
          background: rgba(255, 255, 255, 0.02);
          padding-left: 18px;
          padding-right: 18px;
        }
        .work-index {
          font-size: 18px;
          font-weight: 800;
          color: #44444f;
          font-variant-numeric: tabular-nums;
        }
        .work-tag {
          display: inline-block;
          font-size: 11.5px;
          font-weight: 700;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          color: var(--accent);
          margin-bottom: 10px;
        }
        .work-main h3 {
          font-size: 22px;
          font-weight: 700;
          margin-bottom: 8px;
          letter-spacing: -0.01em;
        }
        .work-main p {
          color: var(--muted);
          line-height: 1.6;
          font-size: 15px;
          max-width: 620px;
        }
        .work-metric {
          font-weight: 800;
          color: #fff;
          font-size: 20px;
          white-space: nowrap;
          text-align: right;
        }

        /* TEAM */
        .team-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 18px;
        }
        .team-card {
          background: linear-gradient(160deg, var(--panel-2), var(--panel));
          border: 1px solid var(--line);
          border-radius: 22px;
          padding: 32px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .avatar {
          width: 64px;
          height: 64px;
          border-radius: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 20px;
          color: #0b0b0f;
          background: linear-gradient(135deg, var(--accent), #ff9a76);
        }
        .team-card h3 {
          font-size: 19px;
          font-weight: 700;
        }
        .team-role {
          color: var(--accent);
          font-weight: 600;
          font-size: 14px;
          margin-top: 3px;
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
          gap: 20px;
        }
        .quote {
          position: relative;
          margin: 0;
          background: linear-gradient(160deg, var(--panel-2), var(--panel));
          border: 1px solid var(--line);
          border-radius: 22px;
          padding: 38px 34px 30px;
          overflow: hidden;
        }
        .quote-mark {
          position: absolute;
          top: 6px;
          left: 22px;
          font-size: 92px;
          line-height: 1;
          color: var(--accent);
          opacity: 0.18;
          font-family: Georgia, serif;
        }
        .quote p {
          position: relative;
          font-size: 19px;
          line-height: 1.6;
          font-weight: 500;
          margin-bottom: 22px;
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
        .contact-card {
          position: relative;
          overflow: hidden;
          border: 1px solid var(--line-2);
          border-radius: 30px;
          padding: 56px;
          background: linear-gradient(160deg, var(--panel-2), var(--panel));
        }
        .contact-grid {
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: 1fr 1.05fr;
          gap: 56px;
          align-items: start;
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
          gap: 3px;
        }
        .contact-details span {
          font-size: 12.5px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--muted);
          font-weight: 600;
        }
        .contact-details a,
        .cd-plain {
          font-weight: 600;
          font-size: 17px;
          text-transform: none;
          letter-spacing: 0;
          color: var(--text);
        }
        .contact-details a:hover {
          color: var(--accent);
        }
        .contact-form {
          display: grid;
          gap: 16px;
        }
        .field-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .field {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }
        .field span {
          font-size: 13px;
          font-weight: 600;
          color: var(--text);
        }
        .field input,
        .field textarea {
          border: 1px solid var(--line-2);
          border-radius: 12px;
          padding: 13px 15px;
          font-size: 15px;
          font-family: inherit;
          color: var(--text);
          background: rgba(255, 255, 255, 0.03);
          outline: none;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }
        .field input::placeholder,
        .field textarea::placeholder {
          color: #5a5a68;
        }
        .field input:focus,
        .field textarea:focus {
          border-color: var(--accent);
          box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.18);
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
          color: #2ecc71;
        }
        .form-status.error {
          color: #ff7a6b;
        }

        /* FOOTER */
        .footer {
          position: relative;
          z-index: 1;
          border-top: 1px solid var(--line);
          padding: 64px 0 32px;
          margin-top: 40px;
        }
        .footer-inner {
          display: flex;
          justify-content: space-between;
          gap: 40px;
          flex-wrap: wrap;
          padding-bottom: 36px;
          border-bottom: 1px solid var(--line);
        }
        .footer-brand {
          font-weight: 700;
          font-size: 18px;
          max-width: 320px;
        }
        .footer-brand .brand-mark {
          color: var(--accent);
        }
        .footer-brand p {
          margin-top: 10px;
          font-weight: 400;
          font-size: 14px;
          color: var(--muted);
          line-height: 1.6;
        }
        .footer-cols {
          display: flex;
          gap: 64px;
        }
        .footer-col {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .footer-col-title {
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #5a5a68;
          font-weight: 700;
          margin-bottom: 4px;
        }
        .footer-col a {
          font-size: 15px;
          color: var(--muted);
        }
        .footer-col a:hover {
          color: var(--accent);
        }
        .footer-bottom {
          padding-top: 26px;
          font-size: 13px;
          color: #5a5a68;
        }

        /* ANIMATIONS */
        @keyframes scroll {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }
        @keyframes blink {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.4;
          }
        }

        /* RESPONSIVE */
        @media (max-width: 980px) {
          .hero-grid {
            grid-template-columns: 1fr;
            gap: 44px;
          }
          .hero-visual {
            max-width: 460px;
          }
          .about-grid,
          .contact-grid,
          .testimonials {
            grid-template-columns: 1fr;
            gap: 36px;
          }
          .team-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .bento-card {
            grid-column: span 3 !important;
          }
        }
        @media (max-width: 720px) {
          .nav-links {
            display: none;
          }
          .nav-pill .nav-cta {
            display: none;
          }
          .menu-toggle {
            display: block;
          }
          .bento {
            grid-template-columns: 1fr;
          }
          .bento-card {
            grid-column: span 1 !important;
          }
          .team-grid {
            grid-template-columns: 1fr;
          }
          .work-row {
            grid-template-columns: 1fr;
            gap: 14px;
          }
          .work-metric {
            text-align: left;
          }
          .work-index {
            display: none;
          }
          .section {
            padding: 72px 0;
          }
          .hero {
            padding: 134px 0 72px;
          }
          .contact-card {
            padding: 32px 22px;
          }
          .field-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
}
