// 📂 File: screens/syllabus/TeacherSyllabusScreen.js (MODIFIED & CORRECTED)

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
// ★★★ 1. IMPORT apiClient AND REMOVE API_BASE_URL ★★★
import apiClient from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useIsFocused } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

const Stack = createStackNavigator();

const TeacherSyllabusNavigator = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="TeacherSubjectList" component={TeacherSyllabusListScreen} />
        <Stack.Screen name="TeacherLessonProgress" component={TeacherLessonProgressScreen} />
    </Stack.Navigator>
);

const TeacherSyllabusListScreen = ({ navigation }) => {
    const { user } = useAuth();
    const [assignments, setAssignments] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const isFocused = useIsFocused();

    const fetchAssignments = useCallback(async () => {
        if (!user?.id) return;
        setIsLoading(true);
        try {
            // ★★★ 2. USE apiClient ★★★
            const response = await apiClient.get(`/teacher-assignments/${user.id}`);
            setAssignments(response.data);
        } catch (error) { Alert.alert("Error", error.response?.data?.message || "Failed to load your assigned subjects."); }
        finally { setIsLoading(false); }
    }, [user?.id]);

    useEffect(() => {
        if (isFocused) { fetchAssignments(); }
    }, [isFocused, fetchAssignments]);

    return (
        <View style={styles.container}>
            <View style={styles.listHeader}>
                <Text style={styles.listHeaderTitle}>My Syllabus Tracking</Text>
                <Text style={styles.listHeaderSubtitle}>Select a subject to update lesson progress.</Text>
            </View>
            <FlatList
                data={assignments}
                keyExtractor={(item, index) => `${item.class_group}-${item.subject_name}-${index}`}
                renderItem={({ item }) => (
                    <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('TeacherLessonProgress', { classGroup: item.class_group, subjectName: item.subject_name })}>
                        <View style={styles.cardContent}>
                            <MaterialIcons name="menu-book" size={28} color="#5c6bc0" />
                            <View style={styles.cardTextContainer}>
                               <Text style={styles.cardTitle}>{item.subject_name}</Text>
                               <Text style={styles.cardSubtitle}>For: {item.class_group}</Text>
                            </View>
                        </View>
                        <MaterialIcons name="chevron-right" size={28} color="#757575" />
                    </TouchableOpacity>
                )}
                onRefresh={fetchAssignments}
                refreshing={isLoading}
                ListEmptyComponent={!isLoading ? <View style={styles.emptyContainer}><Text style={styles.emptyText}>You have no classes assigned in the timetable.</Text></View> : null}
                contentContainerStyle={{ flexGrow: 1 }}
            />
        </View>
    );
};

