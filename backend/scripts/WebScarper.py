from selenium import webdriver
from selenium.common.exceptions import StaleElementReferenceException
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import argparse
import random
import time
import json
import re
import scripts_consts
import os
from transform_schdule import transform_schedule

SEARCH_URL = "https://yedionp.afeka.ac.il/yedion/fireflyweb.aspx?prgname=Enter_Search"
# Row ids look like MyFather<table id><index> and the table id changes on every page load
ROWS_XPATH = "//*[starts-with(@id,'MyFather')]"
# Afeka noticed the old request rate - every page load or form post waits a random human-like interval
REQUEST_DELAY_SECONDS = [10.0, 20.0]

DAY_NAMES = {
    "ראשון": "א",
    "שני": "ב",
    "שלישי": "ג",
    "רביעי": "ד",
    "חמישי": "ה",
    "שישי": "ו",
    "שבת": "ש",
}


def button_xpath(label, scope="//"):
    """XPath for a button by its caption - the site renders both <input type=button> and <button>"""
    return f"{scope}input[@value='{label}'] | {scope}button[contains(normalize-space(.), '{label}')]"


def clean_cell_text(text, labels=()):
    """Remove the cell's caption labels (e.g. 'קוד קורס:') and collapse whitespace"""
    for label in labels:
        text = text.replace(label, "", 1)
    return " ".join(text.replace("\xa0", " ").split())


def cell_value(element):
    """Visible value of a table cell, without its 'LabelIn' caption (shown only on narrow windows)"""
    labels = [label.get_attribute("textContent") for label in element.find_elements(By.CLASS_NAME, "LabelIn")]
    return clean_cell_text(element.get_attribute("textContent"), labels)


def parse_credits(text):
    credit_match = re.search(r"(?:נ\"ז|נקודות זכות)\s*:\s*(\d+(?:\.\d+)?)", text)
    return credit_match.group(1) if credit_match else '-1'


def parse_group_header(html_text):
    """Extract (course type, group number) from a schedule group header"""
    course_type_match = re.search(r"(?<=קורס מסוג\s).*?(?=\s*&nbsp;)", html_text)
    course_type = course_type_match.group(0).strip() if course_type_match else 'Didnt Find Course Type'

    group_match = re.search(r"קבוצה\s*:\s*(\d+)", html_text)
    group_number = group_match.group(1) if group_match else 'Didnt Find Group Number'
    return course_type, group_number


def normalize_day(text):
    """'יום ראשון' -> 'א'; single letters are returned unchanged"""
    day = text.replace("יום", "").strip()
    return DAY_NAMES.get(day, day)


def polite_pause():
    """Wait before a request to the site"""
    time.sleep(random.uniform(*REQUEST_DELAY_SECONDS))


def setup_driver(headless=False):
    """Initialize and return the WebDriver"""
    options = webdriver.ChromeOptions()
    if headless:
        options.add_argument("--headless=new")
        options.add_argument("--window-size=1400,1000")
    driver = webdriver.Chrome(options=options)
    return driver


def create_wait(driver, timeout=20):
    """Create and return a WebDriverWait object"""
    return WebDriverWait(driver, timeout)


def find_rows(wait):
    return wait.until(EC.presence_of_all_elements_located((By.XPATH, ROWS_XPATH)))


def is_stale(element):
    try:
        element.is_enabled()
        return False
    except StaleElementReferenceException:
        return True


