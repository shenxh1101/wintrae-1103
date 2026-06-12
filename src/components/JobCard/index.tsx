import React from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import Avatar from '@/components/Avatar';
import type { Job } from '@/types';
import styles from './index.module.scss';

interface JobCardProps {
  job: Job;
  onFavorite?: (jobId: string) => void;
  onApply?: (jobId: string) => void;
}

const JobCard: React.FC<JobCardProps> = ({ job, onFavorite }) => {
  const handleTap = () => {
    Taro.navigateTo({ url: `/pages/job-detail/index?id=${job.id}` });
  };

  const handleFavorite = (e: any) => {
    e.stopPropagation?.();
    onFavorite?.(job.id);
  };

  const matchColor =
    job.matchScore && job.matchScore >= 80
      ? '#00B42A'
      : job.matchScore && job.matchScore >= 60
      ? '#FF7D00'
      : '#86909C';

  return (
    <View className={styles.jobCard} onClick={handleTap}>
      <View className={styles.jobCardHeader}>
        <Text className={styles.jobCardTitle}>{job.title}</Text>
        <View className={styles.jobCardFavorite} onClick={handleFavorite}>
          <Text
            className={classnames(
              styles.jobCardFavoriteIcon,
              job.isFavorite ? '♥' : '♡'
            )}
            style={{ color: job.isFavorite ? '#FF6B35' : '#86909C' }}
          >
            {job.isFavorite ? '♥' : '♡'}
          </Text>
        </View>
      </View>

      <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <View className={styles.jobCardSalary}>{job.salary}元/月</View>
        {typeof job.matchScore === 'number' && (
          <View className={styles.jobCardMatch} style={{ color: matchColor }}>
            匹配度 {job.matchScore}%
          </View>
        )}
      </View>

      <View className={styles.jobCardMeta}>
        <View className={styles.jobCardMetaItem}>📍 {job.distance}</View>
        <View className={styles.jobCardMetaItem}>🕐 {job.shift}</View>
        {job.hasBoard && (
          <View
            className={styles.jobCardMetaItem}
            style={{ color: '#00B42A' }}
          >
            🍚 包吃
          </View>
        )}
        {job.hasLodging && (
          <View
            className={styles.jobCardMetaItem}
            style={{ color: '#00B42A' }}
          >
            🏠 包住
          </View>
        )}
        {job.status === 'paused' && (
          <View className={styles.jobCardMetaItem} style={{ color: '#F53F3F' }}>
            已暂停
          </View>
        )}
      </View>

      <View className={styles.jobCardTags}>
        {job.tags.map((tag, idx) => (
          <View key={idx} className={styles.jobCardTag}>
            {tag}
          </View>
        ))}
      </View>

      <View className={styles.jobCardStore}>
        <Avatar src={job.storeAvatar} size="sm" />
        <View className={styles.jobCardStoreInfo}>
          <Text className={styles.jobCardStoreName}>{job.storeName}</Text>
          <Text className={styles.jobCardStoreAddress}>{job.address}</Text>
        </View>
        <View className={styles.jobCardStats}>
          {job.viewCount}浏览 · {job.applyCount}投递
        </View>
      </View>
    </View>
  );
};

export default JobCard;
