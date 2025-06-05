// TeacherResults.jsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');

const AppColors = {
  primary: '#6A1B9A', // Deep Purple
  primaryLight: '#9C4DCC',
  accent: '#4A148C',   // Darker Purple for accents or CTA
  background: '#F3E5F5', // Light Purple background
  cardBackground: '#FFFFFF',
  textPrimary: '#212121',
  textSecondary: '#757575',
  textOnPrimary: '#FFFFFF',
  placeholderText: '#BDBDBD',
  borderColor: '#E0E0E0',
  success: '#4CAF50',
  successLight: '#E8F5E9',
  danger: '#F44336',
  infoText: '#6A1B9A', // Same as primary for info text
};

const EXAM_TYPES = [
  "Unit Test - 1",
  "Unit Test - 2",
  "Quarterly Exam",
  "Unit Test - 3",
  "Unit Test - 4",
  "Half Yearly Exam",
  "Unit Test - 5",
  "Annual Exam",
];

// Sample Data
const INITIAL_CLASSES_DATA = [
  {
    id: 'c1s1',
    className: 'Class 10A',
    subject: 'Mathematics',
    students: [
      { studentId: 's10a_01', roll: '01', name: 'Alex Johnson', lastUpdated: '2024-11-08T15:30:00Z', examRecords: {} },
      { studentId: 's10a_02', roll: '02', name: 'Priya Singh', lastUpdated: '2024-11-07T20:00:00Z', examRecords: {} },
      { studentId: 's10a_03', roll: '03', name: 'Tiny Tot', lastUpdated: '2024-11-06T16:30:00Z', examRecords: {} },
    ],
  },
  {
    id: 'c2s1',
    className: 'Class 9B',
    subject: 'Mathematics',
    students: [
      { studentId: 's9b_01', roll: '01', name: 'Sam Lee', lastUpdated: '2024-11-05T10:00:00Z', examRecords: {} },
      { studentId: 's9b_02', roll: '02', name: 'Mia Wong', lastUpdated: '2024-11-04T14:00:00Z', examRecords: {} },
    ],
  },
  {
    id: 'c3s1',
    className: 'Class 8A',
    subject: 'Mathematics',
    students: [
      { studentId: 's8a_01', roll: '01', name: 'Ben Green', lastUpdated: '2024-11-03T09:00:00Z', examRecords: {} },
    ],
  },
  {
    id: 'c1s2',
    className: 'Class 10A',
    subject: 'Science',
    students: [
      { studentId: 's10a_s_01', roll: '01', name: 'Alex Johnson', lastUpdated: '2024-11-02T11:00:00Z', examRecords: {} },
    ],
  },
];

// Initialize examRecords for each student
INITIAL_CLASSES_DATA.forEach(classItem => {
  classItem.students.forEach(student => {
    EXAM_TYPES.forEach(exam => {
      student.examRecords[exam] = { grade: '', marks: '', comments: '' };
    });
  });
});

// Helper to format date
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } catch (e) {
    return dateString;
  }
};

// --- Components ---

// Card for Class/Subject List
const ClassSubjectCard = ({ classItem, onPress }) => (
  <TouchableOpacity style={styles.classCard} onPress={() => onPress(classItem)}>
    <View style={styles.classCardHeader}>
      <MaterialCommunityIcons name="google-classroom" size={28} color={AppColors.primary} />
      <View style={styles.classCardHeaderText}>
        <Text style={styles.classCardTitle}>{classItem.className}</Text>
        <Text style={styles.classCardSubtitle}>{classItem.subject}</Text>
      </View>
    </View>
    <Text style={styles.classCardStudents}>Students: {classItem.students.length}</Text>
    <View style={styles.classCardAction}>
      <Text style={styles.classCardActionText}>View Student Progress</Text>
      <MaterialCommunityIcons name="arrow-right-thin" size={20} color={AppColors.primary} />
    </View>
  </TouchableOpacity>
);

