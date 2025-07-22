// 📂 File: src/screens/StudentDashboard.tsx (COMPLETE AND RESTYLED)

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, SafeAreaView, Dimensions, Image, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

// --- FUNCTIONALITY IMPORTS ---
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../../apiConfig';

// --- COMPONENT IMPORTS ---
import StudentNotifications, { initialNotificationsData } from './StudentNotifications';
import AcademicCalendar from './AcademicCalendar';
import StudentResultsScreen from '../screens/results/StudentResultsScreen';
import TransportScreen from '../screens/transport/TransportScreen';
import StudentExamsScreen from '../screens/exams/StudentExamsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import StudentExamScreen from '../screens/exams_Schedule/StudentExamScreen';
import TimetableScreen from '../screens/TimetableScreen'; 
import AttendanceScreen from '../screens/AttendanceScreen';
import StudentHealthScreen from '../screens/health/StudentHealthScreen';
import StudentSportsScreen from '../screens/sports/StudentSportsScreen';
import StudentEventsScreen from '../screens/events/StudentEventsScreen';
import UserHelpDeskScreen from '../screens/helpdesk/UserHelpDeskScreen';
import StudentPTMScreen from '../screens/ptm/StudentPTMScreen';
import StudentLabsScreen from '../screens/labs/StudentLabsScreen';
import StudentHomeworkScreen from '../screens/homework/StudentHomeworkScreen';
import StudentMaterialsScreen from '../screens/study-materials/StudentMaterialsScreen';
import StudentSyllabusScreen from '../screens/syllabus/StudentSyllabusScreen';
import AboutUs from './AboutUs';
import ChatAIScreen from '../screens/chatai/ChatAIScreen';
import FoodScreen from '../screens/food/FoodScreen';

// --- TYPE DEFINITION for profile data from API ---
interface ProfileData {
  full_name: string;
  profile_image_url?: string;
  role: string;
}

// --- CONSTANTS & COLORS (Styled to match Teacher Dashboard) ---
const { width: windowWidth } = Dimensions.get('window');
const CARD_GAP = 12;
const CONTENT_HORIZONTAL_PADDING = 15;
const BOTTOM_NAV_HEIGHT = 70;
const PRIMARY_COLOR = '#008080';
const SECONDARY_COLOR = '#e0f2f7';
const TERTIARY_COLOR = '#F4F6F8';
const TEXT_COLOR_DARK = '#37474F';
const TEXT_COLOR_MEDIUM = '#566573';
const BORDER_COLOR = '#E0E0E0';
const WHITE = '#ffffff';
const DANGER_COLOR = '#E53935';

