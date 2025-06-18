// 📂 File: src/components/DonorDashboard.tsx (FINAL - CORRECTED AND COMPLETE)

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  Dimensions,
  Image,
  Platform,
  ActivityIndicator,
} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../context/AuthContext'; // Import useAuth for logged-in user
import { API_BASE_URL } from '../../apiConfig';

// Import all screens that will be rendered inside this dashboard
import ProfileScreen, { ProfileData } from '../screens/ProfileScreen';
import AcademicCalendar from './AcademicCalendar';
import DonorNotifications, { initialNotificationsData } from './DonorNotifications';
import UserHelpDeskScreen from '../screens/helpdesk/UserHelpDeskScreen';
import DonorSuggestions from './DonorSuggestions';
import DonorReceipts from './DonorReceipts';
import DonorPayments from './DonorPayments';
import DonorSI from './DonorSI';
import DonorSponsor from './DonorSponsor';

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

// Quick access items defined outside the component to prevent re-creation on renders
const allQuickAccessItems = [
  { id: 'qa1', title: 'Payments', imageSource: 'https://cdn-icons-png.flaticon.com/128/1198/1198291.png', navigateToTab: 'DonorPayments' },
  { id: 'qa2', title: 'Receipts', imageSource: 'https://cdn-icons-png.flaticon.com/128/870/870128.png', navigateToTab: 'DonorReceipts' },
  { id: 'qa3', title: 'Gallery', imageSource: 'https://cdn-icons-png.flaticon.com/128/8418/8418513.png', navigateToTab: 'DonorSI' },
  { id: 'qa4', title: 'Suggestions', imageSource: 'https://cdn-icons-png.flaticon.com/128/9722/9722906.png', navigateToTab: 'DonorSuggestions' },
  { id: 'qa5', title: 'Help Desk', imageSource: 'https://cdn-icons-png.flaticon.com/128/4961/4961736.png', navigateToTab: 'HelpDesk' },
  { id: 'qa6', title: 'Sponsorship', imageSource: 'https://cdn-icons-png.flaticon.com/128/18835/18835518.png', navigateToTab: 'DonorSponsor' },
];

