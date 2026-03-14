import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import DecryptText from "../components/DecryptText";
import CodeBlock from "../components/CodeBlock";
import "./HomeworkPage.css";

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

const PRINCIPLES = [
  {
    symbol: "T",
    title: "Test-Driven",
    desc: "Every rubric criterion maps to a Hardhat test. No subjective grading.",
  },
  {
    symbol: "S",
    title: "Scaffolded Difficulty",
    desc: "Week 1 builds the model. Week 4 tests production decisions.",
  },
  {
    symbol: "R",
    title: "Real-World Scenarios",
    desc: "Every assignment solves a genuine industry problem.",
  },
  {
    symbol: "II",
    title: "Two-Tier Grading",
    desc: "Pass tier for fundamentals. Excellent tier for advanced engineers.",
  },
];

const STARTER_CODE_1 = `<span class="cm">// SPDX-License-Identifier: MIT</span>
<span class="kw">pragma solidity</span> ^0.8.24;

<span class="kw">import</span> <span class="str">"fhevm/lib/FHE.sol"</span>;
<span class="kw">import</span> <span class="str">"fhevm/config/ZamaEthereumConfig.sol"</span>;

<span class="kw">contract</span> <span class="ty">ConfToken</span> <span class="kw">is</span> <span class="ty">ZamaEthereumConfig</span> {
  <span class="ty">string</span> <span class="kw">public</span> name = <span class="str">"ConfToken"</span>;
  <span class="ty">uint256</span> <span class="kw">public</span> totalSupply;
  <span class="ty">address</span> <span class="kw">public</span> owner;

  <span class="cm">// TODO: Replace with encrypted mapping</span>
  <span class="cm">// mapping(address => euint64) private _balances;</span>
  <span class="cm">// mapping(address => mapping(address => euint64)) private _allowances;</span>

  <span class="kw">constructor</span>() {
    owner = msg.sender;
  }

  <span class="cm">// TODO: Implement mint(address to, uint64 amount)</span>
  <span class="cm">// - Only owner can call</span>
  <span class="cm">// - Use FHE.asEuint64() to create encrypted balance</span>
  <span class="cm">// - Call FHE.allowThis() and FHE.allow()</span>
  <span class="cm">// - Update totalSupply (plaintext)</span>

  <span class="cm">// TODO: Implement transfer(address to, externalEuint64 encAmount, bytes calldata proof)</span>
  <span class="cm">// - Use FHE.fromExternal() to validate input</span>
  <span class="cm">// - NO REVERT on insufficient balance</span>
  <span class="cm">// - Use FHE.select() pattern</span>
  <span class="cm">// - Re-grant ACL after every mutation</span>

  <span class="cm">// TODO: Implement transferFrom with encrypted allowances</span>
}`;

const STARTER_CODE_2 = `<span class="cm">// SPDX-License-Identifier: MIT</span>
<span class="kw">pragma solidity</span> ^0.8.24;

<span class="kw">import</span> <span class="str">"fhevm/lib/FHE.sol"</span>;
<span class="kw">import</span> <span class="str">"fhevm/config/ZamaEthereumConfig.sol"</span>;

<span class="kw">contract</span> <span class="ty">DarkPoolAMM</span> <span class="kw">is</span> <span class="ty">ZamaEthereumConfig</span> {
  <span class="ty">euint64</span> <span class="kw">private</span> reserveA;
  <span class="ty">euint64</span> <span class="kw">private</span> reserveB;
  <span class="ty">address</span> <span class="kw">public</span> owner;

  <span class="kw">constructor</span>() { owner = msg.sender; }

  <span class="cm">// TODO: initialize(uint64 amountA, uint64 amountB)</span>
  <span class="cm">// - Set initial reserves using FHE.asEuint64()</span>

  <span class="cm">// TODO: swap(externalEuint64 encAmount, bytes proof, bool aToB)</span>
  <span class="cm">// - Validate input with FHE.fromExternal()</span>
  <span class="cm">// - Compute: dy = reserveB * dx / (reserveA + dx)</span>
  <span class="cm">// - Use FHE.select for invalid swap protection</span>
  <span class="cm">// - Update both reserves</span>
  <span class="cm">// - Re-grant ACL permissions</span>
}`;

