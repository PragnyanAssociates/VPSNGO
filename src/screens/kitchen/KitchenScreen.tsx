// 📂 File: src/screens/kitchen/KitchenScreen.tsx (COMPLETE AND FINAL WITH UI/UX UPGRADE)

import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Image, SafeAreaView, Modal, TextInput } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'react-native-image-picker';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { API_BASE_URL } from '../../../apiConfig'; // Make sure this path is correct

const THEME = { primary: '#007bff', success: '#28a745', light: '#f8f9fa', background: '#FFFFFF', text: '#212529', muted: '#6c757d', border: '#dee2e6', dark: '#343a40' };

// --- Main Screen Component (No changes) ---
const KitchenScreen = () => {
    const [inventory, setInventory] = useState([]);
    const [usage, setUsage] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [modalMode, setModalMode] = useState('logUsage');
    const [selectedItem, setSelectedItem] = useState(null);

    const fetchData = useCallback(() => {
        setLoading(true);
        const dateString = selectedDate.toISOString().split('T')[0];
        Promise.all([
            fetch(`${API_BASE_URL}/api/kitchen/inventory`).then(res => res.json()),
            fetch(`${API_BASE_URL}/api/kitchen/usage?date=${dateString}`).then(res => res.json())
        ]).then(([inventoryData, usageData]) => {
            setInventory(inventoryData || []);
            setUsage(usageData || []);
        }).catch(() => Alert.alert("Error", "Could not fetch kitchen data."))
        .finally(() => setLoading(false));
    }, [selectedDate]);

    useFocusEffect(fetchData);

    const onDateChange = (event, date) => {
        setShowDatePicker(false);
        if (date) setSelectedDate(date);
    };

    const openModal = (mode, item = null) => {
        setModalMode(mode);
        setSelectedItem(item);
        setIsModalVisible(true);
    };

    const handleModalSuccess = () => {
        setIsModalVisible(false);
        fetchData();
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => setShowDatePicker(true)}><MaterialCommunityIcons name="calendar" size={26} color={THEME.primary} /></TouchableOpacity>
                <Text style={styles.headerTitle}>Kitchen</Text>
                <TouchableOpacity onPress={() => openModal('addInventory')}><MaterialCommunityIcons name="plus" size={28} color={THEME.primary} /></TouchableOpacity>
            </View>
            {loading ? <ActivityIndicator size="large" style={{marginTop: 50}}/> :
            <ScrollView>
                <Section title="Daily Usage" date={selectedDate.toLocaleDateString()}>
                    {usage.map(item => <ItemCard key={`usage-${item.id}`} item={item} type="usage" />)}
                    {usage.length === 0 && <Text style={styles.emptyText}>No items used on this date.</Text>}
                </Section>
                <Section title="Remaining Provisions">
                    {inventory.map(item => <ItemCard key={`inv-${item.id}`} item={item} type="inventory" onLogUsage={() => openModal('logUsage', item)} />)}
                    {inventory.length === 0 && <Text style={styles.emptyText}>No provisions remaining.</Text>}
                </Section>
            </ScrollView>
            }
            {isModalVisible && <ActionModal mode={modalMode} item={selectedItem} visible={isModalVisible} onClose={() => setIsModalVisible(false)} onSuccess={handleModalSuccess} />}
            {showDatePicker && <DateTimePicker value={selectedDate} mode="date" display="default" onChange={onDateChange} />}
        </SafeAreaView>
    );
};

// --- Helper Components (No changes) ---
const Section = ({ title, date, children }) => (
    <View style={styles.section}><View style={styles.sectionHeader}><Text style={styles.sectionTitle}>{title}</Text>{date && <Text style={styles.sectionDate}>{date}</Text>}</View>{children}</View>
);
const ItemCard = ({ item, type, onLogUsage }) => {
    const imageUrl = item.image_url ? `${API_BASE_URL}${item.image_url}` : null;
    return (
        <TouchableOpacity style={styles.itemCard} onPress={onLogUsage} disabled={type !== 'inventory'}>
            {imageUrl ? <Image source={{ uri: imageUrl }} style={styles.itemImage} /> : <View style={[styles.itemImage, styles.imagePlaceholder]}><MaterialCommunityIcons name="image-off-outline" size={24} color={THEME.muted} /></View>}
            <View style={styles.itemDetails}><Text style={styles.itemName}>{item.item_name}</Text><Text style={styles.itemQuantity}>{type === 'usage' ? `${item.quantity_used} ${item.unit} used` : `${item.quantity_remaining} ${item.unit} remaining`}</Text></View>
            {type === 'inventory' && <MaterialCommunityIcons name="plus-circle-outline" size={24} color={THEME.primary} />}
        </TouchableOpacity>
    );
};

