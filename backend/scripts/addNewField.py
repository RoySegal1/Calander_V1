import json
import os
import re

# Set paths
input_folder = "./input_data"
output_folder = "./output_data"
os.makedirs(output_folder, exist_ok=True)

# Global counter for unique courseCode values
global_course_id = 1

# Go through all JSON files
for filename in os.listdir(input_folder):
    if filename.endswith(".json"):
        file_path = os.path.join(input_folder, filename)

        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        for course in data:
            # Extract the real course code (before the hyphen)
            match = re.match(r"(\d+)-\d+", course["courseCode"])
            if not match:
                raise ValueError(f"Invalid courseCode format: {course['courseCode']}")
            real_code = match.group(1)
            course["realCourseCode"] = str(real_code)

            # Assign new unique courseCode
            course["courseCode"] = str(global_course_id)
            global_course_id += 1

        # Save updated file
        output_path = os.path.join(output_folder, filename)
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=4, ensure_ascii=False)

print("✅ All files processed. Output saved in:", output_folder)
