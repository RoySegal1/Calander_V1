export type CourseType = 'Mandatory' | 'Selection' | 'English' | 'General' | 'Seminar' | 'Final Projects';
export type LectureType = 'Lecture' | 'Practice' | 'Lecture+Practice';

export interface CourseGroup {
  GroupsCode: string;
  lectureType: LectureType;
  startTime: string;
  endTime: string;
  building: string;
  classNumber: string;
  lecturer: string;
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5; // 0 = Sunday, 5 = Friday
}

export interface Course {
  id: string;
  name: string;
  type: CourseType;
  department: string;
  prerequisites: string[];
  Groups: CourseGroup[];
}

export interface User {
  id: string;
  username: string;
  department: string;
  completedCourses: {
    courseId: string;
    grade: number;
  }[];
  enrolledCourses: string[];
  credits: {
    completed: number;
    required: number;
  };
  gpa: number;
  remainingRequirements: {
    english: number;
    general: number;
    mandatory: number;
  };
}

export interface AuthState {
  user: User | null;
  isGuest: boolean;
  isAuthenticated: boolean;
}