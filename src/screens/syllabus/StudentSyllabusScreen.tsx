// 📂 File: screens/syllabus/StudentSyllabusScreen.js (MODIFIED & CORRECTED)

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, FlatList, Alert } from 'react-native';
// ★★★ 1. IMPORT apiClient AND REMOVE API_BASE_URL ★★★
import apiClient from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useIsFocused } from '@react-navigation/native';
import * as Progress from 'react-native-progress';
import { createStackNavigator } from '@react-navigation/stack';

const Stack = createStackNavigator();

const StudentSyllabusNavigator = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="StudentDashboard" component={StudentSyllabusDashboardScreen} />
        <Stack.Screen name="StudentLessonList" component={StudentLessonListScreen} />
    </Stack.Navigator>
);

const StudentSyllabusDashboardScreen = ({ navigation }) => {
    const { user } = useAuth();
    const [summary, setSummary] = useState({ Done: 0, Missed: 0, Pending: 0, Total: 0 });
    const [subjects, setSubjects] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const isFocused = useIsFocused();

    const fetchSummary = useCallback(async () => {
        if (!user?.id) return;
        setIsLoading(true);
        try {
            // ★★★ 2. USE apiClient ★★★
            const response = await apiClient.get(`/syllabus/student/overview/${user.id}`);
            const { totalStats, subjectStats } = response.data;

            const totalSummary = { Done: 0, Missed: 0, Pending: 0, Total: 0 };
            totalStats.forEach(item => {
                if (item.status === 'Completed') totalSummary.Done = item.count;
                if (item.status === 'Missed') totalSummary.Missed = item.count;
                else if (item.status === 'Pending') totalSummary.Pending = item.count;
                totalSummary.Total += item.count;
            });
            setSummary(totalSummary);

            const subjectMap = new Map();
            subjectStats.forEach(stat => {
                if (!subjectMap.has(stat.syllabus_id)) {
                    subjectMap.set(stat.syllabus_id, { id: stat.syllabus_id, name: stat.subject_name, Done: 0, Missed: 0, Pending: 0, Total: 0 });
                }
                const subjectData = subjectMap.get(stat.syllabus_id);
                if (stat.status === 'Completed') subjectData.Done = stat.count;
                if (stat.status === 'Missed') subjectData.Missed = stat.count;
                else if (stat.status === 'Pending') subjectData.Pending = stat.count;
                subjectData.Total += stat.count;
            });
            setSubjects(Array.from(subjectMap.values()));
        } catch (error) { 
            Alert.alert("Error", error.response?.data?.message || "Failed to fetch progress.");
        } finally { 
            setIsLoading(false); 
        }
    }, [user?.id]);

    useEffect(() => {
        if (isFocused) { fetchSummary(); }
    }, [isFocused, fetchSummary]);

    const overallProgress = summary.Total > 0 ? summary.Done / summary.Total : 0;

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>{user.class_group} Syllabus</Text>
                <Text style={styles.headerSubtitle}>Track your learning progress</Text>
            </View>

            {isLoading ? <ActivityIndicator size="large" style={{ marginTop: 40 }} /> :
            <>
                <View style={styles.card}>
                    <View style={styles.overallProgressHeader}>
                        <Text style={styles.progressTitle}>Overall Progress</Text>
                        <Text style={styles.percentageText}>{Math.round(overallProgress * 100)}%</Text>
                    </View>
                    <Text style={styles.progressFraction}>{summary.Done} of {summary.Total} lessons completed</Text>
                    <Progress.Bar progress={overallProgress} width={null} color="#3b82f6" unfilledColor="#e5e7eb" borderWidth={0} style={styles.progressBar} />
                    <View style={styles.summaryGrid}>
                        <SummaryItem icon="check-circle" label="Done" count={summary.Done} color="#10b981"/>
                        <SummaryItem icon="cancel" label="Missed" count={summary.Missed} color="#ef4444"/>
                        <SummaryItem icon="hourglass-empty" label="Pending" count={summary.Pending} color="#f59e0b"/>
                    </View>
                </View>
                
                {subjects.map(subject => {
                    const subjectProgress = subject.Total > 0 ? subject.Done / subject.Total : 0;
                    return (
                        <TouchableOpacity key={subject.id} style={styles.subjectCard} onPress={() => navigation.navigate('StudentLessonList', { syllabusId: subject.id, subjectName: subject.name })}>
                            <View style={styles.subjectInfo}>
                                <View style={styles.subjectHeader}>
                                    <Text style={styles.subjectTitle}>{subject.name}</Text>
                                    <Text style={styles.subjectPercentage}>{Math.round(subjectProgress * 100)}%</Text>
                                </View>
                                <Text style={styles.progressFraction}>{subject.Done} of {subject.Total} lessons</Text>
                                <Progress.Bar progress={subjectProgress} width={null} color="#3b82f6" unfilledColor="#e5e7eb" borderWidth={0} style={styles.subjectProgressBar} />
                                <View style={styles.summaryGrid}>
                                    <SummaryItem icon="check-circle" count={subject.Done} color="#10b981" small/>
                                    <SummaryItem icon="cancel" count={subject.Missed} color="#ef4444" small/>
                                    <SummaryItem icon="hourglass-empty" count={subject.Pending} color="#f59e0b" small/>
                                </View>
                            </View>
                            <MaterialIcons name="arrow-forward-ios" size={20} color="#9ca3af" />
                        </TouchableOpacity>
                    );
                })}
            </>
            }
        </ScrollView>
    );
};

