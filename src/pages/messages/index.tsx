import React from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { usePullDownRefresh } from '@tarojs/taro';
import MessageItem from '@/components/MessageItem';
import EmptyState from '@/components/EmptyState';
import { useApp } from '@/store/AppContext';
import type { Message } from '@/types';
import styles from './index.module.scss';

const MessagesPage: React.FC = () => {
  const { messages, markAllRead, markChatRead } = useApp();

  const unreadTotal = messages.reduce((sum, m) => sum + m.unread, 0);

  const chatMessages = messages.filter((m) => m.type === 'chat');
  const systemMessages = messages.filter((m) => m.type !== 'chat');

  const handleMessageClick = (msg: Message) => {
    if (msg.type === 'chat' && msg.storeId) {
      markChatRead(msg.storeId);
      Taro.navigateTo({
        url: `/pages/chat-detail/index?id=&name=${encodeURIComponent(msg.title)}&storeId=${msg.storeId}`,
      });
    } else {
      Taro.showToast({ title: '消息详情', icon: 'none' });
    }
  };

  const handleMarkAllRead = () => {
    markAllRead();
    Taro.showToast({ title: '已全部标为已读', icon: 'success' });
  };

  usePullDownRefresh(() => {
    setTimeout(() => {
      Taro.stopPullDownRefresh();
    }, 800);
  });

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.headerTitle}>消息</Text>
        <View className={styles.headerActions}>
          <View
            className={styles.headerActionBtn}
            onClick={handleMarkAllRead}
          >
            ✅
          </View>
        </View>
      </View>

      {unreadTotal > 0 && (
        <View className={styles.noticeBar}>
          <Text className={styles.noticeBarIcon}>🔔</Text>
          <Text className={styles.noticeBarText}>
            您有 {unreadTotal} 条未读消息
          </Text>
        </View>
      )}

      <ScrollView scrollY className={styles.messageList}>
        {systemMessages.length > 0 && (
          <>
            <Text className={styles.sectionTitle}>通知</Text>
            {systemMessages.map((msg) => (
              <MessageItem
                key={msg.id}
                message={msg}
                onClick={() => handleMessageClick(msg)}
              />
            ))}
          </>
        )}

        {chatMessages.length > 0 && (
          <>
            <Text className={styles.sectionTitle}>聊天</Text>
            {chatMessages.map((msg) => (
              <MessageItem
                key={msg.id}
                message={msg}
                onClick={() => handleMessageClick(msg)}
              />
            ))}
          </>
        )}

        {messages.length === 0 && (
          <EmptyState icon="💬" title="暂无消息" desc="有新消息会第一时间通知您" />
        )}
      </ScrollView>
    </View>
  );
};

export default MessagesPage;
