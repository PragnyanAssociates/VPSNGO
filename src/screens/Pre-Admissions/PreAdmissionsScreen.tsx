import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, Modal, ScrollView, TextInput, Platform, Image, LayoutAnimation, UIManager } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../../context/AuthContext';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { SERVER_URL } from '../../../apiConfig';
import apiClient from '../../api/client';
import { launchImageLibrary, ImagePickerResponse, Asset } from 'react-native-image-picker';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// --- TYPE DEFINITIONS ---
type Status = 'Pending' | 'Approved' | 'Rejected';
interface PreAdmissionRecord { id: number; admission_no: string; submission_date: string; student_name: string; photo_url?: string; dob?: string; pen_no?: string; phone_no?: string; aadhar_no?: string; parent_name?: string; parent_phone?: string; previous_institute?: string; previous_grade?: string; joining_grade: string; address?: string; status: Status; }

// --- HELPER FUNCTIONS ---
const formatDate = (dateString?: string, includeTime = false): string => { if (!dateString) return 'N/A'; const date = new Date(dateString); const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric' }; if (includeTime) { options.hour = '2-digit'; options.minute = '2-digit'; } return date.toLocaleDateString('en-GB', options); };
const toYYYYMMDD = (date: Date): string => date.toISOString().split('T')[0];
const StatusPill = ({ status }: { status: Status }) => { const statusStyle = { Pending: { backgroundColor: '#FFF3E0', color: '#FF9800' }, Approved: { backgroundColor: '#E8F5E9', color: '#4CAF50' }, Rejected: { backgroundColor: '#FFEBEE', color: '#F44336' }, }; return (<View style={[styles.statusPill, { backgroundColor: statusStyle[status].backgroundColor }]}><Text style={[styles.statusPillText, { color: statusStyle[status].color }]}>{status}</Text></View>); };

// --- MAIN SCREEN COMPONENT ---
const PreAdmissionsScreen: React.FC = () => {
    const [data, setData] = useState<PreAdmissionRecord[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [currentItem, setCurrentItem] = useState<PreAdmissionRecord | null>(null);
    const [formData, setFormData] = useState<Partial<PreAdmissionRecord>>({});
    const [selectedImage, setSelectedImage] = useState<Asset | null>(null);
    const [date, setDate] = useState(new Date());
    const [pickerTarget, setPickerTarget] = useState<'dob' | null>(null);
    const [expandedCardId, setExpandedCardId] = useState<number | null>(null);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/preadmissions');
            setData(response.data);
        } catch (error: any) { Alert.alert('Error', error.response?.data?.message || 'Failed to fetch data.'); } 
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleCardPress = (id: number) => { LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); setExpandedCardId(prevId => (prevId === id ? null : id)); };
    const handleOpenModal = (item: PreAdmissionRecord | null = null) => { setSelectedImage(null); if (item) { setIsEditing(true); setCurrentItem(item); setFormData(item); } else { setIsEditing(false); setCurrentItem(null); setFormData({ status: 'Pending' }); } setModalVisible(true); };
    const handleChoosePhoto = () => { launchImageLibrary({ mediaType: 'photo', quality: 0.5 }, (response: ImagePickerResponse) => { if (!response.didCancel && !response.errorCode && response.assets) { setSelectedImage(response.assets[0]); } }); };
    
    const handleSave = async () => {
        if (!formData.admission_no || !formData.student_name || !formData.joining_grade) { return Alert.alert('Validation Error', 'Admission No, Student Name, and Joining Grade are required.'); }
        const body = new FormData();
        Object.keys(formData).forEach(key => { const value = formData[key as keyof PreAdmissionRecord]; if (value !== null && value !== undefined) body.append(key, String(value)); });
        if (selectedImage?.uri) { body.append('photo', { uri: selectedImage.uri, type: selectedImage.type, name: selectedImage.fileName }); }
        
        try {
            let response;
            if (isEditing && currentItem) {
                response = await apiClient.put(`/preadmissions/${currentItem.id}`, body, { headers: { 'Content-Type': 'multipart/form-data' } });
            } else {
                response = await apiClient.post('/preadmissions', body, { headers: { 'Content-Type': 'multipart/form-data' } });
            }
            Alert.alert('Success', response.data.message);
            setModalVisible(false);
            fetchData();
        } catch (error: any) { Alert.alert('Save Error', error.response?.data?.message || 'An error occurred during save.'); }
    };

    const handleDelete = (id: number) => {
        Alert.alert("Confirm Delete", "Are you sure you want to delete this record?", [
            { text: "Cancel", style: "cancel" },
            { text: "Delete", style: "destructive", onPress: async () => {
                try {
                    const response = await apiClient.delete(`/preadmissions/${id}`);
                    Alert.alert("Success", response.data.message);
                    fetchData();
                } catch (error: any) { Alert.alert('Delete Error', error.response?.data?.message || 'Failed to delete record.'); }
            }}
        ]);
    };

    const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => { setPickerTarget(null); if (event.type === 'set' && selectedDate) { setFormData(prev => ({ ...prev, dob: toYYYYMMDD(selectedDate) })); } };

    if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#00796B" /></View>;

    return (
        <View style={styles.container}>
            <FlatList
                ListHeaderComponent={<View style={styles.header}><View style={styles.headerIconContainer}><MaterialIcons name="person-add-alt-1" size={24} color="#00796B" /></View><View><Text style={styles.headerTitle}>Pre-Admissions</Text><Text style={styles.headerSubtitle}>Manage admission applications</Text></View></View>}
                data={data}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (<PreAdmissionCardItem item={item} onEdit={handleOpenModal} onDelete={handleDelete} isExpanded={expandedCardId === item.id} onPress={() => handleCardPress(item.id)} />)}
                ListEmptyComponent={<View style={styles.emptyContainer}><MaterialIcons name="inbox" size={80} color="#CFD8DC" /><Text style={styles.emptyText}>No applications found.</Text><Text style={styles.emptySubText}>Tap '+' to add a new application.</Text></View>}
                contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
            />
            <TouchableOpacity style={styles.fab} onPress={() => handleOpenModal()}><MaterialIcons name="add" size={24} color="#fff" /></TouchableOpacity>
            
            <Modal visible={modalVisible} animationType="slide" onRequestClose={() => setModalVisible(false)}>
                <ScrollView style={styles.modalContainer} contentContainerStyle={{paddingBottom: 50}}>
                    <Text style={styles.modalTitle}>{isEditing ? 'Edit Application' : 'New Application'}</Text>
                    <View style={styles.imagePickerContainer}>
                        <Image source={selectedImage?.uri ? { uri: selectedImage.uri } : (formData.photo_url ? { uri: `${SERVER_URL}${formData.photo_url}` } : { uri: 'default_avatar' })} style={styles.profileImage} />
                        <TouchableOpacity style={styles.imagePickerButton} onPress={handleChoosePhoto}><FontAwesome name="camera" size={16} color="#fff" /><Text style={styles.imagePickerButtonText}>Choose Photo</Text></TouchableOpacity>
                    </View>
                    
                    <Text style={styles.label}>Admission No*</Text><TextInput style={styles.input} value={formData.admission_no || ''} onChangeText={t => setFormData(p => ({...p, admission_no: t}))} />
                    <Text style={styles.label}>Student Name*</Text><TextInput style={styles.input} value={formData.student_name || ''} onChangeText={t => setFormData(p => ({...p, student_name: t}))} />
                    <Text style={styles.label}>Date of Birth</Text><TouchableOpacity onPress={() => setPickerTarget('dob')} style={styles.input}><Text style={styles.dateText}>{formData.dob ? formatDate(formData.dob) : 'Select Date'}</Text></TouchableOpacity>
                    <Text style={styles.label}>Phone No</Text><TextInput style={styles.input} value={formData.phone_no || ''} onChangeText={t => setFormData(p => ({...p, phone_no: t}))} keyboardType="phone-pad" />
                    <Text style={styles.label}>Parent Name</Text><TextInput style={styles.input} value={formData.parent_name || ''} onChangeText={t => setFormData(p => ({...p, parent_name: t}))} />
                    <Text style={styles.label}>Parent No</Text><TextInput style={styles.input} value={formData.parent_phone || ''} onChangeText={t => setFormData(p => ({...p, parent_phone: t}))} keyboardType="phone-pad" />
                    <Text style={styles.label}>Joining Grade*</Text><TextInput style={styles.input} value={formData.joining_grade || ''} onChangeText={t => setFormData(p => ({...p, joining_grade: t}))} />
                    <Text style={styles.label}>Previous Institute</Text><TextInput style={styles.input} value={formData.previous_institute || ''} onChangeText={t => setFormData(p => ({...p, previous_institute: t}))} />
                    <Text style={styles.label}>Previous Grade</Text><TextInput style={styles.input} value={formData.previous_grade || ''} onChangeText={t => setFormData(p => ({...p, previous_grade: t}))} />
                    <Text style={styles.label}>Address</Text><TextInput style={[styles.input, styles.textArea]} value={formData.address || ''} onChangeText={t => setFormData(p => ({...p, address: t}))} multiline />
                    <Text style={styles.label}>Pen No</Text><TextInput style={styles.input} value={formData.pen_no || ''} onChangeText={t => setFormData(p => ({...p, pen_no: t}))} />
                    <Text style={styles.label}>Aadhar No</Text><TextInput style={styles.input} value={formData.aadhar_no || ''} onChangeText={t => setFormData(p => ({...p, aadhar_no: t}))} keyboardType="numeric" />
                    <Text style={styles.label}>Application Status</Text>
                    <View style={styles.statusSelector}>{(['Pending', 'Approved', 'Rejected'] as Status[]).map(status => (<TouchableOpacity key={status} onPress={() => setFormData(p => ({...p, status}))} style={[styles.statusButton, formData.status === status && styles.selectedStatusButton]}><Text style={[styles.statusButtonText, formData.status === status && styles.selectedStatusButtonText]}>{status}</Text></TouchableOpacity>))}</View>
                    {pickerTarget && <DateTimePicker value={date} mode="date" display="default" onChange={onDateChange} />}
                    <View style={styles.modalActions}><TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setModalVisible(false)}><Text style={styles.modalButtonText}>Cancel</Text></TouchableOpacity><TouchableOpacity style={[styles.modalButton, styles.saveButton]} onPress={handleSave}><Text style={styles.modalButtonText}>Save</Text></TouchableOpacity></View>
                </ScrollView>
            </Modal>
        </View>
    );
};

