# 🚀 คู่มือการติดตั้งและรันโปรเจกต์ DevQuest

คู่มือนี้สรุปขั้นตอนการรัน **DevQuest** แบบครบถ้วนทั้ง Backend (**FastAPI + Firebase Firestore**) และ Frontend (**HTML/CSS/JS** พร้อมระบบแอบบอกใบ้ตามหลัก **SOLO Taxonomy**) รองรับทั้ง **Windows (PowerShell)** และ **macOS / Linux**

---

## 📋 สิ่งที่ต้องเตรียมก่อนเริ่ม

- **Python 3.12+** (แนะนำ Python 3.12)
- **Git**
- **บัญชี Firebase** พร้อมสร้าง Firestore Database และไฟล์ Service Account Key (`.json`)
- *(ตัวเลือก)* **Node.js 22+** สำหรับตรวจ syntax ฝั่ง Frontend
- *(ตัวเลือก)* **Docker** หากต้องการรัน Backend ผ่านคอนเทนเนอร์

---

## 1. โคลนโปรเจกต์และเลือก Branch

```bash
git clone https://github.com/Ice068/Dev-HTML-PRoject.git
cd Dev-HTML-PRoject
```

หากต้องการใช้งานเวอร์ชันที่มีระบบแอบบอกใบ้ตามหลัก **SOLO Taxonomy** และชุดทดสอบ Backend ให้สลับมาที่ branch:

```bash
git checkout feat/solo-taxonomy-hints
```

---

## 2. สร้าง Virtual Environment และติดตั้ง Dependencies

### Windows (PowerShell)

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
```

> หากต้องการรันชุดทดสอบ (`pytest`) และตรวจโค้ด (`ruff`) ด้วย ให้ติดตั้งไฟล์ dev แทน:
>
> ```powershell
> pip install -r requirements-dev.txt
> ```

### macOS / Linux

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
pip install -r requirements.txt
# หรือสำหรับพัฒนาและรันเทสต์:
# pip install -r requirements-dev.txt
```

---

## 3. ตั้งค่า Firebase และไฟล์ `.env`

### 3.1 เตรียม Firebase Firestore

