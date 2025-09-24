// 📂 File: src/components/AcademicCalendar.tsx (MODIFIED & CORRECTED)

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView,
  Dimensions, Modal, TextInput, Alert, Platform, ActivityIndicator
} from 'react-native';
import { useAuth } from '../context/AuthContext';
// ★★★ 1. IMPORT apiClient AND REMOVE API_BASE_URL ★★★
import apiClient from '../api/client';

// --- Type Definitions ---
interface EventItem {
  id: number;
  name: string;
  type: string;
  time?: string;
  description?: string;
  event_date: string;
}

interface EventsData {
  [dateKey: string]: EventItem[];
}

// --- Configuration ---
const PAGE_BACKGROUND = '#f0f2f5', CARD_BACKGROUND = '#FFFFFF', MONTH_HEADER_BG = '#023e8a', MONTH_HEADER_TEXT = '#FFFFFF', LIGHT_DAY_TEXT_COLOR = '#FFFFFF', TEXT_PRIMARY_COLOR = '#212529', TEXT_SECONDARY_COLOR = '#6c757d';
const eventTypesConfig: { [key: string]: { color: string; displayName: string } } = { 'Meeting': { color: '#0077b6', displayName: 'Meeting' }, 'Event': { color: '#ff9f1c', displayName: 'Event' }, 'Festival': { color: '#f94144', displayName: 'Festival' }, 'Holiday (General)': { color: '#05680fff', displayName: 'Holiday (General)' }, 'Holiday (Optional)': { color: '#11b8a5ff', displayName: 'Holiday (Optional)' }, 'Exam': { color: '#8023f1ff', displayName: 'Exam' }, 'Other': { color: '#db0b7dff', displayName: 'Other' } };
const DEFAULT_EVENT_TYPE = 'Meeting';
const ACCENT_COLOR = eventTypesConfig['Meeting'].color;
const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const { width: windowWidth } = Dimensions.get('window');
const DAY_BOX_SIZE = (windowWidth - 20 - (6 * 1)) / 7;

const formatDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const AcademicCalendar = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [isLoading, setIsLoading] = useState(true);
  const [events, setEvents] = useState<EventsData>({});
  const [currentDisplayDate, setCurrentDisplayDate] = useState(new Date());
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
  const [eventDetails, setEventDetails] = useState({ name: '', time: '', description: '', type: DEFAULT_EVENT_TYPE });
  const today = useMemo(() => new Date(), []);
  const month = currentDisplayDate.getMonth();
  const year = currentDisplayDate.getFullYear();

  const fetchEvents = async () => {
    try {
      if (!isLoading) setIsLoading(true);
      // ★★★ 2. USE apiClient ★★★
      const response = await apiClient.get('/calendar');
      setEvents(response.data);
    } catch (error: any) {
      Alert.alert("Error", error.response?.data?.message || 'Failed to fetch calendar data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const calendarGrid = useMemo(() => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const grid = Array(firstDay).fill(null);
    for (let day = 1; day <= daysInMonth; day++) { grid.push(day); }
    return grid;
  }, [month, year]);

  const changeMonth = (offset: number) => setCurrentDisplayDate(d => { const newDate = new Date(d); newDate.setMonth(d.getMonth() + offset); return newDate; });

  const openModalForNew = (dateKey: string) => { setEditingEvent(null); setSelectedDate(dateKey); setEventDetails({ name: '', time: '', description: '', type: DEFAULT_EVENT_TYPE }); setIsModalVisible(true); };
  const openModalForEdit = (event: EventItem) => { setEditingEvent(event); setSelectedDate(event.event_date); setEventDetails({ name: event.name, time: event.time || '', description: event.description || '', type: event.type }); setIsModalVisible(true); };

  const handleSaveEvent = async () => {
    if (!eventDetails.name.trim() || !selectedDate) return Alert.alert("Error", "Title is required.");
    const isEditing = !!editingEvent;
    const url = isEditing ? `/calendar/${editingEvent!.id}` : '/calendar';
    const method = isEditing ? 'put' : 'post';
    const body = { ...eventDetails, event_date: selectedDate, adminId: user?.id };
    try {
      const response = await apiClient[method](url, body);
      Alert.alert("Success", response.data.message || `Event ${isEditing ? 'updated' : 'created'} successfully!`);
      setIsModalVisible(false);
      await fetchEvents();
    } catch (error: any) {
      Alert.alert("Save Failed", error.response?.data?.message || 'Failed to save event.');
    }
  };
  
  const handleDeleteEvent = (eventId: number) => {
    Alert.alert("Confirm Delete", "Are you sure you want to delete this event?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => {
        try {
          // ★★★ 3. USE apiClient ★★★
          await apiClient.delete(`/calendar/${eventId}`);
          await fetchEvents();
        } catch (error: any) {
          Alert.alert("Delete Failed", error.response?.data?.message || 'Failed to delete event.');
        }
      }}
    ]);
  };

  const currentMonthItems = useMemo(() => {
    const items: (EventItem & { day: number; formattedDate: string; })[] = [];
    Object.entries(events).forEach(([dateKey, dateItemsArray]) => {
      const [itemYear, itemMonthNum, itemDay] = dateKey.split('-').map(Number);
      if (itemYear === year && (itemMonthNum - 1) === month) {
        dateItemsArray.forEach(item => {
          items.push({ ...item, day: itemDay, formattedDate: `${monthNames[month].substring(0,3)} ${String(itemDay).padStart(2, '0')}` });
        });
      }
    });
    return items.sort((a,b) => a.day - b.day);
  }, [month, year, events]);

  if (isLoading) {
    return <SafeAreaView style={styles.safeArea}><ActivityIndicator style={{ flex: 1 }} size="large" color={ACCENT_COLOR} /></SafeAreaView>;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContentContainer}>
        <View style={styles.titleHeader}><Text style={styles.mainTitle}>Calendar - {year}</Text></View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.legendContainer}>
          {Object.entries(eventTypesConfig).map(([k, v]) => <View key={k} style={styles.legendItem}><View style={[styles.legendColorBox, {backgroundColor:v.color}]}/><Text style={styles.legendText}>{v.displayName}</Text></View>)}
        </ScrollView>
        <View style={styles.calendarCard}>
          <View style={styles.monthHeader}>
            <TouchableOpacity onPress={() => changeMonth(-1)} style={styles.navButton}><Text style={styles.navArrow}>◀</Text></TouchableOpacity>
            <Text style={styles.monthYearText}>{monthNames[month]} {year}</Text>
            <TouchableOpacity onPress={() => changeMonth(1)} style={styles.navButton}><Text style={styles.navArrow}>▶</Text></TouchableOpacity>
          </View>
          <View style={styles.dayOfWeekHeader}>{dayNames.map(d => <Text key={d} style={styles.dayOfWeekText}>{d}</Text>)}</View>
          <View style={styles.calendarGrid}>
            {calendarGrid.map((day, i) => {
              if (day === null) return <View key={`e-${i}`} style={styles.dayBox} />;
              const dateKey = formatDateKey(new Date(year, month, day));
              const dayItems = events[dateKey] || [];
              const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
              const dayBoxStyle: any[] = [styles.dayBox];
              const dayTextStyle: any[] = [styles.dayNumber];
              if (isToday) dayBoxStyle.push(styles.todayHighlight);
              if (dayItems.length > 0) {
                const primaryEventColor = eventTypesConfig[dayItems[0].type]?.color;
                if (primaryEventColor) { dayBoxStyle.push({ backgroundColor: primaryEventColor }); dayTextStyle.push(styles.coloredDayNumber); }
              }
              if (dayItems.length === 0 && new Date(year, month, day).getDay() === 0) { dayTextStyle.push({ color: eventTypesConfig['Holiday (General)'].color }); }
              return (
                <TouchableOpacity key={dateKey} style={dayBoxStyle} onPress={isAdmin ? () => openModalForNew(dateKey) : undefined} activeOpacity={isAdmin ? 0.7 : 1}>
                  <Text style={dayTextStyle}>{day}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
        {currentMonthItems.length > 0 && (
          <View style={styles.eventListCard}>
            <Text style={styles.eventListTitle}>Items for {monthNames[month]}</Text>
            {currentMonthItems.map(item => (
              <View key={item.id} style={styles.eventListItem}>
                <View style={[styles.eventIndicator, {backgroundColor: eventTypesConfig[item.type]?.color}]}/>
                <View style={styles.eventItemTextContainer}>
                    <Text style={[styles.eventDateText, {color: eventTypesConfig[item.type]?.color}]}>{item.formattedDate} {item.time ? `(${item.time})` : ''}</Text>
                    <Text style={styles.eventNameText}>{item.name} <Text style={styles.eventTypeInList}>({item.type})</Text></Text>
                    {item.description && <Text style={styles.eventDescriptionText}>{item.description}</Text>}
                </View>
                {isAdmin && (
                  <View style={styles.adminActionButtons}>
                    <TouchableOpacity onPress={() => openModalForEdit(item)} style={styles.editButton}><Text style={styles.actionButtonText}>Edit</Text></TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDeleteEvent(item.id)} style={styles.deleteButton}><Text style={styles.actionButtonText}>Del</Text></TouchableOpacity>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
      {isAdmin && <TouchableOpacity style={styles.addEventButtonFixed} onPress={() => openModalForNew(formatDateKey(new Date()))}><Text style={styles.addEventButtonText}>+</Text></TouchableOpacity>}
      <Modal animationType="slide" transparent={true} visible={isModalVisible} onRequestClose={() => setIsModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editingEvent ? 'Edit Item' : 'Add New Item'}</Text>
            <Text style={styles.modalDateLabel}>Date: {selectedDate}</Text>
            <Text style={styles.modalInputLabel}>Type:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.eventTypeSelectorContainer}>
                {Object.entries(eventTypesConfig).map(([key, val]) => <TouchableOpacity key={key} style={[styles.eventTypeButton, eventDetails.type === key && {backgroundColor:val.color}]} onPress={() => setEventDetails(p => ({...p, type: key}))}><Text style={[styles.eventTypeButtonText, eventDetails.type === key && {color: LIGHT_DAY_TEXT_COLOR}]}>{val.displayName}</Text></TouchableOpacity>)}
            </ScrollView>
            <Text style={styles.modalInputLabel}>Title:</Text>
            <TextInput style={styles.modalInput} placeholder="Item Title" value={eventDetails.name} onChangeText={t => setEventDetails(p => ({...p, name: t}))}/>
            <Text style={styles.modalInputLabel}>Time (Optional):</Text>
            <TextInput style={styles.modalInput} placeholder="e.g., 10:00 AM" value={eventDetails.time} onChangeText={t => setEventDetails(p => ({...p, time: t}))}/>
            <Text style={styles.modalInputLabel}>Description (Optional):</Text>
            <TextInput style={[styles.modalInput, styles.modalDescriptionInput]} placeholder="Details..." value={eventDetails.description} onChangeText={t => setEventDetails(p => ({...p, description: t}))} multiline/>
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setIsModalVisible(false)}><Text style={styles.modalButtonText}>Cancel</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.saveButton]} onPress={handleSaveEvent}><Text style={styles.modalButtonText}>{editingEvent ? 'Save Changes' : 'Add Item'}</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

// Styles remain unchanged
const styles = StyleSheet.create({ safeArea: { flex: 1, backgroundColor: PAGE_BACKGROUND }, scrollView: { flex: 1 }, scrollContentContainer: { padding: 10, paddingBottom: 100 }, titleHeader: { marginBottom: 15, alignItems: 'center' }, mainTitle: { fontSize: 24, fontWeight: '600', color: TEXT_PRIMARY_COLOR }, legendContainer: { flexDirection: 'row', paddingVertical: 10, paddingHorizontal: 5, marginBottom: 15, backgroundColor: CARD_BACKGROUND, borderRadius: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 }, legendItem: { flexDirection: 'row', alignItems: 'center', marginRight: 15, paddingVertical: 3 }, legendColorBox: { width: 14, height: 14, marginRight: 6, borderRadius: 3 }, legendText: { fontSize: 12, color: TEXT_SECONDARY_COLOR }, calendarCard: { backgroundColor: CARD_BACKGROUND, borderRadius: 12, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 5, elevation: 3, overflow: 'hidden' }, monthHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: MONTH_HEADER_BG, paddingVertical: 14, paddingHorizontal: 15 }, navButton: { padding: 10 }, navArrow: { fontSize: 22, color: MONTH_HEADER_TEXT, fontWeight: 'bold' }, monthYearText: { fontSize: 20, fontWeight: 'bold', color: MONTH_HEADER_TEXT }, dayOfWeekHeader: { flexDirection: 'row', backgroundColor: '#e9ecef' }, dayOfWeekText: { flex: 1, textAlign: 'center', paddingVertical: 12, fontSize: 14, fontWeight: '500', color: '#495057' }, calendarGrid: { flexDirection: 'row', flexWrap: 'wrap' }, dayBox: { width: DAY_BOX_SIZE, height: DAY_BOX_SIZE, justifyContent: 'center', alignItems: 'center', borderWidth: 0.5, borderColor: '#ced4da' }, todayHighlight: { borderColor: '#0ea5e9', borderWidth: 2 }, dayNumber: { fontSize: 15, fontWeight: '500', color: '#343a40' }, coloredDayNumber: { color: LIGHT_DAY_TEXT_COLOR, fontWeight: 'bold' }, eventListCard: { backgroundColor: CARD_BACKGROUND, borderRadius: 12, padding: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2, marginBottom: 20 }, eventListTitle: { fontSize: 20, fontWeight: '600', color: TEXT_PRIMARY_COLOR, marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#e9ecef', paddingBottom: 10 }, eventListItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f1f3f5' }, eventIndicator: { width: 8, minHeight: 20, marginRight: 12, borderRadius: 4, marginTop: 2 }, eventItemTextContainer: { flex: 1 }, eventDateText: { fontSize: 14, fontWeight: 'bold', marginBottom: 3 }, eventNameText: { fontSize: 16, fontWeight: '500', color: TEXT_PRIMARY_COLOR, marginBottom: 3 }, eventTypeInList: { fontSize: 12, color: TEXT_SECONDARY_COLOR, fontStyle: 'italic' }, eventDescriptionText: { fontSize: 13, color: TEXT_SECONDARY_COLOR }, addEventButtonFixed: { position: 'absolute', bottom: 20, right: 20, backgroundColor: ACCENT_COLOR, width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', shadowColor: "#000", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 6 }, addEventButtonText: { color: LIGHT_DAY_TEXT_COLOR, fontSize: 28, lineHeight: Platform.OS === 'ios' ? 30 : 32 }, modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center' }, modalContent: { width: '90%', backgroundColor: CARD_BACKGROUND, borderRadius: 12, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 }, modalTitle: { fontSize: 20, fontWeight: 'bold', color: TEXT_PRIMARY_COLOR, marginBottom: 5, textAlign: 'center' }, modalDateLabel: { fontSize: 15, color: TEXT_SECONDARY_COLOR, marginBottom: 15, textAlign: 'center' }, modalInputLabel: { fontSize: 14, color: TEXT_SECONDARY_COLOR, marginBottom: 4, marginTop: 8 }, eventTypeSelectorContainer: { marginBottom: 10, maxHeight: 50 }, eventTypeButton: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#ced4da', marginRight: 8, backgroundColor: '#f8f9fa' }, eventTypeButtonText: { fontSize: 14, color: TEXT_PRIMARY_COLOR }, modalInput: { backgroundColor: '#f8f9fa', borderWidth: 1, borderColor: '#ced4da', borderRadius: 8, paddingHorizontal: 15, paddingVertical: 10, fontSize: 16, marginBottom: 10 }, modalDescriptionInput: { height: 70, textAlignVertical: 'top' }, modalButtonContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 }, modalButton: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginHorizontal: 5 }, saveButton: { backgroundColor: ACCENT_COLOR }, cancelButton: { backgroundColor: '#6c757d' }, modalButtonText: { color: LIGHT_DAY_TEXT_COLOR, fontSize: 16, fontWeight: 'bold' }, adminActionButtons: { flexDirection: 'row', alignItems: 'center', marginLeft: 'auto' }, editButton: { backgroundColor: '#3498db', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 5, marginRight: 8 }, deleteButton: { backgroundColor: '#e74c3c', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 5 }, actionButtonText: { color: LIGHT_DAY_TEXT_COLOR, fontSize: 12, fontWeight: 'bold' }});
export default AcademicCalendar;