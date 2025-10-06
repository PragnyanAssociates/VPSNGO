// 📂 File: src/screens/chat/GroupChatScreen.tsx (MODIFIED & CORRECTED)

import React, { useState, useEffect, useRef } from 'react';
import {
    View, Text, StyleSheet, SafeAreaView, FlatList, TextInput,
    // ★ 1. ADD Alert TO IMPORTS
    TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, Alert, Image, Keyboard
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/client';
import { SERVER_URL } from '../../../apiConfig';
import { io, Socket } from 'socket.io-client';
import { launchImageLibrary, ImageLibraryOptions, ImagePickerResponse } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import EmojiPicker, { EmojiType } from 'rn-emoji-keyboard';

const THEME = { primary: '#007bff', background: '#f4f7fc', text: '#212529', muted: '#86909c', border: '#dee2e6', myMessageBg: '#dcf8c6', otherMessageBg: '#ffffff' };

const GroupChatScreen = () => {
    const { user } = useAuth();
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);

    const socketRef = useRef<Socket | null>(null);
    const flatListRef = useRef<FlatList | null>(null);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await apiClient.get('/group-chat/history');
                setMessages(response.data);
            } catch (error: any) {
                Alert.alert("Error", error.response?.data?.message || "Could not load chat history.");
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
        socketRef.current = io(SERVER_URL);
        socketRef.current.on('connect', () => console.log('Connected to chat server'));
        socketRef.current.on('newMessage', (receivedMessage) => {
            setMessages(prevMessages => [...prevMessages, receivedMessage]);
        });

        // ★ 2. ADD listener to remove a message when the 'messageDeleted' event is received
        socketRef.current.on('messageDeleted', (deletedMessageId) => {
            setMessages(prevMessages => prevMessages.filter(message => message.id !== deletedMessageId));
        });

        return () => {
            if (socketRef.current) {
                // ★ 3. CLEAN UP the new listener on component unmount
                socketRef.current.off('messageDeleted');
                socketRef.current.disconnect();
            }
        };
    }, []);

    const sendMessage = (type: 'text' | 'image', text: string | null, url: string | null) => {
        if (!user || !socketRef.current) return;
        
        const optimisticMessage = {
            id: Date.now(),
            user_id: parseInt(user.id, 10),
            full_name: user.full_name,
            role: user.role,
            message_type: type,
            message_text: text,
            file_url: url,
            timestamp: new Date().toISOString(),
        };
        setMessages(prevMessages => [...prevMessages, optimisticMessage]);
        
        socketRef.current.emit('sendMessage', {
            userId: user.id,
            messageType: type,
            messageText: text,
            fileUrl: url,
        });

        if (type === 'text') setNewMessage('');
    };

    const handleSendText = () => {
        if (newMessage.trim() === '') return;
        sendMessage('text', newMessage.trim(), null);
    };

    const handlePickImage = () => {
        const options: ImageLibraryOptions = { mediaType: 'photo', quality: 0.7 };
        launchImageLibrary(options, async (response: ImagePickerResponse) => {
            if (response.didCancel || !response.assets || response.assets.length === 0) return;
            if (response.errorCode) return Alert.alert("Error", "Could not pick image. " + response.errorMessage);
            
            setIsUploading(true);
            const image = response.assets[0];
            const formData = new FormData();
            formData.append('media', { uri: image.uri, type: image.type, name: image.fileName });

            try {
                const res = await apiClient.post('/group-chat/upload-media', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                sendMessage('image', null, res.data.fileUrl);
            } catch (error: any) {
                Alert.alert("Upload Failed", error.response?.data?.message || 'An unknown error occurred.');
            } finally {
                setIsUploading(false);
            }
        });
    };

    // ★ 4. ADD function to handle message deletion request
    const handleDeleteMessage = (messageId: number) => {
        Alert.alert(
            "Delete Message",
            "Are you sure you want to permanently delete this message for everyone?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => {
                        if (socketRef.current && user) {
                            // Emit event to the server to perform deletion
                            socketRef.current.emit('deleteMessage', { messageId, userId: user.id });
                        }
                    },
                },
            ]
        );
    };

    const handleEmojiSelect = (emoji: EmojiType) => {
        setNewMessage(prevMessage => prevMessage + emoji.emoji);
    };

    const openEmojiPicker = () => { Keyboard.dismiss(); setIsEmojiPickerOpen(true); };
    
    useEffect(() => {
        if (flatListRef.current) { flatListRef.current.scrollToEnd({ animated: true }); }
    }, [messages]);

    const renderMessageItem = ({ item }: { item: any }) => {
        if (!user) return null;
        const isMyMessage = item.user_id === parseInt(user.id, 10);
        const messageTime = new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

        const renderContent = () => {
            switch (item.message_type) {
                case 'image':
                    return <Image source={{ uri: `${SERVER_URL}${item.file_url}` }} style={styles.imageMessage} resizeMode="cover" />;
                case 'text':
                default:
                    return <Text style={styles.messageText}>{item.message_text}</Text>;
            }
        };

        // ★ 5. WRAP the message view in a TouchableOpacity to detect long presses
        return (
            <TouchableOpacity 
                activeOpacity={0.8}
                onLongPress={isMyMessage ? () => handleDeleteMessage(item.id) : undefined}
                delayLongPress={400} // Standard delay for long press
            >
                <View style={[styles.messageContainer, isMyMessage ? styles.myMessageContainer : styles.otherMessageContainer]}>
                    <View style={[styles.messageBubble, isMyMessage ? styles.myMessageBubble : styles.otherMessageBubble, item.message_type === 'image' && styles.imageBubble]}>
                        {!isMyMessage && ( <Text style={[styles.senderName, { color: getRoleColor(item.role) }]}>{item.full_name} ({item.role})</Text> )}
                        {renderContent()}
                        <Text style={[styles.messageTime, item.message_type === 'image' && styles.imageTime]}>{messageTime}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    if (loading) {
        return <ActivityIndicator size="large" color={THEME.primary} style={{ flex: 1 }} />;
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>School Group Chat</Text>
            </View>
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }} keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}>
                <FlatList
                    ref={flatListRef} data={messages} renderItem={renderMessageItem} keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.messageList}
                    onStartShouldSetResponder={() => { if (isEmojiPickerOpen) { setIsEmojiPickerOpen(false); return true; } return false; }}
                />
                <View style={styles.inputContainer}>
                    <TouchableOpacity style={styles.iconButton} onPress={handlePickImage} disabled={isUploading}>
                        {isUploading ? <ActivityIndicator size="small" color={THEME.primary} /> : <Icon name="paperclip" size={24} color={THEME.muted} />}
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconButton} onPress={openEmojiPicker}>
                        <Icon name="emoticon-happy-outline" size={24} color={THEME.muted} />
                    </TouchableOpacity>
                    <TextInput style={styles.input} value={newMessage} onChangeText={setNewMessage} placeholder="Type a message..." placeholderTextColor={THEME.muted} multiline onFocus={() => setIsEmojiPickerOpen(false)} />
                    <TouchableOpacity style={styles.sendButton} onPress={handleSendText}>
                        <Icon name="send" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
            <EmojiPicker onEmojiSelected={handleEmojiSelect} open={isEmojiPickerOpen} onClose={() => setIsEmojiPickerOpen(false)} />
        </SafeAreaView>
    );
};

