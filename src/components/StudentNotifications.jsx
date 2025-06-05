// StudentNotifications.jsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, SafeAreaView } from 'react-native';

const PRIMARY_COLOR = '#008080'; // Teal
const SECONDARY_COLOR = '#e0f2f7'; // Light cyan/teal shade
const TERTIARY_COLOR = '#f8f8ff'; // Very light gray background
const TEXT_COLOR_DARK = '#333';
const TEXT_COLOR_MEDIUM = '#555';
const TEXT_COLOR_LIGHT = '#777';
const BORDER_COLOR = '#b2ebf2';
const BOTTOM_NAV_HEIGHT = 80; // Approximate height of the bottom navigation bar
const CONTENT_HORIZONTAL_PADDING = 15;


export const initialNotificationsData = [ // Exported for initial count calculation in Dashboard
  {
    id: 1,
    title: 'Math Assignment Due',
    message: 'Algebra II assignment due tomorrow at 11:59 PM',
    date: 'May 19, 2025 - 10:30 AM',
    icon: 'bell',
    color: PRIMARY_COLOR,
    read: false
  },
  {
    id: 2,
    title: 'Physics Lab Booking Confirmed',
    message: 'Lab session scheduled for Thursday, 2:00 PM',
    date: 'May 18, 2025 - 2:15 PM',
    icon: 'flask',
    color: '#10b981',
    read: false
  },
  {
    id: 3,
    title: 'Midday Meal Menu Update',
    message: 'New menu for next week is now available',
    date: 'May 18, 2025 - 9:30 AM',
    icon: 'utensils',
    color: '#8b5cf6',
    read: false
  },
  {
    id: 4,
    title: 'Important Announcement',
    message: 'School will be closed on May 25th for a public holiday.',
    date: 'May 17, 2025 - 4:00 PM',
    icon: 'bell',
    color: '#fbbf24',
    read: false
  },
  {
    id: 5,
    title: 'Science Fair Registration',
    message: 'Last day to register for the annual science fair is May 22nd.',
    date: 'May 16, 2025 - 1:00 PM',
    icon: 'flask',
    color: PRIMARY_COLOR,
    read: false
  },
  {
    id: 6,
    title: 'Parent-Teacher Meeting',
    message: 'PTM for Class K-B on June 1st.',
    date: 'May 15, 2025 - 11:00 AM',
    icon: 'bell',
    color: '#ef4444',
    read: false
  },
  {
    id: 7,
    title: 'Library Book Due',
    message: 'Return "The Great Gatsby" by May 21st.',
    date: 'May 14, 2025 - 9:00 AM',
    icon: 'bell',
    color: PRIMARY_COLOR,
    read: false
  }
];

