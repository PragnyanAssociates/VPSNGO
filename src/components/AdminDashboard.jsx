import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, SafeAreaView, Dimensions, Image, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
// MaterialCommunityIcons is not used, can be removed if you don't plan to use it.
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AdminNotifications, { initialNotificationsData } from './AdminNotifications';
import AdminProfile from './AdminProfile';
import AcademicCalendar from './AcademicCalendar';
import AdminStudentProfiles from './AdminStudentProfiles'; // Ensure this path is correct

const { width: windowWidth } = Dimensions.get('window');

const CARD_GAP = 12;
const CONTENT_HORIZONTAL_PADDING = 15;
const BOTTOM_NAV_HEIGHT = 70; // Adjusted slightly for a common bottom nav height

const PRIMARY_COLOR = '#008080';
const SECONDARY_COLOR = '#e0f2f7';
const TERTIARY_COLOR = '#f8f8ff';
const TEXT_COLOR_DARK = '#333';
const TEXT_COLOR_MEDIUM = '#555';
const TEXT_COLOR_LIGHT = '#777';
const BORDER_COLOR = '#b2ebf2';

// The AllQuickAccessScreenContent component seems to be a separate concept
// for a dedicated "view all" screen. It's not directly used for rendering
// the quick access items on the main dashboard home tab in this setup.
// If you intend to use it, you'll need a separate mechanism to navigate to it.
// For now, I'm keeping it as it was in your provided code.
const AllQuickAccessScreenContent = ({ allQuickAccessItems, onBackPress, DashboardSectionCard }) => {
  return (
    <SafeAreaView style={allQuickAccessStyles.safeArea}>
      <View style={allQuickAccessStyles.header}>
        <TouchableOpacity onPress={onBackPress} style={allQuickAccessStyles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={PRIMARY_COLOR} />
        </TouchableOpacity>
        <Text style={allQuickAccessStyles.headerTitle}>All Quick Access</Text>
        <View style={allQuickAccessStyles.headerRightPlaceholder} />
      </View>
      <ScrollView contentContainerStyle={allQuickAccessStyles.scrollViewContent}>
        <View style={allQuickAccessStyles.dashboardGrid}>
          {allQuickAccessItems.map(item => (
            <DashboardSectionCard // This DashboardSectionCard is defined inside AdminDashboard
              key={item.id} // Ensure these IDs are unique
              title={item.title}
              imageSource={item.imageSource}
              // iconName and iconType are not in your allQuickAccessItems data structure
              // iconName={item.iconName}
              // iconType={item.iconType}
              onPress={() => Alert.alert(item.title, `Navigating to ${item.title}...`)}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const allQuickAccessStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: TERTIARY_COLOR,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: SECONDARY_COLOR,
    paddingHorizontal: 15,
    paddingVertical: 12,
    // paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 15, // Adjust for status bar
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    borderBottomWidth: 1,
    borderBottomColor: BORDER_COLOR,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    color: PRIMARY_COLOR,
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerRightPlaceholder: {
    width: 40,
  },
  scrollViewContent: {
    paddingHorizontal: CONTENT_HORIZONTAL_PADDING,
    paddingVertical: 15,
    paddingBottom: BOTTOM_NAV_HEIGHT + 20, // Ensure space for bottom nav
  },
  dashboardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    // If cards have internal margins creating gaps, marginHorizontal on grid might not be needed.
    // marginHorizontal: -CARD_GAP / 2,
    marginBottom: 20,
    marginTop: 10,
  },
});


const AdminDashboard = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('home');
  const [userProfile, setUserProfile] = useState({
    name: 'Sarah Anderson (Admin)',
    profileImage: 'https://randomuser.me/api/portraits/women/44.jpg',
    class: 'Administration', // Or 'Admin Role'
    studentId: 'ADM001', // Admin ID
    dob: '1985-07-15',
    gender: 'Female',
    email: 'sarah.anderson@example.com',
    phone: '+91 98765 43210',
    address: '123, School Lane, Knowledge City, Hyderabad - 500081',
    rollNo: 'N/A',
    admissionDate: '2015-06-01', // Or employment date
  });

  const initialUnreadCount = initialNotificationsData.filter(n => !n.read).length;
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(initialUnreadCount);

  // CRITICAL: Ensure all IDs are unique
  const allQuickAccessItems = [
    { id: 'qa1', title: 'Student Profiles', imageSource: 'https://cdn-icons-png.flaticon.com/128/2444/2444491.png', navigateToTab: 'studentProfiles' },
    { id: 'qa2', title: 'MI', imageSource: 'https://cdn-icons-png.flaticon.com/128/9195/9195955.png' },
    { id: 'qa3', title: 'Attendance', imageSource: 'https://cdn-icons-png.flaticon.com/128/10293/10293877.png' },
    { id: 'qa4', title: 'Syllabus', imageSource: 'https://cdn-icons-png.flaticon.com/128/4728/4728712.png' },
    { id: 'qa5', title: 'Time Table', imageSource: 'https://cdn-icons-png.flaticon.com/128/1254/1254275.png' },
    { id: 'qa6', title: 'Reports', imageSource: 'https://cdn-icons-png.flaticon.com/128/5369/5369986.png' },
    { id: 'qa7', title: 'Schedule', imageSource: 'https://cdn-icons-png.flaticon.com/128/4029/4029113.png' },
    { id: 'qa8', title: 'Digital Labs', imageSource: 'https://cdn-icons-png.flaticon.com/128/9562/9562280.png' },
    { id: 'qa9', title: 'Sports', imageSource: 'https://cdn-icons-png.flaticon.com/128/3429/3429456.png' },
    { id: 'qa10', title: 'Parent-Teacher Meetings', imageSource: 'https://cdn-icons-png.flaticon.com/128/17588/17588666.png' },
    { id: 'qa11', title: 'Events', imageSource: 'https://cdn-icons-png.flaticon.com/128/16917/16917970.png' },
    { id: 'qa12', title: 'Health Info', imageSource: 'https://cdn-icons-png.flaticon.com/128/9441/9441727.png' },
    { id: 'qa13', title: 'Staff Management', imageSource: 'https://cdn-icons-png.flaticon.com/128/10692/10692138.png' },
    { id: 'qa14', title: 'Help Desk', imageSource: 'https://cdn-icons-png.flaticon.com/128/4840/4840332.png' },
    { id: 'qa15', title: 'Donations', imageSource: 'https://cdn-icons-png.flaticon.com/128/3349/3349234.png' },
  ];

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          onPress: () => {
            if (navigation && navigation.replace) {
              navigation.replace('HomeScreen');
            } else {
              Alert.alert("Logout", "Logout successful! (No navigation context)");
            }
          },
          style: "destructive"
        }
      ],
      { cancelable: true }
    );
  };

  const handleUpdateProfile = (updatedProfile) => {
    setUserProfile(updatedProfile);
    Alert.alert('Profile Updated', 'Your profile details have been saved.');
  };

  const handleBellIconClick = () => setActiveTab('allNotifications');
  const handleUnreadCountChange = (count) => setUnreadNotificationsCount(count);

  // This definition is now inside AdminDashboard and correctly referenced
  const DashboardSectionCard = ({ title, imageSource, onPress }) => {
    return (
      <TouchableOpacity style={styles.dashboardCard} onPress={onPress}>
        <View style={styles.cardIconContainer}>
          <Image source={{ uri: imageSource }} style={styles.cardImage} />
        </View>
        <Text style={styles.cardTitle}>{title}</Text>
      </TouchableOpacity>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <ScrollView
            style={styles.contentScrollView} // Use a specific style for content scroll view
            contentContainerStyle={styles.contentScrollViewContainer} // For padding
          >
            <View style={styles.dashboardGrid}>
              {allQuickAccessItems.map(item => (
                <DashboardSectionCard
                  key={item.id}
                  title={item.title}
                  imageSource={item.imageSource}
                  onPress={() => {
                    if (item.navigateToTab) {
                      setActiveTab(item.navigateToTab);
                    } else {
                      Alert.alert(item.title, `Navigating to ${item.title}... (No specific tab action)`);
                    }
                  }}
                />
              ))}
            </View>
          </ScrollView>
        );
      case 'allNotifications':
        return (
          <AdminNotifications
            onBackPress={() => setActiveTab('home')}
            onUnreadCountChange={handleUnreadCountChange}
          />
        );
      case 'calendar':
        return (
          <AcademicCalendar
            onBackPress={() => setActiveTab('home')}
          />
        );
      case 'studentProfiles':
        return (
          <AdminStudentProfiles
            onBackPress={() => setActiveTab('home')}
          />
        );
      case 'profile':
        return (
          <AdminProfile
            userProfile={userProfile}
            onUpdateProfile={handleUpdateProfile}
            onBackToDashboard={() => setActiveTab('home')}
          />
        );
      default:
        return (
            <View style={styles.fallbackContent}>
                <Text style={styles.fallbackText}>Content for '{activeTab}' is not available.</Text>
                <TouchableOpacity onPress={() => setActiveTab('home')}>
                    <Text style={styles.fallbackLink}>Go to Home</Text>
                </TouchableOpacity>
            </View>
        );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top bar appears only when on the 'home' tab */}
      {activeTab === 'home' && (
        <View style={styles.topBar}>
          <View style={styles.profileContainer}>
            <Image source={{ uri: userProfile.profileImage }} style={styles.profileImage} />
            <View style={styles.profileTextContainer}>
              <Text style={styles.profileNameText}>{userProfile.name}</Text>
              <Text style={styles.profileRoleText}>{userProfile.class}</Text>
            </View>
          </View>
          <View style={styles.topBarActions}>
            <TouchableOpacity onPress={handleBellIconClick} style={styles.notificationBellContainer}>
              <Image source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3602/3602145.png' }} style={styles.notificationBellIcon} />
              {unreadNotificationsCount > 0 && (
                <View style={styles.notificationCountBubble}>
                  <Text style={styles.notificationCountText}>{unreadNotificationsCount}</Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
              <Image source={{ uri: 'https://cdn-icons-png.flaticon.com/512/1828/1828479.png' }} style={styles.logoutIcon} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {renderContent()}

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('home')}>
          <Icon name="home" size={24} color={activeTab === 'home' ? PRIMARY_COLOR : TEXT_COLOR_MEDIUM} />
          <Text style={[styles.navText, activeTab === 'home' && styles.navTextActive]}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('calendar')}>
          <Icon name="calendar" size={24} color={activeTab === 'calendar' ? PRIMARY_COLOR : TEXT_COLOR_MEDIUM} />
          <Text style={[styles.navText, activeTab === 'calendar' && styles.navTextActive]}>Calendar</Text>
        </TouchableOpacity>
        {/* You can add back Tasks and Messages if needed */}
        {/* <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('tasks')}>
          <Icon name="tasks" size={24} color={activeTab === 'tasks' ? PRIMARY_COLOR : TEXT_COLOR_MEDIUM} />
          <Text style={[styles.navText, activeTab === 'tasks' && styles.navTextActive]}>Tasks</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('messages')}>
          <Icon name="envelope" size={24} color={activeTab === 'messages' ? PRIMARY_COLOR : TEXT_COLOR_MEDIUM} />
          <Text style={[styles.navText, activeTab === 'messages' && styles.navTextActive]}>Messages</Text>
        </TouchableOpacity> */}
        <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('profile')}>
          <Icon name="user" size={24} color={activeTab === 'profile' ? PRIMARY_COLOR : TEXT_COLOR_MEDIUM} />
          <Text style={[styles.navText, activeTab === 'profile' && styles.navTextActive]}>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: TERTIARY_COLOR,
  },
  topBar: {
    backgroundColor: SECONDARY_COLOR,
    paddingHorizontal: 15,
    paddingVertical: Platform.OS === 'ios' ? 12 : 15, // iOS typically needs less vertical padding with SafeAreaView
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // Ensures profile info is left and actions are right
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderBottomWidth: 1,
    borderBottomColor: BORDER_COLOR,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    // flex: 1, // Allow it to take available space if needed, but justifyContent: space-between on topBar might be enough
  },
  profileImage: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    borderWidth: 2,
    borderColor: PRIMARY_COLOR,
  },
  profileTextContainer: { // Renamed for clarity
    marginLeft: 12,
  },
  profileNameText: { // Renamed for clarity
    color: PRIMARY_COLOR,
    fontSize: 17,
    fontWeight: 'bold',
  },
  profileRoleText: { // Renamed for clarity
    color: TEXT_COLOR_MEDIUM,
    fontSize: 13,
  },
  topBarActions: { // Grouping for right-side icons
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationBellContainer: {
    position: 'relative', // For the badge
    padding: 8, // Smaller padding for icon button
    marginRight: 5, // Space before logout
  },
  notificationBellIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
    tintColor: PRIMARY_COLOR,
  },
  notificationCountBubble: {
    position: 'absolute',
    top: 3, // Adjusted for smaller padding
    right: 3, // Adjusted for smaller padding
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 20, // Ensure it's circular even for single digit
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5, // Add padding for numbers like "10+"
  },
  notificationCountText: {
    color: 'white',
    fontSize: 11, // Slightly smaller
    fontWeight: 'bold',
  },
  logoutButton: {
    padding: 8, // Smaller padding for icon button
  },
  logoutIcon: {
    width: 22,
    height: 22,
    resizeMode: 'contain',
    tintColor: PRIMARY_COLOR,
  },
  contentScrollView: { // Style for the main ScrollView holding dashboard grid or other tabs
    flex: 1, // Essential for ScrollView to take available space
  },
  contentScrollViewContainer: { // For padding inside the ScrollView
    paddingHorizontal: CONTENT_HORIZONTAL_PADDING,
    paddingTop: 15, // Add some top padding for content
    paddingBottom: BOTTOM_NAV_HEIGHT + 20, // Space for bottom nav
  },
  dashboardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    // marginBottom: 20, // Handled by ScrollView's bottom padding
  },
  dashboardCard: {
    width: (windowWidth - (CONTENT_HORIZONTAL_PADDING * 2) - (CARD_GAP * 2)) / 3,
    borderRadius: 12, // Slightly less rounded
    paddingVertical: 15,
    marginBottom: CARD_GAP,
    alignItems: 'center',
    justifyContent: 'flex-start', // Align content to top
    height: 110, // Adjusted height
    backgroundColor: '#fff', // Added background for cards
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1, },
    shadowOpacity: 0.10,
    shadowRadius: 1.84,
    elevation: 2,
  },
  cardIconContainer: {
    width: 45, // Fixed size for icon container
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    // backgroundColor: PRIMARY_COLOR_LIGHT, // Optional: Add a background to icon
    // borderRadius: 22.5,
  },
  cardImage: {
    width: 38, // Slightly smaller than container
    height: 38,
    resizeMode: 'contain',
  },
  cardTitle: {
    fontSize: 11, // Adjusted for better fit
    fontWeight: '600',
    color: TEXT_COLOR_DARK,
    textAlign: 'center',
    lineHeight: 14, // Adjusted line height
    paddingHorizontal: 4,
    marginTop: 'auto', // Push title towards bottom if icon is smaller
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: SECONDARY_COLOR,
    borderTopWidth: 1,
    borderTopColor: BORDER_COLOR,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8, // Adjust padding for different OS
    paddingBottom: Platform.OS === 'ios' ? 15 : 8, // Extra padding for home indicator on iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 5,
    minHeight: BOTTOM_NAV_HEIGHT,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center', // Center content vertically
    paddingVertical: 5,
  },
  navText: {
    fontSize: 10, // Made smaller for compactness
    color: TEXT_COLOR_MEDIUM,
    marginTop: 3,
  },
  navTextActive: {
    color: PRIMARY_COLOR,
    fontWeight: 'bold',
  },
  fallbackContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  fallbackText: {
    fontSize: 16,
    color: TEXT_COLOR_MEDIUM,
    textAlign: 'center',
    marginBottom: 10,
  },
  fallbackLink: {
    fontSize: 16,
    color: PRIMARY_COLOR,
    fontWeight: 'bold',
  }
});

export default AdminDashboard;