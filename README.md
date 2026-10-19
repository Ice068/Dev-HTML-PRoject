# DevQuest API — FastAPI + Firebase (เวอร์ชันปรับปรุงความปลอดภัย)

ปรับจาก backend เดิม (Node.js/Express + SQLite) มาเป็น **Python (FastAPI)** และเปลี่ยนฐานข้อมูลเป็น
**Firebase Firestore** พร้อมเสริมความปลอดภัยหลายจุด

## สิ่งที่เปลี่ยนจากของเดิม

| เรื่อง | ของเดิม | เวอร์ชันใหม่ |
|---|---|---|
| ภาษา/เฟรมเวิร์ก backend | Node.js + Express | Python + FastAPI |
| ฐานข้อมูล | SQLite ไฟล์เดียว | Firebase Firestore |
| รหัสผ่าน | เก็บ plain text ตรงๆ | แฮชด้วย **bcrypt** ก่อนเก็บเสมอ |
| Authentication | ไม่มี — ส่ง `userId` มากับทุก request | **JWT** ออกให้ตอน login, ต้องแนบทุกครั้งที่เรียก endpoint ที่ต้อง login |
| การแก้ไขข้อมูล user | ใครก็ส่ง `userId` คนอื่นมาแก้ exp ได้ (IDOR) | endpoint อ่าน id จาก JWT เท่านั้น แก้ได้แค่ของตัวเอง |
| Input validation | แทบไม่มี | Pydantic ตรวจ username/password/exp ทุกฟิลด์ |
| Rate limit | ไม่มี | จำกัด `/auth/login`, `/auth/signup` กัน brute-force |
| CORS | `cors()` เปิดรับทุก origin | จำกัดเฉพาะ origin ที่ตั้งค่าไว้ใน `.env` |
| Security headers | ไม่มี | เพิ่ม HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy |
| Secret/credentials | ไม่มีเลยในโค้ดเดิม (ไม่มี auth) | อ่านจาก environment variable ทั้งหมด ไม่ hardcode |
| การเข้าถึง Firestore จาก client โดยตรง | (เดิมไม่มี Firebase) | ปิดด้วย Firestore Security Rules — เข้าได้ผ่าน backend เท่านั้น |

## โครงสร้างโปรเจกต์

```
devquest-fastapi/
├── app/
│   ├── main.py              # จุดเริ่มแอป, CORS, security headers, rate limit
│   ├── dependencies.py      # ดึง user จาก JWT (auth guard)
│   ├── core/
│   │   ├── config.py        # อ่านค่าจาก .env
│   │   ├── security.py      # hash password + สร้าง/ตรวจ JWT
│   │   ├── firebase.py      # เชื่อมต่อ Firestore
│   │   └── limiter.py       # rate limiter
│   ├── models/
│   │   └── schemas.py       # Pydantic request/response models + validation
│   └── routers/
│       ├── auth.py          # /auth/signup, /auth/login
│       └── users.py         # /users/me, /users/me/exp, /leaderboard
├── frontend/                 # ไฟล์หน้าเว็บเดิม แก้ให้เรียก API ใหม่ + แนบ JWT
├── requirements.txt
├── .env.example
├── firestore.rules
└── Dockerfile
```

## ขั้นตอนติดตั้ง

### 1. สร้างโปรเจกต์ Firebase
1. ไปที่ [Firebase Console](https://console.firebase.google.com) → สร้างโปรเจกต์ใหม่
2. เปิดใช้งาน **Firestore Database** (โหมด production)
3. ไปที่ Project settings → Service accounts → **Generate new private key**
   จะได้ไฟล์ `.json` — เก็บไว้ในโฟลเดอร์โปรเจกต์ (เช่น `firebase-service-account.json`)
   **ห้าม commit ไฟล์นี้ขึ้น git เด็ดขาด** (อยู่ใน `.gitignore` แล้ว)
4. คัดลอกเนื้อหาไฟล์ `firestore.rules` ไปวางใน Firestore Database → Rules แล้ว Publish
   (ปิดไม่ให้ client เข้าถึง Firestore ตรงๆ ข้าม backend)

### 2. ตั้งค่า environment
```bash
cp .env.example .env
```
แก้ค่าใน `.env`:
- `SECRET_KEY` — สุ่มด้วย `python -c "import secrets; print(secrets.token_hex(32))"`
- `FIREBASE_CREDENTIALS_PATH` — path ไปยังไฟล์ service account ที่ดาวน์โหลดมา
- `ALLOWED_ORIGINS` — origin ของ frontend เช่น `http://localhost:5500`

### 3. ติดตั้ง dependencies และรันเซิร์ฟเวอร์
```bash
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
เปิด `http://localhost:8000/docs` เพื่อดู API docs (ปิดได้ผ่าน `ENABLE_DOCS=false` ใน `.env` ตอน production)

### 4. รัน frontend
เปิดไฟล์ใน `frontend/` ด้วย Live Server (หรือ static server ใดก็ได้) แล้วเข้า `login.html`
ถ้า deploy จริง อย่าลืมแก้ `API_BASE_URL` ใน `frontend/config.js` ให้ตรงกับ URL ของ backend จริง

## API หลัก

| Method | Endpoint | ต้อง JWT? | คำอธิบาย |
|---|---|---|---|
| POST | `/auth/signup` | ไม่ | สมัครสมาชิก (rate limit 5/นาที) |
| POST | `/auth/login` | ไม่ | เข้าสู่ระบบ ได้ JWT กลับมา (rate limit 10/นาที) |
| GET | `/users/me` | ต้อง | ดูข้อมูลตัวเอง (id, username, exp) |
| PATCH | `/users/me/exp` | ต้อง | เพิ่ม exp ให้ตัวเอง (1-1000 ต่อครั้ง) |
| GET | `/leaderboard` | ไม่ | อันดับ top 10 (username, exp เท่านั้น) |

ทุก endpoint ที่ต้อง JWT ให้แนบ header:
```
Authorization: Bearer <access_token>
```

## หมายเหตุด้านความปลอดภัยที่ควรทำต่อ (แนะนำ ไม่ได้ทำไว้ในโค้ดชุดนี้)
- ใส่ HTTPS จริงตอน deploy (เช่นผ่าน reverse proxy/Cloud Run/Load Balancer) — token ที่ส่งผ่าน HTTP เปล่าเสี่ยงถูกดักฟัง
- เพิ่ม refresh token + revoke list ถ้าต้องการให้ logout แล้ว token ใช้ไม่ได้ทันที (ตอนนี้ access token จะหมดอายุเองตามเวลาที่ตั้งเท่านั้น)
- พิจารณาใช้ Firebase Authentication แทนการทำ JWT เอง ถ้าต้องการฟีเจอร์ เช่น login ด้วย Google/Email verification/Reset password ในตัว
- ตั้ง monitoring/log การ login ผิดพลาดซ้ำๆ เพื่อตรวจจับการโจมตี
