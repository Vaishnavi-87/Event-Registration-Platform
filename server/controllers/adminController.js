const jwt = require("jsonwebtoken");
const Registration = require("../models/Registration");
const Event = require("../models/Event");

// Admin login using credentials stored in .env.
const adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const validEmail =
      email.trim().toLowerCase() ===
      process.env.ADMIN_EMAIL.trim().toLowerCase();

    const validPassword =
      password === process.env.ADMIN_PASSWORD;

    if (!validEmail || !validPassword) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password."
      });
    }

    const token = jwt.sign(
      {
        email: process.env.ADMIN_EMAIL,
        role: "admin"
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || "1d"
      }
    );

    res.status(200).json({
      success: true,
      message: "Admin login successful.",
      token,
      admin: {
        email: process.env.ADMIN_EMAIL,
        role: "admin"
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get registrations with search, filters and pagination.
const getRegistrations = async (req, res, next) => {
  try {
    const {
      search = "",
      eventId = "",
      status = "",
      page = 1,
      limit = 10
    } = req.query;

    const currentPage = Math.max(1, Number(page));
    const pageLimit = Math.min(
      100,
      Math.max(1, Number(limit))
    );

    if (
      !Number.isInteger(currentPage) ||
      !Number.isInteger(pageLimit)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid pagination values."
      });
    }

    const filter = {};

    if (search.trim()) {
      const safeSearch = search.trim().replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );

      const regex = new RegExp(safeSearch, "i");

      filter.$or = [
        { name: regex },
        { email: regex },
        { organization: regex }
      ];
    }

    if (eventId) {
      if (!/^[a-f\d]{24}$/i.test(eventId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid event ID."
        });
      }

      filter.eventId = eventId;
    }

    if (status) {
      if (
        !["confirmed", "waitlisted", "cancelled"].includes(
          status
        )
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid registration status."
        });
      }

      filter.status = status;
    }

    const skip = (currentPage - 1) * pageLimit;

    const [registrations, total] = await Promise.all([
      Registration.find(filter)
        .populate("eventId", "title startDate location")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageLimit)
        .lean(),

      Registration.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      registrations,
      pagination: {
        total,
        page: currentPage,
        limit: pageLimit,
        totalPages: Math.ceil(total / pageLimit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// Change registration status and synchronize event capacity.
const updateRegistrationStatus = async (
  req,
  res,
  next
) => {
  try {
    const { status } = req.body;

    if (
      !["confirmed", "waitlisted", "cancelled"].includes(
        status
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid registration status."
      });
    }

    const registration = await Registration.findById(
      req.params.id
    );

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: "Registration not found."
      });
    }

    const oldStatus = registration.status;

    if (oldStatus === status) {
      return res.status(200).json({
        success: true,
        message: "Registration status is unchanged.",
        registration
      });
    }

    const eventId = registration.eventId;

    // Moving a registration into confirmed status consumes a seat.
    if (
      oldStatus !== "confirmed" &&
      status === "confirmed"
    ) {
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
          message:
            "Cannot confirm registration. The event is full."
        });
      }

      try {
        registration.status = status;
        await registration.save();
      } catch (saveError) {
        await Event.updateOne(
          { _id: eventId },
          { $inc: { registeredCount: -1 } }
        );

        throw saveError;
      }
    } else if (
      oldStatus === "confirmed" &&
      status !== "confirmed"
    ) {
      // Release a seat when a confirmed attendee is cancelled
      // or moved to the waitlist.
      registration.status = status;
      await registration.save();

      await Event.updateOne(
        {
          _id: eventId,
          registeredCount: { $gt: 0 }
        },
        {
          $inc: { registeredCount: -1 }
        }
      );
    } else {
      registration.status = status;
      await registration.save();
    }

    res.status(200).json({
      success: true,
      message: "Registration status updated successfully.",
      registration
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  adminLogin,
  getRegistrations,
  updateRegistrationStatus
};