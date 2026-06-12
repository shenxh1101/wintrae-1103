import React, { useState } from 'react';
import { View, Input, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { mockResume } from '@/data/resume';
import type { Resume } from '@/types';
import classnames from 'classnames';
import styles from './index.module.scss';

const weekDays = ['一', '二', '三', '四', '五', '六', '日'];
const periods = ['上午', '下午', '晚上'];

const EditResumePage: React.FC = () => {
  const [resume, setResume] = useState<Resume>(mockResume);
  const [timeSelection, setTimeSelection] = useState<Record<string, string[]>>(() => {
    const result: Record<string, string[]> = {};
    resume.availableTime.forEach((t) => {
      result[t.day] = t.periods;
    });
    return result;
  });

  const toggleTime = (day: string, period: string) => {
    setTimeSelection((prev) => {
      const current = prev[day] || [];
      const next = current.includes(period)
        ? current.filter((p) => p !== period)
        : [...current, period];
      return { ...prev, [day]: next.length > 0 ? next : ['休息'] };
    });
  };

  const handleSave = () => {
    console.log('[EditResume] 保存简历:', resume, timeSelection);
    Taro.showToast({ title: '保存成功', icon: 'success' });
    setTimeout(() => {
      Taro.navigateBack();
    }, 800);
  };

  const handleAddCert = () => {
    console.log('[EditResume] 添加证书');
    Taro.showToast({ title: '功能开发中', icon: 'none' });
  };

  const handleChangeAvatar = () => {
    console.log('[EditResume] 更换头像');
    Taro.showToast({ title: '选择头像', icon: 'none' });
  };

  return (
    <View className={styles.page}>
      <View className={styles.section}>
        <View className={styles.avatarRow}>
          <View className={styles.avatarRowAvatar} onClick={handleChangeAvatar}>
            <Image
              className={styles.avatarRowAvatarImg}
              src={resume.avatar}
              mode="aspectFill"
            />
          </View>
          <View className={styles.avatarRowAvatarInfo}>
            <View className={styles.avatarRowAvatarLabel}>点击更换头像</View>
            <View className={styles.avatarRowAvatarTip}>建议使用本人真实照片</View>
          </View>
          <View style={{ fontSize: 32, color: '#86909C' }}>›</View>
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionSectionTitle}>基本信息</View>
        <View className={styles.formItem}>
          <View className={styles.formItemLabel}>姓名</View>
          <Input
            className={styles.formItemInput}
            value={resume.name}
            onInput={(e) => setResume({ ...resume, name: e.detail.value })}
          />
        </View>
        <View className={styles.formItem}>
          <View className={styles.formItemLabel}>性别</View>
          <View className={styles.formItemValue}>
            {resume.gender === 'male' ? '男' : '女'}
          </View>
          <View className={styles.formItemArrow}>›</View>
        </View>
        <View className={styles.formItem}>
          <View className={styles.formItemLabel}>年龄</View>
          <View className={styles.formItemValue}>{resume.age}岁</View>
          <View className={styles.formItemArrow}>›</View>
        </View>
        <View className={styles.formItem}>
          <View className={styles.formItemLabel}>学历</View>
          <View className={styles.formItemValue}>{resume.education}</View>
          <View className={styles.formItemArrow}>›</View>
        </View>
        <View className={styles.formItem}>
          <View className={styles.formItemLabel}>工作经验</View>
          <View className={styles.formItemValue}>{resume.experience}</View>
          <View className={styles.formItemArrow}>›</View>
        </View>
        <View className={styles.formItem}>
          <View className={styles.formItemLabel}>联系电话</View>
          <View className={styles.formItemValue}>{resume.phone}</View>
        </View>
        <View className={styles.formItem}>
          <View className={styles.formItemLabel}>现居地</View>
          <View className={styles.formItemValue}>{resume.location}</View>
          <View className={styles.formItemArrow}>›</View>
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionSectionTitle}>求职意向</View>
        <View className={styles.formItem}>
          <View className={styles.formItemLabel}>期望职位</View>
          <Input
            className={styles.formItemInput}
            value={resume.expectedPosition}
            onInput={(e) =>
              setResume({ ...resume, expectedPosition: e.detail.value })
            }
          />
        </View>
        <View className={styles.formItem}>
          <View className={styles.formItemLabel}>期望薪资</View>
          <View className={styles.formItemValue}>{resume.expectedSalary}</View>
          <View className={styles.formItemArrow}>›</View>
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionSectionTitle}>我的证书</View>
        {resume.certificates.map((cert) => (
          <View key={cert.id} className={styles.certItem}>
            <View className={styles.certItemCertInfo}>
              <View className={styles.certItemCertName}>{cert.name}</View>
              <View className={styles.certItemCertDate}>
                有效期至 {cert.expireDate}
              </View>
            </View>
            {cert.isExpiring ? (
              <View className={styles.certItemCertExpiring}>即将到期</View>
            ) : (
              <View style={{ fontSize: 24, color: '#00B42A' }}>有效</View>
            )}
          </View>
        ))}
        <View className={styles.addBtn} onClick={handleAddCert}>
          + 添加证书
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionSectionTitle}>可上班时间</View>
        <View className={styles.timeGrid}>
          {weekDays.map((day) => (
            <View key={day}>
              <View className={styles.timeGridTimeDay}>周{day}</View>
              {periods.map((period) => {
                const isActive =
                  timeSelection[`周${day}`]?.includes(period) ||
                  timeSelection[day]?.includes(period);
                return (
                  <View
                    key={period}
                    className={classnames(
                      styles.timeGridTimePeriod,
                      isActive && styles.timeGridTimePeriodActive
                    )}
                    style={{ marginBottom: 8 }}
                    onClick={() => toggleTime(day, period)}
                  >
                    {period}
                  </View>
                );
              })}
            </View>
          ))}
        </View>
        <View
          style={{
            marginTop: 24,
            fontSize: 24,
            color: '#86909C',
            textAlign: 'center',
          }}
        >
          点击选择可上班的时间段
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionSectionTitle}>自我评价</View>
        <View
          style={{
            fontSize: 28,
            color: '#4E5969',
            lineHeight: 1.8,
          }}
        >
          {resume.introduction}
        </View>
      </View>

      <View className={styles.saveBtn} onClick={handleSave}>
        保存简历
      </View>
    </View>
  );
};

export default EditResumePage;
