import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  TextInput,
  Platform,
  Alert,
  KeyboardAvoidingView,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';

// --- Mock Data (remains the same) ---
const initialEventsData = [
  {
    id: '1',
    name: 'Annual Science Fair Setup',
    date: '11/27/2024',
    startTime: '14:00',
    endTime: '17:00',
    location: 'School Auditorium',
    audience: 'All Staff',
    description: 'Staff volunteers needed for final setup and booth arrangements for the Science Fair.',
    category: 'Academic',
    createdBy: 'EventsCommittee',
    updatedOn: '11/1/2024',
  },
  {
    id: '2',
    name: 'Class 10A - Math Olympiad Prep Session',
    date: '12/5/2024',
    startTime: '15:30',
    endTime: '16:30',
    location: 'Room A-101',
    audience: 'Specific Class(es) (Class 10A)',
    description: 'Extra preparation session for students participating in the Math Olympiad.',
    category: 'Academic',
    createdBy: 'E-MathTeacher',
    updatedOn: '11/5/2024',
  },
  {
    id: '3',
    name: 'Staff Holiday Luncheon',
    date: '12/20/2024',
    startTime: '12:30',
    endTime: '14:00',
    location: 'Staff Cafeteria',
    audience: 'All Staff',
    description: 'Join us for a festive holiday luncheon to celebrate the end of the year.',
    category: 'Meeting',
    createdBy: 'HR Department',
    updatedOn: '11/10/2024',
  },
    {
    id: '4',
    name: 'PTA General Body Meeting',
    date: '11/15/2024',
    startTime: '18:00',
    endTime: '19:30',
    location: 'Main Hall',
    audience: 'Parents, Teachers',
    description: 'Discussion on upcoming school activities and budget review.',
    category: 'Sports',
    createdBy: 'PTA Board',
    updatedOn: '11/2/2024',
  },
];

const categories = ['All Categories', 'Academic', 'Meeting', 'Sports', 'Cultural', 'Workshop', 'Other'];
const audienceTypes = ['All Staff', 'All Students', 'Parents', 'Specific Class(es)', 'Teachers Only', 'Other'];
const formCategories = ['Academic', 'Meeting', 'Sports', 'Cultural', 'Workshop', 'Other'];

const CATEGORY_COLORS = {
    Academic: '#2196F3',
    Meeting: '#78909C',
    Sports: '#4CAF50',
    Cultural: '#FF9800',
    Workshop: '#9C27B0',
    Other: '#F44336',
};


