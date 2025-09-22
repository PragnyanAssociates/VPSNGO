// 📂 File: src/screens/events/AdminEventsScreen.tsx (MODIFIED & CORRECTED)

import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, TextInput, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../context/AuthContext';
// ★★★ 1. IMPORT apiClient AND REMOVE API_BASE_URL ★★★
import apiClient from '../../api/client';

const PURPLE_THEME = { primary: '#6200EE', textDark: '#212121', textLight: '#757575', danger: '#c62828', applied: '#29b6f6', approved: '#66bb6a', rejected: '#ef5350' };

const AdminEventsScreen = () => {
    const [view, setView] = useState('list');
    const [selectedEvent, setSelectedEvent] = useState(null);
    const { user } = useAuth();
    const handleBack = () => { setView('list'); setSelectedEvent(null); };
    const handleSelectEvent = (event) => { setSelectedEvent(event); setView('details'); };

    return (
        <View style={styles.container}>
            {view === 'list' && <EventListView onSelect={handleSelectEvent} onCreate={() => setView('create')} />}
            {view === 'details' && <EventDetailsView event={selectedEvent} onBack={handleBack} />}
            {view === 'create' && <CreateEventForm onBack={handleBack} editorId={user.id} />}
        </View>
    );
};

const EventListView = ({ onSelect, onCreate }) => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(() => {
        setLoading(true);
        // ★★★ 2. USE apiClient FOR ALL FETCH CALLS ★★★
        apiClient.get('/events/all-for-admin')
            .then(response => setEvents(response.data))
            .catch(err => Alert.alert("Error", err.response?.data?.message || "Could not load events."))
            .finally(() => setLoading(false));
    }, []);

    useFocusEffect(fetchData);

    return (
        <View style={{flex: 1}}>
            <TouchableOpacity style={styles.createButton} onPress={onCreate}>
                <MaterialCommunityIcons name="plus-circle" size={20} color="#fff" /><Text style={styles.createButtonText}>Create New Event</Text>
            </TouchableOpacity>
            {loading ? <ActivityIndicator size="large" color={PURPLE_THEME.primary} /> :
            <FlatList
                data={events}
                keyExtractor={item => item.id.toString()}
                renderItem={({item}) => (
                    <TouchableOpacity style={styles.card} onPress={() => onSelect(item)}>
                        <Text style={styles.cardTitle}>{item.title}</Text>
                        <Text style={styles.cardDetail}>Date: {new Date(item.event_datetime).toLocaleDateString()}</Text>
                        <View style={item.rsvp_count > 0 ? styles.badge : styles.badgeMuted}>
                            <Text style={styles.badgeText}>{item.rsvp_count} Pending RSVP(s)</Text>
                        </View>
                    </TouchableOpacity>
                )}
                ListEmptyComponent={<Text style={styles.emptyText}>No events created yet.</Text>}
                contentContainerStyle={{padding: 15}}
            />}
        </View>
    );
};

