# backend/app/utils/jwt_handler.py
# ----------------------------------------------------------
# Generates and decodes JWT tokens for authentication.
# ----------------------------------------------------------
from datetime import datetime, timedelta
from jose import jwt, JWTError

SECRET_KEY = "supersecretkey"       # Replace with environment variable in production
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

def create_access_token(data: dict):
    """Encode payload into JWT with expiry."""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def verify_access_token(token: str):
    """Decode and validate JWT token."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None
