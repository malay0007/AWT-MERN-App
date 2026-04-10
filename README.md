# AWT Quiz App — MERN Stack
### Marwadi University | Faculty of Engineering & Technology
### Computer Engineering | Semester 4 | Subject: AWT (01CE1412)

A full-stack quiz application built on the **MERN Stack** (MongoDB, Express.js, React.js, Node.js) with JWT authentication, bcrypt password hashing, role-based access control, and a React component-based frontend with React Router.

---

## Project Structure

```
awt-mern/
├── backend/
│   ├── controllers/
│   │   ├── authController.js       ← Register, login, getMe
│   │   ├── questionController.js   ← CRUD + answer verify
│   │   └── scoreController.js      ← Submit & fetch scores
│   ├── middleware/
│   │   └── authMiddleware.js       ← JWT protect + RBAC authorize
│   ├── models/
│   │   ├── User.js                 ← bcrypt password hashing
│   │   ├── Question.js             ← Quiz questions schema
│   │   └── Score.js                ← Quiz results schema
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── questionRoutes.js
│   │   └── scoreRoutes.js
│   ├── .env                        ← ⚠ Add your MongoDB URI here
│   ├── seed.js                     ← Seeds 15 questions + admin user
│   └── server.js                   ← Express entry point
│
└── frontend/
    ├── src/
    │   ├── context/
    │   │   └── AuthContext.jsx     ← Global auth state (JWT storage)
    │   ├── components/
    │   │   └── Navbar.jsx
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── Home.jsx            ← Student dashboard
    │   │   ├── Quiz.jsx            ← Timer, options, verify API
    │   │   ├── Result.jsx          ← Score ring + review
    │   │   ├── Leaderboard.jsx
    │   │   └── admin/
    │   │       ├── AdminDashboard.jsx
    │   │       ├── AdminQuestions.jsx  ← Full CRUD
    │   │       └── AdminScores.jsx
    │   ├── App.jsx                 ← React Router + Protected routes
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

## Prerequisites

Install these before running:

1. **Node.js** (LTS) — https://nodejs.org → Download & install
2. **MongoDB Atlas account** — https://cloud.mongodb.com (free tier is fine)

---

## Step-by-Step Setup

### Step 1 — Get your MongoDB Atlas connection string

1. Log in to https://cloud.mongodb.com
2. Create a **free cluster** (M0)
3. Go to **Database Access** → Add a user (username + password)
4. Go to **Network Access** → Add IP `0.0.0.0/0` (allow all)
5. Go to **Clusters** → click **Connect** → **Connect your application**
6. Copy the connection string — it looks like:
   ```
   mongodb+srv://myuser:mypassword@cluster0.abc123.mongodb.net/?retryWrites=true&w=majority
   ```

### Step 2 — Configure the backend .env

Open `backend/.env` and replace the placeholder:

```env
MONGO_URI=mongodb+srv://myuser:mypassword@cluster0.abc123.mongodb.net/awt_quiz?retryWrites=true&w=majority
JWT_SECRET=any_long_random_string_here
```

### Step 3 — Install backend dependencies

Open a terminal in VS Code (`Ctrl + `` ` ``):

```bash
cd backend
npm install
```

### Step 4 — Seed the database (questions + admin user)

```bash
node seed.js
```

You should see:
```
✅ Connected to MongoDB
🗑  Cleared existing questions and admin users
📝 Inserted 15 questions
👤 Admin user created: admin@awt.com / admin123
✅ Seed complete!
```

### Step 5 — Start the backend server

```bash
npm run dev
```

You should see:
```
✅ MongoDB connected
🚀 Server running on http://localhost:5000
```

### Step 6 — Install & start the frontend

Open a **second terminal** in VS Code:

```bash
cd frontend
npm install
npm run dev
```

Open your browser at **http://localhost:5173**

---

## Login Credentials

| Role    | Email            | Password  |
|---------|-----------------|-----------|
| Admin   | admin@awt.com   | admin123  |
| Student | Register yourself via the app |

---

## API Endpoints

| Method | Route                    | Access        | Description                  |
|--------|--------------------------|---------------|------------------------------|
| POST   | /api/auth/register       | Public        | Register a new student       |
| POST   | /api/auth/login          | Public        | Login and receive JWT token  |
| GET    | /api/auth/me             | Private       | Get current user             |
| GET    | /api/questions           | Private       | Get questions (no answers)   |
| POST   | /api/questions/verify    | Private       | Verify answer + explanation  |
| GET    | /api/questions/admin     | Admin only    | Get questions with answers   |
| POST   | /api/questions           | Admin only    | Create question              |
| PUT    | /api/questions/:id       | Admin only    | Update question              |
| DELETE | /api/questions/:id       | Admin only    | Delete question              |
| POST   | /api/scores              | Private       | Submit quiz result           |
| GET    | /api/scores/leaderboard  | Private       | Global leaderboard           |
| GET    | /api/scores/me           | Private       | My own scores                |
| GET    | /api/scores              | Admin only    | All scores                   |

---

## Assignment Requirements Coverage

| Requirement                                    | Status |
|------------------------------------------------|--------|
| React component-based UI (client & admin)      | ✅     |
| Responsive design                              | ✅     |
| Forms & validation (login, register, CRUD)     | ✅     |
| Routing using React Router                     | ✅     |
| Node.js & Express REST APIs                    | ✅     |
| Database schema design (User, Question, Score) | ✅     |
| CRUD operations (questions)                    | ✅     |
| Error handling                                 | ✅     |
| JWT-based authentication                       | ✅     |
| Password hashing (bcrypt)                      | ✅     |
| Role-based access control (student / admin)    | ✅     |
| Environment variable usage (.env)              | ✅     |

---

*Subject: AWT (01CE1412) · Faculty of Engineering & Technology · Marwadi University*
