# 🏠 Distributed Airbnb System — Mock Lab

A **full-stack distributed system** inspired by Airbnb, developed for the **Distributed Systems Mock Lab (Fall 2025)**.  
This project demonstrates **microservice architecture**, combining **Node.js (Express)**, **React**, and a **Python-based agent service** (Flask/FastAPI).  
It includes complete APIs for authentication, property management, bookings, and favourites — all tied together with a modern React frontend.

---

## 🚀 Project Overview

The system is composed of three major components:

### 1️⃣ `backend/` — Node.js (Express)
Handles all API endpoints for:
- Authentication (`/auth`)
- Property listings (`/properties`)
- Bookings (`/bookings`)
- Favourites (`/favourites`)
- User profiles (`/profile`)
- System metadata (`/meta`, `/health`)

**Database:** SQLite3  
**Tech stack:** Node.js, Express, bcrypt, cookie-based sessions, dotenv, sqlite3

---

### 2️⃣ `frontend/` — React + Tailwind CSS
Provides the user interface for:
- Browsing and filtering properties
- Booking and managing stays
- Marking favourites
- Viewing user profile and past bookings

**Tech stack:** React 19, React Router 7, Tailwind CSS, Axios

---

### 3️⃣ `agent-service/` — Python (FastAPI / Flask)
A microservice that represents **agent-related functionality** such as:
- Fetching external property data
- Processing asynchronous agent tasks
- Communicating with the main backend API

**Tech stack:** Python 3.9+, FastAPI (or Flask), SQLite, Uvicorn

---

## 🧩 Folder Structure

```

Distributed-Systems/
│
├── agent-service/
│   ├── app/
│   ├── dev.db
│   ├── .env.example
│   ├── README.md
│   └── requirements.txt
│
├── backend/
│   ├── src/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── bookings.js
│   │   │   ├── favourites.js
│   │   │   ├── properties.js
│   │   │   ├── profile.js
│   │   │   ├── health.js
│   │   │   └── meta.js
│   │   ├── db.js
│   │   └── server.js
│   ├── .env.example
│   ├── package.json
│   └── dev.db
│
└── frontend/
├── src/
│   ├── layouts/
│   ├── pages/
│   ├── App.js
│   ├── index.js
│   └── styles/
├── sql/
│   ├── schema.sql
│   └── seed.sql
├── .env.development
├── tailwind.config.js
└── package.json

````

---

## ⚙️ Prerequisites

| Tool | Version |
|------|----------|
| Node.js | ≥ 18.0.0 |
| npm | ≥ 8.0.0 |
| Python | ≥ 3.9 |
| SQLite3 | Installed on system (optional for manual DB setup) |

---

## 🧱 1. Clone the Repository

```bash
git clone https://github.com/<your-username>/airbnb-lab.git
cd airbnb-lab
````

If you’re working on a specific branch:

```bash
git checkout feat/ui-ux-polish
```

---

## 🖥️ 2. Run the Backend (Node.js + Express)

### 📁 Navigate to backend folder

```bash
cd backend
```

### 📦 Install dependencies

```bash
npm install
```

### ⚙️ Create environment file

```bash
cp .env.example .env   # mac/linux
# or on Windows:
copy .env.example .env
```

### 🧾 Example `.env` values

```
NODE_ENV=development
PORT=3000
CORS_ORIGIN=http://localhost:3001
SESSION_SECRET=dev_secret
DATABASE_URL=sqlite:./dev.db
```

### 🗄️ Initialize SQLite database

If you have schema and seed files located under `frontend/sql`:

```bash
# mac/linux
sqlite3 dev.db < ../frontend/sql/schema.sql
sqlite3 dev.db < ../frontend/sql/seed.sql

# windows
sqlite3.exe .\dev.db ".read ..\frontend\sql\schema.sql"
sqlite3.exe .\dev.db ".read ..\frontend\sql\seed.sql"
```

### ▶️ Start the server

You can use any of the following:

```bash
npm run dev
# or
npx nodemon src/server.js
# or
node src/server.js
```

### ✅ Verify it’s running

```bash
curl http://localhost:3000/health
```

You should see:

```json
{"ok": true, "env": "development", "time": "2025-10-25T21:09:35.983Z"}
```

---

## 🌐 3. Run the Frontend (React + Tailwind)

### 📁 Navigate to frontend folder

```bash
cd frontend
```

### 📦 Install dependencies

```bash
npm install
```

### ⚙️ Set up environment

```bash
cp .env.development .env   # mac/linux
# or
copy .env.development .env
```

### 🧾 Example `.env`

```
PORT=3001
REACT_APP_API_BASE=http://localhost:3000
```

### ▶️ Start the React app

```bash
npm start
```

The frontend will run at
👉 [http://localhost:3001](http://localhost:3001)

---

## 🐍 4. Run the Agent Service (Python + FastAPI/Flask)

### 📁 Navigate to agent-service

```bash
cd agent-service
```

### 🧰 Create and activate virtual environment

```bash
python -m venv .venv

# activate venv
# Windows:
.\.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate
```

### 📦 Install dependencies

```bash
pip install -r requirements.txt
```

---

### ▶️ If using **FastAPI** (recommended)

Start with Uvicorn:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Then open:
👉 [http://localhost:8000/docs](http://localhost:8000/docs) (Swagger UI)
👉 [http://localhost:8000/redoc](http://localhost:8000/redoc) (ReDoc UI)

---


## 🔗 Verifying Connections

| Component     | URL                                            | Description         |
| ------------- | ---------------------------------------------- | ------------------- |
| Backend       | [http://localhost:3000](http://localhost:3000) | Express API         |
| Frontend      | [http://localhost:3001](http://localhost:3001) | React UI            |
| Agent Service | [http://localhost:8000](http://localhost:8000) | Python microservice |

Make sure the backend `.env` allows frontend CORS:

```
CORS_ORIGIN=http://localhost:3001
```

And the frontend `.env` points to the correct backend:

```
REACT_APP_API_BASE=http://localhost:3000
```

---

## 🧾 Example API Endpoints

| Method | Endpoint       | Description        |
| ------ | -------------- | ------------------ |
| `GET`  | `/health`      | Check API health   |
| `POST` | `/auth/signup` | Register new user  |
| `POST` | `/auth/login`  | Authenticate user  |
| `GET`  | `/properties`  | Get all properties |
| `POST` | `/bookings`    | Create booking     |
| `GET`  | `/favourites`  | Get all favourites |

---

## ⚡ Common Issues

| Issue                        | Fix                                         |
| ---------------------------- | ------------------------------------------- |
| `express not found`          | Run `npm i express`                         |
| `sqlite3 not installed`      | Run `npm i sqlite3`                         |
| CORS error                   | Check `.env` CORS_ORIGIN in backend         |
| Frontend API not found       | Check `REACT_APP_API_BASE` URL              |
| `Module 'nodemon' not found` | Run `npm i -D nodemon`                      |
| Python module missing        | Run `pip install -r requirements.txt` again |