const EventDetailsView = ({ event, onBack }) => {
    const [rsvps, setRsvps] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth(); // Need user for status update

    const fetchRsvps = useCallback(() => {
        setLoading(true);
        apiClient.get(`/events/rsvps/${event.id}`)
            .then(response => setRsvps(response.data))
            .finally(() => setLoading(false));
    }, [event.id]);

    useFocusEffect(fetchRsvps);

    const handleStatusUpdate = (rsvpId, status) => {
        apiClient.put('/events/rsvp/status', { rsvpId, status, adminId: user.id })
            .then(res => { if(res.ok) fetchRsvps() });
    };

    return (
        <View style={{flex: 1}}>
            <TouchableOpacity style={styles.backButton} onPress={onBack}>
                <MaterialCommunityIcons name="arrow-left" size={22} color={PURPLE_THEME.primary} /><Text style={styles.backButtonText}>Back to Events</Text>
            </TouchableOpacity>
            <Text style={styles.detailsTitle}>{event.title} - RSVPs</Text>
            {loading ? <ActivityIndicator size="large" color={PURPLE_THEME.primary} /> :
            <FlatList
                data={rsvps}
                keyExtractor={item => item.rsvp_id.toString()}
                renderItem={({item}) => <RsvpCard rsvp={item} onUpdate={handleStatusUpdate} />}
                ListEmptyComponent={<Text style={styles.emptyText}>No one has RSVP'd yet.</Text>}
                contentContainerStyle={{paddingHorizontal: 15}}
            />}
        </View>
    );
};

const RsvpCard = ({ rsvp, onUpdate }) => (
    <View style={styles.appCard}>
        <View style={styles.appCardHeader}>
            <Text style={styles.studentName}>{rsvp.full_name}</Text>
            <StatusBadge status={rsvp.status} />
        </View>
        <Text style={styles.appDate}>RSVP'd: {new Date(rsvp.rsvp_date).toLocaleString()}</Text>
        {rsvp.status === 'Applied' && (
            <View style={styles.actionContainer}>
                <TouchableOpacity style={[styles.actionBtn, {backgroundColor: PURPLE_THEME.approved}]} onPress={() => onUpdate(rsvp.rsvp_id, 'Approved')}><Text style={styles.actionBtnText}>Approve</Text></TouchableOpacity>
                <TouchableOpacity style={[styles.actionBtn, {backgroundColor: PURPLE_THEME.rejected}]} onPress={() => onUpdate(rsvp.rsvp_id, 'Rejected')}><Text style={styles.actionBtnText}>Reject</Text></TouchableOpacity>
            </View>
        )}
    </View>
);

const CreateEventForm = ({ onBack, editorId }) => {
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('');
    const [datetime, setDatetime] = useState('');
    const [location, setLocation] = useState('');
    const [description, setDescription] = useState('');
    const [rsvpRequired, setRsvpRequired] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = () => {
        if (!title.trim() || !datetime.trim()) return Alert.alert("Error", "Title and Date/Time are required.");
        setIsSaving(true);
        const payload = { title, category, event_datetime: datetime, location, description, rsvp_required: rsvpRequired, created_by: editorId };
        apiClient.post('/events', payload)
            .then(() => { Alert.alert("Success", "Event created!"); onBack(); })
            .catch(err => Alert.alert("Error", err.response?.data?.message || "Could not create event."))
            .finally(() => setIsSaving(false));
    };

    return (
        <ScrollView>
            <TouchableOpacity style={styles.backButton} onPress={onBack}><MaterialCommunityIcons name="arrow-left" size={22} /><Text> Cancel</Text></TouchableOpacity>
            <Text style={styles.detailsTitle}>Create New Event</Text>
            <TextInput placeholder="Event Title *" style={styles.input} value={title} onChangeText={setTitle} />
            <TextInput placeholder="Category (e.g., Academic, Cultural)" style={styles.input} value={category} onChangeText={setCategory} />
            <TextInput placeholder="Date & Time (YYYY-MM-DD HH:MM) *" style={styles.input} value={datetime} onChangeText={setDatetime} />
            <TextInput placeholder="Location (e.g., School Auditorium)" style={styles.input} value={location} onChangeText={setLocation} />
            <TextInput placeholder="Description..." style={[styles.input, {height: 100, textAlignVertical: 'top'}]} multiline value={description} onChangeText={setDescription} />
            <TouchableOpacity style={styles.checkboxContainer} onPress={() => setRsvpRequired(!rsvpRequired)}>
                <MaterialCommunityIcons name={rsvpRequired ? 'checkbox-marked' : 'checkbox-blank-outline'} size={24} color={PURPLE_THEME.primary} />
                <Text style={styles.checkboxLabel}>RSVP Required</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.createButton} onPress={handleSubmit} disabled={isSaving}>
                {isSaving ? <ActivityIndicator color="#fff" /> : <Text style={styles.createButtonText}>Publish Event</Text>}
            </TouchableOpacity>
        </ScrollView>
    );
};

const StatusBadge = ({ status }) => {
    const style = { Applied: { backgroundColor: PURPLE_THEME.applied }, Approved: { backgroundColor: PURPLE_THEME.approved }, Rejected: { backgroundColor: PURPLE_THEME.rejected }};
    return (<View style={[styles.statusBadge, style[status]]}><Text style={styles.statusBadgeText}>{status}</Text></View>);
};

// Styles remain unchanged
const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: '#f5f3f9' }, createButton: { flexDirection: 'row', backgroundColor: PURPLE_THEME.primary, padding: 15, margin: 15, borderRadius: 8, alignItems: 'center', justifyContent: 'center', elevation: 2 }, createButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16, marginLeft: 10 }, card: { backgroundColor: '#fff', borderRadius: 12, padding: 15, marginHorizontal: 15, marginBottom: 15, elevation: 2 }, cardTitle: { fontSize: 18, fontWeight: 'bold', color: PURPLE_THEME.textDark }, cardDetail: { fontSize: 14, color: PURPLE_THEME.textLight, marginTop: 4 }, badge: { backgroundColor: PURPLE_THEME.primary, borderRadius: 12, paddingVertical: 4, paddingHorizontal: 10, alignSelf: 'flex-start', marginTop: 10 }, badgeMuted: { backgroundColor: '#BDBDBD' }, badgeText: { color: '#fff', fontSize: 12, fontWeight: 'bold' }, backButton: { flexDirection: 'row', alignItems: 'center', padding: 15 }, backButtonText: { color: PURPLE_THEME.primary, fontSize: 16, fontWeight: '500', marginLeft: 5 }, detailsTitle: { fontSize: 22, fontWeight: 'bold', paddingHorizontal: 15, paddingBottom: 15 }, appCard: { backgroundColor: '#fff', borderRadius: 8, padding: 15, marginBottom: 10, elevation: 1 }, appCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, studentName: { fontSize: 16, fontWeight: 'bold' }, statusBadge: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 12 }, statusBadgeText: { color: '#fff', fontSize: 12, fontWeight: 'bold' }, appDate: { fontSize: 12, color: PURPLE_THEME.textLight, marginTop: 2, marginBottom: 8 }, actionContainer: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#f0f0f0', paddingTop: 10, marginTop: 5 }, actionBtn: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 6, marginHorizontal: 5 }, actionBtnText: { color: '#fff', fontWeight: 'bold' }, input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginHorizontal: 15, marginBottom: 10, fontSize: 16 }, checkboxContainer: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 15, marginBottom: 15 }, checkboxLabel: { marginLeft: 10, fontSize: 16 }, emptyText: { textAlign: 'center', marginTop: 40, color: '#999', fontSize: 16 } });

export default AdminEventsScreen;