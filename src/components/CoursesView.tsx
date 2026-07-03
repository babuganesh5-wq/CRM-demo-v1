import React, { useState } from 'react';
import { 
  BookOpen, 
  User, 
  Clock, 
  DollarSign, 
  Users, 
  CheckCircle, 
  Sparkles,
  BookMarked,
  Award,
  GraduationCap
} from 'lucide-react';
import { Lead, Tutor, Interaction } from '../types';

interface CoursesViewProps {
  leads: Lead[];
  tutors: Tutor[];
  onAddInteraction: (
    leadId: string, 
    type: Interaction['type'], 
    summary: string, 
    details: string, 
    staffName: string
  ) => void;
  onUpdateLead: (updatedLead: Lead) => void;
}

interface CourseBatch {
  id: string;
  name: string;
  instrument: string;
  level: Lead['level'];
  tutorId: string;
  dayOfWeek: string;
  timeSlot: string;
  feePerMonth: number;
  maxCapacity: number;
  enrolledIds: string[];
}

const initialBatches: CourseBatch[] = [
  {
    id: 'batch-1',
    name: 'Suzuki Method Piano Studio A',
    instrument: 'Piano',
    level: 'Beginner',
    tutorId: 'tutor-1',
    dayOfWeek: 'Monday',
    timeSlot: '4:00 PM - 4:45 PM',
    feePerMonth: 180,
    maxCapacity: 4,
    enrolledIds: ['lead-1']
  },
  {
    id: 'batch-2',
    name: 'Intermediate Jazz & Blues Keys',
    instrument: 'Piano',
    level: 'Intermediate',
    tutorId: 'tutor-1',
    dayOfWeek: 'Wednesday',
    timeSlot: '5:00 PM - 6:00 PM',
    feePerMonth: 220,
    maxCapacity: 3,
    enrolledIds: []
  },
  {
    id: 'batch-3',
    name: 'Suzuki Classical Violin Ensembles',
    instrument: 'Violin',
    level: 'Beginner',
    tutorId: 'tutor-3',
    dayOfWeek: 'Friday',
    timeSlot: '4:30 PM - 5:15 PM',
    feePerMonth: 190,
    maxCapacity: 4,
    enrolledIds: ['lead-2']
  },
  {
    id: 'batch-4',
    name: 'Rock Foundations - Group Drums',
    instrument: 'Drums',
    level: 'Beginner',
    tutorId: 'tutor-2',
    dayOfWeek: 'Saturday',
    timeSlot: '11:00 AM - 12:00 PM',
    feePerMonth: 200,
    maxCapacity: 5,
    enrolledIds: []
  },
  {
    id: 'batch-5',
    name: 'Acoustic fingerstyle Workshop',
    instrument: 'Classical Guitar',
    level: 'Intermediate',
    tutorId: 'tutor-2',
    dayOfWeek: 'Tuesday',
    timeSlot: '6:30 PM - 7:30 PM',
    feePerMonth: 180,
    maxCapacity: 4,
    enrolledIds: []
  },
  {
    id: 'batch-6',
    name: 'Advanced Vocal Pitch & Phrasing',
    instrument: 'Vocals',
    level: 'Advanced',
    tutorId: 'tutor-4',
    dayOfWeek: 'Thursday',
    timeSlot: '5:30 PM - 6:30 PM',
    feePerMonth: 250,
    maxCapacity: 2,
    enrolledIds: []
  }
];

