# 🎹 Music Academy CRM — Premium Architecture & Feature Blueprint

This blueprint documents the complete premium feature suite, interactive modules, and architectural layouts integrated into the **Music Academy CRM**. Use this document as a master reference, operational blueprint, or design specification when building or extending other customer relationship management (CRM) systems.

---

## 🏛️ System Core & Architecture

The Music Academy CRM is a modern, responsive, full-stack application built with **React**, **TypeScript**, and **Tailwind CSS**, backed by **Firebase Firestore** for persistent real-time cloud data storage. 

### Core Architectural Decisions:
1. **Durable Cloud Persistence**: Real-time synchronization of student leads, schedule events, interaction history, and performance metrics across Firestore and local browser storage.
2. **Modular Workspace Structure**: Strict separation of concerns (e.g., distinct views for Marketing, Scheduling, Analytics, and Portals) prevents bloat and ensures high maintainability.
3. **Adaptive Visual Theme**: Generous negative space, clean "Inter" & "JetBrains Mono" typography, and full high-contrast Light/Dark mode transitions.

---

## 🌟 Premium Features & Custom Add-ons

### 1. 🎂 Student Birthday Wishes & Alerts Center (Dashboard)
Located at the heart of the main dashboard, this proactive outreach widget tracks active, upcoming, and recently passed student birthdays.
* **Proactive Intelligence**: Computes birth dates relative to the active operational year (2026), filtering alerts within a `[-2 days to +7 days]` buffer window.
* **Multi-Channel Delivery Simulation**: One-click modal activation for custom **SMS**, **Email**, or **Phone Call** greetings.
* **Integrated History Logging**: Sending a wish automatically creates a timestamped interaction event linked to the student profile, assigned to the registrar.
* **Social Identity Integration**: Quick copyable access to student social handles (`Instagram`, `Telegram`, `Facebook`, `YouTube`).

### 2. 🗃️ Floating Bulk Action Toolbar (Leads CRM)
An advanced, multi-select administrative utility built directly into the Leads CRM kanban and list views.
* **Multi-Lead Selection**: Global checkboxes (on headers or individual cards) toggle selections with visual ring highlights.
* **Bulk Reassignment**: Swiftly reassign a batch of selected students to a new tutor in one action.
* **Bulk Pipeline Updates**: Advance multiple prospects across the CRM stages (e.g., *New*, *Contacted*, *Trial Scheduled*, *Active*) instantly.
* **Bulk Destructive Action Safety**: Confirmation dialog guarded bulk-deletion to clean up duplicate or legacy contacts.

### 3. 🎓 Student Portal Sandbox (Student Engagement)
A fully functional portal emulation workspace that allows administrators to view the system exactly as a student or parent would.
* **Impersonation Sandbox**: Choose any lead from a dropdown to instantly log in and visualize their personal experience.
* **Weekly Performance Trends**: Staggered graphs detailing custom metrics like "Focus", "Technique", and "Practice Consistency" (fetched dynamically from the Performance Tracker).
* **Live Practice Chat Simulator**: Simulated chat environment with the student’s assigned tutor. Includes auto-replies to emulate instant back-and-forth guidance.
* **Assignment Feed & Announcements**: Access to school-wide event notifications (e.g., Annual Summer Recital, Masterclasses) and personalized tutor homework directives.

### 4. 📊 Tutor Analytics (Resource Management)
A deep analytical engine visualizing instructor workloads, retention rates, and performance indexes.
* **Capacity Tracking**: Visual progression bars indicating student allocations relative to weekly thresholds.
* **Student Success Scoring**: Aggregates average lesson attendance and weekly evaluation scores across each instructor's entire student list.
* **Active Scheduled Sessions**: Real-time log tracking scheduled lessons, student attendance records, and active specialties.

### 5. 📈 Student Performance Tracker (Retention & Education)
A specialized module linking educational success with business CRM outcomes to drive student retention.
* **Evaluation Matrix**: Dynamic slider controls measuring weekly performance indicators (Scale of 1–10).
* **Historical Progress Logging**: Generates a timeline of learning milestones, ensuring parents/tutors have a continuous record of academic velocity.

### 6. 🧲 Marketing Hub & Campaigns (Lead Generation)
Provides detailed channel-based campaign tracking for active promotional operations.
* **RoI Analytics**: Tracks costs, converted leads, and customer acquisition costs (CAC) per campaign channel (e.g., social ads, local community fairs).
* **Direct Outreach Launcher**: Triggers simulated communication to campaign targets with automated log entries.

---

## 📋 Data Model Spec (TypeScript Types Reference)

Refer to this schema when implementing CRM records in relational or document databases:

```typescript
export type LeadStatus = 
  | 'New' 
  | 'Contacted' 
  | 'Trial Scheduled' 
  | 'Application Review' 
  | 'Offer Extended' 
  | 'Active' 
  | 'Inactive';

export interface Lead {
  id: string;
  name: string;
  age: number;
  email: string;
  phone: string;
  instrument: string;
  status: LeadStatus;
  assignedTutorId?: string;
  preferredSchedule?: string;
  createdAt: string;
  notes: string;
  
  // Custom Social & Birthday Add-ons:
  birthday?: string;       // Format: YYYY-MM-DD
  instagram?: string;      // e.g. @username
  facebook?: string;       // URL string
  telegram?: string;       // e.g. @username
  youtube?: string;        // Channel URL string
  followUpId?: string;     // Unique CRM tracking identifier (e.g. FW-1049)
}

export interface Tutor {
  id: string;
  name: string;
  specialty: string[];
  bio: string;
  avatar: string;
}

export interface Interaction {
  id: string;
  leadId: string;
  date: string;
  type: 'SMS' | 'Email' | 'Call' | 'In-Person' | 'Trial Lesson' | 'System Note';
  summary: string;
  details: string;
  staffName: string;
}

export interface LessonEvent {
  id: string;
  leadId: string;
  tutorId: string;
  date: string;
  time: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
  attendance?: 'Present' | 'Absent' | 'Excused';
  notes?: string;
}

export interface WeeklyPerformance {
  id: string;
  leadId: string;
  weekStartDate: string;
  focusScore: number;         // 1 to 10
  techniqueScore: number;     // 1 to 10
  practiceConsistency: number;// 1 to 10
  teacherComments: string;
  skillsWorkedOn: string[];
}
```

---

## 🎨 Recommended UI Component Kit (Tailwind & Lucide-React)

When building similar screens, map the following UI design combinations to achieve a polished, cohesive visual rhythm:

| CRM Component | Primary Icon | Styling Paradigm |
| :--- | :--- | :--- |
| **Birthday Alerts** | `Cake` / `Gift` | Warm amber backdrop (`bg-amber-50/40`), subtle ping animations (`animate-pulse`), high-contrast pink actions. |
| **Bulk Actions** | `CheckSquare` / `Trash` | Floating slate glassmorphism (`bg-slate-900/95 backdrop-blur-md`), stark white elements, deep shadow shadows. |
| **Student Portal** | `GraduationCap` | Clean card-based dashboard layout, bento grid structures, and interactive progress metrics. |
| **Tutor Analytics** | `BarChart3` | Professional progression tracks, performance grids with status pings (`bg-emerald-500`). |
