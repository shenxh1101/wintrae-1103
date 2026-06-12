import React from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';

export interface FilterItem {
  key: string;
  label: string;
  value: string;
  hasArrow?: boolean;
}

interface FilterBarProps {
  items: FilterItem[];
  activeKeys: Record<string, string>;
  onFilterChange: (key: string, value: string) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({
  items,
  activeKeys,
  onFilterChange,
}) => {
  return (
    <ScrollView scrollX className={styles.filterBar}>
      {items.map((item) => (
        <View
          key={item.key}
          className={classnames(
            styles.filterBarItem,
            activeKeys[item.key] && styles.filterBarItemActive
          )}
          onClick={() => onFilterChange(item.key, activeKeys[item.key] ? '' : item.value)}
        >
          <Text>{item.label}</Text>
          {item.hasArrow && (
            <Text className={styles.filterBarArrow}>▼</Text>
          )}
        </View>
      ))}
    </ScrollView>
  );
};

export default FilterBar;
