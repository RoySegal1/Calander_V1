import { GraduationCap, Book, BookOpen, Award } from 'lucide-react';

interface User {
  username?: string;
  is_guest?: boolean;
  department?: string;
  saved_courses?: string[];
  progress?: Record<string, any>;
}

interface ProgressTrackerProps {
  user: User;
}

export default function ProgressTracker({ user }: ProgressTrackerProps) {
  const progress = user.progress || {
    totalCredits: 0,
    requiredCredits: 160,
    completedRequirements: {
      mandatory: 0,
      english: 0,
      elective: 0,
      general: 0,
    },
    gpa: 0,
  };

  const progressPercentage = (progress.totalCredits / progress.requiredCredits) * 100;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <GraduationCap size={24} className="text-indigo-600" />
        <h2 className="text-xl font-semibold text-gray-800">Academic Progress</h2>
      </div>

      {/* Credits Progress */}
      <div>
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Credit Points Progress</span>
          <span className="text-sm text-gray-500">
            {progress.totalCredits} / {progress.requiredCredits} credits
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-indigo-600 h-2.5 rounded-full"
            style={{ width: `${Math.min(100, progressPercentage)}%` }}
          />
        </div>
      </div>

      {/* GPA */}
      <div className="flex items-center gap-4 p-4 bg-indigo-50 rounded-lg">
        <Award size={24} className="text-indigo-600" />
        <div>
          <div className="text-sm font-medium text-gray-700">Current GPA</div>
          <div className="text-2xl font-bold text-indigo-600">{progress.gpa}</div>
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
            {progress.completedRequirements.mandatory}
          </div>
          <div className="text-xs text-gray-500">Credits Completed</div>
        </div>

        <div className="p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen size={16} className="text-blue-600" />
            <span className="text-sm font-medium text-gray-700">English</span>
          </div>
          <div className="text-xl font-bold text-blue-600">
            {progress.completedRequirements.english}
          </div>
          <div className="text-xs text-gray-500">Credits Completed</div>
        </div>

        <div className="p-4 bg-yellow-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen size={16} className="text-blue-600" />
            <span className="text-sm font-medium text-gray-700">Elective</span>
          </div>
          <div className="text-xl font-bold text-blue-600">
            {progress.completedRequirements.elective}
          </div>
          <div className="text-xs text-gray-500">Credits Completed</div>
        </div>

        <div className="p-4 bg-green-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Book size={16} className="text-green-600" />
            <span className="text-sm font-medium text-gray-700">General</span>
          </div>
          <div className="text-xl font-bold text-green-600">
            {progress.completedRequirements.general}
          </div>
          <div className="text-xs text-gray-500">Credits Completed</div>
        </div>
      </div>

      <p className="text-sm text-gray-500 mt-4">
        View your degree progress for {user.department || 'your department'}
      </p>
    </div>
  );
}
