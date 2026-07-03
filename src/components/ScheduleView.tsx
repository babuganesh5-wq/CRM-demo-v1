import React, { useState, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Music, 
  Plus, 
  CheckCircle, 
  XCircle, 
  Filter, 
  ChevronRight,
  BookOpen,
  Sparkles,
  ChevronLeft,
  CalendarDays,
  UserCheck2,
  Users2,
  CalendarCheck2,
  Award
} from 'lucide-react';
import { LessonEvent, Lead, Tutor } from '../types';

interface ScheduleViewProps {
  lessons: LessonEvent[];
  leads: Lead[];
  tutors: Tutor[];
  onAddLesson: (lesson: Omit<LessonEvent, 'id'>) => void;
  onUpdateLessonStatus: (lessonId: string, status: LessonEvent['status']) => void;
  onUpdateLessonAttendance?: (lessonId: string, attendance: LessonEvent['attendance']) => void;
  onSelectLead: (leadId: string) => void;
}

export default function ScheduleView({
  lessons,
  leads,
  tutors,
  onAddLesson,
  onUpdateLessonStatus,
  onUpdateLessonAttendance,
  onSelectLead
}: ScheduleViewProps) {
  const [viewMode, setViewMode] = useState<'calendar' | 'agenda' | 'attendance'>('calendar');
  const [showBookForm, setShowBookForm] = useState(false);
  const [tutorFilter, setTutorFilter] = useState<string>('All');
  const [typeFilter, setTypeFilter] = useState<string>('All');

  // Book Lesson Form States
  const [selectedLeadId, setSelectedLeadId] = useState('');
  const [selectedTutorId, setSelectedTutorId] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [bookingDuration, setBookingDuration] = useState(45);
  const [bookingType, setBookingType] = useState<LessonEvent['type']>('Regular Lesson');

  // Interactive Month-View States
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedDateStr, setSelectedDateStr] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth(); // 0-indexed

  // Navigate Months
  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  // Month-view Calendar calculation helpers
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay(); // Day of week (0-6)
  
  const monthDays = useMemo(() => {
    const days: Array<{ dayNum: number | null; dateStr: string }> = [];
    
    // Prefix empty cells
    for (let i = 0; i < firstDayIndex; i++) {
      days.push({ dayNum: null, dateStr: '' });
    }
    
    // Real days
    for (let d = 1; d <= daysInMonth; d++) {
      const dayStr = d.toString().padStart(2, '0');
      const monthStr = (currentMonth + 1).toString().padStart(2, '0');
      const dateStr = `${currentYear}-${monthStr}-${dayStr}`;
      days.push({ dayNum: d, dateStr });
    }
    
    return days;
  }, [currentYear, currentMonth, daysInMonth, firstDayIndex]);

  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  // Handle Booking form submit
  const handleSubmitBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLeadId || !selectedTutorId || !bookingDate || !bookingTime) return;

    const matchedLead = leads.find(l => l.id === selectedLeadId);
    const matchedTutor = tutors.find(t => t.id === selectedTutorId);

    if (!matchedLead || !matchedTutor) return;

    onAddLesson({
      leadId: selectedLeadId,
      leadName: matchedLead.name,
      tutorId: selectedTutorId,
      tutorName: matchedTutor.name,
      instrument: matchedLead.instrument,
      date: bookingDate,
      time: bookingTime,
      durationMinutes: bookingDuration,
      type: bookingType,
      status: 'Scheduled',
    });

    // Reset Form
    setSelectedLeadId('');
    setSelectedTutorId('');
    setBookingDate('');
    setBookingTime('');
    setShowBookForm(false);
  };

  // Filter lessons
  const filteredLessons = useMemo(() => {
    return lessons
      .filter(lesson => {
        const matchesTutor = tutorFilter === 'All' || lesson.tutorId === tutorFilter;
        const matchesType = typeFilter === 'All' || lesson.type === typeFilter;
        return matchesTutor && matchesType;
      })
      .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
  }, [lessons, tutorFilter, typeFilter]);

  // Group lessons by Date
  const groupedLessons = useMemo(() => {
    const grouped: { [date: string]: LessonEvent[] } = {};
    filteredLessons.forEach(lesson => {
      if (!grouped[lesson.date]) {
        grouped[lesson.date] = [];
      }
      grouped[lesson.date].push(lesson);
    });
    return grouped;
  }, [filteredLessons]);

  // Attendance stats calculator
  const attendanceStats = useMemo(() => {
    const completedWithAttendance = lessons.filter(l => l.status === 'Completed' && l.attendance);
    const totalCount = completedWithAttendance.length;
    if (totalCount === 0) return { rate: 0, present: 0, absent: 0, excused: 0 };
    
    const present = completedWithAttendance.filter(l => l.attendance === 'Present').length;
    const absent = completedWithAttendance.filter(l => l.attendance === 'Absent').length;
    const excused = completedWithAttendance.filter(l => l.attendance === 'Excused').length;
    
    return {
      rate: Math.round((present / (present + absent)) * 100) || 0,
      present,
      absent,
      excused
    };
  }, [lessons]);

  // Individual student attendance ledger
  const studentAttendanceLedger = useMemo(() => {
    const map: { [id: string]: { name: string; instrument: string; present: number; absent: number; excused: number; scheduled: number } } = {};
    
    leads.filter(l => l.status === 'Active').forEach(l => {
      map[l.id] = { name: l.name, instrument: l.instrument, present: 0, absent: 0, excused: 0, scheduled: 0 };
    });

    lessons.forEach(l => {
      if (!map[l.leadId]) return;
      if (l.status === 'Scheduled') {
        map[l.leadId].scheduled++;
      } else if (l.status === 'Completed' && l.attendance) {
        if (l.attendance === 'Present') map[l.leadId].present++;
        if (l.attendance === 'Absent') map[l.leadId].absent++;
        if (l.attendance === 'Excused') map[l.leadId].excused++;
      }
    });

    return Object.keys(map).map(id => {
      const s = map[id];
      const totalGraded = s.present + s.absent;
      const rate = totalGraded > 0 ? Math.round((s.present / totalGraded) * 100) : 100;
      return { id, ...s, rate };
    }).sort((a, b) => b.rate - a.rate);
  }, [leads, lessons]);

  const formatDateHeader = (dateStr: string) => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getStatusStyle = (status: LessonEvent['status']) => {
    switch (status) {
      case 'Completed': return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30';
      case 'Cancelled': return 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border-rose-100 dark:border-rose-900/30';
      default: return 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/30';
    }
  };

  const getAttendanceBadge = (attendance?: LessonEvent['attendance']) => {
    switch (attendance) {
      case 'Present': return 'bg-emerald-100/70 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-900/20';
      case 'Absent': return 'bg-rose-100/70 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200/50 dark:border-rose-900/20';
      case 'Excused': return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700/50';
      default: return 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400 border border-indigo-100/30';
    }
  };

  // Action to quickly log attendance
  const triggerAttendanceUpdate = (lessonId: string, type: 'Present' | 'Absent' | 'Excused') => {
    if (onUpdateLessonAttendance) {
      onUpdateLessonAttendance(lessonId, type);
    } else {
      // Fallback: update lesson status to completed
      onUpdateLessonStatus(lessonId, 'Completed');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Title & Top Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-800 dark:text-white">Classes Schedule & Attendance Center</h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
            Manage daily lesson planners, integrated calendars, student present/absent logs, and trial evaluation slots
          </p>
        </div>
        
        <button
          onClick={() => setShowBookForm(!showBookForm)}
          className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all duration-150 shadow-md shadow-emerald-700/10 flex items-center gap-2 cursor-pointer self-stretch sm:self-auto justify-center"
        >
          <CalendarIcon className="w-4 h-4" />
          {showBookForm ? 'Close Lesson Booking' : 'Schedule Tutoring Lesson'}
        </button>
      </div>

      {/* Book Lesson Form */}
      {showBookForm && (
        <form onSubmit={handleSubmitBooking} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-xl space-y-4 animate-in slide-in-from-top-4 duration-200">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800/80">
            <Sparkles className="text-emerald-600 dark:text-emerald-400 w-4.5 h-4.5 animate-bounce" />
            <h4 className="text-sm font-bold text-slate-800 dark:text-white">Academy Lesson Scheduler</h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Student */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Select Student Lead</label>
              <select
                value={selectedLeadId}
                onChange={(e) => {
                  setSelectedLeadId(e.target.value);
                  const matchedLead = leads.find(l => l.id === e.target.value);
                  if (matchedLead && matchedLead.assignedTutorId) {
                    setSelectedTutorId(matchedLead.assignedTutorId);
                  }
                }}
                className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold p-2.5 text-slate-800 dark:text-slate-200 focus:bg-white"
                required
              >
                <option value="">-- Choose Student --</option>
                {leads.map(lead => (
                  <option key={lead.id} value={lead.id}>
                    {lead.name} ({lead.instrument} • {lead.level})
                  </option>
                ))}
              </select>
            </div>

            {/* Tutor */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Assigned Tutor</label>
              <select
                value={selectedTutorId}
                onChange={(e) => setSelectedTutorId(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold p-2.5 text-slate-800 dark:text-slate-200 focus:bg-white"
                required
              >
                <option value="">-- Select Instructor --</option>
                {tutors.map(tutor => (
                  <option key={tutor.id} value={tutor.id}>
                    {tutor.name} ({tutor.specialty.slice(0, 2).join(', ')})
                  </option>
                ))}
              </select>
            </div>

            {/* Class Type */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Class Type</label>
              <select
                value={bookingType}
                onChange={(e) => setBookingType(e.target.value as LessonEvent['type'])}
                className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold p-2.5 text-slate-800 dark:text-slate-200 focus:bg-white"
              >
                <option value="Regular Lesson">Regular Tutoring Lesson</option>
                <option value="Trial">Trial / Evaluation Class</option>
                <option value="Makeup">Makeup Lesson</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Date</label>
              <input
                type="date"
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold p-2.5 text-slate-800 dark:text-slate-200 focus:bg-white"
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Start Time</label>
              <input
                type="time"
                value={bookingTime}
                onChange={(e) => setBookingTime(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold p-2.5 text-slate-800 dark:text-slate-200 focus:bg-white"
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Duration</label>
              <select
                value={bookingDuration}
                onChange={(e) => setBookingDuration(Number(e.target.value))}
                className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold p-2.5 text-slate-800 dark:text-slate-200 focus:bg-white"
              >
                <option value={30}>30 Minutes</option>
                <option value={45}>45 Minutes</option>
                <option value={60}>60 Minutes</option>
                <option value={90}>90 Minutes</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowBookForm(false)}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl transition-all shadow-md shadow-emerald-600/10"
            >
              Confirm Reservation
            </button>
          </div>
        </form>
      )}

      {/* Mode selectors and filters toolbar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 p-4 rounded-2xl shadow-xs flex flex-wrap gap-4 items-center justify-between">
        
        {/* Toggle tabs */}
        <div className="flex gap-1 bg-slate-100/70 dark:bg-slate-850 p-1 rounded-xl border border-slate-200/40 dark:border-slate-800/50">
          <button
            onClick={() => setViewMode('calendar')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              viewMode === 'calendar' 
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-3xs' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5" />
            Calendar Grid
          </button>
          <button
            onClick={() => setViewMode('agenda')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              viewMode === 'agenda' 
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-3xs' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Agenda List
          </button>
          <button
            onClick={() => setViewMode('attendance')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              viewMode === 'attendance' 
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-3xs' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
            }`}
          >
            <UserCheck2 className="w-3.5 h-3.5" />
            Attendance Tracker
          </button>
        </div>

        {/* Filters */}
        {viewMode !== 'attendance' && (
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Tutor:</span>
              <select
                value={tutorFilter}
                onChange={(e) => setTutorFilter(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs rounded-xl p-1.5 font-semibold text-slate-700 dark:text-slate-300 focus:outline-none"
              >
                <option value="All">All Tutors</option>
                {tutors.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Lesson Class:</span>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs rounded-xl p-1.5 font-semibold text-slate-700 dark:text-slate-300 focus:outline-none"
              >
                <option value="All">All Types</option>
                <option value="Trial">Trials / Evaluations Only</option>
                <option value="Regular Lesson">Regular Lessons Only</option>
                <option value="Makeup">Makeup Lessons Only</option>
              </select>
            </div>
          </div>
        )}

        {viewMode === 'attendance' && (
          <div className="text-right text-[11px] font-mono text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950/40 p-1.5 rounded-lg">
            Global Class Attendance Rate: {attendanceStats.rate}%
          </div>
        )}
      </div>

      {/* MAIN RENDER AREAS */}

      {viewMode === 'calendar' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Integrated Month Grid */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-4">
            
            {/* Calendar Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4.5 h-4.5 text-indigo-500" />
                <h4 className="text-sm font-black text-slate-800 dark:text-slate-100 font-mono">
                  {monthName} {currentYear}
                </h4>
              </div>

              <div className="flex gap-1">
                <button
                  onClick={handlePrevMonth}
                  className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNextMonth}
                  className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Week Headers */}
            <div className="grid grid-cols-7 gap-1 text-center font-mono text-[9px] font-bold uppercase text-slate-400">
              <div>Sun</div>
              <div>Mon</div>
              <div>Tue</div>
              <div>Wed</div>
              <div>Thu</div>
              <div>Fri</div>
              <div>Sat</div>
            </div>

            {/* Month Day grid */}
            <div className="grid grid-cols-7 gap-1.5">
              {monthDays.map((day, idx) => {
                if (day.dayNum === null) {
                  return <div key={`empty-${idx}`} className="aspect-square bg-slate-50/30 dark:bg-slate-950/20 rounded-xl" />;
                }

                const dayLessons = groupedLessons[day.dateStr] || [];
                const isSelected = selectedDateStr === day.dateStr;
                const isToday = new Date().toISOString().split('T')[0] === day.dateStr;

                return (
                  <div
                    key={`day-${day.dayNum}`}
                    onClick={() => setSelectedDateStr(day.dateStr)}
                    className={`aspect-square p-2 border rounded-xl flex flex-col justify-between cursor-pointer transition-all ${
                      isSelected 
                        ? 'border-indigo-600 bg-indigo-50/20 dark:bg-indigo-950/20 dark:border-indigo-500' 
                        : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50'
                    } ${isToday ? 'ring-2 ring-emerald-500/50' : ''}`}
                  >
                    <div className="flex justify-between items-center">
                      <span className={`text-[10px] font-bold font-mono ${
                        isSelected 
                          ? 'text-indigo-600 dark:text-indigo-400 font-extrabold' 
                          : isToday 
                          ? 'text-emerald-600 dark:text-emerald-400 font-black' 
                          : 'text-slate-400 dark:text-slate-500'
                      }`}>
                        {day.dayNum}
                      </span>

                      {/* Display small dots representing count */}
                      {dayLessons.length > 0 && (
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                      )}
                    </div>

                    {/* Rendering mini tag inside cell if space permits */}
                    <div className="hidden sm:flex flex-col gap-0.5 max-h-[70%] overflow-hidden">
                      {dayLessons.slice(0, 2).map((l) => (
                        <div 
                          key={l.id} 
                          className={`text-[8px] font-bold px-1 py-0.2 rounded-sm truncate ${
                            l.type === 'Trial' ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/30' : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30'
                          }`}
                        >
                          {l.leadName.split(' ')[0]}
                        </div>
                      ))}
                      {dayLessons.length > 2 && (
                        <div className="text-[7px] text-slate-400 font-mono text-center leading-none">
                          +{dayLessons.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

          </div>

          {/* Day Detail Sidebar */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-4">
            
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800/60">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">Day's Planner Details</h4>
                <p className="text-[11px] font-mono font-bold text-indigo-600 dark:text-indigo-400 mt-1">
                  {formatDateHeader(selectedDateStr)}
                </p>
              </div>

              {/* Add shortcut booking button */}
              <button
                onClick={() => {
                  setBookingDate(selectedDateStr);
                  setShowBookForm(true);
                }}
                className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                title="Schedule on this Day"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* List classes for selected day */}
            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
              {(!groupedLessons[selectedDateStr] || groupedLessons[selectedDateStr].length === 0) ? (
                <div className="text-center py-10 text-xs text-slate-400 font-medium">
                  No tutoring classes scheduled for this date.
                </div>
              ) : (
                groupedLessons[selectedDateStr].map((lesson) => (
                  <div key={lesson.id} className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/30 dark:bg-slate-950/20 space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h5 
                          onClick={() => onSelectLead(lesson.leadId)}
                          className="text-xs font-bold text-slate-800 dark:text-slate-100 hover:text-indigo-500 cursor-pointer hover:underline"
                        >
                          {lesson.leadName}
                        </h5>
                        <p className="text-[10px] text-indigo-500 font-mono font-bold uppercase tracking-wider">{lesson.instrument}</p>
                      </div>

                      <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-mono font-bold ${
                        lesson.type === 'Trial' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
                      }`}>
                        {lesson.type}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                      <Clock className="w-3 h-3" />
                      <span>{lesson.time} ({lesson.durationMinutes} mins)</span>
                      <span>•</span>
                      <span>{lesson.tutorName.split(' ')[0]}</span>
                    </div>

                    {/* Attendance/Status actions inside card */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800/50 flex items-center justify-between">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-lg font-bold ${getAttendanceBadge(lesson.attendance)}`}>
                        {lesson.attendance ? `Attended: ${lesson.attendance}` : lesson.status}
                      </span>

                      {lesson.status === 'Scheduled' && (
                        <div className="flex gap-1">
                          <button
                            onClick={() => triggerAttendanceUpdate(lesson.id, 'Present')}
                            className="text-[9px] font-black bg-emerald-50 text-emerald-600 border border-emerald-100/40 hover:bg-emerald-100 px-1.5 py-0.5 rounded"
                          >
                            Present
                          </button>
                          <button
                            onClick={() => triggerAttendanceUpdate(lesson.id, 'Absent')}
                            className="text-[9px] font-black bg-rose-50 text-rose-600 border border-rose-100/40 hover:bg-rose-100 px-1.5 py-0.5 rounded"
                          >
                            Absent
                          </button>
                          <button
                            onClick={() => triggerAttendanceUpdate(lesson.id, 'Excused')}
                            className="text-[9px] font-black bg-slate-50 text-slate-600 border border-slate-200 px-1.5 py-0.5 rounded"
                          >
                            Excused
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>
        </div>
      )}

      {viewMode === 'agenda' && (
        <div className="space-y-6">
          {Object.keys(groupedLessons).length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl py-12 px-6 text-center shadow-xs">
              <CalendarIcon className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">No Lessons Found</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                No music tutoring classes exist for these criteria. Click the Book Lesson button above to schedule one.
              </p>
            </div>
          ) : (
            Object.keys(groupedLessons)
              .sort((a, b) => a.localeCompare(b))
              .map((dateKey) => (
                <div key={dateKey} className="space-y-3.5">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-850 px-3 py-1 rounded-lg border border-slate-200/40 dark:border-slate-800/40 font-mono">
                      {dateKey}
                    </span>
                    <div className="h-px bg-slate-100 dark:bg-slate-800/50 flex-1" />
                    <span className="text-[11px] font-mono font-semibold text-indigo-500">
                      {formatDateHeader(dateKey)}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {groupedLessons[dateKey].map((lesson) => {
                      const matchedTutor = tutors.find(t => t.id === lesson.tutorId);
                      
                      return (
                        <div 
                          key={lesson.id}
                          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4.5 shadow-xs flex items-start justify-between gap-4 group hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xs transition-all duration-150"
                        >
                          <div className="flex items-start gap-3.5 flex-1 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 font-bold font-mono">
                              {lesson.instrument[0]}
                            </div>

                            <div className="flex-1 min-w-0 space-y-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <h5 
                                  onClick={() => onSelectLead(lesson.leadId)}
                                  className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer hover:underline"
                                >
                                  {lesson.leadName}
                                </h5>
                                <span className="text-[10px] text-slate-300">•</span>
                                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase font-mono">
                                  {lesson.instrument}
                                </span>
                              </div>

                              <div className="flex items-center gap-3 text-[10px] text-slate-400 dark:text-slate-500 font-medium font-mono">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-slate-400" />
                                  {lesson.time} ({lesson.durationMinutes}m)
                                </span>
                              </div>

                              {matchedTutor && (
                                <div className="flex items-center gap-2 pt-1">
                                  <img 
                                    src={matchedTutor.avatar} 
                                    alt={matchedTutor.name} 
                                    className="w-4.5 h-4.5 rounded-full object-cover"
                                    referrerPolicy="no-referrer"
                                  />
                                  <span className="text-[10px] text-slate-600 dark:text-slate-400 font-semibold">
                                    Tutor: {matchedTutor.name}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-2 shrink-0">
                            <span className={`text-[9px] px-2 py-0.5 rounded-full font-mono font-bold ${
                              lesson.type === 'Trial' 
                                ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/30' 
                                : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30'
                            }`}>
                              {lesson.type}
                            </span>

                            <div className="flex items-center gap-1.5">
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${getStatusStyle(lesson.status)} ${lesson.attendance ? getAttendanceBadge(lesson.attendance) : ''}`}>
                                {lesson.attendance ? `Attended: ${lesson.attendance}` : lesson.status}
                              </span>
                              
                              {lesson.status === 'Scheduled' && (
                                <div className="flex gap-1">
                                  <button
                                    onClick={() => triggerAttendanceUpdate(lesson.id, 'Present')}
                                    className="p-1 rounded-md text-emerald-500 hover:bg-emerald-50 transition-colors"
                                    title="Mark Present"
                                  >
                                    <CheckCircle className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => triggerAttendanceUpdate(lesson.id, 'Absent')}
                                    className="p-1 rounded-md text-rose-500 hover:bg-rose-50 transition-colors"
                                    title="Mark Absent"
                                  >
                                    <XCircle className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>

                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
          )}
        </div>
      )}

      {viewMode === 'attendance' && (
        <div className="space-y-6">
          
          {/* Dashboard Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-3xs flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                <CalendarCheck2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold block uppercase font-mono leading-none mb-1">Present Lessons</span>
                <span className="text-xl font-black font-mono text-emerald-600 dark:text-emerald-400">{attendanceStats.present}</span>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-3xs flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
                <XCircle className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold block uppercase font-mono leading-none mb-1">Absent Lessons</span>
                <span className="text-xl font-black font-mono text-rose-600 dark:text-rose-400">{attendanceStats.absent}</span>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-3xs flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center font-bold">
                <Users2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold block uppercase font-mono leading-none mb-1">Excused Absences</span>
                <span className="text-xl font-black font-mono text-slate-600 dark:text-slate-400">{attendanceStats.excused}</span>
              </div>
            </div>
          </div>

          {/* Student Roster Table Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl shadow-xs overflow-hidden">
            <div className="p-4.5 border-b border-slate-100 dark:border-slate-800/60">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Active Student Attendance Ledger & Performance Standing</h4>
            </div>

            <div className="overflow-x-auto font-semibold">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850/20 text-slate-400 dark:text-slate-500 text-[10px] uppercase font-black tracking-wider">
                    <th className="py-3 px-6">Student Name</th>
                    <th className="py-3 px-6">Instrument</th>
                    <th className="py-3 px-6">Present Count</th>
                    <th className="py-3 px-6">Absent Count</th>
                    <th className="py-3 px-6">Excused Count</th>
                    <th className="py-3 px-6">Upcoming Scheduled</th>
                    <th className="py-3 px-6 text-right">Attendance Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40 text-xs">
                  {studentAttendanceLedger.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="py-3.5 px-6 font-bold text-slate-800 dark:text-slate-100">
                        <span 
                          onClick={() => onSelectLead(row.id)}
                          className="hover:text-indigo-600 cursor-pointer hover:underline"
                        >
                          {row.name}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 font-mono text-slate-500 uppercase">{row.instrument}</td>
                      <td className="py-3.5 px-6 font-mono font-bold text-emerald-600">{row.present}</td>
                      <td className="py-3.5 px-6 font-mono font-bold text-rose-600">{row.absent}</td>
                      <td className="py-3.5 px-6 font-mono font-bold text-slate-500">{row.excused}</td>
                      <td className="py-3.5 px-6 font-mono font-bold text-indigo-500">{row.scheduled} classes</td>
                      <td className="py-3.5 px-6 text-right font-mono font-black">
                        <span className={`px-2 py-0.5 rounded-lg border ${
                          row.rate >= 90 
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/40' 
                            : row.rate >= 75 
                            ? 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-950/40' 
                            : 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-950/40'
                        }`}>
                          {row.rate}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
