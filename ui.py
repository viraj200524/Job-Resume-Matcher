import streamlit as st
import sqlite3
import tempfile
import os
from PIL import Image
from io import BytesIO
from Resume_parse import parse_and_store_resume
from compute_scores import process_candidate

# Set page configuration
st.set_page_config(
    page_title="Job Matcher",
    page_icon="📄",
    layout="wide",
    initial_sidebar_state="expanded",
)

# Custom CSS to style the app
st.markdown("""
    <style>
    .main, .stApp, .css-1d391kg {
        background-color: #FFFFFF;
    }
    </style>
""", unsafe_allow_html=True)

# Custom header
st.markdown("""
    <div style="display: flex; align-items: center; background-color: #f0f2f6; padding: 10px; border-radius: 5px; margin-bottom: 20px;">
        <h1 style="margin: 0; color: #262730;">Job Matcher</h1>
    </div>
""", unsafe_allow_html=True)

# Database connection
def get_db_connection():
    conn = sqlite3.connect('job_matching.db', check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

# Parse resume (placeholder)
def parse_resume(file_path):
    st.session_state.candidate_id=parse_and_store_resume(file_path)
    st.success(f"Resume parsed successfully!")
    return st.session_state.candidate_id

# Compute scores (placeholder)
def compute_scores(candidate_id):
    process_candidate(candidate_id)
    st.success(f"Job scores computed for candidate {candidate_id}!")
    

# Session state
if 'candidate_id' not in st.session_state:
    st.session_state.candidate_id = None

# Navigation
st.markdown("<h2 style='text-align: center;'>Job Matching Platform</h2>", unsafe_allow_html=True)
nav_selection = st.radio("Navigation", ["Upload Resume", "See Jobs"], horizontal=True)

# Upload Resume Page
if nav_selection == "Upload Resume":
    st.subheader("Upload Your Resume")
    uploaded_file = st.file_uploader("Choose a PDF file", type="pdf")

    if uploaded_file is not None:
        with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as tmp_file:
            tmp_file.write(uploaded_file.getvalue())
            tmp_file_path = tmp_file.name

        if st.button("Process Resume"):
            with st.spinner('Processing resume...'):
                candidate_id = parse_resume(tmp_file_path)
                st.session_state.candidate_id = candidate_id
                st.success(f"Resume processed! Candidate ID: {candidate_id}")
            os.unlink(tmp_file_path)

    if st.session_state.candidate_id:
        if st.button("SEE RECOMMENDED JOBS"):
            with st.spinner("Finding best matches..."):
                compute_scores(st.session_state.candidate_id)
                conn = get_db_connection()
                scores = conn.execute('''
                    SELECT s.job_id, j.*, 
                           COALESCE(s.skill_score, 0)*0.25 + 
                           COALESCE(s.education_score, 0)*0.2 + 
                           COALESCE(s.project_relevance_score, 0)*0.2 + 
                           COALESCE(s.experience_score, 0)*0.2 + 
                           COALESCE(s.eligibility_score, 0)*0.15 AS score
                    FROM scores s
                    JOIN jobs j ON s.job_id = j.job_id
                    WHERE s.candidate_id = ?
                    ORDER BY score DESC
                    LIMIT 2
                ''', (st.session_state.candidate_id,)).fetchall()
                conn.close()

                if scores:
                    st.subheader("Your Top Job Matches:")
                    for i, job in enumerate(scores):
                        job_dict = dict(job)
                        st.markdown(f"""
                        <div style="color: black">
                            <h4>{i+1}. {job_dict.get('job_title', 'Unnamed Position')} at {job_dict.get('company', 'Unknown Company')}</h4>
                            <b>Location:</b> {job_dict.get('location', 'Remote')}<br>
                            <b>Match Score:</b> {job_dict.get('score', 0)*100:.2f}%
                        </div>
                        """, unsafe_allow_html=True)
                        st.divider()

                else:
                    st.info("No matches found. Please upload a more detailed resume.")

# See Jobs Page
elif nav_selection == "See Jobs":
    st.subheader("Available Jobs")
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM jobs")
    jobs = cursor.fetchall()
    conn.close()

    if jobs:
        for job in jobs:
            job_dict = dict(job)
            st.markdown(f"""
<div style="color: black;">
    <h3>{job_dict.get('job_title', 'Unnamed Position')}</h3>
    <strong>Company:</strong> {job_dict.get('company', 'Unknown')}<br>
    <strong>Location:</strong> {job_dict.get('location', 'Remote')}<br>
    <strong>Required Skills:</strong> {job_dict.get('required_skills', 'Not specified')}<br>
    <strong>Experience:</strong> {job_dict.get('experience', 'Not specified')}<br>
    <strong>Qualifications:</strong> {job_dict.get('qualifications', 'Not specified')}<br>
    <strong>Responsibilities:</strong> {job_dict.get('responsibilities', 'Not specified')}<br>
    <strong>Benefits:</strong> {job_dict.get('benefits', 'Not specified')}<br>
</div>
""", unsafe_allow_html=True)

            st.divider()
    else:
        st.info("No job listings available yet.")

# Footer
st.markdown("---")
st.markdown("<p style='text-align: center;'>© 2025 Job Matcher | Find Your Perfect Match</p>", unsafe_allow_html=True)
