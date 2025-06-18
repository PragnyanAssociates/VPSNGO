// 📂 File: src/screens/DonorHelpDeskScreen.tsx (FINAL - For Public Access)

import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, TextInput, ScrollView, FlatList, Platform, UIManager } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../../../apiConfig';

const BLUE_THEME = { primary: '#1976D2', secondary: '#E3F2FD', textDark: '#212121', textLight: '#757575', open: '#FFB300', inProgress: '#1E88E5', solved: '#43A047' };
const STORAGE_KEY = '@donor_ticket_ids'; // Key to save ticket IDs on the device

// Enable LayoutAnimation for a smoother UI on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// --- Main component to manage the public workflow ---
const DonorHelpDeskScreen = () => {
    const [view, setView] = useState('main'); // 'main', 'history', 'details'
    const [selectedQueryData, setSelectedQueryData] = useState(null);

    const handleViewDetails = (queryData) => {
        setSelectedQueryData(queryData);
        setView('details');
    };

    const handleBack = () => {
        if (view === 'details') setView('history');
        else setView('main');
    };
    
    return (
        <View style={styles.container}>
             <View style={styles.headerBanner}>
                <MaterialCommunityIcons name="charity" size={24} color="#fff" />
                <View style={{ marginLeft: 15 }}><Text style={styles.bannerTitle}>Donor Support</Text><Text style={styles.bannerSubtitle}>Submit a query or check its status.</Text></View>
            </View>
            {view === 'main' && <SubmitQueryView onSwitchToHistory={() => setView('history')} />}
            {view === 'history' && <QueryHistoryView onViewDetails={handleViewDetails} onBack={() => setView('main')} />}
            {view === 'details' && <QueryDetailsView queryData={selectedQueryData} onBack={handleBack} />}
        </View>
    );
};

