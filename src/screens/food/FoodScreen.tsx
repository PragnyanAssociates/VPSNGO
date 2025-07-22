// 📂 File: src/screens/food/FoodScreen.tsx (COMPLETE, UNABRIDGED, AND FINAL)

import React, { useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    Alert, ActivityIndicator, SafeAreaView, Modal, TextInput
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../../apiConfig';

// --- THEME CONSTANTS ---
const THEME = {
    primary: '#007bff',
    danger: '#dc3545',
    light: '#f8f9fa',
    background: '#f4f7fc',
    text: '#212529',
    muted: '#86909c',
    border: '#e9ecef', // A lighter border for a softer grid
    dark: '#343a40',
};

const ORDERED_DAYS = [
    { full: 'Monday', short: 'Mon' }, { full: 'Tuesday', short: 'Tue' }, { full: 'Wednesday', short: 'Wed' },
    { full: 'Thursday', short: 'Thu' }, { full: 'Friday', short: 'Fri' }, { full: 'Saturday', short: 'Sat' },
    { full: 'Sunday', short: 'Sun' },
];

const MEAL_TYPES = ['Tiffin', 'Lunch', 'Snacks', 'Dinner'];

// =================================================================================
// --- MAIN SCREEN COMPONENT ---
// =================================================================================
const FoodScreen = () => {
    const { user } = useAuth();
    const [menuData, setMenuData] = useState({});
    const [loading, setLoading] = useState(true);
    const [modalInfo, setModalInfo] = useState({ visible: false, mode: null, data: null });

    const fetchMenu = useCallback(() => {
        setLoading(true);
        fetch(`${API_BASE_URL}/api/food-menu`)
            .then(res => res.ok ? res.json() : Promise.reject('Failed to fetch'))
            .then(data => setMenuData(data))
            .catch(() => Alert.alert("Error", "Could not fetch the food menu."))
            .finally(() => setLoading(false));
    }, []);

    useFocusEffect(fetchMenu);

    const openModal = (mode, data) => setModalInfo({ visible: true, mode, data });
    const closeModal = () => setModalInfo({ visible: false, mode: null, data: null });

    const handleSave = (values) => {
        if (!user) return;
        const { mode, data } = modalInfo;
        
        let url = '';
        let body = {};

        if (mode === 'editFood') {
            url = `${API_BASE_URL}/api/food-menu/${data.id}`;
            body = { food_item: values.food_item, editorId: user.id };
        } else if (mode === 'editTime') {
            url = `${API_BASE_URL}/api/food-menu/time`;
            body = { meal_type: data.meal_type, meal_time: values.meal_time, editorId: user.id };
        } else {
            return;
        }

        const originalData = JSON.parse(JSON.stringify(menuData));
        
        if (mode === 'editFood') {
             const updated = { ...menuData };
             updated[data.day_of_week] = updated[data.day_of_week].map(m => m.id === data.id ? { ...m, food_item: values.food_item } : m);
             setMenuData(updated);
        }
        
        closeModal();

        fetch(url, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        })
        .then(async res => {
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || "An error occurred.");
            }
            if (mode === 'editTime') {
                fetchMenu();
            }
        })
        .catch((error) => {
            Alert.alert("Error", error.message);
            setMenuData(originalData);
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}><Text style={styles.headerTitle}>Weekly Food Menu</Text></View>
            {loading ? <ActivityIndicator size="large" color={THEME.primary} style={{ marginTop: 50 }} /> :
                <ScrollView contentContainerStyle={styles.scrollContainer}>
                    <FoodMenuTable 
                        menuData={menuData} 
                        isAdmin={user?.role === 'admin'} 
                        onEditFood={meal => openModal('editFood', meal)} 
                        onEditTime={type => openModal('editTime', type)} 
                    />
                </ScrollView>
            }
            {modalInfo.visible && <EditMenuModal modalInfo={modalInfo} onClose={closeModal} onSave={handleSave} />}
        </SafeAreaView>
    );
};

