import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { usePullDownRefresh } from '@tarojs/taro';
import { useApp } from '@/store/AppContext';
import Avatar from '@/components/Avatar';
import CandidateCard from '@/components/CandidateCard';
import EmptyState from '@/components/EmptyState';
import { mockCandidates } from '@/data/candidates';
import type { Candidate, Application, ApplicationStatus } from '@/types';
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

const StorePage: React.FC = () => {
  const { role, setRole, jobs, toggleJobStatus, applications, updateApplicationStatus } = useApp();
  const [candidates] = useState<Candidate[]>(mockCandidates);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);

  const isStoreMode = role === 'store';

  const storeJobs = useMemo(() => jobs, [jobs]);

  const jobAppCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    applications.forEach((a) => {
      counts[a.jobId] = (counts[a.jobId] || 0) + 1;
    });
    return counts;
  }, [applications]);

  const filteredCandidates = useMemo(() => {
    if (activeTab === 'all') return candidates;
    return candidates.filter((c) => c.status === activeTab);
  }, [candidates, activeTab]);

  const stats = useMemo(() => {
    const activeJobs = storeJobs.filter((j) => j.status === 'active');
    return {
      candidates: candidates.length,
      pending: candidates.filter((c) => c.status === 'pending').length,
      hired: candidates.filter((c) => c.status === 'hired').length,
      jobs: activeJobs.length,
    };
  }, [candidates, storeJobs]);

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
    const job = jobs.find((j) => j.id === jobId);
    Taro.showToast({
      title: job?.status === 'active' ? '已暂停招聘' : '已重新开启',
      icon: 'success',
    });
  };

  const handleToggleExpand = (jobId: string) => {
    setExpandedJobId(expandedJobId === jobId ? null : jobId);
  };

  const handleAppStatus = (app: Application, status: ApplicationStatus) => {
    updateApplicationStatus(app.id, status);
    Taro.showToast({
      title: status === 'viewed' ? '已标为已查看' : status === 'interview' ? '已邀约面试' : status === 'hired' ? '已录用' : '已拒绝',
      icon: 'success',
    });
  };

  const jobApplications = useMemo(() => {
    if (!expandedJobId) return [];
    return applications.filter((a) => a.jobId === expandedJobId);
  }, [applications, expandedJobId]);

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
        <Avatar
          src="https://picsum.photos/id/1080/200/200"
          size="xl"
        />
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

      {storeJobs.map((job) => (
        <View key={job.id} className={styles.jobManageCard}>
          <View className={styles.jobManageCardHeader} onClick={() => handleToggleExpand(job.id)}>
            <View className={styles.jobManageCardTitle}>
              <Text className={styles.jobManageCardTitleText}>{job.title}</Text>
              <View
                className={classnames(
                  styles.jobManageCardBadge,
                  job.status === 'active' ? styles.jobManageCardBadgeActive : styles.jobManageCardBadgePaused
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
                <Text className={styles.jobManageCardStatNum}>{job.viewCount}</Text>
                <Text className={styles.jobManageCardStatLabel}>浏览</Text>
              </View>
              <View className={styles.jobManageCardStatItem}>
                <Text className={styles.jobManageCardStatNum}>{jobAppCounts[job.id] || job.applyCount}</Text>
                <Text className={styles.jobManageCardStatLabel}>投递</Text>
              </View>
              <View className={styles.jobManageCardStatItem}>
                <Text className={styles.jobManageCardStatNum}>{jobAppCounts[job.id] || 0}</Text>
                <Text className={styles.jobManageCardStatLabel}>候选人</Text>
              </View>
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
                  job.status === 'active' ? styles.jobManageCardActionBtnPause : styles.jobManageCardActionBtnResume
                )}
                onClick={() => handleToggleJob(job.id)}
              >
                {job.status === 'active' ? '⏸ 暂停招聘' : '▶ 重新开启'}
              </View>

              {jobApplications.length > 0 && (
                <View className={styles.jobManageCardApplicants}>
                  <Text className={styles.jobManageCardApplicantsTitle}>投递记录</Text>
                  {jobApplications.map((app) => (
                    <View key={app.id} className={styles.jobManageCardApplicant}>
                      <View className={styles.jobManageCardApplicantInfo}>
                        <Text className={styles.jobManageCardApplicantName}>求职者</Text>
                        <Text className={styles.jobManageCardApplicantTime}>{app.appliedAt}</Text>
                      </View>
                      <View className={styles.jobManageCardApplicantActions}>
                        {app.status === 'applied' && (
                          <>
                            <View className={styles.jobManageCardMiniBtn} onClick={() => handleAppStatus(app, 'viewed')}>查看</View>
                            <View className={styles.jobManageCardMiniBtnPrimary} onClick={() => handleAppStatus(app, 'interview')}>邀面试</View>
                          </>
                        )}
                        {app.status === 'viewed' && (
                          <>
                            <View className={styles.jobManageCardMiniBtnPrimary} onClick={() => handleAppStatus(app, 'interview')}>邀面试</View>
                            <View className={styles.jobManageCardMiniBtn} onClick={() => handleAppStatus(app, 'rejected')}>拒绝</View>
                          </>
                        )}
                        {app.status === 'interview' && (
                          <>
                            <View className={styles.jobManageCardMiniBtnPrimary} onClick={() => handleAppStatus(app, 'hired')}>录用</View>
                            <View className={styles.jobManageCardMiniBtn} onClick={() => handleAppStatus(app, 'rejected')}>拒绝</View>
                          </>
                        )}
                        {app.status === 'hired' && <Text style={{ color: '#00B42A', fontSize: 24 }}>已录用</Text>}
                        {app.status === 'rejected' && <Text style={{ color: '#F53F3F', fontSize: 24 }}>已拒绝</Text>}
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}
        </View>
      ))}

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
    </View>
  );
};

export default StorePage;
