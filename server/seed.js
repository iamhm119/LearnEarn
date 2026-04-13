const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
const LearningPath = require("./models/LearningPath");
const Course = require("./models/Course");
const Module = require("./models/Module");

const connect = async () => {
  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 });
  console.log("✅ MongoDB connected");
};

const seed = async () => {
  try {
    await connect();

    await Module.deleteMany({});
    await Course.deleteMany({});
    await LearningPath.deleteMany({});
    console.log("🗑️  Cleared old data");

    let admin = await User.findOne({ email: "admin@learnearnn.com" });
    if (!admin) {
      const hashed = await bcrypt.hash("Admin@1234", 10);
      admin = await User.create({
        name: "Admin",
        email: "admin@learnearnn.com",
        password: hashed,
        role: "admin",
      });
      console.log("👤 Admin user created: admin@learnearnn.com / Admin@1234");
    }

    const dsaCourse1Modules = await Module.insertMany([
      {
        courseId: null, title: "Introduction to Arrays", order: 0,
        description: "Learn the fundamentals of arrays and indexing.",
        content: `Arrays are one of the most fundamental data structures in computer science. An array stores elements of the same type in contiguous memory locations. The index of the first element is 0 (zero-based indexing). Key operations include: Access O(1), Search O(n), Insert O(n), Delete O(n). Arrays are used in sorting algorithms, hash tables, dynamic programming, and matrix operations. Common problems: Two Sum, Maximum Subarray, Rotate Array, Merge Sorted Arrays.`,
        xpReward: 50, coinReward: 10,
      },
      {
        courseId: null, title: "Sorting Algorithms", order: 1,
        description: "Master Bubble, Merge, and Quick sort.",
        content: `Sorting algorithms arrange data in a specific order. Bubble Sort: O(n²) time - compares adjacent elements. Selection Sort: O(n²) - finds minimum repeatedly. Insertion Sort: O(n²) best case O(n) - builds sorted portion. Merge Sort: O(n log n) - divide and conquer, stable. Quick Sort: O(n log n) average, O(n²) worst - pivot partitioning. Heap Sort: O(n log n) - uses binary heap. Counting Sort: O(n+k) - for integer keys. Radix Sort: O(nk) - digit by digit. In practice: use Merge Sort for linked lists, Quick Sort for arrays, Counting Sort for bounded integers.`,
        xpReward: 75, coinReward: 15,
      },
      {
        courseId: null, title: "Linked Lists Deep Dive", order: 2,
        description: "Singly, doubly, and circular linked lists.",
        content: `A linked list is a linear data structure where elements are stored in nodes. Each node has data and a pointer to the next node. Types: Singly Linked List (one direction), Doubly Linked List (both directions), Circular Linked List (tail points to head). Operations: Insertion at head O(1), Insertion at tail O(n), Deletion O(n), Search O(n). Advantages: Dynamic size, efficient insertions/deletions at head. Disadvantages: No random access, extra memory for pointers. Applications: Implementing stacks, queues, hash table chaining, LRU Cache. Common interview problems: Reverse a linked list, detect cycle (Floyd's algorithm), find middle node, merge two sorted lists.`,
        xpReward: 75, coinReward: 15,
      },
    ]);

    const dsaCourse1 = await Course.create({
      title: "Arrays & Sorting",
      description: "Master arrays and sorting algorithms essential for technical interviews. Learn time complexity, space complexity, and implementation patterns.",
      difficulty: "easy", category: "Programming",
      instructor: admin._id, isPublished: true,
      tags: ["Arrays", "Sorting", "Big-O"], estimatedHours: 3,
      modules: dsaCourse1Modules.map((m) => m._id),
    });
    await Module.updateMany({ _id: { $in: dsaCourse1Modules.map((m) => m._id) } }, { courseId: dsaCourse1._id });

    const dsaCourse2Modules = await Module.insertMany([
      {
        courseId: null, title: "Stacks & Queues", order: 0,
        description: "Stack LIFO and Queue FIFO data structures.",
        content: `Stack (LIFO - Last In First Out): Operations push O(1), pop O(1), peek O(1). Applications: function call stack, undo mechanisms, expression evaluation, balanced parentheses. Queue (FIFO - First In First Out): Operations enqueue O(1), dequeue O(1). Applications: BFS traversal, scheduling, printer queues. Deque (Double-ended queue): insert/remove from both ends. Priority Queue: always removes highest priority element, implemented with heap. Monotonic Stack: maintain increasing or decreasing order, used for next greater element problems. Common problems: Valid Parentheses, Min Stack, Sliding Window Maximum, Implement Queue using Stacks.`,
        xpReward: 60, coinReward: 12,
      },
      {
        courseId: null, title: "Trees & Binary Search Trees", order: 1,
        description: "Tree traversals and BST operations.",
        content: `A tree is a hierarchical data structure with a root node and subtrees. Binary Tree: each node has at most 2 children. Binary Search Tree (BST): left < root < right. Traversals: Inorder (LNR) - gives sorted order for BST, Preorder (NLR) - copies tree, Postorder (LRN) - deletes tree, Level Order (BFS). BST Operations: Insert O(h), Search O(h), Delete O(h) where h = height. Balanced BST (AVL, Red-Black): guarantees h = O(log n). Complete Binary Tree: all levels full except last, filled left to right. Perfect Binary Tree: all leaf nodes same level, 2^h - 1 nodes. Heap: complete binary tree with heap property, max-heap: parent >= children. Common problems: Height of tree, Lowest Common Ancestor, Diameter, Path Sum, Level Order Traversal, Serialize/Deserialize.`,
        xpReward: 80, coinReward: 16,
      },
      {
        courseId: null, title: "Dynamic Programming Basics", order: 2,
        description: "Memoization, tabulation, and classic DP patterns.",
        content: `Dynamic Programming (DP) solves problems by breaking them into subproblems and storing results. Two approaches: Top-Down (Memoization) - recursion + cache, Bottom-Up (Tabulation) - iterative, fill table. Key concept: Optimal Substructure + Overlapping Subproblems. Classic problems: Fibonacci (O(n) with DP vs O(2^n) recursive), Coin Change (minimum coins to make amount), Longest Common Subsequence, 0/1 Knapsack, Longest Increasing Subsequence, Edit Distance, Matrix Chain Multiplication. DP on grids: Unique Paths, Minimum Path Sum. State design: think what information you need to make optimal decision at each step. Time: O(states × transitions). Space optimization: often can reduce from 2D to 1D array.`,
        xpReward: 100, coinReward: 20,
      },
    ]);

    const dsaCourse2 = await Course.create({
      title: "Trees, Stacks & Dynamic Programming",
      description: "Level up your DSA skills with trees, stack-based algorithms, and dynamic programming patterns used in top tech interviews.",
      difficulty: "medium", category: "Programming",
      instructor: admin._id, isPublished: true,
      tags: ["Trees", "DP", "Stacks", "Interview Prep"], estimatedHours: 5,
      modules: dsaCourse2Modules.map((m) => m._id),
    });
    await Module.updateMany({ _id: { $in: dsaCourse2Modules.map((m) => m._id) } }, { courseId: dsaCourse2._id });

    const dsaPath = await LearningPath.create({
      title: "DSA Mastery Track",
      description: "A comprehensive data structures and algorithms track covering arrays, sorting, trees, stacks, and dynamic programming — essential for FAANG-level interviews.",
      category: "Programming", difficulty: "intermediate",
      tags: ["DSA", "Interview Prep", "Algorithms", "FAANG"],
      courses: [dsaCourse1._id, dsaCourse2._id],
      createdBy: admin._id, isPublished: true, estimatedHours: 8,
    });

    // ── Web Dev Track ────────────────────────────────────────────────────────
    const webCourse1Modules = await Module.insertMany([
      {
        courseId: null, title: "HTML & CSS Fundamentals", order: 0,
        description: "Semantic HTML5, Flexbox, and CSS Grid.",
        content: `HTML (HyperText Markup Language) is the backbone of every website. Semantic HTML5 elements include header, nav, main, section, article, aside, footer. They improve accessibility (screen readers) and SEO. CSS (Cascading Style Sheets) styles HTML elements. Box Model: content + padding + border + margin. Flexbox: one-dimensional layout, align items in row or column. Properties: display:flex, flex-direction, justify-content, align-items, flex-wrap, flex-grow. CSS Grid: two-dimensional layout, rows AND columns simultaneously. Properties: display:grid, grid-template-columns, grid-template-rows, gap, grid-area, grid-column, grid-row. Responsive Design: media queries, mobile-first approach. CSS Variables: --primary-color: #3b82f6. CSS Specificity: inline > id > class > element. Modern CSS: custom properties, clamp(), min(), max(), container queries.`,
        xpReward: 50, coinReward: 10,
      },
      {
        courseId: null, title: "JavaScript Essentials", order: 1,
        description: "ES6+, async/await, DOM manipulation, and closures.",
        content: `JavaScript is the programming language of the web. ES6+ features: let/const (block-scoped), arrow functions, template literals, destructuring, spread operator, rest parameters, default parameters. Promises: represent eventual completion/failure of async operation. Promise chaining with .then().catch(). Async/Await: syntactic sugar over Promises, makes async code look synchronous. Event Loop: single-threaded, call stack + callback queue + microtask queue. Closures: function retaining access to its lexical scope. Prototype Chain: JavaScript's inheritance mechanism. Array methods: map, filter, reduce, find, findIndex, some, every, flat, flatMap. DOM manipulation: querySelector, addEventListener, createElement, appendChild. Modules: import/export. Error handling: try/catch/finally. Common patterns: Module pattern, Observer pattern, Factory pattern.`,
        xpReward: 70, coinReward: 14,
      },
      {
        courseId: null, title: "React.js Core Concepts", order: 2,
        description: "Components, hooks, state management, and routing.",
        content: `React is a JavaScript library for building user interfaces. Core concepts: Components (functional vs class), JSX (JavaScript XML), Virtual DOM (diffing algorithm for efficient updates). Hooks: useState (state in functional components), useEffect (side effects, lifecycle), useContext (consume context), useReducer (complex state), useMemo (memoize values), useCallback (memoize functions), useRef (access DOM nodes). Props: read-only data passed from parent to child. State: mutable data that triggers re-render when changed. Component lifecycle: Mount → Update → Unmount (via useEffect). Context API: avoid prop drilling, share data globally. React Router: client-side routing, useNavigate, useParams, useLocation. Performance: React.memo, lazy loading, code splitting. State management patterns: prop drilling vs Context vs Redux vs Zustand.`,
        xpReward: 80, coinReward: 16,
      },
    ]);

    const webCourse1 = await Course.create({
      title: "Frontend Foundations",
      description: "Build a rock-solid foundation in HTML, CSS, and JavaScript before diving into React. Learn modern ES6+, responsive design, and DOM manipulation.",
      difficulty: "easy", category: "Programming",
      instructor: admin._id, isPublished: true,
      tags: ["HTML", "CSS", "JavaScript", "React"], estimatedHours: 6,
      modules: webCourse1Modules.map((m) => m._id),
    });
    await Module.updateMany({ _id: { $in: webCourse1Modules.map((m) => m._id) } }, { courseId: webCourse1._id });

    const webCourse2Modules = await Module.insertMany([
      {
        courseId: null, title: "Node.js & Express Backend", order: 0,
        description: "REST APIs, middleware, and MVC architecture.",
        content: `Node.js runs JavaScript on the server using the V8 engine. It uses an event-driven, non-blocking I/O model — very efficient for I/O-heavy apps. npm is the Node Package Manager. Express.js is a minimal, flexible Node.js web framework. Core concepts: app.get/post/put/delete (HTTP methods), req/res objects, middleware (functions with req, res, next), routing, error handling middleware. MVC Pattern: Model (data), View (UI), Controller (business logic). Building REST APIs: proper status codes (200 OK, 201 Created, 400 Bad Request, 401 Unauthorized, 404 Not Found, 500 Server Error). Input validation with express-validator or Joi. Environment variables with dotenv. CORS: Cross-Origin Resource Sharing. Rate limiting and security with helmet, cors, express-rate-limit.`,
        xpReward: 70, coinReward: 14,
      },
      {
        courseId: null, title: "MongoDB & Mongoose", order: 1,
        description: "NoSQL database design, schemas, and aggregation.",
        content: `MongoDB is a NoSQL document database. Documents are stored in BSON format (Binary JSON). Collections = tables, Documents = rows, Fields = columns. Schema: flexible, but Mongoose adds structure with schema validation. Mongoose Schema types: String, Number, Boolean, Date, ObjectId, Array, Mixed. CRUD: Model.create(), Model.find(), Model.findById(), Model.findByIdAndUpdate(), Model.deleteOne(). Query operators: $gt, $lt, $gte, $lte, $in, $nin, $or, $and, $not. Relationships: Embedding (nested documents) vs Referencing (ObjectId refs). Populate: join-like operation to fetch referenced documents. Aggregation Pipeline: $match, $group, $sort, $limit, $project, $lookup (join). Indexes: improve query performance, add with schema.index(). Atlas: MongoDB cloud hosting.`,
        xpReward: 75, coinReward: 15,
      },
      {
        courseId: null, title: "JWT Authentication & Security", order: 2,
        description: "JWT auth, bcrypt password hashing, and best practices.",
        content: `Authentication verifies identity; Authorization determines permissions. JWT (JSON Web Token): three parts - Header.Payload.Signature, encoded in Base64. Stateless: no session storage needed. Flow: User logs in → server creates JWT → client stores JWT (localStorage or httpOnly cookie) → client sends JWT in Authorization header → server verifies → grants access. bcrypt: password hashing with salt for security. Never store plaintext passwords. Salting: random data added to password before hashing. Token expiry: set short-lived access tokens (15min–1hr), long-lived refresh tokens (7 days). Security best practices: HTTPS only, httpOnly cookies prevent XSS, SameSite cookie prevents CSRF, validate all inputs, rate limiting on auth routes, CORS configuration. Role-based access control (RBAC): admin vs user permissions. Helmet.js: sets security HTTP headers.`,
        xpReward: 80, coinReward: 16,
      },
    ]);

    const webCourse2 = await Course.create({
      title: "Full-Stack MERN Development",
      description: "Build complete full-stack applications with Node.js, Express, MongoDB, and integrate with React. Learn authentication, REST APIs, and deployment.",
      difficulty: "medium", category: "Programming",
      instructor: admin._id, isPublished: true,
      tags: ["Node.js", "Express", "MongoDB", "JWT", "MERN"], estimatedHours: 7,
      modules: webCourse2Modules.map((m) => m._id),
    });
    await Module.updateMany({ _id: { $in: webCourse2Modules.map((m) => m._id) } }, { courseId: webCourse2._id });

    const webPath = await LearningPath.create({
      title: "Full-Stack Web Dev Track",
      description: "Go from zero to full-stack developer. Master HTML/CSS, JavaScript, React, Node.js, MongoDB, and build real-world projects portfolio-ready to land your first dev job.",
      category: "Programming", difficulty: "beginner",
      tags: ["Web Dev", "MERN", "React", "Full Stack"],
      courses: [webCourse1._id, webCourse2._id],
      createdBy: admin._id, isPublished: true, estimatedHours: 13,
    });

    // ── ML Track ─────────────────────────────────────────────────────────────
    const mlCourse1Modules = await Module.insertMany([
      {
        courseId: null, title: "Python for Data Science", order: 0,
        description: "NumPy, Pandas, and data manipulation essentials.",
        content: `Python is the go-to language for machine learning and data science. Key libraries: NumPy (numerical computing, N-dimensional arrays, vectorized operations), Pandas (data manipulation, DataFrames, Series, read_csv, groupby, merge, pivot), Matplotlib (2D plotting), Seaborn (statistical visualizations). NumPy arrays are faster than Python lists due to vectorization. Broadcasting: operations on arrays of different shapes. Pandas DataFrame: 2D labeled data structure. Key operations: df.head(), df.info(), df.describe(), df.dropna(), df.fillna(), df.groupby(), df.merge(). Data preprocessing: handling missing values, encoding categorical variables (one-hot encoding, label encoding), feature scaling (StandardScaler, MinMaxScaler). Exploratory Data Analysis (EDA): understand distributions, correlations, outliers using visualizations.`,
        xpReward: 60, coinReward: 12,
      },
      {
        courseId: null, title: "Machine Learning Algorithms", order: 1,
        description: "Supervised and unsupervised learning core algorithms.",
        content: `Machine Learning: systems that learn from data to make predictions. Supervised Learning: labeled training data. Types: Regression (predict continuous value), Classification (predict category). Algorithms: Linear Regression (y = mx + b, minimize MSE), Logistic Regression (classification, sigmoid function), Decision Trees (split by information gain/Gini), Random Forest (ensemble of trees, reduces overfitting), Support Vector Machines (find optimal hyperplane), K-Nearest Neighbors (predict based on k closest neighbors). Unsupervised Learning: no labels. K-Means Clustering (assign to k clusters by centroid distance), PCA (Principal Component Analysis, dimensionality reduction). Model evaluation: Train/Test split (80/20), Cross-validation (k-fold), Metrics: Accuracy, Precision, Recall, F1-Score, AUC-ROC (classification), MSE, RMSE, R² (regression). Overfitting (high variance) vs Underfitting (high bias). Regularization: L1 (Lasso), L2 (Ridge).`,
        xpReward: 90, coinReward: 18,
      },
      {
        courseId: null, title: "Neural Networks & Deep Learning", order: 2,
        description: "Perceptrons, backpropagation, CNNs, and frameworks.",
        content: `Neural Networks are inspired by human brains. Layers: Input → Hidden → Output. Activation functions: ReLU (max(0,x)) most common, Sigmoid (0 to 1, for binary classification), Tanh (-1 to 1), Softmax (multiclass). Forward propagation: compute predictions layer by layer. Loss functions: Binary Cross-Entropy (binary classification), Categorical Cross-Entropy (multiclass), MSE (regression). Backpropagation: chain rule to compute gradients. Gradient Descent: update weights to minimize loss. Optimizers: SGD, Adam (adaptive learning rate, most popular), RMSprop. Batch Size: mini-batch balances stability and speed. CNNs (Convolutional Neural Networks): for images. Layers: Convolution (feature extraction), Pooling (downsampling), Flatten, Dense. RNNs/LSTMs: for sequential data (time series, NLP). Transfer Learning: use pretrained models (VGG, ResNet, BERT). Frameworks: TensorFlow/Keras, PyTorch. Common pitfalls: vanishing gradients (use ReLU, BatchNorm), overfitting (dropout, data augmentation).`,
        xpReward: 100, coinReward: 20,
      },
    ]);

    const mlCourse1 = await Course.create({
      title: "ML Foundations",
      description: "Complete machine learning foundations from Python data science tools to core ML algorithms and neural network fundamentals.",
      difficulty: "hard", category: "Science",
      instructor: admin._id, isPublished: true,
      tags: ["Python", "Machine Learning", "Deep Learning", "Neural Networks"], estimatedHours: 8,
      modules: mlCourse1Modules.map((m) => m._id),
    });
    await Module.updateMany({ _id: { $in: mlCourse1Modules.map((m) => m._id) } }, { courseId: mlCourse1._id });

    const mlPath = await LearningPath.create({
      title: "Machine Learning Track",
      description: "Master machine learning from Python fundamentals to neural networks. Learn industry-standard algorithms, model evaluation, and deep learning with real datasets.",
      category: "Science", difficulty: "advanced",
      tags: ["Machine Learning", "AI", "Python", "Data Science", "Deep Learning"],
      courses: [mlCourse1._id],
      createdBy: admin._id, isPublished: true, estimatedHours: 8,
    });
    // ── Cloud Computing Track ────────────────────────────────────────────────
    const cloudCourseModules = await Module.insertMany([
      {
        courseId: null, title: "Introduction to Cloud Computing", order: 0,
        description: "What is the cloud and why do we use it?",
        content: `Cloud computing is the delivery of computing services—including servers, storage, databases, networking, software, analytics, and intelligence—over the Internet ("the cloud") to offer faster innovation, flexible resources, and economies of scale. Key benefits: Cost (eliminates capital expense), Speed (self-service and on-demand), Global scale, Productivity, Performance, Reliability, and Security. Types of cloud deployments: Public cloud (owned and operated by third-party), Private cloud (used exclusively by one business), and Hybrid cloud (combines public and private).`,
        xpReward: 50, coinReward: 10,
      },
      {
        courseId: null, title: "Cloud Service Models", order: 1,
        description: "IaaS, PaaS, SaaS, and Serverless.",
        content: `Cloud services typically fall into four broad categories. Infrastructure as a Service (IaaS): Rent IT infrastructure—servers and virtual machines (VMs), storage, networks, operating systems. Platform as a Service (PaaS): Supply an on-demand environment for developing, testing, delivering, and managing software applications. Software as a Service (SaaS): Method for delivering software applications over the Internet, on demand and typically on a subscription basis. Serverless computing: Focusing on building app functionality without spending time continually managing the servers and infrastructure required to do so. The cloud provider handles the setup, capacity planning, and server management.`,
        xpReward: 60, coinReward: 12,
      },
      {
        courseId: null, title: "Major Cloud Providers (AWS, Azure, GCP)", order: 2,
        description: "Overview of the top tier public cloud providers.",
        content: `Amazon Web Services (AWS) is the most comprehensive and broadly adopted cloud platform, offering over 200 fully featured services from data centers globally. Microsoft Azure is an ever-expanding set of cloud services to help your organization meet your business challenges, strong in enterprise integration. Google Cloud Platform (GCP) provides infrastructure and services like Data Analytics and Machine Learning, leveraging Google's internal infrastructure. Core services across all three include Compute (EC2, Virtual Machines, Compute Engine), Storage (S3, Blob Storage, Cloud Storage), and Databases (RDS, SQL Database, Cloud SQL).`,
        xpReward: 70, coinReward: 14,
      },
    ]);

    const cloudCourse = await Course.create({
      title: "Cloud Computing Fundamentals",
      description: "Learn the fundamentals of cloud computing, including service models (IaaS, PaaS, SaaS) and major providers like AWS, Azure, and GCP.",
      difficulty: "easy", category: "Programming",
      instructor: admin._id, isPublished: true,
      tags: ["Cloud", "AWS", "Azure", "GCP"], estimatedHours: 4,
      modules: cloudCourseModules.map((m) => m._id),
    });
    await Module.updateMany({ _id: { $in: cloudCourseModules.map((m) => m._id) } }, { courseId: cloudCourse._id });

    const cloudPath = await LearningPath.create({
      title: "Cloud Computing Track",
      description: "Master the cloud. Learn to deploy, manage, and scale applications on modern cloud infrastructure.",
      category: "Programming", difficulty: "beginner",
      tags: ["Cloud", "DevOps", "AWS"],
      courses: [cloudCourse._id],
      createdBy: admin._id, isPublished: true, estimatedHours: 4,
    });

    // ── Cyber Security Track ─────────────────────────────────────────────────
    const cyberCourseModules = await Module.insertMany([
      {
        courseId: null, title: "Introduction to Cyber Security", order: 0,
        description: "The CIA Triad and Threat Landscape.",
        content: `Cybersecurity is the practice of protecting systems, networks, and programs from digital attacks. These cyberattacks are usually aimed at accessing, changing, or destroying sensitive information; extorting money from users; or interrupting normal business processes. The CIA Triad is a model designed to guide policies for information security within an organization: Confidentiality (data privacy), Integrity (data accuracy), and Availability (reliable access). Common attack surfaces include IoT devices, mobile computing, and unpatched software. Human error (social engineering/phishing) remains one of the largest security vulnerabilities.`,
        xpReward: 60, coinReward: 12,
      },
      {
        courseId: null, title: "Network Security & Cryptography", order: 1,
        description: "Firewalls, VPNs, and Encryption.",
        content: `Network security consists of policies and practices adopted to prevent and monitor unauthorized access, misuse, modification, or denial of a computer network. Key tools include Firewalls (filters incoming/outgoing traffic), VPNs (Virtual Private Networks - encrypts internet connection), and IDS/IPS (Intrusion Detection/Prevention Systems). Cryptography is the practice of secure communication. Symmetric encryption uses one key (AES). Asymmetric encryption uses a public and private key pair (RSA). Hashing (SHA-256) is a one-way function used for verifying data integrity and securely storing passwords.`,
        xpReward: 80, coinReward: 16,
      },
      {
        courseId: null, title: "Ethical Hacking basics", order: 2,
        description: "Penetration testing and Defensive strategies.",
        content: `Ethical Hacking (White Hat Hacking) involves legitimately seeking out weaknesses and vulnerabilities in systems using the same knowledge and tools as a malicious hacker. Penetration Testing phases: Reconnaissance (gathering info), Scanning (finding open ports/vulns), Gaining Access (exploiting), Maintaining Access (backdoors), and Reporting. Common vulnerabilities outlined by OWASP Top 10 include Injection (SQLi), Broken Authentication, Sensitive Data Exposure, and Cross-Site Scripting (XSS). Defensive strategies include principle of least privilege, zero trust architecture, regular patching, and incident response planning.`,
        xpReward: 100, coinReward: 20,
      },
    ]);

    const cyberCourse = await Course.create({
      title: "Cyber Security Essentials",
      description: "Introduction to cyber security concepts, cryptography, network security, and ethical hacking fundamentals.",
      difficulty: "medium", category: "Other",
      instructor: admin._id, isPublished: true,
      tags: ["Security", "Networking", "Hacking"], estimatedHours: 6,
      modules: cyberCourseModules.map((m) => m._id),
    });
    await Module.updateMany({ _id: { $in: cyberCourseModules.map((m) => m._id) } }, { courseId: cyberCourse._id });

    const cyberPath = await LearningPath.create({
      title: "Cyber Security Track",
      description: "Learn how to protect data, networks, and applications from cyber attacks and modern vulnerabilities.",
      category: "Other", difficulty: "intermediate",
      tags: ["Security", "Cyber", "InfoSec"],
      courses: [cyberCourse._id],
      createdBy: admin._id, isPublished: true, estimatedHours: 6,
    });

    console.log("\n🎉 Seed completed successfully!\n");
    console.log(`📚 Learning Paths created:`);
    console.log(`   🔷 ${dsaPath.title} (${dsaCourse1Modules.length + dsaCourse2Modules.length} modules)`);
    console.log(`   🌐 ${webPath.title} (${webCourse1Modules.length + webCourse2Modules.length} modules)`);
    console.log(`   🤖 ${mlPath.title} (${mlCourse1Modules.length} modules)`);
    console.log(`   ☁️ ${cloudPath.title} (${cloudCourseModules.length} modules)`);
    console.log(`   🛡️ ${cyberPath.title} (${cyberCourseModules.length} modules)`);
    console.log(`\n👤 Admin: admin@learnearnn.com / Admin@1234`);

  } catch (err) {
    console.error("❌ Seed failed:", err.message);
  } finally {
    await mongoose.disconnect();
    console.log("📦 MongoDB disconnected");
    process.exit(0);
  }
};

seed();
