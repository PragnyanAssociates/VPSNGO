// 📂 File: src/screens/suggestions/DonorSuggestionsScreen.tsx (COMPLETE AND FINAL)

import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, TextInput, ScrollView, Linking, Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { launchImageLibrary, Asset } from 'react-native-image-picker';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../../apiConfig';

const THEME = { primary: '#4A90E2', textDark: '#333', textLight: '#777', open: '#f0ad4e', review: '#5bc0de', implemented: '#5cb85c', closed: '#d9534f', adminReply: '#e8f5e9', userReply: '#e3f2fd' };

// --- Reusable Conversation View (Exported for Admin Screen) ---
export const ConversationView = ({ suggestionId, onBack, isAdmin }: { suggestionId: number, onBack: () => void, isAdmin: boolean }) => {
    const [thread, setThread] = useState<any>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [replyText, setReplyText] = useState('');
    const [attachment, setAttachment] = useState<Asset | null>(null);
    const [isReplying, setIsReplying] = useState(false);
    const { user } = useAuth();

    const fetchConversation = useCallback(() => {
        setLoading(true);
        fetch(`${API_BASE_URL}/api/suggestions/${suggestionId}`)
            .then(res => res.json())
            .then(data => {
                if(data.thread) {
                    setThread(data.thread);
                    setMessages(data.messages);
                } else {
                    throw new Error("Suggestion not found");
                }
            })
            .catch(err => {
                Alert.alert("Error", "Could not load conversation.");
                onBack(); // Go back if the conversation can't be loaded
            })
            .finally(() => setLoading(false));
    }, [suggestionId]);

    useFocusEffect(fetchConversation);

    const handlePickFile = async () => {
        try {
            const result = await launchImageLibrary({ mediaType: 'mixed', selectionLimit: 1 });
            if (result.didCancel || !result.assets || result.assets.length === 0) return;
            setAttachment(result.assets[0]);
        } catch (err) { console.error("Image Picker Error: ", err); }
    };

    const handlePostReply = async () => {
        if (!replyText.trim() && !attachment) return;
        if (!user) return Alert.alert("Error", "User not found.");
        setIsReplying(true);
        const formData = new FormData();
        formData.append('suggestionId', String(suggestionId));
        formData.append('userId', user.id);
        formData.append('message', replyText);
        if (attachment) {
            formData.append('attachment', { uri: attachment.uri, type: attachment.type, name: attachment.fileName });
        }
        try {
            const response = await fetch(`${API_BASE_URL}/api/suggestions/reply`, { method: 'POST', body: formData });
            if (response.ok) { setReplyText(''); setAttachment(null); fetchConversation(); } 
            else { throw new Error("Failed to post reply."); }
        } catch (error) { Alert.alert("Error", "Could not send reply."); } 
        finally { setIsReplying(false); }
    };

    if (loading) return <View style={styles.centered}><ActivityIndicator size="large" color={THEME.primary} /></View>;
    if (!thread) return <View style={styles.centered}><Text>Suggestion thread not found.</Text></View>;

    return (
        <View style={{ flex: 1 }}>
            <TouchableOpacity style={styles.backButton} onPress={onBack}><MaterialCommunityIcons name="arrow-left" size={22} /><Text style={styles.backButtonText}> Back</Text></TouchableOpacity>
            <ScrollView contentContainerStyle={styles.detailsContainer} keyboardShouldPersistTaps="handled">
                <View style={styles.ticketHeader}><Text style={styles.detailsSubject}>{thread.subject}</Text><StatusBadge status={thread.status} /></View>
                {messages.map(msg => (<MessageBubble key={msg.id} message={msg} />))}
            </ScrollView>
            <View style={styles.replyBox}>
                <TextInput style={styles.replyInput} placeholder="Type your message..." value={replyText} onChangeText={setReplyText} multiline />
                <TouchableOpacity style={styles.actionIcon} onPress={handlePickFile}><MaterialCommunityIcons name="paperclip" size={24} color={THEME.textLight} /></TouchableOpacity>
                <TouchableOpacity style={styles.sendButton} onPress={handlePostReply} disabled={isReplying}>
                    {isReplying ? <ActivityIndicator color="#fff" size="small" /> : <MaterialCommunityIcons name="send" size={24} color="#fff" />}
                </TouchableOpacity>
            </View>
            {attachment && <Text style={styles.attachmentText}>Attached: {attachment.fileName}</Text>}
        </View>
    );
};