def navigate_to_course_search(driver, wait, program, specialization=''):
    """Navigate to the initial course search page"""
    polite_pause()
    driver.get(SEARCH_URL)

    xpath_value_to_select = f".//option[@value='{scripts_consts.study_programs[program]}']"
    select_element = wait.until(EC.presence_of_element_located((By.ID, "R1C9")))
    option = select_element.find_element(By.XPATH, xpath_value_to_select)
    option.click()
    print(f"Selected {program}")

    # Click to show courses
    show_courses_button = wait.until(EC.element_to_be_clickable(
        (By.XPATH, button_xpath('הצגת קורסים בתוכנית לימוד'))))
    polite_pause()
    show_courses_button.click()
    print("Clicked 'הצגת קורסים בתוכנית לימוד'")

    if specialization:
        time.sleep(4)
        select_element_two = wait.until(EC.presence_of_element_located((By.ID, "R1C2")))
        xpath_value_to_select = f".//option[@value='{specialization}']"
        option = select_element_two.find_element(By.XPATH, xpath_value_to_select)
        option.click()

    # Wait for search button and click it
    search_program_button = wait.until(EC.element_to_be_clickable(
        (By.XPATH, button_xpath('חפש תוכניות לימוד אפשריות למסלול'))))
    polite_pause()
    search_program_button.click()
    print("Clicked 'חפש תוכניות לימוד אפשריות למסלול'")

    find_rows(wait)


def get_credits_and_prerequisites(driver, wait):
    """Extract course credits and prerequisite courses"""
    more_info_button = wait.until(EC.element_to_be_clickable((By.XPATH, button_xpath('פרטים נוספים'))))
    polite_pause()
    more_info_button.click()

    credit_element = wait.until(EC.presence_of_element_located(
        (By.XPATH, "//div[@class='col' and (contains(text(), 'נ\"ז') or contains(text(), 'נקודות זכות'))]")
    ))
    credit_found = parse_credits(credit_element.text)

    pre_course = set()
    pre_course_maybe = set()
    for label, found in (('נושא נקשר', pre_course), ('חליפי', pre_course_maybe)):
        related_topics = driver.find_elements(
            By.XPATH, f"//div[contains(@class, 'InRange')][*[contains(@class, 'LabelIn') and contains(., '{label}')]]")
        for topic in related_topics:
            value = cell_value(topic)
            if value:
                found.add(value)

    return credit_found, pre_course, pre_course_maybe


def extract_course_info(wait, course_subject, course_name, course_code):
    """Extract every scheduled meeting of a course from its schedule page"""
    # The page has one extra TextAlignRight block that is not a group header
    group_and_type_section = [element for element in
                              wait.until(EC.presence_of_all_elements_located((By.CLASS_NAME, 'TextAlignRight')))
                              if 'קבוצה' in element.get_attribute('textContent')]
    all_course_tables = wait.until(
        EC.presence_of_all_elements_located((By.CLASS_NAME, 'Table.container.ncontainer.WithSearch')))
    courses = []
    for courseTable, group_and_type in zip(all_course_tables, group_and_type_section):
        try:
            course_type, group_number = parse_group_header(group_and_type.get_attribute('innerHTML'))
            courses_rows = courseTable.find_elements(By.CLASS_NAME, "row.Tr.Father")

            for course in courses_rows:
                cells = course.find_elements(By.XPATH, ".//div[contains(@class, 'InRange')]")
                try:
                    lecturer = cells[4].find_element(By.TAG_NAME, "a").text.strip()
                except Exception:
                    lecturer = "No Lecturer Yet"

                course_data = {
                    "Course Subject": course_subject,
                    "Course Name": course_name,
                    "Course Code": course_code,
                    "Group Code": group_number,
                    "Lecture Type": course_type,
                    "Semester": cell_value(cells[0]),
                    "Day": normalize_day(cell_value(cells[1])),
                    "StartTime": cell_value(cells[2]),
                    "EndTime": cell_value(cells[3]),
                    "Lecturer": lecturer,
                    "Room": cell_value(cells[5]),
                }

                courses.append(course_data)

        except Exception as e:
            print(f"Error processing a course: {e}")

    return courses


