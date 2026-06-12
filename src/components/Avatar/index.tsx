import React from 'react';
import { View, Image } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';

interface AvatarProps {
  src: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({ src, size = 'md', className }) => {
  return (
    <View
      className={classnames(
        styles.avatar,
        size === 'sm' && styles.avatarSm,
        size === 'lg' && styles.avatarLg,
        size === 'xl' && styles.avatarXl,
        className
      )}
    >
      <Image className={styles.avatarImg} src={src} mode="aspectFill" />
    </View>
  );
};

export default Avatar;
