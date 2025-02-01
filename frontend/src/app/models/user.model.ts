export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  status: string;
  token?: string;
  refresh_token?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  token: string;
  refresh_token: string;
  user: User;
} 