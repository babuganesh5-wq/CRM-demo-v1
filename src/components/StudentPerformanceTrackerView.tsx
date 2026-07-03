import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  Award, 
  Zap, 
  Calendar, 
  Clock, 
  Plus, 
  Search, 
  User, 
  BookOpen, 
  Flame, 
  ChevronRight,
  Sparkles,
  BarChart3,
  CheckCircle2,
  Trash2,
  GraduationCap
} from 'lucide-react';
import { Lead, WeeklyPerformance, Tutor } from '../types';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  BarChart, 
  Bar,
  LineChart,
  Line,
  Legend
} from 'recharts';

interface StudentPerformanceTrackerViewProps {
  leads: Lead[];
  tutors: Tutor[];
  performances: WeeklyPerformance[];
  onAddPerformanceRecord: (record: Omit<WeeklyPerformance, 'id' | 'createdAt'>) => void;
  onDeletePerformanceRecord: (id: string) => void;
  onSelectLead: (leadId: string) => void;
}

export default function StudentPerformanceTrackerView({
  leads,
  tutors,
  performances,
  onAddPerformanceRecord,
  onDeletePerformanceRecord,
  onSelectLead
}: StudentPerformanceTrackerViewProps) {
  // Navigation: "overview" (Academy Dashboard) or a specific leadId
  const [selectedStudentId, setSelectedStudentId] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'weekly' | 'monthly' | 'yearly'>('weekly');
  const [showAddForm, setShowAddForm] = useState(false);

  // Form states for logging a new performance record
  const [formStudentId, setFormStudentId] = useState('');
  const [formWeekStartDate, setFormWeekStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [formTechnical, setFormTechnical] = useState(7);
  const [formRhythm, setFormRhythm] = useState(7);
  const [formExpression, setFormExpression] = useState(7);
  const [formPracticeHours, setFormPracticeHours] = useState(4);
  const [formWeeklyFocus, setFormWeeklyFocus] = useState('');
  const [formComments, setFormComments] = useState('');
  const [formLoggedBy, setFormLoggedBy] = useState('');

  // Active students only (leads with "Active" pipeline status)
  const activeStudents = useMemo(() => {
    return leads.filter(l => l.status === 'Active');
  }, [leads]);

  // Set default logging student or logger
  React.useEffect(() => {
    if (activeStudents.length > 0 && !formStudentId) {
      setFormStudentId(activeStudents[0].id);
    }
    if (tutors.length > 0 && !formLoggedBy) {
      setFormLoggedBy(tutors[0].name);
    }
  }, [activeStudents, tutors, formStudentId, formLoggedBy]);

  // Filter performances based on selected student
  const studentPerformances = useMemo(() => {
    if (selectedStudentId === 'all') {
      return performances.sort((a, b) => a.weekStartDate.localeCompare(b.weekStartDate));
    }
    return performances
      .filter(p => p.leadId === selectedStudentId)
      .sort((a, b) => a.weekStartDate.localeCompare(b.weekStartDate));
  }, [performances, selectedStudentId]);

  // General Academy overview data
  const academyStats = useMemo(() => {
    if (performances.length === 0) return { avgScore: 0, totalHours: 0, totalEvaluations: 0, avgPractice: 0 };
    const sumScore = performances.reduce((acc, p) => acc + p.overallScore, 0);
    const sumHours = performances.reduce((acc, p) => acc + p.practiceHours, 0);
    return {
      avgScore: Math.round(sumScore / performances.length),
      totalHours: sumHours,
      totalEvaluations: performances.length,
      avgPractice: parseFloat((sumHours / performances.length).toFixed(1))
    };
  }, [performances]);

  // Selected individual student details
  const selectedStudent = useMemo(() => {
    return leads.find(l => l.id === selectedStudentId);
  }, [leads, selectedStudentId]);

  // Calculate stats for selected student
  const studentStats = useMemo(() => {
    if (studentPerformances.length === 0) {
      return { avgScore: 0, totalHours: 0, avgTechnical: 0, avgRhythm: 0, avgExpression: 0, avgPractice: 0, streak: 0 };
    }
    const total = studentPerformances.length;
    const sumScore = studentPerformances.reduce((acc, p) => acc + p.overallScore, 0);
    const sumHours = studentPerformances.reduce((acc, p) => acc + p.practiceHours, 0);
    const sumTech = studentPerformances.reduce((acc, p) => acc + p.technicalScore, 0);
    const sumRhy = studentPerformances.reduce((acc, p) => acc + p.rhythmScore, 0);
    const sumExp = studentPerformances.reduce((acc, p) => acc + p.expressionScore, 0);

    return {
      avgScore: Math.round(sumScore / total),
      totalHours: sumHours,
      avgTechnical: parseFloat((sumTech / total).toFixed(1)),
      avgRhythm: parseFloat((sumRhy / total).toFixed(1)),
      avgExpression: parseFloat((sumExp / total).toFixed(1)),
      avgPractice: parseFloat((sumHours / total).toFixed(1)),
      streak: studentPerformances.length
    };
  }, [studentPerformances]);

  // Monthly Aggregation logic
  const monthlyPerformances = useMemo(() => {
    const months: { [key: string]: { scores: number[], hours: number[], tech: number[], rhythm: number[], expr: number[], focusPoints: string[] } } = {};
    
    studentPerformances.forEach(p => {
      // Get YYYY-MM
      const date = new Date(p.weekStartDate);
      if (isNaN(date.getTime())) return;
      const monthKey = date.toLocaleDateString([], { year: 'numeric', month: 'long' });
      
      if (!months[monthKey]) {
        months[monthKey] = { scores: [], hours: [], tech: [], rhythm: [], expr: [], focusPoints: [] };
      }
      months[monthKey].scores.push(p.overallScore);
      months[monthKey].hours.push(p.practiceHours);
      months[monthKey].tech.push(p.technicalScore);
      months[monthKey].rhythm.push(p.rhythmScore);
      months[monthKey].expr.push(p.expressionScore);
      if (p.weeklyFocus) months[monthKey].focusPoints.push(p.weeklyFocus);
    });

    return Object.keys(months).map(monthName => {
      const data = months[monthName];
      const avgScore = Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length);
      const totalHours = data.hours.reduce((a, b) => a + b, 0);
      const avgTech = parseFloat((data.tech.reduce((a, b) => a + b, 0) / data.tech.length).toFixed(1));
      const avgRhythm = parseFloat((data.rhythm.reduce((a, b) => a + b, 0) / data.rhythm.length).toFixed(1));
      const avgExpr = parseFloat((data.expr.reduce((a, b) => a + b, 0) / data.expr.length).toFixed(1));

      return {
        monthName,
        avgScore,
        totalHours,
        avgTech,
        avgRhythm,
        avgExpr,
        foci: data.focusPoints
      };
    }).reverse(); // Latest months first
  }, [studentPerformances]);

  // Yearly Aggregation logic
  const yearlyPerformances = useMemo(() => {
    const years: { [key: string]: { scores: number[], hours: number[], tech: number[], rhythm: number[], expr: number[] } } = {};
    
    studentPerformances.forEach(p => {
      const date = new Date(p.weekStartDate);
      if (isNaN(date.getTime())) return;
      const yearKey = date.getFullYear().toString();
      
      if (!years[yearKey]) {
        years[yearKey] = { scores: [], hours: [], tech: [], rhythm: [], expr: [] };
      }
      years[yearKey].scores.push(p.overallScore);
      years[yearKey].hours.push(p.practiceHours);
      years[yearKey].tech.push(p.technicalScore);
      years[yearKey].rhythm.push(p.rhythmScore);
      years[yearKey].expr.push(p.expressionScore);
    });

    return Object.keys(years).map(yearName => {
      const data = years[yearName];
      const avgScore = Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length);
      const totalHours = data.hours.reduce((a, b) => a + b, 0);
      const avgTech = parseFloat((data.tech.reduce((a, b) => a + b, 0) / data.tech.length).toFixed(1));
      const avgRhythm = parseFloat((data.rhythm.reduce((a, b) => a + b, 0) / data.rhythm.length).toFixed(1));
      const avgExpr = parseFloat((data.expr.reduce((a, b) => a + b, 0) / data.expr.length).toFixed(1));

      // Determine level progression badge
      let badge = 'Bronze Star';
      if (totalHours >= 150) badge = 'Diamond Virtuoso';
      else if (totalHours >= 100) badge = 'Gold Master';
      else if (totalHours >= 50) badge = 'Silver Achiever';

      return {
        yearName,
        avgScore,
        totalHours,
        avgTech,
        avgRhythm,
        avgExpr,
        badge
      };
    }).reverse();
  }, [studentPerformances]);

  // Handle Log Record Form Submit
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formStudentId || !formLoggedBy || !formWeekStartDate) return;

    // Calculate composite overall score (weighted sum of 3 scores: tech*3.5 + rhythm*3.5 + expr*3.0 = 100 max)
    const overallScore = Math.min(
      100,
      Math.round(formTechnical * 3.4 + formRhythm * 3.3 + formExpression * 3.3)
    );

    onAddPerformanceRecord({
      leadId: formStudentId,
      weekStartDate: formWeekStartDate,
      technicalScore: formTechnical,
      rhythmScore: formRhythm,
      expressionScore: formExpression,
      practiceHours: formPracticeHours,
      overallScore,
      weeklyFocus: formWeeklyFocus || 'General Repertoire Mastery',
      teacherComments: formComments || 'Solid lesson progress, keep up the daily practicing scales.',
      loggedBy: formLoggedBy
    });

    // Reset fields except studentId & loggedBy
    setFormWeeklyFocus('');
    setFormComments('');
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-800 dark:text-white">Academy Student Performance Tracker</h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
            Monitor and record weekly, monthly, and yearly student syllabus progression, practice hours, and skill assessments
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all duration-150 shadow-md shadow-indigo-700/10 flex items-center gap-2 cursor-pointer self-stretch sm:self-auto justify-center"
        >
          <Plus className="w-4 h-4" />
          {showAddForm ? 'Close Logging Panel' : 'Log Student Performance'}
        </button>
      </div>

      {/* Log Form Slider */}
      {showAddForm && (
        <form onSubmit={handleFormSubmit} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-xl space-y-4 animate-in slide-in-from-top-4 duration-200">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800/80">
            <Sparkles className="text-indigo-600 dark:text-indigo-400 w-4.5 h-4.5 animate-bounce" />
            <h4 className="text-sm font-bold text-slate-800 dark:text-white">New Practice & Skill Performance Entry</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Student */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Tracked Student</label>
              <select
                value={formStudentId}
                onChange={(e) => setFormStudentId(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold p-2.5 text-slate-800 dark:text-slate-200 focus:bg-white"
                required
              >
                <option value="">-- Choose Student --</option>
                {activeStudents.map(student => (
                  <option key={student.id} value={student.id}>
                    {student.name} ({student.instrument})
                  </option>
                ))}
              </select>
            </div>

            {/* Week Starting */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Week Starting Date</label>
              <input
                type="date"
                value={formWeekStartDate}
                onChange={(e) => setFormWeekStartDate(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold p-2.5 text-slate-800 dark:text-slate-200 focus:bg-white"
                required
              />
            </div>

            {/* Instructor */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Evaluating Tutor</label>
              <select
                value={formLoggedBy}
                onChange={(e) => setFormLoggedBy(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold p-2.5 text-slate-800 dark:text-slate-200 focus:bg-white"
                required
              >
                {tutors.map(tutor => (
                  <option key={tutor.id} value={tutor.name}>
                    {tutor.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Scores Row */}
          <div className="bg-slate-50 dark:bg-slate-850/30 border border-slate-100 dark:border-slate-800/40 p-4 rounded-xl grid grid-cols-1 sm:grid-cols-4 gap-4">
            {/* Technical */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
                <span>Technical (1-10)</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-mono font-black">{formTechnical}/10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={formTechnical}
                onChange={(e) => setFormTechnical(Number(e.target.value))}
                className="accent-indigo-600 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Rhythm */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
                <span>Rhythm (1-10)</span>
                <span className="text-violet-600 dark:text-violet-400 font-mono font-black">{formRhythm}/10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={formRhythm}
                onChange={(e) => setFormRhythm(Number(e.target.value))}
                className="accent-violet-600 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Expression */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
                <span>Expression (1-10)</span>
                <span className="text-pink-600 dark:text-pink-400 font-mono font-black">{formExpression}/10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={formExpression}
                onChange={(e) => setFormExpression(Number(e.target.value))}
                className="accent-pink-600 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Practice Hours */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Practice Hours / Week</label>
              <input
                type="number"
                min="0"
                max="50"
                value={formPracticeHours}
                onChange={(e) => setFormPracticeHours(Number(e.target.value))}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold p-2 text-slate-800 dark:text-slate-200 focus:bg-white"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Weekly Focus & Repertoire</label>
              <input
                type="text"
                placeholder="e.g. Arpeggios, Suzuki Violin Book 2 piece No. 3"
                value={formWeeklyFocus}
                onChange={(e) => setFormWeeklyFocus(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold p-2.5 text-slate-800 dark:text-slate-200"
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Teacher Lesson Comments & Milestones</label>
              <input
                type="text"
                placeholder="Qualitative advice and homework guidelines for parents..."
                value={formComments}
                onChange={(e) => setFormComments(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold p-2.5 text-slate-800 dark:text-slate-200"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl transition-all shadow-md shadow-indigo-600/10"
            >
              Save Performance Record
            </button>
          </div>
        </form>
      )}

      {/* Select Student Toolbar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 p-4.5 rounded-2xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl">
            <User className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase block tracking-wider leading-none mb-1">Performance Track Target</span>
            <select
              value={selectedStudentId}
              onChange={(e) => {
                setSelectedStudentId(e.target.value);
              }}
              className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs rounded-xl p-1.5 px-3 font-bold text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="all">Academy Aggregated Overview</option>
              {activeStudents.map(student => (
                <option key={student.id} value={student.id}>{student.name} ({student.instrument})</option>
              ))}
            </select>
          </div>
        </div>

        {selectedStudentId !== 'all' && (
          <div className="flex gap-1.5 bg-slate-100/70 dark:bg-slate-850/60 p-1.5 rounded-xl border border-slate-200/40 dark:border-slate-800/40 self-start sm:self-auto">
            <button
              onClick={() => setActiveTab('weekly')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'weekly' 
                  ? 'bg-white dark:bg-slate-900 shadow-3xs text-indigo-600 dark:text-indigo-400' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
              }`}
            >
              Weekly Logs
            </button>
            <button
              onClick={() => setActiveTab('monthly')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'monthly' 
                  ? 'bg-white dark:bg-slate-900 shadow-3xs text-indigo-600 dark:text-indigo-400' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
              }`}
            >
              Monthly Review
            </button>
            <button
              onClick={() => setActiveTab('yearly')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'yearly' 
                  ? 'bg-white dark:bg-slate-900 shadow-3xs text-indigo-600 dark:text-indigo-400' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
              }`}
            >
              Yearly Milestones
            </button>
          </div>
        )}
      </div>

      {selectedStudentId === 'all' ? (
        /* ACADEMY SUMMARY VIEW */
        <div className="space-y-6">
          {/* Dashboard Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 p-5 rounded-2xl shadow-3xs flex flex-col justify-between h-[105px]">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Academy Average Score</span>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-2xl font-black font-mono text-indigo-600 dark:text-indigo-400">{academyStats.avgScore}/100</span>
                <span className="text-[10px] bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded font-bold">Excellent</span>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 p-5 rounded-2xl shadow-3xs flex flex-col justify-between h-[105px]">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Practice Hours Logged</span>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">{academyStats.totalHours} hrs</span>
                <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded font-bold">Total</span>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 p-5 rounded-2xl shadow-3xs flex flex-col justify-between h-[105px]">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Average Practice Commitment</span>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-2xl font-black font-mono text-violet-600 dark:text-violet-400">{academyStats.avgPractice} hr/wk</span>
                <span className="text-[10px] bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 px-1.5 py-0.5 rounded font-bold">Per Student</span>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 p-5 rounded-2xl shadow-3xs flex flex-col justify-between h-[105px]">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Weekly Reviews Logged</span>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-2xl font-black font-mono text-slate-700 dark:text-slate-300">{academyStats.totalEvaluations} records</span>
                <span className="text-[10px] bg-slate-50 dark:bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded font-bold font-mono">Durable</span>
              </div>
            </div>
          </div>

          {/* Aggregated charting */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chart Area */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 p-6 rounded-2xl shadow-xs space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800/60">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-indigo-500" />
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Weekly Grading Performance Curves</h4>
                </div>
                <span className="text-[9px] font-mono text-slate-400">Aggregated Timeline</span>
              </div>

              <div className="h-[280px] w-full">
                {performances.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-xs text-slate-400 font-semibold">No performance data exists.</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={performances}>
                      <defs>
                        <linearGradient id="colorOverall" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.25}/>
                          <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:stroke-slate-800/50" />
                      <XAxis dataKey="weekStartDate" stroke="#94a3b8" fontSize={10} fontFamily="monospace" />
                      <YAxis stroke="#94a3b8" fontSize={10} fontFamily="monospace" domain={[40, 100]} />
                      <Tooltip 
                        contentStyle={{ fontSize: '11px', fontWeight: 'bold' }}
                      />
                      <Area type="monotone" dataKey="overallScore" name="Composite Rating" stroke="#4f46e5" strokeWidth={2} fillOpacity={1} fill="url(#colorOverall)" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Side summary: Top Practicing leaders */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 p-6 rounded-2xl shadow-xs flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800/60">
                  <div className="flex items-center gap-2">
                    <Flame className="w-4.5 h-4.5 text-orange-500 animate-pulse" />
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Academy Weekly Practice Roster</h4>
                  </div>
                </div>

                <div className="space-y-3.5 max-h-[250px] overflow-y-auto pr-1">
                  {leads.filter(l => l.status === 'Active').map(student => {
                    const logs = performances.filter(p => p.leadId === student.id);
                    const avgHours = logs.length > 0 
                      ? Math.round(logs.reduce((acc, p) => acc + p.practiceHours, 0) / logs.length)
                      : 0;
                    
                    return (
                      <div key={student.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/50 dark:bg-slate-850/20 border border-slate-100 dark:border-slate-800/50">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs">
                            {student.name[0]}
                          </div>
                          <div>
                            <span onClick={() => onSelectLead(student.id)} className="text-xs font-bold text-slate-800 dark:text-slate-200 hover:text-indigo-600 hover:underline cursor-pointer">
                              {student.name}
                            </span>
                            <span className="text-[9px] text-slate-400 block font-mono uppercase font-semibold">{student.instrument}</span>
                          </div>
                        </div>

                        <div className="flex flex-col items-end">
                          <span className="text-xs font-bold font-mono text-emerald-600 dark:text-emerald-400">{avgHours} hr/wk</span>
                          <span className="text-[9px] text-slate-400">Avg Practice</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <div className="text-[10px] font-mono text-center text-slate-400 mt-4 leading-normal bg-indigo-50/20 dark:bg-slate-850 p-2.5 rounded-xl border border-dashed border-indigo-100 dark:border-slate-800">
                Weekly progress updates sync directly with the <span className="font-bold text-indigo-600 dark:text-indigo-400">Student Portal</span> timeline and dashboard.
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* INDIVIDUAL STUDENT PORTRAIT SECTION */
        <div className="space-y-6">
          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 p-5 rounded-2xl shadow-3xs flex flex-col justify-between h-[105px]">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Student Average Score</span>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-2xl font-black font-mono text-indigo-600 dark:text-indigo-400">{studentStats.avgScore}/100</span>
                <span className="text-[10px] bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded font-bold">Grade</span>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 p-5 rounded-2xl shadow-3xs flex flex-col justify-between h-[105px]">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Total Practice Hours</span>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">{studentStats.totalHours} hrs</span>
                <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded font-bold">Recorded</span>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 p-5 rounded-2xl shadow-3xs flex flex-col justify-between h-[105px]">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Avg Weekly Practice</span>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-2xl font-black font-mono text-violet-600 dark:text-violet-400">{studentStats.avgPractice} hr/wk</span>
                <span className="text-[10px] bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 px-1.5 py-0.5 rounded font-bold">Intensity</span>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 p-5 rounded-2xl shadow-3xs flex flex-col justify-between h-[105px]">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Weekly Submissions</span>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-2xl font-black font-mono text-slate-700 dark:text-slate-300">{studentStats.streak} weeks</span>
                <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded font-bold font-mono">Streak</span>
              </div>
            </div>
          </div>

          {/* TAB ROUTING FOR SELECTED INDIVIDUAL */}
          {activeTab === 'weekly' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Detailed Performance curves and scores */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Recharts progress */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 p-6 rounded-2xl shadow-xs space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800/60">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Syllabus Skills progression & overall rating</h4>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-500">
                      {selectedStudent?.instrument} ({selectedStudent?.level})
                    </span>
                  </div>

                  <div className="h-[250px]">
                    {studentPerformances.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-xs text-slate-400 italic">
                        No performance log entries exist for this student yet. Click "Log Student Performance" above.
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={studentPerformances}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:stroke-slate-800/50" />
                          <XAxis dataKey="weekStartDate" stroke="#94a3b8" fontSize={10} fontFamily="monospace" />
                          <YAxis stroke="#94a3b8" fontSize={10} fontFamily="monospace" domain={[40, 100]} />
                          <Tooltip contentStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
                          <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
                          <Line type="monotone" dataKey="overallScore" name="Overall Grade %" stroke="#4f46e5" strokeWidth={3} activeDot={{ r: 6 }} />
                          <Line type="monotone" dataKey="practiceHours" name="Practice (hrs)" stroke="#10b981" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>

                {/* Log list of weekly evals */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Historical Weekly Evaluation Logs</h4>
                  
                  {studentPerformances.length === 0 ? (
                    <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 p-8 rounded-2xl text-center text-xs text-slate-400">
                      No logs logged. Use the button in the upper right to begin grading lessons.
                    </div>
                  ) : (
                    studentPerformances.map((perf) => (
                      <div 
                        key={perf.id}
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-3xs hover:border-slate-300 dark:hover:border-slate-700 transition-all space-y-3"
                      >
                        <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-slate-100 dark:border-slate-800/60">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-100 bg-slate-100 dark:bg-slate-850 px-2.5 py-1 rounded-lg font-mono">
                              Week: {perf.weekStartDate}
                            </span>
                            <span className="text-[10px] text-slate-400">•</span>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold font-mono">
                              Recorded by: <span className="font-bold text-slate-700 dark:text-slate-300">{perf.loggedBy}</span>
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black font-mono text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-0.5 rounded-lg border border-indigo-100/30 dark:border-indigo-900/10">
                              Grade: {perf.overallScore}/100
                            </span>

                            <button
                              onClick={() => {
                                if (confirm('Are you sure you want to delete this weekly performance record?')) {
                                  onDeletePerformanceRecord(perf.id);
                                }
                              }}
                              className="p-1 rounded text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all"
                              title="Delete evaluation record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Core dimensions */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                          <div className="flex flex-col gap-1 p-2 bg-slate-50/50 dark:bg-slate-850/50 rounded-xl border border-slate-100/60 dark:border-slate-800/40">
                            <span className="text-[9px] text-slate-400 uppercase font-black tracking-wider leading-none">Technical Skill</span>
                            <span className="font-black text-slate-800 dark:text-slate-200 font-mono mt-1 text-sm">{perf.technicalScore}/10</span>
                          </div>
                          <div className="flex flex-col gap-1 p-2 bg-slate-50/50 dark:bg-slate-850/50 rounded-xl border border-slate-100/60 dark:border-slate-800/40">
                            <span className="text-[9px] text-slate-400 uppercase font-black tracking-wider leading-none">Rhythm & Tempo</span>
                            <span className="font-black text-slate-800 dark:text-slate-200 font-mono mt-1 text-sm">{perf.rhythmScore}/10</span>
                          </div>
                          <div className="flex flex-col gap-1 p-2 bg-slate-50/50 dark:bg-slate-850/50 rounded-xl border border-slate-100/60 dark:border-slate-800/40">
                            <span className="text-[9px] text-slate-400 uppercase font-black tracking-wider leading-none">Artistic Expression</span>
                            <span className="font-black text-slate-800 dark:text-slate-200 font-mono mt-1 text-sm">{perf.expressionScore}/10</span>
                          </div>
                          <div className="flex flex-col gap-1 p-2 bg-slate-50/50 dark:bg-slate-850/50 rounded-xl border border-slate-100/60 dark:border-slate-800/40">
                            <span className="text-[9px] text-slate-400 uppercase font-black tracking-wider leading-none">Hours Practiced</span>
                            <span className="font-black text-emerald-600 dark:text-emerald-400 font-mono mt-1 text-sm">{perf.practiceHours} hours</span>
                          </div>
                        </div>

                        <div className="text-xs leading-relaxed font-semibold bg-slate-50/40 dark:bg-slate-900/40 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                          <p className="text-indigo-600 dark:text-indigo-400 mb-1 font-bold text-[10px] uppercase font-mono tracking-wider">Lesson Focus Repertoire</p>
                          <p className="text-slate-800 dark:text-slate-200 font-bold mb-3">"{perf.weeklyFocus}"</p>
                          <p className="text-slate-400 uppercase font-bold text-[9px] font-mono tracking-wider mb-1">Teacher Feedback Notes</p>
                          <p className="text-slate-500 dark:text-slate-400 font-medium">"{perf.teacherComments}"</p>
                        </div>
                      </div>
                    )).reverse()
                  )}
                </div>

              </div>

              {/* Sidebar aggregate / parameters info card */}
              <div className="space-y-6">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-xs space-y-4">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 pb-2 border-b border-slate-100 dark:border-slate-800/60 flex items-center gap-2">
                    <Award className="text-indigo-500 w-4 h-4" />
                    Syllabus Level Runway
                  </h4>

                  <div className="space-y-4">
                    {/* Technical skill */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[11px] font-bold text-slate-500">
                        <span>Technical Proficiency</span>
                        <span>{studentStats.avgTechnical}/10</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                        <div className="bg-indigo-600 dark:bg-indigo-500 h-2 rounded-full" style={{ width: `${studentStats.avgTechnical * 10}%` }} />
                      </div>
                    </div>

                    {/* Rhythm */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[11px] font-bold text-slate-500">
                        <span>Tempo & Rhythm Control</span>
                        <span>{studentStats.avgRhythm}/10</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                        <div className="bg-violet-600 dark:bg-violet-500 h-2 rounded-full" style={{ width: `${studentStats.avgRhythm * 10}%` }} />
                      </div>
                    </div>

                    {/* Expression */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[11px] font-bold text-slate-500">
                        <span>Aesthetic Expression</span>
                        <span>{studentStats.avgExpression}/10</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                        <div className="bg-pink-600 dark:bg-pink-500 h-2 rounded-full" style={{ width: `${studentStats.avgExpression * 10}%` }} />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800/60 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Graduation Runway</span>
                      <span className="text-xs font-black text-slate-800 dark:text-slate-200">
                        {studentStats.avgScore >= 85 ? 'Eligible for Level Promotion' : `${85 - studentStats.avgScore} pts until next Level`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Focus advice box */}
                <div className="bg-slate-900 text-slate-100 border border-slate-800 p-6 rounded-2xl shadow-lg space-y-3">
                  <div className="flex items-center gap-2 text-indigo-400">
                    <Sparkles className="w-4 h-4 animate-spin-slow" />
                    <h5 className="text-xs font-bold font-mono uppercase tracking-wider">Lesson Planner Insights</h5>
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-400 font-medium">
                    Based on historical lessons, <span className="text-white font-bold">{selectedStudent?.name}</span>'s key challenge is <span className="text-indigo-300 font-bold">Rhythm Hold</span>. Assign metronome drills of 10-15 minutes daily before regular recital repertoire.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'monthly' && (
            <div className="space-y-6">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Aggregated Monthly Academic Reviews</h4>

              {monthlyPerformances.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 py-12 text-center text-xs text-slate-400 italic">
                  No monthly evaluations exist yet.
                </div>
              ) : (
                monthlyPerformances.map((mon, idx) => (
                  <div 
                    key={idx}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/85 p-6 rounded-2xl shadow-3xs hover:border-indigo-500/30 transition-all grid grid-cols-1 md:grid-cols-3 gap-6"
                  >
                    {/* Left: Month title and general averages */}
                    <div className="space-y-3 pb-4 md:pb-0 border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800/60 pr-0 md:pr-6 flex flex-col justify-between">
                      <div>
                        <h4 className="text-sm font-black text-slate-800 dark:text-slate-100">{mon.monthName}</h4>
                        <span className="text-[10px] text-slate-400 font-bold block mt-0.5 uppercase tracking-wider font-mono">Monthly Status: Active</span>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block font-mono">Monthly Average Score</span>
                        <span className="text-3xl font-black font-mono text-indigo-600 dark:text-indigo-400">{mon.overallScore || mon.avgScore}/100</span>
                      </div>
                    </div>

                    {/* Middle: Key components averages */}
                    <div className="space-y-3 pb-4 md:pb-0 border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800/60 pr-0 md:pr-6">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block font-mono">Core Skills Averages</span>
                      
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-850 p-2 rounded-xl">
                          <span className="font-bold text-slate-500">Technical Mastery</span>
                          <span className="font-mono font-black text-slate-800 dark:text-slate-200">{mon.avgTech}/10</span>
                        </div>
                        <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-850 p-2 rounded-xl">
                          <span className="font-bold text-slate-500">Tempo & Rhythm</span>
                          <span className="font-mono font-black text-slate-800 dark:text-slate-200">{mon.avgRhythm}/10</span>
                        </div>
                        <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-850 p-2 rounded-xl">
                          <span className="font-bold text-slate-500">Expression Dynamics</span>
                          <span className="font-mono font-black text-slate-800 dark:text-slate-200">{mon.avgExpr}/10</span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Practice commitment and focus history */}
                    <div className="flex flex-col justify-between">
                      <div className="space-y-1.5">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block font-mono">Repertoire Focus Covered</span>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {mon.foci.length === 0 ? (
                            <span className="text-xs text-slate-400 font-medium italic">Standard practice scales</span>
                          ) : (
                            mon.foci.map((focus, fIdx) => (
                              <span key={fIdx} className="text-[10px] bg-slate-100 dark:bg-slate-850 text-slate-600 dark:text-slate-400 px-2.5 py-0.5 rounded-lg border border-slate-200/40 dark:border-slate-800/40 truncate max-w-full">
                                {focus}
                              </span>
                            ))
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-4 border-t border-slate-100 dark:border-slate-800/40">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-xs text-slate-400">Monthly Practice Hours: <span className="font-bold text-emerald-600 font-mono">{mon.totalHours} hours</span></span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'yearly' && (
            <div className="space-y-6">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Syllabus Milestones & Annual progression</h4>

              {yearlyPerformances.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 py-12 text-center text-xs text-slate-400 italic">
                  No annual evaluations exist yet.
                </div>
              ) : (
                yearlyPerformances.map((yr, idx) => (
                  <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-xs space-y-6">
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/60 flex-wrap gap-4">
                      <div>
                        <h4 className="text-base font-black text-slate-800 dark:text-slate-100">Annual Review - Year {yr.yearName}</h4>
                        <span className="text-[10px] text-slate-400 font-bold block mt-0.5 font-mono">Academic Achievement Report Card</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-orange-600 bg-orange-50 dark:bg-orange-950/40 border border-orange-100/40 px-3 py-1 rounded-xl">
                          Award: {yr.badge}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block font-mono">Annual Cumulative practice</span>
                        <span className="text-3xl font-black font-mono text-emerald-600 dark:text-emerald-400">{yr.totalHours} hrs</span>
                        <span className="text-[10px] text-slate-400 block font-medium">Recorded at home</span>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block font-mono">Yearly Average Assessment</span>
                        <span className="text-3xl font-black font-mono text-indigo-600 dark:text-indigo-400">{yr.avgScore}/100</span>
                        <span className="text-[10px] text-slate-400 block font-medium">Composite evaluations</span>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block font-mono">Annual Grade Runway</span>
                        <div className="flex items-center gap-1.5 mt-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Winter Recital Performer</span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Scale Certification level 1</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-850/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800/40 flex items-start gap-3">
                      <Sparkles className="w-4.5 h-4.5 text-indigo-500 shrink-0 mt-0.5 animate-pulse" />
                      <div>
                        <h6 className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest font-mono">Teacher annual synthesis</h6>
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed mt-1">
                          Throughout {yr.yearName}, {selectedStudent?.name} showed persistent practice devotion with a total of {yr.totalHours} practicing hours. Technical proficiency remains strong at {yr.avgTech}/10. Future learning paths should target advanced rhythmic syncopations and expressive dynamics on the {selectedStudent?.instrument}.
                        </p>
                      </div>
                    </div>

                  </div>
                ))
              )}
            </div>
          )}

        </div>
      )}

    </div>
  );
}
