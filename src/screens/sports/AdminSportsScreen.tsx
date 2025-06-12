// 📂 File: src/screens/sports/AdminSportsScreen.tsx (FINAL, DYNAMIC VERSION)

import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, TextInput, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../../apiConfig';

const GREEN_THEME = { primary: '#2e7d32', secondary: '#e8f5e9', accent: '#ff8f00', textDark: '#212121', textLight: '#757575', danger: '#c62828', applied: '#29b6f6', approved: '#66bb6a', rejected: '#ef5350' };

// Main component that controls which view is visible
const AdminSportsScreen = () => {
    const [view, setView] = useState('list'); // 'list', 'details', 'create'
    const [selectedActivity, setSelectedActivity] = useState(null);
    const { user } = useAuth();

    const handleBack = () => { setView('list'); setSelectedActivity(null); };
    const handleSelectActivity = (activity) => { setSelectedActivity(activity); setView('details'); };

    return (
        <View style={styles.container}>
            {view === 'list' && <ActivityListView onSelect={handleSelectActivity} onCreate={() => setView('create')} />}
            {view === 'details' && <ActivityDetails activity={selectedActivity} onBack={handleBack} />}
            {view === 'create' && <CreateActivityForm onBack={handleBack} editorId={user.id} />}
        </View>
    );
};

// --- Child Component: Shows the list of all created activities ---
const ActivityListView = ({ onSelect, onCreate }) => {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(() => {
        setLoading(true);
        fetch(`${API_BASE_URL}/api/sports/all`)
            .then(res => res.json())
            .then(data => setActivities(data))
            .catch(err => Alert.alert("Error", "Could not load activities."))
            .finally(() => setLoading(false));
    }, []);

    useFocusEffect(fetchData);

    return (
        <View style={{flex: 1}}>
            <TouchableOpacity style={styles.createButton} onPress={onCreate}>
                <MaterialCommunityIcons name="plus-circle" size={20} color="#fff" />
                <Text style={styles.createButtonText}>Create New Activity</Text>
            </TouchableOpacity>
            {loading ? <ActivityIndicator size="large" color={GREEN_THEME.primary} /> :
            <FlatList
                data={activities}
                keyExtractor={item => item.id.toString()}
                renderItem={({item}) => (
                    <TouchableOpacity style={styles.card} onPress={() => onSelect(item)}>
                        <Text style={styles.cardTitle}>{item.name}</Text>
                        <Text style={styles.cardDetail}>Coach: {item.coach_name}</Text>
                        <View style={item.application_count > 0 ? styles.badge : styles.badgeMuted}>
                            <Text style={styles.badgeText}>{item.application_count} Pending Application(s)</Text>
                        </View>
                    </TouchableOpacity>
                )}
                ListEmptyComponent={<Text style={styles.emptyText}>No activities created yet.</Text>}
                contentContainerStyle={{padding: 15}}
            />}
        </View>
    );
};


