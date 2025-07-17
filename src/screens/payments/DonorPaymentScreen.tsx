// 📂 File: src/screens/payments/DonorPaymentScreen.tsx (COMPLETE AND FINAL)

import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Image, SafeAreaView, FlatList, Modal, RefreshControl, TextInput } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'react-native-image-picker';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../../apiConfig';

const THEME = { primary: '#007bff', success: '#28a745', light: '#f8f9fa', background: '#FFFFFF', text: '#212529', muted: '#6c757d', border: '#dee2e6', dark: '#343a40' };

// Main Component
const DonorPaymentScreen = () => {
    const [view, setView] = useState('menu'); // 'menu', 'makePayment', 'uploadProof', 'history'
    const renderContent = () => {
        switch (view) {
            case 'menu': return <PaymentMenu onMakePayment={() => setView('makePayment')} onViewHistory={() => setView('history')} />;
            case 'makePayment': return <MakePaymentView onBack={() => setView('menu')} onUploadProof={() => setView('uploadProof')} />;
            case 'uploadProof': return <UploadProofView onBack={() => setView('makePayment')} onUploadSuccess={() => setView('history')} />;
            case 'history': return <HistoryView onBack={() => setView('menu')} />;
            default: return <PaymentMenu onMakePayment={() => setView('makePayment')} onViewHistory={() => setView('history')} />;
        }
    };
    return <SafeAreaView style={styles.container}>{renderContent()}</SafeAreaView>;
};

// View 1: Main Menu
const PaymentMenu = ({ onMakePayment, onViewHistory }) => (
    <View style={styles.menuContainer}>
        <View style={styles.menuHeader}>
            <MaterialCommunityIcons name="credit-card-outline" size={40} color={THEME.dark} />
            <Text style={styles.menuTitle}>Make a Payment</Text>
            <Text style={styles.menuSubtitle}>Manage your donations and payments.</Text>
        </View>
        <TouchableOpacity style={[styles.menuButton, { backgroundColor: THEME.success }]} onPress={onMakePayment}>
            <Text style={styles.menuButtonText}>Make a Payment</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.menuButton, { backgroundColor: THEME.muted }]} onPress={onViewHistory}>
            <Text style={styles.menuButtonText}>View Payment History</Text>
        </TouchableOpacity>
    </View>
);

