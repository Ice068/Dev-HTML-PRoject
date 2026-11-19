# DevQuest — แพลตฟอร์มฝึกเขียน HTML (FastAPI + Firebase + SOLO Taxonomy)

แพลตฟอร์มเกมเรียนรู้การเขียน HTML แบบภารกิจ (Quest + Boss Stage + SimCode) ปรับปรุง Backend เป็น **Python (FastAPI)** + **Firebase Firestore** พร้อมเสริมความปลอดภัย และเพิ่มระบบ **แอบบอกใบ้แบบไต่ระดับตามหลัก SOLO Taxonomy** ในทุกบทเรียนและด่าน Boss

> 📖 **ต้องการรันโปรเจกต์ทันที?** ดูคู่มือแบบทีละขั้นตอนทั้ง Windows / macOS / Linux / Docker ได้ที่ **[README_RUN.md](README_RUN.md)**

---

## ✨ ฟีเจอร์หลัก

- **บทเรียน HTML 12 บท + 2 ด่าน Boss + SimCode Playground** พร้อมระบบสะสม EXP และปลดล็อกด่านทีละขั้น
- **ระบบแอบบอกใบ้ตามหลัก SOLO Taxonomy 5 ระดับ** (`Pre-structural` → `Uni-structural` → `Multi-structural` → `Relational` → `Extended Abstract`)
  - เปลี่ยนจากการแสดงโค้ดเฉลยตรง ๆ เป็นแผนภาพแนวคิดและคำใบ้แบบเปิดทีละขั้น
  - วิเคราะห์โค้ดที่ผู้เรียนเขียนและให้คำแนะนำแบบปรับตัวตามระดับ SOLO โดยไม่เฉลยคำตอบตรง ๆ
- **Backend ปลอดภัยด้วย FastAPI + Firebase Firestore**

| เรื่อง | ของเดิม | เวอร์ชันปัจจุบัน |
|---|---|---|
| ภาษา/เฟรมเวิร์ก backend | Node.js + Express | Python + FastAPI |
| ฐานข้อมูล | SQLite ไฟล์เดียว | Firebase Firestore |
| รหัสผ่าน | เก็บ plain text ตรง ๆ | แฮชด้วย **bcrypt** ก่อนเก็บเสมอ |
| Authentication | ส่ง `userId` มากับ request ตรง ๆ | **JWT** ออกให้ตอน login และแนบผ่าน `Authorization: Bearer` |
| การแก้ไขข้อมูล user | เสี่ยง IDOR แก้ข้อมูลคนอื่นได้ | อ่าน user id จาก JWT เท่านั้น แก้ได้เฉพาะของตัวเอง |
| Input validation | แทบไม่มี | Pydantic ตรวจ username/password/exp ทุกฟิลด์ |
| Rate limit | ไม่มี | จำกัด `/auth/login`, `/auth/signup` กัน brute-force |
| CORS & Security headers | เปิดรับทุก origin | จำกัดตาม `ALLOWED_ORIGINS` + HSTS, X-Frame-Options, nosniff, Referrer-Policy |
| การเข้าถึง Firestore จาก client | — | ปิดด้วย `firestore.rules` เข้าได้ผ่าน Backend เท่านั้น |

---

## 📁 โครงสร้างโปรเจกต์

```text
Dev-HTML-PRoject/
├── app/
│   ├── main.py                  # จุดเริ่มแอป, CORS, security headers, rate limit
│   ├── dependencies.py          # ดึง user จาก JWT (auth guard)
│   ├── core/
│   │   ├── config.py            # อ่านค่าจาก .env (pydantic-settings)
│   │   ├── security.py          # hash password (bcrypt) + สร้าง/ตรวจ JWT
│   │   ├── firebase.py          # เชื่อมต่อ Firebase Firestore
│   │   └── limiter.py           # rate limiter (slowapi)
│   ├── models/
│   │   └── schemas.py           # Pydantic request/response models
│   └── routers/
│       ├── auth.py              # POST /auth/signup, POST /auth/login
│       └── users.py             # GET /users/me, PATCH /users/me/exp, GET /leaderboard
├── frontend/
│   ├── temple/                  # หน้า HTML ทั้งหมด (login, dashboard, quest, lesson1-12, boss1-2, simcode, progress)
│   └── static/
│       ├── css/                 # สไตล์ของแต่ละหน้า + solo-hint.css
│       └── js/                  # config.js, solo-hint.js และสคริปต์ของแต่ละหน้า
├── tests/                       # Unit & API tests (pytest + FakeFirestore)
├── .github/workflows/ci.yml     # GitHub Actions CI (Ruff, Pytest, JS check, Docker build)
├── firestore.rules              # กฎปิดการเข้าถึง Firestore จาก client โดยตรง
├── requirements.txt             # Dependencies สำหรับรันแอป
├── requirements-dev.txt         # Dependencies สำหรับพัฒนาและทดสอบ (pytest, httpx, ruff)
├── pyproject.toml               # ตั้งค่า Ruff และ Pytest
├── .env.example                 # ตัวอย่างตัวแปรสภาพแวดล้อม
├── Dockerfile                   # Docker image สำหรับ Backend
├── README.md                    # ภาพรวมโปรเจกต์
└── README_RUN.md                # คู่มือการติดตั้งและรันอย่างละเอียด
```

