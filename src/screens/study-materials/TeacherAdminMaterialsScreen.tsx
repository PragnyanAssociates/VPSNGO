// 📂 File: src/screens/study-materials/TeacherAdminMaterialsScreen.tsx (MODIFIED & CORRECTED)

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, Modal, ScrollView, TextInput, Linking } from 'react-native';
// ★★★ 1. IMPORT apiClient AND SERVER_URL, REMOVE API_BASE_URL ★★★
import apiClient from '../../api/client';
import { SERVER_URL } from '../../../apiConfig';
import { useAuth } from '../../context/AuthContext';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { Picker } from '@react-native-picker/picker';
import { useIsFocused } from '@react-navigation/native';
import { pick, types, isCancel } from '@react-native-documents/picker';

// --- Main Router Component ---
const TeacherAdminMaterialsScreen = () => {
    const { user } = useAuth();
    const [materials, setMaterials] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingMaterial, setEditingMaterial] = useState(null);
    const isFocused = useIsFocused();

    const fetchMaterials = useCallback(async () => {
        if (!user?.id) return;
        setIsLoading(true);
        try {
            // ★★★ 2. USE apiClient ★★★
            const response = await apiClient.get(`/study-materials/teacher/${user.id}`);
            setMaterials(response.data);
        } catch (error: any) { Alert.alert("Error", error.response?.data?.message || "Failed to fetch your materials."); }
        finally { setIsLoading(false); }
    }, [user?.id]);

    useEffect(() => {
        if (isFocused) {
            fetchMaterials();
        }
    }, [isFocused, fetchMaterials]);

    const openModal = (material = null) => {
        setEditingMaterial(material);
        setIsModalVisible(true);
    };

    const handleDelete = (material) => {
        Alert.alert("Confirm Delete", "Are you sure you want to delete this study material?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete", style: "destructive",
                onPress: async () => {
                    try {
                        // ★★★ 3. USE apiClient ★★★
                        await apiClient.delete(`/study-materials/${material.material_id}`);
                        Alert.alert("Success", "Material deleted.");
                        setMaterials(prev => prev.filter(m => m.material_id !== material.material_id));
                    } catch (error: any) { Alert.alert("Error", error.response?.data?.message || "Failed to delete."); }
                },
            },
        ]);
    };

    const renderItem = ({ item }) => {
        return (
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>{item.title}</Text>
                    <View style={styles.actionIcons}>
                        <TouchableOpacity onPress={() => openModal(item)}><MaterialIcons name="edit" size={22} color="#007bff" /></TouchableOpacity>
                        <TouchableOpacity onPress={() => handleDelete(item)} style={{ marginLeft: 15 }}><MaterialIcons name="delete" size={22} color="#dc3545" /></TouchableOpacity>
                    </View>
                </View>
                <Text style={styles.cardSubtitle}>For: {item.class_group} | Subject: {item.subject}</Text>
                <Text style={styles.cardDescription}>{item.description || 'No description provided.'}</Text>
                
                <View style={styles.buttonContainer}>
                    {item.file_path && (
                        <TouchableOpacity 
                            style={styles.viewButton} 
                            // ★★★ 4. USE SERVER_URL for files ★★★
                            onPress={() => Linking.openURL(`${SERVER_URL}${item.file_path}`)}
                        >
                            <MaterialIcons name="download" size={18} color="#fff" />
                            <Text style={styles.viewButtonText}>Download</Text>
                        </TouchableOpacity>
                    )}
                    {item.external_link && (
                        <TouchableOpacity 
                            style={[styles.viewButton, styles.linkButton]} 
                            onPress={() => Linking.openURL(item.external_link)}
                        >
                            <MaterialIcons name="launch" size={18} color="#fff" />
                            <Text style={styles.viewButtonText}>Open Link</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <FlatList
                data={materials}
                keyExtractor={(item) => item.material_id.toString()}
                renderItem={renderItem}
                ListHeaderComponent={<Text style={styles.headerTitle}>My Uploaded Materials</Text>}
                ListFooterComponent={<TouchableOpacity style={styles.addButton} onPress={() => openModal()}><MaterialIcons name="add" size={24} color="#fff" /><Text style={styles.addButtonText}>Add New Material</Text></TouchableOpacity>}
                onRefresh={fetchMaterials}
                refreshing={isLoading}
                ListEmptyComponent={!isLoading && <Text style={styles.emptyText}>You haven't uploaded any materials yet.</Text>}
            />
            {isModalVisible && <MaterialFormModal material={editingMaterial} onClose={() => setIsModalVisible(false)} onSave={fetchMaterials} />}
        </View>
    );
};

// --- Modal Form Component ---
const MaterialFormModal = ({ material, onClose, onSave }) => {
    const { user } = useAuth();
    const isEditMode = !!material;
    const [title, setTitle] = useState(isEditMode ? material.title : '');
    const [description, setDescription] = useState(isEditMode ? material.description : '');
    const [subject, setSubject] = useState(isEditMode ? material.subject : '');
    const [classGroup, setClassGroup] = useState(isEditMode ? material.class_group : '');
    const [materialType, setMaterialType] = useState(isEditMode ? material.material_type : 'Notes');
    const [externalLink, setExternalLink] = useState(isEditMode ? material.external_link || '' : '');
    const [file, setFile] = useState(null);
    const [studentClasses, setStudentClasses] = useState([]);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchClasses = async () => { try { 
            // ★★★ 5. USE apiClient ★★★
            const response = await apiClient.get('/student-classes');
            setStudentClasses(response.data); 
        } catch (e) { console.error(e); }};
        fetchClasses();
    }, []);

    const handleFilePick = async () => {
        try {
            const result = await pick({ type: [types.allFiles], allowMultiSelection: false });
            if (result && result.length > 0) {
                setFile(result[0]);
            }
        } catch (err) {
            if (isCancel(err)) { console.log('User cancelled file selection.'); } 
            else { Alert.alert("Error", "An unknown error occurred while picking the file."); console.error(err); }
        }
    };

    const handleSave = async () => {
        if (!title || !classGroup) return Alert.alert("Validation Error", "Title and Class are required.");
        setIsSaving(true);
        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('class_group', classGroup);
        formData.append('subject', subject);
        formData.append('material_type', materialType);
        formData.append('external_link', externalLink);
        formData.append('uploaded_by', user.id.toString());

        if (file) {
            formData.append('materialFile', {
                uri: file.uri,
                type: file.type,
                name: file.name,
            });
        } else if (isEditMode && material.file_path) {
            formData.append('existing_file_path', material.file_path);
        }
        
        try {
            // ★★★ 6. USE apiClient FOR SAVING/UPDATING ★★★
            if (isEditMode) {
                await apiClient.put(`/study-materials/${material.material_id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            } else {
                await apiClient.post('/study-materials', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            }
            Alert.alert("Success", `Material ${isEditMode ? 'updated' : 'uploaded'} successfully.`);
            onSave();
            onClose();
        } catch (error: any) {
            Alert.alert("Error", error.response?.data?.message || "Save failed.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Modal visible={true} onRequestClose={onClose} animationType="slide">
            <ScrollView style={styles.modalView} contentContainerStyle={{ paddingBottom: 40 }}>
                <Text style={styles.modalTitle}>{isEditMode ? 'Edit Material' : 'Add New Material'}</Text>
                <Text style={styles.label}>Title *</Text><TextInput style={styles.input} value={title} onChangeText={setTitle} />
                <Text style={styles.label}>Description</Text><TextInput style={[styles.input, {height: 80}]} multiline value={description} onChangeText={setDescription} />
                <Text style={styles.label}>Subject</Text><TextInput style={styles.input} value={subject} onChangeText={setSubject} />
                <Text style={styles.label}>Class *</Text>
                <View style={styles.pickerContainer}><Picker selectedValue={classGroup} onValueChange={setClassGroup}><Picker.Item label="-- Select Class --" value="" />{studentClasses.map(c => <Picker.Item key={c} label={c} value={c} />)}</Picker></View>
                <Text style={styles.label}>Type *</Text>
                <View style={styles.pickerContainer}><Picker selectedValue={materialType} onValueChange={setMaterialType}>{['Notes', 'Presentation', 'Video Lecture', 'Worksheet', 'Link', 'Other'].map(t => <Picker.Item key={t} label={t} value={t} />)}</Picker></View>
                <Text style={styles.label}>External Link (e.g., for Videos)</Text><TextInput style={styles.input} value={externalLink} onChangeText={setExternalLink} keyboardType="url"/>
                <TouchableOpacity style={styles.uploadButton} onPress={handleFilePick}>
                    <MaterialIcons name="attach-file" size={20} color="#fff" />
                    <Text style={styles.uploadButtonText} numberOfLines={1}>
                        {file ? file.name : (material?.file_path?.split('/').pop() || 'Select File')}
                    </Text>
                </TouchableOpacity>
                <View style={styles.modalActions}>
                    <TouchableOpacity style={[styles.modalBtn, styles.cancelBtn]} onPress={onClose}><Text style={styles.modalBtnText}>Cancel</Text></TouchableOpacity>
                    <TouchableOpacity style={[styles.modalBtn, styles.createBtn]} onPress={handleSave} disabled={isSaving}>{isSaving ? <ActivityIndicator color="#fff" /> : <Text style={styles.modalBtnText}>Save</Text>}</TouchableOpacity>
                </View>
            </ScrollView>
        </Modal>
    );
};

// Styles remain the same
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f4f6f8' },
    headerTitle: { fontSize: 24, fontWeight: 'bold', padding: 15, color: '#333' },
    card: { backgroundColor: '#fff', borderRadius: 8, marginHorizontal: 15, marginVertical: 8, padding: 15, elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 3 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    actionIcons: { flexDirection: 'row' },
    cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#37474f', flex: 1, marginRight: 10 },
    cardSubtitle: { fontSize: 14, color: '#546e7a', marginTop: 4, marginBottom: 8 },
    cardDescription: { fontSize: 14, color: '#455a64', marginBottom: 15 },
    buttonContainer: { marginTop: 'auto' },
    viewButton: { flexDirection: 'row', backgroundColor: '#0288d1', paddingVertical: 10, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginTop: 10, },
    linkButton: { backgroundColor: '#c2185b' },
    viewButtonText: { color: '#fff', fontWeight: 'bold', marginLeft: 8 },
    addButton: { flexDirection: 'row', backgroundColor: '#28a745', padding: 15, margin: 15, borderRadius: 10, justifyContent: 'center', alignItems: 'center', elevation: 3 },
    addButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginLeft: 10 },
    emptyText: { textAlign: 'center', marginTop: 50, fontSize: 16, color: '#777' },
    modalView: { flex: 1, padding: 20, backgroundColor: '#f9f9f9' },
    modalTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    label: { fontSize: 16, fontWeight: '500', color: '#444', marginBottom: 5, marginLeft: 5 },
    input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ccc', padding: 12, borderRadius: 8, marginBottom: 15 },
    pickerContainer: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, marginBottom: 15, backgroundColor: '#fff' },
    uploadButton: { flexDirection: 'row', backgroundColor: '#007bff', padding: 12, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginVertical: 10 },
    uploadButtonText: { color: '#fff', fontWeight: 'bold', marginLeft: 10, flex: 1 },
    modalActions: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 20 },
    modalBtn: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
    modalBtnText: { color: '#fff', fontWeight: 'bold' },
    cancelBtn: { backgroundColor: '#6c757d', marginRight: 10 },
    createBtn: { backgroundColor: '#28a745', marginLeft: 10 },
});

export default TeacherAdminMaterialsScreen;