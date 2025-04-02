# Calendar V1

## Overview

Calendar V1 is a web application designed to help users manage their weekly schedules by displaying courses and their respective groups. Users can select courses to view their details and groups in a calendar format.

## Components

### 1. `WeeklySchedule`

**File:** `src/components/WeeklySchedule.tsx`

This component is responsible for displaying the weekly schedule in a calendar format. It shows the days of the week and the hours of the day, and it renders the groups of the selected courses.

**Props:**
- `selectedCourses`: An array of selected course IDs.
- `selectedGroups`: An array of objects containing course IDs and their respective groups.
- `onGroupSelect`: A function to handle the selection of a group.

**Functions:**
- `getTimeString(hour: number)`: Converts an hour to a string format (e.g., "08:00").
- `getGroupStyle(group: CourseGroup, courseId: string, isSelected: boolean, conflictCount: number, conflictIndex: number)`: Calculates the style for a group based on its start and end times, and any conflicts.

### 2. `CourseList`

**File:** `src/components/CourseList.tsx`

This component displays a list of available courses. Users can hover over a course to view its groups.

**Props:**
- `courses`: An array of course objects.
- `selectedCourses`: An array of selected course IDs.
- `onGroupSelect`: A function to handle the selection of a group.
- `onCourseToggle`: A function to handle the toggling of a course.

**Functions:**
- `handleMouseEnter(courseId: string)`: Handles the mouse enter event to show the groups of a course.
- `handleMouseLeave(courseId: string)`: Handles the mouse leave event to hide the groups of a course.

### 3. `SideBar`

**File:** `src/components/SideBar.tsx`

This component displays a sidebar with a list of available courses. Users can click on a course to select or deselect it.

**Props:**
- `courses`: An array of course objects.
- `selectedCourses`: An array of selected course IDs.
- `onCourseSelect`: A function to handle the selection of a course.

**Functions:**
- `onClick(course)`: Handles the click event to select or deselect a course.

### 4. `LoginPage`

**File:** `src/components/LoginPage.tsx`

This component handles user authentication. It provides a form for users to log in to the application.

### 5. `MainLayout`

**File:** `src/components/MainLayout.tsx`

This component serves as the main layout for the application. It includes the `SideBar`, `WeeklySchedule`, and other components to provide a cohesive user interface.

### 6. `ProgressTracker`

**File:** `src/components/ProgressTracker.tsx`

This component tracks the user's progress in their courses. It displays information about completed and pending tasks.

## Types

### `Course`

Represents a course with the following properties:
- `id`: The unique identifier of the course.
- `name`: The name of the course.
- `type`: The type of the course (e.g., "Mandatory", "English").
- `groups`: An array of `CourseGroup` objects.

### `CourseGroup`

Represents a group within a course with the following properties:
- `GroupsCode`: The unique code of the group.
- `lectureType`: The type of lecture (e.g., "Lecture", "Practice").
- `lecturer`: The name of the lecturer.
- `building`: The building where the group meets.
- `classNumber`: The room number where the group meets.
- `startTime`: The start time of the group.
- `endTime`: The end time of the group.

## Getting Started

To run the project locally, follow these steps:

1. Clone the repository:
   ```sh
   git clone https://github.com/your-username/Calander_V1.git
   cd Calander_V1