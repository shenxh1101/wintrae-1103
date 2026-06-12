import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { usePullDownRefresh } from '@tarojs/taro';
import { useApp } from '@/store/AppContext';
import Avatar from '@/components/Avatar';
import CandidateCard from '@/components/CandidateCard';
import JobCard from '@/components/JobCard';
import EmptyState from '@/components/EmptyState';
import { mockCandidates } from '@/data/candidates';
import { mockJobs } from '@/data/jobs';
import type { Candidate, Job } from '@/types';
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
  const { role, setRole } = useApp();
  const [candidates] = useState<Candidate[]>(mockCandidates);
  const [jobs] = useState<Job[]>(mockJobs.slice(0, 3));
  const [activeTab, setActiveTab] = useState<string>('all');

  const isStoreMode = role === 'store';

  const filteredCandidates = useMemo(() => {
    if (activeTab === 'all') return candidates;
    return candidates.filter((c) => c.status === activeTab);
  }, [candidates, activeTab]);

  const stats = useMemo(() => {
    return {
      candidates: candidates.length,
      pending: candidates.filter((c) => c.status === 'pending').length,
      hired: candidates.filter((c) => c.status === 'hired').length,
      jobs: jobs.length,
    };
  }, [candidates, jobs]);

  const handleRoleSwitch = () => {
    const newRole = role === 'store' ? 'jobseeker' : 'store';
    console.log('[StorePage] 切换角色:', newRole);
    setRole(newRole);
    Taro.switchTab({
      url: newRole === 'store' ? '/pages/store/index' : '/pages/jobs/index',
    });
  };

  const handleQuickAction = (action: string) => {
    console.log('[StorePage] 快捷操作:', action);
    if (action === 'publish') {
      Taro.navigateTo({ url: '/pages/publish-job/index' });
    } else {
      Taro.showToast({ title: '功能开发中', icon: 'none' });
    }
  };

  usePullDownRefresh(() => {
    console.log('[StorePage] 下拉刷新');
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
          console.log('[StorePage] 发布职位');
          Taro.navigateTo({ url: '/pages/publish-job/index' });
        }}
      >
        + 发布新职位
      </View>

      <View className={styles.sectionHeader}>
        <Text className={styles.sectionHeaderSectionTitle}>在招职位</Text>
        <Text
          className={styles.sectionHeaderSectionMore}
          onClick={() => {
            console.log('[StorePage] 查看全部职位');
          }}
        >
          管理全部
        </Text>
      </View>
      {jobs.map((job) => (
        <JobCard key={job.id} job={job} />
      ))}

      <View className={styles.sectionHeader}>
        <Text className={styles.sectionHeaderSectionTitle}>候选人</Text>
        <Text
          className={styles.sectionHeaderSectionMore}
          onClick={() => {
            console.log('[StorePage] 查看全部候选人');
          }}
        >
          查看全部
        </Text>
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
