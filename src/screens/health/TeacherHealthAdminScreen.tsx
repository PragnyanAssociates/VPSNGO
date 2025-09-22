// 📂 File: src/screens/health/TeacherHealthAdminScreen.tsx (MODIFIED & CORRECTED)

import { Picker } from '@react-native-picker/picker';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, TextInput, ScrollView, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../../context/AuthContext';
// ★★★ 1. IMPORT apiClient ★★★
import apiClient from '../../api/client';

const PRIMARY_COLOR = '#008080';

// Main component - No changes needed
const TeacherHealthAdminScreen = () => {
    const [view, setView] = useState('list');
    const [selectedStudent, setSelectedStudent] = useState(null);
    const handleSelectStudent = (student) => { setSelectedStudent(student); setView('form'); };
    const handleBackToList = () => { setSelectedStudent(null); setView('list'); };

    if (view === 'list') return <StudentListView onSelectStudent={handleSelectStudent} />;
    if (view === 'form' && selectedStudent) return <HealthForm student={selectedStudent} onBack={handleBackToList} />;
    return null;
};

// --- Student List Component ---
const StudentListView = ({ onSelectStudent }) => {
    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState(null);
    const [students, setStudents] = useState([]);
    const [isLoadingClasses, setIsLoadingClasses] = useState(true);
    const [isLoadingStudents, setIsLoadingStudents] = useState(false);
    const [error, setError] = useState('');

    const fetchClasses = useCallback(async () => {
        setIsLoadingClasses(true);
        setError('');
        try {
            // ★★★ 2. USE apiClient FOR ALL FETCH CALLS ★★★
            const response = await apiClient.get('/health/classes');
            const data = response.data;
            setClasses(data);
            if (data.length === 0) {
                setError('No classes with assigned students were found.');
            }
        } catch (e: any) {
            console.error("Error fetching classes:", e);
            setError(e.response?.data?.message || 'Could not connect to the server.');
        } finally {
            setIsLoadingClasses(false);
        }
    }, []);

    useFocusEffect(fetchClasses);

    const fetchStudents = async (classGroup) => {
        if (!classGroup) {
            setStudents([]);
            setSelectedClass(null);
            return;
        };
        setSelectedClass(classGroup);
        setIsLoadingStudents(true);
        setStudents([]);
        setError('');
        try {
            const response = await apiClient.get(`/health/students/${classGroup}`);
            setStudents(response.data);
            if (response.data.length === 0) {
                 setError('No students found in this class.');
            }
        } catch (e: any) { 
            console.error(e);
            setError(e.response?.data?.message || 'An error occurred while fetching students.');
        } finally {
            setIsLoadingStudents(false);
        }
    };
    
    return (
        <View style={styles.container}>
            <View style={styles.pickerContainer}>
                <Picker
                    selectedValue={selectedClass}
                    onValueChange={(itemValue) => fetchStudents(itemValue)}
                    enabled={!isLoadingClasses && classes.length > 0}
                >
                    <Picker.Item label={isLoadingClasses ? "Loading classes..." : "Select a Class..."} value={null} />
                    {classes.map(c => <Picker.Item key={c} label={c} value={c} />)}
                </Picker>
            </View>
            <View style={styles.statusContainer}>
                {isLoadingClasses || isLoadingStudents ? (
                    <ActivityIndicator color={PRIMARY_COLOR} />
                ) : error ? (
                    <Text style={styles.emptyText}>{error}</Text>
                ) : students.length === 0 && selectedClass ? (
                    <Text style={styles.emptyText}>No students found in {selectedClass}.</Text>
                ) : classes.length > 0 && !selectedClass ? (
                     <Text style={styles.emptyText}>Select a class to see students.</Text>
                ): null}
            </View>
            <FlatList 
                data={students} 
                keyExtractor={(item) => item.id.toString()} 
                renderItem={({ item }) => ( 
                    <TouchableOpacity style={styles.listItem} onPress={() => onSelectStudent(item)}>
                        <MaterialIcons name="person" size={24} color={PRIMARY_COLOR} />
                        <Text style={styles.studentName}>{item.full_name}</Text>
                        <MaterialIcons name="chevron-right" size={24} color="#ccc" />
                    </TouchableOpacity> 
                )} 
            />
        </View>
    );
};

