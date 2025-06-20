import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Alert, Modal, TextInput, ScrollView, Linking } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { Picker } from '@react-native-picker/picker';
// ✅ IMPORT THE NEW, WORKING LIBRARY
import { launchImageLibrary } from 'react-native-image-picker';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../../apiConfig';

const TeacherAdminHomeworkScreen = ({ navigation }) => {
    const [view, setView] = useState('assignments');
    const [selectedAssignment, setSelectedAssignment] = useState(null);

    const viewSubmissions = (assignment: any) => { setSelectedAssignment(assignment); setView('submissions'); };
    const backToAssignments = () => { setSelectedAssignment(null); setView('assignments'); };

    if (view === 'assignments') return <AssignmentList onSelectAssignment={viewSubmissions} />;
    if (view === 'submissions' && selectedAssignment) return <SubmissionList assignment={selectedAssignment} onBack={backToAssignments} />;
    return null;
};

// --- Assignment List View Component ---
const AssignmentList = ({ onSelectAssignment }: { onSelectAssignment: (assignment: any) => void }) => {
    const { user } = useAuth();
    const [assignments, setAssignments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingAssignment, setEditingAssignment] = useState<any>(null);
    
    const [studentClasses, setStudentClasses] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    
    const initialAssignmentState = { title: '', description: '', due_date: '' };
    const [newAssignment, setNewAssignment] = useState(initialAssignmentState);
    const [attachment, setAttachment] = useState<any>(null);
    const [isSaving, setIsSaving] = useState(false);

    const fetchTeacherAssignments = useCallback(async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/homework/teacher/${user.id}`);
            if (!response.ok) throw new Error("Failed to fetch assignment history.");
            setAssignments(await response.json());
        } catch (e: any) { Alert.alert("Error", e.message); }
        finally { setIsLoading(false); }
    }, [user]);

    const fetchStudentClasses = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/student-classes`);
            if(response.ok) setStudentClasses(await response.json());
        } catch (e) { console.error("Error fetching student classes:", e); }
    };
    
    useEffect(() => {
        fetchTeacherAssignments();
        fetchStudentClasses();
    }, [fetchTeacherAssignments]);

    const handleClassChange = async (classGroup: string) => {
        setSelectedClass(classGroup);
        setSubjects([]);
        setSelectedSubject('');
        if (classGroup) {
            try {
                const response = await fetch(`${API_BASE_URL}/api/subjects-for-class/${classGroup}`);
                const data = await response.json();
                setSubjects(data);
                return data;
            } catch (e) { console.error(e); return []; }
        }
        return [];
    };

    const openCreateModal = () => {
        setEditingAssignment(null);
        setNewAssignment(initialAssignmentState);
        setSelectedClass('');
        setSelectedSubject('');
        setSubjects([]);
        setAttachment(null);
        setIsModalVisible(true);
    };

    const openEditModal = async (assignment: any) => {
        setEditingAssignment(assignment);
        const date = new Date(assignment.due_date);
        const formattedDate = date.toISOString().split('T')[0];
        setNewAssignment({ title: assignment.title, description: assignment.description, due_date: formattedDate });
        setAttachment(assignment.attachment_path ? { name: assignment.attachment_path.split('/').pop() } : null);
        const fetchedSubjects = await handleClassChange(assignment.class_group);
        if (fetchedSubjects.includes(assignment.subject)) {
            setSelectedSubject(assignment.subject);
        }
        setIsModalVisible(true);
    };

    const handleDelete = (assignment: any) => {
        Alert.alert("Confirm Delete", `Are you sure you want to delete "${assignment.title}"?`, [
            { text: "Cancel", style: 'cancel' },
            { text: "Delete", style: 'destructive', onPress: async () => {
                try {
                    const response = await fetch(`${API_BASE_URL}/api/homework/${assignment.id}`, { method: 'DELETE' });
                    if (!response.ok) throw new Error('Failed to delete assignment.');
                    Alert.alert("Success", "Assignment deleted.");
                    fetchTeacherAssignments();
                } catch(e: any) { Alert.alert("Error", e.message); }
            }},
        ]);
    };

    const handleSave = async () => {
        const isEditing = !!editingAssignment;
        const url = isEditing ? `${API_BASE_URL}/api/homework/${editingAssignment.id}` : `${API_BASE_URL}/api/homework`;
        if (!user || !selectedClass || !selectedSubject || !newAssignment.title || !newAssignment.due_date) {
            return Alert.alert("Validation Error", "Title, Class, Subject, and Due Date are required.");
        }
        setIsSaving(true);
        const formData = new FormData();
        formData.append('title', newAssignment.title);
        formData.append('description', newAssignment.description || '');
        formData.append('due_date', newAssignment.due_date);
        formData.append('class_group', selectedClass);
        formData.append('subject', selectedSubject);
        if (!isEditing) { formData.append('teacher_id', user.id); }

        if (attachment && attachment.uri) {
            formData.append('attachment', { uri: attachment.uri, type: attachment.type, name: attachment.name });
        } else if (isEditing && editingAssignment.attachment_path) {
            formData.append('existing_attachment_path', editingAssignment.attachment_path);
        }
        
        try {
            // ✅ Note: The Homework route uses POST for both create and update. This is correct.
            const response = await fetch(url, { method: 'POST', body: formData, headers: {'Content-Type': 'multipart/form-data'} });
            const resData = await response.json();
            if (!response.ok) throw new Error(resData.message || "An error occurred.");
            Alert.alert("Success", `Assignment ${isEditing ? 'updated' : 'created'}!`);
            setIsModalVisible(false);
            fetchTeacherAssignments();
        } catch (e: any) {
            Alert.alert("Error", e.message);
        } finally {
            setIsSaving(false);
        }
    };

    // ✅ MODIFIED: This function now uses the reliable react-native-image-picker
    const selectAttachment = () => {
        launchImageLibrary({
            mediaType: 'mixed', // Allows picking any file type, not just images/videos
        }, (response) => {
            if (response.didCancel) {
                console.log('User cancelled file selection');
            } else if (response.errorCode) {
                Alert.alert("Error", `Could not select file: ${response.errorMessage}`);
            } else if (response.assets && response.assets.length > 0) {
                const selectedFile = response.assets[0];
                setAttachment({
                    uri: selectedFile.uri,
                    type: selectedFile.type,
                    name: selectedFile.fileName,
                });
            }
        });
    };
    
    return (
        <View style={styles.container}>
            <FlatList
                data={assignments}
                keyExtractor={(item: any) => item.id.toString()}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <View style={styles.cardHeaderRow}>
                            <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
                            <View style={styles.actionIconContainer}>
                                <TouchableOpacity onPress={() => openEditModal(item)}><MaterialIcons name="edit" size={24} color="#007bff" /></TouchableOpacity>
                                <TouchableOpacity onPress={() => handleDelete(item)} style={{marginLeft: 15}}><MaterialIcons name="delete" size={24} color="#dc3545" /></TouchableOpacity>
                            </View>
                        </View>
                        <Text style={styles.cardSubtitle}>For: {item.class_group} - {item.subject}</Text>
                        <Text style={styles.cardDetail}>Due: {new Date(item.due_date).toLocaleDateString()}</Text>
                        <View style={item.submission_count > 0 ? styles.badge : styles.badgeMuted}><Text style={styles.badgeText}>{item.submission_count} Submission(s)</Text></View>
                        <TouchableOpacity style={styles.viewSubmissionsBtn} onPress={() => onSelectAssignment(item)}><Text style={styles.viewSubmissionsBtnText}>View Submissions & Grade</Text></TouchableOpacity>
                    </View>
                )}
                ListHeaderComponent={ <View style={styles.header}><Text style={styles.headerTitle}>My Created Assignments</Text></View> }
                ListFooterComponent={ <TouchableOpacity style={styles.addButton} onPress={openCreateModal}><MaterialIcons name="add" size={24} color="#fff" /><Text style={styles.addButtonText}>Create New Homework</Text></TouchableOpacity> }
                ListEmptyComponent={<View style={{paddingTop: 50}}><Text style={styles.emptyText}>You have not created any assignments yet.</Text></View>}
                onRefresh={fetchTeacherAssignments}
                refreshing={isLoading}
            />
            <Modal visible={isModalVisible} onRequestClose={() => setIsModalVisible(false)} animationType="slide">
                <ScrollView style={styles.modalView} contentContainerStyle={{paddingBottom: 50}}>
                    <Text style={styles.modalTitle}>{editingAssignment ? 'Edit Assignment' : 'Create New Assignment'}</Text>
                    <Text style={styles.label}>Class *</Text>
                    <View style={styles.pickerContainer}><Picker selectedValue={selectedClass} onValueChange={(itemValue) => handleClassChange(itemValue)}><Picker.Item label="-- Select a class --" value="" />{studentClasses.map(c => <Picker.Item key={c} label={c} value={c} />)}</Picker></View>
                    <Text style={styles.label}>Subject *</Text>
                    <View style={styles.pickerContainer}><Picker selectedValue={selectedSubject} onValueChange={(itemValue) => setSelectedSubject(itemValue)} enabled={subjects.length > 0}><Picker.Item label={subjects.length > 0 ? "-- Select a subject --" : "Select a class first"} value="" />{subjects.map(s => <Picker.Item key={s} label={s} value={s} />)}</Picker></View>
                    <Text style={styles.label}>Title *</Text>
                    <TextInput style={styles.input} placeholder="e.g., Chapter 5 Exercise" value={newAssignment.title} onChangeText={text => setNewAssignment({...newAssignment, title: text})} />
                    <Text style={styles.label}>Description (Optional)</Text>
                    <TextInput style={[styles.input, {height: 100, textAlignVertical: 'top'}]} placeholder="Instructions for students" multiline value={newAssignment.description} onChangeText={text => setNewAssignment({...newAssignment, description: text})} />
                    <Text style={styles.label}>Due Date *</Text>
                    <TextInput style={styles.input} placeholder="YYYY-MM-DD" value={newAssignment.due_date} onChangeText={text => setNewAssignment({...newAssignment, due_date: text})} />
                    <TouchableOpacity style={styles.uploadButton} onPress={selectAttachment}><MaterialIcons name="attach-file" size={20} color="#fff" /><Text style={styles.uploadButtonText}>Attach File</Text></TouchableOpacity>
                    {attachment && <Text style={styles.attachmentText}>Selected: {attachment.name}</Text>}
                    <View style={styles.modalActions}><TouchableOpacity style={[styles.modalBtn, styles.cancelBtn]} onPress={() => setIsModalVisible(false)}><Text style={{color: '#fff', fontWeight: 'bold'}}>Cancel</Text></TouchableOpacity><TouchableOpacity style={[styles.modalBtn, styles.createBtn]} onPress={handleSave} disabled={isSaving}>{isSaving ? <ActivityIndicator color="#fff" /> : <Text style={{color: '#fff', fontWeight: 'bold'}}>{editingAssignment ? 'Save Changes' : 'Create'}</Text>}</TouchableOpacity></View>
                </ScrollView>
            </Modal>
        </View>
    );
};

