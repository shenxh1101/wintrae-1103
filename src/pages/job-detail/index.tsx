import React, { useState } from 'react';
import { View, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useRouter } from '@tarojs/taro';
import Avatar from '@/components/Avatar';
import { mockJobs } from '@/data/jobs';
import styles from './index.module.scss';

const JobDetailPage: React.FC = () => {
  const router = useRouter();
  const jobId = router.params.id || 'job001';
  const job = mockJobs.find((j) => j.id === jobId) || mockJobs[0];
  const [isFavorite, setIsFavorite] = useState(job.isFavorite);
  const [isApplied, setIsApplied] = useState(false);

  const handleFavorite = () => {
    console.log('[JobDetail] 收藏/取消收藏:', jobId);
    setIsFavorite(!isFavorite);
    Taro.showToast({
      title: isFavorite ? '已取消收藏' : '已收藏',
      icon: 'success',
    });
  };

  const handleApply = () => {
    console.log('[JobDetail] 投递简历:', jobId);
    if (isApplied) {
      Taro.showToast({ title: '已投递过该职位', icon: 'none' });
      return;
    }
    setIsApplied(true);
    Taro.showToast({ title: '投递成功', icon: 'success' });
  };

  const handleChat = () => {
    console.log('[JobDetail] 发起聊天:', job.storeName);
    Taro.navigateTo({
      url: `/pages/chat-detail/index?id=${jobId}&name=${encodeURIComponent(job.storeName)}`,
    });
  };

  return (
    <View className={styles.page}>
      <ScrollView scrollY>
        <View className={styles.headerCard}>
          <View className={styles.headerCardTitle}>{job.title}</View>
          <View className={styles.headerCardSalary}>{job.salary} 元/月</View>

          <View className={styles.headerCardMeta}>
            <View className={styles.headerCardMetaItem}>📍 {job.distance}</View>
            <View className={styles.headerCardMetaItem}>🕐 {job.shift}</View>
            {job.hasBoard && (
              <View
                className={styles.headerCardMetaItem}
                style={{ color: '#00B42A' }}
              >
                🍚 包吃
              </View>
            )}
            {job.hasLodging && (
              <View
                className={styles.headerCardMetaItem}
                style={{ color: '#00B42A' }}
              >
                🏠 包住
              </View>
            )}
          </View>

          <View className={styles.headerCardTags}>
            {job.tags.map((tag, idx) => (
              <View key={idx} className={styles.headerCardTag}>
                {tag}
              </View>
            ))}
          </View>
        </View>

        <View className={styles.sectionCard}>
          <View className={styles.sectionCardSectionTitle}>职位描述</View>
          <View className={styles.sectionCardSectionContent}>
            {job.description}
          </View>
        </View>

        <View className={styles.sectionCard}>
          <View className={styles.sectionCardSectionTitle}>任职要求</View>
          {job.requirements.map((req, idx) => (
            <View key={idx} className={styles.sectionCardListItem}>
              {req}
            </View>
          ))}
        </View>

        <View className={styles.sectionCard}>
          <View className={styles.sectionCardSectionTitle}>福利待遇</View>
          {job.benefits.map((b, idx) => (
            <View key={idx} className={styles.sectionCardListItem}>
              {b}
            </View>
          ))}
        </View>

        <View className={styles.storeCard}>
          <Avatar src={job.storeAvatar} size="xl" />
          <View className={styles.storeCardStoreInfo}>
            <View className={styles.storeCardStoreName}>{job.storeName}</View>
            <View className={styles.storeCardStoreType}>餐饮/服务业</View>
            <View className={styles.storeCardStoreAddress}>📍 {job.address}</View>
          </View>
          <View style={{ fontSize: 32, color: '#86909C' }}>›</View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      <View className={styles.bottomBar}>
        <View
          className={styles.bottomBarFavoriteBtn}
          onClick={handleFavorite}
          style={{ color: isFavorite ? '#FF6B35' : '#86909C' }}
        >
          {isFavorite ? '♥' : '♡'}
        </View>
        <View className={styles.bottomBarChatBtn} onClick={handleChat}>
          聊一聊
        </View>
        <View
          className={styles.bottomBarApplyBtn}
          onClick={handleApply}
          style={isApplied ? { background: '#C9CDD4', boxShadow: 'none' } : {}}
        >
          {isApplied ? '已投递' : '立即投递'}
        </View>
      </View>
    </View>
  );
};

export default JobDetailPage;
