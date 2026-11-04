require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");

const eventRoutes = require("./routes/eventRoutes");
const adminRoutes = require("./routes/adminRoutes");

const {
  notFound,
  errorHandler
} = require("./middleware/errorMiddleware");

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true
  })
);

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));

// Health check.
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "CodeNova Event Registration API is running."
  });
});

// API routes.
app.use("/api/events", eventRoutes);
app.use("/api/admin", adminRoutes);

// Centralized error handling.
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(
        `Server running on http://localhost:${PORT}`
      );
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();