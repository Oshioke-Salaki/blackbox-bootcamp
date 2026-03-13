import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import DecryptText from "../components/DecryptText";
import "./SandboxPage.css";

/* ── Solidity syntax highlighter ───────────────────── */
const SOL_KEYWORDS =
  /\b(pragma|solidity|import|contract|is|function|returns?|mapping|struct|enum|event|modifier|constructor|require|emit|if|else|for|while|do|break|continue|new|delete|public|private|internal|external|view|pure|payable|memory|storage|calldata|virtual|override|abstract|interface|library|using|assembly|try|catch|revert|assert)\b/g;
const SOL_TYPES =
  /\b(address|bool|string|bytes\d{0,2}|u?int\d{0,3}|e?uint\d{0,3}|ebool|eaddress|euint\d{1,3}|einput|TFHE|FHE)\b/g;
const SOL_NUMBERS = /\b(0x[\da-fA-F]+|\d+(\.\d+)?)\b/g;

function highlightSolidity(code) {
  let html = code
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  const tokens = [];
  const ph = (cls, match) => {
    const idx = tokens.length;
    tokens.push(`<span class="sh-${cls}">${match}</span>`);
    return `__TK${idx}TK__`;
  };

  html = html.replace(/(\/\/[^\n]*)/g, (m) => ph("cm", m));
  html = html.replace(/(\/\*[\s\S]*?\*\/)/g, (m) => ph("cm", m));
  html = html.replace(/("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/g, (m) => ph("str", m));
  html = html.replace(SOL_TYPES, (m) => ph("ty", m));
  html = html.replace(SOL_KEYWORDS, (m) => ph("kw", m));
  html = html.replace(SOL_NUMBERS, (m) => ph("num", m));
  html = html.replace(/\b([a-zA-Z_]\w*)\s*(?=\()/g, (full, name) => {
    if (full.includes("__TK")) return full;
    return ph("fn", name);
  });
  html = html.replace(/__TK(\d+)TK__/g, (_, idx) => tokens[idx]);

  return html;
}

/* ── Exercise data ─────────────────────────────────── */
const EXERCISES = [
  {
    id: 1,
    title: "Declare Encrypted Storage",
    difficulty: "Beginner",
    lesson: "1.2",
    filename: "SecureVault.sol",
    description:
      "Replace the standard uint256 balance mapping with an encrypted euint64 mapping. Add an encrypted boolean flag.",
    template: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "fhevm/lib/FHE.sol";
import "fhevm/config/ZamaEthereumConfig.sol";

contract SecureVault is ZamaEthereumConfig {
    // TODO: Declare an encrypted balance mapping
    mapping(address => ___BLANK___) private balances;

    // TODO: Declare an encrypted boolean flag
    ___BLANK___ private isLocked;
}`,
    checks: [
      { pattern: "euint64", label: "Used euint64 for balances" },
      { pattern: "ebool", label: "Used ebool for the flag" },
    ],
    hint: "Encrypted types mirror Solidity types: uint64 -> euint64, bool -> ebool",
    solution: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "fhevm/lib/FHE.sol";
import "fhevm/config/ZamaEthereumConfig.sol";

contract SecureVault is ZamaEthereumConfig {
    // TODO: Declare an encrypted balance mapping
    mapping(address => euint64) private balances;

    // TODO: Declare an encrypted boolean flag
    ebool private isLocked;
}`,
  },
  {
    id: 2,
    title: "Accept Encrypted Input",
    difficulty: "Beginner",
    lesson: "1.2",
    filename: "Deposit.sol",
    description:
      "Write a deposit function that accepts an encrypted amount from the user and adds it to their balance.",
    template: `function deposit(___BLANK___ encAmount, bytes calldata proof) external {
    // Step 1: Validate the encrypted input
    euint64 amount = FHE.___BLANK___(encAmount, proof);

    // Step 2: Add to balance
    balances[msg.sender] = FHE.___BLANK___(balances[msg.sender], amount);

    // Step 3: Re-grant permissions
    FHE.___BLANK___(balances[msg.sender]);
    FHE.___BLANK___(balances[msg.sender], msg.sender);
}`,
    checks: [
      { pattern: "externalEuint64", label: "Parameter type is externalEuint64" },
      { pattern: "fromExternal", label: "Used FHE.fromExternal() to validate" },
      { pattern: "FHE.add", label: "Used FHE.add() for addition" },
      { pattern: "allowThis", label: "Called FHE.allowThis()" },
      { pattern: "FHE.allow(", label: "Called FHE.allow() for user" },
    ],
    hint: "User inputs arrive as externalEuint64. Validate with FHE.fromExternal(). Don't forget ACL permissions after mutation.",
    solution: `function deposit(externalEuint64 encAmount, bytes calldata proof) external {
    // Step 1: Validate the encrypted input
    euint64 amount = FHE.fromExternal(encAmount, proof);

    // Step 2: Add to balance
    balances[msg.sender] = FHE.add(balances[msg.sender], amount);

    // Step 3: Re-grant permissions
    FHE.allowThis(balances[msg.sender]);
    FHE.allow(balances[msg.sender], msg.sender);
}`,
  },
  {
    id: 3,
    title: "The No-Revert Transfer",
    difficulty: "Intermediate",
    lesson: "1.3",
    filename: "Transfer.sol",
    description:
      "Implement a transfer that never reverts. Use FHE.select to silently no-op when the sender has insufficient balance.",
    template: `function transfer(address to, externalEuint64 encAmount, bytes calldata proof) external {
    euint64 amount = FHE.fromExternal(encAmount, proof);

    // Check if sender has enough (returns encrypted boolean)
    ebool canTransfer = FHE.___BLANK___(amount, balances[msg.sender]);

    // Deduct from sender — or leave unchanged
    balances[msg.sender] = FHE.___BLANK___(
        canTransfer,
        FHE.sub(balances[msg.sender], amount),
        ___BLANK___
    );

    // Credit receiver — or leave unchanged
    balances[to] = FHE.select(
        canTransfer,
        FHE.___BLANK___(balances[to], amount),
        balances[to]
    );

    FHE.allowThis(balances[msg.sender]);
    FHE.allowThis(balances[to]);
    FHE.allow(balances[msg.sender], msg.sender);
    FHE.allow(balances[to], to);
}`,
    checks: [
      { pattern: "FHE.le", label: "Used FHE.le() for balance check" },
      { pattern: "FHE.select", label: "Used FHE.select() for conditional" },
      {
        pattern: "balances[msg.sender]",
        label: "Passed unchanged balance as fallback",
      },
      { pattern: "FHE.add", label: "Used FHE.add() for crediting" },
    ],
    hint: "FHE.le(a, b) checks if a <= b. FHE.select(condition, ifTrue, ifFalse) -- the fallback should be the unchanged balance.",
    solution: `function transfer(address to, externalEuint64 encAmount, bytes calldata proof) external {
    euint64 amount = FHE.fromExternal(encAmount, proof);

    // Check if sender has enough (returns encrypted boolean)
    ebool canTransfer = FHE.le(amount, balances[msg.sender]);

    // Deduct from sender — or leave unchanged
    balances[msg.sender] = FHE.select(
        canTransfer,
        FHE.sub(balances[msg.sender], amount),
        balances[msg.sender]
    );

    // Credit receiver — or leave unchanged
    balances[to] = FHE.select(
        canTransfer,
        FHE.add(balances[to], amount),
        balances[to]
    );

    FHE.allowThis(balances[msg.sender]);
    FHE.allowThis(balances[to]);
    FHE.allow(balances[msg.sender], msg.sender);
    FHE.allow(balances[to], to);
}`,
  },
  {
    id: 4,
    title: "Boolean Masking",
    difficulty: "Intermediate",
    lesson: "2.2",
    filename: "BoolMask.sol",
    description:
      "Combine three encrypted conditions into a single mask using FHE boolean operators, then apply it with FHE.select.",
    template: `// Three conditions must all be true
ebool hasBalance = FHE.ge(balances[sender], amount);
ebool notFrozen = FHE.not(frozen[sender]);
ebool withinLimit = FHE.le(amount, dailyLimit);

// Combine into a single mask
ebool canExecute = FHE.___BLANK___(
    hasBalance,
    FHE.___BLANK___(notFrozen, withinLimit)
);

// Apply the mask
balances[sender] = FHE.___BLANK___(
    canExecute,
    FHE.sub(balances[sender], amount),
    balances[sender]
);`,
    checks: [
      { pattern: "FHE.and", label: "Used FHE.and() to combine conditions", count: 2 },
      { pattern: "FHE.select", label: "Applied mask with FHE.select()" },
    ],
    hint: "Chain FHE.and() calls to combine multiple ebool values. The inner FHE.and combines two, the outer combines the result with the third.",
    solution: `// Three conditions must all be true
ebool hasBalance = FHE.ge(balances[sender], amount);
ebool notFrozen = FHE.not(frozen[sender]);
ebool withinLimit = FHE.le(amount, dailyLimit);

// Combine into a single mask
ebool canExecute = FHE.and(
    hasBalance,
    FHE.and(notFrozen, withinLimit)
);

// Apply the mask
balances[sender] = FHE.select(
    canExecute,
    FHE.sub(balances[sender], amount),
    balances[sender]
);`,
  },
  {
    id: 5,
    title: "Constant-Product Swap",
    difficulty: "Intermediate",
    lesson: "2.3",
    filename: "DarkPool.sol",
    description:
      "Implement the core AMM swap formula using encrypted arithmetic: dy = reserveB * dx / (reserveA + dx)",
    template: `function swap(externalEuint64 encAmount, bytes calldata proof) external {
    euint64 dx = FHE.fromExternal(encAmount, proof);

    // Calculate output: dy = reserveB * dx / (reserveA + dx)
    euint64 numerator = FHE.___BLANK___(reserveB, dx);
    euint64 denominator = FHE.___BLANK___(reserveA, dx);
    euint64 dy = FHE.___BLANK___(numerator, denominator);

    // Validate swap produces output
    ebool validSwap = FHE.___BLANK___(dy, FHE.asEuint64(0));

    // Update reserves conditionally
    reserveA = FHE.select(validSwap, FHE.add(reserveA, dx), reserveA);
    reserveB = FHE.select(validSwap, FHE.sub(reserveB, dy), reserveB);
}`,
    checks: [
      { pattern: "FHE.mul", label: "Used FHE.mul() for numerator" },
      { pattern: "FHE.add", label: "Used FHE.add() for denominator" },
      { pattern: "FHE.div", label: "Used FHE.div() for final division" },
      { pattern: "FHE.gt", label: "Used FHE.gt() to validate output > 0" },
    ],
    hint: "Numerator needs multiplication, denominator needs addition. The final step is division. Validate with FHE.gt (greater than zero).",
    solution: `function swap(externalEuint64 encAmount, bytes calldata proof) external {
    euint64 dx = FHE.fromExternal(encAmount, proof);

    // Calculate output: dy = reserveB * dx / (reserveA + dx)
    euint64 numerator = FHE.mul(reserveB, dx);
    euint64 denominator = FHE.add(reserveA, dx);
    euint64 dy = FHE.div(numerator, denominator);

    // Validate swap produces output
    ebool validSwap = FHE.gt(dy, FHE.asEuint64(0));

    // Update reserves conditionally
    reserveA = FHE.select(validSwap, FHE.add(reserveA, dx), reserveA);
    reserveB = FHE.select(validSwap, FHE.sub(reserveB, dy), reserveB);
}`,
  },
  {
    id: 6,
    title: "Sealed Bid",
    difficulty: "Advanced",
    lesson: "3.3",
    filename: "BlindAuction.sol",
    description:
      "Track the highest bid in a blind auction. Compare each new bid with the current highest and update using FHE.select -- without revealing which bid is higher.",
    template: `function bid(externalEuint64 encBid, bytes calldata proof) external {
    euint64 newBid = FHE.fromExternal(encBid, proof);

    // Is this bid higher than current highest?
    ebool isHigher = FHE.___BLANK___(newBid, highestBid);

    // Update highest bid — silently, indistinguishably
    highestBid = FHE.___BLANK___(isHigher, ___BLANK___, highestBid);

    // Update highest bidder address
    highestBidder = FHE.select(isHigher,
        FHE.___BLANK___(msg.sender),
        highestBidder
    );

    // Store bidder's own bid and grant permissions
    bids[msg.sender] = newBid;
    FHE.allowThis(highestBid);
    FHE.allowThis(highestBidder);
    FHE.allow(bids[msg.sender], msg.sender);
}`,
    checks: [
      { pattern: "FHE.gt", label: "Used FHE.gt() for comparison" },
      { pattern: "FHE.select", label: "Used FHE.select() for conditional update" },
      { pattern: "newBid", label: "Passed newBid as the 'if higher' value" },
      { pattern: "asEaddress", label: "Used FHE.asEaddress() to encrypt sender" },
    ],
    hint: "FHE.gt(a, b) checks if a > b. In FHE.select, the second arg is the 'if true' value (the new bid). Use FHE.asEaddress() to convert a plaintext address to an encrypted eaddress.",
    solution: `function bid(externalEuint64 encBid, bytes calldata proof) external {
    euint64 newBid = FHE.fromExternal(encBid, proof);

    // Is this bid higher than current highest?
    ebool isHigher = FHE.gt(newBid, highestBid);

    // Update highest bid — silently, indistinguishably
    highestBid = FHE.select(isHigher, newBid, highestBid);

    // Update highest bidder address
    highestBidder = FHE.select(isHigher,
        FHE.asEaddress(msg.sender),
        highestBidder
    );

    // Store bidder's own bid and grant permissions
    bids[msg.sender] = newBid;
    FHE.allowThis(highestBid);
    FHE.allowThis(highestBidder);
    FHE.allow(bids[msg.sender], msg.sender);
}`,
  },
  {
    id: 7,
    title: "Public Decryption",
    difficulty: "Advanced",
    lesson: "3.1",
    filename: "Reveal.sol",
    description:
      "After a blind auction ends, reveal the winner publicly by marking the highest bid and winner address as publicly decryptable.",
    template: `function revealWinner() external {
    require(msg.sender == owner, "Only owner");
    require(block.timestamp > endTime, "Auction still active");

    // Make the winning bid publicly readable
    FHE.___BLANK___(highestBid);

    // Make the winner's address publicly readable
    FHE.___BLANK___(highestBidder);

    // Emit event for off-chain indexers
    emit WinnerRevealed();
}`,
    checks: [
      {
        pattern: "makePubliclyDecryptable",
        label: "Used FHE.makePubliclyDecryptable() for bid and winner",
        count: 2,
      },
    ],
    hint: "FHE.makePubliclyDecryptable(handle) authorizes anyone to read the plaintext via the Relayer. Call it on both handles.",
    solution: `function revealWinner() external {
    require(msg.sender == owner, "Only owner");
    require(block.timestamp > endTime, "Auction still active");

    // Make the winning bid publicly readable
    FHE.makePubliclyDecryptable(highestBid);

    // Make the winner's address publicly readable
    FHE.makePubliclyDecryptable(highestBidder);

    // Emit event for off-chain indexers
    emit WinnerRevealed();
}`,
  },
  {
    id: 8,
    title: "Cross-Contract ACL",
    difficulty: "Advanced",
    lesson: "4.2",
    filename: "PayrollACL.sol",
    description:
      "Pass an encrypted salary from the PayrollVault to the SalaryRegistry. Grant the registry contract ACL permission before the cross-contract call.",
    template: `// In PayrollVault contract
function setSalary(address employee, externalEuint64 encSalary, bytes calldata proof) external {
    require(msg.sender == employer, "Only employer");

    euint64 salary = FHE.fromExternal(encSalary, proof);

    // Grant the registry contract permission to use this handle
    FHE.___BLANK___(salary, address(___BLANK___));

    // Cross-contract call — registry can now use the handle
    registry.storeSalary(employee, salary);
}

// In SalaryRegistry contract
function storeSalary(address emp, euint64 sal) external onlyVault {
    salaries[emp] = sal;

    // Grant this contract permission
    FHE.___BLANK___(sal);

    // Grant the employee permission to decrypt
    FHE.___BLANK___(sal, emp);
}`,
    checks: [
      { pattern: "FHE.allow(salary", label: "Granted ACL to registry before call" },
      { pattern: "registry", label: "Passed registry address" },
      { pattern: "allowThis", label: "Registry calls FHE.allowThis()" },
      { pattern: "FHE.allow(sal, emp)", label: "Employee gets decrypt permission" },
    ],
    hint: "Before calling another contract, grant it permission: FHE.allow(handle, address(targetContract)). The target then calls allowThis for itself and allow for the end user.",
    solution: `// In PayrollVault contract
function setSalary(address employee, externalEuint64 encSalary, bytes calldata proof) external {
    require(msg.sender == employer, "Only employer");

    euint64 salary = FHE.fromExternal(encSalary, proof);

    // Grant the registry contract permission to use this handle
    FHE.allow(salary, address(registry));

    // Cross-contract call — registry can now use the handle
    registry.storeSalary(employee, salary);
}

// In SalaryRegistry contract
function storeSalary(address emp, euint64 sal) external onlyVault {
    salaries[emp] = sal;

    // Grant this contract permission
    FHE.allowThis(sal);

    // Grant the employee permission to decrypt
    FHE.allow(sal, emp);
}`,
  },
  {
    id: 9,
    title: "Selective Encryption",
    difficulty: "Advanced",
    lesson: "4.1",
    filename: "Employee.sol",
    description:
      "Fix this over-encrypted struct. Only the salary field needs privacy -- everything else should be plaintext to save 60-70% gas.",
    template: `// BEFORE: Over-encrypted (wasteful)
// struct Employee {
//     euint64 id;
//     euint64 salary;
//     euint64 startDate;
//     euint64 department;
// }

// AFTER: Fix it — only encrypt what needs privacy
struct Employee {
    ___BLANK___ id;           // public info — no privacy needed
    ___BLANK___ salary;       // private — needs encryption
    ___BLANK___ startDate;    // public info — no privacy needed
    ___BLANK___ department;   // public info — no privacy needed
}`,
    checks: [
      { pattern: "uint256", label: "Used uint256 for plaintext fields", count: 3 },
      { pattern: "euint64", label: "Used euint64 only for salary" },
    ],
    hint: "Only the salary requires privacy. Employee ID, start date, and department are public information -- use standard uint256 for those.",
    solution: `// BEFORE: Over-encrypted (wasteful)
// struct Employee {
//     euint64 id;
//     euint64 salary;
//     euint64 startDate;
//     euint64 department;
// }

// AFTER: Fix it — only encrypt what needs privacy
struct Employee {
    uint256 id;           // public info — no privacy needed
    euint64 salary;       // private — needs encryption
    uint256 startDate;    // public info — no privacy needed
    uint256 department;   // public info — no privacy needed
}`,
  },
  {
    id: 10,
    title: "Relayer SDK Integration",
    difficulty: "Expert",
    lesson: "3.2",
    filename: "client.ts",
    description:
      "Write the client-side code to generate an encrypted bid and submit it to a BlindAuction contract using the Relayer SDK.",
    template: `import { ___BLANK___, SepoliaConfig } from "@zama-fhe/relayer-sdk";

// Initialize the FHE instance
const instance = await ___BLANK___(SepoliaConfig);

// Create an encrypted input for the auction contract
const input = instance.___BLANK___(
    auctionContractAddress,
    userWalletAddress
);

// Encrypt the bid amount (500 tokens)
input.___BLANK___(BigInt(500));

// Generate the ciphertext and proof
const { handles, inputProof } = await input.___BLANK___();

// Submit to the auction contract
await auctionContract.bid(handles[0], inputProof);`,
    checks: [
      { pattern: "createInstance", label: "Imported createInstance" },
      { pattern: "createInstance", label: "Called createInstance(SepoliaConfig)" },
      { pattern: "createEncryptedInput", label: "Called createEncryptedInput()" },
      { pattern: "add64", label: "Used add64() to encrypt value" },
      { pattern: "encrypt", label: "Called encrypt() to generate proof" },
    ],
    hint: "Flow: createInstance -> createEncryptedInput(contract, user) -> add64(value) -> encrypt(). The encrypt() call returns {handles, inputProof}.",
    solution: `import { createInstance, SepoliaConfig } from "@zama-fhe/relayer-sdk";

// Initialize the FHE instance
const instance = await createInstance(SepoliaConfig);

// Create an encrypted input for the auction contract
const input = instance.createEncryptedInput(
    auctionContractAddress,
    userWalletAddress
);

// Encrypt the bid amount (500 tokens)
input.add64(BigInt(500));

// Generate the ciphertext and proof
const { handles, inputProof } = await input.encrypt();

// Submit to the auction contract
await auctionContract.bid(handles[0], inputProof);`,
  },
];

/* ── Helpers ───────────────────────────────────────── */

function getDifficultyColor(difficulty) {
  switch (difficulty) {
    case "Beginner":
      return "var(--success)";
    case "Intermediate":
      return "var(--accent)";
    case "Advanced":
      return "var(--text)";
    case "Expert":
      return "var(--error)";
    default:
      return "var(--text-secondary)";
  }
}

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
      { threshold: 0.08 }
    );
    const elements = ref.current?.querySelectorAll(".fade-in") || [];
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [dep]);
  return ref;
}