// Styles and getRoleColor function remain unchanged
const getRoleColor = (role: string) => { switch (role) { case 'admin': return '#d9534f'; case 'teacher': return '#5cb85c'; case 'student': return '#0275d8'; default: return THEME.muted; }};
const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: THEME.background }, header: { padding: 15, borderBottomWidth: 1, borderBottomColor: THEME.border, alignItems: 'center', backgroundColor: '#fff' }, headerTitle: { fontSize: 22, fontWeight: 'bold' }, messageList: { padding: 10 }, messageContainer: { marginVertical: 5, maxWidth: '80%' }, myMessageContainer: { alignSelf: 'flex-end' }, otherMessageContainer: { alignSelf: 'flex-start' }, messageBubble: { borderRadius: 15, padding: 12, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1}, shadowOpacity: 0.1, shadowRadius: 2 }, myMessageBubble: { backgroundColor: THEME.myMessageBg, borderBottomRightRadius: 2 }, otherMessageBubble: { backgroundColor: THEME.otherMessageBg, borderBottomLeftRadius: 2 }, senderName: { fontWeight: 'bold', marginBottom: 4, fontSize: 14 }, messageText: { fontSize: 16, color: THEME.text }, messageTime: { fontSize: 11, color: THEME.muted, alignSelf: 'flex-end', marginTop: 5 }, inputContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 8, borderTopWidth: 1, borderTopColor: THEME.border, backgroundColor: '#fff' }, input: { flex: 1, maxHeight: 100, backgroundColor: '#f0f0f0', borderRadius: 20, paddingHorizontal: 15, paddingVertical: Platform.OS === 'ios' ? 12 : 8, fontSize: 16, marginHorizontal: 5, }, sendButton: { backgroundColor: THEME.primary, width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginLeft: 5, }, iconButton: { padding: 5, }, imageMessage: { width: 200, height: 200, borderRadius: 15 }, imageBubble: { padding: 5, backgroundColor: 'transparent' }, imageTime: { position: 'absolute', bottom: 10, right: 10, color: 'white', backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10, fontSize: 10 },});

export default GroupChatScreen;