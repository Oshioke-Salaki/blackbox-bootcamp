import { Link } from "react-router-dom";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <span className="footer-logo">
            <span
              style={{
                color: "var(--cyan)",
                filter: "drop-shadow(0 0 6px var(--cyan))",
              }}
            >
              ⬡
            </span>{" "}
            FHEVM <span className="glow-text">Blackbox</span> Bootcamp
          </span>
          <p>Build in the Dark. Execute in the Light.</p>
          <p className="footer-tagline">
            A production-ready 4-week curriculum for confidential dApp
            development on the Zama Protocol.
          </p>
        </div>

        <div className="footer-links-group">
          <span className="footer-label">Curriculum</span>
          <Link to="/curriculum">All 4 Weeks</Link>
          <Link to="/curriculum#week1">Week 1 – Fundamentals</Link>
          <Link to="/curriculum#week2">Week 2 – Advanced Logic</Link>
          <Link to="/curriculum#week3">Week 3 – dApp Frontend</Link>
          <Link to="/curriculum#week4">Week 4 – Capstone</Link>
        </div>

        <div className="footer-links-group">
          <span className="footer-label">Resources</span>
          <Link to="/homework">Homework Specs</Link>
          <Link to="/instructor">Instructor Hub</Link>
          <Link to="/video-script">Video Script</Link>
          <a href="https://docs.zama.ai/fhevm" target="_blank" rel="noreferrer">
            Zama Docs ↗
          </a>
          <a
            href="https://github.com/zama-ai/fhevm-hardhat-template"
            target="_blank"
            rel="noreferrer"
          >
            Hardhat Template ↗
          </a>
        </div>

        <div className="footer-links-group">
          <span className="footer-label">Community</span>
          <a href="https://discord.gg/zama" target="_blank" rel="noreferrer">
            Discord ↗
          </a>
          <a
            href="https://twitter.com/zama_fhe"
            target="_blank"
            rel="noreferrer"
          >
            Twitter / X ↗
          </a>
          <a href="https://github.com/zama-ai" target="_blank" rel="noreferrer">
            GitHub ↗
          </a>
          <a href="https://www.zama.ai/blog" target="_blank" rel="noreferrer">
            Blog ↗
          </a>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <span>© 2026 FHEVM Blackbox Bootcamp. Powered by Zama Protocol.</span>
          <span className="footer-credits">
            Designed for the Zama Developer Bootcamp Challenge
          </span>
        </div>
      </div>
    </footer>
  );
}
