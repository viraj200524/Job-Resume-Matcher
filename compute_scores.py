import sqlite3
from sentence_transformers import SentenceTransformer, util

# Load the embedding model
model = SentenceTransformer('all-MiniLM-L6-v2')

# Connect to SQLite database
conn = sqlite3.connect('job_matching.db', check_same_thread=False)
cursor = conn.cursor()

def get_embedding(text):
    return model.encode(text if text else "", convert_to_tensor=True)

def compute_similarity(text1, text2):
    emb1 = get_embedding(text1)
    emb2 = get_embedding(text2)
    # Return value between 0-100 instead of 0-1
    return float(util.cos_sim(emb1, emb2)) * 100

def calculate_eligibility(candidate, job):
    skill_score = compute_similarity(candidate["skills"], job["required_skills"])
    education_score = compute_similarity(candidate["qualifications"], job["qualifications"])
    project_score = compute_similarity(candidate["projects"], job["job_title"])  # Projects ↔ Job domain
    experience_score = compute_similarity(candidate["experience"], job["experience"])

    eligibility_score = (
        0.4 * skill_score +
        0.2 * education_score +
        0.2 * project_score +
        0.1 * experience_score
    )
    return skill_score, education_score, project_score, experience_score, eligibility_score

def process_candidate(candidate_id):
    # Fetch the candidate by ID
    cursor.execute("SELECT * FROM candidates WHERE candidate_id = ?", (candidate_id,))
    candidate_row = cursor.fetchone()

    if not candidate_row:
        print(f"❌ Candidate with ID {candidate_id} not found.")
        return

    candidate = {
        "skills": candidate_row[5] or "",
        "qualifications": candidate_row[6] or "",
        "projects": candidate_row[7] or "",
        "experience": candidate_row[8] or ""
    }

    # Fetch all jobs
    cursor.execute("SELECT * FROM jobs")
    jobs = cursor.fetchall()

    # Clear existing scores for this candidate to avoid duplication
    cursor.execute("DELETE FROM scores WHERE candidate_id = ?", (candidate_id,))
    conn.commit()

    # Process all jobs, not just top 2
    for j in jobs:
        job_id = j[0]
        job = {
            "job_title": j[1] or "",
            "required_skills": j[4] or "",
            "experience": j[5] or "",
            "qualifications": j[6] or ""
        }

        skill_score, education_score, project_score, experience_score, eligibility_score = calculate_eligibility(candidate, job)
        
        # Insert score for each job
        cursor.execute("""
            INSERT INTO scores (
                candidate_id, job_id,
                skill_score, education_score,
                project_relevance_score, experience_score,
                eligibility_score
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            candidate_id, job_id,
            skill_score, education_score,
            project_score, experience_score,
            eligibility_score
        ))

    conn.commit()
    print(f"✅ Job scores inserted for candidate ID {candidate_id}")