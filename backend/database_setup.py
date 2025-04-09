import sqlite3

# Connect to SQLite database (or create if it doesn't exist)
conn = sqlite3.connect("job_matching.db", check_same_thread=False)
cursor = conn.cursor()

# 1. Create candidates table
cursor.execute("""
CREATE TABLE IF NOT EXISTS candidates (
    candidate_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT,
    phone TEXT,
    linkedin TEXT,
    skills TEXT,
    qualifications TEXT,
    projects TEXT,
    experience TEXT
);
""")

# 2. Create jobs table
cursor.execute("""
CREATE TABLE IF NOT EXISTS jobs (
    job_id INTEGER PRIMARY KEY AUTOINCREMENT,
    job_title TEXT,
    company TEXT,
    location TEXT,
    required_skills TEXT,
    experience TEXT,
    qualifications TEXT,
    responsibilities TEXT,
    benefits TEXT,
    other_details TEXT
);
""")

# 3. Create scores table
cursor.execute("""
CREATE TABLE IF NOT EXISTS scores (
    score_id INTEGER PRIMARY KEY AUTOINCREMENT,
    candidate_id INTEGER NOT NULL,
    job_id INTEGER NOT NULL,
    skill_score REAL,
    education_score REAL,
    project_relevance_score REAL,
    experience_score REAL,
    eligibility_score REAL,
    FOREIGN KEY (candidate_id) REFERENCES candidates(candidate_id),
    FOREIGN KEY (job_id) REFERENCES jobs(job_id)
);
""")

# 4. Create applications table (optional but useful)
cursor.execute("""
CREATE TABLE IF NOT EXISTS applications (
    application_id INTEGER PRIMARY KEY AUTOINCREMENT,
    candidate_id INTEGER NOT NULL,
    job_id INTEGER NOT NULL,
    application_date TEXT,
    status TEXT DEFAULT 'Pending',
    FOREIGN KEY (candidate_id) REFERENCES candidates(candidate_id),
    FOREIGN KEY (job_id) REFERENCES jobs(job_id)
);
""")

# Commit and close
conn.commit()
conn.close()

print("✅ Database and all tables created successfully!")
