// TeacherHomework.jsx
import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
  StyleSheet,
  Alert,
  Platform,
  ScrollView,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';

// --- Configuration & Constants ---
const COLORS = {
  primary: '#007bff',
  primaryDark: '#0056b3',
  secondary: '#ffc107',
  dark: '#343a40',
  text: '#212529',
  muted: '#6c757d',
  white: '#ffffff',
  danger: '#dc3545',
  success: '#28a745',
  info: '#17a2b8',
  background: '#f4f6f8', // Slightly adjusted background
  card: '#ffffff',
  borderColor: '#dee2e6',
  placeholder: '#adb5bd',
};

const initialAssignments = [
  { id: '1', title: 'Algebra Chapter 5 Problems', description: 'Solve all odd-numbered problems from Chapter 5. This might be a slightly longer description to test wrapping.', subject: 'Mathematics', class: 'Class 10A', dueDate: new Date('2024-11-15'), status: 'Published', submissions: '18/25' },
  { id: '2', title: 'Essay: The French Revolution - Causes and Effects', description: 'A 500-word essay on the causes and effects of the French Revolution.', subject: 'History', class: 'Class 9B', dueDate: new Date('2024-11-20'), status: 'Grading Complete', submissions: '22/22' },
  { id: '3', title: 'Photosynthesis Lab Report', description: 'Submit your detailed lab report including observations and conclusions.', subject: 'Science', class: 'Class 10A', dueDate: new Date('2024-11-25'), status: 'Published', submissions: '5/25' },
  { id: '4', title: 'Poetry Analysis: "The Raven" by Edgar Allan Poe', description: 'Analyze the themes and literary devices used in "The Raven".', subject: 'English', class: 'Class 8A', dueDate: new Date('2024-11-22'), status: 'Draft', submissions: 'N/A' },
];

const SUBJECT_OPTIONS = [
  { label: 'Select Subject', value: '' }, { label: 'General Duties', value: 'General Duties' }, { label: 'Mathematics', value: 'Mathematics' }, { label: 'Science', value: 'Science' }, { label: 'History', value: 'History' }, { label: 'English', value: 'English' },
];

const formatDate = (date) => {
  if (!date) return 'N/A';
  const d = new Date(date);
  const year = d.getFullYear();
  const month = (`0${d.getMonth() + 1}`).slice(-2);
  const day = (`0${d.getDate()}`).slice(-2);
  return `${year}-${month}-${day}`;
};

const getStatusStyle = (status) => {
  switch (status) {
    case 'Published': return { backgroundColor: COLORS.success, color: COLORS.white };
    case 'Draft': return { backgroundColor: COLORS.secondary, color: COLORS.dark };
    case 'Grading Complete': return { backgroundColor: COLORS.info, color: COLORS.white };
    default: return { backgroundColor: COLORS.muted, color: COLORS.white };
  }
};

