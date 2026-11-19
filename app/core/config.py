"""
การตั้งค่าแอปทั้งหมดอ่านจาก environment variables (.env)
ห้าม hardcode ค่า secret ไว้ในโค้ดเด็ดขาด
"""
from functools import lru_cache

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

ALLOWED_JWT_ALGORITHMS = {"HS256", "HS384", "HS512"}
PLACEHOLDER_SECRETS = {
    "CHANGE_ME_TO_A_LONG_RANDOM_SECRET",
    "secret",
    "changeme",
}


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

    @field_validator("secret_key")
    @classmethod
    def validate_secret_key(cls, v: str) -> str:
        cleaned = v.strip()
        if len(cleaned) < 32 or cleaned in PLACEHOLDER_SECRETS:
            raise ValueError("SECRET_KEY ต้องยาวอย่างน้อย 32 ตัวอักษรและห้ามใช้ค่าตัวอย่างเริ่มต้น")
        return cleaned

    @field_validator("algorithm")
    @classmethod
    def validate_algorithm(cls, v: str) -> str:
        alg = v.strip().upper()
        if alg not in ALLOWED_JWT_ALGORITHMS:
            raise ValueError(f"ALGORITHM ต้องเป็นหนึ่งใน {sorted(ALLOWED_JWT_ALGORITHMS)}")
        return alg

    @field_validator("access_token_expire_minutes")
    @classmethod
    def validate_expire_minutes(cls, v: int) -> int:
        if v < 1 or v > 1440:
            raise ValueError("ACCESS_TOKEN_EXPIRE_MINUTES ต้องอยู่ระหว่าง 1-1440 นาที")
        return v

    @field_validator("allowed_origins")
    @classmethod
    def validate_allowed_origins(cls, v: str) -> str:
        origins = [o.strip() for o in v.split(",") if o.strip()]
        if "*" in origins:
            raise ValueError("ห้ามตั้ง ALLOWED_ORIGINS เป็น '*' เมื่อเปิดใช้งาน credentials")
        return v

    @property
    def cors_origins(self) -> list[str]:
        return [o.strip() for o in self.allowed_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
