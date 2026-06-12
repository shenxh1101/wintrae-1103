import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { usePullDownRefresh } from '@tarojs/taro';
import ApplicationItem from '@/components/ApplicationItem';
import EmptyState from '@/components/EmptyState';
import { useApp } from '@/store/AppContext';
import classnames from 'classnames';
import styles from './index.module.scss';

const tabs = [
  { key: 'all', label: '全部' },
  { key: 'applied', label: '已投递' },
  { key: 'interview', label: '面试中' },
  { key: 'hired', label: '已录用' },
  { key: 'rejected', label: '已拒绝' },
];

const ProgressPage: React.FC = () => {
  const { applications, respondInterview } = useApp();
  const [activeTab, setActiveTab] = useState<string>('all');

  const stats = useMemo(() => {
    return {
      total: applications.length,
      viewed: applications.filter((a) => a.status === 'viewed').length,
      interview: applications.filter((a) => a.status === 'interview').length,
      hired: applications.filter((a) => a.status === 'hired').length,
    };
  }, [applications]);

  const filteredApplications = useMemo(() => {
    if (activeTab === 'all') return applications;
    return applications.filter((a) => a.status === activeTab);
  }, [applications, activeTab]);

  const hasTrialSoon = applications.some(
    (a) => a.hasTrial && a.trialAt
  );

  usePullDownRefresh(() => {
    setTimeout(() => {
      Taro.stopPullDownRefresh();
    }, 800);
  });

  return (
    <View className={styles.page}>
      <View className={styles.statsBar}>
        <View className={styles.statsBarStatItem}>
          <View className={styles.statsBarStatNum}>{stats.total}</View>
          <View className={styles.statsBarStatLabel}>总投递</View>
        </View>
        <View className={styles.statsBarStatItem}>
          <View className={styles.statsBarStatNum}>{stats.viewed}</View>
          <View className={styles.statsBarStatLabel}>已查看</View>
        </View>
        <View className={styles.statsBarStatItem}>
          <View className={styles.statsBarStatNum}>{stats.interview}</View>
          <View className={styles.statsBarStatLabel}>面试中</View>
        </View>
        <View className={styles.statsBarStatItem}>
          <View className={styles.statsBarStatNum}>{stats.hired}</View>
          <View className={styles.statsBarStatLabel}>已录用</View>
        </View>
      </View>

      {hasTrialSoon && (
        <View className={styles.reminderCard}>
          <Text className={styles.reminderCardReminderIcon}>⏰</Text>
          <Text className={styles.reminderCardReminderText}>
            您有一场试岗安排在6月15日，请准时参加
          </Text>
          <Text
            className={styles.reminderCardReminderAction}
            onClick={() => {}}
          >
            查看
          </Text>
        </View>
      )}

      <View className={styles.tabs}>
        {tabs.map((tab) => (
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

      <ScrollView scrollY className={styles.appList}>
        {filteredApplications.length > 0 ? (
          filteredApplications.map((app) => (
            <ApplicationItem
              key={app.id}
              application={app}
              onRespondInterview={(accepted) => {
                respondInterview(app.id, accepted ? 'accepted' : 'rejected');
                Taro.showToast({
                  title: accepted ? '已接受面试' : '已婉拒',
                  icon: 'success',
                });
              }}
            />
          ))
        ) : (
          <EmptyState
            icon="📋"
            title="暂无相关记录"
            desc="快去投递心仪的职位吧"
          />
        )}
      </ScrollView>
    </View>
  );
};

export default ProgressPage;