/* ── Component ─────────────────────────────────────── */

function getSavedCode(exerciseId) {
  try {
    const saved = JSON.parse(localStorage.getItem("sandbox-solutions") || "{}");
    return saved[exerciseId] || null;
  } catch { return null; }
}

function saveCode(exerciseId, code) {
  try {
    const saved = JSON.parse(localStorage.getItem("sandbox-solutions") || "{}");
    saved[exerciseId] = code;
    localStorage.setItem("sandbox-solutions", JSON.stringify(saved));
  } catch { /* ignore */ }
}

export default function SandboxPage() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [code, setCode] = useState(
    () => getSavedCode(EXERCISES[0].id) || EXERCISES[0].template
  );
  const [results, setResults] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [showSolutionBtn, setShowSolutionBtn] = useState(false);
  const [completed, setCompleted] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("sandbox-completed") || "[]");
      return new Set(saved);
    } catch { return new Set(); }
  });
  const [outputOpen, setOutputOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem("sandbox-completed", JSON.stringify([...completed]));
  }, [completed]);
  const textareaRef = useRef(null);
  const highlightRef = useRef(null);
  const wrapperRef = useFadeIn(activeIndex);

  const syncScroll = useCallback(() => {
    if (textareaRef.current && highlightRef.current) {
      highlightRef.current.scrollTop = textareaRef.current.scrollTop;
      highlightRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  }, []);

  const exercise = EXERCISES[activeIndex];
  const allPassed = results && results.every((r) => r.passed);
  const lineCount = code.split("\n").length;
  const highlightedCode = useMemo(() => highlightSolidity(code), [code]);

  const selectExercise = useCallback((index) => {
    setActiveIndex(index);
    const ex = EXERCISES[index];
    setCode(getSavedCode(ex.id) || ex.template);
    setResults(null);
    setShowHint(false);
    setShowSolutionBtn(false);
    setOutputOpen(false);
  }, []);

  const handleCheck = useCallback(() => {
    const checkResults = exercise.checks.map((check) => {
      if (check.count) {
        const matches = code.split(check.pattern).length - 1;
        return { ...check, passed: matches >= check.count };
      }
      return { ...check, passed: code.includes(check.pattern) };
    });

    setResults(checkResults);
    setOutputOpen(true);

    const passed = checkResults.every((r) => r.passed);
    if (passed) {
      setCompleted((prev) => new Set([...prev, exercise.id]));
      saveCode(exercise.id, code);
    } else {
      setShowSolutionBtn(true);
    }
  }, [code, exercise]);

  const handleShowSolution = useCallback(() => {
    setCode(exercise.solution);
  }, [exercise]);

  const handleReset = useCallback(() => {
    setCode(exercise.template);
    setResults(null);
    setOutputOpen(false);
    setShowHint(false);
    setShowSolutionBtn(false);
    // Clear saved solution so it reloads as template
    try {
      const saved = JSON.parse(localStorage.getItem("sandbox-solutions") || "{}");
      delete saved[exercise.id];
      localStorage.setItem("sandbox-solutions", JSON.stringify(saved));
    } catch { /* ignore */ }
    // Remove from completed
    setCompleted((prev) => {
      const next = new Set(prev);
      next.delete(exercise.id);
      return next;
    });
  }, [exercise]);

  const handleNextExercise = useCallback(() => {
    if (activeIndex < EXERCISES.length - 1) {
      selectExercise(activeIndex + 1);
    }
  }, [activeIndex, selectExercise]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const textarea = e.target;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const value = textarea.value;
      const newValue = value.substring(0, start) + "    " + value.substring(end);
      setCode(newValue);
      requestAnimationFrame(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 4;
      });
    }
  }, []);

  const passedCount = results ? results.filter((r) => r.passed).length : 0;
  const totalChecks = exercise.checks.length;

  return (
    <section className="sandbox-page" ref={wrapperRef}>
      <div className="container">
        {/* Header */}
        <header className="sandbox-header fade-in">
          <span className="tag tag-accent">Interactive Lab</span>
          <DecryptText
            text="FHE Sandbox"
            as="h1"
            delay={100}
            duration={1000}
            className="sandbox-title"
          />
          <p className="sandbox-subtitle">
            Hands-on coding exercises. Fill in the blanks, check your solution,
            build muscle memory with encrypted computation.
          </p>
          <div className="sandbox-stats">
            <div className="sandbox-stat">
              <span className="sandbox-stat-value">{completed.size}</span>
              <span className="sandbox-stat-label">Solved</span>
            </div>
            <div className="sandbox-stat">
              <span className="sandbox-stat-value">{EXERCISES.length}</span>
              <span className="sandbox-stat-label">Exercises</span>
            </div>
            <div className="sandbox-stat">
              <span className="sandbox-stat-value">
                {Math.round((completed.size / EXERCISES.length) * 100)}%
              </span>
              <span className="sandbox-stat-label">Complete</span>
            </div>
          </div>
        </header>

        {/* IDE Shell */}
        <div className="ide-shell fade-in">
          {/* Titlebar */}
          <div className="ide-titlebar">
            <div className="ide-titlebar-dots">
              <span className="ide-dot ide-dot--red" />
              <span className="ide-dot ide-dot--yellow" />
              <span className="ide-dot ide-dot--green" />
            </div>
            <span className="ide-titlebar-text">
              fhe-sandbox &mdash; {exercise.filename}
            </span>
            <div className="ide-titlebar-actions">
              <button
                className="ide-action-btn"
                onClick={() => setShowHint((h) => !h)}
              >
                {showHint ? "[ hide hint ]" : "[ hint ]"}
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="ide-body">
            {/* Sidebar / File Explorer */}
            <div className="ide-sidebar">
              <div className="ide-sidebar-header">
                <span className="ide-sidebar-label">Exercises</span>
              </div>
              <div className="ide-file-list">
                {EXERCISES.map((ex, i) => (
                  <button
                    key={ex.id}
                    className={
                      "ide-file-item" +
                      (i === activeIndex ? " ide-file-item--active" : "")
                    }
                    onClick={() => selectExercise(i)}
                  >
                    <span className="ide-file-num">
                      {String(ex.id).padStart(2, "0")}
                    </span>
                    <span className="ide-file-name">{ex.filename}</span>
                    {completed.has(ex.id) ? (
                      <span className="ide-file-status ide-file-status--done">
                        &#10003;
                      </span>
                    ) : (
                      <span
                        className="ide-file-status--dot"
                        style={{ background: getDifficultyColor(ex.difficulty) }}
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Main Editor Panel */}
            <div className="ide-main">
              {/* Tab bar */}
              <div className="ide-tabs">
                <button className="ide-tab ide-tab--active">
                  <span
                    className="ide-tab-dot"
                    style={{ background: getDifficultyColor(exercise.difficulty) }}
                  />
                  {exercise.filename}
                </button>
                <button className="ide-tab" style={{ marginLeft: "auto" }}>
                  {exercise.difficulty} &middot; Lesson {exercise.lesson}
                </button>
              </div>

              {/* Exercise info bar */}
              <div className="exercise-info">
                <div className="exercise-info-left">
                  <span className="exercise-info-title">
                    {String(exercise.id).padStart(2, "0")}. {exercise.title}
                  </span>
                  <span className="exercise-info-desc">
                    {exercise.description}
                  </span>
                </div>
                <div className="exercise-info-right">
                  <span
                    className="exercise-badge"
                    style={{
                      color: getDifficultyColor(exercise.difficulty),
                      borderColor: getDifficultyColor(exercise.difficulty),
                    }}
                  >
                    {exercise.difficulty}
                  </span>
                </div>
              </div>

              {/* Editor */}
              <div className="editor-wrapper">
                <div className="editor-line-numbers" aria-hidden="true">
                  {Array.from({ length: lineCount }, (_, i) => (
                    <span key={i}>{i + 1}</span>
                  ))}
                </div>
                <div className="editor-area">
                  <pre
                    ref={highlightRef}
                    className="editor-highlight"
                    aria-hidden="true"
                    dangerouslySetInnerHTML={{ __html: highlightedCode + "\n" }}
                  />
                  <textarea
                    ref={textareaRef}
                    className="editor-textarea"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    onScroll={syncScroll}
                    onKeyDown={handleKeyDown}
                    spellCheck={false}
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    data-gramm="false"
                  />
                </div>
              </div>

              {/* Output / Terminal Panel */}
              <div className={"ide-output" + (outputOpen ? " ide-output--open" : "")}>
                <div className="ide-output-header">
                  <span className="ide-output-tab">Output</span>
                  <button
                    className="ide-output-close"
                    onClick={() => setOutputOpen(false)}
                  >
                    &times;
                  </button>
                </div>
                <div className="ide-output-body">
                  {results && results.map((r, i) => (
                    <div key={i} className="output-line">
                      <span className={"output-icon" + (r.passed ? " output-icon--pass" : " output-icon--fail")}>
                        {r.passed ? "\u2713" : "\u2717"}
                      </span>
                      <span className={"output-text" + (r.passed ? " output-text--pass" : " output-text--fail")}>
                        {r.label}
                      </span>
                    </div>
                  ))}
                  {showHint && (
                    <div className="hint-inline">
                      <span className="hint-inline-label">Hint</span>
                      <p>{exercise.hint}</p>
                    </div>
                  )}
                  {results && (
                    <div className="output-summary">
                      <span className={"output-summary-text" + (allPassed ? " output-summary-text--pass" : " output-summary-text--fail")}>
                        {allPassed
                          ? `All ${totalChecks} checks passed`
                          : `${passedCount}/${totalChecks} checks passed`}
                      </span>
                      {allPassed && activeIndex < EXERCISES.length - 1 && (
                        <button className="toolbar-btn toolbar-btn--primary" onClick={handleNextExercise}>
                          Next Exercise &rarr;
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Success banner */}
              {allPassed && (
                <div className="success-overlay">
                  <span className="success-text">
                    Exercise complete
                  </span>
                  {activeIndex === EXERCISES.length - 1 && completed.size === EXERCISES.length && (
                    <span className="success-sub">
                      &mdash; All exercises finished. Sandbox mastered.
                    </span>
                  )}
                </div>
              )}

              {/* Toolbar */}
              <div className="ide-toolbar">
                <div className="ide-toolbar-left">
                  <button className="toolbar-btn toolbar-btn--primary" onClick={handleCheck}>
                    Run Checks
                  </button>
                  <button
                    className="toolbar-btn"
                    onClick={() => {
                      setShowHint((h) => !h);
                      if (!outputOpen) setOutputOpen(true);
                    }}
                  >
                    {showHint ? "Hide Hint" : "Hint"}
                  </button>
                  {showSolutionBtn && !allPassed && (
                    <button className="toolbar-btn" onClick={handleShowSolution}>
                      Solution
                    </button>
                  )}
                </div>
                <div className="ide-toolbar-right">
                  <button className="toolbar-btn toolbar-btn--reset" onClick={handleReset}>
                    Reset
                  </button>
                  <span className="toolbar-divider" />
                  <span className="progress-label" style={{ fontSize: "0.72rem" }}>
                    {completed.size}/{EXERCISES.length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="sandbox-progress fade-in">
          <span className="progress-label">
            {completed.size} of {EXERCISES.length} exercises completed
          </span>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${(completed.size / EXERCISES.length) * 100}%` }}
            />
          </div>
        </div>

        {/* All complete banner */}
        {completed.size === EXERCISES.length && (
          <div className="sandbox-complete fade-in">
            <span className="sandbox-complete-tag">SANDBOX MASTERED</span>
            <h3 className="sandbox-complete-title">
              All Exercises Complete
            </h3>
            <p className="sandbox-complete-text">
              You&apos;ve completed every FHE coding exercise. You now have the
              muscle memory to build encrypted smart contracts with confidence.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
