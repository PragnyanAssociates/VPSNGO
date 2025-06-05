// TeacherHI.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');

// Sample Data
const INITIAL_STUDENTS_DATA = [
  {
    id: 'S12345',
    name: 'Alex Johnson',
    class: 'Class 10A',
    allergiesSummary: 'Peanuts, Pollen', // For list display
    healthRecord: {
      bloodGroup: 'O+',
      height: "5' 7\" (170 cm)",
      weight: '140 lbs (63.5 kg)',
      bmi: '21.9',
      lastHealthCheckup: '2024-07-10',
      eyeCheckupDate: '2024-08-15',
      eyeExaminationFactors: [
        'Wears corrective lenses',
        'No signs of glaucoma',
        'Reports occasional eye strain',
      ],
      allergies: ['Peanuts', 'Pollen'],
      medicalConditions: ['Asthma (mild)'],
      medications: ['Albuterol Inhaler (as needed)'],
      vaccinationRecord: [
        { name: 'MMR', status: 'Completed', date: '2010-05-15' },
        { name: 'Varicella', status: 'Completed', date: '2010-06-20' },
        { name: 'Tdap', status: 'Completed', date: '2019-08-01' },
        { name: 'Flu Shot (Annual)', status: 'Up-to-date', date: '2024-09-10' },
      ],
      emergencyContact: {
        name: 'Maria Rodriguez (Aunt)',
        phone: '+1-202-555-0192',
      },
    },
  },
  {
    id: 'S67890',
    name: 'Priya Singh',
    class: 'Class 9B',
    allergiesSummary: 'Dust',
    healthRecord: {
      bloodGroup: 'A+',
      height: "5' 4\" (163 cm)",
      weight: '120 lbs (54.4 kg)',
      bmi: '20.5',
      lastHealthCheckup: '2024-06-20',
      eyeCheckupDate: '2024-09-01',
      eyeExaminationFactors: ['Perfect vision'],
      allergies: ['Dust'],
      medicalConditions: ['None reported'],
      medications: ['None'],
      vaccinationRecord: [
        { name: 'MMR', status: 'Completed', date: '2011-02-10' },
        { name: 'Varicella', status: 'Completed', date: '2011-03-15' },
        { name: 'Tdap', status: 'Completed', date: '2020-07-20' },
        { name: 'Flu Shot (Annual)', status: 'Up-to-date', date: '2024-09-15' },
      ],
      emergencyContact: {
        name: 'Rajesh Singh (Father)',
        phone: '+1-202-555-0234',
      },
    },
  },
  {
    id: 'LKG-TinyTot',
    name: 'Tiny Tot',
    class: 'Class LKG',
    allergiesSummary: 'None reported',
    healthRecord: {
      bloodGroup: 'B+',
      height: "3' 0\" (91 cm)",
      weight: '30 lbs (13.6 kg)',
      bmi: '16.0',
      lastHealthCheckup: '2024-08-01',
      eyeCheckupDate: '2024-08-01',
      eyeExaminationFactors: ['Age-appropriate vision'],
      allergies: ['None reported'],
      medicalConditions: ['None reported'],
      medications: ['None'],
      vaccinationRecord: [
        { name: 'MMR', status: 'Completed', date: '2022-05-01' },
        { name: 'Varicella', status: 'Pending', date: '' },
      ],
      emergencyContact: {
        name: 'Sara Tot (Mother)',
        phone: '+1-202-555-0345',
      },
    },
  },
];

// Helper to format date strings
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch (e) {
    return dateString; // if invalid date, return original
  }
};

const formatVaccineDate = (dateString) => {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return ''; // Invalid date
        return `(${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')})`;
    } catch (e) {
        return '';
    }
};


// Student Card Component
const StudentCard = ({ student, onPress }) => (
  <TouchableOpacity style={styles.card} onPress={() => onPress(student)}>
    <Text style={styles.cardName}>{student.name}</Text>
    <Text style={styles.cardInfo}>ID: {student.id} | Class: {student.class}</Text>
    <Text style={styles.cardAllergies}>Allergies: {student.allergiesSummary}</Text>
  </TouchableOpacity>
);

