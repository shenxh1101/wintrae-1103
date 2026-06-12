import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';
import type {
  UserRole,
  Job,
  Application,
  Resume,
  Message,
  ChatMessage,
  ApplicationStatus,
  TimelineEntry,
  InterviewMethod,
  InterviewResult,
} from '@/types';
import { mockJobs } from '@/data/jobs';
import { mockApplications } from '@/data/applications';
import { mockResume } from '@/data/resume';
import { mockMessages } from '@/data/messages';
import dayjs from 'dayjs';

const CURRENT_STORE_ID = 'store_xicha001';
const CURRENT_STORE_NAME = '喜茶(万达店)';

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
  return jobs.map((j, idx) => ({
    ...j,
    status: j.status || 'active',
    publishedAtValue: j.publishedAtValue || Date.now() - idx * 3600000,
    storeId: j.storeId || (j.storeName && j.storeName.includes('喜茶') ? CURRENT_STORE_ID : `store_${idx}`),
  }));
}

function ensureAppDefaults(apps: Application[]): Application[] {
  return apps.map((a) => ({
    ...a,
    timeline: a.timeline || [{ status: 'applied' as ApplicationStatus, time: a.appliedAt, label: '已投递' }],
  }));
}

function computeMatchScore(job: Job, resume: Resume): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];

  if (job.distanceValue <= 1) { score += 30; reasons.push('距离近（1km以内）'); }
  else if (job.distanceValue <= 3) { score += 20; reasons.push(`距离 ${job.distanceValue}km`); }
  else if (job.distanceValue <= 5) { score += 10; reasons.push(`距离 ${job.distanceValue}km`); }

  const expectedSalary = parseInt((resume.expectedSalary || '5000').replace(/\D/g, '')) || 5000;
  if (job.salaryMin >= expectedSalary) { score += 30; reasons.push('薪资满足期望'); }
  else if (job.salaryMax >= expectedSalary * 0.9) { score += 20; reasons.push('薪资接近期望'); }
  else if (job.salaryMax >= expectedSalary * 0.7) { score += 10; reasons.push('薪资略低于期望'); }

  const availableWeekdays = resume.availableTime.filter((t) => !t.periods.includes('休息'));
  if (availableWeekdays.length >= 5) { score += 15; reasons.push('可上班时间充足'); }
  else if (availableWeekdays.length >= 3) { score += 10; reasons.push('可上班时间匹配'); }

  if (resume.certificates.length > 0) { score += 10; reasons.push(`持有${resume.certificates.length}项证书`); }

  const expectedPosition = resume.expectedPosition || '';
  if (expectedPosition && job.title.includes(expectedPosition.slice(0, 2))) {
    score += 15;
    reasons.push('职位契合求职意向');
  } else if (expectedPosition) {
    score += 5;
  }

  score = Math.min(score, 99);
  return { score, reasons };
}

const statusLabelMap: Record<ApplicationStatus, string> = {
  applied: '已投递',
  viewed: '已查看',
  interview: '邀约面试',
  hired: '已录用',
  rejected: '已拒绝',
};

const methodLabelMap: Record<InterviewMethod, string> = {
  onsite: '现场面试',
  phone: '语音面试',
  video: '视频面试',
};

function getStoreChatId(jobOrStoreId: string, storeName?: string): string {
  if (jobOrStoreId.startsWith('chat_')) return jobOrStoreId;
  if (jobOrStoreId.startsWith('store_')) return jobOrStoreId;
  if (jobOrStoreId.startsWith('job')) return `store_xicha001`;
  return jobOrStoreId;
}

