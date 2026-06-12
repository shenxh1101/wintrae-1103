import React, { useState, useMemo } from 'react';
import { View, Text, Input, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { usePullDownRefresh } from '@tarojs/taro';
import JobCard from '@/components/JobCard';
import FilterBar, { FilterItem } from '@/components/FilterBar';
import EmptyState from '@/components/EmptyState';
import { useApp } from '@/store/AppContext';
import { distanceOptions, salaryOptions, shiftOptions } from '@/data/jobs';
import classnames from 'classnames';
import styles from './index.module.scss';

const quickTags = ['近3天发布', '急招', '包吃住', '高薪', '无需经验'];

const sortOptions = [
  { key: 'default', label: '综合' },
  { key: 'distance', label: '离我最近' },
  { key: 'salary', label: '薪资最高' },
  { key: 'newest', label: '最新发布' },
];

const JobsPage: React.FC = () => {
  const { jobsWithMatch, toggleFavorite } = useApp();
  const [searchText, setSearchText] = useState('');
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [sortBy, setSortBy] = useState('default');

  const filterItems: FilterItem[] = [
    {
      key: 'distance',
      label: activeFilters.distance ? `${activeFilters.distance}km内` : '距离',
      value: activeFilters.distance || '3',
      hasArrow: true,
    },
    {
      key: 'salary',
      label: activeFilters.salary ? `≥${activeFilters.salary.split('-')[0]}` : '薪资',
      value: activeFilters.salary || '',
      hasArrow: true,
    },
    {
      key: 'shift',
      label: activeFilters.shift
        ? shiftOptions.find((o) => o.value === activeFilters.shift)?.label || '班次'
        : '班次',
      value: activeFilters.shift || '',
      hasArrow: true,
    },
    { key: 'hasBoard', label: '包吃', value: '1' },
    { key: 'hasLodging', label: '包住', value: '1' },
  ];

  const handleFilterChange = (key: string, value: string) => {
    if (key === 'distance' || key === 'salary' || key === 'shift') {
      const opts =
        key === 'distance' ? distanceOptions :
        key === 'salary' ? salaryOptions :
        shiftOptions;
      const currentIdx = opts.findIndex((o) => o.value === activeFilters[key]);
      const nextIdx = (currentIdx + 1) % opts.length;
      const nextVal = opts[nextIdx].value;
      setActiveFilters((prev) => {
        const next = { ...prev };
        if (nextVal) {
          next[key] = nextVal;
        } else {
          delete next[key];
        }
        return next;
      });
    } else {
      setActiveFilters((prev) => {
        const next = { ...prev };
        if (prev[key]) {
          delete next[key];
        } else {
          next[key] = value;
        }
        return next;
      });
    }
  };

  const toggleTag = (tag: string) => {
    setActiveTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleFavorite = (jobId: string) => {
    const job = jobsWithMatch.find((j) => j.id === jobId);
    Taro.showToast({
      title: job?.isFavorite ? '已取消收藏' : '已收藏',
      icon: 'success',
    });
    toggleFavorite(jobId);
  };

  const sortedAndFilteredJobs = useMemo(() => {
    const filtered = jobsWithMatch.filter((job) => {
      if (job.status === 'paused') return false;
      if (searchText && !job.title.includes(searchText) && !job.storeName.includes(searchText)) {
        return false;
      }
      if (activeFilters.hasBoard && !job.hasBoard) return false;
      if (activeFilters.hasLodging && !job.hasLodging) return false;
      if (activeFilters.distance) {
        const max = parseFloat(activeFilters.distance);
        if (job.distanceValue > max) return false;
      }
      if (activeFilters.salary) {
        const parts = activeFilters.salary.split('-');
        const salaryMinFilter = parseInt(parts[0], 10) || 0;
        const salaryMaxFilter = parts[1] ? parseInt(parts[1], 10) : Infinity;
        if (job.salaryMax < salaryMinFilter || job.salaryMin > salaryMaxFilter) return false;
      }
      if (activeFilters.shift && job.shiftType !== activeFilters.shift) return false;
      if (activeTags.includes('包吃住') && !(job.hasBoard && job.hasLodging)) return false;
      if (activeTags.includes('高薪') && job.salaryMax < 6000) return false;
      return true;
    });

    const sorted = [...filtered];
    switch (sortBy) {
      case 'distance':
        sorted.sort((a, b) => a.distanceValue - b.distanceValue);
        break;
      case 'salary':
        sorted.sort((a, b) => b.salaryMax - a.salaryMax);
        break;
      case 'newest':
        sorted.sort((a, b) => (b.publishedAtValue || 0) - (a.publishedAtValue || 0));
        break;
      case 'default':
      default:
        sorted.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
        break;
    }
    return sorted;
  }, [jobsWithMatch, searchText, activeFilters, activeTags, sortBy]);

  usePullDownRefresh(() => {
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

      <View className={styles.sortBar}>
        {sortOptions.map((opt) => (
          <View
            key={opt.key}
            className={classnames(
              styles.sortBarItem,
              sortBy === opt.key && styles.sortBarItemActive
            )}
            onClick={() => setSortBy(opt.key)}
          >
            {opt.label}
            {sortBy === opt.key && <Text className={styles.sortBarArrow}>↓</Text>}
          </View>
        ))}
      </View>

      <ScrollView scrollY className={styles.jobList}>
        {sortedAndFilteredJobs.length > 0 ? (
          sortedAndFilteredJobs.map((job) => (
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
