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
      const courseGroups = selectedGroups.find(sg => sg.courseId === course.courseCode);
      const hasLecture = courseGroups?.groups.some(g => g.lectureType === 0);
      const hasPractice = courseGroups?.groups.some(g => g.lectureType === 1);

      if (hasLecture && hasPractice) {
        setSelectedGroups(selectedGroups.filter(sg => sg.courseId !== course.courseCode && courseGroups?.groups.every(g => g.groupCode !== sg.groups[0].groupCode)));
      } else {
        setSelectedCourses(selectedCourses.filter(id => id !== course.courseCode));
        setSelectedGroups(selectedGroups.filter(sg => sg.courseId !== course.courseCode));
      }
    } else {
      setSelectedCourses([...selectedCourses, course.courseCode]);
    }
  };

  const handleGroupSelect = (group: CourseGroup, courseId: string) => {
    const courseGroups = selectedGroups.find(sg => sg.courseId === courseId);

    if (courseGroups) {
      const existingGroupOfType = courseGroups.groups.find(g => g.lectureType === group.lectureType);

      if (existingGroupOfType) {
        if (existingGroupOfType.groupCode === group.groupCode) {
          const updatedGroups = courseGroups.groups.filter(g => g.groupCode !== group.groupCode);
          setSelectedGroups(selectedGroups.map(sg =>
            sg.courseId === courseId
              ? { ...sg, groups: updatedGroups }
              : sg
          ));
        } else {
          const updatedGroups = courseGroups.groups.map(g =>
            g.lectureType === group.lectureType ? group : g
          );
          setSelectedGroups(selectedGroups.map(sg =>
            sg.courseId === courseId
              ? { ...sg, groups: updatedGroups }
              : sg
          ));
        }
      } else {
        setSelectedGroups(selectedGroups.map(sg =>
          sg.courseId === courseId
            ? { ...sg, groups: [...sg.groups, group] }
            : sg
        ));
      }
    } else {
      setSelectedGroups([...selectedGroups, { courseId, groups: [group] }]);
    }
  };

  const filteredCourses = mockCourses.filter(course => {
    if (filters.department && course.department !== filters.department) return false;
    if (filters.type && course.courseType !== filters.type) return false;
    if (filters.semester && course.semester !== filters.semester) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-5xl mx-auto space-y-6">
          <h2 className="text-2xl font-semibold text-gray-800">Weekly Schedule</h2>
          <WeeklySchedule
            selectedCourses={selectedCourses.map(id => mockCourses.find(c => c.courseCode === id)!)}
            selectedGroups={selectedGroups}
            onGroupSelect={handleGroupSelect}
          />
          <ProgressTracker />
        </div>
      </div>
      <Sidebar
        courses={filteredCourses}
        selectedCourses={selectedCourses}
        onCourseSelect={handleCourseSelect}
        filters={filters}
        onFilterChange={setFilters}
      />
    </div>
  );
}
