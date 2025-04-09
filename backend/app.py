from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import tempfile
import sqlite3
import pandas as pd
import json
import time
import uuid
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

# Import your existing functions
from Resume_parse import parse_and_store_resume
from compute_scores import process_candidate

load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Email settings - consider using environment variables for production
email_settings = {
    'smtp_server': 'smtp.gmail.com',
    'smtp_port': 587,
    'sender_email': os.getenv("SENDER_EMAIL"),
    'sender_password': os.getenv("SENDER_EMAIL_PASSWORD")
}

# Routes for resume processing
@app.route('/api/upload_resume', methods=['POST'])
def upload_resume():
    """Handle resume upload"""
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    if file and file.filename.endswith('.pdf'):
        # Save uploaded file temporarily
        temp_dir = tempfile.gettempdir()
        temp_path = os.path.join(temp_dir, file.filename)
        file.save(temp_path)
        
        try:
            # Parse resume
            parsed_data = parse_and_store_resume(temp_path)
            
            # Extract email
            email = parsed_data.get('Email', None)
            if email:
                # Get or create user ID
                user_id = create_or_get_user_id(email)
                
                # Process candidate's job matching
                process_candidate(user_id)
                
                return jsonify({
                    'success': True,
                    'user_id': user_id,
                    'user_email': email,
                    'parsed_data': parsed_data
                })
            else:
                return jsonify({'error': 'No email found in resume'}), 400
                
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    else:
        return jsonify({'error': 'Only PDF files are allowed'}), 400

@app.route('/api/resume_analysis/<user_id>', methods=['GET'])
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

@app.route('/api/job_matches/<user_id>', methods=['GET'])
def job_matches(user_id):
    """Get job matches for a candidate"""
    try:
        conn = sqlite3.connect("job_matching.db")
        
        query = """
        SELECT j.job_id, j.job_title, j.company, j.location, s.skill_score, s.education_score, 
               s.project_relevance_score, s.experience_score, s.eligibility_score
        FROM scores s
        JOIN jobs j ON s.job_id = j.job_id
        WHERE s.candidate_id = ?
        ORDER BY s.eligibility_score DESC
        LIMIT 10
        """
        
        df = pd.read_sql_query(query, conn, params=(user_id,))
        conn.close()
        
        # Convert DataFrame to list of dictionaries for JSON response
        matches = df.to_dict(orient='records')
        return jsonify(matches)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/job_details/<job_id>', methods=['GET'])
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

# Helper functions
def create_or_get_user_id(email):
    """Create or get user ID based on email"""
    if not email:
        # Generate a random temporary ID if no email is found
        return str(uuid.uuid4())
    
    conn = sqlite3.connect("job_matching.db")
    cursor = conn.cursor()
    
    # Check if a candidate with this email already exists
    cursor.execute("SELECT candidate_id FROM candidates WHERE email = ?", (email,))
    result = cursor.fetchone()
    conn.close()
    
    if result:
        return result[0]
    
    return str(uuid.uuid4())  # New user with email but not in DB yet

if __name__ == '__main__':
    app.run(debug=True, port=5000)