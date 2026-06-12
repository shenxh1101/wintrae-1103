import React, { useState, useRef, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, Input } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useRouter } from '@tarojs/taro';
import Avatar from '@/components/Avatar';
import { useApp, methodLabelMap } from '@/store/AppContext';
import type { ChatMessage } from '@/types';
import classnames from 'classnames';
import styles from './index.module.scss';

const quickReplies = [
  '请问这个岗位还在招吗？',
  '我想了解一下薪资待遇',
  '工作时间是怎样安排的？',
  '包吃住吗？',
  '需要什么证件？',
  '什么时候可以安排面试？',
];

const storeReplies = [
  '在招的，可以先来面试看看',
  '薪资面议，包吃住',
  '有两班倒，早班9-18，晚班14-22',
  '包吃住，宿舍有空调WiFi',
  '健康证就行，没有我们可以协助办理',
  '明天下午方便吗？',
];

const ChatDetailPage: React.FC = () => {
  const router = useRouter();
  const name = router.params.name || '门店';
  const paramStoreId = router.params.storeId || router.params.id || 'store001';
  const applicationId = router.params.applicationId || '';
  const { getChatHistory, addChatMessage, getStoreChatId, role, respondInterview, applications } = useApp();
  const chatId = useMemo(() => getStoreChatId(paramStoreId), [paramStoreId, getStoreChatId]);
  const [inputText, setInputText] = useState('');
  const history = getChatHistory(chatId);
  const [, forceUpdate] = useState(0);
  const scrollRef = useRef<any>(null);

  const interviewMessages = useMemo(() => {
    return history.filter((m) => m.interviewInfo);
  }, [history]);

  const sendMessage = () => {
    if (!inputText.trim()) return;
    const msg: ChatMessage = {
      id: 'msg_' + Date.now(),
      role: role === 'store' ? 'store' : 'user',
      content: inputText,
      type: 'text',
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      read: false,
    };
    addChatMessage(chatId, msg);
    setInputText('');

    setTimeout(() => {
      const replies = role === 'store' ? storeReplies : quickReplies;
      const randomReply = replies[Math.floor(Math.random() * replies.length)];
      const reply: ChatMessage = {
        id: 'msg_' + Date.now() + '_r',
        role: role === 'store' ? 'user' : 'store',
        content: randomReply,
        type: 'text',
        time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
        read: false,
      };
      addChatMessage(chatId, reply);
      forceUpdate((x) => x + 1);
    }, 800);
  };

  const sendQuickReply = (reply: string) => {
    const msg: ChatMessage = {
      id: 'msg_' + Date.now(),
      role: role === 'store' ? 'store' : 'user',
      content: reply,
      type: 'text',
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      read: false,
    };
    addChatMessage(chatId, msg);
    forceUpdate((x) => x + 1);
  };

  const handleRespondInterview = (msgId: string, accept: boolean) => {
    if (applicationId) {
      respondInterview(applicationId, accept ? 'accepted' : 'rejected');
    } else {
      const match = applications.find((a) => a.storeId === chatId || a.jobId === chatId);
      if (match) respondInterview(match.id, accept ? 'accepted' : 'rejected');
    }
    const msgIndex = history.findIndex((m) => m.id === msgId);
    if (msgIndex >= 0 && history[msgIndex].interviewInfo) {
      history[msgIndex].interviewInfo = {
        ...history[msgIndex].interviewInfo!,
        result: accept ? 'accepted' : 'rejected',
      };
    }
    forceUpdate((x) => x + 1);
    Taro.showToast({
      title: accept ? '已接受面试' : '已婉拒',
      icon: 'success',
    });
  };

  useEffect(() => {
    forceUpdate((x) => x + 1);
  }, [chatId]);

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <Avatar src="https://picsum.photos/id/1080/200/200" size="md" />
        <View className={styles.headerStoreInfo}>
          <Text className={styles.headerStoreName}>{name}</Text>
          <Text className={styles.headerStoreStatus}>在线</Text>
        </View>
      </View>

      <ScrollView scrollY className={styles.chatList} scrollWithAnimation>
        <View className={styles.chatListSystemNotice}>
          你已与{name}开始聊天，请文明交流
        </View>

        {history.map((msg) => {
          const isMe = msg.role === (role === 'store' ? 'store' : 'user');
          return (
            <View
              key={msg.id}
              className={classnames(
                styles.chatListChatItem,
                isMe ? styles.chatListChatItemMe : styles.chatListChatItemOther
              )}
            >
              {!isMe && (
                <Avatar
                  src="https://picsum.photos/id/1080/200/200"
                  size="sm"
                />
              )}
              <View
                className={classnames(
                  styles.chatListMessage,
                  msg.type === 'interview' && styles.chatListInterviewMsg
                )}
              >
                {msg.type === 'interview' && msg.interviewInfo ? (
                  <View className={styles.chatListInterviewCard}>
                    <Text style={{ fontSize: 24, color: '#722ED1' }}>📅 面试邀约</Text>
                    <Text style={{ fontSize: 30, fontWeight: 600, color: '#1D2129', marginTop: 8 }}>
                      {methodLabelMap[msg.interviewInfo.method]}
                    </Text>
                    <Text style={{ fontSize: 26, color: '#4E5969', marginTop: 8 }}>
                      时间：{msg.interviewInfo.time}
                    </Text>
                    {msg.interviewInfo.result && (
                      <Text
                        style={{
                          marginTop: 16,
                          fontSize: 26,
                          color: msg.interviewInfo.result === 'accepted' ? '#00B42A' : '#F53F3F',
                          fontWeight: 500,
                        }}
                      >
                        {msg.interviewInfo.result === 'accepted' ? '✓ 已接受' : '✗ 已婉拒'}
                      </Text>
                    )}
                    {!msg.interviewInfo.result && msg.role === 'store' && role !== 'store' && (
                      <View style={{ display: 'flex', gap: 16, marginTop: 16 }}>
                        <View
                          className={styles.chatListInterviewRejectBtn}
                          onClick={() => handleRespondInterview(msg.id, false)}
                        >
                          婉拒
                        </View>
                        <View
                          className={styles.chatListInterviewAcceptBtn}
                          onClick={() => handleRespondInterview(msg.id, true)}
                        >
                          接受
                        </View>
                      </View>
                    )}
                    {!msg.interviewInfo.result && msg.role !== 'store' && role === 'store' && (
                      <Text style={{ marginTop: 16, fontSize: 26, color: '#86909C' }}>
                        等待对方确认
                      </Text>
                    )}
                  </View>
                ) : (
                  <Text className={styles.chatListMessageText}>{msg.content}</Text>
                )}
                <Text
                  className={classnames(
                    styles.chatListMessageTime,
                    isMe
                      ? styles.chatListMessageTimeRight
                      : styles.chatListMessageTimeLeft
                  )}
                >
                  {msg.time}
                </Text>
              </View>
              {isMe && (
                <Avatar src="https://picsum.photos/id/1005/200/200" size="sm" />
              )}
            </View>
          );
        })}
      </ScrollView>

      <View className={styles.quickReplies}>
        {(role === 'store' ? storeReplies : quickReplies).slice(0, 3).map((reply, idx) => (
          <View
            key={idx}
            className={styles.quickRepliesQuickReply}
            onClick={() => sendQuickReply(reply)}
          >
            {reply}
          </View>
        ))}
      </View>

      <View className={styles.inputBar}>
        <View className={styles.inputBarAction} onClick={() => {
          Taro.showToast({ title: '语音功能开发中', icon: 'none' });
        }}>🎙️</View>
        <Input
          className={styles.inputBarInput}
          placeholder="输入消息..."
          placeholderClass="input-placeholder"
          value={inputText}
          onInput={(e) => setInputText(e.detail.value)}
          onConfirm={sendMessage}
          confirmType="send"
        />
        <View
          className={classnames(
            styles.inputBarSendBtn,
            inputText.trim() && styles.inputBarSendBtnActive
          )}
          onClick={sendMessage}
        >
          发送
        </View>
      </View>
    </View>
  );
};

export default ChatDetailPage;
