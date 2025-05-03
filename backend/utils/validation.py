import re


def validate_username(username: str):
    pattern = r'^[A-Z][a-z]+\.[A-Z][a-z]+$'
    return bool(re.fullmatch(pattern, username))

