
import { Course, CourseGroup } from '../types';

interface WeeklyScheduleProps {
  selectedCourses: Course[];
  selectedGroups: {
    courseId: string;
    groups: CourseGroup[];
  }[];
  onGroupSelect: (group: CourseGroup, courseId: string) => void;
}

export default function WeeklySchedule({ 
  selectedCourses,
  selectedGroups,
  onGroupSelect,
}: WeeklyScheduleProps) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const hours = Array.from({ length: 14 }, (_, i) => i + 8); // 8:00 to 21:00

  const getTimeString = (hour: number) => `${hour.toString().padStart(2, '0')}:00`;



  const getGroupStyle = (group: CourseGroup, courseId: string, isSelected: boolean = false, conflictCount: number = 1, conflictIndex: number = 0) => {
    const startHour = parseInt(group.startTime.split(':')[0]);
    const endHour = parseInt(group.endTime.split(':')[0]);
    const startMinutes = parseInt(group.startTime.split(':')[1]);
    const endMinutes = parseInt(group.endTime.split(':')[1]);
    
    const top = (startHour - 8) * 60 + startMinutes;
    const height = (endHour - startHour) * 60 + (endMinutes - startMinutes);
    const width = conflictCount > 1 ? `${90 / conflictCount}%` : '90%';
    const left = conflictCount > 1 ? `${(90 / conflictCount) * conflictIndex + 5}%` : '5%';

    const courseGroups = selectedGroups.find(sg => sg.courseId === courseId);
    const hasLectureOrLecturePractice = courseGroups?.groups.some(
      g => g.lectureType === 'Lecture' || g.lectureType === 'Lecture+Practice'
    );
    const hasPractice = courseGroups?.groups.some(g => g.lectureType === 'Practice');
    const isComplete = hasLectureOrLecturePractice && hasPractice;

    return {
      position: 'absolute' as const,
      top: `${top}px`,
      height: `${height}px`,
      width,
      left,
      backgroundColor: isSelected 
        ? 'rgba(99, 102, 241, 0.8)' 
        : isComplete 
          ? 'rgba(99, 102, 241, 0.1)'
          : 'rgba(99, 102, 241, 0.2)',
      borderRadius: '0.5rem',
      padding: '0.5rem',
      color: isSelected ? 'white' : 'rgb(79, 70, 229)',
      fontSize: '0.875rem',
      overflow: 'hidden',
      transition: 'all 0.2s ease-in-out',
      cursor: isComplete && !isSelected ? 'not-allowed' : 'pointer',
      opacity: isComplete && !isSelected ? 0.5 : 1,
    };
  };

  const getConflictingGroups = (dayIndex: number, startTime: string, endTime: string, courseId: string) => {
    const course = selectedCourses.find(c => c.id === courseId);
    if (!course) return [];
    
    return course.Groups.filter(group => {
      if (group.dayOfWeek !== dayIndex) return false;
      
      const groupStart = parseInt(group.startTime.replace(':', ''));
      const groupEnd = parseInt(group.endTime.replace(':', ''));
      const timeStart = parseInt(startTime.replace(':', ''));
      const timeEnd = parseInt(endTime.replace(':', ''));
      
      return (groupStart >= timeStart && groupStart < timeEnd) ||
             (groupEnd > timeStart && groupEnd <= timeEnd) ||
             (groupStart <= timeStart && groupEnd >= timeEnd);
    });
  };

  const isGroupSelected = (group: CourseGroup, courseId: string) => {
    return selectedGroups.some(sg => 
      sg.courseId === courseId && 
      sg.groups.some(g => g.GroupsCode === group.GroupsCode)
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 overflow-auto">
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
              <div className="relative h-[840px]"> {/* 14 hours * 60px */}
                {hours.map(hour => (
                  <div
                    key={hour}
                    className="h-[60px] border-t border-gray-100"
                  />
                ))}
                {selectedCourses.map(course => 
                  course.Groups.map(group => {
                    if (group.dayOfWeek !== dayIndex) return null;
                    
                    const conflictingGroups = getConflictingGroups(dayIndex, group.startTime, group.endTime, course.id);
                    const conflictIndex = conflictingGroups.findIndex(g => g.GroupsCode === group.GroupsCode);
                    const isSelected = isGroupSelected(group, course.id);
                    
                    return (
                      <div
                        key={`${course.id}-${group.GroupsCode}`}
                        style={getGroupStyle(group, course.id, isSelected, conflictingGroups.length, conflictIndex)}
                        onClick={() => onGroupSelect(group, course.id)}
                        className="hover:shadow-lg"
                      >
                        <div className="font-medium">{course.name}</div>
                        <div className="text-xs">{group.GroupsCode} - {group.lectureType}</div>
                        <div className="text-xs">{group.lecturer}</div>
                        <div className="text-xs">
                          {group.building} - {group.classNumber}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}