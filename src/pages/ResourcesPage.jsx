import { useState, useRef, useEffect } from "react";
import DecryptText from "../components/DecryptText";
import CodeBlock from "../components/CodeBlock";
import "./ResourcesPage.css";

function useFadeIn(dep) {
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
      { threshold: 0.08 },
    );
    const elements = ref.current?.querySelectorAll(".fade-in") || [];
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [dep]);
  return ref;
}

/* ========== TAB 1: LEARNING MATERIALS DATA ========== */

const TYPE_SYSTEM = [
  { type: "euint8", size: "8-bit", use: "Flags, small counters" },
  { type: "euint16", size: "16-bit", use: "Enums, short values" },
  { type: "euint32", size: "32-bit", use: "Timestamps, IDs" },
  { type: "euint64", size: "64-bit", use: "Balances, amounts (most common)" },
  { type: "euint128", size: "128-bit", use: "Large values, precision math" },
  { type: "euint256", size: "256-bit", use: "Hashes, full-width values" },
  { type: "ebool", size: "1-bit", use: "Conditions, flags" },
  { type: "eaddress", size: "160-bit", use: "Hidden addresses" },
];

const CHEAT_SHEET = [
  { fn: "FHE.add(a, b)", desc: "Add two encrypted values" },
  { fn: "FHE.sub(a, b)", desc: "Subtract b from a" },
  { fn: "FHE.mul(a, b)", desc: "Multiply two encrypted values" },
  { fn: "FHE.div(a, b)", desc: "Divide a by b (encrypted)" },
  { fn: "FHE.rem(a, b)", desc: "Remainder of a / b" },
  { fn: "FHE.le(a, b)", desc: "a <= b, returns ebool" },
  { fn: "FHE.lt(a, b)", desc: "a < b, returns ebool" },
  { fn: "FHE.ge(a, b)", desc: "a >= b, returns ebool" },
  { fn: "FHE.gt(a, b)", desc: "a > b, returns ebool" },
  { fn: "FHE.eq(a, b)", desc: "a == b, returns ebool" },
  { fn: "FHE.ne(a, b)", desc: "a != b, returns ebool" },
  { fn: "FHE.and(a, b)", desc: "Bitwise AND on encrypted values" },
  { fn: "FHE.or(a, b)", desc: "Bitwise OR on encrypted values" },
  { fn: "FHE.not(a)", desc: "Bitwise NOT on encrypted value" },
  {
    fn: "FHE.select(cond, a, b)",
    desc: "Branchless conditional: if cond then a else b",
  },
  {
    fn: "FHE.asEuint64(val)",
    desc: "Cast plaintext to encrypted (admin/owner use)",
  },
  {
    fn: "FHE.fromExternal(inp, proof)",
    desc: "Validate user-submitted encrypted input",
  },
  { fn: "FHE.allow(handle, addr)", desc: "Grant decryption rights to address" },
  { fn: "FHE.allowThis(handle)", desc: "Grant contract permission on handle" },
  {
    fn: "FHE.makePubliclyDecryptable(h)",
    desc: "Allow anyone to decrypt the handle",
  },
];

const GLOSSARY = [
  {
    term: "FHE (Fully Homomorphic Encryption)",
    def: "Encryption scheme allowing computation on encrypted data without decryption.",
  },
  {
    term: "Ciphertext",
    def: "Encrypted value, opaque to the EVM. Cannot be inspected or branched on.",
  },
  {
    term: "Plaintext",
    def: "Unencrypted value visible to all network participants.",
  },
  {
    term: "Coprocessor",
    def: "Off-chain component that performs FHE operations on behalf of the EVM.",
  },
  {
    term: "Handle",
    def: "On-chain reference (bytes32 pointer) to a ciphertext stored in the coprocessor.",
  },
  {
    term: "ACL (Access Control List)",
    def: "Per-handle permissions controlling who can decrypt a given ciphertext.",
  },
  {
    term: "ebool",
    def: "Encrypted boolean. Cannot be used in if/require statements.",
  },
  {
    term: "euint64",
    def: "Most common encrypted type. 64-bit unsigned integer stored as a ciphertext handle.",
  },
  {
    term: "eaddress",
    def: "Encrypted Ethereum address. 160-bit encrypted value.",
  },
  {
    term: "FHE.select",
    def: "Branchless conditional. Both paths compute; one is chosen based on encrypted condition.",
  },
  {
    term: "No-Revert Pattern",
    def: "Design principle where encrypted operations never revert, preventing information leakage.",
  },
  {
    term: "Gateway",
    def: "Infrastructure component that processes decryption requests between on-chain and off-chain.",
  },
  {
    term: "Relayer SDK",
    def: "Client-side SDK for generating encrypted inputs and requesting decryptions.",
  },
  {
    term: "externalEuint64",
    def: "Parameter type for user-submitted encrypted values. Requires ZK proof validation.",
  },
  {
    term: "FHE.fromExternal",
    def: "Validates and unwraps user-submitted encrypted input with its ZK proof.",
  },
  {
    term: "ZamaEthereumConfig",
    def: "Base contract that configures the FHE coprocessor connection.",
  },
  {
    term: "SepoliaConfig",
    def: "Configuration preset for Sepolia testnet FHE deployment.",
  },
  {
    term: "Mock FHE",
    def: "Local testing environment with instant FHE operations for rapid development.",
  },
  {
    term: "ERC7984",
    def: "Standard for FHE-compatible token interfaces with standardized re-encryption events.",
  },
  {
    term: "Selective Encryption",
    def: "Strategy of encrypting only privacy-sensitive fields to minimize gas costs.",
  },
];

