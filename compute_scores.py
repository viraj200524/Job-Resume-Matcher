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
    return float(util.cos_sim(emb1, emb2))

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

    scores_list = []

    for j in jobs:
        job_id = j[0]
        job = {
            "job_title": j[1] or "",
            "required_skills": j[4] or "",
            "experience": j[5] or "",
            "qualifications": j[6] or ""
        }

        scores = calculate_eligibility(candidate, job)
        scores_list.append((job_id, *scores))  # (job_id, skill_score, edu_score, proj_score, exp_score, eligibility)

    # Sort and pick top 2
    top_scores = sorted(scores_list, key=lambda x: x[-1], reverse=True)[:2]

    # Insert into scores table
    for s in top_scores:
        job_id, skill_score, education_score, project_score, experience_score, eligibility_score = s
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
    print(f"✅ Top 2 job scores inserted for candidate ID {candidate_id}")

