import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import "./HomePage.css";

const WEEKS = [
  {
    week: "01",
    color: "cyan",
    title: "The FHE Paradigm Shift",
    subtitle: "Environment Setup & Encrypted Types",
    desc: "Understand how Fully Homomorphic Encryption rewrites the rules of on-chain state and deploy your first confidential contract.",
    topics: [
      "EVM vs fhEVM mental model",
      "euint8, euint32, euint64, ebool, eaddress",
      "Hardhat mock FHE environment",
      'The "No Revert" Rule in practice',
    ],
    hw: "Confidential ERC20 Token",
    time: "5 hrs",
  },
  {
    week: "02",
    color: "purple",
    title: "Advanced Encrypted Logic",
    subtitle: "Arithmetic, Comparisons & Control Flow",
    desc: "Master the art of conditional logic without branching. Learn why FHE.select is the most important function you will ever write.",
    topics: [
      "FHE.add, sub, mul, div, rem",
      "FHE.le, lt, ge, gt, eq, ne",
      "Encrypted boolean masking patterns",
      "Dark Pool AMM mechanics",
    ],
    hw: "Dark Pool AMM (Simplified)",
    time: "6 hrs",
  },
  {
    week: "03",
    color: "orange",
    title: "Access Control & dApp Frontend",
    subtitle: "Decryption & @zama-fhe/relayer-sdk",
    desc: "Safely surface encrypted data to authorized users and wire a production-ready frontend that generates FHE payloads in the browser.",
    topics: [
      "Gateway decryption patterns",
      "userDecrypt() for viewing private state",
      "@zama-fhe/relayer-sdk integration",
      "Blind auction architecture",
    ],
    hw: "Confidential Blind Auction",
    time: "6.5 hrs",
  },
  {
    week: "04",
    color: "cyan",
    title: "Production Architecture & Capstone",
    subtitle: "Gas Optimization & Real-World Deployment",
    desc: "Optimize FHE operations, architect multi-contract systems, and deploy a production-grade confidential payroll system end-to-end.",
    topics: [
      "Gas & ciphertext compute overhead",
      "Selective encryption strategy",
      "Coprocessor & multi-network patterns",
      "End-to-end Hardhat test suites",
    ],
    hw: "Confidential Mass-Payroll System",
    time: "9+ hrs (Capstone)",
  },
];

const STATS = [
  { value: "4", label: "Weeks of Curriculum", icon: "📅" },
  { value: "4", label: "Homework Projects", icon: "🧪" },
  { value: "15+", label: "Solidity Code Templates", icon: "📝" },
  { value: "∞", label: "Learners Supported", icon: "🌐" },
];

const PREREQS = [
  { icon: "⛓", label: "Basic Ethereum & EVM knowledge" },
  { icon: "📜", label: "Solidity syntax familiarity" },
  { icon: "🛠", label: "Experience with Hardhat" },
  { icon: "🚫", label: "No FHE knowledge required" },
];

