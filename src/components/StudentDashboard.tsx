import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, SafeAreaView, Dimensions, Image, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

// --- FUNCTIONALITY IMPORTS ---
// These imports will now be used to make the component functional
import { useAuth } from '../context/AuthContext'; // Ensure this path is correct
import { API_BASE_URL } from '../../apiConfig'; // Ensure this path is correct

// --- COMPONENT IMPORTS (As per your original file structure) ---
import StudentNotifications, { initialNotificationsData } from './StudentNotifications';
import StudentProfile from './StudentProfile';
import AcademicCalendar from './AcademicCalendar';
import StudentHealth from './StudentHealth'; // IMPORT StudentHealth
import StudentHelpdesk from './StudentHelpdesk';
import StudentSports from './StudentSports';
import StudentEvents from './StudentEvents';
import StudentPTM from './StudentPTM';
import StudentLabs from './StudentLabs';
import StudentHomework from './StudentHomework';
import StudentResults from './StudentResults';
import StudentSchedule from './StudentSchedule';
import StudentSM from './StudentSM';
import StudentAttendance from './StudentAttendance';
import StudentHistory from './StudentHistory';
import StudentTB from './StudentTB';
import StudentSyllabus from './StudentSyllabus';
import StudentExams from './StudentExams';

import ProfileScreen from '../screens/ProfileScreen';

// --- TYPE DEFINITION for profile data from API ---
interface ProfileData {
  full_name: string;
  profile_image_url?: string;
  role: string;
}

// --- CONSTANTS from your original file ---
const { width: windowWidth } = Dimensions.get('window');
const CARD_GAP = 12;
const CONTENT_HORIZONTAL_PADDING = 15;
const BOTTOM_NAV_HEIGHT = 70;

// --- COLORS from your original file ---
const PRIMARY_COLOR = '#008080';
const SECONDARY_COLOR = '#e0f2f7';
const TERTIARY_COLOR = '#f8f8ff';
const TEXT_COLOR_DARK = '#333';
const TEXT_COLOR_MEDIUM = '#555';
const BORDER_COLOR = '#b2ebf2';