const EXTERNAL_RESOURCES = [
  {
    title: "Zama FHEVM Documentation",
    url: "https://docs.zama.ai/fhevm",
    desc: "Official reference for the FHEVM Solidity library and coprocessor API.",
  },
  {
    title: "FHEVM Hardhat Template",
    url: "https://github.com/zama-ai/fhevm-hardhat-template",
    desc: "Starter repository with mock FHE environment pre-configured for development.",
  },
  {
    title: "Zama Blog",
    url: "https://zama.ai/blog",
    desc: "Technical articles, protocol updates, and deep dives from the Zama team.",
  },
  {
    title: "FHE Hub Examples",
    url: "https://tomi204.gitbook.io/fhe-hub-examples",
    desc: "Community-contributed examples and patterns for FHEVM development.",
  },
  {
    title: "FHEVM Solidity Library",
    url: "https://github.com/zama-ai/fhevm",
    desc: "Core Solidity library providing FHE types, operations, and configuration contracts.",
  },
];

/* ========== TAB 2: INSTRUCTOR GUIDE DATA ========== */

const SCHEDULE = [
  {
    day: "Monday",
    activity:
      "Week kickoff call (30 min). Introduce concepts, recap previous HW.",
    type: "live",
  },
  {
    day: "Mon-Wed",
    activity: "Self-paced lessons. Students work through lesson plans.",
    type: "async",
  },
  {
    day: "Wednesday",
    activity: "Optional office hours / pair programming (2 hrs).",
    type: "live",
  },
  {
    day: "Wed-Fri",
    activity:
      "Homework development. Starter repos open; submission via GitHub PR.",
    type: "async",
  },
  {
    day: "Friday",
    activity: "Homework submission deadline (23:59 AOE). Optional live review.",
    type: "deadline",
  },
  {
    day: "Saturday",
    activity: "Grading period. Instructors run automated test suites.",
    type: "admin",
  },
  {
    day: "Sunday",
    activity: "Grades + feedback posted. Async 1:1 review via Discord.",
    type: "admin",
  },
];

const COMMON_MISTAKES = [
  {
    mistake:
      "Forgetting FHE.allow() / FHE.allowThis() after updating ciphertexts",
    why: "Every FHE operation creates a new handle. The old ACL dies with the old handle. Students forget to re-grant permissions after mutations.",
    fix: "Pattern: always add allow calls as the last 2 lines after any mutation. Make it a grading rubric checklist item.",
  },
  {
    mistake: "Using if(ebool) branching",
    why: "ebool is a handle, not a bool. The EVM cannot branch on encrypted data. This does not compile.",
    fix: "Show the error in demo, then show the FHE.select fix side by side. Students remember errors better than successes.",
  },
  {
    mistake: "Old 'einput' pattern vs externalEuint64",
    why: "Outdated tutorials use the wrong API. Students copy from old blog posts and StackOverflow answers.",
    fix: "Provide cheat sheet: FHE.asEuint64() for admin plain initialization, FHE.fromExternal() for user-submitted encrypted inputs.",
  },
  {
    mistake: "Confusing public vs private decryption",
    why: "Students expect a synchronous decrypt() function that returns plaintext immediately.",
    fix: "Emphasize: decryption is always two-step. On-chain: authorize with FHE.makePubliclyDecryptable() or FHE.allow(). Off-chain: call the Relayer endpoint.",
  },
  {
    mistake: "Not funding Sepolia wallet before Week 4",
    why: "Faucet delays block lab sessions. Students wait until class time to fund their wallet.",
    fix: "Send pre-class email on Monday of Week 4 with faucet instructions. Provide backup funded wallets.",
  },
  {
    mistake: "Over-encrypting fields",
    why: "Encrypting IDs, timestamps, and public addresses drives gas costs through the roof.",
    fix: "Live gas comparison: over-encrypted vs correct implementation shows 60-70% savings. This shocks students into compliance.",
  },
  {
    mistake: "View-Function Pointer Leak",
    why: "Returning euint64 handles without identity verification lets malicious users attempt decryption via the Relayer.",
    fix: "Always use FHE.isSenderAllowed() in view functions. Enforce this in code review.",
  },
  {
    mistake: "Ignoring ERC7984 Standards",
    why: "Missing standardized re-encryption events makes tokens invisible to third-party FHE explorers.",
    fix: "Provide ERC7984 interface in the Master Template. Require students to inherit from it and emit standardized events.",
  },
];

