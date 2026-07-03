import React, { useState } from 'react';
import { 
  X, 
  Phone, 
  Mail, 
  Calendar, 
  DollarSign, 
  User, 
  BookOpen, 
  Clock, 
  Plus, 
  MessageSquare,
  HelpCircle,
  FileText,
  Music,
  CheckCircle,
  Send,
  Trash,
  Activity,
  Sparkles,
  TrendingUp,
  Award,
  Instagram,
  Facebook,
  Youtube,
  Cake,
  Gift,
  Copy,
  ExternalLink
} from 'lucide-react';
import { Lead, Tutor, Interaction, LessonEvent, LeadStatus, WeeklyPerformance } from '../types';

interface LeadDrawerProps {
  lead: Lead;
  tutors: Tutor[];
  interactions: Interaction[];
  performances: WeeklyPerformance[];
  onClose: () => void;
  onUpdateLead: (updated: Lead) => void;
  onAddInteraction: (leadId: string, type: Interaction['type'], summary: string, details: string, staffName: string) => void;
  onAddLesson: (lesson: Omit<LessonEvent, 'id'>) => void;
  onDeleteLead?: (leadId: string) => void;
  onAddPerformanceRecord: (perf: Omit<WeeklyPerformance, 'id' | 'createdAt'>) => void;
  onDeletePerformanceRecord: (id: string) => void;
}

type TabType = 'timeline' | 'log-interaction' | 'schedule-lesson' | 'profile' | 'performance';

