from pydantic import BaseModel, Field, ConfigDict
from typing import List
from datetime import datetime
from pydantic import conlist


# Input schema for creating a schedule
class GroupSelection(BaseModel):
    courseCode: str
    groups: List[str]


class SavedScheduleCreate(BaseModel):
    student_id: int
    schedule_data: conlist(GroupSelection, min_length=1)
    schedule_name: str


# Output schema returned to the client
class SavedScheduleOut(BaseModel):
    id: int
    student_id: int
    schedule_name: str
    schedule_data: List[GroupSelection]
    share_code: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class LoginRequest(BaseModel):
    username: str = Field(min_length=3, max_length=50)
    password: str = Field(min_length=3, max_length=50)


class SignupRequest(LoginRequest):
    department: str