// --- Action Modal Component (No logic changes, only styles are affected) ---
const ActionModal = ({ mode, item, visible, onClose, onSuccess }) => {
    const [quantity, setQuantity] = useState(1);
    const [itemName, setItemName] = useState('');
    const [unit, setUnit] = useState('g');
    const [loading, setLoading] = useState(false);
    const [image, setImage] = useState(null);
    const UNITS = ['g', 'kg', 'l', 'ml', 'pcs'];

    React.useEffect(() => {
        if (visible && mode === 'addInventory') { setItemName(''); setUnit('g'); setQuantity(1); setImage(null); }
        else if (visible && mode === 'logUsage') { setQuantity(1); }
    }, [visible, mode]);

    const handleChooseImage = () => { ImagePicker.launchImageLibrary({ mediaType: 'photo' }, res => { if (res.assets && res.assets[0]) setImage(res.assets[0]); }); };
    const handleAction = async () => {
        setLoading(true);
        let url = ''; let body; let headers = {'Content-Type': 'application/json'};
        if (mode === 'logUsage') {
            url = `${API_BASE_URL}/api/kitchen/usage`;
            body = JSON.stringify({ inventoryId: item.id, quantityUsed: quantity, usageDate: new Date().toISOString().split('T')[0] });
        } else {
            if (!itemName.trim() || !unit.trim()) { Alert.alert("Error", "Item Name and Unit are required."); setLoading(false); return; }
            url = `${API_BASE_URL}/api/kitchen/inventory`;
            const formData = new FormData();
            formData.append('itemName', itemName); formData.append('quantity', quantity); formData.append('unit', unit);
            if (image) formData.append('itemImage', { uri: image.uri, type: image.type, name: image.fileName });
            body = formData; headers = {'Content-Type': 'multipart/form-data'};
        }
        try {
            const res = await fetch(url, { method: 'POST', headers, body });
            const result = await res.json();
            if (res.ok) onSuccess(); else throw new Error(result.message);
        } catch (e: any) { Alert.alert("Error", e.message); }
        finally { setLoading(false); }
    };

    return (
        <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose}>
            <View style={styles.modalContainer}>
                <ScrollView contentContainerStyle={styles.modalScrollContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>{mode === 'logUsage' ? `Log Usage for ${item.item_name}` : 'Add New Item to Inventory'}</Text>
                        
                        {mode === 'addInventory' && (
                            <>
                                <TextInput style={styles.input} placeholder="Item Name (e.g., Tomatoes)" value={itemName} onChangeText={setItemName} placeholderTextColor={THEME.muted}/>
                                <Text style={styles.inputLabel}>Unit</Text>
                                <View style={styles.unitSelector}>
                                    {UNITS.map(u => (<TouchableOpacity key={u} style={[styles.unitButton, unit === u && styles.unitButtonSelected]} onPress={() => setUnit(u)}><Text style={[styles.unitButtonText, unit === u && styles.unitButtonTextSelected]}>{u}</Text></TouchableOpacity>))}
                                </View>
                                <TouchableOpacity style={styles.imagePicker} onPress={handleChooseImage}>
                                    {image ? <Image source={{uri: image.uri}} style={styles.previewImage} /> : <><MaterialCommunityIcons name="camera-plus-outline" size={32} color={THEME.muted}/><Text style={styles.imagePickerText}>Select Item Image (Optional)</Text></>}
                                </TouchableOpacity>
                            </>
                        )}

                        <Text style={styles.quantityLabel}>{mode === 'logUsage' ? `Quantity Used (${item.unit})` : 'Initial Quantity'}</Text>
                        <View style={styles.quantityControl}>
                            <TouchableOpacity onPress={() => setQuantity(q => Math.max(0, q - 1))} style={styles.quantityButton}><MaterialCommunityIcons name="minus" size={28} color={THEME.primary} /></TouchableOpacity>
                            <TextInput style={styles.quantityInput} value={String(quantity)} onChangeText={text => setQuantity(Number(text) || 0)} keyboardType="numeric" />
                            <TouchableOpacity onPress={() => setQuantity(q => q + 1)} style={styles.quantityButton}><MaterialCommunityIcons name="plus" size={28} color={THEME.primary} /></TouchableOpacity>
                        </View>

                        <TouchableOpacity style={styles.actionButton} onPress={handleAction} disabled={loading}>
                            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.actionButtonText}>{mode === 'logUsage' ? 'Log Usage' : 'Add Item'}</Text>}
                        </TouchableOpacity>
                        <TouchableOpacity onPress={onClose}><Text style={styles.cancelText}>Cancel</Text></TouchableOpacity>
                    </View>
                </ScrollView>
            </View>
        </Modal>
    );
};