// --- Child Component: Shows the details and application history for one activity ---
const ActivityDetails = ({ activity, onBack }) => {
    const [allApplications, setAllApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('All'); // 'All', 'Applied', 'Approved', 'Rejected'

    const fetchApplications = useCallback(() => {
        setLoading(true);
        fetch(`${API_BASE_URL}/api/sports/applications/${activity.id}`)
            .then(res => res.json())
            .then(data => setAllApplications(data))
            .catch(err => Alert.alert("Error", "Could not load application history."))
            .finally(() => setLoading(false));
    }, [activity.id]);

    useFocusEffect(fetchApplications);

    const filteredApplications = useMemo(() => {
        if (activeFilter === 'All') return allApplications;
        return allApplications.filter(app => app.status === activeFilter);
    }, [activeFilter, allApplications]);
    
    const handleRefresh = () => fetchApplications();

    return (
        <View style={{flex: 1}}>
            <TouchableOpacity style={styles.backButton} onPress={onBack}>
                <MaterialCommunityIcons name="arrow-left" size={22} color={GREEN_THEME.primary} />
                <Text style={styles.backButtonText}>Back to Activities</Text>
            </TouchableOpacity>
            <Text style={styles.detailsTitle}>{activity.name} - Application History</Text>
            
            <View style={styles.filterContainer}>
                {['All', 'Applied', 'Approved', 'Rejected'].map(filter => (
                    <TouchableOpacity key={filter} style={[styles.filterButton, activeFilter === filter && styles.activeFilterButton]} onPress={() => setActiveFilter(filter)}>
                        <Text style={[styles.filterButtonText, activeFilter === filter && styles.activeFilterText]}>{filter}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {loading ? <ActivityIndicator size="large" color={GREEN_THEME.primary} style={{flex: 1}}/> :
            <FlatList
                data={filteredApplications}
                keyExtractor={item => item.registration_id.toString()}
                renderItem={({item}) => <ApplicationCard application={item} onUpdate={handleRefresh} />}
                ListEmptyComponent={<Text style={styles.emptyText}>No applications match this filter.</Text>}
                contentContainerStyle={{paddingHorizontal: 15, paddingBottom: 20}}
            />}
        </View>
    );
};

// --- Child Component: Renders a single application card with all logic ---
const ApplicationCard = ({ application, onUpdate }) => {
    const handleStatusUpdate = (regId, status) => {
        Alert.alert(
            `Confirm Action`,
            `Are you sure you want to ${status.toLowerCase()} this application?`,
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Confirm', onPress: () => {
                    fetch(`${API_BASE_URL}/api/sports/application/status`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ registrationId: regId, status })
                    }).then(res => { if(res.ok) onUpdate() });
                }}
            ]
        );
    };

    const handleSaveRemarks = (regId, text) => {
        fetch(`${API_BASE_URL}/api/sports/application/remarks`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ registrationId: regId, remarks: text })
        });
    };
    
    const handleSaveAchievements = (regId, text) => {
        fetch(`${API_BASE_URL}/api/sports/application/achievements`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ registrationId: regId, achievements: text })
        });
    };

    return (
        <View style={styles.appCard}>
            <View style={styles.appCardHeader}>
                <Text style={styles.studentName}>{application.full_name}</Text>
                <StatusBadge status={application.status} />
            </View>
            <Text style={styles.appDate}>Applied: {new Date(application.registration_date).toLocaleDateString()}</Text>

            {application.status === 'Applied' && (
                <View style={styles.actionContainer}>
                    <TouchableOpacity style={[styles.actionBtn, styles.approveBtn]} onPress={() => handleStatusUpdate(application.registration_id, 'Approved')}>
                        <MaterialCommunityIcons name="check-circle" size={16} color="#fff" />
                        <Text style={styles.actionBtnText}>Approve</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionBtn, styles.rejectBtn]} onPress={() => handleStatusUpdate(application.registration_id, 'Rejected')}>
                         <MaterialCommunityIcons name="close-circle" size={16} color="#fff" />
                        <Text style={styles.actionBtnText}>Reject</Text>
                    </TouchableOpacity>
                </View>
            )}

            <Text style={styles.inputLabel}>Remarks / Notes</Text>
            <TextInput 
                placeholder="Add internal notes about this application..."
                defaultValue={application.remarks}
                style={styles.textInput}
                multiline
                onEndEditing={(e) => handleSaveRemarks(application.registration_id, e.nativeEvent.text)}
            />

            {application.status === 'Approved' && (
                <>
                    <Text style={styles.inputLabel}>Achievements</Text>
                    <TextInput 
                        placeholder="List achievements, one per line..."
                        defaultValue={application.achievements}
                        style={styles.textInput}
                        multiline
                        onEndEditing={(e) => handleSaveAchievements(application.registration_id, e.nativeEvent.text)}
                    />
                </>
            )}
        </View>
    );
};

// --- Helper Component: Renders a colored status badge ---
const StatusBadge = ({ status }) => {
    const style = {
        Applied: { backgroundColor: GREEN_THEME.applied },
        Approved: { backgroundColor: GREEN_THEME.approved },
        Rejected: { backgroundColor: GREEN_THEME.rejected },
    };
    return (
        <View style={[styles.statusBadge, style[status]]}>
            <Text style={styles.statusBadgeText}>{status}</Text>
        </View>
    );
};

