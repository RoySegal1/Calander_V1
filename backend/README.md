# Calendar Backend V1

A FastAPI-based backend service for a university course scheduling and management system. This backend provides APIs for student authentication, course information retrieval, and schedule management.

## 🚀 Features

- **Student Authentication**: Secure login/signup with BCrypt password hashing
- **Guest Access**: Limited functionality for non-registered users
- **Course Information**: Comprehensive course data across multiple departments
- **Schedule Management**: Save, load, and delete student schedules
- **Web Scraping**: Automated student data extraction from university systems
- **Multi-Department Support**: Support for various engineering and computer science departments
- **Database Integration**: PostgreSQL integration via Supabase
- **Caching**: In-memory course data caching for improved performance

## 🏗️ Architecture

### Project Structure

```
backend/
├── app/
│   ├── main.py                 # FastAPI application entry point
│   ├── api/                    # API endpoints
│   │   ├── auth.py            # Authentication endpoints
│   │   ├── coursesInfo.py     # Course information endpoints
│   │   └── schedule.py        # Schedule management endpoints
│   ├── core/                   # Core utilities
│   │   ├── cache.py           # In-memory caching
│   │   ├── helper.py          # Helper functions
│   │   ├── logger.py          # Logging configuration
│   │   ├── schemas.py         # Pydantic models
│   │   └── validation.py      # Data validation
│   ├── db/                     # Database layer
│   │    ├── models.py          # SQLAlchemy models
│   │    ├── crud.py            # Database operations
│   │    ├── db.py              # Database configuration
│   │    └── init_db.py          # Database initialization
│   └── tests/                  # Security utilities
│       ├── conftest.py          # Pytest configuration and shared fixtures
│       ├── test_auth.py         # Unit tests for authentication endpoints
├── data/                       # Course data and constants
│   ├── consts.py              # Department constants
│   ├── departmentCourseInfo/  # Temporary Course JSON files
├── scripts/                    # Utility scripts
│   ├── WebScraperStudent.py   # Student data scraper
│   └── WebScarper.py          # Course data scraper
└── requirements.txt           # Python dependencies
```

### Technology Stack

- **Framework**: FastAPI
- **Database**: PostgreSQL (via Supabase)
- **ORM**: SQLAlchemy
- **Authentication**: BCrypt password hashing
- **Web Scraping**: Selenium WebDriver
- **Validation**: Pydantic
- **Logging**: Python logging with colorlog
- **Environment**: python-dotenv

## 📋 Prerequisites

- Python 3.8+
- PostgreSQL database (Supabase recommended)
- Chrome/Chromium browser (for web scraping)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Create a virtual environment**
   ```bash
   python -m venv venv
   venv\Scripts\activate  # On Windows
   # or
   source venv/bin/activate  # On Linux/Mac
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   
   Create a `.env` file in `app/db/` directory:
   ```env
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_DB_URL=postgresql://username:password@host:port/database
   ```

5. **Initialize the database**
   ```bash
   python -m backend.app.db.init_db
   ```

## 🚀 Running the Application

### Development Server

```bash
uvicorn backend.app.main:app --reload --host 0.0.0.0 --port 8000
```

### Production Server

```bash
uvicorn backend.app.main:app --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`

## 📚 API Documentation

Once the server is running, you can access:

- **Interactive API Documentation**: `http://localhost:8000/docs`
- **Alternative API Documentation**: `http://localhost:8000/redoc`

### Main Endpoints

#### Authentication (`/auth`)
- `POST /auth/login` - Student login
- `POST /auth/signup` - Student registration
- `POST /auth/signuplight` - Non Student registration (no scraping)
- `GET /auth/guest` - Guest access

#### Courses (`/courses`)
- `GET /courses` - Get course information by department
  - Query params: `department`, `generalcourses` (optional)

#### Schedule (`/schedule`)
- `POST /schedule` - Save a new schedule
- `GET /schedule/{schedule_id}` - Load a specific schedule
- `DELETE /schedule/{schedule_id}` - Delete a schedule
- `GET /schedule/student/{student_id}` - Get all schedules for a student

## 🗄️ Database Schema

### Main Tables

- **students**: Student information and credentials
- **student_courses**: Student-course relationships with grades
- **saved_schedules**: Saved schedule configurations

## 🏫 Supported Departments

- מדעי המחשב (Computer Science)
- הנדסת תוכנה (Software Engineering)
- הנדסת חשמל (Electrical Engineering)
- הנדסת תעשיה וניהול (Industrial Engineering)
- הנדסה ביורפואית (Biomedical Engineering)
- הנדסה מכנית (Mechanical Engineering)
- מדעי הנתונים (Data Science)
- אנגלית (English)
- כללי (General)

## 🔧 Configuration

### Logging

Logs are written to `scripts/logs/app.log` and also displayed in the console with colored output.

### Caching

Course data is cached in memory during application startup for improved performance. The cache is automatically populated from the course JSON files from DB.

## 🧪 Testing

The `tests/` directory contains automated tests for the backend API and functionality:

### Test Structure

- **conftest.py**: Contains pytest configuration, shared fixtures, and test setup utilities
- **test_auth.py**: Tests for authentication functionality including login, signup, and validation
- **Fixtures**: Reusable test components for database connections, mock data, and API clients

### Running Tests

To run the test suite:

```bash
# Run all tests
pytest

# Run with verbose output
pytest -v

# Run specific test file
pytest tests/test_auth.py

# Run with coverage report
pytest --cov=backend
```
## 📝 Web Scraping

The system includes web scraping capabilities for:

- Student grade and course data extraction
- Course schedule information gathering

Scripts are located in the `scripts/` directory and use Selenium WebDriver.

## 🛡️ Security Features

- Password hashing with BCrypt
- SQL injection protection via SQLAlchemy ORM
- Input validation with Pydantic
- CORS middleware configuration
- Environment variable protection

## 🚀 Deployment

For production deployment:

1. Set up environment variables on your hosting platform
2. Configure the database connection
3. Install dependencies
4. Run database migrations
5. Start the application with a production ASGI server

## 📄 License

This project is for educational/internal use. Please check with the repository owner for licensing details.

## 📧 Support

For issues and questions, please create an issue in the repository or contact the development team.
