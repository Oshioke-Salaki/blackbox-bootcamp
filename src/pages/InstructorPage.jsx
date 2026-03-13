import { useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import "./InstructorPage.css";

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
      { threshold: 0.08 },
    );
    const elements = ref.current?.querySelectorAll(".fade-in") || [];
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
  return ref;
}

const COMMON_MISTAKES = [
  {
    mistake:
      "Forgetting FHE.allow() / FHE.allowThis() after updating ciphertexts",
    explanation:
      "Every time you call FHE.add(), FHE.sub(), or FHE.select() to produce a new ciphertext handle, the old ACL permissions are invalidated. Students always forget to call FHE.allow() and FHE.allowThis() after the update, causing silent re-encryption failures in tests.",
    fix: "Add a comment pattern to the starter code: // After every FHE mutation → re-grant: FHE.allowThis(handle) + FHE.allow(handle, user). Make it a grading rubric checklist item.",
  },
  {
    mistake: "Using if (ebool) branching",
    explanation:
      "Students immediately try to write if (FHE.le(a, b)) { ... }. This doesn't compile — ebool is a ciphertext handle, not a boolean. The EVM cannot branch on encrypted data.",
    fix: "Show this error in Lesson 1.3 demo on purpose. Students remember errors better than successes. Then show the corrected FHE.select() pattern side by side.",
  },
  {
    mistake: "Using the old 'einput' pattern instead of externalEuint64",
    explanation:
      "Students copying from older FHEVM tutorials use 'einput' + FHE.fromExternal(handle, proof) incorrectly or reference the old TFHE.asEuint64 signature. The current Zama API uses externalEuint64 as the parameter type and FHE.fromExternal(handle, proof) to validate and convert.",
    fix: "Add a clear cheat sheet in the starter repo README: (1) FHE.asEuint64(uint64) for owner/admin plain initialization, (2) FHE.fromExternal(externalEuint64, bytes) for user-submitted encrypted inputs.",
  },
  {
    mistake: "Confusing public decryption with FHE.makePubliclyDecryptable()",
    explanation:
      "Students try to call a synchronous decrypt function expecting immediate plaintext. The current API has two paths: FHE.makePubliclyDecryptable() (on-chain auth for public reveals, then off-chain Relayer call) and instance.userDecrypt() via the Relayer SDK for private user reads.",
    fix: "Emphasize in Lesson 3.1: decryption is always a two-step process. On-chain: authorize with FHE.makePubliclyDecryptable() or FHE.allow(). Off-chain: call the Relayer endpoint via the SDK.",
  },
  {
    mistake: "Not funding Sepolia wallet before Week 4",
    explanation:
      "The Sepolia faucet can be slow or rate-limited. Students who wait until class time to fund their wallet block the entire lab session.",
    fix: "Send a pre-class email on Monday of Week 4 with faucet instructions. Provide backup funded wallets for students who fail to fund in time.",
  },
  {
    mistake: "Encrypting every field in a struct",
    explanation:
      "Students who over-encrypt (e.g., encrypting employee IDs, timestamps, public addresses) drive gas costs through the roof and sometimes hit the FHE compute limit.",
    fix: "Lesson 4.1 covers selective encryption. Do a live gas comparison between an over-encrypted and correctly encrypted struct. The 60–70% gas reduction shocks students into compliance.",
  },
  {
    mistake: "The 'View-Function' Pointer Leak",
    explanation:
      "Advanced students often write public view functions that return euint64 handles without verifying the identity of the caller. In FHE, the handle is a pointer; if a malicious user gets someone else's handle, they can attempt to decrypt it via the Relayer if the ACL isn't strictly enforced.",
    fix: "Always use FHE.isSenderAllowed(handle) inside view functions. This ensures the Relayer only returns plaintext if the person requesting the decryption actually has the ACL rights to that specific handle.",
  },
  {
    mistake: "Ignoring ERC7984 Standards for RWA tokens",
    explanation:
      "Students building professional assets often miss the standardized re-encryption events required for wallet compatibility. This makes their tokens 'invisible' to third-party FHE explorers.",
    fix: "Provide the ERC7984 interface in the Master Template. Require students to inherit from it and emit the standardized 'AuthorizedDecryption' events.",
  },
];

