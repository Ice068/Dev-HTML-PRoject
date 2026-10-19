"""
การตั้งค่าแอปทั้งหมดอ่านจาก environment variables (.env)
ห้าม hardcode ค่า secret ไว้ในโค้ดเด็ดขาด
"""
from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    # JWT
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60

    # Firebase
    firebase_credentials_path: str = "./firebase-service-account.json"

    # CORS - comma separated origins, e.g. "http://localhost:5500,https://example.com"
    allowed_origins: str = ""

    # Docs toggle - ปิดใน production เพื่อลดพื้นผิวโจมตี
    enable_docs: bool = True

    @property
    def cors_origins(self) -> list[str]:
        return [o.strip() for o in self.allowed_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
