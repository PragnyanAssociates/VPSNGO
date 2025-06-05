import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  Platform,
  Dimensions,
} from 'react-native';

const scheduleData = [
  {
    time: "01:00 - 01:45",
    Mon: { subject: "Math", class: "8A", room: "B-201" },
    Tue: { subject: "Math", class: "9B", room: "A-102" },
    Wed: { subject: "Math", class: "9B", room: "A-102" },
    Thu: { subject: "Math", class: "10B", room: "A-104" },
    Fri: { subject: "Math", class: "7A", room: "A-105" },
    Sat: { subject: "Math", class: "6A", room: "A-106" },
  },
  {
    time: "01:45 - 02:30",
    Mon: { subject: "Staff Meeting", details: "(Alternate Weeks)" },
    Tue: null,
    Wed: null,
    Thu: null,
    Fri: null,
    Sat: null,
  },
  {
    time: "09:00 - 09:45",
    Mon: { subject: "Math", class: "Class 10A", room: "A-101" },
    Tue: { subject: "Math", class: "Class 9B", room: "A-102" },
    Wed: { subject: "Math", class: "Class 10A", room: "A-101" },
    Thu: { subject: "Math", class: "Class 8A", room: "B-201" },
    Fri: { subject: "Math", class: "Class 9B", room: "A-102" },
    Sat: { subject: "Review", class: "All Staff", room: "Hall" },
  },
  {
    time: "09:45 - 10:30",
    Mon: { subject: "Math", class: "Class 9B", room: "A-102" },
    Tue: { subject: "Math", class: "Class 10A", room: "A-101" },
    Wed: { subject: "Math", class: "Class 8A", room: "B-201" },
    Thu: { subject: "Math", class: "Class 9B", room: "CS Lab" },
    Fri: { subject: "Math", class: "Class 8A", room: "B-201" },
    Sat: { subject: "Lab", class: "Batch A", room: "CS Lab"},
  },
  {
    time: "10:30 - 10:45",
    isSpecialRow: true,
    specialRowType: 'Break',
    Mon: { subject: "Break" },
    Tue: { subject: "Break" },
    Wed: { subject: "Break" },
    Thu: { subject: "Break" },
    Fri: { subject: "Break" },
    Sat: { subject: "Break" },
  },
  {
    time: "10:45 - 11:30",
   Mon: { subject: "Math", class: "Class 10A", room: "A-101" },
    Tue: { subject: "Math", class: "Class 9B", room: "A-102" },
    Wed: { subject: "Math", class: "Class 10A", room: "A-101" },
    Thu: { subject: "Math", class: "Class 8A", room: "B-201" },
    Fri: { subject: "Math", class: "Class 9B", room: "A-102" },
    Sat: { subject: "Review", class: "All Staff", room: "Hall" },
  },
  {
    time: "11:30 - 12:15",
    Mon: { subject: "Math", class: "Class 9B", room: "A-102" },
    Tue: { subject: "Math", class: "Class 10A", room: "A-101" },
    Wed: { subject: "Math", class: "Class 8A", room: "B-201" },
    Thu: { subject: "Math", class: "Class 9B", room: "CS Lab" },
    Fri: { subject: "Math", class: "Class 8A", room: "B-201" },
    Sat: { subject: "Lab", class: "Batch A", room: "CS Lab"},
  },
  {
    time: "12:15 - 01:00",
    isSpecialRow: true,
    specialRowType: 'Lunch',
    Mon: { subject: "Lunch" },
    Tue: { subject: "Lunch" },
    Wed: { subject: "Lunch" },
    Thu: { subject: "Lunch" },
    Fri: { subject: "Lunch" },
    Sat: { subject: "Lunch" },
  },
];

const daysOrder = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]; // Correct: Short day names

