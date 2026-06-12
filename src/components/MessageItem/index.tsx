import React from 'react';
import { View, Text } from '@tarojs/components';
import Avatar from '@/components/Avatar';
import type { Message } from '@/types';
import styles from './index.module.scss';

interface MessageItemProps {
  message: Message;
  onClick?: () => void;
}

const typeTagMap: Record<string, { label: string; bg: string; color: string }> = {
  system: { label: '系统', bg: '#E8F3FC', color: '#2E86DE' },
  interview: { label: '面试', bg: 'rgba(114,46,209,0.1)', color: '#722ED1' },
  notification: { label: '提醒', bg: '#FFF3E8', color: '#FF7D00' },
};

const MessageItem: React.FC<MessageItemProps> = ({ message, onClick }) => {
  const typeTag = typeTagMap[message.type];

  return (
    <View className={styles.messageItem} onClick={onClick}>
      <View className={styles.messageItemAvatarWrap}>
        <Avatar src={message.avatar} />
        {message.unread > 0 && (
          <View className={styles.messageItemUnread}>
            {message.unread > 99 ? '99+' : message.unread}
          </View>
        )}
      </View>
      <View className={styles.messageItemContent}>
        <View className={styles.messageItemHeader}>
          <Text className={styles.messageItemTitle}>{message.title}</Text>
          <Text className={styles.messageItemTime}>{message.lastTime}</Text>
        </View>
        <View style={{ display: 'flex', alignItems: 'center' }}>
          {typeTag && (
            <View
              className={styles.messageItemTypeTag}
              style={{ background: typeTag.bg, color: typeTag.color }}
            >
              {typeTag.label}
            </View>
          )}
          <Text className={styles.messageItemPreview} numberOfLines={1}>
            {message.lastContent}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default MessageItem;
