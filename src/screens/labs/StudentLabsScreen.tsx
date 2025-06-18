import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { LabCard, Lab } from './LabCard';
import { API_BASE_URL } from '../../../apiConfig';

const StudentLabsScreen = () => {
    const [labs, setLabs] = useState<Lab[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchLabs = useCallback(async () => {
        try {
            setError(null);
            const response = await fetch(`${API_BASE_URL}/api/labs`);
            if (!response.ok) {
                throw new Error('Failed to fetch Digital Labs.');
            }
            const data = await response.json();
            setLabs(data);
        } catch (e: any) {
            setError(e.message);
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

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#e8f5e9' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    errorText: { color: 'red', fontSize: 16 },
    // ✅ CORRECTED HEADER STYLE
    header: {
        padding: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        flexDirection: 'row', // Lay out items side-by-side
        alignItems: 'center', // Vertically center the icon and text block
    },
    headerTextContainer: { marginLeft: 15 },
    headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#004d40' },
    headerSubtitle: { fontSize: 15, color: '#37474f', marginTop: 4 },
    emptyText: { fontSize: 16, color: '#555' },
});

export default StudentLabsScreen;