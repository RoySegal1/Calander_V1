import pytest

from WebScarper import button_xpath, clean_cell_text, normalize_day, parse_credits, parse_group_header
from transform_schdule import getDayByName

GROUP_HEADER_HTML = """
					קורס מסוג סופי-הרצאה+תרגול
					&nbsp;&nbsp;&nbsp;
											<span style="color: blue">
							קבוצה : 271001601 &nbsp; </span>&nbsp;&nbsp;&nbsp;
										מרצה הקורס : <a href="fireflyweb.aspx?prgname=Show_Teacher_Card" class="btn btn-primary rounded">מר קרני ירדן</a>
"""


def test_clean_cell_text_removes_caption_label_and_nbsp():
    assert clean_cell_text("קוד קורס:\xa010016", ["קוד קורס:\xa0"]) == "10016"


def test_clean_cell_text_collapses_whitespace_when_there_is_no_label():
    assert clean_cell_text("\n\t מבוא   למדעי המחשב \n") == "מבוא למדעי המחשב"


def test_clean_cell_text_returns_empty_string_for_label_only_cell():
    assert clean_cell_text("חליפי:\xa0\n ", ["חליפי:\xa0"]) == ""


def test_clean_cell_text_removes_label_only_once():
    assert clean_cell_text("שם : שם הקורס", ["שם : "]) == "שם הקורס"


@pytest.mark.parametrize("text, expected", [
    ("נקודות זכות : 3.00", "3.00"),
    ("נקודות זכות : 4.50", "4.50"),
    ("נקודות זכות: 2", "2"),
    ('נ"ז : 3.5', "3.5"),
])
def test_parse_credits_reads_current_and_legacy_formats(text, expected):
    assert parse_credits(text) == expected


def test_parse_credits_returns_minus_one_when_missing():
    assert parse_credits("שעות סמסטריאליות : 3.00") == "-1"


def test_parse_group_header_extracts_course_type_and_group_number():
    assert parse_group_header(GROUP_HEADER_HTML) == ("סופי-הרצאה+תרגול", "271001601")


def test_parse_group_header_reports_missing_fields():
    assert parse_group_header("<div>מערכת שעות</div>") == ("Didnt Find Course Type", "Didnt Find Group Number")


@pytest.mark.parametrize("text, expected", [
    ("יום ראשון", "א"),
    ("יום שני", "ב"),
    ("יום שלישי", "ג"),
    ("יום רביעי", "ד"),
    ("יום חמישי", "ה"),
    ("יום שישי", "ו"),
    ("ב", "ב"),
    (" ג ", "ג"),
])
def test_normalize_day_maps_full_names_to_letters(text, expected):
    assert normalize_day(text) == expected


def test_normalized_day_is_understood_by_transform():
    assert getDayByName(normalize_day("יום ראשון")) == 0
    assert getDayByName(normalize_day("יום שישי")) == 5


def test_button_xpath_matches_input_and_button_elements():
    xpath = button_xpath("פרטים נוספים")
    assert "//input[@value='פרטים נוספים']" in xpath
    assert "//button[contains(normalize-space(.), 'פרטים נוספים')]" in xpath


def test_button_xpath_can_be_scoped_to_an_element():
    assert all(part.strip().startswith(".//") for part in button_xpath("x", scope=".//").split("|"))


def test_polite_pause_sleeps_a_random_time_within_the_configured_range(monkeypatch):
    import WebScarper
    slept = []
    monkeypatch.setattr(WebScarper.time, "sleep", slept.append)
    monkeypatch.setattr(WebScarper, "REQUEST_DELAY_SECONDS", [3.0, 5.0])

    for _ in range(50):
        WebScarper.polite_pause()

    assert len(slept) == 50
    assert all(3.0 <= seconds <= 5.0 for seconds in slept)
    assert len(set(slept)) > 1


def test_polite_pause_with_zero_range_does_not_wait(monkeypatch):
    import WebScarper
    slept = []
    monkeypatch.setattr(WebScarper.time, "sleep", slept.append)
    monkeypatch.setattr(WebScarper, "REQUEST_DELAY_SECONDS", [0.0, 0.0])

    WebScarper.polite_pause()

    assert slept == [0.0]
