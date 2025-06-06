// AdminLM.jsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList, Modal, StyleSheet,
  Alert, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { API_BASE_URL } from '../apiConfig'; // Import the base URL

const CLASS_CATEGORIES = [
  'Teachers', 'LKG', 'UKG', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
  'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'
];

const AdminLM = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedClass, setExpandedClass] = useState(null);
  
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({});

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/users`);
      if (!response.ok) throw new Error('Failed to fetch data.');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      Alert.alert('Network Error', 'Could not connect to the server to fetch users.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const groupedUsers = useMemo(() => {
    return CLASS_CATEGORIES.reduce((acc, category) => {
      acc[category] = users.filter(user => user.class_group === category);
      return acc;
    }, {});
  }, [users]);

  const handleToggle = (className) => setExpandedClass(expandedClass === className ? null : className);

  const openModal = (user = null) => {
    setCurrentUser(user);
    setFormData(user ? {
      full_name: user.full_name, role: user.role, class_group: user.class_group
    } : {
      username: '', password: '', full_name: '', role: 'student', class_group: 'LKG'
    });
    setIsModalVisible(true);
  };

  const handleSave = async () => {
    const url = currentUser ? `${API_BASE_URL}/api/users/${currentUser.id}` : `${API_BASE_URL}/api/users`;
    const method = currentUser ? 'PUT' : 'POST';
    if (!currentUser && (!formData.username || !formData.password)) {
      Alert.alert('Error', 'Username and Password are required for new users.');
      return;
    }

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);

      Alert.alert('Success', currentUser ? 'User updated!' : 'User created!');
      setIsModalVisible(false);
      fetchUsers();
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleDelete = (user) => {
    Alert.alert('Confirm Delete', `Delete ${user.full_name}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/api/users/${user.id}`, { method: 'DELETE' });
          if (!response.ok) throw new Error('Failed to delete user.');
          Alert.alert('Deleted!', `${user.full_name} was removed.`);
          fetchUsers();
        } catch (error) {
          Alert.alert('Error', error.message);
        }
      }}
    ]);
  };

  const renderUserItem = ({ item }) => (
    <View style={styles.userItem}>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.full_name}</Text>
        <Text style={styles.userPassword}>Username: {item.username}</Text>
      </View>
      <TouchableOpacity onPress={() => handleDelete(item.id, item.full_name)} style={styles.deleteButton}>
        <Icon name="delete" size={20} color="#FFFFFF"/>
      </TouchableOpacity>
    </View>
  );

  if (isLoading) {
    return <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#008080" /></View>;
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardAvoidingContainer}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Login Management</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => openModal()}>
          <Text style={styles.addButtonText}>+ Add User</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container}>
        {CLASS_CATEGORIES.map(className => (
          <View key={className}>
            <TouchableOpacity style={styles.classToggle} onPress={() => handleToggle(className)}>
              <Text style={styles.classToggleText}>{className} ({groupedUsers[className].length})</Text>
              <Icon name={expandedClass === className ? 'expand-less' : 'expand-more'} size={28} color="#008080" />
            </TouchableOpacity>
            {expandedClass === className && (
              <FlatList
                data={groupedUsers[className]}
                renderItem={renderUserItem}
                keyExtractor={item => item.id.toString()}
              />
            )}
          </View>
        ))}
      </ScrollView>

      <Modal visible={isModalVisible} transparent={true} animationType="slide" onRequestClose={() => setIsModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalContent}>
            <Text style={styles.modalTitle}>{currentUser ? 'Edit User' : 'Add New User'}</Text>
            {!currentUser && (
              <>
                <Text style={styles.inputLabel}>Username (ID/Email)</Text>
                <TextInput style={styles.input} placeholder="e.g., STU101 or teacher@school.com" value={formData.username} onChangeText={val => setFormData({...formData, username: val})} />
                <Text style={styles.inputLabel}>Password</Text>
                <TextInput style={styles.input} placeholder="Enter a temporary password" value={formData.password} onChangeText={val => setFormData({...formData, password: val})} secureTextEntry />
              </>
            )}
            <Text style={styles.inputLabel}>Full Name</Text>
            <TextInput style={styles.input} placeholder="Enter full name" value={formData.full_name} onChangeText={val => setFormData({...formData, full_name: val})} />
            <Text style={styles.inputLabel}>Role</Text>
            <View style={styles.modalPickerContainer}><Picker selectedValue={formData.role} onValueChange={val => setFormData({...formData, role: val, class_group: val === 'teacher' ? 'Teachers' : formData.class_group})} style={styles.modalPicker}>
              {['student', 'teacher'].map(r => <Picker.Item key={r} label={r.charAt(0).toUpperCase() + r.slice(1)} value={r} />)}
            </Picker></View>
            <Text style={styles.inputLabel}>Class / Group</Text>
            <View style={styles.modalPickerContainer}><Picker enabled={formData.role !== 'teacher'} selectedValue={formData.class_group} onValueChange={val => setFormData({...formData, class_group: val})} style={styles.modalPicker}>
              {CLASS_CATEGORIES.map(c => <Picker.Item key={c} label={c} value={c} />)}
            </Picker></View>
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setIsModalVisible(false)}><Text style={styles.modalButtonText}>Cancel</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.submitButton]} onPress={handleSave}><Text style={styles.modalButtonText}>Save</Text></TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

// Styles adapted from your original file to match the aesthetic
const styles = StyleSheet.create({
  keyboardAvoidingContainer: { flex: 1, backgroundColor: 'white' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' },
  container: { flex: 1, paddingHorizontal: 10 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#008080' },
  addButton: { backgroundColor: '#50C878', paddingVertical: 10, paddingHorizontal: 15, borderRadius: 8 },
  addButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  classToggle: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, backgroundColor: '#f7f7f7', marginTop: 10, borderRadius: 8 },
  classToggleText: { fontSize: 18, fontWeight: '500' },
  userItem: { backgroundColor: '#fff', padding: 15, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  userInfo: { flex: 1 },
  userName: { fontSize: 16, fontWeight: '600', color: '#333' },
  userPassword: { fontSize: 14, color: '#777', marginTop: 4 },
  deleteButton: { backgroundColor: '#E74C3C', width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginLeft: 10 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#FFFFFF', borderRadius: 15, padding: 25, width: '100%' },
  modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#2C3E50', marginBottom: 20, textAlign: 'center' },
  inputLabel: { fontSize: 16, color: '#34495E', marginBottom: 8, marginTop: 10 },
  input: { backgroundColor: '#ECF0F1', borderRadius: 8, padding: 12, fontSize: 16, color: '#2C3E50', marginBottom: 15 },
  modalPickerContainer: { backgroundColor: '#ECF0F1', borderRadius: 8, marginBottom: 15, overflow: 'hidden' },
  modalPicker: { height: 50, width: '100%' },
  modalButtonContainer: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 25 },
  modalButton: { paddingVertical: 12, paddingHorizontal: 25, borderRadius: 8, minWidth: 120, alignItems: 'center' },
  cancelButton: { backgroundColor: '#95A5A6' },
  submitButton: { backgroundColor: '#27AE60' },
  modalButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});

export default AdminLM;