import { Course } from '../types';


interface CourseListProps {
  courses: Course[];
  onCourseHover: (course: Course | null) => void;
  onCourseSelect: (course: Course) => void;
  selectedCourses: Course[];
}

export default function CourseList({
  courses,
  onCourseHover,
  onCourseSelect,
  selectedCourses,
}: CourseListProps) {
  const isSelected = (course: Course) => 
    selectedCourses.some(selected => selected.courseCode === course.courseCode);

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="divide-y divide-gray-200">
        {courses.map(course => (
          <div
            key={course.courseCode}
            className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
              isSelected(course) ? 'bg-indigo-50' : ''
            }`}
            onMouseEnter={() => onCourseHover(course)}
            onMouseLeave={() => onCourseHover(null)}
            onClick={() => onCourseSelect(course)}
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-medium text-gray-900">{course.courseName}</h3>
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
        ))}
      </div>
    </div>
  );
}