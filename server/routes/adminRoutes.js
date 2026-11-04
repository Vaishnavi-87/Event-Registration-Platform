const express = require("express");
const { body, param } = require("express-validator");

const {
  adminLogin,
  getRegistrations,
  updateRegistrationStatus
} = require("../controllers/adminController");

const {
  protectAdmin
} = require("../middleware/authMiddleware");

const validateRequest = require("../middleware/validateRequest");

const router = express.Router();

router.post(
  "/login",
  [
    body("email")
      .trim()
      .isEmail()
      .withMessage("Enter a valid admin email."),

    body("password")
      .notEmpty()
      .withMessage("Password is required.")
  ],
  validateRequest,
  adminLogin
);

router.get(
  "/registrations",
  protectAdmin,
  getRegistrations
);

router.patch(
  "/registrations/:id/status",
  protectAdmin,
  [
    param("id")
      .isMongoId()
      .withMessage("Invalid registration ID."),

    body("status")
      .isIn(["confirmed", "waitlisted", "cancelled"])
      .withMessage("Invalid registration status.")
  ],
  validateRequest,
  updateRegistrationStatus
);

module.exports = router;