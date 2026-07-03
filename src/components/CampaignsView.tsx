import React, { useState } from 'react';
import { 
  Megaphone, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Percent, 
  Send, 
  Mail, 
  MessageSquare, 
  Sparkles, 
  CheckCircle, 
  AlertCircle,
  FileText
} from 'lucide-react';
import { Lead, Tutor, Interaction } from '../types';

interface CampaignsViewProps {
  leads: Lead[];
  tutors: Tutor[];
  onAddInteraction: (
    leadId: string, 
    type: Interaction['type'], 
    summary: string, 
    details: string, 
    staffName: string
  ) => void;
  onNavigateTab: (tab: string) => void;
}

// Hardcoded initial campaigns to represent Zoho's ROI marketing analyzer
const marketingCampaigns = [
  {
    id: 'camp-1',
    name: 'Summer Open House Ad',
    channel: 'Google Search Ads',
    budget: 450,
    leadsCount: 18,
    convertedCount: 6,
    mrrGenerated: 1080,
    status: 'Active',
    startDate: '2026-05-01'
  },
  {
    id: 'camp-2',
    name: 'Facebook Video Performance Drive',
    channel: 'Social Paid Ads',
    budget: 300,
    leadsCount: 14,
    convertedCount: 4,
    mrrGenerated: 720,
    status: 'Active',
    startDate: '2026-05-15'
  },
  {
    id: 'camp-3',
    name: 'Parent Referral Rewards Program',
    channel: 'Client Referral',
    budget: 150,
    leadsCount: 9,
    convertedCount: 5,
    mrrGenerated: 900,
    status: 'Ongoing',
    startDate: '2026-01-10'
  },
  {
    id: 'camp-4',
    name: 'Middle School Assembly Flyer',
    channel: 'Local Outreach',
    budget: 100,
    leadsCount: 6,
    convertedCount: 2,
    mrrGenerated: 320,
    status: 'Completed',
    startDate: '2026-04-01'
  }
];

// Templates for multi-channel communication logs
const communicationsTemplates = [
  {
    id: 'tpl-1',
    name: 'Inquiry Greeting & Scheduling',
    type: 'Email' as const,
    subject: 'Welcome to Music Academy! Let\'s schedule your trial lesson',
    body: 'Dear [Parent/Student Name],\n\nThank you for reaching out to us about [Instrument] lessons at Music Academy! We are excited to support you in your musical journey.\n\nWe have reviewed your level ([Level]) and preferred times: "[Schedule]". We would love to book a 30-minute introductory evaluation trial lesson with one of our specialized instructors.\n\nAre you available for a trial lesson this week?\n\nWarm regards,\nGanesh (Registrar)\nMusic Academy CRM Team'
  },
  {
    id: 'tpl-2',
    name: 'Trial Lesson Booking Confirmation',
    type: 'SMS' as const,
    subject: 'Trial Scheduled Notification',
    body: 'Hi [Student Name]! Your introductory evaluation trial lesson for [Instrument] is confirmed with tutor [Tutor Name]! Date: [Date] at [Time]. Please arrive 5 minutes early. See you soon!'
  },
  {
    id: 'tpl-3',
    name: 'Post-Trial Promotion Offer',
    type: 'Email' as const,
    subject: 'Enrollment Offer: Permanent Slot Placement',
    body: 'Dear [Parent/Student Name],\n\nCongratulations on completing your introductory evaluation trial lesson for [Instrument]! Your instructor shared excellent initial feedback about your musical aptitude.\n\nTo lock in your preferred weekly slot and initiate your standard course lessons, we have set up an enrollment contract under our standard recurring tuition rate.\n\nPlease log into your Student Portal to sign the confirmation. We look forward to seeing you excel!\n\nBest regards,\nGanesh\nRegistrar, Music Academy'
  },
  {
    id: 'tpl-4',
    name: 'Weekly Practice Reminder',
    type: 'SMS' as const,
    subject: 'Goal Reminder',
    body: 'Hi [Student Name]! Don\'t forget to practice [Instrument] this week! Your tutor set a focus area: "[Focus]". Try to log at least [Hours] hours before your next lesson. You got this!'
  }
];

