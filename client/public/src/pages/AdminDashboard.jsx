import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  Search,
  Users,
  CalendarDays,
  CheckCircle2,
  Clock,
  XCircle,
  LogOut,
  RefreshCw
} from "lucide-react";

import api from "../services/api";
import Loader from "../components/Loader";

function AdminDashboard() {
  const navigate = useNavigate();

  const [registrations, setRegistrations] = useState([]);
  const [events, setEvents] = useState([]);

  const [search, setSearch] = useState("");
  const [eventFilter, setEventFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  });

  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchEvents = async () => {
    try {
      const response = await api.get("/events");
      setEvents(response.data.events);
    } catch (err) {
      console.error("Failed to load events:", err);
    }
  };

  const fetchRegistrations = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/admin/registrations",
        {
          params: {
            search,
            eventId: eventFilter,
            status: statusFilter,
            page,
            limit: 10
          }
        }
      );

      setRegistrations(response.data.registrations);
      setPagination(response.data.pagination);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to load registrations."
      );
    } finally {
      setLoading(false);
    }
  }, [search, eventFilter, statusFilter, page]);

  // Load events when dashboard opens.
  useEffect(() => {
    fetchEvents();
  }, []);

  // Debounce search and refresh filters.
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchRegistrations();
    }, 350);

    return () => clearTimeout(timer);
  }, [fetchRegistrations]);

  const handleSearch = (value) => {
    setSearch(value);
    setPage(1);
  };

  const handleEventFilter = (value) => {
    setEventFilter(value);
    setPage(1);
  };

  const handleStatusFilter = (value) => {
    setStatusFilter(value);
    setPage(1);
  };

  const handleStatusChange = async (registrationId, status) => {
    try {
      setUpdatingId(registrationId);
      setError("");
      setSuccess("");

      await api.patch(
        `/admin/registrations/${registrationId}/status`,
        { status }
      );

      setSuccess("Registration status updated successfully.");

      await fetchRegistrations();
      await fetchEvents();
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to update registration status."
      );
    } finally {
      setUpdatingId("");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/admin/login", { replace: true });
  };

  const stats = {
    total: pagination.total,
    confirmed: registrations.filter(
      (item) => item.status === "confirmed"
    ).length,
    waitlisted: registrations.filter(
      (item) => item.status === "waitlisted"
    ).length,
    cancelled: registrations.filter(
      (item) => item.status === "cancelled"
    ).length
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <main className="admin-page">
      <div className="container">
        <div className="admin-header">
          <div>
            <span className="section-eyebrow">
              CODENOVA MANAGEMENT
            </span>

            <h1>Admin Dashboard</h1>

            <p>
              Monitor and manage attendee registrations.
            </p>
          </div>

          <button
            className="button button-outline logout-button"
            onClick={handleLogout}
          >
            <LogOut size={17} />
            Logout
          </button>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon stat-blue">
              <Users size={22} />
            </div>

            <span>Total Registrations</span>
            <strong>{stats.total}</strong>
          </div>

          <div className="stat-card">
            <div className="stat-icon stat-green">
              <CheckCircle2 size={22} />
            </div>

            <span>Confirmed on Page</span>
            <strong>{stats.confirmed}</strong>
          </div>

          <div className="stat-card">
            <div className="stat-icon stat-orange">
              <Clock size={22} />
            </div>

            <span>Waitlisted on Page</span>
            <strong>{stats.waitlisted}</strong>
          </div>

          <div className="stat-card">
            <div className="stat-icon stat-red">
              <XCircle size={22} />
            </div>

            <span>Cancelled on Page</span>
            <strong>{stats.cancelled}</strong>
          </div>
        </div>

        <section className="admin-table-section">
          <div className="table-heading">
            <div>
              <h2>Registrations</h2>

              <p>
                View attendee details and manage registration status.
              </p>
            </div>

            <button
              className="refresh-button"
              onClick={() => {
                fetchRegistrations();
                fetchEvents();
              }}
              title="Refresh registrations"
            >
              <RefreshCw size={17} />
              Refresh
            </button>
          </div>

          <div className="filters-row">
            <div className="search-box">
              <Search size={18} />

              <input
                type="search"
                placeholder="Search name, email or organization..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>

            <select
              value={eventFilter}
              onChange={(e) =>
                handleEventFilter(e.target.value)
              }
              aria-label="Filter by event"
            >
              <option value="">All Events</option>

              {events.map((event) => (
                <option
                  key={event._id}
                  value={event._id}
                >
                  {event.title}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) =>
                handleStatusFilter(e.target.value)
              }
              aria-label="Filter by status"
            >
              <option value="">All Statuses</option>
              <option value="confirmed">Confirmed</option>
              <option value="waitlisted">Waitlisted</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}

          {success && (
            <div className="alert alert-success">
              {success}
            </div>
          )}

          {loading ? (
            <Loader message="Loading registrations..." />
          ) : registrations.length === 0 ? (
            <div className="empty-state">
              <Users size={42} />

              <h3>No registrations found</h3>

              <p>
                Try changing your search or filters.
              </p>
            </div>
          ) : (
            <>
              <div className="table-wrapper">
                <table className="registrations-table">
                  <thead>
                    <tr>
                      <th>Attendee</th>
                      <th>Email</th>
                      <th>Organization</th>
                      <th>Event</th>
                      <th>Domain Interests</th>
                      <th>Registered Date</th>
                      <th>Status</th>
                      <th>Manage</th>
                    </tr>
                  </thead>

                  <tbody>
                    {registrations.map((registration) => (
                      <tr key={registration._id}>
                        <td className="attendee-name">
                          {registration.name}
                        </td>

                        <td>{registration.email}</td>

                        <td>{registration.organization}</td>

                        <td>
                          {registration.eventId?.title || "Deleted Event"}
                        </td>

                        <td>
                          <div className="interest-tags">
                            {registration.domainInterests.map(
                              (domain) => (
                                <span key={domain}>
                                  {domain}
                                </span>
                              )
                            )}
                          </div>
                        </td>

                        <td className="date-cell">
                          {formatDate(registration.createdAt)}
                        </td>

                        <td>
                          <span
                            className={`status-badge ${registration.status}`}
                          >
                            {registration.status}
                          </span>
                        </td>

                        <td>
                          <select
                            className="status-select"
                            value={registration.status}
                            disabled={
                              updatingId === registration._id
                            }
                            onChange={(e) =>
                              handleStatusChange(
                                registration._id,
                                e.target.value
                              )
                            }
                            aria-label={`Change status for ${registration.name}`}
                          >
                            <option value="confirmed">
                              Confirmed
                            </option>

                            <option value="waitlisted">
                              Waitlisted
                            </option>

                            <option value="cancelled">
                              Cancelled
                            </option>
                          </select>

                          {updatingId === registration._id && (
                            <span className="updating-text">
                              Updating...
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="pagination">
                <span>
                  Showing {registrations.length} of {pagination.total}
                </span>

                <div className="pagination-controls">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    Previous
                  </button>

                  <span>
                    Page {page} of {Math.max(1, pagination.totalPages)}
                  </span>

                  <button
                    disabled={page >= pagination.totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </section>

        <div className="admin-footer">
          <Link to="/">View Public Events</Link>
          <span>CodeNova Event Management System</span>
        </div>
      </div>
    </main>
  );
}

export default AdminDashboard;