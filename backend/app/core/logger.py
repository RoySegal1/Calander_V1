import logging
from logging.handlers import RotatingFileHandler
from colorlog import ColoredFormatter
import os
import sys

# Create logs directory if it doesn't exist
LOG_DIR = "logs"
os.makedirs(LOG_DIR, exist_ok=True)

LOG_FILE = os.path.join(LOG_DIR, "app.log")

# Colored formatter for console output
color_formatter = ColoredFormatter(
    "%(log_color)s%(asctime)s - %(levelname)s - %(name)s - %(message)s",
    datefmt=None,
    log_colors={
        "DEBUG":    "cyan",
        "INFO":     "white",
        "WARNING":  "yellow",
        "ERROR":    "red",
        "CRITICAL": "bold_red",
    }
)

# Plain formatter for file output
file_formatter = logging.Formatter(
    "%(asctime)s - %(levelname)s - %(name)s - %(message)s"
)

# Console handler with color
console_handler = logging.StreamHandler(sys.stdout)
console_handler.setLevel(logging.INFO)
console_handler.setFormatter(color_formatter)

# File handler with rotation
file_handler = RotatingFileHandler(LOG_FILE, maxBytes=10_000_000, backupCount=3)
file_handler.setLevel(logging.INFO)
file_handler.setFormatter(file_formatter)

# Root logger configuration
logger = logging.getLogger("app_logger")
logger.setLevel(logging.INFO)
logger.addHandler(console_handler)
logger.addHandler(file_handler)
logger.propagate = False  # Prevent double logging if root logger is used elsewhere
