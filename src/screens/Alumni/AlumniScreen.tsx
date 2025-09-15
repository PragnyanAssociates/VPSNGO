import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  ScrollView,
  TextInput,
  Platform,
  Image,
  LayoutAnimation,
  UIManager
} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../../context/AuthContext';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { API_BASE_URL } from '../../../apiConfig';
import { launchImageLibrary, ImagePickerResponse, Asset } from 'react-native-image-picker';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// --- TYPE DEFINITIONS ---
interface AlumniRecord {
  id: number;
  admission_no: string;
  alumni_name: string;
  profile_pic_url?: string;
  dob?: string;
  pen_no?: string;
  phone_no?: string;
  aadhar_no?: string;
  parent_name?: string;
  parent_phone?: string;
  address?: string;
  school_joined_date?: string;
  school_joined_grade?: string;
  school_outgoing_date?: string;
  school_outgoing_grade?: string;
  tc_issued_date?: string;
  tc_number?: string;
  present_status?: string;
}

// --- HELPER FUNCTIONS ---
const formatDate = (dateString?: string): string => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  const userTimezoneOffset = date.getTimezoneOffset() * 60000;
  // ★★★★★★★★★★★★★★★★★★★★ FIX IS HERE ★★★★★★★★★★★★★★★★★★★★
  return new Date(date.getTime() + userTimezoneOffset).toLocaleDateString('en-GB', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  });
};

const toYYYYMMDD = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

