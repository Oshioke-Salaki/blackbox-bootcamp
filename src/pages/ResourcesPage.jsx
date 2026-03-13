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
  { fn: "FHE.select(cond, a, b)", desc: "Branchless conditional: if cond then a else b" },
  { fn: "FHE.asEuint64(val)", desc: "Cast plaintext to encrypted (admin/owner use)" },
  { fn: "FHE.fromExternal(inp, proof)", desc: "Validate user-submitted encrypted input" },
  { fn: "FHE.allow(handle, addr)", desc: "Grant decryption rights to address" },
  { fn: "FHE.allowThis(handle)", desc: "Grant contract permission on handle" },
  { fn: "FHE.makePubliclyDecryptable(h)", desc: "Allow anyone to decrypt the handle" },
];

const GLOSSARY = [
  { term: "FHE (Fully Homomorphic Encryption)", def: "Encryption scheme allowing computation on encrypted data without decryption." },
  { term: "Ciphertext", def: "Encrypted value, opaque to the EVM. Cannot be inspected or branched on." },
  { term: "Plaintext", def: "Unencrypted value visible to all network participants." },
  { term: "Coprocessor", def: "Off-chain component that performs FHE operations on behalf of the EVM." },
  { term: "Handle", def: "On-chain reference (bytes32 pointer) to a ciphertext stored in the coprocessor." },
  { term: "ACL (Access Control List)", def: "Per-handle permissions controlling who can decrypt a given ciphertext." },
  { term: "ebool", def: "Encrypted boolean. Cannot be used in if/require statements." },
  { term: "euint64", def: "Most common encrypted type. 64-bit unsigned integer stored as a ciphertext handle." },
  { term: "eaddress", def: "Encrypted Ethereum address. 160-bit encrypted value." },
  { term: "FHE.select", def: "Branchless conditional. Both paths compute; one is chosen based on encrypted condition." },
  { term: "No-Revert Pattern", def: "Design principle where encrypted operations never revert, preventing information leakage." },
  { term: "Gateway", def: "Infrastructure component that processes decryption requests between on-chain and off-chain." },
  { term: "Relayer SDK", def: "Client-side SDK for generating encrypted inputs and requesting decryptions." },
  { term: "externalEuint64", def: "Parameter type for user-submitted encrypted values. Requires ZK proof validation." },
  { term: "FHE.fromExternal", def: "Validates and unwraps user-submitted encrypted input with its ZK proof." },
  { term: "ZamaEthereumConfig", def: "Base contract that configures the FHE coprocessor connection." },
  { term: "SepoliaConfig", def: "Configuration preset for Sepolia testnet FHE deployment." },
  { term: "Mock FHE", def: "Local testing environment with instant FHE operations for rapid development." },
  { term: "ERC7984", def: "Standard for FHE-compatible token interfaces with standardized re-encryption events." },
  { term: "Selective Encryption", def: "Strategy of encrypting only privacy-sensitive fields to minimize gas costs." },
];

const EXTERNAL_RESOURCES = [
  { title: "Zama FHEVM Documentation", url: "https://docs.zama.ai/fhevm", desc: "Official reference for the FHEVM Solidity library and coprocessor API." },
  { title: "FHEVM Hardhat Template", url: "https://github.com/zama-ai/fhevm-hardhat-template", desc: "Starter repository with mock FHE environment pre-configured for development." },
  { title: "Zama Blog", url: "https://zama.ai/blog", desc: "Technical articles, protocol updates, and deep dives from the Zama team." },
  { title: "FHE Hub Examples", url: "https://tomi204.gitbook.io/fhe-hub-examples", desc: "Community-contributed examples and patterns for FHEVM development." },
  { title: "FHEVM Solidity Library", url: "https://github.com/zama-ai/fhevm", desc: "Core Solidity library providing FHE types, operations, and configuration contracts." },
];

/* ========== TAB 2: INSTRUCTOR GUIDE DATA ========== */

const SCHEDULE = [
  { day: "Monday", activity: "Week kickoff call (30 min). Introduce concepts, recap previous HW.", type: "live" },
  { day: "Mon-Wed", activity: "Self-paced lessons. Students work through lesson plans.", type: "async" },
  { day: "Wednesday", activity: "Optional office hours / pair programming (2 hrs).", type: "live" },
  { day: "Wed-Fri", activity: "Homework development. Starter repos open; submission via GitHub PR.", type: "async" },
  { day: "Friday", activity: "Homework submission deadline (23:59 AOE). Optional live review.", type: "deadline" },
  { day: "Saturday", activity: "Grading period. Instructors run automated test suites.", type: "admin" },
  { day: "Sunday", activity: "Grades + feedback posted. Async 1:1 review via Discord.", type: "admin" },
];

