import re


def validate_username(username: str):
    pattern = r'^[A-Z][a-z]+\.[A-Z][a-z]+$'
    return bool(re.fullmatch(pattern, username))


def validate_username_for_light(username: str):
    if not username.strip():
        return False

    if len(username) < 3:
        return False

    if not re.match(r'^[a-zA-Z0-9_.]+$', username):
        return False
    return True
