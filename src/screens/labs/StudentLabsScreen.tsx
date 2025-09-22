// 📂 File: src/screens/labs/StudentLabsScreen.tsx (MODIFIED & CORRECTED)

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { LabCard, Lab } from './LabCard';
// ★★★ 1. IMPORT apiClient AND REMOVE API_BASE_URL ★★★
import apiClient from '../../api/client';

const StudentLabsScreen = () => {
    const [labs, setLabs] = useState<Lab[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchLabs = useCallback(async () => {
        try {
            setError(null);
            // ★★★ 2. USE apiClient ★★★
            const response = await apiClient.get('/labs');
            setLabs(response.data);
        } catch (e: any) {
            setError(e.response?.data?.message || 'Failed to fetch Digital Labs.');
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchLabs();
    }, [fetchLabs]);

    const onRefresh = () => {
        setIsRefreshing(true);
        fetchLabs();
    };

    if (isLoading) {
        return <View style={styles.centered}><ActivityIndicator size="large" color="#008080" /></View>;
    }

    if (error) {
        return <View style={styles.centered}><Text style={styles.errorText}>{error}</Text></View>;
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={labs}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => <LabCard lab={item} />}
                ListHeaderComponent={
                    <View style={styles.header}>
                        <MaterialIcons name="desktop-windows" size={30} color="#00695c" />
                        <View style={styles.headerTextContainer}>
                            <Text style={styles.headerTitle}>Digital Labs & Simulations</Text>
                            <Text style={styles.headerSubtitle}>Access interactive learning tools and virtual experiments.</Text>
                        </View>
                    </View>
                }
                ListEmptyComponent={
                    <View style={styles.centered}>
                        <Text style={styles.emptyText}>No digital labs are available at the moment.</Text>
                    </View>
                }
                refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={["#008080"]} />}
                contentContainerStyle={{ flexGrow: 1 }}
            />
        </View>
    );
};

// Styles remain unchanged
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#e8f5e9' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    errorText: { color: 'red', fontSize: 16 },
    header: { padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#ddd', flexDirection: 'row', alignItems: 'center' },
    headerTextContainer: { marginLeft: 15 },
    headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#004d40' },
    headerSubtitle: { fontSize: 15, color: '#37474f', marginTop: 4 },
    emptyText: { fontSize: 16, color: '#555' },
});

export default StudentLabsScreen;