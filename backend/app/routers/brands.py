from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.models.models import Brand
from app.schemas.schemas import BrandResponse

router = APIRouter(prefix="/brands", tags=["Marcas"])

@router.get("", response_model=List[BrandResponse])
def list_brands(db: Session = Depends(get_db)):
    return db.query(Brand).order_by(Brand.name.asc()).all()
