export enum ProgramType {
  BA_HONORS = 'BA Honours',
  BSS_HONORS = 'BSS Honours'
}

export enum SubjectType {
  // BA
  BANGLA = 'Bangla Language & Literature',
  ISLAMIC_STUDIES = 'Islamic Studies',
  HISTORY = 'History',
  PHILOSOPHY = 'Philosophy',
  // BSS
  POLITICAL_SCIENCE = 'Political Science',
  SOCIOLOGY = 'Sociology'
}

export interface User {
  id: string;
  name: string;
  // removed email
  program: ProgramType;
  subject: SubjectType;
  // Auth simulation
  password?: string;
}

export interface ClassSession {
  id: string;
  courseId: string;
  date: string;
  type: 'Online' | 'DRC'; // Changed Offline to DRC
  note?: string;
}

export interface Course {
  id: string;
  semesterId: string;
  name: string;
  teacherName: string;
  totalClasses: number; // Defaults to 24
}

export interface Semester {
  id: string;
  userId: string;
  name: string; // e.g., "1st Semester", "Fall 2024"
  status: 'Active' | 'Archived';
  startDate: string;
  createdAt: number;
}

export interface SemesterData {
  semester: Semester;
  courses: Course[];
  sessions: ClassSession[];
}