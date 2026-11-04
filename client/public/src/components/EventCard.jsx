import { Link } from "react-router-dom";
import {
  CalendarDays,
  Clock,
  MapPin,
  ArrowUpRight,
  Users
} from "lucide-react";

function EventCard({ event }) {
  const startDate = new Date(event.startDate);

  const formattedDate = startDate.toLocaleDateString(
    "en-IN",
    {
      day: "numeric",
      month: "short",
      year: "numeric"
    }
  );

  const formattedTime = startDate.toLocaleTimeString(
    "en-IN",
    {
      hour: "2-digit",
      minute: "2-digit"
    }
  );

  const seatsLeft = Math.max(
    0,
    event.capacity - event.registeredCount
  );

  const isSoldOut = seatsLeft === 0;

  const percentage = Math.min(
    100,
    (event.registeredCount / event.capacity) * 100
  );

  return (
    <article className="event-card">
      <div className="event-card-top">
        <span className="event-category">
          TECHNOLOGY EVENT
        </span>

        {isSoldOut ? (
          <span className="sold-out-badge">Sold Out</span>
        ) : (
          <span className="available-badge">
            Registration Open
          </span>
        )}
      </div>

      <h3>{event.title}</h3>

      <p className="event-description">
        {event.description}
      </p>

      <div className="event-meta">
        <div>
          <CalendarDays size={17} />
          <span>{formattedDate}</span>
        </div>

        <div>
          <Clock size={17} />
          <span>{formattedTime}</span>
        </div>

        <div>
          <MapPin size={17} />
          <span>{event.location}</span>
        </div>
      </div>

      <div className="capacity-section">
        <div className="capacity-label">
          <span>
            <Users size={15} /> Seats availability
          </span>

          <strong>{seatsLeft} / {event.capacity} seats left</strong>
        </div>

        <div className="progress-track">
          <div
            className="progress-fill"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      <Link
        to={`/events/${event._id}`}
        className={`button card-button ${
          isSoldOut ? "button-outline" : "button-primary"
        }`}
      >
        {isSoldOut ? "View Event" : "Explore Event"}

        <ArrowUpRight size={17} />
      </Link>
    </article>
  );
}

export default EventCard;