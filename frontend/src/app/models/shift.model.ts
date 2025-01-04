export interface Business {
  _id: string;
  name: string;
  email: string;
  status: string;
}

export interface Location {
  latitude: number;
  longitude: number;
  formatted_address: string;
}

export interface Shift {
  id: string;
  business: {
    id: string;
    name: string;
    logo?: string;
  };
  startTime: string;
  endTime: string;
  rate: number;
  location: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  description: string;
  requiredSkills: string[];
  status: 'available' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  worker?: {
    id: string;
    name: string;
    rating: number;
  };
  rating?: number;
  feedback?: string;
} 