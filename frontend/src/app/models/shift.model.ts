export type ShiftStatus = 'available' | 'assigned' | 'in_progress' | 'completed' | 'cancelled' | 'applied';

export interface Location {
  id: string;
  name: string;
  address: string;
  coordinates: [number, number]; // [longitude, latitude]
}

export interface Business {
  id: string;
  name: string;
  logo_url?: string;
  rating?: number;
  status: string;
}

export interface Worker {
  id: string;
  name: string;
  avatar_url?: string;
  rating?: number;
}

export interface ShiftApplication {
  worker_profile_id: string;
  worker_name: string;
  applied_at: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface Shift {
  id: string;
  title: string;
  description: string;
  start_time: string; // ISO string format
  end_time: string; // ISO string format
  hourly_rate: number;
  status: ShiftStatus;
  requirements: string[];
  dress_code?: string;
  break_time?: number; // in minutes
  notes?: string;
  
  // Location details
  location_id?: string;
  location_name: string;
  location_address: string;
  location_coordinates?: [number, number]; // [longitude, latitude]
  
  // Business details
  business_profile_id: string;
  business_name: string;
  business?: Business;
  
  // Worker details
  worker_profile_id?: string;
  worker_name?: string;
  worker?: Worker;
  
  // Progress tracking
  check_in_time?: string; // ISO string format
  check_out_time?: string; // ISO string format
  actual_hours_worked?: number;
  total_earnings?: number;
  
  // Applications
  applications?: ShiftApplication[];
  applications_count?: number;
  has_applied?: boolean;
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

export const canApply = (shift: Shift, workerProfileId: string): boolean => {
  if (!shift || !workerProfileId) return false;
  return (
    shift.status === 'available' &&
    !shift.has_applied &&
    new Date(shift.start_time) > new Date()
  );
};

export const canStart = (shift: Shift, workerProfileId: string): boolean => {
  if (!shift || !workerProfileId) return false;
  const now = new Date();
  const startTime = new Date(shift.start_time);
  const endTime = new Date(shift.end_time);
  const fifteenMinutesBefore = new Date(startTime.getTime() - 15 * 60000);
  
  return (
    shift.status === 'assigned' &&
    shift.worker_profile_id === workerProfileId &&
    now >= fifteenMinutesBefore &&
    now <= endTime
  );
};

export const canComplete = (shift: Shift, workerProfileId: string): boolean => {
  if (!shift || !workerProfileId) return false;
  return (
    shift.status === 'in_progress' &&
    shift.worker_profile_id === workerProfileId &&
    new Date() >= new Date(shift.start_time)
  );
};

export const calculateDuration = (shift: Shift): number => {
  const start = new Date(shift.start_time);
  const end = new Date(shift.end_time);
  return (end.getTime() - start.getTime()) / (1000 * 60 * 60); // Duration in hours
};

export const calculateEarnings = (shift: Shift): number => {
  if (!shift.actual_hours_worked) return 0;
  return shift.actual_hours_worked * shift.hourly_rate;
}; 