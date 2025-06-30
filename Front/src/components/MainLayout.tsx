import { useState, useMemo, useEffect } from 'react';
import { Course, CourseGroup, AuthState, SavedSchedule } from '../types';
import { ApiService } from './Api';
import WeeklySchedule from './WeeklySchedule';
import Sidebar from './Sidebar';
import ProgressTracker from './ProgressTracker';
import toast from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';


interface SelectedCourseGroups {
  courseId: string;
  groups: CourseGroup[];
}

interface MainLayoutProps {
  auth: AuthState;
  onLogout: () => void;
}

export default function MainLayout({ auth, onLogout }: MainLayoutProps) {
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<SelectedCourseGroups[]>([]);
  const [filters, setFilters] = useState({
    department: auth.isAuthenticated && auth.user?.department ? auth.user.department : 'מדעי המחשב', // default to CS
    type: '',
    semester: 'א',
  });
  const [allStudentSchedule, setAllStudentSchedule] = useState<SavedSchedule[]>([]);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isFreeFormMode, setIsFreeFormMode] = useState(false);
  // Fetch student schedules
  useEffect(() => {
    const fetchStudentSchedules = async () => {
      if (auth.user?.id) {
        try {
          const data = await ApiService.fetchStudentSchedules(auth.user.id);
          setAllStudentSchedule(data);
        } catch (error) {
          console.error("Error fetching student schedules:", error);
        }
      }
    };
    fetchStudentSchedules();
  }, [auth.user?.id,refreshTrigger]);

  // Update filters when user changes
  useEffect(() => {
    // Load saved courses for logged-in users
    if (auth.isAuthenticated && auth.user?.saved_courses && auth.user.saved_courses.length > 0) {
      setSelectedCourses(auth.user.saved_courses);
    }
  }, [auth.user, auth.isAuthenticated]);

  // Fetch course data based on department
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const courses = await ApiService.fetchCourses(filters.department);
        setAllCourses(courses);
      } catch (error) {
        console.error('Error fetching courses:', error);
      }
    };

    fetchCourses();
  }, [filters.department]);

  const filteredCourses = allCourses.filter(course => {
    if (filters.type && course.courseType !== filters.type) return false;
    return !(filters.semester && course.semester !== filters.semester);

  });

  const selectedCourseObjects = selectedCourses
    .map(id => allCourses.find(c => c.courseCode === id))
    .filter(course => course !== undefined) as Course[];

  const courseColors = useMemo(() => {
    const baseColors = [
      { name: 'indigo', bg: 'rgba(79, 70, 229, 1)', bgLight: 'rgba(79, 70, 229, 0.2)', text: 'rgb(79, 70, 229)' },
      { name: 'blue', bg: 'rgba(37, 99, 235, 1)', bgLight: 'rgba(37, 99, 235, 0.2)', text: 'rgb(37, 99, 235)' },
      { name: 'amber', bg: 'rgba(245, 158, 11, 1)', bgLight: 'rgba(245, 158, 11, 0.2)', text: 'rgb(245, 158, 11)' },
      { name: 'rose', bg: 'rgba(225, 29, 72, 1)', bgLight: 'rgba(225, 29, 72, 0.2)', text: 'rgb(225, 29, 72)' },
      { name: 'emerald', bg: 'rgba(16, 185, 129, 1)', bgLight: 'rgba(16, 185, 129, 0.2)', text: 'rgb(16, 185, 129)' },
      { name: 'violet', bg: 'rgba(139, 92, 246, 1)', bgLight: 'rgba(139, 92, 246, 0.2)', text: 'rgb(139, 92, 246)' },
      { name: 'cyan', bg: 'rgba(6, 182, 212, 1)', bgLight: 'rgba(6, 182, 212, 0.2)', text: 'rgb(6, 182, 212)' },
      { name: 'fuchsia', bg: 'rgba(192, 38, 211, 1)', bgLight: 'rgba(192, 38, 211, 0.2)', text: 'rgb(192, 38, 211)' },
      { name: 'lime', bg: 'rgba(132, 204, 22, 1)', bgLight: 'rgba(132, 204, 22, 0.2)', text: 'rgb(132, 204, 22)' },
      { name: 'sky', bg: 'rgba(14, 165, 233, 1)', bgLight: 'rgba(14, 165, 233, 0.2)', text: 'rgb(14, 165, 233)' },
    ];

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

  const handleScheduleChosen = async (scheduleName: string) => {
    if (!auth.user?.id) {
      toast.error("User not authenticated");
      return;
    }

    const scheduleData = selectedGroups.map(sg => ({
      courseCode: sg.courseId,
      groups: sg.groups.map(g => g.groupCode),
    }));

    try {
      await ApiService.saveSchedule(auth.user.id, scheduleData,scheduleName);
      toast.success("Schedule saved to backend!");
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error("Failed to save schedule:", error);
      toast.error("Failed to save schedule. Please try again.");
    }
  };

  const handleImportScheduleFromId = async (scheduleId: string) => {
    try {
      const data = await ApiService.importScheduleById(scheduleId);
      const parsedData = data.schedule_data;

      const importedCourses = parsedData.map((item: { courseCode: string }) => item.courseCode);

      const importedGroups = parsedData.map((item: { courseCode: string; groups: string[] }) => ({
        courseId: item.courseCode,
        groups: item.groups.map(groupCode => {
          const course = allCourses.find(c => c.courseCode === item.courseCode);
          return course?.groups.find(g => g.groupCode === groupCode);
        }).filter(Boolean) as CourseGroup[],
      }));

      setSelectedCourses(importedCourses);
      setSelectedGroups(importedGroups);

    } catch (error) {
      console.error("Failed to load schedule by ID:", error);
       toast.error("Could not load schedule. Check the ID and try again.");
    }
  };

  const handleCourseSelect = (course: Course) => {
    if (selectedCourses.includes(course.courseCode)) {
      setSelectedCourses(selectedCourses.filter(id => id !== course.courseCode));
      setSelectedGroups(selectedGroups.filter(sg => sg.courseId !== course.courseCode));
    } else {
      setSelectedCourses([...selectedCourses, course.courseCode]);
    }
  };
//
// const handleGroupSelect = (group: CourseGroup, courseId: string) => {
//   const courseGroups = selectedGroups.find(sg => sg.courseId === courseId);
//
//   // Check if this specific group is already selected
//   if (courseGroups?.groups.some(g => g.groupCode === group.groupCode)) {
//     // Remove this specific group
//     const updatedGroups = courseGroups.groups.filter(g => g.groupCode !== group.groupCode);
//
//     if (updatedGroups.length === 0) {
//       setSelectedGroups(selectedGroups.filter(sg => sg.courseId !== courseId));
//     } else {
//       setSelectedGroups(selectedGroups.map(sg =>
//         sg.courseId === courseId ? { ...sg, groups: updatedGroups } : sg
//       ));
//     }
//     return;
//   }
//
//   // Try to add the group (conflicts will be checked in addGroupToCourse)
//   addGroupToCourse(group, courseId);
// };
//
//
// const addGroupToCourse = (group: CourseGroup, courseId: string) => {
//   let groupsToAdd: CourseGroup[] = [];
//
//   if (isFreeFormMode) {
//     // Free form mode - just the single group
//     groupsToAdd = [group];
//   } else {
//     // Regular mode - get all matching groups (lecture + practice set)
//     const courseCode = group.groupCode.includes('/')
//       ? group.groupCode.split('/')[0]
//       : group.groupCode.split('_')[0]; // Handle both "/" and "_" separators
//
//     groupsToAdd = allCourses
//       .find(course => course.courseCode === courseId)
//       ?.groups.filter(g => g.groupCode.startsWith(courseCode)) || [];
//   }
//
//   // Check time conflicts for ALL groups that would be added
//   const hasConflict = groupsToAdd.some(newGroup =>
//     selectedGroups.some(sg =>
//       sg.courseId !== courseId && // Only check different courses
//       sg.groups.some(existingGroup =>
//         existingGroup.dayOfWeek === newGroup.dayOfWeek &&
//         (
//           (parseInt(newGroup.startTime.split(':')[0]) < parseInt(existingGroup.endTime.split(':')[0]) ||
//            (parseInt(newGroup.startTime.split(':')[0]) === parseInt(existingGroup.endTime.split(':')[0]) &&
//             parseInt(newGroup.startTime.split(':')[1]) < parseInt(existingGroup.endTime.split(':')[1]))) &&
//           (parseInt(newGroup.endTime.split(':')[0]) > parseInt(existingGroup.startTime.split(':')[0]) ||
//            (parseInt(newGroup.endTime.split(':')[0]) === parseInt(existingGroup.startTime.split(':')[0]) &&
//             parseInt(newGroup.endTime.split(':')[1]) > parseInt(existingGroup.startTime.split(':')[1])))
//         )
//       )
//     )
//   );
//
//   if (hasConflict) {
//     toast.error("קונפליקט זמן! אחת או יותר מהקבוצות חופפות לקבוצות שכבר נבחרו");
//     return;
//   }
//
//   // No conflicts, proceed with adding
//   if (isFreeFormMode) {
//     const courseGroups = selectedGroups.find(sg => sg.courseId === courseId);
//
//     if (courseGroups) {
//       const existingGroupOfSameType = courseGroups.groups.find(g => g.lectureType === group.lectureType);
//
//       if (existingGroupOfSameType) {
//         setSelectedGroups(selectedGroups.map(sg =>
//           sg.courseId === courseId
//             ? {
//                 ...sg,
//                 groups: [
//                   ...sg.groups.filter(g => g.lectureType !== group.lectureType),
//                   group
//                 ]
//               }
//             : sg
//         ));
//       } else {
//         setSelectedGroups(selectedGroups.map(sg =>
//           sg.courseId === courseId
//             ? { ...sg, groups: [...sg.groups, group] }
//             : sg
//         ));
//       }
//     } else {
//       setSelectedGroups([...selectedGroups, { courseId, groups: [group] }]);
//     }
//   } else {
//     const courseGroups = selectedGroups.find(sg => sg.courseId === courseId);
//
//     if (courseGroups) {
//       setSelectedGroups(selectedGroups.map(sg =>
//         sg.courseId === courseId
//           ? { ...sg, groups: groupsToAdd }
//           : sg
//       ));
//     } else {
//       setSelectedGroups([...selectedGroups, { courseId, groups: groupsToAdd }]);
//     }
//   }
// };
//

const handleGroupSelect = (group: CourseGroup, courseId: string) => {
  const courseGroups = selectedGroups.find(sg => sg.courseId === courseId);

  if (isFreeFormMode) {
    // In free form mode, handle by lecture type and base code
    const clickedLectureType = group.lectureType;
    const baseCode = group.groupCode.includes('/')
      ? group.groupCode.split('/')[0]
      : group.groupCode.split('_')[0];

    if (clickedLectureType === 1) {
      // Practice clicked - check if any practice is selected
      const hasAnyPractice = courseGroups?.groups.some(g => g.lectureType === 1);

      if (hasAnyPractice) {
        // Remove all practice groups
        const updatedGroups = courseGroups!.groups.filter(g => g.lectureType !== 1);

        if (updatedGroups.length === 0) {
          setSelectedGroups(selectedGroups.filter(sg => sg.courseId !== courseId));
        } else {
          setSelectedGroups(selectedGroups.map(sg =>
            sg.courseId === courseId ? { ...sg, groups: updatedGroups } : sg
          ));
        }
        return;
      }
    } else {
      // Lecturer clicked - check if any lecturer with this base code is selected
      const hasLecturerWithSameBase = courseGroups?.groups.some(g => {
        if (g.lectureType !== 0) return false;
        const gBaseCode = g.groupCode.includes('/')
          ? g.groupCode.split('/')[0]
          : g.groupCode.split('_')[0];
        return gBaseCode === baseCode;
      });

      if (hasLecturerWithSameBase) {
        // Remove all lecturer groups with the same base code
        const updatedGroups = courseGroups!.groups.filter(g => {
          if (g.lectureType !== 0) return true; // Keep practice groups
          const gBaseCode = g.groupCode.includes('/')
            ? g.groupCode.split('/')[0]
            : g.groupCode.split('_')[0];
          return gBaseCode !== baseCode;
        });

        if (updatedGroups.length === 0) {
          setSelectedGroups(selectedGroups.filter(sg => sg.courseId !== courseId));
        } else {
          setSelectedGroups(selectedGroups.map(sg =>
            sg.courseId === courseId ? { ...sg, groups: updatedGroups } : sg
          ));
        }
        return;
      }
    }
  } else {
    // Regular mode - handle by base code as before
    const baseCode = group.groupCode.includes('/')
      ? group.groupCode.split('/')[0]
      : group.groupCode.split('_')[0];

    const hasGroupWithSameBase = courseGroups?.groups.some(g => {
      const gBaseCode = g.groupCode.includes('/')
        ? g.groupCode.split('/')[0]
        : g.groupCode.split('_')[0];
      return gBaseCode === baseCode;
    });

    if (hasGroupWithSameBase) {
      // Remove all groups with the same base code
      const updatedGroups = courseGroups!.groups.filter(g => {
        const gBaseCode = g.groupCode.includes('/')
          ? g.groupCode.split('/')[0]
          : g.groupCode.split('_')[0];
        return gBaseCode !== baseCode;
      });

      if (updatedGroups.length === 0) {
        setSelectedGroups(selectedGroups.filter(sg => sg.courseId !== courseId));
      } else {
        setSelectedGroups(selectedGroups.map(sg =>
          sg.courseId === courseId ? { ...sg, groups: updatedGroups } : sg
        ));
      }
      return;
    }
  }

  // Try to add the group (conflicts will be checked in addGroupToCourse)
  addGroupToCourse(group, courseId);
};

const addGroupToCourse = (group: CourseGroup, courseId: string) => {
  const baseCode = group.groupCode.includes('/')
    ? group.groupCode.split('/')[0]
    : group.groupCode.split('_')[0];

  const course = allCourses.find(course => course.courseCode === courseId);
  if (!course) return;

  let groupsToAdd: CourseGroup[] = [];

  if (isFreeFormMode) {
    // Free form mode - handle differently for practice vs lecturer
    if (group.lectureType === 1) {
      // Practice - add only the specific practice group
      groupsToAdd = [group];
    } else {
      // Lecturer - add all instances with the same base code (all lecturer instances)
      groupsToAdd = course.groups.filter(g => {
        const gBaseCode = g.groupCode.includes('/')
          ? g.groupCode.split('/')[0]
          : g.groupCode.split('_')[0];
        return gBaseCode === baseCode && g.lectureType === 0;
      });
    }
  } else {
    // Regular mode - get all matching groups (lecture + practice set)
    groupsToAdd = course.groups.filter(g => g.groupCode.startsWith(baseCode));
  }

  // Check time conflicts for ALL groups that would be added
  const hasConflict = groupsToAdd.some(newGroup =>
    selectedGroups.some(sg =>
      sg.courseId !== courseId && // Only check different courses
      sg.groups.some(existingGroup =>
        existingGroup.dayOfWeek === newGroup.dayOfWeek &&
        (
          (parseInt(newGroup.startTime.split(':')[0]) < parseInt(existingGroup.endTime.split(':')[0]) ||
           (parseInt(newGroup.startTime.split(':')[0]) === parseInt(existingGroup.endTime.split(':')[0]) &&
            parseInt(newGroup.startTime.split(':')[1]) < parseInt(existingGroup.endTime.split(':')[1]))) &&
          (parseInt(newGroup.endTime.split(':')[0]) > parseInt(existingGroup.startTime.split(':')[0]) ||
           (parseInt(newGroup.endTime.split(':')[0]) === parseInt(existingGroup.startTime.split(':')[0]) &&
            parseInt(newGroup.endTime.split(':')[1]) > parseInt(existingGroup.startTime.split(':')[1])))
        )
      )
    )
  );

  if (hasConflict) {
    toast.error("קונפליקט זמן! אחת או יותר מהקבוצות חופפות לקבוצות שכבר נבחרו");
    return;
  }

  // No conflicts, proceed with adding
  const courseGroups = selectedGroups.find(sg => sg.courseId === courseId);

  if (isFreeFormMode) {
    if (courseGroups) {
      let updatedGroups = [...courseGroups.groups];

      if (group.lectureType === 1) {
        // Practice - replace any existing practice
        updatedGroups = updatedGroups.filter(g => g.lectureType !== 1);
        updatedGroups.push(...groupsToAdd);
      } else {
        // Lecturer - replace any existing lecturer groups
        updatedGroups = updatedGroups.filter(g => g.lectureType !== 0);
        updatedGroups.push(...groupsToAdd);
      }

      setSelectedGroups(selectedGroups.map(sg =>
        sg.courseId === courseId
          ? { ...sg, groups: updatedGroups }
          : sg
      ));
    } else {
      setSelectedGroups([...selectedGroups, { courseId, groups: groupsToAdd }]);
    }
  } else {
    // Regular mode - replace all groups for the course
    if (courseGroups) {
      setSelectedGroups(selectedGroups.map(sg =>
        sg.courseId === courseId
          ? { ...sg, groups: groupsToAdd }
          : sg
      ));
    } else {
      setSelectedGroups([...selectedGroups, { courseId, groups: groupsToAdd }]);
    }
  }
};

const handleToggleFreeForm = () => {
  setIsFreeFormMode(!isFreeFormMode);
  if (!isFreeFormMode) {
    toast("בחירה חופשית !! - אתם עלולים לא להיות מסוגלים להירשם לקורסים בתצורה זו", {
      icon: '⚠️',
      duration: 6000,
    });
  }
};



  const uniqueCourseTypes = useMemo(() => {
    return Array.from(new Set(allCourses.map(course => course.courseType)));
  }, [allCourses]);

  return (
    <div className="h-screen w-full flex flex-col md:flex-row overflow-hidden bg-gray-100">
       <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
          },
          error: {
            duration: 4000,
          },
        }}
      />
      {/* Main content - LEFT */}
      <div className="flex-1 p-2 md:p-4 overflow-auto">
        <div className="h-full flex flex-col">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 md:mb-4">
            <h2 className="text-xl md:text-2xl font-semibold text-gray-800 text-center w-full">
            מערכת שבועית
            </h2>
            {auth.isAuthenticated && auth.user && (
              <div className="text-sm text-gray-600 mt-2 sm:mt-0 flex items-center ">
              <span className="italic whitespace-nowrap">Logged in as: {auth.user.username}</span>
              <button onClick={onLogout} className="ml-4 text-red-600 hover:text-red-800">Logout</button>
              </div>
            )}
            {auth.isGuest && (
              <div className="text-sm text-gray-600 mt-2 sm:mt-0 flex items-center">
                <span className="italic whitespace-nowrap">Guest Mode</span>
              </div>
            )}
          </div>

          <div className="flex-grow">
            <WeeklySchedule
              selectedCourses={selectedCourseObjects}
              selectedGroups={selectedGroups}
              onGroupSelect={handleGroupSelect}
              courseColors={courseColors}
              onClearSchedule={handleClearSchedule}
              onScheduleChosen={handleScheduleChosen}
              handleImportSchedule={handleImportScheduleFromId}
              isFreeFormMode={isFreeFormMode}
              onToggleFreeForm={handleToggleFreeForm}
            />
          </div>

          {auth.isAuthenticated && auth.user && !auth.isGuest && (
            <div className="mt-4 p-4 bg-white rounded-lg shadow-md">
              <ProgressTracker user={auth.user} savedSchedules={allStudentSchedule} onSelectSchedule={(s) => handleImportScheduleFromId(s.share_code) } setSchedule={setAllStudentSchedule} />
            </div>
          )}
        </div>
      </div>
  
      {/* Sidebar - RIGHT */}
        <Sidebar
          courses={filteredCourses}
          selectedCourses={selectedCourses}
          onCourseSelect={handleCourseSelect}
          filters={filters}
          onFilterChange={setFilters}
          courseColors={courseColors}
          uniqueCourseTypes={uniqueCourseTypes}
        />
      </div>
  );
}