const COHORT_TIPS = [
  {
    icon: "📅",
    title: "Weekly Kickoff Call (Monday)",
    desc: "Host a 30-minute Monday session to introduce the week's concepts, answer questions from the previous homework, and do a live setup walkthrough. Record it for async learners.",
  },
  {
    icon: "💬",
    title: "Discord #fhevm-help Channel",
    desc: "Create a dedicated channel. Pin the most common error messages and their fixes. The community will self-solve 80% of issues if the channel is well-organized.",
  },
  {
    icon: "🍿",
    title: "Friday Review Session (Optional)",
    desc: 'Live code review of submitted homework. Pick 2–3 exceptional submissions to showcase. This motivates the best students and shows everyone what "Excellent" tier looks like.',
  },
  {
    icon: "⚡",
    title: "Mock FHE for Speed, Sepolia for Finals",
    desc: "All development and homework testing uses the mock FHE environment (instant). Only the Week 4 capstone requires Sepolia deployment. This prevents slow coprocessor wait times from blocking learners.",
  },
  {
    icon: "📊",
    title: "Public Leaderboard (Optional)",
    desc: "Share a weekly ranking of homework scores (anonymized or opt-in). Friendly competition dramatically increases completion rates in cohort settings.",
  },
  {
    icon: "🛟",
    title: "Pair Programming Office Hours",
    desc: "Allocate 2 hours mid-week for optional drop-in pair programming. Students stuck on Week 2 AMM logic benefit enormously from synchronous help.",
  },
];

const TEMPLATES = [
  {
    name: "fhevm-hardhat-template",
    desc: "Official Zama Hardhat starter with mock FHE environment pre-configured. Base for all weekly homework.",
    url: "https://github.com/zama-ai/fhevm-hardhat-template",
    icon: "🔧",
  },
  {
    name: "ConfToken Starter",
    desc: "Week 1 starter with ERC20 scaffold and FHE imports. Students fill in the encrypted storage and transfer logic.",
    url: "https://github.com/zama-ai/fhevm-hardhat-template",
    icon: "🪙",
  },
  {
    name: "DarkPoolAMM Starter",
    desc: "Week 2 AMM scaffold with pool struct and interfaces defined. Students implement the constant-product formula.",
    url: "https://github.com/zama-ai/fhevm-hardhat-template",
    icon: "🌀",
  },
  {
    name: "BlindAuction Starter",
    desc: "Week 3 starter extending GatewayCaller. Students implement bid logic and fulfillDecryption callback.",
    url: "https://github.com/zama-ai/fhevm-hardhat-template",
    icon: "🔏",
  },
  {
    name: "Payroll Capstone Starter",
    desc: "Week 4 three-contract scaffold with interfaces defined. Students implement the full system and deploy to Sepolia.",
    url: "https://github.com/zama-ai/fhevm-hardhat-template",
    icon: "💼",
  },
  {
    name: "Solution Repositories",
    desc: "Reference solutions for all 4 weeks — to be released after each homework deadline. For instructors only until then.",
    url: "https://github.com/zama-ai/fhevm-hardhat-template",
    icon: "✅",
  },
  {
    name: "Master Audit & RWA Template",
    desc: "Expert-tier scaffold for the Institutional-Grade assignment. Includes BrokenPool.sol for the audit challenge.",
    url: "https://tomi204.gitbook.io/fhe-hub-examples",
    icon: "🏦",
  },
];

const SCHEDULE = [
  {
    day: "Monday",
    activity:
      "Week kickoff call (30 min). Introduce concepts, recap previous HW.",
    type: "sync",
  },
  {
    day: "Monday–Wednesday",
    activity:
      "Self-paced lessons. Students work through 4 lesson plans at their own pace.",
    type: "async",
  },
  {
    day: "Wednesday",
    activity: "Optional office hours / pair programming (2 hrs).",
    type: "sync",
  },
  {
    day: "Wednesday–Friday",
    activity:
      "Homework development. Starter repos open from Monday; submission via GitHub PR.",
    type: "async",
  },
  {
    day: "Friday",
    activity:
      "Homework submission deadline (23:59 AOE). Optional live review session.",
    type: "deadline",
  },
  {
    day: "Saturday",
    activity:
      "Grading period. Instructors run automated test suites against submissions.",
    type: "admin",
  },
  {
    day: "Sunday",
    activity:
      "Grades + feedback posted. Students can request async 1:1 review via Discord.",
    type: "admin",
  },
];

