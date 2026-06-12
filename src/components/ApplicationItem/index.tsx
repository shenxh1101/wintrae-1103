import React from 'react';
import { View, Text } from '@tarojs/components';
import StatusTag from '@/components/StatusTag';
import type { Application } from '@/types';
import { statusLabels } from '@/data/applications';
import styles from './index.module.scss';
import classnames from 'classnames';

interface ApplicationItemProps {
  application: Application;
  onClick?: () => void;
}

const ApplicationItem: React.FC<ApplicationItemProps> = ({
  application,
  onClick,
}) => {
  const currentStatus = application.status;
  const statusLabel = statusLabels[currentStatus];

  const getTimelineData = () => {
    const timeline = [
      { key: 'applied', label: '投递成功', time: application.appliedAt, done: true },
      {
        key: 'viewed',
        label: '企业已查看',
        time: application.viewedAt || '',
        done: !!application.viewedAt,
      },
      {
        key: 'interview',
        label: '面试安排',
        time: application.interviewAt || '',
        done: !!application.interviewAt,
        note: application.interviewAt
          ? `面试时间：${application.interviewAt}`
          : '',
      },
      {
        key: 'hired',
        label: '录用通知',
        time: application.hiredAt || '',
        done: !!application.hiredAt,
        note: application.feedback,
      },
    ];

    if (currentStatus === 'rejected') {
      timeline.push({
        key: 'rejected',
        label: '未通过',
        time: application.rejectedAt || '',
        done: true,
        note: application.rejectedReason,
      });
    }

    if (application.hasTrial && application.trialAt) {
      timeline.push({
        key: 'trial',
        label: '试岗安排',
        time: application.trialAt,
        done: true,
        note: `请准时参加试岗`,
      });
    }

    return timeline;
  };

  const timeline = getTimelineData();

  return (
    <View className={styles.applicationItem} onClick={onClick}>
      <View className={styles.applicationItemHeader}>
        <View className={styles.applicationItemJobInfo}>
          <Text className={styles.applicationItemJobTitle}>
            {application.job.title}
          </Text>
          <Text className={styles.applicationItemSalary}>
            {application.job.salary}元/月
          </Text>
        </View>
        <StatusTag status={currentStatus as any} label={statusLabel.label} />
      </View>

      <View className={styles.applicationItemTimeline}>
        {timeline.map((item) => {
          const isCurrent = item.key === currentStatus;
          return (
            <View key={item.key} className={styles.applicationItemTimelineItem}>
              <View
                className={classnames(
                  styles.applicationItemTimelineDot,
                  item.done && styles.applicationItemTimelineDotDone,
                  isCurrent && styles.applicationItemTimelineDotCurrent
                )}
              />
              <View className={styles.applicationItemTimelineContent}>
                <View className={styles.applicationItemTimelineTitle}>
                  {item.label}
                </View>
                {item.time && (
                  <View className={styles.applicationItemTimelineTime}>
                    {item.time}
                  </View>
                )}
                {item.note && (
                  <View className={styles.applicationItemTimelineNote}>
                    {item.note}
                  </View>
                )}
              </View>
            </View>
          );
        })}
      </View>

      <View className={styles.applicationItemFooter}>
        <Text className={styles.applicationItemStoreName}>
          {application.job.storeName}
        </Text>
        <Text className={styles.applicationItemApplyTime}>
          投递于 {application.appliedAt}
        </Text>
      </View>
    </View>
  );
};

export default ApplicationItem;
