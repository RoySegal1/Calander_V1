export type CourseType = "'קורסי חובה שנה א" | 'Selection' | 'English' | 'General' | 'Seminar' | 'Final Projects';
export type LectureType =  1 | 0; // 1 for practice 0 for lecture

export interface CourseGroup {
  GroupsCode: string;
  lectureType: LectureType;
  startTime: string;
  endTime: string;
  room: string;
  lecturer: string;
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5; // 0 = Sunday, 5 = Friday
}

export interface Course {
  Course_Code: string;
  Course_Name: string;
  semester: string;
  Course_Type : CourseType;
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