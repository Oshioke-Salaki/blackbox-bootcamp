import { useRef, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./VideoScriptPage.css";

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

const SCRIPT_SEGMENTS = [
  {
    time: "0:00 – 0:30",
    label: "The Hook & Opening Statement",
    type: "camera",
    visual:
      "On camera: high-energy opener. Cut to split screen: a standard Etherscan block explorer vs. a mock encrypted one showing only ciphertext blobs.",
    script: `[Looking directly at camera, energetically]

"Everyone in this room knows that Ethereum is transparent. Open up Etherscan and you can see exactly what Alice paid Bob — down to the last wei. Every salary transaction, every medical DAO vote, every private deal... completely public.

The infrastructure to fix this has been live for over a year. Zama's Fully Homomorphic Encryption Virtual Machine — fhEVM — lets you compute directly on encrypted data, on-chain, without ever decrypting it.

Today, I'm introducing the FHEVM Blackbox Bootcamp — a production-ready, 4-week developer program to take any Solidity developer from zero to shipping production-grade confidential dApps."`,
    notes:
      "Energy matters in the first 30 seconds. Smile. Make eye contact. Do NOT read from a script — memorize this opening or speak from genuine enthusiasm.",
  },
  {
    time: "0:30 – 1:30",
    label: "Curriculum Overview",
    type: "slides",
    visual:
      "Clean animated timeline — 4 weekly cards slide in from left, each labeled with the week title and homework project name.",
    script: `[Cut to screen recording of curriculum page]

"The bootcamp runs 4 weeks, and the progression is intentional — no fluff, no padding.

Week 1: We break the mental model. Standard Solidity thinks in plaintexts. fhEVM thinks in ciphertexts. Students write their first confidential ERC20 token where every balance is an encrypted value, and transfers silently no-op instead of reverting when the balance is too low. That 'No Revert' rule is the first paradigm shift, and we teach it through code, not whitepapers. Contracts inherit ZamaEthereumConfig — one line that wires the entire FHE coprocessor.

Week 2: We master the full FHE operation set — arithmetic, comparisons, boolean algebra on encrypted values. The homework is a Dark Pool AMM where trade size and slippage tolerance are fully encrypted. MEV bots see nothing.

Week 3: We answer the question every student asks after Week 1: 'If everything is encrypted, how does a user see their own balance?' We teach both public decryption (FHE.makePubliclyDecryptable for revealing auction winners) and private user decryption via the @zama-fhe/relayer-sdk. By Thursday, students are generating encrypted payloads from the browser with a single createInstance(SepoliaConfig) call.

And Week 4 is the capstone: a Confidential Mass-Payroll system. Three contracts, Sepolia deployment, 10-plus test cases. The employer knows total budget; employees only see their own salary. Completely private, completely verifiable."`,
    notes:
      "Use smooth screen transitions between the 4 week slides. Each week should have a 2-second dedicated frame so viewers can read the title. Keep your narration paced — don't rush.",
  },
  {
    time: "1:30 – 3:30",
    label: "Sample Lesson Walkthrough — Week 1, Lesson 1.3",
    type: "screen",
    visual:
      'VS Code side by side: left panel shows "broken" standard Solidity ERC20 with require() statement; right panel shows the corrected fhEVM version with FHE.select.',
    script: `[Cut to full screen VS Code]

"Let me show you exactly how we teach Week 1. Take a look at this transfer function from a standard ERC20.

[Highlight standard require() line]
require(balances[msg.sender] >= amount, 'Insufficient balance');

In a normal Ethereum transaction, if Alice doesn't have enough balance, this line throws. The transaction reverts. And here's the problem — that revert is a signal. An observer on the mempool now knows: Alice's balance is below that specific amount. Data leaked. Privacy destroyed.

Now watch what we do on fhEVM.

[Switch to fhEVM version]
First, the contract inherits ZamaEthereumConfig — a single line that wires the FHE coprocessor. Then we replace uint256 with euint64 — an encrypted 64-bit integer. Users provide their transfer amounts as externalEuint64 values, and we call FHE.fromExternal() to validate the ZK proof.

We can't require() on encrypted data, because the EVM doesn't know the plaintext.

Instead, we create an encrypted boolean mask using FHE.le — 'less than or equal' — which returns an ebool. Then we feed that mask into FHE.select.

[Highlight FHE.select block]
FHE.select takes three arguments: the encrypted condition, the 'if true' value, and the 'if false' value. Both values are computed. Only one is selected — silently, indistinguishably.

The transaction always succeeds. Gas cost is identical whether the transfer executed or not. An observer learns nothing.

This is the shift we spend Week 1 internalizing. And once students get it — you can see it on their face in the Discord — they start seeing the world differently. Every conditional becomes a mask. Every business rule becomes an encrypted boolean."`,
    notes:
      "This is the most important segment. Practice the VS Code demo at least 3 times. Have both files open and tabbed before recording. Use a minimal text editor theme (dark mode, large font) for clarity.",
  },
  {
    time: "3:30 – 4:40",
    label: "Homework Design Philosophy",
    type: "slides",
    visual:
      "Animated diagram: Spec → Starter Repo → Code → Hardhat Tests → Automated Grading. Then transition to a mock Discord channel showing student submissions.",
    script: `[Cut to slide with grading diagram]

"Every homework assignment in this bootcamp is test-driven. There are no multiple-choice questions, no essays. Every rubric criterion maps to a specific named Hardhat test.

If your tests pass, you pass. It's deterministic, auditable, and scales to cohorts of ten thousand without any manual grading bottleneck.

[Cut to slide showing the 2-tier grading]
We use a two-tier rubric. 'Pass' criteria are the core skills — every student who does the reading can achieve these. 'Excellent' criteria require going deeper — edge cases, gas optimization, frontend integration. This design creates a floor that's achievable and a ceiling that challenges the best engineers.

[Cut to scenario description for payroll]
The scenarios are drawn from real-world problems. Week 4's Confidential Payroll isn't a toy — it's the exact architecture that a fintech company could use to run anonymous payroll on a blockchain: public total budget, private individual salaries, on-chain proof of solvency.

We deliberately chose DeFi, HR, and auction use cases because they hit the industries where privacy is not a nice-to-have — it's a regulatory requirement.

The instructor hub includes automated grading scripts, common mistake playbooks from prior cohorts, and solution repositories released post-deadline. This bootcamp is ready to run — today."`,
    notes:
      "Keep this segment punchy — don't slow down here. The viewer should feel the momentum building toward the close.",
  },
  {
    time: "4:40 – 5:00",
    label: "The Close",
    type: "camera",
    visual:
      "Back on camera. Arc shot closing on face. Final frame: FHEVM Blackbox Bootcamp logo with tagline.",
    script: `[Back to camera — calm, confident, direct]

"The infrastructure for confidential blockchains is here. The protocol is live, the tooling is mature, and the coprocessor is running on Sepolia today.

What's missing are the builders who know how to use it.

The FHEVM Blackbox Bootcamp is that bridge. Four weeks. Four projects. One complete engineer who can ship production-grade confidential dApps on the Zama Protocol.

Let's build in the dark."

[Hold for 2 seconds. Fade to logo.]`,
    notes:
      'Do not rush the final line. "Let\'s build in the dark." — pause for 1 beat before and after. Slow blink or slight nod sells confidence. This is your brand closing line.',
  },
];

const PRODUCTION_TIPS = [
  {
    icon: "🎥",
    tip: "Use OBS or Loom for screen recordings. Set resolution to 1920×1080 at 60fps.",
  },
  {
    icon: "🎙",
    tip: "Use a USB condenser microphone (e.g., Blue Yeti, Audio-Technica AT2020). Audio quality matters more than video.",
  },
  {
    icon: "💡",
    tip: "Film the camera segments with a ring light at eye level. Soft, even lighting beats expensive cameras.",
  },
  {
    icon: "🖥",
    tip: "For VS Code demos: use a dark theme (Dracula or Tokyo Night), font size 18+, and hide all sidebars and toolbars.",
  },
  {
    icon: "✂️",
    tip: "Edit in DaVinci Resolve (free). Cut all pauses > 0.5 seconds and clean up filler words. Target 4:45 runtime.",
  },
  {
    icon: "📝",
    tip: "Add subtitles. DaVinci's Magic Mask auto-generates them. Subtitles boost engagement by 40% on any platform.",
  },
];

export default function VideoScriptPage() {
  const ref = useFadeIn();
  const [activeSeg, setActiveSeg] = useState(null);

  const totalTime = "5:00";

  return (
    <div className="page video-script-page" ref={ref}>
      <section className="vs-header">
        <div className="container">
          <span className="tag tag-orange fade-in">
            Demonstration Video Script
          </span>
          <h1 className="section-title fade-in" style={{ marginTop: 16 }}>
            5-Minute Demo Video
            <br />
            <span className="glow-text">Full Script & Director Notes</span>
          </h1>
          <p className="section-sub fade-in">
            Production-ready script for your bootcamp demonstration video.
            Includes exact dialogue, visual direction, and instructor notes for
            every segment. Total runtime: {totalTime}.
          </p>
          <div className="vs-meta fade-in">
            <div className="vs-meta-item">
              <span>⏱</span> Total Runtime: {totalTime}
            </div>
            <div className="vs-meta-item">
              <span>🎥</span> 5 Segments
            </div>
            <div className="vs-meta-item">
              <span>📍</span> 3 Visual Modes (Camera / Screen / Slides)
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <div className="container">
        <div className="timeline-bar fade-in">
          {SCRIPT_SEGMENTS.map((s, i) => (
            <button
              key={i}
              className={`timeline-seg${activeSeg === i ? " active" : ""}`}
              onClick={() => setActiveSeg(activeSeg === i ? null : i)}
            >
              <span className="seg-time">{s.time}</span>
              <span className="seg-label">{s.label}</span>
              <span className={`seg-type seg-type-${s.type}`}>
                {s.type === "camera"
                  ? "📷 Camera"
                  : s.type === "screen"
                    ? "🖥 Screen"
                    : "📊 Slides"}
              </span>
            </button>
          ))}
        </div>

        <div className="script-segments">
          {SCRIPT_SEGMENTS.map((seg, i) => (
            <div
              key={i}
              className={`script-segment fade-in${activeSeg !== null && activeSeg !== i ? " dimmed" : ""}`}
            >
              <div className="segment-header">
                <div>
                  <span className="seg-time-badge">{seg.time}</span>
                  <h3 className="segment-title">{seg.label}</h3>
                </div>
                <span className={`mode-badge mode-${seg.type}`}>
                  {seg.type === "camera"
                    ? "📷 On Camera"
                    : seg.type === "screen"
                      ? "🖥 Screen Recording"
                      : "📊 Slides / Animation"}
                </span>
              </div>

              <div className="visual-direction">
                <span className="vd-label">🎬 Visual Direction</span>
                <p>{seg.visual}</p>
              </div>

              <div className="script-text">
                <span className="script-label">🎙️ Script</span>
                <pre className="script-pre">{seg.script}</pre>
              </div>

              <div className="director-note">
                <span className="dn-label">🎭 Director Note</span>
                <p>{seg.notes}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Production tips */}
        <section className="production-tips fade-in">
          <h2 className="inst-section-title" style={{ marginBottom: 24 }}>
            📹 Production Tips
          </h2>
          <div className="grid-2">
            {PRODUCTION_TIPS.map((t, i) => (
              <div key={i} className="prod-tip-card glass-card">
                <span style={{ fontSize: 24, marginRight: 12 }}>{t.icon}</span>
                <p>{t.tip}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="vs-footer fade-in">
          <Link to="/instructor" className="btn-outline">
            ← Instructor Hub
          </Link>
          <Link to="/" className="btn-primary">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