const TeacherHomework = () => {
  const [assignments, setAssignments] = useState(initialAssignments);
  const [filteredAssignments, setFilteredAssignments] = useState(initialAssignments);
  const [searchText, setSearchText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  const [newAssignmentTitle, setNewAssignmentTitle] = useState('');
  const [newAssignmentSubject, setNewAssignmentSubject] = useState(SUBJECT_OPTIONS[0].value);
  const [newAssignmentClass, setNewAssignmentClass] = useState('');
  const [newAssignmentDueDate, setNewAssignmentDueDate] = useState(new Date());
  const [newAssignmentDescription, setNewAssignmentDescription] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    const lowercasedFilter = searchText.toLowerCase();
    const filteredData = assignments.filter(item =>
      item.title.toLowerCase().includes(lowercasedFilter) ||
      item.subject.toLowerCase().includes(lowercasedFilter) ||
      item.class.toLowerCase().includes(lowercasedFilter)
    );
    setFilteredAssignments(filteredData);
  }, [searchText, assignments]);

  const openNewAssignmentModal = () => {
    setNewAssignmentTitle(''); setNewAssignmentSubject(SUBJECT_OPTIONS[0].value); setNewAssignmentClass('');
    setNewAssignmentDueDate(new Date()); setNewAssignmentDescription(''); setShowDatePicker(false);
    setModalVisible(true);
  };

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || newAssignmentDueDate;
    setShowDatePicker(Platform.OS === 'ios');
    setNewAssignmentDueDate(currentDate);
    if (Platform.OS !== 'ios') setShowDatePicker(false);
  };

  const validateForm = () => {
    if (!newAssignmentTitle.trim()) { Alert.alert('Validation Error', 'Title is required.'); return false; }
    if (!newAssignmentSubject) { Alert.alert('Validation Error', 'Subject is required.'); return false; }
    if (!newAssignmentClass.trim()) { Alert.alert('Validation Error', 'Class Name is required.'); return false; }
    if (!newAssignmentDescription.trim()) { Alert.alert('Validation Error', 'Description/Instructions are required.'); return false; }
    return true;
  };

  const createAssignment = (status) => {
    if (!validateForm()) return;
    const newAssignment = {
      id: Date.now().toString(), title: newAssignmentTitle.trim(), subject: newAssignmentSubject,
      class: newAssignmentClass.trim(), dueDate: newAssignmentDueDate, description: newAssignmentDescription.trim(),
      status: status, submissions: status === 'Draft' ? 'N/A' : '0/0',
    };
    setAssignments(prev => [newAssignment, ...prev].sort((a,b) => b.dueDate - a.dueDate));
    setModalVisible(false);
    Alert.alert('Success', `Assignment ${status === 'Published' ? 'published' : 'saved as draft'}.`);
  };

  const handleDeleteAssignment = (id) => {
    Alert.alert('Confirm Delete', 'Are you sure you want to delete this assignment?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => {
          setAssignments(prev => prev.filter(item => item.id !== id));
          Alert.alert('Deleted', 'Assignment has been deleted.');
      }},
    ]);
  };

  const handleEditAssignment = (item) => {
    Alert.alert('Edit Action', `Editing: ${item.title}. (Full edit functionality not implemented)`);
  };

  const renderAssignmentItem = ({ item }) => {
    const statusStyles = getStatusStyle(item.status);
    return (
      <View style={styles.card}>
        {/* Row 1: Title and Status */}
        <View style={styles.cardRowSpaced}>
          <Text style={styles.itemTitle}>{item.title}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusStyles.backgroundColor }]}>
            <Text style={[styles.statusText, { color: statusStyles.color }]}>{item.status}</Text>
          </View>
        </View>

        {/* Row 2: Description */}
        <Text style={styles.itemDescription}>{item.description}</Text>

        {/* Row 3: Subject/Class & Due Date */}
        <View style={styles.cardRow}>
          <View style={styles.detailItem}>
            <Icon name="book-outline" size={16} color={COLORS.muted} style={styles.detailIcon} />
            <Text style={styles.detailText} numberOfLines={2} ellipsizeMode="tail">{item.subject} - {item.class}</Text>
          </View>
          <View style={[styles.detailItem, styles.detailItemAlignEnd]}>
            <Icon name="calendar-clock" size={16} color={COLORS.muted} style={styles.detailIcon} />
            <Text style={styles.detailText}>{formatDate(item.dueDate)}</Text>
          </View>
        </View>

        {/* Row 4: Submissions & Actions */}
        <View style={styles.cardRow}>
          <View style={styles.detailItem}>
            <Icon name="file-check-outline" size={16} color={COLORS.muted} style={styles.detailIcon} />
            <Text style={styles.detailText}>Submissions: {item.submissions}</Text>
          </View>
          <View style={[styles.detailItem, styles.detailItemAlignEnd, styles.actionsContainer]}>
            <TouchableOpacity onPress={() => handleEditAssignment(item)} style={styles.actionButton}>
              <Icon name="pencil-outline" size={21} color={COLORS.primary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDeleteAssignment(item.id)} style={styles.actionButton}>
              <Icon name="trash-can-outline" size={21} color={COLORS.danger} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
            <View style={styles.headerTitleContainer}>
                <Icon name="format-list-checks" size={30} color={COLORS.primary} />
                <Text style={styles.headerTitle}>Assignments Management</Text>
            </View>
            <TouchableOpacity style={styles.createButton} onPress={openNewAssignmentModal}>
                <Icon name="plus-circle-outline" size={18} color={COLORS.white} />
                <Text style={styles.createButtonText}>Create New</Text>
            </TouchableOpacity>
        </View>
        <Text style={styles.headerSubtitle}>Create, view, and manage assignments for your classes.</Text>

        <View style={styles.searchContainer}>
          <Icon name="magnify" size={20} color={COLORS.muted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput} placeholder="Search assignments..."
            placeholderTextColor={COLORS.placeholder} value={searchText} onChangeText={setSearchText}
          />
        </View>

        <FlatList
          data={filteredAssignments} renderItem={renderAssignmentItem} keyExtractor={item => item.id}
          contentContainerStyle={styles.listContentContainer}
          ListEmptyComponent={<Text style={styles.emptyListText}>No assignments found.</Text>}
        />

        <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalView}>
            <ScrollView contentContainerStyle={{ paddingBottom: 20 }} showsVerticalScrollIndicator={false}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Create New Assignment</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Icon name="close" size={26} color={COLORS.muted} />
                </TouchableOpacity>
              </View>
              <Text style={styles.label}>Title</Text>
              <TextInput style={styles.input} placeholder="e.g., Chapter 1 Quiz" value={newAssignmentTitle} onChangeText={setNewAssignmentTitle} />
              <Text style={styles.label}>Subject</Text>
              <View style={styles.pickerContainer}>
                <Picker selectedValue={newAssignmentSubject} style={styles.picker} onValueChange={setNewAssignmentSubject} dropdownIconColor={COLORS.primary}>
                  {SUBJECT_OPTIONS.map((opt) => <Picker.Item key={opt.value} label={opt.label} value={opt.value} />)}
                </Picker>
              </View>
              <Text style={styles.label}>Class Name (e.g., Class 10A)</Text>
              <TextInput style={styles.input} placeholder="e.g., Math Period 3" value={newAssignmentClass} onChangeText={setNewAssignmentClass} />
              <Text style={styles.label}>Due Date</Text>
              <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateInput}>
                <Text style={styles.dateInputText}>{formatDate(newAssignmentDueDate)}</Text>
                <Icon name="calendar-month-outline" size={22} color={COLORS.primary} />
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker value={newAssignmentDueDate} mode="date" display="default" onChange={handleDateChange} minimumDate={new Date()} />
              )}
              <Text style={styles.label}>Description/Instructions</Text>
              <TextInput style={[styles.input, styles.textArea]} placeholder="Enter assignment details..." value={newAssignmentDescription} onChangeText={setNewAssignmentDescription} multiline numberOfLines={4} />
              <View style={styles.modalActions}>
                <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setModalVisible(false)}>
                  <Text style={[styles.modalButtonText, {color: COLORS.dark}]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalButton, styles.draftButton]} onPress={() => createAssignment('Draft')}>
                  <Text style={[styles.modalButtonText, {color: COLORS.dark}]}>Save as Draft</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalButton, styles.publishButton]} onPress={() => createAssignment('Published')}>
                  <Text style={styles.modalButtonText}>Publish</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

const screenWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1, paddingHorizontal: 15, paddingTop: Platform.OS === 'android' ? 15 : 10 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, marginBottom: 5 },
  headerTitleContainer: { flexDirection: 'row', alignItems: 'center', flexShrink: 1 },
  headerTitle: { fontSize: 17, fontWeight: 'bold', color: COLORS.dark, marginLeft: 10, marginRight: 5 },
  headerSubtitle: { fontSize: 13, color: COLORS.muted, marginBottom: 15, marginLeft: 5 },
  createButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6, // More standard rectangle
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2, // Subtle shadow
  },
  createButtonText: { color: COLORS.white, fontWeight: '600', fontSize: 13, marginLeft: 6 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: 25, paddingHorizontal: 15, marginBottom: 15, borderColor: COLORS.borderColor, borderWidth: 1, height: 45 },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 15, color: COLORS.text },
  listContentContainer: { paddingBottom: 20 },

  card: {
    backgroundColor: COLORS.card,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
  },
  cardRow: { // For rows where items are side-by-side and might need different alignments
    flexDirection: 'row',
    alignItems: 'center', // Default alignment
    marginBottom: 10,
  },
  cardRowSpaced: { // Specifically for title and status
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start', // Title can wrap, status stays top-right
    marginBottom: 8,
  },
  itemTitle: {
    flex: 1, // Allows title to take available space and wrap
    fontSize: 16,
    fontWeight: 'bold', // Bolder title
    color: COLORS.dark,
    marginRight: 8, // Space before status badge
  },
  statusBadge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 10,
    alignSelf: 'flex-start', // Important for alignment with multi-line title
  },
  statusText: { fontSize: 11, fontWeight: 'bold' },
  itemDescription: {
    fontSize: 13,
    color: COLORS.muted,
    lineHeight: 18,
    marginBottom: 12,
    textAlign: 'left', // Ensure LTR text alignment
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1, // Each detail item (left/right column) takes up half space
    paddingRight: 5, // Add some space if next to another detailItem
  },
  detailItemAlignEnd: { // Used for right-column items if they need specific alignment
     justifyContent: 'flex-start', // Default for text content, actions will override
  },
  detailIcon: {
    marginRight: 6,
  },
  detailText: {
    fontSize: 12.5,
    color: COLORS.text,
    flexShrink: 1, // Allow text to shrink and wrap if necessary
  },
  actionsContainer: {
    justifyContent: 'flex-end', // Pushes icons to the far right of this flex item
  },
  actionButton: {
    padding: 4, // Make tap area slightly bigger
    marginLeft: 10, // Space between action buttons
  },
  emptyListText: { textAlign: 'center', marginTop: 50, fontSize: 16, color: COLORS.muted },

  // Modal Styles (largely unchanged, but ensure they are consistent)
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.55)' },
  modalView: { width: screenWidth * 0.92, maxHeight: '88%', backgroundColor: COLORS.white, borderRadius: 12, paddingHorizontal: 18, paddingTop: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 12, marginBottom: 15, borderBottomWidth: 1, borderBottomColor: COLORS.borderColor },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.dark },
  label: { fontSize: 14, fontWeight: '500', color: COLORS.text, marginBottom: 5, marginTop: 8 },
  input: { backgroundColor: COLORS.background, borderColor: COLORS.borderColor, borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: Platform.OS === 'ios' ? 12 : 10, fontSize: 15, color: COLORS.text, marginBottom: 10 },
  textArea: { height: 100, textAlignVertical: 'top' },
  pickerContainer: { backgroundColor: COLORS.background, borderColor: COLORS.borderColor, borderWidth: 1, borderRadius: 8, marginBottom: 10 },
  picker: { height: Platform.OS === 'ios' ? 120 : 50, width: '100%', color: COLORS.text },
  dateInput: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.background, borderColor: COLORS.borderColor, borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: Platform.OS === 'ios' ? 12 : 10, marginBottom: 10 },
  dateInputText: { fontSize: 15, color: COLORS.text },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 20, paddingTop: 15, borderTopWidth: 1, borderTopColor: COLORS.borderColor, paddingBottom: Platform.OS === 'ios' ? 10 : 15 },
  modalButton: { borderRadius: 8, paddingVertical: 10, paddingHorizontal: 12, marginLeft: 8, alignItems: 'center' },
  modalButtonText: { fontSize: 14, fontWeight: '600' },
  cancelButton: { backgroundColor: '#e9ecef' },
  draftButton: { backgroundColor: COLORS.secondary },
  publishButton: { backgroundColor: COLORS.primary },
});

export default TeacherHomework;