import hashlib
import hmac
import os
from datetime import datetime, timedelta
from typing import Optional, Union, Any
from jose import jwt
from passlib.context import CryptContext
from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except Exception:
        # Fallback de segurança se passlib/bcrypt tiver divergência de versão
        salt_pass = hashed_password.split("$")
        if len(salt_pass) == 3 and salt_pass[0] == "pbkdf2":
            salt = bytes.fromhex(salt_pass[1])
            expected = salt_pass[2]
            key = hashlib.pbkdf2_hmac('sha256', plain_password.encode(), salt, 100000)
            return hmac.compare_digest(key.hex(), expected)
        return False

def get_password_hash(password: str) -> str:
    try:
        return pwd_context.hash(password)
    except Exception:
        # Fallback robusto
        salt = os.urandom(16)
        key = hashlib.pbkdf2_hmac('sha256', password.encode(), salt, 100000)
        return f"pbkdf2${salt.hex()}${key.hex()}"

def create_access_token(subject: Union[str, Any], role: str = "USER", expires_delta: Optional[timedelta] = None) -> str:
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode = {
        "exp": expire,
        "sub": str(subject),
        "role": role
    }
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt
