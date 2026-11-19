"""
Rate limiter (ป้องกัน brute-force / credential stuffing บน endpoint ที่ sensitive)

หมายเหตุ: ส่ง config_filename="" เพื่อไม่ให้ slowapi/starlette เปิดไฟล์ .env
ด้วย default encoding ของระบบ (เช่น cp874 บน Windows ภาษาไทย) ซึ่งจะเกิด
UnicodeDecodeError เมื่อไฟล์ .env มีคอมเมนต์ภาษาไทยแบบ UTF-8
(การอ่าน .env ของแอปจัดการผ่าน pydantic-settings ด้วย utf-8 ใน app/core/config.py อยู่แล้ว)
"""
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address, config_filename="")