// Health Record Modal Component
const HealthRecordModal = ({ visible, student, onClose, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    if (student) {
      // Deep copy student's health record for editing
      setFormData(JSON.parse(JSON.stringify(student.healthRecord)));
      setIsEditing(false); // Reset to view mode when student changes
    }
  }, [student]);

  const handleInputChange = (path, value) => {
    setFormData(prevData => {
      const newData = { ...prevData }; // Shallow copy top level
      let current = newData;
      for (let i = 0; i < path.length - 1; i++) {
        // If path segment is a number, it's an array index
        if (typeof path[i] === 'number') {
          current[path[i-1]] = [...current[path[i-1]]]; // clone array
          current[path[i-1]][path[i]] = {...current[path[i-1]][path[i]]}; // clone object in array
          current = current[path[i-1]][path[i]];
        } else {
           // If it's an object key, clone object
          if (typeof current[path[i]] === 'object' && current[path[i]] !== null && !Array.isArray(current[path[i]])) {
             current[path[i]] = { ...current[path[i]] };
          } else if (Array.isArray(current[path[i]])) {
             current[path[i]] = [...current[path[i]]]; // Clone array for list of strings
          }
          current = current[path[i]];
        }
      }
      // For array of strings (allergies, medicalConditions, etc.)
      if (typeof path[path.length-2] === 'string' && typeof path[path.length-1] === 'number' && Array.isArray(current)) {
        current[path[path.length-1]] = value;
      }
      // For object properties (e.g. vaccine name, status, date)
      else if (typeof path[path.length-1] === 'string' && typeof current === 'object') {
         current[path[path.length - 1]] = value;
      }
      // For direct properties like bloodGroup
      else if (path.length === 1) {
        newData[path[0]] = value;
      }

      return newData;
    });
  };
  
  const handleListInputChange = (listName, index, value) => {
    setFormData(prevData => {
        const newList = [...prevData[listName]];
        newList[index] = value;
        return { ...prevData, [listName]: newList };
    });
  };

  const handleVaccineInputChange = (index, field, value) => {
    setFormData(prevData => {
        const newVaccinationRecord = [...prevData.vaccinationRecord];
        newVaccinationRecord[index] = { ...newVaccinationRecord[index], [field]: value };
        return { ...prevData, vaccinationRecord: newVaccinationRecord };
    });
  };


  const handleSaveRecord = () => {
    onSave(student.id, formData);
    setIsEditing(false);
  };

  if (!student || !formData) return null;

  const renderDetailItem = (icon, label, value, fieldPath = null, isDate = false) => (
    <View style={styles.detailItem}>
      <MaterialCommunityIcons name={icon} size={20} color={styles.accentColor.color} style={styles.detailItemIcon} />
      <View style={styles.detailItemTextContainer}>
        <Text style={styles.detailLabel}>{label}:</Text>
        {isEditing && fieldPath ? (
          <TextInput
            style={styles.detailValueInput}
            value={isDate && formData[fieldPath[0]] ? formData[fieldPath[0]].split('T')[0] : String(formData[fieldPath[0]])} // For dates, ensure YYYY-MM-DD
            onChangeText={(text) => handleInputChange(fieldPath, text)}
          />
        ) : (
          <Text style={styles.detailValue}>{isDate ? formatDate(value) : value}</Text>
        )}
      </View>
    </View>
  );
  
  const renderListItem = (listName, item, index) => (
    isEditing ? (
        <TextInput
            key={`${listName}-${index}`}
            style={styles.listItemInput}
            value={item}
            onChangeText={(text) => handleListInputChange(listName, index, text)}
            placeholder={`Enter ${listName.slice(0, -1)}`}
        />
    ) : (
        <Text key={`${listName}-${index}`} style={styles.listItemText}>• {item}</Text>
    )
  );

  return (
    <Modal animationType="slide" transparent={false} visible={visible} onRequestClose={onClose}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Health Record: {student.name} ({student.class})</Text>
          <TouchableOpacity onPress={onClose}>
            <MaterialCommunityIcons name="close-circle" size={28} color="#555" />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.modalScrollView}>
          <View style={styles.twoColumnContainer}>
            {renderDetailItem('water-outline', 'Blood Group', formData.bloodGroup, ['bloodGroup'])}
            {renderDetailItem('human-male-height', 'Height', formData.height, ['height'])}
            {renderDetailItem('weight-kilogram', 'Weight', formData.weight, ['weight'])}
            {renderDetailItem('calculator-variant-outline', 'BMI', formData.bmi, ['bmi'])}
            {renderDetailItem('calendar-check', 'Last Health Checkup', formData.lastHealthCheckup, ['lastHealthCheckup'], true)}
            {renderDetailItem('eye-check-outline', 'Eye Checkup Date', formData.eyeCheckupDate, ['eyeCheckupDate'], true)}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}><MaterialCommunityIcons name="eye-settings-outline" size={20} color={styles.accentColor.color} /> Eye Examination Factors:</Text>
            {formData.eyeExaminationFactors.map((factor, index) => renderListItem('eyeExaminationFactors', factor, index))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}><MaterialCommunityIcons name="alert-circle-outline" size={20} color={styles.accentColor.color} /> Allergies:</Text>
            {formData.allergies.map((allergy, index) => renderListItem('allergies', allergy, index))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}><MaterialCommunityIcons name="briefcase-medical-outline" size={20} color={styles.accentColor.color} /> Medical Conditions:</Text>
            {formData.medicalConditions.map((condition, index) => renderListItem('medicalConditions', condition, index))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}><MaterialCommunityIcons name="pill" size={20} color={styles.accentColor.color} /> Medications:</Text>
            {formData.medications.map((medication, index) => renderListItem('medications', medication, index))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}><MaterialCommunityIcons name="needle" size={20} color={styles.accentColor.color} /> Vaccination Record</Text>
            {formData.vaccinationRecord.map((vaccine, index) => (
              <View key={index} style={styles.vaccineItem}>
                {isEditing ? (
                  <>
                    <TextInput style={styles.vaccineNameInput} value={vaccine.name} onChangeText={text => handleVaccineInputChange(index, 'name', text)} />
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                      <TextInput style={styles.vaccineStatusInput} value={vaccine.status} onChangeText={text => handleVaccineInputChange(index, 'status', text)} placeholder="Status"/>
                      <TextInput style={styles.vaccineDateInput} value={vaccine.date} onChangeText={text => handleVaccineInputChange(index, 'date', text)} placeholder="YYYY-MM-DD"/>
                    </View>
                  </>
                ) : (
                  <>
                    <Text style={styles.vaccineName}>{vaccine.name}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={[
                            styles.vaccineStatus,
                            vaccine.status === 'Completed' && styles.statusCompleted,
                            vaccine.status === 'Up-to-date' && styles.statusUpToDate,
                            vaccine.status === 'Pending' && styles.statusPending,
                        ]}>
                            {vaccine.status}
                        </Text>
                        <Text style={styles.vaccineDate}>{formatVaccineDate(vaccine.date)}</Text>
                    </View>
                  </>
                )}
              </View>
            ))}
          </View>

          <View style={styles.emergencyContactSection}>
            <MaterialCommunityIcons name="phone-alert" size={22} color={styles.emergencyText.color} />
            <Text style={styles.emergencyText}> Emergency: </Text>
            {isEditing ? (
                <>
                 <TextInput style={styles.emergencyInput} value={formData.emergencyContact.name} onChangeText={text => handleInputChange(['emergencyContact', 'name'], text)} />
                 <TextInput style={styles.emergencyInput} value={formData.emergencyContact.phone} onChangeText={text => handleInputChange(['emergencyContact', 'phone'], text)} keyboardType="phone-pad"/>
                </>
            ) : (
                 <Text style={styles.emergencyText}>{formData.emergencyContact.name} ({formData.emergencyContact.phone})</Text>
            )}
          </View>
        </ScrollView>

        <TouchableOpacity
          style={[styles.editButton, isEditing ? styles.saveButton : {}]}
          onPress={isEditing ? handleSaveRecord : () => setIsEditing(true)}
        >
          <MaterialCommunityIcons name={isEditing ? "content-save" : "pencil-outline"} size={20} color="white" />
          <Text style={styles.editButtonText}>{isEditing ? 'Save Record' : 'Edit Record'}</Text>
        </TouchableOpacity>
      </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
};


