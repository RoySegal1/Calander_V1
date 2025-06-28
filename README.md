# University Course Schedule Management System

A comprehensive full-stack web application for university students to manage their course schedules, track academic progress, and explore course offerings. Built with modern technologies including React/TypeScript frontend and FastAPI backend.

## 🌟 Overview

This system provides students with a powerful tool to:
- Browse and filter courses across multiple departments
- Create personalized weekly schedules with conflict detection
- Save and share schedules with unique IDs
- Track academic progress, GPA, and completed credits
- Access course information and requirements

## 🏗️ System Architecture

### Full Stack Structure
```
Calander_V1/
├── backend/                    # FastAPI backend service
│   ├── app/                   # Main application code
│   ├── data/                  # Course data and constants
│   ├── scripts/               # Web scraping and utilities
│   └── requirements.txt       # Python dependencies
├── Front/                     # React/TypeScript frontend
│   ├── src/                   # Source code
│   ├── package.json           # Node.js dependencies
│   └── vite.config.ts         # Build configuration
├── logs/                      # Application logs
└── requirements.txt           # Root dependencies
```

## 🚀 Key Features

### 🎓 Student Experience
- **Interactive Weekly Calendar**: Visual schedule builder with time slot management
- **Course Discovery**: Browse courses by department, semester, and type
- **Smart Conflict Detection**: Automatic detection and prevention of scheduling conflicts
- **Progress Tracking**: Monitor GPA, completed credits, and academic milestones
- **Multi-language Support**: Hebrew interface with RTL layout support

### 🔐 Authentication & Access
- **Student Registration**: Full access with web scraping integration
- **Guest Mode**: Limited exploration without registration
- **Secure Authentication**: BCrypt password hashing and JWT tokens

### 🏫 Multi-Department Support
- Computer Science (מדעי המחשב)
- Software Engineering (הנדסת תוכנה)
- Electrical Engineering (הנדסת חשמל)
- Industrial Engineering (הנדסת תעשיה וניהול)
- Biomedical Engineering (הנדסה ביורפואית)
- Mechanical Engineering (הנדסה מכנית)
- Data Science (מדעי הנתונים)
- English (אנגלית)
- General Studies (כללי)

## 🛠️ Technology Stack

### Backend
- **Framework**: FastAPI with Python 3.8+
- **Database**: PostgreSQL via Supabase
- **ORM**: SQLAlchemy
- **Web Scraping**: Selenium WebDriver
- **Authentication**: BCrypt password hashing
- **Validation**: Pydantic models

### Frontend
- **Framework**: React 18.3.1 with TypeScript
- **Build Tool**: Vite 5.4.16
- **Styling**: Tailwind CSS 3.4.1
- **HTTP Client**: Axios
- **Notifications**: React Hot Toast
- **Development**: ESLint, PostCSS

## 📋 Prerequisites

- **Python**: 3.8 or higher
- **Node.js**: 16 or higher
- **Database**: PostgreSQL (Supabase recommended)
- **Browser**: Chrome/Chromium (for web scraping)

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd Calander_V1
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
# Create backend/app/db/.env with:
# SUPABASE_URL=your_supabase_url
# SUPABASE_ANON_KEY=your_supabase_anon_key
# SUPABASE_DB_URL=postgresql://username:password@host:port/database

# Initialize database
python -m backend.app.db.init_db

# Start backend server
uvicorn backend.app.main:app --reload --host 0.0.0.0 --port 8000
```

### 3. Frontend Setup

```bash
cd Front

# Install dependencies
npm install

# Start development server
npm run dev
```

### 4. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## 📚 API Documentation

### Authentication Endpoints
- `POST /auth/login` - Student login
- `POST /auth/signup` - Student registration with web scraping
- `POST /auth/signuplight` - Light registration without scraping
- `GET /auth/guest` - Guest access

### Course Endpoints
- `GET /courses` - Retrieve course information by department

### Schedule Endpoints
- `POST /schedule` - Save a new schedule
- `GET /schedule/{schedule_id}` - Load specific schedule
- `DELETE /schedule/{schedule_id}` - Delete schedule
- `GET /schedule/student/{student_id}` - Get all student schedules

## 🗄️ Database Schema

### Core Tables
- **students**: User credentials and profile information
- **student_courses**: Course enrollments and grades
- **saved_schedules**: Saved schedule configurations

## 🔧 Configuration

### Backend Configuration
- Database connection via environment variables
- Logging configuration in `backend/app/core/logger.py`
- Course data caching for improved performance
- CORS middleware for frontend integration

### Frontend Configuration
- Tailwind CSS configuration in `tailwind.config.js`
- TypeScript configuration in `tsconfig.json`
- Vite build configuration in `vite.config.ts`

## 🎨 User Interface

### Design Features
- **Modern UI**: Clean, intuitive interface with smooth animations
- **Hebrew Support**: Native RTL layout and Hebrew text rendering
- **Responsive Design**: Works seamlessly across desktop and mobile devices
- **Visual Feedback**: Toast notifications and hover effects
- **Accessibility**: Keyboard navigation and screen reader support

### Interactive Components
- **Weekly Calendar**: Drag-and-drop schedule building
- **Course Browser**: Advanced filtering and search capabilities
- **Progress Dashboard**: Visual academic progress tracking
- **Schedule Sharing**: Import/export functionality

## 🔒 Security Features

- **Password Security**: BCrypt hashing with salt
- **SQL Injection Protection**: SQLAlchemy ORM parameterized queries
- **Input Validation**: Pydantic models and frontend validation
- **Environment Protection**: Secure environment variable handling

## 📊 Web Scraping

The system includes automated web scraping capabilities for:
- Student academic records extraction
- Course schedule information gathering
- Grade and credit tracking

Scripts located in `backend/scripts/` using Selenium WebDriver.

## 🚀 Deployment

### Production Deployment Steps

1. **Backend Deployment**
   ```bash
   # Set production environment variables
   # Configure database for production
   # Install dependencies
   pip install -r requirements.txt
   # Run with production ASGI server
   uvicorn backend.app.main:app --host 0.0.0.0 --port 8000
   ```

2. **Frontend Deployment**
   ```bash
   # Build for production
   npm run build
   # Serve static files
   npm run start  # Serves on port 5642
   ```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -m 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices for frontend
- Use FastAPI conventions for backend APIs
- Write comprehensive tests for new features
- Update documentation for significant changes

## 📝 Available Scripts

### Backend Scripts
```bash
# Start development server
uvicorn backend.app.main:app --reload

# Run web scraper
python backend/scripts/WebScraperStudent.py

# Initialize database
python -m backend.app.db.init_db
```

### Frontend Scripts
```bash
# Development server
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Linting
npm run lint
```

## 🐛 Troubleshooting

### Common Issues
- **Database Connection**: Verify Supabase credentials in `.env`
- **CORS Issues**: Ensure backend CORS settings allow frontend origin
- **Web Scraping**: Check Chrome/Chromium installation and permissions
- **Port Conflicts**: Verify ports 8000 (backend) and 5173 (frontend) are available

## 📄 License

This project is for educational/internal use. Please check with the repository owner for licensing details.

## 📧 Support

For issues and questions:
- Create an issue in the repository
- Contact the development team
- Check the API documentation at `/docs` endpoint

---

**Built with ❤️ for seamless university schedule management** 📅✨
