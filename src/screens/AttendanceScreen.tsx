// 📂 File: src/screens/AttendanceScreen.tsx (MODIFIED & CORRECTED)

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
// ★★★ 1. IMPORT apiClient AND REMOVE API_BASE_URL ★★★
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

// --- Student Attendance View ---
const StudentAttendanceView = ({ student }) => {
  const [viewMode, setViewMode] = useState('daily');
  const [data, setData] = useState({ summary: {}, history: [] });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!student?.id) return;
      setIsLoading(true);
      try {
        // ★★★ 2. USE apiClient TO FETCH HISTORY ★★★
        const response = await apiClient.get(`/attendance/my-history/${student.id}?viewMode=${viewMode}`);
        
        const jsonData = response.data;
        const historyWithPeriod = jsonData.history.map(item => ({
          ...item,
          period_time: PERIOD_DEFINITIONS.find(p => p.period === item.period_number)?.time || `Period ${item.period_number}`
        }));
        
        setData({ ...jsonData, history: historyWithPeriod });

      } catch (error: any) {
        Alert.alert('Error', error.response?.data?.message || 'Could not load your attendance history.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, [student.id, viewMode]);

  const percentage = useMemo(() => {
    if (!data.summary?.total_days) return '0.0';
    return ((data.summary.present_days / data.summary.total_days) * 100).toFixed(1);
  }, [data.summary]);

  const renderHistoryItem = ({ item }) => (
    <View style={styles.historyRow}>
      <Icon name={item.status === 'Present' ? 'check-circle' : 'close-circle'} size={24} color={item.status === 'Present' ? GREEN : RED} style={{ marginRight: 15 }}/>
      <View style={{ flex: 1 }}>
        <Text style={styles.historySubject}>{item.subject_name}</Text>
        <Text style={styles.historyDate}>{new Date(item.attendance_date).toDateString()} (Period {item.period_number})</Text>
      </View>
      <Text style={[styles.historyStatus, { color: item.status === 'Present' ? GREEN : RED }]}>{item.status}</Text>
    </View>
  );

  if (isLoading) return <ActivityIndicator style={styles.loaderContainer} size="large" color={PRIMARY_COLOR} />;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Attendance Report</Text>
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

      <View style={styles.summaryContainer}>
        <SummaryCard label="Overall" value={`${percentage}%`} color={BLUE} />
        <SummaryCard label="Present" value={data.summary.present_days || 0} color={GREEN} />
        <SummaryCard label="Absent" value={data.summary.absent_days || 0} color={RED} />
      </View>

      <FlatList
        data={data.history}
        keyExtractor={(item, index) => `${item.attendance_date}-${item.period_number}-${index}`}
        renderItem={renderHistoryItem}
        ListHeaderComponent={<Text style={styles.historyTitle}>Detailed History ({capitalize(viewMode)})</Text>}
        ListEmptyComponent={<Text style={styles.noDataText}>No records found for this period.</Text>}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </SafeAreaView>
  );
};