// --- MAIN SCREEN COMPONENT ---
const AlumniScreen: React.FC = () => {
    const { token } = useAuth();
    const [alumniData, setAlumniData] = useState<AlumniRecord[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [currentItem, setCurrentItem] = useState<AlumniRecord | null>(null);
    const initialFormState: Partial<AlumniRecord> = {};
    const [formData, setFormData] = useState<Partial<AlumniRecord>>(initialFormState);
    const [selectedImage, setSelectedImage] = useState<Asset | null>(null);
    const [date, setDate] = useState(new Date());
    const [pickerTarget, setPickerTarget] = useState<keyof AlumniRecord | null>(null);
    const [expandedCardId, setExpandedCardId] = useState<number | null>(null); // State for expanded card

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE_URL}/api/alumni`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Failed to fetch alumni data.');
            const data = await response.json();
            setAlumniData(data);
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        if (token) {
            fetchData();
        }
    }, [token, fetchData]);
    
    const handleCardPress = (id: number) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpandedCardId(prevId => (prevId === id ? null : id));
    };

    const handleOpenModal = (item: AlumniRecord | null = null) => {
        setSelectedImage(null);
        if (item) {
            setIsEditing(true);
            setCurrentItem(item);
            setFormData(item);
        } else {
            setIsEditing(false);
            setCurrentItem(null);
            setFormData(initialFormState);
        }
        setModalVisible(true);
    };

    const handleChoosePhoto = () => {
        launchImageLibrary({ mediaType: 'photo', quality: 0.5 }, (response: ImagePickerResponse) => {
            if (response.didCancel) { console.log('User cancelled image picker');
            } else if (response.errorCode) { Alert.alert('ImagePicker Error', response.errorMessage || 'An error occurred');
            } else if (response.assets && response.assets.length > 0) { setSelectedImage(response.assets[0]); }
        });
    };

    const handleSave = async () => {
        if (!formData.admission_no || !formData.alumni_name) {
            return Alert.alert('Validation Error', 'Admission Number and Name are required.');
        }

        const processedData = { ...formData };
        const dateKeys: (keyof AlumniRecord)[] = ['dob', 'school_joined_date', 'school_outgoing_date', 'tc_issued_date'];
        dateKeys.forEach(key => {
            if (processedData[key]) {
                processedData[key] = toYYYYMMDD(new Date(processedData[key]));
            }
        });

        const url = isEditing ? `${API_BASE_URL}/api/alumni/${currentItem?.id}` : `${API_BASE_URL}/api/alumni`;
        const method = isEditing ? 'PUT' : 'POST';
        const data = new FormData();

        Object.keys(processedData).forEach(key => {
            const value = processedData[key as keyof AlumniRecord];
            if (value !== null && value !== undefined) {
                data.append(key, String(value));
            }
        });

        if (selectedImage && selectedImage.uri) {
            data.append('profile_pic', { uri: selectedImage.uri, type: selectedImage.type, name: selectedImage.fileName });
        }
        
        try {
            const response = await fetch(url, { method, headers: { Authorization: `Bearer ${token}` }, body: data });
            const resData = await response.json();
            if (!response.ok) throw new Error(resData.message || 'An error occurred during save.');
            Alert.alert('Success', resData.message || 'Record saved successfully.');
            setModalVisible(false);
            fetchData();
        } catch (error: any) {
            Alert.alert('Save Error', error.message);
        }
    };

    const handleDelete = (id: number) => {
        Alert.alert("Confirm Delete", "Are you sure you want to delete this record?", [
            { text: "Cancel", style: "cancel" },
            { text: "Delete", style: "destructive", onPress: async () => {
                try {
                    const response = await fetch(`${API_BASE_URL}/api/alumni/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
                    const resData = await response.json();
                    if (!response.ok) throw new Error(resData.message || 'Failed to delete record.');
                    Alert.alert("Success", resData.message || 'Record deleted.');
                    fetchData();
                } catch (error: any) {
                    Alert.alert('Delete Error', error.message);
                }
            }}
        ]);
    };

    const showDatePicker = (target: keyof AlumniRecord) => {
        const currentDate = formData[target] ? new Date(formData[target] as string) : new Date();
        setDate(currentDate);
        setPickerTarget(target);
    };

    const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
        setPickerTarget(null);
        if (event.type === 'set' && selectedDate && pickerTarget) {
            setFormData(prev => ({ ...prev, [pickerTarget]: toYYYYMMDD(selectedDate) }));
        }
    };
    
    if (loading) {
        return <View style={styles.center}><ActivityIndicator size="large" color="#00796B" /></View>;
    }

    return (
        <View style={styles.container}>
            <FlatList
                ListHeaderComponent={
                    <View style={styles.header}>
                        <View style={styles.headerIconContainer}>
                            <FontAwesome name="graduation-cap" size={24} color="#00796B" />
                        </View>
                        <View>
                            <Text style={styles.headerTitle}>Alumni Network</Text>
                            <Text style={styles.headerSubtitle}>Manage and view alumni records</Text>
                        </View>
                    </View>
                }
                data={alumniData}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <AlumniCardItem 
                        item={item} 
                        onEdit={handleOpenModal} 
                        onDelete={handleDelete}
                        isExpanded={expandedCardId === item.id}
                        onPress={() => handleCardPress(item.id)}
                    />
                )}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <MaterialIcons name="school" size={80} color="#CFD8DC" />
                    <Text style={styles.emptyText}>No Alumni Found</Text>
                    <Text style={styles.emptySubText}>Tap the '+' button to add a record.</Text>
                  </View>
                }
                contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
            />

            <TouchableOpacity style={styles.fab} onPress={() => handleOpenModal()}>
                <MaterialIcons name="add" size={24} color="#fff" />
            </TouchableOpacity>

            <Modal visible={modalVisible} animationType="slide" onRequestClose={() => setModalVisible(false)}>
                <ScrollView style={styles.modalContainer} contentContainerStyle={{paddingBottom: 50}}>
                    <Text style={styles.modalTitle}>{isEditing ? 'Edit Alumni Record' : 'Add New Alumni'}</Text>

                    <View style={styles.imagePickerContainer}>
                        <Image source={selectedImage?.uri ? { uri: selectedImage.uri } : (formData.profile_pic_url ? { uri: `${API_BASE_URL}${formData.profile_pic_url}` } : require('../../assets/profile.png'))} style={styles.profileImage} />
                        <TouchableOpacity style={styles.imagePickerButton} onPress={handleChoosePhoto}>
                            <FontAwesome name="camera" size={16} color="#fff" />
                            <Text style={styles.imagePickerButtonText}>Choose Photo</Text>
                        </TouchableOpacity>
                    </View>
                    
                    <Text style={styles.label}>Admission No*</Text>
                    <TextInput style={styles.input} value={formData.admission_no || ''} onChangeText={t => setFormData(p => ({...p, admission_no: t}))} />
                    <Text style={styles.label}>Alumni Name*</Text>
                    <TextInput style={styles.input} value={formData.alumni_name || ''} onChangeText={t => setFormData(p => ({...p, alumni_name: t}))} />
                    <Text style={styles.label}>Date of Birth</Text>
                    <TouchableOpacity onPress={() => showDatePicker('dob')} style={styles.input}><Text style={styles.dateText}>{formData.dob ? formatDate(formData.dob) : 'Select Date'}</Text></TouchableOpacity>
                    <Text style={styles.label}>Pen No</Text>
                    <TextInput style={styles.input} value={formData.pen_no || ''} onChangeText={t => setFormData(p => ({...p, pen_no: t}))} />
                    <Text style={styles.label}>Phone No</Text>
                    <TextInput style={styles.input} value={formData.phone_no || ''} onChangeText={t => setFormData(p => ({...p, phone_no: t}))} keyboardType="phone-pad" />
                    <Text style={styles.label}>Aadhar No</Text>
                    <TextInput style={styles.input} value={formData.aadhar_no || ''} onChangeText={t => setFormData(p => ({...p, aadhar_no: t}))} keyboardType="numeric" />
                    <Text style={styles.label}>Parent Name</Text>
                    <TextInput style={styles.input} value={formData.parent_name || ''} onChangeText={t => setFormData(p => ({...p, parent_name: t}))} />
                    <Text style={styles.label}>Parent No</Text>
                    <TextInput style={styles.input} value={formData.parent_phone || ''} onChangeText={t => setFormData(p => ({...p, parent_phone: t}))} keyboardType="phone-pad" />
                    <Text style={styles.label}>Address</Text>
                    <TextInput style={[styles.input, styles.textArea]} value={formData.address || ''} onChangeText={t => setFormData(p => ({...p, address: t}))} multiline />
                    <Text style={styles.label}>School Joined Date</Text>
                    <TouchableOpacity onPress={() => showDatePicker('school_joined_date')} style={styles.input}><Text style={styles.dateText}>{formData.school_joined_date ? formatDate(formData.school_joined_date) : 'Select Date'}</Text></TouchableOpacity>
                    <Text style={styles.label}>School Joined Grade</Text>
                    <TextInput style={styles.input} value={formData.school_joined_grade || ''} onChangeText={t => setFormData(p => ({...p, school_joined_grade: t}))} />
                    <Text style={styles.label}>School Outgoing Date</Text>
                    <TouchableOpacity onPress={() => showDatePicker('school_outgoing_date')} style={styles.input}><Text style={styles.dateText}>{formData.school_outgoing_date ? formatDate(formData.school_outgoing_date) : 'Select Date'}</Text></TouchableOpacity>
                    <Text style={styles.label}>School Outgoing Grade</Text>
                    <TextInput style={styles.input} value={formData.school_outgoing_grade || ''} onChangeText={t => setFormData(p => ({...p, school_outgoing_grade: t}))} />
                    <Text style={styles.label}>TC Issued Date</Text>
                    <TouchableOpacity onPress={() => showDatePicker('tc_issued_date')} style={styles.input}><Text style={styles.dateText}>{formData.tc_issued_date ? formatDate(formData.tc_issued_date) : 'Select Date'}</Text></TouchableOpacity>
                    <Text style={styles.label}>TC Number</Text>
                    <TextInput style={styles.input} value={formData.tc_number || ''} onChangeText={t => setFormData(p => ({...p, tc_number: t}))} />
                    <Text style={styles.label}>Present Status</Text>
                    <TextInput style={styles.input} value={formData.present_status || ''} onChangeText={t => setFormData(p => ({...p, present_status: t}))} placeholder="e.g., Software engineer, Doctor" />
                    
                    {pickerTarget && <DateTimePicker value={date} mode="date" display="default" onChange={onDateChange} />}
                    
                    <View style={styles.modalActions}>
                        <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setModalVisible(false)}><Text style={styles.modalButtonText}>Cancel</Text></TouchableOpacity>
                        <TouchableOpacity style={[styles.modalButton, styles.saveButton]} onPress={handleSave}><Text style={styles.modalButtonText}>Save</Text></TouchableOpacity>
                    </View>
                </ScrollView>
            </Modal>
        </View>
    );
};