export default function LeadDrawer({ 
  lead, 
  tutors, 
  interactions, 
  performances,
  onClose, 
  onUpdateLead,
  onAddInteraction,
  onAddLesson,
  onDeleteLead,
  onAddPerformanceRecord,
  onDeletePerformanceRecord
}: LeadDrawerProps) {
  const [activeTab, setActiveTab] = useState<TabType>('timeline');
  
  // Log Interaction state
  const [intType, setIntType] = useState<Interaction['type']>('Call');
  const [intSummary, setIntSummary] = useState('');
  const [intDetails, setIntDetails] = useState('');
  const [intStaff, setIntStaff] = useState('Ganesh (Registrar)');

  // Schedule lesson state
  const [lesDate, setLesDate] = useState('');
  const [lesTime, setLesTime] = useState('');
  const [lesDuration, setLesDuration] = useState(30);
  const [lesTutorId, setLesTutorId] = useState(lead.assignedTutorId || tutors[0]?.id || '');
  const [lesType, setLesType] = useState<LessonEvent['type']>('Trial');

  // Weekly Performance state
  const [perfWeekStartDate, setPerfWeekStartDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [perfTechnicalScore, setPerfTechnicalScore] = useState(7);
  const [perfRhythmScore, setPerfRhythmScore] = useState(7);
  const [perfExpressionScore, setPerfExpressionScore] = useState(7);
  const [perfPracticeHours, setPerfPracticeHours] = useState(5);
  const [perfFocusArea, setPerfFocusArea] = useState('');
  const [perfTeacherComments, setPerfTeacherComments] = useState('');
  const [perfLoggedBy, setPerfLoggedBy] = useState(() => {
    const matched = tutors.find(t => t.id === lead.assignedTutorId);
    return matched ? matched.name : (tutors[0]?.name || 'Tutor Staff');
  });
  const [showAddPerf, setShowAddPerf] = useState(false);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiAnalysisReport, setAiAnalysisReport] = useState<string | null>(null);

  // Filter interactions for this lead
  const leadInteractions = interactions
    .filter(i => i.leadId === lead.id)
    .sort((a, b) => b.date.localeCompare(a.date));

  // Filter performance records for this lead
  const leadPerformances = performances
    .filter(p => p.leadId === lead.id)
    .sort((a, b) => a.weekStartDate.localeCompare(b.weekStartDate)); // chronological for charting

  const generateAIPedagogyAnalysis = () => {
    setAiAnalyzing(true);
    setAiAnalysisReport(null);
    
    setTimeout(() => {
      // Calculate average metrics
      const studentPerfs = performances.filter(p => p.leadId === lead.id);
      if (studentPerfs.length === 0) {
        setAiAnalysisReport("No performance history found. Please log at least one weekly evaluation first to generate an analytical pedagogical trace.");
        setAiAnalyzing(false);
        return;
      }
      
      const avgTech = studentPerfs.reduce((sum, p) => sum + p.technicalScore, 0) / studentPerfs.length;
      const avgRhythm = studentPerfs.reduce((sum, p) => sum + p.rhythmScore, 0) / studentPerfs.length;
      const avgExpression = studentPerfs.reduce((sum, p) => sum + p.expressionScore, 0) / studentPerfs.length;
      const avgPractice = studentPerfs.reduce((sum, p) => sum + p.practiceHours, 0) / studentPerfs.length;
      const avgOverall = studentPerfs.reduce((sum, p) => sum + p.overallScore, 0) / studentPerfs.length;
      
      const lastOverall = studentPerfs[studentPerfs.length - 1].overallScore;
      const firstOverall = studentPerfs[0].overallScore;
      const trendStr = studentPerfs.length >= 2 
        ? (lastOverall >= firstOverall ? "upward" : "downward")
        : "initial";
      
      let assessment = `### 🎼 AI Pedagogical Performance Analysis for **${lead.name}**\n\n`;
      assessment += `**Instrument & Level:** ${lead.instrument} (${lead.level})\n`;
      assessment += `**Tracing Database Count:** ${studentPerfs.length} weeks logged\n\n`;
      
      assessment += `#### 📊 Trajectory Assessment:\n`;
      if (trendStr === 'upward') {
        assessment += `- **Consistent Momentum Detected:** The student shows a clear upward curve in composite score, improving from an initial **${firstOverall}%** to **${lastOverall}%**.\n`;
      } else {
        assessment += `- **Adjustment Phase:** Current composite trend averages **${avgOverall.toFixed(1)}%**. Practice commitment holds the key to unlocking finger dexterity and technical growth.\n`;
      }
      
      assessment += `\n#### 🔍 Dynamic Metric Strengths & Growth Areas:\n`;
      const categories = [
        { name: 'Technical Accuracy & Muscle Control', score: avgTech },
        { name: 'Rhythm, Meter & Metronome Alignment', score: avgRhythm },
        { name: 'Expression, Phrasing & Dynamic Contrast', score: avgExpression }
      ];
      categories.sort((a, b) => b.score - a.score);
      
      assessment += `- **Primary Strength:** **${categories[0].name}** (Avg: **${categories[0].score.toFixed(1)}/10**). The student shows strong intuitive grasp of this dimension.\n`;
      assessment += `- **Target Development:** **${categories[2].name}** (Avg: **${categories[2].score.toFixed(1)}/10**). Lessons should prioritize warm-up routines targeting these exercises.\n`;
      
      assessment += `\n#### 🕒 Practice Commitment Impact:\n`;
      if (avgPractice >= 6) {
        assessment += `- **Elite Practice Rate:** At **${avgPractice.toFixed(1)} hours/week**, the student is outperforming typical milestones. This high commitment level is driving the positive curve.\n`;
      } else if (avgPractice >= 4) {
        assessment += `- **Stable Practice Rate:** Averaging **${avgPractice.toFixed(1)} hours/week**. Recommending a target increase of 45 minutes of daily practice to consolidate muscle memory.\n`;
      } else {
        assessment += `- **Momentum Warning:** Averaging **${avgPractice.toFixed(1)} hours/week** is below the recommended threshold of 4+ hours for ${lead.level} level. Inconsistent practice is creating a bottleneck for technical agility.\n`;
      }

      assessment += `\n#### 🎯 Personalized Tutor Advice & Lesson Action Plan:\n`;
      if (lead.instrument === 'Piano') {
        assessment += `1. **Sight-Reading drills:** Prioritize 5 minutes of daily micro-drills using visual card methods.\n`;
        assessment += `2. **Subdivision and Counting:** Enforce active verbal counting over metronome quarter notes to correct rhythm gaps.\n`;
        assessment += `3. **Weighted keys transition:** Encourage relaxed shoulders and weight drop from forearm rather than isolated finger strikes.\n`;
      } else if (lead.instrument === 'Violin' || lead.instrument === 'Cello' || lead.instrument === 'Viola') {
        assessment += `1. **Bow arm weight distribution:** Focus bow drills on the lower half (frog to middle) with subtle index-finger wrist pressure.\n`;
        assessment += `2. **Intonation Tuning:** Integrate drones on tonic notes during scales to cultivate ear accuracy.\n`;
        assessment += `3. **Vibrato setup:** Release left-thumb tension; practice low slow forearm sliding transitions.\n`;
      } else if (lead.instrument === 'Classical Guitar' || lead.instrument === 'Guitar' || lead.instrument === 'Electric Guitar') {
        assessment += `1. **Rest-Stroke control:** Practice i-m finger alternation drills focusing on uniform depth and tone.\n`;
        assessment += `2. **Left hand thumb placement:** Ensure thumb stays perpendicular behind the neck to facilitate wider finger stretches.\n`;
        assessment += `3. **Arpeggio subdivisions:** Practice simple chord arpeggios slowly under triplets subdivisions.\n`;
      } else {
        assessment += `1. **Breath support:** Incorporate diaphragm breathing checks at the start of each segment.\n`;
        assessment += `2. **Ear training:** Practice call-and-response intervals to build harmonic comfort.\n`;
        assessment += `3. **Interval transitions:** Slow down leaps and focus on steady core posture support.\n`;
      }
      
      setAiAnalysisReport(assessment);
      setAiAnalyzing(false);
    }, 1200);
  };

  const handleStatusChange = (status: LeadStatus) => {
    onUpdateLead({ ...lead, status });
  };

  const handleTutorChange = (tutorId: string) => {
    onUpdateLead({ ...lead, assignedTutorId: tutorId || undefined });
  };

  const handleNotesChange = (notes: string) => {
    onUpdateLead({ ...lead, notes });
  };

  const handleLevelChange = (level: Lead['level']) => {
    onUpdateLead({ ...lead, level });
  };

  const handleAddInteractionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!intSummary.trim() || !intDetails.trim()) return;
    
    onAddInteraction(lead.id, intType, intSummary, intDetails, intStaff);
    
    // Reset form
    setIntSummary('');
    setIntDetails('');
    setActiveTab('timeline');
  };

  const handleAddLessonSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lesDate || !lesTime) return;

    const selectedTutor = tutors.find(t => t.id === lesTutorId);
    
    onAddLesson({
      leadId: lead.id,
      leadName: lead.name,
      tutorId: lesTutorId,
      tutorName: selectedTutor ? selectedTutor.name : 'Unassigned Tutor',
      instrument: lead.instrument,
      date: lesDate,
      time: lesTime,
      durationMinutes: lesDuration,
      type: lesType,
      status: 'Scheduled',
    });

    // Automatically update lead status to 'Trial Scheduled' if they booked a trial
    if (lesType === 'Trial' && lead.status === 'New') {
      onUpdateLead({ ...lead, status: 'Trial Scheduled', assignedTutorId: lesTutorId });
    }

    // Reset form
    setLesDate('');
    setLesTime('');
    setActiveTab('timeline');
  };

  const getStatusColor = (status: LeadStatus) => {
    switch (status) {
      case 'New': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-800/50';
      case 'Contacted': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200 dark:border-amber-800/50';
      case 'Trial Scheduled': return 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300 border-rose-200 dark:border-rose-800/50';
      case 'Active': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/50';
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-900/40 dark:text-slate-300 border-slate-200 dark:border-slate-800/50';
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-lg bg-white dark:bg-slate-900 shadow-2xl z-40 border-l border-slate-200 dark:border-slate-800 flex flex-col transition-all duration-300 animate-in slide-in-from-right duration-200">
      
      {/* Header */}
      <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-lg shadow-xs">
            {lead.name[0]}
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white leading-tight">
              {lead.name}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold border ${getStatusColor(lead.status)}`}>
                {lead.status}
              </span>
              <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
                Created: {lead.createdAt}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {onDeleteLead && (
            <button
              onClick={() => {
                if (window.confirm(`Are you sure you want to delete lead "${lead.name}"?`)) {
                  onDeleteLead(lead.id);
                  onClose();
                }
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              title="Delete Lead"
            >
              <Trash className="w-4 h-4" />
            </button>
          )}
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Quick Status / Assignment Panel */}
      <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-100 dark:border-slate-800 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-col gap-1 min-w-[120px]">
          <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Lead Status
          </label>
          <select
            value={lead.status}
            onChange={(e) => handleStatusChange(e.target.value as LeadStatus)}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-lg text-xs font-semibold p-1.5 focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-slate-200"
          >
            <option value="New">New Inquiry</option>
            <option value="Contacted">Contacted</option>
            <option value="Trial Scheduled">Trial Booked</option>
            <option value="Active">Active Student</option>
            <option value="Inactive">Inactive / Lost</option>
          </select>
        </div>

        <div className="flex flex-col gap-1 min-w-[150px]">
          <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Assigned Tutor
          </label>
          <select
            value={lead.assignedTutorId || ''}
            onChange={(e) => handleTutorChange(e.target.value)}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-lg text-xs font-semibold p-1.5 focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-slate-200"
          >
            <option value="">Unassigned</option>
            {tutors.map(t => (
              <option key={t.id} value={t.id}>{t.name} ({t.specialty[0]})</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1 min-w-[100px]">
          <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Tuition Level
          </label>
          <select
            value={lead.level}
            onChange={(e) => handleLevelChange(e.target.value as Lead['level'])}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-lg text-xs font-semibold p-1.5 focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-slate-200"
          >
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-100 dark:border-slate-800 px-4 overflow-x-auto whitespace-nowrap scrollbar-none">
        {[
          { id: 'timeline', label: 'History & Logs' },
          { id: 'performance', label: 'Performance Tracer' },
          { id: 'log-interaction', label: 'Add Interaction' },
          { id: 'schedule-lesson', label: 'Book Lesson' },
          { id: 'profile', label: 'Student Profile' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabType)}
            className={`px-4 py-3 text-xs font-semibold border-b-2 transition-colors shrink-0 ${
              activeTab === tab.id
                ? 'border-indigo-600 dark:border-indigo-500 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        
        {/* Performance Tracer Tab */}
        {activeTab === 'performance' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Top Stat Summary Grid */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-slate-50 dark:bg-indigo-950/20 border border-slate-100 dark:border-indigo-900/30 rounded-xl text-center">
                <span className="text-[9px] uppercase font-bold text-slate-400 dark:text-slate-500 block tracking-wider">
                  Avg Score
                </span>
                <span className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400 block mt-1">
                  {leadPerformances.length > 0 
                    ? Math.round(leadPerformances.reduce((sum, p) => sum + p.overallScore, 0) / leadPerformances.length)
                    : '--'}%
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                  {leadPerformances.length} periods traced
                </span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-indigo-950/20 border border-slate-100 dark:border-indigo-900/30 rounded-xl text-center">
                <span className="text-[9px] uppercase font-bold text-slate-400 dark:text-slate-500 block tracking-wider">
                  Total Practice
                </span>
                <span className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400 block mt-1">
                  {leadPerformances.reduce((sum, p) => sum + p.practiceHours, 0)} hrs
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                  Avg {leadPerformances.length > 0 ? (leadPerformances.reduce((sum, p) => sum + p.practiceHours, 0) / leadPerformances.length).toFixed(1) : '0'} hrs/wk
                </span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-indigo-950/20 border border-slate-100 dark:border-indigo-900/30 rounded-xl text-center">
                <span className="text-[9px] uppercase font-bold text-slate-400 dark:text-slate-500 block tracking-wider">
                  Trajectory
                </span>
                <span className="text-xs font-bold block mt-2 text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1">
                  {leadPerformances.length >= 2 ? (
                    leadPerformances[leadPerformances.length - 1].overallScore >= leadPerformances[0].overallScore ? (
                      <>
                        <TrendingUp className="w-3.5 h-3.5" />
                        Improving
                      </>
                    ) : (
                      'Stable / Adjusting'
                    )
                  ) : (
                    'Baseline Set'
                  )}
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                  From start to latest
                </span>
              </div>
            </div>

            {/* Performance Tracer Chart (Pure SVG for high-contrast lightweight beautiful rendering) */}
            <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-indigo-500 animate-pulse" />
                  Weekly Trajectory Tracing
                </h4>
                <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-400">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-violet-500" /> Tech</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> Rhythm</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Expr</span>
                </div>
              </div>

              {leadPerformances.length === 0 ? (
                <div className="text-center py-8 text-slate-400 dark:text-slate-500 text-xs">
                  No weekly metrics logged to chart. Please log at least two evaluations to see progress tracking curves.
                </div>
              ) : (
                <div className="relative">
                  {/* SVG Chart */}
                  <svg className="w-full h-32 overflow-visible" viewBox="0 0 100 40" preserveAspectRatio="none">
                    {/* Horizontal helper lines */}
                    <line x1="0" y1="10" x2="100" y2="10" stroke="currentColor" className="text-slate-200 dark:text-slate-850" strokeWidth="0.25" strokeDasharray="1,1" />
                    <line x1="0" y1="20" x2="100" y2="20" stroke="currentColor" className="text-slate-200 dark:text-slate-850" strokeWidth="0.25" strokeDasharray="1,1" />
                    <line x1="0" y1="30" x2="100" y2="30" stroke="currentColor" className="text-slate-200 dark:text-slate-850" strokeWidth="0.25" strokeDasharray="1,1" />

                    {/* Chart Lines */}
                    {(() => {
                      const pointsCount = leadPerformances.length;
                      const getX = (idx: number) => pointsCount > 1 ? (idx / (pointsCount - 1)) * 100 : 50;
                      // Mapping 1-10 scores to SVG height 40 (10 is top, 1 is bottom)
                      const getY = (score: number) => 40 - ((score - 1) / 9) * 30 - 5;

                      const techPoints = leadPerformances.map((p, idx) => `${getX(idx)},${getY(p.technicalScore)}`).join(' ');
                      const rhythmPoints = leadPerformances.map((p, idx) => `${getX(idx)},${getY(p.rhythmScore)}`).join(' ');
                      const exprPoints = leadPerformances.map((p, idx) => `${getX(idx)},${getY(p.expressionScore)}`).join(' ');

                      return (
                        <>
                          {/* Tech path */}
                          {pointsCount > 1 && <polyline fill="none" stroke="#8b5cf6" strokeWidth="1" points={techPoints} strokeLinecap="round" strokeLinejoin="round" />}
                          {/* Rhythm path */}
                          {pointsCount > 1 && <polyline fill="none" stroke="#f59e0b" strokeWidth="1" points={rhythmPoints} strokeLinecap="round" strokeLinejoin="round" />}
                          {/* Expr path */}
                          {pointsCount > 1 && <polyline fill="none" stroke="#10b981" strokeWidth="1" points={exprPoints} strokeLinecap="round" strokeLinejoin="round" />}

                          {/* Dots */}
                          {leadPerformances.map((p, idx) => {
                            const x = getX(idx);
                            return (
                              <g key={p.id}>
                                <circle cx={x} cy={getY(p.technicalScore)} r="1.2" fill="#8b5cf6" stroke="#fff" strokeWidth="0.3" />
                                <circle cx={x} cy={getY(p.rhythmScore)} r="1.2" fill="#f59e0b" stroke="#fff" strokeWidth="0.3" />
                                <circle cx={x} cy={getY(p.expressionScore)} r="1.2" fill="#10b981" stroke="#fff" strokeWidth="0.3" />
                              </g>
                            );
                          })}
                        </>
                      );
                    })()}
                  </svg>
                  {/* X axis labels */}
                  <div className="flex justify-between text-[8px] font-mono font-bold text-slate-400 dark:text-slate-500 mt-2 px-1">
                    {leadPerformances.map((p) => (
                      <span key={p.id}>
                        {p.weekStartDate.substring(5)}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* AI Expert Pedagogical Analysis Panel */}
            <div className="bg-gradient-to-r from-violet-50 to-indigo-50 dark:from-slate-850 dark:to-indigo-950/30 p-4 rounded-2xl border border-violet-100/50 dark:border-indigo-900/20 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span className="text-xs font-bold text-indigo-950 dark:text-indigo-200">
                    AI Pedagogical Tracer Analysis
                  </span>
                </div>
                <button
                  type="button"
                  onClick={generateAIPedagogyAnalysis}
                  disabled={aiAnalyzing || leadPerformances.length === 0}
                  className="px-3 py-1 bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-800 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 rounded-lg shadow-2xs hover:bg-indigo-50/50 dark:hover:bg-slate-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {aiAnalyzing ? 'Analyzing Metrics...' : '✨ Run AI Diagnostic'}
                </button>
              </div>

              {aiAnalyzing && (
                <div className="flex flex-col items-center justify-center py-6 space-y-2">
                  <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                  <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 animate-pulse">
                    Synthesizing weekly score ratios and practice timelines...
                  </span>
                </div>
              )}

              {!aiAnalyzing && aiAnalysisReport && (
                <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-white dark:bg-slate-900/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800 font-sans space-y-2 max-h-64 overflow-y-auto scrollbar-thin">
                  <div className="whitespace-pre-line text-slate-600 dark:text-slate-300">
                    {aiAnalysisReport}
                  </div>
                </div>
              )}

              {!aiAnalyzing && !aiAnalysisReport && (
                <p className="text-[11px] text-indigo-900/60 dark:text-slate-400 leading-normal">
                  Our advanced pedagogical system tracks the student's development. Run the diagnostic to extract trend lines, practice commitment impact and get personalized action plans.
                </p>
              )}
            </div>

            {/* Log Weekly Evaluation section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Evaluation Periods ({leadPerformances.length})
                </h4>
                <button
                  type="button"
                  onClick={() => setShowAddPerf(!showAddPerf)}
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                >
                  {showAddPerf ? 'Cancel' : '+ Log Evaluation'}
                </button>
              </div>

              {showAddPerf && (
                <div
                  className="p-4 bg-slate-50 dark:bg-slate-850/45 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4 animate-in slide-in-from-top duration-200"
                >
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Week Start Date</label>
                      <input
                        type="date"
                        required
                        value={perfWeekStartDate}
                        onChange={(e) => setPerfWeekStartDate(e.target.value)}
                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs rounded-lg p-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Evaluated By (Tutor)</label>
                      <select
                        value={perfLoggedBy}
                        onChange={(e) => setPerfLoggedBy(e.target.value)}
                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs rounded-lg p-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                      >
                        {tutors.map(t => (
                          <option key={t.id} value={t.name}>{t.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* 1-10 Sliders */}
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Technical Score: {perfTechnicalScore}/10</label>
                        <span className="text-[9px] text-slate-400">Wrist, pitch, articulation</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={perfTechnicalScore}
                        onChange={(e) => setPerfTechnicalScore(parseInt(e.target.value))}
                        className="w-full accent-indigo-600"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Rhythm & Tempo: {perfRhythmScore}/10</label>
                        <span className="text-[9px] text-slate-400">Beat stability, metronome alignment</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={perfRhythmScore}
                        onChange={(e) => setPerfRhythmScore(parseInt(e.target.value))}
                        className="w-full accent-amber-600"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Expression & Touch: {perfExpressionScore}/10</label>
                        <span className="text-[9px] text-slate-400">Phrasing, dynamic control</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={perfExpressionScore}
                        onChange={(e) => setPerfExpressionScore(parseInt(e.target.value))}
                        className="w-full accent-emerald-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Weekly Practice Hours</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        required
                        value={perfPracticeHours}
                        onChange={(e) => setPerfPracticeHours(parseFloat(e.target.value) || 0)}
                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs rounded-lg p-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Weekly Focus Topic</label>
                      <input
                        type="text"
                        placeholder="e.g., G-Major arpeggios"
                        required
                        value={perfFocusArea}
                        onChange={(e) => setPerfFocusArea(e.target.value)}
                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs rounded-lg p-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Teacher Notes & Action Plan</label>
                    <textarea
                      rows={3}
                      placeholder="Write feedback about posture, hand position, progress on weekly piece, assignments..."
                      value={perfTeacherComments}
                      onChange={(e) => setPerfTeacherComments(e.target.value)}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs rounded-lg p-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="flex justify-between items-center bg-indigo-50/50 dark:bg-slate-900/60 p-2 rounded-xl text-[10px] font-bold text-indigo-950 dark:text-indigo-300 border border-indigo-100/30 dark:border-slate-800">
                    <span>Overall Composite Calculated:</span>
                    <span className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400">
                      {Math.round(((perfTechnicalScore + perfRhythmScore + perfExpressionScore) / 30) * 100)}%
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const overallScore = Math.round(((perfTechnicalScore + perfRhythmScore + perfExpressionScore) / 30) * 100);
                      onAddPerformanceRecord({
                        leadId: lead.id,
                        weekStartDate: perfWeekStartDate,
                        technicalScore: perfTechnicalScore,
                        rhythmScore: perfRhythmScore,
                        expressionScore: perfExpressionScore,
                        practiceHours: perfPracticeHours,
                        overallScore,
                        weeklyFocus: perfFocusArea || 'General foundations',
                        teacherComments: perfTeacherComments || 'No specific comments recorded.',
                        loggedBy: perfLoggedBy,
                      });
                      // Reset fields
                      setPerfFocusArea('');
                      setPerfTeacherComments('');
                      setShowAddPerf(false);
                    }}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2 rounded-lg transition-all shadow-xs"
                  >
                    Save Performance Score & Sync
                  </button>
                </div>
              )}

              {/* Feed List of Historical Records */}
              <div className="space-y-3.5">
                {leadPerformances.length === 0 ? (
                  <p className="text-center py-6 text-xs text-slate-400 dark:text-slate-500">
                    No weekly evaluations logged yet. Click "+ Log Evaluation" to record the first one!
                  </p>
                ) : (
                  [...leadPerformances].reverse().map((perf) => (
                    <div
                      key={perf.id}
                      className="p-3.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-800 shadow-3xs hover:shadow-2xs transition-all relative group"
                    >
                      <button
                        onClick={() => {
                          if (window.confirm("Are you sure you want to delete this weekly performance trace?")) {
                            onDeletePerformanceRecord(perf.id);
                          }
                        }}
                        className="absolute top-3.5 right-3.5 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-slate-50 dark:hover:bg-slate-750 rounded-lg"
                      >
                        <Trash className="w-3.5 h-3.5" />
                      </button>

                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-extrabold text-slate-800 dark:text-slate-200">
                              Week of {perf.weekStartDate}
                            </span>
                            <span className="text-[9px] font-medium text-slate-400 dark:text-slate-500 font-mono">
                              by {perf.loggedBy}
                            </span>
                          </div>
                          <div className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 mt-0.5 font-mono">
                            Focus: {perf.weeklyFocus}
                          </div>
                        </div>
                        <div className="text-right mr-6">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900/30">
                            {perf.overallScore}%
                          </span>
                        </div>
                      </div>

                      {/* Scores Breakdown Row */}
                      <div className="grid grid-cols-4 gap-2 mt-2.5 pt-2 border-t border-slate-50 dark:border-slate-800/60 text-[10px]">
                        <div className="text-center bg-slate-50 dark:bg-slate-900/30 rounded-lg p-1">
                          <span className="text-[9px] text-slate-400 dark:text-slate-500 block">Tech</span>
                          <span className="font-bold text-slate-700 dark:text-slate-300">{perf.technicalScore}/10</span>
                        </div>
                        <div className="text-center bg-slate-50 dark:bg-slate-900/30 rounded-lg p-1">
                          <span className="text-[9px] text-slate-400 dark:text-slate-500 block">Rhythm</span>
                          <span className="font-bold text-slate-700 dark:text-slate-300">{perf.rhythmScore}/10</span>
                        </div>
                        <div className="text-center bg-slate-50 dark:bg-slate-900/30 rounded-lg p-1">
                          <span className="text-[9px] text-slate-400 dark:text-slate-500 block">Expr</span>
                          <span className="font-bold text-slate-700 dark:text-slate-300">{perf.expressionScore}/10</span>
                        </div>
                        <div className="text-center bg-slate-50 dark:bg-slate-900/30 rounded-lg p-1">
                          <span className="text-[9px] text-slate-400 dark:text-slate-500 block">Practice</span>
                          <span className="font-bold text-slate-700 dark:text-slate-300">{perf.practiceHours}h</span>
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                        {perf.teacherComments}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Profile Details Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-5 animate-in fade-in duration-150">
            {/* Quick stats / contacts */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center gap-3">
                <Mail className="w-4 h-4 text-slate-400" />
                <div className="min-w-0">
                  <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400 block">Email</span>
                  <a href={`mailto:${lead.email}`} className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate block hover:underline">
                    {lead.email}
                  </a>
                </div>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center gap-3">
                <Phone className="w-4 h-4 text-slate-400" />
                <div className="min-w-0">
                  <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400 block">Phone</span>
                  <a href={`tel:${lead.phone}`} className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate block hover:underline">
                    {lead.phone}
                  </a>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-850/30 p-4 rounded-xl border border-slate-100 dark:border-slate-800/60 space-y-3.5">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest flex items-center gap-2">
                <Music className="w-3.5 h-3.5 text-indigo-500" />
                Enrollment Spec
              </h4>
              
              <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs">
                <div>
                  <span className="text-slate-400 dark:text-slate-500 font-medium">Instrument:</span>
                  <p className="font-bold text-slate-700 dark:text-slate-200 mt-0.5">{lead.instrument}</p>
                </div>
                <div>
                  <span className="text-slate-400 dark:text-slate-500 font-medium">Age & Class Segment:</span>
                  <p className="font-bold text-slate-700 dark:text-slate-200 mt-0.5">{lead.age} years old ({lead.category})</p>
                </div>
                <div>
                  <span className="text-slate-400 dark:text-slate-500 font-medium">Monthly Budget Max:</span>
                  <p className="font-bold text-slate-700 dark:text-slate-200 mt-0.5">${lead.monthlyBudget || 150} / mo</p>
                </div>
                <div>
                  <span className="text-slate-400 dark:text-slate-500 font-medium">Preferred Schedule:</span>
                  <p className="font-bold text-slate-700 dark:text-slate-200 mt-0.5">{lead.preferredSchedule || 'Flexible'}</p>
                </div>
              </div>
            </div>

            {/* Birthday and Social Handles Section */}
            <div className="bg-slate-50 dark:bg-slate-850/30 p-4 rounded-xl border border-slate-100 dark:border-slate-800/60 space-y-4">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest flex items-center gap-2">
                <Cake className="w-3.5 h-3.5 text-pink-500" />
                Birthday & Social Channels
              </h4>

              <div className="space-y-3.5 text-xs">
                {/* Birthday */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">Student Birthday</label>
                  <div className="flex gap-2">
                    <input 
                      type="date"
                      value={lead.birthday || ''}
                      onChange={(e) => onUpdateLead({ ...lead, birthday: e.target.value })}
                      className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-750 text-xs rounded-lg p-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                    {lead.birthday && (
                      <span className="px-2.5 py-1.5 bg-pink-50 dark:bg-pink-950/30 text-pink-600 dark:text-pink-400 rounded-lg text-[10px] font-bold flex items-center gap-1">
                        <Gift className="w-3.5 h-3.5" />
                        Age {lead.age}
                      </span>
                    )}
                  </div>
                </div>

                {/* Social media handles */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 flex items-center gap-1">
                      <Instagram className="w-3 h-3 text-pink-500" />
                      Instagram
                    </label>
                    <input 
                      type="text"
                      placeholder="@username"
                      value={lead.instagram || ''}
                      onChange={(e) => onUpdateLead({ ...lead, instagram: e.target.value })}
                      className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-750 text-xs rounded-lg p-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 flex items-center gap-1">
                      <MessageSquare className="w-3 h-3 text-teal-500" />
                      Telegram ID
                    </label>
                    <input 
                      type="text"
                      placeholder="@telegram_id"
                      value={lead.telegram || ''}
                      onChange={(e) => onUpdateLead({ ...lead, telegram: e.target.value })}
                      className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-750 text-xs rounded-lg p-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 flex items-center gap-1">
                      <Facebook className="w-3 h-3 text-blue-500" />
                      Facebook
                    </label>
                    <input 
                      type="text"
                      placeholder="facebook.com/user"
                      value={lead.facebook || ''}
                      onChange={(e) => onUpdateLead({ ...lead, facebook: e.target.value })}
                      className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-750 text-xs rounded-lg p-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 flex items-center gap-1">
                      <Youtube className="w-3 h-3 text-rose-500" />
                      YouTube
                    </label>
                    <input 
                      type="text"
                      placeholder="youtube.com/@channel"
                      value={lead.youtube || ''}
                      onChange={(e) => onUpdateLead({ ...lead, youtube: e.target.value })}
                      className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-750 text-xs rounded-lg p-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Follow-up action ID */}
                <div className="flex flex-col gap-1 border-t border-slate-100 dark:border-slate-800/40 pt-3">
                  <label className="text-[10px] uppercase font-bold text-indigo-500 dark:text-indigo-400 flex items-center gap-1">
                    <Award className="w-3.5 h-3.5" />
                    Follow-up Action ID (Registrar Tracker ID)
                  </label>
                  <div className="flex gap-2">
                    <input 
                      type="text"
                      placeholder="e.g. FW-1049"
                      value={lead.followUpId || ''}
                      onChange={(e) => onUpdateLead({ ...lead, followUpId: e.target.value })}
                      className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-750 text-xs rounded-lg p-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 font-mono font-bold"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const nextId = `FW-${Math.floor(1000 + Math.random() * 9000)}`;
                        onUpdateLead({ ...lead, followUpId: nextId });
                      }}
                      className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-slate-700 text-[10px] font-bold rounded-lg transition-colors shrink-0"
                    >
                      Generate ID
                    </button>
                  </div>
                  <span className="text-[9px] text-slate-400 dark:text-slate-500 leading-normal font-medium">
                    This ID associates the lead's social outreach with exact CRM funnel performance markers.
                  </span>
                </div>
              </div>
            </div>

            {/* Registrars / Internal Notes */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                Internal Case Notes
              </label>
              <textarea
                value={lead.notes}
                onChange={(e) => handleNotesChange(e.target.value)}
                rows={5}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 text-xs rounded-xl p-3 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 transition-all leading-normal"
                placeholder="Log internal details about their music goals, practice setup, tutor requirements..."
              />
            </div>
          </div>
        )}

        {/* Timeline Tab */}
        {activeTab === 'timeline' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Communication Timeline ({leadInteractions.length})
            </h4>
            
            {leadInteractions.length === 0 ? (
              <div className="text-center py-8 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                <MessageSquare className="w-6 h-6 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-400">No client interactions recorded yet.</p>
                <button
                  onClick={() => setActiveTab('log-interaction')}
                  className="text-xs font-semibold text-indigo-500 hover:underline mt-1 block w-full text-center"
                >
                  Log First Contact
                </button>
              </div>
            ) : (
              <div className="relative border-l-2 border-slate-100 dark:border-slate-800 ml-3 pl-5 space-y-6">
                {leadInteractions.map((int) => (
                  <div key={int.id} className="relative group">
                    {/* Timeline bullet icon */}
                    <span className="absolute -left-[27px] top-0 w-3 h-3 bg-indigo-500 rounded-full border-2 border-white dark:border-slate-900 shadow-sm" />
                    
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono text-[10px] text-slate-400 dark:text-slate-500 font-semibold">
                          {int.date}
                        </span>
                        <span className="text-[10px] font-mono font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-1.5 py-0.2 rounded">
                          {int.type}
                        </span>
                      </div>
                      
                      <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {int.summary}
                      </h5>
                      
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal bg-slate-50 dark:bg-slate-850/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/40">
                        {int.details}
                      </p>
                      
                      <span className="text-[9px] font-mono text-slate-400 block mt-1">
                        Logged by: {int.staffName}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Log Interaction Tab */}
        {activeTab === 'log-interaction' && (
          <form onSubmit={handleAddInteractionSubmit} className="space-y-4 animate-in fade-in duration-150">
            <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Add Interaction Log
            </h4>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">
                  Contact Type
                </label>
                <select
                  value={intType}
                  onChange={(e) => setIntType(e.target.value as Interaction['type'])}
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold p-2.5 text-slate-800 dark:text-slate-200"
                >
                  <option value="Call">Phone Call</option>
                  <option value="Email">Email sent/recieved</option>
                  <option value="SMS">Text Message (SMS)</option>
                  <option value="In-Person">In-Person Meeting</option>
                  <option value="Trial Lesson">Trial Lesson Eval</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">
                  Logged By (Staff)
                </label>
                <input
                  type="text"
                  value={intStaff}
                  onChange={(e) => setIntStaff(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold p-2.5 text-slate-800 dark:text-slate-200"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase">
                Short Summary
              </label>
              <input
                type="text"
                placeholder="e.g. Left voicemail, Parent scheduled trial..."
                value={intSummary}
                onChange={(e) => setIntSummary(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold p-2.5 text-slate-800 dark:text-slate-200"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase">
                Detailed Log Notes
              </label>
              <textarea
                rows={4}
                placeholder="Log the details of the conversation or lesson findings..."
                value={intDetails}
                onChange={(e) => setIntDetails(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl text-xs p-2.5 text-slate-800 dark:text-slate-200 leading-normal"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2 mt-4"
            >
              <Send className="w-3.5 h-3.5" />
              Save Interaction to Timeline
            </button>
          </form>
        )}

        {/* Schedule Lesson Tab */}
        {activeTab === 'schedule-lesson' && (
          <form onSubmit={handleAddLessonSubmit} className="space-y-4 animate-in fade-in duration-150">
            <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Book Lesson or Trial Class
            </h4>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">
                  Lesson Type
                </label>
                <select
                  value={lesType}
                  onChange={(e) => setLesType(e.target.value as LessonEvent['type'])}
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold p-2.5 text-slate-800 dark:text-slate-200"
                >
                  <option value="Trial">Trial / Evaluation</option>
                  <option value="Regular Lesson">Regular Tutoring Lesson</option>
                  <option value="Makeup">Makeup Class</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">
                  Assign Tutor
                </label>
                <select
                  value={lesTutorId}
                  onChange={(e) => setLesTutorId(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold p-2.5 text-slate-800 dark:text-slate-200"
                  required
                >
                  <option value="">Select Tutor</option>
                  {tutors.map(t => (
                    <option key={t.id} value={t.id}>{t.name} ({t.specialty.join(', ')})</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">
                  Date
                </label>
                <input
                  type="date"
                  value={lesDate}
                  onChange={(e) => setLesDate(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold p-2.5 text-slate-800 dark:text-slate-200"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">
                  Start Time
                </label>
                <input
                  type="time"
                  value={lesTime}
                  onChange={(e) => setLesTime(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold p-2.5 text-slate-800 dark:text-slate-200"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase">
                Duration (Minutes)
              </label>
              <select
                value={lesDuration}
                onChange={(e) => setLesDuration(Number(e.target.value))}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold p-2.5 text-slate-800 dark:text-slate-200"
              >
                <option value={30}>30 Minutes</option>
                <option value={45}>45 Minutes</option>
                <option value={60}>60 Minutes</option>
                <option value={90}>90 Minutes</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2 mt-4"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              Schedule Tutoring Session
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
