import React, { useMemo, useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { BookOpen, CheckCircle, Clock, Share2, Calendar, User, Info, Copy } from 'lucide-react';
import Button from '../components/Button';
import Modal from '../components/Modal';
import { Link } from 'react-router-dom';
import { Course } from '../types';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { semesters, courses, sessions } = useData();
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  // Filter only active semesters
  const activeSemesters = useMemo(() => semesters.filter(s => s.status === 'Active'), [semesters]);
  
  // Calculate total stats for active semesters
  const stats = useMemo(() => {
    let totalScheduled = 0;
    let totalCompleted = 0;
    const activeCourseIds = new Set<string>();

    activeSemesters.forEach(sem => {
      const semCourses = courses.filter(c => c.semesterId === sem.id);
      semCourses.forEach(c => {
        activeCourseIds.add(c.id);
        totalScheduled += c.totalClasses;
      });
    });

    const validSessions = sessions.filter(s => activeCourseIds.has(s.courseId));
    totalCompleted = validSessions.length;

    return {
      totalScheduled,
      totalCompleted,
      remaining: Math.max(0, totalScheduled - totalCompleted),
      percentage: totalScheduled > 0 ? Math.round((totalCompleted / totalScheduled) * 100) : 0
    };
  }, [activeSemesters, courses, sessions]);

  const chartData = [
    { name: 'Completed', value: stats.totalCompleted, color: '#0d9488' }, // bou-600
    { name: 'Remaining', value: stats.remaining, color: '#cbd5e1' }, // slate-300
  ];

  const handleShare = async () => {
    const date = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-');
    
    let report = `
🎓 *Honours Class Report*
📅 Date: ${date}
👤 Name: ${user?.name}
🎓 Program: ${user?.program}
📚 Subject: ${user?.subject}
------------------`.trim();

    activeSemesters.forEach(sem => {
      report += `\n\n📌 *${sem.name}*`;
      const semCourses = courses.filter(c => c.semesterId === sem.id);
      
      semCourses.forEach(c => {
        const courseSessions = sessions.filter(s => s.courseId === c.id);
        const courseSessionsCount = courseSessions.length;
        const onlineCount = courseSessions.filter(s => s.type === 'Online').length;
        const drcCount = courseSessions.filter(s => s.type === 'DRC').length;
        const remaining = Math.max(0, c.totalClasses - courseSessionsCount);
        report += `\n- ${c.name}: ${courseSessionsCount} done (Online: ${onlineCount}, DRC: ${drcCount}), ${remaining} left`;
      });
    });

    report += `\n\n📊 *Overall Progress*
✅ Completed: ${stats.totalCompleted} classes
⏳ Remaining: ${stats.remaining} classes
📈 Progress: ${stats.percentage}%

App: Honours Class Tracker`;

    try {
      await navigator.clipboard.writeText(report);
      alert('Full report copied to clipboard!');
    } catch (err) {
      console.error(err);
    }
  };

  const handleCourseShare = async () => {
    if (!selectedCourse) return;
    
    const courseSessions = getCourseSessions(selectedCourse.id);
    const completed = courseSessions.length;
    const onlineCount = courseSessions.filter(s => s.type === 'Online').length;
    const drcCount = courseSessions.filter(s => s.type === 'DRC').length;
    const remaining = Math.max(0, selectedCourse.totalClasses - completed);
    const percentage = Math.round((completed / selectedCourse.totalClasses) * 100);
    
    let report = `
📚 *Course Report: ${selectedCourse.name}*
👤 Teacher: ${selectedCourse.teacherName}
📊 Progress: ${completed}/${selectedCourse.totalClasses} (${percentage}%)
🏫 Breakdown: Online: ${onlineCount}, DRC: ${drcCount}
⏳ Remaining: ${remaining} classes
------------------`.trim();

    if (courseSessions.length > 0) {
      report += `\n\n📝 *Class History:*`;
      courseSessions.forEach((s, idx) => {
        const date = new Date(s.date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-');
        report += `\n${courseSessions.length - idx}. ${date} (${s.type})`;
        if (s.note) report += ` - ${s.note}`;
      });
    } else {
      report += `\n\nNo classes recorded yet.`;
    }

    report += `\n\nApp: Honours Class Tracker`;

    try {
      await navigator.clipboard.writeText(report);
      alert('Course report copied to clipboard!');
    } catch (err) {
      console.error(err);
    }
  };

  const getCourseSessions = (courseId: string) => {
    return sessions.filter(s => s.courseId === courseId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  if (activeSemesters.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center animate-fade-in">
        <div className="bg-bou-50 p-6 rounded-full mb-6">
          <BookOpen className="text-bou-500" size={48} />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">No Active Semester</h2>
        <p className="text-gray-500 mb-6 max-w-md">
          To start tracking your classes, please create a semester and add courses.
        </p>
        <Link to="/tracker">
          <Button size="lg">Setup Semester</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-500">Your class progress overview</p>
        </div>
        <Button onClick={handleShare} variant="secondary" className="gap-2">
          <Share2 size={16} />
          Share Report
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 transition-transform hover:-translate-y-1">
          <div className="p-3 bg-green-100 text-green-600 rounded-lg">
            <CheckCircle size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Classes Done</p>
            <p className="text-3xl font-bold text-gray-800">{stats.totalCompleted}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 transition-transform hover:-translate-y-1">
          <div className="p-3 bg-orange-100 text-orange-600 rounded-lg">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Remaining</p>
            <p className="text-3xl font-bold text-gray-800">{stats.remaining}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 transition-transform hover:-translate-y-1">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
            <BookOpen size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Progress</p>
            <p className="text-3xl font-bold text-gray-800">{stats.percentage}%</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold mb-6">Class Statistics</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Active Courses List */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold mb-4">Ongoing Courses</h3>
          <p className="text-xs text-gray-400 mb-4 flex items-center gap-1"><Info size={12}/> Click on a course to view details</p>
          <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
            {activeSemesters.map(sem => {
              const semCourses = courses.filter(c => c.semesterId === sem.id);
              return (
                <div key={sem.id}>
                  <h4 className="text-sm font-bold text-bou-600 mb-2 uppercase tracking-wide border-b border-gray-100 pb-1">
                    {sem.name}
                  </h4>
                  {semCourses.map(course => {
                    const courseSessions = sessions.filter(s => s.courseId === course.id).length;
                    const percent = Math.round((courseSessions / course.totalClasses) * 100);
                    
                    return (
                      <div 
                        key={course.id} 
                        className="mb-4 last:mb-0 group cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                        onClick={() => setSelectedCourse(course)}
                      >
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium text-gray-700 group-hover:text-bou-600 transition-colors">{course.name}</span>
                          <span className="text-gray-500">{courseSessions}/{course.totalClasses}</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div 
                            className="bg-bou-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(percent, 100)}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">Teacher: {course.teacherName}</p>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Course Detail Modal */}
      <Modal 
        isOpen={!!selectedCourse} 
        onClose={() => setSelectedCourse(null)}
        title={selectedCourse?.name || 'Course Details'}
      >
        {selectedCourse && (
          <div className="space-y-6">
             <div className="flex justify-end -mt-2 mb-2">
                <button 
                  onClick={handleCourseShare}
                  className="flex items-center gap-1 text-xs font-medium text-bou-600 hover:text-bou-800 transition-colors bg-bou-50 px-3 py-1.5 rounded-full"
                >
                   <Copy size={12} />
                   Copy Report
                </button>
             </div>

             <div className="bg-bou-50 p-4 rounded-lg flex items-start gap-3">
                <User className="text-bou-600 mt-1" size={20} />
                <div>
                   <p className="text-sm text-bou-800 font-bold">Teacher</p>
                   <p className="text-gray-700">{selectedCourse.teacherName}</p>
                </div>
             </div>
             
             {/* Class Type Breakdown */}
             <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                    <p className="text-xs text-blue-600 font-bold uppercase tracking-wider">Online</p>
                    <p className="text-xl font-bold text-blue-800">
                        {getCourseSessions(selectedCourse.id).filter(s => s.type === 'Online').length}
                    </p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg border border-green-100">
                    <p className="text-xs text-green-600 font-bold uppercase tracking-wider">DRC</p>
                    <p className="text-xl font-bold text-green-800">
                        {getCourseSessions(selectedCourse.id).filter(s => s.type === 'DRC').length}
                    </p>
                </div>
             </div>
             
             <div>
                <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                   <Calendar size={18} />
                   Class History
                </h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                    {getCourseSessions(selectedCourse.id).length > 0 ? (
                        getCourseSessions(selectedCourse.id).map((s, idx) => (
                          <div key={s.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50">
                             <div className="flex items-center gap-3">
                                <span className="text-sm font-mono text-gray-500 w-6">#{getCourseSessions(selectedCourse.id).length - idx}</span>
                                <div>
                                   <p className="text-sm font-medium text-gray-800">
                                     {new Date(s.date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-')}
                                   </p>
                                   <p className="text-xs text-gray-400">{s.type}</p>
                                </div>
                             </div>
                             <span className={`px-2 py-1 rounded text-xs font-bold ${s.type === 'Online' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
                                {s.type}
                             </span>
                          </div>
                        ))
                    ) : (
                        <p className="text-center text-gray-400 py-4">No classes recorded yet.</p>
                    )}
                </div>
             </div>

             <div className="pt-4 border-t border-gray-100">
                <div className="flex justify-between items-center text-sm">
                   <span className="text-gray-500">Total Progress</span>
                   <span className="font-bold text-gray-800">
                      {Math.round((getCourseSessions(selectedCourse.id).length / selectedCourse.totalClasses) * 100)}%
                   </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3 mt-2">
                    <div 
                      className="bg-bou-600 h-3 rounded-full"
                      style={{ width: `${Math.min((getCourseSessions(selectedCourse.id).length / selectedCourse.totalClasses) * 100, 100)}%` }}
                    ></div>
                </div>
             </div>
          </div>
        )}
      </Modal>

    </div>
  );
};

export default Dashboard;