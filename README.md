# Intelligent Career Guidance Web Portal (ICGWB) - Indian Education System Edition

A modern, responsive, database-driven web application tailored specifically to the **Indian Education System (NEP 2020, CBSE, ICSE, and State Boards)**. The portal eliminates confusion over scattered college brochures, varying entrance exam cutoffs, eligibility criteria, and admission roadmaps by unifying them into a single, intuitive platform with direct educational counsellor guidance.

---

## 🇮🇳 Indian Education System Integration

The portal is modeled around the real educational pathways, statutory regulatory councils, and national examinations of India:

- **Academic Streams (10+2 / Pre-University):**
  - **Science (PCM / MPC):** Physics, Chemistry, Mathematics (Path to Engineering, Architecture, Defence Navy/Airforce, Data Science).
  - **Science (PCB / BiPC):** Physics, Chemistry, Biology (Path to MBBS, BDS, BAMS, BHMS, B.Pharm, Biotechnology).
  - **Science (PCMB):** Dual Math & Biology flexibility (Path to Pure Sciences at IISc/IISERs, Bio-Engineering).
  - **Commerce with Mathematics:** Path to B.Com (Hons) at Delhi University (SRCC), CA Foundation, Investment Banking, BBA Finance.
  - **Commerce without Mathematics:** General Commerce, Professional Accounting, Corporate Secretarial Practice.
  - **Arts / Humanities & Social Sciences:** Legal studies (CLAT), Design (NID/UCEED), Civil Services (UPSC), Journalism.
  - **3-Year Polytechnic / Diploma:** Lateral entry to B.Tech.

- **National Entrance Examinations Covered:**
  - **JEE Main & JEE Advanced:** For IITs, NITs, IIITs, IIST Thiruvananthapuram.
  - **NEET UG:** Single national medical entrance for AIIMS, JIPMER, and Government Medical Colleges.
  - **CUET UG (Common University Entrance Test):** For Central Universities (Delhi University, BHU, JNU).
  - **CLAT & AILET:** Common Law Admission Test for the 26 National Law Universities (NLSIU, NALSAR, WBNUJS).
  - **UPSC Civil Services Examination (CSE):** Prelims, Mains, and Personality Test for IAS, IPS, and IFS.
  - **UPSC NDA & NA Exam:** National Defence Academy (Army, Navy, Air Force) + 5-day SSB interview.
  - **NATA & JEE Main Paper 2:** For Council of Architecture (COA) licensed B.Arch degrees.
  - **UCEED & NID DAT:** For 4-Year B.Des programs at IIT Bombay IDC and NID Ahmedabad.
  - **ICAI CA Foundation / Inter / Final:** Chartered Accountancy program.

- **Standard Indian Currency & Compensation:**
  - Fees rendered in **INR (₹ Lakhs / Thousands)** for government subsidized vs private deemed universities.
  - Salaries modeled in **LPA (Lakhs Per Annum)** and 7th Central Pay Commission Pay Matrices (e.g., Level 10 Pay Scale for IAS/Defence).

---

## 📌 Features

### 👨‍🎓 For Students
- **Browse Indian Career Roadmaps:** Detailed profiles covering average CTC/LPA, hiring trends in Indian tech hubs (Bengaluru, Hyderabad, Pune, Gurugram), key technical skills, and standard step-by-step schooling pathways.
- **Dynamic Search & Filtering:** Filter by Category (Engineering, NEET Medical, CA & Finance, UPSC/NDA Defence, Law, Design, Pure Sciences) and Academic Stream (PCM/MPC, PCB/BiPC, Commerce, Arts).
- **Degrees & Top Colleges Directory:** Explore NIRF top-ranked institutes (IIT Bombay, AIIMS Delhi, SRCC, NLSIU Bengaluru, IISc Bengaluru) along with duration (under NEP 2020 4-year honors FYUP framework) and mandatory board subject combinations.
- **Shortlist & Bookmarks:** Save dream career paths and college degrees to your personal profile for later discussion with parents and teachers.
- **Ask an Educational Counsellor:** Submit doubts regarding cutoff ranks, JoSAA/MCC counseling, board percentage criteria, or entrance strategy, and review verified counsellor replies in your student inbox.
- **Session Authentication:** Student registration and login protected with salted Bcrypt password encryption.

