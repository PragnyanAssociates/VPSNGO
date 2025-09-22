// 📂 File: src/screens/events/StudentEventsScreen.tsx (MODIFIED & CORRECTED)

import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../context/AuthContext';
// ★★★ 1. IMPORT apiClient AND REMOVE API_BASE_URL ★★★
import apiClient from '../../api/client';

const PURPLE_THEME = { primary: '#6200EE', secondary: '#EDE7F6', textDark: '#212121', textLight: '#757575', rsvp: '#d32f2f', applied: '#29b6f6', approved: '#4caf50', rejected: '#ef5350' };

const StudentEventsScreen = () => {
    const [view, setView] = useState('list');
    const [selectedEventId, setSelectedEventId] = useState(null);
    const handleViewDetails = (eventId) => { setSelectedEventId(eventId); setView('details'); };
    const handleBackToList = () => { setSelectedEventId(null); setView('list'); };
    return (
        <View style={styles.container}>
            <View style={styles.headerBanner}>
                <MaterialCommunityIcons name="calendar-check" size={24} color="#fff" />
                <View style={{ marginLeft: 15, flex: 1 }}>
                    <Text style={styles.bannerTitle}>School Events</Text>
                    <Text style={styles.bannerSubtitle}>Upcoming and recent school activities.</Text>
                </View>
            </View>
            {view === 'list' && <EventListView onViewDetails={handleViewDetails} />}
            {view === 'details' && <EventDetailsView eventId={selectedEventId} onBack={handleBackToList} />}
        </View>
    );
};

const EventListView = ({ onViewDetails }) => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    const fetchEvents = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            // ★★★ 2. USE apiClient ★★★
            const response = await apiClient.get(`/events/all-for-student/${user.id}`);
            setEvents(response.data);
        } catch (error) {
            console.error("Error fetching events:", error);
            Alert.alert("Error", "Could not load school events.");
        } finally {
            setLoading(false);
        }
    }, [user]);

    useFocusEffect(fetchEvents);

    if (loading) {
        return <View style={styles.centered}><ActivityIndicator size="large" color={PURPLE_THEME.primary} /></View>;
    }

    return (
        <FlatList
            data={events}
            keyExtractor={item => item.id.toString()}
            renderItem={({ item }) => <EventCard event={item} onViewDetails={onViewDetails} />}
            ListEmptyComponent={<Text style={styles.emptyText}>No upcoming events found.</Text>}
            contentContainerStyle={styles.listContainer}
        />
    );
};

const EventCard = ({ event, onViewDetails }) => {
    const formatDate = (datetime) => new Date(datetime).toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    return (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{event.title}</Text>
                {event.category && <Text style={[styles.tag, { backgroundColor: PURPLE_THEME.secondary, color: PURPLE_THEME.primary }]}>{event.category}</Text>}
            </View>
            <View style={styles.detailRow}><MaterialCommunityIcons name="calendar-month" size={18} color={PURPLE_THEME.textLight} /><Text style={styles.detailText}>{formatDate(event.event_datetime)}</Text></View>
            <View style={styles.detailRow}><MaterialCommunityIcons name="map-marker" size={18} color={PURPLE_THEME.textLight} /><Text style={styles.detailText}>{event.location}</Text></View>
            {event.rsvp_required && <View style={styles.detailRow}><MaterialCommunityIcons name="ticket-confirmation" size={18} color={PURPLE_THEME.rsvp} /><Text style={[styles.detailText, { color: PURPLE_THEME.rsvp, fontWeight: 'bold' }]}>RSVP Required</Text></View>}
            <TouchableOpacity style={styles.actionButton} onPress={() => onViewDetails(event.id)}>
                <MaterialCommunityIcons name="information" size={18} color="#fff" style={{marginRight: 8}}/>
                <Text style={styles.buttonText}>View Details</Text>
            </TouchableOpacity>
        </View>
    );
};

