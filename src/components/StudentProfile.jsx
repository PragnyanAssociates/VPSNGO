// StudentProfile.jsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, SafeAreaView, TextInput, Alert } from 'react-native';

const PRIMARY_COLOR = '#008080'; // Teal
const SECONDARY_COLOR = '#e0f2f7'; // Light cyan/teal shade
const TERTIARY_COLOR = '#f8f8ff'; // Very light gray background
const TEXT_COLOR_DARK = '#333';
const TEXT_COLOR_MEDIUM = '#555';
const TEXT_COLOR_LIGHT = '#777';
const BORDER_COLOR = '#b2ebf2';
const BOTTOM_NAV_HEIGHT = 80; // Approximate height of the bottom navigation bar

const backArrowImage = 'https://cdn-icons-png.flaticon.com/512/3916/3916837.png';
const editIcon = 'https://cdn-icons-png.flaticon.com/512/1159/1159633.png';

const ProfileScreenContent = ({ userProfile, onEditPress, onBackPress }) => {
  return (
    <SafeAreaView style={profileStyles.safeArea}>
      <View style={profileStyles.header}>
        <TouchableOpacity onPress={onBackPress} style={profileStyles.backButton}>
          <Image source={{ uri: backArrowImage }} style={profileStyles.backArrowIcon} />
        </TouchableOpacity>
        <Text style={profileStyles.headerTitle}>My Profile</Text>
        <TouchableOpacity onPress={onEditPress} style={profileStyles.editButton}>
          <Image source={{ uri: editIcon }} style={profileStyles.editIcon} />
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={profileStyles.scrollViewContent}>
        <View style={profileStyles.profileHeader}>
          <Image source={{ uri: userProfile.profileImage }} style={profileStyles.profileImage} />
          <Text style={profileStyles.profileName}>{userProfile.name}</Text>
          <Text style={profileStyles.profileClass}>{userProfile.class}</Text>
        </View>

        <View style={profileStyles.detailsCard}>
          <Text style={profileStyles.detailTitle}>Personal Information</Text>
          <View style={profileStyles.detailRow}>
            <Text style={profileStyles.detailLabel}>Student ID:</Text>
            <Text style={profileStyles.detailValue}>{userProfile.studentId}</Text>
          </View>
          <View style={profileStyles.detailRow}>
            <Text style={profileStyles.detailLabel}>Date of Birth:</Text>
            <Text style={profileStyles.detailValue}>{userProfile.dob}</Text>
          </View>
          <View style={profileStyles.detailRow}>
            <Text style={profileStyles.detailLabel}>Gender:</Text>
            <Text style={profileStyles.detailValue}>{userProfile.gender}</Text>
          </View>
        </View>

        <View style={profileStyles.detailsCard}>
          <Text style={profileStyles.detailTitle}>Contact Information</Text>
          <View style={profileStyles.detailRow}>
            <Text style={profileStyles.detailLabel}>Email:</Text>
            <Text style={profileStyles.detailValue}>{userProfile.email}</Text>
          </View>
          <View style={profileStyles.detailRow}>
            <Text style={profileStyles.detailLabel}>Phone:</Text>
            <Text style={profileStyles.detailValue}>{userProfile.phone}</Text>
          </View>
          <View style={profileStyles.detailRow}>
            <Text style={profileStyles.detailLabel}>Address:</Text>
            <Text style={profileStyles.detailValue}>{userProfile.address}</Text>
          </View>
        </View>

        <View style={profileStyles.detailsCard}>
          <Text style={profileStyles.detailTitle}>Academic Details</Text>
          <View style={profileStyles.detailRow}>
            <Text style={profileStyles.detailLabel}>Roll No.:</Text>
            <Text style={profileStyles.detailValue}>{userProfile.rollNo}</Text>
          </View>
          <View style={profileStyles.detailRow}>
            <Text style={profileStyles.detailLabel}>Admission Date:</Text>
            <Text style={profileStyles.detailValue}>{userProfile.admissionDate}</Text>
          </View>
        </View>
        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const EditProfileScreenContent = ({ userProfile, onSave, onCancel }) => {
  const [editedProfile, setEditedProfile] = useState({ ...userProfile });

  const handleChange = (field, value) => {
    setEditedProfile(prev => ({ ...prev, [field]: value }));
  };

  return (
    <SafeAreaView style={editProfileStyles.safeArea}>
      <View style={editProfileStyles.header}>
        <TouchableOpacity onPress={onCancel} style={editProfileStyles.backButton}>
          <Text style={editProfileStyles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={editProfileStyles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity onPress={() => onSave(editedProfile)} style={editProfileStyles.saveButton}>
          <Text style={editProfileStyles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={editProfileStyles.scrollViewContent}>
        <View style={editProfileStyles.profileImageContainer}>
          <Image source={{ uri: editedProfile.profileImage }} style={editProfileStyles.profileImage} />
          <TouchableOpacity style={editProfileStyles.changeImageButton}>
            <Text style={editProfileStyles.changeImageButtonText}>Change Photo</Text>
          </TouchableOpacity>
        </View>

        <View style={editProfileStyles.inputGroup}>
          <Text style={editProfileStyles.inputLabel}>Full Name</Text>
          <TextInput
            style={editProfileStyles.textInput}
            value={editedProfile.name}
            onChangeText={(text) => handleChange('name', text)}
            placeholder="Enter full name"
          />
        </View>
        <View style={editProfileStyles.inputGroup}>
          <Text style={editProfileStyles.inputLabel}>Student ID</Text>
          <TextInput
            style={editProfileStyles.textInput}
            value={editedProfile.studentId}
            onChangeText={(text) => handleChange('studentId', text)}
            placeholder="Enter Student ID"
            editable={false}
          />
        </View>
        <View style={editProfileStyles.inputGroup}>
          <Text style={editProfileStyles.inputLabel}>Date of Birth</Text>
          <TextInput
            style={editProfileStyles.textInput}
            value={editedProfile.dob}
            onChangeText={(text) => handleChange('dob', text)}
            placeholder="YYYY-MM-DD"
          />
        </View>
        <View style={editProfileStyles.inputGroup}>
          <Text style={editProfileStyles.inputLabel}>Gender</Text>
          <TextInput
            style={editProfileStyles.textInput}
            value={editedProfile.gender}
            onChangeText={(text) => handleChange('gender', text)}
            placeholder="Male/Female/Other"
          />
        </View>
        <View style={editProfileStyles.inputGroup}>
          <Text style={editProfileStyles.inputLabel}>Email</Text>
          <TextInput
            style={editProfileStyles.textInput}
            value={editedProfile.email}
            onChangeText={(text) => handleChange('email', text)}
            placeholder="Enter email"
            keyboardType="email-address"
          />
        </View>
        <View style={editProfileStyles.inputGroup}>
          <Text style={editProfileStyles.inputLabel}>Phone</Text>
          <TextInput
            style={editProfileStyles.textInput}
            value={editedProfile.phone}
            onChangeText={(text) => handleChange('phone', text)}
            placeholder="Enter phone number"
            keyboardType="phone-pad"
          />
        </View>
        <View style={editProfileStyles.inputGroup}>
          <Text style={editProfileStyles.inputLabel}>Address</Text>
          <TextInput
            style={editProfileStyles.textInput}
            value={editedProfile.address}
            onChangeText={(text) => handleChange('address', text)}
            placeholder="Enter address"
            multiline
          />
        </View>
        <View style={editProfileStyles.inputGroup}>
          <Text style={editProfileStyles.inputLabel}>Class</Text>
          <TextInput
            style={editProfileStyles.textInput}
            value={editedProfile.class}
            onChangeText={(text) => handleChange('class', text)}
            placeholder="Enter class"
          />
        </View>
        <View style={editProfileStyles.inputGroup}>
          <Text style={editProfileStyles.inputLabel}>Roll No.</Text>
          <TextInput
            style={editProfileStyles.textInput}
            value={editedProfile.rollNo}
            onChangeText={(text) => handleChange('rollNo', text)}
            placeholder="Enter roll number"
          />
        </View>
        <View style={editProfileStyles.inputGroup}>
          <Text style={editProfileStyles.inputLabel}>Admission Date</Text>
          <TextInput
            style={editProfileStyles.textInput}
            value={editedProfile.admissionDate}
            onChangeText={(text) => handleChange('admissionDate', text)}
            placeholder="YYYY-MM-DD"
          />
        </View>
        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const StudentProfile = ({ userProfile, onUpdateProfile, onBackToDashboard }) => {
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = (updatedProfile) => {
    onUpdateProfile(updatedProfile);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <EditProfileScreenContent
        userProfile={userProfile}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    );
  } else {
    return (
      <ProfileScreenContent
        userProfile={userProfile}
        onEditPress={() => setIsEditing(true)}
        onBackPress={onBackToDashboard}
      />
    );
  }
};

const profileStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: TERTIARY_COLOR,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: SECONDARY_COLOR,
    padding: 15,
    paddingTop: 15,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderBottomWidth: 1,
    borderBottomColor: BORDER_COLOR,
  },
  backButton: {
    padding: 10,
  },
  backArrowIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
    tintColor: PRIMARY_COLOR,
  },
  headerTitle: {
    color: PRIMARY_COLOR,
    fontSize: 20,
    fontWeight: 'bold',
  },
  editButton: {
    padding: 10,
  },
  editIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
    tintColor: PRIMARY_COLOR,
  },
  scrollViewContent: {
    padding: 15,
    paddingBottom: 20 + BOTTOM_NAV_HEIGHT,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 25,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: PRIMARY_COLOR,
    marginBottom: 10,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: TEXT_COLOR_DARK,
  },
  profileClass: {
    fontSize: 16,
    color: TEXT_COLOR_MEDIUM,
    marginTop: 5,
  },
  detailsCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  detailTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: PRIMARY_COLOR,
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingBottom: 10,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  detailLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: TEXT_COLOR_MEDIUM,
    flex: 1,
  },
  detailValue: {
    fontSize: 15,
    color: TEXT_COLOR_DARK,
    flex: 2,
    textAlign: 'right',
  },
});

const editProfileStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: TERTIARY_COLOR,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: SECONDARY_COLOR,
    padding: 15,
    paddingTop: 15,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderBottomWidth: 1,
    borderBottomColor: BORDER_COLOR,
  },
  backButton: {
    padding: 10,
  },
  cancelButtonText: {
    color: PRIMARY_COLOR,
    fontSize: 16,
  },
  headerTitle: {
    color: PRIMARY_COLOR,
    fontSize: 20,
    fontWeight: 'bold',
  },
  saveButton: {
    padding: 10,
  },
  saveButtonText: {
    color: PRIMARY_COLOR,
    fontSize: 16,
    fontWeight: 'bold',
  },
  scrollViewContent: {
    padding: 15,
    paddingBottom: 20 + BOTTOM_NAV_HEIGHT,
  },
  profileImageContainer: {
    alignItems: 'center',
    marginBottom: 25,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: PRIMARY_COLOR,
    marginBottom: 10,
  },
  changeImageButton: {
    backgroundColor: SECONDARY_COLOR,
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  changeImageButtonText: {
    color: PRIMARY_COLOR,
    fontWeight: 'bold',
  },
  inputGroup: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: TEXT_COLOR_MEDIUM,
    marginBottom: 5,
  },
  textInput: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: TEXT_COLOR_DARK,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
});

export default StudentProfile;