// --- Main Component (Logic remains largely the same) ---
const TeacherEvents = () => {
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  const [events, setEvents] = useState(initialEventsData);
  const [filteredEvents, setFilteredEvents] = useState(initialEventsData);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilterCategory, setSelectedFilterCategory] = useState('All Categories');

  // Form State
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [selectedAudience, setSelectedAudience] = useState(audienceTypes[0]);
  const [selectedCategory, setSelectedCategory] = useState(formCategories[0]);
  const [specificClasses, setSpecificClasses] = useState('');
  const [showSpecifyClassField, setShowSpecifyClassField] = useState(false);

  useEffect(() => {
    let newFilteredEvents = events.filter(event => {
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        event.name.toLowerCase().includes(term) ||
        event.description.toLowerCase().includes(term) ||
        event.location.toLowerCase().includes(term);
      const matchesCategory =
        selectedFilterCategory === 'All Categories' || event.category === selectedFilterCategory;
      return matchesSearch && matchesCategory;
    });
    setFilteredEvents(newFilteredEvents);
  }, [searchTerm, selectedFilterCategory, events]);

  useEffect(() => {
    setShowSpecifyClassField(selectedAudience === 'Specific Class(es)');
  }, [selectedAudience]);


  const resetForm = () => {
    setEventName('');
    setEventDate('');
    setStartTime('');
    setEndTime('');
    setLocation('');
    setDescription('');
    setSelectedAudience(audienceTypes[0]);
    setSelectedCategory(formCategories[0]);
    setSpecificClasses('');
    setShowSpecifyClassField(false);
  };

  const handleCreateEventPress = () => {
    resetForm();
    setIsCreatingEvent(true);
  };

  const handleCancelCreate = () => {
    setIsCreatingEvent(false);
  };

  const handleFormSubmit = () => {
    if (!eventName.trim() || !eventDate.trim() || !startTime.trim() || !location.trim() || !description.trim()) {
      Alert.alert('Missing Information', 'Please fill in all required fields (*).');
      return;
    }
    const newEvent = {
      id: String(Date.now()),
      name: eventName,
      date: eventDate,
      startTime: startTime,
      endTime: endTime,
      location: location,
      audience: selectedAudience === 'Specific Class(es)' && specificClasses.trim() ? `Specific Class(es) (${specificClasses.trim()})` : selectedAudience,
      description: description,
      category: selectedCategory,
      createdBy: 'CurrentUser',
      updatedOn: new Date().toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric'}),
    };
    setEvents(prevEvents => [newEvent, ...prevEvents]);
    Alert.alert('Event Created', `${eventName} has been successfully created.`);
    setIsCreatingEvent(false);
  };

  const getCategoryTagStyle = (category) => ({
    backgroundColor: CATEGORY_COLORS[category] || CATEGORY_COLORS.Other,
  });


  const EventCard = ({ event }) => (
    <View style={[styles.eventCard, { borderLeftColor: CATEGORY_COLORS[event.category] || CATEGORY_COLORS.Other }]}>
      <View style={styles.eventCardTopRow}>
        <Text style={styles.eventTitle}>{event.name}</Text>
        <View style={[styles.categoryTag, getCategoryTagStyle(event.category)]}>
          <Text style={styles.categoryTagText}>{event.category}</Text>
        </View>
      </View>

      <View style={styles.eventDetailItem}>
        <Text style={styles.eventIcon}>🗓️</Text>
        <Text style={styles.eventDetailText}>{event.date}</Text>
        <Text style={[styles.eventIcon, { marginLeft: 15 }]}>🕒</Text>
        <Text style={styles.eventDetailText}>{event.startTime} - {event.endTime || 'N/A'}</Text>
      </View>

      <View style={styles.eventDetailItem}>
        <Text style={styles.eventIcon}>📍</Text>
        <Text style={styles.eventDetailText}>{event.location}</Text>
      </View>

      <Text style={styles.eventAudience}>Audience: {event.audience}</Text>
      <Text style={styles.eventDescription}>{event.description}</Text>
      <Text style={styles.eventMeta}>
        Created by: {event.createdBy} (Updated: {event.updatedOn})
      </Text>
    </View>
  );

  const renderEventListView = () => (
    <>
      <View style={styles.controlsContainer}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, description, location..."
            placeholderTextColor="#A0A0A0"
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
        </View>
        <View style={styles.filterContainer}>
          <Text style={styles.filterLabel}>Filter by Category</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={selectedFilterCategory}
              onValueChange={(itemValue) => setSelectedFilterCategory(itemValue)}
              style={styles.filterPicker}
              dropdownIconColor="#007BFF"
            >
              {categories.map((cat) => <Picker.Item key={cat} label={cat} value={cat} />)}
            </Picker>
          </View>
        </View>
      </View>

      {filteredEvents.length > 0 ? (
        filteredEvents.map(event => <EventCard key={event.id} event={event} />)
      ) : (
        <Text style={styles.noEventsText}>No events found matching your criteria.</Text>
      )}
    </>
  );

  const renderCreateEventForm = () => (
    <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
    >
        <ScrollView contentContainerStyle={styles.formScrollContainer}>
            <View style={styles.formContainer}>
            <Text style={styles.formSectionTitle}>Create New Event</Text>

            <Text style={styles.label}>Event Name*</Text>
            <TextInput style={styles.input} value={eventName} onChangeText={setEventName} placeholder="e.g., Annual Sports Day" />

            <View style={styles.rowInputContainer}>
                <View style={styles.halfInput}>
                <Text style={styles.label}>Date*</Text>
                <TextInput style={styles.input} value={eventDate} onChangeText={setEventDate} placeholder="MM/DD/YYYY" keyboardType="numeric" />
                </View>
                <View style={styles.halfInput}>
                <Text style={styles.label}>Start Time*</Text>
                <TextInput style={styles.input} value={startTime} onChangeText={setStartTime} placeholder="HH:MM (24hr)" />
                </View>
            </View>

            <Text style={styles.label}>End Time</Text>
            <TextInput style={styles.input} value={endTime} onChangeText={setEndTime} placeholder="HH:MM (24hr)" />

            <Text style={styles.label}>Location*</Text>
            <TextInput style={styles.input} value={location} onChangeText={setLocation} placeholder="e.g., School Main Ground" />

            <Text style={styles.label}>Description*</Text>
            <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Detailed description of the event..."
                multiline
                numberOfLines={4}
                textAlignVertical="top"
            />

            <View style={styles.rowInputContainer}>
                <View style={styles.halfInput}>
                    <Text style={styles.label}>Audience*</Text>
                    <View style={styles.pickerWrapperForm}>
                    <Picker selectedValue={selectedAudience} onValueChange={setSelectedAudience} style={styles.formPicker}>
                        {audienceTypes.map(type => <Picker.Item key={type} label={type} value={type} />)}
                    </Picker>
                    </View>
                </View>
                <View style={styles.halfInput}>
                    <Text style={styles.label}>Category*</Text>
                    <View style={styles.pickerWrapperForm}>
                    <Picker selectedValue={selectedCategory} onValueChange={setSelectedCategory} style={styles.formPicker}>
                        {formCategories.map(cat => <Picker.Item key={cat} label={cat} value={cat} />)}
                    </Picker>
                    </View>
                </View>
            </View>

            {showSpecifyClassField && (
                <>
                <Text style={styles.label}>Specify Class(es) (e.g., 10A, 9B)</Text>
                <TextInput style={styles.input} value={specificClasses} onChangeText={setSpecificClasses} placeholder="Enter class names separated by commas" />
                </>
            )}

            <View style={styles.formActions}>
                <TouchableOpacity style={[styles.formButton, styles.cancelButton]} onPress={handleCancelCreate}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.formButton, styles.submitButton]} onPress={handleFormSubmit}>
                <Text style={styles.submitButtonText}>✚ Create Event</Text>
                </TouchableOpacity>
            </View>
            </View>
        </ScrollView>
    </KeyboardAvoidingView>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerBar}>
        <View style={styles.headerLeft}>
            <Text style={styles.headerIcon}>🗓️</Text>
            <View style={styles.headerTextContainer}>
                <Text style={styles.headerTitle} numberOfLines={1} ellipsizeMode="tail">Events Management</Text>
                <Text style={styles.headerSubtitle} numberOfLines={1} ellipsizeMode="tail">
                    Create, view, and manage school events and activities.
                </Text>
            </View>
        </View>
        {!isCreatingEvent && (
            <TouchableOpacity style={styles.createButton} onPress={handleCreateEventPress}>
            <Text style={styles.createButtonText}>✚ New</Text>
            </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.mainContentScroll} contentContainerStyle={styles.mainContentContainer}>
        {isCreatingEvent ? renderCreateEventForm() : renderEventListView()}
      </ScrollView>
    </SafeAreaView>
  );
};

