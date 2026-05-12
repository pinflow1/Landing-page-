import { useEffect, useRef, useState } from "react";

// ── Animated counter ──────────────────────────────────────────
function Counter({ to, suffix = "", duration = 2000 }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      obs.disconnect();
      const start = performance.now();
      const tick = (now) => {
        const t = Math.min((now - start) / duration, 1);
        const ease = 1 - Math.pow(1 - t, 4);
        setVal(Math.round(ease * to));
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [to, duration]);
  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
}

// ── Reveal on scroll ─────────────────────────────────────────
function Reveal({ children, delay = 0, y = 32 }) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVis(true); obs.disconnect(); }
    }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} style={{
      opacity: vis ? 1 : 0,
      transform: vis ? "none" : `translateY(${y}px)`,
      transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
    }}>
      {children}
    </div>
  );
}

// ── Orbiting ring logo ────────────────────────────────────────
function HeroOrb({ size = 120 }) {
  return (
    <div style={{ position: "relative", width: size, height: size, margin: "0 auto 40px" }}>
      <svg width={size} height={size} viewBox="0 0 120 120" fill="none" style={{ position: "absolute", inset: 0 }}>
        <defs>
          <filter id="hf" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="8" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <radialGradient id="rg" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.6)"/>
            <stop offset="100%" stopColor="rgba(255,255,255,0)"/>
          </radialGradient>
        </defs>
        {/* Outer glow */}
        <circle cx="60" cy="60" r="52" stroke="rgba(255,255,255,0.06)" strokeWidth="20" fill="none" filter="url(#hf)"/>
        {/* Main ring */}
        <circle cx="60" cy="60" r="52" stroke="white" strokeWidth="2.5" fill="none" filter="url(#hf)"
          style={{ animation: "orbPulse 3s ease-in-out infinite" }}/>
        {/* Inner ring */}
        <circle cx="60" cy="60" r="38" stroke="rgba(255,255,255,0.15)" strokeWidth="1" fill="none"
          style={{ animation: "orbPulse 3s ease-in-out infinite 0.5s" }}/>
        {/* Orbiting dot */}
        <circle cx="60" cy="8" r="3" fill="white" filter="url(#hf)"
          style={{ transformOrigin: "60px 60px", animation: "orbit 4s linear infinite" }}/>
      </svg>
      <style>{`
        @keyframes orbPulse { 0%,100%{opacity:0.7} 50%{opacity:1} }
        @keyframes orbit { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
      `}</style>
    </div>
  );
}

// ── Typewriter ────────────────────────────────────────────────
function Typewriter({ words }) {
  const [idx, setIdx]   = useState(0);
  const [text, setText] = useState("");
  const [del, setDel]   = useState(false);
  useEffect(() => {
    const word = words[idx % words.length];
    const timeout = setTimeout(() => {
      if (!del) {
        setText(word.slice(0, text.length + 1));
        if (text.length + 1 === word.length) setTimeout(() => setDel(true), 1800);
      } else {
        setText(word.slice(0, text.length - 1));
        if (text.length - 1 === 0) { setDel(false); setIdx(i => i + 1); }
      }
    }, del ? 40 : 80);
    return () => clearTimeout(timeout);
  }, [text, del, idx, words]);
  return (
    <span style={{ borderRight: "2px solid rgba(255,255,255,0.7)", paddingRight: 2,
      animation: "blink 1s step-end infinite" }}>
      {text}
      <style>{`@keyframes blink{0%,100%{border-color:rgba(255,255,255,0.7)}50%{border-color:transparent}}`}</style>
    </span>
  );
}

