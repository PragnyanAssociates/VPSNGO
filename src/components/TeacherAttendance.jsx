// TeacherAttendence.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Dimensions,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Calendar, LocaleConfig } from 'react-native-calendars';

const screenWidth = Dimensions.get('window').width;

// --- Configuration & Constants ---
const COLORS = {
  primary: '#00A79D', // Teal for primary actions
  primaryLight: '#E0F2F1',
  secondary: '#7F8C8D', // Muted grey for secondary actions/text
  secondaryLight: '#F4F6F7',
  background: '#F8F9FA',
  cardBackground: '#FFFFFF',
  textDark: '#2C3E50',
  textLight: '#566573',
  textMuted: '#95A5A6',
  borderColor: '#EAECEE',
  present: '#2ECC71', // Green
  absent: '#E74C3C', // Red
  late: '#F39C12', // Yellow
  white: '#FFFFFF',
  headerIcon: '#3498DB', // Blue for the top icon
};

LocaleConfig.locales['en'] = {
  monthNames: ['January','February','March','April','May','June','July','August','September','October','November','December'],
  monthNamesShort: ['Jan.','Feb.','Mar.','Apr.','May.','Jun.','Jul.','Aug.','Sep.','Oct.','Nov.','Dec.'],
  dayNames: ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
  dayNamesShort: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],
  today: "Today"
};
LocaleConfig.defaultLocale = 'en';

// --- Mock Data ---
const TEACHER_INFO = { id: 'VV860027', role: 'Member' };

const initialClassesData = {
  '2025-05-31': [ // YYYY-MM-DD
    { id: 'c1', name: 'Class 10A', subject: 'Mathematics', period: '09:00 - 09:45', totalStudents: 3, lastMarked: '2024-11-07' },
    { id: 'c2', name: 'Class 9B', subject: 'Mathematics', period: '09:45 - 10:30', totalStudents: 2, lastMarked: '2024-11-07' },
    { id: 'c3', name: 'Class 8A', subject: 'Mathematics', period: '01:00 - 01:45', totalStudents: 2, lastMarked: null }, // Not Marked Yet
  ],
  '2025-06-01': [
    { id: 'c4', name: 'Class 10A', subject: 'Science', period: '10:00 - 10:45', totalStudents: 3, lastMarked: '2024-11-08' },
  ]
};

const studentsByClass = {
  'c1': [{ id: 's101', name: '15. Alex Johnson' }, { id: 's102', name: '16. Maria Garcia' }, { id: 's103', name: '17. David Smith' }],
  'c2': [{ id: 's201', name: '01. Linda Brown' }, { id: 's202', name: '02. Kevin Wilson' }],
  'c3': [{ id: 's301', name: '08. Sarah Miller' }, { id: 's302', name: '09. James Davis' }],
  'c4': [{ id: 's401', name: 'Alex Johnson' }, { id: 's402', name: 'Maria Garcia' }, { id: 's403', name: 'David Smith' }],
};

// Initial attendance records for calendar view demonstration
const initialAttendanceRecords = {
    'c1-2025-05-28': [{ studentId: 's101', status: 'present'}, { studentId: 's102', status: 'absent'}, { studentId: 's103', status: 'late'}],
    'c1-2025-05-29': [{ studentId: 's101', status: 'present'}, { studentId: 's102', status: 'present'}, { studentId: 's103', status: 'present'}],
    'c1-2025-05-30': [{ studentId: 's101', status: 'present'}, { studentId: 's102', status: 'present'}, { studentId: 's103', status: 'absent'}],
};


const formatDate = (date, format = 'dd-mm-yyyy') => {
  if (!date) return '';
  const d = new Date(date);
  const day = (`0${d.getDate()}`).slice(-2);
  const month = (`0${d.getMonth() + 1}`).slice(-2);
  const year = d.getFullYear();
  if (format === 'yyyy-mm-dd') return `${year}-${month}-${day}`;
  if (format === 'verbose') return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  return `${day}-${month}-${year}`;
};

