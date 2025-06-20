// 📂 File: src/components/AdminDashboard.tsx (CORRECTED IMPORT PATHS)

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, SafeAreaView, Dimensions, Image, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../../apiConfig';

import AdminNotifications, { initialNotificationsData } from './AdminNotifications';
import AcademicCalendar from './AcademicCalendar';
import AdminLM from './AdminLM';
import ProfileScreen from '../screens/ProfileScreen';
import TimetableScreen from '../screens/TimetableScreen';
import AttendanceScreen from '../screens/AttendanceScreen';
import TeacherHealthAdminScreen from '../screens/health/TeacherHealthAdminScreen';
import AdminSportsScreen from '../screens/sports/AdminSportsScreen';
import AdminEventsScreen from '../screens/events/AdminEventsScreen';
import AdminHelpDeskScreen from '../screens/helpdesk/AdminHelpDeskScreen';
import TeacherAdminPTMScreen from '../screens/ptm/TeacherAdminPTMScreen';
import TeacherAdminLabsScreen from '../screens/labs/TeacherAdminLabsScreen';
import TeacherAdminHomeworkScreen from '../screens/homework/TeacherAdminHomeworkScreen';
import TeacherAdminExamScreen from '../screens/exams_Schedule/TeacherAdminExamScreen';
import TeacherAdminExamsScreen from '../screens/exams/TeacherAdminExamsScreen';
import TeacherAdminMaterialsScreen from '../screens/study-materials/TeacherAdminMaterialsScreen';

interface ProfileData {
  full_name: string;
  profile_image_url?: string;
  role: string;
}

const { width: windowWidth } = Dimensions.get('window');
const CARD_GAP = 12;
const CONTENT_HORIZONTAL_PADDING = 15;
const BOTTOM_NAV_HEIGHT = 70;
const PRIMARY_COLOR = '#008080';
const SECONDARY_COLOR = '#e0f2f7';
const TERTIARY_COLOR = '#f8f8ff';
const TEXT_COLOR_DARK = '#333';
const TEXT_COLOR_MEDIUM = '#555';
const BORDER_COLOR = '#b2ebf2';