// --- Teacher Attendance Summary View ---
const TeacherSummaryView = ({ teacher }) => {
    const [assignments, setAssignments] = useState([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [summaryData, setSummaryData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchSummary = async (classGroup, subjectName) => {
        if (!teacher?.id || !classGroup || !subjectName) {
            setSummaryData(null);
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        try {
            // ★★★ 3. USE apiClient TO FETCH TEACHER SUMMARY ★★★
            const response = await apiClient.get(`/attendance/teacher-summary?teacherId=${teacher.id}&classGroup=${classGroup}&subjectName=${subjectName}`);
            setSummaryData(response.data);
        } catch (error: any) {
            console.error("Fetch Summary Error:", error);
            Alert.alert('Error', error.response?.data?.message || 'Could not retrieve attendance data.');
            setSummaryData(null);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const fetchAssignments = async () => {
            if (!teacher?.id) {
                setIsLoading(false);
                return;
            }
            try {
                // ★★★ 4. USE apiClient TO FETCH ASSIGNMENTS ★★★
                const response = await apiClient.get(`/teacher-assignments/${teacher.id}`);
                const data = response.data;
                setAssignments(data);

                if (data && data.length > 0) {
                    const firstClass = data[0].class_group;
                    const firstSubject = data[0].subject_name;
                    setSelectedClass(firstClass);
                    setSelectedSubject(firstSubject);
                    await fetchSummary(firstClass, firstSubject);
                } else {
                    setIsLoading(false);
                }
            } catch (error: any) {
                console.error("Fetch Assignments Error:", error);
                Alert.alert('Error', error.response?.data?.message || 'Could not fetch your class assignments.');
                setIsLoading(false);
            }
        };
        fetchAssignments();
    }, [teacher.id]);
    
    const uniqueClasses = useMemo(() => [...new Set(assignments.map(a => a.class_group))], [assignments]);
    const subjectsForSelectedClass = useMemo(() => assignments.filter(a => a.class_group === selectedClass).map(a => a.subject_name), [assignments, selectedClass]);
    
    const overallPercentage = useMemo(() => {
        if (!summaryData?.overallSummary?.total_classes) return 0;
        return (summaryData.overallSummary.total_present / summaryData.overallSummary.total_classes) * 100;
    }, [summaryData]);

    const handleClassChange = (newClass) => {
        setSelectedClass(newClass);
        const newSubjects = assignments.filter(a => a.class_group === newClass).map(a => a.subject_name);
        const newSubject = newSubjects.length > 0 ? newSubjects[0] : '';
        setSelectedSubject(newSubject);
        fetchSummary(newClass, newSubject);
    };
    
    const handleSubjectChange = (newSubject) => {
        setSelectedSubject(newSubject);
        fetchSummary(selectedClass, newSubject);
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.pickerContainer}>
                <View style={styles.pickerWrapper}>
                    <Picker selectedValue={selectedClass} onValueChange={handleClassChange} enabled={uniqueClasses.length > 0}>
                        {uniqueClasses.length > 0 ? 
                            uniqueClasses.map(c => <Picker.Item key={c} label={c} value={c} />) :
                            <Picker.Item label="No classes..." value="" enabled={false} />
                        }
                    </Picker>
                </View>
                <View style={styles.pickerWrapper}>
                    <Picker selectedValue={selectedSubject} onValueChange={handleSubjectChange} enabled={subjectsForSelectedClass.length > 0}>
                         {subjectsForSelectedClass.length > 0 ?
                            subjectsForSelectedClass.map(s => <Picker.Item key={s} label={s} value={s} />) :
                            <Picker.Item label="No subjects..." value="" enabled={false} />
                        }
                    </Picker>
                </View>
            </View>

            {isLoading ? <ActivityIndicator size="large" color={PRIMARY_COLOR} style={styles.loaderContainer} /> : (
                <FlatList
                    data={summaryData?.studentDetails || []}
                    keyExtractor={(item) => item.student_id.toString()}
                    ListHeaderComponent={() => (
                        <View style={styles.summaryContainer}>
                            <SummaryCard label="Overall" value={`${overallPercentage.toFixed(1)}%`} color={BLUE} />
                            <SummaryCard label="Present" value={summaryData?.overallSummary.total_present || 0} color={GREEN} />
                            <SummaryCard label="Classes" value={summaryData?.overallSummary.total_classes || 0} color={TEXT_COLOR_MEDIUM} />
                        </View>
                    )}
                    renderItem={({ item }) => {
                        const studentPercentage = item.total_marked_days > 0 ? (item.present_count / item.total_marked_days) * 100 : 0;
                        const percentageColor = studentPercentage >= 75 ? GREEN : studentPercentage >= 50 ? YELLOW : RED;
                        return (
                            <View style={styles.summaryStudentRow}>
                                <View style={{flex: 1}}>
                                    <Text style={styles.studentName}>{item.full_name}</Text>
                                    <Text style={styles.studentDetailText}>Present: {item.present_count} / {item.total_marked_days}</Text>
                                </View>
                                <Text style={[styles.percentageText, { color: percentageColor }]}>{studentPercentage.toFixed(0)}%</Text>
                            </View>
                        );
                    }}
                    ListEmptyComponent={
                        <View style={styles.loaderContainer}>
                            <Text style={styles.noDataText}>
                                {assignments.length === 0 ? 'You have no assigned classes.' : 'No attendance data found for this selection.'}
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
  const [selectedClass, setSelectedClass] = useState(CLASS_GROUPS[0]);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [summaryData, setSummaryData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchSubjects = async () => {
      if (!selectedClass) return;
      setIsLoading(true);
      setSubjects([]);
      setSelectedSubject('');
      setSummaryData(null);
      try {
        // ★★★ 5. USE apiClient TO FETCH SUBJECTS ★★★
        const response = await apiClient.get(`/subjects/${selectedClass}`);
        const data = response.data;
        setSubjects(data);
        if (data.length > 0) {
          setSelectedSubject(data[0]);
        } else {
          setIsLoading(false);
        }
      } catch (error: any) {
        Alert.alert('Error', error.response?.data?.message || 'Failed to fetch subjects for this class.');
        setIsLoading(false);
      }
    };
    fetchSubjects();
  }, [selectedClass]);

  useEffect(() => {
    const fetchSummary = async () => {
      if (!selectedClass || !selectedSubject) {
        setSummaryData(null);
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        // ★★★ 6. USE apiClient TO FETCH ADMIN SUMMARY ★★★
        const response = await apiClient.get(`/attendance/admin-summary?classGroup=${selectedClass}&subjectName=${selectedSubject}`);
        setSummaryData(response.data);
      } catch (error: any) {
        Alert.alert('Error', error.response?.data?.message || 'Could not fetch attendance summary.');
        setSummaryData(null);
      } finally {
        setIsLoading(false);
      }
    };
    if(selectedSubject){
        fetchSummary();
    }
  }, [selectedSubject]);

  const overallPercentage = useMemo(() => {
    if (!summaryData?.overallSummary?.total_classes) return 0;
    return (summaryData.overallSummary.total_present / summaryData.overallSummary.total_classes) * 100;
  }, [summaryData]);

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
      {isLoading ? <ActivityIndicator size="large" color={PRIMARY_COLOR} style={styles.loaderContainer} /> : (
        <FlatList
          data={summaryData?.studentDetails || []}
          keyExtractor={(item) => item.student_id.toString()}
          ListHeaderComponent={() => (
            <View style={styles.summaryContainer}>
              <SummaryCard label="Overall" value={`${overallPercentage.toFixed(1)}%`} color={BLUE} />
              <SummaryCard label="Present" value={summaryData?.overallSummary.total_present || 0} color={GREEN} />
              <SummaryCard label="Classes" value={summaryData?.overallSummary.total_classes || 0} color={TEXT_COLOR_MEDIUM} />
            </View>
          )}
          renderItem={({ item }) => {
            const studentPercentage = item.total_marked_days > 0 ? (item.present_count / item.total_marked_days) * 100 : 0;
            const percentageColor = studentPercentage >= 75 ? GREEN : studentPercentage >= 50 ? YELLOW : RED;
            return (
              <View style={styles.summaryStudentRow}>
                <View style={{flex: 1}}>
                  <Text style={styles.studentName}>{item.full_name}</Text>
                  <Text style={styles.studentDetailText}>Present: {item.present_count} / {item.total_marked_days}</Text>
                </View>
                <Text style={[styles.percentageText, { color: percentageColor }]}>{studentPercentage.toFixed(0)}%</Text>
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.loaderContainer}>
              <Text style={styles.noDataText}>
                {subjects.length === 0 ? `No subjects scheduled for ${selectedClass}.` : 'No attendance data for this subject.'}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

// --- Teacher Live Attendance View ---
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
        Alert.alert('Error', 'Missing required parameters to mark attendance.');
        setIsLoading(false);
        return;
      }
      try {
        // ★★★ 7. USE apiClient TO FETCH ATTENDANCE SHEET ★★★
        const response = await apiClient.get(`/attendance/sheet?class_group=${class_group}&date=${date}&period_number=${period_number}`);
        const data = response.data;
        const studentsWithStatus = data.map(s => ({ ...s, status: s.status || 'Present' }));
        setStudents(studentsWithStatus);
      } catch (error: any) { Alert.alert('Error', error.response?.data?.message || 'Failed to load students.'); } 
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
      // ★★★ 8. USE apiClient TO SAVE ATTENDANCE ★★★
      await apiClient.post('/attendance', {
        class_group,
        subject_name,
        period_number,
        date,
        teacher_id: teacher.id,
        attendanceData,
      });
      Alert.alert('Success', 'Attendance saved successfully!');
    } catch (error: any) { Alert.alert('Error', error.response?.data?.message || 'Failed to save attendance.'); }
    finally { setIsSaving(false); }
  };

  if (isLoading) return <ActivityIndicator style={styles.loaderContainer} size="large" color={PRIMARY_COLOR} />;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mark Attendance</Text>
        <Text style={styles.headerSubtitle}>{`${class_group} - ${subject_name}`}</Text>
        <Text style={styles.headerSubtitleSmall}>{`Period ${period_number} (${periodTime}), ${date}`}</Text>
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
  header: { paddingVertical: 15, paddingHorizontal: 20, backgroundColor: WHITE, borderBottomWidth: 1, borderBottomColor: BORDER_COLOR, alignItems: 'center' },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: TEXT_COLOR_DARK },
  headerSubtitle: { fontSize: 16, color: TEXT_COLOR_MEDIUM, marginTop: 4 },
  headerSubtitleSmall: { fontSize: 14, color: TEXT_COLOR_MEDIUM, marginTop: 2 },
  pickerContainer: { flexDirection: 'row', padding: 10, backgroundColor: WHITE, borderBottomColor: BORDER_COLOR, borderBottomWidth: 1, alignItems: 'center' },
  pickerWrapper: { flex: 1, marginHorizontal: 5, backgroundColor: '#F0F4F8', borderWidth: 1, borderColor: BORDER_COLOR, borderRadius: 8, height: 50, justifyContent: 'center' },
  picker: { height: 50, width: '100%' },
  pickerItem: { fontSize: 16 },
  summaryContainer: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 15, backgroundColor: WHITE, borderBottomWidth: 1, borderBottomColor: BORDER_COLOR },
  summaryBox: { alignItems: 'center', flex: 1, paddingVertical: 10 },
  summaryValue: { fontSize: 26, fontWeight: 'bold' },
  summaryLabel: { fontSize: 14, color: TEXT_COLOR_MEDIUM, marginTop: 5, fontWeight: '500' },
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
  toggleContainer: { flexDirection: 'row', justifyContent: 'center', padding: 10, backgroundColor: WHITE },
  toggleButton: { paddingVertical: 8, paddingHorizontal: 20, borderRadius: 20, marginHorizontal: 5, backgroundColor: '#E0E0E0' },
  toggleButtonActive: { backgroundColor: PRIMARY_COLOR },
  toggleButtonText: { color: TEXT_COLOR_DARK, fontWeight: '600' },
  toggleButtonTextActive: { color: WHITE },
  historyTitle: { fontSize: 18, fontWeight: 'bold', paddingHorizontal: 20, marginTop: 15, marginBottom: 10, color: TEXT_COLOR_DARK },
  historyRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: WHITE, padding: 15, marginHorizontal: 15, marginVertical: 6, borderRadius: 8, elevation: 1, shadowColor: '#999', shadowOpacity: 0.1, shadowRadius: 3 },
  historySubject: { fontSize: 16, fontWeight: '600', color: TEXT_COLOR_DARK },
  historyDate: { fontSize: 12, color: TEXT_COLOR_MEDIUM, marginTop: 2 },
  historyStatus: { fontSize: 16, fontWeight: 'bold' },
});

export default AttendanceScreen;