export enum UserRole {
  STUDENT = 'STUDENT',
  WARDEN = 'WARDEN',
  GUARD = 'GUARD',
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  regNo?: string;
  roomNo?: string;
}

export type PassStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'OUT' | 'RETURNED' | 'WAITLISTED' | 'CANCELLED' | 'EXPIRED';

export interface OutingPass {
  id: string;
  studentId: string;
  studentName: string;
  regNo: string;
  roomNo: string;
  reason: string;
  outDate: string;
  requestedOutTime: string; // e.g., "after 5 PM"
  status: PassStatus;
  createdAt: string;
  qrData?: string;
  outScanned: boolean;
  outScannedAt?: string;
  inScanned: boolean;
  inScannedAt?: string;
}

export interface SystemState {
  isWindowOpen: boolean;
  capacity: number;
  currentCount: number;
  openingTime: string; // e.g., "17:00"
}
