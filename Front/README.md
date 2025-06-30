# Course Schedule Management System - Frontend

A modern web application built with React and TypeScript for managing university course schedules. This system allows students to browse courses, create personalized schedules, and track their academic progress.

## 🚀 Features

### Core Functionality
- **Interactive Weekly Schedule**: Visual calendar interface displaying courses by days and time slots
- **Course Management**: Browse and filter courses by department, semester, and type
- **Schedule Creation**: Select course groups and automatically handle time conflicts
- **Schedule Persistence**: Save and share schedules with unique IDs
- **Progress Tracking**: Monitor academic progress, completed credits, and GPA

### User Experience
- **Multi-language Support**: Hebrew interface with RTL (Right-to-Left) layout
- **Authentication System**: Login, signup, and guest access options
- **Responsive Design**: Modern UI with smooth animations and hover effects
- **Real-time Validation**: Form validation with helpful error messages
- **Toast Notifications**: User-friendly feedback for actions

## 🛠️ Technology Stack

- **Framework**: React 18.3.1 with TypeScript
- **Build Tool**: Vite 5.4.16
- **Styling**: Tailwind CSS 3.4.1
- **Icons**: Lucide React 0.344.0
- **HTTP Client**: Axios 1.8.4
- **Notifications**: React Hot Toast 2.5.2
- **Development**: ESLint, PostCSS, Autoprefixer

## 📁 Project Structure

```
src/
├── components/
│   ├── Api.tsx                    # API service layer
│   ├── Auth.tsx                   # Authentication context and hooks
│   ├── CourseList.tsx             # Course listing component
│   ├── ImportScheduleModal.tsx    # Schedule import modal
│   ├── LoginPage.tsx              # Login and signup interface
│   ├── MainLayout.tsx             # Main application layout
│   ├── NameScheduleModal.tsx      # Schedule naming modal
│   ├── ProgressTracker.tsx        # Academic progress tracking
│   ├── Sidebar.tsx                # Course filtering sidebar
│   └── WeeklySchedule.tsx         # Interactive calendar component
├── types/
│   └── index.ts                   # TypeScript type definitions
├── utils/
│   └── Validation.tsx             # Form validation utilities
├── App.tsx                        # Root application component
├── main.tsx                       # Application entry point
└── index.css                      # Global styles
```

## 🚦 Getting Started

### Prerequisites
- Node.js (version 16 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5173`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run start` - Serve production build on port 5642

## 🏗️ Architecture

### Component Overview

#### Authentication (`Auth.tsx`)
- Context-based authentication management
- Supports login, signup, and guest access
- Manages user state throughout the application

#### Main Layout (`MainLayout.tsx`)
- Primary application container
- Handles course data fetching and state management
- Coordinates between sidebar and schedule components

#### Weekly Schedule (`WeeklySchedule.tsx`)
- Interactive calendar displaying course sessions
- Features:
  - Time slot visualization (8:00 - 22:00)
  - Course group selection with conflict detection
  - Hover information panels
  - Schedule visibility toggles
  - Import/export functionality

#### Sidebar (`Sidebar.tsx`)
- Course filtering and selection interface
- Filters: Department, Semester, Course Type
- Real-time course list updates

#### Progress Tracker (`ProgressTracker.tsx`)
- Academic progress visualization
- Displays: Completed credits, GPA, enrolled courses
- Saved schedules management

### API Integration

The application communicates with a backend API at `http://127.0.0.1:8000` for:
- User authentication
- Course data retrieval
- Schedule persistence
- Progress tracking

### State Management

- **Authentication**: Context-based with React hooks
- **Course Data**: Local state with API synchronization
- **Schedule State**: Local state with backend persistence
- **UI State**: Component-level state for modals and interactions

## 🎨 UI/UX Features

### Design Principles
- **Clean Interface**: Minimalist design focusing on functionality
- **Hebrew Support**: Native RTL layout and Hebrew text
- **Visual Hierarchy**: Clear information organization
- **Accessibility**: Keyboard navigation and screen reader support

### Interactive Elements
- **Hover Effects**: Course information on hover
- **Color Coding**: Unique colors for different courses
- **Drag-and-Drop**: Intuitive schedule manipulation
- **Modal Dialogs**: Non-disruptive user interactions

## 🔧 Configuration

### Environment Setup
The application expects a backend API running on `http://127.0.0.1:8000`. Ensure your backend service is running before starting the frontend.

### Styling Configuration
- **Tailwind CSS**: Configured in `tailwind.config.js`
- **PostCSS**: Setup in `postcss.config.js`
- **Custom Styles**: Additional styles in `src/index.css`

### TypeScript Configuration
- **App Config**: `tsconfig.app.json` for application code
- **Node Config**: `tsconfig.node.json` for build tools
- **Main Config**: `tsconfig.json` as project references

## 📱 Features in Detail

### Course Management
- Browse courses by department (Computer Science, Electrical Engineering, etc.)
- Filter by semester (A, B, Summer)
- Filter by course type (Mandatory, Elective, General)
- Real-time search and filtering

### Schedule Building
- Visual time slot selection
- Automatic conflict detection
- Multiple group types (Lectures, Tutorials)
- Schedule validation and optimization

### Data Persistence
- Save schedules with custom names
- Share schedules via unique IDs
- Import schedules from other users
- Automatic progress synchronization

### User Experience
- Guest mode for exploration
- Full authentication for data persistence
- Progress tracking for registered users

## 📄 License

This project is part of an academic course scheduling system. Please refer to the main repository for licensing information.

### Performance Optimization
- Use React.memo for expensive components
- Implement virtual scrolling for large course lists
- Optimize bundle size with code splitting

## 🚀 Deployment

For production deployment:

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Serve static files**
   ```bash
   npm run start
   ```

The built application will be available in the `dist` folder and served on port 5642.

---

**Happy Scheduling!** 📅✨bash
   git clone <repository-url>
   cd Front