def open_course_schedule(driver, wait, child_row):
    """Click the row's schedule button. Returns False if the site showed a 'no schedule' popup instead"""
    polite_pause()
    child_row.find_element(By.XPATH, button_xpath('חיפוש קורס במערכת השעות', scope=".//")).click()

    def outcome(d):
        if any(b.is_displayed() for b in d.find_elements(By.CSS_SELECTOR, "button.closefirstmodal")):
            return "popup"
        if is_stale(child_row) and d.find_elements(By.CLASS_NAME, "TextAlignRight"):
            return "schedule"
        return False

    if wait.until(outcome) == "popup":
        next(b for b in driver.find_elements(By.CSS_SELECTOR, "button.closefirstmodal") if b.is_displayed()).click()
        return False
    return True


def process_child_row(driver, wait, subject_url, child_row_index, course_subject):
    """Process a child row (specific course)"""
    rows = find_rows(wait)
    if child_row_index >= len(rows):
        return [], False, child_row_index

    cells = rows[child_row_index].find_elements(By.XPATH, "./div")
    course_code = cell_value(cells[0])
    course_name = cell_value(cells[1])

    if course_name == "פרויקט גמר חלק ב'":
        print("not going into פרויקט גמר חלק ב'")
        return [], True, child_row_index + 1

    courses_data = []
    try:
        if not open_course_schedule(driver, wait, rows[child_row_index]):
            print(f"No schedule for {course_code} {course_name}")
            return [], True, child_row_index + 1

        courses_data = extract_course_info(wait, course_subject, course_name, course_code)
        course_credit, pre_courses, pre_courses_maybe = get_credits_and_prerequisites(driver, wait)
        for course_data in courses_data:
            course_data["Course Credit"] = course_credit
            course_data["Course PreCondition"] = list(pre_courses)
            course_data["Course PreConditionAlt"] = list(pre_courses_maybe)
    except Exception as e:
        print(f"Error processing course {course_code} {course_name}: {e}")
        courses_data = []
    finally:
        # Navigate by URL instead of history - the course pages are form posts
        polite_pause()
        driver.get(subject_url)

    return courses_data, True, child_row_index + 1


def collect_subjects(wait):
    """Read the (subject, link) pairs from the program table, applying the skip rules"""
    subjects = []
    for parent_row in find_rows(wait):
        cells = parent_row.find_elements(By.XPATH, "./div")
        course_subject = cell_value(cells[0])

        if course_subject == 'קורסי חובה נוספים':
            continue

        if course_subject == 'קורסי יחידה ללימודי חברה ורוח':
            break

        links = cells[1].find_elements(By.TAG_NAME, "a")
        if links:
            subjects.append((course_subject, links[0].get_attribute("href")))
    return subjects


def process_subject(driver, wait, course_subject, subject_url):
    """Process every course listed under a subject"""
    print(f"Found course link: {subject_url}")
    polite_pause()
    driver.get(subject_url)
    find_rows(wait)

    all_courses_data = []
    child_row_index = 0
    more_child_rows = True
    while more_child_rows:
        child_data, more_child_rows, child_row_index = process_child_row(
            driver, wait, subject_url, child_row_index, course_subject
        )
        all_courses_data.extend(child_data)

    return all_courses_data


def save_to_json(courses_data, filename='courses_electricity_specialization.json'):
    """Save the collected data to a JSON file"""
    with open(filename, mode='w', encoding='utf-8') as file:
        json.dump(courses_data, file, ensure_ascii=False, indent=4)
    print(f"Data saved to {filename}")


def choose_interactively(specialization_map):
    """Ask for a study program and specialization on the console"""
    print("Available Study Programs:")
    for idx, (name, code) in enumerate(scripts_consts.study_programs.items(), start=1):
        print(f"{idx}. {name} ({code})")

    selected_index = int(input("Select a study program by number: ")) - 1
    selected_program_name = list(scripts_consts.study_programs.keys())[selected_index]
    selected_program_code = scripts_consts.study_programs[selected_program_name]

    selected_specialization_code = None
    if selected_program_code in specialization_map:
        specializations = specialization_map[selected_program_code]
        print("\nAvailable Specializations:")
        for idx, (spec_name, spec_code) in enumerate(specializations.items(), start=1):
            print(f"{idx}. {spec_name} ({spec_code})")
        print(f"{len(specializations)+1}. No specialization (base courses only)")

        spec_choice = int(input("Select a specialization by number: "))
        if 1 <= spec_choice <= len(specializations):
            selected_specialization_name = list(specializations.keys())[spec_choice - 1]
            selected_specialization_code = specializations[selected_specialization_name]

    return selected_program_name, selected_program_code, selected_specialization_code


