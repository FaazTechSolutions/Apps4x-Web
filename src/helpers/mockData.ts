import { Persona, LeaveRequest, LeaveBalance, TeamMember } from '@/types';

// Avatars and color tokens for elegant card designs
export const PERSONAS: Persona[] = [
  {
    id: 'employee',
    name: 'Sarah Jenkins',
    role: 'Senior Frontend Engineer',
    avatar: 'SJ',
    department: 'Engineering (Platform)',
    avatarColors: { start: '#6366f1', end: '#a855f7' } // Indigo to Purple
  },
  {
    id: 'manager',
    name: 'David Miller',
    role: 'Engineering Manager',
    avatar: 'DM',
    department: 'Engineering',
    avatarColors: { start: '#06b6d4', end: '#3b82f6' } // Cyan to Blue
  }
];

// Seed Balance for Sarah Jenkins (Employee)
export const DEFAULT_LEAVE_BALANCE: LeaveBalance = {
  annual: { allowed: 25, pending: 0, used: 14 },
  sick: { allowed: 10, pending: 0, used: 3 },
  casual: { allowed: 7, pending: 0, used: 2 }
};

// Seed team members for the manager dashboard
export const TEAM_MEMBERS: TeamMember[] = [
  { id: 'emp_sarah', name: 'Sarah Jenkins', role: 'Senior Frontend Engineer', status: 'active' },
  { id: 'emp_elena', name: 'Elena Rostova', role: 'UI/UX Designer', status: 'active' },
  { id: 'emp_marcus', name: 'Marcus Vance', role: 'Backend Engineer', status: 'active' },
  { id: 'emp_chloe', name: 'Chloe Chen', role: 'QA Lead', status: 'active' }
];

// Helper to generate dynamic ISO string relative to today
const getRelativeDate = (offsetDays: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
};

// Seed leave requests with relative dates for dynamic demonstration
export const getInitialLeaveRequests = (): LeaveRequest[] => [
  {
    id: 'req_1',
    employeeId: 'emp_sarah',
    employeeName: 'Sarah Jenkins',
    leaveType: 'annual',
    startDate: getRelativeDate(-20),
    endDate: getRelativeDate(-16),
    duration: 5,
    reason: 'Family spring vacation to Hawaii.',
    emergencyContact: '+1 (555) 342-9988',
    status: 'approved',
    submittedAt: getRelativeDate(-25)
  },
  {
    id: 'req_2',
    employeeId: 'emp_sarah',
    employeeName: 'Sarah Jenkins',
    leaveType: 'sick',
    startDate: getRelativeDate(-5),
    endDate: getRelativeDate(-4),
    duration: 2,
    reason: 'Acute dental procedure and post-recovery.',
    emergencyContact: '+1 (555) 342-9988',
    status: 'approved',
    submittedAt: getRelativeDate(-5)
  },
  {
    id: 'req_3',
    employeeId: 'emp_sarah',
    employeeName: 'Sarah Jenkins',
    leaveType: 'casual',
    startDate: getRelativeDate(10),
    endDate: getRelativeDate(10),
    duration: 1,
    reason: 'Attending a full-day developer conference.',
    emergencyContact: '+1 (555) 342-9988',
    status: 'rejected',
    submittedAt: getRelativeDate(-1),
    approverNotes: 'Kindly use conference/training credits instead of casual leave. Talk to HR.'
  },
  // Active Pending request from Sarah - which will show in Manager Inbox
  {
    id: 'req_4',
    employeeId: 'emp_sarah',
    employeeName: 'Sarah Jenkins',
    leaveType: 'annual',
    startDate: getRelativeDate(4),
    endDate: getRelativeDate(8),
    duration: 5,
    reason: 'Moving to a new apartment and setting up workspace.',
    emergencyContact: '+1 (555) 342-9988',
    status: 'pending',
    submittedAt: getRelativeDate(0)
  },
  // Overlapping request from Sarah's teammate Elena (already approved or pending)
  // This will trigger the team overlap warning if David reviews Sarah's request!
  {
    id: 'req_5',
    employeeId: 'emp_elena',
    employeeName: 'Elena Rostova',
    leaveType: 'annual',
    startDate: getRelativeDate(3),
    endDate: getRelativeDate(7),
    duration: 5,
    reason: 'Anniversary trip out of country.',
    emergencyContact: '+1 (555) 890-4433',
    status: 'approved',
    submittedAt: getRelativeDate(-10)
  }
];

// LocalStorage helpers to make the demo persistent and robust
const STORAGE_PREFIX = 'nexflow_';

export const loadLeaveRequests = (): LeaveRequest[] => {
  if (typeof window === 'undefined') return getInitialLeaveRequests();
  const data = localStorage.getItem(`${STORAGE_PREFIX}requests`);
  if (!data) {
    const initial = getInitialLeaveRequests();
    localStorage.setItem(`${STORAGE_PREFIX}requests`, JSON.stringify(initial));
    return initial;
  }
  return JSON.parse(data);
};

export const saveLeaveRequests = (requests: LeaveRequest[]): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`${STORAGE_PREFIX}requests`, JSON.stringify(requests));
};

export const loadLeaveBalance = (): LeaveBalance => {
  if (typeof window === 'undefined') return DEFAULT_LEAVE_BALANCE;
  const data = localStorage.getItem(`${STORAGE_PREFIX}balance`);
  if (!data) {
    localStorage.setItem(`${STORAGE_PREFIX}balance`, JSON.stringify(DEFAULT_LEAVE_BALANCE));
    return DEFAULT_LEAVE_BALANCE;
  }
  return JSON.parse(data);
};

export const saveLeaveBalance = (balance: LeaveBalance): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`${STORAGE_PREFIX}balance`, JSON.stringify(balance));
};
