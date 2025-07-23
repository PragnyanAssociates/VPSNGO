// 📂 File: src/screens/chat/GroupChatScreen.tsx (FINAL AND CORRECTED)

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    View, Text, StyleSheet, SafeAreaView, FlatList, TextInput,
    TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, Alert
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../../apiConfig';
import { io, Socket } from 'socket.io-client';

const THEME = { primary: '#007bff', background: '#f4f7fc', text: '#212529', muted: '#86909c', border: '#dee2e6', myMessageBg: '#dcf8c6', otherMessageBg: '#ffffff' };

const GroupChatScreen = () => {
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const socketRef = useRef<Socket | null>(null);
    const flatListRef = useRef<FlatList | null>(null);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/group-chat/history`);
                const history = await response.json();
                setMessages(history);
            } catch (error) {
                Alert.alert("Error", "Could not load chat history.");
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
        socketRef.current = io(API_BASE_URL);

        socketRef.current.on('connect', () => console.log('Connected to chat server'));

        socketRef.current.on('newMessage', (receivedMessage) => {
            setMessages(prevMessages => [...prevMessages, receivedMessage]);
        });

        return () => {
            if (socketRef.current) socketRef.current.disconnect();
        };
    }, []);

    const handleSendMessage = () => {
        if (newMessage.trim() === '' || !user || !socketRef.current) return;

        const messageText = newMessage.trim();

        const optimisticMessage = {
            id: Date.now(),
            user_id: parseInt(user.id, 10),
            full_name: user.full_name, // This relies on full_name being in your user object
            role: user.role,
            message_text: messageText,
            timestamp: new Date().toISOString(),
        };
        setMessages(prevMessages => [...prevMessages, optimisticMessage]);
        
        socketRef.current.emit('sendMessage', {
            userId: user.id,
            messageText: messageText,
        });

        setNewMessage('');
    };
    
    useEffect(() => {
        if (flatListRef.current) flatListRef.current.scrollToEnd({ animated: true });
    }, [messages]);

    const renderMessageItem = ({ item }) => {
        const isMyMessage = item.user_id === parseInt(user.id, 10);
        const messageTime = new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

        return (
            <View style={[styles.messageContainer, isMyMessage ? styles.myMessageContainer : styles.otherMessageContainer]}>
                <View style={[styles.messageBubble, isMyMessage ? styles.myMessageBubble : styles.otherMessageBubble]}>
                    {!isMyMessage && (
                        <Text style={[styles.senderName, { color: getRoleColor(item.role) }]}>
                            {item.full_name} ({item.role})
                        </Text>
                    )}
                    <Text style={styles.messageText}>{item.message_text}</Text>
                    <Text style={styles.messageTime}>{messageTime}</Text>
                </View>
            </View>
        );
    };

    if (loading) return <ActivityIndicator size="large" color={THEME.primary} style={{ flex: 1 }} />;

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}><Text style={styles.headerTitle}>School Group Chat</Text></View>
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }} keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}>
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    renderItem={renderMessageItem}
                    keyExtractor={(item, index) => item.id.toString() + index}
                    contentContainerStyle={styles.messageList}
                />
                <View style={styles.inputContainer}>
                    <TextInput style={styles.input} value={newMessage} onChangeText={setNewMessage} placeholder="Type a message..." placeholderTextColor={THEME.muted} />
                    <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}><Text style={styles.sendButtonText}>Send</Text></TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const getRoleColor = (role) => {
    switch (role) {
        case 'admin': return '#d9534f';
        case 'teacher': return '#5cb85c';
        case 'student': return '#0275d8';
        default: return THEME.muted;
    }
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: THEME.background },
    header: { padding: 15, borderBottomWidth: 1, borderBottomColor: THEME.border, alignItems: 'center', backgroundColor: '#fff' },
    headerTitle: { fontSize: 22, fontWeight: 'bold' },
    messageList: { padding: 10 },
    messageContainer: { marginVertical: 5, maxWidth: '80%' },
    myMessageContainer: { alignSelf: 'flex-end' },
    otherMessageContainer: { alignSelf: 'flex-start' },
    messageBubble: { borderRadius: 15, padding: 12, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1}, shadowOpacity: 0.1, shadowRadius: 2 },
    myMessageBubble: { backgroundColor: THEME.myMessageBg, borderBottomRightRadius: 2 },
    otherMessageBubble: { backgroundColor: THEME.otherMessageBg, borderBottomLeftRadius: 2 },
    senderName: { fontWeight: 'bold', marginBottom: 4, fontSize: 14 },
    messageText: { fontSize: 16, color: THEME.text },
    messageTime: { fontSize: 11, color: THEME.muted, alignSelf: 'flex-end', marginTop: 5 },
    inputContainer: { flexDirection: 'row', alignItems: 'center', padding: 10, borderTopWidth: 1, borderTopColor: THEME.border, backgroundColor: '#fff' },
    input: { flex: 1, height: 45, backgroundColor: THEME.light, borderRadius: 25, paddingHorizontal: 15, fontSize: 16 },
    sendButton: { marginLeft: 10, backgroundColor: THEME.primary, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 25 },
    sendButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});

export default GroupChatScreen;