const StudentDashboard = () => {
  const [activeTab, setActiveTab] = useState('home');
  
  // --- FUNCTIONAL STATE & HOOKS ---
  const { user, logout } = useAuth(); // Get user and logout function from context
  const [profile, setProfile] = useState<ProfileData | null>(null); // State to hold API data

  // useEffect to fetch profile data when the component loads
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return; // Don't fetch if there's no user
      try {
        const response = await fetch(`${API_BASE_URL}/api/profiles/${user.id}`);
        if (response.ok) {
          const data = await response.json();
          setProfile(data);
        } else {
          console.error("Failed to fetch profile");
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    fetchProfile();
  }, [user]); // Re-run this effect if the user object changes

  // Determine the profile image source dynamically
  const profileImageSource = profile?.profile_image_url
    ? { uri: `${API_BASE_URL}${profile.profile_image_url}` }
    : (profile?.full_name ? require('../assets/profile.png') : { uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTFjDq3OY2InCSeoESM7MRUF3Vh96I48yz2gA&s' }); // Use a fallback or the original image while loading


  const initialUnreadCount = initialNotificationsData.filter(n => !n.read).length;
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(initialUnreadCount);

  // --- UI & DATA from your original file ---
  const allQuickAccessItems = [
    { id: 'qa1', title: 'Student History', imageSource: 'https://cdn-icons-png.flaticon.com/128/4207/4207253.png', navigateToTab: 'StudentHistory' },
    { id: 'qa2', title: 'Timetable', imageSource: 'https://cdn-icons-png.flaticon.com/128/1254/1254275.png', navigateToTab: 'StudentTB' },
    { id: 'qa3', title: 'Attendance', imageSource: 'https://cdn-icons-png.flaticon.com/128/10293/10293877.png', navigateToTab: 'StudentAttendance' },
    { id: 'qa4', title: 'Syllabus', imageSource: 'https://cdn-icons-png.flaticon.com/128/1584/1584937.png', navigateToTab: 'StudentSyllabus' },
    { id: 'qa15', title: 'Study materials', imageSource: 'https://cdn-icons-png.flaticon.com/128/3273/3273259.png', navigateToTab: 'StudentSM' },
    { id: 'qa5', title: 'Exams', imageSource: 'https://cdn-icons-png.flaticon.com/128/207/207190.png',  navigateToTab: 'StudentExams' },
    { id: 'qa14', title: 'Home Work', imageSource: 'https://cdn-icons-png.flaticon.com/128/3150/3150521.png', navigateToTab: 'StudentHomework' },
    { id: 'qa6', title: 'Results', imageSource: 'https://cdn-icons-png.flaticon.com/128/9913/9913576.png', navigateToTab: 'StudentResults' },
    { id: 'qa7', title: 'Exam Schedule', imageSource: 'https://cdn-icons-png.flaticon.com/128/4029/4029113.png', navigateToTab: 'StudentSchedule' },
    { id: 'qa8', title: 'Digital Labs', imageSource: 'https://cdn-icons-png.flaticon.com/128/9562/9562280.png', navigateToTab: 'StudentLabs' },
    { id: 'qa9', title: 'Sports', imageSource: 'https://cdn-icons-png.flaticon.com/128/3429/3429456.png', navigateToTab: 'StudentSports' },
    { id: 'qa10', title: 'Health Info', imageSource: 'https://cdn-icons-png.flaticon.com/128/3004/3004458.png', navigateToTab: 'StudentHealth' },
    { id: 'qa11', title: 'PTM', imageSource: 'https://cdn-icons-png.flaticon.com/128/17588/17588666.png', navigateToTab: 'StudentPTM' },
    { id: 'qa13', title: 'Events', imageSource: 'https://cdn-icons-png.flaticon.com/128/9592/9592283.png', navigateToTab: 'StudentEvents' },
    { id: 'qa12', title: 'Help Desk', imageSource: 'https://cdn-icons-png.flaticon.com/128/4961/4961736.png', navigateToTab: 'StudentHelpdesk' },
  ];

  // --- FUNCTIONAL LOGOUT HANDLER ---
  const handleLogout = () => {
    Alert.alert(
      "Logout", "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          onPress: () => logout(), // This now calls the function from your AuthContext
          style: "destructive"
        }
      ],
      { cancelable: true }
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
  
  const ContentScreenHeader = ({ title, onBack = () => setActiveTab('home') }) => (
    <View style={styles.contentHeader}>
      <TouchableOpacity onPress={onBack} style={styles.backButtonGlobal}>
        <MaterialIcons name="arrow-back" size={24} color={PRIMARY_COLOR} />
      </TouchableOpacity>
      <Text style={styles.contentHeaderTitle}>{title}</Text>
      <View style={{ width: 30 }} />
    </View>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <ScrollView style={styles.contentScrollView} contentContainerStyle={styles.contentScrollViewContainer}>
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
                      Alert.alert(item.title, `This feature is coming soon!`);
                    }
                  }}
                />
              ))}
            </View>
          </ScrollView>
        );
      case 'allNotifications':
        return (
          <>
            <ContentScreenHeader title="Notifications" onBack={() => setActiveTab('home')} />
            <AdminNotifications onUnreadCountChange={handleUnreadCountChange} />
          </>
        );
      case 'calendar':
        return <AcademicCalendar onBackPress={() => setActiveTab('home')} />;
      // case 'AdminstudentProfiles':
      //   return <AdminStudentProfiles onBackPress={() => setActiveTab('home')} />;
      case 'profile':
        // ProfileScreen is now a self-contained screen.
        // It fetches its own data using the AuthContext.
        return <ProfileScreen onBackPress={() => setActiveTab('home')} />;
      case 'StudentHealth':
        return (
          <>
            <ContentScreenHeader title="Health Information" />
            <StudentHealth />
            {/* Pass studentId={userProfile.studentId} if StudentHealth component uses it */}
          </>
        );
        case 'StudentHelpdesk':
        return (
          <>
            <ContentScreenHeader title="Help Desk" />
            <StudentHelpdesk />
            {/* Pass studentId={userProfile.studentId} if Student Help component uses it */}
          </>
        );
        case 'StudentSports':
        return (
          <>
            <ContentScreenHeader title="Sports" />
            <StudentSports />
            {/* Pass studentId={userProfile.studentId} if Student Sports component uses it */}
          </>
        );
        case 'StudentEvents':
        return (
          <>
            <ContentScreenHeader title="Events" />
            <StudentEvents />
            {/* Pass studentId={userProfile.studentId} if Student Events component uses it */}
          </>
        );
        case 'StudentPTM':
        return (
          <>
            <ContentScreenHeader title="Parents-Teachers Meetings" />
            <StudentPTM />
            {/* Pass studentId={userProfile.studentId} if Parents-Teachers Meetings component uses it */}
          </>
        );
        case 'StudentLabs':
        return (
          <>
            <ContentScreenHeader title="Digital Labs" />
            <StudentLabs />
            {/* Pass studentId={userProfile.studentId} if Students Labs component uses it */}
          </>
        );
        case 'StudentHomework':
        return (
          <>
            <ContentScreenHeader title="Home Work" />
            <StudentHomework />
            {/* Pass studentId={userProfile.studentId} if Students Home Work component uses it */}
          </>
        );
        case 'StudentResults':
        return (
          <>
            <ContentScreenHeader title="Results" />
            <StudentResults />
            {/* Pass studentId={userProfile.studentId} if Students Home Work component uses it */}
          </>
        );
        case 'StudentSchedule':
        return (
          <>
            <ContentScreenHeader title="Exam Schedules" />
            <StudentSchedule />
            {/* Pass studentId={userProfile.studentId} if Students Home Work component uses it */}
          </>
        );
        case 'StudentSM':
        return (
          <>
            <ContentScreenHeader title="Study Materials" />
            <StudentSM />
            {/* Pass studentId={userProfile.studentId} if Students Home Work component uses it */}
          </>
        );
        case 'StudentAttendance':
        return (
          <>
            <ContentScreenHeader title="Attendance" />
            <StudentAttendance />
            {/* Pass studentId={userProfile.studentId} if Students Home Work component uses it */}
          </>
        );
        case 'StudentHistory':
        return (
          <>
            <ContentScreenHeader title="Student History" />
            <StudentHistory />
            {/* Pass studentId={userProfile.studentId} if Students Home Work component uses it */}
          </>
        );
        case 'StudentTB':
        return (
          <>
            <ContentScreenHeader title="Time Table" />
            <StudentTB />
            {/* Pass studentId={userProfile.studentId} if Students Home Work component uses it */}
          </>
        );
        case 'StudentExams':
        return (
          <>
            <ContentScreenHeader title="Exams" />
            <StudentExams />
            {/* Pass studentId={userProfile.studentId} if Students Home Work component uses it */}
          </>
        );
        case 'StudentSyllabus':
        return (
          <>
            <ContentScreenHeader title="Syllabus" />
            <StudentSyllabus navigation={navigation} />
            {/* Pass studentId={userProfile.studentId} if Students Home Work component uses it */}
          </>
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
      {activeTab === 'home' && (
        <View style={styles.topBar}>
          <View style={styles.profileContainer}>
            {/* Display the profile image from the API */}
            <Image source={profileImageSource} style={styles.profileImage} />
            <View style={styles.profileTextContainer}>
              {/* Display the name and role from the API */}
              <Text style={styles.profileNameText}>{profile?.full_name || 'Loading...'}</Text>
              <Text style={styles.profileRoleText}>{profile?.role || 'Administrator'}</Text>
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
            {/* The logout button is now fully functional */}
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
        <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('profile')}>
          <Icon name="user" size={24} color={activeTab === 'profile' ? PRIMARY_COLOR : TEXT_COLOR_MEDIUM} />
          <Text style={[styles.navText, activeTab === 'profile' && styles.navTextActive]}>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// Styles are exactly the same as your original file
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: TERTIARY_COLOR,
  },
  topBar: {
    backgroundColor: SECONDARY_COLOR,
    paddingHorizontal: 15,
    paddingVertical: Platform.OS === 'ios' ? 12 : 15,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  },
  profileImage: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    borderWidth: 2,
    borderColor: PRIMARY_COLOR,
    backgroundColor: '#e0e0e0', // Added a background color for when the image is loading
  },
  profileTextContainer: {
    marginLeft: 12,
  },
  profileNameText: {
    color: PRIMARY_COLOR,
    fontSize: 17,
    fontWeight: 'bold',
  },
  profileRoleText: {
    color: TEXT_COLOR_MEDIUM,
    fontSize: 13,
  },
  topBarActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationBellContainer: {
    position: 'relative',
    padding: 8,
    marginRight: 5,
  },
  notificationBellIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
    tintColor: PRIMARY_COLOR,
  },
  notificationCountBubble: {
    position: 'absolute',
    top: 3,
    right: 3,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  notificationCountText: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
  },
  logoutButton: {
    padding: 8,
  },
  logoutIcon: {
    width: 22,
    height: 22,
    resizeMode: 'contain',
    tintColor: PRIMARY_COLOR,
  },
  contentHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 15, paddingVertical: 12, backgroundColor: SECONDARY_COLOR,
    borderBottomWidth: 1, borderBottomColor: BORDER_COLOR,
  },
  backButtonGlobal: {
    padding: 5,
  },
  contentHeaderTitle: {
    fontSize: 18, fontWeight: 'bold', color: PRIMARY_COLOR,
    textAlign: 'center', flex: 1,
  },
  contentScrollView: {
    flex: 1,
  },
  contentScrollViewContainer: {
    paddingHorizontal: CONTENT_HORIZONTAL_PADDING,
    paddingTop: 15,
    paddingBottom: BOTTOM_NAV_HEIGHT + 20,
  },
  dashboardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  dashboardCard: {
    width: (windowWidth - (CONTENT_HORIZONTAL_PADDING * 2) - (CARD_GAP * 2)) / 3,
    borderRadius: 12,
    paddingVertical: 15,
    marginBottom: CARD_GAP,
    alignItems: 'center',
    justifyContent: 'flex-start',
    height: 110,
    backgroundColor: '#fff',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1, },
    shadowOpacity: 0.10,
    shadowRadius: 1.84,
    elevation: 2,
  },
  cardIconContainer: {
    width: 45,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardImage: {
    width: 38,
    height: 38,
    resizeMode: 'contain',
  },
  cardTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: TEXT_COLOR_DARK,
    textAlign: 'center',
    lineHeight: 14,
    paddingHorizontal: 4,
    marginTop: 'auto',
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: SECONDARY_COLOR,
    borderTopWidth: 1,
    borderTopColor: BORDER_COLOR,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    paddingBottom: Platform.OS === 'ios' ? 15 : 8,
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
    justifyContent: 'center',
    paddingVertical: 5,
  },
  navText: {
    fontSize: 10,
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

export default StudentDashboard;