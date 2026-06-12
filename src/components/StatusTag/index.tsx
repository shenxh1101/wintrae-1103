import React from 'react';
import { View } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';

type StatusType = 'applied' | 'viewed' | 'interview' | 'hired' | 'rejected' | 'pending';

interface StatusTagProps {
  status: StatusType;
  label: string;
  className?: string;
}

const StatusTag: React.FC<StatusTagProps> = ({ status, label, className }) => {
  return (
    <View
      className={classnames(
        styles.statusTag,
        styles[`statusTag${status.charAt(0).toUpperCase() + status.slice(1)}`],
        className
      )}
    >
      {label}
    </View>
  );
};

export default StatusTag;
