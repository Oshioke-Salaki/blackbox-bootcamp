import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import "./CurriculumPage.css";

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

const WEEKS_DATA = [
  {
    id: "week1",
    number: "01",
    color: "cyan",
    title: "The FHE Paradigm Shift",
    tagline: "Environment Setup & Encrypted Types",
    overview: `Week 1 begins with the most important conceptual shift in this bootcamp: understanding that Fully Homomorphic Encryption doesn't just hide data at rest — it allows the network to compute on encrypted data without ever decrypting it. This is fundamentally different from ZK proofs (which prove you know something) and from traditional encryption (which can't be computed on). Once this mental model clicks, everything else follows naturally.`,
    objectives: [
      "Explain the difference between FHE, ZK proofs, and traditional encryption",
      "Set up the Zama fhEVM Hardhat development environment and inherit ZamaEthereumConfig",
      "Understand and use the core encrypted types: euint8, euint16, euint32, euint64, euint128, euint256, ebool, eaddress",
      "Write your first confidential smart contract that hides token balances",
      'Understand and implement the "No Revert" rule using FHE.select',
      "Use isInitialized() to safely validate encrypted variable state",
      "Run the mock FHE environment for fast local testing",
    ],
    lessons: [
      {
        num: "1.1",
        title: "Introduction to Confidential dApps",
        time: "45 min",
        desc: "Master logic: Host Chain (Sepolia) vs Gateway (ChainID 10901). We begin by dismantling the 'Public Ledger' myth and explaining why true on-chain privacy is the final frontier of Web3. Students learn the high-level architecture of how Zama's FHE coprocessor executes encrypted logic while the host chain remains the source of truth.",
        notes: `Instructor: Start with a provocative question — "If I told you that yesterday you sent $50,000 to this address, and anyone can see that — how do you feel?" Use block explorer screenshots of real mainnet transactions. The emotional impact is immediate and sets up the entire course motivation.`,
      },
      {
        num: "1.2",
        title: "Encrypted Types Deep Dive",
        time: "40 min",
        desc: "Hands-on exploration of euint8 through euint256, ebool, and eaddress. We cover declaration, initialization from plaintext (FHE.asEuint64), and initialization from user-supplied encrypted input via externalEuint64 + FHE.fromExternal(). Critical: contracts must inherit ZamaEthereumConfig for proper coprocessor wiring. The isInitialized() helper prevents operating on unset encrypted variables.",
        code: `import "@fhevm/solidity/lib/FHE.sol";
import "@fhevm/solidity/config/ZamaEthereumConfig.sol";

// Inherit ZamaEthereumConfig — wires the FHE coprocessor automatically
contract MyContract is ZamaEthereumConfig {
  euint64  private _balance;
  ebool    private _isKycVerified;
  eaddress private _hiddenRecipient;

  // Expert Secret: Always verify handles are initialized
  function updateValue(euint64 newValue) external {
    if (FHE.isInitialized(newValue)) {
      _value = newValue;
      FHE.allowThis(_value);
    }
  }

  // Initializing from plaintext (admin/owner only)
  function init() external onlyOwner {
    _balance = FHE.asEuint64(1000);
    FHE.allowThis(_balance);         // grant the contract compute access
  }

  // Initializing from user-supplied encrypted input
  // externalEuint64 is the new type — replaces the old 'einput' type
  function deposit(externalEuint64 encAmount, bytes calldata proof) external {
    // FHE.fromExternal validates the ZK proof and returns a euint64 handle
    euint64 amount = FHE.fromExternal(encAmount, proof);

    // isInitialized: check before operating on handle
    if (FHE.isInitialized(_balance)) {
      _balance = FHE.add(_balance, amount);
    } else {
      _balance = amount;
    }
    FHE.allowThis(_balance);         // re-grant after mutation
    FHE.allow(_balance, msg.sender); // depositor can view their balance
  }
}`,
        notes:
          "Instructor: Key change from older FHEVM: the input type is now externalEuint64 (not 'einput'), and FHE.fromExternal() replaces TFHE.asEuint64(einput, proof). Also always emphasize ZamaEthereumConfig — without it, FHE.setCoprocessor is never called and FHE operations silently fail on testnet.",
      },
      {
        num: "1.3",
        title: 'The "No Revert" Rule — FHE.select',
        time: "50 min",
        desc: `This is the most critical lesson in Week 1. In standard Solidity, you might write: require(balance >= amount). In fhEVM, this pattern leaks data — a transaction revert tells an observer "the balance was too low." Instead, we use FHE.select to conditionally update state without branching. The transaction always succeeds; it simply does nothing if the condition is false.`,
        code: `// ❌ WRONG — leaks information via revert
function badTransfer(euint64 amount) internal {
  ebool sufficient = FHE.le(amount, _balance);
  // You cannot require() on an ebool!
  // Even if you could: a revert reveals balance < amount
}

// ✅ CORRECT — silent, private, no information leak
function transfer(address to, externalEuint64 encAmount, bytes calldata proof) external {
  euint64 amount    = FHE.fromExternal(encAmount, proof);
  ebool sufficient  = FHE.le(amount, _balance);

  // Sender: subtract if sufficient, else keep unchanged
  _balance = FHE.select(
    sufficient,
    FHE.sub(_balance, amount),
    _balance
  );
  // Recipient: add if sufficient, else unchanged
  _balances[to] = FHE.select(
    sufficient,
    FHE.add(_balances[to], amount),
    _balances[to]
  );
  // Re-grant ACL after every FHE mutation
  FHE.allowThis(_balance);
  FHE.allow(_balances[to], to);
  // Transaction always succeeds — no revert, no leak
}`,
        notes:
          'Instructor: The "No Revert" rule is counterintuitive and takes 20 minutes to internalize. Run a live demo showing gas on both paths — identical gas proves the EVM sees no difference. Also note: FHE.allowThis() is shorthand for FHE.allow(handle, address(this)), a new convenience function in the current library.',
      },
      {
        num: "1.4",
        title: "Hardhat + fhEVM Mock Environment Setup",
        time: "45 min",
        desc: "Step-by-step environment configuration. Students clone the official Zama Hardhat template, configure the mocked FHE library (which allows instant local testing without the coprocessor), and run their first test against a simple counter contract.",
        code: `# 1. Clone the official Zama FHEVM Hardhat template
git clone https://github.com/zama-ai/fhevm-hardhat-template.git
cd fhevm-hardhat-template && npm install

# 2. Run the pre-built tests (mock FHE mode — instant, no coprocessor)
npx hardhat test

# 3. For Sepolia: set Hardhat configuration variables
npx hardhat vars set MNEMONIC        # 12-word wallet seed phrase
npx hardhat vars set INFURA_API_KEY  # from Infura dashboard

# 4. Deploy to Sepolia (fhEVM host chain — chainId 11155111)
npx hardhat deploy --network sepolia

# Every contract must inherit ZamaEthereumConfig:
# import "@fhevm/solidity/config/ZamaEthereumConfig.sol";
# contract MyContract is ZamaEthereumConfig { ... }`,
        notes:
          "Instructor: Allocate 20 extra minutes for setup issues. Common blockers: (1) Node.js odd version — use v18.x or v20.x only; Hardhat doesn't support v21/v23. (2) Missing MNEMONIC or INFURA_API_KEY — use 'npx hardhat vars set' not .env files. (3) Forgetting the ZamaEthereumConfig inheritance — silent failures on testnet result.",
      },
    ],
    homework: {
      title: "Confidential ERC20 Token (ConfToken)",
      level: "Pass / Excellent",
      time: "3–5 hours",
      desc: "Modify a standard ERC20 to use encrypted balances and encrypted transfer amounts. Implement the full transfer lifecycle without any state-leaking reverts.",
      starter:
        "https://github.com/zama-ai/fhevm-hardhat-template/tree/main/contracts",
      grading: [
        {
          criterion: "Compiles without errors using fhEVM library",
          points: 15,
          level: "Pass",
        },
        {
          criterion: "All plaintext `uint256` balances replaced with `euint64`",
          points: 15,
          level: "Pass",
        },
        {
          criterion: "transfer() uses FHE.select — no reverts on low balance",
          points: 20,
          level: "Pass",
        },
        {
          criterion: "Hardhat tests pass: deposit, transfer, balance check",
          points: 20,
          level: "Pass",
        },
        {
          criterion:
            "transferFrom() correctly handles allowances in encrypted form",
          points: 15,
          level: "Excellent",
        },
        {
          criterion:
            "FHE.allow() / FHE.allowThis() grants correct ACL permissions to sender and recipient",
          points: 15,
          level: "Excellent",
        },
      ],
    },
  },
  {
    id: "week2",
    number: "02",
    color: "purple",
    title: "Advanced Encrypted Logic",
    tagline: "Arithmetic, Comparisons & Masked Control Flow",
    overview: `Week 2 takes the paradigm shift from Week 1 and operationalizes it. Students master the full arithmetic and comparison API of the FHE Solidity library, then tackle the hardest challenge in confidential computing: implementing conditional logic that never bifurcates execution. We apply these skills to build a simplified Dark Pool AMM — one of the most commercially significant use cases for FHE in DeFi.`,
    objectives: [
      "Use the full FHE arithmetic suite: add, sub, mul, div, rem, neg, not",
      "Use all comparison operators: eq, ne, lt, le, gt, ge",
      "Compose encrypted boolean conditions using FHE.and, FHE.or, FHE.xor",
      "Implement safe encrypted arithmetic without silent overflow",
      "Design state machines where all transitions are controlled by FHE.select",
      "Understand gas cost differentials between different FHE operations",
    ],
    lessons: [
      {
        num: "2.1",
        title: "The Complete TFHE Arithmetic API",
        time: "40 min",
        desc: "Systematic coverage of all arithmetic operations. Students learn that FHE arithmetic operates identically to Solidity arithmetic — with the same overflow behavior — but on ciphertexts. Special attention to FHE.neg (two's complement) and FHE.not (bitwise NOT), which are often overlooked.",
        code: `euint64 a = FHE.asEuint64(100);
euint64 b = FHE.asEuint64(30);

euint64 sum  = FHE.add(a, b);   // 130
euint64 diff = FHE.sub(a, b);   // 70
euint64 prod = FHE.mul(a, b);   // 3000  ← expensive!
euint64 div  = FHE.div(a, b);   // 3
euint64 rem  = FHE.rem(a, b);   // 10

// Bitwise operations
euint64 andOp = FHE.and(a, b);
euint64 orOp  = FHE.or(a, b);
euint64 xorOp = FHE.xor(a, b);
euint64 negA  = FHE.neg(a);    // two's complement
euint64 notA  = FHE.not(a);    // bitwise NOT

// Casting between encrypted and larger types
ebool   flag = FHE.asEbool(a);    // euint64 → ebool
euint128 big = FHE.asEuint128(a); // widen to 128-bit (available!)`,
        notes:
          "Instructor: Show gas benchmarks! FHE.mul is 3–5x more expensive than FHE.add. Students should minimize multiplications. Also note that euint128 and euint256 are available — important for the Week 4 payroll capstone where salary × employees could overflow uint64.",
      },
      {
        num: "2.2",
        title: "Encrypted Comparisons & Boolean Algebra",
        time: "45 min",
        desc: "All comparisons return ebool — an encrypted boolean. These can be combined with FHE.and, FHE.or, FHE.xor to build complex conditions. The key insight: you can compose arbitrarily complex logic without ever branching execution. The result is always a single ebool passed to FHE.select.",
        code: `euint64 price = ...; euint64 maxSlippage = ...; euint64 reserve = ...;

// Complex condition without any branching
ebool priceOk   = FHE.le(price, maxSlippage);
ebool reserveOk = FHE.ge(reserve, price);
ebool bothOk    = FHE.and(priceOk, reserveOk);

// Execute trade only if both conditions are met
euint64 newReserve = FHE.select(
  bothOk,
  FHE.sub(reserve, price),
  reserve    // unchanged if conditions not met
);

// FHE.select always evaluates BOTH branches — the selection is hidden
// This is fundamentally different from if/else — no path is revealed`,
        notes:
          "Instructor: This pattern is the backbone of every complex confidential contract. Spend 15 extra minutes having students write their own compound conditions on a whiteboard before touching code.",
      },
      {
        num: "2.3",
        title: "Overflow Safety & Encrypted Range Checks",
        time: "35 min",
        topics: [
          "FHE.add, sub, mul, div, rem",
          "FHE.le, lt, ge, gt, eq, ne",
          "Secure Encrypted Randomness (FHE.rand)",
          "Dark Pool AMM mechanics",
        ],
        desc: "FHE operations silently wrap on overflow (like unchecked Solidity). Students learn to use FHE.le to pre-validate that addition will not overflow, then use FHE.select to gate the update. These safe wrappers are essential for production payroll and DeFi contracts.",
        code: `// Safe add: only keep result if it didn't overflow
function safeAdd(euint64 a, euint64 b) internal returns (euint64) {
  euint64 result  = FHE.add(a, b);
  ebool   wrapped = FHE.lt(result, a); // if result < a, it wrapped
  return FHE.select(wrapped, a, result); // keep original on overflow
}

// Safe sub: only subtract if balance is sufficient
function safeSub(euint64 a, euint64 b) internal returns (euint64) {
  ebool sufficient = FHE.le(b, a);
  return FHE.select(sufficient, FHE.sub(a, b), a);
}`,
        notes:
          "Instructor: Ask students why overflow wraps instead of reverts. Answer: the EVM cannot know the plaintext to decide whether to revert — there is no plaintext available at compute time. This is why defensive encrypted math matters.",
      },
      {
        num: "2.4",
        title: "Dark Pool AMM Architecture",
        time: "60 min",
        desc: "Apply everything from 2.1–2.3 to design a confidential token swap. In a Dark Pool, the trade size, direction, and slippage tolerance are all encrypted. This prevents MEV bots from front-running trades (they cannot see the price impact). We design the reserve update logic using masked arithmetic.",
        code: `struct Pool {
  euint64 reserveA;   // encrypted reserve of Token A
  euint64 reserveB;   // encrypted reserve of Token B
}

function swap(
  externalEuint64 encAmountIn, // user-provided encrypted input (new type)
  bytes calldata  proof,        // ZK knowledge proof
  bool            aToB
) external {
  // FHE.fromExternal: validates proof and returns a usable euint64
  euint64 amount = FHE.fromExternal(encAmountIn, proof);

  // Constant product formula: Δy = y * Δx / (x + Δx)
  euint64 poolIn  = aToB ? pool.reserveA : pool.reserveB;
  euint64 poolOut = aToB ? pool.reserveB : pool.reserveA;

  euint64 numerator   = FHE.mul(poolOut, amount);
  euint64 denominator = FHE.add(poolIn, amount);
  euint64 amountOut   = FHE.div(numerator, denominator);

  // Validity guard — no revert, uses FHE.select silently
  ebool valid = FHE.and(
    FHE.gt(amountOut, FHE.asEuint64(0)),
    FHE.le(amountOut, poolOut)
  );

  if (aToB) {
    pool.reserveA = FHE.select(valid, FHE.add(pool.reserveA, amount),    pool.reserveA);
    pool.reserveB = FHE.select(valid, FHE.sub(pool.reserveB, amountOut), pool.reserveB);
  } else {
    pool.reserveB = FHE.select(valid, FHE.add(pool.reserveB, amount),    pool.reserveB);
    pool.reserveA = FHE.select(valid, FHE.sub(pool.reserveA, amountOut), pool.reserveA);
  }
  FHE.allowThis(pool.reserveA);
  FHE.allowThis(pool.reserveB);
}`,
        notes:
          'Instructor: The Dark Pool AMM is the killer app example. Before showing code, ask: "How do MEV bots extract value in a normal DEX?" (front-run via mempool). Then reveal: with externalEuint64 inputs, the bot cannot see the amount until finalization — too late to front-run.',
      },
    ],
    homework: {
      title: "Dark Pool AMM — Simplified",
      level: "Pass / Excellent",
      time: "4–6 hours",
      desc: "Build a single-pair confidential token swap contract where both the input amount and slippage tolerance are encrypted. The contract must update reserves correctly without leaking trade direction information.",
      starter: "https://github.com/zama-ai/fhevm-hardhat-template",
      grading: [
        {
          criterion: "Pool initialization with encrypted reserves",
          points: 10,
          level: "Pass",
        },
        {
          criterion:
            "swap() accepts externalEuint64 input + FHE.fromExternal() proof validation",
          points: 20,
          level: "Pass",
        },
        {
          criterion: "Constant-product formula computed on euint64 values",
          points: 20,
          level: "Pass",
        },
        {
          criterion:
            "Invalid swaps silently no-op (no revert, no state change)",
          points: 20,
          level: "Pass",
        },
        {
          criterion: "Encrypted slippage tolerance guards the amountOut",
          points: 15,
          level: "Excellent",
        },
        {
          criterion: "Comprehensive Hardhat tests covering edge cases",
          points: 15,
          level: "Excellent",
        },
      ],
    },
  },
  {
    id: "week3",
    number: "03",
    color: "orange",
    title: "Access Control & the dApp Frontend",
    tagline: "Decryption, ACL Permissions & the Relayer SDK",
    overview: `Week 3 answers the question every student has been asking since Week 1: "If everything is encrypted, how does a user ever see their own balance?" The answer is the Relayer SDK's user decryption flow and Gateway public decryption. We cover both mechanisms in depth, then wire a complete browser-based frontend using @zama-fhe/relayer-sdk to generate FHE-valid encrypted inputs and decrypt user-private state. By the end of the week, students can build end-to-end confidential dApps.`,
    objectives: [
      "Understand the dual-chain architecture: host chain (Sepolia) and Gateway chain (chainId 10901)",
      "Implement all three ACL permission tiers: FHE.allow() (permanent), FHE.allowTransient() (gas-optimized), FHE.makePubliclyDecryptable()",
      "Understand user decryption (private, via Relayer) vs public decryption (on-chain Gateway)",
      "Initialize @zama-fhe/relayer-sdk with SepoliaConfig and encrypt inputs client-side",
      "Build a complete Blind Auction with an interactive frontend script",
      "Use FHE.isSenderAllowed() and FHE.isAllowed() to verify access at runtime",
    ],
    lessons: [
      {
        num: "3.1",
        title: "Decryption Mechanisms: Gateway vs Re-encryption",
        time: "50 min",
        desc: 'Two distinct decryption paths exist in fhEVM: Gateway decryption (async, for contract-triggered reveals — e.g., revealing the auction winner) and Re-encryption (synchronous, user-facing — e.g., "show me my balance"). Students learn which to use and when.',
        code: `// Gateway Decryption — contract triggers, async (for revealing state publicly)
import "fhevm/gateway/GatewayCaller.sol";

contract BlindAuction is GatewayCaller {
  euint64 private highestBid;
  
  function revealWinner() external onlyOwner {
    // Request decryption via the Gateway coprocessor
    uint256[] memory cts = new uint256[](1);
    cts[0] = Gateway.toUint256(highestBid);
    uint256 reqId = Gateway.requestDecryption(cts, this.fulfillDecryption.selector, 0, block.timestamp + 100, false);
  }

  function fulfillDecryption(uint256 /*reqId*/, uint64 plainBid) public onlyGateway {
    // Gateway resolved — now we have the plaintext
    emit AuctionEnded(winner, plainBid);
  }
}`,
        notes:
          "Instructor: Spend 10 minutes on the trust model. The Gateway is a decentralized key management network. It only decrypts when the contract explicitly authorizes it. This is not a backdoor — it is the designed public reveal mechanism.",
      },
      {
        num: "3.2",
        title:
          "ACL Permission Tiers: allow, allowTransient, makePubliclyDecryptable",
        time: "40 min",
        desc: "The ACL has three distinct tiers: FHE.allow() is permanent (stored in the ACL contract). FHE.allowTransient() is gas-optimized using EIP-1153 transient storage — valid only within the current transaction. FHE.makePubliclyDecryptable() allows any entity to decrypt off-chain via the Relayer.",
        code: `mapping(address => euint64) private _balances;

function mint(address to, uint64 amount) external onlyOwner {
  _balances[to] = FHE.asEuint64(amount);

  // PERMANENT ACL: persists across transactions
  FHE.allow(_balances[to], to);     // recipient can view balance
  FHE.allowThis(_balances[to]);     // contract can compute on it
}

function transfer(address to, externalEuint64 encAmount, bytes calldata proof) external {
  euint64 amount = FHE.fromExternal(encAmount, proof);

  // TRANSIENT: valid only within this tx (gas-optimized)
  FHE.allowTransient(amount, address(this));

  // ... compute updated balances ...

  // After updating: always re-grant PERMANENT ACL
  FHE.allow(_balances[msg.sender], msg.sender);
  FHE.allow(_balances[to], to);
  FHE.allowThis(_balances[msg.sender]);
  FHE.allowThis(_balances[to]);
}

// Runtime ACL verification:
bool senderOk = FHE.isSenderAllowed(_balances[msg.sender]);
bool aliceOk  = FHE.isAllowed(_balances[alice], alice);`,
        notes:
          "Instructor: The most common bug is forgetting FHE.allowThis() after any FHE mutation. Every FHE.add/sub/select call produces a NEW handle — the old permissions do NOT transfer. This is the #1 source of mysterious test failures. Transient ACL (EIP-1153) is new and a significant gas win for same-tx cross-contract patterns.",
      },
      {
        num: "3.3",
        title: "@zama-fhe/relayer-sdk: Encrypting Inputs & User Decryption",
        time: "55 min",
        desc: "Students integrate the official @zama-fhe/relayer-sdk into a Node.js/browser script. They learn to initialize an FhevmInstance using SepoliaConfig (one-liner), create an encrypted input buffer, and decrypt user-private state via instance.userDecrypt().",
        code: `import { createInstance, SepoliaConfig } from "@zama-fhe/relayer-sdk";
import { ethers } from "ethers";

async function encryptAndSubmit(contractAddress, abi, amount) {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer   = await provider.getSigner();
  const userAddr = await signer.getAddress();

  // SepoliaConfig has all addresses baked in — no manual config
  const instance = await createInstance(SepoliaConfig);

  // Create encrypted input buffer and add a 64-bit value
  const buffer = instance.createEncryptedInput(contractAddress, userAddr);
  buffer.add64(BigInt(amount));
  // .encrypt() uploads ciphertext via Relayer, returns handles
  const { handles, inputProof } = await buffer.encrypt();

  // handles[0] maps to externalEuint64 on the Solidity side
  const contract = new ethers.Contract(contractAddress, abi, signer);
  await contract.bid(handles[0], inputProof);
}

// USER DECRYPTION — private read of own encrypted state
async function readMyBalance(contractAddress, balanceHandle) {
  const instance  = await createInstance(SepoliaConfig);
  const keypair   = instance.generateKeypair();
  const provider  = new ethers.BrowserProvider(window.ethereum);
  const signer    = await provider.getSigner();

  const startTs  = Math.floor(Date.now() / 1000).toString();
  const duration = '10';
  const eip712   = instance.createEIP712(
    keypair.publicKey, [contractAddress], startTs, duration
  );
  const signature = await signer.signTypedData(
    eip712.domain,
    { UserDecryptRequestVerification: eip712.types.UserDecryptRequestVerification },
    eip712.message
  );
  const result = await instance.userDecrypt(
    [{ handle: balanceHandle, contractAddress }],
    keypair.privateKey, keypair.publicKey,
    signature.replace('0x',''),
    [contractAddress], signer.address, startTs, duration
  );
  return result[balanceHandle]; // plaintext — only visible to this user
}`,
        notes:
          'Instructor: Live code this in VS Code with the class. Have a Sepolia testnet contract already deployed. Highlight the DX improvement: SepoliaConfig replaces 8 manual config lines with one import. The "wow" moment is when students see their encrypted bid on Etherscan as an opaque hex blob.',
      },
      {
        num: "3.4",
        title: "Blind Auction Architecture & Implementation",
        time: "75 min",
        desc: "Students build a complete blind auction from scratch: encrypted bid submission, tracking the highest bid without revealing it, and Gateway-triggered reveal at auction close. We also implement the re-encryption endpoint so bidders can verify their own bid was recorded.",
        notes:
          "Instructor: This is the longest lesson. Consider splitting into two sessions. The first session covers the Solidity contract; the second covers the @zama-fhe/relayer-sdk Node.js bidding script. Students often confuse FHE.makePubliclyDecryptable() (on-chain auth) with the actual decryption (off-chain Relayer call). Clarify these are two separate steps.",
      },
    ],
    homework: {
      title: "Confidential Blind Auction",
      level: "Pass / Excellent",
      time: "5–7 hours",
      desc: "Build a complete sealed-bid auction on fhEVM. Bids must be submitted as externalEuint64 inputs, the highest bid tracked confidentially, and the winner revealed via FHE.makePubliclyDecryptable() at auction close. Include a @zama-fhe/relayer-sdk frontend script.",
      starter: "https://github.com/zama-ai/fhevm-hardhat-template",
      grading: [
        {
          criterion:
            "bid() uses externalEuint64 + FHE.fromExternal() and stores correctly",
          points: 20,
          level: "Pass",
        },
        {
          criterion:
            "Highest bid tracked via FHE.select — no individual bids revealed",
          points: 20,
          level: "Pass",
        },
        {
          criterion:
            "revealWinner() calls FHE.makePubliclyDecryptable() correctly",
          points: 20,
          level: "Pass",
        },
        {
          criterion:
            "ACL: FHE.allow() + FHE.allowThis() correctly scoped after every update",
          points: 15,
          level: "Pass",
        },
        {
          criterion:
            "Working @zama-fhe/relayer-sdk script using SepoliaConfig to submit encrypted bid",
          points: 15,
          level: "Excellent",
        },
        {
          criterion:
            "userDecrypt() endpoint lets bidders privately verify their recorded bid",
          points: 10,
          level: "Excellent",
        },
      ],
    },
  },
  {
    id: "week4",
    number: "04",
    color: "cyan",
    title: "Production Architecture & Capstone",
    tagline: "Gas Optimization, Multi-Contract Design & Deployment",
    overview: `The final week synthesizes everything into a production-grade capstone. Students learn to make architectural decisions — what to encrypt, what to leave public, and how to minimize the FHE compute overhead that drives gas costs. We also cover multi-contract patterns, the coprocessor model for cross-chain confidentiality, and end-to-end deployment on the Sepolia testnet. The Capstone — a Confidential Mass-Payroll System — is a complete, employer-grade dApp.`,
    objectives: [
      "Benchmark and minimize FHE gas costs via selective encryption",
      "Design multi-contract fhEVM architectures with shared encrypted state",
      "Deploy production contracts to Sepolia with proper secret management",
      "Build a comprehensive Hardhat test suite with 100% branch coverage",
      "Understand the Zama coprocessor model for cross-chain confidentiality",
      "Ship a full capstone: Confidential Mass-Payroll System",
    ],
    lessons: [
      {
        num: "4.1",
        title: "EIP-1153 & Transient ACL Optimization",
        time: "45 min",
        desc: "Deep dive into gas optimization. Graduates learn to use FHE.allowTransient() which leverages EIP-1153 transient storage. This allows granting permissions that automatically expire at the end of the transaction, saving significant gas compared to permanent ACL storage.",
        code: `// Multi-contract call pattern
function secureProcess(euint64 data) external {
    // Grant transient access to the library/helper contract
    // Costs ~10x less gas than FHE.allow()
    FHE.allowTransient(data, address(logicLibrary));
    
    logicLibrary.compute(data);
    // Permission is automatically cleared by the EVM after tx
}`,
        notes:
          "Instructor: This is the 'Expert' differentiator. Show the gas difference between a Week 1 permanent FHE.allow and a Week 4 transient FHE.allowTransient. It teaches students to think about the ACL as a resource to be managed, not just a checkbox.",
      },
      {
        num: "4.2",
        title: "Multi-Contract & Coprocessor Architecture",
        time: "40 min",
        desc: "Real-world dApps are not monolithic. Students design a payroll system as three contracts: a PayrollVault(holds encrypted funds), a SalaryRegistry (stores encrypted salary mappings), and an EmployeeAuth (manages decryption permissions). They learn how handles are shared across contracts using FHE.allow() and FHE.allowTransient().",
        code: `// Grant another contract permanent access to a ciphertext handle
// FHE.allow() accepts both user addresses AND contract addresses
FHE.allow(_salaries[employee], address(salaryRegistry));

// For same-transaction cross-contract calls: use allowTransient (cheaper)
FHE.allowTransient(_salaries[employee], address(payrollVault));

// Verify a contract has permission before operating:
bool hasAccess = FHE.isAllowed(_salaries[employee], address(salaryRegistry));

// In SalaryRegistry: protect getter with isInitialized + isSenderAllowed
function getSalary(address employee) external view returns (euint64) {
  require(FHE.isInitialized(_salaries[employee]), "Salary not set");
  require(FHE.isSenderAllowed(_salaries[employee]), "Access denied");
  return _salaries[employee];
}`,
        notes:
          "Instructor: Draw the multi-contract architecture on a whiteboard first. Key point: FHE.allowTransient is transient (EIP-1153) — it vanishes after the transaction. FHE.allow is permanent, stored in the ACL contract. Use allowTransient for internal calls, allow for persistent cross-contract state.",
      },
      {
        num: "4.3",
        title: "End-to-End Deployment on Sepolia",
        time: "60 min",
        desc: "Students deploy the full payroll system to Sepolia (the fhEVM host chain, chainId 11155111). Covers Hardhat configuration variables for secure secret management (no .env files), deploy scripts, Etherscan verification, and initializing the Relayer SDK for production.",
        code: `// hardhat.config.js — Sepolia fhEVM host chain
networks: {
  sepolia: {
    url: \`https://sepolia.infura.io/v3/\${vars.get("INFURA_API_KEY")}\`,
    accounts: { mnemonic: vars.get("MNEMONIC") }, // Hardhat vars, not .env!
    chainId: 11155111,
  },
},

// Set secrets with Hardhat Configuration Variables:
// npx hardhat vars set MNEMONIC
// npx hardhat vars set INFURA_API_KEY

// Deploy and verify
// npx hardhat deploy --network sepolia
// npx hardhat verify --network sepolia <ADDR> <ARGS>

// Client-side: one-liner init with SepoliaConfig (includes Relayer URL)
import { createInstance, SepoliaConfig } from "@zama-fhe/relayer-sdk";
const instance = await createInstance(SepoliaConfig);
// SepoliaConfig: chainId=11155111, gatewayChainId=10901, relayer=testnet.zama.org`,
        notes:
          "Instructor: Pre-fund student wallets with Sepolia ETH before class. The faucet can be slow — use the official Infura Sepolia faucet. Important: use Hardhat vars (not .env) for secrets in Hardhat projects — they are stored securely outside the project and never committed.",
      },
    ],
    homework: {
      title: "🏆 Capstone: Confidential Mass-Payroll System",
      level: "Scored 0–100",
      time: "8–12 hours",
      desc: "Build a production-grade confidential payroll system where employer deposits are public (for transparency), individual employee salaries are fully encrypted (for privacy), and employees can withdraw their allocation without revealing other employees' salaries.",
      starter: "https://github.com/zama-ai/fhevm-hardhat-template",
      grading: [
        {
          criterion: "PayrollVault: employer can deposit and fund the contract",
          points: 10,
          level: "Functionality",
        },
        {
          criterion:
            "SalaryRegistry: employer can set encrypted salary for each employee",
          points: 15,
          level: "Functionality",
        },
        {
          criterion:
            "Employee can call withdraw() to receive their encrypted allocation",
          points: 15,
          level: "Functionality",
        },
        {
          criterion:
            "Employees cannot read or compute on other employees' salaries",
          points: 20,
          level: "Security",
        },
        {
          criterion:
            "FHE.allow() / FHE.allowThis() correctly scoped — no over-permissioning",
          points: 10,
          level: "Security",
        },
        {
          criterion:
            "Selective encryption: only salary amounts are euint, rest is plaintext",
          points: 10,
          level: "Optimization",
        },
        {
          criterion: "Comprehensive Hardhat test suite (>10 test cases)",
          points: 10,
          level: "Tests",
        },
        {
          criterion: "Deployed to Sepolia with verified contract",
          points: 10,
          level: "Deployment",
        },
      ],
    },
  },
];

