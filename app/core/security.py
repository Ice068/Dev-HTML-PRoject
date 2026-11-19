"""
ฟังก์ชันด้านความปลอดภัย:
- แฮชรหัสผ่านด้วย bcrypt (ไม่เก็บ plain text เด็ดขาด)
- สร้าง/ตรวจสอบ JWT access token พร้อม jti และ token revocation (logout)
"""
import datetime as dt
import secrets
from threading import Lock

import jwt
from passlib.context import CryptContext

from app.core.config import get_settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# เก็บ jti ของ token ที่ถูก logout แล้ว (ล้างรายการที่หมดอายุอัตโนมัติ)
_revoked_tokens: dict[str, float] = {}
_revoked_lock = Lock()


def hash_password(plain_password: str) -> str:
    return pwd_context.hash(plain_password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def _prune_revoked_tokens(now_ts: float) -> None:
    expired = [jti for jti, exp_ts in _revoked_tokens.items() if exp_ts <= now_ts]
    for jti in expired:
        _revoked_tokens.pop(jti, None)


def revoke_token(token: str) -> bool:
    """เพิกถอน JWT ตาม jti จนกว่าจะหมดอายุจริง"""
    payload = decode_access_token_payload(token)
    if payload is None:
        return False

    jti = payload.get("jti")
    exp = payload.get("exp")
    if not jti or not isinstance(exp, (int, float)):
        return False

    now_ts = dt.datetime.now(dt.timezone.utc).timestamp()
    with _revoked_lock:
        _prune_revoked_tokens(now_ts)
        _revoked_tokens[jti] = float(exp)
    return True


def is_token_revoked(jti: str | None) -> bool:
    if not jti:
        return False
    now_ts = dt.datetime.now(dt.timezone.utc).timestamp()
    with _revoked_lock:
        _prune_revoked_tokens(now_ts)
        return jti in _revoked_tokens


def clear_revoked_tokens() -> None:
    """ล้างรายการ token ที่เพิกถอน (ใช้สำหรับ unit test)"""
    with _revoked_lock:
        _revoked_tokens.clear()


def create_access_token(subject: str) -> str:
    settings = get_settings()
    now = dt.datetime.now(dt.timezone.utc)
    expire = now + dt.timedelta(minutes=settings.access_token_expire_minutes)
    payload = {
        "sub": subject,
        "jti": secrets.token_urlsafe(16),
        "type": "access",
        "exp": expire,
        "iat": now,
    }
    return jwt.encode(payload, settings.secret_key, algorithm=settings.algorithm)


def decode_access_token_payload(token: str) -> dict | None:
    """ถอดรหัสและตรวจความถูกต้องของ JWT (signature, exp, iat, sub, type, revocation)"""
    settings = get_settings()
    try:
        payload = jwt.decode(
            token,
            settings.secret_key,
            algorithms=[settings.algorithm],
            options={"require": ["sub", "exp", "iat"]},
        )
    except jwt.PyJWTError:
        return None

    token_type = payload.get("type")
    if token_type is not None and token_type != "access":
        return None

    if is_token_revoked(payload.get("jti")):
        return None

    sub = payload.get("sub")
    if not isinstance(sub, str) or not sub:
        return None

    return payload


def decode_access_token(token: str) -> str | None:
    """คืนค่า username (sub) ถ้า token ถูกต้องและไม่ถูกเพิกถอน, คืน None ถ้าไม่ถูกต้อง/หมดอายุ"""
    payload = decode_access_token_payload(token)
    if payload is None:
        return None
    return payload.get("sub")
