// 📂 File: src/screens/sponsorship/DonorSponsorScreen.tsx (COMPLETE AND FINAL)

import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, TextInput, SafeAreaView, FlatList, Image, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import BouncyCheckbox from "react-native-bouncy-checkbox";
import * as ImagePicker from 'react-native-image-picker';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../../apiConfig';

const THEME = { primary: '#007bff', success: '#28a745', light: '#f8f9fa', background: '#FFFFFF', text: '#212529', muted: '#6c757d', border: '#dee2e6', warning: '#ffc107' };

// Main Component to control the view flow
const DonorSponsorScreen = () => {
    const [view, setView] = useState('form'); // 'form', 'paymentDetails', 'uploadProof', 'history'
    const [sponsorshipApplication, setSponsorshipApplication] = useState(null);

    const handleFormSubmit = (appData) => {
        setSponsorshipApplication(appData);
        setView('paymentDetails');
    };
    const handleProceedToUpload = () => setView('uploadProof');
    const handleUploadSuccess = () => setView('history');

    const renderContent = () => {
        switch (view) {
            case 'form': return <SponsorshipForm onSubmit={handleFormSubmit} onShowHistory={() => setView('history')} />;
            case 'paymentDetails': return <PaymentDetailsView onBack={() => setView('form')} onProceed={handleProceedToUpload} />;
            case 'uploadProof': return <UploadProofView application={sponsorshipApplication} onBack={() => setView('paymentDetails')} onUploadSuccess={handleUploadSuccess} />;
            case 'history': return <HistoryView onBack={() => setView('form')} />;
            default: return <SponsorshipForm onSubmit={handleFormSubmit} onShowHistory={() => setView('history')} />;
        }
    };

    return <SafeAreaView style={styles.container}>{renderContent()}</SafeAreaView>;
};

