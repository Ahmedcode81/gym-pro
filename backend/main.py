from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from database import engine, Base
from routers import auth, members, memberships, checkins, trainers, workouts, nutrition, measurements, classes, payments, pos, inventory, reports, settings, audit, dashboard
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting up...")
    Base.metadata.create_all(bind=engine)
    yield
    # Shutdown
    logger.info("Shutting down...")

app = FastAPI(
    title="Gym Management System API",
    description="Enterprise-grade gym management system API",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(dashboard.router, prefix="/api/v1/dashboard", tags=["Dashboard"])
app.include_router(members.router, prefix="/api/v1/members", tags=["Members"])
app.include_router(memberships.router, prefix="/api/v1/memberships", tags=["Memberships"])
app.include_router(checkins.router, prefix="/api/v1/checkins", tags=["Check-ins"])
app.include_router(trainers.router, prefix="/api/v1/trainers", tags=["Trainers"])
app.include_router(workouts.router, prefix="/api/v1/workouts", tags=["Workout Programs"])
app.include_router(nutrition.router, prefix="/api/v1/nutrition", tags=["Nutrition Plans"])
app.include_router(measurements.router, prefix="/api/v1/measurements", tags=["Body Measurements"])
app.include_router(classes.router, prefix="/api/v1/classes", tags=["Group Classes"])
app.include_router(payments.router, prefix="/api/v1/payments", tags=["Payments"])
app.include_router(pos.router, prefix="/api/v1/pos", tags=["Point of Sale"])
app.include_router(inventory.router, prefix="/api/v1/inventory", tags=["Inventory"])
app.include_router(reports.router, prefix="/api/v1/reports", tags=["Reports"])
app.include_router(settings.router, prefix="/api/v1/settings", tags=["Settings"])
app.include_router(audit.router, prefix="/api/v1/audit", tags=["Audit Log"])

@app.get("/")
async def root():
    return {"message": "Gym Management System API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
