import React from 'react';
import { View, Text } from '@tarojs/components';
import StatusTag from '@/components/StatusTag';
import type { Application, TimelineEntry } from '@/types';
import { statusLabels } from '@/data/applications';
import styles from './index.module.scss';
import classnames from 'classnames';

interface ApplicationItemProps {
  application: Application;
  onClick?: () => void;
}

const statusColorMap: Record<string, string> = {
  applied: '#FF7D00',
  viewed: '#2E86DE',
  interview: '#722ED1',
  hired: '#00B42A',
  rejected: '#F53F3F',
};

const ApplicationItem: React.FC<ApplicationItemProps> = ({
  application,
  onClick,
}) => {
  const currentStatus = application.status;
  const statusLabel = statusLabels[currentStatus];

  const renderTimeline = () => {
    const entries: TimelineEntry[] = application.timeline || [];
    if (entries.length === 0) return null;

    return (
      <View className={styles.applicationItemTimeline}>
        {entries.map((entry, idx) => {
          const isLast = idx === entries.length - 1;
          const isCurrent = entry.status === currentStatus;
          const isRejected = entry.status === 'rejected';
          return (
            <View key={`${entry.status}-${idx}`} className={styles.applicationItemTimelineItem}>
              <View className={styles.applicationItemTimelineDotWrap}>
                <View
                  className={classnames(
                    styles.applicationItemTimelineDot,
                    isCurrent && styles.applicationItemTimelineDotCurrent,
                    isRejected && styles.applicationItemTimelineDotRejected
                  )}
                  style={!isCurrent && !isRejected ? { background: statusColorMap[entry.status] || '#00B42A' } : {}}
                />
                {!isLast && <View className={styles.applicationItemTimelineLine} />}
              </View>
              <View className={styles.applicationItemTimelineContent}>
                <View className={styles.applicationItemTimelineTitle}>
                  {entry.label}
                </View>
                {entry.time && (
                  <View className={styles.applicationItemTimelineTime}>
                    {entry.time}
                  </View>
                )}
              </View>
            </View>
          );
        })}

        {application.hasTrial && application.trialAt && (
          <View className={styles.applicationItemTimelineItem}>
            <View className={styles.applicationItemTimelineDotWrap}>
              <View className={classnames(styles.applicationItemTimelineDot)} style={{ background: '#FF7D00' }} />
            </View>
            <View className={styles.applicationItemTimelineContent}>
              <View className={styles.applicationItemTimelineTitle}>试岗安排</View>
              <View className={styles.applicationItemTimelineTime}>{application.trialAt}</View>
              <View className={styles.applicationItemTimelineNote}>请准时参加试岗</View>
            </View>
          </View>
        )}

        {currentStatus === 'rejected' && application.rejectedReason && (
          <View className={styles.applicationItemTimelineItem}>
            <View className={styles.applicationItemTimelineDotWrap}>
              <View className={styles.applicationItemTimelineDot} style={{ background: '#F53F3F' }} />
            </View>
            <View className={styles.applicationItemTimelineContent}>
              <View className={styles.applicationItemTimelineNote} style={{ color: '#F53F3F' }}>
                {application.rejectedReason}
              </View>
            </View>
          </View>
        )}
      </View>
    );
  };

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

      {renderTimeline()}

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
