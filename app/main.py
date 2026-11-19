"""
DevQuest API — FastAPI + Firebase Firestore (Hardened)

จุดที่เสริมความปลอดภัย:
1. รหัสผ่านแฮชด้วย bcrypt + dummy verification กัน timing-attack user enumeration
2. ใช้ JWT auth พร้อม jti และรองรับ POST /auth/logout เพิกถอน token ทันที
3. Validate input ทุกจุดด้วย Pydantic + กัน Firestore path traversal + กัน boolean EXP
4. จำกัด rate limit ทุก endpoint สำคัญ (/auth/*, /users/me*, /leaderboard)
5. CORS จำกัดเฉพาะ origin ที่กำหนดใน .env และห้าม wildcard "*"
6. Security headers ครบชุด (HSTS, X-Frame-Options, nosniff, Referrer-Policy, CSP, Permissions-Policy, Cache-Control)
7. Global exception handler ไม่เปิดเผย stack trace สู่ภายนอก
8. ปิด /docs, /redoc ได้ผ่าน env ตอน deploy production
"""
import logging

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.core.config import get_settings
from app.core.limiter import limiter
from app.routers import auth, users

logger = logging.getLogger("devquest")

settings = get_settings()

app = FastAPI(
    title="DevQuest API",
    version="2.1.0",
    docs_url="/docs" if settings.enable_docs else None,
    redoc_url="/redoc" if settings.enable_docs else None,
)

# ===== Rate limiting =====
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# ===== CORS: จำกัดเฉพาะ origin ที่ระบุใน .env เท่านั้น =====
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

DOCS_PATHS = {"/docs", "/redoc", "/openapi.json"}


# ===== Security headers มาตรฐาน =====
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "no-referrer"
    response.headers["Strict-Transport-Security"] = "max-age=63072000; includeSubDomains"
    response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=(), payment=()"

    if request.url.path not in DOCS_PATHS:
        response.headers["Content-Security-Policy"] = "default-src 'none'; frame-ancestors 'none'"

    if request.url.path.startswith("/auth/") or request.url.path.startswith("/users/me"):
        response.headers["Cache-Control"] = "no-store"
        response.headers["Pragma"] = "no-cache"

    return response


# ===== ไม่ leak รายละเอียด validation error ที่อาจมีข้อมูลอ่อนไหว =====
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = [
        {"field": ".".join(str(loc) for loc in err["loc"] if loc != "body"), "message": err["msg"]}
        for err in exc.errors()
    ]
    return JSONResponse(status_code=422, content={"detail": errors})


# ===== กัน stack trace รั่วเมื่อเกิดข้อผิดพลาดไม่คาดคิด =====
@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    logger.exception("Unhandled error on %s %s", request.method, request.url.path)
    return JSONResponse(status_code=500, content={"detail": "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์"})


app.include_router(auth.router)
app.include_router(users.router)


@app.get("/")
def root():
    return {"message": "🚀 DevQuest API (FastAPI + Firebase) ทำงานอยู่!"}
