// 📂 File: src/screens/payments/AdminPaymentScreen.tsx (COMPLETE AND FINAL)

import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Image, SafeAreaView, TextInput, FlatList, RefreshControl, Modal } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'react-native-image-picker';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { API_BASE_URL } from '../../../apiConfig';

const THEME = { primary: '#007bff', success: '#28a745', warning: '#ffc107', light: '#f8f9fa', background: '#FFFFFF', text: '#212529', muted: '#6c757d', border: '#dee2e6' };

// Main component remains the same
const AdminPaymentScreen = () => {
    const [view, setView] = useState('dashboard'); // 'dashboard', 'manageDetails'

    if (view === 'manageDetails') {
        return <ManageDetailsView onBack={() => setView('dashboard')} />;
    }
    return <PaymentDashboard onManageDetails={() => setView('manageDetails')} />;
};

// --- View 1: Dashboard showing incoming payment proofs (MODIFIED) ---
const PaymentDashboard = ({ onManageDetails }) => {
    const [proofs, setProofs] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);

    const fetchProofs = useCallback(() => {
        setRefreshing(true);
        fetch(`${API_BASE_URL}/api/admin/payment-proofs`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setProofs(data);
                else setProofs([]);
            })
            .catch(() => Alert.alert('Error', 'Could not fetch payment proofs.'))
            .finally(() => setRefreshing(false));
    }, []);

    useFocusEffect(fetchProofs);

    const handleImagePress = (imageUrl) => {
        setSelectedImage(imageUrl);
        setIsModalVisible(true);
    };

    const handleCloseModal = () => {
        setIsModalVisible(false);
        setSelectedImage(null);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Payment Proofs</Text>
                <TouchableOpacity onPress={onManageDetails} style={styles.headerButton}>
                    <MaterialCommunityIcons name="cog" size={24} color={THEME.primary} />
                </TouchableOpacity>
            </View>

            {/* --- The list of payment proofs --- */}
            <FlatList
                data={proofs}
                keyExtractor={item => item.id.toString()}
                renderItem={({ item }) => (
                    <TouchableOpacity style={styles.proofCard} onPress={() => handleImagePress(item.screenshot_url)}>
                        <Image 
                            source={{ uri: `${API_BASE_URL}${item.screenshot_url}` }} 
                            style={styles.proofImage} 
                        />
                        <View style={styles.proofDetails}>
                            <Text style={styles.proofUser}>{item.donor_username}</Text>
                            {/* ✅ CHANGE: Added amount display */}
                            <Text style={styles.proofAmount}>₹{item.amount || '0.00'}</Text>
                            <Text style={styles.proofDate}>{new Date(item.submission_date).toLocaleString()}</Text>
                        </View>
                        <MaterialCommunityIcons name="arrow-expand" size={20} color={THEME.muted} />
                    </TouchableOpacity>
                )}
                ListEmptyComponent={<View style={styles.centered}><Text style={styles.emptyText}>No payment proofs submitted yet.</Text></View>}
                contentContainerStyle={{ padding: 10 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchProofs} colors={[THEME.primary]}/>}
            />

            {/* MODAL component for displaying the enlarged image */}
            <Modal
                visible={isModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={handleCloseModal}
            >
                <View style={styles.modalContainer}>
                    <TouchableOpacity style={styles.closeButton} onPress={handleCloseModal}>
                        <MaterialCommunityIcons name="close" size={30} color="#fff" />
                    </TouchableOpacity>
                    {selectedImage && (
                        <Image
                            source={{ uri: `${API_BASE_URL}${selectedImage}` }}
                            style={styles.enlargedImage}
                            resizeMode="contain"
                        />
                    )}
                </View>
            </Modal>
        </SafeAreaView>
    );
};

