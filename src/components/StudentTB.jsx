import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';

const { width } = Dimensions.get('window');
const studentId = "S12345"; // Example Student ID
const studentClass = "8A"; // Example Class

// Calculate available width for the table content (screen width - horizontal margins of tableContainer)
const TABLE_HORIZONTAL_MARGIN = 10;
const tableContentWidth = width - (TABLE_HORIZONTAL_MARGIN * 2);

// Dynamic column widths
const timeColumnWidth = Math.floor(tableContentWidth * 0.20); // Approx 20% for Time
const dayColumnWidth = Math.floor((tableContentWidth * 0.80) / 6); // Remaining 80% / 6 days

// Define column headers including TIME and SATURDAY
const tableHeaders = [
  { name: 'TIME', color: '#F8F9FA', textColor: '#343A40', width: timeColumnWidth },
  { name: 'MON', color: '#FFFDE7', textColor: '#5D4037', width: dayColumnWidth },   // Lighter Yellow
  { name: 'TUE', color: '#FCE4EC', textColor: '#880E4F', width: dayColumnWidth },  // Lighter Pink
  { name: 'WED', color: '#FFEBEE', textColor: '#C62828', width: dayColumnWidth }, // Lighter Red
  { name: 'THU', color: '#EDE7F6', textColor: '#4527A0', width: dayColumnWidth }, // Lighter Purple
  { name: 'FRI', color: '#E8EAF6', textColor: '#1A237E', width: dayColumnWidth },   // Lighter Indigo
  { name: 'SAT', color: '#E0F7FA', textColor: '#006064', width: dayColumnWidth },   // Lighter Cyan for Saturday
];

// Schedule Data: Each object is a row (time slot)
// 'periods' array corresponds to Monday-Saturday
const scheduleData = [
  {
    time: '01:00-01:45', // Shortened time format
    periods: [
      { subject: 'Phys', teacher: 'Angela' },
      { subject: 'Music', teacher: 'Beethoven' },
      { subject: 'Comp', teacher: 'Turing' },
      { subject: 'Moral', teacher: 'Virtue' },
      { subject: 'Eng', teacher: 'Rowling' },
      { subject: 'Yoga', teacher: 'Aura' }, // Saturday Placeholder
    ],
  },
  {
    time: '01:45-02:30',
    periods: [
      { subject: 'Art', teacher: 'Picasso' },
      { subject: 'Geo', teacher: 'Terra' },
      { subject: 'Lib', teacher: 'Paige' },
      { subject: 'Club', teacher: 'Various' },
      { subject: 'Eng', teacher: 'Teacher' },
      { subject: 'Hobby', teacher: 'Instructor' }, // Saturday Placeholder
    ],
  },
  {
    time: '09:00-09:45',
    periods: [
      { subject: 'Maths', teacher: 'Davison' },
      { subject: 'Che', teacher: 'Harvey' },
      { subject: 'Eng', teacher: 'Rowling' },
      { subject: 'History', teacher: 'Jones' },
      { subject: 'Maths', teacher: 'Davison' },
      { subject: 'Eng', teacher: 'Supervisor' }, // Saturday Placeholder
    ],
  },
  {
    time: '09:45-10:30',
    periods: [
      { subject: 'Art', teacher: 'Picasso' },
      { subject: 'Geo', teacher: 'Terra' },
      { subject: 'Lib', teacher: 'Paige' },
      { subject: 'Club', teacher: 'Various' },
      { subject: 'Eng', teacher: 'Teacher' },
      { subject: 'Hobby', teacher: 'Instructor' }, // Saturday Placeholder
    ],
  },
  {
    time: '10:30-10:45',
    periods: [
      { subject: 'Break', isBreak: true }, { subject: 'Break', isBreak: true },
      { subject: 'Break', isBreak: true }, { subject: 'Break', isBreak: true },
      { subject: 'Break', isBreak: true }, { subject: 'Break', isBreak: true }, // Saturday Break
    ],
  },
  {
    time: '10:45-11:30',
    periods: [
      { subject: 'Art', teacher: 'Picasso' },
      { subject: 'Geo', teacher: 'Terra' },
      { subject: 'Lib', teacher: 'Paige' },
      { subject: 'Club', teacher: 'Various' },
      { subject: 'Eng', teacher: 'Teacher' },
      { subject: 'Hobby', teacher: 'Instructor' }, // Saturday Placeholder
    ],
  },
  {
    time: '11:30-12:15',
    periods: [
      { subject: 'Phys', teacher: 'Angela' },
      { subject: 'Music', teacher: 'Beethoven' },
      { subject: 'Comp', teacher: 'Turing' },
      { subject: 'Moral', teacher: 'Virtue' },
      { subject: 'Eng', teacher: 'Rowling' },
      { subject: 'Yoga', teacher: 'Aura' }, // Saturday Placeholder
    ],
  },
  {
    time: '12:15-01:00',
    periods: [
      { subject: 'Lunch', isBreak: true }, { subject: 'Lunch', isBreak: true },
      { subject: 'Lunch', isBreak: true }, { subject: 'Lunch', isBreak: true },
      { subject: 'Lunch', isBreak: true }, { subject: 'Lunch', isBreak: true }, // Saturday Lunch
    ],
  },
];


