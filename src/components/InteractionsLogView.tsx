import React, { useState } from 'react';
import { 
  Phone, 
  Mail, 
  MessageSquare, 
  Guitar, 
  FileText, 
  Search, 
  Filter, 
  User, 
  Clock, 
  CornerDownRight,
  Sparkles
} from 'lucide-react';
import { Interaction, Lead } from '../types';

interface InteractionsLogViewProps {
  interactions: Interaction[];
  leads: Lead[];
  onSelectLead: (leadId: string) => void;
}

export default function InteractionsLogView({ 
  interactions, 
  leads, 
  onSelectLead 
}: InteractionsLogViewProps) {
  const [localSearch, setLocalSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('All');

  const getInteractionIcon = (type: string) => {
    switch (type) {
      case 'Call': return <Phone className="w-4 h-4 text-emerald-500" />;
      case 'Email': return <Mail className="w-4 h-4 text-indigo-500" />;
      case 'SMS': return <MessageSquare className="w-4 h-4 text-amber-500" />;
      case 'Trial Lesson': return <Guitar className="w-4 h-4 text-rose-500" />;
      default: return <FileText className="w-4 h-4 text-slate-500" />;
    }
  };

  const getInteractionColor = (type: string) => {
    switch (type) {
      case 'Call': return 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-100/40 dark:border-emerald-900/10';
      case 'Email': return 'bg-indigo-50 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-400 border-indigo-100/40 dark:border-indigo-900/10';
      case 'SMS': return 'bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400 border-amber-100/40 dark:border-amber-900/10';
      case 'Trial Lesson': return 'bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-400 border-rose-100/40 dark:border-rose-900/10';
      default: return 'bg-slate-50 text-slate-800 dark:bg-slate-800 dark:text-slate-400 border-slate-200/40';
    }
  };

  const filteredInteractions = interactions
    .filter(int => {
      const lead = leads.find(l => l.id === int.leadId);
      const leadName = lead ? lead.name.toLowerCase() : '';
      
      const query = localSearch.toLowerCase();
      const matchesSearch = 
        int.summary.toLowerCase().includes(query) ||
        int.details.toLowerCase().includes(query) ||
        int.staffName.toLowerCase().includes(query) ||
        leadName.includes(query);

      const matchesType = typeFilter === 'All' || int.type === typeFilter;

      return matchesSearch && matchesType;
    })
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="space-y-6">
      
      {/* Title Header */}
      <div>
        <h3 className="text-base font-bold text-slate-800 dark:text-white">Academy Customer Touchpoints</h3>
        <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
          Review, analyze, and query student intake consultations, calls, and email log history
        </p>
      </div>

      {/* Toolbar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 p-4 rounded-2xl shadow-xs flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search communication summaries, detailed notes, or staff name..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-xs rounded-xl text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase shrink-0">Channel:</span>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs rounded-xl p-2 font-semibold text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="All">All Channels</option>
            <option value="Call">Phone Calls</option>
            <option value="Email">Emails</option>
            <option value="SMS">Texts (SMS)</option>
            <option value="In-Person">In-Person Meetings</option>
            <option value="Trial Lesson">Trial Lessons</option>
          </select>
        </div>
      </div>

      {/* Chronological Unified Timeline */}
      <div className="relative border-l-2 border-slate-150 dark:border-slate-800 ml-4 pl-6 space-y-6">
        {filteredInteractions.length === 0 ? (
          <div className="relative -left-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-12 px-6 text-center shadow-xs">
            <p className="text-xs text-slate-400">No matching academy logs found.</p>
          </div>
        ) : (
          filteredInteractions.map((int) => {
            const associatedLead = leads.find(l => l.id === int.leadId);
            return (
              <div 
                key={int.id} 
                className="relative bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-150"
              >
                {/* Timeline bullet icon matching the communication style */}
                <span className="absolute -left-[33px] top-6 w-3.5 h-3.5 rounded-full bg-white dark:bg-slate-900 border-2 border-indigo-500 shadow-xs flex items-center justify-center">
                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                </span>

                <div className="space-y-3">
                  {/* Top line with metadata */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-50 dark:border-slate-800/40 pb-2.5">
                    {/* Student target */}
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-xs font-bold text-slate-400 dark:text-slate-500">Contact:</span>
                      {associatedLead ? (
                        <button
                          onClick={() => onSelectLead(associatedLead.id)}
                          className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                        >
                          {associatedLead.name}
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Unknown Contact</span>
                      )}
                    </div>

                    {/* Date and type */}
                    <div className="flex items-center gap-2.5 font-mono text-[10px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {int.date}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full font-bold border ${getInteractionColor(int.type)}`}>
                        {int.type}
                      </span>
                    </div>
                  </div>

                  {/* Summary & description text */}
                  <div className="space-y-1.5">
                    <div className="flex items-start gap-2">
                      <div className="p-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800/60 rounded-lg shrink-0 mt-0.5">
                        {getInteractionIcon(int.type)}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-snug">
                          {int.summary}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-1 text-justify">
                          {int.details}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Staff details */}
                  <div className="flex items-center gap-1.5 pl-8 text-[10px] font-mono font-semibold text-slate-400 dark:text-slate-500">
                    <CornerDownRight className="w-3 h-3" />
                    <span>Logged by Staff: {int.staffName}</span>
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