// --- Styles ---
const PRIMARY_RED = '#E53935';
const LIGHT_BACKGROUND_PAGE = '#F4F6F8';
const CARD_BACKGROUND = '#FFFFFF';
const TEXT_DARK = '#333B42';
const TEXT_MEDIUM = '#5A6872';
const TEXT_LIGHT = '#8492A6';
const BORDER_COLOR_LIGHT = '#E5E9F2';

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: LIGHT_BACKGROUND_PAGE,
  },
  headerBar: {
    backgroundColor: CARD_BACKGROUND,
    paddingHorizontal: 10, // Further reduced horizontal padding
    paddingVertical: 8,    // Further reduced vertical padding
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: BORDER_COLOR_LIGHT,
    minHeight: 50, // Ensure a minimum height for the header
    ...Platform.select({
        ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 1.5, },
        android: { elevation: 2, }
    }),
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1, // Allow left side to take available space
    marginRight: 5, // Minimal margin before the button
  },
  headerIcon: {
    fontSize: 24, // Smaller icon
    marginRight: 6, // Smaller margin
    color: PRIMARY_RED,
  },
  headerTextContainer: {
      flex: 1, // Allow text container to shrink/grow
      overflow: 'hidden', // Important for ellipsizeMode to work with flex
  },
  headerTitle: {
    fontSize: 16, // Smaller title
    fontWeight: 'bold',
    color: TEXT_DARK,
  },
  headerSubtitle: {
    fontSize: 10, // Smaller subtitle
    color: TEXT_MEDIUM,
  },
  createButton: {
    backgroundColor: PRIMARY_RED,
    paddingVertical: 6,     // Minimal vertical padding
    paddingHorizontal: 8,   // Minimal horizontal padding
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', // Center icon and text if text exists
    // flexShrink: 0, // Button should not shrink
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 11,           // Smaller font
    fontWeight: '600',
    marginLeft: Platform.OS === 'ios' ? 2 : 0, // Add small space after icon if text is just icon
  },
  mainContentScroll: {
    flex: 1,
  },
  mainContentContainer: {
    padding: 15,
  },
  controlsContainer: {
    backgroundColor: CARD_BACKGROUND,
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    ...Platform.select({
        ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 2, },
        android: { elevation: 1, }
    }),
  },
  searchContainer: {
    marginBottom: 15,
  },
  searchInput: {
    backgroundColor: LIGHT_BACKGROUND_PAGE,
    paddingHorizontal: 15,
    paddingVertical: Platform.OS === 'ios' ? 12 : 10,
    borderRadius: 6,
    fontSize: 14,
    borderWidth: 1,
    borderColor: BORDER_COLOR_LIGHT,
    color: TEXT_DARK,
  },
  filterContainer: {
    // No specific styles needed
  },
  filterLabel: {
    fontSize: 13,
    color: TEXT_MEDIUM,
    marginBottom: 5,
    fontWeight: '500',
  },
  pickerWrapper: {
    backgroundColor: LIGHT_BACKGROUND_PAGE,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: BORDER_COLOR_LIGHT,
    justifyContent: 'center',
  },
  filterPicker: {
    height: Platform.OS === 'ios' ? undefined : 50,
    color: TEXT_DARK,
    paddingVertical: Platform.OS === 'ios' ? 10 : 0,
  },
  eventCard: {
    backgroundColor: CARD_BACKGROUND,
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    borderLeftWidth: 5,
    ...Platform.select({
        ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 3, },
        android: { elevation: 2, }
    }),
  },
  eventCardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  eventTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: PRIMARY_RED,
    flex: 1,
    marginRight: 10,
  },
  categoryTag: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    alignSelf: 'flex-start',
  },
  categoryTagText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  eventDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    flexWrap: 'wrap',
  },
  eventIcon: {
    fontSize: 13,
    marginRight: 6,
    color: TEXT_MEDIUM,
  },
  eventDetailText: {
    fontSize: 13,
    color: TEXT_MEDIUM,
    marginRight: 5,
  },
  eventAudience: {
    fontSize: 13,
    color: TEXT_MEDIUM,
    marginTop: 4,
    marginBottom: 8,
  },
  eventDescription: {
    fontSize: 14,
    color: TEXT_DARK,
    lineHeight: 20,
    marginBottom: 8,
  },
  eventMeta: {
    fontSize: 11,
    color: TEXT_LIGHT,
    fontStyle: 'italic',
    marginTop: 4,
  },
  noEventsText: {
    textAlign: 'center',
    marginTop: 30,
    fontSize: 15,
    color: TEXT_MEDIUM,
  },
  // Form Styles
  formScrollContainer: {
    paddingBottom: 30,
  },
  formContainer: {
    backgroundColor: CARD_BACKGROUND,
    borderRadius: 8,
    padding: 20,
    ...Platform.select({
        ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3, },
        android: { elevation: 2, }
    }),
  },
  formSectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: TEXT_DARK,
    marginBottom: 20,
    textAlign: 'center',
    borderBottomWidth: 1,
    borderBottomColor: BORDER_COLOR_LIGHT,
    paddingBottom: 10,
  },
  label: {
    fontSize: 14,
    color: TEXT_MEDIUM,
    marginBottom: 6,
    fontWeight: '500',
  },
  input: {
    backgroundColor: LIGHT_BACKGROUND_PAGE,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 12 : 10,
    borderRadius: 6,
    fontSize: 15,
    borderWidth: 1,
    borderColor: BORDER_COLOR_LIGHT,
    marginBottom: 15,
    color: TEXT_DARK,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  rowInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    flex: 0.48,
  },
  pickerWrapperForm: {
    backgroundColor: LIGHT_BACKGROUND_PAGE,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: BORDER_COLOR_LIGHT,
    marginBottom: 15,
    justifyContent: 'center',
  },
  formPicker: {
    height: Platform.OS === 'ios' ? undefined : 50,
    color: TEXT_DARK,
    paddingVertical: Platform.OS === 'ios' ? 10 : 0,
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
  },
  formButton: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 6,
    marginLeft: 10,
    minWidth: 100,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#B0BEC5',
  },
  cancelButtonText: {
    color: TEXT_DARK,
    fontWeight: '600',
    fontSize: 14,
  },
  submitButton: {
    backgroundColor: PRIMARY_RED,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default TeacherEvents;