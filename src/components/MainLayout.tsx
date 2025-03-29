// MainLayout.tsx modifications
import { useState, useMemo } from 'react';
import { Course, CourseGroup } from '../types';
import WeeklySchedule from './WeeklySchedule';
import Sidebar from './Sidebar';
import ProgressTracker from './ProgressTracker';
import { mockCourses } from '../data/mockData';

interface SelectedCourseGroups {
  courseId: string;
  groups: CourseGroup[];
}

export default function MainLayout() {
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<SelectedCourseGroups[]>([]);
  const [filters, setFilters] = useState({
    department: '',
    type: '',
    semester: '',
  });


// Define course colors in the parent component to share with children
const courseColors = useMemo(() => {
  // Base colors for different courses
  const baseColors = [
    { name: 'indigo', bg: 'rgba(79, 70, 229, 1)', bgLight: 'rgba(79, 70, 229, 0.2)', text: 'rgb(79, 70, 229)' },
    { name: 'teal', bg: 'rgba(20, 184, 166, 1)', bgLight: 'rgba(20, 184, 166, 0.2)', text: 'rgb(20, 184, 166)' },
    { name: 'amber', bg: 'rgba(245, 158, 11, 1)', bgLight: 'rgba(245, 158, 11, 0.2)', text: 'rgb(245, 158, 11)' },
    { name: 'rose', bg: 'rgba(225, 29, 72, 1)', bgLight: 'rgba(225, 29, 72, 0.2)', text: 'rgb(225, 29, 72)' },
    { name: 'emerald', bg: 'rgba(16, 185, 129, 1)', bgLight: 'rgba(16, 185, 129, 0.2)', text: 'rgb(16, 185, 129)' },
    { name: 'violet', bg: 'rgba(139, 92, 246, 1)', bgLight: 'rgba(139, 92, 246, 0.2)', text: 'rgb(139, 92, 246)' },
    { name: 'cyan', bg: 'rgba(6, 182, 212, 1)', bgLight: 'rgba(6, 182, 212, 0.2)', text: 'rgb(6, 182, 212)' },
    { name: 'fuchsia', bg: 'rgba(192, 38, 211, 1)', bgLight: 'rgba(192, 38, 211, 0.2)', text: 'rgb(192, 38, 211)' },
    { name: 'lime', bg: 'rgba(132, 204, 22, 1)', bgLight: 'rgba(132, 204, 22, 0.2)', text: 'rgb(132, 204, 22)' },
    { name: 'sky', bg: 'rgba(14, 165, 233, 1)', bgLight: 'rgba(14, 165, 233, 0.2)', text: 'rgb(14, 165, 233)' },
  ];
  
  // Assign a color to each selected course
  const colorMap = new Map<string, typeof baseColors[0]>();
  selectedCourses.forEach((courseId, index) => {
    colorMap.set(courseId, baseColors[index % baseColors.length]);
  });
  
  return colorMap;
}, [selectedCourses]);





const handleClearSchedule = () => {
  setSelectedCourses([]);
  setSelectedGroups([]);
};



const handleScheduleChosen = () => {
  const schedule = selectedGroups.map(sg => {
    const course = mockCourses.find(c => c.courseCode === sg.courseId);
    return {
      courseName: course?.courseName,
      courseCode: sg.courseId,
      groups: sg.groups.map(g => ({
        groupCode: g.groupCode,
        lecturer: g.lecturer,
        room: g.room,
        dayOfWeek: g.dayOfWeek,
        startTime: g.startTime,
        endTime: g.endTime,
        lectureType: g.lectureType,
      }))
    };
  });

  console.log("Selected Schedule:", schedule);
  // TODO: send this somewhere, store it, or display in modal . API? export? google calendar?
  // For now, just log it to the console
   alert("Schedule chosen! Check console for details.");
   console.log(schedule);

};




  const handleCourseSelect = (course: Course) => {
    if (selectedCourses.includes(course.courseCode)) {
      // If course is already selected, remove it and its groups
      setSelectedCourses(selectedCourses.filter(id => id !== course.courseCode));
      setSelectedGroups(selectedGroups.filter(sg => sg.courseId !== course.courseCode));
    } else {
      // Add new course
      setSelectedCourses([...selectedCourses, course.courseCode]);
    }
  };

  const handleGroupSelect = (group: CourseGroup, courseId: string) => {
    const courseGroups = selectedGroups.find(sg => sg.courseId === courseId);
  
    // If the group is already selected, remove it (deselection)
    if (courseGroups?.groups.some(g => g.groupCode === group.groupCode)) {
      const updatedGroups = courseGroups.groups.filter(g => g.groupCode !== group.groupCode);
  
      if (updatedGroups.length === 0) {
        setSelectedGroups(selectedGroups.filter(sg => sg.courseId !== courseId)); // Remove course if no groups left
      } else {
        setSelectedGroups(selectedGroups.map(sg => 
          sg.courseId === courseId ? { ...sg, groups: updatedGroups } : sg
        ));
      }
      return;
    }
  
    // Check for time conflicts with existing groups
    const hasConflict = selectedGroups.some(sg =>
      sg.groups.some(g =>
        g.dayOfWeek === group.dayOfWeek &&
        (
          (parseInt(group.startTime.split(':')[0]) < parseInt(g.endTime.split(':')[0]) ||
           (parseInt(group.startTime.split(':')[0]) === parseInt(g.endTime.split(':')[0]) && 
            parseInt(group.startTime.split(':')[1]) < parseInt(g.endTime.split(':')[1]))) &&
          (parseInt(group.endTime.split(':')[0]) > parseInt(g.startTime.split(':')[0]) ||
           (parseInt(group.endTime.split(':')[0]) === parseInt(g.startTime.split(':')[0]) && 
            parseInt(group.endTime.split(':')[1]) > parseInt(g.startTime.split(':')[1])))
        )
    ));
  
    if (hasConflict) {
      // Option 1: Prevent selection if there's a conflict
      console.log("Time conflict detected!");
      // You could show a notification to the user here
      
      // Option 2: Allow the selection anyway (uncomment to enable)
      // addGroupToCourse(group, courseId);
      
      return;
    }
    
    // No conflict, add the group
    addGroupToCourse(group, courseId);
  };
  
  // Helper function to add a group to a course
  const addGroupToCourse = (group: CourseGroup, courseId: string) => {
    const courseGroups = selectedGroups.find(sg => sg.courseId === courseId);
    
    // Check if we're trying to add a duplicate lecture/practice type
    const isDuplicateType = courseGroups?.groups.some(g => g.lectureType === group.lectureType);
    
    if (isDuplicateType) {
      // Replace the existing group of the same type
      setSelectedGroups(selectedGroups.map(sg => 
        sg.courseId === courseId ? { 
          ...sg, 
          groups: [...sg.groups.filter(g => g.lectureType !== group.lectureType), group] 
        } : sg
      ));
    } else if (courseGroups) {
      // Add a new group type to existing course
      setSelectedGroups(selectedGroups.map(sg => 
        sg.courseId === courseId ? { ...sg, groups: [...sg.groups, group] } : sg
      ));
    } else {
      // Add a completely new course and group
      setSelectedGroups([...selectedGroups, { courseId, groups: [group] }]);
    }
  };

  const filteredCourses = mockCourses.filter(course => {
    if (filters.department && course.department !== filters.department) return false;
    if (filters.type && course.courseType !== filters.type) return false;
    if (filters.semester && course.semester !== filters.semester) return false;
    return true;
  });

  const selectedCourseObjects = selectedCourses
  .map(id => mockCourses.find(c => c.courseCode === id))
  .filter(course => course !== undefined) as Course[];

return (
  <div className="min-h-screen bg-gray-100 flex">
    <Sidebar
      courses={filteredCourses}
      selectedCourses={selectedCourses}
      onCourseSelect={handleCourseSelect}
      filters={filters}
      onFilterChange={setFilters}
      courseColors={courseColors} // Pass the color mapping to Sidebar
    />
    
    <div className="flex-1 p-6 overflow-auto">
      <div className="max-w-5xl mx-auto space-y-6">
        <h2 className="text-2xl font-semibold text-gray-800">Weekly Schedule</h2>
        <WeeklySchedule
          selectedCourses={selectedCourseObjects}
          selectedGroups={selectedGroups}
          onGroupSelect={handleGroupSelect}
          courseColors={courseColors} // Pass the color mapping to WeeklySchedule
          onClearSchedule={handleClearSchedule}
          onScheduleChosen={handleScheduleChosen}
        />
        <ProgressTracker />
      </div>
    </div>
  </div>
);
}

