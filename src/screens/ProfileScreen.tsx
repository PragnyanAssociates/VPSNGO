// 📂 File: src/screens/ProfileScreen.tsx (FINAL & CORRECTED)

import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Image,
  SafeAreaView, TextInput, Alert, ActivityIndicator, Platform, PermissionsAndroid
} from 'react-native';
import { launchImageLibrary, Asset } from 'react-native-image-picker';
import { useAuth } from '../context/AuthContext';
import { SERVER_URL } from '../../apiConfig';
import apiClient from '../api/client';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

export interface ProfileData {
  id: number;
  username: string;
  full_name: string;
  role: string;
  class_group: string;
  dob?: string;
  gender?: string;
  phone?: string;
  address?: string;
  profile_image_url?: string;
  admission_date?: string;
  roll_no?: string;
  email?: string;
}

interface ProfileScreenProps {
  onBackPress?: () => void;
  staticProfileData?: ProfileData;
  onStaticSave?: (updatedData: ProfileData, newImage: Asset | null) => Promise<void>;
  onProfileUpdate?: (newProfileData: ProfileData) => void;
}

const PRIMARY_COLOR = '#008080';
const SECONDARY_COLOR = '#e0f2f7';
const TERTIARY_COLOR = '#f8f8ff';
const TEXT_COLOR_DARK = '#333333';
const TEXT_COLOR_MEDIUM = '#555555';
const BORDER_COLOR = '#b2ebf2';