const COHORT_TIPS = [
  {
    title: "Weekly Kickoff Call (Monday)",
    desc: "30 min, introduce concepts, live walkthrough. Record it for async learners.",
  },
  {
    title: "Discord #fhevm-help Channel",
    desc: "Pin common errors. The community will self-solve 80% of issues if the channel is well-organized.",
  },
  {
    title: "Friday Review Session",
    desc: "Showcase 2-3 exceptional submissions. This motivates the best students and shows everyone what excellence looks like.",
  },
  {
    title: "Mock FHE for Speed, Sepolia for Finals",
    desc: "All development uses mock FHE (instant). Only Week 4 capstone requires Sepolia deployment.",
  },
  {
    title: "Public Leaderboard",
    desc: "Anonymized weekly ranking increases completion rates. Friendly competition drives engagement.",
  },
  {
    title: "Pair Programming Office Hours",
    desc: "2 hrs mid-week for synchronous help. Students stuck on Week 2 AMM logic benefit enormously.",
  },
];

const TEMPLATES = [
  {
    name: "fhevm-hardhat-template",
    desc: "Official Zama starter with mock FHE environment pre-configured.",
    url: "https://github.com/zama-ai/fhevm-hardhat-template",
  },
  {
    name: "ConfToken Starter",
    desc: "Week 1 scaffold with ERC20 structure and FHE imports.",
    url: "https://github.com/zama-ai/fhevm-hardhat-template",
  },
  {
    name: "DarkPoolAMM Starter",
    desc: "Week 2 scaffold with pool struct and interfaces defined.",
    url: "https://github.com/zama-ai/fhevm-hardhat-template",
  },
  {
    name: "BlindAuction Starter",
    desc: "Week 3 starter extending GatewayCaller for bid logic.",
    url: "https://github.com/zama-ai/fhevm-hardhat-template",
  },
  {
    name: "Payroll Capstone Starter",
    desc: "Week 4 three-contract scaffold with interfaces defined.",
    url: "https://github.com/zama-ai/fhevm-hardhat-template",
  },
  {
    name: "Solution Repositories",
    desc: "Reference solutions for all 4 weeks. Released after each homework deadline.",
    url: "https://github.com/zama-ai/fhevm-hardhat-template",
  },
  {
    name: "Master Audit Template",
    desc: "Expert-tier scaffold with BrokenPool.sol for the audit challenge.",
    url: "https://tomi204.gitbook.io/fhe-hub-examples",
  },
];

const GRADING_CODE = `<span class="cm"># Grade a student submission</span>
git clone &lt;student-repo-url&gt; submission && cd submission
npm install
npx hardhat test --network hardhat  <span class="cm"># mock FHE — instant</span>

<span class="cm"># Expected output:</span>
<span class="cm"># &#10003; deploys ConfToken with ZamaEthereumConfig (234ms)</span>
<span class="cm"># &#10003; transfer uses FHE.select, never reverts (189ms)</span>
<span class="cm"># ... 6/6 tests passing → 70/100 points</span>`;

/* ========== TABS ========== */

const TABS = [
  { id: "materials", label: "Learning Materials" },
  { id: "instructor", label: "Instructor Guide" },
];

/* ========== COMPONENT ========== */

