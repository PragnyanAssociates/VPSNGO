// 📂 File: src/screens/results/TeacherAdminResultsScreen.tsx (MODIFIED & CORRECTED)

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, ScrollView, TextInput } from 'react-native';
// ★★★ 1. IMPORT apiClient AND REMOVE API_BASE_URL ★★★
import apiClient from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { Picker } from '@react-native-picker/picker';
import { useIsFocused } from '@react-navigation/native';

const TeacherAdminResultsScreen = ({ navigation }) => {
    const [activeTab, setActiveTab] = useState('History');
    const [navigationState, setNavigationState] = useState({ student: null, reportToEdit: null });
    const navigateToForm = (student, report = null) => { setNavigationState({ student, reportToEdit: report }); setActiveTab('Create'); };
    return (
        <View style={styles.container}>
            <Text style={styles.mainHeaderTitle}>Manage Progress Reports</Text>
            <View style={styles.tabContainer}><TouchableOpacity style={[styles.tabButton, activeTab === 'History' && styles.activeTab]} onPress={() => setActiveTab('History')}><Text style={[styles.tabText, activeTab === 'History' && styles.activeTabText]}>History</Text></TouchableOpacity><TouchableOpacity style={[styles.tabButton, activeTab === 'Create' && styles.activeTab]} onPress={() => setActiveTab('Create')}><Text style={[styles.tabText, activeTab === 'Create' && styles.activeTabText]}>Create / Edit</Text></TouchableOpacity></View>
            {activeTab === 'History' && <HistoryView onNavigateToCreate={navigateToForm} onNavigateToEdit={navigateToForm} navigation={navigation} />}
            {activeTab === 'Create' && <ReportForm studentForForm={navigationState.student} reportToEdit={navigationState.reportToEdit} onFinish={() => setActiveTab('History')} />}
        </View>
    );
};

