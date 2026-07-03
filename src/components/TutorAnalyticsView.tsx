import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Clock, 
  Award, 
  TrendingUp, 
  UserCheck, 
  Star, 
  HeartHandshake, 
  Sparkles, 
  ArrowUpRight, 
  Percent, 
  BookOpen, 
  CheckCircle2, 
  AlertCircle,
  BarChart3,
  Search,
  Filter,
  GraduationCap,
  Calendar
} from 'lucide-react';
import { Lead, Tutor, LessonEvent, WeeklyPerformance } from '../types';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  Cell,
  ComposedChart,
  Line
} from 'recharts';

interface TutorAnalyticsViewProps {
  leads: Lead[];
  tutors: Tutor[];
  lessons: LessonEvent[];
  performances: WeeklyPerformance[];
  onSelectLead: (leadId: string) => void;
}

export default function TutorAnalyticsView({
  leads,
  tutors,
  lessons,
  performances,
  onSelectLead
}: TutorAnalyticsViewProps) {
  const [selectedTutorId, setSelectedTutorId] = useState<string>('all');
  const [timePeriod, setTimePeriod] = useState<'30days' | '90days' | 'all'>('all');
  const [specialtyFilter, setSpecialtyFilter] = useState<string>('All');

  // Compute tutor list with their computed analytics metrics
  const tutorMetricsList = useMemo(() => {
    return tutors.map(tutor => {
      // 1. Leads/Students assigned to this tutor
      const assignedLeads = leads.filter(l => l.assignedTutorId === tutor.id);
      const activeStudents = assignedLeads.filter(l => l.status === 'Active');
      const inactiveStudents = assignedLeads.filter(l => l.status === 'Inactive');
      
      // 2. Student Retention Rate
      // Formula: Active / (Active + Inactive) * 100
      const totalStudentsForRetention = activeStudents.length + inactiveStudents.length;
      const retentionRate = totalStudentsForRetention > 0 
        ? Math.round((activeStudents.length / totalStudentsForRetention) * 100) 
        : 100; // default to 100 if no students have finalized status yet

      // 3. Lessons Taught
      // Filter lessons by date period if selected
      const tutorLessons = lessons.filter(l => {
        if (l.tutorId !== tutor.id) return false;
        if (timePeriod === 'all') return true;
        
        const dateLimit = new Date();
        if (timePeriod === '30days') dateLimit.setDate(dateLimit.getDate() - 30);
        if (timePeriod === '90days') dateLimit.setDate(dateLimit.getDate() - 90);
        
        return new Date(l.date) >= dateLimit;
      });

      const completedLessons = tutorLessons.filter(l => l.status === 'Completed');
      const totalHours = completedLessons.reduce((acc, l) => acc + (l.durationMinutes / 60), 0);
      const attendancePresent = completedLessons.filter(l => l.attendance === 'Present').length;
      const attendanceAbsent = completedLessons.filter(l => l.status === 'Completed' && l.attendance === 'Absent').length;
      const attendanceTotal = attendancePresent + attendanceAbsent;
      const attendanceRate = attendanceTotal > 0 
        ? Math.round((attendancePresent / attendanceTotal) * 100) 
        : 100;

      // 4. Tutor Efficiency (Lesson Completion vs Cancellation Rate)
      const cancelledCount = tutorLessons.filter(l => l.status === 'Cancelled').length;
      const totalScheduledAndCancelled = completedLessons.length + cancelledCount;
      const completionEfficiency = totalScheduledAndCancelled > 0 
        ? Math.round((completedLessons.length / totalScheduledAndCancelled) * 100) 
        : 100;

      // 5. Evaluation Ratings & Progress
      // Match by teacher's name (loggedBy)
      const evaluationsLogged = performances.filter(p => p.loggedBy === tutor.name);
      const avgPerformanceScore = evaluationsLogged.length > 0 
        ? Math.round(evaluationsLogged.reduce((acc, p) => acc + p.overallScore, 0) / evaluationsLogged.length)
        : 80; // baseline if none logged yet

      // 6. Trial conversion rate
      // Trials completed vs converted to Active status
      const trialLessons = tutorLessons.filter(l => l.type === 'Trial');
      const completedTrials = trialLessons.filter(l => l.status === 'Completed');
      // Converted means the lead who took a trial is now Active
      const convertedTrialsCount = completedTrials.filter(trial => {
        const lead = leads.find(l => l.id === trial.leadId);
        return lead && lead.status === 'Active';
      }).length;
      const trialConversionRate = completedTrials.length > 0
        ? Math.round((convertedTrialsCount / completedTrials.length) * 100)
        : 0;

      return {
        tutor,
        activeCount: activeStudents.length,
        inactiveCount: inactiveStudents.length,
        retentionRate,
        totalLessons: completedLessons.length,
        totalHours: parseFloat(totalHours.toFixed(1)),
        attendanceRate,
        completionEfficiency,
        avgPerformanceScore,
        evaluationsCount: evaluationsLogged.length,
        trialConversionRate,
        completedTrialsCount: completedTrials.length
      };
    });
  }, [tutors, leads, lessons, performances, timePeriod]);

  // Apply specialties filter
  const filteredMetricsList = useMemo(() => {
    if (specialtyFilter === 'All') return tutorMetricsList;
    return tutorMetricsList.filter(item => 
      item.tutor.specialty.some(s => s.toLowerCase().includes(specialtyFilter.toLowerCase()))
    );
  }, [tutorMetricsList, specialtyFilter]);

  // Get list of unique specialties for filtering dropdown
  const uniqueSpecialties = useMemo(() => {
    const list = new Set<string>();
    tutors.forEach(t => t.specialty.forEach(s => list.add(s)));
    return Array.from(list);
  }, [tutors]);

  // Selected individual tutor analytics details
  const selectedTutorData = useMemo(() => {
    if (selectedTutorId === 'all') return null;
    return tutorMetricsList.find(m => m.tutor.id === selectedTutorId) || null;
  }, [tutorMetricsList, selectedTutorId]);

  // Selected tutor's list of students with detailed performance indicators
  const selectedTutorStudents = useMemo(() => {
    if (!selectedTutorData) return [];
    return leads
      .filter(l => l.assignedTutorId === selectedTutorData.tutor.id)
      .map(student => {
        // Find their performance logs
        const studentEvals = performances.filter(p => p.leadId === student.id);
        const avgScore = studentEvals.length > 0 
          ? Math.round(studentEvals.reduce((acc, p) => acc + p.overallScore, 0) / studentEvals.length)
          : null;
        
        // Find their lessons
        const studentLessons = lessons.filter(l => l.leadId === student.id && l.tutorId === selectedTutorData.tutor.id);
        const completedCount = studentLessons.filter(l => l.status === 'Completed').length;
        const totalDuration = studentLessons.reduce((acc, l) => acc + (l.status === 'Completed' ? l.durationMinutes : 0), 0) / 60;

        return {
          student,
          avgScore,
          completedCount,
          totalHours: parseFloat(totalDuration.toFixed(1)),
          evalCount: studentEvals.length
        };
      });
  }, [leads, selectedTutorData, performances, lessons]);

  // Global academy summary statistics
  const academyAverages = useMemo(() => {
    if (tutorMetricsList.length === 0) return { avgRetention: 0, totalHours: 0, avgScore: 0, avgConversion: 0 };
    const sumRetention = tutorMetricsList.reduce((acc, m) => acc + m.retentionRate, 0);
    const sumHours = tutorMetricsList.reduce((acc, m) => acc + m.totalHours, 0);
    const sumScore = tutorMetricsList.reduce((acc, m) => acc + m.avgPerformanceScore, 0);
    const sumConversion = tutorMetricsList.reduce((acc, m) => acc + m.trialConversionRate, 0);

    return {
      avgRetention: Math.round(sumRetention / tutorMetricsList.length),
      totalHours: parseFloat(sumHours.toFixed(1)),
      avgScore: Math.round(sumScore / tutorMetricsList.length),
      avgConversion: Math.round(sumConversion / tutorMetricsList.length)
    };
  }, [tutorMetricsList]);

  // Chart data for comparing tutors
  const comparisonChartData = useMemo(() => {
    return filteredMetricsList.map(item => ({
      name: item.tutor.name,
      hours: item.totalHours,
      retention: item.retentionRate,
      rating: item.avgPerformanceScore,
      conversion: item.trialConversionRate,
      lessons: item.totalLessons
    }));
  }, [filteredMetricsList]);

  return (
    <div className="space-y-6">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-800 dark:text-white">Tutor Performance & Retention Analytics</h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
            Analyze tutor instruction workloads, class retention indexes, trial lesson conversions, and aggregate syllabus grading
          </p>
        </div>

        {/* Filters and period switcher */}
        <div className="flex flex-wrap items-center gap-3 self-stretch sm:self-auto">
          <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-xl text-xs font-semibold">
            <Calendar className="w-3.5 h-3.5 text-indigo-500" />
            <select
              value={timePeriod}
              onChange={(e) => setTimePeriod(e.target.value as any)}
              className="bg-transparent border-none text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="all">Lifetime Period</option>
              <option value="90days">Past 90 Days</option>
              <option value="30days">Past 30 Days</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-xl text-xs font-semibold">
            <Filter className="w-3.5 h-3.5 text-indigo-500" />
            <select
              value={specialtyFilter}
              onChange={(e) => setSpecialtyFilter(e.target.value)}
              className="bg-transparent border-none text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="All">All Specialties</option>
              {uniqueSpecialties.map(spec => (
                <option key={spec} value={spec}>{spec}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Target Selector Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 p-4.5 rounded-2xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase block tracking-wider leading-none mb-1">Analytical Target focus</span>
            <select
              value={selectedTutorId}
              onChange={(e) => setSelectedTutorId(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs rounded-xl p-1.5 px-3 font-bold text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value="all">Academy Aggregated Overview (Compare All)</option>
              {tutors.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
        </div>

        {selectedTutorId === 'all' && (
          <span className="text-right text-[11px] font-mono font-black text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 p-1.5 px-3 rounded-lg border border-indigo-100/30">
            Comparing {filteredMetricsList.length} instructors
          </span>
        )}
      </div>

      {selectedTutorId === 'all' ? (
        /* ==================== ACADEMY-WIDE AGGREGATED COMPARISON ==================== */
        <div className="space-y-6">
          
          {/* Academy Metrics Scorecard */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-3xs flex flex-col justify-between h-[110px]">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Average Retention</span>
                <HeartHandshake className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">{academyAverages.avgRetention}%</span>
                <span className="text-[9px] bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-300 px-1.5 py-0.5 rounded font-black uppercase font-mono">Stable</span>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-3xs flex flex-col justify-between h-[110px]">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Lesson Hours</span>
                <Clock className="w-4 h-4 text-indigo-500" />
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black font-mono text-indigo-600 dark:text-indigo-400">{academyAverages.totalHours} hrs</span>
                <span className="text-[9px] bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-300 px-1.5 py-0.5 rounded font-black uppercase font-mono">Completed</span>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-3xs flex flex-col justify-between h-[110px]">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Average Lesson Rating</span>
                <Star className="w-4 h-4 text-amber-500" />
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black font-mono text-amber-500">{academyAverages.avgScore}/100</span>
                <span className="text-[9px] bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-300 px-1.5 py-0.5 rounded font-black uppercase font-mono">Strong</span>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-3xs flex flex-col justify-between h-[110px]">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Trial Conversion</span>
                <UserCheck className="w-4 h-4 text-violet-500" />
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black font-mono text-violet-600 dark:text-violet-400">{academyAverages.avgConversion}%</span>
                <span className="text-[9px] bg-violet-50 dark:bg-violet-950/30 text-violet-600 dark:text-violet-300 px-1.5 py-0.5 rounded font-black uppercase font-mono">Growth</span>
              </div>
            </div>
          </div>

          {/* Visual Charts Comparison */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Total Lesson Hours Comparison Chart */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-xs space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800/60">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-indigo-500" />
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Workload Comparison (Total Lesson Hours)</h4>
                </div>
                <span className="text-[9px] font-mono text-slate-400">Sum of Lesson Durations</span>
              </div>

              <div className="h-[260px] w-full">
                {comparisonChartData.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-xs text-slate-400">No data available.</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={comparisonChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:stroke-slate-800/50" />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} label={{ value: 'Hours', angle: -90, position: 'insideLeft', fontSize: 9 }} />
                      <Tooltip contentStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
                      <Bar dataKey="hours" name="Lesson Hours" radius={[6, 6, 0, 0]}>
                        {comparisonChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#4f46e5' : '#10b981'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Student Retention & Trial Conversion rates */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-xs space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800/60">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4.5 h-4.5 text-emerald-500" />
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Efficiency Rates (Retention vs Trial Conversion)</h4>
                </div>
                <span className="text-[9px] font-mono text-slate-400">Percentage Metrics (%)</span>
              </div>

              <div className="h-[260px] w-full">
                {comparisonChartData.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-xs text-slate-400">No data available.</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={comparisonChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:stroke-slate-800/50" />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} domain={[0, 100]} />
                      <Tooltip contentStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
                      <Legend wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }} />
                      <Bar dataKey="retention" name="Student Retention Rate %" fill="#10b981" radius={[4, 4, 0, 0]} barSize={25} />
                      <Line type="monotone" dataKey="conversion" name="Trial Conversion Rate %" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4 }} />
                    </ComposedChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

          </div>

          {/* Detailed Leaderboard Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl shadow-xs overflow-hidden">
            <div className="p-4.5 border-b border-slate-100 dark:border-slate-800/60 flex justify-between items-center">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Tutor Efficiency Rankings & Standings</h4>
              <span className="text-[10px] text-slate-400 uppercase font-mono font-bold">Standard metrics sorting</span>
            </div>

            <div className="overflow-x-auto font-semibold">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850/20 text-slate-400 dark:text-slate-500 text-[10px] uppercase font-black tracking-wider">
                    <th className="py-3 px-6">Instructor Name</th>
                    <th className="py-3 px-6">Specialties</th>
                    <th className="py-3 px-6 text-center">Active / Inactive</th>
                    <th className="py-3 px-6 text-center">Lessons Logged</th>
                    <th className="py-3 px-6 text-center">Total Hours</th>
                    <th className="py-3 px-6 text-center">Avg Rating</th>
                    <th className="py-3 px-6 text-center">Retention Index</th>
                    <th className="py-3 px-6 text-right">Trial Conversion</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40 text-xs">
                  {filteredMetricsList.map((row) => (
                    <tr key={row.tutor.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="py-3.5 px-6 font-bold text-slate-800 dark:text-slate-100">
                        <div className="flex items-center gap-2.5">
                          <img 
                            src={row.tutor.avatar} 
                            alt={row.tutor.name} 
                            className="w-7 h-7 rounded-xl object-cover border border-slate-200/50"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <span 
                              onClick={() => setSelectedTutorId(row.tutor.id)}
                              className="hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer hover:underline block leading-tight"
                            >
                              {row.tutor.name}
                            </span>
                            <span className="text-[9px] text-slate-400 font-normal">Tutor Profile View</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-6 font-mono text-slate-500 max-w-[200px] truncate">
                        {row.tutor.specialty.join(', ')}
                      </td>
                      <td className="py-3.5 px-6 text-center font-mono">
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">{row.activeCount}</span>
                        <span className="text-slate-300 dark:text-slate-700 mx-1">/</span>
                        <span className="text-rose-500">{row.inactiveCount}</span>
                      </td>
                      <td className="py-3.5 px-6 text-center font-mono font-bold text-slate-700 dark:text-slate-300">
                        {row.totalLessons} classes
                      </td>
                      <td className="py-3.5 px-6 text-center font-mono font-black text-slate-800 dark:text-slate-100">
                        {row.totalHours} hrs
                      </td>
                      <td className="py-3.5 px-6 text-center">
                        <div className="inline-flex items-center gap-1 font-mono text-slate-700 dark:text-slate-300">
                          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                          <span>{row.avgPerformanceScore}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-6 text-center">
                        <span className={`px-2 py-0.5 rounded-lg border font-mono font-black ${
                          row.retentionRate >= 80 
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/40' 
                            : 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-950/40'
                        }`}>
                          {row.retentionRate}%
                        </span>
                      </td>
                      <td className="py-3.5 px-6 text-right font-mono">
                        <span className="text-violet-600 dark:text-violet-400 font-bold bg-violet-50 dark:bg-violet-950/40 px-2 py-0.5 rounded-lg border border-violet-100 dark:border-violet-900/10">
                          {row.trialConversionRate}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      ) : (
        /* ==================== INDIVIDUAL INSTRUCTOR PORTRAIT ANALYTICS ==================== */
        selectedTutorData && (
          <div className="space-y-6">
            
            {/* Tutor Overview Badge Info */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <img 
                  src={selectedTutorData.tutor.avatar} 
                  alt={selectedTutorData.tutor.name} 
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-indigo-100 dark:border-indigo-900"
                  referrerPolicy="no-referrer"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-black text-slate-800 dark:text-white leading-none">
                      {selectedTutorData.tutor.name}
                    </h4>
                    <span className="text-[10px] bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded font-bold">
                      Tutor ID: {selectedTutorData.tutor.id}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Specialty Areas: <span className="text-indigo-600 dark:text-indigo-400 font-bold">{selectedTutorData.tutor.specialty.join(', ')}</span>
                  </p>

                  <div className="flex items-center gap-3 text-[11px] text-slate-400 font-semibold font-mono">
                    <span>Lessons Taught: <span className="text-slate-700 dark:text-slate-300 font-bold">{selectedTutorData.totalLessons}</span></span>
                    <span>•</span>
                    <span>Class Completion: <span className="text-slate-700 dark:text-slate-300 font-bold">{selectedTutorData.completionEfficiency}%</span></span>
                  </div>
                </div>
              </div>

              {/* Status metrics pillbox */}
              <div className="flex gap-4 self-stretch md:self-auto justify-between border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800/80 pt-4 md:pt-0 pl-0 md:pl-6">
                <div className="text-center md:text-left">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block font-mono">Retention Rate</span>
                  <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-0.5 block">
                    {selectedTutorData.retentionRate}%
                  </span>
                </div>
                <div className="text-center md:text-left">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block font-mono">Completed Hours</span>
                  <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-mono mt-0.5 block">
                    {selectedTutorData.totalHours} hrs
                  </span>
                </div>
                <div className="text-center md:text-left">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block font-mono">Average Evaluation</span>
                  <span className="text-2xl font-black text-amber-500 font-mono mt-0.5 block">
                    {selectedTutorData.avgPerformanceScore}/100
                  </span>
                </div>
              </div>
            </div>

            {/* Individual Grid Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column: Student Roster assigned and retention standing */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active assigned Students ({selectedTutorStudents.length})</h4>
                  <span className="text-[9px] font-mono text-slate-400">Class ledger overview</span>
                </div>

                {selectedTutorStudents.length === 0 ? (
                  <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 p-8 rounded-2xl text-center text-xs text-slate-400 italic">
                    No students currently assigned to this instructor.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {selectedTutorStudents.map(({ student, avgScore, completedCount, totalHours, evalCount }) => (
                      <div 
                        key={student.id}
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 p-4.5 rounded-2xl shadow-3xs space-y-3.5 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-0.5">
                            <span 
                              onClick={() => onSelectLead(student.id)}
                              className="text-xs font-bold text-slate-800 dark:text-slate-100 hover:text-indigo-600 cursor-pointer block hover:underline"
                            >
                              {student.name}
                            </span>
                            <span className="text-[9px] text-slate-400 font-mono uppercase font-semibold">
                              {student.instrument} ({student.level})
                            </span>
                          </div>

                          <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-md ${
                            student.status === 'Active' 
                              ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300' 
                              : 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-300'
                          }`}>
                            {student.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono bg-slate-50/50 dark:bg-slate-850/50 p-2 rounded-xl">
                          <div>
                            <span className="text-slate-400 block text-[8px] font-bold uppercase leading-none mb-1">Classes</span>
                            <span className="font-bold text-slate-700 dark:text-slate-300">{completedCount} log</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[8px] font-bold uppercase leading-none mb-1">Hours</span>
                            <span className="font-bold text-slate-700 dark:text-slate-300">{totalHours} hrs</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[8px] font-bold uppercase leading-none mb-1">Grade</span>
                            <span className="font-bold text-indigo-600 dark:text-indigo-400">{avgScore ? `${avgScore}%` : '--'}</span>
                          </div>
                        </div>

                        <p className="text-[10px] text-slate-400 font-medium truncate italic">
                          "{student.notes || 'No active homework notes recorded yet.'}"
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column: Instructor Efficiency Radar Summary */}
              <div className="space-y-6">
                
                {/* Retention and Trial Summary Box */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-4">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 pb-2 border-b border-slate-100 dark:border-slate-800/60 flex items-center gap-2">
                    <Sparkles className="text-indigo-500 w-4 h-4" />
                    Trial & Conversion Status
                  </h4>

                  <div className="space-y-3.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-slate-500">Completed Trial Slots</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                        {selectedTutorData.completedTrialsCount} trials
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-slate-500">Trial to Enrollment Ratio</span>
                      <span className="font-mono font-bold text-violet-600 dark:text-violet-400">
                        {selectedTutorData.trialConversionRate}%
                      </span>
                    </div>

                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                      <div className="bg-violet-600 h-2 rounded-full" style={{ width: `${selectedTutorData.trialConversionRate}%` }} />
                    </div>

                    <div className="flex justify-between items-center text-xs pt-1">
                      <span className="font-semibold text-slate-500">Attendance Present Index</span>
                      <span className="font-mono font-bold text-emerald-600">
                        {selectedTutorData.attendanceRate}%
                      </span>
                    </div>

                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                      <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${selectedTutorData.attendanceRate}%` }} />
                    </div>
                  </div>
                </div>

                {/* Staff Advisor Advice Box */}
                <div className="bg-slate-900 text-slate-100 border border-slate-800 p-5 rounded-2xl shadow-lg space-y-3">
                  <div className="flex items-center gap-2 text-indigo-400">
                    <Award className="w-4 h-4 animate-pulse" />
                    <h5 className="text-xs font-bold font-mono uppercase tracking-wider">Instructor Capacity Advisor</h5>
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-400 font-medium">
                    {selectedTutorData.retentionRate >= 85 
                      ? `${selectedTutorData.tutor.name} exhibits extremely high student retention (${selectedTutorData.retentionRate}%). We recommend assigning new intermediate and advanced trial leads to their cohort to capitalize on retention efficiency.`
                      : `${selectedTutorData.tutor.name}'s retention rate sits at ${selectedTutorData.retentionRate}%. Consider scheduling syllabus refinement workshops or reviewing current repertoire assignment choices.`}
                  </p>
                </div>

              </div>

            </div>

          </div>
        )
      )}

    </div>
  );
}
