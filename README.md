# PassGuard - MERN Visitor Pass Management System

A full-stack enterprise Visitor Pass Management System built using **MongoDB, Express.js, React.js (Vite), and Node.js** featuring Role-Based Access Control (RBAC), automatic Business Rules validation, real-time activity history audit logging, search & filtering, analytics reports, and an Indian office-compliant workflow.

---

## 🚀 Live Demo & Repository
- **GitHub Repository**: [https://github.com/A-Muthurama/visitor-pass-management.git](https://github.com/A-Muthurama/visitor-pass-management.git)
- **Live site**: https://visitor-pass-managementt.vercel.app

---

## 🛠️ Technology Stack & Libraries

- **Frontend**: React.js (Vite), Tailwind CSS, Lucide Icons, Recharts (for analytics), Axios, React Router v6.
- **Backend**: Node.js, Express.js, Mongoose (MongoDB ORM), JWT (JSON Web Tokens), bcryptjs.
- **Database**: MongoDB Atlas Cloud with automatic zero-config MongoDB In-Memory Server fallback.

---

## 📋 Comprehensive Visitor Workflow

```
Receptionist / Admin Creates Visitor Request
                     ↓
Employee (Host) Reviews Request on Dashboard
                     ↓
Employee Approves or Rejects Request (with optional remarks)
                     ↓
Receptionist Checks In Approved Visitor (Assigns Visitor Pass / Badge #)
                     ↓
Receptionist Checks Out Visitor upon departure
                     ↓
Complete Activity Audit Trail Recorded & Maintained
```

---

## ⚡ 10 Enforced Business Rules Engine

1. **Rule 1**: A visitor cannot have more than one active visit (`APPROVED` or `CHECKED_IN`) at the same time.
2. **Rule 2**: Duplicate visitor registrations for the same visitor on the same date are automatically blocked.
3. **Rule 3**: Scheduled visit date cannot be earlier than the current date (`YYYY-MM-DD`).
4. **Rule 4**: For today's registrations, expected arrival time cannot be earlier than current time.
5. **Rule 5**: An employee cannot have more than 3 pending visitor requests awaiting approval.
6. **Rule 6**: Visitors can only be checked in after host employee approval.
7. **Rule 7**: A visitor who is currently checked in cannot be checked in again until checked out.
8. **Rule 8**: Check-out timestamp must always be later than check-in timestamp.
9. **Rule 9**: Rejected visitor requests cannot be checked in.
10. **Rule 10**: Cancelled visits do not appear in active visitor operational lists.

---

## 🔍 Search & Filtering Capabilities
Search and filter visitor records across multiple combined fields:
- **Visitor Name**
- **Mobile Number / Phone (+91 Indian Office Standard)**
- **Host Employee Name**
- **Visit Date**
- **Status** (`PENDING`, `APPROVED`, `CHECKED_IN`, `CHECKED_OUT`, `REJECTED`, `CANCELLED`)

---

## 📊 Summary Reports & Analytics
Statistical dashboard and graphical reports with time range filters:
- **Filters**: Today, Past 7 Days (This Week), Custom Date Range.
- **Metrics**: Total Registrations, Approved, Checked In, Checked Out, Rejected, Cancelled.
- **Visuals**: Interactive Recharts traffic volume bar charts.

---

## 📜 Activity Audit History Log
Every single visitor request maintains a persistent activity audit history timeline.
- **Tracked Actions**: `CREATED`, `APPROVED`, `REJECTED`, `CHECKED_IN`, `CHECKED_OUT`, `CANCELLED`.
- **Log Metadata**: Specific Action Performed, Exact Date & Time (Timestamp), Performing User (Name & Role), and Custom Remarks.

---

## 🌟 Extra Features Added

1. **Indian Office Standard Support**: Native support for **Aadhaar Card**, **PAN Card**, **Driving License**, **Voter ID**, **Passport**, and Indian mobile format (`+91 98765 43210`).
2. **Staff User Management (CRUD)**: Admins can **Create**, **Edit**, **Deactivate**, and **Permanently Delete** Employee and Receptionist accounts with custom mobile numbers.
3. **Live Ticking System Clock**: Dynamic header clock displaying real-time running seconds (`hh:mm:ss AM/PM`).
4. **Password Eye Visibility Toggle**: Password show/hide `<Eye />` toggle on login and user creation forms.
5. **Mobile-Responsive Drawer Menu**: Responsive mobile navigation header drawer (`<Menu />`) for smooth smartphone usability.
6. **Admin Data Clear Utility**: Admin capability to clear visitor logs and reset data freshly for live testing.

---

## ⚙️ Environment Configuration Setup

Create a `.env` file inside `server/.env`:

```env
PORT=5000
MONGO_URI=mongodb+srv://jewelproject1_db_user:855Bw1rGTPlFCo0U@visit.vxrd3pr.mongodb.net/visitor_pass_db?retryWrites=true&w=majority
JWT_SECRET=visitor_management_secret_key_2026
```

---

## 📚 API Endpoints Documentation

### Authentication Routes (`/api/auth`)
- `POST /api/auth/login` - Authenticate user & get JWT token
- `GET /api/auth/me` - Get logged-in user profile

### User Management Routes (`/api/users`)
- `GET /api/users` - Fetch staff users
- `POST /api/users` - [Admin] Create new staff user account
- `PUT /api/users/:id` - [Admin] Update staff details or password
- `DELETE /api/users/:id` - [Admin] Permanently delete staff user

### Visitor Management Routes (`/api/visits`)
- `POST /api/visits` - [Receptionist/Admin] Register new visitor request (Validates Rules 1-5)
- `GET /api/visits` - Fetch visits with search & status filters
- `PUT /api/visits/:id/status` - [Employee/Admin] Approve or reject visit request
- `PUT /api/visits/:id/checkin` - [Receptionist/Admin] Check in approved visitor with badge # (Validates Rules 6, 7, 9)
- `PUT /api/visits/:id/checkout` - [Receptionist/Admin] Check out visitor (Validates Rule 8)
- `DELETE /api/visits/:id` - [Receptionist/Admin] Delete visitor pass record
- `DELETE /api/visits/clear-all` - [Admin] Clear all visitor records freshly
- `GET /api/visits/:id/history` - Retrieve activity audit timeline logs

### Reports Routes (`/api/reports`)
- `GET /api/reports/dashboard` - Get role-specific metrics & counters
- `GET /api/reports/summary` - Get aggregated visitor traffic & analytics

---

## 💻 How to Install & Run Locally

```bash
# 1. Clone repository
git clone https://github.com/A-Muthurama/visitor-pass-management.git
cd visitor-pass-management

# 2. Install dependencies
npm install

# 3. Run Backend & Frontend concurrently
npm run dev
```

Visit `http://localhost:5173` in your browser.

### Default System Admin Credentials:
- **Email**: `admin@control.com`
- **Password**: `Admin@321`
