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

// --- Mock Data ---
const initialPTMsData = []; // Start with an empty list as per the image

const ptmStatuses = ['All Statuses', 'Scheduled', 'Upcoming', 'Completed', 'Cancelled'];
const classList = ['Class 10A', 'Class 9B', 'Class 8C', 'Class 7D', 'Class 6E'];
const formPtmStatuses = ['Scheduled', 'Upcoming', 'Completed', 'Cancelled']; // For the form dropdown

// --- Constants ---
const PRIMARY_PURPLE = '#7F56D9'; // A vibrant purple matching the image
const LIGHT_BACKGROUND_PAGE = '#F9FAFB'; // Very light gray for page background
const CARD_BACKGROUND = '#FFFFFF';
const TEXT_DARK = '#1F2937'; // Dark gray for main text
const TEXT_MEDIUM = '#6B7280'; // Medium gray for secondary text/labels
const TEXT_LIGHT = '#9CA3AF'; // Light gray for placeholders
const BORDER_COLOR_LIGHT = '#E5E7EB'; // Light border for inputs/cards

// --- Main Component ---
const TeacherPTM = () => {
  const [isSchedulingPTM, setIsSchedulingPTM] = useState(false);
  const [ptms, setPtms] = useState(initialPTMsData);
  const [filteredPtms, setFilteredPtms] = useState(initialPTMsData);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilterStatus, setSelectedFilterStatus] = useState(ptmStatuses[0]);

  // Form State
  const [selectedClass, setSelectedClass] = useState(classList[0]);
  const [ptmDate, setPtmDate] = useState('');
  const [ptmTime, setPtmTime] = useState('');
  const [subjectFocus, setSubjectFocus] = useState('');
  const [notesAgenda, setNotesAgenda] = useState('');
  const [selectedPtmStatus, setSelectedPtmStatus] = useState(formPtmStatuses[0]);

  useEffect(() => {
    // Basic filtering logic (can be expanded)
    let newFilteredPtms = ptms.filter(ptm => {
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        (ptm.className && ptm.className.toLowerCase().includes(term)) ||
        (ptm.subjectFocus && ptm.subjectFocus.toLowerCase().includes(term)) ||
        (ptm.notes && ptm.notes.toLowerCase().includes(term));

      const matchesStatus =
        selectedFilterStatus === 'All Statuses' || ptm.status === selectedFilterStatus;

      return matchesSearch && matchesStatus;
    });
    setFilteredPtms(newFilteredPtms);
  }, [searchTerm, selectedFilterStatus, ptms]);

  const resetForm = () => {
    setSelectedClass(classList[0]);
    setPtmDate('');
    setPtmTime('');
    setSubjectFocus('');
    setNotesAgenda('');
    setSelectedPtmStatus(formPtmStatuses[0]);
  };

  const handleScheduleNewPTMPress = () => {
    resetForm();
    setIsSchedulingPTM(true);
  };

  const handleCancelSchedule = () => {
    setIsSchedulingPTM(false);
  };

  const handleFormSubmit = () => {
    if (!selectedClass || !ptmDate.trim() || !ptmTime.trim() || !subjectFocus.trim()) {
      Alert.alert('Missing Information', 'Please fill in Class, Date, Time, and Subject/Focus Area.');
      return;
    }
    const newPTM = {
      id: String(Date.now()), // Simple ID generation
      className: selectedClass,
      date: ptmDate,
      time: ptmTime,
      subjectFocus: subjectFocus,
      notes: notesAgenda,
      status: selectedPtmStatus,
    };
    setPtms(prevPtms => [newPTM, ...prevPtms]);
    Alert.alert('PTM Scheduled', `PTM for ${selectedClass} has been scheduled.`);
    setIsSchedulingPTM(false);
  };

  // --- Render Views ---
  const renderPTMListView = () => (
    <>
      <View style={styles.controlsContainer}>
        <View style={styles.searchRow}>
          <View style={styles.searchInputContainer}>
            <Text style={styles.inputLabel}>Search PTMs</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search by class, subject focus, notes..."
              placeholderTextColor={TEXT_LIGHT}
              value={searchTerm}
              onChangeText={setSearchTerm}
            />
          </View>
          <View style={styles.filterContainer}>
            <Text style={styles.inputLabel}>Filter by Status</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={selectedFilterStatus}
                onValueChange={(itemValue) => setSelectedFilterStatus(itemValue)}
                style={styles.filterPicker}
                dropdownIconColor={PRIMARY_PURPLE}
              >
                {ptmStatuses.map((status) => <Picker.Item key={status} label={status} value={status} />)}
              </Picker>
            </View>
          </View>
        </View>
      </View>

      {filteredPtms.length > 0 ? (
        // This is where you would map through `filteredPtms` and render PTM cards
        // For now, we'll keep it empty as per the image
        <Text style={styles.noItemsText}>Render PTM Cards Here</Text>
      ) : (
        <View style={styles.emptyStateContainer}>
          <Text style={styles.noItemsText}>No PTMs found matching your criteria.</Text>
        </View>
      )}
    </>
  );

  const renderScheduleFormView = () => (
    <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
    >
        <ScrollView contentContainerStyle={styles.formScrollContainer}>
            <View style={styles.formContainer}>
            <Text style={styles.formSectionTitle}>Schedule New Class PTM</Text>

            <Text style={styles.label}>Class</Text>
            <View style={styles.pickerWrapperForm}>
                <Picker selectedValue={selectedClass} onValueChange={setSelectedClass} style={styles.formPicker}>
                    {classList.map(cls => <Picker.Item key={cls} label={cls} value={cls} />)}
                </Picker>
            </View>

            <View style={styles.rowInputContainer}>
                <View style={styles.halfInput}>
                    <Text style={styles.label}>Date</Text>
                    <TextInput style={styles.input} value={ptmDate} onChangeText={setPtmDate} placeholder="dd-mm-yyyy" keyboardType="numeric" />
                </View>
                <View style={styles.halfInput}>
                    <Text style={styles.label}>Time</Text>
                    <TextInput style={styles.input} value={ptmTime} onChangeText={setPtmTime} placeholder="--:--" />
                </View>
            </View>

            <Text style={styles.label}>Subject/Focus Area</Text>
            <TextInput style={styles.input} value={subjectFocus} onChangeText={setSubjectFocus} placeholder="e.g., Math, General Progress" />

            <Text style={styles.label}>Notes/Agenda</Text>
            <TextInput
                style={[styles.input, styles.textArea]}
                value={notesAgenda}
                onChangeText={setNotesAgenda}
                placeholder="Details for the meeting..."
                multiline
                numberOfLines={4}
                textAlignVertical="top"
            />

            <Text style={styles.label}>Status</Text>
             <View style={styles.pickerWrapperForm}>
                <Picker selectedValue={selectedPtmStatus} onValueChange={setSelectedPtmStatus} style={styles.formPicker}>
                    {formPtmStatuses.map(status => <Picker.Item key={status} label={status} value={status} />)}
                </Picker>
            </View>


            <View style={styles.formActions}>
                <TouchableOpacity style={[styles.formButton, styles.cancelButton]} onPress={handleCancelSchedule}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.formButton, styles.submitButton]} onPress={handleFormSubmit}>
                <Text style={styles.submitButtonIcon}>💾</Text>
                <Text style={styles.submitButtonText}>Schedule PTM</Text>
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
                <Text style={styles.headerTitle}>PTM Management</Text>
                <Text style={styles.headerSubtitle} numberOfLines={1} ellipsizeMode="tail">
                    Schedule & Manage PTM.
                </Text>
            </View>
        </View>
        {!isSchedulingPTM && (
            <TouchableOpacity style={styles.scheduleButtonHeader} onPress={handleScheduleNewPTMPress}>
            <Text style={styles.scheduleButtonIcon}>⊕</Text>
            <Text style={styles.scheduleButtonText}>Schedule New Class PTM</Text>
            </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.mainContentScroll} contentContainerStyle={styles.mainContentContainer}>
        {isSchedulingPTM ? renderScheduleFormView() : renderPTMListView()}
      </ScrollView>
    </SafeAreaView>
  );
};

