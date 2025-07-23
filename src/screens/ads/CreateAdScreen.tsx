// 📂 File: src/screens/ads/CreateAdScreen.tsx (FINAL AND COMPLETE - NO SHORTCUTS)

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, Image, ActivityIndicator, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { launchImageLibrary, Asset } from 'react-native-image-picker';
import apiClient, { API_BASE_URL } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

interface PaymentDetails {
    account_holder_name?: string;
    account_number?: string;
    ifsc_code?: string;
    cif_code?: string;
    qr_code_url?: string;
}

const CreateAdScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
    // --- STATE MANAGEMENT ---
    const { user } = useAuth();
    const isAdmin = user?.role === 'admin';

    const [activeTab, setActiveTab] = useState<'create' | 'bank'>('create');
    const [adType, setAdType] = useState<'motion' | 'top_notch'>('motion');
    const [adText, setAdText] = useState('');
    const [adImage, setAdImage] = useState<Asset | null>(null);
    
    // State for payment proof, only used by non-admins
    const [paymentProof, setPaymentProof] = useState<Asset | null>(null);
    const [paymentText, setPaymentText] = useState('');

    // State for bank details tab (editable by admin)
    const [paymentDetails, setPaymentDetails] = useState<PaymentDetails>({});
    const [newQrImage, setNewQrImage] = useState<Asset | null>(null);
    
    // General state for loading indicators
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDetailsLoading, setIsDetailsLoading] = useState(true);

    // --- DATA FETCHING ---
    const fetchDetails = useCallback(async () => {
        setIsDetailsLoading(true);
        try {
            const { data } = await apiClient.get('/api/payment-details');
            setPaymentDetails(data || {});
        } catch (error) {
            Alert.alert('Error', 'Could not load payment instructions.');
        } finally {
            setIsDetailsLoading(false);
        }
    }, []);

    useEffect(() => { fetchDetails(); }, [fetchDetails]);

    // --- HANDLER FUNCTIONS ---
    // Handles submitting the ad and (if applicable) the payment proof in one request.
    const handleCreateAd = async () => {
        if (!adImage) {
            Alert.alert('Missing Ad Image', 'Please select an image for your advertisement.');
            return;
        }
        if (!isAdmin && !paymentProof) {
            Alert.alert('Missing Payment Proof', 'Please upload a screenshot of your payment to proceed.');
            return;
        }

        setIsSubmitting(true);
        const formData = new FormData();
        formData.append('ad_type', adType);
        formData.append('ad_content_text', adText);
        formData.append('ad_content_image', { uri: adImage.uri, type: adImage.type, name: adImage.fileName });
        
        if (!isAdmin && paymentProof) {
            formData.append('payment_text', paymentText);
            formData.append('payment_screenshot', { uri: paymentProof.uri, type: paymentProof.type, name: paymentProof.fileName });
        }

        try {
            const { data } = await apiClient.post('/api/ads', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            Alert.alert('Success!', data.message, [{ text: 'OK', onPress: () => navigation.goBack() }]);
        } catch (error: any) {
            Alert.alert('Submission Failed', error.response?.data?.message || 'An error occurred.');
        } finally {
            setIsSubmitting(false);
        }
    };
    
    // Handles saving the bank details (Admin only).
    const handleSaveChanges = async () => {
        setIsSubmitting(true);
        const formData = new FormData();
        formData.append('accountHolderName', paymentDetails.account_holder_name || '');
        formData.append('accountNumber', paymentDetails.account_number || '');
        formData.append('ifscCode', paymentDetails.ifsc_code || '');
        formData.append('cifCode', paymentDetails.cif_code || '');

        if (newQrImage) {
            formData.append('qrCodeImage', { uri: newQrImage.uri, type: newQrImage.type, name: newQrImage.fileName });
        }
        
        try {
            const { data } = await apiClient.post('/api/admin/payment-details', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            Alert.alert('Success', data.message);
            setNewQrImage(null);
            fetchDetails();
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to update details.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- RENDER FUNCTIONS ---
    // Renders the UI for the "Create Ad" tab.
    const renderCreateAdTab = () => (
        <ScrollView contentContainerStyle={styles.tabContentContainer}>
            <Text style={styles.label}>1. Choose Ad Type</Text>
            <View style={styles.toggleContainer}>
                <TouchableOpacity style={[styles.toggleButton, adType === 'motion' && styles.toggleActive]} onPress={() => setAdType('motion')}><Text style={adType === 'motion' ? styles.toggleTextActive : styles.toggleText}>Motion (Scrolling)</Text></TouchableOpacity>
                <TouchableOpacity style={[styles.toggleButton, adType === 'top_notch' && styles.toggleActive]} onPress={() => setAdType('top_notch')}><Text style={adType === 'top_notch' ? styles.toggleTextActive : styles.toggleText}>Pop-up Ad</Text></TouchableOpacity>
            </View>

            <Text style={styles.label}>2. Upload Ad Image</Text>
            <TouchableOpacity style={styles.imagePicker} onPress={() => launchImageLibrary({ mediaType: 'photo' }, r => r.assets && setAdImage(r.assets[0]))}>
                {adImage ? <Image source={{ uri: adImage.uri }} style={styles.preview} /> : <Text style={styles.imagePickerText}>Tap to select an image</Text>}
            </TouchableOpacity>

            <Text style={styles.label}>3. Add Text (Optional)</Text>
            <TextInput style={styles.input} placeholder="e.g., Annual Sports Day this Saturday!" value={adText} onChangeText={setAdText} />
            
            {/* This payment section is only shown to non-admin users */}
            {!isAdmin && (
                <>
                    <View style={styles.divider} />
                    <Text style={styles.label}>4. Upload Payment Proof</Text>
                    <Text style={styles.infoText}>Please make payment using the details in the "Bank Details" tab first.</Text>
                    <TouchableOpacity style={styles.imagePicker} onPress={() => launchImageLibrary({ mediaType: 'photo' }, r => r.assets && setPaymentProof(r.assets[0]))}>
                        {paymentProof ? <Image source={{ uri: paymentProof.uri }} style={styles.preview} /> : <Text style={styles.imagePickerText}>Tap to upload screenshot</Text>}
                    </TouchableOpacity>
                    <Text style={styles.label}>5. Transaction ID (Optional)</Text>
                    <TextInput style={styles.input} placeholder="Enter any reference or transaction ID" value={paymentText} onChangeText={setPaymentText} />
                </>
            )}
            
            <View style={{ marginTop: 20 }}>
                {isSubmitting ? ( <ActivityIndicator size="large" color="#007AFF" /> ) : (
                    <Button title={isAdmin ? "Post Ad (Free)" : "Submit Ad & Proof for Review"} onPress={handleCreateAd} />
                )}
            </View>
        </ScrollView>
    );

    // Renders the UI for the "Bank Details" tab, with logic for admin vs. other users.
    const renderBankDetailsTab = () => {
        if (isDetailsLoading) {
            return <ActivityIndicator size="large" style={{ marginTop: 50 }} />;
        }

        // --- UI FOR ADMIN (EDITABLE FORM) ---
        if (isAdmin) {
            return (
                <ScrollView contentContainerStyle={styles.tabContentContainer}>
                    <View style={styles.detailsCard}>
                        <Image 
                            source={newQrImage?.uri ? { uri: newQrImage.uri } : (paymentDetails.qr_code_url ? { uri: `${API_BASE_URL}${paymentDetails.qr_code_url}` } : require('../../assets/placeholder.png'))}
                            style={styles.qrImage}
                        />
                        <Button title="Change QR Code" onPress={() => launchImageLibrary({ mediaType: 'photo' }, r => r.assets && setNewQrImage(r.assets[0]))} />
                    </View>
                    <View style={styles.detailsCard}>
                        <Text style={styles.detailLabel}>Account Holder Name</Text>
                        <TextInput style={styles.input} value={paymentDetails.account_holder_name} onChangeText={(text) => setPaymentDetails(p => ({ ...p, account_holder_name: text }))} />

                        <Text style={styles.detailLabel}>Bank Account</Text>
                        <TextInput style={styles.input} value={paymentDetails.account_number} onChangeText={(text) => setPaymentDetails(p => ({ ...p, account_number: text }))} />
                        
                        <Text style={styles.detailLabel}>IFSC Code</Text>
                        <TextInput style={styles.input} value={paymentDetails.ifsc_code} onChangeText={(text) => setPaymentDetails(p => ({ ...p, ifsc_code: text }))} />

                        <Text style={styles.detailLabel}>CIF Code</Text>
                        <TextInput style={styles.input} value={paymentDetails.cif_code} onChangeText={(text) => setPaymentDetails(p => ({ ...p, cif_code: text }))} />
                    </View>
                    <Button title={isSubmitting ? "Saving..." : "Edit Details"} onPress={handleSaveChanges} disabled={isSubmitting} />
                </ScrollView>
            );
        }

        // --- UI FOR OTHER USERS (VIEW-ONLY) ---
        if (!paymentDetails || !paymentDetails.account_holder_name) {
            return <Text style={styles.infoText}>Payment details are not available at the moment. Please ask the administrator to update them.</Text>;
        }

        return (
            <ScrollView contentContainerStyle={styles.tabContentContainer}>
                <Text style={styles.infoText}>Use these details to make your payment. After paying, please upload the screenshot in the "Create New Ad" tab.</Text>
                <View style={styles.detailsCard}>
                    {paymentDetails.qr_code_url && (
                        <Image source={{ uri: `${API_BASE_URL}${paymentDetails.qr_code_url}` }} style={styles.qrImage} />
                    )}
                    <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>Account Holder Name</Text>
                        <Text style={styles.detailValue}>{paymentDetails.account_holder_name}</Text>
                    </View>
                    <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>Bank Account</Text>
                        <Text style={styles.detailValue}>{paymentDetails.account_number}</Text>
                    </View>
                    <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>IFSC Code</Text>
                        <Text style={styles.detailValue}>{paymentDetails.ifsc_code}</Text>
                    </View>
                    <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>CIF Code</Text>
                        <Text style={styles.detailValue}>{paymentDetails.cif_code}</Text>
                    </View>
                </View>
            </ScrollView>
        );
    };

    // --- MAIN COMPONENT RETURN ---
    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.tabSelectorContainer}>
                <TouchableOpacity style={[styles.tabSelector, activeTab === 'create' && styles.tabSelectorActive]} onPress={() => setActiveTab('create')}>
                    <Text style={activeTab === 'create' ? styles.tabTextActive : styles.tabText}>Create New Ad</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.tabSelector, activeTab === 'bank' && styles.tabSelectorActive]} onPress={() => setActiveTab('bank')}>
                    <Text style={activeTab === 'bank' ? styles.tabTextActive : styles.tabText}>{isAdmin ? "Edit Bank Details" : "Bank Details"}</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.contentArea}>
                {activeTab === 'create' ? renderCreateAdTab() : renderBankDetailsTab()}
            </View>
        </SafeAreaView>
    );
};

