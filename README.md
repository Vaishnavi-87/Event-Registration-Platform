# CodeNova Event Registration Platform

A full-stack Event Registration Platform developed as part of the CodeNova Internship Program - Task 3.

The application allows attendees to explore technology events, register online, and track available seats. Administrators can securely access a dashboard to search, filter, view, and manage registrations.

---

## 1. Overview

The CodeNova Event Registration Platform is designed to simplify event management and attendee registration.

It provides two main interfaces:

- Public interface: Allows users to browse events and register.
- Admin interface: Allows administrators to manage registrations and attendee status.

The application uses MongoDB to store event and registration information, React for the frontend, and Express.js for the backend.

---

## 2. Features

### Public Event Showcase

- Display upcoming technology events.
- Show event title, description, date, time and location.
- Display total capacity and remaining seats.
- Show registration availability.
- Disable registration for sold-out events.
- Individual event details pages.

### Attendee Registration

- Full name.
- Email address.
- College or organization.
- Multiple domain interests:
  - Web Dev
  - AI/ML
  - Blockchain
  - Cybersecurity
  - Cloud
  - Design
- Client-side and server-side validation.
- Email normalization using trim and lowercase.
- Success and error messages without page reload.

### Duplicate Registration Prevention

- Unique compound MongoDB index on eventId and email.
- Controller-level duplicate checking.
- MongoDB duplicate-key error handling.
- HTTP 409 conflict response.
- The same email can register for different events.

### Capacity Management

- Dynamic seat availability.
- Atomic conditional seat reservation.
- Prevention of oversubscription during concurrent requests.
- Capacity rollback when registration creation fails.
- Seat release when an admin cancels a confirmed registration.

### Admin Dashboard

- JWT-protected admin access.
- Registration overview.
- Search by name, email and organization.
- Filter by event.
- Filter by registration status.
- Pagination.
- Debounced search.
- Update registration status.
- Loading and empty states.

### Registration Statuses

| Status | Description |
|---|---|
| Confirmed | Registration is active and occupies a seat. |
| Waitlisted | Registration is waiting and does not occupy a seat. |
| Cancelled | Registration is cancelled and does not occupy a seat. |

---

## 3. Technology Stack

### Frontend

- React.js
- Vite
- React Router
- Axios
- JavaScript
- HTML5
- CSS3
- Lucide React Icons

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- express-validator
- JSON Web Token (JWT)
- bcryptjs dependency

### Development Tools

- Visual Studio Code
- MongoDB Atlas or MongoDB Community Server
- Postman
- Git
- GitHub

---

## 4. Project Structure

```text
Event-Registration-Platform/
│
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── styles/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env
│   ├── .env.example
│   ├── index.html
│   └── package.json
│
├── server/
│   ├── config/
│   ├── models/
│   ├── controllers/
│   ├── routes/
│   ├── middleware/
│   ├── .env
│   ├── .env.example
│   ├── package.json
│   ├── server.js
│   └── seed.js
│
├── docs/
│   └── screenshots/
│       └── .gitkeep
│
├── .gitignore
└── README.md