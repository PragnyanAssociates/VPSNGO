import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Alert, Linking } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
// ✅ IMPORT THE NEW, WORKING LIBRARY
import { launchImageLibrary } from 'react-native-image-picker';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../../apiConfig';

const StudentHomeworkScreen = () => {
    const { user } = useAuth();
    const [assignments, setAssignments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState<number | null>(null);

    const fetchAssignments = useCallback(async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/homework/student/${user.id}/${user.class_group}`);
            if (!response.ok) throw new Error("Failed to fetch assignments.");
            const data = await response.json();
            
            data.sort((a, b) => {
                if (a.status === 'Pending' && b.status !== 'Pending') return -1;
                if (a.status !== 'Pending' && b.status === 'Pending') return 1;
                return new Date(b.due_date).getTime() - new Date(a.due_date).getTime();
            });
            setAssignments(data);
        } catch (e: any) { Alert.alert("Error", e.message); } 
        finally { setIsLoading(false); }
    }, [user]);

    useEffect(() => { fetchAssignments(); }, [fetchAssignments]);

    // ✅ MODIFIED: This function now uses the reliable react-native-image-picker
    const handleSubmission = async (assignmentId: number) => {
        if (!user) return;

        launchImageLibrary({
            mediaType: 'mixed', // Allows any file type
        }, async (response) => {
            if (response.didCancel) {
                console.log('User cancelled submission.');
                return;
            }
            if (response.errorCode) {
                Alert.alert('Error', `Could not select file: ${response.errorMessage}`);
                return;
            }
            if (response.assets && response.assets.length > 0) {
                const fileToUpload = response.assets[0];

                setIsSubmitting(assignmentId);
                const formData = new FormData();
                formData.append('student_id', user.id.toString());
                formData.append('submission', {
                    uri: fileToUpload.uri,
                    type: fileToUpload.type,
                    name: fileToUpload.fileName,
                });

                try {
                    const fetchResponse = await fetch(`${API_BASE_URL}/api/homework/submit/${assignmentId}`, {
                        method: 'POST',
                        body: formData,
                        headers: { 'Content-Type': 'multipart/form-data' },
                    });

                    const resData = await fetchResponse.json();
                    if (!fetchResponse.ok) throw new Error(resData.message || 'An unknown error occurred.');
                    
                    Alert.alert("Success", "Homework submitted!");
                    fetchAssignments(); // Refresh the list
                } catch (err: any) {
                    console.error("Submission Error:", err);
                    Alert.alert("Error", err.message || "Could not submit file.");
                } finally {
                    setIsSubmitting(null);
                }
            }
        });
    };
    
    if (isLoading && assignments.length === 0) {
        return <View style={styles.centered}><ActivityIndicator size="large" color="#FF7043" /></View>;
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={assignments}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => <AssignmentCard item={item} onSubmit={handleSubmission} isSubmitting={isSubmitting === item.id} />}
                ListHeaderComponent={<Header />}
                ListEmptyComponent={<Text style={styles.emptyText}>No homework assigned yet.</Text>}
                onRefresh={fetchAssignments}
                refreshing={isLoading}
                contentContainerStyle={{ paddingBottom: 20 }}
            />
        </View>
    );
};

// --- Sub-components (No changes needed below this line) ---

const Header = () => (
    <View style={styles.header}>
        <View style={styles.iconCircle}>
            <MaterialIcons name="edit" size={24} color="#fff" />
        </View>
        <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Assignments & Homework</Text>
            <Text style={styles.headerSubtitle}>Track upcoming and submitted assignments.</Text>
        </View>
    </View>
);

const AssignmentCard = ({ item, onSubmit, isSubmitting }: { item: any, onSubmit: (id: number) => void, isSubmitting: boolean }) => {
    const getStatusInfo = () => {
        const statusText = item.submission_id ? (item.status || 'Submitted') : 'Pending';
        switch (statusText) {
            case 'Graded': return { text: 'Graded', color: '#42a5f5', icon: 'check-circle' };
            case 'Submitted': return { text: 'Submitted', color: '#66bb6a', icon: 'check' };
            default: return { text: 'Pending', color: '#ffa726', icon: 'pending' };
        }
    };

    const status = getStatusInfo();
    const handleViewAttachment = () => { if(item.attachment_path) Linking.openURL(`${API_BASE_URL}${item.attachment_path}`); };

    return (
        <View style={[styles.card, { borderLeftColor: status.color }]}>
            <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <View style={[styles.statusBadge, { backgroundColor: status.color }]}>
                    <MaterialIcons name={status.icon} size={14} color="#fff" />
                    <Text style={styles.statusText}>{status.text}</Text>
                </View>
            </View>
            <Text style={styles.description}>{item.description}</Text>
            
            <View style={styles.detailsGrid}>
                <DetailRow icon="book" label="Subject" value={item.subject} />
                <DetailRow icon="event" label="Due Date" value={new Date(item.due_date).toLocaleDateString()} />
                {item.submitted_at && <DetailRow icon="event-available" label="Submitted" value={new Date(item.submitted_at).toLocaleDateString()} />}
            </View>
            
            {status.text === 'Graded' && item.grade && (
                <View style={styles.gradedSection}>
                    <DetailRow icon="school" label="Grade" value={item.grade} />
                    {item.remarks && <Text style={styles.remarksText}>Remarks: {item.remarks}</Text>}
                </View>
            )}
            
            <View style={styles.buttonRow}>
                {item.attachment_path && <TouchableOpacity style={styles.detailsButton} onPress={handleViewAttachment}>
                    <MaterialIcons name="attachment" size={18} color="#42a5f5" />
                    <Text style={styles.detailsButtonText}>View Attachment</Text>
                </TouchableOpacity>}
                {!item.submission_id && (
                  <TouchableOpacity style={styles.submitButton} onPress={() => onSubmit(item.id)} disabled={isSubmitting}>
                      {isSubmitting ? 
                          <ActivityIndicator size="small" color="#fff" /> : 
                          <><MaterialIcons name="upload-file" size={18} color="#fff" /><Text style={styles.submitButtonText}>Submit Homework</Text></>
                      }
                  </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

const DetailRow = ({ icon, label, value }) => (
    <View style={styles.detailRow}>
        <MaterialIcons name={icon} size={16} color="#546e7a" />
        <Text style={styles.detailLabel}>{label}:</Text>
        <Text style={styles.detailValue}>{value}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f4f6f8' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { flexDirection: 'row', alignItems: 'center', padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee', marginBottom: 10 },
    iconCircle: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#FF7043', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    headerTextContainer: { flex: 1 },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#263238' },
    headerSubtitle: { fontSize: 14, color: '#546e7a' },
    card: { backgroundColor: '#fff', borderRadius: 8, marginHorizontal: 15, marginVertical: 8, padding: 15, elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, borderLeftWidth: 5 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
    cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#37474f', flex: 1, marginRight: 10 },
    statusBadge: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4, paddingHorizontal: 8, borderRadius: 12 },
    statusText: { color: '#fff', fontSize: 12, fontWeight: 'bold', marginLeft: 4 },
    description: { fontSize: 14, color: '#546e7a', marginBottom: 15, lineHeight: 20 },
    detailsGrid: { borderTopWidth: 1, borderTopColor: '#f0f0f0', paddingTop: 10 },
    detailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    detailLabel: { marginLeft: 10, fontSize: 14, color: '#546e7a', fontWeight: '500' },
    detailValue: { fontSize: 14, color: '#263238', flexShrink: 1 },
    gradedSection: { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#f0f0f0' },
    remarksText: { marginTop: 5, fontStyle: 'italic', color: '#37474f', backgroundColor: '#f9f9f9', padding: 8, borderRadius: 4 },
    buttonRow: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', marginTop: 15, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#f0f0f0' },
    detailsButton: { flexDirection: 'row', alignItems: 'center', padding: 8, marginRight: 'auto' },
    detailsButtonText: { color: '#42a5f5', marginLeft: 5, fontWeight: 'bold' },
    submitButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#66bb6a', paddingVertical: 10, paddingHorizontal: 15, borderRadius: 20, elevation: 2 },
    submitButtonText: { color: '#fff', marginLeft: 8, fontWeight: 'bold' },
    emptyText: { textAlign: 'center', marginTop: 50, fontSize: 16, color: '#777' },
});

export default StudentHomeworkScreen;