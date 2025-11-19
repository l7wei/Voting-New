import { Types } from 'mongoose';

// Database Models
export interface IUser {
  _id: Types.ObjectId | string;
  student_id: string;
  remark?: string;
  created_at: Date;
  updated_at: Date;
}

export interface IActivity {
  _id: Types.ObjectId | string;
  name: string;
  subtitle?: string; // Activity subtitle
  description?: string; // Activity description
  rule: 'choose_all' | 'choose_one';
  users: string[]; // Student IDs who have voted
  options: (Types.ObjectId | string)[]; // Option IDs
  open_from: Date;
  open_to: Date;
  created_at: Date;
  updated_at: Date;
}

export interface IOption {
  _id: Types.ObjectId | string;
  activity_id: Types.ObjectId | string;
  title: string; // Option title
  description?: string; // Option description
  created_at: Date;
  updated_at: Date;
}

export interface IVote {
  _id: Types.ObjectId | string;
  activity_id: Types.ObjectId | string;
  rule: 'choose_all' | 'choose_one';
  choose_all?: IChoiceAll[];
  choose_one?: Types.ObjectId | string;
  token: string; // UUID for anonymity
  created_at: Date;
  updated_at: Date;
}

export interface IChoiceAll {
  option_id: Types.ObjectId | string;
  remark: '我要投給他' | '我不投給他' | '我沒有意見';
}

// API Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface AuthUser {
  _id: string;
  student_id: string;
  remark?: string;
  name?: string;
}

export interface JWTPayload extends AuthUser {
  account: string;
  iat?: number;
  exp?: number;
}

// Request Types
export interface CreateActivityRequest {
  name: string;
  subtitle?: string;
  description?: string;
  rule: 'choose_all' | 'choose_one';
  open_from: string;
  open_to: string;
}

export interface CreateOptionRequest {
  activity_id: string;
  title: string;
  description?: string;
}

export interface CreateVoteRequest {
  activity_id: string;
  rule: 'choose_all' | 'choose_one';
  choose_all?: IChoiceAll[];
  choose_one?: string;
}
