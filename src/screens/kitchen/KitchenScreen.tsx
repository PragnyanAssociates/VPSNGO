// 📂 File: src/screens/kitchen/KitchenScreen.tsx (MODIFIED & CORRECTED)

import React, { useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    Alert, ActivityIndicator, Image, SafeAreaView, Modal, TextInput
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'react-native-image-picker';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
// ★★★ 1. IMPORT apiClient, SERVER_URL AND REMOVE API_BASE_URL ★★★
import apiClient from '../../api/client';
import { SERVER_URL } from '../../../apiConfig';

const THEME = {
    primary: '#007bff', success: '#28a745', danger: '#dc3545',
    light: '#f8f9fa', background: '#FFFFFF', text: '#212529',
    muted: '#6c757d', border: '#dee2e6', dark: '#343a40'
};

const KitchenScreen = () => {
    const [activeTab, setActiveTab] = useState('Daily');
    const [provisions, setProvisions] = useState([]);
    const [usage, setUsage] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [permanentInventory, setPermanentInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [modalInfo, setModalInfo] = useState({ mode: '', item: null });

    const fetchData = useCallback(() => {
        setLoading(true);
        const dateString = selectedDate.toISOString().split('T')[0];
        // ★★★ 2. USE apiClient FOR ALL FETCH CALLS ★★★
        const dailyProvisionsFetch = apiClient.get('/kitchen/inventory');
        const dailyUsageFetch = apiClient.get(`/kitchen/usage?date=${dateString}`);
        const permanentInventoryFetch = apiClient.get('/permanent-inventory');

        Promise.all([dailyProvisionsFetch, dailyUsageFetch, permanentInventoryFetch])
            .then(([provisionsRes, usageRes, permanentRes]) => {
                setProvisions(provisionsRes.data || []);
                setUsage(usageRes.data || []);
                setPermanentInventory(permanentRes.data || []);
            })
            .catch((err) => Alert.alert("Error", err.response?.data?.message || "Could not fetch kitchen data."))
            .finally(() => setLoading(false));
    }, [selectedDate]);

    useFocusEffect(fetchData);

    const openModal = (mode, item = null) => {
        setModalInfo({ mode, item });
        setIsModalVisible(true);
    };

    const handleModalSuccess = () => {
        setIsModalVisible(false);
        fetchData();
    };

    const handleDeletePermanentItem = (item) => {
        Alert.alert( `Delete "${item.item_name}"`, "Are you sure you want to permanently delete this item?",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Delete", style: "destructive", onPress: async () => {
                    try {
                        await apiClient.delete(`/permanent-inventory/${item.id}`);
                        Alert.alert("Success", "Item deleted.");
                        fetchData();
                    } catch (error: any) {
                        Alert.alert("Error", error.response?.data?.message || "Could not delete the item.");
                    }
                }}
            ]
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => activeTab === 'Daily' && setShowDatePicker(true)} disabled={activeTab !== 'Daily'}>
                    <MaterialCommunityIcons name="calendar" size={26} color={activeTab === 'Daily' ? THEME.primary : THEME.border} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Kitchen</Text>
                <TouchableOpacity onPress={() => openModal(activeTab === 'Daily' ? 'addProvision' : 'addPermanentItem')}>
                    <MaterialCommunityIcons name="plus" size={28} color={THEME.primary} />
                </TouchableOpacity>
            </View>
            <View style={styles.tabContainer}>
                <TouchableOpacity style={[styles.tab, activeTab === 'Daily' && styles.activeTab]} onPress={() => setActiveTab('Daily')}><Text style={[styles.tabText, activeTab === 'Daily' && styles.activeTabText]}>Daily</Text></TouchableOpacity>
                <TouchableOpacity style={[styles.tab, activeTab === 'Inventory' && styles.activeTab]} onPress={() => setActiveTab('Inventory')}><Text style={[styles.tabText, activeTab === 'Inventory' && styles.activeTabText]}>Inventory</Text></TouchableOpacity>
            </View>

            {loading ? <ActivityIndicator size="large" color={THEME.primary} style={{ marginTop: 50 }} /> :
                <ScrollView>
                    {activeTab === 'Daily' ? (
                        <>
                            <Section title="Daily Usage" date={selectedDate.toLocaleDateString()}>
                                {usage.length > 0 ? <DataTable type="usage" data={usage} /> : <Text style={styles.emptyText}>No items used on this date.</Text>}
                            </Section>
                            <Section title="Remaining Provisions">
                                {provisions.length > 0 ? <DataTable type="provisions" data={provisions} onLogUsage={(item) => openModal('logUsage', item)} /> : <Text style={styles.emptyText}>No provisions remaining.</Text>}
                            </Section>
                        </>
                    ) : (
                        <Section title="Permanent Assets">
                            {permanentInventory.length > 0 ?
                                <DataTable type="permanent" data={permanentInventory} onEdit={(item) => openModal('editPermanentItem', item)} onDelete={handleDeletePermanentItem} />
                                : <Text style={styles.emptyText}>No permanent items found. Tap '+' to add one.</Text>}
                        </Section>
                    )}
                </ScrollView>
            }
            {isModalVisible && <ActionModal info={modalInfo} visible={isModalVisible} onClose={() => setIsModalVisible(false)} onSuccess={handleModalSuccess} />}
            {showDatePicker && <DateTimePicker value={selectedDate} mode="date" display="default" onChange={(e, date) => { setShowDatePicker(false); if (date) setSelectedDate(date); }} />}
        </SafeAreaView>
    );
};

