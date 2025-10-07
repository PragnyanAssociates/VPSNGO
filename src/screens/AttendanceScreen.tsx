import React, { useState, useEffect, useMemo } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/client';

// --- Constants (Shared across views) ---
const PRIMARY_COLOR = '#008080';
const TEXT_COLOR_DARK = '#37474F';
const TEXT_COLOR_MEDIUM = '#566573';
const BORDER_COLOR = '#E0E0E0';
const GREEN = '#43A047';
const RED = '#E53935';
const BLUE = '#1E88E5';
const YELLOW = '#FDD835';
const WHITE = '#FFFFFF';
const ORANGE = '#FB8C00'; // For Mixed Attendance

const CLASS_GROUPS = ['LKG', 'UKG', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'];
const PERIOD_DEFINITIONS = [
  { period: 1, time: '09:00-09:45' }, { period: 2, time: '09:45-10:30' },
  { period: 3, time: '10:30-10:45', isBreak: true }, { period: 4, time: '10:45-11:30' },
  { period: 5, time: '11:30-12:15' }, { period: 6, time: '12:15-01:00', isBreak: true },
  { period: 7, time: '01:00-01:45' }, { period: 8, time: '01:45-02:30' },
];

const SummaryCard = ({ label, value, color }) => (
    <View style={styles.summaryBox}>
        <Text style={[styles.summaryValue, { color }]}>{value}</Text>
        <Text style={styles.summaryLabel}>{label}</Text>
    </View>
);

const capitalize = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : '';

// --- Component for Rendering a Day's Attendance ---
const HistoryDayCard = ({ item }) => {
    const { dayStatus, statusColor } = useMemo(() => {
        const total = item.periods.length;
        if (total === 0) return { dayStatus: 'No Records', statusColor: TEXT_COLOR_MEDIUM };
        const presentCount = item.periods.filter(p => p.status === 'Present').length;

        if (presentCount === total) return { dayStatus: 'Full Day Present', statusColor: GREEN };
        if (presentCount === 0) return { dayStatus: 'Full Day Absent', statusColor: RED };
        return { dayStatus: 'Mixed Attendance', statusColor: ORANGE };
    }, [item.periods]);

    return (
        <View style={styles.historyDayCard}>
            <View style={styles.historyDayHeader}>
                <Text style={styles.historyDate}>{new Date(item.date).toDateString()}</Text>
                <Text style={[styles.historyStatus, { color: statusColor }]}>{dayStatus}</Text>
            </View>
            <View style={styles.periodIndicatorContainer}>
                {item.periods.map(period => (
                    <View key={period.period_number} style={styles.periodDetail}>
                        <Text style={styles.periodSubject}>{period.subject_name}</Text>
                        <View style={[styles.periodIndicator, { backgroundColor: period.status === 'Present' ? GREEN : RED }]}>
                            <Text style={styles.periodIndicatorText}>{`P${period.period_number}`}</Text>
                        </View>
                    </View>
                ))}
            </View>
        </View>
    );
};

// --- Main Router Component ---
const AttendanceScreen = ({ route }) => {
  const { user } = useAuth();
  if (!user) return <View style={styles.loaderContainer}><Text style={styles.noDataText}>User not found.</Text></View>;

  switch (user.role) {
    case 'teacher':
      return route?.params ? <TeacherLiveAttendanceView route={route} teacher={user} /> : <TeacherSummaryView teacher={user} />;
    case 'student':
      return <StudentAttendanceView student={user} />;
    case 'admin':
      return <AdminAttendanceView />;
    default:
      return <View style={styles.loaderContainer}><Text style={styles.noDataText}>No attendance view available for your role.</Text></View>;
  }
};


// --- Generic Student History Component (Used by Student and Admin) ---
const GenericStudentHistoryView = ({ studentId, headerTitle, onBack }) => {
    const [viewMode, setViewMode] = useState('monthly');
    const [data, setData] = useState({ summary: {}, history: [] });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            if (!studentId) return;
            setIsLoading(true);
            try {
                const url = onBack 
                    ? `/attendance/student-history-admin/${studentId}?viewMode=${viewMode}`
                    : `/attendance/my-history/${studentId}?viewMode=${viewMode}`;
                
                const response = await apiClient.get(url);
                setData(response.data);
            } catch (error: any) {
                Alert.alert('Error', error.response?.data?.message || 'Could not load attendance history.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchHistory();
    }, [studentId, viewMode]);

    const percentage = useMemo(() => {
        if (!data.summary?.total_periods) return '0.0';
        return ((data.summary.present_periods / data.summary.total_periods) * 100).toFixed(1);
    }, [data.summary]);

    const groupedHistory = useMemo(() => {
        if (!data.history) return [];
        const groups = data.history.reduce((acc, period) => {
            const date = period.attendance_date.split('T')[0];
            if (!acc[date]) {
                acc[date] = { date, periods: [] };
            }
            acc[date].periods.push(period);
            acc[date].periods.sort((a, b) => a.period_number - b.period_number);
            return acc;
        }, {});
        return Object.values(groups).sort((a, b) => new Date(b.date) - new Date(a.date));
    }, [data.history]);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                {onBack && (
                    <TouchableOpacity onPress={onBack} style={styles.backButton}>
                        <Icon name="arrow-left" size={24} color={TEXT_COLOR_DARK} />
                    </TouchableOpacity>
                )}
                <View style={{flex: 1, alignItems: 'center', paddingRight: onBack ? 30 : 0 }}>
                    <Text style={styles.headerTitle}>{headerTitle}</Text>
                </View>
            </View>

            <View style={styles.toggleContainer}>
                <TouchableOpacity style={[styles.toggleButton, viewMode === 'daily' && styles.toggleButtonActive]} onPress={() => setViewMode('daily')}>
                    <Text style={[styles.toggleButtonText, viewMode === 'daily' && styles.toggleButtonTextActive]}>Daily</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.toggleButton, viewMode === 'monthly' && styles.toggleButtonActive]} onPress={() => setViewMode('monthly')}>
                    <Text style={[styles.toggleButtonText, viewMode === 'monthly' && styles.toggleButtonTextActive]}>Monthly</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.toggleButton, viewMode === 'overall' && styles.toggleButtonActive]} onPress={() => setViewMode('overall')}>
                    <Text style={[styles.toggleButtonText, viewMode === 'overall' && styles.toggleButtonTextActive]}>Overall</Text>
                </TouchableOpacity>
            </View>

            {isLoading ? <ActivityIndicator style={styles.loaderContainer} size="large" color={PRIMARY_COLOR} /> : (
                <>
                    <View style={styles.summaryContainer}>
                        <SummaryCard label="Overall" value={`${percentage}%`} color={BLUE} />
                        <SummaryCard label="Periods Present" value={data.summary.present_periods || 0} color={GREEN} />
                        <SummaryCard label="Periods Absent" value={data.summary.absent_periods || 0} color={RED} />
                    </View>
                    <FlatList
                        data={groupedHistory}
                        keyExtractor={(item) => item.date}
                        renderItem={({ item }) => <HistoryDayCard item={item} />}
                        ListHeaderComponent={<Text style={styles.historyTitle}>Detailed History ({capitalize(viewMode)})</Text>}
                        ListEmptyComponent={<Text style={styles.noDataText}>No records found for this period.</Text>}
                        contentContainerStyle={{ paddingBottom: 20 }}
                    />
                </>
            )}
        </SafeAreaView>
    );
};

