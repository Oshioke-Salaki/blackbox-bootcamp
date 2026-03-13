import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
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
        title: "The FHE Coprocessor Paradigm",
        time: "55 min",
        desc: `Stop thinking of the EVM as a general-purpose CPU. In FHEVM, think of the EVM as a "Host" that delegates hard crypto math to a "Coprocessor" (The Gateway). 

### How it Works:
1. **The Handle**: When you work with a 'euint64', you aren't holding a number; you're holding a **pointer** (a handle) to a ciphertext stored in the Coprocessor's memory.
2. **The Execution**: You tell the Coprocessor: "Add handle A and handle B." It performs the math in its secure environment and returns a **NEW handle C**.
3. **The Result**: The EVM only sees A, B, and C. They are just opaque hex strings to the EVM. It can move them, store them, or send them—but it can NEVER look inside them.`,
        notes: `Instructor: This is the most important mental model shift. Use an analogy: It's like a blind accountant. You (the EVM) give them two sealed envelopes (handles), they do the math without opening them, and give you back a third sealed envelope (the result). You know the envelopes contain data, but you never see the numbers.

**Key Learning Objective**: By the end of this lesson, students should be able to explain why 'euint64' is technically a bytes32 pointer and why 'msg.sender' is the only thing the EVM actually "knows" for sure.`,
      },
      {
        num: "1.2",
        title: "Encrypted Primitives & Lifecycle",
        time: "60 min",
        desc: `Every confidential variable goes through a rigorous lifecycle. You cannot just "make a number private."

### The Three States of Data:
1. **Plaintext (uint64)**: Visible to everyone. Used for non-sensitive data (timestamps, ID numbers).
2. **External Ciphertext (externalEuint64)**: Data incoming from a user. It comes with a **ZK-Proof** that proves the user knows the number and it's within bounds (e.g., fits in 64 bits).
3. **Internal Handle (euint64)**: Validated data ready for math.

### Implementation Checklist:
- [ ] Must inherit 'ZamaEthereumConfig' (Initializes the coprocessor link).
- [ ] Use 'FHE.fromExternal(input, proof)' to bridge from User to Contract.
- [ ] Use 'FHE.allowThis(handle)' to grant the contract permission to use the handle in the next transaction.
- [ ] Use 'FHE.isInitialized(handle)' to prevent null-pointer errors in crypto math.`,
        code: `import "@fhevm/solidity/lib/FHE.sol";
import "@fhevm/solidity/config/ZamaEthereumConfig.sol";

contract DeepDive is ZamaEthereumConfig {
    euint64 private _secretVal;

    // STEP 1: Accepts ENCRYPTED input from user
    function secureInit(externalEuint64 encVal, bytes calldata proof) external {
        // STEP 2: Validation (ZK-Proof Check)
        // returns a handles (pointer) if proof is valid, else reverts
        euint64 validatedHandle = FHE.fromExternal(encVal, proof);

        // STEP 3: Initializing state
        // Always check if it's the first time
        if (!FHE.isInitialized(_secretVal)) {
            _secretVal = validatedHandle;
        } else {
             _secretVal = FHE.add(_secretVal, validatedHandle);
        }

        // STEP 4: ACL (Granting Permissions)
        // Without this, the contract can't use _secretVal in the NEXT call
        FHE.allowThis(_secretVal);
        
        // Grant sender the right to "view" their own encrypted state later
        FHE.allow(_secretVal, msg.sender);
    }
}`,
        notes: `Instructor: Focus on the "Double-Spend of Permissions". Students often think FHE.allow() is like a database permission. It's not. It's a cryptographic grant. 

Explain that every time _secretVal is updated (mutated), it gets a **NEW handle ID**. The old permission for the old ID is now useless. You MUST call FHE.allowThis() again after every update. No re-grant = silent failure.`,
      },
      {
        num: "1.3",
        title: "Programming Without Branches (FHE.select)",
        time: "60 min",
        desc: `The "No Revert" rule is the hardest bridge to cross. In Solidity, you write 'if (x > y) revert()'. In FHEVM, you cannot do this.

### Why? 
Because 'x > y' returns an 'ebool'. An 'ebool' is just another sealed envelope. The EVM cannot "open" the envelope to decide whether to revert. If you forced a revert based on an ebool, the miner would have to know the value, which breaks all privacy.

### The Solution: Deterministic State Updates
We update the state regardless, but we use 'FHE.select' to decide **which** value to store:
- If 'condition' is true -> store 'CalculatedNewValue'
- If 'condition' is false -> store 'OriginalOldValue' (effectively a no-op)

The gas cost is the same for both paths. Privacy is preserved perfectly.`,
        code: `function privateTransfer(address to, externalEuint64 encAmount, bytes calldata proof) external {
    euint64 amount = FHE.fromExternal(encAmount, proof);
    
    // Returns an encrypted boolean handle (the envelope)
    ebool hasFunds = FHE.le(amount, _balances[msg.sender]);

    // Update Sender: 
    // If hasFunds is true  -> _balances - amount
    // If hasFunds is false -> _balances (no change)
    _balances[msg.sender] = FHE.select(
        hasFunds, 
        FHE.sub(_balances[msg.sender], amount), 
        _balances[msg.sender]
    );

    // Update Recipient:
    _balances[to] = FHE.select(
        hasFunds, 
        FHE.add(_balances[to], amount), 
        _balances[to]
    );

    // MASTER RULE: Re-grant ACL after EVERY update
    FHE.allowThis(_balances[msg.sender]);
    FHE.allowThis(_balances[to]);
    
    // We also grant the users access to view their new balances
    FHE.allow(_balances[msg.sender], msg.sender);
    FHE.allow(_balances[to], to);
}`,
        notes: `Instructor: This is a "Step-by-Step" live coding exercise. Write the "Standard Solidity" version with reverts first, then "Refactor" it live into the FHE.select pattern. Show the students that 'transfer' now NEVER fails. Not enough funds? The transaction succeeds, but the balance doesn't move. 

**Student Challenge**: Ask them how they would inform the user the transfer "failed" if the transaction succeeded. (Answer: They check their balance off-chain and see it didn't change).`,
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
        title: "The Math of Confidentiality",
        time: "55 min",
        desc: `Encryption usually makes numbers hard to use. Zama's FHE allows for full homomorphic arithmetic, but with a few "Expert" constraints.

### The Arithmetic Suite:
- **Cheap**: 'FHE.add', 'FHE.sub', 'FHE.not', 'FHE.and/or/xor' (Fastest).
- **Moderate**: 'FHE.mul' (Costly due to Noise Management).
- **Expensive**: 'FHE.div', 'FHE.rem' (Avoid inside large loops).
- **Secret Skill**: Bit-shifting logic via arithmetic.

### The Problem of "Noise":
Every time you perform 'FHE.mul', you add "Noise" to the ciphertext. Too much noise makes the handle unreadable. Zama handles "Bootstrap" logic automatically, but graduates must learn to minimize multiplications to keep gas costs low.`,
        code: `// Multi-tier arithmetic example
function calculateFee(euint64 amount, uint64 feeBps) external returns (euint64) {
    // 1. Plaintext + Encrypted interop is the most efficient
    // FHE.mul(euint64, uint64) is cheaper than FHE.mul(euint64, euint64)
    euint64 fee = FHE.div(FHE.mul(amount, feeBps), 10000);
    
    // 2. Safe subtraction (Prevention of underflow)
    ebool hasEnough = FHE.ge(amount, fee);
    return FHE.select(hasEnough, FHE.sub(amount, fee), FHE.asEuint64(0));
}`,
        notes: `Instructor: This is where we introduce the "Noise" concept. You don't need to be a cryptographer, but you must know that multiplications are "loud." 

**Student Challenge**: Ask them to refactor 'FHE.mul(x, 2)' into 'FHE.add(x, x)' and compare the gas cost. (Answer: Adding is significantly cheaper, and in FHE, bit-shifts aren't free like they are in Solidity).`,
      },
      {
        num: "2.2",
        title: "Compound Comparisons & Boolean Masking",
        time: "60 min",
        desc: `In FHE, boolean logic is the steering wheel. Since you can't use 'if' statements, you must "Mask" your data.

### Comparison Essentials:
- 'FHE.eq/ne' (Equality)
- 'FHE.lt/le/gt/ge' (Inequality)
- 'FHE.min/max' (Utility wrappers)

### Boolean Algebra:
Think of 'ebool' as a **filter**. You can stack conditions using bitwise operators ('&', '|', '^') to create highly complex decision trees that the miner can never see.`,
        code: `// Compound Logic without Branching
function validatePosition(euint64 price, euint64 collateral) external returns (ebool) {
    ebool isPriceStable = FHE.lt(price, FHE.asEuint64(10000));
    ebool isSolvent     = FHE.gt(collateral, FHE.mul(price, 150)); // 150% ratio
    
    // Compose the mask
    ebool isSafe = FHE.and(isPriceStable, isSolvent);
    
    // We don't revert. We return the mask.
    return isSafe;
}`,
        notes: `Instructor: Use a "Filtering" metaphor. Imagine three filters (boolean handles) stacked on top of each other. Only if light (the transaction) passes through all three do we update the final state. 

**Expert Tip**: Mention that 'FHE.asEbool()' exists, but most seniors prefer staying in 'euint' space using 0 and 1 for easier math integration.`,
      },
      {
        num: "2.3",
        title: "Safe Math & Noise Management",
        time: "50 min",
        desc: `FHE handles wrap on overflow silently (just like Solidity <0.8). However, because you can't 'assert()', you must build "Safe Proofs" into your math logic.

### Expert Patterns:
1. **Saturation**: If overflow occurs, return 'type(uint).max' instead of wrapping.
2. **Handle Re-use**: Avoid repeating the same math. Store the handle in a variable to save gas.
3. **Randomness**: Use 'FHE.rand()' for secure, private on-chain randomness if needed.`,
        code: `function safeAdd(euint64 a, euint64 b) internal returns (euint64) {
    euint64 res = FHE.add(a, b);
    // If res < a, it overflowed
    ebool overflowed = FHE.lt(res, a);
    
    return FHE.select(overflowed, FHE.asEuint64(type(uint64).max), res);
}`,
        notes: `Instructor: This lesson connects math to security. If a payroll contract overflows, someone's salary could wrap to 0. In FHE, this is a "Silent Failure." Always use saturation patterns in production.`,
      },
      {
        num: "2.4",
        title: "Dark Pool AMM: Secret Reserves",
        time: "75 min",
        desc: `Dark Pools are the "Grand Stage" for Week 2. We hide the Price, the Reserves, and the Volume.

### Why this changes DeFi:
In a public pool (Uniswap), bots see your swap and front-run you. In a Zama Dark Pool, the trade amount is a ciphertext. The bot doesn't know if you're buying or selling until the trade is already complete.

### Implementation Checklist:
- [x] 'x * y = k' check via FHE math.
- [x] 'externalEuint64' for private trade entry.
- [x] 'FHE.select' for reserve updates.`,
        code: `// Dark Pool: The Secret Swap
function swap(externalEuint64 encIn, bytes calldata proof) external {
    euint64 amountIn = FHE.fromExternal(encIn, proof);
    
    // Constant Product Math: dy = (y * dx) / (x + dx)
    euint64 amountOut = FHE.div(
        FHE.mul(_reserveY, amountIn), 
        FHE.add(_reserveX, amountIn)
    );

    // Slippage Guard (Silent)
    ebool ok = FHE.gt(amountOut, _minReceive);
    
    // Atomic Private Swaps
    _reserveX = FHE.add(_reserveX, amountIn);
    _reserveY = FHE.select(ok, FHE.sub(_reserveY, amountOut), _reserveY);
    
    // Re-grant ACL
    FHE.allowThis(_reserveX); FHE.allowThis(_reserveY);
}`,
        notes: `Instructor: This is the high point. Students often ask "How does the user get their tokens if the contract doesn't know how many to send?" 
        
Answer: The tokens *are* sent, but their balance is just another encrypted ciphertext handle. The user sees their balance change in Week 3's decryption lesson.`,
      },
      {
        num: "2.5",
        title: "Confidential Dutch Auctions",
        time: "60 min",
        desc: `Unlike Blind Auctions, Dutch Auctions have a descending price curve. In FHE, we hide the **Strike Price** and the **Bid Timing**.

### Expert Logic:
1. **Time-Variant Pricing**: The 'currentPrice' is a public function of block.timestamp.
2. **Encrypted Bids**: Bidders submit 'externalEuint64'.
3. **Atomic Settlement**: If 'bid >= currentPrice', the trade executes. This comparison happens in the Coprocessor using 'FHE.ge'.`,
        code: `// Dutch Auction: Descending Price Curve
function buyAtCurrentPrice(externalEuint64 encBid, bytes calldata proof) external {
    uint256 publicPrice = getCurrentPrice(); // Descending public curve
    euint64 bid = FHE.fromExternal(encBid, proof);
    
    // strike = (bid >= publicPrice)
    ebool isSuccessful = FHE.ge(bid, FHE.asEuint64(publicPrice));
    
    // Transfer logic gated by isSuccessful
    _balances[msg.sender] = FHE.select(isSuccessful, FHE.add(_balances[msg.sender], _amountToSell), _balances[msg.sender]);
    FHE.allowThis(_balances[msg.sender]);
}`,
        notes: `Instructor: This teaches students how to combine **Public State** (time-based price) with **Private State** (user bid). It's a hybrid model that is extremely gas-efficient.`,
      },
      {
        num: "2.6",
        title: "AMM Optimization: Plaintext Denominators",
        time: "55 min",
        desc: `Gas is war. 'FHE.div(euint64, euint64)' is significantly more expensive than 'FHE.div(euint64, uint64)'.

### The Professor's Trick:
If your denominator is a public constant (like a 3% fee or a fixed liquidity divisor), **never** cast it to an 'euint'. Use the plaintext version of the division operator. This can save up to 80% on the division's gas cost.`,
        code: `// ✓ CORRECT (Optimized)
euint64 result = FHE.div(encryptedNumerator, 100); 

// ✗ WRONG (Expensive)
euint64 result = FHE.div(encryptedNumerator, FHE.asEuint64(100));`,
        notes: `Instructor: This is a "Zama Pro" tip. Always look for ways to keep constants in plaintext. The Coprocessor optimizations for plaintext-operand operations are massive.`,
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
        title: "The Decryption Lifecycle",
        time: "55 min",
        desc: `Everything in FHE is encrypted by default. To see a value, you must explicitly "request" it. There are two paths:

### 1. User Decryption (Private)
- **Goal**: A user wants to see their own balance.
- **Mechanism**: Re-encryption.
- **Workflow**: User signs an EIP-712 request -> Relayer verifies the signature + ACL -> Relayer returns the plaintext to the user's browser.

### 2. Public Revelation (Gateway)
- **Goal**: Reveal the winner of an auction to everyone.
- **Mechanism**: FHE.makePubliclyDecryptable().
- **Workflow**: Contract authorizes a handle -> Anyone can now query the Relayer for the plaintext without a signature.`,
        code: `// Authorization for Public Reveal
function finalizeAuction(euint64 winningBid) external onlyOwner {
    // 1. Mark this specific handle as "Publicly Decryptable"
    // This doesn't reveal it instantly; it grants PERMISSION to reveal
    FHE.makePubliclyDecryptable(winningBid);
    
    // 2. Emit the handle so the frontend knows what to query
    emit WinnerRevealed(winningBid);
}`,
        notes: `Instructor: This is the "Security vs. Utility" balance. Explain that FHE.makePubliclyDecryptable() is a one-way street for that specific handle. 

**Expert Tip**: Students often confuse 'FHE.allow()' with 'FHE.makePubliclyDecryptable()'. Clarify: 'allow' is for specific addresses (Identity-based); 'makePubliclyDecryptable' is for the world (Access-based).`,
      },
      {
        num: "3.2",
        title: "ACL Permission Tiers",
        time: "60 min",
        desc: `Access Control Lists (ACL) are the gatekeepers of the Coprocessor. If the ACL says "No," the crypto math fails.

### The Three Tiers of Permission:
1. **Permanent (FHE.allow)**: Stored on-chain. Best for "persistent" data like user balances.
2. **Transient (FHE.allowTransient)**: Uses EIP-1153. Valid ONLY for the current transaction. **10x cheaper gas.**
3. **Internal (FHE.allowThis)**: Shorthand for granting the contract itself permission to compute on a handle.`,
        code: `// Expert Gas Optimization
function fastProcess(euint64 data) external {
    // ✗ Expensive: FHE.allow(data, address(this))
    
    // ✓ Professional: Valid only for this tx, saves massive gas
    FHE.allowTransient(data, address(this));
    
    _secretResult = FHE.add(data, _bonus);
    FHE.allowThis(_secretResult); // Re-grant for next tx
}`,
        notes: `Instructor: Spend 15 minutes on the "Permission Double-Spend" problem. If I give you a handle, and you mutate it (FHE.add), you get a NEW handle. Your old permission DOES NOT work on the new handle. 

**Student Challenge**: Why does FHE.allowTransient save gas? (Answer: It doesn't write to permanent storage state; it leaves the permission in the EVM's transient memory).`,
      },
      {
        num: "3.3",
        title: "@zama-fhe/relayer-sdk Mastery",
        time: "70 min",
        desc: `The Relayer SDK is the bridge between the User's Wallet and the FHE Coprocessor.

### Integration Steps:
1. **Initialize**: 'const instance = await createInstance(SepoliaConfig);'
2. **Encrypt**: Convert browser inputs into 'externalEuint64' payloads.
3. **Sign & Read**: Use EIP-712 to securely request a private read.

### The Decryption Buffer:
When a user requests a read, they provide a Public Key. The Relayer re-encrypts the result specifically for that key. Only the user with the corresponding Private Key can see the number.`,
        code: `// Frontend: Secure Private Read
async function getMyBalance(contractAddr, balanceHandle) {
    const instance = await createInstance(SepoliaConfig);
    const { publicKey, privateKey } = instance.generateKeypair();

    // 1. Create EIP-712 Signature (Wallet popup)
    const eip712 = instance.createEIP712(publicKey, [contractAddr]);
    const signature = await signer.signTypedData(...eip712);

    // 2. Fetch from Relayer
    const result = await instance.userDecrypt(
        [{ handle: balanceHandle, contractAddress: contractAddr }],
        privateKey, publicKey, signature
    );

    console.log("My Hidden Balance is:", result[balanceHandle]);
}`,
        notes: `Instructor: This is the first time students see "The Whole Loop." The 'wow' factor is high. 

**Expert Pitfall**: Remind students that 'SepoliaConfig' has the Gateway addresses baked in. If they move to a custom chain, they must provide those addresses manually.`,
      },
      {
        num: "3.4",
        title: "The WETH-FHE Pattern",
        time: "50 min",
        desc: `Native ETH is public. To make it private, we use a "Shielded Wrapper" (similar to WETH).

### The 2-Step Shielding Process:
1. **Wrap**: User sends public ETH to the contract; contract mints an equal amount of **encrypted** balance handles (euint64) back to the user.
2. **Unwrap**: User requests an unwrap; contract verifies the encrypted balance, burns it, and sends public ETH back.`,
        code: `// Shielding Native ETH
function wrap() external payable {
    require(msg.value > 0);
    // Mint encrypted balance to user
    euint64 amount = FHE.asEuint64(msg.value);
    _encBalances[msg.sender] = FHE.add(_encBalances[msg.sender], amount);
    
    // Grant permissions
    FHE.allow(_encBalances[msg.sender], msg.sender);
    FHE.allowThis(_encBalances[msg.sender]);
}

function unwrap(externalEuint64 encAmount, bytes calldata proof) external {
    euint64 amount = FHE.fromExternal(encAmount, proof);
    // ... verification & transfer logic ...
}`,
        notes: `Instructor: This is a foundational DeFi building block. Explain that 'Native ETH' cannot stay encrypted on-chain because its balances are part of the core EVM state. Only 'Handles' inside a contract can be private.`,
      },
      {
        num: "3.5",
        title: "Capstone: The Blind Auction Frontend",
        time: "75 min",
        desc: `We wire the Week 3 UI to the Week 2 Contract. 

### Features:
- **Hidden Bidding**: No one knows the current high bid.
- **Private Winner Reveal**: The winner is revealed only when the admin calls 'finalize'.
- **Bidders' Privacy**: Losing bidders never reveal their bid amounts, even after the auction ends.`,
        code: `// Full Lifecycle check
async function placeBid(amount) {
    const buffer = instance.createEncryptedInput(AUCTION_ADDR, userAddr);
    buffer.add64(amount);
    
    const { handles, inputProof } = await buffer.encrypt();
    
    // Calls the 'bid(externalEuint64, bytes)' function
    await auctionContract.bid(handles[0], inputProof);
}`,
        notes: `Instructor: Focus on UX. Because the transaction doesn't revert (No Revert rule), the frontend needs to "Listen" for events or simulate the state to show the user a "Pending" status. This is how you build professional FHE dApps.`,
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
        title: "EIP-1153 & Transient Gas Optimization",
        time: "60 min",
        desc: `FHE operations are expensive. A single 'FHE.add' can cost 100x more than a standard '+' in Solidity. To build production apps, you must master **Selective Encryption** and **Transient Storage**.

### EIP-1153: The FHE Game-Changer
Starting with Zama's latest releases, we leverage 'FHE.allowTransient()'. This uses EIP-1153 (Transient Storage) to grant permissions that vanish at the end of the transaction.

### Optimization Rules:
1. **Plaintext Metadata**: Don't encrypt the sender's address or the timestamp. It's usually not sensitive and wastes massive gas.
2. **Casting**: 'euint8' is cheaper than 'euint64'. Use the smallest type possible.
3. **Transient ACLs**: Always use 'FHE.allowTransient' for intermediate contract calls.`,
        code: `// Multi-Contract Gas Optimization
function executePayroll(address registry) external {
    euint64 salary = SalaryRegistry(registry).getSalary(msg.sender);
    
    // ✓ FAST: Grants permission only for this tx loop
    FHE.allowTransient(salary, address(this));
    
    _totalPaid = FHE.add(_totalPaid, salary);
    FHE.allowThis(_totalPaid);
}`,
        notes: `Instructor: This is the "Separating Pros from Amateurs" lesson. Show a gas report comparing 'FHE.allow' vs 'FHE.allowTransient'. The 10x savings is what makes complex DeFi possible on Zama. 

**Expert Tip**: Mention that 'FHE.allowTransient' requires Solidity 0.8.24+ to support the 'TSTORE' opcode.`,
      },
      {
        num: "4.2",
        title: "Multi-Contract Security & ACL Delegation",
        time: "60 min",
        desc: `Production dApps are decentralized across many contracts. Managing permissions across this mesh is the hardest part of FHE security.

### Transitive Permissions:
If Contract A has a handle, and sends it to Contract B, Contract B **cannot** use it unless:
1. Contract A calls 'FHE.allow(handle, address(B))'.
2. Or the User has pre-authorized Contract B.

### Security Checklist:
- [ ] Use 'FHE.isSenderAllowed(handle)' to prevent unauthorized contracts from "stealing" compute.
- [ ] Implement 'OnlyCoprocessor' modifiers for functions that receive Gateway results.`,
        code: `// Secure Multi-Contract Pattern
function processData(euint64 data) external {
    // 1. Verify the sender actually has access to this pointer
    // This prevents "Handle Probing" attacks
    require(FHE.isSenderAllowed(data), "Unauthorized Handle");

    // 2. Delegate to logic contract
    FHE.allowTransient(data, address(logicContract));
    logicContract.run(data);
}`,
        notes: `Instructor: Use a "Key and Lock" diagram. Just because I give you an envelope (handle) doesn't mean you have the key (ACL) to open it. Multi-contract security is about managing those cryptographic "delegations" safely.`,
      },
      {
        num: "4.3",
        title: "The Production Lifecycle: CI/CD & Faucets",
        time: "65 min",
        desc: `Deploying to Sepolia is different from local mock testing.

### Key Deployment Steps:
1. **Mnemonic Management**: Use 'npx hardhat vars' (NEVER .env).
2. **Sepolia Config**: 'chainId: 11155111'.
3. **Gateway Config**: 'chainId: 10901'.
4. **Relayer URL**: Zama's official testnet relayer (available in 'SepoliaConfig').`,
        code: `# Production Hardhat Deploy
npx hardhat vars set MNEMONIC "your twelve word..."
npx hardhat vars set INFURA_KEY "xyz..."

# Deploy to the Host Chain (Sepolia)
npx hardhat deploy --network sepolia`,
        notes: `Instructor: Finish the course by showing a live transaction on the Sepolia Explorer. Point out that the data is an 'Encrypted Input'.`,
      },
      {
        num: "4.4",
        title: "Institutional Standards: ERC7984 & ERC7821",
        time: "60 min",
        desc: `Professional FHE development requires following global standards to ensure wallet and explorer compatibility.

### ERC7984: The Confidential Token Standard
This is the equivalent of ERC20 but for FHE. It standardizes how 'view' functions interact with the Relayer and how 'allowances' are handled in encrypted space.

### ERC7821: The Executor Standard
Learn how to design contracts that allow third-party executors (Relayers) to submit FHE computations on behalf of users securely.`,
        code: `// ERC7984 Compliance: Forced Transfer for RWAs
function forceTransfer(address from, address to, euint64 amount) external onlyOwner {
    // 1. Verify compliance via encrypted checks
    // 2. Execute transfer using Admin ACL bypass
    _balances[from] = FHE.sub(_balances[from], amount);
    _balances[to] = FHE.add(_balances[to], amount);
    
    // Grant permissions back to the respective parties
    FHE.allow(_balances[from], from);
    FHE.allow(_balances[to], to);
}`,
        notes: `Instructor: This is the "Trillion Dollar" use case. Real World Assets (RWAs) require the issuer to have "Admin Overrides" for legal compliance (seizures/clawbacks). ERC7984 provides the blueprint for doing this without leaking the balance to the public.`,
      },
      {
        num: "4.5",
        title: "The Audit Hall of Shame: Anti-Patterns",
        time: "55 min",
        desc: `Security in FHE is counter-intuitive. Typical Solidity hacks don't apply, but "Data Leaks" are catastrophic.

### Top 3 FHE Anti-Patterns:
1. **The View-Function Leak**: Returning an encrypted handle in a public 'view' function that doesn't check for 'isSenderAllowed'.
2. **Handle Probing**: Allowing anyone to pass a handle to a function, which then updates state—allowing a malicious actor to "test" if a handle represents a certain value.
3. **Weak Re-encryption**: Using static keys for re-encryption instead of EIP-712 ephemeral keys.`,
        code: `// ✗ DANGEROUS ANTI-PATTERN
function getBalancePublic(address user) external view returns (euint64) {
    // VULNERABILITY: This returns a pointer to anyone.
    // If the Relayer isn't perfectly configured, this is a leak.
    return _balances[user];
}

// ✓ SECURE PATTERN
function getBalanceSecure(address user) external view returns (euint64) {
    require(FHE.isSenderAllowed(_balances[user]), "Identity Mismatch");
    return _balances[user];
}`,
        notes: `Instructor: This is the "Zama Professor's" favorite lesson. Spend the final hour doing a "Bug Bounty" on the whiteboard where you write faulty FHE code and have students find the privacy leak.`,
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
          <div className="week-overview-text">
            <ReactMarkdown>{week.overview}</ReactMarkdown>
          </div>
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
                  <div
                    className="lesson-desc"
                    style={{
                      color: "var(--text-secondary)",
                      lineHeight: 1.7,
                      marginBottom: lesson.code || lesson.notes ? 20 : 0,
                    }}
                  >
                    <ReactMarkdown>{lesson.desc}</ReactMarkdown>
                  </div>
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
                      <div className="note-text">
                        <ReactMarkdown>{lesson.notes}</ReactMarkdown>
                      </div>
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
              <div className="hw-description">
                <ReactMarkdown>{week.homework.desc}</ReactMarkdown>
              </div>
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
