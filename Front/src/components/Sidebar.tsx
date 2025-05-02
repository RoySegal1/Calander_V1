// Sidebar.tsx modifications
import { Course } from '../types';
import { Filter, BookOpen } from 'lucide-react';


interface SidebarProps {
  courses: Course[];
  selectedCourses: string[];
  onCourseSelect: (course: Course) => void;
  filters: {
    department: string;
    semester: string;
    type: string;
  };
  onFilterChange: (filters: any) => void;
  courseColors: Map<string, { bg: string; bgLight: string; text: string }>;
  uniqueCourseTypes: string[];
}


//const courseTypes: CourseType[] = ["קורסי חובה שנה א" ,"קורסי חובה שנה ב","קורסי חובה שנה ג", 'קורסי בחירה' , 'קורסי חובה לימודי אנגלית' , 'סמינר חובה'  , 'קורסי יחידה ללימודי חברה ורוח' , 'קורסי בחירה נוספים'];
// ,
const departments = ['מדעי המחשב', 'הנדסת חשמל', 'הנדסה תעשייה וניהול','מדעי הנתונים','הנדסת תוכנה', 'הנדסה ביורפואית', 'הנדסה מכנית',];
const semesters = ["א","ב","קיץ"];

export default function Sidebar({
  courses,
  selectedCourses,
  onCourseSelect,
  filters,
    courseColors,
  onFilterChange,
  uniqueCourseTypes,
}: SidebarProps) {


  return (
    <div className="w-full bg-white border-r border-gray-200 flex flex-col h-screen max-w-xs">
      {/* Filters Section - unchanged */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={20} className="text-indigo-600" />
          <h2 className="text-lg font-semibold text-gray-800">Filters</h2>
        </div>
        
        {/* Existing filters code */}
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
              <option value="">כל סוגי הקורסים</option>
              {uniqueCourseTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Courses List - modified to use course colors */}
      <div className="flex-1 overflow-auto">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <BookOpen size={20} className="text-indigo-600" />
            <h2 className="text-lg font-semibold text-gray-800">Available Courses</h2>
          </div>
        </div>
        
        <div className="divide-y divide-gray-200">
          {courses.map(course => {
            // Get color objects for selected courses
            const colorObj = courseColors.get(course.courseCode);
            const isSelected = selectedCourses.includes(course.courseCode);
            
            return (
              <div
                key={course.courseCode}
                className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                  isSelected ? 'bg-opacity-20' : ''
                }`}
                style={{
                  backgroundColor: isSelected && colorObj ? colorObj.bgLight : '',
                  borderLeft: isSelected && colorObj ? `4px solid ${colorObj.bg}` : '4px solid transparent'
                }}
                onClick={() => onCourseSelect(course)}
              >
                <div className="flex justify-between items-center">
                  <h3 className={`text-sm font-medium ${isSelected && colorObj ? `text-[${colorObj.text}]` : 'text-gray-900'}`}>
                    {course.courseName}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    course.courseType === "קורסי חובה שנה א"
                      ? 'bg-red-100 text-red-800'
                      : course.courseType === 'קורסי חובה שנה ב'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {course.courseType}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
