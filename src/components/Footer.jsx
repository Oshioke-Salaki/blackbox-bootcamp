import { Link } from "react-router-dom";
import { useProgress } from "./ProgressContext";
import "./Footer.css";

export default function Footer() {
  const { resetProgress } = useProgress();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="footer-logo">
              <span className="brand-mark">BX</span>
              <span className="brand-text">Blackbox Bootcamp</span>
            </div>
            <p>
              The definitive 4-week program for building confidential smart
              contracts on Zama's FHEVM.
            </p>
          </div>

          <div className="footer-col">
            <h4>Curriculum</h4>
            <Link to="/curriculum">Week 1 — FHE Paradigm</Link>
            <Link to="/curriculum">Week 2 — Encrypted Logic</Link>
            <Link to="/curriculum">Week 3 — Access Control</Link>
            <Link to="/curriculum">Week 4 — Capstone</Link>
          </div>

          <div className="footer-col">
            <h4>Resources</h4>
            <Link to="/homework">Homework Specs</Link>
            <Link to="/resources">Instructor Guide</Link>
            <Link to="/resources">Video Script</Link>
            <a href="https://docs.zama.ai/fhevm" target="_blank" rel="noreferrer">Zama Docs</a>
          </div>

          <div className="footer-col">
            <h4>Community</h4>
            <a href="https://github.com/zama-ai/fhevm-hardhat-template" target="_blank" rel="noreferrer">GitHub Template</a>
            <a href="https://discord.gg/zama" target="_blank" rel="noreferrer">Discord</a>
            <a href="https://twitter.com/zaboris" target="_blank" rel="noreferrer">Twitter</a>
          </div>
        </div>

        <div className="footer-bottom">
          <span>FHEVM Blackbox Bootcamp. Built for the Zama Protocol.</span>
          <button className="footer-reset" onClick={resetProgress}>
            Reset Progress
          </button>
        </div>
      </div>
    </footer>
  );
}
