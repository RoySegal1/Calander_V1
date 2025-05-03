export type CourseType = string;
export type LectureType =  1 | 0; // 1 for practice 0 for lecture

export interface CourseGroup {
  groupCode: string;
  lectureType: LectureType;
  startTime: string;
  endTime: string;
  room: string;
  lecturer: string;
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5; // 0 = Sunday, 5 = Friday
}

export interface Course {
  courseCode: string;
  realCourseCode: string;
  courseName: string;
  semester: string;
  courseType : CourseType;
  department: string;
  prerequisites: string[];
  prerequisitesAlt: string[];
  groups: CourseGroup[];
}

export interface User {
  id: string;
  username: string;
  name: string;
  department: string;
  saved_courses?: string[];
  completedCourses: {
    courseId: string;
    grade: number;
  }[];
  credits: {
    completed: number;
    required: number;
    enrolled: number;
  };
  gpa: number;
  remainingRequirements: {
    general: number;
    elective: number;
    mandatory: number;
  };
  enrolledCourses: {
    courseName: string;
    courseCredit: string;
    courseType: string;
    courseCode: string;
    semester: string;
  }[];
}

// API response type that matches the updated login function
export interface ApiResponse {
  status: string;
  user: User;
  message: string;
}


export interface AuthState {
  user: User | null;
  isGuest: boolean;
  isAuthenticated: boolean;
}



// export interface User {
//   id: string;
//   username: string;
//   name: string;
//   department: string;
//   saved_courses?: string[];
//   completedCourses: {
//     courseId: string;
//     grade: number;
//   }[];
//   enrolledCourses: string[];
//   credits: {
//     completed: number;
//     required: number;
//   };
//   gpa: number;
//   remainingRequirements: {
//     general: number;
//     elective: number;
//     mandatory: number;
//   };
// }
