

import { GraduationCap, Book, BookOpen, Award, Bookmark } from 'lucide-react';
import { User } from '../types'
interface ProgressTrackerProps {
  user: User;
}

export default function ProgressTracker({ user }: ProgressTrackerProps) {
  // Calculate total credits including enrolled courses
  const enrolledCredits = user.enrolledCourses ?
    user.enrolledCourses.reduce((sum, course) => sum + (Number(course.courseCredit) || 0), 0) : 0;

  const progressPercentage = (user.credits.completed / user.credits.required) * 100;
  const enrolledPercentage = (enrolledCredits / user.credits.required) * 100;
  //const totalProgress = Math.min(100, progressPercentage + enrolledPercentage);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <GraduationCap size={24} className="text-indigo-600" />
        <h2 className="text-xl font-semibold text-gray-800">Hey {user.name}! Here Is Your Academic Progress </h2>
      </div>

      {/* Credits Progress */}
      <div>
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Credit Points Progress</span>
          <span className="text-sm text-gray-500">
            {user.credits.completed} / {user.credits.required} credits
            {enrolledCredits > 0 && ` (+ ${enrolledCredits} enrolled)`}
          </span>
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
      <div className="flex items-center gap-4 p-4 bg-indigo-50 rounded-lg">
        <Award size={24} className="text-indigo-600" />
        <div>
          <div className="text-sm font-medium text-gray-700">Current GPA</div>
          <div className="text-2xl font-bold text-indigo-600">{user.gpa}</div>
        </div>
      </div>

      {/* Completed Requirements */}
      <div className="grid grid-cols-4 gap-4">
        <div className="p-4 bg-red-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Book size={16} className="text-red-600" />
            <span className="text-sm font-medium text-gray-700">Mandatory</span>
          </div>
          <div className="text-xl font-bold text-red-600">
            {user.remainingRequirements?.mandatory}
          </div>
          <div className="text-xs text-gray-500">Completed Credits</div>
        </div>

        <div className="p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen size={16} className="text-blue-600" />
            <span className="text-sm font-medium text-gray-700">Elective</span>
          </div>
          <div className="text-xl font-bold text-blue-600">
            {user.remainingRequirements?.elective}
          </div>
          <div className="text-xs text-gray-500">Completed Credits</div>
        </div>

        <div className="p-4 bg-green-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Book size={16} className="text-green-600" />
            <span className="text-sm font-medium text-gray-700">General</span>
          </div>
          <div className="text-xl font-bold text-green-600">
            {user.remainingRequirements?.general}
          </div>
          <div className="text-xs text-gray-500">Completed Credits</div>
        </div>
      </div>

      {/* Enrolled Courses Section */}
      {user.enrolledCourses && user.enrolledCourses.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center gap-2 mb-4">
            <Bookmark size={20} className="text-indigo-600" />
            <h3 className="text-lg font-semibold text-gray-800">Currently Enrolled Courses</h3>
          </div>
          <div className="bg-indigo-50 rounded-lg p-4">
            <ul className="space-y-2">
              {user.enrolledCourses.map((course, index) => (
                <li key={index} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-600"></div>
                  <span className="text-gray-700">{course.courseName} ({course.courseCredit} credits)</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <p className="text-sm text-gray-500 mt-4">
        View your degree progress for {user.department || 'your department'}
      </p>
    </div>
  );
}



// import { GraduationCap, Book, BookOpen, Award } from 'lucide-react';
// import { User } from '../types'
// interface ProgressTrackerProps {
//   user: User;
// }
//
// export default function ProgressTracker({ user }: ProgressTrackerProps) {
//
//   const progressPercentage = (user.credits.completed / user.credits.required) * 100;
//
//   return (
//     <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
//       <div className="flex items-center gap-2 mb-4">
//         <GraduationCap size={24} className="text-indigo-600" />
//         <h2 className="text-xl font-semibold text-gray-800">Hey {user.name}! Here Is Your Academic Progress </h2>
//       </div>
//
//       {/* Credits Progress */}
//       <div>
//         <div className="flex justify-between mb-2">
//           <span className="text-sm font-medium text-gray-700">Credit Points Progress</span>
//           <span className="text-sm text-gray-500">
//             {user.credits.completed} / {user.credits.required} credits
//           </span>
//         </div>
//         <div className="w-full bg-gray-200 rounded-full h-2.5">
//           <div
//             className="bg-indigo-600 h-2.5 rounded-full"
//             style={{ width: `${Math.min(100, progressPercentage)}%` }}
//           />
//         </div>
//       </div>
//
//       {/* GPA */}
//       <div className="flex items-center gap-4 p-4 bg-indigo-50 rounded-lg">
//         <Award size={24} className="text-indigo-600" />
//         <div>
//           <div className="text-sm font-medium text-gray-700">Current GPA</div>
//           <div className="text-2xl font-bold text-indigo-600">{user.gpa}</div>
//         </div>
//       </div>
//
//       {/* Completed Requirements */}
//       <div className="grid grid-cols-4 gap-4">
//         <div className="p-4 bg-red-50 rounded-lg">
//           <div className="flex items-center gap-2 mb-2">
//             <Book size={16} className="text-red-600" />
//             <span className="text-sm font-medium text-gray-700">Mandatory</span>
//           </div>
//           <div className="text-xl font-bold text-red-600">
//             {user.remainingRequirements?.mandatory}
//           </div>
//           <div className="text-xs text-gray-500">Completed Credits</div>
//         </div>
//
//         {/*<div className="p-4 bg-yellow-50 rounded-lg">*/}
//         {/*  <div className="flex items-center gap-2 mb-2">*/}
//         {/*    <BookOpen size={16} className="text-blue-600" />*/}
//         {/*    <span className="text-sm font-medium text-gray-700">English</span>*/}
//         {/*  </div>*/}
//         {/*  <div className="text-xl font-bold text-blue-600">*/}
//         {/*    {user.remainingRequirements?.english}*/}
//         {/*  </div>*/}
//         {/*  <div className="text-xs text-gray-500">Credits Completed</div>*/}
//         {/*</div>*/}
//
//         <div className="p-4 bg-blue-50 rounded-lg">
//           <div className="flex items-center gap-2 mb-2">
//             <BookOpen size={16} className="text-blue-600" />
//             <span className="text-sm font-medium text-gray-700">Elective</span>
//           </div>
//           <div className="text-xl font-bold text-blue-600">
//             {user.remainingRequirements?.elective}
//           </div>
//           <div className="text-xs text-gray-500">Completed Credits</div>
//         </div>
//
//         <div className="p-4 bg-green-50 rounded-lg">
//           <div className="flex items-center gap-2 mb-2">
//             <Book size={16} className="text-green-600" />
//             <span className="text-sm font-medium text-gray-700">General</span>
//           </div>
//           <div className="text-xl font-bold text-green-600">
//             {user.remainingRequirements?.general}
//           </div>
//           <div className="text-xs text-gray-500">Completed Credits</div>
//         </div>
//       </div>
//
//       <p className="text-sm text-gray-500 mt-4">
//         View your degree progress for {user.department || 'your department'}
//       </p>
//     </div>
//
//
//
//
//   );
// }