const PreAdmissionCardItem = ({ item, onEdit, onDelete, isExpanded, onPress }) => (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
        <View style={styles.cardHeader}>
            <Image source={item.photo_url ? { uri: `${SERVER_URL}${item.photo_url}` } : { uri: 'default_avatar' }} style={styles.avatarImage} />
            <View style={styles.cardHeaderText}><Text style={styles.cardTitle}>{item.student_name}</Text><Text style={styles.cardSubtitle}>Joining: {item.joining_grade}</Text></View>
            <View style={styles.cardActions}><StatusPill status={item.status} /><View style={styles.buttonGroup}><TouchableOpacity onPress={() => onEdit(item)} style={styles.iconButton}><FontAwesome name="pencil" size={18} color="#FFA000" /></TouchableOpacity><TouchableOpacity onPress={() => onDelete(item.id)} style={styles.iconButton}><FontAwesome name="trash" size={18} color="#D32F2F" /></TouchableOpacity></View></View>
        </View>
        {isExpanded && (<View style={styles.expandedContainer}><InfoRow icon="vcard" label="Admission No" value={item.admission_no} /><InfoRow icon="calendar-o" label="Submitted" value={formatDate(item.submission_date, true)} /><InfoRow icon="birthday-cake" label="D.O.B" value={formatDate(item.dob)} /><InfoRow icon="phone" label="Student Phone" value={item.phone_no || 'N/A'} /><InfoRow icon="user" label="Parent" value={item.parent_name || 'N/A'} /><InfoRow icon="mobile" label="Parent Phone" value={item.parent_phone || 'N/A'} /><InfoRow icon="university" label="Prev. Institute" value={item.previous_institute || 'N/A'} /><InfoRow icon="graduation-cap" label="Prev. Grade" value={item.previous_grade || 'N/A'} /><InfoRow icon="map-marker" label="Address" value={item.address || 'N/A'} isMultiLine /></View>)}
    </TouchableOpacity>
);

