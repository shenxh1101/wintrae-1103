import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';

interface EmptyStateProps {
  icon?: string;
  title: string;
  desc?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon = '📭',
  title,
  desc,
}) => {
  return (
    <View className={styles.emptyState}>
      <Text className={styles.emptyStateIcon}>{icon}</Text>
      <Text className={styles.emptyStateTitle}>{title}</Text>
      {desc && <Text className={styles.emptyStateDesc}>{desc}</Text>}
    </View>
  );
};

export default EmptyState;