const dayHeaders = {
    TIME: { name: "TIME", color: '#FFFDE7', textColor: '#795548' },
    MON: { name: "MON", color: '#FFEBEE', textColor: '#C62828' },
    TUE: { name: "TUE", color: '#FCE4EC', textColor: '#AD1457' },
    WED: { name: "WED", color: '#EDE7F6', textColor: '#4527A0' },
    THU: { name: "THU", color: '#E1F5FE', textColor: '#0277BD' },
    FRI: { name: "FRI", color: '#E8F5E9', textColor: '#2E7D32' },
    SAT: { name: "SAT", color: '#F3E5F5', textColor: '#6A1B9A' },
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IS_SMALL_DEVICE = SCREEN_WIDTH < 380;

const TeacherTB = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerContainer}>
        <View style={styles.titleRow}>
          <Text style={styles.icon}>🗓️</Text>
          <Text style={styles.mainTitle}>Maths Teacher Time Table</Text>
        </View>
        <Text style={styles.subTitle}>Overview of your teaching and other duties.</Text>
      </View>

      <View style={styles.tableContainer}>
        {/* Table Header */}
        <View style={styles.tableHeaderRow}>
          <Text style={[styles.headerCell, styles.timeHeaderCell, { backgroundColor: dayHeaders.TIME.color, color: dayHeaders.TIME.textColor }]}>
            {dayHeaders.TIME.name}
          </Text>
          {daysOrder.map((dayKey) => ( // dayKey will be "Mon", "Tue", etc.
            <Text
              key={dayKey}
              style={[
                styles.headerCell,
                styles.dayHeaderCell,
                // dayKey.toUpperCase() will be "MON", "TUE", etc.
                { backgroundColor: dayHeaders[dayKey.toUpperCase()].color, color: dayHeaders[dayKey.toUpperCase()].textColor },
              ]}>
              {dayHeaders[dayKey.toUpperCase()].name}
            </Text>
          ))}
        </View>

        {/* Table Body */}
        <View style={styles.tableBody}>
          {scheduleData.map((slot, rowIndex) => (
            <View key={rowIndex} style={[styles.tableRow, slot.isSpecialRow && styles.specialRowBackground]}>
              {/* Time Cell */}
              <View style={[styles.cell, styles.timeCell, slot.isSpecialRow && styles.specialRowBackground]}>
                <Text style={[styles.cellText, styles.timeText, slot.isSpecialRow && styles.specialRowText]}>
                  {slot.time}
                  {slot.specialRowType && (
                     <Text style={styles.specialRowTypeLabel}> ({slot.specialRowType})</Text>
                  )}
                </Text>
              </View>
              {/* Day Cells */}
              {daysOrder.map((dayKey) => { // dayKey will be "Mon", "Tue", etc.
                const item = slot[dayKey]; // Accessing data using short day key
                const cellStyle = [styles.cell, styles.dayCell];
                if (item && item.cellColor) {
                  cellStyle.push({ backgroundColor: item.cellColor });
                } else if (slot.isSpecialRow) {
                    cellStyle.push(styles.specialRowBackground);
                }

                return (
                  <View key={dayKey} style={cellStyle}>
                    {item ? (
                      <>
                        <Text style={[styles.cellText, styles.subjectText, slot.isSpecialRow && styles.specialRowText]}>
                          {item.subject}
                        </Text>
                        {item.class && (
                          <Text style={[styles.cellText, styles.detailText, slot.isSpecialRow && styles.specialRowText]}>
                            Class: {item.class}
                          </Text>
                        )}
                        {item.room && (
                          <Text style={[styles.cellText, styles.detailText, slot.isSpecialRow && styles.specialRowText]}>
                            Room: {item.room}
                          </Text>
                        )}
                        {item.details && (
                           <Text style={[styles.cellText, styles.detailText, styles.extraDetailText, slot.isSpecialRow && styles.specialRowText]}>
                            {item.details}
                          </Text>
                        )}
                      </>
                    ) : (
                      <Text style={[styles.cellText, styles.emptyCellText, slot.isSpecialRow && styles.specialRowText]}>-</Text>
                    )}
                  </View>
                );
              })}
            </View>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerContainer: {
    paddingHorizontal: 15,
    paddingTop: Platform.OS === 'android' ? 15 : 10,
    paddingBottom: 10,
    backgroundColor: '#F8F9FA', // Light background for header section
    borderBottomWidth: 1,
    borderBottomColor: '#DEE2E6',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  icon: {
    fontSize: IS_SMALL_DEVICE ? 20 : 24,
    marginRight: 10,
    color: '#4CAF50', // Green icon
  },
  mainTitle: {
    fontSize: IS_SMALL_DEVICE ? 15 : 17,
    fontWeight: 'bold',
    color: '#212529',
    flexShrink: 1, // Allow title to wrap if too long
  },
  subTitle: {
    fontSize: IS_SMALL_DEVICE ? 11 : 13,
    color: '#6C757D',
  },
  tableContainer: {
    flex: 1, // Takes remaining space
    margin: 5, // Small margin around the table
    borderWidth: 1,
    borderColor: '#DEE2E6', // Border around the whole table
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#F1F3F5', // Default header background
    borderBottomWidth: 1,
    borderBottomColor: '#CED4DA',
  },
  headerCell: {
    paddingVertical: 10,
    paddingHorizontal: 3,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: IS_SMALL_DEVICE ? 9 : 11,
    borderRightWidth: 1,
    borderRightColor: '#DEE2E6',
  },
  timeHeaderCell: {
    flex: 2.5, // More space for TIME
  },
  dayHeaderCell: {
    flex: 2, // Equal space for days
  },
  tableBody: {
    flex: 1, // Distribute space among rows
  },
  tableRow: {
    flex: 1, // Each row takes equal part of tableBody height
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  cell: {
    flex: 1,
    padding: IS_SMALL_DEVICE ? 3 : 5,
    borderRightWidth: 1,
    borderRightColor: '#E9ECEF',
    justifyContent: 'center', // Vertically center content
    alignItems: 'center', // Horizontally center content
  },
  timeCell: {
    flex: 2.5, // Corresponds to header
    backgroundColor: '#F8F9FA', // Light gray for time column cells
  },
  dayCell: {
    flex: 2, // Corresponds to header
    backgroundColor: '#FFFFFF', // Default white for day cells
  },
  cellText: {
    textAlign: 'center',
    color: '#495057',
  },
  timeText: {
    fontWeight: '500',
    fontSize: IS_SMALL_DEVICE ? 9 : 10,
    color: '#343A40',
  },
  subjectText: {
    fontWeight: 'bold',
    fontSize: IS_SMALL_DEVICE ? 9 : 11,
    marginBottom: IS_SMALL_DEVICE ? 1 : 2,
    color: '#212529',
  },
  detailText: {
    fontSize: IS_SMALL_DEVICE ? 7 : 9,
    color: '#6C757D',
  },
  extraDetailText: {
    fontStyle: 'italic',
    fontSize: IS_SMALL_DEVICE ? 7 : 9,
  },
  emptyCellText: {
    fontSize: IS_SMALL_DEVICE ? 10 : 12,
    color: '#ADB5BD',
  },
  specialRowBackground: {
    backgroundColor: '#E9ECEF', // Light gray for break/lunch rows
  },
  specialRowText: {
    fontStyle: 'italic',
    color: '#495057', // Slightly darker text for special rows
  },
  specialRowTypeLabel: {
    fontSize: IS_SMALL_DEVICE ? 8 : 9,
    fontStyle: 'italic',
    color: '#6C757D',
  }
});

export default TeacherTB;