import React, { useState, useEffect, useRef } from 'react';
import { 
  GraduationCap, 
  Sparkles, 
  User, 
  Calendar, 
  Activity, 
  MessageSquare, 
  Send, 
  Bell, 
  ArrowRight,
  TrendingUp,
  Clock,
  Heart,
  ChevronRight,
  CreditCard,
  Receipt,
  ShieldCheck,
  AlertCircle,
  Printer,
  RefreshCw,
  FileText,
  CheckCircle2
} from 'lucide-react';
import { Lead, Tutor, Interaction, WeeklyPerformance, LessonEvent, Invoice } from '../types';

interface StudentPortalViewProps {
  leads: Lead[];
  tutors: Tutor[];
  interactions: Interaction[];
  performances: WeeklyPerformance[];
  lessons: LessonEvent[];
  onAddInteraction: (
    leadId: string, 
    type: Interaction['type'], 
    summary: string, 
    details: string, 
    staffName: string
  ) => void;
  invoices: Invoice[];
  onPayInvoice: (invoiceId: string, status: 'Paid' | 'Failed', attempts: number) => void;
}

// Simulated announcements for the student announcement board
const schoolAnnouncements = [
  {
    id: 'ann-1',
    title: '🎹 Annual Summer Gala Recital 2026',
    date: '2026-07-25',
    category: 'Event',
    content: 'Our flagship annual summer recital takes place at the Grand Symphony Hall. All students are invited to perform their chosen piece. Registration for performance slots closes on July 12.'
  },
  {
    id: 'ann-2',
    title: '🎻 Violin Masterclass with Chloe Lin',
    date: '2026-07-15',
    category: 'Masterclass',
    content: 'Tutor Chloe Lin is hosting an exclusive masterclass on bowing techniques and structural phrasing. Open to intermediate and advanced students.'
  },
  {
    id: 'ann-3',
    title: '☀️ Academy Maintenance & Holiday Hours',
    date: '2026-07-04',
    category: 'Urgent',
    content: 'The physical campus will be closed on July 4th. Online lessons will proceed based on individual teacher coordination. Standard lessons resume July 5th.'
  }
];

