// 📂 File: src/screens/sponsorship/AdminSponsorScreen.tsx (UPDATED - Fixed Payment Verification)

import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, ScrollView, RefreshControl, Modal, Image, SafeAreaView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../context/AuthContext'; // ✅ ADD THIS IMPORT
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
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch sponsorships');
                return res.json();
            })
            .then(data => {
                if (Array.isArray(data)) setApps(data);
                else setApps([]);
            })
            .catch((error) => {
                console.error('Error fetching sponsorships:', error);
                Alert.alert("Error", "Could not fetch sponsorships.");
            })
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
    const { user } = useAuth(); // ✅ ADD THIS LINE TO GET CURRENT USER
    const [details, setDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [verifying, setVerifying] = useState(false); // ✅ ADD VERIFYING STATE
    const [isModalVisible, setModalVisible] = useState(false);

    const fetchData = useCallback(() => {
        setLoading(true);
        fetch(`${API_BASE_URL}/api/admin/sponsorship/${application.id}`)
            .then(res => {
                if (!res.ok) throw new Error('Failed to load details');
                return res.json();
            })
            .then(setDetails)
            .catch((error) => {
                console.error('Error loading details:', error);
                Alert.alert("Error", "Failed to load details.");
            })
            .finally(() => setLoading(false));
    }, [application.id]);
    
    useFocusEffect(fetchData);
    
    // ✅ UPDATED: Enhanced payment verification with proper error handling
    const handleVerify = async () => {
        if (!details?.paymentDetails?.id) {
            return Alert.alert("Error", "No payment record found to verify.");
        }

        Alert.alert(
            "Verify Payment", 
            `Are you sure you want to verify this payment of ₹${details.paymentDetails.amount}?\n\nThis action cannot be undone.`, 
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Yes, Verify", 
                    style: "default",
                    onPress: async () => {
                        setVerifying(true);
                        try {
                            const response = await fetch(
                                `${API_BASE_URL}/api/admin/sponsorship/verify-payment/${details.paymentDetails.id}`, 
                                {
                                    method: 'PUT',
                                    headers: {
                                        'Content-Type': 'application/json',
                                        'Accept': 'application/json'
                                    },
                                    // ✅ FIXED: Send adminId in request body
                                    body: JSON.stringify({
                                        adminId: user?.id
                                    })
                                }
                            );

                            // ✅ Enhanced error handling
                            if (!response.ok) {
                                let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
                                try {
                                    const errorData = await response.json();
                                    errorMessage = errorData.message || errorMessage;
                                } catch (e) {
                                    // If response is not JSON, use the text
                                    const errorText = await response.text();
                                    errorMessage = errorText || errorMessage;
                                }
                                throw new Error(errorMessage);
                            }

                            const result = await response.json();
                            
                            // ✅ Success handling
                            Alert.alert(
                                "Success", 
                                result.message || "Payment verified successfully!",
                                [
                                    {
                                        text: "OK",
                                        onPress: () => onVerifySuccess() // Go back to list
                                    }
                                ]
                            );
                            
                        } catch (error) {
                            console.error('Payment verification error:', error);
                            Alert.alert(
                                "Verification Failed", 
                                `Could not verify payment: ${error.message}`,
                                [{ text: "OK" }]
                            );
                        } finally {
                            setVerifying(false);
                        }
                    }
                }
            ]
        );
    };

    if (loading) return <View style={styles.centered}><ActivityIndicator size="large" color={THEME.primary} /></View>;
    if (!details) return <View style={styles.centered}><Text style={styles.emptyText}>Error loading details.</Text></View>;

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
                    <DetailRow label="Applied On" value={new Date(appDetails.application_date).toLocaleDateString()} />
                </DetailSection>
                
                <DetailSection title="Preferences & Message">
                    <DetailRow label="Wants Updates?" value={appDetails.wants_updates ? 'Yes' : 'No'} />
                    <DetailRow label="Wants to Visit?" value={appDetails.wants_to_visit ? 'Yes' : 'No'} />
                    {appDetails.message && (
                        <View style={styles.messageContainer}>
                            <Text style={styles.messageLabel}>Message:</Text>
                            <Text style={styles.messageText}>{appDetails.message}</Text>
                        </View>
                    )}
                </DetailSection>
                
                <DetailSection title="Payment Proof">
                    {paymentDetails ? (
                        <>
                            <DetailRow label="Amount Paid" value={`₹${paymentDetails.amount}`} />
                            <DetailRow 
                                label="Status" 
                                value={
                                    <View style={[styles.statusBadge, getStatusStyle(paymentDetails.status)]}>
                                        <Text style={[styles.statusBadgeText, {color: paymentDetails.status === 'Pending' ? '#000' : '#fff'}]}>
                                            {paymentDetails.status}
                                        </Text>
                                    </View>
                                }
                            />
                            <DetailRow label="Submitted On" value={new Date(paymentDetails.upload_date).toLocaleDateString()} />
                            
                            {paymentDetails.screenshot_url && (
                                <View style={styles.imageContainer}>
                                    <Text style={styles.imageLabel}>Payment Screenshot:</Text>
                                    <TouchableOpacity onPress={() => setModalVisible(true)}>
                                        <Image 
                                            source={{uri: `${API_BASE_URL}${paymentDetails.screenshot_url}`}} 
                                            style={styles.proofImage}
                                            onError={() => Alert.alert('Error', 'Could not load payment screenshot')}
                                        />
                                    </TouchableOpacity>
                                    <Text style={styles.tapToEnlarge}>Tap image to enlarge</Text>
                                </View>
                            )}
                            
                            {/* ✅ Enhanced verify button with loading state */}
                            {paymentDetails.status === 'Pending' && (
                                <TouchableOpacity 
                                    style={[styles.verifyButton, verifying && styles.verifyButtonDisabled]} 
                                    onPress={handleVerify}
                                    disabled={verifying}
                                >
                                    {verifying ? (
                                        <ActivityIndicator color="#fff" size="small" />
                                    ) : (
                                        <>
                                            <MaterialCommunityIcons name="check-circle" size={20} color="#fff" />
                                            <Text style={styles.verifyButtonText}>Verify Payment</Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                            )}
                            
                            {paymentDetails.status === 'Verified' && (
                                <View style={styles.verifiedContainer}>
                                    <MaterialCommunityIcons name="check-circle" size={24} color={THEME.success} />
                                    <Text style={styles.verifiedText}>Payment Verified ✓</Text>
                                </View>
                            )}
                        </>
                    ) : (
                        <Text style={styles.emptyText}>No payment proof has been uploaded yet.</Text>
                    )}
                </DetailSection>
            </ScrollView>
            
            {/* ✅ Enhanced modal with better close button */}
            <Modal visible={isModalVisible} transparent={true} onRequestClose={() => setModalVisible(false)}>
                <View style={styles.modalContainer}>
                    <TouchableOpacity 
                        style={styles.closeButton} 
                        onPress={() => setModalVisible(false)}
                    >
                        <MaterialCommunityIcons name="close" size={30} color="#fff" />
                    </TouchableOpacity>
                    {paymentDetails?.screenshot_url && (
                        <Image 
                            source={{uri: `${API_BASE_URL}${paymentDetails.screenshot_url}`}} 
                            style={styles.enlargedImage} 
                            resizeMode="contain" 
                        />
                    )}
                </View>
            </Modal>
        </SafeAreaView>
    );

    // Helper function for status styling (moved inside component to access THEME)
    function getStatusStyle(status) {
        if (status === 'Verified') return { backgroundColor: THEME.success };
        if (status === 'Pending') return { backgroundColor: THEME.warning };
        return { backgroundColor: THEME.muted };
    }
};

