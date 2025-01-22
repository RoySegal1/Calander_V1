import { Course, CourseType } from '../types';
import { Filter, BookOpen } from 'lucide-react';

interface SidebarProps {
  courses: Course[];
  selectedCourses: string[];
  onCourseSelect: (course: Course) => void;
  filters: {
    department: string;
    semester:string;
    type: string;
    prerequisites: boolean;
    hideCompleted: boolean;
  };
  onFilterChange: (filters: any) => void;
}

const courseTypes: CourseType[] = ["קורסי חובה שנה א","קורסי חובה שנה ב", 'Selection', 'English', 'General', 'Seminar', 'Final Projects'];
const departments = ['מדעי המחשב', 'Mathematics', 'English'];
const semesters = ["א","ב","קיץ"];

export default function Sidebar({
  courses,
  selectedCourses,
  onCourseSelect,
  filters,
  onFilterChange,
}: SidebarProps) {
  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-screen">
      {/* Filters Section */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={20} className="text-indigo-600" />
          <h2 className="text-lg font-semibold text-gray-800">Filters</h2>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department
            </label>
            <select
              value={filters.department}
              onChange={(e) => onFilterChange({ ...filters, department: e.target.value })}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
          <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              סמסטר
            </label>
            <select
              value={filters.semester}
              onChange={(e) => onFilterChange({ ...filters, semester: e.target.value })}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="">כל הסמסטרים</option>
              {semesters.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Course Type
            </label>
            <select
              value={filters.type}
              onChange={(e) => onFilterChange({ ...filters, type: e.target.value })}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="">All Types</option>
              {courseTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="prerequisites"
              checked={filters.prerequisites}
              onChange={(e) => onFilterChange({ ...filters, prerequisites: e.target.checked })}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="prerequisites" className="text-sm text-gray-700">
              Show courses with prerequisites only
            </label>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="hideCompleted"
              checked={filters.hideCompleted}
              onChange={(e) => onFilterChange({ ...filters, hideCompleted: e.target.checked })}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="hideCompleted" className="text-sm text-gray-700">
              Hide completed courses
            </label>
          </div>
        </div>
      </div>

      {/* Courses List */}
      <div className="flex-1 overflow-auto">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <BookOpen size={20} className="text-indigo-600" />
            <h2 className="text-lg font-semibold text-gray-800">Available Courses</h2>
          </div>
        </div>
        
        <div className="divide-y divide-gray-200">
          {courses.map(course => (
            <div
              key={course.courseCode}
              className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                selectedCourses.includes(course.courseCode) ? 'bg-indigo-50' : ''
              }`}
              onClick={() => onCourseSelect(course)}
            >
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium text-gray-900">{course.courseName}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  course.courseType === "קורסי חובה שנה א"
                    ? 'bg-red-100 text-red-800'
                    : course.courseType === 'English'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-green-100 text-green-800'
                }`}>
                  {course.courseType}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}