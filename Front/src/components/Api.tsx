import axios from 'axios';
import { Course, SavedSchedule, User } from '../types';

const BASE_URL = 'https://calander-v1.onrender.com';


export class ApiService {
    static async login(username: string, password: string): Promise<{ status: string; user: User }> {
    const response = await axios.post(`${BASE_URL}/auth/login`, { username, password });
    return response.data;
  }

  static async signup(username: string, password: string, department: string): Promise<{ status: string; user: User }> {
    const response = await axios.post(`${BASE_URL}/auth/signup`, { username, password, department });
    return response.data;
  }

  static async signuplight(username: string, password: string, department: string): Promise<{ status: string; user: User }> {
    const response = await axios.post(`${BASE_URL}/auth/signuplight`, { username, password, department });
    return response.data;
  }

  static async guestLogin(): Promise<{ status: string; user: User }> {
    const response = await axios.get(`${BASE_URL}/auth/guest`);
    return response.data;
  }

  static logout() {
    // optionally notify backend or just clear frontend state
    return;
  }
  /**
   * Fetch all schedules for a specific student
   */
  static async fetchStudentSchedules(studentId: string): Promise<SavedSchedule[]> {
    try {
    const response = await axios.get<SavedSchedule[]>(`${BASE_URL}/schedule/student/${studentId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching student schedules:", error);
      throw error;
    }
  }

static async handleDeleteSchedule(scheduleId: string): Promise<void> {
  try {
    await axios.delete(`${BASE_URL}/schedule/${scheduleId}`);
    // Optionally: return a value or update state in the calling component
  } catch (error) {
    console.error('מחיקה נכשלה', error);
    throw error;
  }
}

  /**
   * Fetch courses based on department
   */
  static async fetchCourses(department: string): Promise<Course[]> {
    try {
      const frontendToBackendMap: Record<string, string> = {
        'מדעי המחשב': 'מדעי המחשב',
        'הנדסת חשמל': 'הנדסת חשמל',
        'הנדסה תעשייה וניהול': 'הנדסת תעשיה וניהול',
        'מדעי הנתונים': 'מדעי הנתונים',
        'הנדסת תוכנה': 'הנדסת תוכנה',
        'הנדסה מכנית': 'הנדסה מכנית',
        'הנדסה ביורפואית': 'הנדסה ביורפואית',
      };

      const backendDept = frontendToBackendMap[department];
      const response = await axios.get<Course[]>(
        `${BASE_URL}/courses?department=${backendDept}&generalcourses=true`
      );

      return response.data;
    } catch (error) {
      console.error('Error fetching courses:', error);
      throw error;
    }
  }

  /**
   * Save a schedule to the backend
   */
  static async saveSchedule(
    studentId: string,
    scheduleData: Array<{ courseCode: string; groups: string[] }>,
    scheduleName: string
  ): Promise<void> {
    try {
      await axios.post(`${BASE_URL}/schedule`, {
        student_id: studentId,
        schedule_data: scheduleData,
        schedule_name: scheduleName,
      });
    } catch (error) {
      console.error("Failed to save schedule:", error);
      throw error;
    }
  }

  /**
   * Import a schedule by ID
   */
  static async importScheduleById(scheduleId: string): Promise<{
    id: string;
    student_id: string;
    schedule_data: Array<{ courseCode: string; groups: string[] }>;
    created_at: string;
  }> {
    try {
      const response = await fetch(`${BASE_URL}/schedule/${scheduleId}`);
      if (!response.ok) throw new Error("Schedule not found");
      return await response.json();
    } catch (error) {
      console.error("Failed to load schedule by ID:", error);
      throw error;
    }
  }
}

// Alternative hook-based approach (optional)
export const useApiService = () => {
  const fetchStudentSchedules = async (studentId: string) => {
    return ApiService.fetchStudentSchedules(studentId);
  };

  const fetchCourses = async (department: string) => {
    return ApiService.fetchCourses(department);
  };

  const saveSchedule = async (
    studentId: string,
    scheduleData: Array<{ courseCode: string; groups: string[] }>,
    scheduleName: string
  ) => {
    return ApiService.saveSchedule(studentId, scheduleData,scheduleName);
  };

  const importScheduleById = async (scheduleId: string) => {
    return ApiService.importScheduleById(scheduleId);
  };

  return {
    fetchStudentSchedules,
    fetchCourses,
    saveSchedule,
    importScheduleById,
  };
};