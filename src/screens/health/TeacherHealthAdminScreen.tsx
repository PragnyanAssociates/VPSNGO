// 📂 File: src/screens/health/TeacherHealthAdminScreen.tsx (CORRECTED)

import { Picker } from '@react-native-picker/picker';
import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, TextInput, ScrollView, Alert } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../../apiConfig';

const PRIMARY_COLOR = '#008080';

const TeacherHealthAdminScreen = () => {
    const [view, setView] = useState('list');
    const [selectedStudent, setSelectedStudent] = useState(null);
    const handleSelectStudent = (student) => { setSelectedStudent(student); setView('form'); };
    const handleBackToList = () => { setSelectedStudent(null); setView('list'); };

    if (view === 'list') return <StudentListView onSelectStudent={handleSelectStudent} />;
    if (view === 'form' && selectedStudent) return <HealthForm student={selectedStudent} onBack={handleBackToList} />;
    return null;
};

// --- THIS IS THE CORRECTED COMPONENT ---
const StudentListView = ({ onSelectStudent }) => {
    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState(null);
    const [students, setStudents] = useState([]);
    const [isLoadingClasses, setIsLoadingClasses] = useState(true); // State for class loading
    const [isLoadingStudents, setIsLoadingStudents] = useState(false); // State for student loading
    const [error, setError] = useState(''); // State for error messages

    useEffect(() => {
        const fetchClasses = async () => {
            setIsLoadingClasses(true);
            setError('');
            try {
                const response = await fetch(`${API_BASE_URL}/api/health/classes`);
                if (!response.ok) {
                    throw new Error('Failed to fetch classes from the server.');
                }
                const data = await response.json();
                setClasses(data);

                // If the server successfully returns an empty list, show a message.
                if (data.length === 0) {
                    setError('No classes with assigned students were found.');
                }
            } catch (e) {
                console.error(e);
                setError('Could not connect to the server to get classes.');
            } finally {
                setIsLoadingClasses(false);
            }
        };
        fetchClasses();
    }, []);

    const fetchStudents = async (classGroup) => {
        if (!classGroup) {
            setStudents([]);
            setSelectedClass(null);
            return;
        };
        setSelectedClass(classGroup);
        setIsLoadingStudents(true);
        setStudents([]);
        try {
            const response = await fetch(`${API_BASE_URL}/api/health/students/${classGroup}`);
            if (response.ok) setStudents(await response.json());
        } catch (e) { 
            console.error(e);
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
                    enabled={!isLoadingClasses && classes.length > 0} // Disable if loading or empty
                >
                    <Picker.Item label={isLoadingClasses ? "Loading..." : "Select a Class..."} value={null} />
                    {classes.map(c => <Picker.Item key={c} label={c} value={c} />)}
                </Picker>
            </View>

            {/* This part shows the correct message based on the state */}
            <View style={styles.statusContainer}>
                {isLoadingStudents ? (
                    <ActivityIndicator color={PRIMARY_COLOR} />
                ) : error ? (
                    <Text style={styles.emptyText}>{error}</Text>
                ) : students.length === 0 && selectedClass ? (
                    <Text style={styles.emptyText}>No students found in {selectedClass}.</Text>
                ) : students.length === 0 && !selectedClass && !error ? (
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
// --- END OF CORRECTED COMPONENT ---


const HealthForm = ({ student, onBack }) => {
    // This component remains unchanged.
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({});
    const { user: editor } = useAuth();

    useEffect(() => {
        const fetchRecord = async () => {
            const response = await fetch(`${API_BASE_URL}/api/health/record/${student.id}`);
            if (response.ok) {
                const data = await response.json();
                if (data.last_checkup_date) { data.last_checkup_date = data.last_checkup_date.split('T')[0]; }
                setFormData(data);
            }
            setLoading(false);
        };
        fetchRecord();
    }, [student]);

    const handleInputChange = (field, value) => { setFormData(prev => ({ ...prev, [field]: value })); };
    const calculatedBmi = useMemo(() => { if (formData?.height_cm && formData?.weight_kg) { const h = Number(formData.height_cm)/100; const bmi = Number(formData.weight_kg)/(h*h); return isNaN(bmi) ? 'N/A' : bmi.toFixed(2); } return 'N/A'; }, [formData.height_cm, formData.weight_kg]);

    const handleSaveChanges = async () => {
        if (!editor) return Alert.alert("Error", "Could not identify the editor.");
        setSaving(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/health/record/${student.id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, editorId: editor.id }),
            });
            if (response.ok) { Alert.alert("Success", "Health record saved."); onBack(); } 
            else { Alert.alert("Error", "Failed to save record."); }
        } catch (e) { Alert.alert("Error", "An error occurred."); } 
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
const styles = StyleSheet.create({ 
    container: { flex: 1, padding: 10, backgroundColor: '#fff' }, 
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' }, 
    pickerContainer: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, marginBottom: 15 }, 
    listItem: { flexDirection: 'row', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderBottomColor: '#eee' }, 
    studentName: { flex: 1, marginLeft: 15, fontSize: 16 }, 
    emptyText: { textAlign: 'center', marginTop: 20, color: '#666', fontSize: 16 }, // Made font bigger
    statusContainer: { paddingVertical: 20, alignItems: 'center', justifyContent: 'center' }, // New style for status messages
    backButtonForm: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 }, 
    backButtonText: { color: PRIMARY_COLOR, marginLeft: 5, fontSize: 16 }, 
    formTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' }, 
    inputContainer: { marginBottom: 15 }, 
    label: { marginBottom: 5, fontSize: 14, color: '#333' }, 
    input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, fontSize: 16 }, 
    textarea: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, fontSize: 16, minHeight: 80, textAlignVertical: 'top' }, 
    readOnly: { backgroundColor: '#f0f0f0' }, 
    saveButton: { backgroundColor: PRIMARY_COLOR, padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 }, 
    saveButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});

export default TeacherHealthAdminScreen;