// --- Helper Components ---
const DetailSection = ({ title, children }) => (
    <View style={styles.detailSection}>
        <Text style={styles.sectionHeader}>{title}</Text>
        {children}
    </View>
);

const DetailRow = ({ label, value }) => (
    <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>{label}:</Text>
        {typeof value === 'string' ? (
            <Text style={styles.detailValue}>{value || 'N/A'}</Text>
        ) : (
            value || <Text style={styles.detailValue}>N/A</Text>
        )}
    </View>
);

const Header = ({ onBack, title }) => (
    <View style={styles.listHeader}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={THEME.primary} />
        </TouchableOpacity>
        <Text style={styles.listHeaderTitle}>{title}</Text>
    </View>
);

// --- Enhanced Styles ---
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: THEME.light },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyText: { color: THEME.muted, textAlign: 'center', padding: 20, fontSize: 16 },
    listHeader: { flexDirection: 'row', alignItems: 'center', padding: 15, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: THEME.border, elevation: 2 },
    listHeaderTitle: { flex: 1, textAlign: 'center', fontSize: 20, fontWeight: 'bold', color: THEME.text },
    backButton: { position: 'absolute', left: 15, zIndex: 1, padding: 5 },
    card: { flexDirection: 'row', backgroundColor: '#fff', padding: 15, marginHorizontal: 10, marginVertical: 5, borderRadius: 8, elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowOffset: { width: 0, height: 2 } },
    cardTitle: { fontSize: 16, fontWeight: 'bold', color: THEME.text },
    cardSubtitle: { color: THEME.muted, fontSize: 14, marginTop: 2 },
    cardRight: { alignItems: 'flex-end' },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, overflow: 'hidden' },
    statusBadgeText: { fontSize: 12, fontWeight: 'bold' },
    cardDate: { color: THEME.muted, marginTop: 5, fontSize: 12 },
    detailSection: { backgroundColor: '#fff', margin: 10, borderRadius: 8, padding: 15, elevation: 1 },
    sectionHeader: { fontSize: 18, fontWeight: 'bold', borderBottomWidth: 1, borderBottomColor: THEME.border, paddingBottom: 10, marginBottom: 10, color: THEME.text },
    detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
    detailLabel: { color: THEME.muted, fontWeight: 'bold', fontSize: 14 },
    detailValue: { flex: 1, textAlign: 'right', fontSize: 14, color: THEME.text },
    messageContainer: { marginTop: 10 },
    messageLabel: { color: THEME.muted, fontWeight: 'bold', fontSize: 14, marginBottom: 5 },
    messageText: { fontStyle: 'italic', color: THEME.text, lineHeight: 20, backgroundColor: THEME.light, padding: 10, borderRadius: 6 },
    imageContainer: { marginTop: 15 },
    imageLabel: { color: THEME.muted, fontWeight: 'bold', fontSize: 14, marginBottom: 5 },
    proofImage: { width: '100%', height: 200, borderRadius: 8, backgroundColor: THEME.light, borderWidth: 1, borderColor: THEME.border },
    tapToEnlarge: { textAlign: 'center', color: THEME.muted, fontSize: 12, marginTop: 5 },
    verifyButton: { backgroundColor: THEME.success, padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 20, flexDirection: 'row', justifyContent: 'center' },
    verifyButtonDisabled: { backgroundColor: THEME.muted, opacity: 0.7 },
    verifyButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16, marginLeft: 8 },
    verifiedContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 15, backgroundColor: '#d4edda', borderRadius: 8, marginTop: 20 },
    verifiedText: { marginLeft: 8, color: THEME.success, fontWeight: 'bold', fontSize: 16 },
    modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.9)' },
    closeButton: { position: 'absolute', top: 50, right: 20, zIndex: 1, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 25, padding: 8 },
    enlargedImage: { width: '95%', height: '80%' }
});

export default AdminSponsorScreen;
