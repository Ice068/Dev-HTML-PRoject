FROM python:3.12-slim

WORKDIR /app

# สร้าง non-root user เพื่อลดความเสี่ยงด้านความปลอดภัยในคอนเทนเนอร์
RUN groupadd --system appgroup && useradd --system --gid appgroup --no-create-home appuser

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY --chown=appuser:appgroup app ./app

USER appuser

# ไม่ COPY .env หรือ service-account key เข้า image — ต้อง inject ตอน runtime เท่านั้น
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