const StudentDashboard = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('home');
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      try {
        const response = await fetch(`${API_BASE_URL}/api/profiles/${user.id}`);
        if (response.ok) {
          setProfile(await response.json());
        } else {
          console.error("Failed to fetch profile");
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };
    fetchProfile();
  }, [user]);

  const profileImageSource = profile?.profile_image_url
    ? { uri: `${API_BASE_URL}${profile.profile_image_url}` }
    : require('../assets/profile.png');

  const initialUnreadCount = initialNotificationsData.filter(n => !n.read).length;
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(initialUnreadCount);

  const allQuickAccessItems = [
    { id: 'qa2', title: 'Timetable', imageSource: 'https://cdn-icons-png.flaticon.com/128/1254/1254275.png', navigateToTab: 'Timetable' },
    { id: 'qa3', title: 'Attendance', imageSource: 'https://cdn-icons-png.flaticon.com/128/10293/10293877.png', navigateToTab: 'Attendance' },
    { id: 'qa4', title: 'Syllabus', imageSource: 'https://cdn-icons-png.flaticon.com/128/1584/1584937.png', navigateToTab: 'StudentSyllabusScreen' },
    { id: 'qa7', title: 'Exam Schedule', imageSource: 'https://cdn-icons-png.flaticon.com/128/4029/4029113.png', navigateToTab: 'StudentExamScreen' },
    { id: 'qa5', title: 'Exams', imageSource: 'https://cdn-icons-png.flaticon.com/128/207/207190.png',  navigateToTab: 'StudentExamsScreen' },
    { id: 'qa6', title: 'Reports', imageSource: 'https://cdn-icons-png.flaticon.com/128/9913/9913576.png', navigateToTab: 'StudentResultsScreen' },
    { id: 'qa15', title: 'Study materials', imageSource: 'https://cdn-icons-png.flaticon.com/128/3273/3273259.png', navigateToTab: 'StudentMaterialsScreen' },
    { id: 'qa14', title: 'Home Work', imageSource: 'https://cdn-icons-png.flaticon.com/128/11647/11647336.png', navigateToTab: 'StudentHomeworkScreen' },
    { id: 'qa8', title: 'Digital Labs', imageSource: 'https://cdn-icons-png.flaticon.com/128/9562/9562280.png', navigateToTab: 'StudentLabsScreen' },
    { id: 'qa9', title: 'Sports', imageSource: 'https://cdn-icons-png.flaticon.com/128/3429/3429456.png', navigateToTab: 'StudentSportsScreen' },
    { id: 'qa10', title: 'Health Info', imageSource: 'https://cdn-icons-png.flaticon.com/128/3004/3004458.png', navigateToTab: 'StudentHealthScreen' },
    { id: 'qa13', title: 'Events', imageSource: 'https://cdn-icons-png.flaticon.com/128/9592/9592283.png', navigateToTab: 'StudentEventsScreen' },
    { id: 'qa11', title: 'PTM', imageSource: 'https://cdn-icons-png.flaticon.com/128/17588/17588666.png', navigateToTab: 'StudentPTMScreen' },
    { id: 'qa1', title: "Transport", imageSource: "https://cdn-icons-png.flaticon.com/128/2945/2945694.png", navigateToTab: 'TransportScreen' },
    { id: 'qa12', title: 'Help Desk', imageSource: 'https://cdn-icons-png.flaticon.com/128/4961/4961736.png', navigateToTab: 'UserHelpDeskScreen' },
    { id: 'qa18', title: 'Gallery', imageSource: 'https://cdn-icons-png.flaticon.com/128/8418/8418513.png', navigateTo: 'Gallery' },
    { id: 'qa19', title: 'About Us', imageSource: 'https://cdn-icons-png.flaticon.com/128/3815/3815523.png', navigateToTab: 'AboutUs' },
    { id: 'qa20', title: 'Chat AI', imageSource: 'https://cdn-icons-png.flaticon.com/128/6028/6028616.png', navigateToTab: 'ChatAI' },
    { id: 'qa25', title: 'Food', imageSource: 'https://cdn-icons-png.flaticon.com/128/2276/2276931.png', navigateToTab: 'FoodScreen' },
  ];

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to log out?", [{ text: "Cancel", style: "cancel" }, { text: "Logout", onPress: () => logout(), style: "destructive" }], { cancelable: true });
  };

  const handleBellIconClick = () => setActiveTab('allNotifications');

  const DashboardSectionCard = ({ title, imageSource, onPress }) => ( <TouchableOpacity style={styles.dashboardCard} onPress={onPress}><View style={styles.cardIconContainer}><Image source={{ uri: imageSource }} style={styles.cardImage} /></View><Text style={styles.cardTitle}>{title}</Text></TouchableOpacity> );
  const ContentScreenHeader = ({ title, onBack = () => setActiveTab('home') }) => ( <View style={styles.contentHeader}><TouchableOpacity onPress={onBack} style={styles.backButtonGlobal}><MaterialIcons name="arrow-back" size={24} color={PRIMARY_COLOR} /></TouchableOpacity><Text style={styles.contentHeaderTitle}>{title}</Text><View style={{ width: 30 }} /></View> );
  const BottomNavItem = ({ icon, label, isActive, onPress }) => (<TouchableOpacity style={styles.navItem} onPress={onPress}><Icon name={icon} size={isActive ? 24 : 22} color={isActive ? PRIMARY_COLOR : TEXT_COLOR_MEDIUM} /><Text style={[styles.navText, isActive && styles.navTextActive]}>{label}</Text></TouchableOpacity>);

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return ( 
            <ScrollView>
                <View style={styles.dashboardGrid}>
                    {allQuickAccessItems.map(item => ( 
                        <DashboardSectionCard 
                            key={item.id} 
                            title={item.title} 
                            imageSource={item.imageSource} 
                            onPress={() => {
                                if (item.navigateTo) { navigation.navigate(item.navigateTo); } 
                                else if (item.navigateToTab) { setActiveTab(item.navigateToTab); } 
                                else { Alert.alert(item.title, `Coming soon!`); }
                            }} 
                        /> 
                    ))}
                </View>
            </ScrollView> 
        );
      case 'allNotifications': return ( <> <ContentScreenHeader title="Notifications" /> <StudentNotifications onUnreadCountChange={setUnreadNotificationsCount} /> </> );
      case 'calendar': return <AcademicCalendar />;
      case 'profile': return <ProfileScreen onBackPress={() => setActiveTab('home')} />;
      case 'StudentHealthScreen': return ( <><ContentScreenHeader title="Health Information" /><StudentHealthScreen /></> );
      case 'UserHelpDeskScreen': return ( <><ContentScreenHeader title="Help Desk" /><UserHelpDeskScreen /></> );
      case 'StudentSportsScreen': return ( <><ContentScreenHeader title="Sports" /><StudentSportsScreen /></> );
      case 'StudentEventsScreen': return ( <><ContentScreenHeader title="Events" /><StudentEventsScreen /></> );
      case 'StudentPTMScreen': return ( <><ContentScreenHeader title="Parents-Teachers Meetings" /><StudentPTMScreen /></> );
      case 'StudentLabsScreen': return ( <><ContentScreenHeader title="Digital Labs" /><StudentLabsScreen /></> );
      case 'StudentHomeworkScreen': return ( <><ContentScreenHeader title="Home Work" /><StudentHomeworkScreen /></> );
      case 'StudentExamScreen': return ( <><ContentScreenHeader title="Exam Schedules" /><StudentExamScreen /></> );
      case 'StudentMaterialsScreen': return ( <><ContentScreenHeader title="Study Materials" /><StudentMaterialsScreen /></> );
      case 'StudentExamsScreen': return ( <><ContentScreenHeader title="Exams" /><StudentExamsScreen /></> );
      case 'StudentSyllabusScreen': return ( <><ContentScreenHeader title="Syllabus" /><StudentSyllabusScreen /></> );
      case 'TransportScreen': return ( <><ContentScreenHeader title="Transport" /><TransportScreen /></> );
      case 'StudentResultsScreen': return ( <><ContentScreenHeader title="My Reports" /><StudentResultsScreen navigation={navigation} /></> );
      case 'Timetable': return ( <><ContentScreenHeader title="Time Table" /><TimetableScreen /></> );
      case 'Attendance': return ( <><ContentScreenHeader title="Attendance" /><AttendanceScreen /></> );
      case 'AboutUs': return ( <><ContentScreenHeader title="About Us" /><AboutUs /></> );
      case 'ChatAI': return ( <><ContentScreenHeader title="AI Assistant" /><ChatAIScreen /></> );
      case 'FoodScreen': return ( <><ContentScreenHeader title="Food" /><FoodScreen /></> );

      default: return ( <View style={styles.fallbackContent}><Text style={styles.fallbackText}>Content for '{activeTab}' is not available.</Text><TouchableOpacity onPress={() => setActiveTab('home')}><Text style={styles.fallbackLink}>Go to Home</Text></TouchableOpacity></View> );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {activeTab === 'home' && (
        <View style={styles.topBar}>
          <View style={styles.profileContainer}>
            <Image source={profileImageSource} style={styles.profileImage} />
            <View style={styles.profileTextContainer}>
              <Text style={styles.profileNameText}>{profile?.full_name || 'Loading...'}</Text>
              <Text style={styles.profileRoleText}>{profile?.role ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1) : 'Student'}</Text>
            </View>
          </View>
          <View style={styles.topBarActions}>
            <TouchableOpacity onPress={handleBellIconClick} style={styles.iconButton}>
                <MaterialIcons name="notifications-none" size={26} color={PRIMARY_COLOR} />
                {unreadNotificationsCount > 0 && ( <View style={styles.notificationCountBubble}><Text style={styles.notificationCountText}>{unreadNotificationsCount}</Text></View> )}
            </TouchableOpacity>
            <TouchableOpacity onPress={handleLogout} style={styles.iconButton}>
                <MaterialIcons name="logout" size={24} color={PRIMARY_COLOR} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {renderContent()}

      <View style={styles.bottomNav}>
        <BottomNavItem icon="home" label="Home" isActive={activeTab === 'home'} onPress={() => setActiveTab('home')} />
        <BottomNavItem icon="calendar" label="Calendar" isActive={activeTab === 'calendar'} onPress={() => setActiveTab('calendar')} />
        <BottomNavItem icon="user" label="Profile" isActive={activeTab === 'profile'} onPress={() => setActiveTab('profile')} />
      </View>
    </SafeAreaView>
  );
};

