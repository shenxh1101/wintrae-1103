import React, { useState, useMemo } from 'react';
import { View, Text, Input, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { usePullDownRefresh } from '@tarojs/taro';
import JobCard from '@/components/JobCard';
import FilterBar, { FilterItem } from '@/components/FilterBar';
import EmptyState from '@/components/EmptyState';
import { mockJobs } from '@/data/jobs';
import type { Job } from '@/types';
import classnames from 'classnames';
import styles from './index.module.scss';

const quickTags = ['近3天发布', '急招', '包吃住', '高薪', '无需经验'];

const JobsPage: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [jobs, setJobs] = useState<Job[]>(mockJobs);
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});

  const filterItems: FilterItem[] = [
    { key: 'distance', label: activeFilters.distance ? `${activeFilters.distance}km内` : '距离', value: '3', hasArrow: true },
    { key: 'salary', label: '薪资', value: '5000-8000', hasArrow: true },
    { key: 'shift', label: '班次', value: 'morning', hasArrow: true },
    { key: 'board', label: '包吃', value: 'board' },
    { key: 'lodging', label: '包住', value: 'lodging' },
  ];

  const handleFilterChange = (key: string, value: string) => {
    console.log('[JobsPage] 筛选变更:', key, value);
    setActiveFilters((prev) => {
      const next = { ...prev };
      if (value) {
        next[key] = value;
      } else {
        delete next[key];
      }
      return next;
    });
  };

  const toggleTag = (tag: string) => {
    setActiveTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleFavorite = (jobId: string) => {
    setJobs((prev) =>
      prev.map((j) =>
        j.id === jobId ? { ...j, isFavorite: !j.isFavorite } : j
      )
    );
    const job = jobs.find((j) => j.id === jobId);
    Taro.showToast({
      title: job?.isFavorite ? '已取消收藏' : '已收藏',
      icon: 'success',
    });
  };

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      if (searchText && !job.title.includes(searchText) && !job.storeName.includes(searchText)) {
        return false;
      }
      if (activeFilters.board && !job.hasBoard) return false;
      if (activeFilters.lodging && !job.hasLodging) return false;
      if (activeFilters.distance) {
        const max = parseFloat(activeFilters.distance);
        if (job.distanceValue > max) return false;
      }
      if (activeTags.includes('包吃住') && !(job.hasBoard && job.hasLodging)) return false;
      if (activeTags.includes('高薪') && job.salaryMax < 6000) return false;
      return true;
    });
  }, [jobs, searchText, activeFilters, activeTags]);

  usePullDownRefresh(() => {
    console.log('[JobsPage] 下拉刷新');
    setTimeout(() => {
      Taro.stopPullDownRefresh();
    }, 800);
  });

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <View className={styles.headerLocation}>
          <Text>📍 本市</Text>
        </View>
        <View className={styles.headerSearch}>
          <Text className={styles.headerSearchIcon}>🔍</Text>
          <Input
            className={styles.headerSearchInput}
            placeholder="搜索职位或门店"
            placeholderClass="input-placeholder"
            value={searchText}
            onInput={(e) => setSearchText(e.detail.value)}
          />
        </View>
      </View>

      <FilterBar
        items={filterItems}
        activeKeys={activeFilters}
        onFilterChange={handleFilterChange}
      />

      <View className={styles.quickTags}>
        {quickTags.map((tag) => (
          <View
            key={tag}
            className={classnames(
              styles.quickTagsTag,
              activeTags.includes(tag) && styles.quickTagsTagActive
            )}
            onClick={() => toggleTag(tag)}
          >
            {tag}
          </View>
        ))}
      </View>

      <ScrollView scrollY className={styles.jobList}>
        {filteredJobs.length > 0 ? (
          filteredJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onFavorite={handleFavorite}
            />
          ))
        ) : (
          <EmptyState title="暂无匹配的职位" desc="试试调整筛选条件" />
        )}
      </ScrollView>
    </View>
  );
};

export default JobsPage;
