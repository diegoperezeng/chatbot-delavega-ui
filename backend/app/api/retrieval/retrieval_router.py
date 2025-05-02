from fastapi import APIRouter
from app.api.retrieval import process, retrieve

router = APIRouter()

router.include_router(process.router, prefix="/process", tags=["retrieval"])
router.include_router(retrieve.router, prefix="/retrieve", tags=["retrieval"]) 