interface AppState {
  role: UserRole;
  setRole: (role: UserRole) => void;
  currentStoreId: string;
  currentStoreName: string;
  jobs: Job[];
  jobsWithMatch: Job[];
  addJob: (job: Job) => void;
  toggleFavorite: (jobId: string) => void;
  toggleJobStatus: (jobId: string) => void;
  applications: Application[];
  storeApplications: Application[];
  addApplication: (job: Job) => boolean;
  updateApplicationStatus: (appId: string, status: ApplicationStatus, extra?: { rejectedReason?: string; interviewAt?: string; interviewMethod?: InterviewMethod }) => void;
  respondInterview: (appId: string, result: InterviewResult) => void;
  resume: Resume;
  updateResume: (resume: Resume) => void;
  messages: Message[];
  markAllRead: () => void;
  markChatRead: (storeId: string) => void;
  chatHistories: Record<string, ChatMessage[]>;
  getChatHistory: (storeId: string) => ChatMessage[];
  addChatMessage: (storeId: string, msg: ChatMessage) => void;
  sendInterviewInvite: (storeId: string, appId: string, method: InterviewMethod, time: string, job: Job) => void;
  computeJobMatch: (job: Job) => { score: number; reasons: string[] };
  getStoreChatId: (jobId: string) => string;
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

  const jobsWithMatch = useMemo(() => {
    return jobs.map((j) => {
      const { score, reasons } = computeMatchScore(j, resume);
      return { ...j, matchScore: score, matchReasons: reasons };
    });
  }, [jobs, resume]);

  const storeApplications = useMemo(
    () => applications.filter((a) => a.job.storeId === CURRENT_STORE_ID || a.job.storeName === CURRENT_STORE_NAME),
    [applications]
  );

  const computeJobMatch = useCallback(
    (job: Job) => computeMatchScore(job, resume),
    [resume]
  );

  const getStoreChatId = useCallback((jobId: string) => {
    const job = jobs.find((j) => j.id === jobId);
    return job?.storeId || getStoreChatId(jobId);
  }, [jobs]);

  const addJob = useCallback((job: Job) => {
    const withStore = { ...job, storeId: job.storeId || CURRENT_STORE_ID };
    setJobs((prev) => {
      const next = [withStore, ...prev];
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
      const jobWithStore = { ...job, storeId: job.storeId || CURRENT_STORE_ID };
      const newApp: Application = {
        id: `app${Date.now()}`,
        jobId: job.id,
        job: jobWithStore,
        status: 'applied',
        appliedAt: now,
        hasTrial: false,
        timeline: [{ status: 'applied', time: now, label: '已投递' }],
      };
      const next = [newApp, ...prev];
      saveJSON('kuaizhao_applications', next);

      setJobs((jp) => {
        const nj = jp.map((j) =>
          j.id === job.id ? { ...j, applyCount: j.applyCount + 1, viewCount: j.viewCount + 1 } : j
        );
        saveJSON('kuaizhao_jobs', nj);
        return nj;
      });

      return next;
    });
    return !exists;
  }, []);

  const updateApplicationStatus = useCallback((appId: string, status: ApplicationStatus, extra?: { rejectedReason?: string; interviewAt?: string; interviewMethod?: InterviewMethod }) => {
    setApplications((prev) => {
      const now = dayjs().format('YYYY-MM-DD HH:mm');
      let targetApp: Application | undefined;
      const next = prev.map((a) => {
        if (a.id !== appId) return a;
        const entry: TimelineEntry = { status, time: now, label: statusLabelMap[status] };
        const updated: Application = {
          ...a,
          status,
          timeline: [...a.timeline, entry],
        };
        if (status === 'viewed') updated.viewedAt = now;
        if (status === 'interview') {
          updated.interviewAt = extra?.interviewAt || now;
          updated.interviewMethod = extra?.interviewMethod || 'onsite';
          updated.interviewResult = 'pending';
        }
        if (status === 'hired') updated.hiredAt = now;
        if (status === 'rejected') {
          updated.rejectedAt = now;
          updated.rejectedReason = extra?.rejectedReason;
        }
        targetApp = updated;
        return updated;
      });
      saveJSON('kuaizhao_applications', next);

      if (targetApp) {
        const app = targetApp;
        setMessages((mp) => {
          const chatId = app.job.storeId || getStoreChatId(app.jobId);
          let content = `${app.job.title} - ${statusLabelMap[status]}`;
          if (status === 'interview' && app.interviewAt && app.interviewMethod) {
            content = `${app.job.title} - ${methodLabelMap[app.interviewMethod]}：${app.interviewAt}`;
          }
          const msg: Message = {
            id: `msg${Date.now()}`,
            type: status === 'interview' ? 'interview' : 'notification',
            title: app.job.storeName,
            avatar: app.job.storeAvatar,
            lastContent: content,
            lastTime: dayjs().format('HH:mm'),
            unread: 1,
            storeId: chatId,
            storeName: app.job.storeName,
            applicationId: app.id,
            interviewInfo: status === 'interview' && app.interviewAt && app.interviewMethod
              ? { method: app.interviewMethod, time: app.interviewAt, result: app.interviewResult }
              : undefined,
          };
          const nm = [msg, ...mp];
          saveJSON('kuaizhao_messages', nm);
          return nm;
        });
      }

      return next;
    });
  }, []);