export default function CurriculumPage() {
  const [activeWeek, setActiveWeek] = useState(0);
  const [openLesson, setOpenLesson] = useState(null);
  const ref = useFadeIn(activeWeek);

  const week = WEEKS_DATA[activeWeek];

  useEffect(() => {
    setOpenLesson(null);
  }, [activeWeek]);

  // Handle hash navigation
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const idx = WEEKS_DATA.findIndex((w) => `#${w.id}` === hash);
      if (idx !== -1) setActiveWeek(idx);
    }
  }, []);

  return (
    <div className="page curriculum-page" ref={ref}>
      {/* Page Header */}
      <section className="curriculum-header">
        <div className="container">
          <span className="tag tag-purple fade-in">4-Week Curriculum</span>
          <h1
            className="section-title fade-in"
            style={{ marginTop: 16, fontSize: "clamp(32px, 6vw, 56px)" }}
          >
            Complete Lesson Plan &<br />
            <span className="glow-text">Learning Objectives</span>
          </h1>
          <p className="section-sub fade-in">
            Each week includes detailed lesson plans with instructor notes,
            estimated time commitments, hands-on code examples, and graded
            homework assignments. Designed for both cohort and self-paced
            learners.
          </p>
          <div className="curriculum-meta fade-in">
            <div className="meta-chip">📅 4 Weeks Total</div>
            <div className="meta-chip">⏱ ~26+ Hours of Learning</div>
            <div className="meta-chip">🧪 4 Homework Projects</div>
            <div className="meta-chip">🏆 1 Capstone Project</div>
          </div>
        </div>
      </section>

      {/* Week Tabs */}
      <div className="week-tabs-wrapper">
        <div className="container">
          <div className="week-tabs">
            {WEEKS_DATA.map((w, i) => (
              <button
                key={w.id}
                className={`week-tab week-tab-${w.color}${activeWeek === i ? " active" : ""}`}
                onClick={() => setActiveWeek(i)}
              >
                <span className="tab-num">Week {w.number}</span>
                <span className="tab-title">{w.title}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Week Content */}
      <div className="container week-content">
        {/* Overview */}
        <div
          className={`week-overview-card glass-card fade-in border-${week.color}`}
        >
          <div className="week-overview-header">
            <div>
              <div className={`week-label week-label-${week.color}`}>
                Week {week.number}
              </div>
              <h2>{week.title}</h2>
              <p className="week-tagline">{week.tagline}</p>
            </div>
            <div className="week-overview-meta">
              <div>
                <span>📚</span> {week.lessons.length} Lessons
              </div>
              <div>
                <span>⏱</span> {week.homework.time}
              </div>
              <div>
                <span>🧪</span> {week.homework.title}
              </div>
            </div>
          </div>
          <p className="week-overview-text">{week.overview}</p>
        </div>

        {/* Objectives */}
        <div className="fade-in">
          <h3 className="content-heading">🎯 Learning Objectives</h3>
          <div className="objectives-list">
            {week.objectives.map((obj, i) => (
              <div key={i} className="objective-item">
                <span className={`obj-num obj-num-${week.color}`}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span>{obj}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Lessons Accordion */}
        <div className="fade-in">
          <h3 className="content-heading">📖 Lesson Plans</h3>
          <div className="lessons-list">
            {week.lessons.map((lesson, i) => (
              <div
                key={i}
                className={`accordion-item${openLesson === i ? " open" : ""}`}
              >
                <div
                  className="accordion-header"
                  onClick={() => setOpenLesson(openLesson === i ? null : i)}
                >
                  <div className="lesson-header-content">
                    <span className={`lesson-num lesson-num-${week.color}`}>
                      {lesson.num}
                    </span>
                    <div>
                      <div className="lesson-title">{lesson.title}</div>
                      <div className="lesson-time">⏱ {lesson.time}</div>
                    </div>
                  </div>
                  <span className="chevron">▾</span>
                </div>
                <div
                  className={`accordion-body${openLesson === i ? " open" : ""}`}
                >
                  <p
                    style={{
                      color: "var(--text-secondary)",
                      lineHeight: 1.7,
                      marginBottom: lesson.code || lesson.notes ? 20 : 0,
                    }}
                  >
                    {lesson.desc}
                  </p>
                  {lesson.code && (
                    <div className="code-block" style={{ marginBottom: 20 }}>
                      <pre
                        style={{
                          whiteSpace: "pre-wrap",
                          color: "var(--text-primary)",
                        }}
                      >
                        {lesson.code}
                      </pre>
                    </div>
                  )}
                  {lesson.notes && (
                    <div className="instructor-note">
                      <span className="note-label">🎓 Instructor Note</span>
                      <p>{lesson.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Homework */}
        <div className={`hw-card glass-card fade-in border-${week.color}`}>
          <div className="hw-header">
            <div>
              <span
                className={`tag tag-${week.color === "cyan" ? "cyan" : week.color === "purple" ? "purple" : "orange"}`}
              >
                Homework Assignment
              </span>
              <h3 className="hw-title">{week.homework.title}</h3>
              <p className="hw-desc">{week.homework.desc}</p>
            </div>
            <div className="hw-meta">
              <div>
                <span className="meta-label">Time Estimate</span>
                <strong>{week.homework.time}</strong>
              </div>
              <div>
                <span className="meta-label">Grading</span>
                <strong>{week.homework.level}</strong>
              </div>
              <a
                href={week.homework.starter}
                target="_blank"
                rel="noreferrer"
                className="btn-outline"
                style={{ fontSize: 13 }}
              >
                Get Starter Repo →
              </a>
            </div>
          </div>

          <h4
            style={{
              marginBottom: 14,
              color: "var(--text-secondary)",
              fontSize: 13,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            Grading Rubric
          </h4>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Criterion</th>
                  <th>Points</th>
                  <th>Level</th>
                </tr>
              </thead>
              <tbody>
                {week.homework.grading.map((g, i) => (
                  <tr key={i}>
                    <td>{g.criterion}</td>
                    <td>
                      <strong style={{ color: "var(--cyan)" }}>
                        {g.points}
                      </strong>
                    </td>
                    <td>
                      <span
                        className={`tag ${g.level === "Pass" || g.level === "Functionality" ? "tag-cyan" : g.level === "Excellent" || g.level === "Security" ? "tag-purple" : g.level === "Optimization" ? "tag-orange" : "tag-cyan"}`}
                        style={{ fontSize: 11 }}
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
                      {week.homework.grading.reduce((s, g) => s + g.points, 0)}
                    </strong>
                  </td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Nav */}
        <div className="week-nav fade-in">
          <button
            className="btn-outline"
            onClick={() => setActiveWeek(Math.max(0, activeWeek - 1))}
            disabled={activeWeek === 0}
          >
            ← Previous Week
          </button>
          <Link to="/homework" className="btn-outline">
            View All Homework Specs
          </Link>
          <button
            className="btn-primary"
            onClick={() =>
              setActiveWeek(Math.min(WEEKS_DATA.length - 1, activeWeek + 1))
            }
            disabled={activeWeek === WEEKS_DATA.length - 1}
          >
            Next Week →
          </button>
        </div>
      </div>
    </div>
  );
}
