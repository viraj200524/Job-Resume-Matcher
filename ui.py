import streamlit as st
import os
import tempfile
import pandas as pd
import sqlite3
import matplotlib.pyplot as plt
import seaborn as sns
from Resume_parse import parse_and_store_resume
from compute_scores import process_candidate
import plotly.express as px
import plotly.graph_objects as go
import time
import uuid
import re

# Set page configuration
st.set_page_config(
    page_title="Resume Analyzer & Job Matcher",
    page_icon="📝",
    layout="wide"
)

# Custom CSS for a cleaner look
st.markdown("""
<style>
    .main {
        padding-top: 1rem;
    }
    .stTabs [data-baseweb="tab-list"] {
        gap: 24px;
    }
    .stTabs [data-baseweb="tab"] {
        height: 50px;
        white-space: pre-wrap;
        background-color: #f0f2f6;
        border-radius: 4px 4px 0px 0px;
        gap: 1px;
        padding-top: 10px;
        padding-bottom: 10px;
    }
    .stTabs [aria-selected="true"] {
        background-color: #4e8cff;
        color: white;
    }
    .upload-container {
        background-color: #f9f9f9;
        border-radius: 10px;
        padding: 20px;
        margin-bottom: 20px;
        border: 1px dashed #ddd;
    }
    .metric-card {
        background-color: #f0f7ff;
        border-radius: 5px;
        padding: 15px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.05);
    }
    .header-container {
        background: linear-gradient(90deg, #4e8cff 0%, #38b6ff 100%);
        padding: 20px;
        border-radius: 10px;
        color: white;
        margin-bottom: 30px;
    }
</style>
""", unsafe_allow_html=True)

# Initialize session state variables
if 'user_id' not in st.session_state:
    st.session_state['user_id'] = None
if 'user_email' not in st.session_state:
    st.session_state['user_email'] = None
if 'parsed_data' not in st.session_state:
    st.session_state['parsed_data'] = None
if 'current_tab' not in st.session_state:
    st.session_state['current_tab'] = "Upload Resume"

def extract_email_from_parsed_data(parsed_data):
    """Extract email from parsed resume data"""
    if parsed_data and 'Email' in parsed_data:
        return parsed_data['Email']
    return None

def get_candidate_id_by_email(email):
    """Get candidate ID from database using email"""
    conn = sqlite3.connect("job_matching.db")
    cursor = conn.cursor()
    cursor.execute("SELECT candidate_id FROM candidates WHERE email = ?", (email,))
    result = cursor.fetchone()
    conn.close()
    return result[0] if result else None

def create_or_get_user_id(email):
    """Create or get user ID based on email"""
    if not email:
        # Generate a random temporary ID if no email is found
        return str(uuid.uuid4())
    
    candidate_id = get_candidate_id_by_email(email)
    if candidate_id:
        return candidate_id
    return str(uuid.uuid4())  # New user with email but not in DB yet

def switch_tab(tab_name):
    """Switch to a different tab"""
    st.session_state['current_tab'] = tab_name
    st.rerun()

# Header with App Title
st.markdown('<div class="header-container"><h1>Resume Analyzer & Job Matcher</h1><p>Upload your resume to find the best job matches based on your skills and experience</p></div>', unsafe_allow_html=True)

# Create tabs for navigation
tabs = st.tabs(["Upload Resume", "Resume Analysis", "Job Matches", "All Jobs"])

