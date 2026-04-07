/**
 * Seed script for live hiring events.
 * Run: node seedEvents.js
 */
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const Event = require("./models/Event");

const MONGO_URI = process.env.MONGO_URI;

const sampleEvents = [
  {
    title: "Frontend Blitz: React Challenge",
    description:
      "Test your React.js and JavaScript skills in this fast-paced live competition. Top performers get evaluated for frontend engineering internships at leading tech companies.",
    company: "TechCorp Inc.",
    skills: ["React", "JavaScript", "CSS", "HTML"],
    startTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
    duration: 30,
    status: "upcoming",
    rewards: { xp: 200, coins: 100, internshipSlots: 3 },
    maxParticipants: 200,
    topNSelected: 3,
    coverGradient: "from-blue-500 to-cyan-500",
    questions: [
      {
        question: "What hook is used for side effects in React?",
        options: ["useState", "useEffect", "useRef", "useMemo"],
        correctAnswer: "useEffect",
        difficulty: "easy",
        points: 10,
        timeLimit: 30,
      },
      {
        question: "What does JSX stand for?",
        options: ["JavaScript XML", "Java Syntax Extension", "JSON XML", "JavaScript eXtension"],
        correctAnswer: "JavaScript XML",
        difficulty: "easy",
        points: 10,
        timeLimit: 30,
      },
      {
        question: "Which method is used to update state in a class component?",
        options: ["this.updateState()", "this.setState()", "this.changeState()", "state.set()"],
        correctAnswer: "this.setState()",
        difficulty: "easy",
        points: 10,
        timeLimit: 30,
      },
      {
        question: "What is the Virtual DOM in React?",
        options: [
          "A lightweight copy of the real DOM",
          "A database for components",
          "A CSS framework",
          "A server-side rendering engine",
        ],
        correctAnswer: "A lightweight copy of the real DOM",
        difficulty: "medium",
        points: 20,
        timeLimit: 60,
      },
      {
        question: "What is the purpose of useCallback in React?",
        options: [
          "To memoize a callback function",
          "To create side effects",
          "To manage refs",
          "To handle routing",
        ],
        correctAnswer: "To memoize a callback function",
        difficulty: "medium",
        points: 20,
        timeLimit: 60,
      },
      {
        question: "How do you pass data from parent to child in React?",
        options: ["Using props", "Using state only", "Using localStorage", "Using sessions"],
        correctAnswer: "Using props",
        difficulty: "easy",
        points: 10,
        timeLimit: 30,
      },
      {
        question: "What is the correct way to handle events in React?",
        options: [
          "onClick={handleClick}",
          "onclick='handleClick()'",
          "onClick=handleClick()",
          "on-click={handleClick}",
        ],
        correctAnswer: "onClick={handleClick}",
        difficulty: "medium",
        points: 20,
        timeLimit: 60,
      },
      {
        question: "What does React.memo() do?",
        options: [
          "Memoizes a component to prevent unnecessary re-renders",
          "Creates a memo note",
          "Stores component state",
          "Handles error boundaries",
        ],
        correctAnswer: "Memoizes a component to prevent unnecessary re-renders",
        difficulty: "medium",
        points: 20,
        timeLimit: 60,
      },
      {
        question: "What is a custom hook in React?",
        options: [
          "A function starting with 'use' that contains hook logic",
          "A built-in React method",
          "A CSS class name pattern",
          "A test utility",
        ],
        correctAnswer: "A function starting with 'use' that contains hook logic",
        difficulty: "hard",
        points: 30,
        timeLimit: 90,
      },
      {
        question: "What is reconciliation in React?",
        options: [
          "The process of updating the DOM to match the Virtual DOM",
          "A debugging technique",
          "A server communication protocol",
          "A state management pattern",
        ],
        correctAnswer: "The process of updating the DOM to match the Virtual DOM",
        difficulty: "hard",
        points: 30,
        timeLimit: 90,
      },
    ],
  },
  {
    title: "Backend Battlefield: Node.js Wars",
    description:
      "Prove your backend expertise in Node.js, Express, and MongoDB. Winners earn direct interview opportunities for backend engineering roles.",
    company: "DataFlow Systems",
    skills: ["Node.js", "Express", "MongoDB", "REST APIs"],
    startTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    duration: 45,
    status: "upcoming",
    rewards: { xp: 300, coins: 150, internshipSlots: 5 },
    maxParticipants: 300,
    topNSelected: 5,
    coverGradient: "from-emerald-500 to-teal-600",
    questions: [
      {
        question: "What is middleware in Express.js?",
        options: [
          "Functions that access req, res, and next",
          "Database queries",
          "Static files",
          "Template engines",
        ],
        correctAnswer: "Functions that access req, res, and next",
        difficulty: "easy",
        points: 10,
        timeLimit: 30,
      },
      {
        question: "Which HTTP method is used to update a resource?",
        options: ["GET", "POST", "PUT", "DELETE"],
        correctAnswer: "PUT",
        difficulty: "easy",
        points: 10,
        timeLimit: 30,
      },
      {
        question: "What is MongoDB's equivalent of a table in SQL?",
        options: ["Document", "Collection", "Database", "Index"],
        correctAnswer: "Collection",
        difficulty: "easy",
        points: 10,
        timeLimit: 30,
      },
      {
        question: "What does JWT stand for?",
        options: ["JSON Web Token", "Java Web Tool", "JavaScript Widget Type", "JSON Work Thread"],
        correctAnswer: "JSON Web Token",
        difficulty: "medium",
        points: 20,
        timeLimit: 60,
      },
      {
        question: "How do you create an index in MongoDB?",
        options: ["db.collection.createIndex()", "db.index.create()", "create index on()", "db.addIndex()"],
        correctAnswer: "db.collection.createIndex()",
        difficulty: "medium",
        points: 20,
        timeLimit: 60,
      },
      {
        question: "What is the event loop in Node.js?",
        options: [
          "A mechanism that handles async callbacks",
          "A UI rendering loop",
          "A database connection pool",
          "A file watching system",
        ],
        correctAnswer: "A mechanism that handles async callbacks",
        difficulty: "medium",
        points: 20,
        timeLimit: 60,
      },
      {
        question: "What is the purpose of process.env in Node.js?",
        options: [
          "Accessing environment variables",
          "Creating processes",
          "Managing file system",
          "Handling errors",
        ],
        correctAnswer: "Accessing environment variables",
        difficulty: "easy",
        points: 10,
        timeLimit: 30,
      },
      {
        question: "What is aggregation pipeline in MongoDB?",
        options: [
          "A framework for data processing and transformation",
          "A backup system",
          "A connection pool",
          "A caching mechanism",
        ],
        correctAnswer: "A framework for data processing and transformation",
        difficulty: "hard",
        points: 30,
        timeLimit: 90,
      },
      {
        question: "What is the difference between process.nextTick and setImmediate?",
        options: [
          "nextTick runs before I/O, setImmediate after I/O",
          "They are identical",
          "setImmediate is synchronous",
          "nextTick is deprecated",
        ],
        correctAnswer: "nextTick runs before I/O, setImmediate after I/O",
        difficulty: "hard",
        points: 30,
        timeLimit: 90,
      },
      {
        question: "What is connection pooling in MongoDB?",
        options: [
          "Reusing database connections across requests",
          "Creating new connections per request",
          "Storing queries in cache",
          "A load balancing technique",
        ],
        correctAnswer: "Reusing database connections across requests",
        difficulty: "hard",
        points: 30,
        timeLimit: 90,
      },
    ],
  },
  {
    title: "Full-Stack Sprint: MERN Edition",
    description:
      "The ultimate MERN stack challenge. Test your end-to-end development skills across MongoDB, Express, React, and Node.js. Grand prize: Summer internship at a Silicon Valley startup!",
    company: "InnovateTech Labs",
    skills: ["MongoDB", "Express", "React", "Node.js", "JavaScript"],
    startTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    duration: 60,
    status: "upcoming",
    rewards: { xp: 500, coins: 250, internshipSlots: 2 },
    maxParticipants: 500,
    topNSelected: 2,
    coverGradient: "from-purple-500 to-pink-600",
    questions: [
      {
        question: "What does MERN stand for?",
        options: [
          "MongoDB, Express, React, Node.js",
          "MySQL, Express, React, Next.js",
          "MongoDB, Ember, React, Node.js",
          "MongoDB, Express, Redux, Node.js",
        ],
        correctAnswer: "MongoDB, Express, React, Node.js",
        difficulty: "easy",
        points: 10,
        timeLimit: 30,
      },
      {
        question: "Which package manager is commonly used with Node.js?",
        options: ["pip", "npm", "gem", "brew"],
        correctAnswer: "npm",
        difficulty: "easy",
        points: 10,
        timeLimit: 30,
      },
      {
        question: "What is cors middleware used for?",
        options: [
          "Allowing cross-origin requests",
          "Database encryption",
          "File compression",
          "Session management",
        ],
        correctAnswer: "Allowing cross-origin requests",
        difficulty: "easy",
        points: 10,
        timeLimit: 30,
      },
      {
        question: "How does useContext work in React?",
        options: [
          "Provides a way to share values between components without prop drilling",
          "Creates component styles",
          "Manages URL routing",
          "Handles form validation",
        ],
        correctAnswer: "Provides a way to share values between components without prop drilling",
        difficulty: "medium",
        points: 20,
        timeLimit: 60,
      },
      {
        question: "What is mongoose.Schema.Types.ObjectId used for?",
        options: [
          "Referencing documents in other collections",
          "Creating unique strings",
          "Validating emails",
          "Hashing passwords",
        ],
        correctAnswer: "Referencing documents in other collections",
        difficulty: "medium",
        points: 20,
        timeLimit: 60,
      },
      {
        question: "What is the purpose of Express Router?",
        options: [
          "Modular route handling",
          "Static file serving",
          "Database queries",
          "Error handling",
        ],
        correctAnswer: "Modular route handling",
        difficulty: "medium",
        points: 20,
        timeLimit: 60,
      },
      {
        question: "What is Server-Sent Events (SSE)?",
        options: [
          "A unidirectional communication from server to client",
          "A database trigger mechanism",
          "A frontend animation library",
          "A testing framework",
        ],
        correctAnswer: "A unidirectional communication from server to client",
        difficulty: "medium",
        points: 20,
        timeLimit: 60,
      },
      {
        question: "What is the purpose of useMemo hook in React?",
        options: [
          "Memoizing expensive computations",
          "Managing global state",
          "Creating DOM references",
          "Handling side effects",
        ],
        correctAnswer: "Memoizing expensive computations",
        difficulty: "hard",
        points: 30,
        timeLimit: 90,
      },
      {
        question: "Explain the concept of compound indexes in MongoDB",
        options: [
          "Indexes on multiple fields for optimizing complex queries",
          "Indexes that auto-increment",
          "Indexes for text search only",
          "Encrypted index structures",
        ],
        correctAnswer: "Indexes on multiple fields for optimizing complex queries",
        difficulty: "hard",
        points: 30,
        timeLimit: 90,
      },
      {
        question: "What is the N+1 query problem and how to solve it?",
        options: [
          "Fetching related data in separate queries; solve with population/joins",
          "A network error type",
          "A CSS specificity issue",
          "A memory leak pattern",
        ],
        correctAnswer: "Fetching related data in separate queries; solve with population/joins",
        difficulty: "hard",
        points: 30,
        timeLimit: 90,
      },
    ],
  },
];

async function seedEvents() {
  try {
    await mongoose.connect(MONGO_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      family: 4,
    });
    console.log("✅ Connected to MongoDB");

    // Clear existing events
    await Event.deleteMany({});
    console.log("🗑️  Cleared existing events");

    // Insert sample events
    const created = await Event.insertMany(sampleEvents);
    console.log(`🎮 Created ${created.length} sample events:`);
    created.forEach((e) => {
      console.log(`   → ${e.title} (${e.status}) — starts ${e.startTime.toLocaleString()}`);
    });

    console.log("\n✅ Event seeding complete!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding error:", err.message);
    process.exit(1);
  }
}

seedEvents();
