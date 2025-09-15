// 📂 File: src/screens/chatai/ChatAIScreen.tsx (CLEANED, STABLE VERSION)

import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ActivityIndicator, TouchableOpacity,
  ImageBackground, TextInput, KeyboardAvoidingView, Platform,
  SafeAreaView, Animated, Easing, Image, Keyboard, Alert
} from 'react-native';
import { Chat } from '@flyerhq/react-native-chat-ui';
import uuid from 'react-native-uuid';
import axios from 'axios';
import { useHeaderHeight } from '@react-navigation/elements';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../../apiConfig';
import LinearGradient from 'react-native-linear-gradient';
import { launchImageLibrary } from 'react-native-image-picker';
import EmojiPicker, { EmojiType } from 'rn-emoji-keyboard';

// Audio recorder imports have been completely removed.

const BACKGROUND_IMAGE_URI = 'https://i.pinimg.com/736x/8c/98/99/8c989947181ebd4a5144b6bdda29851c.jpg';
const EMPTY_CHAT_IMAGE = 'https://cdn-icons-png.flaticon.com/512/564/564619.png';

const formatSmartDate = (timestamp) => {
  const now = new Date();
  const date = new Date(timestamp);
  const diff = Math.floor((now.getTime() - date.getTime()) / (1000 * 3600 * 24));
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  if (diff < 7) return date.toLocaleDateString('en-US', { weekday: 'long' });
  return date.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
};

const DatePill = ({ date }) => (
  <View style={styles.datePillContainer}>
    <Text style={styles.datePillText}>{date}</Text>
  </View>
);

const renderEmptyComponent = () => (
  <View style={styles.emptyChatContainer}>
    <Image source={{ uri: EMPTY_CHAT_IMAGE }} style={styles.emptyChatImage} />
    <Text style={styles.emptyChatText}>
      Start a conversation! AI is here to help you.
    </Text>
  </View>
);

const ChatHeader = () => (
  <View style={styles.header}>
    <Image
      source={{ uri: 'https://cdn-icons-png.flaticon.com/512/4712/4712035.png' }}
      style={styles.headerAvatar}
    />
    <View style={{ marginLeft: 10 }}>
      <Text style={styles.headerTitle}>AI Assistant</Text>
      <Text style={styles.headerSubtitle}>Online</Text>
    </View>
  </View>
);

const ChatAIScreen = () => {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [messages, setMessages] = useState([]);
  const [isFetchingHistory, setIsFetchingHistory] = useState(true);
  const [inputText, setInputText] = useState('');
  const headerHeight = useHeaderHeight();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);

  // All audio-related state and refs have been removed.

  const chatUser = { id: user?.id ?? '1' };
  const chatAI = { id: 'ai-assistant', firstName: 'AI' };

  // Format db messages for chat UI
  const formatMessages = (msgs) => msgs.map((msg, index) => {
    if (msg.type === 'image') {
      return {
        author: msg.role === 'user' ? chatUser : chatAI,
        createdAt: new Date(msg.created_at).getTime() || Date.now() - index * 60000,
        id: msg.id.toString(),
        type: 'image',
        uri: msg.content,
      };
    } else if (msg.type === 'audio') {
      // Logic to display existing audio messages remains
      return {
        author: msg.role === 'user' ? chatUser : chatAI,
        createdAt: new Date(msg.created_at).getTime() || Date.now() - index * 60000,
        id: msg.id.toString(),
        type: 'audio',
        uri: `${API_BASE_URL}${msg.content}`,
      };
    } else {
      return {
        author: msg.role === 'user' ? chatUser : chatAI,
        createdAt: new Date(msg.created_at).getTime() || Date.now() - index * 60000,
        id: msg.id.toString(),
        text: msg.content,
        type: 'text',
      };
    }
  });

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

  useEffect(() => {
    if (messages.length > 0) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      }).start();
    }
  }, [messages]);

  // Send "text" message
  const handleSendPress = useCallback(
    async (text) => {
      if (!user || text.trim() === '') return;
      const userMsg = { id: uuid.v4(), text, createdAt: Date.now(), author: chatUser, type: 'text' };
      setMessages((prev) => [userMsg, ...prev]);
      setInputText('');
      try {
        const res = await axios.post(`${API_BASE_URL}/api/chat/message`, { userId: user.id, message: text, type: 'text' });
        if (res.data.reply) {
          const aiMsg = { id: uuid.v4(), text: res.data.reply, createdAt: Date.now(), author: chatAI, type: 'text' };
          setMessages((prev) => [aiMsg, ...prev]);
        }
      } catch (error) { console.error('Send error:', error); }
    },
    [user]
  );

  // Send "image" message
  const handleImagePick = async () => {
    setImageLoading(true);
    launchImageLibrary({ mediaType: 'photo' }, async (response) => {
      setImageLoading(false);
      if (response.didCancel || !response.assets || !response.assets.length) return;
      const { uri } = response.assets[0];
      if (!uri) return;
      const userMsg = { id: uuid.v4(), type: 'image', uri, createdAt: Date.now(), author: chatUser };
      setMessages((prev) => [userMsg, ...prev]);
      await axios.post(`${API_BASE_URL}/api/chat/message`, { userId: user.id, message: uri, type: 'image' });
    });
  };

  // --- All audio recording functions have been removed ---

  // --- EMOJI LOGIC ---
  const openEmojiPicker = () => {
    Keyboard.dismiss();
    setIsEmojiPickerOpen(true);
  };

  const handleEmojiSelect = (emoji) => {
    setInputText((prev) => prev + emoji.emoji);
  };

  // --- RENDER LOGIC ---
  const renderDateHeader = ({ text }) => {
    const timestamp = Number(text);
    return <DatePill date={formatSmartDate(timestamp)} />;
  };

  if (isAuthLoading || isFetchingHistory) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#00A884" />
        <Text style={styles.loadingText}>Loading your chat history...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyChatText}>Please log in to use the Chat AI.</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={headerHeight}
    >
      <SafeAreaView style={styles.container}>
        <ImageBackground source={{ uri: BACKGROUND_IMAGE_URI }} style={styles.background}>
          <ChatHeader />
          <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
            <Chat
              messages={messages}
              user={chatUser}
              theme={whatsappTheme}
              renderInput={() => <View />}
              dateHeader={renderDateHeader}
              emptyState={renderEmptyComponent}
            />
          </Animated.View>
          <View style={styles.inputToolbar}>
            <TouchableOpacity onPress={handleImagePick}>
              <Icon name="image" size={26} color="#A0A0A0" style={styles.toolbarIcon} />
            </TouchableOpacity>
            <TouchableOpacity onPress={openEmojiPicker}>
              <Icon name="happy-outline" size={26} color="#A0A0A0" style={styles.toolbarIcon} />
            </TouchableOpacity>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                placeholder="Type a message"
                placeholderTextColor="#B9B9B9"
                value={inputText}
                onChangeText={setInputText}
                multiline
                onFocus={() => setIsEmojiPickerOpen(false)}
              />
            </View>

            {/* The microphone button has been removed. Only the send button remains. */}
            <TouchableOpacity
              style={styles.sendButtonContainer}
              onPress={() => handleSendPress(inputText)}
              disabled={inputText.trim() === ''}
            >
              <LinearGradient
                colors={inputText.trim() ? ['#00A884', '#34B7F1'] : ['#1f2c34', '#1f2c34']}
                style={styles.gradientButton}
                start={{ x: 0, y: 1 }}
                end={{ x: 1, y: 1 }}
              >
                <Icon name="send" size={22} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ImageBackground>
        <EmojiPicker
          onEmojiSelected={handleEmojiSelect}
          open={isEmojiPickerOpen}
          onClose={() => setIsEmojiPickerOpen(false)}
        />
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

