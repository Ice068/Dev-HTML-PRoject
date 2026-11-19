"""
Router: /users/me, /users/me/exp, /leaderboard

จุดที่เสริมความปลอดภัย:
- ต้องแนบ JWT ของตัวเอง (กัน IDOR — อ่าน/แก้ได้เฉพาะข้อมูลของตัวเองเท่านั้น)
- เพิ่ม exp ใช้ Firestore Increment กัน race condition
- จำกัด rate limit ทุก endpoint กันการปั๊ม EXP และการยิงโหลดฐานข้อมูล (DoS)
"""
from fastapi import APIRouter, Depends, Request
from google.cloud import firestore as firestore_types
from google.cloud.firestore_v1.base_document import DocumentSnapshot

from app.core.firebase import get_firestore_client
from app.core.limiter import limiter
from app.dependencies import get_current_user
from app.models.schemas import AddExpRequest, LeaderboardEntry, MessageResponse, UserPublic

router = APIRouter(tags=["users"])


@router.get("/users/me", response_model=UserPublic)
@limiter.limit("60/minute")
def get_me(request: Request, current_user: DocumentSnapshot = Depends(get_current_user)):
    data = current_user.to_dict() or {}
    return UserPublic(id=current_user.id, username=data["username"], exp=data.get("exp", 0))


@router.patch("/users/me/exp", response_model=MessageResponse)
@limiter.limit("30/minute")
def add_my_exp(
    request: Request,
    payload: AddExpRequest,
    current_user: DocumentSnapshot = Depends(get_current_user),
):
    db = get_firestore_client()
    user_ref = db.collection("users").document(current_user.id)
    user_ref.update({"exp": firestore_types.Increment(payload.exp)})
    return MessageResponse(message="เพิ่ม EXP สำเร็จ")


@router.get("/leaderboard", response_model=list[LeaderboardEntry])
@limiter.limit("60/minute")
def leaderboard(request: Request):
    db = get_firestore_client()
    query = (
        db.collection("users")
        .order_by("exp", direction=firestore_types.Query.DESCENDING)
        .limit(10)
    )
    entries = []
    for doc in query.stream():
        data = doc.to_dict() or {}
        if "username" in data:
            entries.append(LeaderboardEntry(username=data["username"], exp=data.get("exp", 0)))
    return entries
