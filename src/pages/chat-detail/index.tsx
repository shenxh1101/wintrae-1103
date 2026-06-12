import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Input, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useRouter } from '@tarojs/taro';
import Avatar from '@/components/Avatar';
import { mockChatMessages, quickReplies } from '@/data/messages';
import { useApp } from '@/store/AppContext';
import type { ChatMessage } from '@/types';
import classnames from 'classnames';
import styles from './index.module.scss';

const ChatDetailPage: React.FC = () => {
  const router = useRouter();
  const storeName = router.params.name || '喜茶(万达店)';
  const storeId = router.params.storeId || '';
  const { markChatRead, chatHistories, addChatMessage } = useApp();

  const persisted = storeId ? (chatHistories[storeId] || []) : [];
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(
    persisted.length > 0 ? persisted : mockChatMessages
  );
  const [inputText, setInputText] = useState('');
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const scrollRef = useRef<any>(null);

  useEffect(() => {
    Taro.setNavigationBarTitle({ title: decodeURIComponent(storeName) });
    if (storeId) {
      markChatRead(storeId);
    }
  }, [storeName, storeId, markChatRead]);

  const persistMessage = (msg: ChatMessage) => {
    if (storeId) {
      addChatMessage(storeId, msg);
    }
  };

  const sendMessage = (content?: string) => {
    const text = content || inputText.trim();
    if (!text) return;

    const newMsg: ChatMessage = {
      id: `cm${Date.now()}`,
      senderId: 'user001',
      senderName: '我',
      senderAvatar: 'https://picsum.photos/id/177/200/200',
      content: text,
      type: 'text',
      time: new Date().toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      isMine: true,
    };

    setChatMessages((prev) => [...prev, newMsg]);
    persistMessage(newMsg);
    setInputText('');
    setShowQuickReplies(false);

    setTimeout(() => {
      const reply: ChatMessage = {
        id: `cm${Date.now() + 1}`,
        senderId: 'store001',
        senderName: decodeURIComponent(storeName),
        senderAvatar: 'https://picsum.photos/id/1080/200/200',
        content: '好的，我们收到您的消息了，稍后会尽快回复您。',
        type: 'text',
        time: new Date().toLocaleTimeString('zh-CN', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        isMine: false,
      };
      setChatMessages((prev) => [...prev, reply]);
      persistMessage(reply);
    }, 1200);
  };

  const handleVoice = () => {
    Taro.showToast({ title: '发起语音通话', icon: 'none' });
  };

  const handleVideo = () => {
    Taro.showToast({ title: '发起视频通话', icon: 'none' });
  };

  const handleInterviewInvite = () => {
    const inviteMsg: ChatMessage = {
      id: `invite${Date.now()}`,
      senderId: 'store001',
      senderName: decodeURIComponent(storeName),
      senderAvatar: 'https://picsum.photos/id/1080/200/200',
      content: '面试邀约',
      type: 'interview',
      time: new Date().toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      isMine: false,
    };
    setChatMessages((prev) => [...prev, inviteMsg]);
    persistMessage(inviteMsg);
  };

  return (
    <View className={styles.page}>
      <View className={styles.chatHeader}>
        <View className={styles.chatHeaderHeaderInfo}>
          <Avatar src="https://picsum.photos/id/1080/200/200" size="sm" />
          <Text className={styles.chatHeaderHeaderName}>{decodeURIComponent(storeName)}</Text>
        </View>
        <View className={styles.chatHeaderHeaderActions}>
          <View
            className={styles.chatHeaderHeaderAction}
            onClick={handleVoice}
          >
            📞
          </View>
          <View
            className={styles.chatHeaderHeaderAction}
            onClick={handleVideo}
          >
            📹
          </View>
        </View>
      </View>

      <ScrollView scrollY className={styles.chatContent} ref={scrollRef}>
        {chatMessages.map((msg, idx) => (
          <View key={msg.id}>
            {(idx === 0 || msg.time !== chatMessages[idx - 1].time) && (
              <View className={styles.messageWrapTime}>{msg.time}</View>
            )}
            <View
              className={classnames(
                styles.messageWrap,
                msg.isMine && styles.messageWrapMine
              )}
            >
              <View className={styles.messageWrapAvatar}>
                <Avatar src={msg.senderAvatar} size="sm" />
              </View>
              <View>
                <View
                  className={classnames(
                    styles.messageWrapBubble,
                    msg.isMine
                      ? styles.messageWrapBubbleMine
                      : styles.messageWrapBubbleOther
                  )}
                >
                  {msg.type === 'interview' ? (
                    <View>
                      <View
                        className={classnames(
                          styles.messageWrapBubble,
                          styles.messageWrapBubbleOther
                        )}
                      >
                        我们邀请您参加面试
                      </View>
                      <View className={styles.interviewCard}>
                        <View className={styles.interviewCardInterviewTitle}>
                          面试邀约 · {decodeURIComponent(storeName)}
                        </View>
                        <View className={styles.interviewCardInterviewInfo}>
                          时间：2026-06-14 10:00
                        </View>
                        <View className={styles.interviewCardInterviewInfo}>
                          地点：万达广场1楼108号
                        </View>
                        <View className={styles.interviewCardInterviewActions}>
                          <View
                            className={classnames(
                              styles.interviewCardInterviewBtn,
                              styles.interviewCardInterviewBtnReject
                            )}
                            onClick={() => {
                              Taro.showToast({ title: '已婉拒', icon: 'none' });
                            }}
                          >
                            婉拒
                          </View>
                          <View
                            className={classnames(
                              styles.interviewCardInterviewBtn,
                              styles.interviewCardInterviewBtnAccept
                            )}
                            onClick={() => {
                              Taro.showToast({
                                title: '已接受面试',
                                icon: 'success',
                              });
                            }}
                          >
                            接受
                          </View>
                        </View>
                      </View>
                    </View>
                  ) : (
                    msg.content
                  )}
                </View>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      {showQuickReplies && (
        <ScrollView scrollX className={styles.quickReplies}>
          {quickReplies.map((reply, idx) => (
            <View
              key={idx}
              className={styles.quickRepliesQuickItem}
              onClick={() => sendMessage(reply)}
            >
              {reply}
            </View>
          ))}
        </ScrollView>
      )}

      <View className={styles.inputBar}>
        <View
          className={styles.inputBarActionBtn}
          onClick={handleInterviewInvite}
        >
          📅
        </View>
        <View className={styles.inputBarInputWrap}>
          <Input
            className={styles.inputBarInput}
            placeholder="输入消息..."
            placeholderClass="input-placeholder"
            value={inputText}
            onInput={(e) => setInputText(e.detail.value)}
            onConfirm={() => sendMessage()}
          />
        </View>
        {inputText.trim() ? (
          <View className={styles.inputBarSendBtn} onClick={() => sendMessage()}>
            发送
          </View>
        ) : (
          <View className={styles.inputBarActionBtn}>😊</View>
        )}
      </View>
    </View>
  );
};

export default ChatDetailPage;
