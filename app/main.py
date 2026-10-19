"""
DevQuest API — FastAPI + Firebase Firestore

เทียบกับ backend เดิม (Express + SQLite) จุดที่เสริมความปลอดภัย:
1. รหัสผ่านแฮชด้วย bcrypt แทนการเก็บ plain text
2. ใช้ JWT auth แทนการส่ง userId ตรงๆ จาก client (กัน IDOR)
3. Validate input ทุกจุดด้วย Pydantic (username/password format, exp range)
4. จำกัด rate ของ endpoint sensitive (signup/login) กัน brute-force
5. CORS จำกัดเฉพาะ origin ที่กำหนดใน .env แทนการเปิดรับทุก origin ("*")
6. เพิ่ม security headers มาตรฐาน (HSTS, X-Frame-Options, X-Content-Type-Options ฯลฯ)
7. ปิด /docs, /redoc ได้ผ่าน env ตอน deploy production
8. Secret ทั้งหมด (JWT secret, Firebase credentials) อ่านจาก environment variable ไม่ hardcode
"""
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.core.config import get_settings
from app.core.limiter import limiter
from app.routers import auth, users

settings = get_settings()

app = FastAPI(
    title="DevQuest API",
    version="2.0.0",
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
    allow_methods=["GET", "POST", "PATCH"],
    allow_headers=["Authorization", "Content-Type"],
)


# ===== Security headers มาตรฐาน =====
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "no-referrer"
    response.headers["Strict-Transport-Security"] = "max-age=63072000; includeSubDomains"
    return response


# ===== ไม่ leak รายละเอียด validation error ที่อาจมีข้อมูลอ่อนไหว =====
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = [
        {"field": ".".join(str(loc) for loc in err["loc"] if loc != "body"), "message": err["msg"]}
        for err in exc.errors()
    ]
    return JSONResponse(status_code=422, content={"detail": errors})


app.include_router(auth.router)
app.include_router(users.router)


@app.get("/")
def root():
    return {"message": "🚀 DevQuest API (FastAPI + Firebase) ทำงานอยู่!"}
