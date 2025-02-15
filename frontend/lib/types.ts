export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "staff";
}

// export interface Visitor {
//   id: string;
//   full_name: string;
//   email: string;
//   phone_number: string;
//   purpose_of_visit: string;
//   nationality: string;
//   expected_check_in_date: string; // Renamed from `visitDate`
//   checkedInAt?: string | null; // Timestamp of actual check-in
//   status: "pending" | "checked-in" | "checked-out";
//   code: string; // Unique check-in code
// }

export interface LaravelApiResponse<T> {
  success?: boolean; // e.g. true
  message?: string; // e.g. "Retrieved successfully."
  data?: T; // e.g. an array of visitors, or a single visitor, etc.
  pagination?: {
    per_page: number;
    has_more_pages: boolean;
    next_cursor: string | null;
    prev_cursor: string | null;
  };
  errors?: Record<string, string[]>; // for validation, etc.
}

export interface Visitor {
  id: string;
  full_name: string;
  email: string;
  phone_number: string;
  purpose_of_visit: string;
  nationality: string;
  expected_check_in_date: string;
  checked_in_at?: string | null; // Match server naming
  unique_code: string; // Match server naming
  // or optionally rename them in the store after receiving them
  status: "pending" | "checked-in" | "checked-out";
}

export interface LaravelCursorPaginatedResponse<T> {
  data: T[];
  pagination: {
    per_page: number;
    has_more_pages: boolean;
    next_cursor: string | null;
    prev_cursor: string | null;
  };
}

export interface ActivityLog {
  id: string;
  action: string;
  description: string;
  userId: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export type VisitorPaginatedResponse = LaravelCursorPaginatedResponse<Visitor>;
export type UserPaginatedResponse = LaravelCursorPaginatedResponse<User>;
export type LogsPaginatedResponse = LaravelCursorPaginatedResponse<ActivityLog>;
