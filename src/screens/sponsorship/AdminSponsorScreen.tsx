// 📂 File: src/screens/sponsorship/AdminSponsorScreen.tsx (COMPLETE AND FINAL)

import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, ScrollView, RefreshControl, Modal, Image, SafeAreaView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { API_BASE_URL } from '../../../apiConfig';

const THEME = { primary: '#007bff', success: '#28a745', warning: '#ffc107', danger: '#dc3545', light: '#f8f9fa', background: '#FFFFFF', text: '#212529', muted: '#6c757d', border: '#dee2e6' };

// Main Component to switch between List and Details
const AdminSponsorScreen = () => {
    const [selectedApp, setSelectedApp] = useState(null);
    const onSelect = (app) => setSelectedApp(app);
    const onBack = () => setSelectedApp(null);

    // After a payment is verified, go back to the list to see the updated status
    const onVerifySuccess = () => {
        setSelectedApp(null);
    };

    if (selectedApp) {
        return <SponsorshipDetailsView application={selectedApp} onBack={onBack} onVerifySuccess={onVerifySuccess} />;
    }
    return <SponsorshipListView onSelect={onSelect} />;
};

// --- List View Component ---
const SponsorshipListView = ({ onSelect }) => {
    const [apps, setApps] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    
    const fetchData = useCallback(() => {
        setRefreshing(true);
        fetch(`${API_BASE_URL}/api/admin/sponsorships`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setApps(data);
                else setApps([]);
            })
            .catch(() => Alert.alert("Error", "Could not fetch sponsorships."))
            .finally(() => setRefreshing(false));
    }, []);

    useFocusEffect(fetchData);

    const getStatusStyle = (status) => {
        if (status === 'Verified') return { backgroundColor: THEME.success, color: '#fff' };
        if (status === 'Pending') return { backgroundColor: THEME.warning, color: '#000' };
        return { backgroundColor: THEME.muted, color: '#fff' };
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.listHeader}><Text style={styles.listHeaderTitle}>Sponsorships</Text></View>
            <FlatList
                data={apps}
                keyExtractor={item => item.id.toString()}
                renderItem={({item}) => (
                    <TouchableOpacity style={styles.card} onPress={() => onSelect(item)}>
                        <View style={{flex: 1}}>
                            <Text style={styles.cardTitle}>{item.full_name}</Text>
                            <Text style={styles.cardSubtitle}>by {item.donor_username}</Text>
                        </View>
                        <View style={styles.cardRight}>
                            <View style={[styles.statusBadge, getStatusStyle(item.payment_status)]}>
                                <Text style={[styles.statusBadgeText, {color: item.payment_status === 'Pending' ? '#000' : '#fff'}]}>
                                    {item.payment_status || 'Proof Pending'}
                                </Text>
                            </View>
                            <Text style={styles.cardDate}>{new Date(item.application_date).toLocaleDateString()}</Text>
                        </View>
                    </TouchableOpacity>
                )}
                ListEmptyComponent={<View style={styles.centered}><Text style={styles.emptyText}>No sponsorship applications found.</Text></View>}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchData} colors={[THEME.primary]} />}
            />
        </SafeAreaView>
    );
};