const TeacherLessonProgressScreen = ({ route, navigation }) => {
    const { classGroup, subjectName } = route.params;
    const { user: teacher } = useAuth();
    const [syllabus, setSyllabus] = useState(null);
    const [overview, setOverview] = useState({ completed: 0, missed: 0, pending: 0, total: 0 });
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            // ★★★ 3. USE apiClient FOR ALL FETCH CALLS ★★★
            const syllabusResponse = await apiClient.get(`/syllabus/teacher/${classGroup}/${subjectName}`);
            const syllabusData = syllabusResponse.data;
            
            const progressResponse = await apiClient.get(`/syllabus/class-progress/${syllabusData.id}`);
            const progressData = progressResponse.data;

            const newOverview = { completed: 0, missed: 0, pending: 0, total: progressData.length };
            progressData.forEach(lesson => {
                if (lesson.status === 'Completed') newOverview.completed++;
                else if (lesson.status === 'Missed') newOverview.missed++;
                else newOverview.pending++;
            });
            setOverview(newOverview);
            
            const lessonsWithStatus = progressData.map(p => ({
                id: p.lesson_id,
                lesson_name: p.lesson_name,
                due_date: p.due_date,
                status: p.status
            }));
            setSyllabus({ ...syllabusData, lessons: lessonsWithStatus });

        } catch (error) {
            const message = error.response?.status === 404
                ? "Syllabus has not been created for this subject yet."
                : error.response?.data?.message || "Failed to load data.";
            Alert.alert("Error", message);
        } finally {
            setIsLoading(false);
        }
    }, [classGroup, subjectName]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleStatusUpdate = (lessonId, newStatus) => {
        const action = newStatus === 'Pending' ? 'revert' : 'mark';
        const message = `This will ${action} the lesson as '${newStatus}' for ALL students in ${classGroup}. Are you sure?`;

        Alert.alert(
            "Confirm Action", message,
            [
                { text: "Cancel", style: "cancel" },
                { 
                    text: "Confirm", 
                    onPress: async () => {
                        try {
                            // ★★★ 4. USE apiClient ★★★
                            const response = await apiClient.patch('/syllabus/lesson-status', {
                                class_group: classGroup,
                                lesson_id: lessonId,
                                status: newStatus,
                                teacher_id: teacher.id
                            });
                            Alert.alert("Success", response.data.message);
                            fetchData();
                        } catch (error) {
                            Alert.alert("Error", error.response?.data?.message || "Failed to update status.");
                        }
                    } 
                }
            ]
        );
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const isOverdue = date < today;
        const options = { month: 'short', day: 'numeric', year: 'numeric' };
        return {
            display: date.toLocaleDateString('en-US', options),
            isOverdue: isOverdue
        };
    };

    if (isLoading) {
        return <View style={styles.centered}><ActivityIndicator size="large" color="#3b82f6" /></View>
    }

    return (
        <View style={styles.container}>
            <View style={styles.headerBlue}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <MaterialIcons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitleWhite}>{subjectName}</Text>
            </View>
            <ScrollView>
                <View style={styles.overviewCard}>
                    <Text style={styles.progressTitle}>Progress Overview</Text>
                    <View style={styles.overviewGridContainer}>
                        <ProgressItem count={overview.completed} label="Completed" color="#059669" />
                        <ProgressItem count={overview.missed} label="Missed" color="#ef4444" />
                        <ProgressItem count={overview.pending} label="Pending" color="#f59e0b" />
                        <ProgressItem count={overview.total} label="Total" color="#3b82f6" />
                    </View>
                </View>

                {syllabus?.lessons?.map(lesson => {
                    const { display, isOverdue } = formatDate(lesson.due_date);
                    const isMarked = lesson.status === 'Completed' || lesson.status === 'Missed';
                    return (
                        <View key={lesson.id} style={[styles.lessonCard, isOverdue && !isMarked && styles.overdueBorder]}>
                            <Text style={styles.lessonTitle}>{lesson.lesson_name}</Text>
                            <Text style={[styles.dueDateText, isOverdue && !isMarked && styles.overdueText]}>
                                Due: {display}
                                {isOverdue && !isMarked && " (Overdue)"}
                            </Text>
                            
                            {isMarked ? (
                                <View style={styles.statusContainer}>
                                    <View style={[styles.statusBadge, lesson.status === 'Completed' ? styles.completedBadge : styles.missedBadge]}>
                                        <MaterialIcons name={lesson.status === 'Completed' ? 'check-circle' : 'cancel'} size={18} color={lesson.status === 'Completed' ? '#059669' : '#ef4444'} />
                                        <Text style={styles.statusBadgeText}>Marked as {lesson.status}</Text>
                                    </View>
                                    <TouchableOpacity style={styles.editButton} onPress={() => handleStatusUpdate(lesson.id, 'Pending')}>
                                        <MaterialIcons name="edit" size={18} color="#4b5563" />
                                        <Text style={styles.editButtonText}>Edit</Text>
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <View style={styles.actionRow}>
                                    <TouchableOpacity style={styles.completeButton} onPress={() => handleStatusUpdate(lesson.id, 'Completed')}>
                                        <MaterialIcons name="check" size={20} color="#fff" />
                                        <Text style={styles.buttonText}>Mark Complete</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.missedButton} onPress={() => handleStatusUpdate(lesson.id, 'Missed')}>
                                        <MaterialIcons name="close" size={20} color="#fff" />
                                        <Text style={styles.buttonText}>Mark Missed</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    );
                })}
            </ScrollView>
        </View>
    );
};