const TeacherAttendance = () => {
  const [currentView, setCurrentView] = useState('classList'); // 'classList', 'markAttendance', 'viewRecords'
  const [selectedDate, setSelectedDate] = useState(new Date('2025-05-31')); // Default to May 31, 2025
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [classesForSelectedDate, setClassesForSelectedDate] = useState([]);

  // For Mark Attendance View
  const [studentAttendanceList, setStudentAttendanceList] = useState([]);

  // For View Records View
  const [calendarMonth, setCalendarMonth] = useState(formatDate(new Date('2025-05-31'), 'yyyy-mm-dd')); // YYYY-MM-DD for calendar
  const [markedDatesForCalendar, setMarkedDatesForCalendar] = useState({});

  // This will store all attendance records: {'classId-YYYY-MM-DD': [{studentId, status}]}
  const [attendanceRecords, setAttendanceRecords] = useState(initialAttendanceRecords);

  useEffect(() => {
    const dateKey = formatDate(selectedDate, 'yyyy-mm-dd');
    setClassesForSelectedDate(initialClassesData[dateKey] || []);
  }, [selectedDate]);

  const handleDateChange = (event, newDate) => {
    setShowDatePicker(false);
    if (newDate) {
      setSelectedDate(newDate);
    }
  };

  const navigateToMarkAttendance = (classItem) => {
    setSelectedClass(classItem);
    const students = studentsByClass[classItem.id] || [];
    // Check if attendance for this class and date already exists
    const recordKey = `${classItem.id}-${formatDate(selectedDate, 'yyyy-mm-dd')}`;
    const existingRecord = attendanceRecords[recordKey];

    if (existingRecord) {
      setStudentAttendanceList(existingRecord.map(rec => ({ ...students.find(s => s.id === rec.studentId), status: rec.status })));
    } else {
      setStudentAttendanceList(students.map(s => ({ ...s, status: 'present' }))); // Default to present
    }
    setCurrentView('markAttendance');
  };

  const navigateToViewRecords = (classItem) => {
    setSelectedClass(classItem);
    setCalendarMonth(formatDate(selectedDate, 'yyyy-mm-dd')); // Start with the selected date's month
    setCurrentView('viewRecords');
  };

  const goBackToClassList = () => {
    setSelectedClass(null);
    setStudentAttendanceList([]);
    setCurrentView('classList');
  };

  const toggleStudentStatus = (studentId, currentStatus) => {
    const statuses = ['present', 'absent', 'late'];
    const currentIndex = statuses.indexOf(currentStatus);
    const nextIndex = (currentIndex + 1) % statuses.length;
    const nextStatus = statuses[nextIndex];

    setStudentAttendanceList(prevList =>
      prevList.map(student =>
        student.id === studentId ? { ...student, status: nextStatus } : student
      )
    );
  };

  const handleSaveAttendance = () => {
    if (!selectedClass || studentAttendanceList.length === 0) return;
    const recordKey = `${selectedClass.id}-${formatDate(selectedDate, 'yyyy-mm-dd')}`;
    const newRecords = studentAttendanceList.map(({ id, status }) => ({ studentId: id, status }));

    setAttendanceRecords(prevRecords => ({
      ...prevRecords,
      [recordKey]: newRecords,
    }));

    // Update lastMarked for the class (visual only for this demo)
    const dateKey = formatDate(selectedDate, 'yyyy-mm-dd');
    const updatedClasses = (initialClassesData[dateKey] || []).map(cls =>
        cls.id === selectedClass.id ? { ...cls, lastMarked: dateKey } : cls
    );
    // This change won't persist if initialClassesData is not state,
    // but for this demo, we'll update the currently displayed list
    setClassesForSelectedDate(prev => prev.map(cls =>
        cls.id === selectedClass.id ? { ...cls, lastMarked: dateKey } : cls
    ));


    Alert.alert('Success', 'Attendance saved successfully!');
    goBackToClassList();
  };

  // --- Calendar Logic ---
  useEffect(() => {
    if (currentView === 'viewRecords' && selectedClass) {
      generateMarkedDates();
    }
  }, [currentView, selectedClass, calendarMonth, attendanceRecords]);

  const generateMarkedDates = () => {
    if (!selectedClass) return;
    const newMarkedDates = {};
    const [year, month] = calendarMonth.split('-').map(Number);

    for (const key in attendanceRecords) {
      if (key.startsWith(`${selectedClass.id}-`)) {
        const dateStr = key.substring(selectedClass.id.length + 1);
        const recordDate = new Date(dateStr);
        if (recordDate.getFullYear() === year && recordDate.getMonth() + 1 === month) {
          const records = attendanceRecords[key];
          let p = 0, a = 0, l = 0;
          records.forEach(rec => {
            if (rec.status === 'present') p++;
            else if (rec.status === 'absent') a++;
            else if (rec.status === 'late') l++;
          });
          newMarkedDates[dateStr] = {
            marked: true,
            customStyles: {
              container: { backgroundColor: p > 0 ? COLORS.primaryLight : COLORS.secondaryLight, borderRadius:4 },
              text: { color: COLORS.textDark, fontWeight: 'bold' },
            },
            summary: { p, a, l },
          };
        }
      }
    }
    // Highlight the initially selected date if it's in the current calendar month
    const formattedSelectedDate = formatDate(selectedDate, 'yyyy-mm-dd');
    if (formattedSelectedDate.startsWith(calendarMonth.substring(0,7))) { // Compare YYYY-MM
        if (!newMarkedDates[formattedSelectedDate]) {
            newMarkedDates[formattedSelectedDate] = {};
        }
        newMarkedDates[formattedSelectedDate] = {
            ...newMarkedDates[formattedSelectedDate],
            selected: true,
            selectedColor: COLORS.primary,
            customStyles: {
                ...newMarkedDates[formattedSelectedDate]?.customStyles,
                container: {
                    ...newMarkedDates[formattedSelectedDate]?.customStyles?.container,
                    borderColor: COLORS.primary,
                    borderWidth: 1.5,
                }
            }
        };
    }
    setMarkedDatesForCalendar(newMarkedDates);
  };

  const CustomDayComponent = ({date, state, marking}) => {
    const summary = marking?.summary;
    let containerStyle = [styles.calendarDayContainer];
    if (marking?.selected) {
        containerStyle.push({borderColor: COLORS.primary, borderWidth: 1.5});
    } else if (marking?.marked) {
        containerStyle.push(marking.customStyles?.container);
    }

    if (state === 'disabled') {
      containerStyle.push({opacity: 0.4});
    }

    return (
      <View style={containerStyle}>
        <Text style={[styles.calendarDayText, state === 'disabled' ? styles.calendarDayTextDisabled : {}, marking?.customStyles?.text]}>
          {date.day}
        </Text>
        {summary && (
          <View style={styles.calendarSummaryContainer}>
            {summary.p > 0 && <Text style={styles.calendarSummaryTextPresent}>P: {summary.p}</Text>}
            {summary.a > 0 && <Text style={styles.calendarSummaryTextAbsent}>A: {summary.a}</Text>}
            {summary.l > 0 && <Text style={styles.calendarSummaryTextLate}>L: {summary.l}</Text>}
          </View>
        )}
      </View>
    );
  };


  // --- Render Functions ---
  const renderClassListItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.classTitle}>{item.name} - {item.subject}</Text>
      <Text style={styles.classDetail}>Period: {item.period} | Total Students: {item.totalStudents}</Text>
      <Text style={styles.classDetail}>Last Marked: {item.lastMarked ? formatDate(new Date(item.lastMarked)) : 'Not Marked Yet'}</Text>
      <View style={styles.buttonRow}>
        <TouchableOpacity style={[styles.actionButton, styles.markButton]} onPress={() => navigateToMarkAttendance(item)}>
          <Icon name="calendar-check-outline" size={16} color={COLORS.white} />
          <Text style={styles.actionButtonText}>Mark Today</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.viewRecordsButton]} onPress={() => navigateToViewRecords(item)}>
          <Icon name="eye-outline" size={16} color={COLORS.secondary} />
          <Text style={[styles.actionButtonText, { color: COLORS.secondary }]}>View Records</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStudentAttendanceItem = ({ item }) => (
    <View style={[styles.card, styles.studentCard]}>
      <Text style={styles.studentName}>{item.name}</Text>
      <View style={styles.statusToggleContainer}>
        <TouchableOpacity onPress={() => toggleStudentStatus(item.id, item.status)} style={styles.statusButton}>
          <Icon name={item.status === 'present' ? "check-circle" : "check-circle-outline"} size={28} color={item.status === 'present' ? COLORS.present : COLORS.textMuted} />
          {item.status === 'present' && <Text style={[styles.statusLabel, {color: COLORS.present}]}>Present</Text>}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => toggleStudentStatus(item.id, item.status)} style={styles.statusButton}>
          <Icon name={item.status === 'absent' ? "close-circle" : "close-circle-outline"} size={28} color={item.status === 'absent' ? COLORS.absent : COLORS.textMuted} />
          {item.status === 'absent' && <Text style={[styles.statusLabel, {color: COLORS.absent}]}>Absent</Text>}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => toggleStudentStatus(item.id, item.status)} style={styles.statusButton}>
          <Icon name={item.status === 'late' ? "clock" : "clock-outline"} size={28} color={item.status === 'late' ? COLORS.late : COLORS.textMuted} />
          {item.status === 'late' && <Text style={[styles.statusLabel, {color: COLORS.late}]}>Late</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );

  // --- Main View Renders ---
  const renderClassListView = () => (
    <View style={styles.viewContainer}>
      <View style={styles.dateSelectionContainer}>
        <Text style={styles.label}>Select Date for Attendance:</Text>
        <TouchableOpacity style={styles.datePickerInput} onPress={() => setShowDatePicker(true)}>
          <Text style={styles.datePickerText}>{formatDate(selectedDate)}</Text>
          <Icon name="calendar-month-outline" size={22} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
      <Text style={styles.teacherInfo}>Teacher: {TEACHER_INFO.id} {TEACHER_INFO.role}</Text>
      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}
      <Text style={styles.listHeader}>Classes for {formatDate(selectedDate, 'verbose')}</Text>
      {classesForSelectedDate.length > 0 ? (
        <FlatList
          data={classesForSelectedDate}
          renderItem={renderClassListItem}
          keyExtractor={item => item.id}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      ) : (
        <Text style={styles.noDataText}>No classes scheduled for this date.</Text>
      )}
    </View>
  );

  const renderMarkAttendanceView = () => (
    <View style={styles.viewContainer}>
      <TouchableOpacity onPress={goBackToClassList} style={styles.backButtonHeader}>
        <Icon name="arrow-left" size={24} color={COLORS.primary} />
        <Text style={styles.backButtonHeaderText}>Back to Class List</Text>
      </TouchableOpacity>
      <Text style={styles.viewTitle}>Mark Attendance for: {selectedClass?.name} - {selectedClass?.subject}</Text>
      <Text style={styles.subHeader}>Date: {formatDate(selectedDate)} | Period: {selectedClass?.period}</Text>
      <FlatList
        data={studentAttendanceList}
        renderItem={renderStudentAttendanceItem}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingBottom: 80 }} // Space for save button
      />
      <View style={styles.fixedBottomButtons}>
        <TouchableOpacity style={[styles.bottomButton, styles.cancelButton]} onPress={goBackToClassList}>
          <Text style={[styles.bottomButtonText, {color: COLORS.secondary}]}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.bottomButton, styles.saveButton]} onPress={handleSaveAttendance}>
          <Icon name="content-save-outline" size={18} color={COLORS.white} />
          <Text style={styles.bottomButtonText}>Save Attendance</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderViewRecordsView = () => (
    <View style={styles.viewContainer}>
      <TouchableOpacity onPress={goBackToClassList} style={styles.backButtonHeader}>
        <Icon name="arrow-left" size={24} color={COLORS.primary} />
        <Text style={styles.backButtonHeaderText}>Back to Class List</Text>
      </TouchableOpacity>
      <Text style={styles.viewTitle}>Attendance Records for: {selectedClass?.name} - {selectedClass?.subject}</Text>
      <Calendar
        current={calendarMonth}
        onMonthChange={(month) => setCalendarMonth(month.dateString)}
        monthFormat={'MMMM yyyy'}
        markingType={'custom'}
        markedDates={markedDatesForCalendar}
        dayComponent={CustomDayComponent}
        theme={{
            backgroundColor: COLORS.background,
            calendarBackground: COLORS.cardBackground,
            textSectionTitleColor: COLORS.textMuted,
            selectedDayBackgroundColor: COLORS.primary,
            selectedDayTextColor: COLORS.white,
            todayTextColor: COLORS.primary,
            dayTextColor: COLORS.textDark,
            textDisabledColor: COLORS.borderColor,
            arrowColor: COLORS.primary,
            monthTextColor: COLORS.primary,
            indicatorColor: COLORS.primary,
            textDayFontWeight: '500',
            textMonthFontWeight: 'bold',
            textDayHeaderFontWeight: '500',
            textDayFontSize: 14,
            textMonthFontSize: 18,
            textDayHeaderFontSize: 13,
            'stylesheet.calendar.header': { // To make month text larger if needed
                week: {
                    marginTop: Platform.OS === 'ios' ? 6 : 2,
                    flexDirection: 'row',
                    justifyContent: 'space-around'
                }
            }
        }}
        style={styles.calendarStyle}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerBar}>
        <Icon name="account-check-outline" size={30} color={COLORS.headerIcon} />
        <View>
          <Text style={styles.mainTitle}>Student Attendance Management</Text>
          <Text style={styles.subTitle}>Mark and review attendance for your classes.</Text>
        </View>
      </View>

      {currentView === 'classList' && renderClassListView()}
      {currentView === 'markAttendance' && renderMarkAttendanceView()}
      {currentView === 'viewRecords' && renderViewRecordsView()}
    </SafeAreaView>
  );
};

