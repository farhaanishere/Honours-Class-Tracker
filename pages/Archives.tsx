import React from 'react';
import { useData } from '../context/DataContext';
import { Archive as ArchiveIcon, RotateCcw, Calendar, BookOpen } from 'lucide-react';
import Button from '../components/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const Archives: React.FC = () => {
  const { semesters, courses, sessions, updateSemesterStatus } = useData();
  const archivedSemesters = semesters.filter(s => s.status === 'Archived');

  const handleRestore = (id: string) => {
      updateSemesterStatus(id, 'Active');
      toast.success('Semester restored to active list');
  };

  if (archivedSemesters.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center h-[60vh] text-center"
      >
        <div className="bg-gray-100 p-6 rounded-full mb-6 ring-8 ring-gray-50">
          <ArchiveIcon className="text-gray-400" size={48} />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Empty Archives</h2>
        <p className="text-gray-500 max-w-sm mx-auto">You don't have any archived semesters yet. Completed semesters you archive will appear here.</p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="border-b border-gray-200 pb-4">
         <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <ArchiveIcon className="text-bou-600" />
            Archives
         </h1>
         <p className="text-sm text-gray-500">History of your completed semesters</p>
      </div>

      <div className="space-y-8">
        <AnimatePresence>
        {archivedSemesters.map((sem, index) => {
           const semCourses = courses.filter(c => c.semesterId === sem.id);
           
           return (
             <motion.div 
                key={sem.id} 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
             >
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex flex-wrap justify-between items-center gap-4">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-white border border-gray-200 rounded-lg shadow-sm text-gray-500">
                        <Calendar size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-800 text-lg">{sem.name}</h3>
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Created: {new Date(sem.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-bou-600 hover:text-bou-700 hover:bg-bou-50 gap-2"
                    onClick={() => handleRestore(sem.id)}
                  >
                    <RotateCcw size={16} />
                    Restore Semester
                  </Button>
                </div>

                <div className="p-0">
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="bg-white border-b border-gray-100">
                          <th className="text-left font-bold text-gray-400 uppercase tracking-wider text-xs py-4 px-6">Course Name</th>
                          <th className="text-left font-bold text-gray-400 uppercase tracking-wider text-xs py-4 px-6">Teacher</th>
                          <th className="text-center font-bold text-gray-400 uppercase tracking-wider text-xs py-4 px-6">Classes Held</th>
                          <th className="text-center font-bold text-gray-400 uppercase tracking-wider text-xs py-4 px-6">Completion</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {semCourses.map(course => {
                          const count = sessions.filter(s => s.courseId === course.id).length;
                          const percent = Math.round((count / course.totalClasses) * 100);
                          return (
                            <tr key={course.id} className="hover:bg-gray-50/80 transition-colors group">
                              <td className="py-4 px-6 font-medium text-gray-800 group-hover:text-bou-700 transition-colors">
                                <div className="flex items-center gap-2">
                                    <BookOpen size={14} className="text-gray-300 group-hover:text-bou-400" />
                                    {course.name}
                                </div>
                              </td>
                              <td className="py-4 px-6 text-gray-600">{course.teacherName}</td>
                              <td className="py-4 px-6 text-center">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                                  {count} / {course.totalClasses}
                                </span>
                              </td>
                              <td className="py-4 px-6 text-center">
                                <div className="flex items-center justify-center gap-2">
                                    <span className="text-xs font-bold text-gray-600 w-8 text-right">{percent}%</span>
                                    <div className="w-16 bg-gray-100 rounded-full h-1.5">
                                        <div 
                                            className={`h-1.5 rounded-full ${percent >= 100 ? 'bg-green-500' : 'bg-bou-500'}`} 
                                            style={{ width: `${Math.min(percent, 100)}%` }}
                                        ></div>
                                    </div>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
             </motion.div>
           )
        })}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Archives;