const COMMON_MISTAKES = [
  {
    mistake: "Forgetting FHE.allow() / FHE.allowThis() after updating ciphertexts",
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
  { title: "Weekly Kickoff Call (Monday)", desc: "30 min, introduce concepts, live walkthrough. Record it for async learners." },
  { title: "Discord #fhevm-help Channel", desc: "Pin common errors. The community will self-solve 80% of issues if the channel is well-organized." },
  { title: "Friday Review Session", desc: "Showcase 2-3 exceptional submissions. This motivates the best students and shows everyone what excellence looks like." },
  { title: "Mock FHE for Speed, Sepolia for Finals", desc: "All development uses mock FHE (instant). Only Week 4 capstone requires Sepolia deployment." },
  { title: "Public Leaderboard", desc: "Anonymized weekly ranking increases completion rates. Friendly competition drives engagement." },
  { title: "Pair Programming Office Hours", desc: "2 hrs mid-week for synchronous help. Students stuck on Week 2 AMM logic benefit enormously." },
];

const TEMPLATES = [
  { name: "fhevm-hardhat-template", desc: "Official Zama starter with mock FHE environment pre-configured.", url: "https://github.com/zama-ai/fhevm-hardhat-template" },
  { name: "ConfToken Starter", desc: "Week 1 scaffold with ERC20 structure and FHE imports.", url: "https://github.com/zama-ai/fhevm-hardhat-template" },
  { name: "DarkPoolAMM Starter", desc: "Week 2 scaffold with pool struct and interfaces defined.", url: "https://github.com/zama-ai/fhevm-hardhat-template" },
  { name: "BlindAuction Starter", desc: "Week 3 starter extending GatewayCaller for bid logic.", url: "https://github.com/zama-ai/fhevm-hardhat-template" },
  { name: "Payroll Capstone Starter", desc: "Week 4 three-contract scaffold with interfaces defined.", url: "https://github.com/zama-ai/fhevm-hardhat-template" },
  { name: "Solution Repositories", desc: "Reference solutions for all 4 weeks. Released after each homework deadline.", url: "https://github.com/zama-ai/fhevm-hardhat-template" },
  { name: "Master Audit Template", desc: "Expert-tier scaffold with BrokenPool.sol for the audit challenge.", url: "https://tomi204.gitbook.io/fhe-hub-examples" },
];

const GRADING_CODE = `<span class="cm"># Grade a student submission</span>
git clone &lt;student-repo-url&gt; submission && cd submission
npm install
npx hardhat test --network hardhat  <span class="cm"># mock FHE — instant</span>

<span class="cm"># Expected output:</span>
<span class="cm"># &#10003; deploys ConfToken with ZamaEthereumConfig (234ms)</span>
<span class="cm"># &#10003; transfer uses FHE.select, never reverts (189ms)</span>
<span class="cm"># ... 6/6 tests passing → 70/100 points</span>`;

/* ========== TAB 3: VIDEO GUIDE DATA ========== */

const SCRIPT_SEGMENTS = [
  {
    time: "0:00-0:30",
    title: "The Hook",
    type: "CAMERA",
    visual: "On camera: high-energy opener. Cut to split screen showing standard Etherscan block explorer vs. mock encrypted explorer with only ciphertext blobs.",
    script: `[Looking directly at camera, energetically]

"Everyone in this room knows that Ethereum is transparent. Open up Etherscan and you can see exactly what Alice paid Bob — down to the last wei. Every salary transaction, every medical DAO vote, every private deal... completely public.

The infrastructure to fix this has been live for over a year. Zama's Fully Homomorphic Encryption Virtual Machine — fhEVM — lets you compute directly on encrypted data, on-chain, without ever decrypting it.

Today, I'm introducing the FHEVM Blackbox Bootcamp — a production-ready, 4-week developer program to take any Solidity developer from zero to shipping production-grade confidential dApps."`,
    notes: "Energy matters in the first 30 seconds. Smile. Make eye contact. Do NOT read from a script — memorize this opening or speak from genuine enthusiasm.",
  },
  {
    time: "0:30-1:30",
    title: "Curriculum Overview",
    type: "SCREEN",
    visual: "Screen recording: clean animated timeline with 4 weekly cards sliding in from left, each labeled with the week title and homework project name.",
    script: `[Cut to screen recording of curriculum page]

"The bootcamp runs 4 weeks, and the progression is intentional — no fluff, no padding.

Week 1: We break the mental model. Standard Solidity thinks in plaintexts. fhEVM thinks in ciphertexts. Students write their first confidential ERC20 token where every balance is encrypted, and transfers silently no-op instead of reverting. Contracts inherit ZamaEthereumConfig — one line that wires the entire FHE coprocessor.

Week 2: We master the full FHE operation set — arithmetic, comparisons, boolean algebra on encrypted values. The homework is a Dark Pool AMM where trade size and slippage are fully encrypted. MEV bots see nothing.

Week 3: We answer the question every student asks: 'If everything is encrypted, how does a user see their own balance?' We teach public decryption (FHE.makePubliclyDecryptable) and private user decryption via the Relayer SDK.

Week 4 is the capstone: a Confidential Mass-Payroll system. Three contracts, Sepolia deployment, 10+ test cases. The employer knows total budget; employees only see their own salary."`,
    notes: "Use smooth screen transitions between the 4 week slides. Each week should have a 2-second dedicated frame so viewers can read the title. Keep narration paced — don't rush.",
  },
  {
    time: "1:30-3:30",
    title: "Sample Lesson Walkthrough",
    type: "SCREEN",
    visual: "VS Code side by side: left panel shows broken standard ERC20 with require() statement; right panel shows the corrected fhEVM version with FHE.select.",
    script: `[Cut to full screen VS Code]

"Let me show you exactly how we teach Week 1. Take a look at this transfer function from a standard ERC20.

[Highlight standard require() line]
require(balances[msg.sender] >= amount, 'Insufficient balance');

In a normal Ethereum transaction, if Alice doesn't have enough balance, this line throws. The transaction reverts. And here's the problem — that revert is a signal. An observer on the mempool now knows: Alice's balance is below that specific amount. Data leaked. Privacy destroyed.

Now watch what we do on fhEVM.

[Switch to fhEVM version]
First, the contract inherits ZamaEthereumConfig. Then we replace uint256 with euint64. Users provide transfer amounts as externalEuint64 values, and we call FHE.fromExternal() to validate the ZK proof.

We can't require() on encrypted data, because the EVM doesn't know the plaintext.

Instead, we create an encrypted boolean mask using FHE.le — which returns an ebool. Then we feed that mask into FHE.select.

[Highlight FHE.select block]
FHE.select takes three arguments: the encrypted condition, the 'if true' value, and the 'if false' value. Both values are computed. Only one is selected — silently, indistinguishably.

The transaction always succeeds. Gas cost is identical whether the transfer executed or not. An observer learns nothing."`,
    notes: "This is the most important segment. Practice the VS Code demo at least 3 times. Have both files open and tabbed before recording. Use a minimal dark theme and large font for clarity.",
  },
  {
    time: "3:30-4:40",
    title: "Homework Design Philosophy",
    type: "SLIDES",
    visual: "Animated diagram: Spec then Starter Repo then Code then Hardhat Tests then Automated Grading. Transition to a mock Discord channel showing student submissions.",
    script: `[Cut to slide with grading diagram]

"Every homework assignment in this bootcamp is test-driven. There are no multiple-choice questions, no essays. Every rubric criterion maps to a specific named Hardhat test.

If your tests pass, you pass. It's deterministic, auditable, and scales to cohorts of ten thousand without any manual grading bottleneck.

[Cut to slide showing 2-tier grading]
We use a two-tier rubric. 'Pass' criteria are the core skills — every student who does the reading can achieve these. 'Excellent' criteria require going deeper — edge cases, gas optimization, frontend integration.

The scenarios are drawn from real-world problems. Week 4's Confidential Payroll isn't a toy — it's the exact architecture a fintech company could use to run anonymous payroll on a blockchain.

The instructor hub includes automated grading scripts, common mistake playbooks, and solution repositories released post-deadline. This bootcamp is ready to run — today."`,
    notes: "Keep this segment punchy — don't slow down here. The viewer should feel momentum building toward the close.",
  },
  {
    time: "4:40-5:00",
    title: "The Close",
    type: "CAMERA",
    visual: "Back on camera. Arc shot closing on face. Final frame: FHEVM Blackbox Bootcamp logo with tagline.",
    script: `[Back to camera — calm, confident, direct]

"The infrastructure for confidential blockchains is here. The protocol is live, the tooling is mature, and the coprocessor is running on Sepolia today.

What's missing are the builders who know how to use it.

The FHEVM Blackbox Bootcamp is that bridge. Four weeks. Four projects. One complete engineer who can ship production-grade confidential dApps on the Zama Protocol.

Let's build in the dark."

[Hold for 2 seconds. Fade to logo.]`,
    notes: "Do not rush the final line. 'Let's build in the dark.' — pause for 1 beat before and after. This is your brand closing line.",
  },
];

const PRODUCTION_TIPS = [
  { label: "Recording", tip: "Use OBS or Loom for screen recordings. Set resolution to 1920x1080 at 60fps." },
  { label: "Audio", tip: "Use a USB condenser microphone (Blue Yeti, AT2020). Audio quality matters more than video." },
  { label: "Lighting", tip: "Film camera segments with a ring light at eye level. Soft, even lighting beats expensive cameras." },
  { label: "VS Code", tip: "Dark theme (Dracula or Tokyo Night), font size 18+, hide all sidebars and toolbars." },
  { label: "Editing", tip: "Edit in DaVinci Resolve (free). Cut all pauses > 0.5s and clean filler words. Target 4:45 runtime." },
  { label: "Subtitles", tip: "Add subtitles. DaVinci's Magic Mask auto-generates them. Subtitles boost engagement by 40%." },
];

/* ========== TABS ========== */

const TABS = [
  { id: "materials", label: "Learning Materials" },
  { id: "instructor", label: "Instructor Guide" },
  { id: "video", label: "Video Guide" },
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
            <DecryptText text="Teaching & Reference Hub" as="span" delay={200} duration={1000} />
          </h1>
          <p className="res-sub fade-in">
            Everything you need to run the FHEVM Blackbox Bootcamp — for cohorts of 10 or 10,000.
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
        <div className={`res-tab-panel${activeTab === "materials" ? " res-tab-panel--active" : ""}`}>
          {activeTab === "materials" && <TabMaterials />}
        </div>
        <div className={`res-tab-panel${activeTab === "instructor" ? " res-tab-panel--active" : ""}`}>
          {activeTab === "instructor" && (
            <TabInstructor
              expandedMistakes={expandedMistakes}
              toggleMistake={toggleMistake}
            />
          )}
        </div>
        <div className={`res-tab-panel${activeTab === "video" ? " res-tab-panel--active" : ""}`}>
          {activeTab === "video" && <TabVideo />}
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
                  <td><code className="res-type-code">{t.type}</code></td>
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
              <span className="ext-resource-url">{r.url.replace("https://", "")}</span>
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
                  <td><strong>{s.day}</strong></td>
                  <td>{s.activity}</td>
                  <td>
                    <span className={`res-type-tag res-type-tag--${s.type}`}>
                      {s.type === "live" ? "Live" : s.type === "async" ? "Async" : s.type === "deadline" ? "Deadline" : "Admin"}
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
            <div key={i} className={`mistake-card card${expandedMistakes[i] ? " mistake-card--expanded" : ""}`}>
              <button className="mistake-header" onClick={() => toggleMistake(i)}>
                <span className="mistake-num">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mistake-title">{m.mistake}</h3>
                <span className="mistake-toggle">{expandedMistakes[i] ? "\u2212" : "+"}</span>
              </button>
              <div className="mistake-body">
                <div className="mistake-block">
                  <span className="block-label">Why it happens</span>
                  <p>{m.why}</p>
                </div>
                <div className="mistake-block mistake-block--fix">
                  <span className="block-label block-label--fix">Recommended fix</span>
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
          Each homework submission includes a Hardhat project with passing tests. Instructors run student submissions with a single command. The rubric maps 1:1 to named test cases.
        </p>
        <CodeBlock code={GRADING_CODE} language="bash" filename="grading.sh" />
      </section>
    </>
  );
}