const HistoryView = ({ onNavigateToCreate, onNavigateToEdit, navigation }) => {
    const [classes, setClasses] = useState([]);
    const [students, setStudents] = useState([]);
    const [reports, setReports] = useState([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const isFocused = useIsFocused();

    useEffect(() => {
        // ★★★ 2. USE apiClient FOR ALL FETCH CALLS ★★★
        const fetchClasses = async () => { try { const res = await apiClient.get('/student-classes'); setClasses(res.data); } catch(e) { console.error(e) }};
        fetchClasses();
    }, []);

    const handleClassChange = async (classGroup) => {
        setSelectedClass(classGroup); setSelectedStudent(null); setReports([]); setStudents([]);
        if (classGroup) { try { const res = await apiClient.get(`/reports/class/${classGroup}/students`); setStudents(res.data); } catch (e) { console.error(e); } }
    };

    const handleStudentChange = async (studentId) => {
        if (!studentId) { setSelectedStudent(null); setReports([]); return; }
        const studentObj = students.find(s => s.id === studentId);
        setSelectedStudent(studentObj); setIsLoading(true);
        try {
            const response = await apiClient.get(`/reports/student/${studentId}`);
            setReports(response.data);
        } catch(e: any) { Alert.alert("Error", e.response?.data?.message || "Failed to fetch reports."); }
        finally { setIsLoading(false); }
    };
    
    useEffect(() => {
        if(isFocused && selectedStudent) { handleStudentChange(selectedStudent.id); } 
        else if (isFocused) { setSelectedClass(''); setStudents([]); setSelectedStudent(null); setReports([]); }
    }, [isFocused]);

    const handleDelete = async (reportId) => {
        Alert.alert("Confirm", "Are you sure you want to delete this report?", [
            { text: "Cancel" },
            { text: "Delete", style: "destructive", onPress: async () => {
                try {
                    await apiClient.delete(`/reports/${reportId}`);
                    setReports(prev => prev.filter(r => r.report_id !== reportId));
                    Alert.alert("Success", "Report deleted.");
                } catch(e: any) { Alert.alert("Error", e.response?.data?.message || "Could not delete."); }
            }}
        ]);
    };

    return (
        <View style={styles.flexContainer}>
            <View style={styles.pickerRow}><View style={styles.pickerWrapper}><Picker selectedValue={selectedClass} onValueChange={handleClassChange}>{ [ <Picker.Item label="Select Class..." value="" key="class-placeholder" />, ...classes.map(c => <Picker.Item key={c} label={c} value={c} />) ] }</Picker></View><View style={styles.pickerWrapper}><Picker selectedValue={selectedStudent?.id} onValueChange={handleStudentChange} enabled={students.length > 0}>{ [ <Picker.Item label="Select Student..." value="" key="student-placeholder" />, ...students.map(s => <Picker.Item key={s.id} label={s.full_name} value={s.id} />) ] }</Picker></View></View>
            {selectedStudent ? (
                <FlatList
                    data={reports}
                    keyExtractor={(item) => item.report_id.toString()}
                    ListHeaderComponent={<Text style={styles.listHeader}>{`Report History for ${selectedStudent.full_name}`}</Text>}
                    renderItem={({ item }) => (
                        <View style={styles.card}><Text style={styles.cardTitle}>{item.report_title}</Text><Text style={styles.cardSubtitle}>Issued: {new Date(item.issue_date).toLocaleDateString()}</Text><View style={styles.cardActions}><TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('ReportDetailScreen', { reportId: item.report_id })}><MaterialIcons name="visibility" size={18} color="#0288d1" /><Text style={styles.actionText}>View</Text></TouchableOpacity><TouchableOpacity style={styles.actionButton} onPress={() => onNavigateToEdit(selectedStudent, item)}><MaterialIcons name="edit" size={18} color="#fbc02d" /><Text style={styles.actionText}>Edit</Text></TouchableOpacity><TouchableOpacity style={styles.actionButton} onPress={() => handleDelete(item.report_id)}><MaterialIcons name="delete" size={18} color="#d32f2f" /><Text style={styles.actionText}>Delete</Text></TouchableOpacity></View></View>
                    )}
                    ListFooterComponent={<TouchableOpacity style={styles.addButton} onPress={() => onNavigateToCreate(selectedStudent)}><MaterialIcons name="add" size={24} color="#fff" /><Text style={styles.addButtonText}>Create New Report</Text></TouchableOpacity>}
                    ListEmptyComponent={!isLoading ? <Text style={styles.emptyText}>No reports found for this student.</Text> : null}
                    refreshing={isLoading}
                    onRefresh={() => handleStudentChange(selectedStudent.id)}
                />
            ) : ( <View style={styles.centered}><Text style={styles.emptyText}>Please select a class and a student to view their history.</Text></View> )}
        </View>
    );
};

const ReportForm = ({ studentForForm, reportToEdit, onFinish }) => {
    const { user } = useAuth();
    const isEditMode = !!reportToEdit;
    const [isLoading, setIsLoading] = useState(isEditMode);
    const [isSaving, setIsSaving] = useState(false);
    const [classes, setClasses] = useState([]);
    const [students, setStudents] = useState([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedStudentId, setSelectedStudentId] = useState('');
    const [reportDetails, setReportDetails] = useState({ report_title: '', issue_date: '', overall_grade: '', teacher_comments: '', sgpa: '', cgpa: '', total_backlog: '0', result_status: 'Completed the program successfully.' });
    const [subjectsData, setSubjectsData] = useState([{ id: Date.now(), subject_code: '', subject_name: '', credit: '', grade: '', grade_point: '', credit_point: '' }]);
    
    useEffect(() => {
        const fetchInitialData = async () => {
            setIsLoading(true);
            try {
                const classRes = await apiClient.get('/student-classes');
                setClasses(classRes.data);
                let initialClass = '';
                if (isEditMode && reportToEdit) { initialClass = reportToEdit.class_group; }
                else if (studentForForm) { initialClass = studentForForm.class_group; }
                if (initialClass) {
                    setSelectedClass(initialClass);
                    const studentRes = await apiClient.get(`/reports/class/${initialClass}/students`);
                    setStudents(studentRes.data);
                    if (isEditMode && reportToEdit) {
                        setSelectedStudentId(reportToEdit.student_id);
                        const detailsRes = await apiClient.get(`/reports/${reportToEdit.report_id}/details`);
                        const { reportDetails: details, subjects } = detailsRes.data;
                        setReportDetails({
                            report_title: details.report_title, issue_date: details.issue_date.split('T')[0],
                            overall_grade: details.overall_grade || '', teacher_comments: details.teacher_comments || '',
                            sgpa: String(details.sgpa || ''), cgpa: String(details.cgpa || ''),
                            total_backlog: String(details.total_backlog || '0'), result_status: details.result_status || ''
                        });
                        setSubjectsData(subjects.length > 0 ? subjects.map(s => ({...s, id: s.subject_entry_id})) : [{ id: Date.now(), subject_code: '', subject_name: '', credit: '', grade: '', grade_point: '', credit_point: '' }]);
                    } else if (studentForForm) {
                        setSelectedStudentId(studentForForm.id);
                    }
                }
            } catch(e) { console.error("Error loading form data", e); }
            finally { setIsLoading(false); }
        };
        fetchInitialData();
    }, []);

    const handleClassChange = async (classGroup) => { setSelectedClass(classGroup); setSelectedStudentId(''); if (classGroup) { const res = await apiClient.get(`/reports/class/${classGroup}/students`); setStudents(res.data); } else { setStudents([]); }};
    const handleAddSubject = () => setSubjectsData([...subjectsData, { id: Date.now(), subject_code: '', subject_name: '', credit: '', grade: '', grade_point: '', credit_point: '' }]);
    const handleRemoveSubject = (id) => setSubjectsData(subjectsData.filter(s => s.id !== id));
    const handleSubjectChange = (id, field, value) => setSubjectsData(subjectsData.map(s => s.id === id ? { ...s, [field]: value } : s));
    const handleSave = async () => {
        if (!selectedStudentId) return Alert.alert("Error", "Please select a student.");
        setIsSaving(true);
        const payload = { reportDetails: {...reportDetails, student_id: selectedStudentId, class_group: selectedClass}, subjectsData, uploaded_by: user.id };
        try {
            if (isEditMode) {
                await apiClient.put(`/reports/${reportToEdit.report_id}`, payload);
            } else {
                await apiClient.post('/reports', payload);
            }
            Alert.alert("Success", `Report ${isEditMode ? 'updated' : 'created'}!`);
            onFinish();
        } catch(e: any) { Alert.alert("Error", e.response?.data?.message || "Failed to save."); }
        finally { setIsSaving(false); }
    };
    
    if (isLoading) return <View style={styles.centered}><ActivityIndicator size="large"/></View>;
    return (
        <ScrollView style={styles.flexContainer}>
            <View style={styles.formSection}><Text style={styles.label}>Select Class</Text><View style={styles.pickerWrapper}><Picker selectedValue={selectedClass} onValueChange={handleClassChange} enabled={!isEditMode}>{ [ <Picker.Item label="Select Class..." value="" key="class-placeholder" />, ...classes.map(c => <Picker.Item key={c} label={c} value={c} />) ] }</Picker></View><Text style={styles.label}>Select Student</Text><View style={styles.pickerWrapper}><Picker selectedValue={selectedStudentId} onValueChange={setSelectedStudentId} enabled={students.length > 0 && !isEditMode}>{ [ <Picker.Item label="Select Student..." value="" key="student-placeholder" />, ...students.map(s => <Picker.Item key={s.id} label={s.full_name} value={s.id} />) ] }</Picker></View></View>
            <View style={styles.formSection}><Text style={styles.label}>Report Title (e.g., Half Yearly Exam)</Text><TextInput style={styles.input} value={reportDetails.report_title} onChangeText={v => setReportDetails({...reportDetails, report_title: v})} /></View>
            <View style={styles.formSection}><Text style={styles.label}>Issue Date (YYYY-MM-DD)</Text><TextInput style={styles.input} value={reportDetails.issue_date} onChangeText={v => setReportDetails({...reportDetails, issue_date: v})} /></View>
            <View style={styles.formSection}><Text style={styles.sectionHeader}>Subject Details</Text>{subjectsData.map((s) => (<View key={s.id} style={styles.subjectRow}><TextInput style={styles.subjectInput} placeholder="Subject Name" value={s.subject_name} onChangeText={v => handleSubjectChange(s.id, 'subject_name', v)} /><View style={{flexDirection: 'row', gap: 10}}><TextInput style={{...styles.subjectInput, flex:1}} placeholder="Grade" value={s.grade} onChangeText={v => handleSubjectChange(s.id, 'grade', v)} /><TextInput style={{...styles.subjectInput, flex:1}} keyboardType="numeric" placeholder="Credit" value={String(s.credit)} onChangeText={v => handleSubjectChange(s.id, 'credit', v)} /></View><View style={{flexDirection: 'row', gap: 10}}><TextInput style={{...styles.subjectInput, flex:1}} keyboardType="numeric" placeholder="Grade Point" value={String(s.grade_point)} onChangeText={v => handleSubjectChange(s.id, 'grade_point', v)} /><TextInput style={{...styles.subjectInput, flex:1}} keyboardType="numeric" placeholder="Credit Point" value={String(s.credit_point)} onChangeText={v => handleSubjectChange(s.id, 'credit_point', v)} /></View><TouchableOpacity onPress={() => handleRemoveSubject(s.id)} style={styles.removeBtn}><Text style={styles.removeBtnText}>Remove</Text></TouchableOpacity></View>))}<TouchableOpacity onPress={handleAddSubject} style={styles.addSubjectBtn}><Text>+ Add Subject</Text></TouchableOpacity></View>
            <View style={styles.formSection}><Text style={styles.sectionHeader}>Overall Results</Text><Text style={styles.label}>Overall Grade</Text><TextInput style={styles.input} value={reportDetails.overall_grade} onChangeText={v => setReportDetails({...reportDetails, overall_grade: v})} /><Text style={styles.label}>SGPA</Text><TextInput style={styles.input} keyboardType="numeric" value={reportDetails.sgpa} onChangeText={v => setReportDetails({...reportDetails, sgpa: v})} /><Text style={styles.label}>CGPA</Text><TextInput style={styles.input} keyboardType="numeric" value={reportDetails.cgpa} onChangeText={v => setReportDetails({...reportDetails, cgpa: v})} /><Text style={styles.label}>Teacher's Comments</Text><TextInput style={[styles.input, {height: 100}]} multiline value={reportDetails.teacher_comments} onChangeText={v => setReportDetails({...reportDetails, teacher_comments: v})} /></View>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={isSaving}>{isSaving ? <ActivityIndicator color="#fff"/> : <Text style={styles.saveButtonText}>Save Report</Text>}</TouchableOpacity>
        </ScrollView>
    )
};

const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: '#f0f4f8' }, flexContainer: { flex: 1 }, centered: { flex: 1, justifyContent: 'center', alignItems: 'center' }, mainHeaderTitle: { fontSize: 22, fontWeight: 'bold', color: '#333', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10, textAlign: 'center' }, tabContainer: { flexDirection: 'row', marginHorizontal: 20, backgroundColor: '#e0e0e0', borderRadius: 8, padding: 4, marginBottom: 10 }, tabButton: { flex: 1, paddingVertical: 10, borderRadius: 6, alignItems: 'center' }, activeTab: { backgroundColor: '#fff', elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4 }, tabText: { fontWeight: 'bold', color: '#666' }, activeTabText: { color: '#007bff' }, pickerRow: { flexDirection: 'row', paddingHorizontal: 15, gap: 10, marginTop: 10, marginBottom: 10 }, pickerWrapper: { flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, backgroundColor: '#fff' }, listHeader: { fontSize: 18, fontWeight: '600', color: '#444', padding: 15, paddingTop: 10, paddingBottom: 5 }, card: { backgroundColor: '#fff', borderRadius: 8, marginHorizontal: 15, marginVertical: 8, padding: 15, elevation: 2 }, cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#37474f' }, cardSubtitle: { fontSize: 14, color: '#546e7a', marginTop: 2, marginBottom: 10 }, cardActions: { flexDirection: 'row', justifyContent: 'flex-start', borderTopWidth: 1, borderColor: '#eee', paddingTop: 10, marginTop: 10, gap: 20 }, actionButton: { flexDirection: 'row', alignItems: 'center' }, actionText: { marginLeft: 5, color: '#333', fontWeight: '500' }, addButton: { flexDirection: 'row', backgroundColor: '#28a745', padding: 15, margin: 15, borderRadius: 10, justifyContent: 'center', alignItems: 'center' }, addButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginLeft: 10 }, emptyText: { textAlign: 'center', marginTop: 50, fontSize: 16, color: '#777' }, formSection: { backgroundColor: '#fff', borderRadius: 8, marginHorizontal: 15, marginVertical: 8, padding: 15 }, label: { fontSize: 16, fontWeight: '500', color: '#444', marginBottom: 5 }, input: { borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 5, marginBottom: 15 }, sectionHeader: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 }, subjectRow: { marginBottom: 10, padding: 10, borderWidth: 1, borderColor: '#eee', borderRadius: 5 }, subjectInput: { borderWidth: 1, borderColor: '#ddd', padding: 8, borderRadius: 5, marginBottom: 5 }, addSubjectBtn: { backgroundColor: '#e8eaf6', padding: 10, borderRadius: 5, alignItems: 'center', marginTop: 10 }, removeBtn: { alignSelf: 'flex-end', padding: 5}, removeBtnText: { color: 'red' }, saveButton: { backgroundColor: '#28a745', padding: 15, margin: 15, borderRadius: 8, alignItems: 'center' }, saveButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }, backButton: { flexDirection: 'row', alignItems: 'center', padding: 15, alignSelf: 'flex-start' }, backButtonText: { marginLeft: 5, fontSize: 18, color: '#333', fontWeight: '500' }});
export default TeacherAdminResultsScreen;