// --- STYLES ---
const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#f0f2f5' },
    tabSelectorContainer: { flexDirection: 'row', backgroundColor: '#fff', margin: 15, borderRadius: 10, elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, },
    tabSelector: { flex: 1, paddingVertical: 14, alignItems: 'center', justifyContent: 'center' },
    tabSelectorActive: { backgroundColor: '#007AFF', borderRadius: 10 },
    tabText: { fontSize: 16, color: '#007AFF', fontWeight: '500' },
    tabTextActive: { fontSize: 16, color: '#fff', fontWeight: 'bold' },
    contentArea: { flex: 1 },
    tabContentContainer: { padding: 20, paddingTop: 10, paddingBottom: 40 },
    label: { fontSize: 16, fontWeight: '600', color: '#333', marginTop: 15, marginBottom: 10 },
    input: { borderWidth: 1, borderColor: '#ddd', padding: 12, marginBottom: 20, borderRadius: 8, backgroundColor: '#fff', fontSize: 16 },
    toggleContainer: { flexDirection: 'row', borderWidth: 1, borderColor: '#007AFF', borderRadius: 8, overflow: 'hidden' },
    toggleButton: { flex: 1, padding: 12, alignItems: 'center', backgroundColor: '#fff' },
    toggleActive: { backgroundColor: '#007AFF' },
    toggleText: { color: '#007AFF', fontWeight: 'bold' },
    toggleTextActive: { color: '#fff', fontWeight: 'bold' },
    imagePicker: { height: 150, width: '100%', borderWidth: 2, borderColor: '#ccc', borderStyle: 'dashed', borderRadius: 8, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fafafa' },
    imagePickerText: { color: '#666' },
    preview: { width: '100%', height: '100%', borderRadius: 6, resizeMode: 'contain' },
    infoText: { textAlign: 'center', color: '#666', fontSize: 14, marginBottom: 10, lineHeight: 20 },
    detailsCard: { backgroundColor: '#fff', borderRadius: 12, padding: 20, borderWidth: 1, borderColor: '#eee', marginBottom: 15 },
    qrImage: { width: 220, height: 220, resizeMode: 'contain', alignSelf: 'center', marginBottom: 20 },
    detailItem: { borderBottomWidth: 1, borderBottomColor: '#f0f0f0', paddingVertical: 15 },
    detailLabel: { fontSize: 14, color: '#888', marginBottom: 4 },
    detailValue: { fontSize: 18, color: '#000', fontWeight: '500' },
    divider: { height: 1, backgroundColor: '#ddd', marginVertical: 25 },
});

export default CreateAdScreen;