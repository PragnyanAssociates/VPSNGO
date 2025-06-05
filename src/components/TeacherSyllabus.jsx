// TeacherSyllabus.jsx
import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ScrollView, // For Units View if needed
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const screenWidth = Dimensions.get('window').width;

// --- Configuration & Constants ---
const COLORS = {
  primaryPurple: '#7B42F6', // A vibrant purple
  lightPurple: '#EDE7F6', // Light background for cards or highlights
  darkText: '#333333',
  lightText: '#555555',
  mutedText: '#777777',
  white: '#FFFFFF',
  background: '#F7F8FC', // Light grey background
  cardBackground: '#FFFFFF',
  borderColor: '#E0E0E0',
  green: '#2ECC71', // For completion
  lightGreen: '#D5F5E3',
  progressBarBackground: '#E0E0E0',
  disabledButton: '#BDBDBD',
};

// --- Mock Data ---
const initialSubjects = [
  { id: 's1', name: 'Biological Science', icon: 'dna' },
  { id: 's2', name: 'English', icon: 'alphabetical-variant' },
  { id: 's3', name: 'Environmental Science', icon: 'leaf' },
  { id: 's4', name: 'Environmental Studies', icon: 'earth' },
  { id: 's5', name: 'General Knowledge', icon: 'brain' },
  { id: 's6', name: 'General Science', icon: 'atom-variant' },
  { id: 's7', name: 'Hindi', icon: 'translate' }, // Placeholder icon
  { id: 's8', name: 'Mathematics', icon: 'calculator-variant' },
  { id: 's9', name: 'Physical Science', icon: 'flask-outline' },
  { id: 's10', name: 'Social Studies', icon: 'account-group-outline' },
  { id: 's11', name: 'Telugu', icon: 'translate' }, // Placeholder icon
];

const classesBySubject = {
  'English': [
    { id: 'c1', name: 'Class LKG', teacher: 'Emily Davison', targetDate: '3/4/2026', initialCompletion: 33 },
    { id: 'c2', name: 'Class UKG', teacher: 'Emily Davison', targetDate: '3/11/2026', initialCompletion: 60 },
    { id: 'c3', name: 'Class 1', teacher: 'Emily Davison', targetDate: '3/20/2026', initialCompletion: 33 },
    { id: 'c4', name: 'Class 2', teacher: 'David Harvey', targetDate: '3/23/2026', initialCompletion: 100 },
    { id: 'c5', name: 'Class 3', teacher: 'Sarah Rowling', targetDate: '3/12/2026', initialCompletion: 100 },
    { id: 'c6', name: 'Class 4', teacher: 'Robert Jones', targetDate: '3/27/2026', initialCompletion: 33 },
    { id: 'c7', name: 'Class 5', teacher: 'Emily Davison', targetDate: '3/21/2026', initialCompletion: 67 },
    { id: 'c8', name: 'Class 6', teacher: 'David Harvey', targetDate: '3/24/2026', initialCompletion: 67 },
    { id: 'c9', name: 'Class 7', teacher: 'Robert Jones', targetDate: '2/28/2026', initialCompletion: 50 },
    { id: 'c10', name: 'Class 8', teacher: 'David Harvey', targetDate: '3/21/2026', initialCompletion: 33 },
    { id: 'c11', name: 'Class 9A', teacher: 'Robert Jones', targetDate: '3/2/2026', initialCompletion: 50 },
    { id: 'c12', name: 'Class 9B', teacher: 'Sarah Rowling', targetDate: '3/21/2026', initialCompletion: 75 },
    { id: 'c13', name: 'Class 10A', teacher: 'David Harvey', targetDate: '3/8/2026', initialCompletion: 67 },
    { id: 'c14', name: 'Class 10B', teacher: 'David Harvey', targetDate: '3/27/2026', initialCompletion: 50 },
  ],
  // Add other subjects' classes here if needed for testing
};