// --- Full Details View Component ---
const SponsorshipDetailsView = ({ application, onBack, onVerifySuccess }) => {
    const [details, setDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isModalVisible, setModalVisible] = useState(false);

    const fetchData = useCallback(() => {
        setLoading(true);
        fetch(`${API_BASE_URL}/api/admin/sponsorship/${application.id}`)
            .then(res => res.json())
            .then(setDetails)
            .catch(() => Alert.alert("Error", "Failed to load details."))
            .finally(() => setLoading(false));
    }, [application.id]);
    
    useFocusEffect(fetchData);
    
    const handleVerify = async () => {
        if (!details?.paymentDetails?.id) return Alert.alert("Error", "No payment record found to verify.");

        Alert.alert("Verify Payment", "Are you sure you have received this payment?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Yes, Verify", onPress: async () => {
                    try {
                        const res = await fetch(`${API_BASE_URL}/api/admin/sponsorship/verify-payment/${details.paymentDetails.id}`, { method: 'PUT' });
                        const result = await res.json();
                        if (res.ok) {
                            Alert.alert("Success", result.message);
                            onVerifySuccess(); // Go back to the list
                        } else {
                            throw new Error(result.message);
                        }
                    } catch (e: any) { Alert.alert("Error", e.message); }
                }
            }
        ]);
    };

    if (loading) return <View style={styles.centered}><ActivityIndicator size="large" /></View>;
    if (!details) return <View style={styles.centered}><Text>Error loading details.</Text></View>;

    const { appDetails, paymentDetails } = details;

    return (
        <SafeAreaView style={styles.container}>
            <Header onBack={onBack} title="Sponsorship Details" />
            <ScrollView>
                <DetailSection title="Applicant Information">
                    <DetailRow label="Name" value={appDetails.full_name} />
                    <DetailRow label="Email" value={appDetails.email} />
                    <DetailRow label="Phone" value={appDetails.phone} />
                    <DetailRow label="Organization" value={appDetails.organization} />
                </DetailSection>
                <DetailSection title="Preferences & Message">
                    <DetailRow label="Wants Updates?" value={appDetails.wants_updates ? 'Yes' : 'No'} />
                    <DetailRow label="Wants to Visit?" value={appDetails.wants_to_visit ? 'Yes' : 'No'} />
                    {appDetails.message && <Text style={styles.messageText}>{appDetails.message}</Text>}
                </DetailSection>
                
                <DetailSection title="Payment Proof">
                    {paymentDetails ? (
                        <>
                            <DetailRow label="Amount Paid" value={`₹${paymentDetails.amount}`} />
                            <DetailRow label="Status" value={paymentDetails.status} />
                            <TouchableOpacity onPress={() => setModalVisible(true)}>
                                <Image source={{uri: `${API_BASE_URL}${paymentDetails.screenshot_url}`}} style={styles.proofImage} />
                            </TouchableOpacity>
                            {paymentDetails.status === 'Pending' && (
                                <TouchableOpacity style={styles.verifyButton} onPress={handleVerify}><Text style={styles.verifyButtonText}>Verify Payment</Text></TouchableOpacity>
                            )}
                        </>
                    ) : <Text style={styles.emptyText}>No payment proof has been uploaded yet.</Text>}
                </DetailSection>
            </ScrollView>
            
            <Modal visible={isModalVisible} transparent={true} onRequestClose={() => setModalVisible(false)}>
                <View style={styles.modalContainer}>
                    <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}><MaterialCommunityIcons name="close" size={30} color="#fff" /></TouchableOpacity>
                    {paymentDetails?.screenshot_url && <Image source={{uri: `${API_BASE_URL}${paymentDetails.screenshot_url}`}} style={styles.enlargedImage} resizeMode="contain" />}
                </View>
            </Modal>
        </SafeAreaView>
    );
};

// --- Helper Components ---
const DetailSection = ({ title, children }) => (<View style={styles.detailSection}><Text style={styles.sectionHeader}>{title}</Text>{children}</View>);
const DetailRow = ({ label, value }) => (<View style={styles.detailRow}><Text style={styles.detailLabel}>{label}:</Text><Text style={styles.detailValue}>{value || 'N/A'}</Text></View>);
const Header = ({ onBack, title }) => (<View style={styles.listHeader}><TouchableOpacity onPress={onBack} style={styles.backButton}><MaterialCommunityIcons name="arrow-left" size={24} color={THEME.primary} /></TouchableOpacity><Text style={styles.listHeaderTitle}>{title}</Text></View>);

// --- Styles ---
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: THEME.light }, centered: { flex: 1, justifyContent: 'center', alignItems: 'center' }, emptyText: { color: THEME.muted, textAlign: 'center', padding: 20 },
    listHeader: { flexDirection: 'row', alignItems: 'center', padding: 15, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: THEME.border }, listHeaderTitle: { flex: 1, textAlign: 'center', fontSize: 20, fontWeight: 'bold' },
    backButton: { position: 'absolute', left: 15, zIndex: 1, padding: 5 },
    card: { flexDirection: 'row', backgroundColor: '#fff', padding: 15, marginHorizontal: 10, marginVertical: 5, borderRadius: 8, elevation: 1 },
    cardTitle: { fontSize: 16, fontWeight: 'bold' }, cardSubtitle: { color: THEME.muted }, cardRight: { alignItems: 'flex-end' },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, overflow: 'hidden' },
    statusBadgeText: { fontSize: 12, fontWeight: 'bold' },
    cardDate: { color: THEME.muted, marginTop: 5, fontSize: 12 },
    detailSection: { backgroundColor: '#fff', margin: 10, borderRadius: 8, padding: 15 }, sectionHeader: { fontSize: 18, fontWeight: 'bold', borderBottomWidth: 1, borderBottomColor: THEME.border, paddingBottom: 10, marginBottom: 10 },
    detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 }, detailLabel: { color: THEME.muted, fontWeight: 'bold' }, detailValue: { flex: 1, textAlign: 'right' },
    messageText: { fontStyle: 'italic', color: THEME.text, marginTop: 10, lineHeight: 20 },
    proofImage: { width: '100%', height: 200, borderRadius: 8, marginTop: 15, backgroundColor: THEME.light },
    verifyButton: { backgroundColor: THEME.success, padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 20 }, verifyButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.85)' },
    closeButton: { position: 'absolute', top: 40, right: 20, zIndex: 1, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 20, padding: 5, }, 
    enlargedImage: { width: '95%', height: '80%' }
});

export default AdminSponsorScreen;