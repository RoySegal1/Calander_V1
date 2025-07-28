DEPARTMENT_FILES = {
    "הנדסת חשמל": "electricity_courses.json",
    "הנדסת תעשיה וניהול": "tiol_courses.json",
    "מדעי המחשב": "CS_courses.json",
    "הנדסת תוכנה": "software_courses.json",
    "הנדסה ביורפואית": "med_courses.json",
    "הנדסה מכנית": "mechanic_courses.json",
    "מדעי הנתונים": "datacs_courses.json",
    "אנגלית": "english_courses.json",
    "כללי": "klali_courses.json"
}

DEPARTMENT_CREDITS = {
    "הנדסת חשמל": 160,
    "הנדסת תעשיה וניהול": 160,
    "מדעי המחשב": 120,
    "הנדסת תוכנה": 160,
    "הנדסה ביורפואית": 160,
    "הנדסה מכנית": 160,
    "מדעי הנתונים": 120,
}


COURSES_FROM_DIFFERENT_YEARS = {
    "10006": {"courseCredit": "5", "courseType": "חובה"},
    "10007": {"courseCredit": "3", "courseType": "חובה"},
    "10118": {"courseCredit": "3", "courseType": "חובה"},
    "10124": {"courseCredit": "3.5", "courseType": "חובה"},
    "80946": {"courseCredit": "2", "courseType": "רוח"},
    "90913": {"courseCredit": "3", "courseType": "חובה"},
    "10215": {"courseCredit": "4", "courseType": "חובה"},
    "10244": {"courseCredit": "4", "courseType": "חובה"},
    "88006": {"courseCredit": "2", "courseType": "רוח"},
}

# Whitelist valid endpoints
VALID_ENDPOINTS = {
    "/",
    "/auth/login",
    "/auth/signup",
    "/auth/signuplight",
    "/auth/guest",
    "/courses",
    "/schedule/",
    "/schedule/student/",
    "/docs",
    "/openapi.json"
}