// View 2: Form to manage bank and QR details (No changes here)
const ManageDetailsView = ({ onBack }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [details, setDetails] = useState(null);
    const [formData, setFormData] = useState({});
    const [qrImage, setQrImage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    const fetchData = useCallback(() => {
        setLoading(true);
        fetch(`${API_BASE_URL}/api/admin/payment-details`).then(res => res.json()).then(data => {
            setDetails(data);
            setFormData(data || {});
        }).catch(() => Alert.alert("Error", "Could not load details.")).finally(() => setLoading(false));
    }, []);

    useFocusEffect(fetchData);

    const handleChooseImage = () => {
        ImagePicker.launchImageLibrary({ mediaType: 'photo' }, response => {
            if (response.assets && response.assets.length > 0) setQrImage(response.assets[0]);
        });
    };

    const handleUpdate = async () => {
        setUpdating(true);
        const data = new FormData();
        data.append('accountHolderName', formData.account_holder_name || '');
        data.append('accountNumber', formData.account_number || '');
        data.append('ifscCode', formData.ifsc_code || '');
        data.append('cifCode', formData.cif_code || '');
        if (qrImage) data.append('qrCodeImage', { uri: qrImage.uri, type: qrImage.type, name: qrImage.fileName });
        
        try {
            const res = await fetch(`${API_BASE_URL}/api/admin/payment-details`, { method: 'POST', body: data, headers: { 'Content-Type': 'multipart/form-data' } });
            const result = await res.json();
            if (res.ok) {
                Alert.alert('Success', result.message);
                fetchData();
                setIsEditing(false);
                setQrImage(null);
            } else { throw new Error(result.message); }
        } catch (error: any) {
            Alert.alert('Update Failed', error.message);
        } finally {
            setUpdating(false);
        }
    };

    const handleInputChange = (field, value) => setFormData(prev => ({...prev, [field]: value}));

    if (loading) return <View style={styles.centered}><ActivityIndicator size="large" /></View>;

    const qrCodeUri = details?.qr_code_url ? `${API_BASE_URL}${details.qr_code_url}` : null;

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={isEditing ? () => setIsEditing(false) : onBack} style={styles.backButton}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color={THEME.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{isEditing ? "Edit Details" : "View Details"}</Text>
            </View>
            <ScrollView contentContainerStyle={styles.contentContainer}>
                {isEditing ? (
                    <>
                        <Text style={styles.inputLabel}>QR Code</Text>
                        {(qrImage || qrCodeUri) ? ( <Image key={qrImage ? qrImage.uri : qrCodeUri} source={{ uri: qrImage ? qrImage.uri : qrCodeUri }} style={styles.currentQr} /> ) : ( <View style={[styles.currentQr, styles.placeholder]}><Text style={styles.placeholderText}>No Image Selected</Text></View> )}
                        <TouchableOpacity style={styles.changeQrButton} onPress={handleChooseImage}><Text style={styles.changeQrText}>Change QR Code Image</Text></TouchableOpacity>
                        <InputRow label="Account Holder Name" value={formData.account_holder_name} onChangeText={val => handleInputChange('account_holder_name', val)} />
                        <InputRow label="Bank Account" value={formData.account_number} onChangeText={val => handleInputChange('account_number', val)} />
                        <InputRow label="IFSC Code" value={formData.ifsc_code} onChangeText={val => handleInputChange('ifsc_code', val)} />
                        <InputRow label="CIF Code" value={formData.cif_code} onChangeText={val => handleInputChange('cif_code', val)} />
                    </>
                ) : (
                    <>
                        {qrCodeUri ? ( <Image key={qrCodeUri} source={{ uri: qrCodeUri }} style={styles.currentQr} /> ) : ( <View style={[styles.currentQr, styles.placeholder]}><Text style={styles.placeholderText}>No QR Code Uploaded</Text></View> )}
                        <DetailItem label="Account Holder Name" value={details?.account_holder_name} />
                        <DetailItem label="Bank Account" value={details?.account_number} />
                        <DetailItem label="IFSC Code" value={details?.ifsc_code} />
                        <DetailItem label="CIF Code" value={details?.cif_code} />
                    </>
                )}
            </ScrollView>
            <View style={styles.footer}>
                {isEditing ? (
                    <TouchableOpacity style={styles.updateButton} onPress={handleUpdate} disabled={updating}>{updating ? <ActivityIndicator color="#fff" /> : <Text style={styles.updateButtonText}>Save Changes</Text>}</TouchableOpacity>
                ) : (
                    <TouchableOpacity style={styles.editButton} onPress={() => setIsEditing(true)}><MaterialCommunityIcons name="pencil" size={20} color="#fff" /><Text style={styles.updateButtonText}>Edit Details</Text></TouchableOpacity>
                )}
            </View>
        </SafeAreaView>
    );
};

// --- Helper Components ---
const InputRow = ({ label, value, onChangeText }) => ( <View style={styles.inputGroup}><Text style={styles.inputLabel}>{label}</Text><TextInput style={styles.input} value={value || ''} onChangeText={onChangeText} placeholderTextColor={THEME.muted} /></View> );
const DetailItem = ({ label, value }) => ( <View style={styles.detailItem}><Text style={styles.inputLabel}>{label}</Text><Text style={styles.detailValue}>{value || 'Not set'}</Text></View> );

// --- Styles (with new style for proofAmount) ---
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: THEME.light }, centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { flexDirection: 'row', alignItems: 'center', backgroundColor: THEME.background, paddingVertical: 15, paddingHorizontal: 10, borderBottomWidth: 1, borderBottomColor: THEME.border, zIndex: 10 },
    headerTitle: { flex: 1, textAlign: 'center', fontSize: 20, fontWeight: 'bold' }, headerButton: { position: 'absolute', right: 15, padding: 5 }, backButton: { position: 'absolute', left: 15, zIndex: 1, padding: 5 },
    emptyText: { textAlign: 'center', marginTop: 50, color: THEME.muted, fontSize: 16 },
    proofCard: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 8, padding: 10, marginHorizontal: 10, marginVertical: 5, alignItems: 'center', elevation: 1 },
    proofImage: { width: 60, height: 60, borderRadius: 8, marginRight: 15, backgroundColor: THEME.light },
    proofDetails: { flex: 1 }, proofUser: { fontWeight: 'bold', fontSize: 16 },
    // ✅ NEW STYLE for the amount
    proofAmount: { fontSize: 14, fontWeight: '500', color: THEME.success, marginVertical: 2 },
    proofDate: { color: THEME.muted, fontSize: 12 },
    contentContainer: { padding: 20, paddingBottom: 100 },
    currentQr: { width: 200, height: 200, alignSelf: 'center', backgroundColor: THEME.light, borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: THEME.border },
    placeholder: { justifyContent: 'center', alignItems: 'center' }, placeholderText: { color: THEME.muted, fontSize: 16 },
    changeQrButton: { alignSelf: 'center', marginBottom: 30, padding: 10 }, changeQrText: { color: THEME.primary, fontWeight: '500' },
    inputGroup: { marginBottom: 15 }, inputLabel: { fontSize: 14, color: THEME.muted, marginBottom: 5 }, input: { backgroundColor: '#fff', borderWidth: 1, borderColor: THEME.border, borderRadius: 8, padding: 12, fontSize: 16, color: THEME.text },
    detailItem: { backgroundColor: '#fff', padding: 15, borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: THEME.border }, detailValue: { fontSize: 18, color: THEME.text, fontWeight: '500' },
    footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, backgroundColor: THEME.background, borderTopWidth: 1, borderTopColor: THEME.border },
    updateButton: { backgroundColor: THEME.success, padding: 15, borderRadius: 8, alignItems: 'center' }, editButton: { backgroundColor: THEME.primary, padding: 15, borderRadius: 8, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' },
    updateButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginLeft: 8 },
    modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.85)' },
    enlargedImage: { width: '95%', height: '80%' },
    closeButton: { position: 'absolute', top: 40, right: 20, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 20, padding: 5, zIndex: 1 },
});

export default AdminPaymentScreen;