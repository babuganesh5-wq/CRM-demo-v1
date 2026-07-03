import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Percent, 
  UserCheck, 
  DollarSign, 
  ArrowUpRight, 
  Calendar, 
  Sparkles,
  Phone,
  Mail,
  MessageSquare,
  FileText,
  Guitar,
  ArrowDown,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Activity,
  TrendingUp,
  ChevronRight,
  Info,
  Gift,
  Cake,
  Send
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { Lead, Tutor, Interaction, LessonEvent, Invoice } from '../types';

interface DashboardViewProps {
  leads: Lead[];
  tutors: Tutor[];
  interactions: Interaction[];
  lessons: LessonEvent[];
  onSelectLead: (leadId: string) => void;
  onNavigateTab: (tab: string) => void;
  onAddInteraction?: (leadId: string, type: Interaction['type'], summary: string, details: string, staffName: string) => void;
  invoices?: Invoice[];
  onPayInvoice?: (invoiceId: string, status: 'Paid' | 'Failed', attempts: number) => void;
  onUpdateInvoice?: (updatedInvoice: Invoice) => void;
  onCreateInvoice?: (invoiceData: Omit<Invoice, 'id'>) => void;
}

const enrollmentTrend = [
  { name: 'Feb', Leads: 4, Enrolled: 2 },
  { name: 'Mar', Leads: 7, Enrolled: 3 },
  { name: 'Apr', Leads: 9, Enrolled: 4 },
  { name: 'May', Leads: 12, Enrolled: 6 },
  { name: 'Jun', Leads: 15, Enrolled: 8 },
  { name: 'Jul', Leads: 18, Enrolled: 11 },
];

