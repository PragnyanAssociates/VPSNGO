import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, SafeAreaView, Dimensions, Image, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../context/AuthContext'; // Ensure this path is correct
import { API_BASE_URL } from '../../apiConfig'; // Ensure this path is correct

// Import all your other component screens
import TeacherNotifications, { initialNotificationsData } from './TeacherNotifications';
import ProfileScreen from '../screens/ProfileScreen';
import AcademicCalendar from './AcademicCalendar';
import TeacherHI from './TeacherHI';
import TeacherEvents from './TeacherEvents';
import TeacherPTM from './TeacherPTM';
import TeacherHomework from './TeacherHomework';
import TeacherResults from './TeacherResults';
import TeacherAttendance from './TeacherAttendance';
import TeacherTB from './TeacherTB';
import TeacherSyllabus from './TeacherSyllabus';
import TeacherCL from './TeacherCL';

// --- Type Definition for Profile Data ---
interface ProfileData {
  full_name: string;
  class_group: string;
  profile_image_url?: string;
  role: string;
}

// --- Constants & Color Scheme ---
const { width: windowWidth } = Dimensions.get('window');
const CARD_GAP = 12;
const CONTENT_HORIZONTAL_PADDING = 15;
const BOTTOM_NAV_HEIGHT = 70;

const PRIMARY_COLOR = '#008080';
const SECONDARY_COLOR = '#e0f2f7';
const TERTIARY_COLOR = '#f8f8ff';
const TEXT_COLOR_DARK = '#333333';
const TEXT_COLOR_MEDIUM = '#555555';
const BORDER_COLOR = '#b2ebf2';
const WHITE = '#ffffff';
const DANGER_COLOR = '#dc3545';

