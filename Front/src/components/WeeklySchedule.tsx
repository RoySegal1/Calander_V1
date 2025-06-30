import { Course, CourseGroup } from '../types';
import { useState } from 'react';
import {ImportScheduleModal} from "./ImportScheduleModal.tsx";
import { Trash2, Eye, EyeOff, Save, Download } from 'lucide-react';
import { NameScheduleModal } from "./NameScheduleModal.tsx";
import { useAuth } from './Auth.tsx';

interface WeeklyScheduleProps {
  selectedCourses: Course[];
  selectedGroups: {
    courseId: string;
    groups: CourseGroup[];
  }[];
  onGroupSelect: (group: CourseGroup, courseId: string) => void;
  courseColors: Map<string, { bg: string; bgLight: string; text: string }>;
  onClearSchedule?: () => void;
  onScheduleChosen?: (scheduleName: string) => void;
  handleImportSchedule: (scheduleId: string) => void;
}

export default function WeeklySchedule({
  selectedCourses,
  selectedGroups,
  onGroupSelect,
  courseColors,
  onClearSchedule,
  onScheduleChosen,
  handleImportSchedule,
}: WeeklyScheduleProps) {
  const days = ['יום ראשון', 'יום שני', 'יום שלישי', 'יום רביעי', 'יום חמישי', 'יום שישי'];
  const hours = Array.from({ length: 16 }, (_, i) => i + 8); // 8:00 to 22:00
  const [hoveredGroup, setHoveredGroup] = useState<string | null>(null);
  // State for toggling visibility of unselected courses
  const [showSelectedOnly, setShowSelectedOnly] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const { auth } = useAuth();
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

    // Helper function to add unselected groups for a course
    const addUnselectedGroups = (course: Course, selectedGroupCodes: Set<string>) => {
      course.groups.forEach(group => {
        if (!selectedGroupCodes.has(group.groupCode)) {
          blocks.push({
            course,
            group,
            isSelected: false
          });
        }
      });
    };

    // Add unselected groups based on mode and course state
    selectedCourses.forEach(course => {
      const selectedCourseGroups = selectedGroups.find(sg => sg.courseId === course.courseCode)?.groups || [];
      const selectedGroupCodes = new Set(selectedCourseGroups.map(g => g.groupCode));
      
      // If in "show selected only" mode, check if course has all available types selected
      if (showSelectedOnly) {
        // First, find what types are available for this course
        const availableLectureTypes = new Set(course.groups.map(g => g.lectureType));
        // Then, find what types are currently selected
        const selectedLectureTypes = new Set(selectedCourseGroups.map(g => g.lectureType));
        
        // Check if all available types have been selected
        const hasAllAvailableTypes = [...availableLectureTypes].every(type => selectedLectureTypes.has(type));
        
        // Only add unselected groups if course doesn't have all available types selected
        if (!hasAllAvailableTypes) {
          addUnselectedGroups(course, selectedGroupCodes);
        }
      } else {
        // In normal mode, always add unselected groups
        addUnselectedGroups(course, selectedGroupCodes);
      }
    });

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
    let height = endMinutes - startMinutes;

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
    const right = count > 1 ? `${(95 / count) * index + 2.5}%` : '2.5%'; // Changed from left to right for RTL

    // Get the course color from our internal color generator
    const defaultColor = { bg: 'rgba(156, 163, 175, 1)', bgLight: 'rgba(156, 163, 175, 0.2)', text: 'rgb(156, 163, 175)' };
    const courseColor = courseColors.get(course.courseCode) || defaultColor;

    // Determine if it's a lecture or practice
    const isLecture = group.lectureType === 0;

    // Create an opacity effect for lectures vs practices
    const bgOpacity = isLecture ? 0.9 : 0.7;

    // Set colors based on course, type, and selection state
    const isHovered = hoveredGroup === group.groupCode;
    const textColor = ((isHovered && count>1) || isSelected) ? 'white' : courseColor.text;
    const bgColor = ((isHovered && count>1) || isSelected)
      ? isLecture
        ? courseColor.bg.replace('1)', `${bgOpacity})`) // Darker for lecture
        : courseColor.bg.replace('1)', `${bgOpacity})`) // Slightly lighter for practice
      : courseColor.bgLight; // Even lighter for unselected

    if(height == 50 && isHovered)
        height = 100;

    return {
      position: 'absolute' as const,
      top: `${startMinutes}px`,
      height: `${height}px`,
      width: isHovered ? '95%' : width,
      right, // Changed from left to right for RTL
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
    <div className="bg-white rounded-lg shadow-lg p-4 overflow-auto" dir="rtl">
      {/* Add toggle and clear buttons at the top */}
      <div className="flex justify-start mb-4 gap-2">
        <button
            onClick={handleClearSchedule}
            className="group flex items-center gap-2 px-4 py-2.5 bg-white/10 backdrop-blur-sm text-red-600 border border-red-200/50 rounded-xl font-medium hover:bg-red-50/50 hover:border-red-300/70 active:scale-95 transition-all duration-200"
        >
          <Trash2 size={18} className="group-hover:rotate-12 transition-transform duration-200"/>
          נקה מערכת
        </button>

        <button
            onClick={() => setShowSelectedOnly(!showSelectedOnly)}
            className="group flex items-center gap-2 px-4 py-2.5 bg-white/10 backdrop-blur-sm text-blue-600 border border-blue-200/50 rounded-xl font-medium hover:bg-blue-50/50 hover:border-blue-300/70 active:scale-95 transition-all duration-200"
        >
          {showSelectedOnly ? (
              <>
                <Eye size={18} className="group-hover:scale-110 transition-transform duration-200"/>
                הצג את כל המופעים
              </>
          ) : (
              <>
                <EyeOff size={18} className="group-hover:scale-110 transition-transform duration-200"/>
               הסתר קורסים שהושלמה בהם הבחירה  
              </>
          )}
        </button>
        {auth.isAuthenticated && auth.user && !auth.isGuest && (
        <button
            onClick={() => setShowNameModal(true)}
            className="group flex items-center gap-2 px-4 py-2.5 bg-white/10 backdrop-blur-sm text-green-600 border border-green-200/50 rounded-xl font-medium hover:bg-green-50/50 hover:border-green-300/70 active:scale-95 transition-all duration-200"
        >
          <Save size={18} className="group-hover:scale-110 transition-transform duration-200"/>
          שמור מערכת
        </button>)}

        <button
            onClick={() => setShowModal(true)}
            className="group flex items-center gap-2 px-4 py-2.5 bg-white/10 backdrop-blur-sm text-emerald-600 border border-emerald-200/50 rounded-xl font-medium hover:bg-emerald-50/50 hover:border-emerald-300/70 active:scale-95 transition-all duration-200"
        >
          <Download size={18} className="group-hover:scale-110 transition-transform duration-200"/>
          בחר מערכת לפי מזהה
        </button>
        {showModal && (
            <ImportScheduleModal
                onImport={handleImportSchedule}
                onClose={() => setShowModal(false)}
            />
        )}
          {showNameModal &&  (
        <NameScheduleModal
          onSave={(name) => {
            onScheduleChosen?.(name);  // You can now accept the name
            setShowNameModal(false);
          }}
          onClose={() => setShowNameModal(false)}
        />
      )}
      </div>

      <div className="flex">
        {/* Time bar on the left side */}
        <div className="w-20 shrink-0">
          <div className="h-8"/>
          {/* Header spacer */}
          {hours.map(hour => (
              <div key={hour} className="h-[60px] text-sm text-gray-500 relative -top-3 text-right">
                {getTimeString(hour)}
              </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="flex-1 grid grid-cols-6 gap-2">
          {/* Display days in original order, so Sunday (index 0) is rightmost */}
          {days.map((day, dayIndex) => (
              <div key={day} className="relative">
                <div className="h-8 text-sm font-medium text-gray-700 text-center sticky top-0 bg-white">
                  {day}
                </div>
                <div className="relative h-[960px]"> {/* 16 hours * 60px */}
                  {hours.map(hour => (
                      <div
                          key={hour}
                          className="h-[60px] border-t border-gray-200"
                      />
                  ))}

                  {/* Render all course blocks for this day */}
                  {courseBlocks
                      .filter(block => block.group.dayOfWeek === dayIndex)
                      .map(({course, group, isSelected}) => (
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
                        {group.groupCode} - {group.lectureType === 0 ? "הרצאה" : "תרגול"}
                      </div>
                      <div className="text-xs truncate">{group.lecturer}</div>
                      <div className="text-xs truncate">{group.room}</div>
                      <div className="text-xs truncate">{group.startTime} - {group.endTime}</div>

                      {/* Fixed hover information panel */}
                      <div
                        className="absolute z-40 w-64 bg-white shadow-lg p-3 rounded-lg border border-gray-200"
                        style={{
                          display: hoveredGroup === group.groupCode ? 'block' : 'none',
                          right: dayIndex < 3 ? '100%' : 'auto',
                          left: dayIndex >= 3 ? '100%' : 'auto',
                          marginRight: dayIndex < 3 ? '2px' : '0',
                          marginLeft: dayIndex >= 3 ? '2px' : '0',
                          top: '0'
                        }}
                      >
                        <div className="font-medium">{course.courseName}</div>
                        <div className="text-xs text-gray-600 mt-1">קוד: {course.courseCode}</div>
                        <div className="text-xs text-gray-600 mt-2">קבוצה: {group.groupCode}</div>
                        <div className="text-xs text-gray-600">מרצה: {group.lecturer}</div>
                        <div className="text-xs text-gray-600">חדר: {group.room}</div>
                        <div className="text-xs text-gray-600">
                          זמן: {group.startTime} - {group.endTime}
                        </div>
                        <div className="text-xs text-gray-600">
                          סוג: {group.lectureType === 0 ? "הרצאה" : "תרגול"}
                        </div>
                        <div className="text-xs italic text-gray-500 mt-2">
                          {isSelected ? "לחץ להסרה מהמערכת" : "לחץ להוספה למערכת"}
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
        <div className="mr-4 font-medium">קורסים:</div>
        {selectedCourses.map(course => {
          // Get color from our internal color generator
          const defaultColor = { bg: 'rgba(156, 163, 175, 1)', bgLight: 'rgba(156, 163, 175, 0.2)', text: 'rgb(156, 163, 175)' };
          const courseColor = courseColors.get(course.courseCode) || defaultColor;

          return (
            <div key={course.courseCode} className="flex items-center">
              <div className="flex space-x-1 ml-2">
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
          <div className="w-4 h-4 bg-gray-600 rounded ml-1"></div>
          <span>הרצאה</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-gray-600 rounded ml-1" style={{
            backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(255,255,255,0.1) 5px, rgba(255,255,255,0.1) 10px)'
          }}></div>
          <span>תרגול</span>
        </div>
        <div className="flex items-center mr-4">
          <span>צבע מלא = נבחר</span>
        </div>
        <div className="flex items-center">
          <span>צבע שקוף = זמין</span>
        </div>
      </div>
    </div>
  );
}


