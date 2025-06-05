// StudentAcademics.jsx
import React from 'react';
import { ScrollView, View, Text, StyleSheet, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5'; // Using FontAwesome5

const screenWidth = Dimensions.get('window').width;
const CONTAINER_PADDING = 16;

// Data for the page
const studentInfo = {
  studentId: '',
  term: 'Fall 2024',
  overallGpa: '3.8',
  maxGpa: '4.0',
  overallAttendance: '95%',
};

const subjectPerformanceData = [
  {
    id: '1',
    subjectName: 'Mathematics',
    grade: 'A',
    teacher: 'Ms. Davison',
    remarks: 'Excellent problem-solving skills.',
    iconColor: '#3498DB', // Blue
  },
  {
    id: '2',
    subjectName: 'Science',
    grade: 'A-',
    teacher: 'Mr. Harvey',
    remarks: 'Active participation in lab work.',
    iconColor: '#2ECC71', // Green
  },
  {
    id: '3',
    subjectName: 'English Literature',
    grade: 'B+',
    teacher: 'Ms. Rowling',
    remarks: 'Good analytical essays.',
    iconColor: '#E67E22', // Orange
  },
  {
    id: '4',
    subjectName: 'History',
    grade: 'A',
    teacher: 'Mr. Jones',
    remarks: 'Shows keen interest in historical events.',
    iconColor: '#9B59B6', // Purple
  },
  {
    id: '5',
    subjectName: 'Physical Education',
    grade: 'A',
    teacher: 'Coach Brian',
    remarks: 'Great teamwork.',
    iconColor: '#F1C40F', // Yellow
  },
  {
    id: '6',
    subjectName: 'Art',
    grade: 'A-',
    teacher: 'Ms. Picasso',
    remarks: 'Creative and original ideas.',
    iconColor: '#E74C3C', // Red
  },
];

const importantDatesData = [
  { id: '1', description: 'Mid-term Exams Begin', date: 'Nov 15, 2024' },
  { id: '2', description: 'Term Project Due', date: 'Dec 10, 2024' },
  { id: '3', description: 'Last Day of Term', date: 'Dec 20, 2024' },
];

// Card width for two-column layout in Subject Performance
const subjectCardGap = 12;
const subjectCardWidth = (screenWidth - (CONTAINER_PADDING * 2) - subjectCardGap) / 2;

const OverallStatCard = ({ iconName, iconColor, title, value, subValue, backgroundColor }) => (
  <View style={[styles.overallStatCard, { backgroundColor }]}>
    <View style={styles.overallStatHeader}>
      <Icon name={iconName} size={18} color={iconColor} style={styles.overallStatIcon} />
      <Text style={[styles.overallStatTitle, { color: iconColor }]}>{title}</Text>
    </View>
    <Text style={styles.overallStatValue}>{value}{subValue && <Text style={styles.overallStatSubValue}>/{subValue}</Text>}</Text>
  </View>
);

const SubjectCard = ({ subjectName, grade, teacher, remarks, iconColor }) => (
  <View style={styles.subjectCard}>
    <View style={styles.subjectCardHeader}>
      <Icon name="check-double" size={18} color={iconColor} style={styles.subjectIcon} />
      <Text style={styles.subjectName}>{subjectName}</Text>
    </View>
    <Text style={styles.subjectDetailText}>Grade: <Text style={styles.subjectDetailValue}>{grade}</Text></Text>
    <Text style={styles.subjectDetailText}>Teacher: <Text style={styles.subjectDetailValue}>{teacher}</Text></Text>
    <Text style={styles.subjectDetailText}>Remarks: <Text style={styles.subjectDetailValue}>{remarks}</Text></Text>
  </View>
);

const AcademicDateItem = ({ description, date }) => (
  <View style={styles.academicDateItem}>
    <Icon name="calendar-alt" size={20} color="#5D6D7E" style={styles.dateIcon} />
    <Text style={styles.academicDateText}>{description}: <Text style={styles.academicDateValue}>{date}</Text></Text>
  </View>
);

const SectionTitle = ({ title }) => (
  <Text style={styles.sectionTitle}>{title}</Text>
);

const StudentHistory = () => {
  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContent}>
      <View style={styles.pageContainer}>
        {/* Header */}
        <View style={styles.mainHeaderContainer}>
          <Icon name="user-graduate" size={36} color="#34495E" style={styles.mainHeaderIcon} />
          <View>
            <Text style={styles.mainHeaderTitle}>Student History for "Student Name"</Text>
            <Text style={styles.termText}>Term: {studentInfo.term}</Text>
            <Text style={styles.studentIdText}>{studentInfo.studentId}</Text>
          </View>
        </View>
        

        {/* Overall Stats */}
        <View style={styles.overallStatsContainer}>
          <OverallStatCard
            iconName="award" // Changed from clipboard-check for better visual
            iconColor="#2980B9" // Darker blue for text
            title="Overall GPA"
            value={studentInfo.overallGpa}
            subValue={studentInfo.maxGpa}
            backgroundColor="#EBF5FF" // Light blue background
          />
          <OverallStatCard
            iconName="percentage"
            iconColor="#27AE60" // Darker green for text
            title="Overall Attendance"
            value={studentInfo.overallAttendance}
            backgroundColor="#E6F7EA" // Light green background
          />
        </View>

        {/* Subject Performance */}
        <SectionTitle title="Subject Performance" />
        <View style={styles.subjectPerformanceGrid}>
          {subjectPerformanceData.map(subject => (
            <SubjectCard
              key={subject.id}
              subjectName={subject.subjectName}
              grade={subject.grade}
              teacher={subject.teacher}
              remarks={subject.remarks}
              iconColor={subject.iconColor}
            />
          ))}
        </View>

        {/* Important Academic Dates */}
        <SectionTitle title="Important Academic Dates" />
        <View style={styles.academicDatesList}>
          {importantDatesData.map(dateItem => (
            <AcademicDateItem
              key={dateItem.id}
              description={dateItem.description}
              date={dateItem.date}
            />
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#F4F6F8', // Light grayish background for the whole page
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  pageContainer: {
    flex: 1,
    padding: CONTAINER_PADDING,
  },
  // Main Header
  mainHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  mainHeaderIcon: {
    marginRight: 15,
  },
  mainHeaderTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50', // Dark slate blue
  },
  studentIdText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#34495E', // Slightly lighter slate blue
  },
  termText: {
    fontSize: 14,
    color: '#7F8C8D', // Cool gray
    marginBottom: 20,
    marginLeft: 0, // Align with text under icon
  },
  // Section Title
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#34495E',
    marginTop: 25,
    marginBottom: 15,
    borderBottomWidth: 1,
    borderColor: '#E0E0E0',
    paddingBottom: 8,
  },
  // Overall Stats Section
  overallStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10, // Reduced margin as section title has margin top
  },
  overallStatCard: {
    flex: 1, // Each card takes roughly half the space
    borderRadius: 10,
    padding: 15,
    alignItems: 'flex-start', // Align content to the start
    marginHorizontal: 5, // Small gap between cards
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  overallStatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  overallStatIcon: {
    marginRight: 8,
  },
  overallStatTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  overallStatValue: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#34495E', // Dark color for the value
  },
  overallStatSubValue: {
    fontSize: 18,
    fontWeight: 'normal',
    color: '#566573', // Slightly lighter for the "/4.0" part
  },
  // Subject Performance Section
  subjectPerformanceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  subjectCard: {
    width: subjectCardWidth,
    backgroundColor: '#FFFFFF', // White background for subject cards
    borderRadius: 8,
    padding: 15,
    marginBottom: subjectCardGap,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  subjectCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  subjectIcon: {
    marginRight: 10,
  },
  subjectName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#34495E',
    flexShrink: 1, // Allow text to shrink and wrap if needed
  },
  subjectDetailText: {
    fontSize: 13,
    color: '#566573', // Medium gray for labels like "Grade:", "Teacher:"
    marginBottom: 4,
    lineHeight: 18,
  },
  subjectDetailValue: {
    fontWeight: '600',
    color: '#4A4A4A', // Darker gray for actual values
  },
  // Important Academic Dates Section
  academicDatesList: {
    // No specific container style needed if items are styled individually
  },
  academicDateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF', // White background for date items for consistency
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  dateIcon: {
    marginRight: 15,
  },
  academicDateText: {
    fontSize: 14,
    color: '#34495E',
    flex: 1, // Allow text to wrap
  },
  academicDateValue: {
    fontWeight: '600',
    color: '#2C3E50',
  },
});

export default StudentHistory;