// 📂 File: src/screens/exams/StudentExamsScreen.tsx (MODIFIED & CORRECTED)

import React, { useState, useEffect, useCallback }  from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, ScrollView, TextInput, Modal } from 'react-native';
// ★★★ 1. IMPORT apiClient AND REMOVE API_BASE_URL ★★★
import apiClient from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useIsFocused } from '@react-navigation/native';

// Custom Radio Button Component
const CustomRadioButton = ({ label, value, selectedValue, onSelect }) => {
    const isSelected = value === selectedValue;
    return (
        <TouchableOpacity style={styles.radioContainer} onPress={() => onSelect(value)}>
            <View style={[styles.radioOuterCircle, isSelected && styles.radioOuterCircleSelected]}>
                {isSelected && <View style={styles.radioInnerCircle} />}
            </View>
            <Text style={styles.radioLabel}>{label}</Text>
        </TouchableOpacity>
    );
};

// Main Router Component
const StudentExamsScreen = () => {
    const [view, setView] = useState('list');
    const [selectedExam, setSelectedExam] = useState(null);
    const [selectedAttemptId, setSelectedAttemptId] = useState(null);

    const handleStartExam = (exam) => { setSelectedExam(exam); setView('taking'); };
    const handleViewResult = (attemptId) => { setSelectedAttemptId(attemptId); setView('result'); };
    const backToList = () => { setSelectedExam(null); setSelectedAttemptId(null); setView('list'); };

    if (view === 'list') {
        return <ExamList onStartExam={handleStartExam} onViewResult={handleViewResult} />;
    }
    if (view === 'taking' && selectedExam) {
        return <TakeExamView exam={selectedExam} onFinish={backToList} />;
    }
    if (view === 'result' && selectedAttemptId) {
        return <ResultView attemptId={selectedAttemptId} onBack={backToList} />;
    }
    return null;
};

// Exam List View
const ExamList = ({ onStartExam, onViewResult }) => {
    const { user } = useAuth();
    const [exams, setExams] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const isFocused = useIsFocused();

    const fetchExams = useCallback(async () => {
        if (!user?.id || !user.class_group) return;
        setIsLoading(true);
        try {
            // ★★★ 2. USE apiClient ★★★
            const response = await apiClient.get(`/exams/student/${user.id}/${user.class_group}`);
            setExams(response.data);
        } catch (e: any) {
            Alert.alert('Error', e.response?.data?.message || 'Failed to fetch exams.');
        } finally {
            setIsLoading(false);
        }
    }, [user?.id, user?.class_group]);

    useEffect(() => {
        if (isFocused) {
            fetchExams();
        }
    }, [isFocused, fetchExams]);

    const renderButton = (item) => {
        switch (item.status) {
            case 'graded':
                return <TouchableOpacity style={styles.buttonViewResult} onPress={() => onViewResult(item.attempt_id)}><Text style={styles.buttonText}>View Result</Text></TouchableOpacity>;
            case 'submitted':
            case 'in_progress':
                return <View style={styles.buttonAwaiting}><Text style={styles.buttonText}>Awaiting Results</Text></View>;
            default:
                return <TouchableOpacity style={styles.buttonStart} onPress={() => onStartExam(item)}><MaterialIcons name="play-arrow" size={18} color="#fff" /><Text style={styles.buttonText}>Start Now</Text></TouchableOpacity>;
        }
    };

    return (
        <View style={styles.container}>
            <FlatList
                data={exams}
                keyExtractor={(item: any) => item.exam_id.toString()}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <View style={styles.pill}><Text style={styles.pillText}>Quiz</Text></View>
                        <Text style={styles.cardTitle}>{item.title}</Text>
                        <View style={styles.detailsRow}>
                            <View style={styles.detailItem}><MaterialIcons name="help-outline" size={16} color="#555" /><Text style={styles.detailText}>{item.question_count} Questions</Text></View>
                            <View style={styles.detailItem}><MaterialIcons name="check-circle-outline" size={16} color="#555" /><Text style={styles.detailText}>{item.total_marks} Marks</Text></View>
                            <View style={styles.detailItem}><MaterialIcons name="timer" size={16} color="#555" /><Text style={styles.detailText}>{item.time_limit_mins} Mins</Text></View>
                        </View>
                        {renderButton(item)}
                    </View>
                )}
                ListHeaderComponent={<Text style={styles.headerTitle}>Exams & Quizzes</Text>}
                ListEmptyComponent={!isLoading ? <Text style={styles.emptyText}>No exams available for your class yet.</Text> : null}
                onRefresh={fetchExams}
                refreshing={isLoading}
            />
        </View>
    );
};