// --- Styles ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: LIGHT_BACKGROUND_PAGE,
  },
  headerBar: {
    backgroundColor: CARD_BACKGROUND,
    paddingHorizontal: 15,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: BORDER_COLOR_LIGHT,
    minHeight: 60,
    ...Platform.select({
        ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 1.5, },
        android: { elevation: 2, }
    }),
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  headerIcon: {
    fontSize: 28, // Calendar with plus icon
    marginRight: 10,
    color: PRIMARY_PURPLE,
  },
  headerTextContainer: {
      flexShrink: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: TEXT_DARK,
  },
  headerSubtitle: {
    fontSize: 12,
    color: TEXT_MEDIUM,
    marginTop: 2,
  },
  scheduleButtonHeader: {
    backgroundColor: PRIMARY_PURPLE,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  scheduleButtonIcon: {
    color: '#FFFFFF',
    fontSize: 16,
    marginRight: 6,
    fontWeight: 'bold',
  },
  scheduleButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
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
    marginBottom: 20,
    ...Platform.select({
        ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 2, },
        android: { elevation: 1, }
    }),
  },
  searchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end', // Align based on bottom of elements
  },
  searchInputContainer: {
    flex: 0.6, // Takes more space
    marginRight: 10,
  },
  filterContainer: {
    flex: 0.4, // Takes less space
  },
  inputLabel: { // Label for search and filter
    fontSize: 13,
    color: TEXT_MEDIUM,
    marginBottom: 5,
    fontWeight: '500',
  },
  searchInput: {
    backgroundColor: LIGHT_BACKGROUND_PAGE,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 12 : 10,
    borderRadius: 6,
    fontSize: 14,
    borderWidth: 1,
    borderColor: BORDER_COLOR_LIGHT,
    color: TEXT_DARK,
  },
  pickerWrapper: {
    backgroundColor: LIGHT_BACKGROUND_PAGE,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: BORDER_COLOR_LIGHT,
    justifyContent: 'center', // Vertically center picker content on Android
  },
  filterPicker: {
    height: Platform.OS === 'ios' ? undefined : 50, // Android needs explicit height
    color: TEXT_DARK,
    // On iOS, padding for wrapper might be better for height control if needed
    paddingVertical: Platform.OS === 'ios' ? (Platform.Version >= "13.4" ? 0 : 10) : 0, // Adjust for newer iOS picker style
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  noItemsText: {
    textAlign: 'center',
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
    marginBottom: 25,
    textAlign: 'left', // As per form image
  },
  label: {
    fontSize: 14,
    color: TEXT_MEDIUM,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: CARD_BACKGROUND, // Inputs in form are white
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 12 : 10,
    borderRadius: 6,
    fontSize: 15,
    borderWidth: 1,
    borderColor: BORDER_COLOR_LIGHT,
    marginBottom: 18,
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
    backgroundColor: CARD_BACKGROUND, // Pickers in form are white
    borderRadius: 6,
    borderWidth: 1,
    borderColor: BORDER_COLOR_LIGHT,
    marginBottom: 18,
    justifyContent: 'center',
  },
  formPicker: {
    height: Platform.OS === 'ios' ? undefined : 50,
    color: TEXT_DARK,
    paddingVertical: Platform.OS === 'ios' ? (Platform.Version >= "13.4" ? 0 : 10) : 0,
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 25,
    borderTopWidth: 1,
    borderTopColor: BORDER_COLOR_LIGHT,
    paddingTop: 20,
  },
  formButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginLeft: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#E5E7EB', // Light gray for cancel
  },
  cancelButtonText: {
    color: TEXT_DARK,
    fontWeight: '600',
    fontSize: 15,
  },
  submitButton: {
    backgroundColor: PRIMARY_PURPLE,
  },
  submitButtonIcon: {
    color: '#FFFFFF',
    fontSize: 16,
    marginRight: 8,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 15,
  },
});

export default TeacherPTM;