import React from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { usePullDownRefresh } from '@tarojs/taro';
import { useApp } from '@/store/AppContext';
import Avatar from '@/components/Avatar';
import EmptyState from '@/components/EmptyState';
import classnames from 'classnames';
import styles from './index.module.scss';

const weekDays = ['一', '二', '三', '四', '五', '六', '日'];

const menuItems = [
  { icon: '⭐', label: '我的收藏', badge: '', action: 'favorites' },
  { icon: '📄', label: '求职反馈', badge: '1', action: 'feedback' },
  { icon: '📋', label: '浏览记录', badge: '', action: 'history' },
  { icon: '🛡️', label: '隐私设置', badge: '', action: 'privacy' },
  { icon: '❓', label: '帮助中心', badge: '', action: 'help' },
  { icon: '⚙️', label: '设置', badge: '', action: 'settings' },
];

const ResumePage: React.FC = () => {
  const { resume, jobs } = useApp();
  const expiringCerts = resume.certificates.filter((c) => c.isExpiring);
  const favoriteJobs = jobs.filter((j) => j.isFavorite);

  const handleEdit = () => {
    Taro.navigateTo({ url: '/pages/edit-resume/index' });
  };

  const handleMenuAction = (_action: string) => {
    Taro.showToast({ title: '功能开发中', icon: 'none' });
  };

  const handleAddCert = () => {
    Taro.navigateTo({ url: '/pages/edit-resume/index' });
  };

  usePullDownRefresh(() => {
    setTimeout(() => {
      Taro.stopPullDownRefresh();
    }, 800);
  });

  return (
    <View className={styles.page}>
      {expiringCerts.length > 0 && (
        <View className={styles.expiringBanner}>
          <Text className={styles.expiringBannerBannerIcon}>⚠️</Text>
          <Text className={styles.expiringBannerBannerText}>
            您有{expiringCerts.length}个证书即将到期
          </Text>
          <Text
            className={styles.expiringBannerBannerAction}
            onClick={handleEdit}
          >
            查看
          </Text>
        </View>
      )}

      <View className={styles.profileCard}>
        <Avatar src={resume.avatar} size="xl" />
        <View className={styles.profileCardProfileInfo}>
          <View className={styles.profileCardProfileName}>{resume.name}</View>
          <View className={styles.profileCardProfileDesc}>
            {resume.gender === 'male' ? '男' : '女'} · {resume.age}岁 ·{' '}
            {resume.experience}经验 · {resume.education}
          </View>
          <View className={styles.profileCardProfileBadge}>
            期望 {resume.expectedPosition} · {resume.expectedSalary}
          </View>
        </View>
        <View className={styles.profileCardEditBtn} onClick={handleEdit}>
          编辑
        </View>
      </View>

      <ScrollView scrollY>
        <View className={styles.sectionCard}>
          <View className={styles.sectionTitle}>我的证书</View>
          {resume.certificates.length > 0 ? (
            resume.certificates.map((cert) => (
              <View key={cert.id} className={styles.certItem}>
                <View className={styles.certItemCertInfo}>
                  <View className={styles.certItemCertName}>{cert.name}</View>
                  <View className={styles.certItemCertDate}>
                    有效期至 {cert.expireDate}
                  </View>
                </View>
                {cert.isExpiring ? (
                  <View className={styles.certItemCertWarning}>即将到期</View>
                ) : (
                  <View className={styles.certItemCertNormal}>有效</View>
                )}
              </View>
            ))
          ) : (
            <EmptyState icon="📜" title="暂无证书" desc="添加证书可提高求职成功率" />
          )}
          <View className={styles.addBtn} onClick={handleAddCert} style={{ marginTop: 16 }}>
            + 添加新证书
          </View>
        </View>

        <View className={styles.sectionCard}>
          <View className={styles.sectionTitle}>可上班时间</View>
          <View className={styles.timeGrid}>
            {weekDays.map((day, idx) => {
              const time = resume.availableTime[idx];
              const isAvailable =
                time &&
                time.periods.length > 0 &&
                !time.periods.includes('休息');
              return (
                <View
                  key={day}
                  className={classnames(
                    styles.timeGridTimeDay,
                    isAvailable && styles.timeGridTimeDayAvailable
                  )}
                >
                  周{day}
                </View>
              );
            })}
          </View>
          <View
            style={{
              marginTop: 16,
              fontSize: 24,
              color: '#86909C',
              textAlign: 'center',
            }}
          >
            {resume.availableTime.map((t) => {
              if (t.periods.includes('休息')) return null;
              return `${t.day}(${t.periods.join('/')}) `;
            })}
          </View>
        </View>

        {favoriteJobs.length > 0 && (
          <View className={styles.sectionCard}>
            <View className={styles.sectionTitle}>我的收藏 ({favoriteJobs.length})</View>
            <View
              style={{
                fontSize: 24,
                color: '#86909C',
                textAlign: 'center',
                padding: 32,
              }}
            >
              共收藏 {favoriteJobs.length} 个职位，可在职位列表查看详情
            </View>
          </View>
        )}

        <View className={styles.menuList}>
          {menuItems.map((item) => (
            <View
              key={item.action}
              className={styles.menuListMenuItem}
              onClick={() => handleMenuAction(item.action)}
            >
              <View className={styles.menuListMenuIcon}>{item.icon}</View>
              <View className={styles.menuListMenuLabel}>{item.label}</View>
              {item.badge && (
                <View className={styles.menuListMenuBadge}>{item.badge}</View>
              )}
              <View className={styles.menuListMenuArrow}>›</View>
            </View>
          ))}
        </View>

        <View
          style={{
            textAlign: 'center',
            padding: 32,
            color: '#C9CDD4',
            fontSize: 22,
          }}
        >
          快招 v1.0.0
        </View>
      </ScrollView>
    </View>
  );
};

export default ResumePage;
