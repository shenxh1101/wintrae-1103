import React, { useState } from 'react';
import { View, Input, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useApp } from '@/store/AppContext';
import classnames from 'classnames';
import styles from './index.module.scss';

const weekDays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
const periods = ['上午', '下午', '晚上'];

const EditResumePage: React.FC = () => {
  const { resume: globalResume, updateResume } = useApp();
  const [resume, setResume] = useState({ ...globalResume });
  const [timeSelection, setTimeSelection] = useState<Record<string, string[]>>(() => {
    const result: Record<string, string[]> = {};
    globalResume.availableTime.forEach((t) => {
      result[t.day] = [...t.periods];
    });
    weekDays.forEach((day) => {
      if (!result[day]) {
        result[day] = ['休息'];
      }
    });
    return result;
  });
  const [newCertName, setNewCertName] = useState('');

  const toggleTime = (day: string, period: string) => {
    setTimeSelection((prev) => {
      const current = prev[day] || [];
      if (period === '休息') {
        return { ...prev, [day]: ['休息'] };
      }
      const withoutRest = current.filter((p) => p !== '休息');
      const next = withoutRest.includes(period)
        ? withoutRest.filter((p) => p !== period)
        : [...withoutRest, period];
      return { ...prev, [day]: next.length > 0 ? next : ['休息'] };
    });
  };

  const handleAddCert = () => {
    const name = newCertName.trim();
    if (!name) {
      Taro.showToast({ title: '请输入证书名称', icon: 'none' });
      return;
    }
    const now = new Date();
    const expireDate = new Date(now);
    expireDate.setFullYear(expireDate.getFullYear() + 1);
    const newCert = {
      id: `cert${Date.now()}`,
      name,
      issueDate: now.toISOString().slice(0, 10),
      expireDate: expireDate.toISOString().slice(0, 10),
      isExpiring: false,
    };
    setResume((prev) => ({
      ...prev,
      certificates: [...prev.certificates, newCert],
    }));
    setNewCertName('');
    Taro.showToast({ title: '证书已添加', icon: 'success' });
  };

  const handleSave = () => {
    const availableTime = weekDays.map((day) => ({
      day,
      periods: timeSelection[day] || ['休息'],
    }));
    const saved = { ...resume, availableTime };
    updateResume(saved);
    Taro.showToast({ title: '保存成功', icon: 'success' });
    setTimeout(() => {
      Taro.navigateBack();
    }, 800);
  };

  const handleChangeAvatar = () => {
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
        <View style={{ display: 'flex', gap: 16, marginTop: 16, alignItems: 'center' }}>
          <Input
            style={{
              flex: 1,
              height: 72,
              padding: '0 24',
              background: '#F7F8FA',
              borderRadius: 12,
              fontSize: 28,
              color: '#1D2129',
            }}
            placeholder="输入证书名称"
            placeholderClass="input-placeholder"
            value={newCertName}
            onInput={(e) => setNewCertName(e.detail.value)}
            onConfirm={handleAddCert}
          />
          <View
            style={{
              padding: '12rpx 24rpx',
              background: '#FFF3EB',
              color: '#FF6B35',
              borderRadius: 12,
              fontSize: 28,
              fontWeight: 500,
              whiteSpace: 'nowrap',
            }}
            onClick={handleAddCert}
          >
            + 添加
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionSectionTitle}>可上班时间</View>
        <View className={styles.timeGrid}>
          {weekDays.map((day) => (
            <View key={day}>
              <View className={styles.timeGridTimeDay}>{day}</View>
              {periods.map((period) => {
                const currentPeriods = timeSelection[day] || ['休息'];
                const isRest = currentPeriods.includes('休息');
                const isActive = !isRest && currentPeriods.includes(period);
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
