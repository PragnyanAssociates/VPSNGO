import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, TextInput, Alert, Modal, FlatList,
  Dimensions, Platform
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

// --- Constants ---
const PRIMARY_COLOR = '#008080';
const SECONDARY_COLOR = '#e0f2f7';
const TERTIARY_COLOR = '#f8f8ff';
const TEXT_COLOR_DARK = '#333';
const TEXT_COLOR_MEDIUM = '#555';
const TEXT_COLOR_LIGHT = '#777';
const BORDER_COLOR = '#b2ebf2';
const ADD_BUTTON_COLOR = '#28a745';
const REMOVE_BUTTON_COLOR = '#dc3545';
const EDIT_BUTTON_COLOR = '#ffc107';
const CARD_BACKGROUND_COLOR = '#FFFFFF';
const CARD_STUDENT_COUNT_BG = '#e7f3ff';
const CARD_STUDENT_COUNT_TEXT = '#0056b3';
const STUDENT_CARD_BG = '#FFFFFF';
const MODAL_OVERLAY_COLOR = 'rgba(0, 0, 0, 0.5)';
const MODAL_BUTTON_PRIMARY = '#007bff';
const MODAL_BUTTON_SECONDARY = '#6c757d';

const { width: windowWidth } = Dimensions.get('window');
const CLASS_CARD_MARGIN = 10;
const NUM_CLASS_COLUMNS = 2;
const STUDENT_CARD_MARGIN = 8;