// Row for Student List
const StudentListItem = ({ student, onUpdate }) => (
  <View style={styles.studentRow}>
    <Text style={[styles.studentCell, styles.rollCell]}>{student.roll}</Text>
    <Text style={[styles.studentCell, styles.nameCell]}>{student.name}</Text>
    <Text style={[styles.studentCell, styles.dateCell]}>{formatDate(student.lastUpdated)}</Text>
    <TouchableOpacity style={[styles.studentCell, styles.actionCell]} onPress={() => onUpdate(student)}>
      <MaterialCommunityIcons name="file-edit-outline" size={20} color={AppColors.primary} />
      <Text style={styles.updateText}> Update Records</Text>
    </TouchableOpacity>
  </View>
);

// Modal for Updating Exam Records
const UpdateRecordsModal = ({ visible, student, classSubject, onClose, onSave }) => {
  const [examData, setExamData] = useState({});

  useEffect(() => {
    if (student && student.examRecords) {
      // Deep copy to avoid mutating original state directly
      setExamData(JSON.parse(JSON.stringify(student.examRecords)));
    } else {
      // Initialize if no records (should not happen with current data setup)
      const initialData = {};
      EXAM_TYPES.forEach(exam => {
        initialData[exam] = { grade: '', marks: '', comments: '' };
      });
      setExamData(initialData);
    }
  }, [student]);

  const handleInputChange = (examType, field, value) => {
    setExamData(prevData => ({
      ...prevData,
      [examType]: {
        ...prevData[examType],
        [field]: value,
      },
    }));
  };

  const handleSave = () => {
    onSave(student.studentId, examData);
    onClose();
  };

  if (!student) return null;

  return (
    <Modal animationType="slide" transparent={false} visible={visible} onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20} // Adjust as needed
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle} numberOfLines={2}>
              Update Exam Records for {student.name} ({classSubject?.className} - {classSubject?.subject})
            </Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialCommunityIcons name="close-circle-outline" size={28} color={AppColors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.modalScrollView}>
            {EXAM_TYPES.map(examType => (
              <View key={examType} style={styles.examSection}>
                <Text style={styles.examTypeTitle}>{examType}</Text>
                <View style={styles.inputRow}>
                  <TextInput
                    style={[styles.inputField, styles.gradeMarksInput]}
                    placeholder="Grade"
                    placeholderTextColor={AppColors.placeholderText}
                    value={examData[examType]?.grade || ''}
                    onChangeText={text => handleInputChange(examType, 'grade', text)}
                  />
                  <TextInput
                    style={[styles.inputField, styles.gradeMarksInput]}
                    placeholder="Marks"
                    placeholderTextColor={AppColors.placeholderText}
                    value={examData[examType]?.marks || ''}
                    onChangeText={text => handleInputChange(examType, 'marks', text)}
                    keyboardType="numeric"
                  />
                </View>
                <TextInput
                  style={[styles.inputField, styles.commentsInput]}
                  placeholder="Comments..."
                  placeholderTextColor={AppColors.placeholderText}
                  value={examData[examType]?.comments || ''}
                  onChangeText={text => handleInputChange(examType, 'comments', text)}
                  multiline
                  numberOfLines={3}
                />
              </View>
            ))}
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={onClose}>
              <Text style={[styles.modalButtonText, styles.cancelButtonText]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.modalButton, styles.saveButton]} onPress={handleSave}>
              <MaterialCommunityIcons name="content-save-all-outline" size={20} color={AppColors.textOnPrimary} />
              <Text style={styles.modalButtonText}>Save All Changes</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

