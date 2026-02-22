import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calculator, Plus, Trash2, RefreshCcw, Save } from 'lucide-react';
import Button from '../components/Button';
import { useData } from '../context/DataContext';

interface GradeRow {
  id: string;
  courseName: string;
  credit: number;
  gradePoint: number;
}

const GRADE_POINTS = [
  { grade: 'A+', point: 4.00 },
  { grade: 'A', point: 3.75 },
  { grade: 'A-', point: 3.50 },
  { grade: 'B+', point: 3.25 },
  { grade: 'B', point: 3.00 },
  { grade: 'B-', point: 2.75 },
  { grade: 'C+', point: 2.50 },
  { grade: 'C', point: 2.25 },
  { grade: 'D', point: 2.00 },
  { grade: 'F', point: 0.00 },
];

const CGPACalculator: React.FC = () => {
  const { courses } = useData();
  const [rows, setRows] = useState<GradeRow[]>([
    { id: '1', courseName: '', credit: 4, gradePoint: 4.00 },
    { id: '2', courseName: '', credit: 4, gradePoint: 4.00 },
    { id: '3', courseName: '', credit: 4, gradePoint: 4.00 },
    { id: '4', courseName: '', credit: 4, gradePoint: 4.00 },
  ]);

  const [cgpa, setCgpa] = useState<number>(0);
  const [totalCredits, setTotalCredits] = useState<number>(0);

  // Auto-fill from existing courses if available
  useEffect(() => {
    if (courses.length > 0 && rows[0].courseName === '') {
      // Suggest courses from the latest semester
      const suggestedRows = courses.slice(0, 6).map(c => ({
        id: c.id,
        courseName: c.name,
        credit: 4, // Default credit
        gradePoint: 4.00
      }));
      if (suggestedRows.length > 0) {
        // setRows(suggestedRows); // Optional: Auto-fill might be annoying if user wants to calculate custom
      }
    }
  }, [courses]);

  useEffect(() => {
    let totalPoints = 0;
    let credits = 0;

    rows.forEach(row => {
      if (row.credit > 0) {
        totalPoints += row.gradePoint * row.credit;
        credits += row.credit;
      }
    });

    setTotalCredits(credits);
    setCgpa(credits > 0 ? totalPoints / credits : 0);
  }, [rows]);

  const addRow = () => {
    setRows([...rows, { id: Date.now().toString(), courseName: '', credit: 4, gradePoint: 4.00 }]);
  };

  const removeRow = (id: string) => {
    if (rows.length > 1) {
      setRows(rows.filter(r => r.id !== id));
    }
  };

  const updateRow = (id: string, field: keyof GradeRow, value: any) => {
    setRows(rows.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const reset = () => {
    setRows([
      { id: '1', courseName: '', credit: 4, gradePoint: 4.00 },
      { id: '2', courseName: '', credit: 4, gradePoint: 4.00 },
      { id: '3', courseName: '', credit: 4, gradePoint: 4.00 },
      { id: '4', courseName: '', credit: 4, gradePoint: 4.00 },
    ]);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Calculator className="text-bou-600" />
            CGPA Calculator
          </h1>
          <p className="text-sm text-gray-500">Calculate your Semester GPA or Cumulative GPA</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
            <div>
                <p className="text-xs text-gray-500 uppercase font-bold">Total Credits</p>
                <p className="text-xl font-mono font-bold text-gray-700">{totalCredits}</p>
            </div>
            <div className="h-8 w-px bg-gray-200"></div>
            <div>
                <p className="text-xs text-gray-500 uppercase font-bold">Your GPA</p>
                <p className={`text-2xl font-mono font-bold ${cgpa >= 3.5 ? 'text-green-600' : cgpa >= 3.0 ? 'text-bou-600' : 'text-orange-500'}`}>
                    {cgpa.toFixed(2)}
                </p>
            </div>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
      >
        <div className="p-4 bg-gray-50 border-b border-gray-100 grid grid-cols-12 gap-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
            <div className="col-span-5 sm:col-span-6">Course Name (Optional)</div>
            <div className="col-span-3 sm:col-span-2 text-center">Credit</div>
            <div className="col-span-3 sm:col-span-3">Grade</div>
            <div className="col-span-1"></div>
        </div>
        
        <div className="divide-y divide-gray-100">
            {rows.map((row, index) => (
                <motion.div 
                    key={row.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-4 grid grid-cols-12 gap-4 items-center hover:bg-gray-50 transition-colors"
                >
                    <div className="col-span-5 sm:col-span-6">
                        <input 
                            type="text" 
                            placeholder={`Course ${index + 1}`}
                            value={row.courseName}
                            onChange={(e) => updateRow(row.id, 'courseName', e.target.value)}
                            className="w-full p-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-bou-400 focus:ring-1 focus:ring-bou-400 transition-all"
                        />
                    </div>
                    <div className="col-span-3 sm:col-span-2">
                        <input 
                            type="number" 
                            min="1"
                            max="6"
                            value={row.credit}
                            onChange={(e) => updateRow(row.id, 'credit', Number(e.target.value))}
                            className="w-full p-2 border border-gray-200 rounded text-sm text-center focus:outline-none focus:border-bou-400 focus:ring-1 focus:ring-bou-400 transition-all"
                        />
                    </div>
                    <div className="col-span-3 sm:col-span-3">
                        <select 
                            value={row.gradePoint}
                            onChange={(e) => updateRow(row.id, 'gradePoint', Number(e.target.value))}
                            className="w-full p-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-bou-400 focus:ring-1 focus:ring-bou-400 transition-all"
                        >
                            {GRADE_POINTS.map(g => (
                                <option key={g.grade} value={g.point}>{g.grade} ({g.point})</option>
                            ))}
                        </select>
                    </div>
                    <div className="col-span-1 flex justify-end">
                        <button 
                            onClick={() => removeRow(row.id)}
                            className="text-gray-300 hover:text-red-500 transition-colors p-1"
                            disabled={rows.length <= 1}
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                </motion.div>
            ))}
        </div>

        <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
            <Button variant="secondary" onClick={addRow} className="gap-2">
                <Plus size={16} /> Add Course
            </Button>
            
            <Button variant="ghost" onClick={reset} className="gap-2 text-gray-500 hover:text-gray-700">
                <RefreshCcw size={16} /> Reset
            </Button>
        </div>
      </motion.div>

      <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
        <h3 className="font-bold text-blue-800 mb-2">Grading Scale Reference</h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-sm">
            {GRADE_POINTS.map(g => (
                <div key={g.grade} className="flex justify-between bg-white p-2 rounded border border-blue-100">
                    <span className="font-bold text-gray-700">{g.grade}</span>
                    <span className="text-gray-500">{g.point.toFixed(2)}</span>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default CGPACalculator;
