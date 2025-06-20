import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, RefreshControl, TouchableOpacity, Linking, Alert } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'; // Import MaterialIcons
import { MeetingCard, Meeting } from './MeetingCard';
import { API_BASE_URL } from '../../../apiConfig';

const StudentPTMScreen = () => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchMeetings = useCallback(async () => {
    try {
      setError(null);
      const response = await fetch(`${API_BASE_URL}/api/ptm`);

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Could not fetch meeting schedules.');
      }

      const data: Meeting[] = await response.json();
      setMeetings(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);
  
  useEffect(() => {
    fetchMeetings();
  }, [fetchMeetings]);

  const onRefresh = () => {
      setIsRefreshing(true);
      fetchMeetings();
  };

  const handleJoinMeeting = (link: string) => {
      if(link) {
          Linking.openURL(link).catch(() => Alert.alert("Error", "Could not open the meeting link."));
      }
  };

  if (isLoading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#008080" /></View>;
  }

  if (error) {
    return <View style={styles.center}><Text style={styles.errorText}>{error}</Text></View>;
  }

  return (
    <View style={styles.container}>
        <FlatList
            data={meetings}
            keyExtractor={(item) => item.id.toString()}
            // ✅ MODIFIED: Pass isAdmin=false and the join handler to the card
            renderItem={({ item }) => <MeetingCard meeting={item} isAdmin={false} onJoin={handleJoinMeeting} />}
            ListHeaderComponent={
                <View style={styles.header}>
                    <Text style={styles.headerIcon}>👥</Text>
                    <View>
                        <Text style={styles.headerTitle}>Meetings Schedules</Text>
                        <Text style={styles.headerSubtitle}>View upcoming and past Parent-Teacher Meetings.</Text>
                    </View>
                </View>
            }
            ListEmptyComponent={ <View style={styles.center}><Text style={styles.emptyText}>No meetings have been scheduled.</Text></View> }
            refreshControl={ <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={["#008080"]}/> }
            contentContainerStyle={{ flexGrow: 1 }}
        />
    </View>
  );
};

const styles = StyleSheet.create({ /* Styles remain the same */ center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }, errorText: { color: 'red', fontSize: 16, textAlign: 'center' }, container: { flex: 1, backgroundColor: '#f0f4f7' }, header: { flexDirection: 'row', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#e2e8f0', backgroundColor: 'white', marginBottom: 10, }, headerIcon: { fontSize: 32, marginRight: 15, color: '#5a67d8' }, headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#2d3748' }, headerSubtitle: { fontSize: 14, color: '#718096' }, emptyText: { textAlign: 'center', fontSize: 16, color: '#718096' }, });

export default StudentPTMScreen;