export default function CoursesView({ leads, tutors, onAddInteraction, onUpdateLead }: CoursesViewProps) {
  const [batches, setBatches] = useState<CourseBatch[]>(initialBatches);
  
  // Registration Form States
  const [targetLeadId, setTargetLeadId] = useState<string>('');
  const [targetBatchId, setTargetBatchId] = useState<string>('batch-1');
  const [registeredSuccess, setRegisteredSuccess] = useState<boolean>(false);
  const [registeredMessage, setRegisteredMessage] = useState<string>('');

  const activeStudents = leads.filter(l => l.status === 'Active');

  const handleRegisterStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetLeadId || !targetBatchId) return;

    const student = leads.find(l => l.id === targetLeadId);
    const batch = batches.find(b => b.id === targetBatchId);

    if (!student || !batch) return;

    // Check capacity
    if (batch.enrolledIds.length >= batch.maxCapacity) {
      alert("Error: Selected course batch is already at full capacity.");
      return;
    }

    // Check if already registered
    if (batch.enrolledIds.includes(student.id)) {
      alert("Notice: This student is already enrolled in this course batch.");
      return;
    }

    // Enroll logic
    setBatches(prev => prev.map(b => {
      if (b.id !== batch.id) return b;
      return { ...b, enrolledIds: [...b.enrolledIds, student.id] };
    }));

    // Update student level, instrument & assigned tutor automatically to match course
    const updatedStudent: Lead = {
      ...student,
      instrument: batch.instrument,
      level: batch.level,
      assignedTutorId: batch.tutorId,
      monthlyBudget: batch.feePerMonth,
      status: 'Active' // Enroll automatically promotes lead to Active
    };

    onUpdateLead(updatedStudent);

    // Log interaction
    const tutorName = tutors.find(t => t.id === batch.tutorId)?.name || 'Unassigned';
    onAddInteraction(
      student.id,
      'In-Person',
      `Registered to Course: ${batch.name}`,
      `Successfully enrolled into academic batch "${batch.name}" (level ${batch.level}) on ${batch.dayOfWeek}s at ${batch.timeSlot}. Instructed by ${tutorName}. Tuition rate synchronized to $${batch.feePerMonth}/mo.`,
      'Ganesh (Registrar)'
    );

    setRegisteredMessage(`${student.name} successfully enrolled in "${batch.name}".`);
    setRegisteredSuccess(true);
    setTimeout(() => {
      setRegisteredSuccess(false);
    }, 4000);

    // Reset Form
    setTargetLeadId('');
  };

  return (
    <div className="space-y-8 p-1">
      
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-indigo-500" />
          Academic Courses & Batches Catalog
        </h2>
        <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
          Manage specialized student training tracks, designate tutor classroom loads, and orchestrate quick program enrollments.
        </p>
      </div>

      {/* Grid of Course Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {batches.map((batch) => {
          const tutor = tutors.find(t => t.id === batch.tutorId);
          const enrolledCount = batch.enrolledIds.length;
          const capacityRatio = (enrolledCount / batch.maxCapacity) * 100;

          return (
            <div 
              key={batch.id} 
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5.5 space-y-4 shadow-3xs hover:shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200 relative overflow-hidden"
            >
              {/* Badge level indicator */}
              <div className="flex items-center justify-between">
                <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase border ${
                  batch.level === 'Beginner' 
                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 border-blue-100 dark:border-blue-900/30' 
                    : batch.level === 'Intermediate'
                    ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 border-amber-100 dark:border-amber-900/30'
                    : 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border-rose-100 dark:border-rose-900/30'
                }`}>
                  {batch.level}
                </span>
                
                <span className="text-[10px] text-slate-400 font-bold font-mono">
                  {batch.dayOfWeek}s
                </span>
              </div>

              {/* Title / Info */}
              <div className="space-y-1">
                <h3 className="font-extrabold text-slate-800 dark:text-white text-sm line-clamp-1">
                  {batch.name}
                </h3>
                <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-mono uppercase tracking-wider font-semibold">
                  {batch.instrument} Program
                </p>
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-2 gap-2 text-[10px] bg-slate-50 dark:bg-slate-850/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/50">
                <div className="flex items-center gap-1.5 font-medium text-slate-500 dark:text-slate-400">
                  <User className="w-3.5 h-3.5 text-indigo-500" />
                  <span className="truncate">{tutor?.name || 'Unassigned'}</span>
                </div>
                <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
                  <DollarSign className="w-3.5 h-3.5 text-indigo-500" />
                  <span>${batch.feePerMonth}/mo</span>
                </div>
                <div className="flex items-center gap-1.5 font-medium text-slate-500 dark:text-slate-400 col-span-2 mt-1">
                  <Clock className="w-3.5 h-3.5 text-indigo-500" />
                  <span>{batch.timeSlot}</span>
                </div>
              </div>

              {/* Active Capacity Bar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] font-bold">
                  <span className="text-slate-400 uppercase">Class Roster</span>
                  <span className={`${capacityRatio === 100 ? 'text-rose-600' : 'text-indigo-600 dark:text-indigo-400'}`}>
                    {enrolledCount} / {batch.maxCapacity} Seats ({Math.round(capacityRatio)}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-300 ${
                      capacityRatio === 100 
                        ? 'bg-rose-500' 
                        : capacityRatio >= 75 
                        ? 'bg-amber-500' 
                        : 'bg-indigo-600'
                    }`} 
                    style={{ width: `${capacityRatio}%` }} 
                  />
                </div>
              </div>

              {/* List of currently enrolled student names inside */}
              {enrolledCount > 0 && (
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60">
                  <span className="text-[9px] uppercase font-bold text-slate-400 block mb-1.5">Registered Students:</span>
                  <div className="flex flex-wrap gap-1">
                    {batch.enrolledIds.map(eid => {
                      const student = leads.find(l => l.id === eid);
                      return student ? (
                        <span 
                          key={eid} 
                          className="px-2 py-0.5 bg-slate-100 dark:bg-slate-850 text-slate-600 dark:text-slate-300 rounded text-[9px] font-semibold"
                        >
                          {student.name}
                        </span>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Registration & Enrolment Engine Box */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs max-w-3xl mx-auto">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800/60 mb-5">
          <Award className="w-5 h-5 text-indigo-500" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-white">Registrar Enrollment Coordinator</h3>
        </div>

        <form onSubmit={handleRegisterStudent} className="space-y-4">
          <p className="text-[11px] text-slate-400 leading-normal">
            Securely register any active or in-pipeline student lead directly into an academic course batch. This automatically aligns their tutor assignments, syllabus specifications, and logs a permanent enrollment invoice inside their CRM timeline history.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Student selection */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Select Target Student</label>
              <select
                value={targetLeadId}
                onChange={(e) => setTargetLeadId(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs rounded-xl p-2.5 font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:border-indigo-500"
                required
              >
                <option value="">-- Choose student lead --</option>
                {leads.map(lead => (
                  <option key={lead.id} value={lead.id}>
                    {lead.name} ({lead.instrument} • {lead.level})
                  </option>
                ))}
              </select>
            </div>

            {/* Course Batch selection */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Select Targeted Course Batch</label>
              <select
                value={targetBatchId}
                onChange={(e) => setTargetBatchId(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs rounded-xl p-2.5 font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:border-indigo-500"
                required
              >
                {batches.map(b => (
                  <option key={b.id} value={b.id} disabled={b.enrolledIds.length >= b.maxCapacity}>
                    {b.name} ({b.enrolledIds.length}/{b.maxCapacity} Full) - ${b.feePerMonth}/mo
                  </option>
                ))}
              </select>
            </div>

          </div>

          {/* Success messages */}
          {registeredSuccess && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs rounded-xl flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>{registeredMessage}</span>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={!targetLeadId}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-md shadow-indigo-600/10 flex items-center gap-1.5"
            >
              <GraduationCap className="w-4 h-4" />
              Confirm Academic Enrollment
            </button>
          </div>

        </form>
      </div>

    </div>
  );
}
