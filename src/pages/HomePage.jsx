import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import DecryptText from "../components/DecryptText";
import CodeBlock from "../components/CodeBlock";
import "./HomePage.css";

const HERO_CODE = `<span class="cm">// WEEK 1: Every balance is encrypted on-chain</span>
<span class="kw">import</span> <span class="str">"fhevm/lib/FHE.sol"</span>;
<span class="kw">import</span> <span class="str">"fhevm/config/ZamaEthereumConfig.sol"</span>;

<span class="kw">contract</span> <span class="ty">ConfidentialERC20</span> <span class="kw">is</span> <span class="ty">ZamaEthereumConfig</span> {
  <span class="ty">mapping</span>(<span class="ty">address</span> => <span class="ty">euint64</span>) <span class="kw">private</span> _balances;

  <span class="kw">function</span> <span class="fn">transfer</span>(<span class="ty">address</span> to, <span class="ty">externalEuint64</span> enc, <span class="ty">bytes</span> <span class="kw">calldata</span> proof)
    <span class="kw">external</span> {
    <span class="ty">euint64</span> amount = FHE.<span class="fn">fromExternal</span>(enc, proof);
    <span class="ty">ebool</span>  ok = FHE.<span class="fn">le</span>(amount, _balances[msg.sender]);

    <span class="cm">// No revert — silently no-op if insufficient</span>
    _balances[msg.sender] = FHE.<span class="fn">select</span>(ok,
      FHE.<span class="fn">sub</span>(_balances[msg.sender], amount),
      _balances[msg.sender]);
    _balances[to] = FHE.<span class="fn">select</span>(ok,
      FHE.<span class="fn">add</span>(_balances[to], amount),
      _balances[to]);
  }
}`;

const WEEKS = [
  {
    week: "01",
    title: "The FHE Paradigm Shift",
    subtitle: "Environment Setup & Encrypted Types",
    desc: "Understand how Fully Homomorphic Encryption rewrites the rules of on-chain state. Deploy your first confidential contract and learn why every conditional must be rewritten as a selection.",
    topics: ["FHE Coprocessor", "Encrypted Types", "FHE.select", "No-Revert Pattern"],
    hw: "Confidential ERC20",
    time: "5 hrs",
  },
  {
    week: "02",
    title: "Advanced Encrypted Logic",
    subtitle: "Arithmetic, Comparisons & Control Flow",
    desc: "Master conditional logic without branching. Learn why FHE.select is the most important function you will ever write, and build a dark pool that hides trade size from everyone.",
    topics: ["FHE Arithmetic", "Boolean Masking", "Safe Math", "Dark Pool Mechanics"],
    hw: "Dark Pool AMM",
    time: "6 hrs",
  },
  {
    week: "03",
    title: "Access Control & Decryption",
    subtitle: "Gateway Patterns & Frontend SDK",
    desc: "Safely surface encrypted data to authorized users. Wire a production-ready frontend that generates FHE payloads in the browser and submit sealed bids on-chain.",
    topics: ["Public Decryption", "Relayer SDK", "Browser Payloads", "Sealed Bids"],
    hw: "Blind Auction",
    time: "7 hrs",
  },
  {
    week: "04",
    title: "Production & Capstone",
    subtitle: "Multi-Contract Architecture & Deployment",
    desc: "Optimize FHE gas costs, architect multi-contract encrypted systems, and deploy a production-grade confidential payroll system end-to-end on Sepolia.",
    topics: ["Gas Optimization", "Selective Encryption", "Multi-Contract FHE", "Sepolia Deploy"],
    hw: "Mass Payroll System",
    time: "10+ hrs",
  },
];

const STATS = [
  { value: "4", label: "Weeks" },
  { value: "5", label: "Projects" },
  { value: "13", label: "Lessons" },
  { value: "30+", label: "Quizzes" },
];

const PIPELINE = [
  { label: "Plaintext 42", type: "data" },
  { label: "Encrypt", type: "op" },
  { label: "euint64 0x7f3a...", type: "data" },
  { label: "FHE.add()", type: "op" },
  { label: "euint64 0xb2c1...", type: "data" },
  { label: "Decrypt", type: "op" },
  { label: "Result 84", type: "data" },
];

const BUILT_FOR = [
  {
    role: "Web3 Developers",
    desc: "Ethereum and Solidity developers looking to add confidential state to their dApps without learning cryptography theory.",
  },
  {
    role: "Smart Contract Engineers",
    desc: "Protocol engineers ready to offer privacy-preserving features at the contract layer, from DeFi to governance.",
  },
  {
    role: "Technical Educators",
    desc: "Community leaders and bootcamp instructors planning to run FHEVM workshops and train the next wave of builders.",
  },
];

const PREREQS = [
  { label: "Basic Ethereum & EVM knowledge", accent: false },
  { label: "Solidity syntax familiarity", accent: false },
  { label: "Experience with Hardhat", accent: false },
  { label: "No FHE knowledge required", accent: true },
];

function useFadeIn() {
  const ref = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("visible");
            observer.unobserve(e.target);
          }
        }),
      { threshold: 0.12 }
    );
    const elements = ref.current?.querySelectorAll(".fade-in") || [];
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
  return ref;
}