# Tab 1: Resume Upload
with tabs[0]:
    st.header("Upload Your Resume")
    
    col1, col2 = st.columns([1, 1])
    
    with col1:
        st.markdown('<div class="upload-container">', unsafe_allow_html=True)
        uploaded_file = st.file_uploader("Upload your Resume (PDF format)", type="pdf")
        
        if uploaded_file is not None and 'resume_processed' not in st.session_state:
            with st.spinner('Processing your resume...'):
                # Set a flag to prevent recursive processing
                st.session_state['resume_processed'] = True
                
                # Save uploaded file temporarily
                temp_dir = tempfile.gettempdir()
                temp_path = os.path.join(temp_dir, uploaded_file.name)
                with open(temp_path, "wb") as f:
                    f.write(uploaded_file.getbuffer())
                
                # Parse resume
                parse_and_store_resume(temp_path)
                
                # Load the parsed data from JSON file
                import json
                with open("resume_data.json", 'r') as f:
                    parsed_data = json.load(f)
                    st.session_state['parsed_data'] = parsed_data
                
                # Extract email and set user_id
                email = extract_email_from_parsed_data(parsed_data)
                if email:
                    st.session_state['user_email'] = email
                    st.session_state['user_id'] = create_or_get_user_id(email)
                
                # Process candidate's job matching
                if st.session_state['user_id']:
                    process_candidate(st.session_state['user_id'])
                
                st.success("Resume processed successfully!")
                st.session_state['current_tab'] = "Resume Analysis"
                st.rerun()
        elif 'resume_processed' in st.session_state and uploaded_file is None:
            # Reset the flag when file is removed
            del st.session_state['resume_processed']
        
        st.markdown('</div>', unsafe_allow_html=True)
    
    with col2:
        st.markdown("""
        ### How it works:
        1. Upload your resume in PDF format
        2. Our AI will analyze your skills, experience, and qualifications
        3. View personalized job matches based on your profile
        4. Explore all available job opportunities
        
        ### Benefits:
        - Get instant analysis of your professional profile
        - Find jobs that match your exact skill set
        - Track your application progress
        - Receive personalized job recommendations
        """)

# Tab 2: Resume Analysis
with tabs[1]:
    if st.session_state['parsed_data']:
        st.header("Your Resume Analysis")
        parsed_data = st.session_state['parsed_data']
        
        col1, col2 = st.columns([2, 1])
        
        with col1:
            # Personal Information
            st.subheader("Personal Information")
            info_cols = st.columns(3)
            with info_cols[0]:
                st.markdown(f"**Name:** {parsed_data.get('Name', 'Not found')}")
            with info_cols[1]:
                st.markdown(f"**Email:** {parsed_data.get('Email', 'Not found')}")
            with info_cols[2]:
                st.markdown(f"**Phone:** {parsed_data.get('Phone', 'Not found')}")
            
            if parsed_data.get('LinkedIn', 'None') != 'None':
                st.markdown(f"**LinkedIn:** {parsed_data.get('LinkedIn')}")
            
            # Skills Section
            st.subheader("Skills Profile")
            if parsed_data.get('Required Skills', 'None') != 'None':
                skills = parsed_data.get('Required Skills').split(', ')
                # Create a word cloud-like display
                cols = st.columns(4)
                for i, skill in enumerate(skills):
                    cols[i % 4].markdown(f"""
                    <div style="background-color: #e1f5fe; padding: 10px; border-radius: 5px; margin: 5px 0;">
                        {skill}
                    </div>
                    """, unsafe_allow_html=True)
            else:
                st.info("No skills detected in your resume. Consider adding relevant skills to improve job matches.")
        
        with col2:
            # Profile Completeness Score
            st.subheader("Profile Completeness")
            
            # Calculate completeness score
            fields = ["Name", "Email", "Phone", "LinkedIn", "Required Skills", "Qualifications", "Projects", "Experience"]
            filled_fields = sum(1 for field in fields if parsed_data.get(field, "None") != "None")
            completeness = int((filled_fields / len(fields)) * 100)
            
            # Display gauge chart
            fig = go.Figure(go.Indicator(
                mode = "gauge+number",
                value = completeness,
                domain = {'x': [0, 1], 'y': [0, 1]},
                title = {'text': "Profile Completeness"},
                gauge = {
                    'axis': {'range': [None, 100]},
                    'bar': {'color': "#4e8cff"},
                    'steps': [
                        {'range': [0, 33], 'color': "#ffcdd2"},
                        {'range': [33, 66], 'color': "#fff9c4"},
                        {'range': [66, 100], 'color': "#c8e6c9"}
                    ],
                    'threshold': {
                        'line': {'color': "red", 'width': 4},
                        'thickness': 0.75,
                        'value': 90
                    }
                }
            ))
            fig.update_layout(height=250, margin=dict(l=20, r=20, t=50, b=20))
            st.plotly_chart(fig, use_container_width=True)
            
            if completeness < 70:
                st.warning("Your profile could use more details to improve job matching accuracy.")
            else:
                st.success("Your profile is looking good!")
            
        # Experience and Education
        st.subheader("Professional Background")
        col1, col2 = st.columns(2)
        
        with col1:
            st.markdown("##### Experience")
            if parsed_data.get("Experience", "None") != "None":
                experiences = parsed_data.get("Experience").split(", ")
                for exp in experiences:
                    st.markdown(f"• {exp}")
            else:
                st.info("No experience details found in your resume.")
        
        with col2:
            st.markdown("##### Education & Qualifications")
            if parsed_data.get("Qualifications", "None") != "None":
                qualifications = parsed_data.get("Qualifications").split(", ")
                for qual in qualifications:
                    st.markdown(f"• {qual}")
            else:
                st.info("No qualification details found in your resume.")
        
        # Projects
        if parsed_data.get("Projects", "None") != "None":
            st.subheader("Projects & Domains")
            projects = parsed_data.get("Projects").split(", ")
            project_cols = st.columns(3)
            for i, project in enumerate(projects):
                project_cols[i % 3].markdown(f"""
                <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 5px 0; border-left: 4px solid #4e8cff;">
                    <strong>{project}</strong>
                </div>
                """, unsafe_allow_html=True)
    else:
        st.info("Please upload your resume first to view the analysis.")
        if st.button("Go to Upload", key="goto_upload_from_analysis"):
            switch_tab("Upload Resume")

