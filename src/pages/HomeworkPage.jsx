import { useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import "./HomeworkPage.css";

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

const ASSIGNMENTS = [
  {
    week: "01",
    color: "cyan",
    title: "Confidential ERC20 Token (ConfToken)",
    subtitle:
      "Transform a standard ERC20 into a fully private token using FHE encrypted types",
    time: "3–5 hours",
    difficulty: "Beginner",
    concepts: [
      "euint64",
      "FHE.select",
      "FHE.allow()",
      "FHE.allowThis()",
      "No-Revert Transfers",
    ],
    scenario: `A fintech startup needs a token for payroll distributions where regulatory compliance allows public total supply, but individual holdings must remain private. Your task is to build the foundation of their confidential token standard.`,
    deliverables: [
      "ConfToken.sol — confidential ERC20 with encrypted balances and transfers",
      "ConfToken.test.js — Hardhat test suite demonstrating privacy properties",
      'README.md — explanation of your "No Revert" implementation and security rationale',
    ],
    spec: [
      {
        title: "Core Contract Requirements",
        items: [
          "Replace uint256 balances mapping with mapping(address => euint64)",
          "Replace uint256 allowances mapping with mapping(address => mapping(address => euint64))",
          "mint() function can only be called by owner, sets euint64 balance directly",
          "transfer() must NOT revert on insufficient balance",
          "transfer() must use FHE.select to silently no-op when balance is insufficient",
          "transfer() accepts externalEuint64 + bytes proof (not einput)",
          "transferFrom() must handle encrypted allowance decrements correctly",
          "FHE.allow() and FHE.allowThis() must be called after every balance/allowance update",
          "inherit ZamaEthereumConfig for proper coprocessor configuration",
          "totalSupply() remains public plaintext (regulatory requirement)",
        ],
      },
      {
        title: "Test Requirements",
        items: [
          "Test: Alice mints tokens, her encrypted balance is set correctly",
          "Test: Alice transfers to Bob — Alice's balance decreases, Bob's increases",
          "Test: Alice attempts to overspend — no revert, no state change",
          "Test: Carol cannot read Alice's balance (no FHE ACL permission)",
          "Test: transferFrom with encrypted allowance works end-to-end",
          "Test: ZamaEthereumConfig correctly initializes the FHE coprocessor",
          "Test: totalSupply() returns correct plaintext value",
        ],
      },
    ],
    grading: [
      { points: 15, label: "Compiles without errors", level: "Pass" },
      {
        points: 15,
        label: "Encrypted balances mapping declared correctly",
        level: "Pass",
      },
      {
        points: 20,
        label: "transfer() uses FHE.select, never reverts",
        level: "Pass",
      },
      { points: 20, label: "All Hardhat tests pass", level: "Pass" },
      {
        points: 15,
        label: "transferFrom() with encrypted allowances",
        level: "Excellent",
      },
      {
        points: 15,
        label: "FHE.allow() / FHE.allowThis() correctly scoped post-update",
        level: "Excellent",
      },
    ],
    tip: "When you update an encrypted balance with FHE.add() or FHE.sub(), the old ciphertext handle is invalidated. Always call FHE.allow() and FHE.allowThis() after any mutation — even if the same address had permission before. This is the #1 source of test failures.",
  },
  {
    week: "02",
    color: "purple",
    title: "Dark Pool AMM — Simplified",
    subtitle:
      "Build a front-running-resistant DEX where trade sizes are fully encrypted",
    time: "4–6 hours",
    difficulty: "Intermediate",
    concepts: [
      "FHE.mul",
      "FHE.div",
      "FHE.and/or",
      "FHE.select",
      "externalEuint64",
    ],
    scenario: `A DeFi protocol wants to eliminate MEV extraction from their token swap. Currently, bots see every pending trade in the mempool and front-run it for profit. With FHEVM, trade amounts are encrypted — bots see nothing until the tx is finalized and it's too late.`,
    deliverables: [
      "DarkPoolAMM.sol — confidential constant-product AMM",
      "DarkPool.test.js — tests covering valid swaps, invalid swaps, and edge cases",
      "GasReport.md — analysis of gas cost vs standard Uniswap V2 pair",
    ],
    spec: [
      {
        title: "Core Contract Requirements",
        items: [
          "Pool struct with euint64 reserveA and euint64 reserveB",
          "initialize() sets initial reserves with encrypted values",
          "swap(externalEuint64 encAmount, bytes proof, bool aToB) is the main entry point",
          "Use FHE.fromExternal(encAmount, proof) to validate and unwrap the input",
          "Implements constant-product formula: Δy = y * Δx / (x + Δx)",
          "All arithmetic (FHE.mul, FHE.div, FHE.add, FHE.sub) must operate on euint64",
          "Invalid swaps (zero output, insufficient reserve) silently no-op via FHE.select",
          "FHE.allowThis() called after every reserve update",
        ],
      },
      {
        title: "Anti-MEV Properties to Demonstrate",
        items: [
          "A third-party observer cannot determine the swap amount from on-chain data",
          "A failed swap (insufficient pool liquidity) does not reveal the attempted amount",
          "The constant-product invariant k = x * y is maintained after each valid swap",
        ],
      },
    ],
    grading: [
      {
        points: 10,
        label: "Pool initialized with encrypted reserves",
        level: "Pass",
      },
      {
        points: 20,
        label: "swap() accepts encrypted amount with proof",
        level: "Pass",
      },
      {
        points: 20,
        label: "Constant-product formula computed on encrypted values",
        level: "Pass",
      },
      {
        points: 20,
        label: "Invalid swaps silently no-op without state corruption",
        level: "Pass",
      },
      {
        points: 15,
        label: "Encrypted slippage tolerance implemented",
        level: "Excellent",
      },
      {
        points: 15,
        label:
          "Comprehensive edge case tests (zero amount, pool drain attempts)",
        level: "Excellent",
      },
    ],
    tip: "FHE.mul is the most expensive FHE operation. For the constant-product formula, compute numerator = FHE.mul(poolOut, amount) then FHE.div(numerator, denominator). Avoid chaining multiplications. Use FHE.allowThis() on both reserve handles after every swap.",
  },
  {
    week: "03",
    color: "orange",
    title: "Confidential Blind Auction",
    subtitle:
      "Sealed-bid auction with Gateway-triggered winner reveal and @zama-fhe/relayer-sdk frontend",
    time: "5–7 hours",
    difficulty: "Intermediate–Advanced",
    concepts: [
      "FHE.makePubliclyDecryptable()",
      "@zama-fhe/relayer-sdk",
      "SepoliaConfig",
      "userDecrypt()",
    ],
    scenario: `An NFT marketplace wants to run truly blind auctions where bidders cannot see each other's bids, preventing bid gaming and sniping. The auction runs for 7 days, then the owner reveals the winner publicly.`,
    deliverables: [
      "BlindAuction.sol — sealed-bid auction with FHE-based winner tracking",
      "BlindAuction.test.js — full Hardhat test suite",
      "bid-script.js — Node.js script using @zama-fhe/relayer-sdk to submit encrypted bid",
      "README.md — architecture explanation and security model",
    ],
    spec: [
      {
        title: "Solidity Contract Requirements",
        items: [
          "bid(externalEuint64 encBid, bytes proof) stores encrypted bid for msg.sender",
          "Use FHE.fromExternal(encBid, proof) to validate and convert the input",
          "Highest bid tracked as euint64 highestBid using FHE.select — never reveals who won",
          "highestBidder tracked as eaddress (encrypted)",
          "revealWinner() callable only by owner after auction ends",
          "revealWinner() calls FHE.makePubliclyDecryptable() on highestBid and highestBidder",
          "Winner revealed off-chain via Relayer public decryption endpoint",
          "FHE.allow() properly scoped so only bidder can view their own bid handle",
        ],
      },
      {
        title: "@zama-fhe/relayer-sdk Node.js Script Requirements",
        items: [
          "Import { createInstance, SepoliaConfig } from '@zama-fhe/relayer-sdk'",
          "Initialize instance with createInstance(SepoliaConfig)",
          "Accepts bid amount as CLI argument: node bid-script.js 500",
          "Creates encrypted input buffer: instance.createEncryptedInput(contractAddr, userAddr)",
          "Calls buffer.add64(BigInt(amount)) then await buffer.encrypt()",
          "Submits ciphertexts.handles[0] and ciphertexts.inputProof to contract.bid()",
          "Logs the encrypted handle to console for verification",
        ],
      },
    ],
    grading: [
      {
        points: 20,
        label: "bid() stores encrypted bids, tracks highest correctly",
        level: "Pass",
      },
      {
        points: 20,
        label: "revealWinner() triggers Gateway decryption correctly",
        level: "Pass",
      },
      {
        points: 20,
        label: "fulfillDecryption() callback emits correct event",
        level: "Pass",
      },
      {
        points: 15,
        label: "FHE.allow() correctly scoped (bidder-specific)",
        level: "Pass",
      },
      {
        points: 15,
        label:
          "Working @zama-fhe/relayer-sdk bid submission script with SepoliaConfig",
        level: "Excellent",
      },
      {
        points: 10,
        label: "userDecrypt() flow lets bidders privately verify their own bid",
        level: "Excellent",
      },
    ],
    tip: `When tracking the highest bid, use FHE.select to conditionally update: newHighest = FHE.select(FHE.gt(newBid, highestBid), newBid, highestBid). This never reveals whether the new bid was higher. Always FHE.allowThis() both handles after the update.`,
  },
  {
    week: "04",
    title: "🏆 Capstone: Confidential Mass-Payroll System",
    subtitle:
      "Production-grade multi-contract payroll dApp with encrypted salaries and full deployment",
    time: "8–12 hours",
    difficulty: "Advanced",
    color: "cyan",
    concepts: [
      "Multi-contract FHE",
      "Selective encryption",
      "Sepolia deployment",
      "FHE.allow() / FHE.allowTransient()",
    ],
    scenario: `A global remote company employs 50 people across 12 countries. By law, salaries must be kept confidential. The company wants to fund payroll transparently (total budget is public) while keeping individual salaries fully private. Employees should be able to withdraw their salary without revealing how much others earn.`,
    deliverables: [
      "PayrollVault.sol — holds encrypted funds and manages withdrawals",
      "SalaryRegistry.sol — maps employee addresses to encrypted salary amounts",
      "EmployeeAuth.sol — manages FHE ACL delegation",
      "Payroll.test.js — comprehensive test suite (10+ test cases)",
      "deploy.js — Hardhat deploy script for Sepolia",
    ],
    spec: [
      {
        title: "PayrollVault Contract",
        items: [
          "fundPayroll() — owner deposits ETH/ERC20 to fund the contract (public amount ok)",
          "setSalary(address employee, externalEuint64 encSalary, bytes proof) — set encrypted salary",
          "Use FHE.fromExternal(encSalary, proof) to validate and store the encrypted salary",
          "withdraw() — employee calls to receive their salary; internally checks against SalaryRegistry",
          "Contract solvency check: total allocated must not exceed total deposited",
        ],
      },
      {
        title: "SalaryRegistry Contract",
        items: [
          "mapping(address => euint64) private salaries",
          "setSalary() only callable by PayrollVault; use FHE.allow() to grant access",
          "getEncryptedSalary(address employee) returns euint64 handle (ACL gated via FHE.isSenderAllowed)",
          "Employees cannot read each other's encrypted handles",
        ],
      },
      {
        title: "Security Requirements",
        items: [
          "Employee A connecting their wallet cannot decrypt Employee B's salary",
          "Owner cannot read individual salaries (admin cannot decrypt without consent)",
          "Replay protection: salary can only be withdrawn once per pay period",
          "Gas: only salary amounts are euint — all other fields (address, date) are plaintext",
        ],
      },
    ],
    grading: [
      {
        points: 10,
        label: "Employer deposits and funds the contract",
        level: "Functionality",
      },
      {
        points: 15,
        label: "setSalary() stores encrypted salary per employee",
        level: "Functionality",
      },
      {
        points: 15,
        label: "withdraw() correctly transfers salary to employee",
        level: "Functionality",
      },
      {
        points: 20,
        label: "Employee A cannot read/decrypt Employee B's salary",
        level: "Security",
      },
      {
        points: 10,
        label:
          "FHE.allow() / FHE.allowThis() correctly scoped — no over-permissioning",
        level: "Security",
      },
      {
        points: 10,
        label: "Selective encryption — only amounts are euint",
        level: "Optimization",
      },
      {
        points: 10,
        label: "Comprehensive test suite (>10 test cases)",
        level: "Tests",
      },
      {
        points: 10,
        label: "Deployed to Sepolia with verified contract",
        level: "Deployment",
      },
    ],
    tip: "Design the ACL flows on paper first. Draw every FHE.allow() and FHE.allowThis() call as an arrow from the granting entity to the receiving entity. Every encrypted value needs at minimum two arrows: FHE.allowThis() for the contract and FHE.allow(handle, user) for the authorized user. FHE.allowTransient() is useful for temporary intra-transaction handles to save gas.",
  },
  {
    week: "Master",
    title: "Institutional-Grade FHE & Auditing",
    subtitle:
      "Implement ERC7984 standards with RWA compliance and conduct a professional security audit",
    time: "10–14 hours",
    difficulty: "Expert",
    color: "purple",
    concepts: [
      "ERC7984",
      "RWA Compliance",
      "Handle Leaks",
      "Audit Anti-Patterns",
    ],
    scenario: `A tier-1 investment bank is tokenizing real estate assets. They require full privacy for holders, but the bank must have the ability to "Force Transfer" assets in case of a court order. Additionally, you must audit a provided "Dark Pool" contract that contains a subtle cryptographic data leak.`,
    deliverables: [
      "StandardToken.sol — ERC7984 compliant token with compliance overrides",
      "AuditReport.pdf — finding and fixing a 'View Function' state leak",
      "Executor.sol — meta-transaction executor following the ERC7821 pattern",
    ],
    spec: [
      {
        title: "ERC7984 Token Requirements",
        items: [
          "Follow the ERC7984 interface for re-encryption and allowance queries",
          "Implement forceTransfer() only callable by the complianceAdmin role",
          "Implement freezeAccount() which prevents certain handles from being spent",
          "All compliance logic must be gated behind FHE.select to prevent leak of 'who' is being frozen",
        ],
      },
      {
        title: "The Audit Challenge (Finding the leak)",
        items: [
          "Analyze the provided 'BrokenPool.sol' contract",
          "Identify where the contract leaks 'Reserve Ratios' through a public view function",
          "Rewrite the function to use re-encryption + FHE.isSenderAllowed properly",
        ],
      },
    ],
    grading: [
      {
        points: 25,
        label: "ERC7984 Compliance and Force Transfer logic",
        level: "Functionality",
      },
      {
        points: 25,
        label: "Secure implementation of Compliance Overrides (no data leaks)",
        level: "Security",
      },
      {
        points: 30,
        label: "Identification and fix of the cryptographic state leak",
        level: "Audit",
      },
      {
        points: 20,
        label: "Standardized EIP-712 re-encryption flow implemented",
        level: "Excellent",
      },
    ],
    tip: "When building compliance overrides, use a 'Master Handle' that the admin can compute on. To avoid leaking *who* is being checked, always use FHE.select to apply the 'Frozen' flag to the transaction amount before the update. Silence is security.",
  },
];

export default function HomeworkPage() {
  const ref = useFadeIn();

  return (
    <div className="page homework-page" ref={ref}>
      <section className="hw-page-header">
        <div className="container">
          <span className="tag tag-cyan fade-in">Homework Assignments</span>
          <h1 className="section-title fade-in" style={{ marginTop: 16 }}>
            Graded, Test-Driven
            <br />
            <span className="glow-text">Homework Specs</span>
          </h1>
          <p className="section-sub fade-in">
            Every assignment requires a functional, tested smart contract.
            Grading is deterministic: if your Hardhat tests pass without state
            leaks, you pass. Scalable for massive cohorts and fully compatible
            with self-paced learning.
          </p>
          <div className="hw-design-principles fade-in">
            <h3>Homework Design Philosophy</h3>
            <div className="principles-grid">
              <div className="principle-card glass-card">
                <span>🧪</span>
                <h4>Test-Driven</h4>
                <p>
                  Every rubric criterion maps to a deterministic Hardhat test.
                  No subjective interpretation.
                </p>
              </div>
              <div className="principle-card glass-card">
                <span>📈</span>
                <h4>Scaffolded Difficulty</h4>
                <p>
                  Week 1 builds the mental model. Week 4 tests production-grade
                  architectural decisions.
                </p>
              </div>
              <div className="principle-card glass-card">
                <span>🌍</span>
                <h4>Real-World Scenarios</h4>
                <p>
                  Every assignment solves a genuine industry problem — payroll,
                  auctions, DeFi.
                </p>
              </div>
              <div className="principle-card glass-card">
                <span>🔓</span>
                <h4>Pass / Excellent</h4>
                <p>
                  Two-tier grading supports varied cohort speeds. Everyone
                  passes; overachievers excel.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container">
        {ASSIGNMENTS.map((a, idx) => (
          <div
            key={a.week}
            className={`hw-assignment fade-in`}
            id={`hw-week${a.week}`}
          >
            <div className="assignment-header">
              <div className="assignment-badge">
                <span
                  className={`tag tag-${a.color === "cyan" ? "cyan" : a.color === "purple" ? "purple" : "orange"}`}
                >
                  Week {a.week}
                </span>
                <span className="difficulty-badge">
                  {a.difficulty === "Beginner"
                    ? "🟢"
                    : a.difficulty === "Intermediate"
                      ? "🟡"
                      : a.difficulty === "Intermediate–Advanced"
                        ? "🟠"
                        : "🔴"}{" "}
                  {a.difficulty}
                </span>
                <span className="time-badge">⏱ {a.time}</span>
              </div>
              <h2 className="assignment-title">{a.title}</h2>
              <p className="assignment-subtitle">{a.subtitle}</p>
              <div className="concept-tags">
                {a.concepts.map((c) => (
                  <span key={c} className="concept-tag">
                    {c}
                  </span>
                ))}
              </div>
            </div>

            {/* Scenario */}
            <div className="assignment-section">
              <h3>📋 Scenario</h3>
              <p className="scenario-text">{a.scenario}</p>
            </div>

            {/* Deliverables */}
            <div className="assignment-section">
              <h3>📦 Deliverables</h3>
              <ul className="deliverables-list">
                {a.deliverables.map((d) => (
                  <li key={d}>
                    <span
                      className="del-dot"
                      style={{
                        color:
                          a.color === "cyan"
                            ? "var(--cyan)"
                            : a.color === "purple"
                              ? "var(--purple)"
                              : "var(--orange)",
                      }}
                    >
                      ▶
                    </span>{" "}
                    {d}
                  </li>
                ))}
              </ul>
            </div>

            {/* Specs */}
            {a.spec.map((s, i) => (
              <div key={i} className="assignment-section">
                <h3>⚙️ {s.title}</h3>
                <ul className="spec-list">
                  {s.items.map((item) => (
                    <li key={item}>
                      <span style={{ color: "var(--cyan)", marginRight: 8 }}>
                        ✓
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Grading */}
            <div className="assignment-section">
              <h3>📊 Grading Rubric</h3>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Criterion</th>
                      <th>Points</th>
                      <th>Category</th>
                    </tr>
                  </thead>
                  <tbody>
                    {a.grading.map((g, i) => (
                      <tr key={i}>
                        <td>{g.label}</td>
                        <td>
                          <strong style={{ color: "var(--cyan)" }}>
                            {g.points}
                          </strong>
                        </td>
                        <td>
                          <span
                            className={`tag tag-${g.level === "Pass" || g.level === "Functionality" ? "cyan" : g.level === "Excellent" || g.level === "Security" ? "purple" : "orange"}`}
                            style={{ fontSize: 10 }}
                          >
                            {g.level}
                          </span>
                        </td>
                      </tr>
                    ))}
                    <tr>
                      <td>
                        <strong>Total</strong>
                      </td>
                      <td>
                        <strong style={{ color: "var(--cyan)" }}>
                          {a.grading.reduce((s, g) => s + g.points, 0)}
                        </strong>
                      </td>
                      <td></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pro Tip */}
            <div className="assignment-tip">
              <span className="tip-icon">💡</span>
              <div>
                <strong>Pro Tip</strong>
                <p>{a.tip}</p>
              </div>
            </div>

            {idx < ASSIGNMENTS.length - 1 && (
              <div className="divider" style={{ margin: "48px 0" }} />
            )}
          </div>
        ))}

        <div className="hw-footer-cta fade-in">
          <Link to="/curriculum" className="btn-outline">
            ← Back to Curriculum
          </Link>
          <Link to="/instructor" className="btn-primary">
            View Instructor Hub →
          </Link>
        </div>
      </div>
    </div>
  );
}
