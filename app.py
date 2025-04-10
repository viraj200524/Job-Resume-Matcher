from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import sqlite3
import json
import fitz  
from sentence_transformers import SentenceTransformer, util
from langchain_groq import ChatGroq
from langchain.prompts import PromptTemplate
from langchain_core.messages import HumanMessage
import pandas as pd

app = Flask(__name__)
CORS(app)


DB_PATH = "job_matching.db"
GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "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")
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'pdf', 'csv'}


os.makedirs(UPLOAD_FOLDER, exist_ok=True)


llm = ChatGroq(api_key=GROQ_API_KEY, model="qwen-2.5-32b")
embedding_model = SentenceTransformer('all-MiniLM-L6-v2')


def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    
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
    
    conn.commit()
    conn.close()


init_db()


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row  
    return conn


resume_prompt_template = PromptTemplate(
    input_variables=["resume_text"],
    template="""
You are an expert resume parser. Extract and return structured information in JSON format from the following resume text:

Resume Text:
\"\"\"{resume_text}\"\"\"

Return the following fields:
{{
    "Name": "",
    "Email": "",
    "Phone": "",
    "LinkedIn": "",
    "Skills": "",
    "Tech Stack": "",
    "Courses": "",
    "Certifications": "",
    "Experience": "",
    "Education": "",
    "Achievements": "",
    "Projects": ""
}}
Skills, Tech Stack, Certifications and Courses should be a comma seperated strings if not empty and after parsing combine all these in a single string named Required Skills.
Education should also be a comma seperated string and rename that attribute to Qualifications.
For Projects only analyze the domains and expertise and write them as comma seperated string.
Experience and Achievements should also be comma seperated strings and combine them both under a single header of Experience.
Ensure all values are extracted if available, else return the string "None".
Only return the JSON — no explanation.
"""
)

def extract_resume_text(pdf_path):
    doc = fitz.open(pdf_path)
    return "\n".join([page.get_text() for page in doc])

def parse_resume_with_llm(resume_text):
    prompt = resume_prompt_template.format(resume_text=resume_text)
    messages = [HumanMessage(content=prompt)]
    response = llm.invoke(messages)

    try:
        json_str = response.content.strip()
        if json_str.startswith("```json") and json_str.endswith("```"):
            json_str = json_str[len("```json"):].rstrip("```").strip()
        return json.loads(json_str)
    except json.JSONDecodeError as e:
        print(f"Error parsing JSON: {e}")
        return {}


def insert_job_into_db(data):
    conn = get_db_connection()
    cursor = conn.cursor()

    query = """
    INSERT INTO jobs (job_title, company, location, required_skills, experience, qualifications, responsibilities, benefits, other_details)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """
    values = (
        data.get("Job Title", "None"),
        data.get("Company", "None"),
        data.get("Location", "None"),
        str(data.get("Required Skills", "None")),
        data.get("Experience", "None"),
        str(data.get("Qualifications", "None")),
        str(data.get("Responsibilities", "None")),
        str(data.get("Benefits", "None")),
        str(data.get("Other Details", "None"))
    )

    cursor.execute(query, values)
    job_id = cursor.lastrowid
    conn.commit()
    conn.close()
    
    return job_id

job_prompt_template = PromptTemplate(
    input_variables=["job_text"],
    template="""
You are an expert job description parser. Extract and return structured information in JSON format from the following job description text:

Job Description Text:
\"\"\"{job_text}\"\"\"

Return the following fields:
{{
    "Job Title": "",
    "Company": "",
    "Location": "",
    "Required Skills": "",
    "Experience": "",
    "Qualifications": "",
    "Responsibilities": "",
    "Benefits": "",
    "Other Details": ""
}}
All the fields should be comma seperated strings.
Ensure all values are extracted if available, else return the string "Not mentioned".
Only return the JSON — no explanation.
"""
)