const DataTable = ({ type, data, onLogUsage, onEdit, onDelete }) => (
    <View style={styles.table}>
        <View style={[styles.tableRow, styles.tableHeaderRow]}>
            <Text style={[styles.tableHeader, { flex: 0.4 }]}>#</Text>
            <Text style={[styles.tableHeader, { flex: 2 }]}>Item Name</Text>
            <Text style={[styles.tableHeader, { flex: 1, textAlign: 'center' }]}>{type === 'usage' ? 'Used' : 'Total'}</Text>
            {type === 'permanent' && <Text style={[styles.tableHeader, { flex: 1.2, textAlign: 'right' }]}>Actions</Text>}
        </View>

        {data.map((item, index) => (
            <View key={`${type}-${item.id}`} style={styles.tableRow}>
                <Text style={[styles.tableCell, { flex: 0.4 }]}>{index + 1}</Text>
                <TouchableOpacity style={[styles.tableCell, { flex: 2, flexDirection: 'row', alignItems: 'center' }]} onPress={() => type === 'provisions' && onLogUsage(item)} disabled={type !== 'provisions'}>
                    {/* ★★★ 3. USE SERVER_URL for images ★★★ */}
                    {item.image_url ?
                        <Image source={{ uri: `${SERVER_URL}${item.image_url}` }} style={styles.itemImage} />
                        : <View style={[styles.itemImage, styles.imagePlaceholder]}><MaterialCommunityIcons name="image-off-outline" size={20} color={THEME.muted} /></View>
                    }
                    <Text style={styles.itemName} numberOfLines={1}>{item.item_name}</Text>
                </TouchableOpacity>
                <Text style={[styles.tableCell, { flex: 1, textAlign: 'center' }]}>{type === 'usage' ? `${item.quantity_used} ${item.unit}` : type === 'provisions' ? `${item.quantity_remaining} ${item.unit}` : `${item.total_quantity}`}</Text>
                {type === 'permanent' && (
                    <View style={[styles.tableCell, { flex: 1.2, flexDirection: 'row', justifyContent: 'flex-end' }]}>
                        <TouchableOpacity onPress={() => onEdit(item)} style={styles.actionIcon}><MaterialCommunityIcons name="pencil-outline" size={22} color={THEME.primary} /></TouchableOpacity>
                        <TouchableOpacity onPress={() => onDelete(item)} style={styles.actionIcon}><MaterialCommunityIcons name="trash-can-outline" size={22} color={THEME.danger} /></TouchableOpacity>
                    </View>
                )}
            </View>
        ))}
    </View>
);

