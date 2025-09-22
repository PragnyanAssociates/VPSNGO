// 📂 File: src/screens/sports/StudentSportsScreen.tsx (REFACTORED)

import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Alert, FlatList } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/client'; // 👈 IMPORT our smart client

const GREEN_THEME = {
  primary: '#2e7d32',
  secondary: '#e8f5e9',
  accent: '#ff8f00',
  textDark: '#212121',
  textLight: '#757575',
};

const StudentSportsScreen = () => {
  const [view, setView] = useState('registered'); // 'registered' or 'available'
  const [registered, setRegistered] = useState([]);
  const [available, setAvailable] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      // ✅ USE apiClient for concurrent requests
      const [regRes, availRes] = await Promise.all([
        apiClient.get(`/sports/my-registrations/${user.id}`),
        apiClient.get(`/sports/available/${user.id}`)
      ]);
      // ✅ Axios nests the response data in the 'data' property
      setRegistered(regRes.data);
      setAvailable(availRes.data);
    } catch (error) {
      console.error("Error fetching sports data:", error);
      Alert.alert("Error", "Could not load sports activities.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useFocusEffect(fetchData);

  const handleApply = async (activityId) => {
    try {
      // ✅ USE apiClient.post to send data
      const response = await apiClient.post('/sports/apply', { 
        userId: user.id, 
        activityId 
      });

      // ✅ Check response.ok (a helper property we added to our client)
      Alert.alert(response.ok ? "Success" : "Info", response.data.message);
      if (response.ok) {
        fetchData(); // Refresh the lists
      }
    } catch (error) {
      console.error("Application error:", error);
      Alert.alert("Error", "An application error occurred. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      {/* --- UI Remains Unchanged --- */}
      <View style={styles.headerBanner}>
        <MaterialCommunityIcons name="shield-check" size={24} color="#fff" />
        <View style={{ marginLeft: 15 }}>
          <Text style={styles.bannerTitle}>Sports & Activities</Text>
          <Text style={styles.bannerSubtitle}>Track participation, schedules & achievements.</Text>
        </View>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity style={[styles.tab, view === 'registered' && styles.activeTab]} onPress={() => setView('registered')}>
          <Text style={[styles.tabText, view === 'registered' && styles.activeTabText]}>My Activities</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, view === 'available' && styles.activeTab]} onPress={() => setView('available')}>
          <Text style={[styles.tabText, view === 'available' && styles.activeTabText]}>Available to Join</Text>
        </TouchableOpacity>
      </View>

      {loading ? <ActivityIndicator size="large" color={GREEN_THEME.primary} style={{ marginTop: 50 }} /> :
        view === 'registered' ?
          <FlatList
            data={registered}
            keyExtractor={(item, index) => `reg-${index}`}
            renderItem={({ item }) => <ActivityCard item={item} />}
            ListEmptyComponent={<Text style={styles.emptyText}>You are not registered for any activities.</Text>}
            contentContainerStyle={styles.listContainer}
          /> :
          <FlatList
            data={available}
            keyExtractor={(item) => `avail-${item.id}`}
            renderItem={({ item }) => <AvailableCard item={item} onApply={handleApply} />}
            ListEmptyComponent={<Text style={styles.emptyText}>No new activities available to join.</Text>}
            contentContainerStyle={styles.listContainer}
          />
      }
    </View>
  );
};

// --- Child Components (ActivityCard, AvailableCard) Remain Unchanged ---
const ActivityCard = ({ item }) => (
  <View style={styles.card}>
    <Text style={styles.cardTitle}>{item.name}</Text>
    {item.team_name && <Text style={styles.cardDetail}>Team: {item.team_name}</Text>}
    <Text style={styles.cardDetail}><MaterialCommunityIcons name="whistle" size={16} /> Coach: {item.coach_name}</Text>
    <Text style={styles.cardDetail}><MaterialCommunityIcons name="calendar-clock" size={16} /> Schedule: {item.schedule_details}</Text>
    <View style={styles.achievementSection}>
      <Text style={styles.achievementTitle}><MaterialCommunityIcons name="trophy-award" size={16} /> Achievements:</Text>
      {item.achievements ? item.achievements.split('\n').map((ach, i) => <Text key={i} style={styles.achievementItem}>• {ach.trim()}</Text>) : <Text style={styles.achievementItem}>None yet</Text>}
    </View>
  </View>
);

const AvailableCard = ({ item, onApply }) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{item.name}</Text>
      {item.team_name && <Text style={styles.cardDetail}>Team: {item.team_name}</Text>}
      <Text style={styles.cardDetail}><MaterialCommunityIcons name="whistle" size={16} /> Coach: {item.coach_name}</Text>
      <Text style={styles.cardDetail}><MaterialCommunityIcons name="calendar-clock" size={16} /> Schedule: {item.schedule_details}</Text>
      <TouchableOpacity style={styles.applyButton} onPress={() => onApply(item.id)}>
          <Text style={styles.applyButtonText}>Apply to Join</Text>
      </TouchableOpacity>
    </View>
);


// --- Styles Remain Unchanged ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f0' },
  headerBanner: { flexDirection: 'row', backgroundColor: GREEN_THEME.primary, padding: 20, borderBottomLeftRadius: 20, borderBottomRightRadius: 20, alignItems: 'center' },
  bannerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  bannerSubtitle: { color: '#e8f5e9', fontSize: 13 },
  tabContainer: { flexDirection: 'row', margin: 15, backgroundColor: '#fff', borderRadius: 8, elevation: 1 },
  tab: { flex: 1, padding: 12, alignItems: 'center' },
  activeTab: { backgroundColor: GREEN_THEME.secondary, borderRadius: 8 },
  tabText: { color: GREEN_THEME.textLight, fontWeight: '500' },
  activeTabText: { color: GREEN_THEME.primary, fontWeight: 'bold' },
  listContainer: { paddingHorizontal: 15, paddingBottom: 20 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 15, marginBottom: 15, elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: GREEN_THEME.textDark, marginBottom: 8 },
  cardDetail: { fontSize: 14, color: GREEN_THEME.textLight, marginBottom: 5, display: 'flex', alignItems: 'center' },
  achievementSection: { marginTop: 10, borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 10 },
  achievementTitle: { fontSize: 14, fontWeight: 'bold', color: GREEN_THEME.accent, marginBottom: 5 },
  achievementItem: { fontSize: 14, color: GREEN_THEME.textLight, marginLeft: 10, lineHeight: 20 },
  applyButton: { backgroundColor: GREEN_THEME.accent, paddingVertical: 10, borderRadius: 8, marginTop: 15, alignItems: 'center' },
  applyButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  emptyText: { textAlign: 'center', marginTop: 40, color: '#999', fontSize: 16 },
});

export default StudentSportsScreen;