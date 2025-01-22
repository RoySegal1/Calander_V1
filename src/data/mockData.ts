import { Course, User } from '../types';

export const mockCourses: Course[] = [
  {
    courseType: "קורסי חובה שנה א",
    courseName: "מבוא למדעי המחשב",
    courseCode: "10016",
    semester: "א",
    department: "מדעי המחשב",
    prerequisites: [],
    groups: [
        {
            groupCode: "251001603",
            lectureType: 0,
            startTime: "12:00",
            endTime: "14:50",
            room: "מפ\"ט תמר",
            lecturer: "מר שלומי פיני",
            dayOfWeek: 1
        },
        {
            groupCode: "251001604",
            lectureType: 0,
            startTime: "08:00",
            endTime: "10:50",
            room: "208 פיקוס",
            lecturer: "מר שלומי פיני",
            dayOfWeek: 1
        },
        {
            groupCode: "251001605",
            lectureType: 0,
            startTime: "08:00",
            endTime: "10:50",
            room: "קריה ה'5",
            lecturer: "ד\"ר פרידין מאשה",
            dayOfWeek: 0
        },
        {
            groupCode: "251001606",
            lectureType: 0,
            startTime: "10:00",
            endTime: "12:50",
            room: "קריה ז'1",
            lecturer: "גב' כליף קרן",
            dayOfWeek: 1
        },
        {
            groupCode: "251001608",
            lectureType: 0,
            startTime: "14:00",
            endTime: "16:50",
            room: "מפ\"ט יעד",
            lecturer: "ד\"ר שטטר דוד",
            dayOfWeek: 3
        },
        {
            groupCode: "251001609",
            lectureType: 0,
            startTime: "13:00",
            endTime: "15:50",
            room: "קריה אודיטוריום",
            lecturer: "ד\"ר שטטר דוד",
            dayOfWeek: 1
        },
        {
            groupCode: "251001603/1",
            lectureType: 1,
            startTime: "16:00",
            endTime: "18:50",
            room: "ז'2 קריה - עגלת תחשבים",
            lecturer: "מר שלומי פיני",
            dayOfWeek: 0
        },
        {
            groupCode: "251001604/1",
            lectureType: 1,
            startTime: "08:00",
            endTime: "10:50",
            room: "קריה ה'7",
            lecturer: "מר שלומי פיני",
            dayOfWeek: 3
        },
        {
            groupCode: "251001604/2",
            lectureType: 1,
            startTime: "13:00",
            endTime: "15:50",
            room: "055 פרונטלי בניין מעבדות",
            lecturer: "מר שלומי פיני",
            dayOfWeek: 0
        },
        {
            groupCode: "251001605/1",
            lectureType: 1,
            startTime: "10:00",
            endTime: "12:50",
            room: "קריה ה'9",
            lecturer: "ד\"ר פרידין מאשה",
            dayOfWeek: 1
        },
        {
            groupCode: "251001605/2",
            lectureType: 1,
            startTime: "08:00",
            endTime: "10:50",
            room: "054 פרונטלי בנין מעבדות",
            lecturer: "ד\"ר פרידין מאשה",
            dayOfWeek: 2
        },
        {
            groupCode: "251001606/1",
            lectureType: 1,
            startTime: "09:00",
            endTime: "11:50",
            room: "054 פרונטלי בנין מעבדות",
            lecturer: "מר כהן תום",
            dayOfWeek: 4
        },
        {
            groupCode: "251001606/2",
            lectureType: 1,
            startTime: "10:00",
            endTime: "12:50",
            room: "054 פרונטלי בנין מעבדות",
            lecturer: "גב' כליף קרן",
            dayOfWeek: 3
        },
        {
            groupCode: "251001608/1",
            lectureType: 1,
            startTime: "17:00",
            endTime: "19:50",
            room: "קריה ה'5",
            lecturer: "ד\"ר שטטר דוד",
            dayOfWeek: 1
        },
        {
            groupCode: "251001608/2",
            lectureType: 1,
            startTime: "10:00",
            endTime: "12:50",
            room: "מפ\"ט גפן",
            lecturer: "ד\"ר שטטר דוד",
            dayOfWeek: 2
        },
        {
            groupCode: "251001609/1",
            lectureType: 1,
            startTime: "13:00",
            endTime: "15:50",
            room: "054 פרונטלי בנין מעבדות",
            lecturer: "ד\"ר שטטר דוד",
            dayOfWeek: 2
        },
        {
            groupCode: "251001609/2",
            lectureType: 1,
            startTime: "17:00",
            endTime: "19:50",
            room: "עתידים 2313",
            lecturer: "מר רוטברג ליאור",
            dayOfWeek: 0
        }
    ]
    },
    {
      courseType: "קורסי חובה שנה א",
      courseName: "תכנות מונחה עצמים",
      courseCode: "10128",
      semester: "ב",
      department: "מדעי המחשב",
      prerequisites: [],
      groups: [
          {
              groupCode: "251012801",
              lectureType: 0,
              startTime: "17:00",
              endTime: "19:50",
              room: "קריה ה'7",
              lecturer: "מר איזנשטיין איל",
              dayOfWeek: 3
          },
          {
              groupCode: "251012801/1",
              lectureType: 1,
              startTime: "17:00",
              endTime: "19:50",
              room: "054 פרונטלי בנין מעבדות",
              lecturer: "מר איזנשטיין איל",
              dayOfWeek: 4
          }
      ]
  },
  {
    courseType: "קורסי חובה שנה א",
    courseName: "ארגון המחשב ושפת סף",
    courseCode: "10145",
    semester: "א",
    department: "מדעי המחשב",
    prerequisites: [],
    groups: [
        {
            groupCode: "251014502",
            lectureType: 0,
            startTime: "19:00",
            endTime: "20:50",
            room: "קריה ז'3",
            lecturer: "מר אש רועי",
            dayOfWeek: 1
        },
        {
            groupCode: "251014502/1",
            lectureType: 1,
            startTime: "17:00",
            endTime: "18:50",
            room: "קריה ה'11 מעב דואלי",
            lecturer: "מר אש רועי",
            dayOfWeek: 2
        },
        {
            groupCode: "251014503",
            lectureType: 0,
            startTime: "19:00",
            endTime: "20:50",
            room: "קריה ה'11 מעב דואלי",
            lecturer: "מר אש רועי",
            dayOfWeek: 2
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