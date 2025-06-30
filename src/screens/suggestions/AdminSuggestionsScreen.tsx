// 📂 File: src/screens/suggestions/AdminSuggestionsScreen.tsx (FINAL AND COMPLETE)

import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Picker } from '@react-native-picker/picker';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../../apiConfig';
import { ConversationView } from './DonorSuggestionsScreen'; // Import the shared component

const THEME = { primary: '#4A90E2', textDark: '#333', textLight: '#777', open: '#f0ad4e', review: '#5bc0de', implemented: '#5cb85c', closed: '#d9534f' };

const AdminSuggestionsScreen = () => {
    const [view, setView] = useState('list'); // 'list', 'details'
    const [selectedSuggestion, setSelectedSuggestion] = useState<any>(null);

    const handleSelect = (suggestion: any) => {
        setSelectedSuggestion(suggestion);
        setView('details');
    };
    
    const handleBack = () => {
        setSelectedSuggestion(null);
        setView('list');
    };

    return (
        <View style={styles.container}>
            {view === 'list' && <AdminListView onSelect={handleSelect} />}
            {view === 'details' && <AdminConversationView suggestion={selectedSuggestion} onBack={handleBack} />}
        </View>
    );
};

// --- Child Component: The main list view for the admin with functional filters ---
const AdminListView = ({ onSelect }) => {
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('Open'); // Default filter is 'Open'

    // This hook re-fetches data whenever the `filter` state changes.
    // useFocusEffect is used so if the admin goes back, the list may refresh.
    useFocusEffect(useCallback(() => {
        const fetchData = () => {
            setLoading(true);
            fetch(`${API_BASE_URL}/api/admin/suggestions?status=${filter}`)
                .then(res => res.json())
                .then(data => setSuggestions(data))
                .catch(err => {
                    Alert.alert("Error", "Could not fetch suggestions.");
                    console.error(err);
                })
                .finally(() => setLoading(false));
        };
        fetchData();
    }, [filter]));

    return (
        <View style={{ flex: 1 }}>
            <Text style={styles.sectionTitle}>Manage Suggestions</Text>
            
            <View style={styles.filterContainer}>
                {['Open', 'Under Review', 'Implemented', 'Closed'].map(f => (
                    <TouchableOpacity 
                        key={f} 
                        style={[styles.filterButton, filter === f && styles.activeFilter]} 
                        onPress={() => setFilter(f)}
                    >
                        <Text style={[styles.filterText, filter === f && styles.activeFilterText]}>{f}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {loading ? <ActivityIndicator size="large" color={THEME.primary} style={{ marginTop: 50 }} /> :
            <FlatList
                data={suggestions}
                keyExtractor={item => item.id.toString()}
                renderItem={({item}) => (
                    <TouchableOpacity style={styles.ticketItem} onPress={() => onSelect(item)}>
                        <View style={{flex: 1, marginRight: 10}}>
                            <Text style={styles.ticketSubject} numberOfLines={1}>{item.subject}</Text>
                            <Text style={styles.ticketUser}>From: {item.donor_name}</Text>
                        </View>
                        <StatusBadge status={item.status} />
                    </TouchableOpacity>
                )}
                ListEmptyComponent={<Text style={styles.emptyText}>No suggestions with this status.</Text>}
                contentContainerStyle={{ paddingHorizontal: 15 }}
            />}
        </View>
    );
};

// --- Child Component: The detailed view for managing a single suggestion ---
const AdminConversationView = ({ suggestion, onBack }) => {
    const [currentStatus, setCurrentStatus] = useState(suggestion.status);

    const handleStatusChange = async (newStatus: string) => {
        if (newStatus === currentStatus) return;
        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/suggestion/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ suggestionId: suggestion.id, status: newStatus })
            });
            if (response.ok) {
                setCurrentStatus(newStatus);
                Alert.alert("Success", `Status updated to "${newStatus}"`);
            } else {
                throw new Error("Failed to update status");
            }
        } catch (error) {
            Alert.alert("Error", "Could not update status.");
        }
    };

    return (
        <View style={{ flex: 1 }}>
            {/* The ConversationView for chat is reused from the Donor's screen */}
            <ConversationView suggestionId={suggestion.id} onBack={onBack} isAdmin={true} />
            
            {/* The admin action panel at the bottom */}
            <View style={styles.adminActionPanel}>
                <Text style={styles.panelLabel}>Admin Action: Change Status</Text>
                <View style={styles.pickerContainer}>
                    <Picker
                        selectedValue={currentStatus}
                        onValueChange={(itemValue) => handleStatusChange(itemValue)}
                    >
                        <Picker.Item label="Open" value="Open" />
                        <Picker.Item label="Under Review" value="Under Review" />
                        <Picker.Item label="Implemented" value="Implemented" />
                        <Picker.Item label="Closed" value="Closed" />
                    </Picker>
                </View>
            </View>
        </View>
    );
};

// --- Helper Component to render the status badge ---
const StatusBadge = ({ status }) => (<View style={[styles.statusBadge, {backgroundColor: THEME[status.replace(' ', '').toLowerCase()] || '#777'}]}><Text style={styles.statusBadgeText}>{status}</Text></View>);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f4f6f8' },
    sectionTitle: { fontSize: 22, fontWeight: 'bold', color: THEME.textDark, paddingHorizontal: 15, marginVertical: 15, textAlign: 'center' },
    filterContainer: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        paddingHorizontal: 15, 
        marginBottom: 15,
        gap: 8, // Adds space between buttons
    },
    filterButton: { 
        flex: 1, // Makes buttons share space equally
        paddingVertical: 10, 
        borderRadius: 20, 
        backgroundColor: '#e0e0e0',
        alignItems: 'center',
        justifyContent: 'center',
    },
    activeFilter: { 
        backgroundColor: THEME.primary,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2, },
        shadowOpacity: 0.23,
        shadowRadius: 2.62,
        elevation: 4,
    },
    filterText: { 
        fontWeight: '600', 
        color: THEME.textLight,
        fontSize: 12, // Adjust font size for smaller buttons
    },
    activeFilterText: { 
        color: '#fff' 
    },
    ticketItem: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        backgroundColor: '#fff', 
        padding: 15, 
        borderRadius: 8, 
        marginBottom: 10, 
        elevation: 2 
    },
    ticketSubject: { 
        fontSize: 16, 
        fontWeight: 'bold',
        color: THEME.textDark,
    },
    ticketUser: { 
        fontSize: 12, 
        color: THEME.textLight, 
        marginTop: 4 
    },
    statusBadge: { 
        paddingVertical: 4, 
        paddingHorizontal: 10, 
        borderRadius: 12 
    },
    statusBadgeText: { 
        color: '#fff', 
        fontSize: 12, 
        fontWeight: 'bold' 
    },
    emptyText: { 
        textAlign: 'center', 
        marginTop: 40, 
        color: '#999', 
        fontSize: 16 
    },
    adminActionPanel: { 
        borderTopWidth: 1, 
        borderTopColor: '#ddd', 
        padding: 15, 
        backgroundColor: '#fff',
        paddingBottom: 30, // Extra padding for safe area
    },
    panelLabel: { 
        fontSize: 14, 
        fontWeight: '600', 
        color: THEME.textLight, 
        marginBottom: 10 
    },
    pickerContainer: { 
        backgroundColor: '#f0f0f0', 
        borderRadius: 8, 
        borderWidth: 1, 
        borderColor: '#ccc' 
    },
});

export default AdminSuggestionsScreen;