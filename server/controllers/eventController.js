const Event = require("../models/Event");
const Registration = require("../models/Registration");

// Get all public events.
const getEvents = async (req, res, next) => {
  try {
    const events = await Event.find()
      .sort({ startDate: 1 })
      .lean();

    const formattedEvents = events.map((event) => ({
      ...event,
      seatsLeft: Math.max(
        0,
        event.capacity - event.registeredCount
      ),
      isSoldOut: event.registeredCount >= event.capacity
    }));

    res.status(200).json({
      success: true,
      count: formattedEvents.length,
      events: formattedEvents
    });
  } catch (error) {
    next(error);
  }
};

// Get individual event details.
const getEventById = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id).lean();

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found."
      });
    }

    const registeredCount = await Registration.countDocuments({
      eventId: event._id,
      status: "confirmed"
    });

    res.status(200).json({
      success: true,
      event: {
        ...event,
        registeredCount,
        seatsLeft: Math.max(
          0,
          event.capacity - registeredCount
        ),
        isSoldOut: registeredCount >= event.capacity
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEvents,
  getEventById
};