// ── Floating code snippet ─────────────────────────────────────
function CodeCard({ code, label, delay = 0, x = 0, y = 0, rotate = 0 }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        position: "absolute", left: x, top: y,
        transform: `rotate(${hov ? 0 : rotate}deg) scale(${hov ? 1.05 : 1})`,
        transition: "all 0.4s cubic-bezier(0.34,1.56,0.64,1)",
        animation: `float ${3 + delay * 0.5}s ease-in-out ${delay * 0.3}s infinite alternate`,
        zIndex: hov ? 10 : 1,
      }}>
      <div style={{
        background: "rgba(18,18,18,0.95)", border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 12, padding: "12px 16px", minWidth: 200, maxWidth: 280,
        backdropFilter: "blur(20px)", boxShadow: "0 24px 48px rgba(0,0,0,0.6)",
      }}>
        <div style={{ fontSize: 9, color: "#555", fontFamily: "monospace", marginBottom: 8, letterSpacing: 1 }}>{label}</div>
        <pre style={{ fontSize: 11, color: "#ccc", fontFamily: "monospace", margin: 0, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{code}</pre>
      </div>
    </div>
  );
}

// ── Risk badge ────────────────────────────────────────────────
function RiskBadge({ level }) {
  const cfg = {
    LOW:    { color: "#22c55e", bg: "rgba(34,197,94,0.1)",  border: "rgba(34,197,94,0.2)" },
    MEDIUM: { color: "#f59e0b", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.2)" },
    HIGH:   { color: "#ef4444", bg: "rgba(239,68,68,0.1)",  border: "rgba(239,68,68,0.2)" },
  }[level] || {};
  return (
    <span style={{ fontFamily: "monospace", fontSize: 10, fontWeight: 700, color: cfg.color,
      background: cfg.bg, border: `1px solid ${cfg.border}`, padding: "3px 8px", borderRadius: 5 }}>
      {level} RISK
    </span>
  );
}

// ── Feature card ──────────────────────────────────────────────
function FeatureCard({ icon, title, desc, delay }) {
  const [hov, setHov] = useState(false);
  return (
    <Reveal delay={delay}>
      <div
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          background: hov ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.02)",
          border: `1px solid ${hov ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.06)"}`,
          borderRadius: 16, padding: "28px 24px", cursor: "default",
          transition: "all 0.3s ease",
          transform: hov ? "translateY(-4px)" : "none",
        }}>
        <div style={{ fontSize: 28, marginBottom: 14 }}>{icon}</div>
        <div style={{ fontSize: 16, fontWeight: 600, color: "#fff", marginBottom: 8, fontFamily: "'DM Sans', sans-serif" }}>{title}</div>
        <div style={{ fontSize: 14, color: "#666", lineHeight: 1.7 }}>{desc}</div>
      </div>
    </Reveal>
  );
}

// ── Pricing card ──────────────────────────────────────────────
function PricingCard({ name, price, period, features, cta, highlighted, delay }) {
  const [hov, setHov] = useState(false);
  return (
    <Reveal delay={delay}>
      <div
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          background: highlighted ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.02)",
          border: `1px solid ${highlighted ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.06)"}`,
          borderRadius: 20, padding: "32px 28px",
          transform: hov ? "translateY(-6px) scale(1.02)" : highlighted ? "scale(1.02)" : "none",
          transition: "all 0.3s ease",
          position: "relative", overflow: "hidden",
        }}>
        {highlighted && (
          <div style={{
            position: "absolute", top: 16, right: 16,
            fontSize: 10, fontFamily: "monospace", fontWeight: 700,
            background: "white", color: "black",
            padding: "3px 10px", borderRadius: 20,
          }}>POPULAR</div>
        )}
        <div style={{ fontSize: 13, color: "#888", fontFamily: "monospace", letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>{name}</div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 24 }}>
          <span style={{ fontSize: 42, fontWeight: 800, color: "#fff", fontFamily: "'DM Sans', sans-serif" }}>{price}</span>
          <span style={{ fontSize: 14, color: "#555" }}>{period}</span>
        </div>
        <div style={{ marginBottom: 28 }}>
          {features.map((f, i) => (
            <div key={i} style={{ display: "flex", gap: 10, marginBottom: 10, alignItems: "flex-start" }}>
              <span style={{ color: "#22c55e", fontSize: 13, flexShrink: 0, marginTop: 1 }}>✓</span>
              <span style={{ fontSize: 13, color: "#888", lineHeight: 1.5 }}>{f}</span>
            </div>
          ))}
        </div>
        <a href="/signup" style={{
          display: "block", textAlign: "center", padding: "13px",
          borderRadius: 12, textDecoration: "none", fontFamily: "monospace",
          fontSize: 12, fontWeight: 700, letterSpacing: 1, transition: "all 0.2s",
          background: highlighted ? "#fff" : "transparent",
          color: highlighted ? "#000" : "#fff",
          border: highlighted ? "none" : "1px solid rgba(255,255,255,0.15)",
        }}
          onMouseEnter={e => { if (!highlighted) { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)"; }}}
          onMouseLeave={e => { if (!highlighted) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; }}}>
          {cta}
        </a>
      </div>
    </Reveal>
  );
}

