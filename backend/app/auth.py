from datetime import datetime, timedelta, timezone
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from . import schemas, state
from .supabase_client import get_supabase

SECRET_KEY = "matsuripple-dev-secret-change-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")
oauth2_scheme_optional = OAuth2PasswordBearer(tokenUrl="/auth/login", auto_error=False)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode["exp"] = expire
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def _fetch_user_by_username(username: str) -> Optional[schemas.UserDB]:
    sb = get_supabase()
    result = sb.table("users").select("*").eq("username", username).execute()
    if not result.data:
        return None
    return schemas.UserDB(**result.data[0])


def get_current_user(token: str = Depends(oauth2_scheme)) -> schemas.UserResponse:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = _fetch_user_by_username(username)
    if user is None or user.id in state.withdrawn_user_ids:
        raise credentials_exception
    return schemas.UserResponse(id=user.id, username=user.username, email=user.email)


def get_optional_user(token: Optional[str] = Depends(oauth2_scheme_optional)) -> Optional[schemas.UserResponse]:
    if not token:
        return None
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if not username:
            return None
        user = _fetch_user_by_username(username)
        if user is None:
            return None
        return schemas.UserResponse(id=user.id, username=user.username, email=user.email)
    except JWTError:
        return None