export default function DashboardView({ 
  leads, 
  tutors, 
  interactions, 
  lessons, 
  onSelectLead,
  onNavigateTab,
  onAddInteraction,
  invoices = [],
  onPayInvoice,
  onUpdateInvoice,
  onCreateInvoice
}: DashboardViewProps) {
  const [funnelViewMode, setFunnelViewMode] = useState<'pipeline' | 'chart'>('pipeline');
  const [wishingLeadId, setWishingLeadId] = useState<string | null>(null);
  const [wishType, setWishType] = useState<'SMS' | 'Call' | 'Email'>('SMS');
  const [wishDetails, setWishDetails] = useState('');

  // CRM Accounting Ledger Admin State
  const [ledgerSearch, setLedgerSearch] = useState('');
  const [ledgerStatusFilter, setLedgerStatusFilter] = useState<string>('All');
  const [showInvoiceCreator, setShowInvoiceCreator] = useState(false);
  const [creatorLeadId, setCreatorLeadId] = useState('');
  const [creatorInstrument, setCreatorInstrument] = useState('Guitar');
  const [creatorAmount, setCreatorAmount] = useState('150.00');
  const [creatorDueDate, setCreatorDueDate] = useState('2026-07-15');
  
  // Birthdays today, upcoming, or recently passed
  const birthdayAlerts = useMemo(() => {
    return leads
      .map(lead => {
        if (!lead.birthday) return null;
        const parts = lead.birthday.split('-');
        if (parts.length < 2) return null;
        
        const month = parseInt(parts[parts.length - 2], 10);
        const day = parseInt(parts[parts.length - 1], 10);
        
        const currentYear = 2026;
        const todayVal = new Date(currentYear, 6, 3); // July 3, 2026
        let bday = new Date(currentYear, month - 1, day);
        
        let diffDays = Math.round((bday.getTime() - todayVal.getTime()) / (24 * 60 * 60 * 1000));
        
        if (diffDays < -3) {
          bday = new Date(currentYear + 1, month - 1, day);
          diffDays = Math.round((bday.getTime() - todayVal.getTime()) / (24 * 60 * 60 * 1000));
        }
        
        return {
          lead,
          diffDays,
          month,
          day,
          birthdayStr: `${month}/${day}`
        };
      })
      .filter((item): item is NonNullable<typeof item> => {
        if (!item) return false;
        return item.diffDays >= -2 && item.diffDays <= 7;
      })
      .sort((a, b) => a.diffDays - b.diffDays);
  }, [leads]);

  // Calculations
  const totalLeads = leads.length;
  const activeStudents = leads.filter(l => l.status === 'Active').length;
  
  // Conversion Rate (Active / (All except New/Contacted which are in progress? No, standard is Active / (Active + Inactive + Trial Scheduled)))
  const totalClosed = leads.filter(l => ['Active', 'Inactive'].includes(l.status)).length;
  const conversionRate = totalClosed > 0 
    ? Math.round((activeStudents / totalClosed) * 100) 
    : 62; // fallback realistic default

  // Funnel calculations
  const funnelData = useMemo(() => {
    const total = leads.length;
    
    // 1. Inquiries (total inquiries)
    const stage1 = total;
    
    // 2. Contacted (leads who are past 'New')
    const stage2 = leads.filter(l => l.status !== 'New').length;
    
    // 3. Trial Scheduled (leads who reached 'Trial Scheduled' or further)
    const stage3 = leads.filter(l => 
      ['Trial Scheduled', 'Application Review', 'Offer Extended', 'Active'].includes(l.status)
    ).length;
    
    // 4. Offer Extended (leads who reached 'Application Review', 'Offer Extended', or 'Active')
    const stage4 = leads.filter(l => 
      ['Application Review', 'Offer Extended', 'Active'].includes(l.status)
    ).length;
    
    // 5. Active Enrolled (leads who are 'Active')
    const stage5 = leads.filter(l => l.status === 'Active').length;

    return [
      {
        stage: '1. Inquiries',
        description: 'New and raw inquiries logged',
        count: stage1,
        percentageOfTotal: 100,
        stepConversion: 100,
        color: 'from-indigo-600 to-indigo-500',
        bgLight: 'bg-indigo-50 dark:bg-indigo-950/25',
        textColor: 'text-indigo-600 dark:text-indigo-400',
      },
      {
        stage: '2. Contacted',
        description: 'Contacted and actively engaged',
        count: stage2,
        percentageOfTotal: stage1 > 0 ? Math.round((stage2 / stage1) * 100) : 0,
        stepConversion: stage1 > 0 ? Math.round((stage2 / stage1) * 100) : 0,
        color: 'from-violet-600 to-violet-500',
        bgLight: 'bg-violet-50 dark:bg-violet-950/25',
        textColor: 'text-violet-600 dark:text-violet-400',
      },
      {
        stage: '3. Trial Scheduled',
        description: 'Scheduled or completed introductory trial',
        count: stage3,
        percentageOfTotal: stage1 > 0 ? Math.round((stage3 / stage1) * 100) : 0,
        stepConversion: stage2 > 0 ? Math.round((stage3 / stage2) * 100) : 0,
        color: 'from-purple-600 to-purple-500',
        bgLight: 'bg-purple-50 dark:bg-purple-950/25',
        textColor: 'text-purple-600 dark:text-purple-400',
      },
      {
        stage: '4. Offer Extended',
        description: 'Syllabus review & admission offer extended',
        count: stage4,
        percentageOfTotal: stage1 > 0 ? Math.round((stage4 / stage1) * 100) : 0,
        stepConversion: stage3 > 0 ? Math.round((stage4 / stage3) * 100) : 0,
        color: 'from-pink-600 to-pink-500',
        bgLight: 'bg-pink-50 dark:bg-pink-950/25',
        textColor: 'text-pink-600 dark:text-pink-400',
      },
      {
        stage: '5. Active Student',
        description: 'Enrolled in continuous instruction',
        count: stage5,
        percentageOfTotal: stage1 > 0 ? Math.round((stage5 / stage1) * 100) : 0,
        stepConversion: stage4 > 0 ? Math.round((stage5 / stage4) * 100) : 0,
        color: 'from-emerald-600 to-emerald-500',
        bgLight: 'bg-emerald-50 dark:bg-emerald-950/25',
        textColor: 'text-emerald-600 dark:text-emerald-400',
      },
    ];
  }, [leads]);

  // Projected Value: sum of monthlyBudget of Active students
  const projectedMonthlyRevenue = leads
    .filter(l => l.status === 'Active')
    .reduce((sum, current) => sum + (current.monthlyBudget || 150), 0);

  // Real Financial Figures from SRE-auditable Database Ledger
  const totalRealizedRevenue = invoices
    .filter(i => i.status === 'Paid')
    .reduce((sum, current) => sum + current.amount, 0);

  const totalOutstandingTuition = invoices
    .filter(i => i.status === 'Pending' || i.status === 'Failed')
    .reduce((sum, current) => sum + current.amount, 0);

  const invoicePaymentRate = invoices.length > 0
    ? Math.round((invoices.filter(i => i.status === 'Paid').length / invoices.length) * 100)
    : 100;

  const handleCreateInvoiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!creatorLeadId) return;
    const student = leads.find(l => l.id === creatorLeadId);
    if (!student) return;

    if (onCreateInvoice) {
      onCreateInvoice({
        leadId: student.id,
        leadName: student.name,
        instrument: creatorInstrument,
        amount: parseFloat(creatorAmount) || 150.00,
        dueDate: creatorDueDate,
        status: 'Pending',
        paymentAttempts: 0,
        receiptNumber: 'REC-' + Date.now().toString().substring(7)
      });
    }

    // reset creator fields
    setCreatorLeadId('');
    setShowInvoiceCreator(false);
  };

  const filteredInvoicesForLedger = invoices.filter(inv => {
    const matchesSearch = inv.leadName.toLowerCase().includes(ledgerSearch.toLowerCase()) || 
                          inv.id.toLowerCase().includes(ledgerSearch.toLowerCase()) ||
                          inv.instrument.toLowerCase().includes(ledgerSearch.toLowerCase());
    const matchesStatus = ledgerStatusFilter === 'All' || inv.status === ledgerStatusFilter;
    return matchesSearch && matchesStatus;
  });

  // Today's lessons & Trials
  const upcomingLessons = lessons
    .filter(les => les.status === 'Scheduled')
    .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
    .slice(0, 4);

  // Recent Interactions (last 4)
  const recentInteractions = [...interactions]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 4);

  const getInteractionIcon = (type: string) => {
    switch (type) {
      case 'Call': return <Phone className="w-4 h-4 text-emerald-500" />;
      case 'Email': return <Mail className="w-4 h-4 text-indigo-500" />;
      case 'SMS': return <MessageSquare className="w-4 h-4 text-amber-500" />;
      case 'Trial Lesson': return <Guitar className="w-4 h-4 text-rose-500" />;
      default: return <FileText className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-8 p-1">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 bg-indigo-500/20 text-indigo-300 border border-indigo-400/20 px-3 py-1 rounded-full text-xs font-semibold tracking-wider font-mono">
              <Sparkles className="w-3.5 h-3.5" />
              REGISTRAR DASHBOARD ACTIVE
            </div>
            <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Music Academy Enrollment Command
            </h3>
            <p className="text-slate-300 text-sm max-w-xl font-medium leading-relaxed">
              Track student inquiries, manage tutor schedules, log communication touchpoints, and monitor enrollment growth from a central console.
            </p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => onNavigateTab('leads')}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-5 py-3 rounded-xl transition-all duration-150 shadow-lg shadow-indigo-700/20"
            >
              Add New Lead
            </button>
            <button 
              onClick={() => onNavigateTab('schedule')}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs px-5 py-3 rounded-xl border border-slate-700/60 transition-all duration-150"
            >
              View Lessons
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Metric 1 */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-xs hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200 group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Total Inquiries
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900 dark:text-white font-mono">
                {totalLeads}
              </span>
              <span className="text-[11px] font-semibold text-emerald-500 flex items-center gap-0.5">
                <ArrowUpRight className="w-3.5 h-3.5" />
                +14.3%
              </span>
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 font-medium">
              Active leads currently in sales pipeline
            </p>
          </div>
          {/* Sparkline Visual */}
          <div className="mt-4 pt-3 border-t border-slate-50 dark:border-slate-800/60 flex items-center justify-between">
            <div className="flex gap-0.5 items-end h-5">
              <div className="w-1.5 h-2 bg-indigo-100 dark:bg-indigo-950/60 rounded-xs" />
              <div className="w-1.5 h-3 bg-indigo-200 dark:bg-indigo-900/40 rounded-xs" />
              <div className="w-1.5 h-1.5 bg-indigo-200 dark:bg-indigo-900/40 rounded-xs" />
              <div className="w-1.5 h-4 bg-indigo-300 dark:bg-indigo-800/50 rounded-xs" />
              <div className="w-1.5 h-2.5 bg-indigo-400 dark:bg-indigo-600/60 rounded-xs" />
              <div className="w-1.5 h-5 bg-indigo-600 dark:bg-indigo-500 rounded-xs" />
            </div>
            <span className="text-[10px] font-semibold font-mono text-indigo-600 dark:text-indigo-400">
              6 New Today
            </span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-xs hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200 group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Trial Conversion
            </span>
            <div className="w-9 h-9 rounded-xl bg-violet-50 dark:bg-violet-950/40 flex items-center justify-center text-violet-600 dark:text-violet-400 group-hover:scale-110 transition-transform">
              <Percent className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900 dark:text-white font-mono">
                {conversionRate}%
              </span>
              <span className="text-[11px] font-semibold text-emerald-500 flex items-center gap-0.5">
                <ArrowUpRight className="w-3.5 h-3.5" />
                +2.5%
              </span>
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 font-medium">
              Ratio of leads converted to students
            </p>
          </div>
          {/* Sparkline Visual */}
          <div className="mt-4 pt-3 border-t border-slate-50 dark:border-slate-800/60 flex items-center justify-between">
            <div className="flex gap-0.5 items-end h-5">
              <div className="w-1.5 h-3 bg-violet-100 dark:bg-violet-950/60 rounded-xs" />
              <div className="w-1.5 h-2.5 bg-violet-200 dark:bg-violet-900/40 rounded-xs" />
              <div className="w-1.5 h-4 bg-violet-300 dark:bg-violet-850/50 rounded-xs" />
              <div className="w-1.5 h-1.5 bg-violet-200 dark:bg-violet-900/40 rounded-xs" />
              <div className="w-1.5 h-5 bg-violet-500 dark:bg-violet-600/60 rounded-xs" />
              <div className="w-1.5 h-4 bg-violet-600 dark:bg-violet-500 rounded-xs" />
            </div>
            <span className="text-[10px] font-semibold font-mono text-violet-600 dark:text-violet-400">
              Industry High
            </span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-xs hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200 group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Active Students
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900 dark:text-white font-mono">
                {activeStudents}
              </span>
              <span className="text-[11px] font-semibold text-emerald-500 flex items-center gap-0.5">
                <ArrowUpRight className="w-3.5 h-3.5" />
                +1
              </span>
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 font-medium">
              Registered students in active billing
            </p>
          </div>
          {/* Sparkline Visual */}
          <div className="mt-4 pt-3 border-t border-slate-50 dark:border-slate-800/60 flex items-center justify-between">
            <div className="flex gap-0.5 items-end h-5">
              <div className="w-1.5 h-2 bg-emerald-100 dark:bg-emerald-950/60 rounded-xs" />
              <div className="w-1.5 h-1.5 bg-emerald-200 dark:bg-emerald-900/40 rounded-xs" />
              <div className="w-1.5 h-3 bg-emerald-200 dark:bg-emerald-900/40 rounded-xs" />
              <div className="w-1.5 h-4 bg-emerald-300 dark:bg-emerald-800/50 rounded-xs" />
              <div className="w-1.5 h-4.5 bg-emerald-400 dark:bg-emerald-600/60 rounded-xs" />
              <div className="w-1.5 h-5 bg-emerald-600 dark:bg-emerald-500 rounded-xs" />
            </div>
            <span className="text-[10px] font-semibold font-mono text-emerald-600 dark:text-emerald-400">
              Zero Churn
            </span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-xs hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200 group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Realized Tuition
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                ${totalRealizedRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 rounded-sm">
                {invoicePaymentRate}% Collect
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/60 text-[10px]">
              <div>
                <span className="text-slate-400 block">Outstanding</span>
                <span className="font-mono font-bold text-rose-500 dark:text-rose-400 block">
                  ${totalOutstandingTuition.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Proj. Monthly</span>
                <span className="font-mono font-bold text-slate-700 dark:text-slate-300 block">
                  ${projectedMonthlyRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
          {/* Sparkline Visual */}
          <div className="mt-2.5 pt-2.5 border-t border-slate-50 dark:border-slate-800/60 flex items-center justify-between">
            <div className="flex gap-0.5 items-end h-4">
              <div className="w-1.5 h-1.5 bg-emerald-100 dark:bg-emerald-950/60 rounded-xs" />
              <div className="w-1.5 h-2 bg-emerald-200 dark:bg-emerald-900/40 rounded-xs" />
              <div className="w-1.5 h-1.5 bg-emerald-250 dark:bg-emerald-900/45 rounded-xs" />
              <div className="w-1.5 h-3 bg-emerald-300 dark:bg-emerald-800/50 rounded-xs" />
              <div className="w-1.5 h-4.5 bg-emerald-500 dark:bg-emerald-600/60 rounded-xs" />
              <div className="w-1.5 h-4 bg-emerald-600 dark:bg-emerald-500 rounded-xs" />
            </div>
            <span className="text-[9px] font-bold font-mono text-emerald-600 dark:text-emerald-400">
              Live SRE Audit State
            </span>
          </div>
        </div>
      </div>

      {/* Charts & Timelines Container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recharts Lead Inflow Area Chart */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h4 className="text-base font-bold text-slate-800 dark:text-white">
                Inquiry & Enrollment Velocity
              </h4>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                6-month tracking of client inquiry volume vs. successfully registered active students
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                <span className="text-slate-600 dark:text-slate-400">Leads</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-slate-600 dark:text-slate-400">Enrolled</span>
              </div>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={enrollmentTrend} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorEnrolled" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.15)" />
                <XAxis 
                  dataKey="name" 
                  stroke="#94a3b8" 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={false}
                />
                <YAxis 
                  stroke="#94a3b8" 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={false}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                    border: '1px solid rgba(255,255,255,0.1)', 
                    borderRadius: '12px',
                    color: '#fff'
                  }} 
                  labelStyle={{ fontWeight: 'bold', color: '#818cf8', fontSize: '11px' }}
                  itemStyle={{ fontSize: '12px', padding: '2px 0' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="Leads" 
                  stroke="#6366f1" 
                  strokeWidth={2.5}
                  fillOpacity={1} 
                  fill="url(#colorLeads)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="Enrolled" 
                  stroke="#10b981" 
                  strokeWidth={2.5}
                  fillOpacity={1} 
                  fill="url(#colorEnrolled)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Upcoming Trial/Lesson Planner Summary */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-base font-bold text-slate-800 dark:text-white">
                Upcoming Lessons
              </h4>
              <button 
                onClick={() => onNavigateTab('schedule')}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Schedule Board
              </button>
            </div>
            
            <div className="space-y-3.5">
              {upcomingLessons.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">No upcoming lessons scheduled.</p>
              ) : (
                upcomingLessons.map((lesson) => (
                  <div 
                    key={lesson.id}
                    className="p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60 rounded-xl flex items-center justify-between hover:scale-[1.01] transition-transform"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs">
                        {lesson.instrument[0]}
                      </div>
                      <div className="min-w-0">
                        <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                          {lesson.leadName}
                        </h5>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium truncate">
                          {lesson.instrument} • {lesson.tutorName}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block text-[9px] px-2 py-0.5 rounded-full font-mono font-bold mb-1 ${
                        lesson.type === 'Trial' 
                          ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400' 
                          : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400'
                      }`}>
                        {lesson.type}
                      </span>
                      <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400 font-semibold">
                        {lesson.date} @ {lesson.time}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 mt-4">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400 dark:text-slate-500">
              <span>Class Capacity Capacity</span>
              <span className="font-mono text-slate-700 dark:text-slate-300">82% Full</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-2 overflow-hidden">
              <div className="bg-indigo-600 h-full rounded-full" style={{ width: '82%' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Visual Recruitment Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Funnel Chart Card */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-xs lg:col-span-2 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/60 pb-4">
            <div>
              <h4 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-500" />
                Student Recruitment Funnel
              </h4>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-0.5">
                Cumulative conversion efficiency of incoming inquiries progressing to active billing students
              </p>
            </div>
            
            {/* View toggle */}
            <div className="flex bg-slate-50 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-800 shrink-0 select-none">
              <button 
                onClick={() => setFunnelViewMode('pipeline')}
                className={`px-3 py-1.5 rounded-lg transition-all ${funnelViewMode === 'pipeline' ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
              >
                Pipeline Flow
              </button>
              <button 
                onClick={() => setFunnelViewMode('chart')}
                className={`px-3 py-1.5 rounded-lg transition-all ${funnelViewMode === 'chart' ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
              >
                Volume Chart
              </button>
            </div>
          </div>

          {funnelViewMode === 'pipeline' ? (
            /* Bespoke Pipeline Visualizer */
            <div className="space-y-4">
              {funnelData.map((item, index) => {
                const hasNext = index < funnelData.length - 1;
                const nextItem = hasNext ? funnelData[index + 1] : null;
                // Calculate step drop-off
                const dropOffPercent = nextItem ? 100 - Math.round((nextItem.count / (item.count || 1)) * 100) : 0;

                return (
                  <React.Fragment key={item.stage}>
                    {/* Stage bar */}
                    <div className="relative group">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 rounded-xl border border-slate-100 dark:border-slate-850 bg-slate-50/40 dark:bg-slate-950/20 hover:border-slate-200 dark:hover:border-slate-800 transition-all">
                        {/* Stage Details */}
                        <div className="flex items-center gap-3 z-10">
                          <div className={`w-8 h-8 rounded-lg ${item.bgLight} ${item.textColor} flex items-center justify-center font-bold text-sm`}>
                            {index + 1}
                          </div>
                          <div>
                            <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                              {item.stage}
                            </h5>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                              {item.description}
                            </p>
                          </div>
                        </div>

                        {/* Bar and Stats */}
                        <div className="flex items-center gap-4 flex-1 max-w-md sm:justify-end z-10">
                          {/* Relative Width Bar */}
                          <div className="hidden sm:block flex-1 bg-slate-100 dark:bg-slate-800/80 rounded-full h-2.5 overflow-hidden max-w-[160px]">
                            <div 
                              className={`bg-gradient-to-r ${item.color} h-full rounded-full transition-all duration-500`}
                              style={{ width: `${item.percentageOfTotal}%` }}
                            />
                          </div>

                          {/* Count & conversion badges */}
                          <div className="flex items-center gap-2 font-mono text-xs">
                            <span className="font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/60 px-2 py-0.5 rounded-md border border-slate-200/20">
                              {item.count} leads
                            </span>
                            <span className="font-black text-slate-500 dark:text-slate-400 bg-slate-100/50 dark:bg-slate-800/30 px-1.5 py-0.5 rounded-md text-[10px]">
                              {item.percentageOfTotal}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Step-to-Step Conversion Connector */}
                    {hasNext && (
                      <div className="flex items-center justify-center h-8 -my-2 relative z-10">
                        {/* Connecting Line */}
                        <div className="absolute top-0 bottom-0 w-0.5 bg-dashed bg-slate-200 dark:bg-slate-800/60" />
                        
                        {/* Connector badge */}
                        <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow-3xs">
                          <ArrowDown className="w-3 h-3 text-indigo-500" />
                          <span className="text-slate-600 dark:text-slate-400 font-mono">
                            {item.stepConversion}% step rate
                          </span>
                          {dropOffPercent > 0 && (
                            <span className="text-rose-500 font-mono text-[9px] border-l border-slate-100 dark:border-slate-800 pl-1">
                              -{dropOffPercent}% drop
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          ) : (
            /* Recharts Funnel Bar Chart View */
            <div className="space-y-4">
              <div className="h-72 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={funnelData}
                    margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} stroke="#f1f5f9" className="dark:stroke-slate-800/50" />
                    <XAxis type="number" stroke="#94a3b8" fontSize={10} tickLine={false} />
                    <YAxis dataKey="stage" type="category" stroke="#94a3b8" fontSize={10} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ 
                        fontSize: '11px', 
                        fontWeight: 'bold',
                        backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                        border: '1px solid rgba(255,255,255,0.1)', 
                        borderRadius: '12px',
                        color: '#fff'
                      }} 
                    />
                    <Bar dataKey="count" name="Active In pipeline" radius={[0, 4, 4, 0]} barSize={18}>
                      {funnelData.map((entry, index) => {
                        let barColor = '#6366f1';
                        if (index === 1) barColor = '#4f46e5';
                        if (index === 2) barColor = '#8b5cf6';
                        if (index === 3) barColor = '#ec4899';
                        if (index === 4) barColor = '#10b981';
                        return <Cell key={`cell-${index}`} fill={barColor} />;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-around text-center border-t border-slate-50 dark:border-slate-800/60 pt-4 text-[11px] font-semibold text-slate-400">
                <div>
                  <span className="block font-black text-slate-700 dark:text-slate-300 font-mono text-sm">
                    {leads.filter(l => l.status === 'Active').length}
                  </span>
                  <span>Active Enrolled</span>
                </div>
                <div className="border-l border-slate-100 dark:border-slate-800 h-8" />
                <div>
                  <span className="block font-black text-indigo-600 dark:text-indigo-400 font-mono text-sm">
                    {leads.filter(l => ['New', 'Contacted', 'Trial Scheduled'].includes(l.status)).length}
                  </span>
                  <span>Active Pipeline</span>
                </div>
                <div className="border-l border-slate-100 dark:border-slate-800 h-8" />
                <div>
                  <span className="block font-black text-emerald-600 dark:text-emerald-400 font-mono text-sm">
                    {conversionRate}%
                  </span>
                  <span>Conversion Rate</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Recruitment Health Insights Card */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <h4 className="text-base font-bold text-slate-800 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800/60 flex items-center gap-2">
              <Activity className="w-4.5 h-4.5 text-emerald-500" />
              Recruitment Health
            </h4>

            {/* Health Score and status indicator */}
            <div className="bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-100/40 dark:border-emerald-900/10 p-4 rounded-xl space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Recruitment Health Grade</span>
                <span className="text-[9px] bg-emerald-500 text-white font-black px-1.5 py-0.5 rounded uppercase font-mono">Excellent</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                  {Math.round(conversionRate * 1.1) > 100 ? 98 : Math.round(conversionRate * 1.1)}/100
                </span>
                <span className="text-xs text-slate-400 font-semibold">Healthy Flow Index</span>
              </div>
            </div>

            {/* Strategic Bottleneck Analysis */}
            <div className="space-y-3 pt-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-mono">Pipeline Bottleneck audit</span>
              
              <div className="space-y-2.5">
                <div className="flex gap-2.5">
                  <div className="p-1 h-5 w-5 rounded-md bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 shrink-0 flex items-center justify-center mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h5 className="text-[11px] font-bold text-slate-700 dark:text-slate-300">High Lead Engagement</h5>
                    <p className="text-[10px] leading-relaxed text-slate-400 font-medium">
                      Inquiries to contacted step rate sits at {funnelData[1]?.stepConversion || 100}%. Staff is successfully making initial parent touchpoints quickly.
                    </p>
                  </div>
                </div>

                <div className="flex gap-2.5">
                  <div className="p-1 h-5 w-5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-500 shrink-0 flex items-center justify-center mt-0.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h5 className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Trial Scheduling Slip</h5>
                    <p className="text-[10px] leading-relaxed text-slate-400 font-medium">
                      Only {funnelData[2]?.stepConversion || 60}% of contacted parents book a trial. This is our core dropout zone.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Strategic advice CTA */}
          <div className="bg-slate-50 dark:bg-slate-850/40 border border-slate-150 dark:border-slate-800 p-3.5 rounded-xl mt-4">
            <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase block tracking-wider font-mono mb-1">Registrar Recommendation</span>
            <p className="text-[10px] leading-relaxed text-slate-500 dark:text-slate-400 font-medium">
              We recommend setting up automated SMS follow-ups for inquiries that have been marked "Contacted" but haven't scheduled a trial lesson within 72 hours.
            </p>
          </div>
        </div>
      </div>

      {/* 🎂 Student Birthday Wishes & Reminders Section */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/60">
          <div>
            <h4 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Cake className="w-5 h-5 text-pink-500 animate-bounce" />
              Student Birthday Wishes & Alerts Center
            </h4>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
              Monitor student birthdays, trigger congratulations outreach, and track follow-up IDs
            </p>
          </div>
          <span className="bg-pink-100 dark:bg-pink-950/50 text-pink-700 dark:text-pink-300 px-2.5 py-1 rounded-full text-xs font-bold font-mono">
            {birthdayAlerts.length} Alerts Active
          </span>
        </div>

        {birthdayAlerts.length === 0 ? (
          <div className="text-center py-6 text-slate-400 dark:text-slate-500 text-xs flex flex-col items-center gap-2">
            <Gift className="w-8 h-8 text-slate-300 dark:text-slate-700" />
            No active or upcoming student birthdays found for the next 7 days.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {birthdayAlerts.map(({ lead, diffDays, birthdayStr }) => {
              const isToday = diffDays === 0;
              const isTomorrow = diffDays === 1;
              const isRecent = diffDays < 0;
              
              const isWishing = wishingLeadId === lead.id;

              return (
                <div 
                  key={lead.id}
                  className={`p-4 rounded-xl border transition-all flex flex-col justify-between gap-3 ${
                    isToday 
                      ? 'bg-amber-50/40 dark:bg-amber-950/10 border-amber-200 dark:border-amber-900/30 shadow-2xs' 
                      : 'bg-slate-50/50 dark:bg-slate-850/20 border-slate-100 dark:border-slate-800/60'
                  }`}
                >
                  <div className="flex justify-between items-start gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-800 dark:text-slate-200 text-xs truncate">
                          {lead.name}
                        </span>
                        <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-1.5 py-0.2 rounded font-mono font-semibold">
                          {lead.instrument} ({lead.age}yo)
                        </span>
                      </div>
                      
                      {/* Social handles and IDs */}
                      <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5 text-[10px] text-slate-400 font-mono">
                        {lead.instagram && (
                          <span className="text-indigo-500 dark:text-indigo-400">
                            IG: <strong className="font-bold select-all">{lead.instagram}</strong>
                          </span>
                        )}
                        {lead.telegram && (
                          <span className="text-teal-500">
                            TG: <strong className="font-bold select-all">{lead.telegram}</strong>
                          </span>
                        )}
                        {lead.facebook && (
                          <span className="text-blue-500">
                            FB: <strong className="font-bold select-all">{lead.facebook}</strong>
                          </span>
                        )}
                        {lead.youtube && (
                          <span className="text-rose-500">
                            YT: <strong className="font-bold select-all">{lead.youtube}</strong>
                          </span>
                        )}
                        {lead.followUpId && (
                          <span className="text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800 px-1 rounded bg-white dark:bg-slate-900">
                            Tracker ID: {lead.followUpId}
                          </span>
                        )}
                      </div>
                    </div>

                    <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 font-mono ${
                      isToday 
                        ? 'bg-rose-500 text-white animate-pulse' 
                        : isTomorrow 
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300' 
                          : isRecent
                            ? 'bg-slate-200 text-slate-600 dark:bg-slate-850 dark:text-slate-400'
                            : 'bg-pink-100 text-pink-800 dark:bg-pink-900/40 dark:text-pink-300'
                    }`}>
                      {isToday 
                        ? '🎉 Today' 
                        : isTomorrow 
                          ? '🎂 Tomorrow' 
                          : isRecent
                            ? `🎁 Passed ${Math.abs(diffDays)}d ago`
                            : `📅 In ${diffDays} days`} ({birthdayStr})
                    </span>
                  </div>

                  {/* Wishing Action panel */}
                  {isWishing ? (
                    <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800/80 rounded-lg p-2.5 space-y-2 mt-1 animate-in slide-in-from-top-1">
                      <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                        <span>Outreach channel:</span>
                        <div className="flex gap-1">
                          {(['SMS', 'Email', 'Call'] as const).map(type => (
                            <button
                              key={type}
                              type="button"
                              onClick={() => {
                                setWishType(type);
                                setWishDetails(`Dear ${lead.name}, Happy Birthday from all of us at the Music Academy! We wish you a beautiful year of learning, creativity, and magnificent musical achievements! 🎹🎻🎶`);
                              }}
                              className={`px-1.5 py-0.5 rounded transition-colors ${
                                wishType === type 
                                  ? 'bg-indigo-600 text-white' 
                                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-500'
                              }`}
                            >
                              {type}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      <textarea
                        rows={2}
                        value={wishDetails}
                        onChange={(e) => setWishDetails(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded p-1.5 text-[11px] text-slate-700 dark:text-slate-300 focus:outline-none focus:border-indigo-500 font-sans"
                        placeholder="Type personalized wishes..."
                      />

                      <div className="flex justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setWishingLeadId(null)}
                          className="px-2 py-1 border border-slate-200 dark:border-slate-700 rounded text-[10px] font-semibold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (onAddInteraction) {
                              onAddInteraction(
                                lead.id,
                                wishType,
                                `🎉 Birthday Outreach (${wishType})`,
                                wishDetails || `Sent birthday congratulatory wishes to ${lead.name} via ${wishType}.`,
                                'Ganesh (Registrar)'
                              );
                            }
                            setWishingLeadId(null);
                          }}
                          className="px-2.5 py-1 bg-pink-600 hover:bg-pink-700 text-white rounded text-[10px] font-bold flex items-center gap-1 shadow-2xs"
                        >
                          <Send className="w-3 h-3" />
                          Send & Log Wish
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center mt-1 border-t border-slate-100 dark:border-slate-800/40 pt-2">
                      <span className="text-[10px] text-slate-450 dark:text-slate-400 font-medium font-mono truncate max-w-[150px]">
                        {lead.email}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setWishingLeadId(lead.id);
                          setWishType('SMS');
                          setWishDetails(`Dear ${lead.name}, Happy Birthday from all of us at the Music Academy! We wish you a beautiful year of learning, creativity, and magnificent musical achievements! 🎹🎻🎶`);
                        }}
                        className="bg-pink-50 hover:bg-pink-100 text-pink-600 dark:bg-pink-950/30 dark:hover:bg-pink-950/50 px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all"
                      >
                        <Gift className="w-3.5 h-3.5" />
                        Send Wish
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Academy Interactions Feed */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-xs">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h4 className="text-base font-bold text-slate-800 dark:text-white">
              Recent Communication Logs
            </h4>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
              Chronological log of parent calls, trial evaluations, emails, and student inquiries
            </p>
          </div>
          <button 
            onClick={() => onNavigateTab('interactions')}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            View Full Timeline
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recentInteractions.map((interaction) => {
            const correspondingLead = leads.find(l => l.id === interaction.leadId);
            return (
              <div 
                key={interaction.id}
                onClick={() => onSelectLead(interaction.leadId)}
                className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-indigo-100 dark:hover:border-indigo-950/60 hover:bg-slate-50/40 dark:hover:bg-slate-850/20 cursor-pointer transition-all duration-150 flex gap-3 group"
              >
                <div className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800/60 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  {getInteractionIcon(interaction.type)}
                </div>
                
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {correspondingLead ? correspondingLead.name : 'Unknown Contact'}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 font-semibold shrink-0">
                      {interaction.date}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.2 rounded font-mono">
                      {interaction.type}
                    </span>
                    <span className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400 truncate">
                      {interaction.summary}
                    </span>
                  </div>
                  
                  <p className="text-xs text-slate-400 dark:text-slate-500 line-clamp-1">
                    {interaction.details}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 💼 Sai Music Academy - General Accounts & Tuition Ledger */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800/60">
          <div>
            <h4 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-500" />
              General Accounts & Tuition Ledger
            </h4>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
              SRE-auditable statement history, payment collection statuses, manual invoicing, and fee refunds
            </p>
          </div>
          <button
            onClick={() => setShowInvoiceCreator(!showInvoiceCreator)}
            className="self-start md:self-auto bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-md shadow-indigo-600/10 flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4" />
            {showInvoiceCreator ? 'Close Assessment Form' : 'New Fee Assessment'}
          </button>
        </div>

        {/* Invoice Creator Form */}
        {showInvoiceCreator && (
          <form onSubmit={handleCreateInvoiceSubmit} className="bg-slate-50 dark:bg-slate-850/40 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4 animate-in fade-in-30">
            <h5 className="text-xs uppercase font-extrabold text-indigo-600 dark:text-indigo-400 tracking-wider">
              Issue New Tuition Bill Assessment
            </h5>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-400">Select Student</label>
                <select
                  required
                  value={creatorLeadId}
                  onChange={(e) => setCreatorLeadId(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs rounded-lg p-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="">-- Choose active student --</option>
                  {leads.map(student => (
                    <option key={student.id} value={student.id}>
                      {student.name} ({student.instrument})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-400">Course Instrument</label>
                <select
                  required
                  value={creatorInstrument}
                  onChange={(e) => setCreatorInstrument(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs rounded-lg p-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  {['Guitar', 'Piano', 'Violin', 'Drums', 'Vocal'].map(inst => (
                    <option key={inst} value={inst}>{inst}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-400">Tuition Amount ($)</label>
                <input
                  required
                  type="number"
                  min="1"
                  step="0.01"
                  value={creatorAmount}
                  onChange={(e) => setCreatorAmount(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs rounded-lg p-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-400">Payment Due Date</label>
                <input
                  required
                  type="date"
                  value={creatorDueDate}
                  onChange={(e) => setCreatorDueDate(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs rounded-lg p-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowInvoiceCreator(false)}
                className="px-4 py-2 border border-slate-250 dark:border-slate-750 text-xs font-bold text-slate-500 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all"
              >
                Create Tuition Invoice
              </button>
            </div>
          </form>
        )}

        {/* Ledger Control Bars */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          {/* Search Box */}
          <div className="w-full sm:max-w-xs relative">
            <input
              type="text"
              placeholder="Search ledger by student or ID..."
              value={ledgerSearch}
              onChange={(e) => setLedgerSearch(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs rounded-xl pl-3 pr-3 py-2.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Filters pills */}
          <div className="flex gap-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {['All', 'Paid', 'Pending', 'Failed', 'Refunded'].map(status => (
              <button
                key={status}
                type="button"
                onClick={() => setLedgerStatusFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border ${
                  ledgerStatusFilter === status
                    ? 'bg-slate-850 dark:bg-indigo-950/80 border-slate-900 dark:border-indigo-700 text-white dark:text-indigo-300'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Ledger Statement Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-150 dark:border-slate-800 bg-white dark:bg-slate-900">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/70 dark:bg-slate-850/35 border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Invoice ID</th>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Instrument</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Attempts</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
              {filteredInvoicesForLedger.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 font-medium">
                    No ledger entries match current filter criteria.
                  </td>
                </tr>
              ) : (
                filteredInvoicesForLedger.map(inv => (
                  <tr key={inv.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/15 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-400 text-[10px]">
                      #{inv.id}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200">
                      {inv.leadName}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 font-medium">
                      {inv.instrument}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800 dark:text-white">
                      ${inv.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-500 dark:text-slate-400">
                      {inv.dueDate}
                    </td>
                    <td className="py-3.5 px-4">
                      {inv.status === 'Paid' && (
                        <span className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-[9px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wide border border-emerald-200 dark:border-emerald-900/40">
                          Paid
                        </span>
                      )}
                      {inv.status === 'Pending' && (
                        <span className="bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 text-[9px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wide border border-amber-200 dark:border-amber-900/40">
                          Pending
                        </span>
                      )}
                      {inv.status === 'Failed' && (
                        <span className="bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-[9px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wide border border-rose-200 dark:border-rose-900/40">
                          Failed
                        </span>
                      )}
                      {inv.status === 'Refunded' && (
                        <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[9px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wide border border-slate-200 dark:border-slate-700">
                          Refunded
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-500">
                      {inv.paymentAttempts || 0}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                      {inv.status === 'Paid' ? (
                        <button
                          onClick={() => {
                            if (onUpdateInvoice) {
                              onUpdateInvoice({ ...inv, status: 'Refunded' });
                            }
                          }}
                          className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold text-[10px] uppercase py-1 px-2.5 rounded-lg transition-all"
                          title="Refund charge to client account balance"
                        >
                          Refund
                        </button>
                      ) : (inv.status === 'Pending' || inv.status === 'Failed') ? (
                        <button
                          onClick={() => {
                            if (onPayInvoice) {
                              onPayInvoice(inv.id, 'Paid', (inv.paymentAttempts || 0) + 1);
                            }
                          }}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] uppercase py-1 px-2.5 rounded-lg transition-all shadow-2xs"
                          title="Manually authorize payment as successful in the ledger"
                        >
                          Mark Paid
                        </button>
                      ) : null}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
