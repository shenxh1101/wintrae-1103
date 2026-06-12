import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { UserRole, Job, Application, Resume, Message, ChatMessage, ApplicationStatus, TimelineEntry } from '@/types';
import { mockJobs } from '@/data/jobs';
import { mockApplications } from '@/data/applications';
import { mockResume } from '@/data/resume';
import { mockMessages } from '@/data/messages';
import dayjs from 'dayjs';

function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as T;
  } catch (_) {}
  return fallback;
}

function saveJSON(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (_) {}
}

function computeCertExpiring(cert: { expireDate: string }): boolean {
  const diff = dayjs(cert.expireDate).diff(dayjs(), 'day');
  return diff >= 0 && diff <= 90;
}

function initResume(): Resume {
  const base = loadJSON<Resume>('kuaizhao_resume', mockResume);
  base.certificates = base.certificates.map((c) => ({
    ...c,
    isExpiring: computeCertExpiring(c),
  }));
  return base;
}

function ensureJobDefaults(jobs: Job[]): Job[] {
  return jobs.map((j) => ({
    ...j,
    status: j.status || 'active',
    publishedAtValue: j.publishedAtValue || Date.now(),
  }));
}

function ensureAppDefaults(apps: Application[]): Application[] {
  return apps.map((a) => ({
    ...a,
    timeline: a.timeline || [{ status: 'applied' as ApplicationStatus, time: a.appliedAt, label: '已投递' }],
  }));
}

const statusLabelMap: Record<ApplicationStatus, string> = {
  applied: '已投递',
  viewed: '已查看',
  interview: '邀约面试',
  hired: '已录用',
  rejected: '已拒绝',
};

interface AppState {
  role: UserRole;
  setRole: (role: UserRole) => void;
  jobs: Job[];
  addJob: (job: Job) => void;
  toggleFavorite: (jobId: string) => void;
  toggleJobStatus: (jobId: string) => void;
  applications: Application[];
  addApplication: (job: Job) => boolean;
  updateApplicationStatus: (appId: string, status: ApplicationStatus, extra?: { rejectedReason?: string; interviewAt?: string }) => void;
  resume: Resume;
  updateResume: (resume: Resume) => void;
  messages: Message[];
  markAllRead: () => void;
  markChatRead: (storeId: string) => void;
  chatHistories: Record<string, ChatMessage[]>;
  addChatMessage: (storeId: string, msg: ChatMessage) => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [role, setRoleState] = useState<UserRole>(loadJSON('kuaizhao_role', 'jobseeker'));
  const [jobs, setJobs] = useState<Job[]>(ensureJobDefaults(loadJSON('kuaizhao_jobs', mockJobs)));
  const [applications, setApplications] = useState<Application[]>(ensureAppDefaults(loadJSON('kuaizhao_applications', mockApplications)));
  const [resume, setResume] = useState<Resume>(initResume);
  const [messages, setMessages] = useState<Message[]>(loadJSON('kuaizhao_messages', mockMessages));
  const [chatHistories, setChatHistories] = useState<Record<string, ChatMessage[]>>(loadJSON('kuaizhao_chat_histories', {}));

  const setRole = useCallback((r: UserRole) => {
    setRoleState(r);
    saveJSON('kuaizhao_role', r);
  }, []);

  const addJob = useCallback((job: Job) => {
    setJobs((prev) => {
      const next = [job, ...prev];
      saveJSON('kuaizhao_jobs', next);
      return next;
    });
  }, []);

  const toggleFavorite = useCallback((jobId: string) => {
    setJobs((prev) => {
      const next = prev.map((j) =>
        j.id === jobId ? { ...j, isFavorite: !j.isFavorite } : j
      );
      saveJSON('kuaizhao_jobs', next);
      return next;
    });
  }, []);

  const toggleJobStatus = useCallback((jobId: string) => {
    setJobs((prev) => {
      const next = prev.map((j) =>
        j.id === jobId ? { ...j, status: (j.status === 'active' ? 'paused' : 'active') as 'active' | 'paused' } : j
      );
      saveJSON('kuaizhao_jobs', next);
      return next;
    });
  }, []);