// --- STYLES (COMPLETELY OVERHAULED FOR BETTER UI/UX) ---
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: THEME.light },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, backgroundColor: THEME.background, borderBottomWidth: 1, borderBottomColor: THEME.border },
    headerTitle: { fontSize: 22, fontWeight: 'bold', color: THEME.dark },
    section: { paddingHorizontal: 15, paddingTop: 20 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    sectionTitle: { fontSize: 20, fontWeight: 'bold', color: THEME.dark },
    sectionDate: { fontSize: 14, color: THEME.muted },
    itemCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: THEME.background, padding: 12, borderRadius: 12, marginBottom: 10, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3 },
    itemImage: { width: 60, height: 60, borderRadius: 8, marginRight: 15, backgroundColor: THEME.light },
    imagePlaceholder: { justifyContent: 'center', alignItems: 'center' },
    itemDetails: { flex: 1 },
    itemName: { fontSize: 17, fontWeight: '600', color: THEME.text },
    itemQuantity: { fontSize: 14, color: THEME.muted, marginTop: 4 },
    emptyText: { color: THEME.muted, textAlign: 'center', paddingVertical: 20, fontSize: 16 },

    // --- MODAL STYLES (UPGRADED) ---
    modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)' },
    modalScrollContainer: { flexGrow: 1, justifyContent: 'center', width: '100%', paddingVertical: 20 },
    modalContent: { width: '90%', alignSelf: 'center', backgroundColor: THEME.background, padding: 25, borderRadius: 15, elevation: 10, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 10 },
    modalTitle: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 25, color: THEME.dark },
    
    input: { borderWidth: 1, borderColor: THEME.border, backgroundColor: THEME.light, borderRadius: 10, paddingVertical: 14, paddingHorizontal: 16, marginBottom: 20, fontSize: 16 },
    inputLabel: { fontSize: 16, color: THEME.muted, marginBottom: 10, marginLeft: 4, fontWeight: '500' },
    
    unitSelector: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
    unitButton: { flex: 1, paddingVertical: 12, borderWidth: 1.5, borderColor: THEME.border, borderRadius: 10, alignItems: 'center', marginHorizontal: 4 },
    unitButtonSelected: { backgroundColor: THEME.primary, borderColor: THEME.primary },
    unitButtonText: { color: THEME.primary, fontWeight: '600' },
    unitButtonTextSelected: { color: '#fff' },
    
    imagePicker: { height: 120, borderWidth: 2, borderColor: THEME.border, borderStyle: 'dashed', borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 25, backgroundColor: THEME.light },
    imagePickerText: { marginTop: 8, color: THEME.muted },
    previewImage: { width: '100%', height: '100%', borderRadius: 8 },

    quantityLabel: { textAlign: 'center', fontSize: 16, color: THEME.muted, marginBottom: 12, fontWeight: '500' },
    quantityControl: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginVertical: 10 },
    quantityButton: { backgroundColor: THEME.light, padding: 12, borderRadius: 10 },
    quantityInput: { borderWidth: 1, borderColor: THEME.border, borderRadius: 10, width: 100, textAlign: 'center', fontSize: 24, fontWeight: 'bold', marginHorizontal: 15, paddingVertical: 10 },
    
    actionButton: { backgroundColor: THEME.primary, padding: 16, borderRadius: 10, alignItems: 'center', marginTop: 30, marginBottom: 12 },
    actionButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    cancelText: { textAlign: 'center', color: THEME.muted, padding: 10, fontSize: 16 },
});

export default KitchenScreen;