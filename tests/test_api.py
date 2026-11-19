def test_root_returns_ok_and_security_headers(client):
    res = client.get("/")

    assert res.status_code == 200
    assert "message" in res.json()
    assert res.headers["X-Content-Type-Options"] == "nosniff"
    assert res.headers["X-Frame-Options"] == "DENY"
    assert res.headers["Referrer-Policy"] == "no-referrer"
    assert "max-age=" in res.headers["Strict-Transport-Security"]
    assert res.headers["Content-Security-Policy"] == "default-src 'none'; frame-ancestors 'none'"
    assert "geolocation=()" in res.headers["Permissions-Policy"]


def test_signup_login_and_user_exp_flow(client):
    signup_res = client.post("/auth/signup", json={"username": "Hero_01", "password": "password123"})
    assert signup_res.status_code == 201

    dup_res = client.post("/auth/signup", json={"username": "hero_01", "password": "password123"})
    assert dup_res.status_code == 409

    login_res = client.post("/auth/login", json={"username": "Hero_01", "password": "password123"})
    assert login_res.status_code == 200
    body = login_res.json()
    assert body["token_type"] == "bearer"
    assert body["user"] == {"id": "hero_01", "username": "hero_01", "exp": 0}
    assert "hashed_password" not in body["user"]

    headers = {"Authorization": f"Bearer {body['access_token']}"}

    me_res = client.get("/users/me", headers=headers)
    assert me_res.status_code == 200
    assert me_res.json() == {"id": "hero_01", "username": "hero_01", "exp": 0}

    exp_res = client.patch("/users/me/exp", json={"exp": 150}, headers=headers)
    assert exp_res.status_code == 200

    me_after = client.get("/users/me", headers=headers)
    assert me_after.status_code == 200
    assert me_after.json()["exp"] == 150


def test_login_generic_error_prevents_user_enumeration(client):
    client.post("/auth/signup", json={"username": "alice", "password": "password123"})

    wrong_pass = client.post("/auth/login", json={"username": "alice", "password": "wrongpassword"})
    missing_user = client.post("/auth/login", json={"username": "nobody", "password": "password123"})

    assert wrong_pass.status_code == 401
    assert missing_user.status_code == 401
    assert wrong_pass.json()["detail"] == missing_user.json()["detail"]


def test_validation_error_format(client):
    res = client.post("/auth/signup", json={"username": "x", "password": "123"})

    assert res.status_code == 422
    detail = res.json()["detail"]
    assert isinstance(detail, list)
    assert all("field" in item and "message" in item for item in detail)


def test_protected_endpoints_require_valid_jwt(client):
    assert client.get("/users/me").status_code in (401, 403)
    assert client.patch("/users/me/exp", json={"exp": 10}).status_code in (401, 403)
    assert client.get("/users/me", headers={"Authorization": "Bearer invalid.token.here"}).status_code == 401


def test_add_exp_rejects_excessive_value(client):
    client.post("/auth/signup", json={"username": "bob", "password": "password123"})
    token = client.post("/auth/login", json={"username": "bob", "password": "password123"}).json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    res = client.patch("/users/me/exp", json={"exp": 5000}, headers=headers)
    assert res.status_code == 422


def test_leaderboard_sorted_descending_and_limited_to_10(client):
    for i in range(12):
        username = f"player_{i:02d}"
        client.post("/auth/signup", json={"username": username, "password": "password123"})
        token = client.post("/auth/login", json={"username": username, "password": "password123"}).json()[
            "access_token"
        ]
        client.patch(
            "/users/me/exp",
            json={"exp": (i + 1) * 10},
            headers={"Authorization": f"Bearer {token}"},
        )

    res = client.get("/leaderboard")
    assert res.status_code == 200
    entries = res.json()
    assert len(entries) == 10
    assert entries[0] == {"username": "player_11", "exp": 120}
    assert entries[-1] == {"username": "player_02", "exp": 30}
    assert all(set(entry.keys()) == {"username", "exp"} for entry in entries)


def test_logout_revokes_token_immediately_and_sets_no_store(client):
    client.post("/auth/signup", json={"username": "logout_user", "password": "password123"})
    login_res = client.post("/auth/login", json={"username": "logout_user", "password": "password123"})
    assert login_res.status_code == 200
    assert login_res.headers.get("Cache-Control") == "no-store"

    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    me_before = client.get("/users/me", headers=headers)
    assert me_before.status_code == 200
    assert me_before.headers.get("Cache-Control") == "no-store"

    logout_res = client.post("/auth/logout", headers=headers)
    assert logout_res.status_code == 200

    # Token ที่ logout แล้วต้องใช้งานต่อไม่ได้ทันที
    me_after = client.get("/users/me", headers=headers)
    assert me_after.status_code == 401


def test_login_blocks_path_traversal_and_oversized_password(client):
    traversal_res = client.post(
        "/auth/login",
        json={"username": "../../other_collection/doc", "password": "password123"},
    )
    assert traversal_res.status_code == 401

    dos_res = client.post(
        "/auth/login",
        json={"username": "alice", "password": "x" * 200},
    )
    assert dos_res.status_code == 422


def test_add_exp_rejects_boolean(client):
    client.post("/auth/signup", json={"username": "bool_tester", "password": "password123"})
    token = client.post("/auth/login", json={"username": "bool_tester", "password": "password123"}).json()[
        "access_token"
    ]
    res = client.patch(
        "/users/me/exp",
        json={"exp": True},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert res.status_code == 422