const AdminDashboard = () => {
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
        } else { console.error("Failed to fetch profile"); }
      } catch (error) { console.error("Error fetching profile:", error); }
    };
    fetchProfile();
  }, [user]);

  const profileImageSource = profile?.profile_image_url
    ? { uri: `${API_BASE_URL}${profile.profile_image_url}` }
    : require('../assets/profile.png');

  const initialUnreadCount = initialNotificationsData.filter(n => !n.read).length;
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(initialUnreadCount);

  const allQuickAccessItems = [
    { id: 'qa0', title: 'LM', imageSource: 'https://cdn-icons-png.flaticon.com/128/15096/15096966.png', navigateToTab: 'AdminLM' },
    { id: 'qa5', title: 'Time Table', imageSource: 'https://cdn-icons-png.flaticon.com/128/1254/1254275.png', navigateToTab: 'Timetable' },
    { id: 'qa3', title: 'Attendance', imageSource: 'https://cdn-icons-png.flaticon.com/128/10293/10293877.png', navigateToTab: 'Attendance' },
    { id: 'qa2', title: 'MI', imageSource: 'https://cdn-icons-png.flaticon.com/128/9195/9195955.png' },
    { id: 'qa4', title: 'Syllabus', imageSource: 'https://cdn-icons-png.flaticon.com/128/4728/4728712.png' },
    { id: 'qa6', title: 'Reports', imageSource: 'https://cdn-icons-png.flaticon.com/128/5369/5369986.png' },
    { id: 'qa7', title: 'Exam Schedule', imageSource: 'https://cdn-icons-png.flaticon.com/128/4029/4029113.png', navigateToTab: 'TeacherAdminExamScreen' },
    { id: 'qa8', title: 'Digital Labs', imageSource: 'https://cdn-icons-png.flaticon.com/128/9562/9562280.png', navigateToTab: 'TeacherAdminLabsScreen' },
    { id: 'qa9', title: 'Sports', imageSource: 'https://cdn-icons-png.flaticon.com/128/3429/3429456.png', navigateToTab: 'AdminSportsScreen' },
    { id: 'qa10', title: 'PTM', imageSource: 'https://cdn-icons-png.flaticon.com/128/17588/17588666.png', navigateToTab: 'TeacherAdminPTMScreen' },
    { id: 'qa11', title: 'Events', imageSource: 'https://cdn-icons-png.flaticon.com/128/9592/9592283.png', navigateToTab: 'AdminEventsScreen' },
    { id: 'qa12', title: 'Health Info', imageSource: 'https://cdn-icons-png.flaticon.com/128/3004/3004458.png', navigateToTab: 'TeacherHealthAdminScreen' },
    { id: 'qa13', title: 'Homework', imageSource: 'https://cdn-icons-png.flaticon.com/128/11647/11647336.png', navigateToTab: 'TeacherAdminHomeworkScreen' },
    { id: 'qa14', title: 'Help Desk', imageSource: 'https://cdn-icons-png.flaticon.com/128/4961/4961736.png', navigateToTab: 'AdminHelpDeskScreen' },
    { id: 'qa15', title: 'Exams', imageSource: 'https://cdn-icons-png.flaticon.com/128/207/207190.png', navigateToTab: 'TeacherAdminExamsScreen' },
    { id: 'qa16', title: 'Study Materials', imageSource: 'https://cdn-icons-png.flaticon.com/128/3273/3273259.png', navigateToTab: 'TeacherAdminMaterialsScreen' },
  ];

  const handleLogout = () => { Alert.alert("Logout", "Are you sure?", [{ text: "Cancel", style: "cancel" }, { text: "Logout", onPress: logout, style: "destructive" }]); };
  const handleBellIconClick = () => setActiveTab('allNotifications');
  const handleUnreadCountChange = (count) => setUnreadNotificationsCount(count);

  const DashboardSectionCard = ({ title, imageSource, onPress }) => ( <TouchableOpacity style={styles.dashboardCard} onPress={onPress}><View style={styles.cardIconContainer}><Image source={{ uri: imageSource }} style={styles.cardImage} /></View><Text style={styles.cardTitle}>{title}</Text></TouchableOpacity> );
  
  const ContentScreenHeader = ({ title, onBack }) => ( <View style={styles.contentHeader}><TouchableOpacity onPress={onBack} style={styles.backButtonGlobal}><MaterialIcons name="arrow-back" size={24} color={PRIMARY_COLOR} /></TouchableOpacity><Text style={styles.contentHeaderTitle}>{title}</Text><View style={{ width: 30 }} /></View> );

  const renderContent = () => {
    const handleBack = () => setActiveTab('home');

    switch (activeTab) {
      case 'home': return ( <ScrollView style={styles.contentScrollView} contentContainerStyle={styles.contentScrollViewContainer}><View style={styles.dashboardGrid}>{allQuickAccessItems.map(item => ( <DashboardSectionCard key={item.id} title={item.title} imageSource={item.imageSource} onPress={() => { if (item.navigateToTab) { setActiveTab(item.navigateToTab); } else { Alert.alert(item.title, `This feature is coming soon!`); }}}/> ))}</View></ScrollView> );
      case 'allNotifications': return ( <><ContentScreenHeader title="Notifications" onBack={handleBack} /><AdminNotifications onUnreadCountChange={handleUnreadCountChange} /></> );
      case 'calendar': return <AcademicCalendar onBackPress={handleBack} />;
      case 'profile': return <ProfileScreen onBackPress={handleBack} />;
      case 'AdminLM': return ( <><ContentScreenHeader title="Login Management" onBack={handleBack} /><AdminLM /></> );
      case 'Timetable': return ( <><ContentScreenHeader title="Time Table Management" onBack={handleBack} /><TimetableScreen /></> );
      case 'Attendance': return ( <><ContentScreenHeader title="Attendance" onBack={handleBack} /><AttendanceScreen /></> );
      case 'TeacherHealthAdminScreen': return ( <> <ContentScreenHeader title="Health Information" onBack={handleBack} /> <TeacherHealthAdminScreen /> </> );
      case 'AdminSportsScreen': return ( <> <ContentScreenHeader title="Sports" onBack={handleBack} /> <AdminSportsScreen /> </> );
      case 'AdminEventsScreen': return ( <> <ContentScreenHeader title="Events" onBack={handleBack} /> <AdminEventsScreen /> </> );
      case 'AdminHelpDeskScreen': return ( <> <ContentScreenHeader title="Help Desk" onBack={handleBack} /> <AdminHelpDeskScreen /> </> );
      case 'TeacherAdminPTMScreen': return ( <> <ContentScreenHeader title="Meetings" onBack={handleBack} /> <TeacherAdminPTMScreen /> </> );
      case 'TeacherAdminLabsScreen': return ( <> <ContentScreenHeader title="Digital Labs" onBack={handleBack} /> <TeacherAdminLabsScreen /> </> );
      case 'TeacherAdminHomeworkScreen': return ( <> <ContentScreenHeader title="Homework" onBack={handleBack} /> <TeacherAdminHomeworkScreen /> </> );
      case 'TeacherAdminExamScreen': return ( <> <ContentScreenHeader title="Exam Schedule" onBack={handleBack} /> <TeacherAdminExamScreen /> </> );
      case 'TeacherAdminExamsScreen': return ( <> <ContentScreenHeader title="Exams" onBack={handleBack} /> <TeacherAdminExamsScreen /> </> );
      case 'TeacherAdminMaterialsScreen': return ( <> <ContentScreenHeader title="Study Materials" onBack={handleBack} /> <TeacherAdminMaterialsScreen /> </> );

      default: return ( <View style={styles.fallbackContent}><Text style={styles.fallbackText}>Content for '{activeTab}' is not available.</Text><TouchableOpacity onPress={handleBack}><Text style={styles.fallbackLink}>Go to Home</Text></TouchableOpacity></View> );
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
              <Text style={styles.profileRoleText}>{profile?.role ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1) : 'Administrator'}</Text>
            </View>
          </View>
          <View style={styles.topBarActions}>
            <TouchableOpacity onPress={handleBellIconClick} style={styles.notificationBellContainer}>
              <Image source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3602/3602145.png' }} style={styles.notificationBellIcon} />
              {unreadNotificationsCount > 0 && ( <View style={styles.notificationCountBubble}><Text style={styles.notificationCountText}>{unreadNotificationsCount}</Text></View> )}
            </TouchableOpacity>
            <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}><Image source={{ uri: 'https://cdn-icons-png.flaticon.com/512/1828/1828479.png' }} style={styles.logoutIcon} /></TouchableOpacity>
          </View>
        </View>
      )}

      {renderContent()}

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('home')}><Icon name="home" size={24} color={activeTab === 'home' ? PRIMARY_COLOR : TEXT_COLOR_MEDIUM} /><Text style={[styles.navText, activeTab === 'home' && styles.navTextActive]}>Home</Text></TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('calendar')}><Icon name="calendar" size={24} color={activeTab === 'calendar' ? PRIMARY_COLOR : TEXT_COLOR_MEDIUM} /><Text style={[styles.navText, activeTab === 'calendar' && styles.navTextActive]}>Calendar</Text></TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('profile')}><Icon name="user" size={24} color={activeTab === 'profile' ? PRIMARY_COLOR : TEXT_COLOR_MEDIUM} /><Text style={[styles.navText, activeTab === 'profile' && styles.navTextActive]}>Profile</Text></TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// --- STYLES (Unchanged) ---
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: TERTIARY_COLOR, },
  topBar: { backgroundColor: SECONDARY_COLOR, paddingHorizontal: 15, paddingVertical: Platform.OS === 'ios' ? 12 : 15, borderBottomLeftRadius: 20, borderBottomRightRadius: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3, borderBottomWidth: 1, borderBottomColor: BORDER_COLOR, },
  profileContainer: { flexDirection: 'row', alignItems: 'center', },
  profileImage: { width: 45, height: 45, borderRadius: 22.5, borderWidth: 2, borderColor: PRIMARY_COLOR, backgroundColor: '#e0e0e0', },
  profileTextContainer: { marginLeft: 12, },
  profileNameText: { color: PRIMARY_COLOR, fontSize: 17, fontWeight: 'bold', },
  profileRoleText: { color: TEXT_COLOR_MEDIUM, fontSize: 13, },
  topBarActions: { flexDirection: 'row', alignItems: 'center', },
  notificationBellContainer: { position: 'relative', padding: 8, marginRight: 5, },
  notificationBellIcon: { width: 24, height: 24, resizeMode: 'contain', tintColor: PRIMARY_COLOR, },
  notificationCountBubble: { position: 'absolute', top: 3, right: 3, backgroundColor: '#ef4444', borderRadius: 10, minWidth: 20, height: 20, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 5, },
  notificationCountText: { color: 'white', fontSize: 11, fontWeight: 'bold', },
  logoutButton: { padding: 8, },
  logoutIcon: { width: 22, height: 22, resizeMode: 'contain', tintColor: PRIMARY_COLOR, },
  contentHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15, paddingVertical: 12, backgroundColor: SECONDARY_COLOR, borderBottomWidth: 1, borderBottomColor: BORDER_COLOR, },
  backButtonGlobal: { padding: 5, },
  contentHeaderTitle: { fontSize: 18, fontWeight: 'bold', color: PRIMARY_COLOR, textAlign: 'center', flex: 1, },
  contentScrollView: { flex: 1, },
  contentScrollViewContainer: { paddingHorizontal: CONTENT_HORIZONTAL_PADDING, paddingTop: 15, paddingBottom: BOTTOM_NAV_HEIGHT + 20, },
  dashboardGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', },
  dashboardCard: { width: (windowWidth - (CONTENT_HORIZONTAL_PADDING * 2) - (CARD_GAP * 2)) / 3, borderRadius: 12, paddingVertical: 15, marginBottom: CARD_GAP, alignItems: 'center', justifyContent: 'flex-start', height: 110, backgroundColor: '#fff', shadowColor: "#000", shadowOffset: { width: 0, height: 1, }, shadowOpacity: 0.10, shadowRadius: 1.84, elevation: 2, },
  cardIconContainer: { width: 45, height: 45, justifyContent: 'center', alignItems: 'center', marginBottom: 8, },
  cardImage: { width: 38, height: 38, resizeMode: 'contain', },
  cardTitle: { fontSize: 11, fontWeight: '600', color: TEXT_COLOR_DARK, textAlign: 'center', lineHeight: 14, paddingHorizontal: 4, marginTop: 'auto', },
  bottomNav: { flexDirection: 'row', backgroundColor: SECONDARY_COLOR, borderTopWidth: 1, borderTopColor: BORDER_COLOR, paddingVertical: Platform.OS === 'ios' ? 10 : 8, paddingBottom: Platform.OS === 'ios' ? 15 : 8, shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 5, minHeight: BOTTOM_NAV_HEIGHT, },
  navItem: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 5, },
  navText: { fontSize: 10, color: TEXT_COLOR_MEDIUM, marginTop: 3, },
  navTextActive: { color: PRIMARY_COLOR, fontWeight: 'bold', },
  fallbackContent: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, },
  fallbackText: { fontSize: 16, color: TEXT_COLOR_MEDIUM, textAlign: 'center', marginBottom: 10, },
  fallbackLink: { fontSize: 16, color: PRIMARY_COLOR, fontWeight: 'bold', }
});

export default AdminDashboard;