// ── Main landing page ─────────────────────────────────────────
export default function Landing() {
  const [scrollY, setScrollY] = useState(0);
  const [navSolid, setNavSolid] = useState(false);

  useEffect(() => {
    const handler = () => { setScrollY(window.scrollY); setNavSolid(window.scrollY > 60); };
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <div style={{ background: "#050505", color: "#e0e0e0", minHeight: "100vh", overflowX: "hidden",
      fontFamily: "'DM Sans', sans-serif" }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&family=Space+Mono:wght@400;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #1e1e1e; border-radius: 2px; }
        @keyframes float { from{transform:translateY(0px)} to{transform:translateY(-12px)} }
        @keyframes gradShift { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
        @keyframes scanline { 0%{transform:translateY(-100%)} 100%{transform:translateY(100vh)} }
        @keyframes gridFade { from{opacity:0} to{opacity:1} }
        .grad-text {
          background: linear-gradient(135deg, #fff 0%, #888 50%, #fff 100%);
          background-size: 200% 200%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: gradShift 4s ease infinite;
        }
        .cta-btn {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 14px 28px; border-radius: 50px; border: none;
          background: #fff; color: #000;
          font-family: 'Space Mono', monospace; font-size: 12px; font-weight: 700;
          letter-spacing: 1px; cursor: pointer; text-decoration: none;
          transition: all 0.2s; position: relative; overflow: hidden;
        }
        .cta-btn::before {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(135deg, transparent, rgba(255,255,255,0.2), transparent);
          transform: translateX(-100%); transition: transform 0.4s;
        }
        .cta-btn:hover::before { transform: translateX(100%); }
        .cta-btn:hover { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(255,255,255,0.15); }
        .cta-btn-ghost {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 14px 28px; border-radius: 50px;
          border: 1px solid rgba(255,255,255,0.15); background: transparent; color: #fff;
          font-family: 'Space Mono', monospace; font-size: 12px; font-weight: 700;
          letter-spacing: 1px; cursor: pointer; text-decoration: none;
          transition: all 0.2s;
        }
        .cta-btn-ghost:hover { border-color: rgba(255,255,255,0.4); background: rgba(255,255,255,0.05); transform: translateY(-2px); }
      `}</style>

      {/* Grid background */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
        backgroundImage: "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
        backgroundSize: "60px 60px",
        maskImage: "radial-gradient(ellipse at 50% 0%, black 0%, transparent 70%)",
        WebkitMaskImage: "radial-gradient(ellipse at 50% 0%, black 0%, transparent 70%)",
      }}/>

      {/* Gradient orb background */}
      <div style={{
        position: "fixed", top: -200, left: "50%", transform: "translateX(-50%)",
        width: 800, height: 600, borderRadius: "50%",
        background: "radial-gradient(ellipse, rgba(255,255,255,0.03) 0%, transparent 70%)",
        pointerEvents: "none", zIndex: 0,
      }}/>

      {/* Nav */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        padding: "16px 48px", display: "flex", alignItems: "center", justifyContent: "space-between",
        background: navSolid ? "rgba(5,5,5,0.9)" : "transparent",
        backdropFilter: navSolid ? "blur(20px)" : "none",
        borderBottom: navSolid ? "1px solid rgba(255,255,255,0.05)" : "none",
        transition: "all 0.3s ease",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <svg width="24" height="24" viewBox="0 0 100 100" fill="none">
            <defs>
              <filter id="nf" x="-60%" y="-60%" width="220%" height="220%">
                <feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
            </defs>
            <rect width="100" height="100" rx="18" fill="#000"/>
            <circle cx="50" cy="50" r="34" stroke="rgba(255,255,255,0.2)" strokeWidth="10" fill="none" filter="url(#nf)" style={{ animation: "orbPulse 2.8s ease-in-out infinite" }}/>
            <circle cx="50" cy="50" r="34" stroke="white" strokeWidth="2.5" fill="none" filter="url(#nf)" style={{ animation: "orbPulse 2.8s ease-in-out infinite" }}/>
          </svg>
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 15, fontWeight: 700, color: "#fff", letterSpacing: 1 }}>Vile</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
          {["Features", "How it works", "Pricing"].map(item => (
            <a key={item} href={`#${item.toLowerCase().replace(" ","-")}`}
              style={{ color: "#666", fontSize: 13, textDecoration: "none", transition: "color 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.color = "#fff"}
              onMouseLeave={e => e.currentTarget.style.color = "#666"}>
              {item}
            </a>
          ))}
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <a href="/login" className="cta-btn-ghost" style={{ padding: "10px 20px", fontSize: 11 }}>Sign in</a>
          <a href="/signup" className="cta-btn" style={{ padding: "10px 20px", fontSize: 11 }}>Start free →</a>
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section style={{ position: "relative", zIndex: 1, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "120px 24px 80px", textAlign: "center" }}>

        {/* Badge */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "6px 14px", borderRadius: 50, marginBottom: 32,
          border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)",
          animation: "float 4s ease-in-out infinite",
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 8px #22c55e" }}/>
          <span style={{ fontSize: 12, color: "#888", fontFamily: "monospace", letterSpacing: 0.5 }}>Now in public beta</span>
        </div>

        {/* Hero orb */}
        <HeroOrb size={130}/>

        {/* Headline */}
        <h1 style={{ fontSize: "clamp(40px, 7vw, 88px)", fontWeight: 800, lineHeight: 1.05, letterSpacing: -2, marginBottom: 24, maxWidth: 900 }}>
          <span className="grad-text">Know what breaks</span>
          <br/>
          <span style={{ color: "#333" }}>before you</span>{" "}
          <span className="grad-text">deploy</span>
        </h1>

        {/* Subhead with typewriter */}
        <p style={{ fontSize: "clamp(16px, 2.5vw, 22px)", color: "#666", maxWidth: 600, lineHeight: 1.65, marginBottom: 48 }}>
          Paste your code. Vile tells you exactly what could break,{" "}
          <br/>which users are affected, and{" "}
          <span style={{ color: "#fff" }}>
            <Typewriter words={["how to fix it.", "what's at risk.", "the safe path.", "what to test."]}/>
          </span>
        </p>

        {/* CTAs */}
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center", marginBottom: 64 }}>
          <a href="/signup" className="cta-btn">
            Analyze your code free
            <span style={{ fontSize: 16 }}>→</span>
          </a>
          <a href="#how-it-works" className="cta-btn-ghost">
            See how it works
          </a>
        </div>

        {/* Social proof */}
        <div style={{ display: "flex", alignItems: "center", gap: 24, color: "#444", fontSize: 12, fontFamily: "monospace" }}>
          <span>5 free analyses</span>
          <span style={{ color: "#222" }}>·</span>
          <span>No credit card</span>
          <span style={{ color: "#222" }}>·</span>
          <span>Works with any language</span>
        </div>

        {/* Floating code cards */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
          <CodeCard x="3%" y="25%" rotate={-4} delay={0} label="VILE ANALYSIS · HIGH RISK"
            code={`authentication.js\n\n❌ Token not validated\n❌ No expiry check\n→ Users can forge sessions`}/>
          <CodeCard x="70%" y="20%" rotate={3} delay={1} label="VILE ANALYSIS · SAFE"
            code={`utils/formatDate.js\n\n✓ No side effects\n✓ Pure function\n✓ Safe to deploy`}/>
          <CodeCard x="75%" y="65%" rotate={-2} delay={2} label="VILE ANALYSIS · MEDIUM"
            code={`payments/checkout.js\n\n⚠ Amount not sanitized\n⚠ Missing error handler`}/>
        </div>
      </section>

      {/* ── STATS ────────────────────────────────────────────── */}
      <section style={{ position: "relative", zIndex: 1, padding: "80px 48px", borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 48, textAlign: "center" }}>
          {[
            { n: 30000, s: "+", label: "Analyses per month (Elite)", sub: "Generous limits for every tier" },
            { n: 5,     s: "",  label: "Free analyses to start",    sub: "Full-depth, no feature limits" },
            { n: 4,     s: "",  label: "Languages auto-detected",   sub: "JS, TS, Python, and more" },
          ].map(({ n, s, label, sub }) => (
            <Reveal key={label}>
              <div>
                <div style={{ fontSize: "clamp(42px, 5vw, 64px)", fontWeight: 800, color: "#fff", fontFamily: "'DM Sans', sans-serif", letterSpacing: -2, marginBottom: 8 }}>
                  <Counter to={n} suffix={s}/>
                </div>
                <div style={{ fontSize: 15, color: "#888", marginBottom: 4 }}>{label}</div>
                <div style={{ fontSize: 12, color: "#444", fontFamily: "monospace" }}>{sub}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────── */}
      <section id="how-it-works" style={{ position: "relative", zIndex: 1, padding: "120px 48px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <Reveal>
            <div style={{ textAlign: "center", marginBottom: 80 }}>
              <div style={{ fontFamily: "monospace", fontSize: 11, color: "#555", letterSpacing: 3, textTransform: "uppercase", marginBottom: 16 }}>How it works</div>
              <h2 style={{ fontSize: "clamp(32px, 4vw, 52px)", fontWeight: 800, letterSpacing: -1.5, color: "#fff", lineHeight: 1.1 }}>
                Three steps to<br/><span className="grad-text">deploy with confidence</span>
              </h2>
            </div>
          </Reveal>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 2 }}>
            {[
              { n: "01", title: "Paste your code", desc: "Drop in a single file or your entire repo. No setup. No config. Vile reads it instantly.", icon: "⌨️" },
              { n: "02", title: "Vile maps the risks", desc: "Our AI traces every function, dependency, and data flow. It finds exactly what could break and why.", icon: "🔍" },
              { n: "03", title: "Ship with confidence", desc: "Get a plain-English report: what breaks, which users are affected, and the exact fix.", icon: "🚀" },
            ].map((step, i) => (
              <Reveal key={step.n} delay={i * 120}>
                <div style={{
                  padding: "40px 32px", position: "relative",
                  borderLeft: i > 0 ? "1px solid rgba(255,255,255,0.05)" : "none",
                }}>
                  <div style={{ fontFamily: "monospace", fontSize: 11, color: "#333", letterSpacing: 2, marginBottom: 20 }}>{step.n}</div>
                  <div style={{ fontSize: 32, marginBottom: 16 }}>{step.icon}</div>
                  <h3 style={{ fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 12 }}>{step.title}</h3>
                  <p style={{ fontSize: 14, color: "#666", lineHeight: 1.7 }}>{step.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── DEMO RESULT ──────────────────────────────────────── */}
      <section style={{ position: "relative", zIndex: 1, padding: "0 48px 120px" }}>
        <div style={{ maxWidth: 780, margin: "0 auto" }}>
          <Reveal>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <div style={{ fontFamily: "monospace", fontSize: 11, color: "#555", letterSpacing: 3, textTransform: "uppercase", marginBottom: 16 }}>Live example</div>
              <h2 style={{ fontSize: "clamp(28px, 3.5vw, 44px)", fontWeight: 800, color: "#fff", letterSpacing: -1 }}>This is what Vile returns</h2>
            </div>
          </Reveal>

          <Reveal delay={150}>
            <div style={{ background: "rgba(15,15,15,0.8)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, overflow: "hidden", backdropFilter: "blur(20px)" }}>
              {/* Header */}
              <div style={{ padding: "16px 22px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ display: "flex", gap: 6 }}>
                  {["#ff5f57","#febc2e","#28c840"].map(c => <div key={c} style={{ width: 12, height: 12, borderRadius: "50%", background: c }}/>)}
                </div>
                <span style={{ fontFamily: "monospace", fontSize: 11, color: "#444" }}>vile analysis · auth/login.js</span>
                <div style={{ marginLeft: "auto" }}><RiskBadge level="HIGH"/></div>
              </div>

              {/* Verdict */}
              <div style={{ padding: "20px 22px", borderBottom: "1px solid rgba(255,255,255,0.05)", background: "rgba(239,68,68,0.05)" }}>
                <div style={{ fontSize: 15, color: "#e0e0e0", lineHeight: 1.65, marginBottom: 12 }}>
                  The login function is missing token expiration checks. Any user with an old token can still access the app indefinitely — your sessions never expire.
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <RiskBadge level="HIGH"/>
                  <span style={{ fontFamily: "monospace", fontSize: 10, color: "#888", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", padding: "3px 8px", borderRadius: 5 }}>Confidence: HIGH</span>
                </div>
              </div>

              {/* Impact */}
              <div style={{ padding: "20px 22px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <div style={{ fontFamily: "monospace", fontSize: 9, color: "#444", letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>Key Impacts</div>
                <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "14px 16px" }}>
                  {[
                    { label: "Changed",    value: "Token validation logic removed from login flow",    color: "#888" },
                    { label: "Effect",     value: "Sessions never expire — tokens remain valid forever", color: "#f59e0b" },
                    { label: "You'll see", value: "Logged-out users can still access protected pages",  color: "#3b82f6" },
                  ].map(({ label, value, color }) => (
                    <div key={label} style={{ display: "grid", gridTemplateColumns: "72px 1fr", gap: 8, marginBottom: 8 }}>
                      <span style={{ fontFamily: "monospace", fontSize: 8, color: "#333", letterSpacing: 1.5, textTransform: "uppercase", paddingTop: 2 }}>{label}</span>
                      <span style={{ fontSize: 12, color, lineHeight: 1.5 }}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Fix */}
              <div style={{ padding: "20px 22px" }}>
                <div style={{ fontFamily: "monospace", fontSize: 9, color: "#22c55e", letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 }}>Safe Fix</div>
                <p style={{ fontSize: 13, color: "rgba(134,239,172,0.8)", lineHeight: 1.65 }}>
                  Add token expiry validation on every request. Check the <code style={{ background: "rgba(255,255,255,0.06)", padding: "1px 5px", borderRadius: 3, fontSize: 12 }}>exp</code> claim in your JWT and return a 401 if expired. Existing sessions will need to re-authenticate.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────── */}
      <section id="features" style={{ position: "relative", zIndex: 1, padding: "0 48px 120px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <Reveal>
            <div style={{ textAlign: "center", marginBottom: 64 }}>
              <div style={{ fontFamily: "monospace", fontSize: 11, color: "#555", letterSpacing: 3, textTransform: "uppercase", marginBottom: 16 }}>Features</div>
              <h2 style={{ fontSize: "clamp(28px, 3.5vw, 44px)", fontWeight: 800, color: "#fff", letterSpacing: -1 }}>
                Built for developers who<br/><span className="grad-text">ship fast</span>
              </h2>
            </div>
          </Reveal>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
            {[
              { icon: "🎯", title: "Plain English results",  desc: "No jargon. Vile explains risks the way you'd explain them to a teammate — clear, direct, actionable.", delay: 0 },
              { icon: "🔗", title: "Dependency mapping",     desc: "Understands which files depend on your code and traces the blast radius of any change.", delay: 100 },
              { icon: "⚡", title: "Instant analysis",        desc: "Results in seconds. No waiting, no setup. Paste your code and get answers immediately.", delay: 200 },
              { icon: "🛡️", title: "Security detection",     desc: "Catches auth bypasses, injection risks, missing validation, and unsafe patterns before they reach production.", delay: 300 },
              { icon: "🧠", title: "Repo-aware mode",        desc: "Load your full project and Vile understands the entire system — not just the file you changed.", delay: 400 },
              { icon: "💾", title: "Save & revisit",         desc: "Every analysis is saved to your history. Come back, compare, and track what you fixed.", delay: 500 },
            ].map(f => <FeatureCard key={f.title} {...f}/>)}
          </div>
        </div>
      </section>

      {/* ── PRICING ──────────────────────────────────────────── */}
      <section id="pricing" style={{ position: "relative", zIndex: 1, padding: "0 48px 120px" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <Reveal>
            <div style={{ textAlign: "center", marginBottom: 64 }}>
              <div style={{ fontFamily: "monospace", fontSize: 11, color: "#555", letterSpacing: 3, textTransform: "uppercase", marginBottom: 16 }}>Pricing</div>
              <h2 style={{ fontSize: "clamp(28px, 3.5vw, 44px)", fontWeight: 800, color: "#fff", letterSpacing: -1 }}>Start free. Scale as you grow.</h2>
              <p style={{ fontSize: 15, color: "#555", marginTop: 12 }}>Every plan includes Vile's full analysis engine.</p>
            </div>
          </Reveal>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
            {[
              { name:"Free",    price:"$0",  period:"/forever", highlighted:false, delay:0,   cta:"Start free",
                features:["5 full-depth analyses","Complete file scan","Plain-English report","What breaks + why + how"] },
              { name:"Starter", price:"$6",  period:"/month",   highlighted:false, delay:100, cta:"Get Starter",
                features:["3,000 analyses/month","Multi-file awareness","Risk detection","Daily limit: 80"] },
              { name:"Pro",     price:"$13", period:"/month",   highlighted:true,  delay:200, cta:"Get Pro →",
                features:["10,000 analyses/month","Cross-file dependencies","Architecture risks","Daily limit: 250"] },
              { name:"Elite",   price:"$24", period:"/month",   highlighted:false, delay:300, cta:"Get Elite",
                features:["30,000 analyses/month","Full system analysis","Predictive failures","Daily limit: 800"] },
            ].map(p => <PricingCard key={p.name} {...p}/>)}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────────── */}
      <section style={{ position: "relative", zIndex: 1, padding: "80px 48px 120px", textAlign: "center" }}>
        <div style={{
          maxWidth: 700, margin: "0 auto",
          background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 28, padding: "72px 48px",
        }}>
          <Reveal>
            <HeroOrb size={80}/>
            <h2 style={{ fontSize: "clamp(30px, 4vw, 52px)", fontWeight: 800, color: "#fff", letterSpacing: -1.5, marginBottom: 16, lineHeight: 1.1 }}>
              Stop guessing.<br/><span className="grad-text">Start knowing.</span>
            </h2>
            <p style={{ fontSize: 16, color: "#555", marginBottom: 36, lineHeight: 1.65 }}>
              Join developers who ship with confidence.<br/>5 free analyses. No credit card. No setup.
            </p>
            <a href="/signup" className="cta-btn" style={{ fontSize: 13, padding: "16px 36px" }}>
              Analyze your code free →
            </a>
          </Reveal>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.05)", padding: "32px 48px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontFamily: "monospace", fontSize: 13, fontWeight: 700, color: "#444" }}>Vile</span>
          <span style={{ color: "#222", fontSize: 12 }}>— Code Safety Engine</span>
        </div>
        <div style={{ display: "flex", gap: 24 }}>
          {["Privacy", "Terms", "Pricing"].map(l => (
            <a key={l} href={`/${l.toLowerCase()}`} style={{ fontSize: 12, color: "#333", textDecoration: "none" }}
              onMouseEnter={e => e.currentTarget.style.color="#888"}
              onMouseLeave={e => e.currentTarget.style.color="#333"}>{l}</a>
          ))}
        </div>
        <span style={{ fontSize: 11, color: "#222", fontFamily: "monospace" }}>© 2025 Vile</span>
      </footer>
    </div>
  );
}
