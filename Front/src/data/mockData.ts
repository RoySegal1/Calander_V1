import { User } from '../types';


export const mockUser: User = {
  id: '1',
  username: 'student1',
  department: 'Computer Science',
  completedCourses: [
    { courseId: '1', grade: 85 },
  ],
  enrolledCourses: ['2'], // maybe we add to scraping the current courses
  credits: {
    completed: 30,
    required: 120,
  },
  gpa: 85,
  completedRequirements: { // change to completed credits
    english: 2,
    general: 4,
    elective: 6,
    mandatory: 8,
  },
};