const STARTER_CODE_3 = `<span class="cm">// SPDX-License-Identifier: MIT</span>
<span class="kw">pragma solidity</span> ^0.8.24;

<span class="kw">import</span> <span class="str">"fhevm/lib/FHE.sol"</span>;
<span class="kw">import</span> <span class="str">"fhevm/config/ZamaEthereumConfig.sol"</span>;

<span class="kw">contract</span> <span class="ty">BlindAuction</span> <span class="kw">is</span> <span class="ty">ZamaEthereumConfig</span> {
  <span class="ty">address</span> <span class="kw">public</span> owner;
  <span class="ty">uint256</span> <span class="kw">public</span> endTime;
  <span class="ty">euint64</span> <span class="kw">private</span> highestBid;
  <span class="ty">eaddress</span> <span class="kw">private</span> highestBidder;
  <span class="ty">mapping</span>(<span class="ty">address</span> => <span class="ty">euint64</span>) <span class="kw">private</span> bids;

  <span class="kw">constructor</span>(<span class="ty">uint256</span> _duration) {
    owner = msg.sender;
    endTime = block.timestamp + _duration;
  }

  <span class="cm">// TODO: bid(externalEuint64 encBid, bytes proof)</span>
  <span class="cm">// - Validate with FHE.fromExternal()</span>
  <span class="cm">// - Compare with highest using FHE.gt()</span>
  <span class="cm">// - Update highest bid/bidder with FHE.select()</span>
  <span class="cm">// - Grant ACL permissions</span>

  <span class="cm">// TODO: revealWinner() — onlyOwner, after endTime</span>
  <span class="cm">// - Call FHE.makePubliclyDecryptable() on winning bid and bidder</span>
}`;

const STARTER_CODE_4 = `<span class="cm">// SPDX-License-Identifier: MIT</span>
<span class="kw">pragma solidity</span> ^0.8.24;

<span class="kw">import</span> <span class="str">"fhevm/lib/FHE.sol"</span>;
<span class="kw">import</span> <span class="str">"fhevm/config/ZamaEthereumConfig.sol"</span>;
<span class="kw">import</span> <span class="str">"./SalaryRegistry.sol"</span>;

<span class="kw">contract</span> <span class="ty">PayrollVault</span> <span class="kw">is</span> <span class="ty">ZamaEthereumConfig</span> {
  <span class="ty">SalaryRegistry</span> <span class="kw">public</span> registry;
  <span class="ty">address</span> <span class="kw">public</span> employer;
  <span class="ty">uint256</span> <span class="kw">public</span> totalBudget;  <span class="cm">// plaintext — public</span>

  <span class="kw">constructor</span>(<span class="ty">address</span> _registry) {
    employer = msg.sender;
    registry = <span class="ty">SalaryRegistry</span>(_registry);
  }

  <span class="cm">// TODO: fundPayroll() payable — employer deposits funds</span>

  <span class="cm">// TODO: setSalary(address employee, externalEuint64 enc, bytes proof)</span>
  <span class="cm">// - Validate encrypted salary</span>
  <span class="cm">// - Grant ACL to registry before cross-contract call</span>
  <span class="cm">// - Store via registry.storeSalary()</span>

  <span class="cm">// TODO: withdraw() — employee claims their salary</span>
  <span class="cm">// - Read encrypted salary from registry</span>
  <span class="cm">// - Verify employee is authorized</span>
  <span class="cm">// - Transfer funds</span>
}`;

const STARTER_CODE_5 = `<span class="cm">// SPDX-License-Identifier: MIT</span>
<span class="kw">pragma solidity</span> ^0.8.24;

<span class="kw">import</span> <span class="str">"fhevm/lib/FHE.sol"</span>;
<span class="kw">import</span> <span class="str">"fhevm/config/ZamaEthereumConfig.sol"</span>;

<span class="kw">interface</span> <span class="ty">IERC7984</span> {
  <span class="kw">event</span> <span class="fn">AuthorizedDecryption</span>(<span class="ty">address</span> indexed, <span class="ty">uint256</span> handle);
  <span class="kw">function</span> <span class="fn">authorizeDecryption</span>(<span class="ty">address</span> to) <span class="kw">external</span>;
}

<span class="kw">contract</span> <span class="ty">StandardToken</span> <span class="kw">is</span> <span class="ty">ZamaEthereumConfig</span>, <span class="ty">IERC7984</span> {
  <span class="ty">address</span> <span class="kw">public</span> complianceAdmin;
  <span class="ty">mapping</span>(<span class="ty">address</span> => <span class="ty">euint64</span>) <span class="kw">private</span> _balances;
  <span class="ty">mapping</span>(<span class="ty">address</span> => <span class="ty">ebool</span>) <span class="kw">private</span> _frozen;

  <span class="cm">// TODO: forceTransfer(address from, address to, euint64 amount)</span>
  <span class="cm">// - Only complianceAdmin</span>
  <span class="cm">// - Use FHE.select with frozen flag to prevent leaking WHO</span>

  <span class="cm">// TODO: freezeAccount(address account)</span>
  <span class="cm">// - Must not reveal which account was frozen</span>

  <span class="cm">// TODO: Implement IERC7984 interface</span>
}`;

