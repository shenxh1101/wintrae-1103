import React, { useState } from 'react';
import { View, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useRouter } from '@tarojs/taro';
import Avatar from '@/components/Avatar';
import { useApp } from '@/store/AppContext';
import styles from './index.module.scss';

const JobDetailPage: React.FC = () => {
  const router = useRouter();
  const jobId = router.params.id || 'job001';
  const { jobs, toggleFavorite, addApplication, applications } = useApp();
  const job = jobs.find((j) => j.id === jobId) || jobs[0];
  const [isFavorite, setIsFavorite] = useState(job.isFavorite);
  const alreadyApplied = applications.some((a) => a.jobId === jobId);

  const handleFavorite = () => {
    setIsFavorite(!isFavorite);
    toggleFavorite(jobId);
    Taro.showToast({
      title: isFavorite ? '已取消收藏' : '已收藏',
      icon: 'success',
    });
  };

  const handleApply = () => {
    if (alreadyApplied) {
      Taro.showToast({ title: '已投递过该职位', icon: 'none' });
      return;
    }
    const success = addApplication(job);
    if (success) {
      Taro.showToast({ title: '投递成功', icon: 'success' });
    } else {
      Taro.showToast({ title: '已投递过该职位', icon: 'none' });
    }
  };

  const handleChat = () => {
    Taro.navigateTo({
      url: `/pages/chat-detail/index?id=${jobId}&name=${encodeURIComponent(job.storeName)}&storeId=store_${job.id}`,
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
          style={alreadyApplied ? { background: '#C9CDD4', boxShadow: 'none' } : {}}
        >
          {alreadyApplied ? '已投递' : '立即投递'}
        </View>
      </View>
    </View>
  );
};

export default JobDetailPage;
