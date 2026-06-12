import React from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import Avatar from '@/components/Avatar';
import StatusTag from '@/components/StatusTag';
import { useApp } from '@/store/AppContext';
import type { Candidate } from '@/types';
import { candidateStatusLabels } from '@/data/candidates';
import styles from './index.module.scss';
import classnames from 'classnames';

interface CandidateCardProps {
  candidate: Candidate;
  onView?: (id: string) => void;
  onInterview?: (id: string) => void;
}

const CandidateCard: React.FC<CandidateCardProps> = ({
  candidate,
  onView,
  onInterview,
}) => {
  const { getStoreChatId, currentStoreId } = useApp();
  const statusLabel = candidateStatusLabels[candidate.status];

  const handleView = () => {
    Taro.navigateTo({
      url: `/pages/candidate-detail/index?id=${candidate.id}`,
    });
    onView?.(candidate.id);
  };

  const handleInterview = (e: any) => {
    e.stopPropagation?.();
    Taro.showToast({
      title: '已发送面试邀约',
      icon: 'success',
    });
    onInterview?.(candidate.id);
  };

  const handleChat = (e: any) => {
    e.stopPropagation?.();
    const chatId = getStoreChatId(currentStoreId);
    Taro.navigateTo({
      url: `/pages/chat-detail/index?id=${chatId}&name=${encodeURIComponent(candidate.name)}&storeId=${chatId}`,
    });
  };

  return (
    <View className={styles.candidateCard} onClick={handleView}>
      <View className={styles.candidateCardHeader}>
        <Avatar src={candidate.avatar} size="lg" />
        <View className={styles.candidateCardInfo}>
          <View className={styles.candidateCardNameRow}>
            <Text className={styles.candidateCardName}>{candidate.name}</Text>
            <StatusTag
              status={candidate.status as any}
              label={statusLabel.label}
            />
          </View>
          <Text className={styles.candidateCardBasic}>
            {candidate.gender === 'male' ? '男' : '女'} · {candidate.age}岁 ·{' '}
            {candidate.experience}
          </Text>
          <View className={styles.candidateCardSalary}>
            期望薪资：{candidate.expectedSalary}
          </View>
          <View className={styles.candidateCardAvailable}>
            可上班时间：{candidate.availableTime}
          </View>
          <View className={styles.candidateCardTags}>
            {candidate.tags.map((tag, idx) => (
              <View
                key={idx}
                className={classnames(
                  styles.candidateCardTag,
                  idx === 0 && styles.candidateCardTagPrimary,
                  idx > 2 && styles.candidateCardTagSuccess
                )}
              >
                {tag}
              </View>
            ))}
          </View>
        </View>
      </View>

      <View className={styles.candidateCardFooter}>
        <Text className={styles.candidateCardAppliedJob}>
          应聘：{candidate.appliedJob}
        </Text>
        <Text className={styles.candidateCardAppliedTime}>
          {candidate.appliedAt}
        </Text>
      </View>

      {(candidate.status === 'pending' ||
        candidate.status === 'viewed' ||
        candidate.status === 'interview') && (
        <View className={styles.candidateCardActions}>
          <View
            className={classnames(
              styles.candidateCardActionBtn,
              styles.candidateCardActionBtnOutline
            )}
            onClick={handleChat}
          >
            发起聊天
          </View>
          <View
            className={classnames(
              styles.candidateCardActionBtn,
              styles.candidateCardActionBtnPrimary
            )}
            onClick={handleInterview}
          >
            发起面试
          </View>
        </View>
      )}
    </View>
  );
};

export default CandidateCard;
