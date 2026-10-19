"""
Router: /users/me, /users/me/exp, /leaderboard

จุดที่เสริมความปลอดภัยเทียบกับของเดิม:
- ของเดิม: GET /user/:id และ POST /add-exp รับ id ใครก็ได้จาก client
  -> ใครก็เพิ่ม exp ให้ user คนอื่น หรือดูข้อมูล user คนอื่นได้ (IDOR)
- ใหม่: ต้องแนบ JWT ของตัวเอง endpoint จะดึง/แก้ไขได้เฉพาะ "ของตัวเอง" เท่านั้น
  ไม่มีทางระบุ user คนอื่นผ่าน parameter ได้อีกต่อไป
- เพิ่ม exp ใช้ Firestore transaction (increment) กัน race condition เวลายิงพร้อมกันหลาย request
"""
from fastapi import APIRouter, Depends
from google.cloud import firestore as firestore_types
from google.cloud.firestore_v1.base_document import DocumentSnapshot

from app.core.firebase import get_firestore_client
from app.dependencies import get_current_user
from app.models.schemas import AddExpRequest, LeaderboardEntry, MessageResponse, UserPublic

router = APIRouter(tags=["users"])


@router.get("/users/me", response_model=UserPublic)
def get_me(current_user: DocumentSnapshot = Depends(get_current_user)):
    data = current_user.to_dict()
    return UserPublic(id=current_user.id, username=data["username"], exp=data.get("exp", 0))


@router.patch("/users/me/exp", response_model=MessageResponse)
def add_my_exp(
    payload: AddExpRequest,
    current_user: DocumentSnapshot = Depends(get_current_user),
):
    db = get_firestore_client()
    user_ref = db.collection("users").document(current_user.id)
    user_ref.update({"exp": firestore_types.Increment(payload.exp)})
    return MessageResponse(message="เพิ่ม EXP สำเร็จ")


@router.get("/leaderboard", response_model=list[LeaderboardEntry])
def leaderboard():
    db = get_firestore_client()
    query = (
        db.collection("users")
        .order_by("exp", direction=firestore_types.Query.DESCENDING)
        .limit(10)
    )
    return [
        LeaderboardEntry(username=doc.to_dict()["username"], exp=doc.to_dict().get("exp", 0))
        for doc in query.stream()
    ]
