import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardView from './components/DashboardView';
import LeadsView from './components/LeadsView';
import ScheduleView from './components/ScheduleView';
import InteractionsLogView from './components/InteractionsLogView';
import LeadDrawer from './components/LeadDrawer';
import CampaignsView from './components/CampaignsView';
import CoursesView from './components/CoursesView';
import StudentPortalView from './components/StudentPortalView';
import StudentPerformanceTrackerView from './components/StudentPerformanceTrackerView';
import TutorAnalyticsView from './components/TutorAnalyticsView';

import { Lead, Tutor, Interaction, LessonEvent, LeadStatus, WeeklyPerformance, Invoice } from './types';
import { mockLeads, mockTutors, mockInteractions, mockLessons, mockPerformances, mockInvoices } from './data/mockData';
import { db } from './firebase';
import { collection, getDocs, setDoc, deleteDoc, doc } from 'firebase/firestore';

export default function App() {
  // Theme State
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  // CRM Data States (with LocalStorage and Firestore fallbacks)
  const [leads, setLeads] = useState<Lead[]>(() => {
    const saved = localStorage.getItem('crm_leads');
    return saved ? JSON.parse(saved) : mockLeads;
  });

  const [interactions, setInteractions] = useState<Interaction[]>(() => {
    const saved = localStorage.getItem('crm_interactions');
    return saved ? JSON.parse(saved) : mockInteractions;
  });

  const [lessons, setLessons] = useState<LessonEvent[]>(() => {
    const saved = localStorage.getItem('crm_lessons');
    return saved ? JSON.parse(saved) : mockLessons;
  });

  const [performances, setPerformances] = useState<WeeklyPerformance[]>(() => {
    const saved = localStorage.getItem('crm_performances');
    return saved ? JSON.parse(saved) : mockPerformances;
  });

  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem('crm_invoices');
    return saved ? JSON.parse(saved) : mockInvoices;
  });

  const [tutors] = useState<Tutor[]>(mockTutors);
  const [firebaseLoading, setFirebaseLoading] = useState<boolean>(true);

  // Firestore Sync Effect
  useEffect(() => {
    async function syncFirestore() {
      try {
        const leadsCol = collection(db, "leads");
        const leadsSnapshot = await getDocs(leadsCol);
        
        let loadedLeads: Lead[] = [];
        let loadedInteractions: Interaction[] = [];
        let loadedLessons: LessonEvent[] = [];
        let loadedPerformances: WeeklyPerformance[] = [];
        let loadedInvoices: Invoice[] = [];

        if (leadsSnapshot.empty) {
          console.log("Firestore is empty. Seeding initial data...");
          
          // Seed Leads
          for (const lead of mockLeads) {
            await setDoc(doc(db, "leads", lead.id), lead);
            loadedLeads.push(lead);
          }
          
          // Seed Interactions
          for (const int of mockInteractions) {
            await setDoc(doc(db, "interactions", int.id), int);
            loadedInteractions.push(int);
          }
          
          // Seed Lessons
          for (const les of mockLessons) {
            await setDoc(doc(db, "lessons", les.id), les);
            loadedLessons.push(les);
          }

          // Seed Performances
          for (const perf of mockPerformances) {
            await setDoc(doc(db, "performances", perf.id), perf);
            loadedPerformances.push(perf);
          }

          // Seed Invoices
          for (const inv of mockInvoices) {
            await setDoc(doc(db, "invoices", inv.id), inv);
            loadedInvoices.push(inv);
          }
        } else {
          console.log("Firestore has existing records. Loading data...");
          loadedLeads = leadsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Lead));
          
          const intsSnapshot = await getDocs(collection(db, "interactions"));
          loadedInteractions = intsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Interaction));
          
          const lessonsSnapshot = await getDocs(collection(db, "lessons"));
          loadedLessons = lessonsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LessonEvent));

          try {
            const perfSnapshot = await getDocs(collection(db, "performances"));
            loadedPerformances = perfSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WeeklyPerformance));
          } catch (e) {
            console.warn("Could not load performances from Firestore:", e);
            loadedPerformances = mockPerformances;
          }

          try {
            const invSnapshot = await getDocs(collection(db, "invoices"));
            loadedInvoices = invSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Invoice));
          } catch (e) {
            console.warn("Could not load invoices from Firestore:", e);
            loadedInvoices = mockInvoices;
          }
        }

        setLeads(loadedLeads);
        setInteractions(loadedInteractions);
        setLessons(loadedLessons);
        setPerformances(loadedPerformances);
        setInvoices(loadedInvoices);
      } catch (err) {
        console.warn("Firebase sync offline or rejected, continuing with local cache:", err);
      } finally {
        setFirebaseLoading(false);
      }
    }
    syncFirestore();
  }, []);


  // Layout / Navigation States
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  // Notifications State
  const [notifications, setNotifications] = useState<Array<{ id: string; text: string; time: string; read: boolean }>>(() => {
    const initialNotifs = [
      { id: 'notif-1', text: 'New Lead Elena Rostova registered online for Vocal lessons', time: '10:15 AM', read: false },
      { id: 'notif-2', text: 'Amara Diop completed Suzuki Book 3 Violin Evaluation lesson', time: 'Yesterday', read: true },
      { id: 'notif-3', text: 'Tutor Sarah Jenkins availability changed for Wednesdays afternoons', time: '2 days ago', read: true }
    ];
    const saved = localStorage.getItem('crm_notifications');
    return saved ? JSON.parse(saved) : initialNotifs;
  });

  // Apply Theme effects
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Sync state to LocalStorage
  useEffect(() => {
    localStorage.setItem('crm_leads', JSON.stringify(leads));
  }, [leads]);

  useEffect(() => {
    localStorage.setItem('crm_interactions', JSON.stringify(interactions));
  }, [interactions]);

  useEffect(() => {
    localStorage.setItem('crm_lessons', JSON.stringify(lessons));
  }, [lessons]);

  useEffect(() => {
    localStorage.setItem('crm_performances', JSON.stringify(performances));
  }, [performances]);

  useEffect(() => {
    localStorage.setItem('crm_invoices', JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem('crm_notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Sync search queries directly into active view filters
  const handleSelectLeadFromGlobal = (leadId: string) => {
    setSelectedLeadId(leadId);
    setCurrentTab('leads');
  };

  // Helper: Trigger standard system notification
  const addSystemNotification = (text: string) => {
    const newNotif = {
      id: `notif-${Date.now()}`,
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const markNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // LEAD ACTIONS
  const handleAddLead = async (newLeadData: Omit<Lead, 'id' | 'createdAt'>) => {
    const newLead: Lead = {
      ...newLeadData,
      id: `lead-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };

    setLeads(prev => [newLead, ...prev]);
    addSystemNotification(`Registered Lead: "${newLead.name}" joined the ${newLead.instrument} pipeline.`);
    
    // Log initial intake interaction
    const initInt: Interaction = {
      id: `int-${Date.now()}`,
      leadId: newLead.id,
      date: newLead.createdAt,
      type: 'In-Person',
      summary: 'Student Registration Intake',
      details: newLead.notes || `Initial registration submitted. Instrument: ${newLead.instrument} (${newLead.level}). Preferred Schedule: ${newLead.preferredSchedule}.`,
      staffName: 'Ganesh (Registrar)',
    };
    setInteractions(prev => [initInt, ...prev]);

    // Firestore Sync
    try {
      await setDoc(doc(db, "leads", newLead.id), newLead);
      await setDoc(doc(db, "interactions", initInt.id), initInt);
    } catch (err) {
      console.warn("Firestore add lead error:", err);
    }
  };

  const handleUpdateLead = async (updatedLead: Lead) => {
    setLeads(prev => prev.map(l => l.id === updatedLead.id ? updatedLead : l));
    
    // Firestore Sync
    try {
      await setDoc(doc(db, "leads", updatedLead.id), updatedLead);
    } catch (err) {
      console.warn("Firestore update lead error:", err);
    }
  };

  const handleDeleteLead = async (leadId: string) => {
    setLeads(prev => prev.filter(l => l.id !== leadId));
    setInteractions(prev => prev.filter(i => i.leadId !== leadId));
    setLessons(prev => prev.filter(les => les.leadId !== leadId));
    setPerformances(prev => prev.filter(p => p.leadId !== leadId));
    addSystemNotification(`Deleted Lead record and all related session histories.`);

    // Firestore Sync
    try {
      await deleteDoc(doc(db, "leads", leadId));
    } catch (err) {
      console.warn("Firestore delete lead error:", err);
    }
  };

  // PERFORMANCE ACTIONS
  const handleAddPerformanceRecord = async (newPerfData: Omit<WeeklyPerformance, 'id' | 'createdAt'>) => {
    const newPerf: WeeklyPerformance = {
      ...newPerfData,
      id: `perf-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    setPerformances(prev => [newPerf, ...prev]);
    
    // Auto-create an interaction log on the student's timeline
    const correspondingLead = leads.find(l => l.id === newPerf.leadId);
    const summary = `Performance Traced: ${newPerf.overallScore}/100`;
    const details = `Tutor evaluated week starting ${newPerf.weekStartDate}. Focus: "${newPerf.weeklyFocus}". Technical: ${newPerf.technicalScore}/10, Rhythm: ${newPerf.rhythmScore}/10, Expression: ${newPerf.expressionScore}/10, Practice commitment: ${newPerf.practiceHours} hours. Notes: "${newPerf.teacherComments}"`;
    
    const perfInt: Interaction = {
      id: `int-perf-${Date.now()}`,
      leadId: newPerf.leadId,
      date: new Date().toISOString().split('T')[0],
      type: 'Trial Lesson',
      summary,
      details,
      staffName: newPerf.loggedBy,
    };
    
    setInteractions(prev => [perfInt, ...prev]);
    addSystemNotification(`Logged Performance Rating of ${newPerf.overallScore}/100 for student: ${correspondingLead?.name || 'Student'}`);

    // Firestore Sync
    try {
      await setDoc(doc(db, "performances", newPerf.id), newPerf);
      await setDoc(doc(db, "interactions", perfInt.id), perfInt);
    } catch (err) {
      console.warn("Firestore add performance error:", err);
    }
  };

  const handleDeletePerformanceRecord = async (id: string) => {
    setPerformances(prev => prev.filter(p => p.id !== id));
    
    // Firestore Sync
    try {
      await deleteDoc(doc(db, "performances", id));
    } catch (err) {
      console.warn("Firestore delete performance error:", err);
    }
  };

  // INTERACTION ACTIONS
  const handleAddInteraction = async (
    leadId: string, 
    type: Interaction['type'], 
    summary: string, 
    details: string, 
    staffName: string
  ) => {
    const newInt: Interaction = {
      id: `int-${Date.now()}`,
      leadId,
      date: new Date().toISOString().split('T')[0],
      type,
      summary,
      details,
      staffName,
    };

    setInteractions(prev => [newInt, ...prev]);

    // Update corresponding lead status if they did a trial lesson
    if (type === 'Trial Lesson') {
      const correspondingLead = leads.find(l => l.id === leadId);
      if (correspondingLead) {
        await handleUpdateLead({
          ...correspondingLead,
          status: 'Trial Scheduled'
        });
      }
    }

    addSystemNotification(`Logged ${type} with student: ${leads.find(l => l.id === leadId)?.name || 'Lead'}`);

    // Firestore Sync
    try {
      await setDoc(doc(db, "interactions", newInt.id), newInt);
    } catch (err) {
      console.warn("Firestore add interaction error:", err);
    }
  };

  // LESSON ACTIONS
  const handleScheduleLesson = async (lessonData: Omit<LessonEvent, 'id'>) => {
    const newLesson: LessonEvent = {
      ...lessonData,
      id: `les-${Date.now()}`,
    };

    setLessons(prev => [newLesson, ...prev]);
    addSystemNotification(`Scheduled ${newLesson.type} for ${newLesson.leadName} with ${newLesson.tutorName}.`);

    // Log the schedule action in student's timeline
    const schedInt: Interaction = {
      id: `int-sched-${Date.now()}`,
      leadId: newLesson.leadId,
      date: new Date().toISOString().split('T')[0],
      type: newLesson.type === 'Trial' ? 'Trial Lesson' : 'Call',
      summary: `${newLesson.type} Booked`,
      details: `Scheduled lesson on ${newLesson.date} at ${newLesson.time} with Tutor ${newLesson.tutorName} (${newLesson.durationMinutes} minutes).`,
      staffName: 'Ganesh (Registrar)',
    };
    setInteractions(prev => [schedInt, ...prev]);

    // Firestore Sync
    try {
      await setDoc(doc(db, "lessons", newLesson.id), newLesson);
      await setDoc(doc(db, "interactions", schedInt.id), schedInt);
    } catch (err) {
      console.warn("Firestore schedule lesson error:", err);
    }
  };

  const handleUpdateLessonStatus = async (lessonId: string, status: LessonEvent['status']) => {
    setLessons(prev => prev.map(l => {
      if (l.id !== lessonId) return l;

      const updatedLesson = { ...l, status };

      // Firestore Sync
      setDoc(doc(db, "lessons", lessonId), updatedLesson).catch(e => console.warn(e));

      // Automated pipeline triggers
      if (status === 'Completed') {
        const correspondingLead = leads.find(lead => lead.id === l.leadId);
        
        if (correspondingLead) {
          // Automatic student promotion trigger (Trial Completed -> Active Student)
          if (l.type === 'Trial' && correspondingLead.status !== 'Active') {
            const promotedLead: Lead = {
              ...correspondingLead,
              status: 'Active',
              assignedTutorId: l.tutorId,
            };
            
            // Trigger promotion
            setTimeout(async () => {
              await handleUpdateLead(promotedLead);
              addSystemNotification(`Enrollment Upgrade: ${promotedLead.name} promoted to "Active Student" status!`);
              
              // Log the promotion event on timeline
              const promoteInt: Interaction = {
                id: `int-prom-${Date.now()}`,
                leadId: promotedLead.id,
                date: new Date().toISOString().split('T')[0],
                type: 'Trial Lesson',
                summary: 'Trial Completed & Active Contract Signed',
                details: `Evaluation trial with instructor ${l.tutorName} marked COMPLETED. Student matching verified, contract signed, and recurring monthly tuition initiated.`,
                staffName: 'Ganesh (Registrar)',
              };
              setInteractions(timeline => [promoteInt, ...timeline]);
              
              // Firestore Sync
              try {
                await setDoc(doc(db, "interactions", promoteInt.id), promoteInt);
              } catch (e) {
                console.warn(e);
              }
            }, 300);
          }
        }
      }

      return updatedLesson;
    }));

    addSystemNotification(`Lesson record marked as ${status}.`);
  };

  const handleUpdateLessonAttendance = async (lessonId: string, attendance: LessonEvent['attendance']) => {
    setLessons(prev => prev.map(l => {
      if (l.id !== lessonId) return l;

      const updatedLesson: LessonEvent = { ...l, attendance, status: 'Completed' as const };

      // Firestore Sync
      setDoc(doc(db, "lessons", lessonId), updatedLesson).catch(e => console.warn(e));

      // Automated pipeline triggers
      if (attendance === 'Present') {
        const correspondingLead = leads.find(lead => lead.id === l.leadId);
        if (correspondingLead && l.type === 'Trial' && correspondingLead.status !== 'Active') {
          const promotedLead: Lead = {
            ...correspondingLead,
            status: 'Active',
            assignedTutorId: l.tutorId,
          };
          
          setTimeout(async () => {
            await handleUpdateLead(promotedLead);
            addSystemNotification(`Enrollment Upgrade: ${promotedLead.name} promoted to "Active Student" status!`);
            
            const promoteInt: Interaction = {
              id: `int-prom-${Date.now()}`,
              leadId: promotedLead.id,
              date: new Date().toISOString().split('T')[0],
              type: 'Trial Lesson',
              summary: 'Trial Completed & Active Contract Signed',
              details: `Evaluation trial with instructor ${l.tutorName} marked PRESENT. Student matching verified, contract signed, and recurring monthly tuition initiated.`,
              staffName: 'Ganesh (Registrar)',
            };
            setInteractions(timeline => [promoteInt, ...timeline]);
            
            try {
              await setDoc(doc(db, "interactions", promoteInt.id), promoteInt);
            } catch (e) {
              console.warn(e);
            }
          }, 300);
        }
      }

      return updatedLesson;
    }));

    addSystemNotification(`Attendance marked as ${attendance} for student.`);
  };

  // INVOICE ACTIONS
  const handlePayInvoice = async (invoiceId: string, status: 'Paid' | 'Failed', attempts: number) => {
    setInvoices(prev => prev.map(inv => {
      if (inv.id !== invoiceId) return inv;
      return {
        ...inv,
        status,
        paymentAttempts: attempts,
        paidAt: status === 'Paid' ? new Date().toISOString() : undefined,
        receiptNumber: status === 'Paid' ? `REC-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}` : undefined
      };
    }));

    const invoice = invoices.find(inv => inv.id === invoiceId);
    if (invoice) {
      const updatedInvoice: Invoice = {
        ...invoice,
        status,
        paymentAttempts: attempts,
        paidAt: status === 'Paid' ? new Date().toISOString() : undefined,
        receiptNumber: status === 'Paid' ? `REC-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}` : undefined
      };

      try {
        await setDoc(doc(db, "invoices", invoiceId), updatedInvoice);
      } catch (e) {
        console.warn("Could not save invoice status to Firestore:", e);
      }

      handleAddInteraction(
        invoice.leadId,
        'SMS',
        `Invoice ${status === 'Paid' ? 'Paid' : 'Payment Failed'}`,
        `Payment attempt for invoice ${invoice.id} ($${invoice.amount}) was ${status.toLowerCase()}. Attempt count: ${attempts}.`,
        'Payment Gateway (System)'
      );

      if (status === 'Paid') {
        addSystemNotification(`Invoice ${invoiceId} was successfully paid by ${invoice.leadName}.`);
      } else {
        addSystemNotification(`Invoice ${invoiceId} payment failed for ${invoice.leadName}.`);
      }
    }
  };

  const handleUpdateInvoice = async (updatedInvoice: Invoice) => {
    setInvoices(prev => prev.map(inv => inv.id === updatedInvoice.id ? updatedInvoice : inv));
    try {
      await setDoc(doc(db, "invoices", updatedInvoice.id), updatedInvoice);
    } catch (e) {
      console.warn("Could not update invoice in Firestore:", e);
    }
  };

  const handleCreateInvoice = async (invoiceData: Omit<Invoice, 'id'>) => {
    const newInvoice: Invoice = {
      ...invoiceData,
      id: `inv-${Date.now()}`
    };
    setInvoices(prev => [newInvoice, ...prev]);
    try {
      await setDoc(doc(db, "invoices", newInvoice.id), newInvoice);
    } catch (e) {
      console.warn("Could not create invoice in Firestore:", e);
    }
    handleAddInteraction(
      newInvoice.leadId,
      'SMS',
      `Invoice Generated`,
      `New tuition invoice ${newInvoice.id} generated for $${newInvoice.amount}. Due date: ${newInvoice.dueDate}.`,
      'Ganesh (Registrar)'
    );
  };

  const getActiveView = () => {
    switch (currentTab) {
      case 'dashboard':
        return (
          <DashboardView 
            leads={leads}
            tutors={tutors}
            interactions={interactions}
            lessons={lessons}
            onSelectLead={handleSelectLeadFromGlobal}
            onNavigateTab={setCurrentTab}
            onAddInteraction={handleAddInteraction}
            invoices={invoices}
            onPayInvoice={handlePayInvoice}
            onUpdateInvoice={handleUpdateInvoice}
            onCreateInvoice={handleCreateInvoice}
          />
        );
      case 'leads':
        return (
          <LeadsView 
            leads={leads}
            tutors={tutors}
            selectedLeadId={selectedLeadId}
            onSelectLead={setSelectedLeadId}
            onAddLead={handleAddLead}
            onUpdateLead={handleUpdateLead}
            onDeleteLead={handleDeleteLead}
          />
        );
      case 'campaigns':
        return (
          <CampaignsView 
            leads={leads}
            tutors={tutors}
            onAddInteraction={handleAddInteraction}
            onNavigateTab={setCurrentTab}
          />
        );
      case 'courses':
        return (
          <CoursesView 
            leads={leads}
            tutors={tutors}
            onAddInteraction={handleAddInteraction}
            onUpdateLead={handleUpdateLead}
          />
        );
      case 'interactions':
        return (
          <InteractionsLogView 
            interactions={interactions}
            leads={leads}
            onSelectLead={handleSelectLeadFromGlobal}
          />
        );
      case 'schedule':
        return (
          <ScheduleView 
            lessons={lessons}
            leads={leads}
            tutors={tutors}
            onAddLesson={handleScheduleLesson}
            onUpdateLessonStatus={handleUpdateLessonStatus}
            onUpdateLessonAttendance={handleUpdateLessonAttendance}
            onSelectLead={handleSelectLeadFromGlobal}
          />
        );
      case 'performance':
        return (
          <StudentPerformanceTrackerView 
            leads={leads}
            tutors={tutors}
            performances={performances}
            onAddPerformanceRecord={handleAddPerformanceRecord}
            onDeletePerformanceRecord={handleDeletePerformanceRecord}
            onSelectLead={handleSelectLeadFromGlobal}
          />
        );
      case 'tutor-analytics':
        return (
          <TutorAnalyticsView 
            leads={leads}
            tutors={tutors}
            lessons={lessons}
            performances={performances}
            onSelectLead={handleSelectLeadFromGlobal}
          />
        );
      case 'portal':
        return (
          <StudentPortalView 
            leads={leads}
            tutors={tutors}
            interactions={interactions}
            performances={performances}
            lessons={lessons}
            onAddInteraction={handleAddInteraction}
            invoices={invoices}
            onPayInvoice={handlePayInvoice}
          />
        );
      default:
        return (
          <DashboardView 
            leads={leads}
            tutors={tutors}
            interactions={interactions}
            lessons={lessons}
            onSelectLead={handleSelectLeadFromGlobal}
            onNavigateTab={setCurrentTab}
            onAddInteraction={handleAddInteraction}
            invoices={invoices}
            onPayInvoice={handlePayInvoice}
            onUpdateInvoice={handleUpdateInvoice}
            onCreateInvoice={handleCreateInvoice}
          />
        );
    }
  };

  // Find the currently selected lead for the detail drawer
  const activeSelectedLead = leads.find(l => l.id === selectedLeadId);

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans flex text-slate-800 dark:text-slate-100 transition-colors duration-200">
        
        {/* Sidebar Component */}
        <Sidebar 
          currentTab={currentTab} 
          setCurrentTab={(tab) => {
            setCurrentTab(tab);
            setIsSidebarOpen(false);
          }} 
          tutors={tutors}
          isOpen={isSidebarOpen}
          setIsOpen={setIsSidebarOpen}
        />

        {/* Mobile Sidebar Backdrop Overlay */}
        {isSidebarOpen && (
          <div 
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-slate-950/40 dark:bg-black/60 backdrop-blur-xs z-30 md:hidden transition-opacity duration-200"
          />
        )}

        {/* Main Content Area Wrapper */}
        <div className="flex-1 pl-0 md:pl-64 flex flex-col min-h-screen">
          
          {/* Top Header Component */}
          <Header 
            currentTab={currentTab}
            isDarkMode={isDarkMode}
            setIsDarkMode={setIsDarkMode}
            searchQuery={searchQuery}
            setSearchQuery={(query) => {
              setSearchQuery(query);
              if (currentTab !== 'leads') setCurrentTab('leads');
            }}
            notifications={notifications}
            markNotificationsAsRead={markNotificationsAsRead}
            toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          />

          {/* Central stage body */}
          <main className="flex-1 p-4 md:p-8 overflow-y-auto bg-slate-50 dark:bg-slate-950 transition-colors duration-200 max-w-7xl mx-auto w-full">
            {getActiveView()}
          </main>
        </div>

        {/* Floating Student Drawer Detail Overlay */}
        {activeSelectedLead && (
          <>
            {/* Backdrop */}
            <div 
              onClick={() => setSelectedLeadId(null)}
              className="fixed inset-0 bg-slate-950/40 dark:bg-black/60 backdrop-blur-xs z-30 transition-opacity duration-200"
            />
            
            <LeadDrawer 
              lead={activeSelectedLead}
              tutors={tutors}
              interactions={interactions}
              performances={performances}
              onClose={() => setSelectedLeadId(null)}
              onUpdateLead={handleUpdateLead}
              onAddInteraction={handleAddInteraction}
              onAddLesson={handleScheduleLesson}
              onDeleteLead={handleDeleteLead}
              onAddPerformanceRecord={handleAddPerformanceRecord}
              onDeletePerformanceRecord={handleDeletePerformanceRecord}
            />
          </>
        )}

      </div>
    </div>
  );
}
