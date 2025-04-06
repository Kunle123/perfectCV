import logging
import sys
from typing import Any

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)

# Create logger instance
logger = logging.getLogger("app")

def get_logger(name: str) -> Any:
    """Get a logger instance with the specified name."""
    return logging.getLogger(name) 