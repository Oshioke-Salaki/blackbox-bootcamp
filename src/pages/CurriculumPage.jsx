import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import DecryptText from "../components/DecryptText";
import CodeBlock from "../components/CodeBlock";
import Quiz from "../components/Quiz";
import { useProgress } from "../components/ProgressContext";
import "./CurriculumPage.css";

/* ─── fade-in hook ─── */
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
    const els = ref.current?.querySelectorAll(".fade-in") || [];
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [dep]);
  return ref;
}

/* ─── SVG progress circle ─── */
function ProgressCircle({ percent, size = 36, stroke = 3 }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (percent / 100) * circ;
  return (
    <svg width={size} height={size} className="progress-circle">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="var(--border)"
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={percent === 100 ? "var(--success)" : "var(--accent)"}
        strokeWidth={stroke}
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="butt"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: "stroke-dashoffset 0.4s ease" }}
      />
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════
   CURRICULUM DATA
   ═══════════════════════════════════════════════════════════ */

const WEEKS_META = [
  { id: "week1", lessons: 4 },
  { id: "week2", lessons: 3 },
  { id: "week3", lessons: 3 },
  { id: "week4", lessons: 3 },
];

const WEEKS = [
  /* ──────────── WEEK 1 ──────────── */
  {
    id: "week1",
    number: 1,
    title: "The FHE Paradigm Shift",
    subtitle: "Environment Setup & Encrypted Types",
    lessons: [
      {
        id: "week1-lesson-1",
        num: "1.1",
        title: "The FHE Mental Model",
        objectives: [
          "Explain how FHE differs from ZK proofs and traditional encryption",
          "Understand the coprocessor architecture",
          "Describe why on-chain computation on encrypted data is possible",
        ],
        content:
          "Fully Homomorphic Encryption allows computation on encrypted data without ever decrypting it. This is a fundamentally different paradigm from anything else in the blockchain space. Traditional encryption (AES, RSA) lets you store and transmit secrets, but to do anything useful you must decrypt first — exposing the plaintext. ZK proofs let you prove you know something (a password, a Merkle path, a valid state transition) without revealing it, but they don't let the verifier compute on the hidden data. FHE does both: data stays encrypted, and the network can add, subtract, compare, and select on those ciphertexts. The Zama coprocessor handles the heavy cryptographic operations off-chain while the results are verified on-chain. Your contract inherits ZamaEthereumConfig, which wires the FHE coprocessor connection — a single line of inheritance that makes FHE.add(), FHE.sub(), FHE.select(), and all other operations available to your contract.",
        insight:
          "FHE doesn't hide the computation — it hides the data. The function is public, the inputs are private. This is the inverse of ZK proofs.",
        code: `<span class="cm">// The one line that wires the FHE coprocessor</span>
<span class="kw">import</span> <span class="str">"fhevm/config/ZamaEthereumConfig.sol"</span>;

<span class="kw">contract</span> <span class="ty">MyFirstFHE</span> <span class="kw">is</span> <span class="ty">ZamaEthereumConfig</span> {
  <span class="cm">// FHE.add(), FHE.sub(), FHE.select() are now available</span>
  <span class="cm">// The coprocessor handles all crypto operations</span>
}`,
        codeFilename: "MyFirstFHE.sol",
        quiz: [
          {
            question: "What makes FHE different from traditional encryption?",
            options: [
              "It uses smaller keys",
              "It only works on integers",
              "It allows computation on encrypted data without decryption",
              "It's faster than AES",
            ],
            correct: 2,
            explanation:
              "Traditional encryption requires decryption before any computation. FHE allows add, multiply, compare, and select operations directly on ciphertexts.",
          },
          {
            question: "What does ZamaEthereumConfig do?",
            options: [
              "Configures the FHE coprocessor connection",
              "Creates encrypted storage automatically",
              "Sets up gas limits for FHE operations",
              "Enables ZK proofs on the contract",
            ],
            correct: 0,
            explanation:
              "ZamaEthereumConfig is a single-line inheritance that wires your contract to the Zama FHE coprocessor, making all FHE operations available.",
          },
        ],
      },
      {
        id: "week1-lesson-2",
        num: "1.2",
        title: "Encrypted Types & Storage",
        objectives: [
          "Use euint8, euint16, euint32, euint64, euint128, euint256, ebool, eaddress",
          "Store encrypted values in contract state",
          "Convert between plaintext and encrypted types",
        ],
        content:
          "The FHEVM encrypted type system mirrors Solidity's integer types but operates entirely on ciphertexts. The most commonly used type is euint64 — an encrypted 64-bit unsigned integer. The EVM never sees the plaintext value; it only handles ciphertext handles, which are opaque references to data that lives in the coprocessor. To store an encrypted value, declare it as a state variable or mapping just like you would with a regular uint — but use the encrypted type instead. To create an encrypted value from plaintext (typically for admin initialization), call FHE.asEuint64(). To accept user-submitted encrypted values, use the externalEuint64 parameter type in your function signature combined with FHE.fromExternal() for validation. The fromExternal call validates a ZK proof that the ciphertext is well-formed and within the expected bit range.",
        insight:
          "Think of encrypted types as opaque handles. The EVM stores and passes them around, but never sees what's inside. Only the coprocessor can compute on them.",
        code: `<span class="cm">// Encrypted state — the EVM never sees plaintext values</span>
<span class="ty">mapping</span>(<span class="ty">address</span> => <span class="ty">euint64</span>) <span class="kw">private</span> balances;
<span class="ty">ebool</span> <span class="kw">private</span> isActive;
<span class="ty">eaddress</span> <span class="kw">private</span> winner;

<span class="cm">// Admin sets a value from plaintext</span>
balances[user] = FHE.<span class="fn">asEuint64</span>(<span class="num">1000</span>);

<span class="cm">// User submits encrypted value</span>
<span class="kw">function</span> <span class="fn">deposit</span>(<span class="ty">externalEuint64</span> encAmount, <span class="ty">bytes</span> <span class="kw">calldata</span> proof) <span class="kw">external</span> {
  <span class="ty">euint64</span> amount = FHE.<span class="fn">fromExternal</span>(encAmount, proof);
  balances[msg.sender] = FHE.<span class="fn">add</span>(balances[msg.sender], amount);
  FHE.<span class="fn">allowThis</span>(balances[msg.sender]);
  FHE.<span class="fn">allow</span>(balances[msg.sender], msg.sender);
}`,
        codeFilename: "EncryptedStorage.sol",
        quiz: [
          {
            question: "How do you accept an encrypted value from a user?",
            options: [
              "Call FHE.encrypt() on a uint256",
              "Use bytes32 as a ciphertext container",
              "Use uint256 and encrypt it on-chain",
              "Use externalEuint64 with FHE.fromExternal()",
            ],
            correct: 3,
            explanation:
              "Users submit encrypted values as externalEuint64 with a ZK proof. The contract validates with FHE.fromExternal(encAmount, proof).",
          },
          {
            question: "What happens when you store a euint64 in a mapping?",
            options: [
              "The mapping is encrypted entirely",
              "The plaintext value is stored on-chain",
              "A ciphertext handle is stored — the EVM never sees the value",
              "The value is hashed before storage",
            ],
            correct: 2,
            explanation:
              "euint64 is a ciphertext handle. The actual encrypted data lives in the coprocessor; the EVM only stores and manipulates handles.",
          },
        ],
      },
      {
        id: "week1-lesson-3",
        num: "1.3",
        title: "FHE.select — The No-Revert Pattern",
        objectives: [
          "Understand why require() leaks information",
          "Implement the FHE.select pattern for conditional logic",
          "Apply the no-revert rule to transfers",
        ],
        content:
          "In standard Solidity, require(balance >= amount) reverts on failure — but that revert tells an observer \"the balance was below this amount.\" Information leaked. In FHEVM, you cannot branch on encrypted data at all because ebool is not a Solidity bool — the EVM literally cannot evaluate it. Instead, use FHE.select(condition, valueIfTrue, valueIfFalse). Both branches are always computed, but only one result is selected and stored. The gas cost is identical regardless of which branch is taken. An observer sees a successful transaction either way and learns absolutely nothing about the encrypted values involved. This is the single most important pattern in FHEVM development: replace every require, if, and revert that touches encrypted data with FHE.select.",
        insight:
          "Every conditional in FHE becomes a mask. Both paths execute. Only one result is stored. This is the single most important pattern in FHEVM development.",
        code: `<span class="cm">// WRONG: This leaks information via revert</span>
<span class="kw">require</span>(balances[msg.sender] >= amount, <span class="str">"Insufficient"</span>);
balances[msg.sender] -= amount;

<span class="cm">// CORRECT: FHE.select — no information leaks</span>
<span class="ty">ebool</span> canTransfer = FHE.<span class="fn">le</span>(amount, balances[msg.sender]);
balances[msg.sender] = FHE.<span class="fn">select</span>(
  canTransfer,
  FHE.<span class="fn">sub</span>(balances[msg.sender], amount),
  balances[msg.sender]  <span class="cm">// unchanged if insufficient</span>
);
<span class="cm">// Transaction always succeeds. Observer learns nothing.</span>`,
        codeFilename: "NoRevertPattern.sol",
        quiz: [
          {
            question:
              "Why can't you use require() with encrypted values?",
            options: [
              "require() is disabled in FHEVM contracts",
              "It uses too much gas on encrypted data",
              "It's too slow for production use",
              "ebool is not a Solidity bool — the EVM can't branch on encrypted data",
            ],
            correct: 3,
            explanation:
              "ebool is a ciphertext handle, not a boolean. The EVM literally cannot evaluate it. Even if it could, the revert/success would leak information about the encrypted value.",
          },
          {
            question:
              "In FHE.select(condition, a, b), how many values are computed?",
            options: [
              "Only the selected one",
              "Both a and b are always computed",
              "It depends on the condition",
              "Neither — it's lazy evaluated",
            ],
            correct: 1,
            explanation:
              "Both branches are always computed. The coprocessor selects which result to store based on the encrypted condition. This is why gas cost is constant regardless of the outcome.",
          },
        ],
      },
      {
        id: "week1-lesson-4",
        num: "1.4",
        title: "ACL — FHE.allow & FHE.allowThis",
        objectives: [
          "Understand the FHE Access Control List system",
          "Call FHE.allow() and FHE.allowThis() correctly",
          "Avoid the #1 bug: stale ACL permissions after mutation",
        ],
        content:
          "Every encrypted ciphertext has an Access Control List. By default, only the contract that created it can access it. FHE.allowThis(handle) grants the current contract permission to use the handle in future transactions. FHE.allow(handle, address) grants a specific user permission — necessary if that user needs to decrypt the value later. The critical concept: every FHE operation (add, sub, mul, select) creates a NEW ciphertext handle. The old handle's permissions do not carry over to the new one. You must re-grant permissions after every mutation. This is the number one source of bugs in FHEVM development. Forgetting to call allowThis after an FHE operation means the contract loses access to its own data in the next transaction. Forgetting to call allow for the user means they can never decrypt their own balance.",
        insight:
          "FHE operations create new handles. The old permissions die with the old handle. This is the #1 source of bugs in FHEVM development.",
        code: `<span class="cm">// After EVERY FHE mutation, re-grant permissions</span>
balances[user] = FHE.<span class="fn">add</span>(balances[user], amount);

<span class="cm">// The add() created a NEW handle — old ACL is gone</span>
FHE.<span class="fn">allowThis</span>(balances[user]);     <span class="cm">// contract can use it</span>
FHE.<span class="fn">allow</span>(balances[user], user);    <span class="cm">// user can decrypt it</span>

<span class="cm">// WRONG: Forgetting allow after mutation</span>
<span class="cm">// balances[user] = FHE.sub(balances[user], fee);</span>
<span class="cm">// No allow calls — the next operation will fail silently</span>`,
        codeFilename: "ACLPattern.sol",
        quiz: [
          {
            question:
              "When must you call FHE.allow() and FHE.allowThis()?",
            options: [
              "Only for ebool types that need decryption",
              "Only once during contract deployment",
              "Only when transferring handles to other contracts",
              "After every FHE operation that creates a new handle",
            ],
            correct: 3,
            explanation:
              "Every FHE operation (add, sub, mul, select) creates a new ciphertext handle. The new handle has no ACL permissions — you must explicitly grant them again.",
          },
        ],
      },
    ],
  },

  /* ──────────── WEEK 2 ──────────── */
  {
    id: "week2",
    number: 2,
    title: "Advanced Encrypted Logic",
    subtitle: "Arithmetic, Comparisons & Control Flow",
    lessons: [
      {
        id: "week2-lesson-1",
        num: "2.1",
        title: "FHE Arithmetic & Comparisons",
        objectives: [
          "Use FHE.add, sub, mul, div, rem on encrypted values",
          "Use FHE.le, lt, ge, gt, eq, ne for encrypted comparisons",
          "Understand gas costs of different operations",
        ],
        content:
          "FHEVM provides a full arithmetic suite for encrypted values. FHE.add and FHE.sub are the cheapest operations and should be your go-to. FHE.mul is significantly more expensive — roughly 3x the gas of an addition — so avoid chaining multiplications when possible. FHE.div is the most expensive operation of all. For comparisons, FHE.le, FHE.lt, FHE.ge, FHE.gt, FHE.eq, and FHE.ne all return ebool. All operations require same-type operands: both must be euint64, for example. If you need to mix an encrypted value with a plaintext constant, wrap the constant with FHE.asEuint64() first. Structure your arithmetic to minimize expensive operations — compute numerator and denominator separately, then divide once at the end.",
        insight:
          "FHE.mul costs roughly 3x more gas than FHE.add. Structure your arithmetic to minimize multiplications. Compute numerator and denominator separately, then divide once.",
        code: `<span class="cm">// Arithmetic on encrypted values</span>
<span class="ty">euint64</span> sum = FHE.<span class="fn">add</span>(a, b);
<span class="ty">euint64</span> diff = FHE.<span class="fn">sub</span>(a, b);
<span class="ty">euint64</span> product = FHE.<span class="fn">mul</span>(a, b);     <span class="cm">// expensive</span>
<span class="ty">euint64</span> quotient = FHE.<span class="fn">div</span>(a, b);   <span class="cm">// most expensive</span>

<span class="cm">// Comparisons return ebool</span>
<span class="ty">ebool</span> isLess = FHE.<span class="fn">lt</span>(a, b);
<span class="ty">ebool</span> isEqual = FHE.<span class="fn">eq</span>(a, b);
<span class="ty">ebool</span> isGreater = FHE.<span class="fn">gt</span>(a, b);

<span class="cm">// Use comparison result with select</span>
<span class="ty">euint64</span> max = FHE.<span class="fn">select</span>(FHE.<span class="fn">gt</span>(a, b), a, b);`,
        codeFilename: "ArithmeticOps.sol",
        quiz: [
          {
            question: "Which FHE operation is the most gas-expensive?",
            options: ["FHE.div", "FHE.add", "FHE.sub", "FHE.mul"],
            correct: 0,
            explanation:
              "FHE.div is the most gas-expensive operation. FHE.mul is second. Structure arithmetic to minimize these operations.",
          },
        ],
      },
      {
        id: "week2-lesson-2",
        num: "2.2",
        title: "Boolean Masking & Encrypted Control Flow",
        objectives: [
          "Combine multiple ebool conditions",
          "Build complex business logic without branching",
          "Implement multi-condition guards with FHE.and/or",
        ],
        content:
          "Real-world contracts rarely have a single condition. You need to check balances, verify authorization, enforce limits, and validate timing — all at once. In standard Solidity, you chain require() calls. In FHEVM, you combine encrypted boolean flags. FHE.and(condA, condB) returns an ebool that is true only when both conditions are true. FHE.or(condA, condB) returns true when either is true. FHE.not(cond) inverts a condition. Chain these to build arbitrarily complex logic: isValid = FHE.and(hasBalance, FHE.and(isNotFrozen, isAuthorized)). Then apply the combined mask with a single FHE.select. This replaces nested if/else trees with a flat, readable, information-leak-free pattern.",
        insight:
          "Think of each business rule as an encrypted boolean flag. Combine flags with FHE.and/or. Apply the combined flag with one FHE.select. This replaces nested if/else trees.",
        code: `<span class="cm">// Multi-condition guard without branching</span>
<span class="ty">ebool</span> hasBalance = FHE.<span class="fn">ge</span>(balances[sender], amount);
<span class="ty">ebool</span> notFrozen = FHE.<span class="fn">not</span>(frozen[sender]);
<span class="ty">ebool</span> withinLimit = FHE.<span class="fn">le</span>(amount, dailyLimit);

<span class="cm">// Combine all conditions into a single mask</span>
<span class="ty">ebool</span> canExecute = FHE.<span class="fn">and</span>(hasBalance, FHE.<span class="fn">and</span>(notFrozen, withinLimit));

<span class="cm">// One select to rule them all</span>
balances[sender] = FHE.<span class="fn">select</span>(canExecute,
  FHE.<span class="fn">sub</span>(balances[sender], amount),
  balances[sender]);`,
        codeFilename: "BooleanMasking.sol",
        quiz: [
          {
            question: "How do you combine two encrypted conditions?",
            options: [
              "Use require(condA && condB)",
              "Use if(condA && condB)",
              "Use FHE.and(condA, condB)",
              "Use the && operator on ebool values",
            ],
            correct: 2,
            explanation:
              "ebool values cannot use Solidity's && or || operators. Use FHE.and(), FHE.or(), and FHE.not() to combine encrypted boolean conditions.",
          },
        ],
      },
      {
        id: "week2-lesson-3",
        num: "2.3",
        title: "Building a Dark Pool AMM",
        objectives: [
          "Implement a constant-product AMM with encrypted reserves",
          "Handle encrypted swap amounts safely",
          "Understand anti-MEV properties of encrypted trading",
        ],
        content:
          "A Dark Pool AMM hides trade sizes from the mempool, providing inherent MEV protection. The constant-product formula k = x * y still holds, but all values are encrypted. The swap function accepts an encrypted input amount, computes the output using the standard AMM formula (dy = y * dx / (x + dx)), and updates both reserves — all using FHE operations. Invalid swaps (zero output, insufficient liquidity) silently no-op via FHE.select. In a standard AMM, MEV bots see your trade in the mempool before it executes and can sandwich it for profit. In an FHE AMM, the trade amount is an encrypted euint64 — bots see only an opaque ciphertext handle. The anti-MEV protection is not a feature bolted on after the fact; it is an inherent property of computing on encrypted data.",
        insight:
          "In a standard AMM, MEV bots see your trade before it executes and sandwich it. In an FHE AMM, the trade amount is encrypted — bots see nothing. The anti-MEV protection is inherent, not bolted on.",
        code: `<span class="cm">// Constant-product swap with encrypted values</span>
<span class="kw">function</span> <span class="fn">swap</span>(<span class="ty">externalEuint64</span> encAmount, <span class="ty">bytes</span> <span class="kw">calldata</span> proof) <span class="kw">external</span> {
  <span class="ty">euint64</span> dx = FHE.<span class="fn">fromExternal</span>(encAmount, proof);

  <span class="cm">// dy = reserveB * dx / (reserveA + dx)</span>
  <span class="ty">euint64</span> numerator = FHE.<span class="fn">mul</span>(reserveB, dx);
  <span class="ty">euint64</span> denominator = FHE.<span class="fn">add</span>(reserveA, dx);
  <span class="ty">euint64</span> dy = FHE.<span class="fn">div</span>(numerator, denominator);

  <span class="cm">// Only execute if output > 0</span>
  <span class="ty">ebool</span> validSwap = FHE.<span class="fn">gt</span>(dy, FHE.<span class="fn">asEuint64</span>(<span class="num">0</span>));

  reserveA = FHE.<span class="fn">select</span>(validSwap,
    FHE.<span class="fn">add</span>(reserveA, dx), reserveA);
  reserveB = FHE.<span class="fn">select</span>(validSwap,
    FHE.<span class="fn">sub</span>(reserveB, dy), reserveB);

  FHE.<span class="fn">allowThis</span>(reserveA);
  FHE.<span class="fn">allowThis</span>(reserveB);
}`,
        codeFilename: "DarkPoolAMM.sol",
        quiz: [
          {
            question:
              "Why does an FHE-based AMM prevent MEV extraction?",
            options: [
              "Trade amounts are encrypted — bots can't see pending trades",
              "Transactions are ordered differently by the sequencer",
              "It uses a different pricing formula than Uniswap",
              "It runs on a private sidechain",
            ],
            correct: 0,
            explanation:
              "MEV bots rely on seeing trade amounts in the mempool to front-run. When the amount is encrypted as euint64, the bot sees only a ciphertext handle — useless for price prediction.",
          },
        ],
      },
    ],
  },

  /* ──────────── WEEK 3 ──────────── */
  {
    id: "week3",
    number: 3,
    title: "Access Control & Decryption",
    subtitle: "Decryption Patterns & Relayer SDK",
    lessons: [
      {
        id: "week3-lesson-1",
        num: "3.1",
        title: "Decryption Patterns — Public vs Private",
        objectives: [
          "Use FHE.makePubliclyDecryptable() for public reveals",
          "Understand the Relayer SDK for private decryption",
          "Know when to use each pattern",
        ],
        content:
          "There are two decryption paths in FHEVM, and choosing the right one is critical. Public decryption: call FHE.makePubliclyDecryptable(handle) on-chain, and then anyone can read the plaintext value via the Relayer endpoint. This is used for scenarios like auction winner reveals and public proofs — situations where a previously-hidden value must become visible to everyone. Private decryption: the user calls instance.userDecrypt(handle) via the Relayer SDK off-chain. This only works if FHE.allow(handle, user) was previously called on-chain. This is the pattern for viewing your own balance, checking your own bid, or reading any value meant only for your eyes. In both cases, decryption is always two-step: authorize on-chain first, then execute the actual decryption off-chain through the Relayer. There is no synchronous decrypt call within the smart contract.",
        insight:
          "Decryption is always two-step: authorize on-chain (FHE.allow or FHE.makePubliclyDecryptable), then execute off-chain (Relayer SDK). There is no synchronous decrypt.",
        code: `<span class="cm">// PUBLIC decryption — anyone can read after this</span>
<span class="kw">function</span> <span class="fn">revealWinner</span>() <span class="kw">external</span> onlyOwner {
  FHE.<span class="fn">makePubliclyDecryptable</span>(highestBid);
  FHE.<span class="fn">makePubliclyDecryptable</span>(winnerAddress);
  <span class="cm">// Off-chain: call Relayer to read plaintext</span>
}

<span class="cm">// PRIVATE decryption — only authorized user</span>
<span class="cm">// On-chain: FHE.allow(balance, user) was already called</span>
<span class="cm">// Off-chain (JS):</span>
<span class="cm">// const plaintext = await instance.userDecrypt(handle);</span>`,
        codeFilename: "DecryptionPatterns.sol",
        quiz: [
          {
            question:
              "How does a user view their own encrypted balance?",
            options: [
              "The frontend decrypts it locally using a private key",
              "Use instance.userDecrypt() via the Relayer SDK after FHE.allow() was granted",
              "Call a view function that returns the plaintext directly",
              "They can't — all values are permanently hidden",
            ],
            correct: 1,
            explanation:
              "The contract must call FHE.allow(handle, user) to authorize. Then the user calls instance.userDecrypt(handle) via the Relayer SDK to get the plaintext off-chain.",
          },
        ],
      },
      {
        id: "week3-lesson-2",
        num: "3.2",
        title: "The Relayer SDK — Browser-Side FHE",
        objectives: [
          "Initialize the Relayer SDK with createInstance",
          "Create encrypted inputs in the browser",
          "Submit encrypted transactions",
        ],
        content:
          "The @zama-fhe/relayer-sdk is the bridge between the user's browser and the FHE coprocessor. It lets users generate encrypted inputs client-side without trusting a third party with their plaintext values. The flow is straightforward: first, call createInstance(SepoliaConfig) or createInstance(EthereumConfig) to initialize the SDK. Then create an encrypted input buffer with instance.createEncryptedInput(contractAddr, userAddr). Add the value you want to encrypt with input.add64(BigInt(amount)). Finally, call await input.encrypt() to get back an object containing handles and inputProof. Submit handles[0] and inputProof to your smart contract function. The SDK generates a ZK proof that the encrypted value is well-formed and within the expected bit range, ensuring no one can submit garbage ciphertext.",
        insight:
          "The Relayer SDK is the bridge between the user's browser and the FHE coprocessor. It generates the ZK proof that the encrypted value is well-formed.",
        code: `<span class="cm">// Browser-side: generate encrypted input</span>
<span class="kw">import</span> { createInstance, SepoliaConfig } <span class="kw">from</span> <span class="str">"@zama-fhe/relayer-sdk"</span>;

<span class="kw">const</span> instance = <span class="kw">await</span> <span class="fn">createInstance</span>(SepoliaConfig);

<span class="kw">const</span> input = instance.<span class="fn">createEncryptedInput</span>(
  contractAddress, userAddress
);
input.<span class="fn">add64</span>(BigInt(<span class="num">500</span>));  <span class="cm">// encrypt the value 500</span>

<span class="kw">const</span> { handles, inputProof } = <span class="kw">await</span> input.<span class="fn">encrypt</span>();

<span class="cm">// Submit to contract</span>
<span class="kw">await</span> contract.<span class="fn">bid</span>(handles[<span class="num">0</span>], inputProof);`,
        codeFilename: "relayer-client.js",
        quiz: [
          {
            question: "What does createEncryptedInput() do?",
            options: [
              "Sends plaintext data to the coprocessor for encryption",
              "Creates a new smart contract with FHE capabilities",
              "Creates a client-side encryption buffer that generates FHE-compatible ciphertexts with ZK proofs",
              "Encrypts data directly on the blockchain",
            ],
            correct: 2,
            explanation:
              "createEncryptedInput creates a local encryption buffer. When you call encrypt(), it produces FHE-compatible ciphertext handles and a ZK proof that the input is well-formed.",
          },
        ],
      },
      {
        id: "week3-lesson-3",
        num: "3.3",
        title: "Building a Blind Auction",
        objectives: [
          "Implement sealed-bid auction with encrypted bids",
          "Track highest bid using FHE.select without revealing values",
          "Trigger public decryption for winner reveal",
        ],
        content:
          "A blind auction is the perfect showcase for FHEVM's capabilities. The architecture: a bid() function accepts encrypted bids and compares each new bid with the current highest using FHE.gt and FHE.select. The highest bidder is tracked as an eaddress. During the entire bidding phase, nobody — not even the contract owner — knows who is winning or what any bid amount is. The gas cost is identical whether a bid is higher or lower, so observers learn nothing from transaction patterns. After the auction ends, the owner calls revealWinner() which marks the highest bid and winner address as publicly decryptable via FHE.makePubliclyDecryptable(). The frontend then reads the results through the Relayer SDK. Individual bidders can always check their own bid amount via private decryption (because FHE.allow was called for each bidder).",
        insight:
          "The auction never reveals who's winning during the bidding phase. Even failed bids don't leak information — the gas cost is identical whether your bid is higher or lower.",
        code: `<span class="kw">function</span> <span class="fn">bid</span>(<span class="ty">externalEuint64</span> encBid, <span class="ty">bytes</span> <span class="kw">calldata</span> proof) <span class="kw">external</span> {
  <span class="ty">euint64</span> newBid = FHE.<span class="fn">fromExternal</span>(encBid, proof);

  <span class="cm">// Is this bid higher? We don't know — and that's the point</span>
  <span class="ty">ebool</span> isHigher = FHE.<span class="fn">gt</span>(newBid, highestBid);

  <span class="cm">// Update highest bid — silently, indistinguishably</span>
  highestBid = FHE.<span class="fn">select</span>(isHigher, newBid, highestBid);
  highestBidder = FHE.<span class="fn">select</span>(isHigher,
    FHE.<span class="fn">asEaddress</span>(msg.sender), highestBidder);

  FHE.<span class="fn">allowThis</span>(highestBid);
  FHE.<span class="fn">allowThis</span>(highestBidder);
  FHE.<span class="fn">allow</span>(bids[msg.sender], msg.sender);
}`,
        codeFilename: "BlindAuction.sol",
        quiz: [
          {
            question:
              "Can an observer tell if a new bid became the highest bid?",
            options: [
              "Yes, by watching gas usage",
              "Yes, by reading storage",
              "No — gas cost and execution are identical regardless of outcome",
              "No, but only if the contract is paused",
            ],
            correct: 2,
            explanation:
              "FHE.select always computes both branches and costs the same gas. The transaction succeeds identically whether the bid was higher or not. Zero information leakage.",
          },
        ],
      },
    ],
  },

  /* ──────────── WEEK 4 ──────────── */
  {
    id: "week4",
    number: 4,
    title: "Production & Capstone",
    subtitle: "Optimization, Multi-Contract & Deployment",
    lessons: [
      {
        id: "week4-lesson-1",
        num: "4.1",
        title: "Gas Optimization & Selective Encryption",
        objectives: [
          "Identify which fields should be encrypted vs plaintext",
          "Minimize FHE operation chains",
          "Use FHE.allowTransient() for temporary handles",
        ],
        content:
          "The art of FHEVM development is knowing what NOT to encrypt. Every FHE operation has a significant gas overhead compared to its plaintext equivalent, so over-encryption wastes gas and can hit compute limits. Under-encryption leaks data. The sweet spot is surgical encryption of only the values that require privacy. Employee ID? Plaintext. Salary? Encrypted. Timestamps? Plaintext. Vote counts per candidate? Encrypted. Total voter turnout? Plaintext. Beyond choosing what to encrypt, minimize operation chains. Each FHE operation creates a new handle with new ACL overhead. FHE.allowTransient() grants temporary access within a single transaction — cheaper than FHE.allow() for intermediate values that won't be stored. Structure your computation to batch operations and reduce the total number of FHE calls.",
        insight:
          "The art of FHEVM development is knowing what NOT to encrypt. Over-encryption wastes gas and hits compute limits. Under-encryption leaks data. The sweet spot is surgical.",
        code: `<span class="cm">// WRONG: Over-encrypted struct (wasteful)</span>
<span class="kw">struct</span> <span class="ty">Employee</span> {
  <span class="ty">euint64</span> id;          <span class="cm">// no privacy benefit</span>
  <span class="ty">euint64</span> salary;      <span class="cm">// needs privacy</span>
  <span class="ty">euint64</span> startDate;   <span class="cm">// no privacy benefit</span>
}

<span class="cm">// RIGHT: Selectively encrypted</span>
<span class="kw">struct</span> <span class="ty">Employee</span> {
  <span class="ty">uint256</span> id;          <span class="cm">// plaintext — public info</span>
  <span class="ty">euint64</span> salary;      <span class="cm">// encrypted — private</span>
  <span class="ty">uint256</span> startDate;   <span class="cm">// plaintext — public info</span>
}
<span class="cm">// Gas savings: ~60-70% reduction</span>`,
        codeFilename: "SelectiveEncryption.sol",
        quiz: [
          {
            question:
              "Which field should typically be encrypted in a payroll contract?",
            options: [
              "Employee address",
              "Salary amount",
              "Pay period start date",
              "Contract deployment timestamp",
            ],
            correct: 1,
            explanation:
              "Only values requiring privacy should be encrypted. Salary amounts are private; addresses, dates, and timestamps are typically public information.",
          },
        ],
      },
      {
        id: "week4-lesson-2",
        num: "4.2",
        title: "Multi-Contract FHE Architecture",
        objectives: [
          "Pass encrypted handles between contracts",
          "Manage ACLs across contract boundaries",
          "Design solvency proofs with selective revelation",
        ],
        content:
          "Real systems rarely consist of a single contract. A DeFi protocol might have a vault, a registry, a governance module, and a token — all needing to share encrypted state. The key challenge is passing encrypted handles between contracts. When Contract A creates a handle and calls Contract B, B does not have ACL permission on that handle by default. The solution: call FHE.allow(handle, address(contractB)) before making the cross-contract call. The coprocessor does not care about contract boundaries — it only cares about ACLs. For solvency proofs and auditing, a powerful pattern emerges: keep individual amounts encrypted for privacy, but maintain a plaintext running total that anyone can verify. This gives you privacy for individuals and transparency for the system as a whole.",
        insight:
          "Cross-contract FHE is an ACL problem, not a crypto problem. Before calling another contract with an encrypted handle, grant it permission. The coprocessor doesn't care about contract boundaries — only ACLs.",
        code: `<span class="cm">// Contract A: Grant permission before cross-contract call</span>
<span class="kw">function</span> <span class="fn">setSalary</span>(<span class="ty">address</span> employee, <span class="ty">euint64</span> amount) <span class="kw">external</span> {
  FHE.<span class="fn">allow</span>(amount, address(registry));  <span class="cm">// grant to Contract B</span>
  registry.<span class="fn">storeSalary</span>(employee, amount);
}

<span class="cm">// Contract B (Registry): Can now use the handle</span>
<span class="kw">function</span> <span class="fn">storeSalary</span>(<span class="ty">address</span> emp, <span class="ty">euint64</span> sal) <span class="kw">external</span> onlyVault {
  salaries[emp] = sal;
  FHE.<span class="fn">allowThis</span>(sal);         <span class="cm">// registry can use it</span>
  FHE.<span class="fn">allow</span>(sal, emp);          <span class="cm">// employee can decrypt</span>
}`,
        codeFilename: "MultiContract.sol",
        quiz: [
          {
            question:
              "What must you do before passing an encrypted handle to another contract?",
            options: [
              "Call FHE.allow(handle, otherContractAddress)",
              "Deploy a proxy contract to relay the handle",
              "Re-encrypt the handle for the target contract",
              "Nothing — handles are globally accessible",
            ],
            correct: 0,
            explanation:
              "Encrypted handles have per-address ACLs. Before Contract B can use a handle created by Contract A, A must call FHE.allow(handle, address(B)).",
          },
        ],
      },
      {
        id: "week4-lesson-3",
        num: "4.3",
        title: "Sepolia Deployment & Testing",
        objectives: [
          "Deploy FHE contracts to Sepolia testnet",
          "Run tests against the real coprocessor",
          "Verify contracts and debug coprocessor interactions",
        ],
        content:
          "Development uses mock FHE — operations are instant and deterministic, giving you a fast iteration loop. Production uses the real coprocessor on Sepolia. The key differences: the real coprocessor has latency (operations take roughly 10 to 30 seconds to process), gas costs are higher due to actual cryptographic computation, and your contract must inherit SepoliaConfig instead of mock configuration. The deployment flow: first, develop and test everything with mock FHE using Hardhat's local network. Write comprehensive tests that exercise all FHE operations, ACL patterns, and edge cases. Once your mock tests pass, deploy to Sepolia with --network sepolia and validate against the real coprocessor. Expect slower execution and occasionally different gas behavior. Always test with mock first to catch logic errors quickly, then validate on Sepolia to catch coprocessor-specific issues.",
        insight:
          "Mock FHE is your development environment — it's instant and deterministic. Sepolia with the real coprocessor is your staging environment. Never skip the mock step.",
        code: `<span class="cm">// hardhat.config.js — network configuration</span>
networks: {
  hardhat: {
    <span class="cm">// Mock FHE — instant, for development</span>
  },
  sepolia: {
    url: process.env.<span class="fn">SEPOLIA_RPC</span>,
    accounts: [process.env.<span class="fn">PRIVATE_KEY</span>],
    <span class="cm">// Real coprocessor — operations take 10-30s</span>
  }
}

<span class="cm">// Deploy script</span>
<span class="kw">const</span> Payroll = <span class="kw">await</span> ethers.<span class="fn">getContractFactory</span>(<span class="str">"PayrollVault"</span>);
<span class="kw">const</span> payroll = <span class="kw">await</span> Payroll.<span class="fn">deploy</span>();
console.<span class="fn">log</span>(<span class="str">"Deployed to:"</span>, payroll.target);`,
        codeFilename: "hardhat.config.js",
        quiz: [
          {
            question:
              "What's the main difference between mock FHE and the real coprocessor?",
            options: [
              "They're functionally identical",
              "Mock only works with euint8 types",
              "Mock is instant and deterministic; real coprocessor has latency and costs more gas",
              "Mock is more secure than the real coprocessor",
            ],
            correct: 2,
            explanation:
              "Mock FHE provides instant, deterministic results for fast development. The real coprocessor on Sepolia processes operations in 10-30s with higher gas costs.",
          },
        ],
      },
    ],
  },
];

