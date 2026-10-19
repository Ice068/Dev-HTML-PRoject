# คู่มือเปิด DevQuest บน Windows

โปรเจกต์อยู่ที่ `D:\Dev-HTML-PRoject` ใช้ Python FastAPI เป็น Backend และ HTML/CSS/JavaScript เป็น Frontend

## 1. ตั้งค่า CORS

เปิดไฟล์ `D:\Dev-HTML-PRoject\.env` แล้วแก้เฉพาะบรรทัด `ALLOWED_ORIGINS` เป็น:

```dotenv
ALLOWED_ORIGINS=http://localhost:5500,http://127.0.0.1:5500,http://localhost:5501,http://127.0.0.1:5501
```

เก็บค่าอื่น เช่น SECRET_KEY และการตั้งค่า Firebase ไว้ตามเดิม หลังแก้ `.env` ให้หยุดและเปิด Backend ใหม่

## 2. เปิด Backend

เปิด PowerShell หน้าต่างแรก แล้วรัน:

```powershell
cd D:\Dev-HTML-PRoject
.\venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000
```

รอข้อความ `Application startup complete` และปล่อยหน้าต่างนี้รันไว้

- ตรวจ Backend: <http://localhost:8000/>
- API docs: <http://localhost:8000/docs> (เมื่อเปิด ENABLE_DOCS ไว้)

หากยังไม่ได้ติดตั้ง dependencies ให้รันจากโฟลเดอร์โปรเจกต์:

```powershell
.\venv\Scripts\python.exe -m pip install -r requirements.txt
```

## 3. เปิด Frontend

เปิด PowerShell อีกหน้าต่าง แล้วรันคำสั่งนี้:

```powershell
& "D:\Dev-HTML-PRoject\venv\Scripts\python.exe" -m http.server 5501 --bind 127.0.0.1 --directory "D:\Dev-HTML-PRoject\frontend"
```

เมื่อขึ้น `Serving HTTP on 127.0.0.1 port 5501` ให้ปล่อยหน้าต่างนี้รันไว้

เปิดหน้าเข้าสู่ระบบ:

**<http://127.0.0.1:5501/temple/login.html>**

คำสั่งกำหนดให้ `frontend` เป็นรากของเว็บแล้ว จึงไม่ต้องใส่ `/frontend` ใน URL

| หน้า/ไฟล์ | URL |
|---|---|
| เข้าสู่ระบบ | http://127.0.0.1:5501/temple/login.html |
| Dashboard | http://127.0.0.1:5501/temple/dashboard.html |
| ตรวจไฟล์ CSS | http://127.0.0.1:5501/static/css/login.css |

ควรใช้ hostname เดิมต่อเนื่อง เช่น `127.0.0.1` เพราะข้อมูลเข้าสู่ระบบใน localStorage แยกตาม origin

## 4. หยุดเซิร์ฟเวอร์

กด `Ctrl+C` ในหน้าต่าง PowerShell ของแต่ละเซิร์ฟเวอร์

## แก้ปัญหาที่พบบ่อย

### เปิดหน้าเข้าสู่ระบบแล้วขึ้น 404

ถ้า log แสดง:

```text
GET /frontend/temple/login.html HTTP/1.1 404
```

ให้เปลี่ยน URL เป็น:

```text
http://127.0.0.1:5501/temple/login.html
```

### CSS โหลดไม่ได้ และ MIME type เป็น text/html

เซิร์ฟเวอร์ส่งหน้า HTML กลับมาแทน CSS ซึ่งมักเป็นหน้า 404 ตรวจว่า:

1. เปิดเว็บที่พอร์ต `5501` ตามคำสั่งข้างต้น
2. เซิร์ฟเวอร์ใช้ `--directory "D:\Dev-HTML-PRoject\frontend"`
3. เปิด `http://127.0.0.1:5501/static/css/login.css` แล้วเห็นโค้ด CSS
4. กด `Ctrl+F5` เพื่อโหลดหน้าใหม่

### /users/me ขึ้น Failed to fetch หรือ net::ERR_FAILED

ตรวจว่า Backend พอร์ต `8000` รันอยู่ และ `.env` อนุญาต origin ของหน้าเว็บ เช่น `http://127.0.0.1:5501`

Frontend ตั้งค่า API ใน `frontend\static\js\config.js`:

```javascript
const API_BASE_URL = "http://localhost:8000";
```

หลังเปลี่ยน CORS ให้เปิด Backend ใหม่ หากยังผิดพลาดให้ดูข้อความใน Console และ log ของ Backend

### /users/me ตอบ 401 Unauthorized

ให้เข้าสู่ระบบใหม่ หากเปลี่ยนจาก `localhost` เป็น `127.0.0.1` หรือเปลี่ยนพอร์ต ต้องเข้าสู่ระบบใหม่บน origin นั้น

### /.well-known/appspecific/com.chrome.devtools.json ขึ้น 404

เป็นคำขอไฟล์ตั้งค่าจาก Chrome DevTools โปรเจกต์ไม่มีไฟล์นี้จึงตอบ 404 ไม่กระทบการเปิดหน้าเว็บ

### /favicon.ico ขึ้น 404

โปรเจกต์ไม่มีไอคอนเว็บที่ตำแหน่งนี้ ไม่กระทบการโหลด HTML, CSS หรือ API

### พอร์ตถูกใช้งานอยู่

หยุดเซิร์ฟเวอร์เดิมของโปรเจกต์ด้วย `Ctrl+C` ก่อนเปิดใหม่ หากเปลี่ยนพอร์ต Frontend ต้องปรับ URL และ ALLOWED_ORIGINS ให้ตรงกัน