// --- View 1: Sponsorship Form ---
const SponsorshipForm = ({ onSubmit, onShowHistory }) => {
    const [form, setForm] = useState({ fullName: '', email: '', phone: '', organization: '', message: '', wantsUpdates: false, wantsToVisit: false });
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();

    const handleInputChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

    const handleSubmit = async () => {
        if (!form.fullName || !form.email || !form.phone) return Alert.alert("Required", "Full Name, Email, and Phone Number are required.");
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/sponsorship/apply`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ donorId: user.id, ...form }) });
            const data = await res.json();
            if (res.ok) {
                onSubmit({ applicationId: data.applicationId });
            } else {
                throw new Error(data.message || 'An unknown error occurred.');
            }
        } catch (e: any) { Alert.alert("Error", e.message); }
        finally { setLoading(false); }
    };

    return (
        <View style={{flex: 1}}>
            <ScrollView contentContainerStyle={styles.formContentContainer}>
                <TouchableOpacity style={styles.historyButton} onPress={onShowHistory}><Text style={styles.historyButtonText}>View My Sponsorship History</Text></TouchableOpacity>
                <FormInput label="Full Name" value={form.fullName} onChangeText={val => handleInputChange('fullName', val)} isRequired />
                <FormInput label="Email Address" value={form.email} onChangeText={val => handleInputChange('email', val)} keyboardType="email-address" isRequired />
                <FormInput label="Phone Number" value={form.phone} onChangeText={val => handleInputChange('phone', val)} keyboardType="phone-pad" isRequired />
                <FormInput label="Organization/Company (Optional)" value={form.organization} onChangeText={val => handleInputChange('organization', val)} />
                <FormInput label="Special Message or Preferences" value={form.message} onChangeText={val => handleInputChange('message', val)} multiline />
                <BouncyCheckbox text="I would like to receive regular updates and photos" isChecked={form.wantsUpdates} textStyle={{textDecorationLine: 'none', color: THEME.text}} style={{marginBottom: 15}} onPress={isChecked => handleInputChange('wantsUpdates', isChecked)} fillColor={THEME.primary} innerIconStyle={{borderWidth: 2}} />
                <BouncyCheckbox text="I'm interested in school events and visits" isChecked={form.wantsToVisit} textStyle={{textDecorationLine: 'none', color: THEME.text}} style={{marginBottom: 15}} onPress={isChecked => handleInputChange('wantsToVisit', isChecked)} fillColor={THEME.primary} innerIconStyle={{borderWidth: 2}} />
            </ScrollView>
            <View style={styles.footer}>
                <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Proceed to Payment</Text>}
                </TouchableOpacity>
            </View>
        </View>
    );
};

// --- View 2: Shows QR/Bank Details ---
const PaymentDetailsView = ({ onBack, onProceed }) => {
    const [details, setDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    useFocusEffect(useCallback(() => {
        fetch(`${API_BASE_URL}/api/payment-details`).then(res => res.json()).then(setDetails).finally(() => setLoading(false));
    }, []));

    if (loading) return <View style={styles.centered}><ActivityIndicator size="large" /></View>;
    
    const qrCodeUri = details?.qr_code_url ? `${API_BASE_URL}${details.qr_code_url}` : null;
    
    return (
        <View style={{flex: 1}}>
            <Header onBack={onBack} title="Make Payment" />
            <ScrollView contentContainerStyle={{padding: 20}}>
                {qrCodeUri ? <Image source={{ uri: qrCodeUri }} style={styles.qrCode} resizeMode="contain"/> : <View style={styles.qrPlaceholder}><Text>QR Not Available</Text></View>}
                <DetailRow label="Account Holder Name" value={details?.account_holder_name} />
                <DetailRow label="Bank Account" value={details?.account_number} />
                <DetailRow label="IFSC Code" value={details?.ifsc_code} />
                <DetailRow label="CIF Code" value={details?.cif_code} />
            </ScrollView>
            <View style={styles.footer}>
                <TouchableOpacity style={styles.button} onPress={onProceed}>
                    <Text style={styles.buttonText}>I've Paid, Upload Proof</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

// --- View 3: Upload Payment Proof ---
const UploadProofView = ({ application, onBack, onUploadSuccess }) => {
    const [amount, setAmount] = useState('');
    const [photo, setPhoto] = useState(null);
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();

    const handleChoosePhoto = () => { ImagePicker.launchImageLibrary({ mediaType: 'photo' }, res => { if (res.assets) setPhoto(res.assets[0]); }); };

    const handleUpload = async () => {
        if (!photo || !amount) return Alert.alert('Required', 'Please enter the amount and select a screenshot.');
        setLoading(true);
        const formData = new FormData();
        formData.append('applicationId', application.applicationId);
        formData.append('donorId', user.id);
        formData.append('amount', amount);
        formData.append('screenshot', { uri: photo.uri, type: photo.type, name: photo.fileName });
        try {
            const res = await fetch(`${API_BASE_URL}/api/sponsorship/upload-proof`, { method: 'POST', body: formData, headers: { 'Content-Type': 'multipart/form-data' }});
            const result = await res.json();
            if (res.ok) { Alert.alert('Success', result.message); onUploadSuccess(); }
            else throw new Error(result.message);
        } catch (error: any) { Alert.alert('Upload Failed', error.message); }
        finally { setLoading(false); }
    };

    return (
        <View style={{flex: 1}}>
            <Header onBack={onBack} title="Upload Sponsorship Proof" />
            <ScrollView contentContainerStyle={{padding: 20}}>
                <FormInput label="Amount Paid (₹)" value={amount} onChangeText={setAmount} keyboardType="numeric" isRequired />
                <TouchableOpacity style={styles.imagePicker} onPress={handleChoosePhoto}>
                    {photo ? <Image source={{ uri: photo.uri }} style={styles.previewImage} /> : <><MaterialCommunityIcons name="camera-plus-outline" size={50} color={THEME.muted} /><Text>Select Screenshot</Text></>}
                </TouchableOpacity>
            </ScrollView>
            <View style={styles.footer}>
                <TouchableOpacity style={styles.button} onPress={handleUpload} disabled={loading}>
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Submit Proof</Text>}
                </TouchableOpacity>
            </View>
        </View>
    );
};

// --- View 4: Sponsorship History ---
const HistoryView = ({ onBack }) => {
    const { user } = useAuth();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const fetchHistory = useCallback(() => {
        if (!user) return; setLoading(true);
        fetch(`${API_BASE_URL}/api/sponsorship/history/${user.id}`).then(res => res.json()).then(setHistory).finally(() => setLoading(false));
    }, [user]);
    useFocusEffect(fetchHistory);

    const getStatusStyle = (status) => {
        if (status === 'Verified') return {backgroundColor: THEME.success};
        if (status === 'Pending') return {backgroundColor: THEME.warning};
        return {backgroundColor: THEME.muted};
    };
    const getStatusTextColor = (status) => {
        if (status === 'Pending') return {color: '#000'};
        return {color: '#fff'};
    };

    return (
        <View style={{flex: 1}}>
            <Header onBack={onBack} title="My Sponsorships" />
            <FlatList
                data={history} keyExtractor={item => item.id.toString()}
                renderItem={({ item }) => (
                    <View style={styles.historyCard}>
                        <View style={{flex: 1}}>
                            <Text style={styles.historyTitle}>{item.full_name}</Text>
                            <Text style={styles.historyDate}>Applied on: {new Date(item.application_date).toLocaleDateString()}</Text>
                            {item.amount ? (
                                <>
                                    <Text style={styles.historyAmount}>Amount: ₹{item.amount}</Text>
                                    <View style={[styles.statusBadge, getStatusStyle(item.status)]}>
                                        <Text style={[styles.statusBadgeText, getStatusTextColor(item.status)]}>{item.status}</Text>
                                    </View>
                                </>
                            ) : 
                            <View style={[styles.statusBadge, getStatusStyle(null)]}>
                                <Text style={styles.statusBadgeText}>Proof Pending</Text>
                            </View>
                            }
                        </View>
                        {item.screenshot_url && <Image source={{uri: `${API_BASE_URL}${item.screenshot_url}`}} style={styles.historyImage} />}
                    </View>
                )}
                ListEmptyComponent={<View style={styles.centered}><Text style={styles.emptyText}>No sponsorship history found.</Text></View>}
                refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchHistory} colors={[THEME.primary]} />}
            />
        </View>
    );
};

// --- Helper Components ---
const FormInput = ({ label, isRequired, ...props }) => (<View style={styles.inputGroup}><Text style={styles.label}>{label} {isRequired && <Text style={{color: 'red'}}>*</Text>}</Text><TextInput style={props.multiline ? styles.textArea : styles.input} {...props} placeholderTextColor={THEME.muted} /></View>);
const Header = ({ onBack, title }) => (<View style={styles.header}><TouchableOpacity onPress={onBack} style={styles.backButton}><MaterialCommunityIcons name="arrow-left" size={24} color={THEME.primary} /></TouchableOpacity><Text style={styles.headerTitle}>{title}</Text></View>);
const DetailRow = ({ label, value }) => (<View style={styles.detailRow}><Text style={styles.detailLabel}>{label}</Text><Text style={styles.detailValue}>{value || 'N/A'}</Text></View>);

// --- Styles ---
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: THEME.background }, centered: { flex: 1, justifyContent: 'center', alignItems: 'center' }, emptyText: { textAlign: 'center', marginTop: 50, color: THEME.muted },
    formContentContainer: { padding: 20, paddingBottom: 100 },
    footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, backgroundColor: THEME.background, borderTopWidth: 1, borderTopColor: THEME.border },
    button: { backgroundColor: THEME.primary, paddingVertical: 15, borderRadius: 8, alignItems: 'center' }, buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    inputGroup: { marginBottom: 15 }, label: { fontSize: 16, color: THEME.text, marginBottom: 8, fontWeight: '500' },
    input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, fontSize: 16 }, textArea: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, fontSize: 16, height: 100, textAlignVertical: 'top' },
    header: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15 }, backButton: { position: 'absolute', left: 15, zIndex: 1, padding: 5 }, headerTitle: { flex: 1, textAlign: 'center', fontSize: 20, fontWeight: 'bold' },
    qrCode: { width: 250, height: 250, alignSelf: 'center', marginVertical: 20 }, qrPlaceholder: { width: 250, height: 250, alignSelf: 'center', marginVertical: 20, backgroundColor: THEME.light, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: THEME.border },
    detailRow: { backgroundColor: THEME.light, padding: 15, borderRadius: 8, marginBottom: 10 }, detailLabel: { color: THEME.muted }, detailValue: { color: THEME.text, fontSize: 16, fontWeight: '500' },
    imagePicker: { height: 200, borderWidth: 2, borderColor: THEME.border, borderStyle: 'dashed', borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginVertical: 20 },
    previewImage: { width: '100%', height: '100%', borderRadius: 8 },
    historyButton: { padding: 15, backgroundColor: '#e7f3ff', borderRadius: 8, alignItems: 'center', marginBottom: 20 }, historyButtonText: { color: THEME.primary, fontWeight: 'bold' },
    historyCard: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 8, padding: 15, marginHorizontal: 15, marginVertical: 8, elevation: 2 },
    historyTitle: { fontSize: 18, fontWeight: 'bold' }, historyDate: { color: THEME.muted, marginVertical: 4 }, historyAmount: { fontWeight: '500', marginTop: 8 },
    statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, overflow: 'hidden', marginTop: 8 },
    statusBadgeText: { fontSize: 12, fontWeight: 'bold' },
    historyImage: { width: 80, height: 80, borderRadius: 8, marginLeft: 15, backgroundColor: THEME.light },
});

export default DonorSponsorScreen;