// View 2: QR/Bank Details
const MakePaymentView = ({ onBack, onUploadProof }) => {
    const [details, setDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    useFocusEffect(useCallback(() => {
        setLoading(true);
        fetch(`${API_BASE_URL}/api/payment-details`).then(res => res.json()).then(setDetails).finally(() => setLoading(false));
    }, []));
    if (loading) return <View style={styles.centered}><ActivityIndicator size="large" color={THEME.primary} /></View>;
    const qrCodeUri = details?.qr_code_url ? `${API_BASE_URL}${details.qr_code_url}` : null;
    return (
        <View style={{ flex: 1 }}>
            <Header onBack={onBack} title="Payment Details" />
            <ScrollView contentContainerStyle={styles.paymentDetailsContainer}>
                {qrCodeUri ? <Image key={qrCodeUri} source={{ uri: qrCodeUri }} style={styles.qrCode} resizeMode="contain"/> : <View style={styles.qrCodePlaceholder}><Text style={styles.placeholderText}>QR Code not available</Text></View>}
                <DetailRow label="Account Holder Name" value={details?.account_holder_name} />
                <DetailRow label="Bank Account" value={details?.account_number} />
                <DetailRow label="IFSC Code" value={details?.ifsc_code} />
                <DetailRow label="CIF Code" value={details?.cif_code} />
            </ScrollView>
            <View style={styles.footer}><TouchableOpacity style={styles.button} onPress={onUploadProof}><Text style={styles.buttonText}>I've Paid, Upload Screenshot</Text></TouchableOpacity></View>
        </View>
    );
};

// View 3: Upload Proof with Amount
const UploadProofView = ({ onBack, onUploadSuccess }) => {
    const [amount, setAmount] = useState('');
    const [photo, setPhoto] = useState(null);
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();

    const handleChoosePhoto = () => { ImagePicker.launchImageLibrary({ mediaType: 'photo' }, res => { if (res.assets) setPhoto(res.assets[0]); }); };
    
    const handleUpload = async () => {
        if (!photo || !amount) return Alert.alert('Required', 'Please enter the amount and select a screenshot.');
        setLoading(true);
        const formData = new FormData();
        formData.append('donorId', user.id);
        formData.append('amount', amount);
        formData.append('screenshot', { uri: photo.uri, type: photo.type, name: photo.fileName });
        try {
            const res = await fetch(`${API_BASE_URL}/api/donor/payment-proof`, { method: 'POST', body: formData, headers: { 'Content-Type': 'multipart/form-data' }});
            const result = await res.json();
            if (res.ok) { Alert.alert('Success', result.message); onUploadSuccess(); }
            else throw new Error(result.message);
        } catch (error: any) { Alert.alert('Upload Failed', error.message); }
        finally { setLoading(false); }
    };

    return (
        <View style={{flex: 1}}>
            <Header onBack={onBack} title="Upload Proof" />
            <ScrollView contentContainerStyle={styles.uploadContainer}>
                <FormInput label="Amount Paid (₹)" value={amount} onChangeText={setAmount} keyboardType="numeric" isRequired />
                <TouchableOpacity style={styles.imagePicker} onPress={handleChoosePhoto}>
                    {photo ? <Image source={{ uri: photo.uri }} style={styles.previewImage} /> : <><MaterialCommunityIcons name="camera-plus-outline" size={50} color={THEME.muted} /><Text>Select Screenshot</Text></>}
                </TouchableOpacity>
            </ScrollView>
            <View style={styles.footer}><TouchableOpacity style={styles.button} onPress={handleUpload} disabled={loading}>{loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Submit Proof</Text>}</TouchableOpacity></View>
        </View>
    );
};

// View 4: History View with Amount
const HistoryView = ({ onBack }) => {
    const { user } = useAuth();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);

    // ✅ FULLY DEFINED FUNCTION
    const fetchHistory = useCallback(() => {
        if (!user) return;
        setLoading(true);
        fetch(`${API_BASE_URL}/api/donor/payment-history/${user.id}`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setHistory(data);
                else setHistory([]);
            })
            .catch(() => Alert.alert('Error', 'Could not fetch payment history.'))
            .finally(() => setLoading(false));
    }, [user]);

    // ✅ FULLY DEFINED HOOK
    useFocusEffect(fetchHistory);

    // ✅ FULLY DEFINED FUNCTION
    const handleImagePress = (imageUrl) => {
        setSelectedImage(imageUrl);
        setIsModalVisible(true);
    };

    // ✅ FULLY DEFINED FUNCTION
    const handleCloseModal = () => {
        setIsModalVisible(false);
        setSelectedImage(null);
    };

    return (
        <View style={styles.container}>
            <Header onBack={onBack} title="My Payment History" />
            <FlatList
                data={history} keyExtractor={item => item.id.toString()}
                renderItem={({ item }) => (
                    <TouchableOpacity style={styles.historyCard} onPress={() => handleImagePress(item.screenshot_url)}>
                        <Image source={{ uri: `${API_BASE_URL}${item.screenshot_url}` }} style={styles.historyImage} />
                        <View style={styles.historyDetails}>
                            <Text style={styles.historyAmount}>₹{item.amount || 'N/A'}</Text>
                            <Text style={styles.historyDate}>{new Date(item.submission_date).toLocaleString()}</Text>
                        </View>
                        <MaterialCommunityIcons name="arrow-expand" size={20} color={THEME.muted} />
                    </TouchableOpacity>
                )}
                ListEmptyComponent={<View style={styles.centered}><Text style={styles.emptyText}>You have no payment history yet.</Text></View>}
                contentContainerStyle={{ paddingBottom: 20 }}
                refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchHistory} colors={[THEME.primary]} />}
            />
            <Modal visible={isModalVisible} transparent={true} animationType="fade" onRequestClose={handleCloseModal}>
                <View style={styles.modalContainer}>
                    <TouchableOpacity style={styles.closeButton} onPress={handleCloseModal}><MaterialCommunityIcons name="close" size={30} color="#fff" /></TouchableOpacity>
                    {selectedImage && <Image source={{ uri: `${API_BASE_URL}${selectedImage}` }} style={styles.enlargedImage} resizeMode="contain" />}
                </View>
            </Modal>
        </View>
    );
};