// --- STYLES (COMPLETE AND MATCHING TEACHER DASHBOARD) ---
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: TERTIARY_COLOR },
  topBar: {
    backgroundColor: SECONDARY_COLOR,
    paddingHorizontal: 15,
    paddingVertical: Platform.OS === 'ios' ? 12 : 15,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#455A64',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    borderBottomWidth: 1,
    borderBottomColor: BORDER_COLOR,
  },
  profileContainer: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 10 },
  profileImage: { width: 45, height: 45, borderRadius: 22.5, borderWidth: 2, borderColor: PRIMARY_COLOR, backgroundColor: '#e0e0e0' },
  profileTextContainer: { marginLeft: 12, flex: 1 },
  profileNameText: { color: PRIMARY_COLOR, fontSize: 18, fontWeight: 'bold' },
  profileRoleText: { color: TEXT_COLOR_MEDIUM, fontSize: 14 },
  topBarActions: { flexDirection: 'row', alignItems: 'center' },
  iconButton: { position: 'relative', padding: 8 },
  notificationCountBubble: {
    position: 'absolute',
    top: 3,
    right: 3,
    backgroundColor: DANGER_COLOR,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  notificationCountText: { color: WHITE, fontSize: 11, fontWeight: 'bold' },
  contentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: SECONDARY_COLOR,
    borderBottomWidth: 1,
    borderBottomColor: BORDER_COLOR,
  },
  backButtonGlobal: { padding: 5 },
  contentHeaderTitle: { fontSize: 20, fontWeight: 'bold', color: PRIMARY_COLOR, textAlign: 'center', flex: 1 },
  dashboardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: CONTENT_HORIZONTAL_PADDING,
    paddingTop: 15,
  },
  dashboardCard: {
    width: (windowWidth - (CONTENT_HORIZONTAL_PADDING * 2) - (CARD_GAP * 2)) / 3,
    borderRadius: 10,
    paddingVertical: 15,
    marginBottom: CARD_GAP,
    alignItems: 'center',
    justifyContent: 'center',
    height: 115,
    backgroundColor: WHITE,
    shadowColor: '#455A64',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
  },
  cardIconContainer: { width: 45, height: 45, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  cardImage: { width: 38, height: 38, resizeMode: 'contain' },
  cardTitle: { fontSize: 11, fontWeight: '600', color: TEXT_COLOR_DARK, textAlign: 'center', lineHeight: 14, paddingHorizontal: 4 },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: SECONDARY_COLOR,
    borderTopWidth: 1,
    borderTopColor: BORDER_COLOR,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    paddingBottom: Platform.OS === 'ios' ? 20 : 8,
    minHeight: BOTTOM_NAV_HEIGHT,
  },
  navItem: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 5 },
  navText: { fontSize: 10, color: TEXT_COLOR_MEDIUM, marginTop: 3 },
  navTextActive: { color: PRIMARY_COLOR, fontWeight: 'bold' },
  fallbackContent: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: TERTIARY_COLOR },
  fallbackText: { fontSize: 16, color: TEXT_COLOR_MEDIUM, textAlign: 'center', marginBottom: 10 },
  fallbackLink: { fontSize: 16, color: PRIMARY_COLOR, fontWeight: 'bold' } // Added missing fallbackLink style
});

export default StudentDashboard;