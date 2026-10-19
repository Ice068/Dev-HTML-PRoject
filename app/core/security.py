"""
ฟังก์ชันด้านความปลอดภัย:
- แฮชรหัสผ่านด้วย bcrypt (ไม่เก็บ plain text เด็ดขาด)
- สร้าง/ตรวจสอบ JWT access token
"""
import datetime as dt

import jwt
from passlib.context import CryptContext

from app.core.config import get_settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(plain_password: str) -> str:
    return pwd_context.hash(plain_password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(subject: str) -> str:
    settings = get_settings()
    expire = dt.datetime.now(dt.timezone.utc) + dt.timedelta(
        minutes=settings.access_token_expire_minutes
    )
    payload = {"sub": subject, "exp": expire, "iat": dt.datetime.now(dt.timezone.utc)}
    return jwt.encode(payload, settings.secret_key, algorithm=settings.algorithm)


def decode_access_token(token: str) -> str | None:
    """คืนค่า username (sub) ถ้า token ถูกต้อง, คืน None ถ้าไม่ถูกต้อง/หมดอายุ"""
    settings = get_settings()
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        return payload.get("sub")
    except jwt.PyJWTError:
        return None
