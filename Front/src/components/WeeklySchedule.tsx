
import { Course, CourseGroup } from '../types';
import { useState } from 'react';

interface WeeklyScheduleProps {
  selectedCourses: Course[];
  selectedGroups: {
    courseId: string;
    groups: CourseGroup[];
  }[];
  onGroupSelect: (group: CourseGroup, courseId: string) => void;
  courseColors: Map<string, { bg: string; bgLight: string; text: string }>;
  onClearSchedule?: () => void;
  onScheduleChosen?: () => void; 
}



export default function WeeklySchedule({ 
  selectedCourses,
  selectedGroups,
  onGroupSelect,
    courseColors,
  onClearSchedule,
  onScheduleChosen, 
}: WeeklyScheduleProps) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const hours = Array.from({ length: 16 }, (_, i) => i + 8); // 8:00 to 22:00
  const [hoveredGroup, setHoveredGroup] = useState<string | null>(null);
  // State for toggling visibility of unselected courses
  const [showSelectedOnly, setShowSelectedOnly] = useState<boolean>(false);


  const getTimeString = (hour: number) => `${hour.toString().padStart(2, '0')}:00`;

  // Get all courses with their groups that are currently selected in selectedGroups
  const getSelectedCoursesWithGroups = () => {
    const result: { 
      course: Course; 
      groups: CourseGroup[];
    }[] = [];

    selectedGroups.forEach(sg => {
      const course = selectedCourses.find(c => c.courseCode === sg.courseId);
      if (course && sg.groups.length > 0) {
        result.push({
          course,
          groups: sg.groups
        });
      }
    });

    return result;
  };

  // Get all course blocks to be rendered in the schedule
  const getCourseBlocks = () => {
    const blocks: {
      course: Course;
      group: CourseGroup;
      isSelected: boolean;
    }[] = [];

    // Add all selected groups
    getSelectedCoursesWithGroups().forEach(item => {
      item.groups.forEach(group => {
        blocks.push({
          course: item.course,
          group,
          isSelected: true
        });
      });
    });

    // Add all available groups from selected courses that aren't already selected
    // Only add them if we're not in "selected only" mode
    if (!showSelectedOnly) {
      selectedCourses.forEach(course => {
        const selectedCourseGroups = selectedGroups.find(sg => sg.courseId === course.courseCode)?.groups || [];
        const selectedGroupCodes = new Set(selectedCourseGroups.map(g => g.groupCode));

        course.groups.forEach(group => {
          if (!selectedGroupCodes.has(group.groupCode)) {
            blocks.push({
              course,
              group,
              isSelected: false
            });
          }
        });
      });
    }

    return blocks;
  };

  // Helper function to parse "HH:MM" time format to minutes since 00:00
  const parseTimeToMinutes = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // Find all groups that overlap with a specific time slot
  const getOverlappingGroups = (dayIndex: number, group: CourseGroup) => {
    return getCourseBlocks()
      .filter(block => {
        const otherGroup = block.group;
        
        if (otherGroup.dayOfWeek !== dayIndex) return false;
        if (otherGroup.groupCode === group.groupCode) return false;
        
        const thisStart = parseTimeToMinutes(group.startTime);
        const thisEnd = parseTimeToMinutes(group.endTime);
        const otherStart = parseTimeToMinutes(otherGroup.startTime);
        const otherEnd = parseTimeToMinutes(otherGroup.endTime);
        
        return (thisStart < otherEnd && thisEnd > otherStart);
      })
      .map(block => block.group);
  };

  // Find all groups that are in the same time slot (day + time)
  const getGroupsInSameTimeSlot = (group: CourseGroup) => {
    return getCourseBlocks()
      .filter(block => {
        const otherGroup = block.group;
        
        // Check if same day
        if (otherGroup.dayOfWeek !== group.dayOfWeek) return false;
        // Don't include self
        if (otherGroup.groupCode === group.groupCode) return false;
        
        const thisStart = parseTimeToMinutes(group.startTime);
        const thisEnd = parseTimeToMinutes(group.endTime);
        const otherStart = parseTimeToMinutes(otherGroup.startTime);
        const otherEnd = parseTimeToMinutes(otherGroup.endTime);
        
        // Check for overlap
        return (thisStart < otherEnd && thisEnd > otherStart);
      });
  };

  // Custom group selection handler to handle replacing groups in the same time slot
  const handleGroupSelect = (group: CourseGroup, courseId: string) => {
    // Find which groups would be automatically deselected due to time conflict
    const conflictingBlocks = getGroupsInSameTimeSlot(group);
    
    // Call the original onGroupSelect with the group to select/deselect
    onGroupSelect(group, courseId);
    
    // If this is a selection (not a deselection) and there are conflicts,
    // automatically deselect the conflicting groups
    const isCurrentlySelected = selectedGroups.some(sg => 
      sg.courseId === courseId && 
      sg.groups.some(g => g.groupCode === group.groupCode)
    );
    
    if (!isCurrentlySelected) {
      // For each conflicting group, deselect it
      conflictingBlocks.forEach(block => {
        if (block.isSelected) {
          onGroupSelect(block.group, block.course.courseCode);
        }
      });
    }
  };

  // Handle clearing the schedule
  const handleClearSchedule = () => {
    if (onClearSchedule) {
      onClearSchedule();
    }
  };


  // Get style for a course group block
  const getGroupStyle = (course: Course, group: CourseGroup, isSelected: boolean) => {
    const startMinutes = parseTimeToMinutes(group.startTime) - 8 * 60; // Offset by 8 hours (schedule start)
    const endMinutes = parseTimeToMinutes(group.endTime) - 8 * 60;
    const height = endMinutes - startMinutes;

    // Find all groups that overlap with this one at the same time
    const overlappingGroups = getOverlappingGroups(group.dayOfWeek, group);
    
    // Add this group to create the full set of overlapping groups
    const allGroups = [group, ...overlappingGroups];
    
    // Sort by group code for consistent display order
    allGroups.sort((a, b) => a.groupCode.localeCompare(b.groupCode));
    
    const index = allGroups.findIndex(g => g.groupCode === group.groupCode);
    const count = allGroups.length;
    
    // Calculate width and left position based on number of overlapping courses
    const width = count > 1 ? `${95 / count}%` : '95%';
    const left = count > 1 ? `${(95 / count) * index + 2.5}%` : '2.5%';
    
    // Get the course color from our internal color generator
    const defaultColor = { bg: 'rgba(156, 163, 175, 1)', bgLight: 'rgba(156, 163, 175, 0.2)', text: 'rgb(156, 163, 175)' };
    const courseColor = courseColors.get(course.courseCode) || defaultColor;
    
    // Determine if it's a lecture or practice
    const isLecture = group.lectureType === 0;
    
    // Create an opacity effect for lectures vs practices
    const bgOpacity = isLecture ? 0.9 : 0.7;
    
    // Set colors based on course, type, and selection state

    const isHovered = hoveredGroup === group.groupCode;
    const textColor = isSelected ? 'white' : courseColor.text;
    const bgColor = isSelected
      ? isLecture 
        ? courseColor.bg.replace('1)', `${bgOpacity})`) // Darker for lecture
        : courseColor.bg.replace('1)', `${bgOpacity})`) // Slightly lighter for practice
      : courseColor.bgLight; // Even lighter for unselected
    
    return {
      position: 'absolute' as const,
      top: `${startMinutes}px`,
      height: `${height}px`,
      width: isHovered ? '95%' : width,
      left,
      backgroundColor: bgColor,
      borderRadius: '0.5rem',
      padding: '0.5rem',
      color: textColor,
      fontSize: '0.875rem',
      overflow: 'hidden',
      transition: 'all 0.2s ease-in-out',
      cursor: 'pointer',
      zIndex: isHovered ? 30 : (isSelected ? 20 : 10),
      border: isHovered 
        ? `2px solid ${courseColor.text}` 
        : '1px solid transparent',
      boxShadow: (isSelected || isHovered) ? '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' : 'none',
      // Add a subtle pattern for practice sessions
      backgroundImage: !isLecture ? 'repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(255,255,255,0.1) 5px, rgba(255,255,255,0.1) 10px)' : 'none',
    };
  };

  const courseBlocks = getCourseBlocks();

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 overflow-auto">
      {/* Add toggle and clear buttons at the top */}
      <div className="flex justify-end mb-4 gap-2">
  <button 
    onClick={handleClearSchedule}
    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
  >
    Clear Schedule
  </button>

  <button 
    onClick={() => setShowSelectedOnly(!showSelectedOnly)}
    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
  >
    {showSelectedOnly ? "Show All Courses" : "Show Selected Only"}
  </button>

  <button 
    onClick={() => onScheduleChosen?.()}
    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
  >
    Choose Schedule
  </button>
