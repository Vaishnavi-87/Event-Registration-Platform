import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ShieldCheck, LockKeyhole, Mail } from "lucide-react";

import api from "../services/api";

function AdminLogin() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    try {
      setLoading(true);

      const response = await api.post("/admin/login", {
        email: form.email.trim().toLowerCase(),
        password: form.password
      });

      localStorage.setItem(
        "adminToken",
        response.data.token
      );

      navigate("/admin", { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <div className="login-card">
        <div className="login-icon">
          <ShieldCheck size={30} />
        </div>

        <span className="section-eyebrow">
          CODENOVA MANAGEMENT
        </span>

        <h1>Admin Login</h1>

        <p className="login-description">
          Sign in to manage event registrations and attendees.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Admin Email</label>

            <div className="input-with-icon">
              <Mail size={18} />

              <input
                id="email"
                name="email"
                type="email"
                placeholder="admin@example.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>

            <div className="input-with-icon">
              <LockKeyhole size={18} />

              <input
                id="password"
                name="password"
                type="password"
                placeholder="Enter admin password"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {error && (
            <div className="alert alert-error" role="alert">
              {error}
            </div>
          )}

          <button
            className="button button-primary submit-button"
            type="submit"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <Link to="/" className="login-back">
          Back to public events
        </Link>
      </div>
    </main>
  );
}

export default AdminLogin;