  const addApplication = useCallback((job: Job): boolean => {
    let exists = false;
    setApplications((prev) => {
      if (prev.some((a) => a.jobId === job.id)) {
        exists = true;
        return prev;
      }
      const now = dayjs().format('YYYY-MM-DD HH:mm');
      const newApp: Application = {
        id: `app${Date.now()}`,
        jobId: job.id,
        job,
        status: 'applied',
        appliedAt: now,
        hasTrial: false,
        timeline: [{ status: 'applied', time: now, label: '已投递' }],
      };
      const next = [newApp, ...prev];
      saveJSON('kuaizhao_applications', next);

      setJobs((jp) => {
        const nj = jp.map((j) =>
          j.id === job.id ? { ...j, applyCount: j.applyCount + 1 } : j
        );
        saveJSON('kuaizhao_jobs', nj);
        return nj;
      });

      return next;
    });
    return !exists;
  }, []);

  const updateApplicationStatus = useCallback((appId: string, status: ApplicationStatus, extra?: { rejectedReason?: string; interviewAt?: string }) => {
    setApplications((prev) => {
      const now = dayjs().format('YYYY-MM-DD HH:mm');
      const next = prev.map((a) => {
        if (a.id !== appId) return a;
        const entry: TimelineEntry = { status, time: now, label: statusLabelMap[status] };
        const updated = {
          ...a,
          status,
          timeline: [...a.timeline, entry],
        };
        if (status === 'viewed') updated.viewedAt = now;
        if (status === 'interview') updated.interviewAt = extra?.interviewAt || now;
        if (status === 'hired') updated.hiredAt = now;
        if (status === 'rejected') {
          updated.rejectedAt = now;
          updated.rejectedReason = extra?.rejectedReason;
        }
        return updated;
      });
      saveJSON('kuaizhao_applications', next);

      const app = next.find((a) => a.id === appId);
      if (app) {
        setMessages((mp) => {
          const msg: Message = {
            id: `msg${Date.now()}`,
            type: status === 'interview' ? 'interview' : 'notification',
            title: app.job.storeName,
            avatar: app.job.storeAvatar,
            lastContent: `${app.job.title} - ${statusLabelMap[status]}`,
            lastTime: dayjs().format('HH:mm'),
            unread: 1,
            storeId: `store_${app.jobId}`,
            storeName: app.job.storeName,
          };
          const nm = [msg, ...mp];
          saveJSON('kuaizhao_messages', nm);
          return nm;
        });
      }

      return next;
    });
  }, []);

  const updateResume = useCallback((r: Resume) => {
    const withExpiring = {
      ...r,
      certificates: r.certificates.map((c) => ({
        ...c,
        isExpiring: computeCertExpiring(c),
      })),
    };
    setResume(withExpiring);
    saveJSON('kuaizhao_resume', withExpiring);
  }, []);

  const markAllRead = useCallback(() => {
    setMessages((prev) => {
      const next = prev.map((m) => ({ ...m, unread: 0 }));
      saveJSON('kuaizhao_messages', next);
      return next;
    });
  }, []);

  const markChatRead = useCallback((storeId: string) => {
    setMessages((prev) => {
      const next = prev.map((m) =>
        m.storeId === storeId ? { ...m, unread: 0 } : m
      );
      saveJSON('kuaizhao_messages', next);
      return next;
    });
  }, []);

  const addChatMessage = useCallback((storeId: string, msg: ChatMessage) => {
    setChatHistories((prev) => {
      const existing = prev[storeId] || [];
      const next = { ...prev, [storeId]: [...existing, msg] };
      saveJSON('kuaizhao_chat_histories', next);
      return next;
    });
  }, []);

  return (
    <AppContext.Provider
      value={{
        role,
        setRole,
        jobs,
        addJob,
        toggleFavorite,
        toggleJobStatus,
        applications,
        addApplication,
        updateApplicationStatus,
        resume,
        updateResume,
        messages,
        markAllRead,
        markChatRead,
        chatHistories,
        addChatMessage,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppState => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