</div>

      
      <div className="flex">
        <div className="w-20 shrink-0">
          <div className="h-8" /> {/* Header spacer */}
          {hours.map(hour => (
            <div key={hour} className="h-[60px] text-sm text-gray-500 relative -top-3">
              {getTimeString(hour)}
            </div>
          ))}
        </div>
        
        <div className="flex-1 grid grid-cols-6 gap-2">
          {days.map((day, dayIndex) => (
            <div key={day} className="relative">
              <div className="h-8 text-sm font-medium text-gray-700 text-center sticky top-0 bg-white">
                {day}
              </div>
              <div className="relative h-[960px]"> {/* 16 hours * 60px */}
                {hours.map(hour => (
                  <div
                    key={hour}
                    className="h-[60px] border-t border-gray-100"
                  />
                ))}
                
                {/* Render all course blocks for this day */}
                {courseBlocks
                  .filter(block => block.group.dayOfWeek === dayIndex)
                  .map(({ course, group, isSelected }) => (
                    <div
                      key={`${course.courseCode}-${group.groupCode}`}
                      style={getGroupStyle(course, group, isSelected)}
                      onClick={() => handleGroupSelect(group, course.courseCode)}
                      onMouseEnter={() => setHoveredGroup(group.groupCode)}
                      onMouseLeave={() => setHoveredGroup(null)}
                      className="hover:shadow-lg relative group"
                    >
                      {/* Course information from old code */}
                      <div className="font-medium truncate">{course.courseName}</div>
                      <div className="text-xs truncate">
                        {group.groupCode} - {group.lectureType === 0 ? "Lecture" : "Practice"}
                      </div>
                      <div className="text-xs truncate">{group.lecturer}</div>
                      <div className="text-xs truncate">{group.room}</div>
                      <div className="text-xs truncate">{group.startTime} - {group.endTime}</div>
                      

                      {/* Fixed hover information panel */}
                      <div 
                         className="absolute z-40 w-64 bg-white shadow-lg p-3 rounded-lg border border-gray-200"
                         style={{ 
                           display: hoveredGroup === group.groupCode ? 'block' : 'none',
                           left: dayIndex < 3 ? '100%' : 'auto',
                           right: dayIndex >= 3 ? '100%' : 'auto',
                           marginLeft: dayIndex < 3 ? '2px' : '0',
                           marginRight: dayIndex >= 3 ? '2px' : '0',
                            top: '0'
                           }}
                        >
                        <div className="font-medium">{course.courseName}</div>
                        <div className="text-xs text-gray-600 mt-1">Code: {course.courseCode}</div>
                        <div className="text-xs text-gray-600 mt-2">Group: {group.groupCode}</div>
                        <div className="text-xs text-gray-600">Lecturer: {group.lecturer}</div>
                        <div className="text-xs text-gray-600">Room: {group.room}</div>
                        <div className="text-xs text-gray-600">
                          Time: {group.startTime} - {group.endTime}
                        </div>
                        <div className="text-xs text-gray-600">
                          Type: {group.lectureType === 0 ? "Lecture" : "Practice"}
                        </div>
                        <div className="text-xs italic text-gray-500 mt-2">
                          {isSelected ? "Click to remove from schedule" : "Click to add to schedule"}
                        </div>
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Course color legend */}
      <div className="mt-4 flex flex-wrap gap-4 justify-start text-sm">
        <div className="mr-4 font-medium">Courses:</div>
        {selectedCourses.map(course => {
          // Get color from our internal color generator
          const defaultColor = { bg: 'rgba(156, 163, 175, 1)', bgLight: 'rgba(156, 163, 175, 0.2)', text: 'rgb(156, 163, 175)' };
          const courseColor = courseColors.get(course.courseCode) || defaultColor;
          
          return (
            <div key={course.courseCode} className="flex items-center">
              <div className="flex space-x-1 mr-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: courseColor.bg }}></div>
                <div className="w-4 h-4 rounded" style={{ 
                  backgroundColor: courseColor.bg.replace('1)', '0.7)'),
                  backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(255,255,255,0.1) 5px, rgba(255,255,255,0.1) 10px)'
                }}></div>
              </div>
              <span className="truncate max-w-40">{course.courseName}</span>
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-gray-600 rounded mr-1"></div>
          <span>Lecture</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-gray-600 rounded mr-1" style={{ 
            backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(255,255,255,0.1) 5px, rgba(255,255,255,0.1) 10px)'
          }}></div>
          <span>Practice</span>
        </div>
        <div className="flex items-center ml-4">
          <span>Solid color = Selected</span>
        </div>
        <div className="flex items-center">
          <span>Transparent = Available</span>
        </div>
      </div>
    </div>
  );
}