# Tab 3: Job Matches
with tabs[2]:
    if st.session_state['user_id']:
        st.header("Your Top Job Matches")
        
        # Fetch job matches from the database
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
        
        try:
            matches_df = pd.read_sql_query(query, conn, params=(st.session_state['user_id'],))
            conn.close()
            
            if not matches_df.empty:
                # Display top matches summary
                st.subheader("Match Overview")
                total_matches = len(matches_df)
                high_matches = len(matches_df[matches_df['eligibility_score'] >= 80])
                
                metric_cols = st.columns(3)
                metric_cols[0].metric("Total Job Matches", total_matches)
                metric_cols[1].metric("High Compatibility (>80%)", high_matches)
                metric_cols[2].metric("Top Match Score", f"{matches_df['eligibility_score'].max():.1f}%")
                
                # Visualization of top matches
                st.subheader("Top 10 Job Matches")
                
                # Reformat dataframe for display
                display_df = matches_df.copy()
                display_df['Match Score'] = display_df['eligibility_score'].round(1).astype(str) + '%'
                
                # Create horizontal bar chart of match scores
                fig = px.bar(
                    display_df,
                    x='eligibility_score',
                    y='job_title',
                    orientation='h',
                    labels={'eligibility_score': 'Match Score (%)', 'job_title': 'Job Title'},
                    color='eligibility_score',
                    color_continuous_scale='blues',
                    hover_data=['company', 'location', 'skill_score', 'education_score', 'experience_score']
                )
                fig.update_layout(height=400, yaxis={'categoryorder':'total ascending'})
                st.plotly_chart(fig, use_container_width=True)
                
                # Detailed match listings
                st.subheader("Detailed Job Matches")
                for i, row in display_df.iterrows():
                    with st.expander(f"{row['job_title']} at {row['company']} - {row['Match Score']}"):
                        col1, col2 = st.columns([2, 1])
                        
                        with col1:
                            st.markdown(f"**Company:** {row['company']}")
                            st.markdown(f"**Location:** {row['location']}")
                            
                            # Fetch job details
                            conn = sqlite3.connect("job_matching.db")
                            job_details = pd.read_sql_query(
                                "SELECT * FROM jobs WHERE job_id = ?", 
                                conn, 
                                params=(row['job_id'],)
                            ).iloc[0]
                            conn.close()
                            
                            st.markdown(f"**Required Skills:** {job_details['required_skills']}")
                            st.markdown(f"**Experience Required:** {job_details['experience']}")
                            st.markdown(f"**Qualifications:** {job_details['qualifications']}")
                            
                            if job_details['responsibilities'] != 'None':
                                st.markdown("**Key Responsibilities:**")
                                st.markdown(job_details['responsibilities'])
                        
                        with col2:
                            # Score breakdown radar chart
                            categories = ['Skills', 'Education', 'Projects', 'Experience']
                            values = [
                                row['skill_score'], 
                                row['education_score'],
                                row['project_relevance_score'], 
                                row['experience_score']
                            ]
                            
                            # Create radar chart
                            fig = go.Figure()
                            fig.add_trace(go.Scatterpolar(
                                r=values,
                                theta=categories,
                                fill='toself',
                                name='You',
                                line_color='#4e8cff'
                            ))
                            fig.update_layout(
                                polar=dict(
                                    radialaxis=dict(
                                        visible=True,
                                        range=[0, 100]
                                    )
                                ),
                                height=300,
                                margin=dict(l=10, r=10, t=10, b=10)
                            )
                            st.plotly_chart(fig, use_container_width=True)
                            
                            st.markdown(f"**Overall Match:** {row['Match Score']}")
                            st.markdown("**Compatibility Breakdown:**")
                            st.markdown(f"- Skills: {row['skill_score']:.1f}%")
                            st.markdown(f"- Education: {row['education_score']:.1f}%")
                            st.markdown(f"- Projects: {row['project_relevance_score']:.1f}%")
                            st.markdown(f"- Experience: {row['experience_score']:.1f}%")
                        
                        if st.button(f"Apply for this Job", key=f"apply_{row['job_id']}"):
                            conn = sqlite3.connect("job_matching.db")
                            cursor = conn.cursor()
                            
                            # Check if already applied
                            cursor.execute(
                                "SELECT * FROM applications WHERE candidate_id = ? AND job_id = ?",
                                (st.session_state['user_id'], row['job_id'])
                            )
                            existing = cursor.fetchone()
                            
                            if not existing:
                                # Add application
                                cursor.execute(
                                    "INSERT INTO applications (candidate_id, job_id, application_date, status) VALUES (?, ?, date('now'), 'Applied')",
                                    (st.session_state['user_id'], row['job_id'])
                                )
                                conn.commit()
                                st.success("Application submitted successfully!")
                            else:
                                st.info("You have already applied for this position.")
                            
                            conn.close()
            else:
                st.info("No job matches found. This could be because there are no jobs in the database yet or your profile needs more details.")
        except Exception as e:
            st.error(f"Error fetching job matches: {e}")
    else:
        st.info("Please upload your resume first to view job matches.")
        if st.button("Go to Upload", key="goto_upload_from_matches"):
            switch_tab("Upload Resume")