// --- Student Attendance View ---
const StudentAttendanceView = ({ student }) => {
    return (
        <GenericStudentHistoryView
            studentId={student.id}
            headerTitle="My Attendance Report"
        />
    );
};

// --- Admin: Student Detail View ---
const AdminStudentDetailView = ({ student, onBack }) => {
    return (
        <GenericStudentHistoryView
            studentId={student.student_id}
            headerTitle={`${student.full_name}'s Report`}
            onBack={onBack}
        />
    );
};

// --- Teacher Attendance Summary View ---
const TeacherSummaryView = ({ teacher }) => {
    const [assignments, setAssignments] = useState([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [summaryData, setSummaryData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [viewMode, setViewMode] = useState('overall');

    useEffect(() => {
        const fetchAssignments = async () => {
            if (!teacher?.id) {
                setIsLoading(false); return;
            }
            try {
                const response = await apiClient.get(`/teacher-assignments/${teacher.id}`);
                const data = response.data;
                setAssignments(data);
                if (data && data.length > 0) {
                    const firstClass = data[0].class_group;
                    const firstSubject = data[0].subject_name;
                    setSelectedClass(firstClass);
                    setSelectedSubject(firstSubject);
                } else {
                    setIsLoading(false);
                }
            } catch (error: any) {
                Alert.alert('Error', error.response?.data?.message || 'Could not fetch assignments.');
                setIsLoading(false);
            }
        };
        fetchAssignments();
    }, [teacher.id]);
    
    useEffect(() => {
      const fetchSummary = async () => {
        if (!teacher?.id || !selectedClass || !selectedSubject) {
            setSummaryData(null);
            return;
        }
        setIsLoading(true);
        try {
            const response = await apiClient.get(`/attendance/teacher-summary?teacherId=${teacher.id}&classGroup=${selectedClass}&subjectName=${selectedSubject}&viewMode=${viewMode}`);
            setSummaryData(response.data);
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Could not retrieve data.');
            setSummaryData(null);
        } finally {
            setIsLoading(false);
        }
      };
      fetchSummary();
    }, [selectedClass, selectedSubject, viewMode]);

    const uniqueClasses = useMemo(() => [...new Set(assignments.map(a => a.class_group))], [assignments]);
    const subjectsForSelectedClass = useMemo(() => assignments.filter(a => a.class_group === selectedClass).map(a => a.subject_name), [assignments, selectedClass]);
    
    const handleClassChange = (newClass) => {
        setSelectedClass(newClass);
        const newSubjects = assignments.filter(a => a.class_group === newClass).map(a => a.subject_name);
        const newSubject = newSubjects.length > 0 ? newSubjects[0] : '';
        setSelectedSubject(newSubject);
    };
    
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.pickerContainer}>
                <View style={styles.pickerWrapper}>
                    <Picker selectedValue={selectedClass} onValueChange={handleClassChange} enabled={uniqueClasses.length > 0}>
                        {uniqueClasses.map(c => <Picker.Item key={c} label={c} value={c} />)}
                    </Picker>
                </View>
                <View style={styles.pickerWrapper}>
                    <Picker selectedValue={selectedSubject} onValueChange={(s) => setSelectedSubject(s)} enabled={subjectsForSelectedClass.length > 0}>
                         {subjectsForSelectedClass.map(s => <Picker.Item key={s} label={s} value={s} />)}
                    </Picker>
                </View>
            </View>

            <View style={styles.toggleContainer}>
                <TouchableOpacity style={[styles.toggleButton, viewMode === 'daily' && styles.toggleButtonActive]} onPress={() => setViewMode('daily')}>
                    <Text style={[styles.toggleButtonText, viewMode === 'daily' && styles.toggleButtonTextActive]}>Daily</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.toggleButton, viewMode === 'monthly' && styles.toggleButtonActive]} onPress={() => setViewMode('monthly')}>
                    <Text style={[styles.toggleButtonText, viewMode === 'monthly' && styles.toggleButtonTextActive]}>Monthly</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.toggleButton, viewMode === 'overall' && styles.toggleButtonActive]} onPress={() => setViewMode('overall')}>
                    <Text style={[styles.toggleButtonText, viewMode === 'overall' && styles.toggleButtonTextActive]}>Overall</Text>
                </TouchableOpacity>
            </View>

            {isLoading ? <ActivityIndicator size="large" color={PRIMARY_COLOR} style={styles.loaderContainer} /> : (
                <FlatList
                    data={summaryData?.studentDetails || []}
                    keyExtractor={(item) => item.student_id.toString()}
                    ListHeaderComponent={() => (
                        <View style={styles.summaryContainer}>
                            <SummaryCard label="Overall %" value={`${(summaryData?.overallSummary?.overall_percentage || 0).toFixed(1)}%`} color={BLUE} />
                            <SummaryCard label="Students Present" value={summaryData?.overallSummary?.students_present || 0} color={GREEN} />
                            <SummaryCard label="Students Absent" value={summaryData?.overallSummary?.students_absent || 0} color={RED} />
                        </View>
                    )}
                    renderItem={({ item }) => {
                        const studentPercentage = item.total_marked_periods > 0 ? (item.present_periods / item.total_marked_periods) * 100 : 0;
                        const percentageColor = studentPercentage >= 75 ? GREEN : studentPercentage >= 50 ? YELLOW : RED;
                        return (
                            <View style={styles.summaryStudentRow}>
                                <View style={{flex: 1}}>
                                    <Text style={styles.studentName}>{item.full_name}</Text>
                                    <Text style={styles.studentDetailText}>Present: {item.present_periods} / {item.total_marked_periods}</Text>
                                </View>
                                <Text style={[styles.percentageText, { color: percentageColor }]}>{studentPercentage.toFixed(0)}%</Text>
                            </View>
                        );
                    }}
                    ListEmptyComponent={
                        <View style={styles.loaderContainer}>
                            <Text style={styles.noDataText}>
                                {assignments.length === 0 ? 'You have no assigned classes.' : `No attendance data for ${capitalize(viewMode)} view.`}
                            </Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
};

// --- Admin Attendance View ---
const AdminAttendanceView = () => {
  const [selectedClass, setSelectedClass] = useState(CLASS_GROUPS[9]); // Default to Class 10
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [summaryData, setSummaryData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState('overall');
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    const fetchSubjects = async () => {
      if (!selectedClass) return;
      setIsLoading(true);
      setSubjects([]);
      setSelectedSubject('');
      setSummaryData(null);
      try {
        const response = await apiClient.get(`/subjects/${selectedClass}`);
        const data = response.data;
        setSubjects(data);
        if (data.length > 0) {
          setSelectedSubject(data[0]);
        } else {
          setIsLoading(false);
        }
      } catch (error: any) {
        Alert.alert('Error', 'Failed to fetch subjects.');
        setIsLoading(false);
      }
    };
    fetchSubjects();
  }, [selectedClass]);

  useEffect(() => {
    const fetchSummary = async () => {
      if (!selectedClass || !selectedSubject) {
        setSummaryData(null);
        return;
      }
      setIsLoading(true);
      try {
        const response = await apiClient.get(`/attendance/admin-summary?classGroup=${selectedClass}&subjectName=${selectedSubject}&viewMode=${viewMode}`);
        setSummaryData(response.data);
      } catch (error: any) {
        Alert.alert('Error', 'Could not fetch summary.');
        setSummaryData(null);
      } finally {
        setIsLoading(false);
      }
    };
    if(selectedSubject){
        fetchSummary();
    }
  }, [selectedSubject, viewMode]);

  if (selectedStudent) {
    return <AdminStudentDetailView student={selectedStudent} onBack={() => setSelectedStudent(null)} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.pickerContainer}>
        <View style={styles.pickerWrapper}>
          <Picker selectedValue={selectedClass} onValueChange={(itemValue) => setSelectedClass(itemValue)}>
            {CLASS_GROUPS.map(c => <Picker.Item key={c} label={c} value={c} />)}
          </Picker>
        </View>
        <View style={styles.pickerWrapper}>
          <Picker selectedValue={selectedSubject} onValueChange={(itemValue) => setSelectedSubject(itemValue)} enabled={subjects.length > 0}>
            {subjects.length > 0 ?
              subjects.map(s => <Picker.Item key={s} label={s} value={s} />) :
              <Picker.Item label="No subjects..." value="" />
            }
          </Picker>
        </View>
      </View>
      <View style={styles.toggleContainer}>
          <TouchableOpacity style={[styles.toggleButton, viewMode === 'daily' && styles.toggleButtonActive]} onPress={() => setViewMode('daily')}>
              <Text style={[styles.toggleButtonText, viewMode === 'daily' && styles.toggleButtonTextActive]}>Daily</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.toggleButton, viewMode === 'monthly' && styles.toggleButtonActive]} onPress={() => setViewMode('monthly')}>
              <Text style={[styles.toggleButtonText, viewMode === 'monthly' && styles.toggleButtonTextActive]}>Monthly</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.toggleButton, viewMode === 'overall' && styles.toggleButtonActive]} onPress={() => setViewMode('overall')}>
              <Text style={[styles.toggleButtonText, viewMode === 'overall' && styles.toggleButtonTextActive]}>Overall</Text>
          </TouchableOpacity>
      </View>
      {isLoading ? <ActivityIndicator size="large" color={PRIMARY_COLOR} style={styles.loaderContainer} /> : (
        <FlatList
          data={summaryData?.studentDetails || []}
          keyExtractor={(item) => item.student_id.toString()}
          ListHeaderComponent={() => (
            <View style={styles.summaryContainer}>
                <SummaryCard label="Overall %" value={`${(summaryData?.overallSummary?.overall_percentage || 0).toFixed(1)}%`} color={BLUE} />
                <SummaryCard label="Students Present" value={summaryData?.overallSummary?.students_present || 0} color={GREEN} />
                <SummaryCard label="Students Absent" value={summaryData?.overallSummary?.students_absent || 0} color={RED} />
            </View>
          )}
          renderItem={({ item }) => {
            const studentPercentage = item.total_marked_periods > 0 ? (item.present_periods / item.total_marked_periods) * 100 : 0;
            const percentageColor = studentPercentage >= 75 ? GREEN : studentPercentage >= 50 ? YELLOW : RED;
            return (
              <TouchableOpacity onPress={() => setSelectedStudent(item)}>
                <View style={styles.summaryStudentRow}>
                  <View style={{flex: 1}}>
                    <Text style={styles.studentName}>{item.full_name}</Text>
                    <Text style={styles.studentDetailText}>Present: {item.present_periods} / {item.total_marked_periods}</Text>
                  </View>
                  <Text style={[styles.percentageText, { color: percentageColor }]}>{studentPercentage.toFixed(0)}%</Text>
                </View>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <View style={styles.loaderContainer}>
              <Text style={styles.noDataText}>
                {subjects.length === 0 ? `No subjects for ${selectedClass}.` : `No data for this subject in ${capitalize(viewMode)} view.`}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

// --- Teacher Live Attendance View (UNCHANGED) ---
const TeacherLiveAttendanceView = ({ route, teacher }) => {
  const { class_group, subject_name, period_number, date } = route?.params || {};
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const periodInfo = PERIOD_DEFINITIONS.find(p => p.period === period_number);
  const periodTime = periodInfo ? periodInfo.time : `Period ${period_number}`;

  useEffect(() => {
    const fetchAttendanceSheet = async () => {
      if (!class_group || !date || !period_number) {
        Alert.alert('Error', 'Missing parameters.');
        setIsLoading(false);
        return;
      }
      try {
        const response = await apiClient.get(`/attendance/sheet?class_group=${class_group}&date=${date}&period_number=${period_number}`);
        const studentsWithStatus = response.data.map(s => ({ ...s, status: s.status || 'Present' }));
        setStudents(studentsWithStatus);
      } catch (error: any) { Alert.alert('Error', 'Failed to load students.'); } 
      finally { setIsLoading(false); }
    };
    fetchAttendanceSheet();
  }, [class_group, date, period_number]);

  const handleMarkAttendance = (studentId, newStatus) => {
    setStudents(prev => prev.map(s => (s.id === studentId ? { ...s, status: newStatus } : s)));
  };

  const handleSaveAttendance = async () => {
    const attendanceData = students.map(s => ({ student_id: s.id, status: s.status }));
    if (attendanceData.length === 0) return;
    setIsSaving(true);
    try {
      await apiClient.post('/attendance', { class_group, subject_name, period_number, date, teacher_id: teacher.id, attendanceData });
      Alert.alert('Success', 'Attendance saved!');
    } catch (error: any) { Alert.alert('Error', 'Failed to save attendance.'); }
    finally { setIsSaving(false); }
  };

  if (isLoading) return <ActivityIndicator style={styles.loaderContainer} size="large" color={PRIMARY_COLOR} />;

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.header, {alignItems: 'center'}]}>
        <View>
          <Text style={styles.headerTitle}>Mark Attendance</Text>
          <Text style={styles.headerSubtitle}>{`${class_group} - ${subject_name}`}</Text>
          <Text style={styles.headerSubtitleSmall}>{`Period ${period_number} (${periodTime}), ${date}`}</Text>
        </View>
      </View>
      <FlatList
        data={students}
        renderItem={({ item }) => (
            <View style={styles.liveStudentRow}>
                <Icon name="account-circle-outline" size={32} color={TEXT_COLOR_DARK} />
                <Text style={styles.studentName}>{item.full_name}</Text>
                <View style={styles.buttonGroup}>
                    <TouchableOpacity style={[styles.statusButton, item.status === 'Present' && styles.presentButton]} onPress={() => handleMarkAttendance(item.id, 'Present')}><Text style={[styles.statusButtonText, item.status === 'Present' && { color: WHITE }]}>P</Text></TouchableOpacity>
                    <TouchableOpacity style={[styles.statusButton, item.status === 'Absent' && styles.absentButton]} onPress={() => handleMarkAttendance(item.id, 'Absent')}><Text style={[styles.statusButtonText, item.status === 'Absent' && { color: WHITE }]}>A</Text></TouchableOpacity>
                </View>
            </View>
        )}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={{ padding: 10 }}
      />
      <TouchableOpacity style={styles.saveButton} onPress={handleSaveAttendance} disabled={isSaving}>
        {isSaving ? <ActivityIndicator color={WHITE} /> : <Text style={styles.saveButtonText}>SUBMIT ATTENDANCE</Text>}
      </TouchableOpacity>
    </SafeAreaView>
  );
};

// --- Styles ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6F8' },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  noDataText: { textAlign: 'center', marginTop: 20, color: TEXT_COLOR_MEDIUM, fontSize: 16 },
  header: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, paddingHorizontal: 20, backgroundColor: WHITE, borderBottomWidth: 1, borderBottomColor: BORDER_COLOR },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: TEXT_COLOR_DARK, textAlign: 'center' },
  headerSubtitle: { fontSize: 16, color: TEXT_COLOR_MEDIUM, marginTop: 4, textAlign: 'center' },
  headerSubtitleSmall: { fontSize: 14, color: TEXT_COLOR_MEDIUM, marginTop: 2, textAlign: 'center' },
  backButton: { position: 'absolute', left: 15, zIndex: 1, padding: 5 },
  pickerContainer: { flexDirection: 'row', padding: 10, backgroundColor: WHITE, borderBottomColor: BORDER_COLOR, borderBottomWidth: 1, alignItems: 'center' },
  pickerWrapper: { flex: 1, marginHorizontal: 5, backgroundColor: '#F0F4F8', borderWidth: 1, borderColor: BORDER_COLOR, borderRadius: 8, height: 50, justifyContent: 'center' },
  summaryContainer: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 15, backgroundColor: WHITE, borderBottomWidth: 1, borderBottomColor: BORDER_COLOR },
  summaryBox: { alignItems: 'center', flex: 1, paddingVertical: 10, paddingHorizontal: 5 },
  summaryValue: { fontSize: 26, fontWeight: 'bold' },
  summaryLabel: { fontSize: 14, color: TEXT_COLOR_MEDIUM, marginTop: 5, fontWeight: '500', textAlign: 'center' },
  summaryStudentRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: WHITE, padding: 15, marginHorizontal: 15, marginVertical: 6, borderRadius: 8, elevation: 1, shadowColor: '#999', shadowOpacity: 0.1, shadowRadius: 5, shadowOffset: { width: 0, height: 2 } },
  studentName: { flex: 1, fontSize: 16, color: TEXT_COLOR_DARK, fontWeight: '600' },
  studentDetailText: { fontSize: 12, color: TEXT_COLOR_MEDIUM, marginTop: 2 },
  percentageText: { fontSize: 20, fontWeight: 'bold' },
  liveStudentRow: { flexDirection: 'row', alignItems: 'center', padding: 15, backgroundColor: WHITE, marginHorizontal: 10, marginVertical: 5, borderRadius: 8, elevation: 2, shadowColor: '#999', shadowOpacity: 0.1, shadowRadius: 3 },
  buttonGroup: { flexDirection: 'row' },
  statusButton: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#BDBDBD', marginHorizontal: 5 },
  presentButton: { backgroundColor: GREEN, borderColor: '#388E3C' },
  absentButton: { backgroundColor: RED, borderColor: '#D32F2F' },
  statusButtonText: { fontSize: 16, fontWeight: 'bold', color: '#555' },
  saveButton: { backgroundColor: PRIMARY_COLOR, padding: 15, margin: 10, borderRadius: 8, alignItems: 'center' },
  saveButtonText: { color: WHITE, fontSize: 16, fontWeight: 'bold' },
  toggleContainer: { flexDirection: 'row', justifyContent: 'center', padding: 10, backgroundColor: WHITE, borderBottomWidth: 1, borderBottomColor: BORDER_COLOR },
  toggleButton: { paddingVertical: 8, paddingHorizontal: 20, borderRadius: 20, marginHorizontal: 5, backgroundColor: '#E0E0E0' },
  toggleButtonActive: { backgroundColor: PRIMARY_COLOR },
  toggleButtonText: { color: TEXT_COLOR_DARK, fontWeight: '600' },
  toggleButtonTextActive: { color: WHITE },
  historyTitle: { fontSize: 18, fontWeight: 'bold', paddingHorizontal: 20, marginTop: 15, marginBottom: 10, color: TEXT_COLOR_DARK },
  historyDayCard: { backgroundColor: WHITE, marginHorizontal: 15, marginVertical: 8, borderRadius: 8, elevation: 2, shadowColor: '#999', shadowOpacity: 0.1, shadowRadius: 5 },
  historyDayHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderBottomColor: BORDER_COLOR },
  historyDate: { fontSize: 16, fontWeight: '600', color: TEXT_COLOR_DARK },
  historyStatus: { fontSize: 14, fontWeight: 'bold' },
  periodIndicatorContainer: { flexDirection: 'row', flexWrap: 'wrap', padding: 10 },
  periodDetail: { alignItems: 'center', margin: 5, minWidth: 70},
  periodSubject: { fontSize: 10, color: TEXT_COLOR_MEDIUM, marginBottom: 4 },
  periodIndicator: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center'},
  periodIndicatorText: { color: WHITE, fontSize: 12, fontWeight: 'bold' },
});

export default AttendanceScreen;