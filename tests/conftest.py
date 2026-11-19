import os

import pytest
from fastapi.testclient import TestClient
from google.api_core.exceptions import AlreadyExists
from google.cloud import firestore as firestore_types


def pytest_configure():
    os.environ.setdefault("SECRET_KEY", "ci-test-secret-key-at-least-32-bytes-long")
    os.environ.setdefault("ALLOWED_ORIGINS", "http://localhost:5500")
    os.environ.setdefault("ENABLE_DOCS", "true")


class FakeDocumentSnapshot:
    def __init__(self, doc_id: str, data: dict | None):
        self.id = doc_id
        self._data = dict(data) if data is not None else None
        self.exists = data is not None

    def to_dict(self) -> dict | None:
        return dict(self._data) if self._data is not None else None


class FakeDocumentReference:
    def __init__(self, store: dict[str, dict], doc_id: str):
        self._store = store
        self._doc_id = doc_id

    def create(self, data: dict) -> None:
        if self._doc_id in self._store:
            raise AlreadyExists(f"Document {self._doc_id} already exists")
        self._store[self._doc_id] = dict(data)

    def get(self) -> FakeDocumentSnapshot:
        return FakeDocumentSnapshot(self._doc_id, self._store.get(self._doc_id))

    def update(self, updates: dict) -> None:
        doc = self._store[self._doc_id]
        for key, value in updates.items():
            if isinstance(value, firestore_types.Increment):
                doc[key] = doc.get(key, 0) + value.value
            else:
                doc[key] = value


class FakeQuery:
    def __init__(
        self,
        store: dict[str, dict],
        order_field: str | None = None,
        descending: bool = False,
        limit_count: int | None = None,
    ):
        self._store = store
        self._order_field = order_field
        self._descending = descending
        self._limit_count = limit_count

    def order_by(self, field: str, direction: str = firestore_types.Query.ASCENDING) -> "FakeQuery":
        return FakeQuery(
            self._store,
            order_field=field,
            descending=(direction == firestore_types.Query.DESCENDING),
            limit_count=self._limit_count,
        )

    def limit(self, count: int) -> "FakeQuery":
        return FakeQuery(
            self._store,
            order_field=self._order_field,
            descending=self._descending,
            limit_count=count,
        )

    def stream(self):
        items = list(self._store.items())
        if self._order_field is not None:
            items.sort(key=lambda pair: pair[1].get(self._order_field, 0), reverse=self._descending)
        if self._limit_count is not None:
            items = items[: self._limit_count]
        for doc_id, data in items:
            yield FakeDocumentSnapshot(doc_id, data)


class FakeCollection:
    def __init__(self, store: dict[str, dict]):
        self._store = store

    def document(self, doc_id: str) -> FakeDocumentReference:
        return FakeDocumentReference(self._store, doc_id)

    def order_by(self, field: str, direction: str = firestore_types.Query.ASCENDING) -> FakeQuery:
        return FakeQuery(self._store).order_by(field, direction=direction)

    def limit(self, count: int) -> FakeQuery:
        return FakeQuery(self._store).limit(count)


class FakeFirestore:
    def __init__(self):
        self._collections: dict[str, dict[str, dict]] = {}

    def collection(self, name: str) -> FakeCollection:
        return FakeCollection(self._collections.setdefault(name, {}))


@pytest.fixture()
def fake_db():
    return FakeFirestore()


@pytest.fixture()
def client(monkeypatch, fake_db):
    from app import dependencies
    from app.core import firebase
    from app.core.limiter import limiter
    from app.main import app
    from app.routers import auth, users

    monkeypatch.setattr(limiter, "enabled", False)
    monkeypatch.setattr(firebase, "get_firestore_client", lambda: fake_db)
    monkeypatch.setattr(dependencies, "get_firestore_client", lambda: fake_db)
    monkeypatch.setattr(auth, "get_firestore_client", lambda: fake_db)
    monkeypatch.setattr(users, "get_firestore_client", lambda: fake_db)

    with TestClient(app) as test_client:
        yield test_client