def extract_job_features(job_text):
    prompt = job_prompt_template.format(job_text=job_text)
    messages = [HumanMessage(content=prompt)]
    response = llm.invoke(messages)
    
    try:
        json_str = response.content.strip()
        if json_str.startswith("```json") and json_str.endswith("```"):
            json_str = json_str[len("```json"):].rstrip("```").strip()
        return json.loads(json_str)
    except json.JSONDecodeError as e:
        print(f"Error parsing JSON response: {e}")
        return {
            "Job Title": "",
            "Company": "",
            "Location": "",
            "Required Skills": "",
            "Experience": "",
            "Qualifications": "",
            "Responsibilities": "",
            "Benefits": "",
            "Other Details": ""
        }

def insert_candidate_into_db(data):
    """Insert or update parsed resume data into SQLite database."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Extract email to check for existing records
    email = data.get("Email", "None")
    
    # Check if a candidate with this email already exists
    cursor.execute("SELECT candidate_id FROM candidates WHERE email = ?", (email,))
    existing = cursor.fetchone()
    
    if existing:
        # Update existing record
        query = """
        UPDATE candidates
        SET name = ?, phone = ?, linkedin = ?, skills = ?, qualifications = ?, projects = ?, experience = ?
        WHERE email = ?
        """
        values = (
            data.get("Name", "None"),
            data.get("Phone", "None"),
            data.get("LinkedIn", "None"),
            data.get("Required Skills", "None"),
            data.get("Qualifications", "None"),
            data.get("Projects", "None"),
            data.get("Experience", "None"),
            email
        )
        cursor.execute(query, values)
        candidate_id = existing["candidate_id"]
        print(f"🔄 Candidate with ID {candidate_id} updated successfully!")
    else:
        # Insert new record
        query = """
        INSERT INTO candidates (name, email, phone, linkedin, skills, qualifications, projects, experience)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """
        values = (
            data.get("Name", "None"),
            email,
            data.get("Phone", "None"),
            data.get("LinkedIn", "None"),
            data.get("Required Skills", "None"),
            data.get("Qualifications", "None"),
            data.get("Projects", "None"),
            data.get("Experience", "None")
        )
        cursor.execute(query, values)
        candidate_id = cursor.lastrowid
    
    conn.commit()
    conn.close()
    
    return candidate_id


def get_embedding(text):
    return embedding_model.encode(text if text else "", convert_to_tensor=True)

def compute_similarity(text1, text2):
    emb1 = get_embedding(text1)
    emb2 = get_embedding(text2)
    
    return float(util.cos_sim(emb1, emb2)) * 100

def calculate_eligibility(candidate, job):
    skill_score = compute_similarity(candidate["skills"], job["required_skills"])
    education_score = compute_similarity(candidate["qualifications"], job["qualifications"])
    project_score = compute_similarity(candidate["projects"], job["job_title"])  
    experience_score = compute_similarity(candidate["experience"], job["experience"])

    eligibility_score = (
        0.4 * skill_score +
        0.2 * education_score +
        0.2 * project_score +
        0.1 * experience_score
    )
    return skill_score, education_score, project_score, experience_score, eligibility_score

def process_candidate_job_matching(candidate_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    
    cursor.execute("SELECT * FROM candidates WHERE candidate_id = ?", (candidate_id,))
    candidate_row = cursor.fetchone()

    if not candidate_row:
        conn.close()
        return False, "Candidate not found"

    candidate = {
        "skills": candidate_row["skills"] or "",
        "qualifications": candidate_row["qualifications"] or "",
        "projects": candidate_row["projects"] or "",
        "experience": candidate_row["experience"] or ""
    }

    
    cursor.execute("SELECT * FROM jobs")
    jobs = cursor.fetchall()

    
    cursor.execute("DELETE FROM scores WHERE candidate_id = ?", (candidate_id,))
    conn.commit()

    
    for job in jobs:
        job_id = job["job_id"]
        job_data = {
            "job_title": job["job_title"] or "",
            "required_skills": job["required_skills"] or "",
            "experience": job["experience"] or "",
            "qualifications": job["qualifications"] or ""
        }

        skill_score, education_score, project_score, experience_score, eligibility_score = calculate_eligibility(candidate, job_data)
        
        
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
    conn.close()
    return True, "Job matching processed successfully"


@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "ok", "message": "API is running"})

@app.route('/api/candidates', methods=['GET'])
def get_candidates():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM candidates")
    candidates = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return jsonify({"candidates": candidates})

@app.route('/api/candidates/<int:candidate_id>', methods=['GET'])
def get_candidate(candidate_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM candidates WHERE candidate_id = ?", (candidate_id,))
    result = cursor.fetchone()
    conn.close()
    
    if result:
        candidate = dict(result)
        return jsonify({"candidate": candidate})
    else:
        return jsonify({"error": "Candidate not found"}), 404

@app.route('/api/jobs', methods=['GET'])
def get_jobs():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM jobs")
    jobs = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return jsonify({"jobs": jobs})

@app.route('/api/jobs/<int:job_id>', methods=['GET'])
def get_job(job_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM jobs WHERE job_id = ?", (job_id,))
    result = cursor.fetchone()
    conn.close()
    
    if result:
        job = dict(result)
        return jsonify({"job": job})
    else:
        return jsonify({"error": "Job not found"}), 404

@app.route('/api/upload/resume', methods=['POST'])
def upload_resume():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    
    if file and allowed_file(file.filename):
        
        file_path = os.path.join(UPLOAD_FOLDER, file.filename)
        file.save(file_path)
        
        
        try:
            resume_text = extract_resume_text(file_path)
            parsed_data = parse_resume_with_llm(resume_text)
            
            if parsed_data:
                
                candidate_id = insert_candidate_into_db(parsed_data)
                
                
                success, message = process_candidate_job_matching(candidate_id)
                
                if success:
                    return jsonify({
                        "message": "Resume uploaded and processed successfully",
                        "candidate_id": candidate_id,
                        "parsed_data": parsed_data
                    })
                else:
                    return jsonify({
                        "message": "Resume uploaded but matching failed",
                        "candidate_id": candidate_id,
                        "parsed_data": parsed_data,
                        "error": message
                    }), 500
            else:
                return jsonify({"error": "Failed to parse resume"}), 500
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    
    return jsonify({"error": "File type not allowed"}), 400

@app.route('/api/resume_analysis/<int:user_id>', methods=['GET'])
def resume_analysis(user_id):
    """Get resume analysis data"""
    try:
        conn = sqlite3.connect("job_matching.db")
        
        # Get candidate data
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM candidates WHERE candidate_id = ?", (user_id,))
        candidate = cursor.fetchone()
        
        if not candidate:
            return jsonify({'error': 'Candidate not found'}), 404
        
        candidate_data = {
            'candidate_id': candidate[0],
            'name': candidate[1],
            'email': candidate[2],
            'phone': candidate[3],
            'linkedin': candidate[4],
            'skills': candidate[5],
            'qualifications': candidate[6],
            'projects': candidate[7],
            'experience': candidate[8]
        }
        
        conn.close()
        return jsonify(candidate_data)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/upload/job-description', methods=['POST'])
def upload_job_description():
    if request.content_type == 'application/json':
        
        data = request.get_json()
        job_title = data.get('jobTitle')
        job_description = data.get('jobDescription')
        
        if not job_title or not job_description:
            return jsonify({"error": "Job title and description are required"}), 400
        
        try:
            
            job_features = extract_job_features(job_description)
            job_features["Job Title"] = job_title
            
            
            job_id = insert_job_into_db(job_features)
            
            
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute("SELECT candidate_id FROM candidates")
            candidates = [row['candidate_id'] for row in cursor.fetchall()]
            conn.close()
            
            for candidate_id in candidates:
                process_candidate_job_matching(candidate_id)
            
            return jsonify({
                "message": "Job description processed successfully",
                "job_id": job_id,
                "parsed_data": job_features
            })
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    
    elif 'file' in request.files:
        
        file = request.files['file']
        
        if file.filename == '' or not allowed_file(file.filename):
            return jsonify({"error": "Invalid file"}), 400
        
        file_path = os.path.join(UPLOAD_FOLDER, file.filename)
        file.save(file_path)
        
        try:
            df = pd.read_csv(file_path, encoding='ISO-8859-1')
            
            if 'Job Title' not in df.columns or 'Job Description' not in df.columns:
                return jsonify({"error": "CSV must contain 'Job Title' and 'Job Description' columns"}), 400
            
            processed_jobs = []
            for _, row in df.iterrows():
                job_title = row['Job Title']
                job_description = row['Job Description']
                
                
                job_features = extract_job_features(job_description)
                job_features["Job Title"] = job_title
                
                
                job_id = insert_job_into_db(job_features)
                processed_jobs.append({"job_id": job_id, "job_title": job_title})
            
            
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute("SELECT candidate_id FROM candidates")
            candidates = [row['candidate_id'] for row in cursor.fetchall()]
            conn.close()
            
            for candidate_id in candidates:
                process_candidate_job_matching(candidate_id)
            
            return jsonify({
                "message": f"Processed {len(processed_jobs)} jobs from CSV",
                "processed_jobs": processed_jobs
            })
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    
    return jsonify({"error": "Invalid request format"}), 400

@app.route('/api/match/<int:candidate_id>', methods=['GET'])
def get_candidate_matches(candidate_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    
    cursor.execute("SELECT * FROM candidates WHERE candidate_id = ?", (candidate_id,))
    candidate = cursor.fetchone()
    
    if not candidate:
        conn.close()
        return jsonify({"error": "Candidate not found"}), 404
    
    
    cursor.execute("""
        SELECT s.*, j.job_title, j.company, j.location 
        FROM scores s
        JOIN jobs j ON s.job_id = j.job_id
        WHERE s.candidate_id = ?
        ORDER BY s.eligibility_score DESC
    """, (candidate_id,))
    
    matches = [dict(row) for row in cursor.fetchall()]
    conn.close()
    
    return jsonify({
        "candidate_id": candidate_id,
        "candidate_name": dict(candidate)["name"],
        "matches": matches
    })

@app.route('/api/match/top/<int:candidate_id>', methods=['GET'])
def get_top_matches(candidate_id):
    limit = request.args.get('limit', default=5, type=int)
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    
    cursor.execute("SELECT * FROM candidates WHERE candidate_id = ?", (candidate_id,))
    candidate = cursor.fetchone()
    
    if not candidate:
        conn.close()
        return jsonify({"error": "Candidate not found"}), 404
    
    
    cursor.execute("""
        SELECT s.*, j.job_title, j.company, j.location, j.required_skills, j.qualifications 
        FROM scores s
        JOIN jobs j ON s.job_id = j.job_id
        WHERE s.candidate_id = ?
        ORDER BY s.eligibility_score DESC
        LIMIT ?
    """, (candidate_id, limit))
    
    matches = [dict(row) for row in cursor.fetchall()]
    conn.close()
    
    return jsonify({
        "candidate_id": candidate_id,
        "candidate_name": dict(candidate)["name"],
        "top_matches": matches
    })

@app.route('/api/applications', methods=['POST'])
def create_application():
    data = request.get_json()
    candidate_id = data.get('candidate_id')
    job_id = data.get('job_id')
    
    if not candidate_id or not job_id:
        return jsonify({"error": "Candidate ID and Job ID are required"}), 400
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        
        cursor.execute("SELECT * FROM candidates WHERE candidate_id = ?", (candidate_id,))
        candidate = cursor.fetchone()
        
        cursor.execute("SELECT * FROM jobs WHERE job_id = ?", (job_id,))
        job = cursor.fetchone()
        
        if not candidate or not job:
            conn.close()
            return jsonify({"error": "Candidate or Job not found"}), 404
        
        
        cursor.execute("""
            SELECT * FROM applications 
            WHERE candidate_id = ? AND job_id = ?
        """, (candidate_id, job_id))
        
        existing = cursor.fetchone()
        if existing:
            conn.close()
            return jsonify({"error": "Application already exists"}), 409
        
        
        from datetime import datetime
        current_date = datetime.now().strftime("%Y-%m-%d")
        
        cursor.execute("""
            INSERT INTO applications (candidate_id, job_id, application_date, status)
            VALUES (?, ?, ?, ?)
        """, (candidate_id, job_id, current_date, "Pending"))
        
        application_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        return jsonify({
            "message": "Application created successfully",
            "application_id": application_id
        })
    except Exception as e:
        conn.close()
        return jsonify({"error": str(e)}), 500

@app.route('/api/applications/<int:candidate_id>', methods=['GET'])
def get_candidate_applications(candidate_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT a.*, j.job_title, j.company, j.location
        FROM applications a
        JOIN jobs j ON a.job_id = j.job_id
        WHERE a.candidate_id = ?
        ORDER BY a.application_date DESC
    """, (candidate_id,))
    
    applications = [dict(row) for row in cursor.fetchall()]
    conn.close()
    
    return jsonify({"applications": applications})