export default function ResourcesPage() {
  const [activeTab, setActiveTab] = useState("materials");
  const [expandedMistakes, setExpandedMistakes] = useState({});
  const ref = useFadeIn(activeTab);

  const toggleMistake = (i) => {
    setExpandedMistakes((prev) => ({ ...prev, [i]: !prev[i] }));
  };

  return (
    <div className="page resources-page" ref={ref}>
      {/* Header */}
      <section className="res-header">
        <div className="container">
          <span className="tag tag-accent fade-in">Resources</span>
          <h1 className="res-title fade-in" style={{ marginTop: 16 }}>
            <DecryptText
              text="Teaching & Reference Hub"
              as="span"
              delay={200}
              duration={1000}
            />
          </h1>
          <p className="res-sub fade-in">
            Everything you need to run the FHEVM Blackbox Bootcamp — for cohorts
            of 10 or 10,000.
          </p>
        </div>
      </section>

      {/* Tab Navigation */}
      <div className="res-tab-bar">
        <div className="container">
          <nav className="res-tabs">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                className={`res-tab${activeTab === tab.id ? " res-tab--active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="container res-content">
        <div
          className={`res-tab-panel${activeTab === "materials" ? " res-tab-panel--active" : ""}`}
        >
          {activeTab === "materials" && <TabMaterials />}
        </div>
        <div
          className={`res-tab-panel${activeTab === "instructor" ? " res-tab-panel--active" : ""}`}
        >
          {activeTab === "instructor" && (
            <TabInstructor
              expandedMistakes={expandedMistakes}
              toggleMistake={toggleMistake}
            />
          )}
        </div>
      </div>
    </div>
  );
}

/* ========== TAB 1: LEARNING MATERIALS ========== */

function TabMaterials() {
  return (
    <>
      {/* Encryption Pipeline */}
      <section className="res-section fade-in">
        <h2 className="res-section-title">FHE Concept Visualizations</h2>

        <h3 className="res-diagram-title">Encryption Pipeline</h3>
        <div className="pipeline-diagram">
          <div className="pipeline-stage">
            <div className="pipeline-box">Plaintext</div>
          </div>
          <div className="pipeline-arrow" />
          <div className="pipeline-stage">
            <div className="pipeline-box pipeline-box--accent">Encrypt</div>
          </div>
          <div className="pipeline-arrow" />
          <div className="pipeline-stage">
            <div className="pipeline-box">Ciphertext</div>
          </div>
          <div className="pipeline-arrow" />
          <div className="pipeline-stage">
            <div className="pipeline-box pipeline-box--accent">FHE Compute</div>
          </div>
          <div className="pipeline-arrow" />
          <div className="pipeline-stage">
            <div className="pipeline-box">Result Ciphertext</div>
          </div>
          <div className="pipeline-arrow" />
          <div className="pipeline-stage">
            <div className="pipeline-box pipeline-box--accent">Decrypt</div>
          </div>
          <div className="pipeline-arrow" />
          <div className="pipeline-stage">
            <div className="pipeline-box">Plaintext</div>
          </div>
        </div>
      </section>

      {/* Type System */}
      <section className="res-section fade-in">
        <h3 className="res-diagram-title">Type System</h3>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Size</th>
                <th>Use Case</th>
              </tr>
            </thead>
            <tbody>
              {TYPE_SYSTEM.map((t) => (
                <tr key={t.type}>
                  <td>
                    <code className="res-type-code">{t.type}</code>
                  </td>
                  <td>{t.size}</td>
                  <td>{t.use}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Access Control Flow */}
      <section className="res-section fade-in">
        <h3 className="res-diagram-title">Access Control Flow</h3>
        <div className="acl-diagram">
          <div className="acl-row">
            <div className="acl-source">Contract</div>
            <div className="acl-arrow" />
            <div className="acl-action">FHE.allowThis()</div>
            <div className="acl-arrow" />
            <div className="acl-result">Contract can compute</div>
          </div>
          <div className="acl-row">
            <div className="acl-source">Contract</div>
            <div className="acl-arrow" />
            <div className="acl-action">FHE.allow(handle, user)</div>
            <div className="acl-arrow" />
            <div className="acl-result">User can decrypt via Relayer</div>
          </div>
          <div className="acl-row">
            <div className="acl-source">Contract</div>
            <div className="acl-arrow" />
            <div className="acl-action">FHE.makePubliclyDecryptable()</div>
            <div className="acl-arrow" />
            <div className="acl-result">Anyone can read</div>
          </div>
        </div>
      </section>

      {/* Cheat Sheet */}
      <section className="res-section fade-in">
        <h2 className="res-section-title">FHE Cheat Sheet</h2>
        <div className="cheat-sheet">
          <div className="cheat-sheet-col">
            {CHEAT_SHEET.slice(0, 10).map((c) => (
              <div key={c.fn} className="cheat-row">
                <code className="cheat-fn">{c.fn}</code>
                <span className="cheat-desc">{c.desc}</span>
              </div>
            ))}
          </div>
          <div className="cheat-sheet-col">
            {CHEAT_SHEET.slice(10).map((c) => (
              <div key={c.fn} className="cheat-row">
                <code className="cheat-fn">{c.fn}</code>
                <span className="cheat-desc">{c.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Glossary */}
      <section className="res-section fade-in">
        <h2 className="res-section-title">Glossary</h2>
        <div className="glossary-list">
          {GLOSSARY.map((g) => (
            <div key={g.term} className="glossary-item">
              <dt className="glossary-term">{g.term}</dt>
              <dd className="glossary-def">{g.def}</dd>
            </div>
          ))}
        </div>
      </section>

      {/* External Resources */}
      <section className="res-section fade-in">
        <h2 className="res-section-title">External Resources</h2>
        <div className="grid-2" style={{ marginTop: 20 }}>
          {EXTERNAL_RESOURCES.map((r) => (
            <a
              key={r.title}
              href={r.url}
              target="_blank"
              rel="noreferrer"
              className="ext-resource-card card"
            >
              <h3 className="ext-resource-title">{r.title}</h3>
              <p className="ext-resource-desc">{r.desc}</p>
              <span className="ext-resource-url">
                {r.url.replace("https://", "")}
              </span>
            </a>
          ))}
        </div>
      </section>
    </>
  );
}

/* ========== TAB 2: INSTRUCTOR GUIDE ========== */

function TabInstructor({ expandedMistakes, toggleMistake }) {
  return (
    <>
      {/* Weekly Cadence */}
      <section className="res-section fade-in">
        <h2 className="res-section-title">Weekly Cadence Schedule</h2>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Day</th>
                <th>Activity</th>
                <th>Type</th>
              </tr>
            </thead>
            <tbody>
              {SCHEDULE.map((s, i) => (
                <tr key={i}>
                  <td>
                    <strong>{s.day}</strong>
                  </td>
                  <td>{s.activity}</td>
                  <td>
                    <span className={`res-type-tag res-type-tag--${s.type}`}>
                      {s.type === "live"
                        ? "Live"
                        : s.type === "async"
                          ? "Async"
                          : s.type === "deadline"
                            ? "Deadline"
                            : "Admin"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Common Mistakes */}
      <section className="res-section fade-in">
        <h2 className="res-section-title">8 Common Student Mistakes</h2>
        <div className="mistakes-list">
          {COMMON_MISTAKES.map((m, i) => (
            <div
              key={i}
              className={`mistake-card card${expandedMistakes[i] ? " mistake-card--expanded" : ""}`}
            >
              <button
                className="mistake-header"
                onClick={() => toggleMistake(i)}
              >
                <span className="mistake-num">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mistake-title">{m.mistake}</h3>
                <span className="mistake-toggle">
                  {expandedMistakes[i] ? "\u2212" : "+"}
                </span>
              </button>
              <div className="mistake-body">
                <div className="mistake-block">
                  <span className="block-label">Why it happens</span>
                  <p>{m.why}</p>
                </div>
                <div className="mistake-block mistake-block--fix">
                  <span className="block-label block-label--fix">
                    Recommended fix
                  </span>
                  <p>{m.fix}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Cohort Tips */}
      <section className="res-section fade-in">
        <h2 className="res-section-title">Cohort Tips</h2>
        <div className="grid-3" style={{ marginTop: 20 }}>
          {COHORT_TIPS.map((t) => (
            <div key={t.title} className="cohort-card card">
              <h3 className="cohort-card-title">{t.title}</h3>
              <p>{t.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Starter/Solution Repos */}
      <section className="res-section fade-in">
        <h2 className="res-section-title">Starter / Solution Repositories</h2>
        <div className="grid-2" style={{ marginTop: 20 }}>
          {TEMPLATES.map((t) => (
            <a
              key={t.name}
              href={t.url}
              target="_blank"
              rel="noreferrer"
              className="template-card card"
            >
              <h3 className="template-name">{t.name}</h3>
              <p>{t.desc}</p>
              <span className="template-link">View Repository &rarr;</span>
            </a>
          ))}
        </div>
      </section>

      {/* Automated Grading */}
      <section className="res-section fade-in">
        <h2 className="res-section-title">Automated Grading</h2>
        <p style={{ marginBottom: 20 }}>
          Each homework submission includes a Hardhat project with passing
          tests. Instructors run student submissions with a single command. The
          rubric maps 1:1 to named test cases.
        </p>
        <CodeBlock code={GRADING_CODE} language="bash" filename="grading.sh" />
      </section>
    </>
  );
}