// Main TeacherResults Component
const TeacherResults = () => {
  const [currentView, setCurrentView] = useState('classList'); // 'classList' or 'studentList'
  const [classesData, setClassesData] = useState(INITIAL_CLASSES_DATA);
  const [selectedClassSubject, setSelectedClassSubject] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false);

  const studentsForSelectedClass = useMemo(() => {
    if (!selectedClassSubject) return [];
    const classObj = classesData.find(c => c.id === selectedClassSubject.id);
    return classObj ? classObj.students : [];
  }, [selectedClassSubject, classesData]);

  const handleSelectClassSubject = (classItem) => {
    setSelectedClassSubject(classItem);
    setCurrentView('studentList');
  };

  const handleBackToClassList = () => {
    setCurrentView('classList');
    setSelectedClassSubject(null);
  };

  const handleOpenUpdateModal = (student) => {
    setSelectedStudent(student);
    setIsUpdateModalVisible(true);
  };

  const handleCloseUpdateModal = () => {
    setIsUpdateModalVisible(false);
    setSelectedStudent(null);
  };

  const handleSaveExamRecords = (studentId, updatedExamRecords) => {
    setClassesData(prevClassesData => {
      return prevClassesData.map(classItem => {
        if (classItem.id === selectedClassSubject.id) {
          return {
            ...classItem,
            students: classItem.students.map(student => {
              if (student.studentId === studentId) {
                return {
                  ...student,
                  examRecords: updatedExamRecords,
                  lastUpdated: new Date().toISOString(),
                };
              }
              return student;
            }),
          };
        }
        return classItem;
      });
    });
    // No need to call handleCloseUpdateModal here as it's called by the modal itself
  };

  // Render Class List View
  const renderClassListView = () => (
    <>
      <FlatList
        data={classesData}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <ClassSubjectCard classItem={item} onPress={handleSelectClassSubject} />}
        contentContainerStyle={styles.listContainer}
        numColumns={width > 600 ? 2 : 1} // Responsive columns for tablets
      />
      <View style={styles.bottomInfoBanner}>
        <MaterialCommunityIcons name="information-outline" size={22} color={AppColors.infoText} />
        <Text style={styles.bottomInfoText}>
          Select a class and subject to view and update individual student exam records.
        </Text>
      </View>
    </>
  );

  // Render Student List View
  const renderStudentListView = () => (
    <View style={{ flex: 1 }}>
      <TouchableOpacity style={styles.backButton} onPress={handleBackToClassList}>
        <MaterialCommunityIcons name="arrow-left" size={22} color={AppColors.primary} />
        <Text style={styles.backButtonText}>Back to Class/Subject List</Text>
      </TouchableOpacity>
      <View style={styles.studentListHeader}>
        <Text style={styles.studentListTitle}>
          {selectedClassSubject?.className} - {selectedClassSubject?.subject}
        </Text>
        <Text style={styles.studentListSubtitle}>Student Exam Records Overview</Text>
      </View>
      <View style={styles.tableHeader}>
        <Text style={[styles.tableHeaderText, styles.rollCell]}>ROLL</Text>
        <Text style={[styles.tableHeaderText, styles.nameCell]}>STUDENT NAME</Text>
        <Text style={[styles.tableHeaderText, styles.dateCell]}>LAST UPDATED</Text>
        <Text style={[styles.tableHeaderText, styles.actionCellHeader]}>ACTIONS</Text>
      </View>
      <FlatList
        data={studentsForSelectedClass}
        keyExtractor={item => item.studentId}
        renderItem={({ item }) => <StudentListItem student={item} onUpdate={handleOpenUpdateModal} />}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mainHeader}>
        <MaterialCommunityIcons name="chart-timeline-variant" size={32} color={AppColors.textOnPrimary} />
        <View>
          <Text style={styles.mainHeaderTitle}>Student Progress & Analysis</Text>
          <Text style={styles.mainHeaderSubtitle}>Monitor and update academic performance for students in your classes.</Text>
        </View>
      </View>

      {currentView === 'classList' && renderClassListView()}
      {currentView === 'studentList' && renderStudentListView()}

      {selectedStudent && selectedClassSubject && (
        <UpdateRecordsModal
          visible={isUpdateModalVisible}
          student={selectedStudent}
          classSubject={selectedClassSubject}
          onClose={handleCloseUpdateModal}
          onSave={handleSaveExamRecords}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  mainHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.primary,
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  mainHeaderTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: AppColors.textOnPrimary,
    marginLeft: 12,
  },
  mainHeaderSubtitle: {
    fontSize: 13,
    color: AppColors.textOnPrimary,
    marginLeft: 12,
  },
  listContainer: {
    padding: 10,
  },
  // Class Card Styles
  classCard: {
    backgroundColor: AppColors.cardBackground,
    borderRadius: 12,
    padding: 15,
    margin: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    flex: 1, // For numColumns
  },
  classCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  classCardHeaderText: {
    marginLeft: 10,
  },
  classCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: AppColors.textPrimary,
  },
  classCardSubtitle: {
    fontSize: 14,
    color: AppColors.textSecondary,
  },
  classCardStudents: {
    fontSize: 13,
    color: AppColors.textSecondary,
    marginBottom: 15,
  },
  classCardAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 'auto', // Pushes to bottom
  },
  classCardActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: AppColors.primary,
    marginRight: 5,
  },
  bottomInfoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.primaryLight+'30', // Light purple with opacity
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginHorizontal: 10,
    marginBottom: 10,
    borderRadius: 8,
  },
  bottomInfoText: {
    fontSize: 13,
    color: AppColors.infoText,
    marginLeft: 10,
    flex: 1,
  },
  // Student List Styles
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.primary,
    marginLeft: 8,
  },
  studentListHeader: {
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  studentListTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: AppColors.textPrimary,
  },
  studentListSubtitle: {
    fontSize: 14,
    color: AppColors.textSecondary,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: AppColors.primaryLight + '40', // Lighter primary for header
    borderBottomWidth: 1,
    borderBottomColor: AppColors.borderColor,
  },
  tableHeaderText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: AppColors.primary, // Darker text for header
  },
  studentRow: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.borderColor,
    backgroundColor: AppColors.cardBackground,
    alignItems: 'center',
  },
  studentCell: {
    fontSize: 14,
    color: AppColors.textPrimary,
  },
  rollCell: { width: '10%', textAlign: 'center' },
  nameCell: { width: '35%', paddingLeft: 5 },
  dateCell: { width: '35%', color: AppColors.textSecondary, fontSize: 12 },
  actionCell: {
    width: '20%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start', // Changed for icon + text
  },
  actionCellHeader: {
    width: '20%',
    textAlign: 'left', // Align with content
  },
  updateText: {
    color: AppColors.primary,
    fontSize: 13,
    fontWeight: '500',
    marginLeft: 3,
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: AppColors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.borderColor,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: AppColors.textPrimary,
    flex: 1,
    marginRight: 10,
  },
  modalScrollView: {
    padding: 15,
  },
  examSection: {
    backgroundColor: AppColors.cardBackground,
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    elevation: 1,
  },
  examTypeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.primary,
    marginBottom: 10,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  inputField: {
    backgroundColor: AppColors.background,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: AppColors.textPrimary,
    borderWidth: 1,
    borderColor: AppColors.borderColor,
  },
  gradeMarksInput: {
    width: '48%',
  },
  commentsInput: {
    minHeight: 70,
    textAlignVertical: 'top', // For Android
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 15,
    backgroundColor: AppColors.cardBackground,
    borderTopWidth: 1,
    borderTopColor: AppColors.borderColor,
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginLeft: 10,
  },
  modalButtonText: {
    fontSize: 15,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  cancelButton: {
    backgroundColor: AppColors.textSecondary+'20', // Lighter gray
  },
  cancelButtonText: {
      color: AppColors.textSecondary,
  },
  saveButton: {
    backgroundColor: AppColors.success,
  },
  saveButtonText: { // This style was missing, implicitly white
    color: AppColors.textOnPrimary,
  }
});

export default TeacherResults;