// Styles and Theme remain the same
const whatsappTheme = {
  colors: {
    background: 'transparent', primary: '#005C4B', secondary: '#202C33', inputText: '#FFFFFF', primaryMessageText: '#FFFFFF', secondaryMessageText: '#FFFFFF', sent: '#34B7F1', delivered: '#34B7F1', seen: '#34B7F1', inputBackground: 'transparent', inputTextColor: '#FFFFFF', emptyChatPlaceholder: '#8696a0', headerTitle: '#FFFFFF', headerBackground: '#202C33', userAvatarBackground: '#34B7F1', userAvatarText: '#FFFFFF', captionText: '#FFFFFF', error: '#ff3737', errorBackground: '#202C33',
  },
  fonts: {},
  borders: { inputBorderRadius: 20, messageBorderRadius: 16, },
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111B21' },
  background: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#00A884', fontSize: 17, marginTop: 16, letterSpacing: 0.5, fontWeight: '600', },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#202C33bf', borderBottomColor: '#1f2c34', borderBottomWidth: StyleSheet.hairlineWidth, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 2, elevation: 1, },
  headerAvatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#34B7F1', marginRight: 3, },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '700', letterSpacing: 1 },
  headerSubtitle: { color: '#7ed957', fontSize: 13, marginTop: 2, fontWeight: '500' },
  inputToolbar: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 8, paddingVertical: 10, backgroundColor: '#202C33f7', borderTopLeftRadius: 24, borderTopRightRadius: 24, shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.20, shadowRadius: 4, elevation: 4, },
  toolbarIcon: { marginRight: 8, marginBottom: 2, opacity: 0.9 },
  inputContainer: { flex: 1, backgroundColor: '#202C33', borderRadius: 24, paddingHorizontal: 15, minHeight: 50, marginRight: 8, shadowColor: '#34B7F1', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.23, shadowRadius: 2.62, elevation: 2, },
  textInput: { flex: 1, color: '#fff', fontSize: 16, paddingVertical: 10, fontWeight: '400' },
  sendButtonContainer: { width: 50, height: 50, borderRadius: 25, overflow: 'hidden', justifyContent: 'center', alignItems: 'center', marginLeft: 4, marginBottom: 3, },
  gradientButton: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
  datePillContainer: { backgroundColor: '#1f2c34ee', borderRadius: 9, paddingVertical: 6, paddingHorizontal: 14, alignSelf: 'center', marginVertical: 10, shadowColor: '#34B7F1', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.12, shadowRadius: 2, elevation: 1, },
  datePillText: { color: '#8696a0', fontSize: 13, fontWeight: '500', letterSpacing: 0.8 },
  emptyChatContainer: { alignItems: 'center', justifyContent: 'center', flex: 1, transform: [{ scaleY: -1 }] },
  emptyChatImage: { width: 64, height: 64, marginBottom: 12, opacity: 0.7 },
  emptyChatText: { color: '#8696a0', fontSize: 15, paddingHorizontal: 12, textAlign: 'center', marginTop: 5, fontWeight: '500' },
});

export default ChatAIScreen;