---

## ⚡ เริ่มรันแบบเร็ว (Quick Start)

ดูรายละเอียดครบทุกขั้นตอน (รวมการตั้งค่า Firebase, Docker และการแก้ปัญหา) ใน **[README_RUN.md](README_RUN.md)**

```bash
# 1. สร้าง venv และติดตั้งแพ็กเกจ
python -m venv .venv
# Windows PowerShell: .\.venv\Scripts\Activate.ps1
# macOS / Linux:      source .venv/bin/activate
pip install -r requirements.txt

# 2. เตรียมไฟล์ .env และวาง firebase-service-account.json ที่รากโปรเจกต์
cp .env.example .env
# แก้ SECRET_KEY และเพิ่ม http://127.0.0.1:5501 ใน ALLOWED_ORIGINS

# 3. Terminal 1 — รัน Backend (พอร์ต 8000)
uvicorn app.main:app --reload --port 8000

# 4. Terminal 2 — รัน Frontend โดยให้ frontend/ เป็นรากเว็บ (พอร์ต 5501)
python -m http.server 5501 --bind 127.0.0.1 --directory frontend
```

จากนั้นเปิดเบราว์เซอร์ที่ **<http://127.0.0.1:5501/temple/login.html>**

*(หาก deploy จริง ให้แก้ค่า `API_BASE_URL` ใน `frontend/static/js/config.js` ให้ตรงกับ URL ของ Backend)*

---

## 🧪 รันชุดทดสอบ (Tests & Lint)

```bash
pip install -r requirements-dev.txt
ruff check app tests
pytest -v
```

---

## 🔌 API หลัก

| Method | Endpoint | ต้อง JWT? | คำอธิบาย |
|---|---|---|---|
| `GET` | `/` | ไม่ | ตรวจสถานะการทำงานของ API |
| `POST` | `/auth/signup` | ไม่ | สมัครสมาชิก (rate limit 5/นาที) |
| `POST` | `/auth/login` | ไม่ | เข้าสู่ระบบและรับ JWT (rate limit 10/นาที) |
| `POST` | `/auth/logout` | ต้อง | ออกจากระบบและเพิกถอน JWT ทันที (rate limit 20/นาที) |
| `GET` | `/users/me` | ต้อง | ดูข้อมูลตัวเอง (`id`, `username`, `exp`) |
| `PATCH` | `/users/me/exp` | ต้อง | เพิ่ม EXP ให้ตัวเอง (`1–1000` ต่อครั้ง) |
| `GET` | `/leaderboard` | ไม่ | อันดับ top 10 (`username`, `exp` เท่านั้น) |

ทุก endpoint ที่ต้องใช้ JWT ให้แนบ header:

```http
Authorization: Bearer <access_token>
```

---

## 🔒 หมายเหตุด้านความปลอดภัยสำหรับ Production

- เปิดใช้งาน **HTTPS** จริงตอน deploy (เช่น ผ่าน Reverse Proxy / Cloud Run / Load Balancer)
- ตั้งค่า `ENABLE_DOCS=false` ใน `.env` เพื่อปิด `/docs` และ `/redoc`
- พิจารณาเพิ่ม refresh token + revoke list หากต้องการให้ logout แล้วเพิกถอน token ทันที
- ตั้ง monitoring/alert เมื่อพบการ login ผิดพลาดซ้ำ ๆ เพื่อตรวจจับการโจมตี
