import pandas as pd
import json
from langchain_groq import ChatGroq
from langchain.prompts import PromptTemplate
from langchain_core.messages import HumanMessage
import sqlite3

# Initialize Groq API with your API key
groq_api_key = "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"
llm = ChatGroq(api_key=groq_api_key, model="qwen-2.5-32b")

# Prompt template for extracting job description key features
prompt_template = PromptTemplate(
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
    "Required Skills": [],
    "Experience": "",
    "Qualifications": [],
    "Responsibilities": [],
    "Benefits": [],
    "Other Details": []
}}
All the fields should be comma seperated strings.
Ensure all values are extracted if available, else return the string "Not mentioned".
Only return the JSON — no explanation.
    """
)

def extract_job_features(job_text):
    """Extract detailed features from job description text using Groq API and LangChain."""
    # Format the prompt with job text
    prompt = prompt_template.format(job_text=job_text)
    
    # Create a HumanMessage object for the prompt
    messages = [HumanMessage(content=prompt)]
    
    # Use invoke to get the response
    response = llm.invoke(messages)
    
    # Attempt to parse the response as JSON
    try:
        # Remove any leading/trailing whitespace and ensure it's valid JSON
        json_str = response.content.strip()
        if json_str.startswith("```json") and json_str.endswith("```"):
            json_str = json_str[len("```json"):].rstrip("```").strip()
        parsed_data = json.loads(json_str)
        return parsed_data
    except json.JSONDecodeError as e:
        print(f"Error parsing JSON response: {e}")
        # Fallback to a default structure if parsing fails
        return {
            "Job Title": "",
            "Company": "",
            "Location": "",
            "Required Skills": [],
            "Experience": "",
            "Qualifications": [],
            "Responsibilities": [],
            "Benefits": [],
            "Other Details": []
        }

def save_to_json(data, output_path):
    """Save the extracted features to a JSON file."""
    with open(output_path, 'w', encoding='utf-8') as json_file:
        json.dump(data, json_file, indent=4, ensure_ascii=False)

def insert__into_jobs_db(data, db_path="job_matching.db"):
    """Insert extracted resume data into the Candidate table."""
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # Prepare data
    Job_Title = data.get("Job Title", "None")
    company = data.get("Company", "None")
    location = data.get("Location", "None")
    experience = data.get("Experience", "None")
    required_skills = data.get("Required Skills", "None") 
    qualifications = data.get("Qualifications", "None")
    responsibilities = data.get("Responsibilities", "None")
    benefits = data.get("Benefits", "None")
    Other_Details = data.get("other_details", "None")

    # Insert query
    query = """
    INSERT INTO jobs (job_title, company, location, required_skills, experience, qualifications, responsibilities, benefits, other_details)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """
    values = (Job_Title, company, location, required_skills, experience, qualifications, responsibilities, benefits, Other_Details)

    # Execute and commit
    cursor.execute(query, values)
    conn.commit()
    conn.close()

    print("✅ Candidate inserted successfully!")

def main():
    # Load the CSV file
    csv_path = 'job_description.csv'  # Update this path to your CSV file location
    df = pd.read_csv(csv_path, encoding='ISO-8859-1')
    
    # Ensure required columns exist
    if 'Job Title' not in df.columns or 'Job Description' not in df.columns:
        print("CSV file must contain 'Job Role' and 'Job Description' columns.")
        return
    
    # Process each job description
    all_jobs_data = {}  # To store all jobs in one file if desired
    for index, row in df.iterrows():
        job_title = row['Job Title']
        job_description = row['Job Description']
        
        # Extract features
        job_features = extract_job_features(job_description)
        job_features["Job Title"] = job_title  # Override or set Job Title from Job Role
        
        # Print the extracted features
        print(f"\nProcessing Job Role: {job_title}")
        for key, value in job_features.items():
            print(f"{key} -----> {value}")
        
        # Save to individual JSON file per job
        individual_output_path = f"job_{index}_data.json"
        save_to_json(job_features, individual_output_path)
        print(f"Data saved to {individual_output_path}")
        insert__into_jobs_db(job_features)
        # Add to combined data
        all_jobs_data[job_title] = job_features
    

if __name__ == "__main__":
    main()