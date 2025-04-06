import sqlite3

# Connect to your database
conn = sqlite3.connect("job_matching.db")
cursor = conn.cursor()

# Name of the table you want to clear
table_name = "candidates"  # or "Company", "Scores", etc.

# Delete all rows from the table
cursor.execute(f"DELETE FROM {table_name}")

# Optional: Reset auto-increment primary key (if needed)
cursor.execute(f"DELETE FROM sqlite_sequence WHERE name='{table_name}'")

# Commit changes and close connection
conn.commit()
conn.close()

print(f"All rows deleted from '{table_name}' table.")