// Take Exam View
const TakeExamView = ({ exam, onFinish }) => {
    const { user } = useAuth();
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [attemptId, setAttemptId] = useState(null);

    useEffect(() => {
        const startAndFetch = async () => {
            if (!user?.id) return;
            try {
                // ★★★ 3. USE apiClient FOR ALL CALLS ★★★
                const startRes = await apiClient.post(`/exams/${exam.exam_id}/start`, { student_id: user.id });
                const { attempt_id } = startRes.data;
                setAttemptId(attempt_id);

                const qRes = await apiClient.get(`/exams/take/${exam.exam_id}`);
                const data = qRes.data;
                const parsedQuestions = data.map(q => ({
                    ...q,
                    options: (typeof q.options === 'string') ? JSON.parse(q.options) : q.options,
                }));
                setQuestions(parsedQuestions);
            } catch (e: any) {
                Alert.alert('Error', e.response?.data?.message || 'Could not start exam.');
                onFinish();
            } finally {
                setIsLoading(false);
            }
        };
        startAndFetch();
    }, [exam.exam_id, user?.id, onFinish]);

    const handleAnswerChange = (questionId, value) => setAnswers(prev => ({ ...prev, [questionId]: value }));

    const handleSubmit = async () => {
        if (!user?.id) return;
        Alert.alert('Confirm Submission', 'Are you sure you want to submit your exam?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Submit',
                onPress: async () => {
                    setIsSubmitting(true);
                    try {
                        await apiClient.post(`/attempts/${attemptId}/submit`, { answers, student_id: user.id });
                        Alert.alert('Success', 'Your exam has been submitted!');
                        onFinish();
                    } catch (e: any) {
                        Alert.alert('Error', e.response?.data?.message || e.message);
                    } finally {
                        setIsSubmitting(false);
                    }
                }
            }
        ]);
    };

    if (isLoading) return <View style={styles.centered}><ActivityIndicator size="large" /><Text>Preparing your exam...</Text></View>;
    return (
        <ScrollView style={styles.container}>
            <Text style={styles.headerTitle}>{exam.title}</Text>
            {questions.map((q, index) => (
                <View key={q.question_id} style={styles.questionBox}>
                    <Text style={styles.questionText}>{index + 1}. {q.question_text}</Text>
                    <Text style={styles.marksText}>{q.marks} Marks</Text>
                    {q.question_type === 'multiple_choice' ? (
                        <View>
                            {q.options && Object.entries(q.options).map(([key, value]) => (
                                <CustomRadioButton
                                    key={key}
                                    label={value as string}
                                    value={key}
                                    selectedValue={answers[q.question_id]}
                                    onSelect={(newValue) => handleAnswerChange(q.question_id, newValue)}
                                />
                            ))}
                        </View>
                    ) : (
                        <TextInput style={styles.textInput} multiline placeholder="Type your answer here..." onChangeText={text => handleAnswerChange(q.question_id, text)} />
                    )}
                </View>
            ))}
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={isSubmitting}>{isSubmitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Save & Submit Exam</Text>}</TouchableOpacity>
        </ScrollView>
    );
};