// --- Styles ---
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderColor,
  },
  mainTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.textDark, marginLeft: 12 },
  subTitle: { fontSize: 13, color: COLORS.textLight, marginLeft: 12 },
  viewContainer: { flex: 1, paddingHorizontal: 15, paddingTop: 15 },
  label: { fontSize: 14, color: COLORS.textLight, marginBottom: 5 },
  dateSelectionContainer: { marginBottom: 10, padding: 12, backgroundColor: COLORS.cardBackground, borderRadius: 8, borderWidth:1, borderColor: COLORS.borderColor },
  datePickerInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
    borderRadius: 6,
    backgroundColor: COLORS.white,
  },
  datePickerText: { fontSize: 16, color: COLORS.textDark },
  teacherInfo: { fontSize: 13, color: COLORS.textMuted, textAlign: 'right', marginBottom: 15, marginRight:5 },
  listHeader: { fontSize: 16, fontWeight: '600', color: COLORS.textDark, marginBottom: 10, marginTop:5 },
  card: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 8,
    padding: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
  },
  classTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.primary, marginBottom: 5 },
  classDetail: { fontSize: 13, color: COLORS.textLight, marginBottom: 3 },
  buttonRow: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 },
  actionButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, marginLeft: 10 },
  markButton: { backgroundColor: COLORS.primary },
  viewRecordsButton: { backgroundColor: COLORS.secondaryLight, borderWidth:1, borderColor: COLORS.borderColor },
  actionButtonText: { color: COLORS.white, fontSize: 13, fontWeight: '500', marginLeft: 6 },
  noDataText: { textAlign: 'center', marginTop: 30, fontSize: 15, color: COLORS.textMuted },

  // Mark Attendance View
  backButtonHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, paddingVertical: 5 },
  backButtonHeaderText: { fontSize: 16, color: COLORS.primary, marginLeft: 8, fontWeight: '500' },
  viewTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.textDark, marginBottom: 5, textAlign: 'center' },
  subHeader: { fontSize: 14, color: COLORS.textLight, marginBottom: 15, textAlign: 'center' },
  studentCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  studentName: { fontSize: 15, color: COLORS.textDark, flex: 1, fontWeight: '500' },
  statusToggleContainer: { flexDirection: 'row', alignItems: 'center' },
  statusButton: { alignItems: 'center', paddingHorizontal: 8, minWidth: 60 }, // Min width for tap area
  statusLabel: { fontSize: 10, marginTop: 2, fontWeight: '500' },
  fixedBottomButtons: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 15,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderColor,
    elevation: 5,
  },
  bottomButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  cancelButton: { backgroundColor: COLORS.secondaryLight, borderWidth: 1, borderColor: COLORS.borderColor },
  saveButton: { backgroundColor: COLORS.primary },
  bottomButtonText: { color: COLORS.white, fontSize: 15, fontWeight: '600', marginLeft: 8 },

  // View Records View
  calendarStyle: { borderRadius: 8, borderWidth:1, borderColor: COLORS.borderColor, overflow: 'hidden'},
  calendarDayContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: 55, // Adjust height to fit summary
    paddingVertical: 4,
  },
  calendarDayText: { fontSize: 14, fontWeight: '500', color: COLORS.textDark },
  calendarDayTextDisabled: { color: COLORS.textMuted },
  calendarSummaryContainer: { marginTop: 2, alignItems: 'center' },
  calendarSummaryTextPresent: { fontSize: 9, color: COLORS.present, fontWeight:'bold' },
  calendarSummaryTextAbsent: { fontSize: 9, color: COLORS.absent, fontWeight:'bold' },
  calendarSummaryTextLate: { fontSize: 9, color: COLORS.late, fontWeight:'bold' },
});

export default TeacherAttendance;