const InfoRow = ({ icon, label, value, isMultiLine = false }) => (<View style={[styles.infoRow, isMultiLine && { alignItems: 'flex-start' }]}><FontAwesome name={icon} size={15} color="#757575" style={[styles.infoIcon, isMultiLine && { marginTop: 3 }]} /><Text style={styles.infoLabel}>{label}:</Text><Text style={styles.infoValue} numberOfLines={isMultiLine ? undefined : 1}>{value}</Text></View>);
const styles = StyleSheet.create({ center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F0F4F7' }, container: { flex: 1, backgroundColor: '#F0F4F7' }, header: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#FFFFFF', borderRadius: 12, marginVertical: 10, marginHorizontal: 16, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, }, headerIconContainer: { width: 45, height: 45, borderRadius: 22.5, backgroundColor: '#E0F2F1', justifyContent: 'center', alignItems: 'center', marginRight: 16 }, headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#004D40' }, headerSubtitle: { fontSize: 14, color: '#00796B' }, card: { backgroundColor: '#FFFFFF', borderRadius: 12, marginVertical: 8, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 4, overflow: 'hidden' }, cardHeader: { flexDirection: 'row', alignItems: 'center', padding: 16 }, avatarImage: { width: 45, height: 45, borderRadius: 22.5, marginRight: 12, backgroundColor: '#E0E0E0' }, cardHeaderText: { flex: 1, justifyContent: 'center', }, cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#212121' }, cardSubtitle: { fontSize: 13, color: '#757575', marginTop: 2 }, cardActions: { alignItems: 'flex-end' }, buttonGroup: { flexDirection: 'row', marginTop: 10 }, iconButton: { marginLeft: 16 }, statusPill: { borderRadius: 12, paddingVertical: 5, paddingHorizontal: 12, alignItems: 'center' }, statusPillText: { fontSize: 11, fontWeight: 'bold' }, expandedContainer: { paddingHorizontal: 16, paddingBottom: 16, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#EEEEEE' }, infoRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12 }, infoIcon: { width: 24, textAlign: 'center' }, infoLabel: { fontSize: 14, fontWeight: '600', color: '#424242', marginLeft: 10 }, infoValue: { fontSize: 14, color: '#757575', flex: 1, marginLeft: 5, flexWrap: 'wrap' }, fab: { position: 'absolute', right: 25, bottom: 25, width: 56, height: 56, borderRadius: 28, backgroundColor: '#0288D1', justifyContent: 'center', alignItems: 'center', elevation: 8 }, emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: '30%', opacity: 0.6 }, emptyText: { fontSize: 18, fontWeight: '600', color: '#78909C', marginTop: 16 }, emptySubText: { fontSize: 14, color: '#78909C', marginTop: 4 }, modalContainer: { flex: 1, backgroundColor: '#f9f9f9', paddingTop: 30, paddingHorizontal: 20 }, modalTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 25, textAlign: 'center', color: '#212121' }, label: { fontSize: 16, color: '#555', marginBottom: 8, marginTop: 12, fontWeight: '600' }, input: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#CFD8DC', paddingVertical: 12, paddingHorizontal: 15, borderRadius: 8, marginBottom: 10, fontSize: 16, color: '#333' }, dateText: { color: '#333', fontSize: 16 }, textArea: { height: 100, textAlignVertical: 'top' }, modalActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 30, marginBottom: 50 }, modalButton: { paddingVertical: 14, borderRadius: 8, flex: 1, alignItems: 'center', elevation: 2 }, cancelButton: { backgroundColor: '#9E9E9E', marginRight: 10 }, saveButton: { backgroundColor: '#0288D1', marginLeft: 10 }, modalButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 }, imagePickerContainer: { alignItems: 'center', marginBottom: 20 }, profileImage: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#E0E0E0', marginBottom: 10, borderWidth: 3, borderColor: '#0288D1' }, imagePickerButton: { flexDirection: 'row', backgroundColor: '#0288D1', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8, alignItems: 'center' }, imagePickerButtonText: { color: '#fff', marginLeft: 10, fontWeight: 'bold' }, statusSelector: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 8 }, statusButton: { flex: 1, paddingVertical: 12, borderRadius: 8, borderWidth: 1, borderColor: '#B0BEC5', alignItems: 'center', marginHorizontal: 4 }, selectedStatusButton: { backgroundColor: '#00796B', borderColor: '#00796B' }, statusButtonText: { color: '#37474F', fontWeight: '600' }, selectedStatusButtonText: { color: '#FFFFFF' }, });

export default PreAdmissionsScreen;