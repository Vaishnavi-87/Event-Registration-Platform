const Event = require("../models/Event");
const Registration = require("../models/Registration");

const DUPLICATE_MESSAGE =
  "This email is already registered for this event.";

const ALLOWED_DOMAINS = [
  "Web Dev",
  "AI/ML",
  "Blockchain",
  "Cybersecurity",
  "Cloud",
  "Design"
];

// Register an attendee using an atomic capacity update.
const registerForEvent = async (req, res, next) => {
  let capacityReserved = false;
  let eventId;

  try {
    eventId = req.params.id;

    const {
      name,
      email,
      organization,
      domainInterests
    } = req.body;

    const normalizedEmail = email.trim().toLowerCase();

    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found."
      });
    }

    // Validate domain interests.
    if (
      !Array.isArray(domainInterests) ||
      domainInterests.length === 0 ||
      !domainInterests.every((domain) =>
        ALLOWED_DOMAINS.includes(domain)
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Please select valid domain interests."
      });
    }

    // Early duplicate check for a clear response.
    const existingRegistration =
      await Registration.findOne({
        eventId,
        email: normalizedEmail
      });

    if (existingRegistration) {
      return res.status(409).json({
        success: false,
        message: DUPLICATE_MESSAGE
      });
    }

    // Atomic conditional increment. Concurrent requests cannot
    // reserve the same final seat.
    const reservedEvent = await Event.findOneAndUpdate(
      {
        _id: eventId,
        $expr: {
          $lt: ["$registeredCount", "$capacity"]
        }
      },
      {
        $inc: { registeredCount: 1 }
      },
      {
        new: true
      }
    );

    if (!reservedEvent) {
      return res.status(409).json({
        success: false,
        message: "Sorry, this event is sold out."
      });
    }

    capacityReserved = true;

    const registration = await Registration.create({
      eventId,
      name,
      email: normalizedEmail,
      organization,
      domainInterests,
      status: "confirmed"
    });

    capacityReserved = false;

    res.status(201).json({
      success: true,
      message: "Registration successful!",
      registration,
      event: {
        id: reservedEvent._id,
        capacity: reservedEvent.capacity,
        registeredCount: reservedEvent.registeredCount,
        seatsLeft:
          reservedEvent.capacity -
          reservedEvent.registeredCount
      }
    });
  } catch (error) {
    // If registration creation fails after reserving a seat,
    // release the reservation.
    if (capacityReserved && eventId) {
      try {
        await Event.updateOne(
          { _id: eventId },
          { $inc: { registeredCount: -1 } }
        );
      } catch (rollbackError) {
        console.error(
          "Capacity rollback failed:",
          rollbackError
        );
      }
    }

    // Handles duplicate registration race conditions.
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: DUPLICATE_MESSAGE
      });
    }

    next(error);
  }
};

module.exports = {
  registerForEvent
};