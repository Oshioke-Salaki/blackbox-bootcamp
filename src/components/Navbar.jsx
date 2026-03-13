import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useProgress } from "./ProgressContext";
import "./Navbar.css";

const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/curriculum", label: "Curriculum" },
  { to: "/homework", label: "Homework" },
  { to: "/resources", label: "Resources" },
  { to: "/sandbox", label: "Sandbox" },
];

const WEEK_STRUCTURE = [
  { id: "week1", lessons: 4 },
  { id: "week2", lessons: 3 },
  { id: "week3", lessons: 3 },
  { id: "week4", lessons: 3 },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const { getTotalProgress } = useProgress();
  const { percent } = getTotalProgress(WEEK_STRUCTURE);

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          <span className="brand-mark">BX</span>
          <span className="brand-text"> Zama Blackbox</span>
        </Link>

        <div className={`navbar-links${open ? " open" : ""}`}>
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`nav-link${pathname === link.to ? " active" : ""}`}
              onClick={() => setOpen(false)}
            >
              {link.label}
              {pathname === link.to && <span className="nav-dot" />}
            </Link>
          ))}
        </div>

        <div className="navbar-right">
          {percent > 0 && (
            <div className="nav-progress" title={`${percent}% complete`}>
              <div className="nav-progress-bar">
                <div className="nav-progress-fill" style={{ width: `${percent}%` }} />
              </div>
              <span className="nav-progress-label">{percent}%</span>
            </div>
          )}
          <a
            href="https://github.com/zama-ai/fhevm-hardhat-template"
            target="_blank"
            rel="noreferrer"
            className="btn-primary nav-cta"
          >
            Start Building
          </a>
          <button
            className={`hamburger${open ? " open" : ""}`}
            onClick={() => setOpen(!open)}
            aria-label="Menu"
          >
            <span /><span /><span />
          </button>
        </div>
      </div>
    </nav>
  );
}