// --- Child Component: The form for creating a new activity ---
const CreateActivityForm = ({ onBack, editorId }) => {
    const [name, setName] = useState('');
    const [team, setTeam] = useState('');
    const [coach, setCoach] = useState('');
    const [schedule, setSchedule] = useState('');

    const handleSubmit = () => {
        if (!name.trim() || !coach.trim()) {
            return Alert.alert("Validation Error", "Activity Name and Coach Name are required.");
        }
        const payload = { name, team_name: team, coach_name: coach, schedule_details: schedule, created_by: editorId };
        fetch(`${API_BASE_URL}/api/sports`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        }).then(res => {
            if (res.ok) { Alert.alert("Success", "Activity created!"); onBack(); }
            else { Alert.alert("Error", "Could not create activity."); }
        })
    };

    return (
        <ScrollView>
            <TouchableOpacity style={styles.backButton} onPress={onBack}><MaterialCommunityIcons name="arrow-left" size={22} /><Text> Cancel</Text></TouchableOpacity>
            <Text style={styles.detailsTitle}>Create New Activity</Text>
            <TextInput placeholder="Activity Name (e.g., Basketball) *" style={styles.input} value={name} onChangeText={setName} />
            <TextInput placeholder="Team Name (e.g., Junior Team)" style={styles.input} value={team} onChangeText={setTeam} />
            <TextInput placeholder="Coach Name (e.g., Mr. Jordan) *" style={styles.input} value={coach} onChangeText={setCoach} />
            <TextInput placeholder="Schedule (e.g., Mon, Wed, Fri: 4-5 PM)" style={styles.input} value={schedule} onChangeText={setSchedule} />
            <TouchableOpacity style={styles.createButton} onPress={handleSubmit}><Text style={styles.createButtonText}>Save Activity</Text></TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0f4f0' },
    // LIST VIEW STYLES
    createButton: { flexDirection: 'row', backgroundColor: GREEN_THEME.primary, padding: 15, margin: 15, borderRadius: 8, alignItems: 'center', justifyContent: 'center', elevation: 2 },
    createButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16, marginLeft: 10 },
    card: { backgroundColor: '#fff', borderRadius: 12, padding: 15, marginHorizontal: 15, marginBottom: 15, elevation: 2 },
    cardTitle: { fontSize: 18, fontWeight: 'bold', color: GREEN_THEME.textDark, marginBottom: 8},
    cardDetail: { fontSize: 14, color: GREEN_THEME.textLight },
    badge: { backgroundColor: GREEN_THEME.accent, borderRadius: 12, paddingVertical: 4, paddingHorizontal: 10, alignSelf: 'flex-start', marginTop: 10 },
    badgeMuted: { backgroundColor: '#e0e0e0', borderRadius: 12, paddingVertical: 4, paddingHorizontal: 10, alignSelf: 'flex-start', marginTop: 10 },
    badgeText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
    // DETAILS VIEW STYLES
    backButton: { flexDirection: 'row', alignItems: 'center', padding: 15 },
    backButtonText: { color: GREEN_THEME.primary, fontSize: 16, fontWeight: '500', marginLeft: 5 },
    detailsTitle: { fontSize: 22, fontWeight: 'bold', paddingHorizontal: 15, paddingBottom: 10 },
    filterContainer: { flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 15, paddingBottom: 15 },
    filterButton: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: '#e0e0e0' },
    activeFilterButton: { backgroundColor: GREEN_THEME.primary },
    filterButtonText: { fontWeight: '600', color: GREEN_THEME.textLight },
    activeFilterText: { color: '#fff' },
    emptyText: { textAlign: 'center', marginVertical: 40, color: '#999', fontSize: 16 },
    // APPLICATION CARD STYLES
    appCard: { backgroundColor: '#fff', borderRadius: 8, padding: 15, marginBottom: 10, elevation: 1, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 2, shadowOffset: {width: 0, height: 1}},
    appCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
    studentName: { fontSize: 18, fontWeight: 'bold', color: GREEN_THEME.textDark },
    statusBadge: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 12 },
    statusBadgeText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
    appDate: { fontSize: 12, color: GREEN_THEME.textLight, marginBottom: 12 },
    actionContainer: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#f0f0f0', paddingTop: 12, marginTop: 8 },
    actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 8, borderRadius: 6, marginHorizontal: 5 },
    actionBtnText: { color: '#fff', fontWeight: 'bold', marginLeft: 5 },
    approveBtn: { backgroundColor: GREEN_THEME.approved },
    rejectBtn: { backgroundColor: GREEN_THEME.rejected },
    inputLabel: { fontWeight: 'bold', color: '#555', marginTop: 15, marginBottom: 5 },
    textInput: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, fontSize: 14, textAlignVertical: 'top', minHeight: 60, backgroundColor: '#fafafa' },
    // FORM VIEW STYLES
    input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginHorizontal: 15, marginBottom: 10, fontSize: 16 }
});

export default AdminSportsScreen;