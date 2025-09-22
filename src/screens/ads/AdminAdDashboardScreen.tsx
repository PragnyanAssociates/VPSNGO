// 📂 File: src/screens/ads/AdminAdDashboardScreen.tsx (FINAL & VERIFIED)

import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, ActivityIndicator, Image, TouchableOpacity, Modal, SafeAreaView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import apiClient from '../../api/client';
import { SERVER_URL } from '../../../apiConfig';

interface AdForAdmin {
    id: number;
    status: 'pending' | 'approved' | 'rejected' | 'stopped';
    ad_type: string;
    userName: string;
    ad_content_image_url: string;
    payment_screenshot_url?: string;
    payment_text?: string;
}

const AdminAdDashboardScreen: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'review' | 'current' | 'history'>('review');
    const [ads, setAds] = useState<AdForAdmin[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const fetchAds = useCallback(async () => {
        setIsLoading(true);
        try {
            const { data } = await apiClient.get<AdForAdmin[]>('/admin/ads');
            setAds(data);
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Could not fetch ads.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useFocusEffect(useCallback(() => { fetchAds(); }, [fetchAds]));

    const handleUpdateStatus = (adId: number, status: 'approved' | 'rejected' | 'stopped') => {
        const actionVerb = status === 'stopped' ? 'stop' : status;
        Alert.alert(`Confirm Action`, `Are you sure you want to ${actionVerb} this ad?`,
            [{ text: 'Cancel' }, { text: 'Confirm', onPress: async () => {
                try {
                    await apiClient.put(`/admin/ads/${adId}/status`, { status });
                    Alert.alert('Success', `Ad has been ${status}.`);
                    fetchAds();
                } catch (error: any) {
                    Alert.alert('Error', error.response?.data?.message || `Failed to ${actionVerb} ad.`);
                }
            }}]
        );
    };
    
    const handleDeleteAd = (adId: number) => {
        Alert.alert(`Confirm Deletion`, `Are you sure you want to permanently delete this ad? This action cannot be undone.`,
            [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive', onPress: async () => {
                try {
                    await apiClient.delete(`/admin/ads/${adId}`);
                    Alert.alert('Success', 'Ad has been deleted.');
                    fetchAds();
                } catch (error: any) {
                    Alert.alert('Error', error.response?.data?.message || `Failed to delete ad.`);
                }
            }}]
        );
    };

    const filteredAds = useMemo(() => {
        switch (activeTab) {
            case 'review':
                return ads.filter(ad => ad.status === 'pending');
            case 'current':
                return ads.filter(ad => ad.status === 'approved');
            case 'history':
                return ads.filter(ad => ad.status === 'rejected' || ad.status === 'stopped');
            default:
                return [];
        }
    }, [ads, activeTab]);

    const renderAdItem = ({ item }: { item: AdForAdmin }) => (
        <View style={styles.adItem}>
            <Text style={styles.adUser}>From: <Text style={styles.bold}>{item.userName}</Text></Text>
            <View style={styles.detailRow}>
                <Text style={styles.adDetail}>Type: {item.ad_type}</Text>
                <Text style={[styles.adDetail, styles.bold, styles[`status_${item.status}`]]}>{item.status.toUpperCase()}</Text>
            </View>
            
            <Text style={styles.imageLabel}>Ad Content:</Text>
            <TouchableOpacity onPress={() => setSelectedImage(`${SERVER_URL}${item.ad_content_image_url}`)}>
                <Image source={{ uri: `${SERVER_URL}${item.ad_content_image_url}` }} style={styles.image} />
            </TouchableOpacity>
            
            {item.payment_screenshot_url && (
                <View style={styles.paymentSection}>
                    <Text style={styles.imageLabel}>Payment Proof:</Text>
                    <TouchableOpacity onPress={() => setSelectedImage(`${SERVER_URL}${item.payment_screenshot_url}`)}>
                        <Image source={{ uri: `${SERVER_URL}${item.payment_screenshot_url}` }} style={styles.image} />
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
                
                {item.status === 'approved' && (
                    <TouchableOpacity style={[styles.actionButton, styles.stopButton]} onPress={() => handleUpdateStatus(item.id, 'stopped')}>
                        <View style={styles.stopButtonIcon} />
                        <Text style={styles.actionButtonText}>Stop Ad</Text>
                    </TouchableOpacity>
                )}
                
                {(item.status === 'rejected' || item.status === 'stopped') && (
                    <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={() => handleDeleteAd(item.id)}>
                        <Text style={styles.actionButtonText}>🗑️ Delete Permanently</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );

    if (isLoading) { return <ActivityIndicator size="large" style={styles.loader} />; }

    return (
        <SafeAreaView style={styles.safeArea}>
            <Text style={styles.headerTitle}>Ad Management</Text>
            
            <View style={styles.tabSelectorContainer}>
                <TouchableOpacity 
                    style={[styles.tabButton, activeTab === 'review' && styles.tabButtonActive]} 
                    onPress={() => setActiveTab('review')}>
                    <Text style={activeTab === 'review' ? styles.tabTextActive : styles.tabText}>Review</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[styles.tabButton, activeTab === 'current' && styles.tabButtonActive]} 
                    onPress={() => setActiveTab('current')}>
                    <Text style={activeTab === 'current' ? styles.tabTextActive : styles.tabText}>Current Ads</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[styles.tabButton, activeTab === 'history' && styles.tabButtonActive]} 
                    onPress={() => setActiveTab('history')}>
                     <Text style={activeTab === 'history' ? styles.tabTextActive : styles.tabText}>History</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={filteredAds}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderAdItem}
                contentContainerStyle={{ padding: 10, paddingTop: 0 }}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text>No ads in this section.</Text>
                    </View>
                }
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
    tabSelectorContainer: { flexDirection: 'row', marginHorizontal: 15, marginBottom: 10, backgroundColor: '#fff', borderRadius: 8, elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, overflow: 'hidden' },
    tabButton: { flex: 1, paddingVertical: 12, alignItems: 'center', justifyContent: 'center' },
    tabButtonActive: { backgroundColor: '#007AFF' },
    tabText: { fontSize: 15, color: '#007AFF', fontWeight: '500' },
    tabTextActive: { fontSize: 15, color: '#fff', fontWeight: 'bold' },
    adItem: { padding: 15, marginHorizontal: 5, marginVertical: 8, backgroundColor: 'white', borderRadius: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 1.41, elevation: 3 },
    adUser: { fontSize: 16, marginBottom: 5 },
    detailRow: { flexDirection: 'row', justifyContent: 'space-between' },
    adDetail: { color: '#555', marginBottom: 4 },
    bold: { fontWeight: 'bold' },
    status_pending: { color: '#FF8C00' },
    status_approved: { color: '#28a745' },
    status_rejected: { color: '#dc3545' },
    status_stopped: { color: '#6c757d' },
    imageLabel: { fontWeight: 'bold', marginTop: 10, color: '#333' },
    image: { width: '100%', height: 180, resizeMode: 'contain', marginVertical: 8, backgroundColor: '#e9ecef', borderRadius: 4 },
    paymentSection: { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#eee' },
    actions: { flexDirection: 'row', justifyContent: 'center', marginTop: 15, paddingTop: 15, borderTopWidth: 1, borderTopColor: '#eee' },
    actionButton: { paddingVertical: 12, borderRadius: 5, alignItems: 'center', flex: 1, marginHorizontal: 5, flexDirection: 'row', justifyContent: 'center' },
    approveButton: { backgroundColor: '#28a745' },
    rejectButton: { backgroundColor: '#dc3545' },
    stopButton: { backgroundColor: '#ffc107' },
    stopButtonIcon: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#dc3545', marginRight: 8 },
    deleteButton: { backgroundColor: '#dc3545' },
    actionButtonText: { color: '#fff', fontWeight: 'bold' },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50, padding: 20 },
    modalContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center', padding: 20 },
    modalImage: { width: '100%', height: '80%', resizeMode: 'contain' },
    modalCloseButton: { marginTop: 20, backgroundColor: 'white', paddingVertical: 10, paddingHorizontal: 30, borderRadius: 5 },
    modalCloseText: { fontSize: 16, fontWeight: 'bold', color: 'black' },
});

export default AdminAdDashboardScreen;