export default function CampaignsView({ leads, tutors, onAddInteraction, onNavigateTab }: CampaignsViewProps) {
  // Communication States
  const [selectedLeadId, setSelectedLeadId] = useState<string>('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('tpl-1');
  const [customBody, setCustomBody] = useState<string>('');
  const [customSubject, setCustomSubject] = useState<string>('');
  const [outreachSuccess, setOutreachSuccess] = useState<boolean>(false);
  const [loggedDetails, setLoggedDetails] = useState<string>('');

  // Selected Lead & Template helper
  const currentLead = leads.find(l => l.id === selectedLeadId);
  const currentTemplate = communicationsTemplates.find(t => t.id === selectedTemplateId);

  // Initialize custom message on template selection or lead selection
  React.useEffect(() => {
    if (currentTemplate) {
      let body = currentTemplate.body;
      let subject = currentTemplate.subject;

      if (currentLead) {
        body = body
          .replace(/\[Parent\/Student Name\]/g, currentLead.name)
          .replace(/\[Student Name\]/g, currentLead.name)
          .replace(/\[Instrument\]/g, currentLead.instrument)
          .replace(/\[Level\]/g, currentLead.level)
          .replace(/\[Schedule\]/g, currentLead.preferredSchedule || 'flexible')
          .replace(/\[Focus\]/g, currentLead.notes ? currentLead.notes.substring(0, 30) + '...' : 'foundations')
          .replace(/\[Hours\]/g, currentLead.level === 'Advanced' ? '5' : '3');
        
        // Tutor replacement if assigned
        const tutor = tutors.find(t => t.id === currentLead.assignedTutorId);
        body = body.replace(/\[Tutor Name\]/g, tutor ? tutor.name : 'your tutor');
      }

      // Hardcoded date replacements for simulation
      body = body
        .replace(/\[Date\]/g, 'July 10, 2026')
        .replace(/\[Time\]/g, '4:00 PM');

      setCustomBody(body);
      setCustomSubject(subject);
    }
  }, [selectedLeadId, selectedTemplateId, currentLead, currentTemplate, tutors]);

  const handleSendOutreach = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLeadId || !customBody.trim()) return;

    const lead = leads.find(l => l.id === selectedLeadId);
    if (!lead) return;

    const interactionType = currentTemplate?.type || 'Email';
    const summary = `Outreach sent: ${currentTemplate?.name || 'Manual communication'}`;
    const details = `Subject: ${customSubject}\n\nMessage Body:\n${customBody}`;

    // Add interaction through props
    onAddInteraction(
      selectedLeadId,
      interactionType,
      summary,
      details,
      'Ganesh (Registrar)'
    );

    setLoggedDetails(`Log added to ${lead.name}'s CRM timeline successfully.`);
    setOutreachSuccess(true);
    setTimeout(() => {
      setOutreachSuccess(false);
    }, 4000);
  };

  // Stats Calculations
  const totalMarketingSpend = marketingCampaigns.reduce((sum, c) => sum + c.budget, 0);
  const totalLeadsGenerated = marketingCampaigns.reduce((sum, c) => sum + c.leadsCount, 0);
  const totalEnrollsGenerated = marketingCampaigns.reduce((sum, c) => sum + c.convertedCount, 0);
  const totalMrrGenerated = marketingCampaigns.reduce((sum, c) => sum + c.mrrGenerated, 0);
  const overallCampaignROI = Math.round(((totalMrrGenerated * 12) / totalMarketingSpend) * 100);

  return (
    <div className="space-y-8 p-1">
      
      {/* Top Welcome Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <Megaphone className="w-5 h-5 text-indigo-500" />
          Zoho Campaigns & Outreach Center
        </h2>
        <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
          Analyze lead acquisition source ROI, design customized automated campaigns, and log instant multi-channel communications.
        </p>
      </div>

      {/* Campaign ROI Analyzer Grid */}
      <div className="space-y-4">
        <h3 className="text-xs uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">
          Marketing Source & ROI Dashboard
        </h3>
        
        {/* Analytics Highlights */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl flex items-center gap-3 shadow-3xs">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block">Total Ad Budget</span>
              <span className="text-base font-extrabold text-slate-800 dark:text-white font-mono">${totalMarketingSpend}</span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl flex items-center gap-3 shadow-3xs">
            <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block">Inquiries Generated</span>
              <span className="text-base font-extrabold text-slate-800 dark:text-white font-mono">{totalLeadsGenerated} leads</span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl flex items-center gap-3 shadow-3xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Percent className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block">Enrollment Rate</span>
              <span className="text-base font-extrabold text-slate-800 dark:text-white font-mono">
                {Math.round((totalEnrollsGenerated / totalLeadsGenerated) * 100)}%
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl flex items-center gap-3 shadow-3xs">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block">Projected Annual ROI</span>
              <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">+{overallCampaignROI}%</span>
            </div>
          </div>
        </div>

        {/* Campaign ROI Table */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850/20 text-slate-400 dark:text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                  <th className="py-3 px-6">Campaign Name</th>
                  <th className="py-3 px-6">Channel / Medium</th>
                  <th className="py-3 px-6 text-center">Budget Spent</th>
                  <th className="py-3 px-6 text-center">Inquiries</th>
                  <th className="py-3 px-6 text-center">Enrolled</th>
                  <th className="py-3 px-6 text-center">MRR Generated</th>
                  <th className="py-3 px-6 text-right">LTV ROI Ratio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40 text-xs font-semibold">
                {marketingCampaigns.map((camp) => {
                  const roiPercent = Math.round(((camp.mrrGenerated * 12) / camp.budget) * 100);
                  return (
                    <tr key={camp.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="py-3.5 px-6 font-bold text-slate-800 dark:text-slate-200">{camp.name}</td>
                      <td className="py-3.5 px-6 font-medium text-slate-500 dark:text-slate-400">{camp.channel}</td>
                      <td className="py-3.5 px-6 text-center text-slate-700 dark:text-slate-300 font-mono">${camp.budget}</td>
                      <td className="py-3.5 px-6 text-center text-indigo-600 dark:text-indigo-400 font-mono">{camp.leadsCount}</td>
                      <td className="py-3.5 px-6 text-center text-emerald-600 dark:text-emerald-400 font-mono">{camp.convertedCount}</td>
                      <td className="py-3.5 px-6 text-center text-slate-700 dark:text-slate-300 font-mono">${camp.mrrGenerated}/mo</td>
                      <td className="py-3.5 px-6 text-right">
                        <span className="px-2 py-0.5 text-[10px] bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 rounded-md font-mono">
                          +{roiPercent}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Campaign Outreach & Template Hub */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Outreach Composer - Col Span 7 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl lg:col-span-7 space-y-5 shadow-xs">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800/60">
            <Sparkles className="w-4 h-4 text-indigo-500 animate-pulse" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">Multi-Channel Template Composer</h3>
          </div>

          <form onSubmit={handleSendOutreach} className="space-y-4">
            
            {/* Step 1: Target Lead Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">1. Target Recipient (Lead)</label>
                <select
                  value={selectedLeadId}
                  onChange={(e) => setSelectedLeadId(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs rounded-xl p-2.5 font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:border-indigo-500"
                  required
                >
                  <option value="">-- Choose a contact --</option>
                  {leads.map(lead => (
                    <option key={lead.id} value={lead.id}>
                      {lead.name} ({lead.instrument} • {lead.status})
                    </option>
                  ))}
                </select>
              </div>

              {/* Step 2: Template Selector */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">2. Message Template Preset</label>
                <select
                  value={selectedTemplateId}
                  onChange={(e) => setSelectedTemplateId(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs rounded-xl p-2.5 font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:border-indigo-500"
                >
                  {communicationsTemplates.map(tpl => (
                    <option key={tpl.id} value={tpl.id}>
                      {tpl.name} ({tpl.type})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Subject (Only for Email) */}
            {currentTemplate?.type === 'Email' && (
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Email Subject</label>
                <input
                  type="text"
                  value={customSubject}
                  onChange={(e) => setCustomSubject(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs rounded-xl p-2.5 font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
            )}

            {/* Custom Body Editor */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">
                Customized Message Body ({currentTemplate?.type || 'Email'})
              </label>
              <textarea
                rows={10}
                value={customBody}
                onChange={(e) => setCustomBody(e.target.value)}
                placeholder="Select a student to load details..."
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs rounded-xl p-3 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 font-mono leading-normal"
                required
              />
            </div>

            {/* Status Feedback */}
            {outreachSuccess && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[11px] rounded-xl flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <div>
                  <span className="font-bold">Outreach Simulated & Logged! </span>
                  <span>{loggedDetails}</span>
                </div>
              </div>
            )}

            {!selectedLeadId && (
              <div className="p-2.5 bg-amber-50 dark:bg-slate-900 border border-amber-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-[10px] rounded-lg flex items-center gap-1.5 font-medium">
                <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                Select a target student above to automatically load custom variables into placeholders.
              </div>
            )}

            {/* Action Send Button */}
            <div className="flex justify-between items-center pt-2">
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                {currentTemplate?.type === 'Email' ? (
                  <>
                    <Mail className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Sends official HTML email</span>
                  </>
                ) : (
                  <>
                    <MessageSquare className="w-3.5 h-3.5 text-amber-500" />
                    <span>Sends instant SMS dispatch</span>
                  </>
                )}
              </div>
              <button
                type="submit"
                disabled={!selectedLeadId}
                className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-md shadow-indigo-600/10 flex items-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                Send & Log in CRM Pipeline
              </button>
            </div>

          </form>
        </div>

        {/* Campaign Triggers & Automated Rules - Col Span 5 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl lg:col-span-5 flex flex-col justify-between shadow-xs">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-800/60 mb-4">
              Zoho Marketing Automations
            </h3>

            <div className="space-y-4">
              <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium leading-relaxed">
                Rules executing in background based on pipeline transitions and scheduling triggers:
              </p>

              {/* Automation rule 1 */}
              <div className="p-3 bg-slate-50 dark:bg-slate-850/40 border border-slate-100 dark:border-slate-800 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200 font-mono">RULE_01: NEW_INQUIRY_DRIP</span>
                  <span className="px-1.5 py-0.2 rounded bg-indigo-50 dark:bg-indigo-950 text-[8px] font-bold text-indigo-600 dark:text-indigo-400">EMAIL</span>
                </div>
                <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">Trigger: Lead joins "New" stage</p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-normal">
                  Automatically delivers welcome package with course prospectus within 15 minutes of registration.
                </p>
              </div>

              {/* Automation rule 2 */}
              <div className="p-3 bg-slate-50 dark:bg-slate-850/40 border border-slate-100 dark:border-slate-800 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200 font-mono">RULE_02: SMS_REMINDER_24H</span>
                  <span className="px-1.5 py-0.2 rounded bg-amber-50 dark:bg-amber-950 text-[8px] font-bold text-amber-600 dark:text-amber-400 font-mono">SMS</span>
                </div>
                <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400">Trigger: 24h before trial lesson starts</p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-normal">
                  Dispatches location details, parking directions, and safety guidelines to parents automatically.
                </p>
              </div>

              {/* Automation rule 3 */}
              <div className="p-3 bg-slate-50 dark:bg-slate-850/40 border border-slate-100 dark:border-slate-800 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200 font-mono">RULE_03: TRIAL_COMPL_OFFER</span>
                  <span className="px-1.5 py-0.2 rounded bg-indigo-50 dark:bg-indigo-950 text-[8px] font-bold text-indigo-600 dark:text-indigo-400">EMAIL</span>
                </div>
                <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">Trigger: Trial marked "Completed"</p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-normal">
                  Dispatches tailored enrollment contract link with designated tutor weekly slots to seal registration.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/60 text-center">
            <button 
              type="button"
              onClick={() => onNavigateTab('leads')}
              className="text-[11px] font-extrabold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center justify-center gap-1 mx-auto"
            >
              <FileText className="w-3.5 h-3.5" />
              Manage Student Inquiries Pipeline
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