export default function HomePage() {
  const ref = useFadeIn();

  return (
    <div className="page home-page" ref={ref}>
      {/* Hero */}
      <section className="hero">
        <div className="container hero-inner">
          <DecryptText
            text="Build in the Dark. Execute in the Light."
            as="h1"
            className="hero-title fade-in"
            delay={200}
            duration={1400}
          />
          <p className="hero-sub fade-in">
            The <strong>FHEVM Blackbox Bootcamp</strong> is the most
            comprehensive 4-week developer program for building confidential
            smart contracts on Zama's Fully Homomorphic Encryption Virtual
            Machine. No prior FHE or cryptography knowledge required.
          </p>
          <div className="hero-actions fade-in">
            <Link to="/curriculum" className="btn-primary">
              Start Learning
            </Link>
            <Link to="/homework" className="btn-outline">
              View Homework
            </Link>
          </div>
          <div className="hero-code fade-in">
            <CodeBlock
              code={HERO_CODE}
              language="solidity"
              filename="ConfidentialToken.sol"
            />
          </div>
        </div>
      </section>

      {/* Encryption Visualization Strip */}
      <section className="pipeline-strip fade-in">
        <div className="pipeline-track">
          {PIPELINE.map((step, i) => (
            <div key={i} className="pipeline-segment">
              {i > 0 && <span className="pipeline-arrow">&rarr;</span>}
              <span
                className={`pipeline-box ${
                  step.type === "op" ? "pipeline-op" : "pipeline-data"
                }`}
              >
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Stats Bar */}
      <section className="stats-section fade-in">
        <div className="container stats-grid">
          {STATS.map((s) => (
            <div key={s.label} className="stat-item">
              <span className="stat-value">{s.value}</span>
              <span className="stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="divider" />

      {/* Curriculum Overview */}
      <section className="section">
        <div className="container">
          <div className="section-header fade-in">
            <DecryptText
              text="Four Weeks. One Complete Engineer."
              as="h2"
              className="section-title"
              delay={100}
              duration={1000}
            />
            <p className="section-sub">
              Every week builds deliberately on the last — from encrypted
              primitives and control-flow patterns all the way to a
              production-grade payroll system deployed on Sepolia.
            </p>
          </div>
          <div className="weeks-grid">
            {WEEKS.map((w, i) => (
              <div
                key={w.week}
                className="card week-card fade-in"
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <span className="week-number">{w.week}</span>
                <h3 className="week-title">{w.title}</h3>
                <p className="week-subtitle">{w.subtitle}</p>
                <p className="week-desc">{w.desc}</p>
                <div className="week-topics">
                  {w.topics.map((t) => (
                    <span key={t} className="tag">
                      {t}
                    </span>
                  ))}
                </div>
                <div className="week-meta">
                  <div className="week-meta-item">
                    <span className="meta-label">Homework</span>
                    <span className="meta-value">{w.hw}</span>
                  </div>
                  <div className="week-meta-item">
                    <span className="meta-label">Est. Time</span>
                    <span className="meta-value">{w.time}</span>
                  </div>
                </div>
                <Link to="/curriculum" className="week-link">
                  View Lessons &rarr;
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="divider" />

      {/* Built For */}
      <section className="section">
        <div className="container">
          <div className="section-header fade-in">
            <DecryptText
              text="Built For"
              as="h2"
              className="section-title"
              delay={100}
              duration={800}
            />
            <p className="section-sub">
              Whether you are a solo developer or a community educator running
              workshops, the Blackbox Bootcamp scales to your context.
            </p>
          </div>
          <div className="grid-3 built-for-grid">
            {BUILT_FOR.map((item) => (
              <div key={item.role} className="card built-card fade-in">
                <h3>{item.role}</h3>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="divider" />

      {/* Prerequisites */}
      <section className="section">
        <div className="container">
          <div className="section-header fade-in">
            <DecryptText
              text="Prerequisites"
              as="h2"
              className="section-title"
              delay={100}
              duration={800}
            />
          </div>
          <div className="prereq-list fade-in">
            {PREREQS.map((p) => (
              <div
                key={p.label}
                className={`prereq-item ${p.accent ? "prereq-accent" : ""}`}
              >
                <span className="prereq-check">{p.accent ? "+" : "/"}</span>
                <span>{p.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="divider" />

      {/* Final CTA */}
      <section className="section cta-section fade-in">
        <div className="container cta-inner">
          <DecryptText
            text="The infrastructure is here. Now we need the builders."
            as="h2"
            className="section-title"
            delay={100}
            duration={1200}
          />
          <p className="section-sub cta-sub">
            Start your FHEVM journey today. Clone the Hardhat template, follow
            the Week 1 lesson plan, and deploy your first confidential contract
            in under an hour.
          </p>
          <div className="cta-actions">
            <Link to="/curriculum" className="btn-primary">
              Begin the Bootcamp &rarr;
            </Link>
            <a
              href="https://github.com/zama-ai/fhevm-hardhat-template"
              target="_blank"
              rel="noreferrer"
              className="btn-outline"
            >
              Clone Template on GitHub
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
