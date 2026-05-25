from fastapi import APIRouter, Depends, HTTPException, status
from .. import schemas, state
from ..auth import hash_password, verify_password, create_access_token, get_current_user
from ..supabase_client import get_supabase

router = APIRouter()


@router.post("/register", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
def register(user: schemas.UserCreate):
    sb = get_supabase()
    if sb.table("users").select("id").eq("username", user.username).execute().data:
        raise HTTPException(status_code=400, detail="Username already registered")
    if sb.table("users").select("id").eq("email", user.email).execute().data:
        raise HTTPException(status_code=400, detail="Email already registered")
    result = sb.table("users").insert({
        "username": user.username,
        "email": user.email,
        "hashed_password": hash_password(user.password),
    }).execute()
    row = result.data[0]
    return schemas.UserResponse(id=row["id"], username=row["username"], email=row["email"])


@router.post("/login", response_model=schemas.Token)
def login(form: schemas.LoginRequest):
    sb = get_supabase()
    result = sb.table("users").select("*").eq("email", form.email).execute()
    user_data = result.data[0] if result.data else None
    if not user_data or not verify_password(form.password, user_data["hashed_password"]):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    if user_data["id"] in state.withdrawn_user_ids:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    token = create_access_token({"sub": user_data["username"]})
    return {"access_token": token, "token_type": "bearer"}


@router.get("/me", response_model=schemas.UserResponse)
def get_me(current_user: schemas.UserResponse = Depends(get_current_user)):
    return current_user


@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
def withdraw(current_user: schemas.UserResponse = Depends(get_current_user)):
    state.withdrawn_user_ids.add(current_user.id)
