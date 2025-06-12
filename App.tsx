import 'react-native-gesture-handler';
import React from 'react';
import { enableScreens } from 'react-native-screens';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

// --- System & Auth Imports ---
import { AuthProvider, useAuth } from './src/context/AuthContext';

// --- Screen Imports (Your full list) ---

// Generic Screens
import WelcomePage from './src/components/WelcomePage';
import HomeScreen from './src/screens/HomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import ForgotPasswordScreen from './src/components/ForgotPasswordScreen';
import AboutUs from './src/components/AboutUs';
import AcademicCalendar from './src/components/AcademicCalendar';
import { TransportFeatureNavigator } from './src/components/Transport';
import TimetableScreen from './src/screens/TimetableScreen';   // 👈 Import Timetable
import AttendanceScreen from './src/screens/AttendanceScreen'; // 👈 Import Attendance

// Admin
import AdminDashboard from './src/components/AdminDashboard';
import AdminNotifications from './src/components/AdminNotifications';
import AdminLM from './src/components/AdminLM';
// import AdminStudentProfiles from './src/components/AdminStudentProfiles';
import AdminForgotPasswordScreen from './src/components/AdminForgotPasswordScreen';

// Student
import StudentDashboard from './src/components/StudentDashboard';
import StudentNotifications from './src/components/StudentNotifications';
import StudentHealthScreen from './src/screens/health/StudentHealthScreen';
import StudentHelpdesk from './src/components/StudentHelpdesk';
import StudentSports from './src/components/StudentSports';
import StudentEvents from './src/components/StudentEvents';
import StudentPTM from './src/components/StudentPTM';
import StudentLabs from './src/components/StudentLabs';
import StudentHomework from './src/components/StudentHomework';
import StudentResults from './src/components/StudentResults';
import StudentSchedule from './src/components/StudentSchedule';
import StudentSM from './src/components/StudentSM';
import StudentAttendance from './src/components/StudentAttendance';
import StudentHistory from './src/components/StudentHistory';
import StudentTB from './src/components/StudentTB';
import StudentSyllabus from './src/components/StudentSyllabus';
import StudentExams from './src/components/StudentExams';

// Subjects
import PhysicsSyllabus from './src/components/PhysicsSyllabus';

// Teacher
import TeacherDashboard from './src/components/TeacherDashboard';
import TeacherNotifications from './src/components/TeacherNotifications';
import TeacherTB from './src/components/TeacherTB';
import TeacherCL from './src/components/TeacherCL';
import TeacherEvents from './src/components/TeacherEvents';
import TeacherPTM from './src/components/TeacherPTM';
import TeacherHomework from './src/components/TeacherHomework';
import TeacherSyllabus from './src/components/TeacherSyllabus';
import TeacherAttendance from './src/components/TeacherAttendance';
// import TeacherHealthAdminScreen from './src/components/TeacherHI';
import TeacherResults from './src/components/TeacherResults';
import TeacherHealthAdminScreen from './src/screens/health/TeacherHealthAdminScreen';

// Donor
import DonorDashboard from './src/components/DonorDashboard';
import DonorNotifications from './src/components/DonorNotifications';
import DonorHelp from './src/components/DonorHelp';
import DonorSuggestions from './src/components/DonorSuggestions';
import DonorReceipts from './src/components/DonorReceipts';
import DonorPayments from './src/components/DonorPayments';
import DonorSponsor from './src/components/DonorSponsor';
import DonorSI from './src/components/DonorSI';


enableScreens();
const Stack = createStackNavigator();

// ✅ STACK 1: Screens available when the user is LOGGED OUT
const PublicStack = () => (
  <Stack.Navigator initialRouteName="WelcomePage" screenOptions={{ headerShown: false }}>
    {/* General Public Screens */}
    <Stack.Screen name="WelcomePage" component={WelcomePage} />
    <Stack.Screen name="HomeScreen" component={HomeScreen} />
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="ForgotPasswordScreen" component={ForgotPasswordScreen} />
    <Stack.Screen name="AboutUs" component={AboutUs} />
    <Stack.Screen name="Transport" component={TransportFeatureNavigator} />
    <Stack.Screen name="AcademicCalendar" component={AcademicCalendar} />
    
    {/* Donor Screens are Public */}
    <Stack.Screen name="DonorDashboard" component={DonorDashboard} />
    <Stack.Screen name="DonorNotifications" component={DonorNotifications} />
    <Stack.Screen name="DonorHelp" component={DonorHelp} />
    <Stack.Screen name="DonorSuggestions" component={DonorSuggestions} />
    <Stack.Screen name="DonorReceipts" component={DonorReceipts} />
    <Stack.Screen name="DonorPayments" component={DonorPayments} />
    <Stack.Screen name="DonorSponsor" component={DonorSponsor} />
    <Stack.Screen name="DonorSI" component={DonorSI} />
  </Stack.Navigator>
);