### 🛠️ For Administrators & Staff
- **Content Management System (CMS):** Add, update, and remove career pathways and degree courses in real time.
- **Counsellor Desk:** Review student guidance queries, change inquiry statuses (`Pending`, `In Review`, `Resolved`), and draft official replies.
- **Dashboard Analytics:** Monitor total registered students, course catalogs, and open counseling tickets.
- **Role-Based Access Control (RBAC):** Strict separation of student and administrator roles.

---

## 🏗️ Architecture & Tech Stack

| Component | Technology |
|---|---|
| **Frontend** | HTML5, CSS3, JavaScript (ES6+), Bootstrap 5, Bootstrap Icons |
| **Backend** | Node.js, Express.js (RESTful API, MVC Architecture) |
| **Database** | SQLite (zero-config, relational, persistent) + MySQL compatible SQL schema |
| **Authentication** | Session-based authentication (`express-session`) + `bcryptjs` password hashing |
| **Design Paradigm** | Pure database-driven system with parameterized SQL queries (No black-box AI/ML) |

---

## 🚀 Quick Start Guide (Step-by-Step)

### Step 1: Open Terminal in the Project Directory
```powershell
cd c:\Users\pusap\ICGWB
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Seed Indian Education System Data
```bash
npm run seed
```
*(Or run `node seed.js`)*

### Step 4: Start the Web Portal
```bash
npm start
```
The server will run on port `3000`:
```
=======================================================
🚀 INTELLIGENT CAREER GUIDANCE WEB PORTAL is LIVE!
🌐 Server running at: http://localhost:3000
👨‍🎓 Student Portal:    http://localhost:3000
🛠️ Admin Dashboard:   http://localhost:3000/admin.html
=======================================================
```

### Step 5: Open in Your Web Browser
- **Student Home Portal:** [http://localhost:3000](http://localhost:3000)
- **Indian Career Catalog:** [http://localhost:3000/careers.html](http://localhost:3000/careers.html)
- **Courses & Top Colleges:** [http://localhost:3000/courses.html](http://localhost:3000/courses.html)
- **Ask a Counsellor Desk:** [http://localhost:3000/contact.html](http://localhost:3000/contact.html)
- **Saved Bookmarks:** [http://localhost:3000/favorites.html](http://localhost:3000/favorites.html)
- **Staff / Admin Panel:** [http://localhost:3000/admin.html](http://localhost:3000/admin.html)

---

## 🔑 Default Login Credentials

Both accounts have quick one-click autofill buttons on the [Login Page](http://localhost:3000/login.html):

| Role | Email Address | Password | Privileges |
|---|---|---|---|
| **Administrator** | `admin@icgwb.edu` | `admin123` | Full CMS CRUD access, counsellor responses, KPI metrics |
| **Student** | `student@example.com` | `student123` | Bookmark pathways & degrees, submit counsellor requests, track replies |

---

## 📁 Directory Structure

```
ICGWB/
├── config/
│   └── database.js          # SQLite connection pool & query wrappers
├── controllers/
│   ├── authController.js     # User registration, login, session, logout
│   ├── careerController.js   # Indian careers search, filters, and CRUD
│   ├── courseController.js   # Indian degrees & colleges search, filters, CRUD
│   ├── favoriteController.js # Bookmark and shortlist management
│   ├── contactController.js  # Guidance request submission & counsellor replies
│   └── statsController.js    # Dashboard analytics and metric counters
├── database/
│   ├── icgwb.sqlite          # SQLite persistent database
│   └── schema.sql            # Table definitions and indices
├── middleware/
│   └── authMiddleware.js     # Session validation & RBAC (Admin vs Student)
├── public/
│   ├── css/
│   │   └── style.css         # Modern, custom responsive styling
│   ├── js/
│   │   ├── api.js            # API client wrapper & toast notifications
│   │   ├── auth.js           # Session checker & navbar state manager
│   │   ├── main.js           # Home page cards & category loader
│   │   ├── careers.js        # Careers catalog filtering & modal roadmap
│   │   ├── courses.js        # Courses catalog filtering & admission modal
│   │   ├── favorites.js      # Student saved bookmarks viewer
│   │   ├── contact.js        # Counsellor inquiry form & replies tracker
│   │   └── admin.js          # Admin content management & inquiry replies
│   ├── index.html            # Landing portal
│   ├── careers.html          # Career catalog with search & filters
│   ├── courses.html          # Degrees and top colleges catalog
│   ├── favorites.html        # Student bookmarks view
│   ├── contact.html          # Ask a counsellor form & answers
│   ├── login.html            # Sign-in page with quick demo autofill
│   ├── register.html         # Student registration page
│   └── admin.html            # Admin dashboard and content management
├── routes/
│   ├── authRoutes.js         # Authentication endpoints (/api/auth)
│   ├── careerRoutes.js       # Career endpoints (/api/careers)
│   ├── courseRoutes.js       # Course endpoints (/api/courses)
│   ├── favoriteRoutes.js     # Bookmark endpoints (/api/favorites)
│   ├── contactRoutes.js      # Counsellor inquiry endpoints (/api/contact)
│   └── statsRoutes.js        # Dashboard statistics (/api/stats)
├── package.json              # Project dependencies & scripts
├── seed.js                   # Indian Education System database seeder script
├── server.js                 # Express server configuration
└── README.md                 # Project documentation and setup guide
```

---

## 📡 RESTful API Reference

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Register a new student account
- `POST /api/auth/login` - Sign in student or administrator
- `GET /api/auth/me` - Get current session user profile
- `POST /api/auth/logout` - Sign out and destroy session

### Career Catalog (`/api/careers`)
- `GET /api/careers` - Search & filter careers (`?search=`, `?category_id=`, `?stream=`, `?sort=`)
- `GET /api/careers/:id` - Get single career profile with linked courses
- `GET /api/careers/categories` - Get categories with counts
- `GET /api/careers/streams` - Get all available Indian streams (PCM, PCB, PCMB, Commerce, Arts)
- `POST /api/careers` - (Admin) Create a career pathway
- `PUT /api/careers/:id` - (Admin) Update a career pathway
- `DELETE /api/careers/:id` - (Admin) Delete a career pathway

### Degree Courses & Colleges (`/api/courses`)
- `GET /api/courses` - Search & filter courses (`?search=`, `?category_id=`, `?degree_level=`, `?sort=`)
- `GET /api/courses/:id` - Get detailed course criteria & entrance processes
- `GET /api/courses/degree-levels` - Get distinct degree levels (UG, PG, Professional)
- `POST /api/courses` - (Admin) Add an academic degree
- `PUT /api/courses/:id` - (Admin) Update an academic degree
- `DELETE /api/courses/:id` - (Admin) Delete an academic degree

### Bookmarks (`/api/favorites`)
- `GET /api/favorites` - Retrieve student's saved careers and courses
- `POST /api/favorites/toggle` - Save or remove a bookmark

### Counsellor Guidance (`/api/contact`)
- `POST /api/contact` - Submit a guidance request
- `GET /api/contact/my` - View previous inquiries and responses for logged-in student
- `GET /api/contact` - (Admin) List all submitted inquiries with status filtering
- `PUT /api/contact/:id` - (Admin) Update inquiry status and add counsellor response
- `DELETE /api/contact/:id` - (Admin) Remove an inquiry

### Admin Stats (`/api/stats`)
- `GET /api/stats/dashboard` - Get KPI counts and category breakdowns
