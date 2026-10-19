"""
Router: /auth/signup, /auth/login

จุดที่เสริมความปลอดภัยเทียบกับของเดิม:
- รหัสผ่านแฮชด้วย bcrypt ก่อนเก็บ (ของเดิมเก็บ plain text)
- ใช้ Firestore document.create() โดยใช้ username เป็น document id
  -> atomic กันกรณี race condition สมัครชื่อซ้ำพร้อมกัน (ของเดิมไม่กันเลย)
- login สำเร็จ ออก JWT ให้ ไม่ส่ง password กลับไปเด็ดขาด (ของเดิมส่ง row ทั้งแถวรวม password กลับไป)
- error message ตอน login ไม่บอกว่า "username ไม่มี" หรือ "password ผิด"
  -> กัน user enumeration
- จำกัด rate การยิง signup/login กันการโจมตีแบบ brute-force
"""
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, Request, status
from google.api_core.exceptions import AlreadyExists

from app.core.firebase import get_firestore_client
from app.core.limiter import limiter
from app.core.security import create_access_token, hash_password, verify_password
from app.models.schemas import (
    LoginRequest,
    LoginResponse,
    MessageResponse,
    SignupRequest,
    UserPublic,
)

router = APIRouter(prefix="/auth", tags=["auth"])


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
        # ข้อความนี้เปิดเผยว่ามี username นี้แล้ว ซึ่งยอมรับได้สำหรับหน้าสมัครสมาชิก
        raise HTTPException(status_code=409, detail="ชื่อผู้ใช้นี้ถูกใช้แล้ว")

    return MessageResponse(message="สมัครสำเร็จ")


@router.post("/login", response_model=LoginResponse)
@limiter.limit("10/minute")
def login(request: Request, payload: LoginRequest):
    db = get_firestore_client()
    user_doc = db.collection("users").document(payload.username.strip().lower()).get()

    generic_error = HTTPException(status_code=401, detail="ข้อมูลไม่ถูกต้อง")

    if not user_doc.exists:
        raise generic_error

    data = user_doc.to_dict()
    if not verify_password(payload.password, data["hashed_password"]):
        raise generic_error

    token = create_access_token(subject=user_doc.id)

    return LoginResponse(
        message="เข้าสู่ระบบสำเร็จ",
        access_token=token,
        user=UserPublic(id=user_doc.id, username=data["username"], exp=data.get("exp", 0)),
    )