// Main TeacherHI Component
const TeacherHI = () => {
  const [students, setStudents] = useState(INITIAL_STUDENTS_DATA);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredStudents, setFilteredStudents] = useState(INITIAL_STUDENTS_DATA);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const lowerCaseQuery = searchQuery.toLowerCase();
    const newFilteredStudents = students.filter(
      student =>
        student.name.toLowerCase().includes(lowerCaseQuery) ||
        student.id.toLowerCase().includes(lowerCaseQuery) ||
        student.class.toLowerCase().includes(lowerCaseQuery)
    );
    setFilteredStudents(newFilteredStudents);
  }, [searchQuery, students]);

  const handleSelectStudent = (student) => {
    setSelectedStudent(student);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedStudent(null);
  };

  const handleSaveRecord = (studentId, updatedHealthRecord) => {
    const updatedStudents = students.map(s =>
      s.id === studentId ? { ...s, healthRecord: updatedHealthRecord } : s
    );
    setStudents(updatedStudents);
    // Update selected student to reflect changes if modal stays open (though it closes on save in this impl)
    if(selectedStudent && selectedStudent.id === studentId) {
        setSelectedStudent(prev => ({...prev, healthRecord: updatedHealthRecord}));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <MaterialCommunityIcons name="hospital-box-outline" size={30} color={styles.headerIcon.color} />
        <View>
          <Text style={styles.headerTitle}>Student Health Records</Text>
          <Text style={styles.headerSubtitle}>View and update student health information.</Text>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <MaterialCommunityIcons name="account-search-outline" size={20} color="#888" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search student by name, ID, or class..."
          placeholderTextColor="#888"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <FlatList
        data={filteredStudents}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <StudentCard student={item} onPress={handleSelectStudent} />}
        contentContainerStyle={styles.listContentContainer}
        ListEmptyComponent={<Text style={styles.emptyListText}>No students found.</Text>}
      />

      {selectedStudent && (
        <HealthRecordModal
          visible={modalVisible}
          student={selectedStudent}
          onClose={handleCloseModal}
          onSave={handleSaveRecord}
        />
      )}
    </SafeAreaView>
  );
};