  const respondInterview = useCallback((appId: string, result: InterviewResult) => {
    setApplications((prev) => {
      const next = prev.map((a) => {
        if (a.id !== appId) return a;
        return { ...a, interviewResult: result };
      });
      saveJSON('kuaizhao_applications', next);
      return next;
    });
    setMessages((prev) => {
      const next = prev.map((m) => {
        if (m.applicationId !== appId || !m.interviewInfo) return m;
        return { ...m, interviewInfo: { ...m.interviewInfo, result } };
      });
      saveJSON('kuaizhao_messages', next);
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
    const chatId = getStoreChatId(storeId);
    setMessages((prev) => {
      const next = prev.map((m) =>
        (m.storeId === chatId || m.storeId === storeId) ? { ...m, unread: 0 } : m
      );
      saveJSON('kuaizhao_messages', next);
      return next;
    });
  }, []);

  const getChatHistory = useCallback(
    (storeId: string): ChatMessage[] => {
      const chatId = getStoreChatId(storeId);
      return chatHistories[chatId] || [];
    },
    [chatHistories]
  );

  const addChatMessage = useCallback((storeId: string, msg: ChatMessage) => {
    const chatId = getStoreChatId(storeId);
    setChatHistories((prev) => {
      const existing = prev[chatId] || [];
      const next = { ...prev, [chatId]: [...existing, msg] };
      saveJSON('kuaizhao_chat_histories', next);
      return next;
    });
    setMessages((prev) => {
      const existing = prev.find((m) => m.storeId === chatId);
      const nowStr = dayjs().format('HH:mm');
      if (existing) {
        const nm = prev.map((m) =>
          m.storeId === chatId
            ? { ...m, lastContent: msg.content, lastTime: nowStr, unread: m.unread + (msg.isMine ? 0 : 1) }
            : m
        );
        saveJSON('kuaizhao_messages', nm);
        return nm;
      }
      return prev;
    });
  }, []);

  const sendInterviewInvite = useCallback((storeId: string, appId: string, method: InterviewMethod, time: string, job: Job) => {
    const chatId = getStoreChatId(storeId);
    const nowStr = dayjs().format('HH:mm');
    const inviteMsg: ChatMessage = {
      id: `iv${Date.now()}`,
      senderId: storeId,
      senderName: CURRENT_STORE_NAME,
      senderAvatar: job.storeAvatar,
      content: `${methodLabelMap[method]}邀约`,
      type: 'interview',
      time: nowStr,
      isMine: false,
      interviewInfo: { method, time, result: 'pending' },
    };
    setChatHistories((prev) => {
      const existing = prev[chatId] || [];
      const next = { ...prev, [chatId]: [...existing, inviteMsg] };
      saveJSON('kuaizhao_chat_histories', next);
      return next;
    });
    updateApplicationStatus(appId, 'interview', { interviewAt: time, interviewMethod: method });
  }, [updateApplicationStatus]);

  return (
    <AppContext.Provider
      value={{
        role,
        setRole,
        currentStoreId: CURRENT_STORE_ID,
        currentStoreName: CURRENT_STORE_NAME,
        jobs,
        jobsWithMatch,
        addJob,
        toggleFavorite,
        toggleJobStatus,
        applications,
        storeApplications,
        addApplication,
        updateApplicationStatus,
        respondInterview,
        resume,
        updateResume,
        messages,
        markAllRead,
        markChatRead,
        chatHistories,
        getChatHistory,
        addChatMessage,
        sendInterviewInvite,
        computeJobMatch,
        getStoreChatId,
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

export { getStoreChatId, CURRENT_STORE_ID, CURRENT_STORE_NAME, methodLabelMap };