// --- Child Component: The form for submitting a new query ---
const SubmitQueryView = ({ onSwitchToHistory }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [subject, setSubject] = useState('');
    const [description, setDescription] = useState('');
    const [submitting, setSubmitting] = useState(false);
    
    const handleSubmit = async () => {
        if (!name.trim() || !email.trim() || !subject.trim()) return Alert.alert("Missing Info", "Name, Email, and Subject are required.");
        setSubmitting(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/donor/submit-query`, {
                method: 'POST', headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ donor_name: name, donor_email: email, subject, description })
            });
            const data = await response.json();
            if (response.ok) {
                const existingIds = await AsyncStorage.getItem(STORAGE_KEY);
                const ids = existingIds ? JSON.parse(existingIds) : [];
                ids.push(data.ticketId);
                await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
                Alert.alert("Success!", `Your query has been submitted. You can check its status in "View My Submitted Queries".`);
                setName(''); setEmail(''); setSubject(''); setDescription('');
            } else { Alert.alert("Error", data.message); }
        } catch (e) { Alert.alert("Error", "Could not submit query."); }
        finally { setSubmitting(false); }
    };

    return (
        <ScrollView contentContainerStyle={styles.formContainer}>
            <TouchableOpacity style={styles.historyButton} onPress={onSwitchToHistory}>
                <Text style={styles.historyButtonText}>View My Submitted Queries</Text>
                <MaterialCommunityIcons name="history" size={20} color={BLUE_THEME.primary} />
            </TouchableOpacity>
            <Text style={styles.sectionTitle}>Submit a New Query</Text>
            <TextInput placeholder="Your Name *" style={styles.input} value={name} onChangeText={setName} />
            <TextInput placeholder="Your Email Address *" style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
            <TextInput placeholder="Subject *" style={styles.input} value={subject} onChangeText={setSubject} />
            <TextInput placeholder="Describe your query..." style={[styles.input, {height: 120, textAlignVertical: 'top'}]} multiline value={description} onChangeText={setDescription} />
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={submitting}>
                {submitting ? <ActivityIndicator color="#fff" /> : <><MaterialCommunityIcons name="send" size={18} color="#fff" /><Text style={styles.submitButtonText}>Submit Query</Text></>}
            </TouchableOpacity>
        </ScrollView>
    );
};

// --- Child Component: Shows the list of queries saved on the device ---
const QueryHistoryView = ({ onViewDetails, onBack }) => {
    const [queries, setQueries] = useState([]);
    const [loading, setLoading] = useState(true);

    useFocusEffect(useCallback(() => {
        const loadHistory = async () => {
            setLoading(true);
            try {
                const idString = await AsyncStorage.getItem(STORAGE_KEY);
                if (!idString || JSON.parse(idString).length === 0) { setQueries([]); return; }
                const ids = JSON.parse(idString);
                const promises = ids.map(id => fetch(`${API_BASE_URL}/api/donor/query-status/${id}`).then(res => res.ok ? res.json() : null));
                const results = await Promise.all(promises);
                setQueries(results.filter(r => r !== null)); // Filter out any failed fetches
            } catch (e) { Alert.alert("Error", "Could not load query history."); } 
            finally { setLoading(false); }
        };
        loadHistory();
    }, []));

    return (
        <View style={{flex: 1}}>
            <TouchableOpacity style={styles.backButton} onPress={onBack}><MaterialCommunityIcons name="arrow-left" size={22} /><Text style={styles.backButtonText}> Back to Submit Query</Text></TouchableOpacity>
            <Text style={styles.sectionTitle}>My Submitted Queries</Text>
            {loading ? <ActivityIndicator size="large" color={BLUE_THEME.primary} /> : 
            <FlatList 
                data={queries}
                keyExtractor={item => item.details.id.toString()}
                renderItem={({item}) => (
                    <TouchableOpacity style={styles.ticketItem} onPress={() => onViewDetails(item)}>
                        <View style={{flex: 1, marginRight: 10}}>
                            <Text style={styles.ticketSubject} numberOfLines={1}>{item.details.subject}</Text>
                            <Text style={styles.ticketUser}>Submitted on: {new Date(item.details.created_at).toLocaleDateString()}</Text>
                        </View>
                        <StatusBadge status={item.details.status} />
                    </TouchableOpacity>
                )}
                ListEmptyComponent={<Text style={styles.emptyText}>You have no submitted queries on this device.</Text>}
            />}
        </View>
    );
};

// --- Child Component: Shows the full details and conversation of one query ---
const QueryDetailsView = ({ queryData, onBack }) => {
    const { details, replies } = queryData;
    return (
        <ScrollView>
            <TouchableOpacity style={styles.backButton} onPress={onBack}><MaterialCommunityIcons name="arrow-left" size={22} /><Text style={styles.backButtonText}> Back to History</Text></TouchableOpacity>
            <View style={styles.detailsContainer}>
                <View style={styles.ticketHeader}><Text style={styles.detailsSubject}>{details.subject}</Text><StatusBadge status={details.status} /></View>
                <Text style={styles.ticketUser}>Query ID: {details.id} | Submitted: {new Date(details.created_at).toLocaleDateString()}</Text>
                <View style={styles.originalPost}><Text style={styles.originalPostDescription}>{details.description}</Text></View>
                <Text style={styles.sectionTitle}>Conversation History</Text>
                {replies.length > 0 ? replies.map(reply => (
                    <View key={reply.id} style={[styles.replyBubble, reply.is_admin_reply ? styles.adminReply : styles.userReply]}>
                        <Text style={styles.replyAuthor}>{reply.is_admin_reply ? 'Support Team' : details.donor_name}</Text>
                        <Text style={styles.replyText}>{reply.reply_text}</Text>
                        <Text style={styles.replyDate}>{new Date(reply.created_at).toLocaleString()}</Text>
                    </View>
                )) : <Text style={styles.emptyText}>No replies yet.</Text>}
            </View>
        </ScrollView>
    );
};

const StatusBadge = ({ status }) => ( <View style={[styles.statusBadge, {backgroundColor: BLUE_THEME[status.replace(' ', '').toLowerCase()] || '#757575'}]}><Text style={styles.statusBadgeText}>{status}</Text></View> );

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f4f6f8' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    formContainer: { padding: 15 },
    headerBanner: { flexDirection: 'row', backgroundColor: BLUE_THEME.primary, padding: 20, alignItems: 'center' },
    bannerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    bannerSubtitle: { color: '#E3F2FD', fontSize: 13 },
    historyButton: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: BLUE_THEME.secondary, padding: 15, marginBottom: 20, borderRadius: 8 },
    historyButtonText: { color: BLUE_THEME.primary, fontSize: 16, fontWeight: 'bold' },
    sectionTitle: { fontSize: 22, fontWeight: 'bold', color: BLUE_THEME.textDark, marginBottom: 20, textAlign: 'center' },
    input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 15, fontSize: 16 },
    submitButton: { flexDirection: 'row', backgroundColor: BLUE_THEME.primary, padding: 15, borderRadius: 8, alignItems: 'center', justifyContent: 'center', elevation: 2 },
    submitButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16, marginLeft: 10 },
    backButton: { flexDirection: 'row', alignItems: 'center', padding: 15 },
    backButtonText: { color: BLUE_THEME.primary, fontSize: 16, fontWeight: '500' },
    ticketItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: 15, marginHorizontal: 15, borderRadius: 8, marginBottom: 10, elevation: 1 },
    ticketSubject: { fontSize: 16, fontWeight: 'bold', flex: 1 },
    ticketUser: { fontSize: 12, color: BLUE_THEME.textLight, marginTop: 2 },
    statusBadge: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 12 },
    statusBadgeText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
    emptyText: { textAlign: 'center', marginVertical: 20, color: '#999', fontSize: 16 },
    detailsContainer: { paddingHorizontal: 15 },
    ticketHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
    detailsSubject: { fontSize: 22, fontWeight: 'bold', flex: 1, marginRight: 10 },
    originalPost: { backgroundColor: '#fff', padding: 15, borderRadius: 8, marginVertical: 15, borderWidth: 1, borderColor: '#eee' },
    originalPostDescription: { fontSize: 16, lineHeight: 22 },
    replyBubble: { padding: 12, borderRadius: 12, marginBottom: 10, maxWidth: '85%' },
    userReply: { backgroundColor: BLUE_THEME.secondary, alignSelf: 'flex-start' },
    adminReply: { backgroundColor: '#e0e0e0', alignSelf: 'flex-end' },
    replyAuthor: { fontWeight: 'bold', fontSize: 14, marginBottom: 4 },
    replyText: { fontSize: 15, lineHeight: 21 },
    replyDate: { fontSize: 10, color: '#666', marginTop: 5, alignSelf: 'flex-end' },
});

export default DonorHelpDeskScreen;