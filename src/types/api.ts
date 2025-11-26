export type Role = 'user' | 'admin';

export type Status = 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'CANCELED';

export interface User {
  id: string;
  email: string;
  role: Role;
  monthly_limit: number | null;
  monthly_usage: number | null;
  is_active: boolean;
}

export interface Avatar {
  avatar_id: string;
  name: string;
  voice_id: string;
}

export interface VideoDetail {
  id: string;
  title: string;
  status: Status;
  s3_url: string | null;
  duration_seconds: number | null;
  completed_at: string | null;
  error_message: string | null;
  avatar_id: string | null;
  text: string | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token?: string | null;
  token_type: string;
}

export interface CreateVideoRequest {
  title: string;
  avatar_id: string;
  text: string;
}

export interface UserCreateRequest {
  email: string;
  password: string;
  role?: Role;
  monthly_limit?: number | null;
}

export interface UserUpdateRequest {
  id: string;
  email?: string | null;
  password?: string | null;
  role?: Role | null;
  monthly_limit?: number | null;
  is_active?: boolean | null;
}

export interface ErrorResponse {
  detail: string;
  timestamp: string;
}