const ASSIGNMENTS = [
  {
    week: "01",
    title: "Confidential ERC20 Token",
    difficulty: "Beginner",
    time: "3-5 hours",
    concepts: ["euint64", "FHE.select", "FHE.allow()", "FHE.allowThis()", "No-Revert Transfers"],
    scenario:
      "A fintech startup needs a token where individual holdings are private but total supply is public. Your task is to build the foundation of their confidential token standard.",
    deliverables: [
      "ConfToken.sol",
      "ConfToken.test.js",
      "README.md",
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
          "Inherit ZamaEthereumConfig for proper coprocessor configuration",
          "totalSupply() remains public plaintext (regulatory requirement)",
        ],
      },
      {
        title: "Test Requirements",
        items: [
          "Test: Alice mints tokens, her encrypted balance is set correctly",
          "Test: Alice transfers to Bob -- Alice balance decreases, Bob increases",
          "Test: Alice attempts to overspend -- no revert, no state change",
          "Test: Carol cannot read Alice balance (no FHE ACL permission)",
          "Test: transferFrom with encrypted allowance works end-to-end",
          "Test: ZamaEthereumConfig correctly initializes the FHE coprocessor",
          "Test: totalSupply() returns correct plaintext value",
        ],
      },
    ],
    starterCode: STARTER_CODE_1,
    starterFilename: "ConfToken.sol -- Starter",
    grading: [
      { points: 15, label: "Compiles without errors", level: "Pass" },
      { points: 15, label: "Encrypted mappings declared correctly", level: "Pass" },
      { points: 20, label: "transfer() uses FHE.select, never reverts", level: "Pass" },
      { points: 20, label: "All Hardhat tests pass", level: "Pass" },
      { points: 15, label: "transferFrom() with encrypted allowances", level: "Excellent" },
      { points: 15, label: "FHE.allow() correctly scoped post-update", level: "Excellent" },
    ],
    tip: "When you update an encrypted balance with FHE.add() or FHE.sub(), the old ciphertext handle is invalidated. Always call FHE.allow() and FHE.allowThis() after any mutation.",
  },
  {
    week: "02",
    title: "Dark Pool AMM",
    difficulty: "Intermediate",
    time: "4-6 hours",
    concepts: ["FHE.mul", "FHE.div", "FHE.and/or", "FHE.select", "externalEuint64"],
    scenario:
      "A DeFi protocol wants to eliminate MEV extraction. Trade amounts are encrypted so bots see nothing until the transaction is finalized.",
    deliverables: [
      "DarkPoolAMM.sol",
      "DarkPool.test.js",
      "GasReport.md",
    ],
    spec: [
      {
        title: "Core Contract Requirements",
        items: [
          "Pool struct with euint64 reserveA and euint64 reserveB",
          "initialize() sets initial reserves with encrypted values",
          "swap(externalEuint64 encAmount, bytes proof, bool aToB) is the main entry point",
          "Use FHE.fromExternal(encAmount, proof) to validate and unwrap the input",
          "Implements constant-product formula: dy = y * dx / (x + dx)",
          "All arithmetic (FHE.mul, FHE.div, FHE.add, FHE.sub) must operate on euint64",
          "Invalid swaps (zero output, insufficient reserve) silently no-op via FHE.select",
          "FHE.allowThis() called after every reserve update",
        ],
      },
      {
        title: "Anti-MEV Properties",
        items: [
          "A third-party observer cannot determine the swap amount from on-chain data",
          "A failed swap (insufficient pool liquidity) does not reveal the attempted amount",
          "The constant-product invariant k = x * y is maintained after each valid swap",
        ],
      },
    ],
    starterCode: STARTER_CODE_2,
    starterFilename: "DarkPoolAMM.sol -- Starter",
    grading: [
      { points: 10, label: "Pool initialized with encrypted reserves", level: "Pass" },
      { points: 20, label: "swap() accepts encrypted amount with proof", level: "Pass" },
      { points: 20, label: "Constant-product formula on encrypted values", level: "Pass" },
      { points: 20, label: "Invalid swaps silently no-op", level: "Pass" },
      { points: 15, label: "Encrypted slippage tolerance implemented", level: "Excellent" },
      { points: 15, label: "Comprehensive edge case tests", level: "Excellent" },
    ],
    tip: "FHE.mul is the most expensive operation. Compute numerator first, then divide once.",
  },
  {
    week: "03",
    title: "Confidential Blind Auction",
    difficulty: "Intermediate-Advanced",
    time: "5-7 hours",
    concepts: [
      "FHE.makePubliclyDecryptable()",
      "@zama-fhe/relayer-sdk",
      "SepoliaConfig",
      "userDecrypt()",
    ],
    scenario:
      "An NFT marketplace with truly blind auctions. Bidders cannot see each other's bids, preventing bid gaming and sniping.",
    deliverables: [
      "BlindAuction.sol",
      "BlindAuction.test.js",
      "bid-script.js",
      "README.md",
    ],
    spec: [
      {
        title: "Solidity Contract Requirements",
        items: [
          "bid(externalEuint64 encBid, bytes proof) stores encrypted bid for msg.sender",
          "Use FHE.fromExternal(encBid, proof) to validate and convert the input",
          "Highest bid tracked as euint64 highestBid using FHE.select",
          "highestBidder tracked as eaddress (encrypted)",
          "revealWinner() callable only by owner after auction ends",
          "revealWinner() calls FHE.makePubliclyDecryptable() on highestBid and highestBidder",
          "Winner revealed off-chain via Relayer public decryption endpoint",
          "FHE.allow() properly scoped so only bidder can view their own bid handle",
        ],
      },
      {
        title: "Relayer SDK Script Requirements",
        items: [
          "Import { createInstance, SepoliaConfig } from @zama-fhe/relayer-sdk",
          "Initialize instance with createInstance(SepoliaConfig)",
          "Accepts bid amount as CLI argument: node bid-script.js 500",
          "Creates encrypted input buffer: instance.createEncryptedInput(contractAddr, userAddr)",
          "Calls buffer.add64(BigInt(amount)) then await buffer.encrypt()",
          "Submits ciphertexts.handles[0] and ciphertexts.inputProof to contract.bid()",
          "Logs the encrypted handle to console for verification",
        ],
      },
    ],
    starterCode: STARTER_CODE_3,
    starterFilename: "BlindAuction.sol -- Starter",
    grading: [
      { points: 20, label: "bid() stores/tracks encrypted bids correctly", level: "Pass" },
      { points: 20, label: "revealWinner() triggers decryption correctly", level: "Pass" },
      { points: 20, label: "fulfillDecryption callback emits correct event", level: "Pass" },
      { points: 15, label: "ACL scoping (bidder-specific)", level: "Pass" },
      { points: 15, label: "Working SDK script with SepoliaConfig", level: "Excellent" },
      { points: 10, label: "userDecrypt() flow for private bid verification", level: "Excellent" },
    ],
    tip: "Use FHE.select to conditionally update the highest bid. This never reveals whether the new bid was higher.",
  },
  {
    week: "04",
    title: "Confidential Mass-Payroll System",
    difficulty: "Advanced",
    time: "8-12 hours",
    concepts: [
      "Multi-contract FHE",
      "Selective encryption",
      "Sepolia deployment",
      "FHE.allow/allowTransient",
    ],
    scenario:
      "A global company with 50 employees across 12 countries. Salaries confidential, total budget public. Employees withdraw without revealing what others earn.",
    deliverables: [
      "PayrollVault.sol",
      "SalaryRegistry.sol",
      "EmployeeAuth.sol",
      "Payroll.test.js",
      "deploy.js",
    ],
    spec: [
      {
        title: "PayrollVault Contract",
        items: [
          "fundPayroll() -- owner deposits ETH/ERC20 to fund the contract (public amount ok)",
          "setSalary(address employee, externalEuint64 encSalary, bytes proof) -- set encrypted salary",
          "Use FHE.fromExternal(encSalary, proof) to validate and store the encrypted salary",
          "withdraw() -- employee calls to receive their salary; checks against SalaryRegistry",
          "Contract solvency check: total allocated must not exceed total deposited",
        ],
      },
      {
        title: "SalaryRegistry Contract",
        items: [
          "mapping(address => euint64) private salaries",
          "setSalary() only callable by PayrollVault; use FHE.allow() to grant access",
          "getEncryptedSalary(address employee) returns euint64 handle (ACL gated)",
          "Employees cannot read each other's encrypted handles",
        ],
      },
      {
        title: "Security Requirements",
        items: [
          "Employee A connecting their wallet cannot decrypt Employee B's salary",
          "Owner cannot read individual salaries (admin cannot decrypt without consent)",
          "Replay protection: salary can only be withdrawn once per pay period",
          "Gas: only salary amounts are euint -- all other fields are plaintext",
        ],
      },
    ],
    starterCode: STARTER_CODE_4,
    starterFilename: "PayrollVault.sol -- Starter",
    grading: [
      { points: 10, label: "Employer deposits and funds the contract", level: "Functionality" },
      { points: 15, label: "setSalary() stores encrypted salary per employee", level: "Functionality" },
      { points: 15, label: "withdraw() correctly transfers salary to employee", level: "Functionality" },
      { points: 20, label: "Employee A cannot read/decrypt Employee B's salary", level: "Security" },
      { points: 10, label: "FHE.allow() / FHE.allowThis() correctly scoped", level: "Security" },
      { points: 10, label: "Selective encryption -- only amounts are euint", level: "Optimization" },
      { points: 10, label: "Comprehensive test suite (>10 test cases)", level: "Tests" },
      { points: 10, label: "Deployed to Sepolia with verified contract", level: "Deployment" },
    ],
    tip: "Design ACL flows on paper first. Draw every FHE.allow() as an arrow. Every encrypted value needs minimum two arrows.",
  },
  {
    week: "Master",
    title: "Institutional-Grade FHE & Auditing",
    difficulty: "Expert",
    time: "10-14 hours",
    concepts: ["ERC7984", "RWA Compliance", "Handle Leaks", "Audit Anti-Patterns"],
    scenario:
      "A tier-1 bank tokenizing real estate. Privacy for holders, with force transfer for court orders. Plus audit a buggy dark pool contract.",
    deliverables: [
      "StandardToken.sol",
      "AuditReport.pdf",
      "Executor.sol",
    ],
    spec: [
      {
        title: "ERC7984 Token Requirements",
        items: [
          "Follow the ERC7984 interface for re-encryption and allowance queries",
          "Implement forceTransfer() only callable by the complianceAdmin role",
          "Implement freezeAccount() which prevents certain handles from being spent",
          "All compliance logic must be gated behind FHE.select to prevent leak of who is being frozen",
        ],
      },
      {
        title: "Audit Challenge",
        items: [
          "Analyze the provided BrokenPool.sol contract",
          "Identify where the contract leaks Reserve Ratios through a public view function",
          "Rewrite the function to use re-encryption + FHE.isSenderAllowed properly",
        ],
      },
    ],
    starterCode: STARTER_CODE_5,
    starterFilename: "StandardToken.sol -- Starter",
    grading: [
      { points: 25, label: "ERC7984 compliance and Force Transfer logic", level: "Functionality" },
      { points: 25, label: "Secure compliance overrides (no data leaks)", level: "Security" },
      { points: 30, label: "Cryptographic leak identification and fix", level: "Audit" },
      { points: 20, label: "EIP-712 re-encryption flow implemented", level: "Excellent" },
    ],
    tip: 'Use a "Master Handle" for admin operations. To avoid leaking who\'s being checked, always apply the frozen flag via FHE.select before the update.',
  },
];

