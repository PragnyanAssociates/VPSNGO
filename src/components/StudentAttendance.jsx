// StudentAttendance.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';

const screenWidth = Dimensions.get('window').width;
const CONTAINER_PADDING = 15;

// Static summary data - in a real app, this would update with month change
const attendanceSummaryData = [
  { id: 'present', label: 'Present', value: '1', color: '#2ECC71', backgroundColor: '#E6F7EA' },
  { id: 'absent', label: 'Absent', value: '1', color: '#E74C3C', backgroundColor: '#FEEBEA' },
  { id: 'late', label: 'Late', value: '1', color: '#F39C12', backgroundColor: '#FFF9E6' },
  { id: 'percentage', label: 'Attendance %', value: '50.0%', color: '#3498DB', backgroundColor: '#EBF5FF' },
];

// Mock data for specific attendance statuses - in a real app, this would come from an API
const MOCK_ATTENDANCE_DATA = {
  // Format: YYYY-MM-DD (Month is 1-indexed for keys, Day is padded)
  '2025-05-02': { status: 'absent', icon: 'times-circle', specialTextColor: '#E74C3C' },
  '2025-05-05': { status: 'present', icon: 'check-circle', specialTextColor: '#2ECC71' },
  '2025-05-10': { status: 'late', icon: 'exclamation-triangle', specialTextColor: '#F39C12' },
  '2025-04-15': { status: 'present', icon: 'check-circle', specialTextColor: '#2ECC71' }, // Example for April
  '2025-06-20': { status: 'late', icon: 'exclamation-triangle', specialTextColor: '#F39C12' }, // Example for June
};

const SummaryCard = ({ label, value, color, backgroundColor }) => {
  return (
    <View style={[styles.summaryCard, { backgroundColor }]}>
      <Text style={[styles.summaryCardLabel, { color: label === 'Attendance %' ? color : '#555' }]}>{label}</Text>
      <Text style={[styles.summaryCardValue, { color }]}>{value}</Text>
    </View>
  );
};

const CalendarDay = ({ day, status, icon, specialTextColor, onPress }) => {
  let cellStyle = [styles.calendarCell];
  let textStyle = [styles.calendarDayText, { color: specialTextColor }];
  let iconName = icon;
  let iconColor = specialTextColor;

  switch (status) {
    case 'present':
      cellStyle.push(styles.presentCell);
      break;
    case 'absent':
      cellStyle.push(styles.absentCell);
      break;
    case 'late':
      cellStyle.push(styles.lateCell);
      break;
    case 'selected':
      cellStyle.push(styles.selectedCell);
      break;
    case 'empty':
      cellStyle.push(styles.emptyCell);
      break;
    default: // normal
      break;
  }

  return (
    <TouchableOpacity style={cellStyle} onPress={onPress} disabled={status === 'empty'}>
      {day && <Text style={textStyle}>{day}</Text>}
      {iconName && status !== 'selected' && (
        <Icon name={iconName} size={18} color={iconColor} style={styles.statusIcon} />
      )}
    </TouchableOpacity>
  );
};