// --- Main screen for the Donor ---
const DonorSuggestionsScreen = () => {
    const [view, setView] = useState('list');
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const handleSelect = (id: number) => { setSelectedId(id); setView('details'); };
    const handleBack = () => { setView('list'); setSelectedId(null); };

    return (
        <View style={styles.container}>
            {view === 'list' && <SuggestionListView onSelect={handleSelect} onCreate={() => setView('create')} />}
            {view === 'details' && <ConversationView suggestionId={selectedId!} onBack={handleBack} isAdmin={false} />}
            {view === 'create' && <CreateSuggestionView onBack={handleBack} />}
        </View>
    );
};

// --- List view for the donor's suggestions ---
const SuggestionListView = ({ onSelect, onCreate }) => {
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useFocusEffect(useCallback(() => {
        if (!user) return;
        setLoading(true);
        fetch(`${API_BASE_URL}/api/suggestions/my-suggestions/${user.id}`)
            .then(res => res.json()).then(setSuggestions).finally(() => setLoading(false));
    }, [user]));

    return (
        <View style={{flex: 1}}>
            <TouchableOpacity style={styles.createButton} onPress={onCreate}><MaterialCommunityIcons name="plus" size={20} color="#fff" /><Text style={styles.createButtonText}>Submit a New Suggestion</Text></TouchableOpacity>
            {loading ? <ActivityIndicator size="large" color={THEME.primary} /> :
            <FlatList
                data={suggestions}
                keyExtractor={item => item.id.toString()}
                renderItem={({item}) => (
                    <TouchableOpacity style={styles.ticketItem} onPress={() => onSelect(item.id)}>
                        <View style={{flex: 1, marginRight: 10}}><Text style={styles.ticketSubject} numberOfLines={1}>{item.subject}</Text><Text style={styles.ticketUser}>Last update: {new Date(item.last_reply_at).toLocaleDateString()}</Text></View>
                        <StatusBadge status={item.status} />
                    </TouchableOpacity>
                )}
                ListEmptyComponent={<Text style={styles.emptyText}>You have not submitted any suggestions.</Text>}
                contentContainerStyle={{padding: 15}}
            />}
        </View>
    );
};

// --- Form for creating a new suggestion ---
const CreateSuggestionView = ({ onBack }) => {
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [attachment, setAttachment] = useState<Asset | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const { user } = useAuth();

    const handlePickFile = async () => {
        try {
            const result = await launchImageLibrary({ mediaType: 'mixed', selectionLimit: 1 });
            if (result.didCancel || !result.assets || result.assets.length === 0) return;
            setAttachment(result.assets[0]);
        } catch (err) { console.error(err); }
    };

    const handleSubmit = async () => {
        if (!subject.trim() || !message.trim()) return Alert.alert("Required", "Subject and Message are required.");
        if (!user) return;
        setSubmitting(true);
        const formData = new FormData();
        formData.append('donorId', user.id);
        formData.append('subject', subject);
        formData.append('message', message);
        if (attachment) { formData.append('attachment', { uri: attachment.uri, type: attachment.type, name: attachment.fileName }); }

        try {
            const response = await fetch(`${API_BASE_URL}/api/suggestions`, { method: 'POST', body: formData });
            if (response.ok) { Alert.alert("Success", "Suggestion submitted!"); onBack(); } 
            else { throw new Error("Submission failed"); }
        } catch (error) { Alert.alert("Error", "Could not submit suggestion."); } 
        finally { setSubmitting(false); }
    };

    return (
        <View style={{flex: 1}}>
            <TouchableOpacity style={styles.backButton} onPress={onBack}><MaterialCommunityIcons name="arrow-left" size={22} /><Text style={styles.backButtonText}> Cancel</Text></TouchableOpacity>
            <ScrollView contentContainerStyle={{padding: 15}} keyboardShouldPersistTaps="handled">
                <Text style={styles.sectionTitle}>New Suggestion</Text>
                <TextInput style={styles.input} placeholder="Subject" value={subject} onChangeText={setSubject} />
                <TextInput style={[styles.input, {height: 120, textAlignVertical: 'top'}]} placeholder="Describe your suggestion..." value={message} onChangeText={setMessage} multiline />
                <TouchableOpacity style={styles.attachmentButton} onPress={handlePickFile}><MaterialCommunityIcons name="paperclip" size={18} color={THEME.primary} /><Text style={styles.attachmentButtonText}>{attachment ? ` ${attachment.fileName}` : ' Attach an image or file'}</Text></TouchableOpacity>
                <TouchableOpacity style={styles.createButton} onPress={handleSubmit} disabled={submitting}>
                    {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.createButtonText}>Submit Suggestion</Text>}
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
};

