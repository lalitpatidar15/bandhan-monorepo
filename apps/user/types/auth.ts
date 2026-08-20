export interface AuthUser {
  id: string;
  name: string;
  email?: string;
  role?: 'user' | 'seller' | 'admin' | string;
}

export interface LoginRequest {
  email: string;
  password: string;
  role?: 'buyer' | 'seller' | 'student' | 'instructor' | 'jobseeker' | 'recruiter';
}


export interface SignupRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token?: string;
  ssoCode?: string;
  message?: string;
  user: AuthUser;
}
