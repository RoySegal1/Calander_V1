import os
import sys

# The scraper modules use flat imports (import scripts_consts) and are run from backend/scripts
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
