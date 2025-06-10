import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, SafeAreaView, Dimensions, Image, Platform, ActivityIndicator } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { Asset } from 'react-native-image-picker';
import { API_BASE_URL } from '../../apiConfig'; 

import ProfileScreen, { ProfileData } from '../screens/ProfileScreen';
import DonorNotifications, { initialNotificationsData } from './DonorNotifications';
import AcademicCalendar from './AcademicCalendar';
import DonorHelp from './DonorHelp';
import DonorSuggestions from './DonorSuggestions';
import DonorReceipts from './DonorReceipts';
import DonorPayments from './DonorPayments';
import DonorSI from './DonorSI';
import DonorSponsor from './DonorSponsor';

// --- Constants & Color Scheme (Unchanged) ---
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

const DEFAULT_DONOR_PROFILE: ProfileData = {
    id: 0, 
    username: 'public_donor',
    full_name: 'Valued Donor',
    role: 'donor',
    email: 'Enter your email',
    phone: '',
    address: '',
    class_group: 'N/A',
    profile_image_url: '', 
    dob: '',
    gender: '',
    admission_date: '',
    roll_no: ''
};

const DonorDashboard = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [donorProfile, setDonorProfile] = useState<ProfileData | null>(null);

  useEffect(() => {
    const loadProfileFromStorage = async () => {
      try {
        const savedProfileString = await AsyncStorage.getItem('donorProfile');
        if (savedProfileString) {
          setDonorProfile(JSON.parse(savedProfileString));
        } else {
          setDonorProfile(DEFAULT_DONOR_PROFILE);
        }
      } catch (e) {
        console.error("Failed to load donor profile from storage", e);
        setDonorProfile(DEFAULT_DONOR_PROFILE);
      }
    };
    loadProfileFromStorage();
  }, []);

  // ✅ FIX: This function now correctly handles BOTH local-only donors AND potential real users.
  const handleProfileSave = async (updatedData: ProfileData, newImage: Asset | null) => {
    try {
      let finalProfileData = { ...updatedData };

      // --- LOGIC FOR LOCAL-ONLY DONOR (NO LOGIN) ---
      if (updatedData.id === 0) {
        if (newImage && newImage.uri) {
          // Save the local file path of the image directly to the profile object.
          finalProfileData.profile_image_url = newImage.uri;
        }
        // Save the entire profile (with new image path) to the device's local storage.
        await AsyncStorage.setItem('donorProfile', JSON.stringify(finalProfileData));
        setDonorProfile(finalProfileData);
        Alert.alert("Profile Saved", "Your information has been saved on this device.");
        setActiveTab('home');
        return; // Stop here for local donor.
      }
      
      // --- LOGIC FOR A REAL, LOGGED-IN USER (id is not 0) ---
      // This part handles uploading to the server if you ever add logged-in donors.
      const formData = new FormData();
      Object.entries(updatedData).forEach(([key, value]) => {
          if (value != null) {
              formData.append(key, String(value));
          }
      });
      
      if (newImage && newImage.uri) {
          formData.append('profileImage', {
              uri: newImage.uri,
              type: newImage.type || 'image/jpeg',
              name: newImage.fileName || `profile-image-${Date.now()}.jpg`
          } as any);
      }

      const response = await fetch(`${API_BASE_URL}/api/profiles/${updatedData.id}`, {
          method: 'PUT',
          body: formData,
      });

      if (!response.ok) {
          const errorBody = await response.json();
          throw new Error(errorBody.message || "Failed to upload image to server.");
      }
      
      const serverResponse = await response.json();
      // Update with the server URL for the image
      finalProfileData.profile_image_url = serverResponse.profile_image_url;
      
      await AsyncStorage.setItem('donorProfile', JSON.stringify(finalProfileData));
      setDonorProfile(finalProfileData);
      Alert.alert("Profile Saved", "Your information has been updated successfully.");
      setActiveTab('home');

    } catch (e: any) {
      console.error("Error saving profile:", e);
      Alert.alert("Error", e.message || "Could not save profile.");
    }
  };
  
  const allQuickAccessItems = [
    { id: 'qa1', title: 'Payments', imageSource: 'https://cdn-icons-png.flaticon.com/128/1198/1198291.png', navigateToTab: 'DonorPayments' },
    { id: 'qa2', title: 'Receipts', imageSource: 'https://cdn-icons-png.flaticon.com/128/870/870128.png', navigateToTab: 'DonorReceipts' },
    { id: 'qa3', title: 'Gallery', imageSource: 'https://cdn-icons-png.flaticon.com/128/8418/8418513.png', navigateToTab: 'DonorSI' },
    { id: 'qa4', title: 'Suggestions', imageSource: 'https://cdn-icons-png.flaticon.com/128/9722/9722906.png', navigateToTab: 'DonorSuggestions' },
    { id: 'qa5', title: 'Help Desk', imageSource: 'https://cdn-icons-png.flaticon.com/128/4961/4961736.png', navigateToTab: 'DonorHelp' },
    { id: 'qa6', title: 'Sponsorship', imageSource: 'https://cdn-icons-png.flaticon.com/128/18835/18835518.png', navigateToTab: 'DonorSponsor' },
  ];

  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(
    initialNotificationsData.filter(n => !n.read).length
  );

  const getProfileImageSource = () => {
    if (!donorProfile?.profile_image_url) {
      return require('../assets/profile.png');
    }
    const url = donorProfile.profile_image_url;
    // If it's a server path, add the base URL. If it's a local file path, use it directly.
    if (url.startsWith('/uploads/')) {
      return { uri: `${API_BASE_URL}${url}` };
    }
    return { uri: url };
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <ScrollView contentContainerStyle={styles.contentScrollViewContainer}>
            <View style={styles.dashboardGrid}>
              {allQuickAccessItems.map(item => (
                <DashboardSectionCard
                  key={item.id} title={item.title} imageSource={item.imageSource}
                  onPress={() => item.navigateToTab ? setActiveTab(item.navigateToTab) : Alert.alert(item.title, `Action for ${item.title}`)}
                />
              ))}
            </View>
          </ScrollView>
        );
      case 'profile':
        if (!donorProfile) {
          return <View style={styles.centered}><ActivityIndicator size="large" color={PRIMARY_COLOR} /></View>;
        }
        return <ProfileScreen 
                  staticProfileData={donorProfile} 
                  onBackPress={() => setActiveTab('home')} 
                  onStaticSave={handleProfileSave} 
               />;
      // ...unchanged cases
      case 'allNotifications': return <><ContentScreenHeader title="Notifications" onBack={() => setActiveTab('home')} /><DonorNotifications onUnreadCountChange={setUnreadNotificationsCount} /></>;
      case 'calendar': return <AcademicCalendar />;
      case 'DonorPayments': return <><ContentScreenHeader title="Payments" onBack={() => setActiveTab('home')} /><DonorPayments /></>;
      case 'DonorReceipts': return <><ContentScreenHeader title="Receipts & Invoices" onBack={() => setActiveTab('home')} /><DonorReceipts /></>;
      case 'DonorSI': return <><ContentScreenHeader title="Gallery" onBack={() => setActiveTab('home')} /><DonorSI /></>;
      case 'DonorSuggestions': return <><ContentScreenHeader title="Suggestions" onBack={() => setActiveTab('home')} /><DonorSuggestions /></>;
      case 'DonorHelp': return <><ContentScreenHeader title="Help Desk" onBack={() => setActiveTab('home')} /><DonorHelp /></>;
      case 'DonorSponsor': return <><ContentScreenHeader title="Sponsorship" onBack={() => setActiveTab('home')} /><DonorSponsor /></>;
      default:
        return <View style={styles.fallbackContent}><Text>Coming Soon</Text></View>;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {activeTab === 'home' && (
        <View style={styles.topBar}>
          <View style={styles.profileContainer}>
            {/* ✅ FIX: Use the new helper function to correctly display local or server images. */}
            <Image 
              source={getProfileImageSource()} 
              style={styles.logoImage} 
            />
            <View style={styles.profileTextContainer}>
              <Text style={styles.profileNameText}>{donorProfile?.full_name || 'Donor Portal'}</Text>
              <Text style={styles.profileRoleText}>Donor</Text>
            </View>
          </View>
          <View style={styles.topBarActions}>
            <TouchableOpacity onPress={() => setActiveTab('allNotifications')} style={styles.iconButton}>
              <MaterialIcons name="notifications-none" size={26} color={PRIMARY_COLOR} />
              {unreadNotificationsCount > 0 && (<View style={styles.notificationCountBubble}><Text style={styles.notificationCountText}>{unreadNotificationsCount}</Text></View>)}
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

// --- Helper Components (Unchanged) ---
const DashboardSectionCard = ({ title, imageSource, onPress }: { title: string, imageSource: string, onPress: () => void }) => (
    <TouchableOpacity style={styles.dashboardCard} onPress={onPress}>
      <View style={styles.cardIconContainer}><Image source={{ uri: imageSource }} style={styles.cardImage} /></View>
      <Text style={styles.cardTitle}>{title}</Text>
    </TouchableOpacity>
);
const ContentScreenHeader = ({ title, onBack }: { title: string, onBack: () => void }) => (
    <View style={styles.contentHeader}>
        <TouchableOpacity onPress={onBack} style={styles.backButtonGlobal}>
            <MaterialIcons name="arrow-back" size={24} color={PRIMARY_COLOR} />
        </TouchableOpacity>
        <Text style={styles.contentHeaderTitle}>{title}</Text>
        <View style={{ width: 30 }} />
    </View>
);
const BottomNavItem = ({ icon, label, isActive, onPress }: { icon: string; label: string; isActive: boolean; onPress: () => void; }) => (
    <TouchableOpacity style={styles.navItem} onPress={onPress}>
        <FontAwesome name={icon} size={isActive ? 24 : 22} color={isActive ? PRIMARY_COLOR : TEXT_COLOR_MEDIUM} />
        <Text style={[styles.navText, isActive && styles.navTextActive]}>{label}</Text>
    </TouchableOpacity>
);

// --- Styles (Unchanged) ---
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: TERTIARY_COLOR },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  topBar: { backgroundColor: SECONDARY_COLOR, paddingHorizontal: 15, paddingVertical: Platform.OS === 'ios' ? 12 : 15, borderBottomLeftRadius: 20, borderBottomRightRadius: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3, borderBottomWidth: 1, borderBottomColor: BORDER_COLOR },
  profileContainer: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 10 },
  logoImage: { width: 45, height: 45, borderRadius: 22.5, backgroundColor: '#fff', marginRight: 12 },
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

export default DonorDashboard;