// --- Helper Components ---
const FormInput = ({ label, isRequired, ...props }) => (<View style={styles.inputGroup}><Text style={styles.label}>{label} {isRequired && <Text style={{color: 'red'}}>*</Text>}</Text><TextInput style={styles.input} {...props} placeholderTextColor={THEME.muted} /></View>);
const Header = ({ onBack, title }) => (<View style={styles.header}><TouchableOpacity onPress={onBack} style={styles.backButton}><MaterialCommunityIcons name="arrow-left" size={24} color={THEME.primary} /></TouchableOpacity><Text style={styles.headerTitle}>{title}</Text></View>);
const DetailRow = ({ label, value }) => (<View style={styles.detailRow}><Text style={styles.detailLabel}>{label}</Text><Text style={styles.detailValue}>{value || 'N/A'}</Text></View>);

// --- Styles ---
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: THEME.background }, centered: { flex: 1, justifyContent: 'center', alignItems: 'center' }, emptyText: { textAlign: 'center', marginTop: 50, color: THEME.muted, fontSize: 16 },
    menuContainer: { flex: 1, justifyContent: 'center', padding: 20 }, menuHeader: { alignItems: 'center', marginBottom: 40 }, menuTitle: { fontSize: 24, fontWeight: 'bold', color: THEME.dark, marginTop: 10 }, menuSubtitle: { fontSize: 16, color: THEME.muted, marginTop: 5 },
    menuButton: { paddingVertical: 15, borderRadius: 8, alignItems: 'center', marginBottom: 15 }, menuButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    header: { flexDirection: 'row', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderBottomColor: THEME.border }, backButton: { position: 'absolute', left: 15, zIndex: 1, padding: 5 }, headerTitle: { flex: 1, textAlign: 'center', fontSize: 20, fontWeight: 'bold', color: THEME.text },
    paymentDetailsContainer: { padding: 20, paddingBottom: 100 }, footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, backgroundColor: THEME.background, borderTopWidth: 1, borderTopColor: THEME.border }, button: { backgroundColor: THEME.primary, padding: 15, borderRadius: 8, alignItems: 'center' }, buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    qrCode: { width: '100%', height: 250, alignSelf: 'center', marginBottom: 20, borderRadius: 10 }, qrCodePlaceholder: { width: '100%', height: 250, backgroundColor: THEME.light, justifyContent: 'center', alignItems: 'center', borderRadius: 10, marginBottom: 20, borderWidth: 1, borderColor: THEME.border }, placeholderText: { color: THEME.muted, fontSize: 16 },
    detailRow: { backgroundColor: THEME.light, padding: 15, borderRadius: 8, marginBottom: 10 }, detailLabel: { color: THEME.muted, fontSize: 14 }, detailValue: { color: THEME.text, fontSize: 18, fontWeight: '500', marginTop: 4 },
    uploadContainer: { flex: 1, padding: 20, paddingBottom: 100 },
    imagePicker: { height: 200, borderWidth: 2, borderColor: THEME.border, borderStyle: 'dashed', borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginTop: 20 },
    previewImage: { width: '100%', height: '100%', borderRadius: 8 },
    inputGroup: { marginBottom: 15 }, label: { fontSize: 16, color: THEME.text, marginBottom: 8, fontWeight: '500' }, input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, fontSize: 16 },
    historyCard: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 8, padding: 10, marginHorizontal: 10, marginVertical: 5, alignItems: 'center', elevation: 1 },
    historyImage: { width: 60, height: 60, borderRadius: 8, marginRight: 15, backgroundColor: THEME.light }, historyDetails: { flex: 1 },
    historyAmount: { fontSize: 18, fontWeight: 'bold', color: THEME.text }, historyDate: { color: THEME.muted, fontSize: 12, marginTop: 4 },
    modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.85)' }, enlargedImage: { width: '95%', height: '80%' },
    closeButton: { position: 'absolute', top: 40, right: 20, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 20, padding: 5, zIndex: 1 },
});

export default DonorPaymentScreen;