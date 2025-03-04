export interface WorkerProfile {
  id: string;
  user_id: string;
  status: string;
  phone: string;
  address: string;
  bio: string;
  hourly_rate: number;
  skills: string[];
  availability?: any;
  rating?: number;
  completed_shifts_count?: number;
  photo_url?: string;
  documents?: WorkerDocument[];
  created_at?: string;
  updated_at?: string;
}

export interface WorkerDocument {
  id: string;
  type: string;
  file_url: string;
  expiry_date?: string;
  status: 'pending' | 'uploaded' | 'expired';
  created_at?: string;
  updated_at?: string;
}

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'worker' | 'business_owner' | 'admin';
  status: string;
  worker_profile?: WorkerProfile;
  business_profile?: any;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refresh_token: string;
} 