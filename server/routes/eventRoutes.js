const express = require("express");
const { body, param } = require("express-validator");

const {
  getEvents,
  getEventById
} = require("../controllers/eventController");

const {
  registerForEvent
} = require("../controllers/registrationController");

const validateRequest = require("../middleware/validateRequest");

const router = express.Router();

const allowedDomains = [
  "Web Dev",
  "AI/ML",
  "Blockchain",
  "Cybersecurity",
  "Cloud",
  "Design"
];

router.get("/", getEvents);

router.get(
  "/:id",
  [
    param("id").isMongoId().withMessage("Invalid event ID.")
  ],
  validateRequest,
  getEventById
);

router.post(
  "/:id/register",
  [
    param("id").isMongoId().withMessage("Invalid event ID."),

    body("name")
      .trim()
      .notEmpty()
      .withMessage("Name is required.")
      .isLength({ max: 100 })
      .withMessage("Name cannot exceed 100 characters."),

    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required.")
      .isEmail()
      .withMessage("Enter a valid email address.")
      .normalizeEmail(),

    body("organization")
      .trim()
      .notEmpty()
      .withMessage("College or organization is required.")
      .isLength({ max: 150 })
      .withMessage("Organization cannot exceed 150 characters."),

    body("domainInterests")
      .isArray({ min: 1 })
      .withMessage("Select at least one domain interest."),

    body("domainInterests.*")
      .isIn(allowedDomains)
      .withMessage("Invalid domain interest.")
  ],
  validateRequest,
  registerForEvent
);

module.exports = router;