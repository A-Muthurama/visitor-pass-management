# MERN Visitor Pass Management System (PassGuard)

A full-stack Visitor Pass Management System built using MongoDB, Express.js, React.js, and Node.js with Role-Based Access Control (RBAC) and strict business rules validation engine.

---

## Key Features

- **Authentication & RBAC**: Secure JWT authentication with role-based routing and navigation (`ADMIN`, `RECEPTIONIST`, `EMPLOYEE`).
- **Dynamic Role Dashboards**: Tailored live statistics and active counters for each role.
- **10 Enforced Business Rules**:
  1. No visitor can have more than one active visit (`APPROVED` / `CHECKED_IN`) at the same time.
  2. Duplicate registrations for the same visitor on the same date are blocked.
  3. Scheduled visit dates cannot be earlier than today.
  4. Expected arrival times for today cannot be earlier than current time.
  5. Employees cannot have >3 pending requests awaiting approval.
  6. Visitors can only be checked in after host approval.
  7. Checked-in visitors cannot be checked in again without checking out first.
  8. Check-out timestamp must be later than check-in timestamp.
  9. Rejected visitor requests cannot be checked in.
  10. Cancelled visits are hidden from active operational lists.
- **Visitor Registration**: Receptionist interface with automatic business rule checks.
- **Check-In & Check-Out**: Badge assignment on check-in and checkout recording.
- **Activity Log & Audit Trail**: Comprehensive state transition log recorded with user timestamp.
- **Analytics & Reports**: Visual visitor traffic bar charts and date-range filters (Today, 7 Days, Custom).
- **Zero-Config DB Fallback**: Automatic MongoDB In-Memory Server fallback if local MongoDB is not running.

---

## Quick Start Guide

### 1. Prerequisites
- Node.js (v18+) & npm

### 2. Installation
Install root, server, and client dependencies:
```bash
npm install
cd server && npm install
cd ../client && npm install
```

### 3. Run Locally
Start both backend Express API (Port 5000) and frontend React application (Port 5173) concurrently:
```bash
npm run dev
```

Open your browser at `http://localhost:5173`.

---

## Demo Accounts

The application automatically seeds the database with default accounts:

| Role | Email | Password |
|---|---|---|
| **Administrator** | `admin@system.com` | `password123` |
| **Receptionist** | `receptionist@system.com` | `password123` |
| **Employee (Host)** | `alex@system.com` | `password123` |

---

## Deployment (Vercel / Netlify / Render)

- **Frontend (Vercel/Netlify)**: Root directory `client`, Build command `npm run build`, Output directory `dist`.
- **Backend (Render/Vercel Serverless)**: Root directory `server`, Start command `npm start`. Set `MONGO_URI` and `JWT_SECRET` in environment variables.
