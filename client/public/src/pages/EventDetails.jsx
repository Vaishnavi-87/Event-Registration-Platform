import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

import {
  ArrowLeft,
  CalendarDays,
  Clock,
  MapPin,
  Users,
  CheckCircle2,
  XCircle
} from "lucide-react";

import api from "../services/api";
import Loader from "../components/Loader";

const domains = [
  "Web Dev",
  "AI/ML",
  "Blockchain",
  "Cybersecurity",
  "Cloud",
  "Design"
];

function EventDetails() {
  const { id } = useParams();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    organization: "",
    domainInterests: []
  });

  const [feedback, setFeedback] = useState({
    type: "",
    message: ""
  });

  const fetchEvent = async () => {
    try {
      setLoading(true);

      const response = await api.get(`/events/${id}`);

      setEvent(response.data.event);
    } catch (error) {
      setFeedback({
        type: "error",
        message:
          error.response?.data?.message ||
          "Unable to load this event."
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const handleChange = (e) => {
    setForm((previous) => ({
      ...previous,
      [e.target.name]: e.target.value
    }));
  };

  const handleDomainChange = (domain) => {
    setForm((previous) => {
      const selected = previous.domainInterests.includes(domain);

      return {
        ...previous,
        domainInterests: selected
          ? previous.domainInterests.filter(
              (item) => item !== domain
            )
          : [...previous.domainInterests, domain]
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setFeedback({
      type: "",
      message: ""
    });

    if (
      !form.name.trim() ||
      !form.email.trim() ||
      !form.organization.trim()
    ) {
      setFeedback({
        type: "error",
        message: "Please complete all required fields."
      });

      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(form.email.trim())) {
      setFeedback({
        type: "error",
        message: "Please enter a valid email address."
      });

      return;
    }

    if (form.domainInterests.length === 0) {
      setFeedback({
        type: "error",
        message: "Select at least one domain interest."
      });

      return;
    }

    try {
      setSubmitting(true);

      const response = await api.post(
        `/events/${id}/register`,
        {
          ...form,
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          organization: form.organization.trim()
        }
      );

      setFeedback({
        type: "success",
        message: response.data.message
      });

      setForm({
        name: "",
        email: "",
        organization: "",
        domainInterests: []
      });

      // Refresh event availability after registration.
      await fetchEvent();
    } catch (error) {
      const status = error.response?.status;

      setFeedback({
        type: "error",
        message:
          status === 409
            ? error.response?.data?.message ||
              "This email is already registered for this event."
            : error.response?.data?.message ||
              "Registration failed. Please try again."
      });

      // Refresh capacity when another attendee may have
      // reserved the last available seat.
      if (status === 409) {
        await fetchEvent();
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Loader message="Loading event details..." />;
  }

  if (!event) {
    return (
      <div className="container page-container">
        <div className="alert alert-error">
          {feedback.message || "Event not found."}
        </div>

        <Link to="/" className="button button-outline">
          <ArrowLeft size={16} />
          Back to events
        </Link>
      </div>
    );
  }

  const seatsLeft = Math.max(
    0,
    event.capacity - event.registeredCount
  );

  const isSoldOut = seatsLeft === 0;

  const startDate = new Date(event.startDate);
  const endDate = new Date(event.endDate);

  return (
    <main className="container page-container">
      <Link to="/" className="back-link">
        <ArrowLeft size={17} />
        Back to events
      </Link>

      <div className="details-layout">
        <section className="details-main">
          <div className="details-category">
            CODE NOVA COMMUNITY EVENT
          </div>

          <h1>{event.title}</h1>

          <p className="details-description">
            {event.description}
          </p>

          <div className="details-info-grid">
            <div className="info-card">
              <CalendarDays size={22} />
              <div>
                <span>Date</span>
                <strong>
                  {startDate.toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                  })}
                </strong>
              </div>
            </div>

            <div className="info-card">
              <Clock size={22} />
              <div>
                <span>Schedule</span>
                <strong>
                  {startDate.toLocaleTimeString("en-IN", {
                    hour: "2-digit",
                    minute: "2-digit"
                  })}
                  {" - "}
                  {endDate.toLocaleTimeString("en-IN", {
                    hour: "2-digit",
                    minute: "2-digit"
                  })}
                </strong>
              </div>
            </div>

            <div className="info-card">
              <MapPin size={22} />
              <div>
                <span>Location</span>
                <strong>{event.location}</strong>
              </div>
            </div>

            <div className="info-card">
              <Users size={22} />
              <div>
                <span>Available Seats</span>
                <strong>
                  {seatsLeft} / {event.capacity}
                </strong>
              </div>
            </div>
          </div>

          <div className="capacity-section details-capacity">
            <div className="capacity-label">
              <span>Registration capacity</span>
              <strong>{seatsLeft} seats left</strong>
            </div>

            <div className="progress-track">
              <div
                className="progress-fill"
                style={{
                  width: `${
                    (event.registeredCount / event.capacity) * 100
                  }%`
                }}
              />
            </div>
          </div>

          <div className="details-note">
            <CheckCircle2 size={19} />

            <p>
              Your registration details will be securely
              stored and managed by the CodeNova platform.
            </p>
          </div>
        </section>

        <section className="registration-panel">
          <div className="form-heading">
            <span className="section-eyebrow">
              JOIN THE EVENT
            </span>

            <h2>Register Now</h2>

            <p>
              Fill in your details to reserve your seat.
            </p>
          </div>

          {isSoldOut ? (
            <div className="sold-out-panel">
              <XCircle size={40} />

              <h3>Sold Out</h3>

              <p>
                Unfortunately, all seats for this event
                have been reserved.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Full Name *</label>

                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={form.name}
                  onChange={handleChange}
                  maxLength={100}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address *</label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="organization">
                  College / Organization *
                </label>

                <input
                  id="organization"
                  name="organization"
                  type="text"
                  placeholder="Enter college or organization"
                  value={form.organization}
                  onChange={handleChange}
                  maxLength={150}
                  required
                />
              </div>

              <div className="form-group">
                <label>Domain Interests *</label>

                <p className="input-hint">
                  Select one or more interests.
                </p>

                <div className="domain-grid">
                  {domains.map((domain) => (
                    <label
                      key={domain}
                      className={`domain-option ${
                        form.domainInterests.includes(domain)
                          ? "selected"
                          : ""
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={form.domainInterests.includes(domain)}
                        onChange={() => handleDomainChange(domain)}
                      />

                      <span>{domain}</span>
                    </label>
                  ))}
                </div>
              </div>

              {feedback.message && (
                <div
                  className={`alert ${
                    feedback.type === "success"
                      ? "alert-success"
                      : "alert-error"
                  }`}
                  role="alert"
                >
                  {feedback.message}
                </div>
              )}

              <button
                type="submit"
                className="button button-primary submit-button"
                disabled={submitting}
              >
                {submitting
                  ? "Registering..."
                  : "Confirm Registration"}
              </button>

              <p className="form-footer">
                By registering, you agree to participate
                in the selected CodeNova event.
              </p>
            </form>
          )}

          {isSoldOut && feedback.message && (
            <div className="alert alert-error">
              {feedback.message}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default EventDetails;