export default function StudentPortalView({ 
  leads, 
  tutors, 
  interactions, 
  performances, 
  lessons, 
  onAddInteraction,
  invoices,
  onPayInvoice
}: StudentPortalViewProps) {
  // Portal Sandbox Simulation state
  const [impersonateLeadId, setImpersonateLeadId] = useState<string>('');
  const [isLogged, setIsLogged] = useState<boolean>(false);
  const [activePortalTab, setActivePortalTab] = useState<'academic' | 'billing'>('academic');

  // Payment simulator states
  const [simulateNetworkFailure, setSimulateNetworkFailure] = useState<boolean>(false);
  const [payingInvoiceId, setPayingInvoiceId] = useState<string | null>(null);
  const [paymentStatusMsg, setPaymentStatusMsg] = useState<string>('');
  const [activeReceiptInvoice, setActiveReceiptInvoice] = useState<Invoice | null>(null);
  
  // Active Simulated Lead data
  const student = leads.find(l => l.id === impersonateLeadId);
  const tutor = student ? tutors.find(t => t.id === student.assignedTutorId) : null;
  
  // Pull student specific lessons & performance metrics
  const studentLessons = student 
    ? lessons.filter(l => l.leadId === student.id).sort((a, b) => b.date.localeCompare(a.date))
    : [];
  
  const studentPerformances = student 
    ? performances.filter(p => p.leadId === student.id).sort((a, b) => a.weekStartDate.localeCompare(b.weekStartDate))
    : [];

  // Chat/Messaging simulation states
  const [chatInput, setChatInput] = useState<string>('');
  const [chatHistory, setChatHistory] = useState<Array<{ sender: 'student' | 'tutor', text: string, timestamp: string }>>([]);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Initialize chat history with existing tutor interactions or simulated welcome
  useEffect(() => {
    if (student) {
      const tutorName = tutor ? tutor.name : 'your Tutor';
      setChatHistory([
        {
          sender: 'tutor',
          text: `Hi ${student.name}! I hope your practice sessions are going well. Is there anything specific from our last lesson you'd like me to review?`,
          timestamp: '09:15 AM'
        }
      ]);
    }
  }, [impersonateLeadId, student, tutor]);

  // Scroll chat to bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isTyping]);

  const handleSimulateLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!impersonateLeadId) return;
    setIsLogged(true);
  };

  const handleLogout = () => {
    setIsLogged(false);
    setChatHistory([]);
  };

  // Student Invoices query list
  const studentInvoices = student 
    ? invoices.filter(inv => inv.leadId === student.id)
    : [];

  const formatCurrency = (val: number) => {
    return (Math.round(val * 100) / 100).toFixed(2);
  };

  const handlePaySecurely = async (invoice: Invoice) => {
    // 1. Double Submission Protection check
    if (payingInvoiceId === invoice.id) {
      console.warn("Blocked duplicated transaction submission trigger for invoice:", invoice.id);
      return;
    }

    setPayingInvoiceId(invoice.id);
    setPaymentStatusMsg('Initiating handshakes with secure banking gateway...');

    // Simulate standard network latency
    await new Promise(resolve => setTimeout(resolve, 1500));

    // 2. Mid-payment Connection Interruption Check
    if (simulateNetworkFailure) {
      setPaymentStatusMsg('⚠️ Connection Interrupted! Remote socket disconnected mid-transaction. Retaining state...');
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const nextAttempts = (invoice.paymentAttempts || 0) + 1;
      onPayInvoice(invoice.id, 'Failed', nextAttempts);
      
      setPayingInvoiceId(null);
      setPaymentStatusMsg('');
      return;
    }

    setPaymentStatusMsg('Verifying electronic routing & debit ledger balance...');
    await new Promise(resolve => setTimeout(resolve, 1200));

    // Success flow
    const nextAttempts = (invoice.paymentAttempts || 0) + 1;
    onPayInvoice(invoice.id, 'Paid', nextAttempts);

    setPayingInvoiceId(null);
    setPaymentStatusMsg('');
  };

  const handleSimulateLateWebhook = (invoice: Invoice) => {
    // 3. Webhook Idempotency Check
    if (invoice.status === 'Paid') {
      alert(`[Idempotency Watchdog Alert] Invoice ${invoice.id} is ALREADY flagged as 'Paid' inside the central database. Out-of-order webhook callback discarded gracefully to prevent duplicate credit / double-charging!`);
      return;
    }

    const nextAttempts = (invoice.paymentAttempts || 0) + 1;
    onPayInvoice(invoice.id, 'Paid', nextAttempts);
    alert(`[Idempotency Watchdog Event] Late-arriving webhook successfully validated and applied. Invoice ${invoice.id} status updated to 'Paid'.`);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !student) return;

    const userMsg = chatInput;
    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // 1. Add student message to chat visual history
    setChatHistory(prev => [...prev, {
      sender: 'student',
      text: userMsg,
      timestamp: timeString
    }]);
    setChatInput('');

    // 2. Log student message as a customer contact inside CRM interactions log
    const tutorName = tutor ? tutor.name : 'Unassigned Tutor';
    onAddInteraction(
      student.id,
      'SMS',
      `Portal Msg: Student to ${tutorName}`,
      `Direct portal message sent by student to assigned tutor ${tutorName}. Content: "${userMsg}"`,
      'Ganesh (Registrar)'
    );

    // 3. Trigger simulated tutor reply sequence
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);

      // Automated custom reply matching the instrument/level
      let tutorReply = '';
      if (userMsg.toLowerCase().includes('practice') || userMsg.toLowerCase().includes('hours')) {
        tutorReply = `That sounds great! Keep practicing. Remember to watch your posture and wrist relaxation during the scales.`;
      } else if (userMsg.toLowerCase().includes('schedule') || userMsg.toLowerCase().includes('time') || userMsg.toLowerCase().includes('lesson')) {
        tutorReply = `Regarding your schedule, I'll coordinate with Ganesh the Registrar. You can view our verified Lesson Schedule tab too.`;
      } else {
        tutorReply = `Got it! Excellent query. Let's work on that technical element in detail during our next session on Friday! Keep up the incredible momentum.`;
      }

      setChatHistory(prev => [...prev, {
        sender: 'tutor',
        text: tutorReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);

      // Log tutor reply as a CRM interaction
      onAddInteraction(
        student.id,
        'SMS',
        `Portal Reply: Tutor to Student`,
        `Direct portal replies sent by tutor ${tutorName} to student. Content: "${tutorReply}"`,
        tutorName
      );

    }, 2000);
  };

  // Login stage
  if (!isLogged) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 py-10">
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600 dark:bg-indigo-500 text-white flex items-center justify-center mx-auto shadow-md shadow-indigo-600/20">
            <GraduationCap className="w-8 h-8 animate-pulse" />
          </div>
          <h2 className="text-xl font-black text-slate-800 dark:text-white">
            Zoho Student & Parent Portal Sandbox
          </h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            Every Music Academy student is provisioned a secure self-service portal. Impersonate any active contact below to experience their client-side learning hub.
          </p>
        </div>

        <form onSubmit={handleSimulateLogin} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-xs space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Select Recipient to Impersonate</label>
            <select
              value={impersonateLeadId}
              onChange={(e) => setImpersonateLeadId(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs rounded-xl p-3 font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
              required
            >
              <option value="">-- Choose a registered student lead --</option>
              {leads.map(lead => (
                <option key={lead.id} value={lead.id}>
                  {lead.name} ({lead.instrument} • {lead.status === 'Active' ? 'Active student' : lead.status})
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={!impersonateLeadId}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-md shadow-indigo-600/10 flex items-center justify-center gap-1"
          >
            Launch Student Portal Experience
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    );
  }

  // Active Simulated Portal
  return (
    <div className="space-y-6">
      
      {/* Top Simulation Bar */}
      <div className="bg-indigo-50 dark:bg-indigo-950/40 p-3 rounded-2xl border border-indigo-100 dark:border-indigo-900/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-[11px] font-bold text-indigo-950 dark:text-indigo-300">
            Active Simulator Sandbox Mode: Impersonating student <span className="underline font-black">{student?.name}</span>
          </span>
        </div>
        <button
          onClick={handleLogout}
          className="text-[10px] font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 px-3 py-1 rounded-lg"
        >
          Exit Simulator
        </button>
      </div>

      {/* Main Student Header banner */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-6 rounded-3xl shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/10 backdrop-blur-md text-white rounded-2xl flex items-center justify-center font-bold text-lg border border-white/10 shadow-lg">
            {student?.name[0]}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black tracking-tight">{student?.name}</h3>
              <span className="bg-indigo-500/30 text-indigo-300 text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border border-indigo-400/20">
                Level {student?.level}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5 font-medium">
              Enrolled in <span className="font-bold text-white">{student?.instrument}</span> course syllabus
            </p>
          </div>
        </div>

        {tutor && (
          <div className="flex items-center gap-2 bg-white/5 p-2 rounded-2xl border border-white/5">
            <img src={tutor.avatar} alt={tutor.name} className="w-8 h-8 rounded-full object-cover" />
            <div className="text-left">
              <span className="text-[9px] uppercase font-bold text-indigo-300 block">Syllabus Instructor</span>
              <span className="text-xs font-bold block text-white">{tutor.name}</span>
            </div>
          </div>
        )}
      </div>

      {/* Sub-tab Navigation */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-1 mt-2">
        <button
          onClick={() => setActivePortalTab('academic')}
          className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
            activePortalTab === 'academic'
              ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Syllabus & Academic Progress
        </button>
        <button
          onClick={() => setActivePortalTab('billing')}
          className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
            activePortalTab === 'billing'
              ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          My Bills & Payments
          {studentInvoices.some(inv => inv.status === 'Pending') && (
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
          )}
        </button>
      </div>

      {/* Portal Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left column: schedule & progress (Col span 8) */}
        <div className="lg:col-span-8 space-y-6">
          {activePortalTab === 'academic' ? (
            <>
              {/* Section: Academic Schedule */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl space-y-3.5 shadow-3xs">
            <h4 className="text-xs uppercase font-bold text-slate-400 dark:text-slate-500 flex items-center gap-1.5 tracking-wider">
              <Calendar className="w-4 h-4 text-indigo-500" />
              My Registered Class Timetable
            </h4>

            {studentLessons.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No upcoming lessons registered yet.</p>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800/40">
                {studentLessons.slice(0, 3).map(l => (
                  <div key={l.id} className="py-2.5 flex items-center justify-between first:pt-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black text-xs">
                        {l.instrument[0]}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">{l.instrument} - {l.type}</span>
                        <span className="text-[10px] text-slate-400 block font-medium">Instructor {l.tutorName} • {l.durationMinutes} mins</span>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <span className="text-xs font-mono text-slate-800 dark:text-slate-200 block font-bold">{l.date}</span>
                      <span className="text-[10px] text-slate-400 font-mono block mt-0.5">{l.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section: Weekly Performance Progression Curve */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl space-y-4 shadow-3xs">
            <h4 className="text-xs uppercase font-bold text-slate-400 dark:text-slate-500 flex items-center gap-1.5 tracking-wider">
              <Activity className="w-4 h-4 text-indigo-500" />
              Weekly Teacher Assessments & Ratings
            </h4>

            {studentPerformances.length === 0 ? (
              <p className="text-xs text-slate-400 py-8 text-center bg-slate-50 dark:bg-slate-950 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                No weekly evaluation traces logged yet. Check back after your next class!
              </p>
            ) : (
              <div className="space-y-4">
                
                {/* Visual Chart from CRM data */}
                <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">Score Progress Trend Curve</span>
                    <div className="flex gap-2 text-[8px] font-bold text-slate-400 uppercase">
                      <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-violet-500" /> Technical</span>
                      <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Rhythm</span>
                    </div>
                  </div>

                  <svg className="w-full h-24 overflow-visible" viewBox="0 0 100 40" preserveAspectRatio="none">
                    {(() => {
                      const getX = (idx: number) => studentPerformances.length > 1 ? (idx / (studentPerformances.length - 1)) * 100 : 50;
                      const getY = (score: number) => 40 - ((score - 1) / 9) * 30 - 5;
                      const techPoints = studentPerformances.map((p, idx) => `${getX(idx)},${getY(p.technicalScore)}`).join(' ');
                      const rhythmPoints = studentPerformances.map((p, idx) => `${getX(idx)},${getY(p.rhythmScore)}`).join(' ');

                      return (
                        <>
                          {studentPerformances.length > 1 && (
                            <>
                              <polyline fill="none" stroke="#8b5cf6" strokeWidth="0.75" points={techPoints} />
                              <polyline fill="none" stroke="#f59e0b" strokeWidth="0.75" points={rhythmPoints} />
                            </>
                          )}
                          {studentPerformances.map((p, idx) => {
                            const x = getX(idx);
                            return (
                              <g key={p.id}>
                                <circle cx={x} cy={getY(p.technicalScore)} r="1" fill="#8b5cf6" />
                                <circle cx={x} cy={getY(p.rhythmScore)} r="1" fill="#f59e0b" />
                              </g>
                            );
                          })}
                        </>
                      );
                    })()}
                  </svg>
                  
                  <div className="flex justify-between text-[8px] font-mono text-slate-400 mt-2">
                    {studentPerformances.map(p => (
                      <span key={p.id}>{p.weekStartDate.substring(5)}</span>
                    ))}
                  </div>
                </div>

                {/* Performance Feed logs */}
                <div className="space-y-3">
                  {[...studentPerformances].reverse().map(perf => (
                    <div key={perf.id} className="p-3 bg-slate-50 dark:bg-slate-850/40 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Evaluation: Week of {perf.weekStartDate}</span>
                          <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-mono block">Weekly Focus: {perf.weeklyFocus}</span>
                        </div>
                        <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950 text-[10px] font-black text-indigo-600 dark:text-indigo-300 rounded-lg">
                          Score: {perf.overallScore}%
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal italic">
                        "{perf.teacherComments}"
                      </p>

                      <div className="grid grid-cols-4 gap-2 pt-1 border-t border-slate-100 dark:border-slate-800 text-[9px] font-bold text-slate-400 text-center uppercase">
                        <div>Tech: <span className="text-slate-700 dark:text-slate-200">{perf.technicalScore}/10</span></div>
                        <div>Rhythm: <span className="text-slate-700 dark:text-slate-200">{perf.rhythmScore}/10</span></div>
                        <div>Expression: <span className="text-slate-700 dark:text-slate-200">{perf.expressionScore}/10</span></div>
                        <div>Practice: <span className="text-slate-700 dark:text-slate-200">{perf.practiceHours} hrs</span></div>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            )}
          </div>
            </>
          ) : (
            <div className="space-y-6">
              {/* Financial Summary Card */}
              <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-5 rounded-3xl shadow-lg border border-indigo-950 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-300 block">Total Unpaid Tuition Fees</span>
                  <span className="text-3xl font-black block font-mono mt-1">
                    ${formatCurrency(studentInvoices.filter(i => i.status === 'Pending' || i.status === 'Failed').reduce((sum, current) => sum + current.amount, 0))}
                  </span>
                  <p className="text-[10px] text-slate-300 mt-1">
                    Tuition is billed on the 1st of each month. Payments are encrypted with AES-256 ledger security.
                  </p>
                </div>

                {/* Resiliency Sandbox Controls */}
                <div className="bg-white/5 border border-white/10 p-3.5 rounded-2xl md:max-w-xs w-full space-y-2">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4.5 h-4.5 text-emerald-400" />
                    <span className="text-[10px] font-extrabold uppercase text-slate-200">SRE Resiliency Sandbox</span>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={simulateNetworkFailure}
                      onChange={(e) => setSimulateNetworkFailure(e.target.checked)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                    />
                    <div className="text-left">
                      <span className="text-[10px] font-bold text-white block">Simulate Network Failure</span>
                      <span className="text-[9px] text-slate-300 block">Dropped peer connection mid-checkout</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Invoices List */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl space-y-4 shadow-3xs">
                <h4 className="text-xs uppercase font-bold text-slate-400 dark:text-slate-500 flex items-center gap-1.5 tracking-wider">
                  <Receipt className="w-4 h-4 text-indigo-500" />
                  Account Billing Statement History
                </h4>

                {studentInvoices.length === 0 ? (
                  <p className="text-xs text-slate-400 py-8 text-center bg-slate-50 dark:bg-slate-950 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                    No billing ledger lines found for this account.
                  </p>
                ) : (
                  <div className="space-y-3.5">
                    {studentInvoices.map(inv => {
                      const isInvoicePaying = payingInvoiceId === inv.id;
                      return (
                        <div key={inv.id} className="p-4 bg-slate-50 dark:bg-slate-850/40 border border-slate-100 dark:border-slate-800 rounded-2xl space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-[10px] uppercase font-mono font-bold text-slate-400 block">Invoice #{inv.id}</span>
                              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block mt-0.5">
                                Monthly Tuition • {inv.instrument} Course
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              {inv.status === 'Paid' && (
                                <span className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-[9px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider border border-emerald-200 dark:border-emerald-800/40 flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3" />
                                  Paid
                                </span>
                              )}
                              {inv.status === 'Pending' && (
                                <span className="bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 text-[9px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider border border-amber-200 dark:border-amber-800/40 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  Pending
                                </span>
                              )}
                              {inv.status === 'Failed' && (
                                <span className="bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-[9px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider border border-rose-200 dark:border-rose-800/40 flex items-center gap-1">
                                  <AlertCircle className="w-3 h-3" />
                                  Payment Failed
                                </span>
                              )}
                              {inv.status === 'Refunded' && (
                                <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[9px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider border border-slate-200 dark:border-slate-700 flex items-center gap-1">
                                  Refunded
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-2 border-t border-b border-slate-100 dark:border-slate-800/60 text-[10px]">
                            <div>
                              <span className="text-slate-400 block font-medium">Billed To</span>
                              <span className="text-slate-700 dark:text-slate-200 font-bold block mt-0.5">{inv.leadName}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block font-medium">Due Date</span>
                              <span className="text-slate-700 dark:text-slate-200 font-mono font-bold block mt-0.5">{inv.dueDate}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block font-medium font-bold">Attempts</span>
                              <span className="text-slate-700 dark:text-slate-200 font-mono font-bold block mt-0.5">{inv.paymentAttempts || 0}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block font-medium font-bold">Tuition Rate</span>
                              <span className="text-indigo-600 dark:text-indigo-400 font-mono font-extrabold block mt-0.5 text-xs">
                                ${formatCurrency(inv.amount)}
                              </span>
                            </div>
                          </div>

                          {/* Action panel */}
                          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                            {inv.status !== 'Paid' && inv.status !== 'Refunded' ? (
                              <div className="flex items-center gap-2.5 w-full md:w-auto">
                                <button
                                  onClick={() => handlePaySecurely(inv)}
                                  disabled={payingInvoiceId !== null}
                                  className="flex-1 md:flex-none bg-indigo-600 hover:bg-indigo-500 disabled:opacity-45 text-white font-bold text-[10px] uppercase tracking-wider py-2 px-4 rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5"
                                >
                                  {isInvoicePaying ? (
                                    <>
                                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                      Securing Transaction...
                                    </>
                                  ) : (
                                    <>
                                      <CreditCard className="w-3.5 h-3.5" />
                                      Pay Billed Fee
                                    </>
                                  )}
                                </button>

                                <button
                                  onClick={() => handleSimulateLateWebhook(inv)}
                                  disabled={payingInvoiceId !== null}
                                  className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 font-bold text-[9px] uppercase tracking-wider py-2 px-3 rounded-xl transition-all"
                                  title="Simulates standard gateway asynchronous webhook completion delay to verify idempotency checks"
                                >
                                  Simulate Webhook
                                </button>
                              </div>
                            ) : inv.status === 'Paid' ? (
                              <button
                                onClick={() => setActiveReceiptInvoice(inv)}
                                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] uppercase tracking-wider py-2 px-4 rounded-xl transition-all flex items-center gap-1.5 shadow-xs"
                              >
                                <Printer className="w-3.5 h-3.5" />
                                Print Official Receipt
                              </button>
                            ) : null}

                            {inv.status === 'Failed' && (
                              <p className="text-[10px] text-rose-500 font-bold italic flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                Prior attempt failed due to SRE simulated dropped sockets. Balance is preserved safely.
                              </p>
                            )}
                          </div>

                          {/* Checkout Status feedback visual */}
                          {isInvoicePaying && (
                            <div className="bg-indigo-50/50 dark:bg-indigo-950/20 p-3 rounded-xl border border-indigo-100 dark:border-indigo-900/30 text-center space-y-1.5">
                              <div className="flex justify-center">
                                <span className="relative flex h-2.5 w-2.5">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500"></span>
                                </span>
                              </div>
                              <p className="text-[10px] font-bold text-indigo-950 dark:text-indigo-300">{paymentStatusMsg}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right column: announcements & direct chat (Col span 4) */}
        <div className="lg:col-span-4 space-y-6 flex flex-col justify-between">
          
          {/* Announcements Board */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl space-y-3 shadow-3xs">
            <h4 className="text-xs uppercase font-bold text-slate-400 dark:text-slate-500 flex items-center gap-1.5 tracking-wider">
              <Bell className="w-4 h-4 text-indigo-500" />
              Academy Announcements
            </h4>

            <div className="space-y-3">
              {schoolAnnouncements.map(ann => (
                <div key={ann.id} className="p-3 bg-slate-50/75 dark:bg-slate-850/35 border border-slate-100 dark:border-slate-800 rounded-xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[8px] font-extrabold uppercase bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 px-1 rounded">
                      {ann.category}
                    </span>
                    <span className="text-[8px] font-mono font-bold text-slate-400">{ann.date}</span>
                  </div>
                  <h5 className="text-[11px] font-extrabold text-slate-800 dark:text-slate-200">{ann.title}</h5>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-relaxed">{ann.content}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Teacher Direct Live Chat */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4.5 rounded-3xl shadow-xs flex flex-col h-96">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800/60 mb-3 shrink-0">
              <MessageSquare className="w-4.5 h-4.5 text-indigo-500" />
              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-white">Direct Tutor Chat</h4>
                <p className="text-[9px] text-slate-400">Ask questions, share performance clips</p>
              </div>
            </div>

            {/* Chat list */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin">
              {chatHistory.map((chat, idx) => {
                const isTutor = chat.sender === 'tutor';
                return (
                  <div key={idx} className={`flex flex-col ${isTutor ? 'items-start' : 'items-end'}`}>
                    <div className={`p-2.5 rounded-2xl max-w-[85%] text-xs font-medium leading-relaxed ${
                      isTutor 
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none' 
                        : 'bg-indigo-600 text-white rounded-tr-none'
                    }`}>
                      {chat.text}
                    </div>
                    <span className="text-[8px] text-slate-400 mt-1 font-mono">{chat.timestamp}</span>
                  </div>
                );
              })}

              {isTyping && (
                <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium italic pl-1">
                  <span className="animate-bounce">●</span>
                  <span className="animate-bounce [animation-delay:0.2s]">●</span>
                  <span className="animate-bounce [animation-delay:0.4s]">●</span>
                  <span>Tutor typing feedback...</span>
                </div>
              )}
              
              <div ref={chatBottomRef} />
            </div>

            {/* Chat send input */}
            <form onSubmit={handleSendMessage} className="mt-3 flex gap-2 shrink-0">
              <input
                type="text"
                placeholder="Message your tutor..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                required
              />
              <button
                type="submit"
                className="p-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all flex items-center justify-center shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

        </div>

      </div>

      {/* Receipt Modal */}
      {activeReceiptInvoice && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative space-y-5">
            <button
              onClick={() => setActiveReceiptInvoice(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-extrabold text-sm"
            >
              ✕
            </button>

            {/* Receipt Header */}
            <div className="text-center space-y-1">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-2">
                <Receipt className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider">Sai Music Academy</h4>
              <p className="text-[9px] text-slate-400 uppercase font-mono tracking-widest">Official Transaction Receipt</p>
            </div>

            {/* Invoice Specs */}
            <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl p-4 space-y-3 border border-slate-100 dark:border-slate-800/80">
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>Receipt Number:</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{activeReceiptInvoice.receiptNumber}</span>
              </div>
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>Billing Line ID:</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">{activeReceiptInvoice.id}</span>
              </div>
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>Authorized Date:</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">{new Date(activeReceiptInvoice.paidAt || '').toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>Billed Account:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{activeReceiptInvoice.leadName}</span>
              </div>
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>Academic Course:</span>
                <span className="text-slate-800 dark:text-slate-200 font-semibold">{activeReceiptInvoice.instrument} Course</span>
              </div>

              <div className="border-t border-dashed border-slate-200 dark:border-slate-800 pt-3 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Amount Charged:</span>
                <span className="text-lg font-black font-mono text-emerald-600 dark:text-emerald-400">
                  ${formatCurrency(activeReceiptInvoice.amount)}
                </span>
              </div>
            </div>

            {/* SRE seal */}
            <div className="text-center p-3 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
              <p className="text-[10px] font-bold text-emerald-800 dark:text-emerald-400 flex items-center justify-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                Gateway Idempotency Verified
              </p>
              <p className="text-[8px] text-slate-400 mt-0.5">
                Authorized securely via Sai Music Academy payment integration ledger.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  window.print();
                }}
                className="flex-1 bg-slate-800 hover:bg-slate-750 text-white font-bold text-[10px] uppercase tracking-wider py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                Print Statement
              </button>
              <button
                onClick={() => setActiveReceiptInvoice(null)}
                className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 font-bold text-[10px] uppercase tracking-wider py-2.5 rounded-xl transition-all"
              >
                Close Receipt
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