const Section = ({ title, date, children }) => (
    <View style={styles.section}>
        <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>{title}</Text>{date && <Text style={styles.sectionDate}>{date}</Text>}</View>
        {children}
    </View>
);

const ActionModal = ({ info, visible, onClose, onSuccess }) => {
    const { mode, item } = info;
    const [itemName, setItemName] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [notes, setNotes] = useState('');
    const [unit, setUnit] = useState('g');
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const UNITS = ['g', 'kg', 'l', 'ml', 'pcs'];

    React.useEffect(() => {
        if (visible) {
            setItemName(item?.item_name || '');
            setUnit(item?.unit || 'g');
            setNotes(item?.notes || '');
            setQuantity(item?.total_quantity || item?.quantity_remaining || 1);
            setImage(null);
            setLoading(false);
        }
    }, [visible, mode, item]);

    const handleChooseImage = () => {
        ImagePicker.launchImageLibrary({ mediaType: 'photo', quality: 0.7 }, res => { if (res.assets && res.assets[0]) setImage(res.assets[0]); });
    };

    const handleAction = async () => {
        if (!itemName.trim() && mode !== 'logUsage') { return Alert.alert("Validation Error", "Item Name is required."); }
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('itemName', itemName);
            if (image) { formData.append('itemImage', { uri: image.uri, type: image.type, name: image.fileName }); }
            
            switch (mode) {
                case 'addProvision':
                    formData.append('quantity', quantity);
                    formData.append('unit', unit);
                    await apiClient.post('/kitchen/inventory', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
                    break;
                case 'addPermanentItem':
                    formData.append('totalQuantity', quantity);
                    formData.append('notes', notes);
                    await apiClient.post('/permanent-inventory', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
                    break;
                case 'editPermanentItem':
                     formData.append('totalQuantity', quantity);
                     formData.append('notes', notes);
                     await apiClient.put(`/permanent-inventory/${item.id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
                     break;
                case 'logUsage':
                    await apiClient.post('/kitchen/usage', { inventoryId: item.id, quantityUsed: quantity, usageDate: new Date().toISOString().split('T')[0] });
                    break;
                default:
                    setLoading(false);
                    return;
            }
            onSuccess();
        } catch (e: any) {
            Alert.alert("Error", e.response?.data?.message || "An unknown server error.");
        } finally {
            setLoading(false);
        }
    };
    
    // UI rendering logic for the modal remains the same
    const getTitle = () => {
        switch (mode) {
            case 'addProvision': return 'Add New Provision';
            case 'logUsage': return `Log Usage for ${item.item_name}`;
            case 'addPermanentItem': return 'Add Permanent Item';
            case 'editPermanentItem': return 'Edit Permanent Item';
            default: return 'Action';
        }
    };
    const getButtonText = () => {
        switch (mode) {
            case 'addProvision': return 'Add Provision';
            case 'logUsage': return 'Log Usage';
            case 'addPermanentItem': return 'Add Item';
            case 'editPermanentItem': return 'Save Changes';
            default: return 'Save';
        }
    };
    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View style={styles.modalContainer}>
                <ScrollView contentContainerStyle={styles.modalScrollContainer} keyboardShouldPersistTaps="handled">
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>{getTitle()}</Text>
                        {mode === 'addProvision' && ( <>
                            <TextInput style={styles.input} placeholder="Item Name (e.g., Tomatoes)" value={itemName} onChangeText={setItemName} />
                            <Text style={styles.inputLabel}>Unit</Text>
                            <View style={styles.unitSelector}>{UNITS.map(u => (<TouchableOpacity key={u} style={[styles.unitButton, unit === u && styles.unitButtonSelected]} onPress={() => setUnit(u)}><Text style={[styles.unitButtonText, unit === u && styles.unitButtonTextSelected]}>{u}</Text></TouchableOpacity>))}</View>
                            <TouchableOpacity style={styles.imagePicker} onPress={handleChooseImage}>{image ? <Image source={{uri: image.uri}} style={styles.previewImage} /> : <><MaterialCommunityIcons name="camera-plus-outline" size={32} color={THEME.muted}/><Text style={styles.imagePickerText}>Select Item Image (Optional)</Text></>}</TouchableOpacity>
                            <Text style={styles.quantityLabel}>Initial Quantity</Text>
                            <View style={styles.quantityControl}><TouchableOpacity onPress={() => setQuantity(q => Math.max(1, q - 1))} style={styles.quantityButton}><MaterialCommunityIcons name="minus" size={28} color={THEME.primary} /></TouchableOpacity><TextInput style={styles.quantityInput} value={String(quantity)} onChangeText={text => setQuantity(Number(text) || 1)} keyboardType="numeric" /><TouchableOpacity onPress={() => setQuantity(q => q + 1)} style={styles.quantityButton}><MaterialCommunityIcons name="plus" size={28} color={THEME.primary} /></TouchableOpacity></View>
                        </>)}

                        {(mode === 'addPermanentItem' || mode === 'editPermanentItem') && ( <>
                            <TextInput style={styles.input} placeholder="Item Name (e.g., Plates)" value={itemName} onChangeText={setItemName} />
                            <TouchableOpacity style={styles.imagePicker} onPress={handleChooseImage}>
                                {image ? <Image source={{uri: image.uri}} style={styles.previewImage} /> : 
                                 item?.image_url ? <Image source={{uri: `${SERVER_URL}${item.image_url}`}} style={styles.previewImage} /> :
                                 <><MaterialCommunityIcons name="camera-plus-outline" size={32} color={THEME.muted}/><Text style={styles.imagePickerText}>{mode === 'editPermanentItem' ? 'Change Image (Optional)' : 'Select Image (Optional)'}</Text></>}
                            </TouchableOpacity>
                            <Text style={styles.quantityLabel}>Total Quantity</Text>
                            <View style={styles.quantityControl}><TouchableOpacity onPress={() => setQuantity(q => Math.max(1, q - 1))} style={styles.quantityButton}><MaterialCommunityIcons name="minus" size={28} color={THEME.primary} /></TouchableOpacity><TextInput style={styles.quantityInput} value={String(quantity)} onChangeText={text => setQuantity(Number(text.replace(/[^0-9]/g, '')) || 1)} keyboardType="numeric" /><TouchableOpacity onPress={() => setQuantity(q => q + 1)} style={styles.quantityButton}><MaterialCommunityIcons name="plus" size={28} color={THEME.primary} /></TouchableOpacity></View>
                            <TextInput style={[styles.input, { height: 80, textAlignVertical: 'top' }]} multiline placeholder="Notes (e.g., 'In top cabinet')" value={notes} onChangeText={setNotes} />
                        </>)}
                        
                        {mode === 'logUsage' && ( <>
                            <Text style={styles.quantityLabel}>{`Quantity Used (${item.unit})`}</Text>
                            <View style={styles.quantityControl}><TouchableOpacity onPress={() => setQuantity(q => Math.max(1, q - 1))} style={styles.quantityButton}><MaterialCommunityIcons name="minus" size={28} color={THEME.primary} /></TouchableOpacity><TextInput style={styles.quantityInput} value={String(quantity)} onChangeText={text => setQuantity(Number(text) || 1)} keyboardType="numeric" /><TouchableOpacity onPress={() => setQuantity(q => q + 1)} style={styles.quantityButton}><MaterialCommunityIcons name="plus" size={28} color={THEME.primary} /></TouchableOpacity></View>
                        </>)}

                        <TouchableOpacity style={styles.actionButton} onPress={handleAction} disabled={loading}>{loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.actionButtonText}>{getButtonText()}</Text>}</TouchableOpacity>
                        <TouchableOpacity onPress={onClose}><Text style={styles.cancelText}>Cancel</Text></TouchableOpacity>
                    </View>
                </ScrollView>
            </View>
        </Modal>
    );
};

// Styles remain unchanged
const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: THEME.background }, header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderBottomColor: THEME.border }, headerTitle: { fontSize: 22, fontWeight: 'bold', color: THEME.dark }, tabContainer: { flexDirection: 'row', backgroundColor: THEME.light, padding: 4, marginHorizontal: 15, marginTop: 15, borderRadius: 12 }, tab: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center' }, activeTab: { backgroundColor: THEME.primary, elevation: 2, shadowColor: '#000', shadowOpacity: 0.1 }, tabText: { fontSize: 16, fontWeight: '600', color: THEME.primary }, activeTabText: { color: '#FFFFFF' }, section: { paddingHorizontal: 15, paddingTop: 20, paddingBottom: 20 }, sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }, sectionTitle: { fontSize: 20, fontWeight: 'bold', color: THEME.dark }, sectionDate: { fontSize: 14, color: THEME.muted }, emptyText: { color: THEME.muted, textAlign: 'center', paddingVertical: 40, fontSize: 16 }, table: { backgroundColor: THEME.background, borderRadius: 12, borderWidth: 1, borderColor: THEME.border, overflow: 'hidden' }, tableRow: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: THEME.border, paddingHorizontal: 10, minHeight: 55 }, tableHeaderRow: { backgroundColor: THEME.light, borderBottomWidth: 2, minHeight: 45 }, tableCell: { fontSize: 15, color: THEME.text, paddingHorizontal: 4, alignItems: 'center' }, tableHeader: { fontWeight: 'bold', color: THEME.dark, fontSize: 16 }, itemImage: { width: 40, height: 40, borderRadius: 8, marginRight: 12 }, imagePlaceholder: { backgroundColor: THEME.light, justifyContent: 'center', alignItems: 'center', width: 40, height: 40, borderRadius: 8, marginRight: 12 }, itemName: { fontWeight: '500', color: THEME.text, flex: 1 }, actionIcon: { padding: 6 }, modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)' }, modalScrollContainer: { flexGrow: 1, justifyContent: 'center', width: '100%', paddingVertical: 20 }, modalContent: { width: '90%', alignSelf: 'center', backgroundColor: THEME.background, padding: 25, borderRadius: 15, elevation: 10 }, modalTitle: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 25, color: THEME.dark }, input: { borderWidth: 1, borderColor: THEME.border, backgroundColor: THEME.light, borderRadius: 10, paddingVertical: 14, paddingHorizontal: 16, marginBottom: 20, fontSize: 16 }, inputLabel: { fontSize: 16, color: THEME.muted, marginBottom: 10, marginLeft: 4, fontWeight: '500' }, unitSelector: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 }, unitButton: { flex: 1, paddingVertical: 12, borderWidth: 1.5, borderColor: THEME.border, borderRadius: 10, alignItems: 'center', marginHorizontal: 4 }, unitButtonSelected: { backgroundColor: THEME.primary, borderColor: THEME.primary }, unitButtonText: { color: THEME.primary, fontWeight: '600' }, unitButtonTextSelected: { color: '#fff' }, imagePicker: { height: 120, borderWidth: 2, borderColor: THEME.border, borderStyle: 'dashed', borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 25, backgroundColor: THEME.light, overflow: 'hidden' }, imagePickerText: { marginTop: 8, color: THEME.muted }, previewImage: { width: '100%', height: '100%', borderRadius: 8 }, quantityLabel: { textAlign: 'center', fontSize: 16, color: THEME.muted, marginBottom: 12, fontWeight: '500' }, quantityControl: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginVertical: 10, marginBottom: 20 }, quantityButton: { backgroundColor: THEME.light, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: THEME.border }, quantityInput: { borderWidth: 1, borderColor: THEME.border, borderRadius: 10, width: 80, textAlign: 'center', fontSize: 22, fontWeight: 'bold', marginHorizontal: 15, paddingVertical: 10 }, actionButton: { backgroundColor: THEME.primary, padding: 16, borderRadius: 10, alignItems: 'center', marginTop: 20, marginBottom: 12 }, actionButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }, cancelText: { textAlign: 'center', color: THEME.muted, padding: 10, fontSize: 16 }});
export default KitchenScreen;