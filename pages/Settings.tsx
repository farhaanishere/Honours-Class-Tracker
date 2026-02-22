import React, { useRef } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import { Download, Upload, Save, AlertTriangle, ShieldCheck, FileJson } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const Settings: React.FC = () => {
    const { user } = useAuth();
    const { semesters, courses, sessions, importData } = useData();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleExport = () => {
        try {
            // Filter data to only include the current user's relevant data
            const userSemesterIds = semesters.map(s => s.id);
            const userCourses = courses.filter(c => userSemesterIds.includes(c.semesterId));
            const userCourseIds = userCourses.map(c => c.id);
            const userSessions = sessions.filter(s => userCourseIds.includes(s.courseId));

            const data = {
                metadata: {
                    version: '1.0',
                    exportedAt: new Date().toISOString(),
                    user: user?.name,
                    program: user?.program,
                    subject: user?.subject
                },
                data: {
                    semesters, // Already filtered by DataContext
                    courses: userCourses,
                    sessions: userSessions
                }
            };

            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `honours-tracker-backup-${new Date().toISOString().slice(0, 10)}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            toast.success('Backup downloaded successfully');
        } catch (error) {
            console.error(error);
            toast.error('Failed to export data');
        }
    };

    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const json = JSON.parse(event.target?.result as string);
                if (json.data && Array.isArray(json.data.semesters)) {
                    if(confirm('Warning: This will merge the backup file with your current data. Are you sure?')) {
                        importData(json.data);
                        toast.success('Data restored successfully!');
                    }
                } else {
                    toast.error('Invalid file format! Please upload a valid backup file.');
                }
            } catch (err) {
                console.error(err);
                toast.error('Could not read file. It might be corrupted.');
            }
        };
        reader.readAsText(file);
        // Reset file input
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className="space-y-8 pb-10">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
                <p className="text-sm text-gray-500">Backup your data and view profile info</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Profile Info */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                >
                    <div className="p-4 border-b border-gray-100 bg-gray-50">
                        <h3 className="font-bold text-gray-700 flex items-center gap-2">
                            <ShieldCheck size={18} className="text-bou-600"/>
                             Account Info
                        </h3>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Name</label>
                                <p className="text-gray-800 font-medium">{user?.name}</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Program</label>
                                <p className="text-gray-800 font-medium">{user?.program}</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Subject</label>
                                <p className="text-gray-800 font-medium">{user?.subject}</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Data Management */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                >
                     <div className="p-4 border-b border-gray-100 bg-gray-50">
                        <h3 className="font-bold text-gray-700 flex items-center gap-2">
                            <Save size={18} className="text-bou-600"/>
                             Backup & Restore
                        </h3>
                    </div>
                    <div className="p-6">
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex gap-3">
                            <AlertTriangle className="text-yellow-600 flex-shrink-0" size={20} />
                            <p className="text-sm text-yellow-800">
                                Your data is stored locally in your browser. Clearing browser cache may delete your data. Download backups regularly to keep your data safe.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div className="p-4 border border-gray-200 rounded-xl flex justify-between items-center hover:bg-gray-50 transition-colors group">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-100 transition-colors">
                                        <Download size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-800">Download Backup</h4>
                                        <p className="text-xs text-gray-500">Export all your data as a JSON file.</p>
                                    </div>
                                </div>
                                <Button onClick={handleExport} size="sm" className="gap-2 shadow-sm">
                                    Download
                                </Button>
                            </div>

                            <div className="p-4 border border-gray-200 rounded-xl flex justify-between items-center hover:bg-gray-50 transition-colors group">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-purple-50 text-purple-600 rounded-lg group-hover:bg-purple-100 transition-colors">
                                        <Upload size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-800">Restore Backup</h4>
                                        <p className="text-xs text-gray-500">Upload a previously downloaded backup file.</p>
                                    </div>
                                </div>
                                <div>
                                    <input 
                                        type="file" 
                                        accept=".json" 
                                        ref={fileInputRef} 
                                        onChange={handleImport}
                                        className="hidden" 
                                    />
                                    <Button variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()} className="gap-2 shadow-sm bg-white border border-gray-200">
                                        Upload
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Settings;