@app.route('/api/job_details/<int:job_id>', methods=['GET'])
def job_details(job_id):
    """Get detailed information about a job"""
    try:
        conn = sqlite3.connect("job_matching.db")
        
        query = "SELECT * FROM jobs WHERE job_id = ?"
        df = pd.read_sql_query(query, conn, params=(job_id,))
        conn.close()
        
        if df.empty:
            return jsonify({'error': 'Job not found'}), 404
        
        # Convert DataFrame to dictionary for JSON response
        job_data = df.iloc[0].to_dict()
        return jsonify(job_data)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/all_jobs', methods=['GET'])
def all_jobs():
    """Get all available jobs with optional filtering"""
    try:
        search_term = request.args.get('search', '')
        company = request.args.get('company', 'All')
        location = request.args.get('location', 'All')
        
        conn = sqlite3.connect("job_matching.db")
        
        # Build query with filters
        query = "SELECT * FROM jobs WHERE 1=1"
        params = []
        
        if search_term:
            query += " AND (job_title LIKE ? OR company LIKE ? OR required_skills LIKE ?)"
            search_param = f"%{search_term}%"
            params.extend([search_param, search_param, search_param])
        
        if company != 'All':
            query += " AND company = ?"
            params.append(company)
        
        if location != 'All':
            query += " AND location = ?"
            params.append(location)
        
        df = pd.read_sql_query(query, conn, params=params)
        conn.close()
        
        # Convert DataFrame to list of dictionaries for JSON response
        jobs = df.to_dict(orient='records')
        return jsonify(jobs)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/job_filters', methods=['GET'])
