import React, { useState } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { usePullDownRefresh } from '@tarojs/taro';
import MessageItem from '@/components/MessageItem';
import EmptyState from '@/components/EmptyState';
import { useApp, methodLabelMap } from '@/store/AppContext';
import type { Message } from '@/types';
import styles from './index.module.scss';
import classnames from 'classnames';

const MessagesPage: React.FC = () => {
  const { messages, markAllRead, markChatRead, getStoreChatId, respondInterview } = useApp();
  const [, forceUpdate] = useState(0);

  const unreadTotal = messages.reduce((sum, m) => sum + m.unread, 0);

  const chatMessages = messages.filter((m) => m.type === 'chat');
  const systemMessages = messages.filter((m) => m.type !== 'chat');

  const handleMessageClick = (msg: Message) => {
    if (msg.type === 'chat' && msg.storeId) {
      markChatRead(msg.storeId);
      const chatId = getStoreChatId(msg.storeId);
      Taro.navigateTo({
        url: `/pages/chat-detail/index?id=${chatId}&name=${encodeURIComponent(msg.title)}&storeId=${chatId}`,
      });
    } else if (msg.type === 'interview' && msg.storeId) {
      const chatId = getStoreChatId(msg.storeId);
      Taro.navigateTo({
        url: `/pages/chat-detail/index?id=${chatId}&name=${encodeURIComponent(msg.title)}&storeId=${chatId}&applicationId=${msg.applicationId || ''}`,
      });
    } else {
      Taro.showToast({ title: '消息详情', icon: 'none' });
    }
  };

  const handleInterviewRespond = (msg: Message, accepted: boolean) => {
    if (msg.applicationId) {
      respondInterview(msg.applicationId, accepted ? 'accepted' : 'rejected');
    }
    forceUpdate((x) => x + 1);
    Taro.showToast({
      title: accepted ? '已接受面试' : '已婉拒',
      icon: 'success',
    });
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
              <View key={msg.id}>
                <MessageItem
                  message={msg}
                  onClick={() => handleMessageClick(msg)}
                />
                {msg.type === 'interview' && msg.interviewInfo && !msg.interviewInfo.result && (
                  <View
                    style={{
                      padding: '0 32rpx 24rpx',
                      marginTop: -8,
                      display: 'flex',
                      gap: 16,
                      justifyContent: 'flex-end',
                    }}
                  >
                    <View
                      onClick={(e) => {
                        e.stopPropagation?.();
                        handleInterviewRespond(msg, false);
                      }}
                      style={{
                        padding: '16rpx 40rpx',
                        background: '#F2F3F5',
                        color: '#4E5969',
                        borderRadius: 40,
                        fontSize: 26,
                        fontWeight: 500,
                      }}
                    >
                      婉拒
                    </View>
                    <View
                      onClick={(e) => {
                        e.stopPropagation?.();
                        handleInterviewRespond(msg, true);
                      }}
                      style={{
                        padding: '16rpx 40rpx',
                        background: 'linear-gradient(135deg, #FF6B35 0%, #FF8A50 100%)',
                        color: '#fff',
                        borderRadius: 40,
                        fontSize: 26,
                        fontWeight: 600,
                      }}
                    >
                      接受
                    </View>
                  </View>
                )}
                {msg.type === 'interview' && msg.interviewInfo && msg.interviewInfo.result && (
                  <View
                    style={{
                      padding: '0 32rpx 24rpx',
                      marginTop: -8,
                      textAlign: 'right',
                      fontSize: 26,
                      color: msg.interviewInfo.result === 'accepted' ? '#00B42A' : '#F53F3F',
                      fontWeight: 500,
                    }}
                  >
                    {msg.interviewInfo.result === 'accepted' ? '✓ 已接受' : '✗ 已婉拒'}
                  </View>
                )}
              </View>
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
