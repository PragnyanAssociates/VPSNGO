// F:\Real_School\school_app\src\components\AdminLM.jsx

import React, { useState, useEffect, useMemo } from 'react';
import {
  // ✅ THE FIX IS HERE: Add SafeAreaView to this list
  SafeAreaView, 
  View, Text, TextInput, TouchableOpacity, FlatList, Modal, StyleSheet,
  Alert, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { API_BASE_URL } from '../../apiConfig';

const CLASS_CATEGORIES = [
  'Teachers', 'LKG', 'UKG', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
  'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'
];
const USER_ROLES = ['student', 'teacher'];

const AdminLM = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [formData, setFormData] = useState({});
  const [expandedClass, setExpandedClass] = useState(null);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/users`);
      if (!response.ok) throw new Error('Failed to fetch data from the server.');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      Alert.alert('Network Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const groupedUsers = useMemo(() => {
    const groups = {};
    CLASS_CATEGORIES.forEach(category => {
      groups[category] = users.filter(user => user.class_group === category);
    });
    return groups;
  }, [users]);

  const openAddModal = () => {
    setFormData({ username: '', password: '', full_name: '', role: 'student', class_group: 'LKG' });
    setIsModalVisible(true);
  };

  const handleSave = async () => {
    if (!formData.username || !formData.password || !formData.full_name) {
      Alert.alert('Error', 'Username, Password, and Full Name are required.');
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);
      Alert.alert('Success', 'User created successfully!');
      setIsModalVisible(false);
      fetchUsers();
    } catch (error) {
      Alert.alert('Save Failed', `An error occurred: ${error.message}`);
    }
  };

  const handleDelete = (user) => {
    Alert.alert('Confirm Delete', `Are you sure you want to delete "${user.full_name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive',
        onPress: async () => {
          try {
            const response = await fetch(`${API_BASE_URL}/api/users/${user.id}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Failed to delete the user.');
            Alert.alert('Deleted!', `"${user.full_name}" was removed successfully.`);
            fetchUsers();
          } catch (error) {
            Alert.alert('Error', error.message);
          }
        },
      },
    ]);
  };

  const handleToggleAccordion = (className) => {
    setExpandedClass(expandedClass === className ? null : className);
  };

  const renderUserItem = ({ item }) => (
    <View style={styles.userRow}>
      <Icon name={item.role === 'teacher' ? 'school' : 'person'} size={24} color="#008080" style={styles.userIcon} />
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.full_name}</Text>
        <Text style={styles.userUsername}>Username: {item.username}</Text>
      </View>
      <TouchableOpacity onPress={() => handleDelete(item)} style={styles.deleteButton}>
        <Icon name="delete-outline" size={24} color="#E74C3C" />
      </TouchableOpacity>
    </View>
  );

  if (isLoading) {
    return <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#008080" /></View>;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>User Management</Text>
        <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
          <Icon name="add" size={20} color="#fff" />
          <Text style={styles.addButtonText}>Add User</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {CLASS_CATEGORIES.map((className) => (
          <View key={className} style={styles.accordionSection}>
            <TouchableOpacity style={styles.accordionHeader} onPress={() => handleToggleAccordion(className)}>
              <Text style={styles.accordionTitle}>{className} ({groupedUsers[className].length})</Text>
              <Icon name={expandedClass === className ? 'expand-less' : 'expand-more'} size={28} color="#555" />
            </TouchableOpacity>

            {expandedClass === className && (
              <View style={styles.userListContainer}>
                {groupedUsers[className].length > 0 ? (
                  groupedUsers[className].map(user => renderUserItem({ item: user, key: user.id }))
                ) : (
                  <Text style={styles.emptySectionText}>No users in this section.</Text>
                )}
              </View>
            )}
          </View>
        ))}
      </ScrollView>

      <Modal animationType="slide" transparent={true} visible={isModalVisible} onRequestClose={() => setIsModalVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
            <ScrollView contentContainerStyle={styles.modalContent}>
              <Text style={styles.modalTitle}>Add New User</Text>
              <Text style={styles.inputLabel}>Username (Student ID / Teacher Email):</Text>
              <TextInput style={styles.input} placeholder="e.g., STU101" value={formData.username} onChangeText={(val) => setFormData({ ...formData, username: val })} autoCapitalize="none" />
              <Text style={styles.inputLabel}>Password:</Text>
              <TextInput style={styles.input} placeholder="Enter temporary password" value={formData.password} onChangeText={(val) => setFormData({ ...formData, password: val })} secureTextEntry />
              <Text style={styles.inputLabel}>Full Name:</Text>
              <TextInput style={styles.input} placeholder="Enter user's full name" value={formData.full_name} onChangeText={(val) => setFormData({ ...formData, full_name: val })} />
              <Text style={styles.inputLabel}>Role:</Text>
              <View style={styles.modalPickerContainer}><Picker selectedValue={formData.role} onValueChange={(val) => setFormData({ ...formData, role: val, class_group: val === 'teacher' ? 'Teachers' : formData.class_group })} style={styles.modalPicker}>{USER_ROLES.map((role) => (<Picker.Item key={role} label={role.charAt(0).toUpperCase() + role.slice(1)} value={role} />))}</Picker></View>
              <Text style={styles.inputLabel}>Class / Group:</Text>
              <View style={styles.modalPickerContainer}><Picker enabled={formData.role !== 'teacher'} selectedValue={formData.class_group} onValueChange={(val) => setFormData({ ...formData, class_group: val })} style={styles.modalPicker}>{CLASS_CATEGORIES.map((level) => (<Picker.Item key={level} label={level} value={level} />))}</Picker></View>
              <View style={styles.modalButtonContainer}>
                <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setIsModalVisible(false)}><Text style={styles.modalButtonText}>Cancel</Text></TouchableOpacity>
                <TouchableOpacity style={[styles.modalButton, styles.submitButton]} onPress={handleSave}><Text style={styles.modalButtonText}>Add User</Text></TouchableOpacity>
              </View>
            </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f4f7f6' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f4f7f6' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#008080' },
  addButton: {
    flexDirection: 'row',
    backgroundColor: '#27AE60',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 2,
  },
  addButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600', marginLeft: 5 },
  container: { paddingVertical: 10, paddingHorizontal: 10 },
  accordionSection: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 10,
    overflow: 'hidden',
    elevation: 1,
  },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
  accordionTitle: { fontSize: 18, fontWeight: '600', color: '#333' },
  userListContainer: { borderTopWidth: 1, borderTopColor: '#f0f0f0' },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  userIcon: { marginRight: 15 },
  userInfo: { flex: 1 },
  userName: { fontSize: 16, fontWeight: '500', color: '#2C3E50' },
  userUsername: { fontSize: 14, color: '#7F8C8D', marginTop: 2 },
  deleteButton: { padding: 5 },
  emptySectionText: { textAlign: 'center', padding: 20, color: '#95A5A6', fontStyle: 'italic' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#FFFFFF', borderRadius: 15, padding: 25, width: '90%', maxHeight: '90%', elevation: 10 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#2C3E50', marginBottom: 20, textAlign: 'center' },
  inputLabel: { fontSize: 14, color: '#34495E', marginBottom: 5, marginTop: 15 },
  input: { backgroundColor: '#f7f7f7', borderRadius: 8, padding: 12, fontSize: 16, color: '#2C3E50', borderWidth: 1, borderColor: '#e0e0e0' },
  modalPickerContainer: { backgroundColor: '#f7f7f7', borderRadius: 8, borderWidth: 1, borderColor: '#e0e0e0', marginTop: 5, overflow: 'hidden' },
  modalPicker: { height: 50, width: '100%', color: '#2C3E50' },
  modalButtonContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 30 },
  modalButton: { flex: 1, paddingVertical: 14, borderRadius: 8, alignItems: 'center', elevation: 2 },
  cancelButton: { backgroundColor: '#95A5A6', marginRight: 10 },
  submitButton: { backgroundColor: '#27AE60', marginLeft: 10 },
  modalButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});

export default AdminLM;