# Tab 4: All Jobs
with tabs[3]:
    st.header("All Available Jobs")
    
    # Filters
    col1, col2, col3 = st.columns(3)
    with col1:
        search_term = st.text_input("Search Jobs", "")
    with col2:
        conn = sqlite3.connect("job_matching.db")
        companies = pd.read_sql_query("SELECT DISTINCT company FROM jobs", conn)
        company_list = ['All'] + companies['company'].tolist()
        selected_company = st.selectbox("Filter by Company", company_list)
    with col3:
        locations = pd.read_sql_query("SELECT DISTINCT location FROM jobs", conn)
        location_list = ['All'] + locations['location'].tolist()
        selected_location = st.selectbox("Filter by Location", location_list)
    
    # Build query with filters
    query = "SELECT * FROM jobs WHERE 1=1"
    params = []
    
    if search_term:
        query += " AND (job_title LIKE ? OR company LIKE ? OR required_skills LIKE ?)"
        search_param = f"%{search_term}%"
        params.extend([search_param, search_param, search_param])
    
    if selected_company != 'All':
        query += " AND company = ?"
        params.append(selected_company)
    
    if selected_location != 'All':
        query += " AND location = ?"
        params.append(selected_location)
    
    # Execute query
    jobs_df = pd.read_sql_query(query, conn, params=params)
    conn.close()
    
    if not jobs_df.empty:
        st.subheader(f"Found {len(jobs_df)} Jobs")
        
        # Display job listings
        for i, job in jobs_df.iterrows():
            with st.expander(f"{job['job_title']} - {job['company']}"):
                col1, col2 = st.columns([3, 1])
                
                with col1:
                    st.markdown(f"**Company:** {job['company']}")
                    st.markdown(f"**Location:** {job['location']}")
                    st.markdown(f"**Required Skills:** {job['required_skills']}")
                    st.markdown(f"**Experience:** {job['experience']}")
                    st.markdown(f"**Qualifications:** {job['qualifications']}")
                    
                    if job['responsibilities'] != 'None':
                        st.markdown("**Key Responsibilities:**")
                        st.markdown(job['responsibilities'])
                    
                    if job['benefits'] != 'None':
                        st.markdown("**Benefits:**")
                        st.markdown(job['benefits'])
                
                with col2:
                    # If user is logged in, show match score if available
                    if st.session_state['user_id']:
                        conn = sqlite3.connect("job_matching.db")
                        cursor = conn.cursor()
                        cursor.execute(
                            "SELECT eligibility_score FROM scores WHERE candidate_id = ? AND job_id = ?",
                            (st.session_state['user_id'], job['job_id'])
                        )
                        score = cursor.fetchone()
                        conn.close()
                        
                        if score:
                            st.metric("Match Score", f"{score[0]:.1f}%")
                            
                            # Color coding for match score
                            if score[0] >= 80:
                                st.markdown("✅ **Great Match!**")
                            elif score[0] >= 60:
                                st.markdown("🟠 **Good Match**")
                            else:
                                st.markdown("🔴 **Low Match**")
                    
                    # Apply button
                    if st.session_state['user_id']:
                        conn = sqlite3.connect("job_matching.db")
                        cursor = conn.cursor()
                        cursor.execute(
                            "SELECT status FROM applications WHERE candidate_id = ? AND job_id = ?",
                            (st.session_state['user_id'], job['job_id'])
                        )
                        application = cursor.fetchone()
                        conn.close()
                        
                        if application:
                            st.info(f"Status: {application[0]}")
                        else:
                            if st.button("Apply Now", key=f"apply_all_{job['job_id']}"):
                                conn = sqlite3.connect("job_matching.db")
                                cursor = conn.cursor()
                                cursor.execute(
                                    "INSERT INTO applications (candidate_id, job_id, application_date, status) VALUES (?, ?, date('now'), 'Applied')",
                                    (st.session_state['user_id'], job['job_id'])
                                )
                                conn.commit()
                                conn.close()
                                st.success("Application submitted!")
                                time.sleep(1)
                                st.rerun()
                    else:
                        st.warning("Upload resume to apply")
    else:
        st.info("No jobs found. Try adjusting your search filters.")

# Initialize the app with the correct tab
if st.session_state['current_tab'] == "Upload Resume":
    tabs[0].write("")  # Select first tab
elif st.session_state['current_tab'] == "Resume Analysis":
    tabs[1].write("")  # Select second tab