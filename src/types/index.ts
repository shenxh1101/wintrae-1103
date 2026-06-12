export interface Job {
  id: string;
  title: string;
  salary: string;
  salaryMin: number;
  salaryMax: number;
  storeName: string;
  storeAvatar: string;
  distance: string;
  distanceValue: number;
  shift: string;
  shiftType: 'morning' | 'afternoon' | 'night' | 'all';
  hasBoard: boolean;
  hasLodging: boolean;
  tags: string[];
  description: string;
  requirements: string[];
  benefits: string[];
  address: string;
  publishedAt: string;
  publishedAtValue: number;
  viewCount: number;
  applyCount: number;
  isFavorite: boolean;
  status: 'active' | 'paused';
}

export type ApplicationStatus =
  | 'applied'
  | 'viewed'
  | 'interview'
  | 'hired'
  | 'rejected';

export interface TimelineEntry {
  status: ApplicationStatus;
  time: string;
  label: string;
}

export interface Application {
  id: string;
  jobId: string;
  job: Job;
  status: ApplicationStatus;
  appliedAt: string;
  viewedAt?: string;
  interviewAt?: string;
  hiredAt?: string;
  rejectedAt?: string;
  rejectedReason?: string;
  hasTrial: boolean;
  trialAt?: string;
  feedback?: string;
  timeline: TimelineEntry[];
}

export interface Message {
  id: string;
  type: 'chat' | 'system' | 'interview' | 'notification';
  title: string;
  avatar: string;
  lastContent: string;
  lastTime: string;
  unread: number;
  storeId?: string;
  storeName?: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  type: 'text' | 'image' | 'voice' | 'video' | 'interview';
  time: string;
  isMine: boolean;
}

export interface Candidate {
  id: string;
  name: string;
  avatar: string;
  age: number;
  gender: 'male' | 'female';
  experience: string;
  expectedSalary: string;
  tags: string[];
  certificates: string[];
  availableTime: string;
  appliedJob: string;
  appliedAt: string;
  status: 'pending' | 'viewed' | 'interview' | 'hired' | 'rejected';
  resume: Resume;
}

export interface Resume {
  id: string;
  name: string;
  avatar: string;
  gender: 'male' | 'female';
  age: number;
  phone: string;
  location: string;
  experience: string;
  education: string;
  expectedSalary: string;
  expectedPosition: string;
  certificates: Certificate[];
  availableTime: AvailableTime[];
  workHistory: WorkHistory[];
  introduction: string;
}

export interface Certificate {
  id: string;
  name: string;
  issueDate: string;
  expireDate: string;
  isExpiring: boolean;
}

export interface AvailableTime {
  day: string;
  periods: string[];
}

export interface WorkHistory {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface StoreInfo {
  id: string;
  name: string;
  avatar: string;
  type: string;
  address: string;
  employeeCount: number;
  description: string;
  publishedJobs: Job[];
}

export type UserRole = 'jobseeker' | 'store';

export interface FilterOptions {
  distance: string;
  salary: string;
  shift: string;
  hasBoard: boolean;
  hasLodging: boolean;
}
