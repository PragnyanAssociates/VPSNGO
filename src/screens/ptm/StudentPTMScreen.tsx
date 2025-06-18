import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, RefreshControl } from 'react-native';
import { MeetingCard, Meeting } from './MeetingCard';
import { API_BASE_URL } from '../../../apiConfig';

const StudentPTMScreen = () => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // ✅ This function no longer needs the token
  const fetchMeetings = useCallback(async () => {
    try {
      setError(null);
      // ✅ Removed the Authorization header
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
  }, []); // ✅ Dependency array is now empty
  
  useEffect(() => {
    fetchMeetings();
  }, [fetchMeetings]);

  const onRefresh = () => {
      setIsRefreshing(true);
      fetchMeetings();
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
            renderItem={({ item }) => <MeetingCard meeting={item} />}
            ListHeaderComponent={
                <View style={styles.header}>
                    <Text style={styles.headerIcon}>👥</Text>
                    <View>
                        <Text style={styles.headerTitle}>Meetings Schedules</Text>
                        <Text style={styles.headerSubtitle}>View upcoming and past Parent-Teacher Meetings.</Text>
                    </View>
                </View>
            }
            ListEmptyComponent={
                <View style={styles.center}>
                    <Text style={styles.emptyText}>No meetings have been scheduled.</Text>
                </View>
            }
            refreshControl={
                <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={["#008080"]}/>
            }
            contentContainerStyle={{ flexGrow: 1 }}
        />
    </View>
  );
};

// ... (The styles from the previous answer remain the same)
const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  errorText: { color: 'red', fontSize: 16, textAlign: 'center' },
  container: { flex: 1, backgroundColor: '#f0f4f7' },
  header: { 
      flexDirection: 'row', 
      alignItems: 'center', 
      padding: 20, 
      borderBottomWidth: 1, 
      borderBottomColor: '#e2e8f0', 
      backgroundColor: 'white',
      marginBottom: 10,
  },
  headerIcon: { fontSize: 32, marginRight: 15, color: '#5a67d8' },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#2d3748' },
  headerSubtitle: { fontSize: 14, color: '#718096' },
  emptyText: { textAlign: 'center', fontSize: 16, color: '#718096' },
});


export default StudentPTMScreen;