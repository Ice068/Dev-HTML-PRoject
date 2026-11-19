"""
Pydantic schemas — ทำหน้าที่ validate input ทุกตัวก่อนแตะ Firestore
(กัน injection / path traversal / CPU DoS / ข้อมูลขยะ)
"""
import re

from pydantic import BaseModel, field_validator

USERNAME_PATTERN = re.compile(r"^[a-zA-Z0-9_]{3,30}$")


class SignupRequest(BaseModel):
    username: str
    password: str

    @field_validator("username")
    @classmethod
    def validate_username(cls, v: str) -> str:
        v = v.strip()
        if not USERNAME_PATTERN.match(v):
            raise ValueError(
                "username ต้องยาว 3-30 ตัวอักษร ใช้ได้เฉพาะ a-z, A-Z, 0-9 และ _"
            )
        return v.lower()

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("password ต้องยาวอย่างน้อย 8 ตัวอักษร")
        if len(v) > 128:
            raise ValueError("password ยาวเกินไป")
        return v


class LoginRequest(BaseModel):
    username: str
    password: str

    @field_validator("username")
    @classmethod
    def validate_login_username(cls, v: str) -> str:
        v = v.strip()
        if not v or len(v) > 64:
            raise ValueError("username ไม่ถูกต้อง")
        return v

    @field_validator("password")
    @classmethod
    def validate_login_password(cls, v: str) -> str:
        if not v or len(v) > 128:
            raise ValueError("password ไม่ถูกต้อง")
        return v


class UserPublic(BaseModel):
    id: str
    username: str
    exp: int


class LoginResponse(BaseModel):
    message: str
    access_token: str
    token_type: str = "bearer"
    user: UserPublic


class MessageResponse(BaseModel):
    message: str


class AddExpRequest(BaseModel):
    exp: int

    @field_validator("exp", mode="before")
    @classmethod
    def reject_bool(cls, v):
        if isinstance(v, bool):
            raise ValueError("exp ต้องเป็นจำนวนเต็มระหว่าง 1-1000")
        return v

    @field_validator("exp")
    @classmethod
    def validate_exp(cls, v: int) -> int:
        # จำกัดค่าที่เพิ่มได้ต่อครั้ง กัน client ยิงค่ามั่วๆ เช่น exp: 999999999
        if v < 1 or v > 1000:
            raise ValueError("exp ต่อครั้งต้องอยู่ระหว่าง 1-1000")
        return v


class LeaderboardEntry(BaseModel):
    username: str
    exp: int
