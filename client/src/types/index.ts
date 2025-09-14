export interface User {
  id?: string;
  username: string;
  role: 'admin' | 'user';
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface Flag {
  id?: string;
  exam_id: string;
  flag_type: string;
  timestamp: string;
  screenshot_url: string;
  description: string;
}

export interface ExamSession {
  exam_id: string;
  user_id: string;
  start_time: string;
  end_time?: string;
  flags: Flag[];
  status: 'in_progress' | 'completed' | 'terminated';
}

export interface ExamData {
  exam_id: string;
  user_id: string;
  flags: Flag[];
  completion_time: string;
  answers: { [key: number]: string };
}

export interface ProctoringData {
  exam_id: string;
  flags: {
    flag_name: string;
    screenshot_url: string;
  }[];
}

export interface AuthContextType {
  isAuthenticated: boolean;
  userType: 'admin' | 'user' | null;
  user: User | null;
  login: (type: 'admin' | 'user', credentials: LoginCredentials) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}
