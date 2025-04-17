// // MainLayout.tsx - fully adapted to load courses from backend by department
//
// import { useState, useMemo, useEffect } from 'react';
// import axios from 'axios';
// import { Course, CourseGroup } from '../types';
// import WeeklySchedule from './WeeklySchedule';
// import Sidebar from './Sidebar';
// import ProgressTracker from './ProgressTracker';
//
// interface SelectedCourseGroups {
//   courseId: string;
//   groups: CourseGroup[];
// }
//
// export default function MainLayout() {
//   const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
//   const [selectedGroups, setSelectedGroups] = useState<SelectedCourseGroups[]>([]);
//   const [filters, setFilters] = useState({
//     department: 'מדעי המחשב', // default to CS
//     type: '',
//     semester: 'א',
//   });
//
//   const [allCourses, setAllCourses] = useState<Course[]>([]);
//
//   // Fetch course data based on department
//   useEffect(() => {
//     const fetchCourses = async () => {
//       try {
//       const frontendToBackendMap: Record<string, string> = {
//         'מדעי המחשב': 'מדעי המחשב',
//         'הנדסת חשמל': 'הנדסת חשמל',
//         'הנדסה תעשייה וניהול': 'הנדסת תעשיה וניהול',
//        // 'הנדסה מכנית': 'הנדסה מכנית',
//        // 'הנדסה ביורפואית': 'הנדסה ביורפואית',
//         //'הנדסת תוכנה': 'הנדסת תוכנה',
//         'מדעי הנתונים': 'מדעי הנתונים',
//       };
//
//         const backendDept = frontendToBackendMap[filters.department];
//         const response = await axios.get<Course[]>(
//           `http://localhost:8000/courses?department=${backendDept}`
//         );
//
//         setAllCourses(response.data);
//       } catch (error) {
//         console.error('Error fetching courses:', error);
//       }
//     };
//
//     fetchCourses();
//   }, [filters.department]);
//
//   const filteredCourses = allCourses.filter(course => {
//     if (filters.type && course.courseType !== filters.type) return false;
//     if (filters.semester && course.semester !== filters.semester) return false;
//     return true;
//   });
//
//   const selectedCourseObjects = selectedCourses
//     .map(id => allCourses.find(c => c.courseCode === id))
//     .filter(course => course !== undefined) as Course[];
//
//   const courseColors = useMemo(() => {
//     const baseColors = [
//       { name: 'indigo', bg: 'rgba(79, 70, 229, 1)', bgLight: 'rgba(79, 70, 229, 0.2)', text: 'rgb(79, 70, 229)' },
//       { name: 'teal', bg: 'rgba(20, 184, 166, 1)', bgLight: 'rgba(20, 184, 166, 0.2)', text: 'rgb(20, 184, 166)' },
//       { name: 'amber', bg: 'rgba(245, 158, 11, 1)', bgLight: 'rgba(245, 158, 11, 0.2)', text: 'rgb(245, 158, 11)' },
//       { name: 'rose', bg: 'rgba(225, 29, 72, 1)', bgLight: 'rgba(225, 29, 72, 0.2)', text: 'rgb(225, 29, 72)' },
//       { name: 'emerald', bg: 'rgba(16, 185, 129, 1)', bgLight: 'rgba(16, 185, 129, 0.2)', text: 'rgb(16, 185, 129)' },
//       { name: 'violet', bg: 'rgba(139, 92, 246, 1)', bgLight: 'rgba(139, 92, 246, 0.2)', text: 'rgb(139, 92, 246)' },
//       { name: 'cyan', bg: 'rgba(6, 182, 212, 1)', bgLight: 'rgba(6, 182, 212, 0.2)', text: 'rgb(6, 182, 212)' },
//       { name: 'fuchsia', bg: 'rgba(192, 38, 211, 1)', bgLight: 'rgba(192, 38, 211, 0.2)', text: 'rgb(192, 38, 211)' },
//       { name: 'lime', bg: 'rgba(132, 204, 22, 1)', bgLight: 'rgba(132, 204, 22, 0.2)', text: 'rgb(132, 204, 22)' },
//       { name: 'sky', bg: 'rgba(14, 165, 233, 1)', bgLight: 'rgba(14, 165, 233, 0.2)', text: 'rgb(14, 165, 233)' },
//     ];
//
//     const colorMap = new Map<string, typeof baseColors[0]>();
//     selectedCourses.forEach((courseId, index) => {
//       colorMap.set(courseId, baseColors[index % baseColors.length]);
//     });
//
//     return colorMap;
//   }, [selectedCourses]);
//
//   const handleClearSchedule = () => {
//     setSelectedCourses([]);
//     setSelectedGroups([]);
//   };
//
//   const handleScheduleChosen = () => {
//     const schedule = selectedGroups.map(sg => {
//       const course = allCourses.find(c => c.courseCode === sg.courseId);
//       return {
//         courseName: course?.courseName,
//         courseCode: sg.courseId,
//         groups: sg.groups.map(g => ({
//           groupCode: g.groupCode,
//           lecturer: g.lecturer,
//           room: g.room,
//           dayOfWeek: g.dayOfWeek,
//           startTime: g.startTime,
//           endTime: g.endTime,
//           lectureType: g.lectureType,
//         }))
//       };
//     });
//
//     console.log("Selected Schedule:", schedule);
//     alert("Schedule chosen! Check console for details.");
//   };
//
//   const handleCourseSelect = (course: Course) => {
//     if (selectedCourses.includes(course.courseCode)) {
//       setSelectedCourses(selectedCourses.filter(id => id !== course.courseCode));
//       setSelectedGroups(selectedGroups.filter(sg => sg.courseId !== course.courseCode));
//     } else {
//       setSelectedCourses([...selectedCourses, course.courseCode]);
//     }
//   };
//
//   const handleGroupSelect = (group: CourseGroup, courseId: string) => {
//     const courseGroups = selectedGroups.find(sg => sg.courseId === courseId);
//
//     if (courseGroups?.groups.some(g => g.groupCode === group.groupCode)) {
//       const updatedGroups = courseGroups.groups.filter(g => g.groupCode !== group.groupCode);
//
//       if (updatedGroups.length === 0) {
//         setSelectedGroups(selectedGroups.filter(sg => sg.courseId !== courseId));
//       } else {
//         setSelectedGroups(selectedGroups.map(sg =>
//           sg.courseId === courseId ? { ...sg, groups: updatedGroups } : sg
//         ));
//       }
//       return;
//     }
//
//     const hasConflict = selectedGroups.some(sg =>
//       sg.groups.some(g =>
//         g.dayOfWeek === group.dayOfWeek &&
//         (
//           (parseInt(group.startTime.split(':')[0]) < parseInt(g.endTime.split(':')[0]) ||
//            (parseInt(group.startTime.split(':')[0]) === parseInt(g.endTime.split(':')[0]) &&
//             parseInt(group.startTime.split(':')[1]) < parseInt(g.endTime.split(':')[1]))) &&
//           (parseInt(group.endTime.split(':')[0]) > parseInt(g.startTime.split(':')[0]) ||
//            (parseInt(group.endTime.split(':')[0]) === parseInt(g.startTime.split(':')[0]) &&
//             parseInt(group.endTime.split(':')[1]) > parseInt(g.startTime.split(':')[1])))
//         )
//       )
//     );
//
//     if (hasConflict) {
//       console.log("Time conflict detected!");
//       return;
//     }
//
//     addGroupToCourse(group, courseId);
//   };
//
//   const addGroupToCourse = (group: CourseGroup, courseId: string) => {
//     const courseGroups = selectedGroups.find(sg => sg.courseId === courseId);
//
//     const isDuplicateType = courseGroups?.groups.some(g => g.lectureType === group.lectureType);
//
//     if (isDuplicateType) {
//       setSelectedGroups(selectedGroups.map(sg =>
//         sg.courseId === courseId ? {
//           ...sg,
//           groups: [...sg.groups.filter(g => g.lectureType !== group.lectureType), group]
//         } : sg
//       ));
//     } else if (courseGroups) {
//       setSelectedGroups(selectedGroups.map(sg =>
//         sg.courseId === courseId ? { ...sg, groups: [...sg.groups, group] } : sg
//       ));
//     } else {
//       setSelectedGroups([...selectedGroups, { courseId, groups: [group] }]);
//     }
//   };
//
//   return (
//     <div className="min-h-screen bg-gray-100 flex">
//       <Sidebar
//         courses={filteredCourses}
//         selectedCourses={selectedCourses}
//         onCourseSelect={handleCourseSelect}
//         filters={filters}
//         onFilterChange={setFilters}
//         courseColors={courseColors}
//       />
//
//       <div className="flex-1 p-6 overflow-auto">
//         <div className="max-w-5xl mx-auto space-y-6">
//           <h2 className="text-2xl font-semibold text-gray-800">Weekly Schedule</h2>
//           <WeeklySchedule
//             selectedCourses={selectedCourseObjects}
//             selectedGroups={selectedGroups}
//             onGroupSelect={handleGroupSelect}
//             courseColors={courseColors}
//             onClearSchedule={handleClearSchedule}
//             onScheduleChosen={handleScheduleChosen}
//           />
//           <ProgressTracker />
//         </div>
//       </div>
//     </div>
//   );
// }











import { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import { Course, CourseGroup, AuthState } from '../types';
import WeeklySchedule from './WeeklySchedule';
import Sidebar from './Sidebar';
import ProgressTracker from './ProgressTracker';

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
    department: 'מדעי המחשב', // default to CS
    type: '',
    semester: 'א',
  });

  const [allCourses, setAllCourses] = useState<Course[]>([]);

  // Update filters when user changes
  useEffect(() => {
    // if (auth.user?.department) {
    //   setFilters(prev => ({
    //     ...prev,
    //     department: auth.user.department
    //   }));
    // }

    // Load saved courses for logged-in users
    if (auth.isAuthenticated && auth.user?.saved_courses && auth.user.saved_courses.length > 0) {
      setSelectedCourses(auth.user.saved_courses);
    }
  }, [auth.user, auth.isAuthenticated]);

  // Fetch course data based on department
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const frontendToBackendMap: Record<string, string> = {
          'מדעי המחשב': 'מדעי המחשב',
          'הנדסת חשמל': 'הנדסת חשמל',
          'הנדסה תעשייה וניהול': 'הנדסת תעשיה וניהול',
          'מדעי הנתונים': 'מדעי הנתונים',
        };

        const backendDept = frontendToBackendMap[filters.department];
        const response = await axios.get<Course[]>(
          `http://localhost:8000/courses?department=${backendDept}&generalcourses=true`
        );

        setAllCourses(response.data);
      } catch (error) {
        console.error('Error fetching courses:', error);
      }
    };

    fetchCourses();
  }, [filters.department]);

  const filteredCourses = allCourses.filter(course => {
    if (filters.type && course.courseType !== filters.type) return false;
    if (filters.semester && course.semester !== filters.semester) return false;
    return true;
  });

  const selectedCourseObjects = selectedCourses
    .map(id => allCourses.find(c => c.courseCode === id))
    .filter(course => course !== undefined) as Course[];

  const courseColors = useMemo(() => {
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
    // Save schedule for logged-in users
    if (auth.isAuthenticated && auth.user) {
      // Here you would implement saving to backend
      console.log("Saving schedule for user:", auth.user.username);
    }

    const schedule = selectedGroups.map(sg => {
      const course = allCourses.find(c => c.courseCode === sg.courseId);
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
    alert("Schedule chosen! Check console for details.");
  };

  const handleCourseSelect = (course: Course) => {
    if (selectedCourses.includes(course.courseCode)) {
      setSelectedCourses(selectedCourses.filter(id => id !== course.courseCode));
      setSelectedGroups(selectedGroups.filter(sg => sg.courseId !== course.courseCode));
    } else {
      setSelectedCourses([...selectedCourses, course.courseCode]);
    }
  };

  const handleGroupSelect = (group: CourseGroup, courseId: string) => {
    const courseGroups = selectedGroups.find(sg => sg.courseId === courseId);

    if (courseGroups?.groups.some(g => g.groupCode === group.groupCode)) {
      const updatedGroups = courseGroups.groups.filter(g => g.groupCode !== group.groupCode);

      if (updatedGroups.length === 0) {
        setSelectedGroups(selectedGroups.filter(sg => sg.courseId !== courseId));
      } else {
        setSelectedGroups(selectedGroups.map(sg =>
          sg.courseId === courseId ? { ...sg, groups: updatedGroups } : sg
        ));
      }
      return;
    }

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
      )
    );

    if (hasConflict) {
      console.log("Time conflict detected!");
      return;
    }

    addGroupToCourse(group, courseId);
  };

  const addGroupToCourse = (group: CourseGroup, courseId: string) => {
    const courseGroups = selectedGroups.find(sg => sg.courseId === courseId);

    const isDuplicateType = courseGroups?.groups.some(g => g.lectureType === group.lectureType);

    if (isDuplicateType) {
      setSelectedGroups(selectedGroups.map(sg =>
        sg.courseId === courseId ? {
          ...sg,
          groups: [...sg.groups.filter(g => g.lectureType !== group.lectureType), group]
        } : sg
      ));
    } else if (courseGroups) {
      setSelectedGroups(selectedGroups.map(sg =>
        sg.courseId === courseId ? { ...sg, groups: [...sg.groups, group] } : sg
      ));
    } else {
      setSelectedGroups([...selectedGroups, { courseId, groups: [group] }]);
    }
  };
  const uniqueCourseTypes = useMemo(() => {
    return Array.from(new Set(allCourses.map(course => course.courseType)));
  }, [allCourses]);
  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Sidebar
        courses={filteredCourses}
        selectedCourses={selectedCourses}
        onCourseSelect={handleCourseSelect}
        filters={filters}
        onFilterChange={setFilters}
        courseColors={courseColors}
        uniqueCourseTypes={uniqueCourseTypes} // Pass unique course types to Sidebar
      />

      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-gray-800">Weekly Schedule</h2>
            {auth.isAuthenticated && auth.user && (
              <div className="text-sm text-gray-600">
                Logged in as: <span className="font-semibold">{auth.user.username}</span>
                <button
                  onClick={onLogout}
                  className="ml-4 text-red-600 hover:text-red-800"
                >
                  Logout
                </button>
              </div>
            )}
            {auth.isGuest && (
              <div className="text-sm text-gray-600">
                <span className="italic">Guest Mode</span>
              </div>
            )}
          </div>

          <WeeklySchedule
            selectedCourses={selectedCourseObjects}
            selectedGroups={selectedGroups}
            onGroupSelect={handleGroupSelect}
            courseColors={courseColors}
            onClearSchedule={handleClearSchedule}
            onScheduleChosen={handleScheduleChosen}
          />

          {/* Only show ProgressTracker for non-guest users */}
          {auth.isAuthenticated && auth.user && !auth.isGuest && (
            <ProgressTracker user={auth.user} />
          )}
        </div>
      </div>
    </div>
  );
}