const StudentTB = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.pageContainer}>
        <View style={styles.pageHeaderContainer}>
          <Icon name="calendar-week" size={28} color="#5E35B1" style={styles.pageHeaderIcon} />
          <View style={styles.pageHeaderTextContainer}>
            <Text style={styles.pageMainTitle}>
              Class Schedule - {studentClass}
            </Text>
            <Text style={styles.pageSubTitle}>
              Student ID: {studentId}
            </Text>
          </View>
        </View>

        <View style={styles.tableOuterContainer}>
          {/* Table Header Row */}
          <View style={styles.tableHeaderRow}>
            {tableHeaders.map((header) => (
              <View key={header.name} style={[
                styles.tableHeaderCell,
                { backgroundColor: header.color, width: header.width }
              ]}>
                <Text style={[styles.tableHeaderText, { color: header.textColor }]}>{header.name}</Text>
              </View>
            ))}
          </View>

          {/* Table Data Rows */}
          {scheduleData.map((slot, rowIndex) => (
            <View key={rowIndex} style={styles.tableRow}>
              {/* Time Cell */}
              <View style={[styles.tableCell, styles.timeCell, { width: tableHeaders[0].width }]}>
                <Text style={styles.timeText}>{slot.time}</Text>
              </View>
              {/* Period Cells */}
              {slot.periods.map((period, periodIndex) => (
                <View key={periodIndex} style={[
                  styles.tableCell,
                  period.isBreak ? styles.breakCell : styles.periodCell,
                  { width: tableHeaders[periodIndex + 1].width } // +1 to skip TIME header
                ]}>
                  <Text style={period.isBreak ? styles.breakTextSubject : styles.subjectText} numberOfLines={2}>
                    {period.subject}
                  </Text>
                  {!period.isBreak && period.teacher && (
                    <Text style={styles.teacherText} numberOfLines={1}>{period.teacher}</Text>
                  )}
                </View>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4F6F8', 
  },
  pageContainer: {
    paddingBottom: 30, 
  },
  pageHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    marginBottom: 15,
  },
  pageHeaderIcon: {
    marginRight: 12,
  },
  pageHeaderTextContainer: {
    flex: 1,
  },
  pageMainTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 3,
  },
  pageSubTitle: {
    fontSize: 13,
    color: '#566573',
  },
  tableOuterContainer: { // Renamed from tableContainer
    marginHorizontal: TABLE_HORIZONTAL_MARGIN,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#455A64',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#CFD8DC', // Slightly darker border for header
  },
  tableHeaderCell: {
    paddingVertical: 10,
    paddingHorizontal: 4, // Reduced padding
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#ECEFF1',
  },
  tableHeaderText: {
    fontSize: 10, // Reduced font size
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F4', // Lighter border for data rows
  },
  tableRowEven: { // Example for alternating rows, if desired
    backgroundColor: '#FCFCFC',
  },
  tableCell: {
    paddingVertical: 8, // Reduced padding
    paddingHorizontal: 4, // Reduced padding
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#F1F3F4',
    minHeight: 55, // Adjusted min height
  },
  timeCell: {
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  timeText: {
    fontSize: 10, // Reduced font size
    color: '#495057',
    fontWeight: '500',
    textAlign: 'center',
  },
  periodCell: {
    // backgroundColor: '#FFFFFF', // Default white
  },
  subjectText: {
    fontSize: 11, // Reduced font size
    fontWeight: '600',
    color: '#37474F',
    marginBottom: 2,
    textAlign: 'center', // Center subject
  },
  teacherText: {
    fontSize: 9, // Reduced font size
    color: '#78909C',
    textAlign: 'center', // Center teacher
  },
  breakCell: {
    alignItems: 'center',
    backgroundColor: '#ECEFF1', // Light gray for break cells
  },
  breakTextSubject: {
    fontSize: 11, // Reduced font size
    fontWeight: '500',
    color: '#546E7A',
    textAlign: 'center',
  },
});

export default StudentTB;