const StudentAttendance = () => {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 4, 1)); // May 2025 (month is 0-indexed)
  const [selectedDay, setSelectedDay] = useState(null); // For highlighting a clicked day, e.g., 27
  const [calendarDays, setCalendarDays] = useState([]);

  const formatMonthYear = (date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const generateCalendarDays = useCallback((dateToDisplay, currentSelectedDay) => {
    const year = dateToDisplay.getFullYear();
    const month = dateToDisplay.getMonth(); // 0-indexed

    const days = [];
    const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 for Sun, 1 for Mon...
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Add empty cells for days before the 1st of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push({ key: `empty-start-${i}`, day: null, status: 'empty' });
    }

    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      let status = 'normal';
      let icon = null;
      let specialTextColor = '#333'; // Default day number color

      // Construct date key for mock data lookup: YYYY-MM-DD
      const dayKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const attendanceInfo = MOCK_ATTENDANCE_DATA[dayKey];

      if (attendanceInfo) {
        status = attendanceInfo.status;
        icon = attendanceInfo.icon;
        specialTextColor = attendanceInfo.specialTextColor;
      }

      if (i === currentSelectedDay) { // If the day is selected
        status = 'selected'; // Override status for visual selection
        specialTextColor = '#007AFF'; // Blue for selected day number
        if (attendanceInfo) icon = attendanceInfo.icon; // Keep icon if it was also an attendance day
      }

      days.push({ key: `day-${year}-${month}-${i}`, day: i, status, icon, specialTextColor, year, month });
    }

    // Ensure 6 weeks of cells (42 total) for consistent calendar height
    const totalCells = 42; // 6 weeks * 7 days
    while (days.length < totalCells) {
      days.push({ key: `empty-end-${days.length}`, day: null, status: 'empty' });
    }
    return days;
  }, []); // No dependencies as it's pure based on inputs


  useEffect(() => {
    // Set an initial selected day for demonstration (e.g., 27th of May 2025 if current)
    if (currentDate.getFullYear() === 2025 && currentDate.getMonth() === 4 && !selectedDay) {
        setSelectedDay(27);
    }
    setCalendarDays(generateCalendarDays(currentDate, selectedDay));
  }, [currentDate, selectedDay, generateCalendarDays]);


  const handlePreviousMonth = () => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
    setSelectedDay(null); // Reset selected day when changing month
  };

  const handleNextMonth = () => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
    setSelectedDay(null); // Reset selected day when changing month
  };

  const handleDatePress = (dayData) => {
    if (dayData && dayData.day) {
      setSelectedDay(dayData.day);
      console.log(`Date pressed: ${dayData.day}/${dayData.month + 1}/${dayData.year}, Status: ${dayData.status}`);
    }
  };

  const currentMonthYearText = formatMonthYear(currentDate);
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContent}>
      <View style={styles.pageContainer}>
        {/* Header */}
        <View style={styles.headerMain}>
          <Icon name="calendar-alt" size={36} color="#3498DB" style={styles.headerIcon} />
          <View>
            <Text style={styles.headerTitle}>Monthly Attendance for Student</Text>
            <Text style={styles.detailsPrompt}>Click on a date to view details.</Text>
          </View>
        </View>
        

        {/* Month Navigator */}
        <View style={styles.monthNavigator}>
          <TouchableOpacity onPress={handlePreviousMonth} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Icon name="chevron-left" size={20} color="#777" />
          </TouchableOpacity>
          <Text style={styles.monthYearText}>{currentMonthYearText}</Text>
          <TouchableOpacity onPress={handleNextMonth} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Icon name="chevron-right" size={20} color="#777" />
          </TouchableOpacity>
        </View>

        {/* Summary Cards */}
        <View style={styles.summaryCardsContainer}>
          {attendanceSummaryData.map(item => (
            <SummaryCard
              key={item.id}
              label={item.label}
              value={item.value}
              color={item.color}
              backgroundColor={item.backgroundColor}
            />
          ))}
        </View>

        {/* Calendar */}
        <View style={styles.calendarContainer}>
          {/* Days of Week */}
          <View style={styles.daysOfWeekContainer}>
            {daysOfWeek.map(day => (
              <Text key={day} style={styles.dayOfWeekText}>{day}</Text>
            ))}
          </View>

          {/* Calendar Grid */}
          <View style={styles.calendarGrid}>
            {calendarDays.map(dayData => (
              <CalendarDay
                key={dayData.key}
                day={dayData.day}
                status={dayData.status}
                icon={dayData.icon}
                specialTextColor={dayData.specialTextColor}
                onPress={() => handleDatePress(dayData)}
              />
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const CELL_MARGIN = 2;
const NUM_COLUMNS = 7;
const CALENDAR_PADDING_HORIZONTAL = 0;
const cellDimension = (screenWidth - (CONTAINER_PADDING * 2) - (CALENDAR_PADDING_HORIZONTAL * 2) - (CELL_MARGIN * NUM_COLUMNS * 2)) / NUM_COLUMNS;


const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#F4F6F8',
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  pageContainer: {
    flex: 1,
    padding: CONTAINER_PADDING,
  },
  // Header
  headerMain: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  headerIcon: {
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  headerSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#34495E',
  },
  detailsPrompt: {
    fontSize: 13,
    color: '#7F8C8D',
    marginBottom: 15,
    marginLeft: 48,
  },
  // Month Navigator
  monthNavigator: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12, // Increased padding for better touch
    marginBottom: 15,
    borderBottomWidth: 1,
    borderTopWidth: 1,
    borderColor: '#E0E0E0'
  },
  monthYearText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#34495E',
  },
  // Summary Cards
  summaryCardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  summaryCard: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
    minHeight: 70,
    justifyContent: 'center',
    elevation: 1, // Subtle shadow for cards
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  summaryCardLabel: {
    fontSize: 12,
    marginBottom: 4,
    textAlign: 'center',
  },
  summaryCardValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  // Calendar
  calendarContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  daysOfWeekContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderColor: '#EEEEEE',
  },
  dayOfWeekText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 13,
    color: '#777',
    fontWeight: '500',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarCell: {
    width: cellDimension,
    height: cellDimension + 15, // Make cells slightly taller for icon
    justifyContent: 'flex-start', // Align day number to top
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: '#E0E0E0',
    margin: CELL_MARGIN,
    borderRadius: 4,
    paddingTop: 5, // Padding for the day number
  },
  calendarDayText: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 3, // Space between number and potential icon
  },
  emptyCell: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
  presentCell: {
    backgroundColor: '#E6F7EA',
  },
  absentCell: {
    backgroundColor: '#FEEBEA',
  },
  lateCell: {
    backgroundColor: '#FFF9E6',
  },
  selectedCell: {
    backgroundColor: '#EBF5FF',
    borderColor: '#007AFF',
    borderWidth: 1.5,
  },
  statusIcon: {
    // position: 'absolute', // Removing absolute positioning for simpler layout
    // bottom: 4,
    // right: 4,
    // marginTop: 2, // If directly below the number
  },
});

export default StudentAttendance;