const AdminStudentProfiles = ({ onBackPress: onBackToDashboard, navigation }) => {
  const [classes, setClasses] = useState([]);
  const [currentView, setCurrentView] = useState('classList');
  const [viewingClass, setViewingClass] = useState(null);

  const [isClassModalVisible, setIsClassModalVisible] = useState(false);
  const [classModalMode, setClassModalMode] = useState('add');
  const [currentClassName, setCurrentClassName] = useState('');
  const [editingClassId, setEditingClassId] = useState(null);

  const [isStudentModalVisible, setIsStudentModalVisible] = useState(false);
  const [studentModalMode, setStudentModalMode] = useState('add');
  const [currentStudentData, setCurrentStudentData] = useState({ rollNo: '', name: '', gender: '' });
  const [editingStudentId, setEditingStudentId] = useState(null);

  const [isFullDetailsModalVisible, setIsFullDetailsModalVisible] = useState(false);
  const [fullStudentDetails, setFullStudentDetails] = useState({
    rollNo: '', name: '', gender: '', dob: '', address: '', phone: '', email: '', admissionDate: '', photo: ''
  });
  const [currentFullDetailsStudentId, setCurrentFullDetailsStudentId] = useState(null);

  const [isDeleteClassMode, setIsDeleteClassMode] = useState(false);
  const [selectedClassesForDeletion, setSelectedClassesForDeletion] = useState(new Set());
  const [isDeleteStudentMode, setIsDeleteStudentMode] = useState(false);
  const [selectedStudentsForDeletion, setSelectedStudentsForDeletion] = useState(new Set());

  // --- Class Management Functions ---
  const openClassModal = (mode, classItem = null) => {
    setClassModalMode(mode);
    if (mode === 'edit' && classItem) {
      setEditingClassId(classItem.id);
      setCurrentClassName(classItem.name);
    } else {
      setEditingClassId(null);
      setCurrentClassName('');
    }
    setIsClassModalVisible(true);
  };

  const handleSaveClass = () => {
    if (!currentClassName.trim()) {
      Alert.alert('Validation Error', 'Class Name cannot be empty.');
      return;
    }
    if (classModalMode === 'add') {
      const newClass = {
        id: `class-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        name: currentClassName.trim(),
        students: [],
      };
      setClasses(prev => [...prev, newClass]);
    } else if (classModalMode === 'edit' && editingClassId) {
      setClasses(prev =>
        prev.map(cls =>
          cls.id === editingClassId ? { ...cls, name: currentClassName.trim() } : cls
        )
      );
    }
    setIsClassModalVisible(false);
    setCurrentClassName('');
    setEditingClassId(null);
  };

  const toggleDeleteClassMode = () => {
    setIsDeleteClassMode(prev => !prev);
    setSelectedClassesForDeletion(new Set());
  };

  const toggleClassForDeletion = (classId) => {
    setSelectedClassesForDeletion(prev => {
      const newSelected = new Set(prev);
      if (newSelected.has(classId)) newSelected.delete(classId);
      else newSelected.add(classId);
      return newSelected;
    });
  };

  const handleDeleteSelectedClasses = () => {
    if (selectedClassesForDeletion.size === 0) {
      Alert.alert('No Selection', 'Please select classes to delete.');
      return;
    }
    Alert.alert('Confirm Deletion', `Delete ${selectedClassesForDeletion.size} class(es) and all their students? This action cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => {
          setClasses(prev => prev.filter(cls => !selectedClassesForDeletion.has(cls.id)));
          toggleDeleteClassMode();
      }},
    ]);
  };

  // --- Student Management Functions ---
  const openStudentModal = (mode, studentItem = null) => {
    setStudentModalMode(mode);
    if (mode === 'edit' && studentItem) {
      setEditingStudentId(studentItem.id);
      setCurrentStudentData({ rollNo: studentItem.rollNo, name: studentItem.name, gender: studentItem.gender || '' });
    } else {
      setEditingStudentId(null);
      setCurrentStudentData({ rollNo: '', name: '', gender: '' });
    }
    setIsStudentModalVisible(true);
  };

  const handleSaveStudent = () => {
    if (!viewingClass) return;
    const { rollNo, name } = currentStudentData;
    if (!rollNo.trim() || !name.trim()) {
      Alert.alert('Validation Error', 'Roll No and Name are required.');
      return;
    }

    let modifiedClassWithNewStudents;
    setClasses(prevClasses =>
      prevClasses.map(cls => {
        if (cls.id === viewingClass.id) {
          let updatedStudentsArray;
          if (studentModalMode === 'add') {
            const newStudent = {
              id: `stu-${Date.now()}-${Math.random().toString(16).slice(2)}`,
              rollNo: rollNo.trim(),
              name: name.trim(),
              gender: currentStudentData.gender.trim(),
              profileDetails: { dob: '', address: '', phone: '', email: '', admissionDate: '', photo: '' }
            };
            updatedStudentsArray = [...cls.students, newStudent];
          } else if (studentModalMode === 'edit' && editingStudentId) {
            updatedStudentsArray = cls.students.map(stu =>
              stu.id === editingStudentId
                ? { ...stu, rollNo: rollNo.trim(), name: name.trim(), gender: currentStudentData.gender.trim() }
                : stu
            );
          } else {
            updatedStudentsArray = cls.students;
          }
          modifiedClassWithNewStudents = { ...cls, students: updatedStudentsArray };
          return modifiedClassWithNewStudents;
        }
        return cls;
      })
    );

    if (modifiedClassWithNewStudents) {
      setViewingClass(modifiedClassWithNewStudents);
    }

    setIsStudentModalVisible(false);
    setCurrentStudentData({ rollNo: '', name: '', gender: '' });
    setEditingStudentId(null);
  };

  // --- Full Student Details Management ---
  const openFullDetailsModal = (studentItem) => {
    setCurrentFullDetailsStudentId(studentItem.id);
    setFullStudentDetails({
      rollNo: studentItem.rollNo,
      name: studentItem.name,
      gender: studentItem.gender || '',
      dob: studentItem.profileDetails.dob || '',
      address: studentItem.profileDetails.address || '',
      phone: studentItem.profileDetails.phone || '',
      email: studentItem.profileDetails.email || '',
      admissionDate: studentItem.profileDetails.admissionDate || '',
      photo: studentItem.profileDetails.photo || ''
    });
    setIsFullDetailsModalVisible(true);
  };

  const handleSaveFullDetails = () => {
    if (!viewingClass || !currentFullDetailsStudentId) return;
    const { rollNo, name, gender, dob, address, phone, email, admissionDate, photo } = fullStudentDetails;
    if (!rollNo.trim() || !name.trim()) {
      Alert.alert('Validation Error', 'Roll No and Name are required.');
      return;
    }

    let modifiedClassWithUpdatedStudent;
    setClasses(prevClasses =>
      prevClasses.map(cls => {
        if (cls.id === viewingClass.id) {
          const updatedStudentsArray = cls.students.map(stu =>
            stu.id === currentFullDetailsStudentId
              ? {
                  ...stu,
                  rollNo: rollNo.trim(),
                  name: name.trim(),
                  gender: gender.trim(),
                  profileDetails: {
                    dob: dob.trim(),
                    address: address.trim(),
                    phone: phone.trim(),
                    email: email.trim(),
                    admissionDate: admissionDate.trim(),
                    photo: photo.trim()
                  }
                }
              : stu
          );
          modifiedClassWithUpdatedStudent = { ...cls, students: updatedStudentsArray };
          return modifiedClassWithUpdatedStudent;
        }
        return cls;
      })
    );

    if (modifiedClassWithUpdatedStudent) {
      setViewingClass(modifiedClassWithUpdatedStudent);
    }

    setIsFullDetailsModalVisible(false);
    setFullStudentDetails({
      rollNo: '', name: '', gender: '', dob: '', address: '', phone: '', email: '', admissionDate: '', photo: ''
    });
    setCurrentFullDetailsStudentId(null);
  };

  const toggleDeleteStudentMode = () => {
    setIsDeleteStudentMode(prev => !prev);
    setSelectedStudentsForDeletion(new Set());
  };

  const toggleStudentForDeletion = (studentId) => {
    setSelectedStudentsForDeletion(prev => {
      const newSelected = new Set(prev);
      if (newSelected.has(studentId)) newSelected.delete(studentId);
      else newSelected.add(studentId);
      return newSelected;
    });
  };

  const handleDeleteSelectedStudents = () => {
    if (!viewingClass || selectedStudentsForDeletion.size === 0) {
      Alert.alert('No Selection', 'Please select students to delete.');
      return;
    }
    Alert.alert('Confirm Deletion', `Delete ${selectedStudentsForDeletion.size} student(s) from ${viewingClass.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => {
          let modifiedClassWithDeletedStudents;
          setClasses(prevClasses =>
            prevClasses.map(cls => {
              if (cls.id === viewingClass.id) {
                const updatedStudents = cls.students.filter(stu => !selectedStudentsForDeletion.has(stu.id));
                modifiedClassWithDeletedStudents = { ...cls, students: updatedStudents };
                return modifiedClassWithDeletedStudents;
              }
              return cls;
            })
          );
          if (modifiedClassWithDeletedStudents) {
            setViewingClass(modifiedClassWithDeletedStudents);
          }
          toggleDeleteStudentMode();
      }},
    ]);
  };

  // --- View Switching & Navigation ---
  const handleClassCardPress = (classItem) => {
    if (isDeleteClassMode) {
      toggleClassForDeletion(classItem.id);
    } else {
      const freshClassItem = classes.find(c => c.id === classItem.id) || classItem;
      setViewingClass(freshClassItem);
      setCurrentView('studentList');
      setIsDeleteStudentMode(false);
      setSelectedStudentsForDeletion(new Set());
    }
  };

  const handleStudentCardPress = (studentItem) => {
    if (isDeleteStudentMode) {
      toggleStudentForDeletion(studentItem.id);
    } else {
      openFullDetailsModal(studentItem);
    }
  };

  const backToClassList = () => {
    if (isDeleteStudentMode) {
      toggleDeleteStudentMode();
    } else {
      setCurrentView('classList');
      setViewingClass(null);
      setIsDeleteStudentMode(false); // Ensure delete mode is reset
      setSelectedStudentsForDeletion(new Set()); // Clear selections
    }
  };

  const effectiveBackPress = () => {
    console.log('Back button pressed:', { currentView, isDeleteClassMode, onBackToDashboard: !!onBackToDashboard, navigation: !!navigation });

    if (currentView === 'studentList') {
      console.log('Navigating back to class list');
      backToClassList();
      return;
    }

    if (isDeleteClassMode) {
      console.log('Exiting delete class mode');
      toggleDeleteClassMode();
      return;
    }

    if (typeof onBackToDashboard === 'function') {
      console.log('Calling onBackToDashboard');
      onBackToDashboard();
      return;
    }

    if (navigation && typeof navigation.canGoBack === 'function' && navigation.canGoBack()) {
      console.log('Navigating back via navigation');
      navigation.goBack();
      return;
    }

    console.warn('No back action available. Check if navigation or onBackToDashboard is properly passed.');
    Alert.alert('Navigation Error', 'No back action available. Please ensure navigation is set up correctly.');
  };

  // --- Render Methods ---
  const renderClassCard = ({ item }) => {
    const isSelectedForDelete = selectedClassesForDeletion.has(item.id);
    return (
      <TouchableOpacity
        style={[styles.classCard, isDeleteClassMode && styles.classCardDeleteMode, isSelectedForDelete && styles.classCardSelectedForDelete]}
        onPress={() => handleClassCardPress(item)}
        onLongPress={() => !isDeleteClassMode && toggleDeleteClassMode()}
      >
        {!isDeleteClassMode && (
          <TouchableOpacity style={styles.editButtonOnCard} onPress={() => openClassModal('edit', item)}>
            <MaterialIcons name="edit" size={20} color={TEXT_COLOR_MEDIUM} />
          </TouchableOpacity>
        )}
        <Text style={styles.classCardName}>{item.name}</Text>
        <View style={styles.classCardStudentCountArea}>
          <Text style={styles.classCardStudentCountNumber}>{item.students.length}</Text>
          <Text style={styles.classCardStudentCountLabel}>Students</Text>
        </View>
        {isDeleteClassMode && (
          <View style={styles.checkboxOverlay}>
            <MaterialIcons name={isSelectedForDelete ? "check-box" : "check-box-outline-blank"} size={24} color={isSelectedForDelete ? REMOVE_BUTTON_COLOR : TEXT_COLOR_MEDIUM} />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderStudentCard = ({ item }) => {
    const isSelectedForDelete = selectedStudentsForDeletion.has(item.id);
    return (
      <TouchableOpacity
        style={[styles.studentCard, isDeleteStudentMode && styles.studentCardDeleteMode, isSelectedForDelete && styles.studentCardSelectedForDelete]}
        onPress={() => handleStudentCardPress(item)}
        onLongPress={() => !isDeleteStudentMode && toggleDeleteStudentMode()}
      >
        <View style={styles.studentInfoContainer}>
          <Text style={styles.studentRollNo}>Roll No: {item.rollNo}</Text>
          <Text style={styles.studentName}>{item.name}</Text>
          {item.gender ? <Text style={styles.studentDetail}>Gender: {item.gender}</Text> : null}
        </View>
        <View style={styles.studentCardActions}>
          {!isDeleteStudentMode && (
            <TouchableOpacity onPress={() => handleStudentCardPress(item)} style={styles.studentEditButton}>
              <MaterialIcons name="edit" size={22} color={TEXT_COLOR_MEDIUM} />
            </TouchableOpacity>
          )}
          {isDeleteStudentMode && (
            <View style={styles.studentCheckboxOverlay}>
              <MaterialIcons name={isSelectedForDelete ? "check-box" : "check-box-outline-blank"} size={22} color={isSelectedForDelete ? REMOVE_BUTTON_COLOR : TEXT_COLOR_MEDIUM} />
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  // --- Main Component Render ---
  if (currentView === 'studentList' && viewingClass) {
    // STUDENT LIST VIEW
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={effectiveBackPress} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color={PRIMARY_COLOR} />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1} ellipsizeMode="tail">
            {viewingClass.name} - Students ({viewingClass.students.length})
          </Text>
          <View style={styles.headerRightPlaceholder} />
        </View>
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.addButton, isDeleteStudentMode && styles.disabledButton]}
            onPress={() => openStudentModal('add')}
            disabled={isDeleteStudentMode}
          >
            <MaterialIcons name="person-add" size={20} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Add Student</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, isDeleteStudentMode ? styles.confirmDeleteButton : styles.removeButton]}
            onPress={isDeleteStudentMode ? handleDeleteSelectedStudents : toggleDeleteStudentMode}
          >
            <MaterialIcons name={isDeleteStudentMode && selectedStudentsForDeletion.size > 0 ? "delete-sweep" : "group-remove"} size={20} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>{isDeleteStudentMode ? (selectedStudentsForDeletion.size > 0 ? `Delete (${selectedStudentsForDeletion.size})` : 'Cancel') : 'Remove'}</Text>
          </TouchableOpacity>
        </View>
        {viewingClass.students && viewingClass.students.length > 0 ? (
          <FlatList
            data={viewingClass.students}
            renderItem={renderStudentCard}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.studentListContainer}
            extraData={viewingClass}
          />
        ) : (
          <View style={styles.emptyStateContainer}>
            <Text style={styles.emptyStateText}>No students in this class yet.</Text>
            <Text style={styles.emptyStateSubText}>Click 'Add Student' to get started.</Text>
          </View>
        )}
        {/* Student Modal */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={isStudentModalVisible}
          onRequestClose={() => {
            setIsStudentModalVisible(false);
            setCurrentStudentData({ rollNo: '', name: '', gender: '' });
            setEditingStudentId(null);
          }}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>{studentModalMode === 'add' ? 'Add New Student' : 'Edit Student'}</Text>
              <Text style={styles.modalLabel}>Roll No.</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Enter Roll No."
                value={currentStudentData.rollNo}
                onChangeText={text => setCurrentStudentData(s => ({ ...s, rollNo: text }))}
                placeholderTextColor={TEXT_COLOR_LIGHT}
              />
              <Text style={styles.modalLabel}>Student Name</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Enter Full Name"
                value={currentStudentData.name}
                onChangeText={text => setCurrentStudentData(s => ({ ...s, name: text }))}
                placeholderTextColor={TEXT_COLOR_LIGHT}
              />
              <Text style={styles.modalLabel}>Gender (Optional)</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g., Male, Female"
                value={currentStudentData.gender}
                onChangeText={text => setCurrentStudentData(s => ({ ...s, gender: text }))}
                placeholderTextColor={TEXT_COLOR_LIGHT}
              />
              <View style={styles.modalButtonRow}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalCancelButton]}
                  onPress={() => {
                    setIsStudentModalVisible(false);
                    setCurrentStudentData({ rollNo: '', name: '', gender: '' });
                    setEditingStudentId(null);
                  }}
                >
                  <Text style={styles.modalButtonTextSecondary}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalSaveButton]}
                  onPress={handleSaveStudent}
                >
                  <Text style={styles.modalButtonTextPrimary}>{studentModalMode === 'add' ? 'Add Student' : 'Save Changes'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
        {/* Full Student Details Modal */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={isFullDetailsModalVisible}
          onRequestClose={() => {
            setIsFullDetailsModalVisible(false);
            setFullStudentDetails({
              rollNo: '', name: '', gender: '', dob: '', address: '', phone: '', email: '', admissionDate: '', photo: ''
            });
            setCurrentFullDetailsStudentId(null);
          }}
        >
          <View style={styles.modalOverlay}>
            <ScrollView contentContainerStyle={styles.modalScrollContainer}>
              <View style={styles.modalContainer}>
                <Text style={styles.modalTitle}>Student Full Details</Text>
                <Text style={styles.modalLabel}>Roll No.</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Enter Roll No."
                  value={fullStudentDetails.rollNo}
                  onChangeText={text => setFullStudentDetails(s => ({ ...s, rollNo: text }))}
                  placeholderTextColor={TEXT_COLOR_LIGHT}
                />
                <Text style={styles.modalLabel}>Student Name</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Enter Full Name"
                  value={fullStudentDetails.name}
                  onChangeText={text => setFullStudentDetails(s => ({ ...s, name: text }))}
                  placeholderTextColor={TEXT_COLOR_LIGHT}
                />
                <Text style={styles.modalLabel}>Gender</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="e.g., Male, Female"
                  value={fullStudentDetails.gender}
                  onChangeText={text => setFullStudentDetails(s => ({ ...s, gender: text }))}
                  placeholderTextColor={TEXT_COLOR_LIGHT}
                />
                <Text style={styles.modalLabel}>Date of Birth</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="e.g., YYYY-MM-DD"
                  value={fullStudentDetails.dob}
                  onChangeText={text => setFullStudentDetails(s => ({ ...s, dob: text }))}
                  placeholderTextColor={TEXT_COLOR_LIGHT}
                />
                <Text style={styles.modalLabel}>Address</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Enter Address"
                  value={fullStudentDetails.address}
                  onChangeText={text => setFullStudentDetails(s => ({ ...s, address: text }))}
                  placeholderTextColor={TEXT_COLOR_LIGHT}
                  multiline
                />
                <Text style={styles.modalLabel}>Phone Number</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Enter Phone Number"
                  value={fullStudentDetails.phone}
                  onChangeText={text => setFullStudentDetails(s => ({ ...s, phone: text }))}
                  placeholderTextColor={TEXT_COLOR_LIGHT}
                  keyboardType="phone-pad"
                />
                <Text style={styles.modalLabel}>Email</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Enter Email"
                  value={fullStudentDetails.email}
                  onChangeText={text => setFullStudentDetails(s => ({ ...s, email: text }))}
                  placeholderTextColor={TEXT_COLOR_LIGHT}
                  keyboardType="email-address"
                />
                <Text style={styles.modalLabel}>Admission Date</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="e.g., YYYY-MM-DD"
                  value={fullStudentDetails.admissionDate}
                  onChangeText={text => setFullStudentDetails(s => ({ ...s, admissionDate: text }))}
                  placeholderTextColor={TEXT_COLOR_LIGHT}
                />
                <Text style={styles.modalLabel}>Photo URL (Optional)</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Enter Photo URL or Path"
                  value={fullStudentDetails.photo}
                  onChangeText={text => setFullStudentDetails(s => ({ ...s, photo: text }))}
                  placeholderTextColor={TEXT_COLOR_LIGHT}
                />
                <View style={styles.modalButtonRow}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalCancelButton]}
                    onPress={() => {
                      setIsFullDetailsModalVisible(false);
                      setFullStudentDetails({
                        rollNo: '', name: '', gender: '', dob: '', address: '', phone: '', email: '', admissionDate: '', photo: ''
                      });
                      setCurrentFullDetailsStudentId(null);
                    }}
                  >
                    <Text style={styles.modalButtonTextSecondary}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalSaveButton]}
                    onPress={handleSaveFullDetails}
                  >
                    <Text style={styles.modalButtonTextPrimary}>Save Details</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </View>
        </Modal>
      </SafeAreaView>
    );
  }

  // Default: CLASS LIST VIEW
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={effectiveBackPress} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={PRIMARY_COLOR} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Student Profiles (Classes)</Text>
        <View style={styles.headerRightPlaceholder} />
      </View>
      <View style={styles.actionButtonsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.addButton, isDeleteClassMode && styles.disabledButton]}
          onPress={() => openClassModal('add')}
          disabled={isDeleteClassMode}
        >
          <MaterialIcons name="add-business" size={20} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>Add Class</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, isDeleteClassMode ? styles.confirmDeleteButton : styles.removeButton]}
          onPress={isDeleteClassMode ? handleDeleteSelectedClasses : toggleDeleteClassMode}
        >
          <MaterialIcons name={isDeleteClassMode && selectedClassesForDeletion.size > 0 ? "delete-sweep" : "playlist-remove"} size={20} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>{isDeleteClassMode ? (selectedClassesForDeletion.size > 0 ? `Delete (${selectedClassesForDeletion.size})` : 'Cancel') : 'Remove'}</Text>
        </TouchableOpacity>
      </View>
      {classes.length > 0 ? (
        <FlatList
          data={classes}
          renderItem={renderClassCard}
          keyExtractor={(item) => item.id}
          numColumns={NUM_CLASS_COLUMNS}
          contentContainerStyle={styles.classListContainer}
          columnWrapperStyle={styles.row}
          extraData={classes}
        />
      ) : (
        <View style={styles.emptyStateContainer}>
          <Text style={styles.emptyStateText}>No classes created yet.</Text>
          <Text style={styles.emptyStateSubText}>Click 'Add Class' to get started.</Text>
        </View>
      )}
      {/* Class Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isClassModalVisible}
        onRequestClose={() => {
          setIsClassModalVisible(false);
          setCurrentClassName('');
          setEditingClassId(null);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>{classModalMode === 'add' ? 'Add New Class' : 'Edit Class'}</Text>
            <Text style={styles.modalLabel}>Class Name</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g., 10th Grade - Section A"
              value={currentClassName}
              onChangeText={setCurrentClassName}
              placeholderTextColor={TEXT_COLOR_LIGHT}
            />
            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => {
                  setIsClassModalVisible(false);
                  setCurrentClassName('');
                  setEditingClassId(null);
                }}
              >
                <Text style={styles.modalButtonTextSecondary}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalSaveButton]}
                onPress={handleSaveClass}
              >
                <Text style={styles.modalButtonTextPrimary}>{classModalMode === 'add' ? 'Save Class' : 'Save Changes'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: TERTIARY_COLOR },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: SECONDARY_COLOR,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: BORDER_COLOR,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  backButton: { padding: 8 },
  headerTitle: {
    color: PRIMARY_COLOR,
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 5,
  },
  headerRightPlaceholder: { width: 40 },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: CARD_BACKGROUND_COLOR
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4
  },
  addButton: { backgroundColor: ADD_BUTTON_COLOR },
  removeButton: { backgroundColor: REMOVE_BUTTON_COLOR },
  confirmDeleteButton: { backgroundColor: REMOVE_BUTTON_COLOR },
  disabledButton: { backgroundColor: '#cccccc', opacity: 0.6 },
  actionButtonText: { color: '#FFFFFF', marginLeft: 8, fontSize: 15, fontWeight: '600' },
  classListContainer: {
    paddingHorizontal: CLASS_CARD_MARGIN / 2,
    paddingTop: CLASS_CARD_MARGIN,
    paddingBottom: 20,
  },
  row: { justifyContent: 'space-around' },
  classCard: {
    backgroundColor: CARD_BACKGROUND_COLOR,
    borderRadius: 10,
    padding: 15,
    margin: CLASS_CARD_MARGIN / 2,
    width: (windowWidth / NUM_CLASS_COLUMNS) - (CLASS_CARD_MARGIN * 1.75),
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.00,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    position: 'relative',
    minHeight: 140
  },
  editButtonOnCard: {
    position: 'absolute',
    top: 5,
    right: 5,
    padding: 6,
    borderRadius: 15,
    zIndex: 10
  },
  classCardDeleteMode: {},
  classCardSelectedForDelete: {
    borderColor: REMOVE_BUTTON_COLOR,
    borderWidth: 2,
    backgroundColor: '#ffebee'
  },
  checkboxOverlay: {
    position: 'absolute',
    top: 8,
    right: 8
  },
  classCardName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: TEXT_COLOR_DARK,
    marginBottom: 10,
    textAlign: 'center',
    marginTop: 20
  },
  classCardStudentCountArea: {
    backgroundColor: CARD_STUDENT_COUNT_BG,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    alignItems: 'center',
    width: '90%',
    marginTop: 'auto'
  },
  classCardStudentCountNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: CARD_STUDENT_COUNT_TEXT
  },
  classCardStudentCountLabel: {
    fontSize: 12,
    color: CARD_STUDENT_COUNT_TEXT,
    marginTop: 2
  },
  studentListContainer: {
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 70
  },
  studentCard: {
    backgroundColor: STUDENT_CARD_BG,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginVertical: STUDENT_CARD_MARGIN / 2,
    marginHorizontal: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e8e8e8',
    elevation: 1
  },
  studentCardDeleteMode: {},
  studentCardSelectedForDelete: {
    borderColor: REMOVE_BUTTON_COLOR,
    borderWidth: 1.5,
    backgroundColor: '#fff0f0'
  },
  studentInfoContainer: {
    flex: 1,
    marginRight: 10
  },
  studentRollNo: {
    fontSize: 13,
    color: TEXT_COLOR_MEDIUM,
    marginBottom: 3
  },
  studentName: {
    fontSize: 16,
    fontWeight: '600',
    color: TEXT_COLOR_DARK
  },
  studentDetail: {
    fontSize: 13,
    color: TEXT_COLOR_MEDIUM,
    marginTop: 2
  },
  studentCardActions: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  studentCheckboxOverlay: {
    paddingHorizontal: 5
  },
  studentEditButton: {
    padding: 5
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  emptyStateText: {
    fontSize: 18,
    color: TEXT_COLOR_MEDIUM,
    textAlign: 'center',
    marginBottom: 8
  },
  emptyStateSubText: {
    fontSize: 14,
    color: TEXT_COLOR_LIGHT,
    textAlign: 'center'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: MODAL_OVERLAY_COLOR,
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalScrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20
  },
  modalContainer: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: CARD_BACKGROUND_COLOR,
    borderRadius: 12,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: TEXT_COLOR_DARK,
    marginBottom: 20,
    textAlign: 'center'
  },
  modalLabel: {
    fontSize: 15,
    color: TEXT_COLOR_MEDIUM,
    marginBottom: 6,
    marginTop: 10
  },
  modalInput: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: Platform.OS === 'ios' ? 12 : 10,
    fontSize: 16,
    color: TEXT_COLOR_DARK,
    marginBottom: 10
  },
  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 25
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 10
  },
  modalSaveButton: {
    backgroundColor: MODAL_BUTTON_PRIMARY
  },
  modalCancelButton: {
    backgroundColor: MODAL_BUTTON_SECONDARY
  },
  modalButtonTextPrimary: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold'
  },
  modalButtonTextSecondary: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold'
  },
});

export default AdminStudentProfiles;