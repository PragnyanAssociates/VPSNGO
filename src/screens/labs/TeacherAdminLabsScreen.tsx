// 📂 File: src/screens/labs/TeacherAdminLabsScreen.tsx (MODIFIED & CORRECTED)

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Modal, TextInput, Alert, ScrollView } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { launchImageLibrary, ImagePickerResponse } from 'react-native-image-picker';
import { pick, types, isCancel } from '@react-native-documents/picker';
import { LabCard, Lab } from './LabCard';
import { useAuth } from '../../context/AuthContext';
// ★★★ 1. IMPORT apiClient AND REMOVE API_BASE_URL ★★★
import apiClient from '../../api/client';

const TeacherAdminLabsScreen = () => {
    const { user } = useAuth();
    const [labs, setLabs] = useState<Lab[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLab, setEditingLab] = useState<Lab | null>(null);
    
    const initialFormState = { title: '', subject: '', lab_type: '', description: '', access_url: '' };
    const [formData, setFormData] = useState(initialFormState);
    const [selectedImage, setSelectedImage] = useState<ImagePickerResponse | null>(null);
    const [selectedFile, setSelectedFile] = useState<any | null>(null);

    const fetchLabs = useCallback(async () => {
        setIsLoading(true);
        try {
            // ★★★ 2. USE apiClient ★★★
            const response = await apiClient.get('/labs');
            setLabs(response.data);
        } catch (e: any) { Alert.alert("Error", e.response?.data?.message || 'Failed to fetch labs'); } 
        finally { setIsLoading(false); }
    }, []);

    useEffect(() => { fetchLabs(); }, [fetchLabs]);

    const handleChoosePhoto = () => {
        launchImageLibrary({ mediaType: 'photo' }, (response) => {
            if (response.didCancel) return;
            if (response.errorCode) return Alert.alert("Image Error", response.errorMessage);
            setSelectedImage(response);
        });
    };

    const handleChooseFile = async () => {
        try {
            const result = await pick({ type: [types.allFiles], allowMultiSelection: false });
            if (result && result.length > 0) {
                setSelectedFile(result[0]);
            }
        } catch (err) {
            if (isCancel(err)) { console.log('User cancelled file selection.'); } 
            else { Alert.alert('Error', 'An unknown error occurred while selecting the file.'); console.error(err); }
        }
    };

    const handleOpenModal = (lab: Lab | null = null) => {
        setEditingLab(lab);
        if (lab) {
            setFormData({ title: lab.title, subject: lab.subject, lab_type: lab.lab_type, description: lab.description, access_url: lab.access_url || '' });
        } else {
            setFormData(initialFormState);
        }
        setSelectedImage(null); setSelectedFile(null); setIsModalOpen(true);
    };

    const handleSave = async () => {
        if (!formData.title || !formData.description) {
            return Alert.alert("Validation Error", "Title and Description are required.");
        }
        if (!formData.access_url && !selectedFile && !editingLab?.file_path) {
            return Alert.alert("Validation Error", "You must provide an Access URL or upload a file.");
        }
        
        const data = new FormData();
        Object.keys(formData).forEach(key => data.append(key, formData[key]));
        if (user) data.append('created_by', user.id.toString());

        if (selectedImage?.assets?.[0]) {
            data.append('coverImage', { uri: selectedImage.assets[0].uri, type: selectedImage.assets[0].type, name: selectedImage.assets[0].fileName });
        }
        if (selectedFile) {
            data.append('labFile', { uri: selectedFile.uri, type: selectedFile.type, name: selectedFile.name });
        }
        
        try {
            // ★★★ 3. USE apiClient FOR SAVING/UPDATING ★★★
            if (editingLab) {
                await apiClient.put(`/labs/${editingLab.id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
            } else {
                await apiClient.post('/labs', data, { headers: { 'Content-Type': 'multipart/form-data' } });
            }
            Alert.alert("Success", `Lab ${editingLab ? 'updated' : 'created'} successfully!`);
            setIsModalOpen(false);
            fetchLabs();
        } catch (error: any) { Alert.alert("Save Error", error.response?.data?.message || 'An unknown error occurred.'); }
    };

    const handleDelete = async (id: number) => {
        Alert.alert("Confirm Deletion", "Are you sure you want to delete this lab?", [
            { text: "Cancel", style: "cancel" },
            { text: "Delete", style: "destructive", onPress: async () => {
                try {
                    // ★★★ 4. USE apiClient ★★★
                    await apiClient.delete(`/labs/${id}`);
                    Alert.alert("Success", "Lab deleted.");
                    fetchLabs();
                } catch (e: any) { Alert.alert("Error", e.response?.data?.message || "Failed to delete lab."); }
            }}
        ]);
    };

    if (isLoading) {
        return <View style={styles.centered}><ActivityIndicator size="large" color="#008080" /></View>;
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={labs}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => <LabCard lab={item} onEdit={handleOpenModal} onDelete={handleDelete} />}
                ListHeaderComponent={
                    <View style={styles.header}>
                        <MaterialIcons name="science" size={30} color="#00695c" />
                        <View style={styles.headerTextContainer}>
                            <Text style={styles.headerTitle}>Manage Digital Labs</Text>
                            <Text style={styles.headerSubtitle}>Add or remove learning resources.</Text>
                        </View>
                    </View>
                }
                ListFooterComponent={ <TouchableOpacity style={styles.addButton} onPress={() => handleOpenModal(null)}><MaterialIcons name="add" size={24} color="#fff" /><Text style={styles.addButtonText}>Add New Lab</Text></TouchableOpacity> }
                ListEmptyComponent={<Text style={styles.emptyText}>No labs created yet. Add one below.</Text>}
            />
            <Modal visible={isModalOpen} onRequestClose={() => setIsModalOpen(false)} animationType="slide">
                <ScrollView style={styles.modalContainer} contentContainerStyle={{ paddingBottom: 40 }}>
                    <Text style={styles.modalTitle}>{editingLab ? 'Edit Digital Lab' : 'Add New Digital Lab'}</Text>
                    <TextInput style={styles.input} placeholder="Title (e.g., Virtual Chemistry Lab)" value={formData.title} onChangeText={t => setFormData({...formData, title: t})} />
                    <TextInput style={styles.input} placeholder="Subject (e.g., Science)" value={formData.subject} onChangeText={t => setFormData({...formData, subject: t})} />
                    <TextInput style={styles.input} placeholder="Type (e.g., Simulation, PDF, Video)" value={formData.lab_type} onChangeText={t => setFormData({...formData, lab_type: t})} />
                    <TextInput style={styles.textarea} placeholder="Description" value={formData.description} onChangeText={t => setFormData({...formData, description: t})} multiline />
                    <TouchableOpacity style={styles.uploadButton} onPress={handleChoosePhoto}><MaterialIcons name="image" size={20} color="#fff" /><Text style={styles.uploadButtonText}>{editingLab?.cover_image_url || selectedImage ? 'Change Cover Image' : 'Select Cover Image'}</Text></TouchableOpacity>
                    {selectedImage?.assets?.[0]?.uri && <Text style={styles.fileNameText}>Selected: {selectedImage.assets[0].fileName}</Text>}
                    <Text style={styles.orText}>- OR -</Text>
                    <TextInput style={styles.input} placeholder="Access URL (Optional if uploading file)" value={formData.access_url} onChangeText={t => setFormData({...formData, access_url: t})} keyboardType="url" />
                    <TouchableOpacity style={[styles.uploadButton, {backgroundColor: '#5cb85c'}]} onPress={handleChooseFile}><MaterialIcons name="attach-file" size={20} color="#fff" /><Text style={styles.uploadButtonText}>{editingLab?.file_path || selectedFile ? 'Change Lab File' : 'Upload Lab File (PDF, etc.)'}</Text></TouchableOpacity>
                    {selectedFile?.name && <Text style={styles.fileNameText}>Selected: {selectedFile.name}</Text>}
                    {editingLab?.file_path && !selectedFile && <Text style={styles.fileNameText}>Current file: {editingLab.file_path.split('/').pop()}</Text>}
                    <View style={styles.modalActions}>
                        <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setIsModalOpen(false)}><Text>Cancel</Text></TouchableOpacity>
                        <TouchableOpacity style={[styles.modalButton, styles.saveButton]} onPress={handleSave}><Text style={styles.saveButtonText}>Save Lab</Text></TouchableOpacity>
                    </View>
                </ScrollView>
            </Modal>
        </View>
    );
};

// Styles remain unchanged
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#e8f5e9' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#ddd', flexDirection: 'row', alignItems: 'center' },
    headerTextContainer: { marginLeft: 15 },
    headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#004d40' },
    headerSubtitle: { fontSize: 15, color: '#37474f', marginTop: 4 },
    emptyText: { textAlign: 'center', marginVertical: 40, fontSize: 16 },
    addButton: { flexDirection: 'row', backgroundColor: '#00796b', padding: 15, margin: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
    addButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginLeft: 10 },
    modalContainer: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
    modalTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 15, fontSize: 16 },
    textarea: { height: 100, textAlignVertical: 'top', backgroundColor: '#fff', borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 15, fontSize: 16 },
    uploadButton: { flexDirection: 'row', backgroundColor: '#1e88e5', padding: 12, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginBottom: 5 },
    uploadButtonText: { color: '#fff', marginLeft: 10, fontWeight: 'bold' },
    fileNameText: { textAlign: 'center', marginBottom: 15, marginTop: 5, color: '#333', fontStyle: 'italic' },
    orText: { textAlign: 'center', marginVertical: 10, fontSize: 16, color: '#777', fontWeight: 'bold' },
    modalActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20, borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 15 },
    modalButton: { paddingVertical: 12, paddingHorizontal: 25, borderRadius: 8 },
    cancelButton: { backgroundColor: '#ddd' },
    saveButton: { backgroundColor: '#00796b' },
    saveButtonText: { color: '#fff', fontWeight: 'bold' },
});

export default TeacherAdminLabsScreen;