const WHO = [
  {
    role: "Web3 Developer",
    desc: "Ethereum and Solidity developers looking to add confidential state to their dApps.",
    icon: "💻",
  },
  {
    role: "Smart Contract Dev",
    desc: "Protocol engineers ready to offer privacy-preserving features at the contract layer.",
    icon: "⚙️",
  },
  {
    role: "Technical Educator",
    desc: "Community leaders and bootcamp instructors planning to run FHEVM workshops at scale.",
    icon: "🎓",
  },
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
      { threshold: 0.12 },
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
        <div className="hero-bg">
          <div
            className="orb orb-cyan"
            style={{
              width: 600,
              height: 600,
              background: "rgba(0,255,200,0.06)",
              top: -100,
              left: "60%",
            }}
          />
          <div
            className="orb orb-purple"
            style={{
              width: 500,
              height: 500,
              background: "rgba(155,107,255,0.07)",
              top: 200,
              left: "-10%",
              animationDelay: "3s",
            }}
          />
        </div>
        <div className="container hero-inner">
          <div className="hero-badge fade-in">
            <span className="pulse-dot" />
            <span className="tag tag-cyan">
              Open Enrolment · Cohort 1 · April 2026
            </span>
          </div>
          <h1 className="hero-title fade-in">
            Build in the Dark.
            <br />
            <span className="glow-text">Execute in the Light.</span>
          </h1>
          <p className="hero-sub fade-in">
            The <strong>FHEVM Blackbox Bootcamp</strong> is the most
            comprehensive 4-week developer program for building confidential
            smart contracts on Zama's Fully Homomorphic Encryption Virtual
            Machine. No prior FHE or cryptography knowledge required.
          </p>
          <div className="hero-actions fade-in">
            <Link to="/curriculum" className="btn-primary">
              View Full Curriculum →
            </Link>
            <Link to="/homework" className="btn-outline">
              See Homework Specs
            </Link>
          </div>
          <div className="hero-code-wrapper fade-in">
            <div className="hero-code-header">
              <div className="dots">
                <span />
                <span />
                <span />
              </div>
              <span>ConfidentialToken.sol</span>
              <span className="tag tag-cyan" style={{ marginLeft: "auto" }}>
                Week 1 · Homework
              </span>
            </div>
            <div className="code-block hero-code">
              <pre
                dangerouslySetInnerHTML={{
                  __html: `<span class="cm">// WEEK 1 GOAL: Hide every balance &amp; transfer amount</span>
<span class="kw">import</span> <span class="str">"@fhevm/solidity/lib/FHE.sol"</span>;
<span class="kw">import</span> <span class="str">"@fhevm/solidity/config/ZamaEthereumConfig.sol"</span>;

<span class="kw">contract</span> <span class="ty">ConfidentialERC20</span> <span class="kw">is</span> <span class="ty">ZamaEthereumConfig</span> {
  <span class="ty">mapping</span>(<span class="ty">address</span> =&gt; <span class="ty">euint64</span>) <span class="kw">private</span> _balances;

  <span class="kw">function</span> <span class="fn">transfer</span>(<span class="ty">address</span> to, <span class="ty">externalEuint64</span> encAmount, <span class="ty">bytes</span> calldata inputProof)
    <span class="kw">external</span> <span class="kw">returns</span> (<span class="ty">bool</span>) {

    <span class="ty">euint64</span> amount = FHE.<span class="fn">fromExternal</span>(encAmount, inputProof);
    <span class="ty">ebool</span>  canTransfer = FHE.<span class="fn">le</span>(amount, _balances[msg.sender]);

    <span class="cm">// ✅ No revert — silently do nothing if insufficient balance</span>
    _balances[msg.sender] = FHE.<span class="fn">select</span>(
      canTransfer,
      FHE.<span class="fn">sub</span>(_balances[msg.sender], amount),
      _balances[msg.sender]
    );
    _balances[to] = FHE.<span class="fn">select</span>(
      canTransfer,
      FHE.<span class="fn">add</span>(_balances[to], amount),
      _balances[to]
    );
    <span class="kw">return</span> <span class="num">true</span>;
  }
}`,
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="stats-section fade-in">
        <div className="container stats-grid">
          {STATS.map((s) => (
            <div key={s.label} className="stat-item">
              <span className="stat-icon">{s.icon}</span>
              <span className="stat-value glow-text">{s.value}</span>
              <span className="stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="divider" />

      {/* Curriculum Overview */}
      <section className="section weeks-section">
        <div className="container">
          <div className="section-header fade-in">
            <span className="tag tag-purple">The Curriculum</span>
            <h2 className="section-title">
              Four Weeks.
              <br />
              One Complete Engineer.
            </h2>
            <p className="section-sub">
              Every week builds deliberately on the last — from encrypted
              primitives and control-flow patterns all the way to a
              production-grade payroll system deployed on Sepolia.
            </p>
          </div>

          <div className="weeks-list">
            {WEEKS.map((w, i) => (
              <div
                key={w.week}
                className={`week-card glass-card fade-in week-${w.color}`}
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="week-number">Week {w.week}</div>
                <div className="week-body">
                  <h3 className="week-title">{w.title}</h3>
                  <p className="week-subtitle">{w.subtitle}</p>
                  <p className="week-desc">{w.desc}</p>
                  <ul className="week-topics">
                    {w.topics.map((t) => (
                      <li key={t}>
                        <span className="checkmark">✓</span> {t}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="week-meta">
                  <div className="week-hw">
                    <span className="meta-label">Homework</span>
                    <strong>{w.hw}</strong>
                  </div>
                  <div className="week-time">
                    <span className="meta-label">Time</span>
                    <strong>{w.time}</strong>
                  </div>
                  <Link
                    to="/curriculum"
                    className={`btn-outline week-btn week-btn-${w.color}`}
                  >
                    View Lesson Plan →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="divider" />

      {/* Who is this for */}
      <section className="section">
        <div className="container">
          <div className="section-header fade-in">
            <span className="tag tag-orange">Audience</span>
            <h2 className="section-title">Built for Builders.</h2>
            <p className="section-sub">
              Whether you're a solo developer or a community educator running
              workshops, the Blackbox Bootcamp scales to your context.
            </p>
          </div>
          <div className="grid-3" style={{ marginTop: 40 }}>
            {WHO.map((w) => (
              <div key={w.role} className="glass-card who-card fade-in">
                <div className="who-icon">{w.icon}</div>
                <h3>{w.role}</h3>
                <p>{w.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Prerequisites */}
      <section className="section prereq-section">
        <div className="container">
          <div className="prereq-inner fade-in">
            <div className="prereq-text">
              <span className="tag tag-cyan">Prerequisites</span>
              <h2 className="section-title" style={{ marginTop: 16 }}>
                What You Need
                <br />
                to Get Started
              </h2>
              <p className="section-sub" style={{ marginTop: 16 }}>
                We've designed an entry ramp that's genuinely accessible. Zero
                background in cryptography or FHE theory is required — only
                practical Solidity experience.
              </p>
              <Link
                to="/curriculum"
                className="btn-primary"
                style={{ marginTop: 32 }}
              >
                Start Week 1 →
              </Link>
            </div>
            <div className="prereq-list">
              {PREREQS.map((p) => (
                <div key={p.label} className="prereq-item glass-card">
                  <span className="prereq-icon">{p.icon}</span>
                  <span>{p.label}</span>
                </div>
              ))}
              <div className="prereq-item prereq-bonus glass-card">
                <span className="prereq-icon">🎯</span>
                <span>Both cohort-based & self-paced learning supported</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="divider" />

      {/* Learning Outcomes */}
      <section className="section outcomes-section">
        <div className="container">
          <div className="section-header fade-in">
            <span className="tag tag-purple">Outcomes</span>
            <h2 className="section-title">What You'll Be Able to Build</h2>
          </div>
          <div className="grid-2" style={{ marginTop: 44, gap: 20 }}>
            {[
              {
                title: "Confidential ERC20 Tokens",
                desc: "Tokens where balances and transfer amounts are fully hidden on-chain. Users can view only their own balance via re-encryption.",
                icon: "🪙",
                week: "Week 1",
              },
              {
                title: "Dark Pool AMMs",
                desc: "Automated market makers where trade size and slippage tolerance are never revealed, preventing front-running.",
                icon: "🌀",
                week: "Week 2",
              },
              {
                title: "Blind Auction Systems",
                desc: "Auctions where every bid is sealed on-chain. Only the winner is revealed post-auction — bids stay encrypted.",
                icon: "🔏",
                week: "Week 3",
              },
              {
                title: "Confidential Payroll",
                desc: "Employer-funded payroll where employee salaries are fully encrypted, yet contract solvency is provably maintained.",
                icon: "💼",
                week: "Week 4 Capstone",
              },
            ].map((o) => (
              <div key={o.title} className="outcome-card glass-card fade-in">
                <div className="outcome-header">
                  <span className="outcome-icon">{o.icon}</span>
                  <span className="tag tag-cyan" style={{ fontSize: 11 }}>
                    {o.week}
                  </span>
                </div>
                <h3>{o.title}</h3>
                <p>{o.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section fade-in">
        <div className="container">
          <div className="cta-inner glass-card">
            <div
              className="orb"
              style={{
                width: 400,
                height: 400,
                background: "rgba(0,255,200,0.05)",
                top: -100,
                right: -100,
                zIndex: 0,
              }}
            />
            <h2
              className="section-title"
              style={{ position: "relative", zIndex: 1 }}
            >
              The infrastructure is here.
              <br />
              <span className="glow-text">Now we need the builders.</span>
            </h2>
            <p
              className="section-sub"
              style={{ position: "relative", zIndex: 1 }}
            >
              Start your FHEVM journey today. Clone the Hardhat template, follow
              the Week 1 lesson plan, and deploy your first confidential
              contract in under an hour.
            </p>
            <div
              className="cta-actions"
              style={{ position: "relative", zIndex: 1 }}
            >
              <Link to="/curriculum" className="btn-primary">
                Begin the Bootcamp →
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
        </div>
      </section>
    </div>
  );
}
