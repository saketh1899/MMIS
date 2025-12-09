# backend/app/utils/security.py
# ----------------------------------------------------------
# Handles secure password hashing and verification using
# the 'bcrypt' algorithm (via passlib).
# ----------------------------------------------------------
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    """Return the hashed version of a plain-text password."""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Compare plain password with its hashed version."""
    return pwd_context.verify(plain_password, hashed_password)