const EventDetailsView = ({ eventId, onBack }) => {
    const [details, setDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    const fetchDetails = useCallback(async () => {
        if (!user || !eventId) return;
        setLoading(true);
        try {
            // ★★★ 3. USE apiClient ★★★
            const response = await apiClient.get(`/events/details/${eventId}/${user.id}`);
            setDetails(response.data);
        } catch (error) {
            console.error("Error fetching event details:", error);
            Alert.alert("Error", "Could not load event details.");
        } finally {
            setLoading(false);
        }
    }, [eventId, user]);

    useFocusEffect(fetchDetails);
    
    const handleRsvp = async () => {
        try {
            // ★★★ 4. USE apiClient ★★★
            const response = await apiClient.post('/events/rsvp', { userId: user.id, eventId: eventId });
            Alert.alert("Success", response.data.message);
            fetchDetails();
        } catch (error: any) {
            Alert.alert("Error", error.response?.data?.message || "An RSVP error occurred.");
        }
    };
    
    const formatDate = (datetime) => new Date(datetime).toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });

    if (loading) return <View style={styles.centered}><ActivityIndicator size="large" color={PURPLE_THEME.primary} /></View>;
    if (!details || !details.event) {
        return ( <View style={styles.centered}><Text style={styles.emptyText}>Could not load event details.</Text><TouchableOpacity style={styles.backButton} onPress={onBack}><Text style={styles.backButtonText}>Go Back</Text></TouchableOpacity></View> );
    }
    
    const { event, rsvp } = details;

    return (
        <ScrollView contentContainerStyle={styles.listContainer}>
            <TouchableOpacity style={styles.backButton} onPress={onBack}><MaterialCommunityIcons name="arrow-left" size={22} color={PURPLE_THEME.primary} /><Text style={styles.backButtonText}>Back to All Events</Text></TouchableOpacity>
            <View style={[styles.card, {elevation: 0}]}>
                <Text style={styles.detailsTitle}>{event.title}</Text>
                <View style={styles.detailRow}><MaterialCommunityIcons name="calendar-clock" size={18} color={PURPLE_THEME.textLight} /><Text style={styles.detailText}>{formatDate(event.event_datetime)}</Text></View>
                <View style={styles.detailRow}><MaterialCommunityIcons name="map-marker" size={18} color={PURPLE_THEME.textLight} /><Text style={styles.detailText}>{event.location}</Text></View>
                <Text style={styles.descriptionFull}>{event.description}</Text>
                {event.rsvp_required && (
                    <View style={styles.rsvpSection}>
                        <Text style={styles.rsvpTitle}>RSVP Status</Text>
                        {!rsvp ? ( <TouchableOpacity style={styles.actionButton} onPress={handleRsvp}><MaterialCommunityIcons name="check-circle-outline" size={18} color="#fff" style={{marginRight: 8}}/><Text style={styles.buttonText}>RSVP Now</Text></TouchableOpacity> ) 
                        : ( <View style={[styles.statusBox, {backgroundColor: PURPLE_THEME[rsvp.status.toLowerCase()]}]}><Text style={styles.statusText}>Your Status: {rsvp.status}</Text><Text style={styles.statusDate}>on {new Date(rsvp.rsvp_date).toLocaleDateString()}</Text></View> )}
                    </View>
                )}
            </View>
        </ScrollView>
    );
};

// Styles remain unchanged
const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: '#f5f3f9' }, centered: { flex: 1, justifyContent: 'center', alignItems: 'center' }, headerBanner: { flexDirection: 'row', backgroundColor: PURPLE_THEME.primary, padding: 20, alignItems: 'center', marginBottom: 10 }, bannerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' }, bannerSubtitle: { color: '#e0e0e0', fontSize: 13 }, listContainer: { paddingHorizontal: 15, paddingBottom: 20 }, card: { backgroundColor: '#fff', borderRadius: 12, padding: 20, marginBottom: 15, elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5 }, cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }, cardTitle: { fontSize: 20, fontWeight: 'bold', color: PURPLE_THEME.textDark, flex: 1 }, tag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, fontSize: 12, fontWeight: '500', overflow: 'hidden' }, actionButton: { flexDirection: 'row', backgroundColor: PURPLE_THEME.primary, paddingVertical: 14, marginTop: 15, borderRadius: 8, alignItems: 'center', justifyContent: 'center', elevation: 2 }, buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }, backButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, marginBottom: 5 }, backButtonText: { color: PURPLE_THEME.primary, fontSize: 16, fontWeight: '500', marginLeft: 5 }, detailsTitle: { fontSize: 26, fontWeight: 'bold', color: PURPLE_THEME.textDark, marginBottom: 12 }, detailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 }, detailText: { fontSize: 16, color: PURPLE_THEME.textLight, marginLeft: 10 }, descriptionFull: { fontSize: 16, color: PURPLE_THEME.textDark, lineHeight: 24, marginVertical: 20, borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 20 }, rsvpSection: { marginTop: 20, borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 20 }, rsvpTitle: { fontSize: 18, fontWeight: 'bold', color: PURPLE_THEME.textDark, marginBottom: 10 }, statusBox: { padding: 15, borderRadius: 8, alignItems: 'center' }, statusText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }, statusDate: { color: 'rgba(255, 255, 255, 0.8)', fontSize: 12, marginTop: 2 }, emptyText: { textAlign: 'center', marginTop: 50, color: '#999', fontSize: 16 } });

export default StudentEventsScreen;