export type ShiftStatus = 'available' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';

export interface Location {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

export interface Business {
  id: string;
  name: string;
  logo_url?: string;
  rating?: number;
}

export interface Worker {
  id: string;
  name: string;
  avatar_url?: string;
  rating?: number;
}

export interface ShiftApplication {
  worker_id: string;
  notes?: string;
  availability_confirmed: boolean;
}

export interface Shift {
  id: string;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  hourly_rate: number;
  rate: number; // Alias for hourly_rate for backward compatibility
  status: ShiftStatus;
  required_experience_years?: number;
  required_certifications?: string[];
  special_requirements?: string;
  dress_code?: string;
  requirements?: string[];
  notes?: string;
  
  // Location details
  location_name: string;
  location_address: string;
  location_coordinates?: number[];
  location?: Location; // Making this optional since we're using direct fields
  
  // Business details
  business_profile_id: string;
  business_name: string;
  business?: Business;
  
  // Worker details
  worker_profile_id?: string;
  worker_name?: string;
  worker?: Worker;
  
  // Application details
  applications_count?: number;
  has_applied?: boolean;
  selected_worker_id?: string;
  
  // Progress tracking
  check_in_time?: string;
  check_out_time?: string;
  actual_hours_worked?: number;
  break_duration_minutes?: number;
  total_earnings?: number;
  
  // Timestamps
  created_at: string;
  updated_at: string;
} 