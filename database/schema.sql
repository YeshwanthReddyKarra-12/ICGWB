-- Intelligent Career Guidance Web Portal (ICGWB)
-- Database Schema for SQLite / MySQL compatible queries

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'student' CHECK(role IN ('student', 'admin')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(100) NOT NULL UNIQUE,
  icon VARCHAR(50) DEFAULT 'bi-briefcase',
  description TEXT
);

CREATE TABLE IF NOT EXISTS careers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id INTEGER NOT NULL,
  title VARCHAR(150) NOT NULL,
  stream VARCHAR(80) NOT NULL,
  overview TEXT NOT NULL,
  required_skills TEXT,
  job_roles TEXT,
  salary_range VARCHAR(100),
  job_growth_outlook VARCHAR(100),
  education_path TEXT,
  image_url VARCHAR(255),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS courses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  career_id INTEGER,
  category_id INTEGER NOT NULL,
  name VARCHAR(150) NOT NULL,
  degree_level VARCHAR(80) NOT NULL,
  duration VARCHAR(50) NOT NULL,
  eligibility TEXT NOT NULL,
  required_subjects TEXT NOT NULL,
  top_colleges TEXT NOT NULL,
  admission_process TEXT,
  avg_fee VARCHAR(80),
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (career_id) REFERENCES careers(id) ON DELETE SET NULL,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS favorites (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  item_type VARCHAR(20) NOT NULL CHECK(item_type IN ('career', 'course')),
  item_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, item_type, item_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS guidance_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  student_name VARCHAR(120) NOT NULL,
  student_email VARCHAR(160) NOT NULL,
  student_phone VARCHAR(40),
  current_education VARCHAR(100),
  interested_stream VARCHAR(100),
  message TEXT NOT NULL,
  status VARCHAR(30) DEFAULT 'Pending' CHECK(status IN ('Pending', 'In Review', 'Resolved')),
  counsellor_reply TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Indices for rapid search and filtering
CREATE INDEX IF NOT EXISTS idx_careers_category ON careers(category_id);
CREATE INDEX IF NOT EXISTS idx_careers_stream ON careers(stream);
CREATE INDEX IF NOT EXISTS idx_courses_category ON courses(category_id);
CREATE INDEX IF NOT EXISTS idx_courses_degree ON courses(degree_level);
CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);
