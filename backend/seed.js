// Run with: node seed.js
const mongoose = require('mongoose');
const dotenv   = require('dotenv');
const bcrypt   = require('bcryptjs');
const User     = require('./models/User');
const Question = require('./models/Question');

dotenv.config();

const questions = [
  { category:'React',    questionText:'Which hook is used to manage local component state in React?', options:['useEffect','useState','useContext','useRef'], correctAnswer:1, explanation:'useState returns a state variable and a setter. Calling the setter triggers a re-render with the new value.' },
  { category:'React',    questionText:"What does React Router's <Route> component primarily do?", options:['Fetches data from an API','Renders a component based on the URL path','Handles form submission','Connects to MongoDB'], correctAnswer:1, explanation:"React Router's <Route> matches the current URL to a path and renders the matching component." },
  { category:'React',    questionText:"In JSX, which attribute replaces the HTML 'class' attribute?", options:['class','className','cssClass','styleClass'], correctAnswer:1, explanation:"JSX uses className because 'class' is a reserved keyword in JavaScript." },
  { category:'React',    questionText:'What is the primary purpose of the useEffect hook?', options:['Declare state variables','Perform side effects after render','Pass data via props','Define routing rules'], correctAnswer:1, explanation:'useEffect runs after render and handles side effects: API calls, subscriptions, DOM mutations, timers.' },
  { category:'React',    questionText:'Which method prevents the default page reload on form submit in React?', options:['event.stopPropagation()','event.preventDefault()','event.cancel()','event.blockDefault()'], correctAnswer:1, explanation:'event.preventDefault() stops the browser default form submission so React can handle the data.' },
  { category:'Node.js',  questionText:'Which built-in Node.js module is used to create an HTTP server?', options:['path','fs','http','url'], correctAnswer:2, explanation:"The built-in 'http' module provides utilities to create servers and make HTTP requests." },
  { category:'Node.js',  questionText:'What does npm stand for?', options:['Node Package Manager','New Package Module','Node Program Module','Network Package Manager'], correctAnswer:0, explanation:'npm (Node Package Manager) is the default package manager for Node.js.' },
  { category:'Express',  questionText:'Which Express.js method registers a GET route handler?', options:['app.post()','app.use()','app.get()','app.route()'], correctAnswer:2, explanation:'app.get(path, callback) registers a handler that responds to HTTP GET requests at the given path.' },
  { category:'Express',  questionText:'What is the role of middleware in Express?', options:['Store data in MongoDB','Execute logic between request and response','Manage React state','Define DB schemas'], correctAnswer:1, explanation:'Middleware functions access req, res, and next — they run between receiving a request and sending the response.' },
  { category:'MongoDB',  questionText:'Which Mongoose method retrieves a document by its _id field?', options:['find()','findOne()','findById()','search()'], correctAnswer:2, explanation:'findById(id) is shorthand for findOne({ _id: id }). It queries the collection for a specific ObjectId.' },
  { category:'MongoDB',  questionText:'What does CRUD stand for in database operations?', options:['Create, Read, Update, Delete','Connect, Retrieve, Upload, Drop','Create, Route, Update, Deploy','Connect, Read, Use, Delete'], correctAnswer:0, explanation:'CRUD = Create (POST), Read (GET), Update (PUT/PATCH), Delete (DELETE) — the four standard DB operations.' },
  { category:'Security', questionText:'What does JWT stand for?', options:['Java Web Token','JSON Web Token','JavaScript Webhook Transfer','JSON Wrapper Type'], correctAnswer:1, explanation:'JSON Web Token (JWT) is a compact token used to securely transmit claims between parties.' },
  { category:'Security', questionText:'Which library is the standard for password hashing in Node.js?', options:['crypto','jsonwebtoken','bcrypt','helmet'], correctAnswer:2, explanation:'bcrypt auto-generates a salt per hash, making each hash unique even for identical passwords.' },
  { category:'Security', questionText:'Why are secrets stored in a .env file in a MERN app?', options:['To store UI styles','To keep config like DB URIs and JWT secrets outside source code','To cache DB queries','To manage React routing'], correctAnswer:1, explanation:'.env keeps sensitive data out of the codebase. dotenv loads them into process.env. The file is excluded via .gitignore.' },
  { category:'GitHub',   questionText:'Which Git command pushes local commits to the remote repository?', options:["git commit -m 'msg'",'git pull origin main','git push origin main','git merge main'], correctAnswer:2, explanation:"'git push origin main' uploads local commits to the 'main' branch of the remote repo named origin." },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Question.deleteMany({});
    await User.deleteMany({ role: 'admin' });
    console.log('🗑  Cleared existing questions and admin users');

    // Insert questions
    await Question.insertMany(questions);
    console.log(`📝 Inserted ${questions.length} questions`);

    // Create admin user
    await User.create({
      name: 'Admin',
      email: 'admin@awt.com',
      password: 'admin123',
      role: 'admin',
    });
    console.log('👤 Admin user created: admin@awt.com / admin123');
    console.log('\n✅ Seed complete! You can now start the server.');
  } catch (err) {
    console.error('❌ Seed error:', err.message);
  } finally {
    mongoose.connection.close();
  }
}

seed();