const HealthForm = ({ student, onBack }) => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({});
    const { user: editor } = useAuth();

    useEffect(() => {
        const fetchRecord = async () => {
            try {
                const response = await apiClient.get(`/health/record/${student.id}`);
                const data = response.data;
                if (data.last_checkup_date) { data.last_checkup_date = data.last_checkup_date.split('T')[0]; }
                setFormData(data);
            } catch (error) {
                // If no record exists, the server might send a 404. We'll start with an empty form.
                setFormData({});
            } finally {
                setLoading(false);
            }
        };
        fetchRecord();
    }, [student]);

    const handleInputChange = (field, value) => { setFormData(prev => ({ ...prev, [field]: value })); };
    const calculatedBmi = useMemo(() => { if (formData?.height_cm && formData?.weight_kg) { const h = Number(formData.height_cm)/100; const bmi = Number(formData.weight_kg)/(h*h); return isNaN(bmi) ? 'N/A' : bmi.toFixed(2); } return 'N/A'; }, [formData.height_cm, formData.weight_kg]);

    const handleSaveChanges = async () => {
        if (!editor) return Alert.alert("Error", "Could not identify the editor.");
        setSaving(true);
        try {
            await apiClient.post(`/health/record/${student.id}`, {
                 ...formData, editorId: editor.id 
            });
            Alert.alert("Success", "Health record saved."); 
            onBack(); 
        } catch (e: any) { 
            Alert.alert("Error", e.response?.data?.message || "Failed to save record."); 
        } 
        finally { setSaving(false); }
    };
    
    if (loading) return <View style={styles.centered}><ActivityIndicator size="large" color={PRIMARY_COLOR} /></View>;

    return (
        <ScrollView style={styles.container}>
            <TouchableOpacity onPress={onBack} style={styles.backButtonForm}><MaterialIcons name="arrow-back" size={24} color={PRIMARY_COLOR} /><Text style={styles.backButtonText}>Back to Student List</Text></TouchableOpacity>
            <Text style={styles.formTitle}>Editing: {student.full_name}</Text>
            <FormInput label="Blood Group" value={formData.blood_group || ''} onChangeText={v => handleInputChange('blood_group', v)} />
            <FormInput label="Height (cm)" value={formData.height_cm?.toString() || ''} onChangeText={v => handleInputChange('height_cm', v)} keyboardType="numeric" />
            <FormInput label="Weight (kg)" value={formData.weight_kg?.toString() || ''} onChangeText={v => handleInputChange('weight_kg', v)} keyboardType="numeric" />
            <View style={styles.inputContainer}><Text style={styles.label}>BMI (Calculated)</Text><TextInput style={[styles.input, styles.readOnly]} value={calculatedBmi} editable={false} /></View>
            <FormInput label="Last Checkup Date (YYYY-MM-DD)" value={formData.last_checkup_date || ''} onChangeText={v => handleInputChange('last_checkup_date', v)} placeholder="YYYY-MM-DD" />
            <FormInput label="Allergies" value={formData.allergies || ''} onChangeText={v => handleInputChange('allergies', v)} multiline />
            <FormInput label="Medical Conditions" value={formData.medical_conditions || ''} onChangeText={v => handleInputChange('medical_conditions', v)} multiline />
            <FormInput label="Medications" value={formData.medications || ''} onChangeText={v => handleInputChange('medications', v)} multiline />
            <TouchableOpacity style={styles.saveButton} onPress={handleSaveChanges} disabled={saving}><Text style={styles.saveButtonText}>{saving ? 'Saving...' : 'Save Changes'}</Text></TouchableOpacity>
        </ScrollView>
    );
};

const FormInput = ({ label, multiline = false, ...props }) => ( <View style={styles.inputContainer}><Text style={styles.label}>{label}</Text><TextInput style={multiline ? styles.textarea : styles.input} multiline={multiline} {...props} /></View> );
const styles = StyleSheet.create({ container: { flex: 1, padding: 10, backgroundColor: '#fff' }, centered: { flex: 1, justifyContent: 'center', alignItems: 'center' }, pickerContainer: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, marginBottom: 15 }, listItem: { flexDirection: 'row', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderBottomColor: '#eee' }, studentName: { flex: 1, marginLeft: 15, fontSize: 16 }, emptyText: { textAlign: 'center', marginTop: 20, color: '#666', fontSize: 16 }, statusContainer: { paddingVertical: 20, alignItems: 'center', justifyContent: 'center', minHeight: 60 }, backButtonForm: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 }, backButtonText: { color: PRIMARY_COLOR, marginLeft: 5, fontSize: 16 }, formTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' }, inputContainer: { marginBottom: 15 }, label: { marginBottom: 5, fontSize: 14, color: '#333' }, input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, fontSize: 16 }, textarea: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, fontSize: 16, minHeight: 80, textAlignVertical: 'top' }, readOnly: { backgroundColor: '#f0f0f0' }, saveButton: { backgroundColor: PRIMARY_COLOR, padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 }, saveButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }});

export default TeacherHealthAdminScreen;