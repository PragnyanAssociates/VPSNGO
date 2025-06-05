// StudentSchedule.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Dimensions,
  TouchableOpacity, // For the back arrow
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5'; // For icons

const { width } = Dimensions.get('window');

const examScheduleData = [
  { type: 'slot', dateDay: 'Wednesday', dateFull: 'January 17', subject: 'Mathematics', time: '7:30 – 9:00 a.m.', block: 'A', isFirstOfDate: true },
  // { type: 'slot', dateDay: 'Wednesday', dateFull: 'January 17', subject: 'Physics', time: '9:30 – 11:00 a.m.', block: 'B', isFirstOfDate: false },
  { type: 'slot', dateDay: 'Thursday', dateFull: 'January 18', subject: 'Chemistry', time: '7:30 – 9:00 a.m.', block: 'C', isFirstOfDate: true },
  // { type: 'slot', dateDay: 'Thursday', dateFull: 'January 18', subject: 'English Literature', time: '9:30 – 11:00 a.m.', block: 'D', isFirstOfDate: false },
  { type: 'slot', dateDay: 'Sunday', dateFull: 'January 21', subject: 'History', time: '7:30 – 9:00 a.m.', block: 'E', isFirstOfDate: true },
  // { type: 'slot', dateDay: 'Sunday', dateFull: 'January 21', subject: 'Geography', time: '9:30 – 11:00 a.m.', block: 'F', isFirstOfDate: false },
  { type: 'slot', dateDay: 'Monday', dateFull: 'January 22', subject: 'Biology', time: '7:30 – 9:00 a.m.', block: 'G', isFirstOfDate: true },
  // { type: 'slot', dateDay: 'Monday', dateFull: 'January 22', subject: 'Art & Design', time: '9:30 – 11:00 a.m.', block: 'H', isFirstOfDate: false },
  { type: 'event', dateDay: 'Tuesday', dateFull: 'January 23', eventName: 'Teacher Work Day', eventNote: '(No school for students)', isFirstOfDate: true },
  { type: 'slot', dateDay: 'Wednesday', dateFull: 'January 24', subject: 'Computer Science', time: '7:30 – 9:00 a.m.', block: 'I', isFirstOfDate: true },
  // { type: 'slot', dateDay: 'Wednesday', dateFull: 'January 24', subject: 'Music Theory', time: '9:30 – 11:00 a.m.', block: 'J', isFirstOfDate: false },
  { type: 'slot', dateDay: 'Thursday', dateFull: 'January 25', subject: 'English Literature', time: '9:30 – 11:00 a.m.', block: 'D', isFirstOfDate: true },
];

// Adjusted column widths based on the new screenshot
const PAGE_PADDING_HORIZONTAL = 10; // Padding for the main content area
const TABLE_EFFECTIVE_WIDTH = width - (PAGE_PADDING_HORIZONTAL * 2); // Width available for table

const dateColWidth = TABLE_EFFECTIVE_WIDTH * 0.25;
const subjectColWidth = TABLE_EFFECTIVE_WIDTH * 0.30;
const timeColWidth = TABLE_EFFECTIVE_WIDTH * 0.28;
const blockColWidth = TABLE_EFFECTIVE_WIDTH * 0.17; // Ensure sum is 1.00

// App Header Component
const AppHeader = ({ title, onBackPress }) => (
  <View style={styles.appHeader}>
    <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
      <Icon name="arrow-left" size={20} color="#FFFFFF" />
    </TouchableOpacity>
    <Text style={styles.appHeaderTitle}>{title}</Text>
    <View style={{width: 40}} /> {/* Spacer to balance title */}
  </View>
);

// Bottom Navigation Bar (Visual Placeholder)
// const BottomNavItem = ({ iconName, label, isActive }) => (
//   <View style={styles.bottomNavItem}>
//     <Icon name={iconName} size={22} color={isActive ? '#00796B' : '#757575'} />
//     <Text style={[styles.bottomNavLabel, isActive && styles.bottomNavLabelActive]}>{label}</Text>
//   </View>
// );

// const BottomNavigationBar = () => (
//   <View style={styles.bottomNavBar}>
//     <BottomNavItem iconName="home" label="Home" />
//     <BottomNavItem iconName="calendar-alt" label="Calendar" isActive={true} />
//     <BottomNavItem iconName="user-circle" label="Profile" />
//   </View>
// );


