import json

def parse_user_data(json_data):
    # 1. Extract the name
    full_username = json_data.get("UserName", "")
    name = full_username.split(".")[0]

    total_points = 0.0
    total_credits = 0.0

    # 2. Process courses
    for course_entry in json_data.get("Courses", []):
        for course_code, (grade_str, credit_str) in course_entry.items():
            try:
                grade = float(grade_str)
                credit = float(credit_str) if credit_str else 0.0

                if grade >= 60 and credit > 0:
                    total_points += grade * credit
                    total_credits += credit

            except ValueError:
                # Skip if grade is not a number (e.g., "N/A")
                continue

    # 3. Calculate GPA
    gpa = total_points / total_credits if total_credits > 0 else 0.0

    return {
        "name": name,
        "gpa": round(gpa, 2),
        "total_credits": total_credits
    }

# Usage
with open("Roei.Segal.json", "r") as f:
    data = json.load(f)

result = parse_user_data(data)
print(result)

