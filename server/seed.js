require("dotenv").config();

const mongoose = require("mongoose");
const connectDB = require("./config/db");

const Event = require("./models/Event");
const Registration = require("./models/Registration");

const events = [
  {
    title: "Web Development Bootcamp",
    description:
      "Learn modern frontend and backend development through practical projects, React, Node.js and deployment.",
    startDate: new Date("2026-11-15T10:00:00"),
    endDate: new Date("2026-11-15T16:00:00"),
    location: "Pune, Maharashtra",
    capacity: 100,
    registeredCount: 0
  },
  {
    title: "AI and Machine Learning Summit",
    description:
      "Explore machine learning, generative AI, neural networks and real-world AI applications.",
    startDate: new Date("2026-11-20T09:30:00"),
    endDate: new Date("2026-11-20T17:00:00"),
    location: "Online",
    capacity: 80,
    registeredCount: 0
  },
  {
    title: "Blockchain Innovation Day",
    description:
      "Discover Ethereum, smart contracts, DeFi, decentralized applications and blockchain security.",
    startDate: new Date("2026-12-05T10:00:00"),
    endDate: new Date("2026-12-05T15:30:00"),
    location: "Pune, Maharashtra",
    capacity: 25,
    registeredCount: 0
  },
  {
    title: "Cybersecurity and Ethical Hacking",
    description:
      "Understand security fundamentals, vulnerability assessment, penetration testing and threat detection.",
    startDate: new Date("2026-12-12T11:00:00"),
    endDate: new Date("2026-12-12T16:00:00"),
    location: "Online",
    capacity: 50,
    registeredCount: 0
  },
  {
    title: "Cloud Computing Workshop",
    description:
      "Get hands-on experience with cloud architecture, deployment, AWS fundamentals and DevOps.",
    startDate: new Date("2026-12-18T10:00:00"),
    endDate: new Date("2026-12-18T14:00:00"),
    location: "Mumbai, Maharashtra",
    capacity: 40,
    registeredCount: 0
  },
  {
    title: "Creative UI/UX Design Meetup",
    description:
      "Explore user experience, design systems, prototyping, accessibility and modern interface design.",
    startDate: new Date("2027-01-10T10:00:00"),
    endDate: new Date("2027-01-10T13:00:00"),
    location: "Pune, Maharashtra",
    capacity: 30,
    registeredCount: 0
  }
];

const people = [
  ["Aarav Sharma", "aarav@example.com", "Pune University", ["Web Dev", "AI/ML"]],
  ["Priya Patil", "priya@example.com", "MIT Pune", ["Blockchain"]],
  ["Rohan Deshmukh", "rohan@example.com", "SPPU", ["AI/ML", "Cloud"]],
  ["Ananya Kulkarni", "ananya@example.com", "Fergusson College", ["Design"]],
  ["Aditya Joshi", "aditya@example.com", "COEP", ["Cybersecurity"]],
  ["Sneha More", "sneha@example.com", "Modern College", ["Web Dev", "Design"]],
  ["Karan Shah", "karan@example.com", "PCCOE", ["Blockchain", "Cloud"]],
  ["Isha Gupta", "isha@example.com", "MIT WPU", ["AI/ML"]],
  ["Rahul Verma", "rahul@example.com", "SPPU", ["Cybersecurity"]],
  ["Meera Nair", "meera@example.com", "Symbiosis", ["Design", "Web Dev"]],
  ["Vikram Singh", "vikram@example.com", "DY Patil", ["Cloud"]],
  ["Pooja Jadhav", "pooja@example.com", "Garware College", ["AI/ML"]],
  ["Arjun Rao", "arjun@example.com", "AISSMS", ["Blockchain"]],
  ["Kavya Iyer", "kavya@example.com", "BMCC", ["Web Dev"]],
  ["Sahil Khan", "sahil@example.com", "Indira College", ["Cybersecurity", "Cloud"]],
  ["Riya Shah", "riya@example.com", "MIT Pune", ["Design"]],
  ["Dev Mehta", "dev@example.com", "COEP", ["Blockchain", "AI/ML"]],
  ["Nisha Pawar", "nisha@example.com", "SPPU", ["Web Dev", "Cloud"]]
];

const seedDatabase = async () => {
  try {
    await connectDB();

    // Remove old demo records.
    await Registration.deleteMany({});
    await Event.deleteMany({});

    const createdEvents = await Event.insertMany(events);

    const registrations = [];

    // Distribute registrations across events.
    for (let i = 0; i < people.length; i++) {
      const person = people[i];

      let eventIndex = i % createdEvents.length;

      // Make the third event nearly full.
      if (i >= 12 && i < 18) {
        eventIndex = 2;
      }

      const status =
        i % 6 === 0
          ? "cancelled"
          : i % 5 === 0
            ? "waitlisted"
            : "confirmed";

      registrations.push({
        eventId: createdEvents[eventIndex]._id,
        name: person[0],
        email: person[1],
        organization: person[2],
        domainInterests: person[3],
        status
      });
    }

    // Add additional records to make the third event nearly full.
    for (let i = 0; i < 18; i++) {
      registrations.push({
        eventId: createdEvents[2]._id,
        name: `Blockchain Attendee ${i + 1}`,
        email: `blockchain${i + 1}@example.com`,
        organization: "CodeNova Community",
        domainInterests: ["Blockchain"],
        status: i % 7 === 0 ? "waitlisted" : "confirmed"
      });
    }

    // Add records for a full event.
    for (let i = 0; i < 10; i++) {
      registrations.push({
        eventId: createdEvents[0]._id,
        name: `Web Attendee ${i + 1}`,
        email: `webattendee${i + 1}@example.com`,
        organization: "CodeNova Community",
        domainInterests: ["Web Dev"],
        status: "confirmed"
      });
    }

    // Keep event 4 full in the demo.
    for (let i = 0; i < 50; i++) {
      registrations.push({
        eventId: createdEvents[3]._id,
        name: `Security Attendee ${i + 1}`,
        email: `security${i + 1}@example.com`,
        organization: "CodeNova Community",
        domainInterests: ["Cybersecurity"],
        status: "confirmed"
      });
    }

    // Seed registrations.
    await Registration.insertMany(registrations);

    // Recalculate counters from confirmed registrations only.
    for (const event of createdEvents) {
      const count = await Registration.countDocuments({
        eventId: event._id,
        status: "confirmed"
      });

      await Event.updateOne(
        { _id: event._id },
        { $set: { registeredCount: count } }
      );
    }

    console.log("Database seeded successfully.");
    console.log(`Events created: ${createdEvents.length}`);
    console.log(`Registrations created: ${registrations.length}`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("Database seeding failed:", error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

seedDatabase();