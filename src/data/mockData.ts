import { Course, User } from '../types';

export const mockCourses: Course[] = [
  {
    Course_Type: "קורסי חובה שנה א",
    Course_Name: "מבוא למדעי המחשב",
    Course_Code: "10016",
    semester: "א",
    department: "cs",
    prerequisites: [],
    Groups: [
        {
            GroupsCode: "251001603",
            lectureType: 0,
            startTime: "12:00",
            endTime: "14:50",
            room: "מפ\"ט תמר",
            lecturer: "מר שלומי פיני",
            dayOfWeek: 1
        },
        {
            GroupsCode: "251001604",
            lectureType: 0,
            startTime: "08:00",
            endTime: "10:50",
            room: "208 פיקוס",
            lecturer: "מר שלומי פיני",
            dayOfWeek: 1
        },
        {
            GroupsCode: "251001605",
            lectureType: 0,
            startTime: "08:00",
            endTime: "10:50",
            room: "קריה ה'5",
            lecturer: "ד\"ר פרידין מאשה",
            dayOfWeek: 0
        },
        {
              GroupsCode: "251001606",
              lectureType: 0,
              startTime: "10:00",
              endTime: "12:50",
              room: "קריה ז'1",
              lecturer: "גב' כליף קרן",
              dayOfWeek: 1
          },
          {
              GroupsCode: "251001608",
              lectureType: 0,
              startTime: "14:00",
              endTime: "16:50",
              room: "מפ\"ט יעד",
              lecturer: "ד\"ר שטטר דוד",
              dayOfWeek: 3
          },
          {
              GroupsCode: "251001609",
              lectureType: 0,
              startTime: "13:00",
              endTime: "15:50",
              room: "קריה אודיטוריום",
              lecturer: "ד\"ר שטטר דוד",
              dayOfWeek: 1
          },
          {
              GroupsCode: "251001603",
              lectureType: 1,
              startTime: "16:00",
              endTime: "18:50",
              room: "ז'2 קריה - עגלת תחשבים",
              lecturer: "מר שלומי פיני",
              dayOfWeek: 0
          },
          {
              GroupsCode: "251001604",
              lectureType: 1,
              startTime: "08:00",
              endTime: "10:50",
              room: "קריה ה'7",
              lecturer: "מר שלומי פיני",
              dayOfWeek: 3
          },
          {
              GroupsCode: "251001604",
              lectureType: 1,
              startTime: "13:00",
              endTime: "15:50",
              room: "055 פרונטלי בניין מעבדות",
              lecturer: "מר שלומי פיני",
              dayOfWeek: 0
          },
          {
              GroupsCode: "251001605",
              lectureType: 1,
              startTime: "10:00",
              endTime: "12:50",
              room: "קריה ה'9",
              lecturer: "ד\"ר פרידין מאשה",
              dayOfWeek: 1
          },
          {
              GroupsCode: "251001605",
              lectureType: 1,
              startTime: "08:00",
              endTime: "10:50",
              room: "054 פרונטלי בנין מעבדות",
              lecturer: "ד\"ר פרידין מאשה",
              dayOfWeek: 2
          },
          {
              GroupsCode: "251001606",
              lectureType: 1,
              startTime: "09:00",
              endTime: "11:50",
              room: "054 פרונטלי בנין מעבדות",
              lecturer: "מר כהן תום",
              dayOfWeek: 4
          },
          {
              GroupsCode: "251001606",
              lectureType: 1,
              startTime: "10:00",
              endTime: "12:50",
              room: "054 פרונטלי בנין מעבדות",
              lecturer: "גב' כליף קרן",
              dayOfWeek: 3
          },
          {
              GroupsCode: "251001608",
              lectureType: 1,
              startTime: "17:00",
              endTime: "19:50",
              room: "קריה ה'5",
              lecturer: "ד\"ר שטטר דוד",
              dayOfWeek: 1
          },
          {
              GroupsCode: "251001608",
              lectureType: 1,
              startTime: "10:00",
              endTime: "12:50",
              room: "מפ\"ט גפן",
              lecturer: "ד\"ר שטטר דוד",
              dayOfWeek: 2
          },
          {
              GroupsCode: "251001609",
              lectureType: 1,
              startTime: "13:00",
              endTime: "15:50",
              room: "054 פרונטלי בנין מעבדות",
              lecturer: "ד\"ר שטטר דוד",
              dayOfWeek: 2
          },
          {
              GroupsCode: "251001609",
              lectureType: 1,
              startTime: "17:00",
              endTime: "19:50",
              room: "עתידים 2313",
              lecturer: "מר רוטברג ליאור",
              dayOfWeek: 0
          },
          {
              GroupsCode: "251001601",
              lectureType: 0,
              startTime: "19:00",
              endTime: "21:50",
              room: "קריה ג'6",
              lecturer: "מר שלומי פיני",
              dayOfWeek: 1
          },
          {
              GroupsCode: "251001602",
              lectureType: 0,
              startTime: "17:00",
              endTime: "19:50",
              room: "055 פרונטלי בניין מעבדות",
              lecturer: "מר שלומי פיני",
              dayOfWeek: 0
          },
          {
              GroupsCode: "251001601",
              lectureType: 1,
              startTime: "19:00",
              endTime: "21:50",
              room: "קריה ה'9",
              lecturer: "מר שלומי פיני",
              dayOfWeek: 3
          },
      
        {
            GroupsCode: "251001602",
            lectureType: 1,
            startTime: "17:00",
            endTime: "19:50",
            room: "קריה ה'4",
            lecturer: "מר שלומי פיני",
            dayOfWeek: 4
        }
    ]
  },
  {
    Course_Code: '2',
    Course_Name: 'Advanced Mathematics',
    Course_Type: "קורסי חובה שנה א",
    department: 'Mathematics',
    prerequisites: ['10016'],
    semester: "א",
    Groups: [
      {
        GroupsCode: 'A1',
        lectureType: 0,
        startTime: '10:00',
        endTime: '12:00',
        room: 'Science Building 205',
        lecturer: 'Prof. Johnson',
        dayOfWeek: 1,
      },
      {
        GroupsCode: 'A2',
        lectureType: 0,
        startTime: '14:00',
        endTime: '16:00',
        room: 'Science Building 206',
        lecturer: 'Prof. Johnson',
        dayOfWeek: 1,
      },
      {
        GroupsCode: 'B1',
        lectureType: 1,
        startTime: '14:00',
        endTime: '16:00',
        room: 'Science Building 205',
        lecturer: 'Dr. Williams',
        dayOfWeek: 3,
      },
      {
        GroupsCode: 'B2',
        lectureType: 1,
        startTime: '16:00',
        endTime: '18:00',
        room: 'Science Building 205',
        lecturer: 'Dr. Williams',
        dayOfWeek: 3,
      },
    ],
  },
  {
    Course_Type: "קורסי חובה שנה ב",
    Course_Name: "מבוא לתכנות מערכות",
    Course_Code: "10010",
    semester: "א",
    department: "cs",
    prerequisites: [],
    Groups: [
        {
            GroupsCode: "251001003",
            lectureType: 0,
            startTime: "11:00",
            endTime: "12:50",
            room: "קריה ז'3",
            lecturer: "גב' הרצברג מורג אפרת",
            dayOfWeek: 0
        },
        {
            GroupsCode: "251001004",
            lectureType: 0,
            startTime: "09:00",
            endTime: "10:50",
            room: "קריה ז'3",
            lecturer: "מר רוטברג ליאור",
            dayOfWeek: 0
        },
        {
            GroupsCode: "251001005",
            lectureType: 0,
            startTime: "11:00",
            endTime: "12:50",
            room: "קריה ה'9",
            lecturer: "מר רוטברג ליאור",
            dayOfWeek: 0
        },
        {
            GroupsCode: "251001006",
            lectureType: 0,
            startTime: "16:00",
            endTime: "17:50",
            room: "קריה ז'3",
            lecturer: "גב' הרצברג מורג אפרת",
            dayOfWeek: 0
        },
        {
            GroupsCode: "251001007",
            lectureType: 0,
            startTime: "13:00",
            endTime: "14:50",
            room: "קריה ז'3",
            lecturer: "גב' הרצברג מורג אפרת",
            dayOfWeek: 0
        },
        {
            GroupsCode: "251001008",
            lectureType: 0,
            startTime: "15:00",
            endTime: "16:50",
            room: "קריה ה'4",
            lecturer: "גב' הרצברג מורג אפרת",
            dayOfWeek: 1
        },
        {
            GroupsCode: "251001003",
            lectureType: 1,
            startTime: "14:00",
            endTime: "15:50",
            room: "קריה ז'4",
            lecturer: "גב' הרצברג מורג אפרת",
            dayOfWeek: 3
        },
        {
            GroupsCode: "251001004",
            lectureType: 1,
            startTime: "12:00",
            endTime: "13:50",
            room: "054 פרונטלי בנין מעבדות",
            lecturer: "מר רוטברג ליאור",
            dayOfWeek: 4
        },
        {
            GroupsCode: "251001005",
            lectureType: 1,
            startTime: "09:00",
            endTime: "10:50",
            room: "קריה ה'4",
            lecturer: "מר רוטברג ליאור",
            dayOfWeek: 3
        },
        {
            GroupsCode: "251001006",
            lectureType: 1,
            startTime: "09:00",
            endTime: "10:50",
            room: "קריה ה'11 מעב דואלי",
            lecturer: "גב' הרצברג מורג אפרת",
            dayOfWeek: 3
        },
        {
            GroupsCode: "251001007",
            lectureType: 1,
            startTime: "11:00",
            endTime: "12:50",
            room: "קריה ז'3",
            lecturer: "גב' הרצברג מורג אפרת",
            dayOfWeek: 1
        },
        {
            GroupsCode: "251001008",
            lectureType: 1,
            startTime: "16:00",
            endTime: "17:50",
            room: "קריה ה'4",
            lecturer: "גב' הרצברג מורג אפרת",
            dayOfWeek: 3
        },
        {
            GroupsCode: "251001002",
            lectureType: 0,
            startTime: "18:00",
            endTime: "19:50",
            room: "ז'2 קריה - עגלת תחשבים",
            lecturer: "מר ברקת ארנון",
            dayOfWeek: 4
        },
        {
            GroupsCode: "251001002",
            lectureType: 1,
            startTime: "20:00",
            endTime: "21:50",
            room: "ז'2 קריה - עגלת תחשבים",
            lecturer: "מר ברקת ארנון",
            dayOfWeek: 4
        }
    ]
}

];

export const mockUser: User = {
  id: '1',
  username: 'student1',
  department: 'Computer Science',
  completedCourses: [
    { courseId: '1', grade: 85 },
  ],
  enrolledCourses: ['2'],
  credits: {
    completed: 30,
    required: 120,
  },
  gpa: 85,
  remainingRequirements: {
    english: 2,
    general: 4,
    mandatory: 8,
  },
};