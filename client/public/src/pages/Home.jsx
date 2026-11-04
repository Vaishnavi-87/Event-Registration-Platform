import { useEffect, useState } from "react";
import {
  ArrowDown,
  CalendarCheck,
  ShieldCheck,
  Sparkles
} from "lucide-react";

import api from "../services/api";
import EventCard from "../components/EventCard";
import Loader from "../components/Loader";

function Home() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/events");

      setEvents(response.data.events);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to load events. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <>
      <section className="hero">
        <div className="container hero-content">
          <div className="hero-badge">
            <Sparkles size={15} />
            Learn. Connect. Build.
          </div>

          <h1>
            Discover Events.
            <br />
            <span>Build Your Future.</span>
          </h1>

          <p>
            Explore technology workshops, conferences and
            learning experiences. Find your next opportunity
            with the CodeNova community.
          </p>

          <a href="#events" className="button button-primary hero-button">
            Explore Events
            <ArrowDown size={18} />
          </a>

          <div className="hero-features">
            <div>
              <CalendarCheck size={19} />
              <span>Easy Registration</span>
            </div>

            <div>
              <ShieldCheck size={19} />
              <span>Verified Registrations</span>
            </div>
          </div>
        </div>

        <div className="hero-decoration hero-decoration-one"></div>
        <div className="hero-decoration hero-decoration-two"></div>
      </section>

      <section className="events-section" id="events">
        <div className="container">
          <div className="section-heading">
            <div>
              <span className="section-eyebrow">
                FIND YOUR NEXT EXPERIENCE
              </span>

              <h2>Upcoming Events</h2>

              <p>
                Choose an event that matches your interests
                and reserve your seat.
              </p>
            </div>

            <span className="event-count">
              {events.length} Events
            </span>
          </div>

          {loading ? (
            <Loader message="Discovering upcoming events..." />
          ) : error ? (
            <div className="alert alert-error">
              {error}
              <button
                className="text-button"
                onClick={fetchEvents}
              >
                Retry
              </button>
            </div>
          ) : events.length === 0 ? (
            <div className="empty-state">
              <CalendarCheck size={40} />
              <h3>No events available</h3>
              <p>Please check back later for new events.</p>
            </div>
          ) : (
            <div className="events-grid">
              {events.map((event) => (
                <EventCard
                  key={event._id}
                  event={event}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <footer className="footer">
        <div className="container footer-content">
          <p>© 2026 CodeNova. All rights reserved.</p>
          <p>Connecting people through technology.</p>
        </div>
      </footer>
    </>
  );
}

export default Home;