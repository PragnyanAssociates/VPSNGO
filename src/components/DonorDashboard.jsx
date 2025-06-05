// StudentDashboard.jsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, SafeAreaView, Dimensions, Image, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import DonorNotifications, { initialNotificationsData } from './DonorNotifications';
import DonorProfile from './DonorProfile';
import AcademicCalendar from './AcademicCalendar';
import DonorHelp from './DonorHelp';
import DonorSuggestions from './DonorSuggestions';
import DonorReceipts from './DonorReceipts';
import DonorPayments from './DonorPayments';
import DonorSI from './DonorSI';
import DonorSponsor from './DonorSponsor';

const { width: windowWidth } = Dimensions.get('window');

const CARD_GAP = 12;
const CONTENT_HORIZONTAL_PADDING = 15;
const BOTTOM_NAV_HEIGHT = 70;

const PRIMARY_COLOR = '#008080'; // Teal
const SECONDARY_COLOR = '#e0f2f7'; // Light Cyan
const TERTIARY_COLOR = '#f8f8ff'; // Ghost White (Page Background)
const TEXT_COLOR_DARK = '#333333';
const TEXT_COLOR_MEDIUM = '#555555';
const BORDER_COLOR = '#b2ebf2'; // Pale Cyan

// AllQuickAccessScreenContent - Kept for potential separate screen
const AllQuickAccessScreenContent = ({ allQuickAccessItems, onBackPress }) => {
  // This DashboardSectionCard definition should be local or imported if used here
  const LocalCard = ({ title, imageSource, onPress }) => (
    <TouchableOpacity style={allQuickAccessStyles.card} onPress={onPress}>
      <Image source={{ uri: imageSource }} style={allQuickAccessStyles.cardImage} />
      <Text style={allQuickAccessStyles.cardTitleText}>{title}</Text>
    </TouchableOpacity>
  );

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
            <LocalCard
              key={item.id}
              title={item.title}
              imageSource={item.imageSource}
              onPress={() => Alert.alert(item.title, `Navigating to ${item.title}...`)}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const allQuickAccessStyles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: TERTIARY_COLOR },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: SECONDARY_COLOR, paddingHorizontal: 15, paddingVertical: 12,
    borderBottomLeftRadius: 20, borderBottomRightRadius: 20, marginBottom: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1,
    shadowRadius: 3, elevation: 3, borderBottomWidth: 1, borderBottomColor: BORDER_COLOR,
  },
  backButton: { padding: 8 },
  headerTitle: { color: PRIMARY_COLOR, fontSize: 20, fontWeight: 'bold' },
  headerRightPlaceholder: { width: 40 },
  scrollViewContent: {
    paddingHorizontal: CONTENT_HORIZONTAL_PADDING, paddingVertical: 15,
    paddingBottom: BOTTOM_NAV_HEIGHT + 20,
  },
  dashboardGrid: {
    flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between',
    marginTop: 10,
  },
  card: { // Card style for AllQuickAccessScreenContent
    width: (windowWidth - (CONTENT_HORIZONTAL_PADDING * 2) - (CARD_GAP * 2)) / 3,
    backgroundColor: '#fff', borderRadius: 10, padding: 10, alignItems: 'center',
    marginBottom: CARD_GAP, shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08, shadowRadius: 2, elevation: 2, height: 120, justifyContent: 'center'
  },
  cardImage: { width: 50, height: 50, resizeMode: 'contain', marginBottom: 8 },
  cardTitleText: { fontSize: 11, color: TEXT_COLOR_DARK, textAlign: 'center', fontWeight: '500' },
});


