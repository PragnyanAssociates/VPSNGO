import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Alert, Modal, TextInput, ScrollView, RefreshControl } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { Picker } from '@react-native-picker/picker';
import apiClient from '../../api/client';

const CLASS_GROUPS = ['LKG', 'UKG', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'];

const TeacherAdminResourcesScreen = () => {
    const [view, setView] = useState('syllabus'); // syllabus, textbooks
    const [syllabi, setSyllabi] = useState([]);
    const [textbooks, setTextbooks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Modal State
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    // Form State
    const [selectedClass, setSelectedClass] = useState('');
    const [subjectName, setSubjectName] = useState('');
    const [content, setContent] = useState('');
    const [url, setUrl] = useState('');
    
    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [syllabusRes, textbookRes] = await Promise.all([
                apiClient.get('/resources/syllabus'),
                apiClient.get('/resources/textbooks')
            ]);
            setSyllabi(syllabusRes.data);
            setTextbooks(textbookRes.data);
        } catch (e) {
            Alert.alert("Error", "Failed to fetch data.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const resetForm = () => {
        setEditingItem(null);
        setSelectedClass('');
        setSubjectName('');
        setContent('');
        setUrl('');
    };

    const openCreateModal = () => {
        resetForm();
        if (view === 'textbooks' && textbooks.length > 0) {
            setSelectedClass(textbooks[0].class_group);
            setUrl(textbooks[0].url);
        }
        setIsModalVisible(true);
    };

    const openEditModal = (item) => {
        setEditingItem(item);
        setSelectedClass(item.class_group);
        if (view === 'syllabus') {
            setSubjectName(item.subject_name);
            // Fetch full content for editing
            apiClient.get(`/resources/syllabus/content/${item.id}`).then(res => setContent(res.data.content));
        } else {
            setUrl(item.url);
        }
        setIsModalVisible(true);
    };

    const handleDelete = (item) => {
        Alert.alert(`Confirm Delete`, `Delete syllabus for ${item.subject_name} (${item.class_group})?`, [
            { text: "Cancel", style: 'cancel' },
            { text: "Delete", style: 'destructive', onPress: async () => {
                try {
                    if (view === 'syllabus') {
                        await apiClient.delete(`/resources/syllabus/${item.id}`);
                        fetchData();
                    }
                } catch(e) { Alert.alert("Error", `Could not delete syllabus.`); }
            }},
        ]);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            if (view === 'syllabus') {
                if (!selectedClass || !subjectName || !content) throw new Error("All fields are required.");
                const payload = { class_group: selectedClass, subject_name: subjectName, content };
                if (editingItem) {
                    await apiClient.put(`/resources/syllabus/${editingItem.id}`, payload);
                } else {
                    await apiClient.post('/resources/syllabus', payload);
                }
            } else { // Textbooks
                if (!selectedClass || !url) throw new Error("Class and URL are required.");
                await apiClient.post('/resources/textbooks', { class_group: selectedClass, url });
            }
            Alert.alert("Success", "Saved successfully!");
            setIsModalVisible(false);
            fetchData();
        } catch (e) {
            Alert.alert("Error", e.message);
        } finally {
            setIsSaving(false);
        }
    };
    
    const renderSyllabusList = () => (
        <FlatList
            data={syllabi}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
                <View style={styles.card}>
                    <View style={styles.cardContent}>
                        <Text style={styles.cardTitle}>{item.subject_name}</Text>
                        <Text style={styles.cardSubtitle}>Class: {item.class_group}</Text>
                    </View>
                    <View style={styles.cardActions}>
                        <TouchableOpacity style={styles.actionButton} onPress={() => openEditModal(item)}><MaterialIcons name="edit" size={22} color="#0288d1" /></TouchableOpacity>
                        <TouchableOpacity style={styles.actionButton} onPress={() => handleDelete(item)}><MaterialIcons name="delete" size={22} color="#d32f2f" /></TouchableOpacity>
                    </View>
                </View>
            )}
            ListEmptyComponent={<Text style={styles.emptyText}>No syllabus entries yet.</Text>}
            refreshControl={<RefreshControl refreshing={isLoading} onRefresh={fetchData} />}
        />
    );

    const renderTextbookList = () => (
         <FlatList
            data={textbooks}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
                <View style={styles.card}>
                    <View style={styles.cardContent}>
                        <Text style={styles.cardTitle}>Textbooks for {item.class_group}</Text>
                        <Text style={styles.cardSubtitle} numberOfLines={1}>URL: {item.url}</Text>
                    </View>
                     <View style={styles.cardActions}>
                        <TouchableOpacity style={styles.actionButton} onPress={() => openEditModal(item)}><MaterialIcons name="edit" size={22} color="#0288d1" /></TouchableOpacity>
                    </View>
                </View>
            )}
            ListEmptyComponent={<Text style={styles.emptyText}>No textbook links added yet.</Text>}
            refreshControl={<RefreshControl refreshing={isLoading} onRefresh={fetchData} />}
        />
    );
    
    return (
        <View style={styles.container}>
            <View style={styles.tabContainer}>
                <TouchableOpacity style={[styles.tab, view === 'syllabus' && styles.tabActive]} onPress={() => setView('syllabus')}>
                    <Text style={[styles.tabText, view === 'syllabus' && styles.tabTextActive]}>Syllabus</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.tab, view === 'textbooks' && styles.tabActive]} onPress={() => setView('textbooks')}>
                    <Text style={[styles.tabText, view === 'textbooks' && styles.tabTextActive]}>Textbooks</Text>
                </TouchableOpacity>
            </View>

            {isLoading ? <ActivityIndicator size="large" /> : (view === 'syllabus' ? renderSyllabusList() : renderTextbookList())}
            
            <TouchableOpacity style={styles.fab} onPress={openCreateModal}>
                <MaterialIcons name="add" size={28} color="#fff" />
            </TouchableOpacity>

            <Modal visible={isModalVisible} onRequestClose={() => setIsModalVisible(false)} animationType="slide">
                <ScrollView style={styles.modalView}>
                    <Text style={styles.modalTitle}>{editingItem ? 'Edit' : 'Create'} {view === 'syllabus' ? 'Syllabus' : 'Textbook Link'}</Text>
                    
                    <Text style={styles.label}>Class</Text>
                    <View style={styles.pickerContainer}>
                        <Picker selectedValue={selectedClass} onValueChange={itemValue => setSelectedClass(itemValue)}>
                            <Picker.Item label="-- Select a class --" value="" />
                            {CLASS_GROUPS.map(c => <Picker.Item key={c} label={c} value={c} />)}
                        </Picker>
                    </View>

                    {view === 'syllabus' ? (
                        <>
                            <Text style={styles.label}>Subject Name</Text>
                            <TextInput style={styles.input} value={subjectName} onChangeText={setSubjectName} placeholder="e.g., English" />
                            <Text style={styles.label}>Syllabus Content</Text>
                            <TextInput style={[styles.input, styles.textArea]} value={content} onChangeText={setContent} placeholder="Enter syllabus details..." multiline />
                        </>
                    ) : (
                        <>
                            <Text style={styles.label}>Textbook URL</Text>
                            <TextInput style={styles.input} value={url} onChangeText={setUrl} placeholder="https://..." keyboardType="url" />
                        </>
                    )}

                    <View style={styles.modalActions}>
                        <TouchableOpacity style={[styles.modalBtn, styles.cancelBtn]} onPress={() => setIsModalVisible(false)}><Text style={styles.btnText}>Cancel</Text></TouchableOpacity>
                        <TouchableOpacity style={[styles.modalBtn, styles.saveBtn]} onPress={handleSave} disabled={isSaving}>
                            {isSaving ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Save</Text>}
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f4f6f8' },
    tabContainer: { flexDirection: 'row', backgroundColor: '#fff', elevation: 2 },
    tab: { flex: 1, padding: 15, alignItems: 'center', borderBottomWidth: 3, borderBottomColor: 'transparent' },
    tabActive: { borderBottomColor: '#008080' },
    tabText: { fontSize: 16, color: '#757575' },
    tabTextActive: { color: '#008080', fontWeight: 'bold' },
    card: { backgroundColor: '#fff', borderRadius: 8, marginHorizontal: 15, marginVertical: 8, padding: 20, elevation: 2, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    cardContent: { flex: 1, marginRight: 10 },
    cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#37474f' },
    cardSubtitle: { fontSize: 14, color: '#546e7a', marginTop: 4 },
    cardActions: { flexDirection: 'row' },
    actionButton: { padding: 8 },
    fab: { position: 'absolute', right: 20, bottom: 20, backgroundColor: '#1e88e5', width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 4 },
    emptyText: { textAlign: 'center', marginTop: 50, fontSize: 16, color: '#777' },
    modalView: { flex: 1, padding: 20, backgroundColor: '#f9f9f9' },
    modalTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    label: { fontSize: 16, fontWeight: '500', color: '#444', marginBottom: 5, marginLeft: 5, marginTop: 10 },
    input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ccc', padding: 12, borderRadius: 8, marginBottom: 5 },
    textArea: { height: 150, textAlignVertical: 'top' },
    pickerContainer: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, backgroundColor: '#fff' },
    modalActions: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 30, marginBottom: 50 },
    modalBtn: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginHorizontal: 5, elevation: 2 },
    saveBtn: { backgroundColor: '#388e3c' },
    cancelBtn: { backgroundColor: '#6c757d' },
    btnText: { color: '#fff', fontWeight: 'bold' },
});

export default TeacherAdminResourcesScreen;