/* ========== TAB 3: VIDEO GUIDE ========== */

function TabVideo() {
  return (
    <>
      {/* 5-Minute Demo Script */}
      <section className="res-section fade-in">
        <h2 className="res-section-title">5-Minute Demo Script</h2>
        <div className="script-segments">
          {SCRIPT_SEGMENTS.map((seg, i) => (
            <div key={i} className="segment-card card">
              <div className="segment-top">
                <span className="segment-timecode">{seg.time}</span>
                <h3 className="segment-title">Segment {i + 1}: {seg.title}</h3>
                <span className={`segment-type segment-type--${seg.type.toLowerCase()}`}>
                  {seg.type}
                </span>
              </div>

              <div className="segment-block segment-block--visual">
                <span className="segment-block-label">VISUAL DIRECTION</span>
                <p>{seg.visual}</p>
              </div>

              <div className="segment-block segment-block--script">
                <span className="segment-block-label">SCRIPT</span>
                <pre className="segment-pre">{seg.script}</pre>
              </div>

              <div className="segment-block segment-block--notes">
                <span className="segment-block-label">DIRECTOR NOTE</span>
                <p>{seg.notes}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Production Tips */}
      <section className="res-section fade-in">
        <h2 className="res-section-title">Production Tips</h2>
        <div className="grid-3" style={{ marginTop: 20 }}>
          {PRODUCTION_TIPS.map((t, i) => (
            <div key={i} className="prod-card card">
              <span className="prod-label">{t.label}</span>
              <p>{t.tip}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
