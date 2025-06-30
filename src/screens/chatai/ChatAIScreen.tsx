import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  ImageBackground,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView
} from 'react-native';
import { Chat, MessageType } from '@flyerhq/react-native-chat-ui';
import uuid from 'react-native-uuid';
import axios from 'axios';
import { useHeaderHeight } from '@react-navigation/elements';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../../apiConfig';

const BACKGROUND_IMAGE_URI = 'https://i.pinimg.com/736x/8c/98/99/8c989947181ebd4a5144b6bdda29851c.jpg';

const formatSmartDate = (timestamp: number): string => {
  const now = new Date();
  const date = new Date(timestamp);
  const diff = Math.floor((now.getTime() - date.getTime()) / (1000 * 3600 * 24));
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  if (diff < 7) return date.toLocaleDateString('en-US', { weekday: 'long' });
  return date.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
};

const DatePill = ({ date }: { date: string }) => (
  <View style={styles.datePillContainer}>
    <Text style={styles.datePillText}>{date}</Text>
  </View>
);

const renderEmptyComponent = () => (
  <View style={styles.emptyChatContainer}>
    <Text style={styles.emptyChatText}></Text>
  </View>
);

const ChatAIScreen = () => {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [messages, setMessages] = useState<MessageType.Any[]>([]);
  const [isFetchingHistory, setIsFetchingHistory] = useState(true);
  const [inputText, setInputText] = useState('');
  const headerHeight = useHeaderHeight();

  const chatUser = { id: user?.id ?? '1' };
  const chatAI = { id: 'ai-assistant', firstName: 'AI' };

  const formatMessages = (msgs: any[]): MessageType.Any[] =>
    msgs.map((msg, index) => ({
      author: msg.role === 'user' ? chatUser : chatAI,
      createdAt: new Date(msg.created_at).getTime() || Date.now() - (index * 60000),
      id: msg.id.toString(),
      text: msg.content,
      type: 'text',
    }));

  useEffect(() => {
    if (!isAuthLoading && user) {
      const fetchHistory = async () => {
        try {
          const res = await axios.get(`${API_BASE_URL}/api/chat/history/${user.id}`);
          const formatted = formatMessages(res.data);
          setMessages(formatted);
        } catch (e) {
          console.error('Chat history error:', e);
        } finally {
          setIsFetchingHistory(false);
        }
      };
      fetchHistory();
    }
  }, [user, isAuthLoading]);

  const handleSendPress = useCallback(async (text: string) => {
    if (!user || text.trim() === '') return;

    const userMsg: MessageType.Text = {
      id: uuid.v4() as string,
      text,
      createdAt: Date.now(),
      author: chatUser,
      type: 'text'
    };

    setMessages(prev => [userMsg, ...prev]);
    setInputText('');

    try {
      const res = await axios.post(`${API_BASE_URL}/api/chat/message`, {
        userId: user.id,
        message: text,
      });

      const aiMsg: MessageType.Text = {
        id: uuid.v4() as string,
        text: res.data.reply,
        createdAt: Date.now(),
        author: chatAI,
        type: 'text'
      };

      setMessages(prev => [aiMsg, ...prev]);
    } catch (error) {
      console.error('Send error:', error);
    }
  }, [user]);

  const renderDateHeader = ({ text }: { text: string }) => {
    const timestamp = Number(text);
    return <DatePill date={formatSmartDate(timestamp)} />;
  };

  if (isAuthLoading || isFetchingHistory) {
    return <View style={styles.centered}><ActivityIndicator size="large" /></View>;
  }

  if (!user) {
    return <View style={styles.centered}><Text>Please log in to use the Chat AI.</Text></View>;
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={headerHeight}
    >
      <SafeAreaView style={styles.container}>
        <ImageBackground source={{ uri: BACKGROUND_IMAGE_URI }} style={styles.background}>
          <Chat
            messages={messages}
            user={chatUser}
            theme={whatsappTheme}
            renderInput={() => <View />}
            onSendPress={() => {}}
            customBottomComponent={() => <View />}
            dateHeader={renderDateHeader}
            emptyState={renderEmptyComponent}
          />

          <View style={styles.inputToolbar}>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                placeholder="Message"
                placeholderTextColor="#8696a0"
                value={inputText}
                onChangeText={setInputText}
                multiline
              />
            </View>
            <TouchableOpacity
              style={styles.sendButtonContainer}
              onPress={() => handleSendPress(inputText)}
              disabled={inputText.trim() === ''}
            >
              <Icon name="send" size={22} color="white" />
            </TouchableOpacity>
          </View>
        </ImageBackground>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

const whatsappTheme = {
  colors: {
    background: 'transparent',
    primary: '#005C4B',
    secondary: '#202C33',
    inputText: '#FFFFFF',
    primaryMessageText: '#FFFFFF',
    secondaryMessageText: '#FFFFFF',
    sent: '#34B7F1',
    delivered: '#34B7F1',
    seen: '#34B7F1',
    inputBackground: 'transparent',
    inputTextColor: '#FFFFFF',
    emptyChatPlaceholder: '#8696a0',
    headerTitle: '#FFFFFF',
    headerBackground: '#202C33',
    userAvatarBackground: '#34B7F1',
    userAvatarText: '#FFFFFF',
    captionText: '#FFFFFF',
    error: '#ff3737',
    errorBackground: '#202C33',
  },
  fonts: {},
  borders: {
    inputBorderRadius: 20,
    messageBorderRadius: 12,
  },
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111B21' },
  background: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  inputToolbar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  inputContainer: {
    flex: 1,
    backgroundColor: '#202C33',
    borderRadius: 25,
    paddingHorizontal: 15,
    minHeight: 50,
  },
  textInput: {
    flex: 1,
    color: 'white',
    fontSize: 16,
    paddingVertical: 10,
  },
  sendButtonContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#00A884',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  datePillContainer: {
    backgroundColor: '#1f2c34',
    borderRadius: 8,
    paddingVertical: 5,
    paddingHorizontal: 12,
    alignSelf: 'center',
    marginVertical: 10,
  },
  datePillText: {
    color: '#8696a0',
    fontSize: 12,
    fontWeight: '500',
  },
  emptyChatContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    transform: [{ scaleY: -1 }],
  },
  emptyChatText: {
    color: '#8696a0',
    fontSize: 14,
  },
});

export default ChatAIScreen;
