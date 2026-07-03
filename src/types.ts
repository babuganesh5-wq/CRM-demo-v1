export type LeadStatus = 'New' | 'Contacted' | 'Trial Scheduled' | 'Application Review' | 'Offer Extended' | 'Active' | 'Inactive';

export interface Interaction {
  id: string;
  leadId: string;
  date: string;
  type: 'Call' | 'Email' | 'In-Person' | 'Trial Lesson' | 'SMS';
  summary: string;
  details: string;
  staffName: string;
}

export interface Tutor {
  id: string;
  name: string;
  specialty: string[];
  avatar: string;
  color: string;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  age: number;
  category: 'Child' | 'Teen' | 'Adult';
  instrument: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  status: LeadStatus;
  assignedTutorId?: string;
  monthlyBudget?: number;
  preferredSchedule?: string;
  createdAt: string;
  notes: string;
  birthday?: string;
  instagram?: string;
  facebook?: string;
  telegram?: string;
  youtube?: string;
  followUpId?: string;
}

export interface LessonEvent {
  id: string;
  leadId: string;
  leadName: string;
  tutorId: string;
  tutorName: string;
  instrument: string;
  date: string;
  time: string;
  durationMinutes: number;
  type: 'Trial' | 'Regular Lesson' | 'Makeup';
  status: 'Scheduled' | 'Completed' | 'Cancelled';
  attendance?: 'Present' | 'Absent' | 'Excused';
}

export interface WeeklyPerformance {
  id: string;
  leadId: string;
  weekStartDate: string; // YYYY-MM-DD
  technicalScore: number; // 1-10
  rhythmScore: number; // 1-10
  expressionScore: number; // 1-10
  practiceHours: number; // hours per week
  overallScore: number; // calculated composite 0-100
  weeklyFocus: string; // e.g. "Arpeggios and posture"
  teacherComments: string;
  loggedBy: string;
  createdAt: string;
}

export interface Invoice {
  id: string;
  leadId: string;
  leadName: string;
  instrument: string;
  amount: number;
  dueDate: string;
  status: 'Pending' | 'Paid' | 'Failed' | 'Refunded';
  paidAt?: string;
  receiptNumber?: string;
  paymentAttempts?: number;
}


