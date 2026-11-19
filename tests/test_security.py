import datetime as dt

import jwt

from app.core.config import get_settings
from app.core.security import (
    create_access_token,
    decode_access_token,
    hash_password,
    verify_password,
)


def test_password_hashing_and_verification():
    plain = "super_secure_pass123"
    hashed = hash_password(plain)

    assert hashed != plain
    assert verify_password(plain, hashed) is True
    assert verify_password("wrong_password", hashed) is False


def test_create_and_decode_access_token():
    token = create_access_token(subject="hero_player")

    assert decode_access_token(token) == "hero_player"


def test_decode_invalid_token_returns_none():
    assert decode_access_token("not-a-valid-jwt") is None


def test_decode_tampered_token_returns_none():
    token = create_access_token(subject="hero_player")
    tampered = token[:-4] + ("aaaa" if not token.endswith("aaaa") else "bbbb")

    assert decode_access_token(tampered) is None


def test_decode_expired_token_returns_none():
    settings = get_settings()
    expired_payload = {
        "sub": "hero_player",
        "exp": dt.datetime.now(dt.timezone.utc) - dt.timedelta(minutes=1),
        "iat": dt.datetime.now(dt.timezone.utc) - dt.timedelta(minutes=5),
    }
    expired_token = jwt.encode(expired_payload, settings.secret_key, algorithm=settings.algorithm)

    assert decode_access_token(expired_token) is None


def test_revoked_token_is_rejected():
    from app.core.security import clear_revoked_tokens, revoke_token

    clear_revoked_tokens()
    token = create_access_token(subject="hero_player")
    assert decode_access_token(token) == "hero_player"
    assert revoke_token(token) is True
    assert decode_access_token(token) is None
    clear_revoked_tokens()


def test_settings_reject_weak_secret_and_unsafe_algorithm_and_wildcard_cors():
    import pytest
    from pydantic import ValidationError

    from app.core.config import Settings

    with pytest.raises(ValidationError):
        Settings(_env_file=None, secret_key="short")

    with pytest.raises(ValidationError):
        Settings(_env_file=None, secret_key="CHANGE_ME_TO_A_LONG_RANDOM_SECRET")

    with pytest.raises(ValidationError):
        Settings(_env_file=None, secret_key="a" * 32, algorithm="none")

    with pytest.raises(ValidationError):
        Settings(_env_file=None, secret_key="a" * 32, allowed_origins="*")