// --- Helper Components ---
const MessageBubble = ({ message }) => (
    <View style={[styles.replyBubble, message.role === 'admin' ? styles.adminReply : styles.userReply]}>
        <Text style={styles.replyAuthor}>{message.full_name} ({message.role})</Text>
        {message.message_text && <Text style={styles.replyText}>{message.message_text}</Text>}
        {message.file_url && <TouchableOpacity onPress={() => Linking.openURL(`${API_BASE_URL}${message.file_url}`)}><Text style={styles.fileLink}><MaterialCommunityIcons name="download-circle" size={16} /> {message.file_name}</Text></TouchableOpacity>}
        <Text style={styles.replyDate}>{new Date(message.created_at).toLocaleString()}</Text>
    </View>
);
const StatusBadge = ({ status }) => (<View style={[styles.statusBadge, {backgroundColor: THEME[status.replace(' ', '').toLowerCase()] || '#777'}]}><Text style={styles.statusBadgeText}>{status}</Text></View>);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f4f6f8' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    sectionTitle: { fontSize: 22, fontWeight: 'bold', color: THEME.textDark, marginBottom: 20, textAlign: 'center' },
    backButton: { flexDirection: 'row', alignItems: 'center', padding: 15 },
    backButtonText: { color: THEME.primary, fontSize: 16, fontWeight: '500', marginLeft: 5 },
    createButton: { flexDirection: 'row', backgroundColor: THEME.primary, padding: 15, margin: 15, borderRadius: 8, alignItems: 'center', justifyContent: 'center', elevation: 2 },
    createButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16, marginLeft: 10 },
    ticketItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: 15, marginHorizontal: 15, borderRadius: 8, marginBottom: 10, elevation: 1 },
    ticketSubject: { fontSize: 16, fontWeight: 'bold', flex: 1 },
    ticketUser: { fontSize: 12, color: THEME.textLight, marginTop: 2 },
    emptyText: { textAlign: 'center', marginTop: 40, color: '#999', fontSize: 16 },
    detailsContainer: { paddingHorizontal: 15, paddingBottom: 30 },
    ticketHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    detailsSubject: { fontSize: 22, fontWeight: 'bold', flex: 1, marginRight: 10 },
    statusBadge: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 12 },
    statusBadgeText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
    replyBubble: { padding: 12, borderRadius: 12, marginBottom: 10, maxWidth: '85%' },
    userReply: { backgroundColor: THEME.userReply, alignSelf: 'flex-start' },
    adminReply: { backgroundColor: THEME.adminReply, alignSelf: 'flex-end' },
    replyAuthor: { fontWeight: 'bold', fontSize: 14, marginBottom: 4, color: THEME.textDark },
    replyText: { fontSize: 15, lineHeight: 21 },
    fileLink: { color: THEME.primary, textDecorationLine: 'underline', marginTop: 8 },
    replyDate: { fontSize: 10, color: THEME.textLight, marginTop: 5, alignSelf: 'flex-end' },
    replyBox: { flexDirection: 'row', alignItems: 'center', padding: 10, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#ddd' },
    replyInput: { flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 20, paddingHorizontal: 15, paddingVertical: 8, marginRight: 10 },
    actionIcon: { padding: 5 },
    sendButton: { backgroundColor: THEME.primary, borderRadius: 20, padding: 8 },
    attachmentText: { paddingHorizontal: 15, paddingBottom: 10, color: THEME.textLight, fontStyle: 'italic' },
    input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 15, fontSize: 16 },
    attachmentButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#eef', padding: 12, borderRadius: 8, marginBottom: 15, justifyContent: 'center' },
    attachmentButtonText: { color: THEME.primary, fontSize: 16 },
});

export default DonorSuggestionsScreen;