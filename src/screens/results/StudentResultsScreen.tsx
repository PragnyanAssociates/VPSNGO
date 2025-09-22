// 📂 File: src/screens/results/StudentResultsScreen.tsx (MODIFIED & CORRECTED)

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
// ★★★ 1. IMPORT apiClient AND REMOVE API_BASE_URL ★★★
import apiClient from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useIsFocused } from '@react-navigation/native';

const StudentResultsScreen = ({ navigation }) => {
    const { user } = useAuth();
    const [reports, setReports] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const isFocused = useIsFocused();

    const fetchReports = useCallback(async () => {
        if (!user?.id) return;
        setIsLoading(true);
        try {
            // ★★★ 2. USE apiClient ★★★
            const response = await apiClient.get(`/reports/student/${user.id}`);
            setReports(response.data);
        } catch (error: any) {
            Alert.alert("Error", error.response?.data?.message || "Failed to fetch progress reports.");
        } finally {
            setIsLoading(false);
        }
    }, [user?.id]);

    useEffect(() => {
        if (isFocused) {
            fetchReports();
        }
    }, [isFocused, fetchReports]);

    const handleDownload = (reportId) => {
        navigation.navigate('ReportDetailScreen', { reportId });
    };

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <MaterialIcons name="article" size={24} color="#0d47a1" />
                <Text style={styles.cardTitle}>{item.report_title}</Text>
            </View>
            <Text style={styles.cardDate}>Date Issued: {new Date(item.issue_date).toLocaleDateString()}</Text>
            <View style={styles.detailRow}>
                <MaterialIcons name="trending-up" size={20} color="#388e3c" />
                <Text style={styles.detailLabel}>Overall Grade:</Text>
                <Text style={styles.detailValue}>{item.overall_grade || 'N/A'}</Text>
            </View>
            <View style={styles.detailRow}>
                <MaterialIcons name="chat-bubble-outline" size={20} color="#546e7a" />
                <Text style={styles.detailLabel}>Teacher's Comments:</Text>
            </View>
            <View style={styles.commentBox}>
                <Text style={styles.commentText}>{item.teacher_comments || 'No comments provided.'}</Text>
            </View>
            <TouchableOpacity style={styles.downloadButton} onPress={() => handleDownload(item.report_id)}>
                <MaterialIcons name="download" size={20} color="#fff" />
                <Text style={styles.downloadButtonText}>Download Report</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={reports}
                renderItem={renderItem}
                keyExtractor={(item) => item.report_id.toString()}
                ListHeaderComponent={
                    <View style={styles.header}>
                        <MaterialIcons name="analytics" size={40} color="#0d47a1" />
                        <View style={{ marginLeft: 15 }}>
                            <Text style={styles.headerTitle}>Progress Reports</Text>
                            <Text style={styles.headerSubtitle}>View and download term-wise reports.</Text>
                        </View>
                    </View>
                }
                ListEmptyComponent={!isLoading && <Text style={styles.emptyText}>No reports found.</Text>}
                onRefresh={fetchReports}
                refreshing={isLoading}
            />
        </View>
    );
};

const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: '#f0f4f8' }, header: { flexDirection: 'row', alignItems: 'center', padding: 20, backgroundColor: 'white' }, headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#1a237e' }, headerSubtitle: { fontSize: 14, color: '#546e7a', marginTop: 2 }, card: { backgroundColor: '#fff', borderRadius: 12, marginHorizontal: 15, marginVertical: 10, padding: 20, elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5 }, cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 }, cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginLeft: 10 }, cardDate: { fontSize: 13, color: '#777', marginBottom: 15 }, detailRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 }, detailLabel: { fontSize: 15, fontWeight: '500', color: '#333', marginLeft: 10 }, detailValue: { fontSize: 15, color: '#1b5e20', fontWeight: 'bold', marginLeft: 5 }, commentBox: { backgroundColor: '#f9f9f9', padding: 12, borderRadius: 8, marginTop: 5, borderWidth: 1, borderColor: '#eee' }, commentText: { fontSize: 14, color: '#444', lineHeight: 20 }, downloadButton: { flexDirection: 'row', backgroundColor: '#1976d2', paddingVertical: 12, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginTop: 20 }, downloadButtonText: { color: '#fff', fontWeight: 'bold', marginLeft: 8, fontSize: 16 }, emptyText: { textAlign: 'center', marginTop: 50, fontSize: 16, color: '#666' }});
export default StudentResultsScreen;