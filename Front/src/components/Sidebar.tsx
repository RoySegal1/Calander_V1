// Sidebar.tsx modifications
import { Course } from '../types';
import { Filter, BookOpen } from 'lucide-react';
// Add useMemo to import
import { useMemo } from 'react';


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
  onFilterChange,
  uniqueCourseTypes,
}: SidebarProps) {
  
  // Define the same color mapping as in WeeklySchedule
  const courseColors = useMemo(() => {
    // Base colors for different courses - same as in WeeklySchedule
    const baseColors = [
      { name: 'indigo', bg: 'rgba(79, 70, 229, 1)', bgLight: 'rgba(79, 70, 229, 0.2)', text: 'rgb(79, 70, 229)' },
      { name: 'amber', bg: 'rgba(245, 158, 11, 1)', bgLight: 'rgba(245, 158, 11, 0.2)', text: 'rgb(245, 158, 11)' },
      { name: 'rose', bg: 'rgba(225, 29, 72, 1)', bgLight: 'rgba(225, 29, 72, 0.2)', text: 'rgb(225, 29, 72)' },
      { name: 'emerald', bg: 'rgba(16, 185, 129, 1)', bgLight: 'rgba(16, 185, 129, 0.2)', text: 'rgb(16, 185, 129)' },
      { name: 'violet', bg: 'rgba(139, 92, 246, 1)', bgLight: 'rgba(139, 92, 246, 0.2)', text: 'rgb(139, 92, 246)' },
      { name: 'cyan', bg: 'rgba(6, 182, 212, 1)', bgLight: 'rgba(6, 182, 212, 0.2)', text: 'rgb(6, 182, 212)' },
      { name: 'fuchsia', bg: 'rgba(192, 38, 211, 1)', bgLight: 'rgba(192, 38, 211, 0.2)', text: 'rgb(192, 38, 211)' },
      { name: 'lime', bg: 'rgba(132, 204, 22, 1)', bgLight: 'rgba(132, 204, 22, 0.2)', text: 'rgb(132, 204, 22)' },
      { name: 'sky', bg: 'rgba(14, 165, 233, 1)', bgLight: 'rgba(14, 165, 233, 0.2)', text: 'rgb(14, 165, 233)' },
      { name: 'teal', bg: 'rgba(20, 184, 166, 1)', bgLight: 'rgba(20, 184, 166, 0.2)', text: 'rgb(20, 184, 166)' },
    ];
    
    // Assign a color to each course
    const colorMap = new Map<string, typeof baseColors[0]>();
    selectedCourses.forEach((courseId, index) => {
      colorMap.set(courseId, baseColors[index % baseColors.length]);
    });
    
    return colorMap;
  }, [selectedCourses]);


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
