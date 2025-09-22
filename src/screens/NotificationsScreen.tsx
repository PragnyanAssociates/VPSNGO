// 📂 File: src/screens/NotificationsScreen.tsx (MODIFIED & CORRECTED)

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
// ★★★ 1. IMPORT apiClient AND REMOVE useAuth & API_BASE_URL ★★★
import apiClient from '../api/client';
import { format } from 'date-fns';

// --- Reusable Component & Style Constants ---
const PRIMARY_COLOR = '#008080';
const TERTIARY_COLOR = '#f8f8ff';
const TEXT_COLOR_DARK = '#333';
const TEXT_COLOR_MEDIUM = '#555';
const TEXT_COLOR_LIGHT = '#777';

const notificationIcons = {
  default: 'https://cdn-icons-png.flaticon.com/128/8297/8297354.png',
  homework: 'https://cdn-icons-png.flaticon.com/128/2158/2158507.png',
  submission: 'https://cdn-icons-png.flaticon.com/128/17877/17877365.png',
  event: 'https://cdn-icons-png.flaticon.com/128/9592/9592283.png',
  announcement: 'https://cdn-icons-png.flaticon.com/128/11779/11779894.png',
  calendar: 'https://cdn-icons-png.flaticon.com/128/2693/2693507.png',
  timetable: 'https://cdn-icons-png.flaticon.com/128/1254/1254275.png',
  exam: 'https://cdn-icons-png.flaticon.com/128/4029/4029113.png',
  report: 'https://cdn-icons-png.flaticon.com/128/9913/9913576.png',
  syllabus: 'https://cdn-icons-png.flaticon.com/128/1584/1584937.png',
  gallery: 'https://cdn-icons-png.flaticon.com/128/8418/8418513.png',
  health: 'https://cdn-icons-png.flaticon.com/128/3004/3004458.png',
  lab: 'https://cdn-icons-png.flaticon.com/128/9562/9562280.png',
  sport: 'https://cdn-icons-png.flaticon.com/128/3429/3429456.png',
  transport: 'https://cdn-icons-png.flaticon.com/128/2945/2945694.png',
  food: 'https://cdn-icons-png.flaticon.com/128/2276/2276931.png',
  ad: 'https://cdn-icons-png.flaticon.com/128/4944/4944482.png',
  helpdesk: 'https://cdn-icons-png.flaticon.com/128/4961/4961736.png',
  suggestion: 'https://cdn-icons-png.flaticon.com/128/9722/9722906.png',
  payment: 'https://cdn-icons-png.flaticon.com/128/1198/1198291.png',
  kitchen: 'https://cdn-icons-png.flaticon.com/128/3081/3081448.png',
};

const getIconForTitle = (title: string = '') => {
  const lowerCaseTitle = title.toLowerCase();
  
  if (lowerCaseTitle.includes('homework') || lowerCaseTitle.includes('assignment')) return notificationIcons.homework;
  if (lowerCaseTitle.includes('submit') || lowerCaseTitle.includes('submission')) return notificationIcons.submission;
  if (lowerCaseTitle.includes('event')) return notificationIcons.event;
  if (lowerCaseTitle.includes('announcement')) return notificationIcons.announcement;
  if (lowerCaseTitle.includes('calendar')) return notificationIcons.calendar;
  if (lowerCaseTitle.includes('timetable') || lowerCaseTitle.includes('schedule')) return notificationIcons.timetable;
  if (lowerCaseTitle.includes('exam')) return notificationIcons.exam;
  if (lowerCaseTitle.includes('report')) return notificationIcons.report;
  if (lowerCaseTitle.includes('syllabus')) return notificationIcons.syllabus;
  if (lowerCaseTitle.includes('gallery')) return notificationIcons.gallery;
  if (lowerCaseTitle.includes('health')) return notificationIcons.health;
  if (lowerCaseTitle.includes('lab')) return notificationIcons.lab;
  if (lowerCaseTitle.includes('sport') || lowerCaseTitle.includes('application')) return notificationIcons.sport;
  if (lowerCaseTitle.includes('transport') || lowerCaseTitle.includes('route')) return notificationIcons.transport;
  if (lowerCaseTitle.includes('food') || lowerCaseTitle.includes('menu')) return notificationIcons.food;
  if (lowerCaseTitle.includes('ad') || lowerCaseTitle.includes('advertisement')) return notificationIcons.ad;
  if (lowerCaseTitle.includes('ticket') || lowerCaseTitle.includes('help desk')) return notificationIcons.helpdesk;
  if (lowerCaseTitle.includes('suggestion')) return notificationIcons.suggestion;
  if (lowerCaseTitle.includes('payment') || lowerCaseTitle.includes('sponsorship')) return notificationIcons.payment;
  if (lowerCaseTitle.includes('stock') || lowerCaseTitle.includes('kitchen')) return notificationIcons.kitchen;
  
  return notificationIcons.default;
};

