import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  User, 
  Mail, 
  Phone, 
  Music, 
  Grid, 
  List, 
  ArrowUpDown,
  BookOpen,
  Calendar,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  GraduationCap,
  Download,
  Trash,
  CheckSquare
} from 'lucide-react';
import { Lead, Tutor, LeadStatus } from '../types';

interface LeadsViewProps {
  leads: Lead[];
  tutors: Tutor[];
  selectedLeadId: string | null;
  onSelectLead: (leadId: string) => void;
  onAddLead: (newLead: Omit<Lead, 'id' | 'createdAt'>) => void;
  onUpdateLead: (updatedLead: Lead) => void;
  onDeleteLead?: (leadId: string) => void;
}

export default function LeadsView({ 
  leads, 
  tutors, 
  selectedLeadId, 
  onSelectLead,
  onAddLead,
  onUpdateLead,
  onDeleteLead
}: LeadsViewProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('kanban');
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [compactMode, setCompactMode] = useState<boolean>(false);
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'All'>('All');
  const [instrumentFilter, setInstrumentFilter] = useState<string>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [localSearch, setLocalSearch] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'instrument'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Add lead form states
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newAge, setNewAge] = useState(10);
  const [newInstrument, setNewInstrument] = useState('Piano');
  const [newLevel, setNewLevel] = useState<Lead['level']>('Beginner');
  const [newNotes, setNewNotes] = useState('');
  const [newBudget, setNewBudget] = useState(180);
  const [newSchedule, setNewSchedule] = useState('');
  const [newTutorId, setNewTutorId] = useState('');

  // Extract unique instruments
  const instrumentsList = ['All', 'Piano', 'Violin', 'Classical Guitar', 'Electric Guitar', 'Vocals', 'Drums', 'Keyboard', 'Flute'];

  // Handle Form submission
  const handleSubmitLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim() || !newPhone.trim()) return;

    const ageCategory = newAge < 13 ? 'Child' : newAge < 18 ? 'Teen' : 'Adult';

    onAddLead({
      name: newName,
      email: newEmail,
      phone: newPhone,
      age: newAge,
      category: ageCategory,
      instrument: newInstrument,
      level: newLevel,
      status: 'New',
      assignedTutorId: newTutorId || undefined,
      monthlyBudget: newBudget,
      preferredSchedule: newSchedule || 'Mondays or Wednesdays PM',
      notes: newNotes,
    });

    // Reset Form
    setNewName('');
    setNewEmail('');
    setNewPhone('');
    setNewAge(10);
    setNewNotes('');
    setNewBudget(180);
    setNewSchedule('');
    setNewTutorId('');
    setShowAddForm(false);
  };

  // Filter & Search Logic
  const filteredLeads = leads
    .filter(lead => {
      // Search match
      const query = localSearch.toLowerCase();
      const matchesSearch = 
        lead.name.toLowerCase().includes(query) ||
        lead.email.toLowerCase().includes(query) ||
        lead.instrument.toLowerCase().includes(query) ||
        lead.phone.includes(query);

      // Status match
      const matchesStatus = statusFilter === 'All' || lead.status === statusFilter;

      // Instrument match
      const matchesInstrument = instrumentFilter === 'All' || lead.instrument.toLowerCase() === instrumentFilter.toLowerCase();

      // Category match
      const matchesCategory = categoryFilter === 'All' || lead.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesInstrument && matchesCategory;
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === 'instrument') {
        comparison = a.instrument.localeCompare(b.instrument);
      } else {
        comparison = a.createdAt.localeCompare(b.createdAt);
      }
      return sortOrder === 'desc' ? -comparison : comparison;
    });

  const getStatusStyle = (status: LeadStatus) => {
    switch (status) {
      case 'New': 
        return 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border-blue-200/50 dark:border-blue-900/30';
      case 'Contacted': 
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200/50 dark:border-amber-900/30';
      case 'Trial Scheduled': 
        return 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border-rose-200/50 dark:border-rose-900/30';
      case 'Active': 
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-900/30';
      default: 
        return 'bg-slate-50 text-slate-700 dark:bg-slate-800/40 dark:text-slate-400 border-slate-200/50 dark:border-slate-800/40';
    }
  };

  const toggleSort = (field: 'name' | 'date' | 'instrument') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const handleDownloadCSV = () => {
    const headers = [
      'ID',
      'Name',
      'Email',
      'Phone',
      'Age',
      'Category',
      'Instrument',
      'Level',
      'Status',
      'Assigned Tutor',
      'Monthly Budget ($)',
      'Preferred Schedule',
      'Created At',
      'Notes'
    ];

    const csvRows = [headers.join(',')];

    for (const lead of leads) {
      const tutorName = tutors.find(t => t.id === lead.assignedTutorId)?.name || 'Unassigned';
      
      const values = [
        lead.id,
        lead.name,
        lead.email,
        lead.phone,
        lead.age,
        lead.category,
        lead.instrument,
        lead.level,
        lead.status,
        tutorName,
        lead.monthlyBudget !== undefined ? lead.monthlyBudget : '',
        lead.preferredSchedule || '',
        lead.createdAt,
        lead.notes || ''
      ];

      const escapedValues = values.map(val => {
        const str = String(val).replace(/"/g, '""');
        return `"${str}"`;
      });

      csvRows.push(escapedValues.join(','));
    }

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `leads_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Top action bar with stats summaries */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-800 dark:text-white">Leads Pipeline Board</h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
            Currently tracking {filteredLeads.length} filtered inquiries out of {leads.length} total
          </p>
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto self-stretch sm:self-auto">
          {/* View Mode Toggle Switch */}
          <div className="flex items-center border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl p-1 shadow-2xs mr-1">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-lg flex items-center justify-center cursor-pointer transition-all ${
                viewMode === 'kanban' 
                  ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold' 
                  : 'text-slate-400 hover:text-slate-600'
              }`}
              title="Kanban Board View"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg flex items-center justify-center cursor-pointer transition-all ${
                viewMode === 'list' 
                  ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold' 
                  : 'text-slate-400 hover:text-slate-600'
              }`}
              title="Table List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleDownloadCSV}
            className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold px-4 py-2.5 rounded-xl transition-all duration-150 flex items-center gap-2 cursor-pointer flex-1 sm:flex-none justify-center shadow-xs"
          >
            <Download className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            Download CSV
          </button>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all duration-150 shadow-md shadow-indigo-700/10 flex items-center gap-2 cursor-pointer flex-1 sm:flex-none justify-center"
          >
            <Plus className="w-4 h-4" />
            {showAddForm ? 'Close Intake Form' : 'Register New Lead'}
          </button>
        </div>
      </div>

      {/* Add Lead Form (Collapsible Slider) */}
      {showAddForm && (
        <form onSubmit={handleSubmitLead} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-xl space-y-5 animate-in slide-in-from-top-4 duration-200">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800/80">
            <Sparkles className="text-indigo-600 dark:text-indigo-400 w-4.5 h-4.5 animate-bounce" />
            <h4 className="text-sm font-bold text-slate-800 dark:text-white">New Student Intake Registrations</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Lead basics */}
            <div className="space-y-3.5">
              <h5 className="text-[11px] uppercase tracking-wider font-bold text-slate-400">1. Contact Details</h5>
              
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Student Name</label>
                <input
                  type="text"
                  placeholder="e.g. Benjamin Harrison"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold p-2.5 text-slate-800 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Parent Email / Contact</label>
                <input
                  type="email"
                  placeholder="e.g. family@example.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold p-2.5 text-slate-800 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Phone Number</label>
                <input
                  type="text"
                  placeholder="e.g. (555) 019-2834"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold p-2.5 text-slate-800 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
            </div>

            {/* Music Spec */}
            <div className="space-y-3.5">
              <h5 className="text-[11px] uppercase tracking-wider font-bold text-slate-400">2. Music Specifications</h5>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Age of Student</label>
                  <input
                    type="number"
                    min={4}
                    max={100}
                    value={newAge}
                    onChange={(e) => setNewAge(Number(e.target.value))}
                    className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold p-2.5 text-slate-800 dark:text-slate-200 focus:bg-white"
                    required
                  />
                </div>
                
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Taught Level</label>
                  <select
                    value={newLevel}
                    onChange={(e) => setNewLevel(e.target.value as Lead['level'])}
                    className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold p-2.5 text-slate-800 dark:text-slate-200 focus:bg-white"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Instrument Category</label>
                <select
                  value={newInstrument}
                  onChange={(e) => setNewInstrument(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold p-2.5 text-slate-800 dark:text-slate-200 focus:bg-white"
                >
                  <option value="Piano">Piano</option>
                  <option value="Keyboard">Keyboard</option>
                  <option value="Violin">Violin</option>
                  <option value="Classical Guitar">Classical Guitar</option>
                  <option value="Electric Guitar">Electric Guitar</option>
                  <option value="Vocals">Vocals</option>
                  <option value="Drums">Drums</option>
                  <option value="Flute">Flute</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Prefered Tutor Match</label>
                <select
                  value={newTutorId}
                  onChange={(e) => setNewTutorId(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold p-2.5 text-slate-800 dark:text-slate-200 focus:bg-white"
                >
                  <option value="">Auto-Assign (Based on specialty)</option>
                  {tutors.map(t => (
                    <option key={t.id} value={t.id}>{t.name} ({t.specialty.slice(0, 2).join(', ')})</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Scheduling & budgets */}
            <div className="space-y-3.5">
              <h5 className="text-[11px] uppercase tracking-wider font-bold text-slate-400">3. Goals & Logistics</h5>
              
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Budget Cap ($/month)</label>
                <input
                  type="number"
                  placeholder="e.g. 180"
                  value={newBudget}
                  onChange={(e) => setNewBudget(Number(e.target.value))}
                  className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold p-2.5 text-slate-800 dark:text-slate-200 focus:bg-white"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Preferred schedule times</label>
                <input
                  type="text"
                  placeholder="e.g. Wednesday afternoons after 4pm"
                  value={newSchedule}
                  onChange={(e) => setNewSchedule(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold p-2.5 text-slate-800 dark:text-slate-200 focus:bg-white"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Initial inquiry notes / history</label>
                <textarea
                  rows={2}
                  placeholder="Parent requested classical focus, bought keyboard..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs p-2.5 text-slate-800 dark:text-slate-200 focus:bg-white leading-normal"
                />
              </div>
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
              Register Lead & Start Pipeline
            </button>
          </div>
        </form>
      )}

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 p-4.5 rounded-2xl shadow-xs space-y-4">
        
        {/* Status Filtering Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-100 dark:border-slate-800/60 pb-3">
          <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mr-2">Pipeline:</span>
          {(['All', 'New', 'Contacted', 'Trial Scheduled', 'Active', 'Inactive'] as const).map((status) => {
            const count = status === 'All' ? leads.length : leads.filter(l => l.status === status).length;
            const isSelected = statusFilter === status;
            return (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  isSelected 
                    ? 'bg-indigo-600 dark:bg-indigo-500 text-white shadow-sm shadow-indigo-500/20' 
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <span>{status === 'All' ? 'All Contacts' : status === 'Trial Scheduled' ? 'Trial Booked' : status}</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-md ${
                  isSelected ? 'bg-indigo-700 dark:bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-850 text-slate-500'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Dropdown Filters & Search */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
          {/* Inner Search Box */}
          <div className="relative sm:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, phone, email..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-xs rounded-xl text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Instrument Filter */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase shrink-0">Instrument</span>
            <select
              value={instrumentFilter}
              onChange={(e) => setInstrumentFilter(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-xs rounded-xl p-2 font-semibold text-slate-700 dark:text-slate-300"
            >
              {instrumentsList.map(inst => (
                <option key={inst} value={inst}>{inst}</option>
              ))}
            </select>
          </div>

          {/* Age Filter */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase shrink-0">Age Group</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-xs rounded-xl p-2 font-semibold text-slate-700 dark:text-slate-300"
            >
              <option value="All">All Categories</option>
              <option value="Child">Child (Under 13)</option>
              <option value="Teen">Teen (13 - 17)</option>
              <option value="Adult">Adult (18+)</option>
            </select>
          </div>
        </div>
      </div>

      {/* View router: Kanban Board vs Table list */}
      {viewMode === 'kanban' ? (
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
          {(() => {
            const pipelineStages: LeadStatus[] = ['New', 'Contacted', 'Trial Scheduled', 'Application Review', 'Offer Extended', 'Active', 'Inactive'];
            
            const handleShiftStage = (lead: Lead, direction: 'left' | 'right') => {
              const currentIndex = pipelineStages.indexOf(lead.status);
              if (currentIndex === -1) return;
              
              let nextIndex = currentIndex + (direction === 'left' ? -1 : 1);
              if (nextIndex >= 0 && nextIndex < pipelineStages.length) {
                onUpdateLead({
                  ...lead,
                  status: pipelineStages[nextIndex]
                });
              }
            };

            return pipelineStages.map((stage) => {
              const stageLeads = filteredLeads.filter(l => l.status === stage);
              
              // Stage styling helpers
              const stageStyles: Record<LeadStatus, { title: string, border: string, bg: string, text: string }> = {
                'New': { title: 'New Inquiry', border: 'border-t-sky-500', bg: 'bg-sky-50/45 dark:bg-sky-950/10', text: 'text-sky-600 dark:text-sky-400' },
                'Contacted': { title: 'Contact Established', border: 'border-t-amber-500', bg: 'bg-amber-50/45 dark:bg-amber-950/10', text: 'text-amber-600 dark:text-amber-400' },
                'Trial Scheduled': { title: 'Trial Scheduled', border: 'border-t-indigo-500', bg: 'bg-indigo-50/45 dark:bg-indigo-950/10', text: 'text-indigo-600 dark:text-indigo-400' },
                'Application Review': { title: 'Application Review', border: 'border-t-violet-500', bg: 'bg-violet-50/45 dark:bg-violet-950/10', text: 'text-violet-600 dark:text-violet-400' },
                'Offer Extended': { title: 'Admissions Offer', border: 'border-t-pink-500', bg: 'bg-pink-50/45 dark:bg-pink-950/10', text: 'text-pink-600 dark:text-pink-400' },
                'Active': { title: 'Enrolled - Active', border: 'border-t-emerald-500', bg: 'bg-emerald-50/45 dark:bg-emerald-950/10', text: 'text-emerald-600 dark:text-emerald-400' },
                'Inactive': { title: 'Inactive / Waitlist', border: 'border-t-slate-400', bg: 'bg-slate-50/45 dark:bg-slate-900/10', text: 'text-slate-500 dark:text-slate-400' }
              };

              const style = stageStyles[stage] || stageStyles['New'];

              return (
                <div 
                  key={stage} 
                  className={`flex-1 min-w-[270px] max-w-[320px] rounded-2xl border-t-4 ${style.border} bg-slate-100/60 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60 p-4 flex flex-col h-[580px]`}
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-slate-800/60 mb-3.5">
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 leading-tight">
                        {style.title}
                      </h4>
                      <span className="text-[10px] text-slate-400 font-bold block">
                        {stageLeads.length} {stageLeads.length === 1 ? 'contact' : 'contacts'}
                      </span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${style.bg} ${style.text}`}>
                      {stageLeads.length}
                    </span>
                  </div>

                  {/* Cards list */}
                  <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 scrollbar-thin">
                    {stageLeads.length === 0 ? (
                      <div className="text-center py-10 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/40 dark:bg-slate-900/20 text-[10px] text-slate-400">
                        No students in this stage
                      </div>
                    ) : (
                      stageLeads.map((lead) => {
                        const tutor = tutors.find(t => t.id === lead.assignedTutorId);
                        const isSelected = selectedLeadId === lead.id;
                        const isChecked = selectedLeadIds.includes(lead.id);

                        return (
                          <div 
                            key={lead.id}
                            className={`bg-white dark:bg-slate-900 border ${
                              isSelected ? 'border-indigo-500 shadow-indigo-500/5' : 'border-slate-200/80 dark:border-slate-800/80'
                            } ${isChecked ? 'ring-2 ring-indigo-500/50 bg-indigo-50/10 dark:bg-indigo-950/10' : ''} p-4 rounded-2xl shadow-3xs hover:shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-150 flex flex-col justify-between`}
                          >
                            <div className="space-y-2">
                              {/* Student Clickable Title */}
                              <div className="flex items-start justify-between gap-2">
                                <div className="cursor-pointer min-w-0 flex-1" onClick={() => onSelectLead(lead.id)}>
                                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors block line-clamp-1">
                                    {lead.name}
                                  </span>
                                  <div className="flex items-center gap-1.5 text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                                    <span>Age {lead.age}</span>
                                    <span>•</span>
                                    <span className="text-indigo-500">{lead.instrument}</span>
                                  </div>
                                </div>
                                <input 
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={(e) => {
                                    e.stopPropagation();
                                    if (e.target.checked) {
                                      setSelectedLeadIds(prev => [...prev, lead.id]);
                                    } else {
                                      setSelectedLeadIds(prev => prev.filter(id => id !== lead.id));
                                    }
                                  }}
                                  className="rounded border-slate-350 text-indigo-600 focus:ring-indigo-500 cursor-pointer w-4 h-4 shrink-0"
                                />
                              </div>

                              {/* Tutor row */}
                              <div className="flex items-center justify-between text-[10px] bg-slate-50 dark:bg-slate-850/50 p-2 rounded-xl border border-slate-100 dark:border-slate-800/40">
                                <span className="text-slate-400 font-bold uppercase text-[9px]">Tutor:</span>
                                {tutor ? (
                                  <div className="flex items-center gap-1.5">
                                    <img 
                                      src={tutor.avatar} 
                                      alt={tutor.name} 
                                      className="w-4.5 h-4.5 rounded-full object-cover"
                                      referrerPolicy="no-referrer"
                                    />
                                    <span className="font-bold text-slate-700 dark:text-slate-300 truncate max-w-[80px]">
                                      {tutor.name.split(' ')[0]}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-slate-400 italic">Unassigned</span>
                                )}
                              </div>
                            </div>

                            {/* Chevron Controls for Stage shift */}
                            <div className="flex items-center justify-between mt-3.5 pt-2 border-t border-slate-100 dark:border-slate-800/50">
                              <button
                                type="button"
                                disabled={pipelineStages.indexOf(lead.status) === 0}
                                onClick={() => handleShiftStage(lead, 'left')}
                                className="p-1 rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                title="Demote Stage"
                              >
                                <ChevronLeft className="w-3.5 h-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() => onSelectLead(lead.id)}
                                className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 hover:underline"
                              >
                                View Details
                              </button>

                              <button
                                type="button"
                                disabled={pipelineStages.indexOf(lead.status) === pipelineStages.length - 1}
                                onClick={() => handleShiftStage(lead, 'right')}
                                className="p-1 rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                title="Promote Stage"
                              >
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            });
          })()}
        </div>
      ) : (
        <div className="space-y-3">
          {/* List specific sub-bar with Compact Mode Toggle */}
          <div className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 px-4 py-2.5 rounded-xl shadow-3xs">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Student List Records</span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Compact Mode</span>
              <button
                type="button"
                id="leads-compact-toggle"
                onClick={() => setCompactMode(!compactMode)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  compactMode ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-800'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    compactMode ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className={`border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850/20 text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider ${
                    compactMode ? 'text-[9px]' : 'text-[10px]'
                  }`}>
                    <th className={`${compactMode ? 'py-1.5 px-3' : 'py-3 px-6'} select-none w-10`}>
                      <input 
                        type="checkbox"
                        checked={filteredLeads.length > 0 && filteredLeads.every(l => selectedLeadIds.includes(l.id))}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedLeadIds(prev => {
                              const newIds = [...prev];
                              filteredLeads.forEach(l => {
                                if (!newIds.includes(l.id)) newIds.push(l.id);
                              });
                              return newIds;
                            });
                          } else {
                            setSelectedLeadIds(prev => prev.filter(id => !filteredLeads.some(l => l.id === id)));
                          }
                        }}
                        className="rounded border-slate-350 text-indigo-600 focus:ring-indigo-500 cursor-pointer w-4 h-4"
                      />
                    </th>
                    <th 
                      className={`${compactMode ? 'py-1.5 px-3' : 'py-3 px-6'} cursor-pointer hover:text-indigo-600 select-none`}
                      onClick={() => toggleSort('name')}
                    >
                      <div className="flex items-center gap-1">
                        <span>Student Contact</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th 
                      className={`${compactMode ? 'py-1.5 px-3' : 'py-3 px-6'} cursor-pointer hover:text-indigo-600 select-none`}
                      onClick={() => toggleSort('instrument')}
                    >
                      <div className="flex items-center gap-1">
                        <span>Lesson Specs</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th className={`${compactMode ? 'py-1.5 px-3' : 'py-3 px-6'}`}>Assigned Tutor</th>
                    <th className={`${compactMode ? 'py-1.5 px-3' : 'py-3 px-6'}`}>Pipeline Status</th>
                    <th 
                      className={`${compactMode ? 'py-1.5 px-3' : 'py-3 px-6'} cursor-pointer hover:text-indigo-600 select-none`}
                      onClick={() => toggleSort('date')}
                    >
                      <div className="flex items-center gap-1">
                        <span>Inquiry Date</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th className={`${compactMode ? 'py-1.5 px-3' : 'py-3 px-6'} text-right`}>Action</th>
                  </tr>
                </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                {filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-slate-400 text-xs">
                      No leads match your active filters or query.
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map((lead) => {
                    const isSelected = selectedLeadId === lead.id;
                    const isChecked = selectedLeadIds.includes(lead.id);
                    const assignedTutor = tutors.find(t => t.id === lead.assignedTutorId);
                    
                    return (
                      <tr 
                        key={lead.id}
                        onClick={() => onSelectLead(lead.id)}
                        className={`group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all cursor-pointer ${
                          isSelected ? 'bg-indigo-50/30 dark:bg-indigo-950/20' : ''
                        } ${isChecked ? 'bg-indigo-50/10 dark:bg-indigo-950/5' : ''}`}
                      >
                        {/* Checkbox column */}
                        <td className={`${compactMode ? 'py-1.5 px-3' : 'py-4 px-6'} w-10`} onClick={(e) => e.stopPropagation()}>
                          <input 
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedLeadIds(prev => [...prev, lead.id]);
                              } else {
                                setSelectedLeadIds(prev => prev.filter(id => id !== lead.id));
                              }
                            }}
                            className="rounded border-slate-350 text-indigo-600 focus:ring-indigo-500 cursor-pointer w-4 h-4"
                          />
                        </td>
                        {/* Name / Category */}
                        <td className={`${compactMode ? 'py-1.5 px-3' : 'py-4 px-6'}`}>
                          <div className="flex items-center gap-3">
                            <div className={`${compactMode ? 'w-6 h-6 text-[10px]' : 'w-8 h-8 text-xs'} rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center shrink-0`}>
                              {lead.name[0]}
                            </div>
                            <div>
                              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                {lead.name}
                              </span>
                              <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-0.5">
                                <span>Age {lead.age}</span>
                                <span>•</span>
                                <span>{lead.category}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Instrument / Level */}
                        <td className={`${compactMode ? 'py-1.5 px-3' : 'py-4 px-6'}`}>
                          <div className="flex items-center gap-2">
                            <div className={`${compactMode ? 'p-1' : 'p-1.5'} bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-lg text-slate-500`}>
                              <GraduationCap className={compactMode ? "w-3 h-3" : "w-3.5 h-3.5"} />
                            </div>
                            <div>
                              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                                {lead.instrument}
                              </span>
                              <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-medium">
                                {lead.level} level
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Assigned Tutor */}
                        <td className={`${compactMode ? 'py-1.5 px-3' : 'py-4 px-6'}`}>
                          {assignedTutor ? (
                            <div className="flex items-center gap-2">
                              <img 
                                src={assignedTutor.avatar} 
                                alt={assignedTutor.name} 
                                className={`${compactMode ? 'w-4.5 h-4.5' : 'w-5.5 h-5.5'} rounded-full object-cover ring-1 ring-slate-100 dark:ring-slate-800`}
                                referrerPolicy="no-referrer"
                              />
                              <span className="text-xs text-slate-600 dark:text-slate-300 font-semibold">
                                {assignedTutor.name}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400 dark:text-slate-500 font-medium italic">
                              Unassigned
                            </span>
                          )}
                        </td>

                        {/* Status */}
                        <td className={`${compactMode ? 'py-1.5 px-3' : 'py-4 px-6'}`}>
                          <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full font-bold border ${getStatusStyle(lead.status)}`}>
                            {lead.status === 'Trial Scheduled' ? 'Trial Booked' : lead.status}
                          </span>
                        </td>

                        {/* Date Created */}
                        <td className={`${compactMode ? 'py-1.5 px-3' : 'py-4 px-6'}`}>
                          <span className="text-xs font-mono text-slate-500 dark:text-slate-400 font-semibold">
                            {lead.createdAt}
                          </span>
                        </td>

                        {/* Action Arrow */}
                        <td className={`${compactMode ? 'py-1.5 px-3' : 'py-4 px-6'} text-right`}>
                          <button className="p-1 rounded-lg text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all">
                            <ChevronRight className={compactMode ? "w-3.5 h-3.5" : "w-4 h-4"} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )}

      {/* Floating Glassmorphic Bulk Action Toolbar */}
      {selectedLeadIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-md text-white px-6 py-4 rounded-2xl border border-slate-800 shadow-2xl flex flex-wrap items-center justify-between gap-6 z-50 animate-in slide-in-from-bottom-4 duration-300 max-w-[95%] md:max-w-4xl w-[600px] md:w-auto">
          <div className="flex items-center gap-2 border-r border-slate-800 pr-4 shrink-0">
            <span className="w-5 h-5 bg-indigo-600 text-[10px] font-black flex items-center justify-center rounded-full">
              {selectedLeadIds.length}
            </span>
            <span className="text-xs font-bold text-slate-300">Leads Selected</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs">
            {/* Reassign Tutor */}
            <div className="flex items-center gap-1.5 bg-slate-850 p-1 rounded-xl border border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1 shrink-0">Tutor:</span>
              <select
                onChange={(e) => {
                  const val = e.target.value;
                  if (!val) return;
                  selectedLeadIds.forEach(id => {
                    const leadObj = leads.find(l => l.id === id);
                    if (leadObj) {
                      onUpdateLead({
                        ...leadObj,
                        assignedTutorId: val === 'unassigned' ? undefined : val
                      });
                    }
                  });
                  e.target.value = '';
                }}
                className="bg-slate-900 border-0 text-xs font-bold text-slate-200 focus:ring-0 rounded-lg py-1 px-1.5 cursor-pointer max-w-[150px]"
              >
                <option value="">Reassign To...</option>
                <option value="unassigned">None (Unassign)</option>
                {tutors.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            {/* Update Status */}
            <div className="flex items-center gap-1.5 bg-slate-850 p-1 rounded-xl border border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1 shrink-0">Stage:</span>
              <select
                onChange={(e) => {
                  const val = e.target.value;
                  if (!val) return;
                  selectedLeadIds.forEach(id => {
                    const leadObj = leads.find(l => l.id === id);
                    if (leadObj) {
                      onUpdateLead({
                        ...leadObj,
                        status: val as LeadStatus
                      });
                    }
                  });
                  e.target.value = '';
                }}
                className="bg-slate-900 border-0 text-xs font-bold text-slate-200 focus:ring-0 rounded-lg py-1 px-1.5 cursor-pointer max-w-[150px]"
              >
                <option value="">Set Pipeline Status...</option>
                <option value="New">New Inquiry</option>
                <option value="Contacted">Contacted</option>
                <option value="Trial Scheduled">Trial Scheduled</option>
                <option value="Application Review">Application Review</option>
                <option value="Offer Extended">Offer Extended</option>
                <option value="Active">Active Enrolled</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            {/* Delete Selection */}
            {onDeleteLead && (
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Are you sure you want to bulk-delete all ${selectedLeadIds.length} selected student leads? This cannot be undone.`)) {
                    selectedLeadIds.forEach(id => {
                      onDeleteLead(id);
                    });
                    setSelectedLeadIds([]);
                  }
                }}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl transition-all flex items-center gap-1 shadow-md shadow-rose-600/10 cursor-pointer"
              >
                <Trash className="w-3.5 h-3.5" />
                Delete
              </button>
            )}

            <button
              type="button"
              onClick={() => setSelectedLeadIds([])}
              className="text-slate-400 hover:text-white font-bold text-xs underline cursor-pointer"
            >
              Clear
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