def main():
    """Main function to run the course scraper"""
    specialization_map = {
        "20": scripts_consts.specialization_electricity,
        "30": scripts_consts.specialization_mechanic,
        "50": scripts_consts.specialization_medicine,
        "10": scripts_consts.specialization_Software,
        "40": scripts_consts.specialization_tiol
    }

    parser = argparse.ArgumentParser(description="Scrape Afeka courses. Without arguments, asks interactively.")
    parser.add_argument("--program", help="study program code, e.g. 30")
    parser.add_argument("--spec", help="specialization code, e.g. 304 (omit for base courses)")
    parser.add_argument("--headless", action="store_true", help="run Chrome without a window")
    parser.add_argument("--delay-min", type=float, default=REQUEST_DELAY_SECONDS[0],
                        help="minimum seconds to wait before each request (default %(default)s)")
    parser.add_argument("--delay-max", type=float, default=REQUEST_DELAY_SECONDS[1],
                        help="maximum seconds to wait before each request (default %(default)s)")
    args = parser.parse_args()

    if not 0 <= args.delay_min <= args.delay_max:
        parser.error("expected 0 <= --delay-min <= --delay-max")
    REQUEST_DELAY_SECONDS[:] = [args.delay_min, args.delay_max]

    if args.program:
        program_names = {code: name for name, code in scripts_consts.study_programs.items()}
        if args.program not in program_names:
            parser.error(f"unknown program {args.program}, expected one of {sorted(program_names)}")
        if args.spec and args.spec not in specialization_map.get(args.program, {}).values():
            parser.error(f"unknown specialization {args.spec} for program {args.program}")
        selected_program_name = program_names[args.program]
        selected_program_code = args.program
        selected_specialization_code = args.spec
    else:
        selected_program_name, selected_program_code, selected_specialization_code = \
            choose_interactively(specialization_map)

    driver = setup_driver(args.headless)
    wait = create_wait(driver)
    try:
        navigate_to_course_search(driver, wait, selected_program_name, selected_specialization_code)

        all_courses_data = []
        for course_subject, subject_url in collect_subjects(wait):
            all_courses_data.extend(process_subject(driver, wait, course_subject, subject_url))
    finally:
        driver.quit()

    # Save results and clean up
    suffix = f"{selected_program_code}_{selected_specialization_code}" if selected_specialization_code else f"{selected_program_code}_base"

    # Save raw scraped data
    raw_path = os.path.join("raw_scraper_data", f"courses_{suffix}.json")
    save_to_json(all_courses_data, raw_path)

    # Transform and save to transformed folder
    transformed_path = os.path.join("transformed_data", f"courses_{suffix}.json")
    transform_schedule(raw_path, transformed_path, selected_program_name)

    # If specialization, append to base
    final_path = os.path.join("combined_data", f"courses_{selected_program_code}_final.json")

    with open(transformed_path, "r", encoding="utf-8") as f:
        spec_courses = json.load(f)

    if os.path.exists(final_path):
        with open(final_path, "r", encoding="utf-8") as f:
            existing_courses = json.load(f)
    else:
        existing_courses = []

    # Combine previously saved courses with the new ones
    combined_courses = existing_courses + spec_courses
    with open(final_path, "w", encoding="utf-8") as f:
        json.dump(combined_courses, f, indent=4, ensure_ascii=False)

    print("Scraping Ran Successfully")


if __name__ == "__main__":
    main()