const NotificationsScreen = ({ onUnreadCountChange }) => {
  // We no longer need user or token here, apiClient handles authentication automatically.
  // const { user, token } = useAuth();
  const [filterStatus, setFilterStatus] = useState('all');
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    setError(null);
    try {
      // ★★★ 2. USE apiClient TO FETCH NOTIFICATIONS ★★★
      // The authorization header is added automatically by the interceptor.
      const response = await apiClient.get('/notifications');
      
      const data = response.data;
      setNotifications(data);
      const unreadCount = data.filter(n => !n.is_read).length;
      if (onUnreadCountChange) {
          onUnreadCountChange(unreadCount);
      }
    } catch (e: any) { // Type 'e' as any to access response property
      // ★★★ IMPROVED ERROR HANDLING ★★★
      setError(e.response?.data?.message || "Failed to connect to the server.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [onUnreadCountChange]); // Dependencies updated

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const handleMarkAsRead = async (notificationId: number) => {
    const tappedNotification = notifications.find(n => n.id === notificationId);

    if (tappedNotification && tappedNotification.is_read) {
      return; // Do nothing if already read
    }

    try {
      // ★★★ 3. USE apiClient TO MARK NOTIFICATION AS READ ★★★
      await apiClient.put(`/notifications/${notificationId}/read`);
      // After a successful update, refresh the list to show the change
      await fetchNotifications();
    } catch (error: any) {
      console.error("Failed to mark notification as read on server:", error);
      Alert.alert('Error', error.response?.data?.message || 'Could not mark as read. Please try again.');
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filterStatus === 'unread') return !notification.is_read;
    if (filterStatus === 'read') return !!notification.is_read;
    return true;
  });

  const renderContent = () => {
    if (loading) {
      return <ActivityIndicator size="large" color={PRIMARY_COLOR} style={{ marginTop: 50 }} />;
    }
    if (error) {
      return <Text style={styles.errorText}>{error}</Text>;
    }
    if (filteredNotifications.length === 0) {
      return <Text style={styles.noNotificationsText}>You're all caught up!</Text>;
    }
    return filteredNotifications.map(notification => (
      <TouchableOpacity
        key={notification.id}
        style={[styles.notificationItem, !notification.is_read && styles.notificationItemUnread]}
        onPress={() => handleMarkAsRead(notification.id)}
      >
        <Image
          source={{ uri: getIconForTitle(notification.title) }}
          style={styles.notificationImage}
        />
        <View style={styles.notificationContent}>
          <Text style={styles.notificationTitle}>{notification.title}</Text>
          <Text style={styles.notificationMessage}>{notification.message}</Text>
          <Text style={styles.notificationDate}>
            {format(new Date(notification.created_at), "MMM d, yyyy - h:mm a")}
          </Text>
        </View>
      </TouchableOpacity>
    ));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.filterContainer}>
        {['all', 'unread', 'read'].map(status => (
          <TouchableOpacity
            key={status}
            style={[styles.filterButton, filterStatus === status && styles.filterButtonActive]}
            onPress={() => setFilterStatus(status)}
          >
            <Text style={[styles.filterButtonText, filterStatus === status && styles.filterButtonTextActive]}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <ScrollView
        contentContainerStyle={styles.scrollViewContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[PRIMARY_COLOR]} />}
      >
        {renderContent()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: TERTIARY_COLOR },
  filterContainer: { flexDirection: 'row', backgroundColor: 'white', borderRadius: 25, marginHorizontal: 15, marginBottom: 15, marginTop: 10, padding: 5, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3, },
  filterButton: { flex: 1, paddingVertical: 10, borderRadius: 20, alignItems: 'center' },
  filterButtonActive: { backgroundColor: PRIMARY_COLOR },
  filterButtonText: { fontSize: 14, fontWeight: 'bold', color: TEXT_COLOR_MEDIUM },
  filterButtonTextActive: { color: 'white' },
  scrollViewContent: { paddingHorizontal: 15, paddingBottom: 100, minHeight: '100%' },
  notificationItem: { backgroundColor: 'white', borderRadius: 10, padding: 15, marginBottom: 12, flexDirection: 'row', alignItems: 'center', borderLeftWidth: 5, borderLeftColor: '#ccc', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3, },
  notificationItemUnread: { backgroundColor: '#e6fffa', borderLeftColor: PRIMARY_COLOR, },
  notificationImage: { width: 32, height: 32, marginRight: 15, },
  notificationContent: { flex: 1 },
  notificationTitle: { fontSize: 16, fontWeight: 'bold', color: TEXT_COLOR_DARK, marginBottom: 4 },
  notificationMessage: { fontSize: 14, color: TEXT_COLOR_MEDIUM, marginBottom: 6, lineHeight: 20 },
  notificationDate: { fontSize: 12, color: TEXT_COLOR_LIGHT },
  noNotificationsText: { textAlign: 'center', marginTop: 50, fontSize: 16, color: TEXT_COLOR_MEDIUM, },
  errorText: { textAlign: 'center', marginTop: 50, fontSize: 16, color: 'red', marginHorizontal: 20, },
});

export default NotificationsScreen;