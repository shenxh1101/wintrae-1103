import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { UserRole, Job, Application, Resume, Message } from '@/types';
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

interface AppState {
  role: UserRole;
  setRole: (role: UserRole) => void;
  jobs: Job[];
  addJob: (job: Job) => void;
  toggleFavorite: (jobId: string) => void;
  applications: Application[];
  addApplication: (job: Job) => boolean;
  resume: Resume;
  updateResume: (resume: Resume) => void;
  messages: Message[];
  markAllRead: () => void;
  markChatRead: (storeId: string) => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [role, setRoleState] = useState<UserRole>(loadJSON('kuaizhao_role', 'jobseeker'));
  const [jobs, setJobs] = useState<Job[]>(loadJSON('kuaizhao_jobs', mockJobs));
  const [applications, setApplications] = useState<Application[]>(loadJSON('kuaizhao_applications', mockApplications));
  const [resume, setResume] = useState<Resume>(initResume);
  const [messages, setMessages] = useState<Message[]>(loadJSON('kuaizhao_messages', mockMessages));

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
      };
      const next = [newApp, ...prev];
      saveJSON('kuaizhao_applications', next);
      return next;
    });
    return !exists;
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

  return (
    <AppContext.Provider
      value={{
        role,
        setRole,
        jobs,
        addJob,
        toggleFavorite,
        applications,
        addApplication,
        resume,
        updateResume,
        messages,
        markAllRead,
        markChatRead,
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