1. ไปที่ [Firebase Console](https://console.firebase.google.com) → สร้างหรือเลือกโปรเจกต์
2. เปิดใช้งาน **Firestore Database** (Production mode)
3. ไปที่ **Project settings → Service accounts → Generate new private key**
4. บันทึกไฟล์ `.json` ที่ได้ไว้ที่โฟลเดอร์หลักของโปรเจกต์ในชื่อ `firebase-service-account.json`
   *(ไฟล์นี้อยู่ใน `.gitignore` แล้ว **ห้าม commit ขึ้น Git เด็ดขาด**)*
5. คัดลอกเนื้อหาในไฟล์ `firestore.rules` ไปวางที่ **Firestore Database → Rules** แล้วกด **Publish**

### 3.2 สร้างไฟล์ `.env`

คัดลอกจากไฟล์ตัวอย่าง:

- **Windows (PowerShell):**
  ```powershell
  Copy-Item .env.example .env
  ```
- **macOS / Linux:**
  ```bash
  cp .env.example .env
  ```

สุ่มค่า `SECRET_KEY` ใหม่ด้วยคำสั่ง:

```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

จากนั้นเปิดไฟล์ `.env` และกำหนดค่าให้ครบ (ตัวอย่างด้านล่างรองรับทั้งพอร์ต `5500` และ `5501`):

```dotenv
SECRET_KEY=<วางค่าที่สุ่มได้ตรงนี้>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
FIREBASE_CREDENTIALS_PATH=./firebase-service-account.json
ALLOWED_ORIGINS=http://localhost:5500,http://127.0.0.1:5500,http://localhost:5501,http://127.0.0.1:5501
ENABLE_DOCS=true
```

> ⚠️ ทุกครั้งที่แก้ไขไฟล์ `.env` ต้องหยุดและเปิด Backend ใหม่เพื่อให้ค่าใหม่มีผล

---

## 4. รัน Backend (FastAPI — พอร์ต 8000)

เปิด **Terminal หน้าต่างที่ 1** ที่โฟลเดอร์โปรเจกต์ (พร้อมเปิดใช้งาน `.venv` แล้ว) และรัน:

- **Windows (PowerShell):**
  ```powershell
  .\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000
  ```
- **macOS / Linux:**
  ```bash
  uvicorn app.main:app --reload --port 8000
  ```

เมื่อขึ้นข้อความ `Application startup complete.` แสดงว่า Backend พร้อมใช้งาน (ปล่อยหน้าต่างนี้เปิดค้างไว้)

- ตรวจสอบสถานะ API: <http://localhost:8000/>
- ดูเอกสาร API (Swagger UI): <http://localhost:8000/docs> *(เมื่อ `ENABLE_DOCS=true`)*

---

## 5. รัน Frontend (Static Server — พอร์ต 5501)

เปิด **Terminal หน้าต่างที่ 2** ที่โฟลเดอร์โปรเจกต์ แล้วรัน static server โดยกำหนดให้โฟลเดอร์ `frontend` เป็นรากของเว็บ:

- **Windows (PowerShell):**
  ```powershell
  .\.venv\Scripts\python.exe -m http.server 5501 --bind 127.0.0.1 --directory frontend
  ```
- **macOS / Linux:**
  ```bash
  python3 -m http.server 5501 --bind 127.0.0.1 --directory frontend
  ```

เมื่อขึ้นข้อความ `Serving HTTP on 127.0.0.1 port 5501` ให้เปิดเบราว์เซอร์ไปที่:

👉 **<http://127.0.0.1:5501/temple/login.html>**

### ตาราง URL หลักของหน้าเว็บ

| หน้า | URL |
|---|---|
| เข้าสู่ระบบ / สมัครสมาชิก | `http://127.0.0.1:5501/temple/login.html` |
| ฐานบัญชาการ (Dashboard) | `http://127.0.0.1:5501/temple/dashboard.html` |
| รายการภารกิจ (Quest) | `http://127.0.0.1:5501/temple/quest.html` |
| บทเรียน (Lesson 1–12) | `http://127.0.0.1:5501/temple/lesson1.html` (ถึง `lesson12.html`) |
| ด่าน Boss 1 & Final Boss | `http://127.0.0.1:5501/temple/boss1.html`, `boss2.html` |
| จำลองโค้ด (SimCode) | `http://127.0.0.1:5501/temple/simcode.html` |
| ความคืบหน้า (Progress) | `http://127.0.0.1:5501/temple/progress.html` |

> 💡 **ข้อควรรู้สำคัญ**
> - ต้องระบุ `--directory frontend` เสมอ เพราะไฟล์ HTML อ้างอิง asset ผ่าน `/static/...` และลิงก์หน้าเว็บผ่าน `/temple/...` จึงไม่ต้องใส่ `/frontend` ใน URL
> - ควรใช้ hostname เดียวกันตลอด (เช่น `127.0.0.1` ตลอด ไม่สลับไป `localhost`) เพราะ `localStorage` เก็บ token และสถานะการผ่านด่านแยกตาม origin
> - ฝั่ง Frontend ชี้ไปที่ Backend ผ่านค่า `API_BASE_URL` ในไฟล์ `frontend/static/js/config.js` (ค่าเริ่มต้นคือ `http://localhost:8000`)

---

## 6. ทางเลือก: รัน Backend ด้วย Docker

หากไม่ต้องการติดตั้ง Python บนเครื่อง สามารถรัน Backend ผ่าน Docker ได้โดยเตรียม `.env` และ `firebase-service-account.json` ให้เรียบร้อยก่อน แล้วรัน:

```bash
docker build -t devquest-api .
```

- **Windows (PowerShell):**
  ```powershell
  docker run --rm -p 8000:8000 --env-file .env `
    -v "${PWD}\firebase-service-account.json:/app/firebase-service-account.json:ro" `
    devquest-api
  ```
- **macOS / Linux:**
  ```bash
  docker run --rm -p 8000:8000 --env-file .env \
    -v "$(pwd)/firebase-service-account.json:/app/firebase-service-account.json:ro" \
    devquest-api
  ```

จากนั้นเปิด Frontend ตามขั้นตอนที่ 5 ตามปกติ

---

## 7. การรันชุดทดสอบและตรวจสอบโค้ด (Test & Lint)

ติดตั้งเครื่องมือพัฒนาก่อน (`pip install -r requirements-dev.txt`) จากนั้นรันคำสั่งต่อไปนี้จากรากโปรเจกต์:

```bash
# ตรวจสไตล์โค้ด Backend ด้วย Ruff
ruff check app tests

# รันชุดทดสอบ Unit & API Tests (จำลอง Firestore ให้อัตโนมัติ ไม่ต้องต่อ Firebase จริง)
pytest -v
```

ตรวจ syntax ฝั่ง Frontend (ต้องมี Node.js):

- **Windows (PowerShell):**
  ```powershell
  Get-ChildItem frontend\static\js\*.js | ForEach-Object { node --check $_.FullName }
  ```
- **macOS / Linux:**
  ```bash
  for f in frontend/static/js/*.js; do node --check "$f"; done
  ```

---

## 8. วิธีหยุดเซิร์ฟเวอร์

กด `Ctrl + C` ในหน้าต่าง Terminal ทั้งสองหน้าต่าง (Backend และ Frontend)

---

## 🛠️ แก้ปัญหาที่พบบ่อย (Troubleshooting)

| อาการที่พบ | สาเหตุและวิธีแก้ไข |
|---|---|
| เปิดหน้าเว็บแล้วขึ้น **404** (`GET /frontend/temple/login.html 404`) | รันเซิร์ฟเวอร์ด้วย `--directory frontend` แล้ว ให้ตัด `/frontend` ออกและเข้า `http://127.0.0.1:5501/temple/login.html` แทน |
| หน้าเว็บไม่มีสี/สไตล์ (CSS โหลดไม่ได้) | ตรวจสอบว่าเปิดเซิร์ฟเวอร์ Frontend ด้วย `--directory frontend` แล้วลองเปิด `http://127.0.0.1:5501/static/css/login.css` เพื่อตรวจว่าเห็นไฟล์ CSS จากนั้นกด `Ctrl + F5` |
| เรียก `/users/me` หรือ Login แล้วขึ้น **Failed to fetch / CORS error** | 1) ตรวจว่า Backend พอร์ต `8000` รันอยู่<br>2) ตรวจว่า `ALLOWED_ORIGINS` ใน `.env` มี origin ของ Frontend (เช่น `http://127.0.0.1:5501`)<br>3) รีสตาร์ต Backend หลังแก้ `.env` |
| ได้รับ **401 Unauthorized** | Token หมดอายุ หรือสลับ URL ระหว่าง `localhost` กับ `127.0.0.1` ให้กลับไปหน้า Login เพื่อเข้าสู่ระบบใหม่บน origin เดิม |
| พอร์ต `8000` หรือ `5501` ถูกใช้งานอยู่ | หยุดโปรเซสเดิมก่อน หรือเปลี่ยนพอร์ต Frontend แล้วเพิ่ม origin พอร์ตใหม่ลงใน `ALLOWED_ORIGINS` ใน `.env` |
| เห็น 404 ของ `/favicon.ico` หรือ `/.well-known/...` | เป็นคำขออัตโนมัติของเบราว์เซอร์/Chrome DevTools ไม่มีผลต่อการทำงานของแอป |