const StudentNotifications = ({ onBackPress, onUnreadCountChange }) => {
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'unread', 'read'
  const [notifications, setNotifications] = useState(initialNotificationsData);


  const notificationImages = {
    bell: 'https://cdn-icons-png.flaticon.com/512/3602/3602145.png',
    flask: 'https://cdn-icons-png.flaticon.com/512/2967/2967396.png',
    utensils: 'https://cdn-icons-png.flaticon.com/512/3132/3132693.png',
  };

  const backArrowImage = 'https://cdn-icons-png.flaticon.com/512/3916/3916837.png';

  const filteredNotifications = notifications.filter(notification => {
    if (filterStatus === 'unread') {
      return !notification.read;
    }
    if (filterStatus === 'read') {
      return notification.read;
    }
    return true; // 'all'
  });

  const handleMarkNotificationRead = (notificationId) => {
    setNotifications(prevNotifications =>
      prevNotifications.map(n =>
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
  };

  // Effect to call onUnreadCountChange whenever notifications change
  useEffect(() => {
    const unreadCount = notifications.filter(n => !n.read).length;
    if (onUnreadCountChange) {
      onUnreadCountChange(unreadCount);
    }
  }, [notifications, onUnreadCountChange]);

  return (
    <SafeAreaView style={notificationStyles.safeArea}>
      {/* <View style={notificationStyles.header}>
        <TouchableOpacity onPress={onBackPress} style={notificationStyles.backButton}>
          <Image source={{ uri: backArrowImage }} style={notificationStyles.backArrowIcon} />
        </TouchableOpacity>
        {/* <Text style={notificationStyles.headerTitle}>All Notifications</Text>
        <View style={notificationStyles.headerRightPlaceholder} />
      </View> */}

      <View style={notificationStyles.filterContainer}>
        <TouchableOpacity
          style={[
            notificationStyles.filterButton,
            filterStatus === 'all' && notificationStyles.filterButtonActive,
          ]}
          onPress={() => setFilterStatus('all')}
        >
          <Text
            style={[
              notificationStyles.filterButtonText,
              filterStatus === 'all' && notificationStyles.filterButtonTextActive,
            ]}
          >
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            notificationStyles.filterButton,
            filterStatus === 'unread' && notificationStyles.filterButtonActive,
          ]}
          onPress={() => setFilterStatus('unread')}
        >
          <Text
            style={[
              notificationStyles.filterButtonText,
              filterStatus === 'unread' && notificationStyles.filterButtonTextActive,
            ]}
          >
            Unread
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            notificationStyles.filterButton,
            filterStatus === 'read' && notificationStyles.filterButtonActive,
          ]}
          onPress={() => setFilterStatus('read')}
        >
          <Text
            style={[
              notificationStyles.filterButtonText,
              filterStatus === 'read' && notificationStyles.filterButtonTextActive,
            ]}
          >
            Read
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={notificationStyles.scrollViewContent}>
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map(notification => (
            <TouchableOpacity
              key={notification.id}
              style={[
                notificationStyles.notificationItem,
                !notification.read && notificationStyles.notificationItemUnread,
                { borderLeftColor: notification.color || PRIMARY_COLOR }
              ]}
              onPress={() => handleMarkNotificationRead(notification.id)}
            >
              <Image
                source={{ uri: notificationImages[notification.icon] }}
                style={[
                  notificationStyles.notificationImage,
                  { tintColor: notification.color || PRIMARY_COLOR }
                ]}
              />
              <View style={notificationStyles.notificationContent}>
                <Text style={notificationStyles.notificationTitle}>{notification.title}</Text>
                <Text style={notificationStyles.notificationMessage}>{notification.message}</Text>
                <Text style={notificationStyles.notificationDate}>{notification.date}</Text>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={notificationStyles.noNotificationsText}>No notifications to display.</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const notificationStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: TERTIARY_COLOR,
  },
  // header: {
  //   flexDirection: 'row',
  //   alignItems: 'center',
  //   justifyContent: 'space-between',
  //   backgroundColor: SECONDARY_COLOR,
  //   padding: 15,
  //   paddingTop: 15,
  //   borderBottomLeftRadius: 20,
  //   borderBottomRightRadius: 20,
  //   marginBottom: 10,
  //   shadowColor: '#000',
  //   shadowOffset: { width: 0, height: 2 },
  //   shadowOpacity: 0.1,
  //   shadowRadius: 4,
  //   elevation: 3,
  //   borderBottomWidth: 1,
  //   borderBottomColor: BORDER_COLOR,
  // },
  // backButton: {
  //   padding: 10,
  // },
  // backArrowIcon: {
  //   width: 24,
  //   height: 24,
  //   resizeMode: 'contain',
  //   tintColor: PRIMARY_COLOR,
  // },
  headerTitle: {
    color: PRIMARY_COLOR,
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerRightPlaceholder: {
    width: 60, // To balance the back button on the left
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'white',
    borderRadius: 25,
    marginHorizontal: CONTENT_HORIZONTAL_PADDING,
    marginBottom: 15,
    padding: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: PRIMARY_COLOR,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: TEXT_COLOR_MEDIUM,
  },
  filterButtonTextActive: {
    color: 'white',
  },
  scrollViewContent: {
    padding: 15,
    paddingBottom: 20 + BOTTOM_NAV_HEIGHT,
  },
  notificationItem: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  notificationItemUnread: {
    backgroundColor: '#fffbe0', // Light yellow background for unread
  },
  notificationImage: {
    width: 20,
    height: 20,
    marginRight: 15,
    resizeMode: 'contain',
    tintColor: TEXT_COLOR_MEDIUM,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: TEXT_COLOR_DARK,
    marginBottom: 5,
  },
  notificationMessage: {
    fontSize: 14,
    color: TEXT_COLOR_MEDIUM,
    marginBottom: 5,
  },
  notificationDate: {
    fontSize: 12,
    color: TEXT_COLOR_LIGHT,
  },
  noNotificationsText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: TEXT_COLOR_MEDIUM,
  },
});

export default StudentNotifications;