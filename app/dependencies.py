"""
Dependency สำหรับดึง user ปัจจุบันจาก JWT ใน header Authorization: Bearer <token>
ใช้ป้องกัน endpoint ที่ต้อง login (เช่น /users/me, /users/me/exp)
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from google.cloud.firestore_v1.base_document import DocumentSnapshot

from app.core.firebase import get_firestore_client
from app.core.security import decode_access_token

bearer_scheme = HTTPBearer(auto_error=True)


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> DocumentSnapshot:
    unauthorized = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="ยังไม่ได้เข้าสู่ระบบ หรือ session หมดอายุ",
        headers={"WWW-Authenticate": "Bearer"},
    )

    username = decode_access_token(credentials.credentials)
    if username is None:
        raise unauthorized

    db = get_firestore_client()
    user_doc = db.collection("users").document(username).get()
    if not user_doc.exists:
        raise unauthorized

    return user_doc