const TOTAL_LESSONS = 13;

/* ═══════════════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════════════ */

export default function CurriculumPage() {
  const { markComplete, isComplete, getWeekProgress } = useProgress();
  const [expandedLessons, setExpandedLessons] = useState({});
  const [mobileWeek, setMobileWeek] = useState(0);
  const [dismissedContinue, setDismissedContinue] = useState(false);
  const containerRef = useFadeIn(expandedLessons);
  const weekRefs = useRef({});
  const lessonRefs = useRef({});

  /* count completed */
  const completedCount = WEEKS.reduce(
    (acc, week) =>
      acc + week.lessons.filter((l) => isComplete(l.id)).length,
    0
  );
  const overallPercent = Math.round((completedCount / TOTAL_LESSONS) * 100);

  /* find first incomplete lesson */
  const nextLesson = useMemo(() => {
    for (const week of WEEKS) {
      for (const lesson of week.lessons) {
        if (!isComplete(lesson.id)) {
          return { lesson, weekTitle: week.title };
        }
      }
    }
    return null;
  }, [isComplete]);

  /* toggle lesson */
  const toggleLesson = useCallback((id) => {
    setExpandedLessons((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  /* scroll to week */
  const scrollToWeek = useCallback((weekId) => {
    const el = weekRefs.current[weekId];
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  }, []);

  /* scroll to lesson + expand it */
  const scrollToLesson = useCallback((lessonId) => {
    setExpandedLessons((prev) => ({ ...prev, [lessonId]: true }));
    setDismissedContinue(true);
    requestAnimationFrame(() => {
      const el = lessonRefs.current[lessonId];
      if (el) {
        const y = el.getBoundingClientRect().top + window.scrollY - 100;
        window.scrollTo({ top: y, behavior: "smooth" });
      }
    });
  }, []);

  return (
    <div className="curriculum-page" ref={containerRef}>
      {/* ── Header ── */}
      <header className="cur-header">
        <div className="container">
          <DecryptText
            text="Curriculum"
            as="h1"
            className="cur-title"
            delay={0}
            duration={1000}
          />
          <p className="cur-subtitle">
            4 weeks. 13 lessons. From zero to production-grade confidential
            smart contracts.
          </p>
          {nextLesson && completedCount > 0 && !dismissedContinue && (
            <div className="cur-continue">
              <div className="cur-continue-inner">
                <div className="cur-continue-text">
                  <span className="cur-continue-label">Continue where you left off</span>
                  <span className="cur-continue-lesson">
                    {nextLesson.lesson.num} &mdash; {nextLesson.lesson.title}
                  </span>
                </div>
                <button
                  className="btn-primary cur-continue-btn"
                  onClick={() => scrollToLesson(nextLesson.lesson.id)}
                >
                  Continue
                </button>
                <button
                  className="cur-continue-dismiss"
                  onClick={() => setDismissedContinue(true)}
                  aria-label="Dismiss"
                >
                  &times;
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* ── Two-column layout ── */}
      <div className="container cur-layout">
        {/* ── Sidebar ── */}
        <aside className="cur-sidebar">
          <div className="cur-sidebar-inner">
            {/* overall progress */}
            <div className="cur-overall">
              <span className="cur-overall-label">
                {completedCount}/{TOTAL_LESSONS} Lessons Complete
              </span>
              <div className="cur-overall-bar">
                <div
                  className="cur-overall-fill"
                  style={{ width: `${overallPercent}%` }}
                />
              </div>
            </div>

            {/* week nav */}
            <nav className="cur-week-nav">
              {WEEKS.map((week) => {
                const wp = getWeekProgress(week.id, week.lessons.length);
                return (
                  <button
                    key={week.id}
                    className="cur-week-btn"
                    onClick={() => scrollToWeek(week.id)}
                  >
                    <ProgressCircle percent={wp.percent} />
                    <div className="cur-week-btn-text">
                      <span className="cur-week-btn-num">
                        Week {week.number}
                      </span>
                      <span className="cur-week-btn-title">
                        {week.title}
                      </span>
                      <span className="cur-week-btn-count">
                        {wp.completed}/{wp.total} lessons
                      </span>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* ── Mobile week selector ── */}
        <div className="cur-mobile-selector">
          {WEEKS.map((week, i) => (
            <button
              key={week.id}
              className={`cur-mobile-week${mobileWeek === i ? " active" : ""}`}
              onClick={() => {
                setMobileWeek(i);
                scrollToWeek(week.id);
              }}
            >
              W{week.number}
            </button>
          ))}
        </div>

        {/* ── Main content ── */}
        <main className="cur-main">
          {WEEKS.map((week) => {
            const wp = getWeekProgress(week.id, week.lessons.length);
            return (
              <section
                key={week.id}
                className="cur-week-section fade-in"
                ref={(el) => (weekRefs.current[week.id] = el)}
              >
                {/* week header */}
                <div className="cur-week-header">
                  <div className="cur-week-header-top">
                    <span className="cur-week-number">
                      Week {String(week.number).padStart(2, "0")}
                    </span>
                    <span
                      className={`cur-week-badge${
                        wp.percent === 100 ? " complete" : ""
                      }`}
                    >
                      {wp.percent === 100
                        ? "Complete"
                        : `${wp.completed}/${wp.total}`}
                    </span>
                  </div>
                  <h2 className="cur-week-title">{week.title}</h2>
                  <p className="cur-week-subtitle">{week.subtitle}</p>
                </div>

                {/* lessons */}
                <div className="cur-lessons">
                  {week.lessons.map((lesson) => {
                    const isExpanded = !!expandedLessons[lesson.id];
                    const done = isComplete(lesson.id);
                    return (
                      <div
                        key={lesson.id}
                        ref={(el) => (lessonRefs.current[lesson.id] = el)}
                        className={`cur-lesson${isExpanded ? " expanded" : ""}${
                          done ? " completed" : ""
                        }`}
                      >
                        {/* lesson header (click to toggle) */}
                        <button
                          className="cur-lesson-header"
                          onClick={() => toggleLesson(lesson.id)}
                          aria-expanded={isExpanded}
                        >
                          <span className="cur-lesson-num">{lesson.num}</span>
                          <span className="cur-lesson-title">
                            {lesson.title}
                          </span>
                          <span className="cur-lesson-status">
                            {done && (
                              <span className="cur-lesson-check">
                                &#10003;
                              </span>
                            )}
                            <span
                              className={`cur-lesson-chevron${
                                isExpanded ? " open" : ""
                              }`}
                            >
                              &#9662;
                            </span>
                          </span>
                        </button>

                        {/* lesson body */}
                        <div
                          className="cur-lesson-body"
                          style={{
                            maxHeight: isExpanded ? "4000px" : "0",
                          }}
                        >
                          <div className="cur-lesson-inner">
                            {/* objectives */}
                            <div className="cur-objectives">
                              <h4 className="cur-section-label">
                                Learning Objectives
                              </h4>
                              <ul className="cur-obj-list">
                                {lesson.objectives.map((obj, i) => (
                                  <li key={i} className="cur-obj-item">
                                    <span className="cur-obj-bullet" />
                                    {obj}
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* content */}
                            <div className="cur-content-block">
                              <p className="cur-content-text">
                                {lesson.content}
                              </p>
                            </div>

                            {/* code example */}
                            <CodeBlock
                              code={lesson.code}
                              language="solidity"
                              filename={lesson.codeFilename}
                            />

                            {/* key insight */}
                            <div className="cur-insight">
                              <span className="cur-insight-label">
                                Key Insight
                              </span>
                              <p className="cur-insight-text">
                                {lesson.insight}
                              </p>
                            </div>

                            {/* quiz */}
                            <Quiz
                              questions={lesson.quiz}
                              lessonId={lesson.id}
                              onPass={() => {}}
                            />

                            {/* mark complete */}
                            <div className="cur-complete-row">
                              {done ? (
                                <span className="cur-done-label">
                                  Lesson complete
                                </span>
                              ) : (
                                <button
                                  className="btn-primary cur-complete-btn"
                                  onClick={() => markComplete(lesson.id)}
                                >
                                  Mark as Complete
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}

          {/* ── Completion Celebration ── */}
          {completedCount === TOTAL_LESSONS && (
            <div className="cur-completion fade-in visible">
              <div className="cur-completion-inner">
                <DecryptText
                  text="VAULT UNLOCKED"
                  as="span"
                  className="cur-completion-tag"
                  delay={200}
                  duration={1500}
                />
                <h2 className="cur-completion-title">
                  You've completed the entire curriculum.
                </h2>
                <p className="cur-completion-text">
                  13 lessons. 4 weeks of FHE mastery. You now have the knowledge
                  to build production-grade confidential smart contracts on
                  Zama's FHEVM — from encrypted tokens to dark pool AMMs to
                  multi-contract payroll systems.
                </p>
                <p className="cur-completion-text">
                  The next step is yours: pick a homework assignment, clone the
                  Hardhat template, and start building. The infrastructure is
                  ready. So are you.
                </p>
                <div className="cur-completion-actions">
                  <a
                    href="https://github.com/zama-ai/fhevm-hardhat-template"
                    target="_blank"
                    rel="noreferrer"
                    className="btn-primary"
                  >
                    Clone Template & Build
                  </a>
                  <a href="/homework" className="btn-outline">
                    View Homework Specs
                  </a>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
