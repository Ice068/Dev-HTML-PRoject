"""
Router: /auth/signup, /auth/login, /auth/logout

จุดที่เสริมความปลอดภัย:
- รหัสผ่านแฮชด้วย bcrypt ก่อนเก็บ (ไม่เก็บ plain text)
- ใช้ Firestore document.create() โดยใช้ username เป็น document id กัน race condition
- กัน timing-attack user enumeration ด้วย dummy bcrypt เมื่อไม่พบผู้ใช้หรือรูปแบบชื่อไม่ถูกต้อง
- กัน Firestore document path traversal โดยตรวจ USERNAME_PATTERN ก่อน query เสมอ
- จำกัด rate การยิง signup/login/logout กัน brute-force
- รองรับ POST /auth/logout เพิกถอน JWT ทันทีบนฝั่งเซิร์ฟเวอร์
"""
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials
from google.api_core.exceptions import AlreadyExists

from app.core.firebase import get_firestore_client
from app.core.limiter import limiter
from app.core.security import (
    create_access_token,
    hash_password,
    revoke_token,
    verify_password,
)
from app.dependencies import bearer_scheme, get_current_user
from app.models.schemas import (
    USERNAME_PATTERN,
    LoginRequest,
    LoginResponse,
    MessageResponse,
    SignupRequest,
    UserPublic,
)

router = APIRouter(prefix="/auth", tags=["auth"])

# ใช้ตรวจรหัสผ่านจำลองเมื่อไม่พบ user เพื่อกัน timing-attack user enumeration
DUMMY_PASSWORD_HASH = hash_password("devquest-dummy-timing-guard-password")


@router.post("/signup", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("5/minute")
def signup(request: Request, payload: SignupRequest):
    db = get_firestore_client()
    user_ref = db.collection("users").document(payload.username)

    try:
        user_ref.create(
            {
                "username": payload.username,
                "hashed_password": hash_password(payload.password),
                "exp": 0,
                "created_at": datetime.now(timezone.utc),
            }
        )
    except AlreadyExists:
        raise HTTPException(status_code=409, detail="ชื่อผู้ใช้นี้ถูกใช้แล้ว")

    return MessageResponse(message="สมัครสำเร็จ")


@router.post("/login", response_model=LoginResponse)
@limiter.limit("10/minute")
def login(request: Request, payload: LoginRequest):
    generic_error = HTTPException(status_code=401, detail="ข้อมูลไม่ถูกต้อง")
    normalized_username = payload.username.strip().lower()

    # กัน Firestore path traversal (เช่น "../other/doc") และทำ timing guard
    if not USERNAME_PATTERN.match(normalized_username):
        verify_password(payload.password, DUMMY_PASSWORD_HASH)
        raise generic_error

    db = get_firestore_client()
    user_doc = db.collection("users").document(normalized_username).get()

    if not user_doc.exists:
        verify_password(payload.password, DUMMY_PASSWORD_HASH)
        raise generic_error

    data = user_doc.to_dict() or {}
    hashed_password = data.get("hashed_password")
    if not hashed_password or not verify_password(payload.password, hashed_password):
        raise generic_error

    token = create_access_token(subject=user_doc.id)

    return LoginResponse(
        message="เข้าสู่ระบบสำเร็จ",
        access_token=token,
        user=UserPublic(id=user_doc.id, username=data["username"], exp=data.get("exp", 0)),
    )


@router.post("/logout", response_model=MessageResponse)
@limiter.limit("20/minute")
def logout(
    request: Request,
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    _current_user=Depends(get_current_user),
):
    revoke_token(credentials.credentials)
    return MessageResponse(message="ออกจากระบบสำเร็จ")
