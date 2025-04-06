import fitz  # PyMuPDF
import json
import sqlite3
from langchain_groq import ChatGroq
from langchain.prompts import PromptTemplate
from langchain_core.messages import HumanMessage

# Initialize Groq LLM
groq_api_key = "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"
llm = ChatGroq(api_key=groq_api_key, model="qwen-2.5-32b")

# Prompt Template
prompt_template = PromptTemplate(
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
    """Extract text from a PDF file using PyMuPDF."""
    doc = fitz.open(pdf_path)
    return "\n".join([page.get_text() for page in doc])

def parse_resume_with_llm(resume_text):
    """Use LLM to parse resume text into structured JSON."""
    prompt = prompt_template.format(resume_text=resume_text)
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

def insert_into_db(data, db_path="job_matching.db"):
    """Insert parsed resume data into SQLite database."""
    conn = sqlite3.connect(db_path, check_same_thread=False)
    cursor = conn.cursor()

    query = """
    INSERT INTO candidates (name, email, phone, linkedin, skills, qualifications, projects, experience)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """
    values = (
        data.get("Name", "None"),
        data.get("Email", "None"),
        data.get("Phone", "None"),
        data.get("LinkedIn", "None"),
        data.get("Required Skills", "None"),
        data.get("Qualifications", "None"),
        data.get("Projects", "None"),
        data.get("Experience", "None")
    )

    cursor.execute(query, values)
    conn.commit()
    conn.close()
    print("✅ Candidate inserted successfully!")

def parse_and_store_resume(pdf_path, output_json_path="resume_data.json"):
    """End-to-end function: parse resume and store to JSON and DB."""
    print(f"📄 Processing resume: {pdf_path}")
    resume_text = extract_resume_text(pdf_path)
    parsed_data = parse_resume_with_llm(resume_text)

    if parsed_data:
        with open(output_json_path, 'w', encoding='utf-8') as f:
            json.dump(parsed_data, f, indent=4, ensure_ascii=False)
        print(f"💾 Data saved to {output_json_path}")

        insert_into_db(parsed_data)
    else:
        print("❌ Failed to parse resume.")

# Example usage
if __name__ == "__main__":
    parse_and_store_resume('./CVs1/C1061.pdf')