// --- SUB-COMPONENTS ---
const AlumniCardItem = ({ item, onEdit, onDelete, isExpanded, onPress }) => (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
        <View style={styles.cardHeader}>
            <Image source={item.profile_pic_url ? { uri: `${API_BASE_URL}${item.profile_pic_url}` } : require('../../assets/profile.png')} style={styles.avatarImage} />
            <View style={styles.cardHeaderText}>
                <Text style={styles.cardTitle}>{item.alumni_name}</Text>
                <Text style={styles.cardSubtitle}>Admission No: {item.admission_no}</Text>
            </View>
            <View style={styles.cardActions}>
                 {item.present_status && <View style={styles.statusTag}><Text style={styles.statusTagText}>{item.present_status}</Text></View>}
                <View style={styles.buttonGroup}>
                    <TouchableOpacity onPress={() => onEdit(item)} style={styles.iconButton}><FontAwesome name="pencil" size={18} color="#FFA000" /></TouchableOpacity>
                    <TouchableOpacity onPress={() => onDelete(item.id)} style={styles.iconButton}><FontAwesome name="trash" size={18} color="#D32F2F" /></TouchableOpacity>
                </View>
            </View>
        </View>
        <View style={styles.cardBody}>
            <InfoRow icon="phone" label="Phone" value={item.phone_no || 'N/A'} />
            <InfoRow icon="calendar-plus-o" label="Joined" value={`${formatDate(item.school_joined_date)} (${item.school_joined_grade || 'N/A'})`} />
            <InfoRow icon="calendar-times-o" label="Left" value={`${formatDate(item.school_outgoing_date)} (${item.school_outgoing_grade || 'N/A'})`} />
        </View>
        {isExpanded && (
            <View style={styles.expandedContainer}>
                <InfoRow icon="birthday-cake" label="D.O.B" value={formatDate(item.dob)} />
                <InfoRow icon="id-card-o" label="Pen No" value={item.pen_no || 'N/A'} />
                <InfoRow icon="vcard" label="Aadhar" value={item.aadhar_no || 'N/A'} />
                <InfoRow icon="user" label="Parent" value={item.parent_name || 'N/A'} />
                <InfoRow icon="mobile" label="Parent No" value={item.parent_phone || 'N/A'} />
                <InfoRow icon="file-text-o" label="TC No" value={item.tc_number || 'N/A'} />
                <InfoRow icon="calendar-check-o" label="TC Issued" value={formatDate(item.tc_issued_date)} />
                <InfoRow icon="map-marker" label="Address" value={item.address || 'N/A'} isMultiLine={true} />
            </View>
        )}
    </TouchableOpacity>
);

