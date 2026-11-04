import { Link, useLocation } from "react-router-dom";
import { CalendarDays, ShieldCheck } from "lucide-react";

function Navbar() {
  const location = useLocation();

  const isAdmin = location.pathname.startsWith("/admin");

  return (
    <header className="navbar">
      <div className="container nav-content">
        <Link to="/" className="brand">
          <span className="brand-icon">
            <CalendarDays size={22} />
          </span>

          <span>
            Code<span className="brand-highlight">Nova</span>
          </span>
        </Link>

        <nav className="nav-links">
          <Link
            to="/"
            className={!isAdmin ? "nav-link active" : "nav-link"}
          >
            Explore Events
          </Link>

          <Link
            to="/admin"
            className="nav-link admin-nav-link"
          >
            <ShieldCheck size={16} />
            Admin
          </Link>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;