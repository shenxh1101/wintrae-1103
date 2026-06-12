import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Input } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { usePullDownRefresh } from '@tarojs/taro';
import { useApp, methodLabelMap } from '@/store/AppContext';
import Avatar from '@/components/Avatar';
import CandidateCard from '@/components/CandidateCard';
import EmptyState from '@/components/EmptyState';
import { mockCandidates } from '@/data/candidates';
import type { Candidate, Application, ApplicationStatus, InterviewMethod } from '@/types';
import dayjs from 'dayjs';
import classnames from 'classnames';
import styles from './index.module.scss';

const candidateTabs = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '待查看' },
  { key: 'interview', label: '面试中' },
  { key: 'hired', label: '已录用' },
];

const quickActions = [
  { icon: '📝', label: '发布职位', action: 'publish' },
  { icon: '👥', label: '候选人', action: 'candidates' },
  { icon: '📊', label: '数据统计', action: 'stats' },
  { icon: '⚙️', label: '门店设置', action: 'settings' },
];

const interviewMethods: { key: InterviewMethod; label: string; icon: string }[] = [
  { key: 'onsite', label: '现场面试', icon: '🏢' },
  { key: 'phone', label: '语音面试', icon: '📞' },
  { key: 'video', label: '视频面试', icon: '📹' },
];

