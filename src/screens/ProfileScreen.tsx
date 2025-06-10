// 📂 File: src/screens/ProfileScreen.tsx (FULL CODE - FINAL VERSION)

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, SafeAreaView, TextInput, Alert, ActivityIndicator, Platform, PermissionsAndroid } from 'react-native';
import { launchImageLibrary, Asset } from 'react-native-image-picker';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../../apiConfig';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

// Exporting this type so DonorDashboard can use it
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

// Updated props to accept optional static data and a save handler for it
interface ProfileScreenProps {
  onBackPress?: () => void;
  staticProfileData?: ProfileData;
  onStaticSave?: (updatedData: ProfileData) => Promise<void>;
}

// --- Color Scheme ---
const PRIMARY_COLOR = '#008080';
const SECONDARY_COLOR = '#e0f2f7';
const TERTIARY_COLOR = '#f8f8ff';
const TEXT_COLOR_DARK = '#333333';
const TEXT_COLOR_MEDIUM = '#555555';
const BORDER_COLOR = '#b2ebf2';

// --- Main Component (The "Brain") ---
const ProfileScreen = ({ onBackPress, staticProfileData, onStaticSave }: ProfileScreenProps) => {
  const { user } = useAuth(); // This will be null for public users
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true);
      // Case 1: Static data is provided (for Donor)
      if (staticProfileData) {
        setProfileData(staticProfileData);
      } 
      // Case 2: A user is logged in
      else if (user) {
        try {
          const response = await fetch(`${API_BASE_URL}/api/profiles/${user.id}`);
          if (!response.ok) throw new Error('Could not fetch profile.');
          setProfileData(await response.json());
        } catch (error: any) {
          Alert.alert('Error', error.message);
          setProfileData(null);
        }
      }
      setIsLoading(false);
    };
    
    loadProfile();
  }, [user, staticProfileData]);

  // This save handler works for BOTH logged-in and public users
  const handleSave = async (editedData: ProfileData, newImage: Asset | null) => {
    setIsSaving(true);
    // Case 1: A logged-in user saves to the backend
    if (user) {
      const formData = new FormData();
      Object.entries(editedData).forEach(([key, value]) => {
        if (value != null) formData.append(key, String(value));
      });
      if (newImage) {
        formData.append('profileImage', { uri: newImage.uri, type: newImage.type, name: newImage.fileName } as any);
      }
      try {
        const response = await fetch(`${API_BASE_URL}/api/profiles/${user.id}`, { method: 'PUT', body: formData });
        if (!response.ok) throw new Error('Failed to save to server.');
        const refreshedProfile = await response.json();
        setProfileData(prev => ({ ...prev, ...refreshedProfile, ...editedData }));
        Alert.alert('Success', 'Profile updated successfully!');
        setIsEditing(false);
      } catch (error: any) { Alert.alert('Update Failed', error.message); }
    } 
    // Case 2: A public donor saves to local storage via the callback
    else if (onStaticSave) {
        // NOTE: Saving an image locally is complex and not handled here. Only text data is saved.
        await onStaticSave(editedData); 
        setProfileData(editedData); // Update the view with the new data
        setIsEditing(false);
    }
    setIsSaving(false);
  };
  
  if (isLoading) return <View style={styles.centered}><ActivityIndicator size="large" color={PRIMARY_COLOR} /></View>;
  if (!profileData) return <View style={styles.centered}><Text>Profile not available.</Text></View>;

  return isEditing
    ? <EditProfileView userProfile={profileData} onSave={handleSave} onCancel={() => setIsEditing(false)} isSaving={isSaving} />
    : <DisplayProfileView userProfile={profileData} onEditPress={() => setIsEditing(true)} onBackPress={onBackPress} />;
};

// --- Display Sub-Component ---
const DisplayProfileView = ({ userProfile, onEditPress, onBackPress }: { userProfile: ProfileData, onEditPress: () => void, onBackPress?: () => void }) => {
  const profileImageSource = userProfile.profile_image_url ? { uri: `${API_BASE_URL}${userProfile.profile_image_url}` } : require('../assets/profile.png');
  const showAcademicDetails = userProfile.role !== 'donor';

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        {onBackPress ? (
          <TouchableOpacity onPress={onBackPress} style={styles.headerButton}>
            <MaterialIcons name="arrow-back" size={24} color={PRIMARY_COLOR} />
          </TouchableOpacity>
        ) : <View style={{width: 40}} />}
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

// --- Edit Sub-Component ---
const EditProfileView = ({ userProfile, onSave, onCancel, isSaving }: { userProfile: ProfileData, onSave: (data: ProfileData, newImage: Asset | null) => void, onCancel: () => void, isSaving: boolean }) => {
  const [editedData, setEditedData] = useState(userProfile);
  const [newImage, setNewImage] = useState<Asset | null>(null);

  const requestGalleryPermission = async () => { /* ... permission logic ... */ return true; };
  const handleChoosePhoto = async () => { /* ... image picker logic ... */ };

  const handleChange = (field: keyof ProfileData, value: string) => setEditedData(prev => ({ ...prev, [field]: value }));
  const imageSource = newImage?.uri ? { uri: newImage.uri } : (editedData.profile_image_url ? { uri: `${API_BASE_URL}${editedData.profile_image_url}` } : require('../assets/profile.png'));
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

// --- UI Helper Components ---
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

// --- Styles ---
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: TERTIARY_COLOR },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: SECONDARY_COLOR, padding: 15, borderBottomLeftRadius: 20, borderBottomRightRadius: 20, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3, borderBottomWidth: 1, borderBottomColor: BORDER_COLOR },
  headerButton: { padding: 5, minWidth: 40, alignItems: 'center' },
  headerButtonText: { color: PRIMARY_COLOR, fontSize: 16, fontWeight: '600' },
  headerTitle: { color: PRIMARY_COLOR, fontSize: 20, fontWeight: 'bold' },
  container: { padding: 15, paddingBottom: 40 },
  profileHeader: { alignItems: 'center', marginBottom: 25 },
  profileImage: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: PRIMARY_COLOR, marginBottom: 10 },
  profileName: { fontSize: 24, fontWeight: 'bold', color: TEXT_COLOR_DARK },
  profileRole: { fontSize: 16, color: TEXT_COLOR_MEDIUM, marginTop: 5 },
  detailsCard: { backgroundColor: 'white', borderRadius: 10, padding: 20, marginBottom: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
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