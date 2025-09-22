// 📂 File: src/screens/helpdesk/AdminHelpDeskScreen.tsx (MODIFIED & CORRECTED)

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, TextInput, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../context/AuthContext';
// ★★★ 1. IMPORT apiClient AND REMOVE API_BASE_URL ★★★
import apiClient from '../../api/client';

const BLUE_THEME = { primary: '#1976D2', secondary: '#E3F2FD', textDark: '#212121', textLight: '#757575', open: '#FFB300', inProgress: '#1E88E5', solved: '#43A047', closed: '#757575' };

const AdminHelpDeskScreen = () => {
    const [view, setView] = useState('list');
    const [selectedTicket, setSelectedTicket] = useState(null);
    const handleViewDetails = (ticket) => { setSelectedTicket(ticket); setView('details'); };
    const handleBack = () => { setSelectedTicket(null); setView('list'); };

    return (
        <View style={styles.container}>
            {view === 'list' && <TicketListView onSelect={handleViewDetails} />}
            {view === 'details' && <TicketDetailsView ticketId={selectedTicket.id} onBack={handleBack} isAdmin={true} />}
        </View>
    );
};

const formatUserInfo = (name, role, classGroup) => {
    const capitalizedRole = role ? role.charAt(0).toUpperCase() + role.slice(1) : '';
    if (role === 'student' && classGroup && classGroup.trim() !== '' && classGroup.trim() !== 'N/A') {
        return `${name} (${capitalizedRole} - ${classGroup})`;
    }
    return `${name} (${capitalizedRole})`;
};

const TicketListView = ({ onSelect }) => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('Open');

    const fetchData = useCallback(() => {
        setLoading(true);
        // ★★★ 2. USE apiClient FOR ALL FETCH CALLS ★★★
        apiClient.get(`/helpdesk/all-tickets?status=${filter}`)
            .then(res => setTickets(res.data))
            .catch(err => Alert.alert("Error", err.response?.data?.message || "Could not load tickets."))
            .finally(() => setLoading(false));
    }, [filter]);

    useFocusEffect(fetchData);

    return (
        <View style={{ flex: 1 }}>
            <Text style={styles.sectionTitle}>Support Tickets</Text>
            <View style={styles.filterContainer}>{['Open', 'In Progress', 'Solved'].map(f => <TouchableOpacity key={f} style={[styles.filterButton, filter === f && styles.activeFilter]} onPress={() => setFilter(f)}><Text style={[styles.filterText, filter === f && styles.activeFilterText]}>{f}</Text></TouchableOpacity>)}</View>
            {loading ? <ActivityIndicator size="large" color={BLUE_THEME.primary} /> :
            <FlatList data={tickets} keyExtractor={item => item.id.toString()}
                renderItem={({item}) => (
                    <TouchableOpacity style={styles.ticketItem} onPress={() => onSelect(item)}>
                        <View style={{flex: 1, marginRight: 10}}>
                            <Text style={styles.ticketSubject} numberOfLines={1}>{item.subject}</Text>
                            <Text style={styles.ticketUser}>From: {formatUserInfo(item.user_name, item.role, item.class_group)}</Text>
                        </View>
                        <StatusBadge status={item.status} />
                    </TouchableOpacity>
                )}
                ListEmptyComponent={<Text style={styles.emptyText}>No tickets with this status.</Text>}
            />}
        </View>
    );
};

