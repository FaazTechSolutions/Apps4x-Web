export interface AvatarColors {
  start: string;
  end: string;
}

export type PersonaId = 'employee' | 'manager';

export interface Persona {
  id: PersonaId;
  name: string;
  role: string;
  avatar: string;
  department: string;
  avatarColors: AvatarColors;
}

export interface LeaveCategoryBalance {
  allowed: number;
  pending: number;
  used: number;
}

export interface LeaveBalance {
  annual: LeaveCategoryBalance;
  sick: LeaveCategoryBalance;
  casual: LeaveCategoryBalance;
}

export type LeaveType = 'annual' | 'sick' | 'casual';
export type LeaveStatus = 'pending' | 'approved' | 'rejected';

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  duration: number;
  reason: string;
  emergencyContact: string;
  status: LeaveStatus;
  submittedAt: string;
  approverNotes?: string;
  attachmentName?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  status: 'active' | 'leave';
  activeAbsence?: {
    type: LeaveType;
    start: string;
    end: string;
  };
}