function getDifficultyClass(difficulty) {
  if (difficulty === "Beginner") return "diff-beginner";
  if (difficulty === "Intermediate") return "diff-intermediate";
  if (difficulty === "Advanced") return "diff-advanced";
  if (difficulty === "Expert") return "diff-expert";
  return "diff-intermediate";
}

function getLevelClass(level) {
  switch (level) {
    case "Pass":
    case "Functionality":
      return "level-pass";
    case "Excellent":
      return "level-excellent";
    case "Security":
      return "level-security";
    case "Audit":
      return "level-audit";
    case "Optimization":
      return "level-optimization";
    case "Tests":
      return "level-tests";
    case "Deployment":
      return "level-deployment";
    default:
      return "level-pass";
  }
}

export default function HomeworkPage() {
  const [expanded, setExpanded] = useState(null);
  const ref = useFadeIn(expanded);

  const toggle = (week) => {
    setExpanded((prev) => (prev === week ? null : week));
  };

  return (
    <div className="page homework-page" ref={ref}>
      {/* Header */}
      <section className="hw-header-section">
        <div className="container">
          <span className="tag tag-accent fade-in">Homework Assignments</span>
          <DecryptText
            text="Test-Driven Specifications"
            as="h1"
            delay={200}
            duration={1200}
            className="section-title fade-in"
            style={{ marginTop: 16 }}
          />
          <p className="section-sub fade-in" style={{ marginTop: 12 }}>
            Every assignment is graded deterministically by Hardhat tests. If
            your tests pass and your contract compiles without state leaks, you
            pass. No subjective grading. No ambiguity. Ship code that works.
          </p>
        </div>
      </section>

      {/* Design Philosophy */}
      <section className="hw-philosophy">
        <div className="container">
          <div className="grid-4 fade-in">
            {PRINCIPLES.map((p) => (
              <div key={p.title} className="philosophy-card card">
                <span className="philosophy-symbol">{p.symbol}</span>
                <h4>{p.title}</h4>
                <p>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Assignment Cards */}
      <section className="hw-assignments">
        <div className="container">
          {ASSIGNMENTS.map((a) => {
            const isOpen = expanded === a.week;
            return (
              <div
                key={a.week}
                className={`assignment-card card fade-in${isOpen ? " assignment-card--open" : ""}`}
                id={`hw-week-${a.week}`}
              >
                <button
                  className="assignment-card-toggle"
                  onClick={() => toggle(a.week)}
                  aria-expanded={isOpen}
                >
                  <div className="assignment-card-left">
                    <span className="assignment-week tag tag-accent">
                      Week {a.week}
                    </span>
                    <h2 className="assignment-card-title">{a.title}</h2>
                  </div>
                  <div className="assignment-card-right">
                    <span className={`diff-badge ${getDifficultyClass(a.difficulty)}`}>
                      {a.difficulty}
                    </span>
                    <span className="time-badge">{a.time}</span>
                    <span className="toggle-icon">{isOpen ? "−" : "+"}</span>
                  </div>
                </button>

                <div className="assignment-card-concepts">
                  {a.concepts.map((c) => (
                    <span key={c} className="concept-tag">
                      {c}
                    </span>
                  ))}
                </div>

                {isOpen && (
                  <div className="assignment-card-body">
                    {/* Scenario */}
                    <div className="hw-section">
                      <h3 className="hw-section-title">Scenario</h3>
                      <p className="hw-scenario">{a.scenario}</p>
                    </div>

                    {/* Deliverables */}
                    <div className="hw-section">
                      <h3 className="hw-section-title">Deliverables</h3>
                      <ul className="hw-deliverables">
                        {a.deliverables.map((d) => (
                          <li key={d}>
                            <span className="hw-arrow">&gt;</span>
                            <code>{d}</code>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Specification Sections */}
                    {a.spec.map((s, i) => (
                      <div key={i} className="hw-section">
                        <h3 className="hw-section-title">{s.title}</h3>
                        <ul className="hw-spec-list">
                          {s.items.map((item, j) => (
                            <li key={j}>
                              <span className="hw-check">&#x2713;</span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}

                    {/* Starter Code */}
                    <div className="hw-section hw-starter-code">
                      <h3 className="hw-section-title">Starter Code</h3>
                      <CodeBlock
                        code={a.starterCode}
                        language="solidity"
                        filename={a.starterFilename}
                      />
                    </div>

                    {/* Grading Rubric */}
                    <div className="hw-section">
                      <h3 className="hw-section-title">Grading Rubric</h3>
                      <div className="hw-table-wrap">
                        <table className="hw-rubric-table">
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
                                  <strong className="hw-points">{g.points}</strong>
                                </td>
                                <td>
                                  <span className={`hw-level ${getLevelClass(g.level)}`}>
                                    {g.level}
                                  </span>
                                </td>
                              </tr>
                            ))}
                            <tr className="hw-total-row">
                              <td>
                                <strong>Total</strong>
                              </td>
                              <td>
                                <strong className="hw-points">
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
                    <div className="hw-pro-tip">
                      <div>
                        <strong>Pro Tip</strong>
                        <p>{a.tip}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer CTA */}
      <div className="container">
        <div className="hw-footer-cta fade-in">
          <Link to="/curriculum" className="btn-outline">
            Back to Curriculum
          </Link>
          <Link to="/sandbox" className="btn-primary">
            Practice in Sandbox
          </Link>
        </div>
      </div>
    </div>
  );
}