const StorePage: React.FC = () => {
  const {
    role,
    setRole,
    jobs,
    toggleJobStatus,
    storeApplications,
    updateApplicationStatus,
    sendInterviewInvite,
    currentStoreId,
  } = useApp();
  const [candidates] = useState<Candidate[]>(mockCandidates);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);
  const [interviewDialog, setInterviewDialog] = useState<{ appId: string; jobId: string } | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<InterviewMethod>('onsite');
  const [selectedTime, setSelectedTime] = useState('');

  const isStoreMode = role === 'store';

  const storeJobs = useMemo(
    () => jobs.filter((j) => j.storeId === currentStoreId),
    [jobs, currentStoreId]
  );

  const storeJobIds = useMemo(() => new Set(storeJobs.map((j) => j.id)), [storeJobs]);

  const jobAppCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    storeApplications.forEach((a) => {
      counts[a.jobId] = (counts[a.jobId] || 0) + 1;
    });
    return counts;
  }, [storeApplications]);

  const jobFunnel = useMemo(() => {
    const funnel: Record<string, { views: number; applies: number; interviews: number; hires: number }> = {};
    storeJobs.forEach((j) => {
      const apps = storeApplications.filter((a) => a.jobId === j.id);
      funnel[j.id] = {
        views: j.viewCount,
        applies: apps.length,
        interviews: apps.filter((a) => a.status === 'interview' || a.status === 'hired').length,
        hires: apps.filter((a) => a.status === 'hired').length,
      };
    });
    return funnel;
  }, [storeJobs, storeApplications]);

  const filteredCandidates = useMemo(() => {
    if (activeTab === 'all') return candidates;
    return candidates.filter((c) => c.status === activeTab);
  }, [candidates, activeTab]);

  const stats = useMemo(() => {
    const activeJobs = storeJobs.filter((j) => j.status === 'active');
    return {
      candidates: storeApplications.length,
      pending: storeApplications.filter((c) => c.status === 'applied' || c.status === 'viewed').length,
      hired: storeApplications.filter((c) => c.status === 'hired').length,
      jobs: activeJobs.length,
    };
  }, [storeApplications, storeJobs]);

  const handleRoleSwitch = () => {
    const newRole = role === 'store' ? 'jobseeker' : 'store';
    setRole(newRole);
    Taro.switchTab({
      url: newRole === 'store' ? '/pages/store/index' : '/pages/jobs/index',
    });
  };

  const handleQuickAction = (action: string) => {
    if (action === 'publish') {
      Taro.navigateTo({ url: '/pages/publish-job/index' });
    } else {
      Taro.showToast({ title: '功能开发中', icon: 'none' });
    }
  };

  const handleToggleJob = (jobId: string) => {
    toggleJobStatus(jobId);
    const job = storeJobs.find((j) => j.id === jobId);
    Taro.showToast({
      title: job?.status === 'active' ? '已暂停招聘' : '已重新开启',
      icon: 'success',
    });
  };

  const handleToggleExpand = (jobId: string) => {
    setExpandedJobId(expandedJobId === jobId ? null : jobId);
  };

  const handleAppStatus = (app: Application, status: ApplicationStatus) => {
    if (status === 'interview') {
      setInterviewDialog({ appId: app.id, jobId: app.jobId });
      const nextDay = dayjs().add(1, 'day').format('YYYY-MM-DD 10:00');
      setSelectedTime(nextDay);
      setSelectedMethod('onsite');
      return;
    }
    updateApplicationStatus(app.id, status);
    Taro.showToast({
      title:
        status === 'viewed'
          ? '已标为已查看'
          : status === 'hired'
          ? '已录用'
          : '已拒绝',
      icon: 'success',
    });
  };

  const confirmInterview = () => {
    if (!interviewDialog || !selectedTime) {
      Taro.showToast({ title: '请选择面试时间', icon: 'none' });
      return;
    }
    const job = storeJobs.find((j) => j.id === interviewDialog.jobId);
    if (!job) return;
    sendInterviewInvite(job.storeId, interviewDialog.appId, selectedMethod, selectedTime, job);
    setInterviewDialog(null);
    Taro.showToast({ title: '面试邀约已发送', icon: 'success' });
  };

  const jobApplications = useMemo(() => {
    if (!expandedJobId || !storeJobIds.has(expandedJobId)) return [];
    return storeApplications.filter((a) => a.jobId === expandedJobId);
  }, [storeApplications, expandedJobId, storeJobIds]);

  usePullDownRefresh(() => {
    setTimeout(() => {
      Taro.stopPullDownRefresh();
    }, 800);
  });

  if (!isStoreMode) {
    return (
      <View className={styles.page}>
        <View className={styles.roleSwitch}>
          <View className={styles.roleSwitchRoleInfo}>
            <View className={styles.roleSwitchRoleLabel}>当前身份</View>
            <View className={styles.roleSwitchRoleName}>求职者</View>
          </View>
          <View className={styles.roleSwitchSwitchBtn} onClick={handleRoleSwitch}>
            切换为门店端
          </View>
        </View>

        <View style={{ marginTop: 60, textAlign: 'center' }}>
          <EmptyState
            icon="🏪"
            title="门店管理中心"
            desc="切换为门店端身份后，可发布招聘、查看候选人、发起面试"
          />
          <View
            className={styles.publishBtn}
            onClick={handleRoleSwitch}
            style={{ margin: '0 32rpx' }}
          >
            切换为门店身份
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className={styles.page}>
      <View className={styles.roleSwitch}>
        <View className={styles.roleSwitchRoleInfo}>
          <View className={styles.roleSwitchRoleLabel}>门店端</View>
          <View className={styles.roleSwitchRoleName}>喜茶(万达店) 运营中</View>
        </View>
        <View className={styles.roleSwitchSwitchBtn} onClick={handleRoleSwitch}>
          切换身份
        </View>
      </View>

      <View className={styles.storeCard}>
        <Avatar src="https://picsum.photos/id/1080/200/200" size="xl" />
        <View className={styles.storeCardStoreInfo}>
          <View className={styles.storeCardStoreName}>喜茶(万达广场店)</View>
          <View className={styles.storeCardStoreType}>餐饮/奶茶 · 员工15人</View>
          <View className={styles.storeCardStoreStats}>
            <View className={styles.storeCardStoreStatItem}>
              <Text className={styles.storeCardStatNum}>{stats.jobs}</Text>在招
            </View>
            <View className={styles.storeCardStoreStatItem}>
              <Text className={styles.storeCardStatNum}>{stats.candidates}</Text>候选人
            </View>
            <View className={styles.storeCardStoreStatItem}>
              <Text className={styles.storeCardStatNum}>{stats.hired}</Text>已录用
            </View>
          </View>
        </View>
      </View>

      <View className={styles.quickActions}>
        {quickActions.map((action) => (
          <View
            key={action.action}
            className={styles.quickActionsActionItem}
            onClick={() => handleQuickAction(action.action)}
          >
            <View className={styles.quickActionsActionIcon}>{action.icon}</View>
            <View className={styles.quickActionsActionLabel}>{action.label}</View>
          </View>
        ))}
      </View>

      <View
        className={styles.publishBtn}
        onClick={() => {
          Taro.navigateTo({ url: '/pages/publish-job/index' });
        }}
      >
        + 发布新职位
      </View>

      <View className={styles.sectionHeader}>
        <Text className={styles.sectionHeaderSectionTitle}>在招职位</Text>
        <Text className={styles.sectionHeaderSectionMore}>管理全部</Text>
      </View>

      {storeJobs.map((job) => {
        const funnel = jobFunnel[job.id] || { views: 0, applies: 0, interviews: 0, hires: 0 };
        const applyRate = funnel.views > 0 ? Math.round((funnel.applies / funnel.views) * 100) : 0;
        const interviewRate = funnel.applies > 0 ? Math.round((funnel.interviews / funnel.applies) * 100) : 0;
        return (
          <View key={job.id} className={styles.jobManageCard}>
            <View className={styles.jobManageCardHeader} onClick={() => handleToggleExpand(job.id)}>
              <View className={styles.jobManageCardTitle}>
                <Text className={styles.jobManageCardTitleText}>{job.title}</Text>
                <View
                  className={classnames(
                    styles.jobManageCardBadge,
                    job.status === 'active'
                      ? styles.jobManageCardBadgeActive
                      : styles.jobManageCardBadgePaused
                  )}
                >
                  {job.status === 'active' ? '招聘中' : '已暂停'}
                </View>
              </View>
              <View className={styles.jobManageCardMeta}>
                {job.salary}元/月 · {job.shift}
              </View>
              <View className={styles.jobManageCardStats}>
                <View className={styles.jobManageCardStatItem}>
                  <Text className={styles.jobManageCardStatNum}>{funnel.views}</Text>
                  <Text className={styles.jobManageCardStatLabel}>浏览</Text>
                </View>
                <View className={styles.jobManageCardStatItem}>
                  <Text className={styles.jobManageCardStatNum}>{funnel.applies}</Text>
                  <Text className={styles.jobManageCardStatLabel}>投递</Text>
                </View>
                <View className={styles.jobManageCardStatItem}>
                  <Text className={styles.jobManageCardStatNum}>{funnel.interviews}</Text>
                  <Text className={styles.jobManageCardStatLabel}>面试</Text>
                </View>
                <View className={styles.jobManageCardStatItem}>
                  <Text className={styles.jobManageCardStatNum}>{funnel.hires}</Text>
                  <Text className={styles.jobManageCardStatLabel}>录用</Text>
                </View>
              </View>
              <View className={styles.jobManageCardRate}>
                <Text style={{ fontSize: 22, color: '#86909C' }}>
                  投递率 {applyRate}% · 面试率 {interviewRate}%
                </Text>
              </View>
              <Text className={styles.jobManageCardArrow}>
                {expandedJobId === job.id ? '▲' : '▼'}
              </Text>
            </View>

            {expandedJobId === job.id && (
              <View className={styles.jobManageCardActions}>
                <View
                  className={classnames(
                    styles.jobManageCardActionBtn,
                    job.status === 'active'
                      ? styles.jobManageCardActionBtnPause
                      : styles.jobManageCardActionBtnResume
                  )}
                  onClick={() => handleToggleJob(job.id)}
                >
                  {job.status === 'active' ? '⏸ 暂停招聘' : '▶ 重新开启'}
                </View>

                {jobApplications.length > 0 ? (
                  <View className={styles.jobManageCardApplicants}>
                    <Text className={styles.jobManageCardApplicantsTitle}>
                      投递记录 ({jobApplications.length})
                    </Text>
                    {jobApplications.map((app) => (
                      <View key={app.id} className={styles.jobManageCardApplicant}>
                        <View className={styles.jobManageCardApplicantInfo}>
                          <Text className={styles.jobManageCardApplicantName}>求职者</Text>
                          <Text className={styles.jobManageCardApplicantTime}>
                            {app.appliedAt}
                            {app.interviewAt && app.interviewMethod && (
                              <Text style={{ color: '#722ED1', marginLeft: 12 }}>
                                · {methodLabelMap[app.interviewMethod]} {app.interviewAt}
                              </Text>
                            )}
                          </Text>
                        </View>
                        <View className={styles.jobManageCardApplicantActions}>
                          {app.status === 'applied' && (
                            <>
                              <View
                                className={styles.jobManageCardMiniBtn}
                                onClick={() => handleAppStatus(app, 'viewed')}
                              >
                                查看
                              </View>
                              <View
                                className={styles.jobManageCardMiniBtnPrimary}
                                onClick={() => handleAppStatus(app, 'interview')}
                              >
                                邀面试
                              </View>
                            </>
                          )}
                          {app.status === 'viewed' && (
                            <>
                              <View
                                className={styles.jobManageCardMiniBtnPrimary}
                                onClick={() => handleAppStatus(app, 'interview')}
                              >
                                邀面试
                              </View>
                              <View
                                className={styles.jobManageCardMiniBtn}
                                onClick={() => handleAppStatus(app, 'rejected')}
                              >
                                拒绝
                              </View>
                            </>
                          )}
                          {app.status === 'interview' && (
                            <>
                              <Text
                                style={{
                                  fontSize: 24,
                                  color: '#722ED1',
                                  marginRight: 8,
                                }}
                              >
                                {app.interviewResult === 'accepted'
                                  ? '✓ 已接受'
                                  : app.interviewResult === 'rejected'
                                  ? '✗ 已婉拒'
                                  : '待确认'}
                              </Text>
                              <View
                                className={styles.jobManageCardMiniBtnPrimary}
                                onClick={() => handleAppStatus(app, 'hired')}
                              >
                                录用
                              </View>
                              <View
                                className={styles.jobManageCardMiniBtn}
                                onClick={() => handleAppStatus(app, 'rejected')}
                              >
                                拒绝
                              </View>
                            </>
                          )}
                          {app.status === 'hired' && (
                            <Text style={{ color: '#00B42A', fontSize: 24 }}>已录用</Text>
                          )}
                          {app.status === 'rejected' && (
                            <Text style={{ color: '#F53F3F', fontSize: 24 }}>已拒绝</Text>
                          )}
                        </View>
                      </View>
                    ))}
                  </View>
                ) : (
                  <View style={{ textAlign: 'center', padding: '32rpx 0', color: '#86909C', fontSize: 26 }}>
                    暂无候选人投递
                  </View>
                )}
              </View>
            )}
          </View>
        );
      })}

      {storeJobs.length === 0 && (
        <EmptyState icon="📝" title="暂无职位" desc="发布新职位开始招聘" />
      )}

      <View className={styles.sectionHeader}>
        <Text className={styles.sectionHeaderSectionTitle}>候选人</Text>
        <Text className={styles.sectionHeaderSectionMore}>查看全部</Text>
      </View>

      <View className={styles.tabs}>
        {candidateTabs.map((tab) => (
          <View
            key={tab.key}
            className={classnames(
              styles.tabsTab,
              activeTab === tab.key && styles.tabsTabActive
            )}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </View>
        ))}
      </View>

      <ScrollView scrollY>
        {filteredCandidates.length > 0 ? (
          filteredCandidates.map((candidate) => (
            <CandidateCard key={candidate.id} candidate={candidate} />
          ))
        ) : (
          <EmptyState
            icon="👥"
            title="暂无相关候选人"
            desc="发布职位后，候选人将主动投递"
          />
        )}
      </ScrollView>

      {interviewDialog && (
        <View
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onClick={() => setInterviewDialog(null)}
        >
          <View
            style={{
              width: 620,
              background: '#fff',
              borderRadius: 24,
              padding: 32,
            }}
            onClick={(e) => e.stopPropagation?.()}
          >
            <Text style={{ fontSize: 34, fontWeight: 600, color: '#1D2129' }}>邀约面试</Text>

            <Text style={{ fontSize: 28, color: '#4E5969', marginTop: 24, display: 'block' }}>
              面试方式
            </Text>
            <View style={{ display: 'flex', gap: 16, marginTop: 12 }}>
              {interviewMethods.map((m) => (
                <View
                  key={m.key}
                  onClick={() => setSelectedMethod(m.key)}
                  style={{
                    flex: 1,
                    padding: '20rpx 16rpx',
                    borderRadius: 16,
                    textAlign: 'center',
                    background: selectedMethod === m.key ? '#FFF3EB' : '#F2F3F5',
                    color: selectedMethod === m.key ? '#FF6B35' : '#4E5969',
                    border: selectedMethod === m.key ? '2rpx solid #FF6B35' : '2rpx solid transparent',
                    fontSize: 26,
                  }}
                >
                  {m.icon} {m.label}
                </View>
              ))}
            </View>

            <Text style={{ fontSize: 28, color: '#4E5969', marginTop: 24, display: 'block' }}>
              面试时间
            </Text>
            <Input
              placeholder="如 2026-06-15 10:00"
              placeholderClass="input-placeholder"
              value={selectedTime}
              onInput={(e) => setSelectedTime(e.detail.value)}
              style={{
                marginTop: 12,
                background: '#F2F3F5',
                borderRadius: 16,
                padding: '20rpx 24rpx',
                fontSize: 28,
                color: '#1D2129',
              }}
            />
            <Text style={{ fontSize: 22, color: '#86909C', marginTop: 8, display: 'block' }}>
              请按 YYYY-MM-DD HH:mm 格式填写
            </Text>

            <View style={{ display: 'flex', gap: 16, marginTop: 32 }}>
              <View
                style={{
                  flex: 1,
                  height: 80,
                  borderRadius: 40,
                  background: '#F2F3F5',
                  color: '#4E5969',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 30,
                  fontWeight: 500,
                }}
                onClick={() => setInterviewDialog(null)}
              >
                取消
              </View>
              <View
                style={{
                  flex: 1,
                  height: 80,
                  borderRadius: 40,
                  background: 'linear-gradient(135deg, #FF6B35 0%, #FF8A50 100%)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 30,
                  fontWeight: 500,
                }}
                onClick={confirmInterview}
              >
                发送邀约
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default StorePage;
