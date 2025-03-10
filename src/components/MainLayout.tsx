import { useState } from 'react';
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

  // Get full course objects for selected courses
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
      />
      
      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-5xl mx-auto space-y-6">
          <h2 className="text-2xl font-semibold text-gray-800">Weekly Schedule</h2>
          <WeeklySchedule
            selectedCourses={selectedCourseObjects}
            selectedGroups={selectedGroups}
            onGroupSelect={handleGroupSelect}
          />
          <ProgressTracker />
        </div>
      </div>
    </div>
  );
}