// --- Submission List View Component ---
const SubmissionList = ({ assignment, onBack }: { assignment: any, onBack: () => void }) => {
    const [submissions, setSubmissions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
    const [gradeData, setGradeData] = useState({ grade: '', remarks: '' });
    const [isGrading, setIsGrading] = useState(false);

    const fetchSubmissions = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/homework/submissions/${assignment.id}`);
            if (!response.ok) throw new Error("Failed to fetch submissions.");
            setSubmissions(await response.json());
        } catch (e: any) { Alert.alert("Error", e.message); }
        finally { setIsLoading(false); }
    }, [assignment.id]);

    useEffect(() => { fetchSubmissions(); }, [fetchSubmissions]);
    
    const openGradeModal = (submission: any) => {
        setSelectedSubmission(submission);
        setGradeData({ grade: submission.grade || '', remarks: submission.remarks || '' });
    };

    const handleGrade = async () => {
        if (!selectedSubmission) return;
        setIsGrading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/homework/grade/${selectedSubmission.id}`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(gradeData),
            });
            if (!response.ok) throw new Error((await response.json()).message);
            Alert.alert("Success", "Submission graded!");
            setSelectedSubmission(null);
            fetchSubmissions();
        } catch (e: any) { Alert.alert("Error", e.message); }
        finally { setIsGrading(false); }
    };
    
    if (isLoading) { return <View style={styles.centered}><ActivityIndicator size="large" /></View>; }

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={onBack} style={styles.backButton}>
                <MaterialIcons name="arrow-back" size={24} color="#333" />
                <Text style={styles.backButtonText}>Back to Assignments</Text>
            </TouchableOpacity>
            <Text style={styles.submissionHeaderTitle}>Submissions for: "{assignment.title}"</Text>
            <FlatList
                data={submissions}
                keyExtractor={(item: any) => item.id.toString()}
                renderItem={({ item }) => (
                    <View style={styles.submissionCard}>
                        <Text style={styles.cardTitle}>{item.student_name}</Text>
                        <Text>Submitted: {new Date(item.submitted_at).toLocaleString()}</Text>
                        <Text>Status: {item.status} {item.grade && `(Grade: ${item.grade})`}</Text>
                        <View style={styles.submissionActions}>
                            <TouchableOpacity style={styles.actionLink} onPress={() => Linking.openURL(`${API_BASE_URL}${item.submission_path}`)}>
                                <MaterialIcons name="cloud-download" size={20} color="#2196f3"/>
                                <Text style={[styles.actionLinkText, {color: '#2196f3'}]}>View Submission</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.actionLink} onPress={() => openGradeModal(item)}>
                                <MaterialIcons name="grade" size={20} color="#4caf50"/>
                                <Text style={[styles.actionLinkText, {color: '#4caf50'}]}>{item.grade ? 'Update Grade' : 'Grade'}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
                ListEmptyComponent={<Text style={styles.emptyText}>No submissions received for this assignment yet.</Text>}
            />
            <Modal visible={!!selectedSubmission} onRequestClose={() => setSelectedSubmission(null)} transparent={true} animationType="fade">
                <View style={styles.gradeModalBackdrop}>
                    <View style={styles.gradeModalView}>
                        <Text style={styles.modalTitle}>Grade Submission</Text>
                        <Text style={styles.label}>Grade</Text>
                        <TextInput style={styles.input} placeholder="e.g., A+, 95/100" defaultValue={gradeData.grade} onChangeText={text => setGradeData({...gradeData, grade: text})} />
                        <Text style={styles.label}>Remarks / Feedback</Text>
                        <TextInput style={[styles.input, {height: 100, textAlignVertical: 'top'}]} placeholder="Provide feedback for the student" multiline defaultValue={gradeData.remarks} onChangeText={text => setGradeData({...gradeData, remarks: text})} />
                        <View style={styles.modalActions}>
                            <TouchableOpacity style={[styles.modalBtn, styles.cancelBtn]} onPress={() => setSelectedSubmission(null)}><Text style={{color: '#fff', fontWeight: 'bold'}}>Cancel</Text></TouchableOpacity>
                            <TouchableOpacity style={[styles.modalBtn, styles.createBtn]} onPress={handleGrade} disabled={isGrading}>
                                {isGrading ? <ActivityIndicator color="#fff"/> : <Text style={{color: '#fff', fontWeight: 'bold'}}>Submit Grade</Text>}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f4f6f8' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { paddingBottom: 10, paddingTop: 10 },
    headerTitle: { fontSize: 24, fontWeight: 'bold', paddingHorizontal: 15, color: '#333' },
    card: { backgroundColor: '#fff', borderRadius: 8, marginHorizontal: 15, marginVertical: 8, padding: 15, elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 3, shadowOffset: {width: 0, height: 1} },
    cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
    actionIconContainer: { flexDirection: 'row' },
    cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#37474f', flex: 1 },
    cardSubtitle: { fontSize: 14, color: '#546e7a', marginTop: 2 },
    cardDetail: { fontSize: 14, color: '#777', marginTop: 5 },
    viewSubmissionsBtn: { marginTop: 12, backgroundColor: '#007bff', paddingVertical: 10, borderRadius: 5, alignItems: 'center' },
    viewSubmissionsBtnText: { color: '#fff', fontWeight: 'bold' },
    addButton: { flexDirection: 'row', backgroundColor: '#28a745', padding: 15, margin: 15, borderRadius: 10, justifyContent: 'center', alignItems: 'center', elevation: 3 },
    addButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginLeft: 10 },
    modalView: { flex: 1, padding: 20, backgroundColor: '#f9f9f9' },
    modalTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: '#333' },
    label: { fontSize: 16, fontWeight: '500', color: '#444', marginBottom: 5, marginLeft: 5 },
    input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ccc', padding: 12, borderRadius: 8, marginBottom: 15, fontSize: 16 },
    pickerContainer: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, marginBottom: 15, backgroundColor: '#fff' },
    uploadButton: { flexDirection: 'row', backgroundColor: '#007bff', padding: 12, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
    uploadButtonText: { color: '#fff', fontWeight: 'bold', marginLeft: 10 },
    attachmentText: { textAlign: 'center', marginVertical: 10, fontStyle: 'italic', color: '#555' },
    modalActions: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 20 },
    modalBtn: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
    cancelBtn: { backgroundColor: '#6c757d', marginRight: 10 },
    createBtn: { backgroundColor: '#28a745', marginLeft: 10 },
    backButton: { flexDirection: 'row', alignItems: 'center', padding: 15 },
    backButtonText: { marginLeft: 5, fontSize: 18, color: '#333', fontWeight: '500' },
    emptyText: { textAlign: 'center', marginTop: 50, fontSize: 16, color: '#777' },
    submissionHeaderTitle: { fontSize: 20, fontWeight: 'bold', paddingHorizontal: 15, marginBottom: 10 },
    submissionCard: { backgroundColor: '#fff', borderRadius: 8, marginHorizontal: 15, marginVertical: 8, padding: 15, elevation: 2 },
    submissionActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 15, borderTopWidth: 1, borderTopColor: '#f0f0f0', paddingTop: 10 },
    actionLink: { flexDirection: 'row', alignItems: 'center' },
    actionLinkText: { marginLeft: 5, fontWeight: 'bold' },
    gradeModalBackdrop: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
    gradeModalView: { backgroundColor: 'white', padding: 25, borderRadius: 10, width: '90%', elevation: 10 },
    badge: { backgroundColor: '#ffb300', borderRadius: 12, paddingVertical: 4, paddingHorizontal: 10, alignSelf: 'flex-start', marginTop: 10 },
    badgeMuted: { backgroundColor: '#e0e0e0', borderRadius: 12, paddingVertical: 4, paddingHorizontal: 10, alignSelf: 'flex-start', marginTop: 10 },
    badgeText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
});

export default TeacherAdminHomeworkScreen;