export const TicketDetailsView = ({ ticketId, onBack, isAdmin }) => {
    const [details, setDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [replyText, setReplyText] = useState('');
    const { user } = useAuth();

    const fetchDetails = useCallback(() => {
        setLoading(true);
        apiClient.get(`/helpdesk/ticket/${ticketId}`).then(res => setDetails(res.data)).finally(() => setLoading(false));
    }, [ticketId]);

    useFocusEffect(fetchDetails);

    const handlePostReply = async () => {
        if (!replyText.trim()) return;
        try {
            await apiClient.post('/helpdesk/reply', { ticketId, userId: user.id, replyText });
            setReplyText(''); fetchDetails();
        } catch (e: any) { Alert.alert("Error", e.response?.data?.message || "Could not post reply."); }
    };

    const handleStatusChange = async (newStatus) => {
        try {
            await apiClient.put('/helpdesk/ticket/status', { ticketId, status: newStatus, adminId: user.id, adminName: user.full_name });
            fetchDetails();
        } catch(e: any) { Alert.alert("Error", e.response?.data?.message || "Could not update status."); }
    };
    
    const capitalize = (s) => s && s.charAt(0).toUpperCase() + s.slice(1);

    if (loading) return <View style={styles.centered}><ActivityIndicator size="large" /></View>;
    if (!details) return <View style={styles.centered}><Text>Could not load ticket.</Text></View>;

    const { ticket, replies } = details;

    return (
        <View style={{flex: 1}}>
            <TouchableOpacity style={styles.backButton} onPress={onBack}><MaterialCommunityIcons name="arrow-left" size={22} color={BLUE_THEME.primary} /><Text style={styles.backButtonText}>Back</Text></TouchableOpacity>
            <ScrollView contentContainerStyle={styles.detailsContainer}>
                <View style={styles.ticketHeader}><Text style={styles.detailsSubject}>{ticket.subject}</Text><StatusBadge status={ticket.status} /></View>
                <Text style={styles.ticketUser}>Submitted by: {formatUserInfo(ticket.user_name, ticket.role, ticket.class_group)} on {new Date(ticket.created_at).toLocaleDateString()}</Text>
                <View style={styles.originalPost}><Text style={styles.originalPostText}>{ticket.description}</Text></View>
                <Text style={styles.sectionTitle}>Conversation</Text>
                {replies.map(reply => (
                    <View key={reply.id} style={[styles.replyBubble, reply.user_id === ticket.user_id ? styles.userReply : styles.adminReply]}>
                        <Text style={styles.replyAuthor}>{reply.full_name} ({capitalize(reply.role)})</Text>
                        <Text style={styles.replyText}>{reply.reply_text}</Text>
                        <Text style={styles.replyDate}>{new Date(reply.created_at).toLocaleString()}</Text>
                    </View>
                ))}
                <TextInput placeholder="Type your reply..." style={[styles.input, {height: 80, textAlignVertical: 'top'}]} multiline value={replyText} onChangeText={setReplyText} />
                <TouchableOpacity style={styles.submitButton} onPress={handlePostReply}><MaterialCommunityIcons name="send" size={18} color="#fff" /><Text style={styles.submitButtonText}>Post Reply</Text></TouchableOpacity>
                {isAdmin && ticket.status === 'Open' && ( <TouchableOpacity style={[styles.submitButton, {backgroundColor: BLUE_THEME.inProgress}]} onPress={() => handleStatusChange('In Progress')}><MaterialCommunityIcons name="cogs" size={18} color="#fff" /><Text style={styles.submitButtonText}>Move to In Progress</Text></TouchableOpacity> )}
                {isAdmin && ticket.status === 'In Progress' && ( <TouchableOpacity style={[styles.submitButton, {backgroundColor: BLUE_THEME.solved}]} onPress={() => handleStatusChange('Solved')}><MaterialCommunityIcons name="check-all" size={18} color="#fff" /><Text style={styles.submitButtonText}>Mark as Solved</Text></TouchableOpacity> )}
                {isAdmin && ticket.status === 'Solved' && ( <TouchableOpacity style={[styles.submitButton, {backgroundColor: BLUE_THEME.solved, opacity: 0.7}]} disabled={true}><MaterialCommunityIcons name="lock-check" size={18} color="#fff" /><Text style={styles.submitButtonText}>Ticket is Solved</Text></TouchableOpacity> )}
            </ScrollView>
        </View>
    );
};

export const HistoryView = ({ onViewDetails, onBack }) => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    
    useFocusEffect(useCallback(() => {
        if (!user) return;
        setLoading(true);
        apiClient.get(`/helpdesk/my-tickets/${user.id}`).then(res=>setTickets(res.data)).finally(()=>setLoading(false));
    }, [user]));
    
    return (
        <View style={{flex: 1}}>
            <TouchableOpacity style={styles.backButton} onPress={onBack}><MaterialCommunityIcons name="arrow-left" size={22} color={BLUE_THEME.primary} /><Text style={styles.backButtonText}>Back to Help Desk</Text></TouchableOpacity>
            <Text style={styles.sectionTitle}>My Query History</Text>
            {loading ? <ActivityIndicator size="large" /> :
            <FlatList data={tickets} keyExtractor={item=>item.id.toString()}
                renderItem={({item}) => (
                    <TouchableOpacity style={styles.ticketItem} onPress={() => onViewDetails(item.id)}>
                        <View style={{flex: 1, marginRight: 10}}><Text style={styles.ticketSubject} numberOfLines={1}>{item.subject}</Text><Text style={styles.ticketUser}>Last updated: {new Date(item.last_updated_at).toLocaleDateString()}</Text></View>
                        <StatusBadge status={item.status} />
                    </TouchableOpacity>
                )}
                ListEmptyComponent={<Text style={styles.emptyText}>You haven't submitted any queries.</Text>}
            />}
        </View>
    );
};

const StatusBadge = ({ status }) => ( <View style={[styles.statusBadge, {backgroundColor: BLUE_THEME[status.replace(' ', '').toLowerCase()] || BLUE_THEME.closed}]}><Text style={styles.statusBadgeText}>{status}</Text></View> );
const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: '#f4f6f8' }, centered: { flex: 1, justifyContent: 'center', alignItems: 'center' }, backButton: { flexDirection: 'row', alignItems: 'center', padding: 15 }, backButtonText: { color: BLUE_THEME.primary, fontSize: 16, fontWeight: '500', marginLeft: 5 }, sectionTitle: { fontSize: 18, fontWeight: 'bold', color: BLUE_THEME.textDark, paddingHorizontal: 15, marginTop: 10, marginBottom: 10 }, emptyText: { textAlign: 'center', marginTop: 40, color: '#999', fontSize: 16 }, filterContainer: { flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 15, marginBottom: 15 }, filterButton: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: '#e0e0e0' }, activeFilter: { backgroundColor: BLUE_THEME.primary }, filterText: { fontWeight: '600', color: BLUE_THEME.textLight }, activeFilterText: { color: '#fff' }, ticketItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: 15, marginHorizontal: 15, borderRadius: 8, marginBottom: 10, elevation: 1 }, ticketSubject: { fontSize: 16, fontWeight: 'bold' }, ticketUser: { fontSize: 12, color: BLUE_THEME.textLight, marginTop: 2 }, statusBadge: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 12 }, statusBadgeText: { color: '#fff', fontSize: 12, fontWeight: 'bold' }, detailsContainer: { paddingHorizontal: 15, paddingBottom: 30 }, ticketHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, detailsSubject: { fontSize: 22, fontWeight: 'bold', flex: 1, marginRight: 10 }, originalPost: { backgroundColor: '#fff', padding: 15, borderRadius: 8, marginVertical: 15, borderWidth: 1, borderColor: '#eee' }, originalPostText: { fontSize: 15, lineHeight: 22 }, replyBubble: { padding: 12, borderRadius: 12, marginBottom: 10, maxWidth: '85%' }, userReply: { backgroundColor: BLUE_THEME.secondary, alignSelf: 'flex-start' }, adminReply: { backgroundColor: '#fff', alignSelf: 'flex-end', borderWidth: 1, borderColor: '#eee' }, replyAuthor: { fontWeight: 'bold', fontSize: 14, marginBottom: 4 }, replyText: { fontSize: 15, lineHeight: 21 }, replyDate: { fontSize: 10, color: BLUE_THEME.textLight, marginTop: 5, alignSelf: 'flex-end' }, input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginHorizontal: 15, marginBottom: 10, fontSize: 16 }, submitButton: { flexDirection: 'row', backgroundColor: BLUE_THEME.primary, padding: 15, marginHorizontal: 15, borderRadius: 8, alignItems: 'center', justifyContent: 'center', elevation: 2, marginTop: 5 }, submitButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16, marginLeft: 10 }});
export default AdminHelpDeskScreen;