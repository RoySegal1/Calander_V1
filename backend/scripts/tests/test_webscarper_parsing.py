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


class FakeRow:
    def __init__(self, code, name):
        self.cells = [code, name]

    def find_elements(self, by, value):
        return self.cells


class FakeDriver:
    def __init__(self):
        self.visited = []

    def get(self, url):
        self.visited.append(url)


@pytest.fixture
def child_row_env(monkeypatch):
    import WebScarper
    driver = FakeDriver()
    monkeypatch.setattr(WebScarper, "polite_pause", lambda: None)
    monkeypatch.setattr(WebScarper, "cell_value", lambda cell: cell)
    monkeypatch.setattr(WebScarper, "find_rows", lambda wait: [FakeRow("10016", "מבוא למדעי המחשב")])
    return WebScarper, driver


def test_process_child_row_retries_once_when_the_page_goes_stale(child_row_env, monkeypatch):
    WebScarper, driver = child_row_env
    outcomes = [WebScarper.StaleElementReferenceException("redrawn"), [{"Course Code": "10016"}]]

    def fake_scrape_course(*args):
        outcome = outcomes.pop(0)
        if isinstance(outcome, Exception):
            raise outcome
        return outcome
    monkeypatch.setattr(WebScarper, "scrape_course", fake_scrape_course)

    data, more, next_index = WebScarper.process_child_row(driver, None, "subject-url", 0, "subject")

    assert data == [{"Course Code": "10016"}]
    assert (more, next_index) == (True, 1)
    assert driver.visited == ["subject-url", "subject-url"]


def test_process_child_row_gives_up_after_repeated_stale_pages(child_row_env, monkeypatch):
    WebScarper, driver = child_row_env

    def always_stale(*args):
        raise WebScarper.StaleElementReferenceException("redrawn")
    monkeypatch.setattr(WebScarper, "scrape_course", always_stale)

    data, more, next_index = WebScarper.process_child_row(driver, None, "subject-url", 0, "subject")

    assert data == []
    assert (more, next_index) == (True, 1)
    assert len(driver.visited) == WebScarper.COURSE_ATTEMPTS


def test_process_child_row_does_not_retry_other_errors(child_row_env, monkeypatch):
    WebScarper, driver = child_row_env
    calls = []

    def broken(*args):
        calls.append(1)
        raise ValueError("unexpected page")
    monkeypatch.setattr(WebScarper, "scrape_course", broken)

    data, _, next_index = WebScarper.process_child_row(driver, None, "subject-url", 0, "subject")

    assert (data, next_index, len(calls)) == ([], 1, 1)
    assert driver.visited == ["subject-url"]


def test_process_child_row_skips_courses_without_a_schedule(child_row_env, monkeypatch):
    WebScarper, driver = child_row_env
    monkeypatch.setattr(WebScarper, "scrape_course", lambda *args: None)

    data, more, next_index = WebScarper.process_child_row(driver, None, "subject-url", 0, "subject")

    assert (data, more, next_index) == ([], True, 1)


def test_process_child_row_skips_courses_outside_the_filter_without_a_request(child_row_env, monkeypatch):
    WebScarper, driver = child_row_env
    calls = []
    monkeypatch.setattr(WebScarper, "scrape_course", lambda *args: calls.append(1) or [])

    data, more, next_index = WebScarper.process_child_row(driver, None, "subject-url", 0, "subject", {"99999"})

    assert (data, more, next_index) == ([], True, 1)
    assert calls == [] and driver.visited == []


def test_process_child_row_scrapes_courses_inside_the_filter(child_row_env, monkeypatch):
    WebScarper, driver = child_row_env
    monkeypatch.setattr(WebScarper, "scrape_course", lambda *args: [{"Course Code": "10016"}])

    data, _, _ = WebScarper.process_child_row(driver, None, "subject-url", 0, "subject", {"10016"})

    assert data == [{"Course Code": "10016"}]


def test_process_child_row_reports_end_of_list(child_row_env):
    WebScarper, driver = child_row_env

    data, more, next_index = WebScarper.process_child_row(driver, None, "subject-url", 5, "subject")

    assert (data, more, next_index) == ([], False, 5)
    assert driver.visited == []


class FakeElement:
    def __init__(self, displayed=True, text="", stale=False):
        self.displayed, self.text, self.stale, self.clicked = displayed, text, stale, False
        self.navigates_on_click = False

    def is_displayed(self):
        return self.displayed

    def is_enabled(self):
        import WebScarper
        if self.stale:
            raise WebScarper.StaleElementReferenceException("gone")
        return True

    def click(self):
        self.clicked = True
        self.stale = self.stale or self.navigates_on_click

    def find_element(self, by, value):
        return self


class FakeBrowser:
    def __init__(self, row, navigates, modal_close_buttons=(), modals=()):
        self.row = row
        row.navigates_on_click = navigates
        self.modal_close_buttons, self.modals = list(modal_close_buttons), list(modals)

    def execute_script(self, script):
        return "complete"

    def find_elements(self, by, value):
        if value == "TextAlignRight":
            return [FakeElement()] if self.row.stale else []
        if value == "button.closefirstmodal":
            return self.modal_close_buttons
        if value == ".modal":
            return self.modals
        return []


@pytest.fixture
def schedule_env(monkeypatch):
    import WebScarper
    monkeypatch.setattr(WebScarper, "polite_pause", lambda: None)
    monkeypatch.setattr(WebScarper, "SCHEDULE_TIMEOUT_SECONDS", 0.2)
    return WebScarper


def test_open_course_schedule_waits_for_navigation_even_when_a_loading_modal_is_visible(schedule_env):
    row = FakeElement()
    loading_close_button = FakeElement(displayed=True)
    browser = FakeBrowser(row, navigates=True, modal_close_buttons=[loading_close_button])

    assert schedule_env.open_course_schedule(browser, None, row) is True
    assert loading_close_button.clicked is False


def test_open_course_schedule_closes_the_popup_when_the_page_never_changes(schedule_env, capsys):
    row = FakeElement()
    close_button = FakeElement(displayed=True)
    browser = FakeBrowser(row, navigates=False, modal_close_buttons=[FakeElement(displayed=False), close_button],
                          modals=[FakeElement(displayed=True, text="לא נמצאו   קבוצות")])

    assert schedule_env.open_course_schedule(browser, None, row) is False
    assert close_button.clicked is True
    assert "Popup instead of schedule: לא נמצאו קבוצות" in capsys.readouterr().out


def test_open_course_schedule_raises_when_nothing_happens(schedule_env):
    row = FakeElement()
    browser = FakeBrowser(row, navigates=False, modal_close_buttons=[FakeElement(displayed=False)])

    with pytest.raises(schedule_env.TimeoutException):
        schedule_env.open_course_schedule(browser, None, row)
