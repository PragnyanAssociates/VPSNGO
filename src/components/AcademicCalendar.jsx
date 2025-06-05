import React, { useState, useMemo, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView,
  Dimensions, Modal, TextInput, Alert, Platform
} from 'react-native';

// --- Configuration ---
const PAGE_BACKGROUND = '#f0f2f5';
const CARD_BACKGROUND = '#FFFFFF';

// Event Types Configuration
const eventTypesConfig = {
  'Meeting': { color: '#0077b6', displayName: 'Meeting' },
  'Event': { color: '#ff9f1c', displayName: 'Event' },
  'Festival': { color: '#f94144', displayName: 'Festival' },
  'Holiday (General)': { color: '#e63946', displayName: 'Holiday (General)' },
  'Holiday (Optional)': { color: '#2a9d8f', displayName: 'Holiday (Optional)' },
  'Exam': { color: '#9b5de5', displayName: 'Exam' },
  'Lab Session': { color: '#43aa8b', displayName: 'Lab Session' },
  'Other': { color: '#577590', displayName: 'Other' },
};
const DEFAULT_EVENT_TYPE = 'Meeting'; // Default for new events

const MONTH_HEADER_BG = '#023e8a';
const MONTH_HEADER_TEXT = '#FFFFFF';
const DAY_OF_WEEK_BG = '#e9ecef';
const DAY_OF_WEEK_TEXT = '#495057';
const DEFAULT_DAY_TEXT_COLOR = '#343a40';
const LIGHT_DAY_TEXT_COLOR = '#FFFFFF';
const CELL_BORDER_COLOR = '#ced4da';
const TODAY_HIGHLIGHT_BG = '#e0f2fe'; // Light blue for today's background
const TODAY_HIGHLIGHT_BORDER = '#0ea5e9'; // Brighter blue for today's border

const TEXT_PRIMARY_COLOR = '#212529';
const TEXT_SECONDARY_COLOR = '#6c757d';
const ACCENT_COLOR = eventTypesConfig['Meeting'].color;

// Initial Data (using new event types)
const initialEventsData = {
  '2025-01-01': [{ id: 'hNY25', name: 'New Year Day', type: 'Holiday (General)' }],
  '2025-01-14': [{ id: 'hMS25', name: 'Makar Sankranti / Pongal', type: 'Festival' }],
  '2025-01-26': [{ id: 'hRD25', name: 'Republic Day', type: 'Holiday (General)' }],
  '2025-03-14': [{ id: 'hHO25', name: 'Holi', type: 'Festival' }],
  '2025-04-18': [{ id: 'hGF25', name: 'Good Friday', type: 'Holiday (General)' }],
  '2025-05-01': [{ id: 'hLD25', name: 'Labour Day', type: 'Holiday (Optional)' }],
  '2025-08-15': [{ id: 'hID25', name: 'Independence Day', type: 'Holiday (General)' }],
  '2025-10-02': [{ id: 'hGJ25', name: 'Gandhi Jayanti', type: 'Holiday (General)' }],
  '2025-10-21': [{ id: 'hDI25', name: 'Diwali (Deepavali)', type: 'Festival' }],
  '2025-12-25': [{ id: 'hCH25', name: 'Christmas', type: 'Holiday (General)' }],
};

const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                      'July', 'August', 'September', 'October', 'November', 'December'];
const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const { width: windowWidth } = Dimensions.get('window');
const DAY_BOX_SIZE = (windowWidth - 20 - (6 * 1)) / 7;

const generateId = () => `item_${Date.now().toString(36) + Math.random().toString(36).substr(2, 5)}`;
const formatDateKey = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// --- Component ---
const AcademicCalendar = ({ onBackPress }) => {
  const [currentDisplayDate, setCurrentDisplayDate] = useState(new Date()); // For month/year navigation
  const [events, setEvents] = useState(initialEventsData);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedDateForEvent, setSelectedDateForEvent] = useState(null);
  const [newEventDetails, setNewEventDetails] = useState({
    title: '',
    time: '',
    description: '',
    type: DEFAULT_EVENT_TYPE,
  });

  const today = useMemo(() => new Date(), []); // Memoize today's date for stable comparison

  const month = currentDisplayDate.getMonth();
  const year = currentDisplayDate.getFullYear();

  const calendarGrid = useMemo(() => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const grid = Array(firstDay).fill(null);
    for (let day = 1; day <= daysInMonth; day++) {
      grid.push(day);
    }
    return grid;
  }, [month, year]);

  const changeMonth = (offset) => {
    setCurrentDisplayDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(prevDate.getMonth() + offset);
      return newDate;
    });
  };

  const openAddEventModal = (dayNumber) => {
    const dateForModal = dayNumber ? new Date(year, month, dayNumber) : new Date();
    setSelectedDateForEvent(formatDateKey(dateForModal));
    setNewEventDetails({ title: '', time: '', description: '', type: DEFAULT_EVENT_TYPE });
    setIsModalVisible(true);
  };

  const handleAddEvent = () => {
    if (!newEventDetails.title.trim()) {
      Alert.alert('Error', 'Event title is required.');
      return;
    }
    if (!selectedDateForEvent) {
        Alert.alert('Error', 'A date must be selected.');
        return;
    }

    const newEventEntry = {
      id: generateId(),
      name: newEventDetails.title,
      time: newEventDetails.time.trim(),
      description: newEventDetails.description.trim(),
      type: newEventDetails.type,
    };

    setEvents(prevEvents => {
      const updatedEvents = { ...prevEvents };
      const dateEvents = updatedEvents[selectedDateForEvent] ? [...updatedEvents[selectedDateForEvent]] : [];
      dateEvents.push(newEventEntry);
      updatedEvents[selectedDateForEvent] = dateEvents;
      return updatedEvents;
    });
    setIsModalVisible(false);
  };

  const currentMonthItems = useMemo(() => {
    // ... (sorting logic from previous version, ensure it handles new types if needed for priority)
    const items = [];
    Object.entries(events).forEach(([dateKey, dateItemsArray]) => {
      const [itemYear, itemMonthNum] = dateKey.split('-').map(Number);
      if (itemYear === year && (itemMonthNum - 1) === month) {
        dateItemsArray.forEach(item => {
            const day = parseInt(dateKey.split('-')[2], 10);
            items.push({
                ...item, dateKey, day,
                formattedDate: `${monthNames[month].substring(0,3)} ${String(day).padStart(2, '0')}`,
            });
        });
      }
    });
    return items.sort((a, b) => {
        if (a.day !== b.day) return a.day - b.day;
        if (a.time && b.time) return a.time.localeCompare(b.time);
        if (a.time && !b.time) return -1;
        if (!a.time && b.time) return 1;
        const typeAConfig = eventTypesConfig[a.type] || eventTypesConfig.Other;
        const typeBConfig = eventTypesConfig[b.type] || eventTypesConfig.Other;
        // Example: Give 'Holiday (General)' higher priority in list than 'Meeting'
        const priority = (type) => {
            if (type.includes('Holiday')) return 1;
            if (type === 'Festival') return 2;
            return 3; // Meetings, Events, etc.
        }
        return priority(a.type) - priority(b.type);
    });
  }, [month, year, events]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.titleHeader}><Text style={styles.mainTitle}> Calendar - {year}</Text></View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.legendContainer}>
          {Object.entries(eventTypesConfig).map(([typeKey, typeValue]) => (
            <View key={typeKey} style={styles.legendItem}>
              <View style={[styles.legendColorBox, { backgroundColor: typeValue.color }]} />
              <Text style={styles.legendText}>{typeValue.displayName}</Text>
            </View>
          ))}
        </ScrollView>

        <View style={styles.calendarCard}>
          <View style={styles.monthHeader}>
            <TouchableOpacity onPress={() => changeMonth(-1)} style={styles.navButton}><Text style={styles.navArrow}>◀</Text></TouchableOpacity>
            <Text style={styles.monthYearText}>{monthNames[month]} {year}</Text>
            <TouchableOpacity onPress={() => changeMonth(1)} style={styles.navButton}><Text style={styles.navArrow}>▶</Text></TouchableOpacity>
          </View>

          <View style={styles.dayOfWeekHeader}>
            {dayNames.map(dayName => <Text key={dayName} style={styles.dayOfWeekText}>{dayName}</Text>)}
          </View>

          <View style={styles.calendarGrid}>
            {calendarGrid.map((dayNumber, index) => {
              if (dayNumber === null) return <View key={`empty-${index}`} style={styles.dayBox} />;

              const dateKey = formatDateKey(new Date(year, month, dayNumber));
              const dayItems = events[dateKey] || [];
              const isCurrentDay = dayNumber === today.getDate() && month === today.getMonth() && year === today.getFullYear();
              const isSunday = new Date(year, month, dayNumber).getDay() === 0;

              let dayBoxStyle = [styles.dayBox];
              let dayTextStyle = [styles.dayNumber];

              const holidayGeneral = dayItems.find(item => item.type === 'Holiday (General)');
              const holidayOptional = dayItems.find(item => item.type === 'Holiday (Optional)');

              if (isCurrentDay) dayBoxStyle.push(styles.todayHighlight);
              if (holidayGeneral) {
                dayBoxStyle.push({ backgroundColor: eventTypesConfig['Holiday (General)'].color });
                dayTextStyle.push(styles.holidayDayNumber);
              } else if (holidayOptional) {
                dayBoxStyle.push({ backgroundColor: eventTypesConfig['Holiday (Optional)'].color });
                dayTextStyle.push(styles.holidayDayNumber);
              } else if (isSunday) {
                dayTextStyle.push({ color: eventTypesConfig['Holiday (General)'].color, fontWeight: '600' });
              }

              return (
                <TouchableOpacity key={dateKey} style={dayBoxStyle} onPress={() => openAddEventModal(dayNumber)}>
                  <Text style={dayTextStyle}>{dayNumber}</Text>
                  {dayItems.length > 0 && (
                    <View style={styles.dotsContainer}>
                      {dayItems.slice(0, 3).map(item => (
                        <View
                          key={item.id}
                          style={[
                            styles.eventDot,
                            { backgroundColor: (eventTypesConfig[item.type] || eventTypesConfig.Other).color }
                          ]}
                        />
                      ))}
                    </View>
                  )}
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
                <View style={[styles.eventIndicator, { backgroundColor: (eventTypesConfig[item.type] || eventTypesConfig.Other).color }]}/>
                <View style={styles.eventItemTextContainer}>
                    <Text style={[styles.eventDateText, {color: (eventTypesConfig[item.type] || eventTypesConfig.Other).color}]}>
                        {item.formattedDate} {item.time ? `(${item.time})` : ''}
                    </Text>
                    <Text style={styles.eventNameText}>{item.name} <Text style={styles.eventTypeInList}>({item.type})</Text></Text>
                    {item.description && <Text style={styles.eventDescriptionText}>{item.description}</Text>}
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <TouchableOpacity style={styles.addEventButtonFixed} onPress={() => openAddEventModal(null)}>
          <Text style={styles.addEventButtonText}>+</Text>
      </TouchableOpacity>

      <Modal animationType="slide" transparent={true} visible={isModalVisible} onRequestClose={() => setIsModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Item</Text>
            <Text style={styles.modalDateLabel}>Date: {selectedDateForEvent}</Text>
            
            <Text style={styles.modalInputLabel}>Type:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.eventTypeSelectorContainer}>
                {Object.entries(eventTypesConfig).map(([typeKey, typeValue]) => (
                    <TouchableOpacity
                        key={typeKey}
                        style={[
                            styles.eventTypeButton,
                            newEventDetails.type === typeKey && { backgroundColor: typeValue.color, borderColor: typeValue.color }
                        ]}
                        onPress={() => setNewEventDetails(prev => ({ ...prev, type: typeKey }))}
                    >
                        <Text style={[
                            styles.eventTypeButtonText,
                            newEventDetails.type === typeKey && { color: LIGHT_DAY_TEXT_COLOR }
                        ]}>{typeValue.displayName}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <Text style={styles.modalInputLabel}>Title:</Text>
            <TextInput style={styles.modalInput} placeholder="Item Title" value={newEventDetails.title} onChangeText={text => setNewEventDetails(prev => ({ ...prev, title: text }))}/>
            <Text style={styles.modalInputLabel}>Time (Optional):</Text>
            <TextInput style={styles.modalInput} placeholder="e.g., 10:00 AM" value={newEventDetails.time} onChangeText={text => setNewEventDetails(prev => ({ ...prev, time: text }))}/>
            <Text style={styles.modalInputLabel}>Description (Optional):</Text>
            <TextInput style={[styles.modalInput, styles.modalDescriptionInput]} placeholder="Details..." value={newEventDetails.description} onChangeText={text => setNewEventDetails(prev => ({ ...prev, description: text }))} multiline/>
            
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setIsModalVisible(false)}><Text style={styles.modalButtonText}>Cancel</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.saveButton]} onPress={handleAddEvent}><Text style={styles.modalButtonText}>Save Item</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

// --- Styles ---
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: PAGE_BACKGROUND },
  scrollView: { flex: 1 },
  scrollContentContainer: { padding: 10, paddingBottom: 100 },
  titleHeader: { marginBottom: 15, alignItems: 'center' },
  mainTitle: { fontSize: 24, fontWeight: '600', color: TEXT_PRIMARY_COLOR },
  legendContainer: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 5, // Allow some space if it doesn't fit
    marginBottom: 15,
    backgroundColor: CARD_BACKGROUND,
    borderRadius: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', marginRight: 15, paddingVertical: 3 },
  legendColorBox: { width: 14, height: 14, marginRight: 6, borderRadius: 3 },
  legendText: { fontSize: 12, color: TEXT_SECONDARY_COLOR },
  calendarCard: {
    backgroundColor: CARD_BACKGROUND, borderRadius: 12, marginBottom: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 5, elevation: 3,
    overflow: 'hidden',
  },
  monthHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: MONTH_HEADER_BG, paddingVertical: 14, paddingHorizontal: 15,
  },
  navButton: { padding: 10 },
  navArrow: { fontSize: 22, color: MONTH_HEADER_TEXT, fontWeight: 'bold' },
  monthYearText: { fontSize: 20, fontWeight: 'bold', color: MONTH_HEADER_TEXT },
  dayOfWeekHeader: { flexDirection: 'row', backgroundColor: DAY_OF_WEEK_BG },
  dayOfWeekText: {
    flex: 1, textAlign: 'center', paddingVertical: 12,
    fontSize: 14, fontWeight: '500', color: DAY_OF_WEEK_TEXT,
  },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayBox: {
    width: DAY_BOX_SIZE, height: DAY_BOX_SIZE + 15,
    justifyContent: 'flex-start', alignItems: 'center',
    borderWidth: 0.5, borderColor: CELL_BORDER_COLOR,
    paddingTop: 6,
  },
  todayHighlight: {
    backgroundColor: TODAY_HIGHLIGHT_BG,
    borderColor: TODAY_HIGHLIGHT_BORDER,
    borderWidth: 1.5, // Make border more prominent
  },
  dayNumber: { fontSize: 15, fontWeight: '500', color: DEFAULT_DAY_TEXT_COLOR, marginBottom: 3 },
  holidayDayNumber: { color: LIGHT_DAY_TEXT_COLOR, fontWeight: 'bold' },
  dotsContainer: {
    position: 'absolute', bottom: Platform.OS === 'ios' ? 4 : 3, // Minor platform adjustment
    left: 0, right: 0, flexDirection: 'row',
    justifyContent: 'center', alignItems: 'center',
  },
  eventDot: { width: 5, height: 5, borderRadius: 2.5, marginHorizontal: 1 },
  eventListCard: {
    backgroundColor: CARD_BACKGROUND, borderRadius: 12, padding: 15,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2,
    marginBottom: 20,
  },
  eventListTitle: {
    fontSize: 20, fontWeight: '600', color: TEXT_PRIMARY_COLOR, marginBottom: 12,
    borderBottomWidth: 1, borderBottomColor: '#e9ecef', paddingBottom: 10,
  },
  eventListItem: {
    flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: '#f1f3f5',
  },
  eventIndicator: { width: 8, minHeight: 20, marginRight: 12, borderRadius: 4, marginTop: 2 },
  eventItemTextContainer: { flex: 1 },
  eventDateText: { fontSize: 14, fontWeight: 'bold', marginBottom: 3 },
  eventNameText: { fontSize: 16, fontWeight: '500', color: TEXT_PRIMARY_COLOR, marginBottom: 3 },
  eventTypeInList: { fontSize: 12, color: TEXT_SECONDARY_COLOR, fontStyle: 'italic' },
  eventDescriptionText: { fontSize: 13, color: TEXT_SECONDARY_COLOR },
  addEventButtonFixed: {
    position: 'absolute', bottom: 20, right: 20,
    backgroundColor: ACCENT_COLOR, width: 56, height: 56, borderRadius: 28,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: "#000", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 6,
  },
  addEventButtonText: { color: LIGHT_DAY_TEXT_COLOR, fontSize: 28, lineHeight: Platform.OS === 'ios' ? 30 : 32 },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center', alignItems: 'center',
  },
  modalContent: {
    width: '90%', backgroundColor: CARD_BACKGROUND, borderRadius: 12, padding: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5,
  },
  modalTitle: {
    fontSize: 20, fontWeight: 'bold', color: TEXT_PRIMARY_COLOR,
    marginBottom: 5, textAlign: 'center',
  },
  modalDateLabel: { fontSize: 15, color: TEXT_SECONDARY_COLOR, marginBottom: 15, textAlign: 'center' },
  modalInputLabel: { fontSize: 14, color: TEXT_SECONDARY_COLOR, marginBottom: 4, marginTop: 8 },
  eventTypeSelectorContainer: {
    marginBottom: 10,
    maxHeight: 50, // ensure it doesn't grow too tall if many types
  },
  eventTypeButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: CELL_BORDER_COLOR,
    marginRight: 8,
    backgroundColor: '#f8f9fa',
  },
  eventTypeButtonText: {
    fontSize: 14,
    color: TEXT_PRIMARY_COLOR,
  },
  modalInput: {
    backgroundColor: '#f8f9fa', borderWidth: 1, borderColor: CELL_BORDER_COLOR, borderRadius: 8,
    paddingHorizontal: 15, paddingVertical: 10, fontSize: 16, marginBottom: 10,
  },
  modalDescriptionInput: { height: 70, textAlignVertical: 'top' },
  modalButtonContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 },
  modalButton: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginHorizontal: 5 },
  saveButton: { backgroundColor: ACCENT_COLOR },
  cancelButton: { backgroundColor: '#6c757d' },
  modalButtonText: { color: LIGHT_DAY_TEXT_COLOR, fontSize: 16, fontWeight: 'bold' },
});

export default AcademicCalendar;