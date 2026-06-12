import React, { useState } from 'react';
import { View, Text, Input, Textarea } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';

const shiftOptions = ['早班', '中班', '晚班', '两班倒', '弹性排班'];
const defaultTags = ['包吃', '包住', '月休4天', '环境好', '无需经验', '急招'];

const PublishJobPage: React.FC = () => {
  const [title, setTitle] = useState('');
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');
  const [selectedShifts, setSelectedShifts] = useState<string[]>([]);
  const [hasBoard, setHasBoard] = useState(false);
  const [hasLodging, setHasLodging] = useState(false);
  const [headcount, setHeadcount] = useState(1);
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  const toggleShift = (shift: string) => {
    setSelectedShifts((prev) =>
      prev.includes(shift)
        ? prev.filter((s) => s !== shift)
        : [...prev, shift]
    );
  };

  const addTag = () => {
    const tag = tagInput.trim();
    if (!tag) return;
    if (tags.includes(tag)) {
      Taro.showToast({ title: '标签已存在', icon: 'none' });
      return;
    }
    setTags((prev) => [...prev, tag]);
    setTagInput('');
  };

  const removeTag = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  };

  const addDefaultTag = (tag: string) => {
    if (tags.includes(tag)) return;
    setTags((prev) => [...prev, tag]);
  };

  const handlePublish = () => {
    if (!title.trim()) {
      Taro.showToast({ title: '请输入职位名称', icon: 'none' });
      return;
    }
    if (!salaryMin || !salaryMax) {
      Taro.showToast({ title: '请输入薪资范围', icon: 'none' });
      return;
    }
    console.log('[PublishJob] 发布职位:', {
      title,
      salary: `${salaryMin}-${salaryMax}`,
      shifts: selectedShifts,
      hasBoard,
      hasLodging,
      headcount,
      description,
      requirements,
      tags,
    });
    Taro.showToast({ title: '发布成功', icon: 'success' });
    setTimeout(() => {
      Taro.navigateBack();
    }, 1000);
  };

  return (
    <View className={styles.page}>
      <View className={styles.section}>
        <View className={styles.sectionSectionTitle}>基本信息</View>

        <View className={styles.formItem}>
          <View className={styles.formItemLabel}>
            <Text className={styles.formItemLabelRequired}>*</Text>职位名称
          </View>
          <View className={styles.formItemContent}>
            <Input
              className={styles.formItemInput}
              placeholder="如：奶茶店店员"
              placeholderClass="input-placeholder"
              value={title}
              onInput={(e) => setTitle(e.detail.value)}
            />
          </View>
        </View>

        <View className={styles.formItem}>
          <View className={styles.formItemLabel}>
            <Text className={styles.formItemLabelRequired}>*</Text>薪资范围
          </View>
          <View className={styles.formItemContent}>
            <View className={styles.salaryRange}>
              <Input
                className={styles.salaryRangeSalaryInput}
                type="number"
                placeholder="最低"
                placeholderClass="input-placeholder"
                value={salaryMin}
                onInput={(e) => setSalaryMin(e.detail.value)}
              />
              <Text style={{ color: '#86909C' }}>-</Text>
              <Input
                className={styles.salaryRangeSalaryInput}
                type="number"
                placeholder="最高"
                placeholderClass="input-placeholder"
                value={salaryMax}
                onInput={(e) => setSalaryMax(e.detail.value)}
              />
              <Text className={styles.salaryRangeSalaryUnit}>元/月</Text>
            </View>
          </View>
        </View>

        <View className={styles.formItem}>
          <View className={styles.formItemLabel}>招聘人数</View>
          <View className={styles.formItemContent}>
            <View className={styles.headcountRow}>
              <View
                className={styles.headcountRowHeadcountBtn}
                onClick={() =>
                  setHeadcount((prev) => Math.max(1, prev - 1))
                }
              >
                -
              </View>
              <View className={styles.headcountRowHeadcountNum}>
                {headcount}
              </View>
              <View
                className={styles.headcountRowHeadcountBtn}
                onClick={() => setHeadcount((prev) => prev + 1)}
              >
                +
              </View>
              <Text style={{ fontSize: 28, color: '#4E5969' }}>人</Text>
            </View>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionSectionTitle}>工作时间</View>
        <View className={styles.optionGrid}>
          {shiftOptions.map((shift) => (
            <View
              key={shift}
              className={classnames(
                styles.optionGridOptionItem,
                selectedShifts.includes(shift) &&
                  styles.optionGridOptionItemActive
              )}
              onClick={() => toggleShift(shift)}
            >
              {shift}
            </View>
          ))}
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionSectionTitle}>福利待遇</View>
        <View className={styles.switchRow}>
          <View className={styles.switchRowSwitchLabel}>包吃</View>
          <View
            className={classnames(
              styles.switchRowSwitch,
              hasBoard && styles.switchRowSwitchActive
            )}
            onClick={() => setHasBoard(!hasBoard)}
          >
            <View className={styles.switchRowSwitchDot} />
          </View>
        </View>
        <View className={styles.switchRow}>
          <View className={styles.switchRowSwitchLabel}>包住</View>
          <View
            className={classnames(
              styles.switchRowSwitch,
              hasLodging && styles.switchRowSwitchActive
            )}
            onClick={() => setHasLodging(!hasLodging)}
          >
            <View className={styles.switchRowSwitchDot} />
          </View>
        </View>

        <View style={{ marginTop: 16 }}>
          <Text style={{ fontSize: 28, color: '#4E5969', marginBottom: 8 }}>
            福利标签
          </Text>
          <View className={styles.optionGrid}>
            {defaultTags.map((tag) => (
              <View
                key={tag}
                className={classnames(
                  styles.optionGridOptionItem,
                  tags.includes(tag) && styles.optionGridOptionItemActive
                )}
                onClick={() => addDefaultTag(tag)}
              >
                + {tag}
              </View>
            ))}
          </View>
        </View>

        <View className={styles.tagInputRow}>
          <Input
            className={styles.tagInputRowTagInput}
            placeholder="自定义标签"
            placeholderClass="input-placeholder"
            value={tagInput}
            onInput={(e) => setTagInput(e.detail.value)}
            onConfirm={addTag}
          />
          <View className={styles.tagInputRowTagAddBtn} onClick={addTag}>
            添加
          </View>
        </View>

        {tags.length > 0 && (
          <View className={styles.tagsList}>
            {tags.map((tag) => (
              <View key={tag} className={styles.tagsListTagItem}>
                {tag}
                <Text
                  className={styles.tagsListTagRemove}
                  onClick={() => removeTag(tag)}
                >
                  ×
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>

      <View className={styles.section}>
        <View className={styles.sectionSectionTitle}>职位描述</View>
        <View className={styles.formItem} style={{ borderBottom: 'none' }}>
          <View className={styles.formItemContent}>
            <Textarea
              className={styles.formItemTextarea}
              placeholder="请详细描述岗位职责..."
              placeholderClass="input-placeholder"
              value={description}
              onInput={(e) => setDescription(e.detail.value)}
              maxlength={500}
            />
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionSectionTitle}>任职要求</View>
        <View className={styles.formItem} style={{ borderBottom: 'none' }}>
          <View className={styles.formItemContent}>
            <Textarea
              className={styles.formItemTextarea}
              placeholder="请填写任职要求，如年龄、经验、证书等..."
              placeholderClass="input-placeholder"
              value={requirements}
              onInput={(e) => setRequirements(e.detail.value)}
              maxlength={500}
            />
          </View>
        </View>
      </View>

      <View className={styles.publishBtn} onClick={handlePublish}>
        立即发布
      </View>
    </View>
  );
};

export default PublishJobPage;
