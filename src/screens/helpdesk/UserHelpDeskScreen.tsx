// 📂 File: src/screens/helpdesk/UserHelpDeskScreen.tsx (MODIFIED & CORRECTED)

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, TextInput, ScrollView } from 'react-native';
// ★★★ 1. IMPORT apiClient AND REMOVE API_BASE_URL ★★★
import apiClient from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { HistoryView, TicketDetailsView } from './AdminHelpDeskScreen'; // Shared components are fine
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const BLUE_THEME = { primary: '#1976D2', secondary: '#E3F2FD', textDark: '#212121', textLight: '#757575', open: '#FFB300', solved: '#43A047' };

const UserHelpDeskScreen = () => {
    const [view, setView] = useState('main');
    const [selectedTicketId, setSelectedTicketId] = useState(null);
    const handleViewHistory = () => setView('history');
    const handleViewDetails = (ticketId) => { setSelectedTicketId(ticketId); setView('details'); };
    const handleBack = () => { if (view === 'details') { setView('history'); setSelectedTicketId(null); } else { setView('main'); } };
    const handleBackToMain = () => setView('main');

    return (
        <View style={styles.container}>
            {view === 'main' && <MainHelpView onViewHistory={handleViewHistory} />}
            {view === 'history' && <HistoryView onViewDetails={handleViewDetails} onBack={handleBackToMain} />}
            {view === 'details' && <TicketDetailsView ticketId={selectedTicketId} onBack={handleBack} isAdmin={false} />}
        </View>
    );
};

const MainHelpView = ({ onViewHistory }) => {
    const [faqs, setFaqs] = useState([]);
    const [expandedFaq, setExpandedFaq] = useState(null);
    const [subject, setSubject] = useState('');
    const [description, setDescription] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const { user } = useAuth();

    useEffect(() => {
        // ★★★ 2. USE apiClient ★★★
        apiClient.get('/helpdesk/faqs').then(res => setFaqs(res.data));
    }, []);

    const handleSubmit = async () => {
        if (!subject.trim() || !description.trim()) { return Alert.alert("Missing Info", "Please provide both a subject and a description."); }
        setSubmitting(true);
        try {
            const response = await apiClient.post('/helpdesk/submit', { userId: user.id, subject, description });
            Alert.alert("Success", response.data.message);
            setSubject(''); setDescription('');
        } catch (e: any) { Alert.alert("Error", e.response?.data?.message || "Could not submit query."); }
        finally { setSubmitting(false); }
    };
    
    return (
        <ScrollView contentContainerStyle={styles.mainContainer}>
            <View style={styles.headerBanner}>
                <MaterialCommunityIcons name="chat-question" size={24} color="#fff" />
                <View style={{ marginLeft: 15 }}><Text style={styles.bannerTitle}>Help Desk & Support</Text><Text style={styles.bannerSubtitle}>Find answers or submit your queries.</Text></View>
            </View>
            <TouchableOpacity style={styles.historyButton} onPress={onViewHistory}>
                <Text style={styles.historyButtonText}>View My Submitted Queries</Text>
                <MaterialCommunityIcons name="arrow-right" size={20} color={BLUE_THEME.primary} />
            </TouchableOpacity>
            <Text style={styles.sectionTitle}>Frequently Asked Questions (FAQs)</Text>
            {faqs.map(faq => (
                <View key={faq.id}>
                    <TouchableOpacity style={styles.faqHeader} onPress={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}>
                        <Text style={styles.faqQuestion}>{faq.question}</Text>
                        <MaterialCommunityIcons name={expandedFaq === faq.id ? 'chevron-up' : 'chevron-down'} size={24} color={BLUE_THEME.primary} />
                    </TouchableOpacity>
                    {expandedFaq === faq.id && <Text style={styles.faqAnswer}>{faq.answer}</Text>}
                </View>
            ))}
            <Text style={styles.sectionTitle}>Submit a Query</Text>
            <TextInput placeholder="Subject (e.g., Issue with assignment)" style={styles.input} value={subject} onChangeText={setSubject} />
            <TextInput placeholder="Describe your issue in detail..." style={[styles.input, {height: 120, textAlignVertical: 'top'}]} multiline value={description} onChangeText={setDescription} />
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={submitting}>
                {submitting ? <ActivityIndicator color="#fff" /> : <><MaterialCommunityIcons name="send" size={18} color="#fff" /><Text style={styles.submitButtonText}>Submit Query</Text></>}
            </TouchableOpacity>
        </ScrollView>
    );
};

// Styles remain unchanged
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f4f6f8' },
    mainContainer: { paddingBottom: 40 },
    headerBanner: { flexDirection: 'row', backgroundColor: BLUE_THEME.primary, padding: 20, alignItems: 'center' },
    bannerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    bannerSubtitle: { color: '#E3F2FD', fontSize: 13 },
    historyButton: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: BLUE_THEME.secondary, padding: 15, margin: 15, borderRadius: 8 },
    historyButtonText: { color: BLUE_THEME.primary, fontSize: 16, fontWeight: 'bold' },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: BLUE_THEME.textDark, paddingHorizontal: 15, marginTop: 10, marginBottom: 10 },
    faqHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: 15, marginHorizontal: 15, borderRadius: 8, marginBottom: 2, elevation: 1 },
    faqQuestion: { flex: 1, fontSize: 16, color: BLUE_THEME.textDark },
    faqAnswer: { backgroundColor: '#fff', padding: 15, paddingHorizontal: 20, marginHorizontal: 15, borderTopWidth: 1, borderTopColor: '#eee', lineHeight: 20 },
    input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginHorizontal: 15, marginBottom: 10, fontSize: 16 },
    submitButton: { flexDirection: 'row', backgroundColor: BLUE_THEME.primary, padding: 15, margin: 15, borderRadius: 8, alignItems: 'center', justifyContent: 'center', elevation: 2 },
    submitButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16, marginLeft: 10 },
});

export default UserHelpDeskScreen;