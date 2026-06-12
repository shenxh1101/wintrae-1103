import type { Application } from '@/types';
import { mockJobs } from './jobs';

export const mockApplications: Application[] = [
  {
    id: 'app001',
    jobId: 'job001',
    job: mockJobs[0],
    status: 'hired',
    appliedAt: '2026-06-01 10:30',
    viewedAt: '2026-06-01 14:20',
    interviewAt: '2026-06-03 15:00',
    hiredAt: '2026-06-05 09:00',
    hasTrial: true,
    trialAt: '2026-06-15 09:00',
    feedback: '恭喜你通过面试，请按时参加试岗！',
  },
  {
    id: 'app002',
    jobId: 'job007',
    job: mockJobs[6],
    status: 'interview',
    appliedAt: '2026-06-08 09:15',
    viewedAt: '2026-06-08 11:30',
    interviewAt: '2026-06-14 10:00',
    hasTrial: false,
  },
  {
    id: 'app003',
    jobId: 'job003',
    job: mockJobs[2],
    status: 'viewed',
    appliedAt: '2026-06-10 16:45',
    viewedAt: '2026-06-11 09:20',
    hasTrial: false,
  },
  {
    id: 'app004',
    jobId: 'job005',
    job: mockJobs[4],
    status: 'applied',
    appliedAt: '2026-06-12 14:00',
    hasTrial: false,
  },
  {
    id: 'app005',
    jobId: 'job002',
    job: mockJobs[1],
    status: 'rejected',
    appliedAt: '2026-05-28 11:20',
    viewedAt: '2026-05-29 10:00',
    rejectedAt: '2026-05-30 16:30',
    rejectedReason: '该岗位已招满，感谢您的关注',
    hasTrial: false,
  },
  {
    id: 'app006',
    jobId: 'job004',
    job: mockJobs[3],
    status: 'viewed',
    appliedAt: '2026-06-09 08:30',
    viewedAt: '2026-06-09 15:45',
    hasTrial: false,
  },
];

export const statusLabels: Record<string, { label: string; color: string }> = {
  applied: { label: '已投递', color: '#FF7D00' },
  viewed: { label: '已查看', color: '#2E86DE' },
  interview: { label: '面试中', color: '#722ED1' },
  hired: { label: '已录用', color: '#00B42A' },
  rejected: { label: '已拒绝', color: '#F53F3F' },
};