const initialUnitsData = {
  'English-Class LKG': {
    teacher: 'Emily Davison',
    lastUpdated: '8/3/2025',
    targetCompletionDate: '3/4/2026',
    units: [
      { id: 'u1-1', name: 'Unit 1: Introduction', description: 'Basic concepts of English for Class LKG.', pdfName: 'Intro PDF', isComplete: false },
      { id: 'u1-2', name: 'Unit 2: Core Concepts', description: 'Exploring core concepts of English.', pdfName: 'Core Concepts PDF', isComplete: false },
      { id: 'u1-3', name: 'Unit 3: Further Topics', description: 'Further exploration in English for Class LKG.', pdfName: 'Unit 3 PDF', isComplete: true },
    ],
  },
  // Add other class units here e.g. 'English-Class UKG'
};


const TeacherSyllabus = () => {
  const [currentView, setCurrentView] = useState('subjects'); // 'subjects', 'classes', 'units'
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [unitsData, setUnitsData] = useState(initialUnitsData); // To manage unit completion

  // Calculate overall completion for a class based on its units
  const calculateOverallCompletion = (subjectName, className) => {
    const classKey = `${subjectName}-${className}`;
    const classUnitsData = unitsData[classKey];
    if (!classUnitsData || !classUnitsData.units || classUnitsData.units.length === 0) {
      // Try to get initial completion from classesBySubject if no units are defined yet
      const subjectClasses = classesBySubject[subjectName];
      const classInfo = subjectClasses?.find(c => c.name === className);
      return classInfo?.initialCompletion || 0;
    }
    const completedUnits = classUnitsData.units.filter(unit => unit.isComplete).length;
    return Math.round((completedUnits / classUnitsData.units.length) * 100);
  };


  const handleSubjectPress = (subject) => {
    setSelectedSubject(subject);
    setCurrentView('classes');
  };

  const handleClassPress = (classItem) => {
    setSelectedClass(classItem);
    setCurrentView('units');
  };

  const handleUnitToggleComplete = (unitId) => {
    const classKey = `${selectedSubject.name}-${selectedClass.name}`;
    setUnitsData(prevData => {
      const newClassData = { ...prevData[classKey] };
      newClassData.units = newClassData.units.map(unit =>
        unit.id === unitId ? { ...unit, isComplete: !unit.isComplete } : unit
      );
      return { ...prevData, [classKey]: newClassData };
    });
  };

  const goBack = () => {
    if (currentView === 'units') {
      setCurrentView('classes');
      setSelectedClass(null); // Clear selected class
    } else if (currentView === 'classes') {
      setCurrentView('subjects');
      setSelectedSubject(null); // Clear selected subject
    }
  };

  // --- Render Functions for each View ---

  const renderSubjectItem = ({ item }) => (
    <TouchableOpacity style={styles.subjectCard} onPress={() => handleSubjectPress(item)}>
      <Icon name={item.icon || 'book-open-page-variant-outline'} size={36} color={COLORS.primaryPurple} />
      <Text style={styles.subjectName}>{item.name}</Text>
      <Icon name="chevron-right" size={24} color={COLORS.mutedText} style={styles.chevron} />
    </TouchableOpacity>
  );

  const renderSubjectsView = () => (
    <View style={styles.viewContainer}>
      <Text style={styles.viewTitle}>My Subjects</Text>
      <FlatList
        data={initialSubjects}
        renderItem={renderSubjectItem}
        keyExtractor={item => item.id}
        numColumns={2}
        columnWrapperStyle={styles.subjectRow}
        contentContainerStyle={{paddingBottom: 20}}
      />
    </View>
  );

  const renderClassItem = ({ item }) => {
    const completion = calculateOverallCompletion(selectedSubject.name, item.name);
    return (
      <TouchableOpacity style={styles.classCard} onPress={() => handleClassPress(item)}>
        <View style={styles.classHeader}>
          <Text style={styles.className}>{item.name}</Text>
          <Icon name="chevron-right" size={24} color={COLORS.primaryPurple} />
        </View>
        <Text style={styles.classDetailText}>Teacher: {item.teacher}</Text>
        <Text style={styles.classDetailText}>Target Date: {item.targetDate}</Text>
        <View style={styles.progressContainer}>
          <View style={styles.progressBarBackground}>
            <View style={[
                styles.progressBarFill,
                { width: `${completion}%`, backgroundColor: completion === 100 ? COLORS.green : COLORS.primaryPurple }
              ]}
            />
          </View>
          <Text style={styles.progressText}>{completion}%</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderClassesView = () => {
    if (!selectedSubject) return null;
    const classes = classesBySubject[selectedSubject.name] || [];
    return (
      <View style={styles.viewContainer}>
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color={COLORS.primaryPurple} />
          <Text style={styles.backButtonText}>Back to Subjects</Text>
        </TouchableOpacity>
        <Text style={styles.viewTitle}>Syllabus Status for {selectedSubject.name}</Text>
        <FlatList
          data={classes}
          renderItem={renderClassItem}
          keyExtractor={item => item.id}
          contentContainerStyle={{paddingBottom: 20}}
        />
      </View>
    );
  };

  const renderUnitItem = ({ item }) => (
    <View style={styles.unitCard}>
      <View style={styles.unitHeader}>
        <Text style={styles.unitName}>{item.name}</Text>
        <TouchableOpacity
          style={[styles.markButton, item.isComplete ? styles.markIncompleteButton : styles.markCompleteButton]}
          onPress={() => handleUnitToggleComplete(item.id)}
        >
          <Text style={styles.markButtonText}>
            {item.isComplete ? 'Mark Incomplete' : 'Mark Complete'}
          </Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.unitDescription}>{item.description}</Text>
      {item.pdfName && (
        <TouchableOpacity style={styles.pdfLink} onPress={() => alert(`View PDF: ${item.pdfName}`)}>
          <Icon name="file-pdf-box" size={20} color={COLORS.primaryPurple} />
          <Text style={styles.pdfLinkText}>View PDF: {item.pdfName}</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderUnitsView = () => {
    if (!selectedSubject || !selectedClass) return null;
    const classKey = `${selectedSubject.name}-${selectedClass.name}`;
    const classData = unitsData[classKey];

    if (!classData) {
        return (
             <View style={styles.viewContainer}>
                <TouchableOpacity onPress={goBack} style={styles.backButton}>
                    <Icon name="arrow-left" size={24} color={COLORS.primaryPurple} />
                    <Text style={styles.backButtonText}>Back to Classes for {selectedSubject.name}</Text>
                </TouchableOpacity>
                <Text style={styles.viewTitle}>Units for {selectedSubject.name} - {selectedClass.name}</Text>
                <Text style={styles.noDataText}>No units defined for this class yet.</Text>
            </View>
        );
    }

    const overallCompletion = calculateOverallCompletion(selectedSubject.name, selectedClass.name);

    return (
      <ScrollView style={styles.viewContainer} contentContainerStyle={{paddingBottom: 20}}>
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color={COLORS.primaryPurple} />
          <Text style={styles.backButtonText}>Back to Classes for {selectedSubject.name}</Text>
        </TouchableOpacity>
        <Text style={styles.viewTitle}>Units for {selectedSubject.name} - {selectedClass.name}</Text>

        <View style={styles.overallProgressCard}>
          <Text style={styles.overallInfoText}>Teacher: {classData.teacher}</Text>
          <Text style={styles.overallInfoText}>Last Updated: {classData.lastUpdated}</Text>
          <Text style={styles.overallInfoText}>Target Completion: {classData.targetCompletionDate}</Text>
          <View style={styles.progressContainerFullWidth}>
            <View style={styles.progressBarBackground}>
              <View style={[
                  styles.progressBarFill,
                  { width: `${overallCompletion}%`, backgroundColor: overallCompletion === 100 ? COLORS.green : COLORS.primaryPurple }
                ]}
              />
            </View>
            <Text style={styles.progressTextLarge}>{overallCompletion}% Complete</Text>
          </View>
        </View>

        <FlatList
          data={classData.units}
          renderItem={renderUnitItem}
          keyExtractor={item => item.id}
          scrollEnabled={false} // Because parent is ScrollView
        />
      </ScrollView>
    );
  };


  return (
    <SafeAreaView style={styles.safeArea}>
      {currentView === 'subjects' && renderSubjectsView()}
      {currentView === 'classes' && renderClassesView()}
      {currentView === 'units' && renderUnitsView()}
    </SafeAreaView>
  );
};

// --- Styles ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  viewContainer: {
    flex: 1,
    paddingHorizontal: 15,
    paddingTop: Platform.OS === 'android' ? 15 : 10,
  },
  viewTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.darkText,
    marginBottom: 20,
    textAlign: 'center',
  },
  noDataText: {
    textAlign: 'center',
    fontSize: 16,
    color: COLORS.mutedText,
    marginTop: 30,
  },
  // Subjects View
  subjectRow: {
    justifyContent: 'space-between',
  },
  subjectCard: {
    backgroundColor: COLORS.cardBackground,
    width: (screenWidth - 45) / 2, // 15 padding left, 15 right, 15 between = 45
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 3,
  },
  subjectName: {
    fontSize: 14,
    color: COLORS.darkText,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
    minHeight: 35, // For 2 lines of text
  },
  chevron: {
    marginTop: 10,
  },
  // Classes View
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingVertical: 5,
  },
  backButtonText: {
    fontSize: 16,
    color: COLORS.primaryPurple,
    marginLeft: 8,
    fontWeight: '500',
  },
  classCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 3,
  },
  classHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  className: {
    fontSize: 17,
    fontWeight: 'bold',
    color: COLORS.primaryPurple,
    flex: 1,
  },
  classDetailText: {
    fontSize: 13,
    color: COLORS.lightText,
    marginBottom: 3,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  progressContainerFullWidth: { // For Units View overall progress
    alignItems: 'center', // Center the percentage text below
    marginTop: 10,
  },
  progressBarBackground: {
    flex: 1,
    height: 10,
    backgroundColor: COLORS.progressBarBackground,
    borderRadius: 5,
    marginRight: 10, // For class cards
    overflow: 'hidden',
    width: '100%', // For units view overall progress
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 5,
  },
  progressText: {
    fontSize: 13,
    color: COLORS.primaryPurple,
    fontWeight: '600',
  },
  progressTextLarge: { // For Units View
    fontSize: 14,
    color: COLORS.primaryPurple,
    fontWeight: '600',
    marginTop: 5,
  },
  // Units View
  overallProgressCard: {
    backgroundColor: COLORS.lightPurple,
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  overallInfoText: {
    fontSize: 14,
    color: COLORS.darkText,
    marginBottom: 4,
  },
  unitCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  unitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start', // To align button with potentially long unit name
    marginBottom: 8,
  },
  unitName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.darkText,
    flex: 1, // Allow text to take space
    marginRight: 10,
  },
  markButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20, // Pill shape
    minWidth: 120, // Ensure enough width
    alignItems: 'center',
  },
  markCompleteButton: {
    backgroundColor: COLORS.green,
  },
  markIncompleteButton: {
    backgroundColor: COLORS.disabledButton,
  },
  markButtonText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  unitDescription: {
    fontSize: 13,
    color: COLORS.lightText,
    marginBottom: 10,
    lineHeight: 18,
  },
  pdfLink: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    backgroundColor: COLORS.lightPurple,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  pdfLinkText: {
    fontSize: 13,
    color: COLORS.primaryPurple,
    marginLeft: 8,
    fontWeight: '500',
  },
});

export default TeacherSyllabus;