import React, { createContext, useContext, useState, useEffect } from 'react';
import { Semester, Course, ClassSession } from '../types';
import { loadFromStorage, saveToStorage } from '../utils/storage';
import { useAuth } from './AuthContext';

interface DataContextType {
  semesters: Semester[];
  courses: Course[];
  sessions: ClassSession[];
  addSemester: (name: string) => void;
  updateSemesterStatus: (id: string, status: 'Active' | 'Archived') => void;
  updateSemesterName: (id: string, name: string) => void;
  deleteSemester: (id: string) => void;
  addCourse: (semesterId: string, name: string, teacherName: string, totalClasses?: number) => void;
  updateCourse: (id: string, data: Partial<Course>) => void;
  deleteCourse: (id: string) => void;
  addSession: (courseId: string, date: string, type: 'Online' | 'DRC', note?: string) => void;
  deleteSession: (id: string) => void;
  importData: (data: { semesters: Semester[], courses: Course[], sessions: ClassSession[] }) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [sessions, setSessions] = useState<ClassSession[]>([]);

  // Load data specific to the logged-in user
  useEffect(() => {
    if (user) {
      const allSemesters = loadFromStorage<Semester[]>('semesters', []);
      const allCourses = loadFromStorage<Course[]>('courses', []);
      const allSessions = loadFromStorage<ClassSession[]>('sessions', []);

      const userSemesters = allSemesters.filter(s => s.userId === user.id);
      const userSemesterIds = new Set(userSemesters.map(s => s.id));
      
      const userCourses = allCourses.filter(c => userSemesterIds.has(c.semesterId));
      const userCourseIds = new Set(userCourses.map(c => c.id));
      
      const userSessions = allSessions.filter(s => userCourseIds.has(s.courseId));

      setSemesters(userSemesters);
      setCourses(userCourses); 
      setSessions(userSessions);
    } else {
      setSemesters([]);
      setCourses([]);
      setSessions([]);
    }
  }, [user]);

  // Persist all data changes
  const saveAll = (newSemesters: Semester[], newCourses: Course[], newSessions: ClassSession[]) => {
    if (!user) return;

    // We need to merge current user data with other users' data stored in local storage
    const allSemesters = loadFromStorage<Semester[]>('semesters', []);
    const otherSemesters = allSemesters.filter(s => s.userId !== user.id);
    
    const allCourses = loadFromStorage<Course[]>('courses', []);
    const otherSemestersIds = new Set(otherSemesters.map(s => s.id));
    const otherCourses = allCourses.filter(c => otherSemestersIds.has(c.semesterId));

    const allSessions = loadFromStorage<ClassSession[]>('sessions', []);
    const otherCoursesIds = new Set(otherCourses.map(c => c.id));
    const otherSessions = allSessions.filter(s => otherCoursesIds.has(s.courseId));
    
    // Save to local storage (All users)
    saveToStorage('semesters', [...otherSemesters, ...newSemesters]);
    saveToStorage('courses', [...otherCourses, ...newCourses]); 
    saveToStorage('sessions', [...otherSessions, ...newSessions]);

    // Update state (Current user only)
    setSemesters(newSemesters);
    setCourses(newCourses);
    setSessions(newSessions);
  };

  const addSemester = (name: string) => {
    if (!user) return;
    const newSemester: Semester = {
      id: Date.now().toString(),
      userId: user.id,
      name,
      status: 'Active',
      startDate: new Date().toISOString(),
      createdAt: Date.now()
    };
    saveAll([...semesters, newSemester], courses, sessions);
  };

  const updateSemesterStatus = (id: string, status: 'Active' | 'Archived') => {
    const updated = semesters.map(s => s.id === id ? { ...s, status } : s);
    saveAll(updated, courses, sessions);
  };

  const updateSemesterName = (id: string, name: string) => {
    const updated = semesters.map(s => s.id === id ? { ...s, name } : s);
    saveAll(updated, courses, sessions);
  };

  const deleteSemester = (id: string) => {
    // 1. Remove the semester
    const updatedSemesters = semesters.filter(s => s.id !== id);
    
    // 2. Identify courses belonging to this semester
    const coursesToDelete = courses.filter(c => c.semesterId === id);
    const courseIdsToDelete = coursesToDelete.map(c => c.id);

    // 3. Remove those courses
    const updatedCourses = courses.filter(c => c.semesterId !== id);

    // 4. Remove sessions belonging to those courses
    const updatedSessions = sessions.filter(s => !courseIdsToDelete.includes(s.courseId));
    
    saveAll(updatedSemesters, updatedCourses, updatedSessions);
  };

  const addCourse = (semesterId: string, name: string, teacherName: string, totalClasses = 24) => {
    const newCourse: Course = {
      id: Date.now().toString() + Math.random().toString(),
      semesterId,
      name,
      teacherName,
      totalClasses
    };
    saveAll(semesters, [...courses, newCourse], sessions);
  };

  const updateCourse = (id: string, data: Partial<Course>) => {
    const updated = courses.map(c => c.id === id ? { ...c, ...data } : c);
    saveAll(semesters, updated, sessions);
  };

  const deleteCourse = (id: string) => {
    const updatedCourses = courses.filter(c => c.id !== id);
    const updatedSessions = sessions.filter(s => s.courseId !== id);
    saveAll(semesters, updatedCourses, updatedSessions);
  };

  const addSession = (courseId: string, date: string, type: 'Online' | 'DRC', note?: string) => {
    const newSession: ClassSession = {
      id: Date.now().toString() + Math.random().toString(),
      courseId,
      date,
      type,
      note
    };
    saveAll(semesters, courses, [...sessions, newSession]);
  };

  const deleteSession = (id: string) => {
    const updated = sessions.filter(s => s.id !== id);
    saveAll(semesters, courses, updated);
  };

  const importData = (data: { semesters: Semester[], courses: Course[], sessions: ClassSession[] }) => {
    const currentSemesters = loadFromStorage<Semester[]>('semesters', []);
    const currentCourses = loadFromStorage<Course[]>('courses', []);
    const currentSessions = loadFromStorage<ClassSession[]>('sessions', []);

    const merge = (current: any[], incoming: any[]) => {
        const map = new Map(current.map(i => [i.id, i]));
        if (incoming && Array.isArray(incoming)) {
          incoming.forEach(i => map.set(i.id, i));
        }
        return Array.from(map.values());
    };

    const mergedSemesters = merge(currentSemesters, data.semesters);
    const mergedCourses = merge(currentCourses, data.courses);
    const mergedSessions = merge(currentSessions, data.sessions);

    saveToStorage('semesters', mergedSemesters);
    saveToStorage('courses', mergedCourses);
    saveToStorage('sessions', mergedSessions);

    if (user) {
      const userSemesters = mergedSemesters.filter((s: any) => s.userId === user.id);
      const userSemesterIds = new Set(userSemesters.map((s: any) => s.id));
      
      const userCourses = (mergedCourses as Course[]).filter(c => userSemesterIds.has(c.semesterId));
      const userCourseIds = new Set(userCourses.map(c => c.id));
      
      const userSessions = (mergedSessions as ClassSession[]).filter(s => userCourseIds.has(s.courseId));

      setSemesters(userSemesters);
      setCourses(userCourses);
      setSessions(userSessions);
    }
  };

  return (
    <DataContext.Provider value={{
      semesters, courses, sessions,
      addSemester, updateSemesterStatus, updateSemesterName, deleteSemester,
      addCourse, updateCourse, deleteCourse,
      addSession, deleteSession,
      importData
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};