// ✅ STACK 2: Screens available only when the user is LOGGED IN
const AuthenticatedStack = () => {
  const { user } = useAuth();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* Role-based Dashboards are the entry points */}
      {user?.role === 'admin' && <Stack.Screen name="AdminDashboard" component={AdminDashboard} />}
      {user?.role === 'teacher' && <Stack.Screen name="TeacherDashboard" component={TeacherDashboard} />}
      {user?.role === 'student' && <Stack.Screen name="StudentDashboard" component={StudentDashboard} />}

      {/* 
        All other screens that require a user to be logged in are defined here.
        This allows any dashboard to navigate to them.
      */}
      <Stack.Screen name="Profile" component={ProfileScreen} />
       <Stack.Screen name="Timetable" component={TimetableScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Attendance" component={AttendanceScreen} options={{ title: 'Attendance' }} /> 

      {/* Admin Sub-screens */}
      <Stack.Screen name="AdminNotifications" component={AdminNotifications} />
      <Stack.Screen name="AdminLM" component={AdminLM} />
      <Stack.Screen name="AdminForgotPasswordScreen" component={AdminForgotPasswordScreen} />

      {/* Teacher Sub-screens */}
      <Stack.Screen name="TeacherNotifications" component={TeacherNotifications} />
      <Stack.Screen name="TeacherTB" component={TeacherTB} />
      <Stack.Screen name="TeacherCL" component={TeacherCL} />
      <Stack.Screen name="TeacherEvents" component={TeacherEvents} />
      <Stack.Screen name="TeacherPTM" component={TeacherPTM} />
      <Stack.Screen name="TeacherHomework" component={TeacherHomework} />
      <Stack.Screen name="TeacherSyllabus" component={TeacherSyllabus} />
      <Stack.Screen name="TeacherAttendance" component={TeacherAttendance} />
      <Stack.Screen name="TeacherHealthAdminScreen" component={TeacherHealthAdminScreen} />
      <Stack.Screen name="TeacherResults" component={TeacherResults} />

      {/* Student Sub-screens */}
      <Stack.Screen name="StudentNotifications" component={StudentNotifications} />
      <Stack.Screen name="StudentHealthScreen" component={StudentHealthScreen} />
      <Stack.Screen name="StudentHelpdesk" component={StudentHelpdesk} />
      <Stack.Screen name="StudentSports" component={StudentSports} />
      <Stack.Screen name="StudentEvents" component={StudentEvents} />
      <Stack.Screen name="StudentPTM" component={StudentPTM} />
      <Stack.Screen name="StudentLabs" component={StudentLabs} />
      <Stack.Screen name="StudentHomework" component={StudentHomework} />
      <Stack.Screen name="StudentResults" component={StudentResults} />
      <Stack.Screen name="StudentSchedule" component={StudentSchedule} />
      <Stack.Screen name="StudentSM" component={StudentSM} />
      <Stack.Screen name="StudentAttendance" component={StudentAttendance} />
      <Stack.Screen name="StudentHistory" component={StudentHistory} />
      <Stack.Screen name="StudentTB" component={StudentTB} />
      <Stack.Screen name="StudentSyllabus" component={StudentSyllabus} />
      <Stack.Screen name="StudentExams" component={StudentExams} />
      
      {/* Subject Screens */}
      <Stack.Screen name="PhysicsSyllabus" component={PhysicsSyllabus} />
    </Stack.Navigator>
  );
};


// Main router that chooses which stack to show
const AppNavigator = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#008080" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? <AuthenticatedStack /> : <PublicStack />}
    </NavigationContainer>
  );
};

// Main App component
export default function App() {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8ff'
  }
});