import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" style={{ fontWeight: 800, fontSize: "1.05rem" }}>
          ChildcareMatch AI
        </Link>

        <nav className="nav-links">
          <Link to="/request">Parent Request</Link>
          <Link to="/admin">Admin Dashboard</Link>
          <Link to="/approval">Approval Flow</Link>
        </nav>
      </div>
    </header>
  );
}