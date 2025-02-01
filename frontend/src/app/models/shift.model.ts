export interface Shift {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  rate: number;
  location: string;
  status: 'available' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  dress_code?: string;
  notes?: string;
  requirements?: string[];
  completed_at?: string;
  rating?: number;
  duration?: number;
  slots_available: number;
  slots_filled?: number;
  total_hours?: number;
  total_earnings?: number;
  business?: {
    id: string;
    name: string;
  };
  worker?: {
    id: string;
    name: string;
    rating?: number;
  };
}

export interface Location {
  latitude: number;
  longitude: number;
  formatted_address: string;
} 