// Result View
const ResultView = ({ attemptId, onBack }) => {
    const { user } = useAuth();
    const [result, setResult] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchResult = async () => {
            if (!user?.id) return;
            try {
                // ★★★ 4. USE apiClient ★★★
                const response = await apiClient.get(`/attempts/${attemptId}/result?student_id=${user.id}`);
                const data = response.data;
                 if (data.details) {
                    data.details = data.details.map(item => ({
                        ...item,
                        options: (typeof item.options === 'string') ? JSON.parse(item.options) : item.options,
                    }));
                }
                setResult(data);
            } catch (e: any) {
                Alert.alert('Error', e.response?.data?.message || 'Could not fetch results.');
                onBack();
            } finally {
                setIsLoading(false);
            }
        };
        fetchResult();
    }, [attemptId, user?.id, onBack]);

    if (isLoading) return <View style={styles.centered}><ActivityIndicator size="large" /></View>;
    if (!result) return <View style={styles.centered}><Text>No result data found.</Text></View>;

    const { attempt, exam, details } = result;
    return (
        <ScrollView style={styles.container}>
            <TouchableOpacity onPress={onBack} style={styles.backButton}><MaterialIcons name="arrow-back" size={24} color="#333" /><Text style={styles.backButtonText}>Back to Exams</Text></TouchableOpacity>
            <Text style={styles.headerTitle}>Result: {exam.title}</Text>
            <View style={styles.resultSummaryCard}><Text style={styles.resultScore}>Score: {attempt.final_score} / {exam.total_marks}</Text>{attempt.teacher_feedback && <Text style={styles.feedbackText}>Feedback: {attempt.teacher_feedback}</Text>}</View>
            {details.map((item, index) => (
                <View key={item.question_id} style={styles.questionBox}>
                    <Text style={styles.questionText}>{index + 1}. {item.question_text}</Text>
                    <Text style={styles.yourAnswer}>Your Answer: {item.answer_text || 'Not Answered'}</Text>
                    {item.question_type === 'multiple_choice' && item.options && <Text style={styles.correctAnswer}>Correct Answer: {item.options[item.correct_answer]}</Text>}
                    <Text style={styles.marksAwarded}>Marks Awarded: {item.marks_awarded} / {item.marks}</Text>
                </View>
            ))}
        </ScrollView>
    );
};

// Styles remain the same
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f4f6f8', padding: 10 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    headerTitle: { fontSize: 24, fontWeight: 'bold', margin: 15, color: '#333' },
    card: { backgroundColor: '#fff', borderRadius: 12, padding: 20, marginHorizontal: 5, marginVertical: 10, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 4 },
    pill: { backgroundColor: '#e8f5e9', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 15, alignSelf: 'flex-start', marginBottom: 10 },
    pillText: { color: '#4caf50', fontWeight: 'bold' },
    cardTitle: { fontSize: 18, fontWeight: '600', color: '#263238', marginBottom: 15 },
    detailsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    detailItem: { flexDirection: 'row', alignItems: 'center' },
    detailText: { marginLeft: 5, color: '#555' },
    buttonStart: { flexDirection: 'row', backgroundColor: '#007bff', paddingVertical: 12, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
    buttonViewResult: { backgroundColor: '#28a745', paddingVertical: 12, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
    buttonAwaiting: { backgroundColor: '#ffc107', paddingVertical: 12, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
    buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16, marginLeft: 5 },
    emptyText: { textAlign: 'center', marginTop: 50, fontSize: 16, color: '#777' },
    questionBox: { backgroundColor: '#fff', borderRadius: 8, padding: 15, marginHorizontal: 10, marginVertical: 8, elevation: 1 },
    questionText: { fontSize: 16, fontWeight: '500', marginBottom: 10 },
    marksText: { fontStyle: 'italic', color: '#888', alignSelf: 'flex-end', marginBottom: 10 },
    textInput: { borderWidth: 1, borderColor: '#ddd', borderRadius: 5, padding: 10, minHeight: 80, textAlignVertical: 'top' },
    submitButton: { backgroundColor: '#28a745', padding: 15, margin: 15, borderRadius: 10, alignItems: 'center' },
    backButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 5 },
    backButtonText: { marginLeft: 5, fontSize: 18, color: '#333', fontWeight: '500' },
    resultSummaryCard: { backgroundColor: '#e3f2fd', padding: 20, margin: 10, borderRadius: 8, alignItems: 'center' },
    resultScore: { fontSize: 22, fontWeight: 'bold', color: '#0d47a1' },
    feedbackText: { fontSize: 16, fontStyle: 'italic', marginTop: 10, color: '#1565c0' },
    yourAnswer: { fontSize: 15, color: '#333', marginTop: 5, backgroundColor: '#f0f0f0', padding: 5, borderRadius: 4 },
    correctAnswer: { fontSize: 15, color: '#2e7d32', marginTop: 5, backgroundColor: '#e8f5e9', padding: 5, borderRadius: 4 },
    marksAwarded: { fontSize: 16, fontWeight: 'bold', alignSelf: 'flex-end', marginTop: 10 },
    radioContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, },
    radioOuterCircle: { height: 20, width: 20, borderRadius: 10, borderWidth: 2, borderColor: '#007bff', alignItems: 'center', justifyContent: 'center', marginRight: 10, },
    radioOuterCircleSelected: { borderColor: '#007bff', },
    radioInnerCircle: { height: 10, width: 10, borderRadius: 5, backgroundColor: '#007bff', },
    radioLabel: { fontSize: 16, color: '#333', },
});

export default StudentExamsScreen;