const DonorDashboard = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('home');
  const [userProfile, setUserProfile] = useState({
    name: 'Allu Arjun',
    profileImage: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTFjDq3OY2InCSeoESM7MRUF3Vh96I48yz2gA&s',
    class: 'Donor',
    studentId: 'STU001',
    dob: '2008-07-15',
    gender: 'Male',
    email: 'Alluarjun@gmail.com',
    phone: '+91 98765 43210',
    address: '123, School Lane, Knowledge City, Hyderabad - 500081',
    rollNo: 'AA22',
    admissionDate: '2027-07-15',
  });

  const initialUnreadCount = initialNotificationsData.filter(n => !n.read).length;
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(initialUnreadCount);

  const allQuickAccessItems = [
    { id: 'qa1', title: 'Payments', imageSource: 'https://cdn-icons-png.flaticon.com/128/1198/1198291.png', navigateToTab: 'DonorPayments' },
    { id: 'qa2', title: 'Receipts & Invoices', imageSource: 'https://cdn-icons-png.flaticon.com/128/870/870128.png', navigateToTab: 'DonorReceipts' },
    { id: 'qa3', title: 'Gallery', imageSource: 'https://cdn-icons-png.flaticon.com/128/8418/8418513.png', navigateToTab: 'DonorSI' },
    { id: 'qa4', title: 'Suggestions', imageSource: 'https://cdn-icons-png.flaticon.com/128/9722/9722906.png', navigateToTab: 'DonorSuggestions' },
    { id: 'qa5', title: 'Help Desk', imageSource: 'https://cdn-icons-png.flaticon.com/128/4961/4961736.png', navigateToTab: 'DonorHelp' },
    { id: 'qa6', title: 'Sponsorship', imageSource: 'https://cdn-icons-png.flaticon.com/128/18835/18835518.png', navigateToTab: 'DonorSponsor' },
    
  ];

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to log out?",
      [{ text: "Cancel", style: "cancel" },
      { text: "Logout", onPress: () => {
          if (navigation && navigation.replace) { navigation.replace('HomeScreen'); }
          else { Alert.alert("Logout Simulated", "Would navigate to HomeScreen."); }
        }, style: "destructive" }
      ], { cancelable: true }
    );
  };

  const handleBellIconClick = () => setActiveTab('allNotifications');
  const handleUnreadCountChange = (count) => setUnreadNotificationsCount(count);

  const DashboardSectionCard = ({ title, imageSource, onPress }) => (
    <TouchableOpacity style={styles.dashboardCard} onPress={onPress}>
      <View style={styles.cardIconContainer}>
        <Image source={{ uri: imageSource }} style={styles.cardImage} />
      </View>
      <Text style={styles.cardTitle}>{title}</Text>
    </TouchableOpacity>
  );

  // Header with Back Button for sub-screens
  const ContentScreenHeader = ({ title, onBack = () => setActiveTab('home') }) => (
    <View style={styles.contentHeader}>
      <TouchableOpacity onPress={onBack} style={styles.backButtonGlobal}>
        <MaterialIcons name="arrow-back" size={24} color={PRIMARY_COLOR} />
      </TouchableOpacity>
      <Text style={styles.contentHeaderTitle}>{title}</Text>
      <View style={{ width: 30 }} /> {/* Spacer for balance */}
    </View>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <ScrollView
            style={styles.contentScrollView}
            contentContainerStyle={styles.contentScrollViewContainer}
          >
            <View style={styles.dashboardGrid}>
              {allQuickAccessItems.map(item => (
                <DashboardSectionCard
                  key={item.id} title={item.title} imageSource={item.imageSource}
                  onPress={() => {
                    if (item.navigateToTab) { setActiveTab(item.navigateToTab); }
                    else { Alert.alert(item.title, `Opening ${item.title}...`); }
                  }}
                />
              ))}
            </View>
          </ScrollView>
        );
      case 'allNotifications':
        return (
          <>
            <ContentScreenHeader title="Notifications" />
            <DonorNotifications onUnreadCountChange={handleUnreadCountChange} />
          </>
        );
      case 'calendar':
        return <AcademicCalendar />; // Assuming AcademicCalendar might have its own header or none
      case 'profile':
        return <DonorProfile userProfile={userProfile} onUpdateProfile={setUserProfile} />;
      case 'DonorSuggestions':
        return (
          <>
            <ContentScreenHeader title="Suggestions" />
            <DonorSuggestions />
            {/* Pass studentId={userProfile.studentId} if StudentHealth component uses it */}
          </>
        );
        case 'DonorHelp':
        return (
          <>
            <ContentScreenHeader title="Help Desk" />
            <DonorHelp />
            {/* Pass studentId={userProfile.studentId} if Student Help component uses it */}
          </>
        );
        case 'DonorReceipts':
        return (
          <>
            <ContentScreenHeader title="Receipts & Invoices" />
            <DonorReceipts />
            {/* Pass studentId={userProfile.studentId} if Student Sports component uses it */}
          </>
        );
        case 'DonorPayments':
        return (
          <>
            <ContentScreenHeader title="Payments" />
            <DonorPayments />
            {/* Pass studentId={userProfile.studentId} if Student Events component uses it */}
          </>
        );
        case 'DonorSponsor':
        return (
          <>
            <ContentScreenHeader title="Sponsorship" />
            <DonorSponsor />
            {/* Pass studentId={userProfile.studentId} if Parents-Teachers Meetings component uses it */}
          </>
        );
        case 'DonorSI':
        return (
          <>
            <ContentScreenHeader title="Gallery" />
            <DonorSI />
            {/* Pass studentId={userProfile.studentId} if Students Labs component uses it */}
          </>
        );
    //     case 'StudentHomework':
    //     return (
    //       <>
    //         <ContentScreenHeader title="Home Work" />
    //         <StudentHomework />
    //         {/* Pass studentId={userProfile.studentId} if Students Home Work component uses it */}
    //       </>
    //     );
    //     case 'StudentResults':
    //     return (
    //       <>
    //         <ContentScreenHeader title="Results" />
    //         <StudentResults />
    //         {/* Pass studentId={userProfile.studentId} if Students Home Work component uses it */}
    //       </>
    //     );
    //     case 'StudentSchedule':
    //     return (
    //       <>
    //         <ContentScreenHeader title="Schedules" />
    //         <StudentSchedule />
    //         {/* Pass studentId={userProfile.studentId} if Students Home Work component uses it */}
    //       </>
    //     );
    //     case 'StudentSM':
    //     return (
    //       <>
    //         <ContentScreenHeader title="Study Materials" />
    //         <StudentSM />
    //         {/* Pass studentId={userProfile.studentId} if Students Home Work component uses it */}
    //       </>
    //     );
    //     case 'StudentAttendance':
    //     return (
    //       <>
    //         <ContentScreenHeader title="Attendance" />
    //         <StudentAttendance />
    //         {/* Pass studentId={userProfile.studentId} if Students Home Work component uses it */}
    //       </>
    //     );
    //     case 'StudentAcademics':
    //     return (
    //       <>
    //         <ContentScreenHeader title="Academics" />
    //         <StudentAcademics />
    //         {/* Pass studentId={userProfile.studentId} if Students Home Work component uses it */}
    //       </>
    //     );

      default:
        return (
          <>
            <ContentScreenHeader title={activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} />
            <View style={styles.fallbackContent}>
              <Text style={styles.fallbackText}>Content for '{activeTab}' is not available yet.</Text>
              <TouchableOpacity onPress={() => setActiveTab('home')}>
                <Text style={styles.fallbackLink}>Go to Home</Text>
              </TouchableOpacity>
            </View>
          </>
        );
    }
  };

  const showMainTopBar = activeTab === 'home'; // Only show main top bar on home

  return (
    <SafeAreaView style={styles.safeArea}>
      {showMainTopBar && (
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
        {/* Example: Add a Health tab to bottom nav if desired */}
        {/* <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('studentHealth')}>
          <MaterialIcons name="favorite-border" size={24} color={activeTab === 'studentHealth' ? PRIMARY_COLOR : TEXT_COLOR_MEDIUM} />
          <Text style={[styles.navText, activeTab === 'studentHealth' && styles.navTextActive]}>Health</Text>
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
  safeArea: { flex: 1, backgroundColor: TERTIARY_COLOR },
  topBar: {
    backgroundColor: SECONDARY_COLOR, paddingHorizontal: 15,
    paddingVertical: Platform.OS === 'ios' ? 12 : 15,
    borderBottomLeftRadius: 20, borderBottomRightRadius: 20,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1,
    shadowRadius: 4, elevation: 3, borderBottomWidth: 1, borderBottomColor: BORDER_COLOR,
  },
  profileContainer: { flexDirection: 'row', alignItems: 'center' },
  profileImage: {
    width: 45, height: 45, borderRadius: 22.5,
    borderWidth: 2, borderColor: PRIMARY_COLOR,
  },
  profileTextContainer: { marginLeft: 12 },
  profileNameText: { color: PRIMARY_COLOR, fontSize: 17, fontWeight: 'bold' },
  profileRoleText: { color: TEXT_COLOR_MEDIUM, fontSize: 13 },
  topBarActions: { flexDirection: 'row', alignItems: 'center' },
  notificationBellContainer: { position: 'relative', padding: 8, marginRight: 5 },
  notificationBellIcon: { width: 24, height: 24, resizeMode: 'contain', tintColor: PRIMARY_COLOR },
  notificationCountBubble: {
    position: 'absolute', top: 3, right: 3, backgroundColor: '#ef4444',
    borderRadius: 10, minWidth: 20, height: 20,
    justifyContent: 'center', alignItems: 'center', paddingHorizontal: 5,
  },
  notificationCountText: { color: 'white', fontSize: 11, fontWeight: 'bold' },
  logoutButton: { padding: 8 },
  logoutIcon: { width: 22, height: 22, resizeMode: 'contain', tintColor: PRIMARY_COLOR },
  contentHeader: { // Header for sub-screens like Notifications, Health
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 15, paddingVertical: 12, backgroundColor: SECONDARY_COLOR,
    borderBottomWidth: 1, borderBottomColor: BORDER_COLOR,
    // Removed marginBottom, contentScrollView has paddingTop
  },
  backButtonGlobal: { padding: 5 },
  contentHeaderTitle: {
    fontSize: 18, fontWeight: 'bold', color: PRIMARY_COLOR,
    textAlign: 'center', flex: 1,
  },
  contentScrollView: { flex: 1 },
  contentScrollViewContainer: {
    paddingHorizontal: CONTENT_HORIZONTAL_PADDING, paddingTop: 15,
    paddingBottom: BOTTOM_NAV_HEIGHT + 20, // Space for bottom nav + extra
  },
  dashboardGrid: {
    flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between',
    // marginBottom handled by contentScrollViewContainer paddingBottom
  },
  dashboardCard: {
    width: (windowWidth - (CONTENT_HORIZONTAL_PADDING * 2) - (CARD_GAP * 2)) / 3,
    borderRadius: 12, paddingVertical: 15, marginBottom: CARD_GAP,
    alignItems: 'center', justifyContent: 'center', // Changed to center for better icon/text balance
    height: 115, // Slightly increased height
    backgroundColor: '#fff', shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.10,
    shadowRadius: 1.84, elevation: 2,
  },
  cardIconContainer: {
    width: 45, height: 45, justifyContent: 'center',
    alignItems: 'center', marginBottom: 8,
  },
  cardImage: { width: 38, height: 38, resizeMode: 'contain' },
  cardTitle: { // Title for dashboard cards
    fontSize: 11, fontWeight: '600', color: TEXT_COLOR_DARK,
    textAlign: 'center', lineHeight: 14, paddingHorizontal: 4,
    // Removed marginTop: 'auto' to rely on justifyContent of parent card
  },
  bottomNav: {
    flexDirection: 'row', backgroundColor: SECONDARY_COLOR,
    borderTopWidth: 1, borderTopColor: BORDER_COLOR,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    paddingBottom: Platform.OS === 'ios' ? 20 : 8, // Increased padding for iOS home indicator
    shadowColor: '#000', shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05, shadowRadius: 3, elevation: 5,
    minHeight: BOTTOM_NAV_HEIGHT,
  },
  navItem: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 5 },
  navText: { fontSize: 10, color: TEXT_COLOR_MEDIUM, marginTop: 3 },
  navTextActive: { color: PRIMARY_COLOR, fontWeight: 'bold' },
  fallbackContent: {
    flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20,
    backgroundColor: TERTIARY_COLOR, // Ensure background matches
  },
  fallbackText: { fontSize: 16, color: TEXT_COLOR_MEDIUM, textAlign: 'center', marginBottom: 10 },
  fallbackLink: { fontSize: 16, color: PRIMARY_COLOR, fontWeight: 'bold', marginTop: 10, padding: 10 },
});

export default DonorDashboard;