def job_filters():
    """Get unique companies and locations for filters"""
    try:
        conn = sqlite3.connect("job_matching.db")
        
        companies = pd.read_sql_query("SELECT DISTINCT company FROM jobs", conn)['company'].tolist()
        locations = pd.read_sql_query("SELECT DISTINCT location FROM jobs", conn)['location'].tolist()
        
        conn.close()
        
        return jsonify({
            'companies': ['All'] + companies,
            'locations': ['All'] + locations
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/send_interview_request', methods=['POST'])
def send_interview_request():
    """Send interview request to candidate"""
    data = request.json
    
    # Validate required fields
    required_fields = ['candidate_id', 'job_id', 'interview_date', 'interview_time', 
                       'interview_type', 'interview_details']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400
    
    try:
        conn = sqlite3.connect("job_matching.db")
        cursor = conn.cursor()
        
        # Get candidate email
        cursor.execute("SELECT email FROM candidates WHERE candidate_id = ?", (data['candidate_id'],))
        candidate = cursor.fetchone()
        if not candidate:
            return jsonify({'error': 'Candidate not found'}), 404
        
        candidate_email = candidate[0]
        
        # Get job details
        cursor.execute("SELECT job_title, company FROM jobs WHERE job_id = ?", (data['job_id'],))
        job = cursor.fetchone()
        if not job:
            return jsonify({'error': 'Job not found'}), 404
        
        job_title = job[0]
        company = job[1]
        
        # Check if already interviewed
        cursor.execute(
            "SELECT * FROM applications WHERE candidate_id = ? AND job_id = ?",
            (data['candidate_id'], data['job_id'])
        )
        existing = cursor.fetchone()
        
        if existing:
            return jsonify({'status': 'already_applied', 'current_status': existing[4]}), 200
        
        # Format interview details
        formatted_details = f"""
        - Date: {data['interview_date']}
        - Time: {data['interview_time']}
        - Type: {data['interview_type']}
        - Details: {data['interview_details']}
        """
        
        # Send email
        if not email_settings['sender_email'] or not email_settings['sender_password']:
            return jsonify({'error': 'Email settings not configured'}), 400
        
        try:
            # Create email message
            msg = MIMEMultipart()
            msg['From'] = email_settings['sender_email']
            msg['To'] = candidate_email
            msg['Subject'] = f"Interview Request: {job_title} at {company}"
            
            # Create email body
            body = f"""
            <html>
            <body>
                <h2>Interview Request for {job_title}</h2>
                <p>Dear Candidate,</p>
                <p>We've reviewed your resume and would like to invite you for an interview for the <b>{job_title}</b> position at <b>{company}</b>.</p>
                <p><b>Interview Details:</b><br>
                {formatted_details}</p>
                <p>Please confirm your availability for this interview. If the proposed time doesn't work for you, please suggest alternative times.</p>
                <p>Thank you for your interest in our company.</p>
                <p>Best regards,<br>
                Recruitment Team<br>
                {company}</p>
            </body>
            </html>
            """
            
            msg.attach(MIMEText(body, 'html'))
            
            # Connect to SMTP server and send email
            server = smtplib.SMTP(email_settings['smtp_server'], email_settings['smtp_port'])
            server.starttls()
            server.login(email_settings['sender_email'], email_settings['sender_password'])
            server.send_message(msg)
            server.quit()
            
            # Add application with interview status
            cursor.execute(
                "INSERT INTO applications (candidate_id, job_id, application_date, status) VALUES (?, ?, date('now'), 'Interview Requested')",
                (data['candidate_id'], data['job_id'])
            )
            conn.commit()
            
            return jsonify({'success': True, 'message': f"Interview request sent to {candidate_email}"})
            
        except Exception as e:
            return jsonify({'error': f'Failed to send email: {str(e)}'}), 500
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

@app.route('/api/apply_job', methods=['POST'])
def apply_job():
    """Apply for a job"""
    data = request.json
    
    if 'candidate_id' not in data or 'job_id' not in data:
        return jsonify({'error': 'Missing required fields'}), 400
    
    try:
        conn = sqlite3.connect("job_matching.db")
        cursor = conn.cursor()
        
        # Check if already applied
        cursor.execute(
            "SELECT status FROM applications WHERE candidate_id = ? AND job_id = ?",
            (data['candidate_id'], data['job_id'])
        )
        application = cursor.fetchone()
        
        if application:
            return jsonify({'status': 'already_applied', 'current_status': application[0]}), 200
        
        # Add application
        cursor.execute(
            "INSERT INTO applications (candidate_id, job_id, application_date, status) VALUES (?, ?, date('now'), 'Applied')",
            (data['candidate_id'], data['job_id'])
        )
        conn.commit()
        conn.close()
        
        return jsonify({'success': True, 'message': 'Application submitted successfully'})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/update_email_settings', methods=['POST'])
def update_email_settings():
    """Update email settings"""
    data = request.json
    
    required_fields = ['smtp_server', 'smtp_port', 'sender_email', 'sender_password']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400
    
    global email_settings
    email_settings = {
        'smtp_server': data['smtp_server'],
        'smtp_port': data['smtp_port'],
        'sender_email': data['sender_email'],
        'sender_password': data['sender_password']
    }
    
    # Test the connection
    try:
        server = smtplib.SMTP(data['smtp_server'], int(data['smtp_port']))
        server.starttls()
        server.login(data['sender_email'], data['sender_password'])
        server.quit()
        return jsonify({'success': True, 'message': 'Connection test successful'})
    except Exception as e:
        return jsonify({'error': f'Connection test failed: {str(e)}'}), 400

@app.route('/api/candidates/email/<string:email>', methods=['GET'])
def get_candidate_by_email(email):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM candidates WHERE email = ?", (email,))
    candidate = cursor.fetchone()
    conn.close()
    
    if candidate:
        return jsonify({"candidate": dict(candidate)})
    else:
        return jsonify({"error": "Candidate not found"}), 404

if __name__ == '__main__':
    app.run(debug=True, port = 5000)