const AppColors = {
  primary: '#FFA726', // Orange
  primaryDark: '#F57C00',
  accent: '#FF7043',   // Deep Orange
  background: '#F8F9FA',
  cardBackground: '#FFFFFF',
  textPrimary: '#333333',
  textSecondary: '#777777',
  white: '#FFFFFF',
  lightGray: '#ECEFF1',
  emergencyBg: '#FFEBEE',
  emergencyText: '#D32F2F',
  statusCompletedBg: '#E8F5E9',
  statusCompletedText: '#4CAF50',
  statusUpToDateBg: '#E3F2FD',
  statusUpToDateText: '#2196F3',
  statusPendingBg: '#FFF9C4',
  statusPendingText: '#FBC02D',
  editButton: '#FFA726', // Orange
  saveButton: '#4CAF50', // Green
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  headerIcon: {
    color: AppColors.white,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: AppColors.white,
  },
  headerSubtitle: {
    fontSize: 13,
    color: AppColors.white,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.white,
    margin: 15,
    borderRadius: 8,
    paddingHorizontal: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 45,
    fontSize: 15,
    color: AppColors.textPrimary,
  },
  listContentContainer: {
    paddingHorizontal: 15,
    paddingBottom: 15,
  },
  card: {
    backgroundColor: AppColors.cardBackground,
    borderRadius: 8,
    padding: 15,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardName: {
    fontSize: 17,
    fontWeight: 'bold',
    color: AppColors.primaryDark, // Darker orange for name
    marginBottom: 4,
  },
  cardInfo: {
    fontSize: 13,
    color: AppColors.textSecondary,
    marginBottom: 3,
  },
  cardAllergies: {
    fontSize: 13,
    color: AppColors.textSecondary,
  },
  emptyListText: {
    textAlign: 'center',
    marginTop: 30,
    fontSize: 16,
    color: AppColors.textSecondary,
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
    borderBottomWidth: 1,
    borderBottomColor: AppColors.lightGray,
    backgroundColor: AppColors.white,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: AppColors.textPrimary,
    flex:1, 
    marginRight: 10
  },
  modalScrollView: {
    padding: 15,
  },
  twoColumnContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: '48%', // For two columns
    marginBottom: 12,
  },
  detailItemIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  detailItemTextContainer: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 13,
    color: AppColors.textSecondary,
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 14,
    color: AppColors.textPrimary,
  },
  detailValueInput: {
    fontSize: 14,
    color: AppColors.textPrimary,
    borderBottomWidth: 1,
    borderColor: AppColors.primary,
    paddingVertical: 2,
    minHeight: 25,
  },
  section: {
    backgroundColor: AppColors.white,
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: AppColors.textPrimary,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  listItemText: {
    fontSize: 14,
    color: AppColors.textPrimary,
    lineHeight: 20,
    marginLeft: 5, // Indent for bullet
  },
  listItemInput: {
    fontSize: 14,
    color: AppColors.textPrimary,
    borderBottomWidth: 1,
    borderColor: AppColors.primary,
    marginBottom: 5,
    paddingVertical: 3,
    minHeight: 25,
  },
  vaccineItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.lightGray,
  },
  vaccineName: {
    fontSize: 14,
    fontWeight: '500',
    color: AppColors.textPrimary,
    flex: 1,
  },
  vaccineNameInput: {
    fontSize: 14,
    fontWeight: '500',
    color: AppColors.textPrimary,
    flex: 1,
    borderBottomWidth: 1,
    borderColor: AppColors.primary,
    marginRight: 5,
    paddingVertical: 2,
  },
  vaccineStatusInput: {
    fontSize: 12,
    color: AppColors.textPrimary,
    borderBottomWidth: 1,
    borderColor: AppColors.primary,
    paddingHorizontal: 5,
    paddingVertical: 2,
    marginRight: 5,
    minWidth: 80,
  },
  vaccineDateInput: {
    fontSize: 12,
    color: AppColors.textSecondary,
    borderBottomWidth: 1,
    borderColor: AppColors.primary,
    paddingHorizontal: 5,
    paddingVertical: 2,
    minWidth: 100,
  },
  vaccineStatus: {
    fontSize: 11,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginRight: 5,
    minWidth: 80,
    textAlign: 'center',
  },
  statusCompleted: {
    backgroundColor: AppColors.statusCompletedBg,
    color: AppColors.statusCompletedText,
  },
  statusUpToDate: {
    backgroundColor: AppColors.statusUpToDateBg,
    color: AppColors.statusUpToDateText,
  },
  statusPending: {
    backgroundColor: AppColors.statusPendingBg,
    color: AppColors.statusPendingText,
  },
  vaccineDate: {
    fontSize: 12,
    color: AppColors.textSecondary,
  },
  emergencyContactSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.emergencyBg,
    padding: 15,
    borderRadius: 8,
    marginTop: 5, // Reduced from 15 to fit better
  },
  emergencyText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: AppColors.emergencyText,
    marginLeft: 5,
  },
  emergencyInput: {
    fontSize: 14,
    color: AppColors.emergencyText,
    borderBottomWidth: 1,
    borderColor: AppColors.emergencyText,
    marginLeft: 5,
    flex: 1,
    paddingVertical: 2,
  },
  editButton: {
    flexDirection: 'row',
    backgroundColor: AppColors.editButton,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 15,
    marginVertical: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  saveButton: {
    backgroundColor: AppColors.saveButton,
  },
  editButtonText: {
    color: AppColors.white,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  accentColor: { // Used for icons in modal
    color: AppColors.accent,
  }
});

export default TeacherHI;