export default function InstructorPage() {
  const ref = useFadeIn();

  return (
    <div className="page instructor-page" ref={ref}>
      <section className="inst-header">
        <div className="container">
          <span className="tag tag-purple fade-in">Instructor Hub</span>
          <h1 className="section-title fade-in" style={{ marginTop: 16 }}>
            Teaching Guide &<br />
            <span className="glow-text">Instructor Notes</span>
          </h1>
          <p className="section-sub fade-in">
            Everything you need to run the FHEVM Blackbox Bootcamp at scale —
            for cohorts of 10 or 10,000. Common student mistakes, teaching
            strategies, template repositories, and a full weekly schedule.
          </p>
        </div>
      </section>

      <div className="container inst-content">
        {/* Weekly cadence */}
        <section className="inst-section fade-in">
          <h2 className="inst-section-title">📅 Recommended Weekly Cadence</h2>
          <p
            style={{
              color: "var(--text-secondary)",
              marginBottom: 24,
              fontSize: 15,
              lineHeight: 1.7,
            }}
          >
            This schedule works for both cohort-based (synchronous) and
            self-paced (asynchronous) learning. Synchronous events are marked;
            everything else can be completed on the student's own time.
          </p>
          <div className="schedule-table table-wrapper">
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
                      <span className={`type-badge type-${s.type}`}>
                        {s.type === "sync"
                          ? "🔴 Live"
                          : s.type === "async"
                            ? "🟢 Async"
                            : s.type === "deadline"
                              ? "⏰ Deadline"
                              : "🔧 Admin"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Common mistakes */}
        <section className="inst-section fade-in">
          <h2 className="inst-section-title">
            ⚠️ Common Student Mistakes & How to Address Them
          </h2>
          <p
            style={{
              color: "var(--text-secondary)",
              marginBottom: 24,
              fontSize: 15,
            }}
          >
            These are predictable failure patterns across the first 3 cohort
            runs. Address them proactively to save your office hours queue.
          </p>
          <div className="mistakes-list">
            {COMMON_MISTAKES.map((m, i) => (
              <div key={i} className="mistake-card glass-card">
                <div className="mistake-header">
                  <span className="mistake-num">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3>{m.mistake}</h3>
                </div>
                <div className="mistake-body">
                  <div className="mistake-block">
                    <span className="block-label">🔍 Why it happens</span>
                    <p>{m.explanation}</p>
                  </div>
                  <div className="mistake-block fix">
                    <span className="block-label">✅ Recommended fix</span>
                    <p>{m.fix}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Cohort tips */}
        <section className="inst-section fade-in">
          <h2 className="inst-section-title">🚀 Running a Successful Cohort</h2>
          <div className="grid-3" style={{ marginTop: 24 }}>
            {COHORT_TIPS.map((t) => (
              <div key={t.title} className="cohort-tip-card glass-card">
                <span className="tip-icon-lg">{t.icon}</span>
                <h3>{t.title}</h3>
                <p>{t.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Template repos */}
        <section className="inst-section fade-in">
          <h2 className="inst-section-title">
            📦 Starter & Solution Repositories
          </h2>
          <p
            style={{
              color: "var(--text-secondary)",
              marginBottom: 24,
              fontSize: 15,
            }}
          >
            All repositories are based on the official Zama FHEVM Hardhat
            template. Each week has a customized starter with scaffolded
            contracts and solution repos released after submission deadlines.
          </p>
          <div className="grid-2">
            {TEMPLATES.map((t) => (
              <a
                key={t.name}
                href={t.url}
                target="_blank"
                rel="noreferrer"
                className="template-card glass-card"
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    marginBottom: 10,
                  }}
                >
                  <span style={{ fontSize: 24 }}>{t.icon}</span>
                  <h3 style={{ fontFamily: "var(--font-mono)", fontSize: 14 }}>
                    {t.name}
                  </h3>
                </div>
                <p>{t.desc}</p>
                <span className="template-link">View Repository →</span>
              </a>
            ))}
          </div>
        </section>

        {/* Grading automation note */}
        <section className="inst-section fade-in">
          <div className="automation-card glass-card">
            <div className="automation-icon">⚡</div>
            <div>
              <h2>Automated Grading Infrastructure</h2>
              <p>
                The FHEVM Blackbox Bootcamp is designed for automated grading at
                scale. Each homework submission should include a Hardhat project
                with passing tests. Instructors can run student submissions with
                a single command. The rubric maps 1:1 to named test cases in the
                solution test suite.
              </p>
              <div className="code-block" style={{ marginTop: 20 }}>
                <pre>{`# Grade a student submission
git clone <student-repo-url> submission && cd submission
npm install
npx hardhat test --network hardhat  # mock FHE — instant

# Expected output:
# ✓ deploys ConfToken with ZamaEthereumConfig (234ms)
# ✓ transfer uses FHE.select, never reverts (189ms)
# ✓ Alice cannot read Bob's balance (ACL check) (143ms)
# ... 6/6 tests passing → 70/100 points`}</pre>
              </div>
            </div>
          </div>
        </section>

        <div className="inst-footer fade-in">
          <Link to="/homework" className="btn-outline">
            ← Homework Specs
          </Link>
          <Link to="/video-script" className="btn-primary">
            View Video Script →
          </Link>
        </div>
      </div>
    </div>
  );
}