const StudentSchedule = ({ navigation }) => { // Assuming you might use navigation
  const handleBackPress = () => {
    // navigation.goBack(); // Example if using React Navigation
    console.log("Back pressed");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* <AppHeader title="Exam Schedules" onBackPress={handleBackPress} /> */}
      <ScrollView contentContainerStyle={styles.pageScrollContainer}>
        <View style={styles.contentArea}>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.mainTitle}>10th Class Exam Schedule</Text>
            <Text style={styles.subTitle}>January 2025</Text>
          </View>

          <View style={styles.tableContainer}>
            <View style={styles.tableHeaderRow}>
              <View style={[styles.tableHeaderCell, { width: dateColWidth }]}><Text style={styles.tableHeaderText}>Date</Text></View>
              <View style={[styles.tableHeaderCell, { width: subjectColWidth }]}><Text style={styles.tableHeaderText}>Subject</Text></View>
              <View style={[styles.tableHeaderCell, { width: timeColWidth }]}><Text style={styles.tableHeaderText}>Time</Text></View>
              <View style={[styles.tableHeaderCell, styles.lastHeaderCell, { width: blockColWidth }]}><Text style={styles.tableHeaderText}>Block</Text></View>
            </View>

            {examScheduleData.map((item, index) => {
              const isLastRow = index === examScheduleData.length - 1;
              if (item.type === 'slot') {
                return (
                  <View key={`slot-${index}`} style={[styles.tableRow, isLastRow && styles.lastRow]}>
                    <View style={[styles.tableCell, styles.dateCell, { width: dateColWidth }]}>
                      {item.isFirstOfDate && (<><Text style={styles.dateDayText}>{item.dateDay}</Text><Text style={styles.dateFullText}>{item.dateFull}</Text></>)}
                    </View>
                    <View style={[styles.tableCell, { width: subjectColWidth }]}><Text style={styles.cellText}>{item.subject}</Text></View>
                    <View style={[styles.tableCell, { width: timeColWidth }]}><Text style={styles.cellText}>{item.time}</Text></View>
                    <View style={[styles.tableCell, styles.lastCell, { width: blockColWidth }]}><Text style={[styles.cellText, styles.blockCellText]}>{item.block}</Text></View>
                  </View>
                );
              } else if (item.type === 'event') {
                return (
                  <View key={`event-${index}`} style={[styles.tableRow, isLastRow && styles.lastRow]}>
                    <View style={[styles.tableCell, styles.dateCell, { width: dateColWidth }]}>
                      <Text style={styles.dateDayText}>{item.dateDay}</Text><Text style={styles.dateFullText}>{item.dateFull}</Text>
                    </View>
                    <View style={[styles.tableCell, styles.eventCell, styles.lastCell, { width: subjectColWidth + timeColWidth + blockColWidth }]}>
                      <Text style={styles.eventNameText}>{item.eventName}</Text>
                      <Text style={styles.eventNoteText}>{item.eventNote}</Text>
                    </View>
                  </View>
                );
              }
              return null;
            })}
          </View>
        </View>
      </ScrollView>
      {/* <BottomNavigationBar /> */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#E0F2F1', // Light tealish background for the very edges if safe area has padding
  },
  appHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // Changed for better title centering
    backgroundColor: '#009688', // Teal header
    paddingVertical: 12,
    paddingHorizontal: 15,
    elevation: 4, // Shadow for Android
    shadowColor: '#000', // Shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  backButton: {
    padding: 5, // Make touch target larger
    width: 40, // Ensure consistent width for centering title
    alignItems: 'flex-start',
  },
  appHeaderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  pageScrollContainer: { // For the ScrollView content
    flexGrow: 1, // Important for ScrollView to fill space if content is short
    backgroundColor: '#FFFFFF', // White background for the main scrollable content area
  },
  contentArea: { // Wrapper for content inside ScrollView
    paddingHorizontal: PAGE_PADDING_HORIZONTAL,
    paddingVertical: 15,
  },
  headerTitleContainer: {
    alignItems: 'center',
    marginBottom: 18, // Slightly less margin
  },
  mainTitle: {
    fontSize: 19, // Slightly smaller
    fontWeight: 'bold',
    color: '#212121', // Darker black
  },
  subTitle: {
    fontSize: 15, // Slightly smaller
    color: '#424242', // Darker gray
    marginTop: 3,
  },
  tableContainer: {
    borderWidth: 1,
    borderColor: '#212121', // Black border for table
    marginBottom: 20, // Space before bottom nav if content is short
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#E0E0E0', // Light gray for header
    borderBottomWidth: 1,
    borderBottomColor: '#212121',
  },
  tableHeaderCell: {
    paddingVertical: 8, // Slightly less padding
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#212121',
  },
  lastHeaderCell: {
    borderRightWidth: 0,
  },
  tableHeaderText: {
    fontSize: 13, // Slightly smaller
    fontWeight: 'bold',
    color: '#212121',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#212121',
    backgroundColor: '#FFFFFF', // Ensure rows are white
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  tableCell: {
    paddingVertical: 8,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#212121',
  },
  dateCell: {
    // No specific changes needed, inherits from tableCell
  },
  lastCell: {
    borderRightWidth: 0,
  },
  cellText: {
    fontSize: 12, // Slightly smaller
    color: '#212121',
    textAlign: 'center',
  },
  blockCellText: {
    fontWeight: '500', // Make block letter a bit bolder if needed
  },
  dateDayText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#212121',
    textAlign: 'center',
  },
  dateFullText: {
    fontSize: 12,
    color: '#212121',
    textAlign: 'center',
    marginTop: 2,
  },
  eventCell: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  eventNameText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#212121',
    textAlign: 'center',
  },
  eventNoteText: {
    fontSize: 11, // Slightly smaller
    color: '#424242',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 2,
  },
  // Bottom Navigation Bar Styles
  // bottomNavBar: {
  //   flexDirection: 'row',
  //   justifyContent: 'space-around',
  //   alignItems: 'center',
  //   backgroundColor: '#F5F5F5', // Off-white or very light gray
  //   borderTopWidth: 1,
  //   borderTopColor: '#BDBDBD', // Light border
  //   paddingVertical: 8,
  //   paddingBottom: Platform.OS === 'ios' ? 20 : 8, // Handle iPhone X notch area
  // },
  // bottomNavItem: {
  //   alignItems: 'center',
  // },
  // bottomNavLabel: {
  //   fontSize: 10,
  //   color: '#757575', // Gray for inactive
  //   marginTop: 2,
  // },
  // bottomNavLabelActive: {
  //   color: '#00796B', // Teal for active
  // },
});

export default StudentSchedule;