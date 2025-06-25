import { GraduationCap, Book, BookOpen, Award, Bookmark, CheckCircle, Calendar } from 'lucide-react';
import {SavedSchedule, User} from '../types'
import { X } from 'lucide-react';
import { ApiService } from './Api';
import toast from 'react-hot-toast';

interface ProgressTrackerProps {
  user: User;
  savedSchedules: SavedSchedule[];
  onSelectSchedule: (schedule: SavedSchedule) => void;
  setSchedule: (schedules: SavedSchedule[]) => void;
}


export default function ProgressTracker({ user,savedSchedules,onSelectSchedule,setSchedule }: ProgressTrackerProps) {
  // Calculate total credits including enrolled courses
  const handleDeleteSchedule = async (scheduleId: string) => {
    try {
      await ApiService.handleDeleteSchedule(scheduleId);
      const updatedSchedules = savedSchedules.filter(s => s.share_code !== scheduleId);
      setSchedule(updatedSchedules);
       toast.success('המערכת נמחקה בהצלחה');
    } catch (error) {
       toast.error('מחיקה נכשלה');
    }
  };
  const enrolledCredits = user.enrolledCourses ?
    user.enrolledCourses.reduce((sum, course) => sum + (Number(course.courseCredit) || 0), 0) : 0;
 
  const progressPercentage = (user.credits.completed / user.credits.required) * 100;
  const enrolledPercentage = (enrolledCredits / user.credits.required) * 100;
 
  return (
    <div className="bg-white rounded-lg shadow-lg p-1 space-y-1">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4 justify-end">
        <h2 className="text-xl font-semibold text-gray-800">
          הנה ההתקדמות האקדמית שלך במחלקת {user.department}  {user.name} שלום
        </h2>
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
          <div className="flex h-2.5">
            <div
              className="bg-indigo-600 h-2.5 rounded-full"
              style={{ width: `${Math.min(100, progressPercentage)}%` }}
            />
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

      {/* Main Content Grid */}
      <div className="grid grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="flex flex-col gap-4">
          {/* Completed Requirements */}
          <div className="bg-emerald-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2 justify-end">
              <h3 className="text-base font-semibold text-emerald-800">דרישות שהושלמו</h3>
              <CheckCircle size={18} className="text-emerald-600" />
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-red-100 rounded p-2">
                <Book size={14} className="mx-auto text-red-600 mb-1" />
                <div className="text-xs text-gray-700">חובה</div>
                <div className="text-base font-bold text-red-600">{user.remainingRequirements?.mandatory}</div>
              </div>
              <div className="bg-blue-100 rounded p-2">
                <BookOpen size={14} className="mx-auto text-blue-600 mb-1" />
                <div className="text-xs text-gray-700">בחירה</div>
                <div className="text-base font-bold text-blue-600">{user.remainingRequirements?.elective}</div>
              </div>
              <div className="bg-yellow-100 rounded p-2">
                <Book size={14} className="mx-auto text-yellow-500 mb-1" />
                <div className="text-xs text-gray-700">כללי</div>
                <div className="text-base font-bold text-yellow-600">{user.remainingRequirements?.general}</div>
              </div>
            </div>
          </div>

          {/* Enrolled Courses */}
          <div className="bg-indigo-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2 justify-end">
              <h3 className="text-base font-semibold text-indigo-800">קורסים רשומים</h3>
              <Bookmark size={18} className="text-indigo-600" />
            </div>
            {user.enrolledCourses && user.enrolledCourses.length > 0 ? (
              <ul className="space-y-6">
                {user.enrolledCourses.map((course, idx) => (
                  <li key={idx} className="flex items-center gap-2 justify-end text-sm text-right">
                    <span>{course.courseName}</span>
                    <span className="text-indigo-600">({course.courseCredit} נק"ז)</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center text-gray-400 py-4 text-xs">
                <Bookmark size={18} className="mx-auto mb-1" />
                אין קורסים רשומים
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="bg-gradient-to-br from-white via-cream-100 to-white rounded-lg p-4 h-fit flex flex-col">
          <div className="flex items-center gap-2 mb-4 justify-end">
            <h3 className="text-lg font-semibold text-purple-800">מערכות שמורות</h3>
            <Calendar size={20} className="text-purple-600" />
          </div>
          {savedSchedules.length === 0 ? (
            <div className="text-center text-gray-500 py-12">
              <Calendar size={32} className="mx-auto mb-3 text-gray-400" />
              <p>אין מערכות שמורות</p>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-purple-100 to-indigo-50 rounded-xl p-4 shadow-md">
              <ul className="space-y-2">
              {savedSchedules.map((schedule) => (
            <li
              key={schedule.id}
              onClick={() => onSelectSchedule(schedule)}
              className="relative cursor-pointer text-right p-4 bg-white/70 hover:bg-indigo-100 rounded-lg transition-colors border border-transparent hover:border-indigo-300 shadow-sm"
            >
              <button
                className="absolute left-2 top-2 text-gray-400 hover:text-red-500 transition-colors"
                title="מחק מערכת"
                onClick={e => {
                  e.stopPropagation();
                  handleDeleteSchedule(schedule.share_code);
                }}
              >
                <X size={18} />
              </button>
              <div className="font-semibold text-indigo-800">{schedule.schedule_name || 'ללא שם'}</div>
              <div
                className="text-xs text-indigo-500 mt-1 cursor-pointer hover:underline"
                title="העתק מזהה"
                onClick={(e) => {
                  e.stopPropagation();
                  navigator.clipboard.writeText(schedule.share_code);
                }}
              >
                {schedule.share_code} :מזהה
              </div>
              <div className="text-xs text-gray-500 mt-1">
                נשמר: {new Date(schedule.created_at).toLocaleDateString()}
              </div>
            </li>
              ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}