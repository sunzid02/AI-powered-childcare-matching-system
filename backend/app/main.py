from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.analytics import router as analytics_router
from app.api.childminders import router as childminders_router
from app.api.children import router as children_router
from app.api.health import router as health_router
from app.api.matches import router as matches_router
from app.api.parents import router as parents_router
from app.api.requests import router as requests_router
from app.api.seed import router as seed_router
from app.config import settings

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    debug=settings.debug,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(seed_router)
app.include_router(parents_router)
app.include_router(children_router)
app.include_router(childminders_router)
app.include_router(requests_router)
app.include_router(matches_router)
app.include_router(analytics_router)