const InfoRow = ({ icon, label, value, isMultiLine = false }) => (
    <View style={[styles.infoRow, isMultiLine && { alignItems: 'flex-start' }]}>
        <FontAwesome name={icon} size={15} color="#757575" style={[styles.infoIcon, isMultiLine && { marginTop: 3 }]} />
        <Text style={styles.infoLabel}>{label}:</Text>
        <Text style={styles.infoValue} numberOfLines={isMultiLine ? undefined : 1}>{value}</Text>
    </View>
);

// --- STYLESHEET ---
const styles = StyleSheet.create({
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F0F4F7' },
    container: { flex: 1, backgroundColor: '#F0F4F7' },
    header: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#FFFFFF', borderRadius: 12, marginVertical: 10, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, },
    headerIconContainer: { width: 45, height: 45, borderRadius: 22.5, backgroundColor: '#E0F2F1', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#004D40' },
    headerSubtitle: { fontSize: 14, color: '#00796B' },
    card: { backgroundColor: '#FFFFFF', borderRadius: 12, marginVertical: 8, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 4, overflow: 'hidden' },
    cardHeader: { flexDirection: 'row', alignItems: 'flex-start', padding: 16 },
    avatarImage: { width: 50, height: 50, borderRadius: 25, marginRight: 12, backgroundColor: '#E0E0E0' },
    cardHeaderText: { flex: 1, justifyContent: 'center', marginTop: 4 },
    cardTitle: { fontSize: 17, fontWeight: 'bold', color: '#212121' },
    cardSubtitle: { fontSize: 13, color: '#757575', marginTop: 2 },
    cardActions: { alignItems: 'flex-end' },
    buttonGroup: { flexDirection: 'row', marginTop: 8 },
    iconButton: { marginLeft: 16 },
    statusTag: { backgroundColor: '#4CAF50', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 15 },
    statusTagText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
    cardBody: { paddingHorizontal: 16, paddingBottom: 16, paddingTop: 0 },
    expandedContainer: { paddingHorizontal: 16, paddingBottom: 16, borderTopWidth: 1, borderTopColor: '#EEEEEE' },
    infoRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
    infoIcon: { width: 24, textAlign: 'center' },
    infoLabel: { fontSize: 14, fontWeight: '600', color: '#424242', marginLeft: 10 },
    infoValue: { fontSize: 14, color: '#757575', flex: 1, marginLeft: 5, flexWrap: 'wrap' },
    fab: { position: 'absolute', right: 25, bottom: 25, width: 56, height: 56, borderRadius: 28, backgroundColor: '#0288D1', justifyContent: 'center', alignItems: 'center', elevation: 8, shadowColor: '#000', shadowRadius: 5, shadowOpacity: 0.3 },
    emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: '30%', opacity: 0.6 },
    emptyText: { fontSize: 18, fontWeight: '600', color: '#78909C', marginTop: 16 },
    emptySubText: { fontSize: 14, color: '#78909C', marginTop: 4 },
    modalContainer: { flex: 1, backgroundColor: '#f9f9f9', paddingTop: Platform.OS === 'ios' ? 50 : 20, paddingHorizontal: 20 },
    modalTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 25, textAlign: 'center', color: '#212121' },
    label: { fontSize: 16, color: '#555', marginBottom: 8, marginTop: 12, fontWeight: '600' },
    input: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#CFD8DC', paddingVertical: 12, paddingHorizontal: 15, borderRadius: 8, marginBottom: 10, fontSize: 16, color: '#333' },
    dateText: { color: '#333', fontSize: 16, paddingVertical: 4 },
    textArea: { height: 100, textAlignVertical: 'top' },
    modalActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 30, marginBottom: 50 },
    modalButton: { paddingVertical: 14, borderRadius: 8, flex: 1, alignItems: 'center', elevation: 2 },
    cancelButton: { backgroundColor: '#9E9E9E', marginRight: 10 },
    saveButton: { backgroundColor: '#0288D1', marginLeft: 10 },
    modalButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
    imagePickerContainer: { alignItems: 'center', marginBottom: 20 },
    profileImage: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#E0E0E0', marginBottom: 10, borderWidth: 3, borderColor: '#0288D1' },
    imagePickerButton: { flexDirection: 'row', backgroundColor: '#0288D1', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8, alignItems: 'center' },
    imagePickerButtonText: { color: '#fff', marginLeft: 10, fontWeight: 'bold' },
});

export default AlumniScreen;