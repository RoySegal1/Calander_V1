import { mockUser } from '../data/mockData';
import { GraduationCap, Book, BookOpen, Award } from 'lucide-react';

export default function ProgressTracker() {
  const { credits, gpa, remainingRequirements } = mockUser;
  
  const progressPercentage = (credits.completed / credits.required) * 100;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <GraduationCap size={24} className="text-indigo-600" />
        <h2 className="text-xl font-semibold text-gray-800">Academic Progress</h2>
      </div>

      {/* Credits Progress */}
      <div>
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Credits Progress</span>
          <span className="text-sm text-gray-500">
            {credits.completed} / {credits.required} credits
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-indigo-600 h-2.5 rounded-full"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* GPA */}
      <div className="flex items-center gap-4 p-4 bg-indigo-50 rounded-lg">
        <Award size={24} className="text-indigo-600" />
        <div>
          <div className="text-sm font-medium text-gray-700">Current GPA</div>
          <div className="text-2xl font-bold text-indigo-600">{gpa}</div>
        </div>
      </div>

      {/* Remaining Requirements */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-red-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Book size={16} className="text-red-600" />
            <span className="text-sm font-medium text-gray-700">Mandatory</span>
          </div>
          <div className="text-xl font-bold text-red-600">
            {remainingRequirements.mandatory}
          </div>
          <div className="text-xs text-gray-500">courses remaining</div>
        </div>

        <div className="p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen size={16} className="text-blue-600" />
            <span className="text-sm font-medium text-gray-700">English</span>
          </div>
          <div className="text-xl font-bold text-blue-600">
            {remainingRequirements.english}
          </div>
          <div className="text-xs text-gray-500">courses remaining</div>
        </div>

        <div className="p-4 bg-green-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Book size={16} className="text-green-600" />
            <span className="text-sm font-medium text-gray-700">General</span>
          </div>
          <div className="text-xl font-bold text-green-600">
            {remainingRequirements.general}
          </div>
          <div className="text-xs text-gray-500">courses remaining</div>
        </div>
      </div>
    </div>
  );
}