from pydantic import BaseModel

from app.schemas.user import Email


class LoginRequest(BaseModel):
    email: Email
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    sub: str | None = None