const StudentLessonListScreen = ({ route, navigation }) => {
    const { syllabusId, subjectName } = route.params;
    const { user } = useAuth();
    const [syllabusDetails, setSyllabusDetails] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchLessons = async () => {
            setIsLoading(true);
            try {
                // ★★★ 3. USE apiClient ★★★
                const response = await apiClient.get(`/syllabus/student/subject-details/${syllabusId}/${user.id}`);
                setSyllabusDetails(response.data);
            } catch (error) { Alert.alert("Error", error.response?.data?.message || "Failed to load lesson details."); }
            finally { setIsLoading(false); }
        };
        fetchLessons();
    }, [user, syllabusId]);

    const getStatusProps = (status) => {
        switch(status) {
            case 'Completed': return { name: 'check-circle', color: '#10b981' };
            case 'Missed': return { name: 'cancel', color: '#ef4444' };
            default: return { name: 'pending', color: '#f59e0b' };
        }
    }

    return (
        <View style={styles.container}>
            <View style={styles.detailHeader}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <MaterialIcons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.detailHeaderTitle}>{subjectName}</Text>
            </View>
            <FlatList
                data={syllabusDetails?.lessons || []}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({item}) => {
                    const statusProps = getStatusProps(item.status);
                    return (
                        <View style={styles.lessonItem}>
                           <MaterialIcons name={statusProps.name} size={24} color={statusProps.color} />
                           <View style={styles.lessonTextContainer}>
                                <Text style={styles.lessonText}>{item.lesson_name}</Text>
                                <Text style={styles.lessonDueDate}>Due: {new Date(item.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</Text>
                           </View>
                           <Text style={[styles.statusText, { color: statusProps.color }]}>{item.status}</Text>
                        </View>
                    )
                }}
                ListEmptyComponent={!isLoading ? <Text style={styles.emptyText}>No syllabus defined for this subject yet.</Text> : null}
                refreshing={isLoading}
            />
        </View>
    );
};

// A small component for displaying stats with an icon
const SummaryItem = ({ icon, label, count, color, small = false }) => (
    <View style={styles.summaryItem}>
        <MaterialIcons name={icon} size={small ? 14 : 18} color={color} />
        <Text style={small ? styles.summaryTextSmall : styles.summaryText}> {count}{label ? ` ${label}` : ''}</Text>
    </View>
);

// Styles remain the same
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f4f7fa' },
    header: { paddingVertical: 20, paddingTop: 50, backgroundColor: '#3b82f6', alignItems: 'center' },
    headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
    headerSubtitle: { fontSize: 15, color: '#dbeafe', marginTop: 4 },
    detailHeader: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#3b82f6', paddingVertical: 15, paddingTop: 50, paddingHorizontal: 10, },
    detailHeaderTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginLeft: 15 },
    backButton: { padding: 5 },
    card: { backgroundColor: '#fff', padding: 20, marginHorizontal: 15, marginVertical: 10, borderRadius: 12, elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5 },
    overallProgressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    progressTitle: { fontSize: 18, fontWeight: '600', color: '#37474f' },
    percentageText: { fontSize: 16, fontWeight: 'bold', color: '#3b82f6' },
    progressFraction: { fontSize: 14, color: '#6b7280', marginVertical: 8 },
    progressBar: { height: 8, borderRadius: 4, },
    subjectProgressBar: { height: 6, borderRadius: 3, marginTop: 4, },
    summaryGrid: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 15, flexWrap: 'wrap' },
    summaryItem: { flexDirection: 'row', alignItems: 'center', },
    summaryText: { fontSize: 14, color: '#4b5563', marginLeft: 4 },
    summaryTextSmall: { fontSize: 12, color: '#6b7280', marginLeft: 4 },
    subjectCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 15, marginHorizontal: 15, marginVertical: 6, borderRadius: 12, elevation: 2, },
    subjectInfo: { flex: 1, marginRight: 10 },
    subjectHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    subjectTitle: { fontSize: 18, fontWeight: 'bold', color: '#1f2937' },
    subjectPercentage: { fontSize: 14, fontWeight: 'bold', color: '#3b82f6'},
    lessonItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingVertical: 18, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
    lessonTextContainer: { flex: 1, marginLeft: 15 },
    lessonText: { fontSize: 16, color: '#1f2937' },
    lessonDueDate: { fontSize: 12, color: '#6b7280', marginTop: 2 },
    statusText: { fontWeight: 'bold', fontSize: 14, },
    emptyText: { textAlign: 'center', marginTop: 50, fontSize: 16, color: '#666' },
});

export default StudentSyllabusNavigator;