import React, { useState } from 'react';
import { View, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useRouter } from '@tarojs/taro';
import Avatar from '@/components/Avatar';
import { mockCandidates } from '@/data/candidates';
import type { Candidate } from '@/types';
import classnames from 'classnames';
import styles from './index.module.scss';

const CandidateDetailPage: React.FC = () => {
  const router = useRouter();
  const candidateId = router.params.id || 'cand001';
  const [candidate] = useState<Candidate>(
    mockCandidates.find((c) => c.id === candidateId) || mockCandidates[0]
  );

  const handleChat = () => {
    console.log('[CandidateDetail] 发起聊天:', candidate.id);
    Taro.navigateTo({
      url: `/pages/chat-detail/index?id=${candidate.id}&name=${encodeURIComponent(candidate.name)}`,
    });
  };

  const handleInterview = (type: 'voice' | 'video' | 'onsite') => {
    console.log('[CandidateDetail] 发起面试:', type, candidate.id);
    const typeText = { voice: '语音', video: '视频', onsite: '现场' }[type];
    Taro.showModal({
      title: `发起${typeText}面试`,
      content: `确定向${candidate.name}发起${typeText}面试邀约吗？`,
      confirmText: '确定',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          Taro.showToast({
            title: '面试邀约已发送',
            icon: 'success',
          });
        }
      },
    });
  };

  const handleHire = () => {
    console.log('[CandidateDetail] 录用:', candidate.id);
    Taro.showModal({
      title: '确认录用',
      content: `确定录用${candidate.name}吗？`,
      confirmText: '确认录用',
      cancelText: '取消',
      confirmColor: '#FF6B35',
      success: (res) => {
        if (res.confirm) {
          Taro.showToast({ title: '已发送录用通知', icon: 'success' });
        }
      },
    });
  };

  return (
    <View className={styles.page}>
      <View className={styles.headerCard}>
        <View className={styles.headerCardHeaderInfo}>
          <Avatar src={candidate.avatar} size="xl" />
          <View className={styles.headerCardHeaderDetail}>
            <View className={styles.headerCardHeaderName}>{candidate.name}</View>
            <View className={styles.headerCardHeaderMeta}>
              {candidate.gender === 'male' ? '男' : '女'} · {candidate.age}岁 ·{' '}
              {candidate.experience}
            </View>
            <View>
              <View className={styles.headerCardHeaderBadge}>
                应聘：{candidate.appliedJob}
              </View>
              <View className={styles.headerCardHeaderBadge}>
                期望 {candidate.expectedSalary}
              </View>
            </View>
          </View>
        </View>
      </View>

      <ScrollView scrollY>
        <View className={styles.section}>
          <View className={styles.sectionSectionTitle}>候选人标签</View>
          <View className={styles.tagsList}>
            {candidate.tags.map((tag, idx) => (
              <View
                key={idx}
                className={classnames(
                  styles.tagsListTag,
                  idx > 2 && styles.tagsListTagSuccess,
                  idx === 1 && styles.tagsListTagSecondary
                )}
              >
                {tag}
              </View>
            ))}
          </View>
        </View>

        <View className={styles.section}>
          <View className={styles.sectionSectionTitle}>基本信息</View>
          <View className={styles.infoRow}>
            <View className={styles.infoRowInfoLabel}>联系电话</View>
            <View className={styles.infoRowInfoValue}>
              {candidate.resume.phone}
            </View>
          </View>
          <View className={styles.infoRow}>
            <View className={styles.infoRowInfoLabel}>现居地</View>
            <View className={styles.infoRowInfoValue}>
              {candidate.resume.location}
            </View>
          </View>
          <View className={styles.infoRow}>
            <View className={styles.infoRowInfoLabel}>学历</View>
            <View className={styles.infoRowInfoValue}>
              {candidate.resume.education}
            </View>
          </View>
          <View className={styles.infoRow}>
            <View className={styles.infoRowInfoLabel}>可上班时间</View>
            <View className={styles.infoRowInfoValue}>
              {candidate.availableTime}
            </View>
          </View>
          <View className={styles.infoRow}>
            <View className={styles.infoRowInfoLabel}>投递时间</View>
            <View className={styles.infoRowInfoValue}>
              {candidate.appliedAt}
            </View>
          </View>
        </View>

        <View className={styles.section}>
          <View className={styles.sectionSectionTitle}>资格证书</View>
          {candidate.resume.certificates.length > 0 ? (
            candidate.resume.certificates.map((cert, idx) => (
              <View key={idx} className={styles.certItem}>
                <View>
                  <View className={styles.certItemCertName}>{cert.name}</View>
                  <View className={styles.certItemCertDate}>
                    有效期至 {cert.expireDate}
                  </View>
                </View>
                <View
                  className={classnames(
                    styles.certItemCertStatus,
                    cert.isExpiring
                      ? styles.certItemCertStatusExpiring
                      : styles.certItemCertStatusValid
                  )}
                >
                  {cert.isExpiring ? '即将到期' : '有效'}
                </View>
              </View>
            ))
          ) : (
            <View style={{ fontSize: 28, color: '#86909C' }}>暂无证书</View>
          )}
        </View>

        <View className={styles.section}>
          <View className={styles.sectionSectionTitle}>工作经历</View>
          {candidate.resume.workHistory.map((work) => (
            <View key={work.id} className={styles.workItem}>
              <View className={styles.workItemWorkCompany}>{work.company}</View>
              <View className={styles.workItemWorkPosition}>{work.position}</View>
              <View className={styles.workItemWorkPeriod}>
                {work.startDate} - {work.endDate}
              </View>
              <View className={styles.workItemWorkDesc}>{work.description}</View>
            </View>
          ))}
        </View>

        <View className={styles.section}>
          <View className={styles.sectionSectionTitle}>自我评价</View>
          <View className={styles.introText}>
            {candidate.resume.introduction}
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      <View className={styles.bottomBar}>
        <View
          className={classnames(
            styles.bottomBarActionBtn,
            styles.bottomBarActionBtnOutline
          )}
          onClick={handleChat}
        >
          聊天
        </View>
        <View
          className={classnames(
            styles.bottomBarActionBtn,
            styles.bottomBarActionBtnSecondary
          )}
          onClick={() => handleInterview('voice')}
        >
          📞 语音
        </View>
        <View
          className={classnames(
            styles.bottomBarActionBtn,
            styles.bottomBarActionBtnSecondary
          )}
          onClick={() => handleInterview('video')}
        >
          📹 视频
        </View>
        <View
          className={classnames(
            styles.bottomBarActionBtn,
            styles.bottomBarActionBtnPrimary
          )}
          onClick={handleHire}
        >
          录用
        </View>
      </View>
    </View>
  );
};

export default CandidateDetailPage;
