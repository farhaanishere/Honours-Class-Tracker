import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { SEMESTER_OPTIONS, TOTAL_CLASSES_DEFAULT } from '../constants';
import Button from '../components/Button';
import Modal from '../components/Modal';
import CourseCard from '../components/CourseCard';
import { Plus, Trash2, Calendar, Edit2, Pencil, Archive } from 'lucide-react';
import { Course } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const ClassTracker: React.FC = () => {
  const { semesters, courses, addSemester, addCourse, updateSemesterStatus, updateSemesterName, deleteSemester, updateCourse, deleteCourse } = useData();
  const [isAddingSemester, setIsAddingSemester] = useState(false);
  const [newSemesterName, setNewSemesterName] = useState(SEMESTER_OPTIONS[0]);
  const [isAddingCourse, setIsAddingCourse] = useState<string | null>(null); // semesterId
  
  // State for Semester Edit Modal
  const [editingSemesterId, setEditingSemesterId] = useState<string | null>(null);
  const [tempSemesterName, setTempSemesterName] = useState('');

  // State for Course Edit Modal
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  // Active Semesters only
  const activeSemesters = semesters.filter(s => s.status === 'Active');

  const handleAddSemester = () => {
    addSemester(newSemesterName);
    setIsAddingSemester(false);
    toast.success('New semester created!');
  };

  const handleEditSemester = (id: string, currentName: string) => {
      setEditingSemesterId(id);
      setTempSemesterName(currentName);
  };

  const saveSemesterName = () => {
      if(editingSemesterId && tempSemesterName) {
          updateSemesterName(editingSemesterId, tempSemesterName);
          setEditingSemesterId(null);
          toast.success('Semester renamed successfully');
      }
  };

  const handleAddCourse = (e: React.FormEvent<HTMLFormElement>, semesterId: string) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const teacher = formData.get('teacher') as string;
    
    if (name && teacher) {
      addCourse(semesterId, name, teacher, TOTAL_CLASSES_DEFAULT);
      setIsAddingCourse(null);
      toast.success('Course added successfully');
    }
  };

  const handleUpdateCourse = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingCourse) return;

    const formData = new FormData(e.currentTarget);
    updateCourse(editingCourse.id, {
        name: formData.get('name') as string,
        teacherName: formData.get('teacherName') as string,
        totalClasses: Number(formData.get('totalClasses'))
    });
    setEditingCourse(null);
    toast.success('Course updated successfully');
  };

  const handleDeleteCourse = () => {
      if (editingCourse && confirm('Are you sure you want to delete this course?')) {
          deleteCourse(editingCourse.id);
          setEditingCourse(null);
          toast.success('Course deleted');
      }
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex justify-between items-center border-b border-gray-200 pb-4">
        <div>
           <h1 className="text-2xl font-bold text-gray-800">Class Tracker</h1>
           <p className="text-sm text-gray-500">Manage your active semesters and courses</p>
        </div>
        <Button onClick={() => setIsAddingSemester(true)} className="gap-2 shadow-sm hover:shadow-md transition-shadow">
          <Plus size={18} /> New Semester
        </Button>
      </div>

      {/* Add Semester Modal */}
      <Modal isOpen={isAddingSemester} onClose={() => setIsAddingSemester(false)} title="Create New Semester">
          <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Semester Name</label>
                <select 
                value={newSemesterName}
                onChange={(e) => setNewSemesterName(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bou-500 focus:border-bou-500 outline-none transition-all"
                >
                {SEMESTER_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                ))}
                </select>
            </div>
            <div className="flex gap-2 justify-end pt-2">
                <Button variant="secondary" onClick={() => setIsAddingSemester(false)}>Cancel</Button>
                <Button onClick={handleAddSemester}>Create Semester</Button>
            </div>
          </div>
      </Modal>

      {/* Edit Semester Modal */}
      <Modal isOpen={!!editingSemesterId} onClose={() => setEditingSemesterId(null)} title="Rename Semester">
          <div className="space-y-4">
             <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Semester Name</label>
                 <input 
                    type="text"
                    value={tempSemesterName}
                    onChange={(e) => setTempSemesterName(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bou-500 focus:border-bou-500 outline-none transition-all"
                 />
             </div>
             <div className="flex gap-2 justify-end pt-2">
                <Button variant="secondary" onClick={() => setEditingSemesterId(null)}>Cancel</Button>
                <Button onClick={saveSemesterName}>Save Changes</Button>
            </div>
          </div>
      </Modal>

      {/* Edit Course Modal */}
      <Modal isOpen={!!editingCourse} onClose={() => setEditingCourse(null)} title="Edit Course">
          {editingCourse && (
            <form onSubmit={handleUpdateCourse} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Course Name</label>
                    <input name="name" defaultValue={editingCourse.name} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bou-500 focus:border-bou-500 outline-none transition-all" placeholder="Course Name" required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Teacher Name</label>
                    <input name="teacherName" defaultValue={editingCourse.teacherName} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bou-500 focus:border-bou-500 outline-none transition-all" placeholder="Teacher Name" required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Total Classes</label>
                    <input name="totalClasses" type="number" defaultValue={editingCourse.totalClasses} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bou-500 focus:border-bou-500 outline-none transition-all" placeholder="Total Classes" required />
                </div>
                <div className="flex gap-2 justify-between pt-4 border-t border-gray-100 mt-4">
                    <Button type="button" variant="danger" size="sm" onClick={handleDeleteCourse}>Delete Course</Button>
                    <div className="flex gap-2">
                        <Button type="button" variant="secondary" onClick={() => setEditingCourse(null)}>Cancel</Button>
                        <Button type="submit">Update Course</Button>
                    </div>
                </div>
            </form>
          )}
      </Modal>

      {/* Active Semesters List */}
      <div className="space-y-12">
        {activeSemesters.length === 0 && !isAddingSemester && (
           <motion.div 
             initial={{ opacity: 0, scale: 0.9 }}
             animate={{ opacity: 1, scale: 1 }}
             className="text-center py-20 bg-white rounded-xl border-2 border-dashed border-gray-300 shadow-sm"
            >
             <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="text-gray-400" size={32} />
             </div>
             <h3 className="text-lg font-bold text-gray-700 mb-2">No Active Semesters</h3>
             <p className="text-gray-500 mb-6 max-w-md mx-auto">Start tracking your academic progress by creating your first semester.</p>
             <Button onClick={() => setIsAddingSemester(true)}>Create First Semester</Button>
           </motion.div>
        )}

        <AnimatePresence>
        {activeSemesters.map(semester => {
          const semesterCourses = courses.filter(c => c.semesterId === semester.id);

          return (
            <motion.div 
                key={semester.id} 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="group"
            >
              <div className="flex flex-wrap justify-between items-center mb-6 gap-4 bg-white p-5 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                 <div className="flex items-center gap-4">
                    <div className="p-3 bg-bou-50 text-bou-600 rounded-xl border border-bou-100">
                        <Calendar size={24} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-xl font-bold text-gray-800">
                                {semester.name}
                            </h2>
                            <button 
                                onClick={() => handleEditSemester(semester.id, semester.name)}
                                className="text-gray-400 hover:text-bou-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                                title="Rename Semester"
                            >
                                <Pencil size={14} />
                            </button>
                        </div>
                        <p className="text-sm text-gray-500 font-medium">{semesterCourses.length} Courses Enrolled</p>
                    </div>
                 </div>
                 <div className="flex gap-2">
                   <Button 
                      variant="secondary" 
                      size="sm"
                      className="text-gray-600 hover:text-bou-700"
                      onClick={() => {
                        if(confirm('Are you sure you want to archive this semester? You can restore it later.')) {
                          updateSemesterStatus(semester.id, 'Archived');
                          toast.success('Semester archived');
                        }
                      }}
                    >
                      <Archive size={16} className="mr-2"/> Archive
                   </Button>
                   <Button 
                      variant="danger" 
                      size="sm"
                      onClick={() => {
                        if(confirm('Warning: This will delete the semester and ALL its courses/data permanently. Are you sure?')) {
                          deleteSemester(semester.id);
                          toast.error('Semester deleted');
                        }
                      }}
                    >
                      <Trash2 size={16} />
                   </Button>
                 </div>
              </div>

              {/* Course Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                    {semesterCourses.map(course => (
                    <CourseCard 
                        key={course.id} 
                        course={course} 
                        onEdit={(c) => setEditingCourse(c)}
                    />
                    ))}
                </AnimatePresence>

                {/* Add Course Card */}
                {isAddingCourse === semester.id ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white border-2 border-bou-300 border-dashed rounded-xl p-6 flex flex-col justify-center shadow-lg ring-4 ring-bou-50"
                  >
                    <h4 className="font-bold text-gray-800 mb-4 text-lg">Add New Course</h4>
                    <form onSubmit={(e) => handleAddCourse(e, semester.id)} className="space-y-4">
                      <div>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Course Name</label>
                        <input name="name" placeholder="e.g. Bangla Lit" className="w-full p-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-bou-500 outline-none transition-all" required autoFocus />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Teacher Name</label>
                        <input name="teacher" placeholder="e.g. Dr. Rahim" className="w-full p-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-bou-500 outline-none transition-all" required />
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button type="submit" size="sm" className="w-full">Save Course</Button>
                        <Button type="button" variant="ghost" size="sm" onClick={() => setIsAddingCourse(null)}>Cancel</Button>
                      </div>
                    </form>
                  </motion.div>
                ) : (
                  <motion.button 
                    whileHover={{ scale: 1.02, backgroundColor: '#f0fdfa', borderColor: '#2dd4bf' }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsAddingCourse(semester.id)}
                    className="h-full min-h-[200px] flex flex-col items-center justify-center gap-3 bg-gray-50 border-2 border-gray-200 border-dashed rounded-xl text-gray-400 transition-all group duration-300"
                  >
                    <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:shadow-md transition-all border border-gray-100 group-hover:border-bou-200">
                      <Plus size={28} className="text-gray-300 group-hover:text-bou-500 transition-colors" />
                    </div>
                    <span className="font-bold text-gray-500 group-hover:text-bou-600 transition-colors">Add New Course</span>
                  </motion.button>
                )}
              </div>
            </motion.div>
          );
        })}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ClassTracker;