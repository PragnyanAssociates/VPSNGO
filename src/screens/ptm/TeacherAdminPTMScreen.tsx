import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity, Modal, TextInput, Alert, ScrollView } from 'react-native';
import { MeetingCard, Meeting } from './MeetingCard';
import { Picker } from '@react-native-picker/picker';
import { API_BASE_URL } from '../../../apiConfig';

interface Teacher {
  id: number;
  full_name: string;
}

const TeacherAdminPTMScreen = () => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);

  const initialFormState = { meeting_datetime: '', teacher_id: '', subject_focus: '', status: 'Scheduled', notes: '' };
  const [formData, setFormData] = useState(initialFormState);
  
  // ✅ This function no longer needs the token
  const fetchAllData = useCallback(async () => {
      try {
          const [meetingsRes, teachersRes] = await Promise.all([
            fetch(`${API_BASE_URL}/api/ptm`),
            fetch(`${API_BASE_URL}/api/ptm/teachers`)
          ]);
          if (!meetingsRes.ok) throw new Error('Failed to fetch meetings.');
          if (!teachersRes.ok) throw new Error('Failed to fetch teachers.');
          setMeetings(await meetingsRes.json());
          setTeachers(await teachersRes.json());
      } catch (error: any) {
          Alert.alert("Error", error.message);
      } finally {
          setIsLoading(false);
      }
  }, []); // ✅ Dependency array is now empty

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const handleOpenModal = (meeting: Meeting | null = null) => {
    setEditingMeeting(meeting);
    if (meeting) {
      setFormData({
          meeting_datetime: new Date(meeting.meeting_datetime).toISOString().substring(0, 16).replace('T', ' '),
          teacher_id: meeting.teacher_id.toString(),
          subject_focus: meeting.subject_focus,
          status: meeting.status,
          notes: meeting.notes || '',
      });
    } else {
      setFormData(initialFormState);
    }
    setIsModalOpen(true);
  };
  
  const handleSave = async () => {
    const url = editingMeeting ? `${API_BASE_URL}/api/ptm/${editingMeeting.id}` : `${API_BASE_URL}/api/ptm`;
    const method = editingMeeting ? 'PUT' : 'POST';
    const body = JSON.stringify(editingMeeting ? { status: formData.status, notes: formData.notes } : formData);

    try {
      // ✅ Removed the Authorization header
      const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body });
      const resData = await response.json();
      if (!response.ok) throw new Error(resData.message || 'Failed to save meeting.');
      
      await fetchAllData();
      setIsModalOpen(false);
    } catch (error: any) { Alert.alert("Save Error", error.message); }
  };

  const handleDelete = (id: number) => {
    Alert.alert( "Confirm Deletion", "Are you sure you want to delete this meeting?",
      [ { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: async () => {
          try {
            // ✅ Removed the Authorization header
            const response = await fetch(`${API_BASE_URL}/api/ptm/${id}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Failed to delete.');
            await fetchAllData();
          } catch (error: any) { Alert.alert("Error", error.message); }
        }}]
    );
  };

  if (isLoading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#008080" /></View>;
  }

  return (
    <View style={styles.container}>
        <FlatList
            data={meetings}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => <MeetingCard meeting={item} onEdit={handleOpenModal} onDelete={handleDelete} />}
            ListHeaderComponent={
                <>
                    <View style={styles.header}>
                        <Text style={styles.headerIcon}>👥</Text>
                        <View>
                            <Text style={styles.headerTitle}>Manage PTMs</Text>
                            <Text style={styles.headerSubtitle}>Schedule, update, and review all meetings.</Text>
                        </View>
                    </View>
                    <TouchableOpacity style={styles.scheduleBtn} onPress={() => handleOpenModal()}>
                        <Text style={styles.scheduleBtnText}>+ Schedule New Meeting</Text>
                    </TouchableOpacity>
                </>
            }
            ListEmptyComponent={<Text style={styles.emptyText}>No meetings found.</Text>}
            contentContainerStyle={{ flexGrow: 1 }}
        />
        
        <Modal visible={isModalOpen} animationType="slide" transparent={true} onRequestClose={() => setIsModalOpen(false)}>
            <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setIsModalOpen(false)}>
                <TouchableOpacity activeOpacity={1} style={styles.modalContent}>
                    <ScrollView>
                        <Text style={styles.modalTitle}>{editingMeeting ? "Edit Meeting" : "New Meeting"}</Text>
                        <Text style={styles.label}>Teacher:</Text>
                        <View style={styles.pickerContainer}>
                            <Picker selectedValue={formData.teacher_id} onValueChange={itemValue => setFormData({...formData, teacher_id: itemValue})} enabled={!editingMeeting}>
                                <Picker.Item label="-- Select a Teacher --" value="" />
                                {teachers.map(t => <Picker.Item key={t.id} label={t.full_name} value={t.id.toString()} />)}
                            </Picker>
                        </View>
                        <Text style={styles.label}>Subject Focus:</Text>
                        <TextInput style={styles.input} value={formData.subject_focus} onChangeText={text => setFormData({...formData, subject_focus: text})} placeholder="e.g., Math Performance" editable={!editingMeeting}/>
                        <Text style={styles.label}>Date & Time (YYYY-MM-DD HH:MM):</Text>
                        <TextInput style={styles.input} value={formData.meeting_datetime} onChangeText={text => setFormData({...formData, meeting_datetime: text})} placeholder="e.g., 2024-11-20 15:00" editable={!editingMeeting}/>
                        <Text style={styles.label}>Notes:</Text>
                        <TextInput style={[styles.input, {height: 100}]} multiline value={formData.notes} onChangeText={text => setFormData({...formData, notes: text})} placeholder="Discussion points..."/>
                        {editingMeeting && (
                            <>
                                <Text style={styles.label}>Status:</Text>
                                <View style={styles.pickerContainer}>
                                    <Picker selectedValue={formData.status} onValueChange={itemValue => setFormData({...formData, status: itemValue})}>
                                        <Picker.Item label="Scheduled" value="Scheduled" />
                                        <Picker.Item label="Completed" value="Completed" />
                                    </Picker>
                                </View>
                            </>
                        )}
                        <View style={styles.modalActions}>
                            <TouchableOpacity onPress={() => setIsModalOpen(false)} style={[styles.modalButton, styles.cancelButton]}>
                                <Text>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleSave} style={[styles.modalButton, styles.saveButton]}>
                                <Text style={styles.saveButtonText}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    </View>
  );
};

// ... (The styles from the previous answer remain the same)
const styles = StyleSheet.create({
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    container: { flex: 1, backgroundColor: '#f0f4f7' },
    header: { flexDirection: 'row', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#e2e8f0', backgroundColor: 'white' },
    headerIcon: { fontSize: 32, marginRight: 15, color: '#5a67d8' },
    headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#2d3748' },
    headerSubtitle: { fontSize: 14, color: '#718096' },
    scheduleBtn: { backgroundColor: '#4CAF50', padding: 15, borderRadius: 8, marginHorizontal: 20, marginVertical: 10, alignItems: 'center' },
    scheduleBtnText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
    emptyText: { textAlign: 'center', marginTop: 30, fontSize: 16, color: '#718096' },
    modalBackdrop: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
    modalContent: { backgroundColor: 'white', borderRadius: 10, padding: 20, width: '90%', maxHeight: '80%' },
    modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    label: { fontSize: 16, fontWeight: '500', color: '#333', marginBottom: 5 },
    input: { borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 5, marginBottom: 15, backgroundColor: '#fff', color: '#000' },
    pickerContainer: { borderWidth: 1, borderColor: '#ccc', borderRadius: 5, marginBottom: 15, backgroundColor: '#fff' },
    modalActions: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 20, borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 20 },
    modalButton: { paddingVertical: 10, paddingHorizontal: 30, borderRadius: 5 },
    cancelButton: { backgroundColor: '#e0e0e0' },
    saveButton: { backgroundColor: '#4CAF50' },
    saveButtonText: { color: 'white', fontWeight: 'bold' }
});

export default TeacherAdminPTMScreen;