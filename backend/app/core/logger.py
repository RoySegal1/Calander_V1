import logging
from logging.handlers import RotatingFileHandler
import os

# Create logs directory if it doesn't exist
LOG_DIR = "logs"
os.makedirs(LOG_DIR, exist_ok=True)

LOG_FILE = os.path.join(LOG_DIR, "app.log")

# Configure the root logger
logging.basicConfig(
    level=logging.INFO,  # Change to DEBUG to see more
    format="%(asctime)s - %(levelname)s - %(name)s - %(message)s",
    handlers=[
        logging.StreamHandler(),  # Console
        RotatingFileHandler(LOG_FILE, maxBytes=10_000_000, backupCount=3),  # File with rotation
    ]
)

# Exportable logger
logger = logging.getLogger("app_logger")