// --- Main Component ---
const TeacherDashboard = () => {
  const [activeTab, setActiveTab] = useState('home');
  // ✅ This hook now correctly connects to the fixed AuthContext
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
            console.error("Dashboard: Failed to fetch profile data, status:", response.status);
        }
      } catch (error) {
        console.error("Dashboard: Error fetching profile:", error);
      }
    };

    if (activeTab === 'home') {
      fetchProfile();
    }
  }, [user, activeTab]);

  const capitalize = (s: string) => s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
  
  const profileImageSource = profile?.profile_image_url
    ? { uri: `${API_BASE_URL}${profile.profile_image_url}` }
    : require('../assets/profile.png');

  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(
    initialNotificationsData.filter(n => !n.read).length
  );

  // ✅ CRITICAL FIX: The logout handler is now standardized and robust.
  // It calls the `logout` function from the context, which will trigger
  // the navigator in App.tsx to switch to the login screen.
  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to log out?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Logout",
          onPress: () => logout(), // This is the key call
          style: "destructive",
        },
      ]
    );
  };

  const allQuickAccessItems = [
    { id: 'qa1', title: 'Student History', imageSource: 'https://cdn-icons-png.flaticon.com/128/4207/4207253.png' },
    { id: 'qa2', title: 'Timetable', imageSource: 'https://cdn-icons-png.flaticon.com/128/1254/1254275.png', navigateToTab: 'TeacherTB' },
    { id: 'qa3', title: 'Attendance', imageSource: 'https://cdn-icons-png.flaticon.com/128/10293/10293877.png', navigateToTab: 'TeacherAttendance' },
    { id: 'qa4', title: 'Syllabus', imageSource: 'https://cdn-icons-png.flaticon.com/128/1584/1584937.png', navigateToTab: 'TeacherSyllabus' },
    { id: 'qa15', title: 'Study materials', imageSource: 'https://cdn-icons-png.flaticon.com/128/3273/3273259.png' },
    { id: 'qa5', title: 'Exams', imageSource: 'https://cdn-icons-png.flaticon.com/128/207/207190.png' },
    { id: 'qa14', title: 'Home Work', imageSource: 'https://cdn-icons-png.flaticon.com/128/3150/3150521.png', navigateToTab: 'TeacherHomework' },
    { id: 'qa6', title: 'Results', imageSource: 'https://cdn-icons-png.flaticon.com/128/9913/9913576.png', navigateToTab: 'TeacherResults' },
    { id: 'qa7', title: 'Exam Schedule', imageSource: 'https://cdn-icons-png.flaticon.com/128/4029/4029113.png' },
    { id: 'qa8', title: 'Digital Labs', imageSource: 'https://cdn-icons-png.flaticon.com/128/9562/9562280.png' },
    { id: 'qa9', title: 'Sports', imageSource: 'https://cdn-icons-png.flaticon.com/128/3429/3429456.png' },
    { id: 'qa10', title: 'Health Info', imageSource: 'https://cdn-icons-png.flaticon.com/128/3004/3004458.png', navigateToTab: 'TeacherHI' },
    { id: 'qa11', title: 'PTM', imageSource: 'https://cdn-icons-png.flaticon.com/128/17588/17588666.png', navigateToTab: 'TeacherPTM' },
    { id: 'qa13', title: 'Events', imageSource: 'https://cdn-icons-png.flaticon.com/128/9592/9592283.png', navigateToTab: 'TeacherEvents' },
    { id: 'qa16', title: 'Communications', imageSource: 'https://cdn-icons-png.flaticon.com/128/3050/3050525.png', navigateToTab: 'TeacherCL' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'home': return (<ScrollView style={styles.contentScrollView} contentContainerStyle={styles.contentScrollViewContainer}><View style={styles.dashboardGrid}>{allQuickAccessItems.map(item => (<DashboardSectionCard key={item.id} title={item.title} imageSource={item.imageSource} onPress={() => { if (item.navigateToTab) { setActiveTab(item.navigateToTab); } else { Alert.alert(item.title, `Action for ${item.title}`); }}}/>))}</View></ScrollView>);
      case 'allNotifications': return (<><ContentScreenHeader title="Notifications" /><TeacherNotifications onUnreadCountChange={setUnreadNotificationsCount} /></>);
      case 'calendar': return <AcademicCalendar />;
      case 'profile': return <ProfileScreen onBackPress={() => setActiveTab('home')} />;
      case 'TeacherHI': return <><ContentScreenHeader title="Health Information" /><TeacherHI /></>;
      case 'TeacherEvents': return <><ContentScreenHeader title="Events" /><TeacherEvents /></>;
      case 'TeacherPTM': return <><ContentScreenHeader title="Parents-Teachers Meetings" /><TeacherPTM /></>;
      case 'TeacherHomework': return <><ContentScreenHeader title="Home Work" /><TeacherHomework /></>;
      case 'TeacherResults': return <><ContentScreenHeader title="Results" /><TeacherResults /></>;
      case 'TeacherAttendance': return <><ContentScreenHeader title="Attendance" /><TeacherAttendance /></>;
      case 'TeacherTB': return <><ContentScreenHeader title="Time Table" /><TeacherTB /></>;
      case 'TeacherCL': return <><ContentScreenHeader title="Communications" /><TeacherCL /></>;
      case 'TeacherSyllabus': return <><ContentScreenHeader title="Syllabus" /><TeacherSyllabus /></>;
      default: return (<><ContentScreenHeader title={capitalize(activeTab)} /><View style={styles.fallbackContent}><Text style={styles.fallbackText}>Content for '{activeTab}' is not available yet.</Text></View></>);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {activeTab === 'home' && (
        <View style={styles.topBar}>
          <View style={styles.profileContainer}>
            <Image source={profileImageSource} style={styles.profileImage} />
            <View style={styles.profileTextContainer}>
              <Text style={styles.profileNameText} numberOfLines={1}>{profile?.full_name || user?.username || 'Teacher'}</Text>
              <Text style={styles.profileRoleText}>{profile?.class_group || capitalize(profile?.role || user?.role || '')}</Text>
            </View>
          </View>
          <View style={styles.topBarActions}>
            <TouchableOpacity onPress={() => setActiveTab('allNotifications')} style={styles.iconButton}>
              {/* ✨ IMPROVEMENT: Using vector icons for consistency and performance. */}
              <MaterialIcons name="notifications-none" size={26} color={PRIMARY_COLOR} />
              {unreadNotificationsCount > 0 && (<View style={styles.notificationCountBubble}><Text style={styles.notificationCountText}>{unreadNotificationsCount}</Text></View>)}
            </TouchableOpacity>
            <TouchableOpacity onPress={handleLogout} style={styles.iconButton}>
              <MaterialIcons name="logout" size={24} color={PRIMARY_COLOR} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {renderContent()}

      <View style={styles.bottomNav}>
        {/* ✨ IMPROVEMENT: Using a reusable component for bottom navigation. */}
        <BottomNavItem icon="home" label="Home" isActive={activeTab === 'home'} onPress={() => setActiveTab('home')} />
        <BottomNavItem icon="calendar" label="Calendar" isActive={activeTab === 'calendar'} onPress={() => setActiveTab('calendar')} />
        <BottomNavItem icon="user" label="Profile" isActive={activeTab === 'profile'} onPress={() => setActiveTab('profile')} />
      </View>
    </SafeAreaView>
  );
};

// --- UI Helper Components ---
const DashboardSectionCard = ({ title, imageSource, onPress }: { title: string, imageSource: string, onPress: () => void }) => (
  <TouchableOpacity style={styles.dashboardCard} onPress={onPress}>
    <View style={styles.cardIconContainer}><Image source={{ uri: imageSource }} style={styles.cardImage} /></View>
    <Text style={styles.cardTitle}>{title}</Text>
  </TouchableOpacity>
);

const ContentScreenHeader = ({ title, onBack }: { title: string, onBack?: () => void }) => {
    const handleBack = onBack || (() => {/* Default back action if needed, though handled by default prop */});
    return (
        <View style={styles.contentHeader}>
            <TouchableOpacity onPress={handleBack} style={styles.backButtonGlobal}>
                <MaterialIcons name="arrow-back" size={24} color={PRIMARY_COLOR} />
            </TouchableOpacity>
            <Text style={styles.contentHeaderTitle}>{title}</Text>
            <View style={{ width: 30 }} />{/* Spacer to center title */}
        </View>
    );
};
ContentScreenHeader.defaultProps = { onBack: () => {} }; // This might be handled by App state, so a dummy is fine

const BottomNavItem = ({ icon, label, isActive, onPress }: { icon: string; label: string; isActive: boolean; onPress: () => void; }) => (
  <TouchableOpacity style={styles.navItem} onPress={onPress}>
    <Icon name={icon} size={isActive ? 24 : 22} color={isActive ? PRIMARY_COLOR : TEXT_COLOR_MEDIUM} />
    <Text style={[styles.navText, isActive && styles.navTextActive]}>{label}</Text>
  </TouchableOpacity>
);

// --- Styles ---
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: TERTIARY_COLOR },
  topBar: { backgroundColor: SECONDARY_COLOR, paddingHorizontal: 15, paddingVertical: Platform.OS === 'ios' ? 12 : 15, borderBottomLeftRadius: 20, borderBottomRightRadius: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3, borderBottomWidth: 1, borderBottomColor: BORDER_COLOR },
  profileContainer: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 10 },
  profileImage: { width: 45, height: 45, borderRadius: 22.5, borderWidth: 2, borderColor: PRIMARY_COLOR, backgroundColor: '#e0e0e0' },
  profileTextContainer: { marginLeft: 12, flex: 1 },
  profileNameText: { color: PRIMARY_COLOR, fontSize: 17, fontWeight: 'bold' },
  profileRoleText: { color: TEXT_COLOR_MEDIUM, fontSize: 13 },
  topBarActions: { flexDirection: 'row', alignItems: 'center' },
  iconButton: { position: 'relative', padding: 8 },
  notificationCountBubble: { position: 'absolute', top: 3, right: 3, backgroundColor: DANGER_COLOR, borderRadius: 10, minWidth: 20, height: 20, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 5 },
  notificationCountText: { color: WHITE, fontSize: 11, fontWeight: 'bold' },
  contentHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15, paddingVertical: 12, backgroundColor: SECONDARY_COLOR, borderBottomWidth: 1, borderBottomColor: BORDER_COLOR },
  backButtonGlobal: { padding: 5 },
  contentHeaderTitle: { fontSize: 18, fontWeight: 'bold', color: PRIMARY_COLOR, textAlign: 'center', flex: 1 },
  contentScrollView: { flex: 1 },
  contentScrollViewContainer: { paddingHorizontal: CONTENT_HORIZONTAL_PADDING, paddingTop: 15, paddingBottom: BOTTOM_NAV_HEIGHT + 20 },
  dashboardGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  dashboardCard: { width: (windowWidth - (CONTENT_HORIZONTAL_PADDING * 2) - (CARD_GAP * 2)) / 3, borderRadius: 12, paddingVertical: 15, marginBottom: CARD_GAP, alignItems: 'center', justifyContent: 'center', height: 115, backgroundColor: WHITE, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.10, shadowRadius: 1.84, elevation: 2 },
  cardIconContainer: { width: 45, height: 45, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  cardImage: { width: 38, height: 38, resizeMode: 'contain' },
  cardTitle: { fontSize: 11, fontWeight: '600', color: TEXT_COLOR_DARK, textAlign: 'center', lineHeight: 14, paddingHorizontal: 4 },
  bottomNav: { flexDirection: 'row', backgroundColor: SECONDARY_COLOR, borderTopWidth: 1, borderTopColor: BORDER_COLOR, paddingVertical: Platform.OS === 'ios' ? 10 : 8, paddingBottom: Platform.OS === 'ios' ? 20 : 8, shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 5, minHeight: BOTTOM_NAV_HEIGHT },
  navItem: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 5 },
  navText: { fontSize: 10, color: TEXT_COLOR_MEDIUM, marginTop: 3 },
  navTextActive: { color: PRIMARY_COLOR, fontWeight: 'bold' },
  fallbackContent: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: TERTIARY_COLOR },
  fallbackText: { fontSize: 16, color: TEXT_COLOR_MEDIUM, textAlign: 'center', marginBottom: 10 },
});

export default TeacherDashboard;