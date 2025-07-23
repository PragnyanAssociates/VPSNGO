// 📂 File: src/screens/ads/AdminAdDashboardScreen.tsx (FINAL - WITH DELETE FUNCTIONALITY)

import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, ActivityIndicator, Image, TouchableOpacity, Modal, SafeAreaView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import apiClient, { API_BASE_URL } from '../../api/client';

interface AdForAdmin {
    id: number;
    status: 'pending' | 'approved' | 'rejected';
    ad_type: string;
    userName: string;
    ad_content_image_url: string;
    payment_screenshot_url?: string;
    payment_text?: string;
}

const AdminAdDashboardScreen: React.FC = () => {
    const [ads, setAds] = useState<AdForAdmin[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const fetchAds = useCallback(async () => {
        setIsLoading(true);
        try {
            const { data } = await apiClient.get<AdForAdmin[]>('/api/admin/ads');
            setAds(data);
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Could not fetch ads.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useFocusEffect(useCallback(() => { fetchAds(); }, [fetchAds]));

    const handleUpdateStatus = (adId: number, status: 'approved' | 'rejected') => {
        Alert.alert(`Confirm Action`, `Are you sure you want to ${status} this ad?`,
            [{ text: 'Cancel' }, { text: 'Confirm', onPress: async () => {
                try {
                    await apiClient.put(`/api/admin/ads/${adId}/status`, { status });
                    Alert.alert('Success', `Ad has been ${status}.`);
                    fetchAds();
                } catch (error: any) {
                    Alert.alert('Error', error.response?.data?.message || `Failed to ${status} ad.`);
                }
            }}]
        );
    };
    
    // This is the new handler for the Delete button
    const handleDeleteAd = (adId: number) => {
        Alert.alert(`Confirm Deletion`, `Are you sure you want to permanently delete this ad?`,
            [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive', onPress: async () => {
                try {
                    await apiClient.delete(`/api/admin/ads/${adId}`);
                    Alert.alert('Success', 'Ad has been deleted.');
                    fetchAds(); // Refresh the list
                } catch (error: any) {
                    Alert.alert('Error', error.response?.data?.message || `Failed to delete ad.`);
                }
            }}]
        );
    };

    const renderAdItem = ({ item }: { item: AdForAdmin }) => (
        <View style={styles.adItem}>
            <Text style={styles.adUser}>From: <Text style={styles.bold}>{item.userName}</Text></Text>
            <View style={styles.detailRow}>
                <Text style={styles.adDetail}>Type: {item.ad_type}</Text>
                <Text style={[styles.adDetail, styles.bold, styles[`status_${item.status}`]]}>{item.status.toUpperCase()}</Text>
            </View>
            
            <Text style={styles.imageLabel}>Ad Content:</Text>
            <TouchableOpacity onPress={() => setSelectedImage(`${API_BASE_URL}${item.ad_content_image_url}`)}>
                <Image source={{ uri: `${API_BASE_URL}${item.ad_content_image_url}` }} style={styles.image} />
            </TouchableOpacity>
            
            {item.payment_screenshot_url && (
                <View style={styles.paymentSection}>
                    <Text style={styles.imageLabel}>Payment Proof:</Text>
                    <TouchableOpacity onPress={() => setSelectedImage(`${API_BASE_URL}${item.payment_screenshot_url}`)}>
                        <Image source={{ uri: `${API_BASE_URL}${item.payment_screenshot_url}` }} style={styles.image} />
                    </TouchableOpacity>
                    {item.payment_text && <Text style={styles.adDetail}>Payment Note: {item.payment_text}</Text>}
                </View>
            )}

            <View style={styles.actions}>
                {item.status === 'pending' && (
                    <>
                        <TouchableOpacity style={[styles.actionButton, styles.approveButton]} onPress={() => handleUpdateStatus(item.id, 'approved')}>
                            <Text style={styles.actionButtonText}>✓ Approve</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.actionButton, styles.rejectButton]} onPress={() => handleUpdateStatus(item.id, 'rejected')}>
                            <Text style={styles.actionButtonText}>✗ Reject</Text>
                        </TouchableOpacity>
                    </>
                )}
                
                {/* The Delete button is now available for all non-pending ads */}
                {(item.status === 'approved' || item.status === 'rejected') && (
                    <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={() => handleDeleteAd(item.id)}>
                        <Text style={styles.actionButtonText}>🗑️ Delete</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );

    if (isLoading) { return <ActivityIndicator size="large" style={styles.loader} />; }

    return (
        <SafeAreaView style={styles.safeArea}>
            <FlatList
                data={ads}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderAdItem}
                contentContainerStyle={{ padding: 10 }}
                ListHeaderComponent={<Text style={styles.headerTitle}>Ad Management</Text>}
                ListEmptyComponent={<View style={styles.emptyContainer}><Text>No ads found.</Text></View>}
            />
            <Modal visible={!!selectedImage} transparent={true} onRequestClose={() => setSelectedImage(null)}>
                <View style={styles.modalContainer}>
                    <Image source={{ uri: selectedImage! }} style={styles.modalImage} />
                    <TouchableOpacity style={styles.modalCloseButton} onPress={() => setSelectedImage(null)}><Text style={styles.modalCloseText}>CLOSE</Text></TouchableOpacity>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#f0f2f5' },
    loader: { flex: 1, justifyContent: 'center' },
    headerTitle: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginVertical: 15 },
    adItem: { padding: 15, marginVertical: 8, backgroundColor: 'white', borderRadius: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 1.41, elevation: 3 },
    adUser: { fontSize: 16, marginBottom: 5 },
    detailRow: { flexDirection: 'row', justifyContent: 'space-between' },
    adDetail: { color: '#555', marginBottom: 4 },
    bold: { fontWeight: 'bold' },
    status_pending: { color: '#FF8C00' },
    status_approved: { color: '#28a745' },
    status_rejected: { color: '#dc3545' },
    imageLabel: { fontWeight: 'bold', marginTop: 10, color: '#333' },
    image: { width: '100%', height: 180, resizeMode: 'contain', marginVertical: 8, backgroundColor: '#e9ecef', borderRadius: 4 },
    paymentSection: { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#eee' },
    actions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 15, paddingTop: 15, borderTopWidth: 1, borderTopColor: '#eee' },
    actionButton: { paddingVertical: 12, borderRadius: 5, alignItems: 'center', flex: 1, marginHorizontal: 5 },
    approveButton: { backgroundColor: '#28a745' },
    rejectButton: { backgroundColor: '#dc3545' },
    deleteButton: { backgroundColor: '#6c757d' }, // Grey for delete
    actionButtonText: { color: '#fff', fontWeight: 'bold' },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 },
    modalContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center', padding: 20 },
    modalImage: { width: '100%', height: '80%', resizeMode: 'contain' },
    modalCloseButton: { marginTop: 20, backgroundColor: 'white', paddingVertical: 10, paddingHorizontal: 30, borderRadius: 5 },
    modalCloseText: { fontSize: 16, fontWeight: 'bold', color: 'black' },
});

export default AdminAdDashboardScreen;