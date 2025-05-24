import { GraduationCap, Book, BookOpen, Award, Bookmark } from 'lucide-react';
import {SavedSchedule, User} from '../types'
interface ProgressTrackerProps {
  user: User;
  savedSchedules: SavedSchedule[];
  onSelectSchedule: (schedule: SavedSchedule) => void;
}

export default function ProgressTracker({ user,savedSchedules,onSelectSchedule }: ProgressTrackerProps) {
  // Calculate total credits including enrolled courses
  const enrolledCredits = user.enrolledCourses ?
    user.enrolledCourses.reduce((sum, course) => sum + (Number(course.courseCredit) || 0), 0) : 0;

  const progressPercentage = (user.credits.completed / user.credits.required) * 100;
  const enrolledPercentage = (enrolledCredits / user.credits.required) * 100;
  //const totalProgress = Math.min(100, progressPercentage + enrolledPercentage);

  return (
<div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
  <div className="flex items-center gap-2 mb-4 justify-end">
    <h2 className="text-xl font-semibold text-gray-800"> הנה ההתקדמות האקדמית שלך במחלקת {user.department}  {user.name} שלום</h2>
    <GraduationCap size={24} className="text-indigo-600" />
  </div>

  {/* Credits Progress */}
  <div>
    <div className="flex justify-between mb-2">
      <span className="text-sm text-gray-500 order-2">
        {user.credits.completed} / {user.credits.required} נקודות זכות
        {enrolledCredits > 0 && ` (הסמסטר ${enrolledCredits}+)`}
      </span>
      <span className="text-sm font-medium text-gray-700 order-1">נקודות זכות שצברת</span>
    </div>
    <div className="w-full bg-gray-200 rounded-full h-2.5">
      {/* Completed credits */}
      <div className="flex h-2.5">
        <div
          className="bg-indigo-600 h-2.5 rounded-full"
          style={{ width: `${Math.min(100, progressPercentage)}%` }}
        />
        {/* Enrolled credits (shown in a different color) */}
        <div
          className="bg-indigo-300 h-2.5 rounded-r-full"
          style={{ width: `${Math.min(enrolledPercentage, 100 - progressPercentage)}%` }}
        />
      </div>
    </div>
  </div>

  {/* GPA */}
  <div className="flex items-center gap-4 p-4 bg-indigo-50 rounded-lg justify-end">
    <div className="text-right">
      <div className="text-sm font-medium text-gray-700">ממוצע ציונים נוכחי</div>
      <div className="text-2xl font-bold text-indigo-600">{user.gpa}</div>
    </div>
    <Award size={24} className="text-indigo-600" />
  </div>

  {/* Completed Requirements */}
  <div className="grid grid-cols-4 gap-4">
    <div className="p-4 bg-red-100 rounded-lg">
      <div className="flex items-center gap-2 mb-2 justify-end">
        <span className="text-sm font-medium text-gray-700">חובה</span>
        <Book size={16} className="text-red-600" />
      </div>
      <div className="text-xl font-bold text-red-600 text-right">
        {user.remainingRequirements?.mandatory}
      </div>
      <div className="text-xs text-gray-500 text-right">נקודות זכות שהושלמו</div>
    </div>

    <div className="p-4 bg-blue-100 rounded-lg">
      <div className="flex items-center gap-2 mb-2 justify-end">
        <span className="text-sm font-medium text-gray-700">בחירה</span>
        <BookOpen size={16} className="text-blue-600" />
      </div>
      <div className="text-xl font-bold text-blue-600 text-right">
        {user.remainingRequirements?.elective}
      </div>
      <div className="text-xs text-gray-500 text-right">נקודות זכות שהושלמו</div>
    </div>

    <div className="p-4 bg-green-100 rounded-lg">
      <div className="flex items-center gap-2 mb-2 justify-end">
        <span className="text-sm font-medium text-gray-700">כללי</span>
        <Book size={16} className="text-green-600" />
      </div>
      <div className="text-xl font-bold text-green-600 text-right">
        {user.remainingRequirements?.general}
      </div>
      <div className="text-xs text-gray-500 text-right">נקודות זכות שהושלמו</div>
    </div>
  </div>

       {/* Enrolled Courses + Saved Schedules Section */}
  {user.enrolledCourses && user.enrolledCourses.length > 0 && (
    <div className="mt-6">
      <div className="flex items-center gap-2 mb-4 justify-end">
        <Bookmark size={20} className="text-indigo-600" />
        <h3 className="text-lg font-semibold text-gray-800">קורסים רשומים כעת</h3>
      </div>

      <div className="flex gap-4">
        {/* Enrolled Courses */}
        <div className="w-1/2 bg-indigo-50 rounded-lg p-4">
          <ul className="space-y-2">
            {user.enrolledCourses.map((course, index) => (
              <li key={index} className="flex items-center gap-2 justify-end">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-600"></div>
                <span className="text-gray-700">{course.courseName} ({course.courseCredit} נק"ז)</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Saved Schedules */}
        <div className="w-1/2 bg-white rounded-lg shadow p-4">
          <h4 className="text-right font-semibold mb-2">מערכות שנשמרו</h4>
          {savedSchedules.length === 0 ? (
            <div className="text-sm text-gray-500 text-right">אין מערכות שמורות</div>
          ) : (
            <ul className="space-y-2">
              {savedSchedules.map((schedule) => (
                <li
                  key={schedule.id}
                  onClick={() => onSelectSchedule(schedule)}
                  className="cursor-pointer text-right text-sm bg-gray-100 hover:bg-indigo-100 p-2 rounded"
                >
                  מזהה: {schedule.share_code} <br />
                  נשמר בתאריך: {new Date(schedule.created_at).toLocaleDateString()}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )}
    </div>
  );
}