const ProgressItem = ({ count, label, color }) => (
    <View style={styles.progressItem}>
        <Text style={[styles.progressCount, { color }]}>{count}</Text>
        <Text style={styles.progressLabel}>{label}</Text>
    </View>
);

// Styles remain the same
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f4f7fa' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f4f7fa' },
    listHeader: { padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#ddd' },
    listHeaderTitle: { fontSize: 22, fontWeight: 'bold', color: '#333' },
    listHeaderSubtitle: { fontSize: 14, color: '#666', marginTop: 4 },
    headerBlue: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#3b82f6', paddingVertical: 15, paddingHorizontal: 10, elevation: 4, },
    backButton: { marginRight: 20, padding: 5 },
    headerTitleWhite: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
    card: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: 20, marginHorizontal: 15, marginVertical: 8, borderRadius: 12, elevation: 2, },
    cardContent: { flexDirection: 'row', alignItems: 'center' },
    cardTextContainer: { marginLeft: 15 },
    cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#37474f' },
    cardSubtitle: { fontSize: 14, color: '#757575', marginTop: 2 },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    emptyText: { textAlign: 'center', fontSize: 16, color: '#666' },
    overviewCard: { backgroundColor: 'white', borderRadius: 8, padding: 20, margin: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 1.41, elevation: 2, },
    progressTitle: { fontSize: 18, fontWeight: 'bold', color: '#4a5568', marginBottom: 20, textAlign: 'center' },
    overviewGridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', },
    progressItem: { width: '50%', alignItems: 'center', marginBottom: 20, },
    progressCount: { fontSize: 36, fontWeight: '700', },
    progressLabel: { fontSize: 14, color: '#718096', marginTop: 2, },
    lessonCard: { backgroundColor: 'white', borderRadius: 8, padding: 18, marginHorizontal: 15, marginVertical: 8, borderWidth: 1, borderColor: '#e2e8f0' },
    overdueBorder: { borderColor: '#ef4444' },
    lessonTitle: { fontSize: 18, fontWeight: '600', color: '#1f2937', },
    dueDateText: { fontSize: 14, color: '#718096', marginTop: 4, marginBottom: 15, },
    overdueText: { color: '#ef4444', fontWeight: 'bold', },
    actionRow: { flexDirection: 'row', gap: 10, },
    completeButton: { flexDirection: 'row', backgroundColor: '#22c55e', paddingVertical: 12, borderRadius: 8, alignItems: 'center', justifyContent: 'center', flex: 1, },
    missedButton: { flexDirection: 'row', backgroundColor: '#ef4444', paddingVertical: 12, borderRadius: 8, alignItems: 'center', justifyContent: 'center', flex: 1, },
    buttonText: { color: '#fff', fontWeight: 'bold', marginLeft: 8, fontSize: 16, },
    statusContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, },
    statusBadge: { flexDirection: 'row', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, alignItems: 'center', backgroundColor: '#dcfce7', },
    completedBadge: { backgroundColor: '#dcfce7', },
    missedBadge: { backgroundColor: '#fee2e2', },
    statusBadgeText: { marginLeft: 6, fontWeight: 'bold', fontSize: 14, color: '#1f2937', },
    editButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, paddingHorizontal: 12, backgroundColor: '#e5e7eb', borderRadius: 20, },
    editButtonText: { marginLeft: 4, color: '#4b5563', fontWeight: '600', },
});

export default TeacherSyllabusNavigator;