export interface User {
  id: string;
  username: string;
  email: string;
  roles: string[];
  token: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  id: string;
  username: string;
  email: string;
  roles: string[];
  token: string;
} 