const DonorDashboard = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const { user, logout } = useAuth(); // Get the logged-in user

  // Fetch the logged-in donor's profile from the server
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) {
        setLoadingProfile(false);
        Alert.alert('Error', 'User not logged in.');
        return;
      }
      setLoadingProfile(true);
      try {
        const response = await fetch(`${API_BASE_URL}/api/profiles/${user.id}`);
        if (response.ok) {
          const data = await response.json();
          setProfile(data);
        } else {
          setProfile({
            id: user.id,
            username: user.username || 'Unknown',
            full_name: user.full_name || 'Donor',
            role: 'donor',
          });
        }
      } catch (e) {
        console.error('Failed to fetch donor profile', e);
        Alert.alert('Error', 'Failed to load profile. Please try again later.');
      } finally {
        setLoadingProfile(false);
      }
    };
    fetchProfile();
  }, [user]);

  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(
    initialNotificationsData.filter((n) => !n.read).length
  );

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', onPress: logout, style: 'destructive' },
    ]);
  };

  const getProfileImageSource = () => {
    if (profile?.profile_image_url?.startsWith('/uploads/')) {
      return { uri: `${API_BASE_URL}${profile.profile_image_url}` };
    }
    return require('../assets/profile.png');
  };

  // Render the correct screen within the dashboard layout
  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <ScrollView contentContainerStyle={styles.contentScrollViewContainer}>
            <View style={styles.dashboardGrid}>
              {allQuickAccessItems.map((item) => (
                <DashboardSectionCard
                  key={item.id}
                  title={item.title}
                  imageSource={item.imageSource}
                  onPress={() => item.navigateToTab ? setActiveTab(item.navigateToTab) : Alert.alert(item.title, 'Coming Soon')}
                />
              ))}
            </View>
          </ScrollView>
        );
      case 'profile':
        if (loadingProfile) {
          return (
            <View style={styles.centered}>
              <ActivityIndicator size="large" color={PRIMARY_COLOR} />
            </View>
          );
        }
        return <ProfileScreen onBackPress={() => setActiveTab('home')} />;
      case 'allNotifications':
        return (
          <>
            <ContentScreenHeader title="Notifications" onBack={() => setActiveTab('home')} />
            <DonorNotifications onUnreadCountChange={setUnreadNotificationsCount} />
          </>
        );
      case 'calendar':
        return (
          <>
            <ContentScreenHeader title="Academic Calendar" onBack={() => setActiveTab('home')} />
            <AcademicCalendar />
          </>
        );
      case 'DonorPayments':
        return (
          <>
            <ContentScreenHeader title="Payments" onBack={() => setActiveTab('home')} />
            <DonorPayments />
          </>
        );
      case 'DonorReceipts':
        return (
          <>
            <ContentScreenHeader title="Receipts & Invoices" onBack={() => setActiveTab('home')} />
            <DonorReceipts />
          </>
        );
      case 'DonorSI':
        return (
          <>
            <ContentScreenHeader title="Gallery" onBack={() => setActiveTab('home')} />
            <DonorSI />
          </>
        );
      case 'DonorSuggestions':
        return (
          <>
            <ContentScreenHeader title="Suggestions" onBack={() => setActiveTab('home')} />
            <DonorSuggestions />
          </>
        );
      case 'HelpDesk':
        return (
          <>
            <ContentScreenHeader title="Help Desk" onBack={() => setActiveTab('home')} />
            <UserHelpDeskScreen />
          </>
        );
      case 'DonorSponsor':
        return (
          <>
            <ContentScreenHeader title="Sponsorship" onBack={() => setActiveTab('home')} />
            <DonorSponsor />
          </>
        );
      default:
        return (
          <View style={styles.fallbackContent}>
            <Text style={styles.fallbackText}>Coming Soon</Text>
          </View>
        );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Conditionally show the top bar only on the 'home' tab */}
      {activeTab === 'home' && (
        <View style={styles.topBar}>
          <View style={styles.profileContainer}>
            <Image source={getProfileImageSource()} style={styles.logoImage} />
            <View style={styles.profileTextContainer}>
              <Text style={styles.profileNameText}>{profile?.full_name || user?.full_name || 'Donor Portal'}</Text>
              <Text style={styles.profileRoleText}>Donor</Text>
            </View>
          </View>
          <View style={styles.topBarActions}>
            <TouchableOpacity onPress={() => setActiveTab('allNotifications')} style={styles.iconButton}>
              <MaterialIcons name="notifications-none" size={26} color={PRIMARY_COLOR} />
              {unreadNotificationsCount > 0 && (
                <View style={styles.notificationCountBubble}>
                  <Text style={styles.notificationCountText}>{unreadNotificationsCount}</Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity onPress={handleLogout} style={styles.iconButton}>
              <MaterialIcons name="logout" size={26} color={PRIMARY_COLOR} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* The main content area where all sub-screens are rendered */}
      <View style={{ flex: 1 }}>{renderContent()}</View>

      {/* The Bottom Navigation Bar, always visible */}
      <View style={styles.bottomNav}>
        <BottomNavItem icon="home" label="Home" isActive={activeTab === 'home'} onPress={() => setActiveTab('home')} />
        <BottomNavItem
          icon="calendar"
          label="Calendar"
          isActive={activeTab === 'calendar'}
          onPress={() => setActiveTab('calendar')}
        />
        <BottomNavItem
          icon="user"
          label="Profile"
          isActive={activeTab === 'profile'}
          onPress={() => setActiveTab('profile')}
        />
      </View>
    </SafeAreaView>
  );
};

// --- Helper Components ---
const DashboardSectionCard = ({
  title,
  imageSource,
  onPress,
}: {
  title: string;
  imageSource: string;
  onPress: () => void;
}) => (
  <TouchableOpacity style={styles.dashboardCard} onPress={onPress}>
    <View style={styles.cardIconContainer}>
      <Image source={{ uri: imageSource }} style={styles.cardImage} />
    </View>
    <Text style={styles.cardTitle}>{title}</Text>
  </TouchableOpacity>
);

const ContentScreenHeader = ({ title, onBack }: { title: string; onBack: () => void }) => (
  <View style={styles.contentHeader}>
    <TouchableOpacity onPress={onBack} style={styles.backButtonGlobal}>
      <MaterialIcons name="arrow-back" size={24} color={PRIMARY_COLOR} />
    </TouchableOpacity>
    <Text style={styles.contentHeaderTitle}>{title}</Text>
    <View style={{ width: 30 }} />
  </View>
);

const BottomNavItem = ({
  icon,
  label,
  isActive,
  onPress,
}: {
  icon: string;
  label: string;
  isActive: boolean;
  onPress: () => void;
}) => (
  <TouchableOpacity style={styles.navItem} onPress={onPress}>
    <FontAwesome name={icon} size={isActive ? 24 : 22} color={isActive ? PRIMARY_COLOR : TEXT_COLOR_MEDIUM} />
    <Text style={[styles.navText, isActive && styles.navTextActive]}>{label}</Text>
  </TouchableOpacity>
);

// --- Styles ---
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: TERTIARY_COLOR },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
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
  profileContainer: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 10 },
  logoImage: { width: 45, height: 45, borderRadius: 22.5, backgroundColor: '#fff', marginRight: 12 },
  profileTextContainer: { marginLeft: 12, flex: 1 },
  profileNameText: { color: PRIMARY_COLOR, fontSize: 17, fontWeight: 'bold' },
  profileRoleText: { color: TEXT_COLOR_MEDIUM, fontSize: 13 },
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
  contentHeaderTitle: { fontSize: 18, fontWeight: 'bold', color: PRIMARY_COLOR, textAlign: 'center', flex: 1 },
  contentScrollViewContainer: { paddingHorizontal: CONTENT_HORIZONTAL_PADDING, paddingTop: 15, paddingBottom: 20 },
  dashboardGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  dashboardCard: {
    width: (windowWidth - CONTENT_HORIZONTAL_PADDING * 2 - CARD_GAP * 2) / 3,
    borderRadius: 12,
    paddingVertical: 15,
    marginBottom: CARD_GAP,
    alignItems: 'center',
    justifyContent: 'center',
    height: 115,
    backgroundColor: WHITE,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1.84,
    elevation: 2,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 5,
    minHeight: BOTTOM_NAV_HEIGHT,
  },
  navItem: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 5 },
  navText: { fontSize: 10, color: TEXT_COLOR_MEDIUM, marginTop: 3 },
  navTextActive: { color: PRIMARY_COLOR, fontWeight: 'bold' },
  fallbackContent: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: TERTIARY_COLOR },
  fallbackText: { fontSize: 16, color: TEXT_COLOR_MEDIUM, textAlign: 'center' },
});

export default DonorDashboard;