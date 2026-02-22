import { ProgramType, SubjectType } from './types';

export const PROGRAMS = [
  {
    id: ProgramType.BA_HONORS,
    label: 'BA Honours',
    subjects: [
      SubjectType.BANGLA,
      SubjectType.ISLAMIC_STUDIES,
      SubjectType.HISTORY,
      SubjectType.PHILOSOPHY
    ]
  },
  {
    id: ProgramType.BSS_HONORS,
    label: 'BSS Honours',
    subjects: [
      SubjectType.POLITICAL_SCIENCE,
      SubjectType.SOCIOLOGY
    ]
  }
];

export const TOTAL_CLASSES_DEFAULT = 24;

export const SEMESTER_OPTIONS = [
  "1st Semester", "2nd Semester", "3rd Semester", "4th Semester", 
  "5th Semester", "6th Semester", "7th Semester", "8th Semester"
];