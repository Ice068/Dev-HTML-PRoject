import pytest
from pydantic import ValidationError

from app.models.schemas import AddExpRequest, SignupRequest


def test_signup_normalizes_username_to_lowercase():
    req = SignupRequest(username="  Dev_Hero01  ", password="password123")

    assert req.username == "dev_hero01"


@pytest.mark.parametrize("bad_username", ["ab", "a" * 31, "bad name", "user@mail", "ชื่อไทย"])
def test_signup_rejects_invalid_username(bad_username):
    with pytest.raises(ValidationError):
        SignupRequest(username=bad_username, password="password123")


@pytest.mark.parametrize("bad_password", ["short", "1234567", "x" * 129])
def test_signup_rejects_invalid_password(bad_password):
    with pytest.raises(ValidationError):
        SignupRequest(username="valid_user", password=bad_password)


@pytest.mark.parametrize("valid_exp", [1, 50, 1000])
def test_add_exp_accepts_valid_range(valid_exp):
    req = AddExpRequest(exp=valid_exp)

    assert req.exp == valid_exp


@pytest.mark.parametrize("bad_exp", [-10, 0, 1001, 999999, True, False])
def test_add_exp_rejects_out_of_range(bad_exp):
    with pytest.raises(ValidationError):
        AddExpRequest(exp=bad_exp)