// =================================================================================
// --- TABLE UI COMPONENT ---
// =================================================================================
const FoodMenuTable = ({ menuData, isAdmin, onEditFood, onEditTime }) => {
    const getMealForCell = (day, mealType) => menuData[day]?.find(m => m.meal_type === mealType);
    const getHeaderTime = (mealType) => menuData['Monday']?.find(m => m.meal_type === mealType)?.meal_time || '';

    return (
        <View style={styles.table}>
            {/* Header Row */}
            <View style={styles.tableHeaderRow}>
                <View style={[styles.tableHeaderCell, styles.dayHeaderCell]}>
                    <Text style={styles.headerDayText}>Day</Text>
                </View>
                {MEAL_TYPES.map((mealType, index) => (
                    <TouchableOpacity 
                        key={mealType} 
                        style={[
                            styles.tableHeaderCell, 
                            styles.mealHeaderCell,
                            index === MEAL_TYPES.length - 1 && styles.lastCell, // Remove right border on last cell
                        ]}
                        onPress={() => onEditTime({ meal_type: mealType, meal_time: getHeaderTime(mealType) })}
                        disabled={!isAdmin}
                    >
                        <Text style={styles.headerMealTypeText}>{mealType}</Text>
                        <Text style={styles.headerMealTimeText}>{getHeaderTime(mealType)}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Data Rows */}
            {ORDERED_DAYS.map(({ full, short }) => (
                <View key={full} style={styles.tableRow}>
                    <View style={[styles.tableCell, styles.dayCell]}>
                       <Text style={styles.dayCellText}>{short}</Text>
                    </View>
                    
                    {MEAL_TYPES.map((mealType, index) => {
                        const meal = getMealForCell(full, mealType);
                        return (
                            <TouchableOpacity
                                key={mealType}
                                style={[
                                    styles.tableCell, 
                                    styles.mealCell,
                                    index === MEAL_TYPES.length - 1 && styles.lastCell, // Remove right border on last cell
                                ]}
                                onPress={() => meal && onEditFood(meal)}
                                disabled={!isAdmin || !meal}
                            >
                                <Text style={meal?.food_item ? styles.mealItemText : styles.notSetText} numberOfLines={3}>
                                    {meal?.food_item || 'Not set'}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            ))}
        </View>
    );
};

// =================================================================================
// --- DYNAMIC MODAL COMPONENT ---
// =================================================================================
const EditMenuModal = ({ modalInfo, onClose, onSave }) => {
    const { mode, data } = modalInfo;
    const [foodItem, setFoodItem] = useState('');
    const [mealTime, setMealTime] = useState('');

    React.useEffect(() => {
        if (mode === 'editFood') {
            setFoodItem(data?.food_item || '');
        } else if (mode === 'editTime') {
            setMealTime(data?.meal_time || '');
        }
    }, [mode, data]);

    const handleSavePress = () => {
        if (mode === 'editFood') {
            onSave({ food_item: foodItem });
        } else if (mode === 'editTime') {
            onSave({ meal_time: mealTime });
        }
    };
    
    const handleClearPress = () => {
        if (mode === 'editFood') {
            onSave({ food_item: '' });
        }
    };

    return (
        <Modal visible={true} transparent animationType="fade" onRequestClose={onClose}>
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>
                        {mode === 'editFood' ? `Edit ${data.day_of_week} ${data.meal_type}` : `Edit ${data.meal_type} Time`}
                    </Text>
                    
                    {mode === 'editFood' && (<><Text style={styles.inputLabel}>Food Item</Text><TextInput style={styles.input} value={foodItem} onChangeText={setFoodItem} placeholder="e.g., Rice & Dal" /></>)}
                    {mode === 'editTime' && (<><Text style={styles.inputLabel}>Time</Text><TextInput style={styles.input} value={mealTime} onChangeText={setMealTime} placeholder="e.g., 1:00 PM - 2:00 PM" /></>)}

                    <TouchableOpacity style={styles.saveButton} onPress={handleSavePress}><Text style={styles.saveButtonText}>Save Changes</Text></TouchableOpacity>
                    {mode === 'editFood' && (<TouchableOpacity style={styles.clearButton} onPress={handleClearPress}><Text style={styles.clearButtonText}>Clear Entry</Text></TouchableOpacity>)}
                    <TouchableOpacity onPress={onClose}><Text style={styles.cancelText}>Cancel</Text></TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

// =================================================================================
// --- STYLESHEET ---
// =================================================================================
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: THEME.background },
    scrollContainer: { padding: 10 },
    header: { paddingVertical: 15, paddingHorizontal: 10, borderBottomWidth: 1, borderBottomColor: THEME.border, alignItems: 'center', backgroundColor: '#fff' },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: THEME.dark },

    // --- TABLE CONTAINER ---
    table: {
        backgroundColor: '#fff',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: THEME.border,
        overflow: 'hidden', // This is crucial for rounding corners of child rows
    },
    
    // --- TABLE ROWS ---
    tableRow: {
        flexDirection: 'row',
        width: '100%',
        borderTopWidth: 1, 
        borderColor: THEME.border,
    },
    
    // --- HEADER ROW ---
    tableHeaderRow: {
        flexDirection: 'row',
        backgroundColor: THEME.primary,
        borderTopWidth: 0, // No top border for the very first row
    },
    
    // --- GENERIC CELL STYLES ---
    tableCell: {
        justifyContent: 'center', // **FIX for vertical centering**
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 4,
    },
    
    // --- HEADER CELLS ---
    tableHeaderCell: {
        paddingVertical: 8,
        alignItems: 'center',
        justifyContent: 'center',
        borderRightWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.25)', // Softer white border
    },
    dayHeaderCell: {
        flex: 0.7,
        alignItems: 'flex-start',
        paddingLeft: 10,
    },
    mealHeaderCell: {
        flex: 1,
    },
    lastCell: {
        borderRightWidth: 0, // Removes the final border on the right
    },
    headerDayText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    headerMealTypeText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    headerMealTimeText: {
        color: 'rgba(255, 255, 255, 0.9)',
        fontSize: 10,
        fontWeight: '600',
        marginTop: 2,
    },
    
    // --- DATA CELLS ---
    dayCell: {
        flex: 0.7,
        alignItems: 'flex-start',
        paddingLeft: 10,
        borderRightWidth: 1,
        borderColor: THEME.border,
    },
    dayCellText: {
        fontWeight: 'bold',
        fontSize: 14,
        color: THEME.primary,
    },
    mealCell: {
        flex: 1,
        borderRightWidth: 1,
        borderColor: THEME.border,
        minHeight: 65,
    },
    mealItemText: {
        fontSize: 11,
        color: THEME.text,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    notSetText: {
        fontSize: 13,
        color: THEME.muted,
        fontWeight: '600',
        fontStyle: 'italic',
    },
    
    // --- MODAL STYLES ---
    modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
    modalContent: { width: '90%', backgroundColor: 'white', borderRadius: 12, padding: 25, elevation: 10 },
    modalTitle: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
    inputLabel: { fontSize: 16, color: THEME.muted, marginBottom: 5, marginLeft: 4 },
    input: { borderWidth: 1, borderColor: THEME.border, borderRadius: 8, padding: 12, fontSize: 16, marginBottom: 15 },
    saveButton: { backgroundColor: THEME.primary, padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 10 },
    saveButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
    clearButton: { backgroundColor: THEME.light, padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 10, borderWidth: 1, borderColor: THEME.border },
    clearButtonText: { color: THEME.danger, fontSize: 16, fontWeight: 'bold' },
    cancelText: { textAlign: 'center', color: THEME.muted, padding: 15, fontSize: 16 },
});

export default FoodScreen;