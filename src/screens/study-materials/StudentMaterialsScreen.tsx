// 📂 File: src/screens/study-materials/StudentMaterialsScreen.tsx (MODIFIED & CORRECTED)

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, Linking } from 'react-native';
// ★★★ 1. IMPORT apiClient AND SERVER_URL, REMOVE API_BASE_URL ★★★
import apiClient from '../../api/client';
import { SERVER_URL } from '../../../apiConfig';
import { useAuth } from '../../context/AuthContext';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useIsFocused } from '@react-navigation/native';

const StudentMaterialsScreen = () => {
    const { user } = useAuth();
    const [materials, setMaterials] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const isFocused = useIsFocused();

    const fetchMaterials = useCallback(async () => {
        if (!user?.class_group) return;
        setIsLoading(true);
        try {
            // ★★★ 2. USE apiClient ★★★
            const response = await apiClient.get(`/study-materials/student/${user.class_group}`);
            setMaterials(response.data);
        } catch (error: any) {
            Alert.alert("Error", error.response?.data?.message || "Failed to fetch study materials.");
        } finally {
            setIsLoading(false);
        }
    }, [user?.class_group]);

    useEffect(() => {
        if (isFocused) {
            fetchMaterials();
        }
    }, [isFocused, fetchMaterials]);

    const getIconForType = (type) => {
        switch (type) {
            case 'Notes': return 'description';
            case 'Presentation': return 'slideshow';
            case 'Video Lecture': return 'ondemand-video';
            case 'Worksheet': return 'assignment';
            case 'Link': return 'link';
            default: return 'folder-open';
        }
    };

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardIconContainer}>
                <MaterialIcons name={getIconForType(item.material_type)} size={28} color="#0288d1" />
            </View>
            <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
            <Text style={styles.cardInfo}>Subject: {item.subject} | Type: {item.material_type}</Text>
            <Text style={styles.cardDate}>Added: {new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}</Text>
            <Text style={styles.cardDescription} numberOfLines={4}>{item.description}</Text>
            
            <View style={styles.buttonContainer}>
                {item.file_path && (
                    <TouchableOpacity 
                        style={styles.downloadButton} 
                        // ★★★ 3. USE SERVER_URL FOR FILES ★★★
                        onPress={() => Linking.openURL(`${SERVER_URL}${item.file_path}`)}
                    >
                        <MaterialIcons name="download" size={20} color="#fff" />
                        <Text style={styles.downloadButtonText}>Download</Text>
                    </TouchableOpacity>
                )}
                {item.external_link && (
                    <TouchableOpacity 
                        style={[styles.downloadButton, styles.linkButton]}
                        onPress={() => Linking.openURL(item.external_link)}
                    >
                        <MaterialIcons name="launch" size={20} color="#fff" />
                        <Text style={styles.downloadButtonText}>Open Link</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );

    return (
        <FlatList
            data={materials}
            renderItem={renderItem}
            keyExtractor={(item) => item.material_id.toString()}
            numColumns={2}
            style={styles.container}
            contentContainerStyle={styles.listContentContainer}
            ListHeaderComponent={
                <View style={styles.header}>
                    <MaterialIcons name="folder-shared" size={40} color="#43a047" />
                    <View style={{ marginLeft: 15, flex: 1 }}>
                        <Text style={styles.headerTitle}>Study Materials & Resources</Text>
                        <Text style={styles.headerSubtitle}>Access notes, presentations, and other learning resources.</Text>
                    </View>
                </View>
            }
            ListEmptyComponent={!isLoading && <Text style={styles.emptyText}>No study materials found for your class.</Text>}
            onRefresh={fetchMaterials}
            refreshing={isLoading}
        />
    );
};

// Styles remain the same
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#eef2f5' },
    listContentContainer: { paddingHorizontal: 8, paddingBottom: 20 },
    header: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingBottom: 10 },
    headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#263238' },
    headerSubtitle: { fontSize: 14, color: '#546e7a', marginTop: 4 },
    card: { flex: 1, margin: 8, backgroundColor: '#fff', borderRadius: 12, padding: 15, elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5 },
    cardIconContainer: { marginBottom: 12 },
    cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#37474f', marginBottom: 6, minHeight: 40 },
    cardInfo: { fontSize: 12, color: '#78909c', marginBottom: 4 },
    cardDate: { fontSize: 12, color: '#78909c', marginBottom: 12 },
    cardDescription: { fontSize: 13, color: '#455a64', lineHeight: 18, flexGrow: 1, marginBottom: 15 },
    buttonContainer: {},
    downloadButton: { flexDirection: 'row', backgroundColor: '#0288d1', paddingVertical: 10, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginTop: 5, },
    linkButton: { backgroundColor: '#c2185b' },
    downloadButtonText: { color: '#fff', fontWeight: 'bold', marginLeft: 8 },
    emptyText: { textAlign: 'center', marginTop: 50, fontSize: 16, color: '#666' },
});

export default StudentMaterialsScreen;