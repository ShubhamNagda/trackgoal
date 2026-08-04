# 🎯 TrackGoal

A full-stack task tracker: register/login with password or email OTP (via Nodemailer),
add/update/delete tasks, auto-move yesterday's unfinished tasks to today, track progress
with progress bars (today / tomorrow / all tasks), chat with a Gemini-powered assistant,
and share tasks with other users by email.

**Stack:** Node.js + Express + MongoDB (Mongoose) on the backend, React (Vite) + Tailwind CSS
on the frontend — no Redux, just React Context + hooks.

---

## Folder structure

```
trackgoal/
├── backend/          # Express API
│   ├── config/        # MongoDB connection
│   ├── controllers/   # auth, task, chat logic
│   ├── middleware/     # JWT auth guard
│   ├── models/         # User, Task (Mongoose schemas)
│   ├── routes/          # /api/auth, /api/tasks, /api/chat
│   ├── utils/            # nodemailer OTP + share emails
│   └── server.js
└── frontend/          # React + Vite + Tailwind app
    └── src/
        ├── api/         # axios instance (attaches JWT)
        ├── context/     # AuthContext (no redux)
        ├── components/  # Navbar, TaskForm, TaskCard, ProgressBar, Chatbot, OtpLogin
        └── pages/       # Login, Register, Dashboard
```

---

## 1. Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:

- `MONGO_URI` — your MongoDB connection string (local `mongodb://127.0.0.1:27017/trackgoal`
  or a MongoDB Atlas URI).
- `JWT_SECRET` — any long random string.
- `EMAIL_USER` / `EMAIL_PASS` — an email account for sending OTPs. If using Gmail, turn on
  2-Step Verification and create an **App Password** (your normal Gmail password will not work).
- `GEMINI_API_KEY` — get a free key from [Google AI Studio](https://aistudio.google.com/apikey)
  for the chatbot.

Run it:

```bash
npm run dev     # nodemon, auto-restarts
# or
npm start
```

The API runs on `http://localhost:5000`.

---

## 2. Frontend setup

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

The app runs on `http://localhost:5173`.

---

## 3. How the OTP flow works

- **Register:** fill the form → account is created (unverified) → a 6-digit OTP is emailed →
  enter it on the next screen to verify and get logged in automatically.
- **Login:**
  - **Password tab:** normal email + password login.
  - **OTP tab:** enter your email → OTP is emailed → enter the code to log in, no password
    needed.

## 4. Key features

- JWT-based auth, protected API routes.
- Add / edit / delete tasks, each with a due date and priority.
- "Move yesterday's pending tasks to today" button — bulk-updates any task still marked
  incomplete from yesterday.
- Progress bars for **Today**, **Tomorrow**, and **All tasks**, computed on the backend.
- Share a task with another user by email — they get a notification email, and if they
  already have a TrackGoal account, the task is copied straight into their list.
- Floating chatbot (bottom-right) powered by the Gemini API, aware of your tasks for today.

## Notes

- This is a learning/portfolio-style project — kept intentionally simple and readable.
- Passwords are hashed with bcrypt; OTPs expire after `OTP_EXPIRES_MIN` minutes (default 5).
- For production, add rate-limiting on the OTP endpoints and HTTPS.