const ProfileScreen = ({ onBackPress, staticProfileData, onStaticSave, onProfileUpdate }: ProfileScreenProps) => {
  // ★★★ 1. GET THE NEW isLoading FLAG FROM useAuth ★★★
  // We rename it to 'isAuthLoading' to avoid confusion with local loading states.
  const { user, isLoading: isAuthLoading } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  // This state is for the API call itself, separate from the initial auth loading.
  const [isProfileLoading, setIsProfileLoading] = useState(true);

  // ★★★ 2. THE useEffect NOW WAITS FOR isAuthLoading TO BE false ★★★
  useEffect(() => {
    const loadProfile = async () => {
      // If static data is provided, use it immediately and ignore the rest.
      if (staticProfileData) {
        setProfileData(staticProfileData);
        setIsProfileLoading(false);
        return;
      }
      
      // We only proceed if authentication is finished AND there is a logged-in user.
      if (!isAuthLoading && user) {
        setIsProfileLoading(true); // Start loading the profile
        try {
          const response = await apiClient.get(`/profiles/${user.id}`);
          setProfileData(response.data);
        } catch (error: any) {
          Alert.alert('Error', error.response?.data?.message || 'Could not fetch profile.');
          setProfileData(null);
        } finally {
          setIsProfileLoading(false); // Finish loading the profile
        }
      } else if (!isAuthLoading && !user) {
        // Auth is finished, but no user is logged in. Stop loading.
        setIsProfileLoading(false);
        setProfileData(null);
      }
    };

    loadProfile();
  }, [user, isAuthLoading, staticProfileData]); // The hook now depends on isAuthLoading

  const handleSave = async (editedData: ProfileData, newImage: Asset | null) => {
    // ... handleSave logic remains exactly the same, no changes needed here ...
    setIsSaving(true);
    try {
      if (onStaticSave) {
        await onStaticSave(editedData, newImage);
        const updatedProfile = { ...profileData, ...editedData } as ProfileData;
        if (newImage && newImage.uri) {
          updatedProfile.profile_image_url = newImage.uri;
        }
        setProfileData(updatedProfile);
        setIsEditing(false);
      } else if (user) {
        const formData = new FormData();
        Object.entries(editedData).forEach(([key, value]) => {
          if (value != null) {
            formData.append(key, String(value));
          }
        });
        if (newImage && newImage.uri) {
          formData.append('profileImage', {
            uri: newImage.uri,
            type: newImage.type || 'image/jpeg',
            name: newImage.fileName || `profile-${Date.now()}.jpg`
          });
        }
        
        const response = await apiClient.put(`/profiles/${user.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        const refreshedProfile = response.data;
        const updatedProfile = { ...profileData, ...editedData, ...refreshedProfile } as ProfileData;
        setProfileData(updatedProfile);
        if (onProfileUpdate) {
          onProfileUpdate(updatedProfile);
        }
        Alert.alert('Success', 'Profile updated successfully!');
        setIsEditing(false);
      }
    } catch (error: any) {
      Alert.alert('Update Failed', error.response?.data?.message || 'Failed to save profile.');
    } finally {
      setIsSaving(false);
    }
  };

  // ★★★ 3. SHOW A SPINNER IF AUTH IS LOADING OR IF THE PROFILE IS LOADING ★★★
  if (isAuthLoading || isProfileLoading) {
    return <View style={styles.centered}><ActivityIndicator size="large" color={PRIMARY_COLOR} /></View>;
  }

  // If loading is finished but there's no profile data, show the message.
  if (!profileData) {
    return <View style={styles.centered}><Text>Profile not available.</Text></View>;
  }

  return isEditing
    ? <EditProfileView userProfile={profileData} onSave={handleSave} onCancel={() => setIsEditing(false)} isSaving={isSaving} />
    : <DisplayProfileView userProfile={profileData} onEditPress={() => setIsEditing(true)} onBackPress={onBackPress} />;
};

// --- NO CHANGES BELOW THIS LINE ---
// The DisplayProfileView, EditProfileView, and styles remain the same.

const DisplayProfileView = ({ userProfile, onEditPress, onBackPress }: { userProfile: ProfileData, onEditPress: () => void, onBackPress?: () => void }) => {
  let profileImageSource;
  const imageUri = userProfile.profile_image_url;

  if (imageUri) {
    const fullUri = (imageUri.startsWith('http') || imageUri.startsWith('file')) ? imageUri : `${SERVER_URL}${imageUri}`;
    profileImageSource = { uri: fullUri };
  } else {
    profileImageSource = require('../assets/profile.png');
  }

  const showAcademicDetails = userProfile.role !== 'donor';

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        {onBackPress ? (
          <TouchableOpacity onPress={onBackPress} style={styles.headerButton}>
            <MaterialIcons name="arrow-back" size={24} color={PRIMARY_COLOR} />
          </TouchableOpacity>
        ) : (
          <View style={styles.headerButton} />
        )}
        <Text style={styles.headerTitle}>My Profile</Text>
        <TouchableOpacity onPress={onEditPress} style={styles.headerButton}>
          <MaterialIcons name="edit" size={24} color={PRIMARY_COLOR} />
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.profileHeader}>
          <Image source={profileImageSource} style={styles.profileImage} />
          <Text style={styles.profileName}>{userProfile.full_name}</Text>
          <Text style={styles.profileRole}>{userProfile.role.charAt(0).toUpperCase() + userProfile.role.slice(1)}</Text>
        </View>
        <View style={styles.detailsCard}>
          <Text style={styles.cardTitle}>Personal Information</Text>
          <DetailRow label="User ID:" value={userProfile.username} />
          {showAcademicDetails && <DetailRow label="Date of Birth:" value={userProfile.dob} />}
          {showAcademicDetails && <DetailRow label="Gender:" value={userProfile.gender} />}
        </View>
        <View style={styles.detailsCard}>
          <Text style={styles.cardTitle}>Contact Information</Text>
          <DetailRow label="Email:" value={userProfile.email} />
          <DetailRow label="Phone:" value={userProfile.phone} />
          <DetailRow label="Address:" value={userProfile.address} />
        </View>
        {showAcademicDetails && (
          <View style={styles.detailsCard}>
            <Text style={styles.cardTitle}>Academic Details</Text>
            <DetailRow label="Class:" value={userProfile.class_group} />
            <DetailRow label="Roll No.:" value={userProfile.roll_no} />
            <DetailRow label="Admission Date:" value={userProfile.admission_date} />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const EditProfileView = ({ userProfile, onSave, onCancel, isSaving }: { userProfile: ProfileData, onSave: (data: ProfileData, newImage: Asset | null) => void, onCancel: () => void, isSaving: boolean }) => {
  const [editedData, setEditedData] = useState(userProfile);
  const [newImage, setNewImage] = useState<Asset | null>(null);

  const requestGalleryPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          { title: 'Gallery Access Permission', message: 'App needs access to your gallery.', buttonPositive: 'OK' }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) { return false; }
    }
    return true;
  };

  const handleChoosePhoto = async () => {
    const hasPermission = await requestGalleryPermission();
    if (!hasPermission) return;
    try {
      const result = await launchImageLibrary({ mediaType: 'photo', quality: 0.8 });
      if (result.assets && result.assets.length > 0) {
        setNewImage(result.assets[0]);
      }
    } catch (error) { console.error('Image picker error:', error); }
  };

  const handleChange = (field: keyof ProfileData, value: string) => setEditedData(prev => ({ ...prev, [field]: value }));

  const imageSource = newImage?.uri
    ? { uri: newImage.uri }
    : (editedData.profile_image_url
      ? (editedData.profile_image_url.startsWith('http') || editedData.profile_image_url.startsWith('file') ? { uri: editedData.profile_image_url } : { uri: `${SERVER_URL}${editedData.profile_image_url}` })
      : require('../assets/profile.png'));

  const showAcademicFields = userProfile.role !== 'donor';

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onCancel} style={styles.headerButton} disabled={isSaving}>
          <Text style={styles.headerButtonText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity onPress={() => onSave(editedData, newImage)} style={styles.headerButton} disabled={isSaving}>
          <Text style={styles.headerButtonText}>Save</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.profileHeader}>
          <Image source={imageSource} style={styles.profileImage} />
          <TouchableOpacity onPress={handleChoosePhoto} style={styles.changeImageButton}>
            <Text style={styles.changeImageButtonText}>Change Photo</Text>
          </TouchableOpacity>
        </View>
        <EditField label="Full Name" value={editedData.full_name} onChange={text => handleChange('full_name', text)} />
        <EditField label="Email" value={editedData.email} onChange={text => handleChange('email', text)} keyboardType="email-address" />
        <EditField label="Phone" value={editedData.phone} onChange={text => handleChange('phone', text)} keyboardType="phone-pad" />
        <EditField label="Address" value={editedData.address} onChange={text => handleChange('address', text)} multiline />
        {showAcademicFields && (
          <>
            <EditField label="Date of Birth" value={editedData.dob} onChange={text => handleChange('dob', text)} placeholder="YYYY-MM-DD" />
            <EditField label="Gender" value={editedData.gender} onChange={text => handleChange('gender', text)} />
            <EditField label="Class / Group" value={editedData.class_group} onChange={text => handleChange('class_group', text)} />
            <EditField label="Roll No." value={editedData.roll_no} onChange={text => handleChange('roll_no', text)} />
            <EditField label="Admission Date" value={editedData.admission_date} onChange={text => handleChange('admission_date', text)} placeholder="YYYY-MM-DD" />
          </>
        )}
        {isSaving && <ActivityIndicator size="large" color={PRIMARY_COLOR} style={{ marginTop: 20 }} />}
      </ScrollView>
    </SafeAreaView>
  );
};

const DetailRow = ({ label, value }: { label: string; value?: string | null }) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue}>{value || 'N/A'}</Text>
  </View>
);

const EditField = ({ label, value, onChange, ...props }: any) => (
  <View style={styles.inputGroup}>
    <Text style={styles.inputLabel}>{label}</Text>
    <TextInput style={styles.textInput} value={value || ''} onChangeText={onChange} {...props} />
  </View>
);

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: TERTIARY_COLOR },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: SECONDARY_COLOR, padding: 15,
    borderBottomLeftRadius: 20, borderBottomRightRadius: 20, marginBottom: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 4, elevation: 3, borderBottomWidth: 1, borderBottomColor: BORDER_COLOR
  },
  headerButton: { padding: 5, minWidth: 60, alignItems: 'center' },
  headerButtonText: { color: PRIMARY_COLOR, fontSize: 16, fontWeight: '600' },
  headerTitle: { color: PRIMARY_COLOR, fontSize: 20, fontWeight: 'bold' },
  container: { padding: 15, paddingBottom: 40 },
  profileHeader: { alignItems: 'center', marginBottom: 25 },
  profileImage: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: PRIMARY_COLOR, marginBottom: 10 },
  profileName: { fontSize: 24, fontWeight: 'bold', color: TEXT_COLOR_DARK },
  profileRole: { fontSize: 16, color: TEXT_COLOR_MEDIUM, marginTop: 5 },
  detailsCard: { backgroundColor: 'white', borderRadius: 10, padding: 20, marginBottom: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: PRIMARY_COLOR, marginBottom: 15, borderBottomWidth: 1, borderBottomColor: '#e5e7eb', paddingBottom: 10 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  detailLabel: { fontSize: 15, fontWeight: '600', color: TEXT_COLOR_MEDIUM, flex: 1 },
  detailValue: { fontSize: 15, color: TEXT_COLOR_DARK, flex: 2, textAlign: 'right' },
  changeImageButton: { backgroundColor: SECONDARY_COLOR, paddingVertical: 8, paddingHorizontal: 15, borderRadius: 20 },
  changeImageButtonText: { color: PRIMARY_COLOR, fontWeight: 'bold' },
  inputGroup: { marginBottom: 15 },
  inputLabel: { fontSize: 15, fontWeight: '600', color: TEXT_COLOR_MEDIUM, marginBottom: 5 },
  textInput: { backgroundColor: 'white', borderRadius: 8, padding: 12, fontSize: 16, color: TEXT_COLOR_DARK, borderWidth: 1, borderColor: '#e5e7eb' },
});

export default ProfileScreen;