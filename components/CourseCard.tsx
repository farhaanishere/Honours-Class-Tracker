import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import Button from './Button';
import { Edit2, Trash2, Calendar, CheckCircle, AlertCircle } from 'lucide-react';
import { Course } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface CourseCardProps {
  course: Course;
  onEdit: (course: Course) => void;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, onEdit }) => {
  const { sessions, addSession, deleteSession, deleteCourse } = useData();
  const [logDate, setLogDate] = useState(new Date().toISOString().split('T')[0]);
  const [logType, setLogType] = useState<'Online' | 'DRC'>('DRC');
  const [isExpanded, setIsExpanded] = useState(false);

  const courseSessions = sessions.filter(s => s.courseId === course.id);
  const completedCount = courseSessions.length;
  const progress = Math.min((completedCount / course.totalClasses) * 100, 100);
  const isCompleted = completedCount >= course.totalClasses;

  const handleAddSession = (e: React.FormEvent) => {
    e.preventDefault();
    addSession(course.id, logDate, logType);
    toast.success('Class session logged successfully!');
  };

  const handleDeleteSession = (id: string) => {
    deleteSession(id);
    toast.success('Session removed');
  };

  const handleDeleteCourse = () => {
      if(confirm('Are you sure you want to delete this course?')) {
          deleteCourse(course.id);
          toast.success('Course deleted');
      }
  };

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full"
    >
      <div className="p-5 border-b border-gray-100 flex justify-between items-start bg-gradient-to-r from-white to-gray-50">
        <div>
          <h3 className="font-bold text-gray-800 text-lg leading-tight mb-1">{course.name}</h3>
          <p className="text-sm text-gray-500 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-bou-400"></span>
            {course.teacherName}
          </p>
        </div>
        <div className="flex gap-1">
            <button 
                onClick={() => onEdit(course)} 
                className="text-gray-400 hover:text-bou-600 transition-colors p-1.5 rounded-full hover:bg-bou-50"
                title="Edit Course"
            >
                <Edit2 size={16} />
            </button>
            <button 
                onClick={handleDeleteCourse} 
                className="text-gray-400 hover:text-red-600 transition-colors p-1.5 rounded-full hover:bg-red-50"
                title="Delete Course"
            >
                <Trash2 size={16} />
            </button>
        </div>
      </div>
      
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex justify-between text-sm mb-2 font-medium">
           <span className="text-gray-600">Progress</span>
           <span className={`${isCompleted ? 'text-green-600' : 'text-bou-600'}`}>
             {completedCount} <span className="text-gray-400">/ {course.totalClasses}</span>
           </span>
        </div>
        
        <div className="w-full bg-gray-100 rounded-full h-2.5 mb-6 overflow-hidden">
           <motion.div 
             className={`h-full rounded-full ${isCompleted ? 'bg-green-500' : 'bg-bou-500'}`}
             initial={{ width: 0 }}
             animate={{ width: `${progress}%` }}
             transition={{ duration: 0.5, ease: "easeOut" }}
           />
        </div>

        {/* Quick Log Action */}
        {!isCompleted ? (
            <form onSubmit={handleAddSession} className="bg-gray-50 p-3 rounded-xl border border-gray-100 mb-4">
            <div className="flex gap-2 mb-2">
                <input 
                type="date" 
                required
                value={logDate}
                onChange={(e) => setLogDate(e.target.value)}
                className="flex-1 text-xs p-2 border border-gray-200 rounded-lg focus:outline-none focus:border-bou-400 focus:ring-1 focus:ring-bou-400"
                />
                <select 
                value={logType}
                onChange={(e) => setLogType(e.target.value as any)}
                className="w-24 text-xs p-2 border border-gray-200 rounded-lg focus:outline-none focus:border-bou-400 focus:ring-1 focus:ring-bou-400"
                >
                <option value="DRC">DRC</option>
                <option value="Online">Online</option>
                </select>
            </div>
            <Button type="submit" size="sm" className="w-full justify-center py-1.5 text-xs font-semibold">
                Log Class
            </Button>
            </form>
        ) : (
            <div className="bg-green-50 border border-green-100 p-3 rounded-xl mb-4 flex items-center justify-center gap-2 text-green-700">
                <CheckCircle size={16} />
                <span className="text-sm font-bold">Course Completed!</span>
            </div>
        )}

        {/* History Toggle */}
        <div className="mt-auto">
            <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full text-xs text-gray-500 hover:text-bou-600 flex items-center justify-center gap-1 py-2 border-t border-gray-100 transition-colors"
            >
                {isExpanded ? 'Hide History' : `View History (${courseSessions.length})`}
            </button>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="space-y-2 max-h-40 overflow-y-auto pr-1 pt-2 pb-1 custom-scrollbar">
                        {courseSessions.slice().reverse().map(session => (
                            <div key={session.id} className="flex justify-between items-center text-xs bg-white border border-gray-100 p-2 rounded-lg hover:border-bou-200 transition-colors group">
                                <div className="flex items-center gap-2">
                                    <span className={`w-2 h-2 rounded-full ${session.type === 'Online' ? 'bg-blue-400' : 'bg-green-500'}`}></span>
                                    <span className="text-gray-600 font-medium">{session.date}</span>
                                    <span className="text-gray-400 text-[10px] uppercase tracking-wider border border-gray-200 px-1 rounded">{session.type}</span>
                                </div>
                                <button 
                                    onClick={() => handleDeleteSession(session.id)} 
                                    className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                >
                                <Trash2 size={14} />
                                </button>
                            </div>
                        ))}
                        {courseSessions.length === 0 && <p className="text-xs text-center text-gray-400 italic py-2">No classes recorded yet</p>}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default CourseCard;
