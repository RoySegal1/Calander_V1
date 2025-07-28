import time
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from backend.app.api.auth import router as auth_router
from backend.app.api.coursesInfo import router as courses_info_router
from backend.app.api.schedule import router as student_schedule_router
from backend.app.core.logger import logger
from backend.app.core.cache import load_courses_to_mem
from backend.data.consts import VALID_ENDPOINTS


# Rate limiter setup
limiter = Limiter(key_func=get_remote_address)


@asynccontextmanager
async def lifespan(app: FastAPI):
    load_courses_to_mem()
    logger.info("Startup tasks completed.")
    yield


app = FastAPI(lifespan=lifespan)

# Add rate limiting middleware
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)


@app.middleware("http")
async def validate_endpoints(request: Request, call_next):
    start_time = time.time()
    path = request.url.path
    client_ip = request.client.host if request.client else "unknown"
    user_agent = request.headers.get("user-agent", "unknown")
    method = request.method

    # Check if path starts with any valid endpoint
    if not any(path.startswith(endpoint) or path == endpoint for endpoint in VALID_ENDPOINTS):
        logger.warning(
            f"BLOCKED REQUEST - Invalid endpoint: {method} {path} | "
            f"IP: {client_ip} | User-Agent: {user_agent[:100]} | "
            f"Query: {str(request.query_params)}"
        )
        raise HTTPException(status_code=404, detail="Endpoint not found")

    # Log valid requests
    logger.info(f"VALID REQUEST - {method} {path} | IP: {client_ip}")

    response = await call_next(request)

    return response


# Global rate limit
# Enhanced rate limit middleware
@app.middleware("http")
@limiter.limit("40/minute")
async def rate_limit_middleware(request: Request, call_next):
    start_time = time.time()
    client_ip = request.client.host if request.client else "unknown"
    path = request.url.path
    method = request.method

    try:
        response = await call_next(request)
        process_time = time.time() - start_time

        # Log successful rate-limited requests
        logger.debug(
            f"RATE LIMIT OK - {method} {path} | IP: {client_ip} | "
            f"Time: {process_time:.3f}s"
        )

        return response

    except RateLimitExceeded as e:
        # Log rate limit violations
        logger.warning(
            f"RATE LIMIT EXCEEDED - {method} {path} | IP: {client_ip} | "
            f"User-Agent: {request.headers.get('user-agent', 'unknown')[:100]} | "
            f"Limit: 40/minute"
        )
        raise e


app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://www.happy-schedule.fun", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/auth", tags=["authentication"])
app.include_router(courses_info_router, prefix="/courses", tags=["courseInfo"])
app.include_router(student_schedule_router, prefix="/schedule", tags=["StudentSchedule"])