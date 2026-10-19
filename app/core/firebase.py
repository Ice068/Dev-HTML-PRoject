"""
เชื่อมต่อ Firebase Firestore ผ่าน Firebase Admin SDK
Service account key ต้องเก็บนอก git repo เสมอ (อยู่ใน .gitignore)
"""
from functools import lru_cache

import firebase_admin
from firebase_admin import credentials, firestore

from app.core.config import get_settings


@lru_cache
def get_firestore_client():
    settings = get_settings()
    if not firebase_admin._apps:
        cred = credentials.Certificate(settings.firebase_credentials_path)
        firebase_admin.initialize_app(cred)
    return firestore.client()
